/**
 * TRÒ CHƠI ĐƯỜNG ĐUA SIÊU TỐC (HIGH-SPEED MOUNTAIN TRAIN RACE)
 * Bám sát 100% thiết kế, đồ họa đoàn tàu hơi nước leo đồi núi, câu hỏi quà tặng (Tên lửa 🚀, Xúc than 🔥, Toa hàng 🚃),
 * chia đôi màn hình bấm phím QWER / UIOP hoặc cảm ứng từ video mẫu, tích hợp đầy đủ bộ câu hỏi iMath/Azota (KaTeX, phóng to ảnh).
 */
(function () {
  'use strict';

  const BASE_SPEED_STEP = 0.12;
  const ROCKET_BONUS_SPEED = 0.24;
  const COAL_PERM_SPEED = 0.12;
  const CARGO_PENALTY_SPEED = 0.12;
  const QUESTION_TIME_LIMIT = 30;

  const GIFT_TYPES = [
    {
      id: 'rocket',
      icon: '🚀',
      title: 'Tên lửa',
      desc: 'tăng tốc mạnh 2 câu',
      badgeText: '🚀 Tên lửa tăng tốc mạnh 2 câu'
    },
    {
      id: 'coal',
      icon: '🔥',
      title: 'Xúc than',
      desc: 'tăng tốc vĩnh viễn',
      badgeText: '🔥 Xúc than tăng tốc vĩnh viễn'
    },
    {
      id: 'cargo',
      icon: '🚃',
      title: 'Toa hàng',
      desc: 'đối thủ bị kéo nặng',
      badgeText: '🚃 Toa hàng đối thủ bị kéo nặng'
    }
  ];

  class DuongDuaAudio {
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

    playCountdown(isGo = false) {
      if (isGo) {
        this.playTone(587.33, 'triangle', 0.14, 0.22);
        setTimeout(() => this.playTone(880, 'triangle', 0.28, 0.25), 110);
      } else {
        this.playTone(440, 'triangle', 0.16, 0.2);
      }
    }

    playWhistle() {
      this.playTone(660, 'triangle', 0.22, 0.2);
      this.playTone(880, 'sine', 0.25, 0.18);
      setTimeout(() => {
        this.playTone(660, 'triangle', 0.35, 0.22);
        this.playTone(880, 'sine', 0.35, 0.2);
      }, 260);
    }

    playCorrect(isGift = false) {
      this.playTone(523.25, 'triangle', 0.11, 0.22);
      setTimeout(() => this.playTone(659.25, 'triangle', 0.11, 0.22), 85);
      setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.24), 170);
      if (isGift) {
        setTimeout(() => this.playTone(1046.5, 'triangle', 0.28, 0.26), 270);
      }
    }

    playWrong() {
      this.playTone(230, 'sawtooth', 0.18, 0.18, 155);
      setTimeout(() => this.playTone(170, 'sawtooth', 0.24, 0.2, 115), 130);
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
    return escapeHtml(text).replace(/\n/g, '<br>');
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

  // Exact SVG Generators matching the reference video's Red & Blue Steam Trains, Rocket Booster & Cargo Car
  function buildLocomotiveSvg(teamKey, wheelAngle = 0, isMoving = false) {
    const isRed = teamKey === 'A';
    const bodyMain = isRed ? '#dc2626' : '#2563eb';
    const bodyDark = isRed ? '#991b1b' : '#1e40af';
    const bodyLight = isRed ? '#ef4444' : '#3b82f6';

    return `
      <svg viewBox="0 0 168 106" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        ${
          isMoving
            ? `
          <g class="dd-steam-group">
            <circle class="dd-steam-puff p1" cx="118" cy="10" r="9" fill="rgba(255,255,255,0.75)" />
            <circle class="dd-steam-puff p2" cx="102" cy="-2" r="12" fill="rgba(255,255,255,0.58)" />
            <circle class="dd-steam-puff p3" cx="84" cy="-14" r="15" fill="rgba(255,255,255,0.38)" />
          </g>
        `
            : ''
        }
        <!-- Coupler Rear -->
        <rect x="0" y="74" width="10" height="6" rx="2" fill="#1e293b" />
        <!-- Cowcatcher Front (Right) -->
        <polygon points="150,74 167,87 148,87" fill="#facc15" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round" />
        <line x1="153" y1="77" x2="158" y2="87" stroke="#1e293b" stroke-width="2" />
        <!-- Underframe Chassis -->
        <rect x="6" y="72" width="146" height="11" rx="4" fill="${bodyDark}" stroke="#1e293b" stroke-width="2.5" />
        <!-- Cabin (Left) -->
        <rect x="12" y="28" width="64" height="46" rx="3" fill="${bodyMain}" stroke="#1e293b" stroke-width="2.5" />
        <rect x="12" y="54" width="64" height="20" fill="${bodyDark}" />
        <!-- Cabin Roof -->
        <rect x="7" y="20" width="74" height="9" rx="4" fill="#1e293b" />
        <rect x="9" y="26" width="70" height="3.5" rx="1.5" fill="#facc15" />
        <!-- Cabin Window -->
        <rect x="23" y="36" width="36" height="24" rx="4" fill="#bae6fd" stroke="#1e293b" stroke-width="2.2" />
        <polygon points="26,57 44,39 51,39 33,57" fill="rgba(255,255,255,0.65)" />
        <!-- Boiler (Right) -->
        <rect x="74" y="42" width="66" height="32" rx="12" fill="${bodyMain}" stroke="#1e293b" stroke-width="2.5" />
        <rect x="76" y="45" width="60" height="10" rx="5" fill="${bodyLight}" opacity="0.65" />
        <!-- Gold Boiler Bands -->
        <rect x="92" y="42" width="5" height="32" fill="#facc15" stroke="#1e293b" stroke-width="1.5" />
        <rect x="115" y="42" width="5" height="32" fill="#facc15" stroke="#1e293b" stroke-width="1.5" />
        <!-- Steam Dome -->
        <path d="M 82 42 L 82 32 A 8 8 0 0 1 98 32 L 98 42 Z" fill="#facc15" stroke="#1e293b" stroke-width="2.4" />
        <!-- Smokestack / Chimney -->
        <rect x="110" y="18" width="16" height="26" fill="#334155" stroke="#1e293b" stroke-width="2.5" />
        <polygon points="104,18 132,18 127,10 122,14 118,9 114,14 109,10" fill="#1e293b" />
        <rect x="104" y="17" width="28" height="4" rx="2" fill="#facc15" />
        <!-- Front Headlamp Drum -->
        <circle cx="138" cy="58" r="16" fill="#334155" stroke="#1e293b" stroke-width="2.5" />
        <circle cx="140" cy="58" r="11.5" fill="#ca8a04" stroke="#1e293b" stroke-width="2" />
        <circle cx="141" cy="58" r="7.5" fill="#fef08a" />
        <circle cx="143" cy="56" r="3.5" fill="#ffffff" />
        <!-- Wheels -->
        ${buildWheelSvg(34, 84, 13, wheelAngle)}
        ${buildWheelSvg(80, 82, 15, wheelAngle)}
        ${buildWheelSvg(116, 82, 15, wheelAngle)}
        ${buildWheelSvg(146, 85, 11, wheelAngle)}
        <!-- Connecting Rod -->
        <rect x="76" y="80" width="44" height="4.5" rx="2" fill="#fde047" stroke="#1e293b" stroke-width="1.6" />
      </svg>
    `;
  }

  function buildPassengerCarSvg(teamKey, wheelAngle = 0) {
    const isRed = teamKey === 'A';
    const bodyMain = isRed ? '#dc2626' : '#2563eb';
    const bodyDark = isRed ? '#991b1b' : '#1e40af';

    return `
      <svg viewBox="0 0 138 96" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Couplers -->
        <rect x="0" y="64" width="8" height="5" rx="2" fill="#1e293b" />
        <rect x="130" y="64" width="8" height="5" rx="2" fill="#1e293b" />
        <!-- Main Coach Body -->
        <rect x="6" y="18" width="126" height="55" rx="6" fill="${bodyMain}" stroke="#1e293b" stroke-width="2.5" />
        <!-- Lower Dark Trim & Gold Stripe -->
        <rect x="6" y="53" width="126" height="20" rx="4" fill="${bodyDark}" stroke="#1e293b" stroke-width="2" />
        <rect x="7" y="50" width="124" height="4.5" fill="#facc15" />
        <!-- Cream Rounded Roof -->
        <rect x="4" y="12" width="130" height="12" rx="6" fill="#fef3c7" stroke="#1e293b" stroke-width="2.4" />
        <!-- 5 Passenger Windows -->
        ${[14, 36, 58, 80, 102]
          .map(
            (wx) => `
          <rect x="${wx}" y="27" width="18" height="19" rx="3" fill="#bae6fd" stroke="#1e293b" stroke-width="2" />
          <polygon points="${wx + 2},44 ${wx + 11},29 ${wx + 15},29 ${wx + 6},44" fill="rgba(255,255,255,0.65)" />
        `
          )
          .join('')}
        <!-- Wheels -->
        ${buildWheelSvg(32, 74, 13, wheelAngle)}
        ${buildWheelSvg(106, 74, 13, wheelAngle)}
      </svg>
    `;
  }

  function buildCargoCarSvg(wheelAngle = 0) {
    return `
      <svg viewBox="0 0 116 86" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Coupler -->
        <rect x="106" y="54" width="10" height="5" rx="2" fill="#1e293b" />
        <!-- Wooden Cargo Box -->
        <rect x="8" y="16" width="100" height="47" rx="5" fill="#b45309" stroke="#1e293b" stroke-width="2.5" />
        <!-- Horizontal Wood Planks -->
        <line x1="9" y1="31" x2="107" y2="31" stroke="#92400e" stroke-width="2" />
        <line x1="9" y1="46" x2="107" y2="46" stroke="#92400e" stroke-width="2" />
        <!-- Vertical Iron Straps & Rivets -->
        <rect x="35" y="16" width="8" height="47" fill="#573616" stroke="#1e293b" stroke-width="1.8" />
        <rect x="73" y="16" width="8" height="47" fill="#573616" stroke="#1e293b" stroke-width="1.8" />
        <circle cx="39" cy="24" r="2" fill="#d6d3d1" />
        <circle cx="39" cy="54" r="2" fill="#d6d3d1" />
        <circle cx="77" cy="24" r="2" fill="#d6d3d1" />
        <circle cx="77" cy="54" r="2" fill="#d6d3d1" />
        <!-- Wheels -->
        ${buildWheelSvg(28, 65, 12.5, wheelAngle)}
        ${buildWheelSvg(88, 65, 12.5, wheelAngle)}
      </svg>
    `;
  }

  function buildRocketBoosterSvg() {
    return `
      <svg viewBox="0 0 145 70" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <!-- Animated Jet Flame (Left) -->
        <g class="dd-rocket-flame">
          <path d="M 65 24 Q 25 12 0 36 Q 25 58 65 48 Z" fill="#ef4444" opacity="0.92" />
          <path d="M 65 28 Q 32 19 12 36 Q 32 52 65 44 Z" fill="#f97316" />
          <path d="M 65 31 Q 42 25 25 36 Q 42 47 65 41 Z" fill="#facc15" />
          <path d="M 65 33 Q 50 30 38 36 Q 50 42 65 39 Z" fill="#fef9c3" />
        </g>
        <!-- Exhaust Nozzle -->
        <polygon points="62,22 74,27 74,45 62,50" fill="#334155" stroke="#1e293b" stroke-width="2.2" />
        <!-- Top Mount Bracket -->
        <rect x="102" y="12" width="38" height="8" rx="3" fill="#1e293b" />
        <!-- Rocket Cylinder Body -->
        <rect x="72" y="20" width="66" height="32" rx="12" fill="#f8fafc" stroke="#1e293b" stroke-width="2.4" />
        <!-- Red & Gold Stripes -->
        <rect x="86" y="21" width="9" height="30" fill="#ef4444" />
        <rect x="103" y="21" width="9" height="30" fill="#ef4444" />
        <rect x="119" y="21" width="5" height="30" fill="#facc15" />
        <!-- Front Aperture -->
        <ellipse cx="132" cy="36" rx="6" ry="12" fill="#475569" stroke="#1e293b" stroke-width="2" />
      </svg>
    `;
  }

  function buildWheelSvg(cx, cy, r, angleDeg = 0) {
    return `
      <g transform="rotate(${angleDeg.toFixed(1)} ${cx} ${cy})">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5" />
        <circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="#94a3b8" stroke="#475569" stroke-width="1.2" />
        <line x1="${cx - r * 0.65}" y1="${cy}" x2="${cx + r * 0.65}" y2="${cy}" stroke="#e2e8f0" stroke-width="1.8" />
        <line x1="${cx}" y1="${cy - r * 0.65}" x2="${cx}" y2="${cy + r * 0.65}" stroke="#e2e8f0" stroke-width="1.8" />
        <circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="#facc15" stroke="#1e293b" stroke-width="1.2" />
      </g>
    `;
  }

  // Exact Track Curve Function matching `arena_bg.webp` (1918 x 604)
  // Flat on xPercent = 0..44.3%, smooth S-curve uphill on xPercent = 44.3..86.0% (rising 11.6% of stage height), flat at hilltop 86..100%.
  function getTrackPose(trackKey, xPercent) {
    const baseBottomPct = trackKey === 'A' ? 25.0 : 18.0; // Distance from bottom of stage to rail top
    const hillRisePct = 11.6;
    const xStart = 44.3;
    const xEnd = 86.0;

    let rise = 0;
    let angleDeg = 0;
    if (xPercent <= xStart) {
      rise = 0;
      angleDeg = 0;
    } else if (xPercent >= xEnd) {
      rise = hillRisePct;
      angleDeg = 0;
    } else {
      const t = (xPercent - xStart) / (xEnd - xStart);
      rise = hillRisePct * 0.5 * (1 - Math.cos(Math.PI * t));
      // Derivative gives slope -> negative CSS rotation (tilted uphill to the right)
      const slope = Math.sin(Math.PI * t);
      angleDeg = -6.8 * slope;
    }

    return {
      bottomPct: baseBottomPct + rise,
      angleDeg
    };
  }

  function injectStyles() {
    if (document.getElementById('ey-duong-dua-styles')) return;
    const style = document.createElement('style');
    style.id = 'ey-duong-dua-styles';
    style.textContent = `
      .dd-root {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: #133c44;
        font-family: 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif;
        user-select: none;
      }

      /* Top Status Bar */
      .dd-topbar {
        height: 62px;
        min-height: 62px;
        background: #1a4d55;
        border-bottom: 2px solid #10353b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        gap: 10px;
        z-index: 40;
      }
      .dd-team-bars {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        flex: 1;
      }
      .dd-team-status {
        height: 46px;
        border-radius: 12px;
        background: #174249;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1.5px solid #52759c;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .dd-team-status.team-a {
        border-color: #b45a4b;
      }
      .dd-team-status.team-b {
        border-color: #5b82b0;
      }
      .dd-ts-left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1px;
      }
      .dd-ts-name {
        font-size: 15px;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.1;
      }
      .dd-ts-buffs {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        min-height: 15px;
      }
      .dd-ts-right {
        text-align: right;
        line-height: 1.05;
      }
      .dd-ts-speed {
        font-size: 17px;
        font-weight: 900;
        color: #fbbf24;
        font-variant-numeric: tabular-nums;
      }
      .dd-ts-unit {
        font-size: 10.5px;
        font-weight: 700;
        color: #cbd5e1;
      }

      .dd-top-utils {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dd-util-btn {
        height: 40px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1.5px solid #457b84;
        background: #215861;
        color: #f1f5f9;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.16s ease;
      }
      .dd-util-btn.icon-only {
        width: 40px;
        padding: 0;
        font-size: 16px;
      }
      .dd-util-btn:hover {
        background: #2b6c76;
      }
      .dd-util-btn.btn-end {
        background: #7f2933;
        border-color: #c85a66;
        color: #ffffff;
      }
      .dd-util-btn.btn-end:hover {
        background: #96303c;
      }

      /* Middle Mountain Railway Stage */
      .dd-stage {
        position: relative;
        flex: 1;
        width: 100%;
        background: url('/ey/games/duong-dua/arena_bg.webp') center center / 100% 100% no-repeat;
        overflow: hidden;
      }

      /* Floating Question Card (Normal & Gift Question CÂU QUÀ) */
      .dd-q-wrap {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(92%, 920px);
        z-index: 32;
      }
      .dd-q-card {
        min-height: 88px;
        border-radius: 14px;
        background: rgba(24, 83, 94, 0.94);
        border: 2px solid #cbb26a;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
        color: #ffffff;
      }
      .dd-q-card.is-gift {
        background: linear-gradient(90deg, rgba(124, 52, 21, 0.95) 0%, rgba(154, 62, 24, 0.95) 50%, rgba(124, 52, 21, 0.95) 100%);
        border-color: #f59e0b;
      }
      .dd-q-left {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;
        min-width: 0;
      }
      .dd-q-badge {
        padding: 5px 12px;
        border-radius: 7px;
        background: #eab308;
        color: #1e293b;
        font-size: 13px;
        font-weight: 900;
        white-space: nowrap;
      }
      .dd-q-card.is-gift .dd-q-badge {
        background: #f59e0b;
        color: #451a03;
      }
      .dd-q-text {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.38;
        word-break: break-word;
        flex: 1;
      }
      .dd-q-thumb {
        max-height: 70px;
        max-width: 110px;
        border-radius: 8px;
        border: 1.5px solid rgba(255,255,255,0.45);
        background: #ffffff;
        padding: 2px;
        cursor: zoom-in;
        flex-shrink: 0;
      }
      .dd-q-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .dd-font-group {
        display: flex;
        gap: 4px;
      }
      .dd-font-btn {
        height: 28px;
        padding: 0 7px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(15, 23, 42, 0.35);
        color: #f8fafc;
        font-size: 11.5px;
        font-weight: 800;
        cursor: pointer;
      }
      .dd-q-timer {
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        font-weight: 900;
        color: #ffffff;
      }
      .dd-q-timer svg {
        position: absolute;
        inset: 0;
        transform: rotate(-90deg);
      }

      /* Articulated Train Cars on Stage */
      .dd-trains-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 20;
      }
      .dd-car-node {
        position: absolute;
        transform-origin: center bottom;
        will-change: left, bottom, transform;
      }
      .dd-car-loco {
        width: 138px;
        height: 87px;
      }
      .dd-car-wagon {
        width: 114px;
        height: 79px;
      }
      .dd-car-cargo {
        width: 96px;
        height: 71px;
      }
      .dd-car-rocket {
        width: 118px;
        height: 58px;
      }

      .dd-steam-puff {
        animation: ddSteamRise 1.1s ease-out infinite;
      }
      .dd-steam-puff.p2 { animation-delay: 0.35s; }
      .dd-steam-puff.p3 { animation-delay: 0.7s; }
      @keyframes ddSteamRise {
        0% { transform: translate(0, 4px) scale(0.7); opacity: 0.85; }
        100% { transform: translate(-18px, -16px) scale(1.35); opacity: 0; }
      }
      .dd-rocket-flame {
        transform-origin: 65px 36px;
        animation: ddFlameFlicker 0.14s ease-in-out infinite alternate;
      }
      @keyframes ddFlameFlicker {
        0% { transform: scaleX(0.92) scaleY(0.95); }
        100% { transform: scaleX(1.12) scaleY(1.06); }
      }

      /* Center-Bottom Speed & Power-up Toast Pill */
      .dd-toast-wrap {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 35;
        pointer-events: none;
      }
      .dd-toast-box {
        background: #0f2e35;
        border: 2px solid #2dd4bf;
        border-radius: 999px;
        padding: 6px 10px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38);
        animation: ddPopToast 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes ddPopToast {
        0% { transform: translateY(12px) scale(0.85); opacity: 0; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      .dd-toast-speed {
        padding: 5px 14px;
        border-radius: 999px;
        background: #86efac;
        color: #064e3b;
        font-size: 14.5px;
        font-weight: 900;
      }
      .dd-toast-gift {
        padding: 5px 14px;
        border-radius: 999px;
        background: #fcd34d;
        color: #451a03;
        font-size: 14.5px;
        font-weight: 900;
      }

      /* Bottom Split-Screen Answer Dock */
      .dd-dock {
        height: 178px;
        min-height: 178px;
        background: #184951;
        border-top: 2px solid #2b6973;
        padding: 12px 24px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        z-index: 38;
        box-sizing: border-box;
      }
      .dd-team-panel {
        position: relative;
        border-radius: 16px;
        padding: 10px 12px;
        background: rgba(15, 48, 54, 0.55);
        border: 1.5px solid #4a7ab8;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px;
      }
      .dd-team-panel.panel-a {
        border-color: #b45a4b;
      }
      .dd-team-panel.panel-b {
        border-color: #4a7ab8;
      }
      .dd-team-panel.is-locked {
        border-style: dashed;
      }

      .dd-ans-btn {
        border-radius: 11px;
        border: 2px solid #cbbd9f;
        border-bottom-width: 4px;
        background: #e6dec8;
        color: #1e293b;
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15.5px;
        font-weight: 800;
        cursor: pointer;
        text-align: left;
        transition: all 0.14s ease;
      }
      .dd-ans-btn:hover:not(:disabled) {
        background: #f2ebd9;
        transform: translateY(-1px);
      }
      .dd-ans-btn:disabled {
        cursor: default;
      }
      .dd-ans-btn.is-muted {
        background: #9eb0b5;
        border-color: #7c9096;
        color: #334155;
        opacity: 0.82;
      }
      .dd-ans-btn.is-crossed .dd-ans-text {
        text-decoration: line-through;
        opacity: 0.65;
      }
      .dd-ans-btn.is-wrong-pick {
        background: #f5b5b5 !important;
        border-color: #ef4444 !important;
        color: #7f1d1d !important;
      }
      .dd-ans-btn.is-correct-pick {
        background: linear-gradient(90deg, #86efac 0%, #bbf7d0 100%) !important;
        border-color: #22c55e !important;
        color: #064e3b !important;
      }

      .dd-key-cap {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #174950;
        color: #ffffff;
        font-size: 13px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dd-ans-btn.is-muted .dd-key-cap,
      .dd-ans-btn.is-wrong-pick .dd-key-cap {
        background: #647c82;
      }
      .dd-opt-letter {
        font-weight: 900;
        margin-right: 4px;
      }
      .panel-a .dd-opt-letter { color: #dc2626; }
      .panel-b .dd-opt-letter { color: #2563eb; }
      .dd-ans-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Tilted "⏳ Chờ đội bạn trả lời" Overlay Badge */
      .dd-wait-badge {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-4deg);
        background: #103239;
        border: 2px solid #eab308;
        border-radius: 999px;
        padding: 8px 20px;
        color: #fef08a;
        font-size: 14px;
        font-weight: 900;
        white-space: nowrap;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
        z-index: 10;
        pointer-events: none;
      }

      /* Setup & Victory Modals (Warm Cream Theme matching f_008s.jpg & f_094s.jpg) */
      .dd-modal-backdrop {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 45%, rgba(22, 78, 86, 0.78) 0%, rgba(11, 41, 46, 0.92) 100%);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 80;
        padding: 20px;
      }
      .dd-cream-card {
        width: 100%;
        max-width: 560px;
        background: #f5ebd4;
        border: 2.5px solid #d4b982;
        border-radius: 22px;
        padding: 28px 30px 26px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        color: #133c44;
        text-align: center;
      }
      .dd-cream-title {
        font-size: 28px;
        font-weight: 900;
        color: #133c44;
        margin: 0 0 18px;
      }
      .dd-team-input-row {
        height: 52px;
        border-radius: 14px;
        background: #dfd7c6;
        border: 2px solid #991b1b;
        border-bottom-width: 4px;
        padding: 0 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .dd-team-input-row.row-b {
        border-color: #1e3a8a;
      }
      .dd-color-sq {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        background: #e11d48;
        border: 2px solid rgba(255,255,255,0.65);
        flex-shrink: 0;
      }
      .dd-color-sq.sq-b {
        background: #3b82f6;
      }
      .dd-team-inp {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 16px;
        font-weight: 800;
        color: #133c44;
        outline: none;
      }
      .dd-mode-label {
        font-size: 13.5px;
        font-weight: 800;
        color: #334155;
        margin: 14px 0 10px;
      }
      .dd-mode-pills {
        display: inline-flex;
        gap: 10px;
        margin-bottom: 10px;
      }
      .dd-mode-pill {
        height: 40px;
        padding: 0 18px;
        border-radius: 12px;
        border: 2px solid #cbd5e1;
        background: #ffffff;
        color: #475569;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }
      .dd-mode-pill.is-active {
        border-color: #0d9488;
        background: #f0fdfa;
        color: #0f766e;
      }
      .dd-mode-hint {
        font-size: 12.5px;
        color: #64748b;
        line-height: 1.45;
        margin: 0 auto 18px;
        max-width: 440px;
      }
      .dd-gold-btn {
        min-width: 190px;
        height: 48px;
        padding: 0 28px;
        border-radius: 13px;
        border: 1.5px solid #b47b12;
        border-bottom: 4px solid #9a680c;
        background: linear-gradient(180deg, #f3bd48 0%, #dda027 100%);
        color: #133c44;
        font-size: 16px;
        font-weight: 900;
        cursor: pointer;
        transition: transform 0.14s ease, filter 0.14s ease;
      }
      .dd-gold-btn:hover {
        filter: brightness(1.05);
        transform: translateY(-1px);
      }
      .dd-cream-btn {
        min-width: 140px;
        height: 46px;
        padding: 0 22px;
        border-radius: 13px;
        border: 1.5px solid #cbb26a;
        border-bottom: 4px solid #a38c4c;
        background: #fcf6e8;
        color: #133c44;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
      }

      /* Countdown Number */
      .dd-cd-number {
        font-size: 165px;
        font-weight: 900;
        color: #f5b915;
        line-height: 1;
        text-shadow:
          0 8px 0 #451a03,
          -3px -3px 0 #451a03,
           3px -3px 0 #451a03,
          -3px  3px 0 #451a03,
           3px  3px 0 #451a03,
           0 16px 32px rgba(0,0,0,0.45);
        animation: ddPopToast 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Victory Standings Rows */
      .dd-v-row {
        height: 58px;
        border-radius: 14px;
        background: #ebe3cf;
        border: 2px solid #94a3b8;
        border-bottom-width: 4px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .dd-v-row.is-winner {
        border-color: #e11d48;
        background: #efe6d5;
      }
      .dd-v-name {
        font-size: 20px;
        font-weight: 900;
      }
      .dd-v-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .dd-v-tag {
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 900;
        background: #cbd5e1;
        color: #475569;
      }
      .dd-v-tag.win {
        background: #e11d48;
        color: #ffffff;
      }
      .dd-v-km {
        text-align: right;
        line-height: 1.1;
      }
      .dd-v-km-val {
        font-size: 20px;
        font-weight: 900;
        color: #133c44;
      }
      .dd-v-km-lbl {
        font-size: 9.5px;
        font-weight: 800;
        color: #64748b;
      }
    `;
    document.head.appendChild(style);
  }

  window.launchDuongDuaGame = function launchDuongDuaGame(container, options = {}) {
    if (!container) return;
    injectStyles();

    const rawQuestions = Array.isArray(options.questions) && options.questions.length > 0
      ? options.questions
      : [
          { text: 'Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?', options: ['48 chiếc', '56 chiếc', '54 chiếc', '63 chiếc'], correctIndex: 1 },
          { text: 'Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?', options: ['28 ngày', '30 ngày', '31 ngày', '34 ngày'], correctIndex: 2 },
          { text: '45 - 17 = ?', options: ['32', '22', '28', '38'], correctIndex: 2 },
          { text: 'Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?', options: ['39', '29', '45', '49'], correctIndex: 0 },
          { text: 'Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?', options: ['22 quyển', '26 quyển', '24 quyển', '28 quyển'], correctIndex: 2 },
          { text: 'Tính giá trị của biểu thức 3 × 12 - 20.', options: ['16', '26', '36', '24'], correctIndex: 0 },
          { text: 'Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?', options: ['180', '144', '300', '324'], correctIndex: 3 },
          { text: 'Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?', options: ['60 cái', '180 cái', '240 cái', '120 cái'], correctIndex: 2 },
          { text: '56 : 8 = ?', options: ['6', '9', '8', '7'], correctIndex: 3 }
        ];

    const audio = new DuongDuaAudio();

    const state = {
      phase: 'setup', // 'setup' | 'countdown' | 'playing' | 'ended'
      inputMode: 'keyboard', // 'touch' | 'keyboard'
      qIndex: 0,
      qTimeRemaining: QUESTION_TIME_LIMIT,
      questionFontSize: 22,
      paused: false,
      roundResolved: false,
      crossedOptions: new Set(),
      teams: {
        A: {
          key: 'A',
          name: options.teamAName || 'Đội A',
          color: '#dc2626',
          baseSpeed: 0,
          rocketTurns: 0,
          coalCount: 0,
          cargoTurns: 0,
          progressPct: 22, // Front locomotive X% along stage (starts at XUẤT PHÁT line = 22%)
          distanceKm: 0,
          wheelAngle: 0,
          lockedThisQ: false,
          pickedOpt: null,
          pickStatus: null
        },
        B: {
          key: 'B',
          name: options.teamBName || 'Đội B',
          color: '#2563eb',
          baseSpeed: 0,
          rocketTurns: 0,
          coalCount: 0,
          cargoTurns: 0,
          progressPct: 22,
          distanceKm: 0,
          wheelAngle: 0,
          lockedThisQ: false,
          pickedOpt: null,
          pickStatus: null
        }
      },
      animFrameId: null,
      lastTickMs: 0,
      destroyed: false
    };

    function getEffectiveSpeed(team) {
      const raw =
        team.baseSpeed +
        team.coalCount * COAL_PERM_SPEED +
        (team.rocketTurns > 0 ? ROCKET_BONUS_SPEED : 0) -
        (team.cargoTurns > 0 ? CARGO_PENALTY_SPEED : 0);
      return Math.max(0, Math.round(raw * 100) / 100);
    }

    function isGiftQuestion(qIdx) {
      // Every 3rd question starting from index 3 (or 2) is a CÂU QUÀ, matching video
      return (qIdx + 1) % 3 === 0;
    }

    function getDisplayOptions(q) {
      if (Array.isArray(q.options) && q.options.length >= 2) {
        return {
          options: q.options.slice(0, 4).map((o) => (typeof o === 'object' ? o.text || '' : String(o))),
          correctIndex: Number(q.correctIndex ?? q.correct ?? 0)
        };
      }
      if (Array.isArray(q.statements) && q.statements.length > 0) {
        const stmt = q.statements[0];
        const ansTrue = Boolean(stmt.isTrue ?? stmt.correct);
        return {
          options: ['Đúng', 'Sai', 'Cả A và B đúng', 'Không xác định'],
          correctIndex: ansTrue ? 0 : 1
        };
      }
      const sa = String(q.shortAnswer ?? q.answer ?? '10').trim();
      const num = parseFloat(sa);
      if (!isNaN(num)) {
        return {
          options: [String(num), String(num + 2), String(Math.max(0, num - 1)), String(num + 5)],
          correctIndex: 0
        };
      }
      return {
        options: [sa || 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correctIndex: 0
      };
    }

    // Build Root Layout
    container.innerHTML = `
      <div class="dd-root" id="dd-root">
        <div class="dd-topbar">
          <div class="dd-team-bars">
            <div class="dd-team-status team-a">
              <div class="dd-ts-left">
                <div class="dd-ts-name" id="dd-name-a">A</div>
                <div class="dd-ts-buffs" id="dd-buffs-a"></div>
              </div>
              <div class="dd-ts-right">
                <div class="dd-ts-speed" id="dd-speed-a">0.00</div>
                <div class="dd-ts-unit">vận tốc</div>
              </div>
            </div>
            <div class="dd-team-status team-b">
              <div class="dd-ts-left">
                <div class="dd-ts-name" id="dd-name-b">B</div>
                <div class="dd-ts-buffs" id="dd-buffs-b"></div>
              </div>
              <div class="dd-ts-right">
                <div class="dd-ts-speed" id="dd-speed-b">0.00</div>
                <div class="dd-ts-unit">vận tốc</div>
              </div>
            </div>
          </div>
          <div class="dd-top-utils">
            <button type="button" class="dd-util-btn icon-only" id="dd-btn-fs" title="Toàn màn hình">⛶</button>
            <button type="button" class="dd-util-btn icon-only" id="dd-btn-sound" title="Âm thanh">🔊</button>
            <button type="button" class="dd-util-btn" id="dd-btn-pause">Tạm dừng</button>
            <button type="button" class="dd-util-btn btn-end" id="dd-btn-end">Kết thúc</button>
          </div>
        </div>

        <div class="dd-stage" id="dd-stage">
          <div id="dd-q-mount"></div>
          <div class="dd-trains-layer" id="dd-trains-layer"></div>
          <div class="dd-toast-wrap" id="dd-toast-mount"></div>
          <div id="dd-modal-mount"></div>
        </div>

        <div class="dd-dock" id="dd-dock">
          <div class="dd-team-panel panel-a" id="dd-panel-a"></div>
          <div class="dd-team-panel panel-b" id="dd-panel-b"></div>
        </div>
      </div>
    `;

    const rootEl = container.querySelector('#dd-root');
    const qMount = container.querySelector('#dd-q-mount');
    const trainsLayer = container.querySelector('#dd-trains-layer');
    const toastMount = container.querySelector('#dd-toast-mount');
    const modalMount = container.querySelector('#dd-modal-mount');
    const panelA = container.querySelector('#dd-panel-a');
    const panelB = container.querySelector('#dd-panel-b');

    // Topbar buttons
    container.querySelector('#dd-btn-fs')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        (rootEl.requestFullscreen || rootEl.webkitRequestFullscreen)?.call(rootEl);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      }
    });

    const soundBtn = container.querySelector('#dd-btn-sound');
    soundBtn?.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      soundBtn.textContent = audio.enabled ? '🔊' : '🔇';
    });

    const pauseBtn = container.querySelector('#dd-btn-pause');
    pauseBtn?.addEventListener('click', () => {
      if (state.phase !== 'playing') return;
      state.paused = !state.paused;
      pauseBtn.textContent = state.paused ? 'Tiếp tục' : 'Tạm dừng';
      state.lastTickMs = performance.now();
    });

    container.querySelector('#dd-btn-end')?.addEventListener('click', () => {
      if (state.phase === 'setup') {
        if (typeof options.onExit === 'function') options.onExit();
        return;
      }
      finishGame();
    });

    // Keyboard handler for Q W E R (Team A) and U I O P (Team B)
    function onKeyDown(e) {
      if (state.destroyed || state.phase !== 'playing' || state.paused || state.roundResolved) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const key = String(e.key || '').toUpperCase();
      const mapA = { Q: 0, W: 1, E: 2, R: 3 };
      const mapB = { U: 0, I: 1, O: 2, P: 3 };
      if (key in mapA) {
        e.preventDefault();
        handleTeamAnswer('A', mapA[key]);
      } else if (key in mapB) {
        e.preventDefault();
        handleTeamAnswer('B', mapB[key]);
      }
    }
    window.addEventListener('keydown', onKeyDown);

    function updateTopBarDOM() {
      ['A', 'B'].forEach((k) => {
        const t = state.teams[k];
        const lower = k.toLowerCase();
        const nameEl = container.querySelector(`#dd-name-${lower}`);
        const buffsEl = container.querySelector(`#dd-buffs-${lower}`);
        const speedEl = container.querySelector(`#dd-speed-${lower}`);
        if (nameEl) nameEl.textContent = t.name;
        if (speedEl) speedEl.textContent = getEffectiveSpeed(t).toFixed(2);
        if (buffsEl) {
          const icons = [];
          if (t.rocketTurns > 0) icons.push('<span title="Tên lửa tăng tốc">🚀</span>');
          if (t.coalCount > 0) icons.push(`<span title="Xúc than vĩnh viễn">🔥${t.coalCount > 1 ? '×' + t.coalCount : ''}</span>`);
          if (t.cargoTurns > 0) icons.push('<span title="Toa hàng kéo nặng">🚃</span>');
          buffsEl.innerHTML = icons.join(' ');
        }
      });
    }

    function renderTrainsDOM() {
      if (!trainsLayer) return;
      // Render Team A (Upper Track, behind Team B) first, then Team B (Lower Track, in front)
      const htmlParts = [];
      ['A', 'B'].forEach((k) => {
        const t = state.teams[k];
        const isMoving = getEffectiveSpeed(t) > 0 && state.phase === 'playing' && !state.paused;
        const locoX = t.progressPct;
        const car1X = locoX - 6.8;
        const car2X = locoX - 13.3;
        const attachX = locoX - 19.3;

        // Attachment (Rocket Booster or Cargo Car)
        if (t.rocketTurns > 0) {
          const poseR = getTrackPose(k, attachX);
          htmlParts.push(`
            <div class="dd-car-node dd-car-rocket"
                 style="left: ${attachX.toFixed(2)}%; bottom: ${(poseR.bottomPct + 1.2).toFixed(2)}%; transform: translate(-50%, 0) rotate(${poseR.angleDeg.toFixed(2)}deg);">
              ${buildRocketBoosterSvg()}
            </div>
          `);
        } else if (t.cargoTurns > 0) {
          const poseC = getTrackPose(k, attachX);
          htmlParts.push(`
            <div class="dd-car-node dd-car-cargo"
                 style="left: ${attachX.toFixed(2)}%; bottom: ${poseC.bottomPct.toFixed(2)}%; transform: translate(-50%, 0) rotate(${poseC.angleDeg.toFixed(2)}deg);">
              ${buildCargoCarSvg(t.wheelAngle)}
            </div>
          `);
        }

        // Rear Passenger Car (Car 2)
        const pose2 = getTrackPose(k, car2X);
        htmlParts.push(`
          <div class="dd-car-node dd-car-wagon"
               style="left: ${car2X.toFixed(2)}%; bottom: ${pose2.bottomPct.toFixed(2)}%; transform: translate(-50%, 0) rotate(${pose2.angleDeg.toFixed(2)}deg);">
            ${buildPassengerCarSvg(k, t.wheelAngle)}
          </div>
        `);

        // Middle Passenger Car (Car 1)
        const pose1 = getTrackPose(k, car1X);
        htmlParts.push(`
          <div class="dd-car-node dd-car-wagon"
               style="left: ${car1X.toFixed(2)}%; bottom: ${pose1.bottomPct.toFixed(2)}%; transform: translate(-50%, 0) rotate(${pose1.angleDeg.toFixed(2)}deg);">
            ${buildPassengerCarSvg(k, t.wheelAngle)}
          </div>
        `);

        // Front Locomotive
        const poseL = getTrackPose(k, locoX);
        htmlParts.push(`
          <div class="dd-car-node dd-car-loco"
               style="left: ${locoX.toFixed(2)}%; bottom: ${poseL.bottomPct.toFixed(2)}%; transform: translate(-50%, 0) rotate(${poseL.angleDeg.toFixed(2)}deg);">
            ${buildLocomotiveSvg(k, t.wheelAngle, isMoving)}
          </div>
        `);
      });

      trainsLayer.innerHTML = htmlParts.join('');
    }

    function renderQuestionAndDock() {
      if (state.phase !== 'playing') {
        qMount.innerHTML = '';
      } else {
        const q = rawQuestions[state.qIndex % rawQuestions.length] || rawQuestions[0];
        const gift = isGiftQuestion(state.qIndex);
        const circumference = 2 * Math.PI * 19;
        const imgUrl = q.image || q.imageUrl || '';

        qMount.innerHTML = `
          <div class="dd-q-wrap">
            <div class="dd-q-card ${gift ? 'is-gift' : ''}" id="dd-q-card">
              <div class="dd-q-left">
                <span class="dd-q-badge">${gift ? 'CÂU QUÀ' : `CÂU ${state.qIndex + 1}`}</span>
                <div class="dd-q-text" id="dd-q-text" style="font-size: ${state.questionFontSize}px;">
                  ${formatRichContent(q.question || q.text || '')}
                </div>
                ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" class="dd-q-thumb" id="dd-q-img" alt="Minh họa" />` : ''}
              </div>
              <div class="dd-q-right">
                <div class="dd-font-group">
                  <button type="button" class="dd-font-btn" id="dd-font-dec">A-</button>
                  <button type="button" class="dd-font-btn" id="dd-font-inc">A+</button>
                </div>
                <div class="dd-q-timer">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="4" />
                    <circle id="dd-q-timer-circle" cx="24" cy="24" r="19" fill="none" stroke="#22c55e" stroke-width="4"
                            stroke-linecap="round"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="0" />
                  </svg>
                  <span id="dd-q-timer-text">${Math.ceil(state.qTimeRemaining)}</span>
                </div>
              </div>
            </div>
          </div>
        `;

        renderMathInContainer(qMount.querySelector('#dd-q-card'));

        qMount.querySelector('#dd-font-dec')?.addEventListener('click', () => {
          state.questionFontSize = Math.max(16, state.questionFontSize - 2);
          const el = qMount.querySelector('#dd-q-text');
          if (el) el.style.fontSize = `${state.questionFontSize}px`;
        });
        qMount.querySelector('#dd-font-inc')?.addEventListener('click', () => {
          state.questionFontSize = Math.min(30, state.questionFontSize + 2);
          const el = qMount.querySelector('#dd-q-text');
          if (el) el.style.fontSize = `${state.questionFontSize}px`;
        });

        const qImg = qMount.querySelector('#dd-q-img');
        if (qImg) {
          qImg.addEventListener('click', () => {
            if (window.ZoomPanOverlay && typeof window.ZoomPanOverlay.open === 'function') {
              window.ZoomPanOverlay.open(qImg.src);
            } else {
              window.open(qImg.src, '_blank');
            }
          });
        }
      }

      // Render Dual Team Panels in Bottom Dock
      const q = rawQuestions[state.qIndex % rawQuestions.length] || rawQuestions[0];
      const { options: opts } = getDisplayOptions(q);
      const keysByTeam = {
        A: ['Q', 'W', 'E', 'R'],
        B: ['U', 'I', 'O', 'P']
      };

      ['A', 'B'].forEach((k) => {
        const panelEl = k === 'A' ? panelA : panelB;
        const t = state.teams[k];
        if (!panelEl) return;
        panelEl.classList.toggle('is-locked', t.lockedThisQ || state.roundResolved);

        const buttonsHtml = [0, 1, 2, 3]
          .map((idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const keyCap = keysByTeam[k][idx];
            const rawOpt = String(opts[idx] ?? '').replace(/^[A-D][\.\:\)]\s*/i, '');
            const isCrossed = state.crossedOptions.has(idx);
            const isPicked = t.pickedOpt === idx;
            const isWrongPick = isPicked && t.pickStatus === 'wrong';
            const isCorrectPick = isPicked && t.pickStatus === 'correct';
            const isMuted =
              (t.lockedThisQ && !isPicked) ||
              (state.roundResolved && !isPicked) ||
              (isCrossed && !isWrongPick);
            const disabled = state.phase !== 'playing' || state.roundResolved || t.lockedThisQ || isCrossed;

            return `
              <button type="button"
                      class="dd-ans-btn ${isMuted ? 'is-muted' : ''} ${isCrossed ? 'is-crossed' : ''} ${isWrongPick ? 'is-wrong-pick' : ''} ${isCorrectPick ? 'is-correct-pick' : ''}"
                      data-team="${k}"
                      data-idx="${idx}"
                      ${disabled ? 'disabled' : ''}>
                <span class="dd-key-cap">${keyCap}</span>
                <span class="dd-ans-text"><span class="dd-opt-letter">${letter}</span> ${formatRichContent(rawOpt)}</span>
              </button>
            `;
          })
          .join('');

        const waitBadgeHtml =
          t.lockedThisQ && !state.roundResolved
            ? `<div class="dd-wait-badge">⏳ Chờ đội bạn trả lời</div>`
            : '';

        panelEl.innerHTML = buttonsHtml + waitBadgeHtml;
        renderMathInContainer(panelEl);

        panelEl.querySelectorAll('.dd-ans-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const optIdx = Number(btn.getAttribute('data-idx'));
            handleTeamAnswer(k, optIdx);
          });
        });
      });
    }

    function showToast(speedText, giftText = '') {
      if (!toastMount) return;
      toastMount.innerHTML = `
        <div class="dd-toast-box">
          <span class="dd-toast-speed">${escapeHtml(speedText)}</span>
          ${giftText ? `<span class="dd-toast-gift">${escapeHtml(giftText)}</span>` : ''}
        </div>
      `;
    }

    function clearToast() {
      if (toastMount) toastMount.innerHTML = '';
    }

    function decrementTemporaryBuffs() {
      ['A', 'B'].forEach((k) => {
        const t = state.teams[k];
        if (t.rocketTurns > 0) t.rocketTurns--;
        if (t.cargoTurns > 0) t.cargoTurns--;
      });
    }

    function handleTeamAnswer(teamKey, optIdx) {
      if (state.phase !== 'playing' || state.paused || state.roundResolved) return;
      const team = state.teams[teamKey];
      const otherKey = teamKey === 'A' ? 'B' : 'A';
      const otherTeam = state.teams[otherKey];
      if (!team || team.lockedThisQ || state.crossedOptions.has(optIdx)) return;

      const q = rawQuestions[state.qIndex % rawQuestions.length] || rawQuestions[0];
      const { correctIndex } = getDisplayOptions(q);

      if (optIdx === correctIndex) {
        // Correct Answer!
        state.roundResolved = true;
        team.pickedOpt = optIdx;
        team.pickStatus = 'correct';
        team.baseSpeed = Math.round((team.baseSpeed + BASE_SPEED_STEP) * 100) / 100;

        const gift = isGiftQuestion(state.qIndex);
        let giftToast = '';
        if (gift) {
          // Cycle through the 3 signature gifts (Rocket -> Coal -> Cargo)
          const giftObj = GIFT_TYPES[Math.floor(state.qIndex / 3) % GIFT_TYPES.length];
          giftToast = giftObj.badgeText;
          if (giftObj.id === 'rocket') {
            team.rocketTurns = 3; // Active for current transition + next 2 questions
          } else if (giftObj.id === 'coal') {
            team.coalCount += 1;
          } else if (giftObj.id === 'cargo') {
            otherTeam.cargoTurns = 3;
          }
        }

        audio.playCorrect(gift);
        updateTopBarDOM();
        renderQuestionAndDock();
        renderTrainsDOM();
        showToast(`${team.name} +${BASE_SPEED_STEP.toFixed(2)} tốc độ`, giftToast);

        setTimeout(() => {
          if (state.destroyed || state.phase !== 'playing') return;
          advanceToNextQuestion();
        }, 1600);
      } else {
        // Wrong Answer!
        audio.playWrong();
        team.pickedOpt = optIdx;
        team.pickStatus = 'wrong';
        team.lockedThisQ = true;
        state.crossedOptions.add(optIdx);
        renderQuestionAndDock();

        if (otherTeam.lockedThisQ) {
          // Both teams missed -> advance to next question
          state.roundResolved = true;
          setTimeout(() => {
            if (state.destroyed || state.phase !== 'playing') return;
            advanceToNextQuestion();
          }, 1200);
        }
      }
    }

    function advanceToNextQuestion() {
      clearToast();
      decrementTemporaryBuffs();
      if (state.qIndex + 1 >= rawQuestions.length) {
        finishGame();
        return;
      }
      state.qIndex++;
      startQuestionRound();
    }

    function startQuestionRound() {
      state.qTimeRemaining = QUESTION_TIME_LIMIT;
      state.roundResolved = false;
      state.crossedOptions = new Set();
      ['A', 'B'].forEach((k) => {
        state.teams[k].lockedThisQ = false;
        state.teams[k].pickedOpt = null;
        state.teams[k].pickStatus = null;
      });
      updateTopBarDOM();
      renderQuestionAndDock();
    }

    // Continuous Animation Loop for Train Movement, Wheel Rotation & Timer
    function startGameLoop() {
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      state.lastTickMs = performance.now();

      function frame(now) {
        if (state.destroyed) return;
        const dt = Math.min(0.1, Math.max(0, (now - state.lastTickMs) / 1000));
        state.lastTickMs = now;

        if (state.phase === 'playing' && !state.paused) {
          let someoneReachedEnd = false;
          ['A', 'B'].forEach((k) => {
            const t = state.teams[k];
            const effSpeed = getEffectiveSpeed(t);
            if (effSpeed > 0) {
              // Convert speed (0.12 .. 0.84) into smooth stage % per second and km distance
              t.progressPct = Math.min(93.5, t.progressPct + effSpeed * 2.15 * dt);
              t.distanceKm += effSpeed * 0.62 * dt;
              t.wheelAngle = (t.wheelAngle + effSpeed * 420 * dt) % 360;
              if (t.progressPct >= 93.5) {
                someoneReachedEnd = true;
              }
            }
          });

          renderTrainsDOM();

          if (someoneReachedEnd) {
            finishGame();
            return;
          }

          // Question countdown
          if (!state.roundResolved) {
            state.qTimeRemaining = Math.max(0, state.qTimeRemaining - dt);
            const qTimerText = container.querySelector('#dd-q-timer-text');
            const qTimerCircle = container.querySelector('#dd-q-timer-circle');
            if (qTimerText) qTimerText.textContent = Math.ceil(state.qTimeRemaining);
            if (qTimerCircle) {
              const circumference = 2 * Math.PI * 19;
              const ratio = Math.max(0, Math.min(1, state.qTimeRemaining / QUESTION_TIME_LIMIT));
              qTimerCircle.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
            }

            if (state.qTimeRemaining <= 0) {
              state.roundResolved = true;
              audio.playWrong();
              setTimeout(() => {
                if (state.destroyed || state.phase !== 'playing') return;
                advanceToNextQuestion();
              }, 900);
            }
          }
        }

        state.animFrameId = requestAnimationFrame(frame);
      }

      state.animFrameId = requestAnimationFrame(frame);
    }

    function showSetupModal() {
      state.phase = 'setup';
      state.qIndex = 0;
      ['A', 'B'].forEach((k) => {
        const t = state.teams[k];
        t.baseSpeed = 0;
        t.rocketTurns = 0;
        t.coalCount = 0;
        t.cargoTurns = 0;
        t.progressPct = 22;
        t.distanceKm = 0;
        t.wheelAngle = 0;
        t.lockedThisQ = false;
        t.pickedOpt = null;
        t.pickStatus = null;
      });
      updateTopBarDOM();
      renderTrainsDOM();
      renderQuestionAndDock();

      function renderModal() {
        modalMount.innerHTML = `
          <div class="dd-modal-backdrop">
            <div class="dd-cream-card">
              <h2 class="dd-cream-title">Thiết lập</h2>
              <div class="dd-team-input-row">
                <span class="dd-color-sq"></span>
                <input type="text" class="dd-team-inp" id="dd-inp-a" value="${escapeHtml(state.teams.A.name)}" maxlength="20" placeholder="Đội A" />
              </div>
              <div class="dd-team-input-row row-b">
                <span class="dd-color-sq sq-b"></span>
                <input type="text" class="dd-team-inp" id="dd-inp-b" value="${escapeHtml(state.teams.B.name)}" maxlength="20" placeholder="Đội B" />
              </div>

              <div class="dd-mode-label">Học sinh bấm bằng gì?</div>
              <div class="dd-mode-pills">
                <button type="button" class="dd-mode-pill ${state.inputMode === 'touch' ? 'is-active' : ''}" data-mode="touch">
                  📺 Tivi cảm ứng
                </button>
                <button type="button" class="dd-mode-pill ${state.inputMode === 'keyboard' ? 'is-active' : ''}" data-mode="keyboard">
                  ⌨️ Bàn phím
                </button>
              </div>
              <div class="dd-mode-hint">
                ${
                  state.inputMode === 'keyboard'
                    ? 'Đội trái bấm Q W E R, đội phải bấm U I O P – ký tự phím in sẵn trên từng đáp án.'
                    : 'Học sinh hai đội chạm trực tiếp vào các nút đáp án bên trái và bên phải màn hình.'
                }
              </div>

              <button type="button" class="dd-gold-btn" id="dd-btn-start">▶ Bắt đầu</button>
            </div>
          </div>
        `;

        modalMount.querySelectorAll('.dd-mode-pill').forEach((btn) => {
          btn.addEventListener('click', () => {
            state.teams.A.name = modalMount.querySelector('#dd-inp-a')?.value.trim() || 'Đội A';
            state.teams.B.name = modalMount.querySelector('#dd-inp-b')?.value.trim() || 'Đội B';
            state.inputMode = btn.getAttribute('data-mode') || 'keyboard';
            renderModal();
          });
        });

        modalMount.querySelector('#dd-btn-start')?.addEventListener('click', () => {
          state.teams.A.name = modalMount.querySelector('#dd-inp-a')?.value.trim() || 'A';
          state.teams.B.name = modalMount.querySelector('#dd-inp-b')?.value.trim() || 'B';
          updateTopBarDOM();
          audio.init();
          startCountdown();
        });
      }

      renderModal();
    }

    function startCountdown() {
      state.phase = 'countdown';
      let step = 3;

      function tick() {
        if (state.destroyed) return;
        if (step > 0) {
          audio.playCountdown(false);
          modalMount.innerHTML = `
            <div class="dd-modal-backdrop" style="background: rgba(12, 42, 48, 0.35);">
              <div class="dd-cd-number">${step}</div>
            </div>
          `;
          step--;
          setTimeout(tick, 850);
        } else {
          audio.playWhistle();
          modalMount.innerHTML = '';
          state.phase = 'playing';
          state.paused = false;
          startQuestionRound();
          startGameLoop();
        }
      }
      tick();
    }

    function finishGame() {
      state.phase = 'ended';
      clearToast();
      qMount.innerHTML = '';
      audio.playVictory();

      const kmA = Math.max(0, Math.round(state.teams.A.distanceKm));
      const kmB = Math.max(0, Math.round(state.teams.B.distanceKm));
      const sorted = [
        { ...state.teams.A, km: kmA },
        { ...state.teams.B, km: kmB }
      ].sort((a, b) => {
        if (b.km !== a.km) return b.km - a.km;
        return b.progressPct - a.progressPct;
      });
      const winner = sorted[0];

      modalMount.innerHTML = `
        <div class="dd-modal-backdrop">
          <div class="dd-cream-card" style="max-width: 520px;">
            <div style="font-size: 62px; line-height: 1; margin-bottom: 6px;">🏆</div>
            <div style="font-size: 32px; font-weight: 900; color: ${winner.color}; margin-bottom: 4px;">
              ${escapeHtml(winner.name)}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #334155; margin-bottom: 18px;">
              🎉 Đi xa nhất – Chiến thắng!
            </div>

            ${sorted
              .map((t, i) => {
                const isWin = i === 0;
                return `
                  <div class="dd-v-row ${isWin ? 'is-winner' : ''}">
                    <span class="dd-v-name" style="color: ${t.color};">${escapeHtml(t.name)}</span>
                    <div class="dd-v-right">
                      <span class="dd-v-tag ${isWin ? 'win' : ''}">${isWin ? 'THẮNG' : 'THUA'}</span>
                      <div class="dd-v-km">
                        <div class="dd-v-km-val">${t.km} km</div>
                        <div class="dd-v-km-lbl">QUÃNG ĐƯỜNG</div>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join('')}

            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 20px;">
              <button type="button" class="dd-gold-btn" style="min-width: 120px; height: 46px;" id="dd-btn-replay">Chơi lại</button>
              <button type="button" class="dd-cream-btn" id="dd-btn-lobby">Về danh sách</button>
            </div>
          </div>
        </div>
      `;

      modalMount.querySelector('#dd-btn-replay')?.addEventListener('click', () => {
        showSetupModal();
      });
      modalMount.querySelector('#dd-btn-lobby')?.addEventListener('click', () => {
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
        if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
        window.removeEventListener('keydown', onKeyDown);
      }
    };
  };
})();
