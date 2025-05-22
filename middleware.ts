// FILE: middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/dashboard'],
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // ─── CORS SUPPORT FOR /api ───────────────────────────────────────────────────
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      res.headers.set('Access-Control-Allow-Origin', 'https://growflynew0425.vercel.app')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      return res
    }
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', 'https://growflynew0425.vercel.app')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    return res
  }

  // ─── PROTECT /dashboard ──────────────────────────────────────────────────────
  if (req.nextUrl.pathname === '/dashboard') {
    // 1) Check JWT (cookie or Authorization header)
    const jwt =
      req.cookies.get('growfly_jwt')?.value ||
      req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    try {
      // 2) Fetch user data
      const apiRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      if (!apiRes.ok) throw new Error('Invalid token')
      const user = await apiRes.json()

      // 3) Check exactly the fields you collect in onboarding
      const required = [
        'brandName',
        'brandDescription',
        'brandVoice',
        'brandMission',
        'inspiredBy',
        'jobTitle',
        'industry',
        'goals',
      ]
      const incomplete = required.some((f) => !user[f])
      if (incomplete) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    } catch {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Otherwise, let the request through
  return NextResponse.next()
}
