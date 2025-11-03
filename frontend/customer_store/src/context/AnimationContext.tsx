'use client';

import { createContext, useState, RefObject } from 'react';
import FlyToCartAnimation from '@/components/FlyToCartAnimation';

interface AnimationProps {
  startRect: DOMRect;
  endRect: DOMRect;
  src: string;
}

interface AnimationContextType {
  cartRef: RefObject<HTMLDivElement> | null;
  setCartRef: (ref: RefObject<HTMLDivElement>) => void;
  triggerAnimation: (props: AnimationProps) => void;
}

export const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartRef, setCartRef] = useState<RefObject<HTMLDivElement> | null>(null);
  const [animationProps, setAnimationProps] = useState<AnimationProps | null>(null);

  const triggerAnimation = (props: AnimationProps) => {
    setAnimationProps(props);
  };

  const handleAnimationFinish = () => {
    setAnimationProps(null);
  };

  return (
    <AnimationContext.Provider value={{ cartRef, setCartRef, triggerAnimation }}>
      {children}
      {animationProps && (
        <FlyToCartAnimation
          {...animationProps}
          onFinish={handleAnimationFinish}
        />
      )}
    </AnimationContext.Provider>
  );
};
