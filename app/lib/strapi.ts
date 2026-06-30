// ─── Strapi data layer for the OLCO blog ────────────────────────────────────
// CMS: https://cms.olco.com.au (Strapi 5). Collections used:
//   blog-details   → the articles (featureImage, authors[], categories[], blocks[])
//   blog-categories→ the filter tabs on the landing "Insights" section
//   blog-users     → authors (image, name, roles, description, email)
//
// The public role only permits shallow + nested-media populate, so every read
// below sticks to populate shapes verified against the live API.

export const STRAPI_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.olco.com.au'
).replace(/\/$/, '')

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StrapiImageFormat {
  url: string
  width: number
  height: number
}

export interface StrapiImage {
  url: string
  width?: number
  height?: number
  alternativeText?: string | null
  formats?: Record<string, StrapiImageFormat>
}

export interface BlogAuthor {
  id: number
  documentId: string
  name: string
  roles?: string | null
  description?: string | null
  email?: string | null
  image?: StrapiImage | null
}

export interface BlogCategory {
  id: number
  documentId: string
  categoriesName: string
  url: string
}

export interface BlogBlock {
  __component: string
  id: number
  BlogContent?: string
  [key: string]: unknown
}

export interface BlogPost {
  id: number
  documentId: string
  title: string
  url: string
  views?: number | null
  isPinned?: boolean | null
  isHidden?: boolean | null
  description?: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  featureImage?: StrapiImage | null
  authors?: BlogAuthor[]
  categories?: BlogCategory[]
  blocks?: BlogBlock[]
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function strapiFetch<T>(
  path: string,
  tags: string[] = ['strapi']
): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api${path}`, {
      // Revalidate hourly — blog content changes rarely and this keeps the
      // landing page + article routes fast without a redeploy. The `strapi` tag
      // lets the Strapi publish webhook (/api/revalidate) bust this immediately.
      next: { revalidate: 3600, tags },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

interface StrapiList<T> {
  data: T[]
}

const POST_POPULATE =
  'populate[featureImage]=true&populate[categories]=true&populate[authors][populate]=image'

/** All visible articles, newest first (pinned ones float to the top). */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const json = await strapiFetch<StrapiList<BlogPost>>(
    `/blog-details?${POST_POPULATE}&sort=publishedAt:desc&pagination[pageSize]=100`,
    ['strapi', 'blog-slugs']
  )
  const posts = (json?.data ?? []).filter((p) => !p.isHidden)
  return posts.sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned))
}

/**
 * Flat route slugs of every visible post (no leading slash) — used by proxy.ts
 * to resolve `domain/<slug>` and by generateStaticParams to prerender posts.
 */
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getBlogPosts()
  return posts.map(postSlug).filter(Boolean)
}

/** Categories that power the filter tabs. */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const json = await strapiFetch<StrapiList<BlogCategory>>(
    `/blog-categories?sort=id:asc&pagination[pageSize]=100`
  )
  return json?.data ?? []
}

/** A single article by its url slug (the `url` field is stored as "/the-slug"). */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const url = `/${slug.replace(/^\//, '')}`
  const json = await strapiFetch<StrapiList<BlogPost>>(
    `/blog-details?filters[url][$eq]=${encodeURIComponent(url)}&${POST_POPULATE}&populate[blocks]=true`
  )
  return json?.data?.[0] ?? null
}

// ─── Media helpers ───────────────────────────────────────────────────────────

/** Absolute URL for a Strapi media field, optionally at a named format. */
export function mediaUrl(
  img?: StrapiImage | null,
  format?: 'thumbnail' | 'small' | 'medium' | 'large'
): string | null {
  if (!img) return null
  const path = (format && img.formats?.[format]?.url) || img.url
  if (!path) return null
  return path.startsWith('http') ? path : `${STRAPI_URL}${path}`
}

/** Turn a stored url ("/the-slug") into a route slug ("the-slug"). */
export function postSlug(post: BlogPost): string {
  return (post.url || '').replace(/^\//, '')
}

// ─── Content processing (headings → ids + table of contents, summary) ────────

export interface TocItem {
  id: string
  text: string
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
}

function slugify(s: string): string {
  return (
    decodeEntities(stripTags(s))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'section'
  )
}

/** The raw HTML from the BlogContent custom field of the blocks dynamic zone. */
export function getBlogContentHtml(post: BlogPost): string {
  const block = post.blocks?.find((b) => typeof b.BlogContent === 'string')
  return (block?.BlogContent as string) || ''
}

// CKEditor stores section headings as large font-size spans, not <h*> tags
// (e.g. <span style="font-size:35px;"><span style="white-space:pre-wrap;">Heading</span></span>).
// Body copy is 18px and captions 15px, so anything >= this is a heading.
const HEADING_FONT_MIN = 28

/**
 * Inject stable `id`s onto every heading in the article and collect them into a
 * table of contents. Handles both the large-font-span headings produced by the
 * CMS editor and native <h1>–<h4> tags (for forward compatibility).
 */
export function processBlogContent(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: '', toc: [] }

  const toc: TocItem[] = []
  const used = new Set<string>()
  const makeId = (text: string) => {
    const base = slugify(text)
    let id = base
    let i = 2
    while (used.has(id)) id = `${base}-${i++}`
    used.add(id)
    return id
  }

  let out = html

  // 1) Large font-size spans → real headings with an id.
  out = out.replace(
    /<span style="font-size:(\d+)px;">\s*<span style="white-space:pre-wrap;">([\s\S]*?)<\/span>\s*<\/span>/g,
    (match, size: string, inner: string) => {
      if (Number(size) < HEADING_FONT_MIN) return match
      const text = decodeEntities(stripTags(inner)).trim()
      if (!text) return match
      const id = makeId(text)
      toc.push({ id, text })
      return `<h2 id="${id}" class="blog-heading">${inner}</h2>`
    }
  )

  // 2) Native heading tags (skip ones we just generated — they already carry id).
  out = out.replace(
    /<(h[1-4])((?:[^>]*))>([\s\S]*?)<\/\1>/g,
    (match, tag: string, attrs: string, inner: string) => {
      if (/\bid=/.test(attrs)) return match
      const text = decodeEntities(stripTags(inner)).trim()
      if (!text) return match
      const id = makeId(text)
      toc.push({ id, text })
      return `<${tag} id="${id}" class="blog-heading"${attrs}>${inner}</${tag}>`
    }
  )

  return { html: out, toc }
}

/**
 * A short, honest summary of the article assembled straight from the CMS data —
 * uses the `description` field when present, otherwise the opening prose.
 */
export function summarizeBlog(post: BlogPost, maxChars = 360): string {
  if (post.description && post.description.trim()) return post.description.trim()

  const html = getBlogContentHtml(post)
  // Drop heading spans so the summary reads from body copy, not section titles.
  const body = html.replace(
    /<span style="font-size:(\d+)px;">[\s\S]*?<\/span>\s*<\/span>/g,
    (m, size: string) => (Number(size) >= HEADING_FONT_MIN ? '' : m)
  )
  const text = decodeEntities(stripTags(body))
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxChars) return text
  const slice = text.slice(0, maxChars)
  const stop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? ')
  )
  return stop > 140 ? slice.slice(0, stop + 1) : `${slice.trim()}…`
}

/** Rough read time in minutes from the article body. */
export function readingMinutes(post: BlogPost): number {
  const words = decodeEntities(stripTags(getBlogContentHtml(post)))
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
