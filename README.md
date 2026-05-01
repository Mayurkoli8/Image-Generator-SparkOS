# BrandPoster AI

BrandPoster AI is a single Next.js app for real estate companies that need a simple brand-controlled poster studio.

It lets your team:
- create brand profiles
- upload logos, posters, apartment photos, PDFs, DOCX, and text files
- generate social media posters from prompts
- preview and download the final image
- copy a hosted image URL
- trigger poster generation from n8n with a webhook

The app is already structured for Render deployment.

## Tomorrow Deploy Steps

If you want the shortest path:

1. Push this repo to GitHub.
2. Create a Render Web Service from the repo.
3. Let Render use the included `render.yaml`.
4. In Render Environment, set:
   - `OPENAI_API_KEY`
   - `PUBLIC_APP_URL`
5. Deploy.

Example:

```txt
PUBLIC_APP_URL=https://your-app-name.onrender.com
```

That is the main setup you need.

## Important Notes

- If `OPENAI_API_KEY` is missing, the app still works and creates a branded fallback poster.
- Exact phone number, website, social handle, and CTA are added by code after generation so the final poster stays consistent.
- The webhook endpoint is:

```txt
POST /api/webhook/generate-poster
```

## Main Pages

- `/` Dashboard
- `/brand-settings`
- `/assets`
- `/prompt-studio`
- `/history`
- `/webhook-settings`
- `/templates`

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- OpenAI SDK
- Sharp

## Project Structure

```txt
prisma/
  schema.prisma
  seed.ts
  migrations/

scripts/
  prepare-runtime-env.mjs

src/
  app/
    (dashboard)/
    api/
  components/
    ui/
  lib/

render.yaml
```

## Environment Variables

Use these values:

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_IMAGE_MODEL="gpt-image-1.5"
OPENAI_IMAGE_QUALITY="medium"
PUBLIC_APP_URL="http://localhost:3000"
LOCAL_STORAGE_DIR="./.data/storage"
WEBHOOK_SECRET=""
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="20"
```

## Render Settings

The included `render.yaml` already sets the build and start commands.

Manual values if you ever need them:

```txt
Build Command: npm ci && npm run render-build
Start Command: npm run start
Health Check Path: /api/health
```

You should not need to manually set:

```txt
DATABASE_URL
LOCAL_STORAGE_DIR
```

unless you specifically want custom paths.

## n8n Webhook Example

Request:

```json
{
  "requestId": "abc123",
  "brandId": "skyline-builders",
  "campaignType": "new_year",
  "prompt": "Create a premium New Year greeting post",
  "aspectRatio": "1:1",
  "outputFormat": "png",
  "referenceImageUrls": [],
  "customTextFields": {
    "cta": "Book a site visit"
  }
}
```

Success response:

```json
{
  "success": true,
  "generationId": "gen_id",
  "imageUrl": "https://your-app.onrender.com/api/files/generated/brand/poster.png",
  "thumbnailUrl": "https://your-app.onrender.com/api/files/generated/brand/thumbs/poster.webp",
  "brandId": "brand_id",
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

## Sample Prompt Ideas

- `Create a New Year post`
- `Create a 2 BHK luxury apartment offer post`
- `Create a site visit invitation for this weekend`
- `Create a possession update poster`
- `Create a project highlight for rooftop amenities`
- `Create a construction progress post for Tower B`

## Local Commands

```bash
npm ci
npm run build
npm run db:deploy
npm run db:seed
npm run start
```

Then open:

```txt
http://localhost:3000
```

## Current OpenAI Model Default

The default image model in this repo is now `gpt-image-1.5`, based on current official OpenAI image docs.

Sources:
- [OpenAI image generation guide](https://platform.openai.com/docs/guides/image-generation?lang=javascript)
- [OpenAI GPT Image 2 model page](https://platform.openai.com/docs/models/gpt-image-2)
