import type { Product } from "./types";

export const products: Product[] = [
  { id:"p1", name:"Gayo Wine Natural",    supplier:"Koperasi Tani Gayo",    price:92000,  tag:"Arabica"  },
  { id:"p2", name:"Kintamani Honey",      supplier:"Kintamani Highland",    price:78000,  tag:"Arabica"  },
  { id:"p3", name:"Toraja Sapan",         supplier:"Toraja Coffee Hub",     price:98000,  tag:"Arabica"  },
  { id:"p4", name:"Ethiopia Yirgacheffe", supplier:"",                      price:124000, tag:"Arabica"  }, 
  { id:"p5", name:"Lampung Robusta AAA",  supplier:"Lampung Robusta Mills", price:86000,  tag:"Robusta"  },
  { id:"p6", name:"Bengkulu Robusta Fine",supplier:"",                      price:52000,  tag:"Robusta"  },
  { id:"p7", name:"Liberica Meranti",     supplier:"Riau Liberica Co",      price:64000,  tag:"Liberica" },
  { id:"p8", name:"Luwak Premium",        supplier:"Civet Farm Lampung",    price:175000, tag:"Luwak"    },
  { id:"p9", name:"Java Preanger",        supplier:"Preanger Estate",       price:138000, tag:"Arabica"  },
];

export const cats = ["Semua","Arabica","Robusta","Liberica","Luwak"];
export const NOMINALS = [50000, 100000, 150000, 200000, 500000, 1000000];
export const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

export function getShift(): string {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 14 ? "Shift Pagi" : "Shift Sore";
}