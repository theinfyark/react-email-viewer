import type { EmailFormat, EmailSource, ParsedEmail } from "../types.js";
import {
  detectFormat,
  fetchUrlToBytes,
  resolveSourceToBytes,
  type FetchUrlOptions,
} from "./resolve-source.js";
import { parseEml } from "./parse-eml.js";
import { parseMsg } from "./parse-msg.js";

export interface ParseEmailOptions {
  source?: EmailSource | null;
  url?: string;
  format?: EmailFormat;
  filename?: string;
  fetch?: FetchUrlOptions;
}

export async function parseEmail(
  options: ParseEmailOptions,
): Promise<ParsedEmail> {
  let bytes: Uint8Array;
  let filename = options.filename;

  if (options.source != null) {
    if (typeof File !== "undefined" && options.source instanceof File) {
      filename = filename || options.source.name;
    }
    bytes = await resolveSourceToBytes(options.source);
  } else if (options.url) {
    bytes = await fetchUrlToBytes(options.url, options.fetch);
  } else {
    throw new Error("Provide either `source` or `url`");
  }

  const format = detectFormat(bytes, options.format ?? "auto", filename);
  if (format === "msg") return parseMsg(bytes);
  return parseEml(bytes);
}

export {
  parseEml,
  parseMsg,
  resolveSourceToBytes,
  fetchUrlToBytes,
  detectFormat,
};
export type { FetchUrlOptions };
