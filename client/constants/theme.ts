import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#FF9933",
    link: "#FF9933",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FFF8F0",
    backgroundSecondary: "#FFF5E6",
    backgroundTertiary: "#FFEDD5",
    primary: "#FF9933",
    primaryDark: "#CC6600",
    accent: "#FFD700",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
    counter: "#F97316",
    border: "#E5E7EB",
    borderFocus: "#FF9933",
    priceBackground: "#FFF9E6",
    priceBorder: "#FFD700",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#FF9933",
    link: "#FF9933",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#2A2522",
    backgroundSecondary: "#3A3530",
    backgroundTertiary: "#4A4540",
    primary: "#FF9933",
    primaryDark: "#CC6600",
    accent: "#FFD700",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
    counter: "#F97316",
    border: "#404244",
    borderFocus: "#FF9933",
    priceBackground: "#3A3020",
    priceBorder: "#FFD700",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  price: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  priceSmall: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
