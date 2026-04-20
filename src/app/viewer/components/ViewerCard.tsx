import styles from "@/app/page.module.css";

import type { OpenDirect, TakeSnapshot, UpdateSetting, ViewerSettings } from "../types";
import { formatTime } from "../utils";

interface ViewerCardProps {
  settings: ViewerSettings;
  hasValidBase: boolean;
  isDeviceOnline: boolean;
  isQuickEcoActive: boolean;
  viewerSrc: string;
  manualSnapshotUrl: string;
  lastPollAt: number | null;
  updateSetting: UpdateSetting;
  takeSnapshot: TakeSnapshot;
  openDirect: OpenDirect;
  onQuickEcoMode: () => Promise<void>;
}

function EcoStateIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg viewBox="0 0 20 20" className={styles.quickStatusIcon} aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M6.3 10.2 8.7 12.5 13.8 7.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className={styles.quickStatusIcon} aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7.3v5.4M12 7.3v5.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function ViewerCard({
  settings,
  hasValidBase,
  isDeviceOnline,
  isQuickEcoActive,
  viewerSrc,
  manualSnapshotUrl,
  lastPollAt,
  updateSetting,
  takeSnapshot,
  openDirect,
  onQuickEcoMode,
}: ViewerCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <div>
          <h2 className={styles.cardTitle}>Viewer</h2>
          <p className={styles.cardHint}>Use snapshot poll or MJPEG /stream.</p>
        </div>
        <div className={styles.pills}>
          <span className={`${styles.pill} ${hasValidBase ? styles.pillOk : styles.pillErr}`}>
            {hasValidBase ? "base URL OK" : "invalid base URL"}
          </span>
          <span className={`${styles.pill} ${isDeviceOnline ? styles.pillOk : styles.pillErr}`}>
            {isDeviceOnline ? "camera online" : `camera offline (retry ${settings.reconnectMs}ms)`}
          </span>
          <span className={styles.pill}>last poll: {formatTime(lastPollAt)}</span>
        </div>
      </div>

      <div className={styles.viewerModes}>
        <button
          type="button"
          onClick={() => updateSetting("viewerMode", "snapshot-poll")}
          className={`${styles.modeBtn} ${
            settings.viewerMode === "snapshot-poll" ? styles.modeBtnActive : ""
          }`}
        >
          snapshot poll
        </button>
        <button
          type="button"
          onClick={() => updateSetting("viewerMode", "mjpeg")}
          className={`${styles.modeBtn} ${settings.viewerMode === "mjpeg" ? styles.modeBtnActive : ""}`}
        >
          MJPEG /stream
        </button>
      </div>

      {hasValidBase ? (
        <div className={styles.viewerLayout}>
          <div className={styles.viewerStage}>
            <img src={viewerSrc} alt="camera stream" />
          </div>
          <aside className={styles.quickPanel}>
            <h3 className={styles.quickTitle}>Quick Actions</h3>
            <p className={styles.quickHint}>
              If there is no activity, switch to power-saving mode and turn the camera off with Wi-Fi max save.
            </p>
            <div className={styles.quickActionRow}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonWarn}`}
                onClick={() => void onQuickEcoMode()}
                disabled={!hasValidBase}
              >
                Power Saving (eco)
              </button>
              <span
                className={`${styles.quickStatus} ${
                  isQuickEcoActive ? styles.quickStatusOn : styles.quickStatusOff
                }`}
              >
                <EcoStateIcon active={isQuickEcoActive} />
                {isQuickEcoActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className={styles.quickApi}>
              <code>/power/profile?mode=eco&wifi=max</code>
            </p>
          </aside>
        </div>
      ) : (
        <div className={styles.viewerEmpty}>Enter a valid URL (e.g. http://192.168.1.50) to start streaming.</div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => void takeSnapshot(false)}
          disabled={!hasValidBase}
        >
          Snapshot now
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void takeSnapshot(true)}
          disabled={!hasValidBase}
        >
          Snapshot + Telegram
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => openDirect("/stream")}
          disabled={!hasValidBase}
        >
          Open /stream
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => openDirect("/snapshot")}
          disabled={!hasValidBase}
        >
          Open /snapshot
        </button>
      </div>

      <div className={styles.previewStage}>
        {manualSnapshotUrl ? (
          <img src={manualSnapshotUrl} alt="snapshot preview" />
        ) : (
          <div className={styles.viewerEmpty}>Manual snapshot preview</div>
        )}
      </div>
    </article>
  );
}
