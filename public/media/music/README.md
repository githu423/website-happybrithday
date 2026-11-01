# Musik (opsional)

Website sudah punya melodi kotak musik original yang dibuat dengan Web Audio.
Tidak perlu file tambahan dan tidak ada musik yang berjalan sebelum tombol ditekan.

Untuk lagu kalian sendiri, masukkan misalnya `lagu-kita.mp3` ke folder ini,
lalu ubah `music` di `public/config.js`:

```js
music: {
  src: '/media/music/lagu-kita.mp3',
  title: 'Lagu kecil untuk kita',
},
```

Gunakan lagu yang kamu miliki izinnya, terutama untuk website publik.
MP3 lebih kompatibel lintas browser. Kompres sekitar 128 kbps; usahakan < 10 MB.
Musik berhenti ketika video diputar atau tab tidak aktif.
