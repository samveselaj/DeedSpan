import * as React from "react";
import { ActivityIndicator, Alert, RefreshControl, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { ApiError } from "../../src/api/client";
import { createGoal, deleteGoal, goalProgress, listGoals } from "../../src/api/goals";
import type { Goal, GoalProgress } from "../../src/api/types";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { useTheme } from "../../src/design/theme";
import { formatShortDate } from "../../src/utils/dates";

export default function GoalsScreen() {
  const { tokens } = useTheme();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [progress, setProgress] = React.useState<Record<string, GoalProgress>>({});
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const g = await listGoals();
      setGoals(g);
      const entries = await Promise.all(g.map((x) => goalProgress(x.id).then((p) => [x.id, p] as const)));
      setProgress(Object.fromEntries(entries));
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
    const value = title.trim();
    if (!value) return;
    setBusy(true);
    try {
      await createGoal({ title: value });
      setTitle("");
      await load();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't add", e instanceof ApiError ? e.message : "Try again");
      }
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(g: Goal) {
    Alert.alert("Delete goal?", g.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGoal(g.id);
            await load();
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 401)) {
              Alert.alert("Couldn't delete", e instanceof ApiError ? e.message : "Try again");
            }
          }
        },
      },
    ]);
  }

  return (
    <Screen
      title="Goals"
      subtitle="What you're working toward."
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
          New goal
        </Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Ship DeedSpan v1"
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Button label="Create goal" loading={busy} onPress={add} />
      </Card>

      {loading ? (
        <ActivityIndicator color={tokens.c.muted} style={{ marginVertical: 36 }} />
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState title="No goals yet" description="Goals frame the work. Start with one." />
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {goals.map((g) => {
            const p = progress[g.id];
            return (
              <Card key={g.id}>
                <Text
                  onLongPress={() => confirmDelete(g)}
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: tokens.c.fg,
                    letterSpacing: -0.2,
                  }}
                >
                  {g.title}
                </Text>
                {g.description ? (
                  <Text
                    numberOfLines={2}
                    style={{ marginTop: 4, fontSize: 13, color: tokens.c.muted, lineHeight: 18 }}
                  >
                    {g.description}
                  </Text>
                ) : null}

                {p && (
                  <View style={{ marginTop: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: tokens.c.muted }}>
                        {p.completed} of {p.total} tasks
                      </Text>
                      <Text style={{ fontSize: 12, color: tokens.c.fg, fontWeight: "600" }}>
                        {p.percent}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: tokens.c.subtle,
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${p.percent}%`,
                          height: "100%",
                          backgroundColor: tokens.c.accent,
                        }}
                      />
                    </View>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: tokens.c.muted }}>
                    {g.target_date ? `by ${formatShortDate(g.target_date)}` : ""}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor:
                        g.status === "done"
                          ? withAlpha(tokens.c.success, 0.1)
                          : tokens.c.subtle,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "500",
                        color: g.status === "done" ? tokens.c.success : tokens.c.muted,
                      }}
                    >
                      {g.status}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function withAlpha(hsl: string, alpha: number): string {
  return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
}
