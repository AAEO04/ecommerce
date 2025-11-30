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
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { StockBadge } from '@/components/ui/StockBadge';
import toast from 'react-hot-toast';
import { Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url ?? '/logo.png';
  const displayPrice = product.price ?? product.variants?.[0]?.price ?? 0;

  // Get first available in-stock variant for Quick Add
  const firstAvailableVariant = product.variants?.find(v => v.is_active && v.stock_quantity > 0);
  const totalStock = product.variants?.filter(v => v.is_active).reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    // Open the Quick Add modal instead of directly adding to cart
    setShowQuickAdd(true);
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

            {/* Stock Badge */}
            <div className="absolute right-4 top-4">
              <StockBadge variants={product.variants} />
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
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:scale-105 ${inWishlist ? 'border-red-400 bg-red-500/20 text-red-300' : 'border-white/40 bg-black/40 text-white'
                  }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-tight line-clamp-2 font-display tracking-wide">{product.name}</h3>
            <p className="text-xl font-black text-electric-volt-green">{formatNGN(displayPrice)}</p>
          </div>

          <Button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            variant={isOutOfStock ? "outline" : "kinetic"}
            className="w-full text-[10px] h-11"
          >
            {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
          </Button>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        product={product}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
}

export default ProductCard;