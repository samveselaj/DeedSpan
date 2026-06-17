import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { ApiError } from "../../src/api/client";
import { getReflection, putReflection } from "../../src/api/reflections";
import { Card } from "../../src/components/ui/Card";
import { Screen } from "../../src/components/ui/Screen";
import { Textarea } from "../../src/components/ui/Textarea";
import { useTheme } from "../../src/design/theme";
import { formatLongDate, todayIso } from "../../src/utils/dates";

export default function ReflectScreen() {
  const { tokens } = useTheme();
  const day = todayIso();

  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);

  const initial = React.useRef<string>("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = React.useCallback(async () => {
    try {
      const r = await getReflection(day);
      setBody(r.body ?? "");
      initial.current = r.body ?? "";
    } catch {
      /* 401 handled centrally */
    } finally {
      setLoading(false);
    }
  }, [day]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load]),
  );

  const save = React.useCallback(
    async (value: string) => {
      if (value === initial.current) return;
      setSaving(true);
      try {
        await putReflection(day, value);
        initial.current = value;
        setSavedAt(new Date());
      } catch (e) {
        if (e instanceof ApiError && e.status !== 401) {
          /* keep silent; user can retry by editing */
        }
      } finally {
        setSaving(false);
      }
    },
    [day],
  );

  function onChange(value: string) {
    setBody(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(value), 800);
  }

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <Screen title={formatLongDate()} subtitle="A space to pause and notice.">
      {loading ? (
        <ActivityIndicator color={tokens.c.muted} style={{ marginTop: 36 }} />
      ) : (
        <Card style={{ gap: 8 }}>
          <Textarea
            value={body}
            onChangeText={onChange}
            onBlur={() => void save(body)}
            placeholder="What's on your mind today?"
            minHeight={240}
          />
          <View style={{ height: 16 }}>
            <Text style={{ fontSize: 12, color: tokens.c.muted }}>
              {saving
                ? "Saving…"
                : savedAt
                ? `Saved at ${savedAt.toLocaleTimeString()}`
                : ""}
            </Text>
          </View>
        </Card>
      )}
    </Screen>
  );
}
