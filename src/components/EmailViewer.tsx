import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmailViewerProps, ParsedEmail, Theme } from "../types.js";
import { parseEmail } from "../parse/index.js";
import { resolveTheme } from "../utils/format.js";
import { EmailToolbar } from "./EmailToolbar.js";
import { EmailHeader } from "./EmailHeader.js";
import { EmailBody } from "./EmailBody.js";
import { EmailAttachmentList } from "./EmailAttachmentList.js";

export function EmailViewer({
  source,
  url,
  format = "auto",
  theme = "auto",
  renderMode = "auto",
  className,
  style,
  showToolbar = true,
  showAttachments = true,
  allowExternalImages = false,
  zoom: initialZoom = 100,
  onLoad,
  onError,
  onDownloadAttachment,
  emptyLabel = "No email to display",
  loadingLabel = "Loading email…",
  hideBcc = false,
}: EmailViewerProps) {
  const [email, setEmail] = useState<ParsedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(initialZoom);
  const [themeState, setThemeState] = useState<Theme>(theme);
  const [showHeaders, setShowHeaders] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(theme),
  );

  useEffect(() => {
    setThemeState(theme);
  }, [theme]);

  useEffect(() => {
    setResolvedTheme(resolveTheme(themeState));
    if (themeState !== "auto" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(resolveTheme("auto"));
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [themeState]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (source == null && !url) {
        setEmail(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const filename =
          typeof File !== "undefined" && source instanceof File
            ? source.name
            : undefined;
        const parsed = await parseEmail({ source, url, format, filename });
        if (cancelled) return;
        setEmail(parsed);
        onLoad?.(parsed);
      } catch (err) {
        if (cancelled) return;
        const e = err instanceof Error ? err : new Error(String(err));
        setEmail(null);
        setError(e.message);
        onError?.(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [source, url, format, onLoad, onError]);

  const matchesSearch = useMemo(() => {
    if (!email || !search.trim()) return true;
    const q = search.toLowerCase();
    const hay = [
      email.subject,
      ...email.from.map((a) => `${a.name ?? ""} ${a.address}`),
      ...email.to.map((a) => `${a.name ?? ""} ${a.address}`),
      email.text ?? "",
      email.html ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }, [email, search]);

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }, []);

  const rootClass = ["rev-root", className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClass}
      style={style}
      data-theme={resolvedTheme}
      role="region"
      aria-label="Email viewer"
    >
      {showToolbar && (
        <EmailToolbar
          search={search}
          onSearchChange={setSearch}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(200, z + 10))}
          onZoomOut={() => setZoom((z) => Math.max(50, z - 10))}
          onZoomReset={() => setZoom(100)}
          onToggleTheme={() =>
            setThemeState((t) => {
              const cur = resolveTheme(t);
              return cur === "dark" ? "light" : "dark";
            })
          }
          onToggleHeaders={() => setShowHeaders((v) => !v)}
          onCopyHeaders={() => {
            if (!email) return;
            void copyText(
              Object.entries(email.headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n"),
            );
          }}
          onCopyEmail={() => {
            if (!email) return;
            void copyText(
              [
                `Subject: ${email.subject}`,
                `From: ${email.from.map((a) => a.address).join(", ")}`,
                `To: ${email.to.map((a) => a.address).join(", ")}`,
                "",
                email.text || email.html || "",
              ].join("\n"),
            );
          }}
          onPrint={() => window.print()}
          onDownload={() => {
            if (!email) return;
            const blob = new Blob(
              [email.html || email.text || email.subject],
              { type: email.html ? "text/html" : "text/plain" },
            );
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${email.subject || "email"}.${email.html ? "html" : "txt"}`;
            a.click();
          }}
          themeLabel={resolvedTheme === "dark" ? "Light" : "Dark"}
          disabled={!email || loading}
        />
      )}

      {loading && <div className="rev-status">{loadingLabel}</div>}
      {!loading && error && (
        <div className="rev-status rev-error" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && !email && (
        <div className="rev-status">{emptyLabel}</div>
      )}
      {!loading && email && !matchesSearch && (
        <div className="rev-status">No matches for “{search}”</div>
      )}

      {!loading && email && matchesSearch && (
        <>
          <EmailHeader
            email={email}
            hideBcc={hideBcc}
            showRawHeaders={showHeaders}
            searchQuery={search}
          />
          <EmailBody
            email={email}
            renderMode={renderMode}
            zoom={zoom}
            searchQuery={search}
            allowExternalImages={allowExternalImages}
          />
          {showAttachments && (
            <EmailAttachmentList
              attachments={email.attachments}
              onDownload={onDownloadAttachment}
            />
          )}
        </>
      )}
    </div>
  );
}
