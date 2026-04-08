'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  Calendar,
  Package,
} from 'lucide-react';
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

interface ScheduleData {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface StockData {
  enabled: boolean;
  quantity: number;
  lowStockThreshold: number;
}

interface OrderSettingsData {
  minQuantity: number;
  maxQuantity: number;
  leadTimeHours: number;
  acceptSameDay: boolean;
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
  schedule: ScheduleData;
  stock: StockData;
  orderSettings: OrderSettingsData;
  available: boolean;
  displayOrder: number;
}

interface DishFormProps {
  dish?: any;
  onSubmit: (data: any) => void;
}

const DAYS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

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
    schedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    stock: {
      enabled: false,
      quantity: 0,
      lowStockThreshold: 3,
    },
    orderSettings: {
      minQuantity: 1,
      maxQuantity: 10,
      leadTimeHours: 0,
      acceptSameDay: true,
    },
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
        schedule: {
          monday: dish.schedule?.monday || false,
          tuesday: dish.schedule?.tuesday || false,
          wednesday: dish.schedule?.wednesday || false,
          thursday: dish.schedule?.thursday || false,
          friday: dish.schedule?.friday || false,
          saturday: dish.schedule?.saturday || false,
          sunday: dish.schedule?.sunday || false,
        },
        stock: {
          enabled: dish.stock?.enabled || false,
          quantity: dish.stock?.quantity || 0,
          lowStockThreshold: dish.stock?.lowStockThreshold || 3,
        },
        orderSettings: {
          minQuantity: dish.orderSettings?.minQuantity || 1,
          maxQuantity: dish.orderSettings?.maxQuantity || 10,
          leadTimeHours: dish.orderSettings?.leadTimeHours || 0,
          acceptSameDay: dish.orderSettings?.acceptSameDay !== false,
        },
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

