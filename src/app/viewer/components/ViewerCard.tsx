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
}

function EcoStateIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg viewBox="0 0 20 20" className={ui.quickStatusIcon} aria-hidden="true">
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
    <svg viewBox="0 0 20 20" className={ui.quickStatusIcon} aria-hidden="true">
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
                Power Saving (eco)
              </button>
              <span
                className={cx(ui.quickStatus, isQuickEcoActive ? ui.quickStatusOn : ui.quickStatusOff)}
              >
                <EcoStateIcon active={isQuickEcoActive} />
                {isQuickEcoActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className={ui.quickApi}>
              <code>/power/profile?mode=eco&wifi=max</code>
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
