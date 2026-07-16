# react-email-viewer

## Introduction

**react-email-viewer** is a production-ready React component for rendering Microsoft Outlook (`.msg`) and RFC822 (`.eml`) emails in modern web apps.

Pass Base64, binary, `Blob`, `File`, `ArrayBuffer`, `Uint8Array`, `Response`, or a URL — get an Outlook/Gmail-style preview with headers, HTML/text body, attachments, themes, and search.

```tsx
import { EmailViewer } from 'react-email-viewer';
import 'react-email-viewer/styles.css';

<EmailViewer source={base64OrFileOrBuffer} />;
```

Works with **TypeScript and JavaScript** (ESM + CommonJS + `.d.ts`).

## Why this package exists

Enterprise backends often deliver emails as opaque payloads. Teams reinvent decoding, MIME parsing, CID image rewriting, and UI chrome. **react-email-viewer** standardizes that path with a typed, accessible, themeable React surface.

## Installation

```bash
npm install react-email-viewer
```

Peer dependencies: `react` and `react-dom` ≥ 18.

```bash
# styles (required for default UI)
import "react-email-viewer/styles.css";
```

Requires Node.js 18+ for tooling; the viewer runs in modern browsers.

## Features

- `.eml` (RFC822) and `.msg` (Outlook)
- Sources: Base64, binary string, Blob, File, ArrayBuffer, Uint8Array, Response, URL
- Subject, From/To/Cc/Bcc/Reply-To, Date, Priority, Categories, Headers
- HTML + plain text bodies
- Attachments with download + preview (images/PDF/text)
- CID / inline / embedded image rewriting
- Light / Dark / Auto themes via CSS variables
- Toolbar: search, zoom, theme, headers, copy, print, download
- Accessible toolbar + landmarks
- Tree-shakeable exports of subcomponents + `parseEmail` / `useEmail`

## Quick Start

### TypeScript

```tsx
import { EmailViewer } from 'react-email-viewer';
import 'react-email-viewer/styles.css';

export function App({ payload }: { payload: string }) {
  return (
    <EmailViewer
      source={payload}
      theme="auto"
      onLoad={(email) => console.log(email.subject)}
      onError={(err) => console.error(err)}
    />
  );
}
```

### JavaScript

```jsx
import { EmailViewer } from 'react-email-viewer';
import 'react-email-viewer/styles.css';

export function App({ file }) {
  return <EmailViewer source={file} theme="light" />;
}
```

### From URL / API

```tsx
<EmailViewer url="/api/emails/123.eml" />
```

### File upload

```tsx
<input
  type="file"
  accept=".eml,.msg"
  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
/>
<EmailViewer source={file} />
```

## API Reference

### `<EmailViewer />`

| Prop                          | Type                                                              | Default  | Description                     |
| ----------------------------- | ----------------------------------------------------------------- | -------- | ------------------------------- |
| `source`                      | `string \| Blob \| File \| ArrayBuffer \| Uint8Array \| Response` | —        | Email payload                   |
| `url`                         | `string`                                                          | —        | Fetch email via GET             |
| `format`                      | `"eml" \| "msg" \| "auto"`                                        | `"auto"` | Force parser                    |
| `theme`                       | `"light" \| "dark" \| "auto"`                                     | `"auto"` | Color theme                     |
| `renderMode`                  | `"html" \| "text" \| "auto"`                                      | `"auto"` | Body mode                       |
| `showToolbar`                 | `boolean`                                                         | `true`   | Toolbar visibility              |
| `showAttachments`             | `boolean`                                                         | `true`   | Attachment list                 |
| `allowExternalImages`         | `boolean`                                                         | `true`   | Block remote `<img>` when false |
| `zoom`                        | `number`                                                          | `100`    | Initial zoom %                  |
| `hideBcc`                     | `boolean`                                                         | `false`  | Hide BCC row                    |
| `onLoad`                      | `(email) => void`                                                 | —        | Parsed callback                 |
| `onError`                     | `(error) => void`                                                 | —        | Error callback                  |
| `onDownloadAttachment`        | `(att) => void`                                                   | —        | Download hook                   |
| `className` / `style`         | —                                                                 | —        | Root customization              |
| `emptyLabel` / `loadingLabel` | `string`                                                          | —        | Status copy                     |

