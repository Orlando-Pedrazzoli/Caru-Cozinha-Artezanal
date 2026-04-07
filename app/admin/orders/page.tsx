'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Check,
  ChefHat,
  Truck,
  XCircle,
  Clock,
  CreditCard,
  Phone,
  RefreshCw,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  dish: any;
  name: { pt: string; en: string };
  flavor?: { pt: string; en: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  portionSize?: { label: { pt: string; en: string }; price: number };
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
  items: OrderItem[];
  totals: { subtotal: number; discount: number; total: number };
  deliveryDate: string;
  deliveryTime?: string;
  status: string;
  payment: {
    method: string;
    status: string;
    paidAt?: string;
    amount: number;
  };
  source: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  pending: {
    label: 'Pendente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Check,
  },
  preparing: {
    label: 'A preparar',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: ChefHat,
  },
  ready: {
    label: 'Pronta',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: Package,
  },
  delivered: {
    label: 'Entregue',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: Truck,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling para novas encomendas
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)),
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(null);
    }
  };

  const updatePayment = async (orderId: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o =>
            o._id === orderId
              ? { ...o, payment: { ...o.payment, status: 'paid' } }
              : o,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className='min-h-screen bg-background p-4 md:p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/dashboard'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-1' /> Voltar
            </Button>
          </Link>
          <h1 className='text-2xl font-bold'>Encomendas</h1>
          {pendingCount > 0 && (
            <span className='bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Button variant='outline' size='sm' onClick={fetchOrders}>
          <RefreshCw className='w-4 h-4 mr-1' /> Atualizar
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide'>
        {[
          'all',
          'pending',
          'confirmed',
          'preparing',
          'ready',
          'delivered',
          'cancelled',
        ].map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size='sm'
            onClick={() => setStatusFilter(status)}
            className='whitespace-nowrap'
          >
            {status === 'all'
              ? `Todas (${orders.length})`
              : `${STATUS_CONFIG[status]?.label || status} (${orders.filter(o => o.status === status).length})`}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className='flex justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center text-muted-foreground'>
            Nenhuma encomenda encontrada
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-3'>
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const nextStatus = NEXT_STATUS[order.status];

            return (
              <Card
                key={order._id}
                className={`border ${config.bgColor} cursor-pointer transition-all hover:shadow-md`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    {/* Left: Order info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className='font-mono text-sm font-bold'>
                          {order.orderNumber}
                        </span>
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className='font-medium truncate'>
                        {order.customer.name}
                      </p>
                      <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                        <span>{formatDate(order.deliveryDate)}</span>
                        {order.deliveryTime && (
                          <span>{order.deliveryTime}</span>
                        )}
                        <span className='font-bold text-foreground'>
                          €{order.totals.total.toFixed(2)}
                        </span>
                        <span>
                          {order.payment.method === 'on_delivery'
                            ? '💶 Na entrega'
                            : '💳 MBWay'}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {order.items.length} item
                        {order.items.length > 1 ? 's' : ''}
                        {' · '}
                        {order.items
                          .map(i => `${i.quantity}x ${i.name.pt}`)
                          .join(', ')}
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div
                      className='flex flex-col gap-1'
                      onClick={e => e.stopPropagation()}
                    >
                      {nextStatus && (
                        <Button
                          size='sm'
                          disabled={updating === order._id}
                          onClick={() => updateStatus(order._id, nextStatus)}
                          className='text-xs'
                        >
                          {updating === order._id
                            ? '...'
                            : STATUS_CONFIG[nextStatus]?.label || nextStatus}
                        </Button>
                      )}
                      {order.payment.status === 'pending' && (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={updating === order._id}
                          onClick={() => updatePayment(order._id)}
                          className='text-xs'
                        >
                          <CreditCard className='w-3 h-3 mr-1' /> Pago
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={updating === order._id}
                          onClick={() => updateStatus(order._id, 'cancelled')}
                          className='text-xs text-destructive'
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className='bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold'>{selectedOrder.orderNumber}</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </Button>
            </div>

            {/* Status */}
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-4 ${STATUS_CONFIG[selectedOrder.status]?.bgColor} ${STATUS_CONFIG[selectedOrder.status]?.color}`}
            >
              {STATUS_CONFIG[selectedOrder.status]?.label}
            </div>

            {/* Customer */}
            <div className='space-y-1 mb-4'>
              <p className='font-medium'>{selectedOrder.customer.name}</p>
              <a
                href={`tel:${selectedOrder.customer.phone}`}
                className='flex items-center gap-1 text-sm text-primary hover:underline'
              >
                <Phone className='w-3 h-3' /> {selectedOrder.customer.phone}
              </a>
              {selectedOrder.customer.email && (
                <p className='text-sm text-muted-foreground'>
                  {selectedOrder.customer.email}
                </p>
              )}
              {selectedOrder.customer.notes && (
                <p className='text-sm bg-muted p-2 rounded mt-2'>
                  📝 {selectedOrder.customer.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className='border rounded-lg divide-y mb-4'>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className='p-3 flex justify-between'>
                  <div>
                    <span className='font-medium'>
                      {item.quantity}x {item.name.pt}
                    </span>
                    {item.flavor?.pt && (
                      <span className='text-muted-foreground'>
                        {' '}
                        ({item.flavor.pt})
                      </span>
                    )}
                  </div>
                  <span className='font-medium'>
                    €{item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className='p-3 flex justify-between font-bold'>
                <span>Total</span>
                <span>€{selectedOrder.totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery & Payment */}
            <div className='grid grid-cols-2 gap-3 text-sm mb-4'>
              <div>
                <span className='text-muted-foreground'>Entrega:</span>
                <p className='font-medium'>
                  {formatDate(selectedOrder.deliveryDate)}
                  {selectedOrder.deliveryTime &&
                    ` — ${selectedOrder.deliveryTime}`}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Pagamento:</span>
                <p className='font-medium'>
                  {selectedOrder.payment.method === 'on_delivery'
                    ? 'Na entrega'
                    : 'MBWay'}{' '}
                  —{' '}
                  {selectedOrder.payment.status === 'paid'
                    ? '✅ Pago'
                    : '⏳ Pendente'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Origem:</span>
                <p className='font-medium'>
                  {selectedOrder.source === 'whatsapp'
                    ? '💬 WhatsApp'
                    : '🌐 Website'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Criada:</span>
                <p className='font-medium'>
                  {formatDate(selectedOrder.createdAt)}{' '}
                  {formatTime(selectedOrder.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2 flex-wrap'>
              {NEXT_STATUS[selectedOrder.status] && (
                <Button
                  onClick={() => {
                    updateStatus(
                      selectedOrder._id,
                      NEXT_STATUS[selectedOrder.status],
                    );
                    setSelectedOrder({
                      ...selectedOrder,
                      status: NEXT_STATUS[selectedOrder.status],
                    });
                  }}
                >
                  Avançar para:{' '}
                  {STATUS_CONFIG[NEXT_STATUS[selectedOrder.status]]?.label}
                </Button>
              )}
              {selectedOrder.payment.status === 'pending' && (
                <Button
                  variant='outline'
                  onClick={() => {
                    updatePayment(selectedOrder._id);
                    setSelectedOrder({
                      ...selectedOrder,
                      payment: { ...selectedOrder.payment, status: 'paid' },
                    });
                  }}
                >
                  <CreditCard className='w-4 h-4 mr-1' /> Marcar como pago
                </Button>
              )}
              <a
                href={`https://wa.me/${selectedOrder.customer.phone.replace(/\D/g, '')}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button variant='outline'>
                  <MessageSquare className='w-4 h-4 mr-1' /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
