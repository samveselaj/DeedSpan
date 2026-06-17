import Constants from "expo-constants";

import { readSessionToken } from "../auth/session-store";

const FALLBACK_URL = "http://localhost:8000";

function getApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  return fromExtra ?? FALLBACK_URL;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
};

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const token = await readSessionToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...opts,
    method: (opts.method ?? "GET").toUpperCase(),
    headers,
    body,
  });

  if (res.status === 401) {
    onUnauthorized?.();
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in (data as Record<string, unknown>)
        ? (data as { detail?: unknown }).detail
        : undefined;
    const message = typeof detail === "string" ? detail : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}
