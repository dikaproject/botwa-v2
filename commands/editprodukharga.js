// commands/editprodukharga.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');

module.exports = async (args, m) => {
  const params = args.split('|').map(param => param.trim());
  const categoryName = params[0];
  const productName = params[1];
  const newPrice = parseFloat(params[2]);

  if (!categoryName || !productName || isNaN(newPrice)) {
    return m.reply('Penggunaan: .editprodukharga | {nama-category} | {nama-produk} | {harga-baru}');
  }

  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  const index = products.findIndex(p => p.category.toLowerCase() === categoryName.toLowerCase() && p.name.toLowerCase() === productName.toLowerCase());
  if (index === -1) {
    return m.reply(`Produk ${productName} tidak ditemukan dalam kategori ${categoryName}.`);
  }

  products[index].price = newPrice;
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  m.reply(`Harga produk ${productName} dalam kategori ${categoryName} diperbarui menjadi ${newPrice}.`);
};
