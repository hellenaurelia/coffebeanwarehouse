// Server component: resolves the logged-in user and hands it to the client UI.
// The visual component (profile-client.tsx) keeps the original JSX intact.

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import ProfileClient, { type UserData } from "./_components/profile-client";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "owner",
  MANAJER: "manajer",
  KASIR: "kasir",
  GUDANG: "gudang",
};

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const row = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { id: true, name: true, username: true, email: true, role: true, isActive: true, createdAt: true },
  });

  const initialUser: UserData = {
    id: row.id,
    name: row.name,
    username: row.username ?? "",
    role: ROLE_LABEL[row.role] ?? row.role.toLowerCase(),
    outlet: "senopati",
    email: row.email,
    joinDate: `${ID_MONTHS[row.createdAt.getMonth()]} ${row.createdAt.getFullYear()}`,
    avatar: initials(row.name),
    status: row.isActive ? "aktif" : "nonaktif",
  };

  return <ProfileClient initialUser={initialUser} />;
}