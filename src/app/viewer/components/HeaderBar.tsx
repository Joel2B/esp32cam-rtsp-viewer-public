import type { UpdateSetting, ViewerSettings } from "../types";
import { cx, ui } from "../ui";
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
    <header className={ui.topbar}>
      <div className={ui.titleBlock}>
        <h1 className={ui.title}>ESP32CAM Viewer</h1>
        <p className={ui.subtitle}>
          Single-panel app for all APIs. Viewer modes: <code>snapshot poll</code> and <code>/stream</code>.
        </p>
      </div>

      <div className={ui.topControls}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="base-url">
            Base URL ESP
          </label>
          <input
            id="base-url"
            className={ui.input}
            value={settings.baseUrl}
            onChange={(event) => updateSetting("baseUrl", event.target.value)}
            onBlur={() => updateSetting("baseUrl", normalizeBaseUrl(settings.baseUrl))}
            placeholder="http://192.168.1.50"
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="poll-ms">
            Poll ms
          </label>
          <input
            id="poll-ms"
            className={ui.input}
            type="number"
            min={1000}
            max={30000}
            value={settings.pollMs}
            onChange={(event) => updateSetting("pollMs", clampInt(Number(event.target.value), 1000, 30000))}
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="retry-ms">
            retry ms
          </label>
          <input
            id="retry-ms"
            className={ui.input}
            type="number"
            min={500}
            max={60000}
            value={settings.reconnectMs}
            onChange={(event) =>
              updateSetting("reconnectMs", clampInt(Number(event.target.value), 500, 60000))
            }
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="snap-poll">
            poll snapshot
          </label>
          <input
            id="snap-poll"
            className={ui.input}
            type="number"
            min={250}
            max={10000}
            value={settings.snapshotPollMs}
            onChange={(event) =>
              updateSetting("snapshotPollMs", clampInt(Number(event.target.value), 250, 10000))
            }
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="dashboard-fetch-mode">
            data fetch
          </label>
          <select
            id="dashboard-fetch-mode"
            className={ui.select}
            value={settings.dashboardFetchMode}
            onChange={(event) =>
              updateSetting(
                "dashboardFetchMode",
                event.target.value as ViewerSettings["dashboardFetchMode"],
              )
            }
          >
            <option value="on-connect">on-connect</option>
            <option value="interval">interval</option>
            <option value="off">off</option>
          </select>
        </div>

        <button
          className={cx(ui.button, ui.buttonPrimary)}
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
