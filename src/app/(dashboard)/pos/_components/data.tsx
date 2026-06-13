import type { Product } from "./types";

export const products: Product[] = [
  { id:"p1", name:"Gayo Wine Natural",      variant:"250g", price:92000,  tag:"Arabica"  },
  { id:"p2", name:"Kintamani Honey",         variant:"250g", price:78000,  tag:"Arabica"  },
  { id:"p3", name:"Toraja Sapan",            variant:"250g", price:98000,  tag:"Arabica"  },
  { id:"p4", name:"Ethiopia Yirgacheffe",    variant:"200g", price:124000, tag:"Arabica"  },
  { id:"p5", name:"Lampung Robusta AAA",     variant:"500g", price:86000,  tag:"Robusta"  },
  { id:"p6", name:"Bengkulu Robusta Fine",   variant:"250g", price:52000,  tag:"Robusta"  },
  { id:"p7", name:"Liberica Meranti",        variant:"250g", price:64000,  tag:"Liberica" },
  { id:"p8", name:"Luwak Premium",           variant:"100g", price:175000, tag:"Luwak"    },
  { id:"p9", name:"Java Preanger",           variant:"500g", price:138000, tag:"Arabica"  },
];

export const cats = ["Semua","Arabica","Robusta","Liberica","Luwak"];
export const NOMINALS = [50000, 100000, 150000, 200000, 500000, 1000000];
export const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

export function getShift(): string {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 14 ? "Shift Pagi" : "Shift Sore";
}