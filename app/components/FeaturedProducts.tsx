'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Product {
  id: string
  number: string
  title: string
  imageSrc: string
}

const products: Product[] = [
  { id: '1', number: '1/6', title: 'Cabinetry',           imageSrc: '/Rectangle 4.png' },
  { id: '2', number: '2/6', title: 'Windows & Doors',     imageSrc: '/Rectangle 5.png' },
  { id: '3', number: '3/6', title: 'Tiles & Flooring',    imageSrc: '/Rectangle 6.png' },
  { id: '4', number: '4/6', title: 'Plumbing & Sanitary', imageSrc: '/Rectangle 7.png' },
  { id: '5', number: '5/6', title: 'Stone & Benchtops',   imageSrc: '/Rectangle 8.png' },
  { id: '6', number: '6/6', title: 'Finishing Products',  imageSrc: '/Rectangle 9.png' },
]

const GAP = 32        // px — phải khớp với class gap-8 trên track & group
const SPEED = 60      // px/giây — tốc độ auto-scroll

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="shrink-0 flex flex-col w-[80vw] sm:w-[calc(33.333vw-2.667rem)] select-none">
      {/* Icon + number + dotted rule */}
      <div className="flex items-center gap-2 mb-4">
        <Image
          src="/Layer_4.svg"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
        />
        <span className="text-[#0a0b10]/50 text-base tracking-widest shrink-0">
          [{product.number}]
        </span>
        <div className="flex-1 border-t border-dashed border-[#0a0b10]/20" />
      </div>

      {/* Image frame */}
      <div className="relative overflow-hidden rounded-2xl aspect-4/3 w-full">
        <Image
          src={product.imageSrc}
          alt={product.title}
          fill
          quality={85}
          sizes="(max-width: 640px) 80vw, 33vw"
          className="object-cover object-center pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#0a0b10]/8 pointer-events-none" />
      </div>

      {/* Label */}
      <p
        className="mt-4 uppercase text-[#3A3A3A]"
        style={{ fontSize: 'clamp(20px, 2vw, 32px)' }}
      >
        {product.title}
      </p>
    </div>
  )
}

// ─── Drag cursor (chip < ─ Drag ─ chip >) ─────────────────────────────────────

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path
        d="M5 2.5 L9.5 7 L5 11.5"
        stroke="#66A3FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)
  const cursorRef  = useRef<HTMLDivElement>(null)
  const offsetRef  = useRef(0)
  const loopWidthRef = useRef(0)
  const draggingRef  = useRef(false)
  const lastXRef     = useRef(0)
  const visibleRef   = useRef(true)
  const [cursorOn, setCursorOn] = useState(false)

  // Chỉ chạy marquee khi section nằm trong viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Đo chiều rộng 1 vòng lặp (1 group + gap giữa 2 group)
  useEffect(() => {
    const measure = () => {
      const group = trackRef.current?.children[0] as HTMLElement | undefined
      if (group) loopWidthRef.current = group.offsetWidth + GAP
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Vòng rAF: auto chạy phải → trái, wrap vô hạn
  useEffect(() => {
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now

      if (!visibleRef.current) {
        raf = requestAnimationFrame(loop)
        return
      }

      if (!draggingRef.current) offsetRef.current -= SPEED * dt

      const w = loopWidthRef.current
      if (w > 0) {
        if (offsetRef.current <= -w) offsetRef.current += w
        if (offsetRef.current > 0)   offsetRef.current -= w
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Cursor bám chuột trực tiếp trong event handler — không qua state/spring để nhạy tối đa
  const moveCursor = (x: number, y: number) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    lastXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    moveCursor(e.clientX, e.clientY)
    if (draggingRef.current) {
      offsetRef.current += e.clientX - lastXRef.current
      lastXRef.current = e.clientX
    }
  }

  const endDrag = () => {
    draggingRef.current = false
  }

  return (
    <section
      ref={sectionRef}
      // -mt-6: kéo cả khối từ đây xuống Footer lên 24px cho sát với ProductsSection.
      // Mobile kéo thêm 20px (-mt-11 = 44px) vì ProductsSection dùng -translate-y-5
      // (chỉ dịch hình, không dịch layout) nên để lại khe ~20px phía trên ở mobile.
      className="relative w-full py-10 md:py-24 -mt-30 md:-mt-6 bg-white"
      aria-label="Featured Products"
      data-navbar-theme="light"
    >
      {/* Heading */}
      <div className="px-8 sm:px-14 mb-12 text-center">
        <h2
          className="font-medium text-[#0a0b10] tracking-tight"
          style={{ fontSize: 'clamp(28px, 4vw, 64px)' }}
        >
          Featured Products
        </h2>
      </div>

      {/* Marquee viewport */}
      <div
        className="overflow-hidden touch-pan-y"
        style={{ cursor: cursorOn ? 'none' : 'auto' }}
        onMouseEnter={(e) => {
          setCursorOn(true)
          moveCursor(e.clientX, e.clientY)
        }}
        onMouseLeave={() => {
          setCursorOn(false)
          endDrag()
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Track: 2 group giống hệt nhau để loop liền mạch */}
        <div ref={trackRef} className="flex gap-8 w-max will-change-transform">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-8" aria-hidden={dup === 1}>
              {products.map((p) => (
                <ProductCard key={`${dup}-${p.id}`} product={p} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Custom drag cursor */}
      <div
        ref={cursorRef}
        className="fixed left-0 top-0 z-50 pointer-events-none hidden lg:flex items-center gap-3 transition-opacity duration-200"
        style={{ opacity: cursorOn ? 1 : 0 }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 34, height: 34, borderRadius: 10, background: '#3A3A3A' }}
        >
          <Chevron direction="left" />
        </div>
        <div
          className="flex items-center justify-center"
          style={{
            padding: '18px 19px',
            borderRadius: 13,
            background: '#3A3A3A',
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          Drag
        </div>
        <div
          className="flex items-center justify-center"
          style={{ width: 34, height: 34, borderRadius: 10, background: '#3A3A3A' }}
        >
          <Chevron direction="right" />
        </div>
      </div>
    </section>
  )
}
