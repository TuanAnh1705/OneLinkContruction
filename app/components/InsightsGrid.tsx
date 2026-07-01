'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export interface InsightCard {
  title: string
  slug: string
  image: string | null
  imageAlt: string
  categories: string[]
  readTime: number
}

export interface CategoryTab {
  name: string
  slug: string
}

const PAGE_SIZE = 6

// Badge/nút trên card — kích thước bằng đúng nút ContactButton ở landing page
// (padding 10/20, font 15, line-height 20, radius 8). Màu để riêng ở từng chỗ.
const cardBadge: React.CSSProperties = {
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
}

export default function InsightsGrid({
  posts,
  categories,
}: {
  posts: InsightCard[]
  categories: CategoryTab[]
}) {
  const [visible, setVisible] = useState<number>(PAGE_SIZE)
  // Active filter = category slug ('' = All). Clicking a tab filters the grid in
  // place and syncs the address bar to domain/<slug> via the History API — no
  // navigation. Landing directly on /<slug> is still served by the category page.
  const [activeSlug, setActiveSlug] = useState<string>('')

  // Keep the filter in sync when the user uses the browser back/forward buttons.
  useEffect(() => {
    const syncFromUrl = () => {
      const seg = window.location.pathname.replace(/^\/+|\/+$/g, '')
      setActiveSlug(categories.some((c) => c.slug === seg) ? seg : '')
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [categories])

  const selectCategory = (slug: string) => {
    setActiveSlug(slug)
    setVisible(PAGE_SIZE)
    // Bypass Next's patched history.pushState: changing the *pathname* through it
    // makes the App Router treat it as a soft navigation (scrolls to top /
    // refetches the route). The native prototype method updates only the address
    // bar. We keep the existing history state so browser back/forward still works.
    History.prototype.pushState.call(
      window.history,
      window.history.state,
      '',
      slug ? `/${slug}` : '/'
    )
  }

  const activeName = categories.find((c) => c.slug === activeSlug)?.name
  const filtered = activeName
    ? posts.filter((p) => p.categories.includes(activeName))
    : posts

  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  const tabBase =
    'cursor-pointer rounded-lg px-4 py-2 text-[13px] sm:text-[14px] font-medium transition-colors duration-200'
  const activeStyle: React.CSSProperties = { background: '#F4F4F4', color: '#3A3A3A' }
  const idleStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.7)',
  }

  return (
    <>
      {/* Tabs: filter the grid in place; the address bar reflects domain/<url>. */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        <button
          type="button"
          onClick={() => selectCategory('')}
          className={tabBase}
          style={activeSlug ? idleStyle : activeStyle}
        >
          All
        </button>
        {categories.map((c) => (
          <a
            key={c.slug}
            href={`/${c.slug}`}
            onClick={(e) => {
              e.preventDefault()
              selectCategory(c.slug)
            }}
            className={tabBase}
            style={activeSlug === c.slug ? activeStyle : idleStyle}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {shown.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-white/50 mt-8">No insights yet.</p>
      )}

      {/* More */}
      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="cursor-pointer text-[15px] font-medium text-white underline underline-offset-8 decoration-white/40 hover:decoration-white transition-colors"
          >
            More Insights
          </button>
        </div>
      )}
    </>
  )
}

function BlogCard({ post }: { post: InsightCard }) {
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [hovered, setHovered] = useState(false)

  // Nút "Read Blog" bám chuột trực tiếp trong event handler — không qua state/spring
  // để nhạy tối đa, giống custom drag cursor ở FeaturedProducts.
  const moveCursor = (x: number, y: number) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }
  }

  return (
    <Link href={`/${post.slug}`} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl aspect-3/4 w-full bg-white/5"
        style={{ cursor: hovered ? 'none' : undefined }}
        onMouseEnter={(e) => {
          setHovered(true)
          moveCursor(e.clientX, e.clientY)
        }}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={(e) => moveCursor(e.clientX, e.clientY)}
      >
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">
            OLCO
          </div>
        )}

        {/* subtle bottom gradient so pills stay legible */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />

        {/* category pills */}
        <div className="absolute left-3 bottom-3 flex flex-wrap gap-2 pr-3">
          {post.categories.slice(0, 2).map((c) => (
            <span
              key={c}
              className="inline-flex items-center bg-black/45 text-white/90 backdrop-blur-sm"
              style={cardBadge}
            >
              {c}
            </span>
          ))}
        </div>

      </div>

      <h3
        className="mt-4 font-medium text-white leading-snug"
        style={{ fontSize: 'clamp(17px, 1.4vw, 21px)' }}
      >
        {post.title}
      </h3>

      {/* Read Blog — thay con trỏ chuột, bám theo chuột khi hover vào ảnh.
          Giữ nguyên CSS của nút như cũ. */}
      <span
        ref={cursorRef}
        className="fixed left-0 top-0 z-50 pointer-events-none hidden lg:inline-flex items-center bg-[#3A3A3A] text-white transition-opacity duration-200"
        style={{ ...cardBadge, opacity: hovered ? 1 : 0 }}
      >
        Read Blog
      </span>
    </Link>
  )
}
