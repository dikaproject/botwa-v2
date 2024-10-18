// commands/order.js
const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');
const ordersFile = path.join(__dirname, '../data/orders.json');

module.exports = async (args, m) => {
  // Remove leading '|' characters and spaces
  args = args.replace(/^(\||\s)+/, '');

  // Check if user has a pending order
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }
  const existingOrder = orders.find(o => o.user === m.sender && o.status === 'pending');
  if (existingOrder) {
    return m.reply('Anda masih memiliki pesanan yang belum selesai. Mohon selesaikan pesanan sebelumnya sebelum memesan lagi.');
  }

  const params = args.split('|').map(param => param.trim()).filter(param => param !== '');
  const categoryName = params[0];
  const productName = params[1];
  const quantity = parseInt(params[2]);

  if (!categoryName || !productName || isNaN(quantity)) {
    return m.reply('Penggunaan: .order {nama-category} | {nama-produk} | {jumlah}');
  }

  // Find the product
  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  const product = products.find(p => p.category.toLowerCase() === categoryName.toLowerCase() && p.name.toLowerCase() === productName.toLowerCase());
  if (!product) {
    return m.reply(`Produk ${productName} tidak ada dalam kategori ${categoryName}.`);
  }
  const totalPrice = product.price * quantity;

  // Save the order
  const order = {
    user: m.sender,
    category: categoryName,
    product: productName,
    quantity,
    price: totalPrice,
    status: 'pending'
  };
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  // Reply to the user
  m.reply(`Order berhasil diterima untuk produk ${productName} dari kategori ${categoryName} dengan jumlah ${quantity}. Segera lakukan pembayaran. Untuk melihat pembayaran silakan ketik .paymentlist dan untuk memilih metode pembayaran ketik: .payment | {nama paymentnya}`);
};
