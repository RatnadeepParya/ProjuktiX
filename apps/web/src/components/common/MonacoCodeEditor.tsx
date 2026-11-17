import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext.js';
import { Copy, Check } from 'lucide-react';

interface MonacoCodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  title?: string;
}

export function MonacoCodeEditor({
  value,
  onChange,
  language = 'sql',
  height = '320px',
  readOnly = false,
  title,
}: MonacoCodeEditorProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-dark-border bg-dark-card overflow-hidden shadow-xl my-4">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border/80 bg-dark-surface/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          {title && <span className="text-xs font-mono text-dark-muted ml-2">{title}</span>}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-cyber-400">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 text-dark-muted hover:text-white rounded hover:bg-dark-surface transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ height }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
