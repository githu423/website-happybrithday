/* A quiet, original music-box motif. Nothing plays until a person asks.
   Set music.src in public/config.js to use your own licensed audio instead. */
const melody = [
  [523.25, 1], [659.25, 1], [783.99, 2], [659.25, 1], [587.33, 1], [523.25, 2],
  [440, 1], [523.25, 1], [659.25, 2], [587.33, 1], [523.25, 1], [392, 2],
  [523.25, 1], [659.25, 1], [880, 2], [783.99, 1], [659.25, 1], [587.33, 2],
  [523.25, 1], [440, 1], [392, 2], [440, 1], [523.25, 1], [523.25, 3], [0, 3],
];

export class BirthdayMusic {
  constructor(src = '', volume = 0.6) {
    this.src = src;
    this.volume = Math.max(0, Math.min(1, Number(volume) || 0.6));
    this.playing = false;
    this.context = null;
    this.timer = null;
    this.step = 0;
    this.nextTime = 0;
    this.request = 0;
    this.audio = src ? new Audio(src) : null;
    if (this.audio) {
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'none';
    }
  }

  async start() {
    const request = ++this.request;
    try {
      if (this.audio) {
        await this.audio.play();
        if (request !== this.request) { this.audio.pause(); return false; }
      } else {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('Web Audio unavailable');
        if (!this.context) {
          this.context = new AudioContextClass();
          this.master = this.context.createGain();
          this.master.gain.value = 0.14 * this.volume;
          this.master.connect(this.context.destination);
        }
        await this.context.resume();
        if (request !== this.request) return false;
        clearTimeout(this.suspendTimer);
        this.master.gain.cancelScheduledValues(this.context.currentTime);
        this.master.gain.setTargetAtTime(0.14 * this.volume, this.context.currentTime, 0.08);
        this.nextTime = this.context.currentTime + 0.08;
        this.schedule();
        this.timer = setInterval(() => this.schedule(), 150);
      }
      this.playing = true;
      return true;
    } catch (error) {
      if (request === this.request) this.stop();
      throw error;
    }
  }

  schedule() {
    if (!this.context || this.context.state !== 'running') return;
    // Recover gently after a background tab was throttled.
    if (this.nextTime < this.context.currentTime - 0.5) this.nextTime = this.context.currentTime + 0.05;
    while (this.nextTime < this.context.currentTime + 0.4) {
      const [frequency, beats] = melody[this.step % melody.length];
      const duration = beats * 0.48;
      if (frequency) this.note(frequency, this.nextTime, Math.max(1.4, duration * 1.7));
      this.nextTime += duration;
      this.step++;
    }
  }

  note(frequency, time, duration) {
    [1, 2, 3].forEach((harmonic, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.28 / (harmonic * harmonic), time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.03);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }

  stop() {
    this.request++;
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
    if (this.audio) this.audio.pause();
    if (this.context && this.master) {
      const context = this.context;
      this.master.gain.cancelScheduledValues(context.currentTime);
      this.master.gain.setTargetAtTime(0.0001, context.currentTime, 0.04);
      clearTimeout(this.suspendTimer);
      this.suspendTimer = setTimeout(() => {
        if (!this.playing && context.state === 'running') context.suspend().catch(() => {});
      }, 200);
    }
  }

  destroy() {
    this.stop();
    clearTimeout(this.suspendTimer);
    if (this.context) this.context.close().catch(() => {});
    if (this.audio) { this.audio.removeAttribute('src'); this.audio.load(); }
  }
}
