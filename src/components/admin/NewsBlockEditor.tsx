import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Type,
  Heading2,
  Heading3,
  Image,
  Quote,
  List,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Upload,
  Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaSelector } from "./MediaSelector";

export interface ContentBlock {
  id: string;
  type: "paragraph" | "heading2" | "heading3" | "image" | "quote" | "list";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  listItems?: string[];
}

interface NewsBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPES = [
  { type: "paragraph", label: "Text Paragraph", icon: Type },
  { type: "heading2", label: "Heading (H2)", icon: Heading2 },
  { type: "heading3", label: "Subheading (H3)", icon: Heading3 },
  { type: "image", label: "Image", icon: Image },
  { type: "quote", label: "Quote / Highlight", icon: Quote },
  { type: "list", label: "Bullet List", icon: List },
] as const;

const generateId = () => Math.random().toString(36).substring(2, 11);

const NewsBlockEditor = ({ blocks, onChange }: NewsBlockEditorProps) => {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const addBlock = (type: ContentBlock["type"], afterIndex?: number) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: "",
      listItems: type === "list" ? [""] : undefined,
    };

    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onChange(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      toast.error("You need at least one block");
      return;
    }
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    setUploadingBlockId(blockId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("page-images")
        .getPublicUrl(filePath);

      updateBlock(blockId, { imageUrl: publicUrl });
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingBlockId(null);
    }
  };

  const handleListItemChange = (blockId: string, index: number, value: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || !block.listItems) return;

    const newItems = [...block.listItems];
    newItems[index] = value;
    updateBlock(blockId, { listItems: newItems });
  };

  const addListItem = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || !block.listItems) return;
    updateBlock(blockId, { listItems: [...block.listItems, ""] });
  };

  const removeListItem = (blockId: string, index: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || !block.listItems || block.listItems.length <= 1) return;
    updateBlock(blockId, { listItems: block.listItems.filter((_, i) => i !== index) });
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const BlockIcon = BLOCK_TYPES.find((t) => t.type === block.type)?.icon || Type;

    return (
      <Card
        key={block.id}
        className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Block Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1 text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100"
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100"
              onClick={() => moveBlock(index, "down")}
              disabled={index === blocks.length - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
            <BlockIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {BLOCK_TYPES.find((t) => t.type === block.type)?.label}
            </span>
          </div>

          <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => deleteBlock(block.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Block Content Editor */}
        <div className="space-y-3">
          {/* Paragraph */}
          {block.type === "paragraph" && (
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter your paragraph text here..."
              className="min-h-[120px] text-gray-900 bg-gray-50 border-gray-200 focus:bg-white resize-y"
            />
          )}

          {/* Headings */}
          {(block.type === "heading2" || block.type === "heading3") && (
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder={block.type === "heading2" ? "Section Heading..." : "Subheading..."}
              className={`text-gray-900 bg-gray-50 border-gray-200 focus:bg-white ${
                block.type === "heading2" ? "text-xl font-bold" : "text-lg font-semibold"
              }`}
            />
          )}

          {/* Quote */}
          {block.type === "quote" && (
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0f407b] rounded-full" />
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Enter quote or highlighted text..."
                className="min-h-[80px] pl-6 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white italic resize-y"
              />
            </div>
          )}

          {/* Image */}
          {block.type === "image" && (
            <div className="space-y-4">
              {block.imageUrl ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={block.imageUrl}
                      alt={block.imageAlt || ""}
                      className="w-full max-h-[400px] object-contain rounded-lg border border-gray-200 bg-gray-100"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => updateBlock(block.id, { imageUrl: "", imageAlt: "", imageCaption: "" })}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <Input
                    value={block.imageAlt || ""}
                    onChange={(e) => updateBlock(block.id, { imageAlt: e.target.value })}
                    placeholder="Alt text (for accessibility)"
                    className="text-gray-900 bg-gray-50 border-gray-200"
                  />
                  <Input
                    value={block.imageCaption || ""}
                    onChange={(e) => updateBlock(block.id, { imageCaption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="text-gray-900 bg-gray-50 border-gray-200 text-sm italic"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    {/* Upload from Computer */}
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(block.id, file);
                        }}
                        disabled={uploadingBlockId === block.id}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 border-dashed border-2 hover:border-[#0f407b] hover:bg-blue-50"
                        disabled={uploadingBlockId === block.id}
                        asChild
                      >
                        <span className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="h-6 w-6 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {uploadingBlockId === block.id ? "Uploading..." : "Upload from Computer"}
                          </span>
                        </span>
                      </Button>
                    </label>

                    {/* Media Selector */}
                    <div className="flex-1">
                      <MediaSelector
                        currentImageUrl={block.imageUrl || ""}
                        onFileSelect={(file) => handleImageUpload(block.id, file)}
                        onMediaSelect={(url) => updateBlock(block.id, { imageUrl: url })}
                        label="Select from Media"
                      />
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Or paste image URL..."
                      className="text-gray-900 bg-gray-50 border-gray-200"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          if (input.value) {
                            updateBlock(block.id, { imageUrl: input.value });
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousSibling as HTMLInputElement;
                        if (input?.value) {
                          updateBlock(block.id, { imageUrl: input.value });
                          input.value = "";
                        }
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List */}
          {block.type === "list" && (
            <div className="space-y-2">
              {block.listItems?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">•</span>
                  <Input
                    value={item}
                    onChange={(e) => handleListItemChange(block.id, itemIndex, e.target.value)}
                    placeholder={`List item ${itemIndex + 1}...`}
                    className="flex-1 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeListItem(block.id, itemIndex)}
                    disabled={(block.listItems?.length || 0) <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addListItem(block.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          )}
        </div>

        {/* Add Block Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Select onValueChange={(type) => addBlock(type as ContentBlock["type"], index)}>
            <SelectTrigger className="w-full bg-gray-50 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add block below...</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {BLOCK_TYPES.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <SelectItem key={blockType.type} value={blockType.type}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span>{blockType.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with initial Add Block */}
      {blocks.length === 0 && (
        <Card className="p-8 border-dashed border-2 border-gray-300 bg-gray-50">
          <div className="text-center space-y-4">
            <p className="text-gray-500">No content blocks yet. Add your first block:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {BLOCK_TYPES.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <Button
                    key={blockType.type}
                    type="button"
                    variant="outline"
                    onClick={() => addBlock(blockType.type as ContentBlock["type"])}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {blockType.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Blocks */}
      {blocks.map((block, index) => renderBlockEditor(block, index))}

      {/* Bottom Add Block */}
      {blocks.length > 0 && (
        <div className="flex justify-center pt-4">
          <Select onValueChange={(type) => addBlock(type as ContentBlock["type"])}>
            <SelectTrigger className="w-64 bg-white border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-[#0f407b]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add new block at end</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {BLOCK_TYPES.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <SelectItem key={blockType.type} value={blockType.type}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span>{blockType.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Block Count Info */}
      <div className="text-center text-sm text-gray-400 pt-2">
        {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
      </div>
    </div>
  );
};

export default NewsBlockEditor;

// Helper to convert blocks to HTML for frontend display
export const blocksToHtml = (blocks: ContentBlock[]): string => {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p>${block.content}</p>`;
        case "heading2":
          return `<h2>${block.content}</h2>`;
        case "heading3":
          return `<h3>${block.content}</h3>`;
        case "quote":
          return `<blockquote>${block.content}</blockquote>`;
        case "image":
          return `<figure>
            <img src="${block.imageUrl}" alt="${block.imageAlt || ""}" />
            ${block.imageCaption ? `<figcaption>${block.imageCaption}</figcaption>` : ""}
          </figure>`;
        case "list":
          return `<ul>${block.listItems?.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        default:
          return "";
      }
    })
    .join("\n");
};

// Helper to parse HTML back to blocks (for migration)
export const htmlToBlocks = (html: string): ContentBlock[] => {
  // Simple parser - for existing content migration
  const blocks: ContentBlock[] = [];
  
  // If content looks like JSON, try to parse it
  if (html.startsWith("[")) {
    try {
      return JSON.parse(html);
    } catch {
      // Continue with HTML parsing
    }
  }
  
  // Default: treat as single paragraph
  if (html.trim()) {
    blocks.push({
      id: generateId(),
      type: "paragraph",
      content: html.replace(/<[^>]*>/g, "").trim(),
    });
  }
  
  return blocks.length ? blocks : [{ id: generateId(), type: "paragraph", content: "" }];
};
