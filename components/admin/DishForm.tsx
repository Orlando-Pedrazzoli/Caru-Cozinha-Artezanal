'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Category {
  _id: string;
  name: { pt: string; en: string };
}

interface Variant {
  name: { pt: string; en: string };
  price: number | null;
  available: boolean;
}

interface PortionSize {
  label: { pt: string; en: string };
  price: number;
  weight: string;
}

interface DishFormProps {
  dish?: any;
  onSubmit: (data: any) => void;
}

export function DishForm({ dish, onSubmit }: DishFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: { pt: '', en: '' },
    description: { pt: '', en: '' },
    baseDescription: { pt: '', en: '' },
    category: '',
    price: 0,
    weight: '',
    calories: '' as string | number,
    images: [] as Array<{ url: string; isPrimary: boolean }>,
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      fitness: false,
    },
    variants: [] as Variant[],
    portionSizes: [] as PortionSize[],
    available: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description,
        baseDescription: dish.baseDescription || { pt: '', en: '' },
        category: dish.category ? dish.category._id || dish.category : '',
        price: dish.price || 0,
        weight: dish.weight || '',
        calories: dish.calories || '',
        images: dish.images || [],
        dietaryInfo: dish.dietaryInfo || {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
          fitness: false,
        },
        variants: dish.variants || [],
        portionSizes: dish.portionSizes || [],
        available: dish.available,
        displayOrder: dish.displayOrder || 0,
      });
    }
  }, [dish]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        if (!dish && data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: data.categories[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          images: [
            ...prev.images,
            { url: data.url, isPrimary: prev.images.length === 0 },
          ],
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handlePriceChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      price: isNaN(numValue) ? 0 : numValue,
    }));
  };

  // --- Variants ---
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: { pt: '', en: '' }, price: null, available: true },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== index) return v;
        if (field === 'name.pt')
          return { ...v, name: { ...v.name, pt: value } };
        if (field === 'name.en')
          return { ...v, name: { ...v.name, en: value } };
        if (field === 'price')
          return { ...v, price: value === '' ? null : parseFloat(value) };
        if (field === 'available') return { ...v, available: value };
        return v;
      }),
    }));
  };

  // --- Portion Sizes ---
  const addPortionSize = () => {
    setFormData(prev => ({
      ...prev,
      portionSizes: [
        ...prev.portionSizes,
        { label: { pt: '', en: '' }, price: 0, weight: '' },
      ],
    }));
  };

  const removePortionSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portionSizes: prev.portionSizes.filter((_, i) => i !== index),
    }));
  };

  const updatePortionSize = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      portionSizes: prev.portionSizes.map((p, i) => {
        if (i !== index) return p;
        if (field === 'label.pt')
          return { ...p, label: { ...p.label, pt: value } };
        if (field === 'label.en')
          return { ...p, label: { ...p.label, en: value } };
        if (field === 'price')
          return { ...p, price: value === '' ? 0 : parseFloat(value) };
        if (field === 'weight') return { ...p, weight: value };
        return p;
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert('Por favor, selecione uma categoria');
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        calories: formData.calories === '' ? null : Number(formData.calories),
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Nome */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='name-pt'>Nome (Português) *</Label>
          <Input
            id='name-pt'
            value={formData.name.pt}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                name: { ...prev.name, pt: e.target.value },
              }))
            }
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='name-en'>Nome (English) *</Label>
          <Input
            id='name-en'
            value={formData.name.en}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                name: { ...prev.name, en: e.target.value },
              }))
            }
            required
          />
        </div>
      </div>

      {/* Descrição */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='desc-pt'>Descrição (Português) *</Label>
          <textarea
            id='desc-pt'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            value={formData.description.pt}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                description: { ...prev.description, pt: e.target.value },
              }))
            }
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='desc-en'>Descrição (English) *</Label>
          <textarea
            id='desc-en'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            value={formData.description.en}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                description: { ...prev.description, en: e.target.value },
              }))
            }
            required
          />
        </div>
      </div>

      {/* Base Description (tipo de massa, etc.) */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='base-pt'>Base/Massa (Português)</Label>
          <Input
            id='base-pt'
            placeholder='Ex: Massa de batata-doce com farinhas de aveia e milho'
            value={formData.baseDescription.pt}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                baseDescription: {
                  ...prev.baseDescription,
                  pt: e.target.value,
                },
              }))
            }
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='base-en'>Base/Dough (English)</Label>
          <Input
            id='base-en'
            placeholder='Ex: Sweet potato dough with oat and corn flour'
            value={formData.baseDescription.en}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                baseDescription: {
                  ...prev.baseDescription,
                  en: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      {/* Categoria, Preço, Peso, Calorias */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='category'>Categoria *</Label>
          <select
            id='category'
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            value={formData.category}
            onChange={e =>
              setFormData(prev => ({ ...prev, category: e.target.value }))
            }
            required
          >
            {!formData.category && <option value=''>Selecione</option>}
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name.pt}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='price'>Preço (€) *</Label>
          <Input
            id='price'
            type='number'
            step='0.01'
            value={formData.price || ''}
            onChange={e => handlePriceChange(e.target.value)}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='weight'>Peso</Label>
          <Input
            id='weight'
            placeholder='Ex: 180g'
            value={formData.weight}
            onChange={e =>
              setFormData(prev => ({ ...prev, weight: e.target.value }))
            }
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='calories'>Calorias</Label>
          <Input
            id='calories'
            type='number'
            placeholder='kcal'
            value={formData.calories}
            onChange={e =>
              setFormData(prev => ({ ...prev, calories: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Imagens */}
      <div className='space-y-2'>
        <Label>Imagens</Label>
        <div className='flex flex-wrap gap-4'>
          {formData.images.map((img, index) => (
            <div key={index} className='relative group'>
              <Image
                src={img.url}
                alt='Product'
                width={100}
                height={100}
                className='rounded-lg object-cover'
              />
              <button
                type='button'
                onClick={() => removeImage(index)}
                className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
          <label className='w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors'>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className='w-6 h-6 animate-spin' />
            ) : (
              <Upload className='w-6 h-6 text-muted-foreground' />
            )}
          </label>
        </div>
      </div>

      {/* Dietary Info */}
      <div className='space-y-2'>
        <Label>Informação Dietética</Label>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.dietaryInfo.fitness}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dietaryInfo: {
                    ...prev.dietaryInfo,
                    fitness: e.target.checked,
                  },
                }))
              }
              className='rounded'
            />
            <span className='text-sm'>Fitness</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.dietaryInfo.vegetarian}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dietaryInfo: {
                    ...prev.dietaryInfo,
                    vegetarian: e.target.checked,
                  },
                }))
              }
              className='rounded'
            />
            <span className='text-sm'>Vegetariano</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.dietaryInfo.vegan}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dietaryInfo: { ...prev.dietaryInfo, vegan: e.target.checked },
                }))
              }
              className='rounded'
            />
            <span className='text-sm'>Vegano</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.dietaryInfo.glutenFree}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dietaryInfo: {
                    ...prev.dietaryInfo,
                    glutenFree: e.target.checked,
                  },
                }))
              }
              className='rounded'
            />
            <span className='text-sm'>Sem Glúten</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={formData.dietaryInfo.dairyFree}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dietaryInfo: {
                    ...prev.dietaryInfo,
                    dairyFree: e.target.checked,
                  },
                }))
              }
              className='rounded'
            />
            <span className='text-sm'>Sem Lactose</span>
          </label>
        </div>
      </div>

      {/* Variants (Sabores) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Sabores / Variantes</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addVariant}
          >
            <Plus className='w-4 h-4 mr-1' /> Adicionar Sabor
          </Button>
        </div>
        {formData.variants.map((variant, index) => (
          <div
            key={index}
            className='grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg'
          >
            <Input
              placeholder='Nome PT'
              value={variant.name.pt}
              onChange={e => updateVariant(index, 'name.pt', e.target.value)}
            />
            <Input
              placeholder='Name EN'
              value={variant.name.en}
              onChange={e => updateVariant(index, 'name.en', e.target.value)}
            />
            <Input
              type='number'
              step='0.01'
              placeholder='Preço (opcional)'
              value={variant.price ?? ''}
              onChange={e => updateVariant(index, 'price', e.target.value)}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => removeVariant(index)}
            >
              <Trash2 className='w-4 h-4 text-destructive' />
            </Button>
          </div>
        ))}
      </div>

      {/* Portion Sizes */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Tamanhos de Porção</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addPortionSize}
          >
            <Plus className='w-4 h-4 mr-1' /> Adicionar Porção
          </Button>
        </div>
        {formData.portionSizes.map((portion, index) => (
          <div
            key={index}
            className='grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded-lg'
          >
            <Input
              placeholder='Label PT (Ex: Individual)'
              value={portion.label.pt}
              onChange={e =>
                updatePortionSize(index, 'label.pt', e.target.value)
              }
            />
            <Input
              placeholder='Label EN (Ex: Individual)'
              value={portion.label.en}
              onChange={e =>
                updatePortionSize(index, 'label.en', e.target.value)
              }
            />
            <Input
              type='number'
              step='0.01'
              placeholder='Preço €'
              value={portion.price || ''}
              onChange={e => updatePortionSize(index, 'price', e.target.value)}
            />
            <Input
              placeholder='Peso (Ex: 350g)'
              value={portion.weight}
              onChange={e => updatePortionSize(index, 'weight', e.target.value)}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => removePortionSize(index)}
            >
              <Trash2 className='w-4 h-4 text-destructive' />
            </Button>
          </div>
        ))}
      </div>

      {/* Available */}
      <div className='space-y-2'>
        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={formData.available}
            onChange={e =>
              setFormData(prev => ({ ...prev, available: e.target.checked }))
            }
            className='rounded'
          />
          <span className='text-sm font-medium'>Disponível no menu</span>
        </label>
      </div>

      {/* Submit */}
      <div className='flex gap-4 pt-4'>
        <Button type='submit' disabled={loading} className='flex-1'>
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Salvando...
            </>
          ) : dish ? (
            'Atualizar Produto'
          ) : (
            'Criar Produto'
          )}
        </Button>
      </div>
    </form>
  );
}
