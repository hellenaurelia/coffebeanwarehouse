# Integrasi Transactions + Reports ke Database

Kedua fitur kini membaca data nyata dari Postgres (Azure). Keduanya read-only
(tidak menulis), jadi tidak ada Server Action — hanya query + agregasi.
Transaksi hasil checkout POS langsung muncul di sini.

## TRANSACTIONS
File baru:
- `_data/repository.ts` — `getTransactions()`: map `transactions` -> tipe UI `Trx`.

File diubah (logika saja, JSX utuh):
- `page.tsx` — Server Component: fetch lalu render `TransactionsClient`.
- `transactions-client.tsx` — UI lama, menerima `data` via prop. Konstanta `TODAY`
  yang dulu di-hardcode ("9 Mei 2026") diganti: "hari ini" = tanggal transaksi
  terbaru yang ada di data, jadi kartu "Penjualan Hari Ini" selalu relevan.

Pemetaan: metode bayar DB (CASH/QRIS/CARD) -> label UI (Cash/QRIS/Kartu);
tanggal/jam dari `paidAt`; `detail[].price` = harga jual per kg; `items` = jumlah baris.

## REPORTS
File baru:
- `_data/repository.ts` — `getReportsData()`: agregasi ke `DataByRange` (7H/30H/90H).

File diubah (logika saja, JSX utuh):
- `page.tsx` — Server Component: agregasi lalu render `ReportsClient`.
- `reports-client.tsx` — UI lama, menerima `dataByRange` via prop.

Yang dihitung dari data nyata:
- **Sales chart** — total penjualan per hari (7H) atau per bucket (30H/90H).
- **Top products** — peringkat by omzet dari `transaction_items`.
- **Stock monitoring** — stok aktual + status (Aman/Menipis/Kritis) dari `min_stock_kg`.
- **KPI tren pendapatan** — dibandingkan periode sebelumnya yang sama panjang.

## Batasan yang perlu kamu tahu
1. **Pengeluaran (expense breakdown) sebagian besar 0.** Schema tidak punya tabel
   biaya operasional/gaji/logistik. Yang bisa dihitung hanya "Pembelian Biji" (dari PO
   berstatus Diterima dalam periode). Kategori lain di-set 0. Kalau kamu butuh expense
   lengkap, perlu tabel baru (mis. `expenses`) — beri tahu kalau mau dibantu.
2. **Kapasitas gudang tidak ada di schema.** Bar "kapasitas" di stock monitoring memakai
   estimasi (8× min stock, minimal 200 kg) supaya rasio bar tetap masuk akal.
3. **Custom date range** kini dipetakan ke preset terdekat (7H/30H/90H) memakai data
   nyata, bukan angka sintetis seperti versi dummy lama. (Fungsi `generateDataForRange`
   yang lama tidak lagi dipakai.)
4. **Rata-rata basket & "metode terpopuler"** di kartu statistik transaksi masih teks
   statis di komponen `statsCards.tsx` (bukan dari data) — itu bagian UI yang memang
   hardcoded sejak awal; aku tidak mengubahnya agar tampilan persis sama.
