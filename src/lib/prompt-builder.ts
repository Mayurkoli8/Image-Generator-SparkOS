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

type PromptWithBrandInfo = PromptOptions & {
  logoName?: string;
  headline?: string;
  contactDetails?: {
    phone?: string;
    website?: string;
    socialHandle?: string;
    officeAddress?: string;
  };
  cta?: string;
};

export function buildEnhancedPrompt(options: PromptOptions | PromptWithBrandInfo) {
  const brandInfo = options as PromptWithBrandInfo;
  const contactParts = [
    brandInfo.contactDetails?.phone,
    brandInfo.contactDetails?.website,
    brandInfo.contactDetails?.socialHandle,
    brandInfo.contactDetails?.officeAddress,
  ].filter(Boolean);
  
  const lines = [
    "Create a complete, professional premium real estate social media poster.",
    `Current date and time: ${options.currentDateTime || new Date().toISOString()}.`,
    `Brand: ${options.brand.name}.`,
    `Campaign: ${getCampaignLabel(options.campaignType)}.`,
    `User prompt: ${options.prompt}.`,
    options.template?.promptScaffold ? `Creative direction: ${options.template.promptScaffold}` : null,
    `Brand personality: ${options.brand.tagline || `${options.brand.name} real estate brand`}.`,
    `Brand colors to use prominently: ${options.brand.primaryColor}, ${options.brand.secondaryColor}, ${options.brand.accentColor}.`,
    options.brand.designRules ? `Brand style notes: ${options.brand.designRules}.` : null,
    options.brandResearch ? `Public website/social context:\n${options.brandResearch}` : null,
    `Format: ${options.aspectRatio} poster, crisp high-resolution photorealistic real estate imagery with integrated text and branding.`,
    
    "POSTER LAYOUT & COMPOSITION:",
    "- Top-left corner: Leave space for logo (will be added after generation)",
    brandInfo.headline ? `- Main headline (centered top area): "${brandInfo.headline}"` : "- Include a compelling main headline in the top-center area",
    brandInfo.headline ? `- Subheadline: "${options.brand.tagline || 'Premium Real Estate'}"` : null,
    "- Bottom footer: Semi-transparent dark bar with brand information and contact details",
    brandInfo.contactDetails ? `- Contact details in footer: ${contactParts.join(" | ")}` : null,
    brandInfo.cta ? `- Call-to-action button/text in footer: "${brandInfo.cta}"` : null,
    
    "DESIGN REQUIREMENTS:",
    "- Background must be stunning real estate imagery (luxury interiors/exteriors, natural lighting)",
    "- Text must be clearly readable with excellent contrast and professional typography",
    "- Leave clean white space in top-left (approximately 22% width × 9.5% height) for logo placement",
    "- Use brand colors in footer bar and accents throughout",
    "- Maintain premium, sophisticated aesthetic appropriate for luxury real estate",
    "- All text must be sharp, legible, and properly positioned for social media",
    "- Generate this as a complete, ready-to-post image - no post-processing needed",
    "Prioritize realistic luxury property showcase, natural lighting, sharp details, correct perspective, and premium materials.",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}
