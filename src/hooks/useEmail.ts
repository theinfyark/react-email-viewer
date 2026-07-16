import { useEffect, useState } from "react";
import type { EmailFormat, EmailSource, ParsedEmail } from "../types.js";
import { parseEmail } from "../parse/index.js";

export function useEmail(options: {
  source?: EmailSource | null;
  url?: string;
  format?: EmailFormat;
}) {
  const [email, setEmail] = useState<ParsedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (options.source == null && !options.url) {
        setEmail(null);
        setError(null);
        return;
      }
      setLoading(true);
      try {
        const parsed = await parseEmail(options);
        if (!cancelled) {
          setEmail(parsed);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setEmail(null);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [options.source, options.url, options.format]);

  return { email, loading, error };
}
