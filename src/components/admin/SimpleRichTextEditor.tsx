import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, UnderlineIcon, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { LinkEditorDialog } from '@/components/frontend-edit/LinkEditorDialog';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  storageKey?: string;
}

// Utility functions for persisting editor size
const getEditorSize = (key: string): number | null => {
  if (!key) return null;
  const stored = localStorage.getItem(`editor-size-${key}`);
  return stored ? parseInt(stored, 10) : null;
};

const saveEditorSize = (key: string, height: number) => {
  if (!key) return;
  localStorage.setItem(`editor-size-${key}`, height.toString());
};

export const SimpleRichTextEditor = ({ value, onChange, placeholder, storageKey }: SimpleRichTextEditorProps) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#2563eb] underline hover:text-[#1d4ed8]',
        },
      }),
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[100px] p-3',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setCurrentLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback((url: string) => {
    if (!editor) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    editor.chain().focus().extendMarkRange('link').setLink({ 
      href: url,
      target: isExternal ? '_blank' : null,
      rel: isExternal ? 'noopener noreferrer' : null
    }).run();
  }, [editor]);

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const savedHeight = storageKey ? getEditorSize(storageKey) : null;

  return (
    <div className="border-2 border-gray-600 rounded-md bg-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-gray-600 bg-gray-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Fett (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Kursiv (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Unterstrichen (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Aufzählung"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openLinkDialog}
          className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
          title="Link einfügen"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <LinkEditorDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          currentUrl={currentLinkUrl}
          onSubmit={handleLinkSubmit}
          onRemove={handleLinkRemove}
        />
      </div>
      
      {/* Editor */}
      <div 
        className="resize-y overflow-auto text-white"
        style={{ 
          minHeight: '120px',
          height: savedHeight ? `${savedHeight}px` : '150px'
        }}
        onMouseUp={(e) => {
          if (storageKey) {
            const target = e.currentTarget;
            saveEditorSize(storageKey, target.offsetHeight);
          }
        }}
      >
        <EditorContent editor={editor} />
        {!value && placeholder && (
          <div className="absolute top-0 left-0 p-3 text-gray-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
