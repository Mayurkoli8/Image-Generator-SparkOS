import { PromptStudioClient } from "@/components/prompt-studio-client";
import { PageHeader } from "@/components/page-header";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PromptStudioPage() {
  const prisma = getPrisma();
  const [brands, templates, assets] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.campaignTemplate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brandAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Studio"
        title="Prompt studio"
        description="Choose a brand, improve simple prompts into polished campaign briefs, preview the output, and copy the hosted image URL."
      />
      <PromptStudioClient
        brands={brands.map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug }))}
        templates={templates}
        assets={assets.map((asset) => ({
          id: asset.id,
          brandId: asset.brandId,
          type: asset.type,
          name: asset.name,
          mimeType: asset.mimeType,
          publicUrl: asset.publicUrl,
        }))}
      />
    </div>
  );
}
