import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { getPublicAppUrl, getStorageRootDir } from "@/lib/env";
import { extensionFromMimeType, sanitizeFilePart } from "@/lib/utils";

export type StoredFile = {
  absolutePath: string;
  publicUrl: string;
  storageKey: string;
};

function ensureStorageDir() {
  const root = getStorageRootDir();
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function buildPublicFileUrl(storageKey: string) {
  const encoded = storageKey
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${getPublicAppUrl()}/api/files/${encoded}`;
}

export function saveBufferToStorage(options: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  folder: string;
}) {
  const root = ensureStorageDir();
  const extension = extensionFromMimeType(options.mimeType, options.fileName);
  const fileNameBase = sanitizeFilePart(path.parse(options.fileName).name || "file");
  const finalFileName = `${fileNameBase}-${nanoid(10)}.${extension}`;
  const folder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const storageKey = `${folder}/${finalFileName}`;
  const absolutePath = path.join(root, ...storageKey.split("/"));

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, options.buffer);

  return {
    absolutePath,
    publicUrl: buildPublicFileUrl(storageKey),
    storageKey,
  } satisfies StoredFile;
}

export function readStoredFile(storageKey: string) {
  const root = ensureStorageDir();
  const safeParts = storageKey.split("/").filter((part) => part && part !== "." && part !== "..");
  const absolutePath = path.join(root, ...safeParts);

  if (!absolutePath.startsWith(root)) {
    return null;
  }

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return {
    absolutePath,
    buffer: fs.readFileSync(absolutePath),
  };
}

export function guessContentType(storageKey: string) {
  const ext = path.extname(storageKey).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
