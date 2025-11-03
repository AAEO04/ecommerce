import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Template from '@/template';
import { AnimationProvider } from '@/context/AnimationContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MAD RUSH - NO CHILLS, Just Style',
  description: 'Premium streetwear and urban fashion. Express your bold personality with MAD RUSH.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-background min-h-screen flex flex-col antialiased`}>
        <AnimationProvider>
          <Header />
          <main className="flex-grow">
            <Template>
              {children}
            </Template>
          </main>
          <Footer />
          <Toaster />
        </AnimationProvider>
      </body>
    </html>
  );
}
