import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StatusBar,
  Text,
  View,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../design/theme";

type Props = ViewProps & {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: ViewProps["style"];
};

export function Screen({
  children,
  title,
  subtitle,
  rightAction,
  scroll = true,
  refreshControl,
  contentStyle,
  style,
}: Props) {
  const { tokens, scheme } = useTheme();

  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: "handled" as const,
        contentContainerStyle: [
          {
            padding: tokens.s[5],
            paddingBottom: tokens.s[12],
            gap: tokens.s[4],
          },
          contentStyle,
        ],
        refreshControl,
      }
    : {
        style: [
          { flex: 1, padding: tokens.s[5], gap: tokens.s[4] },
          contentStyle,
        ],
      };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[{ flex: 1, backgroundColor: tokens.c.bg }, style]}
    >
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />
      {(title || rightAction) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingHorizontal: tokens.s[5],
            paddingTop: tokens.s[3],
            paddingBottom: tokens.s[2],
            gap: tokens.s[3],
          }}
        >
          <View style={{ flex: 1 }}>
            {title && (
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  color: tokens.c.fg,
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: tokens.c.muted,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {rightAction}
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <Body {...bodyProps}>{children}</Body>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
