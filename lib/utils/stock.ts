import Dish from '@/models/Dish';
import StockLog from '@/models/StockLog';
import mongoose from 'mongoose';

/**
 * Reservar stock para uma encomenda (quando o cliente faz pedido)
 * Usa operação atómica para evitar overselling
 */
export async function reserveStock(
  dishId: string,
  quantity: number,
  orderId?: string,
) {
  const dish = await Dish.findOneAndUpdate(
    {
      _id: dishId,
      'stock.enabled': true,
      $expr: {
        $gte: [{ $subtract: ['$stock.quantity', '$stock.reserved'] }, quantity],
      },
    },
    {
      $inc: { 'stock.reserved': quantity },
    },
    { new: true },
  );

  if (!dish) {
    return { success: false, error: 'Stock insuficiente' };
  }

  await StockLog.create({
    dish: dishId,
    action: 'order_reserved',
    quantity: -quantity,
    previousStock: dish.stock.quantity - dish.stock.reserved + quantity,
    newStock: dish.stock.quantity - dish.stock.reserved,
    order: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
  });

  return {
    success: true,
    availableStock: dish.stock.quantity - dish.stock.reserved,
  };
}

/**
 * Confirmar baixa de stock (quando Carol confirma a encomenda)
 * Move de reservado para baixa definitiva
 */
export async function confirmStock(
  dishId: string,
  quantity: number,
  orderId?: string,
) {
  const dish = await Dish.findOneAndUpdate(
    {
      _id: dishId,
      'stock.enabled': true,
      'stock.reserved': { $gte: quantity },
    },
    {
      $inc: {
        'stock.quantity': -quantity,
        'stock.reserved': -quantity,
        orderCount: quantity,
      },
    },
    { new: true },
  );

  if (!dish) {
    return { success: false, error: 'Erro ao confirmar stock' };
  }

  await StockLog.create({
    dish: dishId,
    action: 'order_confirmed',
    quantity: -quantity,
    previousStock: dish.stock.quantity + quantity,
    newStock: dish.stock.quantity,
    order: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
  });

  return { success: true, currentStock: dish.stock.quantity };
}

/**
 * Cancelar reserva de stock (quando encomenda é cancelada)
 */
export async function cancelReservation(
  dishId: string,
  quantity: number,
  orderId?: string,
) {
  const dish = await Dish.findOneAndUpdate(
    {
      _id: dishId,
      'stock.enabled': true,
    },
    {
      $inc: { 'stock.reserved': -quantity },
    },
    { new: true },
  );

  if (!dish) {
    return { success: false, error: 'Erro ao cancelar reserva' };
  }

  await StockLog.create({
    dish: dishId,
    action: 'order_cancelled',
    quantity: quantity,
    previousStock: dish.stock.quantity - dish.stock.reserved - quantity,
    newStock: dish.stock.quantity - dish.stock.reserved,
    order: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
  });

  return { success: true };
}

/**
 * Restock manual (Carol adiciona stock)
 */
export async function restock(dishId: string, quantity: number, note?: string) {
  const dish = await Dish.findOneAndUpdate(
    { _id: dishId },
    {
      $inc: { 'stock.quantity': quantity },
      $set: { 'stock.enabled': true },
    },
    { new: true },
  );

  if (!dish) {
    return { success: false, error: 'Produto não encontrado' };
  }

  await StockLog.create({
    dish: dishId,
    action: quantity > 0 ? 'restock' : 'manual_adjust',
    quantity,
    previousStock: dish.stock.quantity - quantity,
    newStock: dish.stock.quantity,
    note,
  });

  return { success: true, currentStock: dish.stock.quantity };
}

/**
 * Verificar disponibilidade de um produto para um dia específico
 */
export function isDishAvailableOnDay(
  dish: any,
  date: Date = new Date(),
): boolean {
  if (!dish.available) return false;

  const dayMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const dayOfWeek = date.getDay();
  const dayName = dayMap[dayOfWeek];

  // Verificar datas customizadas primeiro
  if (dish.schedule?.customDates?.length) {
    const dateStr = date.toISOString().slice(0, 10);
    const customDate = dish.schedule.customDates.find(
      (cd: any) => cd.date?.toISOString().slice(0, 10) === dateStr,
    );
    if (customDate) return customDate.available;
  }

  // Verificar agenda semanal
  if (dish.schedule && dish.schedule[dayName] !== undefined) {
    return dish.schedule[dayName];
  }

  // Se não tem agenda definida, está sempre disponível
  return true;
}

/**
 * Obter os próximos dias disponíveis para um produto
 */
export function getNextAvailableDays(dish: any, count: number = 5): Date[] {
  const availableDays: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 14 && availableDays.length < count; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);

    if (isDishAvailableOnDay(dish, checkDate)) {
      // Verificar stock se enabled
      if (dish.stock?.enabled) {
        const availableQty = dish.stock.quantity - dish.stock.reserved;
        if (availableQty <= 0) continue;
      }
      availableDays.push(new Date(checkDate));
    }
  }

  return availableDays;
}

/**
 * Obter stock disponível (total - reservado)
 */
export function getAvailableStock(dish: any): number | null {
  if (!dish.stock?.enabled) return null;
  return Math.max(0, dish.stock.quantity - dish.stock.reserved);
}
