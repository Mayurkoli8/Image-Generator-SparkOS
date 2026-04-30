import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");

function parseEnvFile(content) {
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function quote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const existing = fs.existsSync(envPath)
  ? parseEnvFile(fs.readFileSync(envPath, "utf8"))
  : {};

const renderDatabaseUrl = "file:./.render-data/brandposter.db";
const renderStorageDir = "./.render-data/storage";

const defaults = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    existing.DATABASE_URL ||
    (process.env.RENDER ? renderDatabaseUrl : "file:./dev.db"),
  LOCAL_STORAGE_DIR:
    process.env.LOCAL_STORAGE_DIR ||
    existing.LOCAL_STORAGE_DIR ||
    (process.env.RENDER ? renderStorageDir : "./.data/storage"),
  OPENAI_IMAGE_MODEL:
    process.env.OPENAI_IMAGE_MODEL || existing.OPENAI_IMAGE_MODEL || "gpt-image-2",
  OPENAI_IMAGE_QUALITY:
    process.env.OPENAI_IMAGE_QUALITY || existing.OPENAI_IMAGE_QUALITY || "medium",
  RATE_LIMIT_WINDOW_MS:
    process.env.RATE_LIMIT_WINDOW_MS || existing.RATE_LIMIT_WINDOW_MS || "60000",
  RATE_LIMIT_MAX:
    process.env.RATE_LIMIT_MAX || existing.RATE_LIMIT_MAX || "20",
};

const merged = {
  ...existing,
  ...defaults,
};

if (process.env.OPENAI_API_KEY) {
  merged.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
}

if (process.env.PUBLIC_APP_URL) {
  merged.PUBLIC_APP_URL = process.env.PUBLIC_APP_URL;
}

if (process.env.WEBHOOK_SECRET) {
  merged.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
}

function ensureRuntimeDirectories(databaseUrl, storageDir) {
  if (databaseUrl.startsWith("file:")) {
    const sqlitePath = databaseUrl.slice("file:".length);
    const resolvedSqlitePath = path.isAbsolute(sqlitePath)
      ? sqlitePath
      : path.resolve(root, sqlitePath);

    fs.mkdirSync(path.dirname(resolvedSqlitePath), { recursive: true });
  }

  const resolvedStorageDir = path.isAbsolute(storageDir)
    ? storageDir
    : path.resolve(root, storageDir);

  fs.mkdirSync(resolvedStorageDir, { recursive: true });
}

ensureRuntimeDirectories(merged.DATABASE_URL, merged.LOCAL_STORAGE_DIR);

const output = [
  "# Auto-prepared environment defaults for local dev and Render",
  ...Object.entries(merged).map(([key, value]) => `${key}=${quote(value)}`),
  "",
].join("\n");

fs.writeFileSync(envPath, output, "utf8");
console.log(`Prepared runtime env at ${envPath}`);
