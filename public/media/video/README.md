# Video kalian

Salin video ke folder ini, misalnya `kita.mp4`.
Kemudian ubah bagian `video` di `public/config.js`:

```js
video: {
  src: '/media/video/kita.mp4',
  poster: '/media/photos/sampul-kita.jpg', // opsional
  note: 'Disutradarai oleh semesta.',
  delay: 2000,
},
```

Format rekomendasi: **MP4, codec H.264, audio AAC**, resolusi 720p atau 1080p.
Usahakan di bawah 50 MB agar ringan di HP dan cocok untuk file statis Vercel.
Untuk video panjang/besar, hosting videonya secara terpisah dan gunakan URL HTTPS direct-file yang mendukung pemutaran browser. URL biasa ke halaman YouTube bukan src video; proyek ini memakai native HTML video, bukan embed YouTube.

Nama file bersifat case-sensitive saat deploy. Jangan menaruh spasi di nama file.
Video baru diputar setelah halaman video dibuka dan hitung mundur selesai. Jika browser memblokir suara, video akan dimulai tanpa suara dan pengguna bisa mengetuk untuk menyalakan suara.
Fitur **Coba video lokal** tidak mengunggah file; maksimum 250 MB dan hilang saat refresh.
Untuk file di atas 100 MB, gunakan penyimpanan eksternal/Object Storage, bukan Git.
