// ==============================================================================
// TRÒ CHƠI HẢI CHIẾN TỌA ĐỘ (COORDINATE NAVAL BATTLE) - ĐỐI KHÁNG TỌA ĐỘ OXY
// Hỗ trợ 2 chế độ: 2 Đội đối kháng (Hạm đội Đỏ vs Hạm đội Xanh) & Cả lớp
// Hỗ trợ hiển thị 2D Oxy chuẩn xác & 3D Đại dương chiến thuật, Radar 3x3, Bẫy & Quà
// Tích hợp chuẩn bộ câu hỏi EY BattleSessionManager (KaTeX, Ảnh, Timer)
// ==============================================================================

(function (global) {
  'use strict';

  const GRID_PRESETS = {
    3: { range: 3, size: 7, label: '7×7 (−3…3)', ships: [3, 3, 2, 2], gifts: { gift: 2, radar: 1 }, traps: { pirate: 2, mine: 1 } },
    4: { range: 4, size: 9, label: '9×9 (−4…4)', ships: [4, 3, 3, 2, 2], gifts: { gift: 3, radar: 1 }, traps: { pirate: 3, mine: 2 } },
    5: { range: 5, size: 11, label: '11×11 (−5…5)', ships: [4, 4, 3, 3, 3, 2], gifts: { gift: 4, radar: 2 }, traps: { pirate: 4, mine: 2 } }
  };

  function injectStyles() {
    if (document.getElementById('hai-chien-toa-do-styles')) return;
    const style = document.createElement('style');
    style.id = 'hai-chien-toa-do-styles';
    style.textContent = `
      .hctd-stage {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99999 !important;
        overflow: hidden !important;
        display: flex;
        flex-direction: column;
        font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
        color: #f8fafc;
        background: radial-gradient(circle at 50% 15%, #124e70 0%, #092a45 55%, #041526 100%);
        user-select: none;
        -webkit-user-select: none;
      }

      /* Animated Ocean Background */
      .hctd-ocean-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
      }
      .hctd-ocean-wave {
        position: absolute;
        inset: -20%;
        background-image:
          radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.09) 0%, transparent 45%);
        animation: hctdWaveDrift 16s ease-in-out infinite alternate;
      }
      @keyframes hctdWaveDrift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-2%, 2%) scale(1.04); }
      }

      /* Top Header Bar */
      .hctd-topbar {
        position: relative;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 16px;
        background: rgba(6, 22, 40, 0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(56, 189, 248, 0.22);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        flex-shrink: 0;
      }
      .hctd-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 900;
        font-size: 16px;
        letter-spacing: 0.3px;
        color: #f8fafc;
      }
      .hctd-badge-3d {
        font-size: 11px;
        font-weight: 900;
        padding: 2px 7px;
        border-radius: 999px;
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
        color: #fff;
      }
      .hctd-status-pills {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .hctd-pill {
        background: rgba(15, 39, 64, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 999px;
        padding: 5px 13px;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .hctd-top-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .hctd-btn-icon {
        background: rgba(15, 39, 64, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: #e2e8f0;
        border-radius: 10px;
        padding: 6px 11px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s ease;
      }
      .hctd-btn-icon:hover {
        background: rgba(30, 64, 100, 0.95);
        border-color: #38bdf8;
        color: #fff;
      }
      .hctd-btn-icon.active {
        background: linear-gradient(135deg, #0284c7, #0d9488);
        border-color: #38bdf8;
        color: #fff;
      }
      .hctd-btn-exit {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.45);
        color: #fecaca;
      }
      .hctd-btn-exit:hover {
        background: #ef4444;
        color: #fff;
      }

      /* Main Arena */
      .hctd-arena {
        position: relative;
        z-index: 10;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 16px 84px;
        gap: 10px;
        overflow: hidden;
      }
      .hctd-boards-wrap {
        width: 100%;
        max-width: 1280px;
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .hctd-boards-wrap.mode-3d {
        perspective: 1200px;
      }
      .hctd-boards-wrap.mode-3d .hctd-board-card {
        transform: rotateX(var(--tilt-x, 22deg)) rotateY(var(--tilt-y, 0deg));
        box-shadow: 0 26px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(56, 189, 248, 0.25);
      }
      .hctd-boards-wrap.mode-3d.cam-tactical .hctd-board-card {
        transform: rotateX(34deg) rotateY(var(--tilt-y, 0deg)) scale(0.95);
      }

      /* Individual Board Card */
      .hctd-board-card {
        flex: 1;
        max-width: 540px;
        height: 100%;
        max-height: 540px;
        display: flex;
        flex-direction: column;
        background: rgba(8, 28, 48, 0.86);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(56, 189, 248, 0.25);
        border-radius: 18px;
        padding: 10px 12px;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;
        position: relative;
      }
      .hctd-board-card.is-target {
        border-color: #facc15;
        box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.28), 0 18px 42px rgba(250, 204, 21, 0.16);
      }
      .hctd-board-card.is-dimmed {
        opacity: 0.72;
      }

      .hctd-board-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
        flex-shrink: 0;
      }
      .hctd-team-label {
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 800;
        font-size: 13.5px;
      }
      .hctd-team-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .hctd-ships-bars {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
      }
      .hctd-ship-pill {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 5px;
        border-radius: 6px;
        background: rgba(15, 45, 74, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.25);
      }
      .hctd-ship-pill.sunk {
        opacity: 0.4;
        border-color: rgba(239, 68, 68, 0.5);
        text-decoration: line-through;
      }
      .hctd-ship-seg {
        width: 7px;
        height: 7px;
        border-radius: 2px;
        background: #38bdf8;
      }
      .hctd-ship-seg.hit {
        background: #ef4444;
      }
      .hctd-board-stats {
        font-size: 12px;
        font-weight: 800;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Coordinate Grid Canvas/SVG Container */
      .hctd-grid-box {
        position: relative;
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, rgba(14, 74, 110, 0.55) 0%, rgba(6, 26, 46, 0.9) 100%);
        border-radius: 12px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        overflow: hidden;
      }
      .hctd-grid-svg {
        width: 100%;
        height: 100%;
        display: block;
        cursor: crosshair;
      }
      .hctd-coord-tooltip {
        position: absolute;
        top: 8px;
        right: 10px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid #facc15;
        color: #fde047;
        font-size: 12px;
        font-weight: 900;
        padding: 3px 9px;
        border-radius: 8px;
        pointer-events: none;
        z-index: 5;
      }

      /* Bottom Control Dock */
      .hctd-dock {
        position: fixed;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 45;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 9px 18px;
        background: rgba(6, 22, 40, 0.92);
        backdrop-filter: blur(14px);
        border: 1.5px solid rgba(56, 189, 248, 0.35);
        border-radius: 18px;
        box-shadow: 0 12px 34px rgba(0, 0, 0, 0.55);
        max-width: 96vw;
        flex-wrap: wrap;
        justify-content: center;
      }
      .hctd-shot-dots {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .hctd-shot-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #f97316;
        box-shadow: 0 0 8px rgba(249, 115, 22, 0.8);
      }
      .hctd-shot-dot.used {
        background: rgba(148, 163, 184, 0.25);
        box-shadow: none;
      }
      .hctd-coord-inputs {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 900;
        font-size: 15px;
        color: #fde047;
      }
      .hctd-coord-input {
        width: 50px;
        padding: 5px 6px;
        border-radius: 8px;
        border: 1.5px solid rgba(250, 204, 21, 0.55);
        background: rgba(15, 39, 64, 0.95);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        text-align: center;
        outline: none;
      }
      .hctd-btn-fire {
        background: linear-gradient(135deg, #ef4444, #f97316);
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 9px 18px;
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45);
        transition: transform 0.12s ease;
      }
      .hctd-btn-fire:hover:not(:disabled) {
        transform: translateY(-1px) scale(1.03);
      }
      .hctd-btn-fire:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .hctd-btn-radar {
        background: rgba(16, 185, 129, 0.18);
        border: 1.5px solid #10b981;
        color: #6ee7b7;
        border-radius: 12px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .hctd-btn-radar.active {
        background: #10b981;
        color: #022c22;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
      }
      .hctd-btn-radar:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .hctd-btn-next {
        background: linear-gradient(135deg, #06b6d4, #2563eb);
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 9px 18px;
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(6, 182, 212, 0.4);
      }

      /* Modals (Lobby, Question, Steal, Result) */
      .hctd-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(3, 13, 24, 0.72);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: hctdFadeIn 0.2s ease;
      }
      @keyframes hctdFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .hctd-modal-card {
        width: 100%;
        max-width: 720px;
        max-height: 90vh;
        overflow-y: auto;
        background: linear-gradient(160deg, #0c2640 0%, #07192d 100%);
        border: 1.5px solid rgba(56, 189, 248, 0.35);
        border-radius: 22px;
        padding: 22px 24px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
        color: #f8fafc;
      }

      /* Lobby Specific */
      .hctd-lobby-title {
        font-size: 26px;
        font-weight: 900;
        text-align: center;
        background: linear-gradient(90deg, #38bdf8, #facc15, #f97316);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 6px;
      }
      .hctd-lobby-sub {
        text-align: center;
        font-size: 13.5px;
        color: #94a3b8;
        margin-bottom: 16px;
      }
      .hctd-seg-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .hctd-seg-btn {
        flex: 1;
        min-width: 110px;
        padding: 9px 12px;
        border-radius: 12px;
        border: 1.5px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 39, 64, 0.75);
        color: #cbd5e1;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
      }
      .hctd-seg-btn.active {
        border-color: #38bdf8;
        background: rgba(14, 116, 144, 0.45);
        color: #fff;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.25);
      }
      .hctd-settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 10px;
        margin-bottom: 14px;
      }
      .hctd-field {
        background: rgba(15, 39, 64, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 12px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .hctd-field label {
        font-size: 11.5px;
        font-weight: 700;
        color: #94a3b8;
      }
      .hctd-field input[type="text"],
      .hctd-field input[type="number"] {
        background: rgba(6, 22, 40, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 8px;
        padding: 5px 8px;
        color: #fff;
        font-weight: 800;
        font-size: 13.5px;
        outline: none;
      }
      .hctd-checks {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 13px;
        font-weight: 700;
        color: #e2e8f0;
      }
      .hctd-checks label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .hctd-btn-launch {
        width: 100%;
        padding: 13px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #f97316, #ef4444);
        color: #fff;
        font-size: 16px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45);
      }

      /* Question Modal */
      .hctd-q-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .hctd-turn-badge {
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 900;
      }
      .hctd-timer-track {
        width: 100%;
        height: 7px;
        background: rgba(148, 163, 184, 0.2);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 14px;
      }
      .hctd-timer-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #facc15, #ef4444);
        transition: width 0.25s linear;
      }
      .hctd-q-text {
        font-size: 17px;
        font-weight: 700;
        line-height: 1.55;
        margin-bottom: 14px;
        color: #f8fafc;
      }
      .hctd-q-img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 12px;
        margin: 0 auto 14px;
        display: block;
        cursor: zoom-in;
        border: 1px solid rgba(148, 163, 184, 0.3);
      }
      .hctd-options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }
      @media (max-width: 600px) {
        .hctd-options-grid { grid-template-columns: 1fr; }
        .hctd-boards-wrap { flex-direction: column; }
      }
      .hctd-opt-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 14px;
        border-radius: 13px;
        border: 1.5px solid rgba(56, 189, 248, 0.3);
        background: rgba(15, 39, 64, 0.85);
        color: #f8fafc;
        font-size: 14.5px;
        font-weight: 700;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
      }
      .hctd-opt-btn:hover:not(:disabled) {
        border-color: #38bdf8;
        background: rgba(14, 116, 144, 0.5);
        transform: translateY(-1px);
      }
      .hctd-opt-btn.correct {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.28);
        color: #a7f3d0;
      }
      .hctd-opt-btn.wrong {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.28);
        color: #fecaca;
      }
      .hctd-opt-letter {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        flex-shrink: 0;
      }

      /* Floating Arcade Banner */
      .hctd-banner {
        position: fixed;
        top: 76px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 80;
        padding: 10px 26px;
        border-radius: 999px;
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        animation: hctdPopBanner 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes hctdPopBanner {
        0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }

      /* Confetti */
      .hctd-confetti {
        position: fixed;
        width: 9px;
        height: 9px;
        z-index: 95;
        pointer-events: none;
        animation: hctdConfettiFall 2.4s linear forwards;
      }
      @keyframes hctdConfettiFall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Web Audio Synthesizer
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }
    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    tone(freq, dur, type = 'sine', vol = 0.2, delay = 0, slideTo = null) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      } catch {}
    }
    play(name) {
      switch (name) {
        case 'click': this.tone(560, 0.06, 'sine', 0.16, 0, 320); break;
        case 'correct':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, i * 0.07));
          break;
        case 'wrong':
          this.tone(190, 0.25, 'sawtooth', 0.2, 0, 110);
          break;
        case 'fire':
          this.tone(360, 0.16, 'sawtooth', 0.22, 0, 95);
          break;
        case 'hit':
          this.tone(130, 0.35, 'sawtooth', 0.32, 0, 45);
          this.tone(420, 0.18, 'square', 0.18, 0.04, 180);
          break;
        case 'sink':
          [160, 120, 90, 65].forEach((f, i) => this.tone(f, 0.25, 'sawtooth', 0.28, i * 0.08));
          break;
        case 'miss':
          this.tone(280, 0.18, 'sine', 0.14, 0, 140);
          break;
        case 'gift':
          [660, 880, 1100, 1320].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.2, i * 0.06));
          break;
        case 'radar':
          this.tone(980, 0.22, 'sine', 0.18, 0, 1280);
          this.tone(980, 0.22, 'sine', 0.15, 0.18, 1280);
          break;
        case 'steal':
          this.tone(340, 0.22, 'triangle', 0.24, 0, 760);
          break;
        case 'victory':
          [440, 554, 659, 880, 1108].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.26, i * 0.11));
          break;
      }
    }
  }

  function formatMath(text) {
    if (!text) return '';
    let s = String(text);
    if (window.katex && typeof window.katex.renderToString === 'function') {
      s = s.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch { return m; }
      });
      s = s.replace(/\$([^\$\n]+?)\$/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch { return m; }
      });
      s = s.replace(/\\\(([\s\S]+?)\\\)/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch { return m; }
      });
    }
    return s.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\le/g, '≤').replace(/\\ge/g, '≥').replace(/\\neq/g, '≠');
  }

  // Generate non-touching ship layout + mystery gifts/traps on integer (x, y) grid
  function createBoardData(range, config) {
    const preset = GRID_PRESETS[range];
    const ships = [];
    const occupied = new Set(); // "x,y"
    const shipMap = new Map();  // "x,y" -> { shipIdx, cellIdx }

    const key = (x, y) => `${x},${y}`;
    const inBounds = (x, y) => x >= -range && x <= range && y >= -range && y <= range;

    function canPlace(cells) {
      for (const [cx, cy] of cells) {
        if (!inBounds(cx, cy)) return false;
        // 8-neighbor no-touching rule
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (occupied.has(key(cx + dx, cy + dy))) return false;
          }
        }
      }
      return true;
    }

    preset.ships.forEach((len, shipIdx) => {
      let placed = false;
      for (let attempt = 0; attempt < 250 && !placed; attempt++) {
        const horiz = Math.random() < 0.5;
        const sx = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const sy = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const cells = [];
        for (let i = 0; i < len; i++) {
          cells.push([horiz ? sx + i : sx, horiz ? sy : sy + i]);
        }
        if (canPlace(cells)) {
          cells.forEach(([cx, cy], cellIdx) => {
            occupied.add(key(cx, cy));
            shipMap.set(key(cx, cy), { shipIdx, cellIdx });
          });
          ships.push({ length: len, cells, hits: new Array(len).fill(false), sunk: false });
          placed = true;
        }
      }
      // Fallback without 8-neighbor constraint if tight
      if (!placed) {
        for (let y = -range; y <= range && !placed; y++) {
          for (let x = -range; x <= range && !placed; x++) {
            const cells = [];
            for (let i = 0; i < len; i++) cells.push([x + i, y]);
            if (cells.every(([cx, cy]) => inBounds(cx, cy) && !occupied.has(key(cx, cy)))) {
              cells.forEach(([cx, cy], cellIdx) => {
                occupied.add(key(cx, cy));
                shipMap.set(key(cx, cy), { shipIdx, cellIdx });
              });
              ships.push({ length: len, cells, hits: new Array(len).fill(false), sunk: false });
              placed = true;
            }
          }
        }
      }
    });

    // Place Mystery Gifts & Traps on empty water cells
    const specials = new Map(); // "x,y" -> 'gift' | 'radar' | 'pirate' | 'mine'
    if (config.enableTrapsGifts) {
      const emptyCells = [];
      for (let y = -range; y <= range; y++) {
        for (let x = -range; x <= range; x++) {
          if (!shipMap.has(key(x, y))) emptyCells.push([x, y]);
        }
      }
      // Shuffle
      for (let i = emptyCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
      }
      const itemsToPlace = [];
      for (let i = 0; i < preset.gifts.gift; i++) itemsToPlace.push('gift');
      for (let i = 0; i < preset.gifts.radar; i++) itemsToPlace.push('radar');
      for (let i = 0; i < preset.traps.pirate; i++) itemsToPlace.push('pirate');
      for (let i = 0; i < preset.traps.mine; i++) itemsToPlace.push('mine');
      itemsToPlace.forEach((type, idx) => {
        if (idx < emptyCells.length) {
          const [x, y] = emptyCells[idx];
          specials.set(key(x, y), type);
        }
      });
    }

    return {
      ships,
      shipMap,
      specials,
      shotsFired: new Map(), // "x,y" -> 'hit' | 'miss' | 'gift' | 'radar' | 'pirate' | 'mine'
      radars: [],            // { x, y, count }
      totalShots: 0,
      totalHits: 0
    };
  }

  // Main Launch Function
  window.launchHaiChienToaDoGame = function (container, options = {}) {
    injectStyles();
    const sfx = new SoundEngine();

    const defaultQuestions = [
      { text: "Trong mặt phẳng tọa độ $Oxy$, điểm nào sau đây nằm trên trục tung $Oy$?", options: ["$A(2; 0)$", "$B(0; -3)$", "$C(1; 1)$", "$D(-2; 2)$"], correctIndex: 1 },
      { text: "Tọa độ trung điểm $M$ của đoạn thẳng $AB$ với $A(2; 4)$ và $B(4; -2)$ là:", options: ["$M(3; 1)$", "$M(6; 2)$", "$M(1; 3)$", "$M(2; 6)$"], correctIndex: 0 },
      { text: "Khoảng cách từ điểm $P(3; 4)$ đến gốc tọa độ $O(0; 0)$ bằng:", options: ["$7$", "$25$", "$5$", "$\\sqrt{7}$"], correctIndex: 2 },
      { text: "Điểm $M(-2; 3)$ thuộc góc phần tư thứ mấy trong hệ trục $Oxy$?", options: ["Thứ I", "Thứ II", "Thứ III", "Thứ IV"], correctIndex: 1 },
      { text: "Giá trị của biểu thức $2^3 + 3^2$ bằng bao nhiêu?", options: ["$12$", "$15$", "$17$", "$19$"], correctIndex: 2 },
      { text: "Đường thẳng $y = 2x - 4$ cắt trục hoành $Ox$ tại điểm có tọa độ:", options: ["$(2; 0)$", "$(0; -4)$", "$(-2; 0)$", "$(4; 0)$"], correctIndex: 0 },
      { text: "Tìm $x$, biết: $3x - 5 = 10$", options: ["$x = 3$", "$x = 4$", "$x = 5$", "$x = 15$"], correctIndex: 2 },
      { text: "Diện tích hình vuông có chu vi bằng $24\\text{ cm}$ là:", options: ["$24\\text{ cm}^2$", "$36\\text{ cm}^2$", "$48\\text{ cm}^2$", "$16\\text{ cm}^2$"], correctIndex: 1 },
      { text: "Trong mặt phẳng $Oxy$, điểm đối xứng với $A(3; -2)$ qua trục $Ox$ là:", options: ["$A'(-3; -2)$", "$A'(3; 2)$", "$A'(-3; 2)$", "$A'(-2; 3)$"], correctIndex: 1 },
      { text: "Tổng các nghiệm của phương trình $x^2 - 5x + 6 = 0$ là:", options: ["$6$", "$-5$", "$5$", "$1$"], correctIndex: 2 }
    ];

    const rawQuestions = (options.questions && options.questions.length > 0) ? options.questions : defaultQuestions;
    const questions = rawQuestions.map(q => ({ ...q }));

    const state = {
      phase: 'lobby', // 'lobby' | 'question' | 'steal-prompt' | 'aiming' | 'turn-done' | 'ended'
      config: {
        mode: '2-team', // '2-team' | 'class'
        range: 4,       // 3 (7x7), 4 (9x9), 5 (11x11)
        view3d: false,
        tactical3d: false,
        secondsPerQuestion: typeof options.secondsPerQuestion === 'number' ? options.secondsPerQuestion : 30,
        shotsPerCorrect: 2,
        classArmor: 5,
        radarUses: 2,
        bonusShotOnHit: true,
        allowSteal: true,
        enableTrapsGifts: true,
        teamRedName: 'Hạm đội Đỏ',
        teamBlueName: 'Hạm đội Xanh'
      },
      boards: [],          // [redBoard, blueBoard] or [mysteryBoard]
      currentTeam: 0,      // 0 = Red (or Class), 1 = Blue
      qIndex: 0,
      turnNumber: 1,
      remainingShots: 0,
      pendingBonusShots: [0, 0], // From opponent hitting Mine
      radarsLeft: [2, 2],
      classArmorLeft: 5,
      radarMode: false,
      aimX: 0,
      aimY: 0,
      hoverX: null,
      hoverY: null,
      timerLeft: 0,
      timerInterval: null,
      tiltX: 22,
      tiltY: 0,
      stealActive: false,
      lastResultMsg: '',
      destroyed: false
    };

    const stage = document.createElement('div');
    stage.className = 'hctd-stage';
    container.innerHTML = '';
    container.appendChild(stage);

    function clearTimer() {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
    }

    function showBanner(text, bgGradient, duration = 2100) {
      const existing = stage.querySelector('.hctd-banner');
      if (existing) existing.remove();
      const b = document.createElement('div');
      b.className = 'hctd-banner';
      b.style.background = bgGradient;
      b.textContent = text;
      stage.appendChild(b);
      setTimeout(() => { if (b.parentNode) b.remove(); }, duration);
    }

    function spawnConfetti() {
      const colors = ['#facc15', '#ef4444', '#38bdf8', '#10b981', '#a855f7', '#f97316'];
      for (let i = 0; i < 65; i++) {
        const c = document.createElement('div');
        c.className = 'hctd-confetti';
        c.style.left = `${Math.random() * 100}vw`;
        c.style.background = colors[i % colors.length];
        c.style.animationDelay = `${Math.random() * 0.8}s`;
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        stage.appendChild(c);
        setTimeout(() => c.remove(), 3400);
      }
    }

    function startMatch() {
      sfx.play('click');
      const c = state.config;
      state.qIndex = 0;
      state.turnNumber = 1;
      state.currentTeam = 0;
      state.remainingShots = 0;
      state.pendingBonusShots = [0, 0];
      state.radarsLeft = [c.radarUses, c.radarUses];
      state.classArmorLeft = c.classArmor;
      state.radarMode = false;
      state.aimX = 0;
      state.aimY = 0;
      state.stealActive = false;
      state.lastResultMsg = '';

      if (c.mode === '2-team') {
        state.boards = [createBoardData(c.range, c), createBoardData(c.range, c)];
      } else {
        state.boards = [createBoardData(c.range, c)];
      }

      beginTurnQuestion();
    }

    function beginTurnQuestion() {
      clearTimer();
      state.radarMode = false;
      state.stealActive = false;

      if (state.qIndex >= questions.length) {
        finishGame();
        return;
      }

      state.phase = 'question';
      render();

      const sec = state.config.secondsPerQuestion;
      if (sec > 0) {
        state.timerLeft = sec;
        state.timerInterval = setInterval(() => {
          state.timerLeft -= 0.25;
          const fill = stage.querySelector('.hctd-timer-fill');
          if (fill) {
            fill.style.width = `${Math.max(0, (state.timerLeft / sec) * 100)}%`;
          }
          if (state.timerLeft <= 0) {
            clearTimer();
            handleAnswerTimeout();
          }
        }, 250);
      }
    }

    function handleAnswerTimeout() {
      sfx.play('wrong');
      if (state.config.mode === '2-team' && state.config.allowSteal && !state.stealActive) {
        state.phase = 'steal-prompt';
        showBanner('⏰ HẾT GIỜ! CƠ HỘI CƯỚP LƯỢT!', 'linear-gradient(135deg, #f59e0b, #d97706)');
        render();
      } else {
        applyWrongPenalty();
      }
    }

    function applyWrongPenalty() {
      if (state.config.mode === 'class') {
        state.classArmorLeft = Math.max(0, state.classArmorLeft - 1);
        showBanner('💥 ĐỊCH PHẢN CÔNG! -1 GIÁP TÀU MẸ!', 'linear-gradient(135deg, #ef4444, #b91c1c)');
        if (state.classArmorLeft <= 0) {
          finishGame();
          return;
        }
        state.qIndex++;
        state.turnNumber++;
        state.phase = 'turn-done';
        state.lastResultMsg = 'Trả lời sai / hết giờ — tàu mẹ mất 1 giáp!';
        render();
      } else {
        state.qIndex++;
        state.turnNumber++;
        state.currentTeam = 1 - state.currentTeam;
        beginTurnQuestion();
      }
    }

    function getTargetBoardIndex() {
      if (state.config.mode === 'class') return 0;
      return 1 - state.currentTeam;
    }

    function enterAimingPhase(shotsCount) {
      const bonus = state.pendingBonusShots[state.currentTeam] || 0;
      state.pendingBonusShots[state.currentTeam] = 0;
      state.remainingShots = shotsCount + bonus;
      state.phase = 'aiming';
      state.radarMode = false;
      render();
    }

    function fireAt(x, y) {
      if (state.phase !== 'aiming') return;
      const range = state.config.range;
      if (x < -range || x > range || y < -range || y > range) return;

      const board = state.boards[getTargetBoardIndex()];
      const k = `${x},${y}`;

      if (state.radarMode) {
        if (state.radarsLeft[state.currentTeam] <= 0) return;
        sfx.play('radar');
        state.radarsLeft[state.currentTeam]--;
        state.radarMode = false;
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (board.shipMap.has(`${x + dx},${y + dy}`)) count++;
          }
        }
        board.radars.push({ x, y, count });
        showBanner(`📡 RADAR (${x}; ${y}): PHÁT HIỆN ${count} Ô TÀU!`, 'linear-gradient(135deg, #10b981, #059669)');
        render();
        return;
      }

      if (board.shotsFired.has(k)) {
        showBanner(`⚠️ Tọa độ (${x}; ${y}) đã bắn rồi!`, 'linear-gradient(135deg, #64748b, #475569)', 1300);
        return;
      }

      sfx.play('fire');
      board.totalShots++;
      state.remainingShots--;

      if (board.shipMap.has(k)) {
        const { shipIdx, cellIdx } = board.shipMap.get(k);
        const ship = board.ships[shipIdx];
        ship.hits[cellIdx] = true;
        board.shotsFired.set(k, 'hit');
        board.totalHits++;

        const allHit = ship.hits.every(Boolean);
        if (allHit) {
          ship.sunk = true;
          sfx.play('sink');
          showBanner(`🔥 ĐÁNH CHÌM CHIẾN HẠM ${ship.length} Ô TẠI (${x}; ${y})!`, 'linear-gradient(135deg, #ef4444, #f97316)');
        } else {
          sfx.play('hit');
          showBanner(`💥 TRÚNG TÀU ĐỊCH TẠI (${x}; ${y})!`, 'linear-gradient(135deg, #f97316, #ea580c)');
        }

        if (state.config.bonusShotOnHit) {
          state.remainingShots++;
        }

        if (board.ships.every(s => s.sunk)) {
          finishGame();
          return;
        }
      } else if (board.specials.has(k)) {
        const sp = board.specials.get(k);
        board.shotsFired.set(k, sp);
        if (sp === 'gift') {
          sfx.play('gift');
          state.remainingShots++;
          showBanner(`🎁 RƯƠNG QUÀ TẠI (${x}; ${y})! +1 PHÁT BẮN!`, 'linear-gradient(135deg, #eab308, #ca8a04)');
        } else if (sp === 'radar') {
          sfx.play('radar');
          let count = 0;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (board.shipMap.has(`${x + dx},${y + dy}`)) count++;
            }
          }
          board.radars.push({ x, y, count });
          showBanner(`📡 PHAO RADAR! QUÉT 3×3 PHÁT HIỆN ${count} Ô TÀU!`, 'linear-gradient(135deg, #10b981, #0d9488)');
        } else if (sp === 'pirate') {
          sfx.play('wrong');
          state.remainingShots = Math.max(0, state.remainingShots - 1);
          showBanner(`🏴‍☠️ CƯỚP BIỂN TẠI (${x}; ${y})! -1 PHÁT BẮN!`, 'linear-gradient(135deg, #64748b, #334155)');
        } else if (sp === 'mine') {
          sfx.play('hit');
          if (state.config.mode === 'class') {
            state.classArmorLeft = Math.max(0, state.classArmorLeft - 1);
            showBanner(`💣 THỦY LÔI! -1 GIÁP TÀU MẸ!`, 'linear-gradient(135deg, #dc2626, #991b1b)');
            if (state.classArmorLeft <= 0) {
              finishGame();
              return;
            }
          } else {
            state.pendingBonusShots[1 - state.currentTeam]++;
            showBanner(`💣 THỦY LÔI! ĐỐI THỦ ĐƯỢC +1 PHÁT LƯỢT SAU!`, 'linear-gradient(135deg, #dc2626, #991b1b)');
          }
        }
      } else {
        sfx.play('miss');
        board.shotsFired.set(k, 'miss');
        showBanner(`🌊 Trượt tại (${x}; ${y})!`, 'linear-gradient(135deg, #0284c7, #0369a1)', 1200);
      }

      if (state.remainingShots <= 0) {
        state.phase = 'turn-done';
        state.lastResultMsg = `Đã hoàn thành lượt bắn!`;
      }
      render();
    }

    function nextTurn() {
      sfx.play('click');
      state.qIndex++;
      state.turnNumber++;
      if (state.config.mode === '2-team') {
        state.currentTeam = 1 - state.currentTeam;
      }
      beginTurnQuestion();
    }

    function finishGame() {
      clearTimer();
      state.phase = 'ended';
      sfx.play('victory');
      spawnConfetti();
      render();
    }

    function buildGridSvg(board, boardIdx, isTarget) {
      const range = state.config.range;
      const size = range * 2 + 1;
      const pad = 34;
      const step = 36;
      const vbSize = pad * 2 + (size - 1) * step;
      const toPx = (x, y) => [pad + (x + range) * step, pad + (range - y) * step];

      let lines = '';
      for (let i = -range; i <= range; i++) {
        const [vx] = toPx(i, 0);
        const [, hy] = toPx(0, i);
        const isAxis = i === 0;
        lines += `<line x1="${vx}" y1="${pad - 12}" x2="${vx}" y2="${vbSize - pad + 12}" stroke="${isAxis ? '#38bdf8' : 'rgba(148,163,184,0.22)'}" stroke-width="${isAxis ? 2 : 1}" />`;
        lines += `<line x1="${pad - 12}" y1="${hy}" x2="${vbSize - pad + 12}" y2="${hy}" stroke="${isAxis ? '#38bdf8' : 'rgba(148,163,184,0.22)'}" stroke-width="${isAxis ? 2 : 1}" />`;
        if (i !== 0) {
          lines += `<text x="${vx}" y="${toPx(0, 0)[1] + 14}" fill="#94a3b8" font-size="10.5" font-weight="800" text-anchor="middle">${i}</text>`;
          lines += `<text x="${toPx(0, 0)[0] - 11}" y="${hy + 4}" fill="#94a3b8" font-size="10.5" font-weight="800" text-anchor="end">${i}</text>`;
        }
      }
      const [ox, oy] = toPx(0, 0);
      lines += `<text x="${ox - 10}" y="${oy + 14}" fill="#38bdf8" font-size="11" font-weight="900">O</text>`;
      lines += `<text x="${vbSize - pad + 16}" y="${oy + 4}" fill="#38bdf8" font-size="12" font-weight="900">x</text>`;
      lines += `<text x="${ox + 7}" y="${pad - 14}" fill="#38bdf8" font-size="12" font-weight="900">y</text>`;

      // Radar 3x3 overlays
      let radarsHtml = '';
      board.radars.forEach(r => {
        const x1 = Math.max(-range, r.x - 1);
        const x2 = Math.min(range, r.x + 1);
        const y1 = Math.max(-range, r.y - 1);
        const y2 = Math.min(range, r.y + 1);
        const [px1, py2] = toPx(x1, y2);
        const [px2, py1] = toPx(x2, y1);
        const rx = px1 - step * 0.44;
        const ry = py2 - step * 0.44;
        const rw = (px2 - px1) + step * 0.88;
        const rh = (py1 - py2) + step * 0.88;
        radarsHtml += `
          <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="8" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="2" stroke-dasharray="5 3" />
          <rect x="${rx + rw - 38}" y="${ry + 4}" width="34" height="18" rx="6" fill="#059669" />
          <text x="${rx + rw - 21}" y="${ry + 16.5}" fill="#fff" font-size="10.5" font-weight="900" text-anchor="middle">📡 ${r.count}</text>
        `;
      });

      // Aiming Crosshair on target board
      let crosshairHtml = '';
      if (isTarget && state.phase === 'aiming') {
        const [ax, ay] = toPx(state.aimX, state.aimY);
        if (state.radarMode) {
          const rx = ax - step * 1.42;
          const ry = ay - step * 1.42;
          crosshairHtml += `<rect x="${rx}" y="${ry}" width="${step * 2.84}" height="${step * 2.84}" rx="10" fill="rgba(16,185,129,0.18)" stroke="#34d399" stroke-width="2.5" stroke-dasharray="6 4" />`;
        } else {
          crosshairHtml += `
            <line x1="${ax}" y1="${pad - 12}" x2="${ax}" y2="${vbSize - pad + 12}" stroke="#facc15" stroke-width="1.6" stroke-dasharray="4 3" />
            <line x1="${pad - 12}" y1="${ay}" x2="${vbSize - pad + 12}" y2="${ay}" stroke="#facc15" stroke-width="1.6" stroke-dasharray="4 3" />
            <circle cx="${ax}" cy="${ay}" r="11" fill="rgba(250,204,21,0.22)" stroke="#facc15" stroke-width="2" />
          `;
        }
      }

      // Cells (points & fired shots)
      let cellsHtml = '';
      for (let y = range; y >= -range; y--) {
        for (let x = -range; x <= range; x++) {
          const [cx, cy] = toPx(x, y);
          const shot = board.shotsFired.get(`${x},${y}`);
          let marker = `<circle cx="${cx}" cy="${cy}" r="3.4" fill="rgba(186,230,253,0.48)" />`;
          if (shot === 'hit') {
            marker = `<circle cx="${cx}" cy="${cy}" r="11" fill="rgba(239,68,68,0.35)" stroke="#ef4444" stroke-width="2" />
                      <text x="${cx}" y="${cy + 5}" font-size="14" text-anchor="middle">💥</text>`;
          } else if (shot === 'miss') {
            marker = `<circle cx="${cx}" cy="${cy}" r="6.5" fill="rgba(56,189,248,0.22)" stroke="rgba(148,163,184,0.75)" stroke-width="1.5" />`;
          } else if (shot === 'gift') {
            marker = `<text x="${cx}" y="${cy + 5}" font-size="14" text-anchor="middle">🎁</text>`;
          } else if (shot === 'radar') {
            marker = `<text x="${cx}" y="${cy + 5}" font-size="14" text-anchor="middle">📡</text>`;
          } else if (shot === 'pirate') {
            marker = `<text x="${cx}" y="${cy + 5}" font-size="14" text-anchor="middle">🏴‍☠️</text>`;
          } else if (shot === 'mine') {
            marker = `<text x="${cx}" y="${cy + 5}" font-size="14" text-anchor="middle">💣</text>`;
          }
          cellsHtml += `<g class="hctd-cell-pt" data-board="${boardIdx}" data-x="${x}" data-y="${y}">
            <circle cx="${cx}" cy="${cy}" r="${step * 0.45}" fill="transparent" />
            ${marker}
          </g>`;
        }
      }

      return `<svg class="hctd-grid-svg" viewBox="0 0 ${vbSize} ${vbSize}">${lines}${radarsHtml}${crosshairHtml}${cellsHtml}</svg>`;
    }

    function render() {
      if (state.destroyed) return;
      const c = state.config;
      const targetIdx = getTargetBoardIndex();

      const teamRedScore = state.boards[0] ? (state.boards[1] ? state.boards[1].totalHits : state.boards[0].totalHits) : 0;
      const teamBlueScore = state.boards[1] && state.boards[0] ? state.boards[0].totalHits : 0;

      const scoreHtml = c.mode === '2-team'
        ? `<span style="color:#f87171">${c.teamRedName} 💥${teamRedScore}</span> · <span style="color:#60a5fa">${c.teamBlueName} 💥${teamBlueScore}</span>`
        : `<span>💥 ${teamRedScore} trúng</span> · <span style="color:#38bdf8">🛡️ ${state.classArmorLeft} Giáp</span>`;

      let boardsHtml = '';
      if (state.boards.length > 0) {
        boardsHtml = state.boards.map((board, idx) => {
          const isTarget = state.phase === 'aiming' && idx === targetIdx;
          const isRed = idx === 0;
          const title = c.mode === 'class' ? '🏴‍☠️ Hạm đội Bí ẩn' : `Vùng biển ${isRed ? c.teamRedName : c.teamBlueName}`;
          const dotColor = c.mode === 'class' ? '#a855f7' : (isRed ? '#ef4444' : '#3b82f6');

          const shipsBars = board.ships.map(s => {
            const segs = s.hits.map(h => `<span class="hctd-ship-seg ${h ? 'hit' : ''}"></span>`).join('');
            return `<div class="hctd-ship-pill ${s.sunk ? 'sunk' : ''}">${segs}</div>`;
          }).join('');

          return `
            <div class="hctd-board-card ${isTarget ? 'is-target' : (state.phase === 'aiming' ? 'is-dimmed' : '')}">
              <div class="hctd-board-header">
                <div class="hctd-team-label">
                  <span class="hctd-team-dot" style="background:${dotColor}"></span>
                  <span>${title}</span>
                </div>
                <div class="hctd-board-stats">
                  <span>🎯 ${board.totalShots}</span>
                  <span>💥 ${board.totalHits}</span>
                </div>
              </div>
              <div class="hctd-ships-bars" style="margin-bottom:8px;">${shipsBars}</div>
              <div class="hctd-grid-box">
                ${isTarget ? `<div class="hctd-coord-tooltip">(${state.aimX}; ${state.aimY})</div>` : ''}
                ${buildGridSvg(board, idx, isTarget)}
              </div>
            </div>
          `;
        }).join('');
      }

      // Dock HTML
      let dockHtml = '';
      if (state.phase === 'aiming') {
        const dots = Array.from({ length: Math.max(state.remainingShots, c.shotsPerCorrect) }, (_, i) =>
          `<span class="hctd-shot-dot ${i >= state.remainingShots ? 'used' : ''}"></span>`
        ).join('');
        dockHtml = `
          <div class="hctd-dock">
            <div class="hctd-shot-dots" title="Số phát bắn còn lại">${dots}</div>
            <div class="hctd-coord-inputs">
              <span>(</span>
              <input id="hctd-in-x" class="hctd-coord-input" type="number" min="-${c.range}" max="${c.range}" value="${state.aimX}">
              <span>;</span>
              <input id="hctd-in-y" class="hctd-coord-input" type="number" min="-${c.range}" max="${c.range}" value="${state.aimY}">
              <span>)</span>
            </div>
            <button id="hctd-btn-fire" class="hctd-btn-fire">${state.radarMode ? '📡 Quét Radar 3×3' : '💥 Bắn!'}</button>
            <button id="hctd-btn-radar" class="hctd-btn-radar ${state.radarMode ? 'active' : ''}" ${state.radarsLeft[state.currentTeam] <= 0 ? 'disabled' : ''}>
              📡 Radar (còn ${state.radarsLeft[state.currentTeam]})
            </button>
          </div>
        `;
      } else if (state.phase === 'turn-done') {
        dockHtml = `
          <div class="hctd-dock">
            <span style="font-weight:800; color:#e2e8f0; font-size:13.5px;">${state.lastResultMsg}</span>
            <button id="hctd-btn-next" class="hctd-btn-next">Câu tiếp theo ▶ [Space]</button>
          </div>
        `;
      }

      // Modal HTML
      let modalHtml = '';
      if (state.phase === 'lobby') {
        const preset = GRID_PRESETS[c.range];
        modalHtml = `
          <div class="hctd-modal-backdrop">
            <div class="hctd-modal-card">
              <div class="hctd-lobby-title">⚓ HẢI CHIẾN TỌA ĐỘ OXY</div>
              <div class="hctd-lobby-sub">Trả lời câu hỏi nhận đạn pháo — ngắm chuẩn tọa độ (x; y) đánh chìm hạm đội đối phương!</div>

              <div style="font-size:12px; font-weight:800; color:#38bdf8; margin-bottom:6px;">CHẾ ĐỘ CHƠI</div>
              <div class="hctd-seg-group">
                <button class="hctd-seg-btn ${c.mode === '2-team' ? 'active' : ''}" data-cfg="mode" data-val="2-team">⚔️ 2 Đội đối kháng</button>
                <button class="hctd-seg-btn ${c.mode === 'class' ? 'active' : ''}" data-cfg="mode" data-val="class">👥 Cả lớp đấu Bot</button>
              </div>

              <div style="font-size:12px; font-weight:800; color:#38bdf8; margin-bottom:6px;">KÍCH THƯỚC LƯỚI TỌA ĐỘ</div>
              <div class="hctd-seg-group">
                <button class="hctd-seg-btn ${c.range === 3 ? 'active' : ''}" data-cfg="range" data-val="3">7×7 (−3…3) · 4 tàu</button>
                <button class="hctd-seg-btn ${c.range === 4 ? 'active' : ''}" data-cfg="range" data-val="4">9×9 (−4…4) · 5 tàu</button>
                <button class="hctd-seg-btn ${c.range === 5 ? 'active' : ''}" data-cfg="range" data-val="5">11×11 (−5…5) · 6 tàu</button>
              </div>

              <div class="hctd-settings-grid">
                <div class="hctd-field">
                  <label>Tên Đội Đỏ</label>
                  <input id="cfg-red-name" type="text" value="${c.teamRedName}">
                </div>
                <div class="hctd-field">
                  <label>Tên Đội Xanh</label>
                  <input id="cfg-blue-name" type="text" value="${c.teamBlueName}">
                </div>
                <div class="hctd-field">
                  <label>Số phát bắn / câu đúng</label>
                  <input id="cfg-shots" type="number" min="1" max="5" value="${c.shotsPerCorrect}">
                </div>
                <div class="hctd-field">
                  <label>Thời gian / câu (0 = ∞)</label>
                  <input id="cfg-sec" type="number" min="0" max="300" value="${c.secondsPerQuestion}">
                </div>
              </div>

              <div class="hctd-checks">
                <label><input id="cfg-3d" type="checkbox" ${c.view3d ? 'checked' : ''}> 🌊 Chế độ 3D Đại dương</label>
                <label><input id="cfg-traps" type="checkbox" ${c.enableTrapsGifts ? 'checked' : ''}> 🎁 Bẫy & Quà bí ẩn</label>
                <label><input id="cfg-bonus" type="checkbox" ${c.bonusShotOnHit ? 'checked' : ''}> 💥 Trúng thưởng +1 phát</label>
                <label><input id="cfg-steal" type="checkbox" ${c.allowSteal ? 'checked' : ''}> ⚡ Cho phép Cướp lượt</label>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; color:#94a3b8; margin-bottom:14px;">
                <span>📝 ${questions.length} câu hỏi sẵn sàng</span>
                <span>🗺️ ${preset.label} · 🚢 ${preset.ships.length} tàu</span>
              </div>

              <div style="display:flex; gap:10px;">
                <button id="hctd-btn-start" class="hctd-btn-launch" style="flex:1;">🚀 RA KHƠI NGAY!</button>
                <button id="hctd-btn-lobby-exit" class="hctd-btn-icon hctd-btn-exit" style="padding:0 18px;">Thoát</button>
              </div>
            </div>
          </div>
        `;
      } else if (state.phase === 'question') {
        const q = questions[state.qIndex];
        const isRed = state.currentTeam === 0;
        const teamName = c.mode === 'class' ? 'Cả lớp' : (isRed ? c.teamRedName : c.teamBlueName);
        const badgeBg = c.mode === 'class' ? '#0d9488' : (isRed ? '#ef4444' : '#3b82f6');
        const letters = ['A', 'B', 'C', 'D'];

        modalHtml = `
          <div class="hctd-modal-backdrop">
            <div class="hctd-modal-card">
              <div class="hctd-q-head">
                <span class="hctd-turn-badge" style="background:${badgeBg}; color:#fff;">
                  ${state.stealActive ? '⚡ CƯỚP LƯỢT: ' : 'Lượt: '}${teamName}
                </span>
                <span style="font-size:13px; font-weight:800; color:#94a3b8;">Câu ${state.qIndex + 1} / ${questions.length}</span>
              </div>
              ${c.secondsPerQuestion > 0 ? `<div class="hctd-timer-track"><div class="hctd-timer-fill" style="width:${Math.max(0, (state.timerLeft / c.secondsPerQuestion) * 100)}%"></div></div>` : ''}
              <div class="hctd-q-text">${formatMath(q.text)}</div>
              ${q.image ? `<img class="hctd-q-img" src="${q.image}" alt="Hình câu hỏi">` : ''}
              <div class="hctd-options-grid">
                ${q.options.map((opt, idx) => `
                  <button class="hctd-opt-btn" data-opt="${idx}">
                    <span class="hctd-opt-letter">${letters[idx]}</span>
                    <span>${formatMath(opt)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else if (state.phase === 'steal-prompt') {
        const stealTeamName = state.currentTeam === 0 ? c.teamBlueName : c.teamRedName;
        modalHtml = `
          <div class="hctd-modal-backdrop">
            <div class="hctd-modal-card" style="max-width:480px; text-align:center;">
              <div style="font-size:44px; margin-bottom:8px;">⚡</div>
              <h2 style="font-size:22px; font-weight:900; color:#facc15; margin-bottom:8px;">CƠ HỘI CƯỚP LƯỢT!</h2>
              <p style="font-size:14.5px; color:#cbd5e1; margin-bottom:18px;">
                <strong>${stealTeamName}</strong> có muốn trả lời câu hỏi này để cướp ${c.shotsPerCorrect} phát bắn không?
              </p>
              <div style="display:flex; gap:10px; justify-content:center;">
                <button id="hctd-steal-yes" class="hctd-btn-fire">⚡ Cướp lượt ngay!</button>
                <button id="hctd-steal-no" class="hctd-btn-icon">Không cướp</button>
              </div>
            </div>
          </div>
        `;
      } else if (state.phase === 'ended') {
        let winTitle = '🏆 KẾT THÚC TRẬN ĐẤU!';
        let winSub = '';
        if (c.mode === 'class') {
          const allSunk = state.boards[0].ships.every(s => s.sunk);
          winTitle = allSunk ? '🎉 CẢ LỚP CHIẾN THẮNG!' : '💀 HẠM ĐỘI BỊ ĐÁNH CHÌM!';
          winSub = allSunk
            ? `Đã đánh chìm toàn bộ hạm đội địch sau ${state.boards[0].totalShots} phát bắn!`
            : `Tàu mẹ hết giáp hoặc đã hết câu hỏi. Tổng trúng: ${state.boards[0].totalHits} ô.`;
        } else {
          const redSunkAll = state.boards[1].ships.every(s => s.sunk);
          const blueSunkAll = state.boards[0].ships.every(s => s.sunk);
          if (redSunkAll || teamRedScore > teamBlueScore) {
            winTitle = `🏆 ${c.teamRedName.toUpperCase()} CHIẾN THẮNG!`;
          } else if (blueSunkAll || teamBlueScore > teamRedScore) {
            winTitle = `🏆 ${c.teamBlueName.toUpperCase()} CHIẾN THẮNG!`;
          } else {
            winTitle = '🤝 HÒA NHAU!';
          }
          winSub = `${c.teamRedName}: ${teamRedScore} 💥  |  ${c.teamBlueName}: ${teamBlueScore} 💥`;
        }
        modalHtml = `
          <div class="hctd-modal-backdrop">
            <div class="hctd-modal-card" style="max-width:500px; text-align:center;">
              <div style="font-size:52px; margin-bottom:8px;">🏆</div>
              <h2 style="font-size:24px; font-weight:900; color:#facc15; margin-bottom:8px;">${winTitle}</h2>
              <p style="font-size:15px; color:#e2e8f0; margin-bottom:20px;">${winSub}</p>
              <div style="display:flex; gap:10px; justify-content:center;">
                <button id="hctd-btn-replay" class="hctd-btn-launch" style="flex:1;">🔄 Chơi lại</button>
                <button id="hctd-btn-finish-exit" class="hctd-btn-icon hctd-btn-exit" style="padding:0 20px;">Về sảnh</button>
              </div>
            </div>
          </div>
        `;
      }

      stage.innerHTML = `
        <div class="hctd-ocean-bg"><div class="hctd-ocean-wave"></div></div>
        <header class="hctd-topbar">
          <div class="hctd-brand">
            <span>⚓ Hải Chiến Tọa Độ</span>
            ${c.view3d ? '<span class="hctd-badge-3d">3D</span>' : ''}
          </div>
          <div class="hctd-status-pills">
            <div class="hctd-pill">Lượt ${state.turnNumber}/${questions.length}</div>
            <div class="hctd-pill">${scoreHtml}</div>
          </div>
          <div class="hctd-top-actions">
            <button id="hctd-toggle-3d" class="hctd-btn-icon ${c.view3d ? 'active' : ''}" title="Đổi 2D/3D [T]">
              ${c.view3d ? '🌊 3D' : '🗺️ 2D'}
            </button>
            ${c.view3d ? `
              <button id="hctd-toggle-cam" class="hctd-btn-icon ${c.tactical3d ? 'active' : ''}" title="Góc nhìn 3D [V]">
                ${c.tactical3d ? '🎥 Chiến thuật' : '🔭 Toàn cảnh'}
              </button>
            ` : ''}
            <button id="hctd-toggle-mute" class="hctd-btn-icon" title="Âm thanh [M]">${sfx.muted ? '🔇' : '🔊'}</button>
            <button id="hctd-btn-exit" class="hctd-btn-icon hctd-btn-exit">✕ Thoát</button>
          </div>
        </header>
        <main class="hctd-arena">
          <div class="hctd-boards-wrap ${c.view3d ? 'mode-3d' : ''} ${c.tactical3d ? 'cam-tactical' : ''}" style="--tilt-x:${state.tiltX}deg; --tilt-y:${state.tiltY}deg;">
            ${boardsHtml}
          </div>
        </main>
        ${dockHtml}
        ${modalHtml}
      `;

      bindEvents();
    }

    function bindEvents() {
      const exitFn = () => {
        destroy();
        if (typeof options.onExit === 'function') options.onExit();
      };

      stage.querySelector('#hctd-btn-exit')?.addEventListener('click', exitFn);
      stage.querySelector('#hctd-btn-lobby-exit')?.addEventListener('click', exitFn);
      stage.querySelector('#hctd-btn-finish-exit')?.addEventListener('click', exitFn);

      stage.querySelector('#hctd-toggle-3d')?.addEventListener('click', () => {
        state.config.view3d = !state.config.view3d;
        render();
      });
      stage.querySelector('#hctd-toggle-cam')?.addEventListener('click', () => {
        state.config.tactical3d = !state.config.tactical3d;
        render();
      });
      stage.querySelector('#hctd-toggle-mute')?.addEventListener('click', () => {
        sfx.muted = !sfx.muted;
        render();
      });

      // Lobby bindings
      stage.querySelectorAll('.hctd-seg-btn[data-cfg]').forEach(btn => {
        btn.addEventListener('click', () => {
          sfx.play('click');
          const key = btn.dataset.cfg;
          const val = btn.dataset.val;
          state.config[key] = key === 'range' ? parseInt(val, 10) : val;
          render();
        });
      });

      stage.querySelector('#hctd-btn-start')?.addEventListener('click', () => {
        const rName = stage.querySelector('#cfg-red-name')?.value.trim();
        const bName = stage.querySelector('#cfg-blue-name')?.value.trim();
        const shots = parseInt(stage.querySelector('#cfg-shots')?.value, 10);
        const sec = parseInt(stage.querySelector('#cfg-sec')?.value, 10);
        if (rName) state.config.teamRedName = rName;
        if (bName) state.config.teamBlueName = bName;
        if (!isNaN(shots)) state.config.shotsPerCorrect = Math.max(1, Math.min(5, shots));
        if (!isNaN(sec)) state.config.secondsPerQuestion = Math.max(0, Math.min(300, sec));
        state.config.view3d = !!stage.querySelector('#cfg-3d')?.checked;
        state.config.enableTrapsGifts = !!stage.querySelector('#cfg-traps')?.checked;
        state.config.bonusShotOnHit = !!stage.querySelector('#cfg-bonus')?.checked;
        state.config.allowSteal = !!stage.querySelector('#cfg-steal')?.checked;
        startMatch();
      });

      // Question option clicks
      stage.querySelectorAll('.hctd-opt-btn[data-opt]').forEach(btn => {
        btn.addEventListener('click', () => handleOptionSelect(parseInt(btn.dataset.opt, 10)));
      });

      // Steal prompt
      stage.querySelector('#hctd-steal-yes')?.addEventListener('click', () => {
        sfx.play('steal');
        state.currentTeam = 1 - state.currentTeam;
        state.stealActive = true;
        state.phase = 'question';
        render();
      });
      stage.querySelector('#hctd-steal-no')?.addEventListener('click', () => {
        applyWrongPenalty();
      });

      // Aiming grid clicks & hover
      const targetIdx = getTargetBoardIndex();
      stage.querySelectorAll('.hctd-cell-pt').forEach(pt => {
        const bIdx = parseInt(pt.dataset.board, 10);
        if (bIdx !== targetIdx || state.phase !== 'aiming') return;
        const x = parseInt(pt.dataset.x, 10);
        const y = parseInt(pt.dataset.y, 10);
        pt.addEventListener('mouseenter', () => {
          state.aimX = x;
          state.aimY = y;
          const tip = stage.querySelector('.hctd-coord-tooltip');
          if (tip) tip.textContent = `(${x}; ${y})`;
          const ix = stage.querySelector('#hctd-in-x');
          const iy = stage.querySelector('#hctd-in-y');
          if (ix) ix.value = x;
          if (iy) iy.value = y;
        });
        pt.addEventListener('click', () => {
          state.aimX = x;
          state.aimY = y;
          fireAt(x, y);
        });
      });

      // Dock controls
      stage.querySelector('#hctd-btn-fire')?.addEventListener('click', () => {
        const x = parseInt(stage.querySelector('#hctd-in-x')?.value, 10);
        const y = parseInt(stage.querySelector('#hctd-in-y')?.value, 10);
        if (!isNaN(x) && !isNaN(y)) {
          state.aimX = x;
          state.aimY = y;
          fireAt(x, y);
        }
      });
      stage.querySelector('#hctd-btn-radar')?.addEventListener('click', () => {
        sfx.play('click');
        state.radarMode = !state.radarMode;
        render();
      });
      stage.querySelector('#hctd-btn-next')?.addEventListener('click', nextTurn);
      stage.querySelector('#hctd-btn-replay')?.addEventListener('click', () => {
        state.phase = 'lobby';
        render();
      });
    }

    function handleOptionSelect(optIdx) {
      if (state.phase !== 'question') return;
      clearTimer();
      const q = questions[state.qIndex];
      const isCorrect = optIdx === q.correctIndex;
      const btns = stage.querySelectorAll('.hctd-opt-btn');
      btns.forEach((b, i) => {
        b.disabled = true;
        if (i === optIdx) b.classList.add(isCorrect ? 'correct' : 'wrong');
        if (isCorrect && i === q.correctIndex) b.classList.add('correct');
      });

      if (isCorrect) {
        sfx.play('correct');
        showBanner(`✅ CHÍNH XÁC! +${state.config.shotsPerCorrect} PHÁT BẮN!`, 'linear-gradient(135deg, #10b981, #059669)');
        setTimeout(() => {
          if (!state.destroyed) enterAimingPhase(state.config.shotsPerCorrect);
        }, 900);
      } else {
        sfx.play('wrong');
        if (state.config.mode === '2-team' && state.config.allowSteal && !state.stealActive) {
          showBanner('❌ SAI RỒI! CƠ HỘI CƯỚP LƯỢT!', 'linear-gradient(135deg, #f59e0b, #d97706)');
          setTimeout(() => {
            if (!state.destroyed) {
              state.phase = 'steal-prompt';
              render();
            }
          }, 900);
        } else {
          // Reveal correct answer if steal already happened or disabled
          if (btns[q.correctIndex]) btns[q.correctIndex].classList.add('correct');
          showBanner('❌ SAI RỒI!', 'linear-gradient(135deg, #ef4444, #b91c1c)');
          setTimeout(() => {
            if (!state.destroyed) applyWrongPenalty();
          }, 1100);
        }
      }
    }

    function onKeyDown(e) {
      if (state.destroyed) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();

      if (k === 't') { state.config.view3d = !state.config.view3d; render(); return; }
      if (k === 'v' && state.config.view3d) { state.config.tactical3d = !state.config.tactical3d; render(); return; }
      if (k === 'm') { sfx.muted = !sfx.muted; render(); return; }

      if (state.phase === 'question') {
        const map = { a: 0, '1': 0, b: 1, '2': 1, c: 2, '3': 2, d: 3, '4': 3 };
        if (k in map && questions[state.qIndex].options[map[k]] !== undefined) {
          handleOptionSelect(map[k]);
        }
      } else if (state.phase === 'aiming') {
        const r = state.config.range;
        if (e.key === 'ArrowLeft') { state.aimX = Math.max(-r, state.aimX - 1); render(); }
        else if (e.key === 'ArrowRight') { state.aimX = Math.min(r, state.aimX + 1); render(); }
        else if (e.key === 'ArrowUp') { state.aimY = Math.min(r, state.aimY + 1); render(); }
        else if (e.key === 'ArrowDown') { state.aimY = Math.max(-r, state.aimY - 1); render(); }
        else if (e.key === 'Enter') { fireAt(state.aimX, state.aimY); }
        else if (k === 'r' && state.radarsLeft[state.currentTeam] > 0) {
          state.radarMode = !state.radarMode;
          render();
        }
      } else if (state.phase === 'turn-done' && e.code === 'Space') {
        e.preventDefault();
        nextTurn();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    render();

    function destroy() {
      state.destroyed = true;
      clearTimer();
      document.removeEventListener('keydown', onKeyDown);
      if (stage.parentNode) stage.remove();
    }

    return { destroy };
  };
})(window);
