import * as React from "react";
import { Platform } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "../../src/auth/auth-context";
import { useTheme } from "../../src/design/theme";

export default function AppLayout() {
  const { status } = useAuth();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  if (status === "loading") return null;
  if (status === "unauthenticated") return <Redirect href="/login" />;

  // On notch/Dynamic Island iPhones the home indicator reserves ~34pt
  // (insets.bottom). Build the bar height around the icon area + that inset
  // so the icons + labels sit above the indicator, not behind it.
  const iconArea = 54;
  const bottomInset = Platform.OS === "ios" ? insets.bottom : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.c.fg,
        tabBarInactiveTintColor: tokens.c.muted,
        tabBarStyle: {
          backgroundColor: tokens.c.bg,
          borderTopColor: tokens.c.border,
          borderTopWidth: 1,
          height: iconArea + bottomInset,
          paddingTop: 10,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 3,
          letterSpacing: 0.1,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name="home" size={size - 2} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="check-square"
              size={size - 2}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="repeat"
              size={size - 2}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="target"
              size={size - 2}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: "Reflect",
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="edit-3"
              size={size - 2}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
