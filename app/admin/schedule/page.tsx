'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface DishSchedule {
  _id: string;
  name: { pt: string; en: string };
  flavor?: { pt: string; en: string };
  category: {
    _id: string;
    name: { pt: string; en: string };
    color: string;
    slug: string;
  };
  price: number;
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

const DAYS = [
  { key: 'monday', label: 'Seg' },
  { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
] as const;

export default function SchedulePage() {
  const [dishes, setDishes] = useState<DishSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, Record<string, boolean>>>(
    new Map(),
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (data.success) {
        setDishes(data.dishes);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dishId: string, day: string) => {
    const dish = dishes.find(d => d._id === dishId);
    if (!dish) return;

    const currentChanges = changes.get(dishId) || {};
    const currentValue =
      currentChanges[day] !== undefined
        ? currentChanges[day]
        : dish.schedule?.[day as keyof typeof dish.schedule] || false;

    const newChanges = new Map(changes);
    newChanges.set(dishId, { ...currentChanges, [day]: !currentValue });
    setChanges(newChanges);
  };

  const getDayValue = (dish: DishSchedule, day: string): boolean => {
    const dishChanges = changes.get(dish._id);
    if (dishChanges && dishChanges[day] !== undefined) {
      return dishChanges[day];
    }
    return dish.schedule?.[day as keyof typeof dish.schedule] || false;
  };

  const saveChanges = async () => {
    if (changes.size === 0) return;

    setSaving(true);
    try {
      const updates = Array.from(changes.entries()).map(
        ([dishId, schedule]) => ({
          dishId,
          schedule,
        }),
      );

      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (data.success) {
        setChanges(new Map());
        await fetchSchedule();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAllForDay = (day: string, categoryId?: string) => {
    const targetDishes =
      categoryId && categoryId !== 'all'
        ? dishes.filter(
            d =>
              typeof d.category === 'object' && d.category?._id === categoryId,
          )
        : dishes;

    const allActive = targetDishes.every(d => getDayValue(d, day));
    const newChanges = new Map(changes);

    for (const dish of targetDishes) {
      const currentChanges = newChanges.get(dish._id) || {};
      newChanges.set(dish._id, { ...currentChanges, [day]: !allActive });
    }

    setChanges(newChanges);
  };

  // Categorias únicas
  const categories = Array.from(
    new Map(
      dishes
        .filter(d => d.category && typeof d.category === 'object')
        .map(d => [d.category._id, d.category]),
    ).values(),
  );

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter(
          d =>
            typeof d.category === 'object' &&
            d.category?._id === activeCategory,
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
          <h1 className='text-2xl font-bold'>Agenda Semanal</h1>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={fetchSchedule}>
            <RefreshCw className='w-4 h-4 mr-1' /> Recarregar
          </Button>
          {changes.size > 0 && (
            <Button size='sm' onClick={saveChanges} disabled={saving}>
              <Save className='w-4 h-4 mr-1' />
              {saving ? 'A guardar...' : `Guardar (${changes.size})`}
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide'>
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setActiveCategory('all')}
        >
          Todos
        </Button>
        {categories.map(cat => (
          <Button
            key={cat._id}
            variant={activeCategory === cat._id ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveCategory(cat._id)}
            style={
              activeCategory === cat._id
                ? { backgroundColor: cat.color, borderColor: cat.color }
                : {}
            }
          >
            {cat.name.pt}
          </Button>
        ))}
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className='p-0 overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='text-left p-3 font-medium min-w-[200px] sticky left-0 bg-muted/50'>
                  Produto
                </th>
                {DAYS.map(day => (
                  <th
                    key={day.key}
                    className='p-3 text-center font-medium w-16'
                  >
                    <button
                      onClick={() => toggleAllForDay(day.key, activeCategory)}
                      className='hover:text-primary transition-colors'
                      title={`Alternar todos ${day.label}`}
                    >
                      {day.label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDishes.map(dish => {
                const hasChanges = changes.has(dish._id);
                const categoryColor =
                  typeof dish.category === 'object'
                    ? dish.category?.color
                    : null;

                return (
                  <tr
                    key={dish._id}
                    className={`border-b hover:bg-muted/30 transition-colors ${hasChanges ? 'bg-primary/5' : ''}`}
                  >
                    <td className='p-3 sticky left-0 bg-background'>
                      <div className='flex items-center gap-2'>
                        {categoryColor && (
                          <div
                            className='w-2 h-2 rounded-full shrink-0'
                            style={{ backgroundColor: categoryColor }}
                          />
                        )}
                        <div className='min-w-0'>
                          <span className='font-medium truncate block'>
                            {dish.name.pt}
                          </span>
                          {dish.flavor?.pt && (
                            <span className='text-xs text-muted-foreground'>
                              {dish.flavor.pt}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const active = getDayValue(dish, day.key);
                      const changed =
                        changes.get(dish._id)?.[day.key] !== undefined;

                      return (
                        <td key={day.key} className='p-3 text-center'>
                          <button
                            onClick={() => toggleDay(dish._id, day.key)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              active
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-background hover:border-gray-400'
                            } ${changed ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          >
                            {active ? '✓' : ''}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Floating save bar */}
      {changes.size > 0 && (
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-lg flex items-center gap-3 z-50'>
          <span className='text-sm font-medium'>
            {changes.size} produto{changes.size > 1 ? 's' : ''} alterado
            {changes.size > 1 ? 's' : ''}
          </span>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => setChanges(new Map())}
          >
            Descartar
          </Button>
          <Button
            size='sm'
            variant='secondary'
            onClick={saveChanges}
            disabled={saving}
          >
            <Save className='w-4 h-4 mr-1' />
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>
      )}
    </div>
  );
}
