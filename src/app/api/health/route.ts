export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "BrandPoster AI",
    timestamp: new Date().toISOString(),
  });
}
