const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const apiUrl = 'https://api.waifu.pics/sfw';
const apiUrlNSFW = 'https://api.waifu.pics/nsfw';
const downloadFolder = path.join(__dirname, 'downloads');
const updateDateTime = require('../elses/time');
const waktu = updateDateTime();

const categories = [
  "waifu",
  "neko",
  "shinobu",
  "megumin",
  "bully",
  "cuddle",
  "cry",
  "hug",
  "awoo",
  "kiss",
  "lick",
  "pat",
  "smug",
  "bonk",
  "yeet",
  "blush",
  "smile",
  "wave",
  "highfive",
  "handhold",
  "nom",
  "bite",
  "glomp",
  "slap",
  "kill",
  "kick",
  "happy",
  "wink",
  "poke",
  "dance",
  "cringe"
];

const categories1 = [
  "waifu",
  "neko",
  "trap",
  "blowjob"
];

function gachawaifu(client, msg, isNSFW) {
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  const selectedCategories = isNSFW ? categories1 : categories;
  const selectedCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
  const categoryUrl = isNSFW ? `${apiUrlNSFW}/${selectedCategory}` : `${apiUrl}/${selectedCategory}`;

  axios.get(categoryUrl)
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
