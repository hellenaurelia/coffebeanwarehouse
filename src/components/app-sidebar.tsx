"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Users,
  Receipt,
  BarChart3,
  UserRoundCog,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kasir / POS", url: "/pos", icon: ScanBarcode },
  { title: "Riwayat Transaksi", url: "/transactions", icon: Receipt },
];

const warehouse = [
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Supplier", url: "/suppliers", icon: Users },
];

const insights = [
  { title: "Laporan", url: "/reports", icon: BarChart3 },
  { title: "User Management", url: "/users", icon: UserRoundCog },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);
  
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const renderGroup = (label: string, items: typeof main) => (
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
                <Link href={item.url} className="flex items-center gap-3">
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
        <div className="flex items-center justify-between px-0 py-2">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-crema shadow-warm group-data-[collapsible=icon]:hidden">
              <Image
                src="/coffee.png"
                alt="Coffee"
                width={20}
                height={20}
                className="h-7 w-7 object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="font-display text-base font-semibold text-sidebar-foreground">
                Arunika
              </span>

              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Bean POS & Warehouse
              </span>
            </div>
          </Link>

          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Operasional", main)}
        {renderGroup("Gudang", warehouse)}
        {renderGroup("Lainnya", insights)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border hover:bg-sidebar-accent/60">
        <div className="flex items-center gap-3 px-0 py-2 ">
          <Link href="/profile" className="flex items-center gap-2.5 overflow-hidden ">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-bean text-xs font-semibold text-primary-foreground">
              AR
            </div>

            <div className="flex flex-col text-xs group-data-[collapsible=icon]:hidden">
              <span className="font-medium text-sidebar-foreground">
                Arif Rahman
              </span>

              <span className="text-sidebar-foreground/60">
                Manager · Senopati
              </span>
            </div>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
