import type { Metadata } from 'next';
import { Inter, Unbounded } from 'next/font/google';
import '@/styles/globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'MAD RUSH - NO CHILLS, Just Pure Adrenaline',
  description: 'Raw, rebellious streetwear. Kinetic chaos energy. Motion-blurred style. Zero chill, all rush. Express your bold personality with MAD RUSH.',
  keywords: 'streetwear, urban fashion, mad rush, no chills, kinetic chaos, bold style, graffiti fashion',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Druk Wide';
              src: local('Arial Black'), local('Impact');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
              font-stretch: expanded;
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} ${unbounded.variable} font-sans bg-black min-h-screen flex flex-col antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
