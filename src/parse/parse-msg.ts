import MsgReader from "@kenjiuno/msgreader";
import type {
  EmailAddress,
  EmailAttachment,
  ParsedEmail,
} from "../types.js";

function parseAddressList(raw?: string): EmailAddress[] {
  if (!raw?.trim()) return [];
  // "Name <email@x.com>, Other <o@y.com>" or plain emails
  return raw.split(/[,;]/).map((part) => {
    const trimmed = part.trim();
    const m = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
    if (m) {
      return {
        name: m[1]?.replace(/^"|"$/g, "").trim() || undefined,
        address: m[2]!.trim(),
      };
    }
    return { address: trimmed };
  }).filter((a) => a.address);
}

export async function parseMsg(bytes: Uint8Array): Promise<ParsedEmail> {
  // MsgReader expects ArrayBuffer
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  const reader = new MsgReader(buffer);
  const data = reader.getFileData() as {
    subject?: string;
    senderName?: string;
    senderEmail?: string;
    recipients?: Array<{ name?: string; email?: string; recipType?: number }>;
    body?: string;
    bodyHtml?: string;
    headers?: string;
    messageDeliveryTime?: string | Date;
    clientSubmitTime?: string | Date;
    importance?: number;
    attachments?: Array<{
      fileName?: string;
      fileNameShort?: string;
      mimeType?: string;
      contentLength?: number;
      pidContentId?: string;
      attachmentData?: Uint8Array | ArrayBuffer;
      dataId?: number;
    }>;
  };

  const from: EmailAddress[] = [];
  if (data.senderEmail || data.senderName) {
    from.push({
      name: data.senderName,
      address: data.senderEmail || data.senderName || "unknown",
    });
  }

  const to: EmailAddress[] = [];
  const cc: EmailAddress[] = [];
  const bcc: EmailAddress[] = [];
  for (const r of data.recipients ?? []) {
    const addr = {
      name: r.name,
      address: r.email || r.name || "unknown",
    };
    // recipType: 1=to, 2=cc, 3=bcc (common MSG convention)
    if (r.recipType === 2) cc.push(addr);
    else if (r.recipType === 3) bcc.push(addr);
    else to.push(addr);
  }

  const headers: Record<string, string> = {};
  if (typeof data.headers === "string") {
    for (const line of data.headers.split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim().toLowerCase();
        const value = line.slice(idx + 1).trim();
        if (key) headers[key] = value;
      }
    }
  }

  const attachments: EmailAttachment[] = [];
  for (const [index, att] of (data.attachments ?? []).entries()) {
    let content: Uint8Array | undefined;
    try {
      if (att.dataId != null) {
        const extracted = reader.getAttachment(att as never) as {
          fileName?: string;
          content?: Uint8Array | ArrayBuffer;
        };
        if (extracted?.content) {
          content =
            extracted.content instanceof Uint8Array
              ? extracted.content
              : new Uint8Array(extracted.content);
        }
      } else if (att.attachmentData) {
        content =
          att.attachmentData instanceof Uint8Array
            ? att.attachmentData
            : new Uint8Array(att.attachmentData);
      }
    } catch {
      content = undefined;
    }

    attachments.push({
      id: att.pidContentId || `msg-att-${index}`,
      filename: att.fileName || att.fileNameShort || `attachment-${index + 1}`,
      contentType: att.mimeType || guessMime(att.fileName || ""),
      size: content?.byteLength ?? att.contentLength ?? 0,
      contentId: att.pidContentId,
      inline: Boolean(att.pidContentId),
      content,
    });
  }

  let html = data.bodyHtml || undefined;
  if (html) {
    for (const att of attachments) {
      if (!att.contentId || !att.content) continue;
      const cid = att.contentId.replace(/^<|>$/g, "");
      const b64 = uint8ToBase64(att.content);
      const dataUrl = `data:${att.contentType};base64,${b64}`;
      html = html.replace(
        new RegExp(`cid:${cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi"),
        dataUrl,
      );
    }
  }

  const dateRaw = data.messageDeliveryTime || data.clientSubmitTime;
  const importance =
    data.importance === 2 ? "high" : data.importance === 0 ? "low" : "normal";

  return {
    format: "msg",
    subject: data.subject || "(no subject)",
    from,
    to: to.length ? to : parseAddressList(headers.to),
    cc: cc.length ? cc : parseAddressList(headers.cc),
    bcc: bcc.length ? bcc : parseAddressList(headers.bcc),
    replyTo: parseAddressList(headers["reply-to"]),
    date: dateRaw ? new Date(dateRaw) : undefined,
    priority: importance,
    importance,
    categories: [],
    headers,
    html,
    text: data.body || undefined,
    attachments,
  };
}

function guessMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    txt: "text/plain",
    eml: "message/rfc822",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  if (typeof btoa === "function") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}
