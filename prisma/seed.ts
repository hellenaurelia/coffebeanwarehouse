import { PrismaClient, Role, BeanType, POStatus, PaymentMethod, TrxStatus, StockLogType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
});


async function main() {
  console.log("Mulai proses seeding... 🌱");
  console.log("Menghapus data lama (jika ada)...");
  
  const defaultPassword = await bcrypt.hash("arunika123", 10);

  // Bersihkan database agar tidak bentrok kalau di-run berkali-kali
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.pOItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // 1. SEED USERS (Dari SEED_USERS)
  // ==========================================
  console.log("Menyuntikkan data User...");
  const usersData = [
    { name: "Arif Rahman", email: "arif@arunika.id", role: Role.OWNER, isActive: true },
    { name: "Dewi Lestari", email: "dewi@arunika.id", role: Role.KASIR, isActive: true },
    { name: "Budi Santoso", email: "budi@arunika.id", role: Role.GUDANG, isActive: true },
    { name: "Siti Rahayu", email: "siti@arunika.id", role: Role.MANAJER, isActive: true },
    { name: "Fajar Nugroho", email: "fajar@arunika.id", role: Role.MANAJER, isActive: false },
    { name: "Rina Kusuma", email: "rina@arunika.id", role: Role.KASIR, isActive: true },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: defaultPassword, // Dummy password
        role: u.role,
        isActive: u.isActive
      }
    });
    // Simpan referensi ID berdasarkan nama untuk dipakai di relasi bawahnya
    createdUsers[u.name.split(" ")[0]] = user.id; 
  }
  
  const adminId = createdUsers["Arif"]; // Arif sebagai default creator

  // ==========================================
  // 2. SEED SUPPLIERS (Dari initSuppliers)
  // ==========================================
  console.log("Menyuntikkan data Supplier...");
  const suppliersData = [
    { name: "Koperasi Tani Gayo", picName: "Pak Munir", region: "Aceh Tengah", phone: "+62 856-4392-5109", email: "munir@gayotani.id", address: "Jl. Raya Bebesen No.12, Aceh Tengah", notes: "Supplier utama arabica premium. Min order 100kg.", isActive: true },
    { name: "Kintamani Highland", picName: "Bu Wayan", region: "Bangli, Bali", phone: "+62 856-4392-5109", email: "wayan@kintamani.co", address: "Desa Batur, Kintamani, Bangli", notes: "Musim panen April–Juni. Kualitas konsisten.", isActive: true },
    { name: "Toraja Coffee Hub", picName: "Pak Reynaldi", region: "Tana Toraja", phone: "+62 856-4392-5109", email: "rey@torajacoffee.id", address: "Jl. Pongtiku 45, Rantepao, Tana Toraja", notes: null, isActive: true },
    { name: "Lampung Robusta Mills", picName: "Pak Hendra", region: "Lampung Barat", phone: "+62 856-4392-5109", email: "hendra@lrm.id", address: "Kawasan Industri Way Laga, Lampung Barat", notes: "Lead time 3 hari kerja. Harga negotiable untuk >500kg.", isActive: true },
    { name: "Civet Farm Lampung", picName: "Pak Jaka", region: "Liwa, Lampung", phone: "+62 856-4392-5109", email: "jaka@civetfarm.id", address: "Desa Sukaraja, Liwa, Lampung Barat", notes: "Produksi terbatas 5–10kg/minggu.", isActive: true },
    { name: "Preanger Estate", picName: "Bu Salma", region: "Garut, Jawa Barat", phone: "+62 856-4392-5109", email: "salma@preanger.id", address: "Perkebunan Cikajang, Garut", notes: "Menunggu verifikasi dokumen BPOM.", isActive: false },
    { name: "Riau Liberica Co", picName: "Pak Daud", region: "Meranti, Riau", phone: "+62 856-4392-5109", email: "daud@liberica.id", address: "Jl. Merbau No.7, Selat Panjang, Riau", notes: null, isActive: false },
  ];

  const createdSuppliers: Record<string, any> = {};
  for (const s of suppliersData) {
    const sup = await prisma.supplier.create({
      data: { ...s, createdById: adminId }
    });
    createdSuppliers[s.name] = sup.id;
  }

  // ==========================================
  // 3. SEED PRODUCTS & PIVOT (Gabungan Inventory & Beans)
  // ==========================================
  console.log("Menyuntikkan data Biji Kopi & HPP...");
  const productsData = [
    { sku: "GYO-WN-001", name: "Gayo Wine Natural", sellPrice: 280000, buyPrice: 165000, stockKg: 142, sup: "Koperasi Tani Gayo" },
    { sku: "KIN-HN-002", name: "Kintamani Honey", sellPrice: 240000, buyPrice: 140000, stockKg: 38, sup: "Kintamani Highland" },
    { sku: "TRJ-SP-003", name: "Toraja Sapan", sellPrice: 310000, buyPrice: 180000, stockKg: 96, sup: "Toraja Coffee Hub" },
    { sku: "LWK-PR-004", name: "Luwak Premium", sellPrice: 1250000, buyPrice: 780000, stockKg: 8, sup: "Civet Farm Lampung" },
    { sku: "LMP-RB-005", name: "Lampung Robusta AAA", sellPrice: 145000, buyPrice: 78000, stockKg: 220, sup: "Lampung Robusta Mills" },
    { sku: "LBR-MR-006", name: "Liberica Meranti", sellPrice: 185000, buyPrice: 105000, stockKg: 24, sup: "Riau Liberica Co" },
    { sku: "ETH-YG-007", name: "Ethiopia Yirgacheffe", sellPrice: 420000, buyPrice: 300000, stockKg: 12, sup: "Koperasi Tani Gayo" },
    { sku: "JAV-PR-008", name: "Java Preanger", sellPrice: 220000, buyPrice: 105000, stockKg: 168, sup: "Preanger Estate" },
    { sku: "BKL-RB-009", name: "Bengkulu Robusta Fine", sellPrice: 165000, buyPrice: 52000, stockKg: 188, sup: "Lampung Robusta Mills" },
    { sku: "FLS-BJ-010", name: "Flores Bajawa", sellPrice: 260000, buyPrice: 150000, stockKg: 72, sup: "Kintamani Highland" },
  ];

  const createdProducts: Record<string, any> = {};
  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        type: BeanType.WHOLE_BEAN,
        sellPrice: p.sellPrice,
        stockKg: p.stockKg,
        minStockKg: 25,
        createdById: adminId,
        supplierProducts: {
          create: {
            supplierId: createdSuppliers[p.sup],
            buyPricePerKg: p.buyPrice
          }
        }
      }
    });
    createdProducts[p.name] = { id: prod.id, buyPrice: p.buyPrice, sellPrice: p.sellPrice };
  }

  // ==========================================
  // 4. SEED PURCHASE ORDERS (Dari initPOs)
  // ==========================================
  console.log("Menyuntikkan data Purchase Order...");
  const poData = [
    { poNumber: "PO-0041", supName: "Koperasi Tani Gayo", status: POStatus.DIKIRIM, prodName: "Gayo Wine Natural", qty: 50, price: 180000, creator: createdUsers["Arif"] },
    { poNumber: "PO-0040", supName: "Lampung Robusta Mills", status: POStatus.DITERIMA, prodName: "Lampung Robusta AAA", qty: 300, price: 48000, creator: createdUsers["Arif"] },
    { poNumber: "PO-0039", supName: "Kintamani Highland", status: POStatus.DITERIMA, prodName: "Kintamani Honey", qty: 150, price: 120000, creator: createdUsers["Arif"] },
    { poNumber: "PO-0038", supName: "Toraja Coffee Hub", status: POStatus.DITERIMA, prodName: "Toraja Sapan", qty: 100, price: 110000, creator: createdUsers["Budi"] },
    { poNumber: "PO-0037", supName: "Civet Farm Lampung", status: POStatus.DITERIMA, prodName: "Luwak Premium", qty: 10, price: 850000, creator: createdUsers["Budi"] },
    { poNumber: "PO-0036", supName: "Preanger Estate", status: POStatus.PENDING, prodName: "Java Preanger", qty: 200, price: 105000, creator: createdUsers["Budi"] },
  ];

  for (const po of poData) {
    await prisma.purchaseOrder.create({
      data: {
        poNumber: po.poNumber,
        supplierId: createdSuppliers[po.supName],
        status: po.status,
        totalAmount: po.qty * po.price,
        createdById: po.creator,
        items: {
          create: {
            productId: createdProducts[po.prodName].id,
            qtyKg: po.qty,
            buyPricePerKg: po.price,
            subtotal: po.qty * po.price
          }
        }
      }
    });
  }

  // ==========================================
  // 5. SEED TRANSACTIONS (Dari data POS)
  // ==========================================
  console.log("Menyuntikkan data Transaksi Kasir...");
  const trxData = [
    { trxNumber: "TRX-2050", method: PaymentMethod.QRIS, cashier: "Arif", total: 414000, items: [{ name: "Java Preanger", qty: 3 }] },
    { trxNumber: "TRX-2049", method: PaymentMethod.QRIS, cashier: "Rina", total: 184000, items: [{ name: "Gayo Wine Natural", qty: 1 }] },
    { trxNumber: "TRX-2048", method: PaymentMethod.CASH, cashier: "Arif", total: 240000, items: [{ name: "Kintamani Honey", qty: 1 }] },
    { trxNumber: "TRX-2047", method: PaymentMethod.CARD, cashier: "Dewi", total: 198000, items: [{ name: "Toraja Sapan", qty: 1 }] },
    { trxNumber: "TRX-2046", method: PaymentMethod.QRIS, cashier: "Rina", total: 92000, items: [{ name: "Lampung Robusta AAA", qty: 1 }] },
    { trxNumber: "TRX-2045", method: PaymentMethod.CASH, cashier: "Arif", total: 528000, items: [{ name: "Ethiopia Yirgacheffe", qty: 1 }, { name: "Liberica Meranti", qty: 1 }] },
    { trxNumber: "TRX-2044", method: PaymentMethod.CARD, cashier: "Dewi", total: 312000, items: [{ name: "Flores Bajawa", qty: 1 }] },
    { trxNumber: "TRX-2043", method: PaymentMethod.QRIS, cashier: "Rina", total: 124000, items: [{ name: "Bengkulu Robusta Fine", qty: 1 }] },
    { trxNumber: "TRX-2042", method: PaymentMethod.CASH, cashier: "Arif", total: 376000, items: [{ name: "Gayo Wine Natural", qty: 1 }, { name: "Toraja Sapan", qty: 1 }] },
  ];

  for (const trx of trxData) {
    let totalCogs = 0;
    let grossProfit = 0;
    
    // Siapkan detail items untuk transaksi ini
    const itemsToCreate = trx.items.map(item => {
      const prod = createdProducts[item.name];
      const subtotal = prod.sellPrice * item.qty;
      const profit = (prod.sellPrice - prod.buyPrice) * item.qty;
      totalCogs += (prod.buyPrice * item.qty);
      grossProfit += profit;

      return {
        productId: prod.id,
        qtyKg: item.qty,
        sellPricePerKg: prod.sellPrice,
        buyPricePerKg: prod.buyPrice,
        subtotal: subtotal,
        profit: profit
      };
    });

    await prisma.transaction.create({
      data: {
        trxNumber: trx.trxNumber,
        paymentMethod: trx.method,
        status: TrxStatus.PAID,
        totalAmount: trx.total, // Dari dummy total
        totalCogs: totalCogs,
        grossProfit: grossProfit,
        cashierId: createdUsers[trx.cashier],
        paidAt: new Date(),
        items: {
          create: itemsToCreate
        }
      }
    });
  }

  console.log("==========================================");
  console.log("Seeding SUPER LENGKAP sukses selesai! 🎉🚀");
  console.log("Database Arunika sekarang memiliki nyawa!");
}

main()
  .catch((e) => {
    console.error("Ada error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });