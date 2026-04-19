'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/cn';
import {
  Leaf,
  Sprout,
  Wheat,
  Dumbbell,
  UtensilsCrossed,
  ChefHat,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { DishDetailModal } from './DishDetailModal';
import { AvailabilityBadge } from './AvailabilityBadge';
import { useCart } from '@/components/cart/CartProvider';

interface DishProps {
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
    allergens?: string[];
    flavor?: { pt: string; en: string };
    portionSizes?: Array<{
      label: { pt: string; en: string };
      price: number;
      weight?: string;
    }>;
    badges?: Array<{ type: string }>;
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
    available: boolean;
  };
  onViewDetails?: (dish: any) => void;
}

export function DishCard({ dish, onViewDetails }: DishProps) {
  const locale = useLocale() as 'pt' | 'en';
  const [modalOpen, setModalOpen] = useState(false);
  const {
    addItem,
    isInCart,
    getItemQuantity,
    updateQuantity,
    removeItem,
    setIsCartOpen,
  } = useCart();

  const primaryImage =
    dish.images?.find(img => img.isPrimary) || dish.images?.[0];

  const imageUrl = primaryImage?.url?.startsWith('/')
    ? primaryImage.url
    : primaryImage?.url || '/placeholder-food.jpg';

  const handleViewDetails = () => {
    setModalOpen(true);
    if (onViewDetails) {
      onViewDetails(dish);
    }
  };

  const displayName = dish.flavor?.[locale]
    ? `${dish.name[locale]} ( ${dish.flavor[locale]} )`
    : dish.name[locale];

  const displayPrice = () => {
    if (dish.portionSizes && dish.portionSizes.length > 0) {
      const minPrice = Math.min(...dish.portionSizes.map(p => p.price));
      return `${locale === 'pt' ? 'A partir de ' : 'From '}${formatPrice(minPrice, locale === 'pt' ? 'pt-PT' : 'en-US')}`;
    }
    return formatPrice(dish.price, locale === 'pt' ? 'pt-PT' : 'en-US');
  };

  const isOutOfStock =
    dish.stock?.enabled &&
    (dish.stock.quantity || 0) - (dish.stock.reserved || 0) <= 0;
  const maxQty = dish.orderSettings?.maxQuantity || 10;
  const inCart = isInCart(dish._id);
  const cartQty = getItemQuantity(dish._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  return (
    <>
      <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 card-hover flex flex-col h-full'>
        {primaryImage && (
          <div
            className='relative aspect-square w-full bg-gray-100 cursor-pointer'
            onClick={handleViewDetails}
          >
            {imageUrl === '/placeholder-food.jpg' ? (
              <div className='flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20'>
                <span className='text-4xl'>🥧</span>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-food.jpg';
                }}
              />
            )}
            <div className='absolute top-2 left-2'>
              <AvailabilityBadge
                schedule={dish.schedule}
                stock={dish.stock}
                available={dish.available}
                compact
              />
            </div>
          </div>
        )}

        <CardHeader className='pb-3'>
          <div className='space-y-2'>
            <CardTitle
              className='text-lg leading-tight line-clamp-2 min-h-[2.8em]'
              title={displayName}
            >
              {displayName}
            </CardTitle>
            <div className='flex justify-between items-center'>
              <span className='text-lg font-bold text-primary'>
                {displayPrice()}
              </span>
            </div>
            {dish.weight && (
              <span className='text-xs text-muted-foreground'>
                {dish.weight}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className='pt-0 flex-1 space-y-3'>
          <div className='flex flex-wrap gap-1'>
            {dish.dietaryInfo?.fitness && (
              <Badge
                variant='outline'
                className='gap-1 text-xs border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
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
              <Badge className='gap-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white border-transparent'>
                <Sprout className='w-3 h-3' />
                {locale === 'pt' ? 'Vegano' : 'Vegan'}
              </Badge>
            )}
            {dish.dietaryInfo?.glutenFree && (
              <Badge variant='outline' className='gap-1 text-xs'>
                <Wheat className='w-3 h-3' />
                {locale === 'pt' ? 'Sem Glúten' : 'Gluten Free'}
              </Badge>
            )}
            {dish.dietaryInfo?.dairyFree && (
              <Badge variant='outline' className='gap-1 text-xs'>
                <UtensilsCrossed className='w-3 h-3' />
                {locale === 'pt' ? 'Sem Lactose' : 'Dairy Free'}
              </Badge>
            )}
          </div>

          <p className='text-xs text-muted-foreground line-clamp-2'>
            {dish.description[locale]}
          </p>
        </CardContent>

        <CardFooter className='pt-0 flex gap-2'>
          <Button
            className='flex-1'
            variant='outline'
            size='sm'
            onClick={handleViewDetails}
          >
            <ChefHat className='w-4 h-4 mr-2' />
            {locale === 'pt' ? 'Ver Detalhes' : 'View Details'}
          </Button>

          {isOutOfStock ? (
            <Button variant='outline' size='sm' disabled className='opacity-50'>
              {locale === 'pt' ? 'Esgotado' : 'Sold out'}
            </Button>
          ) : inCart ? (
            <div className='flex items-center gap-0.5 bg-primary rounded-md'>
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (cartQty <= 1) removeItem(dish._id);
                  else updateQuantity(dish._id, cartQty - 1);
                }}
                className='p-2 text-primary-foreground hover:opacity-80 transition-opacity'
              >
                <Minus className='w-3.5 h-3.5' />
              </button>
              <span
                className='text-sm font-bold text-primary-foreground min-w-[20px] text-center cursor-pointer'
                onClick={e => {
                  e.stopPropagation();
                  setIsCartOpen(true);
                }}
              >
                {cartQty}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  updateQuantity(dish._id, cartQty + 1);
                }}
                disabled={cartQty >= maxQty}
                className='p-2 text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-30'
              >
                <Plus className='w-3.5 h-3.5' />
              </button>
            </div>
          ) : (
            <Button size='sm' onClick={handleAddToCart}>
              <ShoppingCart className='w-4 h-4' />
            </Button>
          )}
        </CardFooter>
      </Card>

      <DishDetailModal
        dish={dish}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
