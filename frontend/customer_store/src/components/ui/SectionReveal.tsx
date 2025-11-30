'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionRevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function SectionReveal({ children, delay = 0, className = '' }: SectionRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Custom ease for premium feel
                delay: delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
