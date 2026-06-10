"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Receipt, Banknote, CreditCard, QrCode, ArrowUpRight, Calendar, Eye, X, Printer, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Method = "Cash" | "Kartu" | "QRIS";
type TrxItem = { name: string; qty: number; price: number };
type Trx = { id: string; date: string; time: string; cashier: string; items: number; total: number; method: Method; detail: TrxItem[] };
type DR = { from: Date | null; to: Date | null };

const data: Trx[] = [
  { id:"TRX-2050", date:"9 Mei 2026",  time:"10:42", cashier:"Arif R.", items:3, total:414000, method:"QRIS",  detail:[{name:"Cappuccino",qty:2,price:43243},{name:"Croissant Butter",qty:1,price:34234},{name:"Cold Brew 500ml",qty:2,price:130631}] },
  { id:"TRX-2049", date:"9 Mei 2026",  time:"10:31", cashier:"Sari N.", items:2, total:184000, method:"QRIS",  detail:[{name:"Latte",qty:2,price:82883},{name:"Banana Bread",qty:1,price:32432}] },
  { id:"TRX-2048", date:"9 Mei 2026",  time:"10:18", cashier:"Arif R.", items:1, total:240000, method:"Cash",  detail:[{name:"Pour Over (Single Origin)",qty:2,price:108108}] },
  { id:"TRX-2047", date:"9 Mei 2026",  time:"09:54", cashier:"Bayu P.", items:2, total:198000, method:"Kartu", detail:[{name:"Flat White",qty:1,price:46847},{name:"Avocado Toast",qty:1,price:68468},{name:"Sparkling Water",qty:1,price:25225}] },
  { id:"TRX-2046", date:"9 Mei 2026",  time:"09:33", cashier:"Sari N.", items:1, total:92000,  method:"QRIS",  detail:[{name:"Latte",qty:2,price:41441}] },
  { id:"TRX-2045", date:"9 Mei 2026",  time:"09:11", cashier:"Arif R.", items:4, total:528000, method:"Cash",  detail:[{name:"Americano",qty:2,price:35135},{name:"Espresso Tonic",qty:2,price:49550},{name:"Overnight Oats",qty:2,price:76577},{name:"Mineral Water",qty:2,price:16216}] },
  { id:"TRX-2044", date:"8 Mei 2026",  time:"20:48", cashier:"Bayu P.", items:2, total:312000, method:"Kartu", detail:[{name:"Cold Brew 500ml",qty:2,price:130631},{name:"Almond Croissant",qty:1,price:37838}] },
  { id:"TRX-2043", date:"8 Mei 2026",  time:"20:22", cashier:"Sari N.", items:1, total:124000, method:"QRIS",  detail:[{name:"Cappuccino",qty:1,price:43243},{name:"Kouign-Amann",qty:1,price:41441}] },
  { id:"TRX-2042", date:"8 Mei 2026",  time:"19:57", cashier:"Arif R.", items:3, total:376000, method:"Cash",  detail:[{name:"Pour Over (Single Origin)",qty:1,price:108108},{name:"Latte",qty:1,price:41441},{name:"Smashed Avocado",qty:1,price:79280}] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAX = 0.11;
const methodIcon: Record<Method, React.ElementType> = { Cash: Banknote, Kartu: CreditCard, QRIS: QrCode };
const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

const ID_MONTHS: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Agu:7,Sep:8,Okt:9,Nov:10,Des:11 };
const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAY_NAMES = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

const parseDate = (s: string) => { const [d,m,y] = s.split(" "); return new Date(+y, ID_MONTHS[m], +d); };
const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function exportCSV(rows: Trx[]) {
  const lines = ["ID,Tanggal,Waktu,Kasir,Item,Total,Metode", ...rows.map(t => [t.id,t.date,t.time,t.cashier,t.items,t.total,t.method].join(","))];
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([lines.join("\n")], { type:"text/csv" })), download:"transaksi.csv" });
  a.click();
}

// ─── Custom calendar ──────────────────────────────────────────────────────────

