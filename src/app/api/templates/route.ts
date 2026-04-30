import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await getPrisma().campaignTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return Response.json({ templates });
}
