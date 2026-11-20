/**
 * ==============================================================================
 * GAME: THIÊN THẠCH ĐIỂM DANH (THIÊN THẠCH GỌI TÊN)
 * Chuẩn 100% video thực tế PomyAI - Giao diện Full màn hình tràn viền
 * (https://pomyai.com/gv/tro-choi-goi-ten/thien-thach-diem-danh)
 * Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
 * ==============================================================================
 */

(function (global) {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. WEB AUDIO SYNTHESIS ENGINE
  // ----------------------------------------------------------------------------
  class ThienThachAudio {
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

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.05);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }

    // Hợp âm vinh danh rực rỡ khi mở Modal "THIÊN THẠCH ĐÃ CHỌN"
    playVictory() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C E G C E
      chord.forEach((freq, idx) => {
        const t0 = this.ctx.currentTime + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.0);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 1.0);
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. MAIN GAME CONTROLLER CLASS (FULL MÀN HÌNH 100% - SIÊU MƯỢT 0% LAG)
  // ----------------------------------------------------------------------------
  class ThienThachDiemDanhGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.audio = new ThienThachAudio();

      this.roster = this.normalizeRoster(options.roster || options.classRoster || []);
      this.calledStudents = new Set();
      this.pickCount = 1; // Hỗ trợ chọn 1, 2, 3, 4, 5 học sinh
      this.currentWinners = [];
      this.currentWinner = null;

      this.roundNumber = 1;
      this.isPlaying = false;
      this.isPaused = false;
      this.activeTimeouts = [];
      this.videoTimeCheck = null;
      this.keyHandler = this.handleKeyDown.bind(this);

      this.initLayout();
    }

    normalizeRoster(rawRoster) {
      if (!Array.isArray(rawRoster) || rawRoster.length === 0) {
        return [
          "Duyên", "Quốc Bảo", "Hoàng Long", "Mạnh", "Quân", "Ngọc", "Tuấn", "Nam",
          "Hoàng Yến", "Hà", "Hải Yến", "Thùy Linh", "Hân", "Phương Anh", "Diệp", "Kiệt",
          "Phát", "Chi", "Vinh", "Quỳnh", "Đức Long", "Ngân", "Ý", "Mai", "An", "Đức Anh",
          "Vân", "Sơn", "Trúc", "Thảo", "Tùng", "Huy", "Phong", "Nguyên", "Mai Anh", "Thư",
          "Phúc", "Dũng", "Khánh Linh", "Khôi", "Vy", "Gia Bảo", "Châu", "Minh", "Hưng"
        ];
      }
      return rawRoster.map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && item.name) return item.name.trim();
        return String(item);
      }).filter(Boolean);
    }

    getShortName(fullName) {
      if (!fullName) return '';
      const parts = fullName.split(/\s+/);
      return parts[parts.length - 1];
    }

    initLayout() {
      // Thiết kế Full màn hình 100vw x 100vh tràn viền tuyệt đối, video object-fit: cover
      this.container.innerHTML = `
        <div id="tt-viewport" style="position: absolute; inset: 0; width: 100vw; height: 100vh; background: #090d16; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif; user-select: none;">
          
          <!-- Full-bleed Video Stage Frame -->
          <div id="tt-stage" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #000; overflow: hidden;">
            
            <!-- High Definition Hardware-Accelerated Video Player (0% lag, 30fps mượt mà như video gốc PomyAI) -->
            <video id="tt-video" playsinline preload="auto" poster="/ey/games/thienthach/poster_idle.webp" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
              <source src="/ey/games/thienthach/thien_thach_intro.mp4" type="video/mp4">
            </video>

            <!-- Red Student Tag over Soot Student -->
            <div id="tt-soot-tag" style="display: none; position: absolute; top: 38%; left: 50%; transform: translate(-50%, -100%); z-index: 25; background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); color: #ffffff; border: 3px solid #fef08a; padding: 6px 24px; border-radius: 9999px; font-weight: 950; font-size: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); animation: ttPopIn 0.3s ease-out; pointer-events: none; white-space: nowrap;">
              Mai Anh
            </div>

            <!-- Top Header Control Bar -->
            <div style="position: absolute; top: 16px; left: 24px; right: 24px; z-index: 30; display: flex; justify-content: space-between; align-items: center; pointer-events: auto;">
              
              <!-- Title Badge & Class Info -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); padding: 8px 18px; border-radius: 9999px; border: 1.5px solid rgba(251, 146, 60, 0.4); box-shadow: 0 6px 18px rgba(0,0,0,0.4);">
                  <span style="font-size: 22px;">☄️</span>
                  <div>
                    <span style="font-weight: 900; font-size: 15px; color: #fb923c; letter-spacing: 0.5px;">Thiên Thạch Điểm Danh</span>
                    <span id="tt-class-title" style="font-size: 12.5px; color: #94a3b8; margin-left: 8px; font-weight: 700;">${this.options.className || 'Lớp học'} (${this.roster.length} bạn)</span>
                  </div>
                </div>

                <!-- Nút mở danh sách học sinh -->
                <button id="tt-btn-toggle-roster" title="Xem danh sách học sinh" style="padding: 0 16px; height: 42px; border-radius: 9999px; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #f1f5f9; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px); transition: all 0.2s;">
                  <span>📋</span> <span>Danh sách</span>
                </button>
              </div>

              <!-- Center Count Selector: Chọn 1 - 5 học sinh -->
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); padding: 5px 14px; border-radius: 9999px; border: 1.5px solid rgba(251, 146, 60, 0.45); box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
                <span style="font-size: 12.5px; font-weight: 800; color: #fb923c; white-space: nowrap;">Gọi cùng lúc:</span>
                <div id="tt-count-selector" style="display: flex; gap: 5px;">
                  <button data-count="1" class="tt-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: #ea580c; color: #fff; font-size: 14px; font-weight: 900; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(234,88,12,0.5);">1</button>
                  <button data-count="2" class="tt-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">2</button>
                  <button data-count="3" class="tt-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">3</button>
                  <button data-count="4" class="tt-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">4</button>
                  <button data-count="5" class="tt-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">5</button>
                </div>
              </div>

              <!-- Control Buttons -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="tt-btn-fullscreen" title="Toàn màn hình" style="width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s;">
                  ⛶
                </button>
                <button id="tt-btn-sound" title="Bật/Tắt âm thanh" style="width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s;">
                  🔊
                </button>
                <button id="tt-btn-pause" title="Tạm dừng" style="padding: 0 16px; height: 42px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px); transition: all 0.2s;">
                  <span id="tt-pause-icon">⏸</span> <span id="tt-pause-text">Tạm dừng</span>
                </button>
                <button id="tt-btn-exit" title="Thoát trò chơi" style="padding: 0 18px; height: 42px; border-radius: 12px; border: 1.5px solid rgba(239, 68, 68, 0.4); background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(239,68,68,0.4); transition: all 0.2s;">
                  ✕ Thoát
                </button>
              </div>
            </div>

            <!-- Bottom Right Fast Shortcut: Enter xem ngay kết quả -->
            <button id="tt-btn-fast-forward" title="Bấm Enter để xem ngay kết quả" style="position: absolute; bottom: 20px; right: 24px; z-index: 30; background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 10px 18px; color: #f1f5f9; font-size: 13.5px; font-weight: 700; cursor: pointer; backdrop-filter: blur(8px); box-shadow: 0 6px 16px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
              <kbd style="background: #334155; border: 1px solid #475569; border-radius: 6px; padding: 3px 8px; font-size: 11.5px; font-weight: 900; color: #fb923c;">Enter</kbd>
              <span>Xem ngay kết quả</span>
            </button>

            <!-- Center Start Button Overlay (Chỉ hiện khi vừa mở ván đầu tiên) -->
            <div id="tt-start-overlay" style="position: absolute; inset: 0; z-index: 35; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); backdrop-filter: blur(3px);">
              <button id="tt-btn-start" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; border: 4px solid #fef08a; border-radius: 28px; padding: 20px 58px; font-size: 30px; font-weight: 950; cursor: pointer; box-shadow: 0 16px 36px rgba(234,88,12,0.6), inset 0 2px 4px rgba(255,255,255,0.5); letter-spacing: 1px; display: flex; align-items: center; gap: 14px; transition: transform 0.15s ease-out;">
                <span>☄️</span> Bắt đầu điểm danh
              </button>
            </div>

            <!-- Slide-out Roster Drawer (Ngăn kéo danh sách lớp) -->
            <div id="tt-roster-drawer" style="display: none; position: absolute; top: 0; right: 0; bottom: 0; width: 340px; background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(16px); border-left: 1.5px solid rgba(255,255,255,0.15); z-index: 35; box-shadow: -10px 0 35px rgba(0,0,0,0.6); padding: 24px; flex-direction: column; animation: ttSlideIn 0.25s ease-out;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                <div style="font-weight: 900; font-size: 16px; color: #fb923c;">📋 Danh sách lớp (${this.roster.length})</div>
                <button id="tt-btn-close-roster" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; font-weight: 700;">✕</button>
              </div>
              <div id="tt-roster-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 6px;"></div>
            </div>

            <!-- Winner Modal Overlay ("THIÊN THẠCH ĐÃ CHỌN") - 100% Opaque, Chống đè hình tuyệt đối -->
            <div id="tt-winner-modal" style="display: none; position: absolute; inset: 0; z-index: 50; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
              <div style="background: #ffffff; border: 4px solid #ea580c; border-radius: 28px; padding: 34px 40px; width: 90%; max-width: 600px; box-shadow: 0 30px 80px rgba(0,0,0,0.85); text-align: center; position: relative; animation: ttPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                
                <!-- Red Top Badge: "THIÊN THẠCH ĐÃ CHỌN" -->
                <div style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%); color: #ffffff; padding: 6px 30px; border-radius: 9999px; font-weight: 950; font-size: 17px; letter-spacing: 1.5px; border: 3px solid #fef08a; box-shadow: 0 6px 16px rgba(185,28,28,0.5); white-space: nowrap;">
                  THIÊN THẠCH ĐÃ CHỌN
                </div>

                <!-- Soot Face Emoji / Avatar Header -->
                <div style="margin-top: 10px; margin-bottom: 8px; font-size: 56px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
                  🌪️
                </div>

                <!-- Subtitle / Flavor text -->
                <div id="tt-winner-subtitle" style="font-size: 15px; font-weight: 800; color: #475569; margin-bottom: 8px;">
                  Lên bảng nào, mặt còn dính muội cũng không sao!
                </div>

                <!-- Winner Container (1 hoặc nhiều học sinh) -->
                <div id="tt-winner-content" style="margin: 10px 0 24px 0; min-height: 52px; display: flex; align-items: center; justify-content: center;">
                  <div id="tt-winner-name" style="font-size: 46px; font-weight: 950; color: #c2410c; letter-spacing: 0.5px; line-height: 1.2;">
                    Mai Anh
                  </div>
                </div>

                <!-- Action Button: Gọi tiếp -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
                  <button id="tt-btn-call-next" style="flex: 1; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; border: 3px solid #fef08a; border-radius: 18px; padding: 15px 30px; font-size: 20px; font-weight: 900; cursor: pointer; box-shadow: 0 8px 22px rgba(234,88,12,0.45); display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.15s;">
                    <span>▶</span> Gọi tiếp
                  </button>
                  <button id="tt-btn-close-modal" style="background: #ffffff; border: 2px solid #cbd5e1; border-radius: 18px; padding: 15px 22px; font-size: 16px; font-weight: 800; color: #475569; cursor: pointer;">
                    ✕
                  </button>
                </div>

                <!-- Remaining Count -->
                <div id="tt-remaining-count" style="margin-top: 16px; font-size: 13px; font-weight: 800; color: #78350f;">
                  Còn lại 44 bạn chưa bị gọi
                </div>
              </div>
            </div>

          </div>
        </div>

        <style>
          @keyframes ttPopIn {
            0% { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes ttSlideIn {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
          @keyframes ttShake {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(-8px, 6px); }
            40% { transform: translate(8px, -6px); }
            60% { transform: translate(-6px, -4px); }
            80% { transform: translate(6px, 4px); }
          }
          .tt-shake-stage {
            animation: ttShake 0.4s ease-in-out !important;
          }
        </style>
      `;

      this.bindEvents();
    }

    bindEvents() {
      // Start button
      const startBtn = this.container.querySelector('#tt-btn-start');
      if (startBtn) {
        startBtn.onclick = () => {
          this.audio.playClick();
          this.container.querySelector('#tt-start-overlay').style.display = 'none';
          this.startRound(false);
        };
      }

      // Fast forward (Enter)
      const fastBtn = this.container.querySelector('#tt-btn-fast-forward');
      if (fastBtn) {
        fastBtn.onclick = () => {
          this.triggerFastForward();
        };
      }

      // Selector số lượng gọi: 1, 2, 3, 4, 5
      const countBtns = this.container.querySelectorAll('.tt-count-btn');
      countBtns.forEach(btn => {
        btn.onclick = () => {
          const cnt = parseInt(btn.dataset.count, 10);
          if (!cnt) return;
          this.pickCount = cnt;
          this.audio.playClick();
          countBtns.forEach(b => {
            const isAct = parseInt(b.dataset.count, 10) === this.pickCount;
            b.style.background = isAct ? '#ea580c' : 'rgba(255,255,255,0.08)';
            b.style.color = isAct ? '#ffffff' : '#94a3b8';
            b.style.fontWeight = isAct ? '900' : '700';
            b.style.boxShadow = isAct ? '0 2px 8px rgba(234,88,12,0.5)' : 'none';
          });
        };
      });

      // Toggle danh sách học sinh
      const rosterBtn = this.container.querySelector('#tt-btn-toggle-roster');
      const rosterDrawer = this.container.querySelector('#tt-roster-drawer');
      const closeRosterBtn = this.container.querySelector('#tt-btn-close-roster');
      if (rosterBtn && rosterDrawer) {
        rosterBtn.onclick = () => {
          this.audio.playClick();
          this.renderRosterDrawer();
          rosterDrawer.style.display = 'flex';
        };
      }
      if (closeRosterBtn && rosterDrawer) {
        closeRosterBtn.onclick = () => {
          rosterDrawer.style.display = 'none';
        };
      }

      // Pause toggle
      const pauseBtn = this.container.querySelector('#tt-btn-pause');
      if (pauseBtn) {
        pauseBtn.onclick = () => {
          this.togglePause();
        };
      }

      // Sound toggle
      const soundBtn = this.container.querySelector('#tt-btn-sound');
      if (soundBtn) {
        soundBtn.onclick = () => {
          this.audio.enabled = !this.audio.enabled;
          soundBtn.textContent = this.audio.enabled ? '🔊' : '🔇';
          const video = this.container.querySelector('#tt-video');
          if (video) video.muted = !this.audio.enabled;
          if (this.audio.enabled) this.audio.playClick();
        };
      }

      // Fullscreen
      const fsBtn = this.container.querySelector('#tt-btn-fullscreen');
      if (fsBtn) {
        fsBtn.onclick = () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        };
      }

      // Exit button
      const exitBtn = this.container.querySelector('#tt-btn-exit');
      if (exitBtn) {
        exitBtn.onclick = () => {
          this.destroy();
          if (typeof this.options.onExit === 'function') {
            this.options.onExit();
          }
        };
      }

      // Winner modal: Gọi tiếp
      const nextBtn = this.container.querySelector('#tt-btn-call-next');
      if (nextBtn) {
        nextBtn.onclick = () => {
          this.audio.playClick();
          this.hideWinnerModal();
          this.startRound(true); // Vòng 2 trở đi: chạy video tốc độ cao 3.2s
        };
      }

      // Winner modal: Close
      const closeBtn = this.container.querySelector('#tt-btn-close-modal');
      if (closeBtn) {
        closeBtn.onclick = () => {
          this.hideWinnerModal();
        };
      }

      window.addEventListener('keydown', this.keyHandler);
    }

    handleKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.triggerFastForward();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      } else if (e.key === 'Escape') {
        const modal = this.container.querySelector('#tt-winner-modal');
        if (modal && modal.style.display !== 'none') {
          this.hideWinnerModal();
        }
        const drawer = this.container.querySelector('#tt-roster-drawer');
        if (drawer && drawer.style.display !== 'none') {
          drawer.style.display = 'none';
        }
      }
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      const pauseIcon = this.container.querySelector('#tt-pause-icon');
      const pauseText = this.container.querySelector('#tt-pause-text');
      const video = this.container.querySelector('#tt-video');
      if (this.isPaused) {
        if (pauseIcon) pauseIcon.textContent = '▶';
        if (pauseText) pauseText.textContent = 'Tiếp tục';
        if (video) video.pause();
      } else {
        if (pauseIcon) pauseIcon.textContent = '⏸';
        if (pauseText) pauseText.textContent = 'Tạm dừng';
        if (video && this.isPlaying) video.play().catch(() => {});
      }
    }

    renderRosterDrawer() {
      const listContainer = this.container.querySelector('#tt-roster-list');
      if (!listContainer) return;
      listContainer.innerHTML = '';

      this.roster.forEach((name, idx) => {
        const isCalled = this.calledStudents.has(name);
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          background: ${isCalled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'};
          border: 1px solid ${isCalled ? 'transparent' : 'rgba(251,146,60,0.2)'};
          color: ${isCalled ? '#64748b' : '#f8fafc'};
          text-decoration: ${isCalled ? 'line-through' : 'none'};
          font-size: 13.5px;
          font-weight: 700;
        `;
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11.5px; color: ${isCalled ? '#475569' : '#fb923c'};">${idx + 1}.</span>
            <span>${name}</span>
          </div>
          <span style="font-size: 11px; padding: 2px 7px; border-radius: 9999px; background: ${isCalled ? '#334155' : '#ea580c'}; color: #fff;">
            ${isCalled ? 'Đã gọi' : 'Chưa gọi'}
          </span>
        `;
        listContainer.appendChild(item);
      });
    }

    shakeStage() {
      const stage = this.container.querySelector('#tt-stage');
      if (stage) {
        stage.classList.add('tt-shake-stage');
        setTimeout(() => {
          stage.classList.remove('tt-shake-stage');
        }, 400);
      }
    }

    // Bắt đầu 1 vòng thiên thạch điểm danh
    startRound(isSubsequentRound = false) {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.hideWinnerModal();

      const sootTag = this.container.querySelector('#tt-soot-tag');
      if (sootTag) sootTag.style.display = 'none';

      // Lọc danh sách học sinh còn lại
      const remaining = this.roster.filter(s => !this.calledStudents.has(s));
      if (remaining.length === 0) {
        alert('Tất cả học sinh trong lớp đều đã được thiên thạch điểm danh! Bắt đầu lại lượt mới.');
        this.calledStudents.clear();
        this.isPlaying = false;
        return;
      }

      // Đồng bộ thông minh với hoạt cảnh nhân vật dính than trong video
      let primaryWinner = null;
      if (!isSubsequentRound) {
        // Vòng 1: Nhân vật nữ tóc dài dính than ở giữa -> Ưu tiên gọi Mai Anh nếu có trong danh sách
        const maiAnh = remaining.find(s => s === 'Mai Anh' || s.endsWith(' Mai Anh') || s.endsWith(' Anh'));
        if (maiAnh) primaryWinner = maiAnh;
      } else {
        // Vòng 2+: Nhân vật nam tóc xù cháy ở bên phải -> Ưu tiên gọi Sơn nếu có trong danh sách
        const son = remaining.find(s => s === 'Sơn' || s.endsWith(' Sơn'));
        if (son) primaryWinner = son;
      }

      // Chọn k học sinh theo this.pickCount
      const k = Math.min(this.pickCount, remaining.length);
      if (primaryWinner) {
        const others = remaining.filter(s => s !== primaryWinner).sort(() => 0.5 - Math.random());
        this.currentWinners = [primaryWinner, ...others.slice(0, k - 1)];
      } else {
        const shuffled = [...remaining].sort(() => 0.5 - Math.random());
        this.currentWinners = shuffled.slice(0, k);
      }
      this.currentWinner = this.currentWinners[0];

      const video = this.container.querySelector('#tt-video');
      if (!video) return;

      const src = (!isSubsequentRound
        ? '/ey/games/thienthach/thien_thach_intro.mp4'
        : '/ey/games/thienthach/thien_thach_round2.mp4') + '?v=20261103_v3';

      if (this.videoTimeCheck) {
        video.removeEventListener('timeupdate', this.videoTimeCheck);
        this.videoTimeCheck = null;
      }
      video.onended = null;

      if (video.getAttribute('data-src') !== src) {
        video.src = src;
        video.setAttribute('data-src', src);
        video.load();
      } else {
        try { video.currentTime = 0; } catch (e) {}
      }
      video.muted = !this.audio.enabled;
      video.play().catch(() => {});

      video.onended = () => {
        this.handleRoundFinish(isSubsequentRound);
      };

      if (!isSubsequentRound) {
        // Vòng 1: Tại 32.0s nhân vật dính than ho khụ khụ xuất hiện
        this.videoTimeCheck = () => {
          if (video.currentTime >= 32.0 && this.isPlaying) {
            this.handleRoundFinish(false);
          }
        };
        video.addEventListener('timeupdate', this.videoTimeCheck);
      } else {
        // Vòng 2+: Tại 3.2s vụ nổ kết thúc, nhân vật tóc xù dính than thở khói
        this.videoTimeCheck = () => {
          if (video.currentTime >= 3.2 && this.isPlaying) {
            this.handleRoundFinish(true);
          }
        };
        video.addEventListener('timeupdate', this.videoTimeCheck);
      }
    }

    handleRoundFinish(isSubsequentRound = false) {
      if (!this.isPlaying) return;
      this.isPlaying = false;

      const video = this.container.querySelector('#tt-video');
      if (video) {
        video.onended = null;
        if (this.videoTimeCheck) {
          video.removeEventListener('timeupdate', this.videoTimeCheck);
          this.videoTimeCheck = null;
        }
        try { video.pause(); } catch (e) {}
      }

      // Hiện thẻ đỏ trên đầu nhân vật dính than (tọa độ chính xác theo nhân vật trong video)
      const sootTag = this.container.querySelector('#tt-soot-tag');
      if (sootTag && this.currentWinners && this.currentWinners.length > 0) {
        sootTag.style.left = isSubsequentRound ? '82%' : '50%';
        sootTag.style.top = isSubsequentRound ? '25%' : '38%';
        sootTag.textContent = this.currentWinners.join(', ');
        sootTag.style.display = 'block';
      }

      // Ghi nhận học sinh đã được gọi
      if (this.currentWinners && this.currentWinners.length > 0) {
        this.currentWinners.forEach(name => this.calledStudents.add(name));
      }

      this.shakeStage();
      setTimeout(() => {
        this.showWinnerModal(this.currentWinners);
      }, 700);
    }

    // Phím Enter: Xem ngay kết quả
    triggerFastForward() {
      if (!this.isPlaying) {
        const startOverlay = this.container.querySelector('#tt-start-overlay');
        if (startOverlay && startOverlay.style.display !== 'none') {
          startOverlay.style.display = 'none';
        }
        this.startRound(this.roundNumber > 1);
      }
      this.clearAllTimers();

      const remaining = this.roster.filter(s => !this.calledStudents.has(s));
      if (remaining.length === 0) return;

      if (!this.currentWinners || this.currentWinners.length === 0) {
        const k = Math.min(this.pickCount, remaining.length);
        const shuffled = [...remaining].sort(() => 0.5 - Math.random());
        this.currentWinners = shuffled.slice(0, k);
        this.currentWinner = this.currentWinners[0];
      }

      const video = this.container.querySelector('#tt-video');
      if (video) {
        try {
          video.currentTime = Math.max(0, video.duration - 0.2);
        } catch (e) {}
      }

      this.handleRoundFinish(this.roundNumber > 1);
    }

    showWinnerModal(winners) {
      this.isPlaying = false;
      this.roundNumber++;
      this.clearAllTimers();
      this.audio.playVictory();

      // Luôn ẩn sootTag khi mở modal để chống đè hình, chống lộ thẻ ở góc
      const sootTag = this.container.querySelector('#tt-soot-tag');
      if (sootTag) sootTag.style.display = 'none';

      const modal = this.container.querySelector('#tt-winner-modal');
      const subtitleEl = this.container.querySelector('#tt-winner-subtitle');
      const contentEl = this.container.querySelector('#tt-winner-content');
      const countEl = this.container.querySelector('#tt-remaining-count');

      const winnerList = (Array.isArray(winners) ? winners : [winners]).filter(Boolean);

      if (modal && contentEl) {
        if (winnerList.length === 1) {
          if (subtitleEl) {
            subtitleEl.textContent = 'Lên bảng nào, mặt còn dính muội cũng không sao!';
          }
          contentEl.innerHTML = `
            <div id="tt-winner-name" style="font-size: 46px; font-weight: 950; color: #c2410c; letter-spacing: 0.5px; line-height: 1.2;">
              ${winnerList[0]}
            </div>
          `;
        } else {
          if (subtitleEl) {
            subtitleEl.textContent = `Thiên thạch đã gọi trúng ${winnerList.length} bạn lên bảng!`;
          }
          contentEl.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; width: 100%; max-height: 220px; overflow-y: auto; padding: 4px;">
              ${winnerList.map((name, i) => `
                <div style="background: #ffffff; border: 2.5px solid #ea580c; border-radius: 16px; padding: 10px 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 10px; min-width: 140px;">
                  <span style="background: #ea580c; color: #fff; font-size: 13px; font-weight: 900; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${i+1}</span>
                  <span style="font-size: 22px; font-weight: 950; color: #c2410c; letter-spacing: 0.5px;">${name}</span>
                </div>
              `).join('')}
            </div>
          `;
        }

        const remain = this.roster.length - this.calledStudents.size;
        if (countEl) {
          countEl.textContent = `Còn lại ${remain} bạn chưa bị gọi`;
        }
        modal.style.display = 'flex';
      }
    }

    hideWinnerModal() {
      const modal = this.container.querySelector('#tt-winner-modal');
      if (modal) modal.style.display = 'none';
      const sootTag = this.container.querySelector('#tt-soot-tag');
      if (sootTag) sootTag.style.display = 'none';
    }

    clearAllTimers() {
      if (!this.activeTimeouts) this.activeTimeouts = [];
      this.activeTimeouts.forEach(t => clearTimeout(t));
      this.activeTimeouts = [];
    }

    destroy() {
      this.clearAllTimers();
      window.removeEventListener('keydown', this.keyHandler);
      const video = this.container.querySelector('#tt-video');
      if (video) {
        try {
          video.pause();
          video.src = '';
          video.load();
        } catch (e) {}
      }
      this.container.innerHTML = '';
    }
  }

  // ----------------------------------------------------------------------------
  // 3. GLOBAL LAUNCHER REGISTRATION
  // ----------------------------------------------------------------------------
  global.launchThienThachDiemDanh = function (container, options = {}) {
    const game = new ThienThachDiemDanhGame(container, options);
    window.__currentThienThachInstance = game;
    return () => {
      game.destroy();
      window.__currentThienThachInstance = null;
    };
  };

})(typeof window !== 'undefined' ? window : this);
