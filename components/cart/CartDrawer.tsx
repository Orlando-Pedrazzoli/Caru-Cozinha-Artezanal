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
  Info,
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
  const [showDeliveryNotice, setShowDeliveryNotice] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const allowedDays = useMemo(() => {
    if (items.length === 0) return new Set<number>();

    const itemDaySets = items.map(item => {
      const schedule = (item as any).schedule;
      if (!schedule) {
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
      if (days.size === 0) return new Set([0, 1, 2, 3, 4, 5, 6]);
      return days;
    });

    const first = itemDaySets[0];
    const intersection = new Set<number>();
    first.forEach(day => {
      if (itemDaySets.every(s => s.has(day))) {
        intersection.add(day);
      }
    });

    return intersection;
  }, [items]);

  const isDateAllowed = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return allowedDays.has(date.getDay());
  };

  const todayAllowed = useMemo(() => {
    return isDateAllowed(new Date());
  }, [allowedDays]);

  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const formatSelectedDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    const dayLabels = locale === 'pt' ? DAY_LABELS_PT : DAY_LABELS_EN;
    const monthLabels = locale === 'pt' ? MONTH_LABELS_PT : MONTH_LABELS_EN;
    return `${dayLabels[date.getDay()]}, ${date.getDate()} ${monthLabels[date.getMonth()]}`;
  };

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{
      date: Date | null;
      dateStr: string;
      allowed: boolean;
    }> = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: null, dateStr: '', allowed: false });
    }

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

  const deliveryNoticeText =
    locale === 'pt'
      ? 'Serviço restrito a área específica. Fora da zona: taxa e mínimo sob consulta.'
      : 'Service restricted to a specific area. Outside zone: fee & minimum apply.';

  const deliveryNoticeLabel = locale === 'pt' ? 'Entregas' : 'Deliveries';

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-[60] bg-black/50 animate-fadeIn'
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer — mais estreito (max-w-sm = 384px) e com flex-col para ocupar viewport */}
      <div className='fixed right-0 top-0 z-[60] h-[100dvh] w-full max-w-sm bg-background shadow-2xl animate-slideIn flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b shrink-0'>
          <div className='flex items-center gap-2 min-w-0'>
            <ShoppingCart className='w-5 h-5 text-primary shrink-0' />
            <h2 className='text-base font-bold truncate'>{t('cart.title')}</h2>
            {itemCount > 0 && (
              <span className='text-xs text-muted-foreground shrink-0'>
                ({itemCount})
              </span>
            )}
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsCartOpen(false)}
            className='h-8 w-8 p-0 shrink-0'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Items — scrollable */}
        <div className='flex-1 overflow-y-auto px-4 py-3 min-h-0'>
          {items.length === 0 ? (
            <div className='text-center py-12'>
              <ShoppingCart className='w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30' />
              <p className='text-muted-foreground text-sm'>{t('cart.empty')}</p>
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
            <div className='space-y-2'>
              {items.map(item => {
                const displayName = item.flavor?.[locale]
                  ? `${item.name[locale]} (${item.flavor[locale]})`
                  : item.name[locale];
                const unitPrice = item.portionSize?.price || item.price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.dishId}
                    className='flex gap-2 p-2.5 bg-card rounded-lg border'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm leading-tight truncate'>
                        {displayName}
                      </p>
                      {item.portionSize && (
                        <p className='text-[11px] text-muted-foreground'>
                          {item.portionSize.label[locale]}
                          {item.portionSize.weight &&
                            ` (${item.portionSize.weight})`}
                        </p>
                      )}
                      {item.weight && !item.portionSize && (
                        <p className='text-[11px] text-muted-foreground'>
                          {item.weight}
                        </p>
                      )}
                      <p className='text-sm font-bold text-primary mt-0.5'>
                        {formatPrice(
                          itemTotal,
                          locale === 'pt' ? 'pt-PT' : 'en-US',
                        )}
                      </p>
                    </div>

                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      <button
                        onClick={() => removeItem(item.dishId)}
                        className='text-muted-foreground hover:text-destructive transition-colors p-0.5'
                        aria-label={t('cart.remove')}
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                      <div className='flex items-center bg-muted rounded-md'>
                        <button
                          onClick={() =>
                            updateQuantity(item.dishId, item.quantity - 1)
                          }
                          className='p-1 hover:bg-background rounded-l-md transition-colors'
                        >
                          <Minus className='w-3 h-3' />
                        </button>
                        <span className='text-xs font-bold min-w-[20px] text-center px-1'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.dishId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxQuantity}
                          className='p-1 hover:bg-background rounded-r-md transition-colors disabled:opacity-30'
                        >
                          <Plus className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart — subtle, mesma linha */}
              <button
                onClick={clearCart}
                className='text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 pt-1'
              >
                <Trash2 className='w-3 h-3' />
                {t('cart.clear')}
              </button>
            </div>
          )}
        </div>

        {/* Footer — fica fixo no bottom, sem scroll próprio (scroll é no items acima) */}
        {items.length > 0 && (
          <div className='border-t px-4 py-3 space-y-2 shrink-0 bg-background'>
            {/* Aviso de entrega — dismissível, compacto */}
            {showDeliveryNotice && (
              <div className='rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 px-2.5 py-1.5'>
                <div className='flex items-start gap-1.5'>
                  <Info className='w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5' />
                  <p className='text-[11px] leading-snug text-amber-900 dark:text-amber-200 flex-1'>
                    <strong className='font-semibold'>
                      {deliveryNoticeLabel}:
                    </strong>{' '}
                    {deliveryNoticeText}
                  </p>
                  <button
                    onClick={() => setShowDeliveryNotice(false)}
                    className='text-amber-700 dark:text-amber-400 hover:opacity-70 shrink-0'
                    aria-label='Fechar'
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>
            )}

            {/* Date selection */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium flex items-center gap-1'>
                <Calendar className='w-3.5 h-3.5' />
                {t('cart.deliveryDate')} *
              </label>

              <div className='flex gap-1.5'>
                <Button
                  variant={deliveryDate === todayStr ? 'default' : 'outline'}
                  size='sm'
                  className={`flex-1 h-8 text-xs ${!todayAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!todayAllowed}
                  onClick={handleSelectToday}
                >
                  <Zap className='w-3.5 h-3.5 mr-1' />
                  {locale === 'pt' ? 'Hoje' : 'Today'}
                </Button>
                <Button
                  variant={
                    deliveryDate && deliveryDate !== todayStr
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  className='flex-1 h-8 text-xs'
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className='w-3.5 h-3.5 mr-1' />
                  {deliveryDate && deliveryDate !== todayStr
                    ? formatSelectedDate(deliveryDate)
                    : locale === 'pt'
                      ? 'Escolher data'
                      : 'Pick a date'}
                </Button>
              </div>

              {!todayAllowed && !deliveryDate && (
                <p className='text-[11px] text-amber-600'>
                  {locale === 'pt'
                    ? 'Não disponível hoje. Escolha uma data.'
                    : 'Not available today. Pick a date.'}
                </p>
              )}

              {showCalendar && (
                <div className='border rounded-lg p-2 bg-card'>
                  <div className='flex items-center justify-between mb-2'>
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
                    <span className='text-xs font-medium'>
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

                  <div className='grid grid-cols-7 gap-0.5 mb-1'>
                    {dayHeaders.map(d => (
                      <div
                        key={d}
                        className='text-[10px] text-center text-muted-foreground font-medium py-0.5'
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className='grid grid-cols-7 gap-0.5'>
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
                          className={`text-xs h-7 w-full rounded-md transition-all ${
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
                </div>
              )}
            </div>

            {/* Time */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5' />
                {t('cart.deliveryTime')}
              </label>
              <div className='flex gap-1.5'>
                {[
                  { value: 'morning', label: t('cart.morning') },
                  { value: 'afternoon', label: t('cart.afternoon') },
                ].map(opt => (
                  <Button
                    key={opt.value}
                    variant={deliveryTime === opt.value ? 'default' : 'outline'}
                    size='sm'
                    className='flex-1 h-8 text-xs'
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
            <div className='space-y-1.5'>
              <label className='text-xs font-medium'>
                {t('checkout.paymentMethod')}
              </label>
              <div className='flex gap-1.5'>
                <Button
                  variant={
                    paymentMethod === 'on_delivery' ? 'default' : 'outline'
                  }
                  size='sm'
                  className='flex-1 h-8 text-xs'
                  onClick={() => setPaymentMethod('on_delivery')}
                >
                  {t('checkout.onDelivery')}
                </Button>
                <Button
                  variant={paymentMethod === 'mbway' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1 h-8 text-xs'
                  onClick={() => setPaymentMethod('mbway')}
                >
                  MBWay
                </Button>
              </div>
            </div>

            {/* Total + Checkout — juntos */}
            <div className='flex items-center justify-between pt-2 border-t'>
              <span className='font-bold text-sm'>{t('cart.total')}</span>
              <span className='font-bold text-lg text-primary'>
                {formatPrice(total, locale === 'pt' ? 'pt-PT' : 'en-US')}
              </span>
            </div>

            <Button
              className='w-full h-11 text-sm font-semibold'
              disabled={!deliveryDate}
              onClick={handleCheckout}
            >
              <MessageSquare className='w-4 h-4 mr-2' />
              {t('checkout.orderViaWhatsapp')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
