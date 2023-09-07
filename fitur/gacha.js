const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const apiUrl = 'https://api.waifu.pics/sfw/waifu';
const downloadFolder = path.join(__dirname, 'downloads');
const updateDateTime = require('../elses/time');
const waktu = updateDateTime();


function gachawaifu(client, msg) {
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  axios.get(apiUrl)
    .then(async response => {
      const imageUrl = response.data.url;
      const imageFileName = imageUrl.split('/').pop();
      const imagePath = path.join(downloadFolder, imageFileName);

      axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream'
      })
      .then(response => {
        response.data.pipe(fs.createWriteStream(imagePath))
          .on('finish', async () => {
            console.log('Gambar berhasil diunduh:', imageFileName);
            const imageBuffer = fs.readFileSync(path.join(downloadFolder, imageFileName));
            const base64Image = imageBuffer.toString('base64');
            
            const media = new MessageMedia('image/jpeg', base64Image);           
            await msg.reply(media); // Mengirim gambar dengan metode reply
            console.log(`Gambar dikirim pada ${waktu}: `, imageFileName);

            fs.unlinkSync(imagePath);
            console.log(`Gambar dihapus pada ${waktu}: `, imageFileName);
          });
      })
      .catch(error => {
        console.error('Terjadi kesalahan saat mengunduh gambar:', error);
      });
    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}

module.exports = { gachawaifu };
