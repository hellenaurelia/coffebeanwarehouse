"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { CatalogPanel } from "./_components/catalog-panel";
import { CartPanel } from "./_components/cart-panel";
import { TunaiModal } from "./_components/modal-tunai";
import { QRISModal } from "./_components/modal-qris";
import { KartuModal } from "./_components/modal-kartu";
import { getShift, products, fmt } from "./_components/data";
import type { PayMethod, GrindOption } from "./_components/types";

const GRIND_FEE = 20000;

export default function POSPage() {
  const [cart, setCart]             = useState<Record<string, number>>({ p1: 1, p7: 2 });
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});
  const [grind, setGrind]           = useState<Record<string, GrindOption>>({});
  const [payMethod, setPayMethod]   = useState<PayMethod | null>(null);
  const [discOpen, setDiscOpen]     = useState(false);
  const [discInput, setDiscInput]   = useState("");
  const [discPct, setDiscPct]       = useState(0);
  const [payModal, setPayModal]     = useState<PayMethod | null>(null);

  const del = (id: string) => setCart(c => { const { [id]: _, ...rest } = c; return rest; });

  const commitQty = (id: string) => {
    const value = parseFloat(editingQty[id] ?? String(cart[id]));
    if (!isNaN(value) && value > 0) setCart(c => ({ ...c, [id]: value }));
    else del(id);
    setEditingQty(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  const applyDisc = () => {
    const v = parseFloat(discInput);
    setDiscPct(!isNaN(v) && v >= 0 && v <= 100 ? v : 0);
    setDiscOpen(false);
  };

  const handlePaymentSuccess = () => {
    setCart({});
    setPayMethod(null);
    setDiscPct(0);
    setDiscInput("");
    setGrind({});
    setPayModal(null);
  };

  // Hitung total untuk modal
  const lines = Object.entries(cart).map(([id, qty]) => ({
    p: products.find(x => x.id === id)!,
    qty,
    grindOpt: grind[id] ?? "whole" as GrindOption,
  }));
  const subtotal  = lines.reduce((s, l) => s + l.p.price * l.qty + (l.grindOpt === "ground" ? GRIND_FEE * l.qty : 0), 0);
  const discAmt   = Math.round(subtotal * discPct / 100);
  const afterDisc = subtotal - discAmt;
  const tax       = Math.round(afterDisc * 0.11);
  const total     = afterDisc + tax;

  return (
    <>
      <Topbar title="Kasir / Point of Sale" subtitle={getShift()} />
      <main className="flex-1 grid lg:grid-cols-[1fr_420px] min-h-0">
        <CatalogPanel
          cart={cart}
          onAdd={(id) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }))}
        />
        <CartPanel
          cart={cart}
          editingQty={editingQty}
          grind={grind}
          discPct={discPct}
          discOpen={discOpen}
          discInput={discInput}
          payMethod={payMethod}
          onQtyChange={(id, val) => setEditingQty(prev => ({ ...prev, [id]: val }))}
          onQtyCommit={commitQty}
          onDelete={del}
          onGrindChange={(id, opt) => setGrind(prev => ({ ...prev, [id]: opt }))}
          onDiscToggle={() => setDiscOpen(v => !v)}
          onDiscInputChange={setDiscInput}
          onDiscApply={applyDisc}
          onDiscRemove={() => { setDiscPct(0); setDiscInput(""); }}
          onPayMethodChange={setPayMethod}
          onPay={() => payMethod && setPayModal(payMethod)}
        />
      </main>

      {payModal === "cash" && <TunaiModal total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
      {payModal === "qris" && <QRISModal  total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
      {payModal === "card" && <KartuModal total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
    </>
  );
}