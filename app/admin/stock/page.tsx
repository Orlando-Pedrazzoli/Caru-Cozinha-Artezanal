'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  History,
} from 'lucide-react';
import Link from 'next/link';

interface StockItem {
  _id: string;
  name: { pt: string; en: string };
  flavor?: { pt: string; en: string };
  category: {
    _id: string;
    name: { pt: string; en: string };
    color: string;
  };
  image: string | null;
  stock: {
    enabled: boolean;
    quantity: number;
    reserved: number;
    available: number;
    lowStockThreshold: number;
    isLow: boolean;
  };
}

interface StockLog {
  _id: string;
  action: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  order?: { orderNumber: string };
  note?: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  restock: '📦 Reposição',
  order_reserved: '🔒 Reservado',
  order_confirmed: '✅ Confirmado',
  order_cancelled: '↩️ Cancelado',
  manual_adjust: '✏️ Ajuste manual',
};

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockValues, setRestockValues] = useState<Record<string, string>>(
    {},
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success) {
        setStockItems(data.stock);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (dishId: string, quantity: number) => {
    if (!quantity || quantity === 0) return;

    setUpdating(dishId);
    try {
      const res = await fetch('/api/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishId,
          quantity,
          note: `Reposição manual: +${quantity}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRestockValues(prev => ({ ...prev, [dishId]: '' }));
        await fetchStock();
      }
    } catch (error) {
      console.error('Error restocking:', error);
    } finally {
      setUpdating(null);
    }
  };

  const fetchLogs = async (dishId: string) => {
    setSelectedDish(dishId);
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/stock/${dishId}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const lowStockItems = stockItems.filter(item => item.stock.isLow);
  const outOfStockItems = stockItems.filter(
    item => item.stock.enabled && item.stock.available <= 0,
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
      </div>
    );
  }

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
          <h1 className='text-2xl font-bold'>Gestão de Stock</h1>
        </div>
        <Button variant='outline' size='sm' onClick={fetchStock}>
          <RefreshCw className='w-4 h-4 mr-1' /> Atualizar
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className='grid sm:grid-cols-2 gap-3 mb-6'>
          {outOfStockItems.length > 0 && (
            <Card className='border-red-200 bg-red-50'>
              <CardContent className='p-4 flex items-start gap-3'>
                <AlertTriangle className='w-5 h-5 text-red-600 shrink-0 mt-0.5' />
                <div>
                  <p className='font-medium text-red-800'>
                    {outOfStockItems.length} produto
                    {outOfStockItems.length > 1 ? 's' : ''} esgotado
                    {outOfStockItems.length > 1 ? 's' : ''}
                  </p>
                  <p className='text-sm text-red-600'>
                    {outOfStockItems.map(i => i.name.pt).join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockItems.length > 0 && (
            <Card className='border-amber-200 bg-amber-50'>
              <CardContent className='p-4 flex items-start gap-3'>
                <Package className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
                <div>
                  <p className='font-medium text-amber-800'>
                    {lowStockItems.length} com stock baixo
                  </p>
                  <p className='text-sm text-amber-600'>
                    {lowStockItems
                      .map(i => `${i.name.pt} (${i.stock.available})`)
                      .join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stock Table */}
      <Card>
        <CardContent className='p-0 overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='text-left p-3 font-medium'>Produto</th>
                <th className='p-3 text-center font-medium w-20'>Total</th>
                <th className='p-3 text-center font-medium w-20'>Reserv.</th>
                <th className='p-3 text-center font-medium w-20'>Disp.</th>
                <th className='p-3 text-center font-medium w-48'>Reposição</th>
                <th className='p-3 text-center font-medium w-16'>Log</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => {
                const isLow = item.stock.isLow;
                const isOut = item.stock.enabled && item.stock.available <= 0;

                return (
                  <tr
                    key={item._id}
                    className={`border-b transition-colors ${
                      isOut
                        ? 'bg-red-50/50'
                        : isLow
                          ? 'bg-amber-50/50'
                          : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className='p-3'>
                      <div className='flex items-center gap-2'>
                        {item.category?.color && (
                          <div
                            className='w-2 h-2 rounded-full shrink-0'
                            style={{ backgroundColor: item.category.color }}
                          />
                        )}
                        <div>
                          <span className='font-medium'>{item.name.pt}</span>
                          {item.flavor?.pt && (
                            <span className='text-muted-foreground'>
                              {' '}
                              ({item.flavor.pt})
                            </span>
                          )}
                        </div>
                        {isOut && (
                          <span className='text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded'>
                            Esgotado
                          </span>
                        )}
                        {isLow && !isOut && (
                          <span className='text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded'>
                            Baixo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='p-3 text-center font-mono'>
                      {item.stock.enabled ? item.stock.quantity : '—'}
                    </td>
                    <td className='p-3 text-center font-mono text-amber-600'>
                      {item.stock.enabled && item.stock.reserved > 0
                        ? item.stock.reserved
                        : item.stock.enabled
                          ? '0'
                          : '—'}
                    </td>
                    <td
                      className={`p-3 text-center font-mono font-bold ${
                        isOut
                          ? 'text-red-600'
                          : isLow
                            ? 'text-amber-600'
                            : 'text-green-600'
                      }`}
                    >
                      {item.stock.enabled ? item.stock.available : '—'}
                    </td>
                    <td className='p-3'>
                      {item.stock.enabled && (
                        <div className='flex items-center gap-1 justify-center'>
                          <Input
                            type='number'
                            min='1'
                            placeholder='Qty'
                            className='w-20 h-8 text-center text-sm'
                            value={restockValues[item._id] || ''}
                            onChange={e =>
                              setRestockValues(prev => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-8'
                            disabled={
                              updating === item._id || !restockValues[item._id]
                            }
                            onClick={() =>
                              handleRestock(
                                item._id,
                                parseInt(restockValues[item._id] || '0'),
                              )
                            }
                          >
                            {updating === item._id ? (
                              '...'
                            ) : (
                              <>
                                <Plus className='w-3 h-3 mr-1' /> Repor
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className='p-3 text-center'>
                      {item.stock.enabled && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => fetchLogs(item._id)}
                        >
                          <History className='w-4 h-4' />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Stock Log Modal */}
      {selectedDish && (
        <div
          className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'
          onClick={() => setSelectedDish(null)}
        >
          <div
            className='bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-bold'>Histórico de Stock</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedDish(null)}
              >
                ✕
              </Button>
            </div>

            {logsLoading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary' />
              </div>
            ) : logs.length === 0 ? (
              <p className='text-center text-muted-foreground py-8'>
                Sem registos de movimentação
              </p>
            ) : (
              <div className='space-y-2'>
                {logs.map(log => (
                  <div
                    key={log._id}
                    className='flex items-start justify-between p-2 border rounded text-sm'
                  >
                    <div>
                      <p className='font-medium'>
                        {ACTION_LABELS[log.action] || log.action}
                      </p>
                      {log.order && (
                        <p className='text-xs text-muted-foreground'>
                          Pedido: {log.order.orderNumber}
                        </p>
                      )}
                      {log.note && (
                        <p className='text-xs text-muted-foreground'>
                          {log.note}
                        </p>
                      )}
                      <p className='text-xs text-muted-foreground'>
                        {new Date(log.createdAt).toLocaleString('pt-PT')}
                      </p>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`font-mono font-bold ${
                          log.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {log.quantity > 0 ? '+' : ''}
                        {log.quantity}
                      </span>
                      <p className='text-xs text-muted-foreground'>
                        {log.previousStock} → {log.newStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
