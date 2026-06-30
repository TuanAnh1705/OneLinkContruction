import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getBlogPostBySlug,
  getBlogContentHtml,
  processBlogContent,
  summarizeBlog,
  getAllSlugs,
  normalizeSeo,
  getSchemaJsonld,
  getPostTags,
  mediaUrl,
} from '@/app/lib/strapi'
import { mergeSeoMetadata } from '@/app/lib/seo'

// Prerender every published post at build time so SEO crawls hit static HTML.
// Posts published after the build still render on-demand (dynamicParams) and are
// then cached; the Strapi webhook (/api/revalidate) refreshes them on edit.
export async function generateStaticParams() {
  try {
    return (await getAllSlugs()).map((slug) => ({ slug }))
  } catch {
    return []
  }
}
import Navbar from '@/app/components/Navbar'
import ContactButton from '@/app/components/ContactButton'
import BackToTopButton from '@/app/components/BackToTopButton'
import ArticleSidebar, { type SidebarAuthor } from './ArticleSidebar'

// Link "← Back To Homepage" — về landing page, ScrollManager cuộn lên đầu trang.
function BackToHomepage() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-[15px] text-white/55 transition-colors hover:text-white"
    >
      {/* lucide CornerDownLeft */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="9 10 4 15 9 20" />
        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
      </svg>
      Back To Homepage
    </Link>
  )
}

// Badge dùng chung — kích thước bằng đúng nút ContactButton ở landing page
// (padding 10/20, font 15/600, line-height 20, radius 8).
const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Insight not found | OLCO' }
  const summary = summarizeBlog(post, 180)
  const base: Metadata = {
    title: `${post.title} | OLCO Insights`,
    description: summary,
    openGraph: {
      title: post.title,
      description: summary,
      images: mediaUrl(post.featureImage) ? [mediaUrl(post.featureImage)!] : [],
    },
  }
  // DefaultSEO từ Strapi ghi đè khi có; null → giữ nguyên base.
  return mergeSeoMetadata(base, normalizeSeo(post.DefaultSEO))
}

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const post = await getBlogPostBySlug(slug)
  // Bài không tồn tại/đã ẩn → về homepage thay vì 404 (proxy đã chặn phần lớn,
  // đây là lớp dự phòng cho edge case post bị xoá sau khi cache slug).
  if (!post) redirect('/')

  const { html, toc } = processBlogContent(getBlogContentHtml(post))
  const summary = summarizeBlog(post)
  const featureSrc = mediaUrl(post.featureImage, 'large') ?? mediaUrl(post.featureImage)

  // SEO JSON-LD do Strapi cung cấp (null → không render gì).
  const jsonLd = getSchemaJsonld(post)
  // Thẻ tag (title + url) từ block section-blog.tag-section.
  const tags = getPostTags(post)

  const authors: SidebarAuthor[] = (post.authors ?? []).map((a) => ({
    name: a.name,
    role: a.roles || '',
    description: a.description || '',
    image: mediaUrl(a.image, 'small') ?? mediaUrl(a.image),
    email: a.email || null,
  }))

  return (
    <main className="relative min-h-screen bg-[#2E2E2E] text-white">
      {/* SEO JSON-LD từ Strapi (seoSchemaJsonld). Null thì không render. */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}

      {/* Navbar dùng chung với landing page */}
      <Navbar />

      {/* Logo — đặt ở đầu trang và cuộn đi cùng nội dung (như HeroSection),
          không pin cố định: scroll xuống thì logo biến mất, chỉ còn Menu + Build With Us */}
      <div className="absolute top-0 inset-x-0 z-40 pointer-events-none">
        <div className="max-w-480 mx-auto px-6 lg:px-36">
          <Link href="/" className="inline-block pointer-events-auto pt-4 lg:pt-1.5">
            <Image
              src="/Layer_1.svg"
              alt="OLCO"
              width={120}
              height={68}
              priority
              className="w-27.5 lg:w-40 h-auto lg:h-22.5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-[1180px] px-6 pb-28 pt-28 lg:pt-36">
        {/* Article header */}
        <div className="max-w-3xl">
          <div className="mb-6">
            <BackToHomepage />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {(post.categories ?? []).map((c) => (
              <span
                key={c.id}
                style={{
                  ...badgeStyle,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                }}
              >
                {c.categoriesName}
              </span>
            ))}
          </div>

          <h1
            className="font-medium leading-[1.1] tracking-tight"
            style={{ fontSize: 'clamp(30px, 4vw, 66px)' }}
          >
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-white/55">
            {authors.length > 0 && (
              <span className="text-white/80">
                {authors.map((a) => a.name).join(', ')}
              </span>
            )}
            {authors.length > 0 && <span aria-hidden>·</span>}
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>

        {/* Feature image */}
        {featureSrc && (
          <div className="relative mt-8 aspect-16/9 w-full overflow-hidden rounded-2xl bg-white/5">
            <Image
              src={featureSrc}
              alt={post.featureImage?.alternativeText || post.title}
              fill
              priority
              quality={90}
              sizes="(max-width: 1180px) 100vw, 1180px"
              className="object-cover object-center"
            />
          </div>
        )}

        {/* Body + sidebar */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {/* Summary */}
            {summary && (
              <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/55">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 3l1.8 4.6L18.4 9l-4.6 1.4L12 15l-1.8-4.6L5.6 9l4.6-1.4L12 3z"
                      fill="#99C2FF"
                    />
                  </svg>
                  Summary
                </div>
                <p className="text-[15px] leading-relaxed text-white/75">{summary}</p>
              </div>
            )}

            {/* Article content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <aside>
            <ArticleSidebar authors={authors} toc={toc} />
          </aside>
        </div>

        {/* Thẻ tag (title + url) — hiển thị phía trên nút Contact Us */}
        {tags.length > 0 && (
          <div className="mt-16 flex flex-wrap gap-2">
            {tags.map((t) =>
              t.url ? (
                <a
                  key={`${t.title}-${t.url}`}
                  href={t.url}
                  className="inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-[14px] font-medium text-white/85 transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  {t.title}
                </a>
              ) : (
                <span
                  key={t.title}
                  className="inline-flex items-center rounded-lg px-4 py-2 text-[14px] font-medium text-white/85"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  {t.title}
                </span>
              )
            )}
          </div>
        )}

        {/* Contact Us — dùng chung nút ở landing page, link tới phần contact */}
        <div className={`${tags.length > 0 ? 'mt-6' : 'mt-16'} flex justify-start`}>
          <ContactButton label="Contact Us" href="/#contact" align="left" />
        </div>

        {/* Back To Homepage */}
        <div className="mt-12">
          <BackToHomepage />
        </div>
      </article>

      {/* Nút mũi tên góc phải dưới — trượt về đầu trang */}
      <BackToTopButton />
    </main>
  )
}
