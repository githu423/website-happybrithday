/* Small inline icons: no icon CDN, no tracking, no runtime dependency.
   Several outline paths are adapted from Lucide (ISC / MIT).
   See public/THIRD-PARTY-NOTICES.txt. */
const paths = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  'mail-heart': '<rect x="2" y="5" width="20" height="15" rx="2"/><path d="m2 7 10 7L22 7"/><path d="M12 11.5 9.8 9.4c-2-2 .9-4.8 2.2-2.5 1.3-2.3 4.2.5 2.2 2.5Z" fill="currentColor" stroke="none"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8H7.5A2.5 2.5 0 1 1 10 5.5L12 8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5L12 8Z"/>',
  'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
  'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  'arrow-up': '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  wings: '<path d="M11 21C4 18 2 12 2 3c3 4 6 4 9 7V21Zm2 0c7-3 9-9 9-18-3 4-6 4-9 7V21Z"/><path d="m4 7 7 7M4 11l7 6M5 15l6 5m9-13-7 7m7-3-7 6m6-2-6 5M12 5v16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/>',
  coffee: '<path d="M4 8h13v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm13 1h2a3 3 0 1 1 0 6h-2M7 2v3m4-3v3m4-3v3"/>',
  sparkles: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4m-2-2h4M3 18v4m-2-2h4"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4M7 12h10"/>',
  music: '<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
  'image-plus': '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M3 16l5-5 9 10m-4-7 3-3 5 5M19 2v6m-3-3h6"/><circle cx="8.5" cy="7.5" r="1"/>',
  rotate: '<path d="M3 10a9 9 0 1 1 2.5 8M3 3v7h7"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="4"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  clapperboard: '<path d="m4 11 16-4-2-5L2 6l2 5Zm0 0h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9ZM7 5l3 4m3-6 3 4"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 15v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>',
  wind: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z"/><path d="M15 5v2m0 3v2m0 3v2m0 2v-1"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M3 16v5h18v-5"/>',
  settings: '<path d="m9 3-.7 2.4-2.3.8-2.1-.7-1.5 2.6L4 10v3l-1.6 1.9 1.5 2.6 2.1-.7 2.3.8L9 20h3l.7-2.4 2.3-.8 2.1.7 1.5-2.6L17 13v-3l1.6-1.9-1.5-2.6-2.1.7-2.3-.8L12 3H9Z"/><circle cx="10.5" cy="11.5" r="3"/>',
  hand: '<path d="M8 13V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9c0 4-3 7-7 7-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-3l2 3Z"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3"/>',
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.heart}</svg>`;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
    node.setAttribute('aria-hidden', 'true');
  });
}
