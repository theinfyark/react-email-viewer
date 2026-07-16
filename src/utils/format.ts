export function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatEmailDate(date?: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function attachmentIcon(contentType: string, filename: string): string {
  const type = contentType.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (
    type.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)
  )
    return '🖼';
  if (type.includes('pdf') || ext === 'pdf') return '📄';
  if (type.includes('zip') || ['zip', 'rar', '7z'].includes(ext)) return '🗜';
  if (
    type.includes('sheet') ||
    type.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  )
    return '📊';
  if (type.includes('word') || ['doc', 'docx'].includes(ext)) return '📝';
  if (type.includes('presentation') || ['ppt', 'pptx'].includes(ext))
    return '📑';
  if (type.startsWith('text/') || ext === 'txt') return '📃';
  return '📎';
}

export function downloadBytes(
  filename: string,
  bytes: Uint8Array,
  type: string,
) {
  const blob = new Blob([Uint8Array.from(bytes)], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const re = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(re, '<mark class="rev-mark">$1</mark>');
}

export function resolveTheme(
  theme: 'light' | 'dark' | 'auto',
): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}
