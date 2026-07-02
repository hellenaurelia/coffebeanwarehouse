import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Helper terpusat untuk menulis ActivityLog.
 *
 * Dipanggil dari server action mana pun setelah aksi penting berhasil.
 * Sengaja "best-effort": kalau logging gagal, TIDAK boleh menggagalkan
 * aksi utama (mis. checkout tetap sukses walau log gagal ditulis).
 *
 * Catatan: pemanggil bebas memberi `actorId`. Kalau tidak diberi, helper
 * akan mencoba mengambil user dari sesi. Kalau tetap tidak ada, log dilewati
 * (karena kolom userId wajib di schema).
 */

type LogInput = {
  /** id user pelaku. Kalau ada, dipakai langsung tanpa query sesi lagi. */
  actorId?: string;
  /** verba singkat, mis. "SUPPLIER_CREATE", "PO_RECEIVE", "CHECKOUT". */
  action: string;
  /** tipe entitas, mis. "Supplier", "Product", "PurchaseOrder", "Transaction". */
  entityType: string;
  /** id entitas terkait (opsional). */
  entityId?: string | null;
  /** data tambahan bebas (opsional) — disimpan sebagai JSON. */
  payload?: unknown;
};

export async function logActivity(input: LogInput): Promise<void> {
  try {
    let userId = input.actorId;

    // Fallback: ambil dari sesi kalau actorId tidak diberikan.
    if (!userId) {
      // import dinamis biar helper ini aman dipakai di konteks non-request.
      const { getCurrentUser } = await import("@/lib/auth/session");
      const user = await getCurrentUser();
      userId = user?.id;
    }

    // Kolom user_id wajib (non-null) di schema. Tanpa user, lewati saja.
    if (!userId) return;

    await prisma.activityLog.create({
      data: {
        userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        payload:
          input.payload === undefined
            ? undefined
            : (input.payload as object),
      },
    });
  } catch (err) {
    // Best-effort: jangan pernah melempar dari sini.
    console.error("[activity-log] gagal menulis log:", err);
  }
}