import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useCallback } from 'react';

interface FrontendRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const FrontendRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Enter text...',
  className = '',
  minHeight = '150px'
}: FrontendRichTextEditorProps) => {
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
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3 text-gray-700',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border-2 border-gray-300 rounded-lg bg-white overflow-hidden hover:border-[#f9dc24] focus-within:border-[#f9dc24] transition-colors ${className}`}>
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-[#f9dc24] text-black' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-[#f9dc24] text-black' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-[#f9dc24] text-black' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-[#f9dc24] text-black' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-[#f9dc24] text-black' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <div 
        className="resize-y overflow-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default FrontendRichTextEditor;
