// case.js
require("./config");
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const { exec } = require("child_process");

// Import command handlers
const addCategory = require("./commands/addcategory");
const editCategory = require("./commands/editcategory");
const deleteCategory = require("./commands/deletecategory");
const addProduk = require("./commands/addproduk");
const editProduk = require("./commands/editproduk");
const editProdukHarga = require("./commands/editprodukharga");
const deleteProduk = require("./commands/deleteproduk");
const addPayment = require("./commands/addpayment");
const handleOrder = require("./commands/order");
const handlePayment = require("./commands/payment");
const handleBukti = require("./commands/bukti");

module.exports = async (ptz, m) => {
  try {
    // Ignore messages sent by the bot itself
    if (m.key.fromMe) {
      return;
    }

    // Extract message content
    const body =
      (m.mtype === "conversation" && m.message.conversation) ||
      (m.mtype === "imageMessage" && m.message.imageMessage.caption) ||
      (m.mtype === "documentMessage" && m.message.documentMessage.caption) ||
      (m.mtype === "videoMessage" && m.message.videoMessage.caption) ||
      (m.mtype === "extendedTextMessage" && m.message.extendedTextMessage.text) ||
      (m.mtype === "buttonsResponseMessage" && m.message.buttonsResponseMessage.selectedButtonId) ||
      (m.mtype === "templateButtonReplyMessage" && m.message.templateButtonReplyMessage.selectedId) ||
      "";

    // Identify command
    const budy = typeof m.text === "string" ? m.text : "";
    const prefixRegex = /^[.]/; // Only recognize prefix '.'
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : ".";
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
    const args = body.slice(prefix.length + command.length).trim(); // Get the rest of the message after command
    const fullCommand = isCmd ? body.slice(prefix.length).trim().toLowerCase() : ""; // Capture full command after prefix
    const sender = m.key.participant || m.key.remoteJid;
    const botNumber = await ptz.decodeJid(ptz.user.id);
    const senderNumber = sender.split("@")[0];
    const isCreator = [botNumber, ...global.owner]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
    const pushname = m.pushName || `${senderNumber}`;

    // Get group name if in a group
    let groupName = '';
    if (m.isGroup) {
      const groupMetadata = await ptz.groupMetadata(m.chat);
      groupName = groupMetadata.subject || '';
    }

    // Helper function to format price in Rupiah
    function formatRupiah(amount) {
      return 'Rp ' + amount.toLocaleString('id-ID');
    }

    // Function to handle commands
    async function handleCommand(command, args, m) {
      switch (command) {
        case "menu":
        case "help": {
          m.reply(`
*🛒 Intech Digital Store - Menu*

Halo ${pushname}, berikut adalah daftar perintah yang tersedia:

*User Commands:*
- .list ( untuk melihat daftar kategori produk )
- .order {nama-category} | {nama-produk} | {jumlah} ( untuk memesan produk )
- .payment {nama-payment} ( untuk melakukan pembayaran )
- .paymentlist ( untuk melihat daftar metode pembayaran yang tersedia )
- .bukti (kirim gambar bukti pembayaran dengan caption .bukti)
- .caraorder ( untuk mengetahui cara memesan produk )

Untuk melihat daftar produk dalam kategori, ketik .{nama-category}

*Intech Store - Digital Store*
          `);
        }
        break;

        case "caraorder": {
            m.reply(`
*🛒 Intech Digital Store - Cara Order* 
Halo ${pushname}, berikut adalah cara melakukan order sendiri:

1. Ketik .list untuk melihat daftar kategori produk.
2. Pilih kategori produk yang ingin dipesan.
3. jika sudah menemukan produk yang diinginkan, ketik .order {nama-category} | {nama-produk} | {jumlah}.
contoh order : .order TELEGRAM PREMIUM | 3 Bulan Premium | 1
4. Setelah itu, lakukan pembayaran dengan cara ketik .payment {nama-payment}. untuk melihat daftar metode pembayaran, ketik .paymentlist
5. Jika sudah melakukan pembayaran, jangan lupa kirim bukti pembayaran dengan caption .bukti
6. Tunggu konfirmasi dari admin, jika sudah dikonfirmasi, maka produk akan segera dikirim.

Jika ada pertanyaan, silakan chat admin.

*Intech Store - Digital Store*`
            );
        }
        break;

        case "adminmenu": {
          m.reply(`
*🛒 Intech Digital Store - Menu*

Halo ${pushname}, berikut adalah daftar perintah yang tersedia:

*Admin Commands:*
- .addcategory {nama-category} | {note} | {terms}
- .editcategory {nama-category} | {new-name} | {note} | {terms}
- .deletecategory {nama-category}
- .addproduk | {nama-category} | {nama-produk} | {harga}
- .editproduk | {nama-category} | {nama-produk-lama} | {nama-produk-baru} | {harga}
- .editprodukharga | {nama-category} | {nama-produk} | {harga-baru}
- .deleteproduk | {nama-category} | {nama-produk}
- .addpayment | {nama-payment} | {nomor-payment} | {atas-nama}

*Intech Store - Digital Store*
          `);
        }
        break;

        case "paymentlist": {
          // Read payments from the file each time to get the latest data
          const paymentsFile = "./data/payments.json";
          let payments = [];
          if (fs.existsSync(paymentsFile)) {
            const data = fs.readFileSync(paymentsFile);
            if (data.length !== 0) {
              payments = JSON.parse(data);
            }
          }
          if (payments.length === 0) {
            return m.reply("Belum ada metode pembayaran yang tersedia.");
          }

          // Build the message
          let message = `*🛒 Payment Intech Digital Store*\n\n`;

          payments.forEach((payment) => {
            message += `> ⇴ *${payment.name}* : ${payment.number} an ${payment.accountName}\n\n`;
          });

          message += `Note : Mohon baca seksama agar tidak salah transfer dll`;

          m.reply(message);
        }
        break;

        case "list": {
          // Read categories from the file each time to get the latest data
          const categoriesFile = "./data/categories.json";
          let categories = [];
          if (fs.existsSync(categoriesFile)) {
            const data = fs.readFileSync(categoriesFile);
            if (data.length !== 0) {
              categories = JSON.parse(data);
            }
          }
          if (categories.length === 0) {
            return m.reply("Belum ada kategori yang tersedia.");
          }
          // Build the message
          const currentTime = new Date();
          const formattedDate = currentTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

          let greeting = "Selamat ";
          const hour = currentTime.getHours();
          if (hour >= 4 && hour < 12) {
            greeting += "Pagi";
          } else if (hour >= 12 && hour < 15) {
            greeting += "Siang";
          } else if (hour >= 15 && hour < 18) {
            greeting += "Sore";
          } else {
            greeting += "Malam";
          }

          let message = `${greeting} Kak ${pushname}?👋.\n\n`;
          message += `🛒 ${groupName || 'Intech Store'}\n`;
          message += `📆 ${formattedDate}\n`;
          message += `> ============================\n`;

          categories.forEach(category => {
            message += `> ⇴ ${category.name}\n`;
          });

          message += `> ============================`;

          m.reply(message);
        }
        break;

        // Admin Commands
        case "addcategory":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await addCategory(args, m);
          break;

        case "editcategory":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await editCategory(args, m);
          break;

        case "deletecategory":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await deleteCategory(args, m);
          break;

        case "addproduk":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await addProduk(args, m);
          break;

        case "editproduk":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await editProduk(args, m);
          break;

        case "editprodukharga":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await editProdukHarga(args, m);
          break;

        case "deleteproduk":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await deleteProduk(args, m);
          break;

        case "addpayment":
          if (!isCreator) return m.reply("Hanya admin yang dapat menggunakan perintah ini.");
          await addPayment(args, m);
          break;

        // User Commands
        case "order":
          await handleOrder(args, m);
          break;

        case "payment":
          await handlePayment(args, m);
          break;

        case "bukti":
          await handleBukti(m, ptz);
          break;

        // Other Commands
        case "ai": {
          if (!args) return m.reply(`Penggunaan: .ai {prompt}`);
          let { data } = await axios.get(
            "https://api.mininxd.my.id/gemini/?q=" + encodeURIComponent(args)
          );
          m.reply(data.result);
        }
        break;

        default:
          // Check if message matches a category name
          const categoriesFile = "./data/categories.json";
          let categories = [];
          if (fs.existsSync(categoriesFile)) {
            const data = fs.readFileSync(categoriesFile);
            if (data.length !== 0) {
              categories = JSON.parse(data);
            }
          }
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === fullCommand.toLowerCase()
          );
          if (matchedCategory) {
            // List products under this category
            const productsFile = "./data/products.json";
            let products = [];
            if (fs.existsSync(productsFile)) {
              const data = fs.readFileSync(productsFile);
              if (data.length !== 0) {
                products = JSON.parse(data);
              }
            }
            const categoryProducts = products.filter(
              (p) => p.category.toLowerCase() === matchedCategory.name.toLowerCase()
            );
            let productList = '';
            if (categoryProducts.length === 0) {
              productList = 'Belum ada produk dalam kategori ini.';
            } else {
              categoryProducts.forEach((p) => {
                // Format price
                const formattedPrice = formatRupiah(p.price);
                productList += `> ⇴ *${p.name}* › ${formattedPrice}\n`;
              });
            }

            // Prepare the message using the standard template with 🛒 emoji
            const currentTime = new Date();
            // Format date to '18 Oktober 2024'
            const formattedDate = currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

            let message = `*🛒 Intech Digital Store - ${matchedCategory.name}*\n\n`;
            message += `🛒 ${groupName || 'Intech Digital Store'}\n`;
            message += `📆 ${formattedDate}\n\n`;
            message += `*List Produk ${matchedCategory.name}*\n\n`;
            message += productList + '\n';
            message += `*Note :*\n${matchedCategory.note}\n\n`;
            message += `*Syarat Dan Ketentuan :*\n${matchedCategory.terms}\n\n`;
            message += `*Intech Bot - Digital Solution by Dika*`;

            m.reply(message);
          } else {
            // Handle other messages or unknown commands
            // Do nothing or you can send a default message if needed
          }
      }
    }

    // Only process if it's a command or if it matches a category
    if (isCmd && command) {
      await handleCommand(command, args, m);
    } else {
      // Check if message matches a category name
      const categoriesFile = "./data/categories.json";
      let categories = [];
      if (fs.existsSync(categoriesFile)) {
        const data = fs.readFileSync(categoriesFile);
        if (data.length !== 0) {
          categories = JSON.parse(data);
        }
      }
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === body.trim().toLowerCase()
      );
      if (matchedCategory) {
        // Handle the category as in the default case above
        // Reuse the code from the default case
        const productsFile = "./data/products.json";
        let products = [];
        if (fs.existsSync(productsFile)) {
          const data = fs.readFileSync(productsFile);
          if (data.length !== 0) {
            products = JSON.parse(data);
          }
        }
        const categoryProducts = products.filter(
          (p) => p.category.toLowerCase() === matchedCategory.name.toLowerCase()
        );
        let productList = '';
        if (categoryProducts.length === 0) {
          productList = 'Belum ada produk dalam kategori ini.';
        } else {
          categoryProducts.forEach((p) => {
            // Format price
            const formattedPrice = formatRupiah(p.price);
            productList += `> ⇴ *${p.name}* › ${formattedPrice}\n`;
          });
        }

        // Prepare the message using the standard template with 🛒 emoji
        const currentTime = new Date();
        // Format date to '18 Oktober 2024'
        const formattedDate = currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

        let message = `*🛒 Intech Digital Store - ${matchedCategory.name}*\n\n`;
        message += `🛒 ${groupName || 'Intech Digital Store'}\n`;
        message += `📆 ${formattedDate}\n\n`;
        message += `*List Produk ${matchedCategory.name}*\n\n`;
        message += productList + '\n';
        message += `*Note :*\n${matchedCategory.note}\n\n`;
        message += `*Syarat Dan Ketentuan :*\n${matchedCategory.terms}\n\n`;
        message += `*Intech Bot - Digital Solution by Dika*`;

        m.reply(message);
      }
    }
  } catch (err) {
    console.log(util.format(err));
  }
};

// Auto-reload setup when this file changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`File updated: ${__filename}`);
  delete require.cache[file];
  require(file);
});
