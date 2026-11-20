// ============================================
// SOUND CONTROLLER - WEB AUDIO API
// Bộ tổng hợp âm thanh không cần tải file ngoài
// ============================================

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (!this.initialized) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
                this.initialized = true;
            } catch (e) {
                console.warn('Web Audio API not supported', e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Âm thanh bật nhảy boing boing
    playHop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Hiệu ứng lò xo boing: tần số tăng nhanh rồi giảm nhẹ
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    // Âm thanh trả lời đúng (Ting ting vui tươi)
    playCorrect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Hợp âm Đô trưởng)

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);

            gain.gain.setValueAtTime(0, now + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.32);
        });
    }

    // Âm thanh trả lời sai (Thud / Buzz nhẹ)
    playWrong() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Âm thanh đếm ngược (3, 2, 1, Bắt đầu!)
    playCountdownBeep(isStart = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        if (!isStart) {
            // Beep ngắn
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now); // A4
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            // Go! - Hợp âm cao rộn ràng
            [523.25, 659.25, 783.99, 1046.50].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq * 1.5, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.65);
            });
        }
    }

    // Nhạc kèn chiến thắng (Victory Fanfare)
    playVictory() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { note: 523.25, duration: 0.15, time: 0 },       // C5
            { note: 523.25, duration: 0.15, time: 0.15 },    // C5
            { note: 523.25, duration: 0.15, time: 0.30 },    // C5
            { note: 659.25, duration: 0.40, time: 0.45 },    // E5
            { note: 587.33, duration: 0.20, time: 0.85 },    // D5
            { note: 659.25, duration: 0.20, time: 1.05 },    // E5
            { note: 783.99, duration: 0.70, time: 1.25 }     // G5
        ];

        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.note, now + item.time);

            gain.gain.setValueAtTime(0, now + item.time);
            gain.gain.linearRampToValueAtTime(0.35, now + item.time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + item.time);
            osc.stop(now + item.time + item.duration + 0.05);
        });
    }
}

const soundManager = new SoundController();
window.soundManager = soundManager;
