// app/api/debug/route.ts
//
// Temporary diagnostic. Visit https://uchaanarts.vercel.app/api/debug
//
// This runs on Vercel's server, which is what actually calls the CMS during
// rendering. If the browser can reach the API but this cannot, the answer
// will be in `error` below.
//
// DELETE THIS FILE once the integration works.

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

async function probe(path: string) {
  const url = `${BASE}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    let parsed: unknown = null;
    let parseError: string | null = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parseError = e instanceof Error ? e.message : String(e);
    }
    return {
      url,
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type"),
      ms: Date.now() - started,
      bodyLength: text.length,
      // First 300 chars, so an HTML error page or WAF block is visible
      bodyPreview: text.slice(0, 300),
      parseError,
      itemCount: Array.isArray((parsed as any)?.data)
        ? (parsed as any).data.length
        : null,
      meta: (parsed as any)?.meta ?? null,
    };
  } catch (e) {
    // Network-level failure: TLS, DNS, timeout, connection refused
    const err = e as Error & { cause?: { code?: string; message?: string } };
    return {
      url,
      ok: false,
      ms: Date.now() - started,
      error: err.message,
      errorName: err.name,
      causeCode: err.cause?.code ?? null,
      causeMessage: err.cause?.message ?? null,
    };
  }
}

export async function GET() {
  const results = await Promise.all([
    probe("/artworks?per_page=3"),
    probe("/blogs?per_page=3"),
    probe("/exhibitions?type=upcoming&per_page=3"),
    probe("/artists?per_page=3"),
    probe("/categories"),
  ]);

  return Response.json(
    {
      note: "Delete app/api/debug/route.ts once this is resolved.",
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "(not set, using fallback)",
        resolvedBase: BASE,
        nodeVersion: process.version,
        vercelEnv: process.env.VERCEL_ENV ?? "(not on Vercel)",
      },
      results,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
