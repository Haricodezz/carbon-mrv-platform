import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Respond to HEAD requests with 200 OK to prevent 404s on COOP checks
  if (request.method === 'HEAD') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
