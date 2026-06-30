'use client'

import { useState } from 'react'

// Badge dùng chung — kích thước bằng đúng nút ContactButton ở landing page.
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
  background: 'rgba(58,58,58,0.5)',
  color: '#FFFFFF',
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-xl text-white/85 transition-colors hover:bg-white/10 hover:text-white"
      style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
    >
      {children}
    </button>
  )
}

// Domain công khai để Facebook/LinkedIn crawl được OG tags của bài viết.
// (localhost không thể crawl → preview sẽ rỗng, nên khi chạy local ta thay
//  bằng URL production tương ứng.) Có thể override bằng NEXT_PUBLIC_SITE_URL.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://olco.com.au').replace(/\/$/, '')

export default function ShareArticle() {
  const [copied, setCopied] = useState(false)

  const getUrl = () => {
    if (typeof window === 'undefined') return ''
    const { hostname, pathname, href } = window.location
    const isLocal =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
    // Local: chia sẻ URL production (có OG tags) để nền tảng hiện được bài viết.
    return isLocal ? `${SITE_URL}${pathname}` : href
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard có thể bị chặn — bỏ qua */
    }
  }

  const openPopup = (url: string) =>
    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=600')

  const shareFacebook = () =>
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`)

  const shareLinkedIn = () =>
    openPopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`)

  // Instagram không có web share intent kèm URL → copy link rồi mở Instagram
  // (mở app nếu có) để người dùng dán vào bài đăng/story.
  const shareInstagram = async () => {
    await copyLink()
    openPopup('https://www.instagram.com/')
  }

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 1.5,
        background: 'linear-gradient(to right, #F4F4F4, #8C8C8C)',
      }}
    >
      <div style={{ borderRadius: 18.5, background: '#2E2E2E', padding: 18 }}>
        <span style={badgeStyle}>{copied ? 'Link copied!' : 'Share this article:'}</span>

        <div className="mt-4 flex flex-wrap gap-3">
          {/* Copy link */}
          <IconButton label="Copy link" onClick={copyLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9.5 13.5a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1.4 1.4" />
              <path d="M14.5 10.5a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1.4-1.4" />
            </svg>
          </IconButton>

          {/* Facebook */}
          <IconButton label="Share on Facebook" onClick={shareFacebook}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.3-.04-1.3-.13-2.46-.13-2.44 0-4.1 1.49-4.1 4.22v2.21H7.7V14h2.74v8h3.06z" />
            </svg>
          </IconButton>

          {/* Instagram */}
          <IconButton label="Share on Instagram" onClick={shareInstagram}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </IconButton>

          {/* LinkedIn */}
          <IconButton label="Share on LinkedIn" onClick={shareLinkedIn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.94 5a2 2 0 11-4 0 2 2 0 014 0zM3.3 8.5h3.3V22H3.3V8.5zM9.4 8.5h3.16v1.84h.05c.44-.83 1.51-1.7 3.11-1.7 3.32 0 3.94 2.18 3.94 5.02V22h-3.3v-5.8c0-1.38-.03-3.16-1.93-3.16-1.93 0-2.22 1.5-2.22 3.06V22H9.4V8.5z" />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  )
}
