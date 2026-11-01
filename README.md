# untukmu. ♡

**Sebuah hadiah kecil. Untuk rasa yang besar.**

Website kejutan ulang tahun berbahasa Indonesia untuk pasangan: scrapbook romantis, lucu, dan manis dengan ilustrasi Eren Yeager yang membawa kue. Dikemas dalam **8 halaman terpisah, bukan satu halaman panjang yang di-scroll**, lalu dibungkus satu permainan kecil: **Misi Rahasia Eren**. Setiap halaman punya interaksi sendiri, menyimpan pesan rahasia, dan bisa memberi satu stempel. Kumpulkan enam stempel untuk membuka hadiah terakhir di halaman penutup. Navigasi tidak pernah dikunci; misi ini lapisan bermain, bukan syarat untuk menjelajah. Dibangun dengan HTML, CSS, JavaScript dan Vite. Tanpa database, tanpa akun pasangan, tanpa layanan upload, dan tanpa autoplay musik.

> Foto dan video pasangan **belum diisi sesuai permintaan**. Bingkai berisi ilustrasi penanda yang dibuat khusus, bukan foto pasangan orang lain. Ganti dengan momen kalian sebelum hadiahnya dikirim.

## Jalankan di komputer

Instal **Node.js 22.12+** (atau Node 20.19+), buka folder proyek di VS Code, lalu jalankan di terminal:

```bash
npm install
npm run dev
```

Buka alamat yang muncul, biasanya **http://localhost:3000**. Perubahan kode langsung terlihat di browser. Untuk berhenti: `Ctrl + C`.

```bash
npm run build     # membuat versi produksi di dist/
npm run preview   # mencoba hasil build secara lokal
npm test          # pemeriksaan konfigurasi dan aset
```

## Delapan halaman, delapan kejutan

| Halaman | Alamat | Interaksi |
| --- | --- | --- |
| 01 · Pembuka | `/#home` | Klik catatan misi Eren, buka briefing misi rahasia |
| 02 · Alasan sayang | `/#reasons` | Balik kartu 3D untuk pesan rahasia, simpan favorit → stempel |
| 03 · Album kita | `/#memories` | Perbesar foto, balik polaroid untuk catatan rahasia → stempel |
| 04 · Film kita | `/#film` | Sobek tiket bioskop, hitung mundur 3-2-1, putar video → stempel |
| 05 · Harapan | `/#wish` | Tulis harapan privat, tiup tiga lilin, harapan jadi bintang → stempel |
| 06 · Surat cinta | `/#letter` | Buka segel amplop, baca, simpan surat, peluk balik → stempel |
| 07 · Kupon sayang | `/#coupons` | Pilih kupon, gosok, dan unduh PNG → stempel |
| 08 · Penutup | `/#closing` | Lihat langit stempel, buka hadiah terakhir, unduh Birthday Pass |

Gunakan **Kembali / Lanjut**, titik halaman di bawah, atau tombol **Halaman** di header. Di desktop, menu atas juga bisa dipakai. Tombol panah kiri/kanan pada keyboard membalik halaman ketika fokus tidak sedang berada pada kontrol interaktif. Link langsung seperti `/#letter` dan tombol Back browser tetap berfungsi. Link lama `/#surprises` diarahkan ke Harapan.

Hanya satu halaman yang tampil pada satu waktu. Tidak ada scroll panjang antarbagian; pada layar yang sangat pendek atau teks personal yang panjang, isi halaman boleh di-scroll secara terpisah agar tombol dan pesan tidak terpotong. Header dan navigasi tetap terlihat. Foto/video pratinjau tetap tersimpan saat berpindah halaman, tetapi hilang saat browser dimuat ulang. Video otomatis dijeda saat meninggalkan halaman Film.

Ini satu aplikasi Vite dengan rute hash, bukan delapan file HTML terpisah. Tidak diperlukan konfigurasi rewrite tambahan di Vercel. Urutan dan label halaman ada di `src/pages.js`; jangan mengubah ID tanpa menyesuaikan section di `index.html`.

## Misi Rahasia Eren

Tombol misi di header (`0/6`) membuka briefing Eren. Ada enam stempel opsional:

