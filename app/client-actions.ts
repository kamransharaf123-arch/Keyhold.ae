"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authenticateClient, destroyClientSession, registerClient, requestClientPasswordRecovery, requireClientContext, resetClientPasswordWithTokenHash } from "@/lib/client/session";
import { clientRest } from "@/lib/client/rest";
import { cleanCurrency, cleanEmail, cleanJsonObject, cleanLocale, cleanPassword, cleanText, cleanUuid } from "@/lib/client/validation";
import { clientPath } from "@/lib/client/locale";
import type { ClientLocale } from "@/types/client-portal";

function safeNext(value: FormDataEntryValue | null, locale: ClientLocale): string {
  const fallback = clientPath(locale);
  const next = String(value ?? "").trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

export async function loginClientAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  try {
    await authenticateClient(cleanEmail(formData.get("email")), String(formData.get("password") ?? ""));
  } catch {
    redirect(`${clientPath(locale, "/login")}?error=invalid`);
  }
  redirect(safeNext(formData.get("next"), locale));
}

export async function registerClientAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  let result: Awaited<ReturnType<typeof registerClient>>;
  try {
    result = await registerClient({
      email: cleanEmail(formData.get("email")),
      password: cleanPassword(formData.get("password")),
      fullName: cleanText(formData.get("fullName"), 120),
    });
  } catch {
    redirect(`${clientPath(locale, "/register")}?error=signup`);
  }
  if (result.requiresConfirmation) redirect(`${clientPath(locale, "/login")}?notice=check-email`);
  redirect(clientPath(locale));
}

export async function requestClientRecoveryAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  try {
    await requestClientPasswordRecovery(cleanEmail(formData.get("email")));
  } catch {
    redirect(`${clientPath(locale, "/forgot-password")}?error=recovery`);
  }
  redirect(`${clientPath(locale, "/forgot-password")}?notice=sent`);
}

export async function resetClientPasswordAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const tokenHash = cleanText(formData.get("tokenHash"), 512);
  if (!tokenHash) redirect(`${clientPath(locale, "/reset-password")}?error=invalid-link`);
  try {
    await resetClientPasswordWithTokenHash(tokenHash, cleanPassword(formData.get("password")));
  } catch {
    redirect(`${clientPath(locale, "/reset-password")}?error=invalid-link`);
  }
  redirect(clientPath(locale));
}

export async function logoutClientAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  await destroyClientSession();
  redirect(clientPath(locale, "/login"));
}

async function projectIdForSlug(token: string, slug: string): Promise<string> {
  const rows = await clientRest<Array<{ id: string }>>(`cms_projects?select=id&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`, { token });
  if (!rows[0]) throw new Error("Project not found.");
  return rows[0].id;
}

export async function saveProjectAction(input: { slug: string; locale: ClientLocale }): Promise<{ saved: boolean }> {
  const context = await requireClientContext(input.locale);
  const projectId = await projectIdForSlug(context.accessToken, cleanText(input.slug, 120));
  const existing = await clientRest<Array<{ project_id: string }>>(`client_saved_projects?select=project_id&project_id=eq.${projectId}&limit=1`, { token: context.accessToken });
  if (!existing[0]) {
    await clientRest("client_saved_projects", { token: context.accessToken, method: "POST", prefer: "return=minimal", body: { user_id: context.user.id, project_id: projectId } });
  }
  revalidatePath(clientPath(input.locale, "/saved"));
  return { saved: true };
}

export async function removeSavedProjectAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const projectId = cleanUuid(formData.get("projectId"), "Project");
  await clientRest<void>(`client_saved_projects?project_id=eq.${projectId}`, { token: context.accessToken, method: "DELETE", prefer: "return=minimal" });
  revalidatePath(clientPath(locale, "/saved"));
}

export async function saveComparisonAction(input: { slugs: string[]; locale: ClientLocale; name?: string }): Promise<{ saved: boolean }> {
  const context = await requireClientContext(input.locale);
  const slugs = Array.from(new Set(input.slugs.map((slug) => cleanText(slug, 120)).filter(Boolean))).slice(0, 4);
  if (slugs.length < 2) throw new Error("Choose at least two projects.");
  const rows = await clientRest<Array<{ id: string; slug: string }>>(`cms_projects?select=id,slug&slug=in.(${slugs.map(encodeURIComponent).join(",")})&status=eq.published`, { token: context.accessToken });
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  const projectIds = slugs.map((slug) => bySlug.get(slug)).filter((id): id is string => Boolean(id));
  if (projectIds.length < 2) throw new Error("Comparison contains unavailable projects.");
  await clientRest("client_saved_comparisons", {
    token: context.accessToken,
    method: "POST",
    prefer: "return=minimal",
    body: { user_id: context.user.id, name: cleanText(input.name ?? "Saved comparison", 120) || "Saved comparison", project_ids: projectIds },
  });
  revalidatePath(clientPath(input.locale, "/compare"));
  return { saved: true };
}

