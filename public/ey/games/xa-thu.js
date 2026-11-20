/**
 * ============================================================================
 * XẠ THỦ THIỆN XẠ (XẠ THỦ TRI THỨC) - EY WEBGAME
 * Chuẩn cơ chế game gốc PomyAI (https://pomyai.com/tro-choi/xa-thu):
 *   1. Màn hình chọn kiểu chơi: Cá nhân, Đơn theo đội (2 đội 1 súng), Đôi theo đội (2 đội 2 súng).
 *   2. Màn hình phòng chờ (Room Screen) với Mã PIN 6 số, Mã QR quét mở tay cầm điện thoại (/ey/ban.html).
 *   3. Kết nối tay cầm điện thoại thật qua cảm biến con quay (Gyroscope) + nút BẮN khổng lồ.
 *   4. Tích hợp sẵn Giả lập tay cầm ảo trên màn hình để kiểm thử không cần điện thoại.
 *   5. Hỗ trợ đầy đủ Chuột / Bàn phím / Bảng tương tác thông minh / Phím tắt Buzzer (QWER / UIOP).
 *   6. Đấu trường bắn bia chân thực: Bia gỗ tròn di chuyển, hồng tâm ngắm, tiếng súng nổ, hiệu ứng trúng tâm.
 *   7. Chuẩn KaTeX (renderMathInContainer), ZoomPanOverlay, Font scaling A-/A+.
 * ============================================================================
 */

