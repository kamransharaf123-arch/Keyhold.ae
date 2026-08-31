import { ClientLoginPage } from "@/components/client/pages/auth-pages";

export const metadata = { robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ClientLoginPage locale="en" searchParams={searchParams} />;
}
