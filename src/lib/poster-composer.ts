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

function createFallbackSvg(options: ComposePosterInput, width: number, height: number) {
  const headline = escapeXml(getHeadlineFromPrompt(options.prompt, getCampaignLabel(options.campaignType)));
  const campaignLabel = escapeXml(getCampaignLabel(options.campaignType).toUpperCase());
  const tagline = escapeXml(compactText(options.tagline || "Premium real estate marketing design", 70));

  return Buffer.from(
    `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${options.primaryColor}" />
            <stop offset="100%" stop-color="#0B1220" />
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
        <text x="${width * 0.08}" y="${height * 0.10}" font-size="${Math.round(width * 0.028)}" fill="${options.secondaryColor}" font-family="Inter, Arial, sans-serif" letter-spacing="2">${campaignLabel}</text>
        <text x="${width * 0.08}" y="${height * 0.62}" font-size="${Math.round(width * 0.06)}" fill="#FFFFFF" font-weight="700" font-family="Inter, Arial, sans-serif">${headline}</text>
        <text x="${width * 0.08}" y="${height * 0.68}" font-size="${Math.round(width * 0.024)}" fill="rgba(255,255,255,0.72)" font-family="Inter, Arial, sans-serif">${tagline}</text>
      </svg>
    `,
  );
}

function createOverlaySvg(options: ComposePosterInput, width: number, height: number) {
  const footerText = [options.phone, options.website, options.socialHandle]
    .filter(Boolean)
    .join(" | ");
  const cta = escapeXml(compactText(options.defaultCta || "Book a site visit", 28));
  const brandName = escapeXml(options.brandName);
  const footer = escapeXml(compactText(footerText || "Premium real estate brand", 72));
  const address = escapeXml(compactText(options.officeAddress || options.tagline || "", 78));

  return Buffer.from(
    `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(9,14,22,0)" />
            <stop offset="100%" stop-color="rgba(9,14,22,0.86)" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#fade)" />
        <rect x="${width * 0.06}" y="${height * 0.81}" width="${width * 0.88}" height="${height * 0.12}" rx="22" fill="rgba(9,14,22,0.8)" stroke="rgba(255,255,255,0.1)" />
        <text x="${width * 0.09}" y="${height * 0.856}" font-size="${Math.round(width * 0.024)}" fill="${options.secondaryColor}" font-weight="700" font-family="Inter, Arial, sans-serif">${brandName}</text>
        <text x="${width * 0.09}" y="${height * 0.89}" font-size="${Math.round(width * 0.016)}" fill="rgba(255,255,255,0.84)" font-family="Inter, Arial, sans-serif">${footer}</text>
        <text x="${width * 0.09}" y="${height * 0.915}" font-size="${Math.round(width * 0.014)}" fill="rgba(255,255,255,0.66)" font-family="Inter, Arial, sans-serif">${address}</text>
        <rect x="${width * 0.72}" y="${height * 0.835}" width="${width * 0.18}" height="${height * 0.05}" rx="999" fill="${options.secondaryColor}" />
        <text x="${width * 0.81}" y="${height * 0.868}" text-anchor="middle" font-size="${Math.round(width * 0.018)}" fill="${options.primaryColor}" font-weight="700" font-family="Inter, Arial, sans-serif">${cta}</text>
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
    const logoCardWidth = Math.round(width * 0.24);
    const logoCardHeight = Math.round(height * 0.105);
    const logoPadding = Math.round(Math.min(logoCardWidth, logoCardHeight) * 0.14);
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

  const thumbnail = await sharp(final).resize(480).webp({ quality: 86 }).toBuffer();

  return {
    final,
    thumbnail,
    width,
    height,
  };
}
