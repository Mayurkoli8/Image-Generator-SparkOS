import { WebhookSettingsClient } from "@/components/webhook-settings-client";
import { PageHeader } from "@/components/page-header";
import { getPublicAppUrl } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WebhookSettingsPage() {
  const brands = await getPrisma().brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Webhook"
        title="Webhook settings"
        description="Connect n8n to your poster engine. Send a JSON payload in, receive the final hosted image URL and metadata back out."
      />
      <WebhookSettingsClient
        brands={brands.map((brand) => ({
          id: brand.id,
          slug: brand.slug,
          name: brand.name,
        }))}
        publicAppUrl={getPublicAppUrl()}
      />
    </div>
  );
}
