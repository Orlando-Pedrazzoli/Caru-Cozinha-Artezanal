'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/cn';
import Link from 'next/link';
import Image from 'next/image';

interface Dish {
  _id: string;
  name: { pt: string; en: string };
  category?: { name: { pt: string; en: string } } | null;
  price: number;
  weight?: string;
  flavor?: { pt: string; en: string };
  available: boolean;
  images?: Array<{ url: string }>;
  displayOrder?: number;
}

interface DishTableProps {
  dishes: Dish[];
  onDelete: (id: string) => void;
  onReorder?: (orderedDishes: Dish[]) => void;
}

function SortableRow({
  dish,
  onDelete,
}: {
  dish: Dish;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-muted/50 ${isDragging ? 'bg-muted' : ''}`}
    >
      <td className='p-2 w-8'>
        <button
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none'
          aria-label='Reordenar'
        >
          <GripVertical className='w-4 h-4' />
        </button>
      </td>
      <td className='p-4'>
        {dish.images && dish.images[0] ? (
          <Image
            src={dish.images[0].url}
            alt={dish.name.pt}
            width={50}
            height={50}
            className='rounded-md object-cover'
          />
        ) : (
          <div className='w-12 h-12 bg-muted rounded-md flex items-center justify-center'>
            🥧
          </div>
        )}
      </td>
      <td className='p-4'>
        <div>
          <p className='font-medium'>{dish.name.pt}</p>
          <p className='text-sm text-muted-foreground'>{dish.name.en}</p>
        </div>
      </td>
      <td className='p-4 text-sm'>
        {dish.flavor?.pt ? (
          <Badge variant='secondary'>{dish.flavor.pt}</Badge>
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </td>
      <td className='p-4 text-sm'>
        {dish.category && dish.category.name ? (
          dish.category.name.pt
        ) : (
          <span className='text-muted-foreground italic'>Sem categoria</span>
        )}
      </td>
      <td className='p-4 font-medium'>{formatPrice(dish.price)}</td>
      <td className='p-4 text-sm text-muted-foreground'>
        {dish.weight || '—'}
      </td>
      <td className='p-4'>
        <Badge variant={dish.available ? 'success' : 'destructive'}>
          {dish.available ? 'Disponível' : 'Indisponível'}
        </Badge>
      </td>
      <td className='p-4'>
        <div className='flex justify-end gap-2'>
          <Link href={`/admin/dishes/edit/${dish._id}`}>
            <Button variant='ghost' size='sm'>
              <Edit className='w-4 h-4' />
            </Button>
          </Link>
          <Button variant='ghost' size='sm' onClick={() => onDelete(dish._id)}>
            <Trash2 className='w-4 h-4 text-destructive' />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function DishTable({ dishes, onDelete, onReorder }: DishTableProps) {
  const [items, setItems] = useState(dishes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(dishes);
  }, [dishes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i._id === active.id);
    const newIndex = items.findIndex(i => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // optimistic update

    setSaving(true);
    try {
      const response = await fetch('/api/dishes/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: next.map(d => d._id) }),
      });
      if (!response.ok) {
        // rollback
        setItems(items);
        alert('Erro ao salvar a nova ordem');
      } else if (onReorder) {
        onReorder(next);
      }
    } catch (error) {
      console.error('Reorder error:', error);
      setItems(items);
      alert('Erro ao salvar a nova ordem');
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      {saving && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground px-4 py-2'>
          <Loader2 className='w-3 h-3 animate-spin' />
          Salvando ordem...
        </div>
      )}
      <div className='px-4 py-2 text-xs text-muted-foreground italic'>
        Dica: arraste pelo ícone ⋮⋮ para reordenar os produtos no menu
      </div>
      <table className='w-full'>
        <thead>
          <tr className='border-b'>
            <th className='w-8'></th>
            <th className='text-left p-4 font-medium'>Imagem</th>
            <th className='text-left p-4 font-medium'>Nome</th>
            <th className='text-left p-4 font-medium'>Sabor</th>
            <th className='text-left p-4 font-medium'>Categoria</th>
            <th className='text-left p-4 font-medium'>Preço</th>
            <th className='text-left p-4 font-medium'>Peso</th>
            <th className='text-left p-4 font-medium'>Status</th>
            <th className='text-right p-4 font-medium'>Ações</th>
          </tr>
        </thead>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(i => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {items.map(dish => (
                <SortableRow key={dish._id} dish={dish} onDelete={onDelete} />
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  );
}
