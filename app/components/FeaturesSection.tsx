'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import ContactButton from './ContactButton'

gsap.registerPlugin(ScrollTrigger)

const SPACER = 64

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const item1Ref = useRef<HTMLDivElement>(null)
  const item2Ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Chỉ chạy hiệu ứng pin + scrub trên desktop; mobile hiển thị tĩnh
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        const icon = iconRef.current
        const track = trackRef.current
        const item1 = item1Ref.current
        const item2 = item2Ref.current
        if (!icon || !track || !item1 || !item2) return

        const h1 = item1.offsetHeight
        const stepH = h1 + SPACER

        // 1. Khởi tạo: Cả Slot 1 và Slot 2 đều ẩn (opacity: 0) và tụt xuống 40px (y: 40)
        gsap.set([item1, item2], { opacity: 0, y: 120 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${window.innerHeight * 2.5}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        })

        // NHỊP 1: Icon quay từ 0° -> 90°
        tl.addLabel('phase1', 0)
          .to(icon, { rotation: 90, duration: 1, ease: 'none' }, 'phase1')
          // Slot 1 tĩnh tại, vừa FADE IN vừa FLOAT lên đúng vị trí gốc (y: 0)
          // Dùng ease 'power2.out' để hiệu ứng trượt lên trông tự nhiên và có độ giảm tốc
          .to(item1, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 'phase1')

        // NHỊP 2: Icon quay tiếp từ 90° -> 180°
        tl.addLabel('phase2', '+=0.4')
          // Track trượt lên trên, đẩy Slot 1 lên cao
          .to(track, { y: -stepH, duration: 1, ease: 'power2.inOut' }, 'phase2')
          .to(icon, { rotation: 180, duration: 1, ease: 'none' }, 'phase2')
          // Slot 2 nối đuôi: vừa FADE IN vừa FLOAT lên (y: 0) trong lúc track cũng đang trượt
          .to(item2, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 'phase2+=0.2')
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#3A3A3A] overflow-hidden flex items-center py-20 lg:py-0 lg:h-screen"
      style={{
        // Phủ màu nền vượt mép trên 2px — che khe hở sub-pixel (line trắng) khi ScrollTrigger pin section
        boxShadow: '0 -2px 0 #3A3A3A',
      }}
    >
      <div
        className="w-full mx-auto grid grid-cols-12 gap-8 items-center px-6 lg:px-36"
        style={{ maxWidth: '1440px' }}
      >
        {/* Left — rotating OLCO mark, pin tại chỗ */}
        <div className="col-span-12 lg:col-span-6 flex items-center justify-start">
          <div
            ref={iconRef}
            className="relative"
            style={{
              width: 'clamp(260px, 27.7vw, 532px)',
              height: 'clamp(200px, 21.4vw, 410px)',
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <Image src="/Layer_2.svg" alt="OLCO mark" fill className="object-contain" />
          </div>
        </div>

        {/* Right — Cột Track (mang theo Slot 1 và Slot 2) */}
        <div className="col-span-12 lg:col-span-6">
          <div ref={trackRef} style={{ willChange: 'transform' }}>
            
            {/* Slot 1 */}
            <div ref={item1Ref}>
              <h3
                className="font-medium text-white mb-4"
                style={{ fontSize: 'clamp(24px, 2.3vw, 40px)' }}
              >
                AS/NZS Compliant
              </h3>
              <p
                className="text-white leading-relaxed"
                style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '267px' }}
              >
                Every product is tested and documented to Australian and NZ standards.
              </p>
            </div>

            {/* Spacer */}
            <div style={{ height: `${SPACER}px` }} />

            {/* Slot 2 + CTA */}
            <div ref={item2Ref}>
              <h3
                className="font-medium text-white mb-4"
                style={{ fontSize: 'clamp(24px, 2.3vw, 40px)' }}
              >
                Factory-Direct Sourcing
              </h3>
              <p
                className="text-white leading-relaxed"
                style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: '256px' }}
              >
                We work hand-in-hand with vetted Asian factories — no middlemen, no markups.
              </p>
              <div className="mt-14">
                <ContactButton label="Get A Free Quote" href="#contact" align="left" backgroundColor="#F4F4F4" textColor="#3A3A3A" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}