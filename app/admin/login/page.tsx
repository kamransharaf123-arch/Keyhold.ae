import { redirect } from "next/navigation";
import { signInAction } from "@/app/admin/actions";
import { AdminNotice, Field, inputClass } from "@/components/admin/admin-ui";
import { getAdminUser } from "@/lib/admin/session";
import { isCmsConfigured } from "@/lib/cms/config";

export const metadata = { title: "Admin Login | KeyHold", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const query = await searchParams;
  return (
    <section className="site-container py-16 lg:py-24">
      <div className="mx-auto max-w-lg border border-black/10 bg-[var(--color-soft-white)] p-6 sm:p-9">
        <p className="eyebrow">KeyHold Admin</p>
        <h1 className="font-display mt-3 text-4xl tracking-[-0.03em]">Private workspace.</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">Manage projects, inventory, media, updates and KeyHold Intelligence. This area is restricted to authorised team members.</p>
        <div className="mt-6"><AdminNotice error={query.error} /></div>
        {!isCmsConfigured() ? <div className="mb-5 border border-[var(--color-terracotta)] bg-[var(--color-terracotta-soft)] p-4 text-sm text-[var(--color-terracotta-deep)]">CMS environment variables are not configured yet. Follow the Module 6 setup guide before signing in.</div> : null}
        <form action={signInAction} className="grid gap-5">
          <Field label="Email"><input className={inputClass} type="email" autoComplete="email" name="email" required /></Field>
          <Field label="Password"><input className={inputClass} type="password" autoComplete="current-password" name="password" required /></Field>
          <button type="submit" className="button button-dark">Sign in</button>
        </form>
      </div>
    </section>
  );
}
