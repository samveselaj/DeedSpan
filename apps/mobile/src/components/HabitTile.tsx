import * as React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../design/theme";
import { ApiError } from "../api/client";
import { deleteHabit, tickHabit } from "../api/habits";
import type { Habit } from "../api/types";
import { todayIso } from "../utils/dates";

type Props = {
  habit: Habit;
  onChanged: () => void;
};

export function HabitTile({ habit, onChanged }: Props) {
  const { tokens } = useTheme();
  const [done, setDone] = React.useState(habit.completed_this_period);
  const [streak, setStreak] = React.useState(habit.streak);
  const [busy, setBusy] = React.useState(false);

  const periodLabel =
    habit.cadence === "weekly"
      ? "this week"
      : habit.cadence === "monthly"
        ? "this month"
        : "today";
  const streakUnit =
    habit.cadence === "weekly" ? "week" : habit.cadence === "monthly" ? "month" : "day";
  const cadenceBadge =
    habit.cadence === "weekly" ? "Weekly" : habit.cadence === "monthly" ? "Monthly" : null;

  async function tick() {
    if (busy) return;
    const next = !done;
    setDone(next);
    setBusy(true);
    try {
      const res = await tickHabit(habit.id, { date: todayIso(), completed: next });
      setStreak(res.streak);
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
    try {
      await deleteHabit(habit.id);
      onChanged();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't delete", e instanceof ApiError ? e.message : "Try again");
      }
    }
  }

  function confirmDelete() {
    Alert.alert("Delete habit?", habit.name, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  }

  return (
    <Pressable onLongPress={confirmDelete}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 16,
          backgroundColor: tokens.c.surface,
          borderColor: tokens.c.border,
          borderWidth: 1,
          borderRadius: tokens.r.xl,
        }}
      >
        <Pressable
          onPress={tick}
          hitSlop={6}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1.5,
            alignItems: "center",
            justifyContent: "center",
            borderColor: done ? tokens.c.accent : tokens.c.border,
            backgroundColor: done ? tokens.c.accent : "transparent",
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
        >
          {done && <Feather name="check" size={18} color={tokens.c.accentFg} strokeWidth={3} />}
        </Pressable>

        <View style={{ flex: 1 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Text
              style={{ color: tokens.c.fg, fontSize: 15, fontWeight: "500", flexShrink: 1 }}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {cadenceBadge && (
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: tokens.c.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    letterSpacing: 0.5,
                    color: tokens.c.muted,
                    textTransform: "uppercase",
                  }}
                >
                  {cadenceBadge}
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            {streak > 0 ? (
              <>
                <Feather name="zap" size={11} color={tokens.c.accent} />
                <Text style={{ fontSize: 12, color: tokens.c.muted }}>
                  {streak}-{streakUnit} streak · {done ? `Done ${periodLabel}` : `Not done ${periodLabel}`}
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 12, color: tokens.c.muted }}>
                {done ? `Done ${periodLabel}` : `Start ${periodLabel}`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
