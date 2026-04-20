'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, CartItem } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/utils/cn';
import {
  X,
  MessageSquare,
  Loader2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface WhatsAppCheckoutProps {
  open: boolean;
  onClose: () => void;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: 'on_delivery' | 'mbway';
}

export function WhatsAppCheckout({
  open,
  onClose,
  deliveryDate,
  deliveryTime,
  paymentMethod,
}: WhatsAppCheckoutProps) {
  const t = useTranslations();
  const locale = useLocale() as 'pt' | 'en';
  const { items, total, clearCart, setIsCartOpen } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError(locale === 'pt' ? 'Nome é obrigatório' : 'Name is required');
      return;
    }
    if (!customerPhone.trim()) {
      setError(
        locale === 'pt' ? 'Telefone é obrigatório' : 'Phone is required',
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || undefined,
            notes: notes.trim() || undefined,
          },
          items: items.map((item: CartItem) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            portionSize: item.portionSize || undefined,
          })),
          deliveryDate,
          deliveryTime:
            deliveryTime === 'morning'
              ? locale === 'pt'
                ? 'Manhã'
                : 'Morning'
              : deliveryTime === 'afternoon'
                ? locale === 'pt'
                  ? 'Tarde'
                  : 'Afternoon'
                : '',
          paymentMethod,
          locale,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Erro ao criar encomenda');
        return;
      }

      setSuccess(true);
      setOrderNumber(data.order.orderNumber);
      setWhatsappUrl(data.whatsappUrl);

      setTimeout(() => {
        window.open(data.whatsappUrl, '_blank');
      }, 1500);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        locale === 'pt'
          ? 'Erro ao processar encomenda. Tente novamente.'
          : 'Error processing order. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      clearCart();
      setIsCartOpen(false);
    }
    setSuccess(false);
    setOrderNumber('');
    setWhatsappUrl('');
    setError('');
    onClose();
  };

  if (!open) return null;

  const formattedDate = deliveryDate
    ? new Date(deliveryDate + 'T12:00:00').toLocaleDateString(
        locale === 'pt' ? 'pt-PT' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'long' },
      )
    : '';

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-[70] bg-black/50' onClick={handleClose} />

      {/* Modal container — centralizado, altura limitada, flex-col pra footer sticky */}
      <div
        className='fixed inset-x-3 top-3 bottom-3 z-[70] mx-auto max-w-md bg-background rounded-xl shadow-2xl flex flex-col overflow-hidden md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[90vh] md:w-[calc(100%-2rem)]'
        onClick={e => e.stopPropagation()}
      >
        {/* Header — shrink-0 */}
        <div className='flex items-center justify-between p-4 border-b shrink-0'>
          <h2 className='text-lg font-bold flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-green-600' />
            {t('checkout.title')}
          </h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            className='h-8 w-8 p-0'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {success ? (
          /* Success state — scrollable se precisar */
          <div className='flex-1 overflow-y-auto p-6 text-center space-y-4'>
            <CheckCircle className='w-16 h-16 text-green-500 mx-auto' />
            <h3 className='text-xl font-bold'>{t('checkout.orderSuccess')}</h3>
            <p className='text-muted-foreground'>
              {t('checkout.orderNumber')}: <strong>{orderNumber}</strong>
            </p>
            <p className='text-sm text-muted-foreground'>
              {t('checkout.whatsappRedirect')}
            </p>

            {whatsappUrl && (
              <a href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
                <Button className='w-full bg-green-600 hover:bg-green-700'>
                  <ExternalLink className='w-4 h-4 mr-2' />
                  {locale === 'pt' ? 'Abrir WhatsApp' : 'Open WhatsApp'}
                </Button>
              </a>
            )}

            <Button variant='outline' className='w-full' onClick={handleClose}>
              {locale === 'pt' ? 'Fechar' : 'Close'}
            </Button>
          </div>
        ) : (
          <>
            {/* Form — scrollable */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 min-h-0'>
              {/* Order summary */}
              <div className='bg-muted/50 rounded-lg p-3 space-y-1'>
                <p className='text-sm font-medium'>
                  {items.length} {locale === 'pt' ? 'produto(s)' : 'item(s)'} ·{' '}
                  <span className='text-primary font-bold'>
                    {formatPrice(total, locale === 'pt' ? 'pt-PT' : 'en-US')}
                  </span>
                </p>
                <p className='text-xs text-muted-foreground'>
                  📅 {formattedDate}
                  {deliveryTime && (
                    <>
                      {' '}
                      · ⏰{' '}
                      {deliveryTime === 'morning'
                        ? t('cart.morning')
                        : t('cart.afternoon')}
                    </>
                  )}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {paymentMethod === 'on_delivery'
                    ? `💶 ${t('checkout.onDelivery')}`
                    : `💳 ${t('checkout.mbway')}`}
                </p>
              </div>

              {/* Customer form */}
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='name' className='text-sm'>
                    {t('checkout.customerName')} *
                  </Label>
                  <Input
                    id='name'
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={locale === 'pt' ? 'O seu nome' : 'Your name'}
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='phone' className='text-sm'>
                    {t('checkout.customerPhone')} *
                  </Label>
                  <Input
                    id='phone'
                    type='tel'
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder='+351 912 345 678'
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='email' className='text-sm'>
                    {t('checkout.customerEmail')}
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder='email@exemplo.com'
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='notes' className='text-sm'>
                    {t('checkout.notes')}
                  </Label>
                  <textarea
                    id='notes'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={
                      locale === 'pt'
                        ? 'Alguma observação sobre a encomenda...'
                        : 'Any notes about the order...'
                    }
                    rows={2}
                    className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none'
                  />
                </div>
              </div>

              {/* MBWay info */}
              {paymentMethod === 'mbway' && (
                <div className='bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300'>
                  💳 {t('checkout.mbwayInfo')}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className='bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400'>
                  {error}
                </div>
              )}
            </div>

            {/* Footer — sticky, sempre visível */}
            <div className='shrink-0 border-t p-4 bg-background'>
              <Button
                className='w-full h-12 text-base bg-green-600 hover:bg-green-700'
                onClick={handleSubmit}
                disabled={
                  loading || !customerName.trim() || !customerPhone.trim()
                }
              >
                {loading ? (
                  <Loader2 className='w-5 h-5 animate-spin mr-2' />
                ) : (
                  <MessageSquare className='w-5 h-5 mr-2' />
                )}
                {loading
                  ? locale === 'pt'
                    ? 'A processar...'
                    : 'Processing...'
                  : t('checkout.orderViaWhatsapp')}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
