// commands/bukti.js
const fs = require('fs');
const path = require('path');
const ordersFile = path.join(__dirname, '../data/orders.json');
const config = require('../config');
const { owner } = config;

module.exports = async (m, ptz) => {
  if (!m.message.imageMessage) {
    return m.reply('Please send an image with the command .bukti');
  }
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile));
  }
  const userOrders = orders.filter(o => o.user === m.sender && o.status === 'pending');
  if (userOrders.length === 0) {
    return m.reply('You have no pending orders.');
  }
  const latestOrder = userOrders[userOrders.length -1];
  // Update the order status
  latestOrder.status = 'payment_proof_submitted';
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  // Notify the user
  m.reply('Thank you for submitting the payment proof. We will process your order shortly.');
  // Forward the message to the admin
  const adminJid = owner[0] + '@s.whatsapp.net';
  const orderDetails = `New Payment Proof Submitted:

User: ${m.sender}
Brand: ${latestOrder.category}
Produk: ${latestOrder.product}
Jumlah: ${latestOrder.quantity}
Harga: ${latestOrder.price}

Please check the payment proof image attached.`;
  // Download the image
  const buffer = await m.download();
  await ptz.sendMessage(adminJid, { image: buffer, caption: orderDetails });
};
