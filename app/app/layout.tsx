import Link from "next/link";
import { ReactNode } from "react";
import { LogOut, MessageSquareText, Sparkles, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Chat", href: "/app/chat/default", icon: MessageSquareText },
  { name: "Prompts", href: "/app/prompts", icon: SquarePen },
  { name: "Workflows", href: "#", icon: Sparkles, disabled: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_1fr_22rem]">
      <aside className="hidden border-r border-border bg-muted/40 lg:flex lg:flex-col">
        <div className="flex items-center justify-between px-5 py-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Workspace</p>
            <p className="text-lg font-semibold">Mr.Prompt</p>
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
                <Icon className="h-5 w-5 text-muted-foreground" />
                {item.name}
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
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold">Command Center</h1>
            <p className="text-sm text-muted-foreground">Manage prompts, sessions, and AI connections.</p>
          </div>
          <Button variant="secondary" size="sm">
            New Session
          </Button>
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
