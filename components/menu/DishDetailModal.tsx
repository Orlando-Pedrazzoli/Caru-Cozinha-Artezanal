'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/cn';
import {
  Leaf,
  Wheat,
  Dumbbell,
  UtensilsCrossed,
  X,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCart } from '@/components/cart/CartProvider';

interface DishDetailModalProps {
  dish: {
    _id: string;
    name: { pt: string; en: string };
    description: { pt: string; en: string };
    baseDescription?: { pt: string; en: string };
    category?: string | { _id: string; name: { pt: string; en: string } };
    price: number;
    weight?: string;
    calories?: number;
    images?: Array<{ url: string; isPrimary?: boolean }>;
    dietaryInfo: {
      vegetarian?: boolean;
      vegan?: boolean;
      glutenFree?: boolean;
      dairyFree?: boolean;
      fitness?: boolean;
    };
    badges?: Array<{ type: string }>;
    allergens?: string[];
    flavor?: { pt: string; en: string };
    portionSizes?: Array<{
      label: { pt: string; en: string };
      price: number;
      weight?: string;
    }>;
    schedule?: {
      monday?: boolean;
      tuesday?: boolean;
      wednesday?: boolean;
      thursday?: boolean;
      friday?: boolean;
      saturday?: boolean;
      sunday?: boolean;
    };
    stock?: {
      enabled?: boolean;
      quantity?: number;
      reserved?: number;
      lowStockThreshold?: number;
    };
    orderSettings?: {
      maxQuantity?: number;
    };
  };
  open: boolean;
  onClose: () => void;
}

