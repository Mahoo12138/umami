// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export async function middleware(request: NextRequest) {
  const apiHost = process.env.API_HOST;

  if (!apiHost) {
    return NextResponse.json({ error: 'API_HOST not configured' }, { status: 500 });
  }

  // Construct target URL
  const url = new URL(request.url);
  const targetUrl = `${apiHost}${url.pathname}${url.search}`;

  try {
    let body = null;
    if (request.body) {
      body = await request.text();
    }

    const authorization = request.headers.get('authorization');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        authorization,
      },
      body,
    });
    // Forward the response
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
