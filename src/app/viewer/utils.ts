import { DEFAULT_SETTINGS } from "./constants";
import type { CatalogItem, EndpointState, QueryMap, ViewerSettings } from "./types";

export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.replace(/\/+$/, "");
}

export function isValidHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function formatNum(value: number | undefined, decimals = 1): string {
  if (value === undefined) return "--";
  return value.toFixed(decimals);
}

export function formatTime(ts: number | null): string {
  if (!ts) return "--";
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false });
}

export function buildSearchParams(query: QueryMap): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  return params;
}

export function summarize(value: unknown): string {
  if (typeof value === "string") return value;

  if (value === null || value === undefined) return "(no content)";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function endpointResultText(path: string, query: QueryMap, result: EndpointState): string {
  const queryTxt = buildSearchParams(query).toString();
  const fullPath = queryTxt.length > 0 ? `${path}?${queryTxt}` : path;

  return [
    `endpoint: ${fullPath}`,
    `status: ${result.status}`,
    `ok: ${result.ok}`,
    `updated: ${formatTime(result.updatedAt)}`,
    "",
    "response:",
    summarize(result.data),
  ].join("\n");
}

export function sanitizeSettings(candidate: Partial<ViewerSettings>): ViewerSettings {
  return {
    baseUrl: normalizeBaseUrl(candidate.baseUrl ?? DEFAULT_SETTINGS.baseUrl),
    pollMs: clampInt(candidate.pollMs ?? DEFAULT_SETTINGS.pollMs, 1000, 30000),
    reconnectMs: clampInt(candidate.reconnectMs ?? DEFAULT_SETTINGS.reconnectMs, 500, 60000),
    autosleepPollMs: clampInt(
      candidate.autosleepPollMs ?? DEFAULT_SETTINGS.autosleepPollMs,
      250,
      10000,
    ),
    dashboardFetchMode:
      candidate.dashboardFetchMode === "on-connect" ||
      candidate.dashboardFetchMode === "interval" ||
      candidate.dashboardFetchMode === "off"
        ? candidate.dashboardFetchMode
        : DEFAULT_SETTINGS.dashboardFetchMode,
    viewerMode:
      candidate.viewerMode === "snapshot-poll" || candidate.viewerMode === "mjpeg"
        ? candidate.viewerMode
        : DEFAULT_SETTINGS.viewerMode,
    snapshotPollMs: clampInt(
      candidate.snapshotPollMs ?? DEFAULT_SETTINGS.snapshotPollMs,
      250,
      10000,
    ),
    httpFpsTarget: clampInt(candidate.httpFpsTarget ?? DEFAULT_SETTINGS.httpFpsTarget, 0, 120),
    powerMode:
      candidate.powerMode === "eco" ||
      candidate.powerMode === "normal" ||
      candidate.powerMode === "view"
        ? candidate.powerMode
        : DEFAULT_SETTINGS.powerMode,
    powerMhz:
      candidate.powerMhz === 80 || candidate.powerMhz === 160 || candidate.powerMhz === 240
        ? candidate.powerMhz
        : DEFAULT_SETTINGS.powerMhz,
    powerWifi:
      candidate.powerWifi === "none" ||
      candidate.powerWifi === "min" ||
      candidate.powerWifi === "max"
        ? candidate.powerWifi
        : DEFAULT_SETTINGS.powerWifi,
    autosleepEnable:
      typeof candidate.autosleepEnable === "boolean"
        ? candidate.autosleepEnable
        : DEFAULT_SETTINGS.autosleepEnable,
    sleepSec: clampInt(candidate.sleepSec ?? DEFAULT_SETTINGS.sleepSec, 1, 86400),
    telegramMessage:
      typeof candidate.telegramMessage === "string"
        ? candidate.telegramMessage
        : DEFAULT_SETTINGS.telegramMessage,
    flashValue: clampInt(candidate.flashValue ?? DEFAULT_SETTINGS.flashValue, 0, 255),
  };
}

export function isConnectionFailure(result: EndpointState): boolean {
  if (result.status === 0) return true;

  if (result.status === 502) {
    const payload = asRecord(result.data);
    const errorText = asString(payload?.error);
    if (errorText === "Failed to connect to device") return true;
  }

  return false;
}

export function isCameraConfigHealthy(result: EndpointState): boolean {
  if (!result.ok || isConnectionFailure(result)) return false;

  const payload = asRecord(result.data);
  if (!payload) return false;

  const hasCameraInitialized = typeof payload.camera_initialized === "boolean";
  const hasKnownCameraKey =
    "framesize" in payload ||
    "quality" in payload ||
    "pixformat" in payload ||
    "fb_count" in payload ||
    "xclk_mhz" in payload;

  return hasCameraInitialized || hasKnownCameraKey;
}

export function isSnapshotHealthy(result: EndpointState): boolean {
  if (!result.ok || isConnectionFailure(result)) return false;
  return typeof result.data === "string" && result.data.startsWith("[image/");
}

export function createApiCatalog(settings: ViewerSettings): CatalogItem[] {
  return [
    {
      id: "root",
      path: "/",
      description: "Main HTML page",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "config",
      path: "/config",
      description: "IotWebConf UI",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "snapshot",
      path: "/snapshot",
      description: "Snapshot JPEG",
      options: "send=1, refresh=1..3600",
      runMode: "snapshot",
    },
    {
      id: "stream",
      path: "/stream",
      description: "MJPEG stream",
      options: "no parameters",
      runMode: "stream",
    },
    {
      id: "camera-config",
      path: "/camera/config",
      description: "Camera and stream status",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "rtsp-stats",
      path: "/rtsp/stats",
      description: "RTSP FPS and sessions",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "sys-stats",
      path: "/sys/stats",
      description: "CPU/RAM/PSRAM",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "http-fps",
      path: "/http/fps",
      description: "HTTP FPS control/status",
      options: "set=0..120",
      query: { set: settings.httpFpsTarget },
      runMode: "fetch",
    },
    {
      id: "power-profile",
      path: "/power/profile",
      description: "Power profile eco/normal/view",
      options: "mode, mhz=80|160|240, wifi=none|min|max",
      query: { mode: settings.powerMode, mhz: settings.powerMhz, wifi: settings.powerWifi },
      runMode: "fetch",
    },
    {
      id: "power-mhz",
      path: "/power/profile",
      description: "CPU MHz only",
      options: "mhz=80|160|240",
      query: { mhz: settings.powerMhz },
      runMode: "fetch",
    },
    {
      id: "wifi-sleep",
      path: "/wifi/sleep",
      description: "Wi-Fi power-save status",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "ina226",
      path: "/ina226",
      description: "INA226 telemetry",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "ina226-reset",
      path: "/ina226/resetcounters",
      description: "Reset INA226 counters",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "light",
      path: "/light/status",
      description: "Light sensor status",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "rcwl",
      path: "/rcwl/status",
      description: "RCWL sensor status",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "autosleep",
      path: "/autosleep",
      description: "Auto-sleep status/toggle",
      options: "enable=0|1",
      query: { enable: settings.autosleepEnable ? 1 : 0 },
      runMode: "fetch",
    },
    {
      id: "frame-dark",
      path: "/frame/dark",
      description: "Dark frame heuristic",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "telegram",
      path: "/telegram",
      description: "Send Telegram message",
      options: "msg=text",
      query: { msg: settings.telegramMessage },
      runMode: "fetch",
    },
    {
      id: "sleep-sec",
      path: "/sleep",
      description: "Sleep by timer",
      options: "sec=n",
      query: { sec: settings.sleepSec },
      runMode: "fetch",
    },
    {
      id: "sleep-deep",
      path: "/sleep",
      description: "Enter deep sleep",
      options: "deep=1",
      query: { deep: 1 },
      runMode: "fetch",
    },
    {
      id: "restart",
      path: "/restart",
      description: "Restart board",
      options: "no parameters",
      runMode: "fetch",
    },
    {
      id: "flash",
      path: "/flash",
      description: "Flash LED control",
      options: "v=0..255 (if supported on your board)",
      query: { v: settings.flashValue },
      runMode: "fetch",
    },
  ];
}
