import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const secret = process.env.NEXTAUTH_SECRET || 'san-tasikmalaya-super-secret-key-2026';

    // Robust token retrieval checking both secure and non-secure cookie prefixes
    let token = await getToken({
      req,
      secret,
      secureCookie: true,
      cookieName: '__Secure-next-auth.session-token',
    });

    if (!token) {
      token = await getToken({
        req,
        secret,
        secureCookie: false,
        cookieName: 'next-auth.session-token',
      });
    }

    if (!token) {
      token = await getToken({
        req,
        secret,
      });
    }

    const userRole = (token as any)?.role || 'user';

    // If already authenticated and accessing login portal, redirect based on role
    if ((path === '/admin/login' || path === '/login') && token) {
      if (userRole === 'super_admin' || userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If not authenticated, redirect to login with return callbackUrl
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in as regular user without admin rights, seamlessly redirect to homepage
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
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
  matcher: ['/admin/:path*', '/login'],
};
