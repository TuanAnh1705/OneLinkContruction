'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const navLinks = ['Services', 'Products', 'Why OLCO', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [logoOnLight, setLogoOnLight] = useState(false)

  // Ref để scroll handler luôn thấy giá trị menuOpen mới nhất
  const menuOpenRef = useRef(false)
  useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])

  useEffect(() => {
    // Cache danh sách section 1 lần + gom việc đọc layout vào rAF (1 lần/frame)
    // thay vì querySelectorAll + getBoundingClientRect trên MỖI scroll event
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-navbar-theme]')
    )
    let raf = 0
    const checkLogoTheme = () => {
      raf = 0
      const logoY = 51
      let onLight = false
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= logoY && rect.bottom >= logoY) {
          onLight = section.dataset.navbarTheme === 'light'
        }
      }
      setLogoOnLight(onLight)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(checkLogoTheme)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    checkLogoTheme()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const nowScrolled = window.scrollY > 80
      setScrolled(nowScrolled)
      // Scroll lên đầu trang → tự đóng dropdown
      if (!nowScrolled && menuOpenRef.current) {
        setIsClosing(true)
        setTimeout(() => {
          setMenuOpen(false)
          setIsClosing(false)
          setHoveredLink(null)
        }, 260)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openMenu = () => setMenuOpen(true)

  const closeMenu = () => {
    setIsClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setIsClosing(false)
      setHoveredLink(null)
    }, 260)
  }

  // Pill is hidden only when menu is fully open (not while closing)
  const pillHidden = menuOpen && !isClosing

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className="max-w-480 mx-auto flex items-center justify-between px-6 h-18 lg:px-36 lg:h-25.5"
      >
        {/* Logo — desktop only; mobile logo nằm cố định trong HeroSection */}
        <a href="#" className="hidden lg:block shrink-0" style={{ alignSelf: 'center', lineHeight: 0 }}>
          <Image
            src="/Layer_1.svg"
            alt="OLCO"
            width={120}
            height={40}
            priority
            style={{
              display: 'block',
              width: '160px',
              height: '90px',
              filter: logoOnLight ? 'brightness(0)' : 'brightness(0) invert(1)',
              transition: 'filter 0.3s ease',
            }}
          />
        </a>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">

          <div className="relative">
            {/* Pill — fades out when menu opens, fades back in when closing */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(58, 58, 58, 0.5)',
                backdropFilter: 'blur(11.4px)',
                WebkitBackdropFilter: 'blur(11.4px)',
                borderRadius: '10px',
                padding: '10px 14px',
                overflow: 'hidden',
                opacity: pillHidden ? 0 : 1,
                pointerEvents: pillHidden ? 'none' : 'auto',
                transition: pillHidden
                  ? 'opacity 0.1s ease'
                  : 'opacity 0.18s ease 0.12s',
              }}
            >
              {/* Nav links — visible pre-scroll */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: scrolled ? '0px' : '32px',
                  maxWidth: scrolled ? '0px' : '500px',
                  opacity: scrolled ? 0 : 1,
                  overflow: 'hidden',
                  pointerEvents: scrolled ? 'none' : 'auto',
                  transition: 'max-width 0.5s ease, opacity 0.4s ease, gap 0.3s ease',
                }}
              >
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                    className="text-[15px] font-medium text-[#FFFFFF] hover:text-white/70 transition-colors duration-200"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {link}
                  </a>
                ))}
              </div>

              {/* Menu button — visible post-scroll */}
              <button
                onClick={openMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: scrolled ? '10px' : '0px',
                  maxWidth: scrolled ? '180px' : '0px',
                  opacity: scrolled ? 1 : 0,
                  overflow: 'hidden',
                  pointerEvents: scrolled ? 'auto' : 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'max-width 0.5s ease, opacity 0.4s ease, gap 0.3s ease',
                }}
              >
                <span style={{ whiteSpace: 'nowrap', color: 'white', fontWeight: 500, fontSize: '15px' }}>
                  Menu
                </span>
                <Image
                  src="/Group.svg"
                  alt=""
                  width={26}
                  height={20}
                  style={{ display: 'block', flexShrink: 0 }}
                />
              </button>
            </div>

            {/* Dropdown — morphs from exact pill position downward */}
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  minWidth: '190px',
                  background: 'rgba(58, 58, 58, 0.5)',
                  backdropFilter: 'blur(11.4px)',
                  WebkitBackdropFilter: 'blur(11.4px)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  padding: '4px',
                  animation: isClosing
                    ? 'dropdownMorphClose 0.26s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    : 'dropdownMorphOpen 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                {/* Close row — FFFFFF 8% frame, centered, rounded */}
                <button
                  onClick={closeMenu}
                  style={{
                    width: 'calc(100% - 17px)',
                    margin: '4px auto 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 13px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '15px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    Close
                  </span>
                  <Image
                    src="/Group.svg"
                    alt=""
                    width={26}
                    height={20}
                    style={{ display: 'block', flexShrink: 0, opacity: 0.6 }}
                  />
                </button>

                {/* Nav links */}
                <div style={{ padding: '4px 0 2px' }}>
                  {navLinks.map((link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={closeMenu}
                      onMouseEnter={() => setHoveredLink(link)}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        display: 'block',
                        padding: '9px 12px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'white',
                        opacity: hoveredLink === null || hoveredLink === link ? 1 : 0.7,
                        transition: 'opacity 0.15s ease',
                        textDecoration: 'none',
                      }}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Build With Us */}
          <a
            href="#contact"
            className="btn-build shrink-0 flex items-center font-semibold"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '15px',
              whiteSpace: 'nowrap',
              background: logoOnLight ? '#1a1a1a' : '#F4F4F4',
              color: logoOnLight ? '#ffffff' : '#3A3A3A',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
          >
            Build With Us
          </a>
        </div>

        {/* Mobile hamburger — 3 gạch gradient, nền trắng/đen đổi theo màu nền section */}
        <button
          className="lg:hidden ml-auto flex flex-col items-center justify-center gap-1.5 rounded-xl"
          aria-label="Menu"
          onClick={() => menuOpen ? closeMenu() : openMenu()}
          style={{
            width: 48,
            height: 48,
            background: logoOnLight ? '#0a0b10' : '#FFFFFF',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            transition: 'background 0.3s ease',
          }}
        >
          <span className="block w-6 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #66A3FF, #99C2FF)' }} />
          <span className="block w-4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #66A3FF, #99C2FF)' }} />
          <span className="block w-6 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #66A3FF, #99C2FF)' }} />
        </button>
      </div>

      {/* Mobile drawer — trượt từ rìa phải vào, chiếm 1/2 màn hình, cao full */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${menuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={closeMenu}
          className="absolute inset-0 bg-black/50"
          style={{
            opacity: menuOpen && !isClosing ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Panel */}
        <div
          className="absolute top-0 right-0 h-full w-1/2 min-w-57.5 flex flex-col"
          style={{
            background: 'rgba(26, 26, 28, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            transform: menuOpen && !isClosing ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {/* Close row */}
          <button
            onClick={closeMenu}
            className="flex items-center justify-between"
            style={{
              padding: '24px 24px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 500 }}>Close</span>
            <Image src="/Group.svg" alt="" width={26} height={20} style={{ opacity: 0.6 }} />
          </button>

          {/* Nav links */}
          <div className="flex flex-col" style={{ padding: '8px 24px' }}>
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                onClick={closeMenu}
                style={{
                  display: 'block',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA — đáy panel */}
          <div className="mt-auto" style={{ padding: '24px' }}>
            <a
              href="#contact"
              onClick={closeMenu}
              className="flex items-center justify-center font-semibold"
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                fontSize: '15px',
                background: '#F4F4F4',
                color: '#3A3A3A',
                textDecoration: 'none',
              }}
            >
              Build With Us
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
