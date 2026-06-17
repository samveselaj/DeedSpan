import { api } from "./client";
import type { Habit, HabitCadence } from "./types";

export function listHabits() {
  return api<Habit[]>("/habits");
}

export function createHabit(payload: { name: string; cadence?: HabitCadence }) {
  return api<Habit>("/habits", { method: "POST", json: payload });
}

export function deleteHabit(id: string) {
  return api<void>(`/habits/${id}`, { method: "DELETE" });
}

export function tickHabit(id: string, payload: { date: string; completed: boolean }) {
  return api<{ streak: number }>(`/habits/${id}/tick`, { method: "POST", json: payload });
}
