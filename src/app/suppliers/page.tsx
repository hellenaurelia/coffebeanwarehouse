"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, MapPin, Phone, Mail, Truck, PackageCheck,
  Users, X, ClipboardList, CheckCircle2, Clock, Pencil, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SupplierStatus = "Aktif" | "Pending" | "Non-aktif";
type POStatus       = "Dikirim" | "Diterima" | "Pending";

type Supplier = {
  id: string; name: string; pic: string; region: string;
  phone: string; email: string; beans: string[];
  lastDelivery: string; totalKg: number; status: SupplierStatus;
  address?: string; notes?: string;
};

type PO = {
  id: string; supplierId: string; supplierName: string; date: string;
  items: { bean: string; qty: number; pricePerKg: number }[];
  status: POStatus; estimatedArrival: string; notes?: string;
};

type ModalState =
  | { type: "none" }
  | { type: "supplier"; supplier?: Supplier }
  | { type: "detail";   supplier: Supplier }
  | { type: "hapus";    supplier: Supplier }
  | { type: "po";       supplier?: Supplier };

// ─── Seed Data ────────────────────────────────────────────────────────────────

const initSuppliers: Supplier[] = [
  { id:"S-001", name:"Koperasi Tani Gayo",    pic:"Pak Munir",   region:"Aceh Tengah",    phone:"+62 812-3344-5566", email:"munir@gayotani.id",  beans:["Arabica","Gayo Wine"],       lastDelivery:"2 hari lalu",   totalKg:1840, status:"Aktif",    address:"Jl. Raya Bebesen No.12, Aceh Tengah",         notes:"Supplier utama arabica premium. Min order 100kg." },
  { id:"S-002", name:"Kintamani Highland",    pic:"Bu Wayan",    region:"Bangli, Bali",   phone:"+62 821-7788-9900", email:"wayan@kintamani.co", beans:["Arabica Honey"],             lastDelivery:"5 hari lalu",   totalKg:1240, status:"Aktif",    address:"Desa Batur, Kintamani, Bangli",               notes:"Musim panen April–Juni. Kualitas konsisten." },
  { id:"S-003", name:"Toraja Coffee Hub",     pic:"Pak Reynaldi",region:"Tana Toraja",    phone:"+62 813-2211-0099", email:"rey@torajacoffee.id",beans:["Arabica Sapan"],             lastDelivery:"1 minggu lalu", totalKg:980,  status:"Aktif",    address:"Jl. Pongtiku 45, Rantepao, Tana Toraja" },
  { id:"S-004", name:"Lampung Robusta Mills", pic:"Pak Hendra",  region:"Lampung Barat",  phone:"+62 822-5544-3322", email:"hendra@lrm.id",      beans:["Robusta AAA","Robusta Honey"],lastDelivery:"3 hari lalu",   totalKg:3120, status:"Aktif",    address:"Kawasan Industri Way Laga, Lampung Barat",    notes:"Lead time 3 hari kerja. Harga negotiable untuk >500kg." },
  { id:"S-005", name:"Civet Farm Lampung",    pic:"Pak Jaka",    region:"Liwa, Lampung",  phone:"+62 815-9988-7766", email:"jaka@civetfarm.id",  beans:["Luwak Premium"],             lastDelivery:"2 minggu lalu", totalKg:64,   status:"Aktif",    address:"Desa Sukaraja, Liwa, Lampung Barat",          notes:"Produksi terbatas 5–10kg/minggu." },
  { id:"S-006", name:"Preanger Estate",       pic:"Bu Salma",    region:"Garut, Jawa Barat",phone:"+62 819-1122-3344",email:"salma@preanger.id", beans:["Arabica Java"],              lastDelivery:"10 hari lalu",  totalKg:1520, status:"Pending",  address:"Perkebunan Cikajang, Garut",                  notes:"Menunggu verifikasi dokumen BPOM." },
  { id:"S-007", name:"Riau Liberica Co",      pic:"Pak Daud",    region:"Meranti, Riau",  phone:"+62 811-2233-4455", email:"daud@liberica.id",   beans:["Liberica"],                  lastDelivery:"3 minggu lalu", totalKg:280,  status:"Non-aktif",address:"Jl. Merbau No.7, Selat Panjang, Riau" },
];

