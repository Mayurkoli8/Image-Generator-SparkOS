import { getPrisma } from "@/lib/prisma";
import { saveBufferToStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId");
  const prisma = getPrisma();

  const assets = await prisma.brandAsset.findMany({
    where: brandId ? { brandId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ assets });
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  const formData = await request.formData();
  const brandId = String(formData.get("brandId") || "");
  const type = String(formData.get("type") || "reference_image");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!brandId) {
    return Response.json({ error: "brandId is required." }, { status: 400 });
  }

  if (files.length === 0) {
    return Response.json({ error: "At least one file is required." }, { status: 400 });
  }

  const brand = await prisma.brand.findFirst({
    where: { OR: [{ id: brandId }, { slug: brandId }] },
  });

  if (!brand) {
    return Response.json({ error: "Brand not found." }, { status: 404 });
  }

  const createdAssets = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const stored = saveBufferToStorage({
      buffer: Buffer.from(arrayBuffer),
      mimeType: file.type || "application/octet-stream",
      fileName: file.name,
      folder: `brands/${brand.slug}/${type}`,
    });

    const asset = await prisma.brandAsset.create({
      data: {
        brandId: brand.id,
        type,
        name: file.name,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey: stored.storageKey,
        publicUrl: stored.publicUrl,
      },
    });

    if (type === "logo" && !brand.logoAssetId) {
      await prisma.brand.update({
        where: { id: brand.id },
        data: {
          logoAssetId: asset.id,
        },
      });
    }

    createdAssets.push(asset);
  }

  return Response.json({ assets: createdAssets });
}
