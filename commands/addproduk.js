// commands/addproduk.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');
const categoriesFile = path.join(__dirname, '../data/categories.json');

module.exports = async (args, m) => {
  // Remove leading '|' characters and spaces
  args = args.replace(/^(\||\s)+/, '');

  const params = args.split('|').map(param => param.trim()).filter(param => param !== '');
  const categoryName = params[0];
  const productName = params[1];
  const price = parseFloat(params[2]);

  if (!categoryName || !productName || isNaN(price)) {
    return m.reply('Penggunaan: .addproduk | {nama-category} | {nama-produk} | {harga}');
  }

  // Check if category exists
  let categories = [];
  if (fs.existsSync(categoriesFile)) {
    const data = fs.readFileSync(categoriesFile);
    if (data.length !== 0) {
      categories = JSON.parse(data);
    }
  }
  if (!categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
    return m.reply(`Kategori ${categoryName} tidak ada.`);
  }

  // Add product
  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  if (products.find(p => p.category.toLowerCase() === categoryName.toLowerCase() && p.name.toLowerCase() === productName.toLowerCase())) {
    return m.reply(`Produk ${productName} sudah ada dalam kategori ${categoryName}.`);
  }
  products.push({ category: categoryName, name: productName, price });
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  m.reply(`Produk ${productName} ditambahkan ke kategori ${categoryName} dengan harga ${price}.`);
};
