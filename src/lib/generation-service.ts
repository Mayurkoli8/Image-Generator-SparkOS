import { nanoid } from "nanoid";
import type { BrandAsset, CampaignTemplate } from "@prisma/client";
import { getCampaignLabel } from "@/lib/campaigns";
import { getPrisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import { scrapeBrandResearch } from "@/lib/brand-research";
import { buildEnhancedPrompt } from "@/lib/prompt-builder";
import { generateImageWithOpenAi } from "@/lib/openai-image-provider";
import { composePoster } from "@/lib/poster-composer";
import { readStoredFile, saveBufferToStorage } from "@/lib/storage";

type GeneratePosterInput = {
  brandId: string;
  prompt: string;
  campaignType: string;
  aspectRatio: string;
  outputFormat?: string;
  quality?: string;
  referenceAssetIds?: string[];
  referenceImageUrls?: string[];
  customTextFields?: Record<string, string>;
  requestId?: string;
  source?: "manual" | "webhook";
};

type GenerationResponse = {
  success: true;
  generationId: string;
  imageUrl: string;
  thumbnailUrl: string;
  brandId: string;
  campaignType: string;
  promptUsed: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

async function getStoredAssetBuffer(asset: BrandAsset | null) {
  if (!asset) {
    return null;
  }

  const stored = readStoredFile(asset.storageKey);
  return stored?.buffer || null;
}

async function findBrand(brandId: string) {
  const prisma = getPrisma();
  return prisma.brand.findFirst({
    where: {
      OR: [{ id: brandId }, { slug: brandId }],
    },
    include: {
      assets: true,
    },
  });
}

async function loadTemplate(campaignType: string): Promise<CampaignTemplate | null> {
  return getPrisma().campaignTemplate.findFirst({
    where: {
      campaignType,
      isActive: true,
    },
  });
}

export async function generatePoster(input: GeneratePosterInput): Promise<GenerationResponse> {
  const prisma = getPrisma();
  const brand = await findBrand(input.brandId);

  if (!brand) {
    throw new Error("Brand not found.");
  }

  if (input.requestId) {
    const existing = await prisma.generationJob.findUnique({
      where: { requestId: input.requestId },
    });

    if (existing?.status === "completed" && existing.imageUrl && existing.thumbnailUrl) {
      return {
        success: true,
        generationId: existing.id,
        imageUrl: existing.imageUrl,
        thumbnailUrl: existing.thumbnailUrl,
        brandId: brand.id,
        campaignType: existing.campaignType,
        promptUsed: existing.enhancedPrompt,
        createdAt: existing.createdAt.toISOString(),
        metadata: safeJsonParse(existing.metadata, {}),
      };
    }
  }

  const [template, brandResearch] = await Promise.all([
    loadTemplate(input.campaignType),
    scrapeBrandResearch({
      brandName: brand.name,
      website: brand.website,
      socialHandle: brand.socialHandle,
    }),
  ]);
  const logoAsset =
    brand.assets.find((asset) => asset.id === brand.logoAssetId) ||
    brand.assets.find((asset) => asset.type === "logo") ||
    null;
  const referenceAssets = brand.assets.filter((asset) =>
    (input.referenceAssetIds || []).includes(asset.id) &&
    asset.type !== "logo" &&
    asset.mimeType.startsWith("image/"),
  );
  const referenceImageUrls = [
    ...referenceAssets.map((asset) => asset.publicUrl),
    ...(input.referenceImageUrls || []),
  ];
  const enhancedPrompt = buildEnhancedPrompt({
    brand,
    campaignType: input.campaignType,
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
    template,
    customTextFields: input.customTextFields,
    brandResearch: brandResearch.promptContext,
  });

  const job = await prisma.generationJob.create({
    data: {
      brandId: brand.id,
      requestId: input.requestId || null,
      source: input.source || "manual",
      prompt: input.prompt,
      enhancedPrompt,
      campaignType: input.campaignType,
      aspectRatio: input.aspectRatio,
      outputFormat: input.outputFormat || "png",
      quality: input.quality || "medium",
      status: "processing",
      metadata: JSON.stringify({
        referenceAssetIds: input.referenceAssetIds || [],
        referenceImageUrls: input.referenceImageUrls || [],
        brandResearchSources: brandResearch.sources,
        brandResearchWarnings: brandResearch.warnings,
      }),
    },
  });

  await prisma.promptHistory.create({
    data: {
      brandId: brand.id,
      prompt: input.prompt,
      enhancedPrompt,
      campaignType: input.campaignType,
      aspectRatio: input.aspectRatio,
    },
  });

  let providerBuffer: Buffer | null = null;
  let providerMeta: Record<string, unknown> = {
    provider: "local-fallback",
    fallbackReason: "OpenAI generation not attempted.",
    brandResearchSources: brandResearch.sources,
  };

  try {
    const generated = await generateImageWithOpenAi({
      prompt: enhancedPrompt,
      aspectRatio: input.aspectRatio,
      outputFormat: input.outputFormat || "png",
      referenceImageUrls,
    });

    providerBuffer = generated.buffer;
    providerMeta = {
      provider: generated.provider,
      model: generated.model,
      usedReferences: generated.usedReferences,
      brandResearchSources: brandResearch.sources,
      brandResearchWarnings: brandResearch.warnings,
    };
  } catch (error) {
    providerMeta = {
      provider: "local-fallback",
      fallbackReason: error instanceof Error ? error.message : "Unknown generation error.",
      referenceAssetIds: referenceAssets.map((asset) => asset.id),
      referenceImageUrls: input.referenceImageUrls || [],
      brandResearchSources: brandResearch.sources,
      brandResearchWarnings: brandResearch.warnings,
    };
  }

  const fallbackReference = referenceAssets.find((asset) => asset.mimeType.startsWith("image/")) || null;
  const fallbackBuffer = providerBuffer || (await getStoredAssetBuffer(fallbackReference));
  const logoBuffer = await getStoredAssetBuffer(logoAsset);

  const poster = await composePoster({
    aspectRatio: input.aspectRatio,
    brandName: brand.name,
    campaignType: input.campaignType,
    prompt: input.prompt,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
    phone: brand.phone,
    website: brand.website,
    socialHandle: brand.socialHandle,
    officeAddress: brand.officeAddress,
    defaultCta:
      input.customTextFields?.cta || template?.defaultCta || brand.defaultCta || "Book a site visit",
    tagline: brand.tagline,
    logoBuffer,
    baseImageBuffer: fallbackBuffer,
  });

  const finalFile = saveBufferToStorage({
    buffer: poster.final,
    mimeType: "image/png",
    fileName: `${brand.slug}-${nanoid(6)}.png`,
    folder: `generated/${brand.slug}`,
  });

  const thumbFile = saveBufferToStorage({
    buffer: poster.thumbnail,
    mimeType: "image/webp",
    fileName: `${brand.slug}-${nanoid(6)}.webp`,
    folder: `generated/${brand.slug}/thumbs`,
  });

  const metadata = {
    ...providerMeta,
    campaignLabel: getCampaignLabel(input.campaignType),
    overlay: {
      phone: brand.phone,
      website: brand.website,
      socialHandle: brand.socialHandle,
      cta: input.customTextFields?.cta || template?.defaultCta || brand.defaultCta || "Book a site visit",
    },
    outputSize: {
      width: poster.width,
      height: poster.height,
    },
  };

  const updated = await prisma.generationJob.update({
    where: { id: job.id },
    data: {
      status: "completed",
      imageUrl: finalFile.publicUrl,
      thumbnailUrl: thumbFile.publicUrl,
      storageKey: finalFile.storageKey,
      thumbnailStorageKey: thumbFile.storageKey,
      metadata: JSON.stringify(metadata),
      completedAt: new Date(),
    },
  });

  return {
    success: true,
    generationId: updated.id,
    imageUrl: updated.imageUrl!,
    thumbnailUrl: updated.thumbnailUrl!,
    brandId: brand.id,
    campaignType: updated.campaignType,
    promptUsed: enhancedPrompt,
    createdAt: updated.createdAt.toISOString(),
    metadata,
  };
}

export async function getGenerationById(id: string) {
  return getPrisma().generationJob.findUnique({
    where: { id },
    include: { brand: true },
  });
}

export async function getRecentHistory() {
  return getPrisma().generationJob.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true },
    take: 50,
  });
}
