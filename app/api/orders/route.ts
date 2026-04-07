import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Order from '@/models/Order';
import Dish from '@/models/Dish';
import { isAdmin } from '@/lib/utils/auth';
import { reserveStock } from '@/lib/utils/stock';

// GET — listar encomendas (admin only)
export async function GET(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.deliveryDate = { $gte: start, $lte: end };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.dish', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', success: false },
      { status: 500 },
    );
  }
}

// POST — criar nova encomenda (público)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      customer,
      items,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      source,
    } = body;

    // Validações básicas
    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios', success: false },
        { status: 400 },
      );
    }

    if (!items?.length) {
      return NextResponse.json(
        { error: 'O pedido deve conter pelo menos um item', success: false },
        { status: 400 },
      );
    }

    if (!deliveryDate) {
      return NextResponse.json(
        { error: 'Data de entrega é obrigatória', success: false },
        { status: 400 },
      );
    }

    // Validar e processar cada item
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish) {
        return NextResponse.json(
          { error: `Produto não encontrado: ${item.dishId}`, success: false },
          { status: 400 },
        );
      }

      if (!dish.available) {
        return NextResponse.json(
          {
            error: `Produto indisponível: ${dish.name.pt}`,
            success: false,
          },
          { status: 400 },
        );
      }

      // Verificar stock se enabled
      if (dish.stock?.enabled) {
        const available = dish.stock.quantity - dish.stock.reserved;
        if (available < item.quantity) {
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${dish.name.pt}. Disponível: ${available}`,
              success: false,
            },
            { status: 400 },
          );
        }
      }

      const unitPrice = item.portionSize?.price || dish.price;
      const itemSubtotal = unitPrice * item.quantity;

      processedItems.push({
        dish: dish._id,
        name: { pt: dish.name.pt, en: dish.name.en },
        flavor: dish.flavor || { pt: '', en: '' },
        quantity: item.quantity,
        unitPrice,
        portionSize: item.portionSize || undefined,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Criar encomenda
    const order = new Order({
      orderNumber: 'TEMP',
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        notes: customer.notes || '',
      },
      items: processedItems,
      totals: {
        subtotal,
        discount: 0,
        total: subtotal,
      },
      deliveryDate: new Date(deliveryDate),
      deliveryTime: deliveryTime || '',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Encomenda criada',
        },
      ],
      payment: {
        method: paymentMethod || 'on_delivery',
        status: 'pending',
        amount: subtotal,
      },
      source: source || 'website',
    });

    await order.save();

    // Reservar stock para cada item
    for (const item of processedItems) {
      const dish = await Dish.findById(item.dish);
      if (dish?.stock?.enabled) {
        await reserveStock(
          item.dish.toString(),
          item.quantity,
          order._id.toString(),
        );
      }
    }

    return NextResponse.json({ order, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create order',
        success: false,
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