export async function deleteComparisonAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const id = cleanUuid(formData.get("id"));
  await clientRest<void>(`client_saved_comparisons?id=eq.${id}`, { token: context.accessToken, method: "DELETE", prefer: "return=minimal" });
  revalidatePath(clientPath(locale, "/compare"));
}

export async function saveInvestmentAnalysisAction(input: { locale: ClientLocale; projectSlug?: string | null; unitId?: string | null; name: string; scenarioKey?: string | null; inputsJson: string; outputsJson: string }): Promise<{ saved: boolean }> {
  const context = await requireClientContext(input.locale);
  const projectId = input.projectSlug ? await projectIdForSlug(context.accessToken, cleanText(input.projectSlug, 120)).catch(() => null) : null;
  const body = {
    user_id: context.user.id,
    project_id: projectId,
    unit_id: input.unitId || null,
    name: cleanText(input.name, 120) || "Investment analysis",
    locale: input.locale,
    scenario_key: cleanText(input.scenarioKey ?? "", 40) || null,
    inputs: cleanJsonObject(input.inputsJson),
    outputs: cleanJsonObject(input.outputsJson),
  };
  await clientRest("client_investment_snapshots", { token: context.accessToken, method: "POST", body, prefer: "return=minimal" });
  revalidatePath(clientPath(input.locale, "/analyses"));
  return { saved: true };
}

export async function deleteInvestmentAnalysisAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const id = cleanUuid(formData.get("id"));
  await clientRest<void>(`client_investment_snapshots?id=eq.${id}`, { token: context.accessToken, method: "DELETE", prefer: "return=minimal" });
  revalidatePath(clientPath(locale, "/analyses"));
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const id = cleanUuid(formData.get("id"));
  await clientRest<void>(`client_notifications?id=eq.${id}`, {
    token: context.accessToken,
    method: "PATCH",
    body: { is_read: true, read_at: new Date().toISOString() },
    prefer: "return=minimal",
  });
  revalidatePath(clientPath(locale, "/notifications"));
}

export async function markAllNotificationsReadAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  await clientRest<void>("client_notifications?is_read=eq.false", {
    token: context.accessToken,
    method: "PATCH",
    body: { is_read: true, read_at: new Date().toISOString() },
    prefer: "return=minimal",
  });
  revalidatePath(clientPath(locale, "/notifications"));
}

export async function updateClientProfileAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  await clientRest<void>(`client_profiles?user_id=eq.${context.user.id}`, {
    token: context.accessToken,
    method: "PATCH",
    body: {
      full_name: cleanText(formData.get("fullName"), 120),
      phone: cleanText(formData.get("phone"), 40) || null,
      preferred_locale: cleanLocale(formData.get("preferredLocale")),
      preferred_currency: cleanCurrency(formData.get("preferredCurrency")),
      marketing_opt_in: formData.get("marketingOptIn") === "on",
      last_seen_at: new Date().toISOString(),
    },
    prefer: "return=minimal",
  });
  revalidatePath(clientPath(locale, "/profile"));
}

export async function createWatchlistRuleAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const projectId = cleanUuid(formData.get("projectId"), "Project");
  const ruleType = cleanText(formData.get("ruleType"), 40);
  if (!["price-below","construction-reaches","new-unit"].includes(ruleType)) throw new Error("Unsupported watchlist rule.");
  const thresholdRaw = String(formData.get("threshold") ?? "").trim();
  const threshold = thresholdRaw ? Number(thresholdRaw) : null;
  if (threshold !== null && (!Number.isFinite(threshold) || threshold < 0)) throw new Error("Threshold is invalid.");
  await clientRest("client_watchlist_rules", {
    token: context.accessToken,
    method: "POST",
    prefer: "return=minimal",
    body: { user_id: context.user.id, project_id: projectId, rule_type: ruleType, threshold_numeric: threshold, channels: ["in-app"] },
  });
  revalidatePath(clientPath(locale, "/watchlist"));
}

export async function deleteWatchlistRuleAction(formData: FormData): Promise<void> {
  const locale = cleanLocale(formData.get("locale"));
  const context = await requireClientContext(locale);
  const id = cleanUuid(formData.get("id"));
  await clientRest<void>(`client_watchlist_rules?id=eq.${id}`, { token: context.accessToken, method: "DELETE", prefer: "return=minimal" });
  revalidatePath(clientPath(locale, "/watchlist"));
}
