import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type HistoryItem = {
  id: string;
  prompt: string;
  campaignType: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  brand: {
    name: string;
  };
};

export function HistoryClient({ items }: { items: HistoryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation history</CardTitle>
        <CardDescription>Reuse past prompts, re-download images, or open detailed metadata.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-5 text-sm text-slate-400">
            No generations found yet.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/generations/${item.id}`}
              className="flex gap-4 rounded-2xl border border-white/8 bg-white/4 p-3 transition hover:bg-white/6"
            >
              {item.thumbnailUrl || item.imageUrl ? (
                <img
                  src={item.thumbnailUrl || item.imageUrl || ""}
                  alt={item.prompt}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-slate-800" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.brand.name}</Badge>
                  <Badge>{item.campaignType}</Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-white">{item.prompt}</p>
                <p className="mt-3 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
