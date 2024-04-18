const qrcode = require('qrcode-terminal');
const { Client,LocalAuth, MessageMedia,Buttons,Location } = require('whatsapp-web.js');
const client = new Client({
    //restartOnAuthFail: true,
    authStrategy: new LocalAuth(/*{ clientId: "client" }*/),
    //ffmpeg: './ffmpeg.exe',
puppeteer: {    headless: true,args: ["--no-sandbox","--disabled-setupid-sandbox",/*"--no-sandbox","--disable-gpu"*/ ],
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' /*'/usr/bin/chromium'*/
    }
 
});
const OpenAi = require("openai");
const fs = require('fs');
const path = require('path');
const {runReplicate} = require('./fitur/replicate');
const {sendDiscordMsg} = require('./handler/msghandler')
const { gachawaifu } = require('./fitur/gacha'); // Mengimpor kode dari file gacha.js
const {noBackgroundsend} = require('./fitur/nobackground');
require("dotenv").config();
const colors = require('colors');
const moment = require('moment-timezone');
const config = require('./config/config.json'); 
// Di kode lain (misalnya, main.js)
const aturJadwal = require('./elses/setTimes');
const { randomBytes } = require('crypto');

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.clear();
  const consoleText = './config/console.txt';
  fs.readFile(consoleText, 'utf-8', (err, data) => {
      if (err) {
          console.log(colors.yellow(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`));
          console.log(colors.green(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`));
      } else {
          console.log(colors.green(data));
          console.log(colors.green(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`));
      }
  });
client.on('message_revoke_everyone', async (after, before) => {
    if (before) {
        const message = before.body;
        const userId = before.author || before.from ;
        // Menggunakan getContact untuk mendapatkan informasi kontak berdasarkan nomor pengguna
        const contact = await client.getContactById(userId);
        const phone = userId.replace(/@c.us$/, '');
        // Jika kontak ditemukan, gunakan nama pengguna. Jika tidak, gunakan nomor pengguna.
        const name = contact ? contact.name : userId;
        sendDiscordMsg(message,name,phone)
    }
});
//=============Group Automation
  client.getChats().then(chats => {
    const groupName = "Group Wibu berkedok animaSi (GWS)"; // Ganti dengan nama grup yang sesuai
    const group = chats.find(chat => chat.isGroup && chat.name === groupName);
    if (group) {
      const pesan = "Halo semua! Selamat pagi ╰(*°▽°*)╯ Enjoy your day!";
      aturJadwal(pesan,"03:33")
      .then((pesan) => {
        client.sendMessage(group.id._serialized, pesan);
      })
    } else {
      console.log(`Grup ${groupName} tidak ditemukan.`);
    }
  }).catch(error => {
    console.error(error);
  });
  
//==================Me Automation
  const targetId = '6289636259177@c.us'; // Ganti dengan nomor telepon yang sesuai
  const fileContent = fs.readFileSync('./config/task.txt','utf8');
  const pesan_target = fileContent;
  aturJadwal(pesan_target, '22:31')
  .then((pesan) => {
    //client.sendMessage(groupId,pesan) // Ini akan mencetak pesan yang telah diatur di pesan_aturWaktu
    client.sendMessage(targetId,pesan);
  })
  .catch((error) => {
    console.error(error);
  });

});

client.initialize()
  .then(() => {
    console.log('Client initialized successfully');
  })
  .catch(error => {
    console.error('Error initializing client:', error);
  });

const openai = new OpenAi({
    apiKey : process.env.OPENAI_API_KEY,
});
async function runCompletion(message){
    const completion = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        //prompt: message,
        messages : [
          {
            'role': 'system',
            'content':'Role: Tolong berikan respons yang santai dan tidak informatif dalam bahasa Indonesia, maksimal 30 karakter huruf.'
          },
          {
            'role':"user",
            "content" : `${message}`
          }
        ],
        max_tokens: 30,
    })
    .catch((error) => console.error('OpenAI Error: ',error));
    return completion.choices[0].message.content;
}
//========notif
client.on('group_join', (notification) => {
  // User has joined or been added to the group.
  const groupChatId = notification.id.remote; // ID grup
  const newUser = notification.id.participant; // ID pengguna yang baru bergabung

  // Membuat pesan sambutan dengan menyebutkan pengguna yang baru bergabung
  const welcomeMessage = `
Selamat datang di grup! @${newUser.split('@')[0]}\n
New member intro dulu yuk.\n
\n
Nama :\n
Usia :\n
Gender :\n
Asal kota :\n
\n
"Silahkan dibaca deskripsi grup sebelum memulai perjalanan anda di grup ini"\n
\n
Wajib spill artwork/portfolio nya sebagai bentuk validasi.\n
\n
Jangan lupa join Discord kami! https://discord.gg/Nv78QMEmvf
  `;

  // Mengirim pesan sambutan ke grup
  client.sendMessage(groupChatId, welcomeMessage,{mentions:[newUser]});
});



client.on('message', async msg => {
  try {
    if (msg.body === '!mention') {
      const contact = await msg.getContact();
      //Sending messages with mentions
      client.sendMessage(msg.from, `Hello ${contact.number}`, {mentions: [contact]})
;}

    if (msg.body === `${config.prefix}help`) {
      await msg.reply(
        "COMMAND\n" +
        "├── [,gpt <pesan>]\n" +
        "├── [,everyone]\n" +
        "├── [,waifu]\n" +
        "├── [,s <media/reply>]\n" +
        "├── [,ti <reply>]\n" +
        "├── [,vi <media>]\n" +
        "├── [,nobg <gambar>]\n" 
      );
    }
    
    
    var pesan_lower = msg.body.toLowerCase();
    if (pesan_lower.includes('task')) {
      const kata = pesan_lower.split(' ');
      const indexTask= kata.indexOf('task');
      // Ganti isi file dengan "halo"
      const fileName = './config/task.txt';
  
        // Mengambil teks baru yang ingin ditulis ke file (indeks ke depan)
      const newText = kata.slice(indexTask + 1).join(' ');

      // Menulis teks baru ke file
      fs.writeFileSync(fileName, newText, 'utf8');
      
      // Membaca dan mencetak isi file yang sudah diperbarui
      const updatedFileContent = fs.readFileSync(fileName, 'utf8');
      console.log(`Isi file ${fileName} telah diperbarui: ${updatedFileContent}`);
      
      // Mengirim balasan ke pengirim pesan
      const chat = await msg.getChat();
      chat.sendMessage(`Isi file \n **${fileName}** \ntelah diperbarui: \n **${updatedFileContent}**`);

    }



    if (pesan_lower.includes(`,gpt`)) {
      const kata = pesan_lower.split(' ');
      const indeksGPT = kata.indexOf(',gpt');

      if (indeksGPT !== -1 && indeksGPT < kata.length - 1) {
        const pertanyaan = kata.slice(indeksGPT + 1).join(' '); // Mengambil semua kata setelah 'gpt'
        console.log(pertanyaan);
        //runCompletion(pertanyaan).then(result => msg.reply(result));

        const result = await runCompletion(pertanyaan);
        await msg.reply(result);
        console.log(result)
      }
    }

    if (msg.body === '!siapa kamu') {
      client.sendMessage(msg.from, 'Saya adalah bot punya rio 🥰');
    }

    // Cek apakah pengirim pesan adalah admin grup
    if (msg.body === `${config.prefix}everyone`) {
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

    //=========================================================
    if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.hasMedia) {
          const attachmentData = await quotedMsg.downloadMedia();
          client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.',quotedMsg });
      }}

    if (msg.body === 't') {
      var imageBuffer = MessageMedia.fromFilePath('1.png');
                client.sendMessage(msg.from, imageBuffer, {
                    sendMediaAsSticker: true,
                    stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                    stickerAuthor: config.author // Sticker Author = Edit in 'config/config.json'
                }).then(() => {
                    client.sendMessage(msg.from, "*[✅]* Successfully!");
                });
    }
    if (msg.body === 'i') {
      var media = MessageMedia.fromFilePath('1.png');
      await client.sendMessage(msg.from, media, { isViewOnce: true, mediaType: 'image/png' });
    }
  if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
    const quotedMsg = await msg.getQuotedMessage();

    quotedMsg.reply(`
        ID: ${quotedMsg.id._serialized}
        Type: ${quotedMsg.type}
        Author: ${quotedMsg.author || quotedMsg.from}
        Timestamp: ${quotedMsg.timestamp}
        Has Media? ${quotedMsg.hasMedia}
    `);}
      if (msg.body === `${config.prefix}bkp`) {
        gachawaifu(client, msg,true); // Memanggil fungsi dari file gacha.js
      }
      if (msg.body === `${config.prefix}waifu`) {
        gachawaifu(client, msg,false); // Memanggil fungsi dari file gacha.js
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
    if (pesan_lower.includes(`${config.prefix}ai`)) {
      const kata = pesan_lower.split(' ');
      const indeksAi = kata.indexOf(`${config.prefix}ai`);
      if (indeksAi !== -1 && indeksAi < kata.length - 1) {
        const promptText = kata.slice(indeksAi + 1).join(' ');
        runReplicate(promptText, msg); // Memanggil fungsi dari file gacha.js
      }
    }
    /*if (msg.body === ',s') {
        if (msg.hasMedia) {
            const attachmentData = await msg.downloadMedia();
            if (attachmentData.mimetype.includes('image')) {
                await client.sendMessage(msg.from, attachmentData, { sendMediaAsSticker: true });
            } else {
                await msg.reply('Maaf harus menyertakan gambar (︶︹︺)');
            }}}*/
      if (msg.body.startsWith(`${config.prefix}s`)) {
        let media;
        if (msg.hasMedia) {
          media = await msg.downloadMedia();
        } else if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          if (quotedMsg.hasMedia) {
            media = await quotedMsg.downloadMedia();
          }
        }
      
        if (media) {
          msg.reply(media, null, {
            sendMediaAsSticker: true,
            stickerName: config.name,
            stickerAuthor: config.author
          }).then(() => {
            client.sendMessage(msg.from, "*[✅]* Successfully!");
          });
        } else {
          client.sendMessage(msg.from, "*[❎]* Failed!");
        }
      }
      if (msg.body == `${config.prefix}ti`) {
        const quotedMsg = await msg.getQuotedMessage(); 
        if (msg.hasQuotedMsg && quotedMsg.hasMedia) {
            client.sendMessage(msg.from, "*[⏳]* Loading..");
            try {
                const media = await quotedMsg.downloadMedia();
                msg.reply(media).then(() => {
                    client.sendMessage(msg.from, "*[✅]* Successfully!");
                });
            } catch {
                client.sendMessage(msg.from, "*[❎]* Failed!");
            }
        } else {
            client.sendMessage(msg.from, "*[❎]* reply gambarnya dulu!");
        }}
        if (msg.body === `${config.prefix}isviewonce` && msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          if (quotedMsg.hasMedia) {
              const media = await quotedMsg.downloadMedia();
              await client.sendMessage(msg.from, media, { isViewOnce: true });
          }}
        if (msg.body === '!buttons') {
          const button = new Buttons('Button body', [{ body: 'bt1', url: 'https://www.bing.com/' }, { body: 'bt2', url: 'https://www.google.com/' }, { body: 'bt3', url: 'https://www.yahoo.com/' }], 'title', 'footer');
          await client.sendMessage(msg.from, button);
        }
        
        if (msg.body === '!mediainfo' && msg.hasMedia) {
          const attachmentData = await msg.downloadMedia();
          msg.reply(`
              *Media info*
              MimeType: ${attachmentData.mimetype}
              Filename: ${attachmentData.filename}
              Data (length): ${attachmentData.data.length}
          `);
      } if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
  
          quotedMsg.reply(`
              ID: ${quotedMsg.id._serialized}
              Type: ${quotedMsg.type}
              Author: ${quotedMsg.author || quotedMsg.from}
              Timestamp: ${quotedMsg.timestamp}
              Has Media? ${quotedMsg.hasMedia}
          `);
      }
      if (msg.body === ',vi' && msg.hasMedia) {
        const attachMedia =  await msg.downloadMedia();
        unzipToVideo(client,msg,attachMedia);
      }
      if (msg.body === `${config.prefix}nobg`) {
        let media;
        if (msg.hasMedia) {
          media = await msg.downloadMedia();
        } else if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          if (quotedMsg.hasMedia) {
            media = await quotedMsg.downloadMedia();
          }
        }
        if (media) {
          const extension = media.mimetype.split('/')[1];
          const randomName = Math.random().toString(36).substring(7);
          const filename = `${randomName}.${extension}`;
          const filepath = path.join(__dirname, './fitur/downloads', filename);
          fs.writeFileSync(filepath, Buffer.from(media.data, 'base64'));
          noBackgroundsend(filepath, filename)
            .then(async (pathnobg) => {
              if (typeof pathnobg === 'string') {
                try {
                  await fs.promises.access(pathnobg);
                  const media = MessageMedia.fromFilePath(pathnobg);
                  msg.reply(media, null, {
                    sendMediaAsDocument: true
                  });
      
                  // Hapus file setelah mengirimnya
                  fs.unlinkSync(pathnobg);
                } catch (error) {
                  console.error(error);
                  msg.reply('Gagal menghapus latar belakang.');
                }
              } else {
                console.error('pathnobg bukan string:', pathnobg);
                msg.reply('Gagal menghapus latar belakang.');
              }
            })
            .catch((error) => {
              console.error(error);
              msg.reply('Terjadi kesalahan saat menghapus latar belakang.');
            });
        }
      }
      
      
      
} catch (error) {
    console.error('Error:', error);
  }
});
