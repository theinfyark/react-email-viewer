# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-16

### Added

- `EmailViewer` React component for `.eml` and `.msg`
- Input sources: Base64, binary string, Blob, File, ArrayBuffer, Uint8Array, Response, URL
- Header, toolbar, body, attachments, themes (light/dark/auto)
- CID / inline image rewriting to data URLs
- Search with highlight, zoom, print, copy, download
- Dual ESM + CJS + TypeScript declarations
- CSS variables for theming (`react-email-viewer/styles.css`)
