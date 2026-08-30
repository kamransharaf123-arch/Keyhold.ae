"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import { booleanValue, enumValue, numberValue } from "@/lib/admin/validation";
import { cmsSelect, cmsUpdate } from "@/lib/cms/rest";
import { parseWebsiteMotionConfig } from "@/lib/motion/config";

const MOTION_INTENSITIES = ["subtle", "balanced", "cinematic"] as const;
const SETTINGS_ID = "00000000-0000-0000-0000-000000000061";

type SettingsRow = {
  id: string;
  theme: Record<string, unknown> | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function saveWebsiteMotionSettingsAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "admin"]);
  const rows = await cmsSelect<SettingsRow>("cms_website_settings", `select=id,theme&id=eq.${SETTINGS_ID}&limit=1`);
  const current = rows[0];
  if (!current) throw new Error("Website settings row is missing. Apply Module 6.1 before Module 6.2.");

  const currentTheme = asRecord(current.theme);
  const previous = parseWebsiteMotionConfig(currentTheme);
  const motion = {
    enabled: booleanValue(formData, "enabled"),
    intensity: enumValue(formData, "intensity", MOTION_INTENSITIES),
    motionScale: numberValue(formData, "motionScale", { min: 0.7, max: 1.25 }) ?? previous.motionScale,
    heroParallax: booleanValue(formData, "heroParallax"),
    heroAmbient: booleanValue(formData, "heroAmbient"),
    heroHeadlineReveal: booleanValue(formData, "heroHeadlineReveal"),
    sectionReveal: booleanValue(formData, "sectionReveal"),
    staggerGrids: booleanValue(formData, "staggerGrids"),
    imageReveal: booleanValue(formData, "imageReveal"),
    cardHover: booleanValue(formData, "cardHover"),
    buttonMotion: booleanValue(formData, "buttonMotion"),
    metricCountUp: booleanValue(formData, "metricCountUp"),
    progressAnimation: booleanValue(formData, "progressAnimation"),
    chartAnimation: booleanValue(formData, "chartAnimation"),
    pageIntro: booleanValue(formData, "pageIntro"),
    maxParallaxPx: numberValue(formData, "maxParallaxPx", { min: 0, max: 64, integer: true }) ?? previous.maxParallaxPx,
  };

  await cmsUpdate("cms_website_settings", `id=eq.${SETTINGS_ID}`, {
    theme: { ...currentTheme, motion },
    updated_at: new Date().toISOString(),
  });

  await writeAudit({
    admin,
    action: "update",
    entityType: "website-motion",
    entityId: SETTINGS_ID,
    summary: `Updated website motion system (${motion.intensity})`,
  });

  revalidatePath("/admin/website/motion");
  revalidatePath("/");
  redirect("/admin/website/motion?notice=saved");
}
