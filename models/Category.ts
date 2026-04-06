import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      pt: { type: String, required: true },
      en: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      default: '#6B3A7D',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    icon: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Category ||
  mongoose.model('Category', CategorySchema);
