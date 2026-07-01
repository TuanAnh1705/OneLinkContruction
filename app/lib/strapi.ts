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
  DefaultSEO?: RawSeo | RawSeo[] | null
}

// Strapi SEO plugin component (DefaultSEO). May come back as a single object or a
// 1-item array depending on the field config — normalizeSeo handles both.
export interface RawSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string | null
  metaImage?: StrapiImage | null
}

export interface SeoMeta {
  metaTitle: string | null
  metaDescription: string | null
  keywords: string | null
  metaImage: { url: string; alternativeText: string | null } | null
}

/** A tag (title + url) from the `section-blog.tag-section` block of a post. */
export interface BlogTag {
  title: string
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
  DefaultSEO?: RawSeo | RawSeo[] | null
  // JSON-LD added in Strapi — may be a JSON object/array or a raw string. Null when unset.
  seoSchemaJsonld?: unknown
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

// DefaultSEO is a component; its scalar fields come automatically, only the
// nested metaImage media needs explicit field selection (public-role friendly).
const SEO_POPULATE =
  'populate[DefaultSEO][populate][metaImage][fields][0]=url' +
  '&populate[DefaultSEO][populate][metaImage][fields][1]=alternativeText'

const POST_POPULATE =
  'populate[featureImage]=true&populate[categories]=true' +
  '&populate[authors][populate]=image&' +
  SEO_POPULATE

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

/** Categories that power the filter tabs + their own landing pages. */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const json = await strapiFetch<StrapiList<BlogCategory>>(
    `/blog-categories?sort=id:asc&pagination[pageSize]=100&${SEO_POPULATE}`,
    ['strapi', 'blog-slugs']
  )
  return json?.data ?? []
}

/** Flat route segment of a category ("/project-cost-optimization" → "project-cost-optimization"). */
export function categorySlug(cat: BlogCategory): string {
  return (cat.url || '').replace(/^\//, '')
}

/** Category route segments — proxy.ts uses these to resolve domain/<category-url>. */
export async function getAllCategorySlugs(): Promise<string[]> {
  const cats = await getBlogCategories()
  return cats.map(categorySlug).filter(Boolean)
}

/** A category by its flat route segment, or null. */
export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const target = `/${slug.replace(/^\//, '')}`
  const cats = await getBlogCategories()
  return cats.find((c) => c.url === target) ?? null
}

/** Visible posts that belong to a category (by its flat route segment). */
export async function getPostsByCategorySlug(slug: string): Promise<BlogPost[]> {
  const target = `/${slug.replace(/^\//, '')}`
  const posts = await getBlogPosts()
  return posts.filter((p) => (p.categories ?? []).some((c) => c.url === target))
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

// ─── SEO + tags ────────────────────────────────────────────────────────────────

function firstSeo(raw?: RawSeo | RawSeo[] | null): RawSeo | null {
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] ?? null : raw
}

/** Normalize a DefaultSEO component (post or category) to a flat shape, or null. */
export function normalizeSeo(raw?: RawSeo | RawSeo[] | null): SeoMeta | null {
  const seo = firstSeo(raw)
  if (!seo) return null
  const imgUrl = seo.metaImage ? mediaUrl(seo.metaImage) : null
  return {
    metaTitle: seo.metaTitle ?? null,
    metaDescription: seo.metaDescription ?? null,
    keywords: seo.keywords ?? null,
    metaImage: imgUrl
      ? { url: imgUrl, alternativeText: seo.metaImage?.alternativeText ?? null }
      : null,
  }
}

/**
 * The article's JSON-LD (`seoSchemaJsonld`) as a ready-to-inject string, or null.
 * Strapi may return an object/array (JSON field) or a string (text field) — both
 * are handled; null/empty → null.
 */
export function getSchemaJsonld(post: BlogPost): string | null {
  const v = post.seoSchemaJsonld
  if (v == null) return null
  if (typeof v === 'string') return v.trim() || null
  try {
    return JSON.stringify(v)
  } catch {
    return null
  }
}

