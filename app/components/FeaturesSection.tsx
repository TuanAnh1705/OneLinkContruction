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

        // 180° băm đều cho 5 slot — mỗi slot icon quay thêm 36°
        const ROTATION_STEP = 180 / SLOT_COUNT

        // Căn track sao cho slot đang active luôn nằm giữa cột phải
        // (track là offsetParent của các slot nhờ position: relative)
        const baseY = track.offsetHeight / 2 - (slots[0].offsetTop + slots[0].offsetHeight / 2)
        gsap.set(track, { y: baseY })

        // Khởi tạo: mọi slot đều ẩn (opacity: 0) và tụt xuống 120px
        gsap.set(slots, { opacity: 0, y: 120 })

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

        slots.forEach((slot, i) => {
          const label = `phase${i + 1}`

          // Mỗi nhịp: icon quay thêm 36° (nhịp cuối chạm đúng 180°)
          tl.addLabel(label, i === 0 ? 0 : '+=0.4')
            .to(icon, { rotation: ROTATION_STEP * (i + 1), duration: 1, ease: 'none' }, label)

          if (i === 0) {
            // Slot 1 tĩnh tại, vừa FADE IN vừa FLOAT lên đúng vị trí gốc (y: 0)
            tl.to(slot, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, label)
          } else {
            // Track trượt lên, đưa slot kế tiếp vào đúng vị trí giữa
            tl.to(
              track,
              {
                y: baseY - (slot.offsetTop - slots[0].offsetTop),
                duration: 1,
                ease: 'power2.inOut',
              },
              label
            )
              // Slot nối đuôi: vừa FADE IN vừa FLOAT lên trong lúc track đang trượt
              .to(slot, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, `${label}+=0.2`)
          }
        })
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#3A3A3A] overflow-hidden flex items-center py-20 lg:py-0 lg:h-screen"
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
              <div key={feature.title}>
                {i > 0 && <div style={{ height: `${SPACER}px` }} />}
                <div
                  ref={(el) => {
                    slotRefs.current[i] = el
                  }}
                >
                  <h3
                    className="font-medium text-white mb-4"
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

            {/* Spacer */}
            <div style={{ height: `${SPACER}px` }} />

            {/* Slot 5 — CTA */}
            <div
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
