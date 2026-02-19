import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';
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
  mentionOptions?: string[];
  onObjectClick?: (objectName: string) => void;
}

export const TiptapEditor = ({
  content,
  onChange,
  placeholder = 'Enter content...',
  minHeight = '240px',
  mentionOptions = [],
  onObjectClick,
}: TiptapEditorProps) => {
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [hoveredMentionOption, setHoveredMentionOption] = useState<string | null>(null);
  const mentionRangeRef = useRef<{ from: number; to: number } | null>(null);
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
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[240px] p-3',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Escape') {
          setShowMentionMenu(false);
          mentionRangeRef.current = null;
        }
        return false;
      },
      handleClick: (_view, _pos, event) => {
        const rawTarget = event.target as Node | null;
        const elementTarget =
          rawTarget instanceof HTMLElement
            ? rawTarget
            : rawTarget instanceof Text
              ? rawTarget.parentElement
              : null;
        const underlined = elementTarget?.closest('u');
        if (underlined?.textContent?.trim()) {
          onObjectClick?.(underlined.textContent.trim());
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      const { from } = editor.state.selection;
      const { $from } = editor.state.selection;
      const parentTextBeforeCursor = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n');
      const atMatch = /@([\w\s-]*)$/.exec(parentTextBeforeCursor);
      const hasAtTrigger = !!atMatch;
      if (hasAtTrigger && atMatch) {
        const atIndexInParent = parentTextBeforeCursor.lastIndexOf('@');
        const triggerFrom = from - ($from.parentOffset - atIndexInParent);
        mentionRangeRef.current = { from: triggerFrom, to: from };
      } else {
        mentionRangeRef.current = null;
      }

      setShowMentionMenu(hasAtTrigger && mentionOptions.length > 0);
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
    <div className="bg-input-background relative">
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
      <div className="relative border border-border rounded-md" style={{ minHeight }}>
        <EditorContent editor={editor} />
        {showMentionMenu && (
          <div
            className="absolute left-3 top-3 z-20 w-[220px] bg-[#222529] border border-[#6e757c] rounded-md shadow-lg overflow-hidden"
            style={{ transform: 'translateY(-120px)' }}
          >
            {mentionOptions.slice(0, 3).map((option) => (
              <button
                key={option}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (editor) {
                    const fallbackPos = editor.state.selection.from;
                    const insertRange = mentionRangeRef.current ?? { from: fallbackPos, to: fallbackPos };
                    const inserted = editor
                      .chain()
                      .focus()
                      .insertContentAt(insertRange, [
                        {
                          type: 'text',
                          text: option,
                          marks: [{ type: 'underline' }],
                        },
                        { type: 'text', text: ' ' },
                      ])
                      .run();
                    if (!inserted) {
                      // Fallback to plain insertion if underline insertion is rejected.
                      editor.chain().focus().insertContent(`${option} `).run();
                    }
                  }
                  mentionRangeRef.current = null;
                  setShowMentionMenu(false);
                }}
                onMouseEnter={() => setHoveredMentionOption(option)}
                onMouseLeave={() => setHoveredMentionOption(null)}
                className="w-full text-left px-3 py-2 caption transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: hoveredMentionOption === option ? '#172554' : 'transparent',
                  color: '#ffffff'
                }}
              >
                <span
                  className="caption px-2 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: '#EAB30820',
                    color: '#EAB308',
                    border: '1px solid #EAB30860'
                  }}
                >
                  Resource
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
