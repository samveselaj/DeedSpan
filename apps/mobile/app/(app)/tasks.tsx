import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { ApiError } from "../../src/api/client";
import { createTask, listTasks } from "../../src/api/tasks";
import type { Task } from "../../src/api/types";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { TaskRow } from "../../src/components/TaskRow";
import { useTheme } from "../../src/design/theme";

export default function TasksScreen() {
  const { tokens } = useTheme();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const t = await listTasks("open");
      setTasks(t);
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
    const title = draft.trim();
    if (!title || adding) return;
    setAdding(true);
    try {
      await createTask({ title });
      setDraft("");
      await load();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        Alert.alert("Couldn't add", e instanceof ApiError ? e.message : "Try again");
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <Screen
      title="Tasks"
      subtitle="Capture, complete, move on."
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
      <Card style={{ padding: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomColor: tokens.c.border,
            borderBottomWidth: tasks.length > 0 ? 1 : 0,
          }}
        >
          <Feather name="plus" size={16} color={tokens.c.muted} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={add}
            placeholder="Add a task…"
            placeholderTextColor={tokens.c.muted}
            returnKeyType="done"
            blurOnSubmit={false}
            editable={!adding}
            style={{
              flex: 1,
              fontSize: 15,
              color: tokens.c.fg,
              paddingVertical: 0,
            }}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={tokens.c.muted} style={{ marginVertical: 36 }} />
        ) : tasks.length === 0 ? (
          <EmptyState title="Nothing to do" description="Add your first task above." />
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} onChanged={load} />
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}
