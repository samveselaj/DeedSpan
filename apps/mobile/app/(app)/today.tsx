import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "../../src/auth/auth-context";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { TaskRow } from "../../src/components/TaskRow";
import { HabitTile } from "../../src/components/HabitTile";
import { listHabits } from "../../src/api/habits";
import { listTasks } from "../../src/api/tasks";
import type { Habit, Task } from "../../src/api/types";
import { useTheme } from "../../src/design/theme";
import { formatLongDate, greeting } from "../../src/utils/dates";

export default function TodayScreen() {
  const { user } = useAuth();
  const { tokens } = useTheme();
  const router = useRouter();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [t, h] = await Promise.all([listTasks("open"), listHabits()]);
      setTasks(t);
      setHabits(h);
    } catch {
      /* 401 handled centrally; other errors are swallowed for first paint */
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

  const localPart = user?.email.split("@")[0] ?? "";

  return (
    <Screen
      title={`${greeting()}, ${localPart}.`}
      subtitle={formatLongDate()}
      rightAction={
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={10}
          accessibilityLabel="Settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: tokens.c.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="settings" size={16} color={tokens.c.fg} />
        </Pressable>
      }
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
      {loading ? (
        <ActivityIndicator color={tokens.c.muted} style={{ marginTop: 48 }} />
      ) : (
        <>
          <Card>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: tokens.c.muted,
                marginBottom: 8,
              }}
            >
              Today
            </Text>
            {tasks.length === 0 ? (
              <EmptyState
                title="A clean slate"
                description="Capture what matters today."
              />
            ) : (
              tasks.slice(0, 6).map((t) => (
                <TaskRow key={t.id} task={t} onChanged={load} />
              ))
            )}
          </Card>

          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: tokens.c.muted,
                paddingHorizontal: 4,
              }}
            >
              Habits
            </Text>
            {habits.length === 0 ? (
              <Card>
                <EmptyState title="No habits yet" description="Build small, repeat often." />
              </Card>
            ) : (
              habits.slice(0, 4).map((h) => (
                <HabitTile key={h.id} habit={h} onChanged={load} />
              ))
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
