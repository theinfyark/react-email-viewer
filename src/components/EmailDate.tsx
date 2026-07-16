import { formatEmailDate } from "../utils/format.js";

export interface EmailDateProps {
  date?: Date;
  className?: string;
}

export function EmailDate({ date, className }: EmailDateProps) {
  return (
    <time
      className={className}
      dateTime={date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined}
    >
      {formatEmailDate(date)}
    </time>
  );
}
