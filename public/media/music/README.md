# Musik (opsional)

Website sudah punya melodi kotak musik original yang dibuat dengan Web Audio.
Musik baru mulai setelah interaksi pertama (misalnya membuka amplop atau menekan tombol musik), sesuai aturan browser.

Untuk lagu kalian sendiri, masukkan misalnya `lagu-kita.mp3` ke folder ini,
lalu ubah `music` di `public/config.js`:

```js
music: {
  src: '/media/music/lagu-kita.mp3',
  autoplay: true,
  volume: 0.6,
},
```

Gunakan lagu yang kamu miliki izinnya, terutama untuk website publik.
MP3 lebih kompatibel lintas browser. Kompres sekitar 128 kbps; usahakan < 10 MB.
Musik berhenti ketika video diputar, lalu melanjutkan setelah video dijeda/selesai.
Tombol 🎵 di pojok kiri atas bisa mematikan/menyalakan musik kapan saja.
