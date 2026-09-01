import { NextResponse } from 'next/server'

// PWA manifest served as a route so it always has the correct content-type.
export function GET() {
  return NextResponse.json(
    {
      name: 'Sushi Tok Club',
      short_name: 'Sushi Tok',
      description: 'Rasca & Gana en Sushi Tok. Descubre y canjea tus premios.',
      start_url: '/app',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#26211d',
      theme_color: '#26211d',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    { headers: { 'content-type': 'application/manifest+json' } },
  )
}
