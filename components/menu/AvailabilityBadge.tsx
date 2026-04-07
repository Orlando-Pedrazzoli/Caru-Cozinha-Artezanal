'use client';

import React from 'react';
import { useLocale } from 'next-intl';

interface Schedule {
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
}

interface Stock {
  enabled?: boolean;
  quantity?: number;
  reserved?: number;
  lowStockThreshold?: number;
}

interface AvailabilityBadgeProps {
  schedule?: Schedule;
  stock?: Stock;
  available: boolean;
  compact?: boolean;
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const DAY_LABELS: Record<string, { pt: string; en: string }> = {
  monday: { pt: 'Seg', en: 'Mon' },
  tuesday: { pt: 'Ter', en: 'Tue' },
  wednesday: { pt: 'Qua', en: 'Wed' },
  thursday: { pt: 'Qui', en: 'Thu' },
  friday: { pt: 'Sex', en: 'Fri' },
  saturday: { pt: 'Sáb', en: 'Sat' },
  sunday: { pt: 'Dom', en: 'Sun' },
};

export function AvailabilityBadge({
  schedule,
  stock,
  available,
  compact = false,
}: AvailabilityBadgeProps) {
  const locale = useLocale() as 'pt' | 'en';

  if (!available) {
    return (
      <span className='text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Indisponível' : 'Unavailable'}
      </span>
    );
  }

  // Check stock
  if (stock?.enabled) {
    const availableQty = (stock.quantity || 0) - (stock.reserved || 0);
    if (availableQty <= 0) {
      return (
        <span className='text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full'>
          {locale === 'pt' ? 'Esgotado' : 'Sold out'}
        </span>
      );
    }
    const isLow = availableQty <= (stock.lowStockThreshold || 3);
    if (isLow) {
      return (
        <span className='text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full'>
          {locale === 'pt'
            ? `Últimas ${availableQty}!`
            : `Last ${availableQty}!`}
        </span>
      );
    }
  }

  // Check schedule
  if (!schedule) {
    return (
      <span className='text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Disponível' : 'Available'}
      </span>
    );
  }

  const today = new Date().getDay();
  const todayKey = DAY_KEYS[today];
  const isAvailableToday = schedule[todayKey as keyof Schedule] || false;

  // Has any day set at all?
  const hasSchedule = Object.values(schedule).some(
    v => typeof v === 'boolean' && v === true,
  );
  if (!hasSchedule) {
    return (
      <span className='text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Disponível' : 'Available'}
      </span>
    );
  }

  if (isAvailableToday) {
    return (
      <span className='text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Disponível hoje' : 'Available today'}
      </span>
    );
  }

  // Find next available days
  if (compact) {
    return (
      <span className='text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Sob encomenda' : 'Pre-order'}
      </span>
    );
  }

  const nextDays: string[] = [];
  for (let i = 1; i <= 7 && nextDays.length < 3; i++) {
    const checkDay = (today + i) % 7;
    const dayKey = DAY_KEYS[checkDay];
    if (schedule[dayKey as keyof Schedule]) {
      nextDays.push(DAY_LABELS[dayKey][locale]);
    }
  }

  if (nextDays.length === 0) {
    return (
      <span className='text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full'>
        {locale === 'pt' ? 'Consultar' : 'Contact us'}
      </span>
    );
  }

  return (
    <span className='text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full'>
      {locale === 'pt' ? 'Próx: ' : 'Next: '}
      {nextDays.join(', ')}
    </span>
  );
}