export function DishDetailModal({ dish, open, onClose }: DishDetailModalProps) {
  const locale = useLocale() as 'pt' | 'en';
  const {
    addItem,
    isInCart,
    getItemQuantity,
    updateQuantity,
    removeItem,
    setIsCartOpen,
  } = useCart();

  if (!open) return null;

  const primaryImage =
    dish.images?.find(img => img.isPrimary) || dish.images?.[0];

  const imageUrl = primaryImage?.url?.startsWith('/')
    ? primaryImage.url
    : primaryImage?.url || '';

  const displayName = dish.flavor?.[locale]
    ? `${dish.name[locale]} (${dish.flavor[locale]})`
    : dish.name[locale];

  const isOutOfStock =
    dish.stock?.enabled &&
    (dish.stock.quantity || 0) - (dish.stock.reserved || 0) <= 0;

  const maxQty = dish.orderSettings?.maxQuantity || 10;
  const inCart = isInCart(dish._id);
  const cartQty = getItemQuantity(dish._id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      dishId: dish._id,
      name: dish.name,
      flavor: dish.flavor,
      price: dish.price,
      weight: dish.weight,
      image: primaryImage?.url,
      schedule: dish.schedule,
      maxQuantity: maxQty,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/60 animate-fadeIn'
        onClick={onClose}
      />

      {/* Modal */}
      {/* Modal */}
      <div className='fixed inset-x-3 bottom-3 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-[calc(100%-2rem)]'>
        <div
          className='bg-background rounded-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden'
          onClick={e => e.stopPropagation()}
        >
          {/* Image with close button overlay */}
          <div className='relative shrink-0'>
            {imageUrl ? (
              <div className='relative w-full aspect-[4/3] bg-muted'>
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 500px'
                />
              </div>
            ) : (
              <div className='w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center'>
                <span className='text-6xl'>🥧</span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className='absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors backdrop-blur-sm'
              aria-label='Fechar'
            >
              <X className='w-5 h-5' />
            </button>

            {/* Badges overlay */}
            {dish.badges && dish.badges.length > 0 && (
              <div className='absolute top-3 left-3 flex flex-wrap gap-1'>
                {dish.badges.map((badge, index) => (
                  <span
                    key={index}
                    className='bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full'
                  >
                    {badge.type === 'popular' && 'Popular'}
                    {badge.type === 'artesanal' &&
                      (locale === 'pt' ? 'Artesanal' : 'Artisanal')}
                    {badge.type === 'novo' &&
                      (locale === 'pt' ? 'Novo' : 'New')}
                    {badge.type === 'sazonal' &&
                      (locale === 'pt' ? 'Sazonal' : 'Seasonal')}
                  </span>
                ))}
              </div>
            )}

            {/* Drag indicator for mobile */}
            <div className='absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/40 rounded-full md:hidden' />
          </div>

          {/* Content - scrollable */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {/* Title + Price */}
            <div className='flex items-start justify-between gap-3'>
              <h2 className='text-xl font-bold leading-tight'>{displayName}</h2>
              <span className='text-xl font-bold text-primary shrink-0'>
                {formatPrice(dish.price, locale === 'pt' ? 'pt-PT' : 'en-US')}
              </span>
            </div>

            {/* Weight + Calories */}
            {(dish.weight || dish.calories) && (
              <div className='flex gap-3 text-sm text-muted-foreground'>
                {dish.weight && <span>{dish.weight}</span>}
                {dish.weight && dish.calories && <span>·</span>}
                {dish.calories && <span>{dish.calories} kcal</span>}
              </div>
            )}

            {/* Description */}
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {dish.description[locale]}
            </p>
            {dish.baseDescription?.[locale] && (
              <p className='text-xs italic text-muted-foreground'>
                {dish.baseDescription[locale]}
              </p>
            )}

            {/* Portion Sizes */}
            {dish.portionSizes && dish.portionSizes.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold mb-2'>
                  {locale === 'pt' ? 'Porcoes' : 'Portions'}
                </h3>
                <div className='space-y-1'>
                  {dish.portionSizes.map((portion, i) => (
                    <div
                      key={i}
                      className='flex justify-between items-center py-1.5 border-b last:border-0 text-sm'
                    >
                      <div>
                        <span className='font-medium'>
                          {portion.label[locale]}
                        </span>
                        {portion.weight && (
                          <span className='text-muted-foreground ml-1'>
                            ({portion.weight})
                          </span>
                        )}
                      </div>
                      <span className='font-bold text-primary'>
                        {formatPrice(
                          portion.price,
                          locale === 'pt' ? 'pt-PT' : 'en-US',
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Info */}
            <div className='flex flex-wrap gap-1.5'>
              {dish.dietaryInfo?.fitness && (
                <Badge
                  variant='outline'
                  className='gap-1 text-xs border-green-600 text-green-700'
                >
                  <Dumbbell className='w-3 h-3' />
                  Fitness
                </Badge>
              )}
              {dish.dietaryInfo?.vegetarian && (
                <Badge variant='success' className='gap-1 text-xs'>
                  <Leaf className='w-3 h-3' />
                  {locale === 'pt' ? 'Vegetariano' : 'Vegetarian'}
                </Badge>
              )}
              {dish.dietaryInfo?.vegan && (
                <Badge variant='success' className='gap-1 text-xs'>
                  <Leaf className='w-3 h-3' />
                  {locale === 'pt' ? 'Vegano' : 'Vegan'}
                </Badge>
              )}
              {dish.dietaryInfo?.glutenFree && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <Wheat className='w-3 h-3' />
                  {locale === 'pt' ? 'Sem Gluten' : 'Gluten Free'}
                </Badge>
              )}
              {dish.dietaryInfo?.dairyFree && (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <UtensilsCrossed className='w-3 h-3' />
                  {locale === 'pt' ? 'Sem Lactose' : 'Dairy Free'}
                </Badge>
              )}
            </div>

            {/* Allergens */}
            {dish.allergens && dish.allergens.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold mb-1.5'>
                  {locale === 'pt' ? 'Alergenos' : 'Allergens'}
                </h3>
                <div className='flex flex-wrap gap-1.5'>
                  {dish.allergens.map((allergen, index) => (
                    <Badge
                      key={index}
                      variant='destructive'
                      className='text-xs'
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Add to cart */}
          <div className='shrink-0 border-t p-4 bg-background'>
            {isOutOfStock ? (
              <Button disabled className='w-full h-12 text-base opacity-50'>
                {locale === 'pt' ? 'Esgotado' : 'Sold out'}
              </Button>
            ) : inCart ? (
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-1 bg-primary rounded-lg'>
                  <button
                    onClick={() => {
                      if (cartQty <= 1) removeItem(dish._id);
                      else updateQuantity(dish._id, cartQty - 1);
                    }}
                    className='p-3 text-primary-foreground hover:opacity-80 transition-opacity'
                  >
                    <Minus className='w-4 h-4' />
                  </button>
                  <span className='text-base font-bold text-primary-foreground min-w-[28px] text-center'>
                    {cartQty}
                  </span>
                  <button
                    onClick={() => updateQuantity(dish._id, cartQty + 1)}
                    disabled={cartQty >= maxQty}
                    className='p-3 text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-30'
                  >
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
                <Button
                  variant='outline'
                  className='flex-1 h-12 text-base'
                  onClick={() => {
                    onClose();
                    setIsCartOpen(true);
                  }}
                >
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  {locale === 'pt' ? 'Ver carrinho' : 'View cart'}
                </Button>
              </div>
            ) : (
              <Button
                className='w-full h-12 text-base'
                onClick={handleAddToCart}
              >
                <ShoppingCart className='w-5 h-5 mr-2' />
                {locale === 'pt' ? 'Adicionar ao carrinho' : 'Add to cart'}
                <span className='ml-2 opacity-80'>
                  {formatPrice(dish.price, locale === 'pt' ? 'pt-PT' : 'en-US')}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
