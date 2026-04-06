import mongoose from 'mongoose';

const DishSchema = new mongoose.Schema(
  {
    name: {
      pt: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      pt: { type: String, required: true },
      en: { type: String, required: true },
    },
    baseDescription: {
      pt: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    compareAtPrice: Number,
    weight: {
      type: String,
      default: '',
    },
    calories: {
      type: Number,
      default: null,
    },
    images: [
      {
        url: String,
        cloudinaryId: String,
        thumbnailUrl: String,
        isPrimary: Boolean,
      },
    ],
    dietaryInfo: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      dairyFree: { type: Boolean, default: false },
      fitness: { type: Boolean, default: false },
    },
    allergens: [String],
    flavor: {
      pt: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    portionSizes: [
      {
        label: {
          pt: String,
          en: String,
        },
        price: Number,
        weight: String,
      },
    ],
    badges: [
      {
        type: {
          type: String,
          enum: ['popular', 'novo', 'artesanal', 'sazonal'],
        },
        priority: Number,
        validUntil: Date,
      },
    ],
    searchTags: [String],
    displayOrder: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

DishSchema.index({ category: 1, displayOrder: 1 });
DishSchema.index({
  'name.pt': 'text',
  'name.en': 'text',
  'description.pt': 'text',
  'description.en': 'text',
  'flavor.pt': 'text',
  'flavor.en': 'text',
  searchTags: 'text',
});
DishSchema.index({
  'dietaryInfo.vegetarian': 1,
  'dietaryInfo.vegan': 1,
  'dietaryInfo.glutenFree': 1,
  'dietaryInfo.fitness': 1,
});

export default mongoose.models.Dish || mongoose.model('Dish', DishSchema);
