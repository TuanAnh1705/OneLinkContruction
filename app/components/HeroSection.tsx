'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import ContactButton from './ContactButton'

const categories = [
  'Cabinetry',
  'Windows & Doors',
  'Plumbing & Sanitary',
  'Stone & Benchtops',
  'Tiles & Flooring',
  'Finishing Products',
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Dừng animation sóng khi hero không còn trong viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      el.classList.toggle('waves-paused', !entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-white min-h-[110vh] lg:min-h-[170vh]">
      {/* Logo mobile — nằm trong hero, scroll đi cùng section (không fixed) */}
      <div className="absolute top-4 left-6 z-20 lg:hidden">
        <Image
          src="/Layer_1.svg"
          alt="OLCO"
          width={120}
          height={68}
          priority
          style={{ width: 110, height: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* ── Background building image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Rectangle 1.png"
          alt=""
          fill
          priority
          quality={95}
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white" style={{ top: '70%' }} />
      </div>

      {[0, 2.5].map((delay) => (
        <div
          key={delay}
          className="isolation-wave-container"
          style={{ zIndex: 1, animationDelay: `${delay}s`, opacity: 0.65 }}
        >
          <Image src="/Isolation_Mode.svg" alt="" fill className="object-cover object-center" />
        </div>
      ))}

      <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
        <ContourLines />
      </div>

      <div className="relative z-10 max-w-1000 mx-auto px-6 pb-24 lg:px-36 lg:pb-0">
        {/* Thay vì dùng flex-col, hãy dùng grid */}
        <div className="grid grid-cols-12 gap-y-12 pt-36 lg:pt-64.75">

          {/* H1: Chiếm 7 cột, luôn nằm trên cùng */}
          <div className="col-span-12 lg:col-span-10">
            <h1
              className="font-normal leading-[1.05] tracking-[-0.03em] text-white text-left"
              style={{ fontSize: 'clamp(34px, 5vw, 77px)', maxWidth: '1500px' }}
            >
              AS/NZ compliant materials, sourced directly from Asia
            </h1>
          </div>

          {/* Paragraph + Contact: Chiếm 12 cột, luôn nằm ở hàng dưới */}
          <div className="col-span-12 flex justify-end">
            <div className="flex flex-col items-end" style={{ maxWidth: '510px' }}>
              <p
                className="font-normal leading-relaxed text-white text-right"
                style={{ fontSize: 'clamp(14px, 0.95vw, 16px)' }}
              >
                Access high-quality, compliant materials through OLCO’s factory network. Reduce costs while unlocking a wider range of products, finishes, and custom manufacturing solutions.
              </p>

              <div className="mt-8">
                <ContactButton label="Contact Us" backgroundColor="#F4F4F4" textColor="#3A3A3A" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:translate-y-20 flex justify-center">
          <a
            href="#products"
            className="flex items-center gap-3 text-[#1F1F21] text-[18px] font-medium px-8 py-3.5 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{ background: '#D6D9DB' }}
          >
            Download Our Product Catalogues Here
          </a>
        </div>

        <div className="md:translate-y-30 flex flex-wrap gap-3 justify-center" id="products">
          {categories.map((cat) => (
            <button
              key={cat}
              className="text-white text-[18px] px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-80"
              style={{ background: 'rgba(31,31,33,0.22)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContourLines() {
  return <svg viewBox="0 0 1920 1922" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice"></svg>
}