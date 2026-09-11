import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'san-tasikmalaya-super-secret-key-2026',
    });

    const userRole = (token as any)?.role || 'user';

    // Block unauthenticated users or users with regular 'user' role
    if (!token || (userRole !== 'super_admin' && userRole !== 'admin')) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'AccessDenied');
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Super Admin only routes: /admin/stats and /admin/users
    if ((path.startsWith('/admin/stats') || path.startsWith('/admin/users')) && userRole !== 'super_admin') {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // Attach client metadata headers for server actions or downstream processing
  const response = NextResponse.next();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const ua = req.headers.get('user-agent') || 'Unknown';
  response.headers.set('x-client-ip', ip);
  response.headers.set('x-client-ua', ua);

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
