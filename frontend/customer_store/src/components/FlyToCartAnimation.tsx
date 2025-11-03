'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface AnimationProps {
  startRect: DOMRect;
  endRect: DOMRect;
  src: string;
  onFinish: () => void;
}

function FlyToCartAnimation({ startRect, endRect, src, onFinish }: AnimationProps) {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      await controls.start({
        left: endRect.left + endRect.width / 2,
        top: endRect.top + endRect.height / 2,
        width: 0,
        height: 0,
        opacity: 0.5,
        transition: {
          duration: 0.8,
          ease: 'easeIn',
        },
      });
      onFinish();
    };

    animate();
  }, [controls, startRect, endRect, onFinish]);

  return (
    <motion.img
      src={src}
      alt=""
      initial={{
        position: 'fixed',
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        opacity: 1,
        zIndex: 1000,
      }}
      animate={controls}
    />
  );
}

export default FlyToCartAnimation;
