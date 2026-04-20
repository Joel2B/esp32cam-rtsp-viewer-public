"use client";

import { useCallback, useMemo } from "react";

import type { EndpointState, QueryMap, RequestOptions } from "../types";
import { buildSearchParams, isValidHttpUrl, normalizeBaseUrl } from "../utils";

type AddLog = (action: string, status: number, message: string) => void;

export function useEspApi(baseUrl: string, addLog: AddLog) {
  const normalizedBase = useMemo(() => normalizeBaseUrl(baseUrl), [baseUrl]);
  const hasValidBase = useMemo(() => isValidHttpUrl(normalizedBase), [normalizedBase]);

  const buildProxyUrl = useCallback(
    (path: string, query: QueryMap = {}) => {
      const cleanPath = path.replace(/^\/+/, "");
      const basePath = cleanPath.length > 0 ? `/api/esp/${cleanPath}` : "/api/esp";
      const params = buildSearchParams({ base: normalizedBase, ...query });
      const queryString = params.toString();

      return queryString.length > 0 ? `${basePath}?${queryString}` : basePath;
    },
    [normalizedBase],
  );

  const buildDirectUrl = useCallback(
    (path: string, query: QueryMap = {}) => {
      if (!hasValidBase) return "";

      const base = normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`;
      const target = path === "/" ? new URL(base) : new URL(path.replace(/^\/+/, ""), base);
      const params = buildSearchParams(query);
      const queryString = params.toString();

      if (queryString.length > 0) target.search = queryString;

      return target.toString();
    },
    [hasValidBase, normalizedBase],
  );

  const requestEndpoint = useCallback(
    async (path: string, query: QueryMap = {}, options: RequestOptions = {}): Promise<EndpointState> => {
      if (!hasValidBase) {
        const invalid: EndpointState = {
          ok: false,
          status: 0,
          data: "Invalid base URL",
          error: "Invalid base URL",
          updatedAt: Date.now(),
        };

        if (!options.silent) {
          addLog(options.actionLabel ?? path, invalid.status, invalid.error ?? "error");
        }

        return invalid;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);

      try {
        const response = await fetch(buildProxyUrl(path, query), {
          cache: "no-store",
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";
        let data: unknown;

        if (contentType.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            data = await response.text();
          }
        } else if (contentType.startsWith("image/")) {
          data = `[${contentType}]`;
        } else {
          data = await response.text();
        }

        const result: EndpointState = {
          ok: response.ok,
          status: response.status,
          data,
          error: response.ok ? undefined : (typeof data === "string" ? data : `HTTP ${response.status}`),
          updatedAt: Date.now(),
        };

        if (!options.silent) {
          addLog(options.actionLabel ?? path, result.status, result.ok ? "ok" : result.error ?? "error");
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const failed: EndpointState = {
          ok: false,
          status: 0,
          data: message,
          error: message,
          updatedAt: Date.now(),
        };

        if (!options.silent) {
          addLog(options.actionLabel ?? path, failed.status, failed.error ?? "request failed");
        }

        return failed;
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [addLog, buildProxyUrl, hasValidBase],
  );

  return {
    normalizedBase,
    hasValidBase,
    buildProxyUrl,
    buildDirectUrl,
    requestEndpoint,
  };
}
