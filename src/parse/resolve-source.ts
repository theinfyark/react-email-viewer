import type { EmailSource } from "../types.js";

function isBase64(value: string): boolean {
  if (value.startsWith("data:") && value.includes(";base64,")) return true;
  // Prefer MIME/email text over opportunistic base64 detection
  if (/^(from|to|subject|date|mime-version)\s*:/im.test(value)) return false;
  const trimmed = value.replace(/\s+/g, "");
  if (trimmed.length < 64 || trimmed.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+=*$/.test(trimmed);
}

function decodeBase64(value: string): Uint8Array {
  const cleaned = value.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
  if (typeof atob === "function") {
    const bin = atob(cleaned);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }
  // Node
  return new Uint8Array(Buffer.from(cleaned, "base64"));
}

export async function resolveSourceToBytes(
  source: EmailSource,
): Promise<Uint8Array> {
  if (source instanceof Response) {
    const buf = await source.arrayBuffer();
    return new Uint8Array(buf);
  }

  if (typeof Blob !== "undefined" && source instanceof Blob) {
    const buf = await source.arrayBuffer();
    return new Uint8Array(buf);
  }

  if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }

  if (ArrayBuffer.isView(source)) {
    return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  }

  if (typeof source === "string") {
    if (isBase64(source) || source.startsWith("data:")) {
      return decodeBase64(source);
    }
    // Treat as binary / utf-8 text (EML is often UTF-8 text)
    const encoder = new TextEncoder();
    return encoder.encode(source);
  }

  throw new Error("Unsupported email source type");
}

export async function fetchUrlToBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch email: HTTP ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export function detectFormat(
  bytes: Uint8Array,
  hint?: "eml" | "msg" | "auto",
  filename?: string,
): "eml" | "msg" {
  if (hint === "eml" || hint === "msg") return hint;
  const lower = filename?.toLowerCase() ?? "";
  if (lower.endsWith(".msg")) return "msg";
  if (lower.endsWith(".eml")) return "eml";

  // MSG files are OLE compound documents; magic often starts with D0 CF 11 E0
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  ) {
    return "msg";
  }
  return "eml";
}
