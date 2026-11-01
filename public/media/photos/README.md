# Foto kalian

Salin foto ke folder ini, misalnya `kita-01.jpg`.
Kemudian buka `public/config.js` dan isi bagian `photos`:

```js
{
  src: '/media/photos/kita-01.jpg',
  alt: 'Kita makan es krim setelah hujan',
  caption: 'Hujan, es krim, dan kamu.',
  date: '12 JUNI 2026',
  secret: 'Catatan kecil saat foto dibuka.',
}
```

- Nama file harus sama persis, termasuk huruf besar/kecil.
- JPG, PNG, WebP, AVIF, atau GIF. WebP/JPG paling praktis.
- Saran: kompres sampai di bawah 2 MB per foto.
- Semua rasio bisa; thumbnail album memakai crop persegi, dialog foto menampilkan lebih utuh.
- Jangan ganti nama folder. Awalan `/media/...` benar: folder `public` tidak ditulis di URL.
- Tambah atau kurangi objek dalam array `photos` untuk mengubah jumlah bingkai.
- Tombol **Coba foto kamu** hanya pratinjau sementara di browser, bukan upload permanen.

Tidak ada foto pasangan contoh di website ini. Bingkai kosong memakai penanda sederhana.
