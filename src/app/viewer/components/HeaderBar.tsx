import styles from "@/app/page.module.css";

import type { UpdateSetting, ViewerSettings } from "../types";
import { clampInt, normalizeBaseUrl } from "../utils";

interface HeaderBarProps {
  settings: ViewerSettings;
  hasValidBase: boolean;
  updateSetting: UpdateSetting;
  onRefreshDashboard: () => void;
}

export function HeaderBar({
  settings,
  hasValidBase,
  updateSetting,
  onRefreshDashboard,
}: HeaderBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>ESP32CAM Viewer</h1>
        <p className={styles.subtitle}>
          Single-panel app for all APIs. Viewer modes: <code>snapshot poll</code> and <code>/stream</code>.
        </p>
      </div>

      <div className={styles.topControls}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="base-url">
            Base URL ESP
          </label>
          <input
            id="base-url"
            className={styles.input}
            value={settings.baseUrl}
            onChange={(event) => updateSetting("baseUrl", event.target.value)}
            onBlur={() => updateSetting("baseUrl", normalizeBaseUrl(settings.baseUrl))}
            placeholder="http://192.168.1.50"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="poll-ms">
            Poll ms
          </label>
          <input
            id="poll-ms"
            className={styles.input}
            type="number"
            min={1000}
            max={30000}
            value={settings.pollMs}
            onChange={(event) => updateSetting("pollMs", clampInt(Number(event.target.value), 1000, 30000))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="retry-ms">
            retry ms
          </label>
          <input
            id="retry-ms"
            className={styles.input}
            type="number"
            min={500}
            max={60000}
            value={settings.reconnectMs}
            onChange={(event) =>
              updateSetting("reconnectMs", clampInt(Number(event.target.value), 500, 60000))
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="snap-poll">
            poll snapshot
          </label>
          <input
            id="snap-poll"
            className={styles.input}
            type="number"
            min={250}
            max={10000}
            value={settings.snapshotPollMs}
            onChange={(event) =>
              updateSetting("snapshotPollMs", clampInt(Number(event.target.value), 250, 10000))
            }
          />
        </div>

        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={onRefreshDashboard}
          disabled={!hasValidBase}
          type="button"
        >
          Refresh
        </button>
      </div>
    </header>
  );
}
