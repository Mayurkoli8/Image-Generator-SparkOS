"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
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

type FilePreview = {
  name: string;
  mimeType: string;
  size: number;
  url: string | null;
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

function uploadFormData(
  formData: FormData,
  onProgress: (progress: number) => void,
): Promise<{ assets: AssetRecord[] }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/assets");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || "{}") as {
        assets?: AssetRecord[];
        error?: string;
      };

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data.error || "Upload failed."));
        return;
      }

      resolve({ assets: data.assets || [] });
    };
    xhr.onerror = () => reject(new Error("Upload failed."));
    xhr.send(formData);
  });
}

export function AssetUploadClient({
  brands,
  initialAssets,
}: {
  brands: BrandSummary[];
  initialAssets: AssetRecord[];
}) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || "");
  const [assetType, setAssetType] = useState("reference_image");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const previewUrlsRef = useRef<string[]>([]);
  const filteredAssets = useMemo(
    () => assets.filter((asset) => (selectedBrandId ? asset.brandId === selectedBrandId : true)),
    [assets, selectedBrandId],
  );

  // Load form preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBrandId = localStorage.getItem("assetUploadBrandId");
      const savedAssetType = localStorage.getItem("assetUploadAssetType");
      
      if (savedBrandId && brands.some((b) => b.id === savedBrandId)) {
        setSelectedBrandId(savedBrandId);
      }
      
      if (savedAssetType) {
        setAssetType(savedAssetType);
      }
      
      setIsHydrated(true);
    }
  }, [brands]);

  // Save form preferences to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("assetUploadBrandId", selectedBrandId);
      localStorage.setItem("assetUploadAssetType", assetType);
    }
  }, [selectedBrandId, assetType, isHydrated]);

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function selectFiles(nextFiles: File[]) {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    const previews = nextFiles.map((file) => {
      const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      return {
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        url,
      };
    });

    previewUrlsRef.current = previews
      .map((preview) => preview.url)
      .filter((url): url is string => Boolean(url));
    setFiles(nextFiles);
    setFilePreviews(previews);
  }

  async function uploadAssets() {
    if (!selectedBrandId) {
      toast.error("Please create or select a brand first.");
      return;
    }

    if (files.length === 0) {
      toast.error("Choose at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("brandId", selectedBrandId);
    formData.append("type", assetType);

    for (const file of files) {
      formData.append("files", file);
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const data = await uploadFormData(formData, setUploadProgress);
      setAssets([...(data.assets as AssetRecord[]), ...assets]);
      selectFiles([]);
      setFileInputKey((current) => current + 1);
      setUploadProgress(100);
      toast.success("Assets uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
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
            <Input
              key={fileInputKey}
              className="mt-5 bg-transparent"
              type="file"
              multiple
              onChange={(e) => selectFiles(Array.from(e.target.files || []))}
            />
          </label>

          {filePreviews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filePreviews.map((file) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-3">
                  {file.url ? (
                    <img src={file.url} alt={file.name} className="h-16 w-16 rounded-xl bg-white object-contain p-2" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-xs text-slate-400">
                      FILE
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{humanFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {uploading ? (
            <div className="space-y-2 rounded-2xl border border-white/8 bg-white/4 p-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{uploadProgress}% uploaded</p>
            </div>
          ) : null}

          <Button onClick={uploadAssets} className="w-full" disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload selected files"}
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
                  <img
                    src={asset.publicUrl}
                    alt={asset.name}
                    className={`h-20 w-20 rounded-xl ${
                      asset.type === "logo" ? "bg-white object-contain p-2" : "object-cover"
                    }`}
                  />
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
                    {asset.mimeType} | {humanFileSize(asset.size)}
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
