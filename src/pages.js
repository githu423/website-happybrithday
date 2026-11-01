/* The eight chapters of the gift. Change labels/order here if you like.
   Keep the IDs matched to the data-page sections in index.html. */
export const PAGES = [
  { id: 'home', label: 'Pembuka', description: 'Sebuah hadiah kecil dariku.', icon: 'mail-heart', nextLabel: 'Mulai cerita', group: 'home' },
  { id: 'reasons', label: 'Alasan sayang', description: 'Buka catatan, simpan favoritmu.', icon: 'sun', nextLabel: 'Lihat album', group: 'home' },
  { id: 'memories', label: 'Album kita', description: 'Cerita kecil dalam bingkai.', icon: 'camera', nextLabel: 'Putar film', group: 'memories' },
  { id: 'film', label: 'Film kita', description: 'Momen baik, layak diulang.', icon: 'film', nextLabel: 'Buat harapan', group: 'film' },
  { id: 'wish', label: 'Harapan', description: 'Tiup lilin, simpan satu harapan.', icon: 'sparkles', nextLabel: 'Baca surat', group: 'wish' },
  { id: 'letter', label: 'Surat cinta', description: 'Segelnya hanya untukmu.', icon: 'mail-heart', nextLabel: 'Ambil kupon', group: 'wish' },
  { id: 'coupons', label: 'Kupon sayang', description: 'Gosok sedikit, dapat kejutan.', icon: 'ticket', nextLabel: 'Ke penutup', group: 'wish' },
  { id: 'closing', label: 'Penutup', description: 'Satu pelukan sebelum selesai.', icon: 'heart', nextLabel: 'Baca dari awal', group: 'wish' },
];

export function pageFromHash(hash) {
  const id = String(hash || '').replace(/^#\/?/, '').split('?')[0];
  if (id === 'surprises') return 'wish'; // Old links still open a real gift.
  return PAGES.some((page) => page.id === id) ? id : 'home';
}

export function navigationState(id) {
  const index = Math.max(0, PAGES.findIndex((page) => page.id === id));
  return {
    index,
    current: PAGES[index],
    previous: index > 0 ? PAGES[index - 1] : null,
    next: PAGES[(index + 1) % PAGES.length],
    total: PAGES.length,
  };
}
