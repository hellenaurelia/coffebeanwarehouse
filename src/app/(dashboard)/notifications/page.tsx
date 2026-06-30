"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, Bell, BellOff, Check, CheckCheck,
  Coffee, Package, PackageCheck, ShoppingCart, Truck,
  TrendingDown, Clock, Trash2, ChevronRight, RefreshCw,
} from "lucide-react";
import type { NotificationItem } from "@/app/api/notifications/route";

type FilterCategory = "semua" | "stok" | "pengiriman" | "pembelian" | "sistem";
type NotifPriority = "tinggi" | "sedang" | "rendah";
type NotifCategory = "stok" | "pengiriman" | "pembelian" | "sistem";

type Summary = {
  unread: number;
  stokKritis: number;
  stokHabis: number;
  pengirimanAktif: number;
  poAktif: number;
};

const categories: { value: FilterCategory; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "stok", label: "Stok" },
  { value: "pengiriman", label: "Pengiriman" },
  { value: "pembelian", label: "Pembelian" },
  { value: "sistem", label: "Sistem" },
];

const priorityTone: Record<NotifPriority, string> = {
  tinggi: "bg-destructive/10 text-destructive border-destructive/30",
  sedang: "bg-crema/40 text-roast border-crema/50",
  rendah: "bg-secondary text-muted-foreground border-border",
};

const categoryTone: Record<NotifCategory, string> = {
  stok: "bg-destructive/10 text-destructive",
  pengiriman: "bg-accent/15 text-accent",
  pembelian: "bg-emerald-500/10 text-emerald-700",
  sistem: "bg-secondary text-muted-foreground",
};

const categoryIcon: Record<NotifCategory, React.ElementType> = {
  stok: Coffee,
  pengiriman: Truck,
  pembelian: ShoppingCart,
  sistem: Bell,
};

function resolveIcon(notif: NotificationItem, isRead: boolean): React.ElementType {
  if (notif.category === "pengiriman") return isRead ? PackageCheck : Truck;
  if (notif.category === "pembelian") return ShoppingCart;
  if (notif.category === "sistem") return Package;
  if (notif.priority === "tinggi") return AlertTriangle;
  return TrendingDown;
}

const STORAGE_KEY_READ = "notif-read-ids";
const STORAGE_KEY_DISMISSED = "notif-dismissed-ids";

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterCategory>("semua");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    unread: 0, stokKritis: 0, stokHabis: 0, pengirimanAktif: 0, poAktif: 0,
  });
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dari localStorage
  useEffect(() => {
    const storedRead = localStorage.getItem(STORAGE_KEY_READ);
    const storedDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (storedRead) setReadIds(new Set(JSON.parse(storedRead)));
    if (storedDismissed) setDismissedIds(new Set(JSON.parse(storedDismissed)));
  }, []);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setItems(data.notifications);
      setSummary(data.summary);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const isRead = (id: string) => readIds.has(id);
  const isDismissed = (id: string) => dismissedIds.has(id);

  const visibleItems = items.filter((n) => !isDismissed(n.id));
  const filtered = visibleItems.filter((n) => filter === "semua" || n.category === filter);
  const unreadCount = visibleItems.filter((n) => !isRead(n.id)).length;

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev).add(id);
      localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    const allIds = new Set(visibleItems.map((n) => n.id));
    setReadIds(allIds);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...allIds]));
  };

  const dismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev).add(id);
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...next]));
      return next;
    });
    // Otomatis mark read juga
    markRead(id);
  };

  const dismissAll = () => {
    const allIds = new Set(visibleItems.map((n) => n.id));
    setDismissedIds(allIds);
    localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...allIds]));
    setReadIds(allIds);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...allIds]));
  };

  const handleAction = (notif: NotificationItem) => {
    markRead(notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  if (loading) {
    return (
      <>
        <Topbar title="Notifikasi" subtitle="Pantau stok, pengiriman, dan aktivitas gudang" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Memuat notifikasi...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Notifikasi" subtitle="Pantau stok, pengiriman, dan aktivitas gudang" />
      <main className="flex-1 p-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Belum Dibaca",
              value: String(unreadCount),
              sub: "notifikasi baru",
              icon: Bell,
              warn: unreadCount > 0,
            },
            {
              label: "Stok Kritis",
              value: String(summary.stokKritis + summary.stokHabis),
              sub: `${summary.stokHabis > 0 ? `${summary.stokHabis} habis · ` : ""}${summary.stokKritis} perlu reorder`,
              icon: AlertTriangle,
              warn: summary.stokKritis > 0 || summary.stokHabis > 0,
            },
            {
              label: "Pengiriman Aktif",
              value: String(summary.pengirimanAktif),
              sub: "dalam proses pengiriman",
              icon: Truck,
              warn: false,
            },
            {
              label: "PO Aktif",
              value: String(summary.poAktif),
              sub: "menunggu konfirmasi",
              icon: ShoppingCart,
              warn: false,
            },
          ].map((s) => (
            <Card key={s.label} className={`shadow-soft border-border/60 ${s.warn ? "bg-crema/10" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.warn ? "bg-destructive/10" : "bg-secondary"}`}>
                    <s.icon className={`h-4 w-4 ${s.warn ? "text-destructive" : "text-primary"}`} />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter + Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilter(c.value)}
                className={`h-9 px-4 rounded-full text-sm border transition-colors ${
                  filter === c.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-secondary"
                }`}
              >
                {c.label}
                {c.value !== "semua" && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {visibleItems.filter((n) => n.category === c.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fetchNotifications(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <Card className="shadow-soft border-border/60">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <BellOff className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-display text-lg font-semibold">Tidak ada notifikasi</p>
                <p className="text-sm text-muted-foreground mt-1">Semua aktivitas sudah tertangani.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {filtered.map((notif) => {
                  const read = isRead(notif.id);
                  const Icon = resolveIcon(notif, read);
                  const CatIcon = categoryIcon[notif.category as NotifCategory];
                  return (
                    <li
                      key={notif.id}
                      onClick={() => handleAction(notif)}
                      className={`group relative flex gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 cursor-pointer ${!read ? "bg-crema/8" : ""}`}
                    >
                      {!read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                      <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${categoryTone[notif.category as NotifCategory]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-semibold text-sm ${!read ? "text-foreground" : "text-foreground/80"}`}>
                            {notif.title}
                          </span>
                          <Badge variant="outline" className={`text-[10px] h-5 ${priorityTone[notif.priority as NotifPriority]}`}>
                            {notif.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-5 bg-secondary border-border/60 text-muted-foreground inline-flex items-center gap-1">
                            <CatIcon className="h-2.5 w-2.5" />
                            {notif.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{notif.body}</p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notif.time}
                          </span>
                          {notif.action && (
                            <span className="text-xs font-medium text-accent flex items-center gap-0.5">
                              {notif.action}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Tandai dibaca"
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(notif.id);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          title="Hapus notifikasi"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notif.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground pb-2">
            Menampilkan {filtered.length} notifikasi ·{" "}
            <button className="text-accent hover:underline" onClick={dismissAll}>
              Hapus semua
            </button>
          </p>
        )}
      </main>
    </>
  );
}