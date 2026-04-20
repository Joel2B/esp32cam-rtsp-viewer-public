import styles from "@/app/page.module.css";

import { POLL_TARGETS } from "../constants";
import type { DashboardKey, EndpointState } from "../types";
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
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <h2 className={styles.cardTitle}>Live Summary</h2>
        <p className={styles.cardHint}>Auto refresh every {pollMs} ms.</p>
      </div>

      <div className={styles.pills}>
        {POLL_TARGETS.map((target) => {
          const state = dashboard[target.key];
          const ok = !!state?.ok;
          return (
            <span
              key={target.key}
              className={`${styles.pill} ${ok ? styles.pillOk : styles.pillErr}`}
              title={target.path}
            >
              {target.path}: {ok ? "ok" : `err ${state?.status ?? "--"}`}
            </span>
          );
        })}
      </div>

      <div className={styles.kvGrid}>
        <div className={styles.kv}>
          <div className={styles.kvLabel}>camera initialized</div>
          <div className={styles.kvValue}>{asBoolean(cameraConfig?.camera_initialized) ? "true" : "false"}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>RTSP fps / sessions</div>
          <div className={styles.kvValue}>
            {formatNum(asNumber(rtspStats?.fps), 2)} / {asNumber(rtspStats?.sessions) ?? "--"}
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>HTTP fps target/avg</div>
          <div className={styles.kvValue}>
            {formatNum(asNumber(httpFps?.target), 2)} / {formatNum(asNumber(httpFps?.fps_avg), 2)}
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>CPU core0/core1</div>
          <div className={styles.kvValue}>
            {formatNum(asNumber(cpu?.core0), 1)} / {formatNum(asNumber(cpu?.core1), 1)}
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>RAM free / PSRAM free</div>
          <div className={styles.kvValue}>
            {formatNum(asNumber(ram?.free), 2)} MB / {formatNum(asNumber(psram?.free), 2)} MB
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>INA226 V/I/P</div>
          <div className={styles.kvValue}>
            {formatNum(asNumber(ina?.vbat_V), 3)} V / {formatNum(asNumber(ina?.ishunt_mA), 1)} mA / {formatNum(asNumber(ina?.psys_mW), 0)} mW
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>Light dark / dark_frame</div>
          <div className={styles.kvValue}>
            {String(asBoolean(light?.dark) ?? "--")} / {String(asBoolean(light?.dark_frame) ?? "--")}
          </div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>RCWL state</div>
          <div className={styles.kvValue}>{asString(rcwl?.state) ?? "--"}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>Autosleep enabled</div>
          <div className={styles.kvValue}>{String(asBoolean(autosleep?.enabled) ?? "--")}</div>
        </div>

        <div className={styles.kv}>
          <div className={styles.kvLabel}>OTA progress</div>
          <div className={styles.kvValue}>{asNumber(otaProgress?.pct) ?? "--"}%</div>
        </div>
      </div>
    </article>
  );
}
