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
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 border-gray-400 flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Data Hub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Data Hub</DialogTitle>
          <DialogDescription>
            Upload and manage your media assets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
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
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <CollapsibleTrigger className="flex items-center gap-3 flex-1">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      {isOpen ? (
                        <FolderOpen className="h-5 w-5 text-[#f9dc24]" />
                      ) : (
                        <Folder className="h-5 w-5 text-gray-400" />
                      )}
                      <FolderIcon className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {folder.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({folderFiles.length} files)
                      </span>
                    </CollapsibleTrigger>

                    <div className="relative">
                      <Input
                        type="file"
                        accept={folder.acceptedTypes.join(",")}
                        onChange={(e) => handleFileUpload(e, folder.path)}
                        disabled={uploading && selectedFolder === folder.path}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id={`upload-${folder.path}`}
                      />
                      <Button
                        size="sm"
                        disabled={uploading && selectedFolder === folder.path}
                        className="bg-[#f9dc24] hover:bg-[#e6cc1f] text-black"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading && selectedFolder === folder.path
                          ? "Uploading..."
                          : "Upload"}
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 space-y-2">
                      {folderFiles.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                          No files in this folder yet
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {folderFiles.map((file) => {
                            const fileUrl = getFileUrl(folder.path, file.name);
                            const isImage = folder.path === "images";
                            const isVideo = folder.path === "videos";

                            return (
                              <div
                                key={file.id}
                                className="group relative border rounded-lg p-3 hover:shadow-md transition-all bg-white"
                              >
                                {isImage && (
                                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                                    <img
                                      src={fileUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                {isVideo && (
                                  <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                                    <Video className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                {!isImage && !isVideo && (
                                  <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}

                                <p className="text-xs text-gray-600 truncate mb-1" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(file.created_at).toLocaleDateString()}
                                </p>

                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() =>
                                    handleDeleteFile(folder.path, file.name)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 text-xs"
                                  onClick={() => {
                                    navigator.clipboard.writeText(fileUrl);
                                    toast.success("URL copied to clipboard");
                                  }}
                                >
                                  Copy URL
                                </Button>
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
