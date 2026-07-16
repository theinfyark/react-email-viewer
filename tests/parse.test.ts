import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectFormat,
  parseEml,
  resolveSourceToBytes,
} from "../src/parse/index.js";

const emlPath = join(dirname(fileURLToPath(import.meta.url)), "fixtures/sample.eml");
const emlText = readFileSync(emlPath, "utf8");

describe("resolveSourceToBytes", () => {
  it("encodes utf-8 strings", async () => {
    const bytes = await resolveSourceToBytes("hello");
    expect(new TextDecoder().decode(bytes)).toBe("hello");
  });

  it("decodes base64", async () => {
    const bytes = await resolveSourceToBytes(
      `data:text/plain;base64,${btoa("hello")}`,
    );
    expect(new TextDecoder().decode(bytes)).toBe("hello");
  });

  it("accepts Uint8Array", async () => {
    const input = new TextEncoder().encode("abc");
    const bytes = await resolveSourceToBytes(input);
    expect(Array.from(bytes)).toEqual(Array.from(input));
  });
});

describe("detectFormat", () => {
  it("detects eml by default", () => {
    const bytes = new TextEncoder().encode(emlText);
    expect(detectFormat(bytes)).toBe("eml");
  });

  it("detects msg magic", () => {
    const bytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]);
    expect(detectFormat(bytes)).toBe("msg");
  });
});

describe("parseEml", () => {
  it("parses subject, addresses, html, attachments", async () => {
    const bytes = new TextEncoder().encode(emlText);
    const email = await parseEml(bytes);
    expect(email.subject).toBe("Hello from react-email-viewer");
    expect(email.from[0]?.address).toBe("alice@example.com");
    expect(email.to[0]?.address).toBe("bob@example.com");
    expect(email.cc[0]?.address).toBe("carol@example.com");
    expect(email.html).toContain("Hello Bob");
    expect(email.text).toContain("plain text body");
    expect(email.priority).toBe("high");
    expect(email.attachments.length).toBeGreaterThanOrEqual(1);
    expect(email.html).toContain("data:image/png;base64,");
  });
});
