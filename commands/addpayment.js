// commands/addpayment.js
const fs = require('fs');
const path = require('path');
const paymentsFile = path.join(__dirname, '../data/payments.json');

module.exports = async (args, m) => {
  const params = args.split('|').map(param => param.trim());
  const paymentName = params[0];
  const paymentNumber = params[1];
  const accountName = params[2];

  if (!paymentName || !paymentNumber || !accountName) {
    return m.reply('Penggunaan: .addpayment | {nama-payment} | {nomor-payment} | {atas-nama}');
  }

  let payments = [];
  if (fs.existsSync(paymentsFile)) {
    payments = JSON.parse(fs.readFileSync(paymentsFile));
  }
  if (payments.find(p => p.name.toLowerCase() === paymentName.toLowerCase())) {
    return m.reply(`Metode pembayaran ${paymentName} sudah ada.`);
  }
  payments.push({ name: paymentName, number: paymentNumber, accountName });
  fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2));
  m.reply(`Metode pembayaran ${paymentName} berhasil ditambahkan.`);
};
