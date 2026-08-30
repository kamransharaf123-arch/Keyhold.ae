import snapshotJson from "@/data/cms-snapshot.json";
import {
  areas as demoAreas,
  constructionUpdates as demoConstructionUpdates,
  developers as demoDevelopers,
  projects as demoProjects,
} from "@/data/real-estate";
import type { CmsSnapshot } from "@/types/cms-snapshot";

const snapshot = snapshotJson as CmsSnapshot;
export const cmsSnapshotEnabled = snapshot.enabled === true && snapshot.source === "supabase-cms";
export const cmsSnapshotGeneratedAt = snapshot.generatedAt;

export const projects = cmsSnapshotEnabled ? snapshot.projects : demoProjects;
export const developers = cmsSnapshotEnabled ? snapshot.developers : demoDevelopers;
export const areas = cmsSnapshotEnabled ? snapshot.areas : demoAreas;
export const constructionUpdates = cmsSnapshotEnabled ? snapshot.constructionUpdates : demoConstructionUpdates;
export const cmsInsights = cmsSnapshotEnabled ? snapshot.insights : [];
export const cmsServices = cmsSnapshotEnabled ? snapshot.services : [];
export const cmsSiteSettings = cmsSnapshotEnabled ? snapshot.siteSettings : null;
