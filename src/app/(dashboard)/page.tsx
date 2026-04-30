import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader } from "@/components/page-header";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const prisma = getPrisma();
  const [brandCount, assetCount, templateCount, generationCount, recentGenerations] = await Promise.all([
    prisma.brand.count(),
    prisma.brandAsset.count(),
    prisma.campaignTemplate.count(),
    prisma.generationJob.count(),
    prisma.generationJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { brand: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Real estate poster studio"
        description="Manage your brand kit, generate premium marketing creatives, and return hosted image URLs to n8n with one clean workflow."
        badge="Render-ready single app"
      />
      <DashboardOverview
        stats={{ brandCount, assetCount, templateCount, generationCount }}
        recentGenerations={recentGenerations.map((item) => ({
          id: item.id,
          imageUrl: item.thumbnailUrl || item.imageUrl,
          prompt: item.prompt,
          campaignType: item.campaignType,
          createdAt: item.createdAt.toISOString(),
          brandName: item.brand.name,
        }))}
      />
    </div>
  );
}
