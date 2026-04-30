import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export function extensionFromMimeType(mimeType: string, fileName = "file") {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("png")) return "png";
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("svg")) return "svg";
  if (normalized.includes("pdf")) return "pdf";
  if (normalized.includes("word")) return "docx";
  if (normalized.includes("plain")) return "txt";

  const fromName = fileName.split(".").pop();
  return fromName ? sanitizeFilePart(fromName) : "bin";
}

export function ensureAbsoluteUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function compactText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

export function getHeadlineFromPrompt(prompt: string, fallback: string) {
  const cleaned = prompt
    .replace(/^create\s+/i, "")
    .replace(/^design\s+/i, "")
    .replace(/^make\s+/i, "")
    .trim();

  return compactText(cleaned || fallback, 64);
}
