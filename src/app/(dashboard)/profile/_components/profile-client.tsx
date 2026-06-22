"use client";

import { createContext, useContext, useState } from "react";
import { Topbar } from "@/components/topbar";
import { ProfileHeader } from "./profile-header";
import { ActivityStats } from "./activity-stats";
import { RecentActivity } from "./recent-activity";
import { SettingsPanel } from "./settings-panel";

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

export default function ProfileClient({ initialUser }: { initialUser: UserData }) {
  const [user, setUser] = useState<UserData>(initialUser);

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