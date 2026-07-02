import type { Role, Status, Outlet, User } from "../_lib/types";
import type { Role as PrismaRole } from "@prisma/client";
import { initials } from "../_lib/constants";

const DB_TO_UI_ROLE: Record<string, Role> = {
  OWNER: "owner",
  MANAJER: "manajer",
  KASIR: "kasir",
  GUDANG: "gudang",
};

const UI_TO_DB_ROLE: Record<Role, PrismaRole> = {
  owner: "OWNER",
  manajer: "MANAJER",
  kasir: "KASIR",
  gudang: "GUDANG",
};

export function roleToUi(dbRole: string): Role {
  return DB_TO_UI_ROLE[dbRole] ?? "kasir";
}

export function roleToDb(uiRole: Role): PrismaRole {
  return UI_TO_DB_ROLE[uiRole] ?? "KASIR";
}

export function statusToUi(isActive: boolean): Status {
  return isActive ? "aktif" : "nonaktif";
}

export function statusToDbIsActive(status: Status): boolean {
  return status === "aktif";
}

export function outletToUi(dbOutlet: string | null): Outlet {
  return dbOutlet === "Senopati" ? "Senopati" : "Senopati";
}

const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatLastLogin(d: Date | null): string {
  if (!d) return "Belum pernah masuk";

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const time = `${pad2(d.getHours())}.${pad2(d.getMinutes())}`;

  if (sameDay) return `Hari ini, ${time}`;
  if (isYesterday) return `Kemarin, ${time}`;
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time}`;
}

export function deriveUsername(email: string, username: string | null): string {
  if (username && username.trim()) return username;
  return email.split("@")[0] ?? email;
}

export type DbUserRow = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  outlet: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
};

export function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    name: row.name,
    username: deriveUsername(row.email, row.username),
    email: row.email,
    role: roleToUi(row.role),
    outlet: outletToUi(row.outlet),
    status: statusToUi(row.isActive),
    lastLogin: formatLastLogin(row.lastLoginAt),
    avatar: initials(row.name),
  };
}