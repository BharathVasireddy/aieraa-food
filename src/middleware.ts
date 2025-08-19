import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to public routes
    if (
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/unauthorized' ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/universities')
    ) {
      return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    const userRole = token.role as string;

    // Admin routes
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Manager routes
    if (pathname.startsWith('/manager') && userRole !== 'MANAGER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Student routes
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes without authentication
        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/universities')
        ) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all routes except static files and api routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
