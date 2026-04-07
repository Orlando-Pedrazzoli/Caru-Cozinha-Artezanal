'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './CartProvider';

export function CartIcon() {
  const { itemCount, setIsCartOpen } = useCart();
  const [animate, setAnimate] = useState(false);

  // Animate on item count change
  useEffect(() => {
    if (itemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <Button
      variant='ghost'
      size='sm'
      className='relative'
      onClick={() => setIsCartOpen(true)}
      aria-label={`Carrinho (${itemCount} itens)`}
    >
      <ShoppingCart
        className={`w-5 h-5 transition-transform ${animate ? 'scale-125' : 'scale-100'}`}
      />
      {itemCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-transform ${animate ? 'scale-125' : 'scale-100'}`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
