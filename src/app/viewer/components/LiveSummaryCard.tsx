import { POLL_TARGETS } from "../constants";
import type { DashboardKey, EndpointState } from "../types";
import { cx, ui } from "../ui";
import {
  asBoolean,
  asNumber,
  asRecord,
  asString,
  formatNum,
} from "../utils";

interface LiveSummaryCardProps {
  pollMs: number;
  dashboard: Partial<Record<DashboardKey, EndpointState>>;
}

function formatMsAsSec(value: unknown): string {
  const ms = asNumber(value);
  if (ms === undefined) return "--";
  return `${(ms / 1000).toFixed(1)}s`;
}

export function LiveSummaryCard({ pollMs, dashboard }: LiveSummaryCardProps) {
  const cameraConfig = asRecord(dashboard.cameraConfig?.data);
  const rtspStats = asRecord(dashboard.rtspStats?.data);
  const sysStats = asRecord(dashboard.sysStats?.data);
  const cpu = asRecord(sysStats?.cpu);
  const ram = asRecord(sysStats?.ram);
  const psram = asRecord(sysStats?.psram);
  const httpFps = asRecord(dashboard.httpFps?.data);
  const ina = asRecord(dashboard.ina226?.data);
  const light = asRecord(dashboard.light?.data);
  const rcwl = asRecord(dashboard.rcwl?.data);
  const autosleep = asRecord(dashboard.autosleep?.data);
  const frameDark = asRecord(dashboard.frameDark?.data);

  return (
    <article className={ui.card}>
      <div className={ui.cardTitleRow}>
        <h2 className={ui.cardTitle}>Live Summary</h2>
        <p className={ui.cardHint}>Auto refresh every {pollMs} ms.</p>
      </div>

      <div className={ui.pills}>
        {POLL_TARGETS.map((target) => {
          const state = dashboard[target.key];
          const ok = !!state?.ok;
          return (
            <span
              key={target.key}
              className={cx(ui.pill, ok ? ui.pillOk : ui.pillErr)}
              title={target.path}
            >
              {target.path}: {ok ? "ok" : `err ${state?.status ?? "--"}`}
            </span>
          );
        })}
      </div>

      <div className={ui.kvGrid}>
        <div className={ui.kv}>
          <div className={ui.kvLabel}>camera initialized</div>
          <div className={ui.kvValue}>{asBoolean(cameraConfig?.camera_initialized) ? "true" : "false"}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>RTSP fps / sessions</div>
          <div className={ui.kvValue}>
            {formatNum(asNumber(rtspStats?.fps), 2)} / {asNumber(rtspStats?.sessions) ?? "--"}
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>HTTP fps target/avg</div>
          <div className={ui.kvValue}>
            {formatNum(asNumber(httpFps?.target), 2)} / {formatNum(asNumber(httpFps?.fps_avg), 2)}
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>CPU core0/core1</div>
          <div className={ui.kvValue}>
            {formatNum(asNumber(cpu?.core0), 1)} / {formatNum(asNumber(cpu?.core1), 1)}
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>RAM free / PSRAM free</div>
          <div className={ui.kvValue}>
            {formatNum(asNumber(ram?.free), 2)} MB / {formatNum(asNumber(psram?.free), 2)} MB
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>INA226 V/I/P</div>
          <div className={ui.kvValue}>
            {formatNum(asNumber(ina?.vbat_V), 3)} V / {formatNum(asNumber(ina?.ishunt_mA), 1)} mA / {formatNum(asNumber(ina?.psys_mW), 0)} mW
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Light dark / dark_frame</div>
          <div className={ui.kvValue}>
            {String(asBoolean(light?.dark) ?? "--")} / {String(asBoolean(light?.dark_frame) ?? "--")}
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Frame dark guess</div>
          <div className={ui.kvValue}>{String(asBoolean(frameDark?.is_dark_guess) ?? "--")}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Frame seq</div>
          <div className={ui.kvValue}>{asNumber(frameDark?.frame_seq) ?? "--"}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Frame JPEG / threshold</div>
          <div className={ui.kvValue}>
            {asNumber(frameDark?.jpeg_bytes) ?? "--"} / {asNumber(frameDark?.dark_threshold_bytes) ?? "--"} bytes
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Frame age</div>
          <div className={ui.kvValue}>{formatMsAsSec(frameDark?.age_ms)}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>RCWL state</div>
          <div className={ui.kvValue}>{asString(rcwl?.state) ?? "--"}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Autosleep enabled</div>
          <div className={ui.kvValue}>{String(asBoolean(autosleep?.enabled) ?? "--")}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Autosleep grace reason</div>
          <div className={ui.kvValue}>{asString(autosleep?.grace_reason) ?? "--"}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Autosleep grace flags</div>
          <div className={ui.kvValue}>
            g:{String(asBoolean(autosleep?.grace_active) ?? "--")} / g1:
            {String(asBoolean(autosleep?.grace1_active) ?? "--")} / g2:
            {String(asBoolean(autosleep?.grace2_active) ?? "--")}
          </div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Autosleep remaining</div>
          <div className={ui.kvValue}>
            g:{formatMsAsSec(autosleep?.grace_remaining_ms)} / g1:
            {formatMsAsSec(autosleep?.grace1_remaining_ms)} / g2:
            {formatMsAsSec(autosleep?.grace2_remaining_ms)}
          </div>
        </div>

      </div>
    </article>
  );
}
