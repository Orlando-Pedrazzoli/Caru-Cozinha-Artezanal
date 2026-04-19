'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  Leaf,
  Sprout,
  Wheat,
  UtensilsCrossed,
  Dumbbell,
  User,
  UtensilsCrossed as MealIcon,
  PartyPopper,
  Package2,
} from 'lucide-react';

interface MenuFiltersProps {
  filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    fitness: boolean;
    portionTypes: string[];
  };
  onFilterChange: (filters: any) => void;
}

export function MenuFilters({ filters, onFilterChange }: MenuFiltersProps) {
  const t = useTranslations('menu');

  const toggleDietaryFilter = (
    key: 'vegetarian' | 'vegan' | 'glutenFree' | 'dairyFree' | 'fitness',
  ) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  const togglePortionType = (type: string) => {
    const current = filters.portionTypes || [];
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, portionTypes: next });
  };

  const clearFilters = () => {
    onFilterChange({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      fitness: false,
      portionTypes: [],
    });
  };

  const activeFiltersCount =
    (filters.vegetarian ? 1 : 0) +
    (filters.vegan ? 1 : 0) +
    (filters.glutenFree ? 1 : 0) +
    (filters.dairyFree ? 1 : 0) +
    (filters.fitness ? 1 : 0) +
    (filters.portionTypes?.length || 0);

  return (
    <div className='space-y-5 p-4 bg-card rounded-lg border'>
      {/* Clear button — só aparece quando há filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className='flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='text-xs shrink-0'
          >
            {t('filtersClear')} ({activeFiltersCount})
          </Button>
        </div>
      )}

      {/* Portion Types */}
      <div className='space-y-2'>
        <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
          {t('portionTypeHeader')}
        </Label>
        <div className='flex flex-col gap-2'>
          <Button
            variant={
              filters.portionTypes?.includes('individual')
                ? 'default'
                : 'outline'
            }
            size='sm'
            onClick={() => togglePortionType('individual')}
            className='justify-start gap-2'
          >
            <User className='w-4 h-4' />
            {t('portionIndividual')}
          </Button>

          <Button
            variant={
              filters.portionTypes?.includes('refeicao') ? 'default' : 'outline'
            }
            size='sm'
            onClick={() => togglePortionType('refeicao')}
            className='justify-start gap-2'
          >
            <MealIcon className='w-4 h-4' />
            {t('portionMeal')}
          </Button>

          <Button
            variant={
              filters.portionTypes?.includes('festa') ? 'default' : 'outline'
            }
            size='sm'
            onClick={() => togglePortionType('festa')}
            className='justify-start gap-2'
          >
            <PartyPopper className='w-4 h-4' />
            {t('portionParty')}
          </Button>

          <Button
            variant={
              filters.portionTypes?.includes('combo') ? 'default' : 'outline'
            }
            size='sm'
            onClick={() => togglePortionType('combo')}
            className='justify-start gap-2'
          >
            <Package2 className='w-4 h-4' />
            {t('portionCombo')}
          </Button>
        </div>
      </div>

      {/* Dietary */}
      <div className='space-y-2'>
        <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
          {t('dietaryHeader')}
        </Label>
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
            <Sprout className='w-4 h-4' />
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
