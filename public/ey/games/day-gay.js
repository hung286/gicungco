// ==============================================================================
// TRÒ CHƠI ĐẨY GẬY QUYẾT CHIẾN (STICK PUSH SHOWDOWN) - ĐỐI KHÁNG 2 ĐỘI
// Chuẩn xác 100% đồ họa và cơ chế gốc PomyAI (https://pomyai.com/gv/tro-choi/day-gay-quyet-chien)
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// Tích hợp: Nền tảng EY.AI Battle Arena
// ==============================================================================

(function(global) {
  'use strict';

  const BO_ANH_CONFIG = {"v": 1, "cao": 300, "nv": {"meo": {"gong": {"tep": "nv/meo_gong.webp", "so": 4, "w": 324, "h": 290, "le": 6, "tay": [{"x": 244.0, "y": 108.0, "sau": 168.0, "day": 19}, {"x": 251.0, "y": 105.0, "sau": 121.0, "day": 19}, {"x": 253.0, "y": 106.5, "sau": 123.0, "day": 20}, {"x": 244.0, "y": 105.0, "sau": 114.0, "day": 19}]}, "day": {"tep": "nv/meo_day.webp", "so": 6, "w": 388, "h": 292, "le": 6, "tay": [{"x": 281.0, "y": 107.0, "sau": 202.0, "day": 19}, {"x": 287.0, "y": 108.5, "sau": 157.0, "day": 18}, {"x": 283.0, "y": 108.0, "sau": 153.0, "day": 19}, {"x": 285.0, "y": 109.0, "sau": 155.0, "day": 19}, {"x": 280.0, "y": 108.0, "sau": 211.0, "day": 19}, {"x": 285.0, "y": 108.5, "sau": 208.0, "day": 18}]}, "loangchoang": {"tep": "nv/meo_loangchoang.webp", "so": 6, "w": 303, "h": 300, "le": 6, "tay": [{"x": 227.0, "y": 128.5, "sau": 190.0, "day": 18}, {"x": 236.0, "y": 130.0, "sau": 106.0, "day": 19}, {"x": 242.0, "y": 129.5, "sau": 112.0, "day": 18}, {"x": 230.0, "y": 132.0, "sau": 100.0, "day": 19}, {"x": 238.0, "y": 129.0, "sau": 108.0, "day": 21}, {"x": 242.0, "y": 131.0, "sau": 112.0, "day": 19}]}, "bay": {"tep": "nv/meo_bay.webp", "so": 4, "w": 379, "h": 358, "le": 6, "tay": [{"x": 272.0, "y": 329.0, "sau": 142.0, "day": 19}, {"x": 286.0, "y": 328.5, "sau": 156.0, "day": 20}, {"x": 284.0, "y": 326.5, "sau": 154.0, "day": 20}, {"x": 286.0, "y": 319.0, "sau": 156.0, "day": 19}]}, "thang": {"tep": "nv/meo_thang.webp", "so": 6, "w": 309, "h": 368, "le": 6}, "thua": {"tep": "nv/meo_thua.webp", "so": 6, "w": 295, "h": 319, "le": 6}}, "shiba": {"gong": {"tep": "nv/shiba_gong.webp", "so": 4, "w": 337, "h": 290, "le": 6, "tay": [{"x": 257.0, "y": 96.5, "sau": 178.0, "day": 20}, {"x": 268.0, "y": 96.5, "sau": 138.0, "day": 20}, {"x": 271.0, "y": 95.5, "sau": 141.0, "day": 20}, {"x": 260.0, "y": 96.5, "sau": 130.0, "day": 20}]}, "day": {"tep": "nv/shiba_day.webp", "so": 6, "w": 311, "h": 291, "le": 6, "tay": [{"x": 266.0, "y": 102.0, "sau": 184.0, "day": 19}, {"x": 224.0, "y": 108.5, "sau": 94.0, "day": 20}, {"x": 249.0, "y": 104.5, "sau": 119.0, "day": 18}, {"x": 250.0, "y": 105.5, "sau": 120.0, "day": 18}, {"x": 228.0, "y": 109.0, "sau": 98.0, "day": 19}, {"x": 239.0, "y": 103.5, "sau": 109.0, "day": 20}]}, "loangchoang": {"tep": "nv/shiba_loangchoang.webp", "so": 6, "w": 319, "h": 307, "le": 6, "tay": [{"x": 258.0, "y": 128.0, "sau": 253.0, "day": 17}, {"x": 252.0, "y": 131.5, "sau": 122.0, "day": 22}, {"x": 256.0, "y": 135.0, "sau": 126.0, "day": 17}, {"x": 266.0, "y": 135.0, "sau": 136.0, "day": 17}, {"x": 251.0, "y": 134.5, "sau": 121.0, "day": 18}, {"x": 243.0, "y": 134.0, "sau": 113.0, "day": 17}]}, "bay": {"tep": "nv/shiba_bay.webp", "so": 4, "w": 408, "h": 358, "le": 6, "tay": [{"x": 268.0, "y": 329.5, "sau": 178.0, "day": 22}, {"x": 277.0, "y": 329.5, "sau": 147.0, "day": 22}, {"x": 292.0, "y": 327.5, "sau": 162.0, "day": 22}, {"x": 276.0, "y": 328.5, "sau": 146.0, "day": 22}]}, "thang": {"tep": "nv/shiba_thang.webp", "so": 6, "w": 320, "h": 359, "le": 6}, "thua": {"tep": "nv/shiba_thua.webp", "so": 6, "w": 367, "h": 284, "le": 6}}, "gautruc": {"gong": {"tep": "nv/gautruc_gong.webp", "so": 4, "w": 328, "h": 285, "le": 6, "tay": [{"x": 236.0, "y": 96.0, "sau": 147.0, "day": 21}, {"x": 234.0, "y": 96.0, "sau": 104.0, "day": 21}, {"x": 233.0, "y": 95.5, "sau": 103.0, "day": 20}, {"x": 242.0, "y": 95.5, "sau": 112.0, "day": 20}]}, "day": {"tep": "nv/gautruc_day.webp", "so": 6, "w": 345, "h": 289, "le": 6, "tay": [{"x": 253.0, "y": 102.5, "sau": 182.0, "day": 22}, {"x": 236.0, "y": 101.0, "sau": 106.0, "day": 21}, {"x": 219.0, "y": 102.5, "sau": 89.0, "day": 22}, {"x": 243.0, "y": 103.0, "sau": 113.0, "day": 21}, {"x": 232.0, "y": 100.5, "sau": 102.0, "day": 20}, {"x": 223.0, "y": 100.0, "sau": 93.0, "day": 21}]}, "loangchoang": {"tep": "nv/gautruc_loangchoang.webp", "so": 6, "w": 324, "h": 300, "le": 6, "tay": [{"x": 261.0, "y": 130.0, "sau": 209.0, "day": 19}, {"x": 267.0, "y": 129.0, "sau": 137.0, "day": 21}, {"x": 261.0, "y": 130.0, "sau": 131.0, "day": 19}, {"x": 268.0, "y": 128.5, "sau": 138.0, "day": 20}, {"x": 263.0, "y": 127.5, "sau": 133.0, "day": 20}, {"x": 250.0, "y": 127.0, "sau": 120.0, "day": 21}]}, "bay": {"tep": "nv/gautruc_bay.webp", "so": 4, "w": 361, "h": 359, "le": 6, "tay": [{"x": 261.0, "y": 327.0, "sau": 157.0, "day": 19}, {"x": 272.0, "y": 324.0, "sau": 142.0, "day": 19}, {"x": 261.0, "y": 327.0, "sau": 159.0, "day": 19}, {"x": 272.0, "y": 305.5, "sau": 142.0, "day": 20}]}, "thang": {"tep": "nv/gautruc_thang.webp", "so": 6, "w": 330, "h": 364, "le": 6}, "thua": {"tep": "nv/gautruc_thua.webp", "so": 6, "w": 320, "h": 298, "le": 6}}, "capy": {"gong": {"tep": "nv/capy_gong.webp", "so": 4, "w": 318, "h": 285, "le": 6, "tay": [{"x": 212.0, "y": 103.0, "sau": 163.0, "day": 19}, {"x": 223.0, "y": 101.0, "sau": 93.0, "day": 19}, {"x": 225.0, "y": 98.5, "sau": 95.0, "day": 20}, {"x": 217.0, "y": 101.5, "sau": 87.0, "day": 20}]}, "day": {"tep": "nv/capy_day.webp", "so": 6, "w": 334, "h": 295, "le": 6, "tay": [{"x": 246.0, "y": 100.5, "sau": 212.0, "day": 20}, {"x": 239.0, "y": 102.5, "sau": 109.0, "day": 20}, {"x": 238.0, "y": 102.5, "sau": 108.0, "day": 20}, {"x": 255.0, "y": 98.5, "sau": 125.0, "day": 20}, {"x": 254.0, "y": 100.5, "sau": 124.0, "day": 20}, {"x": 252.0, "y": 100.5, "sau": 122.0, "day": 20}]}, "loangchoang": {"tep": "nv/capy_loangchoang.webp", "so": 6, "w": 317, "h": 301, "le": 6, "tay": [{"x": 244.0, "y": 124.0, "sau": 114.0, "day": 19}, {"x": 268.0, "y": 124.0, "sau": 138.0, "day": 19}, {"x": 243.0, "y": 124.0, "sau": 113.0, "day": 19}, {"x": 245.0, "y": 124.0, "sau": 115.0, "day": 19}, {"x": 240.0, "y": 125.0, "sau": 110.0, "day": 19}, {"x": 239.0, "y": 124.0, "sau": 109.0, "day": 19}]}, "bay": {"tep": "nv/capy_bay.webp", "so": 4, "w": 426, "h": 363, "le": 6, "tay": [{"x": 287.0, "y": 309.5, "sau": 164.0, "day": 24}, {"x": 307.0, "y": 313.0, "sau": 177.0, "day": 23}, {"x": 296.0, "y": 306.5, "sau": 166.0, "day": 24}, {"x": 297.0, "y": 309.0, "sau": 167.0, "day": 23}]}, "thang": {"tep": "nv/capy_thang.webp", "so": 6, "w": 313, "h": 361, "le": 6}, "thua": {"tep": "nv/capy_thua.webp", "so": 6, "w": 321, "h": 292, "le": 6}}, "trau": {"gong": {"tep": "nv/trau_gong.webp", "so": 4, "w": 341, "h": 287, "le": 6, "tay": [{"x": 264.0, "y": 98.5, "sau": 175.0, "day": 20}, {"x": 276.0, "y": 98.0, "sau": 146.0, "day": 19}, {"x": 275.0, "y": 97.5, "sau": 145.0, "day": 20}, {"x": 269.0, "y": 97.5, "sau": 139.0, "day": 20}]}, "day": {"tep": "nv/trau_day.webp", "so": 6, "w": 319, "h": 302, "le": 6, "tay": [{"x": 276.0, "y": 95.5, "sau": 193.0, "day": 20}, {"x": 218.0, "y": 102.0, "sau": 88.0, "day": 25}, {"x": 258.0, "y": 101.0, "sau": 128.0, "day": 21}, {"x": 267.0, "y": 102.0, "sau": 137.0, "day": 21}, {"x": 256.0, "y": 104.5, "sau": 126.0, "day": 22}, {"x": 264.0, "y": 99.5, "sau": 134.0, "day": 24}]}, "loangchoang": {"tep": "nv/trau_loangchoang.webp", "so": 6, "w": 305, "h": 305, "le": 6, "tay": [{"x": 228.0, "y": 124.5, "sau": 179.0, "day": 20}, {"x": 251.0, "y": 124.0, "sau": 121.0, "day": 21}, {"x": 243.0, "y": 124.0, "sau": 113.0, "day": 19}, {"x": 235.0, "y": 123.0, "sau": 105.0, "day": 19}, {"x": 244.0, "y": 120.0, "sau": 114.0, "day": 21}, {"x": 245.0, "y": 117.0, "sau": 115.0, "day": 21}]}, "bay": {"tep": "nv/trau_bay.webp", "so": 4, "w": 404, "h": 362, "le": 6, "tay": [{"x": 272.0, "y": 320.0, "sau": 198.0, "day": 21}, {"x": 280.0, "y": 325.5, "sau": 150.0, "day": 20}, {"x": 297.0, "y": 327.0, "sau": 167.0, "day": 21}, {"x": 292.0, "y": 331.5, "sau": 162.0, "day": 20}]}, "thang": {"tep": "nv/trau_thang.webp", "so": 6, "w": 305, "h": 369, "le": 6}, "thua": {"tep": "nv/trau_thua.webp", "so": 6, "w": 314, "h": 305, "le": 6}}, "ho": {"gong": {"tep": "nv/ho_gong.webp", "so": 4, "w": 348, "h": 283, "le": 6, "tay": [{"x": 263.0, "y": 101.5, "sau": 235.0, "day": 22}, {"x": 273.0, "y": 102.0, "sau": 143.0, "day": 23}, {"x": 281.0, "y": 102.5, "sau": 151.0, "day": 22}, {"x": 250.0, "y": 102.0, "sau": 120.0, "day": 23}]}, "day": {"tep": "nv/ho_day.webp", "so": 6, "w": 333, "h": 292, "le": 6, "tay": [{"x": 275.0, "y": 109.0, "sau": 244.0, "day": 21}, {"x": 272.0, "y": 108.0, "sau": 142.0, "day": 21}, {"x": 243.0, "y": 113.5, "sau": 113.0, "day": 24}, {"x": 277.0, "y": 111.5, "sau": 147.0, "day": 32}, {"x": 259.0, "y": 109.5, "sau": 129.0, "day": 22}, {"x": 281.0, "y": 110.5, "sau": 151.0, "day": 20}]}, "loangchoang": {"tep": "nv/ho_loangchoang.webp", "so": 6, "w": 318, "h": 309, "le": 6, "tay": [{"x": 255.0, "y": 128.5, "sau": 227.0, "day": 20}, {"x": 241.0, "y": 126.5, "sau": 111.0, "day": 22}, {"x": 237.0, "y": 123.0, "sau": 107.0, "day": 19}, {"x": 237.0, "y": 123.0, "sau": 107.0, "day": 19}, {"x": 235.0, "y": 122.0, "sau": 105.0, "day": 19}, {"x": 222.0, "y": 120.5, "sau": 92.0, "day": 20}]}, "bay": {"tep": "nv/ho_bay.webp", "so": 4, "w": 397, "h": 367, "le": 6, "tay": [{"x": 272.0, "y": 338.5, "sau": 177.0, "day": 22}, {"x": 289.0, "y": 319.5, "sau": 159.0, "day": 22}, {"x": 291.0, "y": 337.0, "sau": 161.0, "day": 23}, {"x": 267.0, "y": 320.0, "sau": 175.0, "day": 23}]}, "thang": {"tep": "nv/ho_thang.webp", "so": 6, "w": 301, "h": 366, "le": 6}, "thua": {"tep": "nv/ho_thua.webp", "so": 6, "w": 305, "h": 294, "le": 6}}}, "nen": {"tep": "nen_san.webp", "w": 1599, "h": 900}, "du": ["meo", "shiba", "gautruc", "capy", "trau", "ho"], "nc": {"trong_cai": {"tep": "nc/trong_cai.webp", "so": 4, "w": 423, "h": 413, "le": 6}, "ken": {"tep": "nc/ken.webp", "so": 4, "w": 276, "h": 262, "le": 6}, "trong_con": {"tep": "nc/trong_con.webp", "so": 4, "w": 221, "h": 247, "le": 6}, "chum_choe": {"tep": "nc/chum_choe.webp", "so": 4, "w": 299, "h": 257, "le": 6}}};

  // 1. INJECT STYLES
  function injectStyles() {
    if (document.getElementById('day-gay-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'day-gay-styles';
    styleEl.textContent = `
      .sp-stage {
        --tug-chan: clamp(140px, 21dvh, 210px);
        z-index: 60;
        color: #16324a;
        background: #cf6a4c;
        flex-direction: column;
        display: flex;
        position: fixed;
        inset: 0;
        overflow: hidden;
        font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
        user-select: none;
        -webkit-user-select: none;
      }
      .sp-san {
        flex-direction: column;
        flex: 1;
        min-height: 0;
        display: flex;
        position: relative;
      }
      .sp-cau {
        z-index: 25;
        padding: 6px 16px 4px;
        position: relative;
        display: flex;
        justify-content: center;
      }
      .sp-canvas {
        width: 100%;
        height: 100%;
        display: block;
        position: absolute;
        inset: 0;
      }
      .sp-pads {
        z-index: 30;
        height: var(--tug-chan);
        pointer-events: none;
        justify-content: space-between;
        align-items: stretch;
        gap: clamp(8px, 1.6vw, 18px);
        padding: 4px clamp(10px, 2vw, 22px) clamp(6px, 1.2vh, 12px);
        display: flex;
        position: absolute;
        inset: auto 0 0;
      }
      .sp-pads > * {
        pointer-events: auto;
      }
      .sp-pads.is-paused {
        pointer-events: none;
        filter: blur(8px);
        opacity: 0.6;
      }
      .tug-pad {
        --tug-fs: clamp(13px, calc(var(--tug-chan) / 12), 20px);
        z-index: 10;
        border: 3px solid var(--c);
        background: #fffffffa;
        border-radius: 20px;
        flex-direction: column;
        flex: 0 auto;
        width: min(720px, 47vw);
        height: 100%;
        display: flex;
        position: relative;
        overflow: hidden;
        box-shadow: 0 14px 36px -14px rgba(22, 50, 74, 0.45);
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .tug-pad.is-locked {
        opacity: 0.55;
        filter: saturate(0.65);
        pointer-events: none;
      }
      .tug-pad.is-turn {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 50%, transparent), 0 14px 36px -14px rgba(22, 50, 74, 0.5);
      }
      .tug-pad__grid {
        flex: 1;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: clamp(6px, 0.9vh, 10px);
        padding: clamp(6px, 0.9vh, 10px) 10px clamp(7px, 1vh, 11px);
        display: grid;
        min-height: 0;
      }
      .tug-pad__btn {
        color: #0f172a;
        cursor: pointer;
        background: #f8fafc;
        border: 1.5px solid #cbd5e1;
        border-radius: 14px;
        align-items: center;
        gap: 10px;
        padding: 0 clamp(10px, 1.2vw, 16px);
        font-size: var(--tug-fs);
        font-weight: 700;
        display: flex;
        position: relative;
        overflow: hidden;
        transition: all 0.15s ease-out;
        box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      }
      .tug-pad__btn:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: var(--c);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.06);
      }
      .tug-pad__btn:active:not(:disabled) {
        transform: scale(0.98);
      }
      .tug-pad__btn.is-correct {
        color: #fff !important;
        background: #10b981 !important;
        border-color: #059669 !important;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.6) !important;
        transform: scale(1.02);
      }
      .tug-pad__btn.is-wrong {
        color: #fff !important;
        background: #ef4444 !important;
        border-color: #dc2626 !important;
        animation: sp-shake 0.4s ease-in-out;
      }
      .tug-pad__btn.is-dim {
        opacity: 0.35;
      }
      .tug-pad__letter {
        color: #fff;
        background: var(--c);
        border-radius: 8px;
        flex-shrink: 0;
        width: clamp(24px, 1.8vw, 32px);
        height: clamp(24px, 1.8vw, 32px);
        font-size: clamp(12px, 1.1vw, 16px);
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
      .tug-pad__btn.is-correct .tug-pad__letter { background: #065f46; }
      .tug-pad__btn.is-wrong .tug-pad__letter { background: #991b1b; }
      .tug-pad__text {
        flex: 1;
        min-width: 0;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.3;
      }
      .tug-pad__key {
        border: 1.5px solid color-mix(in srgb, var(--c) 45%, #fff);
        color: color-mix(in srgb, var(--c) 70%, #14283c);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: calc(var(--tug-fs) * 0.72);
        background: #fff;
        border-bottom-width: 3px;
        border-radius: 7px;
        flex-shrink: 0;
        padding: 2px 7px;
        font-weight: 900;
        line-height: 1.3;
      }
      .sp-chip-bac {
        color: #fff;
        text-transform: uppercase;
        border-radius: 99px;
        flex-shrink: 0;
        padding: 2px 10px;
        font-size: 11px;
        font-weight: 900;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .sp-chip-bac--1 { color: #422006; background: linear-gradient(90deg, #facc15, #f59e0b); }
      .sp-chip-bac--2 { color: #422006; background: linear-gradient(90deg, #fde047, #f59e0b); }
      .sp-chip-bac--3 {
        background: linear-gradient(90deg, #ff7a3d, #e11d48, #b91c1c, #ff7a3d) 0 0 / 200% 100%;
        animation: 1.6s linear infinite sp-cau-vong;
      }
      @keyframes sp-cau-vong {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      @keyframes sp-toast-vao {
        0% { opacity: 0; transform: translate(-50%, 15px) scale(0.9); }
        100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      @keyframes sp-shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
      .tug-toast {
        z-index: 45;
        white-space: normal;
        pointer-events: none;
        background: rgba(255, 255, 255, 0.98);
        border: 3px solid #16324a1f;
        border-radius: 20px;
        padding: 8px 24px;
        box-shadow: 0 16px 36px -12px rgba(22, 50, 74, 0.4);
        display: inline-flex;
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translate(-50%);
        animation: 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) sp-toast-vao;
        max-width: min(860px, 92%);
      }
      .tug-toast.is-good { border-color: #10b981; }
      .tug-toast.is-bad { border-color: #ef4444; }
      .tug-toast.is-timeout { border-color: #f59e0b; }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. SOUND SYNTHESIZER
  class DayGaySoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('sound_enabled') !== '0';
      this.bgmBuffer = null;
      this.bgmSource = null;
      this.bgmGain = null;
      this.isBgmPlaying = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setEnabled(val) {
      this.enabled = val;
      localStorage.setItem('sound_enabled', val ? '1' : '0');
      if (!val) this.stopBgm();
      else if (this.bgmBuffer) this.playBgm();
    }

    tone(opts) {
      if (!this.enabled) return;
      this.init();
      const { freq = 440, to, type = 'sine', dur = 0.2, gain = 0.2, delay = 0 } = opts;
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(10, to), t0 + dur);
      g.gain.setValueAtTime(gain, t0);
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }

    noise(opts) {
      if (!this.enabled) return;
      this.init();
      const { dur = 0.3, type = 'bandpass', freq = 1000, to, q = 1, gain = 0.2, attack = 0, delay = 0 } = opts;
      const t0 = this.ctx.currentTime + delay;
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * dur));
      const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = noiseBuf;

      const flt = this.ctx.createBiquadFilter();
      flt.type = type;
      flt.frequency.setValueAtTime(freq, t0);
      if (to !== undefined) flt.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
      flt.Q.setValueAtTime(q, t0);

      const g = this.ctx.createGain();
      if (attack > 0) {
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + Math.min(attack, dur));
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
      } else {
        g.gain.setValueAtTime(gain, t0);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
      }

      src.connect(flt);
      flt.connect(g);
      g.connect(this.ctx.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
    }

    clicks(opts) {
      if (!this.enabled) return;
      this.init();
      const { count = 10, from = 0.05, to = 1.0, freq = 2000, dur = 0.03, gain = 0.1 } = opts;
      for (let i = 0; i < count; i++) {
        const delay = from + Math.random() * (to - from);
        this.noise({ dur, type: 'bandpass', freq, q: 2, gain, delay });
      }
    }

    play(name, opts = {}) {
      if (!this.enabled) return;
      this.init();
      const intensity = opts.intensity !== undefined ? opts.intensity : 1;
      switch (name) {
        case 'correct':
          this.tone({ freq: 660, type: 'sine', dur: 0.09, gain: 0.3 });
          this.tone({ freq: 880, type: 'sine', dur: 0.16, gain: 0.3, delay: 0.09 });
          break;
        case 'wrong':
          this.tone({ freq: 160, to: 110, type: 'square', dur: 0.24, gain: 0.22 });
          break;
        case 'tick':
          this.tone({ freq: 880, type: 'sine', dur: 0.04, gain: 0.18 });
          break;
        case 'tung':
          [0, 0.17].forEach((delay, idx) => {
            const r = idx ? 1 : 0.7;
            this.tone({ freq: 62, to: 34, type: 'sine', dur: 1.5, gain: 0.75 * r, delay });
            this.tone({ freq: 128, to: 64, type: 'triangle', dur: 0.42, gain: 0.32 * r, delay });
            this.noise({ dur: 0.5, type: 'lowpass', freq: 700, to: 110, gain: 0.5 * r, delay });
            this.noise({ dur: 0.025, type: 'bandpass', freq: 1500, q: 1.2, gain: 0.22 * r, delay });
          });
          break;
        case 'ho-reo':
        case 'crowd': {
          const e = (0.6 + 0.6 * Math.max(0, Math.min(1, intensity)));
          for (let a = 0; a < 6; a++) {
            const r = 480 + 420 * Math.random();
            this.noise({ dur: 0.9 + 0.4 * Math.random(), type: 'bandpass', freq: r, to: 1.35 * r, q: 3.5, gain: 0.05 * e, attack: 0.08, delay: 0.04 * a });
          }
          this.noise({ dur: 1.1, type: 'bandpass', freq: 1500, q: 0.7, gain: 0.05 * e, attack: 0.15 });
          this.clicks({ count: 22, from: 0.05, to: 1.1, freq: 2600, dur: 0.03, gain: 0.07 * e });
          break;
        }
        case 'chieng':
          [[196, 0.22], [196 * 2.32, 0.1], [196 * 3.07, 0.06], [196 * 4.6, 0.035]].forEach(([freq, gain]) => {
            this.tone({ freq: 1.01 * freq, to: freq, type: 'sine', dur: 2.4, gain });
          });
          this.noise({ dur: 0.08, type: 'bandpass', freq: 900, q: 1, gain: 0.18 });
          break;
        case 'tu-luc':
          this.noise({ dur: 0.75, type: 'bandpass', freq: 300, to: 3400, q: 1.4, gain: 0.2, attack: 0.5 });
          this.tone({ freq: 110, to: 330, type: 'sawtooth', dur: 0.7, gain: 0.09 });
          this.tone({ freq: 220, to: 660, type: 'triangle', dur: 0.7, gain: 0.08 });
          break;
        case 'fanfare':
          [523, 659, 784, 1046].forEach((freq, idx) => {
            this.tone({ freq, type: 'square', dur: 0.16, gain: 0.24, delay: 0.12 * idx });
          });
          break;
        case 'pull':
          this.tone({ freq: 90, to: 60, type: 'sawtooth', dur: 0.18, gain: 0.16 });
          this.noise({ dur: 0.08, type: 'bandpass', freq: 800, gain: 0.12 });
          break;
        case 'thud':
          this.tone({ freq: 80, to: 45, type: 'sine', dur: 0.25, gain: 0.35 });
          break;
        case 'whistle':
          this.tone({ freq: 2100, type: 'sine', dur: 0.65, gain: 0.25 });
          break;
        case 'boom':
          this.noise({ dur: 0.7, type: 'lowpass', freq: 250, gain: 0.5 });
          this.tone({ freq: 90, to: 30, type: 'sawtooth', dur: 0.5, gain: 0.3 });
          break;
        case 'smash':
          this.noise({ dur: 0.3, type: 'lowpass', freq: 500, gain: 0.4 });
          this.tone({ freq: 180, to: 40, type: 'sine', dur: 0.35, gain: 0.35 });
          break;
        case 'crack':
          this.noise({ dur: 0.13, type: 'bandpass', freq: 2400, q: 1.5, gain: 0.3 });
          break;
        case 'bop':
          this.tone({ freq: 320, to: 120, type: 'sine', dur: 0.12, gain: 0.25 });
          break;
        case 'whoosh':
          this.noise({ dur: 0.35, type: 'bandpass', freq: 500, to: 1800, q: 1, gain: 0.2 });
          break;
      }
    }

    async generateBgmBuffer() {
      this.init();
      if (this.bgmBuffer) return this.bgmBuffer;
      const sr = this.ctx.sampleRate || 44100;
      const V = 60 / 126;
      const A = 60 / 126 * 64;
      const totalSamples = Math.ceil(sr * A);
      const L = new Float32Array(totalSamples);
      const R = new Float32Array(totalSamples);
      const vang = new Float32Array(totalSamples);
      const bufObj = { L, R, sr, vang };

      const K = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
      const melody = [
        ["D5",1.5],["C5",0.5],["A4",1],["C5",1],["D5",3],[null,1],["F5",1],["G5",0.5],["F5",0.5],["D5",1],["C5",1],["A4",3],[null,1],
        ["D5",1],["F5",1],["G5",1],["A5",1],["G5",1.5],["F5",0.5],["D5",2],["C5",1],["D5",0.5],["C5",0.5],["A4",1],["G4",1],["A4",2],
        ["D5",2],["A5",2],["G5",1],["A5",1],["A5",1.5],["G5",0.5],["F5",1],["G5",1],["A5",1],["D5",1],["F5",1],["G5",1],["A5",3],[null,1],
        ["D6",2],["C6",1],["A5",1],["G5",1.5],["A5",0.5],["G5",1],["F5",1],["D5",1],["F5",0.5],["G5",0.5],["A5",1],["C6",1],["D6",3],[null,1]
      ];

      function createPattern(fn) {
        let res = [];
        for (let a = 0; a < 16; a++) for (let i of fn(a)) res.push((4 * a + i) * V);
        return res;
      }

      const trongCaiTimes = createPattern(t => t % 4 === 3 ? [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.75] : t >= 8 ? [0, 0.5, 1, 2, 2.5, 3] : [0, 1, 2, 3]);
      const trongConTimes = createPattern(t => t >= 8 ? [0.5, 0.75, 1.5, 1.75, 2.5, 2.75, 3.5] : [0.5, 1.5, 2.5, 3.5]);
      const chumChoeTimes = createPattern(t => t % 4 === 3 ? [0, 3.75] : t >= 8 ? [0, 2] : t % 2 === 0 ? [0] : []);

      function biquad(sampleRate, freq, q) {
        let w0 = 2 * Math.PI * freq / sampleRate;
        let alpha = Math.sin(w0) / (2 * q);
        let b0 = alpha / (1 + alpha), b1 = 0, b2 = -alpha / (1 + alpha);
        let a1 = -2 * Math.cos(w0) / (1 + alpha), a2 = (1 - alpha) / (1 + alpha);
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        return x => {
          let y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
          x2 = x1; x1 = x; y2 = y1; y1 = y;
          return y;
        };
      }

      function mix(target, startSec, durSec, pan, reverb, gen) {
        let u = Math.floor(startSec * target.sr);
        let count = Math.min(target.L.length - u, Math.floor(durSec * target.sr));
        let panL = Math.cos((pan + 1) * Math.PI / 4);
        let panR = Math.sin((pan + 1) * Math.PI / 4);
        for (let i = 0; i < count; i++) {
          let val = gen(i / target.sr);
          target.L[u + i] += val * panL;
          target.R[u + i] += val * panR;
          target.vang[u + i] += val * reverb;
        }
      }

      // Drum: trongCai
      trongCaiTimes.forEach(t => {
        let o = (t / V) % 4;
        let amp = o === 0 ? 1 : o === 2 ? 0.9 : Number.isInteger(o) ? 0.75 : 0.62;
        let phi1 = 0, phi2 = 0, noiseState = 0;
        mix(bufObj, t, 1.6, 0, 0.4, time => {
          let f1 = 62 * Math.pow(34 / 62, Math.min(1, time / 0.7));
          let f2 = 128 * Math.pow(64 / 128, Math.min(1, time / 0.22));
          phi1 += 2 * Math.PI * f1 / sr;
          phi2 += 2 * Math.PI * f2 / sr;
          let white = Math.random() * 2 - 1;
          noiseState += (1 - Math.exp(-2 * Math.PI * (700 * Math.pow(110 / 700, Math.min(1, time / 0.45))) / sr)) * (white - noiseState);
          return (Math.sin(phi1) * Math.exp(-time / 0.42) * 1.05 +
                  (2 / Math.PI * Math.asin(Math.sin(phi2))) * Math.exp(-time / 0.11) * 0.45 +
                  noiseState * Math.exp(-time / 0.14) * 1.4) * Math.min(1, time / 0.003) * amp;
        });
      });

      // Drum: trongCon
      trongConTimes.forEach((t, idx) => {
        let amp = idx % 2 === 0 ? 0.9 : 0.65;
        let flt = biquad(sr, 1900, 1.1);
        let phi = 0;
        mix(bufObj, t, 0.24, -0.25, 0.2, time => {
          let f = 230 * Math.pow(165 / 230, Math.min(1, time / 0.12));
          phi += 2 * Math.PI * f / sr;
          let white = Math.random() * 2 - 1;
          return ((2 / Math.PI * Math.asin(Math.sin(phi))) * Math.exp(-time / 0.055) * 0.32 + flt(white) * Math.exp(-time / 0.025) * 0.9) * amp;
        });
      });

      // Cymbals: chumChoe
      chumChoeTimes.forEach(t => {
        let flt = biquad(sr, 7200, 0.7);
        let lastWhite = 0;
        mix(bufObj, t, 0.8, 0.3, 0.25, time => {
          let white = Math.random() * 2 - 1;
          let diff = white - lastWhite;
          lastWhite = white;
          return (0.11 * diff + 0.25 * flt(white)) * Math.exp(-time / 0.22);
        });
      });

      // Oboe: ken
      let noteTime = 0;
      for (let [note, dur] of melody) {
        if (note) {
          let match = /^([A-G])(#?)(\d)$/.exec(note);
          let semitones = 12 * (Number(match[3]) + 1) + K[match[1]] + (match[2] ? 1 : 0) - 69;
          let freq = 440 * Math.pow(2, semitones / 12);
          let flt1 = biquad(sr, 1150, 1.6);
          let flt2 = biquad(sr, 2500, 2.4);
          let phase = 0, lpState = 0;
          mix(bufObj, noteTime * V, dur * V * 0.96, 0.12, 0.3, time => {
            let vibrato = 1 + 0.013 * Math.min(1, time / Math.min(0.25, 0.6 * dur * V)) * Math.sin(2 * Math.PI * 5.8 * time);
            phase = (phase + (time < 0.06 ? freq * (0.94 + time) : freq) * vibrato / sr) % 1;
            let saw = 2 * phase - 1 + (phase < 0.5 ? 0.35 : -0.35);
            lpState += 0.45 * ((flt1(saw) + flt2(saw)) * 1.6 - lpState);
            return lpState * 0.32 * Math.max(0, Math.min(1, time / 0.03, (dur * V * 0.96 - time) / 0.07));
          });
        }
        noteTime += dur;
      }

      let maxPeak = 0;
      for (let ch of [bufObj.L, bufObj.R]) {
        for (let i = 0; i < totalSamples; i++) {
          ch[i] = Math.tanh(0.9 * ch[i]);
          if (Math.abs(ch[i]) > maxPeak) maxPeak = Math.abs(ch[i]);
        }
      }
      let norm = maxPeak > 0 ? 0.85 / maxPeak : 1;
      let fadeOut = Math.floor(0.01 * sr);
      const audioBuf = this.ctx.createBuffer(2, totalSamples, sr);
      [bufObj.L, bufObj.R].forEach((ch, chIdx) => {
        for (let i = 0; i < totalSamples; i++) {
          ch[i] *= norm * Math.min(1, (totalSamples - 1 - i) / fadeOut);
        }
        audioBuf.copyToChannel(ch, chIdx);
      });

      this.bgmBuffer = audioBuf;
      return audioBuf;
    }

    async playBgm() {
      if (!this.enabled) return;
      this.init();
      if (this.isBgmPlaying) return;
      if (!this.bgmBuffer) await this.generateBgmBuffer();
      if (!this.enabled) return;

      this.bgmSource = this.ctx.createBufferSource();
      this.bgmSource.buffer = this.bgmBuffer;
      this.bgmSource.loop = true;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0.45, this.ctx.currentTime + 1.2);

      this.bgmSource.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);
      this.bgmSource.start();
      this.isBgmPlaying = true;
    }

    stopBgm() {
      if (this.bgmSource && this.isBgmPlaying) {
        try {
          const curTime = this.ctx ? this.ctx.currentTime : 0;
          if (this.bgmGain) {
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, curTime);
            this.bgmGain.gain.linearRampToValueAtTime(0.001, curTime + 0.4);
          }
          setTimeout(() => {
            try { this.bgmSource.stop(); } catch (e) {}
            this.isBgmPlaying = false;
          }, 450);
        } catch (e) {
          this.isBgmPlaying = false;
        }
      }
    }

    getCurrentMusicTime() {
      if (!this.ctx || !this.isBgmPlaying) return null;
      const V = 60 / 126;
      const A = V * 64;
      return this.ctx.currentTime % A;
    }
  }

  // 3. CANVAS RENDERER FOR STICK PUSH
  const AURA_COLORS = {
    1: ["#fffbe6", "#fde68a", "#facc15"],
    2: ["#fff7c2", "#fde047", "#f59e0b"],
    3: ["#fff1d6", "#ffb38a", "#ff5a36", "#e11d48"]
  };

  const AURA_RGB = {
    1: { loi: "255,255,226", than: "255,214,64", mep: "255,170,20" },
    2: { loi: "255,252,215", than: "255,196,36", mep: "255,128,0" },
    3: { loi: "255,238,205", than: "255,62,38", mep: "200,0,40" }
  };

  const MUSICIANS_LAYOUT = [
    { id: "trong_cai", x: 1022, chan: 500, cao: 214, lat: false },
    { id: "ken", x: 112, chan: 562, cao: 132, lat: false },
    { id: "trong_con", x: 262, chan: 570, cao: 124, lat: false },
    { id: "chum_choe", x: 1388, chan: 568, cao: 128, lat: true },
    { id: "ken", x: 1515, chan: 562, cao: 132, lat: true }
  ];

  const SPEECH_WIN = ["Dô ta!", "Còn lâu nhé!", "Đẩy nữa đi nào!", "Chuyện nhỏ!", "Hự!!!", "Lùi lại coi!"];
  const SPEECH_LOSE = ["Ối dồi ôi!", "Từ từ đã…!", "Trượt chân rồi!", "Ơ kìa…?", "Khoan khoan!"];
  const SPEECH_FLY = ["Thả tui xuống!", "Á á á!", "Cứu với!"];
  const SPEECH_HOLD = ["Gồng lên!", "Không lùi!", "Hừm…!"];

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const easeOutCubic = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

  class EyStickPushRenderer {
    constructor(canvas, assets, characters, teams, soundEngine) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.bo = assets;
      this.nhanVat = characters;
      this.doi = teams;
      this.sound = soundEngine;
      this.onXong = null;

      this.raf = 0;
      this.tCu = 0;
      this.dongBang = false;
      this.gio = 0;

      this.viTri = 0;
      this.nac = 80;
      this.chuoi = [0, 0];
      this.cheDo = "cho";
      this.luot = null;
      this.tLuot = 0;
      this.dai = 0;
      this.tuViTri = 0;
      this.toiViTri = 0;
      this.nhacBong = false;
      this.dungV = [true, true];
      this.bamV = [false, false];

      this.ketQua = null;
      this.tKet = 0;

      this.hat = [];
      this.chuBay = [];
      this.dau = null;
      this.bong = null;
      this.rung = 0;
      this.soi = null;
      this.zoom = 1;
      this.camX = 800;
      this.reo = 0;

      this.vongLap = (t) => {
        this.raf = requestAnimationFrame(this.vongLap);
        const dt = (this.tCu ? Math.min(0.05, (t - this.tCu) / 1000) : 0);
        this.tCu = t;
        if (this.dongBang) return;
        this.capNhat(dt);
        this.ve();
      };

      this.raf = requestAnimationFrame(this.vongLap);
    }

    huy() {
      cancelAnimationFrame(this.raf);
    }

    datDongBang(val) {
      this.dongBang = val;
    }

    datTrangThai(viTri, nac, chuoi) {
      this.viTri = viTri;
      this.nac = nac;
      this.chuoi = chuoi;
      if (this.cheDo !== "dien") this.cheDo = "cho";
      this.ketQua = null;
    }

    dien(luot, toiViTri) {
      this.luot = luot;
      this.bamV = [luot.doi === 0, luot.doi === 1];
      this.dungV = [luot.doi !== 0 || luot.dung, luot.doi !== 1 || luot.dung];
      this.cheDo = "dien";
      this.tLuot = 0;
      this.tuViTri = this.viTri;
      this.toiViTri = toiViTri;
      this.nhacBong = luot.dung && Math.abs(toiViTri) >= this.nac;

      const isSuper = luot.dung && luot.chuoi[luot.doi] >= 4;
      this.dai = this.nhacBong ? 2.7 : isSuper ? 2.2 : (luot.delta === 0 ? 1.7 : 1.9);

      for (let team of [0, 1]) {
        if (!this.dungV[team] && luot.chuoiTruoc[team] >= 2) {
          this.voHaoQuang(team, luot.chuoiTruoc[team]);
        }
      }

      if (luot.phaThan !== null) {
        this.dau = {
          chu: "PHÁ THẦN!",
          mau: "#fff",
          vien: this.doi[luot.phaThan].color,
          t: 0,
          co: 118
        };
        this.sound.play("smash");
      } else {
        const topAuraTeam = [0, 1]
          .filter(e => this.bamV[e] && this.dungV[e] && luot.chuoi[e] >= 2 && luot.chuoi[e] <= 4)
          .sort((a, b) => luot.chuoi[b] - luot.chuoi[a])[0];

        if (topAuraTeam !== undefined) {
          const val = luot.chuoi[topAuraTeam];
          this.dau = val >= 4 ? { chu: "HÓA THẦN!", mau: "#fff", vien: "#b91c1c", t: 0, co: 132 }
                   : val === 3 ? { chu: "BÙNG CHÁY!", mau: "#fff7ed", vien: "#ea580c", t: 0, co: 104 }
                   : { chu: "TỎA SÁNG", mau: "#fffbeb", vien: "#ca8a04", t: 0, co: 88 };
          this.sound.play("tu-luc");
        }
      }

      const speakTeam = Math.random() < 0.7 ? luot.doi : (luot.doi === 0 ? 1 : 0);
      const text = this.nhacBong && speakTeam !== luot.doi ? randomChoice(SPEECH_FLY)
                 : speakTeam === luot.doi ? (luot.dung ? randomChoice(SPEECH_WIN) : randomChoice(SPEECH_LOSE))
                 : (luot.dung ? randomChoice(SPEECH_LOSE) : randomChoice(SPEECH_HOLD));

      this.bong = { doi: speakTeam, chu: text, t: 0 };
      this.sound.play(luot.delta === 0 ? "pull" : "whoosh");

      this.vaCham(luot);
    }

    vaCham(luot) {
      const contactX = this.diemTiepXuc();
      const contactY = this.yGay();

      for (let team of [0, 1]) {
        if (!this.bamV[team]) continue;
        const hand = this.viTriTay(team);
        const scoreStr = luot.tien[team] > 0 ? `+${luot.tien[team]}` : `−${Math.abs(luot.tien[team])}`;
        this.chuBay.push({
          x: hand.x + (team === 0 ? -190 : 190),
          y: 525,
          chu: scoreStr,
          mau: luot.tien[team] > 0 ? "#16a34a" : "#dc2626",
          t: 0,
          co: 60
        });

        if (this.dungV[team] && luot.chuoi[team] === 2) {
          this.chuBay.push({
            x: hand.x + (team === 0 ? -190 : 190),
            y: 465,
            chu: "x1.5",
            mau: "#ca8a04",
            t: -0.15,
            co: 44
          });
        }

        if (!this.dungV[team]) {
          for (let i = 0; i < 5; i++) {
            this.themHat(this.tamThan(team).x, 430, 60 * Math.cos(1.26 * i), 20 * Math.sin(1.26 * i) - 40, 1.2, "#fde047", 16, "sao");
          }
        }
      }

      if (luot.dung) {
        this.reo = 0.9 + 0.25 * Math.min(4, luot.chuoi[luot.doi]);
        this.sound.play("tung");
        this.sound.play("ho-reo", { intensity: Math.min(1, luot.chuoi[luot.doi] / 4) });
      }

      if (luot.dung && luot.chuoi[luot.doi] >= 4) {
        this.sound.play("boom");
        this.sound.play("chieng");
        this.rung = 22;
        this.soi = { x: this.tamThan(luot.doi).x, t: 0 };
        for (let i = 0; i < 36; i++) {
          const rad = i / 36 * Math.PI * 2;
          this.themHat(contactX, contactY, 520 * Math.cos(rad), 200 * Math.sin(rad), 0.55, randomChoice(AURA_COLORS[3]), 10, "tia");
        }
      } else if (luot.delta !== 0) {
        this.rung = Math.max(this.rung, Math.min(12, Math.abs(luot.delta) / 2));
      }

      const opp = luot.doi === 0 ? 1 : 0;
      if (luot.dung && this.bacHien(opp) > 0) {
        this.sound.play("crack");
        const count = 10 + 6 * (this.bacHien(0) + this.bacHien(1));
        for (let i = 0; i < count; i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
          const spd = 180 + 260 * Math.random();
          this.themHat(contactX, contactY, Math.cos(angle) * spd, Math.sin(angle) * spd, 0.5, randomChoice(["#fff7c2", "#fde047", this.doi[0].color, this.doi[1].color]), 7, "tia");
        }
      }

      for (let i = 0; i < 8; i++) {
        const moveTeam = luot.delta >= 0 ? 0 : 1;
        this.themHat(this.tamThan(moveTeam).x, 704, (Math.random() - 0.5) * 120, -40 - 60 * Math.random(), 0.6, "#e7c9a5", 12, "bui");
      }

      if (Math.abs(this.toiViTri) >= this.nac - 0.001) {
        this.sound.play("crowd", { intensity: 1 });
      }
    }

    voHaoQuang(team, streak) {
      const tier = streak >= 4 ? 3 : streak === 3 ? 2 : 1;
      const center = this.tamThan(team);
      this.sound.play("bop");
      for (let i = 0; i < 26; i++) {
        const rad = i / 26 * Math.PI * 2;
        this.themHat(center.x + 90 * Math.cos(rad), 550 + 130 * Math.sin(rad), 260 * Math.cos(rad), 260 * Math.sin(rad), 0.6, randomChoice(AURA_COLORS[tier]), 9, "manh");
      }
    }

    themHat(x, y, vx, vy, tho, mau, co, kieu, sau = false) {
      if (this.hat.length > 420) return;
      this.hat.push({ x, y, vx, vy, song: 0, tho, mau, co, kieu, sau });
    }

    diemTiepXuc() {
      return 800 + (this.viTri / this.nac) * 430;
    }

    nguyHiem() {
      const ratio = this.viTri / this.nac;
      return ratio >= 0.8 ? 1 : ratio <= -0.8 ? 0 : null;
    }

    bacHien(team) {
      if (this.cheDo === "dien" && this.luot) {
        return this.tLuot < 0.22 ? (this.luot.chuoiTruoc[team] >= 4 ? 3 : this.luot.chuoiTruoc[team] === 3 ? 2 : (this.luot.chuoiTruoc[team] === 2 ? 1 : 0))
             : this.dungV[team] ? (this.luot.chuoi[team] >= 4 ? 3 : this.luot.chuoi[team] === 3 ? 2 : (this.luot.chuoi[team] === 2 ? 1 : 0)) : 0;
      }
      return this.chuoi[team] >= 4 ? 3 : this.chuoi[team] === 3 ? 2 : (this.chuoi[team] === 2 ? 1 : 0);
    }

    tuThe(team) {
      const poses = this.bo.nv[this.nhanVat[team]] || {};
      const frameCount = pose => poses[pose]?.so || 1;
      const loopFrame = (pose, fps, time) => Math.floor(time * fps) % frameCount(pose);
      const clampFrame = (pose, time, dur) => Math.min(frameCount(pose) - 1, Math.floor(time / dur * frameCount(pose)));

      if (this.cheDo === "ket" && this.ketQua) {
        const { thang, ra } = this.ketQua;
        if (thang === "hoa" || thang === team) return { ten: "thang", khung: loopFrame("thang", 9, this.tKet), nhac: 0 };
        if (ra) return { ten: "thua", khung: clampFrame("thua", this.tKet, 2.4), nhac: 0 };
        return { ten: "thua", khung: Math.min(frameCount("thua") - 1, 4 + Math.floor(this.tKet / 1.2)), nhac: 0 };
      }

      if (this.cheDo === "dien" && this.luot) {
        const l = this.luot;
        const t = this.tLuot;
        const ejectTeam = this.nhacBong ? (l.doi === 0 ? 1 : 0) : null;
        if (ejectTeam !== null && ejectTeam === team && t > 0.3) {
          const rise = easeOutCubic((t - 0.3) / 0.35);
          const fade = t > this.dai - 0.5 ? 1 - easeOutCubic((t - (this.dai - 0.5)) / 0.12) : 1;
          if (fade > 0.02) return { ten: "bay", khung: loopFrame("bay", 12, t), nhac: Math.min(rise, fade) };
        }
        if (t < 0.3) return { ten: "gong", khung: loopFrame("gong", 14, t), nhac: 0 };
        const pushDirection = l.delta === 0 ? null : l.delta > 0 ? 0 : 1;
        return this.dungV[team]
          ? (pushDirection === team ? { ten: "day", khung: loopFrame("day", 12, t), nhac: 0 } : { ten: "gong", khung: loopFrame("gong", 12, t), nhac: 0 })
          : { ten: "loangchoang", khung: clampFrame("loangchoang", t - 0.3, this.dai - 0.5), nhac: 0 };
      }

      return { ten: "gong", khung: loopFrame("gong", this.nguyHiem() === team ? 11 : 5, this.gio + 0.37 * team), nhac: 0 };
    }

    viTriTay(team) {
      const contactX = this.diemTiepXuc();
      const dir = team === 0 ? -1 : 1;
      const { ten, khung, nhac } = this.tuThe(team);
      const baseOffsetX = contactX + dir * (90 + (ten === "bay" ? 200 * nhac : 0));
      const sheet = this.bo.nv[this.nhanVat[team]]?.[ten] || this.bo.nv[this.nhanVat[team]]?.["gong"];
      const hand = sheet?.tay?.[khung] || sheet?.tay?.[0];

      if (!sheet || !hand) return { x: baseOffsetX, y: 540, sau: baseOffsetX + 120 * dir };
      const rise = ten === "bay" ? 70 * nhac : 0;
      return {
        x: baseOffsetX,
        y: 700 + sheet.le - hand.y - rise,
        sau: baseOffsetX - dir * (hand.x - hand.sau)
      };
    }

    yGay() {
      return (this.viTriTay(0).y + this.viTriTay(1).y) / 2;
    }

    tamThan(team) {
      const contactX = this.diemTiepXuc();
      const dir = team === 0 ? -1 : 1;
      const pose = this.cheDo === "dien" ? this.tuThe(team) : null;
      let baseX = contactX + dir * (210 + (pose?.ten === "bay" ? 200 * pose.nhac : 0));
      if (this.cheDo === "ket" && this.ketQua?.ra && this.ketQua.thang !== "hoa" && this.ketQua.thang !== team) {
        baseX += 260 * dir * easeOutCubic(this.tKet / 1);
      }
      return { x: baseX, y: 550 };
    }

    ketThuc(thang, ra) {
      this.cheDo = "ket";
      this.ketQua = { thang, ra };
      this.tKet = 0;
      this.chuoi = [0, 0];
      if (ra) this.sound.play("whistle");
    }

    capNhat(dt) {
      this.gio += dt;

      if (this.cheDo === "dien" && this.luot) {
        this.tLuot += dt;
        const prog = Math.min(1, this.tLuot / this.dai);
        const easeProg = easeOutCubic(prog);
        this.viTri = this.tuViTri + (this.toiViTri - this.tuViTri) * easeProg;

        if (prog >= 1) {
          const completedLuot = this.luot;
          this.viTri = this.toiViTri;
          this.chuoi = completedLuot.chuoi;
          this.cheDo = "cho";
          this.luot = null;
          if (this.onXong) this.onXong(completedLuot);
        }
      } else if (this.cheDo === "ket") {
        this.tKet += dt;
      }

      for (let team of [0, 1]) {
        const tier = this.bacHien(team);
        if (tier > 0 && this.cheDo !== "ket") {
          const center = this.tamThan(team);
          const factor = tier === 3 ? 1.45 : 1;
          if (Math.random() < dt * (tier === 3 ? 35 : 18)) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const r = Math.random();
            const px = center.x + dir * (80 + 55 * Math.random()) * factor * (1 - 0.45 * r);
            const py = 685 - 240 * r;
            this.themHat(px, py, -dir * (10 + 25 * Math.random()), -280 - 220 * Math.random() * factor, 0.35, randomChoice(AURA_COLORS[tier]), (8 + 2 * tier) * factor, "luoi");
          }
          if (tier === 3 && Math.random() < 1.4 * dt) {
            this.soi = { x: center.x + (Math.random() - 0.5) * 80, t: 0 };
          }
        }
      }

      const danger = this.nguyHiem();
      if (danger !== null && this.cheDo === "cho" && Math.random() < 5 * dt) {
        const hand = this.viTriTay(danger);
        this.themHat(hand.x + (danger === 0 ? -60 : 60), hand.y - 110, (danger === 0 ? -1 : 1) * 80, -120, 0.7, "#7dd3fc", 7, "giot");
      }

      for (let p of this.hat) {
        p.song += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kieu === "bui" || p.kieu === "giot" || p.kieu === "manh") p.vy += 420 * dt;
        if (p.kieu === "lua") p.vx *= 0.97;
      }
      this.hat = this.hat.filter(p => p.song < p.tho);

      for (let t of this.chuBay) t.t += dt;
      this.chuBay = this.chuBay.filter(t => t.t < 1.5);

      if (this.dau) {
        this.dau.t += dt;
        if (this.dau.t > 1.6) this.dau = null;
      }

      if (this.bong) {
        this.bong.t += dt;
        if (this.bong.t > 1.5) this.bong = null;
      }

      if (this.soi) {
        this.soi.t += dt;
        if (this.soi.t > 0.6) this.soi = null;
      }

      this.rung *= 0.88;
      this.reo = Math.max(0, this.reo - dt);
    }

    ve() {
      const { ctx, cv } = this;
      const w = cv.width;
      const h = cv.height;
      if (!w || !h) return;

      const scale = Math.min(w / 1450, h / 560) * this.zoom;
      const centerY = 558 - (this.zoom - 1) * 120;
      const shakeX = (Math.random() - 0.5) * this.rung;
      const shakeY = (Math.random() - 0.5) * this.rung;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#cf6a4c";
      ctx.fillRect(0, 0, w, h);

      ctx.setTransform(scale, 0, 0, scale, w / 2 - this.camX * scale + shakeX, h / 2 - centerY * scale + shakeY);

      this.veNen(w, scale);
      this.veNhacCong();
      this.veVong();

      const handA = this.viTriTay(0);
      const handB = this.viTriTay(1);

      for (let t of [0, 1]) this.veBong(t);
      for (let t of [0, 1]) this.veHaoQuang(t, "sau");
      this.veHat(true);

      if (this.cheDo !== "ket") this.veGay(handA, handB);

      for (let t of [0, 1]) this.veNhanVat(t);
      for (let t of [0, 1]) this.veHaoQuang(t, "truoc");

      this.veSet();
      this.veHat(false);
      this.veChuBay();
      this.veBongThoai();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.veDau(w, h);
    }

    veNen(w, scale) {
      const { ctx } = this;
      const img = this.bo.nen;
      const left = this.camX - w / scale / 2 - 80;
      const right = this.camX + w / scale / 2 + 80;

      ctx.fillStyle = "#8fd0ff";
      ctx.fillRect(left, -2000, right - left, 2300);
      ctx.fillStyle = "#cf6a4c";
      ctx.fillRect(left, 600, right - left, 2000);

      if (img && img.complete) {
        for (let tile = Math.floor(left / 1600); 1600 * tile < right; tile++) {
          ctx.save();
          ctx.translate(1600 * tile, 0);
          if (tile % 2 !== 0) {
            ctx.translate(1600, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(img, 0, 0, 1600, 900);
          ctx.restore();
        }
      }
    }

    veNhacCong() {
      const nc = this.bo.nc;
      if (!nc) return;
      const { ctx } = this;
      const time = this.sound.getCurrentMusicTime() ?? (this.gio % 30.47);
      const beat = 60 / 126;

      for (let item of MUSICIANS_LAYOUT) {
        const sheet = nc[item.id];
        if (!sheet || !sheet.anh || !sheet.anh.complete) continue;
        let frame = 0;
        let bounce = 0;

        if (item.id === "trong_cai") {
          const beatProgress = (time / beat) % 1;
          frame = beatProgress < 0.25 ? 1 : beatProgress < 0.5 ? 2 : 0;
          if (beatProgress < 0.28) this.veSongTrong(beatProgress / 0.28);
        } else if (item.id === "trong_con") {
          frame = Math.floor((time / beat) * 2) % 4;
        } else if (item.id === "chum_choe") {
          frame = Math.floor(time / beat) % 4;
          bounce = 6 * Math.max(0, 1 - ((time / beat) % 1) / 0.2);
        } else {
          frame = Math.floor(time / beat) % 4;
        }

        if (this.reo > 0 && item.id !== "trong_cai") {
          bounce += 14 * Math.abs(Math.sin(13 * this.gio)) * Math.min(1, this.reo);
        }

        const scaleRatio = item.cao / (sheet.h - sheet.le);
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = "#3c190a";
        ctx.beginPath();
        ctx.ellipse(item.x, item.chan + 2, 0.3 * item.cao, 7, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(item.x, item.chan - bounce);
        ctx.scale(item.lat ? -scaleRatio : scaleRatio, scaleRatio);
        ctx.drawImage(sheet.anh, Math.min(sheet.so - 1, frame) * sheet.w, 0, sheet.w, sheet.h, -sheet.w / 2, -(sheet.h - sheet.le), sheet.w, sheet.h);
        ctx.restore();
      }
    }

    veSongTrong(t) {
      const { ctx } = this;
      const x = 1142, y = 362, rx = 34, ry = 62;
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.55;
      ctx.fillStyle = "#fff7d6";
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      const s = 1 + t * 0.9;
      ctx.beginPath();
      ctx.ellipse(x - 6, y, rx * s, ry * s, 0, 0.55 * Math.PI, 1.45 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    veVong() {
      const { ctx } = this;
      const danger = this.nguyHiem();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(800, 700, 640, 118, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 240, 220, 0.13)";
      ctx.fill();

      ctx.lineWidth = 14;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.setLineDash([46, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(120, 60, 40, 0.35)";
      ctx.beginPath();
      ctx.ellipse(800, 704, 648, 121, 0, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(800, 635.1);
      ctx.lineTo(800, 764.9);
      ctx.stroke();

      if (danger !== null && this.cheDo !== "ket") {
        const alpha = 0.45 + 0.45 * Math.sin(12 * this.gio);
        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 20;
        ctx.beginPath();
        const start = danger === 1 ? -0.9 : Math.PI - 0.9;
        ctx.ellipse(800, 700, 640, 118, 0, start, start + 1.8);
        ctx.stroke();
      }
      ctx.restore();
    }

    veBong(team) {
      const { ctx } = this;
      const center = this.tamThan(team);
      const pose = this.tuThe(team);

      ctx.save();
      ctx.globalAlpha = 0.85 - 0.5 * pose.nhac;
      ctx.beginPath();
      ctx.ellipse(center.x, 706, 118 - 40 * pose.nhac, 24 - 8 * pose.nhac, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(60, 20, 10, 0.28)";
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = this.doi[team].color;
      ctx.globalAlpha = 0.75 - 0.5 * pose.nhac;
      ctx.stroke();

      const streak = Math.min(4, this.chuoi[team]);
      const dotY = 724;
      for (let i = 0; i < 4; i++) {
        const dotX = center.x + (i - 1.5) * 18;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = i < streak ? "#facc15" : "rgba(255, 255, 255, 0.4)";
        ctx.fill();
        if (i < streak) {
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    veGay(handA, handB) {
      const { ctx } = this;
      const dx = handB.x - handA.x;
      const dy = handB.y - handA.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;

      const leftEnd = { x: handA.x - ux * Math.abs(handA.x - handA.sau), y: handA.y - uy * Math.abs(handA.x - handA.sau) };
      const rightEnd = { x: handB.x + ux * Math.abs(handB.sau - handB.x), y: handB.y + uy * Math.abs(handB.sau - handB.x) };

      let flex = 3 + 2 * Math.sin(9 * this.gio);
      if (this.cheDo === "dien" && this.luot && this.luot.dung) {
        const t = this.tLuot;
        flex = 26 * Math.sin(Math.min(1, t / this.dai) * Math.PI) + 3 * Math.sin(40 * t);
      }

      const midX = (leftEnd.x + rightEnd.x) / 2 + uy * flex;
      const midY = (leftEnd.y + rightEnd.y) / 2 - Math.abs(ux) * flex;

      const drawStroke = (lineWidth, strokeStyle) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(leftEnd.x, leftEnd.y);
        ctx.quadraticCurveTo(midX, midY, rightEnd.x, rightEnd.y);
        ctx.stroke();
      };

      ctx.save();
      ctx.lineCap = "round";
      drawStroke(22, "#4a2d14");
      drawStroke(16, "#d7b04a");
      drawStroke(5, "rgba(255, 248, 200, 0.6)");

      ctx.strokeStyle = "#7c5a1e";
      ctx.lineWidth = 4;
      const totalLen = Math.hypot(rightEnd.x - leftEnd.x, rightEnd.y - leftEnd.y);
      for (let pos = 60; pos < totalLen - 30; pos += 92) {
        const ratio = pos / totalLen;
        const ix = (1 - ratio) * (1 - ratio) * leftEnd.x + 2 * (1 - ratio) * ratio * midX + ratio * ratio * rightEnd.x;
        const iy = (1 - ratio) * (1 - ratio) * leftEnd.y + 2 * (1 - ratio) * ratio * midY + ratio * ratio * rightEnd.y;
        ctx.beginPath();
        ctx.moveTo(ix - 9 * uy, iy - 8);
        ctx.lineTo(ix + 9 * uy, iy + 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    veNhanVat(team) {
      const { ctx } = this;
      const { ten, khung, nhac } = this.tuThe(team);
      const sheet = this.bo.nv[this.nhanVat[team]]?.[ten] || this.bo.nv[this.nhanVat[team]]?.["gong"];
      if (!sheet || !sheet.anh || !sheet.anh.complete) return;

      const isRight = team === 1;
      ctx.save();

      if (sheet.tay) {
        const hand = sheet.tay[khung] || sheet.tay[0];
        const handPos = this.viTriTay(team);
        const rise = ten === "bay" ? 70 * nhac : 0;
        ctx.translate(handPos.x, 700 - rise);
        ctx.scale(isRight ? -1 : 1, 1);
        ctx.drawImage(sheet.anh, khung * sheet.w, 0, sheet.w, sheet.h, -hand.x, -(sheet.h - sheet.le), sheet.w, sheet.h);
      } else {
        const center = this.tamThan(team);
        let groundY = 700;
        if (this.cheDo === "ket" && this.ketQua?.ra && ten === "thua") {
          groundY = 700 - 170 * Math.sin(Math.min(1, this.tKet / 1) * Math.PI);
        }
        ctx.translate(center.x, groundY);
        ctx.scale(isRight ? -1 : 1, 1);
        ctx.drawImage(sheet.anh, khung * sheet.w, 0, sheet.w, sheet.h, -sheet.w / 2, -(sheet.h - sheet.le), sheet.w, sheet.h);
      }

      ctx.restore();
    }

    veHaoQuang(team, layer) {
      const tier = this.bacHien(team);
      if (tier === 0 || this.cheDo === "ket") return;
      const { ctx } = this;
      const cfg = AURA_RGB[tier];
      const center = this.tamThan(team);
      const pose = this.tuThe(team);
      const cx = center.x;
      const cy = 560 - 70 * pose.nhac;
      const isGod = tier === 3;
      const pulse = 1 + 0.05 * Math.sin(this.gio * (isGod ? 11 : 6));
      const rad = (isGod ? 360 : 240 + 30 * tier) * pulse;

      ctx.save();
      if (layer === "sau") {
        const grad = ctx.createRadialGradient(cx, cy + 20, 20, cx, cy + 20, rad);
        grad.addColorStop(0, `rgba(${cfg.than}, ${isGod ? 0.5 : 0.32})`);
        grad.addColorStop(0.55, `rgba(${cfg.mep}, ${isGod ? 0.2 : 0.1})`);
        grad.addColorStop(1, `rgba(${cfg.mep}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - rad, cy + 20 - rad, 2 * rad, 2 * rad);
      } else {
        ctx.strokeStyle = `rgba(${cfg.loi}, 0.8)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 140 * pulse, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }

    veSet() {
      if (!this.soi) return;
      const { ctx } = this;
      ctx.save();
      ctx.strokeStyle = "rgba(245, 252, 255, 0.95)";
      ctx.shadowColor = "#a5f3fc";
      ctx.shadowBlur = 24;
      ctx.lineWidth = 7;
      let x = this.soi.x + (Math.random() - 0.5) * 30;
      let y = -40;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const targetY = this.yGay();
      while (y < targetY - 10) {
        x += (Math.random() - 0.5) * 70;
        y += 50 + 40 * Math.random();
        ctx.lineTo(x, Math.min(y, targetY));
      }
      ctx.stroke();
      ctx.restore();
    }

    veHat(layerBehind) {
      const { ctx } = this;
      ctx.save();
      for (let p of this.hat) {
        if (p.sau !== layerBehind) continue;
        const alpha = Math.max(0, 1 - p.song / p.tho);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.mau;

        if (p.kieu === "sao") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.co * 0.5, 0, 2 * Math.PI);
          ctx.fill();
        } else if (p.kieu === "tia") {
          ctx.strokeStyle = p.mau;
          ctx.lineWidth = 0.5 * p.co;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 0.04 * p.vx, p.y - 0.04 * p.vy);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.co * 0.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    veChuBay() {
      const { ctx } = this;
      ctx.save();
      for (let c of this.chuBay) {
        const prog = Math.min(1, c.t / 1.5);
        ctx.font = `900 ${c.co}px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`;
        ctx.textAlign = "center";
        ctx.fillStyle = c.mau;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 6;
        const y = c.y - 120 * prog;
        ctx.globalAlpha = Math.max(0, 1 - prog);
        ctx.strokeText(c.chu, c.x, y);
        ctx.fillText(c.chu, c.x, y);
      }
      ctx.restore();
    }

    veBongThoai() {
      if (!this.bong) return;
      const { ctx } = this;
      const team = this.bong.doi;
      const center = this.tamThan(team);
      const prog = Math.min(1, this.bong.t / 1.5);
      const alpha = Math.max(0, 1 - prog);

      ctx.save();
      ctx.globalAlpha = alpha;
      const x = center.x + (team === 0 ? -120 : 120);
      const y = 380 - 30 * prog;

      ctx.font = `800 22px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`;
      const metrics = ctx.measureText(this.bong.chu);
      const padding = 14;
      const width = metrics.width + padding * 2;
      const height = 44;

      ctx.fillStyle = "#fff";
      ctx.strokeStyle = this.doi[team].color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x - width / 2, y - height / 2, width, height, 14);
      } else {
        ctx.rect(x - width / 2, y - height / 2, width, height);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.bong.chu, x, y);
      ctx.restore();
    }

    veDau(w, h) {
      if (!this.dau) return;
      const { ctx } = this;
      const prog = Math.min(1, this.dau.t / 1.6);
      const scale = 1 + 0.3 * Math.sin(prog * Math.PI);

      ctx.save();
      ctx.translate(w / 2, h / 2 - 40);
      ctx.scale(scale, scale);
      ctx.font = `900 ${this.dau.co}px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this.dau.mau;
      ctx.strokeStyle = this.dau.vien;
      ctx.lineWidth = 14;
      ctx.globalAlpha = Math.max(0, 1 - Math.pow(prog, 2));

      ctx.strokeText(this.dau.chu, 0, 0);
      ctx.fillText(this.dau.chu, 0, 0);
      ctx.restore();
    }
  }

  // 4. DAY GAY GAME CONTROLLER FOR EY (MATCHING ORIGINAL POMY AI GAMEPLAY 100%)
  class DayGayGameController {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.sound = new DayGaySoundEngine();

      this.teams = [
        { name: options.teamAName || 'Đội A', color: options.teamAColor || '#2563eb', char: 'ho' },
        { name: options.teamBName || 'Đội B', color: options.teamBColor || '#dc2626', char: 'shiba' }
      ];

      this.questions = this.normalizeQuestions(options.questions || []);
      this.qIndex = 0;
      this.totalSeconds = options.secondsPerQuestion || 30;
      this.remainingSeconds = this.totalSeconds;
      this.timer = null;
      this.isPaused = false;
      this.inputMode = options.inputMode || localStorage.getItem('gameInputMode') || 'touch';

      this.nacMoiBen = Math.max(40, options.winDistance || (this.questions.length <= 10 ? 60 : 80));
      this.viTri = 0;
      this.chuoi = [0, 0];
      this.moKhoa = "ca-hai"; // "ca-hai", 0 (only team A), 1 (only team B)
      this.soLanSai = 0;
      this.chuoiDoiSai = 0;

      this.thongKe = {
        dung: [0, 0],
        chuoiMax: [0, 0],
        hoaThan: [0, 0],
        phaThan: [0, 0]
      };

      this.renderer = null;
      this.assetsLoaded = false;
      this.assetsPromise = null;
      this.keyboardListener = (e) => this.handleKeyDown(e);

      injectStyles();
      this.initDom();
    }

    normalizeQuestions(raw) {
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(q => {
          let opts = q.options || q.answers || [];
          opts = opts.map(o => typeof o === 'object' ? (o.text || o.content || '') : String(o));
          let cIdx = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
          if (q.correctAnswer && opts.length) {
            const fIdx = opts.findIndex(o => String(o).trim() === String(q.correctAnswer).trim());
            if (fIdx !== -1) cIdx = fIdx;
          }
          return {
            text: q.text || q.question || q.content || "Câu hỏi",
            options: opts.length ? opts : ["A", "B", "C", "D"],
            correctIndex: cIdx
          };
        });
      }
      return [
        { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
        { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
        { text: "Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?", options: ["Con cua", "Con tôm", "Con nhện", "Con ghẹ"], correctIndex: 0 },
        { text: "Một hình vuông có cạnh dài 6cm. Chu vi của hình vuông đó là:", options: ["12cm", "36cm", "24cm", "18cm"], correctIndex: 2 },
        { text: "Tìm x biết: x × 6 = 54", options: ["x = 7", "x = 8", "x = 9", "x = 6"], correctIndex: 2 },
        { text: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?", options: ["TP. Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Hải Phòng"], correctIndex: 2 },
        { text: "Kim loại nào sau đây có khả năng dẫn điện tốt nhất?", options: ["Đồng", "Nhôm", "Bạc", "Vàng"], correctIndex: 2 },
        { text: "Từ nào sau đây viết ĐÚNG chính tả?", options: ["Sắp sếp", "Sắp xếp", "Xắp sếp", "Xắp xếp"], correctIndex: 1 },
        { text: "Một ngày có bao nhiêu giờ?", options: ["12 giờ", "24 giờ", "48 giờ", "36 giờ"], correctIndex: 1 },
        { text: "Giá trị của biểu thức 100 - 25 × 2 là:", options: ["150", "75", "50", "60"], correctIndex: 2 }
      ];
    }

    initDom() {
      this.container.innerHTML = `
        <div class="sp-stage" id="dg-root">
          <!-- Top Navigation Bar -->
          <header style="position: relative; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid rgba(226,232,240,0.8); background: rgba(255,255,255,0.96); padding: 8px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); backdrop-filter: blur(8px);">
            <div style="display: flex; flex: 1; align-items: stretch; gap: 14px; overflow-x: auto; padding: 2px 0;">
              <!-- Đội A Status -->
              <div id="dg-team-a-status" style="position: relative; display: flex; min-width: 170px; flex: 1; align-items: center; justify-content: space-between; gap: 10px; border-radius: 9999px; border: 2px solid ${this.teams[0].color}; background: #fff; padding: 6px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.25s;">
                <div style="display: flex; min-width: 0; flex: 1; align-items: center; gap: 10px;">
                  <span style="height: 14px; width: 14px; flex-shrink: 0; border-radius: 999px; background: ${this.teams[0].color}; box-shadow: 0 0 10px ${this.teams[0].color};"></span>
                  <span id="dg-label-a" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 900; color: #1e293b;">${this.teams[0].name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span id="dg-badge-a" class="sp-chip-bac" style="display: none;">BÙNG CHÁY</span>
                  <span id="dg-tag-a" style="flex-shrink: 0; border-radius: 999px; background: #fbbf24; padding: 3px 12px; font-size: 11.5px; font-weight: 900; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">⚡ NHANH TAY</span>
                </div>
              </div>

              <!-- Đội B Status -->
              <div id="dg-team-b-status" style="position: relative; display: flex; min-width: 170px; flex: 1; align-items: center; justify-content: space-between; gap: 10px; border-radius: 9999px; border: 2px solid ${this.teams[1].color}; background: #fff; padding: 6px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.25s;">
                <div style="display: flex; min-width: 0; flex: 1; align-items: center; gap: 10px;">
                  <span style="height: 14px; width: 14px; flex-shrink: 0; border-radius: 999px; background: ${this.teams[1].color}; box-shadow: 0 0 10px ${this.teams[1].color};"></span>
                  <span id="dg-label-b" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 900; color: #1e293b;">${this.teams[1].name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span id="dg-badge-b" class="sp-chip-bac" style="display: none;">BÙNG CHÁY</span>
                  <span id="dg-tag-b" style="flex-shrink: 0; border-radius: 999px; background: #fbbf24; padding: 3px 12px; font-size: 11.5px; font-weight: 900; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">⚡ NHANH TAY</span>
                </div>
              </div>
            </div>

            <!-- Controls (Original Pomy AI Style: Fullscreen, Sound, Pause, Finish) -->
            <div style="display: flex; flex-shrink: 0; align-items: center; gap: 8px;">
              <button id="dg-btn-fullscreen" type="button" style="display: flex; height: 38px; width: 38px; align-items: center; justify-content: center; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; font-size: 16px; cursor: pointer;" title="Toàn màn hình">
                ⛶
              </button>

              <button id="dg-btn-sound" type="button" style="display: flex; height: 38px; width: 38px; align-items: center; justify-content: center; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; cursor: pointer;" title="Bật/Tắt âm thanh">
                <span id="dg-icon-sound">🔊</span>
              </button>

              <button id="dg-btn-pause" type="button" style="padding: 7px 16px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; font-size: 13.5px; font-weight: 800; cursor: pointer;">
                Tạm dừng
              </button>

              <button id="dg-btn-exit" type="button" style="padding: 7px 16px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; font-size: 13.5px; font-weight: 800; cursor: pointer;">
                Kết thúc
              </button>
            </div>
          </header>

          <!-- Arena -->
          <div class="sp-san">
            <canvas id="dg-canvas" class="sp-canvas"></canvas>

            <!-- Question Card Floating -->
            <div class="sp-cau">
              <div style="position: relative; display: flex; width: 100%; max-width: 900px; align-items: center; justify-content: space-between; gap: 16px; border-radius: 18px; border: 2.5px solid rgba(253,230,138,0.8); background: rgba(255,255,255,0.97); padding: 12px 24px; box-shadow: 0 16px 36px -12px rgba(0,0,0,0.18); backdrop-filter: blur(10px);">
                <div style="display: flex; flex: 1; align-items: center; gap: 14px; min-width: 0;">
                  <span id="dg-q-idx" style="flex-shrink: 0; border-radius: 10px; background: #f59e0b; padding: 4px 14px; font-size: 14px; font-weight: 900; color: #fff;">CÂU 1</span>
                  <div id="dg-q-text" style="font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.4;"></div>
                </div>

                <!-- Timer Ring -->
                <div style="position: relative; display: flex; height: 52px; width: 52px; flex-shrink: 0; align-items: center; justify-content: center;">
                  <svg style="height: 52px; width: 52px; transform: rotate(-90deg);">
                    <circle cx="26" cy="26" r="22" stroke="#e2e8f0" stroke-width="4.5" fill="none"/>
                    <circle id="dg-timer-progress" cx="26" cy="26" r="22" stroke="#0d9488" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-dasharray="138.2" stroke-dashoffset="0" style="transition: stroke-dashoffset 0.3s linear;"/>
                  </svg>
                  <span id="dg-timer-num" style="position: absolute; font-size: 16px; font-weight: 900; color: #0f172a;">30</span>
                </div>
              </div>
            </div>

            <!-- Toast Banner (Center Bottom Arena, Frame 02/03/05) -->
            <div id="dg-toast-wrap" style="pointer-events: none; position: absolute; inset: auto 0 16px; z-index: 35; display: flex; align-items: center; justify-content: center;">
              <div id="dg-toast" style="display: none; background: #fff; border: 2.5px solid #10b981; border-radius: 9999px; padding: 8px 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); animation: popIn 0.2s ease;">
                <p id="dg-toast-text" style="margin: 0; text-align: center; font-size: 18px; font-weight: 900; color: #0f172a;"></p>
              </div>
            </div>

            <!-- Countdown 3.. 2.. 1.. -->
            <div id="dg-countdown" style="display: none; pointer-events: none; position: absolute; inset: 0; z-index: 45; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); backdrop-filter: blur(4px);">
              <div id="dg-countdown-num" style="font-size: 120px; font-weight: 900; color: #fde047; text-shadow: 0 10px 30px rgba(0,0,0,0.8);">3</div>
            </div>
          </div>

          <!-- Answer Pads -->
          <div id="dg-pads" class="sp-pads">
            <div id="dg-pad-a" class="tug-pad tug-pad--l is-turn" style="--c: ${this.teams[0].color};">
              <div class="tug-pad__grid" id="dg-grid-a"></div>
            </div>
            <div id="dg-pad-b" class="tug-pad tug-pad--r is-turn" style="--c: ${this.teams[1].color};">
              <div class="tug-pad__grid" id="dg-grid-b"></div>
            </div>
          </div>

          <!-- 1. SETUP MODAL ("Thiết lập" - Original Frame 01) -->
          <div id="dg-modal-setup" style="position: absolute; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.72); backdrop-filter: blur(8px);">
            <div style="background: #fff; border-radius: 28px; padding: 36px 40px; width: min(480px, 92vw); box-shadow: 0 25px 60px -12px rgba(0,0,0,0.3); text-align: center; animation: popIn 0.3s ease;">
              <h2 style="font-size: 26px; font-weight: 900; color: #0d9488; margin: 0 0 24px 0;">Thiết lập</h2>
              
              <!-- Team Name Inputs -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px; border: 2px solid #2563eb; border-radius: 9999px; padding: 8px 18px; background: #fff; flex: 1;">
                  <span style="width: 14px; height: 14px; border-radius: 50%; background: #2563eb; flex-shrink: 0;"></span>
                  <input id="dg-input-name-a" type="text" value="${this.teams[0].name}" style="border: none; outline: none; font-size: 15px; font-weight: 800; color: #1e293b; width: 100%;" />
                </div>
                <span style="font-size: 14px; font-weight: 900; color: #94a3b8;">VS</span>
                <div style="display: flex; align-items: center; gap: 8px; border: 2px solid #dc2626; border-radius: 9999px; padding: 8px 18px; background: #fff; flex: 1;">
                  <input id="dg-input-name-b" type="text" value="${this.teams[1].name}" style="border: none; outline: none; font-size: 15px; font-weight: 800; color: #1e293b; width: 100%; text-align: right;" />
                  <span style="width: 14px; height: 14px; border-radius: 50%; background: #dc2626; flex-shrink: 0;"></span>
                </div>
              </div>

              <!-- Input mode selector -->
              <p style="font-size: 14px; font-weight: 800; color: #475569; margin: 0 0 12px 0;">Học sinh bấm bằng gì?</p>
              <div style="display: flex; gap: 12px; margin-bottom: 12px; justify-content: center;">
                <button id="dg-setup-mode-touch" type="button" style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 2px solid ${this.inputMode === 'touch' ? '#0d9488' : '#cbd5e1'}; background: ${this.inputMode === 'touch' ? '#f0fdfa' : '#fff'}; color: ${this.inputMode === 'touch' ? '#0d9488' : '#64748b'}; font-weight: 800; font-size: 14.5px; cursor: pointer; transition: all 0.2s;">
                  📺 Tivi cảm ứng
                </button>
                <button id="dg-setup-mode-keyboard" type="button" style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 2px solid ${this.inputMode === 'keyboard' ? '#0d9488' : '#cbd5e1'}; background: ${this.inputMode === 'keyboard' ? '#f0fdfa' : '#fff'}; color: ${this.inputMode === 'keyboard' ? '#0d9488' : '#64748b'}; font-weight: 800; font-size: 14.5px; cursor: pointer; transition: all 0.2s;">
                  ⌨️ Bàn phím
                </button>
              </div>
              <p id="dg-setup-mode-desc" style="font-size: 12.5px; color: #64748b; margin: 0 0 26px 0; min-height: 36px; line-height: 1.5;">
                ${this.inputMode === 'keyboard' ? 'Đội trái bấm Q W E R, đội phải bấm U I O P – ký tự phím in sẵn trên từng đáp án.' : 'Chạm trực tiếp vào màn hình hoặc dùng chuột để chọn đáp án.'}
              </p>

              <button id="dg-btn-start-battle" type="button" style="width: 100%; padding: 14px 28px; border-radius: 9999px; border: none; background: #0d9488; color: #fff; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.4); transition: transform 0.1s;">
                Bắt đầu
              </button>
            </div>
          </div>

          <!-- 2. VICTORY MODAL (Original Frame 86s) -->
          <div id="dg-modal-victory" style="display: none; position: fixed; inset: 0; z-index: 99999; align-items: center; justify-content: center; background: rgba(15,23,42,0.65); backdrop-filter: blur(6px); padding: 20px;">
            <div style="width: 100%; max-width: 520px; border-radius: 28px; border: 4px solid #f59e0b; background: #fff; padding: 32px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.3); animation: popIn 0.3s ease;">
              <div style="font-size: 64px; margin-bottom: 8px;">🏆</div>
              <h2 id="dg-victory-title" style="margin: 0 0 6px; font-size: 32px; font-weight: 900; color: #dc2626;">ĐỘI B</h2>
              <p id="dg-victory-sub" style="margin: 0 0 24px; font-size: 15px; font-weight: 700; color: #d97706;">Đẩy đối thủ ra khỏi vòng, chiến thắng!</p>

              <!-- Stats Table -->
              <div style="border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <thead style="background: #f8fafc; font-weight: 900; color: #334155; border-bottom: 1.5px solid #e2e8f0;">
                    <tr>
                      <th style="padding: 10px 14px; text-align: left; color: #64748b;">Chỉ số</th>
                      <th id="dg-th-a" style="padding: 10px 14px; text-align: center; color: ${this.teams[0].color};">${this.teams[0].name}</th>
                      <th id="dg-th-b" style="padding: 10px 14px; text-align: center; color: ${this.teams[1].color};">${this.teams[1].name}</th>
                    </tr>
                  </thead>
                  <tbody style="font-weight: 800; color: #1e293b;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 9px 14px; text-align: left; color: #64748b; font-weight: 700;">Câu đúng</td>
                      <td id="dg-stat-c-a" style="padding: 9px 14px; text-align: center;">0</td>
                      <td id="dg-stat-c-b" style="padding: 9px 14px; text-align: center;">0</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 9px 14px; text-align: left; color: #64748b; font-weight: 700;">Chuỗi đúng dài nhất</td>
                      <td id="dg-stat-s-a" style="padding: 9px 14px; text-align: center;">0</td>
                      <td id="dg-stat-s-b" style="padding: 9px 14px; text-align: center;">0</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 9px 14px; text-align: left; color: #64748b; font-weight: 700;">Số lần Hóa Thần</td>
                      <td id="dg-stat-g-a" style="padding: 9px 14px; text-align: center;">0</td>
                      <td id="dg-stat-g-b" style="padding: 9px 14px; text-align: center;">0</td>
                    </tr>
                    <tr>
                      <td style="padding: 9px 14px; text-align: left; color: #64748b; font-weight: 700;">Số lần Phá Thần</td>
                      <td id="dg-stat-b-a" style="padding: 9px 14px; text-align: center;">0</td>
                      <td id="dg-stat-b-b" style="padding: 9px 14px; text-align: center;">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Buttons -->
              <div style="display: flex; justify-content: center; gap: 14px;">
                <button id="dg-btn-again" type="button" style="flex: 1; padding: 12px 24px; border-radius: 12px; border: none; background: #0d9488; color: #fff; font-size: 15px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
                  Chơi lại
                </button>
                <button id="dg-btn-quit" type="button" style="flex: 1; padding: 12px 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; font-size: 15px; font-weight: 900; cursor: pointer;">
                  Về danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.canvas = document.getElementById('dg-canvas');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Bind Setup modal events
      const btnTouch = document.getElementById('dg-setup-mode-touch');
      const btnKeyboard = document.getElementById('dg-setup-mode-keyboard');
      const descMode = document.getElementById('dg-setup-mode-desc');

      btnTouch.addEventListener('click', () => {
        this.inputMode = 'touch';
        localStorage.setItem('gameInputMode', 'touch');
        btnTouch.style.borderColor = '#0d9488';
        btnTouch.style.background = '#f0fdfa';
        btnTouch.style.color = '#0d9488';
        btnKeyboard.style.borderColor = '#cbd5e1';
        btnKeyboard.style.background = '#fff';
        btnKeyboard.style.color = '#64748b';
        descMode.textContent = 'Chạm trực tiếp vào màn hình hoặc dùng chuột để chọn đáp án.';
      });

      btnKeyboard.addEventListener('click', () => {
        this.inputMode = 'keyboard';
        localStorage.setItem('gameInputMode', 'keyboard');
        btnKeyboard.style.borderColor = '#0d9488';
        btnKeyboard.style.background = '#f0fdfa';
        btnKeyboard.style.color = '#0d9488';
        btnTouch.style.borderColor = '#cbd5e1';
        btnTouch.style.background = '#fff';
        btnTouch.style.color = '#64748b';
        descMode.textContent = 'Đội trái bấm Q W E R, đội phải bấm U I O P – ký tự phím in sẵn trên từng đáp án.';
      });

      document.getElementById('dg-btn-start-battle').addEventListener('click', () => {
        const nameA = document.getElementById('dg-input-name-a').value.trim() || 'Đội A';
        const nameB = document.getElementById('dg-input-name-b').value.trim() || 'Đội B';
        this.teams[0].name = nameA;
        this.teams[1].name = nameB;
        document.getElementById('dg-label-a').textContent = nameA;
        document.getElementById('dg-label-b').textContent = nameB;
        document.getElementById('dg-th-a').textContent = nameA;
        document.getElementById('dg-th-b').textContent = nameB;

        document.getElementById('dg-modal-setup').style.display = 'none';
        this.startMatch();
      });

      // Bind Top Header buttons
      document.getElementById('dg-btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
      });

      document.getElementById('dg-btn-sound').addEventListener('click', () => {
        this.sound.setEnabled(!this.sound.enabled);
        document.getElementById('dg-icon-sound').textContent = this.sound.enabled ? '🔊' : '🔇';
      });

      document.getElementById('dg-btn-pause').addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        document.getElementById('dg-btn-pause').textContent = this.isPaused ? 'Tiếp tục' : 'Tạm dừng';
        document.getElementById('dg-pads').classList.toggle('is-paused', this.isPaused);
        if (this.renderer) this.renderer.datDongBang(this.isPaused);
      });

      document.getElementById('dg-btn-exit').addEventListener('click', () => {
        this.destroy();
        if (typeof this.options.onExit === 'function') this.options.onExit();
      });

      // Victory buttons
      document.getElementById('dg-btn-again').addEventListener('click', () => {
        document.getElementById('dg-modal-victory').style.display = 'none';
        document.getElementById('dg-modal-setup').style.display = 'flex';
      });

      document.getElementById('dg-btn-quit').addEventListener('click', () => {
        this.destroy();
        if (typeof this.options.onExit === 'function') this.options.onExit();
      });

      window.addEventListener('keydown', this.keyboardListener);

      // Preload assets in background
      this.loadAssetsAndStart();
    }

    resizeCanvas() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
    }

    async loadAssetsAndStart() {
      if (this.assetsPromise) return this.assetsPromise;
      const basePath = '/ey/games/day-gay/assets';
      const bo = { cao: BO_ANH_CONFIG.cao, nv: {}, nc: {}, nen: null };

      // Load background
      const nenImg = new Image();
      nenImg.src = `${basePath}/${BO_ANH_CONFIG.nen.tep}`;
      bo.nen = nenImg;

      // Load characters
      for (let nv in BO_ANH_CONFIG.nv) {
        bo.nv[nv] = {};
        for (let pose in BO_ANH_CONFIG.nv[nv]) {
          const info = BO_ANH_CONFIG.nv[nv][pose];
          const img = new Image();
          img.src = `${basePath}/${info.tep}`;
          bo.nv[nv][pose] = {
            anh: img,
            so: info.so,
            w: info.w,
            h: info.h,
            le: info.le,
            tay: info.tay
          };
        }
      }

      // Load musicians
      for (let nc in BO_ANH_CONFIG.nc) {
        const info = BO_ANH_CONFIG.nc[nc];
        const img = new Image();
        img.src = `${basePath}/${info.tep}`;
        bo.nc[nc] = {
          anh: img,
          so: info.so,
          w: info.w,
          h: info.h,
          le: info.le
        };
      }

      this.resizeCanvas();
      this.renderer = new EyStickPushRenderer(this.canvas, bo, [this.teams[0].char, this.teams[1].char], this.teams, this.sound);
      this.renderer.nac = this.nacMoiBen;
      this.renderer.onXong = (lastLuot) => this.handleAnimationDone(lastLuot);
      this.assetsLoaded = true;
    }

    async startMatch() {
      await this.loadAssetsAndStart();
      this.viTri = 0;
      this.chuoi = [0, 0];
      this.qIndex = 0;
      this.soLanSai = 0;
      this.chuoiDoiSai = 0;
      this.thongKe = { dung: [0, 0], chuoiMax: [0, 0], hoaThan: [0, 0], phaThan: [0, 0] };
      if (this.renderer) this.renderer.datTrangThai(0, this.nacMoiBen, [0, 0]);

      this.sound.playBgm();
      this.startCountdown();
    }

    startCountdown() {
      const overlay = document.getElementById('dg-countdown');
      const numEl = document.getElementById('dg-countdown-num');
      overlay.style.display = 'flex';

      let count = 3;
      numEl.textContent = count;
      this.sound.play('tick');

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          numEl.textContent = count;
          this.sound.play('tick');
        } else if (count === 0) {
          numEl.textContent = "BẮT ĐẦU!";
          this.sound.play('whistle');
        } else {
          clearInterval(interval);
          overlay.style.display = 'none';
          this.showQuestion(0);
        }
      }, 850);
    }

    showQuestion(idx) {
      if (idx >= this.questions.length) {
        this.endGame();
        return;
      }

      this.qIndex = idx;
      this.moKhoa = "ca-hai";
      this.soLanSai = 0;
      this.chuoiDoiSai = 0;
      const q = this.questions[idx];

      document.getElementById('dg-q-idx').textContent = `CÂU ${idx + 1}`;
      const qTextEl = document.getElementById('dg-q-text');
      qTextEl.textContent = q.text;

      if (window.renderMathInElement && window.katex) {
        try {
          window.renderMathInElement(qTextEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ]
          });
        } catch (e) {}
      }

      this.renderAnswerPads(q);
      this.updateHeaderBadges();
      this.startTimer();
    }

    renderAnswerPads(q) {
      const letters = ["A", "B", "C", "D"];
      const keysLeft = ["Q", "W", "E", "R"];
      const keysRight = ["U", "I", "O", "P"];

      const makeButtons = (teamIdx, keys) => {
        const grid = document.getElementById(teamIdx === 0 ? 'dg-grid-a' : 'dg-grid-b');
        grid.innerHTML = '';
        q.options.forEach((opt, optIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tug-pad__btn';
          btn.innerHTML = `
            <span class="tug-pad__letter">${letters[optIdx]}</span>
            <span class="tug-pad__text">${opt}</span>
            ${this.inputMode === 'keyboard' ? `<kbd class="tug-pad__key">${keys[optIdx]}</kbd>` : ''}
          `;
          btn.addEventListener('click', () => this.handlePick(teamIdx, optIdx));
          grid.appendChild(btn);
        });
      };

      makeButtons(0, keysLeft);
      makeButtons(1, keysRight);
    }

    updateHeaderBadges() {
      const padA = document.getElementById('dg-pad-a');
      const padB = document.getElementById('dg-pad-b');
      const tagA = document.getElementById('dg-tag-a');
      const tagB = document.getElementById('dg-tag-b');
      const badgeA = document.getElementById('dg-badge-a');
      const badgeB = document.getElementById('dg-badge-b');
      const boxA = document.getElementById('dg-team-a-status');
      const boxB = document.getElementById('dg-team-b-status');

      // Streak badge
      const updateBadge = (el, streak) => {
        if (streak >= 4) {
          el.textContent = "HÓA THẦN";
          el.className = "sp-chip-bac sp-chip-bac--3";
          el.style.display = "inline-block";
        } else if (streak >= 2) {
          el.textContent = streak === 3 ? "BÙNG CHÁY 🔥" : "BÙNG CHÁY";
          el.className = "sp-chip-bac sp-chip-bac--2";
          el.style.display = "inline-block";
        } else {
          el.style.display = "none";
        }
      };
      updateBadge(badgeA, this.chuoi[0]);
      updateBadge(badgeB, this.chuoi[1]);

      // Turn outline & status tags
      if (this.moKhoa === "ca-hai") {
        padA.classList.remove('is-locked');
        padB.classList.remove('is-locked');
        boxA.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        boxB.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        boxA.style.borderColor = this.teams[0].color;
        boxB.style.borderColor = this.teams[1].color;

        tagA.textContent = "⚡ NHANH TAY";
        tagB.textContent = "⚡ NHANH TAY";
        tagA.style.background = "#fbbf24";
        tagB.style.background = "#fbbf24";
        tagA.style.color = "#0f172a";
        tagB.style.color = "#0f172a";
      } else if (this.moKhoa === 0) {
        padA.classList.remove('is-locked');
        padB.classList.add('is-locked');

        // Team A active turn glowing outline
        boxA.style.boxShadow = "0 0 0 3.5px #d946ef, 0 0 18px rgba(217, 70, 239, 0.45)";
        boxA.style.borderColor = "#d946ef";
        boxB.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        boxB.style.borderColor = "#cbd5e1";

        tagA.textContent = "▶ TRẢ LỜI";
        tagB.textContent = "✋ BỊ CẤM";
        tagA.style.background = "#10b981";
        tagB.style.background = "#e2e8f0";
        tagA.style.color = "#fff";
        tagB.style.color = "#64748b";
      } else {
        padB.classList.remove('is-locked');
        padA.classList.add('is-locked');

        // Team B active turn glowing outline
        boxB.style.boxShadow = "0 0 0 3.5px #d946ef, 0 0 18px rgba(217, 70, 239, 0.45)";
        boxB.style.borderColor = "#d946ef";
        boxA.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        boxA.style.borderColor = "#cbd5e1";

        tagB.textContent = "▶ TRẢ LỜI";
        tagA.textContent = "✋ BỊ CẤM";
        tagB.style.background = "#10b981";
        tagA.style.background = "#e2e8f0";
        tagB.style.color = "#fff";
        tagA.style.color = "#64748b";
      }
    }

    startTimer() {
      if (this.timer) clearInterval(this.timer);
      this.remainingSeconds = this.totalSeconds;
      this.updateTimerUI();

      this.timer = setInterval(() => {
        if (this.isPaused) return;
        this.remainingSeconds--;
        this.updateTimerUI();

        if (this.remainingSeconds <= 5 && this.remainingSeconds > 0) {
          this.sound.play('tick');
        }

        if (this.remainingSeconds <= 0) {
          clearInterval(this.timer);
          this.handleTimeout();
        }
      }, 1000);
    }

    updateTimerUI() {
      const numEl = document.getElementById('dg-timer-num');
      const progEl = document.getElementById('dg-timer-progress');
      numEl.textContent = this.remainingSeconds;

      const circumference = 138.2;
      const ratio = Math.max(0, this.remainingSeconds / this.totalSeconds);
      progEl.style.strokeDashoffset = circumference * (1 - ratio);

      if (this.remainingSeconds <= 5) {
        progEl.setAttribute('stroke', '#ef4444');
        numEl.style.color = '#dc2626';
      } else {
        progEl.setAttribute('stroke', '#0d9488');
        numEl.style.color = '#0f172a';
      }
    }

    handleKeyDown(e) {
      if (this.inputMode !== 'keyboard' || this.isPaused) return;
      const key = e.key.toUpperCase();
      const mapA = { Q: 0, W: 1, E: 2, R: 3 };
      const mapB = { U: 0, I: 1, O: 2, P: 3 };

      if (mapA[key] !== undefined && (this.moKhoa === "ca-hai" || this.moKhoa === 0)) {
        this.handlePick(0, mapA[key]);
      } else if (mapB[key] !== undefined && (this.moKhoa === "ca-hai" || this.moKhoa === 1)) {
        this.handlePick(1, mapB[key]);
      }
    }

    handlePick(team, choice) {
      if (this.moKhoa !== "ca-hai" && this.moKhoa !== team) return;
      if (this.renderer.cheDo === "dien") return;
      clearInterval(this.timer);

      const q = this.questions[this.qIndex];
      const isCorrect = choice === q.correctIndex;

      const grid = document.getElementById(team === 0 ? 'dg-grid-a' : 'dg-grid-b');
      const btns = grid.querySelectorAll('.tug-pad__btn');
      if (btns[choice]) {
        btns[choice].classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      }

      document.getElementById('dg-pad-a').classList.add('is-locked');
      document.getElementById('dg-pad-b').classList.add('is-locked');

      this.sound.play(isCorrect ? "correct" : "wrong");

      const steps = [0, 10, 15, 20, 25];
      const oldChuoi = [...this.chuoi];
      const newChuoi = [...this.chuoi];
      newChuoi[team] = isCorrect ? this.chuoi[team] + 1 : 0;
      this.chuoi = newChuoi;

      const advance = [0, 0];
      advance[team] = isCorrect ? steps[Math.min(4, newChuoi[team])] : -5;
      const delta = team === 0 ? advance[0] : -advance[1];
      const newViTri = Math.max(-this.nacMoiBen, Math.min(this.nacMoiBen, this.viTri + delta));

      const isPhaThan = isCorrect && this.soLanSai > 0 && this.chuoiDoiSai >= 3 ? team : null;
      if (isPhaThan !== null) this.thongKe.phaThan[team]++;

      if (isCorrect) {
        this.thongKe.dung[team]++;
        if (newChuoi[team] >= 4) this.thongKe.hoaThan[team]++;
      }
      this.thongKe.chuoiMax[team] = Math.max(this.thongKe.chuoiMax[team], newChuoi[team]);

      const nextAction = isCorrect ? "cau-moi" : (this.soLanSai + 1 >= 2 ? "lo-dap-an" : "chuyen");
      this.soLanSai = isCorrect ? this.soLanSai : this.soLanSai + 1;
      this.chuoiDoiSai = isCorrect ? this.chuoiDoiSai : oldChuoi[team];

      const luot = {
        doi: team,
        dung: isCorrect,
        chon: choice,
        tien: advance,
        delta,
        chuoi: newChuoi,
        chuoiTruoc: oldChuoi,
        phaThan: isPhaThan,
        sau: nextAction
      };

      // Show Toast (Frame 02/03/05)
      const teamName = this.teams[team].name;
      if (isCorrect) {
        this.showToast(`${teamName} nhanh tay, ĐÚNG! Đẩy!`, "is-good");
      } else {
        const oppName = this.teams[team === 0 ? 1 : 0].name;
        if (nextAction === "chuyen") {
          this.showToast(`${teamName} trả lời sai, ${oppName} giành quyền trả lời!`, "is-bad");
        } else {
          this.showToast(`Cả hai đội đều sai! Lộ đáp án...`, "is-bad");
        }
      }

      this.renderer.dien(luot, newViTri);
      this.viTri = newViTri;
    }

    handleTimeout() {
      this.showToast("Hết thời gian! Lộ đáp án...", "is-timeout");
      this.sound.play("wrong");
      this.revealCorrectAnswer();
      setTimeout(() => this.showQuestion(this.qIndex + 1), 2400);
    }

    revealCorrectAnswer() {
      const q = this.questions[this.qIndex];
      [0, 1].forEach(team => {
        const grid = document.getElementById(team === 0 ? 'dg-grid-a' : 'dg-grid-b');
        const btns = grid.querySelectorAll('.tug-pad__btn');
        btns.forEach((btn, idx) => {
          if (idx === q.correctIndex) btn.classList.add('is-correct');
          else btn.classList.add('is-dim');
        });
      });
    }

    handleAnimationDone(lastLuot) {
      if (Math.abs(this.viTri) >= this.nacMoiBen) {
        const winner = this.viTri > 0 ? 0 : 1;
        this.renderer.ketThuc(winner, true);
        setTimeout(() => this.showVictoryModal(winner, true), 1600);
        return;
      }

      const l = lastLuot;
      if (!l) {
        this.showQuestion(this.qIndex + 1);
        return;
      }

      if (l.sau === "chuyen") {
        const opp = l.doi === 0 ? 1 : 0;
        this.moKhoa = opp;
        this.updateHeaderBadges();
        this.startTimer();
      } else if (l.sau === "lo-dap-an") {
        this.revealCorrectAnswer();
        setTimeout(() => this.showQuestion(this.qIndex + 1), 2400);
      } else {
        this.showQuestion(this.qIndex + 1);
      }
    }

    showToast(text, type = "is-good") {
      const toast = document.getElementById('dg-toast');
      const toastText = document.getElementById('dg-toast-text');
      toastText.textContent = text;
      toast.style.borderColor = type === "is-good" ? "#10b981" : "#ef4444";
      toast.style.display = 'inline-flex';
      setTimeout(() => { toast.style.display = 'none'; }, 2200);
    }

    showVictoryModal(winner, isRingOut) {
      this.sound.stopBgm();
      this.sound.play("fanfare");
      if (typeof confetti === 'function') confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      const modal = document.getElementById('dg-modal-victory');
      const title = document.getElementById('dg-victory-title');
      const sub = document.getElementById('dg-victory-sub');

      if (winner === "hoa") {
        title.textContent = "HÒA NHAU BẤT PHÂN THẮNG BẠI!";
        title.style.color = '#d97706';
        sub.textContent = "Hai đội đã chiến đấu vô cùng anh dũng!";
      } else {
        const winTeam = this.teams[winner];
        title.textContent = winTeam.name.toUpperCase();
        title.style.color = winner === 0 ? this.teams[0].color : this.teams[1].color;
        sub.textContent = isRingOut ? "Đẩy đối thủ ra khỏi vòng, chiến thắng!" : "Dẫn điểm tuyệt đối sau trận đấu!";
      }

      document.getElementById('dg-stat-c-a').textContent = this.thongKe.dung[0];
      document.getElementById('dg-stat-c-b').textContent = this.thongKe.dung[1];
      document.getElementById('dg-stat-s-a').textContent = this.thongKe.chuoiMax[0];
      document.getElementById('dg-stat-s-b').textContent = this.thongKe.chuoiMax[1];
      document.getElementById('dg-stat-g-a').textContent = this.thongKe.hoaThan[0];
      document.getElementById('dg-stat-g-b').textContent = this.thongKe.hoaThan[1];
      document.getElementById('dg-stat-b-a').textContent = this.thongKe.phaThan[0];
      document.getElementById('dg-stat-b-b').textContent = this.thongKe.phaThan[1];

      modal.style.display = 'flex';
    }

    endGame() {
      if (this.timer) clearInterval(this.timer);
      const winner = Math.abs(this.viTri) < 5 ? "hoa" : (this.viTri > 0 ? 0 : 1);
      if (this.renderer) this.renderer.ketThuc(winner, false);
      this.showVictoryModal(winner, false);
    }

    destroy() {
      if (this.timer) clearInterval(this.timer);
      window.removeEventListener('keydown', this.keyboardListener);
      if (this.renderer) this.renderer.huy();
      this.sound.stopBgm();
      this.container.innerHTML = '';
    }
  }
  // 5. GLOBAL LAUNCH FUNCTION FOR EY
  global.launchDayGayGame = function(container, options = {}) {
    const game = new DayGayGameController(container, options);
    return () => game.destroy();
  };

})(typeof window !== 'undefined' ? window : this);
