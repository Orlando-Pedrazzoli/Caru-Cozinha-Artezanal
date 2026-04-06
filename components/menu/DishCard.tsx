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
import { Leaf, Wheat, Dumbbell, UtensilsCrossed, ChefHat } from 'lucide-react';
import { useLocale } from 'next-intl';
import { DishDetailModal } from './DishDetailModal';

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
  };
  onViewDetails?: (dish: any) => void;
}

export function DishCard({ dish, onViewDetails }: DishProps) {
  const locale = useLocale() as 'pt' | 'en';
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <>
      <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 card-hover flex flex-col h-full'>
        {primaryImage && (
          <div className='relative aspect-square w-full bg-gray-100'>
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
          {/* Dietary Info */}
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
              <Badge variant='success' className='gap-1 text-xs'>
                <Leaf className='w-3 h-3' />
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

          {/* Short description */}
          <p className='text-xs text-muted-foreground line-clamp-2'>
            {dish.description[locale]}
          </p>
        </CardContent>

        <CardFooter className='pt-0'>
          <Button
            className='w-full'
            variant='outline'
            size='sm'
            onClick={handleViewDetails}
          >
            <ChefHat className='w-4 h-4 mr-2' />
            {locale === 'pt' ? 'Ver Detalhes' : 'View Details'}
          </Button>
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
