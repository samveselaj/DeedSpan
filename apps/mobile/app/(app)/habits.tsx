import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { ApiError } from "../../src/api/client";
import { createHabit, listHabits } from "../../src/api/habits";
import type { Habit, HabitCadence } from "../../src/api/types";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { HabitTile } from "../../src/components/HabitTile";
import { useTheme } from "../../src/design/theme";

const CADENCE_OPTIONS: { value: HabitCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function HabitsScreen() {
  const { tokens } = useTheme();
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [name, setName] = React.useState("");
  const [cadence, setCadence] = React.useState<HabitCadence>("daily");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setHabits(await listHabits());
    } catch {
      /* 401 handled centrally */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load]),
  );

  async function add() {
    const value = name.trim();
    if (!value) return;
    setBusy(true);
    try {
      await createHabit({ name: value, cadence });
      setName("");
      setCadence("daily");
      await load();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't add", e instanceof ApiError ? e.message : "Try again");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Habits"
      subtitle="Small, regular."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          tintColor={tokens.c.muted}
        />
      }
    >
      <Card style={{ gap: 12 }}>
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: tokens.c.muted,
          }}
        >
          New habit
        </Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read 20 minutes"
          onSubmitEditing={add}
          returnKeyType="done"
        />

        <View
          style={{
            flexDirection: "row",
            gap: 6,
            backgroundColor: tokens.c.subtle,
            padding: 4,
            borderRadius: 12,
          }}
        >
          {CADENCE_OPTIONS.map((opt) => {
            const active = cadence === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setCadence(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: active ? tokens.c.surface : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "500",
                    color: active ? tokens.c.fg : tokens.c.muted,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontSize: 12, color: tokens.c.muted }}>
          {cadence === "daily"
            ? "One completion per day."
            : cadence === "weekly"
              ? "At least one completion per ISO week."
              : "At least one completion per calendar month."}
        </Text>

        <Button label="Add habit" loading={busy} onPress={add} size="md" />
      </Card>

      {loading ? (
        <ActivityIndicator color={tokens.c.muted} style={{ marginVertical: 36 }} />
      ) : habits.length === 0 ? (
        <Card>
          <EmptyState
            title="No habits yet"
            description="The compound interest of small wins."
          />
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {habits.map((h) => (
            <HabitTile key={h.id} habit={h} onChanged={load} />
          ))}
        </View>
      )}
    </Screen>
  );
}
