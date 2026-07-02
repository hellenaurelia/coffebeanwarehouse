import "server-only";
import type { Prisma } from "@prisma/client";

export function todayWIB(now: Date = new Date()): string {

  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return ymd.replace(/-/g, ""); 
}

export async function nextDocNumber(
  prefix: string,
  findLast: (datePrefix: string) => Promise<string | null>,
): Promise<string> {
  const datePart = todayWIB();
  const fullPrefix = `${prefix}-${datePart}-`; 

  const last = await findLast(fullPrefix);

  let seq = 0;
  if (last) {
    const tail = last.slice(fullPrefix.length); 
    seq = parseInt(tail, 10) || 0;
  }

  const nextSeq = String(seq + 1).padStart(4, "0");
  return `${fullPrefix}${nextSeq}`; 
}

export function dailyPrefixFilter(
  fullPrefix: string,
): { startsWith: string } {
  return { startsWith: fullPrefix };
}

export type { Prisma };