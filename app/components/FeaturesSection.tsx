'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import ContactButton from './ContactButton'

gsap.registerPlugin(ScrollTrigger)

const SPACER = 64

const FEATURES = [
  {
    title: 'AS/NZS Compliant',
    body: 'Every product is tested and documented to Australian and NZ standards.',
    maxWidth: '267px',
  },
  {
    title: 'Factory-Direct Sourcing',
    body: 'We work hand-in-hand with vetted Asian factories — no middlemen, no markups.',
    maxWidth: '256px',
  },
  {
    title: 'On The Ground Team',
    body: 'We have teams on the ground in China & Vietnam who are at the factory to check and monitor quality.',
    maxWidth: '280px',
  },
  {
    title: 'Australian Support Team',
    body: 'Have a question? Speak to our Australian based team today.',
    maxWidth: '280px',
  },
]

// Tổng số slot = 4 nội dung + 1 nút CTA
const SLOT_COUNT = FEATURES.length + 1

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      // Chỉ chạy hiệu ứng pin + scrub trên desktop; mobile hiển thị tĩnh
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        const icon = iconRef.current
        const track = trackRef.current
        const slots = slotRefs.current.filter((el): el is HTMLDivElement => el !== null)
        if (!icon || !track || slots.length !== SLOT_COUNT) return

        const first = slots[0]
        const last = slots[slots.length - 1]

        // Bắt đầu: slot ĐẦU nằm giữa cột phải (track là offsetParent của các slot)
        const startY = track.offsetHeight / 2 - (first.offsetTop + first.offsetHeight / 2)
        // Kết thúc: slot CUỐI nằm giữa cột phải
        const endY = startY - (last.offsetTop - first.offsetTop)
        gsap.set(track, { y: startY })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            // Quãng cuộn dài hơn → dãy chữ trượt chậm & mượt hơn (ít dịch chuyển mỗi pixel cuộn)
            end: `+=${window.innerHeight * 1.4}`,
            pin: true,
            // scrub cao hơn = catch-up mượt hơn, giảm cảm giác giật khi cuộn
            scrub: 1.5,
            // Không dùng anticipatePin: với smooth-scroll (Lenis) nó dự đoán theo vận tốc đã được
            // làm mượt nên hay "đoán hụt" → gây khựng đúng lúc bắt đầu pin. Pin đúng điểm sẽ mượt hơn.
            pinSpacing: true,
            invalidateOnRefresh: true,
          },
        })

        // Cả DÃY chữ luôn hiển thị và trượt lên liên tục như 1 khối,
        // đồng bộ tuyến tính với icon quay 0 → 180°.
        // Cuộn hết quãng = icon đủ 180° + slot cuối vào giữa → nhả pin (và ngược lại).
        tl.to(track, { y: endY, ease: 'none' }, 0)
          .to(icon, { rotation: 180, ease: 'none' }, 0)
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#3A3A3A] overflow-hidden flex items-center py-16 lg:py-0 lg:h-screen"
      style={{
        // Phủ màu nền tràn 2px ra mọi phía — che khe hở sub-pixel (line trắng) khi ScrollTrigger
        // pin section và quanh section ở DPR lẻ (Windows scaling 125%/150%)
        boxShadow: '0 0 0 2px #3A3A3A',
      }}
    >
      <div
        className="w-full mx-auto grid grid-cols-12 gap-8 items-center px-6 lg:px-36"
        style={{ maxWidth: '1440px' }}
      >
        {/* Left — rotating OLCO mark, pin tại chỗ — ẩn trên mobile theo thiết kế */}
        <div className="hidden lg:flex lg:col-span-6 items-center justify-start">
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

        {/* Right — Cột Track (mang theo 5 slot: 4 nội dung + CTA) */}
        <div className="col-span-12 lg:col-span-6">
          <div ref={trackRef} className="relative" style={{ willChange: 'transform' }}>
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className={i > 0 ? 'mt-7 lg:mt-0' : undefined}>
                {i > 0 && <div className="hidden lg:block" style={{ height: `${SPACER}px` }} />}
                <div
                  ref={(el) => {
                    slotRefs.current[i] = el
                  }}
                >
                  <h3
                    className="font-medium text-white md:mb-4"
                    style={{ fontSize: 'clamp(24px, 2.3vw, 40px)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-white leading-relaxed"
                    style={{ fontSize: 'clamp(14px, 0.95vw, 17px)', maxWidth: feature.maxWidth }}
                  >
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Spacer — chỉ hiện ở desktop */}
            <div className="hidden lg:block" style={{ height: `${SPACER}px` }} />

            {/* Slot 5 — CTA */}
            <div
              className="mt-10 lg:mt-0"
              ref={(el) => {
                slotRefs.current[FEATURES.length] = el
              }}
            >
              <ContactButton label="Get A Free Quote" href="#contact" align="left" backgroundColor="#F4F4F4" textColor="#3A3A3A" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
