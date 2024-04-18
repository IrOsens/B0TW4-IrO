// Import modul dateTimeModule.js
const updateDateTime = require('../elses/time');

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function noBackgroundsend(inputimg, lokasi) {
  try {
    const inputPath = inputimg;
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': 'GqhjY4KEcm3rNarxU5y9Hbb5',
      },
      encoding: null
    });
    if (response.status != 200) {
      console.error('Error:', response.status, response.statusText);
      return;
    }
    const pathnobg = `./fitur/downloads/nobg+${lokasi}`;
    fs.writeFileSync(pathnobg, response.data);

    // Tanggal dan waktu ketika pathnobg dibuat
    console.log(`${lokasi} dibuat pada:`, updateDateTime());

    // Menghapus file inputimg
    fs.unlinkSync(inputimg);

    // Tanggal dan waktu ketika inputimg dihapus
    console.log(`${lokasi} dihapus pada:`, updateDateTime());

    // Mengembalikan jalur file yang benar
    return pathnobg;
  } catch (error) {
    console.error('Request failed:', error);
    return null; // Mengembalikan null dalam kasus kesalahan
  }
}
module.exports = { noBackgroundsend };
