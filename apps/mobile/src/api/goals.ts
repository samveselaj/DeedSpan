import { api } from "./client";
import type { Goal, GoalProgress } from "./types";

export function listGoals() {
  return api<Goal[]>("/goals");
}

export function createGoal(payload: {
  title: string;
  description?: string | null;
  target_date?: string | null;
}) {
  return api<Goal>("/goals", { method: "POST", json: payload });
}

export function deleteGoal(id: string) {
  return api<void>(`/goals/${id}`, { method: "DELETE" });
}

export function goalProgress(id: string) {
  return api<GoalProgress>(`/goals/${id}/progress`);
}
