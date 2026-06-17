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

export type JournalEntry = {
  date: string;
  what_i_did_today: string;
  what_i_planned_but_did_not_do: string;
  why_i_did_not_do_it: string;
  what_i_learned: string;
  what_confused_me: string;
  what_i_should_do_tomorrow: string;
  one_thing_to_improve: string;
  notes: string;
  updated_at: string;
};

export type Reflection = JournalEntry;

export type AdminMetrics = {
  user_count: number;
  active_7d: number;
  tasks_created_7d: number;
  habits_total: number;
};

export type PeriodType = "week" | "month" | "year" | "decade" | "custom";

export type PlanStatus = "active" | "completed" | "missed";

export type PlanItem = {
  id: string;
  plan_id: string;
  title: string;
  notes: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
};

export type PlanProgress = {
  total: number;
  completed: number;
  percent: number;
  day_index: number;
  period_length_days: number;
  label: string;
};

export type GoalPlan = {
  id: string;
  period_type: PeriodType;
  title: string;
  period_start: string;
  period_end: string;
  status: PlanStatus;
  created_at: string;
  items: PlanItem[];
  effective_status: PlanStatus;
  progress: PlanProgress;
};
