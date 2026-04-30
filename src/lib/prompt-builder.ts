import type { Brand, CampaignTemplate } from "@prisma/client";
import { getCampaignLabel } from "@/lib/campaigns";

type PromptOptions = {
  brand: Brand;
  campaignType: string;
  prompt: string;
  aspectRatio: string;
  template: CampaignTemplate | null;
  brandResearch?: string | null;
  currentDateTime?: string;
};

export function buildEnhancedPrompt(options: PromptOptions) {
  const lines = [
    "Create the background image for a premium real estate social poster.",
    `Current date and time: ${options.currentDateTime || new Date().toISOString()}.`,
    `Brand: ${options.brand.name}.`,
    `Campaign: ${getCampaignLabel(options.campaignType)}.`,
    `User prompt: ${options.prompt}.`,
    options.template?.promptScaffold ? `Creative direction: ${options.template.promptScaffold}` : null,
    `Brand personality: ${options.brand.tagline || `${options.brand.name} real estate brand`}.`,
    `Brand colors to subtly support: ${options.brand.primaryColor}, ${options.brand.secondaryColor}, ${options.brand.accentColor}.`,
    options.brand.designRules ? `Brand style notes: ${options.brand.designRules}.` : null,
    options.brandResearch ? `Public website/social context:\n${options.brandResearch}` : null,
    `Format: ${options.aspectRatio} poster background, crisp high-resolution photorealistic real estate imagery.`,
    "Use uploaded reference images only for visual style, property mood, angle, materials, lighting, and realism.",
    "Do not copy or redraw logos, brand marks, watermarks, captions, UI, borders, poster text, or typography from any reference image.",
    "Do not render any readable words, letters, numbers, dates, phone numbers, URLs, social handles, CTA text, signage, watermark, or logo in the image.",
    "Leave natural clean space near the top-left for an exact logo overlay and near the bottom for exact contact details.",
    "The final logo, headline, contact details, and CTA will be added later by code, so the generated image must stay text-free.",
    "Prioritize realistic luxury interiors/exteriors, natural lighting, sharp details, correct perspective, and believable materials.",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}
