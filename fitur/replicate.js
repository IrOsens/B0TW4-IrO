const Replicate = require('replicate');
require("dotenv").config();
const axios = require('axios');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const downloadFolder = path.join(__dirname, 'downloads');
const updateDateTime = require('../elses/time');
const waktu = updateDateTime();
const downloadImage = async (imageUrl, downloadFolder) => {
  const imageFileName = imageUrl.split('/').pop();
  const imagePath = path.join(downloadFolder, imageFileName);

  try {
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(imagePath))
        .on('finish', resolve)
        .on('error', reject);
    });

    return imagePath;
  } catch (error) {
    console.error('Terjadi kesalahan saat mengunduh gambar:', error);
    throw error;
  }
};
const deleteImage = (imagePath) => {
  try {
    fs.unlinkSync(imagePath);
    console.log(`Gambar dihapus pada ${waktu}: `, imagePath.split('/').pop());
  } catch (error) {
    console.error('Terjadi kesalahan saat menghapus gambar:', error);
  }
};

const runReplicate = async (promptText,msg) => {
  const replicate = new Replicate({
    auth: process.env.API_AI,
  });

  try {
    const output = await replicate.run(
      "stability-ai/sdxl:610dddf033f10431b1b55f24510b6009fcba23017ee551a1b9afbc4eec79e29c",
      {
        input: {
          width: 1024,
          height: 1024,
          prompt: promptText,
          refine: "expert_ensemble_refiner",
          scheduler: "KarrasDPM",
          num_outputs: 1,
          guidance_scale: 7.5,
          high_noise_frac: 0.8,
          prompt_strength: 0.8,
          num_inference_steps: 50
        }
      }
    );
    const imageUrl = output[0]; // Adjust this based on the actual output structure

    const imagePath = await downloadImage(imageUrl, downloadFolder);

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const media = new MessageMedia('image/jpeg', base64Image);
    await msg.reply(media);
    console.log(`Gambar dikirim pada ${waktu}: `, imagePath.split('/').pop());

    deleteImage(imagePath);
    console.log(output);
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = {runReplicate};
