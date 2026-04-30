import { getRecentHistory } from "@/lib/generation-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getRecentHistory();
  return Response.json({ items });
}
