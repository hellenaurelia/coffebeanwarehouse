"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { Supplier, SupplierStatus } from "../page";
import { Modal, ModalHeader, ModalFooter, Field, ErrMsg, NumericInput, INP, TA } from "./shared-components";

type BeanFormItem = { name: string; price: string };
type SForm = { name:string; pic:string; region:string; phone:string; email:string; beans: BeanFormItem[]; address:string; notes:string; status:SupplierStatus };

const blankForm: SForm = { name:"", pic:"", region:"", phone:"", email:"", beans:[{ name: "", price: "" }], address:"", notes:"", status:"Aktif" };
const toForm = (s: Supplier): SForm => ({ 
  name:s.name, pic:s.pic, region:s.region, phone:s.phone, email:s.email, 
  beans: s.beans.map(b => ({ name: b.name, price: b.price.toString() })), 
  address:s.address??"", notes:s.notes??"", status:s.status 
});

export function SupplierModal({ supplier, onClose, onSave }: {
  supplier?: Supplier; onClose: () => void;
  onSave: (data: Omit<Supplier, "id"> & { id?: string }) => void;
}) {
  const isEdit = !!supplier;
  const [form, setForm] = useState<SForm>(isEdit ? toForm(supplier!) : blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof SForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    const e: Record<string, string> = {};
    (["name","pic","region","phone","email"] as (keyof SForm)[]).forEach(k => {
      if (!(form[k] as string).trim()) e[k] = "Wajib diisi";
    });
    
    // UPDATE: Membersihkan data beans yang kosong
    const cleanedBeans = form.beans
      .map(b => ({ name: b.name.trim(), price: parseInt(b.price, 10) || 0 }))
      .filter(b => b.name !== "");

    if (cleanedBeans.length === 0) e.beans = "Minimal isi 1 jenis biji kopi";
    if (cleanedBeans.some(b => b.price <= 0)) e.beans = "Harga per kg harus diisi dengan benar";

    setErrors(e);
    if (Object.keys(e).length) return;
    
    onSave({
      ...(isEdit ? supplier! : { lastDelivery: "Belum ada", totalKg: 0 }),
      name: form.name.trim(), pic: form.pic.trim(), region: form.region.trim(),
      phone: form.phone.trim(), email: form.email.trim(),
      beans: cleanedBeans,
      address: form.address.trim(), notes: form.notes.trim(), status: form.status,
    });
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={isEdit ? "Edit Supplier" : "Tambah Supplier"} subtitle={isEdit ? `${supplier!.id} · ${supplier!.name}` : "Daftarkan mitra pemasok biji kopi baru"} onClose={onClose} />
      <div className="p-6 grid grid-cols-2 gap-4">
        
        <div className="col-span-2">
           <Field label="Nama Supplier"><Input className={INP} placeholder="Koperasi Tani Gayo" value={form.name} onChange={e => set("name", e.target.value)} /><ErrMsg msg={errors.name} /></Field>
        </div>
        
        <Field label="Nama PIC"><Input className={INP} placeholder="Pak Munir" value={form.pic} onChange={e => set("pic", e.target.value)} /><ErrMsg msg={errors.pic} /></Field>
        <Field label="Region"><Input className={INP} placeholder="Aceh Tengah" value={form.region} onChange={e => set("region", e.target.value)} /><ErrMsg msg={errors.region} /></Field>
        
        <Field label="No. Telepon">
           <Input className={INP} placeholder="+62 812-xxxx-xxxx" type="tel" inputMode="tel" value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d+-\s]/g, ""))} />
           <ErrMsg msg={errors.phone} />
        </Field>
        <Field label="Email"><Input className={INP} placeholder="email@supplier.id" type="email" inputMode="email" value={form.email} onChange={e => set("email", e.target.value)} /><ErrMsg msg={errors.email} /></Field>
        
        {/* UPDATE: Form Baris Dinamis untuk Biji Kopi + Harga master */}
        <div className="col-span-2">
          <Field label="Daftar Biji Kopi & Harga Kontrak">
            <div className="space-y-2">
              {form.beans.map((b, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    className={`${INP} flex-1`} 
                    placeholder="Nama Kopi (e.g. Arabica Gayo)" 
                    value={b.name} 
                    onChange={e => {
                      const newBeans = [...form.beans];
                      newBeans[i].name = e.target.value;
                      set("beans", newBeans);
                    }} 
                  />
                  <NumericInput 
                    className={`${INP} w-32`} 
                    placeholder="Harga/kg" 
                    value={b.price} 
                    onChange={v => {
                      const newBeans = [...form.beans];
                      newBeans[i].price = v;
                      set("beans", newBeans);
                    }} 
                  />
                  {form.beans.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => set("beans", form.beans.filter((_, idx) => idx !== i))} 
                      className="h-10 w-10 flex items-center justify-center rounded-xl border border-border hover:bg-secondary hover:text-destructive text-muted-foreground transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button"
                onClick={() => set("beans", [...form.beans, { name: "", price: "" }])} 
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Kopi & Harga
              </button>
              <ErrMsg msg={errors.beans} />
            </div>
          </Field>
        </div>

        <div className="col-span-2">
           <Field label="Alamat"><Input className={INP} placeholder="Jl. Raya Bebesen No.12" value={form.address} onChange={e => set("address", e.target.value)} /></Field>
        </div>

        <div className="col-span-2">
          <Field label="Status">
            <div className="flex gap-2">
              {(["Aktif","Pending","Non-aktif"] as SupplierStatus[]).map(s => (
                <button key={s} type="button" onClick={() => set("status", s)} className={`h-9 px-4 rounded-full text-sm border transition-colors ${form.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Catatan">
            <textarea className={`${TA} min-h-[80px]`} placeholder="Min order, lead time, catatan khusus…" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </Field>
        </div>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSave} confirmLabel={isEdit ? "Simpan Perubahan" : "Simpan Supplier"} />
    </Modal>
  );
}