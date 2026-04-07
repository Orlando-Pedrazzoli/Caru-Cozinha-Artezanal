import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Dish from '@/models/Dish';
import { isAdmin } from '@/lib/utils/auth';

// GET — agenda semanal de todos os produtos
export async function GET() {
  try {
    await dbConnect();

    const dishes = await Dish.find({ available: true })
      .select(
        'name flavor category schedule stock.enabled stock.quantity stock.reserved price',
      )
      .populate('category', 'name color slug')
      .sort({ displayOrder: 1 });

    return NextResponse.json({ dishes, success: true });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule', success: false },
      { status: 500 },
    );
  }
}

// PATCH — atualizar agenda de um produto (admin)
export async function PATCH(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { dishId, schedule } = body;

    if (!dishId) {
      return NextResponse.json(
        { error: 'dishId é obrigatório', success: false },
        { status: 400 },
      );
    }

    const updateData: any = {};

    // Atualizar dias da semana
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (const day of days) {
      if (schedule[day] !== undefined) {
        updateData[`schedule.${day}`] = schedule[day];
      }
    }

    // Atualizar datas customizadas se fornecidas
    if (schedule.customDates !== undefined) {
      updateData['schedule.customDates'] = schedule.customDates;
    }

    const dish = await Dish.findByIdAndUpdate(
      dishId,
      { $set: updateData },
      { new: true },
    ).select('name schedule');

    if (!dish) {
      return NextResponse.json(
        { error: 'Produto não encontrado', success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({ dish, success: true });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule', success: false },
      { status: 500 },
    );
  }
}

// PUT — atualizar agenda em batch (múltiplos produtos)
export async function PUT(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { updates } = body;

    if (!updates?.length) {
      return NextResponse.json(
        { error: 'Nenhuma atualização fornecida', success: false },
        { status: 400 },
      );
    }

    const results = [];

    for (const update of updates) {
      const { dishId, schedule } = update;

      const updateData: any = {};
      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      for (const day of days) {
        if (schedule[day] !== undefined) {
          updateData[`schedule.${day}`] = schedule[day];
        }
      }

      const dish = await Dish.findByIdAndUpdate(
        dishId,
        { $set: updateData },
        { new: true },
      ).select('name schedule');

      results.push({ dishId, success: !!dish });
    }

    return NextResponse.json({ results, success: true });
  } catch (error) {
    console.error('Error batch updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to batch update schedule', success: false },
      { status: 500 },
    );
  }
}
