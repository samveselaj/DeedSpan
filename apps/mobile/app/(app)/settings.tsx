import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "../../src/auth/auth-context";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Screen } from "../../src/components/ui/Screen";
import { useTheme } from "../../src/design/theme";
import type { ThemePreference } from "../../src/design/theme";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { tokens, preference, setPreference } = useTheme();

  return (
    <Screen title="Settings">
      <Card style={{ gap: 6 }}>
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: tokens.c.muted,
            marginBottom: 6,
          }}
        >
          Account
        </Text>
        <Text style={{ fontSize: 15, color: tokens.c.fg }}>{user?.email}</Text>
        <Text style={{ fontSize: 13, color: tokens.c.muted, textTransform: "capitalize" }}>
          {user?.role}
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: tokens.c.muted,
            marginBottom: 4,
          }}
        >
          Appearance
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            backgroundColor: tokens.c.subtle,
            padding: 4,
            borderRadius: 12,
          }}
        >
          {THEME_OPTIONS.map((opt) => {
            const active = preference === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
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
      </Card>

      <View style={{ marginTop: 12 }}>
        <Button label="Sign out" variant="secondary" onPress={signOut} />
      </View>

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Feather name="moon" size={12} color={tokens.c.muted} />
        <Text style={{ fontSize: 11, color: tokens.c.muted, marginTop: 6 }}>
          DeedSpan · 0.1.0
        </Text>
      </View>
    </Screen>
  );
}
