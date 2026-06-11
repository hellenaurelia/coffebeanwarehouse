"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Trash2, Pencil, ClipboardList } from "lucide-react";
import type { Supplier, PO } from "../page";
import { Modal, ModalHeader, BTN_PRIMARY, BTN_OUTLINE, PORows, fmt, poTotal } from "./shared-components";

const fmtKg = (n: number) => n.toLocaleString("id-ID") + " kg";
const statusTone = (s: string) => s === "Aktif" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : s === "Pending" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-muted text-muted-foreground border-border";

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
          {supplier.beans.map(b => <Badge key={b} variant="outline" className="text-xs bg-secondary/60">{b}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3 text-muted-foreground">
            {([[MapPin, supplier.region],[Phone, supplier.phone],[Mail, supplier.email]] as [React.ElementType, string][]).map(([Icon, val]) => (
              <div key={val} className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 shrink-0" />{val}</div>
            ))}
          </div>
          <div className="space-y-3">
            {([["Total Pasokan", fmtKg(supplier.totalKg)],["Terakhir Kirim", supplier.lastDelivery]] as [string,string][]).map(([label, val]) => (
              <div key={label} className="bg-secondary/50 rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-semibold">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {supplier.address && (
          <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3 flex gap-2">
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
            <div className="text-center py-8 text-sm text-muted-foreground bg-secondary/30 rounded-xl">Belum ada PO untuk supplier ini.</div>
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