function CalendarPicker({ range, onChange, onClose }: { range: DR; onChange: (r: DR) => void; onClose: () => void }) {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [hov, setHov] = useState<Date | null>(null);

  const prevMo = () => mo === 0 ? (setMo(11), setYr(y => y-1)) : setMo(m => m-1);
  const nextMo = () => mo === 11 ? (setMo(0), setYr(y => y+1)) : setMo(m => m+1);

  const firstDow = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo+1, 0).getDate();
  const cells: (Date|null)[] = [...Array(firstDow).fill(null), ...Array.from({length:daysInMo},(_,i)=>new Date(yr,mo,i+1))];

  function pick(d: Date) {
    const day = sod(d);
    if (!range.from || (range.from && range.to)) { onChange({ from: day, to: null }); return; }
    if (day < range.from) onChange({ from: day, to: range.from });
    else onChange({ from: range.from, to: day });
  }

  function inRange(d: Date) {
    const f = range.from, t = range.to ?? hov;
    if (!f || !t) return false;
    const lo = f<t?f:t, hi = f<t?t:f;
    return d > lo && d < hi;
  }

  return (
    <div className="p-1 w-72 select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={prevMo} className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{MONTH_NAMES[mo]} {yr}</span>
        <button onClick={nextMo} className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = !!(range.from && sameDay(d, range.from));
          const isEnd   = !!(range.to   && sameDay(d, range.to));
          const isMid   = inRange(d);
          const active  = isStart || isEnd;
          return (
            <button
              key={i}
              onClick={() => pick(d)}
              onMouseEnter={() => setHov(range.from && !range.to ? sod(d) : null)}
              onMouseLeave={() => setHov(null)}
              className={[
                "h-8 text-xs flex items-center justify-center relative transition-colors",
                isMid ? "bg-primary/10" : "",
                isStart && !isEnd ? "rounded-l-full" : "",
                isEnd && !isStart ? "rounded-r-full" : "",
                isStart && isEnd  ? "rounded-full" : "",
                active ? "" : "hover:bg-secondary rounded-full",
              ].join(" ")}
            >
              <span className={[
                "h-7 w-7 flex items-center justify-center rounded-full z-10 relative",
                active ? "bg-primary text-primary-foreground font-semibold" : "",
              ].join(" ")}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => onChange({from:null,to:null})}>Reset</button>
        <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg" onClick={onClose}>Terapkan</button>
      </div>
    </div>
  );
}

