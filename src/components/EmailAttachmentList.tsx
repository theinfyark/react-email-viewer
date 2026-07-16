import { useState } from "react";
import type { EmailAttachment } from "../types.js";
import { AttachmentCard } from "./AttachmentCard.js";

export interface EmailAttachmentListProps {
  attachments: EmailAttachment[];
  onDownload?: (attachment: EmailAttachment) => void;
}

export function EmailAttachmentList({
  attachments,
  onDownload,
}: EmailAttachmentListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const visible = attachments.filter((a) => !a.inline);

  if (!visible.length) return null;

  return (
    <section className="rev-attachments" aria-label="Attachments">
      <h3>Attachments ({visible.length})</h3>
      <div className="rev-att-grid">
        {visible.map((att) => (
          <AttachmentCard
            key={att.id}
            attachment={att}
            onDownload={onDownload}
            onPreview={(a) => {
              if (!a.content) return;
              const url = URL.createObjectURL(
                new Blob([Uint8Array.from(a.content)], { type: a.contentType }),
              );
              setPreviewUrl(url);
            }}
          />
        ))}
      </div>
      {previewUrl && (
        <div
          className="rev-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }}
        >
          {previewUrl.includes("pdf") || previewUrl ? (
            // Prefer image tag when possible; iframe for pdf/text blob urls
            previewUrl.match(/image|\.png|\.jpe?g|\.gif|\.webp/i) ? (
              <img src={previewUrl} alt="Attachment preview" />
            ) : (
              <iframe
                title="Attachment preview"
                src={previewUrl}
                style={{
                  width: "min(96vw, 1000px)",
                  height: "85vh",
                  background: "#fff",
                  border: 0,
                  borderRadius: 8,
                }}
              />
            )
          ) : null}
        </div>
      )}
    </section>
  );
}
