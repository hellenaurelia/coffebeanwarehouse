import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto h-svh">
        {children}
      </main>
    </SidebarProvider>
  );
}