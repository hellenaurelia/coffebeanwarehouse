"use client";

import { useState } from "react";
import { CreditCard, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal-shell";
import { fmt } from "./data";

export function KartuModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const [status, setStatus] = useState<"waiting" | "processing" | "done">("waiting");

  function handleTap() {
    setStatus("processing");
    setTimeout(() => { setStatus("done"); setTimeout(() => onSuccess(), 1500); }, 1200);
  }

  if (status === "done") return (
    <Modal onClose={onClose}>
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold">Pembayaran Berhasil</p>
          <p className="text-muted-foreground text-sm mt-1">{fmt(total)} via Kartu</p>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Pembayaran Kartu</p>
            <p className="text-xs text-muted-foreground">Debit / Kredit · Tap atau gesek</p>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-6 mb-6 bg-secondary/50 rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
        <p className="font-display text-3xl font-bold">{fmt(total)}</p>
      </div>

      <div className="mx-6 mb-6 flex flex-col items-center gap-3">
        <div className={`w-full rounded-2xl border-2 p-6 flex flex-col items-center gap-3 transition-all ${
          status === "processing" ? "border-primary bg-primary/5 animate-pulse" : "border-dashed border-border"
        }`}>
          <CreditCard className={`h-12 w-12 ${status === "processing" ? "text-primary" : "text-muted-foreground"}`} />
          <p className={`text-sm font-medium ${status === "processing" ? "text-primary" : "text-muted-foreground"}`}>
            {status === "processing" ? "Memproses pembayaran…" : "Tempelkan atau gesek kartu pada mesin EDC"}
          </p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {["Tap NFC","Swipe","Insert Chip"].map(s => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />{s}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={status === "processing"}>
          <ArrowLeft className="h-4 w-4 mr-2" />Kembali
        </Button>
        <Button className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleTap} disabled={status === "processing"}>
          {status === "processing" ? "Memproses…" : "Konfirmasi Bayar"}
        </Button>
      </div>
    </Modal>
  );
}