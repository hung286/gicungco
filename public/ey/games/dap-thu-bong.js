/**
 * Trò chơi Lễ Hội: Đập Bí Ngô Halloween (Trò Bí Ngô)
 * Tương thích 100% cơ chế & đồ họa gốc PomyAI
 */

(function () {
  // Web Audio Synthesizer for Pumpkin Game
  const PumpkinAudio = (function () {
    let ctx = null;
    let enabled = true;

    function getCtx() {
      if (!ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) ctx = new AudioContext();
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    return {
      setEnabled(val) { enabled = !!val; },
      isEnabled() { return enabled; },

      // Hammer swing whoosh
      whoosh() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const osc = c.createOscillator();
          const gain = c.createGain();
          const t = c.currentTime;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.18);
        } catch (e) {}
      },

      // Pumpkin smash / crunch
      smash() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const t = c.currentTime;
          // Noise burst
          const bufferSize = c.sampleRate * 0.2;
          const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = c.createBufferSource();
          noise.buffer = buffer;
          const filter = c.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, t);
          filter.frequency.exponentialRampToValueAtTime(100, t + 0.2);
          const gain = c.createGain();
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(c.destination);
          noise.start(t);
        } catch (e) {}
      },

      // Correct answer chime
      correct() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            const t = c.currentTime + idx * 0.08;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.35);
          });
        } catch (e) {}
      },

      // Wrong answer buzz
      wrong() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const t = c.currentTime;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.setValueAtTime(110, t + 0.15);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.35);
        } catch (e) {}
      },

      // Ghost spooky wobble
      ghost() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const t = c.currentTime;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, t);
          for (let i = 0; i < 6; i++) {
            osc.frequency.linearRampToValueAtTime(450, t + (i * 0.15) + 0.075);
            osc.frequency.linearRampToValueAtTime(300, t + (i * 0.15) + 0.15);
          }
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.9);
        } catch (e) {}
      },

      // Candy falling chime
      candy() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const t = c.currentTime;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(1760, t + 0.15);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        } catch (e) {}
      },

      // Victory fanfare
      victory() {
        if (!enabled) return;
        try {
          const c = getCtx(); if (!c) return;
          const melody = [523, 659, 784, 1046, 784, 1046];
          melody.forEach((freq, idx) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            const t = c.currentTime + idx * 0.14;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.4);
          });
        } catch (e) {}
      }
    };
  })();

  const PUMPKIN_CSS = `
    .pmp-shell {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      user-select: none;
      background: #120726;
      font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      color: #fff;
      --pmp-vine: url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'160'%20height%3D'44'%20viewBox%3D'0%200%20160%2044'%3E%3Cpath%20d%3D'M0%2022%20Q40%2014%2080%2022%20T160%2022'%20fill%3D'none'%20stroke%3D'%234d7c0f'%20stroke-width%3D'4'%2F%3E%3Cpath%20d%3D'M0%2022%20Q40%2014%2080%2022%20T160%2022'%20fill%3D'none'%20stroke%3D'%2384cc16'%20stroke-width%3D'1.6'%2F%3E%3Cpath%20d%3D'M18%2018%20q-6%20-12%206%20-14%20q4%208%20-6%2014z'%20fill%3D'%2365a30d'%2F%3E%3Cpath%20d%3D'M56%2017%20q8%20-10%2014%20-2%20q-6%206%20-14%202z'%20fill%3D'%2384cc16'%2F%3E%3Cpath%20d%3D'M98%2022%20q-4%20-13%208%20-13%20q2%209%20-8%2013z'%20fill%3D'%2365a30d'%2F%3E%3Cpath%20d%3D'M136%2020%20q8%20-11%2014%20-3%20q-6%206%20-14%203z'%20fill%3D'%2384cc16'%2F%3E%3Cpath%20d%3D'M40%2019%20q2%20-9%2010%20-8'%20fill%3D'none'%20stroke%3D'%2365a30d'%20stroke-width%3D'1.2'%2F%3E%3Cline%20x1%3D'32'%20y1%3D'19'%20x2%3D'32'%20y2%3D'27'%20stroke%3D'%23365314'%20stroke-width%3D'1.5'%2F%3E%3Cellipse%20cx%3D'32'%20cy%3D'32'%20rx%3D'4'%20ry%3D'6'%20fill%3D'%23a3e635'%2F%3E%3Ccircle%20cx%3D'32'%20cy%3D'32'%20r%3D'9'%20fill%3D'%23a3e635'%20opacity%3D'0.25'%2F%3E%3Cline%20x1%3D'84'%20y1%3D'22'%20x2%3D'84'%20y2%3D'29'%20stroke%3D'%23365314'%20stroke-width%3D'1.5'%2F%3E%3Cellipse%20cx%3D'84'%20cy%3D'34'%20rx%3D'4'%20ry%3D'6'%20fill%3D'%23c084fc'%2F%3E%3Ccircle%20cx%3D'84'%20cy%3D'34'%20r%3D'9'%20fill%3D'%23c084fc'%20opacity%3D'0.25'%2F%3E%3Cline%20x1%3D'124'%20y1%3D'20'%20x2%3D'124'%20y2%3D'27'%20stroke%3D'%23365314'%20stroke-width%3D'1.5'%2F%3E%3Cellipse%20cx%3D'124'%20cy%3D'32'%20rx%3D'4'%20ry%3D'6'%20fill%3D'%23fb923c'%2F%3E%3Ccircle%20cx%3D'124'%20cy%3D'32'%20r%3D'9'%20fill%3D'%23fb923c'%20opacity%3D'0.25'%2F%3E%3C%2Fsvg%3E");
    }
    .pmp-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      pointer-events: none;
    }
    .pmp-topbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 50;
      background: rgba(10, 4, 26, 0.7);
      backdrop-filter: blur(8px);
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.12);
    }
    .pmp-score-section {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      max-width: 650px;
      justify-content: center;
    }
    .pmp-team-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      font-size: 16px;
    }
    .pmp-team-score {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 32px;
      border-radius: 999px;
      padding: 0 10px;
      font-weight: 900;
      font-size: 17px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
    .pmp-team-score--a { background: #2563eb; color: #fff; border: 2px solid #93c5fd; }
    .pmp-team-score--b { background: #dc2626; color: #fff; border: 2px solid #fca5a5; }

    .pmp-tug-bar {
      flex: 1;
      height: 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.2);
      overflow: hidden;
      display: flex;
      border: 1.5px solid rgba(255,255,255,0.4);
    }
    .pmp-tug-fill--a { background: #3b82f6; transition: width 0.4s ease; }
    .pmp-tug-fill--b { background: #ef4444; transition: width 0.4s ease; }

    .pmp-topbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 38px;
      min-width: 38px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1.5px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.15);
      color: #fff;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.15s ease;
    }
    .pmp-topbar-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }

    /* Pumpkins: 4 hàng dây đèn, mỗi hàng 5 quả treo */
    .pmp-grid {
      position: absolute;
      top: 62px;
      bottom: 96px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 20;
    }
    .pmp-row {
      position: relative;
      flex: 1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      padding: 0 13%;
      align-items: start;
      justify-items: center;
    }
    .pmp-vine {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 44px;
      background-image: var(--pmp-vine);
      background-repeat: repeat-x;
      background-size: auto 100%;
      pointer-events: none;
      z-index: 1;
    }
    .pmp-row:nth-child(2) .pmp-vine { background-position-x: 53px; }
    .pmp-row:nth-child(3) .pmp-vine { background-position-x: 101px; }
    .pmp-row:nth-child(4) .pmp-vine { background-position-x: 27px; }
    .pmp-item {
      --pmp-size: clamp(62px, min(8.4vw, 15.5vh), 130px);
      position: relative;
      z-index: 2;
      width: var(--pmp-size);
      height: var(--pmp-size);
      margin-top: 14px;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
    }
    .pmp-item:not(.is-smashed):hover {
      transform: scale(1.1);
      filter: drop-shadow(0 0 16px rgba(251, 146, 60, 0.85));
    }
    .pmp-item.is-smashed {
      cursor: default;
      pointer-events: none;
    }
    .pmp-pumpkin {
      width: 100%;
      height: 100%;
      transform-origin: 50% 0%;
      animation: pmpSway 3.2s ease-in-out infinite;
      filter: drop-shadow(0 8px 10px rgba(0,0,0,0.45));
    }
    .pmp-row:nth-child(even) .pmp-item:nth-child(odd) .pmp-pumpkin,
    .pmp-row:nth-child(odd) .pmp-item:nth-child(even) .pmp-pumpkin { animation-delay: -1.6s; }
    .pmp-pumpkin svg, .pmp-smashed svg, .pmp-basket svg { width: 100%; height: 100%; display: block; overflow: visible; }
    @keyframes pmpSway {
      0%, 100% { transform: rotate(-2.5deg); }
      50% { transform: rotate(2.5deg); }
    }
    .pmp-smashed {
      width: 100%;
      height: 100%;
      animation: pmpSmashPop 0.45s ease-out forwards;
    }
    @keyframes pmpSmashPop {
      0% { transform: scale(1.25); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
    .pmp-badge {
      position: absolute;
      bottom: 2px;
      width: clamp(26px, 2.5vw, 34px);
      height: clamp(26px, 2.5vw, 34px);
      border-radius: 50%;
      background: #1e1138;
      border: 2px solid #fde047;
      color: #fde047;
      font-weight: 900;
      font-size: clamp(13px, 1.3vw, 17px);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      pointer-events: none;
    }
    .pmp-stump-img {
      width: clamp(35px, 4.5vw, 65px);
      height: clamp(30px, 4vw, 55px);
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
      opacity: 0.85;
    }

    /* Baskets */
    .pmp-basket {
      position: absolute;
      bottom: 12px;
      width: clamp(100px, 11vw, 160px);
      z-index: 25;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .pmp-basket--a { left: 16px; }
    .pmp-basket--b { right: 16px; }
    .pmp-basket-img {
      width: 100%;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
    }
    .pmp-basket-label {
      margin-top: 4px;
      padding: 3px 12px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 13.5px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    }
    .pmp-basket-label--a { background: #1d4ed8; color: #dbeafe; border: 1.5px solid #60a5fa; }
    .pmp-basket-label--b { background: #b91c1c; color: #fee2e2; border: 1.5px solid #f87171; }

    /* Bottom Prompt */
    .pmp-prompt-bar {
      position: absolute;
      bottom: 14px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      z-index: 30;
      pointer-events: none;
    }
    .pmp-turn-btn {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 28px;
      border-radius: 9999px;
      font-size: clamp(16px, 1.6vw, 22px);
      font-weight: 900;
      box-shadow: 0 6px 20px rgba(0,0,0,0.45);
      border: 3px solid #fde047;
      cursor: default;
      transition: all 0.2s ease;
    }
    .pmp-turn-btn--a {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      box-shadow: 0 6px #1e40af, 0 10px 24px rgba(37, 99, 235, 0.4);
    }
    .pmp-turn-btn--b {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #fff;
      box-shadow: 0 6px #991b1b, 0 10px 24px rgba(220, 38, 38, 0.4);
    }
    .pmp-prompt-text {
      font-size: 13px;
      font-weight: 700;
      color: #fde047;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      margin: 0;
    }

    /* Hammer: SVG trong suốt, đầu búa trùng con trỏ, xoay quanh tay cầm */
    .pmp-shell.pmp-hammer-on,
    .pmp-shell.pmp-hammer-on .pmp-item { cursor: none; }
    .pmp-shell.pmp-hammer-on .pmp-modal,
    .pmp-shell.pmp-hammer-on .pmp-event-banner { cursor: auto; }
    .pmp-hammer {
      position: absolute;
      left: 0;
      top: 0;
      width: clamp(84px, 8.5vw, 124px);
      height: clamp(84px, 8.5vw, 124px);
      pointer-events: none;
      z-index: 60;
      display: none;
      will-change: transform;
    }
    .pmp-hammer.is-visible { display: block; }
    .pmp-hammer-inner {
      width: 100%;
      height: 100%;
      transform-origin: 74% 84%;
      filter: drop-shadow(0 6px 10px rgba(0,0,0,0.55));
    }
    .pmp-hammer-inner svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .pmp-hammer.is-smashing .pmp-hammer-inner {
      animation: pmpSmashAnim 0.32s cubic-bezier(.3,.7,.4,1) forwards;
    }
    @keyframes pmpSmashAnim {
      0%   { transform: rotate(0deg); }
      35%  { transform: rotate(28deg); }
      60%  { transform: rotate(-26deg) scale(1.04); }
      78%  { transform: rotate(-18deg); }
      100% { transform: rotate(0deg); }
    }

    /* Question Modal */
    .pmp-modal {
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(10, 4, 26, 0.75);
      backdrop-filter: blur(8px);
      z-index: 80;
      padding: 16px;
    }
    .pmp-modal.open { display: flex; }
    .pmp-card {
      background: linear-gradient(180deg, #1f1238 0%, #150a28 100%);
      border: 3px solid #7c3aed;
      border-radius: 26px;
      width: min(840px, 94vw);
      padding: 24px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 30px rgba(124, 58, 237, 0.35);
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
    }
    .pmp-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .pmp-card-qnum {
      background: #7c3aed;
      color: #fff;
      font-weight: 900;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 14px;
    }
    .pmp-card-team {
      font-weight: 900;
      font-size: 15px;
      padding: 6px 18px;
      border-radius: 999px;
    }
    .pmp-card-team--a { background: #2563eb; color: #fff; }
    .pmp-card-team--b { background: #dc2626; color: #fff; }
    .pmp-timer {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid #22c55e;
      color: #22c55e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
    }
    .pmp-timer.is-danger { border-color: #ef4444; color: #ef4444; animation: pmpPulse 0.5s infinite; }
    @keyframes pmpPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

    .pmp-question-text {
      font-size: clamp(20px, 2.3vw, 32px);
      font-weight: 900;
      color: #fff;
      text-align: center;
      margin: 10px 0;
      line-height: 1.35;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .pmp-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .pmp-opt-btn {
      background: rgba(255,255,255,0.08);
      border: 2px solid rgba(255,255,255,0.18);
      border-radius: 16px;
      padding: 14px 18px;
      color: #fff;
      font-size: clamp(15px, 1.5vw, 20px);
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pmp-opt-btn:hover {
      background: rgba(255,255,255,0.18);
      border-color: #fde047;
      transform: translateY(-2px);
    }
    .pmp-opt-btn.is-correct {
      background: #15803d !important;
      border-color: #86efac !important;
      color: #fff !important;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
    }
    .pmp-opt-btn.is-wrong {
      background: #b91c1c !important;
      border-color: #fca5a5 !important;
      color: #fff !important;
    }
    .pmp-opt-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      font-weight: 900;
      font-size: 14px;
    }

    /* Teacher Quick Controls */
    .pmp-teacher-controls {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 6px;
    }
    .pmp-btn-check {
      border: none;
      padding: 8px 24px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.1s ease;
    }
    .pmp-btn-check:hover { transform: scale(1.05); }
    .pmp-btn-check--true { background: #16a34a; color: #fff; }
    .pmp-btn-check--false { background: #dc2626; color: #fff; }

    /* Special Event Banner (Ghost / Lucky) */
    .pmp-event-banner {
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: rgba(10, 4, 26, 0.85);
      backdrop-filter: blur(8px);
      z-index: 85;
      padding: 20px;
      text-align: center;
    }
    .pmp-event-banner.open { display: flex; }
    .pmp-ghost-avatar {
      width: clamp(120px, 16vw, 220px);
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 0 35px rgba(253, 224, 71, 0.7));
      animation: pmpFloat 2s ease-in-out infinite;
    }
    @keyframes pmpFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-16px); }
    }
    .pmp-event-title {
      font-size: clamp(26px, 3.5vw, 48px);
      font-weight: 900;
      margin-top: 16px;
      text-shadow: 0 4px 14px rgba(0,0,0,0.8);
    }
    .pmp-event-desc {
      font-size: clamp(16px, 1.8vw, 24px);
      font-weight: 700;
      color: #fde047;
      margin-top: 8px;
    }

    /* Flying Candy Particles */
    .pmp-flying-candy {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fde047, #ea580c);
      box-shadow: 0 0 14px #ea580c;
      z-index: 70;
      pointer-events: none;
      transition: all 0.65s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .pmp-item .pmp-badge { bottom: -6px; left: 50%; transform: translateX(-50%); z-index: 3; }
    .pmp-basket { bottom: 52px; width: clamp(110px, 11vw, 170px); }
    .pmp-basket-art { width: 100%; aspect-ratio: 1 / 1; filter: drop-shadow(0 10px 16px rgba(0,0,0,0.55)); }
    .pmp-basket .pmp-basket-label { position: absolute; bottom: -40px; }
    .pmp-ghost-avatar { border-radius: 50%; }
  `;

  // ===== Đồ họa SVG trong suốt (ảnh PNG cũ cắt từ video nên dính nền/chữ) =====
  const PMP_FACES = [
    // 1. ngạc nhiên
    '<circle cx="38" cy="52" r="7"/><circle cx="62" cy="52" r="7"/><ellipse cx="50" cy="73" rx="7" ry="9"/>',
    // 2. cười híp mắt
    '<path d="M30 54 Q38 44 46 54 Q38 49 30 54Z"/><path d="M54 54 Q62 44 70 54 Q62 49 54 54Z"/><path d="M32 66 Q50 86 68 66 Q50 74 32 66Z"/>',
    // 3. mắt tam giác, miệng răng
    '<path d="M31 58 L39 45 L47 58Z"/><path d="M53 58 L61 45 L69 58Z"/><path d="M47 62 L50 57 L53 62Z"/><path d="M28 66 L36 72 L42 67 L50 74 L58 67 L64 72 L72 66 Q50 92 28 66Z"/>',
    // 4. mắt sao
    '<path d="M38 43 l2.6 5.6 6 .7 -4.5 4.1 1.3 6 -5.4 -3.1 -5.4 3.1 1.3 -6 -4.5 -4.1 6 -.7z"/><path d="M62 43 l2.6 5.6 6 .7 -4.5 4.1 1.3 6 -5.4 -3.1 -5.4 3.1 1.3 -6 -4.5 -4.1 6 -.7z"/><path d="M33 66 Q50 90 67 66Z"/>',
    // 5. mắt giận, miệng răng cưa
    '<path d="M29 47 L46 54 L33 58Z"/><path d="M71 47 L54 54 L67 58Z"/><path d="M30 68 L36 74 L42 68 L48 74 L52 74 L58 68 L64 74 L70 68 L66 80 L34 80Z"/>',
    // 6. mắt trái tim
    '<path d="M38 60 C27 52 31 44 38 49 C45 44 49 52 38 60Z"/><path d="M62 60 C51 52 55 44 62 49 C69 44 73 52 62 60Z"/><path d="M34 67 Q50 84 66 67 Q50 75 34 67Z"/>'
  ];

  function pmpPumpkinSvg(faceIdx, red) {
    const g = red ? ['#fb923c', '#ea580c', '#9a3412'] : ['#fde68a', '#f59e0b', '#b45309'];
    const gid = red ? 'pmpGradR' : 'pmpGradY';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><radialGradient id="${gid}" cx="45%" cy="40%" r="65%"><stop offset="0%" stop-color="${g[0]}"/><stop offset="60%" stop-color="${g[1]}"/><stop offset="100%" stop-color="${g[2]}"/></radialGradient></defs>
      <path d="M50 26 C49 16 46 8 52 0 L57 3 C53 9 55 17 56 27Z" fill="#4d7c0f" stroke="#1a2e05" stroke-width="2"/>
      <path d="M55 12 q12 -8 18 2 q-10 4 -18 -2z" fill="#65a30d" stroke="#1a2e05" stroke-width="1.5"/>
      <ellipse cx="29" cy="60" rx="22" ry="30" fill="url(#${gid})" stroke="#7c2d12" stroke-width="2.5"/>
      <ellipse cx="71" cy="60" rx="22" ry="30" fill="url(#${gid})" stroke="#7c2d12" stroke-width="2.5"/>
      <ellipse cx="50" cy="59" rx="24" ry="33" fill="url(#${gid})" stroke="#7c2d12" stroke-width="2.5"/>
      <ellipse cx="40" cy="38" rx="7" ry="3.5" fill="#fff" opacity="0.35"/>
      <g fill="#fef08a" stroke="#78350f" stroke-width="2" stroke-linejoin="round">${PMP_FACES[faceIdx % PMP_FACES.length]}</g>
    </svg>`;
  }

  function pmpSmashedSvg() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 26 C49 16 46 8 52 0 L57 3 C53 9 55 17 56 27Z" fill="#4d7c0f" stroke="#1a2e05" stroke-width="2"/>
      <path d="M40 24 L60 24 L64 34 L57 30 L52 37 L47 30 L38 34Z" fill="#ea580c" stroke="#7c2d12" stroke-width="2"/>
      <ellipse cx="50" cy="90" rx="34" ry="6" fill="#000" opacity="0.25"/>
      <path d="M18 88 L26 72 L34 86Z" fill="#f59e0b" stroke="#7c2d12" stroke-width="2"/>
      <path d="M40 90 L50 74 L60 90Z" fill="#ea580c" stroke="#7c2d12" stroke-width="2"/>
      <path d="M66 86 L76 70 L84 88Z" fill="#f59e0b" stroke="#7c2d12" stroke-width="2"/>
      <circle cx="30" cy="94" r="2.5" fill="#fde68a"/><circle cx="58" cy="95" r="2" fill="#fde68a"/><circle cx="72" cy="93" r="2.5" fill="#fde68a"/>
    </svg>`;
  }

  function pmpBasketSvg(team, candies) {
    const ribbon = team === 'B' ? '#ef4444' : '#3b82f6';
    const n = Math.max(0, Math.min(14, candies || 0));
    const colors = ['#f43f5e', '#22d3ee', '#a3e635', '#facc15', '#c084fc', '#fb923c'];
    let candyHtml = '';
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 5), col = i % 5;
      const x = 30 + col * 10 + (row % 2) * 5, y = 42 - row * 7;
      candyHtml += `<g transform="translate(${x} ${y}) rotate(${(i * 37) % 60 - 30})"><path d="M-7 -3 L-4 0 L-7 3Z M7 -3 L4 0 L7 3Z" fill="${colors[i % 6]}"/><circle r="4" fill="${colors[i % 6]}" stroke="#fff" stroke-width="1"/></g>`;
    }
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 44 Q50 -4 80 44" fill="none" stroke="#3b0764" stroke-width="4"/>
      <path d="M40 10 q-10 -8 -12 2 q8 2 12 -2z M60 10 q10 -8 12 2 q-8 2 -12 -2z" fill="${ribbon}"/><circle cx="50" cy="10" r="4" fill="${ribbon}"/>
      ${candyHtml}
      <path d="M14 44 L86 44 L80 88 Q50 98 20 88Z" fill="#f97316" stroke="#7c2d12" stroke-width="3"/>
      <ellipse cx="50" cy="44" rx="37" ry="7" fill="#9a3412" stroke="#7c2d12" stroke-width="3"/>
      <path d="M16 54 Q50 62 84 54" fill="none" stroke="${ribbon}" stroke-width="5"/>
      <path d="M31 72 L37 62 L43 72Z M57 72 L63 62 L69 72Z" fill="#fde047" stroke="#7c2d12" stroke-width="1.5"/>
      <path d="M30 78 L36 83 L42 79 L50 85 L58 79 L64 83 L70 78 Q50 96 30 78Z" fill="#fde047" stroke="#7c2d12" stroke-width="1.5"/>
    </svg>`;
  }

  // Búa vẽ bằng SVG (ảnh PNG cũ bị cắt từ video nên dính nền bí ngô)
  function pmpHammerSvg(team) {
    const c = team === 'B'
      ? { main: '#dc2626', dark: '#7f1d1d', light: '#f87171' }
      : { main: '#2563eb', dark: '#1e3a8a', light: '#60a5fa' };
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="rotate(-35 60 60)">
        <rect x="54" y="46" width="12" height="64" rx="5" fill="#a16207" stroke="#422006" stroke-width="2"/>
        <rect x="53" y="80" width="14" height="30" rx="5" fill="#6d28d9" stroke="#2e1065" stroke-width="2"/>
        <path d="M54 86 L66 91 M54 93 L66 98 M54 100 L66 105" stroke="#c4b5fd" stroke-width="2"/>
        <rect x="51" y="78" width="18" height="5" rx="2" fill="#fbbf24" stroke="#78350f" stroke-width="1.5"/>
        <rect x="20" y="14" width="80" height="36" rx="9" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
        <rect x="24" y="17" width="72" height="9" rx="4" fill="${c.light}" opacity="0.55"/>
        <rect x="12" y="9" width="16" height="46" rx="6" fill="${c.dark}" stroke="#0f172a" stroke-width="2"/>
        <rect x="92" y="9" width="16" height="46" rx="6" fill="${c.dark}" stroke="#0f172a" stroke-width="2"/>
        <rect x="29" y="14" width="5" height="36" fill="#fbbf24"/>
        <rect x="86" y="14" width="5" height="36" fill="#fbbf24"/>
        <path d="M60 22 L63.5 29.5 L71.5 30.3 L65.5 35.6 L67.3 43.5 L60 39.4 L52.7 43.5 L54.5 35.6 L48.5 30.3 L56.5 29.5 Z" fill="#fde047" stroke="#a16207" stroke-width="1.5"/>
      </g>
    </svg>`;
  }

  window.launchDapThuBongGame = window.launchBiNgoGame = function (container, options = {}) {
    if (!container) return;

    let styleEl = document.getElementById('pmp-game-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'pmp-game-style';
      styleEl.textContent = PUMPKIN_CSS;
      document.head.appendChild(styleEl);
    }

    const teamAName = options.teamAName || 'Đội A';
    const teamBName = options.teamBName || 'Đội B';
    let currentTitle = options.lessonTitle || options.schoolName || 'Bí Ngô Halloween - Đấu Trí 2 Đội';

    let scoreA = 0;
    let scoreB = 0;
    let currentTurn = 'A'; // 'A' or 'B'
    let isPaused = false;
    let isDestroyed = false;
    let timerInterval = null;
    let activeQuestionIdx = 0;
    let activePumpkinIdx = -1;

    // Build question bank (default or from options)
    const questions = (options.questions && options.questions.length > 0) ? options.questions : [
      { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
      { text: "9 × 6 = ?", options: ["54", "45", "63", "56"], correctIndex: 0 },
      { text: "Thủ đô của nước ta là gì?", options: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Huế"], correctIndex: 0 },
      { text: "Từ nào viết đúng chính tả?", options: ["Xinh xắn", "Sinh xắn", "Xinh sắn", "Sinh sắn"], correctIndex: 0 },
      { text: "15 - 8 = ?", options: ["7", "6", "8", "9"], correctIndex: 0 },
      { text: "7 × 8 = ?", options: ["56", "54", "58", "64"], correctIndex: 0 },
      { text: "Lễ hội Halloween diễn ra vào ngày nào?", options: ["31/10", "25/12", "1/1", "15/8"], correctIndex: 0 },
      { text: "24 : 4 = ?", options: ["6", "7", "8", "5"], correctIndex: 0 },
      { text: "Biểu tượng kinh điển của Halloween là gì?", options: ["Quả bí ngô", "Bánh nướng", "Cây tre", "Hoa đào"], correctIndex: 0 },
      { text: "100 - 37 = ?", options: ["63", "67", "53", "73"], correctIndex: 0 },
      { text: "35 + 28 = ?", options: ["63", "65", "61", "53"], correctIndex: 0 },
      { text: "6 × 7 = ?", options: ["42", "48", "36", "49"], correctIndex: 0 },
      { text: "81 : 9 = ?", options: ["9", "8", "7", "6"], correctIndex: 0 },
      { text: "Từ nào đồng nghĩa với 'chăm chỉ'?", options: ["Cần cù", "Lười biếng", "Nhanh nhẹn", "Thật thà"], correctIndex: 0 }
    ];

    // Assign 20 pumpkins with outcomes
    // Type: 'question' | 'lucky' (+2 kẹo) | 'ghost' (ma cướp 2 kẹo)
    const pumpkinData = [];
    const outcomeTypes = [
      'question', 'question', 'question', 'lucky', 'question',
      'question', 'ghost', 'question', 'question', 'lucky',
      'question', 'question', 'ghost', 'question', 'question',
      'lucky', 'question', 'ghost', 'question', 'question'
    ];
    // Shuffle outcome types
    outcomeTypes.sort(() => Math.random() - 0.5);

    const faceImages = [
      '/ey/games/dap-thu-bong/assets/pumpkin_face_1.png',
      '/ey/games/dap-thu-bong/assets/pumpkin_face_2.png',
      '/ey/games/dap-thu-bong/assets/pumpkin_face_3.png',
      '/ey/games/dap-thu-bong/assets/pumpkin_face_4.png',
      '/ey/games/dap-thu-bong/assets/pumpkin_face_5.png',
      '/ey/games/dap-thu-bong/assets/pumpkin_face_6.png'
    ];

    for (let i = 1; i <= 20; i++) {
      pumpkinData.push({
        id: i,
        type: outcomeTypes[i - 1],
        isSmashed: false,
        face: (i - 1) % 6,
        red: [2, 3, 5, 8, 11, 14].includes(i),
        candyReward: outcomeTypes[i - 1] === 'lucky' ? (Math.random() > 0.5 ? 3 : 2) : 2
      });
    }

    container.innerHTML = `
      <div class="pmp-shell">
        <div class="pmp-bg" style="background-color: #2e1065; background-image: url('/ey/games/dap-thu-bong/assets/bg_clean.jpg'), radial-gradient(circle at 85% 18%, #fef9c3 0 7%, rgba(254,249,195,0.25) 9%, transparent 16%), linear-gradient(180deg, #1a0b2e 0%, #3b0764 60%, #2e1065 100%);"></div>

        <!-- Topbar -->
        <header class="pmp-topbar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🎃</span>
            <span id="pmp-title" style="font-weight: 800; font-size: 14.5px; color: #fde047;">${currentTitle}</span>
            <button type="button" id="pmp-btn-edit" style="border: none; background: none; cursor: pointer; font-size: 14px; padding: 0;" title="Chỉnh sửa tiêu đề">✏️</button>
          </div>

          <!-- Score Tug-of-war -->
          <div class="pmp-score-section">
            <div class="pmp-team-badge" style="color: #60a5fa;">
              <span>${teamAName}</span>
              <span id="pmp-score-a" class="pmp-team-score pmp-team-score--a">0</span>
            </div>
            <div class="pmp-tug-bar">
              <div id="pmp-tug-a" class="pmp-tug-fill--a" style="width: 50%;"></div>
              <div id="pmp-tug-b" class="pmp-tug-fill--b" style="width: 50%;"></div>
            </div>
            <div class="pmp-team-badge" style="color: #f87171;">
              <span id="pmp-score-b" class="pmp-team-score pmp-team-score--b">0</span>
              <span>${teamBName}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" id="pmp-btn-sound" class="pmp-topbar-btn" title="Bật/Tắt âm thanh">🔊</button>
            <button type="button" id="pmp-btn-fs" class="pmp-topbar-btn" title="Toàn màn hình">⛶</button>
            <button type="button" id="pmp-btn-pause" class="pmp-topbar-btn" style="display: none;">Tạm dừng</button>
            <button type="button" id="pmp-btn-exit" class="pmp-topbar-btn" style="background: rgba(220, 38, 38, 0.4); border-color: #ef4444; color: #fee2e2;">Kết thúc</button>
          </div>
        </header>

        <!-- 20 Pumpkins Grid -->
        <main id="pmp-grid" class="pmp-grid">
          ${[0, 1, 2, 3].map(r => `
            <div class="pmp-row">
              <div class="pmp-vine"></div>
              ${pumpkinData.slice(r * 5, r * 5 + 5).map(p => `
                <div class="pmp-item" data-id="${p.id}" id="pmp-item-${p.id}" title="Bí ngô số ${p.id}">
                  <div class="pmp-pumpkin">${pmpPumpkinSvg(p.face, p.red)}</div>
                  <div class="pmp-badge">${p.id}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </main>

        <!-- Baskets -->
        <div class="pmp-basket pmp-basket--a">
          <div id="pmp-basket-art-a" class="pmp-basket-art">${pmpBasketSvg('A', 0)}</div>
          <div class="pmp-basket-label pmp-basket-label--a">${teamAName}</div>
        </div>
        <div class="pmp-basket pmp-basket--b">
          <div id="pmp-basket-art-b" class="pmp-basket-art">${pmpBasketSvg('B', 0)}</div>
          <div class="pmp-basket-label pmp-basket-label--b">${teamBName}</div>
        </div>

        <!-- Hammer (Follows Mouse) -->
        <div id="pmp-hammer" class="pmp-hammer"><div class="pmp-hammer-inner">${pmpHammerSvg('A')}</div></div>

        <!-- Bottom Prompt -->
        <div class="pmp-prompt-bar">
          <div id="pmp-turn-btn" class="pmp-turn-btn pmp-turn-btn--a">
            <span>🔨 Lượt ${teamAName}</span>
          </div>
          <p class="pmp-prompt-text">Chọn một quả bí — rê búa tới và bấm để đập!</p>
        </div>

        <!-- Question Modal -->
        <div id="pmp-question-modal" class="pmp-modal">
          <div class="pmp-card">
            <div class="pmp-card-header">
              <div id="pmp-qnum-badge" class="pmp-card-qnum">CÂU 1</div>
              <div id="pmp-team-turn-badge" class="pmp-card-team pmp-card-team--a">🔨 ${teamAName} trả lời</div>
              <div id="pmp-timer" class="pmp-timer">30</div>
            </div>

            <div id="pmp-question-text" class="pmp-question-text">...</div>

            <div id="pmp-options-grid" class="pmp-options-grid"></div>

            <div class="pmp-teacher-controls">
              <button type="button" id="pmp-btn-true" class="pmp-btn-check pmp-btn-check--true">✓ Đúng (+2 kẹo)</button>
              <button type="button" id="pmp-btn-false" class="pmp-btn-check pmp-btn-check--false">✕ Sai</button>
            </div>
          </div>
        </div>

        <!-- Special Event Banner (Ghost / Lucky) -->
        <div id="pmp-event-banner" class="pmp-event-banner">
          <img id="pmp-event-img" src="/ey/games/dap-thu-bong/assets/ghost.png" class="pmp-ghost-avatar" alt="Sự kiện">
          <div id="pmp-event-title" class="pmp-event-title">MA CƯỚP KẸO!</div>
          <div id="pmp-event-desc" class="pmp-event-desc">Đội B lấy 2 kẹo của Đội A</div>
          <button type="button" id="pmp-event-btn-next" style="margin-top: 24px; padding: 12px 36px; border-radius: 999px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font-size: 18px; font-weight: 900; border: 2px solid #fde047; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
            Tiếp tục
          </button>
        </div>

        <!-- Victory Modal -->
        <div id="pmp-victory-modal" class="pmp-modal">
          <div class="pmp-card" style="align-items: center; text-align: center; max-width: 580px;">
            <div style="font-size: 54px; margin-bottom: -10px;">🏆</div>
            <div id="pmp-victory-title" style="font-size: 32px; font-weight: 900; color: #fde047; margin-top: 10px;">CHÚC MỪNG CHIẾN THẮNG!</div>
            <div id="pmp-victory-desc" style="font-size: 18px; color: #e2e8f0; margin-top: 6px;">...</div>
            <div style="display: flex; gap: 14px; margin-top: 24px;">
              <button type="button" id="pmp-btn-replay" style="padding: 12px 32px; border-radius: 999px; background: #16a34a; color: #fff; font-weight: 800; border: 2px solid #86efac; cursor: pointer; font-size: 16px;">
                🔄 Chơi lại
              </button>
              <button type="button" id="pmp-btn-victory-exit" style="padding: 12px 32px; border-radius: 999px; background: #334155; color: #fff; font-weight: 800; border: 2px solid #64748b; cursor: pointer; font-size: 16px;">
                Thoát
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Elements
    const gridEl = container.querySelector('#pmp-grid');
    const hammerEl = container.querySelector('#pmp-hammer');
    const scoreAEl = container.querySelector('#pmp-score-a');
    const scoreBEl = container.querySelector('#pmp-score-b');
    const tugAEl = container.querySelector('#pmp-tug-a');
    const tugBEl = container.querySelector('#pmp-tug-b');
    const turnBtn = container.querySelector('#pmp-turn-btn');

    const questionModal = container.querySelector('#pmp-question-modal');
    const qnumBadge = container.querySelector('#pmp-qnum-badge');
    const teamTurnBadge = container.querySelector('#pmp-team-turn-badge');
    const questionText = container.querySelector('#pmp-question-text');
    const optionsGrid = container.querySelector('#pmp-options-grid');
    const timerEl = container.querySelector('#pmp-timer');
    const btnTrue = container.querySelector('#pmp-btn-true');
    const btnFalse = container.querySelector('#pmp-btn-false');

    const eventBanner = container.querySelector('#pmp-event-banner');
    const eventImg = container.querySelector('#pmp-event-img');
    const eventTitle = container.querySelector('#pmp-event-title');
    const eventDesc = container.querySelector('#pmp-event-desc');
    const eventBtnNext = container.querySelector('#pmp-event-btn-next');

    const victoryModal = container.querySelector('#pmp-victory-modal');
    const victoryTitle = container.querySelector('#pmp-victory-title');
    const victoryDesc = container.querySelector('#pmp-victory-desc');
    const btnReplay = container.querySelector('#pmp-btn-replay');
    const btnVictoryExit = container.querySelector('#pmp-btn-victory-exit');

    const btnEdit = container.querySelector('#pmp-btn-edit');
    const titleEl = container.querySelector('#pmp-title');
    const btnSound = container.querySelector('#pmp-btn-sound');
    const btnFs = container.querySelector('#pmp-btn-fs');
    const btnExit = container.querySelector('#pmp-btn-exit');

    // Title editor
    btnEdit?.addEventListener('click', () => {
      let t = prompt('Nhập tiêu đề trò chơi / bài học:', currentTitle);
      if (t && t.trim()) {
        currentTitle = t.trim();
        if (titleEl) titleEl.textContent = currentTitle;
      }
    });

    // Sound toggle
    let isSoundOn = true;
    btnSound?.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      PumpkinAudio.setEnabled(isSoundOn);
      btnSound.textContent = isSoundOn ? '🔊' : '🔇';
    });

    // Fullscreen
    btnFs?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    // Exit
    btnExit?.addEventListener('click', () => {
      endGame();
    });

    // Update Scores & Tug of war
    function updateScores() {
      if (scoreAEl) scoreAEl.textContent = scoreA;
      if (scoreBEl) scoreBEl.textContent = scoreB;
      const bA = container.querySelector('#pmp-basket-art-a');
      const bB = container.querySelector('#pmp-basket-art-b');
      if (bA) bA.innerHTML = pmpBasketSvg('A', scoreA);
      if (bB) bB.innerHTML = pmpBasketSvg('B', scoreB);
      const total = Math.max(1, scoreA + scoreB);
      const pctA = Math.max(10, Math.min(90, Math.round((scoreA / total) * 100)));
      if (tugAEl) tugAEl.style.width = `${pctA}%`;
      if (tugBEl) tugBEl.style.width = `${100 - pctA}%`;
    }

    // Switch Turn
    function switchTurn() {
      currentTurn = currentTurn === 'A' ? 'B' : 'A';
      if (turnBtn) {
        turnBtn.className = `pmp-turn-btn pmp-turn-btn--${currentTurn.toLowerCase()}`;
        turnBtn.innerHTML = `<span>🔨 Lượt ${currentTurn === 'A' ? teamAName : teamBName}</span>`;
      }
      if (hammerEl) {
        const inner = hammerEl.querySelector('.pmp-hammer-inner');
        if (inner) inner.innerHTML = pmpHammerSvg(currentTurn);
      }
    }

    // Mouse Tracking for Hammer: đầu búa nằm đúng tại con trỏ
    const shellEl = container.querySelector('.pmp-shell');
    let hammerRaf = 0, hammerX = 0, hammerY = 0;
    function placeHammer() {
      hammerRaf = 0;
      const w = hammerEl.offsetWidth || 100;
      // Tâm đầu búa ≈ (36.6%, 31%) của khung SVG
      hammerEl.style.transform = `translate3d(${hammerX - w * 0.366}px, ${hammerY - w * 0.31}px, 0)`;
    }
    function hideHammer() {
      if (!hammerEl) return;
      hammerEl.classList.remove('is-visible');
      shellEl?.classList.remove('pmp-hammer-on');
    }
    container.addEventListener('pointermove', e => {
      if (!hammerEl || isDestroyed) return;
      const blocked = e.target.closest('.pmp-topbar, .pmp-modal.open, .pmp-event-banner.open, .pmp-prompt-bar, button');
      if (blocked) { hideHammer(); return; }
      const rect = container.getBoundingClientRect();
      hammerX = e.clientX - rect.left;
      hammerY = e.clientY - rect.top;
      hammerEl.classList.add('is-visible');
      shellEl?.classList.add('pmp-hammer-on');
      if (!hammerRaf) hammerRaf = requestAnimationFrame(placeHammer);
    });
    container.addEventListener('pointerleave', hideHammer);

    // Pumpkin Click
    gridEl?.addEventListener('click', e => {
      const item = e.target.closest('.pmp-item');
      if (!item || item.classList.contains('is-smashed')) return;

      const pId = parseInt(item.dataset.id, 10);
      const pumpkin = pumpkinData.find(p => p.id === pId);
      if (!pumpkin || pumpkin.isSmashed) return;

      activePumpkinIdx = pId;

      // Animate Hammer Smash
      PumpkinAudio.whoosh();
      if (hammerEl) {
        const r = container.getBoundingClientRect();
        hammerX = e.clientX - r.left;
        hammerY = e.clientY - r.top;
        placeHammer();
        hammerEl.classList.add('is-visible');
        hammerEl.classList.remove('is-smashing');
        void hammerEl.offsetWidth;
        hammerEl.classList.add('is-smashing');
      }

      setTimeout(() => {
        PumpkinAudio.smash();
        smashPumpkin(pumpkin, item);
      }, 160);
    });

    function smashPumpkin(pumpkin, el) {
      pumpkin.isSmashed = true;
      el.classList.add('is-smashed');

      // Replace pumpkin with stump
      el.innerHTML = `
        <div class="pmp-smashed">${pmpSmashedSvg()}</div>
        <div class="pmp-badge" style="opacity:.6">${pumpkin.id}</div>
      `;

      // Trigger Outcome
      setTimeout(() => {
        if (pumpkin.type === 'lucky') {
          handleLuckyOutcome(pumpkin);
        } else if (pumpkin.type === 'ghost') {
          handleGhostOutcome(pumpkin);
        } else {
          handleQuestionOutcome(pumpkin);
        }
      }, 350);
    }

    // 1. Lucky Pumpkin Outcome
    function handleLuckyOutcome(p) {
      const reward = p.candyReward || 2;
      PumpkinAudio.candy();
      PumpkinAudio.correct();

      if (currentTurn === 'A') scoreA += reward;
      else scoreB += reward;
      updateScores();

      eventImg.src = '/ey/modules/plush-smash-avatar.png';
      eventTitle.textContent = `BÍ MAY MẮN! +${reward} KẸO`;
      eventTitle.style.color = '#fde047';
      eventDesc.textContent = `${currentTurn === 'A' ? teamAName : teamBName} nhận ngay ${reward} kẹo vào giỏ!`;
      eventBanner.classList.add('open');
    }

    // 2. Ghost Outcome
    function handleGhostOutcome(p) {
      PumpkinAudio.ghost();
      const stolen = 2;

      if (currentTurn === 'A') {
        const actual = Math.min(scoreA, stolen);
        scoreA -= actual;
        scoreB += actual;
        eventDesc.textContent = `Ma xuất hiện! ${teamBName} cướp ${actual} kẹo của ${teamAName}!`;
      } else {
        const actual = Math.min(scoreB, stolen);
        scoreB -= actual;
        scoreA += actual;
        eventDesc.textContent = `Ma xuất hiện! ${teamAName} cướp ${actual} kẹo của ${teamBName}!`;
      }
      updateScores();

      eventImg.src = '/ey/games/dap-thu-bong/assets/ghost.png';
      eventTitle.textContent = 'MA CƯỚP KẸO!';
      eventTitle.style.color = '#c084fc';
      eventBanner.classList.add('open');
    }

    eventBtnNext?.addEventListener('click', () => {
      eventBanner.classList.remove('open');
      checkNextTurn();
    });

    // 3. Question Outcome
    function handleQuestionOutcome(p) {
      const q = questions[activeQuestionIdx % questions.length];
      activeQuestionIdx++;

      qnumBadge.textContent = `CÂU ${activeQuestionIdx}`;
      teamTurnBadge.className = `pmp-card-team pmp-card-team--${currentTurn.toLowerCase()}`;
      teamTurnBadge.textContent = `🔨 ${currentTurn === 'A' ? teamAName : teamBName} trả lời`;
      questionText.textContent = q.text || q.content;

      const opts = q.options || ["A", "B", "C", "D"];
      const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : 0;

      optionsGrid.innerHTML = opts.map((opt, i) => `
        <button type="button" class="pmp-opt-btn" data-idx="${i}">
          <span class="pmp-opt-key">${'ABCD'[i]}</span>
          <span>${opt}</span>
        </button>
      `).join('');

      questionModal.classList.add('open');
      startTimer();

      optionsGrid.querySelectorAll('.pmp-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          stopTimer();
          const selected = parseInt(btn.dataset.idx, 10);
          if (selected === correctIdx) {
            btn.classList.add('is-correct');
            PumpkinAudio.correct();
            awardPoints(2);
          } else {
            btn.classList.add('is-wrong');
            PumpkinAudio.wrong();
            optionsGrid.querySelector(`[data-idx="${correctIdx}"]`)?.classList.add('is-correct');
          }
          setTimeout(() => {
            questionModal.classList.remove('open');
            checkNextTurn();
          }, 1500);
        });
      });
    }

    // Teacher Manual Controls
    btnTrue?.addEventListener('click', () => {
      stopTimer();
      PumpkinAudio.correct();
      awardPoints(2);
      setTimeout(() => {
        questionModal.classList.remove('open');
        checkNextTurn();
      }, 700);
    });

    btnFalse?.addEventListener('click', () => {
      stopTimer();
      PumpkinAudio.wrong();
      setTimeout(() => {
        questionModal.classList.remove('open');
        checkNextTurn();
      }, 700);
    });

    function awardPoints(pts) {
      PumpkinAudio.candy();
      if (currentTurn === 'A') scoreA += pts;
      else scoreB += pts;
      updateScores();
    }

    function startTimer() {
      stopTimer();
      let left = options.secondsPerQuestion || 30;
      timerEl.textContent = left;
      timerEl.classList.remove('is-danger');

      timerInterval = setInterval(() => {
        left--;
        timerEl.textContent = left;
        if (left <= 5) timerEl.classList.add('is-danger');
        if (left <= 0) {
          stopTimer();
          PumpkinAudio.wrong();
          setTimeout(() => {
            questionModal.classList.remove('open');
            checkNextTurn();
          }, 1000);
        }
      }, 1000);
    }

    function stopTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    function checkNextTurn() {
      const remaining = pumpkinData.filter(p => !p.isSmashed).length;
      if (remaining === 0) {
        endGame();
      } else {
        switchTurn();
      }
    }

    function endGame() {
      stopTimer();
      PumpkinAudio.victory();

      let winner = 'HÒA NHAU!';
      let desc = `${teamAName} và ${teamBName} cùng đạt ${scoreA} kẹo!`;
      if (scoreA > scoreB) {
        winner = `${teamAName} CHIẾN THẮNG! 🏆`;
        desc = `Xuất sắc giành được ${scoreA} kẹo (Đội B: ${scoreB} kẹo)`;
      } else if (scoreB > scoreA) {
        winner = `${teamBName} CHIẾN THẮNG! 🏆`;
        desc = `Xuất sắc giành được ${scoreB} kẹo (Đội A: ${scoreA} kẹo)`;
      }

      victoryTitle.textContent = winner;
      victoryDesc.textContent = desc;
      victoryModal.classList.add('open');
    }

    btnReplay?.addEventListener('click', () => {
      cleanup();
      window.launchDapThuBongGame(container, options);
    });

    btnVictoryExit?.addEventListener('click', () => {
      cleanup();
      if (typeof options.onExit === 'function') options.onExit();
      else container.innerHTML = '';
    });

    function cleanup() {
      isDestroyed = true;
      if (hammerRaf) cancelAnimationFrame(hammerRaf);
      stopTimer();
      container.innerHTML = '';
    }

    return {
      destroy: cleanup
    };
  };
})();
