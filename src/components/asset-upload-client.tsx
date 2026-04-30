"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { humanFileSize } from "@/lib/utils";

type BrandSummary = {
  id: string;
  name: string;
  slug: string;
};

type AssetRecord = {
  id: string;
  brandId: string;
  type: string;
  name: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  createdAt: string;
};

const assetTypeOptions = [
  { value: "logo", label: "Logo" },
  { value: "sample_poster", label: "Sample Poster" },
  { value: "reference_image", label: "Reference Image" },
  { value: "apartment_photo", label: "Apartment Photo" },
  { value: "brochure", label: "Brochure / PDF" },
  { value: "docx", label: "DOCX File" },
  { value: "text", label: "Text File" },
];

export function AssetUploadClient({
  brands,
  initialAssets,
}: {
  brands: BrandSummary[];
  initialAssets: AssetRecord[];
}) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || "");
  const [assetType, setAssetType] = useState("reference_image");
  const [files, setFiles] = useState<FileList | null>(null);
  const [assets, setAssets] = useState(initialAssets);
  const filteredAssets = useMemo(
    () => assets.filter((asset) => (selectedBrandId ? asset.brandId === selectedBrandId : true)),
    [assets, selectedBrandId],
  );

  async function uploadAssets() {
    if (!selectedBrandId) {
      toast.error("Please create or select a brand first.");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Choose at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("brandId", selectedBrandId);
    formData.append("type", assetType);

    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    const response = await fetch("/api/assets", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Upload failed.");
      return;
    }

    setAssets([...(data.assets as AssetRecord[]), ...assets]);
    setFiles(null);
    toast.success("Assets uploaded.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upload brand assets</CardTitle>
          <CardDescription>
            Add logos, posters, apartment photos, brochures, PDFs, DOCX files, or text references.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-2 text-sm text-slate-300">
            Brand
            <Select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}>
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Asset type
            <Select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/4 px-6 py-10 text-center">
            <Upload className="h-8 w-8 text-amber-300" />
            <p className="mt-4 text-lg font-medium text-white">Drop files here or click to browse</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Supported: PNG, JPG, WEBP, PDF, DOCX, TXT. Multiple files are allowed.
            </p>
            <Input className="mt-5 bg-transparent" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          </label>
          <Button onClick={uploadAssets} className="w-full">
            Upload selected files
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded assets</CardTitle>
          <CardDescription>
            Keep your design references here so the poster workflow stays brand-aware.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-5 text-sm text-slate-400">
              No assets yet for this brand.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 p-3">
                {asset.mimeType.startsWith("image/") ? (
                  <img src={asset.publicUrl} alt={asset.name} className="h-20 w-20 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-800 text-xs text-slate-400">
                    FILE
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                    <Badge>{asset.type}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {asset.mimeType} • {humanFileSize(asset.size)}
                  </p>
                  <a className="mt-2 inline-block text-xs text-amber-300" href={asset.publicUrl} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
