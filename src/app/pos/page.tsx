"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Coffee, Plus, Trash2, Search, CreditCard, Banknote,
  QrCode, Percent, X, CheckCircle2, ArrowLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = { id: string; name: string; variant: string; price: number; tag: string };
type PayMethod = "cash" | "card" | "qris";

// ─── Data ─────────────────────────────────────────────────────────────────────

const products: Product[] = [
  { id:"p1", name:"Gayo Wine Natural",      variant:"250g · Whole Bean", price:92000,  tag:"Arabica"  },
  { id:"p2", name:"Kintamani Honey",         variant:"250g · Ground",     price:78000,  tag:"Arabica"  },
  { id:"p3", name:"Toraja Sapan",            variant:"250g · Whole Bean", price:98000,  tag:"Arabica"  },
  { id:"p4", name:"Ethiopia Yirgacheffe",    variant:"200g · Whole Bean", price:124000, tag:"Arabica"  },
  { id:"p5", name:"Lampung Robusta AAA",     variant:"500g · Whole Bean", price:86000,  tag:"Robusta"  },
  { id:"p6", name:"Bengkulu Robusta Fine",   variant:"250g · Ground",     price:52000,  tag:"Robusta"  },
  { id:"p7", name:"Liberica Meranti",        variant:"250g · Whole Bean", price:64000,  tag:"Liberica" },
  { id:"p8", name:"Luwak Premium",           variant:"100g · Whole Bean", price:175000, tag:"Luwak"    },
  { id:"p9", name:"Java Preanger",           variant:"500g · Ground",     price:138000, tag:"Arabica"  },
];

const cats = ["Semua","Arabica","Robusta","Liberica","Luwak"];
const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

// Quick-nominal buttons for cash
const NOMINALS = [50000, 100000, 50000*3, 100000*2, 500000, 1000000];

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div className="w-full sm:max-w-md bg-card border border-border/60 rounded-t-3xl sm:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Payment: Tunai ───────────────────────────────────────────────────────────

function TunaiModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  const received = parseFloat(input.replace(/\D/g,"")) || 0;
  const change = received - total;
  const valid = received >= total;

  function addNominal(n: number) {
    setInput(String(received + n));
  }

  function handleProcess() {
    setDone(true);
    setTimeout(() => { onSuccess(); }, 1800);
  }

  if (done) return (
    <Modal onClose={onClose}>
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold">Pembayaran Berhasil</p>
          <p className="text-muted-foreground text-sm mt-1">Kembalian <span className="font-semibold text-foreground">{fmt(change)}</span></p>
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

      {/* Total */}
      <div className="mx-6 mb-4 bg-secondary/50 rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
        <p className="font-display text-3xl font-bold">{fmt(total)}</p>
      </div>

      {/* Uang diterima input */}
      <div className="px-6 mb-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Uang Diterima</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
          <Input
            className="h-14 pl-10 text-xl font-semibold rounded-xl bg-card border-border tabular-nums"
            type="number"
            placeholder="0"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Quick nominal */}
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

      {/* Kembalian */}
      <div className={`mx-6 mb-5 rounded-xl px-5 py-3 flex items-center justify-between transition-colors ${
        received === 0 ? "bg-secondary/30" :
        valid ? "bg-primary/8 border border-primary/20" :
                "bg-destructive/8 border border-destructive/20"
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

// ─── Payment: QRIS ────────────────────────────────────────────────────────────

function QRISModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const [status, setStatus] = useState<"waiting" | "done">("waiting");

  // Simulate payment confirmed after manual click
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

      {/* QR Code (SVG placeholder yang realistis) */}
      <div className="mx-6 mb-4 bg-white rounded-2xl p-5 flex flex-col items-center gap-3 border border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 rounded bg-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">QRIS</span>
        </div>
        {/* QR grid simulation */}
        <svg viewBox="0 0 200 200" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
          {/* Finder patterns */}
          <rect x="10" y="10" width="56" height="56" rx="4" fill="#111"/>
          <rect x="18" y="18" width="40" height="40" rx="2" fill="white"/>
          <rect x="26" y="26" width="24" height="24" rx="1" fill="#111"/>

          <rect x="134" y="10" width="56" height="56" rx="4" fill="#111"/>
          <rect x="142" y="18" width="40" height="40" rx="2" fill="white"/>
          <rect x="150" y="26" width="24" height="24" rx="1" fill="#111"/>

          <rect x="10" y="134" width="56" height="56" rx="4" fill="#111"/>
          <rect x="18" y="142" width="40" height="40" rx="2" fill="white"/>
          <rect x="26" y="150" width="24" height="24" rx="1" fill="#111"/>

          {/* Data modules (random-ish grid) */}
          {[
            [76,10],[84,10],[92,10],[100,10],[108,10],
            [76,18],[92,18],[108,18],[116,18],
            [76,26],[84,26],[100,26],[116,26],[124,26],
            [76,34],[92,34],[108,34],[124,34],
            [84,42],[92,42],[100,42],[108,42],[116,42],
            [76,50],[100,50],[124,50],
            [76,58],[84,58],[92,58],[108,58],[124,58],
            [10,76],[26,76],[42,76],[58,76],[76,76],[92,76],[108,76],[134,76],[150,76],[166,76],[182,76],
            [18,84],[34,84],[50,84],[84,84],[100,84],[116,84],[142,84],[158,84],[174,84],
            [10,92],[26,92],[58,92],[76,92],[92,92],[108,92],[124,92],[142,92],[166,92],[182,92],
            [18,100],[42,100],[58,100],[84,100],[116,100],[134,100],[150,100],[174,100],
            [10,108],[34,108],[50,108],[76,108],[100,108],[124,108],[142,108],[158,108],[182,108],
            [18,116],[26,116],[58,116],[84,116],[108,116],[134,116],[150,116],[166,116],[174,116],
            [134,84],[142,100],[158,92],[166,84],[174,100],[182,92],
            [134,108],[158,108],[166,116],[174,108],[182,116],
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

// ─── Payment: Kartu ───────────────────────────────────────────────────────────

function KartuModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
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

      {/* Total */}
      <div className="mx-6 mb-6 bg-secondary/50 rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
        <p className="font-display text-3xl font-bold">{fmt(total)}</p>
      </div>

      {/* EDC illustration */}
      <div className="mx-6 mb-6 flex flex-col items-center gap-3">
        <div className={`w-full rounded-2xl border-2 p-6 flex flex-col items-center gap-3 transition-all ${
          status === "processing"
            ? "border-primary bg-primary/5 animate-pulse"
            : "border-dashed border-border"
        }`}>
          <CreditCard className={`h-12 w-12 ${status === "processing" ? "text-primary" : "text-muted-foreground"}`} />
          <p className={`text-sm font-medium ${status === "processing" ? "text-primary" : "text-muted-foreground"}`}>
            {status === "processing" ? "Memproses pembayaran…" : "Tempelkan atau gesek kartu pada mesin EDC"}
          </p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Tap NFC
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Swipe
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Insert Chip
          </span>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [cart, setCart]           = useState<Record<string, number>>({ p1:1, p7:2 });
  const [cat, setCat]             = useState("Semua");
  const [search, setSearch]       = useState("");
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [discOpen, setDiscOpen]   = useState(false);
  const [discInput, setDiscInput] = useState("");
  const [discPct, setDiscPct]     = useState(0);
  const [payModal, setPayModal]   = useState<PayMethod | null>(null);

  const filtered = products.filter(p =>
    (cat === "Semua" || p.tag === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.variant.toLowerCase().includes(search.toLowerCase()))
  );

  const lines = Object.entries(cart).map(([id, qty]) => ({ p: products.find(x => x.id === id)!, qty }));
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const discAmt  = Math.round(subtotal * discPct / 100);
  const afterDisc = subtotal - discAmt;
  const tax      = Math.round(afterDisc * 0.11);
  const total    = afterDisc + tax;

  const addToCart = (id: string) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const del = (id: string) => setCart(c => { const { [id]:_, ...rest } = c; return rest; });

  const commitQty = (id: string) => {
    const value = parseFloat(editingQty[id] ?? String(cart[id]));
    if (!isNaN(value) && value > 0) setCart(c => ({ ...c, [id]: value }));
    else del(id);
    setEditingQty(prev => { const { [id]:_, ...rest } = prev; return rest; });
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
    setPayModal(null);
  };

  const payLabels: Record<PayMethod, string> = { cash:"Cash", card:"Kartu", qris:"QRIS" };

  return (
    <>
      <Topbar title="Kasir / Point of Sale" subtitle="Counter Senopati · Shift Pagi" />
      <main className="flex-1 grid lg:grid-cols-[1fr_420px] min-h-0">

        {/* Catalog */}
        <section className="p-6 space-y-5 overflow-y-auto">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Scan barcode atau cari produk…" className="h-11 pl-10 rounded-xl bg-card border-border"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 h-9 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-secondary"
                }`}>
                {c}
              </button>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">Produk tidak ditemukan.</div>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p.id)}
                className="group text-left rounded-2xl border border-border/60 bg-card p-4 hover:shadow-warm hover:border-accent/40 transition-all">
                <div className="aspect-square rounded-xl gradient-bean mb-3 flex items-center justify-center relative overflow-hidden">
                  <Coffee className="h-10 w-10 text-primary-foreground/90" />
                  <Badge className="absolute top-2 left-2 bg-primary-foreground/20 text-primary-foreground border-0 backdrop-blur text-[10px]">{p.tag}</Badge>
                  {cart[p.id] && (
                    <span className="absolute bottom-2 right-2 bg-primary-foreground/90 text-primary text-[10px] font-semibold rounded-full px-2 py-0.5">
                      {cart[p.id]} kg
                    </span>
                  )}
                </div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.variant}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-base font-semibold">{fmt(p.price)}/kg</span>
                  <span className="h-7 w-7 rounded-full gradient-crema flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cart */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] border-l border-border bg-card flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Order #2051</div>
            <h3 className="font-display text-xl font-semibold">Pesanan Aktif</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {lines.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">Belum ada produk. Pilih dari katalog untuk mulai.</div>
            )}
            {lines.map(({ p, qty }) => (
              <div key={p.id} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="h-12 w-12 rounded-lg gradient-bean flex items-center justify-center shrink-0">
                  <Coffee className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.variant}</div>
                    </div>
                    <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input className="h-8 w-20 text-center rounded-lg bg-card border-border" type="number" step="0.1" min="0.1"
                        value={editingQty[p.id] ?? String(qty)}
                        onChange={e => setEditingQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") { commitQty(p.id); e.currentTarget.blur(); } }}
                        onBlur={() => commitQty(p.id)} />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                    <span className="font-medium tabular-nums text-sm">{fmt(p.price * qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-5 space-y-4">
            <div>
              <button className="flex items-center gap-2 text-sm text-accent hover:underline" onClick={() => setDiscOpen(v => !v)}>
                <Percent className="h-4 w-4" />Tambah diskon / promo
              </button>
              {discOpen && (
                <div className="flex gap-2 mt-2">
                  <Input type="number" placeholder="% diskon" min={0} max={100} step={1}
                    value={discInput} onChange={e => setDiscInput(e.target.value)}
                    className="h-8 w-28 rounded-lg bg-card border-border text-sm" />
                  <Button size="sm" onClick={applyDisc}>Terapkan</Button>
                </div>
              )}
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
              {discAmt > 0 && <div className="flex justify-between text-green-600"><span>Diskon {discPct}%</span><span className="tabular-nums">−{fmt(discAmt)}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>PPN 11%</span><span className="tabular-nums">{fmt(tax)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-display text-xl font-semibold"><span>Total</span><span className="tabular-nums">{fmt(total)}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["cash","card","qris"] as PayMethod[]).map(m => (
                <Button key={m} variant={payMethod === m ? "default" : "outline"} className="h-12 flex-col gap-0.5 text-xs"
                  onClick={() => setPayMethod(m)}>
                  {m === "cash" && <Banknote className="h-4 w-4" />}
                  {m === "card" && <CreditCard className="h-4 w-4" />}
                  {m === "qris" && <QrCode className="h-4 w-4" />}
                  {payLabels[m]}
                </Button>
              ))}
            </div>
            <Button className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm"
              disabled={lines.length === 0 || !payMethod}
              onClick={() => payMethod && setPayModal(payMethod)}>
              {lines.length === 0
                ? "Pilih produk terlebih dahulu"
                : !payMethod
                ? "Pilih metode pembayaran"
                : `Proses Pembayaran · ${fmt(total)}`}
            </Button>
          </div>
        </aside>
      </main>

      {/* Payment modals */}
      {payModal === "cash" && <TunaiModal total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
      {payModal === "qris" && <QRISModal  total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
      {payModal === "card" && <KartuModal total={total} onSuccess={handlePaymentSuccess} onClose={() => setPayModal(null)} />}
    </>
  );
}