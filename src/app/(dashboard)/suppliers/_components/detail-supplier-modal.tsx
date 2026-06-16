"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Trash2, Pencil, ClipboardList, Tag, AlertCircle } from "lucide-react";
import type { Supplier, PO, SupplierBean } from "../page";
import { Modal, ModalHeader, BTN_PRIMARY, PORows, fmt, poTotal } from "./shared-components";
import { BTN_HOVER_COKLAT, InventoryItem } from "../lib";

const fmtKg = (n: number) => n.toLocaleString("id-ID") + " kg";

const statusTone = (s: string) =>
  s === "Aktif"    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
  : s === "Pending"  ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
  : "bg-muted text-muted-foreground border-border";

const typeTone = (type: string): string =>
  ({
    Arabica:  "bg-sky-500/10 text-sky-700 border-sky-500/20",
    Robusta:  "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Liberica: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    Luwak:    "bg-rose-500/10 text-rose-700 border-rose-500/20",
  } as Record<string, string>)[type] ?? "bg-secondary text-muted-foreground border-border";

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  const match = cleaned.match(/^(\+62|0)(\d{3,4})(\d{4})(\d{3,4})?$/);
  if (match) return `${match[1]} ${match[2]}-${match[3]}${match[4] ? "-" + match[4] : ""}`;
  return phone;
};

const beanHasStock = (beanName: string, inventory: InventoryItem[] | undefined): boolean =>
  (inventory ?? []).some(
    item =>
      item.name.toLowerCase().includes(beanName.toLowerCase()) &&
      item.stock > 0
  );

