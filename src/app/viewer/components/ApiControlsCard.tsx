import styles from "@/app/page.module.css";

import type {
  RunAndInspect,
  UpdateSetting,
  ViewerSettings,
} from "../types";
import { clampInt } from "../utils";

interface ApiControlsCardProps {
  settings: ViewerSettings;
  hasValidBase: boolean;
  updateSetting: UpdateSetting;
  runAndInspect: RunAndInspect;
}

export function ApiControlsCard({
  settings,
  hasValidBase,
  updateSetting,
  runAndInspect,
}: ApiControlsCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <h2 className={styles.cardTitle}>API Controls (Persistent)</h2>
        <p className={styles.cardHint}>All values are saved to localStorage.</p>
      </div>

      <div className={styles.formGrid}>
        <div>
          <label className={styles.label} htmlFor="http-fps-target">
            HTTP FPS set
          </label>
          <input
            id="http-fps-target"
            className={styles.input}
            type="number"
            min={0}
            max={120}
            value={settings.httpFpsTarget}
            onChange={(event) =>
              updateSetting("httpFpsTarget", clampInt(Number(event.target.value), 0, 120))
            }
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="power-mode">
            Power mode
          </label>
          <select
            id="power-mode"
            className={styles.select}
            value={settings.powerMode}
            onChange={(event) => updateSetting("powerMode", event.target.value as ViewerSettings["powerMode"])}
          >
            <option value="normal">normal</option>
            <option value="eco">eco</option>
            <option value="view">view</option>
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="power-mhz">
            CPU MHz
          </label>
          <select
            id="power-mhz"
            className={styles.select}
            value={settings.powerMhz}
            onChange={(event) =>
              updateSetting("powerMhz", Number(event.target.value) as ViewerSettings["powerMhz"])
            }
          >
            <option value={80}>80</option>
            <option value={160}>160</option>
            <option value={240}>240</option>
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="power-wifi">
            WiFi PS
          </label>
          <select
            id="power-wifi"
            className={styles.select}
            value={settings.powerWifi}
            onChange={(event) =>
              updateSetting("powerWifi", event.target.value as ViewerSettings["powerWifi"])
            }
          >
            <option value="none">none</option>
            <option value="min">min</option>
            <option value="max">max</option>
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() =>
            void runAndInspect(
              "/power/profile",
              { mode: settings.powerMode, mhz: settings.powerMhz, wifi: settings.powerWifi },
              "/power/profile",
            )
          }
          disabled={!hasValidBase}
        >
          Apply power/profile
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/power/profile", { mhz: settings.powerMhz }, "/power/profile?mhz")}
          disabled={!hasValidBase}
        >
          MHz only
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/http/fps", { set: settings.httpFpsTarget }, "/http/fps?set")}
          disabled={!hasValidBase}
        >
          Apply HTTP FPS
        </button>
      </div>

      <div className={styles.formGrid3}>
        <div>
          <label className={styles.label} htmlFor="autosleep-enable">
            Autosleep
          </label>
          <select
            id="autosleep-enable"
            className={styles.select}
            value={settings.autosleepEnable ? "1" : "0"}
            onChange={(event) => updateSetting("autosleepEnable", event.target.value === "1")}
          >
            <option value="1">enable=1</option>
            <option value="0">enable=0</option>
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="sleep-sec">
            Sleep sec
          </label>
          <input
            id="sleep-sec"
            className={styles.input}
            type="number"
            min={1}
            max={86400}
            value={settings.sleepSec}
            onChange={(event) => updateSetting("sleepSec", clampInt(Number(event.target.value), 1, 86400))}
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="flash-value">
            Flash v
          </label>
          <input
            id="flash-value"
            className={styles.input}
            type="number"
            min={0}
            max={255}
            value={settings.flashValue}
            onChange={(event) => updateSetting("flashValue", clampInt(Number(event.target.value), 0, 255))}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            void runAndInspect("/autosleep", { enable: settings.autosleepEnable ? 1 : 0 }, "/autosleep")
          }
          disabled={!hasValidBase}
        >
          Apply autosleep
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/sleep", { sec: settings.sleepSec }, "/sleep?sec")}
          disabled={!hasValidBase}
        >
          Sleep timer
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonWarn}`}
          onClick={() => {
            if (!window.confirm("Send deep sleep command to the device?")) return;
            void runAndInspect("/sleep", { deep: 1 }, "/sleep?deep=1");
          }}
          disabled={!hasValidBase}
        >
          Deep sleep
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/flash", { v: settings.flashValue }, "/flash?v")}
          disabled={!hasValidBase}
        >
          Apply flash
        </button>
      </div>

      <div>
        <label className={styles.label} htmlFor="tg-msg">
          Telegram msg
        </label>
        <textarea
          id="tg-msg"
          className={styles.textarea}
          rows={2}
          value={settings.telegramMessage}
          onChange={(event) => updateSetting("telegramMessage", event.target.value)}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/telegram", { msg: settings.telegramMessage }, "/telegram?msg")}
          disabled={!hasValidBase}
        >
          Send Telegram
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => void runAndInspect("/ina226/resetcounters", {}, "/ina226/resetcounters")}
          disabled={!hasValidBase}
        >
          Reset INA counters
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={() => {
            if (!window.confirm("Restart the board?")) return;
            void runAndInspect("/restart", {}, "/restart");
          }}
          disabled={!hasValidBase}
        >
          Restart
        </button>
      </div>
    </article>
  );
}
