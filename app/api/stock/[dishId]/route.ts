import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Dish from '@/models/Dish';
import StockLog from '@/models/StockLog';
import { isAdmin } from '@/lib/utils/auth';

interface RouteParams {
  params: Promise<{ dishId: string }>;
}

// GET — stock + histórico de um produto
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { dishId } = await params;

    const dish = await Dish.findById(dishId).select(
      'name flavor stock category',
    );
    if (!dish) {
      return NextResponse.json(
        { error: 'Produto não encontrado', success: false },
        { status: 404 },
      );
    }

    const logs = await StockLog.find({ dish: dishId })
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      dish: {
        _id: dish._id,
        name: dish.name,
        flavor: dish.flavor,
        stock: dish.stock,
      },
      logs,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching dish stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock', success: false },
      { status: 500 },
    );
  }
}
