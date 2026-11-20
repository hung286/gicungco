/**
 * TRÒ CHƠI ĐẢO BĂNG (ICEBERG SURVIVAL BATTLE)
 * Bám sát 100% thiết kế, hiệu ứng tan băng thời gian thực, cứu hộ chim cánh cụt ("TÕM! 💦")
 * từ video mẫu và tích hợp đầy đủ bộ câu hỏi iMath/Azota (KaTeX, phóng to ảnh, Trắc nghiệm / Đúng-Sai / Trả lời ngắn).
 */
(function () {
  'use strict';

  const TEAM_PRESETS = [
    {
      id: 0,
      defaultName: 'Đội 1',
      color: '#ef4444',
      border: '#e11d48',
      lightBg: '#ffe4e6',
      sprite: '/ey/games/dao-bang/bear_red.webp',
      xPercentByCount: { 2: 29, 3: 26, 4: 23 },
      rescueSide: 'left',
      rescueSlotOffset: 0
    },
    {
      id: 1,
      defaultName: 'Đội 2',
      color: '#3b82f6',
      border: '#2563eb',
      lightBg: '#dbeafe',
      sprite: '/ey/games/dao-bang/bear_blue.webp',
      xPercentByCount: { 2: 71, 3: 50, 4: 41 },
      rescueSide: 'right',
      rescueSlotOffset: 0
    },
    {
      id: 2,
      defaultName: 'Đội 3',
      color: '#f59e0b',
      border: '#d97706',
      lightBg: '#fef3c7',
      sprite: '/ey/games/dao-bang/bear_yellow.webp',
      xPercentByCount: { 2: 50, 3: 74, 4: 59 },
      rescueSide: 'right',
      rescueSlotOffset: 1
    },
    {
      id: 3,
      defaultName: 'Đội 4',
      color: '#22c55e',
      border: '#16a34a',
      lightBg: '#dcfce7',
      sprite: '/ey/games/dao-bang/bear_green.webp',
      xPercentByCount: { 2: 50, 3: 74, 4: 77 },
      rescueSide: 'left',
      rescueSlotOffset: 1
    }
  ];

  const MAX_ICE_SECONDS = 45;
  const CORRECT_BONUS_SECONDS = 5;
  const WRONG_PENALTY_SECONDS = 10;
  const QUESTION_TIME_LIMIT = 30;

  // Web Audio Synthesizer for crisp Arctic & Splash sound effects
  class DaoBangAudio {
    constructor() {
      this.enabled = true;
      this.ctx = null;
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

    playTone(freq, type = 'sine', duration = 0.15, vol = 0.18, slideTo = null) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
        }
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    playCountdownTick(isGo = false) {
      if (isGo) {
        this.playTone(587.33, 'triangle', 0.12, 0.22);
        setTimeout(() => this.playTone(880, 'triangle', 0.3, 0.25), 100);
      } else {
        this.playTone(440, 'sine', 0.15, 0.18);
      }
    }

    playCorrect() {
      this.playTone(523.25, 'triangle', 0.12, 0.22);
      setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.22), 90);
      setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.25), 180);
    }

    playWrong() {
      this.playTone(240, 'sawtooth', 0.18, 0.2, 160);
      setTimeout(() => this.playTone(175, 'sawtooth', 0.26, 0.22, 115), 140);
    }

    playSplash() {
      this.playTone(320, 'sine', 0.35, 0.25, 75);
      setTimeout(() => this.playTone(180, 'triangle', 0.4, 0.22, 55), 120);
      setTimeout(() => this.playTone(520, 'sine', 0.18, 0.15, 680), 350);
    }

    playVictory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => {
        setTimeout(() => this.playTone(n, 'triangle', 0.24, 0.24), i * 120);
      });
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatRichContent(text) {
    if (!text) return '';
    let safe = escapeHtml(text);
    safe = safe.replace(/\n/g, '<br>');
    return safe;
  }

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

  function normalizeShortAnswer(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/,/g, '.');
  }

  function injectStyles() {
    if (document.getElementById('ey-dao-bang-styles')) return;
    const style = document.createElement('style');
    style.id = 'ey-dao-bang-styles';
    style.textContent = `
      .db-root {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif;
        user-select: none;
        background: #0d2530;
        display: flex;
        flex-direction: column;
      }

      /* Top Status Bar */
      .db-topbar {
        height: 60px;
        min-height: 60px;
        background: #cdebf4;
        border-bottom: 1.5px solid #a5d8e8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px;
        z-index: 40;
        box-shadow: 0 2px 10px rgba(8, 47, 73, 0.08);
      }
      .db-top-teams {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow-x: auto;
      }
      .db-top-card {
        position: relative;
        min-width: 170px;
        max-width: 220px;
        height: 44px;
        background: #e2f5fa;
        border-radius: 12px;
        border: 2px solid #b5e2ef;
        padding: 4px 12px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.25s ease;
        overflow: hidden;
      }
      .db-top-card.is-active {
        background: #f0fafe;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.18);
      }
      .db-top-card.is-dead {
        opacity: 0.55;
        filter: grayscale(0.45);
      }
      .db-top-name {
        font-size: 14px;
        font-weight: 800;
        color: #0c4a6e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .db-top-time {
        font-size: 14px;
        font-weight: 800;
        color: #0284c7;
        margin-left: 10px;
      }
      .db-top-bar-track {
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 4px;
        height: 4px;
        background: rgba(12, 74, 110, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .db-top-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #ef4444 0%, #f59e0b 35%, #22c55e 70%, #06b6d4 100%);
        transition: width 0.25s linear;
      }

      .db-top-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .db-btn-icon, .db-btn-util {
        height: 36px;
        border-radius: 10px;
        border: 1.5px solid #a5d8e8;
        background: rgba(255, 255, 255, 0.72);
        color: #0c4a6e;
        font-weight: 700;
        font-size: 13px;
        padding: 0 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
      }
      .db-btn-icon {
        width: 36px;
        padding: 0;
        font-size: 15px;
      }
      .db-btn-icon:hover, .db-btn-util:hover {
        background: #ffffff;
        border-color: #38bdf8;
      }
      .db-btn-end {
        background: rgba(254, 226, 226, 0.85);
        border-color: #fca5a5;
        color: #dc2626;
      }
      .db-btn-end:hover {
        background: #fee2e2;
        border-color: #f87171;
      }

      /* Main Arctic Stage */
      .db-stage {
        position: relative;
        flex: 1;
        width: 100%;
        background: url('/ey/games/dao-bang/arena_bg.webp') center center / 100% 100% no-repeat;
        overflow: hidden;
      }

      /* Setup Overlay */
      .db-setup-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 40%, rgba(16, 54, 70, 0.86) 0%, rgba(9, 30, 40, 0.96) 100%);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 80;
        padding: 20px;
      }
      .db-setup-card {
        width: 100%;
        max-width: 470px;
        background: linear-gradient(180deg, #e7f5f9 0%, #d4ecf3 100%);
        border: 2px solid rgba(255, 255, 255, 0.85);
        border-radius: 26px;
        padding: 26px 28px 24px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        color: #083344;
      }
      .db-setup-title {
        text-align: center;
        font-size: 25px;
        font-weight: 900;
        color: #083344;
        margin: 0 0 18px;
      }
      .db-setup-count-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .db-setup-label {
        font-size: 14px;
        font-weight: 800;
        color: #476b7c;
      }
      .db-setup-count-btns {
        display: flex;
        gap: 8px;
      }
      .db-count-btn {
        width: 48px;
        height: 38px;
        border-radius: 11px;
        border: 2px solid #b8dce7;
        background: rgba(255, 255, 255, 0.55);
        color: #476b7c;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .db-count-btn.is-active {
        background: #ffffff;
        border-color: #0ea5e9;
        color: #0284c7;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
      }
      .db-setup-teams-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 22px;
      }
      .db-setup-team-box {
        background: rgba(255, 255, 255, 0.72);
        border-radius: 16px;
        padding: 10px 12px;
        border: 2px solid rgba(184, 220, 231, 0.9);
      }
      .db-setup-team-head {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 7px;
      }
      .db-setup-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        display: inline-block;
      }
      .db-setup-input {
        width: 100%;
        height: 36px;
        border-radius: 10px;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        padding: 0 10px;
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        outline: none;
        box-sizing: border-box;
      }
      .db-setup-input:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }
      .db-start-btn {
        width: 100%;
        height: 48px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(180deg, #16a0be 0%, #0b6e87 100%);
        color: #ffffff;
        font-size: 17px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(11, 110, 135, 0.35);
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .db-start-btn:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
      }

      /* Countdown Overlay */
      .db-countdown-overlay {
        position: absolute;
        inset: 0;
        background: rgba(8, 35, 48, 0.35);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 75;
      }
      .db-countdown-circle {
        width: 165px;
        height: 165px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.06) 70%, transparent 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 96px;
        font-weight: 900;
        color: #ffffff;
        text-shadow: 0 6px 24px rgba(8, 47, 73, 0.55);
        animation: dbPopIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes dbPopIn {
        0% { transform: scale(0.45); opacity: 0; }
        70% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Question Card (Top-Center Dark Teal Card matching f_25.00s.jpg) */
      .db-question-wrap {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(94%, 1140px);
        z-index: 35;
        pointer-events: auto;
      }
      .db-question-card {
        background: rgba(13, 52, 66, 0.93);
        border: 1.5px solid rgba(103, 232, 249, 0.26);
        border-radius: 18px;
        padding: 14px 18px 16px;
        box-shadow: 0 14px 34px rgba(4, 24, 34, 0.42);
        color: #ffffff;
        backdrop-filter: blur(8px);
      }
      .db-q-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      .db-q-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
      }
      .db-q-badge {
        padding: 5px 12px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 900;
        color: #ffffff;
        white-space: nowrap;
        letter-spacing: 0.4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
      }
      .db-q-bonus {
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.22);
        border: 1px solid rgba(52, 211, 153, 0.45);
        color: #34d399;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }
      .db-q-text {
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.4;
        flex: 1;
        word-break: break-word;
      }
      .db-q-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .db-font-btns {
        display: flex;
        gap: 4px;
      }
      .db-font-btn {
        height: 30px;
        padding: 0 8px;
        border-radius: 7px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.45);
        color: #e2e8f0;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }
      .db-font-btn:hover {
        background: rgba(30, 41, 59, 0.75);
      }
      .db-q-timer {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 900;
        color: #ffffff;
      }
      .db-q-timer svg {
        position: absolute;
        inset: 0;
        transform: rotate(-90deg);
      }

      .db-q-media {
        margin: 6px 0 12px;
        display: flex;
        justify-content: center;
      }
      .db-q-media img {
        max-height: 145px;
        max-width: 100%;
        border-radius: 10px;
        border: 1.5px solid rgba(255, 255, 255, 0.25);
        cursor: zoom-in;
        background: #ffffff;
        padding: 4px;
      }

      /* Answer Options Grid */
      .db-options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .db-option-btn {
        position: relative;
        min-height: 50px;
        border-radius: 12px;
        border: 1.5px solid rgba(56, 189, 248, 0.22);
        background: rgba(21, 78, 96, 0.76);
        color: #f8fafc;
        padding: 10px 16px;
        font-size: 16px;
        font-weight: 700;
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        transition: all 0.16s ease;
      }
      .db-option-btn:hover:not(:disabled) {
        background: rgba(28, 98, 120, 0.92);
        border-color: rgba(103, 232, 249, 0.55);
        transform: translateY(-1px);
      }
      .db-option-btn:disabled {
        cursor: default;
      }
      .db-option-btn.is-correct {
        background: linear-gradient(90deg, #10b981 0%, #059669 100%) !important;
        border-color: #6ee7b7 !important;
        color: #ffffff !important;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.38);
      }
      .db-option-btn.is-wrong {
        background: rgba(15, 38, 48, 0.55) !important;
        border-color: rgba(239, 68, 68, 0.35) !important;
        color: rgba(203, 213, 225, 0.5) !important;
        opacity: 0.68;
      }
      .db-opt-label {
        color: #38bdf8;
        font-weight: 900;
        margin-right: 6px;
      }
      .db-option-btn.is-correct .db-opt-label {
        color: #ffffff;
      }
      .db-opt-mark {
        font-size: 18px;
        font-weight: 900;
      }

      /* True/False & Short Answer inside Question Card */
      .db-tf-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 10px;
      }
      .db-tf-row {
        background: rgba(21, 78, 96, 0.75);
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 10px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .db-tf-stmt {
        font-size: 14px;
        color: #f1f5f9;
        flex: 1;
      }
      .db-tf-btns {
        display: flex;
        gap: 5px;
      }
      .db-tf-choice {
        padding: 5px 10px;
        border-radius: 7px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: rgba(15, 23, 42, 0.5);
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }
      .db-tf-choice.is-selected-true {
        background: #10b981;
        border-color: #6ee7b7;
        color: #ffffff;
      }
      .db-tf-choice.is-selected-false {
        background: #ef4444;
        border-color: #fca5a5;
        color: #ffffff;
      }
      .db-sa-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .db-sa-input {
        flex: 1;
        height: 46px;
        border-radius: 12px;
        border: 1.5px solid rgba(56, 189, 248, 0.4);
        background: rgba(15, 35, 46, 0.85);
        color: #ffffff;
        padding: 0 16px;
        font-size: 17px;
        font-weight: 700;
        outline: none;
      }
      .db-sa-submit {
        height: 46px;
        padding: 0 22px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
      }

      /* Iceberg & Bear Columns on Stage */
      .db-island-slot {
        position: absolute;
        bottom: 18px;
        transform: translateX(-50%);
        width: 300px;
        height: 430px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        pointer-events: none;
        z-index: 20;
      }

      /* Timer + Bar above Bear */
      .db-head-hud {
        position: absolute;
        top: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        z-index: 26;
        transition: transform 0.25s ease;
      }
      .db-head-seconds {
        font-size: 29px;
        font-weight: 900;
        color: #ffffff;
        line-height: 1;
        text-shadow:
          -2px -2px 0 #1e293b,
           2px -2px 0 #1e293b,
          -2px  2px 0 #1e293b,
           2px  2px 0 #1e293b,
           0px  4px 8px rgba(0, 0, 0, 0.45);
      }
      .db-head-bar-outer {
        width: 186px;
        height: 19px;
        border-radius: 999px;
        background: #0f293a;
        border: 2.5px solid #e2f1f8;
        padding: 2px;
        box-sizing: border-box;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        overflow: hidden;
      }
      .db-head-bar-outer.is-danger {
        border-color: #fca5a5;
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.55);
      }
      .db-head-bar-inner {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 100%);
        transition: width 0.25s linear, background 0.25s ease;
      }
      .db-head-bar-inner.is-warn {
        background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%);
      }
      .db-head-bar-inner.is-danger {
        background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
      }

      /* Floating +3s / -11s Delta Text */
      .db-delta-float {
        position: absolute;
        top: 68px;
        right: 26px;
        font-size: 28px;
        font-weight: 900;
        z-index: 32;
        pointer-events: none;
        animation: dbFloatDelta 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      .db-delta-float.is-plus {
        color: #4ade80;
        text-shadow: -2px -2px 0 #064e3b, 2px -2px 0 #064e3b, -2px 2px 0 #064e3b, 2px 2px 0 #064e3b;
      }
      .db-delta-float.is-minus {
        color: #f87171;
        text-shadow: -2px -2px 0 #7f1d1d, 2px -2px 0 #7f1d1d, -2px 2px 0 #7f1d1d, 2px 2px 0 #7f1d1d;
      }
      @keyframes dbFloatDelta {
        0% { transform: translateY(12px) scale(0.7); opacity: 0; }
        20% { transform: translateY(0px) scale(1.08); opacity: 1; }
        80% { transform: translateY(-20px) scale(1); opacity: 1; }
        100% { transform: translateY(-32px) scale(0.92); opacity: 0; }
      }

      /* Bobbing Wrapper for Bear + Iceberg */
      .db-bob-group {
        position: relative;
        width: 280px;
        height: 295px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 48px;
        animation: dbBobbing 3.2s ease-in-out infinite;
        transition: transform 0.35s ease, opacity 0.35s ease;
      }
      @keyframes dbBobbing {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(5px); }
      }

      .db-bear-wrap {
        position: relative;
        width: 142px;
        height: 158px;
        margin-bottom: -28px;
        z-index: 23;
        transition: transform 0.35s ease;
      }
      .db-bear-wrap.is-shiver {
        animation: dbShiver 0.32s linear infinite;
      }
      @keyframes dbShiver {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2.5px) rotate(-1deg); }
        75% { transform: translateX(2.5px) rotate(1deg); }
      }
      .db-bear-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
      }

      .db-iceberg-wrap {
        position: relative;
        width: 275px;
        height: 142px;
        z-index: 21;
        transform-origin: center bottom;
        transition: transform 0.35s ease, filter 0.35s ease;
      }
      .db-iceberg-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /* Active Turn Water Ripple Ring */
      .db-turn-ring {
        position: absolute;
        bottom: 46px;
        width: 286px;
        height: 62px;
        border-radius: 50%;
        border: 3.5px solid #ef4444;
        box-shadow: 0 0 18px currentColor, inset 0 0 12px currentColor;
        opacity: 0;
        transform: scale(0.88);
        transition: opacity 0.25s ease, transform 0.25s ease;
        z-index: 19;
        pointer-events: none;
      }
      .db-turn-ring::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid currentColor;
        opacity: 0.55;
        animation: dbRipplePulse 1.6s ease-out infinite;
      }
      .db-turn-ring.is-active {
        opacity: 0.92;
        transform: scale(1);
      }
      @keyframes dbRipplePulse {
        0% { transform: scale(0.95); opacity: 0.75; }
        100% { transform: scale(1.12); opacity: 0; }
      }

      /* Bottom Team Pill Badge */
      .db-team-pill {
        position: relative;
        z-index: 25;
        height: 36px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(9, 30, 42, 0.78);
        border: 1.5px solid rgba(255, 255, 255, 0.22);
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      }
      .db-team-pill.is-dead {
        opacity: 0.65;
      }

      /* Rescued Bears on Left/Right Glaciers */
      .db-rescued-bear {
        position: absolute;
        width: 58px;
        height: 65px;
        z-index: 18;
        transition: all 0.5s ease;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
      }
      .db-rescued-bear img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /* Sinking ("TÕM! 💦") Center Banner & Rescue Penguin Animation */
      .db-sink-banner {
        position: absolute;
        top: 52%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 65;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: none;
        animation: dbPopIn 0.38s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .db-sink-title {
        font-size: 56px;
        font-weight: 900;
        color: #38bdf8;
        text-shadow:
          -3px -3px 0 #082f49,
           3px -3px 0 #082f49,
          -3px  3px 0 #082f49,
           3px  3px 0 #082f49,
           0 8px 24px rgba(0, 0, 0, 0.55);
      }
      .db-sink-sub {
        background: rgba(12, 45, 62, 0.92);
        border: 2px solid #38bdf8;
        border-radius: 999px;
        padding: 8px 22px;
        color: #ffffff;
        font-size: 18px;
        font-weight: 800;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      }

      .db-rescue-swimmer {
        position: absolute;
        z-index: 50;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: left 1.15s ease-in-out, top 1.15s ease-in-out, transform 0.3s ease;
      }
      .db-penguin-svg {
        width: 68px;
        height: 68px;
        filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35));
      }

      /* Victory Modal (Matches f_47.50s.jpg) */
      .db-victory-overlay {
        position: absolute;
        inset: 0;
        background: rgba(8, 28, 40, 0.58);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 85;
        padding: 20px;
      }
      .db-victory-card {
        width: 100%;
        max-width: 440px;
        background: linear-gradient(180deg, #e7f6fa 0%, #d4ecf3 100%);
        border: 2.5px solid #ffffff;
        border-radius: 26px;
        padding: 28px 26px 24px;
        text-align: center;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
        color: #083344;
        animation: dbPopIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .db-victory-trophy {
        font-size: 64px;
        line-height: 1;
        margin-bottom: 8px;
        filter: drop-shadow(0 8px 18px rgba(245, 158, 11, 0.45));
      }
      .db-victory-sub {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1.5px;
        color: #0284c7;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .db-victory-winner {
        font-size: 32px;
        font-weight: 900;
        color: #083344;
        margin-bottom: 10px;
      }
      .db-victory-badge {
        display: inline-block;
        padding: 5px 16px;
        border-radius: 999px;
        background: #fef3c7;
        border: 1.5px solid #fcd34d;
        color: #b45309;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 18px;
      }
      .db-rank-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 22px;
        text-align: left;
      }
      .db-rank-row {
        background: rgba(255, 255, 255, 0.72);
        border: 1.5px solid #bae6fd;
        border-radius: 14px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .db-rank-row.is-dead {
        opacity: 0.65;
        background: rgba(241, 245, 249, 0.6);
        border-color: #cbd5e1;
      }
      .db-rank-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 800;
        color: #0c4a6e;
      }
      .db-rank-right {
        font-size: 13px;
        font-weight: 800;
        color: #0284c7;
      }
      .db-rank-row.is-dead .db-rank-right {
        color: #64748b;
      }
      .db-victory-btns {
        display: flex;
        gap: 10px;
      }
      .db-v-btn {
        flex: 1;
        height: 44px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        border: 1.5px solid #bae6fd;
        background: #ffffff;
        color: #0c4a6e;
        transition: all 0.16s ease;
      }
      .db-v-btn.is-primary {
        background: linear-gradient(180deg, #16a0be 0%, #0b6e87 100%);
        border: none;
        color: #ffffff;
        box-shadow: 0 6px 16px rgba(11, 110, 135, 0.3);
      }
      .db-v-btn:hover {
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);
  }

  function createPenguinRescueSvg() {
    return `
      <svg class="db-penguin-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Water ripple under penguin -->
        <ellipse cx="50" cy="84" rx="38" ry="10" fill="rgba(186, 230, 253, 0.55)" />
        <!-- Penguin Body -->
        <ellipse cx="50" cy="54" rx="24" ry="28" fill="#1e293b" />
        <ellipse cx="50" cy="57" rx="16" ry="21" fill="#f8fafc" />
        <!-- Red & White Life Preserver Ring -->
        <ellipse cx="50" cy="68" rx="28" ry="11" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" />
        <path d="M 25 65 L 33 73 M 67 73 L 75 65 M 46 57 L 54 57 M 46 79 L 54 79" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
        <!-- Eyes & Beak -->
        <circle cx="43" cy="39" r="4.5" fill="#ffffff" />
        <circle cx="57" cy="39" r="4.5" fill="#ffffff" />
        <circle cx="43.5" cy="39" r="2.3" fill="#0f172a" />
        <circle cx="56.5" cy="39" r="2.3" fill="#0f172a" />
        <polygon points="46,44 54,44 50,50" fill="#f59e0b" />
        <!-- Cute Flippers -->
        <ellipse cx="24" cy="55" rx="6" ry="12" transform="rotate(22 24 55)" fill="#1e293b" />
        <ellipse cx="76" cy="55" rx="6" ry="12" transform="rotate(-22 76 55)" fill="#1e293b" />
      </svg>
    `;
  }

  window.launchDaoBangGame = function launchDaoBangGame(container, options = {}) {
    if (!container) return;
    injectStyles();

    const rawQuestions = Array.isArray(options.questions) && options.questions.length > 0
      ? options.questions
      : [
          { type: 'mcq', question: '8 + 7 = ?', options: ['15', '14', '16', '13'], correctIndex: 0 },
          { type: 'mcq', question: '9 × 6 = ?', options: ['45', '54', '56', '48'], correctIndex: 1 },
          { type: 'mcq', question: '45 - 17 = ?', options: ['28', '32', '26', '38'], correctIndex: 0 },
          { type: 'mcq', question: '56 : 8 = ?', options: ['6', '9', '7', '8'], correctIndex: 2 }
        ];

    const audio = new DaoBangAudio();

    const state = {
      phase: 'setup', // 'setup' | 'countdown' | 'playing' | 'sinking' | 'ended'
      teamCount: Math.min(4, Math.max(2, Number(options.teamCount) || 2)),
      customNames: ['Đội 1', 'Đội 2', 'Đội 3', 'Đội 4'],
      teams: [],
      activeTeamIdx: 0,
      qIndex: 0,
      questionFontSize: 20,
      qTimeRemaining: QUESTION_TIME_LIMIT,
      disabledOptions: new Set(),
      teamsTriedCurrentQ: new Set(),
      tfSelections: {},
      paused: false,
      meltTimerId: null,
      lastTickMs: 0,
      destroyed: false
    };

    function cleanupTimers() {
      if (state.meltTimerId) {
        clearInterval(state.meltTimerId);
        state.meltTimerId = null;
      }
    }

    function initTeams() {
      state.teams = [];
      for (let i = 0; i < state.teamCount; i++) {
        const preset = TEAM_PRESETS[i];
        state.teams.push({
          id: i,
          name: (state.customNames[i] || preset.defaultName).trim() || preset.defaultName,
          color: preset.color,
          border: preset.border,
          lightBg: preset.lightBg,
          sprite: preset.sprite,
          xPercent: preset.xPercentByCount[state.teamCount] || 50,
          rescueSide: i < state.teamCount / 2 ? 'left' : 'right',
          rescueOrder: i,
          iceSeconds: MAX_ICE_SECONDS,
          alive: true,
          rescued: false,
          correctCount: 0
        });
      }
      state.activeTeamIdx = 0;
      state.qIndex = 0;
    }

    // Build Root DOM
    container.innerHTML = `
      <div class="db-root" id="db-root">
        <div class="db-topbar">
          <div class="db-top-teams" id="db-top-teams"></div>
          <div class="db-top-actions">
            <button class="db-btn-icon" id="db-btn-fs" title="Toàn màn hình">⛶</button>
            <button class="db-btn-icon" id="db-btn-sound" title="Âm thanh">🔊</button>
            <button class="db-btn-util" id="db-btn-pause">Tạm dừng</button>
            <button class="db-btn-util db-btn-end" id="db-btn-end">Kết thúc</button>
          </div>
        </div>
        <div class="db-stage" id="db-stage">
          <div id="db-question-mount"></div>
          <div id="db-islands-mount"></div>
          <div id="db-rescued-mount"></div>
          <div id="db-fx-mount"></div>
          <div id="db-modal-mount"></div>
        </div>
      </div>
    `;

    const rootEl = container.querySelector('#db-root');
    const topTeamsEl = container.querySelector('#db-top-teams');
    const questionMount = container.querySelector('#db-question-mount');
    const islandsMount = container.querySelector('#db-islands-mount');
    const rescuedMount = container.querySelector('#db-rescued-mount');
    const fxMount = container.querySelector('#db-fx-mount');
    const modalMount = container.querySelector('#db-modal-mount');

    // Topbar Button Wiring
    container.querySelector('#db-btn-fs')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        (rootEl.requestFullscreen || rootEl.webkitRequestFullscreen)?.call(rootEl);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      }
    });

    const soundBtn = container.querySelector('#db-btn-sound');
    soundBtn?.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      soundBtn.textContent = audio.enabled ? '🔊' : '🔇';
    });

    const pauseBtn = container.querySelector('#db-btn-pause');
    pauseBtn?.addEventListener('click', () => {
      if (state.phase !== 'playing') return;
      state.paused = !state.paused;
      pauseBtn.textContent = state.paused ? 'Tiếp tục' : 'Tạm dừng';
      state.lastTickMs = performance.now();
    });

    container.querySelector('#db-btn-end')?.addEventListener('click', () => {
      if (state.phase === 'setup') {
        if (typeof options.onExit === 'function') options.onExit();
        return;
      }
      finishGame();
    });

    function renderTopBar() {
      if (!topTeamsEl) return;
      topTeamsEl.innerHTML = state.teams
        .map((t, idx) => {
          const isTurn = state.phase === 'playing' && idx === state.activeTeamIdx && t.alive;
          const secs = Math.max(0, Math.ceil(t.iceSeconds));
          const pct = Math.max(0, Math.min(100, (t.iceSeconds / MAX_ICE_SECONDS) * 100));
          return `
            <div class="db-top-card ${isTurn ? 'is-active' : ''} ${!t.alive ? 'is-dead' : ''}"
                 id="db-top-card-${t.id}"
                 style="${isTurn ? `border-color: ${t.color};` : ''}">
              <span class="db-top-name">${escapeHtml(t.name)}</span>
              <span class="db-top-time" id="db-top-time-${t.id}">${t.alive ? `${secs}s` : '—'}</span>
              <div class="db-top-bar-track">
                <div class="db-top-bar-fill" id="db-top-fill-${t.id}" style="width: ${t.alive ? pct : 0}%;"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    function renderIslands() {
      if (!islandsMount) return;
      islandsMount.innerHTML = state.teams
        .map((t, idx) => {
          const isTurn = state.phase === 'playing' && idx === state.activeTeamIdx && t.alive;
          const secs = Math.max(0, Math.ceil(t.iceSeconds));
          const pct = Math.max(0, Math.min(100, (t.iceSeconds / MAX_ICE_SECONDS) * 100));
          const barClass = secs <= 15 ? 'is-danger' : secs <= 25 ? 'is-warn' : '';
          const iceSrc = secs <= 30 ? '/ey/games/dao-bang/iceberg_cracked.webp' : '/ey/games/dao-bang/iceberg_intact.webp';
          const iceScale = 0.72 + 0.28 * (Math.max(0, t.iceSeconds) / MAX_ICE_SECONDS);

          return `
            <div class="db-island-slot" id="db-slot-${t.id}" style="left: ${t.xPercent}%;">
              <!-- Head Timer & Bar -->
              <div class="db-head-hud" id="db-hud-${t.id}" style="${!t.alive ? 'opacity: 0.45;' : ''}">
                <div class="db-head-seconds" id="db-sec-${t.id}">${secs}s</div>
                <div class="db-head-bar-outer ${secs <= 15 && t.alive ? 'is-danger' : ''}" id="db-bar-outer-${t.id}">
                  <div class="db-head-bar-inner ${barClass}" id="db-bar-inner-${t.id}" style="width: ${pct}%;"></div>
                </div>
              </div>

              <!-- Floating Delta Anchor -->
              <div id="db-delta-mount-${t.id}"></div>

              <!-- Active Turn Water Ripple Ring -->
              <div class="db-turn-ring ${isTurn ? 'is-active' : ''}"
                   id="db-ring-${t.id}"
                   style="border-color: ${t.color}; color: ${t.color};"></div>

              <!-- Bear + Iceberg Bobbing Group -->
              <div class="db-bob-group" id="db-bob-${t.id}" style="${!t.alive ? 'opacity: 0; transform: translateY(45px) scale(0.3);' : ''}">
                <div class="db-bear-wrap ${secs <= 15 && t.alive ? 'is-shiver' : ''}" id="db-bear-wrap-${t.id}">
                  <img class="db-bear-img" src="${t.sprite}" alt="${escapeHtml(t.name)}" />
                </div>
                <div class="db-iceberg-wrap" id="db-ice-wrap-${t.id}" style="transform: scale(${iceScale.toFixed(3)});">
                  <img class="db-iceberg-img" id="db-ice-img-${t.id}" src="${iceSrc}" alt="Iceberg" />
                </div>
              </div>

              <!-- Bottom Team Pill -->
              <div class="db-team-pill ${!t.alive ? 'is-dead' : ''}" id="db-pill-${t.id}">
                <span class="db-setup-dot" style="background: ${t.color};"></span>
                <span id="db-pill-text-${t.id}">${!t.alive ? '💀 ' : ''}${escapeHtml(t.name)}</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    function updateRealtimeHudDOM() {
      state.teams.forEach((t, idx) => {
        const secs = Math.max(0, Math.ceil(t.iceSeconds));
        const pct = Math.max(0, Math.min(100, (t.iceSeconds / MAX_ICE_SECONDS) * 100));
        const isTurn = state.phase === 'playing' && idx === state.activeTeamIdx && t.alive;

        const topCard = container.querySelector(`#db-top-card-${t.id}`);
        const topTime = container.querySelector(`#db-top-time-${t.id}`);
        const topFill = container.querySelector(`#db-top-fill-${t.id}`);
        if (topCard) {
          topCard.classList.toggle('is-active', isTurn);
          topCard.classList.toggle('is-dead', !t.alive);
          topCard.style.borderColor = isTurn ? t.color : '#b5e2ef';
        }
        if (topTime) topTime.textContent = t.alive ? `${secs}s` : '—';
        if (topFill) topFill.style.width = `${t.alive ? pct : 0}%`;

        const secEl = container.querySelector(`#db-sec-${t.id}`);
        const barOuter = container.querySelector(`#db-bar-outer-${t.id}`);
        const barInner = container.querySelector(`#db-bar-inner-${t.id}`);
        const bearWrap = container.querySelector(`#db-bear-wrap-${t.id}`);
        const iceWrap = container.querySelector(`#db-ice-wrap-${t.id}`);
        const iceImg = container.querySelector(`#db-ice-img-${t.id}`);
        const ringEl = container.querySelector(`#db-ring-${t.id}`);

        if (secEl) secEl.textContent = `${secs}s`;
        if (barOuter) {
          barOuter.classList.toggle('is-danger', secs <= 15 && t.alive);
        }
        if (barInner) {
          barInner.style.width = `${pct}%`;
          barInner.classList.toggle('is-warn', secs > 15 && secs <= 25);
          barInner.classList.toggle('is-danger', secs <= 15);
        }
        if (bearWrap) {
          bearWrap.classList.toggle('is-shiver', secs <= 15 && t.alive);
        }
        if (iceWrap && t.alive) {
          const iceScale = 0.72 + 0.28 * (Math.max(0, t.iceSeconds) / MAX_ICE_SECONDS);
          iceWrap.style.transform = `scale(${iceScale.toFixed(3)})`;
        }
        if (iceImg && t.alive) {
          const wantSrc = secs <= 30 ? '/ey/games/dao-bang/iceberg_cracked.webp' : '/ey/games/dao-bang/iceberg_intact.webp';
          if (!iceImg.getAttribute('src')?.endsWith(wantSrc)) {
            iceImg.setAttribute('src', wantSrc);
          }
        }
        if (ringEl) {
          ringEl.classList.toggle('is-active', isTurn);
        }
      });

      // Update Question Circular Timer
      const qTimerText = container.querySelector('#db-q-timer-text');
      const qTimerCircle = container.querySelector('#db-q-timer-circle');
      if (qTimerText) {
        qTimerText.textContent = Math.max(0, Math.ceil(state.qTimeRemaining));
      }
      if (qTimerCircle) {
        const circumference = 2 * Math.PI * 17;
        const ratio = Math.max(0, Math.min(1, state.qTimeRemaining / QUESTION_TIME_LIMIT));
        qTimerCircle.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
      }
    }

    function showFloatingDelta(teamId, deltaSeconds) {
      const mount = container.querySelector(`#db-delta-mount-${teamId}`);
      if (!mount) return;
      const sign = deltaSeconds >= 0 ? '+' : '';
      const cls = deltaSeconds >= 0 ? 'is-plus' : 'is-minus';
      const el = document.createElement('div');
      el.className = `db-delta-float ${cls}`;
      el.textContent = `${sign}${Math.round(deltaSeconds)}s`;
      mount.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }

    function renderRescuedBears() {
      if (!rescuedMount) return;
      const rescuedTeams = state.teams.filter((t) => t.rescued);
      rescuedMount.innerHTML = rescuedTeams
        .map((t, i) => {
          const isLeft = t.rescueSide === 'left';
          const horizontalOffset = isLeft ? 105 + i * 48 : 105 + i * 48;
          const posStyle = isLeft
            ? `left: ${horizontalOffset}px; top: 48%;`
            : `right: ${horizontalOffset}px; top: 48%;`;
          return `
            <div class="db-rescued-bear" style="${posStyle}" title="${escapeHtml(t.name)} (Đã được cứu hộ)">
              <img src="${t.sprite}" alt="${escapeHtml(t.name)}" />
            </div>
          `;
        })
        .join('');
    }

    // Setup Modal
    function showSetupModal() {
      state.phase = 'setup';
      initTeams();
      renderTopBar();
      renderIslands();
      questionMount.innerHTML = '';

      function renderSetupContent() {
        modalMount.innerHTML = `
          <div class="db-setup-overlay">
            <div class="db-setup-card">
              <h2 class="db-setup-title">Thiết lập</h2>
              <div class="db-setup-count-row">
                <span class="db-setup-label">Số đội</span>
                <div class="db-setup-count-btns">
                  ${[2, 3, 4]
                    .map(
                      (n) => `
                    <button type="button" class="db-count-btn ${state.teamCount === n ? 'is-active' : ''}" data-count="${n}">
                      ${n}
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>
              <div class="db-setup-teams-grid">
                ${Array.from({ length: state.teamCount })
                  .map((_, i) => {
                    const preset = TEAM_PRESETS[i];
                    return `
                      <div class="db-setup-team-box">
                        <div class="db-setup-team-head" style="color: ${preset.color};">
                          <span class="db-setup-dot" style="background: ${preset.color};"></span>
                          <span>Đội ${i + 1}</span>
                        </div>
                        <input type="text" class="db-setup-input" data-team-idx="${i}" value="${escapeHtml(state.customNames[i] || preset.defaultName)}" maxlength="22" />
                      </div>
                    `;
                  })
                  .join('')}
              </div>
              <button type="button" class="db-start-btn" id="db-btn-start-match">▶ Bắt đầu</button>
            </div>
          </div>
        `;

        modalMount.querySelectorAll('.db-count-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            modalMount.querySelectorAll('.db-setup-input').forEach((inp) => {
              const idx = Number(inp.getAttribute('data-team-idx'));
              state.customNames[idx] = inp.value;
            });
            state.teamCount = Number(btn.getAttribute('data-count')) || 2;
            initTeams();
            renderTopBar();
            renderIslands();
            renderSetupContent();
          });
        });

        modalMount.querySelector('#db-btn-start-match')?.addEventListener('click', () => {
          modalMount.querySelectorAll('.db-setup-input').forEach((inp) => {
            const idx = Number(inp.getAttribute('data-team-idx'));
            state.customNames[idx] = inp.value;
          });
          audio.init();
          startCountdown();
        });
      }

      renderSetupContent();
    }

    function startCountdown() {
      state.phase = 'countdown';
      initTeams();
      renderTopBar();
      renderIslands();
      rescuedMount.innerHTML = '';

      let step = 3;
      function showStep() {
        if (state.destroyed) return;
        if (step > 0) {
          audio.playCountdownTick(false);
          modalMount.innerHTML = `
            <div class="db-countdown-overlay">
              <div class="db-countdown-circle">${step}</div>
            </div>
          `;
          step--;
          setTimeout(showStep, 850);
        } else {
          audio.playCountdownTick(true);
          modalMount.innerHTML = '';
          startPlaying();
        }
      }
      showStep();
    }

    function startPlaying() {
      state.phase = 'playing';
      state.paused = false;
      state.activeTeamIdx = 0;
      state.qIndex = 0;
      loadQuestion(0, true);
      startMeltLoop();
    }

    function getNextLivingTeamIdx(fromIdx) {
      const n = state.teams.length;
      for (let step = 1; step <= n; step++) {
        const candidate = (fromIdx + step) % n;
        if (state.teams[candidate].alive) return candidate;
      }
      return -1;
    }

    function loadQuestion(qIdx, resetTried = true) {
      if (state.phase !== 'playing') return;
      state.qIndex = qIdx % rawQuestions.length;
      state.qTimeRemaining = QUESTION_TIME_LIMIT;
      if (resetTried) {
        state.disabledOptions = new Set();
        state.teamsTriedCurrentQ = new Set();
        state.tfSelections = {};
      }
      renderQuestionCard();
      updateRealtimeHudDOM();
    }

    function renderQuestionCard() {
      if (!questionMount || state.phase !== 'playing') {
        if (questionMount) questionMount.innerHTML = '';
        return;
      }
      const q = rawQuestions[state.qIndex] || rawQuestions[0];
      const activeTeam = state.teams[state.activeTeamIdx] || state.teams[0];
      const circumference = 2 * Math.PI * 17;
      const qType = q.type || (Array.isArray(q.statements) ? 'tf' : Array.isArray(q.options) ? 'mcq' : 'sa');

      let bodyHtml = '';
      if (qType === 'tf' && Array.isArray(q.statements)) {
        bodyHtml = `
          <div class="db-tf-grid">
            ${q.statements
              .map((stmt, idx) => {
                const label = ['a)', 'b)', 'c)', 'd)'][idx] || `${idx + 1})`;
                const curVal = state.tfSelections[idx];
                return `
                  <div class="db-tf-row">
                    <div class="db-tf-stmt"><strong>${label}</strong> ${formatRichContent(stmt.text || stmt)}</div>
                    <div class="db-tf-btns">
                      <button type="button" class="db-tf-choice ${curVal === true ? 'is-selected-true' : ''}" data-tf-idx="${idx}" data-tf-val="true">Đúng</button>
                      <button type="button" class="db-tf-choice ${curVal === false ? 'is-selected-false' : ''}" data-tf-idx="${idx}" data-tf-val="false">Sai</button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button type="button" class="db-sa-submit" id="db-tf-submit">Chốt đáp án</button>
          </div>
        `;
      } else if (qType === 'sa' || (!Array.isArray(q.options) && q.shortAnswer !== undefined)) {
        bodyHtml = `
          <div class="db-sa-row">
            <input type="text" class="db-sa-input" id="db-sa-input" placeholder="Nhập câu trả lời của ${escapeHtml(activeTeam.name)}..." autocomplete="off" />
            <button type="button" class="db-sa-submit" id="db-sa-submit">Trả lời</button>
          </div>
        `;
      } else {
        const opts = Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'];
        bodyHtml = `
          <div class="db-options-grid">
            ${opts
              .map((optText, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx] || String.fromCharCode(65 + idx);
                const cleanOpt = String(optText || '').replace(/^[A-D][\.\:\)]\s*/i, '');
                const isDisabled = state.disabledOptions.has(idx);
                return `
                  <button type="button"
                          class="db-option-btn ${isDisabled ? 'is-wrong' : ''}"
                          data-opt-idx="${idx}"
                          ${isDisabled ? 'disabled' : ''}>
                    <span><span class="db-opt-label">${letter}.</span> ${formatRichContent(cleanOpt)}</span>
                    <span class="db-opt-mark">${isDisabled ? '×' : ''}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
      }

      const imgUrl = q.image || q.imageUrl || '';
      const mediaHtml = imgUrl
        ? `<div class="db-q-media"><img src="${escapeHtml(imgUrl)}" alt="Hình minh họa" id="db-q-img" /></div>`
        : '';

      questionMount.innerHTML = `
        <div class="db-question-wrap">
          <div class="db-question-card" id="db-question-card">
            <div class="db-q-header">
              <div class="db-q-left">
                <span class="db-q-badge" style="background: ${activeTeam.color};">CÂU ${state.qIndex + 1}</span>
                <span class="db-q-bonus">+${CORRECT_BONUS_SECONDS}s</span>
                <div class="db-q-text" id="db-q-text" style="font-size: ${state.questionFontSize}px;">
                  ${formatRichContent(q.question || q.text || '')}
                </div>
              </div>
              <div class="db-q-right">
                <div class="db-font-btns">
                  <button type="button" class="db-font-btn" id="db-font-dec" title="Giảm cỡ chữ">A-</button>
                  <button type="button" class="db-font-btn" id="db-font-inc" title="Tăng cỡ chữ">A+</button>
                </div>
                <div class="db-q-timer">
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="3.5" />
                    <circle id="db-q-timer-circle" cx="21" cy="21" r="17" fill="none" stroke="#10b981" stroke-width="3.5"
                            stroke-linecap="round"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="0" />
                  </svg>
                  <span id="db-q-timer-text">${Math.ceil(state.qTimeRemaining)}</span>
                </div>
              </div>
            </div>
            ${mediaHtml}
            ${bodyHtml}
          </div>
        </div>
      `;

      const cardEl = questionMount.querySelector('#db-question-card');
      renderMathInContainer(cardEl);

      // Font size buttons
      questionMount.querySelector('#db-font-dec')?.addEventListener('click', () => {
        state.questionFontSize = Math.max(15, state.questionFontSize - 2);
        const qTextEl = questionMount.querySelector('#db-q-text');
        if (qTextEl) qTextEl.style.fontSize = `${state.questionFontSize}px`;
      });
      questionMount.querySelector('#db-font-inc')?.addEventListener('click', () => {
        state.questionFontSize = Math.min(30, state.questionFontSize + 2);
        const qTextEl = questionMount.querySelector('#db-q-text');
        if (qTextEl) qTextEl.style.fontSize = `${state.questionFontSize}px`;
      });

      // Image Zoom
      const qImg = questionMount.querySelector('#db-q-img');
      if (qImg) {
        qImg.addEventListener('click', () => {
          if (window.ZoomPanOverlay && typeof window.ZoomPanOverlay.open === 'function') {
            window.ZoomPanOverlay.open(qImg.src);
          } else {
            window.open(qImg.src, '_blank');
          }
        });
      }

      // Bind MCQ buttons
      questionMount.querySelectorAll('.db-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-opt-idx'));
          handleMcqSelect(idx, btn);
        });
      });

      // Bind TF buttons
      questionMount.querySelectorAll('.db-tf-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-tf-idx'));
          const val = btn.getAttribute('data-tf-val') === 'true';
          state.tfSelections[idx] = val;
          renderQuestionCard();
        });
      });
      questionMount.querySelector('#db-tf-submit')?.addEventListener('click', () => {
        handleTfSubmit();
      });

      // Bind Short Answer
      const saInput = questionMount.querySelector('#db-sa-input');
      const saSubmit = questionMount.querySelector('#db-sa-submit');
      if (saInput && saSubmit) {
        saSubmit.addEventListener('click', () => handleSaSubmit(saInput.value));
        saInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') handleSaSubmit(saInput.value);
        });
      }
    }

    function handleMcqSelect(optIdx, btnEl) {
      if (state.phase !== 'playing' || state.paused) return;
      const q = rawQuestions[state.qIndex] || rawQuestions[0];
      const correctIdx = Number(q.correctIndex ?? q.correct ?? 0);
      const team = state.teams[state.activeTeamIdx];
      if (!team || !team.alive) return;

      if (optIdx === correctIdx) {
        audio.playCorrect();
        btnEl.classList.add('is-correct');
        const markEl = btnEl.querySelector('.db-opt-mark');
        if (markEl) markEl.textContent = '✓';
        questionMount.querySelectorAll('.db-option-btn').forEach((b) => (b.disabled = true));

        const before = team.iceSeconds;
        team.iceSeconds = Math.min(MAX_ICE_SECONDS, team.iceSeconds + CORRECT_BONUS_SECONDS);
        team.correctCount++;
        const gained = Math.max(1, Math.round(team.iceSeconds - before));
        showFloatingDelta(team.id, gained);
        updateRealtimeHudDOM();

        setTimeout(() => {
          if (state.phase !== 'playing') return;
          const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
          if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
          loadQuestion(state.qIndex + 1, true);
        }, 700);
      } else {
        audio.playWrong();
        state.disabledOptions.add(optIdx);
        state.teamsTriedCurrentQ.add(team.id);
        btnEl.classList.add('is-wrong');
        btnEl.disabled = true;
        const markEl = btnEl.querySelector('.db-opt-mark');
        if (markEl) markEl.textContent = '×';

        team.iceSeconds = Math.max(0, team.iceSeconds - WRONG_PENALTY_SECONDS);
        showFloatingDelta(team.id, -(WRONG_PENALTY_SECONDS + 1));
        updateRealtimeHudDOM();

        if (team.iceSeconds <= 0) {
          triggerTeamSink(team);
          return;
        }

        // Switch turn immediately on the SAME question if another living team hasn't tried yet
        const livingTeams = state.teams.filter((t) => t.alive);
        const untriedLiving = livingTeams.filter((t) => !state.teamsTriedCurrentQ.has(t.id));
        if (untriedLiving.length > 0 && state.disabledOptions.size < 3) {
          const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
          if (nextTeam !== -1) {
            state.activeTeamIdx = nextTeam;
            renderQuestionCard();
            updateRealtimeHudDOM();
          }
        } else {
          setTimeout(() => {
            if (state.phase !== 'playing') return;
            const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
            if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
            loadQuestion(state.qIndex + 1, true);
          }, 650);
        }
      }
    }

    function handleTfSubmit() {
      if (state.phase !== 'playing' || state.paused) return;
      const q = rawQuestions[state.qIndex] || rawQuestions[0];
      const stmts = Array.isArray(q.statements) ? q.statements : [];
      const team = state.teams[state.activeTeamIdx];
      if (!team || !team.alive) return;

      const allCorrect = stmts.every((s, idx) => Boolean(state.tfSelections[idx]) === Boolean(s.isTrue ?? s.correct));
      if (allCorrect) {
        audio.playCorrect();
        team.iceSeconds = Math.min(MAX_ICE_SECONDS, team.iceSeconds + CORRECT_BONUS_SECONDS);
        team.correctCount++;
        showFloatingDelta(team.id, CORRECT_BONUS_SECONDS);
        updateRealtimeHudDOM();
        const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
        if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
        loadQuestion(state.qIndex + 1, true);
      } else {
        audio.playWrong();
        state.teamsTriedCurrentQ.add(team.id);
        team.iceSeconds = Math.max(0, team.iceSeconds - WRONG_PENALTY_SECONDS);
        showFloatingDelta(team.id, -(WRONG_PENALTY_SECONDS + 1));
        updateRealtimeHudDOM();
        if (team.iceSeconds <= 0) {
          triggerTeamSink(team);
          return;
        }
        const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
        if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
        loadQuestion(state.qIndex + 1, true);
      }
    }

    function handleSaSubmit(val) {
      if (state.phase !== 'playing' || state.paused) return;
      const q = rawQuestions[state.qIndex] || rawQuestions[0];
      const expected = normalizeShortAnswer(q.shortAnswer ?? q.answer ?? '');
      const given = normalizeShortAnswer(val);
      const team = state.teams[state.activeTeamIdx];
      if (!team || !team.alive) return;

      if (expected && given === expected) {
        audio.playCorrect();
        team.iceSeconds = Math.min(MAX_ICE_SECONDS, team.iceSeconds + CORRECT_BONUS_SECONDS);
        team.correctCount++;
        showFloatingDelta(team.id, CORRECT_BONUS_SECONDS);
        updateRealtimeHudDOM();
        const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
        if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
        loadQuestion(state.qIndex + 1, true);
      } else {
        audio.playWrong();
        team.iceSeconds = Math.max(0, team.iceSeconds - WRONG_PENALTY_SECONDS);
        showFloatingDelta(team.id, -(WRONG_PENALTY_SECONDS + 1));
        updateRealtimeHudDOM();
        if (team.iceSeconds <= 0) {
          triggerTeamSink(team);
          return;
        }
        const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
        if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
        loadQuestion(state.qIndex + 1, true);
      }
    }

    // Real-time Melting Loop (-1s / second for living teams while question is active)
    function startMeltLoop() {
      cleanupTimers();
      state.lastTickMs = performance.now();
      state.meltTimerId = setInterval(() => {
        if (state.destroyed || state.phase !== 'playing' || state.paused) {
          state.lastTickMs = performance.now();
          return;
        }
        const now = performance.now();
        const dt = Math.min(0.25, Math.max(0, (now - state.lastTickMs) / 1000));
        state.lastTickMs = now;

        // Melt all living teams continuously at 1.0s per second (matching video proof!)
        let sunkTeam = null;
        for (const t of state.teams) {
          if (!t.alive) continue;
          t.iceSeconds = Math.max(0, t.iceSeconds - dt);
          if (t.iceSeconds <= 0 && !sunkTeam) {
            sunkTeam = t;
          }
        }

        // Question timer countdown
        state.qTimeRemaining = Math.max(0, state.qTimeRemaining - dt);
        updateRealtimeHudDOM();

        if (sunkTeam) {
          triggerTeamSink(sunkTeam);
          return;
        }

        if (state.qTimeRemaining <= 0) {
          const activeTeam = state.teams[state.activeTeamIdx];
          if (activeTeam && activeTeam.alive) {
            audio.playWrong();
            activeTeam.iceSeconds = Math.max(0, activeTeam.iceSeconds - WRONG_PENALTY_SECONDS);
            showFloatingDelta(activeTeam.id, -WRONG_PENALTY_SECONDS);
            updateRealtimeHudDOM();
            if (activeTeam.iceSeconds <= 0) {
              triggerTeamSink(activeTeam);
              return;
            }
          }
          const nextTeam = getNextLivingTeamIdx(state.activeTeamIdx);
          if (nextTeam !== -1) state.activeTeamIdx = nextTeam;
          loadQuestion(state.qIndex + 1, true);
        }
      }, 100);
    }

    // "TÕM! 💦" Sinking & Penguin Rescue Animation (Matches f_42.50s.jpg -> f_45.00s.jpg)
    function triggerTeamSink(team) {
      if (!team || !team.alive) return;
      team.alive = false;
      team.iceSeconds = 0;
      state.phase = 'sinking';
      questionMount.innerHTML = '';
      audio.playSplash();

      const bobEl = container.querySelector(`#db-bob-${team.id}`);
      const pillText = container.querySelector(`#db-pill-text-${team.id}`);
      const pillEl = container.querySelector(`#db-pill-${team.id}`);
      if (bobEl) {
        bobEl.style.opacity = '0';
        bobEl.style.transform = 'translateY(55px) scale(0.25)';
      }
      if (pillEl) pillEl.classList.add('is-dead');
      if (pillText) pillText.textContent = `💀 ${team.name}`;
      updateRealtimeHudDOM();

      // Show "TÕM! 💦" + "🐧 Đội cứu hộ xuất phát!" banner and rescue penguin swimmer
      const isLeft = team.rescueSide === 'left';
      const startX = isLeft ? 8 : 92;
      const targetX = team.xPercent;

      fxMount.innerHTML = `
        <div class="db-sink-banner">
          <div class="db-sink-title">TÕM! 💦</div>
          <div class="db-sink-sub">🐧 Đội cứu hộ xuất phát!</div>
        </div>
        <div class="db-rescue-swimmer" id="db-swimmer" style="left: ${startX}%; top: 58%; transform: translate(-50%, -50%);">
          ${createPenguinRescueSvg()}
          <img id="db-swimmer-bear" src="${team.sprite}" style="width: 56px; height: 62px; display: none; object-fit: contain;" />
        </div>
      `;

      const swimmer = fxMount.querySelector('#db-swimmer');
      const swimmerBear = fxMount.querySelector('#db-swimmer-bear');

      // Step 1: Swim from side glacier to sunken bear
      setTimeout(() => {
        if (swimmer) {
          swimmer.style.left = `${targetX}%`;
          swimmer.style.top = '66%';
        }
      }, 60);

      // Step 2: Pick up the bear and swim back to the glacier
      setTimeout(() => {
        if (swimmerBear) swimmerBear.style.display = 'block';
        if (swimmer) {
          swimmer.style.left = `${startX}%`;
          swimmer.style.top = '54%';
        }
      }, 1250);

      // Step 3: Place rescued bear on glacier & check win condition
      setTimeout(() => {
        team.rescued = true;
        fxMount.innerHTML = '';
        renderRescuedBears();

        const living = state.teams.filter((t) => t.alive);
        if (living.length <= 1) {
          finishGame();
        } else {
          state.phase = 'playing';
          if (!state.teams[state.activeTeamIdx]?.alive) {
            const nextIdx = getNextLivingTeamIdx(state.activeTeamIdx);
            if (nextIdx !== -1) state.activeTeamIdx = nextIdx;
          }
          state.lastTickMs = performance.now();
          loadQuestion(state.qIndex + 1, true);
        }
      }, 2500);
    }

    function finishGame() {
      state.phase = 'ended';
      cleanupTimers();
      questionMount.innerHTML = '';
      fxMount.innerHTML = '';
      audio.playVictory();

      const sorted = [...state.teams].sort((a, b) => {
        if (a.alive !== b.alive) return a.alive ? -1 : 1;
        if (Math.ceil(b.iceSeconds) !== Math.ceil(a.iceSeconds)) {
          return Math.ceil(b.iceSeconds) - Math.ceil(a.iceSeconds);
        }
        return b.correctCount - a.correctCount;
      });
      const winner = sorted[0] || state.teams[0];

      modalMount.innerHTML = `
        <div class="db-victory-overlay">
          <div class="db-victory-card">
            <div class="db-victory-trophy">🏆</div>
            <div class="db-victory-sub">TRỤ VỮNG TỚI CUỐI</div>
            <div class="db-victory-winner">${escapeHtml(winner.name)}</div>
            <div class="db-victory-badge">🎉 Chiến thắng!</div>

            <div class="db-rank-list">
              ${sorted
                .map((t, i) => {
                  const secs = Math.max(0, Math.ceil(t.iceSeconds));
                  const icon = i === 0 && t.alive ? '🥇' : t.alive ? '🥈' : '💀';
                  return `
                    <div class="db-rank-row ${!t.alive ? 'is-dead' : ''}">
                      <div class="db-rank-left">
                        <span>${icon}</span>
                        <span>${escapeHtml(t.name)}</span>
                      </div>
                      <div class="db-rank-right">
                        ${t.alive ? `🧊 ${secs}s băng` : 'Bị loại'}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div class="db-victory-btns">
              <button type="button" class="db-v-btn is-primary" id="db-btn-replay">↻ Chơi lại</button>
              <button type="button" class="db-v-btn" id="db-btn-back-lobby">Về danh sách</button>
            </div>
          </div>
        </div>
      `;

      modalMount.querySelector('#db-btn-replay')?.addEventListener('click', () => {
        showSetupModal();
      });
      modalMount.querySelector('#db-btn-back-lobby')?.addEventListener('click', () => {
        cleanupTimers();
        if (typeof options.onExit === 'function') {
          options.onExit();
        } else {
          showSetupModal();
        }
      });
    }

    showSetupModal();

    return {
      destroy() {
        state.destroyed = true;
        cleanupTimers();
      }
    };
  };
})();
