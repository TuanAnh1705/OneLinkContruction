import type { Metadata } from 'next'
import { Epilogue } from 'next/font/google'
import './globals.css'
import SmoothScroll from './components/SmoothScroll'
import ScrollManager from './components/ScrollManager'

const epilogue = Epilogue({
  variable: '--font-epilogue',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'OLCO | Factory-Direct AS/NZS Compliant Building Materials',
  description:
    'Import certified building materials directly from audited Asian factories with OLCO. On-site QC in Vietnam & China guarantees strict AS/NZS compliance.',
  keywords: [
    'factory direct building materials asia',
    'audited asian factories',
    'wholesale construction supplies',
    'b2b sourcing china vietnam',
    'commercial cabinetry sourcing',
    'certified building products',
  ],
  icons: { icon: '/Frame 65.svg' },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={epilogue.variable}>
      <body className="antialiased">
        <SmoothScroll>
          <ScrollManager />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
