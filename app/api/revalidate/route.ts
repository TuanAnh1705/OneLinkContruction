import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { rm } from 'node:fs/promises'
import path from 'node:path'

// Wipe Next's on-disk optimized-image cache. Without this a *replaced* Strapi
// image (same URL, e.g. a swapped feature photo) keeps serving the cached
// optimized copy for up to `images.minimumCacheTTL`. A process restart does NOT
// clear it because the cache lives on disk.
//
// ⚠️ EXPENSIVE: drops EVERY optimized image site-wide, so the next visitor
// re-optimizes them all — only call it on a real Strapi `media.*` event, never
// on a normal content publish. Best-effort: never throws.
async function clearNextImageCache(): Promise<void> {
  try {
    await rm(path.join(process.cwd(), '.next', 'cache', 'images'), {
      recursive: true,
      force: true,
    })
  } catch {
    /* best-effort — a failure here must not break revalidation */
  }
}

// Called by the Strapi publish webhook. On publish we bust every cache layer so
// edits show immediately instead of waiting for the revalidate window to lapse:
//   1. revalidateTag('strapi') — marks all Strapi data fetches stale
//   2. revalidateTag('blog-slugs') — refreshes the flat-URL routing list so a
//      just-published post resolves at once (proxy.ts) instead of bouncing home
//   3. revalidatePath('/', 'layout') — invalidates the Full Route Cache for every
//      route under the root layout (homepage + all posts)
//   4. clearNextImageCache() — ONLY on a real media change (see above)
// A `slug` query param additionally targets the specific post for good measure.
async function revalidateEverything(slug: string | null, clearImages: boolean) {
  revalidateTag('strapi', 'max')
  revalidateTag('blog-slugs', 'max')
  revalidatePath('/', 'layout')
  revalidatePath('/api/blog-slugs')
  if (slug) revalidatePath(`/blog/${slug}`)
  if (clearImages) await clearNextImageCache()
}

function checkSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Revalidation not configured' }, { status: 500 })
  }
  const token =
    req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-revalidate-secret')
  if (token !== secret) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const unauthorized = checkSecret(req)
  if (unauthorized) return unauthorized

  // Only wipe the image cache when Strapi reports a media change. Strapi sends
  // the event name (e.g. "media.create" / "entry.publish") in the JSON body.
  let clearImages = false
  try {
    const body = (await req.json()) as { event?: unknown }
    clearImages = typeof body.event === 'string' && body.event.startsWith('media')
  } catch {
    /* no/invalid body (e.g. manual curl) → treat as a content revalidate only */
  }

  await revalidateEverything(req.nextUrl.searchParams.get('slug'), clearImages)
  return NextResponse.json({ revalidated: true, clearImages, at: new Date().toISOString() })
}

// Allow GET for easy manual testing: ?secret=...&slug=...&images=1
export async function GET(req: NextRequest) {
  const unauthorized = checkSecret(req)
  if (unauthorized) return unauthorized

  const clearImages = req.nextUrl.searchParams.get('images') === '1'
  await revalidateEverything(req.nextUrl.searchParams.get('slug'), clearImages)
  return NextResponse.json({ revalidated: true, clearImages, at: new Date().toISOString() })
}
