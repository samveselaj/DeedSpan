export type Role = "user" | "admin";

export type User = {
  id: string;
  email: string;
  role: Role;
  is_disabled: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  goal_id: string | null;
  priority: 1 | 2 | 3 | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: "active" | "done" | "archived";
  created_at: string;
};

export type GoalProgress = {
  total: number;
  completed: number;
  percent: number;
};

// Cadence-based recurrence only. Trigger/occasional habits (e.g. "after a
// workout") need a different model and are intentionally out of scope.
export type HabitCadence = "daily" | "weekly" | "monthly";

export type Habit = {
  id: string;
  name: string;
  cadence: HabitCadence;
  created_at: string;
  streak: number;
  /**
   * For daily habits:   completed today.
   * For weekly habits:  at least one completion in the current ISO week.
   * For monthly habits: at least one completion in the current calendar month.
   */
  completed_this_period: boolean;
};

export type Reflection = {
  date: string;
  body: string;
  updated_at: string;
};

export type MobileAuthOut = {
  session_id: string;
  expires_at: string;
  user: User;
};
