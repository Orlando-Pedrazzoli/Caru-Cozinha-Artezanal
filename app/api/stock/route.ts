import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Dish from '@/models/Dish';
import StockLog from '@/models/StockLog';
import { isAdmin } from '@/lib/utils/auth';
import { restock } from '@/lib/utils/stock';

// GET — listar stock de todos os produtos (admin)
export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const dishes = await Dish.find({ available: true })
      .select('name flavor category stock images')
      .populate('category', 'name color')
      .sort({ 'stock.quantity': 1 });

    const stockData = dishes.map(dish => ({
      _id: dish._id,
      name: dish.name,
      flavor: dish.flavor,
      category: dish.category,
      image: dish.images?.[0]?.url || null,
      stock: {
        enabled: dish.stock?.enabled || false,
        quantity: dish.stock?.quantity || 0,
        reserved: dish.stock?.reserved || 0,
        available: Math.max(
          0,
          (dish.stock?.quantity || 0) - (dish.stock?.reserved || 0),
        ),
        lowStockThreshold: dish.stock?.lowStockThreshold || 3,
        isLow:
          dish.stock?.enabled &&
          (dish.stock?.quantity || 0) - (dish.stock?.reserved || 0) <=
            (dish.stock?.lowStockThreshold || 3),
      },
    }));

    return NextResponse.json({ stock: stockData, success: true });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock', success: false },
      { status: 500 },
    );
  }
}

// PATCH — restock ou ajuste manual
export async function PATCH(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { dishId, quantity, note } = body;

    if (!dishId || quantity === undefined) {
      return NextResponse.json(
        { error: 'dishId e quantity são obrigatórios', success: false },
        { status: 400 },
      );
    }

    const result = await restock(dishId, quantity, note);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 },
      );
    }

    return NextResponse.json({
      currentStock: result.currentStock,
      success: true,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock', success: false },
      { status: 500 },
    );
  }
}
