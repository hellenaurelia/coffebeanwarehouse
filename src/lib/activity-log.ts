import "server-only";
import { prisma } from "@/lib/prisma";

type LogInput = {

  actorId?: string;

  action: string;

  entityType: string;

  entityId?: string | null;

  payload?: unknown;
};

export async function logActivity(input: LogInput): Promise<void> {
  try {
    let userId = input.actorId;

    if (!userId) {

      const { getCurrentUser } = await import("@/lib/auth/session");
      const user = await getCurrentUser();
      userId = user?.id;
    }

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

    console.error("[activity-log] gagal menulis log:", err);
  }
}