/**
 * Gerar mensagem formatada para WhatsApp e URL wa.me
 */

interface OrderItem {
  name: string;
  flavor?: string;
  quantity: number;
  unitPrice: number;
  portionLabel?: string;
  subtotal: number;
}

interface WhatsAppOrderData {
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryTime?: string;
  notes?: string;
  orderNumber: string;
  paymentMethod: 'on_delivery' | 'mbway';
}

export function formatWhatsAppMessage(data: WhatsAppOrderData): string {
  const itemLines = data.items
    .map(item => {
      const name = item.flavor ? `${item.name} (${item.flavor})` : item.name;
      const portion = item.portionLabel ? ` — ${item.portionLabel}` : '';
      return `• ${item.quantity}x ${name}${portion} — €${item.subtotal.toFixed(2)}`;
    })
    .join('\n');

  const paymentLabel =
    data.paymentMethod === 'mbway'
      ? '💳 MBWay (a combinar)'
      : '💶 Pagamento na entrega';

  const message = `🛒 *Nova Encomenda — Caru Cozinha Artesanal*

📋 *Pedido:*
${itemLines}

💰 *Total: €${data.total.toFixed(2)}*

📅 *Data de entrega:* ${data.deliveryDate}${data.deliveryTime ? `\n⏰ *Horário:* ${data.deliveryTime}` : ''}

👤 *Cliente:* ${data.customerName}
📱 *Telefone:* ${data.customerPhone}

${paymentLabel}
${data.notes ? `\n📝 *Notas:* ${data.notes}` : ''}
---
Pedido ${data.orderNumber}`;

  return message;
}

export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string,
): string {
  // Remover espaços e caracteres especiais do telefone
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Formatar data para exibição na mensagem
 */
export function formatDeliveryDate(date: Date, locale: string = 'pt'): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB', options);
}
