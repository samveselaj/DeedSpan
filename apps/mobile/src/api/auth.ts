import { api } from "./client";
import type { MobileAuthOut, User } from "./types";

export type Credentials = { email: string; password: string };

export function loginRequest(payload: Credentials) {
  return api<MobileAuthOut>("/auth/mobile/login", { method: "POST", json: payload });
}

export function registerRequest(payload: Credentials) {
  return api<MobileAuthOut>("/auth/mobile/register", { method: "POST", json: payload });
}

export function meRequest() {
  return api<User>("/me");
}

export function logoutRequest() {
  return api<void>("/auth/logout", { method: "POST" });
}
