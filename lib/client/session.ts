import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertCmsConfigured, cmsAuthUrl } from "@/lib/cms/config";
import { clientRest } from "@/lib/client/rest";
import { clientPath } from "@/lib/client/locale";
import type { ClientLocale, ClientUser } from "@/types/client-portal";

const ACCESS_COOKIE = "kh_client_access";
const REFRESH_COOKIE = "kh_client_refresh";

type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email?: string };
};

type AuthUserPayload = { id: string; email?: string };
type ClientProfileRow = {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  preferred_locale: ClientLocale;
  preferred_currency: ClientUser["preferredCurrency"];
  marketing_opt_in: boolean;
  advisor_user_id: string | null;
  status: "active" | "blocked";
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function setSessionCookies(session: AuthSessionPayload): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.access_token, cookieOptions(Math.max(60, session.expires_in - 30)));
  store.set(REFRESH_COOKIE, session.refresh_token, cookieOptions(60 * 60 * 24 * 30));
}

async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

async function fetchAuthUser(accessToken: string): Promise<AuthUserPayload | null> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("user"), {
    headers: { apikey: env.anonKey, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return response.ok ? (await response.json()) as AuthUserPayload : null;
}

async function refreshSession(refreshToken: string): Promise<AuthSessionPayload | null> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("token?grant_type=refresh_token"), {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  return response.ok ? (await response.json()) as AuthSessionPayload : null;
}

function mapProfile(row: ClientProfileRow): ClientUser {
  return {
    id: row.user_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    preferredLocale: row.preferred_locale,
    preferredCurrency: row.preferred_currency,
    marketingOptIn: row.marketing_opt_in,
    advisorUserId: row.advisor_user_id,
  };
}

async function ensureProfile(token: string, authUser: AuthUserPayload, fullName = ""): Promise<ClientProfileRow> {
  const existing = await clientRest<ClientProfileRow[]>(
    `client_profiles?select=user_id,email,full_name,phone,preferred_locale,preferred_currency,marketing_opt_in,advisor_user_id,status&user_id=eq.${encodeURIComponent(authUser.id)}&limit=1`,
    { token },
  );
  if (existing[0]) return existing[0];

  const created = await clientRest<ClientProfileRow[]>("client_profiles", {
    token,
    method: "POST",
    prefer: "return=representation",
    body: {
      user_id: authUser.id,
      email: authUser.email ?? "",
      full_name: fullName.trim().slice(0, 120),
      preferred_locale: "en",
      preferred_currency: "AED",
      marketing_opt_in: false,
    },
  });
  if (!created[0]) throw new Error("Unable to create client profile.");
  return created[0];
}

async function resolveContextUncached(): Promise<{ user: ClientUser; accessToken: string } | null> {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value ?? "";
  const refreshToken = store.get(REFRESH_COOKIE)?.value ?? "";
  if (!accessToken && !refreshToken) return null;

  let authUser = accessToken ? await fetchAuthUser(accessToken) : null;
  if (!authUser && refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (!refreshed) {
      await clearSessionCookies();
      return null;
    }
    await setSessionCookies(refreshed);
    accessToken = refreshed.access_token;
    authUser = refreshed.user;
  }
  if (!authUser || !accessToken) return null;

  const rows = await clientRest<ClientProfileRow[]>(
    `client_profiles?select=user_id,email,full_name,phone,preferred_locale,preferred_currency,marketing_opt_in,advisor_user_id,status&user_id=eq.${encodeURIComponent(authUser.id)}&limit=1`,
    { token: accessToken },
  );
  const profile = rows[0] ?? await ensureProfile(accessToken, authUser);
  if (profile.status !== "active") {
    await clearSessionCookies();
    return null;
  }
  return { user: mapProfile(profile), accessToken };
}

// React cache deduplicates authentication/profile checks within one server render.
export const getClientSessionContext = cache(resolveContextUncached);
export const getClientSessionContextFresh = resolveContextUncached;

export async function getClientUser(): Promise<ClientUser | null> {
  return (await getClientSessionContext())?.user ?? null;
}

export async function requireClient(locale: ClientLocale = "en"): Promise<ClientUser> {
  const context = await getClientSessionContext();
  if (!context) redirect(`${clientPath(locale, "/login")}?next=${encodeURIComponent(clientPath(locale))}`);
  return context.user;
}

export async function requireClientContext(locale: ClientLocale = "en"): Promise<{ user: ClientUser; accessToken: string }> {
  const context = await getClientSessionContext();
  if (!context) redirect(`${clientPath(locale, "/login")}?next=${encodeURIComponent(clientPath(locale))}`);
  return context;
}

export async function authenticateClient(email: string, password: string): Promise<ClientUser> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("token?grant_type=password"), {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Invalid email or password.");
  const session = (await response.json()) as AuthSessionPayload;
  const profile = await ensureProfile(session.access_token, session.user);
  if (profile.status !== "active") throw new Error("This KeyHold account is not active.");
  await setSessionCookies(session);
  return mapProfile(profile);
}

export async function registerClient(input: { email: string; password: string; fullName: string }): Promise<{ requiresConfirmation: boolean }> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("signup"), {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
      data: { full_name: input.fullName.trim().slice(0, 120) },
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.includes("already registered") ? "An account already exists for this email." : "Unable to create account.");
  }
  const payload = (await response.json()) as Partial<AuthSessionPayload> & { user?: AuthUserPayload };
  if (payload.access_token && payload.refresh_token && payload.expires_in && payload.user) {
    const session = payload as AuthSessionPayload;
    await ensureProfile(session.access_token, session.user, input.fullName);
    await setSessionCookies(session);
    return { requiresConfirmation: false };
  }
  return { requiresConfirmation: true };
}

export async function requestClientPasswordRecovery(email: string): Promise<void> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("recover"), {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to send recovery email. Please wait and try again.");
}

export async function resetClientPasswordWithTokenHash(tokenHash: string, password: string): Promise<void> {
  const env = assertCmsConfigured();
  const verify = await fetch(cmsAuthUrl("verify"), {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ token_hash: tokenHash, type: "recovery" }),
    cache: "no-store",
  });
  if (!verify.ok) throw new Error("This recovery link is invalid or has expired.");
  const session = (await verify.json()) as AuthSessionPayload;
  const update = await fetch(cmsAuthUrl("user"), {
    method: "PUT",
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });
  if (!update.ok) throw new Error("Unable to update password.");
  await setSessionCookies(session);
}

export async function destroyClientSession(): Promise<void> {
  await clearSessionCookies();
}
