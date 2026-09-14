// Shared helpers for the serverless functions. Files in folders starting with "_"
// are not deployed as endpoints by Vercel.

const MAX_BODY_BYTES = 16 * 1024;

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Reads a small JSON object body, rejecting anything oversized or malformed. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new HttpError(415, 'Expected JSON.');

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, 'Request too large.');

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, 'Request too large.');

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Malformed request.');
  }
}

/**
 * Browser-initiated POSTs must come from our own site. Blocks other websites from
 * silently using these endpoints on a visitor's behalf.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin) throw new HttpError(403, 'Forbidden.');

  const allowed = new Set<string>();
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host) allowed.add(host);
  if (process.env.SITE_URL) {
    try {
      allowed.add(new URL(process.env.SITE_URL).host);
    } catch {
      /* ignore bad config; host header still applies */
    }
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Forbidden.');
  }
  if (!allowed.has(originHost)) throw new HttpError(403, 'Forbidden.');
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

// Best-effort, per-instance limiter. Serverless instances don't share memory, so this
// only slows down naive abuse; the Vercel Firewall rule in DEPLOYMENT.md is the real limit.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) throw new HttpError(429, 'Too many requests. Please wait a moment and try again.');
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
}

/** Trims, collapses control characters, and enforces a max length. */
export function cleanText(value: unknown, max: number, { multiline = false } = {}): string {
  if (typeof value !== 'string') return '';
  const stripped = multiline
    ? value.replace(/[^\P{Cc}\n\t]/gu, '')
    : value.replace(/\p{Cc}/gu, ' ');
  return stripped.trim().slice(0, max);
}

export function handleError(error: unknown, context: string): Response {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(`[${context}]`, error instanceof Error ? error.message : error);
  return json({ error: 'Something went wrong on our side. Please try again shortly.' }, 500);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}
