import * as React from "react";
import { Alert, Text, View } from "react-native";
import { Link } from "expo-router";

import { useAuth } from "../../src/auth/auth-context";
import { ApiError } from "../../src/api/client";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { useTheme } from "../../src/design/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { tokens } = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit() {
    if (password.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await signUp({ email: email.trim().toLowerCase(), password });
    } catch (e) {
      Alert.alert("Sign up failed", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll>
      <View style={{ alignItems: "center", marginTop: 24, marginBottom: 24, gap: 4 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: withAlpha(tokens.c.accent, 0.15),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: tokens.c.accent,
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            letterSpacing: -0.5,
            color: tokens.c.fg,
          }}
        >
          Create your space
        </Text>
        <Text style={{ fontSize: 14, color: tokens.c.muted }}>
          A calm home for goals, tasks, and habits.
        </Text>
      </View>

      <Card style={{ gap: 16 }}>
        <Input
          label="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          secureTextEntry
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
        />
        <Button label="Create account" loading={busy} onPress={onSubmit} />
      </Card>

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: tokens.c.muted, fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: tokens.c.fg, fontWeight: "600" }}>
            Sign in
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

function withAlpha(hsl: string, alpha: number): string {
  return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
}