1. Balik satu kartu alasan di halaman 02.
2. Balik satu polaroid di lightbox album, halaman 03.
3. Sobek tiket bioskop di halaman 04.
4. Tiup lilin di halaman 05.
5. Buka segel surat di halaman 06.
6. Gosok/buka satu kupon di halaman 07.

Stempel tersimpan di `localStorage` perangkat (`untukmu:mission-stamps`), jadi progres tidak hilang saat refresh. Tombol **Ulangi misi dari awal** di briefing menghapus stempel tanpa menghapus surat, kupon, atau harapan. Setelah enam stempel terkumpul, halaman penutup membuka **hadiah terakhir**: pesan khusus Eren dan **Birthday Pass** PNG 1200×760 yang bisa diunduh. Semua halaman tetap bisa dibuka sejak awal, meskipun belum ada stempel.

Harapan privat di halaman 05 juga hanya disimpan di perangkat (`untukmu:private-wish`). Kalau diisi, ia muncul sebagai satu bintang kecil di langit penutup. Tidak ada teks harapan yang dikirim ke server, analytics, atau pihak ketiga.

## 1. Ubah nama dan pesan dulu

Buka **`public/config.js`**. Ini pusat semua isi personal:

| Bagian | Isi |
| --- | --- |
| `recipient` | Nama / panggilan pasangan, misalnya `Nadia` |
| `sender` | Nama kamu, misalnya `Dimas` |
| `hero` | Judul dan pesan pembuka |
| `reasons` | Kartu alasan sayang; `secret` adalah pesan di balik kartu |
| `photos` | Foto, caption, tanggal; `secret` adalah catatan di balik polaroid |
| `video` | Video dan sampulnya |
| `music` | Lagu kalian, opsional |
| `letter` | Isi surat lengkap |
| `wish` | Harapan setelah lilin ditiup |
| `coupons` | Kupon pelukan, kencan, atau kejutan lain |
| `mission` | Briefing Eren, hadiah terakhir, dan catatan Birthday Pass |
| `footer` | Kalimat penutup |

Contoh:

```js
recipient: 'Nadia',
sender: 'Dimas',
```

Ubah teks di antara tanda kutip. Jangan menghapus koma di akhir baris. Kalau teks mengandung tanda kutip yang sama, gunakan backtick atau tambahkan garis miring terbalik. Simpan dengan `Ctrl + S`.

`age: null` berarti umur tidak ditampilkan. Isi angka, misalnya `age: 23`, jika mau. Tidak ada tanggal lahir atau penghitung umur yang mengarang data pasangan.

## 2. Masukkan foto lewat VS Code

1. Siapkan foto kalian, misalnya `foto-01.jpg`, `foto-02.jpg`.
2. Salin ke **`public/media/photos/`**.
3. Buka **`public/config.js`**, cari `photos`.
4. Ubah `src: ''` menjadi alamat file:

```js
{
  src: '/media/photos/foto-01.jpg',
  alt: 'Kita makan es krim setelah hujan',
  caption: 'Hujan, es krim, dan kamu.',
  date: '12 JUNI 2026',
  color: 'rose',
  placeholder: 'first',
  secret: 'Catatan rahasia di balik polaroid ini.',
},
```

5. Ulangi untuk bingkai lain. Simpan, lalu refresh browser.

**Penting:** path dimulai `/media/...`, **bukan** `/public/media/...`. Vite menyalin isi `public` ke akar website saat build. Nama file dan ekstensi harus sama persis, termasuk huruf besar/kecil. `foto-01.JPG` berbeda dari `foto-01.jpg` di server deploy. Gunakan nama tanpa spasi.

- Format: JPG, PNG, WebP, AVIF, GIF.
- Saran ukuran: **di bawah 2 MB per foto**; sekitar 1200–1600 px sudah tajam untuk galeri.
- Foto persegi atau portrait ringan paling cocok. Semua rasio diterima; bingkai melakukan crop, sedangkan lightbox menampilkan foto utuh. Album membalik dua foto per lembar di desktop dan satu foto di HP.
- `caption` adalah tulisan tangan di bawah foto.
- `alt` mendeskripsikan foto untuk pembaca layar dan saat gambar gagal dimuat.
- Jumlah bingkai mengikuti jumlah objek pada array `photos`; boleh ditambah atau dikurangi.
- Ilustrasi penanda otomatis muncul kalau file belum ada, jadi tidak ada gambar rusak saat proses pengisian.

