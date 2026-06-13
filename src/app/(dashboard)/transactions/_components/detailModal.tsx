"use client";

import { Receipt } from "lucide-react";
import { useState } from "react";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, TAX, methodIcon } from "../lib";
import type { Trx } from "../types";

interface DetailModalProps {
  trx: Trx;
  onClose: () => void;
}

function PrintPreviewModal({
  trx,
  subtotal,
  tax,
  onClose,
}: {
  trx: Trx;
  subtotal: number;
  tax: number;
  onClose: () => void;
}) {
  const isCash = trx.method === "Cash";
  const change = isCash && trx.cashPaid != null ? trx.cashPaid - trx.total : 0;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-card border border-border/60 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Preview Struk
          </p>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Receipt body — styled like a thermal receipt */}
        <div
          className="mx-4 mb-4 rounded-xl bg-white text-gray-900 font-mono text-xs p-4 space-y-1 shadow-inner"
          id="print-receipt"
        >
          <p className="text-center font-bold text-sm tracking-wide">
            TOKO ARUNIKA
          </p>
          <p className="text-center text-[10px] text-gray-500 mb-2">
            Jl. Arabika No. 7
          </p>

          <div className="border-t border-dashed border-gray-300 my-1" />

          <div className="flex justify-between">
            <span className="text-gray-500">ID</span>
            <span>{trx.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tanggal</span>
            <span>
              {trx.date} {trx.time}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Kasir</span>
            <span>{trx.cashier}</span>
          </div>

          <div className="border-t border-dashed border-gray-300 my-1" />

          {trx.detail.map((item, i) => (
            <div key={i}>
              <p>{item.name}</p>
              <div className="flex justify-between text-gray-600">
                <span>
                  {item.qty} x {fmt(item.price)}
                </span>
                <span>{fmt(item.qty * item.price)}</span>
              </div>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-300 my-1" />

          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pajak (11%)</span>
            <span>{fmt(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-1">
            <span>TOTAL</span>
            <span>{fmt(trx.total)}</span>
          </div>

          {isCash && trx.cashPaid != null && (
            <>
              <div className="border-t border-dashed border-gray-300 my-1" />
              <div className="flex justify-between">
                <span className="text-gray-500">Tunai</span>
                <span>{fmt(trx.cashPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kembalian</span>
                <span>{fmt(change)}</span>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-gray-300 my-1" />
          <p className="text-center text-[10px] text-gray-400 pt-1">
            Terima kasih sudah berbelanja!
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-border/60 px-4 py-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl"
            onClick={onClose}
          >
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DetailModal({ trx, onClose }: DetailModalProps) {
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const Icon = methodIcon[trx.method] || Receipt;
  const subtotal = trx.detail.reduce((a, i) => a + i.qty * i.price, 0);
  const tax = subtotal * TAX;

  const isCash = trx.method === "Cash";
  const change = isCash && trx.cashPaid != null ? trx.cashPaid - trx.total : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Detail Transaksi
              </p>
              <h2 className="font-mono text-lg font-semibold">{trx.id}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {trx.date} · {trx.time} · {trx.cashier}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Items table */}
          <div className="mx-6 mb-4 rounded-xl overflow-hidden border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60 text-xs text-muted-foreground">
                  <th className="text-left font-medium px-4 py-2.5">Produk</th>
                  <th className="text-center font-medium px-3 py-2.5">Qty</th>
                  <th className="text-right font-medium px-4 py-2.5">Harga</th>
                </tr>
              </thead>
              <tbody>
                {trx.detail.map((item, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">
                      {item.qty}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {fmt(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mx-6 mb-5 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (11%)</span>
              <span className="tabular-nums">{fmt(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-border/60 pt-2">
              <span>Total</span>
              <span className="tabular-nums">{fmt(trx.total)}</span>
            </div>

            {/* Cash payment info */}
            {isCash && trx.cashPaid != null && (
              <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Uang Diterima</span>
                  <span className="tabular-nums">{fmt(trx.cashPaid)}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Kembalian</span>
                  <span className="tabular-nums">{fmt(change)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="px-6 mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>Dibayar via {trx.method}</span>
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              onClick={() => setShowPrintPreview(true)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
          </div>
        </div>
      </div>

      {showPrintPreview && (
        <PrintPreviewModal
          trx={trx}
          subtotal={subtotal}
          tax={tax}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </>
  );
}
