// commands/editcategory.js
const fs = require('fs');
const path = require('path');
const categoriesFile = path.join(__dirname, '../data/categories.json');
const productsFile = path.join(__dirname, '../data/products.json');

module.exports = async (args, m) => {
  args = args.replace(/^(\s)+/, '');
  const params = args.split('|').map(param => param.trim());

  const categoryName = params[0];
  const newCategoryName = params[1];
  const note = params[2];
  const terms = params[3];

  if (!categoryName) {
    return m.reply('Penggunaan: .editcategory {nama-category} | {new-name} | {note} | {terms}');
  }

  let categories = [];
  if (fs.existsSync(categoriesFile)) {
    categories = JSON.parse(fs.readFileSync(categoriesFile));
  }

  const index = categories.findIndex(c => c.name.toLowerCase() === categoryName.toLowerCase());
  if (index === -1) {
    return m.reply(`Kategori ${categoryName} tidak ditemukan.`);
  }

  if (newCategoryName) {
    // Update category name in categories
    categories[index].name = newCategoryName;

    // Update category name in products
    if (fs.existsSync(productsFile)) {
      let products = JSON.parse(fs.readFileSync(productsFile));
      products = products.map(p => {
        if (p.category.toLowerCase() === categoryName.toLowerCase()) {
          p.category = newCategoryName;
        }
        return p;
      });
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    }
  }
  if (note !== undefined) categories[index].note = note;
  if (terms !== undefined) categories[index].terms = terms;

  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
  m.reply(`Kategori ${categoryName} berhasil diperbarui.`);
};
