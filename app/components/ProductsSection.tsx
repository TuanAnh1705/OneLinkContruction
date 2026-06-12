'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue, useSpring } from 'framer-motion'
import ContactButton from './ContactButton'

const text =
  'Currently available exclusively to existing customers – sign up now to gain early access to ASNZ-compliant factories before opening to the wider market.'
const words = text.split(' ')

// Component con xử lý chữ: Chỉ HIỆN ra và GIỮ NGUYÊN
function ScrollWord({
  word,
  index,
  total,
  progress, 
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
}) {
  // Bắt đầu hiện từ 5% tiến trình, tạo độ trễ (stagger) cho từng chữ
  const startEnter = 0.05 + (index / total) * 0.25
  const endEnter = startEnter + 0.1

  // Bỏ hẳn startExit và endExit. 
  // Sau khi qua mốc endEnter, giá trị sẽ giữ nguyên cho đến hết (mốc 1).
  const opacity = useTransform(
    progress,
    [0, startEnter, endEnter, 1],
    [0, 0, 1, 1]
  )
  const y = useTransform(
    progress,
    [0, startEnter, endEnter, 1],
    [16, 16, 0, 0]
  )
  // Trả về 'none' khi blur đã về 0 — 'blur(0px)' vẫn bắt browser chạy filter
  // pipeline cho từng chữ trên mỗi frame dù không còn nhìn thấy gì
  const blurPx = useTransform(
    progress,
    [0, startEnter, endEnter, 1],
    [8, 8, 0, 0]
  )
  const blur = useTransform(blurPx, (v) => (v < 0.05 ? 'none' : `blur(${v}px)`))

  return (
    <motion.span
      style={{ opacity, y, filter: blur, display: 'inline-block', marginRight: '0.28em' }}
    >
      {word}
    </motion.span>
  )
}

export default function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Dùng useSpring để thanh cuộn có quán tính mượt mà
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, 
    damping: 30,    
    restDelta: 0.001
  })

  // Hiệu ứng Hình ảnh và Nút: HIỆN DẦN từ 10% đến 45%, sau 45% thì GIỮ NGUYÊN RÕ NÉT.
  // Khi cuộn ngược từ dưới lên vượt qua mốc 45% mới bắt đầu tua ngược về mờ.
  const sharedBlurPx = useTransform(
    smoothProgress,
    [0, 0.1, 0.45, 1],
    [24, 24, 0, 0]
  )
  // 'none' khi đã rõ nét — tránh giữ filter blur(0px) trên ảnh lớn mỗi frame
  const sharedBlur = useTransform(sharedBlurPx, (v) => (v < 0.05 ? 'none' : `blur(${v}px)`))
  
  const sharedOpacity = useTransform(
    smoothProgress,
    [0, 0.1, 0.45, 1],
    [0, 0, 1, 1]
  )
  
  const imageScale = useTransform(
    smoothProgress,
    [0, 0.1, 0.45, 1],
    [1.1, 1.1, 1, 1]
  )
  
  const elementY = useTransform(
    smoothProgress,
    [0, 0.1, 0.45, 1],
    [60, 60, 0, 0] 
  )

  return (
    <section ref={sectionRef} className="relative w-full bg-white md:py-32 py-10 md:translate-y-0 -translate-y-5 overflow-hidden" data-navbar-theme="light">
      <div className="max-w-360 mx-auto px-6 lg:px-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-0 items-center relative">

          {/* Lớp Chữ */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 relative z-10 flex flex-col justify-between h-full min-h-87.5 pointer-events-none">
            
            <p className="font-normal text-[#0a0b10] leading-10 pointer-events-auto" style={{ fontSize: 'clamp(20px, 2vw, 42px)' }}>
              {words.map((word, i) => (
                <ScrollWord 
                  key={i} 
                  word={word} 
                  index={i} 
                  total={words.length} 
                  progress={smoothProgress} 
                />
              ))}
            </p>

            <motion.div 
              style={{ filter: sharedBlur, opacity: sharedOpacity, y: elementY }}
              className="pointer-events-auto md:translate-y-0 -translate-y-25 md:mt-auto md:pt-10"
            >
              <ContactButton label="Sign Up Here" href="#contact" align="left" backgroundColor="#3A3A3A" textColor="#F4F4F4" />
            </motion.div>
          </div>

          {/* Lớp Ảnh */}
          <div className="lg:col-span-8 lg:col-start-5 lg:row-start-1 relative z-0 md:translate-y-0 -translate-y-20 lg:pt-40">
            <motion.div
              className="overflow-hidden rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[120px]"
              style={{ filter: sharedBlur, opacity: sharedOpacity, scale: imageScale, y: elementY }}
            >
              <Image
                src="/Gemini_Generated_Image_ljpop7ljpop7ljpo 1.png"
                alt="ASNZ-compliant factory architectural sketch"
                width={860}
                height={660}
                quality={90}
                className="w-full h-auto object-contain block"
              />
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  )
}