import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/utils/auth';
import { confirmStock, cancelReservation } from '@/lib/utils/stock';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — detalhes de uma encomenda
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id).populate(
      'items.dish',
      'name images weight',
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Encomenda não encontrada', success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', success: false },
      { status: 500 },
    );
  }
}

// PATCH — atualizar encomenda (status, pagamento, etc)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Encomenda não encontrada', success: false },
        { status: 404 },
      );
    }

    // Atualizar status com histórico
    if (body.status && body.status !== order.status) {
      const previousStatus = order.status;

      // Se confirmar encomenda, dar baixa definitiva no stock
      if (body.status === 'confirmed' && previousStatus === 'pending') {
        for (const item of order.items) {
          await confirmStock(
            item.dish.toString(),
            item.quantity,
            order._id.toString(),
          );
        }
      }

      // Se cancelar, devolver reserva de stock
      if (body.status === 'cancelled' && previousStatus !== 'cancelled') {
        for (const item of order.items) {
          if (previousStatus === 'pending') {
            await cancelReservation(
              item.dish.toString(),
              item.quantity,
              order._id.toString(),
            );
          }
        }
      }

      order.status = body.status;
      order.statusHistory.push({
        status: body.status,
        timestamp: new Date(),
        note: body.statusNote || '',
      });
    }

    // Atualizar pagamento
    if (body.paymentStatus) {
      order.payment.status = body.paymentStatus;
      if (body.paymentStatus === 'paid') {
        order.payment.paidAt = new Date();
      }
      if (body.paymentNote) {
        order.payment.note = body.paymentNote;
      }
    }

    // Atualizar notas do cliente
    if (body.customerNotes !== undefined) {
      order.customer.notes = body.customerNotes;
    }

    // Atualizar data de entrega
    if (body.deliveryDate) {
      order.deliveryDate = new Date(body.deliveryDate);
    }
    if (body.deliveryTime !== undefined) {
      order.deliveryTime = body.deliveryTime;
    }

    await order.save();

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', success: false },
      { status: 500 },
    );
  }
}

// DELETE — cancelar encomenda
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Encomenda não encontrada', success: false },
        { status: 404 },
      );
    }

    // Devolver stock reservado se estava pendente
    if (order.status === 'pending') {
      for (const item of order.items) {
        await cancelReservation(
          item.dish.toString(),
          item.quantity,
          order._id.toString(),
        );
      }
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Encomenda cancelada pelo admin',
    });
    await order.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order', success: false },
      { status: 500 },
    );
  }
}
