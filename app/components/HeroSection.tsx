'use client'

import Image from 'next/image'
import { useRef } from 'react'
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
  const spotlightRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect || !spotlightRef.current) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const mask = `radial-gradient(circle 340px at ${x}% ${y}%, black 0%, black 25%, transparent 100%)`
    const el = spotlightRef.current
    el.style.transition = 'none'
    el.style.opacity = '1'
    el.style.maskImage = mask
    el.style.webkitMaskImage = mask
  }

  const handleMouseLeave = () => {
    if (!spotlightRef.current) return
    spotlightRef.current.style.transition = 'opacity 0.3s ease'
    spotlightRef.current.style.opacity = '0'
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white min-h-[130vh] lg:min-h-[170vh]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo — pin cố định trong hero, scroll đi cùng section (không fixed).
          Căn lề theo đúng container của Navbar để thẳng hàng với cụm menu bên phải */}
      <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
        <div className="max-w-480 mx-auto px-6 lg:px-36">
          <a href="#" className="inline-block pointer-events-auto pt-4 lg:pt-1.5">
            <Image
              src="/Layer_1.svg"
              alt="OLCO"
              width={120}
              height={68}
              priority
              className="w-27.5 lg:w-40 h-auto lg:h-22.5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </a>
        </div>
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
        {/* Fade sang trắng — phải đạt trắng 100% trước mép dưới section (mốc 85%),
            nếu không sẽ lộ đường line cắt cứng ở ranh giới với section kế tiếp */}
        <div
          className="absolute inset-x-0 bottom-0 top-[80%] lg:top-[70%]"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 85%)' }}
        />
      </div>

      {/* Vùng cuối hero đã fade sang trắng — báo cho Navbar đổi logo sang màu tối,
          nếu không logo trắng sẽ tàng hình trên nền trắng khi scroll qua đoạn này */}
      <div data-navbar-theme="light" aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: '78%' }} />

      {/* Ambient — mờ nhẹ, luôn hiện */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.15 }}>
        <Image src="/Isolation_Mode.svg" alt="" fill className="object-cover object-center" />
      </div>

      {/* Spotlight — theo chuột, GPU-accelerated */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0,
          transform: 'translateZ(0)',
          willChange: 'mask-image, opacity',
          filter: 'brightness(20)',
        }}
      >
        <Image src="/Isolation_Mode.svg" alt="" fill className="object-cover object-center" />
      </div>

      <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
        <ContourLines />
      </div>

      <div className="relative z-10 max-w-1000 mx-auto px-6 pb-24 lg:px-36 lg:pb-0">
        {/* Thay vì dùng flex-col, hãy dùng grid */}
        <div className="grid grid-cols-12 gap-y-12 pt-36 lg:pt-64.75">

          {/* H1: Chiếm 7 cột, luôn nằm trên cùng */}
          <div className="col-span-12 lg:col-span-10">
            <h1
              className="font-normal leading-[1.05] tracking-[-0.03em] text-white text-center lg:text-left"
              style={{ fontSize: 'clamp(34px, 5vw, 77px)', maxWidth: '1500px' }}
            >
              AS/NZS-Compliant Construction Materials, <br className="hidden lg:block" /> Sourced Directly from Asia
            </h1>
          </div>

          {/* Paragraph + Contact: Chiếm 12 cột, luôn nằm ở hàng dưới */}
          <div className="col-span-12 flex justify-center lg:justify-end">
            <div className="flex flex-col items-center lg:items-end" style={{ maxWidth: '510px' }}>
              <p
                className="font-normal leading-relaxed text-white text-center lg:text-right"
                style={{ fontSize: 'clamp(14px, 0.95vw, 16px)' }}
              >
                Access trusted manufacturers across Asia through OLCO&apos;s factory-direct procurement network. Reduce project costs, expand product choice, and source with confidence.
              </p>

              <div className="mt-8">
                <ContactButton label="Contact Us" backgroundColor="#F4F4F4" textColor="#3A3A3A" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-0 md:translate-y-20 flex justify-center">
          <div
            className="flex items-center justify-center gap-3 cursor-default text-[#F4F4F4] text-[14px] md:text-[18px] font-medium px-5 md:px-8 py-3 md:py-3.5 rounded-lg text-center border border-[#F4F4F4]"
          >
            Download Our Product Catalogues Here
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:translate-y-30 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3 md:justify-center" id="products">
          {categories.map((cat) => (
            <a
              key={cat}
              href="#contact"
              className="text-white text-[13px] md:text-[18px] px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 hover:opacity-80 text-center no-underline"
              style={{ background: 'rgba(58,58,58,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContourLines() {
  return <svg viewBox="0 0 1920 1922" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice"></svg>
}