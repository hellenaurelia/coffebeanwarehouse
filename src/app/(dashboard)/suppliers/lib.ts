export type SupplierStatus = "Aktif" | "Pending" | "Non-aktif";
export type POStatus       = "Dikirim" | "Diterima" | "Pending" | "Cancelled";

export type SupplierBean = { name: string; price: number; type: string; active?: boolean };
export interface InventoryItem {
  sku: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  exp: string;
  supplier: string;
  photo?: string;
}

export type Supplier = {
  id: string; name: string; pic: string; region: string;
  phone: string; email: string; beans: SupplierBean[];
  lastDelivery: string; totalKg: number; status: SupplierStatus;
  address?: string; notes?: string;
};

export type PO = {
  id: string; supplierId: string; supplierName: string; date: string;
  items: { bean: string; qty: number; pricePerKg: number }[];
  status: POStatus; arrivalDate: string; notes?: string;
  createdBy?: string;
};

export const initSuppliers: Supplier[] = [
  { id:"S-001", name:"Koperasi Tani Gayo",    pic:"Pak Munir",   region:"Aceh Tengah",      phone:"+6285643925109", email:"munir@gayotani.id",  beans:[{name:"Arabica",       price:95000,  type:"Arabica",  active:true},{name:"Gayo Wine",     price:180000, type:"Arabica",  active:true}],  lastDelivery:"2 hari lalu",   totalKg:1840, status:"Aktif",     address:"Jl. Raya Bebesen No.12, Aceh Tengah",       notes:"Supplier utama arabica premium. Min order 100kg." },
  { id:"S-002", name:"Kintamani Highland",    pic:"Bu Wayan",    region:"Bangli, Bali",     phone:"+6285643925109", email:"wayan@kintamani.co", beans:[{name:"Arabica Honey", price:120000, type:"Arabica", active:true}],                                                          lastDelivery:"5 hari lalu",   totalKg:1240, status:"Aktif",     address:"Desa Batur, Kintamani, Bangli",             notes:"Musim panen April–Juni. Kualitas konsisten." },
  { id:"S-003", name:"Toraja Coffee Hub",     pic:"Pak Reynaldi",region:"Tana Toraja",      phone:"+6285643925109", email:"rey@torajacoffee.id",beans:[{name:"Arabica Sapan", price:110000, type:"Arabica", active:true}],                                                          lastDelivery:"1 minggu lalu", totalKg:980,  status:"Aktif",     address:"Jl. Pongtiku 45, Rantepao, Tana Toraja" },
  { id:"S-004", name:"Lampung Robusta Mills", pic:"Pak Hendra",  region:"Lampung Barat",    phone:"+6285643925109", email:"hendra@lrm.id",      beans:[{name:"Robusta AAA",   price:48000,  type:"Robusta",  active:true},{name:"Robusta Honey", price:52000,  type:"Robusta",  active:true}],  lastDelivery:"3 hari lalu",   totalKg:3120, status:"Aktif",     address:"Kawasan Industri Way Laga, Lampung Barat",  notes:"Lead time 3 hari kerja. Harga negotiable untuk >500kg." },
  { id:"S-005", name:"Civet Farm Lampung",    pic:"Pak Jaka",    region:"Liwa, Lampung",    phone:"+6285643925109", email:"jaka@civetfarm.id",  beans:[{name:"Luwak Premium", price:850000, type:"Luwak",    active:true}],                                                            lastDelivery:"2 minggu lalu", totalKg:64,   status:"Aktif",     address:"Desa Sukaraja, Liwa, Lampung Barat",        notes:"Produksi terbatas 5–10kg/minggu." },
  { id:"S-006", name:"Preanger Estate",       pic:"Bu Salma",    region:"Garut, Jawa Barat",phone:"+6285643925109", email:"salma@preanger.id",  beans:[{name:"Arabica Java",  price:105000, type:"Arabica",  active:true}],                                                          lastDelivery:"10 hari lalu",  totalKg:1520, status:"Pending",   address:"Perkebunan Cikajang, Garut",                notes:"Menunggu verifikasi dokumen BPOM." },
  { id:"S-007", name:"Riau Liberica Co",      pic:"Pak Daud",    region:"Meranti, Riau",    phone:"+6285643925109", email:"daud@liberica.id",   beans:[{name:"Liberica",      price:65000,  type:"Liberica", active:true}],                                                         lastDelivery:"3 minggu lalu", totalKg:280,  status:"Non-aktif", address:"Jl. Merbau No.7, Selat Panjang, Riau" },
];

