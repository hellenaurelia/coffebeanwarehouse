import type { Product } from "./types";

export const cats = [
  "Semua",
  "Arabica",
  "Robusta",
  "Liberica",
  "Luwak",
];

export const NOMINALS = [
  50000,
  100000,
  150000,
  200000,
  500000,
  1000000,
];

export const fmt = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export function getShift() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 14
    ? "Shift Pagi"
    : "Shift Sore";
}