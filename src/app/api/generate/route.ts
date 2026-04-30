import { generatePoster } from "@/lib/generation-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generatePoster({
      brandId: body.brandId,
      prompt: body.prompt,
      campaignType: body.campaignType,
      aspectRatio: body.aspectRatio || "1:1",
      outputFormat: body.outputFormat || "png",
      quality: body.quality || "medium",
      referenceAssetIds: body.referenceAssetIds || [],
      referenceImageUrls: body.referenceImageUrls || [],
      customTextFields: body.customTextFields || {},
      requestId: body.requestId,
      source: "manual",
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Generation failed." },
      { status: 500 },
    );
  }
}
