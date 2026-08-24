import { useMemo, useState } from "react";
import type { ParsedEmail, RenderMode } from "../types.js";
import { highlightText } from "../utils/format.js";
import { sanitizeHtml } from "../utils/sanitize-html.js";

export interface EmailBodyProps {
  email: ParsedEmail;
  renderMode?: RenderMode;
  zoom?: number;
  searchQuery?: string;
  allowExternalImages?: boolean;
}

export function EmailBody({
  email,
  renderMode = "auto",
  zoom = 100,
  searchQuery = "",
  allowExternalImages = false,
}: EmailBodyProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const mode =
    renderMode === "auto"
      ? email.html
        ? "html"
        : "text"
      : renderMode;

  const html = useMemo(() => {
    if (!email.html) return "";
    let value = email.html;
    if (!allowExternalImages) {
      value = value.replace(
        /<img\b[^>]*\bsrc=["']https?:\/\/[^"']+["'][^>]*>/gi,
        '<span class="rev-blocked-image">[external image blocked]</span>',
      );
    }
    if (searchQuery.trim()) {
      // naive highlight in text nodes only is hard; highlight plain overlaps
      value = value.replace(
        new RegExp(
          `(>${"[^<]*"})`,
          "gi",
        ),
        (m) => m, // keep structure; highlight applied to text mode primarily
      );
    }
    return value;
  }, [email.html, allowExternalImages, searchQuery]);

  const text = useMemo(() => {
    const raw = email.text || stripHtml(email.html || "");
    return searchQuery ? highlightText(escapeHtml(raw), searchQuery) : escapeHtml(raw);
  }, [email.text, email.html, searchQuery]);

  return (
    <div className="rev-body-wrap">
      {mode === "html" && email.html ? (
        <div
          className="rev-body-html"
          style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}
          // Email HTML is untrusted; allowlist-sanitized before render
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
          onClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.tagName === "IMG") {
              const src = (t as HTMLImageElement).currentSrc || (t as HTMLImageElement).src;
              if (src) setLightbox(src);
            }
          }}
        />
      ) : (
        <pre
          className="rev-body-text"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}

      {lightbox && (
        <div
          className="rev-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightbox(null);
          }}
        >
          <img src={lightbox} alt="Full size attachment preview" />
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
