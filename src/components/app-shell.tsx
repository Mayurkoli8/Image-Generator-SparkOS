 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Files, History, LayoutDashboard, Palette, PlugZap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand-settings", label: "Brand Settings", icon: Building2 },
  { href: "/assets", label: "Asset Upload", icon: Files },
  { href: "/prompt-studio", label: "Prompt Studio", icon: Sparkles },
  { href: "/history", label: "History", icon: History },
  { href: "/webhook-settings", label: "Webhook Settings", icon: PlugZap },
  { href: "/templates", label: "Template Library", icon: Palette },
];

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,#060814_0%,#0a1020_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 md:grid-cols-[270px_minmax(0,1fr)] md:px-6">
        <aside className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)]">
          <div className="border-b border-white/8 px-3 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-300/80">BrandPoster AI</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Real estate poster studio</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Upload your brand kit, generate polished marketing creatives, and send results back to n8n.
            </p>
          </div>
          <nav className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                    active
                      ? "bg-amber-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Simple live workflow</p>
            <ol className="mt-3 space-y-2 text-sm text-slate-400">
              <li>1. Create a brand profile</li>
              <li>2. Upload logo and references</li>
              <li>3. Generate a poster</li>
              <li>4. Copy the hosted image URL</li>
            </ol>
          </div>
        </aside>
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
