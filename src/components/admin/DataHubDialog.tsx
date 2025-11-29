import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database, Upload, ChevronDown, ChevronRight, Image, FileText, Video, Trash2, FolderOpen, Folder } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
  bucket_id: string;
}

interface FolderStructure {
  name: string;
  path: string;
  acceptedTypes: string[];
  icon: any;
}

const FOLDERS: FolderStructure[] = [
  {
    name: "Images",
    path: "images",
    acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    icon: Image,
  },
  {
    name: "Documents",
    path: "documents",
    acceptedTypes: ["application/pdf"],
    icon: FileText,
  },
  {
    name: "Videos",
    path: "videos",
    acceptedTypes: ["video/mp4", "video/webm"],
    icon: Video,
  },
];

export function DataHubDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<string[]>(["images"]);
  const [files, setFiles] = useState<Record<string, StorageFile[]>>({});
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Load files from storage
  const loadFiles = async () => {
    try {
      const allFiles: Record<string, StorageFile[]> = {};

      for (const folder of FOLDERS) {
        const { data, error } = await supabase.storage
          .from("page-images")
          .list(folder.path, {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (error) {
          console.error(`Error loading ${folder.name}:`, error);
          continue;
        }

        allFiles[folder.path] = data || [];
      }

      setFiles(allFiles);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load files");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) =>
      prev.includes(folderPath)
        ? prev.filter((p) => p !== folderPath)
        : [...prev, folderPath]
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    folderPath: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const folder = FOLDERS.find((f) => f.path === folderPath);
    if (!folder) return;

    // Validate file type
    if (!folder.acceptedTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Accepted types: ${folder.acceptedTypes.join(", ")}`
      );
      return;
    }

    setUploading(true);
    setSelectedFolder(folderPath);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${folderPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success(`File uploaded to ${folder.name}`);
      await loadFiles();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setSelectedFolder(null);
      // Reset input
      event.target.value = "";
    }
  };

  const handleDeleteFile = async (folderPath: string, fileName: string) => {
    try {
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from("page-images")
        .remove([filePath]);

      if (error) throw error;

      toast.success("File deleted");
      await loadFiles();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const getFileUrl = (folderPath: string, fileName: string) => {
    const { data } = supabase.storage
      .from("page-images")
      .getPublicUrl(`${folderPath}/${fileName}`);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black border-[#f9dc24] flex items-center gap-2 font-semibold"
        >
          <Database className="h-4 w-4" />
          Media Management
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#f9dc24] to-[#e6cc1f] flex items-center justify-center">
              <Database className="h-5 w-5 text-gray-900" />
            </div>
            Media Management
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            Upload and manage your media assets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
          {FOLDERS.map((folder) => {
            const isOpen = openFolders.includes(folder.path);
            const folderFiles = files[folder.path] || [];
            const FolderIcon = folder.icon;

            return (
              <Collapsible
                key={folder.path}
                open={isOpen}
                onOpenChange={() => toggleFolder(folder.path)}
              >
                <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm">
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
                      <FolderIcon className="h-5 w-5 text-gray-300" />
                      <span className="font-semibold text-white text-lg">
                        {folder.name}
                      </span>
                      <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                        {folderFiles.length} files
                      </span>
                    </CollapsibleTrigger>

                    <div className="relative">
                      <Input
                        type="file"
                        accept={folder.acceptedTypes.join(",")}
                        onChange={(e) => handleFileUpload(e, folder.path)}
                        disabled={uploading && selectedFolder === folder.path}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id={`upload-${folder.path}`}
                      />
                      <Button
                        size="sm"
                        disabled={uploading && selectedFolder === folder.path}
                        className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading && selectedFolder === folder.path
                          ? "Uploading..."
                          : "Upload"}
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 bg-gray-900/30">
                      {folderFiles.length === 0 ? (
                        <div className="text-center py-12">
                          <FolderIcon className="h-16 w-16 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">
                            No files in this folder yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {folderFiles.map((file) => {
                            const fileUrl = getFileUrl(folder.path, file.name);
                            const isImage = folder.path === "images";
                            const isVideo = folder.path === "videos";

                            return (
                              <div
                                key={file.id}
                                className="group relative border border-gray-700 rounded-lg overflow-hidden hover:border-[#f9dc24] transition-all duration-300 bg-gray-800/50 hover:bg-gray-800"
                              >
                                {isImage && (
                                  <div className="aspect-video bg-gray-900 overflow-hidden">
                                    <img
                                      src={fileUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                {isVideo && (
                                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                                    <Video className="h-10 w-10 text-gray-600" />
                                  </div>
                                )}
                                {!isImage && !isVideo && (
                                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-gray-600" />
                                  </div>
                                )}

                                <div className="p-3 space-y-2">
                                  <p className="text-xs text-gray-300 truncate font-medium" title={file.name}>
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(file.created_at).toLocaleDateString()}
                                  </p>

                                  <div className="flex gap-2">
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
                                      variant="destructive"
                                      className="h-8 w-8 bg-red-900/50 hover:bg-red-900 border-red-800"
                                      onClick={() =>
                                        handleDeleteFile(folder.path, file.name)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
