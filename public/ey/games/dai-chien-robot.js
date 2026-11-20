// ==============================================================================
// TRÒ CHƠI ĐẠI CHIẾN ROBOT (MECHA ROBOT BATTLE ARENA) - ĐỐI KHÁNG 2-4 ĐỘI
// Chuẩn xác 100% đồ hoạ và cơ chế gốc PomyAI (https://pomyai.com/gv/tro-choi/dai-chien-robot)
// Tích hợp hiển thị đề thi iMath / Azota (Công thức Toán KaTeX, Phóng to ảnh, Cỡ chữ A+/A-)
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  const TEAM_PRESETS = [
    {
      id: 0,
      defaultName: 'Đội A',
      color: '#ef4444',
      lightBg: '#fef2f2',
      borderColor: '#fca5a5',
      sprite: '/ey/games/dai-chien-robot/robot_red.webp',
      fallbackSprite: '/ey/games/dai-chien-robot/robot_red.png'
    },
    {
      id: 1,
      defaultName: 'Đội B',
      color: '#3b82f6',
      lightBg: '#eff6ff',
      borderColor: '#93c5fd',
      sprite: '/ey/games/dai-chien-robot/robot_blue.webp',
      fallbackSprite: '/ey/games/dai-chien-robot/robot_blue.png'
    },
    {
      id: 2,
      defaultName: 'Đội Vàng',
      color: '#f59e0b',
      lightBg: '#fffbeb',
      borderColor: '#fcd34d',
      sprite: '/ey/games/dai-chien-robot/robot_yellow.webp',
      fallbackSprite: '/ey/games/dai-chien-robot/robot_yellow.png'
    },
    {
      id: 3,
      defaultName: 'Đội Lá',
      color: '#22c55e',
      lightBg: '#f0fdf4',
      borderColor: '#86efac',
      sprite: '/ey/games/dai-chien-robot/robot_green.webp',
      fallbackSprite: '/ey/games/dai-chien-robot/robot_green.png'
    }
  ];

  // Positions on stage (in percentage of arena width & height, matching video 100%)
  const STAGE_SLOTS = {
    2: [
      { left: 34.0, top: 47.0, scale: 1.06, zIndex: 15 }, // Red (Left)
      { left: 66.0, top: 47.0, scale: 1.06, zIndex: 15 }  // Blue (Right)
    ],
    3: [
      { left: 36.8, top: 44.5, scale: 1.0, zIndex: 12 },  // Red (Back-Left)
      { left: 62.9, top: 44.5, scale: 1.0, zIndex: 12 },  // Blue (Back-Right)
      { left: 16.7, top: 66.7, scale: 1.02, zIndex: 18 }  // Yellow (Front-Left)
    ],
    4: [
      { left: 36.8, top: 44.5, scale: 1.0, zIndex: 12 },  // Red (Back-Left)
      { left: 62.9, top: 44.5, scale: 1.0, zIndex: 12 },  // Blue (Back-Right)
      { left: 16.7, top: 66.7, scale: 1.02, zIndex: 18 }, // Yellow (Front-Left)
      { left: 83.1, top: 66.7, scale: 1.02, zIndex: 18 }  // Green (Front-Right)
    ]
  };

  const SKILLS = {
    punch: {
      id: 'punch',
      type: 'attack',
      name: 'Đấm',
      cost: 2,
      damage: 12,
      pierce: 0,
      desc: '👊 Đấm — -12 máu · cận chiến',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><circle cx="18" cy="19" r="11" fill="#fbbf24" stroke="#d97706" stroke-width="2"/><path d="M11 16h14M11 20h14M14 12v8M18 12v8M22 12v8" stroke="#b45309" stroke-width="1.8" stroke-linecap="round"/></svg>`
    },
    laser: {
      id: 'laser',
      type: 'attack',
      name: 'Laser',
      cost: 3,
      damage: 16,
      pierce: 0.5,
      desc: '🔫 Laser — -16 máu · xuyên 50% giáp',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><path d="M6 20l10-5h12l2 4-10 3-4 7h-4l2-7H6z" fill="#ec4899" stroke="#be185d" stroke-width="1.8" stroke-linejoin="round"/><path d="M28 15h6" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    rocket: {
      id: 'rocket',
      type: 'attack',
      name: 'Rocket',
      cost: 4,
      damage: 24,
      pierce: 0.25,
      desc: '🚀 Rocket — -24 máu · tên lửa hạng nặng',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><path d="M26 10c-5 0-11 4-14 9l-4 1 2 4 4 2 1-4c5-3 9-9 9-14z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.6"/><circle cx="20" cy="16" r="2.5" fill="#fef08a"/><path d="M9 24l-4 4M12 27l-4 4" stroke="#f97316" stroke-width="2.2" stroke-linecap="round"/></svg>`
    },
    ultimate: {
      id: 'ultimate',
      type: 'attack',
      name: 'Tuyệt chiêu',
      cost: 5,
      damage: 34,
      pierce: 1.0,
      desc: '💥 Tuyệt chiêu — -34 máu · xuyên 100% giáp',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><polygon points="18,3 22,13 33,12 25,20 29,31 18,25 7,31 11,20 3,12 14,13" fill="#f43f5e" stroke="#f59e0b" stroke-width="1.6"/><circle cx="18" cy="18" r="5" fill="#fef08a"/></svg>`
    },
    shield: {
      id: 'shield',
      type: 'defense',
      name: 'Khiên',
      cost: 2,
      shieldGain: 15,
      desc: '🛡️ Khiên — +15 giáp năng lượng',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><path d="M18 5l11 4v9c0 7.5-4.7 13.8-11 16-6.3-2.2-11-8.5-11-16V9l11-4z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.8"/><path d="M18 8v23c5-2 8.5-7 8.5-13V11L18 8z" fill="#0ea5e9" opacity="0.45"/></svg>`
    },
    heal: {
      id: 'heal',
      type: 'defense',
      name: 'Hồi máu',
      cost: 3,
      healGain: 18,
      desc: '🔧 Hồi máu — +18 máu sửa chữa',
      iconSvg: `<svg viewBox="0 0 36 36" width="28" height="28"><path d="M23 8a6 6 0 0 0-5.6 8L9 24.4a2.5 2.5 0 0 0 3.5 3.5L21 19.6a6 6 0 0 0 8-5.6l-3.5 3.5-3-3L26 11a6 6 0 0 0-3-3z" fill="#94a3b8" stroke="#475569" stroke-width="1.6"/></svg>`
    }
  };

  function renderHexGemSvg(color, size = 18) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex-shrink:0; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.18));">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <polygon points="12,4 19,8 12,12 5,8" fill="#ffffff" opacity="0.38"/>
      </svg>
    `;
  }

  function renderRobotHeadIconSvg(color, size = 40) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.16));">
        <rect x="8" y="10" width="32" height="28" rx="9" fill="${color}" stroke="#1e293b" stroke-width="2.5"/>
        <path d="M16 10V6h4v4M28 10V6h4v4" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="13" y="17" width="22" height="11" rx="4" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="19" cy="22.5" r="2.5" fill="#38bdf8"/>
        <circle cx="29" cy="22.5" r="2.5" fill="#38bdf8"/>
        <path d="M18 33h12" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `;
  }

  function injectStyles() {
    if (document.getElementById('dai-chien-robot-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'dai-chien-robot-styles';
    styleEl.textContent = `
      .rbt-stage-root {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        z-index: 99999 !important;
        user-select: none;
        -webkit-user-select: none;
        font-family: 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #94a3b8;
        display: flex;
        flex-direction: column;
      }

      /* Top Status Bar */
      .rbt-topbar {
        position: relative;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 14px;
        background: #ffffff;
        border-bottom: 1.5px solid #e2e8f0;
        box-shadow: 0 3px 14px rgba(15, 23, 42, 0.06);
        min-height: 58px;
      }

      .rbt-teams-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
      }

      .rbt-team-card {
        flex: 1;
        min-width: 165px;
        background: #ffffff;
        border: 1.8px solid #cbd5e1;
        border-radius: 12px;
        padding: 6px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: all 0.25s ease;
        position: relative;
      }

      .rbt-team-card.active {
        border-color: var(--team-color, #ef4444);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--team-color, #ef4444) 25%, transparent), 0 4px 12px rgba(0, 0, 0, 0.08);
        background: color-mix(in srgb, var(--team-color, #ef4444) 3%, #ffffff);
      }

      .rbt-team-card.dead {
        opacity: 0.45;
        filter: grayscale(0.8);
      }

      .rbt-team-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .rbt-team-name-wrap {
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 800;
        font-size: 13.5px;
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rbt-turn-pill {
        background: #fef3c7;
        color: #b45309;
        border: 1px solid #fde68a;
        font-size: 11px;
        font-weight: 800;
        padding: 1px 8px;
        border-radius: 999px;
      }

      .rbt-team-card-bottom {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rbt-hp-track {
        flex: 1;
        height: 8px;
        background: #1e293b;
        border-radius: 999px;
        overflow: hidden;
      }

      .rbt-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        border-radius: 999px;
        transition: width 0.35s ease;
      }
      .rbt-hp-fill.mid {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }
      .rbt-hp-fill.low {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .rbt-stats-inline {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11.5px;
        font-weight: 800;
        white-space: nowrap;
      }

      .rbt-util-btns {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-shrink: 0;
      }

      .rbt-util-btn {
        height: 36px;
        padding: 0 13px;
        border-radius: 9px;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        color: #1e293b;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .rbt-util-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      /* Main Arena Viewport */
      .rbt-arena-viewport {
        position: relative;
        flex: 1;
        width: 100%;
        overflow: hidden;
        background-color: #9ab3cc;
        background-image: url('/ey/games/dai-chien-robot/arena_bg.webp');
        background-size: 100% 100%;
        background-position: center center;
        background-repeat: no-repeat;
      }

      /* Robot Unit on Stage */
      .rbt-unit {
        position: absolute;
        transform: translate(-50%, -50%);
        width: clamp(145px, 10.2vw, 196px);
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
        transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, filter 0.3s ease;
      }

      .rbt-unit.dead {
        opacity: 0.25;
        filter: grayscale(1) brightness(0.6);
        pointer-events: none;
      }

      /* Downward Bouncing Turn Arrow */
      .rbt-turn-arrow {
        width: 34px;
        height: 34px;
        margin-bottom: 2px;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.28));
        animation: rbtArrowBounce 1.1s infinite ease-in-out;
      }
      @keyframes rbtArrowBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
      }

      /* Floating HP + Pin Pill Above Robot */
      .rbt-floating-hud {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        margin-bottom: 3px;
        z-index: 5;
      }

      .rbt-floating-pill {
        background: rgba(255, 255, 255, 0.95);
        border: 1.5px solid #cbd5e1;
        border-radius: 999px;
        padding: 2px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 800;
        color: #0f172a;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
        white-space: nowrap;
      }

      .rbt-floating-hpbar {
        width: 88px;
        height: 8px;
        background: #1e293b;
        border-radius: 999px;
        padding: 1px;
        border: 1.5px solid #eab308;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }

      .rbt-floating-hpfill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #4ade80);
        border-radius: 999px;
        transition: width 0.35s ease;
      }

      /* Robot Sprite Container */
      .rbt-sprite-wrap {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .rbt-sprite-img {
        width: 100%;
        height: auto;
        display: block;
        position: relative;
        z-index: 3;
        filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.28));
        animation: rbtIdleBreath 2.6s infinite ease-in-out;
      }

      @keyframes rbtIdleBreath {
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(-3px) scaleY(1.015); }
      }

      /* Underfoot Active Turn Ring */
      .rbt-foot-ring {
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 108%;
        height: 36px;
        border-radius: 50%;
        border: 2.5px dashed var(--team-color, #ef4444);
        box-shadow: 0 0 18px var(--team-color, #ef4444), inset 0 0 12px var(--team-color, #ef4444);
        opacity: 0.85;
        z-index: 1;
        pointer-events: none;
        animation: rbtRingPulse 1.8s infinite ease-in-out;
      }
      @keyframes rbtRingPulse {
        0%, 100% { transform: translateX(-50%) scale(0.96); opacity: 0.7; }
        50% { transform: translateX(-50%) scale(1.05); opacity: 1; }
      }

      /* Spherical Energy Shield Bubble (Khiên) */
      .rbt-shield-bubble {
        position: absolute;
        top: 46%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 148%;
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.55) 0%, rgba(56, 189, 248, 0.28) 45%, rgba(14, 165, 233, 0.48) 82%, rgba(186, 230, 253, 0.75) 100%);
        border: 2.5px solid rgba(186, 230, 253, 0.9);
        box-shadow: 0 0 28px rgba(56, 189, 248, 0.6), inset 0 0 22px rgba(255, 255, 255, 0.55);
        z-index: 6;
        pointer-events: none;
        animation: rbtShieldShimmer 2.4s infinite ease-in-out;
      }
      @keyframes rbtShieldShimmer {
        0%, 100% { transform: translate(-50%, -50%) scale(0.98); filter: brightness(1); }
        50% { transform: translate(-50%, -50%) scale(1.03); filter: brightness(1.12); }
      }

      /* Hit Shake Animation */
      .rbt-unit.hit-shake {
        animation: rbtHitShake 0.48s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      @keyframes rbtHitShake {
        0%, 100% { transform: translate(-50%, -50%); }
        15%, 45%, 75% { transform: translate(calc(-50% - 12px), calc(-50% - 4px)) rotate(-3deg); filter: brightness(1.6) saturate(1.5); }
        30%, 60%, 90% { transform: translate(calc(-50% + 12px), calc(-50% + 4px)) rotate(3deg); }
      }

      /* Floating Damage / Status Text */
      .rbt-float-text {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: 900;
        padding: 3px 12px;
        border-radius: 999px;
        white-space: nowrap;
        z-index: 30;
        pointer-events: none;
        text-shadow: 0 2px 6px rgba(0,0,0,0.45);
        animation: rbtFloatUp 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes rbtFloatUp {
        0% { opacity: 0; transform: translate(-50%, 10px) scale(0.7); }
        20% { opacity: 1; transform: translate(-50%, -8px) scale(1.12); }
        80% { opacity: 1; transform: translate(-50%, -32px) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -48px) scale(0.9); }
      }

      /* Question Card at Top-Center of Arena */
      .rbt-question-card {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(1440px, 76vw);
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(10px);
        border: 2.2px solid var(--q-border-color, #ef4444);
        border-radius: 18px;
        padding: 16px 22px;
        box-shadow: 0 12px 34px rgba(15, 23, 42, 0.16);
        z-index: 40;
        animation: rbtSlideDown 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes rbtSlideDown {
        from { opacity: 0; transform: translate(-50%, -18px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }

      .rbt-q-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      .rbt-q-title-wrap {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .rbt-q-badge {
        background: var(--q-border-color, #ef4444);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 900;
        padding: 5px 12px;
        border-radius: 8px;
        white-space: nowrap;
        flex-shrink: 0;
        margin-top: 2px;
        letter-spacing: 0.03em;
      }

      .rbt-q-text {
        font-size: var(--rbt-q-font-size, 21px);
        font-weight: 800;
        color: #0f172a;
        line-height: 1.42;
        word-break: break-word;
      }

      .rbt-q-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .rbt-font-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        color: #334155;
        font-weight: 800;
        font-size: 12px;
        cursor: pointer;
      }
      .rbt-font-btn:hover {
        background: #e2e8f0;
      }

      .rbt-timer-ring {
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 15px;
        color: #0f172a;
      }

      .rbt-options-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      @media (max-width: 1024px) {
        .rbt-options-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .rbt-opt-btn {
        background: #ffffff;
        border: 1.8px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        text-align: left;
        font-family: inherit;
        font-size: calc(var(--rbt-q-font-size, 21px) * 0.78);
        font-weight: 700;
        color: #0f172a;
        cursor: pointer;
        transition: all 0.16s ease;
      }
      .rbt-opt-btn:hover:not(:disabled) {
        border-color: var(--q-border-color, #3b82f6);
        background: #f8fafc;
        transform: translateY(-1px);
      }
      .rbt-opt-btn.correct {
        background: #dcfce7 !important;
        border-color: #22c55e !important;
        color: #14532d !important;
      }
      .rbt-opt-btn.wrong {
        background: #fee2e2 !important;
        border-color: #ef4444 !important;
        color: #7f1d1d !important;
      }

      /* Bottom Action Dock */
      .rbt-action-dock {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(10px);
        border: 2px solid #e2e8f0;
        border-radius: 20px;
        padding: 10px 14px;
        display: flex;
        align-items: stretch;
        gap: 12px;
        box-shadow: 0 14px 36px rgba(15, 23, 42, 0.18);
        z-index: 40;
        animation: rbtDockUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes rbtDockUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }

      .rbt-dock-team-box {
        background: var(--dock-team-bg, #fef2f2);
        border: 1.5px solid var(--dock-team-border, #fca5a5);
        border-radius: 14px;
        padding: 10px 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-width: 105px;
      }

      .rbt-dock-group {
        border-radius: 14px;
        padding: 6px 12px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .rbt-dock-group.attack {
        background: #fff1f2;
        border: 1.5px solid #fecdd3;
      }
      .rbt-dock-group.defense {
        background: #f0f9ff;
        border: 1.5px solid #bae6fd;
      }

      .rbt-dock-group-title {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .rbt-dock-group.attack .rbt-dock-group-title { color: #e11d48; }
      .rbt-dock-group.defense .rbt-dock-group-title { color: #0284c7; }

      .rbt-dock-skills-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rbt-skill-btn {
        position: relative;
        width: 74px;
        height: 68px;
        border-radius: 12px;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.16s ease;
        padding-top: 6px;
      }
      .rbt-skill-btn:hover:not(:disabled) {
        transform: translateY(-3px);
        border-color: #94a3b8;
        box-shadow: 0 6px 14px rgba(0,0,0,0.08);
      }
      .rbt-skill-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
        background: rgba(255,255,255,0.6);
      }

      .rbt-skill-cost {
        position: absolute;
        top: -6px;
        right: -4px;
        background: #1e293b;
        color: #facc15;
        font-size: 10.5px;
        font-weight: 900;
        padding: 1px 6px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 2px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }

      .rbt-skill-label {
        font-size: 11px;
        font-weight: 800;
        color: #334155;
        white-space: nowrap;
      }

      .rbt-end-turn-btn {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        padding: 0 20px;
        font-weight: 800;
        font-size: 13.5px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-width: 96px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
        transition: all 0.16s ease;
      }
      .rbt-end-turn-btn:hover {
        transform: translateY(-2px);
        filter: brightness(1.12);
      }

      /* Modals (Setup, Target Selection, Victory, Pause) */
      .rbt-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.42);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 60;
        padding: 20px;
      }

      .rbt-modal-card {
        background: #ffffff;
        border-radius: 24px;
        padding: 28px 32px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
        max-width: 660px;
        width: 100%;
        text-align: center;
        animation: rbtPopIn 0.24s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes rbtPopIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }

      /* FX SVG Overlay Layer */
      .rbt-fx-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 35;
      }
    `;
    document.head.appendChild(styleEl);
  }

  function playRobotSfx(type) {
    const sfx = global.soundFx;
    if (!sfx || !sfx.enabled) return;
    try {
      if (type === 'punch') {
        sfx.slap();
        setTimeout(() => sfx.stamp(), 90);
      } else if (type === 'laser') {
        sfx.playTone(1200, 'sawtooth', 0.12, 0.3);
        setTimeout(() => sfx.playTone(620, 'sawtooth', 0.22, 0.35), 70);
      } else if (type === 'rocket') {
        sfx.wind();
        setTimeout(() => sfx.explosion(), 280);
      } else if (type === 'ultimate') {
        sfx.playTone(880, 'square', 0.15, 0.35);
        setTimeout(() => sfx.explosion(), 140);
        setTimeout(() => sfx.explosion(), 320);
      } else if (type === 'shield') {
        sfx.playTone(440, 'sine', 0.15, 0.28);
        setTimeout(() => sfx.playTone(660, 'sine', 0.25, 0.32), 110);
      } else if (type === 'heal') {
        [523.25, 659.25, 783.99].forEach((f, i) => {
          setTimeout(() => sfx.playTone(f, 'triangle', 0.18, 0.28), i * 95);
        });
      }
    } catch (e) {}
  }

  function launchDaiChienRobotGame(container, options = {}) {
    if (!container) return () => {};
    injectStyles();

    const rawQuestions = Array.isArray(options.questions) && options.questions.length > 0
      ? options.questions
      : [
          { text: '8 + 7 = ?', options: ['15', '13', '16', '14'], correctIndex: 0 },
          { text: 'Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?', options: ['48 chiếc', '56 chiếc', '54 chiếc', '63 chiếc'], correctIndex: 1 },
          { text: 'Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?', options: ['22 quyển', '26 quyển', '24 quyển', '28 quyển'], correctIndex: 2 },
          { text: 'Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?', options: ['27 quyển', '23 quyển', '33 quyển', '37 quyển'], correctIndex: 0 }
        ];

    const secondsPerQuestion = Number(options.secondsPerQuestion) || 30;

    // Game State
    let destroyed = false;
    let teamCount = Number(options.teamCount) || 4;
    if (teamCount < 2 || teamCount > 4) teamCount = 4;

    let teams = TEAM_PRESETS.map((preset, idx) => ({
      id: idx,
      name: idx === 0 && options.teamAName ? options.teamAName
          : idx === 1 && options.teamBName ? options.teamBName
          : preset.defaultName,
      color: preset.color,
      lightBg: preset.lightBg,
      borderColor: preset.borderColor,
      sprite: preset.sprite,
      fallbackSprite: preset.fallbackSprite,
      hp: 100,
      maxHp: 100,
      shield: 0,
      energy: 0,
      alive: true,
      damageDealt: 0,
      correctCount: 0
    }));

    let phase = 'setup'; // 'setup' | 'countdown' | 'question' | 'action' | 'target' | 'animating' | 'victory'
    let activeTeamIdx = 0; // Turn owner
    let answeringTeamIdx = 0; // Current team answering the question (changes on steal!)
    let stealAttemptCount = 0;
    let currentQIdx = 0;
    let questionFontSize = 21;
    let timerSec = secondsPerQuestion;
    let timerInterval = null;
    let isPaused = false;
    let selectedSkill = null;

    // Root DOM
    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'rbt-stage-root';
    container.appendChild(root);

    function clearTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function getActiveTeams() {
      return teams.slice(0, teamCount);
    }

    function getLivingTeams() {
      return getActiveTeams().filter(t => t.alive && t.hp > 0);
    }

    function getNextLivingTeamIdx(fromIdx) {
      for (let step = 1; step <= teamCount; step++) {
        const idx = (fromIdx + step) % teamCount;
        if (teams[idx].alive && teams[idx].hp > 0) return idx;
      }
      return fromIdx;
    }

    function formatQuestionOptionText(rawOpt) {
      const s = typeof rawOpt === 'object' ? (rawOpt.text || rawOpt.content || '') : String(rawOpt || '');
      return s.replace(/^[A-D][\.\:\)]\s*/i, '').trim();
    }

    function triggerMathRender(el) {
      if (!el) return;
      if (global.FileParser && typeof global.FileParser.renderMath === 'function') {
        global.FileParser.renderMath(el);
      }
    }

    // =========================================================================
    // RENDER MAIN SHELL (TOPBAR + ARENA VIEWPORT)
    // =========================================================================
    function renderShell() {
      const activeTeams = getActiveTeams();
      const soundEnabled = global.soundFx ? global.soundFx.enabled : true;

      root.innerHTML = `
        <!-- Top Status Bar -->
        <header class="rbt-topbar">
          <div class="rbt-teams-bar" id="rbt-teams-bar">
            ${activeTeams.map((t, idx) => {
              const isTurn = (phase !== 'setup' && phase !== 'victory' && idx === answeringTeamIdx);
              const hpPct = Math.max(0, Math.min(100, Math.round((t.hp / t.maxHp) * 100)));
              const hpClass = hpPct <= 30 ? 'low' : hpPct <= 60 ? 'mid' : '';
              return `
                <div class="rbt-team-card ${isTurn ? 'active' : ''} ${!t.alive ? 'dead' : ''}" id="rbt-topcard-${idx}" style="--team-color: ${t.color};">
                  <div class="rbt-team-card-top">
                    <div class="rbt-team-name-wrap">
                      ${renderHexGemSvg(t.color, 18)}
                      <span>${t.name}</span>
                    </div>
                    ${isTurn ? `<span class="rbt-turn-pill">Lượt</span>` : ''}
                  </div>
                  <div class="rbt-team-card-bottom">
                    <div class="rbt-hp-track">
                      <div class="rbt-hp-fill ${hpClass}" style="width: ${hpPct}%;"></div>
                    </div>
                    <div class="rbt-stats-inline">
                      <span style="color: #ef4444;">❤️ ${t.hp}</span>
                      <span style="color: #0ea5e9;">🛡️ ${t.shield}</span>
                      <span style="color: #f59e0b;">⚡ ${t.energy}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="rbt-util-btns">
            <button class="rbt-util-btn" id="rbt-btn-fs" title="Toàn màn hình">⛶</button>
            <button class="rbt-util-btn" id="rbt-btn-sound" title="Bật/Tắt âm thanh">${soundEnabled ? '🔊' : '🔇'}</button>
            ${phase !== 'setup' && phase !== 'countdown' && phase !== 'victory' ? `
              <button class="rbt-util-btn" id="rbt-btn-pause">${isPaused ? '▶ Tiếp tục' : 'Tạm dừng'}</button>
            ` : ''}
            <button class="rbt-util-btn" id="rbt-btn-exit" style="font-weight: 800;">Kết thúc</button>
          </div>
        </header>

        <!-- Arena Viewport -->
        <div class="rbt-arena-viewport" id="rbt-arena-viewport">
          <!-- Stage Robots Layer -->
          <div id="rbt-units-layer"></div>

          <!-- SVG Projectiles & Beams Layer -->
          <svg class="rbt-fx-layer" id="rbt-fx-layer" viewBox="0 0 1908 806" preserveAspectRatio="none"></svg>

          <!-- Dynamic Overlay Layer (Setup / Countdown / Question / Action Dock / Target Modal / Victory) -->
          <div id="rbt-overlay-layer"></div>
        </div>
      `;

      // Utility listeners
      document.getElementById('rbt-btn-fs')?.addEventListener('click', () => {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch (e) {}
      });

      document.getElementById('rbt-btn-sound')?.addEventListener('click', (e) => {
        if (global.soundFx) {
          global.soundFx.enabled = !global.soundFx.enabled;
          e.currentTarget.textContent = global.soundFx.enabled ? '🔊' : '🔇';
        }
      });

      document.getElementById('rbt-btn-pause')?.addEventListener('click', () => {
        isPaused = !isPaused;
        updateTopbar();
        renderOverlay();
      });

      document.getElementById('rbt-btn-exit')?.addEventListener('click', () => {
        if (phase === 'setup' || phase === 'victory') {
          cleanupAndExit();
        } else {
          showVictoryModal();
        }
      });

      renderStageUnits();
      renderOverlay();
    }

    function updateTopbar() {
      const bar = document.getElementById('rbt-teams-bar');
      if (!bar) return;
      const activeTeams = getActiveTeams();
      bar.innerHTML = activeTeams.map((t, idx) => {
        const isTurn = (phase !== 'setup' && phase !== 'victory' && idx === answeringTeamIdx);
        const hpPct = Math.max(0, Math.min(100, Math.round((t.hp / t.maxHp) * 100)));
        const hpClass = hpPct <= 30 ? 'low' : hpPct <= 60 ? 'mid' : '';
        return `
          <div class="rbt-team-card ${isTurn ? 'active' : ''} ${!t.alive ? 'dead' : ''}" id="rbt-topcard-${idx}" style="--team-color: ${t.color};">
            <div class="rbt-team-card-top">
              <div class="rbt-team-name-wrap">
                ${renderHexGemSvg(t.color, 18)}
                <span>${t.name}</span>
              </div>
              ${isTurn ? `<span class="rbt-turn-pill">Lượt</span>` : ''}
            </div>
            <div class="rbt-team-card-bottom">
              <div class="rbt-hp-track">
                <div class="rbt-hp-fill ${hpClass}" style="width: ${hpPct}%;"></div>
              </div>
              <div class="rbt-stats-inline">
                <span style="color: #ef4444;">❤️ ${t.hp}</span>
                <span style="color: #0ea5e9;">🛡️ ${t.shield}</span>
                <span style="color: #f59e0b;">⚡ ${t.energy}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const pauseBtn = document.getElementById('rbt-btn-pause');
      if (pauseBtn) {
        pauseBtn.textContent = isPaused ? '▶ Tiếp tục' : 'Tạm dừng';
      }
    }

    function renderStageUnits() {
      const unitsLayer = document.getElementById('rbt-units-layer');
      if (!unitsLayer) return;

      if (phase === 'setup') {
        unitsLayer.innerHTML = '';
        return;
      }

      const slots = STAGE_SLOTS[teamCount] || STAGE_SLOTS[4];
      const activeTeams = getActiveTeams();

      unitsLayer.innerHTML = activeTeams.map((t, idx) => {
        const slot = slots[idx] || slots[0];
        const isCurrentActor = (idx === answeringTeamIdx && phase !== 'victory');
        const hpPct = Math.max(0, Math.min(100, Math.round((t.hp / t.maxHp) * 100)));
        const showArrow = isCurrentActor && (phase === 'countdown' || phase === 'action' || phase === 'target');

        return `
          <div class="rbt-unit ${!t.alive ? 'dead' : ''}" id="rbt-unit-${idx}"
               style="left: ${slot.left}%; top: ${slot.top}%; z-index: ${slot.zIndex}; --team-color: ${t.color};">
            ${showArrow ? `
              <svg class="rbt-turn-arrow" viewBox="0 0 36 36">
                <path d="M18 32L5 16h8V4h10v12h8L18 32z" fill="${t.color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            ` : `<div style="height: 36px;"></div>`}

            <div class="rbt-floating-hud">
              <div class="rbt-floating-pill">
                <span style="color: #ef4444;">❤️ <b style="color:#16a34a;">${t.hp}</b></span>
                <span style="color: #f59e0b;">⚡ <b style="color:#d97706;">${t.energy}</b></span>
              </div>
              <div class="rbt-floating-hpbar">
                <div class="rbt-floating-hpfill" style="width: ${hpPct}%;"></div>
              </div>
            </div>

            <div class="rbt-sprite-wrap">
              ${t.shield > 0 ? `<div class="rbt-shield-bubble" title="Giáp năng lượng: ${t.shield}"></div>` : ''}
              <img class="rbt-sprite-img" src="${t.sprite}" alt="${t.name}" onerror="this.onerror=null; this.src='${t.fallbackSprite}';" />
              ${isCurrentActor ? `<div class="rbt-foot-ring"></div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    function spawnFloatingText(teamIdx, text, bgColor = '#ef4444') {
      const unitEl = document.getElementById(`rbt-unit-${teamIdx}`);
      if (!unitEl) return;
      const badge = document.createElement('div');
      badge.className = 'rbt-float-text';
      badge.style.background = bgColor;
      badge.style.color = '#ffffff';
      badge.textContent = text;
      unitEl.appendChild(badge);
      setTimeout(() => badge.remove(), 1200);
    }

    // =========================================================================
    // OVERLAYS BY PHASE
    // =========================================================================
    function renderOverlay() {
      const overlay = document.getElementById('rbt-overlay-layer');
      if (!overlay) return;

      if (isPaused && phase !== 'setup' && phase !== 'victory') {
        overlay.innerHTML = `
          <div class="rbt-modal-backdrop">
            <div class="rbt-modal-card" style="max-width: 440px;">
              <div style="font-size: 52px; margin-bottom: 8px;">⏸️</div>
              <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">Đang tạm dừng trận đấu</h2>
              <p style="font-size: 14px; color: #64748b; margin-bottom: 22px;">Nhấn tiếp tục để quay lại võ đài Đại Chiến Robot.</p>
              <button id="rbt-resume-btn" style="padding: 12px 32px; border-radius: 12px; border: none; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f172a; font-weight: 900; font-size: 15px; cursor: pointer;">
                ▶ Tiếp tục chơi
              </button>
            </div>
          </div>
        `;
        document.getElementById('rbt-resume-btn')?.addEventListener('click', () => {
          isPaused = false;
          updateTopbar();
          renderOverlay();
        });
        return;
      }

      if (phase === 'setup') {
        renderSetupModal(overlay);
      } else if (phase === 'question') {
        renderQuestionOverlay(overlay);
      } else if (phase === 'action') {
        renderActionDockOverlay(overlay);
      } else if (phase === 'target') {
        renderActionDockOverlay(overlay);
        renderTargetSelectionModal(overlay);
      } else if (phase === 'victory') {
        renderVictoryOverlay(overlay);
      } else {
        overlay.innerHTML = '';
      }
    }

    // 1. SETUP MODAL (Matches frame_008s.jpg & frame_012s.jpg 100%)
    function renderSetupModal(overlay) {
      const activeTeams = getActiveTeams();
      overlay.innerHTML = `
        <div class="rbt-modal-backdrop" style="background: radial-gradient(circle at center, #cbd5e1 0%, #94a3b8 100%);">
          <div class="rbt-modal-card" style="max-width: 640px; padding: 32px 36px;">
            <!-- Hexagon Lightning Emblem -->
            <div style="display: flex; justify-content: center; margin-bottom: 10px;">
              <svg width="58" height="58" viewBox="0 0 64 64" style="filter: drop-shadow(0 6px 12px rgba(15,23,42,0.22));">
                <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="#1e3a8a" stroke="#eab308" stroke-width="4"/>
                <path d="M35 14L20 34h11l-3 16 16-20H33l2-16z" fill="#facc15"/>
              </svg>
            </div>

            <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.02em;">Đại Chiến Robot</h1>
            <p style="font-size: 14.5px; color: #64748b; font-weight: 600; margin-bottom: 22px;">Chọn số đội, rồi đặt tên và màu giáp cho từng robot.</p>

            <!-- Team Count Selector -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 22px;">
              <span style="font-size: 14px; font-weight: 800; color: #334155;">Số đội</span>
              <div style="display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 12px; border: 1.5px solid #e2e8f0; gap: 4px;">
                ${[2, 3, 4].map(cnt => `
                  <button type="button" class="rbt-cnt-btn" data-cnt="${cnt}" style="width: 44px; height: 38px; border-radius: 9px; border: none; font-weight: 900; font-size: 15px; cursor: pointer; transition: all 0.15s; ${teamCount === cnt ? 'background: #1e293b; color: #ffffff; box-shadow: 0 2px 6px rgba(15,23,42,0.25);' : 'background: transparent; color: #475569;'}">
                    ${cnt}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Team Name Inputs Grid -->
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 26px;">
              ${activeTeams.map((t, idx) => `
                <div style="width: calc(50% - 6px); min-width: 220px; background: ${t.lightBg}; border: 2px solid ${t.borderColor}; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
                  <div style="width: 28px; height: 28px; border-radius: 8px; background: ${t.color}; flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(255,255,255,0.35);"></div>
                  <input type="text" class="rbt-team-name-input" data-idx="${idx}" value="${t.name}" maxlength="22"
                         style="width: 100%; border: none; background: transparent; font-family: inherit; font-size: 14.5px; font-weight: 800; color: #0f172a; outline: none;" />
                </div>
              `).join('')}
            </div>

            <!-- Start Button -->
            <button type="button" id="rbt-start-match-btn" style="padding: 13px 42px; border-radius: 14px; border: 1.5px solid #d97706; background: linear-gradient(180deg, #fde68a 0%, #f59e0b 55%, #d97706 100%); color: #0f172a; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 6px 18px rgba(217, 119, 6, 0.35); display: inline-flex; align-items: center; gap: 8px;">
              <span>▶</span> <span>Bắt đầu</span>
            </button>
          </div>
        </div>
      `;

      overlay.querySelectorAll('.rbt-cnt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          teamCount = parseInt(btn.dataset.cnt, 10);
          if (global.soundFx) global.soundFx.tick();
          renderShell();
        });
      });

      overlay.querySelectorAll('.rbt-team-name-input').forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = parseInt(inp.dataset.idx, 10);
          teams[idx].name = inp.value.trim() || TEAM_PRESETS[idx].defaultName;
          updateTopbar();
        });
      });

      document.getElementById('rbt-start-match-btn')?.addEventListener('click', () => {
        if (global.soundFx) global.soundFx.whistle();
        startCountdownSequence();
      });
    }

    // 2. COUNTDOWN SEQUENCE (3 -> 2 -> 1 -> SẴN SÀNG! matching frame_013s..f_16.80s)
    function startCountdownSequence() {
      phase = 'countdown';
      activeTeamIdx = 0;
      answeringTeamIdx = 0;
      renderShell();

      const overlay = document.getElementById('rbt-overlay-layer');
      if (!overlay) return;

      const steps = ['3', '2', '1', 'SẴN SÀNG!'];
      let i = 0;

      function showStep() {
        if (destroyed || phase !== 'countdown') return;
        const label = steps[i];
        const isText = label.length > 2;
        if (global.soundFx) {
          if (isText) global.soundFx.whistle();
          else global.soundFx.tick();
        }
        overlay.innerHTML = `
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 55;">
            <div style="font-size: ${isText ? 'clamp(64px, 7.5vw, 110px)' : 'clamp(120px, 14vw, 200px)'}; font-weight: 900; color: #ffffff; -webkit-text-stroke: 4px #78350f; text-shadow: 0 0 38px rgba(250, 204, 21, 0.85), 0 8px 24px rgba(0,0,0,0.45); animation: rbtPopIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);">
              ${label}
            </div>
          </div>
        `;
        i++;
        if (i < steps.length) {
          setTimeout(showStep, 820);
        } else {
          setTimeout(() => {
            if (!destroyed) startTurnQuestion(0);
          }, 750);
        }
      }

      showStep();
    }

    // 3. QUESTION PHASE (With Steal / Cướp Lượt & Overload Penalty)
    function startTurnQuestion(turnTeamIdx) {
      clearTimer();
      activeTeamIdx = turnTeamIdx;
      answeringTeamIdx = turnTeamIdx;
      stealAttemptCount = 0;
      phase = 'question';
      timerSec = secondsPerQuestion;

      updateTopbar();
      renderStageUnits();
      renderOverlay();
      startQuestionTimer();
    }

    function startQuestionTimer() {
      clearTimer();
      timerSec = secondsPerQuestion;
      updateTimerUi();

      timerInterval = setInterval(() => {
        if (destroyed || isPaused || phase !== 'question') return;
        timerSec--;
        if (timerSec <= 5 && timerSec > 0 && global.soundFx) {
          global.soundFx.tick();
        }
        updateTimerUi();
        if (timerSec <= 0) {
          clearTimer();
          handleQuestionAnswer(-1); // Timeout counts as wrong answer
        }
      }, 1000);
    }

    function updateTimerUi() {
      const numEl = document.getElementById('rbt-timer-num');
      const circleEl = document.getElementById('rbt-timer-circle');
      if (numEl) numEl.textContent = String(Math.max(0, timerSec));
      if (circleEl) {
        const circumference = 2 * Math.PI * 18;
        const pct = Math.max(0, Math.min(1, timerSec / secondsPerQuestion));
        circleEl.style.strokeDashoffset = String(circumference * (1 - pct));
        circleEl.style.stroke = timerSec <= 5 ? '#ef4444' : timerSec <= 10 ? '#f59e0b' : '#22c55e';
      }
    }

    function renderQuestionOverlay(overlay) {
      const q = rawQuestions[currentQIdx % rawQuestions.length];
      const answeringTeam = teams[answeringTeamIdx];
      const qText = q.text || q.content || '';
      const opts = Array.isArray(q.options) ? q.options : [];
      const circumference = 2 * Math.PI * 18;
      const pct = Math.max(0, Math.min(1, timerSec / secondsPerQuestion));

      overlay.innerHTML = `
        <div class="rbt-question-card" id="rbt-question-card" style="--q-border-color: ${answeringTeam.color}; --rbt-q-font-size: ${questionFontSize}px;">
          <div class="rbt-q-header">
            <div class="rbt-q-title-wrap">
              <span class="rbt-q-badge">CÂU ${(currentQIdx % rawQuestions.length) + 1}</span>
              <div style="flex: 1; min-width: 0;">
                ${stealAttemptCount > 0 ? `
                  <div style="font-size: 12px; font-weight: 800; color: ${answeringTeam.color}; margin-bottom: 3px;">
                    ⚡ CƯỚP LƯỢT: Cơ hội trả lời dành cho ${answeringTeam.name}!
                  </div>
                ` : ''}
                <div class="rbt-q-text" id="rbt-q-text-body">${qText}</div>
                ${q.image ? `
                  <div style="margin-top: 8px;">
                    <img src="${q.image}" id="rbt-q-img" alt="Hình minh họa"
                         style="max-height: 120px; max-width: 280px; border-radius: 10px; border: 1.5px solid #cbd5e1; cursor: zoom-in; object-fit: contain; background: #fff;"
                         title="Bấm để phóng to hình ảnh" />
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="rbt-q-controls">
              <button type="button" class="rbt-font-btn" id="rbt-font-dec" title="Giảm cỡ chữ">A-</button>
              <button type="button" class="rbt-font-btn" id="rbt-font-inc" title="Tăng cỡ chữ">A+</button>
              <div class="rbt-timer-ring">
                <svg width="44" height="44" viewBox="0 0 44 44" style="transform: rotate(-90deg);">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                  <circle id="rbt-timer-circle" cx="22" cy="22" r="18" fill="none" stroke="#22c55e" stroke-width="4"
                          stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - pct)}" stroke-linecap="round"
                          style="transition: stroke-dashoffset 0.3s linear, stroke 0.3s;"/>
                </svg>
                <span id="rbt-timer-num" style="position: absolute;">${timerSec}</span>
              </div>
            </div>
          </div>

          <div class="rbt-options-grid" id="rbt-options-grid">
            ${['A', 'B', 'C', 'D'].map((letter, idx) => {
              const optClean = formatQuestionOptionText(opts[idx] ?? '');
              return `
                <button type="button" class="rbt-opt-btn" data-opt-idx="${idx}">
                  <span style="display: flex; align-items: baseline; gap: 6px; min-width: 0;">
                    <b style="color: ${answeringTeam.color}; flex-shrink: 0;">${letter}.</b>
                    <span class="rbt-opt-math" style="word-break: break-word;">${optClean}</span>
                  </span>
                  <span class="rbt-opt-mark" style="font-weight: 900; font-size: 16px; flex-shrink: 0;"></span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      triggerMathRender(document.getElementById('rbt-question-card'));

      // Image zoom support
      const qImg = document.getElementById('rbt-q-img');
      if (qImg && q.image) {
        qImg.addEventListener('click', () => {
          if (global.ZoomPanOverlay && typeof global.ZoomPanOverlay.open === 'function') {
            global.ZoomPanOverlay.open(q.image, `Câu ${(currentQIdx % rawQuestions.length) + 1}`);
          }
        });
      }

      document.getElementById('rbt-font-dec')?.addEventListener('click', () => {
        questionFontSize = Math.max(15, questionFontSize - 2);
        const card = document.getElementById('rbt-question-card');
        if (card) card.style.setProperty('--rbt-q-font-size', `${questionFontSize}px`);
      });

      document.getElementById('rbt-font-inc')?.addEventListener('click', () => {
        questionFontSize = Math.min(30, questionFontSize + 2);
        const card = document.getElementById('rbt-question-card');
        if (card) card.style.setProperty('--rbt-q-font-size', `${questionFontSize}px`);
      });

      overlay.querySelectorAll('.rbt-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pickedIdx = parseInt(btn.dataset.optIdx, 10);
          handleQuestionAnswer(pickedIdx);
        });
      });
    }

    function handleQuestionAnswer(pickedIdx) {
      clearTimer();
      const q = rawQuestions[currentQIdx % rawQuestions.length];
      const correctIdx = typeof q.correctIndex === 'number'
        ? q.correctIndex
        : (q.correctAnswer ? Math.max(0, 'ABCD'.indexOf(String(q.correctAnswer).toUpperCase())) : 0);

      const isCorrect = (pickedIdx === correctIdx);
      const buttons = document.querySelectorAll('.rbt-opt-btn');
      buttons.forEach(b => { b.disabled = true; });

      if (pickedIdx >= 0 && buttons[pickedIdx]) {
        const markEl = buttons[pickedIdx].querySelector('.rbt-opt-mark');
        if (isCorrect) {
          buttons[pickedIdx].classList.add('correct');
          if (markEl) markEl.textContent = '✓';
        } else {
          buttons[pickedIdx].classList.add('wrong');
          if (markEl) markEl.textContent = '✗';
        }
      }

      const answeringTeam = teams[answeringTeamIdx];

      if (isCorrect) {
        if (global.soundFx) global.soundFx.correct();
        // Award energy (+2 pin on correct answer so skills can be used immediately, matching video)
        const pinGain = currentQIdx === 0 && stealAttemptCount === 0 ? 1 : 2;
        answeringTeam.energy += pinGain;
        answeringTeam.correctCount += 1;

        updateTopbar();
        renderStageUnits();
        spawnFloatingText(answeringTeamIdx, `⚡ +${pinGain} pin`, '#16a34a');

        setTimeout(() => {
          if (destroyed) return;
          currentQIdx++;
          activeTeamIdx = answeringTeamIdx;
          phase = 'action';
          updateTopbar();
          renderStageUnits();
          renderOverlay();
        }, 780);
      } else {
        if (global.soundFx) global.soundFx.wrong();
        // Wrong answer penalty: -5 HP overload if past Round 1 (or -5 HP self-backfire as seen in video Q6 & Q7)
        if (currentQIdx >= teamCount) {
          answeringTeam.hp = Math.max(1, answeringTeam.hp - 5);
          const unitEl = document.getElementById(`rbt-unit-${answeringTeamIdx}`);
          if (unitEl) {
            unitEl.classList.remove('hit-shake');
            void unitEl.offsetWidth;
            unitEl.classList.add('hit-shake');
          }
          spawnFloatingText(answeringTeamIdx, `-5 ❤️`, '#ef4444');
        } else {
          spawnFloatingText(answeringTeamIdx, `Sai rồi!`, '#ef4444');
        }

        updateTopbar();
        renderStageUnits();

        setTimeout(() => {
          if (destroyed) return;
          const livingCount = getLivingTeams().length;
          // In Round 2+ (after initial round), allow stealing the question up to livingCount - 1 times (matching video Q6 & Q7!)
          if (currentQIdx >= teamCount && stealAttemptCount < livingCount - 1) {
            stealAttemptCount++;
            answeringTeamIdx = getNextLivingTeamIdx(answeringTeamIdx);
            timerSec = Math.max(15, secondsPerQuestion - 5);
            updateTopbar();
            renderStageUnits();
            renderOverlay();
            startQuestionTimer();
          } else {
            // Move to next question & next team's turn
            currentQIdx++;
            const nextTeam = getNextLivingTeamIdx(activeTeamIdx);
            startTurnQuestion(nextTeam);
          }
        }, 850);
      }
    }

    // =========================================================================
    // 4. ACTION DOCK & TARGET SELECTION MODAL (Matches frame_025s, 061s, 085s)
    // =========================================================================
    function renderActionDockOverlay(overlay) {
      const actor = teams[answeringTeamIdx];
      const attackSkills = [SKILLS.punch, SKILLS.laser, SKILLS.rocket, SKILLS.ultimate];
      const defenseSkills = [SKILLS.shield, SKILLS.heal];

      overlay.innerHTML = `
        <div class="rbt-action-dock" style="--dock-team-bg: ${actor.lightBg}; --dock-team-border: ${actor.borderColor};">
          <!-- Left Team & Pin Box -->
          <div class="rbt-dock-team-box">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: #0f172a;">
              ${renderHexGemSvg(actor.color, 15)}
              <span>${actor.name}</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 4px; color: #d97706; font-weight: 900;">
              <span style="font-size: 15px;">⚡</span>
              <span style="font-size: 24px; line-height: 1;">${actor.energy}</span>
              <span style="font-size: 12px; font-weight: 700; color: #64748b;">pin</span>
            </div>
          </div>

          <!-- Middle Attack Skills Group -->
          <div class="rbt-dock-group attack">
            <div class="rbt-dock-group-title">Tấn công</div>
            <div class="rbt-dock-skills-row">
              ${attackSkills.map(sk => {
                const canAfford = actor.energy >= sk.cost;
                return `
                  <button type="button" class="rbt-skill-btn" data-skill-id="${sk.id}" ${!canAfford ? 'disabled' : ''} title="${sk.desc}">
                    <span class="rbt-skill-cost">⚡${sk.cost}</span>
                    ${sk.iconSvg}
                    <span class="rbt-skill-label">${sk.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Defense Skills Group -->
          <div class="rbt-dock-group defense">
            <div class="rbt-dock-group-title">Phòng thủ</div>
            <div class="rbt-dock-skills-row">
              ${defenseSkills.map(sk => {
                const canAfford = actor.energy >= sk.cost;
                const healFull = sk.id === 'heal' && actor.hp >= actor.maxHp;
                const disabled = !canAfford || healFull;
                return `
                  <button type="button" class="rbt-skill-btn" data-skill-id="${sk.id}" ${disabled ? 'disabled' : ''} title="${sk.desc}">
                    <span class="rbt-skill-cost">⚡${sk.cost}</span>
                    ${sk.iconSvg}
                    <span class="rbt-skill-label">${sk.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- End Turn Button -->
          <button type="button" class="rbt-end-turn-btn" id="rbt-btn-end-turn">
            <span style="font-size: 15px;">▶</span>
            <span style="line-height: 1.25;">Kết thúc<br>lượt</span>
          </button>
        </div>
      `;

      overlay.querySelectorAll('.rbt-skill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const skId = btn.dataset.skillId;
          const sk = SKILLS[skId];
          if (!sk || actor.energy < sk.cost) return;

          if (sk.type === 'defense') {
            executeDefenseSkill(sk);
          } else {
            selectedSkill = sk;
            phase = 'target';
            renderOverlay();
          }
        });
      });

      document.getElementById('rbt-btn-end-turn')?.addEventListener('click', () => {
        if (global.soundFx) global.soundFx.tick();
        advanceToNextTurn();
      });
    }

    // Target Selection Modal (Matches frame_061s.jpg 100%)
    function renderTargetSelectionModal(overlay) {
      if (!selectedSkill) return;
      const opponents = getActiveTeams().filter((t, idx) => idx !== answeringTeamIdx && t.alive && t.hp > 0);

      // If only 1 opponent is alive in a 2-team match, still show the modal just like the original game so the user can see and click the target!
      const modalWrap = document.createElement('div');
      modalWrap.className = 'rbt-modal-backdrop';
      modalWrap.style.background = 'rgba(15, 23, 42, 0.25)';
      modalWrap.innerHTML = `
        <div class="rbt-modal-card" style="max-width: 650px; padding: 26px 30px;">
          <h2 style="font-size: 23px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">Chọn robot để tấn công</h2>
          <p style="font-size: 13.5px; color: #64748b; font-weight: 700; margin-bottom: 20px;">${selectedSkill.desc}</p>

          <div style="display: grid; grid-template-columns: repeat(${Math.min(3, Math.max(1, opponents.length))}, 1fr); gap: 14px; margin-bottom: 18px;">
            ${opponents.map(opp => {
              const hpPct = Math.max(0, Math.min(100, Math.round((opp.hp / opp.maxHp) * 100)));
              return `
                <button type="button" class="rbt-target-card" data-target-idx="${opp.id}"
                        style="background: ${opp.lightBg}; border: 2px solid ${opp.borderColor}; border-radius: 16px; padding: 16px 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.16s ease; font-family: inherit;">
                  ${renderRobotHeadIconSvg(opp.color, 42)}
                  <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${opp.name}</div>
                  <div style="width: 100%; height: 8px; background: #1e293b; border-radius: 999px; overflow: hidden;">
                    <div style="width: ${hpPct}%; height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 999px;"></div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; font-weight: 800;">
                    <span style="color: #ef4444;">❤️ ${opp.hp}</span>
                    <span style="color: #0ea5e9;">🛡️ ${opp.shield}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <button type="button" id="rbt-cancel-target" style="border: none; background: transparent; color: #64748b; font-size: 14px; font-weight: 800; cursor: pointer; padding: 6px 16px;">
            Huỷ
          </button>
        </div>
      `;

      overlay.appendChild(modalWrap);

      modalWrap.querySelectorAll('.rbt-target-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-3px)';
          card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });
        card.addEventListener('click', () => {
          const targetIdx = parseInt(card.dataset.targetIdx, 10);
          executeAttackSkill(selectedSkill, targetIdx);
        });
      });

      document.getElementById('rbt-cancel-target')?.addEventListener('click', () => {
        selectedSkill = null;
        phase = 'action';
        renderOverlay();
      });
    }

    // =========================================================================
    // 5. SKILL EXECUTION & VISUAL EFFECTS (Punch, Laser, Rocket, Ultimate, Shield, Heal)
    // =========================================================================
    function executeDefenseSkill(skill) {
      const actor = teams[answeringTeamIdx];
      actor.energy = Math.max(0, actor.energy - skill.cost);

      if (skill.id === 'shield') {
        playRobotSfx('shield');
        actor.shield += skill.shieldGain;
        spawnFloatingText(answeringTeamIdx, `🛡️ +${skill.shieldGain} giáp`, '#0284c7');
      } else if (skill.id === 'heal') {
        playRobotSfx('heal');
        const oldHp = actor.hp;
        actor.hp = Math.min(actor.maxHp, actor.hp + skill.healGain);
        const gained = actor.hp - oldHp;
        spawnFloatingText(answeringTeamIdx, `❤️ +${gained} máu`, '#16a34a');
      }

      updateTopbar();
      renderStageUnits();
      renderOverlay();
    }

    function executeAttackSkill(skill, targetIdx) {
      const attacker = teams[answeringTeamIdx];
      const defender = teams[targetIdx];
      if (!attacker || !defender) return;

      attacker.energy = Math.max(0, attacker.energy - skill.cost);
      selectedSkill = null;
      phase = 'animating';
      updateTopbar();
      renderOverlay();

      playRobotSfx(skill.id);

      const slots = STAGE_SLOTS[teamCount] || STAGE_SLOTS[4];
      const srcSlot = slots[answeringTeamIdx];
      const dstSlot = slots[targetIdx];
      const fxLayer = document.getElementById('rbt-fx-layer');
      const attackerUnit = document.getElementById(`rbt-unit-${answeringTeamIdx}`);
      const defenderUnit = document.getElementById(`rbt-unit-${targetIdx}`);

      // Convert % coordinates to SVG viewBox (1908 x 806)
      const x1 = (srcSlot.left / 100) * 1908;
      const y1 = (srcSlot.top / 100) * 806 + 15;
      const x2 = (dstSlot.left / 100) * 1908;
      const y2 = (dstSlot.top / 100) * 806 + 20;

      if (skill.id === 'punch' && attackerUnit) {
        // Lunge toward target and punch
        const dxPct = (dstSlot.left - srcSlot.left) * 0.48;
        const dyPct = (dstSlot.top - srcSlot.top) * 0.48;
        attackerUnit.style.zIndex = '32';
        attackerUnit.style.transform = `translate(calc(-50% + ${dxPct}vw), calc(-50% + ${dyPct}vh)) scale(1.12)`;
        setTimeout(() => {
          if (attackerUnit) {
            attackerUnit.style.transform = 'translate(-50%, -50%)';
            attackerUnit.style.zIndex = String(srcSlot.zIndex);
          }
        }, 420);
      }

      if (fxLayer) {
        if (skill.id === 'laser') {
          // Glowing red/cyan laser beam just like f_63.20s.jpg!
          fxLayer.innerHTML = `
            <defs>
              <filter id="laserGlow">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${attacker.color}" stroke-width="22" stroke-linecap="round" opacity="0.55" filter="url(#laserGlow)"/>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
            <circle cx="${x1}" cy="${y1}" r="26" fill="#ffffff" stroke="${attacker.color}" stroke-width="8" filter="url(#laserGlow)"/>
            <circle cx="${x2}" cy="${y2}" r="34" fill="#fef08a" stroke="${attacker.color}" stroke-width="8" filter="url(#laserGlow)"/>
          `;
        } else if (skill.id === 'rocket') {
          fxLayer.innerHTML = `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f97316" stroke-width="10" stroke-dasharray="18 10" stroke-linecap="round" opacity="0.8"/>
            <circle cx="${x2}" cy="${y2}" r="58" fill="rgba(249, 115, 22, 0.45)" stroke="#ef4444" stroke-width="6"/>
            <circle cx="${x2}" cy="${y2}" r="30" fill="#fef08a"/>
          `;
        } else if (skill.id === 'ultimate') {
          fxLayer.innerHTML = `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#a855f7" stroke-width="30" stroke-linecap="round" opacity="0.5"/>
            <line x1="${x2}" y1="0" x2="${x2}" y2="${y2}" stroke="#facc15" stroke-width="26" stroke-linecap="round" opacity="0.75"/>
            <line x1="${x2}" y1="0" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
            <circle cx="${x2}" cy="${y2}" r="78" fill="rgba(250, 204, 21, 0.45)" stroke="#f43f5e" stroke-width="8"/>
          `;
        } else {
          // Punch impact burst
          fxLayer.innerHTML = `
            <circle cx="${x2}" cy="${y2}" r="42" fill="rgba(251, 191, 36, 0.55)" stroke="#ef4444" stroke-width="5"/>
          `;
        }
      }

      setTimeout(() => {
        if (destroyed) return;
        if (fxLayer) fxLayer.innerHTML = '';

        // Compute damage with shield & armor pierce
        const rawDmg = skill.damage;
        let hpDamage = rawDmg;
        let shieldAbsorbed = 0;

        if (defender.shield > 0 && skill.pierce < 1.0) {
          const blockableDmg = Math.round(rawDmg * (1.0 - skill.pierce));
          const piercedDmg = rawDmg - blockableDmg;
          shieldAbsorbed = Math.min(defender.shield, blockableDmg);
          defender.shield -= shieldAbsorbed;
          hpDamage = piercedDmg + (blockableDmg - shieldAbsorbed);
        }

        defender.hp = Math.max(0, defender.hp - hpDamage);
        attacker.damageDealt += hpDamage;

        if (defender.hp <= 0) {
          defender.alive = false;
        }

        updateTopbar();
        renderStageUnits();

        const newDefUnit = document.getElementById(`rbt-unit-${targetIdx}`);
        if (newDefUnit) {
          newDefUnit.classList.add('hit-shake');
        }

        if (shieldAbsorbed > 0) {
          spawnFloatingText(targetIdx, `-${hpDamage} ❤️ (-${shieldAbsorbed} 🛡️)`, '#ef4444');
        } else {
          spawnFloatingText(targetIdx, `-${hpDamage} ❤️`, '#ef4444');
        }

        setTimeout(() => {
          if (destroyed) return;
          // Check if only 1 team remains alive!
          if (getLivingTeams().length <= 1) {
            showVictoryModal();
            return;
          }
          // Return to Action Dock so player can spend any remaining pin or click Kết thúc lượt (matching frame_065s.jpg!)
          phase = 'action';
          renderOverlay();
        }, 520);
      }, 420);
    }

    function advanceToNextTurn() {
      if (getLivingTeams().length <= 1) {
        showVictoryModal();
        return;
      }
      const nextTeamIdx = getNextLivingTeamIdx(activeTeamIdx);
      startTurnQuestion(nextTeamIdx);
    }

    // =========================================================================
    // 6. VICTORY MODAL
    // =========================================================================
    function showVictoryModal() {
      clearTimer();
      phase = 'victory';
      if (global.soundFx) global.soundFx.fanfare();
      updateTopbar();
      renderStageUnits();
      renderOverlay();
    }

    function renderVictoryOverlay(overlay) {
      const ranked = [...getActiveTeams()].sort((a, b) => {
        if (b.hp !== a.hp) return b.hp - a.hp;
        if (b.damageDealt !== a.damageDealt) return b.damageDealt - a.damageDealt;
        return b.correctCount - a.correctCount;
      });
      const winner = ranked[0];

      overlay.innerHTML = `
        <div class="rbt-modal-backdrop">
          <div class="rbt-modal-card" style="max-width: 580px;">
            <div style="font-size: 62px; line-height: 1; margin-bottom: 10px;">🏆</div>
            <h1 style="font-size: 30px; font-weight: 900; color: #0f172a; margin-bottom: 6px;">CHIẾN THẮNG VÕ ĐÀI!</h1>
            <p style="font-size: 16px; font-weight: 800; color: ${winner.color}; margin-bottom: 20px;">
              🎉 Chúc mừng ${winner.name} dẫn đầu Đại Chiến Robot!
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; text-align: left;">
              ${ranked.map((t, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 14px; background: ${idx === 0 ? t.lightBg : '#f8fafc'}; border: 2px solid ${idx === 0 ? t.color : '#e2e8f0'};">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px; font-weight: 900; width: 28px;">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    ${renderHexGemSvg(t.color, 20)}
                    <span style="font-size: 15px; font-weight: 900; color: #0f172a;">${t.name}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 14px; font-size: 13px; font-weight: 800;">
                    <span style="color: #ef4444;">❤️ ${t.hp} HP</span>
                    <span style="color: #0ea5e9;">🛡️ ${t.shield}</span>
                    <span style="color: #16a34a;">✓ ${t.correctCount} câu</span>
                    <span style="color: #f97316;">💥 ${t.damageDealt} ST</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; justify-content: center; gap: 12px;">
              <button type="button" id="rbt-btn-replay" style="padding: 12px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f172a; font-size: 15px; font-weight: 900; cursor: pointer;">
                🔄 Chơi lại trận mới
              </button>
              <button type="button" id="rbt-btn-close-end" style="padding: 12px 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #334155; font-size: 15px; font-weight: 800; cursor: pointer;">
                📋 Về danh sách
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('rbt-btn-replay')?.addEventListener('click', () => {
        teams.forEach((t, idx) => {
          t.hp = 100;
          t.shield = 0;
          t.energy = 0;
          t.alive = true;
          t.damageDealt = 0;
          t.correctCount = 0;
        });
        currentQIdx = 0;
        phase = 'setup';
        renderShell();
      });

      document.getElementById('rbt-btn-close-end')?.addEventListener('click', () => {
        cleanupAndExit();
      });
    }

    function cleanupAndExit() {
      destroyed = true;
      clearTimer();
      if (typeof options.onExit === 'function') {
        options.onExit();
      } else {
        container.innerHTML = '';
      }
    }

    // Initial launch
    renderShell();

    return function cleanup() {
      destroyed = true;
      clearTimer();
    };
  }

  global.launchDaiChienRobotGame = launchDaiChienRobotGame;

})(typeof window !== 'undefined' ? window : this);
