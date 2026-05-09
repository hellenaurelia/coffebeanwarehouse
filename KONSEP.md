# Coffee Shop POS & Warehouse Management System

## Deskripsi Project

Web application berbasis cloud untuk manajemen kasir dan warehouse toko biji kopi. Sistem ini digunakan untuk membantu pengelolaan stok gudang, transaksi penjualan, monitoring laporan, serta manajemen akun staf secara terintegrasi.

### Tech Stack
- Next.js
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth/Auth.js
- Microsoft Azure

---

# Tujuan Sistem

Sistem dirancang untuk:
- Mempermudah transaksi kasir
- Mengelola stok warehouse secara realtime
- Memantau pendapatan dan pengeluaran
- Mengurangi kesalahan pencatatan stok
- Menyediakan laporan penjualan dan inventory

---

# Role dan Hak Akses

## Admin
Memiliki full access terhadap seluruh sistem.

### Fitur
- Manajemen akun staf
- Akses laporan
- Monitoring seluruh aktivitas sistem

---

## Kasir
Bertugas melakukan transaksi penjualan.

### Fitur
- Menambahkan barang pembelian pelanggan
- Input quantity pembelian (kg)
- Checkout transaksi
- Memilih metode pembayaran
- Cetak nota receipt
- Melihat history transaksi

### Catatan
- Stok otomatis berkurang setelah transaksi berhasil

---

## Warehouse Staff
Bertugas mengelola warehouse dan inventory.

### Fitur
- Kelola stok barang
- Tambah barang baru
- Edit data barang
- Hapus barang
- Update harga
- Reconciliation stok
- Kelola supplier

---

# Fitur CRUD

## Produk Kopi
- Tambah produk
- Edit produk
- Hapus produk
- Upload foto produk
- Kategori kopi
- Supplier
- Harga modal
- Harga jual
- Jumlah stok

---

## Manajemen Akun
- Tambah akun staf
- Edit akun staf
- Hapus akun staf
- Pengaturan role user

---

# Fitur Warehouse

## Stock Management
- Stok masuk
- Stok keluar
- Reconciliation stok
- Riwayat perubahan stok
- Notifikasi stok menipis

---

## Supplier Management

### Data Supplier
- Nama supplier
- Lokasi supplier
- Kontak supplier

---

# Fitur Kasir

## Point of Sale (POS)
- Tambah barang ke transaksi
- Input quantity pembelian
- Checkout transaksi

### Metode Pembayaran
- Cash
- Debit card
- Credit card

### Fitur Tambahan
- Cetak nota receipt
- History transaksi

---

# Fitur Laporan

## Reporting
- Top 5 barang terlaris
- Total pendapatan
- Total pengeluaran
- Monitoring stok gudang
- Grafik penjualan

---

# Struktur Halaman

## Umum
- Login page
- Notification system

---

## Kasir
- Halaman kasir
- Checkout page
- Tampilan nota receipt

---

## Warehouse
- Warehouse management page
- Supplier management page

### Warehouse Management
- Nama kopi
- Kategori kopi
- Stok
- Harga jual
- Harga beli
- Supplier
- Reconciliation stok

---

## Admin
- Pengaturan akun staf
- Halaman report

---

# Alur Sistem Utama

## Warehouse Flow
1. Warehouse staff menambahkan atau memperbarui stok
2. Sistem menyimpan riwayat perubahan stok
3. Sistem memberikan notifikasi jika stok menipis

---

## Kasir Flow
1. Kasir memilih barang
2. Kasir menginput quantity pembelian
3. Sistem menghitung total harga
4. Checkout dilakukan
5. Sistem mengurangi stok otomatis
6. Receipt dicetak
7. Transaksi masuk ke history dan laporan

---

# Candidate Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth/Auth.js |
| Cloud Platform | Microsoft Azure |
| File Storage | Azure Blob Storage |

---

# Cloud Architecture Plan

## Azure Services
- Azure App Service untuk deployment web app
- Azure Database for PostgreSQL
- Azure Blob Storage untuk upload foto produk

---

# Non Functional Requirements

## Security
- Authentication login
- Password hashing
- Role-based access

---

## Performance
- Responsive UI
- Fast transaction processing

---

## Availability
- Sistem dapat diakses online

---

## Scalability
- Mendukung pengembangan fitur di masa depan

---

# Future Development

## Future Features
- Barcode scanner
- Export laporan PDF
- Dashboard analytics
- Multi branch support
- AI demand prediction
- Email notification stok menipis

---

# Prioritas MVP

Fitur utama yang wajib selesai:
- Authentication
- CRUD produk
- Stock management
- POS transaction
- Reporting sederhana
- Deployment cloud Azure

---

# Tantangan Utama Sistem

- Sinkronisasi stok realtime
- Konsistensi transaksi
- Pengurangan stok otomatis
- Riwayat perubahan stok
- Role authorization