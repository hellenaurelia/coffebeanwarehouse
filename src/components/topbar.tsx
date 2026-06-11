import { Bell, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex flex-col leading-tight">
        <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
