import type { EmailAttachment } from "../types.js";
import { attachmentIcon, downloadBytes, formatBytes } from "../utils/format.js";

export interface AttachmentCardProps {
  attachment: EmailAttachment;
  onDownload?: (attachment: EmailAttachment) => void;
  onPreview?: (attachment: EmailAttachment) => void;
}

export function AttachmentCard({
  attachment,
  onDownload,
  onPreview,
}: AttachmentCardProps) {
  const canPreview =
    attachment.contentType.startsWith("image/") ||
    attachment.contentType === "application/pdf" ||
    attachment.contentType.startsWith("text/");

  return (
    <article className="rev-att-card">
      <div className="rev-att-icon" aria-hidden>
        {attachmentIcon(attachment.contentType, attachment.filename)}
      </div>
      <div className="rev-att-meta">
        <div className="rev-att-name" title={attachment.filename}>
          {attachment.filename}
        </div>
        <div className="rev-att-sub">
          {formatBytes(attachment.size)} · {attachment.contentType}
        </div>
      </div>
      {canPreview && attachment.content && (
        <button
          type="button"
          className="rev-btn"
          onClick={() => onPreview?.(attachment)}
        >
          Preview
        </button>
      )}
      <button
        type="button"
        className="rev-btn"
        onClick={() => {
          if (attachment.content) {
            downloadBytes(
              attachment.filename,
              attachment.content,
              attachment.contentType,
            );
          }
          onDownload?.(attachment);
        }}
        disabled={!attachment.content}
      >
        Download
      </button>
    </article>
  );
}
