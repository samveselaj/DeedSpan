import * as React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../design/theme";
import { ApiError } from "../api/client";
import { deleteTask, patchTask } from "../api/tasks";
import type { Task } from "../api/types";
import { formatShortDate, isPastDate, isToday } from "../utils/dates";

type Props = {
  task: Task;
  onChanged: () => void;
};

export function TaskRow({ task, onChanged }: Props) {
  const { tokens } = useTheme();
  const [done, setDone] = React.useState(!!task.completed_at);
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    if (busy) return;
    const next = !done;
    setDone(next);
    setBusy(true);
    try {
      await patchTask(task.id, { completed: next });
      onChanged();
    } catch (e) {
      setDone(!next);
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't update", e instanceof ApiError ? e.message : "Try again");
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteTask(task.id);
      onChanged();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't delete", e instanceof ApiError ? e.message : "Try again");
      }
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert("Delete task?", task.title, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  }

  const due = task.due_date;
  const overdue = !done && due && isPastDate(due);
  const dueLabel = due ? (isToday(due) ? "Today" : formatShortDate(due)) : null;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: tokens.c.border,
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        style={[
          styles.check,
          {
            borderColor: done ? tokens.c.accent : tokens.c.border,
            backgroundColor: done ? tokens.c.accent : "transparent",
          },
        ]}
      >
        {done && <Feather name="check" size={14} color={tokens.c.accentFg} strokeWidth={3} />}
      </Pressable>

      <Pressable onLongPress={confirmDelete} style={{ flex: 1 }}>
        <Text
          style={{
            color: done ? tokens.c.muted : tokens.c.fg,
            fontSize: 15,
            textDecorationLine: done ? "line-through" : "none",
          }}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </Pressable>

      {dueLabel && (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: overdue ? withAlpha(tokens.c.danger, 0.1) : tokens.c.subtle,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: overdue ? tokens.c.danger : tokens.c.muted,
              fontWeight: "500",
            }}
          >
            {dueLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

function withAlpha(hsl: string, alpha: number): string {
  return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
}
