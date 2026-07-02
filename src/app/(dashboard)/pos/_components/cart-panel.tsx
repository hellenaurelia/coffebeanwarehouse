"use client";

import { Coffee, Trash2, Percent, Banknote, CreditCard, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fmt } from "./data";
import { usePOSProducts } from "./pos-context";
import type { PayMethod, GrindOption } from "./types";

const GRIND_FEE = 20000;

interface Props {
  cart: Record<string, number>;
  editingQty: Record<string, string>;
  grind: Record<string, GrindOption>;
  discPct: number;
  discOpen: boolean;
  discInput: string;
  payMethod: PayMethod | null;
  onQtyChange: (id: string, val: string) => void;
  onQtyCommit: (id: string) => void;
  onDelete: (id: string) => void;
  onGrindChange: (id: string, opt: GrindOption) => void;
  onDiscToggle: () => void;
  onDiscInputChange: (v: string) => void;
  onDiscApply: () => void;
  onDiscRemove: () => void;
  onPayMethodChange: (m: PayMethod) => void;
  onPay: () => void;
}

export function CartPanel({
  cart, editingQty, grind, discPct, discOpen, discInput,
  payMethod, onQtyChange, onQtyCommit, onDelete, onGrindChange,
  onDiscToggle, onDiscInputChange, onDiscApply, onDiscRemove,
  onPayMethodChange, onPay,
}: Props) {
  const products = usePOSProducts();
  const lines = Object.entries(cart).map(([id, qty]) => ({
    p: products.find(x => x.id === id)!,
    qty,
    grindOpt: grind[id] ?? "whole" as GrindOption,
  }));

  const subtotal  = lines.reduce((s, l) => {
    const grindFee = l.grindOpt === "ground" ? GRIND_FEE : 0;
    return s + l.p.price * l.qty + grindFee;
  }, 0);
  const discAmt   = Math.round(subtotal * discPct / 100);
  const afterDisc = subtotal - discAmt;
  const tax       = Math.round(afterDisc * 0.11);
  const total     = afterDisc + tax;

  const payLabels: Record<PayMethod, string> = { cash: "Cash", card: "Kartu", qris: "QRIS" };

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] border-l border-border bg-card flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Order #2051</div>
        <h3 className="font-display text-xl font-semibold">Pesanan Aktif</h3>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {lines.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Belum ada produk. Pilih dari katalog untuk mulai.
          </div>
        )}
        {lines.map(({ p, qty, grindOpt }) => (
          <div key={p.id} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="h-12 w-12 rounded-lg gradient-bean flex items-center justify-center shrink-0">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Nama + hapus */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tag}</div>
                </div>
                <button onClick={() => onDelete(p.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Qty + harga */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input className="h-8 w-20 text-center rounded-lg bg-card border-border"
                    type="number" step="0.1" min="0.1"
                    value={editingQty[p.id] ?? String(qty)}
                    onChange={e => onQtyChange(p.id, e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { onQtyCommit(p.id); e.currentTarget.blur(); } }}
                    onBlur={() => onQtyCommit(p.id)} />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
                <span className="font-medium tabular-nums text-sm">
                  {fmt(p.price * qty + (grindOpt === "ground" ? GRIND_FEE * qty : 0))}
                </span>
              </div>

              {/* Grind toggle */}
              <div className="mt-2 flex gap-1.5">
                {(["whole", "ground"] as GrindOption[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => onGrindChange(p.id, opt)}
                    className={`flex-1 h-7 rounded-lg text-xs font-medium border transition-colors ${
                      grindOpt === opt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {opt === "whole" ? "Whole Bean" : `Ground +${fmt(GRIND_FEE)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-5 space-y-4">
        {/* Diskon */}
        <div>
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm text-accent hover:underline" onClick={onDiscToggle}>
              <Percent className="h-4 w-4" />Tambah diskon / promo
            </button>
            {discPct > 0 && (
              <button onClick={onDiscRemove} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                <X className="h-3 w-3" />Hapus diskon
              </button>
            )}
          </div>
          {discOpen && (
            <div className="flex gap-2 mt-2">
              <Input type="number" placeholder="% diskon" min={0} max={100} step={1}
                value={discInput} onChange={e => onDiscInputChange(e.target.value)}
                className="h-8 w-28 rounded-lg bg-card border-border text-sm" />
              <Button size="sm" onClick={onDiscApply}>Terapkan</Button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          {discAmt > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon {discPct}%</span><span className="tabular-nums">−{fmt(discAmt)}</span>
            </div>
          )}
          {lines.some(l => l.grindOpt === "ground") && (
            <div className="flex justify-between text-muted-foreground">
              <span>Ground ({lines.filter(l => l.grindOpt === "ground").length} item)</span>
              <span className="tabular-nums">+{fmt(lines.filter(l => l.grindOpt === "ground").reduce((s, l) => s + GRIND_FEE, 0))}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>PPN 11%</span><span className="tabular-nums">{fmt(tax)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-display text-xl font-semibold">
            <span>Total</span><span className="tabular-nums">{fmt(total)}</span>
          </div>
        </div>

        {/* Pay method */}
        <div className="grid grid-cols-3 gap-2">
          {(["cash", "card", "qris"] as PayMethod[]).map(m => (
            <Button key={m} variant={payMethod === m ? "default" : "outline"} className="h-12 flex-col gap-0.5 text-xs"
              onClick={() => onPayMethodChange(m)}>
              {m === "cash" && <Banknote className="h-4 w-4" />}
              {m === "card" && <CreditCard className="h-4 w-4" />}
              {m === "qris" && <QrCode className="h-4 w-4" />}
              {payLabels[m]}
            </Button>
          ))}
        </div>

        <Button className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm"
          disabled={lines.length === 0 || !payMethod} onClick={onPay}>
          {lines.length === 0
            ? "Pilih produk terlebih dahulu"
            : !payMethod
            ? "Pilih metode pembayaran"
            : `Proses Pembayaran · ${fmt(total)}`}
        </Button>
      </div>
    </aside>
  );
}