import type { Metadata } from 'next'
import { Epilogue } from 'next/font/google'
import './globals.css'
import SmoothScroll from './components/SmoothScroll'

const epilogue = Epilogue({
  variable: '--font-epilogue',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'OLCO — Factory-Direct Building Materials',
  description:
    'ASNZ compliant and high-quality materials direct from factories in Asia. Precision sourcing for builders, contractors and developers.',
  keywords: ['OLCO', 'building materials', 'factory direct', 'ASNZ compliant', 'construction supply'],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={epilogue.variable}>
      <body className="antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
