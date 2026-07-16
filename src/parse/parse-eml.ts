import PostalMime from "postal-mime";
import type {
  EmailAddress,
  EmailAttachment,
  ParsedEmail,
} from "../types.js";

function getPostalMime() {
  const mod = PostalMime as unknown as {
    default?: typeof PostalMime;
  };
  return (mod.default ?? PostalMime) as typeof PostalMime;
}

function toAddress(input: {
  name?: string;
  address?: string;
} | null | undefined): EmailAddress | null {
  if (!input?.address) return null;
  return {
    name: input.name || undefined,
    address: input.address,
  };
}

function toAddresses(
  list:
    | Array<{ name?: string; address?: string }>
    | { name?: string; address?: string }
    | undefined
    | null,
): EmailAddress[] {
  if (!list) return [];
  const arr = Array.isArray(list) ? list : [list];
  return arr
    .map((a) => toAddress(a))
    .filter((a): a is EmailAddress => Boolean(a));
}

function priorityFromHeaders(
  headers: Record<string, string>,
): ParsedEmail["priority"] {
  const raw =
    headers["x-priority"] ||
    headers["importance"] ||
    headers["priority"] ||
    "";
  const v = raw.toLowerCase();
  if (v.includes("high") || v === "1" || v === "2") return "high";
  if (v.includes("low") || v === "4" || v === "5") return "low";
  return "normal";
}

export async function parseEml(bytes: Uint8Array): Promise<ParsedEmail> {
  const PM = getPostalMime();
  const copy = Uint8Array.from(bytes);
  const mail = await PM.parse(copy.buffer);

  const headers: Record<string, string> = {};
  for (const h of mail.headers ?? []) {
    if (h.key && h.value) {
      headers[String(h.key).toLowerCase()] = String(h.value);
    }
  }

  const attachments: EmailAttachment[] = (mail.attachments ?? []).map(
    (att, index) => {
      const content =
        att.content instanceof Uint8Array
          ? att.content
          : att.content
            ? new Uint8Array(att.content as ArrayBuffer)
            : undefined;
      return {
        id: att.contentId || `att-${index}`,
        filename: att.filename || `attachment-${index + 1}`,
        contentType: att.mimeType || "application/octet-stream",
        size: content?.byteLength ?? 0,
        contentId: att.contentId,
        inline: Boolean(att.disposition === "inline" || att.contentId),
        content,
      };
    },
  );

  let html = mail.html || undefined;
  if (html) {
    for (const att of attachments) {
      if (!att.contentId || !att.content) continue;
      const cid = att.contentId.replace(/^<|>$/g, "");
      const b64 = bytesToBase64(att.content);
      const dataUrl = `data:${att.contentType};base64,${b64}`;
      html = html.replace(
        new RegExp(`cid:${cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi"),
        dataUrl,
      );
    }
  }

  const replyToRaw = mail.replyTo as
    | { name?: string; address?: string }
    | Array<{ name?: string; address?: string }>
    | undefined;

  return {
    format: "eml",
    subject: mail.subject || "(no subject)",
    from: toAddresses(mail.from),
    to: toAddresses(mail.to),
    cc: toAddresses(mail.cc),
    bcc: toAddresses(mail.bcc),
    replyTo: toAddresses(replyToRaw),
    date: mail.date ? new Date(mail.date) : undefined,
    priority: priorityFromHeaders(headers),
    importance: headers.importance,
    categories: (headers.keywords || headers.categories || "")
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean),
    headers,
    html,
    text: mail.text || undefined,
    attachments,
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  if (typeof btoa === "function") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}
