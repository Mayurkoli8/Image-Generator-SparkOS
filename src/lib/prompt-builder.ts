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
    
    "CRITICAL - TOP-RIGHT CORNER RESERVED FOR LOGO:",
    "- The top-right corner (approximately 20% of width × 15% of height) is ABSOLUTELY RESERVED FOR LOGO PLACEMENT",
    "- DO NOT PUT ANY TEXT, BRAND NAME, OR ELEMENTS WHATSOEVER IN THE TOP-RIGHT CORNER",
    "- NO brand names, NO company text, NO watermarks in the top-right area",
    "- Keep top-right area with subtle background gradient or lighting to make future logo visible",
    "- The top-right area should look naturally lighter or slightly different from surroundings for contrast when logo is added",
    "",
    "POSTER LAYOUT & COMPOSITION:",
    "- Top-left and top-center: Place all headline and branding text HERE, NOT in top-right",
    brandInfo.headline ? `- Main headline (top-center area, AVOID right side): "${brandInfo.headline}"` : "- Include a compelling main headline in the top-center/left area",
    brandInfo.headline ? `- Subheadline (top-center area): "${options.brand.tagline || 'Premium Real Estate'}"` : null,
    "- Bottom footer: Semi-transparent dark bar with brand information and contact details",
    brandInfo.contactDetails ? `- Contact details in footer: ${contactParts.join(" | ")}` : null,
    brandInfo.cta ? `- Call-to-action button/text in footer: "${brandInfo.cta}"` : null,
    "",
    "DESIGN REQUIREMENTS:",
    "- Background must be stunning real estate imagery (luxury interiors/exteriors, natural lighting)",
    "- Text must be clearly readable with excellent contrast and professional typography",
    "- Headline and subheadline should be positioned in CENTER-TOP or TOP-LEFT, leaving TOP-RIGHT completely empty",
    "- Add subtle gradient or brightness adjustment to top-right (5-10% lighter/brighter) for logo visibility without looking forced",
    "- Use brand colors in footer bar and accents throughout",
    "- Maintain premium, sophisticated aesthetic appropriate for luxury real estate",
    "- All text must be sharp, legible, and properly positioned for social media",
    "- Generate this as a complete, ready-to-post image - only logo will be added post-generation",
    "Prioritize realistic luxury property showcase, natural lighting, sharp details, correct perspective, and premium materials.",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}