export const initPOs: PO[] = [
  { id:"PO-0041", supplierId:"S-001", supplierName:"Koperasi Tani Gayo",    date:"7 Mei 2026",  items:[{bean:"Arabica",qty:200,pricePerKg:95000},{bean:"Gayo Wine",qty:50,pricePerKg:180000}], status:"Dikirim",  arrivalDate:"-",           createdBy:"Arif Rahman" },
  { id:"PO-0040", supplierId:"S-004", supplierName:"Lampung Robusta Mills", date:"6 Mei 2026",  items:[{bean:"Robusta AAA",qty:300,pricePerKg:48000}],                                        status:"Diterima", arrivalDate:"9 Mei 2026",  notes:"Kualitas sesuai spesifikasi.", createdBy:"Arif Rahman" },
  { id:"PO-0039", supplierId:"S-002", supplierName:"Kintamani Highland",    date:"1 Mei 2026",  items:[{bean:"Arabica Honey",qty:150,pricePerKg:120000}],                                     status:"Diterima", arrivalDate:"6 Mei 2026",  createdBy:"Arif Rahman" },
  { id:"PO-0038", supplierId:"S-003", supplierName:"Toraja Coffee Hub",     date:"28 Apr 2026", items:[{bean:"Arabica Sapan",qty:100,pricePerKg:110000}],                                     status:"Diterima", arrivalDate:"3 Mei 2026",  createdBy:"Budi Santoso" },
  { id:"PO-0037", supplierId:"S-005", supplierName:"Civet Farm Lampung",    date:"25 Apr 2026", items:[{bean:"Luwak Premium",qty:10,pricePerKg:850000}],                                      status:"Diterima", arrivalDate:"30 Apr 2026", createdBy:"Budi Santoso" },
  { id:"PO-0036", supplierId:"S-006", supplierName:"Preanger Estate",       date:"20 Apr 2026", items:[{bean:"Arabica Java",qty:200,pricePerKg:105000}],                                      status:"Pending",  arrivalDate:"-",           notes:"Menunggu konfirmasi jadwal pengiriman.", createdBy:"Budi Santoso" },
];

export const fmtKg = (n: number) => n.toLocaleString("id-ID") + " kg";
export const initials = (name: string) => name.split(" ").map(w => w[0]).slice(0, 2).join("");
export const nextId = (list: { id: string }[], prefix: string, pad: number) => {
  const nums = list.map(x => parseInt(x.id.replace(prefix, ""))).filter(n => !isNaN(n));
  return `${prefix}${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(pad, "0")}`;
};

export const statusTone = (s: SupplierStatus) =>
  s === "Aktif"   ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
  s === "Pending" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                    "bg-muted text-muted-foreground border-border";

export const BTN_HOVER_COKLAT = "border border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors";
export const BTN_ICON_DEL = "h-8 w-8 p-0 rounded-lg border border-border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors";
export const BTN_ICON_EDT = `h-8 w-8 p-0 rounded-lg ${BTN_HOVER_COKLAT}`;

export const initialItems: InventoryItem[] = [
  { sku: "GYO-WN-001", name: "Gayo Wine Natural",    type: "Arabica",  stock: 142, unit: "kg", cost: 165000, price: 280000, exp: "Mar 2027", supplier: "CV Gayo Mandiri" },
  { sku: "KIN-HN-002", name: "Kintamani Honey",       type: "Arabica",  stock: 38,  unit: "kg", cost: 140000, price: 240000, exp: "Feb 2027", supplier: "UD Subak Bali" },
  { sku: "TRJ-SP-003", name: "Toraja Sapan",           type: "Arabica",  stock: 96,  unit: "kg", cost: 180000, price: 310000, exp: "Jan 2027", supplier: "PT Toraja Coffee" },
  { sku: "LWK-PR-004", name: "Luwak Premium",          type: "Luwak",    stock: 8,   unit: "kg", cost: 780000, price: 1250000, exp: "—",       supplier: "CV Luwak Nusantara" },
  { sku: "LMP-RB-005", name: "Lampung Robusta AAA",    type: "Robusta",  stock: 220, unit: "kg", cost: 78000,  price: 145000, exp: "Mar 2027", supplier: "PT Sinar Robusta" },
  { sku: "LBR-MR-006", name: "Liberica Meranti",       type: "Liberica", stock: 24,  unit: "kg", cost: 105000, price: 185000, exp: "—",       supplier: "UD Riau Kopi" },
];