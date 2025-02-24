import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// Monomakh

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prayer Times',
  description:
    'Get prayer times for the day, with a countdown for the time pray.',
  other: {
    'theme-color': '#1e293b',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
