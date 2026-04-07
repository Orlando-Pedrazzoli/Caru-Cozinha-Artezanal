import mongoose from 'mongoose';

const StockLogSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'restock',
        'order_reserved',
        'order_confirmed',
        'order_cancelled',
        'manual_adjust',
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    note: String,
  },
  {
    timestamps: true,
  },
);

StockLogSchema.index({ dish: 1, createdAt: -1 });

export default mongoose.models.StockLog ||
  mongoose.model('StockLog', StockLogSchema);
