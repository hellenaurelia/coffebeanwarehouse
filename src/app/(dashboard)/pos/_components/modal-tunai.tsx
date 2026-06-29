"use client";

import { useState } from "react";
import { Banknote, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "./modal-shell";
import { fmt, NOMINALS } from "./data";
import type { GrindOption } from "./types";

export type CartLineForReceipt = {
  name: string;
  qty: number;
  price: number;
  grind: GrindOption;
};

export function TunaiModal({
  total,
  lines,
  onSuccess,
  onClose,
}: {
  total: number;
  lines: CartLineForReceipt[]; // ← TAMBAHAN
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  const received = parseFloat(input.replace(/\D/g, "")) || 0;
  const change = received - total;
  const valid = received >= total;

  function formatRupiah(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return parseInt(digits, 10).toLocaleString("id-ID");
  }

  function addNominal(n: number) { setInput((received + n).toLocaleString("id-ID")); }

  function handleProcess() {
    setDone(true);
    setTimeout(() => onSuccess(), 1800);
  }

  if (done) return (
    <Modal onClose={onClose}>
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold">Pembayaran Berhasil</p>
          <p className="text-muted-foreground text-sm mt-1">
            Kembalian <span className="font-semibold text-foreground">{fmt(change)}</span>
          </p>
        </div>

        <div className="w-full text-left bg-secondary/40 rounded-xl px-4 py-3 space-y-1 text-xs font-mono">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">
                {l.name}
                <span className="ml-1 text-muted-foreground">
                  ({l.grind === "ground" ? "Giling" : "Biji Utuh"})
                </span>
              </span>
              <span className="shrink-0 text-muted-foreground">{l.qty} kg</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <Banknote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Pembayaran Tunai</p>
            <p className="text-xs text-muted-foreground">Total yang harus dibayar</p>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-6 mb-4 bg-secondary/50 rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
        <p className="font-display text-3xl font-bold">{fmt(total)}</p>
      </div>

      <div className="px-6 mb-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Uang Diterima</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
          <Input className="h-14 pl-10 text-xl font-semibold rounded-xl bg-card border-border tabular-nums"
            type="text" inputMode="numeric" placeholder="0" value={input}
            onChange={e => setInput(formatRupiah(e.target.value))} autoFocus />
        </div>
      </div>

      <div className="px-6 mb-4 flex flex-wrap gap-2">
        {NOMINALS.map(n => (
          <button key={n} onClick={() => addNominal(n)}
            className="px-3 h-8 rounded-full text-xs border border-border bg-secondary hover:bg-secondary/80 transition-colors tabular-nums">
            +{fmt(n)}
          </button>
        ))}
        <button onClick={() => setInput("")}
          className="px-3 h-8 rounded-full text-xs border border-border text-muted-foreground hover:bg-secondary transition-colors">
          Reset
        </button>
      </div>

      <div className={`mx-6 mb-5 rounded-xl px-5 py-3 flex items-center justify-between transition-colors ${
        received === 0 ? "bg-secondary/30" :
        valid ? "bg-primary/8 border border-primary/20" : "bg-destructive/8 border border-destructive/20"
      }`}>
        <span className="text-sm font-medium">Kembalian</span>
        <span className={`font-display text-lg font-bold tabular-nums ${
          received === 0 ? "text-muted-foreground" :
          valid ? "text-primary" : "text-destructive"
        }`}>
          {received === 0 ? "—" : valid ? fmt(change) : "Kurang " + fmt(total - received)}
        </span>
      </div>

      <div className="px-6 pb-6">
        <Button className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!valid} onClick={handleProcess}>
          {valid ? `Proses · Kembalikan ${fmt(change)}` : "Nominal belum cukup"}
        </Button>
      </div>
    </Modal>
  );
}