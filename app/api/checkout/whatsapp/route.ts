import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Order from '@/models/Order';
import Dish from '@/models/Dish';
import {
  formatWhatsAppMessage,
  generateWhatsAppUrl,
  formatDeliveryDate,
} from '@/lib/utils/whatsapp';
import { reserveStock } from '@/lib/utils/stock';

// POST — criar encomenda + gerar link WhatsApp
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
      locale,
    } = body;

    // Validações
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

    // Processar items e calcular total
    const processedItems = [];
    const whatsappItems = [];
    let subtotal = 0;

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish || !dish.available) {
        return NextResponse.json(
          {
            error: `Produto indisponível: ${item.dishId}`,
            success: false,
          },
          { status: 400 },
        );
      }

      // Verificar stock
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
      const lang = locale || 'pt';

      processedItems.push({
        dish: dish._id,
        name: { pt: dish.name.pt, en: dish.name.en },
        flavor: dish.flavor || { pt: '', en: '' },
        quantity: item.quantity,
        unitPrice,
        portionSize: item.portionSize || undefined,
        subtotal: itemSubtotal,
      });

      whatsappItems.push({
        name: dish.name[lang] || dish.name.pt,
        flavor: dish.flavor?.[lang] || dish.flavor?.pt || undefined,
        quantity: item.quantity,
        unitPrice,
        portionLabel: item.portionSize?.label?.[lang] || undefined,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Criar encomenda no BD
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
          note: 'Encomenda via WhatsApp',
        },
      ],
      payment: {
        method: paymentMethod || 'on_delivery',
        status: 'pending',
        amount: subtotal,
      },
      source: 'whatsapp',
    });

    await order.save();

    // Reservar stock
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

    // Gerar mensagem e URL WhatsApp
    const formattedDate = formatDeliveryDate(
      new Date(deliveryDate),
      locale || 'pt',
    );

    const message = formatWhatsAppMessage({
      items: whatsappItems,
      total: subtotal,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryDate: formattedDate,
      deliveryTime: deliveryTime || undefined,
      notes: customer.notes || undefined,
      orderNumber: order.orderNumber,
      paymentMethod: paymentMethod || 'on_delivery',
    });

    // Número da Carol (configurável via env)
    const carolPhone =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '351912345678';
    const whatsappUrl = generateWhatsAppUrl(carolPhone, message);

    return NextResponse.json(
      {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: subtotal,
        },
        whatsappUrl,
        message,
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating WhatsApp order:', error);
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
