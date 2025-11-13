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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);

    if (imgRef.current && animationContext?.cartRef?.current) {
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
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
      >
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              ref={imgRef}
              src={product.images[0].image_url}
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              priority={false}
              loading="lazy"
            />
            
            {/* Hover overlay with quick actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
              <button
                onClick={handleQuickView}
                className="p-3 bg-white hover:bg-purple-50 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                title="Quick view"
              >
                <Eye className="h-5 w-5 text-purple-600" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg ${
                  inWishlist
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-white hover:bg-red-50'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-5 w-5 ${
                  inWishlist ? 'text-white fill-current' : 'text-red-500'
                }`} />
              </button>
            </div>
          </div>
        </Link>
        
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight">{product.name}</h3>
            <p className="text-lg font-bold text-purple-600">{formatNGN(product.price)}</p>
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
          >
            <span>Add to Cart</span>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
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