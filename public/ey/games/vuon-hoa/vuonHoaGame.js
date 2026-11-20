/**
 * Trò Chơi Hành Trình 2: VƯỜN HOA TRI THỨC (Knowledge Flower Garden)
 * Mô phỏng chuẩn mực hệ sinh thái giáo dục PomyAI & OLM
 * Tích hợp cơ chế làm bài tập nhận Giọt nước (💧), Gieo hạt hoa (🌻, 🌹, 🪷) và Vinh danh Vườn lớp
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'ey_v2_vuonhoa_data';

  // Định nghĩa các loài hoa tri thức
  const FLOWER_TYPES = {
    huongDuong: { name: 'Hoa Hướng Dương', icon: '🌻', seedIcon: '🌰', waterTotal: 3, exp: 15, color: '#f59e0b', desc: 'Biểu tượng của ý chí vươn lên đón ánh sáng tri thức.' },
    hoaHong: { name: 'Hoa Hồng Đỏ', icon: '🌹', seedIcon: '🌱', waterTotal: 4, exp: 20, color: '#ef4444', desc: 'Vẻ đẹp của sự chăm chỉ, nhiệt huyết và sáng tạo.' },
    hoaSen: { name: 'Hoa Sen Thanh Khiết', icon: '🪷', seedIcon: '🫘', waterTotal: 5, exp: 30, color: '#ec4899', desc: 'Quốc hoa Việt Nam, thanh cao và kiên trì vượt khó.' },
    hoaTulip: { name: 'Hoa Tulip Tươi Thắm', icon: '🌷', seedIcon: '🌾', waterTotal: 3, exp: 15, color: '#8b5cf6', desc: 'Sự tự tin, tươi vui và tinh thần học hỏi không ngừng.' },
    hoaCuc: { name: 'Hoa Cúc Vàng', icon: '🌼', seedIcon: '🌰', waterTotal: 2, exp: 10, color: '#eab308', desc: 'Đoàn kết, bền bỉ và tình bạn ấm áp dưới mái trường.' },
    hoaLan: { name: 'Hoa Phong Lan', icon: '🌸', seedIcon: '🌱', waterTotal: 6, exp: 40, color: '#d946ef', desc: 'Bông hoa quý hiếm của sự tinh tế và thông thái.' }
  };

  // Câu hỏi luyện tập nhận giọt nước tích hợp sẵn
  const DEFAULT_GARDEN_QUESTIONS = [
    { q: 'Trong hình học, tổng số đo 3 góc trong một tam giác bằng bao nhiêu độ?', options: ['90°', '180°', '360°', '120°'], correct: 1 },
    { q: 'Phân số nào sau đây bằng phân số 2/3?', options: ['4/6', '3/2', '4/9', '6/8'], correct: 0 },
    { q: 'Một khu vườn hình vuông có chu vi là 36m. Diện tích của khu vườn đó là:', options: ['81 m²', '72 m²', '64 m²', '144 m²'], correct: 0 },
    { q: 'Bác Hồ đọc Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa vào năm nào?', options: ['1944', '1945', '1946', '1954'], correct: 1 },
    { q: 'Chất khí nào chiếm thể tích lớn nhất trong không khí của Trái Đất?', options: ['Khí Ô-xi (O₂)', 'Khí Nitơ (N₂)', 'Khí Cacbonic (CO₂)', 'Khí Hiđrô (H₂)'], correct: 1 },
    { q: 'Trong bảng cửu chương, kết quả của 8 × 9 là bao nhiêu?', options: ['72', '64', '81', '74'], correct: 0 },
    { q: 'Bộ phận nào của cây làm nhiệm vụ quang hợp chế tạo chất dinh dưỡng?', options: ['Rễ cây', 'Thân cây', 'Lá cây', 'Hoa'], correct: 2 },
    { q: 'Đơn vị đo diện tích nào lớn hơn mét vuông 100 lần?', options: ['Đề-ca-mét vuông (dam²)', 'Héc-tô-mét vuông (hm²)', 'Đề-xi-mét vuông (dm²)', 'Mi-li-mét vuông (mm²)'], correct: 0 }
  ];

  class VuonHoaGame {
    constructor() {
      this.container = null;
      this.currentStudentId = null;
      this.state = this.loadState();
      this.audioCtx = null;

      // Lắng nghe sự kiện nạp điểm thưởng từ hệ thống làm bài tập OLM
      window.addEventListener('ey:farm-updated', (e) => {
        if (!e.detail || !e.detail.studentId || e.detail.studentId === this.currentStudentId) {
          this.state = this.loadState();
          this.updateHUD();
        }
      });
    }

    initAudio() {
      try {
        if (!this.audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.audioCtx = new AudioContext();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      } catch (e) {}
    }

    playWaterSound() {
      try {
        this.initAudio();
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playBloomSound() {
      try {
        this.initAudio();
        if (!this.audioCtx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const now = this.audioCtx.currentTime + idx * 0.08;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        });
      } catch (e) {}
    }

    loadState() {
      const sess = window.EyAuth ? window.EyAuth.getSession() : null;
      const stdId = sess && sess.studentId ? sess.studentId : 'default_student';
      this.currentStudentId = stdId;

      try {
        const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (!allData[stdId]) {
          allData[stdId] = {
            water: 25,
            seeds: { huongDuong: 3, hoaHong: 2, hoaSen: 1, hoaTulip: 2, hoaCuc: 4, hoaLan: 1 },
            bloomedFlowers: 4,
            points: 120,
            streakDays: 1,
            plots: [
              { id: 1, flowerKey: 'huongDuong', stage: 4, waterCurrent: 3, waterTotal: 3 },
              { id: 2, flowerKey: 'hoaHong', stage: 3, waterCurrent: 3, waterTotal: 4 },
              { id: 3, flowerKey: 'hoaSen', stage: 2, waterCurrent: 2, waterTotal: 5 },
              { id: 4, flowerKey: 'hoaTulip', stage: 1, waterCurrent: 1, waterTotal: 3 },
              { id: 5, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 },
              { id: 6, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 }
            ]
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        }
        return allData[stdId];
      } catch (e) {
        return {
          water: 25,
          seeds: { huongDuong: 3, hoaHong: 2, hoaSen: 1, hoaTulip: 2, hoaCuc: 4, hoaLan: 1 },
          bloomedFlowers: 4,
          points: 120,
          streakDays: 1,
          plots: [
            { id: 1, flowerKey: 'huongDuong', stage: 4, waterCurrent: 3, waterTotal: 3 },
            { id: 2, flowerKey: 'hoaHong', stage: 3, waterCurrent: 3, waterTotal: 4 },
            { id: 3, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 },
            { id: 4, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 },
            { id: 5, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 },
            { id: 6, flowerKey: null, stage: 0, waterCurrent: 0, waterTotal: 0 }
          ]
        };
      }
    }

    saveState() {
      try {
        const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allData[this.currentStudentId] = this.state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      } catch (e) {}

      // Đồng bộ dữ liệu vườn hoa lên Cloud Firebase nếu có
      if (window.FirebaseService && typeof window.FirebaseService.saveStudentGardenData === 'function') {
        window.FirebaseService.saveStudentGardenData(this.currentStudentId, this.state).catch(() => {});
      }
    }

    open(container) {
      this.container = container;
      this.state = this.loadState();
      this.render();

      // Đồng bộ từ Cloud nếu có
      if (window.FirebaseService && typeof window.FirebaseService.getStudentGardenData === 'function') {
        window.FirebaseService.getStudentGardenData(this.currentStudentId).then(cloudData => {
          if (cloudData && typeof cloudData === 'object' && cloudData.water !== undefined) {
            this.state = { ...this.state, ...cloudData };
            this.saveState();
            this.updateHUD();
            this.renderPlots();
          }
        }).catch(() => {});
      }
    }

    close() {
      if (window.switchTab) window.switchTab('troChoiHanhTrinh');
    }

    updateHUD() {
      const wEl = document.getElementById('vh-hud-water');
      const bEl = document.getElementById('vh-hud-bloomed');
      const pEl = document.getElementById('vh-hud-points');
      const sEl = document.getElementById('vh-speech-text');
      if (wEl) wEl.textContent = this.state.water;
      if (bEl) bEl.textContent = this.state.bloomedFlowers;
      if (pEl) pEl.textContent = this.state.points;
      if (sEl) {
        const readyCount = this.state.plots.filter(p => p.stage === 4).length;
        if (readyCount > 0) {
          sEl.innerHTML = `Vườn đang có <strong>${readyCount} bông hoa nở rộ</strong>! Bấm vào để thu hoạch nhé. 🌺`;
        } else if (this.state.water > 0) {
          sEl.innerHTML = `Bạn có <strong>${this.state.water} giọt nước</strong>. Hãy tưới cho các luống hoa mau lớn! 💧`;
        } else {
          sEl.innerHTML = `Đã hết nước tưới! Hãy bấm <strong>Làm bài tập</strong> để kiếm thêm Giọt Nước 💧.`;
        }
      }
    }

    render() {
      if (!this.container) return;

      this.container.innerHTML = `
        <div class="vuonhoa-game-screen" style="position: relative; width: 100%; height: 86vh; min-height: 600px; max-height: 920px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); font-family: 'Be Vietnam Pro', system-ui, sans-serif; background: #ecfdf5; user-select: none;">
          <!-- Garden Background Image -->
          <img src="/ey/games/vuon-hoa/bg_vuon_hoa_full.jpg" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none;" alt="Vườn hoa tri thức" onerror="this.src='/ey/games/vuon-hoa/cover.jpg'" />

          <!-- Sun & Gentle Ray Filter Overlay -->
          <div style="position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 15% 15%, rgba(254, 240, 138, 0.28) 0%, rgba(255,255,255,0) 65%); z-index: 10;"></div>

          <!-- Top Navigation HUD -->
          <div style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
            <!-- Back button -->
            <button onclick="window.VuonHoaApp.close()" style="width: 44px; height: 44px; border-radius: 50%; background: #ffffff; color: #1e293b; border: 2px solid #cbd5e1; font-size: 20px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" title="Quay lại">
              ‹
            </button>

            <!-- Status Speech Bubble -->
            <div id="vh-speech-bubble" style="background: rgba(255, 255, 255, 0.95); padding: 9px 24px; border-radius: 30px; font-weight: 800; font-size: 14px; color: #1e293b; box-shadow: 0 4px 15px rgba(0,0,0,0.12); border: 1.5px solid #a7f3d0; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(4px);">
              <span style="font-size: 18px;">🌺</span>
              <span id="vh-speech-text">Chào mừng bạn đến với Vườn Hoa Tri Thức! Hãy gieo hạt và tưới nước cho hoa mau lớn.</span>
            </div>

            <!-- Currency & Inventory Badges -->
            <div style="display: flex; gap: 10px;">
              <div style="background: rgba(255,255,255,0.95); padding: 7px 15px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #0284c7; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #bae6fd;">
                <span>💧</span> <span id="vh-hud-water">${this.state.water}</span> giọt
              </div>
              <div style="background: rgba(255,255,255,0.95); padding: 7px 15px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #db2777; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #fbcfe8;">
                <span>🌺</span> <span id="vh-hud-bloomed">${this.state.bloomedFlowers}</span> đã nở
              </div>
              <div style="background: rgba(255,255,255,0.95); padding: 7px 15px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #d97706; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #fde68a;">
                <span>⭐</span> <span id="vh-hud-points">${this.state.points}</span> điểm
              </div>
            </div>
          </div>

          <!-- Interactive Flower Garden Ground (6 Plots) -->
          <div id="vh-plots-container" style="position: absolute; inset: 0; z-index: 50; pointer-events: auto;">
            ${this.renderPlotsHtml()}
          </div>

          <!-- Animated Butterflies & Bees Flying -->
          <div style="position: absolute; inset: 0; pointer-events: none; z-index: 60; overflow: hidden;">
            <div style="position: absolute; top: 38%; left: 18%; font-size: 28px; animation: vh-fly-1 6s infinite ease-in-out;">🦋</div>
            <div style="position: absolute; top: 48%; left: 74%; font-size: 26px; animation: vh-fly-2 7s infinite ease-in-out 1s;">🐝</div>
            <div style="position: absolute; top: 62%; left: 42%; font-size: 24px; animation: vh-fly-3 5.5s infinite ease-in-out 2s;">🦋</div>
          </div>

          <!-- Bottom Action Control Bar -->
          <div style="position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); display: flex; gap: 14px; z-index: 100; flex-wrap: wrap; justify-content: center; width: 92%;">
            <button onclick="window.VuonHoaApp.openQuizModal()" style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; border: 2px solid #7dd3fc; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(2,132,199,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>💧</span> <span>Làm bài tập kiếm Giọt Nước</span>
            </button>
            <button onclick="window.VuonHoaApp.waterAllPlots()" style="display: flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #10b981, #047857); color: #fff; border: 2px solid #a7f3d0; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(16,185,129,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>🚿</span> <span>Tưới toàn bộ vườn (-5💧)</span>
            </button>
            <button onclick="window.VuonHoaApp.openSeedShopModal()" style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #ec4899, #be185d); color: #fff; border: 2px solid #fbcfe8; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(236,72,153,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>🌻</span> <span>Túi Hạt Giống</span>
            </button>
            <button onclick="window.VuonHoaApp.openClassShowcaseModal()" style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #f59e0b, #b45309); color: #fff; border: 2px solid #fde68a; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(245,158,11,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>🏆</span> <span>Vinh Danh Vườn Lớp</span>
            </button>
          </div>
        </div>

        <!-- Animation CSS Styles -->
        <style>
          @keyframes vh-fly-1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(60px, -35px) rotate(15deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes vh-fly-2 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-50px, 40px) rotate(-15deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes vh-fly-3 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(45px, 25px) rotate(10deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes vh-sway {
            0% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
            100% { transform: rotate(-3deg); }
          }
          @keyframes vh-bloom-burst {
            0% { transform: scale(0.6); opacity: 0; }
            70% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .vh-plot-card:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0 16px 36px rgba(0,0,0,0.2) !important;
          }
        </style>
      `;

      this.updateHUD();
    }

    renderPlotsHtml() {
      // Bố trí 6 luống hoa ở nửa dưới sân vườn
      const plotPositions = [
        { left: '20%', top: '48%' },
        { left: '50%', top: '48%' },
        { left: '80%', top: '48%' },
        { left: '22%', top: '70%' },
        { left: '50%', top: '70%' },
        { left: '78%', top: '70%' }
      ];

      return this.state.plots.map((plot, idx) => {
        const pos = plotPositions[idx] || { left: '50%', top: '50%' };
        const flower = plot.flowerKey ? FLOWER_TYPES[plot.flowerKey] : null;

        // Stage: 0: Đất trống, 1: Nảy mầm, 2: Đâm chồi, 3: Nụ hoa, 4: Nở rộ
        let stageDisplay = {
          icon: '🕳️',
          label: 'Đất trống',
          sub: 'Bấm để gieo hạt',
          anim: ''
        };

        if (plot.stage === 1) {
          stageDisplay = { icon: '🌱', label: 'Nảy mầm', sub: `Cần tưới (${plot.waterCurrent}/${plot.waterTotal} 💧)`, anim: 'animation: vh-sway 2s infinite ease-in-out;' };
        } else if (plot.stage === 2) {
          stageDisplay = { icon: '🌿', label: 'Đâm chồi', sub: `Cần tưới (${plot.waterCurrent}/${plot.waterTotal} 💧)`, anim: 'animation: vh-sway 2.5s infinite ease-in-out;' };
        } else if (plot.stage === 3) {
          stageDisplay = { icon: '🌷', label: 'Nụ hoa chớm nở', sub: `Cần tưới (${plot.waterCurrent}/${plot.waterTotal} 💧)`, anim: 'animation: vh-sway 2.2s infinite ease-in-out;' };
        } else if (plot.stage === 4) {
          stageDisplay = { icon: flower ? flower.icon : '🌺', label: flower ? flower.name : 'Hoa nở rộ', sub: 'ĐÃ NỞ RỘ! Bấm thu hoạch ✨', anim: 'animation: vh-bloom-burst 0.5s ease-out, vh-sway 3s infinite ease-in-out 0.5s;' };
        }

        const isReadyHarvest = plot.stage === 4;
        const isEmpty = plot.stage === 0;

        return `
          <div onclick="window.VuonHoaApp.handlePlotClick(${idx})" class="vh-plot-card" style="position: absolute; left: ${pos.left}; top: ${pos.top}; transform: translate(-50%, -50%); width: 170px; background: rgba(255, 255, 255, 0.94); border-radius: 20px; padding: 12px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.14); border: 2.5px solid ${isReadyHarvest ? '#ec4899' : isEmpty ? '#cbd5e1' : '#34d399'}; cursor: pointer; text-align: center; backdrop-filter: blur(8px); transition: all 0.2s; z-index: 55;">
            <!-- Badge luống số -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: #e0f2fe; color: #0369a1;">Luống #${plot.id}</span>
              ${isReadyHarvest ? '<span style="font-size: 10px; font-weight: 900; color: #fff; background: #ec4899; padding: 2px 6px; border-radius: 10px; animation: pulse 1.5s infinite;">THU HOẠCH</span>' : ''}
            </div>

            <!-- Flower Avatar -->
            <div style="font-size: 46px; height: 56px; line-height: 56px; margin: 4px 0; ${stageDisplay.anim}">
              ${stageDisplay.icon}
            </div>

            <!-- Flower Title & Status -->
            <div style="font-size: 13.5px; font-weight: 800; color: #1e293b; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${flower ? flower.name : stageDisplay.label}
            </div>

            <!-- Progress Bar / Sub text -->
            ${!isEmpty && !isReadyHarvest ? `
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin: 6px 0;">
                <div style="height: 100%; width: ${(plot.waterCurrent / plot.waterTotal) * 100}%; background: #0284c7; border-radius: 3px; transition: width 0.3s;"></div>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #0284c7;">${stageDisplay.sub}</div>
            ` : `
              <div style="font-size: 11px; font-weight: 700; color: ${isReadyHarvest ? '#db2777' : '#64748b'}; margin-top: 4px;">
                ${stageDisplay.sub}
              </div>
            `}
          </div>
        `;
      }).join('');
    }

    renderPlots() {
      const container = document.getElementById('vh-plots-container');
      if (container) {
        container.innerHTML = this.renderPlotsHtml();
      }
    }

    handlePlotClick(plotIndex) {
      const plot = this.state.plots[plotIndex];
      if (!plot) return;

      // 1. Luống trống -> Mở modal gieo hạt
      if (plot.stage === 0) {
        this.openPlantModal(plotIndex);
        return;
      }

      // 2. Hoa đã nở rộ -> Thu hoạch hoa
      if (plot.stage === 4) {
        this.harvestPlot(plotIndex);
        return;
      }

      // 3. Đang lớn -> Tưới nước cho luống
      this.waterSinglePlot(plotIndex);
    }

    openPlantModal(plotIndex) {
      let modal = document.getElementById('vh-plant-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vh-plant-modal';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(520px, 94vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 2px solid #a7f3d0; position: relative;">
            <button onclick="document.getElementById('vh-plant-modal').remove()" style="position: absolute; top: 18px; right: 18px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; background: #ecfdf5; border: 2px solid #10b981; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                🌱
              </div>
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #065f46;">Gieo Hạt Vào Luống #${plotIndex + 1}</h3>
                <p style="margin: 3px 0 0; font-size: 13px; color: #64748b;">Chọn một hạt giống hoa tri thức để bắt đầu gieo trồng</p>
              </div>
            </div>

            <!-- Flower Seed Cards List -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; max-height: 340px; overflow-y: auto; padding-right: 4px;">
              ${Object.keys(FLOWER_TYPES).map(k => {
                const f = FLOWER_TYPES[k];
                const count = this.state.seeds[k] || 0;
                return `
                  <div style="border: 2px solid #e2e8f0; border-radius: 16px; padding: 14px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.15s;">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 30px;">${f.icon}</span>
                        <span style="font-size: 12px; font-weight: 800; padding: 3px 9px; border-radius: 12px; background: ${count > 0 ? '#dcfce7' : '#f1f5f9'}; color: ${count > 0 ? '#15803d' : '#94a3b8'};">
                          Còn ${count} hạt
                        </span>
                      </div>
                      <div style="font-weight: 800; font-size: 14.5px; color: #0f172a; margin-bottom: 4px;">${f.name}</div>
                      <p style="font-size: 11.5px; color: #64748b; line-height: 1.4; margin: 0 0 10px;">${f.desc}</p>
                    </div>
                    <button onclick="window.VuonHoaApp.plantSeed(${plotIndex}, '${k}')" ${count <= 0 ? 'disabled' : ''} style="width: 100%; padding: 8px; border-radius: 10px; border: none; background: ${count > 0 ? '#10b981' : '#cbd5e1'}; color: #fff; font-weight: 800; font-size: 13px; cursor: ${count > 0 ? 'pointer' : 'not-allowed'}; box-shadow: ${count > 0 ? '0 4px 10px rgba(16,185,129,0.25)' : 'none'};">
                      ${count > 0 ? 'Gieo hạt này 🌱' : 'Hết hạt giống'}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px;">
              <button onclick="document.getElementById('vh-plant-modal').remove(); window.VuonHoaApp.openQuizModal();" style="background: none; border: none; color: #0284c7; font-weight: 800; font-size: 13px; cursor: pointer; text-decoration: underline;">
                ⚡ Hết hạt giống? Làm bài tập kiếm thêm hạt giống & giọt nước ›
              </button>
            </div>
          </div>
        </div>
      `;
    }

    plantSeed(plotIndex, flowerKey) {
      const f = FLOWER_TYPES[flowerKey];
      if (!f) return;
      if (!this.state.seeds[flowerKey] || this.state.seeds[flowerKey] <= 0) {
        alert('Bạn đã hết hạt giống này!');
        return;
      }

      this.state.seeds[flowerKey]--;
      this.state.plots[plotIndex] = {
        id: plotIndex + 1,
        flowerKey: flowerKey,
        stage: 1, // Bắt đầu ở nảy mầm
        waterCurrent: 0,
        waterTotal: f.waterTotal
      };

      this.saveState();
      this.renderPlots();
      this.updateHUD();

      const modal = document.getElementById('vh-plant-modal');
      if (modal) modal.remove();

      this.playWaterSound();
      alert(`🌱 Đã gieo ${f.name} vào luống #${plotIndex + 1}! Hãy tưới nước để hoa phát triển nhé.`);
    }

    waterSinglePlot(plotIndex) {
      const plot = this.state.plots[plotIndex];
      if (!plot || plot.stage === 0 || plot.stage === 4) return;

      if (this.state.water <= 0) {
        alert('💧 Bạn đã hết Giọt Nước! Hãy bấm "Làm bài tập kiếm Giọt Nước" để trả lời câu hỏi và nhận thêm nước tưới nhé.');
        return;
      }

      this.state.water--;
      plot.waterCurrent++;
      this.playWaterSound();

      // Tiến triển giai đoạn (stage)
      const ratio = plot.waterCurrent / plot.waterTotal;
      if (plot.waterCurrent >= plot.waterTotal) {
        plot.stage = 4; // Nở rộ!
        this.playBloomSound();
        alert(`🌸 CHÚC MỪNG! Bông ${FLOWER_TYPES[plot.flowerKey].name} tại luống #${plotIndex + 1} đã NỞ RỘ RỰC RỠ! Hãy bấm vào để thu hoạch và tích lũy điểm lớp.`);
      } else if (ratio >= 0.66) {
        plot.stage = 3; // Nụ hoa
      } else if (ratio >= 0.33) {
        plot.stage = 2; // Đâm chồi
      }

      this.saveState();
      this.renderPlots();
      this.updateHUD();
    }

    waterAllPlots() {
      const growingPlots = this.state.plots.filter(p => p.stage > 0 && p.stage < 4);
      if (growingPlots.length === 0) {
        alert('Vườn hiện không có luống hoa nào đang lớn cần tưới nước!');
        return;
      }

      if (this.state.water < 5) {
        alert('Cần ít nhất 5 giọt nước để tưới cho toàn bộ vườn hoa! Hãy làm bài tập để kiếm thêm giọt nước.');
        return;
      }

      this.state.water -= 5;
      this.playWaterSound();

      let newlyBloomed = 0;
      growingPlots.forEach(plot => {
        plot.waterCurrent = Math.min(plot.waterTotal, plot.waterCurrent + 2);
        const ratio = plot.waterCurrent / plot.waterTotal;
        if (plot.waterCurrent >= plot.waterTotal) {
          plot.stage = 4;
          newlyBloomed++;
        } else if (ratio >= 0.66) {
          plot.stage = 3;
        } else if (ratio >= 0.33) {
          plot.stage = 2;
        }
      });

      if (newlyBloomed > 0) {
        this.playBloomSound();
        alert(`🚿 Đã tưới nước mát lành cho toàn vườn! Có ${newlyBloomed} bông hoa vừa NỞ RỘ!`);
      } else {
        alert('🚿 Đã tưới nước mát lành cho toàn bộ luống hoa!');
      }

      this.saveState();
      this.renderPlots();
      this.updateHUD();
    }

    harvestPlot(plotIndex) {
      const plot = this.state.plots[plotIndex];
      if (!plot || plot.stage !== 4) return;

      const flower = FLOWER_TYPES[plot.flowerKey];
      const earnedExp = flower ? flower.exp : 20;

      this.playBloomSound();
      this.state.bloomedFlowers++;
      this.state.points += earnedExp;
      this.state.water += 2; // Tặng thêm 2 giọt nước khi thu hoạch

      // Trả lại luống đất trống
      this.state.plots[plotIndex] = {
        id: plotIndex + 1,
        flowerKey: null,
        stage: 0,
        waterCurrent: 0,
        waterTotal: 0
      };

      this.saveState();
      this.renderPlots();
      this.updateHUD();

      alert(`🌺 BẠN ĐÃ THU HOẠCH THÀNH CÔNG:\n${flower ? flower.name : 'Hoa Đẹp'} (+${earnedExp} Điểm Tri Thức, +2 Giọt nước thưởng 💧)!\nĐiểm của bạn đã được cộng vào Vinh danh Vườn Lớp.`);
    }

    // Modal Bài tập trắc nghiệm kiếm Giọt Nước & Hạt Giống
    openQuizModal() {
      let modal = document.getElementById('vh-quiz-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vh-quiz-modal';
        document.body.appendChild(modal);
      }

      const qIdx = Math.floor(Math.random() * DEFAULT_GARDEN_QUESTIONS.length);
      const q = DEFAULT_GARDEN_QUESTIONS[qIdx];

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(480px, 94vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 2px solid #38bdf8; position: relative;">
            <button onclick="document.getElementById('vh-quiz-modal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; background: #e0f2fe; border: 2px solid #0284c7; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                💧
              </div>
              <div>
                <span style="font-size: 11.5px; font-weight: 800; color: #0284c7; text-transform: uppercase;">THỬ THÁCH TRI THỨC VƯỜN HOA</span>
                <h3 style="margin: 2px 0 0; font-size: 17px; font-weight: 800; color: #0f172a;">Câu hỏi nhận 5 Giọt Nước & Hạt Giống</h3>
              </div>
            </div>

            <!-- Question Box -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.5;">${q.q}</p>
            </div>

            <!-- Options List -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
              ${q.options.map((opt, i) => `
                <button onclick="window.VuonHoaApp.submitQuizAnswer(${qIdx}, ${i})" style="padding: 12px 16px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #1e293b; font-weight: 700; font-size: 14px; cursor: pointer; text-align: left; transition: all 0.15s; display: flex; align-items: center; gap: 10px;" onmouseover="this.style.borderColor='#0284c7'; this.style.background='#f0f9ff';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#ffffff';">
                  <span style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #475569;">${String.fromCharCode(65 + i)}</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 12px;">
              <span>⭐ Trả lời đúng: +5💧 & +1 Hạt giống</span>
              <span>Học tập mỗi ngày</span>
            </div>
          </div>
        </div>
      `;
    }

    submitQuizAnswer(qIdx, selectedIdx) {
      const q = DEFAULT_GARDEN_QUESTIONS[qIdx];
      const modal = document.getElementById('vh-quiz-modal');

      if (selectedIdx === q.correct) {
        this.playBloomSound();
        this.state.water += 5;
        this.state.points += 15;

        // Tặng thêm 1 hạt giống ngẫu nhiên
        const seedKeys = Object.keys(FLOWER_TYPES);
        const randomSeed = seedKeys[Math.floor(Math.random() * seedKeys.length)];
        this.state.seeds[randomSeed] = (this.state.seeds[randomSeed] || 0) + 1;

        this.saveState();
        this.updateHUD();
        if (modal) modal.remove();

        alert(`🎉 CHÍNH XÁC!\nBạn nhận được:\n+ 5 Giọt nước tưới cây 💧\n+ 15 Điểm Tri Thức ⭐\n+ 1 Hạt giống ${FLOWER_TYPES[randomSeed].name} 🌻`);
      } else {
        alert(`❌ Rất tiếc, câu trả lời chưa đúng!\nĐáp án chính xác là: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}\nHãy cố gắng ở câu hỏi tiếp theo nhé!`);
        if (modal) modal.remove();
      }
    }

    // Modal Túi hạt giống
    openSeedShopModal() {
      let modal = document.getElementById('vh-seed-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vh-seed-modal';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(480px, 92vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 2px solid #fbcfe8; position: relative;">
            <button onclick="document.getElementById('vh-seed-modal').remove()" style="position: absolute; top: 18px; right: 18px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 48px; height: 48px; background: #fdf2f8; border: 2px solid #ec4899; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                🌻
              </div>
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #9d174d;">Túi Hạt Giống Của Bạn</h3>
                <p style="margin: 3px 0 0; font-size: 13px; color: #64748b;">Dùng để gieo trồng vào các luống hoa trong sân trường</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
              ${Object.keys(FLOWER_TYPES).map(k => {
                const f = FLOWER_TYPES[k];
                const count = this.state.seeds[k] || 0;
                return `
                  <div style="border: 1.5px solid #fce7f3; border-radius: 16px; padding: 12px; background: #fff5f9; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 32px;">${f.icon}</span>
                    <div style="flex: 1;">
                      <div style="font-weight: 800; font-size: 13.5px; color: #831843;">${f.name}</div>
                      <div style="font-size: 12px; font-weight: 700; color: #db2777;">Số lượng: ${count} hạt</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <button onclick="document.getElementById('vh-seed-modal').remove(); window.VuonHoaApp.openQuizModal();" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #ec4899, #be185d); color: #fff; border: none; border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 15px rgba(236,72,153,0.35);">
              ⚡ Làm bài tập kiếm thêm hạt giống hoa
            </button>
          </div>
        </div>
      `;
    }

    // Modal Vinh danh Vườn lớp
    openClassShowcaseModal() {
      let modal = document.getElementById('vh-showcase-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vh-showcase-modal';
        document.body.appendChild(modal);
      }

      const mockLeaderboard = [
        { rank: 1, name: 'Nguyễn Văn A', flowers: 12, points: 340, badge: '🥇 Hoa Khôi Tri Thức' },
        { rank: 2, name: 'Trần Thị Yến', flowers: 10, points: 290, badge: '🥈 Bàn Tay Vàng' },
        { rank: 3, name: 'Nguyễn Văn Linh', flowers: 9, points: 260, badge: '🥉 Chăm Chỉ' },
        { rank: 4, name: 'Trần Thị Hằng', flowers: 8, points: 230, badge: '🌸 Tích Cực' },
        { rank: 5, name: 'Nguyễn Mạnh Hùng', flowers: 7, points: 210, badge: '🌿 Cố Gắng' }
      ];

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(520px, 94vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 2px solid #fde68a; position: relative;">
            <button onclick="document.getElementById('vh-showcase-modal').remove()" style="position: absolute; top: 18px; right: 18px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                🏆
              </div>
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #92400e;">Bảng Vinh Danh Vườn Hoa Lớp Học</h3>
                <p style="margin: 3px 0 0; font-size: 13px; color: #64748b;">Lớp 10A6 · Năm học 2025 - 2026</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              ${mockLeaderboard.map(u => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 14px; background: ${u.rank === 1 ? '#fef9c3' : u.rank === 2 ? '#f1f5f9' : u.rank === 3 ? '#ffedd5' : '#f8fafc'}; border: 1.5px solid ${u.rank === 1 ? '#fde047' : '#e2e8f0'};">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 900; font-size: 16px; width: 22px; text-align: center; color: ${u.rank <= 3 ? '#b45309' : '#64748b'};">${u.rank}</span>
                    <div>
                      <strong style="font-size: 14px; color: #0f172a;">${u.name}</strong>
                      <div style="font-size: 11px; font-weight: 700; color: #b45309;">${u.badge}</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 14px; color: #db2777;">${u.flowers} bông hoa 🌺</div>
                    <div style="font-size: 11.5px; font-weight: 700; color: #64748b;">${u.points} điểm ⭐</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <button onclick="document.getElementById('vh-showcase-modal').remove()" style="width: 100%; padding: 12px; background: #f59e0b; color: #fff; border: none; border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
              Đóng bảng vinh danh
            </button>
          </div>
        </div>
      `;
    }
  }

  // Khởi tạo Singleton & Launcher toàn cục cho EY
  window.VuonHoaApp = new VuonHoaGame();
  window.openVuonHoaGame = function () {
    const c = document.getElementById('content-area');
    if (c) window.VuonHoaApp.open(c);
  };

})(window);
