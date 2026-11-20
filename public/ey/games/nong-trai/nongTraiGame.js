/**
 * Trò Chơi Hành Trình 1: NÔNG TRẠI VUI VẺ (Farm Journey)
 * Mô phỏng chuẩn xác từ PomyAI trích xuất từ video thực tế
 * Tích hợp cơ chế làm bài tập nhận Xu, Lúa và Ấp trứng gà
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'ey_v2_nongtrai_data';

  // Câu hỏi luyện tập mẫu tích hợp sẵn
  const DEFAULT_FARM_QUESTIONS = [
    { q: 'Phép tính nào sau đây có kết quả bằng 100?', options: ['25 × 4', '15 × 6', '45 + 45', '120 - 30'], correct: 0 },
    { q: 'Hình nào có 4 cạnh bằng nhau và 4 góc vuông?', options: ['Hình chữ nhật', 'Hình vuông', 'Hình thoi', 'Hình bình hành'], correct: 1 },
    { q: 'Một trang trại có 15 con gà và 10 con vịt. Hỏi trang trại có tất cả bao nhiêu con gia cầm?', options: ['20 con', '30 con', '25 con', '35 con'], correct: 2 },
    { q: 'Tìm x biết: x × 5 = 45', options: ['x = 8', 'x = 9', 'x = 7', 'x = 6'], correct: 1 },
    { q: 'Số liền sau của số 999 là số nào?', options: ['998', '1000', '1001', '990'], correct: 1 }
  ];

  class NongTraiGame {
    constructor() {
      this.container = null;
      this.timerInterval = null;
      this.currentStudentId = null;
      this.state = this.loadState();

      // Lắng nghe sự kiện thưởng nông trại từ module bài tập OLM
      window.addEventListener('ey:farm-updated', (e) => {
        if (!e.detail || !e.detail.studentId || e.detail.studentId === this.currentStudentId) {
          this.state = this.loadState();
          this.updateHUD();
        }
      });
    }

    loadState() {
      const sess = window.EyAuth ? window.EyAuth.getSession() : null;
      const stdId = sess && sess.studentId ? sess.studentId : 'default_student';
      this.currentStudentId = stdId;

      try {
        const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (!allData[stdId]) {
          allData[stdId] = {
            coins: 50,
            grain: 15,
            apples: 0,
            chickens: 2,
            eggs: [
              { id: 1, name: 'Mơ - Trứng gà', totalSec: 180, remainingSec: 180, hatching: true },
              { id: 2, name: 'Vàng - Trứng gà', totalSec: 180, remainingSec: 120, hatching: true }
            ],
            fedToday: true,
            streakDays: 1,
            lastFedTime: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        }
        return allData[stdId];
      } catch (e) {
        return {
          coins: 50, grain: 15, apples: 0, chickens: 2,
          eggs: [{ id: 1, name: 'Mơ - Trứng gà', totalSec: 180, remainingSec: 180, hatching: true }],
          fedToday: true, streakDays: 1
        };
      }
    }

    saveState() {
      try {
        const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allData[this.currentStudentId] = this.state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      } catch (e) {}

      // Đồng bộ dữ liệu nông trại lên Firebase Cloud Firestore
      if (window.FirebaseService && typeof window.FirebaseService.saveStudentFarmData === 'function') {
        window.FirebaseService.saveStudentFarmData(this.currentStudentId, this.state).catch(() => {});
      }
    }

    formatTime(sec) {
      if (sec <= 0) return 'Đã nở! 🐣';
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    open(container) {
      this.container = container;
      this.state = this.loadState();
      this.startTimer();
      this.render();

      // Kéo dữ liệu nông trại mới nhất từ Firebase Cloud
      if (window.FirebaseService && typeof window.FirebaseService.getStudentFarmData === 'function') {
        window.FirebaseService.getStudentFarmData(this.currentStudentId).then(cloudData => {
          if (cloudData && typeof cloudData === 'object' && cloudData.coins !== undefined) {
            this.state = { ...this.state, ...cloudData };
            this.saveState();
            this.updateHUD();
          }
        }).catch(() => {});
      }
    }

    close() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (window.switchTab) window.switchTab('troChoiHanhTrinh');
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        let changed = false;
        this.state.eggs.forEach(egg => {
          if (egg.hatching && egg.remainingSec > 0) {
            egg.remainingSec--;
            changed = true;
          }
        });
        if (changed) {
          this.saveState();
          this.updateEggTimersInDOM();
        }
      }, 1000);
    }

    updateEggTimersInDOM() {
      this.state.eggs.forEach((egg, idx) => {
        const timerEl = document.getElementById(`egg-timer-${idx}`);
        if (timerEl) timerEl.textContent = this.formatTime(egg.remainingSec);
      });
    }

    render() {
      if (!this.container) return;

      this.container.innerHTML = `
        <div class="farm-game-screen" style="position: relative; width: 100%; height: 86vh; min-height: 580px; max-height: 900px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); font-family: 'Be Vietnam Pro', sans-serif; background: #86efac; user-select: none;">
          <!-- Farm Background Image Layer -->
          <img src="/ey/games/nong-trai/bg_farm_full.jpg" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none;" alt="Trang trại vui vẻ" />

          <!-- Top Navigation HUD -->
          <div style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
            <!-- Back button -->
            <button onclick="window.NongTraiApp.close()" style="width: 44px; height: 44px; border-radius: 50%; background: #ffffff; color: #1e293b; border: 2px solid #cbd5e1; font-size: 20px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
              ‹
            </button>

            <!-- Status Speech Bubble -->
            <div id="farm-speech-bubble" style="background: rgba(255, 255, 255, 0.95); padding: 8px 24px; border-radius: 30px; font-weight: 800; font-size: 14px; color: #1e293b; box-shadow: 0 4px 15px rgba(0,0,0,0.12); border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(4px);">
              <span>🌾</span>
              <span id="speech-text">${this.state.fedToday ? 'Cả đàn đã no hôm nay rồi.' : 'Đàn gà đang đói, hãy bấm Máng ăn để cho ăn!'}</span>
            </div>

            <!-- Currency & Inventory Badges -->
            <div style="display: flex; gap: 10px;">
              <div style="background: rgba(255,255,255,0.95); padding: 7px 14px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #b45309; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span>🪙</span> <span id="hud-coins">${this.state.coins}</span> xu
              </div>
              <div style="background: rgba(255,255,255,0.95); padding: 7px 14px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #15803d; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span>🌾</span> <span id="hud-grain">${this.state.grain}</span> lúa
              </div>
              <div style="background: rgba(255,255,255,0.95); padding: 7px 14px; border-radius: 20px; font-weight: 800; font-size: 13.5px; color: #b91c1c; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span>🔥</span> <span>${this.state.streakDays}</span> ngày
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 14px; z-index: 100;">
            <button onclick="window.NongTraiApp.openQuizModal()" style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; border: 2px solid #5eead4; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(13,148,136,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>📝</span> <span>Làm bài tập kiếm Xu & Lúa</span>
            </button>
            <button onclick="window.NongTraiApp.feedChickens()" style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: 2px solid #fde68a; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(245,158,11,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>🌾</span> <span>Cho đàn gà ăn</span>
            </button>
            <button onclick="window.NongTraiApp.harvestApples()" style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; border: 2px solid #fca5a5; border-radius: 30px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 8px 25px rgba(239,68,68,0.4); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span>🍎</span> <span>Hái táo</span>
            </button>
          </div>

          <!-- Hotspots & Interactive Areas (Lò ấp, Máng ăn, Cây táo, Chuồng gà) -->
          <!-- 1. LÒ ẤP TRỨNG (Incubator Area, x: 42%..60%, y: 30%..52%) -->
          <div onclick="window.NongTraiApp.showEggDetail(0)" style="position: absolute; left: 42%; top: 31%; width: 19%; height: 21%; cursor: pointer; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 50;" title="Bấm để xem lò ấp trứng">
            <div style="display: flex; gap: 14px; margin-top: 10px;">
              ${this.state.eggs.map((egg, idx) => `
                <div style="background: rgba(255,255,255,0.92); border: 1.5px solid #f59e0b; border-radius: 20px; padding: 3px 10px; font-weight: 800; font-size: 12px; color: #b45309; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px;">
                  <span>⏱</span>
                  <span id="egg-timer-${idx}">${this.formatTime(egg.remainingSec)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 2. CÂY TÁO (Apple Tree, x: 80%..95%, y: 22%..50%) -->
          <div onclick="window.NongTraiApp.harvestApples()" style="position: absolute; right: 4%; top: 23%; width: 16%; height: 26%; cursor: pointer; border-radius: 50%; z-index: 50;" title="Cây táo: Bấm để thu hoạch">
          </div>

          <!-- 3. MÁNG ĂN (Feed Trough, x: 37%..48%, y: 58%..66%) -->
          <div onclick="window.NongTraiApp.feedChickens()" style="position: absolute; left: 37%; top: 58%; width: 12%; height: 9%; cursor: pointer; z-index: 50;" title="Máng ăn: Bấm để cho đàn gà ăn">
          </div>

          <!-- Roaming Animated Chickens -->
          <div id="roaming-chickens-container" style="position: absolute; inset: 0; pointer-events: none; z-index: 60;">
            ${this.renderChickens()}
          </div>
        </div>
      `;
    }

    renderChickens() {
      const count = Math.min(6, this.state.chickens || 2);
      const positions = [
        { left: '46%', top: '68%', anim: 'farm-chick-bob 2s infinite ease-in-out' },
        { left: '49%', top: '69%', anim: 'farm-chick-bob 2.3s infinite ease-in-out 0.3s' },
        { left: '33%', top: '63%', anim: 'farm-chick-bob 1.8s infinite ease-in-out 0.6s' },
        { left: '55%', top: '65%', anim: 'farm-chick-bob 2.5s infinite ease-in-out 0.2s' },
        { left: '42%', top: '72%', anim: 'farm-chick-bob 2.1s infinite ease-in-out 0.8s' },
        { left: '52%', top: '73%', anim: 'farm-chick-bob 1.9s infinite ease-in-out 0.5s' }
      ];

      return positions.slice(0, count).map((pos, idx) => `
        <div style="position: absolute; left: ${pos.left}; top: ${pos.top}; transform: translate(-50%, -50%); animation: ${pos.anim}; font-size: 26px;">
          ${idx % 2 === 0 ? '🐣' : '🐥'}
        </div>
      `).join('');
    }

    // Modal thông tin quả trứng (chuẩn ảnh video)
    showEggDetail(eggIndex = 0) {
      const egg = this.state.eggs[eggIndex] || this.state.eggs[0];
      if (!egg) return;

      let modal = document.getElementById('farm-egg-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'farm-egg-modal';
        document.body.appendChild(modal);
      }

      const isReady = egg.remainingSec <= 0;

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(400px, 92vw); border-radius: 24px; padding: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 1.5px solid #fde68a; position: relative;">
            <button onclick="document.getElementById('farm-egg-modal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
              <div style="width: 58px; height: 58px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                🥚
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 16px; color: #0f172a;">${egg.name}</strong>
                  <span style="font-size: 12px; color: #0d9488; font-weight: 700;">Ổ ấp #${eggIndex + 1}</span>
                </div>
                <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">Trứng gà trang trại</div>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; margin-bottom: 6px;">
                <span style="color: #64748b;">Trạng thái:</span>
                <span style="color: ${isReady ? '#16a34a' : '#d97706'}; font-weight: 700;">
                  ${isReady ? 'Đã sẵn sàng nở! 🐣' : 'Đang ấp'}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600;">
                <span style="color: #64748b;">Thời gian:</span>
                <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #0d9488;">
                  ${this.formatTime(egg.remainingSec)}
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              ${isReady ? `
                <button onclick="window.NongTraiApp.hatchEgg(${eggIndex})" style="flex: 1; padding: 12px; background: #16a34a; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
                  🐣 Nhận gà con ngay!
                </button>
              ` : `
                <button onclick="window.NongTraiApp.speedUpEgg(${eggIndex})" style="flex: 1; padding: 12px; background: #f59e0b; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                  ⚡ Rút ngắn 1 phút (5 Xu)
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }

    speedUpEgg(eggIndex) {
      const egg = this.state.eggs[eggIndex];
      if (!egg) return;
      if (this.state.coins < 5) {
        alert('Bạn không đủ xu! Hãy làm bài tập để kiếm thêm xu nhé.');
        return;
      }
      this.state.coins -= 5;
      egg.remainingSec = Math.max(0, egg.remainingSec - 60);
      this.saveState();
      document.getElementById('farm-egg-modal')?.remove();
      this.showEggDetail(eggIndex);
      this.updateHud();
    }

    hatchEgg(eggIndex) {
      const egg = this.state.eggs[eggIndex];
      if (!egg || egg.remainingSec > 0) return;

      this.state.chickens = (this.state.chickens || 2) + 1;
      this.state.coins += 20;
      egg.remainingSec = 180; // Reset ổ ấp tiếp
      this.saveState();

      document.getElementById('farm-egg-modal')?.remove();
      alert(`🎉 CHÚC MỪNG! Trứng đã nở thành 1 chú gà con xinh xắn!\nĐàn gà của bạn hiện có ${this.state.chickens} con. Bạn nhận thêm +20 Xu vàng!`);
      this.render();
    }

    feedChickens() {
      if (this.state.grain < 3) {
        alert('Bạn đã hết lúa! Hãy nhấn "Làm bài tập kiếm Xu & Lúa" để có thức ăn cho gà nhé.');
        return;
      }
      this.state.grain -= 3;
      this.state.coins += 5;
      this.state.fedToday = true;
      this.saveState();

      const bubble = document.getElementById('speech-text');
      if (bubble) bubble.textContent = '😋 Đàn gà đã được ăn no nê và rất vui vẻ!';
      this.updateHud();
      alert('🌾 Bạn đã cho đàn gà ăn no (-3 lúa, +5 xu)! Đàn gà ríu rít cảm ơn bạn.');
    }

    harvestApples() {
      this.state.apples = (this.state.apples || 0) + 3;
      this.state.coins += 15;
      this.saveState();

      this.updateHud();
      alert('🍎 Bạn đã hái được 3 quả táo chín mọng và bán được +15 Xu vàng!');
    }

    updateHud() {
      const cEl = document.getElementById('hud-coins');
      const gEl = document.getElementById('hud-grain');
      if (cEl) cEl.textContent = this.state.coins;
      if (gEl) gEl.textContent = this.state.grain;
    }

    updateHUD() {
      this.updateHud();
    }

    // Modal làm bài tập câu hỏi (Learn to Earn)
    openQuizModal() {
      const qIndex = Math.floor(Math.random() * DEFAULT_FARM_QUESTIONS.length);
      const qItem = DEFAULT_FARM_QUESTIONS[qIndex];

      let modal = document.getElementById('farm-quiz-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'farm-quiz-modal';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(480px, 92vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 2px solid #5eead4; position: relative;">
            <button onclick="document.getElementById('farm-quiz-modal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="background: #ccfbf1; color: #0f766e; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">
                THỬ THÁCH NÔNG DÂN
              </span>
              <span style="font-size: 13px; color: #64748b; font-weight: 600;">Đúng nhận +15 Xu & +5 Lúa!</span>
            </div>

            <h3 style="margin: 0 0 18px 0; font-size: 16px; font-weight: 800; line-height: 1.5; color: #0f172a;">
              ${qItem.q}
            </h3>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              ${qItem.options.map((opt, idx) => `
                <button onclick="window.NongTraiApp.submitAnswer(${idx}, ${qItem.correct})" style="padding: 12px 16px; text-align: left; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s; color: #334155;" onmouseover="this.style.background='#f0fdfa'; this.style.borderColor='#0d9488'" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0'">
                  <span style="display: inline-block; width: 24px; font-weight: 800; color: #0d9488;">${String.fromCharCode(65 + idx)}.</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    submitAnswer(chosenIdx, correctIdx) {
      const modal = document.getElementById('farm-quiz-modal');
      if (chosenIdx === correctIdx) {
        this.state.coins += 15;
        this.state.grain += 5;
        // Rút ngắn 60 giây cho tất cả trứng
        this.state.eggs.forEach(egg => {
          egg.remainingSec = Math.max(0, egg.remainingSec - 60);
        });
        this.saveState();
        if (modal) modal.remove();
        alert('🎉 CHÍNH XÁC! Bạn đã trả lời đúng!\nPhần thưởng: +15 Xu vàng 🪙, +5 Lúa 🌾 và các ổ ấp trứng được rút ngắn 1 phút ⏱!');
        this.render();
      } else {
        alert('Tiếc quá, câu trả lời chưa đúng! Hãy thử lại câu khác nhé.');
      }
    }
  }

  // Global Launcher
  window.NongTraiApp = new NongTraiGame();
  window.openNongTraiGame = function () {
    const c = document.getElementById('content-area');
    if (c) window.NongTraiApp.open(c);
  };
})(window);