// Bean Card 
function BeanCard({
  bean,
  hasStock,
  onToggle,
}: {
  bean: SupplierBean;
  hasStock: boolean;
  onToggle: () => void;
}) {
  const isActive = bean.active !== false;
  // Hanya block deaktivasi jika stok masih ada; reaktivasi selalu boleh
  const blockToggle = isActive && hasStock;

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
        isActive
          ? "border-border/60 bg-card"
          : "border-border/30 bg-secondary/20"
      }`}
    >
      {/* Strip kiri sebagai status indicator */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-colors ${
          isActive ? "bg-emerald-400" : "bg-border/40"
        }`}
      />

      {/* Info biji kopi */}
      <div className="flex flex-col gap-1 min-w-0 pl-2">
        <span
          className={`text-sm font-medium leading-tight transition-colors ${
            isActive ? "text-foreground" : "line-through text-muted-foreground/60"
          }`}
        >
          {bean.name}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {bean.type && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeTone(bean.type)}`}>
              {bean.type}
            </Badge>
          )}
          {!isActive && (
            <span className="text-[10px] text-muted-foreground/70 font-medium">Non-aktif</span>
          )}
        </div>
      </div>

      {/* Harga + tombol toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-semibold tabular-nums transition-colors ${isActive ? "text-primary" : "text-muted-foreground/50"}`}>
          {fmt(bean.price)}/kg
        </span>

        {/* Tombol toggle dengan tooltip inline jika disabled */}
        <div className="relative">
          <button
            type="button"
            disabled={blockToggle}
            onClick={onToggle}
            aria-label={
              blockToggle
                ? "Tidak dapat dinonaktifkan — stok masih ada di gudang"
                : isActive
                  ? `Nonaktifkan ${bean.name}`
                  : `Aktifkan kembali ${bean.name}`
            }
            className={`h-7 px-3 rounded-lg border text-xs font-medium transition-all ${
              blockToggle
                ? "opacity-35 cursor-not-allowed border-border/40 text-muted-foreground bg-transparent"
                : isActive
                  ? "border-border/60 text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  : "border-emerald-300/80 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 active:scale-95"
            }`}
          >
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>

          {/* Tooltip */}
          {blockToggle && (
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-52 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
              <div className="bg-foreground/95 text-background rounded-lg px-3 py-2 text-[11px] leading-snug shadow-lg">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 text-amber-300" />
                  <span>Masih ada stok di gudang. Habiskan stok dulu sebelum menonaktifkan.</span>
                </div>
              </div>
              {/* Arrow tooltip */}
              <div className="absolute right-4 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-foreground/95" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Modal
export function DetailModal({
  supplier,
  pos,
  inventory,
  onClose,
  onBuatPO,
  onEdit,
  onHapus,
  onOpenPODetail,
  onToggleBean,
}: {
  supplier: Supplier;
  pos: PO[];
  inventory?: InventoryItem[];
  onClose: () => void;
  onBuatPO: (s: Supplier) => void;
  onEdit: (s: Supplier) => void;
  onHapus: (s: Supplier) => void;
  onOpenPODetail: (po: PO) => void;
  onToggleBean?: (supplierId: string, beanName: string) => void;
}) {
  // 1. Buat local state untuk menyimpan data supplier agar bisa di-update seketika
  const [localSupplier, setLocalSupplier] = useState<Supplier>(supplier);

  // 2. Sinkronisasikan jika ada perubahan prop dari parent
  useEffect(() => {
    setLocalSupplier(supplier);
  }, [supplier]);

  const sPOs = pos.filter(p => p.supplierId === localSupplier.id);
  const totalValue = sPOs.reduce((a, p) => a + poTotal(p), 0);
  const go = (fn: (s: Supplier) => void) => { onClose(); fn(localSupplier); };

  const activeBeanCount = localSupplier.beans.filter(b => b.active !== false).length;

  // 3. Handler khusus untuk merespon klik toggle secara real-time
  const handleToggleBean = (beanName: string) => {

    onToggleBean?.(localSupplier.id, beanName);

    setLocalSupplier(prev => ({
      ...prev,
      beans: prev.beans.map(b => 
        b.name === beanName 
          ? { ...b, active: b.active === false ? true : false } 
          : b
      )
    }));
  };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader
        title={localSupplier.name}
        subtitle={`${localSupplier.id} · ${localSupplier.pic}`}
        onClose={onClose}
      />

      <div className="p-6 space-y-5 overflow-y-auto">

        {/* Status and stats */}
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline" className={`${statusTone(localSupplier.status)} text-xs`}>
            {localSupplier.status}
          </Badge>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Total Pasokan</div>
              <div className="font-semibold tabular-nums">{fmtKg(localSupplier.totalKg)}</div>
            </div>
            <div className="w-px h-7 bg-border/50" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Terakhir Kirim</div>
              <div className="font-semibold">{localSupplier.lastDelivery}</div>
            </div>
          </div>
        </div>

        {/* Kontak */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: MapPin, label: "Region",  val: localSupplier.region },
            { icon: Phone,  label: "Telepon", val: formatPhone(localSupplier.phone), mono: true },
            { icon: Mail,   label: "Email",   val: localSupplier.email },
          ].map(({ icon: Icon, label, val, mono }) => (
            <div
              key={label}
              className="flex flex-col gap-1 bg-secondary/30 rounded-xl px-3 py-2.5 border border-border/40"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3 w-3 shrink-0" />
                <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
              </div>
              <span className={`text-xs truncate font-medium ${mono ? "font-mono" : ""}`}>{val}</span>
            </div>
          ))}
        </div>

        {/* Biji Kopi & Harga Kontrak */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Biji Kopi & Harga Kontrak
            </h3>
            {/* Counter aktif/total */}
            {activeBeanCount < localSupplier.beans.length && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 border-amber-500/20"
              >
                {activeBeanCount}/{localSupplier.beans.length} aktif
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {localSupplier.beans.map(bean => (
              <BeanCard
                key={bean.name}
                bean={bean}
                hasStock={beanHasStock(bean.name, inventory)}
                onToggle={() => handleToggleBean(bean.name)}
              />
            ))}
          </div>
        </div>

        {/* Alamat */}
        {localSupplier.address && (
          <div className="flex gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3 border border-border/40">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{localSupplier.address}</span>
          </div>
        )}

        {/* Catatan */}
        {localSupplier.notes && (
          <div className="bg-secondary/30 border border-border/60 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Catatan</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{localSupplier.notes}</p>
          </div>
        )}

        {/* Riwayat PO */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold">Riwayat Purchase Order</h3>
            <span className="text-xs text-muted-foreground tabular-nums">{sPOs.length} PO · {fmt(totalValue)}</span>
          </div>
          {sPOs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground bg-secondary/30 rounded-xl border border-border/40">
              Belum ada PO untuk supplier ini.
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    {["ID PO", "Tanggal", "Total", "Status", "Aksi"].map(h => (
                      <th
                        key={h}
                        className={`font-medium px-4 py-2.5 ${
                          h === "Total" ? "text-right" : h === "Status" || h === "Aksi" ? "text-center" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <PORows pos={sPOs} onDetail={onOpenPODetail} />
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <Button className={`flex-1 ${BTN_PRIMARY}`} onClick={() => go(onBuatPO)}>
            <ClipboardList className="h-4 w-4 mr-2" />Buat PO
          </Button>
          <Button variant="outline" className={`flex-1 ${BTN_HOVER_COKLAT}`} onClick={() => go(onEdit)}>
            <Pencil className="h-4 w-4 mr-2" />Edit
          </Button>
          <div className="w-px h-8 bg-border/50 mx-1" />
          <Button
            variant="outline"
            className="h-9 px-3 border-border/60 text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={() => go(onHapus)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}