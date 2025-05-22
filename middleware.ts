import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/dashboard'],
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // CORS support for API routes
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

  // ⛔ Block dashboard if onboarding not completed
  if (req.nextUrl.pathname === '/dashboard') {
    const jwt = req.cookies.get('growfly_jwt')?.value || req.headers.get('Authorization')?.replace('Bearer ', '')

    if (!jwt) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    try {
      const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (!apiRes.ok) throw new Error('Invalid token')

      const user = await apiRes.json()

      const requiredFields = [
        'brandName',
        'brandTone',
        'brandDescription',
        'brandValues',
        'brandVoice',
        'brandMission',
        'inspiredBy',
        'jobTitle',
        'industry',
        'goals',
      ]

      const incomplete = requiredFields.some(field => !user[field])

      if (incomplete) {
        url.pathname = '/onboarding'
        url.searchParams.set('plan', user.subscriptionType || 'free') // ✅ Ensures plan is preserved
        return NextResponse.redirect(url)
      }
    } catch {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
