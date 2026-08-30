import type { CSSProperties } from "react";
import { websiteContent } from "@/data/website-content";

const HEX = /^#[0-9a-f]{6}$/i;
const tokenMap: Record<string, string> = {
  accent: "--color-teal",
  accentDeep: "--color-teal-deep",
  positive: "--color-sage",
  premium: "--color-champagne",
  warning: "--color-terracotta",
  background: "--color-bone",
  surface: "--color-soft-white",
  text: "--color-graphite",
};

export function websiteThemeStyle(): CSSProperties {
  const theme = websiteContent.settings?.theme ?? {};
  if (theme.allowCustomTheme !== true) return {};
  const output: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(tokenMap)) {
    const value = theme[key];
    if (typeof value === "string" && HEX.test(value)) output[cssVar] = value;
  }
  return output as CSSProperties;
}
