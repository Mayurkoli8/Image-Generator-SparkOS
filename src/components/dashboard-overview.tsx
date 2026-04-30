import Link from "next/link";
import { ArrowRight, Building2, Files, PlugZap, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type DashboardProps = {
  stats: {
    brandCount: number;
    assetCount: number;
    templateCount: number;
    generationCount: number;
  };
  recentGenerations: Array<{
    id: string;
    imageUrl: string | null;
    prompt: string;
    campaignType: string;
    createdAt: string;
    brandName: string;
  }>;
};

export function DashboardOverview({ stats, recentGenerations }: DashboardProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Brands", value: stats.brandCount, icon: Building2 },
          { label: "Assets", value: stats.assetCount, icon: Files },
          { label: "Templates", value: stats.templateCount, icon: Sparkles },
          { label: "Generations", value: stats.generationCount, icon: PlugZap },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <Icon className="h-5 w-5 text-amber-300" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ready-to-use studio flow</CardTitle>
            <CardDescription>Everything a small marketing team needs in one app.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/brand-settings",
                title: "Brand kit setup",
                body: "Store your company name, colors, tagline, rules, and exact contact details.",
              },
              {
                href: "/assets",
                title: "Asset upload",
                body: "Upload logos, apartment photos, posters, brochures, PDFs, DOCX, and text references.",
              },
              {
                href: "/prompt-studio",
                title: "Prompt studio",
                body: "Choose campaign type, test prompts, preview output, and download the final image.",
              },
              {
                href: "/webhook-settings",
                title: "n8n webhook",
                body: "Trigger poster generation from automations and receive JSON with the hosted image URL.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/8 bg-white/4 p-5 transition hover:border-amber-300/30 hover:bg-white/6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-amber-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent poster history</CardTitle>
            <CardDescription>Preview the latest generated creatives.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGenerations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-5 text-sm text-slate-400">
                No posters yet. Start in Prompt Studio after setting up a brand.
              </div>
            ) : (
              recentGenerations.map((item) => (
                <Link
                  key={item.id}
                  href={`/generations/${item.id}`}
                  className="flex gap-4 rounded-2xl border border-white/8 bg-white/4 p-3 transition hover:bg-white/6"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-slate-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge>{item.brandName}</Badge>
                      <Badge className="text-slate-300">{item.campaignType}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-white">{item.prompt}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
