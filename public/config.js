/* ============================================================
   INI TEMPAT SEMUA HAL PERSONAL KAMU ✨
   Ubah teks di antara tanda kutip. Simpan, lalu lihat website.
   Foto       → public/media/photos/
   Video      → public/media/video/
   Musik      → public/media/music/ (opsional)
   Panduan lengkap ada di README.md.
   ============================================================ */
window.BIRTHDAY_CONFIG = {
  // Panggilan sayang dan nama kamu. Tidak perlu tanggal lahir asli.
  recipient: 'Sayang',
  sender: 'Aku yang paling sayang kamu',
  nickname: 'manusia favoritku',
  birthdayLabel: 'Hari milikmu, hari favoritku.',
  age: null, // Contoh: 23. Biarkan null kalau tidak ingin ditampilkan.

  hero: {
    title: 'Dunia lebih indah,',
    highlight: 'karena ada kamu.',
    description: 'Dari sekian banyaknya kebetulan di dunia, bertemu denganmu adalah favoritku. Hari ini, semuanya tentang kamu.',
    note: 'Eren juga datang bawa kue, lho.',
  },

  // Lima alasan kecil. Tambahkan atau kurangi sesukamu.
  reasons: [
    { icon: 'sun', title: 'Kamu itu rumah.', text: 'Bukan tempat, tapi perasaan. Sesederhana ada kamu di dekatku, dan semuanya terasa lebih tenang.' },
    { icon: 'smile', title: 'Ketawamu menular.', text: 'Kadang aku bahkan nggak tahu apa yang lucu. Tapi kalau kamu ketawa, aku ikut. Selalu.' },
    { icon: 'coffee', title: 'Hal kecil jadi berarti.', text: 'Makan biasa, jalan tanpa tujuan, cerita yang diulang-ulang. Bersamamu, yang sederhana jadi istimewa.' },
    { icon: 'heart', title: 'Kamu memilih bertahan.', text: 'Aku tahu nggak semua hari mudah. Terima kasih sudah tetap melangkah. Aku bangga sama kamu.' },
    { icon: 'sparkles', title: 'Kamu, ya kamu.', text: 'Nggak perlu jadi orang lain. Semua versi kamu, termasuk yang sedang berantakan, layak disayang.' },
  ],

  // Masukkan nama file foto kalian. src kosong = ilustrasi placeholder.
  // Gunakan rasio 4:5 atau foto persegi supaya cantik di bingkai.
  photos: [
    { src: '', alt: 'Tempat foto pertama kita', caption: 'Awal dari semua cerita.', date: 'CERITA 01', color: 'rose', placeholder: 'first' },
    { src: '', alt: 'Tempat foto kencan favorit', caption: 'Biasa, tapi bersamamu.', date: 'CERITA 02', color: 'sage', placeholder: 'date' },
    { src: '', alt: 'Tempat foto perjalanan kita', caption: 'Ke mana pun, asal berdua.', date: 'CERITA 03', color: 'blue', placeholder: 'adventure' },
    { src: '', alt: 'Tempat foto momen lucu kita', caption: 'Ketawa sampai lupa waktu.', date: 'CERITA 04', color: 'yellow', placeholder: 'silly' },
    { src: '', alt: 'Tempat foto kecil yang berarti', caption: 'Satu lagi alasan sayang.', date: 'CERITA 05', color: 'lavender', placeholder: 'little' },
    { src: '', alt: 'Tempat foto untuk cerita selanjutnya', caption: 'Masih banyak halaman kosong.', date: 'CERITA 06', color: 'peach', placeholder: 'next' },
  ],

  video: {
    // Contoh: src: '/media/video/kita.mp4'
    // Format MP4 (H.264 + AAC) paling aman untuk semua browser.
    src: '',
    poster: '', // Opsional: '/media/photos/sampul-video.jpg'
    title: 'Kalau cerita kita punya film.',
    description: 'Potongan kecil kehidupan, yang nggak pernah kecil artinya buat aku.',
    note: 'Sebuah film pendek tentang kita. Disutradarai oleh semesta.',
  },

  music: {
    // Kosong = musik kotak musik lembut bawaan (tanpa file tambahan).
    // Isi '/media/music/lagu-kita.mp3' untuk lagu kalian sendiri.
    src: '',
    title: 'Sepotong melodi untukmu',
  },

  letter: {
    greeting: 'Untuk manusia favoritku,',
    paragraphs: [
      'Selamat ulang tahun, Sayang. Aku sempat mikir, hadiah apa yang cukup buat orang yang bikin hidupku terasa lebih hidup? Ternyata, nggak ada yang benar-benar cukup. Tapi aku tetap mau mencoba.',
      'Terima kasih sudah hadir. Untuk cerita-cerita panjangnya, ketawa yang nggak jelas penyebabnya, dan cara kecilmu membuat hari biasa terasa pantas diingat. Aku suka kita. Bahkan di hari ketika kita cuma diam.',
      'Di umur yang baru ini, semoga kamu lebih sering memilih dirimu sendiri, lebih berani mengejar yang kamu mau, dan nggak merasa harus menghadapi semuanya sendirian. Kalau dunia sedang berisik, pulang ya. Kita cari tenang sama-sama.',
      'Nggak perlu janji yang terlalu besar. Cukup satu: masih banyak tempat yang mau kita datangi, banyak foto yang belum diambil, dan banyak ulang tahun yang mau aku rayakan di sampingmu.',
      'Hari ini kamu nggak harus jadi kuat. Kamu cukup jadi kamu, makan kue, dan tahu kalau kamu sangat, sangat disayang.',
    ],
    closing: 'Selalu memilihmu,',
  },

  wish: 'Semoga semesta menjaga semua hal baik di dalam dirimu. Semoga mimpimu menemukan jalan, sedihmu menemukan pelukan, dan tahun barumu penuh alasan untuk tersenyum. Aku akan ada di sana, ikut bertepuk tangan paling keras.',

  coupons: [
    { icon: 'heart', title: 'Pelukan tanpa batas waktu', description: 'Lagi capek? Sini. Nggak perlu cerita dulu, peluk aja.', code: 'PELUK-001' },
    { icon: 'film', title: 'Kamu pilih filmnya', description: 'Aku siap nemenin. Termasuk kalau kamu pilih film yang sudah kita tonton lima kali.', code: 'MOVIE-002' },
    { icon: 'coffee', title: 'Satu kencan, tanpa distraksi', description: 'HP disimpan, dunia dipelankan. Hari itu cuma buat kita berdua.', code: 'DATE-003' },
  ],

  footer: 'Di semua semesta, aku tetap pilih kamu.',
  fanNote: 'Sebuah hadiah penggemar kecil, terinspirasi Eren Yeager dari Attack on Titan. Tidak berafiliasi dengan pemilik karya asli.',
};
