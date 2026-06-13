"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardList } from "lucide-react";

const tabs = [
  { title: "Daftar Supplier", url: "/suppliers", icon: Users },
  { title: "Riwayat PO",      url: "/suppliers/riwayat-po", icon: ClipboardList },
];

export function SupplierTabs() {
  const pathname = usePathname();

  return (
    <div className="px-6 pt-4">
      <div className="flex gap-1 border-b border-border/60">
        {tabs.map(tab => {
          const active = pathname === tab.url;
          return (
            <Link
              key={tab.url}
              href={tab.url}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
