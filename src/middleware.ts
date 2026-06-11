import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Halaman yang bisa diakses tanpa login
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah ini public route
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Ambil token dari cookie (sesuaikan nama cookie dengan auth library yang dipakai)
  const token = request.cookies.get('arunika_session')?.value;

  // Jika belum login dan mencoba akses halaman protected → redirect ke login
  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // simpan halaman asal
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba akses /login → redirect ke dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua request path kecuali:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - file-file publik (png, jpg, svg, dll)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)).*)',
  ],
};