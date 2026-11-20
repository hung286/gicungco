/**
 * ============================================================================
 * BỨC TRANH BÍ ẨN (ĐOÁN TRANH) - EY WEBGAME
 * Trò chơi giải đố mở mảnh ghép hình ảnh ẩn sau các ô số câu hỏi.
 * Chuẩn cơ chế PomyAI:
 *   - Lưới 3x3 (9 mảnh), 4x4 (16 mảnh), 5x5 (25 mảnh).
 *   - Lật thẻ 3D từng mảnh ghép hiển thị đúng phần hình ảnh tương ứng.
 *   - Viền xanh dương (Đội A) hoặc viền đỏ (Đội B) quanh mảnh đã lật.
 *   - Hỗ trợ bấm trực tiếp vào ô số (chọn đội hoặc lật tự do) HOẶC chọn Đội A/B ở thanh điều khiển.
 *   - "Hiện đáp án", "Không đội nào đúng", "Đoán tranh", "Lật hết tranh".
 *   - Hỗ trợ công thức Toán KaTeX, phóng to ảnh đề bài, phóng to/thu nhỏ cỡ chữ A-/A+.
 * ============================================================================
 */

(function () {
  'use strict';

  // Inject Dedicated Styles
  function injectStyles() {
    if (document.getElementById('buc-tranh-bi-an-styles')) return;
    const style = document.createElement('style');
    style.id = 'buc-tranh-bi-an-styles';
    style.textContent = `
      .bt-root {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 640px;
        background: #fdfaf5 url('/ey/games/buc-tranh-bi-an/room_bg.webp') center center / cover no-repeat;
        font-family: 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif;
        color: #1e293b;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Top HUD Bar */
      .bt-hud-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 66px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 24px;
        z-index: 40;
        background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0) 100%);
        backdrop-filter: blur(6px);
      }

      /* Score Badges */
      .bt-score-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 6px 20px;
        border-radius: 9999px;
        background: #ffffff;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
      }
      .bt-score-badge.team-a {
        border: 2px solid #2563eb;
        color: #1e3a8a;
      }
      .bt-score-badge.team-b {
        border: 2px solid #dc2626;
        color: #7f1d1d;
      }
      .bt-score-badge.picking {
        transform: scale(1.06);
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.6), 0 4px 16px rgba(0,0,0,0.12);
        border-color: #f59e0b;
      }

      .bt-badge-tag {
        font-size: 11px;
        font-weight: 900;
        background: #f59e0b;
        color: #fff;
        padding: 2px 8px;
        border-radius: 6px;
        letter-spacing: 0.5px;
        animation: btPulse 0.6s infinite alternate;
      }
      @keyframes btPulse {
        from { transform: scale(0.96); opacity: 0.9; }
        to { transform: scale(1.04); opacity: 1; }
      }

      .bt-badge-name {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .bt-badge-score {
        font-size: 26px;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        min-width: 36px;
        text-align: right;
      }

      /* Top HUD Actions */
      .bt-hud-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bt-btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      }
      .bt-btn-icon:hover {
        background: #f1f5f9;
        transform: scale(1.06);
      }
      .bt-btn-pill {
        padding: 8px 18px;
        border-radius: 9999px;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        color: #334155;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      }
      .bt-btn-pill:hover {
        background: #f8fafc;
        border-color: #94a3b8;
      }
      .bt-btn-pill.danger {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #dc2626;
      }
      .bt-btn-pill.danger:hover {
        background: #fee2e2;
      }

      /* Question Card Banner */
      .bt-qcard-wrapper {
        position: absolute;
        top: 72px;
        left: 50%;
        transform: translateX(-50%);
        width: min(94%, 980px);
        z-index: 35;
      }
      .bt-qcard {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
        border-radius: 18px;
        padding: 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bt-q-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .bt-q-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }
      .bt-q-badge {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: #ffffff;
        font-weight: 900;
        font-size: 13.5px;
        letter-spacing: 0.5px;
        padding: 5px 12px;
        border-radius: 8px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(13,148,136,0.3);
      }
      .bt-q-text {
        font-weight: 800;
        font-size: 19px;
        line-height: 1.45;
        color: #0f172a;
        flex: 1;
        word-break: break-word;
      }
      .bt-q-text img {
        max-height: 90px;
        max-width: 100%;
        border-radius: 8px;
        vertical-align: middle;
        margin: 4px;
        cursor: zoom-in;
      }

      /* Font Controls */
      .bt-font-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .bt-font-btn {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        color: #475569;
        font-size: 12.5px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bt-font-btn:hover {
        background: #e2e8f0;
      }

      /* 4 Options Grid */
      .bt-options-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .bt-opt-card {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      .bt-opt-letter {
        font-weight: 900;
        color: #0d9488;
      }
      .bt-opt-card.correct-revealed {
        background: #ecfdf5 !important;
        border-color: #10b981 !important;
        color: #065f46 !important;
        box-shadow: 0 0 12px rgba(16,185,129,0.35);
      }
      .bt-opt-card.correct-revealed .bt-opt-letter {
        color: #059669 !important;
      }

      /* Central Mystery Picture Frame */
      .bt-frame-wrapper {
        position: absolute;
        top: 218px;
        left: 50%;
        transform: translateX(-50%);
        width: min(88vw, 440px);
        height: min(88vw, 440px);
        max-height: 47vh;
        z-index: 25;
      }
      .bt-outer-frame {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 12px;
        border-radius: 18px;
        background: linear-gradient(135deg, #78350f 0%, #92400e 50%, #582408 100%);
        box-shadow: 0 16px 40px rgba(0,0,0,0.28), inset 0 2px 4px rgba(255,255,255,0.3);
        border: 2px solid #b45309;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bt-inner-canvas {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        overflow: hidden;
        background-color: #f1f5f9;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
      }

      /* Tile Grid - Transparent to never hide the picture */
      .bt-tile-grid {
        position: absolute;
        inset: 0;
        display: grid;
        gap: 3px;
        background: transparent !important;
        padding: 3px;
      }
      .bt-tile-grid.grid-3x3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
      .bt-tile-grid.grid-4x4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
      .bt-tile-grid.grid-5x5 { grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); }

      /* 3D Flip Card Tile */
      .bt-tile-card {
        position: relative;
        width: 100%;
        height: 100%;
        perspective: 900px;
        cursor: pointer;
        user-select: none;
      }
      .bt-tile-flipper {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-radius: 5px;
      }
      .bt-tile-card.is-revealed .bt-tile-flipper {
        transform: rotateY(180deg);
        cursor: default;
      }
      .bt-tile-front, .bt-tile-back {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 5px;
        overflow: hidden;
      }
      .bt-tile-front {
        background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
        color: #ffffff;
        font-size: 26px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 5px rgba(0,0,0,0.15);
        border: 1px solid rgba(255,255,255,0.25);
        transform: rotateY(0deg);
        transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
      }
      .bt-tile-card:hover:not(.is-revealed) .bt-tile-front {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        transform: scale(1.05);
        z-index: 10;
        box-shadow: 0 6px 16px rgba(245,158,11,0.5);
      }
      .bt-tile-card.picking-mode:not(.is-revealed) {
        animation: btTileWiggle 0.8s ease-in-out infinite alternate;
      }
      @keyframes btTileWiggle {
        0% { transform: scale(1); filter: brightness(1); }
        100% { transform: scale(1.04); filter: brightness(1.15) drop-shadow(0 0 6px #f59e0b); }
      }
      .bt-tile-back {
        transform: rotateY(180deg);
        background-repeat: no-repeat;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .bt-tile-card.revealed-team-a .bt-tile-back {
        border: 3.5px solid #2563eb !important;
        box-shadow: inset 0 0 8px rgba(37,99,235,0.45) !important;
      }
      .bt-tile-card.revealed-team-b .bt-tile-back {
        border: 3.5px solid #dc2626 !important;
        box-shadow: inset 0 0 8px rgba(220,38,38,0.45) !important;
      }
      .bt-tile-card.revealed-neutral .bt-tile-back {
        border: 2px dashed rgba(255,255,255,0.85) !important;
      }

      /* Direct Tile Click Popover */
      .bt-tile-popover {
        position: absolute;
        bottom: 108%;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        border-radius: 12px;
        padding: 8px 10px;
        z-index: 60;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        animation: btPopIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes btPopIn {
        from { transform: translateX(-50%) scale(0.85); opacity: 0; }
        to { transform: translateX(-50%) scale(1); opacity: 1; }
      }
      .bt-pop-title {
        font-size: 11.5px;
        font-weight: 700;
        color: #475569;
      }
      .bt-pop-btns {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .bt-pop-btn {
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        border: none;
        transition: transform 0.15s;
      }
      .bt-pop-btn:hover { transform: scale(1.05); }
      .bt-pop-btn.team-a { background: #2563eb; color: #fff; }
      .bt-pop-btn.team-b { background: #dc2626; color: #fff; }
      .bt-pop-btn.neutral { background: #64748b; color: #fff; }
      .bt-pop-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 13px;
        font-weight: 800;
        padding: 0 4px;
      }

      /* Bottom Interactive Control Bar */
      .bt-bottom-bar-wrapper {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        width: min(94%, 960px);
        z-index: 38;
      }
      .bt-bottom-bar {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05);
        border-radius: 20px;
        padding: 10px 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .bt-btn-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }

      /* Bottom Buttons */
      .bt-btn-action {
        padding: 8px 18px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        border: none;
      }
      .bt-btn-action:hover {
        transform: translateY(-2px);
      }
      .bt-btn-white {
        background: #ffffff;
        border: 1.5px solid #cbd5e1 !important;
        color: #334155;
      }
      .bt-btn-white:hover {
        background: #f8fafc;
        border-color: #94a3b8 !important;
      }
      .bt-btn-team-a {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(37,99,235,0.35);
      }
      .bt-btn-team-a:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      }
      .bt-btn-team-b {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(220,38,38,0.35);
      }
      .bt-btn-team-b:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      }
      .bt-btn-neutral {
        background: #f1f5f9;
        border: 1.5px solid #cbd5e1 !important;
        color: #64748b;
      }
      .bt-btn-neutral:hover {
        background: #e2e8f0;
      }
      .bt-btn-gold {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(245,158,11,0.4);
      }
      .bt-btn-gold:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      }
      .bt-btn-green {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(16,185,129,0.4);
      }
      .bt-btn-red {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(239,68,68,0.4);
      }

      .bt-pick-banner {
        font-size: 14.5px;
        font-weight: 800;
        color: #0f172a;
        background: #fef3c7;
        border: 1.5px solid #fde047;
        padding: 6px 16px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: btPickBannerGlow 1s infinite alternate;
      }
      @keyframes btPickBannerGlow {
        from { box-shadow: 0 0 6px rgba(245,158,11,0.2); }
        to { box-shadow: 0 0 16px rgba(245,158,11,0.5); }
      }

      /* Modal Dialogs */
      .bt-modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .bt-modal-card {
        background: #ffffff;
        border-radius: 24px;
        padding: 28px 32px;
        max-width: 540px;
        width: 100%;
        box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        text-align: center;
        animation: btModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes btModalIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .bt-modal-title {
        font-size: 24px;
        font-weight: 900;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .bt-modal-desc {
        font-size: 14px;
        color: #64748b;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      /* Settings Form */
      .bt-form-row {
        margin-bottom: 14px;
        text-align: left;
      }
      .bt-form-label {
        font-size: 13px;
        font-weight: 800;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        display: block;
      }
      .bt-select {
        width: 100%;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1.5px solid #cbd5e1;
        font-size: 14.5px;
        font-weight: 700;
        color: #0f172a;
        background: #f8fafc;
        outline: none;
      }

      /* Picture Selection Gallery */
      .bt-pic-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 8px;
      }
      .bt-pic-card {
        border: 2px solid #e2e8f0;
        border-radius: 14px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        background: #f8fafc;
      }
      .bt-pic-card:hover {
        border-color: #0d9488;
        transform: translateY(-2px);
      }
      .bt-pic-card.active {
        border-color: #0d9488;
        background: #f0fdfa;
        box-shadow: 0 0 14px rgba(13,148,136,0.3);
      }
      .bt-pic-thumb {
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 6px;
      }
      .bt-pic-name {
        font-size: 13.5px;
        font-weight: 800;
        color: #0f172a;
      }

      .bt-btn-start {
        width: 100%;
        padding: 14px;
        border-radius: 9999px;
        border: none;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: #ffffff;
        font-size: 17px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(13,148,136,0.4);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-top: 14px;
      }
      .bt-btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(13,148,136,0.6);
      }
    `;
    document.head.appendChild(style);
  }

  // Synthesized Web Audio
  class DoanTranhAudio {
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

    playTileFlip() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playTileReveal() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
      } catch (e) {}
    }

    playCorrect() {
      if (window.soundFx && typeof window.soundFx.correct === 'function') {
        window.soundFx.correct();
      } else {
        this.playTileReveal();
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
          osc.frequency.linearRampToValueAtTime(90, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        } catch (e) {}
      }
    }

    playVictory() {
      if (window.soundFx && typeof window.soundFx.fanfare === 'function') {
        window.soundFx.fanfare();
      } else {
        this.playTileReveal();
      }
    }
  }

  // Proper DOM-based KaTeX formula renderer
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

  // Pre-configured Mystery Pictures
  const PRESET_PICTURES = [
    {
      id: 'cat',
      name: 'Con mèo',
      desc: 'Chú mèo vàng đáng yêu đang tắm nắng',
      url: '/ey/games/buc-tranh-bi-an/pictures/cat.webp'
    },
    {
      id: 'castle',
      name: 'Lâu đài cổ tích',
      desc: 'Tòa lâu đài nguy nga tráng lệ trong khu rừng',
      url: '/ey/games/buc-tranh-bi-an/pictures/castle.webp'
    }
  ];

  // Main Launcher
  window.launchBucTranhBiAnGame = function launchBucTranhBiAnGame(container, options = {}) {
    if (!container) return;
    injectStyles();

    const audio = new DoanTranhAudio();
    const rawQuestions = Array.isArray(options.questions) && options.questions.length > 0
      ? options.questions
      : [
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correctIndex: 1 },
          { text: "Số nào cộng với 36 thì được 90?", options: ["64", "56", "44", "54"], correctIndex: 3 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 }
        ];

    const questions = normalizeQuestions(rawQuestions);

    const state = {
      destroyed: false,
      gridDim: options.gridDim || 4, // 3, 4, 5
      activePicture: options.picture || PRESET_PICTURES[0],
      currentQIndex: 0,
      qFontSize: 19,
      isAnswerRevealed: false,
      pickingTeam: null, // null | 'a' | 'b'
      isGuessMode: false,
      guessTeam: null,   // null | 'a' | 'b'
      isGameOver: false,

      // Teams
      teamA: {
        name: 'Đội A',
        score: 0,
        tilesOpened: 0
      },
      teamB: {
        name: 'Đội B',
        score: 0,
        tilesOpened: 0
      },

      // Tiles: array of { index, revealed, openedBy, element }
      tiles: []
    };

    // Root HTML Structure
    container.innerHTML = `
      <div class="bt-root" id="bt-root">
        <!-- Top HUD -->
        <div class="bt-hud-top">
          <div style="display: flex; gap: 14px;">
            <div class="bt-score-badge team-a" id="bt-badge-team-a">
              <span style="font-size: 20px;">🔵</span>
              <div>
                <div class="bt-badge-name" id="bt-name-a">${state.teamA.name}</div>
                <div id="bt-tag-a"></div>
              </div>
              <div class="bt-badge-score" id="bt-score-a">0</div>
            </div>

            <div class="bt-score-badge team-b" id="bt-badge-team-b">
              <span style="font-size: 20px;">🔴</span>
              <div>
                <div class="bt-badge-name" id="bt-name-b">${state.teamB.name}</div>
                <div id="bt-tag-b"></div>
              </div>
              <div class="bt-badge-score" id="bt-score-b">0</div>
            </div>
          </div>

          <div class="bt-hud-actions">
            <button class="bt-btn-icon" id="bt-btn-sound" title="Bật/Tắt âm thanh">🔊</button>
            <button class="bt-btn-pill danger" id="bt-btn-exit">Kết thúc</button>
          </div>
        </div>

        <!-- Question Card Banner -->
        <div class="bt-qcard-wrapper" id="bt-qcard-wrapper">
          <div class="bt-qcard">
            <div class="bt-q-header">
              <div class="bt-q-left">
                <span class="bt-q-badge" id="bt-q-badge">CÂU 1</span>
                <div class="bt-q-text" id="bt-q-text"></div>
              </div>
              <div class="bt-font-controls">
                <button class="bt-font-btn" id="bt-font-dec">A-</button>
                <button class="bt-font-btn" id="bt-font-inc">A+</button>
              </div>
            </div>
            <!-- 4 Options Grid -->
            <div class="bt-options-grid" id="bt-options-grid"></div>
          </div>
        </div>

        <!-- Central Mystery Frame -->
        <div class="bt-frame-wrapper" id="bt-frame-wrapper">
          <div class="bt-outer-frame">
            <div class="bt-inner-canvas" id="bt-inner-canvas" style="background-image: url('${state.activePicture.url}');">
              <div class="bt-tile-grid grid-${state.gridDim}x${state.gridDim}" id="bt-tile-grid"></div>
            </div>
          </div>
        </div>

        <!-- Bottom Interactive Control Bar -->
        <div class="bt-bottom-bar-wrapper">
          <div class="bt-bottom-bar" id="bt-bottom-bar"></div>
        </div>

        <!-- Modal Mount Point -->
        <div id="bt-modal-mount"></div>
      </div>
    `;

    const rootEl = container.querySelector('#bt-root');
    const badgeTeamA = container.querySelector('#bt-badge-team-a');
    const badgeTeamB = container.querySelector('#bt-badge-team-b');
    const scoreAEl = container.querySelector('#bt-score-a');
    const scoreBEl = container.querySelector('#bt-score-b');
    const tagAEl = container.querySelector('#bt-tag-a');
    const tagBEl = container.querySelector('#bt-tag-b');
    const qBadge = container.querySelector('#bt-q-badge');
    const qText = container.querySelector('#bt-q-text');
    const optionsGrid = container.querySelector('#bt-options-grid');
    const innerCanvas = container.querySelector('#bt-inner-canvas');
    const tileGrid = container.querySelector('#bt-tile-grid');
    const bottomBar = container.querySelector('#bt-bottom-bar');
    const modalMount = container.querySelector('#bt-modal-mount');

    // Update Top Score HUD
    function updateScoreHud() {
      scoreAEl.textContent = String(state.teamA.score);
      scoreBEl.textContent = String(state.teamB.score);

      if (state.pickingTeam === 'a') {
        badgeTeamA.classList.add('picking');
        badgeTeamB.classList.remove('picking');
        tagAEl.innerHTML = `<span class="bt-badge-tag">▶ CHỌN MẢNH</span>`;
        tagBEl.innerHTML = '';
      } else if (state.pickingTeam === 'b') {
        badgeTeamB.classList.add('picking');
        badgeTeamA.classList.remove('picking');
        tagBEl.innerHTML = `<span class="bt-badge-tag">▶ CHỌN MẢNH</span>`;
        tagAEl.innerHTML = '';
      } else {
        badgeTeamA.classList.remove('picking');
        badgeTeamB.classList.remove('picking');
        tagAEl.innerHTML = '';
        tagBEl.innerHTML = '';
      }
    }

    // Build Tiles as 3D Flip Cards with Exact Sprite Slice Sizing
    function buildTileGrid() {
      tileGrid.innerHTML = '';
      const dim = state.gridDim;
      tileGrid.className = `bt-tile-grid grid-${dim}x${dim}`;
      innerCanvas.style.backgroundImage = `url('${state.activePicture.url}')`;

      state.tiles.forEach(tile => {
        const row = Math.floor((tile.index - 1) / dim);
        const col = (tile.index - 1) % dim;
        const posX = dim > 1 ? (col / (dim - 1)) * 100 : 0;
        const posY = dim > 1 ? (row / (dim - 1)) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'bt-tile-card';
        card.dataset.idx = String(tile.index);
        card.innerHTML = `
          <div class="bt-tile-flipper">
            <div class="bt-tile-front">
              <span>${tile.index}</span>
            </div>
            <div class="bt-tile-back" style="background-image: url('${state.activePicture.url}'); background-size: ${dim * 100}% ${dim * 100}%; background-position: ${posX.toFixed(3)}% ${posY.toFixed(3)}%;"></div>
          </div>
        `;

        card.addEventListener('click', (e) => {
          e.stopPropagation();
          if (tile.revealed) return;
          if (state.pickingTeam) {
            handleTilePick(tile.index, state.pickingTeam);
          } else {
            // Direct click without pre-selecting a team: show fast popover choice
            showTilePickPopover(card, tile);
          }
        });

        tileGrid.appendChild(card);
        tile.element = card;
      });
    }

    // Fast Popover on Direct Tile Click
    function showTilePickPopover(card, tile) {
      const oldPop = container.querySelector('.bt-tile-popover');
      if (oldPop) oldPop.remove();

      const pop = document.createElement('div');
      pop.className = 'bt-tile-popover';
      pop.innerHTML = `
        <div class="bt-pop-title">Mảnh số <strong>${tile.index}</strong>:</div>
        <div class="bt-pop-btns">
          <button class="bt-pop-btn team-a" data-team="a">🔵 Đội A (+1)</button>
          <button class="bt-pop-btn team-b" data-team="b">🔴 Đội B (+1)</button>
          <button class="bt-pop-btn neutral" data-team="neutral">👁️ Lật xem</button>
          <button class="bt-pop-close" title="Đóng">✕</button>
        </div>
      `;

      card.appendChild(pop);

      pop.querySelector('[data-team="a"]').addEventListener('click', (ev) => {
        ev.stopPropagation();
        pop.remove();
        handleTilePick(tile.index, 'a');
      });
      pop.querySelector('[data-team="b"]').addEventListener('click', (ev) => {
        ev.stopPropagation();
        pop.remove();
        handleTilePick(tile.index, 'b');
      });
      pop.querySelector('[data-team="neutral"]').addEventListener('click', (ev) => {
        ev.stopPropagation();
        pop.remove();
        handleTilePick(tile.index, 'neutral');
      });
      pop.querySelector('.bt-pop-close').addEventListener('click', (ev) => {
        ev.stopPropagation();
        pop.remove();
      });
    }

    // Load Question
    function loadQuestion(idx) {
      if (idx >= questions.length) {
        handleAllRevealed();
        return;
      }

      state.currentQIndex = idx;
      state.isAnswerRevealed = false;
      state.pickingTeam = null;
      state.isGuessMode = false;
      state.guessTeam = null;

      // Close any open popovers
      const oldPop = container.querySelector('.bt-tile-popover');
      if (oldPop) oldPop.remove();

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

      // Render 4 options
      optionsGrid.innerHTML = q.options.map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        return `
          <div class="bt-opt-card" data-opt-idx="${i}">
            <span class="bt-opt-letter">${letter}.</span>
            <span class="bt-opt-content">${opt}</span>
          </div>
        `;
      }).join('');
      renderMathInContainer(optionsGrid);

      // Reset tile wiggle states
      state.tiles.forEach(t => {
        if (t.element) {
          t.element.classList.remove('picking-mode');
        }
      });

      updateScoreHud();
      renderBottomBar();
    }

    // Reveal Correct Answer
    function revealAnswer() {
      if (state.isAnswerRevealed) return;
      state.isAnswerRevealed = true;
      const q = questions[state.currentQIndex];

      const optCards = optionsGrid.querySelectorAll('.bt-opt-card');
      if (optCards[q.correctIndex]) {
        optCards[q.correctIndex].classList.add('correct-revealed');
        const letterEl = optCards[q.correctIndex].querySelector('.bt-opt-letter');
        if (letterEl) letterEl.textContent = '✓ ';
      }
      audio.playCorrect();
      renderBottomBar();
    }

    // Set Team Answered Correctly (Start Tile Selection Phase)
    function setTeamCorrect(teamKey) {
      revealAnswer();
      state.pickingTeam = teamKey;
      state.isGuessMode = false;

      // Animate unrevealed tiles to invite clicking
      state.tiles.forEach(t => {
        if (!t.revealed && t.element) {
          t.element.classList.add('picking-mode');
        }
      });

      updateScoreHud();
      renderBottomBar();
    }

    // Handle Tile Picked
    function handleTilePick(tileIdx, teamKey = 'a') {
      const tile = state.tiles.find(t => t.index === tileIdx);
      if (!tile || tile.revealed) return;

      const pop = container.querySelector('.bt-tile-popover');
      if (pop) pop.remove();

      tile.revealed = true;
      tile.openedBy = teamKey;

      if (teamKey === 'a') {
        state.teamA.score++;
        state.teamA.tilesOpened++;
      } else if (teamKey === 'b') {
        state.teamB.score++;
        state.teamB.tilesOpened++;
      }

      // 3D Flip the tile
      audio.playTileFlip();
      tile.element.classList.remove('picking-mode');
      tile.element.classList.add('is-revealed');
      if (teamKey === 'a') {
        tile.element.classList.add('revealed-team-a');
      } else if (teamKey === 'b') {
        tile.element.classList.add('revealed-team-b');
      } else {
        tile.element.classList.add('revealed-neutral');
      }

      state.pickingTeam = null;
      updateScoreHud();

      // Check if all tiles opened
      const remaining = state.tiles.filter(t => !t.revealed);
      if (remaining.length === 0) {
        setTimeout(() => handleAllRevealed(), 800);
      } else {
        // Advance to next question after 1.2s
        setTimeout(() => {
          if (!state.destroyed && state.currentQIndex < questions.length - 1) {
            loadQuestion(state.currentQIndex + 1);
          }
        }, 1200);
      }
    }

    // Guess Picture Mode
    function enterGuessMode(teamKey = null) {
      state.isGuessMode = true;
      state.guessTeam = teamKey;
      state.pickingTeam = null;
      updateScoreHud();
      renderBottomBar();
    }

    // Evaluate Guess
    function evaluateGuess(isCorrect) {
      const teamKey = state.guessTeam;
      const teamObj = teamKey === 'a' ? state.teamA : state.teamB;

      if (isCorrect) {
        // Correct Guess
        const remainingTiles = state.tiles.filter(t => !t.revealed);
        const bonusPoints = remainingTiles.length + 5;
        teamObj.score += bonusPoints;
        updateScoreHud();

        // Flip all remaining tiles smoothly
        audio.playVictory();
        remainingTiles.forEach((t, i) => {
          t.revealed = true;
          t.openedBy = teamKey;
          setTimeout(() => {
            t.element.classList.remove('picking-mode');
            t.element.classList.add('is-revealed');
            t.element.classList.add(teamKey === 'a' ? 'revealed-team-a' : 'revealed-team-b');
            audio.playTileFlip();
          }, i * 40);
        });

        setTimeout(() => {
          showVictoryModal();
        }, remainingTiles.length * 40 + 600);
      } else {
        // Wrong Guess
        audio.playWrong();
        teamObj.score = Math.max(0, teamObj.score - 2);
        updateScoreHud();
        alert(`${teamObj.name} đoán chưa chính xác (-2 điểm). Trận đấu tiếp tục!`);
        state.isGuessMode = false;
        state.guessTeam = null;
        renderBottomBar();
      }
    }

    // Reveal All Tiles (Lật hết tranh)
    function revealAllTiles() {
      audio.playTileReveal();
      const unrevealed = state.tiles.filter(t => !t.revealed);
      unrevealed.forEach((t, i) => {
        t.revealed = true;
        t.openedBy = 'neutral';
        setTimeout(() => {
          t.element.classList.remove('picking-mode');
          t.element.classList.add('is-revealed', 'revealed-neutral');
          audio.playTileFlip();
        }, i * 45);
      });

      setTimeout(() => {
        handleAllRevealed();
      }, unrevealed.length * 45 + 500);
    }

    // When All Tiles are Revealed
    function handleAllRevealed() {
      audio.playVictory();
      bottomBar.innerHTML = `
        <div style="font-size: 16px; font-weight: 900; color: #0d9488; display: flex; align-items: center; gap: 8px;">
          <span>🌟</span>
          <span>BỨC TRANH BÍ ẨN: <strong>${state.activePicture.name.toUpperCase()}</strong></span>
        </div>
        <div class="bt-btn-row">
          <button class="bt-btn-action bt-btn-green" id="bt-btn-view-results">🏆 Xem kết quả trận đấu</button>
          <button class="bt-btn-action bt-btn-white" id="bt-btn-replay-all">🔄 Ván mới</button>
        </div>
      `;

      bottomBar.querySelector('#bt-btn-view-results')?.addEventListener('click', showVictoryModal);
      bottomBar.querySelector('#bt-btn-replay-all')?.addEventListener('click', () => {
        showSetupModal();
      });
    }

    // Render Bottom Interactive Bar
    function renderBottomBar() {
      // 1. Tile Selection Phase
      if (state.pickingTeam) {
        const teamName = state.pickingTeam === 'a' ? state.teamA.name : state.teamB.name;
        bottomBar.innerHTML = `
          <div class="bt-pick-banner">
            <span>👉</span>
            <span><strong>${teamName}</strong> chọn một mảnh — bấm vào ô số trên khung tranh!</span>
          </div>
          <div class="bt-btn-row">
            <button class="bt-btn-action bt-btn-gold" id="bt-btn-guess">🎨 Đoán tranh</button>
            <button class="bt-btn-action bt-btn-white" id="bt-btn-reveal-all">Lật hết tranh</button>
          </div>
        `;
        bindBottomActions();
        return;
      }

      // 2. Guessing Phase: Selecting Team
      if (state.isGuessMode && !state.guessTeam) {
        bottomBar.innerHTML = `
          <div class="bt-btn-row">
            <span style="font-weight: 800; font-size: 15px; color: #f59e0b;">Đội nào đoán?</span>
            <button class="bt-btn-action bt-btn-team-a" id="bt-guess-pick-a">Đội A</button>
            <button class="bt-btn-action bt-btn-team-b" id="bt-guess-pick-b">Đội B</button>
            <button class="bt-btn-action bt-btn-white" id="bt-guess-cancel">Huỷ</button>
            <button class="bt-btn-action bt-btn-white" id="bt-btn-reveal-all">Lật hết tranh</button>
          </div>
        `;
        bottomBar.querySelector('#bt-guess-pick-a')?.addEventListener('click', () => enterGuessMode('a'));
        bottomBar.querySelector('#bt-guess-pick-b')?.addEventListener('click', () => enterGuessMode('b'));
        bottomBar.querySelector('#bt-guess-cancel')?.addEventListener('click', () => {
          state.isGuessMode = false;
          renderBottomBar();
        });
        bottomBar.querySelector('#bt-btn-reveal-all')?.addEventListener('click', revealAllTiles);
        return;
      }

      // 3. Guessing Phase: Team Guess Decision
      if (state.isGuessMode && state.guessTeam) {
        const teamName = state.guessTeam === 'a' ? state.teamA.name : state.teamB.name;
        bottomBar.innerHTML = `
          <div class="bt-btn-row">
            <span style="font-weight: 800; font-size: 15px; color: ${state.guessTeam === 'a' ? '#2563eb' : '#dc2626'};">
              ${teamName} đoán:
            </span>
            <button class="bt-btn-action bt-btn-green" id="bt-guess-btn-correct">✓ Đúng</button>
            <button class="bt-btn-action bt-btn-red" id="bt-guess-btn-wrong">✗ Sai</button>
            <button class="bt-btn-action bt-btn-white" id="bt-guess-cancel">Huỷ</button>
            <button class="bt-btn-action bt-btn-white" id="bt-btn-reveal-all">Lật hết tranh</button>
          </div>
        `;
        bottomBar.querySelector('#bt-guess-btn-correct')?.addEventListener('click', () => evaluateGuess(true));
        bottomBar.querySelector('#bt-guess-btn-wrong')?.addEventListener('click', () => evaluateGuess(false));
        bottomBar.querySelector('#bt-guess-cancel')?.addEventListener('click', () => {
          state.isGuessMode = false;
          state.guessTeam = null;
          renderBottomBar();
        });
        bottomBar.querySelector('#bt-btn-reveal-all')?.addEventListener('click', revealAllTiles);
        return;
      }

      // 4. Default Question Phase
      bottomBar.innerHTML = `
        <div class="bt-btn-row">
          <button class="bt-btn-action bt-btn-white" id="bt-btn-show-ans">
            ${state.isAnswerRevealed ? '✓ Đã hiện đáp án' : 'Hiện đáp án'}
          </button>
          <span style="font-size: 13.5px; font-weight: 700; color: #64748b; margin-left: 4px;">Đội trả lời đúng:</span>
          <button class="bt-btn-action bt-btn-team-a" id="bt-btn-ans-a">Đội A</button>
          <button class="bt-btn-action bt-btn-team-b" id="bt-btn-ans-b">Đội B</button>
          <button class="bt-btn-action bt-btn-neutral" id="bt-btn-ans-none">Không đội nào đúng</button>
        </div>
        <div class="bt-btn-row" style="margin-top: 2px;">
          <button class="bt-btn-action bt-btn-gold" id="bt-btn-guess">🎨 Đoán tranh</button>
          <button class="bt-btn-action bt-btn-white" id="bt-btn-reveal-all">Lật hết tranh</button>
        </div>
      `;
      bindBottomActions();
    }

    function bindBottomActions() {
      bottomBar.querySelector('#bt-btn-show-ans')?.addEventListener('click', revealAnswer);

      bottomBar.querySelector('#bt-btn-ans-a')?.addEventListener('click', () => {
        setTeamCorrect('a');
      });

      bottomBar.querySelector('#bt-btn-ans-b')?.addEventListener('click', () => {
        setTeamCorrect('b');
      });

      bottomBar.querySelector('#bt-btn-ans-none')?.addEventListener('click', () => {
        revealAnswer();
        setTimeout(() => {
          if (!state.destroyed && state.currentQIndex < questions.length - 1) {
            loadQuestion(state.currentQIndex + 1);
          }
        }, 1200);
      });

      bottomBar.querySelector('#bt-btn-guess')?.addEventListener('click', () => {
        enterGuessMode(null);
      });

      bottomBar.querySelector('#bt-btn-reveal-all')?.addEventListener('click', revealAllTiles);
    }

    // Font Sizing
    container.querySelector('#bt-font-inc')?.addEventListener('click', () => {
      state.qFontSize = Math.min(30, state.qFontSize + 2);
      qText.style.fontSize = `${state.qFontSize}px`;
    });
    container.querySelector('#bt-font-dec')?.addEventListener('click', () => {
      state.qFontSize = Math.max(15, state.qFontSize - 2);
      qText.style.fontSize = `${state.qFontSize}px`;
    });

    // Sound Toggle
    const soundBtn = container.querySelector('#bt-btn-sound');
    soundBtn?.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      soundBtn.textContent = audio.enabled ? '🔊' : '🔇';
    });

    // Exit Button
    container.querySelector('#bt-btn-exit')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn kết thúc ván chơi Bức Tranh Bí Ẩn?')) {
        destroy();
        if (typeof options.onExit === 'function') options.onExit();
      }
    });

    // Pre-game Setup Modal (Matching PomyAI f_047.0s.jpg)
    function showSetupModal() {
      modalMount.innerHTML = `
        <div class="bt-modal-overlay">
          <div class="bt-modal-card">
            <div style="font-size: 52px; margin-bottom: 6px;">🖼️</div>
            <div class="bt-modal-title">BỨC TRANH BÍ ẨN</div>
            <div class="bt-modal-desc">
              Học sinh giải đáp câu hỏi để mở từng mảnh ghép, khám phá bức tranh giấu kín phía sau!
            </div>

            <!-- Grid Dimensions -->
            <div class="bt-form-row">
              <label class="bt-form-label">SỐ MẢNH CHE (ĐỘ PHÂN GIẢI LƯỚI):</label>
              <select class="bt-select" id="bt-setting-grid">
                <option value="3" ${state.gridDim === 3 ? 'selected' : ''}>3 × 3 (9 mảnh - Dễ, hợp tiểu học)</option>
                <option value="4" ${state.gridDim === 4 ? 'selected' : ''}>4 × 4 (16 mảnh - Chuẩn thi đấu)</option>
                <option value="5" ${state.gridDim === 5 ? 'selected' : ''}>5 × 5 (25 mảnh - Nâng cao, kịch tính)</option>
              </select>
            </div>

            <!-- Picture Gallery Selection -->
            <div style="font-size: 13px; font-weight: 800; color: #0d9488; text-transform: uppercase; margin: 14px 0 8px; text-align: left;">
              CHỌN BỨC TRANH BÍ ẨN:
            </div>
            <div class="bt-pic-grid" id="bt-pic-grid">
              ${PRESET_PICTURES.map(pic => `
                <div class="bt-pic-card ${pic.id === state.activePicture.id ? 'active' : ''}" data-pic-id="${pic.id}">
                  <img class="bt-pic-thumb" src="${pic.url}" alt="${pic.name}">
                  <div class="bt-pic-name">${pic.name}</div>
                </div>
              `).join('')}
            </div>

            <button class="bt-btn-start" id="bt-btn-start-game">
              🚀 VÀO VÁN CHƠI NGAY
            </button>
          </div>
        </div>
      `;

      modalMount.querySelectorAll('.bt-pic-card').forEach(card => {
        card.addEventListener('click', () => {
          modalMount.querySelectorAll('.bt-pic-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const pic = PRESET_PICTURES.find(p => p.id === card.dataset.picId);
          if (pic) state.activePicture = pic;
        });
      });

      modalMount.querySelector('#bt-btn-start-game')?.addEventListener('click', () => {
        audio.init();
        const gridSelect = modalMount.querySelector('#bt-setting-grid');
        if (gridSelect) state.gridDim = parseInt(gridSelect.value, 10) || 4;

        // Reset Tiles
        state.tiles = [];
        const nTiles = state.gridDim * state.gridDim;
        for (let i = 1; i <= nTiles; i++) {
          state.tiles.push({ index: i, revealed: false, openedBy: null });
        }

        buildTileGrid();
        modalMount.innerHTML = '';
        loadQuestion(0);
      });
    }

    // Victory Celebration Modal
    function showVictoryModal() {
      state.isGameOver = true;
      audio.playVictory();

      const aWon = state.teamA.score > state.teamB.score;
      const bWon = state.teamB.score > state.teamA.score;
      let winnerTitle = '';
      let winnerSubtitle = '';

      if (aWon) {
        winnerTitle = `🎉 ${state.teamA.name.toUpperCase()} CHIẾN THẮNG! 🏆`;
        winnerSubtitle = `${state.teamA.name} đã xuất sắc mở nhiều mảnh ghép và ghi điểm số cao nhất!`;
      } else if (bWon) {
        winnerTitle = `🎉 ${state.teamB.name.toUpperCase()} CHIẾN THẮNG! 🏆`;
        winnerSubtitle = `${state.teamB.name} đã xuất sắc mở nhiều mảnh ghép và ghi điểm số cao nhất!`;
      } else {
        winnerTitle = '🤝 TRẬN ĐẤU BẤT PHÂN THẮNG BẠI!';
        winnerSubtitle = 'Hai đội có số điểm bằng nhau, một trận thi đấu giải đố trí tuệ tuyệt vời!';
      }

      modalMount.innerHTML = `
        <div class="bt-modal-overlay">
          <div class="bt-modal-card">
            <div style="font-size: 56px; margin-bottom: 6px;">🏆</div>
            <div class="bt-modal-title">${winnerTitle}</div>
            <div class="bt-modal-desc">${winnerSubtitle}</div>

            <!-- Score Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0;">
              <div style="background: #eff6ff; border: 2px solid #2563eb; border-radius: 16px; padding: 14px;">
                <div style="font-size: 16px; font-weight: 900; color: #1e40af;">🔵 ${state.teamA.name}</div>
                <div style="font-size: 36px; font-weight: 900; color: #2563eb; margin: 4px 0;">${state.teamA.score}</div>
                <div style="font-size: 12px; color: #64748b;">Mảnh đã mở: ${state.teamA.tilesOpened}</div>
              </div>

              <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 16px; padding: 14px;">
                <div style="font-size: 16px; font-weight: 900; color: #991b1b;">🔴 ${state.teamB.name}</div>
                <div style="font-size: 36px; font-weight: 900; color: #dc2626; margin: 4px 0;">${state.teamB.score}</div>
                <div style="font-size: 12px; color: #64748b;">Mảnh đã mở: ${state.teamB.tilesOpened}</div>
              </div>
            </div>

            <!-- Picture Revealed Summary -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 12px; margin: 14px 0; display: inline-flex; align-items: center; gap: 14px;">
              <img src="${state.activePicture.url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: 900; color: #0d9488;">${state.activePicture.name}</div>
                <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">${state.activePicture.desc || ''}</div>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 12px; margin-top: 18px;">
              <button class="bt-btn-action bt-btn-green" id="bt-btn-replay" style="flex: 1; justify-content: center; padding: 12px; font-size: 15px;">
                🔄 Chơi lại lượt mới
              </button>
              <button class="bt-btn-action bt-btn-white" id="bt-btn-close-lobby" style="flex: 1; justify-content: center; padding: 12px; font-size: 15px;">
                🚪 Về danh mục
              </button>
            </div>
          </div>
        </div>
      `;

      modalMount.querySelector('#bt-btn-replay')?.addEventListener('click', () => {
        state.teamA.score = 0; state.teamA.tilesOpened = 0;
        state.teamB.score = 0; state.teamB.tilesOpened = 0;
        state.isGameOver = false;
        showSetupModal();
      });

      modalMount.querySelector('#bt-btn-close-lobby')?.addEventListener('click', () => {
        destroy();
        if (typeof options.onExit === 'function') options.onExit();
      });
    }

    // Cleanup & Destroy
    function destroy() {
      state.destroyed = true;
      container.innerHTML = '';
    }

    // Launch initial modal
    showSetupModal();

    return {
      destroy
    };
  };
})();
