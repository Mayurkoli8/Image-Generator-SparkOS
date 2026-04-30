import sharp from "sharp";
import { getAspectRatioConfig, getCampaignLabel } from "@/lib/campaigns";
import { compactText, escapeXml, getHeadlineFromPrompt } from "@/lib/utils";

type ComposePosterInput = {
  aspectRatio: string;
  brandName: string;
  campaignType: string;
  prompt: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  phone?: string | null;
  website?: string | null;
  socialHandle?: string | null;
  officeAddress?: string | null;
  defaultCta?: string | null;
  tagline?: string | null;
  logoBuffer?: Buffer | null;
  baseImageBuffer?: Buffer | null;
};

function normalizeColor(value: string | null | undefined, fallback: string) {
  const color = value?.trim().toLowerCase();

  if (!color) return fallback;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
  if (/^[a-z]+$/i.test(color)) return color;
  if (color.includes("cyan")) return "#22d3ee";
  if (color.includes("red")) return "#f87171";
  if (color.includes("gold")) return "#c6a15b";
  if (color.includes("black")) return "#101820";
  if (color.includes("white")) return "#ffffff";

  return fallback;
}

function getPosterHeadline(options: ComposePosterInput) {
  const prompt = options.prompt.toLowerCase();

  if (prompt.includes("new year") || options.campaignType === "new_year") return "Happy New Year";
  if (options.campaignType === "festival_greeting") return "Festive Greetings";
  if (options.campaignType === "property_launch") return "Now Launching";
  if (options.campaignType === "offer_promotion") return "Limited Offer";
  if (options.campaignType === "site_visit_invitation") return "Site Visit Invitation";
  if (options.campaignType === "possession_update") return "Possession Update";
  if (options.campaignType === "milestone_announcement") return "Milestone Achieved";
  if (options.campaignType === "project_highlight") return "Project Highlight";
  if (options.campaignType === "construction_progress") return "Construction Update";
  if (options.campaignType === "testimonial") return "Homeowner Story";

  return getHeadlineFromPrompt(options.prompt, getCampaignLabel(options.campaignType));
}

function createFallbackSvg(options: ComposePosterInput, width: number, height: number) {
  const headline = escapeXml(getPosterHeadline(options));
  const campaignLabel = escapeXml(getCampaignLabel(options.campaignType).toUpperCase());
  const tagline = escapeXml(compactText(options.tagline || "Premium real estate marketing design", 70));
  const primary = normalizeColor(options.primaryColor, "#101820");
  const secondary = normalizeColor(options.secondaryColor, "#c6a15b");

  return Buffer.from(
    `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${primary}" />
            <stop offset="100%" stop-color="#0b1220" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)" />
        <rect x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="${height * 0.56}" rx="34" fill="rgba(255,255,255,0.06)" />
        <rect x="${width * 0.08}" y="${height * 0.17}" width="${width * 0.36}" height="${height * 0.36}" rx="22" fill="rgba(255,255,255,0.08)" />
        <rect x="${width * 0.48}" y="${height * 0.17}" width="${width * 0.44}" height="${height * 0.09}" rx="18" fill="rgba(255,255,255,0.08)" />
        <rect x="${width * 0.48}" y="${height * 0.30}" width="${width * 0.36}" height="${height * 0.03}" rx="12" fill="rgba(255,255,255,0.14)" />
        <rect x="${width * 0.48}" y="${height * 0.36}" width="${width * 0.25}" height="${height * 0.03}" rx="12" fill="rgba(255,255,255,0.12)" />
        <rect x="${width * 0.08}" y="${height * 0.72}" width="${width * 0.84}" height="${height * 0.2}" rx="28" fill="url(#panel)" stroke="rgba(255,255,255,0.08)" />
        <text x="${width * 0.08}" y="${height * 0.10}" font-size="${Math.round(width * 0.028)}" fill="${secondary}" font-family="Inter, Arial, sans-serif" letter-spacing="2">${campaignLabel}</text>
        <text x="${width * 0.08}" y="${height * 0.62}" font-size="${Math.round(width * 0.06)}" fill="#ffffff" font-weight="700" font-family="Inter, Arial, sans-serif">${headline}</text>
        <text x="${width * 0.08}" y="${height * 0.68}" font-size="${Math.round(width * 0.024)}" fill="rgba(255,255,255,0.72)" font-family="Inter, Arial, sans-serif">${tagline}</text>
      </svg>
    `,
  );
}

