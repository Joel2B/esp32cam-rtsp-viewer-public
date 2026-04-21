export type ViewerMode = "snapshot-poll" | "mjpeg";
export type PowerMode = "eco" | "normal" | "view";
export type WifiPowerSave = "none" | "min" | "max";
export type DashboardFetchMode = "on-connect" | "interval" | "off";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryMap = Record<string, QueryValue>;

export type DashboardKey =
  | "cameraConfig"
  | "rtspStats"
  | "sysStats"
  | "httpFps"
  | "powerView"
  | "wifiSleep"
  | "otaProgress"
  | "ina226"
  | "light"
  | "rcwl"
  | "autosleep"
  | "frameDark";

export interface ViewerSettings {
  baseUrl: string;
  pollMs: number;
  reconnectMs: number;
  dashboardFetchMode: DashboardFetchMode;
  viewerMode: ViewerMode;
  snapshotPollMs: number;
  httpFpsTarget: number;
  powerMode: PowerMode;
  powerMhz: 80 | 160 | 240;
  powerWifi: WifiPowerSave;
  autosleepEnable: boolean;
  sleepSec: number;
  telegramMessage: string;
  flashValue: number;
}

export interface EndpointState {
  ok: boolean;
  status: number;
  updatedAt: number;
  data: unknown;
  error?: string;
}

export interface LogEntry {
  when: string;
  status: number;
  action: string;
  message: string;
}

export interface PollTarget {
  key: DashboardKey;
  path: string;
  query?: (settings: ViewerSettings) => QueryMap;
}

export interface CatalogItem {
  id: string;
  path: string;
  description: string;
  options: string;
  query?: QueryMap;
  runMode: "fetch" | "snapshot" | "stream";
}

export interface RequestOptions {
  actionLabel?: string;
  silent?: boolean;
  timeoutMs?: number;
}

export type UpdateSetting = <K extends keyof ViewerSettings>(
  key: K,
  value: ViewerSettings[K],
) => void;

export type RunAndInspect = (
  path: string,
  query?: QueryMap,
  actionLabel?: string,
) => Promise<EndpointState>;

export type OpenDirect = (path: string, query?: QueryMap) => void;
export type TakeSnapshot = (sendToTelegram: boolean) => Promise<void>;
