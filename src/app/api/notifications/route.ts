import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NotifCategory = "stok" | "pengiriman" | "pembelian" | "sistem";
type NotifPriority = "tinggi" | "sedang" | "rendah";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: NotifCategory;
  priority: NotifPriority;
  read: boolean;
  action?: string;
  actionUrl?: string;
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 172800) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export async function GET() {
  const [allProducts, activePOs, recentReceived] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["PENDING", "DIKIRIM"] } },
      include: {
        supplier: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.purchaseOrder.findMany({
      where: {
        status: "DITERIMA",
        receivedAt: { gte: new Date(Date.now() - 86400_000) },
      },
      include: {
        supplier: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { receivedAt: "desc" },
      take: 5,
    }),
  ]);

  const notifications: NotificationItem[] = [];

  // 1. Stok
  for (const p of allProducts) {
    if (p.stockKg <= 0) {
      notifications.push({
        id: `stok-habis-${p.id}`,
        title: `Stok Habis: ${p.name}`,
        body: `Stok ${p.name} sudah habis (0 kg). Segera buat Purchase Order.`,
        time: timeAgo(p.updatedAt),
        category: "stok",
        priority: "tinggi",
        read: false,
        action: "Buat PO",
        actionUrl: `/suppliers`,
      });
    } else if (p.stockKg <= p.minStockKg) {
      const isCritical = p.stockKg / p.minStockKg < 0.3;
      notifications.push({
        id: `stok-kritis-${p.id}`,
        title: `Stok ${isCritical ? "Kritis" : "Menipis"}: ${p.name}`,
        body: `Tersisa ${p.stockKg} kg dari ambang batas ${p.minStockKg} kg.`,
        time: timeAgo(p.updatedAt),
        category: "stok",
        priority: isCritical ? "tinggi" : "sedang",
        read: false,
        action: "Buat PO",
        actionUrl: `/suppliers`,
      });
    }
  }

  // 2. PO aktif
  for (const po of activePOs) {
    const productNames = po.items.map((i) => i.product.name).join(", ");
    const isDikirim = po.status === "DIKIRIM";
    notifications.push({
      id: `po-${po.id}`,
      title: isDikirim
        ? `Pengiriman Aktif: ${po.supplier.name}`
        : `PO Menunggu: ${po.poNumber}`,
      body: isDikirim
        ? `${po.poNumber} dari ${po.supplier.name} sedang dalam perjalanan. Produk: ${productNames}.`
        : `${po.poNumber} untuk ${productNames} menunggu konfirmasi supplier.`,
      time: timeAgo(po.createdAt),
      category: isDikirim ? "pengiriman" : "pembelian",
      priority: isDikirim ? "tinggi" : "sedang",
      read: false,
      action: "Lihat Riwayat PO",
      actionUrl: `/suppliers/riwayat-po`,
    });
  }

  // 3. Baru diterima
  for (const po of recentReceived) {
    const productNames = po.items.map((i) => i.product.name).join(", ");
    notifications.push({
      id: `received-${po.id}`,
      title: `Barang Diterima: ${po.supplier.name}`,
      body: `${po.poNumber} — ${productNames} telah diterima dan dicatat ke inventori.`,
      time: timeAgo(po.receivedAt!),
      category: "pengiriman",
      priority: "rendah",
      read: true,
      action: "Lihat Riwayat PO",
      actionUrl: `/suppliers/riwayat-po`,
    });
  }

  // 4. Sistem
  const lowStockCount = allProducts.filter((p) => p.stockKg <= p.minStockKg).length;
  if (lowStockCount >= 3) {
    notifications.push({
      id: "sistem-restock",
      title: "Restock Direkomendasikan",
      body: `${lowStockCount} SKU berada di bawah stok minimum.`,
      time: "Baru saja",
      category: "sistem",
      priority: "sedang",
      read: false,
      action: "Tinjau Inventori",
      actionUrl: `/inventory`,
    });
  }

  const priorityOrder: Record<NotifPriority, number> = { tinggi: 0, sedang: 1, rendah: 2 };
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const summary = {
    unread: notifications.filter((n) => !n.read).length,
    stokKritis: allProducts.filter((p) => p.stockKg > 0 && p.stockKg <= p.minStockKg).length,
    stokHabis: allProducts.filter((p) => p.stockKg <= 0).length,
    pengirimanAktif: activePOs.filter((p) => p.status === "DIKIRIM").length,
    poAktif: activePOs.filter((p) => p.status === "PENDING").length,
  };

  return NextResponse.json({ notifications, summary });
}