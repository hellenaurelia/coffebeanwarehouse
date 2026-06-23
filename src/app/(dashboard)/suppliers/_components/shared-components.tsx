"use client";

import { X, CheckCircle2, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PO, POStatus } from "../page";
import { BTN_HOVER_COKLAT } from "../lib";

export const INP = "h-10 rounded-xl bg-secondary/50 text-sm";
export const TA = "w-full rounded-xl bg-secondary/50 border border-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring";
export const DATE_CLS = `${INP} relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50`;
export const BTN_PRIMARY = "rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 transition-colors";
export const BTN_OUTLINE = "rounded-xl border border-border hover:bg-secondary/80 transition-colors";

export const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const poTotal = (po: PO) => po.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0);

export const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).replace(/\./g, ":");

export function Modal({ onClose, children, wide = false }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-card border border-border/60 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between p-6 pb-4 border-b border-border/60 pr-10 relative">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="absolute top-6 right-6 h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ModalFooter({ onClose, onConfirm, confirmLabel, icon: Icon }: { onClose: () => void; onConfirm: () => void; confirmLabel: string; icon?: React.ElementType; }) {
  return (
    <div className="border-t border-border/60 px-6 py-4 flex gap-2 justify-end">
      <Button variant="outline" className={BTN_HOVER_COKLAT} onClick={onClose}>Batal</Button>
      <Button className={BTN_PRIMARY} onClick={onConfirm}>{Icon && <Icon className="h-4 w-4 mr-2" />}{confirmLabel}</Button>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export const ErrMsg = ({ msg }: { msg?: string }) => msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

export function NumericInput({ className, placeholder, value, onChange }: { className?: string; placeholder?: string; value: string; onChange: (v: string) => void; }) {
  return (
    <Input
      className={className}
      placeholder={placeholder}
      inputMode="numeric"
      type="text"
      value={value ? Number(value).toLocaleString("id-ID") : ""}
      onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
    />
  );
}

const poStatusTone = (s: POStatus) => s === "Diterima" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : s === "Dikirim" ? "bg-blue-500/10 text-blue-700 border-blue-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20";
const poStatusIcon = (s: POStatus) => s === "Diterima" ? CheckCircle2 : s === "Dikirim" ? Truck : Clock;

export function PORows({ pos, showSupplier = false, onDetail }: { pos: PO[]; showSupplier?: boolean; onDetail?: (po: PO) => void }) {
  if (pos.length === 0) {
    const cols = showSupplier ? 7 : 5;
    return <tr><td colSpan={cols} className="text-center py-10 text-muted-foreground">Belum ada purchase order.</td></tr>;
  }
  return (
    <>
      {pos.map(po => {
        const Icon = poStatusIcon(po.status);
        return (
          <tr key={po.id} className="border-t border-border/40 hover:bg-secondary/40 transition-colors">
            <td className="px-4 py-3 font-mono text-xs">{po.id}</td>
            {showSupplier && <td className="px-4 py-3 font-medium">{po.supplierName}</td>}
            <td className="px-4 py-3 text-muted-foreground">{po.date}</td>
            {showSupplier && <td className="px-4 py-3 text-muted-foreground">{po.arrivalDate}</td>}
            <td className="px-4 py-3 text-right tabular-nums font-medium">{fmt(poTotal(po))}</td>
            <td className="px-4 py-3 text-center">
              <Badge variant="outline" className={`${poStatusTone(po.status)} inline-flex items-center gap-1`}><Icon className="h-3 w-3" />{po.status}</Badge>
            </td>
            <td className="px-4 py-3 text-center">
              {onDetail && <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 px-3" onClick={() => onDetail(po)}>Detail</Button>}
            </td>
          </tr>
        );
      })}
    </>
  );
}