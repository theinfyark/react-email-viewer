export { EmailViewer } from "./components/EmailViewer.js";
export {
  EmailHeader,
  EmailMetadata,
  EmailToolbar,
  EmailBody,
  EmailAttachmentList,
  AttachmentCard,
  EmailAddress,
  EmailDate,
  EmailPriority,
  EmailBadge,
} from "./components/index.js";

export {
  parseEmail,
  parseEml,
  parseMsg,
  resolveSourceToBytes,
  fetchUrlToBytes,
  detectFormat,
} from "./parse/index.js";
export type { ParseEmailOptions } from "./parse/index.js";

export { useEmail } from "./hooks/useEmail.js";
export { sanitizeHtml } from "./utils/sanitize-html.js";
export type { FetchUrlOptions } from "./parse/resolve-source.js";

export type {
  Theme,
  RenderMode,
  EmailFormat,
  EmailSource,
  EmailAddress as EmailAddressType,
  EmailAttachment,
  ParsedEmail,
  EmailViewerProps,
} from "./types.js";
