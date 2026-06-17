import { cookies } from "next/headers";
import { ApiError, buildRequest, parseOrThrow, type FetchOptions } from "./api";

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const INTERNAL_API_URL = process.env.API_INTERNAL_URL ?? PUBLIC_API_URL;

const CSRF_COOKIE = "aether_csrf";

export async function apiServer<T = unknown>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const csrf = cookieStore.get(CSRF_COOKIE)?.value ?? null;
  const res = await buildRequest(path, opts, INTERNAL_API_URL, csrf, cookieHeader);
  return parseOrThrow<T>(res);
}

export async function apiServerSafe<T = unknown>(
  path: string,
  opts: FetchOptions = {},
): Promise<T | null> {
  try {
    return await apiServer<T>(path, opts);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
      return null;
    }
    throw e;
  }
}
