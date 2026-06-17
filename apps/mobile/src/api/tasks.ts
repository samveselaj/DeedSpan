import { api } from "./client";
import type { Task } from "./types";

export type TaskFilter = "all" | "open" | "completed";

export function listTasks(filter: TaskFilter = "open") {
  return api<Task[]>(`/tasks?filter=${filter}`);
}

export function createTask(payload: { title: string; goal_id?: string | null }) {
  return api<Task>("/tasks", { method: "POST", json: payload });
}

export function patchTask(
  id: string,
  payload: { completed?: boolean; title?: string; goal_id?: string | null },
) {
  return api<Task>(`/tasks/${id}`, { method: "PATCH", json: payload });
}

export function deleteTask(id: string) {
  return api<void>(`/tasks/${id}`, { method: "DELETE" });
}
