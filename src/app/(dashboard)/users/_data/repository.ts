// Server-only read layer for the Users feature.
import { prisma } from "@/lib/prisma";
import { mapUser, type DbUserRow } from "./mappers";
import type { User } from "../_lib/types";

const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  outlet: true,
  isActive: true,
  lastLoginAt: true,
} as const;

export async function getUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: userSelect,
  });
  return (rows as DbUserRow[]).map(mapUser);
}
