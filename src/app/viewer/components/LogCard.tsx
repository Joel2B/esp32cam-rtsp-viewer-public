import type { LogEntry } from "../types";
import { cx, ui } from "../ui";

interface LogCardProps {
  logEntries: LogEntry[];
}

export function LogCard({ logEntries }: LogCardProps) {
  return (
    <article className={ui.card}>
      <div className={ui.cardTitleRow}>
        <h2 className={ui.cardTitle}>Action Log</h2>
        <span className={ui.cardHint}>max 40 entries</span>
      </div>

      <div className={ui.logList}>
        {logEntries.length === 0 ? (
          <div className={ui.logLine}>
            <span>--:--:--</span>
            <span>---</span>
            <span>No actions yet</span>
          </div>
        ) : (
          logEntries.map((entry, index) => (
            <div className={ui.logLine} key={`${entry.when}-${entry.action}-${index}`}>
              <span>{entry.when}</span>
              <span className={cx(entry.status >= 200 && entry.status < 300 ? ui.logCodeOk : ui.logCodeErr)}>
                {entry.status === 0 ? "ERR" : entry.status}
              </span>
              <span>
                {entry.action}: {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      <p className={ui.mini}>localStorage status: active. Values are restored on reload.</p>
    </article>
  );
}
