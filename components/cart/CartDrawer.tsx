'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';

interface CartDrawerProps {
  onCheckout: (data: {
    deliveryDate: string;
    deliveryTime: string;
    paymentMethod: 'on_delivery' | 'mbway';
  }) => void;
}

// Check if today matches any schedule day
const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

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

  const [deliveryOption, setDeliveryOption] = useState<'today' | 'other' | ''>(
    '',
  );
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'on_delivery' | 'mbway'>(
    'on_delivery',
  );

  // Today's date string
  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  // Minimum date for date picker = tomorrow
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }, []);

  // Check if ANY item in cart is available today (based on schedule)
  const anyAvailableToday = useMemo(() => {
    const todayDayKey = DAY_KEYS[new Date().getDay()];
    return items.some(item => {
      const schedule = (item as any).schedule;
      if (!schedule) return true; // no schedule = always available
      return schedule[todayDayKey] === true;
    });
  }, [items]);

  // When "today" is selected, set the date
  useEffect(() => {
    if (deliveryOption === 'today') {
      setDeliveryDate(todayStr);
    } else if (deliveryOption === 'other') {
      setDeliveryDate('');
    }
  }, [deliveryOption, todayStr]);

  const hasValidDate = deliveryDate !== '';

  const handleCheckout = () => {
    if (!hasValidDate) return;
    onCheckout({ deliveryDate, deliveryTime, paymentMethod });
  };

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
                    {/* Info */}
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

                    {/* Quantity controls */}
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
                          aria-label='Diminuir'
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
                          aria-label='Aumentar'
                        >
                          <Plus className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
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

        {/* Footer - delivery + checkout */}
        {items.length > 0 && (
          <div className='border-t p-4 space-y-3'>
            {/* Delivery date - Today vs Other */}
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-1'>
                <Calendar className='w-4 h-4' />
                {t('cart.deliveryDate')} *
              </label>

              {/* Today / Other date buttons */}
              <div className='flex gap-2'>
                <Button
                  variant={deliveryOption === 'today' ? 'default' : 'outline'}
                  size='sm'
                  className={`flex-1 ${
                    !anyAvailableToday ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  disabled={!anyAvailableToday}
                  onClick={() =>
                    setDeliveryOption(deliveryOption === 'today' ? '' : 'today')
                  }
                >
                  <Zap className='w-4 h-4 mr-1' />
                  {locale === 'pt' ? 'Hoje' : 'Today'}
                </Button>
                <Button
                  variant={deliveryOption === 'other' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1'
                  onClick={() =>
                    setDeliveryOption(deliveryOption === 'other' ? '' : 'other')
                  }
                >
                  <Calendar className='w-4 h-4 mr-1' />
                  {locale === 'pt' ? 'Outra data' : 'Other date'}
                </Button>
              </div>

              {/* Show date picker only when "Other date" is selected */}
              {deliveryOption === 'other' && (
                <Input
                  type='date'
                  min={minDate}
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className='h-9'
                />
              )}

              {/* Info when today is not available */}
              {!anyAvailableToday && (
                <p className='text-xs text-amber-600'>
                  {locale === 'pt'
                    ? 'Produtos no carrinho não estão disponíveis hoje. Escolha outra data.'
                    : 'Products in cart are not available today. Choose another date.'}
                </p>
              )}
            </div>

            {/* Delivery time */}
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

            {/* Payment method */}
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
                  💶 {t('checkout.onDelivery')}
                </Button>
                <Button
                  variant={paymentMethod === 'mbway' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1'
                  onClick={() => setPaymentMethod('mbway')}
                >
                  💳 {t('checkout.mbway')}
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

            {/* Checkout button */}
            <Button
              className='w-full h-12 text-base'
              disabled={!hasValidDate}
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
