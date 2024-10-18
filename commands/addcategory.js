// commands/addcategory.js
const fs = require('fs');
const path = require('path');
const categoriesFile = path.join(__dirname, '../data/categories.json');

module.exports = async (args, m) => {
  args = args.replace(/^(\s)+/, ''); // Remove leading spaces
  const params = args.split('|').map(param => param.trim());

  const categoryName = params[0];
  const note = params[1] || '';
  const terms = params[2] || '';

  if (!categoryName) {
    return m.reply('Penggunaan: .addcategory {nama-category} | {note} | {terms}');
  }

  let categories = [];
  if (fs.existsSync(categoriesFile)) {
    const data = fs.readFileSync(categoriesFile);
    if (data.length !== 0) {
      categories = JSON.parse(data);
    }
  }

  if (categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
    return m.reply(`Kategori ${categoryName} sudah ada.`);
  }

  categories.push({ name: categoryName, note, terms });
  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
  m.reply(`Kategori ${categoryName} berhasil ditambahkan.`);
};
