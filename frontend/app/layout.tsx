import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NjangiTrack - Community Savings Management',
  description: 'Digital Njangi Group Management System for Cameroon',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
