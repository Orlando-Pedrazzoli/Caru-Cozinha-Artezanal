const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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

const fixOrphanedDishes = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado!\n');

    const categories = await Category.find({}).sort({ order: 1 });
    console.log('📂 Categorias disponíveis:');
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name.pt} (${cat._id})`);
    });

    const dishes = await Dish.find({}).populate('category');
    console.log(`\n📊 Total de produtos encontrados: ${dishes.length}`);

    const defaultCategory =
      categories.find(c => c.slug === 'salgados') || categories[0];
    console.log(
      `\n🎯 Categoria padrão para produtos órfãos: ${defaultCategory.name.pt}\n`,
    );

    let orphanedCount = 0;
    let updatedCount = 0;

    for (const dish of dishes) {
      if (!dish.category) {
        orphanedCount++;
        console.log(`❌ Produto órfão encontrado: ${dish.name.pt}`);

        let suggestedCategory = defaultCategory;
        const dishNameLower = dish.name.pt.toLowerCase();

        if (
          dishNameLower.includes('torta') ||
          dishNameLower.includes('pastelão') ||
          dishNameLower.includes('quiche') ||
          dishNameLower.includes('folhado')
        ) {
          // Verificar se é fitness
          if (dishNameLower.includes('fitness') || dish.dietaryInfo?.fitness) {
            suggestedCategory =
              categories.find(c => c.slug === 'fitness') || defaultCategory;
          } else {
            suggestedCategory =
              categories.find(c => c.slug === 'salgados') || defaultCategory;
          }
        } else if (
          dishNameLower.includes('brigadeiro') ||
          dishNameLower.includes('brownie') ||
          dishNameLower.includes('trufa') ||
          dishNameLower.includes('bolo') ||
          dishNameLower.includes('bala') ||
          dishNameLower.includes('mini brownie')
        ) {
          suggestedCategory =
            categories.find(c => c.slug === 'doces') || defaultCategory;
        } else if (
          dishNameLower.includes('pesto') ||
          dishNameLower.includes('hommus') ||
          dishNameLower.includes('hummus') ||
          dishNameLower.includes('granola') ||
          dishNameLower.includes('biscoito') ||
          dishNameLower.includes('coalhada') ||
          dishNameLower.includes('caponata')
        ) {
          suggestedCategory =
            categories.find(c => c.slug === 'acompanhamentos') ||
            defaultCategory;
        } else if (dish.dietaryInfo?.fitness) {
          suggestedCategory =
            categories.find(c => c.slug === 'fitness') || defaultCategory;
        }

        dish.category = suggestedCategory._id;
        await dish.save();
        updatedCount++;
        console.log(
          `   ✅ Atualizado com categoria: ${suggestedCategory.name.pt}`,
        );
      }
    }

    console.log('\n📈 Resumo da operação:');
    console.log(`   Total de produtos: ${dishes.length}`);
    console.log(`   Produtos órfãos encontrados: ${orphanedCount}`);
    console.log(`   Produtos atualizados: ${updatedCount}`);
    console.log('\n🎉 Correção concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexão fechada');
  }
};

fixOrphanedDishes();
