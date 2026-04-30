import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (process.env[key]) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadLocalEnvFile();

const prisma = new PrismaClient();

const campaignTemplates = [
  {
    slug: "festival-greeting-premium",
    name: "Premium Festival Greeting",
    campaignType: "festival_greeting",
    description: "Elegant festive greetings with a refined real estate brand presence.",
    promptScaffold:
      "Create a premium festive greeting for a real estate company, with subtle celebration cues, aspirational homes, refined lighting, and elegant negative space.",
    layoutGuidance:
      "Use a calm hero visual with a clean top logo zone and a strong footer strip for contact details. Avoid cluttered ornaments.",
    defaultCta: "Celebrate with us",
  },
  {
    slug: "new-year-luxury",
    name: "Luxury New Year Greeting",
    campaignType: "new_year",
    description: "Warm aspirational New Year creative for developers and builders.",
    promptScaffold:
      "Create a premium New Year greeting post for a real estate brand, using warm celebratory visuals, luxury apartment ambience, soft gold accents, and a hopeful forward-looking tone.",
    layoutGuidance:
      "Reserve clear safe space for the brand mark at the top and mandatory contact details in the footer.",
    defaultCta: "Start your new chapter",
  },
  {
    slug: "property-launch",
    name: "Property Launch",
    campaignType: "property_launch",
    description: "Launch announcement for a new tower, villa project, or apartment community.",
    promptScaffold:
      "Create a polished property launch poster with modern architecture, premium lifestyle cues, confident marketing hierarchy, and a strong launch announcement mood.",
    layoutGuidance:
      "Use dramatic but realistic architecture imagery, room for a short headline, and a bottom CTA/contact band.",
    defaultCta: "Enquire now",
  },
  {
    slug: "limited-offer",
    name: "Limited Offer Promotion",
    campaignType: "offer_promotion",
    description: "Promotional poster for discounts, booking offers, payment plans, or limited inventory.",
    promptScaffold:
      "Create a high-converting real estate offer poster with premium apartment visuals, high contrast, elegant offer emphasis, and a modern sales-oriented composition.",
    layoutGuidance:
      "Keep the offer area bold but not loud. Leave the exact phone, website, and CTA for code overlay.",
    defaultCta: "Claim the offer",
  },
  {
    slug: "site-visit-weekend",
    name: "Site Visit Invitation",
    campaignType: "site_visit_invitation",
    description: "Invite prospects to book or attend a site visit.",
    promptScaffold:
      "Create an inviting site visit poster for a premium real estate project, showing welcoming property ambience, clear appointment energy, and trust-building visual polish.",
    layoutGuidance:
      "Use a clean invitation structure with enough visual breathing room for schedule or CTA overlays.",
    defaultCta: "Book a site visit",
  },
  {
    slug: "possession-update",
    name: "Possession Update",
    campaignType: "possession_update",
    description: "Announce handover readiness, OC status, or possession milestones.",
    promptScaffold:
      "Create a polished possession update poster with confident completion cues, happy homebuyer feeling, finished building visuals, and premium trust signals.",
    layoutGuidance:
      "Use clean, reassuring composition. Avoid excessive celebration graphics.",
    defaultCta: "Schedule handover",
  },
  {
    slug: "milestone-announcement",
    name: "Milestone Announcement",
    campaignType: "milestone_announcement",
    description: "Celebrate sales, awards, construction, or company milestones.",
    promptScaffold:
      "Create a milestone announcement poster for a real estate company, using premium corporate celebration styling, restrained metallic accents, and a confident achievement mood.",
    layoutGuidance:
      "Keep the achievement area prominent with a brand-safe footer and clear visual hierarchy.",
    defaultCta: "Thank you for trusting us",
  },
  {
    slug: "brand-awareness",
    name: "Brand Awareness",
    campaignType: "brand_awareness",
    description: "Evergreen brand-building creative for trust and recognition.",
    promptScaffold:
      "Create a premium brand awareness poster for a real estate company with modern city living, refined architecture, trust, lifestyle aspiration, and clean editorial design.",
    layoutGuidance:
      "Use minimal copy areas, high-end imagery, and consistent safe zones for identity elements.",
    defaultCta: "Discover our projects",
  },
  {
    slug: "testimonial-story",
    name: "Testimonial Story",
    campaignType: "testimonial",
    description: "Customer testimonial or buyer story post.",
    promptScaffold:
      "Create a tasteful real estate testimonial poster with happy homeowner warmth, trust-building composition, premium muted design, and space for a short quote.",
    layoutGuidance:
      "Make the quote area legible and calm. Keep mandatory brand/contact overlay separate.",
    defaultCta: "Hear from our homeowners",
  },
  {
    slug: "project-highlight",
    name: "Project Highlight",
    campaignType: "project_highlight",
    description: "Highlight amenities, location benefits, views, plans, or project features.",
    promptScaffold:
      "Create a project highlight poster for a luxury apartment development with refined amenity visuals, strong feature emphasis, and modern high-contrast design.",
    layoutGuidance:
      "Use a strong image-led feature area with simple supporting visual hierarchy.",
    defaultCta: "Explore the project",
  },
  {
    slug: "construction-progress",
    name: "Construction Progress",
    campaignType: "construction_progress",
    description: "Progress update for ongoing construction and buyer confidence.",
    promptScaffold:
      "Create a polished construction progress update poster with real estate site progress cues, engineering confidence, clean corporate layout, and optimistic completion energy.",
    layoutGuidance:
      "Use credible progress imagery and avoid messy construction clutter. Keep brand and contact information exact via overlay.",
    defaultCta: "Track progress",
  },
] as const;

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
