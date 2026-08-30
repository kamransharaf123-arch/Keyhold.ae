import "server-only";

export type CmsEnvironment = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  netlifyBuildHookUrl: string;
};

export function getCmsEnvironment(): CmsEnvironment {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    netlifyBuildHookUrl: process.env.NETLIFY_BUILD_HOOK_URL?.trim() ?? "",
  };
}

export function isCmsConfigured(): boolean {
  const env = getCmsEnvironment();
  return Boolean(env.supabaseUrl && env.anonKey && env.serviceRoleKey);
}

export function assertCmsConfigured(): CmsEnvironment {
  const env = getCmsEnvironment();
  if (!env.supabaseUrl || !env.anonKey || !env.serviceRoleKey) {
    throw new Error(
      "KeyHold CMS is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return env;
}

export function cmsRestUrl(path: string): string {
  const { supabaseUrl } = assertCmsConfigured();
  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path.replace(/^\//, "")}`;
}

export function cmsAuthUrl(path: string): string {
  const { supabaseUrl } = assertCmsConfigured();
  return `${supabaseUrl.replace(/\/$/, "")}/auth/v1/${path.replace(/^\//, "")}`;
}

export function cmsStorageUrl(path: string): string {
  const { supabaseUrl } = assertCmsConfigured();
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/${path.replace(/^\//, "")}`;
}
