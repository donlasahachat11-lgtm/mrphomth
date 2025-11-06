import Link from "next/link";
import { ReactNode } from "react";
import { CircleUser, LayoutDashboard, LogOut, MessageSquareText, Sparkles, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/app/chat/default", icon: MessageSquareText },
  { name: "Prompts", href: "/app/prompts", icon: SquarePen },
  { name: "Workflows", href: "#", icon: Sparkles, disabled: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_1fr_22rem]">
      <aside className="hidden border-r border-border bg-muted/40 lg:flex lg:flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workspace</p>
              <p className="text-xl font-semibold text-foreground">Mr.Promth Console</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-disabled={item.disabled}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-foreground">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-6">
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
            Upgrade to unlock team spaces and advanced analytics.
          </div>
        </div>
      </aside>

        <main className="flex flex-col">
          <header className="flex h-24 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur">
            <div className="flex items-center gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                MP
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Mr.Promth</p>
                <h1 className="text-2xl font-semibold text-foreground">From Prompt to Production</h1>
                <p className="text-sm text-muted-foreground">Transform any idea into a production-ready experience.</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">Aimee Promth</p>
                <p className="text-xs text-muted-foreground">Product Designer</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                <CircleUser className="h-6 w-6" />
              </div>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-background px-5 py-6">{children}</div>
      </main>

      <section className="hidden border-l border-border bg-muted/30 xl:block">
        <div className="h-full overflow-y-auto px-5 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Context Panel</h2>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground">
            <p>Pin notes, prompt snippets, and API references here for quick switching.</p>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Current Provider</dt>
                <dd className="text-sm text-foreground">streamlake.ai</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Last Sync</dt>
                <dd className="text-sm text-foreground">moments ago</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
