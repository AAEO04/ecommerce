'use client';

import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '@/lib/animations';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
