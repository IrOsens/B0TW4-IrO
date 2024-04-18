const moment = require('moment-timezone');

function aturJadwal(pesan, waktu) {
  return new Promise((resolve) => {
    const zonaWaktu = 'Asia/Jakarta';
    moment.tz.setDefault(zonaWaktu);
    
    let pesan_aturWaktu = null;
  
    function tugas() {
      pesan_aturWaktu = pesan;
    }
  
    function atur() {
      const sekarang = moment();
      const waktuJadwal = moment(waktu, 'HH:mm');
  
      if (sekarang.isAfter(waktuJadwal)) {
        waktuJadwal.add(1, 'days');
      }
  
      const selisihWaktu = waktuJadwal.diff(sekarang);
  
      setTimeout(function () {
        tugas();
        resolve(pesan_aturWaktu); // Menyertakan pesan_aturWaktu saat memanggil resolve
        atur();
      }, selisihWaktu);
    }
  
    atur();
  });
}

module.exports = aturJadwal;
