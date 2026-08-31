import { ClientRegisterPage } from "@/components/client/pages/auth-pages";

export const metadata = { robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ClientRegisterPage locale="fr" searchParams={searchParams} />;
}
