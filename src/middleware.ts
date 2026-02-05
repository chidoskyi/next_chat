import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value
  const userData = request.cookies.get('user_data')?.value
  
  const isAuthenticated = !!(accessToken && userData)
  
  // Define public routes (routes that don't require authentication)
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log('🚫 [Middleware] Not authenticated, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If authenticated and trying to access login/register
  if (isAuthenticated && isPublicRoute) {
    console.log('✅ [Middleware] Already authenticated, redirecting to chats')
    return NextResponse.redirect(new URL('/chats', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}