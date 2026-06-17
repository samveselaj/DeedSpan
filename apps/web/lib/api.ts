const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CSRF_COOKIE = "aether_csrf";
const CSRF_HEADER = "X-CSRF-Token";

export type FetchOptions = RequestInit & { json?: unknown };

function readCsrfFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function buildRequest(
  path: string,
  opts: FetchOptions,
  baseUrl: string,
  csrf?: string | null,
  cookieHeader?: string,
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  let body: BodyInit | undefined = opts.body as BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }
  const method = (opts.method ?? "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && csrf) {
    headers[CSRF_HEADER] = csrf;
  }
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  return fetch(`${baseUrl}${path}`, {
    ...opts,
    method,
    body,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

export async function parseOrThrow<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `Request failed: ${res.status}`;
    throw new ApiError(typeof msg === "string" ? msg : "Request failed", res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// client-side calls — safe to import from any component
export async function api<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const csrf = readCsrfFromDocument();
  const res = await buildRequest(path, opts, PUBLIC_API_URL, csrf);
  return parseOrThrow<T>(res);
}
