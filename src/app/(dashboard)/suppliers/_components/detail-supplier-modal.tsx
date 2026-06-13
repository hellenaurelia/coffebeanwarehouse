"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Trash2, Pencil, ClipboardList, Tag } from "lucide-react";
import type { Supplier, PO } from "../page";
import { Modal, ModalHeader, BTN_PRIMARY, BTN_OUTLINE, PORows, fmt, poTotal } from "./shared-components";

const fmtKg = (n: number) => n.toLocaleString("id-ID") + " kg";
const statusTone = (s: string) => s === "Aktif" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : s === "Pending" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-muted text-muted-foreground border-border";

const typeTone: Record<string, string> = {
  Arabica:  "bg-sky-500/10 text-sky-700 border-sky-500/20",
  Robusta:  "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Liberica: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  Luwak:    "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const match = cleaned.match(/^(\+62|0)(\d{3,4})(\d{4})(\d{3,4})?$/);
  if (match) return `${match[1]} ${match[2]}-${match[3]}${match[4] ? '-' + match[4] : ''}`;
  return phone;
};

export function DetailModal({ supplier, pos, onClose, onBuatPO, onEdit, onHapus, onOpenPODetail }: {
  supplier: Supplier; pos: PO[]; onClose: () => void;
  onBuatPO: (s: Supplier) => void; onEdit: (s: Supplier) => void; onHapus: (s: Supplier) => void;
  onOpenPODetail: (po: PO) => void;
}) {
  const sPOs = pos.filter(p => p.supplierId === supplier.id);
  const totalValue = sPOs.reduce((a, p) => a + poTotal(p), 0);
  const go = (fn: (s: Supplier) => void) => { onClose(); fn(supplier); };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader title={supplier.name} subtitle={`${supplier.id} · ${supplier.pic}`} onClose={onClose} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusTone(supplier.status)}>{supplier.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{supplier.region}</div>
            <div className="flex items-center gap-2 font-mono text-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />{formatPhone(supplier.phone)}
            </div>
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />{supplier.email}</div>
          </div>
          <div className="space-y-3">
            {([["Total Pasokan", fmtKg(supplier.totalKg)],["Terakhir Kirim", supplier.lastDelivery]] as [string,string][]).map(([label, val]) => (
              <div key={label} className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="font-semibold text-foreground">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" /> Daftar Biji Kopi & Harga Kontrak
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {supplier.beans.map(b => (
              <div key={b.name} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-sm leading-tight">{b.name}</span>
                  {b.type && (
                    <Badge variant="outline" className={`text-[10px] w-fit px-1.5 py-0 ${typeTone[b.type] ?? "bg-secondary text-muted-foreground border-border"}`}>
                      {b.type}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary ml-2 shrink-0">{fmt(b.price)}/kg</span>
              </div>
            ))}
          </div>
        </div>

        {supplier.address && (
          <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3 flex gap-2 border border-border/40">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />{supplier.address}
          </div>
        )}

        {supplier.notes && (
          <div className="text-sm bg-secondary/30 border border-border/60 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Catatan</p>
            <p className="text-muted-foreground">{supplier.notes}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Riwayat Purchase Order</h3>
            <span className="text-xs text-muted-foreground">{sPOs.length} PO · {fmt(totalValue)}</span>
          </div>
          {sPOs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground bg-secondary/30 rounded-xl border border-border/40">Belum ada PO untuk supplier ini.</div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    {["ID PO","Tanggal","Total","Status","Aksi"].map((h) => (
                      <th key={h} className={`font-medium px-4 py-2.5 ${h==="Total"?"text-right":h==="Status"||h==="Aksi"?"text-center":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody><PORows pos={sPOs} onDetail={onOpenPODetail} /></tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-4 flex gap-2">
        <Button className={`${BTN_PRIMARY} px-3 text-sm`} onClick={() => go(onHapus)}><Trash2 className="h-4 w-4 mr-1.5" />Hapus</Button>
        <Button variant="outline" className={`flex-1 ${BTN_OUTLINE}`} onClick={() => go(onEdit)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
        <Button className={`flex-1 ${BTN_PRIMARY}`} onClick={() => go(onBuatPO)}><ClipboardList className="h-4 w-4 mr-2" />Buat PO</Button>
      </div>
    </Modal>
  );
}