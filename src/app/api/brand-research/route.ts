import { scrapeBrandResearch } from "@/lib/brand-research";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await scrapeBrandResearch({
    brandName: body.brandName,
    website: body.website,
    socialHandle: body.socialHandle,
  });

  return Response.json(result);
}
