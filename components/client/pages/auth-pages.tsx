import Link from "next/link";
import { loginClientAction, registerClientAction, requestClientRecoveryAction, resetClientPasswordAction } from "@/app/client-actions";
import { clientPath } from "@/lib/client/locale";
import type { ClientLocale } from "@/types/client-portal";

function AuthShell({ locale, title, text, children }: { locale: ClientLocale; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="site-container py-16 sm:py-24">
      <div className="mx-auto max-w-lg rounded-[32px] border border-black/8 bg-[var(--color-soft-white)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-teal)]">{locale === "fr" ? "Espace privé KeyHold" : "Private KeyHold access"}</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-graphite)]">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">{text}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", autoComplete, required = true }: { label: string; name: string; type?: string; autoComplete?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm text-[var(--color-graphite)]"><span>{label}</span><input className="min-h-12 rounded-xl border border-black/12 bg-white px-4 text-base outline-none focus:border-[var(--color-teal)]" name={name} type={type} autoComplete={autoComplete} required={required} /></label>;
}

export async function ClientLoginPage({ locale, searchParams }: { locale: ClientLocale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const error = query.error === "invalid";
  const notice = query.notice === "check-email";
  const next = typeof query.next === "string" ? query.next : "";
  return <AuthShell locale={locale} title={locale === "fr" ? "Se connecter" : "Sign in"} text={locale === "fr" ? "Accédez à vos biens, paiements, documents et analyses KeyHold." : "Access your properties, payments, documents and KeyHold analyses."}>
    {error ? <p className="mb-4 rounded-xl bg-[var(--color-champagne-soft)] p-3 text-sm">{locale === "fr" ? "Email ou mot de passe incorrect." : "Invalid email or password."}</p> : null}
    {notice ? <p className="mb-4 rounded-xl bg-[var(--color-sage-soft)] p-3 text-sm">{locale === "fr" ? "Vérifiez votre email pour confirmer votre compte." : "Check your email to confirm your account."}</p> : null}
    <form action={loginClientAction} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="next" value={next} />
      <Input label="Email" name="email" type="email" autoComplete="email" />
      <Input label={locale === "fr" ? "Mot de passe" : "Password"} name="password" type="password" autoComplete="current-password" />
      <button type="submit" className="button button-dark min-h-12">{locale === "fr" ? "Se connecter" : "Sign in"}</button>
    </form>
    <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
      <Link href={clientPath(locale, "/register")} className="text-[var(--color-teal)]">{locale === "fr" ? "Créer un compte" : "Create account"}</Link>
      <Link href={clientPath(locale, "/forgot-password")} className="text-[var(--color-stone)]">{locale === "fr" ? "Mot de passe oublié ?" : "Forgot password?"}</Link>
    </div>
  </AuthShell>;
}

export async function ClientRegisterPage({ locale, searchParams }: { locale: ClientLocale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <AuthShell locale={locale} title={locale === "fr" ? "Créer Mon KeyHold" : "Create My KeyHold"} text={locale === "fr" ? "Enregistrez vos biens favoris et retrouvez votre parcours d’investissement au même endroit." : "Save properties and keep your investment journey in one private place."}>
    {query.error ? <p className="mb-4 rounded-xl bg-[var(--color-champagne-soft)] p-3 text-sm">{locale === "fr" ? "Impossible de créer le compte. Vérifiez les informations ou utilisez un autre email." : "Unable to create the account. Check the details or use another email."}</p> : null}
    <form action={registerClientAction} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <Input label={locale === "fr" ? "Nom complet" : "Full name"} name="fullName" autoComplete="name" />
      <Input label="Email" name="email" type="email" autoComplete="email" />
      <Input label={locale === "fr" ? "Mot de passe (10 caractères minimum)" : "Password (10 characters minimum)"} name="password" type="password" autoComplete="new-password" />
      <button type="submit" className="button button-dark min-h-12">{locale === "fr" ? "Créer mon compte" : "Create account"}</button>
    </form>
    <p className="mt-5 text-sm text-[var(--color-stone)]">{locale === "fr" ? "Déjà inscrit ?" : "Already registered?"} <Link href={clientPath(locale, "/login")} className="text-[var(--color-teal)]">{locale === "fr" ? "Se connecter" : "Sign in"}</Link></p>
  </AuthShell>;
}

export async function ClientForgotPasswordPage({ locale, searchParams }: { locale: ClientLocale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <AuthShell locale={locale} title={locale === "fr" ? "Réinitialiser le mot de passe" : "Reset password"} text={locale === "fr" ? "Nous vous envoyons un lien sécurisé si le compte existe." : "We will send a secure recovery link if the account exists."}>
    {query.notice === "sent" ? <p className="mb-4 rounded-xl bg-[var(--color-sage-soft)] p-3 text-sm">{locale === "fr" ? "Email envoyé. Vérifiez votre boîte de réception." : "Email sent. Check your inbox."}</p> : null}
    {query.error ? <p className="mb-4 rounded-xl bg-[var(--color-champagne-soft)] p-3 text-sm">{locale === "fr" ? "Veuillez attendre puis réessayer." : "Please wait and try again."}</p> : null}
    <form action={requestClientRecoveryAction} className="grid gap-4"><input type="hidden" name="locale" value={locale} /><Input label="Email" name="email" type="email" autoComplete="email" /><button className="button button-dark min-h-12" type="submit">{locale === "fr" ? "Envoyer le lien" : "Send recovery link"}</button></form>
  </AuthShell>;
}

export async function ClientResetPasswordPage({ locale, searchParams }: { locale: ClientLocale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const tokenHash = typeof query.token_hash === "string" ? query.token_hash : "";
  return <AuthShell locale={locale} title={locale === "fr" ? "Nouveau mot de passe" : "New password"} text={locale === "fr" ? "Choisissez un nouveau mot de passe sécurisé." : "Choose a new secure password."}>
    {!tokenHash || query.error ? <p className="mb-4 rounded-xl bg-[var(--color-champagne-soft)] p-3 text-sm">{locale === "fr" ? "Le lien est invalide ou a expiré. Demandez-en un nouveau." : "The link is invalid or expired. Request a new one."}</p> : null}
    {tokenHash ? <form action={resetClientPasswordAction} className="grid gap-4"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="tokenHash" value={tokenHash} /><Input label={locale === "fr" ? "Nouveau mot de passe" : "New password"} name="password" type="password" autoComplete="new-password" /><button className="button button-dark min-h-12" type="submit">{locale === "fr" ? "Mettre à jour" : "Update password"}</button></form> : null}
  </AuthShell>;
}
