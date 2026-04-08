'use client';

import React, { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/utils/cn';
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CartDrawerProps {
  onCheckout: (data: {
    deliveryDate: string;
    deliveryTime: string;
    paymentMethod: 'on_delivery' | 'mbway';
  }) => void;
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

const DAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS_PT = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const MONTH_LABELS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const t = useTranslations();
  const locale = useLocale() as 'pt' | 'en';
  const {
    items,
    itemCount,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'on_delivery' | 'mbway'>(
    'on_delivery',
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Get allowed days of week from all items in cart (intersection)
  const allowedDays = useMemo(() => {
    if (items.length === 0) return new Set<number>();

    // For each item, get its allowed day numbers (0=Sun, 1=Mon, etc)
    const itemDaySets = items.map(item => {
      const schedule = (item as any).schedule;
      if (!schedule) {
        // No schedule = all days allowed
        return new Set([0, 1, 2, 3, 4, 5, 6]);
      }
      const days = new Set<number>();
      if (schedule.sunday) days.add(0);
      if (schedule.monday) days.add(1);
      if (schedule.tuesday) days.add(2);
      if (schedule.wednesday) days.add(3);
      if (schedule.thursday) days.add(4);
      if (schedule.friday) days.add(5);
      if (schedule.saturday) days.add(6);
      // If no days set, treat as all days
      if (days.size === 0) return new Set([0, 1, 2, 3, 4, 5, 6]);
      return days;
    });

    // Intersection — only days ALL items are available
    const first = itemDaySets[0];
    const intersection = new Set<number>();
    first.forEach(day => {
      if (itemDaySets.every(s => s.has(day))) {
        intersection.add(day);
      }
    });

    return intersection;
  }, [items]);

  // Check if a specific date is allowed
  const isDateAllowed = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cannot order in the past
    if (date < today) return false;

    // Check if day of week is in allowed days
    return allowedDays.has(date.getDay());
  };

  // Check if today is allowed
  const todayAllowed = useMemo(() => {
    return isDateAllowed(new Date());
  }, [allowedDays]);

  // Today string
  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  // Format selected date for display
  const formatSelectedDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    const dayLabels = locale === 'pt' ? DAY_LABELS_PT : DAY_LABELS_EN;
    const monthLabels = locale === 'pt' ? MONTH_LABELS_PT : MONTH_LABELS_EN;
    return `${dayLabels[date.getDay()]}, ${date.getDate()} ${monthLabels[date.getMonth()]}`;
  };

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const days: Array<{
      date: Date | null;
      dateStr: string;
      allowed: boolean;
    }> = [];

    // Padding for days before month starts
    for (let i = 0; i < startPad; i++) {
      days.push({ date: null, dateStr: '', allowed: false });
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date,
        dateStr,
        allowed: isDateAllowed(date),
      });
    }

    return days;
  }, [calendarMonth, allowedDays]);

  const handleSelectToday = () => {
    if (todayAllowed) {
      setDeliveryDate(todayStr);
      setShowCalendar(false);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setDeliveryDate(dateStr);
    setShowCalendar(false);
  };

  const handleCheckout = () => {
    if (!deliveryDate) return;
    onCheckout({ deliveryDate, deliveryTime, paymentMethod });
  };

  const monthLabels = locale === 'pt' ? MONTH_LABELS_PT : MONTH_LABELS_EN;
  const dayHeaders = locale === 'pt' ? DAY_LABELS_PT : DAY_LABELS_EN;

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/50 animate-fadeIn'
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className='fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl animate-slideIn flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5 text-primary' />
            <h2 className='text-lg font-bold'>{t('cart.title')}</h2>
            {itemCount > 0 && (
              <span className='text-sm text-muted-foreground'>
                ({itemCount} {t('cart.items')})
              </span>
            )}
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsCartOpen(false)}
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Items */}
        <div className='flex-1 overflow-y-auto p-4'>
          {items.length === 0 ? (
            <div className='text-center py-12'>
              <ShoppingCart className='w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30' />
              <p className='text-muted-foreground'>{t('cart.empty')}</p>
              <Button
                variant='outline'
                size='sm'
                className='mt-4'
                onClick={() => setIsCartOpen(false)}
              >
                {t('cart.continueShopping')}
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {items.map(item => {
                const displayName = item.flavor?.[locale]
                  ? `${item.name[locale]} (${item.flavor[locale]})`
                  : item.name[locale];
                const unitPrice = item.portionSize?.price || item.price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.dishId}
                    className='flex gap-3 p-3 bg-card rounded-lg border'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm leading-tight truncate'>
                        {displayName}
                      </p>
                      {item.portionSize && (
                        <p className='text-xs text-muted-foreground'>
                          {item.portionSize.label[locale]}
                          {item.portionSize.weight &&
                            ` (${item.portionSize.weight})`}
                        </p>
                      )}
                      {item.weight && !item.portionSize && (
                        <p className='text-xs text-muted-foreground'>
                          {item.weight}
                        </p>
                      )}
                      <p className='text-sm font-bold text-primary mt-1'>
                        {formatPrice(
                          itemTotal,
                          locale === 'pt' ? 'pt-PT' : 'en-US',
                        )}
                      </p>
                    </div>

                    <div className='flex flex-col items-end gap-1'>
                      <button
                        onClick={() => removeItem(item.dishId)}
                        className='text-muted-foreground hover:text-destructive transition-colors p-1'
                        aria-label={t('cart.remove')}
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                      <div className='flex items-center gap-1 bg-muted rounded-lg'>
                        <button
                          onClick={() =>
                            updateQuantity(item.dishId, item.quantity - 1)
                          }
                          className='p-1.5 hover:bg-background rounded-l-lg transition-colors'
                        >
                          <Minus className='w-3.5 h-3.5' />
                        </button>
                        <span className='text-sm font-bold min-w-[24px] text-center'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.dishId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxQuantity}
                          className='p-1.5 hover:bg-background rounded-r-lg transition-colors disabled:opacity-30'
                        >
                          <Plus className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div className='pt-2 space-y-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsCartOpen(false)}
                  className='w-full'
                >
                  {t('cart.continueShopping')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearCart}
                  className='text-xs text-muted-foreground w-full'
                >
                  <Trash2 className='w-3 h-3 mr-1' />
                  {t('cart.clear')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className='border-t p-4 space-y-3'>
            {/* Date selection */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-1'>
                <Calendar className='w-4 h-4' />
                {t('cart.deliveryDate')} *
              </label>

              {/* Today + Calendar toggle */}
              <div className='flex gap-2'>
                <Button
                  variant={deliveryDate === todayStr ? 'default' : 'outline'}
                  size='sm'
                  className={`flex-1 ${!todayAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!todayAllowed}
                  onClick={handleSelectToday}
                >
                  <Zap className='w-4 h-4 mr-1' />
                  {locale === 'pt' ? 'Hoje' : 'Today'}
                </Button>
                <Button
                  variant={
                    deliveryDate && deliveryDate !== todayStr
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  className='flex-1'
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className='w-4 h-4 mr-1' />
                  {deliveryDate && deliveryDate !== todayStr
                    ? formatSelectedDate(deliveryDate)
                    : locale === 'pt'
                      ? 'Escolher data'
                      : 'Pick a date'}
                </Button>
              </div>

              {/* Hint when today not allowed */}
              {!todayAllowed && !deliveryDate && (
                <p className='text-xs text-amber-600'>
                  {locale === 'pt'
                    ? 'Produtos no carrinho nao disponiveis hoje. Escolha uma data.'
                    : 'Products in cart not available today. Pick a date.'}
                </p>
              )}

              {/* Custom calendar */}
              {showCalendar && (
                <div className='border rounded-lg p-3 bg-card'>
                  {/* Month nav */}
                  <div className='flex items-center justify-between mb-3'>
                    <button
                      onClick={() => {
                        setCalendarMonth(prev => {
                          const d = new Date(prev.year, prev.month - 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        });
                      }}
                      className='p-1 hover:bg-muted rounded'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </button>
                    <span className='text-sm font-medium'>
                      {monthLabels[calendarMonth.month]} {calendarMonth.year}
                    </span>
                    <button
                      onClick={() => {
                        setCalendarMonth(prev => {
                          const d = new Date(prev.year, prev.month + 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        });
                      }}
                      className='p-1 hover:bg-muted rounded'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className='grid grid-cols-7 gap-1 mb-1'>
                    {dayHeaders.map(d => (
                      <div
                        key={d}
                        className='text-[11px] text-center text-muted-foreground font-medium py-1'
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className='grid grid-cols-7 gap-1'>
                    {calendarDays.map((day, i) => {
                      if (!day.date) {
                        return <div key={`pad-${i}`} />;
                      }

                      const isSelected = day.dateStr === deliveryDate;
                      const isToday = day.dateStr === todayStr;

                      return (
                        <button
                          key={day.dateStr}
                          disabled={!day.allowed}
                          onClick={() => handleSelectDate(day.dateStr)}
                          className={`text-sm h-8 w-full rounded-md transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-bold'
                              : day.allowed
                                ? 'hover:bg-primary/10 text-foreground'
                                : 'text-muted-foreground/30 cursor-not-allowed'
                          } ${isToday && !isSelected ? 'ring-1 ring-primary' : ''}`}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className='flex items-center gap-3 mt-3 pt-2 border-t text-[11px] text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <span className='w-3 h-3 rounded bg-primary/10 border border-primary/30' />
                      {locale === 'pt' ? 'Disponivel' : 'Available'}
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='w-3 h-3 rounded bg-muted' />
                      {locale === 'pt' ? 'Indisponivel' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Time */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                {t('cart.deliveryTime')}
              </label>
              <div className='flex gap-2'>
                {[
                  { value: 'morning', label: t('cart.morning') },
                  { value: 'afternoon', label: t('cart.afternoon') },
                ].map(opt => (
                  <Button
                    key={opt.value}
                    variant={deliveryTime === opt.value ? 'default' : 'outline'}
                    size='sm'
                    className='flex-1'
                    onClick={() =>
                      setDeliveryTime(
                        deliveryTime === opt.value ? '' : opt.value,
                      )
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                {t('checkout.paymentMethod')}
              </label>
              <div className='flex gap-2'>
                <Button
                  variant={
                    paymentMethod === 'on_delivery' ? 'default' : 'outline'
                  }
                  size='sm'
                  className='flex-1'
                  onClick={() => setPaymentMethod('on_delivery')}
                >
                  {t('checkout.onDelivery')}
                </Button>
                <Button
                  variant={paymentMethod === 'mbway' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1'
                  onClick={() => setPaymentMethod('mbway')}
                >
                  MBWay
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className='flex justify-between items-center py-2 border-t'>
              <span className='font-bold text-lg'>{t('cart.total')}</span>
              <span className='font-bold text-xl text-primary'>
                {formatPrice(total, locale === 'pt' ? 'pt-PT' : 'en-US')}
              </span>
            </div>

            {/* Checkout */}
            <Button
              className='w-full h-12 text-base'
              disabled={!deliveryDate}
              onClick={handleCheckout}
            >
              <MessageSquare className='w-5 h-5 mr-2' />
              {t('checkout.orderViaWhatsapp')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
