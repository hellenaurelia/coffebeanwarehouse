import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.className} min-h-screen flex flex-col items-center justify-center bg-soft-bg text-slate-800 antialiased`}>
        {/* Kontainer utama dibatasi lebarnya dan diposisikan pas di tengah */}
        <main className="w-full max-w-6xl p-6 flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}