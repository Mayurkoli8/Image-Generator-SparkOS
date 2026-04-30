# BrandPoster AI

BrandPoster AI is a production-ready Next.js app for real estate marketing teams. It stores brand kits and assets, enhances rough prompts into brand-aware campaign prompts, generates poster visuals with OpenAI image models, overlays exact logo/contact/CTA elements with code, stores the final image, and returns hosted URLs to the browser or n8n.

## What It Includes

- Dashboard, Brand Settings, Asset Upload, Prompt Studio, Generation Preview, History, Webhook Settings, and Template Library pages
- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, SQLite, OpenAI SDK, Sharp image compositing
- Local persistent file storage through `/api/files/...`, ready for Render persistent disk
- Prisma models for `Brand`, `BrandAsset`, `CampaignTemplate`, `GenerationJob`, `WebhookRequest`, and `PromptHistory`
- n8n webhook endpoint at `POST /api/webhook/generate-poster`
- Idempotent webhook requests via `requestId`
- Prompt templates for festival, New Year, launch, offer, site visit, possession, milestone, awareness, testimonial, project highlight, and construction progress posts
- Fallback poster generation when `OPENAI_API_KEY` is missing or image generation fails

## Folder Structure

```txt
prisma/
  schema.prisma                 Database models
  seed.ts                       Sample brand and campaign templates
  migrations/                   SQLite migration
src/app/
  (studio)/                     Product UI pages
  api/                          Next.js route handlers
src/components/
  ui/                           shadcn/ui components
  *-client.tsx                  Interactive product workflows
src/lib/
  generation-service.ts         End-to-end generation orchestration
  openai-image-provider.ts      Swappable OpenAI image provider
  poster-compositor.ts          Sharp overlay and thumbnail logic
  storage.ts                    Swappable storage adapter
  prompt-builder.ts             Brand-aware prompt enhancement
  validation.ts                 Zod input schemas
render.yaml                     Render blueprint
```

## Fast Deploy For You

If you only care about getting it live on Render:

1. Push the repo to GitHub.
2. Create a new Render Web Service from that repo.
3. Use the repo's `render.yaml` when Render asks.
4. Add `OPENAI_API_KEY`.
5. Add `PUBLIC_APP_URL` after Render gives you your live URL.
   Example: `https://your-app-name.onrender.com`
6. Deploy.

The app now auto-prepares safe defaults for SQLite and storage on Render, so you should not need to manually add `DATABASE_URL`.

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

For real AI image generation, set `OPENAI_API_KEY` in `.env`. Without it, the app still runs and produces a branded fallback poster so the full workflow can be tested.

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_IMAGE_MODEL="gpt-image-2"
OPENAI_IMAGE_QUALITY="medium"
PUBLIC_APP_URL="http://localhost:3000"
LOCAL_STORAGE_DIR="./.data/storage"
WEBHOOK_SECRET=""
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="20"
```

## Render Deployment

The included `render.yaml` provisions a Node web service and a persistent disk.

1. Push this repo to GitHub.
2. In Render, create a Blueprint from the repo or create a Web Service manually.
3. Set `OPENAI_API_KEY`.
4. Set `PUBLIC_APP_URL` to your Render URL, for example `https://brandposter-ai.onrender.com`.
5. Optional: set `WEBHOOK_SECRET` and send the same value from n8n as `x-webhook-secret`.

Manual Render settings:

```bash
Build Command: npm ci && npm run render-build
Start Command: npm run start
Health Check Path: /api/health
DATABASE_URL: optional now, the app will default this on Render
LOCAL_STORAGE_DIR: optional now, the app will default this on Render
```

## n8n Webhook

Endpoint:

```txt
POST /api/webhook/generate-poster
```

Headers:

```txt
content-type: application/json
x-webhook-secret: your-secret-if-configured
```

Example payload:

```json
{
  "requestId": "abc123",
  "brandId": "skyline-builders",
  "campaignType": "new_year",
  "prompt": "Create a premium New Year greeting post",
  "aspectRatio": "1:1",
  "outputFormat": "png",
  "referenceImageUrls": ["https://example.com/ref1.jpg"],
  "customTextFields": {
    "cta": "Book a site visit"
  }
}
```

Successful response:

```json
{
  "success": true,
  "generationId": "gen_id",
  "imageUrl": "https://your-app.onrender.com/api/files/generated/brand/poster.png",
  "thumbnailUrl": "https://your-app.onrender.com/api/files/generated/brand/thumbs/poster.webp",
  "brandId": "skyline-builders",
  "campaignType": "new_year",
  "promptUsed": "final enhanced prompt",
  "createdAt": "2026-04-30T00:00:00.000Z",
  "metadata": {}
}
```

Failure response:

```json
{
  "success": false,
  "error": "clear error message"
}
```

## Campaign Prompt Examples

- `Create a New Year post`
- `Create a 2 BHK luxury apartment offer post`
- `Announce possession starting this month`
- `Invite buyers for a weekend site visit`
- `Create a construction progress update for Tower B`
- `Create a testimonial post for a happy homeowner`

The app expands these into structured prompts with real estate context, brand colors, typography mood, design rules, campaign type, output format, and safe-space instructions for logo/contact overlays.

## Image Generation Design

`src/lib/openai-image-provider.ts` is the only OpenAI-specific provider file. The current default model is `gpt-image-2`. The app uses image generation/editing when references are available, saves base64 output to storage, and passes the image to `src/lib/poster-compositor.ts`.

Exact logo/contact/website/social/CTA content is not delegated to the model. Sharp composites those mandatory elements after generation so published posters keep reliable brand details.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:migrate
npm run db:seed
npm run render-build
```
