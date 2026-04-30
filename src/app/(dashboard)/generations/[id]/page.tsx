import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getGenerationById } from "@/lib/generation-service";
import { formatDate, safeJsonParse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generation = await getGenerationById(id);

  if (!generation) {
    notFound();
  }

  const metadata = safeJsonParse<Record<string, unknown>>(generation.metadata, {});

  return (
    <div>
      <PageHeader
        eyebrow="Generation Detail"
        title={generation.brand.name}
        description="Review the finished creative, enhanced prompt, and output metadata from this generation job."
        badge={generation.status}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Poster preview</CardTitle>
            <CardDescription>{generation.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generation.imageUrl ? (
              <img src={generation.imageUrl} alt={generation.prompt} className="w-full rounded-3xl border border-white/10" />
            ) : (
              <div className="min-h-[560px] rounded-3xl border border-dashed border-white/10 bg-white/4" />
            )}
            <div className="flex flex-wrap gap-3 text-sm text-amber-300">
              {generation.imageUrl ? (
                <a href={generation.imageUrl} target="_blank" rel="noreferrer">
                  Open image
                </a>
              ) : null}
              {generation.imageUrl ? <a href={generation.imageUrl} download>Download image</a> : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>Everything saved for audit trail and webhook reuse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="flex flex-wrap gap-2">
              <Badge>{generation.brand.name}</Badge>
              <Badge>{generation.campaignType}</Badge>
              <Badge>{generation.aspectRatio}</Badge>
            </div>
            <div>
              <p className="font-medium text-white">Created</p>
              <p className="mt-1 text-slate-400">{formatDate(generation.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-white">Original prompt</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-400">{generation.prompt}</p>
            </div>
            <div>
              <p className="font-medium text-white">Enhanced prompt</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-400">{generation.enhancedPrompt}</p>
            </div>
            <div>
              <p className="font-medium text-white">Metadata</p>
              <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-xs text-slate-400">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
