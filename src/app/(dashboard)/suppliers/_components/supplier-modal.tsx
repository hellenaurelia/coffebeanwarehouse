"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Supplier, SupplierStatus } from "../page";
import { Modal, ModalHeader, ModalFooter, Field, ErrMsg, INP, TA } from "./shared-components";

type SForm = { name:string; pic:string; region:string; phone:string; email:string; beans:string; address:string; notes:string; status:SupplierStatus };
const blankForm: SForm = { name:"", pic:"", region:"", phone:"", email:"", beans:"", address:"", notes:"", status:"Aktif" };
const toForm = (s: Supplier): SForm => ({ name:s.name, pic:s.pic, region:s.region, phone:s.phone, email:s.email, beans:s.beans.join(", "), address:s.address??"", notes:s.notes??"", status:s.status });

export function SupplierModal({ supplier, onClose, onSave }: {
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
      <ModalHeader title={isEdit ? "Edit Supplier" : "Tambah Supplier"} subtitle={isEdit ? `${supplier!.id} · ${supplier!.name}` : "Daftarkan mitra pemasok biji kopi baru"} onClose={onClose} />
      <div className="p-6 grid grid-cols-2 gap-4">
        {textFields.map(f => (
          <div key={f.key} className={f.span ? "col-span-2" : ""}>
            <Field label={f.label}>
              <Input className={INP} placeholder={f.placeholder} type={f.type} inputMode={f.inputMode as any} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
              <ErrMsg msg={errors[f.key]} />
            </Field>
          </div>
        ))}
        <div className="col-span-2">
          <Field label="Status">
            <div className="flex gap-2">
              {(["Aktif","Pending","Non-aktif"] as SupplierStatus[]).map(s => (
                <button key={s} onClick={() => set("status", s)} className={`h-9 px-4 rounded-full text-sm border transition-colors ${form.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
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