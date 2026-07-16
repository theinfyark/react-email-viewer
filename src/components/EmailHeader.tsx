import type { ParsedEmail } from "../types.js";
import { EmailAddress } from "./EmailAddress.js";
import { EmailBadge } from "./EmailBadge.js";
import { EmailDate } from "./EmailDate.js";
import { EmailPriority } from "./EmailPriority.js";

export interface EmailHeaderProps {
  email: ParsedEmail;
  hideBcc?: boolean;
  showRawHeaders?: boolean;
  searchQuery?: string;
}

export function EmailHeader({
  email,
  hideBcc,
  showRawHeaders,
  searchQuery = "",
}: EmailHeaderProps) {
  const subject = searchQuery
    ? highlight(email.subject, searchQuery)
    : email.subject;

  return (
    <header className="rev-header">
      <h2
        className="rev-subject"
        dangerouslySetInnerHTML={
          searchQuery ? { __html: subject } : undefined
        }
      >
        {searchQuery ? undefined : email.subject}
      </h2>
      <div className="rev-meta">
        <div className="rev-meta-row">
          <span className="rev-meta-label">From</span>
          <EmailAddress addresses={email.from} />
        </div>
        <div className="rev-meta-row">
          <span className="rev-meta-label">To</span>
          <EmailAddress addresses={email.to} />
        </div>
        {email.cc.length > 0 && (
          <div className="rev-meta-row">
            <span className="rev-meta-label">Cc</span>
            <EmailAddress addresses={email.cc} />
          </div>
        )}
        {!hideBcc && email.bcc.length > 0 && (
          <div className="rev-meta-row">
            <span className="rev-meta-label">Bcc</span>
            <EmailAddress addresses={email.bcc} />
          </div>
        )}
        {email.replyTo.length > 0 && (
          <div className="rev-meta-row">
            <span className="rev-meta-label">Reply-To</span>
            <EmailAddress addresses={email.replyTo} />
          </div>
        )}
        <div className="rev-meta-row">
          <span className="rev-meta-label">Date</span>
          <EmailDate date={email.date} />
        </div>
      </div>
      <div className="rev-badges">
        <EmailPriority priority={email.priority} />
        {email.categories.map((c) => (
          <EmailBadge key={c}>{c}</EmailBadge>
        ))}
        <EmailBadge>{email.format.toUpperCase()}</EmailBadge>
      </div>
      {showRawHeaders && (
        <pre className="rev-headers" aria-label="Raw email headers">
          {Object.entries(email.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")}
        </pre>
      )}
    </header>
  );
}

function highlight(text: string, query: string): string {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="rev-mark">$1</mark>',
  );
}

export { EmailHeader as EmailMetadata };
