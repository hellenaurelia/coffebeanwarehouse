"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Truck,
  Receipt,
  BarChart3,
  UserRoundCog,
  Users,
  ClipboardList,
  ChevronRight,
  LogOut,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { logoutAction } from "@/lib/auth/action";
import type { SessionUser } from "@/lib/auth/session";

// DB roles are uppercase (OWNER, MANAJER, KASIR, GUDANG). Friendly labels for
// the footer. Outlet currently single-site.
const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAJER: "Manajer",
  KASIR: "Kasir",
  GUDANG: "Gudang",
};

function toInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type NavItem = {
  title: string;
  url: string;
  icon: typeof Truck;
  sub?: { title: string; url: string; icon: typeof Truck }[];
};

const main: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kasir / POS", url: "/pos", icon: ScanBarcode },
  { title: "Riwayat Transaksi", url: "/transactions", icon: Receipt },
];

const warehouse: NavItem[] = [
  { title: "Inventory", url: "/inventory", icon: Package },
  {
    title: "Supplier",
    url: "/suppliers",
    icon: Truck,
    sub: [
      { title: "Daftar Supplier", url: "/suppliers", icon: Users },
      {
        title: "Riwayat PO",
        url: "/suppliers/riwayat-po",
        icon: ClipboardList,
      },
    ],
  },
];

const insights: NavItem[] = [
  { title: "Laporan", url: "/reports", icon: BarChart3 },
  { title: "User Management", url: "/users", icon: UserRoundCog },
];

export function AppSidebar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  // Display values fall back gracefully if there is no session.
  const displayName = user?.name ?? "Pengguna";
  const displayRole = user ? (ROLE_LABEL[user.role] ?? user.role) : "—";
  const displayInitials = user ? toInitials(user.name) : "AR";
  const role = user?.role;

  const visibleMain =
    role === "GUDANG" ? main.filter((i) => i.title === "Dashboard") : main;

  const visibleWarehouse = role === "KASIR" ? [] : warehouse;

  const visibleInsights = role === "GUDANG" || role === "KASIR" ? [] : insights;

  const isGroupActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  const isMenuActive = (path: string) => {
    return pathname === path;
  };

  const renderGroup = (label: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-widest text-[10px]">
          {label}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const sub = item.sub;

              if (sub) {
                const groupActive = sub.some((s) => isMenuActive(s.url));
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
                          data-active={groupActive}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {sub.map((s) => (
                            <SidebarMenuSubItem key={s.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isMenuActive(s.url)}
                                className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
                              >
                                <Link
                                  href={s.url}
                                  className="flex items-center gap-3"
                                >
                                  <s.icon className="h-4 w-4" />
                                  <span>{s.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isMenuActive(item.url)}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

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
        {renderGroup("Operasional", visibleMain)}
        {renderGroup("Gudang", visibleWarehouse)}
        {renderGroup("Lainnya", visibleInsights)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-between px-0 py-2 hover:bg-sidebar-accent/60 rounded-md">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-bean text-xs font-semibold text-primary-foreground">
              {displayInitials}
            </div>

            <div className="flex flex-col text-xs group-data-[collapsible=icon]:hidden">
              <span className="font-medium text-sidebar-foreground">
                {displayName}
              </span>

              <span className="text-sidebar-foreground/60">
                {displayRole} · Senopati
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="shrink-0 p-1.5 rounded-md text-sidebar-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors group-data-[collapsible=icon]:hidden"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
