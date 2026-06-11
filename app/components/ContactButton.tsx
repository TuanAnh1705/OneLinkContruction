'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ContactButtonProps {
  label?: string
  href?: string
  align?: 'left' | 'right'
  backgroundColor?: string
  textColor?: string
  as?: 'a' | 'button'
}

const FONT_SIZE = 18
const LINE_H = 24
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'
const TRANSITION = `transform 0.4s ${EASE}`

export default function ContactButton({
  label = 'Contact Us',
  href = '#contact',
  align = 'right',
  backgroundColor = '#F4F4F4',
  textColor = '#3A3A3A',
  as = 'a',
}: ContactButtonProps) {
  const [hovered, setHovered] = useState(false)

  const sharedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 16,
    borderRadius: 10,
    padding: '14px 22px',
    backgroundColor,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
  }

  const spanBase: React.CSSProperties = {
    display: 'block',
    fontSize: FONT_SIZE,
    fontWeight: 600,
    lineHeight: `${LINE_H}px`,
    whiteSpace: 'nowrap',
    color: textColor,
    transition: TRANSITION,
  }

  const inner = (
    <>
      <div style={{ position: 'relative', overflow: 'hidden', height: LINE_H }}>
        {/* rolls up on hover */}
        <span style={{ ...spanBase, transform: hovered ? 'translateY(-100%)' : 'translateY(0%)' }}>
          {label}
        </span>
        {/* enters from bottom on hover */}
        <span style={{ ...spanBase, position: 'absolute', top: 0, left: 0, transform: hovered ? 'translateY(0%)' : 'translateY(100%)' }}>
          {label}
        </span>
      </div>

      <Image
        src="/Group1.svg"
        alt=""
        width={28}
        height={28}
        aria-hidden={true}
        style={{ display: 'block', flexShrink: 0 }}
      />
    </>
  )

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
