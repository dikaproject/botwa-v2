// commands/editproduk.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');

module.exports = async (args, m) => {
  const params = args.split('|').map(param => param.trim());
  const categoryName = params[0];
  const oldProductName = params[1];
  const newProductName = params[2];
  const price = parseFloat(params[3]);

  if (!categoryName || !oldProductName || !newProductName || isNaN(price)) {
    return m.reply('Penggunaan: .editproduk | {nama-category} | {nama-produk-lama} | {nama-produk-baru} | {harga}');
  }

  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  const index = products.findIndex(p => p.category.toLowerCase() === categoryName.toLowerCase() && p.name.toLowerCase() === oldProductName.toLowerCase());
  if (index === -1) {
    return m.reply(`Produk ${oldProductName} tidak ditemukan dalam kategori ${categoryName}.`);
  }

  products[index].name = newProductName;
  products[index].price = price;
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  m.reply(`Produk ${oldProductName} berhasil diubah menjadi ${newProductName} dengan harga ${price} dalam kategori ${categoryName}.`);
};
