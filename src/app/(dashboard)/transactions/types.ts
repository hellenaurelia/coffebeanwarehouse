export type Method = "Cash" | "Kartu" | "QRIS";

export type TrxItem = {
  name: string;
  qty: number;
  price: number;
  grind: "whole" | "ground"; 
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