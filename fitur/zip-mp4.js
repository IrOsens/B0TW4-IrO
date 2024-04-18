const fs = require('fs').promises;  // Perubahan di sini untuk menggunakan fs.promises
const sharp = require('sharp');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');

const inputZipFilePath = './fitur/sprite.zip';
const outputVideoFilePath = 'output.mp4';
const fps = 12;

async function main() {
  // Ekstrak file ZIP menggunakan adm-zip
  const zip = new AdmZip(inputZipFilePath);
  const extractPath = 'extracted';
  zip.extractAllTo(extractPath, /*overwrite*/ true);

  console.log('ZIP file extracted successfully.');

  // Baca daftar file PNG
  const pngFiles = (await fs.readdir(extractPath)).filter(file => file.endsWith('.png'));

  // Urutkan file PNG berdasarkan nama
  pngFiles.sort((a, b) => {
    const regex = /(\d+)/;
    const aNumber = parseInt(a.match(regex)[0]);
    const bNumber = parseInt(b.match(regex)[0]);
    return aNumber - bNumber;
  });

  // Buat daftar file sementara
  const tempFiles = pngFiles.map((file, index) => `temp_${index + 1}.png`);

  // Ubah setiap file PNG menjadi format video sementara
  await Promise.all(pngFiles.map((file, index) => {
    return sharp(`${extractPath}/${file}`).toFile(tempFiles[index]);
  }));

  // Cek keberadaan file output.mp4
  const isOutputFileExists = await fs.access(outputVideoFilePath).then(() => true).catch(() => false);

  // Gabungkan file sementara menjadi video MP4 menggunakan ffmpeg
  let ffmpegCommand;
  if (isOutputFileExists) {
    ffmpegCommand = `ffmpeg -framerate ${fps} -i temp_%d.png -c:v libx264 -r ${fps} -pix_fmt yuv420p -y ${outputVideoFilePath}`;
  } else {
    ffmpegCommand = `ffmpeg -framerate ${fps} -i temp_%d.png -c:v libx264 -r ${fps} -pix_fmt yuv420p ${outputVideoFilePath}`;
  }

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating MP4 file: ${error.message}`);
      return;
    }

    console.log('MP4 file created successfully.');

    // Hapus file sementara
    tempFiles.forEach(file => fs.unlink(file).catch(() => {}));

    // Hapus folder yang berisi file PNG yang diekstrak
    fs.rm(extractPath, { recursive: true })
      .then(() => console.log('Temporary files and folder deleted.'))
      .catch(err => console.error(`Error deleting temporary files and folder: ${err.message}`));
  });
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
});
