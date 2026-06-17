import * as React from "react";
import { Text, View } from "react-native";

import { useTheme } from "../../design/theme";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 56,
        paddingHorizontal: 24,
        gap: tokens.s[2],
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: tokens.c.fg,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 14,
            color: tokens.c.muted,
            textAlign: "center",
            lineHeight: 20,
            maxWidth: 320,
          }}
        >
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: tokens.s[3] }}>{action}</View>}
    </View>
  );
}
