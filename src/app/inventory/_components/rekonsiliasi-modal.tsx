"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { InventoryItem } from "../page";

interface RekonsiliasiModalProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSave: (updated: InventoryItem[]) => void;
}

interface RekonEntry {
  sku: string;
  fisik: string; // string for input, convert to number on save
}

type Step = "input" | "review" | "done";

export function RekonsiliasiModal({ open, onClose, items, onSave }: RekonsiliasiModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [entries, setEntries] = useState<RekonEntry[]>(
    items.map((i) => ({ sku: i.sku, fisik: "" }))
  );

  if (!open) return null;

  const setFisik = (sku: string, val: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.sku === sku ? { ...e, fisik: val } : e))
    );
  };

  // Items with a physical count entered
  const changed = entries.filter((e) => e.fisik !== "" && !isNaN(Number(e.fisik)));

  // Selisih calculation
  const diffs = changed.map((e) => {
    const item = items.find((i) => i.sku === e.sku)!;
    const fisik = Number(e.fisik);
    const selisih = fisik - item.stock;
    return { item, fisik, selisih };
  });

  const handleSave = () => {
    const updated = items.map((item) => {
      const entry = entries.find((e) => e.sku === item.sku);
      if (entry && entry.fisik !== "" && !isNaN(Number(entry.fisik))) {
        return { ...item, stock: Number(entry.fisik) };
      }
      return item;
    });
    onSave(updated);
    setStep("done");
  };

  const handleClose = () => {
    setStep("input");
    setEntries(items.map((i) => ({ sku: i.sku, fisik: "" })));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-card rounded-t-2xl md:rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold">Rekonsiliasi Stok</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === "input" && "Masukkan stok fisik hasil hitung gudang"}
              {step === "review" && "Tinjau selisih sebelum menyimpan"}
              {step === "done" && "Rekonsiliasi selesai"}
            </p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          {["input", "review", "done"].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-primary text-primary-foreground" : (["review", "done"].indexOf(step) > ["input", "review", "done"].indexOf(s) ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground")}`}>
                {idx + 1}
              </div>
              <span className={step === s ? "text-foreground font-medium" : "text-muted-foreground"}>
                {s === "input" ? "Hitung Fisik" : s === "review" ? "Tinjau" : "Selesai"}
              </span>
              {idx < 2 && <div className="h-px w-4 bg-border" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {step === "input" && (
            <>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs uppercase tracking-wider text-muted-foreground px-2 mb-1">
                <span>Produk</span>
                <span className="text-right w-20">Sistem</span>
                <span className="text-right w-24">Fisik (kg)</span>
              </div>
              {items.map((item) => {
                const entry = entries.find((e) => e.sku === item.sku)!;
                return (
                  <div key={item.sku} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center rounded-xl bg-secondary/40 px-3 py-3">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
                    </div>
                    <div className="text-right w-20 tabular-nums text-sm text-muted-foreground">
                      {item.stock} kg
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        value={entry.fisik}
                        onChange={(e) => setFisik(item.sku, e.target.value)}
                        placeholder="—"
                        className="h-8 text-sm rounded-lg text-right tabular-nums"
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {step === "review" && (
            <>
              {diffs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Tidak ada perubahan stok yang dimasukkan.
                </div>
              ) : (
                diffs.map(({ item, fisik, selisih }) => (
                  <div key={item.sku} className="rounded-xl border border-border/60 px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          selisih === 0
                            ? "text-emerald-700 border-emerald-500/30 bg-emerald-500/10"
                            : selisih < 0
                            ? "text-red-700 border-red-500/30 bg-red-500/10"
                            : "text-blue-700 border-blue-500/30 bg-blue-500/10"
                        }
                      >
                        {selisih > 0 ? "+" : ""}{selisih} kg
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-4">
                      <span>Sistem: <strong>{item.stock} kg</strong></span>
                      <span>Fisik: <strong>{fisik} kg</strong></span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="font-display text-lg font-semibold">Rekonsiliasi Berhasil</h3>
              <p className="text-sm text-muted-foreground">
                {diffs.length} item stok telah diperbarui sesuai hitungan fisik.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 shrink-0 pt-2">
          {step === "input" && (
            <>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>Batal</Button>
              <Button
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
                onClick={() => setStep("review")}
                disabled={changed.length === 0}
              >
                Tinjau Perubahan ({changed.length})
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep("input")}>Kembali</Button>
              <Button
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
                onClick={handleSave}
                disabled={diffs.length === 0}
              >
                Simpan Rekonsiliasi
              </Button>
            </>
          )}
          {step === "done" && (
            <Button className="flex-1 rounded-xl bg-primary text-primary-foreground" onClick={handleClose}>
              Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}