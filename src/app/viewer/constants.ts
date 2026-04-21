import type { PollTarget, ViewerSettings } from "./types";

export const STORAGE_KEY = "esp32cam.viewer.settings.v1";

export const DEFAULT_SETTINGS: ViewerSettings = {
  baseUrl: "http://192.168.1.50",
  pollMs: 3000,
  reconnectMs: 2000,
  dashboardFetchMode: "interval",
  viewerMode: "snapshot-poll",
  snapshotPollMs: 1000,
  httpFpsTarget: 10,
  powerMode: "normal",
  powerMhz: 240,
  powerWifi: "none",
  autosleepEnable: true,
  sleepSec: 60,
  telegramMessage: "Hello from viewer",
  flashValue: 32,
};

export const POLL_TARGETS: PollTarget[] = [
  { key: "cameraConfig", path: "/camera/config" },
  { key: "rtspStats", path: "/rtsp/stats" },
  { key: "sysStats", path: "/sys/stats" },
  { key: "httpFps", path: "/http/fps" },
  { key: "powerView", path: "/power/profile", query: () => ({ mode: "view" }) },
  { key: "wifiSleep", path: "/wifi/sleep" },
  { key: "otaProgress", path: "/ota/progress" },
  { key: "ina226", path: "/ina226" },
  { key: "light", path: "/light/status" },
  { key: "rcwl", path: "/rcwl/status" },
  { key: "autosleep", path: "/autosleep" },
  { key: "frameDark", path: "/frame/dark" },
];
