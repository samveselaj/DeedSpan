import * as React from "react";
import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../src/auth/auth-context";

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === "authenticated") return <Redirect href="/today" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    />
  );
}
