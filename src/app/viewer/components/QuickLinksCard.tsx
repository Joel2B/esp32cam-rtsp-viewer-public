import type { OpenDirect } from "../types";
import { ui } from "../ui";

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
    <article className={ui.card}>
      <h2 className={ui.cardTitle}>Quick Links</h2>
      <div className={ui.footerLinks}>
        {QUICK_ENDPOINTS.map((path) => (
          <button
            key={path}
            type="button"
            className={ui.linkChip}
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
