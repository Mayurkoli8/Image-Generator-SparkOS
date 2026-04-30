import OpenAI from "openai";
import { getOpenAiApiKey, getOpenAiImageModel, getOpenAiImageQuality } from "@/lib/env";
import { getAspectRatioConfig } from "@/lib/campaigns";

export type ProviderResult = {
  buffer: Buffer;
  mimeType: string;
  model: string;
  provider: string;
  usedReferences: string[];
};

async function fetchRemoteFile(url: string, index: number) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/png";
  return new File([arrayBuffer], `reference-${index}.png`, { type: contentType });
}

export async function generateImageWithOpenAi(options: {
  prompt: string;
  aspectRatio: string;
  outputFormat: string;
  referenceImageUrls: string[];
}) {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const size = `${getAspectRatioConfig(options.aspectRatio).width}x${getAspectRatioConfig(options.aspectRatio).height}`;
  const model = getOpenAiImageModel();
  const quality = getOpenAiImageQuality();
  const safeFormat = options.outputFormat === "jpg" ? "jpeg" : options.outputFormat;

  let response: any;
  const usedReferences = options.referenceImageUrls.slice(0, 4);

  if (usedReferences.length > 0) {
    const files = await Promise.all(usedReferences.map((url, index) => fetchRemoteFile(url, index)));
    response = await (client.images as any).edit({
      model,
      prompt: options.prompt,
      image: files,
      size,
      quality,
      output_format: safeFormat,
      response_format: "b64_json",
    });
  } else {
    response = await (client.images as any).generate({
      model,
      prompt: options.prompt,
      size,
      quality,
      output_format: safeFormat,
      response_format: "b64_json",
    });
  }

  const imageData = response?.data?.[0]?.b64_json;

  if (!imageData) {
    throw new Error("OpenAI did not return image data.");
  }

  return {
    buffer: Buffer.from(imageData, "base64"),
    mimeType: safeFormat === "jpeg" ? "image/jpeg" : "image/png",
    model,
    provider: "openai",
    usedReferences,
  } satisfies ProviderResult;
}
