/* Pointer/touch scratch card with a complete keyboard alternative. */
export class ScratchCard {
  constructor(canvas, onReveal) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.onReveal = onReveal;
    this.revealed = true;
    this.drawing = false;
    this.last = null;
    this.lastCheck = 0;
    this.width = 0;
    this.height = 0;
    this.ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    canvas.addEventListener('pointerdown', (event) => this.begin(event), options);
    canvas.addEventListener('pointermove', (event) => this.move(event), options);
    canvas.addEventListener('pointerup', (event) => this.end(event), options);
    canvas.addEventListener('pointercancel', (event) => this.end(event), options);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
  }

  reset() {
    this.revealed = false;
    this.drawing = false;
    this.canvas.hidden = false;
    this.canvas.classList.remove('is-revealed');
    this.width = 0;
    this.resize();
  }

  resize() {
    if (this.revealed || !this.context) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    if (Math.abs(rect.width - this.width) < 1 && Math.abs(rect.height - this.height) < 1) return;
    let previous = null;
    if (this.width) {
      previous = document.createElement('canvas');
      previous.width = this.canvas.width;
      previous.height = this.canvas.height;
      previous.getContext('2d').drawImage(this.canvas, 0, 0);
    }
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    this.paint();
    if (previous) this.context.drawImage(previous, 0, 0, this.width, this.height);
  }

  paint() {
    const ctx = this.context;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#dce2cc';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = '#b8c3a180';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.strokeRect(13, 13, this.width - 26, this.height - 26);
    ctx.setLineDash([]);
    ctx.fillStyle = '#b5c09d75';
    ctx.font = '19px Georgia';
    ctx.textAlign = 'center';
    for (let y = 40; y < this.height - 35; y += 41) {
      for (let x = 34; x < this.width - 20; x += 44) {
        ctx.fillText((Math.round(x + y) % 3) ? '·' : '♡', x, y);
      }
    }
    ctx.fillStyle = '#6f805e';
    ctx.font = '500 34px "Caveat Variable", cursive';
    ctx.fillText('Sedikit usaha,', this.width / 2, this.height / 2 - 25);
    ctx.fillText('sedikit kejutan.', this.width / 2, this.height / 2 + 10);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  point(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  begin(event) {
    if (this.revealed || !this.context || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    this.drawing = true;
    this.canvas.setPointerCapture(event.pointerId);
    this.last = this.point(event);
    this.stroke(this.last, this.last);
  }

  move(event) {
    if (!this.drawing || this.revealed) return;
    event.preventDefault();
    const point = this.point(event);
    this.stroke(this.last, point);
    this.last = point;
    if (performance.now() - this.lastCheck > 140) {
      this.lastCheck = performance.now();
      this.check();
    }
  }

  stroke(from, to) {
    this.context.beginPath();
    this.context.moveTo(from.x, from.y);
    this.context.lineTo(to.x + 0.1, to.y + 0.1);
    this.context.stroke();
  }

  end(event) {
    if (!this.drawing) return;
    this.drawing = false;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.check();
  }

  check() {
    if (this.revealed) return;
    const { data, width, height } = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let transparent = 0;
    let samples = 0;
    const step = Math.max(4, Math.round(16 * this.ratio) * 4);
    for (let y = 0; y < height; y += Math.round(16 * this.ratio)) {
      for (let x = 0; x < width; x += Math.round(16 * this.ratio)) {
        if (data[(y * width + x) * 4 + 3] < 80) transparent++;
        samples++;
      }
    }
    if (samples && transparent / samples > 0.42) this.reveal();
  }

  reveal() {
    if (this.revealed) return;
    this.revealed = true;
    this.drawing = false;
    this.canvas.classList.add('is-revealed');
    this.onReveal();
  }

  destroy() {
    this.controller.abort();
    this.resizeObserver.disconnect();
  }
}
