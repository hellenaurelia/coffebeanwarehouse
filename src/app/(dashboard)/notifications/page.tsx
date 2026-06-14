"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Coffee,
  Package,
  PackageCheck,
  ShoppingCart,
  Truck,
  TrendingDown,
  Clock,
  Filter,
  Trash2,
  ChevronRight,
} from "lucide-react";

type NotifCategory = "semua" | "stok" | "pengiriman" | "pembelian" | "sistem";
type NotifPriority = "tinggi" | "sedang" | "rendah";

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: Exclude<NotifCategory, "semua">;
  priority: NotifPriority;
  read: boolean;
  icon: React.ElementType;
  action?: string;
};

const notifications: Notification[] = [
  {
    id: "n01",
    title: "Stok Kritis: Ethiopia Yirgacheffe",
    body: "Tersisa 12 kg dari kapasitas 120 kg. Estimasi habis dalam 2 hari berdasarkan rata-rata penjualan.",
    time: "5 menit lalu",
    category: "stok",
    priority: "tinggi",
    read: false,
    icon: AlertTriangle,
    action: "Buat Purchase Order",
  },
  {
    id: "n02",
    title: "Pengiriman Hari Ini: Koperasi Tani Gayo",
    body: "Pesanan 50 kg Gayo Wine Natural dari Koperasi Tani Gayo dijadwalkan tiba hari ini antara pukul 10:00–14:00.",
    time: "32 menit lalu",
    category: "pengiriman",
    priority: "tinggi",
    read: false,
    icon: Truck,
    action: "Lihat Detail PO",
  },
  {
    id: "n03",
    title: "Stok Menipis: Kintamani Honey",
    body: "Stok tersisa 38 kg, di bawah ambang batas reorder 50 kg. Pertimbangkan pemesanan ulang segera.",
    time: "1 jam lalu",
    category: "stok",
    priority: "sedang",
    read: false,
    icon: TrendingDown,
    action: "Hubungi Supplier",
  },
  {
    id: "n04",
    title: "Purchase Order Disetujui",
    body: "PO-2024-089 untuk 80 kg Toraja Sapan dari CV Sapan Bersama telah disetujui dan sedang diproses.",
    time: "2 jam lalu",
    category: "pembelian",
    priority: "sedang",
    read: false,
    icon: ShoppingCart,
  },
  {
    id: "n05",
    title: "Barang Diterima: Lampung Robusta AAA",
    body: "100 kg Lampung Robusta AAA dari Petani Mitra Lampung berhasil diterima dan dicatat ke inventori.",
    time: "3 jam lalu",
    category: "pengiriman",
    priority: "rendah",
    read: true,
    icon: PackageCheck,
  },
  {
    id: "n06",
    title: "Stok Luwak Premium Sangat Rendah",
    body: "Luwak Premium tersisa 8 kg. Produk premium ini memiliki lead time pengiriman 7–10 hari, segera pesan.",
    time: "4 jam lalu",
    category: "stok",
    priority: "tinggi",
    read: true,
    icon: Coffee,
    action: "Buat Purchase Order",
  },
  {
    id: "n07",
    title: "Jadwal Pengiriman Besok: Kintamani Highland",
    body: "30 kg Kintamani Honey dari Kintamani Highland dijadwalkan tiba besok, Rabu 10 Juni 2026.",
    time: "5 jam lalu",
    category: "pengiriman",
    priority: "sedang",
    read: true,
    icon: Clock,
  },
  {
    id: "n08",
    title: "Restock Otomatis Direkomendasikan",
    body: "Sistem mendeteksi 3 SKU perlu reorder berdasarkan pola penjualan 30 hari terakhir.",
    time: "6 jam lalu",
    category: "sistem",
    priority: "sedang",
    read: true,
    icon: Package,
    action: "Tinjau Rekomendasi",
  },
  {
    id: "n09",
    title: "Purchase Order Terkirim ke Supplier",
    body: "PO-2024-090 untuk 60 kg Flores Bajawa telah dikirim ke Flores Arabica Farm. Menunggu konfirmasi.",
    time: "Kemarin 16:20",
    category: "pembelian",
    priority: "rendah",
    read: true,
    icon: ShoppingCart,
  },
  {
    id: "n10",
    title: "Laporan Stok Mingguan Tersedia",
    body: "Laporan ringkasan pergerakan stok minggu ini sudah siap. Total 12 transaksi masuk, 248 transaksi keluar.",
    time: "Kemarin 09:00",
    category: "sistem",
    priority: "rendah",
    read: true,
    icon: Package,
    action: "Lihat Laporan",
  },
];

