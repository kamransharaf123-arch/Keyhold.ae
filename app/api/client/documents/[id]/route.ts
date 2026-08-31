import { NextResponse } from "next/server";
import { getClientSessionContextFresh } from "@/lib/client/session";
import { clientRest } from "@/lib/client/rest";
import { createPrivateDocumentSignedUrl } from "@/lib/client/documents";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getClientSessionContextFresh();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found", { status: 404 });

  const rows = await clientRest<Array<{ storage_path: string }>>(
    `client_documents?select=storage_path&id=eq.${encodeURIComponent(id)}&limit=1`,
    { token: session.accessToken },
  );
  if (!rows[0]) return new NextResponse("Not found", { status: 404 });

  const signedUrl = await createPrivateDocumentSignedUrl(rows[0].storage_path, 90);
  return NextResponse.redirect(signedUrl, { status: 302 });
}
