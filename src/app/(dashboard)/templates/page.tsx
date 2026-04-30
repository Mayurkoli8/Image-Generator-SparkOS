import { PageHeader } from "@/components/page-header";
import { TemplateLibraryClient } from "@/components/template-library-client";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getPrisma().campaignTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Templates"
        title="Template library"
        description="Use these campaign-ready scaffolds for greetings, launches, offers, updates, testimonials, and awareness posts."
      />
      <TemplateLibraryClient templates={templates} />
    </div>
  );
}
