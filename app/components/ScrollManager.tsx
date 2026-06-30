'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

type Lenis = {
  scrollTo: (target: number | HTMLElement, opts?: Record<string, unknown>) => void
  resize: () => void
}

// Lenis được khởi tạo 1 lần trong SmoothScroll và sống xuyên suốt các route,
// nên vị trí cuộn KHÔNG tự reset khi đổi trang. Component này xử lý điều đó:
//  - URL có hash  → cuộn tới đúng section (đợi section mount + resize Lenis).
//  - URL không hash → luôn cuộn lên đầu trang.
export default function ScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis
    const hash = decodeURIComponent(window.location.hash.slice(1))

    if (!hash) {
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
      return
    }

    const correctors: ReturnType<typeof setTimeout>[] = []

    const goToSection = (el: HTMLElement, lenis: Lenis) => {
      // Trang mới (landing) cao hơn trang blog → Lenis phải resize lại,
      // nếu không scrollTo sẽ bị kẹp (clamp) ở giới hạn cuộn cũ.
      lenis.resize()
      lenis.scrollTo(el, { duration: 1.0, force: true })
      // Ảnh/section phía trên load xong có thể làm dịch layout → chỉnh lại vài lần.
      for (const delay of [350, 800]) {
        correctors.push(
          setTimeout(() => {
            lenis.resize()
            lenis.scrollTo(el, { duration: 0.5, force: true })
          }, delay)
        )
      }
    }

    // Đợi tới khi section mount xong rồi mới cuộn. Dùng deadline theo thời gian
    // (không phải số frame) để sống sót qua lần compile nguội của Next dev /
    // trang mount chậm — nếu không poll hết sớm sẽ nằm lại ở đầu trang (hero).
    const deadline = performance.now() + 10000
    const run = () => {
      const el = document.getElementById(hash)
      const lenis = getLenis()
      if (el && lenis) {
        goToSection(el, lenis)
      } else if (el) {
        el.scrollIntoView()
      } else if (performance.now() < deadline) {
        requestAnimationFrame(run)
      }
    }
    requestAnimationFrame(run)

    return () => correctors.forEach(clearTimeout)
  }, [pathname])

  return null
}
