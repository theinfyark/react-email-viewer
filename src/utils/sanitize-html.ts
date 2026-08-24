const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

const ALLOWED_ATTR: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  table: new Set(["border", "cellpadding", "cellspacing"]),
};

const BLOCKED_TAGS =
  /<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|svg|math|video|audio|source|frame|frameset|applet)[\s\S]*?<\/\1\s*>/gi;

const BLOCKED_OPEN =
  /<(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|svg|math|video|audio|source|frame|frameset|applet)\b[^>]*>/gi;

function decodeAttr(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isSafeUrl(raw: string, kind: "href" | "src"): boolean {
  const value = decodeAttr(raw).trim().replace(/[\u0000-\u001f\s]/g, "");
  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("data:text")
  ) {
    return false;
  }
  if (kind === "src") {
    return /^(https?:\/\/|cid:|data:image\/(?:png|jpe?g|gif|webp|bmp);base64,)/i.test(
      value,
    );
  }
  return /^(https?:\/\/|mailto:|cid:|#)/i.test(value);
}

/**
 * Allowlist sanitizer for untrusted email HTML.
 * Strips scripts, event handlers, SVG/iframe/object, and unsafe URLs.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const input = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(BLOCKED_TAGS, "")
    .replace(BLOCKED_OPEN, "");

  return input.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b([^>]*)>/g,
    (full, rawName: string, rawAttrs: string) => {
      const closing = full.startsWith("</");
      const name = rawName.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (closing) return `</${name}>`;

      const allowed = ALLOWED_ATTR[name] ?? new Set<string>();
      const attrs: string[] = [];
      const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
      let match: RegExpExecArray | null;
      while ((match = attrRe.exec(rawAttrs))) {
        const attrName = match[1]!.toLowerCase().replace(/^\/+/, "");
        if (attrName.startsWith("on") || attrName === "style" || attrName === "srcset") {
          continue;
        }
        if (!allowed.has(attrName)) continue;
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (
          (attrName === "href" || attrName === "src") &&
          !isSafeUrl(value, attrName)
        ) {
          continue;
        }
        attrs.push(`${attrName}="${value.replace(/"/g, "&quot;")}"`);
      }

      const slash = VOID_TAGS.has(name) ? " /" : "";
      return `<${name}${attrs.length ? ` ${attrs.join(" ")}` : ""}${slash}>`;
    },
  );
}
