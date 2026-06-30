import { NextResponse } from 'next/server'
import { getAllSlugs, getAllCategorySlugs } from '@/app/lib/strapi'

// Lightweight endpoint proxy.ts uses to resolve flat root URLs:
//   /<slug>     →  blog post     at /blog/<slug>
//   /<cat-url>  →  category page  at /blog/category/<cat-url>
// Both are url segments without the leading slash. Tagged `blog-slugs` so the
// Strapi publish webhook (/api/revalidate) refreshes them immediately — a brand-new
// post/category then resolves at once instead of bouncing visitors to the homepage.
export const revalidate = 60

export async function GET() {
  try {
    const [slugs, categories] = await Promise.all([
      getAllSlugs(),
      getAllCategorySlugs(),
    ])
    return NextResponse.json(
      { slugs, categories },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch {
    return NextResponse.json(
      { slugs: [], categories: [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}
