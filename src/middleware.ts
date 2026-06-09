import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pastikan kamu menggunakan 'export function middleware'
export function middleware(request: NextRequest) {
  // Tulis logika middleware kamu di sini (misal: cek token, redirect, dll)
  
  // Lanjutkan request ke tujuan aslinya
  return NextResponse.next();
}

// Opsional: Gunakan config matcher jika kamu hanya ingin middleware 
// ini berjalan di route tertentu saja
export const config = {
  matcher: [
    /*
     * Match semua request path kecuali untuk:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};