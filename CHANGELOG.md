# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-24

### Security

- Replaced the regex HTML sanitizer with an allowlist sanitizer (`sanitizeHtml`) that strips script/svg/iframe/object, event handlers, and unsafe URLs.
- `allowExternalImages` now defaults to `false`.
- `fetchUrlToBytes()` allows only `http:`/`https:`, blocks private/loopback hosts by default, and refuses redirects.

### Added

- Exported `sanitizeHtml` and `FetchUrlOptions` (`allowedHosts`, `allowPrivateNetwork`, `timeoutMs`).

## [1.0.1] - 2026-07-16

### Changed

- Improved npm keywords for better discoverability

## [1.0.0] - 2026-07-16

### Added

- `EmailViewer` React component for `.eml` and `.msg`
- Input sources: Base64, binary string, Blob, File, ArrayBuffer, Uint8Array, Response, URL
- Header, toolbar, body, attachments, themes (light/dark/auto)
- CID / inline image rewriting to data URLs
- Search with highlight, zoom, print, copy, download
- Dual ESM + CJS + TypeScript declarations
- CSS variables for theming (`react-email-viewer/styles.css`)
