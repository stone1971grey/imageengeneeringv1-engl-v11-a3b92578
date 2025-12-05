import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon, 
  Image as ImageIcon,
  Unlink,
  Upload,
  Globe,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#0f407b] underline hover:text-[#0d3468]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-6 shadow-md',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#0f407b] prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-l-[#0f407b] prose-blockquote:text-gray-600 prose-blockquote:italic',
      },
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
      setShowImageDialog(true);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }

      toast.success('Image uploaded successfully');
      setShowImageDialog(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrlInsert = () => {
    if (!imageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }

    setShowImageDialog(false);
    setImageUrl('');
  };

  const setLink = () => {
    if (!linkUrl) {
      toast.error('Please enter a URL');
      return;
    }

    if (editor) {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection) {
        toast.error('Please select text first before adding a link');
        return;
      }

      editor.chain().focus().setLink({ href: linkUrl }).run();
      toast.success('Link added successfully');
    }

    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const openLinkDialog = () => {
    const previousUrl = editor?.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkDialog(true);
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-[#0f407b] text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-8 bg-gray-200 mx-1" />
  );

  return (
    <div 
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
            title="Normal Text"
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Bold/Italic */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Link */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={openLinkDialog}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}
        </div>

        <ToolbarDivider />

        {/* Image */}
        <ToolbarButton
          onClick={() => setShowImageDialog(true)}
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className={`relative ${isDragging ? 'bg-blue-50' : 'bg-white'}`}>
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 border-2 border-dashed border-[#0f407b] rounded-lg z-10 pointer-events-none">
            <div className="text-center">
              <Upload className="w-12 h-12 text-[#0f407b] mx-auto mb-2" />
              <p className="text-[#0f407b] font-medium">Drop image here</p>
            </div>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Tip: Drag & drop images directly into the editor</span>
        <span>{editor.storage.characterCount?.characters?.() || editor.getText().length} characters</span>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#0f407b]" />
              Insert Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Select text in the editor first, then enter the URL below.
            </p>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={setLink} className="bg-[#0f407b] hover:bg-[#0d3468]">
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={(open) => {
        setShowImageDialog(open);
        if (!open) {
          setImageFile(null);
          setImagePreview(null);
          setImageUrl('');
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#0f407b]" />
              Insert Image
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                From URL
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  imagePreview ? 'border-[#0f407b] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">{imageFile?.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Drag & drop an image here, or</p>
                    <label className="cursor-pointer">
                      <span className="text-[#0f407b] font-medium hover:underline">browse files</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                onClick={handleImageUpload}
                disabled={!imageFile || uploadingImage}
                className="w-full bg-[#0f407b] hover:bg-[#0d3468]"
              >
                {uploadingImage ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  'Upload & Insert'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1.5"
                />
              </div>
              
              {imageUrl && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <Button
                type="button"
                onClick={handleImageUrlInsert}
                disabled={!imageUrl}
                className="w-full bg-[#0f407b] hover:bg-[#0d3468]"
              >
                Insert from URL
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