function DateFilter({ range, onChange }: { range: DR; onChange: (r: DR) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fmt2 = (d: Date) => d.toLocaleDateString("id-ID", { day:"numeric", month:"short" });
  const label = range.from
    ? range.to ? `${fmt2(range.from)} – ${fmt2(range.to)}` : fmt2(range.from)
    : "Tanggal";

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" className={`rounded-xl gap-2 ${range.from ? "border-primary text-primary" : ""}`} onClick={() => setOpen(p => !p)}>
        <Calendar className="h-4 w-4" />
        <span className="text-sm max-w-[160px] truncate">{label}</span>
        {range.from && (
          <span role="button" onClick={e => { e.stopPropagation(); onChange({from:null,to:null}); setOpen(false); }} className="ml-1 flex items-center">
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 z-30 bg-card border border-border/60 rounded-2xl shadow-xl p-3">
          <CalendarPicker range={range} onChange={onChange} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({ trx, onClose }: { trx: Trx; onClose: () => void }) {
  const Icon = methodIcon[trx.method];
  const subtotal = trx.detail.reduce((a, i) => a + i.qty * i.price, 0);
  const tax = subtotal * TAX;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Detail Transaksi</p>
            <h2 className="font-mono text-lg font-semibold">{trx.id}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{trx.date} · {trx.time} · {trx.cashier}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
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
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.qty}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mx-6 mb-5 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Pajak (11%)</span><span className="tabular-nums">{fmt(tax)}</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-border/60 pt-2"><span>Total</span><span className="tabular-nums">{fmt(trx.total)}</span></div>
        </div>
        <div className="px-6 mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" /><span>Dibayar via {trx.method}</span>
        </div>
        <div className="border-t border-border/60 px-6 py-4">
          <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />Cetak Struk
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const COLS = ["ID Transaksi","Tanggal","Kasir","Item","Total","Metode",""];

export default function TransactionsPage() {
  const [method, setMethod] = useState<"Semua" | Method>("Semua");
  const [range, setRange] = useState<DR>({ from: null, to: null });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Trx | null>(null);

  const rows = useMemo(() => data.filter(t => {
    if (method !== "Semua" && t.method !== method) return false;
    if (range.from) {
      const d = sod(parseDate(t.date));
      const to = range.to ?? range.from;
      if (d < range.from || d > to) return false;
    }
    if (search) { const q = search.toLowerCase(); if (!t.id.toLowerCase().includes(q) && !t.cashier.toLowerCase().includes(q)) return false; }
    return true;
  }), [method, range, search]);

  const todayData = data.filter(t => t.date === "9 Mei 2026");
  const stats = [
    { label:"Penjualan Hari Ini", value: fmt(todayData.reduce((a,b) => a+b.total,0)), sub:`${todayData.length} transaksi`, icon: Receipt },
    { label:"Rata-rata Basket",   value:"Rp 226.000", sub:"+8% vs minggu lalu", icon: ArrowUpRight },
    { label:"Metode Terpopuler",  value:"QRIS",        sub:"44% transaksi",     icon: QrCode },
  ];

  return (
    <>
      <Topbar title="Transaksi" subtitle="Riwayat penjualan & rekonsiliasi kasir" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(s => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center"><s.icon className="h-4 w-4 text-primary" /></div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari ID transaksi atau kasir…" className="h-10 pl-10 rounded-xl bg-secondary/50" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {(["Semua","Cash","Kartu","QRIS"] as const).map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`h-9 px-4 rounded-full text-sm border transition-colors ${method === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
                    {m}
                  </button>
                ))}
                <DateFilter range={range} onChange={setRange} />
                <Button variant="outline" className="rounded-xl" onClick={() => exportCSV(rows)}>
                  <Download className="h-4 w-4 mr-2" />Ekspor
                </Button>
              </div>
            </div>

            <div className="mt-5 -mx-2" style={{ height:420, overflowY:"auto" }}>
              <table className="w-full text-sm" style={{ tableLayout:"fixed", minWidth:600 }}>
                <colgroup>
                  <col style={{width:110}}/><col style={{width:120}}/><col style={{width:90}}/>
                  <col style={{width:52}}/><col style={{width:120}}/><col style={{width:88}}/>
                  <col style={{width:80}}/>
                </colgroup>
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                    {COLS.map((h,i) => <th key={i} className={`font-medium px-3 py-3 ${h==="Item"||h==="Total"?"text-right":"text-left"}`}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0
                    ? <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">Tidak ada transaksi yang cocok.</td></tr>
                    : rows.map(t => {
                        const Icon = methodIcon[t.method];
                        return (
                          <tr key={t.id} className="border-t border-border/60 hover:bg-secondary/40 transition-colors">
                            <td className="px-3 py-4 font-mono text-xs">{t.id}</td>
                            <td className="px-3 py-4"><div>{t.date}</div><div className="text-xs text-muted-foreground">{t.time}</div></td>
                            <td className="px-3 py-4">{t.cashier}</td>
                            <td className="px-3 py-4 text-right tabular-nums">{t.items}</td>
                            <td className="px-3 py-4 text-right tabular-nums font-medium">{fmt(t.total)}</td>
                            <td className="px-3 py-4"><span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" />{t.method}</span></td>
                            <td className="px-3 py-4 text-right">
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={() => setSelected(t)}>
                                <Eye className="h-4 w-4 mr-1" />Detail
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-3 px-1">Menampilkan {rows.length} dari {data.length} transaksi</p>
          </CardContent>
        </Card>
      </main>

      {selected && <DetailModal trx={selected} onClose={() => setSelected(null)} />}
    </>
  );
}