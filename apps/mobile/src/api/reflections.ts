import { api } from "./client";
import type { Reflection } from "./types";

export function getReflection(day: string) {
  return api<Reflection>(`/reflections/${day}`);
}

export function putReflection(day: string, body: string) {
  return api<Reflection>(`/reflections/${day}`, { method: "PUT", json: { body } });
}
