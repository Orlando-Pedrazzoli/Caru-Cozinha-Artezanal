import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  name: { pt: String, en: String },
  flavor: { pt: String, en: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  portionSize: {
    label: { pt: String, en: String },
    price: Number,
    weight: String,
  },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      notes: String,
    },
    items: [OrderItemSchema],
    totals: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    deliveryDate: { type: Date, required: true },
    deliveryTime: String,
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    payment: {
      method: {
        type: String,
        enum: ['on_delivery', 'mbway', 'transfer', 'cash'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
      amount: Number,
      note: String,
    },
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'admin'],
      default: 'website',
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate order number: CARU-20260407-001
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber || this.orderNumber === 'TEMP') {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    this.orderNumber = `CARU-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

OrderSchema.index({ status: 1, deliveryDate: 1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
