import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";

import { useTheme } from "../../design/theme";

export type TextareaProps = TextInputProps & {
  minHeight?: number;
};

export const Textarea = React.forwardRef<TextInput, TextareaProps>(function Textarea(
  { minHeight = 180, style, ...rest },
  ref,
) {
  const { tokens } = useTheme();
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      placeholderTextColor={tokens.c.muted}
      cursorColor={tokens.c.accent}
      selectionColor={tokens.c.accent}
      style={[
        {
          minHeight,
          color: tokens.c.fg,
          backgroundColor: tokens.c.surface,
          borderColor: tokens.c.border,
          borderWidth: 1,
          borderRadius: tokens.r.lg,
          padding: 14,
          fontSize: 15,
          lineHeight: 22,
        },
        style,
      ]}
      {...rest}
    />
  );
});
