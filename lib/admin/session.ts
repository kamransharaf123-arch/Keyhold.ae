import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertCmsConfigured, cmsAuthUrl } from "@/lib/cms/config";
import { cmsRest } from "@/lib/cms/rest";
import type { AdminRole, AdminUser } from "@/types/admin";

const ACCESS_COOKIE = "kh_admin_access";
const REFRESH_COOKIE = "kh_admin_refresh";

type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email?: string };
};

type AuthUserPayload = {
  id: string;
  email?: string;
};

type AdminProfileRow = {
  user_id: string;
  role: AdminRole;
  is_active: boolean;
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

async function refreshSession(refreshToken: string): Promise<AuthSessionPayload | null> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("token?grant_type=refresh_token"), {
    method: "POST",
    headers: {
      apikey: env.anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as AuthSessionPayload;
}

async function getAuthUser(accessToken: string): Promise<AuthUserPayload | null> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("user"), {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as AuthUserPayload;
}

async function resolveAdmin(accessToken: string, authUser: AuthUserPayload): Promise<AdminUser | null> {
  const rows = await cmsRest<AdminProfileRow[]>(
    `admin_profiles?select=user_id,role,is_active&user_id=eq.${encodeURIComponent(authUser.id)}&is_active=eq.true&limit=1`,
    { token: accessToken },
  );
  const profile = rows[0];
  if (!profile) return null;
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    role: profile.role,
  };
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser> {
  const env = assertCmsConfigured();
  const response = await fetch(cmsAuthUrl("token?grant_type=password"), {
    method: "POST",
    headers: {
      apikey: env.anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  const session = (await response.json()) as AuthSessionPayload;
  const admin = await resolveAdmin(session.access_token, session.user);
  if (!admin) {
    throw new Error("This account is not authorised for the KeyHold admin.");
  }

  await setSessionCookies(session);
  return admin;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const store = await cookies();
    let accessToken = store.get(ACCESS_COOKIE)?.value ?? "";
    const refreshToken = store.get(REFRESH_COOKIE)?.value ?? "";
    if (!accessToken && !refreshToken) return null;

    let authUser = accessToken ? await getAuthUser(accessToken) : null;
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
    const admin = await resolveAdmin(accessToken, authUser);
    if (!admin) {
      await clearSessionCookies();
      return null;
    }
    return admin;
  } catch (error) {
    // A Supabase Auth/PostgREST outage, bad credentials, or a schema mismatch must never crash
    // /admin/login or any requireAdmin() page — every admin route resolves its session through
    // this function, so an uncaught throw here takes the whole admin app down with it.
    console.error("[admin-session] getAdminUser failed; treating the request as unauthenticated.", error);
    return null;
  }
}

export async function requireAdmin(roles?: AdminRole[]): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
    throw new Error("Unauthorised admin session.");
  }
  if (roles && !roles.includes(admin.role)) {
    redirect("/admin?notice=insufficient-permission");
    throw new Error("Insufficient admin permission.");
  }
  return admin;
}

export async function destroyAdminSession(): Promise<void> {
  await clearSessionCookies();
}
