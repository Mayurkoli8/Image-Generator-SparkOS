import { PrismaClient } from "@prisma/client";
import { campaignTemplates } from "../src/lib/campaigns";

const prisma = new PrismaClient();

async function main() {
  await prisma.brand.upsert({
    where: { slug: "skyline-builders" },
    update: {},
    create: {
      slug: "skyline-builders",
      name: "Skyline Builders",
      website: "https://skyline.example",
      phone: "+91 98765 43210",
      officeAddress: "MG Road, Bengaluru",
      socialHandle: "@skylinebuilders",
      tagline: "Elevated homes for modern city living",
      primaryColor: "#101820",
      secondaryColor: "#C6A15B",
      accentColor: "#FFFFFF",
      typography: "Elegant geometric sans-serif with premium editorial headings",
      designRules:
        "Use premium real estate imagery, restrained colors, generous spacing, clear CTA, and never hide contact details.",
      defaultCta: "Book a site visit",
    },
  });

  for (const template of campaignTemplates) {
    await prisma.campaignTemplate.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        campaignType: template.campaignType,
        description: template.description,
        promptScaffold: template.promptScaffold,
        layoutGuidance: template.layoutGuidance,
        defaultCta: template.defaultCta,
        isActive: true,
      },
      create: template,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
