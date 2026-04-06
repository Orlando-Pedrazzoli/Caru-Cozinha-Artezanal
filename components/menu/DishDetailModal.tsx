'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/cn';
import { Leaf, Wheat, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

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
    variants?: Array<{
      name: { pt: string; en: string };
      price?: number;
      available?: boolean;
    }>;
    portionSizes?: Array<{
      label: { pt: string; en: string };
      price: number;
      weight?: string;
    }>;
  };
  open: boolean;
  onClose: () => void;
}

export function DishDetailModal({ dish, open, onClose }: DishDetailModalProps) {
  const locale = useLocale() as 'pt' | 'en';
  const primaryImage =
    dish.images?.find(img => img.isPrimary) || dish.images?.[0];

  const imageUrl = primaryImage?.url?.startsWith('/')
    ? primaryImage.url
    : primaryImage?.url || '/placeholder-food.jpg';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-display pr-8'>
            {dish.name[locale]}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {locale === 'pt' ? 'Detalhes do produto' : 'Product details'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Image */}
          {primaryImage && (
            <div className='relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden'>
              {imageUrl === '/placeholder-food.jpg' ? (
                <div className='flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20'>
                  <span className='text-6xl'>🥧</span>
                </div>
              ) : (
                <Image
                  src={imageUrl}
                  alt={dish.name[locale]}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 600px'
                />
              )}
            </div>
          )}

          {/* Price and Badges */}
          <div className='flex items-start justify-between gap-4'>
            <div className='flex flex-wrap gap-2'>
              {dish.badges && dish.badges.length > 0 && (
                <>
                  {dish.badges.map((badge, index) => (
                    <Badge key={index} variant='warning' className='text-xs'>
                      {badge.type === 'popular' && '🔥 Popular'}
                      {badge.type === 'artesanal' &&
                        (locale === 'pt' ? '🤲 Artesanal' : '🤲 Artisanal')}
                      {badge.type === 'novo' &&
                        (locale === 'pt' ? '✨ Novo' : '✨ New')}
                      {badge.type === 'sazonal' &&
                        (locale === 'pt' ? '🍂 Sazonal' : '🍂 Seasonal')}
                    </Badge>
                  ))}
                </>
              )}
            </div>
            <div className='text-2xl font-bold text-primary shrink-0'>
              {formatPrice(dish.price, locale === 'pt' ? 'pt-PT' : 'en-US')}
            </div>
          </div>

          {/* Product Info (weight, calories) */}
          {(dish.weight || dish.calories) && (
            <div className='flex gap-4 flex-wrap'>
              {dish.weight && (
                <div className='text-sm'>
                  <span className='font-medium'>
                    {locale === 'pt' ? 'Peso: ' : 'Weight: '}
                  </span>
                  {dish.weight}
                </div>
              )}
              {dish.calories && (
                <div className='text-sm'>
                  <span className='font-medium'>
                    {locale === 'pt' ? 'Calorias: ' : 'Calories: '}
                  </span>
                  {dish.calories} kcal
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className='font-semibold text-lg mb-2'>
              {locale === 'pt' ? 'Descrição' : 'Description'}
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              {dish.description[locale]}
            </p>
            {dish.baseDescription?.[locale] && (
              <p className='text-sm italic text-muted-foreground mt-2'>
                {dish.baseDescription[locale]}
              </p>
            )}
          </div>

          {/* Variants (flavours) */}
          {dish.variants && dish.variants.length > 0 && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>
                {locale === 'pt' ? 'Sabores Disponíveis' : 'Available Flavours'}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {dish.variants
                  .filter(v => v.available !== false)
                  .map((variant, i) => (
                    <Badge key={i} variant='secondary'>
                      {variant.name[locale]}
                      {variant.price != null &&
                        ` — ${formatPrice(variant.price, locale === 'pt' ? 'pt-PT' : 'en-US')}`}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Portion Sizes */}
          {dish.portionSizes && dish.portionSizes.length > 0 && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>
                {locale === 'pt' ? 'Porções' : 'Portions'}
              </h3>
              <div className='space-y-2'>
                {dish.portionSizes.map((portion, i) => (
                  <div
                    key={i}
                    className='flex justify-between items-center py-2 border-b last:border-0'
                  >
                    <div>
                      <span className='font-medium'>
                        {portion.label[locale]}
                      </span>
                      {portion.weight && (
                        <span className='text-sm text-muted-foreground ml-2'>
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
          <div>
            <h3 className='font-semibold text-lg mb-3'>
              {locale === 'pt' ? 'Informação Dietética' : 'Dietary Information'}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {dish.dietaryInfo?.fitness && (
                <Badge
                  variant='outline'
                  className='gap-1 border-green-600 text-green-700'
                >
                  <Dumbbell className='w-3 h-3' />
                  Fitness
                </Badge>
              )}
              {dish.dietaryInfo?.vegetarian && (
                <Badge variant='success' className='gap-1'>
                  <Leaf className='w-3 h-3' />
                  {locale === 'pt' ? 'Vegetariano' : 'Vegetarian'}
                </Badge>
              )}
              {dish.dietaryInfo?.vegan && (
                <Badge variant='success' className='gap-1'>
                  <Leaf className='w-3 h-3' />
                  {locale === 'pt' ? 'Vegano' : 'Vegan'}
                </Badge>
              )}
              {dish.dietaryInfo?.glutenFree && (
                <Badge variant='outline' className='gap-1'>
                  <Wheat className='w-3 h-3' />
                  {locale === 'pt' ? 'Sem Glúten' : 'Gluten Free'}
                </Badge>
              )}
              {dish.dietaryInfo?.dairyFree && (
                <Badge variant='outline' className='gap-1'>
                  <UtensilsCrossed className='w-3 h-3' />
                  {locale === 'pt' ? 'Sem Lactose' : 'Dairy Free'}
                </Badge>
              )}
            </div>
          </div>

          {/* Allergens */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div>
              <h3 className='font-semibold text-lg mb-2'>
                {locale === 'pt' ? 'Alérgenos' : 'Allergens'}
              </h3>
              <div className='flex flex-wrap gap-2'>
                {dish.allergens.map((allergen, index) => (
                  <Badge key={index} variant='destructive' className='text-xs'>
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close button mobile */}
        <div className='flex justify-center pt-4 md:hidden'>
          <Button onClick={onClose} variant='outline' className='w-full'>
            {locale === 'pt' ? 'Fechar' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
