import { BrandSettingsClient } from "@/components/brand-settings-client";
import { PageHeader } from "@/components/page-header";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BrandSettingsPage() {
  const brands = await getPrisma().brand.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Brand Setup"
        title="Brand settings"
        description="Store the brand details that must appear correctly on every poster: colors, tagline, website, phone number, social handle, and design rules."
      />
      <BrandSettingsClient
        initialBrands={brands.map((brand) => ({
          ...brand,
          website: brand.website || "",
          phone: brand.phone || "",
          officeAddress: brand.officeAddress || "",
          socialHandle: brand.socialHandle || "",
          tagline: brand.tagline || "",
          typography: brand.typography || "",
          designRules: brand.designRules || "",
          defaultCta: brand.defaultCta || "",
          logoAssetId: brand.logoAssetId || "",
        }))}
      />
    </div>
  );
}
