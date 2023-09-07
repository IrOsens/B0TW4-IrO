const qrcode = require('qrcode-terminal');
const { Client,LocalAuth, MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {    headless: false,
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    }
 
});
const fs = require('fs');
const path = require('path');
const { gachawaifu } = require('./fitur/gacha'); // Mengimpor kode dari file gacha.js
const dotenv = require('dotenv'); // Import dotenv
dotenv.config();
const openai = require('openai');
openai.apiKey = process.env.API_GPT;


client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.initialize();

client.on('message', async msg => {
  try {
    if (msg.body === '!siapa kamu') {
      client.sendMessage(msg.from, 'Saya adalah bot punya rio 🥰');
    }

    // Cek apakah pengirim pesan adalah admin grup
    if (msg.body === ',everyone') {
      const chat = await msg.getChat();

      let text = "";
      let mentions = [];

      for (let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);

        mentions.push(contact);
        text += `@${participant.id.user} `;
      }

      await chat.sendMessage(text, { mentions });
    }

    if (msg.body === 'tes') {
      // Balas pesan dengan pesan yang sama
      await msg.reply(msg.body);
    }

    if (msg.body === 'p') {
      var voiceBuffer = fs.readFileSync('./gallery/an1.ogg');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/ogg', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body.includes('assa')) {
      var voiceBuffer = fs.readFileSync('./gallery/ana3.ogg');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/ogg', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body.includes('jaya')) {
      var voiceBuffer = fs.readFileSync('./gallery/animasi_out.ogg');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/ogg', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body === ',ani') {
      var voiceBuffer = fs.readFileSync('./gallery/animasi1.mp3');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/mp3', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body === '🍦') {
      var voiceBuffer = fs.readFileSync('./gallery/bing.mp3');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/mp3', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body === 'chill') {
      var voiceBuffer = fs.readFileSync('./gallery/dead.mp3');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/mp3', base64Voice, 'Voice Message');
      
      await msg.reply(audioMedia);
    }

    if (msg.body.includes('sayang')) {
      var voiceBuffer = fs.readFileSync('./gallery/zeta.mp3');
      var base64Voice = voiceBuffer.toString('base64');
      var audioMedia = new MessageMedia('audio/mp3', base64Voice, 'Voice Message');
      await msg.reply(audioMedia);
    }

    if (msg.body === 'tesg') {
      var imageBuffer = fs.readFileSync('1.png');
      var base64Image = imageBuffer.toString('base64');
      
      var media = new MessageMedia('image/jpg', base64Image);           
      await msg.reply(media);
    }

      if (msg.body === ',waifu') {
        gachawaifu(client, msg); // Memanggil fungsi dari file gacha.js
      }
      if (msg.body === ',husbu') {
        const folderPath = './gallery/husbu';
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Terjadi kesalahan saat membaca folder:', err);
                return;
            }

            // Memilih secara acak satu file gambar dari array files
            const randomIndex = Math.floor(Math.random() * files.length);
            const randomFile = files[randomIndex];

            var imageBuffer = fs.readFileSync(path.join(folderPath, randomFile));
            var base64Image = imageBuffer.toString('base64');

            var media = new MessageMedia('image/jpg', base64Image);
            msg.reply(media);
        });
    }
    if (msg.body === ',s') {
        if (msg.hasMedia) {
            const attachmentData = await msg.downloadMedia();
            if (attachmentData.mimetype.includes('image')) {
                await client.sendMessage(msg.from, attachmentData, { sendMediaAsSticker: true });
            } else {
                await msg.reply('Maaf harus menyertakan gambar (︶︹︺)');
            }}}
    if (msg.body.startsWith(',gpt ')) {
      const inputMessage = msg.body.slice(5);
      client.sendMessage(msg.from, 'Tunggu yaa...');
      const gptResponse = await openai.complete({
        model: 'gpt-3.5-turbo',
        messages: inputMessage,
        max_tokens: 50
      });
      const botResponse = gptResponse.choices[0].text.trim();
      console.log(botResponse);
      //client.sendMessage(msg.from, botResponse);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