### Coba tanpa mengedit file

Klik **“Coba foto kamu”** pada galeri atau **“Isi foto & video”** di footer. Pilih foto dari perangkat untuk pratinjau. Maksimum 15 MB per foto; jumlah mengikuti bingkai yang tersedia.

**Ini bukan upload:** file tidak dikirim ke server dan tidak disimpan setelah refresh. Untuk hadiah final, tetap salin file ke folder dan isi `config.js`. Tombol **Reset** mengembalikan foto dari konfigurasi.

## 3. Masukkan video

1. Siapkan video, misalnya `kita.mp4`.
2. Salin ke **`public/media/video/`**.
3. Ubah bagian `video` di `public/config.js`:

```js
video: {
  src: '/media/video/kita.mp4',
  poster: '/media/photos/sampul-kita.jpg', // opsional
  title: 'Kalau cerita kita punya film.',
  description: 'Potongan kecil kehidupan yang berarti buat aku.',
  note: 'Sebuah film pendek tentang kita. Disutradarai oleh semesta.',
},
```

**Rekomendasi:** MP4 dengan codec **H.264** dan audio **AAC**, 720p/1080p. Ini paling aman untuk Chrome, Safari, dan browser HP. MOV tidak selalu didukung walaupun ekstensinya terlihat benar.

- Usahakan **di bawah 50 MB** agar nyaman dibuka di HP dan cocok untuk file statis Vercel.
- Kompres video sebelum memasukkannya. Jangan mengandalkan perubahan lebar player untuk mengecilkan file.
- Untuk video panjang atau file besar, gunakan Object Storage/CDN dengan URL **direct file HTTPS**, bukan link halaman YouTube. Player ini memakai HTML `<video>`, bukan embed YouTube.
- Tombol **“Coba video lokal”** memutar file dari perangkat tanpa upload, maksimum 250 MB. Pratinjau hilang saat refresh; codec tetap harus didukung browser.
- Video tidak autoplay. Kontrol bawaan menyediakan play/pause, seek, volume, dan fullscreen sesuai browser.
- Musik website otomatis berhenti saat video dimulai, lalu melanjutkan jika sebelumnya sedang menyala. Saat pindah ke halaman lain, video berhenti dan tidak menyala lagi sendiri.

### Contoh kompres dengan FFmpeg (opsional)

Kalau FFmpeg sudah terinstal di komputer:

```bash
ffmpeg -i video-asli.mov -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 128k -movflags +faststart public/media/video/kita.mp4
```

Perintah ini menghasilkan MP4 720p-ish yang ramah browser. Sesuaikan resolusi/CRF bila diperlukan.

## 4. Musik dan surat

**Musik bawaan:** melodi kotak musik original yang dibuat dengan Web Audio, tanpa file MP3 dan tanpa lagu berhak cipta. Klik **Putar musik** untuk memulai; klik lagi untuk mematikan. Musik berhenti saat tab tidak aktif.

Untuk lagu sendiri, masukkan `lagu-kita.mp3` ke `public/media/music/`, lalu:

```js
music: {
  src: '/media/music/lagu-kita.mp3',
  title: 'Lagu kecil untuk kita',
},
```

Gunakan lagu yang kamu punya izin untuk publikasikan.

**Surat:** edit `letter.paragraphs` di `config.js`. Tombol **Simpan surat ini** menghasilkan file `.txt` berisi surat yang sudah kamu tulis. Tombol **Peluk balik** memberikan animasi pelukan kecil.

**Kupon:** pilih kupon, gosok dengan jari/mouse, atau gunakan **Buka tanpa menggosok**. Tombol **Simpan kuponku** menghasilkan gambar PNG. Kupon adalah hadiah personal untuk ditukar langsung, bukan sistem pembayaran atau kode validasi server.

## 5. Publish ke Vercel

Proyek sudah punya `vercel.json`:

- Framework: **Vite**
- Install: `npm install` (otomatis)
- Build: `npm run build`
- Output: **`dist`**
- Node: **22.x** disarankan

### Cara paling mudah: lewat GitHub + dashboard

