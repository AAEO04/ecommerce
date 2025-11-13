'use client';

import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '@/lib/animations';
import { AnimationProvider } from '@/context/AnimationContext';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimationProvider>
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
      <MobileBottomNav />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        }}
      />
    </AnimationProvider>
  );
}
