import styles from "@/app/page.module.css";

import type { LogEntry } from "../types";

interface LogCardProps {
  logEntries: LogEntry[];
}

export function LogCard({ logEntries }: LogCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <h2 className={styles.cardTitle}>Action Log</h2>
        <span className={styles.cardHint}>max 40 entries</span>
      </div>

      <div className={styles.logList}>
        {logEntries.length === 0 ? (
          <div className={styles.logLine}>
            <span>--:--:--</span>
            <span>---</span>
            <span>No actions yet</span>
          </div>
        ) : (
          logEntries.map((entry, index) => (
            <div className={styles.logLine} key={`${entry.when}-${entry.action}-${index}`}>
              <span>{entry.when}</span>
              <span className={entry.status >= 200 && entry.status < 300 ? styles.logCodeOk : styles.logCodeErr}>
                {entry.status === 0 ? "ERR" : entry.status}
              </span>
              <span>
                {entry.action}: {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      <p className={styles.mini}>localStorage status: active. Values are restored on reload.</p>
    </article>
  );
}
