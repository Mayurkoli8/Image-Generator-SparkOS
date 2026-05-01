import { nanoid } from "nanoid";
import { getWebhookSecret } from "@/lib/env";
import { generatePoster } from "@/lib/generation-service";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getWebhookSecret();
  const providedSecret = request.headers.get("x-webhook-secret");

  if (secret && secret !== providedSecret) {
    return Response.json({ success: false, error: "Invalid webhook secret." }, { status: 401 });
  }

  const body = await request.json();
  const prisma = getPrisma();
  const requestId = body.requestId || `req_${nanoid(10)}`;
  
  // Debug: Log incoming brandId
  console.log(`[Webhook] Received brandId: ${body.brandId}`);

  const brand = body.brandId
    ? await prisma.brand.findFirst({
        where: {
          OR: [{ id: body.brandId }, { slug: body.brandId }],
        },
      })
    : null;

  // Debug: Log brand lookup result
  console.log(`[Webhook] Brand lookup result:`, brand ? `Found: ${brand.name}` : "Not found");

  const existingWebhook = await prisma.webhookRequest.findUnique({
    where: { requestId },
  });

  if (existingWebhook?.response) {
    return new Response(existingWebhook.response, {
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.webhookRequest.upsert({
    where: { requestId },
    update: {
      payload: JSON.stringify(body),
      status: "processing",
      brandId: brand?.id || null,
    },
    create: {
      requestId,
      brandId: brand?.id || null,
      payload: JSON.stringify(body),
      status: "processing",
    },
  });

  try {
    // Debug: Log generation start
    console.log(`[Webhook] Starting generation for brand: ${body.brandId}`);
    
    const result = await generatePoster({
      brandId: body.brandId,
      prompt: body.prompt,
      campaignType: body.campaignType || "brand_awareness",
      aspectRatio: body.aspectRatio || "1:1",
      outputFormat: body.outputFormat || "png",
      quality: body.quality || "medium",
      referenceAssetIds: body.referenceAssetIds || [],
      referenceImageUrls: body.referenceImageUrls || [],
      customTextFields: body.customTextFields || {},
      requestId,
      source: "webhook",
    });

    console.log(`[Webhook] Generation completed successfully: ${result.generationId}`);

    await prisma.webhookRequest.update({
      where: { requestId },
      data: {
        generationJobId: result.generationId,
        status: "completed",
        response: JSON.stringify(result),
      },
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook generation failed.";
    
    console.error(`[Webhook] Error during generation:`, message, error);

    await prisma.webhookRequest.update({
      where: { requestId },
      data: {
        status: "failed",
        error: message,
        response: JSON.stringify({ success: false, error: message }),
      },
    });

    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
