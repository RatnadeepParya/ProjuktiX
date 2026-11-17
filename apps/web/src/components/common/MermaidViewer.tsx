import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Copy, Check } from 'lucide-react';

interface MermaidViewerProps {
  id: string;
  definition: string;
  title?: string;
  description?: string;
  legend?: Array<{ key: string; label: string; color?: string }>;
}

export function MermaidViewer({ id, definition, title, description, legend }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#0ea5e9',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#38bdf8',
        lineColor: '#38bdf8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      },
      fontFamily: 'Inter, sans-serif',
      securityLevel: 'loose',
    });

    const renderDiagram = async () => {
      try {
        const uniqueId = `mermaid-${id.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.random().toString(36).substring(2, 7)}`;
        const { svg } = await mermaid.render(uniqueId, definition);
        setSvgContent(svg);
        setError(null);
      } catch (err) {
        console.warn('[Mermaid Render Warning]:', err);
        setError('Diagram definition rendering in progress or unsupported syntax');
      }
    };

    renderDiagram();
  }, [id, definition]);

  const handleCopy = () => {
    navigator.clipboard.writeText(definition);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-dark-border bg-dark-card/90 overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl bg-dark-bg' : 'my-6'
      }`}
    >
      {/* Diagram Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border/80 bg-dark-surface/40">
        <div>
          {title && <h4 className="text-sm font-semibold text-white">{title}</h4>}
          {description && <p className="text-xs text-dark-muted mt-0.5">{description}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-dark-surface"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-dark-surface"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-dark-surface"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-dark-surface"
            title="Copy Mermaid Syntax"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-dark-surface"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Diagram'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[300px] bg-dark-bg/60"
      >
        {error ? (
          <div className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
            {error}
          </div>
        ) : (
          <div
            className="transition-transform duration-150 ease-out flex justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Optional Architecture Legend */}
      {legend && legend.length > 0 && (
        <div className="px-4 py-2.5 border-t border-dark-border/60 bg-dark-surface/30 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">Legend:</span>
          {legend.map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color || '#38bdf8' }}
              />
              <span className="text-dark-muted text-[11px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