1. Pastikan foto, video, nama, dan surat final sudah masuk proyek.
2. Push proyek ke repository GitHub milikmu. Jika mengimpor branch `arena/e478c91e-website-happybrithday`, pilih branch itu sebagai Production Branch di Settings → Environments, atau jadikan branch tersebut default branch repository. Branch `main` awal tidak berisi website delapan halaman.
3. Buka **vercel.com**, masuk ke akunmu.
4. Pilih **Add New → Project**, lalu **Import** repository ini.
5. Vercel membaca `vercel.json`. Pastikan framework Vite, build `npm run build`, output `dist`.
6. Tidak ada environment variable atau API key yang dibutuhkan.
7. Klik **Deploy**, tunggu sampai selesai.
8. Buka URL `https://nama-proyek.vercel.app`, coba di HP, lalu kirim ke pasangan.

Setelah terhubung, perubahan yang di-push ke branch produksi akan men-deploy ulang. Kalau mengubah media dengan nama file yang sama, refresh keras atau buka tab samaran untuk melewati cache browser.

### Alternatif: Vercel CLI

Di terminal dari folder proyek:

```bash
npx vercel login
npx vercel
```

Ikuti petunjuk untuk menautkan proyek dan coba preview deployment. Untuk produksi:

```bash
npx vercel --prod
```

Jangan menaruh password/token Vercel di kode atau chat. Jangan commit folder `.vercel`, `.env`, atau `node_modules` (sudah diabaikan Git).

**Status proyek ini:** siap di-deploy, tetapi belum dipublikasikan ke akun Vercel mana pun. Tidak ada akun yang diakses tanpa koneksi/otorisasi pengguna.

## Privasi dan ekspektasi

- Tidak ada analytics, backend, database, atau upload file.
- Pratinjau media lokal memakai object URL di memori browser. Tidak meninggalkan perangkat.
- Hanya progres kejutan dan alasan favorit yang disimpan di `localStorage` perangkat; bukan isi foto/surat.
- `noindex` dan `robots.txt` meminta mesin pencari tidak mengindeks, tetapi **bukan proteksi password**. Siapa pun yang punya link dapat membuka website dan asetnya.
- Jangan memasukkan rahasia sensitif jika tidak ingin dapat diakses pemegang link.
- Jika perlu akses terbatas sungguhan, aktifkan fitur proteksi deployment berbayar Vercel atau tambahkan autentikasi server terpisah. Jangan menganggap JavaScript sebagai password yang aman.
- Font di-host sendiri, bukan permintaan ke Google Fonts saat runtime. Tidak ada koneksi pihak ketiga kecuali jika kamu sendiri mengisi URL media eksternal.

## Struktur folder

```text
index.html                   Delapan section halaman dan dialog
public/
  config.js                  ★ Semua nama, pesan, foto, video, musik
  favicon.svg
  robots.txt
  THIRD-PARTY-NOTICES.txt
  media/
    eren-birthday.webp        Ilustrasi Eren hasil generate AI
    photos/                  ★ Masukkan foto kalian di sini
    video/                   ★ Masukkan video kalian di sini
    music/                   Lagu opsional
src/
  main.js                    Router halaman dan seluruh interaksi
  pages.js                   ★ Urutan, nama, dan deskripsi 8 halaman
  pages.css                  Layout satu halaman per layar + navigasi
  styles.css                 Tema scrapbook dan komponen visual
  icons.js                   Ikon SVG inline
  illustrations.js           Ilustrasi penanda foto original
  audio.js                   Melodi kotak musik original
  celebrations.js            Confetti, menghormati reduced motion
  scratch.js                 Kupon gosok + alternatif keyboard
tests/                      Pemeriksaan otomatis
vite.config.js               Server lokal untuk preview
vercel.json                  Pengaturan deploy
```

## Fitur dan aksesibilitas