(function () {
  'use strict';

  // Inject Dedicated Styles
  function injectStyles() {
    if (document.getElementById('xa-thu-styles')) return;
    const style = document.createElement('style');
    style.id = 'xa-thu-styles';
    style.textContent = `
      .xt-root {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 640px;
        background: #082329 repeating-linear-gradient(
          90deg,
          #0b323a 0px,
          #0b323a 40px,
          #072228 40px,
          #072228 80px
        );
        font-family: 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif;
        color: #fff;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Arena Floor / Counter Rail at Bottom */
      .xt-floor-rail {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 52px;
        background: linear-gradient(180deg, #92400e 0%, #78350f 40%, #451a03 100%);
        border-top: 3px solid #d97706;
        box-shadow: 0 -6px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3);
        z-index: 12;
      }

      /* Top HUD Bar */
      .xt-hud-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 24px;
        z-index: 40;
        background: linear-gradient(180deg, rgba(5,18,23,0.92) 0%, rgba(5,18,23,0) 100%);
        pointer-events: none;
      }
      .xt-hud-top > * {
        pointer-events: auto;
      }

      /* Score Badges */
      .xt-score-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 6px 18px;
        border-radius: 9999px;
        background: rgba(15, 32, 39, 0.9);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .xt-score-badge.team-a {
        border: 2px solid #00f0ff;
        color: #e0faff;
      }
      .xt-score-badge.team-b {
        border: 2px solid #ff2b55;
        color: #ffe4e9;
      }
      .xt-score-badge.solo {
        border: 2px solid #fbbf24;
        color: #fef3c7;
      }
      .xt-badge-name {
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .xt-badge-score {
        font-size: 26px;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        min-width: 40px;
        text-align: right;
      }

      /* Top Action Buttons */
      .xt-hud-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .xt-btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.2s ease;
      }
      .xt-btn-icon:hover {
        background: rgba(255,255,255,0.25);
        transform: scale(1.08);
      }
      .xt-btn-pill {
        padding: 7px 16px;
        border-radius: 9999px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        color: #fff;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .xt-btn-pill:hover {
        background: rgba(255,255,255,0.22);
        border-color: rgba(255,255,255,0.4);
      }
      .xt-btn-pill.danger {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        color: #fca5a5;
      }
      .xt-btn-pill.danger:hover {
        background: rgba(239, 68, 68, 0.35);
      }

      /* Question Card Banner (Matching PomyAI f_109.0s.jpg) */
      .xt-qcard-wrapper {
        position: absolute;
        top: 72px;
        left: 50%;
        transform: translateX(-50%);
        width: min(94%, 980px);
        z-index: 35;
        pointer-events: auto;
      }
      .xt-qcard {
        background: rgba(9, 36, 44, 0.95);
        border: 2px solid rgba(250, 204, 21, 0.65);
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        backdrop-filter: blur(12px);
      }
      .xt-q-left {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;
        min-width: 0;
      }
      .xt-q-badge {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #000;
        font-weight: 900;
        font-size: 13.5px;
        letter-spacing: 0.5px;
        padding: 4px 12px;
        border-radius: 8px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
      }
      .xt-q-text {
        font-weight: 800;
        font-size: 21px;
        line-height: 1.4;
        color: #ffffff;
        flex: 1;
        word-break: break-word;
      }
      .xt-q-text img {
        max-height: 80px;
        max-width: 100%;
        border-radius: 8px;
        vertical-align: middle;
        margin: 4px;
        cursor: zoom-in;
      }

      /* Timer Ring */
      .xt-timer-ring-box {
        position: relative;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .xt-timer-svg {
        position: absolute;
        inset: 0;
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .xt-timer-bg {
        fill: none;
        stroke: rgba(255,255,255,0.15);
        stroke-width: 4;
      }
      .xt-timer-bar {
        fill: none;
        stroke: #10b981;
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.25s linear, stroke 0.3s;
      }
      .xt-timer-num {
        font-size: 17px;
        font-weight: 900;
        color: #fff;
        z-index: 1;
      }

      /* Arena Field */
      .xt-arena {
        position: absolute;
        inset: 0;
        z-index: 10;
        cursor: crosshair;
        overflow: hidden;
      }

      /* Targets (Authentic PomyAI Vector & Style) */
      .xt-target {
        position: absolute;
        width: 110px;
        height: 110px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform 0.05s linear;
        filter: drop-shadow(0 10px 18px rgba(0,0,0,0.55));
        user-select: none;
      }
      .xt-target-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .xt-target-label {
        position: relative;
        z-index: 2;
        font-weight: 900;
        font-size: 20px;
        color: #111827;
        text-align: center;
        padding: 4px;
        max-width: 78%;
        max-height: 78%;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1.15;
        word-break: break-word;
      }

      /* Target Hit Vibrations & Explosions */
      .xt-target.hit-correct {
        animation: xtHitExplode 0.6s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
      }
      @keyframes xtHitExplode {
        0% { transform: translate(-50%, -50%) scale(1); filter: brightness(2) drop-shadow(0 0 30px #10b981); }
        50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
      }
      .xt-target.hit-wrong {
        animation: xtHitShake 0.45s ease-in-out;
      }
      @keyframes xtHitShake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        20% { transform: translate(-50%, -50%) translateX(-14px); filter: brightness(1.5) drop-shadow(0 0 20px #ef4444); }
        40% { transform: translate(-50%, -50%) translateX(14px); }
        60% { transform: translate(-50%, -50%) translateX(-8px); }
        80% { transform: translate(-50%, -50%) translateX(8px); }
      }

      /* Crosshairs (Team A Red / Team B Blue) */
      .xt-crosshair {
        position: absolute;
        width: 56px;
        height: 56px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 30;
        transition: transform 0.05s ease-out;
      }
      .xt-crosshair svg {
        width: 100%;
        height: 100%;
      }
      .xt-crosshair.recoil {
        animation: xtRecoil 0.18s cubic-bezier(0.1, 0.9, 0.2, 1);
      }
      @keyframes xtRecoil {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.4); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }

      /* Floating Impact / Score Popups */
      .xt-float-popup {
        position: absolute;
        transform: translate(-50%, -50%);
        font-weight: 900;
        font-size: 32px;
        pointer-events: none;
        z-index: 45;
        animation: xtFloatUp 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        text-shadow: 0 4px 12px rgba(0,0,0,0.8);
      }
      @keyframes xtFloatUp {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
        30% { transform: translate(-50%, -90%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
      }

      /* Bullet Hole Decal */
      .xt-bullet-hole {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: radial-gradient(circle, #000 40%, #451a03 70%, transparent 100%);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(245,158,11,0.5);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 15;
        animation: xtHoleFade 2.5s forwards;
      }
      @keyframes xtHoleFade {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1.4); }
        10% { transform: translate(-50%, -50%) scale(1); }
        70% { opacity: 0.9; }
        100% { opacity: 0; }
      }

      /* Bottom Shortcuts / Instructions Ribbon */
      .xt-bottom-guide {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(8, 28, 33, 0.85);
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 9999px;
        padding: 6px 20px;
        font-size: 12.5px;
        color: #94a3b8;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 20;
        pointer-events: none;
        backdrop-filter: blur(8px);
      }
      .xt-kbd {
        display: inline-block;
        padding: 2px 7px;
        border-radius: 5px;
        background: #1e293b;
        border: 1px solid #475569;
        color: #fde047;
        font-weight: 800;
        font-size: 11px;
      }

      /* Simulated Remote Widget in Game (Bottom-Right) */
      .xt-phone-sim {
        position: absolute;
        bottom: 60px;
        right: 20px;
        width: 200px;
        background: rgba(8, 30, 36, 0.95);
        border: 2px solid #f59e0b;
        border-radius: 18px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        z-index: 45;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .xt-phone-sim.minimized {
        transform: translateY(calc(100% - 36px));
      }
      .xt-phone-btn-shoot {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 80%);
        border: 4px solid #f59e0b;
        color: #fff;
        font-weight: 900;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(239,68,68,0.5);
        transition: transform 0.08s;
      }
      .xt-phone-btn-shoot:active {
        transform: scale(0.92);
      }

      /* Modal Dialogs */
      .xt-modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(8, 20, 24, 0.82);
        backdrop-filter: blur(10px);
        z-index: 55;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .xt-modal-card {
        background: #ffffff;
        color: #0f172a;
        border-radius: 24px;
        padding: 32px 36px;
        max-width: 620px;
        width: 100%;
        box-shadow: 0 25px 60px rgba(0,0,0,0.4);
        text-align: center;
        animation: xtModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }
      @keyframes xtModalIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      /* Mode Choice Cards (PomyAI f_07.3s.jpg) */
      .xt-mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin: 20px 0;
      }
      .xt-mode-card {
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px 10px;
        cursor: pointer;
        background: #f8fafc;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .xt-mode-card:hover {
        border-color: #f59e0b;
        background: #fffbeb;
      }
      .xt-mode-card.active {
        border-color: #f59e0b;
        background: #fffbeb;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);
      }
      .xt-mode-title {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
      }
      .xt-mode-sub {
        font-size: 11.5px;
        color: #64748b;
        font-weight: 600;
      }

      /* Team Badges below Mode */
      .xt-lobby-teams {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .xt-lobby-team-tag {
        font-size: 12.5px;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 9999px;
        border: 1.5px solid;
      }
      .xt-lobby-team-tag.team-a {
        border-color: #0284c7;
        color: #0284c7;
        background: #e0f2fe;
      }
      .xt-lobby-team-tag.team-b {
        border-color: #e11d48;
        color: #e11d48;
        background: #ffe4e6;
      }

      /* Orange Button "Mở phòng" */
      .xt-btn-open-room {
        width: min(80%, 280px);
        margin: 0 auto;
        padding: 14px 28px;
        border-radius: 9999px;
        border: none;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: #fff;
        font-size: 17px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(234, 88, 12, 0.4);
        transition: transform 0.15s, box-shadow 0.15s;
        display: block;
      }
      .xt-btn-open-room:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(234, 88, 12, 0.6);
      }

      /* Room Lobby Card (PomyAI f_21.8s.jpg) */
      .xt-room-card {
        background: #ffffff;
        border-radius: 24px;
        border: 3px solid #fef08a;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        padding: 24px 30px;
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 28px;
        align-items: center;
        text-align: left;
        margin-bottom: 20px;
      }
      .xt-qr-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 12px;
      }
      .xt-qr-wrap canvas {
        width: 200px !important;
        height: 200px !important;
        border-radius: 8px;
      }
      .xt-pin-box {
        background: #fffbeb;
        border: 2px dashed #f59e0b;
        border-radius: 16px;
        padding: 14px 20px;
        text-align: center;
        margin: 12px 0 16px;
      }
      .xt-pin-code {
        font-size: 42px;
        font-weight: 900;
        letter-spacing: 8px;
        color: #0f172a;
        font-variant-numeric: tabular-nums;
      }

      /* Waiting Device Slots */
      .xt-device-slots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .xt-device-slot {
        padding: 10px 20px;
        border-radius: 12px;
        border: 2px dashed #cbd5e1;
        background: #ffffff;
        text-align: center;
        font-size: 13px;
        color: #64748b;
        font-weight: 700;
        min-width: 160px;
      }
      .xt-device-slot.connected {
        border: 2px solid #10b981;
        background: #ecfdf5;
        color: #065f46;
      }
    `;
    document.head.appendChild(style);
  }

  // Synthesized Web Audio Engine
  class XaThuAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playGunshot() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        // Noise crack
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);

        // Low body thump
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playBellHit() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        [880, 1760, 2640].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.2 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        });
      } catch (e) {}
    }

    playCorrect() {
      this.playBellHit();
      if (window.soundFx && typeof window.soundFx.correct === 'function') {
        window.soundFx.correct();
      }
    }

    playWrong() {
      if (window.soundFx && typeof window.soundFx.wrong === 'function') {
        window.soundFx.wrong();
      } else {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(90, now + 0.25);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        } catch (e) {}
      }
    }

    playVictory() {
      if (window.soundFx && typeof window.soundFx.fanfare === 'function') {
        window.soundFx.fanfare();
      }
    }
  }

  // Proper DOM KaTeX renderer
  function renderMathInContainer(el) {
    if (!el) return;
    if (window.FileParser && typeof window.FileParser.renderMath === 'function') {
      window.FileParser.renderMath(el);
    } else if (typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (e) {}
    }
  }

  // Normalize questions
  function normalizeQuestions(rawList) {
    if (!Array.isArray(rawList) || rawList.length === 0) return [];
    return rawList.map((q, idx) => {
      const qText = q.text || q.question || q.content || (`Câu hỏi số ${idx + 1}`);
      const rawOpts = Array.isArray(q.options) ? q.options : [];
      const opts = rawOpts.map(o => {
        if (o && typeof o === 'object') return String(o.text || o.content || o.label || '');
        return String(o != null ? o : '');
      });
      while (opts.length < 4) {
        opts.push(`Đáp án ${String.fromCharCode(65 + opts.length)}`);
      }
      return {
        id: q.id || `q_${idx}`,
        text: qText,
        options: opts.slice(0, 4),
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : (q.answer != null ? q.answer : 0),
        image: q.image || q.imageUrl || null,
        explanation: q.explanation || ''
      };
    });
  }

  // Red Crosshair SVG (Matching PomyAI f_109.0s.jpg)
  const RED_CROSSHAIR_SVG = `
    <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="chGlowRed" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ef4444" flood-opacity="0.8"/>
        </filter>
      </defs>
      <g filter="url(#chGlowRed)">
        <!-- 4 Curved Segments -->
        <path d="M 32 14 A 18 18 0 0 1 50 32" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 50 32 A 18 18 0 0 1 32 50" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 32 50 A 18 18 0 0 1 14 32" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 14 32 A 18 18 0 0 1 32 14" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <!-- 4 Ticks -->
        <line x1="32" y1="6" x2="32" y2="12" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="32" y1="52" x2="32" y2="58" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="32" x2="12" y2="32" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="52" y1="32" x2="58" y2="32" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Center Reticle Dot -->
        <circle cx="32" cy="32" r="2.2" fill="#ef4444"/>
      </g>
    </svg>
  `;

  // Cyan Crosshair SVG for Team B
  const CYAN_CROSSHAIR_SVG = `
    <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="chGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#00f0ff" flood-opacity="0.8"/>
        </filter>
      </defs>
      <g filter="url(#chGlowCyan)">
        <path d="M 32 14 A 18 18 0 0 1 50 32" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 50 32 A 18 18 0 0 1 32 50" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 32 50 A 18 18 0 0 1 14 32" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 14 32 A 18 18 0 0 1 32 14" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="32" y1="6" x2="32" y2="12" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="32" y1="52" x2="32" y2="58" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="32" x2="12" y2="32" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="52" y1="32" x2="58" y2="32" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="2.2" fill="#00f0ff"/>
      </g>
    </svg>
  `;

  // Target Vector Graphic SVG (Exact PomyAI circular target)
  const TARGET_BG_SVG = `
    <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tgtGold" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#f59e0b"/>
          <stop offset="85%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </radialGradient>
        <radialGradient id="tgtRed" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="70%" stop-color="#b91c1c"/>
          <stop offset="100%" stop-color="#7f1d1d"/>
        </radialGradient>
        <linearGradient id="tgtIvory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f5f2e8"/>
        </linearGradient>
      </defs>
      <!-- Outer Gold Rim -->
      <circle cx="100" cy="100" r="96" fill="url(#tgtGold)"/>
      <circle cx="100" cy="100" r="90" fill="#a16207" opacity="0.3"/>
      <!-- Cream Outer Spacer -->
      <circle cx="100" cy="100" r="86" fill="#fdfcf7"/>
      <!-- Main Crimson Red Ring -->
      <circle cx="100" cy="100" r="80" fill="url(#tgtRed)"/>
      <path d="M 40 45 A 76 76 0 0 1 125 25 A 72 72 0 0 0 45 60 Z" fill="#ffffff" opacity="0.4"/>
      <!-- Inner White Spacer -->
      <circle cx="100" cy="100" r="62" fill="#fdfcf7"/>
      <!-- Secondary Red Ring -->
      <circle cx="100" cy="100" r="59" fill="none" stroke="#b91c1c" stroke-width="4.5"/>
      <!-- Center Ivory Face -->
      <circle cx="100" cy="100" r="52" fill="url(#tgtIvory)"/>
      <circle cx="100" cy="100" r="52" fill="none" stroke="#e2dfd2" stroke-width="1.5"/>
    </svg>
  `;

  // Main Launcher
  window.launchXaThuGame = function launchXaThuGame(container, options = {}) {
    if (!container) return;
    injectStyles();

    const audio = new XaThuAudio();
    const rawQuestions = Array.isArray(options.questions) && options.questions.length > 0
      ? options.questions
      : [
          { text: "8 + 7 = ?", options: ["15", "14", "13", "16"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correctIndex: 1 },
          { text: "Số nào cộng với 36 thì được 90?", options: ["64", "56", "44", "54"], correctIndex: 3 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 }
        ];

    const questions = normalizeQuestions(rawQuestions);

    const state = {
      destroyed: false,
      mode: 'team_single', // 'individual' | 'team_single' | 'team_double'
      targetSpeed: 'normal', // 'normal' | 'fast' | 'static'
      secondsPerQuestion: options.secondsPerQuestion || 30,
      currentQIndex: 0,
      timeLeft: 30,
      timerInterval: null,
      isAnsweringActive: false,
      qFontSize: 21,
      isPaused: false,
      roomPin: String(Math.floor(100000 + Math.random() * 900000)),
      connectedDevices: {
        a: false,
        b: false
      },

      // Teams
      teamA: {
        name: 'Đội A',
        color: '#ef4444',
        score: 0,
        cooldownUntil: 0
      },
      teamB: {
        name: 'Đội B',
        color: '#00f0ff',
        score: 0,
        cooldownUntil: 0
      },

      // Floating Targets
      targets: [],
      animFrameId: null,

      // Crosshairs
      crosshairs: {
        a: { x: 50, y: 50, targetX: 50, targetY: 50 },
        b: { x: 50, y: 50, targetX: 50, targetY: 50 }
      }
    };

    // Cross-tab / Mobile Phone Communication Bus
    let bc = null;
    try {
      bc = new BroadcastChannel('xa_thu_channel');
    } catch (e) {}

    function broadcastHostState() {
      const payload = {
        type: 'state',
        pin: state.roomPin,
        isQuestionActive: state.isAnsweringActive,
        isPaused: state.isPaused,
        currentQIndex: state.currentQIndex
      };
      if (bc) {
        try { bc.postMessage(payload); } catch (e) {}
      }
      try {
        localStorage.setItem('xa_thu_host_event', JSON.stringify(payload));
      } catch (e) {}
    }

    function onRemoteMessage(data) {
      if (!data || data.pin !== state.roomPin) return;
      const teamKey = data.team === 'b' ? 'b' : 'a';

      if (data.type === 'join' || data.type === 'heartbeat') {
        state.connectedDevices[teamKey] = true;
        updateRoomDeviceSlots();
      } else if (data.type === 'aim') {
        if (typeof data.x === 'number' && typeof data.y === 'number') {
          state.crosshairs[teamKey].targetX = data.x;
          state.crosshairs[teamKey].targetY = data.y;
        }
      } else if (data.type === 'shoot') {
        fireShot(teamKey);
      }
    }

    if (bc) {
      bc.onmessage = (ev) => onRemoteMessage(ev.data);
    }
    window.addEventListener('storage', (ev) => {
      if (ev.key === 'xa_thu_remote_event' && ev.newValue) {
        try { onRemoteMessage(JSON.parse(ev.newValue)); } catch (e) {}
      }
    });

    // Root HTML Structure
    container.innerHTML = `
      <div class="xt-root" id="xt-root">
        <!-- Floor Rail at Bottom -->
        <div class="xt-floor-rail"></div>

        <!-- Top HUD -->
        <div class="xt-hud-top">
          <div id="xt-hud-scores" style="display: flex; gap: 14px;"></div>
          <div class="xt-hud-actions">
            <button class="xt-btn-pill" id="xt-btn-phone-sim" title="Mở tay cầm ảo">
              <span>📱</span> <span>Tay cầm</span>
            </button>
            <button class="xt-btn-icon" id="xt-btn-sound" title="Bật/Tắt âm thanh">🔊</button>
            <button class="xt-btn-pill" id="xt-btn-pause">Tạm dừng</button>
            <button class="xt-btn-pill danger" id="xt-btn-exit">Kết thúc</button>
          </div>
        </div>

        <!-- Question Card Banner -->
        <div class="xt-qcard-wrapper" id="xt-qcard-wrapper">
          <div class="xt-qcard">
            <div class="xt-q-left">
              <span class="xt-q-badge" id="xt-q-badge">CÂU 1</span>
              <div class="xt-q-text" id="xt-q-text"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="xt-timer-ring-box">
                <svg class="xt-timer-svg" viewBox="0 0 48 48">
                  <circle class="xt-timer-bg" cx="24" cy="24" r="20"/>
                  <circle class="xt-timer-bar" id="xt-timer-bar" cx="24" cy="24" r="20"
                          stroke-dasharray="125.6" stroke-dashoffset="0"/>
                </svg>
                <span class="xt-timer-num" id="xt-timer-num">30</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Shooting Gallery Arena -->
        <div class="xt-arena" id="xt-arena">
          <!-- Crosshair A (Red) -->
          <div class="xt-crosshair" id="xt-crosshair-a" style="left: 50%; top: 50%;">
            ${RED_CROSSHAIR_SVG}
          </div>
          <!-- Crosshair B (Cyan) -->
          <div class="xt-crosshair" id="xt-crosshair-b" style="left: 50%; top: 50%; display: none;">
            ${CYAN_CROSSHAIR_SVG}
          </div>
        </div>

        <!-- Bottom Keyboard Shortcuts Ribbon -->
        <div class="xt-bottom-guide" id="xt-bottom-guide">
          <span style="font-weight: 800; color: #fbbf24;">⚡ PHÍM BẮN NHANH:</span>
          <span style="color: #fca5a5;">
            <strong>Đội A:</strong> <span class="xt-kbd">Q</span><span class="xt-kbd">W</span><span class="xt-kbd">E</span><span class="xt-kbd">R</span>
          </span>
          <span style="opacity: 0.4;">|</span>
          <span style="color: #67e8f9;">
            <strong>Đội B:</strong> <span class="xt-kbd">U</span><span class="xt-kbd">I</span><span class="xt-kbd">O</span><span class="xt-kbd">P</span>
          </span>
          <span style="opacity: 0.4;">|</span>
          <span>👉 Hoặc <strong>nhấp chuột trực tiếp</strong> vào bia</span>
        </div>

        <!-- Simulated In-Game Phone Remote Widget -->
        <div class="xt-phone-sim" id="xt-phone-sim-widget" style="display: none;">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 800; color: #f59e0b;">📱 Tay cầm ảo</span>
            <button id="xt-sim-close" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 15px;">✕</button>
          </div>
          <div style="font-size: 11px; color: #94a3b8;">Mã PIN: <strong style="color: #fde047;">${state.roomPin}</strong></div>
          <button class="xt-phone-btn-shoot" id="xt-sim-shoot-btn">BẮN</button>
          <div style="font-size: 10.5px; color: #64748b; text-align: center;">Bấm để bắn tại vị trí chuột</div>
        </div>

        <!-- Modal Mount Point -->
        <div id="xt-modal-mount"></div>
      </div>
    `;

    const rootEl = container.querySelector('#xt-root');
    const arenaEl = container.querySelector('#xt-arena');
    const modalMount = container.querySelector('#xt-modal-mount');
    const crosshairA = container.querySelector('#xt-crosshair-a');
    const crosshairB = container.querySelector('#xt-crosshair-b');
    const scoresContainer = container.querySelector('#xt-hud-scores');
    const timerBar = container.querySelector('#xt-timer-bar');
    const timerNum = container.querySelector('#xt-timer-num');
    const qBadge = container.querySelector('#xt-q-badge');
    const qText = container.querySelector('#xt-q-text');
    const phoneSimWidget = container.querySelector('#xt-phone-sim-widget');

    // Update Top Score HUD
    function updateScoreHud() {
      if (state.mode === 'individual') {
        scoresContainer.innerHTML = `
          <div class="xt-score-badge solo">
            <span style="font-size: 18px;">🎯</span>
            <div><div class="xt-badge-name">XẠ THỦ</div></div>
            <div class="xt-badge-score">${state.teamA.score}</div>
          </div>
        `;
      } else {
        scoresContainer.innerHTML = `
          <div class="xt-score-badge team-a">
            <span style="font-size: 18px;">🔴</span>
            <div><div class="xt-badge-name">${state.teamA.name}</div></div>
            <div class="xt-badge-score">${state.teamA.score}</div>
          </div>
          <div class="xt-score-badge team-b">
            <span style="font-size: 18px;">🔵</span>
            <div><div class="xt-badge-name">${state.teamB.name}</div></div>
            <div class="xt-badge-score">${state.teamB.score}</div>
          </div>
        `;
      }
    }

    // Spawn 4 Round Floating Targets in the Arena
    function spawnTargets(optionsList, correctIdx) {
      // Clear old targets
      arenaEl.querySelectorAll('.xt-target').forEach(t => t.remove());
      state.targets = [];

      const arenaRect = arenaEl.getBoundingClientRect();
      const w = arenaRect.width || 900;
      const h = arenaRect.height || 600;

      // Waypoints / slots for the 4 targets (matching PomyAI f_109.0s.jpg layout)
      const baseSlots = [
        { x: 18, y: 55, dirX: 1,  speed: 0.12 },
        { x: 42, y: 68, dirX: -1, speed: 0.14 },
        { x: 68, y: 45, dirX: 1,  speed: 0.15 },
        { x: 86, y: 72, dirX: -1, speed: 0.13 }
      ];

      optionsList.forEach((optText, i) => {
        const slot = baseSlots[i] || { x: 20 + i * 20, y: 60, dirX: 1, speed: 0.12 };
        const el = document.createElement('div');
        el.className = 'xt-target';
        el.dataset.optIdx = String(i);
        el.dataset.isCorrect = String(i === correctIdx);

        el.innerHTML = `
          <div class="xt-target-bg">${TARGET_BG_SVG}</div>
          <div class="xt-target-label">${optText}</div>
        `;

        el.style.left = `${slot.x}%`;
        el.style.top = `${slot.y}%`;

        // Direct click/touch shooting
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!state.isAnsweringActive) return;
          fireAtTarget(el, 'a');
        });

        arenaEl.appendChild(el);
        renderMathInContainer(el);

        state.targets.push({
          element: el,
          optIdx: i,
          isCorrect: (i === correctIdx),
          x: slot.x,
          y: slot.y,
          originY: slot.y,
          dirX: slot.dirX,
          speed: state.targetSpeed === 'fast' ? slot.speed * 1.8 : (state.targetSpeed === 'static' ? 0 : slot.speed),
          bobPhase: Math.random() * Math.PI * 2
        });
      });
    }

    // Animation Loop for Moving Targets & Lerping Crosshairs
    function animationLoop() {
      if (state.destroyed) return;

      const now = Date.now() / 1000;

      // 1. Move targets gently across gallery
      state.targets.forEach(tgt => {
        if (!tgt.element || tgt.element.classList.contains('hit-correct')) return;

        tgt.x += tgt.dirX * tgt.speed;
        if (tgt.x < 12) {
          tgt.x = 12;
          tgt.dirX = 1;
        } else if (tgt.x > 88) {
          tgt.x = 88;
          tgt.dirX = -1;
        }

        // Gentle bobbing
        const bob = Math.sin(now * 2 + tgt.bobPhase) * 3;
        tgt.y = tgt.originY + bob;

        tgt.element.style.left = `${tgt.x}%`;
        tgt.element.style.top = `${tgt.y}%`;
      });

      // 2. Smooth Crosshair Interpolation (Lerp)
      ['a', 'b'].forEach(team => {
        const ch = state.crosshairs[team];
        ch.x += (ch.targetX - ch.x) * 0.22;
        ch.y += (ch.targetY - ch.y) * 0.22;

        const el = team === 'a' ? crosshairA : crosshairB;
        if (el) {
          el.style.left = `${ch.x}%`;
          el.style.top = `${ch.y}%`;
        }
      });

      state.animFrameId = requestAnimationFrame(animationLoop);
    }

    // Load Question
    function loadQuestion(idx) {
      if (idx >= questions.length) {
        showVictoryModal();
        return;
      }

      state.currentQIndex = idx;
      state.isAnsweringActive = true;
      state.timeLeft = state.secondsPerQuestion;

      const q = questions[idx];
      qBadge.textContent = `CÂU ${idx + 1} / ${questions.length}`;
      qText.style.fontSize = `${state.qFontSize}px`;
      qText.innerHTML = q.text;

      if (q.image) {
        const img = document.createElement('img');
        img.src = q.image;
        img.onclick = (e) => {
          e.stopPropagation();
          if (window.ZoomPanOverlay && typeof window.ZoomPanOverlay.open === 'function') {
            window.ZoomPanOverlay.open(img.src);
          } else if (window.EyZoomPanOverlay && typeof window.EyZoomPanOverlay.open === 'function') {
            window.EyZoomPanOverlay.open(img.src);
          } else {
            window.open(img.src, '_blank');
          }
        };
        qText.appendChild(img);
      }
      renderMathInContainer(qText);

      // Spawn Targets
      spawnTargets(q.options, q.correctIndex);

      // Reset and Start Countdown
      startTimer();
      updateScoreHud();
      broadcastHostState();
    }

    // Timer Countdown
    function startTimer() {
      clearInterval(state.timerInterval);
      updateTimerDisplay();

      state.timerInterval = setInterval(() => {
        if (state.isPaused || !state.isAnsweringActive) return;
        state.timeLeft--;
        updateTimerDisplay();

        if (state.timeLeft <= 0) {
          clearInterval(state.timerInterval);
          handleTimeUp();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      timerNum.textContent = String(state.timeLeft);
      const total = state.secondsPerQuestion;
      const progress = Math.max(0, state.timeLeft / total);
      const circumference = 125.6; // 2 * PI * 20
      timerBar.style.strokeDashoffset = String(circumference * (1 - progress));

      if (state.timeLeft <= 5) {
        timerBar.style.stroke = '#ef4444';
      } else if (state.timeLeft <= 10) {
        timerBar.style.stroke = '#f59e0b';
      } else {
        timerBar.style.stroke = '#10b981';
      }
    }

    function handleTimeUp() {
      state.isAnsweringActive = false;
      audio.playWrong();
      showFloatingPopup('HẾT GIỜ!', 50, 50, '#f59e0b');

      // Highlight the correct target
      const correctTarget = state.targets.find(t => t.isCorrect);
      if (correctTarget && correctTarget.element) {
        correctTarget.element.classList.add('hit-correct');
      }

      setTimeout(() => {
        if (!state.destroyed) {
          loadQuestion(state.currentQIndex + 1);
        }
      }, 2000);
    }

    // Fire Shot from Crosshair Position
    function fireShot(teamKey = 'a') {
      if (!state.isAnsweringActive) return;
      const now = Date.now();
      const teamObj = teamKey === 'a' ? state.teamA : state.teamB;
      if (now < teamObj.cooldownUntil) return;

      const ch = state.crosshairs[teamKey];
      const chEl = teamKey === 'a' ? crosshairA : crosshairB;

      // Recoil & Gunshot sound
      if (chEl) {
        chEl.classList.remove('recoil');
        void chEl.offsetWidth;
        chEl.classList.add('recoil');
      }
      audio.playGunshot();

      // Bullet Hole Decal
      spawnBulletHole(ch.x, ch.y);

      // Check collision with targets
      const arenaRect = arenaEl.getBoundingClientRect();
      const shotPixelX = (ch.x / 100) * arenaRect.width;
      const shotPixelY = (ch.y / 100) * arenaRect.height;

      let hitTarget = null;
      for (const tgt of state.targets) {
        if (!tgt.element || tgt.element.classList.contains('hit-correct')) continue;
        const tgtRect = tgt.element.getBoundingClientRect();
        const relTgtX = tgtRect.left - arenaRect.left + tgtRect.width / 2;
        const relTgtY = tgtRect.top - arenaRect.top + tgtRect.height / 2;
        const dist = Math.hypot(shotPixelX - relTgtX, shotPixelY - relTgtY);

        if (dist <= tgtRect.width / 2) {
          hitTarget = tgt;
          break;
        }
      }

      if (hitTarget) {
        handleHitTarget(hitTarget, teamKey);
      }
    }

    // Direct fire at a target element
    function fireAtTarget(targetEl, teamKey = 'a') {
      if (!state.isAnsweringActive) return;
      const now = Date.now();
      const teamObj = teamKey === 'a' ? state.teamA : state.teamB;
      if (now < teamObj.cooldownUntil) return;

      const tgt = state.targets.find(t => t.element === targetEl);
      if (!tgt) return;

      // Align crosshair to target and shoot
      state.crosshairs[teamKey].x = tgt.x;
      state.crosshairs[teamKey].y = tgt.y;
      state.crosshairs[teamKey].targetX = tgt.x;
      state.crosshairs[teamKey].targetY = tgt.y;

      audio.playGunshot();
      spawnBulletHole(tgt.x, tgt.y);
      handleHitTarget(tgt, teamKey);
    }

    // Handle collision result
    function handleHitTarget(tgt, teamKey) {
      const teamObj = teamKey === 'a' ? state.teamA : state.teamB;

      if (tgt.isCorrect) {
        // TRÚNG HỒNG TÂM - ĐÚNG!
        state.isAnsweringActive = false;
        clearInterval(state.timerInterval);
        teamObj.score += 10;
        updateScoreHud();

        tgt.element.classList.add('hit-correct');
        audio.playCorrect();
        showFloatingPopup(`+10 ${teamObj.name}!`, tgt.x, tgt.y - 10, teamObj.color);

        broadcastHostState();

        setTimeout(() => {
          if (!state.destroyed) {
            loadQuestion(state.currentQIndex + 1);
          }
        }, 1600);
      } else {
        // BẮN NHẦM - SAI!
        teamObj.cooldownUntil = Date.now() + 1500;
        tgt.element.classList.remove('hit-wrong');
        void tgt.element.offsetWidth;
        tgt.element.classList.add('hit-wrong');

        audio.playWrong();
        showFloatingPopup('❌ Chưa chính xác!', tgt.x, tgt.y - 10, '#ef4444');
      }
    }

    function spawnBulletHole(percentX, percentY) {
      const hole = document.createElement('div');
      hole.className = 'xt-bullet-hole';
      hole.style.left = `${percentX}%`;
      hole.style.top = `${percentY}%`;
      arenaEl.appendChild(hole);
      setTimeout(() => hole.remove(), 2500);
    }

    function showFloatingPopup(text, percentX, percentY, color = '#10b981') {
      const pop = document.createElement('div');
      pop.className = 'xt-float-popup';
      pop.textContent = text;
      pop.style.left = `${percentX}%`;
      pop.style.top = `${percentY}%`;
      pop.style.color = color;
      arenaEl.appendChild(pop);
      setTimeout(() => pop.remove(), 900);
    }

    // Arena Mouse Move (Controls Crosshair A)
    arenaEl.addEventListener('mousemove', (e) => {
      const rect = arenaEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      state.crosshairs.a.targetX = Math.max(2, Math.min(98, x));
      state.crosshairs.a.targetY = Math.max(5, Math.min(95, y));
    });

    // Arena Mouse Click (Fire Team A)
    arenaEl.addEventListener('click', (e) => {
      if (!state.isAnsweringActive) return;
      fireShot('a');
    });

    // Keyboard Buzzer Shortcuts
    function onKeyDown(e) {
      if (!state.isAnsweringActive) return;
      const k = e.key.toUpperCase();

      // Team A: Q, W, E, R for targets 0, 1, 2, 3 OR Space to shoot crosshair
      if (k === ' ' || k === 'SPACEBAR') {
        fireShot('a');
      } else if (k === 'Q' && state.targets[0]) {
        fireAtTarget(state.targets[0].element, 'a');
      } else if (k === 'W' && state.targets[1]) {
        fireAtTarget(state.targets[1].element, 'a');
      } else if (k === 'E' && state.targets[2]) {
        fireAtTarget(state.targets[2].element, 'a');
      } else if (k === 'R' && state.targets[3]) {
        fireAtTarget(state.targets[3].element, 'a');
      }

      // Team B: Enter to shoot crosshair OR U, I, O, P for targets 0, 1, 2, 3
      if (k === 'ENTER') {
        fireShot('b');
      } else if (k === 'U' && state.targets[0]) {
        fireAtTarget(state.targets[0].element, 'b');
      } else if (k === 'I' && state.targets[1]) {
        fireAtTarget(state.targets[1].element, 'b');
      } else if (k === 'O' && state.targets[2]) {
        fireAtTarget(state.targets[2].element, 'b');
      } else if (k === 'P' && state.targets[3]) {
        fireAtTarget(state.targets[3].element, 'b');
      }
    }
    window.addEventListener('keydown', onKeyDown);

    // Simulated Phone Remote Widget Controls
    const simWidget = container.querySelector('#xt-phone-sim-widget');
    const btnSimToggle = container.querySelector('#xt-btn-phone-sim');
    const simCloseBtn = container.querySelector('#xt-sim-close');
    const simShootBtn = container.querySelector('#xt-sim-shoot-btn');

    btnSimToggle?.addEventListener('click', () => {
      simWidget.style.display = simWidget.style.display === 'none' ? 'flex' : 'none';
    });
    simCloseBtn?.addEventListener('click', () => {
      simWidget.style.display = 'none';
    });
    simShootBtn?.addEventListener('click', () => {
      fireShot('a');
    });

    // Top Action Buttons
    container.querySelector('#xt-btn-sound')?.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      container.querySelector('#xt-btn-sound').textContent = audio.enabled ? '🔊' : '🔇';
    });

    container.querySelector('#xt-btn-pause')?.addEventListener('click', () => {
      state.isPaused = !state.isPaused;
      container.querySelector('#xt-btn-pause').textContent = state.isPaused ? '▶ Tiếp tục' : 'Tạm dừng';
      broadcastHostState();
    });

    container.querySelector('#xt-btn-exit')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn kết thúc đấu trường Xạ Thủ?')) {
        destroy();
        if (typeof options.onExit === 'function') options.onExit();
      }
    });

    // ========================================================================
    // SCREEN 1: "CHỌN KIỂU CHƠI" (Matching PomyAI f_07.3s.jpg)
    // ========================================================================
    function showModeSelectionModal() {
      modalMount.innerHTML = `
        <div class="xt-modal-overlay">
          <div class="xt-modal-card">
            <!-- Icon & Heading -->
            <div style="font-size: 52px; margin-bottom: 6px;">🎯</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px;">
              XẠ THỦ TRI THỨC
            </div>
            <div style="font-size: 28px; font-weight: 900; color: #0f172a; margin-top: 4px;">
              Chọn kiểu chơi
            </div>

            <!-- 3 Mode Cards -->
            <div class="xt-mode-grid" id="xt-mode-grid">
              <div class="xt-mode-card ${state.mode === 'individual' ? 'active' : ''}" data-mode="individual">
                <div style="font-size: 28px;">👤</div>
                <div class="xt-mode-title">Cá nhân</div>
                <div class="xt-mode-sub">1 người chơi</div>
              </div>

              <div class="xt-mode-card ${state.mode === 'team_single' ? 'active' : ''}" data-mode="team_single">
                <div style="font-size: 28px;">⚔️</div>
                <div class="xt-mode-title">Đơn theo đội</div>
                <div class="xt-mode-sub">2 đội (1 súng/đội)</div>
              </div>

              <div class="xt-mode-card ${state.mode === 'team_double' ? 'active' : ''}" data-mode="team_double">
                <div style="font-size: 28px;">🔥</div>
                <div class="xt-mode-title">Đôi theo đội</div>
                <div class="xt-mode-sub">2 đội (2 súng/đội)</div>
              </div>
            </div>

            <!-- Team Badges Preview -->
            <div class="xt-lobby-teams" id="xt-lobby-teams">
              <span class="xt-lobby-team-tag team-a">🔵 Đội A 🔫</span>
              <span class="xt-lobby-team-tag team-b">🔴 Đội B 🔫</span>
            </div>

            <!-- Open Room Button -->
            <button class="xt-btn-open-room" id="xt-btn-open-room">
              Mở phòng
            </button>
          </div>
        </div>
      `;

      // Mode Selection clicks
      modalMount.querySelectorAll('.xt-mode-card').forEach(card => {
        card.addEventListener('click', () => {
          modalMount.querySelectorAll('.xt-mode-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          state.mode = card.dataset.mode;

          const teamBox = modalMount.querySelector('#xt-lobby-teams');
          if (state.mode === 'individual') {
            teamBox.innerHTML = `<span class="xt-lobby-team-tag team-a">🎯 Xạ thủ duy nhất</span>`;
            crosshairB.style.display = 'none';
          } else {
            teamBox.innerHTML = `
              <span class="xt-lobby-team-tag team-a">🔵 Đội A 🔫</span>
              <span class="xt-lobby-team-tag team-b">🔴 Đội B 🔫</span>
            `;
            crosshairB.style.display = 'block';
          }
        });
      });

      // "Mở phòng" Button click
      modalMount.querySelector('#xt-btn-open-room')?.addEventListener('click', () => {
        audio.init();
        showRoomLobbyModal();
      });
    }

    // ========================================================================
    // SCREEN 2: ROOM / PIN / QR CODE SCREEN (Matching PomyAI f_21.8s.jpg)
    // ========================================================================
    function showRoomLobbyModal() {
      const phoneUrl = `${window.location.origin}/ey/ban.html?pin=${state.roomPin}`;

      modalMount.innerHTML = `
        <div class="xt-modal-overlay">
          <div class="xt-modal-card" style="max-width: 680px;">
            <!-- Top Card with QR & PIN -->
            <div class="xt-room-card">
              <!-- QR Canvas -->
              <div class="xt-qr-wrap">
                <canvas id="xt-qr-canvas"></canvas>
                <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 6px;">
                  Quét mã để mở tay cầm
                </div>
              </div>

              <!-- PIN Info -->
              <div>
                <div style="font-size: 13.5px; font-weight: 800; color: #0284c7;">
                  Không quét được? Mở trình duyệt vào <strong>/ey/ban.html</strong> rồi gõ mã
                </div>

                <div class="xt-pin-box">
                  <div class="xt-pin-code">${state.roomPin}</div>
                </div>

                <div style="font-size: 13px; color: #475569; font-weight: 600; line-height: 1.45;">
                  💡 Cầm điện thoại như đèn pin, lia để ngắm, chạm tấm bia trên máy để bắn.
                </div>
              </div>
            </div>

            <!-- Device Connection Status Slots -->
            <div class="xt-device-slots" id="xt-device-slots">
              <div class="xt-device-slot ${state.connectedDevices.a ? 'connected' : ''}" id="xt-slot-a">
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">Đội A</div>
                <div>${state.connectedDevices.a ? '✅ Đã kết nối 📱' : 'đang chờ máy'}</div>
              </div>
              <div class="xt-device-slot ${state.connectedDevices.b ? 'connected' : ''}" id="xt-slot-b">
                <div style="font-size: 14px; font-weight: 800; color: #e11d48;">Đội B</div>
                <div>${state.connectedDevices.b ? '✅ Đã kết nối 📱' : 'đang chờ máy'}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button class="xt-btn-open-room" id="xt-btn-start-battle" style="width: 220px; margin: 0; background: linear-gradient(135deg, #10b981, #059669);">
                🚀 Bắt đầu
              </button>
              <button class="xt-btn-pill" id="xt-btn-test-sim" style="color: #0f172a; border-color: #cbd5e1; background: #f8fafc; font-size: 14px; padding: 12px 20px;">
                📱 Mở tay cầm ảo trên màn hình
              </button>
            </div>
          </div>
        </div>
      `;

      // Render QR Code
      const qrCanvas = modalMount.querySelector('#xt-qr-canvas');
      if (qrCanvas && window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        window.QRCode.toCanvas(qrCanvas, phoneUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        }, (err) => {
          if (err) console.warn('QR render error:', err);
        });
      }

      // "Bắt đầu" Click -> Start Game Arena!
      modalMount.querySelector('#xt-btn-start-battle')?.addEventListener('click', () => {
        modalMount.innerHTML = '';
        startGameplay();
      });

      // "Mở tay cầm ảo"
      modalMount.querySelector('#xt-btn-test-sim')?.addEventListener('click', () => {
        simWidget.style.display = 'flex';
        modalMount.innerHTML = '';
        startGameplay();
      });
    }

    function updateRoomDeviceSlots() {
      const slotA = modalMount.querySelector('#xt-slot-a');
      const slotB = modalMount.querySelector('#xt-slot-b');
      if (slotA && state.connectedDevices.a) {
        slotA.className = 'xt-device-slot connected';
        slotA.innerHTML = `<div style="font-weight: 800; color: #0284c7;">Đội A</div><div>✅ Đã kết nối 📱</div>`;
      }
      if (slotB && state.connectedDevices.b) {
        slotB.className = 'xt-device-slot connected';
        slotB.innerHTML = `<div style="font-weight: 800; color: #e11d48;">Đội B</div><div>✅ Đã kết nối 📱</div>`;
      }
    }

    // Start Gameplay
    function startGameplay() {
      audio.init();
      animationLoop();
      loadQuestion(0);
    }

    // Victory Celebration Modal
    function showVictoryModal() {
      state.isAnsweringActive = false;
      clearInterval(state.timerInterval);
      audio.playVictory();

      const aWon = state.teamA.score > state.teamB.score;
      const bWon = state.teamB.score > state.teamA.score;
      let title = '';
      let sub = '';

      if (state.mode === 'individual') {
        title = '🏆 HOÀN THÀNH THỬ THÁCH XẠ THỦ!';
        sub = `Bạn đã xuất sắc ghi được tổng cộng ${state.teamA.score} điểm!`;
      } else if (aWon) {
        title = `🎉 ${state.teamA.name.toUpperCase()} CHIẾN THẮNG! 🏆`;
        sub = `${state.teamA.name} thiện xạ xuất sắc với ${state.teamA.score} điểm!`;
      } else if (bWon) {
        title = `🎉 ${state.teamB.name.toUpperCase()} CHIẾN THẮNG! 🏆`;
        sub = `${state.teamB.name} thiện xạ xuất sắc với ${state.teamB.score} điểm!`;
      } else {
        title = '🤝 TRẬN ĐẤU HOÀ ĐIỂM!';
        sub = `Hai đội ngang tài ngang sức với tỷ số ${state.teamA.score} - ${state.teamB.score}!`;
      }

      modalMount.innerHTML = `
        <div class="xt-modal-overlay">
          <div class="xt-modal-card">
            <div style="font-size: 56px; margin-bottom: 8px;">🏆</div>
            <div style="font-size: 26px; font-weight: 900; color: #0f172a;">${title}</div>
            <div style="font-size: 14.5px; color: #64748b; margin: 8px 0 20px;">${sub}</div>

            <!-- Scores -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px;">
              <div style="background: #eff6ff; border: 2px solid #0284c7; border-radius: 16px; padding: 14px;">
                <div style="font-size: 15px; font-weight: 800; color: #0284c7;">🔴 ${state.teamA.name}</div>
                <div style="font-size: 38px; font-weight: 900; color: #0369a1; margin-top: 4px;">${state.teamA.score}</div>
              </div>
              <div style="background: #fff1f2; border: 2px solid #e11d48; border-radius: 16px; padding: 14px;">
                <div style="font-size: 15px; font-weight: 800; color: #e11d48;">🔵 ${state.teamB.name}</div>
                <div style="font-size: 38px; font-weight: 900; color: #be123c; margin-top: 4px;">${state.teamB.score}</div>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="xt-btn-open-room" id="xt-btn-replay" style="margin: 0; flex: 1; background: linear-gradient(135deg, #10b981, #059669);">
                🔄 Bắn lại lượt mới
              </button>
              <button class="xt-btn-pill" id="xt-btn-exit-lobby" style="color: #0f172a; border-color: #cbd5e1; background: #f8fafc; font-size: 14px; padding: 12px 20px; flex: 1; justify-content: center;">
                🚪 Về danh mục
              </button>
            </div>
          </div>
        </div>
      `;

      modalMount.querySelector('#xt-btn-replay')?.addEventListener('click', () => {
        state.teamA.score = 0;
        state.teamB.score = 0;
        showModeSelectionModal();
      });

      modalMount.querySelector('#xt-btn-exit-lobby')?.addEventListener('click', () => {
        destroy();
        if (typeof options.onExit === 'function') options.onExit();
      });
    }

    // Destroy & Cleanup
    function destroy() {
      state.destroyed = true;
      clearInterval(state.timerInterval);
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
      container.innerHTML = '';
    }

    // Launch Step 1
    showModeSelectionModal();

    return {
      destroy
    };
  };
})();
