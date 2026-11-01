# untukmu. 🎂

**Buku kejutan ulang tahun, dibuat seperti hadiah Hari Girlfriend.**

Website ini sekarang mengikuti alur buku interaktif: gerbang “kamu siapa?”, amplop, surat beranimasi mesin ketik, waktu bareng, maskot Eren yang bisa diajak main, buket mawar berisi pesan rahasia, album foto, kuis manis, tahan hati untuk membuka video, lalu sertifikat ulang tahun yang bisa ditandatangani dan diunduh.

Dibangun dengan HTML, CSS, JavaScript dan Vite. Tanpa database, tanpa akun, tanpa upload. Semua progres hanya tersimpan di browser perangkat yang membuka.

> Foto dan video pasangan **belum diisi**. Bingkai sementara memakai penanda sederhana. Ganti dengan momen kalian sebelum hadiahnya dikirim.

## Jalankan di komputer

Instal **Node.js 22.12+** (atau Node 20.19+), buka folder proyek di VS Code, lalu:

```bash
npm install
npm run dev
```

Buka **http://localhost:3000**. Perubahan kode langsung terlihat di browser. Untuk berhenti: `Ctrl + C`.

```bash
npm run build     # membuat versi produksi di dist/
npm run preview   # mencoba hasil build secara lokal
npm test          # pemeriksaan konfigurasi dan aset
npm run test:e2e  # tes interaksi browser (opsional, perlu Playwright)
```

## Alur buku

| Halaman | Isi | Interaksi |
| --- | --- | --- |
| Sampul | Gerbang “Kamu Sinta Liya?” | Tombol “Bukan” kabur, “Iya” membuka buku |
| Pembuka | Nama pasangan | Ketuk amplop |
| Ucapan | Happy Birthday + surat | Mesin ketik, surat harus dibaca |
| Waktu Kita | Hitung hari/jam/menit/detik | Fakta lucu tentang hubungan |
| Eren | Maskot Eren bawa kue | Colek, peluk, kasih kue, dandanin, bisikin rahasia |
| Mawar | Buket mawar merah | Petik mawar, baca pesan rahasia |
| Album | Foto kalian | Buka foto, coba foto lokal |
| Kuis | Pertanyaan manis | Semua jawaban benar |
| Isi Hati | Hati kosong | Tahan sampai 100% atau lewati animasi |
| Video | Film kalian | Tirai terbuka, video diputar |
| Sertifikat | Sertifikat Birthday | Tanda tangan, preview, download PNG |
| Penutup | Kalimat terakhir | Kirim sayang, ulang dari awal |

Beberapa halaman **mengunci tombol Lanjut** sampai interaksinya selesai. Ini sengaja, supaya hadiahnya dibaca pelan-pelan. Tombol Kembali tetap bebas. Progres tersimpan di `localStorage`, jadi refresh tidak mengulang dari awal. Tombol **Ulang dari awal** di penutup menghapus progres.

## 1. Ubah nama dan isi personal

Buka **`public/config.js`**. Ini pusat semua isi:

| Bagian | Isi |
| --- | --- |
| `recipient` | Nama pasangan |
| `sender` | Nama kamu |
| `jadian` | Tanggal mulai hubungan, untuk halaman Waktu Kita |
| `gate` | Pertanyaan gerbang dan tombol yang kabur |
| `opening` | Halaman amplop |
| `typed` | Kalimat mesin ketik |
| `letter` | Surat lengkap |
| `mascot` | Nama, gambar, dan dialog Eren |
| `roses` | Pesan di tiap mawar |
| `photos` | Foto, caption, tanggal, pesan rahasia |
| `quiz` | Pertanyaan dan jawaban manis |
| `heart` | Teks tahan hati |
| `video` | Video dan sampul |
| `music` | Musik latar opsional |
| `certificate` | Isi sertifikat dan tanda tangan kamu |
| `closing` | Penutup dan balasan sayang |

Contoh:

```js
recipient: 'Sinta Liya',
sender: 'Ibah Misbah',
jadian: '2026-01-01T00:00:00',
```

