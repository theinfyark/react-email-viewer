import type { CSSProperties } from "react";

export type Theme = "light" | "dark" | "auto";

export type RenderMode = "html" | "text" | "auto";

export type EmailFormat = "eml" | "msg" | "auto";

export type EmailSource =
  | string
  | Blob
  | File
  | ArrayBuffer
  | Uint8Array
  | Response
  | ArrayBufferView;

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  inline?: boolean;
  /** Raw bytes for download / preview */
  content?: Uint8Array;
  /** Object URL when available (revoked by consumer/helper) */
  url?: string;
}

export interface ParsedEmail {
  format: "eml" | "msg";
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];
  date?: Date;
  priority?: "high" | "normal" | "low";
  importance?: string;
  categories: string[];
  headers: Record<string, string>;
  html?: string;
  text?: string;
  attachments: EmailAttachment[];
}

export interface EmailViewerProps {
  /** Email payload (Base64, binary string, Blob, File, ArrayBuffer, Uint8Array, Response) */
  source?: EmailSource | null;
  /** Fetch email from URL (GET). Ignored when `source` is set. */
  url?: string;
  /** Force format detection. Default: auto */
  format?: EmailFormat;
  theme?: Theme;
  /** Prefer html / text / auto body. Default: auto */
  renderMode?: RenderMode;
  className?: string;
  style?: CSSProperties;
  /** Show toolbar. Default: true */
  showToolbar?: boolean;
  /** Show attachment list. Default: true */
  showAttachments?: boolean;
  /** Allow external images in HTML. Default: false (safer for untrusted mail) */
  allowExternalImages?: boolean;
  /** Initial zoom percent. Default: 100 */
  zoom?: number;
  /** Called when parsing finishes */
  onLoad?: (email: ParsedEmail) => void;
  /** Called on parse / fetch errors */
  onError?: (error: Error) => void;
  /** Called when an attachment is downloaded */
  onDownloadAttachment?: (attachment: EmailAttachment) => void;
  /** Custom empty state */
  emptyLabel?: string;
  /** Custom loading label */
  loadingLabel?: string;
  /** Hide BCC in header. Default: false */
  hideBcc?: boolean;
}

export type { EmailViewerProps as EmailViewerComponentProps };
