import OpenAI from "openai";
import type { ImagesResponse } from "openai/resources/images";
import { getOpenAiApiKey, getOpenAiImageModel, getOpenAiImageQuality } from "@/lib/env";

export type ProviderResult = {
  buffer: Buffer;
  mimeType: string;
  model: string;
  provider: string;
  usedReferences: string[];
};

type OpenAiImageSize = "1024x1024" | "1024x1536" | "1536x1024";
type OpenAiImageQuality = "low" | "medium" | "high" | "auto";
type OpenAiImageFormat = "png" | "jpeg" | "webp";

function getOpenAiSize(aspectRatio: string): OpenAiImageSize {
  if (aspectRatio === "16:9") {
    return "1536x1024";
  }

  if (aspectRatio === "4:5" || aspectRatio === "9:16") {
    return "1024x1536";
  }

  return "1024x1024";
}

function getOpenAiQuality(quality: string): OpenAiImageQuality {
  return ["low", "medium", "high", "auto"].includes(quality) ? (quality as OpenAiImageQuality) : "medium";
}

function getOpenAiFormat(format: string): OpenAiImageFormat {
  if (format === "jpg") {
    return "jpeg";
  }

  return ["png", "jpeg", "webp"].includes(format) ? (format as OpenAiImageFormat) : "png";
}

export async function generateImageWithOpenAi(options: {
  prompt: string;
  aspectRatio: string;
  outputFormat: string;
}) {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const size = getOpenAiSize(options.aspectRatio);
  const model = getOpenAiImageModel();
  const quality = getOpenAiQuality(getOpenAiImageQuality());
  const safeFormat = getOpenAiFormat(options.outputFormat);

  const response = await client.images.generate({
    model,
    prompt: options.prompt,
    size,
    quality,
    output_format: safeFormat,
  });

  const imageData = response?.data?.[0]?.b64_json;

  if (!imageData) {
    throw new Error("OpenAI did not return image data.");
  }

  return {
    buffer: Buffer.from(imageData, "base64"),
    mimeType: safeFormat === "jpeg" ? "image/jpeg" : "image/png",
    model,
    provider: "openai",
    usedReferences: [],
  } satisfies ProviderResult;
}
