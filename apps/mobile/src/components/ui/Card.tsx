import * as React from "react";
import { View, type ViewProps } from "react-native";

import { useTheme } from "../../design/theme";

export function Card({ style, children, ...rest }: ViewProps) {
  const { tokens } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tokens.c.surface,
          borderColor: tokens.c.border,
          borderWidth: 1,
          borderRadius: tokens.r.xl,
          padding: tokens.s[5],
          shadowColor: tokens.c.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
