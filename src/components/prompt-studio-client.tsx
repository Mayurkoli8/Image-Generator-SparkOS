"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { aspectRatios, campaignTypes } from "@/lib/campaigns";

type BrandSummary = {
  id: string;
  name: string;
  slug: string;
};

type TemplateSummary = {
  id: string;
  name: string;
  slug: string;
  campaignType: string;
  description: string;
  defaultCta: string | null;
};

type AssetSummary = {
  id: string;
  brandId: string;
  type: string;
  name: string;
  mimeType: string;
  publicUrl: string;
};

type GenerationResult = {
  generationId: string;
  imageUrl: string;
  thumbnailUrl: string;
  promptUsed: string;
  createdAt: string;
  metadata?: {
    provider?: string;
    fallbackReason?: string;
  };
};

export function PromptStudioClient({
  brands,
  templates,
  assets,
}: {
  brands: BrandSummary[];
  templates: TemplateSummary[];
  assets: AssetSummary[];
}) {
  const [brandId, setBrandId] = useState(brands[0]?.id || "");
  const [campaignType, setCampaignType] = useState("new_year");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("Create a premium New Year greeting post");
  const [cta, setCta] = useState("Book a site visit");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const brandImageAssets = useMemo(
    () => assets.filter((asset) => asset.brandId === brandId && asset.mimeType.startsWith("image/")),
    [assets, brandId],
  );
  const logoAsset = useMemo(
    () => brandImageAssets.find((asset) => asset.type === "logo") || null,
    [brandImageAssets],
  );
  const referenceAssets = useMemo(
    () => brandImageAssets.filter((asset) => asset.type !== "logo"),
    [brandImageAssets],
  );
  const validSelectedAssetIds = useMemo(() => {
    const availableIds = new Set(referenceAssets.map((asset) => asset.id));
    return selectedAssetIds.filter((id) => availableIds.has(id));
  }, [referenceAssets, selectedAssetIds]);
  const matchingTemplates = useMemo(
    () => templates.filter((template) => template.campaignType === campaignType),
    [templates, campaignType],
  );
  const selectedCount = validSelectedAssetIds.length;

  async function generatePoster() {
    if (!brandId || !prompt.trim()) {
      toast.error("Please choose a brand and enter a prompt.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          prompt,
          campaignType,
          aspectRatio,
          outputFormat: "png",
          referenceAssetIds: validSelectedAssetIds,
          customTextFields: { cta },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setResult(data);
      toast.success("Poster generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Brand-aware prompt studio</CardTitle>
          <CardDescription>
            The AI prompt is automatically enhanced with brand rules, real estate context, and layout guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Brand
              <Select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setSelectedAssetIds([]);
                }}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Campaign type
              <Select value={campaignType} onChange={(e) => setCampaignType(e.target.value)}>
                {campaignTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Prompt
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Aspect ratio
              <Select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                {aspectRatios.map((ratio) => (
                  <option key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              CTA overlay text
              <Input value={cta} onChange={(e) => setCta(e.target.value)} />
            </label>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-medium text-white">Recommended template ideas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {matchingTemplates.map((template) => (
                <Badge key={template.id}>{template.name}</Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <p className="text-sm font-medium text-white">Exact logo overlay</p>
              {logoAsset ? (
                <div className="mt-3 flex items-center gap-3">
                  <img src={logoAsset.publicUrl} alt={logoAsset.name} className="h-16 w-28 rounded-xl bg-white object-contain p-2" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{logoAsset.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Placed after generation</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No logo uploaded for this brand.</p>
              )}
            </div>
            <Button onClick={generatePoster} className="h-12 self-end" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate image"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">Reference images</p>
              <Badge>{selectedCount} selected</Badge>
            </div>
            {referenceAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-slate-400">
                No reference images uploaded for this brand yet.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {referenceAssets.map((asset) => {
                  const checked = selectedAssetIds.includes(asset.id);

                  return (
                    <label
                      key={asset.id}
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                        checked ? "border-amber-300/30 bg-amber-300/10" : "border-white/8 bg-white/4 hover:bg-white/6"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedAssetIds((current) =>
                            e.target.checked
                              ? [...current, asset.id]
                              : current.filter((id) => id !== asset.id),
                          );
                        }}
                        className="mt-1"
                      />
                      <img src={asset.publicUrl} alt={asset.name} className="h-20 w-20 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{asset.type}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation preview</CardTitle>
          <CardDescription>Preview the final result, then download or copy the hosted URL.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <img src={result.imageUrl} alt="Generated poster" className="w-full rounded-3xl border border-white/10" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{result.metadata?.provider === "openai" ? "OpenAI image" : "Fallback image"}</Badge>
                {result.metadata?.fallbackReason ? (
                  <span className="text-xs text-slate-400">{result.metadata.fallbackReason}</span>
                ) : null}
              </div>
              <div className="grid gap-3">
                <a href={result.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-amber-300">
                  Open full image
                </a>
                <a href={result.imageUrl} download className="text-sm text-amber-300">
                  Download PNG
                </a>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(result.imageUrl);
                    toast.success("Image URL copied.");
                  }}
                  className="text-left text-sm text-amber-300"
                >
                  Copy hosted image URL
                </button>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-medium text-white">Enhanced prompt used</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{result.promptUsed}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[540px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/4 p-8 text-center text-sm text-slate-400">
              Your generated poster preview will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
