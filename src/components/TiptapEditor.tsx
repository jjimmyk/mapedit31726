import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Highlighter,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const TiptapEditor = ({
  content,
  onChange,
  placeholder = 'Enter content...',
  minHeight = '240px',
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[240px] p-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-input-background">
      {/* Toolbar */}
      <div className="p-2 flex flex-wrap gap-1" style={{ marginBottom: '10px' }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted/30 transition-colors ${
            editor.isActive('bold') ? 'bg-accent text-accent-foreground' : 'text-white'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted/30 transition-colors ${
            editor.isActive('italic') ? 'bg-accent text-accent-foreground' : 'text-white'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#2a5fa4' }).run()}
          className={`p-1.5 rounded hover:bg-muted/30 transition-colors ${
            editor.isActive('highlight') ? 'bg-accent text-accent-foreground' : 'text-white'
          }`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="border border-border rounded-md" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
