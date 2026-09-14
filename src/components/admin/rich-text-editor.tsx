'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Kolom deskripsi_*/silabus_*/konten_* (ENGINEERING §5.8) — ekstensi dibatasi ke
// heading/bold/italic/bullet/ordered/link. StarterKit v3 sudah membundel semuanya
// termasuk Link, jadi tinggal matikan yang tidak dipakai.
function ToolbarButton({
  aktif,
  onClick,
  label,
  children,
}: {
  aktif: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-md',
        aktif ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: { openOnClick: false },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const url = window.prompt('URL tautan:');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-1">
        <ToolbarButton
          label="Heading"
          aktif={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Tebal"
          aktif={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Miring"
          aktif={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Daftar bertitik"
          aktif={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Daftar bernomor"
          aktif={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Tautan" aktif={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose-sm max-w-none px-3 py-2 text-sm text-foreground [&_.ProseMirror]:min-h-24 [&_.ProseMirror]:outline-none [&_a]:text-primary [&_a]:underline [&_h2]:text-base [&_h2]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}
