"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type BrandRecord = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  phone: string | null;
  officeAddress: string | null;
  socialHandle: string | null;
  tagline: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typography: string | null;
  designRules: string | null;
  defaultCta: string | null;
  logoAssetId: string | null;
};

const emptyBrand: BrandRecord = {
  id: "",
  slug: "",
  name: "",
  website: "",
  phone: "",
  officeAddress: "",
  socialHandle: "",
  tagline: "",
  primaryColor: "#101820",
  secondaryColor: "#C6A15B",
  accentColor: "#FFFFFF",
  typography: "",
  designRules: "",
  defaultCta: "Book a site visit",
  logoAssetId: "",
};

export function BrandSettingsClient({ initialBrands }: { initialBrands: BrandRecord[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [selectedId, setSelectedId] = useState(initialBrands[0]?.id || "new");
  const [form, setForm] = useState<BrandRecord>(initialBrands[0] || emptyBrand);
  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === selectedId) || (selectedId === "new" ? emptyBrand : brands[0] || emptyBrand),
    [brands, selectedId],
  );

  async function submitBrand() {
    if (!form.name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `/api/brands/${form.id}` : "/api/brands";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Unable to save brand.");
      return;
    }

    const saved = data.brand as BrandRecord;
    const nextBrands = form.id
      ? brands.map((item) => (item.id === saved.id ? saved : item))
      : [saved, ...brands];

    setBrands(nextBrands);
    setSelectedId(saved.id);
    setForm(saved);
    toast.success("Brand saved.");
  }

  function chooseBrand(id: string) {
    if (id === "new") {
      setSelectedId("new");
      setForm(emptyBrand);
      return;
    }

    const match = brands.find((brand) => brand.id === id);

    if (match) {
      setSelectedId(id);
      setForm(match);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Brand profiles</CardTitle>
          <CardDescription>Create one or more company brand kits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="secondary" className="w-full justify-start" onClick={() => chooseBrand("new")}>
            <Plus className="h-4 w-4" />
            New brand profile
          </Button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => chooseBrand(brand.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedId === brand.id
                  ? "border-amber-300/40 bg-amber-300/10"
                  : "border-white/8 bg-white/4 hover:bg-white/6"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{brand.name}</p>
                <Badge>{brand.slug}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{brand.phone || "No contact number yet"}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{form.id ? `Edit ${selectedBrand.name}` : "Create brand profile"}</CardTitle>
          <CardDescription>
            These details are used for prompt enhancement and for exact poster overlays.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Company name
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Slug
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="skyline-builders" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Website
            <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Contact number
            <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
            Office address
            <Input
              value={form.officeAddress || ""}
              onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Social handle
            <Input
              value={form.socialHandle || ""}
              onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Default CTA
            <Input
              value={form.defaultCta || ""}
              onChange={(e) => setForm({ ...form, defaultCta: e.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
            Tagline
            <Input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Primary color
            <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Secondary color
            <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Accent color
            <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Typography style
            <Input value={form.typography || ""} onChange={(e) => setForm({ ...form, typography: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
            Design rules
            <Textarea
              value={form.designRules || ""}
              onChange={(e) => setForm({ ...form, designRules: e.target.value })}
              placeholder="Example: Use premium real estate imagery, strong contrast, and clear footer contact details."
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={submitBrand}>{form.id ? "Save changes" : "Create brand"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
