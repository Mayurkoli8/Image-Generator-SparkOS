import { guessContentType, readStoredFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const storageKey = key.join("/");
  const file = readStoredFile(storageKey);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(file.buffer, {
    headers: {
      "Content-Type": guessContentType(storageKey),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