Ubah teks di antara tanda kutip. Jangan menghapus koma di akhir baris. Simpan dengan `Ctrl + S`.

## 2. Masukkan foto

1. Salin foto ke **`public/media/photos/`**, misalnya `foto-01.jpg`.
2. Buka `public/config.js`, cari `photos`.
3. Isi `src`:

```js
{
  src: '/media/photos/foto-01.jpg',
  alt: 'Kita makan es krim setelah hujan',
  caption: 'Hujan, es krim, dan kamu.',
  date: '12 JUNI 2026',
  secret: 'Catatan kecil di balik foto ini.',
},
```

Path dimulai `/media/...`, **bukan** `/public/media/...`. Nama file dan huruf besar/kecil harus sama persis.

- Format: JPG, PNG, WebP, AVIF, GIF.
- Saran: di bawah 2 MB per foto.
- Jumlah foto mengikuti array `photos`.
- Tombol **Coba foto kamu** hanya pratinjau sementara, bukan upload. Maksimum 15 MB per foto. Hilang saat refresh.

## 3. Masukkan video

1. Salin video ke **`public/media/video/`**, misalnya `kita.mp4`.
2. Ubah `video.src`:

```js
video: {
  src: '/media/video/kita.mp4',
  poster: '/media/photos/sampul-kita.jpg',
  note: 'Sebuah film pendek tentang kita.',
  delay: 2000,
},
```

Rekomendasi: **MP4 H.264 + AAC**, 720p/1080p, usahakan di bawah 50 MB. Untuk file besar, gunakan hosting/CDN dengan URL direct-file HTTPS. Jangan pakai link halaman YouTube.

Tombol **Coba video lokal** memutar file dari perangkat tanpa upload, maksimum 250 MB. Pratinjau hilang saat refresh.

## 4. Musik

Secara bawaan ada melodi kotak musik lembut dari Web Audio. Musik baru mulai setelah interaksi pertama, sesuai aturan browser.

Untuk lagu sendiri:

```js
music: {
  src: '/media/music/lagu-kita.mp3',
  autoplay: true,
  volume: 0.6,
},
```

Gunakan lagu yang kamu punya izinnya. Musik otomatis berhenti saat video diputar, lalu melanjutkan setelah video selesai/dijeda.

## 5. Tanda tangan sertifikat

Sertifikat bisa diunduh sebagai PNG **2000×1414**.

- Tanda tangan penerima ditulis langsung di layar (mouse/jari).
- Tanda tangan kamu bisa berupa gambar transparan:

```js
certificate: {
  signatureSrc: '/media/signature.png',
},
```

Kalau kosong, nama kamu ditulis dengan font tulisan tangan.

## Struktur proyek

```text
index.html                 ★ Seluruh halaman buku
public/config.js           ★ Semua teks dan pengaturan personal
public/media/              ★ Foto, video, musik, tanda tangan
src/main.js                Logika buku, tugas, sertifikat, musik
src/styles.css             Tema gelap romantis, mawar, emas
src/audio.js               Musik kotak musik / file musik
tests/                     Tes konfigurasi dan browser
vercel.json                Konfigurasi Vercel
```

## Deploy ke Vercel

1. Push proyek ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new), import repo.
3. Framework Preset: **Vite** (atau biarkan terdeteksi).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

Kalau memakai branch `arena/e478c91e-website-happybrithday`, jadikan branch itu **Production Branch** di pengaturan Vercel.

## Privasi

- Tidak ada analytics, backend, akun, atau upload.
- Foto/video lokal hanya pratinjau di browser.
- Progres, tanda tangan, dan pengaturan musik tersimpan di `localStorage` perangkat.
- `robots.txt` dan meta `noindex` membantu agar tidak muncul di pencarian, tetapi siapa pun yang punya link tetap bisa membuka.

## Catatan

Eren adalah ilustrasi penggemar, bukan aset resmi Attack on Titan. Website ini hadiah personal, bukan produk komersial.
