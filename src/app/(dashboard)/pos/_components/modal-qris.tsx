"use client";

import { useState } from "react";
import { QrCode, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal-shell";
import { fmt } from "./data";

export function QRISModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const [status, setStatus] = useState<"waiting" | "done">("waiting");

  function handleConfirm() {
    setStatus("done");
    setTimeout(() => onSuccess(), 1500);
  }

  if (status === "done") return (
    <Modal onClose={onClose}>
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold">Pembayaran Berhasil</p>
          <p className="text-muted-foreground text-sm mt-1">{fmt(total)} via QRIS</p>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Pembayaran QRIS</p>
            <p className="text-xs text-muted-foreground">Scan QR untuk membayar</p>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-6 mb-4 bg-white rounded-2xl p-5 flex flex-col items-center gap-3 border border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 rounded bg-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">QRIS</span>
        </div>
        <svg viewBox="0 0 200 200" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="56" height="56" rx="4" fill="#111"/>
          <rect x="18" y="18" width="40" height="40" rx="2" fill="white"/>
          <rect x="26" y="26" width="24" height="24" rx="1" fill="#111"/>
          <rect x="134" y="10" width="56" height="56" rx="4" fill="#111"/>
          <rect x="142" y="18" width="40" height="40" rx="2" fill="white"/>
          <rect x="150" y="26" width="24" height="24" rx="1" fill="#111"/>
          <rect x="10" y="134" width="56" height="56" rx="4" fill="#111"/>
          <rect x="18" y="142" width="40" height="40" rx="2" fill="white"/>
          <rect x="26" y="150" width="24" height="24" rx="1" fill="#111"/>
          {[
            [76,10],[84,10],[92,10],[100,10],[108,10],[76,18],[92,18],[108,18],[116,18],
            [76,26],[84,26],[100,26],[116,26],[124,26],[76,34],[92,34],[108,34],[124,34],
            [84,42],[92,42],[100,42],[108,42],[116,42],[76,50],[100,50],[124,50],
            [76,58],[84,58],[92,58],[108,58],[124,58],
            [10,76],[26,76],[42,76],[58,76],[76,76],[92,76],[108,76],[134,76],[150,76],[166,76],[182,76],
            [18,84],[34,84],[50,84],[84,84],[100,84],[116,84],[142,84],[158,84],[174,84],
            [10,92],[26,92],[58,92],[76,92],[92,92],[108,92],[124,92],[142,92],[166,92],[182,92],
            [18,100],[42,100],[58,100],[84,100],[116,100],[134,100],[150,100],[174,100],
            [10,108],[34,108],[50,108],[76,108],[100,108],[124,108],[142,108],[158,108],[182,108],
            [18,116],[26,116],[58,116],[84,116],[108,116],[134,116],[150,116],[166,116],[174,116],
            [76,134],[84,142],[100,134],[116,142],[124,134],[134,150],[142,142],[158,134],[166,142],[182,134],
            [76,142],[92,150],[108,142],[124,150],[150,150],[166,150],[174,142],[182,150],
            [76,150],[84,158],[100,158],[116,150],[134,158],[142,166],[158,158],[166,158],[182,158],
            [76,158],[92,166],[108,166],[124,158],[150,166],[174,166],[182,166],
            [76,166],[84,174],[100,166],[116,174],[134,166],[142,174],[158,166],[166,174],[182,174],
            [76,174],[92,182],[108,174],[124,182],[134,174],[150,182],[174,182],
          ].map(([x,y],i) => <rect key={i} x={x} y={y} width="7" height="7" fill="#111"/>)}
        </svg>
        <div className="text-center">
          <p className="font-display text-xl font-bold tabular-nums">{fmt(total)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Berlaku 5 menit</p>
        </div>
      </div>

      <div className="px-6 pb-4 text-center text-xs text-muted-foreground">
        Arahkan kamera ke QR code — GoPay, OVO, Dana, ShopeePay, dan semua bank
      </div>

      <div className="px-6 pb-6 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />Kembali
        </Button>
        <Button className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleConfirm}>
          Konfirmasi Bayar
        </Button>
      </div>
    </Modal>
  );
}