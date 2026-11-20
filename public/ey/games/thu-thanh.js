// ==============================================================================
// TRÒ CHƠI THỦ THÀNH (CASTLE DEFENSE) - BATTLE ARENA ĐỐI KHÁNG 2-4 ĐỘI
// Chuẩn xác 100% đồ hoạ và cơ chế gốc PomyAI (https://pomyai.com/gv/tro-choi/thu-thanh)
// Tích hợp hiển thị đề thi iMath / Azota (Công thức Toán KaTeX, Phóng to ảnh, Cỡ chữ A+/A-)
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  // 1. INJECT STYLES
  function injectStyles() {
    if (document.getElementById('thu-thanh-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'thu-thanh-styles';
    styleEl.textContent = `
      .castle-stage {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        z-index: 99999 !important;
        user-select: none;
        -webkit-user-select: none;
        font-family: 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #8ec5fc;
        display: flex;
        flex-direction: column;
      }

      /* Battlefield Background */
      .castle-battlefield {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background-color: #88c2f8;
        background-image: url(/ey/games/thu-thanh/bg_fairytale_world.webp);
        background-size: cover;
        background-position: center bottom;
        overflow: hidden;
      }

      /* Parallax Sun Rays */
      .castle-sun-rays {
        position: absolute;
        top: 0;
        right: 0;
        width: 50vw;
        height: 50vw;
        max-width: 700px;
        max-height: 700px;
        background: radial-gradient(circle at 85% 20%, rgba(255, 255, 230, 0.45) 0%, rgba(255, 230, 150, 0.2) 35%, transparent 70%);
        pointer-events: none;
      }

      /* Top Status Bar */
      .castle-topbar {
        position: relative;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 18px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        border-bottom: 2px solid #e2e8f0;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      }

      .castle-teams-track {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow-x: auto;
      }

      .castle-team-pill {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 180px;
        max-width: 380px;
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 6px 12px;
        transition: all 0.25s ease;
        position: relative;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .castle-team-pill.active {
        border-color: var(--t-color, #3b82f6);
        background: color-mix(in srgb, var(--t-color, #3b82f6) 6%, #ffffff);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--t-color, #3b82f6) 28%, transparent);
        transform: translateY(-2px);
      }

      .castle-team-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }

      .castle-team-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        font-size: 14px;
        color: #1e293b;
      }

      .castle-team-turn-badge {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
        padding: 2px 8px;
        border-radius: 6px;
        letter-spacing: 0.05em;
        animation: turn-pulse 1.4s infinite ease-in-out;
      }
      @keyframes turn-pulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.06); filter: brightness(1.15); }
      }

      .castle-hp-outer {
        position: relative;
        width: 100%;
        height: 12px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
      }

      .castle-hp-inner {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        transition: width 0.4s ease, background 0.3s;
      }
      .castle-hp-inner.mid {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }
      .castle-hp-inner.low {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .castle-hp-text {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        font-weight: 800;
        color: #475569;
      }

      .castle-actions-bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .castle-btn-util {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        background: #f8fafc;
        border: 1.5px solid #cbd5e1;
        border-radius: 9px;
        color: #334155;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .castle-btn-util:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
        transform: translateY(-1px);
      }

      /* Castles on Ground */
      .castle-arena-zone {
        position: absolute;
        inset: 0;
        top: 60px;
        pointer-events: none;
      }

      .castle-entity {
        position: absolute;
        bottom: 7%;
        width: clamp(240px, 26vw, 360px);
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.2s ease, opacity 0.5s ease;
        pointer-events: auto;
      }

      .castle-entity.shake {
        animation: castle-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      @keyframes castle-shake {
        10%, 90% { transform: translate(calc(-50% - 7px), -3px) rotate(-1deg); }
        20%, 80% { transform: translate(calc(-50% + 8px), 4px) rotate(1.2deg); }
        30%, 50%, 70% { transform: translate(calc(-50% - 9px), -4px) rotate(-1deg); }
        40%, 60% { transform: translate(calc(-50% + 7px), 3px) rotate(0.8deg); }
      }

      .castle-header-floating {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        width: 100%;
      }

      .castle-crown {
        font-size: 26px;
        line-height: 1;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
        animation: crown-bounce 1.5s infinite ease-in-out;
      }
      @keyframes crown-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }

      .castle-ribbon {
        background: var(--t-color, #3b82f6);
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        padding: 4px 18px;
        border-radius: 999px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        letter-spacing: 0.03em;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .castle-pillar-hp {
        width: 130px;
        height: 16px;
        background: rgba(15, 23, 42, 0.85);
        border: 2px solid #ffffff;
        border-radius: 999px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      }

      .castle-pillar-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        transition: width 0.35s ease;
      }
      .castle-pillar-hp-val {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
        text-shadow: 0 1px 2px #000;
      }

      .castle-graphic-box {
        position: relative;
        width: 100%;
        aspect-ratio: 390 / 440;
      }

      .castle-sprite-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.25));
        transition: opacity 0.4s ease;
      }

      .castle-damaged-overlay {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }
      .castle-damaged-overlay.visible {
        opacity: 1;
      }

      .castle-rubble-box {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
      }
      .castle-rubble-box.visible {
        display: flex;
      }
      .castle-rubble-img {
        width: 90%;
        height: 90%;
        object-fit: contain;
        filter: drop-shadow(0 10px 14px rgba(0,0,0,0.3));
      }

      /* Damage Floater Numbers */
      .castle-dmg-float {
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, 0);
        font-size: clamp(48px, 6vw, 78px);
        font-weight: 900;
        color: #ff3b30;
        -webkit-text-stroke: 4px #4a0000;
        paint-order: stroke fill;
        text-shadow: 0 8px 18px rgba(0,0,0,0.6), 0 0 30px #ff3b3080;
        pointer-events: none;
        z-index: 60;
        animation: dmg-float-anim 1.2s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
      }
      .castle-dmg-float.heal {
        color: #22c55e;
        -webkit-text-stroke: 4px #064e3b;
        text-shadow: 0 8px 18px rgba(0,0,0,0.6), 0 0 30px #22c55e80;
      }
      @keyframes dmg-float-anim {
        0% { opacity: 0; transform: translate(-50%, 20px) scale(0.6); }
        25% { opacity: 1; transform: translate(-50%, -10px) scale(1.25); }
        70% { opacity: 1; transform: translate(-50%, -35px) scale(1.05); }
        100% { opacity: 0; transform: translate(-50%, -60px) scale(0.9); }
      }

      /* Sky Big Announcement */
      .castle-sky-announcement {
        position: absolute;
        top: 14%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 28px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 100%);
        border: 3px solid #f59e0b;
        border-radius: 999px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25), 0 0 30px rgba(245, 158, 11, 0.5);
        font-size: clamp(26px, 3.4vw, 42px);
        font-weight: 900;
        color: #d97706;
        -webkit-text-stroke: 1.5px #78350f;
        paint-order: stroke fill;
        text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 55;
        animation: announcement-in 2.2s cubic-bezier(0.18, 0.9, 0.25, 1.3) forwards;
        pointer-events: none;
      }
      @keyframes announcement-in {
        0% { opacity: 0; transform: translate(-50%, -80px) scale(0.7); }
        15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        25% { transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -70px) scale(0.85); }
      }

      /* FX Canvas for Ballistics, Projectiles, Particles */
      .castle-fx-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 50;
      }

      /* Action Selection Modal */
      .castle-action-modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(940px, 94vw);
        max-height: 92vh;
        background: #ffffff;
        border-radius: 24px;
        padding: 22px 28px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05);
        z-index: 70;
        display: flex;
        flex-direction: column;
        animation: modal-pop 0.3s cubic-bezier(0.18, 0.9, 0.3, 1.3);
      }
      @keyframes modal-pop {
        0% { opacity: 0; transform: translate(-50%, -46%) scale(0.92); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      .castle-action-modal-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        margin-bottom: 16px;
      }

      .castle-action-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 900;
        color: var(--t-color, #3b82f6);
      }

      .castle-action-sub {
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        margin-top: 2px;
      }

      .castle-action-tabs {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 12px;
        width: fit-content;
      }

      .castle-action-tab {
        padding: 7px 24px;
        border-radius: 9px;
        font-weight: 800;
        font-size: 14px;
        color: #64748b;
        cursor: pointer;
        border: none;
        background: transparent;
        transition: all 0.18s ease;
      }
      .castle-action-tab.active {
        background: #ffffff;
        color: #1e293b;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
      }

      .castle-weapons-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin: 14px 0 10px;
        overflow-y: auto;
      }
      @media (max-width: 768px) {
        .castle-weapons-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .castle-col-category {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .castle-col-badge {
        padding: 6px 10px;
        border-radius: 10px;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .castle-col-badge.nhan_biet { background: #22c55e; }
      .castle-col-badge.thong_hieu { background: #3b82f6; }
      .castle-col-badge.van_dung { background: #f59e0b; }
      .castle-col-badge.van_dung_cao { background: #ef4444; }

      .castle-weapon-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px 10px;
        border-radius: 16px;
        border: 2px solid #e2e8f0;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.18, 0.9, 0.3, 1.2);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
      }
      .castle-weapon-card:hover {
        transform: translateY(-4px);
        border-color: #3b82f6;
        box-shadow: 0 10px 22px rgba(59, 130, 246, 0.2);
      }

      .castle-weapon-icon-box {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        position: relative;
      }
      .castle-weapon-icon-box img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .castle-weapon-name {
        font-size: 13px;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 6px;
        text-align: center;
      }

      .castle-weapon-dmg {
        background: #ef4444;
        color: #ffffff;
        font-size: 12px;
        font-weight: 900;
        padding: 2px 10px;
        border-radius: 999px;
      }
      .castle-weapon-dmg.heal {
        background: #10b981;
      }

      .castle-modal-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;
      }

      .castle-btn-skip {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: color 0.15s;
      }
      .castle-btn-skip:hover {
        color: #0f172a;
        text-decoration: underline;
      }

      /* Target Castle Selection Overlay (when > 2 teams) */
      .castle-target-prompt {
        position: absolute;
        top: 24%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.85);
        color: #ffffff;
        font-size: 18px;
        font-weight: 800;
        padding: 10px 24px;
        border-radius: 999px;
        z-index: 65;
        border: 2px solid #f59e0b;
        animation: turn-pulse 1.2s infinite ease-in-out;
        pointer-events: none;
      }

      /* iMath Question Modal */
      .castle-q-modal {
        position: absolute;
        top: 4%;
        left: 50%;
        transform: translateX(-50%);
        width: min(880px, 94vw);
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        border: 2px solid #cbd5e1;
        border-radius: 20px;
        padding: 18px 24px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        z-index: 80;
        display: flex;
        flex-direction: column;
        gap: 14px;
        animation: q-pop 0.3s cubic-bezier(0.18, 0.9, 0.3, 1.3);
      }
      @keyframes q-pop {
        0% { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
        100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }

      .castle-q-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .castle-q-badges {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .castle-q-num-badge {
        background: #3b82f6;
        color: #ffffff;
        font-size: 13px;
        font-weight: 900;
        padding: 4px 12px;
        border-radius: 8px;
        letter-spacing: 0.05em;
      }

      .castle-q-team-badge {
        font-size: 14px;
        font-weight: 800;
        color: var(--t-color, #3b82f6);
      }

      .castle-q-action-badge {
        font-size: 12.5px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 8px;
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .castle-q-level-badge {
        font-size: 12px;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 8px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }

      .castle-q-tools {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .castle-q-font-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        color: #334155;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .castle-q-font-btn:hover {
        background: #e2e8f0;
      }

      .castle-timer-ring-box {
        position: relative;
        width: 42px;
        height: 42px;
      }
      .castle-timer-ring-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .castle-timer-ring-bg {
        fill: none;
        stroke: #e2e8f0;
        stroke-width: 3.5;
      }
      .castle-timer-ring-bar {
        fill: none;
        stroke: #22c55e;
        stroke-width: 3.5;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.25s linear, stroke 0.3s;
      }
      .castle-timer-number {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 900;
        color: #0f172a;
      }

      .castle-q-body {
        font-size: var(--q-font-size, 18px);
        font-weight: 700;
        color: #1e293b;
        line-height: 1.5;
      }

      .castle-q-img-wrap {
        margin-top: 8px;
        max-height: 220px;
        display: flex;
        justify-content: center;
      }
      .castle-q-img {
        max-height: 220px;
        max-width: 100%;
        object-fit: contain;
        border-radius: 12px;
        border: 1.5px solid #e2e8f0;
        cursor: zoom-in;
        transition: transform 0.2s;
      }
      .castle-q-img:hover {
        transform: scale(1.02);
      }

      .castle-options-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-top: 6px;
      }
      @media (max-width: 900px) {
        .castle-options-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .castle-opt-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: #ffffff;
        color: #1e293b;
        font-size: var(--opt-font-size, 16px);
        font-weight: 700;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
      }
      .castle-opt-btn:not(:disabled):hover {
        border-color: #3b82f6;
        background: #f8fafc;
        transform: translateY(-2px);
      }
      .castle-opt-btn:disabled {
        cursor: default;
      }
      .castle-opt-btn.is-correct {
        background: rgba(34, 197, 94, 0.16) !important;
        border-color: #22c55e !important;
        color: #15803d !important;
      }
      .castle-opt-btn.is-wrong {
        background: rgba(239, 68, 68, 0.16) !important;
        border-color: #ef4444 !important;
        color: #b91c1c !important;
      }
      .castle-opt-btn.is-locked {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }
      .castle-opt-letter {
        color: #3b82f6;
        font-weight: 900;
        margin-right: 4px;
      }
      .castle-opt-mark {
        font-weight: 900;
        font-size: 16px;
      }

      /* Setup Modal */
      .castle-setup-card {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(540px, 92vw);
        background: #ffffff;
        border-radius: 28px;
        padding: 32px 30px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .castle-setup-icon-crest {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, #fef08a, #facc15);
        border: 4px solid #ffffff;
        box-shadow: 0 6px 18px rgba(250, 204, 21, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        margin-top: -64px;
        margin-bottom: 12px;
      }

      .castle-setup-title {
        font-size: 24px;
        font-weight: 900;
        color: #0f172a;
      }

      .castle-setup-sub {
        font-size: 14px;
        color: #64748b;
        margin: 4px 0 18px;
      }

      .castle-setup-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
        width: 100%;
      }

      .castle-team-count-btn {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 2px solid #cbd5e1;
        background: #ffffff;
        font-size: 18px;
        font-weight: 900;
        color: #334155;
        cursor: pointer;
        transition: all 0.15s;
      }
      .castle-team-count-btn.active {
        background: #facc15;
        border-color: #eab308;
        color: #713f12;
        box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
        transform: scale(1.05);
      }

      .castle-setup-team-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        width: 100%;
        margin-bottom: 24px;
      }

      .castle-setup-input-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 2px solid var(--t-color);
        background: color-mix(in srgb, var(--t-color) 6%, #ffffff);
      }

      .castle-setup-color-swatch {
        width: 18px;
        height: 18px;
        border-radius: 6px;
        background: var(--t-color);
      }

      .castle-setup-input {
        flex: 1;
        border: none;
        background: transparent;
        font-weight: 800;
        font-size: 14px;
        color: #0f172a;
        outline: none;
      }

      .castle-btn-start {
        width: 200px;
        padding: 12px 24px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, #facc15, #eab308);
        color: #713f12;
        font-size: 17px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(234, 179, 8, 0.45);
        transition: all 0.2s cubic-bezier(0.18, 0.9, 0.3, 1.2);
      }
      .castle-btn-start:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 12px 28px rgba(234, 179, 8, 0.55);
      }

      /* Countdown Overlay */
      .castle-countdown-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        z-index: 90;
        pointer-events: none;
      }

      .castle-count-num {
        font-size: clamp(140px, 26vw, 260px);
        font-weight: 900;
        color: #facc15;
        -webkit-text-stroke: 6px #78350f;
        paint-order: stroke fill;
        text-shadow: 0 12px 0 #451a03, 0 0 50px rgba(250, 204, 21, 0.85);
        animation: count-pop 0.85s cubic-bezier(0.2, 0.9, 0.25, 1.3) both;
      }
      @keyframes count-pop {
        0% { opacity: 0; transform: scale(2.2); }
        35% { opacity: 1; transform: scale(0.94); }
        60% { transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }

      .castle-ready-text {
        font-size: clamp(52px, 10vw, 110px);
        font-weight: 900;
        color: #facc15;
        -webkit-text-stroke: 5px #78350f;
        paint-order: stroke fill;
        text-shadow: 0 10px 0 #451a03, 0 0 60px rgba(250, 204, 21, 0.9);
        letter-spacing: 0.05em;
        animation: count-pop 0.65s cubic-bezier(0.2, 0.9, 0.25, 1.3) both;
      }

      /* Victory Modal */
      .castle-victory-modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(560px, 92vw);
        background: #ffffff;
        border-radius: 28px;
        padding: 36px 32px 28px;
        box-shadow: 0 35px 90px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.05);
        z-index: 120;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        animation: modal-pop 0.4s cubic-bezier(0.18, 0.9, 0.3, 1.3);
      }

      .castle-victory-rays {
        position: absolute;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        width: 320px;
        height: 320px;
        background: repeating-conic-gradient(rgba(250, 204, 21, 0.3) 0deg 9deg, transparent 9deg 22deg);
        border-radius: 50%;
        pointer-events: none;
        animation: rays-spin 25s linear infinite;
        mask: radial-gradient(circle, #000 20%, transparent 70%);
        -webkit-mask: radial-gradient(circle, #000 20%, transparent 70%);
      }
      @keyframes rays-spin {
        from { transform: translateX(-50%) rotate(0deg); }
        to { transform: translateX(-50%) rotate(360deg); }
      }

      .castle-victory-trophy {
        font-size: 82px;
        line-height: 1;
        position: relative;
        filter: drop-shadow(0 10px 18px rgba(245, 158, 11, 0.5));
        margin-bottom: 8px;
      }

      .castle-victory-title {
        font-size: 32px;
        font-weight: 900;
        color: #0f172a;
        margin-bottom: 20px;
      }

      .castle-leaderboard {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 26px;
      }

      .castle-leader-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 18px;
        border-radius: 14px;
        border: 2px solid #e2e8f0;
        background: #f8fafc;
      }
      .castle-leader-row.is-winner {
        border-color: #facc15;
        background: #fefce8;
        box-shadow: 0 4px 14px rgba(250, 204, 21, 0.25);
      }

      .castle-leader-team {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        font-size: 16px;
        color: #0f172a;
      }

      .castle-leader-stat {
        font-weight: 800;
        font-size: 15px;
        color: #475569;
      }

      .castle-victory-actions {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .castle-btn-replay {
        padding: 12px 28px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, #facc15, #eab308);
        color: #713f12;
        font-size: 15px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(234, 179, 8, 0.4);
      }

      .castle-btn-back {
        padding: 12px 24px;
        border-radius: 999px;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        color: #334155;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
      }

      /* Lightbox Modal */
      .castle-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(8px);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        cursor: zoom-out;
      }
      .castle-lightbox img {
        max-width: 92vw;
        max-height: 92vh;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. WEAPONS DEFINITIONS
  const WEAPONS = [
    // Nhận biết (-16, -18, -20)
    { id: 'mui_ten_lua', name: 'Mũi tên lửa', dmg: 16, level: 'nhan_biet', icon: '/ey/games/thu-thanh/icon_mui_ten_lua.png', fx: 'arrow' },
    { id: 'da_nem', name: 'Đá ném', dmg: 18, level: 'nhan_biet', icon: '/ey/games/thu-thanh/icon_da_nem.png', fx: 'rock' },
    { id: 'than_cong', name: 'Thần công', dmg: 20, level: 'nhan_biet', icon: '/ey/games/thu-thanh/icon_than_cong.png', fx: 'cannon' },

    // Thông hiểu (-24, -28, -32)
    { id: 'cau_lua', name: 'Cầu lửa', dmg: 24, level: 'thong_hieu', icon: '/ey/games/thu-thanh/icon_cau_lua.png', fx: 'fireball' },
    { id: 'riu_bay', name: 'Rìu bay', dmg: 28, level: 'thong_hieu', icon: '/ey/games/thu-thanh/icon_riu_bay.png', fx: 'axe' },
    { id: 'bom_no', name: 'Bom nổ', dmg: 32, level: 'thong_hieu', icon: '/ey/games/thu-thanh/icon_bom_no.png', fx: 'bomb' },

    // Vận dụng (-38, -42, -46)
    { id: 'ten_lua', name: 'Tên lửa', dmg: 38, level: 'van_dung', icon: '/ey/games/thu-thanh/icon_ten_lua.png', fx: 'rocket' },
    { id: 'set_danh', name: 'Sét đánh', dmg: 42, level: 'van_dung', icon: '/ey/games/thu-thanh/icon_set_danh.png', fx: 'lightning' },
    { id: 'loc_xoay', name: 'Lốc xoáy', dmg: 46, level: 'van_dung', icon: '/ey/games/thu-thanh/icon_loc_xoay.png', fx: 'tornado' },

    // Vận dụng cao (-54, -62, -70)
    { id: 'mua_thien_thach', name: 'Mưa thiên thạch', dmg: 54, level: 'van_dung_cao', icon: '/ey/games/thu-thanh/icon_mua_thien_thach.png', fx: 'meteor' },
    { id: 'sieu_ten_lua', name: 'Siêu tên lửa', dmg: 62, level: 'van_dung_cao', icon: '/ey/games/thu-thanh/icon_sieu_ten_lua.png', fx: 'super_rocket' },
    { id: 'dong_dat', name: 'Động đất', dmg: 70, level: 'van_dung_cao', icon: '/ey/games/thu-thanh/icon_dong_dat.png', fx: 'earthquake' }
  ];

  const REPAIRS = [
    { id: 'sua_go', name: 'Gia cố tường gỗ', heal: 15, level: 'nhan_biet', icon: '🪵' },
    { id: 'sua_da', name: 'Gia cố đá tảng', heal: 25, level: 'thong_hieu', icon: '🧱' },
    { id: 'sua_thap', name: 'Sửa tháp canh', heal: 35, level: 'van_dung', icon: '🏰' },
    { id: 'dai_tu', name: 'Đại tu toàn thành', heal: 50, level: 'van_dung_cao', icon: '✨' }
  ];

  // 3. SOUND SYNTHESIS ENGINE (Offline reliable & Fallback safe)
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
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
    play(name) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      try {
        switch (name) {
          case 'click': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.05);
            break;
          }
          case 'countdown': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
            break;
          }
          case 'start': {
            [440, 554, 659, 880].forEach((f, i) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(f, t + i * 0.08);
              gain.gain.setValueAtTime(0.18, t + i * 0.08);
              gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + i * 0.08);
              osc.stop(t + i * 0.08 + 0.35);
            });
            break;
          }
          case 'correct': {
            [523, 659, 784, 1046].forEach((f, i) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, t + i * 0.09);
              gain.gain.setValueAtTime(0.22, t + i * 0.09);
              gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.22);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + i * 0.09);
              osc.stop(t + i * 0.09 + 0.22);
            });
            break;
          }
          case 'wrong': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.linearRampToValueAtTime(110, t + 0.3);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
            break;
          }
          case 'launch': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.45);
            break;
          }
          case 'explosion': {
            const bufSize = this.ctx.sampleRate * 0.5;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(700, t);
            filter.frequency.exponentialRampToValueAtTime(60, t + 0.5);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.5);
            break;
          }
          case 'earthquake': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(55, t);
            osc.frequency.linearRampToValueAtTime(35, t + 1.2);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.2);
            break;
          }
          case 'heal': {
            [440, 554, 659, 880, 1108].forEach((f, i) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, t + i * 0.07);
              gain.gain.setValueAtTime(0.18, t + i * 0.07);
              gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + i * 0.07);
              osc.stop(t + i * 0.07 + 0.25);
            });
            break;
          }
          case 'victory': {
            [523, 659, 784, 1046, 1318].forEach((f, i) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, t + i * 0.12);
              gain.gain.setValueAtTime(0.24, t + i * 0.12);
              gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.4);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + i * 0.12);
              osc.stop(t + i * 0.12 + 0.4);
            });
            break;
          }
        }
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  }

  // 4. MATH FORMULA FORMATTER (KaTeX Safe & Robust)
  function formatMath(text) {
    if (!text) return '';
    text = String(text);

    // Auto-repair known corrupted formulas if they were missing their variable
    if (text.includes('4 + 18 = 50') && !text.includes('$x')) {
      text = text.replace(/.*4\s*\+\s*18\s*=\s*50\$?/i, 'Tìm x, biết: $x \\times 4 + 18 = 50$');
    } else if (text.includes('12 - 20') && !text.includes('$3')) {
      text = text.replace(/.*12\s*-\s*20\$?/i, 'Tính giá trị của biểu thức: $3 \\times 12 - 20$');
    } else if (text.includes('5x + 6 = 0') && !text.includes('$x^2')) {
      text = text.replace(/.*5x\s*\+\s*6\s*=\s*0\$?/i, 'Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:');
    }

    // Fix corrupt string issues (missing x in "imes" or \t + "imes")
    text = text.replace(/(\b|[^\w\\])imes\b/gi, '$1\\times ');

    // Fix unbalanced single dollar, e.g. "Tìm x, biết: x \times 4 + 18 = 50$"
    const dollars = text.match(/\$/g) || [];
    if (dollars.length % 2 === 1) {
      if (text.endsWith('$')) {
        const colonIdx = text.lastIndexOf(':');
        if (colonIdx !== -1) {
          text = text.slice(0, colonIdx + 1) + ' $' + text.slice(colonIdx + 1);
        } else {
          text = '$' + text;
        }
      }
    }

    if (window.katex && typeof window.katex.renderToString === 'function') {
      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
      });
      text = text.replace(/\$([^\$\n]+?)\$/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
      });
      text = text.replace(/\\\(([\s\S]+?)\\\)/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
      });
      text = text.replace(/\\\[([\s\S]+?)\\\]/g, (m, f) => {
        try { return window.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
      });
    }

    // Safety fallback: convert common LaTeX operators if unrendered or outside KaTeX
    text = text.replace(/\\times/g, '×')
               .replace(/\\div/g, '÷')
               .replace(/\\pm/g, '±')
               .replace(/\\leq?/g, '≤')
               .replace(/\\geq?/g, '≥')
               .replace(/\\neq/g, '≠')
               .replace(/\\approx/g, '≈')
               .replace(/\\cdot/g, '·')
               .replace(/\$/g, '');

    return text;
  }

  // 5. LIGHTBOX MODAL FOR IMAGES
  function showImageLightbox(src) {
    let lb = document.getElementById('castle-lightbox-modal');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'castle-lightbox-modal';
      lb.className = 'castle-lightbox';
      lb.onclick = () => lb.remove();
      document.body.appendChild(lb);
    }
    lb.innerHTML = '<img src="' + src + '" alt="Ảnh phóng to" />';
  }

  // 6. MAIN GAME LAUNCHER
  global.launchThuThanhGame = function(container, options = {}) {
    injectStyles();

    const rawQuestions = (options.questions && options.questions.length > 0)
      ? options.questions
      : [
          // 6 câu Nhận biết
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3, level: "nhan_biet" },
          { text: "Số liền sau của số 99 là số nào?", options: ["98", "100", "101", "90"], correctIndex: 1, level: "nhan_biet" },
          { text: "Hình tam giác có bao nhiêu cạnh?", options: ["2", "3", "4", "5"], correctIndex: 1, level: "nhan_biet" },
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0, level: "nhan_biet" },
          { text: "Tháng nào sau đây luôn có 28 hoặc 29 ngày?", options: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"], correctIndex: 1, level: "nhan_biet" },
          { text: "1 mét bằng bao nhiêu xăng-ti-mét (cm)?", options: ["10cm", "100cm", "1000cm", "50cm"], correctIndex: 1, level: "nhan_biet" },

          // 6 câu Thông hiểu
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2, level: "thong_hieu" },
          { text: "Tính giá trị của biểu thức: $3 \\times 12 - 20$", options: ["16", "26", "36", "24"], correctIndex: 0, level: "thong_hieu" },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2, level: "thong_hieu" },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "37 quyển", "25 quyển", "29 quyển"], correctIndex: 0, level: "thong_hieu" },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1, level: "thong_hieu" },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0, level: "thong_hieu" },

          // 6 câu Vận dụng
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1, level: "van_dung" },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1, level: "van_dung" },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0, level: "van_dung" },
          { text: "Một hình chữ nhật có chu vi 32cm, chiều dài 10cm. Chiều rộng hình chữ nhật là:", options: ["6cm", "12cm", "8cm", "5cm"], correctIndex: 0, level: "van_dung" },
          { text: "Một hình vuông có chu vi bằng chu vi hình chữ nhật có chiều dài 14cm, chiều rộng 6cm. Diện tích hình vuông đó là:", options: ["100cm²", "64cm²", "84cm²", "40cm²"], correctIndex: 0, level: "van_dung" },
          { text: "Bác An nuôi 36 con gà và vịt, trong đó số vịt bằng $\\frac{1}{3}$ số gà. Số con gà bác An nuôi là:", options: ["27 con", "9 con", "24 con", "18 con"], correctIndex: 0, level: "van_dung" },

          // 6 câu Vận dụng cao
          { text: "Tìm x, biết: $x \\times 4 + 18 = 50$", options: ["6", "8", "7", "9"], correctIndex: 1, level: "van_dung_cao" },
          { text: "Có 48 cái kẹo chia đều vào 6 túi. Hỏi 4 túi như thế có bao nhiêu cái kẹo?", options: ["32 cái", "24 cái", "36 cái", "28 cái"], correctIndex: 0, level: "van_dung_cao" },
          { text: "Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:", options: ["-5", "5", "6", "-6"], correctIndex: 1, level: "van_dung_cao" },
          { text: "Năm nay mẹ 36 tuổi, con 9 tuổi. Hỏi sau bao nhiêu năm nữa tuổi mẹ gấp 3 lần tuổi con?", options: ["3 năm", "4 năm", "4.5 năm", "5 năm"], correctIndex: 2, level: "van_dung_cao" },
          { text: "Một bể nước có hai vòi cùng chảy. Vòi thứ nhất chảy một mình mất 3 giờ thì đầy bể, vòi thứ hai chảy một mình mất 6 giờ thì đầy bể. Hỏi cả hai vòi cùng chảy thì mất bao lâu để đầy bể?", options: ["2 giờ", "4.5 giờ", "1.5 giờ", "3 giờ"], correctIndex: 0, level: "van_dung_cao" },
          { text: "Một can dầu đựng đầy dầu cân nặng 20kg. Sau khi rót ra $\\frac{1}{2}$ lượng dầu thì can dầu cân nặng 11kg. Hỏi vỏ can rỗng cân nặng bao nhiêu ki-lô-gam?", options: ["2kg", "1kg", "3kg", "1.5kg"], correctIndex: 0, level: "van_dung_cao" }
        ];

    // Helper: Normalize question difficulty level
    function normalizeLevel(lvl, idx, total) {
      if (lvl) {
        const s = String(lvl).toLowerCase().trim().replace(/[- ]/g, '_');
        if (s === 'nhan_biet' || s === 'nb' || s === 'de' || s === 'easy' || s === '1' || s === 'biet') return 'nhan_biet';
        if (s === 'thong_hieu' || s === 'th' || s === 'trung_binh' || s === 'medium' || s === 'tb' || s === '2') return 'thong_hieu';
        if (s === 'van_dung' || s === 'vd' || s === 'kho' || s === 'hard' || s === '3') return 'van_dung';
        if (s === 'van_dung_cao' || s === 'vdc' || s === 'rat_kho' || s === 'very_hard' || s === '4') return 'van_dung_cao';
      }
      if (total > 0) {
        const ratio = idx / total;
        if (ratio < 0.25) return 'nhan_biet';
        if (ratio < 0.5) return 'thong_hieu';
        if (ratio < 0.75) return 'van_dung';
        return 'van_dung_cao';
      }
      return 'nhan_biet';
    }

    // Clean and normalize all questions
    const questions = rawQuestions.map((q, idx) => {
      let qText = q.text || q.stem || q.content || '';
      qText = qText.replace(/(\b|[^\w\\])imes\b/gi, '$1\\times ');
      if (qText.includes('\\times 4 + 18 = 50') && !qText.includes('$x')) {
        qText = 'Tìm x, biết: $x \\times 4 + 18 = 50$';
      } else if (qText.includes('\\times 12 - 20') && !qText.includes('$3')) {
        qText = 'Tính giá trị của biểu thức: $3 \\times 12 - 20$';
      } else if (qText.includes('^2 - 5x + 6 = 0') && !qText.includes('$x^2')) {
        qText = 'Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:';
      }

      return {
        ...q,
        text: qText,
        _level: normalizeLevel(q.level || q.difficulty, idx, rawQuestions.length),
        _index: idx
      };
    });

    const sound = new SoundEngine();

    // Default configuration
    let teamCount = options.teamCount || 2;
    let teams = [
      { id: 0, name: options.teamAName || 'Đội A', color: options.teamAColor || '#3b82f6', hp: 100, maxHp: 100, isAlive: true },
      { id: 1, name: options.teamBName || 'Đội B', color: options.teamBColor || '#ef4444', hp: 100, maxHp: 100, isAlive: true },
      { id: 2, name: 'Đội 3', color: '#10b981', hp: 100, maxHp: 100, isAlive: true },
      { id: 3, name: 'Đội 4', color: '#f59e0b', hp: 100, maxHp: 100, isAlive: true }
    ];

    let currentTurnTeamIdx = 0;
    let questionCounter = 0;
    let usedQuestionIndices = new Set();
    let currentQuestion = null;
    let answeringTeamIdx = 0;
    let activeAction = null; // selected weapon or repair
    let targetTeamIdx = 1;
    let timerSeconds = options.secondsPerQuestion || 30;
    let remainingTimer = timerSeconds;
    let timerInterval = null;
    let isPaused = false;
    let isGameOver = false;
    let questionFontSize = 18;
    let lockedOptions = new Set();

    // Pick a random unused question matching difficulty level
    function pickQuestionForLevel(targetLevel) {
      let unused = [];
      for (let i = 0; i < questions.length; i++) {
        if (!usedQuestionIndices.has(i)) {
          unused.push(i);
        }
      }

      // If all questions have appeared in this match, recycle the pool
      if (unused.length === 0) {
        usedQuestionIndices.clear();
        for (let i = 0; i < questions.length; i++) {
          unused.push(i);
        }
      }

      // 1. Try to find unused questions strictly matching targetLevel
      let candidates = unused.filter(i => questions[i]._level === targetLevel);

      // 2. Fallback to closest difficulty level if that level is exhausted
      if (candidates.length === 0) {
        const levelOrder = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
        const targetIdx = Math.max(0, levelOrder.indexOf(targetLevel));
        const sortedByDistance = [...unused].sort((a, b) => {
          const distA = Math.abs(levelOrder.indexOf(questions[a]._level) - targetIdx);
          const distB = Math.abs(levelOrder.indexOf(questions[b]._level) - targetIdx);
          return distA - distB;
        });
        const closestDist = Math.abs(levelOrder.indexOf(questions[sortedByDistance[0]]._level) - targetIdx);
        candidates = sortedByDistance.filter(i => Math.abs(levelOrder.indexOf(questions[i]._level) - targetIdx) === closestDist);
      }

      if (candidates.length === 0) {
        candidates = unused;
      }

      // 3. Pick RANDOMLY among available candidates
      const randomCandidateIdx = Math.floor(Math.random() * candidates.length);
      const chosenIdx = candidates[randomCandidateIdx];

      // Mark this question as USED immediately!
      // Guarantees it will never appear again for Team A, Team B, or any team in this match.
      usedQuestionIndices.add(chosenIdx);

      return questions[chosenIdx];
    }

    // Setup Stage DOM
    container.innerHTML = `
      <div class="castle-stage" id="castle-stage-root">
        <div class="castle-battlefield">
          <div class="castle-sun-rays"></div>
          <canvas class="castle-fx-canvas" id="castle-fx-canvas"></canvas>
          <div class="castle-arena-zone" id="castle-arena-zone"></div>
        </div>

        <div class="castle-topbar" id="castle-topbar">
          <div class="castle-teams-track" id="castle-teams-track"></div>
          <div class="castle-actions-bar">
            <button class="castle-btn-util" id="castle-btn-mute" title="Bật/Tắt âm thanh">🔊</button>
            <button class="castle-btn-util" id="castle-btn-fs" title="Toàn màn hình">⛶</button>
            <button class="castle-btn-util" id="castle-btn-pause">⏸ Tạm dừng</button>
            <button class="castle-btn-util" id="castle-btn-exit" style="color: #ef4444; border-color: #fca5a5;">✕ Kết thúc</button>
          </div>
        </div>

        <!-- Overlays container -->
        <div id="castle-overlays"></div>
      </div>
    `;

    const rootEl = container.querySelector('#castle-stage-root');
    const arenaZone = container.querySelector('#castle-arena-zone');
    const teamsTrack = container.querySelector('#castle-teams-track');
    const overlays = container.querySelector('#castle-overlays');
    const canvas = container.querySelector('#castle-fx-canvas');
    const ctx = canvas.getContext('2d');

    // Resize Canvas
    function resizeCanvas() {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 7. SETUP MODAL (Choose team count & names)
    function showSetupModal() {
      overlays.innerHTML = `
        <div class="castle-setup-card">
          <div class="castle-setup-icon-crest">🏰</div>
          <div class="castle-setup-title">Thiết lập trận thủ thành</div>
          <div class="castle-setup-sub">Chọn số đội, đặt tên và màu cờ cho từng lâu đài</div>

          <div class="castle-setup-row">
            <span style="font-weight: 800; color: #475569; font-size: 15px;">Số đội:</span>
            <button class="castle-team-count-btn ${teamCount === 2 ? 'active' : ''}" data-teams="2">2</button>
            <button class="castle-team-count-btn ${teamCount === 3 ? 'active' : ''}" data-teams="3">3</button>
            <button class="castle-team-count-btn ${teamCount === 4 ? 'active' : ''}" data-teams="4">4</button>
          </div>

          <div class="castle-setup-team-inputs" id="castle-setup-inputs-grid">
            ${teams.slice(0, teamCount).map(t => `
              <div class="castle-setup-input-box" style="--t-color: ${t.color};">
                <div class="castle-setup-color-swatch"></div>
                <input class="castle-setup-input" data-team-id="${t.id}" value="${t.name}" maxlength="18" />
              </div>
            `).join('')}
          </div>

          <button class="castle-btn-start" id="castle-btn-confirm-start">▶ Bắt đầu</button>
        </div>
      `;

      // Bind count switcher
      overlays.querySelectorAll('.castle-team-count-btn').forEach(btn => {
        btn.onclick = () => {
          sound.play('click');
          teamCount = parseInt(btn.dataset.teams, 10);
          showSetupModal();
        };
      });

      // Bind name inputs
      overlays.querySelectorAll('.castle-setup-input').forEach(inp => {
        inp.oninput = (e) => {
          const tid = parseInt(inp.dataset.teamId, 10);
          teams[tid].name = e.target.value.trim() || ('Đội ' + (tid + 1));
        };
      });

      // Start button
      overlays.querySelector('#castle-btn-confirm-start').onclick = () => {
        sound.init();
        sound.play('click');
        startMatch();
      };
    }

    // 8. START MATCH & COUNTDOWN
    function startMatch() {
      // Filter teams to count
      teams = teams.slice(0, teamCount);
      teams.forEach(t => {
        t.hp = 100;
        t.maxHp = 100;
        t.isAlive = true;
      });

      currentTurnTeamIdx = 0;
      questionCounter = 0;
      usedQuestionIndices.clear();
      isGameOver = false;
      renderTopBar();
      renderArenaCastles();

      // Show countdown: 3 -> 2 -> 1 -> SẴN SÀNG!
      let count = 3;
      overlays.innerHTML = `
        <div class="castle-countdown-overlay">
          <div class="castle-count-num" id="castle-countdown-box">3</div>
        </div>
      `;
      sound.play('countdown');

      const cdBox = overlays.querySelector('#castle-countdown-box');
      const cdTimer = setInterval(() => {
        count--;
        if (count > 0) {
          cdBox.className = '';
          void cdBox.offsetWidth; // trigger reflow
          cdBox.className = 'castle-count-num';
          cdBox.textContent = count;
          sound.play('countdown');
        } else if (count === 0) {
          cdBox.className = 'castle-ready-text';
          cdBox.textContent = '⚔️ SẴN SÀNG! ⚔️';
          sound.play('start');
        } else {
          clearInterval(cdTimer);
          overlays.innerHTML = '';
          startTurn();
        }
      }, 950);
    }

    // 9. RENDER TOP STATUS BAR
    function renderTopBar() {
      teamsTrack.innerHTML = teams.map((t, idx) => {
        const isCurrentTurn = (idx === currentTurnTeamIdx && !isGameOver);
        const hpPercent = Math.max(0, Math.min(100, t.hp));
        const hpClass = hpPercent > 50 ? '' : (hpPercent > 25 ? 'mid' : 'low');

        return `
          <div class="castle-team-pill ${isCurrentTurn ? 'active' : ''}" style="--t-color: ${t.color}; opacity: ${t.isAlive ? 1 : 0.45};">
            <div class="castle-team-head">
              <div class="castle-team-title">
                <span>🏰</span>
                <span>${t.name}</span>
              </div>
              ${isCurrentTurn ? '<div class="castle-team-turn-badge">▶ LƯỢT</div>' : ''}
            </div>
            <div class="castle-hp-outer">
              <div class="castle-hp-inner ${hpClass}" style="width: ${hpPercent}%;"></div>
              <div class="castle-hp-text">${t.isAlive ? (t.hp + '/100') : 'Bị phá huỷ 💀'}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 10. RENDER ARENA CASTLES
    function renderArenaCastles() {
      // Find current highest HP leader
      let highestHp = -1;
      let leaderIdx = -1;
      teams.forEach((t, i) => {
        if (t.isAlive && t.hp > highestHp) {
          highestHp = t.hp;
          leaderIdx = i;
        }
      });

      // Layout horizontal positions
      let positions = [];
      if (teamCount === 2) positions = [22, 78];
      else if (teamCount === 3) positions = [18, 50, 82];
      else positions = [14, 38, 62, 86];

      arenaZone.innerHTML = teams.map((t, i) => {
        const leftPercent = positions[i];
        const isLeader = (i === leaderIdx && t.isAlive && highestHp > 0);
        const isDamaged = (t.hp < 70 && t.hp > 0);
        const isDestroyed = (!t.isAlive || t.hp <= 0);

        // Castle sprite image source
        // Team A (blue) or Team B (red) or hue rotation
        const spriteSrc = (i === 0) ? '/ey/games/thu-thanh/crop_castle_a.png' : '/ey/games/thu-thanh/crop_castle_b.png';
        const filterStyle = (i === 2) ? 'filter: hue-rotate(95deg) drop-shadow(0 14px 20px rgba(0,0,0,0.25));'
                          : (i === 3) ? 'filter: hue-rotate(180deg) drop-shadow(0 14px 20px rgba(0,0,0,0.25));'
                          : 'filter: drop-shadow(0 14px 20px rgba(0,0,0,0.25));';

        return `
          <div class="castle-entity" id="castle-entity-${t.id}" style="left: ${leftPercent}%; --t-color: ${t.color};">
            <div class="castle-header-floating">
              <div class="castle-crown" style="visibility: ${isLeader ? 'visible' : 'hidden'};">👑</div>
              <div class="castle-ribbon" style="background: ${t.color};">${t.name}</div>
              <div class="castle-pillar-hp">
                <div class="castle-pillar-hp-fill" style="width: ${Math.max(0, t.hp)}%;"></div>
                <div class="castle-pillar-hp-val">${Math.max(0, t.hp)}</div>
              </div>
            </div>

            <div class="castle-graphic-box">
              <!-- Standing Castle -->
              <img class="castle-sprite-img" src="${spriteSrc}" alt="Lâu đài ${t.name}" style="${filterStyle} display: ${isDestroyed ? 'none' : 'block'};" />

              <!-- Damaged Castle Overlay -->
              <img class="castle-damaged-overlay ${isDamaged ? 'visible' : ''}" src="/ey/games/thu-thanh/crop_castle_damaged.png" alt="Thành nứt vỡ" />

              <!-- Destroyed Rubble -->
              <div class="castle-rubble-box ${isDestroyed ? 'visible' : ''}">
                <img class="castle-rubble-img" src="/ey/games/thu-thanh/crop_castle_rubble.png" alt="Thành sụp đổ" />
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 11. START TURN: Active team chooses Action
    function startTurn() {
      if (isGameOver) return;

      // Skip dead teams
      if (!teams[currentTurnTeamIdx].isAlive) {
        nextTurn();
        return;
      }

      renderTopBar();
      renderArenaCastles();
      showActionSelectionModal();
    }

    // 12. SHOW ACTION SELECTION MODAL
    function showActionSelectionModal() {
      const activeTeam = teams[currentTurnTeamIdx];
      let activeTab = 'attack'; // 'attack' or 'repair'

      function renderModalContent() {
        overlays.innerHTML = `
          <div class="castle-action-modal">
            <div class="castle-action-modal-header">
              <div class="castle-action-title" style="color: ${activeTeam.color};">
                <span>🏰</span>
                <span>${activeTeam.name}</span>
              </div>
              <div class="castle-action-sub">Chọn vũ khí tấn công hoặc sửa thành</div>

              <div class="castle-action-tabs">
                <button class="castle-action-tab ${activeTab === 'attack' ? 'active' : ''}" id="castle-tab-attack">⚔ Bắn</button>
                <button class="castle-action-tab ${activeTab === 'repair' ? 'active' : ''}" id="castle-tab-repair">🔧 Sửa</button>
              </div>
            </div>

            ${activeTab === 'attack' ? renderWeaponsGrid() : renderRepairsGrid()}

            <div class="castle-modal-footer">
              <button class="castle-btn-skip" id="castle-btn-skip-turn">Bỏ lượt</button>
            </div>
          </div>
        `;

        // Bind tabs
        overlays.querySelector('#castle-tab-attack').onclick = () => {
          sound.play('click');
          activeTab = 'attack';
          renderModalContent();
        };
        overlays.querySelector('#castle-tab-repair').onclick = () => {
          sound.play('click');
          activeTab = 'repair';
          renderModalContent();
        };

        // Bind weapon cards
        overlays.querySelectorAll('.castle-weapon-card').forEach(card => {
          card.onclick = () => {
            sound.play('click');
            const wid = card.dataset.weaponId;
            const repId = card.dataset.repairId;

            if (wid) {
              activeAction = { type: 'attack', weapon: WEAPONS.find(w => w.id === wid) };
            } else if (repId) {
              activeAction = { type: 'repair', repair: REPAIRS.find(r => r.id === repId) };
            }

            overlays.innerHTML = '';

            // If attack and teamCount > 2: prompt for target selection
            if (activeAction.type === 'attack' && teamCount > 2) {
              promptTargetSelection();
            } else {
              // Default target for 2 teams is opponent
              targetTeamIdx = (currentTurnTeamIdx === 0) ? 1 : 0;
              launchQuestionBanner();
            }
          };
        });

        // Skip turn
        overlays.querySelector('#castle-btn-skip-turn').onclick = () => {
          sound.play('click');
          overlays.innerHTML = '';
          nextTurn();
        };
      }

      function renderWeaponsGrid() {
        const categories = [
          { key: 'nhan_biet', label: 'Nhận biết', weapons: WEAPONS.filter(w => w.level === 'nhan_biet') },
          { key: 'thong_hieu', label: 'Thông hiểu', weapons: WEAPONS.filter(w => w.level === 'thong_hieu') },
          { key: 'van_dung', label: 'Vận dụng', weapons: WEAPONS.filter(w => w.level === 'van_dung') },
          { key: 'van_dung_cao', label: 'Vận dụng cao', weapons: WEAPONS.filter(w => w.level === 'van_dung_cao') }
        ];

        return `
          <div class="castle-weapons-grid">
            ${categories.map(cat => `
              <div class="castle-col-category">
                <div class="castle-col-badge ${cat.key}">${cat.label}</div>
                ${cat.weapons.map(w => `
                  <div class="castle-weapon-card" data-weapon-id="${w.id}">
                    <div class="castle-weapon-icon-box">
                      <img src="${w.icon}" alt="${w.name}" onerror="this.src='/ey/games/thu-thanh/crop_modal_full.png'" />
                    </div>
                    <div class="castle-weapon-name">${w.name}</div>
                    <div class="castle-weapon-dmg">-${w.dmg}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
      }

      function renderRepairsGrid() {
        return `
          <div class="castle-weapons-grid" style="grid-template-columns: repeat(4, 1fr);">
            ${REPAIRS.map(r => `
              <div class="castle-weapon-card" data-repair-id="${r.id}" style="padding: 24px 14px;">
                <div class="castle-weapon-icon-box" style="font-size: 38px; background: #ecfdf5;">
                  ${r.icon}
                </div>
                <div class="castle-weapon-name">${r.name}</div>
                <div class="castle-weapon-dmg heal">+${r.heal} HP</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      renderModalContent();
    }

    // 13. PROMPT TARGET SELECTION (for 3 or 4 teams)
    function promptTargetSelection() {
      overlays.innerHTML = `
        <div class="castle-target-prompt">🎯 Hãy nhấp chọn Lâu đài đối thủ muốn tấn công!</div>
      `;

      // Make enemy castles clickable with pulsing target reticle
      teams.forEach((t, idx) => {
        const entity = container.querySelector('#castle-entity-' + t.id);
        if (!entity) return;

        if (idx !== currentTurnTeamIdx && t.isAlive) {
          entity.style.cursor = 'crosshair';
          entity.style.filter = 'drop-shadow(0 0 16px #ef4444)';
          entity.onclick = () => {
            sound.play('click');
            targetTeamIdx = idx;
            // Clear click handlers
            teams.forEach(tm => {
              const el = container.querySelector('#castle-entity-' + tm.id);
              if (el) {
                el.style.cursor = 'default';
                el.style.filter = '';
                el.onclick = null;
              }
            });
            overlays.innerHTML = '';
            launchQuestionBanner();
          };
        }
      });
    }

    // 14. LAUNCH iMATH QUESTION BANNER
    function launchQuestionBanner() {
      answeringTeamIdx = currentTurnTeamIdx;
      lockedOptions.clear();
      questionCounter++;

      // Pick next question matching level of selected weapon or repair
      const qLevel = activeAction.weapon
        ? activeAction.weapon.level
        : (activeAction.repair ? activeAction.repair.level : 'nhan_biet');

      const matchedQ = pickQuestionForLevel(qLevel);
      currentQuestion = matchedQ;

      renderQuestionCard(matchedQ);
      startQuestionTimer(matchedQ);
    }

    // 15. RENDER QUESTION CARD
    function renderQuestionCard(q) {
      const team = teams[answeringTeamIdx];
      const qNum = questionCounter;
      const qText = formatMath(q.text || q.content || '');

      const levelLabels = {
        'nhan_biet': 'Nhận biết',
        'thong_hieu': 'Thông hiểu',
        'van_dung': 'Vận dụng',
        'van_dung_cao': 'Vận dụng cao'
      };
      const levelName = levelLabels[q._level] || 'Câu hỏi';

      let actionBadgeHtml = '';
      if (activeAction) {
        if (activeAction.type === 'attack' && activeAction.weapon) {
          actionBadgeHtml = `<div class="castle-q-action-badge">⚔️ ${activeAction.weapon.name} (-${activeAction.weapon.dmg} HP)</div>`;
        } else if (activeAction.type === 'repair' && activeAction.repair) {
          actionBadgeHtml = `<div class="castle-q-action-badge" style="background:#ecfdf5;color:#047857;border-color:#a7f3d0;">🔧 ${activeAction.repair.name} (+${activeAction.repair.heal} HP)</div>`;
        }
      }

      overlays.innerHTML = `
        <div class="castle-q-modal" style="--t-color: ${team.color};">
          <div class="castle-q-head">
            <div class="castle-q-badges">
              <div class="castle-q-num-badge">CÂU ${qNum}</div>
              <div class="castle-q-team-badge">${team.name}</div>
              ${actionBadgeHtml}
              <div class="castle-q-level-badge">${levelName}</div>
            </div>

            <div class="castle-q-tools">
              <button class="castle-q-font-btn" id="castle-btn-font-dec" title="Thu nhỏ chữ">A-</button>
              <button class="castle-q-font-btn" id="castle-btn-font-inc" title="Phóng to chữ">A+</button>

              <div class="castle-timer-ring-box">
                <svg class="castle-timer-ring-svg" viewBox="0 0 36 36">
                  <path class="castle-timer-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="castle-timer-ring-bar" id="castle-timer-progress-bar" stroke-dasharray="100, 100" stroke-dashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="castle-timer-number" id="castle-timer-display">${remainingTimer}</div>
              </div>

              <button class="castle-btn-util" id="castle-btn-q-close" style="padding: 4px 10px; font-size: 16px;">✕</button>
            </div>
          </div>

          <div class="castle-q-body" style="--q-font-size: ${questionFontSize}px;">
            ${qText}
          </div>

          ${q.image ? `
            <div class="castle-q-img-wrap">
              <img class="castle-q-img" src="${q.image}" alt="Hình câu hỏi" id="castle-q-diagram" />
            </div>
          ` : ''}

          <div class="castle-options-grid" style="--opt-font-size: ${Math.max(14, questionFontSize - 2)}px;">
            ${(q.options || []).map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const optText = formatMath(typeof opt === 'string' ? opt : (opt.text || ''));
              const isLocked = lockedOptions.has(optIdx);

              return `
                <button class="castle-opt-btn ${isLocked ? 'is-locked' : ''}" data-opt-idx="${optIdx}" ${isLocked ? 'disabled' : ''}>
                  <div>
                    <span class="castle-opt-letter">${letter}.</span>
                    <span>${optText}</span>
                  </div>
                  <span class="castle-opt-mark" id="castle-opt-mark-${optIdx}"></span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      if (window.FileParser && typeof window.FileParser.renderMath === 'function') {
        window.FileParser.renderMath(overlays);
      }

      // Font zoom
      overlays.querySelector('#castle-btn-font-inc').onclick = () => {
        questionFontSize = Math.min(32, questionFontSize + 2);
        renderQuestionCard(q);
      };
      overlays.querySelector('#castle-btn-font-dec').onclick = () => {
        questionFontSize = Math.max(14, questionFontSize - 2);
        renderQuestionCard(q);
      };

      // Diagram lightbox
      const diag = overlays.querySelector('#castle-q-diagram');
      if (diag) {
        diag.onclick = () => showImageLightbox(q.image);
      }

      // Close question button
      overlays.querySelector('#castle-btn-q-close').onclick = () => {
        stopQuestionTimer();
        overlays.innerHTML = '';
        nextTurn();
      };

      // Option click handlers
      overlays.querySelectorAll('.castle-opt-btn').forEach(btn => {
        btn.onclick = () => {
          const optIdx = parseInt(btn.dataset.optIdx, 10);
          handleAnswerSelection(q, optIdx, btn);
        };
      });
    }

    // 16. START TIMER
    function startQuestionTimer(q) {
      stopQuestionTimer();
      remainingTimer = timerSeconds;

      const timerBar = overlays.querySelector('#castle-timer-progress-bar');
      const timerDisplay = overlays.querySelector('#castle-timer-display');

      timerInterval = setInterval(() => {
        if (isPaused) return;

        remainingTimer--;
        if (timerDisplay) timerDisplay.textContent = remainingTimer;

        if (timerBar) {
          const pct = (remainingTimer / timerSeconds) * 100;
          timerBar.style.strokeDashoffset = (100 - pct);
          if (pct < 30) timerBar.style.stroke = '#ef4444';
          else if (pct < 60) timerBar.style.stroke = '#f59e0b';
          else timerBar.style.stroke = '#22c55e';
        }

        if (remainingTimer <= 0) {
          stopQuestionTimer();
          handleTimeout(q);
        }
      }, 1000);
    }

    function stopQuestionTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    // 17. ANSWER SELECTION HANDLER
    function handleAnswerSelection(q, selectedIdx, btnEl) {
      stopQuestionTimer();
      const markEl = overlays.querySelector('#castle-opt-mark-' + selectedIdx);

      // Determine correct index
      const correctIdx = (typeof q.correctIndex === 'number') ? q.correctIndex
        : (typeof q.correct === 'number' ? q.correct
        : (typeof q.answer === 'string' ? ['A','B','C','D'].indexOf(q.answer.trim().toUpperCase()) : 0));

      // Disable all buttons temporarily
      overlays.querySelectorAll('.castle-opt-btn').forEach(b => b.disabled = true);

      if (selectedIdx === correctIdx) {
        // === CORRECT ANSWER ===
        btnEl.classList.add('is-correct');
        if (markEl) markEl.textContent = '✓';
        sound.play('correct');

        setTimeout(() => {
          overlays.innerHTML = '';
          executeActionSuccess();
        }, 1100);
      } else {
        // === INCORRECT ANSWER ===
        btnEl.classList.add('is-wrong');
        if (markEl) markEl.textContent = '✕';
        lockedOptions.add(selectedIdx);
        sound.play('wrong');

        // Penalty -15 HP to answering team!
        const penalTeam = teams[answeringTeamIdx];
        penalTeam.hp = Math.max(0, penalTeam.hp - 15);
        if (penalTeam.hp === 0) penalTeam.isAlive = false;

        showSkyAnnouncement(penalTeam.name + ' TRẢ LỜI SAI! -15 HP');
        showDamageFloater(penalTeam.id, -15);
        renderTopBar();
        renderArenaCastles();

        // Reveal correct answer
        const correctBtn = overlays.querySelector('.castle-opt-btn[data-opt-idx="' + correctIdx + '"]');
        if (correctBtn) {
          correctBtn.classList.add('is-correct');
          const cMark = correctBtn.querySelector('.castle-opt-mark');
          if (cMark) cMark.textContent = '✓';
        }

        // Check if alive teams <= 1
        const aliveTeams = teams.filter(t => t.isAlive);
        if (aliveTeams.length <= 1) {
          setTimeout(() => {
            overlays.innerHTML = '';
            showVictoryModal(aliveTeams[0] || teams[0]);
          }, 1800);
          return;
        }

        // Question has appeared and is marked used. Turn passes to the next team!
        setTimeout(() => {
          overlays.innerHTML = '';
          nextTurn();
        }, 1800);
      }
    }

    // 18. TIMEOUT HANDLER
    function handleTimeout(q) {
      sound.play('wrong');
      const correctIdx = (typeof q.correctIndex === 'number') ? q.correctIndex : 0;
      const correctBtn = overlays.querySelector('.castle-opt-btn[data-opt-idx="' + correctIdx + '"]');
      if (correctBtn) {
        correctBtn.classList.add('is-correct');
        const cMark = correctBtn.querySelector('.castle-opt-mark');
        if (cMark) cMark.textContent = '✓';
      }

      const penalTeam = teams[answeringTeamIdx];
      penalTeam.hp = Math.max(0, penalTeam.hp - 10);
      if (penalTeam.hp === 0) penalTeam.isAlive = false;

      showSkyAnnouncement(penalTeam.name + ' HẾT THỜI GIAN! -10 HP');
      showDamageFloater(penalTeam.id, -10);
      renderTopBar();
      renderArenaCastles();

      const aliveTeams = teams.filter(t => t.isAlive);
      if (aliveTeams.length <= 1) {
        setTimeout(() => {
          overlays.innerHTML = '';
          showVictoryModal(aliveTeams[0] || teams[0]);
        }, 1800);
        return;
      }

      setTimeout(() => {
        overlays.innerHTML = '';
        nextTurn();
      }, 1800);
    }

    // 19. EXECUTE ACTION SUCCESS (Projectile & Damage or Repair)
    function executeActionSuccess() {

      if (activeAction.type === 'repair') {
        // === REPAIR ACTION ===
        const rep = activeAction.repair;
        const curTeam = teams[answeringTeamIdx];
        curTeam.hp = Math.min(100, curTeam.hp + rep.heal);

        showSkyAnnouncement(rep.name.toUpperCase() + '! +' + rep.heal);
        sound.play('heal');
        showDamageFloater(curTeam.id, '+' + rep.heal, true);
        renderTopBar();
        renderArenaCastles();

        setTimeout(() => nextTurn(), 2200);
      } else {
        // === ATTACK ACTION ===
        const wpn = activeAction.weapon;
        const attackerTeam = teams[answeringTeamIdx];
        let targetTeam = teams[targetTeamIdx];
        if (targetTeam.id === attackerTeam.id) {
          targetTeam = teams.find(t => t.id !== attackerTeam.id && t.isAlive) || teams[0];
        }

        showSkyAnnouncement(wpn.name.toUpperCase() + '! -' + wpn.dmg);
        sound.play('launch');

        // Play projectile animation from attacker to target
        playProjectileAnimation(attackerTeam.id, targetTeam.id, wpn, () => {
          // Impact: damage target
          targetTeam.hp = Math.max(0, targetTeam.hp - wpn.dmg);
          if (targetTeam.hp === 0) targetTeam.isAlive = false;

          sound.play('explosion');
          shakeCastle(targetTeam.id);
          showDamageFloater(targetTeam.id, '-' + wpn.dmg);
          renderTopBar();
          renderArenaCastles();

          // Check Win Condition
          const aliveTeams = teams.filter(t => t.isAlive);
          if (aliveTeams.length <= 1) {
            setTimeout(() => showVictoryModal(aliveTeams[0] || attackerTeam), 1600);
          } else {
            setTimeout(() => nextTurn(), 1800);
          }
        });
      }
    }

    // 20. PROJECTILE ANIMATION ENGINE (Canvas Physics)
    function playProjectileAnimation(fromId, toId, weapon, onComplete) {
      const fromEl = container.querySelector('#castle-entity-' + fromId);
      const toEl = container.querySelector('#castle-entity-' + toId);
      if (!fromEl || !toEl) {
        if (onComplete) onComplete();
        return;
      }

      const rFrom = fromEl.getBoundingClientRect();
      const rTo = toEl.getBoundingClientRect();
      const cRect = canvas.getBoundingClientRect();

      const startX = rFrom.left + rFrom.width / 2 - cRect.left;
      const startY = rFrom.top + rFrom.height * 0.45 - cRect.top;
      const endX = rTo.left + rTo.width / 2 - cRect.left;
      const endY = rTo.top + rTo.height * 0.5 - cRect.top;

      let startTime = null;
      const duration = (weapon.fx === 'earthquake' || weapon.fx === 'tornado') ? 1400 : 900;

      // Special Earthquake Effect
      if (weapon.fx === 'earthquake') {
        sound.play('earthquake');
        let progress = 0;
        const eqAnim = () => {
          progress += 0.035;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw crack jagged line along ground
          const curX = startX + (endX - startX) * Math.min(1, progress);
          const groundY = startY + (endY - startY) * 0.85;

          ctx.beginPath();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 18;

          let segX = startX;
          ctx.moveTo(segX, groundY);
          while (segX < curX) {
            segX += 20;
            const offsetY = (Math.random() - 0.5) * 16;
            ctx.lineTo(Math.min(curX, segX), groundY + offsetY);
          }
          ctx.stroke();

          if (progress < 1) {
            requestAnimationFrame(eqAnim);
          } else {
            setTimeout(() => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (onComplete) onComplete();
            }, 300);
          }
        };
        requestAnimationFrame(eqAnim);
        return;
      }

      // Parabolic Arc Projectile Animation
      const animFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(1, elapsed / duration);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Parabola coordinates
        const curX = startX + (endX - startX) * t;
        const heightArc = Math.sin(t * Math.PI) * 220;
        const curY = (startY + (endY - startY) * t) - heightArc;

        // Draw projectile
        ctx.save();
        ctx.translate(curX, curY);

        if (weapon.fx === 'meteor') {
          // Flaming meteor
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
        } else if (weapon.fx === 'rocket' || weapon.fx === 'super_rocket') {
          // Missile
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (weapon.fx === 'fireball') {
          // Fireball
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 28;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Cannonball / Arrow / Rocks
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (t < 1) {
          requestAnimationFrame(animFrame);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animFrame);
    }

    // 21. SKY ANNOUNCEMENT BANNER
    function showSkyAnnouncement(text) {
      const banner = document.createElement('div');
      banner.className = 'castle-sky-announcement';
      banner.innerHTML = '<span>💥</span> <span>' + text + '</span>';
      rootEl.appendChild(banner);
      setTimeout(() => banner.remove(), 2400);
    }

    // 22. SHAKE CASTLE
    function shakeCastle(teamId) {
      const el = container.querySelector('#castle-entity-' + teamId);
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 550);
      }
    }

    // 23. DAMAGE FLOATER
    function showDamageFloater(teamId, text, isHeal = false) {
      const el = container.querySelector('#castle-entity-' + teamId);
      if (!el) return;

      const floater = document.createElement('div');
      floater.className = 'castle-dmg-float ' + (isHeal ? 'heal' : '');
      floater.textContent = text;
      el.appendChild(floater);
      setTimeout(() => floater.remove(), 1300);
    }

    // 24. NEXT TURN
    function nextTurn() {
      // Rotate turn to next alive team
      let loops = 0;
      do {
        currentTurnTeamIdx = (currentTurnTeamIdx + 1) % teamCount;
        loops++;
      } while (!teams[currentTurnTeamIdx].isAlive && loops <= teamCount);

      const aliveTeams = teams.filter(t => t.isAlive);
      if (aliveTeams.length <= 1) {
        showVictoryModal(aliveTeams[0] || teams[0]);
      } else {
        startTurn();
      }
    }

    // 25. VICTORY MODAL
    function showVictoryModal(winner) {
      isGameOver = true;
      stopQuestionTimer();
      sound.play('victory');

      // Sort teams by HP descending
      const ranked = [...teams].sort((a, b) => b.hp - a.hp);

      overlays.innerHTML = `
        <div class="castle-victory-modal">
          <div class="castle-victory-rays"></div>
          <div class="castle-victory-trophy">🏆</div>
          <div class="castle-victory-title">${winner.name} chiến thắng!</div>

          <div class="castle-leaderboard">
            ${ranked.map((t, idx) => {
              const isWin = (t.id === winner.id);
              const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '🎖️'));

              return `
                <div class="castle-leader-row ${isWin ? 'is-winner' : ''}">
                  <div class="castle-leader-team">
                    <span>${t.isAlive ? medal : '💀'}</span>
                    <span style="color: ${t.color};">${t.name}</span>
                  </div>
                  <div class="castle-leader-stat">
                    ${t.isAlive ? (t.hp + ' máu') : 'Bị phá huỷ'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="castle-victory-actions">
            <button class="castle-btn-replay" id="castle-btn-replay">Chơi lại</button>
            <button class="castle-btn-back" id="castle-btn-back-lobby">Về danh sách</button>
          </div>
        </div>
      `;

      overlays.querySelector('#castle-btn-replay').onclick = () => {
        sound.play('click');
        startMatch();
      };

      overlays.querySelector('#castle-btn-back-lobby').onclick = () => {
        sound.play('click');
        exitGame();
      };
    }

    // 26. UTILITY BUTTONS BINDING
    const muteBtn = container.querySelector('#castle-btn-mute');
    muteBtn.onclick = () => {
      sound.muted = !sound.muted;
      muteBtn.textContent = sound.muted ? '🔇' : '🔊';
    };

    const fsBtn = container.querySelector('#castle-btn-fs');
    fsBtn.onclick = () => {
      if (!document.fullscreenElement) {
        rootEl.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    const pauseBtn = container.querySelector('#castle-btn-pause');
    pauseBtn.onclick = () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng';
    };

    const exitBtn = container.querySelector('#castle-btn-exit');
    exitBtn.onclick = () => {
      if (confirm('Bạn có chắc chắn muốn kết thúc trận đấu và quay về sảnh?')) {
        exitGame();
      }
    };

    function exitGame() {
      stopQuestionTimer();
      window.removeEventListener('resize', resizeCanvas);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      container.innerHTML = '';
      if (typeof options.onExit === 'function') {
        options.onExit();
      }
    }

    // Launch setup modal to start!
    showSetupModal();

    // Return cleanup callback
    return () => {
      stopQuestionTimer();
      window.removeEventListener('resize', resizeCanvas);
    };
  };

})(window);
