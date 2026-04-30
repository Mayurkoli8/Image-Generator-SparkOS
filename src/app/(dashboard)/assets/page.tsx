import { AssetUploadClient } from "@/components/asset-upload-client";
import { PageHeader } from "@/components/page-header";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const prisma = getPrisma();
  const [brands, assets] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.brandAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Assets"
        title="Asset upload"
        description="Upload your logo, poster references, apartment photography, brochures, PDFs, DOCX files, and text material in one place."
      />
      <AssetUploadClient
        brands={brands.map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug }))}
        initialAssets={assets.map((asset) => ({
          ...asset,
          createdAt: asset.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
