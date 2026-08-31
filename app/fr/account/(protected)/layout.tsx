import type { ReactNode } from "react";
import { AccountProtectedLayout } from "@/components/client/pages/account-layout";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return <AccountProtectedLayout locale="fr">{children}</AccountProtectedLayout>;
}
