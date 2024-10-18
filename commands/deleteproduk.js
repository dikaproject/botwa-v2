// commands/deleteproduk.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');

module.exports = async (args, m) => {
  const params = args.split('|').map(param => param.trim());
  const categoryName = params[0];
  const productName = params[1];

  if (!categoryName || !productName) {
    return m.reply('Penggunaan: .deleteproduk | {nama-category} | {nama-produk}');
  }

  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  const index = products.findIndex(p => p.category.toLowerCase() === categoryName.toLowerCase() && p.name.toLowerCase() === productName.toLowerCase());
  if (index === -1) {
    return m.reply(`Produk ${productName} tidak ditemukan dalam kategori ${categoryName}.`);
  }
  products.splice(index, 1);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  m.reply(`Produk ${productName} dihapus dari kategori ${categoryName}.`);
};
