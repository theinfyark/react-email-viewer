import type { EmailAddress as EmailAddressType } from "../types.js";

export interface EmailAddressProps {
  addresses: EmailAddressType[];
  className?: string;
}

export function EmailAddress({ addresses, className }: EmailAddressProps) {
  if (!addresses.length) {
    return <span className={className}>—</span>;
  }
  return (
    <span className={["rev-addr", className].filter(Boolean).join(" ")}>
      {addresses.map((a) => (
        <span key={`${a.address}-${a.name ?? ""}`} className="rev-addr-chip" title={a.address}>
          {a.name ? `${a.name} <${a.address}>` : a.address}
        </span>
      ))}
    </span>
  );
}