const initPOs: PO[] = [
  { id:"PO-0041", supplierId:"S-001", supplierName:"Koperasi Tani Gayo",    date:"7 Mei 2026",  items:[{bean:"Arabica",qty:200,pricePerKg:95000},{bean:"Gayo Wine",qty:50,pricePerKg:180000}], status:"Dikirim",  estimatedArrival:"12 Mei 2026" },
  { id:"PO-0040", supplierId:"S-004", supplierName:"Lampung Robusta Mills", date:"6 Mei 2026",  items:[{bean:"Robusta AAA",qty:300,pricePerKg:48000}],                                          status:"Diterima", estimatedArrival:"9 Mei 2026",  notes:"Kualitas sesuai spesifikasi." },
  { id:"PO-0039", supplierId:"S-002", supplierName:"Kintamani Highland",    date:"1 Mei 2026",  items:[{bean:"Arabica Honey",qty:150,pricePerKg:120000}],                                       status:"Diterima", estimatedArrival:"6 Mei 2026" },
  { id:"PO-0038", supplierId:"S-003", supplierName:"Toraja Coffee Hub",     date:"28 Apr 2026", items:[{bean:"Arabica Sapan",qty:100,pricePerKg:110000}],                                       status:"Diterima", estimatedArrival:"3 Mei 2026" },
  { id:"PO-0037", supplierId:"S-005", supplierName:"Civet Farm Lampung",    date:"25 Apr 2026", items:[{bean:"Luwak Premium",qty:10,pricePerKg:850000}],                                        status:"Diterima", estimatedArrival:"30 Apr 2026" },
  { id:"PO-0036", supplierId:"S-006", supplierName:"Preanger Estate",       date:"20 Apr 2026", items:[{bean:"Arabica Java",qty:200,pricePerKg:105000}],                                        status:"Pending",  estimatedArrival:"TBD",         notes:"Menunggu konfirmasi jadwal pengiriman." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt      = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtKg    = (n: number) => n.toLocaleString("id-ID") + " kg";
const initials = (name: string) => name.split(" ").map(w => w[0]).slice(0, 2).join("");
const poTotal  = (po: PO) => po.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0);

const nextId = (list: { id: string }[], prefix: string, pad: number) => {
  const nums = list.map(x => parseInt(x.id.replace(prefix, ""))).filter(n => !isNaN(n));
  return `${prefix}${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(pad, "0")}`;
};

const statusTone = (s: SupplierStatus) =>
  s === "Aktif"   ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
  s === "Pending" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                    "bg-muted text-muted-foreground border-border";

const poStatusTone = (s: POStatus) =>
  s === "Diterima" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
  s === "Dikirim"  ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                     "bg-amber-500/10 text-amber-700 border-amber-500/20";

const poStatusIcon = (s: POStatus) =>
  s === "Diterima" ? CheckCircle2 : s === "Dikirim" ? Truck : Clock;

// ─── Style constants ──────────────────────────────────────────────────────────

const INP          = "h-10 rounded-xl bg-secondary/50 text-sm";
const TA           = "w-full rounded-xl bg-secondary/50 border border-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring";
const DATE_CLS     = `${INP} relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50`;
const BTN_PRIMARY  = "rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 transition-colors";
const BTN_OUTLINE  = "rounded-xl border border-border hover:bg-secondary/80 transition-colors";
const BTN_ICON_DEL = "h-8 w-8 p-0 rounded-lg border border-border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/40 dark:hover:border-red-800 dark:hover:text-red-400";
const BTN_ICON_EDT = "h-8 w-8 p-0 rounded-lg border border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors";

// ─── NumericInput ─────────────────────────────────────────────────────────────

function NumericInput({ className, placeholder, value, onChange }: {
  className?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Input className={className} placeholder={placeholder} inputMode="numeric"
      type="text" pattern="[0-9]*" value={value}
      onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ""))} />
  );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Modal({ onClose, children, wide = false }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-card border border-border/60 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between p-6 pb-4 border-b border-border/60">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors shrink-0 ml-3">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, confirmLabel, icon: Icon }: {
  onClose: () => void; onConfirm: () => void; confirmLabel: string; icon?: React.ElementType;
}) {
  return (
    <div className="border-t border-border/60 px-6 py-4 flex gap-2 justify-end">
      <Button variant="outline" className={BTN_OUTLINE} onClick={onClose}>Batal</Button>
      <Button className={BTN_PRIMARY} onClick={onConfirm}>
        {Icon && <Icon className="h-4 w-4 mr-2" />}{confirmLabel}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const ErrMsg = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

// ─── PORows — reusable untuk tabel PO di dua tempat ──────────────────────────

function PORows({ pos, showSupplier = false }: { pos: PO[]; showSupplier?: boolean }) {
  if (pos.length === 0) {
    const cols = showSupplier ? 6 : 4;
    return <tr><td colSpan={cols} className="text-center py-10 text-muted-foreground">Belum ada purchase order.</td></tr>;
  }
  return (
    <>
      {pos.map(po => {
        const Icon = poStatusIcon(po.status);
        return (
          <tr key={po.id} className="border-t border-border/40 hover:bg-secondary/40 transition-colors">
            <td className="px-4 py-3 font-mono text-xs">{po.id}</td>
            {showSupplier && <td className="px-4 py-3 font-medium">{po.supplierName}</td>}
            <td className="px-4 py-3 text-muted-foreground">{po.date}</td>
            {showSupplier && <td className="px-4 py-3 text-muted-foreground">{po.estimatedArrival}</td>}
            <td className="px-4 py-3 text-right tabular-nums font-medium">{fmt(poTotal(po))}</td>
            <td className="px-4 py-3 text-center">
              <Badge variant="outline" className={`${poStatusTone(po.status)} inline-flex items-center gap-1`}>
                <Icon className="h-3 w-3" />{po.status}
              </Badge>
            </td>
          </tr>
        );
      })}
    </>
  );
}

// ─── Modal: Supplier (Tambah & Edit) ─────────────────────────────────────────

type SForm = { name:string; pic:string; region:string; phone:string; email:string; beans:string; address:string; notes:string; status:SupplierStatus };
const blankForm: SForm = { name:"", pic:"", region:"", phone:"", email:"", beans:"", address:"", notes:"", status:"Aktif" };
const toForm = (s: Supplier): SForm => ({ name:s.name, pic:s.pic, region:s.region, phone:s.phone, email:s.email, beans:s.beans.join(", "), address:s.address??"", notes:s.notes??"", status:s.status });

function SupplierModal({ supplier, onClose, onSave }: {
  supplier?: Supplier; onClose: () => void;
  onSave: (data: Omit<Supplier, "id"> & { id?: string }) => void;
}) {
  const isEdit = !!supplier;
  const [form, setForm] = useState<SForm>(isEdit ? toForm(supplier!) : blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof SForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    const e: Record<string, string> = {};
    (["name","pic","region","phone","email","beans"] as (keyof SForm)[]).forEach(k => {
      if (!form[k].trim()) e[k] = "Wajib diisi";
    });
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      ...(isEdit ? supplier! : { lastDelivery: "Belum ada", totalKg: 0 }),
      name: form.name.trim(), pic: form.pic.trim(), region: form.region.trim(),
      phone: form.phone.trim(), email: form.email.trim(),
      beans: form.beans.split(",").map(b => b.trim()).filter(Boolean),
      address: form.address.trim(), notes: form.notes.trim(), status: form.status,
    });
  }

  const textFields: { key: keyof SForm; label: string; placeholder: string; type?: string; inputMode?: string; span?: boolean }[] = [
    { key:"name",   label:"Nama Supplier", placeholder:"Koperasi Tani Gayo",      span: true },
    { key:"pic",    label:"Nama PIC",      placeholder:"Pak Munir" },
    { key:"region", label:"Region",        placeholder:"Aceh Tengah" },
    { key:"phone",  label:"No. Telepon",   placeholder:"+62 812-xxxx-xxxx", type:"tel", inputMode:"tel" },
    { key:"email",  label:"Email",         placeholder:"email@supplier.id", type:"email", inputMode:"email" },
    { key:"beans",  label:"Jenis Biji Kopi", placeholder:"Arabica, Gayo Wine (pisah koma)", span: true },
    { key:"address",label:"Alamat",        placeholder:"Jl. Raya Bebesen No.12", span: true },
  ];

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={isEdit ? "Edit Supplier" : "Tambah Supplier"}
        subtitle={isEdit ? `${supplier!.id} · ${supplier!.name}` : "Daftarkan mitra pemasok biji kopi baru"}
        onClose={onClose}
      />
      <div className="p-6 grid grid-cols-2 gap-4">
        {textFields.map(f => (
          <div key={f.key} className={f.span ? "col-span-2" : ""}>
            <Field label={f.label}>
              <Input className={INP} placeholder={f.placeholder} type={f.type} inputMode={f.inputMode as any}
                value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
              <ErrMsg msg={errors[f.key]} />
            </Field>
          </div>
        ))}
        <div className="col-span-2">
          <Field label="Status">
            <div className="flex gap-2">
              {(["Aktif","Pending","Non-aktif"] as SupplierStatus[]).map(s => (
                <button key={s} onClick={() => set("status", s)}
                  className={`h-9 px-4 rounded-full text-sm border transition-colors ${form.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Catatan">
            <textarea className={`${TA} min-h-[80px]`} placeholder="Min order, lead time, catatan khusus…"
              value={form.notes} onChange={e => set("notes", e.target.value)} />
          </Field>
        </div>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSave} confirmLabel={isEdit ? "Simpan Perubahan" : "Simpan Supplier"} />
    </Modal>
  );
}

// ─── Modal: Konfirmasi Hapus ──────────────────────────────────────────────────

function HapusModal({ supplier, poCount, onClose, onConfirm }: {
  supplier: Supplier; poCount: number; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Hapus Supplier" subtitle="Tindakan ini tidak bisa dibatalkan" onClose={onClose} />
      <div className="p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Supplier <span className="font-medium text-foreground">{supplier.name}</span> akan dihapus permanen dari sistem.
        </p>
        {poCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Supplier ini memiliki <span className="font-medium text-foreground">{poCount} riwayat PO</span> — data PO tetap tersimpan.
          </p>
        )}
      </div>
      <div className="border-t border-border/60 px-6 py-4 flex gap-2 justify-end">
        <Button variant="outline" className={BTN_OUTLINE} onClick={onClose}>Batal</Button>
        <Button className={BTN_PRIMARY} onClick={onConfirm}>
          <Trash2 className="h-4 w-4 mr-2" />Hapus
        </Button>
      </div>
    </Modal>
  );
}

// ─── Modal: Detail Supplier ───────────────────────────────────────────────────

function DetailModal({ supplier, pos, onClose, onBuatPO, onEdit, onHapus }: {
  supplier: Supplier; pos: PO[]; onClose: () => void;
  onBuatPO: (s: Supplier) => void; onEdit: (s: Supplier) => void; onHapus: (s: Supplier) => void;
}) {
  const sPOs = pos.filter(p => p.supplierId === supplier.id);
  const totalValue = sPOs.reduce((a, p) => a + poTotal(p), 0);
  const go = (fn: (s: Supplier) => void) => { onClose(); fn(supplier); };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader title={supplier.name} subtitle={`${supplier.id} · ${supplier.pic}`} onClose={onClose} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusTone(supplier.status)}>{supplier.status}</Badge>
          {supplier.beans.map(b => <Badge key={b} variant="outline" className="text-xs bg-secondary/60">{b}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3 text-muted-foreground">
            {([[MapPin, supplier.region],[Phone, supplier.phone],[Mail, supplier.email]] as [React.ElementType, string][]).map(([Icon, val]) => (
              <div key={val} className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 shrink-0" />{val}</div>
            ))}
          </div>
          <div className="space-y-3">
            {([["Total Pasokan", fmtKg(supplier.totalKg)],["Terakhir Kirim", supplier.lastDelivery]] as [string,string][]).map(([label, val]) => (
              <div key={label} className="bg-secondary/50 rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-semibold">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {supplier.address && (
          <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3 flex gap-2">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />{supplier.address}
          </div>
        )}
        {supplier.notes && (
          <div className="text-sm bg-secondary/30 border border-border/60 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Catatan</p>
            <p className="text-muted-foreground">{supplier.notes}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Riwayat Purchase Order</h3>
            <span className="text-xs text-muted-foreground">{sPOs.length} PO · {fmt(totalValue)}</span>
          </div>
          {sPOs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground bg-secondary/30 rounded-xl">Belum ada PO untuk supplier ini.</div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    {["ID PO","Tanggal","Total","Status"].map((h, i) => (
                      <th key={h} className={`font-medium px-4 py-2.5 ${i===2?"text-right":i===3?"text-center":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody><PORows pos={sPOs} /></tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-4 flex gap-2">
        <Button className={`${BTN_PRIMARY} px-3 text-sm`} onClick={() => go(onHapus)}>
          <Trash2 className="h-4 w-4 mr-1.5" />Hapus
        </Button>
        <Button variant="outline" className={`flex-1 ${BTN_OUTLINE}`} onClick={() => go(onEdit)}>
          <Pencil className="h-4 w-4 mr-2" />Edit
        </Button>
        <Button className={`flex-1 ${BTN_PRIMARY}`} onClick={() => go(onBuatPO)}>
          <ClipboardList className="h-4 w-4 mr-2" />Buat PO
        </Button>
      </div>
    </Modal>
  );
}

// ─── Modal: Buat PO ───────────────────────────────────────────────────────────

function BuatPOModal({ suppliers, defaultSupplier, onClose, onSave }: {
  suppliers: Supplier[]; defaultSupplier?: Supplier;
  onClose: () => void; onSave: (po: Omit<PO, "id">) => void;
}) {
  const [supplierId, setSupplierId] = useState(defaultSupplier?.id ?? "");
  const [date, setDate]   = useState("");
  const [eta, setEta]     = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ bean:"", qty:"", pricePerKg:"" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selected = suppliers.find(s => s.id === supplierId);
  const total = items.reduce((acc, i) => acc + (parseInt(i.qty,10)||0) * (parseInt(i.pricePerKg,10)||0), 0);
  const setItem = (i: number, k: string, v: string) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  function handleSave() {
    const e: Record<string, string> = {};
    if (!supplierId) e.supplier = "Pilih supplier";
    if (!date) e.date = "Wajib diisi";
    if (!eta)  e.eta  = "Wajib diisi";
    items.forEach((item, i) => {
      if (!item.bean.trim())                        e[`bean_${i}`]  = "Wajib diisi";
      if (!item.qty || parseInt(item.qty,10) <= 0)  e[`qty_${i}`]   = "Harus > 0";
      if (!item.pricePerKg || parseInt(item.pricePerKg,10) <= 0) e[`price_${i}`] = "Harus > 0";
    });
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      supplierId, supplierName: selected?.name ?? "", date,
      estimatedArrival: eta, notes: notes.trim(), status: "Pending",
      items: items.map(i => ({ bean: i.bean.trim(), qty: parseInt(i.qty,10), pricePerKg: parseInt(i.pricePerKg,10) })),
    });
  }

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader title="Buat Purchase Order" subtitle="Order biji kopi dari supplier" onClose={onClose} />
      <div className="p-6 space-y-5">
        <Field label="Supplier">
          <select className={`${INP} w-full border border-input px-3 focus:outline-none focus:ring-2 focus:ring-ring`}
            value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">Pilih supplier…</option>
            {suppliers.filter(s => s.status === "Aktif").map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.region}</option>
            ))}
          </select>
          <ErrMsg msg={errors.supplier} />
        </Field>

        {selected && (
          <div className="flex flex-wrap gap-1">
            {selected.beans.map(b => <Badge key={b} variant="outline" className="text-xs bg-secondary/60">{b}</Badge>)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal PO">
            <Input className={DATE_CLS} type="date" value={date} onChange={e => setDate(e.target.value)} />
            <ErrMsg msg={errors.date} />
          </Field>
          <Field label="Estimasi Tiba">
            <Input className={DATE_CLS} type="date" value={eta} onChange={e => setEta(e.target.value)} />
            <ErrMsg msg={errors.eta} />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item Order</label>
            <button onClick={() => setItems(p => [...p, { bean:"", qty:"", pricePerKg:"" }])}
              className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus className="h-3 w-3" />Tambah Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input className={`${INP} flex-1`} placeholder="Jenis biji kopi"
                  value={item.bean} onChange={e => setItem(i, "bean", e.target.value)} />
                <NumericInput className={`${INP} w-24`} placeholder="Qty (kg)"
                  value={item.qty} onChange={v => setItem(i, "qty", v)} />
                <NumericInput className={`${INP} w-32`} placeholder="Harga/kg"
                  value={item.pricePerKg} onChange={v => setItem(i, "pricePerKg", v)} />
                {items.length > 1 && (
                  <button onClick={() => setItems(p => p.filter((_,idx) => idx !== i))}
                    className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-secondary text-muted-foreground transition-colors shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {items.some((_, i) => errors[`bean_${i}`] || errors[`qty_${i}`] || errors[`price_${i}`]) && (
              items.map((_, i) => (
                <div key={`err_${i}`} className="flex gap-2">
                  <div className="flex-1"><ErrMsg msg={errors[`bean_${i}`]} /></div>
                  <div className="w-24"><ErrMsg msg={errors[`qty_${i}`]} /></div>
                  <div className="w-32"><ErrMsg msg={errors[`price_${i}`]} /></div>
                  {items.length > 1 && <div className="w-10" />}
                </div>
              ))
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Nilai PO</span>
            <span className="font-semibold text-primary">{fmt(total)}</span>
          </div>
        )}

        <Field label="Catatan">
          <textarea className={`${TA} min-h-[72px]`} placeholder="Instruksi pengiriman, catatan kualitas…"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSave} confirmLabel="Buat PO" icon={ClipboardList} />
    </Modal>
  );
}

// ─── POTable ──────────────────────────────────────────────────────────────────

function POTable({ pos }: { pos: PO[] }) {
  return (
    <Card className="shadow-soft border-border/60">
      <CardContent className="p-5">
        <h2 className="font-display text-base font-semibold mb-4">Riwayat Purchase Order</h2>
        <div className="rounded-xl overflow-hidden border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-xs text-muted-foreground">
                {["ID PO","Supplier","Tanggal","Est. Tiba","Total","Status"].map((h, i) => (
                  <th key={h} className={`font-medium px-4 py-2.5 ${i===4?"text-right":i===5?"text-center":"text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody><PORows pos={pos} showSupplier /></tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initSuppliers);
  const [pos, setPOs]             = useState<PO[]>(initPOs);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });
  const [search, setSearch]       = useState("");
  const close = () => setModal({ type: "none" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? suppliers.filter(s => [s.name, s.region, s.pic, ...s.beans].some(v => v.toLowerCase().includes(q))) : suppliers;
  }, [suppliers, search]);

  const handleSaveSupplier = (data: Omit<Supplier, "id"> & { id?: string }) => {
    setSuppliers(p => data.id ? p.map(s => s.id === data.id ? data as Supplier : s) : [...p, { ...data, id: nextId(suppliers, "S-", 3) } as Supplier]);
    close();
  };
  const handleDeleteSupplier = (id: string) => { setSuppliers(p => p.filter(s => s.id !== id)); close(); };
  const handleSavePO = (partial: Omit<PO, "id">) => { setPOs(p => [{ ...partial, id: nextId(pos, "PO-", 4) }, ...p]); close(); };

  const stats = [
    { label:"Total Supplier",   value:`${suppliers.length}`,                               sub:`${suppliers.filter(s=>s.status==="Aktif").length} aktif`,    icon:Users },
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
            <Input placeholder="Cari supplier, region, atau jenis biji…" className="h-10 pl-10 rounded-xl bg-secondary/50"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={`h-10 ${BTN_OUTLINE}`} onClick={() => setModal({ type:"po" })}>
              <ClipboardList className="h-4 w-4 mr-2" />Buat PO
            </Button>
            <Button className={`h-10 ${BTN_PRIMARY}`} onClick={() => setModal({ type:"supplier" })}>
              <Plus className="h-4 w-4 mr-2" />Tambah Supplier
            </Button>
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
                    <div className="h-12 w-12 rounded-xl gradient-crema flex items-center justify-center shrink-0 shadow-warm">
                      <span className="font-display text-base font-semibold text-primary-foreground">{initials(s.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-semibold truncate">{s.name}</h3>
                          <div className="text-xs text-muted-foreground">{s.id} · {s.pic}</div>
                        </div>
                        <Badge variant="outline" className={statusTone(s.status)}>{s.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {s.beans.map(b => <Badge key={b} variant="outline" className="text-[10px] bg-secondary/60">{b}</Badge>)}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{s.region}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{s.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{s.email}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total pasokan</div>
                      <div className="font-medium tabular-nums text-foreground text-sm">{fmtKg(s.totalKg)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pengiriman</div>
                      <div className="font-medium text-foreground text-sm">{s.lastDelivery}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className={BTN_ICON_DEL}
                      onClick={() => setModal({ type:"hapus", supplier:s })} title="Hapus">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className={BTN_ICON_EDT}
                      onClick={() => setModal({ type:"supplier", supplier:s })} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className={`flex-1 ${BTN_OUTLINE} h-8 text-xs`}
                      onClick={() => setModal({ type:"detail", supplier:s })}>Detail</Button>
                    <Button size="sm" className={`flex-1 ${BTN_PRIMARY} h-8 text-xs`}
                      onClick={() => setModal({ type:"po", supplier:s })}>Buat PO</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <POTable pos={pos} />
      </main>

      {modal.type === "supplier" && <SupplierModal supplier={modal.supplier} onClose={close} onSave={handleSaveSupplier} />}
      {modal.type === "hapus"    && <HapusModal supplier={modal.supplier} poCount={pos.filter(p=>p.supplierId===modal.supplier.id).length} onClose={close} onConfirm={() => handleDeleteSupplier(modal.supplier.id)} />}
      {modal.type === "detail"   && <DetailModal supplier={modal.supplier} pos={pos} onClose={close} onBuatPO={s=>setModal({type:"po",supplier:s})} onEdit={s=>setModal({type:"supplier",supplier:s})} onHapus={s=>setModal({type:"hapus",supplier:s})} />}
      {modal.type === "po"       && <BuatPOModal suppliers={suppliers} defaultSupplier={modal.supplier} onClose={close} onSave={handleSavePO} />}
    </>
  );
}