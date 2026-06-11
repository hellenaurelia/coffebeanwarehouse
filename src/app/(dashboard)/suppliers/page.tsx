"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Phone, Mail, Truck, PackageCheck, Users, X, ClipboardList, Pencil, Trash2 } from "lucide-react";

import { BTN_OUTLINE, BTN_PRIMARY, PORows } from "./_components/shared-components";
import { SupplierModal } from "./_components/supplier-modal";
import { DeleteModal } from "./_components/delete-modal";
import { DetailModal } from "./_components/detail-supplier-modal";
import { BuatPOModal } from "./_components/make-po-modal";
import { PODetailModal } from "./_components/detail-historypo-modal";

export type SupplierStatus = "Aktif" | "Pending" | "Non-aktif";
export type POStatus       = "Dikirim" | "Diterima" | "Pending";

// Tipe Baru untuk item Biji Kopi di level Supplier beserta harganya
export type SupplierBean = { name: string; price: number };

export type Supplier = {
  id: string; name: string; pic: string; region: string;
  phone: string; email: string; beans: SupplierBean[]; // Diubah dari string[]
  lastDelivery: string; totalKg: number; status: SupplierStatus;
  address?: string; notes?: string;
};

export type PO = {
  id: string; supplierId: string; supplierName: string; date: string;
  items: { bean: string; qty: number; pricePerKg: number }[];
  status: POStatus; estimatedArrival: string; notes?: string;
};

type ModalState =
  | { type: "none" }
  | { type: "supplier"; supplier?: Supplier }
  | { type: "detail";   supplier: Supplier }
  | { type: "hapus";    supplier: Supplier }
  | { type: "po";       supplier?: Supplier }
  | { type: "po-detail"; po: PO };

// Seed data supplier sekarang langsung membawa master data harga kopi
const initSuppliers: Supplier[] = [
  { id:"S-001", name:"Koperasi Tani Gayo",    pic:"Pak Munir",  region:"Aceh Tengah",    phone:"+62 812-3344-5566", email:"munir@gayotani.id",  beans:[{name:"Arabica", price:95000},{name:"Gayo Wine", price:180000}],       lastDelivery:"2 hari lalu",  totalKg:1840, status:"Aktif",    address:"Jl. Raya Bebesen No.12, Aceh Tengah",         notes:"Supplier utama arabica premium. Min order 100kg." },
  { id:"S-002", name:"Kintamani Highland",    pic:"Bu Wayan",    region:"Bangli, Bali",   phone:"+62 821-7788-9900", email:"wayan@kintamani.co", beans:[{name:"Arabica Honey", price:120000}],             lastDelivery:"5 hari lalu",  totalKg:1240, status:"Aktif",    address:"Desa Batur, Kintamani, Bangli",               notes:"Musim panen April–Juni. Kualitas konsisten." },
  { id:"S-003", name:"Toraja Coffee Hub",     pic:"Pak Reynaldi",region:"Tana Toraja",    phone:"+62 813-2211-0099", email:"rey@torajacoffee.id",beans:[{name:"Arabica Sapan", price:110000}],             lastDelivery:"1 minggu lalu", totalKg:980,  status:"Aktif",    address:"Jl. Pongtiku 45, Rantepao, Tana Toraja" },
  { id:"S-004", name:"Lampung Robusta Mills", pic:"Pak Hendra",  region:"Lampung Barat",  phone:"+62 822-5544-3322", email:"hendra@lrm.id",      beans:[{name:"Robusta AAA", price:48000},{name:"Robusta Honey", price:52000}],lastDelivery:"3 hari lalu",  totalKg:3120, status:"Aktif",    address:"Kawasan Industri Way Laga, Lampung Barat",    notes:"Lead time 3 hari kerja. Harga negotiable untuk >500kg." },
  { id:"S-005", name:"Civet Farm Lampung",    pic:"Pak Jaka",    region:"Liwa, Lampung",  phone:"+62 815-9988-7766", email:"jaka@civetfarm.id",  beans:[{name:"Luwak Premium", price:850000}],             lastDelivery:"2 minggu lalu", totalKg:64,   status:"Aktif",    address:"Desa Sukaraja, Liwa, Lampung Barat",          notes:"Produksi terbatas 5–10kg/minggu." },
  { id:"S-006", name:"Preanger Estate",       pic:"Bu Salma",    region:"Garut, Jawa Barat",phone:"+62 819-1122-3344",email:"salma@preanger.id", beans:[{name:"Arabica Java", price:105000}],              lastDelivery:"10 hari lalu",  totalKg:1520, status:"Pending",  address:"Perkebunan Cikajang, Garut",                  notes:"Menunggu verifikasi dokumen BPOM." },
  { id:"S-007", name:"Riau Liberica Co",      pic:"Pak Daud",    region:"Meranti, Riau",  phone:"+62 811-2233-4455", email:"daud@liberica.id",   beans:[{name:"Liberica", price:65000}],                  lastDelivery:"3 minggu lalu", totalKg:280,  status:"Non-aktif",address:"Jl. Merbau No.7, Selat Panjang, Riau" },
];

