'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { formatNGN } from '@/utils/currency';
import { Product } from '@/lib/api';
import { motion } from 'framer-motion';
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useRef, useContext, useState } from 'react';
import { useInViewAnimation } from '@/hooks/useInViewAnimation';
import { AnimationContext } from '@/context/AnimationContext';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import toast from 'react-hot-toast';
import { Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const imgRef = useRef<HTMLImageElement>(null);
  const animationContext = useContext(AnimationContext);
  const { ref, controls } = useInViewAnimation({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [showQuickView, setShowQuickView] = useState(false);
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url ?? '/logo.png';
  const displayPrice = product.price ?? product.variants?.[0]?.price ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);

    if (imgRef.current && animationContext?.cartRef?.current && product.images?.[0]?.image_url) {
      const imgRect = imgRef.current.getBoundingClientRect();
      const cartRect = animationContext.cartRef.current.getBoundingClientRect();
      animationContext.triggerAnimation({
        startRect: imgRect,
        endRect: cartRect,
        src: product.images[0].image_url,
      });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <motion.div
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 24 },
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/90 p-4 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      >
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-black">
            <Image
              ref={imgRef}
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              priority={false}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition group-hover:opacity-80" />

            <div className="absolute left-4 top-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/70">
              <span className="rounded-full border border-white/30 px-3 py-1">
                Drop
              </span>
              <span className="text-electric-volt-green">#{product.id}</span>
            </div>

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={handleQuickView}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black transition hover:scale-105"
                title="Quick view"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:scale-105 ${
                  inWishlist ? 'border-red-400 bg-red-500/20 text-red-300' : 'border-white/40 bg-black/40 text-white'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </Link>

        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">{product.name}</h3>
            <p className="text-2xl font-black text-electric-volt-green">{formatNGN(displayPrice)}</p>
          </div>

          <button
            onClick={handleAdd}
            className="group/btn inline-flex w-full items-center justify-between rounded-2xl border border-electric-volt-green/60 bg-electric-volt-green/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-electric-volt-green transition hover:bg-electric-volt-green hover:text-black"
          >
            <span>Quick Add</span>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 6 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </button>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}

export default ProductCard;