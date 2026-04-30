"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type BrandSummary = {
  id: string;
  slug: string;
  name: string;
};

export function WebhookSettingsClient({
  brands,
  publicAppUrl,
}: {
  brands: BrandSummary[];
  publicAppUrl: string;
}) {
  const [brandId, setBrandId] = useState(brands[0]?.id || "");
  const [payloadPrompt, setPayloadPrompt] = useState("Create a premium New Year greeting post");
  const endpoint = `${publicAppUrl}/api/webhook/generate-poster`;

  const samplePayload = useMemo(
    () =>
      JSON.stringify(
        {
          requestId: "req_" + Math.random().toString(36).slice(2, 8),
          brandId,
          campaignType: "new_year",
          prompt: payloadPrompt,
          aspectRatio: "1:1",
          outputFormat: "png",
          referenceImageUrls: [],
          customTextFields: {
            cta: "Book a site visit",
          },
        },
        null,
        2,
      ),
    [brandId, payloadPrompt],
  );

  async function testWebhook() {
    const response = await fetch("/api/webhook/generate-poster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: samplePayload,
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Webhook test failed.");
      return;
    }

    toast.success("Webhook test succeeded.");
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Webhook endpoint</CardTitle>
          <CardDescription>
            Use this in n8n to trigger generation and get back a hosted image URL plus metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-2 text-sm text-slate-300">
            Public webhook URL
            <Input readOnly value={endpoint} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Test brand
            <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Sample prompt
            <Input value={payloadPrompt} onChange={(e) => setPayloadPrompt(e.target.value)} />
          </label>
          <Button onClick={testWebhook}>Run webhook test inside the app</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example n8n payload</CardTitle>
          <CardDescription>
            This is the JSON shape your automation can send.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea readOnly value={samplePayload} className="min-h-[420px] font-mono text-xs" />
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(samplePayload);
              toast.success("Payload copied.");
            }}
          >
            Copy payload JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
