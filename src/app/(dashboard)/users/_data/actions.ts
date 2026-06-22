"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { Role as PrismaRole } from "@prisma/client";
import { requireUser } from "@/lib/auth/session";
import {
  roleToDb,
  statusToDbIsActive,
  mapUser,
  type DbUserRow,
} from "./mappers";
import type { User, UserForm } from "../_lib/types";

const USERS_PATH = "/users";
const BCRYPT_ROUNDS = 10;

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

// ============================================================================
// CREATE
// ============================================================================
export async function createUserAction(form: UserForm): Promise<User> {
  await requireUser(); // only authenticated users can manage users

  const email = form.email.trim().toLowerCase();
  if (!form.name || !form.username || !email || !form.password) {
    throw new Error("Nama, username, email, dan password wajib diisi.");
  }

  // Reject duplicate email up front for a clean error message.
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Email ${email} sudah digunakan.`);
  }

  const passwordHash = await bcrypt.hash(form.password, BCRYPT_ROUNDS);

  const created = await prisma.user.create({
    data: {
      name: form.name,
      username: form.username,
      email,
      passwordHash,
      role: roleToDb(form.role),
      outlet: form.outlet,
      isActive: statusToDbIsActive(form.status),
    },
    select: userSelect,
  });

  revalidatePath(USERS_PATH);
  return mapUser(created as DbUserRow);
}

// ============================================================================
// UPDATE (password optional — only changed when provided)
// ============================================================================
export async function updateUserAction(
  id: string,
  form: UserForm
): Promise<User> {
  await requireUser();

  const email = form.email.trim().toLowerCase();
  if (!form.name || !form.username || !email) {
    throw new Error("Nama, username, dan email wajib diisi.");
  }

  // Guard against email collisions with a different user.
  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    throw new Error(`Email ${email} sudah digunakan pengguna lain.`);
  }

  const data: {
    name: string;
    username: string;
    email: string;
    role: PrismaRole;
    outlet: string;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name: form.name,
    username: form.username,
    email,
    role: roleToDb(form.role),
    outlet: form.outlet,
    isActive: statusToDbIsActive(form.status),
  };

  if (form.password && form.password.trim()) {
    data.passwordHash = await bcrypt.hash(form.password, BCRYPT_ROUNDS);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  revalidatePath(USERS_PATH);
  return mapUser(updated as DbUserRow);
}

export async function deleteUserAction(id: string): Promise<void> {
  const actor = await requireUser();
  if (actor.id === id) {
    throw new Error("Tidak bisa menghapus akun yang sedang login.");
  }

  // If the user has no dependent records, a real delete is safe and keeps the
  // list clean. Otherwise fall back to deactivation.
  const refs = await prisma.purchaseOrder.count({ where: { createdById: id } });
  const supRefs = await prisma.supplier.count({ where: { createdById: id } });

  if (refs === 0 && supRefs === 0) {
    try {
      await prisma.user.delete({ where: { id } });
      revalidatePath(USERS_PATH);
      return;
    } catch {
      // Fall through to soft-delete if any other relation blocks it.
    }
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath(USERS_PATH);
}