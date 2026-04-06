'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Leaf, Wheat, UtensilsCrossed, Dumbbell } from 'lucide-react';

interface MenuFiltersProps {
  filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    fitness: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export function MenuFilters({ filters, onFilterChange }: MenuFiltersProps) {
  const t = useTranslations('menu');

  const toggleDietaryFilter = (
    key: 'vegetarian' | 'vegan' | 'glutenFree' | 'dairyFree' | 'fitness',
  ) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const clearFilters = () => {
    onFilterChange({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      fitness: false,
    });
  };

  const activeFiltersCount =
    (filters.vegetarian ? 1 : 0) +
    (filters.vegan ? 1 : 0) +
    (filters.glutenFree ? 1 : 0) +
    (filters.dairyFree ? 1 : 0) +
    (filters.fitness ? 1 : 0);

  return (
    <div className='space-y-4 p-4 bg-card rounded-lg border'>
      <div className='flex items-center justify-between'>
        <Label className='text-base font-semibold'>{t('filters')}</Label>
        {activeFiltersCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='text-xs'
          >
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Dietary Filters */}
      <div className='space-y-2'>
        <div className='flex flex-col gap-2'>
          <Button
            variant={filters.fitness ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleDietaryFilter('fitness')}
            className='justify-start gap-2'
          >
            <Dumbbell className='w-4 h-4' />
            {t('fitness')}
          </Button>

          <Button
            variant={filters.vegetarian ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleDietaryFilter('vegetarian')}
            className='justify-start gap-2'
          >
            <Leaf className='w-4 h-4' />
            {t('vegetarian')}
          </Button>

          <Button
            variant={filters.vegan ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleDietaryFilter('vegan')}
            className='justify-start gap-2'
          >
            <Leaf className='w-4 h-4' />
            {t('vegan')}
          </Button>

          <Button
            variant={filters.glutenFree ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleDietaryFilter('glutenFree')}
            className='justify-start gap-2'
          >
            <Wheat className='w-4 h-4' />
            {t('glutenFree')}
          </Button>

          <Button
            variant={filters.dairyFree ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleDietaryFilter('dairyFree')}
            className='justify-start gap-2'
          >
            <UtensilsCrossed className='w-4 h-4' />
            {t('dairyFree')}
          </Button>
        </div>
      </div>
    </div>
  );
}
