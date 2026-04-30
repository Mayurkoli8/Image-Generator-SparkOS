import OpenAI from "openai";
import type { ImagesResponse } from "openai/resources/images";
import fs from "fs";
import path from "path";
import os from "os";
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

async function writeBufferToTempFile(buffer: Buffer, ext: string = ".png"): Promise<string> {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `openai-img-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(tmpFile, buffer);
  return tmpFile;
}

async function fetchRemoteFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateImageWithOpenAi(options: {
  prompt: string;
  aspectRatio: string;
  outputFormat: string;
  logoBuffer?: Buffer | null;
  referenceImageUrls?: string[];
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

  let response: ImagesResponse;
  let usedReferences: string[] = [];
  const tempFiles: string[] = [];

  try {
    // Prepare images for edit API (if we have logo or references)
    const hasLogo = options.logoBuffer && options.logoBuffer.length > 0;
    const hasReferences = options.referenceImageUrls && options.referenceImageUrls.length > 0;

    if (hasLogo || hasReferences) {
      // Use the logo as the primary image, or first reference if no logo
      const primaryImageBuffer = hasLogo 
        ? options.logoBuffer! 
        : await fetchRemoteFile(options.referenceImageUrls![0]);
      
      const primaryTmpFile = await writeBufferToTempFile(primaryImageBuffer);
      tempFiles.push(primaryTmpFile);

      // Collect reference images
      const referenceBuffers: Buffer[] = [];
      if (hasReferences) {
        for (const url of options.referenceImageUrls!) {
          try {
            const refBuffer = await fetchRemoteFile(url);
            referenceBuffers.push(refBuffer);
            usedReferences.push(url);
          } catch (error) {
            console.warn(`Failed to fetch reference image ${url}:`, error);
          }
        }
      }

      // For edit API, we need the image as a File object
      const imageBuffer = fs.readFileSync(primaryTmpFile);
      const imageFile = new File([imageBuffer], hasLogo ? "logo.png" : "reference.png", { 
        type: "image/png" 
      });

      response = await (client.images.edit as any)({
        model,
        image: imageFile,
        prompt: options.prompt,
        size,
        quality,
        n: 1,
        output_format: safeFormat,
      });
    } else {
      // Pure generation without images
      response = await client.images.generate({
        model,
        prompt: options.prompt,
        size,
        quality,
        output_format: safeFormat,
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
  } finally {
    // Clean up temp files
    for (const tmpFile of tempFiles) {
      try {
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile);
        }
      } catch (error) {
        console.warn(`Failed to clean up temp file ${tmpFile}:`, error);
      }
    }
  }
}
