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
  status: POStatus; arrivalDate: string; notes?: string;
};

// Seed data supplier sekarang langsung membawa master data harga kopi
export const initSuppliers: Supplier[] = [
  { id:"S-001", name:"Koperasi Tani Gayo",    pic:"Pak Munir",  region:"Aceh Tengah",    phone:"+62 812-3344-5566", email:"munir@gayotani.id",  beans:[{name:"Arabica", price:95000},{name:"Gayo Wine", price:180000}],       lastDelivery:"2 hari lalu",  totalKg:1840, status:"Aktif",    address:"Jl. Raya Bebesen No.12, Aceh Tengah",         notes:"Supplier utama arabica premium. Min order 100kg." },
  { id:"S-002", name:"Kintamani Highland",    pic:"Bu Wayan",    region:"Bangli, Bali",   phone:"+62 821-7788-9900", email:"wayan@kintamani.co", beans:[{name:"Arabica Honey", price:120000}],             lastDelivery:"5 hari lalu",  totalKg:1240, status:"Aktif",    address:"Desa Batur, Kintamani, Bangli",               notes:"Musim panen April–Juni. Kualitas konsisten." },
  { id:"S-003", name:"Toraja Coffee Hub",     pic:"Pak Reynaldi",region:"Tana Toraja",    phone:"+62 813-2211-0099", email:"rey@torajacoffee.id",beans:[{name:"Arabica Sapan", price:110000}],             lastDelivery:"1 minggu lalu", totalKg:980,  status:"Aktif",    address:"Jl. Pongtiku 45, Rantepao, Tana Toraja" },
  { id:"S-004", name:"Lampung Robusta Mills", pic:"Pak Hendra",  region:"Lampung Barat",  phone:"+62 822-5544-3322", email:"hendra@lrm.id",      beans:[{name:"Robusta AAA", price:48000},{name:"Robusta Honey", price:52000}],lastDelivery:"3 hari lalu",  totalKg:3120, status:"Aktif",    address:"Kawasan Industri Way Laga, Lampung Barat",    notes:"Lead time 3 hari kerja. Harga negotiable untuk >500kg." },
  { id:"S-005", name:"Civet Farm Lampung",    pic:"Pak Jaka",    region:"Liwa, Lampung",  phone:"+62 815-9988-7766", email:"jaka@civetfarm.id",  beans:[{name:"Luwak Premium", price:850000}],             lastDelivery:"2 minggu lalu", totalKg:64,   status:"Aktif",    address:"Desa Sukaraja, Liwa, Lampung Barat",          notes:"Produksi terbatas 5–10kg/minggu." },
  { id:"S-006", name:"Preanger Estate",       pic:"Bu Salma",    region:"Garut, Jawa Barat",phone:"+62 819-1122-3344",email:"salma@preanger.id", beans:[{name:"Arabica Java", price:105000}],              lastDelivery:"10 hari lalu",  totalKg:1520, status:"Pending",  address:"Perkebunan Cikajang, Garut",                  notes:"Menunggu verifikasi dokumen BPOM." },
  { id:"S-007", name:"Riau Liberica Co",      pic:"Pak Daud",    region:"Meranti, Riau",  phone:"+62 811-2233-4455", email:"daud@liberica.id",   beans:[{name:"Liberica", price:65000}],                  lastDelivery:"3 minggu lalu", totalKg:280,  status:"Non-aktif",address:"Jl. Merbau No.7, Selat Panjang, Riau" },
];

export const initPOs: PO[] = [
  { id:"PO-0041", supplierId:"S-001", supplierName:"Koperasi Tani Gayo",    date:"7 Mei 2026",  items:[{bean:"Arabica",qty:200,pricePerKg:95000},{bean:"Gayo Wine",qty:50,pricePerKg:180000}], status:"Dikirim",  arrivalDate:"-" },
  { id:"PO-0040", supplierId:"S-004", supplierName:"Lampung Robusta Mills", date:"6 Mei 2026",  items:[{bean:"Robusta AAA",qty:300,pricePerKg:48000}],                                        status:"Diterima", arrivalDate:"9 Mei 2026",  notes:"Kualitas sesuai spesifikasi." },
  { id:"PO-0039", supplierId:"S-002", supplierName:"Kintamani Highland",    date:"1 Mei 2026",  items:[{bean:"Arabica Honey",qty:150,pricePerKg:120000}],                                       status:"Diterima", arrivalDate:"6 Mei 2026" },
  { id:"PO-0038", supplierId:"S-003", supplierName:"Toraja Coffee Hub",     date:"28 Apr 2026", items:[{bean:"Arabica Sapan",qty:100,pricePerKg:110000}],                                       status:"Diterima", arrivalDate:"3 Mei 2026" },
  { id:"PO-0037", supplierId:"S-005", supplierName:"Civet Farm Lampung",    date:"25 Apr 2026", items:[{bean:"Luwak Premium",qty:10,pricePerKg:850000}],                                        status:"Diterima", arrivalDate:"30 Apr 2026" },
  { id:"PO-0036", supplierId:"S-006", supplierName:"Preanger Estate",       date:"20 Apr 2026", items:[{bean:"Arabica Java",qty:200,pricePerKg:105000}],                                        status:"Pending",  arrivalDate:"-",         notes:"Menunggu konfirmasi jadwal pengiriman." },
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
