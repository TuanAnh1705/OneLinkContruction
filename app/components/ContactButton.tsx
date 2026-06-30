'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ContactButtonProps {
  label?: string
  href?: string
  align?: 'left' | 'right'
  backgroundColor?: string
  textColor?: string
  as?: 'a' | 'button'
}

export default function ContactButton({
  label = 'Contact Us',
  href = '#contact',
  align = 'right',
  backgroundColor = '#F4F4F4',
  textColor = '#3A3A3A',
  as = 'a',
}: ContactButtonProps) {
  const [hovered, setHovered] = useState(false)

  const isLight = backgroundColor === '#F4F4F4'
  const hoverBg = isLight ? '#3A3A3A' : '#F4F4F4'
  const hoverTextColor = isLight ? '#F4F4F4' : '#3A3A3A'
  const hoverBorderColor = isLight ? '#F4F4F4' : '#3A3A3A'
  const hoverIconSrc = isLight ? '/Group.svg' : '/Group2.svg'

  const sharedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    padding: '10px 20px',
    backgroundColor: hovered ? hoverBg : backgroundColor,
    border: `1.5px solid ${hovered ? hoverBorderColor : 'transparent'}`,
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  }

  const inner = (
    <>
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: '20px',
          whiteSpace: 'nowrap',
          color: hovered ? hoverTextColor : textColor,
          transition: 'color 0.3s ease',
        }}
      >
        {label}
      </span>

      <Image
        src={hovered ? hoverIconSrc : '/Group1.svg'}
        alt=""
        width={20}
        height={20}
        aria-hidden={true}
        style={{ display: 'block', flexShrink: 0 }}
      />
    </>
  )

  // Link nội bộ (vd "/#contact" từ trang blog) → dùng Next Link + scroll={false}
  // để ScrollManager cuộn tới section. Hash trong cùng trang ("#contact") giữ <a>
  // để SmoothScroll bắt và cuộn mượt.
  const isInternalRoute = href.startsWith('/')

  return (
    <div style={{ display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'flex-end' }}>
      {as === 'button' ? (
        <button
          type="submit"
          style={sharedStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {inner}
        </button>
      ) : isInternalRoute ? (
        <Link
          href={href}
          scroll={false}
          style={sharedStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {inner}
        </Link>
      ) : (
        <a
          href={href}
          style={sharedStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {inner}
        </a>
      )}
    </div>
  )
}