/** Tags (title + url) from the post's `section-blog.tag-section` block(s). */
export function getPostTags(post: BlogPost): BlogTag[] {
  const out: BlogTag[] = []
  const push = (t: { title?: unknown; url?: unknown }) => {
    if (typeof t.title === 'string' && t.title.trim()) {
      out.push({ title: t.title.trim(), url: typeof t.url === 'string' ? t.url : '' })
    }
  }
  for (const b of post.blocks ?? []) {
    if (b.__component !== 'section-blog.tag-section') continue
    push(b as { title?: unknown; url?: unknown })
    const list = (b as { tags?: unknown }).tags
    if (Array.isArray(list)) list.forEach((t) => push(t as { title?: unknown; url?: unknown }))
  }
  return out
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

// Trim to a clean word boundary at most `maxChars` long, adding an ellipsis only
// when we actually cut the text short.
function clampSummary(text: string, maxChars: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= maxChars) return t
  const slice = t.slice(0, maxChars)
  const cut = slice.lastIndexOf(' ')
  return `${(cut > maxChars * 0.6 ? slice.slice(0, cut) : slice).trim()}…`
}

// The full article body as plain text (headings dropped so we summarise the prose,
// not the section titles).
function articleBodyText(post: BlogPost): string {
  const body = getBlogContentHtml(post).replace(
    /<span style="font-size:(\d+)px;">[\s\S]*?<\/span>\s*<\/span>/g,
    (m, size: string) => (Number(size) >= HEADING_FONT_MIN ? '' : m)
  )
  return decodeEntities(stripTags(body))
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const SUMMARY_STOPWORDS = new Set(
  (
    'a an the and or but of to in on for with at by from as is are was were be been being ' +
    'this that these those it its you your we our they their he she his her i me my will ' +
    'would can could should may might must not no do does did has have had also more than ' +
    'then so such into over under out up down about which who whom what when where how'
  ).split(' ')
)

// Reads the WHOLE article and picks the sentences that best represent it (highest
// average term-frequency), kept in their original order, up to `maxChars`. Used
// only as a fallback when the CMS has no curated summary, so a post still gets a
// real digest of the piece instead of a truncated intro.
function extractiveSummary(text: string, maxChars: number): string {
  const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
  if (sentences.length < 2) return clampSummary(text, maxChars)

  const words = (s: string) => s.toLowerCase().match(/[a-z0-9']+/g) ?? []
  const freq = new Map<string, number>()
  for (const s of sentences) {
    for (const w of words(s)) {
      if (w.length > 2 && !SUMMARY_STOPWORDS.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1)
    }
  }

  const score = (s: string) => {
    const ws = words(s).filter((w) => w.length > 2 && !SUMMARY_STOPWORDS.has(w))
    if (!ws.length) return 0
    return ws.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / ws.length
  }

  const ranked = sentences
    .map((s, i) => ({ s, i, score: score(s) }))
    .sort((a, b) => b.score - a.score)

  const chosen: { s: string; i: number }[] = []
  let len = 0
  for (const r of ranked) {
    if (len + r.s.length + 1 > maxChars) continue
    chosen.push(r)
    len += r.s.length + 1
    if (len >= maxChars * 0.75) break
  }
  if (!chosen.length) return clampSummary(ranked[0].s, maxChars)

  chosen.sort((a, b) => a.i - b.i)
  return clampSummary(chosen.map((c) => c.s).join(' '), maxChars)
}

/**
 * A short, honest summary of the article - a single paragraph of at most
 * `maxChars` characters. Prefers the curated SEO meta description (a human-written
 * digest of the whole piece), then the post's `description`, and only falls back
 * to an extractive summary built from the full body when neither exists.
 */
export function summarizeBlog(post: BlogPost, maxChars = 180): string {
  const meta = firstSeo(post.DefaultSEO)?.metaDescription?.trim()
  if (meta) return clampSummary(meta, maxChars)

  if (post.description && post.description.trim())
    return clampSummary(post.description.trim(), maxChars)

  return extractiveSummary(articleBodyText(post), maxChars)
}

/** Rough read time in minutes from the article body. */
export function readingMinutes(post: BlogPost): number {
  const words = decodeEntities(stripTags(getBlogContentHtml(post)))
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
