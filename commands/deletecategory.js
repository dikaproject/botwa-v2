// commands/deletecategory.js
const fs = require('fs');
const path = require('path');
const categoriesFile = path.join(__dirname, '../data/categories.json');

module.exports = async (text, m) => {
  const categoryName = text.trim();
  if (!categoryName) {
    return m.reply('Usage: .deletecategory {nama-category}');
  }
  let categories = [];
  if (fs.existsSync(categoriesFile)) {
    categories = JSON.parse(fs.readFileSync(categoriesFile));
  }
  const index = categories.findIndex(c => c.name.toLowerCase() === categoryName.toLowerCase());
  if (index === -1) {
    return m.reply(`Category ${categoryName} does not exist.`);
  }
  categories.splice(index, 1);
  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
  // Delete products under the category
  const productsFile = path.join(__dirname, '../data/products.json');
  if (fs.existsSync(productsFile)) {
    let products = JSON.parse(fs.readFileSync(productsFile));
    products = products.filter(p => p.category.toLowerCase() !== categoryName.toLowerCase());
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  }
  m.reply(`Category ${categoryName} deleted successfully.`);
};