const categories: { value: NotifCategory; label: string }[] = [
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

const categoryIcon: Record<Exclude<NotifCategory, "semua">, React.ElementType> = {
  stok: Coffee,
  pengiriman: Truck,
  pembelian: ShoppingCart,
  sistem: Bell,
};

const categoryTone: Record<Exclude<NotifCategory, "semua">, string> = {
  stok: "bg-destructive/10 text-destructive",
  pengiriman: "bg-accent/15 text-accent",
  pembelian: "bg-emerald-500/10 text-emerald-700",
  sistem: "bg-secondary text-muted-foreground",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotifCategory>("semua");
  const [items, setItems] = useState<Notification[]>(notifications);

  const filtered = items.filter(
    (n) => filter === "semua" || n.category === filter
  );
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const dismiss = (id: string) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <Topbar
        title="Notifikasi"
        subtitle="Pantau stok, pengiriman, dan aktivitas gudang"
      />
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
              value: "2",
              sub: "SKU perlu reorder",
              icon: AlertTriangle,
              warn: true,
            },
            {
              label: "Pengiriman Aktif",
              value: "1",
              sub: "dalam proses pengiriman",
              icon: Truck,
              warn: false,
            },
            {
              label: "PO Aktif",
              value: "3",
              sub: "menunggu konfirmasi",
              icon: ShoppingCart,
              warn: false,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className={`shadow-soft border-border/60 ${s.warn ? "bg-crema/10" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.warn ? "bg-destructive/10" : "bg-secondary"}`}
                  >
                    <s.icon
                      className={`h-4 w-4 ${s.warn ? "text-destructive" : "text-primary"}`}
                    />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">
                  {s.value}
                </div>
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
                    {items.filter((n) => n.category === c.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
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
                <p className="font-display text-lg font-semibold">
                  Tidak ada notifikasi
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Semua aktivitas sudah tertangani.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {filtered.map((notif) => {
                  const Icon = notif.icon;
                  const CatIcon = categoryIcon[notif.category];
                  return (
                    <li
                      key={notif.id}
                      className={`group relative flex gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 ${
                        !notif.read ? "bg-crema/8" : ""
                      }`}
                    >
                      {/* Unread dot */}
                      {!notif.read && (
                        <span
                          className={`absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full`}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`mt-0.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${categoryTone[notif.category]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${!notif.read ? "text-foreground" : "text-foreground/80"}`}
                          >
                            {notif.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${priorityTone[notif.priority]}`}
                          >
                            {notif.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 bg-secondary border-border/60 text-muted-foreground inline-flex items-center gap-1"
                          >
                            <CatIcon className="h-2.5 w-2.5" />
                            {notif.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {notif.body}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notif.time}
                          </span>
                          {notif.action && (
                            <button className="text-xs font-medium text-accent hover:text-primary transition-colors flex items-center gap-0.5">
                              {notif.action}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Tandai dibaca"
                            onClick={() => markRead(notif.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          title="Hapus notifikasi"
                          onClick={() => dismiss(notif.id)}
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

        {/* Footer hint */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground pb-2">
            Menampilkan {filtered.length} notifikasi ·{" "}
            <button
              className="text-accent hover:underline"
              onClick={() => setItems([])}
            >
              Hapus semua
            </button>
          </p>
        )}
      </main>
    </>
  );
}