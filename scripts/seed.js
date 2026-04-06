const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const CategorySchema = new mongoose.Schema({
  name: { pt: String, en: String },
  slug: String,
  color: String,
  order: Number,
  active: Boolean,
});

const DishSchema = new mongoose.Schema({
  name: { pt: String, en: String },
  description: { pt: String, en: String },
  baseDescription: { pt: String, en: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: Number,
  compareAtPrice: Number,
  weight: String,
  calories: Number,
  images: [{ url: String, cloudinaryId: String, isPrimary: Boolean }],
  dietaryInfo: {
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean,
    dairyFree: Boolean,
    fitness: Boolean,
  },
  allergens: [String],
  variants: [
    {
      name: { pt: String, en: String },
      price: Number,
      available: Boolean,
    },
  ],
  portionSizes: [
    {
      label: { pt: String, en: String },
      price: Number,
      weight: String,
    },
  ],
  badges: [
    {
      type: { type: String, enum: ['popular', 'novo', 'artesanal', 'sazonal'] },
      priority: Number,
      validUntil: Date,
    },
  ],
  available: Boolean,
  displayOrder: Number,
});

const Category = mongoose.model('Category', CategorySchema);
const Dish = mongoose.model('Dish', DishSchema);

const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Dish.deleteMany({});

    console.log('📂 Creating categories...');
    const categories = await Category.create([
      {
        name: { pt: 'Salgados', en: 'Savoury' },
        slug: 'salgados',
        color: '#8B3A3A',
        order: 1,
        active: true,
      },
      {
        name: { pt: 'Doces', en: 'Sweets' },
        slug: 'doces',
        color: '#6B4226',
        order: 2,
        active: true,
      },
      {
        name: { pt: 'Fitness', en: 'Fitness' },
        slug: 'fitness',
        color: '#4A7C59',
        order: 3,
        active: true,
      },
      {
        name: {
          pt: 'Pastas, Acompanhamentos & Partilháveis',
          en: 'Spreads, Sides & Shareable',
        },
        slug: 'acompanhamentos',
        color: '#4A6FA5',
        order: 4,
        active: true,
      },
    ]);

    console.log('✅ Categories created:', categories.length);

    const [salgados, doces, fitness, acompanhamentos] = categories;

    console.log('🍽️  Creating products...');
    const dishes = [
      // === SALGADOS ===
      {
        name: { pt: 'Torta Salgada', en: 'Savoury Pie' },
        description: {
          pt: 'Torta artesanal com massa amanteigada e recheio caseiro',
          en: 'Artisan pie with buttery pastry and homemade filling',
        },
        baseDescription: { pt: 'Massa amanteigada', en: 'Buttery pastry' },
        category: salgados._id,
        price: 2.5,
        variants: [
          {
            name: { pt: 'Frango', en: 'Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Cogumelos', en: 'Mushrooms' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Verduras', en: 'Vegetables' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
          fitness: false,
        },
        allergens: ['gluten', 'dairy', 'eggs'],
        badges: [{ type: 'popular', priority: 1 }],
        available: true,
        displayOrder: 1,
      },
      {
        name: { pt: 'Pastelão de Forno', en: 'Baked Pastelão' },
        description: {
          pt: 'Pastelão assado com massa crocante e recheio generoso',
          en: 'Oven-baked pastry with crispy dough and generous filling',
        },
        category: salgados._id,
        price: 2.5,
        variants: [
          {
            name: { pt: 'Frango', en: 'Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Cogumelos', en: 'Mushrooms' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Verduras', en: 'Vegetables' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: false, glutenFree: false },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 2,
      },
      {
        name: { pt: 'Quiche Tradicional', en: 'Traditional Quiche' },
        description: {
          pt: 'Quiche artesanal com massa amanteigada e recheio cremoso',
          en: 'Artisan quiche with buttery pastry and creamy filling',
        },
        baseDescription: { pt: 'Massa amanteigada', en: 'Buttery pastry' },
        category: salgados._id,
        price: 2.5,
        variants: [
          {
            name: { pt: 'Queijo e Tomate', en: 'Cheese & Tomato' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Verduras', en: 'Vegetables' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Lorraine', en: 'Lorraine' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Alho Francês c/ Frango', en: 'Leek w/ Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Alho Francês s/ Frango', en: 'Leek w/o Chicken' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: false, glutenFree: false },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 3,
      },
      {
        name: { pt: 'Folhado', en: 'Puff Pastry' },
        description: {
          pt: 'Folhado crocante com recheio caseiro',
          en: 'Crispy puff pastry with homemade filling',
        },
        category: salgados._id,
        price: 2.5,
        variants: [
          {
            name: { pt: 'Frango', en: 'Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Cogumelos', en: 'Mushrooms' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: false, glutenFree: false },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 4,
      },

      // === DOCES ===
      {
        name: { pt: 'Brigadeiro Gourmet', en: 'Gourmet Brigadeiro' },
        description: {
          pt: 'Brigadeiro artesanal em versão gourmet com sabores exclusivos',
          en: 'Artisan brigadeiro in gourmet version with exclusive flavours',
        },
        category: doces._id,
        price: 1.7,
        variants: [
          {
            name: { pt: 'Romeu e Julieta', en: 'Romeo & Juliet' },
            price: null,
            available: true,
          },
          { name: { pt: 'Ninho', en: 'Ninho' }, price: null, available: true },
          {
            name: { pt: 'Churros', en: 'Churros' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy'],
        available: true,
        displayOrder: 1,
      },
      {
        name: { pt: 'Brigadeiro Tradicional', en: 'Traditional Brigadeiro' },
        description: {
          pt: 'O clássico brigadeiro brasileiro feito com ingredientes de qualidade',
          en: 'The classic Brazilian brigadeiro made with quality ingredients',
        },
        category: doces._id,
        price: 1.5,
        variants: [
          {
            name: { pt: 'Chocolate', en: 'Chocolate' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Casadinho', en: 'Casadinho' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Beijinho de Coco', en: 'Coconut Kiss' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy'],
        available: true,
        displayOrder: 2,
      },
      {
        name: { pt: 'Bala Baiana', en: 'Bala Baiana' },
        description: {
          pt: 'Doce tradicional baiano de coco',
          en: 'Traditional Bahian coconut sweet',
        },
        category: doces._id,
        price: 1.5,
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy'],
        available: true,
        displayOrder: 3,
      },
      {
        name: { pt: 'Bolo de Aipim/Mandioca', en: 'Cassava Cake' },
        description: {
          pt: 'Bolo húmido de mandioca com sabor caseiro',
          en: 'Moist cassava cake with homemade flavour',
        },
        category: doces._id,
        price: 3.5,
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy', 'eggs'],
        available: true,
        displayOrder: 4,
      },
      {
        name: { pt: 'Bolo de Cenoura', en: 'Carrot Cake' },
        description: {
          pt: 'Bolo de cenoura fofinho com cobertura de chocolate',
          en: 'Fluffy carrot cake with chocolate topping',
        },
        category: doces._id,
        price: 3.5,
        dietaryInfo: { vegetarian: true },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 5,
      },
      {
        name: { pt: 'Brownie', en: 'Brownie' },
        description: {
          pt: 'Brownie artesanal de chocolate intenso',
          en: 'Artisan dark chocolate brownie',
        },
        category: doces._id,
        price: 3.7,
        weight: '180g',
        dietaryInfo: { vegetarian: true },
        allergens: ['gluten', 'dairy', 'eggs'],
        badges: [{ type: 'popular', priority: 1 }],
        available: true,
        displayOrder: 6,
      },
      {
        name: { pt: 'Mini Brownie', en: 'Mini Brownie' },
        description: {
          pt: 'Versão mini do nosso brownie artesanal',
          en: 'Mini version of our artisan brownie',
        },
        category: doces._id,
        price: 1.7,
        dietaryInfo: { vegetarian: true },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 7,
      },
      {
        name: { pt: 'Trufa', en: 'Truffle' },
        description: {
          pt: 'Trufa artesanal de chocolate',
          en: 'Artisan chocolate truffle',
        },
        category: doces._id,
        price: 1.7,
        variants: [
          {
            name: { pt: 'Chocolate', en: 'Chocolate' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Maracujá', en: 'Passion Fruit' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Morango', en: 'Strawberry' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy'],
        available: true,
        displayOrder: 8,
      },

      // === FITNESS ===
      {
        name: { pt: 'Torta Fitness', en: 'Fitness Pie' },
        description: {
          pt: 'Torta com massa saudável de batata-doce',
          en: 'Pie with healthy sweet potato dough',
        },
        baseDescription: {
          pt: 'Massa de batata-doce com farinhas de aveia e milho',
          en: 'Sweet potato dough with oat and corn flour',
        },
        category: fitness._id,
        price: 2.7,
        variants: [
          {
            name: { pt: 'Frango', en: 'Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Cogumelos', en: 'Mushrooms' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Verduras', en: 'Vegetables' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: {
          vegetarian: false,
          glutenFree: true,
          dairyFree: true,
          fitness: true,
        },
        allergens: ['eggs'],
        badges: [{ type: 'popular', priority: 1 }],
        available: true,
        displayOrder: 1,
      },
      {
        name: { pt: 'Quiche Fitness', en: 'Fitness Quiche' },
        description: {
          pt: 'Quiche com massa fitness saudável e leve',
          en: 'Quiche with healthy and light fitness dough',
        },
        baseDescription: {
          pt: 'Massa de batata-doce com farinhas de aveia e milho',
          en: 'Sweet potato dough with oat and corn flour',
        },
        category: fitness._id,
        price: 2.7,
        variants: [
          {
            name: { pt: 'Queijo e Tomate', en: 'Cheese & Tomato' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Verduras', en: 'Vegetables' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Lorraine', en: 'Lorraine' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Alho Francês c/ Frango', en: 'Leek w/ Chicken' },
            price: null,
            available: true,
          },
          {
            name: { pt: 'Alho Francês s/ Frango', en: 'Leek w/o Chicken' },
            price: null,
            available: true,
          },
        ],
        dietaryInfo: {
          vegetarian: false,
          glutenFree: true,
          dairyFree: true,
          fitness: true,
        },
        allergens: ['eggs'],
        available: true,
        displayOrder: 2,
      },

      // === ACOMPANHAMENTOS ===
      {
        name: { pt: 'Pesto', en: 'Pesto' },
        description: {
          pt: 'Pesto artesanal de manjericão fresco',
          en: 'Fresh basil artisan pesto',
        },
        category: acompanhamentos._id,
        price: 4.5,
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['nuts'],
        available: true,
        displayOrder: 1,
      },
      {
        name: { pt: 'Hommus', en: 'Hummus' },
        description: {
          pt: 'Hommus cremoso de grão-de-bico',
          en: 'Creamy chickpea hummus',
        },
        category: acompanhamentos._id,
        price: 4.5,
        dietaryInfo: {
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true,
        },
        available: true,
        displayOrder: 2,
      },
      {
        name: { pt: 'Coalhada Fresca', en: 'Fresh Curd' },
        description: {
          pt: 'Coalhada artesanal fresca',
          en: 'Fresh artisan curd',
        },
        category: acompanhamentos._id,
        price: 4.0,
        dietaryInfo: { vegetarian: true, glutenFree: true },
        allergens: ['dairy'],
        available: true,
        displayOrder: 3,
      },
      {
        name: { pt: 'Caponata', en: 'Caponata' },
        description: {
          pt: 'Caponata siciliana de berinjela',
          en: 'Sicilian eggplant caponata',
        },
        category: acompanhamentos._id,
        price: 4.5,
        dietaryInfo: {
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true,
        },
        available: true,
        displayOrder: 4,
      },
      {
        name: { pt: 'Granola', en: 'Granola' },
        description: {
          pt: 'Granola artesanal crocante',
          en: 'Crunchy artisan granola',
        },
        category: acompanhamentos._id,
        price: 5.0,
        dietaryInfo: { vegetarian: true, vegan: true, dairyFree: true },
        allergens: ['nuts', 'gluten'],
        available: true,
        displayOrder: 5,
      },
      {
        name: { pt: 'Biscoitos', en: 'Biscuits' },
        description: {
          pt: 'Biscoitos artesanais variados',
          en: 'Assorted artisan biscuits',
        },
        category: acompanhamentos._id,
        price: 4.0,
        dietaryInfo: { vegetarian: true },
        allergens: ['gluten', 'dairy', 'eggs'],
        available: true,
        displayOrder: 6,
      },
    ];

    await Dish.create(dishes);
    console.log('✅ Products created:', dishes.length);

    console.log('\n🎉 Seed completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Categories:', categories.length);
    console.log('   - Products:', dishes.length);
    console.log('\n🚀 You can now start the server with: npm run dev');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  }
};

connectDB().then(seedData);
