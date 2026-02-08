
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Defined Public Paths (Always accessible)
    // - /admin/login (The gate)
    // - /room/ (Feedback flow for participants)
    // - /api/submit (Submission endpoint)
    // - /api/rooms/*/config (Public config for feedback forms)
    // - Static assets (_next, favicon, images)

    // Helper to check if public
    const isPublic =
        path === '/admin/login' ||
        path.startsWith('/room/') && !path.includes('/analysis') || // Feedback pages public, Analysis protected
        path.startsWith('/api/rooms/') && path.endsWith('/config') ||
        path === '/api/submit' ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path === '/favicon.ico' ||
        path.match(/\.(png|jpg|jpeg|svg|gif|webp)$/);

    // 2. Check for Admin Auth Cookie
    const adminUser = request.cookies.get('admin_user')?.value;

    // 3. Logic
    if (!isPublic && !adminUser) {
        // Redirect unauthenticated users to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (path === '/admin/login' && adminUser) {
        // Redirect already logged in users to dashboard
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> We handle API protection inside the route or selectively here
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
