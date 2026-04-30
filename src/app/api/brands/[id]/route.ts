import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const brand = await getPrisma().brand.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!brand) {
    return Response.json({ error: "Brand not found." }, { status: 404 });
  }

  return Response.json({ brand });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const prisma = getPrisma();
  const existing = await prisma.brand.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    return Response.json({ error: "Brand not found." }, { status: 404 });
  }

  const brand = await prisma.brand.update({
    where: { id: existing.id },
    data: {
      slug: slugify(body.slug || body.name || existing.slug),
      name: body.name?.trim() || existing.name,
      website: body.website || null,
      phone: body.phone || null,
      officeAddress: body.officeAddress || null,
      socialHandle: body.socialHandle || null,
      tagline: body.tagline || null,
      primaryColor: body.primaryColor || existing.primaryColor,
      secondaryColor: body.secondaryColor || existing.secondaryColor,
      accentColor: body.accentColor || existing.accentColor,
      typography: body.typography || null,
      designRules: body.designRules || null,
      defaultCta: body.defaultCta || null,
      logoAssetId: body.logoAssetId || null,
    },
  });

  return Response.json({ brand });
}
