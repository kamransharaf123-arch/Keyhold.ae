import type { ReactNode } from "react";
import { ClientShell } from "@/components/client/client-shell";
import { requireClient } from "@/lib/client/session";
import type { ClientLocale } from "@/types/client-portal";

export async function AccountProtectedLayout({ locale, children }: { locale: ClientLocale; children: ReactNode }) {
  const user = await requireClient(locale);
  return <ClientShell locale={locale} user={user}>{children}</ClientShell>;
}
