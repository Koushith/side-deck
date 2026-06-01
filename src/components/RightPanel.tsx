import { useState } from 'react';
import { PanelRightClose, PanelRightOpen, Link2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectionsPanel } from './ConnectionsPanel';
import { AssistantPanel } from './AssistantPanel';

type Tab = 'connections' | 'assistant';

const COLLAPSED_KEY = 'side.rightpanel.collapsed';
const TAB_KEY = 'side.rightpanel.tab';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}
function readTab(): Tab {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return v === 'assistant' ? 'assistant' : 'connections';
  } catch {
    return 'connections';
  }
}

export function RightPanel() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [tab, setTab] = useState<Tab>(readTab);

  const toggleCollapsed = () => {
    const next = !collapsed;
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
    setCollapsed(next);
  };

  const pickTab = (t: Tab) => {
    setTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* ignore */
    }
  };

  if (collapsed) {
    return (
      <aside className="w-9 shrink-0 border-l border-border bg-bg-elevated flex flex-col items-center pt-3 gap-2">
        <button
          onClick={toggleCollapsed}
          title="Expand panel"
          className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
        >
          <PanelRightOpen size={14} />
        </button>
        <button
          onClick={() => {
            pickTab('connections');
            toggleCollapsed();
          }}
          title="Connections"
          className={cn(
            'p-1.5 rounded-md transition-colors',
            tab === 'connections'
              ? 'text-text bg-bg-hover'
              : 'text-text-muted hover:text-text hover:bg-bg-hover'
          )}
        >
          <Link2 size={13} />
        </button>
        <button
          onClick={() => {
            pickTab('assistant');
            toggleCollapsed();
          }}
          title="Assistant"
          className={cn(
            'p-1.5 rounded-md transition-colors',
            tab === 'assistant'
              ? 'text-text bg-bg-hover'
              : 'text-text-muted hover:text-text hover:bg-bg-hover'
          )}
        >
          <Bot size={13} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] shrink-0 border-l border-border bg-bg-elevated overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-2 pt-2 border-b border-border-subtle">
        <div className="flex items-center gap-0.5">
          <TabButton
            label="Connections"
            icon={<Link2 size={12} />}
            active={tab === 'connections'}
            onClick={() => pickTab('connections')}
          />
          <TabButton
            label="Assistant"
            icon={<Bot size={12} />}
            active={tab === 'assistant'}
            onClick={() => pickTab('assistant')}
          />
        </div>
        <button
          onClick={toggleCollapsed}
          title="Collapse panel"
          className="p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
        >
          <PanelRightClose size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'connections' ? <ConnectionsPanel /> : <AssistantPanel />}
      </div>
    </aside>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-medium border-b-2 -mb-px transition-colors',
        active
          ? 'border-accent text-text'
          : 'border-transparent text-text-muted hover:text-text'
      )}
    >
      <span className={active ? 'text-accent-ink' : 'text-text-subtle'}>{icon}</span>
      {label}
    </button>
  );
}