- Delapan halaman terpisah dengan rute hash, tombol Kembali/Lanjut, daftar isi, deep link, serta Back/Forward browser. Tiap halaman punya interaksi sendiri.
- Ilustrasi Eren, polaroid, washi tape, stiker, tipografi editorial, dan palet rose/sage.
- Alasan sayang berganti dengan kontrol dan favorit lokal.
- Album per lembar dengan lightbox, tombol panah, keyboard kiri/kanan, swipe, Escape, dan focus trap dialog native.
- Native video player dengan pesan kesalahan format/path yang jelas.
- Tiga lilin interaktif: klik satu per satu atau tiup semuanya; harapan muncul dan confetti menyala.
- Surat yang dapat diunduh, pelukan animasi, kupon gosok mouse/sentuh dengan alternatif keyboard dan unduhan PNG.
- Progres tiga kejutan tersimpan lokal, tetap boleh dibuka ulang.
- Responsif untuk HP, tablet, desktop; target sentuh, label aksesibilitas, skip link, focus visible.
- `prefers-reduced-motion` dihormati: animasi dekoratif dan confetti dikurangi/dimatikan.
- Tanpa JavaScript, halaman pembuka dan pesan noscript tetap tampil. Navigasi, tujuh halaman kejutan berikutnya, dan pengisian data personal membutuhkan JavaScript.

## Pemeriksaan sebelum dikirim

- [ ] Nama pasangan dan pengirim sudah benar.
- [ ] Semua foto/video muncul di `npm run preview`, bukan hanya dev.
- [ ] Nama file cocok huruf besar/kecilnya.
- [ ] Surat tidak lagi berisi teks yang tidak kamu maksud.
- [ ] Musik hanya mulai setelah klik.
- [ ] Video dapat diputar di browser HP pasangan.
- [ ] Tidak ada informasi sensitif yang tidak ingin dipublikasikan.
- [ ] Ukuran total foto/video masuk akal untuk kuota HP.
- [ ] Sudah dibuka dari URL Vercel, bukan hanya localhost.

## Jika ada masalah

| Gejala | Periksa |
| --- | --- |
| Foto masih ilustrasi | `src` kosong, salah path, nama file/ekstensi tidak cocok, atau file belum ter-push |
| Foto tampil lokal tetapi tidak di Vercel | File belum masuk Git, terabaikan, atau salah huruf besar/kecil |
| Video tidak bisa diputar | Gunakan MP4 H.264 + AAC; pastikan URL direct media, bukan halaman video |
| Perubahan config belum terlihat | Simpan file, restart dev server jika perlu, refresh hasil build setelah `npm run build` |
| Musik tidak berbunyi | Klik tombol musik, cek volume browser dan path MP3; autoplay memang sengaja tidak digunakan |
| Build gagal | Jalankan `npm install` lalu `npm run build`; periksa koma/tanda kutip di `config.js` |
| Ingin mengulang progres hadiah | Hapus data situs `untukmu:*` di DevTools → Application → Local Storage |

## Pengujian pengembang

```bash
npm test                         # validasi konfigurasi, media, dan build config
npx playwright install chromium  # sekali saja untuk browser pengujian
npm run test:e2e                  # pengujian interaksi di browser
npm run build                    # pastikan versi produksi berhasil dibuat
```

Tes browser mencakup delapan halaman dan interaksinya, rute/deep link/Back, album dan keyboard, foto/video lokal, pemutusan video saat pindah halaman, kartu alasan sayang, lilin, surat dan unduhannya, kupon gosok/keyboard dan PNG, musik opt-in, progres hadiah, fallback foto hilang, keamanan teks konfigurasi, serta lebar layar 320–1440 px tanpa scroll dokumen. Dev server dinyalakan otomatis oleh Playwright jika belum berjalan. Untuk menguji URL production/preview, set `TEST_BASE_URL` ke URL tersebut.

## Karya dan lisensi pihak ketiga

Eren Yeager / Attack on Titan milik pemilik karya masing-masing. Website ini hadiah penggemar non-ofisial, bukan merchandise resmi. Ilustrasi pembuka dibuat dengan AI khusus untuk proyek ini. Tidak memakai cuplikan anime atau lagu anime berhak cipta.

Placeholder scrapbook dan melodi kotak musik dibuat original untuk proyek. Ikon mengadaptasi Lucide/Feather; font DM Sans, Fraunces, dan Caveat memakai SIL Open Font License. Lisensi lengkap ada di `public/THIRD-PARTY-NOTICES.txt`. Saat mengganti dengan foto, video, dan lagu sendiri, pastikan kamu memiliki izin penggunaannya.
