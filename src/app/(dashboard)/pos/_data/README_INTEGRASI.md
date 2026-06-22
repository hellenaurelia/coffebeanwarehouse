# Integrasi POS (Kasir) ke Database

POS kini tersambung ke Postgres (Azure): katalog dibaca dari DB, dan checkout
menulis transaksi + memotong stok. Tampilan tidak berubah; sentuhan pada file UI
hanya mengganti SUMBER data produk (dari array dummy ke context), bukan JSX.

## File baru
- `_data/repository.ts` — `getPOSProducts()`: katalog dari tabel `products` (id = id DB asli).
- `_data/actions.ts` — `checkoutAction()`: proses transaksi dalam satu DB transaction.
- `_components/pos-context.tsx` — provider kecil yang menyuplai daftar produk ke panel.
- `pos-client.tsx` — komponen client berisi seluruh UI POS lama.

## File yang diubah (logika saja, JSX utuh)
- `page.tsx` — Server Component: fetch katalog, render `POSClient`.
- `_components/catalog-panel.tsx` — `products` kini dari `usePOSProducts()` (bukan import dummy).
- `_components/cart-panel.tsx` — sama, `products` dari context.
- `pos-client.tsx` — keranjang awal jadi kosong (lihat catatan), checkout dipanggil saat sukses bayar.

## Yang tersimpan saat checkout
Dalam satu transaksi DB:
- `transactions` — `totalAmount` = total persis yang dibayar (subtotal − diskon + pajak 11% + biaya giling), plus `totalCogs` & `grossProfit` yang dihitung dari harga beli tiap produk; `status = PAID`, `paidAt = now`.
- `transaction_items` — per item: qty, harga jual, harga beli, subtotal, profit.
- `products.stock_kg` dikurangi, dan tiap pengurangan dicatat di `stock_logs` (type `SALE`).
- Nomor transaksi `TRX-####` dibuat otomatis.
- Ada guard anti-oversell: kalau stok kurang, transaksi dibatalkan (rollback).

## Catatan penting
1. **Keranjang awal jadi kosong.** UI lama mengisi keranjang dengan id dummy `{ p1, p7 }`.
   Id itu tidak ada di DB (produk asli pakai UUID), jadi kalau dipertahankan akan crash.
   Keranjang sekarang mulai kosong — perilaku kasir yang benar.
2. **Diskon, pajak, biaya giling, dan opsi giling tidak punya kolom sendiri** di schema.
   Semuanya sudah tercermin di `totalAmount`, tapi rinciannya tidak disimpan terpisah.
   Kalau kamu mau menyimpan diskon/pajak/grind secara eksplisit, perlu menambah kolom.
3. **Kasir default (sementara).** Checkout butuh `cashierId`; karena auth belum tersambung,
   dipakai user KASIR pertama (atau user aktif pertama). Lihat `TODO(auth)` di `actions.ts`.
4. Harga di katalog kini mengikuti `sell_price` di DB (bukan harga dummy lama yang berbeda).