  const toggleScheduleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: !prev.schedule[day as keyof ScheduleData],
      },
    }));
  };

  const toggleAllDays = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        monday: value,
        tuesday: value,
        wednesday: value,
        thursday: value,
        friday: value,
        saturday: value,
        sunday: value,
      },
    }));
  };

  const toggleWeekdays = () => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
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
        schedule: formData.schedule,
        stock: formData.stock,
        orderSettings: formData.orderSettings,
        available: formData.available,
        displayOrder: formData.displayOrder,
      };

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const activeDaysCount = Object.values(formData.schedule).filter(
    Boolean,
  ).length;

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Nome PT/EN */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='namePt'>Nome (PT) *</Label>
          <Input
            id='namePt'
            value={formData.name.pt}
            onChange={e => updateNestedField('name', 'pt', e.target.value)}
            placeholder='Nome em português'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='nameEn'>Nome (EN) *</Label>
          <Input
            id='nameEn'
            value={formData.name.en}
            onChange={e => updateNestedField('name', 'en', e.target.value)}
            placeholder='Name in English'
            required
          />
        </div>
      </div>

      {/* Sabor PT/EN */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='flavorPt'>Sabor (PT)</Label>
          <Input
            id='flavorPt'
            value={formData.flavor.pt}
            onChange={e => updateNestedField('flavor', 'pt', e.target.value)}
            placeholder='Ex: Frango, Cogumelos'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='flavorEn'>Sabor (EN)</Label>
          <Input
            id='flavorEn'
            value={formData.flavor.en}
            onChange={e => updateNestedField('flavor', 'en', e.target.value)}
            placeholder='Ex: Chicken, Mushrooms'
          />
        </div>
      </div>

      {/* Descrição PT/EN */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='descPt'>Descrição (PT) *</Label>
          <textarea
            id='descPt'
            value={formData.description.pt}
            onChange={e =>
              updateNestedField('description', 'pt', e.target.value)
            }
            placeholder='Descrição em português'
            rows={3}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='descEn'>Descrição (EN) *</Label>
          <textarea
            id='descEn'
            value={formData.description.en}
            onChange={e =>
              updateNestedField('description', 'en', e.target.value)
            }
            placeholder='Description in English'
            rows={3}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none'
            required
          />
        </div>
      </div>

      {/* Base Description PT/EN */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='baseDescPt'>Desc. Base (PT)</Label>
          <Input
            id='baseDescPt'
            value={formData.baseDescription.pt}
            onChange={e =>
              updateNestedField('baseDescription', 'pt', e.target.value)
            }
            placeholder='Ex: Massa amanteigada'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='baseDescEn'>Desc. Base (EN)</Label>
          <Input
            id='baseDescEn'
            value={formData.baseDescription.en}
            onChange={e =>
              updateNestedField('baseDescription', 'en', e.target.value)
            }
            placeholder='Ex: Buttery pastry'
          />
        </div>
      </div>

      {/* Categoria */}
      <div className='space-y-2'>
        <Label htmlFor='category'>Categoria *</Label>
        <select
          id='category'
          value={formData.category}
          onChange={e => updateField('category', e.target.value)}
          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          required
        >
          <option value=''>Selecionar categoria</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name.pt}
            </option>
          ))}
        </select>
      </div>

      {/* Preço / Peso / Calorias */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
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

      {/* ============================================= */}
      {/* AGENDA SEMANAL */}
      {/* ============================================= */}
      <div className='space-y-3 p-4 border rounded-lg bg-blue-50/50 border-blue-200'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-blue-600' />
            <Label className='text-base font-semibold'>Agenda Semanal</Label>
            {activeDaysCount > 0 && (
              <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                {activeDaysCount} dia{activeDaysCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className='flex gap-1'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='text-xs h-7 flex-1'
              onClick={toggleWeekdays}
            >
              Seg-Sex
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='text-xs h-7 flex-1'
              onClick={() => toggleAllDays(true)}
            >
              Todos
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='text-xs h-7 flex-1'
              onClick={() => toggleAllDays(false)}
            >
              Limpar
            </Button>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>
          Selecione os dias em que este produto está disponível para encomenda.
          O cliente verá &quot;Disponível hoje&quot; ou os próximos dias
          disponíveis.
        </p>
        <div className='grid grid-cols-7 gap-2'>
          {DAYS.map(({ key, label }) => {
            const active = formData.schedule[key as keyof ScheduleData];
            return (
              <button
                key={key}
                type='button'
                onClick={() => toggleScheduleDay(key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center ${
                  active
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
              >
                <span className='text-xs font-medium'>{label.slice(0, 3)}</span>
                <span className='text-lg'>{active ? '✓' : '—'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================= */}
      {/* STOCK */}
      {/* ============================================= */}
      <div
        className={`space-y-3 p-4 border rounded-lg ${
          formData.stock.enabled
            ? 'bg-green-50/50 border-green-200'
            : 'bg-gray-50/50 border-gray-200'
        }`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Package
              className={`w-5 h-5 ${formData.stock.enabled ? 'text-green-600' : 'text-gray-400'}`}
            />
            <Label className='text-base font-semibold'>Controlo de Stock</Label>
          </div>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={formData.stock.enabled}
              onChange={e =>
                updateNestedField('stock', 'enabled', e.target.checked)
              }
              className='rounded'
            />
            <span className='text-sm'>
              {formData.stock.enabled ? 'Ativo' : 'Desativado'}
            </span>
          </label>
        </div>

        {formData.stock.enabled && (
          <>
            <p className='text-xs text-muted-foreground'>
              Quando o stock chegar a zero, o produto aparece como
              &quot;Esgotado&quot; no menu.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='stockQty' className='text-sm'>
                  Quantidade disponível
                </Label>
                <Input
                  id='stockQty'
                  type='text'
                  inputMode='numeric'
                  value={formData.stock.quantity}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d*$/.test(val)) {
                      updateNestedField(
                        'stock',
                        'quantity',
                        val === '' ? 0 : parseInt(val),
                      );
                    }
                  }}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='stockThreshold' className='text-sm'>
                  Alerta de stock baixo
                </Label>
                <Input
                  id='stockThreshold'
                  type='text'
                  inputMode='numeric'
                  value={formData.stock.lowStockThreshold}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d*$/.test(val)) {
                      updateNestedField(
                        'stock',
                        'lowStockThreshold',
                        val === '' ? 0 : parseInt(val),
                      );
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================= */}
      {/* CONFIGURAÇÕES DE ENCOMENDA */}
      {/* ============================================= */}
      <div className='space-y-3 p-4 border rounded-lg bg-amber-50/50 border-amber-200'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>🛒</span>
          <Label className='text-base font-semibold'>
            Configurações de Encomenda
          </Label>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1'>
            <Label htmlFor='minQty' className='text-sm'>
              Quantidade mínima
            </Label>
            <Input
              id='minQty'
              type='text'
              inputMode='numeric'
              value={formData.orderSettings.minQuantity}
              onChange={e => {
                const val = e.target.value;
                if (val === '' || /^\d*$/.test(val)) {
                  updateNestedField(
                    'orderSettings',
                    'minQuantity',
                    val === '' ? 1 : parseInt(val),
                  );
                }
              }}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='maxQty' className='text-sm'>
              Quantidade máxima
            </Label>
            <Input
              id='maxQty'
              type='text'
              inputMode='numeric'
              value={formData.orderSettings.maxQuantity}
              onChange={e => {
                const val = e.target.value;
                if (val === '' || /^\d*$/.test(val)) {
                  updateNestedField(
                    'orderSettings',
                    'maxQuantity',
                    val === '' ? 10 : parseInt(val),
                  );
                }
              }}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='leadTime' className='text-sm'>
              Antecedência mínima (horas)
            </Label>
            <Input
              id='leadTime'
              type='text'
              inputMode='numeric'
              value={formData.orderSettings.leadTimeHours}
              onChange={e => {
                const val = e.target.value;
                if (val === '' || /^\d*$/.test(val)) {
                  updateNestedField(
                    'orderSettings',
                    'leadTimeHours',
                    val === '' ? 0 : parseInt(val),
                  );
                }
              }}
            />
            <p className='text-xs text-muted-foreground'>
              0 = aceita encomendas para o próprio dia
            </p>
          </div>
          <div className='space-y-1 flex items-end'>
            <label className='flex items-center gap-2 cursor-pointer p-2 border rounded-md w-full'>
              <input
                type='checkbox'
                checked={formData.orderSettings.acceptSameDay}
                onChange={e =>
                  updateNestedField(
                    'orderSettings',
                    'acceptSameDay',
                    e.target.checked,
                  )
                }
                className='rounded'
              />
              <span className='text-sm'>Aceita encomendas no próprio dia</span>
            </label>
          </div>
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
              ? 'border-green-500 bg-green-50'
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
