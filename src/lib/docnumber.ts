import "server-only";
import type { Prisma } from "@prisma/client";

/**
 * Tanggal "hari ini" menurut zona waktu WIB (Asia/Jakarta), dikembalikan
 * sebagai string YYYYMMDD. Ini dipakai sebagai bagian tengah nomor dokumen
 * sehingga reset nomor urut mengikuti tanggal kalender lokal tim, bukan UTC.
 *
 * Contoh: 22 Juni 2026 pukul 03:00 WIB -> "20260622"
 * (walaupun secara UTC saat itu masih 21 Juni pukul 20:00).
 */
export function todayWIB(now: Date = new Date()): string {
  // en-CA menghasilkan format YYYY-MM-DD; timeZone memaksa perhitungan ke WIB.
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return ymd.replace(/-/g, ""); // "2026-06-22" -> "20260622"
}

/**
 * Menghasilkan nomor dokumen berurutan, mudah dibaca manusia, yang reset
 * setiap hari (WIB). Format: PREFIX-YYYYMMDD-NNNN  (mis. TRX-20260622-0001).
 *
 * Nomor urut dihitung dengan MENCARI dokumen terakhir yang prefix tanggalnya
 * sama dengan hari ini, lalu mengambil 4 digit terakhir + 1. Pendekatan ini
 * aman terhadap format bertanggal — berbeda dengan replace(/\D/g,"") yang akan
 * menggabungkan tanggal dan urutan menjadi satu angka besar yang salah.
 *
 * @param tx     Prisma transaction client (WAJIB dipanggil di dalam $transaction
 *               agar pembacaan "terakhir" dan penulisan baru bersifat atomik).
 * @param prefix "TRX" | "PO" | dst.
 * @param findLast  Fungsi yang mengembalikan nomor terakhir untuk prefix harian
 *                  tertentu (atau null bila belum ada hari ini).
 */
export async function nextDocNumber(
  prefix: string,
  findLast: (datePrefix: string) => Promise<string | null>,
): Promise<string> {
  const datePart = todayWIB();
  const fullPrefix = `${prefix}-${datePart}-`; // "TRX-20260622-"

  const last = await findLast(fullPrefix);

  let seq = 0;
  if (last) {
    // Ambil HANYA 4 digit terakhir (nomor urut), bukan seluruh angka.
    const tail = last.slice(fullPrefix.length); // "0007"
    seq = parseInt(tail, 10) || 0;
  }

  const nextSeq = String(seq + 1).padStart(4, "0");
  return `${fullPrefix}${nextSeq}`; // "TRX-20260622-0008"
}

/**
 * Helper Prisma `where` untuk mencari dokumen dengan prefix tanggal tertentu,
 * diurutkan menurun agar elemen pertama adalah nomor urut tertinggi hari ini.
 *
 * Karena format zero-padded (NNNN) dan panjang prefix tetap, urutan string
 * "desc" identik dengan urutan numerik untuk hari yang sama.
 */
export function dailyPrefixFilter(
  fullPrefix: string,
): { startsWith: string } {
  return { startsWith: fullPrefix };
}

export type { Prisma };