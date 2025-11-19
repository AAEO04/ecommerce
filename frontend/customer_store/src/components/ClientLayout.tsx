'use client';

import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '@/lib/animations';
import { AnimationProvider } from '@/context/AnimationContext';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { Footer } from './Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { BurstOnClick } from '@/components/BurstOnClick';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimationProvider>
      {/* Kinetic Chaos Interactive Effects */}
      <BurstOnClick />
      
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
            background: '#000',
            color: '#ADFF00',
            border: '2px solid #ADFF00',
            fontWeight: 'bold',
          },
        }}
      />
    </AnimationProvider>
  );
}
