import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS Kopi Warehouse",
  description: "Sistem Manajemen Kasir dan Gudang Biji Kopi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} min-h-screen bg-soft-bg text-slate-800 antialiased`}
      >
        <SidebarProvider>
          <AppSidebar />

          <main className="flex-1">
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}