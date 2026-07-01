import { NextRequest, NextResponse } from 'next/server'

// Exact pathnames that map to a real page in app/. The OLCO site is a single
// landing page; everything else is a blog post served at a flat root URL.
// Anything that isn't one of these AND isn't a real blog slug is treated as a
// 404 and redirected to the homepage.
const KNOWN_EXACT = new Set<string>(['/'])

// Dev shortcut: <site>/dev → Strapi CMS. Target is configurable; defaults to the
// public Strapi URL (override with DEV_REDIRECT_URL, e.g. .../admin).
const STRAPI_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.olco.com.au'
).replace(/\/$/, '')
const DEV_REDIRECT_URL = process.env.DEV_REDIRECT_URL || STRAPI_URL

// In-process cache so we don't hit Strapi on every navigation. On a single VPS
// this persists across requests; the /api/blog-slugs fetch is also tagged for the
// Data Cache as a second layer. On a fetch failure we keep serving the last known
// lists so a Strapi blip doesn't bounce every blog URL to the homepage.
interface RoutingData {
  slugs: string[]
  categories: string[]
}
let slugCache: { data: RoutingData; at: number } | null = null
const SLUG_TTL_MS = 10_000
// When a single-segment path misses the cached list we refetch once to catch a
// just-published post — but at most this often, so unknown URLs (bots probing
// random paths) can't make every 404 hammer Strapi.
const MISS_REFRESH_THROTTLE_MS = 2_000
let lastForcedFetchAt = 0

// By default the proxy resolves slugs by fetching its own public origin. Set
// INTERNAL_BASE_URL (e.g. http://127.0.0.1:3000) to hit the Node server directly:
// faster and never edge-cached. Falls back to the public origin when unset.
const INTERNAL_BASE_URL = process.env.INTERNAL_BASE_URL

async function fetchRoutingFrom(
  base: string,
  forceFresh: boolean
): Promise<RoutingData | null> {
  try {
    const res = await fetch(`${base}/api/blog-slugs`, {
      ...(forceFresh
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 60, tags: ['blog-slugs'] } }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { slugs?: unknown; categories?: unknown }
    return {
      slugs: Array.isArray(json.slugs) ? (json.slugs as string[]) : [],
      categories: Array.isArray(json.categories) ? (json.categories as string[]) : [],
    }
  } catch {
    return null
  }
}

async function fetchRouting(origin: string, forceFresh: boolean): Promise<RoutingData | null> {
  // Prefer INTERNAL_BASE_URL (direct Node hit, never edge-cached) but fall back to
  // the public origin when it's unreachable — e.g. local dev on :3000 while the
  // configured internal base points at the VPS port. Without the fallback a port
  // mismatch bounces every blog/category URL to the homepage.
  const bases =
    INTERNAL_BASE_URL && INTERNAL_BASE_URL !== origin
      ? [INTERNAL_BASE_URL, origin]
      : [origin]

  for (const base of bases) {
    const data = await fetchRoutingFrom(base, forceFresh)
    if (data) {
      slugCache = { data, at: Date.now() }
      return data
    }
  }
  return null
}

async function getRouting(origin: string): Promise<RoutingData> {
  if (slugCache && Date.now() - slugCache.at < SLUG_TTL_MS) return slugCache.data
  return (
    (await fetchRouting(origin, false)) ??
    slugCache?.data ?? { slugs: [], categories: [] }
  )
}

// Resolve a single root segment to a category or blog slug. On a miss we do one
// throttled cache-busting refetch before giving up, so a freshly published
// post/category doesn't bounce visitors to the homepage for the cache TTL.
// Categories take precedence over posts (they don't collide in practice).
async function resolveSegment(
  origin: string,
  seg: string
): Promise<'category' | 'slug' | null> {
  const data = await getRouting(origin)
  if (data.categories.includes(seg)) return 'category'
  if (data.slugs.includes(seg)) return 'slug'

  if (Date.now() - lastForcedFetchAt < MISS_REFRESH_THROTTLE_MS) return null
  lastForcedFetchAt = Date.now()
  const fresh = await fetchRouting(origin, true)
  if (!fresh) return null
  if (fresh.categories.includes(seg)) return 'category'
  if (fresh.slugs.includes(seg)) return 'slug'
  return null
}

// Strip identifying headers.
function stripHeaders(res: NextResponse): NextResponse {
  res.headers.delete('Server')
  res.headers.delete('X-Powered-By')
  return res
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl
  const pathname = url.pathname

  // ── API routes: never apply blog routing (the revalidate route guards itself) ──
  if (pathname.startsWith('/api')) {
    return stripHeaders(NextResponse.next())
  }

  // ── Metadata / static-like files (sitemap.xml, robots.txt, *.ico…) pass through ──
  if (/\.[^/]+$/.test(pathname)) {
    return stripHeaders(NextResponse.next())
  }

  // ── /dev → Strapi CMS (307: target/host may change, don't let it cache hard) ──
  if (pathname === '/dev' || pathname === '/dev/') {
    return NextResponse.redirect(DEV_REDIRECT_URL, 307)
  }

  // 1. Legacy blog post URLs → permanent (301) redirect to the new flat URL.
  //    This migration IS permanent, so a cached 301 is correct and desirable.
  if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
    const slug = pathname.slice('/blog/'.length).replace(/\/+$/, '')
    if (slug) {
      const dest = new URL(`/${slug}`, request.url)
      dest.search = url.search
      return NextResponse.redirect(dest, 301)
    }
  }

  // Normalize a single trailing slash for the lookups below.
  const normalized =
    pathname !== '/' && pathname.endsWith('/') ? pathname.replace(/\/+$/, '') : pathname

  // 2. Known real page → let Next render it.
  if (KNOWN_EXACT.has(normalized)) {
    return stripHeaders(NextResponse.next())
  }

  // 3. Single root segment matching a category url or a blog slug → serve the
  //    corresponding page while keeping the flat URL in the address bar (internal
  //    rewrite, no redirect). Categories take precedence over posts.
  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 1) {
    const kind = await resolveSegment(url.origin, segments[0])
    if (kind) {
      const target =
        kind === 'category' ? `/blog/category/${segments[0]}` : `/blog/${segments[0]}`
      const dest = new URL(target, request.url)
      dest.search = url.search
      return stripHeaders(NextResponse.rewrite(dest))
    }
  }

  // 4. Anything else → send to the homepage. MUST be a temporary (307) redirect,
  //    never 301: whether a single root segment is a real slug depends on live
  //    Strapi data, so a route that's unknown right now (Strapi blip, cold cache,
  //    or a just-published post) can become valid moments later. A 301 here gets
  //    cached permanently by the browser/CDN and would break that post forever.
  return NextResponse.redirect(new URL('/', request.url), 307)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2)).*)',
  ],
}
