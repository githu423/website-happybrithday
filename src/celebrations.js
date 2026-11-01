const colors = ['#bf8178', '#d7aa91', '#97a583', '#e0c287', '#f3dfc4', '#73866b'];
let activeAnimation = 0;

export function celebrate({ x, y, container = null, count = 75 } = {}) {
  cancelAnimationFrame(activeAnimation);
  document.querySelectorAll('.temporary-confetti').forEach((canvas) => canvas.remove());
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let canvas = document.getElementById('confetti-canvas');
  const root = container || document.body;
  if (container) {
    canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas temporary-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.top = `${container.scrollTop}px`;
    root.append(canvas);
  }
  const width = container ? container.clientWidth : window.innerWidth;
  const height = container ? container.clientHeight : window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext('2d');
  if (!context) { canvas.remove(); return; }
  context.scale(ratio, ratio);
  const originX = x ?? width / 2;
  const originY = y ?? (container ? container.scrollTop + height * 0.5 : height * 0.55);
  const particles = Array.from({ length: count }, () => ({
    x: originX, y: originY,
    vx: (Math.random() - 0.5) * 11,
    vy: -4 - Math.random() * 8,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.14,
    size: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    heart: Math.random() > 0.4,
  }));
  const start = performance.now();
  let last = start;
  const draw = (now) => {
    const delta = Math.min((now - last) / 16.67, 2);
    last = now;
    const age = now - start;
    context.clearRect(0, 0, width, height);
    context.globalAlpha = Math.max(0, 1 - Math.max(0, age - 1400) / 1100);
    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 0.13 * delta;
      particle.vx *= 0.994;
      particle.rotation += particle.spin * delta;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      const size = particle.size;
      if (particle.heart) {
        context.beginPath();
        context.moveTo(0, size * 0.8);
        context.bezierCurveTo(-size * 1.8, -size * 0.3, -size * 0.7, -size * 1.4, 0, -size * 0.5);
        context.bezierCurveTo(size * 0.7, -size * 1.4, size * 1.8, -size * 0.3, 0, size * 0.8);
        context.fill();
      } else {
        context.fillRect(-size / 2, -size / 2, size, size * 0.55);
      }
      context.restore();
    }
    if (age < 2500) activeAnimation = requestAnimationFrame(draw);
    else {
      context.clearRect(0, 0, width, height);
      if (container) canvas.remove();
    }
  };
  activeAnimation = requestAnimationFrame(draw);
}
