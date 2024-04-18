const axios = require('axios');
require("dotenv").config();
const webhookUrl = process.env.DISCORD_WH;

async function sendDiscordMsg(message, name,phone) {
  try {
    const embed = {
      title: `**Pesan dihapus oleh**: ${name} (${phone})`,
      description: `Pesan: ${message}`,
      color: 0x32CD32,
      footer: {
        text: 'Mengirim pada: ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', timeZoneName: 'short' }),
      },
    };

    await axios.post(webhookUrl, {
      embeds: [embed],
    });

    console.log('Pesan berhasil dikirim ke Discord!');
  } catch (error) {
    console.error('Terjadi kesalahan saat mengirim pesan ke Discord:', error.message);
  }
}

//const message= 'ewewewewe';
//const dari = "tuhan";
//const nama ='hamba'
//sendDiscordMsg(message,nama,dari),
module.exports = {sendDiscordMsg};
