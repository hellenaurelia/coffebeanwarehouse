export type Method = "Cash" | "Kartu" | "QRIS";

export type TrxItem = {
  name: string;
  qty: number;
  price: number;
};

export type Trx = {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: number;
  total: number;
  cashPaid?: number;
  method: Method;
  detail: TrxItem[];
};

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

export const data: Trx[] = [
  {
    id: "TRX-2050",
    date: "9 Mei 2026",
    time: "10:42",
    cashier: "Arif R.",
    items: 3,
    total: 414000,
    method: "QRIS",
    detail: [
      { name: "Cappuccino", qty: 2, price: 43243 },
      { name: "Croissant Butter", qty: 1, price: 34234 },
      { name: "Cold Brew 500ml", qty: 2, price: 130631 },
    ],
  },
  {
    id: "TRX-2049",
    date: "9 Mei 2026",
    time: "10:31",
    cashier: "Sari N.",
    items: 2,
    total: 184000,
    method: "QRIS",
    detail: [
      { name: "Latte", qty: 2, price: 82883 },
      { name: "Banana Bread", qty: 1, price: 32432 },
    ],
  },
  {
    id: "TRX-2048",
    date: "9 Mei 2026",
    time: "10:18",
    cashier: "Arif R.",
    items: 1,
    total: 240000,
    cashPaid: 300000,
    method: "Cash",
    detail: [{ name: "Pour Over (Single Origin)", qty: 2, price: 108108 }],
  },
  {
    id: "TRX-2047",
    date: "9 Mei 2026",
    time: "09:54",
    cashier: "Bayu P.",
    items: 2,
    total: 198000,
    method: "Kartu",
    detail: [
      { name: "Flat White", qty: 1, price: 46847 },
      { name: "Avocado Toast", qty: 1, price: 68468 },
      { name: "Sparkling Water", qty: 1, price: 25225 },
    ],
  },
  {
    id: "TRX-2046",
    date: "9 Mei 2026",
    time: "09:33",
    cashier: "Sari N.",
    items: 1,
    total: 92000,
    method: "QRIS",
    detail: [{ name: "Latte", qty: 2, price: 41441 }],
  },
  {
    id: "TRX-2045",
    date: "9 Mei 2026",
    time: "09:11",
    cashier: "Arif R.",
    items: 4,
    total: 528000,
    cashPaid: 530000,
    method: "Cash",
    detail: [
      { name: "Americano", qty: 2, price: 35135 },
      { name: "Espresso Tonic", qty: 2, price: 49550 },
      { name: "Overnight Oats", qty: 2, price: 76577 },
      { name: "Mineral Water", qty: 2, price: 16216 },
    ],
  },
  {
    id: "TRX-2044",
    date: "8 Mei 2026",
    time: "20:48",
    cashier: "Bayu P.",
    items: 2,
    total: 312000,
    method: "Kartu",
    detail: [
      { name: "Cold Brew 500ml", qty: 2, price: 130631 },
      { name: "Almond Croissant", qty: 1, price: 37838 },
    ],
  },
  {
    id: "TRX-2043",
    date: "8 Mei 2026",
    time: "20:22",
    cashier: "Sari N.",
    items: 1,
    total: 124000,
    method: "QRIS",
    detail: [
      { name: "Cappuccino", qty: 1, price: 43243 },
      { name: "Kouign-Amann", qty: 1, price: 41441 },
    ],
  },
  {
    id: "TRX-2042",
    date: "8 Mei 2026",
    time: "19:57",
    cashier: "Arif R.",
    items: 3,
    total: 376000,
    cashPaid: 380000,
    method: "Cash",
    detail: [
      { name: "Pour Over (Single Origin)", qty: 1, price: 108108 },
      { name: "Latte", qty: 1, price: 41441 },
      { name: "Smashed Avocado", qty: 1, price: 79280 },
    ],
  },
];