const initPOs: PO[] = [
  { id:"PO-0041", supplierId:"S-001", supplierName:"Koperasi Tani Gayo",    date:"7 Mei 2026",  items:[{bean:"Arabica",qty:200,pricePerKg:95000},{bean:"Gayo Wine",qty:50,pricePerKg:180000}], status:"Dikirim",  estimatedArrival:"12 Mei 2026" },
  { id:"PO-0040", supplierId:"S-004", supplierName:"Lampung Robusta Mills", date:"6 Mei 2026",  items:[{bean:"Robusta AAA",qty:300,pricePerKg:48000}],                                        status:"Diterima", estimatedArrival:"9 Mei 2026",  notes:"Kualitas sesuai spesifikasi." },
  { id:"PO-0039", supplierId:"S-002", supplierName:"Kintamani Highland",    date:"1 Mei 2026",  items:[{bean:"Arabica Honey",qty:150,pricePerKg:120000}],                                       status:"Diterima", estimatedArrival:"6 Mei 2026" },
  { id:"PO-0038", supplierId:"S-003", supplierName:"Toraja Coffee Hub",     date:"28 Apr 2026", items:[{bean:"Arabica Sapan",qty:100,pricePerKg:110000}],                                       status:"Diterima", estimatedArrival:"3 Mei 2026" },
  { id:"PO-0037", supplierId:"S-005", supplierName:"Civet Farm Lampung",    date:"25 Apr 2026", items:[{bean:"Luwak Premium",qty:10,pricePerKg:850000}],                                        status:"Diterima", estimatedArrival:"30 Apr 2026" },
  { id:"PO-0036", supplierId:"S-006", supplierName:"Preanger Estate",       date:"20 Apr 2026", items:[{bean:"Arabica Java",qty:200,pricePerKg:105000}],                                        status:"Pending",  estimatedArrival:"TBD",         notes:"Menunggu konfirmasi jadwal pengiriman." },
];

const fmtKg = (n: number) => n.toLocaleString("id-ID") + " kg";
const initials = (name: string) => name.split(" ").map(w => w[0]).slice(0, 2).join("");
const nextId = (list: { id: string }[], prefix: string, pad: number) => {
  const nums = list.map(x => parseInt(x.id.replace(prefix, ""))).filter(n => !isNaN(n));
  return `${prefix}${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(pad, "0")}`;
};

const statusTone = (s: SupplierStatus) =>
  s === "Aktif"   ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
  s === "Pending" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                    "bg-muted text-muted-foreground border-border";

const BTN_HOVER_COKLAT = "border border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors";
const BTN_ICON_DEL = "h-8 w-8 p-0 rounded-lg border border-border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors";
const BTN_ICON_EDT = `h-8 w-8 p-0 rounded-lg ${BTN_HOVER_COKLAT}`;

function POTable({ pos, onDetail }: { pos: PO[], onDetail: (po: PO) => void }) {
  return (
    <Card className="shadow-soft border-border/60">
      <CardContent className="p-5">
        <h2 className="font-display text-base font-semibold mb-4">Riwayat Purchase Order</h2>
        <div className="rounded-xl overflow-hidden border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs text-muted-foreground">
                {["ID PO","Supplier","Tanggal","Est. Tiba","Total","Status","Aksi"].map((h, i) => (
                  <th key={h} className={`font-medium px-4 py-2.5 ${i===4?"text-right":i===5||i===6?"text-center":"text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody><PORows pos={pos} showSupplier onDetail={onDetail} /></tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initSuppliers);
  const [pos, setPOs]             = useState<PO[]>(initPOs);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });
  const [search, setSearch]       = useState("");
  const close = () => setModal({ type: "none" });

  // Menyesuaikan pencarian array objek beans
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? suppliers.filter(s => [s.name, s.region, s.pic, ...s.beans.map(b => b.name)].some(v => v.toLowerCase().includes(q))) : suppliers;
  }, [suppliers, search]);

  const handleSaveSupplier = (data: Omit<Supplier, "id"> & { id?: string }) => {
    setSuppliers(p => data.id ? p.map(s => s.id === data.id ? data as Supplier : s) : [...p, { ...data, id: nextId(suppliers, "S-", 3) } as Supplier]);
    close();
  };
  const handleDeleteSupplier = (id: string) => { setSuppliers(p => p.filter(s => s.id !== id)); close(); };
  const handleSavePO = (partial: Omit<PO, "id">) => { setPOs(p => [{ ...partial, id: nextId(pos, "PO-", 4) }, ...p]); close(); };

  const stats = [
    { label:"Total Supplier",   value:`${suppliers.length}`,                               sub:`${suppliers.filter(s=>s.status==="Aktif").length} aktif`,   icon:Users },
    { label:"Total Pasokan",    value:fmtKg(suppliers.reduce((a,s)=>a+s.totalKg,0)),       sub:"Semua supplier",                                              icon:PackageCheck },
    { label:"Pengiriman Aktif", value:`${pos.filter(p=>p.status==="Dikirim").length}`,      sub:"Sedang dalam perjalanan",                                     icon:Truck },
  ];

  return (
    <>
      <Topbar title="Supplier" subtitle="Mitra petani & koperasi penyuplai biji kopi" />
      <main className="flex-1 p-6 space-y-6">

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(s => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari supplier, region, atau jenis biji…" className="h-10 pl-10 rounded-xl bg-secondary/50" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={`h-10 ${BTN_OUTLINE}`} onClick={() => setModal({ type:"po" })}><ClipboardList className="h-4 w-4 mr-2" />Buat PO</Button>
            <Button className={`h-10 ${BTN_PRIMARY}`} onClick={() => setModal({ type:"supplier" })}><Plus className="h-4 w-4 mr-2" />Tambah Supplier</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Tidak ada supplier yang cocok dengan pencarian.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(s => (
              <Card key={s.id} className="border-border/60 hover:shadow-warm transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl gradient-crema flex items-center justify-center shrink-0 shadow-warm"><span className="font-display text-base font-semibold text-primary-foreground">{initials(s.name)}</span></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0"><h3 className="font-display text-base font-semibold truncate">{s.name}</h3><div className="text-xs text-muted-foreground">{s.id} · {s.pic}</div></div>
                        <Badge variant="outline" className={statusTone(s.status)}>{s.status}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* UPDATE: Akses b.name karena b sudah berbentuk objek */}
                  <div className="flex flex-wrap gap-1">{s.beans.map(b => <Badge key={b.name} variant="outline" className="text-[10px] bg-secondary/60">{b.name}</Badge>)}</div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{s.region}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{s.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{s.email}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <div><div className="text-muted-foreground">Total pasokan</div><div className="font-medium tabular-nums text-foreground text-sm">{fmtKg(s.totalKg)}</div></div>
                    <div><div className="text-muted-foreground">Pengiriman</div><div className="font-medium text-foreground text-sm">{s.lastDelivery}</div></div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className={BTN_ICON_DEL} onClick={() => setModal({ type:"hapus", supplier:s })} title="Hapus"><Trash2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" className={BTN_ICON_EDT} onClick={() => setModal({ type:"supplier", supplier:s })} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" className={`flex-1 h-8 text-xs rounded-lg ${BTN_HOVER_COKLAT}`} onClick={() => setModal({ type:"detail", supplier:s })}>Detail</Button>
                    <Button size="sm" className={`flex-1 ${BTN_PRIMARY} h-8 text-xs`} onClick={() => setModal({ type:"po", supplier:s })}>Buat PO</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <POTable pos={pos} onDetail={(po) => setModal({ type: "po-detail", po })} />
      </main>

      {modal.type === "supplier"  && <SupplierModal supplier={modal.supplier} onClose={close} onSave={handleSaveSupplier} />}
      {modal.type === "hapus"     && <DeleteModal supplier={modal.supplier} poCount={pos.filter(p=>p.supplierId===modal.supplier.id).length} onClose={close} onConfirm={() => handleDeleteSupplier(modal.supplier.id)} />}
      {modal.type === "detail"    && <DetailModal supplier={modal.supplier} pos={pos} onClose={close} onBuatPO={s=>setModal({type:"po",supplier:s})} onEdit={s=>setModal({type:"supplier",supplier:s})} onHapus={s=>setModal({type:"hapus",supplier:s})} onOpenPODetail={po => setModal({ type: "po-detail", po })} />}
      {modal.type === "po"        && <BuatPOModal suppliers={suppliers} defaultSupplier={modal.supplier} onClose={close} onSave={handleSavePO} />}
      {modal.type === "po-detail" && <PODetailModal po={modal.po} onClose={close} />}
    </>
  );
}