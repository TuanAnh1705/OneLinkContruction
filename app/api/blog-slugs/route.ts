import { NextResponse } from 'next/server'
import { getAllSlugs } from '@/app/lib/strapi'

// Lightweight endpoint proxy.ts uses to resolve flat root URLs:
//   /<slug>  →  the blog post at /blog/<slug>
// `slugs` are url segments without the leading slash. Tagged `blog-slugs` so the
// Strapi publish webhook (/api/revalidate) refreshes it immediately — a brand-new
// post then resolves at once instead of bouncing visitors to the homepage.
export const revalidate = 60

export async function GET() {
  try {
    const slugs = await getAllSlugs()
    return NextResponse.json(
      { slugs },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch {
    return NextResponse.json(
      { slugs: [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}
