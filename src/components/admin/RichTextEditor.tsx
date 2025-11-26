import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Unlink 
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        hardBreak: false, // Disable default hardBreak from StarterKit
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            'Enter': () => this.editor.commands.setHardBreak(),
            'Shift-Enter': () => this.editor.commands.splitListItem('listItem') || 
                                 this.editor.commands.createParagraphNear(),
          }
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#f9dc24] underline hover:text-[#f9dc24]/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-base max-w-none focus:outline-none min-h-[400px] p-4 border border-gray-300 rounded-md prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-3 prose-p:my-0',
      },
    },
  });

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
        // No text selected - show warning
        toast.error('Please select text first before adding a link');
        return;
      }

      // Text selected - apply link to selection
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl })
        .run();
      
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const { state } = editor;
            const { from, to } = state.selection;
            const hasSelection = from !== to;
            
            if (!hasSelection) {
              toast.error('Please select the text that should become a heading first');
              return;
            }
            
            // Get the selection positions
            const $from = state.selection.$from;
            const $to = state.selection.$to;
            
            // Check if selection is within a single node
            if ($from.parent !== $to.parent) {
              toast.error('Please select text within a paragraph');
              return;
            }
            
            // Get positions relative to the parent node
            const parentStart = $from.start($from.depth);
            const parentEnd = $to.end($to.depth);
            
            // Get text content
            const textBefore = state.doc.textBetween(parentStart, from, '\n');
            const selectedText = state.doc.textBetween(from, to, '\n');
            const textAfter = state.doc.textBetween(to, parentEnd, '\n');
            
            // Build new content
            const newContent: any[] = [];
            
            if (textBefore.trim()) {
              newContent.push({ 
                type: 'paragraph', 
                content: [{ type: 'text', text: textBefore }] 
              });
            }
            
            newContent.push({ 
              type: 'heading', 
              attrs: { level: 2 }, 
              content: [{ type: 'text', text: selectedText }] 
            });
            
            if (textAfter.trim()) {
              newContent.push({ 
                type: 'paragraph', 
                content: [{ type: 'text', text: textAfter }] 
              });
            }
            
            // Replace the entire parent node
            const nodeStart = $from.before($from.depth);
            const nodeEnd = $to.after($to.depth);
            
            editor
              .chain()
              .focus()
              .deleteRange({ from: nodeStart, to: nodeEnd })
              .insertContentAt(nodeStart, newContent)
              .run();
          }}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-[#f9dc24] text-black font-bold' : ''}
        >
          <Heading2 className="w-4 h-4" />
          {editor.isActive('heading', { level: 2 }) && <span className="ml-1 text-xs">H2</span>}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const { state } = editor;
            const { from, to } = state.selection;
            const hasSelection = from !== to;
            
            if (!hasSelection) {
              toast.error('Please select the text that should become a heading first');
              return;
            }
            
            // Get the selection positions
            const $from = state.selection.$from;
            const $to = state.selection.$to;
            
            // Check if selection is within a single node
            if ($from.parent !== $to.parent) {
              toast.error('Please select text within a paragraph');
              return;
            }
            
            // Get positions relative to the parent node
            const parentStart = $from.start($from.depth);
            const parentEnd = $to.end($to.depth);
            
            // Get text content
            const textBefore = state.doc.textBetween(parentStart, from, '\n');
            const selectedText = state.doc.textBetween(from, to, '\n');
            const textAfter = state.doc.textBetween(to, parentEnd, '\n');
            
            // Build new content
            const newContent: any[] = [];
            
            if (textBefore.trim()) {
              newContent.push({ 
                type: 'paragraph', 
                content: [{ type: 'text', text: textBefore }] 
              });
            }
            
            newContent.push({ 
              type: 'heading', 
              attrs: { level: 3 }, 
              content: [{ type: 'text', text: selectedText }] 
            });
            
            if (textAfter.trim()) {
              newContent.push({ 
                type: 'paragraph', 
                content: [{ type: 'text', text: textAfter }] 
              });
            }
            
            // Replace the entire parent node
            const nodeStart = $from.before($from.depth);
            const nodeEnd = $to.after($to.depth);
            
            editor
              .chain()
              .focus()
              .deleteRange({ from: nodeStart, to: nodeEnd })
              .insertContentAt(nodeStart, newContent)
              .run();
          }}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-[#f9dc24] text-black font-bold' : ''}
        >
          <Heading3 className="w-4 h-4" />
          {editor.isActive('heading', { level: 3 }) && <span className="ml-1 text-xs">H3</span>}
        </Button>
        <div className="w-px h-8 bg-gray-300" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openLinkDialog}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        {editor.isActive('link') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink className="w-4 h-4" />
          </Button>
        )}
        <div className="w-px h-8 bg-gray-300" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowImageDialog(true)}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Select text first, then enter URL to create a link. Or enter URL to insert as clickable link.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={setLink}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="image-file">Upload Image</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                onClick={handleImageUpload}
                disabled={!imageFile || uploadingImage}
                className="mt-2 w-full"
              >
                {uploadingImage ? 'Uploading...' : 'Upload & Insert'}
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                onClick={handleImageUrlInsert}
                disabled={!imageUrl}
                className="mt-2 w-full"
                variant="outline"
              >
                Insert from URL
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
