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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { tokens } = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Enter an email and password.");
      return;
    }
    setBusy(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
    } catch (e) {
      Alert.alert("Sign in failed", e instanceof ApiError ? e.message : "Try again");
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
          Welcome back
        </Text>
        <Text style={{ fontSize: 14, color: tokens.c.muted }}>
          Sign in to continue your work.
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
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <Button label="Sign in" loading={busy} onPress={onSubmit} />

        <View
          style={{
            marginTop: 4,
            paddingTop: 16,
            borderTopColor: tokens.c.border,
            borderTopWidth: 1,
          }}
        >
          <View
            style={{
              backgroundColor: tokens.c.subtle,
              padding: 12,
              borderRadius: 12,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: tokens.c.muted,
                marginBottom: 4,
              }}
            >
              Demo admin
            </Text>
            <Text style={[mono, { color: tokens.c.fg }]} selectable>
              smoke@test.dev
            </Text>
            <Text style={[mono, { color: tokens.c.fg }]} selectable>
              correcthorse
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: tokens.c.muted, fontSize: 14 }}>
          New here?{" "}
          <Link href="/register" style={{ color: tokens.c.fg, fontWeight: "600" }}>
            Create one
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const mono = {
  fontFamily: "Menlo" as const,
  fontSize: 13,
};

function withAlpha(hsl: string, alpha: number): string {
  return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
}
