// ==============================================================================
// TRÒ CHƠI CHIẾM ĐẤT (TERRITORY CLAIM ARENA) - BATTLE ARENA ĐỐI KHÁNG 2-4 ĐỘI
// Chuẩn xác 100% đồ họa và cơ chế gốc PomyAI (https://pomyai.com/gv/tro-choi/chiem-dat)
// Tích hợp hiển thị đề thi iMath / Azota (Công thức Toán KaTeX, Phóng to ảnh, Cỡ chữ A+/A-)
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lào Hùng Phong (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  // 1. INJECT STYLES
  function injectStyles() {
    if (document.getElementById('chiem-dat-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'chiem-dat-styles';
    styleEl.textContent = `
      .chiemdat-stage {
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
      .chiemdat-battlefield {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background-color: #88c2f8;
        background-image: url(/ey/games/chiem-dat/clean_bg.png);
        background-size: cover;
        background-position: center bottom;
        overflow: hidden;
      }

      /* Top Status Bar */
      .chiemdat-topbar {
        position: relative;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(8px);
        border-bottom: 2px solid #e2e8f0;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        height: 64px;
        box-sizing: border-box;
      }

      .chiemdat-teams-track {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow-x: auto;
      }

      .chiemdat-team-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 160px;
        max-width: 280px;
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 6px 14px;
        transition: all 0.25s ease;
        position: relative;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .chiemdat-team-pill.active {
        border-color: var(--t-color, #ef4444);
        background: color-mix(in srgb, var(--t-color, #ef4444) 8%, #ffffff);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--t-color, #ef4444) 30%, transparent);
        transform: translateY(-2px);
      }

      .chiemdat-team-score-circle {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--t-color, #ef4444);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 16px;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .chiemdat-team-meta {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }

      .chiemdat-team-title {
        font-weight: 800;
        font-size: 13.5px;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chiemdat-team-sub {
        font-size: 10.5px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .chiemdat-turn-tag {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 10.5px;
        font-weight: 900;
        padding: 2px 8px;
        border-radius: 6px;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.35);
        animation: pulseTurnBadge 1.2s infinite ease-in-out;
      }

      @keyframes pulseTurnBadge {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.06); opacity: 0.9; }
      }

      .chiemdat-top-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chiemdat-btn-util {
        padding: 7px 12px;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 9px;
        color: #334155;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .chiemdat-btn-util:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }

      .chiemdat-btn-danger {
        padding: 7px 16px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: none;
        border-radius: 9px;
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
        transition: all 0.15s ease;
      }
      .chiemdat-btn-danger:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-1px);
      }

      /* Turn Prompt Indicator */
      .chiemdat-turn-indicator {
        position: absolute;
        top: 76px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 35;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #ffffff;
        padding: 6px 18px;
        border-radius: 999px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
        font-size: 14px;
        font-weight: 800;
        border: 2px solid #e2e8f0;
        pointer-events: none;
        animation: floatDown 0.35s ease;
      }

      .chiemdat-turn-indicator-badge {
        color: #ffffff;
        padding: 3px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }

      .chiemdat-turn-indicator-text {
        color: #334155;
        font-size: 13.5px;
      }

      /* Board Container & 3D Perspective */
      .chiemdat-board-container {
        position: absolute;
        inset: 64px 0 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 900px;
        overflow: hidden;
        user-select: none;
      }

      .chiemdat-board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        width: min(84vw, 820px);
        max-height: calc(100vh - 120px);
        transform: rotateX(23deg) translateY(20px);
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
      }

      /* Individual Plot (3D Raised Bed) */
      .chiemdat-plot {
        aspect-ratio: 1.25 / 1;
        border-radius: 12px;
        position: relative;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        transform-style: preserve-3d;
        box-shadow: 0 6px 0 #8d5b24, 0 10px 18px rgba(0, 0, 0, 0.22);
        border: 3px solid #b87a3b;
        box-sizing: border-box;
        overflow: hidden;
      }

      .chiemdat-plot:not(.claimed):not(.locked):hover {
        transform: translateY(-8px) scale(1.04);
        box-shadow: 0 14px 0 #8d5b24, 0 18px 24px rgba(0, 0, 0, 0.28);
        border-color: #fde047;
      }

      .chiemdat-plot.selected {
        border-color: #facc15 !important;
        box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.7), 0 8px 0 #ca8a04, 0 14px 22px rgba(0, 0, 0, 0.35) !important;
        transform: translateY(-6px) scale(1.03) !important;
      }

      /* Plot Textures */
      .chiemdat-plot.plot-crops {
        background-color: #55b839;
        background-image: repeating-linear-gradient(
          90deg,
          #55b839 0px,
          #55b839 12px,
          #46a02d 12px,
          #46a02d 24px
        );
      }

      .chiemdat-plot.plot-wood {
        background-color: #d79c65;
        background-image: repeating-linear-gradient(
          90deg,
          #d79c65 0px,
          #d79c65 14px,
          #c98950 14px,
          #c98950 28px
        );
      }

      .chiemdat-plot.plot-lawn {
        background-color: #72cf44;
        background-image: linear-gradient(135deg, #78d748 0%, #68c43c 100%);
      }

      /* Plot Numbers */
      .chiemdat-plot-number {
        font-size: clamp(22px, 3.4vw, 36px);
        font-weight: 900;
        color: #ffffff;
        text-shadow: 2px 2px 0 #3e2723, -2px 2px 0 #3e2723, 2px -2px 0 #3e2723, -2px -2px 0 #3e2723, 0 4px 6px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      /* Bouncy Arrow over Active Plot */
      .chiemdat-active-arrow {
        position: absolute;
        top: -46px;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
        z-index: 25;
        animation: arrowBounce 1s infinite ease-in-out;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      }

      @keyframes arrowBounce {
        0%, 100% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, -12px); }
      }

      /* Claimed Plot States */
      .chiemdat-plot.claimed {
        cursor: default;
        animation: claimFlash 0.5s ease;
      }
      .chiemdat-plot.claimed-red {
        background-image: url(/ey/games/chiem-dat/tile_red.png) !important;
        background-size: cover !important;
        border-color: #ef4444 !important;
        box-shadow: 0 6px 0 #991b1b, 0 8px 16px rgba(239, 68, 68, 0.45) !important;
      }
      .chiemdat-plot.claimed-blue {
        background-image: url(/ey/games/chiem-dat/tile_blue.png) !important;
        background-size: cover !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 6px 0 #1e40af, 0 8px 16px rgba(59, 130, 246, 0.45) !important;
      }
      .chiemdat-plot.claimed-yellow {
        background-image: url(/ey/games/chiem-dat/tile_yellow.png) !important;
        background-size: cover !important;
        border-color: #f59e0b !important;
        box-shadow: 0 6px 0 #b45309, 0 8px 16px rgba(245, 158, 11, 0.45) !important;
      }
      .chiemdat-plot.claimed-green {
        background-image: url(/ey/games/chiem-dat/tile_green.png) !important;
        background-size: cover !important;
        border-color: #10b981 !important;
        box-shadow: 0 6px 0 #065f46, 0 8px 16px rgba(16, 185, 129, 0.45) !important;
      }

      .chiemdat-claimed-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(0, 0, 0, 0.5);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
      }

      @keyframes claimFlash {
        0% { transform: scale(0.9) translateY(-6px); filter: brightness(1.5); }
        50% { transform: scale(1.08) translateY(-10px); filter: brightness(1.8); }
        100% { transform: scale(1) translateY(0); filter: brightness(1); }
      }

      /* Locked Plot State */
      .chiemdat-plot.locked {
        background: #94a3b8 !important;
        border-color: #64748b !important;
        box-shadow: 0 6px 0 #475569, 0 8px 14px rgba(0, 0, 0, 0.2) !important;
        cursor: not-allowed;
      }
      .chiemdat-locked-padlock {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      .chiemdat-locked-padlock img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
      }

      /* Question Modal Overlay */
      .chiemdat-q-overlay {
        position: absolute;
        top: 72px;
        left: 50%;
        transform: translateX(-50%);
        width: min(92vw, 840px);
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.24);
        border: 2px solid #e2e8f0;
        z-index: 50;
        overflow: hidden;
        animation: qSlideDown 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }

      @keyframes qSlideDown {
        from { transform: translate(-50%, -30px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }

      .chiemdat-q-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px 10px 20px;
        gap: 12px;
      }

      .chiemdat-q-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .chiemdat-q-badge {
        background: var(--answering-color, #ef4444);
        color: #ffffff;
        font-weight: 900;
        font-size: 13px;
        padding: 4px 12px;
        border-radius: 8px;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }

      .chiemdat-q-tools {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chiemdat-q-font-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        font-weight: 900;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chiemdat-q-font-btn:hover {
        background: #e2e8f0;
      }

      /* Timer Ring */
      .chiemdat-timer-box {
        position: relative;
        width: 38px;
        height: 38px;
      }
      .chiemdat-timer-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }
      .chiemdat-timer-number {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 14px;
        color: #0f172a;
      }

      /* Question Body */
      .chiemdat-q-body {
        padding: 0 22px 14px 22px;
        font-size: var(--q-font-size, 17px);
        font-weight: 700;
        color: #1e293b;
        line-height: 1.5;
      }

      .chiemdat-q-image-container {
        text-align: center;
        margin: 6px 0 12px 0;
      }
      .chiemdat-q-image-container img {
        max-height: 180px;
        max-width: 90%;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        cursor: zoom-in;
        transition: transform 0.2s ease;
      }
      .chiemdat-q-image-container img:hover {
        transform: scale(1.02);
      }

      /* Options Grid */
      .chiemdat-options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 0 22px 16px 22px;
      }

      .chiemdat-option-card {
        padding: 12px 16px;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        font-size: var(--opt-font-size, 15px);
        font-weight: 700;
        color: #334155;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: all 0.15s ease;
      }

      .chiemdat-option-card:hover:not(.locked):not(.disabled) {
        background: #ffffff;
        border-color: #94a3b8;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      }

      .chiemdat-option-card.correct {
        background: #dcfce7 !important;
        border-color: #22c55e !important;
        color: #15803d !important;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25) !important;
      }

      .chiemdat-option-card.wrong {
        background: #fee2e2 !important;
        border-color: #ef4444 !important;
        color: #b91c1c !important;
        cursor: not-allowed;
      }

      .chiemdat-option-mark {
        font-weight: 900;
        font-size: 16px;
      }

      /* Steal Banner (CƯỚP LƯỢT) */
      .chiemdat-steal-box {
        margin: 0 22px 16px 22px;
        padding: 10px 16px;
        background: #eff6ff;
        border: 2px solid #3b82f6;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: pulseSteal 1.2s infinite ease-in-out;
      }

      @keyframes pulseSteal {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
      }

      .chiemdat-steal-pill {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        font-size: 12px;
        font-weight: 900;
        padding: 4px 10px;
        border-radius: 6px;
        letter-spacing: 0.05em;
        flex-shrink: 0;
      }

      .chiemdat-steal-team {
        background: var(--stealing-color, #3b82f6);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 900;
        padding: 3px 10px;
        border-radius: 6px;
        flex-shrink: 0;
      }

      .chiemdat-steal-desc {
        font-size: 13.5px;
        font-weight: 800;
        color: #1e3a8a;
      }
      .chiemdat-steal-desc span {
        color: #2563eb;
        text-decoration: underline;
      }

      /* Modal Popups (Setup & Victory) */
      .chiemdat-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 60;
        animation: fadeIn 0.25s ease;
      }

      .chiemdat-modal-card {
        background: #ffffff;
        border-radius: 24px;
        width: min(90vw, 520px);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        border: 2px solid #e2e8f0;
        animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .chiemdat-modal-header {
        background: linear-gradient(135deg, #fb923c, #ec4899);
        padding: 24px 20px;
        text-align: center;
        color: #ffffff;
      }

      .chiemdat-modal-title {
        font-size: 22px;
        font-weight: 900;
        letter-spacing: 0.02em;
        text-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
      .chiemdat-modal-sub {
        font-size: 12.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.95;
      }

      .chiemdat-modal-body {
        padding: 22px 24px;
      }

      .chiemdat-team-count-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .chiemdat-count-btn {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 2px solid #cbd5e1;
        background: #f8fafc;
        font-weight: 900;
        font-size: 17px;
        color: #334155;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .chiemdat-count-btn.active {
        background: #f43f5e;
        border-color: #f43f5e;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(244, 63, 94, 0.35);
      }

      .chiemdat-teams-setup-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }

      .chiemdat-team-input-card {
        padding: 10px 14px;
        border-radius: 12px;
        border: 2px solid var(--t-color);
        background: color-mix(in srgb, var(--t-color) 6%, #ffffff);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .chiemdat-color-badge {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: var(--t-color);
        flex-shrink: 0;
      }
      .chiemdat-team-input {
        border: none;
        background: transparent;
        font-size: 14px;
        font-weight: 800;
        color: #1e293b;
        outline: none;
        width: 100%;
      }

      .chiemdat-btn-start {
        width: 100%;
        padding: 14px 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-size: 16px;
        font-weight: 900;
        border: none;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .chiemdat-btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45);
      }

      /* Countdown 3.. 2.. 1.. */
      .chiemdat-countdown-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 55;
        background: rgba(15, 23, 42, 0.35);
        backdrop-filter: blur(4px);
      }
      .chiemdat-countdown-num {
        font-size: 110px;
        font-weight: 900;
        color: #facc15;
        text-shadow: 4px 4px 0 #78350f, -4px 4px 0 #78350f, 4px -4px 0 #78350f, -4px -4px 0 #78350f, 0 10px 24px rgba(0,0,0,0.5);
        animation: cdPop 0.8s ease;
      }
      @keyframes cdPop {
        0% { transform: scale(0.4); opacity: 0; }
        60% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Lightbox for images */
      .chiemdat-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        cursor: zoom-out;
      }
      .chiemdat-lightbox img {
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 12px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. SOUND SYNTHESIS ENGINE (Offline reliable & Instant)
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
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.06);
            break;
          }
          case 'countdown': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.18);
            break;
          }
          case 'start': {
            [440, 554, 659, 880].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, t + idx * 0.07);
              gain.gain.setValueAtTime(0.25, t + idx * 0.07);
              gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.3);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.07);
              osc.stop(t + idx * 0.07 + 0.3);
            });
            break;
          }
          case 'correct': {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t + idx * 0.08);
              gain.gain.setValueAtTime(0.3, t + idx * 0.08);
              gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.28);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.08);
              osc.stop(t + idx * 0.08 + 0.28);
            });
            break;
          }
          case 'wrong': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.linearRampToValueAtTime(110, t + 0.35);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
            break;
          }
          case 'steal': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(780, t + 0.22);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
            break;
          }
          case 'claim': {
            [600, 800, 1000, 1200].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t + idx * 0.05);
              gain.gain.setValueAtTime(0.2, t + idx * 0.05);
              gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.2);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.05);
              osc.stop(t + idx * 0.05 + 0.2);
            });
            break;
          }
          case 'lock': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.setValueAtTime(140, t + 0.08);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
            break;
          }
          case 'victory': {
            [440, 554, 659, 880, 1108].forEach((f, i) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, t + i * 0.12);
              gain.gain.setValueAtTime(0.3, t + i * 0.12);
              gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.5);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + i * 0.12);
              osc.stop(t + i * 0.12 + 0.5);
            });
            break;
          }
        }
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  }

  // 3. MATH FORMULA FORMATTER (KaTeX Safe & Robust)
  function formatMath(text) {
    if (!text) return '';
    text = String(text);

    // Auto-repair known corrupted formulas if missing variables
    if (text.includes('4 + 18 = 50') && !text.includes('$x')) {
      text = text.replace(/.*4\s*\+\s*18\s*=\s*50\$?/, 'Tìm x, biết: $x \\times 4 + 18 = 50$');
    } else if (text.includes('12 - 20') && !text.includes('$3')) {
      text = text.replace(/.*12\s*-\s*20\$?/, 'Tính giá trị của biểu thức: $3 \\times 12 - 20$');
    } else if (text.includes('5x + 6 = 0') && !text.includes('$x^2')) {
      text = text.replace(/.*5x\s*\+\s*6\s*=\s*0\$?/, 'Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:');
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
               .replace(/\\le/g, '≤')
               .replace(/\\ge/g, '≥')
               .replace(/\\neq/g, '≠')
               .replace(/\\pm/g, '±');

    return text;
  }

  // 4. MAIN LAUNCH FUNCTION
  window.launchChiemDatGame = function(container, options = {}) {
    injectStyles();

    const rawQuestions = (options.questions && options.questions.length > 0)
      ? options.questions
      : [
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "48", "63"], correctIndex: 1 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "Số liền sau của số 99 là số nào?", options: ["98", "100", "101", "90"], correctIndex: 1 },
          { text: "Hình tam giác có bao nhiêu cạnh?", options: ["2", "3", "4", "5"], correctIndex: 1 },
          { text: "1 mét bằng bao nhiêu xăng-ti-mét (cm)?", options: ["10cm", "100cm", "1000cm", "50cm"], correctIndex: 1 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức: $3 \times 12 - 20$", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "37 quyển", "25 quyển", "29 quyển"], correctIndex: 0 },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1 },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1 },
          { text: "Một hình chữ nhật có chu vi 32cm, chiều dài 10cm. Chiều rộng hình chữ nhật là:", options: ["6cm", "12cm", "8cm", "5cm"], correctIndex: 0 },
          { text: "Tìm x, biết: $x \times 4 + 18 = 50$", options: ["6", "8", "7", "9"], correctIndex: 1 },
          { text: "Có 48 cái kẹo chia đều vào 6 túi. Hỏi 4 túi như thế có bao nhiêu cái kẹo?", options: ["32 cái", "24 cái", "36 cái", "28 cái"], correctIndex: 0 },
          { text: "Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:", options: ["-5", "5", "6", "-6"], correctIndex: 1 },
          { text: "Năm nay mẹ 36 tuổi, con 9 tuổi. Hỏi sau bao nhiêu năm nữa tuổi mẹ gấp 3 lần tuổi con?", options: ["3 năm", "4.5 năm", "5 năm", "6 năm"], correctIndex: 1 },
          { text: "Tính diện tích hình tròn có bán kính $r = 5\\text{ cm}$ (lấy $\\pi = 3{,}14$):", options: ["78{,}5\\text{ cm}^2", "31{,}4\\text{ cm}^2", "15{,}7\\text{ cm}^2", "100\\text{ cm}^2"], correctIndex: 0 },
          { text: "Một người đi xe máy từ A đến B dài 60km hết 1 giờ 30 phút. Vận tốc của người đó là:", options: ["45 km/h", "40 km/h", "35 km/h", "50 km/h"], correctIndex: 1 },
          { text: "Biết $\\frac{2}{5}$ số học sinh cả lớp là 16 em. Lớp đó có tất cả bao nhiêu học sinh?", options: ["32 em", "36 em", "40 em", "44 em"], correctIndex: 2 }
        ];

    const sound = new SoundEngine();

    // Game state
    let teamCount = options.teamCount || 3;
    let teams = [
      { id: 0, name: options.teamAName || 'Đội A', color: '#ef4444', classSuffix: 'red', score: 0 },
      { id: 1, name: options.teamBName || 'Đội B', color: '#3b82f6', classSuffix: 'blue', score: 0 },
      { id: 2, name: options.teamCName || 'Đội Vàng', color: '#f59e0b', classSuffix: 'yellow', score: 0 },
      { id: 3, name: options.teamDName || 'Đội Xanh lá', color: '#10b981', classSuffix: 'green', score: 0 }
    ];

    let currentTurnTeamIdx = 0;
    let answeringTeamIdx = 0;
    let activePlotId = null;
    let questionCounter = 0;
    let usedQuestionIndices = new Set();
    let currentQuestion = null;
    let lockedOptions = new Set();
    let failedTeamsForCurrentPlot = new Set();

    let timerSeconds = options.secondsPerQuestion || 30;
    let remainingTimer = timerSeconds;
    let timerInterval = null;
    let isPaused = false;
    let questionFontSize = 18;

    // 25 Plots Board
    // Texture pattern: crops, crops, lawn, crops, wood, wood, crops, crops, crops, lawn...
    const PLOT_TEXTURES = [
      'plot-crops', 'plot-crops', 'plot-lawn', 'plot-crops', 'plot-wood',
      'plot-wood',  'plot-crops', 'plot-crops', 'plot-crops', 'plot-lawn',
      'plot-crops', 'plot-lawn',  'plot-wood',  'plot-crops', 'plot-crops',
      'plot-crops', 'plot-crops', 'plot-crops', 'plot-wood',  'plot-wood',
      'plot-lawn',  'plot-crops', 'plot-lawn',  'plot-lawn',  'plot-wood'
    ];

    let plotsState = [];
    for (let i = 1; i <= 25; i++) {
      plotsState.push({
        id: i,
        status: 'unclaimed', // 'unclaimed' | 'claimed' | 'locked'
        ownerTeamIdx: null,
        textureClass: PLOT_TEXTURES[i - 1] || 'plot-crops'
      });
    }

    // Build DOM
    const rootEl = document.createElement('div');
    rootEl.className = 'chiemdat-stage';
    rootEl.innerHTML = `
      <div class="chiemdat-battlefield"></div>

      <!-- Topbar -->
      <header class="chiemdat-topbar">
        <div class="chiemdat-teams-track" id="chiemdat-teams-track"></div>
        <div class="chiemdat-top-controls">
          <button class="chiemdat-btn-util" id="chiemdat-btn-fs" title="Toàn màn hình">⛶</button>
          <button class="chiemdat-btn-util" id="chiemdat-btn-mute" title="Bật/Tắt âm thanh">🔊</button>
          <button class="chiemdat-btn-util" id="chiemdat-btn-pause">⏸ Tạm dừng</button>
          <button class="chiemdat-btn-danger" id="chiemdat-btn-exit">Kết thúc</button>
        </div>
      </header>

      <!-- Turn Indicator Prompt -->
      <div class="chiemdat-turn-indicator" id="chiemdat-turn-indicator"></div>

      <!-- 3D Farm Board Container -->
      <main class="chiemdat-board-container">
        <div class="chiemdat-board" id="chiemdat-board"></div>
      </main>

      <!-- Dynamic Overlays Container (Question / Modals / Countdown) -->
      <div id="chiemdat-overlays"></div>
    `;

    container.innerHTML = '';
    container.appendChild(rootEl);

    const teamsTrack = rootEl.querySelector('#chiemdat-teams-track');
    const boardEl = rootEl.querySelector('#chiemdat-board');
    const turnIndicatorEl = rootEl.querySelector('#chiemdat-turn-indicator');
    const overlaysEl = rootEl.querySelector('#chiemdat-overlays');

    // Render top team scorecards
    function renderTopBar() {
      const activeTeams = teams.slice(0, teamCount);
      teamsTrack.innerHTML = activeTeams.map((team, idx) => {
        const isActive = idx === currentTurnTeamIdx;
        return `
          <div class="chiemdat-team-pill ${isActive ? 'active' : ''}" style="--t-color: ${team.color};">
            <div class="chiemdat-team-score-circle">${team.score}</div>
            <div class="chiemdat-team-meta">
              <div class="chiemdat-team-title">${team.name}</div>
              <div class="chiemdat-team-sub">${team.score} Ô ĐẤT</div>
            </div>
            ${isActive ? '<div class="chiemdat-turn-tag">▶ LƯỢT</div>' : ''}
          </div>
        `;
      }).join('');
    }

    // Render Turn prompt indicator
    function renderTurnIndicator() {
      const curTeam = teams[currentTurnTeamIdx];
      turnIndicatorEl.innerHTML = `
        <span class="chiemdat-turn-indicator-badge" style="background: ${curTeam.color};">🚩 ${curTeam.name}</span>
        <span class="chiemdat-turn-indicator-text">chọn một ô đất ▼</span>
      `;
      turnIndicatorEl.style.display = 'flex';
    }

    // Render 25 plots
    function renderBoard() {
      boardEl.innerHTML = plotsState.map(plot => {
        let stateClasses = [plot.textureClass];
        let innerHtml = `<div class="chiemdat-plot-number">${plot.id}</div>`;

        if (plot.id === activePlotId) {
          stateClasses.push('selected');
          innerHtml += `
            <div class="chiemdat-active-arrow">
              <svg viewBox="0 0 24 24" width="46" height="46">
                <path d="M12 21L3 8h18z" fill="#facc15" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round"/>
              </svg>
            </div>
          `;
        }

        if (plot.status === 'claimed') {
          const owner = teams[plot.ownerTeamIdx];
          stateClasses.push('claimed', 'claimed-' + (owner ? owner.classSuffix : 'blue'));
          innerHtml = `
            <div class="chiemdat-claimed-badge" style="background: ${owner.color};">🚩 ${owner.name}</div>
          `;
        } else if (plot.status === 'locked') {
          stateClasses.push('locked');
          innerHtml = `
            <div class="chiemdat-locked-padlock">
              <img src="/ey/games/chiem-dat/padlock.png" alt="Locked" />
            </div>
          `;
        }

        return `
          <div class="chiemdat-plot ${stateClasses.join(' ')}" data-plot-id="${plot.id}">
            ${innerHtml}
          </div>
        `;
      }).join('');

      // Bind plot clicks
      boardEl.querySelectorAll('.chiemdat-plot').forEach(plotCard => {
        plotCard.onclick = () => {
          const pid = parseInt(plotCard.dataset.plotId, 10);
          onPlotClicked(pid);
        };
      });
    }

    // Plot Clicked Handler
    function onPlotClicked(pid) {
      if (overlaysEl.querySelector('.chiemdat-q-overlay')) return; // question already open
      const plot = plotsState.find(p => p.id === pid);
      if (!plot) return;

      if (plot.status === 'claimed') {
        sound.play('click');
        return;
      }
      if (plot.status === 'locked') {
        sound.play('lock');
        return;
      }

      sound.play('click');
      activePlotId = pid;
      renderBoard();

      // Start question flow
      startQuestionFlowForPlot(pid);
    }

    // Pick question from bank
    function pickQuestion() {
      if (usedQuestionIndices.size >= rawQuestions.length) {
        usedQuestionIndices.clear(); // Reset so play never halts
      }
      const availableIndices = [];
      for (let i = 0; i < rawQuestions.length; i++) {
        if (!usedQuestionIndices.has(i)) availableIndices.push(i);
      }
      const chosenIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      usedQuestionIndices.add(chosenIdx);
      return { ...rawQuestions[chosenIdx], _bankIndex: chosenIdx };
    }

    // Start Question Flow
    function startQuestionFlowForPlot(pid) {
      turnIndicatorEl.style.display = 'none';
      questionCounter++;
      currentQuestion = pickQuestion();
      window.__currentQuestion = currentQuestion;
      answeringTeamIdx = currentTurnTeamIdx;
      failedTeamsForCurrentPlot.clear();
      lockedOptions.clear();

      remainingTimer = timerSeconds;
      renderQuestionCard();
      startTimer();
    }

    // Render Question Card
    function renderQuestionCard(isSteal = false) {
      const answeringTeam = teams[answeringTeamIdx];
      const q = currentQuestion;
      const qText = formatMath(q.text || q.content || '');

      let stealBannerHtml = '';
      if (isSteal) {
        stealBannerHtml = `
          <div class="chiemdat-steal-box" style="--stealing-color: ${answeringTeam.color};">
            <span class="chiemdat-steal-pill">⚡ CƯỚP LƯỢT</span>
            <span class="chiemdat-steal-team">${answeringTeam.name}</span>
            <span class="chiemdat-steal-desc">trả lời thay — đúng là <span>giành luôn ô này</span></span>
          </div>
        `;
      }

      let imageHtml = '';
      if (q.image || q.imageUrl) {
        imageHtml = `
          <div class="chiemdat-q-image-container">
            <img src="${q.image || q.imageUrl}" alt="Đề bài" title="Bấm để phóng to ảnh" />
          </div>
        `;
      }

      overlaysEl.innerHTML = `
        <div class="chiemdat-q-overlay" style="--answering-color: ${answeringTeam.color};">
          <div class="chiemdat-q-header">
            <div class="chiemdat-q-left">
              <div class="chiemdat-q-badge">CÂU ${questionCounter} • Ô ${activePlotId}</div>
            </div>
            <div class="chiemdat-q-tools">
              <button class="chiemdat-q-font-btn" id="chiemdat-btn-font-dec" title="Thu nhỏ chữ">A-</button>
              <button class="chiemdat-q-font-btn" id="chiemdat-btn-font-inc" title="Phóng to chữ">A+</button>
              <div class="chiemdat-timer-box">
                <svg class="chiemdat-timer-svg" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e2e8f0" stroke-width="3" />
                  <path id="chiemdat-timer-ring-path" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="100, 100" />
                </svg>
                <div class="chiemdat-timer-number" id="chiemdat-timer-display">${remainingTimer}</div>
              </div>
            </div>
          </div>

          <div class="chiemdat-q-body" style="--q-font-size: ${questionFontSize}px;">
            ${qText}
          </div>

          ${imageHtml}

          <div class="chiemdat-options-grid" style="--opt-font-size: ${Math.max(14, questionFontSize - 2)}px;">
            ${(q.options || []).map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const optText = formatMath(typeof opt === 'string' ? opt : (opt.text || ''));
              const isLocked = lockedOptions.has(optIdx);
              return `
                <div class="chiemdat-option-card ${isLocked ? 'wrong disabled' : ''}" data-opt-idx="${optIdx}">
                  <span><strong>${letter}.</strong> ${optText}</span>
                  <span class="chiemdat-option-mark">${isLocked ? '✗' : ''}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${stealBannerHtml}
        </div>
      `;

      if (window.FileParser && typeof window.FileParser.renderMath === 'function') {
        window.FileParser.renderMath(overlaysEl);
      }

      // Font zoom
      overlaysEl.querySelector('#chiemdat-btn-font-inc').onclick = () => {
        questionFontSize = Math.min(30, questionFontSize + 2);
        renderQuestionCard(isSteal);
      };
      overlaysEl.querySelector('#chiemdat-btn-font-dec').onclick = () => {
        questionFontSize = Math.max(14, questionFontSize - 2);
        renderQuestionCard(isSteal);
      };

      // Image zoom click
      const imgEl = overlaysEl.querySelector('.chiemdat-q-image-container img');
      if (imgEl) {
        imgEl.onclick = () => {
          showLightbox(imgEl.src);
        };
      }

      // Bind options
      overlaysEl.querySelectorAll('.chiemdat-option-card').forEach(card => {
        card.onclick = () => {
          if (card.classList.contains('disabled')) return;
          const optIdx = parseInt(card.dataset.optIdx, 10);
          onOptionSelected(optIdx, card);
        };
      });
    }

    // Lightbox modal for image
    function showLightbox(src) {
      const lb = document.createElement('div');
      lb.className = 'chiemdat-lightbox';
      lb.innerHTML = `<img src="${src}" alt="Zoomed" />`;
      lb.onclick = () => lb.remove();
      document.body.appendChild(lb);
    }

    // Timer management
    function startTimer() {
      stopTimer();
      timerInterval = setInterval(() => {
        if (isPaused) return;
        remainingTimer--;
        updateTimerDisplay();
        if (remainingTimer <= 0) {
          stopTimer();
          handleTimeout();
        }
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function updateTimerDisplay() {
      const numEl = overlaysEl.querySelector('#chiemdat-timer-display');
      const ringEl = overlaysEl.querySelector('#chiemdat-timer-ring-path');
      if (numEl) numEl.textContent = remainingTimer;
      if (ringEl) {
        const pct = Math.max(0, (remainingTimer / timerSeconds) * 100);
        ringEl.setAttribute('stroke-dasharray', `${pct}, 100`);
        if (remainingTimer <= 5) {
          ringEl.setAttribute('stroke', '#ef4444');
        } else if (remainingTimer <= 10) {
          ringEl.setAttribute('stroke', '#f59e0b');
        } else {
          ringEl.setAttribute('stroke', '#22c55e');
        }
      }
    }

    // Option selected logic
    function onOptionSelected(selectedIdx, cardEl) {
      const q = currentQuestion;
      const correctIdx = (typeof q.correctIndex === 'number') ? q.correctIndex : 0;
      const isCorrect = (selectedIdx === correctIdx);

      if (isCorrect) {
        // CORRECT!
        stopTimer();
        sound.play('correct');
        cardEl.classList.add('correct');
        const mark = cardEl.querySelector('.chiemdat-option-mark');
        if (mark) mark.textContent = '✓';

        // Claim plot for answering team!
        const winningTeam = teams[answeringTeamIdx];
        winningTeam.score++;

        const plot = plotsState.find(p => p.id === activePlotId);
        if (plot) {
          plot.status = 'claimed';
          plot.ownerTeamIdx = answeringTeamIdx;
        }

        // Confetti celebration over plot
        triggerPlotConfetti(activePlotId, winningTeam.color);
        sound.play('claim');

        // Close question card after 1.5s delay and pass turn to next team
        setTimeout(() => {
          overlaysEl.innerHTML = '';
          activePlotId = null;
          renderTopBar();
          renderBoard();
          advanceToNextTurn();
        }, 1500);

      } else {
        // WRONG ANSWER
        sound.play('wrong');
        cardEl.classList.add('wrong', 'disabled');
        const mark = cardEl.querySelector('.chiemdat-option-mark');
        if (mark) mark.textContent = '✗';
        lockedOptions.add(selectedIdx);
        failedTeamsForCurrentPlot.add(answeringTeamIdx);

        // Check if there are other teams who can STEAL!
        const remainingTeams = [];
        for (let i = 0; i < teamCount; i++) {
          if (!failedTeamsForCurrentPlot.has(i)) {
            remainingTeams.push(i);
          }
        }

        if (remainingTeams.length > 0) {
          // Pass steal chance to next team
          sound.play('steal');
          // Find next team in rotation that hasn't failed yet
          let nextStealIdx = (answeringTeamIdx + 1) % teamCount;
          while (failedTeamsForCurrentPlot.has(nextStealIdx)) {
            nextStealIdx = (nextStealIdx + 1) % teamCount;
          }
          answeringTeamIdx = nextStealIdx;

          // Render Question Card with Steal Banner
          renderQuestionCard(true);
        } else {
          // ALL TEAMS FAILED!
          stopTimer();
          sound.play('lock');

          const plot = plotsState.find(p => p.id === activePlotId);
          if (plot) {
            plot.status = 'locked'; // Padlock!
          }

          setTimeout(() => {
            overlaysEl.innerHTML = '';
            activePlotId = null;
            renderTopBar();
            renderBoard();
            advanceToNextTurn();
          }, 1600);
        }
      }
    }

    // Timeout handler
    function handleTimeout() {
      sound.play('wrong');
      const plot = plotsState.find(p => p.id === activePlotId);
      if (plot) {
        plot.status = 'locked';
      }
      setTimeout(() => {
        overlaysEl.innerHTML = '';
        activePlotId = null;
        renderTopBar();
        renderBoard();
        advanceToNextTurn();
      }, 1200);
    }

    // Advance to next team's turn in round robin
    function advanceToNextTurn() {
      // Check if all plots are claimed or locked
      const remainingUnclaimed = plotsState.filter(p => p.status === 'unclaimed').length;
      if (remainingUnclaimed === 0) {
        showVictoryModal();
        return;
      }

      // Next team
      currentTurnTeamIdx = (currentTurnTeamIdx + 1) % teamCount;
      renderTopBar();
      renderTurnIndicator();
    }

    // Plot Confetti Effect
    function triggerPlotConfetti(pid, color) {
      if (typeof window.confetti === 'function') {
        const plotEl = boardEl.querySelector(`[data-plot-id="${pid}"]`);
        if (plotEl) {
          const rect = plotEl.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          window.confetti({
            particleCount: 45,
            spread: 60,
            origin: { x, y },
            colors: [color, '#ffffff', '#facc15']
          });
        }
      }
    }

    // 5. VICTORY MODAL
    function showVictoryModal() {
      stopTimer();
      sound.play('victory');

      if (typeof window.confetti === 'function') {
        window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      }

      // Rank teams by score
      const activeTeams = teams.slice(0, teamCount).slice();
      activeTeams.sort((a, b) => b.score - a.score);

      const topScore = activeTeams[0].score;
      const winners = activeTeams.filter(t => t.score === topScore);
      let headline = `${winners[0].name} chiến thắng!`;
      if (winners.length > 1 && topScore > 0) {
        headline = 'Trận đấu hòa nhau!';
      } else if (topScore === 0) {
        headline = 'Kết thúc trận đấu!';
      }

      const medals = ['🥇', '🥈', '🥉', '🎖️'];

      overlaysEl.innerHTML = `
        <div class="chiemdat-modal-backdrop">
          <div class="chiemdat-modal-card">
            <div class="chiemdat-modal-header" style="background: linear-gradient(135deg, #3b82f6, #6366f1);">
              <div style="font-size: 52px; margin-bottom: 6px;">🏆</div>
              <div class="chiemdat-modal-title">${headline}</div>
              <div class="chiemdat-modal-sub">BẢNG XẾP HẠNG CHIẾM ĐẤT</div>
            </div>
            <div class="chiemdat-modal-body">
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                ${activeTeams.map((team, idx) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-radius: 12px; border: 2px solid ${team.color}; background: color-mix(in srgb, ${team.color} 8%, #ffffff);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 20px;">${medals[idx] || '🎖️'}</span>
                      <strong style="font-size: 15px; color: #1e293b;">${team.name}</strong>
                    </div>
                    <span style="font-size: 15px; font-weight: 900; color: ${team.color}; background: #ffffff; padding: 4px 14px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">${team.score} ô</span>
                  </div>
                `).join('')}
              </div>

              <div style="display: flex; gap: 12px;">
                <button class="chiemdat-btn-start" id="chiemdat-btn-replay" style="flex: 1;">
                  <span>🔄</span> <span>Chơi lại</span>
                </button>
                <button class="chiemdat-btn-util" id="chiemdat-btn-back-lobby" style="flex: 1; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 14.5px;">
                  <span>📋</span> <span>Về danh sách</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      overlaysEl.querySelector('#chiemdat-btn-replay').onclick = () => {
        sound.play('click');
        resetGame();
      };

      overlaysEl.querySelector('#chiemdat-btn-back-lobby').onclick = () => {
        sound.play('click');
        exitGame();
      };
    }

    // Reset game with current teams
    function resetGame() {
      teams.forEach(t => t.score = 0);
      currentTurnTeamIdx = 0;
      activePlotId = null;
      questionCounter = 0;
      usedQuestionIndices.clear();
      plotsState.forEach(p => {
        p.status = 'unclaimed';
        p.ownerTeamIdx = null;
      });
      overlaysEl.innerHTML = '';
      renderTopBar();
      renderBoard();
      renderTurnIndicator();
    }

    // 6. SETUP MODAL (Choose 2, 3, 4 teams & edit team names)
    function showSetupModal() {
      overlaysEl.innerHTML = `
        <div class="chiemdat-modal-backdrop">
          <div class="chiemdat-modal-card">
            <div class="chiemdat-modal-header">
              <div class="chiemdat-modal-sub">ĐẤU TRƯỜNG</div>
              <div class="chiemdat-modal-title">Chiếm Đất</div>
            </div>
            <div class="chiemdat-modal-body">
              <div class="chiemdat-team-count-selector">
                <span style="font-weight: 800; color: #475569; font-size: 15px;">Số đội:</span>
                <button class="chiemdat-count-btn ${teamCount === 2 ? 'active' : ''}" data-teams="2">2</button>
                <button class="chiemdat-count-btn ${teamCount === 3 ? 'active' : ''}" data-teams="3">3</button>
                <button class="chiemdat-count-btn ${teamCount === 4 ? 'active' : ''}" data-teams="4">4</button>
              </div>

              <div class="chiemdat-teams-setup-grid" id="chiemdat-setup-inputs">
                ${renderSetupTeamInputs(teamCount)}
              </div>

              <button class="chiemdat-btn-start" id="chiemdat-btn-start-match">
                <span>▶ Bắt đầu</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Team count click
      overlaysEl.querySelectorAll('.chiemdat-count-btn').forEach(btn => {
        btn.onclick = () => {
          sound.play('click');
          teamCount = parseInt(btn.dataset.teams, 10);
          overlaysEl.querySelectorAll('.chiemdat-count-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          overlaysEl.querySelector('#chiemdat-setup-inputs').innerHTML = renderSetupTeamInputs(teamCount);
        };
      });

      // Start match click
      overlaysEl.querySelector('#chiemdat-btn-start-match').onclick = () => {
        // Collect team names
        for (let i = 0; i < teamCount; i++) {
          const inp = overlaysEl.querySelector(`#team-name-input-${i}`);
          if (inp && inp.value.trim()) {
            teams[i].name = inp.value.trim();
          }
        }
        sound.init();
        sound.play('click');
        startMatchSequence();
      };
    }

    function renderSetupTeamInputs(count) {
      return teams.slice(0, count).map((t, i) => `
        <div class="chiemdat-team-input-card" style="--t-color: ${t.color};">
          <div class="chiemdat-color-badge"></div>
          <input type="text" id="team-name-input-${i}" class="chiemdat-team-input" value="${t.name}" placeholder="Tên đội ${i + 1}" />
        </div>
      `).join('');
    }

    // 7. COUNTDOWN 3.. 2.. 1.. SẴN SÀNG!
    function startMatchSequence() {
      let count = 3;
      overlaysEl.innerHTML = `
        <div class="chiemdat-countdown-overlay">
          <div class="chiemdat-countdown-num" id="chiemdat-cd-box">${count}</div>
        </div>
      `;
      sound.play('countdown');

      const cdInterval = setInterval(() => {
        count--;
        const cdBox = overlaysEl.querySelector('#chiemdat-cd-box');
        if (count > 0) {
          if (cdBox) {
            cdBox.textContent = count;
            cdBox.style.animation = 'none';
            void cdBox.offsetWidth;
            cdBox.style.animation = 'cdPop 0.8s ease';
          }
          sound.play('countdown');
        } else if (count === 0) {
          if (cdBox) {
            cdBox.textContent = 'SẴN SÀNG!';
            cdBox.style.fontSize = '64px';
          }
          sound.play('start');
        } else {
          clearInterval(cdInterval);
          overlaysEl.innerHTML = '';
          renderTopBar();
          renderBoard();
          renderTurnIndicator();
        }
      }, 900);
    }

    // 8. UTILITY BUTTONS BINDING
    const muteBtn = rootEl.querySelector('#chiemdat-btn-mute');
    muteBtn.onclick = () => {
      sound.muted = !sound.muted;
      muteBtn.textContent = sound.muted ? '🔇' : '🔊';
    };

    const fsBtn = rootEl.querySelector('#chiemdat-btn-fs');
    fsBtn.onclick = () => {
      if (!document.fullscreenElement) {
        rootEl.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    const pauseBtn = rootEl.querySelector('#chiemdat-btn-pause');
    pauseBtn.onclick = () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng';
    };

    const exitBtn = rootEl.querySelector('#chiemdat-btn-exit');
    exitBtn.onclick = () => {
      sound.play('click');
      showVictoryModal();
    };

    window.__triggerChiemDatVictory = showVictoryModal;

    function exitGame() {
      stopTimer();
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
      stopTimer();
    };
  };

})(window);
