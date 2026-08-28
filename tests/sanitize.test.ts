import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "../src/utils/sanitize-html.js";
import { fetchUrlToBytes } from "../src/parse/resolve-source.js";

describe("sanitizeHtml", () => {
  it("strips script tags and javascript URLs", () => {
    const dirty =
      `<p>hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/script/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).toContain("<p>hi</p>");
  });

  it("strips svg/onload, iframe, and unspaced event handlers", () => {
    const dirty =
      `<svg/onload=alert(1)><iframe src="https://evil.test"></iframe><img src=x onerror=alert(1)>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/svg/i);
    expect(clean).not.toMatch(/iframe/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).not.toMatch(/src="x"/);
  });

  it("keeps safe links and cid images", () => {
    const dirty = `<a href="https://example.com">ok</a><img src="cid:logo">`;
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('href="https://example.com"');
    expect(clean).toContain('src="cid:logo"');
  });

  it("blocks dangerous URI schemes including data: on links", () => {
    const dirty =
      `<a href="data:text/html,<script>alert(1)</script>">x</a><a href="blob:https://evil">y</a>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/data:/i);
    expect(clean).not.toMatch(/blob:/i);
    expect(clean).toContain("<a>x</a>");
  });
});

describe("fetchUrlToBytes", () => {
  it("rejects non-http schemes", async () => {
    await expect(fetchUrlToBytes("file:///etc/passwd")).rejects.toThrow(/http/i);
  });

  it("rejects private network hosts by default", async () => {
    await expect(fetchUrlToBytes("http://127.0.0.1/email.eml")).rejects.toThrow(
      /private/i,
    );
  });
});
