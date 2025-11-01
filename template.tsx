'use client';

import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      transition={{ ease: 'easeInOut', duration: 0.75 }}
    >
      {children}
    </motion.div>
  );
}