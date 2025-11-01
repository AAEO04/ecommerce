'use client';

import { createContext, useState, RefObject } from 'react';

interface AnimationContextType {
  cartRef: RefObject<HTMLDivElement> | null;
  setCartRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartRef, setCartRef] = useState<RefObject<HTMLDivElement> | null>(null);

  return (
    <AnimationContext.Provider value={{ cartRef, setCartRef }}>
      {children}
    </AnimationContext.Provider>
  );
};