function createOverlaySvg(options: ComposePosterInput, width: number, height: number) {
  const secondary = normalizeColor(options.secondaryColor, "#c6a15b");
  const primary = normalizeColor(options.primaryColor, "#101820");
  const headline = escapeXml(compactText(getPosterHeadline(options), 34));
  const subhead = escapeXml(compactText(options.tagline || "", 64));
  const lineOne = escapeXml(compactText([options.phone, options.website].filter(Boolean).join(" | "), 82));
  const lineTwo = escapeXml(compactText([options.socialHandle, options.officeAddress].filter(Boolean).join(" | "), 92));
  const cta = options.defaultCta?.trim()
    ? escapeXml(compactText(options.defaultCta, 28))
    : null;
  const footerTextWidth = cta ? 0.61 : 0.78;

  return Buffer.from(
    `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(9,14,22,0)" />
            <stop offset="100%" stop-color="rgba(9,14,22,0.82)" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.42"/>
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#fade)" />
        <text x="${width * 0.56}" y="${height * 0.13}" text-anchor="middle" font-size="${Math.round(width * 0.058)}" fill="#ffffff" font-weight="800" font-family="Inter, Arial, sans-serif" filter="url(#softShadow)">${headline}</text>
        ${subhead ? `<text x="${width * 0.56}" y="${height * 0.17}" text-anchor="middle" font-size="${Math.round(width * 0.021)}" fill="${secondary}" font-weight="600" font-family="Inter, Arial, sans-serif" filter="url(#softShadow)">${subhead}</text>` : ""}
        <rect x="${width * 0.06}" y="${height * 0.81}" width="${width * 0.88}" height="${height * 0.12}" rx="20" fill="rgba(9,14,22,0.84)" stroke="rgba(255,255,255,0.12)" />
        <text x="${width * 0.09}" y="${height * 0.855}" font-size="${Math.round(width * 0.023)}" fill="${secondary}" font-weight="800" font-family="Inter, Arial, sans-serif">${escapeXml(options.brandName)}</text>
        <text x="${width * 0.09}" y="${height * 0.889}" font-size="${Math.round(width * 0.017)}" fill="rgba(255,255,255,0.88)" font-family="Inter, Arial, sans-serif" textLength="${width * footerTextWidth}" lengthAdjust="spacingAndGlyphs">${lineOne}</text>
        <text x="${width * 0.09}" y="${height * 0.914}" font-size="${Math.round(width * 0.015)}" fill="rgba(255,255,255,0.68)" font-family="Inter, Arial, sans-serif" textLength="${width * footerTextWidth}" lengthAdjust="spacingAndGlyphs">${lineTwo}</text>
        ${cta ? `<rect x="${width * 0.72}" y="${height * 0.842}" width="${width * 0.18}" height="${height * 0.048}" rx="999" fill="${secondary}" />
        <text x="${width * 0.81}" y="${height * 0.873}" text-anchor="middle" font-size="${Math.round(width * 0.016)}" fill="${primary}" font-weight="800" font-family="Inter, Arial, sans-serif">${cta}</text>` : ""}
      </svg>
    `,
  );
}

export async function composePoster(options: ComposePosterInput) {
  const ratio = getAspectRatioConfig(options.aspectRatio);
  const width = ratio.width;
  const height = ratio.height;

  const base = options.baseImageBuffer
    ? sharp(options.baseImageBuffer).resize(width, height, { fit: "cover" })
    : sharp(createFallbackSvg(options, width, height));

  const composites: sharp.OverlayOptions[] = [
    {
      input: createOverlaySvg(options, width, height),
      top: 0,
      left: 0,
    },
  ];

  if (options.logoBuffer) {
    const logoCardWidth = Math.round(width * 0.22);
    const logoCardHeight = Math.round(height * 0.095);
    const logoPadding = Math.round(Math.min(logoCardWidth, logoCardHeight) * 0.16);
    const logo = await sharp(options.logoBuffer)
      .resize({
        width: logoCardWidth - logoPadding * 2,
        height: logoCardHeight - logoPadding * 2,
        fit: "contain",
      })
      .png()
      .toBuffer();

    composites.push({
      input: await sharp({
        create: {
          width: logoCardWidth,
          height: logoCardHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0.98 },
        },
      })
        .composite([{ input: logo, gravity: "center" }])
        .png()
        .toBuffer(),
      top: Math.round(height * 0.045),
      left: Math.round(width * 0.06),
    });
  }

  const final = await base.composite(composites).png().toBuffer();
  const thumbnail = await sharp(final).resize(480).webp({ quality: 88 }).toBuffer();

  return {
    final,
    thumbnail,
    width,
    height,
  };
}
