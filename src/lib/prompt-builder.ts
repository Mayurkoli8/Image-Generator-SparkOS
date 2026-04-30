import type { Brand, CampaignTemplate } from "@prisma/client";
import { getCampaignLabel } from "@/lib/campaigns";

type PromptOptions = {
  brand: Brand;
  campaignType: string;
  prompt: string;
  aspectRatio: string;
  template: CampaignTemplate | null;
  customTextFields?: Record<string, string>;
  brandResearch?: string | null;
};

export function buildEnhancedPrompt(options: PromptOptions) {
  const lines = [
    `Create a polished, premium real estate marketing poster for ${options.brand.name}.`,
    `Campaign type: ${getCampaignLabel(options.campaignType)}.`,
    `User request: ${options.prompt}.`,
    `Campaign direction: ${
      options.template?.promptScaffold ||
      "Create a clean luxury real estate social post with strong layout discipline and premium brand presentation."
    }`,
    `Brand personality: ${options.brand.tagline || `${options.brand.name} real estate brand`}.`,
    `Brand colors to evoke: primary ${options.brand.primaryColor}, secondary ${options.brand.secondaryColor}, accent ${options.brand.accentColor}.`,
    `Typography mood: ${
      options.brand.typography || "Modern premium sans-serif with elegant high-contrast headings"
    }.`,
    `Brand design rules: ${
      options.brand.designRules ||
      "Keep the composition premium, uncluttered, aspirational, and social-media ready."
    }.`,
    options.brandResearch ? `Website and social research context:\n${options.brandResearch}` : null,
    `Layout rules: ${
      options.template?.layoutGuidance ||
      "Keep safe space for the logo, strong footer details, and a clear CTA band."
    }`,
    `Output format: ${options.aspectRatio} social media poster, high-end Instagram-ready composition.`,
    "Use a modern luxury layout, strong visual hierarchy, clean spacing, high contrast, and realistic aspirational property imagery.",
    "Leave clear safe space in the top-left area for a logo overlay and in the bottom area for contact details and CTA overlay.",
    "Do not draw, invent, imitate, approximate, or place the brand logo. The exact uploaded transparent logo will be composited later on a clean white logo plate.",
    "Do not render readable phone numbers, websites, handles, addresses, CTA text, years, dates, or tiny legal text. Use visual placeholder spacing only; exact mandatory brand text will be added later by code.",
  ].filter((line): line is string => Boolean(line));

  if (options.customTextFields && Object.keys(options.customTextFields).length > 0) {
    const textFields = Object.entries(options.customTextFields)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    lines.push(`Additional campaign fields to reflect visually: ${textFields}.`);
  }

  return lines.join("\n");
}
