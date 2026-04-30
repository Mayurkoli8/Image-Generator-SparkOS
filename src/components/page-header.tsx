import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-300/80">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {badge ? <Badge className="self-start md:self-auto">{badge}</Badge> : null}
    </div>
  );
}
