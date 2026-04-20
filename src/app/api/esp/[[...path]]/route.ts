import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function resolveTimeoutMs(raw: string | null): number {
  if (!raw) return 10000;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 10000;
  const rounded = Math.round(parsed);
  return Math.min(30000, Math.max(1000, rounded));
}

function resolveBase(base: string | null): URL | null {
  if (!base) return null;

  try {
    const parsed = new URL(base);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const search = request.nextUrl.searchParams;
  const base = resolveBase(search.get("base"));

  if (!base) {
    return Response.json(
      { ok: false, error: "Missing or invalid 'base' query parameter" },
      { status: 400 },
    );
  }

  const { path } = await context.params;
  const normalizedPath = path ?? [];

  const target = normalizedPath.length
    ? new URL(normalizedPath.join("/"), base.href.endsWith("/") ? base.href : `${base.href}/`)
    : new URL(base.href);

  const targetParams = new URLSearchParams(search);
  const timeoutMs = resolveTimeoutMs(targetParams.get("__timeoutMs"));
  targetParams.delete("base");
  targetParams.delete("__timeoutMs");

  const query = targetParams.toString();
  if (query.length > 0) target.search = query;

  let upstream: Response;
  const upstreamController = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    upstreamController.abort();
  }, timeoutMs);
  const onClientAbort = () => upstreamController.abort();
  request.signal.addEventListener("abort", onClientAbort, { once: true });

  try {
    upstream = await fetch(target, {
      cache: "no-store",
      signal: upstreamController.signal,
      headers: {
        Accept: request.headers.get("accept") ?? "*/*",
      },
    });
  } catch (error) {
    const abortedByClient = request.signal.aborted;
    const status = didTimeout ? 504 : 502;
    const reason = didTimeout ? "Device request timed out" : "Failed to connect to device";

    if (abortedByClient) {
      return Response.json(
        {
          ok: false,
          error: "Client aborted request",
        },
        { status: 499 },
      );
    }

    return Response.json(
      {
        ok: false,
        error: reason,
        details: error instanceof Error ? error.message : String(error),
      },
      { status },
    );
  } finally {
    clearTimeout(timeoutId);
    request.signal.removeEventListener("abort", onClientAbort);
  }

  const headers = new Headers();

  const passthroughHeaders = [
    "content-type",
    "content-length",
    "cache-control",
    "refresh",
    "location",
  ];

  for (const key of passthroughHeaders) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  headers.set("x-esp-target", target.toString());

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
