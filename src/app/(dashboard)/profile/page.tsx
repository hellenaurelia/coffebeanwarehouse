"use client";

import { createContext, useContext, useState } from "react";
import { Topbar } from "@/components/topbar";
import { ProfileHeader } from "./_components/profile-header";
import { ActivityStats } from "./_components/activity-stats";
import { RecentActivity } from "./_components/recent-activity";
import { SettingsPanel } from "./_components/settings-panel";

export interface UserData {
  name: string;
  role: string;
  outlet: string;
  email: string;
  joinDate: string;
  avatar: string;
  status: "aktif" | "nonaktif";
}

interface UserContextType {
  user: UserData;
  setUser: (u: UserData) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}

const INITIAL_USER: UserData = {
  name: "Arif Rahman",
  role: "owner",
  outlet: "senopati",
  email: "arif@arunika.id",
  joinDate: "Maret 2024",
  avatar: "AR",
  status: "aktif",
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData>(INITIAL_USER);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Topbar title="Profil" subtitle="Informasi akun & pengaturan preferensi" />

      <main className="flex-1 p-6 space-y-6">
        <ProfileHeader user={user} />
        <ActivityStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SettingsPanel />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </main>
    </UserContext.Provider>
  );
}