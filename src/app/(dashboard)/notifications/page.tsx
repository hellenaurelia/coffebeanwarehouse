// Server component: menetapkan render dinamis (melewati prerender statis yang
// bermasalah dengan SidebarProvider) lalu me-render UI client tanpa perubahan.

import NotificationsClient from "./notifications-client";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return <NotificationsClient />;
}