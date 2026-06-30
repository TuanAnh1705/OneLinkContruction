'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { TocItem } from '@/app/lib/strapi'
import ShareArticle from './ShareArticle'

export interface SidebarAuthor {
  name: string
  role: string
  description: string
  image: string | null
  email: string | null
}

// Badge dùng chung — kích thước bằng đúng nút ContactButton ở landing page.
const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 15,
  fontWeight: 400,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  background: 'rgba(58,58,58,0.5)', // #3A3A3A 50%
  color: '#FFFFFF',
}

export default function ArticleSidebar({
  authors,
  toc,
}: {
  authors: SidebarAuthor[]
  toc: TocItem[]
}) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '')

  // Scroll-spy — highlight the heading currently nearest the top of the viewport.
  useEffect(() => {
    if (!toc.length) return
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el)
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      // Trigger zone: a band near the top of the viewport.
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [toc])

  return (
    // Sticky column gói gọn trong chiều cao màn hình để cả 3 card vừa vặn khi
    // scroll (không để Share this article bị tụt xuống cuối bài). Nếu màn hình
    // quá thấp thì cột tự cuộn nội bộ thay vì cắt mất card.
    <div className="lg:sticky lg:top-28 flex flex-col gap-5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      {/* Author cards */}
      {authors.map((author) => (
        <div
          key={author.name}
          className="rounded-2xl p-5"
          style={{ background: '#F4F4F4', color: '#3A3A3A' }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5">
              {author.image && (
                <Image
                  src={author.image}
                  alt={author.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            {/* Badge nằm cùng cột với tên & roles, phía trên tên */}
            <div>
              <span style={badgeStyle}>About the Author</span>
              <p className="mt-2 text-[27px] font-medium leading-tight" style={{ color: '#3A3A3A' }}>
                {author.name}
              </p>
              {author.role && (
                <p
                  className="text-[17px] leading-snug mt-1"
                  style={{ color: 'rgba(58,58,58,0.6)' }}
                >
                  {author.role}
                </p>
              )}
            </div>
          </div>

          {author.description && (
            <p
              className="mt-3 text-[13px] leading-snug"
              style={{ color: 'rgba(58,58,58,0.75)' }}
            >
              {author.description}
            </p>
          )}
        </div>
      ))}

      {/* In this article — table of contents */}
      {toc.length > 0 && (
        <nav
          aria-label="In this article"
          className="rounded-2xl p-5"
          style={{ background: '#F4F4F4', color: '#3A3A3A' }}
        >
          <span style={badgeStyle}>In this article</span>
          <ul className="mt-3 flex flex-col gap-0.5">
            {toc.map((item) => {
              const isActive = item.id === activeId
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setActiveId(item.id)}
                    className="block border-l-2 py-1 pl-3 text-[13.5px] leading-snug transition-colors"
                    style={{
                      borderColor: isActive ? '#3A3A3A' : 'transparent',
                      color: isActive ? '#3A3A3A' : 'rgba(58,58,58,0.55)',
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Share this article — cùng cột, dưới "In this article" */}
      <ShareArticle />
    </div>
  )
}
