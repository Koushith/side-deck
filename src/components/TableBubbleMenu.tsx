import { BubbleMenu, type Editor } from '@tiptap/react';
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Rows3,
  Columns3,
  Heading,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  editor: Editor;
}

export function TableBubbleMenu({ editor }: Props) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      tippyOptions={{
        duration: 100,
        animation: 'shift-away',
        placement: 'top',
        offset: [0, 10],
      }}
      shouldShow={({ editor, from, to }) => editor.isActive('table') && from === to}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-bg-elevated shadow-2xl px-1 py-1"
    >
      <Btn
        title="Add row above"
        onClick={() => editor.chain().focus().addRowBefore().run()}
      >
        <ArrowUpToLine size={14} />
      </Btn>
      <Btn
        title="Add row below"
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <ArrowDownToLine size={14} />
      </Btn>
      <Btn
        title="Delete row"
        onClick={() => editor.chain().focus().deleteRow().run()}
      >
        <Rows3 size={14} />
      </Btn>
      <Sep />
      <Btn
        title="Add column left"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        <ArrowLeftToLine size={14} />
      </Btn>
      <Btn
        title="Add column right"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <ArrowRightToLine size={14} />
      </Btn>
      <Btn
        title="Delete column"
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        <Columns3 size={14} />
      </Btn>
      <Sep />
      <Btn
        title="Toggle header row"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        <Heading size={14} />
      </Btn>
      <Btn
        title="Delete table"
        onClick={() => editor.chain().focus().deleteTable().run()}
        danger
      >
        <Trash2 size={14} />
      </Btn>
    </BubbleMenu>
  );
}

function Btn({
  title,
  onClick,
  children,
  danger,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors text-text-muted hover:text-text hover:bg-bg-hover',
        danger && 'hover:text-red-500'
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}
