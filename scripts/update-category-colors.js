/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const PURPLE = '#6B3A7D';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Category = mongoose.connection.collection('categories');
  const result = await Category.updateMany({}, { $set: { color: PURPLE } });

  console.log(`Updated ${result.modifiedCount} categories to ${PURPLE}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
