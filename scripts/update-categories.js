const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CategorySchema = new mongoose.Schema({
  name: { pt: String, en: String },
  slug: String,
  color: String,
  order: Number,
  active: Boolean,
});

const Category = mongoose.model('Category', CategorySchema);

const newCategories = [
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
];

const updateCategories = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado!\n');

    console.log('🗑️  Removendo categorias antigas...');
    await Category.deleteMany({});
    console.log('✅ Categorias antigas removidas!\n');

    console.log('📝 Criando novas categorias...');
    const created = await Category.insertMany(newCategories);

    console.log('✅ Categorias criadas com sucesso!\n');
    console.log('📋 Categorias atualizadas:');
    created.forEach((cat, index) => {
      console.log(
        `   ${index + 1}. ${cat.name.pt} / ${cat.name.en} (${cat.color})`,
      );
    });

    console.log('\n🎉 Atualização concluída!');
    console.log('📊 Total de categorias:', created.length);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexão fechada');
  }
};

updateCategories();
