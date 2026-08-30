import snapshotJson from "@/data/cms-snapshot.json";
import { intelligenceProfiles as demoIntelligenceProfiles } from "@/data/intelligence";
import type { CmsSnapshot } from "@/types/cms-snapshot";

const snapshot = snapshotJson as CmsSnapshot;
export const intelligenceProfiles = snapshot.enabled && snapshot.source === "supabase-cms"
  ? snapshot.intelligenceProfiles
  : demoIntelligenceProfiles;
