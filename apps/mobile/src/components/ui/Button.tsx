import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../design/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const { tokens } = useTheme();
  const c = tokens.c;

  const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
  const paddingsX: Record<Size, number> = { sm: 12, md: 18, lg: 22 };
  const fontSizes: Record<Size, number> = { sm: 13, md: 15, lg: 16 };

  const palette = (pressed: boolean) => {
    switch (variant) {
      case "primary":
        return {
          bg: pressed ? withAlpha(c.accent, 0.9) : c.accent,
          fg: c.accentFg,
          border: "transparent",
        };
      case "secondary":
        return {
          bg: pressed ? c.border : c.subtle,
          fg: c.fg,
          border: "transparent",
        };
      case "ghost":
        return {
          bg: pressed ? c.subtle : "transparent",
          fg: c.fg,
          border: "transparent",
        };
      case "danger":
        return {
          bg: pressed ? withAlpha(c.danger, 0.9) : c.danger,
          fg: "#fff",
          border: "transparent",
        };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      android_ripple={{ color: c.border }}
      {...rest}
      style={({ pressed }) => {
        const p = palette(pressed);
        return [
          styles.base,
          {
            height: heights[size],
            paddingHorizontal: paddingsX[size],
            backgroundColor: p.bg,
            borderColor: p.border,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const p = palette(pressed);
        return loading ? (
          <ActivityIndicator color={p.fg} />
        ) : (
          <Text
            style={{
              color: p.fg,
              fontSize: fontSizes[size],
              fontWeight: "600",
              letterSpacing: -0.1,
            }}
          >
            {label}
          </Text>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
});

// HSL string → HSLA with alpha. RN parses both.
function withAlpha(hsl: string, alpha: number): string {
  // hsl(h, s%, l%) → hsla(h, s%, l%, a)
  return hsl.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
}
