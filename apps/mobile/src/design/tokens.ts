// Mirrors apps/web/app/globals.css. RN accepts hsl()/hsla() strings as colors.

export type ColorScheme = "light" | "dark";

type Palette = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  subtle: string;
  border: string;
  accent: string;
  accentFg: string;
  danger: string;
  success: string;
  shadow: string;
};

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    bg: "hsl(0, 0%, 99%)",
    surface: "hsl(0, 0%, 100%)",
    fg: "hsl(220, 13%, 12%)",
    muted: "hsl(220, 9%, 46%)",
    subtle: "hsl(220, 14%, 96%)",
    border: "hsl(220, 13%, 91%)",
    accent: "hsl(218, 90%, 52%)",
    accentFg: "hsl(0, 0%, 100%)",
    danger: "hsl(0, 70%, 55%)",
    success: "hsl(152, 56%, 42%)",
    shadow: "rgba(15, 23, 42, 0.08)",
  },
  dark: {
    bg: "hsl(222, 14%, 7%)",
    surface: "hsl(222, 14%, 10%)",
    fg: "hsl(210, 20%, 96%)",
    muted: "hsl(215, 12%, 65%)",
    subtle: "hsl(222, 12%, 14%)",
    border: "hsl(222, 12%, 18%)",
    accent: "hsl(213, 94%, 68%)",
    accentFg: "hsl(0, 0%, 100%)",
    danger: "hsl(0, 70%, 60%)",
    success: "hsl(152, 56%, 50%)",
    shadow: "rgba(0, 0, 0, 0.6)",
  },
};

export const radius = { sm: 8, md: 10, lg: 14, xl: 18, full: 999 } as const;

export const spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const type = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  md: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 22, lineHeight: 28 },
  "2xl": { fontSize: 28, lineHeight: 34 },
  "3xl": { fontSize: 32, lineHeight: 38 },
} as const;

export type Tokens = {
  c: Palette;
  r: typeof radius;
  s: typeof spacing;
  t: typeof type;
};

export function makeTokens(scheme: ColorScheme): Tokens {
  return { c: palettes[scheme], r: radius, s: spacing, t: type };
}
