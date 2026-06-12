import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
await p.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

const secH = await p.evaluate(() => document.querySelector('section').offsetHeight)
// hero bottom (abs secH) at viewport y 600
const scroll = secH - 600
await p.evaluate((y) => window.scrollTo(0, y), scroll)
await p.waitForTimeout(1000)
// freeze wave animation to rule it out / catch it deterministically? first pass: as-is
await p.screenshot({ path: 'diag-scan.png' })

// analyze pixels in-browser via canvas
const b64 = readFileSync('diag-scan.png').toString('base64')
const analyzer = await b.newPage()
const rows = await analyzer.evaluate(async (src) => {
  const img = new window.Image()
  await new Promise((res) => { img.onload = res; img.src = 'data:image/png;base64,' + src })
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const { data, width } = ctx.getImageData(0, 0, img.width, img.height)
  const out = []
  for (let y = 350; y < Math.min(820, img.height); y++) {
    let maxDev = 0, sumDev = 0
    for (let x = 10; x < width - 10; x++) {
      const i = (y * width + x) * 4
      const dev = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2])
      if (dev > maxDev) maxDev = dev
      sumDev += dev
    }
    out.push({ y, maxDev, avgDev: +(sumDev / (width - 20)).toFixed(2) })
  }
  return out
}, b64)
console.log('secH', secH, 'scroll', scroll)
console.log(JSON.stringify(rows.filter(r => r.avgDev > 1)))
await b.close()
