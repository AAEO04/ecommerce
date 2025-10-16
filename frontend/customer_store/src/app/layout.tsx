import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MAD RUSH - NO CHILLS, Just Style',
  description: 'Premium streetwear and urban fashion. Express your bold personality with MAD RUSH.',
  keywords: 'streetwear, urban fashion, clothing, style, MAD RUSH',
  openGraph: {
    title: 'MAD RUSH - NO CHILLS, Just Style',
    description: 'Premium streetwear and urban fashion. Express your bold personality with MAD RUSH.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-secondary-50 min-h-screen flex flex-col`}>
        <CartProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
