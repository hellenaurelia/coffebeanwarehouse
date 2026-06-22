# Integrasi Suppliers + Purchase Order ke Database

Fitur Suppliers & PO sekarang tersambung penuh ke Postgres (Azure) lewat Prisma.
**Tidak ada satu pun perubahan tampilan/JSX** pada komponen visual atau modal.

## File baru
- `_data/mappers.ts` — konversi bentuk data DB (Prisma) ke tipe UI (`Supplier`, `PO`) yang sudah ada. Inilah yang menjaga tampilan tetap identik.
- `_data/repository.ts` — query baca (server-only): `getSuppliers`, `getPurchaseOrders`, `getInventoryForSuppliers`.
- `_data/actions.ts` — Server Actions untuk semua operasi tulis.
- `suppliers-shell.tsx` — wrapper client (Provider + semua modal), dipisah dari layout.

## File yang diubah
- `_components/supplier-context.tsx` — sekarang menerima data awal dari DB lewat props, dan setiap handler memanggil Server Action lalu menyinkronkan state lokal. Signature handler TIDAK berubah, jadi semua komponen pemakainya tidak perlu diubah.
- `layout.tsx` — kini Server Component: fetch data dari DB lalu diserahkan ke `SuppliersShell`. (Sebelumnya layout ini meng-import `SupplierProvider` tapi tidak pernah membungkus children dengannya — itu bug yang juga sekalian diperbaiki di sini.)

## Dua keputusan yang perlu kamu tahu
1. **Hapus supplier = soft delete.** Modal bilang "dihapus permanen", tapi hard delete akan melanggar foreign key (PO & supplier_products mengacu ke supplier) dan modal sendiri menjanjikan "data PO tetap tersimpan". Jadi supplier di-set `isActive=false` dan hilang dari daftar — hasil yang terlihat sama, tapi data aman. Kalau kamu memang mau hard delete, perlu cascade/aturan FK dulu.

2. **Creator default (sementara).** Operasi tulis butuh `createdById`, sedangkan auth/session belum tersambung. `resolveActorId()` memakai user OWNER pertama sebagai creator. Cari komentar `TODO(auth)` di `actions.ts` dan ganti dengan id user dari session begitu auth-mu siap.

## Catatan teknis
- Bean di supatu supplier dipetakan ke `supplier_products` dengan mencocokkan **nama produk**. Saat menambah/menyimpan supplier, hanya produk yang sudah ada di tabel `products` yang akan ter-link (modal ini tidak membuat produk baru).
- Saat PO diubah ke status **Diterima**, stok produk otomatis bertambah dan dicatat di `stock_logs` (type `PO_IN`) dalam satu transaksi DB.
- Nomor PO baru dibuat otomatis (`PO-####`) berdasarkan nomor terbesar yang ada.
