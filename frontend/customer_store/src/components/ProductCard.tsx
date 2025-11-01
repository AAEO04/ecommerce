'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/useCartStore';
import { formatNGN } from '@/utils/currency';
import { Product } from '@/lib/api';
import { useContext, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AnimationContext } from '@/context/AnimationContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const imgRef = useRef<HTMLImageElement>(null);
  const animationContext = useContext(AnimationContext);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} added to cart`);

    if (imgRef.current && animationContext?.cartRef?.current) {
      const imgRect = imgRef.current.getBoundingClientRect();
      const cartRect = animationContext.cartRef.current.getBoundingClientRect();

      const dummyImg = document.createElement('img');
      dummyImg.src = product.images[0].image_url;
      dummyImg.style.position = 'fixed';
      dummyImg.style.left = `${imgRect.left}px`;
      dummyImg.style.top = `${imgRect.top}px`;
      dummyImg.style.width = `${imgRect.width}px`;
      dummyImg.style.height = `${imgRect.height}px`;
      dummyImg.style.zIndex = '1000';
      document.body.appendChild(dummyImg);

      const animation = dummyImg.animate(
        [
          {
            left: `${imgRect.left}px`,
            top: `${imgRect.top}px`,
            width: `${imgRect.width}px`,
            height: `${imgRect.height}px`,
            opacity: 1,
          },
          {
            left: `${cartRect.left + cartRect.width / 2}px`,
            top: `${cartRect.top + cartRect.height / 2}px`,
            width: '0px',
            height: '0px',
            opacity: 0.5,
          },
        ],
        {
          duration: 800,
          easing: 'ease-in-out',
        }
      );

      animation.onfinish = () => {
        document.body.removeChild(dummyImg);
      };
    }
  };

  return (
    <div className="group animated-gradient-border">
      <motion.div
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.5 }}
        className="border rounded p-3 bg-neutral-900 border-neutral-800 relative z-10 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:[animation:shake_0.5s_infinite]"
      >
        <Link href={`/product/${product.id}`} className="block">
          <Image
            ref={imgRef}
            src={product.images[0].image_url}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-32 object-cover rounded-lg"
            priority={false} // or true for above-the-fold images
            loading="lazy"
          />
        </Link>
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-neutral-50">{product.name}</h3>
          <p className="text-xs text-neutral-400">{formatNGN(product.price)}</p>
          <button
            onClick={handleAdd}
            className="mt-2 w-full bg-accent-green hover:bg-accent-green-700 text-white text-xs py-1 rounded"
          >
            Add to Cart
          </button>
        </div>
      </motion.div>
    </div>
  );
}
