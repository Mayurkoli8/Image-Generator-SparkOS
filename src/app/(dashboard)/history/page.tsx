import { HistoryClient } from "@/components/history-client";
import { PageHeader } from "@/components/page-header";
import { getRecentHistory } from "@/lib/generation-service";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const history = await getRecentHistory();

  return (
    <div>
      <PageHeader
        eyebrow="History"
        title="Generation history"
        description="See past poster runs, open detail pages, reuse prompts, and download final images again whenever needed."
      />
      <HistoryClient
        items={history.map((item) => ({
          id: item.id,
          prompt: item.prompt,
          campaignType: item.campaignType,
          imageUrl: item.imageUrl,
          thumbnailUrl: item.thumbnailUrl,
          createdAt: item.createdAt.toISOString(),
          brand: {
            name: item.brand.name,
          },
        }))}
      />
    </div>
  );
}
