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
    // Agenda semanal — dias em que o produto está disponível
    schedule: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
      customDates: [
        {
          date: Date,
          available: Boolean,
          note: { pt: String, en: String },
        },
      ],
    },
    // Controlo de stock
    stock: {
      enabled: { type: Boolean, default: false },
      quantity: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 3 },
    },
    // Configurações de encomenda
    orderSettings: {
      minQuantity: { type: Number, default: 1 },
      maxQuantity: { type: Number, default: 10 },
      leadTimeHours: { type: Number, default: 0 },
      acceptSameDay: { type: Boolean, default: true },
    },
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
