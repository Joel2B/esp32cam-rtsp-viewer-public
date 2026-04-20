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

export function LiveSummaryCard({ pollMs, dashboard }: LiveSummaryCardProps) {
  const cameraConfig = asRecord(dashboard.cameraConfig?.data);
  const rtspStats = asRecord(dashboard.rtspStats?.data);
  const sysStats = asRecord(dashboard.sysStats?.data);
  const cpu = asRecord(sysStats?.cpu);
  const ram = asRecord(sysStats?.ram);
  const psram = asRecord(sysStats?.psram);
  const httpFps = asRecord(dashboard.httpFps?.data);
  const otaProgress = asRecord(dashboard.otaProgress?.data);
  const ina = asRecord(dashboard.ina226?.data);
  const light = asRecord(dashboard.light?.data);
  const rcwl = asRecord(dashboard.rcwl?.data);
  const autosleep = asRecord(dashboard.autosleep?.data);

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
          <div className={ui.kvLabel}>RCWL state</div>
          <div className={ui.kvValue}>{asString(rcwl?.state) ?? "--"}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>Autosleep enabled</div>
          <div className={ui.kvValue}>{String(asBoolean(autosleep?.enabled) ?? "--")}</div>
        </div>

        <div className={ui.kv}>
          <div className={ui.kvLabel}>OTA progress</div>
          <div className={ui.kvValue}>{asNumber(otaProgress?.pct) ?? "--"}%</div>
        </div>
      </div>
    </article>
  );
}
