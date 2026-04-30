import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const brands = await getPrisma().brand.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ brands });
}

export async function POST(request: Request) {
  const body = await request.json();
  const prisma = getPrisma();

  if (!body.name?.trim()) {
    return Response.json({ error: "Brand name is required." }, { status: 400 });
  }

  const slug = slugify(body.slug || body.name);

  const brand = await prisma.brand.create({
    data: {
      slug,
      name: body.name.trim(),
      website: body.website || null,
      phone: body.phone || null,
      officeAddress: body.officeAddress || null,
      socialHandle: body.socialHandle || null,
      tagline: body.tagline || null,
      primaryColor: body.primaryColor || "#101820",
      secondaryColor: body.secondaryColor || "#C6A15B",
      accentColor: body.accentColor || "#FFFFFF",
      typography: body.typography || null,
      designRules: body.designRules || null,
      defaultCta: body.defaultCta || null,
      logoAssetId: body.logoAssetId || null,
    },
  });

  return Response.json({ brand });
}
