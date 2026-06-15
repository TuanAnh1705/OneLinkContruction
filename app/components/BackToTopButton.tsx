'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackToTopButton() {
  const [onLight, setOnLight] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-navbar-theme]')
    )

    const checkTheme = () => {
      rafRef.current = 0
      // Check tại vị trí button (góc dưới phải, ~60px từ đáy viewport)
      const checkY = window.innerHeight - 60
      let light = false
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= checkY && rect.bottom >= checkY) {
          light = section.dataset.navbarTheme === 'light'
        }
      }
      setOnLight(light)
    }

    const onScroll = () => {
      setVisible(window.scrollY > 300)
      if (!rafRef.current) rafRef.current = requestAnimationFrame(checkTheme)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    checkTheme()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const bg = onLight ? '#0a0b10' : '#FFFFFF'
  const hoverBg = onLight ? '#F4F4F4' : '#3A3A3A'
  const arrowColor = hovered
    ? (onLight ? '#3A3A3A' : '#F4F4F4')
    : (onLight ? '#FFFFFF' : '#0a0b10')
  const borderColor = hovered
    ? (onLight ? '#3A3A3A' : '#F4F4F4')
    : 'transparent'

  return (
    <a
      href="#top"
      aria-label="Back to top"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: hovered ? hoverBg : bg,
        border: `1.5px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 40,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        textDecoration: 'none',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, opacity 0.35s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 12.5V3.5M8 3.5L3.5 8M8 3.5L12.5 8"
          stroke={arrowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
    </a>
  )
}
