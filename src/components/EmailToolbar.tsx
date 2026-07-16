export interface EmailToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleTheme: () => void;
  onToggleHeaders: () => void;
  onCopyHeaders: () => void;
  onCopyEmail: () => void;
  onPrint: () => void;
  onDownload: () => void;
  themeLabel: string;
  disabled?: boolean;
}

export function EmailToolbar({
  search,
  onSearchChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleTheme,
  onToggleHeaders,
  onCopyHeaders,
  onCopyEmail,
  onPrint,
  onDownload,
  themeLabel,
  disabled,
}: EmailToolbarProps) {
  return (
    <div className="rev-toolbar" role="toolbar" aria-label="Email toolbar">
      <input
        type="search"
        placeholder="Search subject, sender, body…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search email"
        disabled={disabled}
      />
      <button type="button" className="rev-btn" onClick={onZoomOut} disabled={disabled} aria-label="Zoom out">
        −
      </button>
      <button type="button" className="rev-btn" onClick={onZoomReset} disabled={disabled} aria-label="Reset zoom">
        {zoom}%
      </button>
      <button type="button" className="rev-btn" onClick={onZoomIn} disabled={disabled} aria-label="Zoom in">
        +
      </button>
      <button type="button" className="rev-btn" onClick={onToggleTheme} disabled={disabled}>
        {themeLabel}
      </button>
      <button type="button" className="rev-btn" onClick={onToggleHeaders} disabled={disabled}>
        Headers
      </button>
      <button type="button" className="rev-btn" onClick={onCopyHeaders} disabled={disabled}>
        Copy headers
      </button>
      <button type="button" className="rev-btn" onClick={onCopyEmail} disabled={disabled}>
        Copy
      </button>
      <button type="button" className="rev-btn" onClick={onPrint} disabled={disabled}>
        Print
      </button>
      <button type="button" className="rev-btn" onClick={onDownload} disabled={disabled}>
        Download
      </button>
    </div>
  );
}
