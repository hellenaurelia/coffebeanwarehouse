# Integrasi Inventory ke Database

Fitur Inventory sekarang tersambung ke Postgres (Azure) lewat Prisma + Server Actions.
Tampilan tidak berubah; satu-satunya sentuhan pada file UI adalah menambah parameter
opsional pada callback `onSave` modal rekonsiliasi (tanpa mengubah JSX/styling).

## File baru
- `_data/repository.ts` — query baca: `getInventory()` memetakan `Product` ke tipe `InventoryItem`.
- `_data/actions.ts` — Server Actions: `updateProductPriceAction`, `reconcileStockAction`.
- `inventory-client.tsx` — komponen client berisi seluruh UI lama (dipindah verbatim dari page).

## File yang diubah
- `page.tsx` — kini Server Component: fetch data lalu render `InventoryClient`. Tetap
  me-`export` tipe `InventoryItem` karena komponen anak meng-import-nya dari `"../page"`.
- `_components/rekonsiliasi-modal.tsx` — signature `onSave` ditambah argumen kedua
  (`lines`: daftar item berubah + alasan). Hanya tipe & pemanggilan `handleSave` yang
  berubah; tampilan utuh.

## Yang tersimpan ke DB
- **Edit harga jual** (modal detail) -> update `products.sell_price`.
- **Rekonsiliasi** -> untuk tiap item yang berubah: update `products.stock_kg`,
  buat record `stock_reconciliations` (termasuk `reason`), dan tulis `stock_logs`
  (type `RECONCILIATION`). Semua dalam satu transaksi.

## Batasan yang perlu kamu tahu
1. **Foto produk tidak tersimpan.** Schema `Product` tidak punya kolom foto, jadi ganti
   foto hanya berlaku selama sesi (hilang setelah reload). Kalau mau permanen, perlu
   menambah kolom mis. `photoUrl String?` di schema + migrasi, lalu simpan via action.
2. **Field read-only di modal** (SKU, supplier, tipe, stok, harga beli) memang tidak
   diubah dari sini — hanya harga jual. Stok diubah lewat rekonsiliasi / penerimaan PO.
3. **Creator default (sementara).** `reconcileStockAction` butuh `createdById`; karena
   auth belum tersambung, dipakai user OWNER pertama. Lihat `TODO(auth)` di `actions.ts`.

## Catatan
- Tipe biji (Arabica/Robusta/Liberica/Luwak) di-infer dari nama produk untuk warna badge,
  konsisten dengan halaman lain.
- Kolom `exp` (kadaluarsa) di-set "—" karena tidak ada di schema; CSV ekspor tetap jalan.
