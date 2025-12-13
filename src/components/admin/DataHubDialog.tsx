import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database, Upload, ChevronDown, ChevronRight, FolderPlus, Trash2, FolderOpen, Folder, Edit2, File, Tag, CheckSquare, Square, RefreshCw, Eye, EyeOff } from "lucide-react";
import { DropZone } from "./DropZone";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssetEditDialog } from "@/components/admin/AssetEditDialog";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
  bucket_id: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  storage_path: string;
  created_at: string;
  position?: number;
  children?: MediaFolder[];
  files?: StorageFile[];
}

interface DataHubDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectionMode?: boolean;
  onSelect?: (url: string, metadata?: any) => void;
}

export function DataHubDialog({ 
  isOpen: controlledIsOpen, 
  onClose, 
  selectionMode = false, 
  onSelect 
}: DataHubDialogProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledIsOpen !== undefined ? (onClose || (() => {})) : setInternalIsOpen;
  
  // Initialize openFolders from localStorage with Root folder as fallback
  const [openFolders, setOpenFolders] = useState<string[]>(() => {
    const stored = localStorage.getItem("mediaManagement_openFolders");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return ["00000000-0000-0000-0000-000000000001"];
      }
    }
    return ["00000000-0000-0000-0000-000000000001"];
  });
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolderFor, setCreatingFolderFor] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<MediaFolder | null>(null);
  const [deletingFile, setDeletingFile] = useState<{ folder: MediaFolder; fileName: string } | null>(null);
  const [editingAsset, setEditingAsset] = useState<{
    name: string;
    url: string;
    created_at: string;
    metadata: any;
    bucket_id: string;
    segmentIds?: string[];
    filePath: string;
    id: string;
  } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Debounced localStorage write
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedSaveToLocalStorage = useCallback((folders: string[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem("mediaManagement_openFolders", JSON.stringify(folders));
    }, 300);
  }, []);

  // Load folders from database with hierarchical structure
  const loadFolders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("media_folders")
        .select("*")
        .order("position", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      // Build hierarchical structure
      const folderMap = new Map<string, MediaFolder>();
      const rootFolders: MediaFolder[] = [];

      // First pass: create map of all folders
      data?.forEach((folder) => {
        folderMap.set(folder.id, {
          ...folder,
          children: [],
          files: [],
        });
      });

      // Second pass: build hierarchy
      data?.forEach((folder) => {
        const folderNode = folderMap.get(folder.id)!;
        if (folder.parent_id) {
          const parent = folderMap.get(folder.parent_id);
          if (parent) {
            parent.children!.push(folderNode);
          }
        } else {
          rootFolders.push(folderNode);
        }
      });

      // Load segment mappings from database (including visibility)
      const { data: segmentMappings } = await supabase
        .from('file_segment_mappings')
        .select('file_path, segment_ids, visibility');
      
      const mappingsMap = new Map<string, { segment_ids: string[]; visibility: string }>();
      segmentMappings?.forEach(mapping => {
        mappingsMap.set(mapping.file_path, { 
          segment_ids: mapping.segment_ids, 
          visibility: mapping.visibility || 'public' 
        });
      });

      // Load files for each folder
      for (const [folderId, folder] of folderMap.entries()) {
        const { data: files, error: filesError } = await supabase.storage
          .from("page-images")
          .list(folder.storage_path, {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (!filesError && files) {
          // Filter out ALL subdirectories (they're not real assets)
          const actualFiles = files.filter(item => {
            // Skip all directories (items without file extensions)
            // Real files must have a dot in their name (e.g., .jpg, .png, .pdf)
            if (!item.name.includes('.')) {
              return false;
            }
            return true;
          }).map(file => {
            // Enrich file with segment IDs and visibility from database
            const filePath = `${folder.storage_path}/${file.name}`;
            const mapping = mappingsMap.get(filePath);
            const segmentIds = mapping?.segment_ids || [];
            const visibility = mapping?.visibility || 'public';
            return {
              ...file,
              metadata: {
                ...file.metadata,
                segmentIds,
                visibility
              }
            };
          });

          // Also load files from segment subdirectories and tag them
          // Only process directories that start with "segment-"
          const segmentSubdirs = files.filter(item => 
            !item.name.includes('.') && item.name.startsWith('segment-')
          );

          for (const segmentDir of segmentSubdirs) {
            const segmentId = segmentDir.name.replace('segment-', '');
            const { data: segmentFiles, error: segmentError } = await supabase.storage
              .from("page-images")
              .list(`${folder.storage_path}/${segmentDir.name}`, {
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
              });

            if (!segmentError && segmentFiles) {
              // Add segment files with metadata
              segmentFiles.forEach(file => {
                if (file.name.includes('.')) { // Only actual files
                  const fullPath = `${folder.storage_path}/${segmentDir.name}/${file.name}`;
                  const mapping = mappingsMap.get(fullPath);
                  const dbSegmentIds = mapping?.segment_ids || [segmentId];
                  const visibility = mapping?.visibility || 'public';
                  
                  actualFiles.push({
                    ...file,
                    name: `${segmentDir.name}/${file.name}`, // Preserve path
                    metadata: {
                      ...file.metadata,
                      segmentIds: dbSegmentIds,
                      visibility
                    }
                  });
                }
              });
            }
          }

          folder.files = actualFiles;
        }
      }

      setFolders(rootFolders);
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolders((prev) => {
      const newState = prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId];
      
      // Debounced persist to localStorage
      debouncedSaveToLocalStorage(newState);
      
      return newState;
    });
  }, [debouncedSaveToLocalStorage]);

  const handleCreateFolder = async (parentFolder: MediaFolder) => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const storagePath = `${parentFolder.storage_path}/${newFolderName.toLowerCase().replace(/\s+/g, '-')}`;

      const { error } = await supabase.from("media_folders").insert({
        name: newFolderName,
        parent_id: parentFolder.id,
        storage_path: storagePath,
      });

      if (error) throw error;

      toast.success(`Folder "${newFolderName}" created`);
      setNewFolderName("");
      setCreatingFolderFor(null);
      await loadFolders();
      
      // Open the parent folder and persist to localStorage (debounced)
      if (!openFolders.includes(parentFolder.id)) {
        const newOpenFolders = [...openFolders, parentFolder.id];
        setOpenFolders(newOpenFolders);
        debouncedSaveToLocalStorage(newOpenFolders);
      }
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error(`Failed to create folder: ${error.message}`);
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const { error } = await supabase
        .from("media_folders")
        .update({ name: editingFolder.name })
        .eq("id", editingFolder.id);

      if (error) throw error;

      toast.success("Folder renamed");
      setEditingFolder(null);
      await loadFolders();
    } catch (error: any) {
      console.error("Error renaming folder:", error);
      toast.error(`Failed to rename folder: ${error.message}`);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;

    try {
      // Check if folder has files
      if (deletingFolder.files && deletingFolder.files.length > 0) {
        toast.error("Cannot delete folder with files. Please delete all files first.");
        setDeletingFolder(null);
        return;
      }

      // Check if folder has subfolders
      if (deletingFolder.children && deletingFolder.children.length > 0) {
        toast.error("Cannot delete folder with subfolders. Please delete all subfolders first.");
        setDeletingFolder(null);
        return;
      }

      const { error } = await supabase
        .from("media_folders")
        .delete()
        .eq("id", deletingFolder.id);

      if (error) throw error;

      toast.success("Folder deleted");
      setDeletingFolder(null);
      await loadFolders();
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast.error(`Failed to delete folder: ${error.message}`);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    folder: MediaFolder
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFilesToFolder([file], folder);
  };

  // Unified upload function for both input and drag & drop
  const uploadFilesToFolder = async (files: File[], folder: MediaFolder) => {
    if (files.length === 0) return;

    setUploading(true);
    setSelectedFolder(folder.id);

    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of files) {
        try {
          const timestamp = Date.now();
          const fileName = `${timestamp}-${file.name}`;
          const filePath = `${folder.storage_path}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("page-images")
            .upload(filePath, file);

          if (uploadError) {
            console.error(`Upload error for ${file.name}:`, uploadError);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Upload error for ${file.name}:`, err);
          failCount++;
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} file(s) uploaded to ${folder.name}`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} file(s) uploaded, ${failCount} failed`);
      } else {
        toast.error(`Upload failed for all ${failCount} file(s)`);
      }

      await loadFolders();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setSelectedFolder(null);
    }
  };

  const handleDeleteFile = (folder: MediaFolder, fileName: string) => {
    setDeletingFile({ folder, fileName });
  };

  const confirmDeleteFile = async () => {
    if (!deletingFile) return;

    try {
      // fileName kann jetzt segment-xxx/actual-file.png enthalten
      const filePath = `${deletingFile.folder.storage_path}/${deletingFile.fileName}`;

      const { error } = await supabase.storage
        .from("page-images")
        .remove([filePath]);

      if (error) throw error;

      // Remove from file_segment_mappings table
      await supabase
        .from("file_segment_mappings")
        .delete()
        .eq("file_path", filePath)
        .eq("bucket_id", "page-images");

      // Trigger automatic cleanup of orphaned image URLs in all segment data
      try {
        console.log('[DataHubDialog] Triggering cleanup-orphaned-images after file deletion');
        const { data: cleanupResult, error: cleanupError } = await supabase.functions.invoke(
          'cleanup-orphaned-images',
          { body: {} }
        );
        
        if (cleanupError) {
          console.error('[DataHubDialog] Cleanup function error:', cleanupError);
        } else {
          console.log('[DataHubDialog] Cleanup result:', cleanupResult);
          if (cleanupResult?.result?.imagesRemoved > 0) {
            toast.success(`File deleted and ${cleanupResult.result.imagesRemoved} broken reference(s) removed from segments`);
          } else {
            toast.success("File deleted");
          }
        }
      } catch (cleanupError) {
        console.error('[DataHubDialog] Cleanup invocation failed:', cleanupError);
        toast.success("File deleted (cleanup check skipped)");
      }

      await loadFolders();
      setDeletingFile(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const toggleFileSelection = (folder: MediaFolder, fileName: string) => {
    const fileKey = `${folder.storage_path}/${fileName}`;
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileKey)) {
        newSet.delete(fileKey);
      } else {
        newSet.add(fileKey);
      }
      return newSet;
    });
  };

  const selectAllFilesInFolder = (folder: MediaFolder) => {
    if (!folder.files || folder.files.length === 0) return;
    
    const folderFileKeys = folder.files.map(f => `${folder.storage_path}/${f.name}`);
    const allSelected = folderFileKeys.every(key => selectedFiles.has(key));
    
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in this folder
        folderFileKeys.forEach(key => newSet.delete(key));
      } else {
        // Select all in this folder
        folderFileKeys.forEach(key => newSet.add(key));
      }
      return newSet;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      toast.error("No files selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const filePaths = Array.from(selectedFiles);
      
      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from("page-images")
        .remove(filePaths);

      if (storageError) throw storageError;

      // Remove from file_segment_mappings table
      for (const filePath of filePaths) {
        await supabase
          .from("file_segment_mappings")
          .delete()
          .eq("file_path", filePath)
          .eq("bucket_id", "page-images");
      }

      // Trigger cleanup
      try {
        await supabase.functions.invoke('cleanup-orphaned-images', { body: {} });
      } catch (cleanupError) {
        console.error('[Batch Delete] Cleanup error:', cleanupError);
      }

      toast.success(`${selectedFiles.size} file(s) deleted successfully`);
      setSelectedFiles(new Set());
      await loadFolders();
    } catch (error: any) {
      console.error("Batch delete error:", error);
      toast.error(`Batch delete failed: ${error.message}`);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Batch visibility update
  const handleBatchVisibility = async (newVisibility: 'public' | 'private') => {
    if (selectedFiles.size === 0) {
      toast.error("No files selected");
      return;
    }

    setBatchDeleting(true); // Reuse loading state
    try {
      const filePaths = Array.from(selectedFiles);
      let successCount = 0;

      for (const filePath of filePaths) {
        // Check if mapping exists
        const { data: existing } = await supabase
          .from("file_segment_mappings")
          .select("id, segment_ids")
          .eq("file_path", filePath)
          .eq("bucket_id", "page-images")
          .maybeSingle();

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("file_segment_mappings")
            .update({ visibility: newVisibility, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          
          if (!error) successCount++;
        } else {
          // Create new mapping
          const { error } = await supabase
            .from("file_segment_mappings")
            .insert({
              file_path: filePath,
              bucket_id: "page-images",
              segment_ids: [],
              visibility: newVisibility
            });
          
          if (!error) successCount++;
        }
      }

      toast.success(`${successCount} file(s) set to ${newVisibility}`);
      setSelectedFiles(new Set());
      await loadFolders();
    } catch (error: any) {
      console.error("Batch visibility error:", error);
      toast.error(`Batch visibility update failed: ${error.message}`);
    } finally {
      setBatchDeleting(false);
    }
  };

  const getFileUrl = useCallback((folder: MediaFolder, fileName: string) => {
    // fileName kann jetzt segment-xxx/actual-file.png enthalten
    const { data } = supabase.storage
      .from("page-images")
      .getPublicUrl(`${folder.storage_path}/${fileName}`);
    return data.publicUrl;
  }, []);

  const isImage = useCallback((fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  }, []);

  const isVideo = useCallback((fileName: string) => {
    return /\.(mp4|webm)$/i.test(fileName);
  }, []);

  // Memoize file filtering to avoid recalculating on every render
  const getFilteredFiles = useCallback((files: StorageFile[] = []) => {
    return files.filter(file => file.name.includes('.'));
  }, []);

  const renderFolder = useCallback((folder: MediaFolder, level: number = 0) => {
    const isOpen = openFolders.includes(folder.id);
    const folderFiles = getFilteredFiles(folder.files);
    const isRootFolder = folder.parent_id === null;

    return (
      <Collapsible
        key={folder.id}
        open={isOpen}
        onOpenChange={() => toggleFolder(folder.id)}
      >
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm mb-3" style={{ marginLeft: `${level * 20}px` }}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/80 to-gray-800/40 hover:from-gray-700/80 hover:to-gray-700/40 transition-all duration-300">
            <CollapsibleTrigger className="flex items-center gap-3 flex-1">
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-[#f9dc24] transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400 transition-transform duration-200" />
              )}
              {isOpen ? (
                <FolderOpen className="h-6 w-6 text-[#f9dc24]" />
              ) : (
                <Folder className="h-6 w-6 text-gray-500" />
              )}
              <span className="font-semibold text-white text-lg">
                {folder.name}
              </span>
              <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                {folderFiles.length} files
              </span>
            </CollapsibleTrigger>

            <div className="flex items-center gap-2">
              {/* Create Subfolder Button - hide in selection mode */}
              {!selectionMode && creatingFolderFor === folder.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder(folder);
                      if (e.key === "Escape") {
                        setCreatingFolderFor(null);
                        setNewFolderName("");
                      }
                    }}
                    className="h-8 w-40 bg-gray-700 border-gray-600 text-white"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCreateFolder(folder)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCreatingFolderFor(null);
                      setNewFolderName("");
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              ) : !selectionMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingFolderFor(folder.id);
                  }}
                  className="text-gray-400 hover:text-[#f9dc24]"
                  title="Create subfolder"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              )}

              {/* Rename Button (not for root) - hide in selection mode */}
              {!selectionMode && !isRootFolder && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolder({ id: folder.id, name: folder.name });
                  }}
                  className="text-gray-400 hover:text-blue-400"
                  title="Rename folder"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}

              {/* Delete Button (not for root) - hide in selection mode */}
              {!selectionMode && !isRootFolder && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingFolder(folder);
                  }}
                  className="text-gray-400 hover:text-red-400"
                  title="Delete folder"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {/* Upload Button - hide in selection mode */}
              {!selectionMode && (
                <div className="relative">
                <Input
                  type="file"
                  onChange={(e) => handleFileUpload(e, folder)}
                  disabled={uploading && selectedFolder === folder.id}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id={`upload-${folder.id}`}
                />
                <Button
                  size="sm"
                  disabled={uploading && selectedFolder === folder.id}
                  className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading && selectedFolder === folder.id
                    ? "Uploading..."
                    : "Upload"}
                </Button>
              </div>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="p-4 bg-gray-900/30">
              {/* Batch Operations Toolbar (only in non-selection mode) */}
              {!selectionMode && folderFiles.length > 0 && (
                <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAllFilesInFolder(folder)}
                      className="bg-blue-900/30 border-blue-700 text-blue-300 hover:bg-blue-900/50"
                    >
                      {folder.files?.every(f => selectedFiles.has(`${folder.storage_path}/${f.name}`)) ? (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      {folder.files?.every(f => selectedFiles.has(`${folder.storage_path}/${f.name}`))
                        ? 'Deselect All'
                        : 'Select All'
                      }
                    </Button>
                    {selectedFiles.size > 0 && (
                      <span className="text-sm text-gray-400">
                        {selectedFiles.size} file(s) selected
                      </span>
                    )}
                  </div>
                  {selectedFiles.size > 0 && (
                    <div className="flex items-center gap-2">
                      {/* Batch Visibility Buttons */}
                      <Button
                        size="sm"
                        onClick={() => handleBatchVisibility('public')}
                        disabled={batchDeleting}
                        className="bg-green-900/50 hover:bg-green-900 border-green-800 text-green-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Public
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBatchVisibility('private')}
                        disabled={batchDeleting}
                        className="bg-orange-900/50 hover:bg-orange-900 border-orange-800 text-orange-300"
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Private
                      </Button>
                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBatchDelete}
                        disabled={batchDeleting}
                        className="bg-red-900/50 hover:bg-red-900 border-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {batchDeleting ? 'Processing...' : `Delete ${selectedFiles.size}`}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Drag & Drop Zone (only in non-selection mode) */}
              {!selectionMode && (
                <div className="mb-4">
                  <DropZone
                    onFilesDropped={(files) => uploadFilesToFolder(files, folder)}
                    disabled={uploading && selectedFolder === folder.id}
                    className="min-h-[120px]"
                  />
                </div>
              )}

              {/* Render subfolders */}
              {folder.children && folder.children.length > 0 && (
                <div className="mb-4">
                  {folder.children.map((child) => renderFolder(child, level + 1))}
                </div>
              )}

              {/* Render files */}
              {folderFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No files yet - drag & drop or use Upload button above</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {folderFiles.map((file) => {
                    const fileUrl = getFileUrl(folder, file.name);
                    const isImg = isImage(file.name);
                    const isVid = isVideo(file.name);

                    // Derive segment IDs from metadata or path (segment-XXX/filename)
                    const pathParts = file.name.split('/');
                    const segmentFromPath = pathParts.length > 1 && pathParts[0].startsWith('segment-')
                      ? pathParts[0].replace('segment-', '')
                      : undefined;

                    const segmentId = file.metadata?.segmentId || file.metadata?.segment_id || segmentFromPath;
                    const segmentIds = file.metadata?.segmentIds || (segmentId ? [segmentId] : []);
                    const visibility = file.metadata?.visibility || 'public';
                    
                    return (
                      <div
                        key={file.id}
                        className="group relative border border-gray-700 rounded-lg overflow-hidden hover:border-[#f9dc24] transition-all duration-300 bg-gray-800/50 hover:bg-gray-800"
                      >
                        {/* Checkbox for batch selection - only in non-selection mode */}
                        {!selectionMode && (
                          <div 
                            className="absolute top-2 left-2 z-20 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFileSelection(folder, file.name);
                            }}
                          >
                            {selectedFiles.has(`${folder.storage_path}/${file.name}`) ? (
                              <CheckSquare className="h-5 w-5 text-[#f9dc24] bg-gray-900/90 backdrop-blur-sm rounded border border-[#f9dc24]/30 p-0.5" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400 bg-gray-900/70 backdrop-blur-sm rounded border border-gray-600/30 p-0.5 hover:text-[#f9dc24] hover:border-[#f9dc24]/30" />
                            )}
                          </div>
                        )}
                        
                         {isImg && (
                          <div className="aspect-video bg-gray-900 overflow-hidden relative">
                             <img
                              src={fileUrl}
                              alt={file.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                selectionMode ? 'cursor-pointer' : ''
                              }`}
                              loading="lazy"
                              onClick={() => {
                                if (selectionMode && onSelect) {
                                  onSelect(fileUrl, {
                                    name: file.name,
                                    folder: folder.storage_path,
                                    created_at: file.created_at
                                  });
                                }
                              }}
                             />
                             {/* Visibility Badge - bottom-left */}
                             <div 
                               className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md border shadow-lg backdrop-blur-sm ${
                                 visibility === 'private' 
                                   ? 'bg-red-900/90 border-red-500/50' 
                                   : 'bg-green-900/90 border-green-500/50'
                               }`}
                               title={visibility === 'private' ? 'Private - Not searchable' : 'Public - Searchable'}
                             >
                               {visibility === 'private' ? (
                                 <EyeOff className="h-3 w-3 text-red-400" />
                               ) : (
                                 <Eye className="h-3 w-3 text-green-400" />
                               )}
                               <span className={`text-[10px] font-semibold ${visibility === 'private' ? 'text-red-400' : 'text-green-400'}`}>
                                 {visibility === 'private' ? 'Private' : 'Public'}
                               </span>
                             </div>
                             {/* Segment Badges - support multiple segments on top-right */}
                             {segmentIds.length > 0 && (
                               <div className="absolute top-2 right-2 flex items-center gap-1">
                                 {segmentIds.map((id: string, idx: number) => (
                                   <div 
                                     key={idx}
                                     className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md border border-[#f9dc24]/30 shadow-lg"
                                     title={`Assigned to Segment ${id}`}
                                   >
                                     <Tag className="h-3 w-3 text-[#f9dc24]" />
                                     <span className="text-[10px] font-semibold text-[#f9dc24]">#{id}</span>
                                   </div>
                                 ))}
                               </div>
                             )}
                          </div>
                        )}
                        {isVid && (
                          <div 
                            className={`aspect-video bg-gray-900 overflow-hidden relative ${selectionMode ? 'cursor-pointer' : ''}`}
                            onClick={() => {
                              if (selectionMode && onSelect) {
                                onSelect(fileUrl, {
                                  name: file.name,
                                  folder: folder.storage_path,
                                  created_at: file.created_at,
                                  isVideo: true
                                });
                              }
                            }}
                          >
                            {/* Video thumbnail generated from first frame */}
                            <video
                              src={fileUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              muted
                              preload="metadata"
                              onLoadedData={(e) => {
                                const video = e.currentTarget;
                                video.currentTime = 0.1; // Seek to first frame
                              }}
                            />
                            {/* Play icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                            {/* Video badge */}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-medium">
                              VIDEO
                            </div>
                            {/* Visibility Badge for videos - bottom-left */}
                            <div 
                              className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md border shadow-lg backdrop-blur-sm ${
                                visibility === 'private' 
                                  ? 'bg-red-900/90 border-red-500/50' 
                                  : 'bg-green-900/90 border-green-500/50'
                              }`}
                              title={visibility === 'private' ? 'Private - Not searchable' : 'Public - Searchable'}
                            >
                              {visibility === 'private' ? (
                                <EyeOff className="h-3 w-3 text-red-400" />
                              ) : (
                                <Eye className="h-3 w-3 text-green-400" />
                              )}
                              <span className={`text-[10px] font-semibold ${visibility === 'private' ? 'text-red-400' : 'text-green-400'}`}>
                                {visibility === 'private' ? 'Private' : 'Public'}
                              </span>
                            </div>
                            {/* Segment Badges for videos */}
                            {segmentIds.length > 0 && (
                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                {segmentIds.map((id: string, idx: number) => (
                                  <div 
                                    key={idx}
                                    className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md border border-[#f9dc24]/30 shadow-lg"
                                    title={`Assigned to Segment ${id}`}
                                  >
                                    <Tag className="h-3 w-3 text-[#f9dc24]" />
                                    <span className="text-[10px] font-semibold text-[#f9dc24]">#{id}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {!isImg && !isVid && (
                          <div className="aspect-video bg-gray-900 flex items-center justify-center">
                            <File className="h-10 w-10 text-gray-600" />
                          </div>
                        )}

                        <div className="p-3 space-y-1.5">
                          <p className="text-xs text-gray-300 truncate font-medium" title={file.name}>
                            {file.name.includes('/') ? file.name.split('/').pop() : file.name}
                          </p>
                          {/* Segment Assignment Info - support multiple segments */}
                          {segmentIds.length > 0 && (
                            <p className="text-[10px] text-[#f9dc24]/80 flex items-center gap-1">
                              <span>→</span>
                              <span>Segment {segmentIds.join(', ')}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>

                           <div className="flex gap-2">
                            {selectionMode ? (
                              <Button
                                size="sm"
                                className="flex-1 text-xs bg-[#f9dc24] hover:bg-[#e6cc1f] text-black font-semibold"
                                onClick={() => {
                                  if (onSelect) {
                                    onSelect(fileUrl, {
                                      name: file.name,
                                      folder: folder.storage_path,
                                      created_at: file.created_at
                                    });
                                  }
                                }}
                              >
                                Select
                              </Button>
                            ) : (
                              <>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="flex-1 text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                   onClick={() => {
                                     navigator.clipboard.writeText(fileUrl);
                                     toast.success("URL copied!");
                                   }}
                                 >
                                   Copy URL
                                 </Button>
                                 <Button
                                   size="icon"
                                   variant="outline"
                                   className="h-8 w-8 bg-blue-900/50 hover:bg-blue-900 border-blue-800"
                                   onClick={() => {
                                     setEditingAsset({
                                       name: file.name,
                                       url: fileUrl,
                                       created_at: file.created_at,
                                       metadata: file.metadata,
                                       bucket_id: file.bucket_id,
                                       segmentIds: segmentIds,
                                       filePath: `${folder.storage_path}/${file.name}`,
                                       id: file.id
                                     });
                                   }}
                                   title="Edit asset info and alt text"
                                 >
                                   <Edit2 className="h-4 w-4" />
                                 </Button>
                                 <Button
                                   size="icon"
                                   variant="destructive"
                                   className="h-8 w-8 bg-red-900/50 hover:bg-red-900 border-red-800"
                                   onClick={() => handleDeleteFile(folder, file.name)}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }, [openFolders, getFilteredFiles, getFileUrl, isImage, isVideo, toggleFolder, selectionMode, onSelect, selectedFiles, uploading, selectedFolder, creatingFolderFor, newFolderName, editingFolder, deletingFolder, batchDeleting]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (controlledIsOpen !== undefined) {
          if (!open && onClose) onClose();
        } else {
          setInternalIsOpen(open);
        }
      }}>
        {controlledIsOpen === undefined && (
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black border-[#f9dc24] flex items-center gap-2 font-semibold"
            >
              <FolderOpen className="h-4 w-4" />
              Media Management
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#f9dc24] to-[#e6cc1f] flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-gray-900" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-white">
                    {selectionMode ? 'Select Media' : 'Media Management'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 text-base mt-1">
                    {selectionMode 
                      ? 'Click on an image to select it for your segment'
                      : 'Manage your hierarchical folder structure and upload assets'
                    }
                  </DialogDescription>
                </div>
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={loadFolders}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
                className="bg-gray-800/50 border-gray-600 hover:bg-gray-700 text-white"
                title="Refresh media library"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
            {folders.map((folder) => renderFolder(folder))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <AlertDialog open={editingFolder !== null} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Rename Folder</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Enter a new name for the folder
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={editingFolder?.name || ""}
            onChange={(e) => setEditingFolder(editingFolder ? { ...editingFolder, name: e.target.value } : null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameFolder();
              if (e.key === "Escape") setEditingFolder(null);
            }}
            className="bg-gray-800 border-gray-700 text-white"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameFolder}
              className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black"
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={deletingFolder !== null} onOpenChange={(open) => !open && setDeletingFolder(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deletingFolder?.name}"? This action cannot be undone.
              {deletingFolder?.files && deletingFolder.files.length > 0 && (
                <span className="block mt-2 text-red-400 font-semibold">
                  This folder contains {deletingFolder.files.length} file(s) and cannot be deleted.
                </span>
              )}
              {deletingFolder?.children && deletingFolder.children.length > 0 && (
                <span className="block mt-2 text-red-400 font-semibold">
                  This folder contains {deletingFolder.children.length} subfolder(s) and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={
                (deletingFolder?.files && deletingFolder.files.length > 0) ||
                (deletingFolder?.children && deletingFolder.children.length > 0)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete File Confirmation */}
      <AlertDialog open={deletingFile !== null} onOpenChange={(open) => !open && setDeletingFile(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete File?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Asset Edit Dialog */}
      <AssetEditDialog
        isOpen={editingAsset !== null}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        onSave={loadFolders}
      />
    </>
  );
}
