"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { Supplier, SupplierStatus } from "../page";
import { Modal, ModalHeader, ModalFooter, Field, ErrMsg, NumericInput, INP, TA } from "./shared-components";

const BEAN_TYPES = ["Arabica", "Robusta", "Liberica", "Luwak"];
const CUSTOM_VALUE = "__custom__";

function BeanTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [customMode, setCustomMode] = useState(() => value !== "" && !BEAN_TYPES.includes(value));
  const selectValue = customMode ? CUSTOM_VALUE : value;

  return (
    <div className="flex flex-col gap-1.5 w-36 shrink-0">
      <select
        className={`${INP} w-full bg-secondary/50 border border-input`}
        value={selectValue}
        onChange={e => {
          if (e.target.value === CUSTOM_VALUE) {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Pilih tipe</option>
        {BEAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        <option value={CUSTOM_VALUE}>Lainnya…</option>
      </select>
      {customMode && (
        <Input
          className={`${INP} w-full`}
          placeholder="Tulis tipe…"
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// Simpan nomor sebagai +62 diikuti digit murni (tanpa spasi/strip).
// Saat ditampilkan, diformat jadi: +62 812-3456-4116
function parsePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("62")) digits = digits.slice(2);
  return digits ? "+62" + digits : "";
}

function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/^\+62/, "");
  if (!digits) return value.startsWith("+62") ? "+62 " : value;
  const groups = [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11)].filter(Boolean);
  return "+62 " + groups.join("-");
}

type BeanFormItem = { name: string; price: string; type: string };
type SForm = {
  name: string; pic: string; region: string; phone: string; email: string;
  beans: BeanFormItem[]; address: string; notes: string; status: SupplierStatus;
};

const blankForm: SForm = {
  name: "", pic: "", region: "", phone: "", email: "",
  beans: [{ name: "", price: "", type: "" }],
  address: "", notes: "", status: "Aktif",
};

const toForm = (s: Supplier): SForm => ({
  name: s.name, pic: s.pic, region: s.region, phone: parsePhone(s.phone), email: s.email,
  beans: s.beans.map(b => ({ name: b.name, price: b.price.toString(), type: b.type })),
  address: s.address ?? "", notes: s.notes ?? "", status: s.status,
});

export function SupplierModal({ supplier, onClose, onSave }: {
  supplier?: Supplier;
  onClose: () => void;
  onSave: (data: Omit<Supplier, "id"> & { id?: string }) => void;
}) {
  const isEdit = !!supplier;
  const [form, setForm] = useState<SForm>(isEdit ? toForm(supplier!) : blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof SForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    const e: Record<string, string> = {};
    (["name", "pic", "region", "phone", "email"] as (keyof SForm)[]).forEach(k => {
      if (!(form[k] as string).trim()) e[k] = "Wajib diisi";
    });
    if (form.phone && !/^\+62\d{9,11}$/.test(form.phone)) {
      e.phone = "Format nomor tidak valid";
    }

    const cleanedBeans = form.beans
      .map(b => ({ name: b.name.trim(), price: parseInt(b.price, 10) || 0, type: b.type }))
      .filter(b => b.name !== "");

    if (cleanedBeans.length === 0) e.beans = "Minimal isi 1 jenis biji kopi";
    else if (cleanedBeans.some(b => b.price <= 0)) e.beans = "Harga per kg harus diisi dengan benar";
    else if (cleanedBeans.some(b => !b.type)) e.beans = "Tipe biji kopi harus dipilih";

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
    <Modal onClose={onClose} wide>
      <ModalHeader
        title={isEdit ? "Edit Supplier" : "Tambah Supplier"}
        subtitle={isEdit ? `${supplier!.id} · ${supplier!.name}` : "Daftarkan mitra pemasok biji kopi baru"}
        onClose={onClose}
      />

      <div className="p-6 space-y-5">

        {/* ── Identitas Supplier ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nama Supplier">
              <Input className={INP} placeholder="Koperasi Tani Gayo" value={form.name} onChange={e => set("name", e.target.value)} />
              <ErrMsg msg={errors.name} />
            </Field>
          </div>

          <Field label="Nama PIC">
            <Input className={INP} placeholder="Pak Munir" value={form.pic} onChange={e => set("pic", e.target.value)} />
            <ErrMsg msg={errors.pic} />
          </Field>
          <Field label="Region">
            <Input className={INP} placeholder="Aceh Tengah" value={form.region} onChange={e => set("region", e.target.value)} />
            <ErrMsg msg={errors.region} />
          </Field>

          <Field label="No. Telepon">
            <Input
              className={INP} placeholder="+62 812-xxxx-xxxx"
              type="tel" inputMode="tel" value={formatPhoneDisplay(form.phone)}
              onChange={e => set("phone", parsePhone(e.target.value))}
            />
            <ErrMsg msg={errors.phone} />
          </Field>
          <Field label="Email">
            <Input
              className={INP} placeholder="email@supplier.id"
              type="email" inputMode="email" value={form.email}
              onChange={e => set("email", e.target.value)}
            />
            <ErrMsg msg={errors.email} />
          </Field>
        </div>

        <div className="border-t border-border/40" />

        {/* ── Daftar Biji Kopi ── */}
        <Field label="Daftar Biji Kopi & Harga Kontrak">
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-2.5">

            {/* Header kolom */}
            <div className="flex gap-2 items-center px-1">
              <span className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nama Kopi</span>
              <span className="w-36 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tipe</span>
              <span className="w-32 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Harga / kg</span>
              <span className="w-8" />
            </div>

            {form.beans.map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input
                  className={`${INP} flex-1`}
                  placeholder="e.g. Arabica Gayo"
                  value={b.name}
                  onChange={e => {
                    const nb = [...form.beans];
                    nb[i] = { ...nb[i], name: e.target.value };
                    set("beans", nb);
                  }}
                />
                <BeanTypeSelect
                  value={b.type}
                  onChange={v => {
                    const nb = [...form.beans];
                    nb[i] = { ...nb[i], type: v };
                    set("beans", nb);
                  }}
                />
                <NumericInput
                  className={`${INP} w-32 border border-input`}
                  placeholder="0"
                  value={b.price}
                  onChange={v => {
                    const nb = [...form.beans];
                    nb[i] = { ...nb[i], price: v };
                    set("beans", nb);
                  }}
                />
                <button
                  type="button"
                  disabled={form.beans.length === 1}
                  onClick={() => set("beans", form.beans.filter((_, idx) => idx !== i))}
                  className="h-10 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
                  aria-label="Hapus baris"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => set("beans", [...form.beans, { name: "", price: "", type: "" }])}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline underline-offset-2 transition-colors px-1 pt-0.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah biji kopi
            </button>
          </div>
          <ErrMsg msg={errors.beans} />
        </Field>

        <div className="border-t border-border/40" />

        {/* ── Info Tambahan ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Alamat">
              <Input className={INP} placeholder="Jl. Raya Bebesen No.12" value={form.address} onChange={e => set("address", e.target.value)} />
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Status">
              <div className="flex gap-2">
                {(["Aktif", "Pending", "Non-aktif"] as SupplierStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`h-9 px-5 rounded-full text-sm border transition-colors font-medium ${
                      form.status === s
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Catatan">
              <textarea
                className={`${TA} min-h-[80px]`}
                placeholder="Min order, lead time, catatan khusus…"
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
              />
            </Field>
          </div>
        </div>

      </div>

      <ModalFooter
        onClose={onClose}
        onConfirm={handleSave}
        confirmLabel={isEdit ? "Simpan Perubahan" : "Simpan Supplier"}
      />
    </Modal>
  );
}