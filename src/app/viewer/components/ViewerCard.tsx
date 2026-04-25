import type { OpenDirect, TakeSnapshot, UpdateSetting, ViewerSettings } from "../types";
import { cx, ui } from "../ui";
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
  onQuickNormalMode: () => Promise<void>;
  onQuickSleep5m: () => Promise<void>;
  onQuickAlwaysOn: () => Promise<void>;
  onQuickAutosleepNormal: () => Promise<void>;
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
  onQuickNormalMode,
  onQuickSleep5m,
  onQuickAlwaysOn,
  onQuickAutosleepNormal,
}: ViewerCardProps) {
  return (
    <article className={ui.card}>
      <div className={ui.cardTitleRow}>
        <div>
          <h2 className={ui.cardTitle}>Viewer</h2>
          <p className={ui.cardHint}>Use snapshot poll or MJPEG /stream.</p>
        </div>
        <div className={ui.pills}>
          <span className={cx(ui.pill, hasValidBase ? ui.pillOk : ui.pillErr)}>
            {hasValidBase ? "base URL OK" : "invalid base URL"}
          </span>
          <span className={cx(ui.pill, isDeviceOnline ? ui.pillOk : ui.pillErr)}>
            {isDeviceOnline ? "camera online" : "camera offline (light retry mode)"}
          </span>
          <span className={ui.pill}>last poll: {formatTime(lastPollAt)}</span>
        </div>
      </div>

      <div className={ui.viewerModes}>
        <button
          type="button"
          onClick={() => updateSetting("viewerMode", "snapshot-poll")}
          className={cx(ui.modeBtn, settings.viewerMode === "snapshot-poll" && ui.modeBtnActive)}
        >
          snapshot poll
        </button>
        <button
          type="button"
          onClick={() => updateSetting("viewerMode", "mjpeg")}
          className={cx(ui.modeBtn, settings.viewerMode === "mjpeg" && ui.modeBtnActive)}
        >
          MJPEG /stream
        </button>
      </div>

      {hasValidBase ? (
        <div className={ui.viewerLayout}>
          <div className={ui.viewerStage}>
            {isDeviceOnline && viewerSrc ? (
              <img src={viewerSrc} alt="camera stream" className={ui.viewerMedia} />
            ) : (
              <div className={ui.viewerEmpty}>
                Camera offline. Viewer requests are paused to avoid infinite reloading.
              </div>
            )}
          </div>
          <aside className={ui.quickPanel}>
            <h3 className={ui.quickTitle}>Quick Actions</h3>
            <p className={ui.quickHint}>
              If there is no activity, switch to power-saving mode and turn the camera off with Wi-Fi max save.
            </p>
            <div className={ui.quickActionRow}>
              <button
                type="button"
                className={cx(ui.button, ui.buttonWarn)}
                onClick={() => void onQuickEcoMode()}
                disabled={!hasValidBase}
              >
                Power Saving ({isQuickEcoActive ? "Active" : "Inactive"})
              </button>
            </div>
            <div className={ui.quickActionRow}>
              <button
                type="button"
                className={ui.button}
                onClick={() => void onQuickNormalMode()}
                disabled={!hasValidBase}
              >
                Back to Normal
              </button>
            </div>
            <div className={ui.quickActionRow}>
              <button
                type="button"
                className={cx(ui.button, ui.buttonDanger)}
                onClick={() => void onQuickSleep5m()}
                disabled={!hasValidBase}
              >
                Sleep 5 min
              </button>
            </div>
            <div className={ui.quickActionRow}>
              <button
                type="button"
                className={ui.button}
                onClick={() => void onQuickAlwaysOn()}
                disabled={!hasValidBase}
              >
                Autosleep Off
              </button>
            </div>
            <div className={ui.quickActionRow}>
              <button
                type="button"
                className={ui.button}
                onClick={() => void onQuickAutosleepNormal()}
                disabled={!hasValidBase}
              >
                Autosleep On
              </button>
            </div>
            <p className={ui.quickApi}>
              <code>/power/profile?mode=eco&wifi=max</code>
            </p>
            <p className={ui.quickApi}>
              <code>/power/profile?mode=normal</code>
            </p>
            <p className={ui.quickApi}>
              <code>/sleep?sec=300</code>
            </p>
            <p className={ui.quickApi}>
              <code>/autosleep?enable=0</code>
            </p>
            <p className={ui.quickApi}>
              <code>/autosleep?enable=1</code>
            </p>
          </aside>
        </div>
      ) : (
        <div className={ui.viewerEmpty}>Enter a valid URL (e.g. http://192.168.1.50) to start streaming.</div>
      )}

      <div className={ui.formActions}>
        <button
          type="button"
          className={cx(ui.button, ui.buttonPrimary)}
          onClick={() => void takeSnapshot(false)}
          disabled={!hasValidBase}
        >
          Snapshot now
        </button>
        <button
          type="button"
          className={ui.button}
          onClick={() => void takeSnapshot(true)}
          disabled={!hasValidBase}
        >
          Snapshot + Telegram
        </button>
        <button
          type="button"
          className={ui.button}
          onClick={() => openDirect("/stream")}
          disabled={!hasValidBase}
        >
          Open /stream
        </button>
        <button
          type="button"
          className={ui.button}
          onClick={() => openDirect("/snapshot")}
          disabled={!hasValidBase}
        >
          Open /snapshot
        </button>
      </div>

      <div className={ui.previewStage}>
        {manualSnapshotUrl ? (
          <img src={manualSnapshotUrl} alt="snapshot preview" className={ui.previewImage} />
        ) : (
          <div className={ui.viewerEmpty}>Manual snapshot preview</div>
        )}
      </div>
    </article>
  );
}


