"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Download,
  MessageCircle,
  Mail,
  X,
  ClipboardList,
  Package,
  Calendar,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PO, Supplier } from "../page";
import { BTN_PRIMARY, BTN_OUTLINE, fmt, poTotal } from "./shared-components";
import { BTN_HOVER_COKLAT } from "../lib";
import { generatePOPdf, getPOPdfBlob } from "./po-pdf";

/* ─── Tone status PO ─── */
const statusTone = (s: PO["status"]) =>
  s === "Diterima"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : s === "Dikirim"
      ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
      : "bg-amber-500/10 text-amber-700 border-amber-500/20";

/* ─── Pesan WA default ─── */
function buildWAMessage(po: PO): string {
  const lines = [
    `Halo, berikut Purchase Order dari kami:`,
    ``,
    `*No. PO:* ${po.id}`,
    `*Tanggal:* ${po.date}`,
    `*Supplier:* ${po.supplierName}`,
    ``,
    `*Item Order:*`,
    ...po.items.map(
      (i) => `• ${i.bean} — ${i.qty} kg × ${fmt(i.pricePerKg)}`,
    ),
    ``,
    `*Total: ${fmt(poTotal(po))}*`,
    po.notes ? `\n_Catatan: ${po.notes}_` : "",
    ``,
    `Mohon konfirmasi penerimaan PO ini. Terima kasih`,
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

/* ─── Bersihkan nomor telp jadi format WA ─── */
function toWANumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}

/* ─── Komponen utama ─── */
export function POSuccessModal({
  po,
  supplier,
  onClose,
}: {
  po: PO;
  supplier?: Supplier;
  onClose: () => void;
}) {
  const [pdfReady, setPdfReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [shareStep, setShareStep] = useState<"idle" | "sharing">("idle");

  /* Generate blob PDF saat modal muncul */
  useEffect(() => {
    let cancelled = false;
    getPOPdfBlob(po)
      .then((blob) => {
        if (!cancelled) {
          setPdfBlob(blob);
          setPdfReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setPdfReady(true); // tetap tampil meski blob gagal
      });
    return () => {
      cancelled = true;
    };
  }, [po]);

  /* Download PDF */
  function handleDownload() {
    setDownloading(true);
    setTimeout(() => {
      generatePOPdf(po);
      setDownloading(false);
    }, 300);
  }

  /* Kirim via WA */
  function handleWA() {
    setShareStep("sharing");
    const msg = encodeURIComponent(buildWAMessage(po));
    const phone = supplier?.phone ? toWANumber(supplier.phone) : "";
    const url = phone
      ? `https://wa.me/${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    setTimeout(() => {
      window.open(url, "_blank");
      setShareStep("idle");
    }, 400);
  }

  /* Kirim via Email */
  function handleEmail() {
    setShareStep("sharing");
    const subject = encodeURIComponent(`Purchase Order ${po.id} – ${po.supplierName}`);
    const body = encodeURIComponent(
      buildWAMessage(po).replace(/\*/g, "").replace(/_/g, ""),
    );
    const to = supplier?.email ?? "";
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      window.location.href = url;
      setShareStep("idle");
    }, 400);
  }

  const total = poTotal(po);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header sukses ── */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/60 px-6 pt-8 pb-6 text-center border-b border-emerald-200/60">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Ikon animasi */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center animate-[ping_1s_ease-out_1]">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-display text-xl font-semibold text-foreground mb-1">
            Purchase Order Berhasil Dibuat!
          </h2>
          <p className="text-sm text-muted-foreground">
            PO telah tersimpan dan siap dikirim ke supplier.
          </p>

          {/* Badge no PO */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-20 text-xs font-mono font-medium text-emerald-700 ">
            <ClipboardList className="h-3 w-3" />
            {po.id}
          </div>
        </div>

        {/* ── Ringkasan PO ── */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Info baris */}
          <div className="grid grid-cols-2 gap-3">
            <InfoChip
              icon={User}
              label="Supplier"
              value={po.supplierName}
            />
            <InfoChip
              icon={Calendar}
              label="Tanggal PO"
              value={po.date}
            />
          </div>

          {/* Item list */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="bg-secondary/50 px-4 py-2 flex items-center gap-2 border-b border-border/40">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Item Order
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {po.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium">{item.bean}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="tabular-nums">{item.qty} kg</span>
                    <ChevronRight className="h-3 w-3 opacity-40" />
                    <span className="tabular-nums font-medium text-foreground">
                      {fmt(item.qty * item.pricePerKg)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-primary/15">
              <span className="text-sm font-semibold text-muted-foreground">Total Nilai PO</span>
              <span className="font-display text-base font-bold text-primary tabular-nums">
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge variant="outline" className={statusTone(po.status)}>
              {po.status}
            </Badge>
          </div>
        </div>

        {/* ── Aksi PDF + Footer (fixed di bawah) ── */}
        <div className="border-t border-border/40 px-6 pt-4 pb-5 space-y-3 bg-card shrink-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Unduh &amp; Kirim PO
          </p>
          {/* Download PDF */}
          <Button
            className={`w-full h-11 ${BTN_PRIMARY} relative`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloading ? "Menyiapkan PDF…" : "Unduh PDF Purchase Order"}
            {!pdfReady && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground/60" />
              </span>
            )}
          </Button>

          {/* Baris share */}
          <div className="grid grid-cols-2 gap-2">
            {/* WA */}
            <Button
              variant="outline"
              className={`h-11 gap-2 rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors text-sm font-medium ${shareStep === "sharing" ? "opacity-70 pointer-events-none" : ""}`}
              onClick={handleWA}
            >
              {shareStep === "sharing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Kirim via WA
              {supplier?.phone && (
                <span className="ml-auto text-[10px] opacity-60 font-mono truncate max-w-[60px]">
                  {supplier.phone.slice(-8)}
                </span>
              )}
            </Button>

            {/* Email */}
            <Button
              variant="outline"
              className={`h-11 gap-2 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm font-medium ${shareStep === "sharing" ? "opacity-70 pointer-events-none" : ""}`}
              onClick={handleEmail}
            >
              <Mail className="h-4 w-4" />
              Kirim via Email
              {supplier?.email && (
                <span className="ml-auto text-[10px] opacity-60 truncate max-w-[70px]">
                  {supplier.email.split("@")[0]}
                </span>
              )}
            </Button>
          </div>

          {supplier && (
            <p className="text-center text-[11px] text-muted-foreground">
              Tujuan:{" "}
              <span className="font-medium text-foreground">{supplier.name}</span>
              {supplier.email && (
                <> &middot; <span className="font-mono">{supplier.email}</span></>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Info chip kecil ─── */
function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-secondary/50 px-3 py-2.5">
      <div className="h-7 w-7 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}