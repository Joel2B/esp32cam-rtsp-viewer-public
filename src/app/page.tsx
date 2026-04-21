"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { POLL_TARGETS } from "./viewer/constants";
import { ApiControlsCard } from "./viewer/components/ApiControlsCard";
import { EndpointCatalogCard } from "./viewer/components/EndpointCatalogCard";
import { HeaderBar } from "./viewer/components/HeaderBar";
import { InspectorCard } from "./viewer/components/InspectorCard";
import { LiveSummaryCard } from "./viewer/components/LiveSummaryCard";
import { LogCard } from "./viewer/components/LogCard";
import { QuickLinksCard } from "./viewer/components/QuickLinksCard";
import { ViewerCard } from "./viewer/components/ViewerCard";
import { useEspApi } from "./viewer/hooks/useEspApi";
import { useViewerSettings } from "./viewer/hooks/useViewerSettings";
import type {
  CatalogItem,
  DashboardKey,
  EndpointState,
  LogEntry,
  QueryMap,
} from "./viewer/types";
import { ui } from "./viewer/ui";
import {
  createApiCatalog,
  endpointResultText,
  isConnectionFailure,
} from "./viewer/utils";

export default function Home() {
  const { settings, updateSetting } = useViewerSettings();

  const [dashboard, setDashboard] = useState<Partial<Record<DashboardKey, EndpointState>>>({});
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [inspectorText, setInspectorText] = useState("Ready. Run an API call to see the response.");
  const [manualSnapshotUrl, setManualSnapshotUrl] = useState("");
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [isQuickEcoActive, setIsQuickEcoActive] = useState(false);
  const [snapshotPollNonce, setSnapshotPollNonce] = useState<number>(0);
  const [mjpegRetryNonce, setMjpegRetryNonce] = useState<number>(0);
  const [lastPollAt, setLastPollAt] = useState<number | null>(null);
  const refreshInFlightRef = useRef(false);
  const hasFetchedOnConnectRef = useRef(false);
  const isDashboardPollingOff = settings.dashboardFetchMode === "off";
  const offlineProbeTargets = useMemo(() => POLL_TARGETS.slice(0, 3), []);
  const connectionProbeTargets = useMemo(() => [POLL_TARGETS[0]], []);

  const addLog = useCallback((action: string, status: number, message: string) => {
    const entry: LogEntry = {
      when: new Date().toLocaleTimeString("en-US", { hour12: false }),
      action,
      status,
      message,
    };

    setLogEntries((prev) => [entry, ...prev].slice(0, 40));
  }, []);

  const { normalizedBase, hasValidBase, buildProxyUrl, buildDirectUrl, requestEndpoint } = useEspApi(
    settings.baseUrl,
    addLog,
  );

  useEffect(() => {
    return () => {
      if (manualSnapshotUrl.startsWith("blob:")) {
        URL.revokeObjectURL(manualSnapshotUrl);
      }
    };
  }, [manualSnapshotUrl]);

  const applyPollResponses = useCallback(
    (
      responses: Array<readonly [DashboardKey, EndpointState]>,
      mergeWithPrevious: boolean,
    ): boolean => {
      const next: Partial<Record<DashboardKey, EndpointState>> = {};
      for (const [key, value] of responses) next[key] = value;

      const allConnectionFailures = responses.every(([, value]) => isConnectionFailure(value));
      const onlineNow = !allConnectionFailures;

      setDashboard((prev) => (mergeWithPrevious ? { ...prev, ...next } : next));
      setIsDeviceOnline(onlineNow);
      if (!onlineNow) {
        setIsQuickEcoActive(false);
      }
      setLastPollAt(Date.now());

      return onlineNow;
    },
    [],
  );

  const refreshDashboard = useCallback(async () => {
    if (!hasValidBase || refreshInFlightRef.current || isDashboardPollingOff) return;

    refreshInFlightRef.current = true;
    try {
      const pollTargets = isDeviceOnline ? POLL_TARGETS : offlineProbeTargets;

      const responses = await Promise.all(
        pollTargets.map(async (target) => {
          const query = target.query ? target.query(settings) : {};
          const result = await requestEndpoint(target.path, query, {
            silent: true,
            timeoutMs: 7000,
          });

          return [target.key, result] as const;
        }),
      );

      applyPollResponses(responses, !isDeviceOnline);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [
    applyPollResponses,
    hasValidBase,
    isDashboardPollingOff,
    isDeviceOnline,
    offlineProbeTargets,
    requestEndpoint,
    settings,
  ]);

  const probeConnection = useCallback(async () => {
    if (!hasValidBase || refreshInFlightRef.current || isDashboardPollingOff) return;

    refreshInFlightRef.current = true;
    try {
      const responses = await Promise.all(
        connectionProbeTargets.map(async (target) => {
          const query = target.query ? target.query(settings) : {};
          const result = await requestEndpoint(target.path, query, {
            silent: true,
            timeoutMs: 7000,
          });

          return [target.key, result] as const;
        }),
      );

      applyPollResponses(responses, true);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [
    applyPollResponses,
    connectionProbeTargets,
    hasValidBase,
    isDashboardPollingOff,
    requestEndpoint,
    settings,
  ]);

  const dashboardPollMs = isDeviceOnline
    ? settings.pollMs
    : Math.max(settings.reconnectMs, 4000);

  useEffect(() => {
    hasFetchedOnConnectRef.current = false;
    if (isDashboardPollingOff) {
      setIsDeviceOnline(true);
      return;
    }

    setIsDeviceOnline(false);
  }, [isDashboardPollingOff, normalizedBase]);

  useEffect(() => {
    if (!hasValidBase || settings.dashboardFetchMode !== "interval") return;

    const kick = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    const timer = window.setInterval(() => {
      void refreshDashboard();
    }, dashboardPollMs);

    return () => {
      window.clearTimeout(kick);
      window.clearInterval(timer);
    };
  }, [dashboardPollMs, hasValidBase, refreshDashboard, settings.dashboardFetchMode]);

  useEffect(() => {
    if (!hasValidBase || settings.dashboardFetchMode !== "on-connect") return;

    const kick = window.setTimeout(() => {
      void probeConnection();
    }, 0);

    const timer = window.setInterval(() => {
      void probeConnection();
    }, Math.max(settings.reconnectMs, 4000));

    return () => {
      window.clearTimeout(kick);
      window.clearInterval(timer);
    };
  }, [hasValidBase, probeConnection, settings.dashboardFetchMode, settings.reconnectMs]);

  useEffect(() => {
    if (settings.dashboardFetchMode !== "on-connect" || !hasValidBase || !isDeviceOnline) return;
    if (hasFetchedOnConnectRef.current) return;

    hasFetchedOnConnectRef.current = true;
    void refreshDashboard();
  }, [hasValidBase, isDeviceOnline, refreshDashboard, settings.dashboardFetchMode]);

  const effectiveDeviceOnline = isDashboardPollingOff ? true : isDeviceOnline;

  useEffect(() => {
    if (!hasValidBase || !effectiveDeviceOnline || settings.viewerMode !== "snapshot-poll") return;

    const timer = window.setInterval(() => {
      setSnapshotPollNonce(Date.now());
    }, settings.snapshotPollMs);

    return () => window.clearInterval(timer);
  }, [effectiveDeviceOnline, hasValidBase, settings.snapshotPollMs, settings.viewerMode]);

  useEffect(() => {
    if (!hasValidBase || !effectiveDeviceOnline || settings.viewerMode !== "mjpeg") return;
    const timer = window.setTimeout(() => {
      setMjpegRetryNonce(Date.now());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [effectiveDeviceOnline, hasValidBase, settings.viewerMode]);

  const runAndInspect = useCallback(
    async (path: string, query: QueryMap = {}, actionLabel?: string) => {
      const result = await requestEndpoint(path, query, { actionLabel });
      setInspectorText(endpointResultText(path, query, result));
      void refreshDashboard();
      return result;
    },
    [refreshDashboard, requestEndpoint],
  );

  const runQuickEcoMode = useCallback(async () => {
    updateSetting("powerMode", "eco");
    updateSetting("powerWifi", "max");
    const result = await runAndInspect(
      "/power/profile",
      { mode: "eco", wifi: "max" },
      "/power/profile?mode=eco&wifi=max",
    );
    setIsQuickEcoActive(result.ok);
  }, [runAndInspect, updateSetting]);

  const takeSnapshot = useCallback(
    async (sendToTelegram: boolean) => {
      if (!hasValidBase) {
        setInspectorText("Set a valid ESP32CAM base URL first.");
        return;
      }

      const query: QueryMap = sendToTelegram ? { send: 1 } : {};

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(buildProxyUrl("/snapshot", query), {
          cache: "no-store",
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.startsWith("image/")) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          setManualSnapshotUrl((prev) => {
            if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return objectUrl;
          });

          addLog(
            sendToTelegram ? "/snapshot?send=1" : "/snapshot",
            response.status,
            response.ok ? `${Math.round(blob.size / 1024)} KB` : "snapshot failed",
          );

          setInspectorText(
            [
              `endpoint: /snapshot${sendToTelegram ? "?send=1" : ""}`,
              `status: ${response.status}`,
              `content-type: ${contentType}`,
              `bytes: ${blob.size}`,
            ].join("\n"),
          );
        } else {
          const text = await response.text();
          addLog(
            sendToTelegram ? "/snapshot?send=1" : "/snapshot",
            response.status,
            response.ok ? "ok" : text,
          );
          setInspectorText(text.length > 0 ? text : "Empty response");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(sendToTelegram ? "/snapshot?send=1" : "/snapshot", 0, message);
        setInspectorText(message);
      } finally {
        window.clearTimeout(timeoutId);
        void refreshDashboard();
      }
    },
    [addLog, buildProxyUrl, hasValidBase, refreshDashboard],
  );

  const openDirect = useCallback(
    (path: string, query: QueryMap = {}) => {
      const url = buildDirectUrl(path, query);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [buildDirectUrl],
  );

  const apiCatalog = useMemo(() => createApiCatalog(settings), [settings]);

  const runCatalogItem = useCallback(
    async (item: CatalogItem) => {
      if (item.runMode === "stream") {
        updateSetting("viewerMode", "mjpeg");
        setInspectorText("MJPEG mode enabled. The viewer now uses /stream.");
        return;
      }

      if (item.runMode === "snapshot") {
        await takeSnapshot(false);
        return;
      }

      await runAndInspect(item.path, item.query ?? {}, item.path);
    },
    [runAndInspect, takeSnapshot, updateSetting],
  );

  const snapshotPollSrc = hasValidBase
    ? buildProxyUrl("/snapshot", { _: snapshotPollNonce, __timeoutMs: 8000 })
    : "";

  const mjpegSrc = hasValidBase
    ? buildProxyUrl("/stream", { _: mjpegRetryNonce })
    : "";

  const viewerSrc =
    effectiveDeviceOnline && settings.viewerMode === "snapshot-poll"
      ? snapshotPollSrc
      : effectiveDeviceOnline
        ? mjpegSrc
        : "";

  return (
    <div className={ui.shell}>
      <HeaderBar
        settings={settings}
        hasValidBase={hasValidBase}
        updateSetting={updateSetting}
        onRefreshDashboard={() => {
          void refreshDashboard();
        }}
      />

      <main className={ui.grid}>
        <section className={ui.column}>
          <ViewerCard
            settings={settings}
            hasValidBase={hasValidBase}
            isDeviceOnline={effectiveDeviceOnline}
            isQuickEcoActive={isQuickEcoActive}
            viewerSrc={viewerSrc}
            manualSnapshotUrl={manualSnapshotUrl}
            lastPollAt={lastPollAt}
            updateSetting={updateSetting}
            takeSnapshot={takeSnapshot}
            openDirect={openDirect}
            onQuickEcoMode={runQuickEcoMode}
          />

          <ApiControlsCard
            settings={settings}
            hasValidBase={hasValidBase}
            updateSetting={updateSetting}
            runAndInspect={runAndInspect}
          />

          <EndpointCatalogCard
            apiCatalog={apiCatalog}
            hasValidBase={hasValidBase}
            runCatalogItem={runCatalogItem}
            openDirect={openDirect}
          />
        </section>

        <section className={ui.column}>
          <LiveSummaryCard pollMs={settings.pollMs} dashboard={dashboard} />
          <InspectorCard inspectorText={inspectorText} />
          <LogCard logEntries={logEntries} />
          <QuickLinksCard hasValidBase={hasValidBase} openDirect={openDirect} />
        </section>
      </main>
    </div>
  );
}
