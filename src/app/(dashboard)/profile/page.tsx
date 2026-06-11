"use client";

import { Topbar } from "@/components/topbar";
import { ProfileHeader } from "./_components/profile-header";
import { ActivityStats } from "./_components/activity-stats";
import { RecentActivity } from "./_components/recent-activity";
import { SettingsPanel } from "./_components/settings-panel";

const CURRENT_USER = {
  name: "Arif Rahman",
  role: "owner",
  outlet: "Senopati",
  email: "arif@arunika.id",
  joinDate: "Maret 2024",
  avatar: "AR",
  status: "aktif" as const,
};

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Profil" subtitle="Informasi akun & pengaturan preferensi" />

      <main className="flex-1 p-6 space-y-6">
        {/* Hero card */}
        <ProfileHeader user={CURRENT_USER} />

        {/* Activity stats */}
        <ActivityStats />

        {/* Main content: settings left, activity right */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings — 2/3 */}
          <div className="lg:col-span-2">
            <SettingsPanel />
          </div>

          {/* Activity feed — 1/3 */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </main>
    </>
  );
}