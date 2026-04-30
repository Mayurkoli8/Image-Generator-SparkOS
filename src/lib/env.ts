import path from "node:path";

const placeholderKeyPrefix = "__n8n_BLANK_VALUE";

export function getPublicAppUrl() {
  return (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getStorageRootDir() {
  const raw = process.env.LOCAL_STORAGE_DIR || "./.data/storage";
  return path.isAbsolute(raw)
    ? raw
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), raw);
}

export function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key || key.startsWith(placeholderKeyPrefix)) {
    return null;
  }

  return key;
}

export function getOpenAiImageModel() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
}

export function getOpenAiImageQuality() {
  return process.env.OPENAI_IMAGE_QUALITY?.trim() || "high";
}

export function getWebhookSecret() {
  return process.env.WEBHOOK_SECRET?.trim() || null;
}

export function getRateLimitWindowMs() {
  return Number(process.env.RATE_LIMIT_WINDOW_MS || "60000");
}

export function getRateLimitMax() {
  return Number(process.env.RATE_LIMIT_MAX || "20");
}
