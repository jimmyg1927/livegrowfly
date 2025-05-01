// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only apply to API routes
export const config = {
  matcher: ['/api/:path*'],
}

export function middleware(req: NextRequest) {
  // For OPTIONS preflight requests, return early
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    res.headers.set('Access-Control-Allow-Origin', 'https://growflynew0425.vercel.app')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res
  }

  // For all other API requests, just add the CORS headers
  const res = NextResponse.next()
  res.headers.set('Access-Control-Allow-Origin', 'https://growflynew0425.vercel.app')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}
