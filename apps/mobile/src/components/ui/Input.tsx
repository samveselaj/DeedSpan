import * as React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useTheme } from "../../design/theme";

export type InputProps = TextInputProps & {
  label?: string;
  errorText?: string;
};

export const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { label, errorText, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { tokens } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ gap: tokens.s[1.5] }}>
      {label && (
        <Text
          style={{
            color: tokens.c.fg,
            fontSize: 13,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={tokens.c.muted}
        cursorColor={tokens.c.accent}
        selectionColor={tokens.c.accent}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: tokens.c.fg,
            backgroundColor: tokens.c.surface,
            borderColor: errorText ? tokens.c.danger : focused ? tokens.c.accent : tokens.c.border,
            borderRadius: tokens.r.lg,
          },
          style,
        ]}
        {...rest}
      />
      {errorText && (
        <Text style={{ color: tokens.c.danger, fontSize: 12 }}>{errorText}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 15,
  },
});
