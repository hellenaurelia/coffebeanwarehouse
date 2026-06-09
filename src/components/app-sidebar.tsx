"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Coffee,
  Users,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kasir / POS", url: "/pos", icon: ScanBarcode },
  { title: "Transaksi", url: "/transactions", icon: Receipt },
];

const warehouse = [
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Biji Kopi", url: "/beans", icon: Coffee },
  { title: "Supplier", url: "/suppliers", icon: Users },
];

const insights = [
  { title: "Laporan", url: "/reports", icon: BarChart3 },
  { title: "Pengaturan", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const renderGroup = (
    label: string,
    items: typeof main
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-[10px]">
        {label}
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 py-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-crema shadow-warm">
            <Coffee className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-sidebar-foreground">
              Biji Nusantara
            </span>

            <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              POS &amp; Warehouse
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Operasional", main)}
        {renderGroup("Gudang", warehouse)}
        {renderGroup("Lainnya", insights)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-bean text-xs font-semibold text-primary-foreground">
            AR
          </div>

          <div className="flex flex-col text-xs">
            <span className="font-medium text-sidebar-foreground">
              Arif Rahman
            </span>

            <span className="text-sidebar-foreground/60">
              Manager · Senopati
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}