### `parseEmail(options)` / `parseEml` / `parseMsg`

Headless parsing without UI.

### `useEmail({ source, url, format })`

Hook returning `{ email, loading, error }`.

### Subcomponents

`EmailHeader`, `EmailToolbar`, `EmailBody`, `EmailAttachmentList`, `AttachmentCard`, `EmailAddress`, `EmailDate`, `EmailPriority`, `EmailBadge`, `EmailMetadata`.

## Examples

### Base64

```tsx
<EmailViewer source={base64String} />
```

### ArrayBuffer

```tsx
const buf = await file.arrayBuffer();
<EmailViewer source={buf} />;
```

### Next.js (App Router)

```tsx
'use client';
import { EmailViewer } from 'react-email-viewer';
import 'react-email-viewer/styles.css';
```

Mark the importing module as a Client Component — the package ships a `"use client"` banner for bundlers that honor it.

## Advanced Examples

### Custom theme via CSS variables

```css
.my-email {
  --rev-accent: #0f766e;
  --rev-bg: #f8fafc;
  --rev-radius: 14px;
}
```

```tsx
<EmailViewer className="my-email" theme="light" source={source} />
```

### Headless parse + custom UI

```tsx
const email = await parseEmail({ source: bytes, format: 'eml' });
```

### Block external images

```tsx
<EmailViewer source={source} allowExternalImages={false} />
```

## Framework Integration

Works with React, Next.js, Vite, CRA, Remix, and Astro (client islands). Import CSS once at the app root. Prefer client-side rendering for `.msg` OLE parsing.

## TypeScript Usage

```ts
import type {
  EmailViewerProps,
  ParsedEmail,
  EmailAttachment,
  Theme,
  RenderMode,
} from 'react-email-viewer';
```

## Error Handling

```tsx
<EmailViewer source={source} onError={(err) => toast.error(err.message)} />
```

Invalid MIME / corrupt MSG surfaces as a visible error region (`role="alert"`).

## Performance

- Parse once per `source`/`url` change
- Attachment bytes stay lazy until download/preview
- Prefer `renderMode="text"` for huge HTML
- Avoid embedding multi‑100MB attachments as Base64 strings in React state — pass `Blob`/`File` instead

## Best Practices

- Sanitize is basic (script/on\* stripping); for untrusted mail consider an additional HTML sanitizer
- Keep `allowExternalImages={false}` when previewing untrusted mail
- Don’t log full email bodies in production analytics
- Use `format="msg"` when filename/magic is unreliable

## Security

- HTML is lightly sanitized (scripts / inline handlers / `javascript:` removed)
- External images can be blocked
- Downloads use object URLs created in-memory

See [SECURITY.md](./SECURITY.md).

## FAQ

**Does it work without React?**  
Use `parseEmail` headlessly; UI components require React 18+.

**SSR?**  
Parsing can run on the server for `.eml`. Prefer client for `.msg` and interactive UI.

**Can I add more formats later?**  
Yes — parsers are isolated; contribute a new `parseX` + format detector.

**CommonJS?**  
Yes: `require("react-email-viewer")`.

## Migration Guide

### From hand-rolled MIME viewers

Replace custom decode + `dangerouslySetInnerHTML` with `<EmailViewer source={…} />` and keep your layout chrome around it.

### SemVer

Breaking changes only in major versions — see `CHANGELOG.md`.

## Troubleshooting

| Symptom               | Fix                                                           |
| --------------------- | ------------------------------------------------------------- |
| No styles             | `import "react-email-viewer/styles.css"`                      |
| Blank MSG             | Ensure bytes are full OLE file; try `format="msg"`            |
| CID images missing    | Confirm Content-ID attachments parsed; check HTML `cid:` refs |
| Next.js window errors | Use Client Component                                          |
| Types missing         | TS 5+, `moduleResolution` bundler/node16+                     |

## Browser Support

Chrome, Edge, Firefox, Safari (current evergreen). Mobile responsive layout included.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
