"use client";

import { useCallback, useSyncExternalStore } from "react";

import { DEFAULT_SETTINGS, STORAGE_KEY } from "../constants";
import type { UpdateSetting, ViewerSettings } from "../types";
import { sanitizeSettings } from "../utils";

const SETTINGS_CHANGE_EVENT = "esp32cam-viewer-settings-change";

let cachedRaw: string | null = null;
let cachedSettings: ViewerSettings = DEFAULT_SETTINGS;

function readSettingsSnapshot(): ViewerSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSettings;

  if (!raw) {
    cachedRaw = raw;
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ViewerSettings>;
    cachedRaw = raw;
    cachedSettings = sanitizeSettings(parsed);
    return cachedSettings;
  } catch {
    cachedRaw = raw;
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }
}

function subscribeToSettings(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  const onCustom = () => onStoreChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(SETTINGS_CHANGE_EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SETTINGS_CHANGE_EVENT, onCustom);
  };
}

function writeSettings(nextSettings: ViewerSettings): void {
  if (typeof window === "undefined") return;

  const sanitized = sanitizeSettings(nextSettings);
  const raw = JSON.stringify(sanitized);

  cachedRaw = raw;
  cachedSettings = sanitized;

  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
}

function getServerSnapshot(): ViewerSettings {
  return DEFAULT_SETTINGS;
}

export function useViewerSettings(): {
  settings: ViewerSettings;
  updateSetting: UpdateSetting;
} {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    readSettingsSnapshot,
    getServerSnapshot,
  );

  const updateSetting = useCallback<UpdateSetting>(
    (key, value) => {
      const current = readSettingsSnapshot();
      writeSettings({ ...current, [key]: value });
    },
    [],
  );

  return { settings, updateSetting };
}
