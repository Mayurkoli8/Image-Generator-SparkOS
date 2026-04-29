-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "officeAddress" TEXT,
    "socialHandle" TEXT,
    "tagline" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "secondaryColor" TEXT NOT NULL DEFAULT '#C6A15B',
    "accentColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "typography" TEXT,
    "designRules" TEXT,
    "defaultCta" TEXT,
    "logoAssetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BrandAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandAsset_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "promptScaffold" TEXT NOT NULL,
    "layoutGuidance" TEXT NOT NULL,
    "defaultCta" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "requestId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "prompt" TEXT NOT NULL,
    "enhancedPrompt" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL DEFAULT 'png',
    "quality" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "storageKey" TEXT,
    "thumbnailStorageKey" TEXT,
    "error" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "GenerationJob_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "brandId" TEXT,
    "generationJobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "payload" TEXT NOT NULL,
    "response" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WebhookRequest_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WebhookRequest_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "enhancedPrompt" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptHistory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "BrandAsset_brandId_idx" ON "BrandAsset"("brandId");

-- CreateIndex
CREATE INDEX "BrandAsset_type_idx" ON "BrandAsset"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTemplate_slug_key" ON "CampaignTemplate"("slug");

-- CreateIndex
CREATE INDEX "CampaignTemplate_campaignType_idx" ON "CampaignTemplate"("campaignType");

-- CreateIndex
CREATE INDEX "CampaignTemplate_isActive_idx" ON "CampaignTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationJob_requestId_key" ON "GenerationJob"("requestId");

-- CreateIndex
CREATE INDEX "GenerationJob_brandId_idx" ON "GenerationJob"("brandId");

-- CreateIndex
CREATE INDEX "GenerationJob_campaignType_idx" ON "GenerationJob"("campaignType");

-- CreateIndex
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");

-- CreateIndex
CREATE INDEX "GenerationJob_createdAt_idx" ON "GenerationJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookRequest_requestId_key" ON "WebhookRequest"("requestId");

-- CreateIndex
CREATE INDEX "WebhookRequest_brandId_idx" ON "WebhookRequest"("brandId");

-- CreateIndex
CREATE INDEX "WebhookRequest_status_idx" ON "WebhookRequest"("status");

-- CreateIndex
CREATE INDEX "PromptHistory_brandId_idx" ON "PromptHistory"("brandId");

-- CreateIndex
CREATE INDEX "PromptHistory_campaignType_idx" ON "PromptHistory"("campaignType");

-- CreateIndex
CREATE INDEX "PromptHistory_createdAt_idx" ON "PromptHistory"("createdAt");
