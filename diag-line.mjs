import { chromium } from 'playwright'

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
await p.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

// hero bottom = section height; put it mid-viewport
const secH = await p.evaluate(() => document.querySelector('section').offsetHeight)
const target = secH - 422
await p.evaluate((y) => window.scrollTo(0, y), target)
await p.waitForTimeout(800)
await p.screenshot({ path: 'diag-0-all.png' })

// hide waves
await p.evaluate(() => document.querySelectorAll('.isolation-wave-container').forEach(e => e.style.display = 'none'))
await p.waitForTimeout(300)
await p.screenshot({ path: 'diag-1-nowaves.png' })

// also hide bg image wrapper (first z-0 div in hero)
await p.evaluate(() => {
  const sec = document.querySelector('section')
  sec.querySelector(':scope > div.absolute.inset-0.z-0').style.display = 'none'
})
await p.waitForTimeout(300)
await p.screenshot({ path: 'diag-2-noimg.png' })

console.log('sectionH', secH, 'scrolled to', target)
await b.close()
