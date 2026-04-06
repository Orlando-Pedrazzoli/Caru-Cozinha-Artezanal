'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/cn';
import Link from 'next/link';
import Image from 'next/image';

interface Dish {
  _id: string;
  name: { pt: string; en: string };
  category?: { name: { pt: string; en: string } } | null;
  price: number;
  weight?: string;
  available: boolean;
  images?: Array<{ url: string }>;
  variants?: Array<{ name: { pt: string; en: string } }>;
}

interface DishTableProps {
  dishes: Dish[];
  onDelete: (id: string) => void;
}

export function DishTable({ dishes, onDelete }: DishTableProps) {
  if (dishes.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b'>
            <th className='text-left p-4 font-medium'>Imagem</th>
            <th className='text-left p-4 font-medium'>Nome</th>
            <th className='text-left p-4 font-medium'>Categoria</th>
            <th className='text-left p-4 font-medium'>Preço</th>
            <th className='text-left p-4 font-medium'>Peso</th>
            <th className='text-left p-4 font-medium'>Sabores</th>
            <th className='text-left p-4 font-medium'>Status</th>
            <th className='text-right p-4 font-medium'>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map(dish => (
            <tr key={dish._id} className='border-b hover:bg-muted/50'>
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
                  <p className='text-sm text-muted-foreground'>
                    {dish.name.en}
                  </p>
                </div>
              </td>
              <td className='p-4 text-sm'>
                {dish.category && dish.category.name ? (
                  dish.category.name.pt
                ) : (
                  <span className='text-muted-foreground italic'>
                    Sem categoria
                  </span>
                )}
              </td>
              <td className='p-4 font-medium'>{formatPrice(dish.price)}</td>
              <td className='p-4 text-sm text-muted-foreground'>
                {dish.weight || '—'}
              </td>
              <td className='p-4 text-sm text-muted-foreground'>
                {dish.variants && dish.variants.length > 0
                  ? `${dish.variants.length} sabores`
                  : '—'}
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
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onDelete(dish._id)}
                  >
                    <Trash2 className='w-4 h-4 text-destructive' />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
