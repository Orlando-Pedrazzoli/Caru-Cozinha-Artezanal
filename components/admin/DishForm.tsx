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

interface PortionSize {
  label: { pt: string; en: string };
  price: number | null;
  weight: string;
}

interface FormData {
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  baseDescription: { pt: string; en: string };
  category: string;
  price: string;
  weight: string;
  calories: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    fitness: boolean;
  };
  flavor: { pt: string; en: string };
  portionSizes: PortionSize[];
  available: boolean;
  displayOrder: number;
}

interface DishFormProps {
  dish?: any;
  onSubmit: (data: any) => void;
}

export function DishForm({ dish, onSubmit }: DishFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: { pt: '', en: '' },
    description: { pt: '', en: '' },
    baseDescription: { pt: '', en: '' },
    category: '',
    price: '',
    weight: '',
    calories: '',
    images: [],
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      fitness: false,
    },
    flavor: { pt: '', en: '' },
    portionSizes: [],
    available: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (dish) {
      setFormData({
        name: dish.name || { pt: '', en: '' },
        description: dish.description || { pt: '', en: '' },
        baseDescription: dish.baseDescription || { pt: '', en: '' },
        category: dish.category ? dish.category._id || dish.category : '',
        price: dish.price != null ? String(dish.price) : '',
        weight: dish.weight || '',
        calories: dish.calories != null ? String(dish.calories) : '',
        images: dish.images || [],
        dietaryInfo: {
          vegetarian: dish.dietaryInfo?.vegetarian || false,
          vegan: dish.dietaryInfo?.vegan || false,
          glutenFree: dish.dietaryInfo?.glutenFree || false,
          dairyFree: dish.dietaryInfo?.dairyFree || false,
          fitness: dish.dietaryInfo?.fitness || false,
        },
        flavor: dish.flavor || { pt: '', en: '' },
        portionSizes: (dish.portionSizes || []).map((p: any) => ({
          label: p.label || { pt: '', en: '' },
          price: p.price != null ? p.price : null,
          weight: p.weight || '',
        })),
        available: dish.available !== false,
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [field]: value },
    }));
  };

  // --- Images ---
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
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  // --- Portion Sizes ---
  const addPortionSize = () => {
    setFormData(prev => ({
      ...prev,
      portionSizes: [
        ...prev.portionSizes,
        { label: { pt: '', en: '' }, price: null, weight: '' },
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
          return {
            ...p,
            price:
              value === '' ? null : parseFloat(value.replace(',', '.')) || null,
          };
        if (field === 'weight') return { ...p, weight: value };
        return p;
      }),
    }));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      alert('Por favor, selecione uma categoria');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Por favor, insira um preço válido');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        baseDescription: formData.baseDescription,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        weight: formData.weight,
        calories: formData.calories === '' ? null : Number(formData.calories),
        images: formData.images,
        dietaryInfo: formData.dietaryInfo,
        flavor: formData.flavor,
        portionSizes: formData.portionSizes
          .filter(p => p.label.pt.trim() !== '')
          .map(p => ({
            label: p.label,
            price: p.price || 0,
            weight: p.weight,
          })),
        available: formData.available,
        displayOrder: formData.displayOrder,
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
            onChange={e => updateNestedField('name', 'pt', e.target.value)}
            placeholder='Ex: Torta Salgada'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='name-en'>Nome (English) *</Label>
          <Input
            id='name-en'
            value={formData.name.en}
            onChange={e => updateNestedField('name', 'en', e.target.value)}
            placeholder='Ex: Savoury Pie'
            required
          />
        </div>
      </div>

      {/* Sabor */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='flavor-pt'>Sabor (Português)</Label>
          <Input
            id='flavor-pt'
            value={formData.flavor.pt}
            onChange={e => updateNestedField('flavor', 'pt', e.target.value)}
            placeholder='Ex: Cogumelos, Frango, Verduras...'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='flavor-en'>Flavour (English)</Label>
          <Input
            id='flavor-en'
            value={formData.flavor.en}
            onChange={e => updateNestedField('flavor', 'en', e.target.value)}
            placeholder='Ex: Mushrooms, Chicken, Vegetables...'
          />
        </div>
      </div>

      {/* Descrição */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='desc-pt'>Descrição (Português) *</Label>
          <textarea
            id='desc-pt'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            value={formData.description.pt}
            onChange={e =>
              updateNestedField('description', 'pt', e.target.value)
            }
            placeholder='Descrição do produto em português'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='desc-en'>Descrição (English) *</Label>
          <textarea
            id='desc-en'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            value={formData.description.en}
            onChange={e =>
              updateNestedField('description', 'en', e.target.value)
            }
            placeholder='Product description in English'
            required
          />
        </div>
      </div>

      {/* Base Description */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='base-pt'>Base/Massa (Português)</Label>
          <Input
            id='base-pt'
            placeholder='Ex: Massa de batata-doce com farinhas de aveia e milho'
            value={formData.baseDescription.pt}
            onChange={e =>
              updateNestedField('baseDescription', 'pt', e.target.value)
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
              updateNestedField('baseDescription', 'en', e.target.value)
            }
          />
        </div>
      </div>

      {/* Categoria, Preço, Peso, Calorias */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='category'>Categoria *</Label>
          <select
            id='category'
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            value={formData.category}
            onChange={e => updateField('category', e.target.value)}
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
            type='text'
            inputMode='decimal'
            placeholder='0.00'
            value={formData.price}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || /^[\d]*[.,]?[\d]{0,2}$/.test(val)) {
                updateField('price', val.replace(',', '.'));
              }
            }}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='weight'>Peso</Label>
          <Input
            id='weight'
            type='text'
            placeholder='Ex: 180g'
            value={formData.weight}
            onChange={e => updateField('weight', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='calories'>Calorias</Label>
          <Input
            id='calories'
            type='text'
            inputMode='numeric'
            placeholder='kcal'
            value={formData.calories}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || /^\d*$/.test(val)) {
                updateField('calories', val);
              }
            }}
          />
        </div>
      </div>

      {/* Ordem de exibição */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='displayOrder'>Ordem de Exibição</Label>
          <Input
            id='displayOrder'
            type='text'
            inputMode='numeric'
            placeholder='0'
            value={formData.displayOrder || ''}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || /^\d*$/.test(val)) {
                updateField('displayOrder', val === '' ? 0 : parseInt(val));
              }
            }}
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
                className='rounded-lg object-cover w-24 h-24'
              />
              {img.isPrimary && (
                <span className='absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] text-center py-0.5 rounded-b-lg'>
                  Principal
                </span>
              )}
              <button
                type='button'
                onClick={() => removeImage(index)}
                className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='w-3 h-3' />
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
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3'>
          {(
            [
              { key: 'fitness', label: 'Fitness' },
              { key: 'vegetarian', label: 'Vegetariano' },
              { key: 'vegan', label: 'Vegano' },
              { key: 'glutenFree', label: 'Sem Glúten' },
              { key: 'dairyFree', label: 'Sem Lactose' },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                formData.dietaryInfo[key]
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              <input
                type='checkbox'
                checked={formData.dietaryInfo[key]}
                onChange={e =>
                  updateNestedField('dietaryInfo', key, e.target.checked)
                }
                className='rounded'
              />
              <span className='text-sm'>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Portion Sizes */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div>
            <Label className='text-base'>Tamanhos de Porção</Label>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Porções com preços diferentes (ex: Individual, Refeição, Família)
            </p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addPortionSize}
          >
            <Plus className='w-4 h-4 mr-1' /> Adicionar
          </Button>
        </div>
        {formData.portionSizes.length === 0 && (
          <p className='text-sm text-muted-foreground italic'>
            Nenhuma porção adicionada.
          </p>
        )}
        <div className='space-y-2'>
          {formData.portionSizes.map((portion, index) => (
            <div
              key={index}
              className='flex items-center gap-2 p-3 border rounded-lg bg-card flex-wrap sm:flex-nowrap'
            >
              <Input
                placeholder='Label PT (ex: Individual)'
                value={portion.label.pt}
                onChange={e =>
                  updatePortionSize(index, 'label.pt', e.target.value)
                }
                className='flex-1 min-w-[120px]'
              />
              <Input
                placeholder='Label EN (ex: Individual)'
                value={portion.label.en}
                onChange={e =>
                  updatePortionSize(index, 'label.en', e.target.value)
                }
                className='flex-1 min-w-[120px]'
              />
              <Input
                type='text'
                inputMode='decimal'
                placeholder='Preço €'
                className='w-24'
                value={portion.price != null ? String(portion.price) : ''}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^[\d]*[.,]?[\d]{0,2}$/.test(val)) {
                    updatePortionSize(index, 'price', val);
                  }
                }}
              />
              <Input
                type='text'
                placeholder='Peso'
                className='w-20'
                value={portion.weight}
                onChange={e =>
                  updatePortionSize(index, 'weight', e.target.value)
                }
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => removePortionSize(index)}
                className='text-destructive hover:text-destructive shrink-0'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Available */}
      <div className='space-y-2'>
        <label
          className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors w-fit ${
            formData.available
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-destructive bg-destructive/5'
          }`}
        >
          <input
            type='checkbox'
            checked={formData.available}
            onChange={e => updateField('available', e.target.checked)}
            className='rounded'
          />
          <span className='text-sm font-medium'>
            {formData.available
              ? '✅ Disponível no menu'
              : '❌ Indisponível no menu'}
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className='flex gap-4 pt-4 border-t'>
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
