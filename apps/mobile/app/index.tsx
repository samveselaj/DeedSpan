import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { useAuth } from "../src/auth/auth-context";
import { useTheme } from "../src/design/theme";

export default function Index() {
  const { status } = useAuth();
  const { tokens } = useTheme();

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.c.bg,
        }}
      >
        <ActivityIndicator color={tokens.c.muted} />
      </View>
    );
  }

  return <Redirect href={status === "authenticated" ? "/today" : "/login"} />;
}
