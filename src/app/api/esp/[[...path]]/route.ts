import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

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
  targetParams.delete("base");

  const query = targetParams.toString();
  if (query.length > 0) target.search = query;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      cache: "no-store",
      headers: {
        Accept: request.headers.get("accept") ?? "*/*",
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Failed to connect to device",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
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
