// commands/payment.js
const fs = require('fs');
const path = require('path');
const paymentsFile = path.join(__dirname, '../data/payments.json');
const ordersFile = path.join(__dirname, '../data/orders.json');

module.exports = async (args, m) => {
  const paymentName = args.trim();

  let payments = [];
  if (fs.existsSync(paymentsFile)) {
    payments = JSON.parse(fs.readFileSync(paymentsFile));
  }

  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }
  const userOrders = orders.filter(o => o.user === m.sender && o.status === 'pending');
  if (userOrders.length === 0) {
    return m.reply('Anda tidak memiliki pesanan yang tertunda.');
  }
  const latestOrder = userOrders[userOrders.length -1];

  if (!paymentName) {
    // List available payment methods
    const paymentNames = payments.map(p => p.name).join(', ');
    return m.reply(`Metode pembayaran yang tersedia: ${paymentNames}`);
  }

  // Find the payment method
  const payment = payments.find(p => p.name.toLowerCase() === paymentName.toLowerCase());
  if (!payment) {
    return m.reply(`Metode pembayaran ${paymentName} tidak ditemukan.`);
  }

  // Send payment details and order details
  const message = `*Order Details | ${latestOrder.category}*
Brand: ${latestOrder.category}
Produk: ${latestOrder.product}
Jumlah: ${latestOrder.quantity}
Harga: ${latestOrder.price}
Payment: ${payment.name}
No: ${payment.number}
Atas Nama: ${payment.accountName}

${m.pushName}, Hai! Detail pesanan kamu seperti di atas. Silakan lakukan pembayaran sekarang juga. Terima kasih.
*Intech Store - Digital Store*`;
  m.reply(message);
};
