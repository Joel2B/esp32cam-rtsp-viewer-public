import styles from "@/app/page.module.css";

import type { OpenDirect } from "../types";

interface QuickLinksCardProps {
  hasValidBase: boolean;
  openDirect: OpenDirect;
}

const QUICK_ENDPOINTS = [
  "/",
  "/config",
  "/camera/config",
  "/rtsp/stats",
  "/sys/stats",
  "/ina226",
] as const;

export function QuickLinksCard({ hasValidBase, openDirect }: QuickLinksCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>Quick Links</h2>
      <div className={styles.footerLinks}>
        {QUICK_ENDPOINTS.map((path) => (
          <button
            key={path}
            type="button"
            className={styles.linkChip}
            onClick={() => openDirect(path)}
            disabled={!hasValidBase}
          >
            {path}
          </button>
        ))}
      </div>
    </article>
  );
}
