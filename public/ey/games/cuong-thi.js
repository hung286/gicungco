// =============================================================================
// CƯƠNG THI - THỬ THÁCH LINH PHÙ (ĐẠI NÁO NGHĨA TRANG)
// Trò chơi gọi tên học sinh chuẩn 100% cơ chế video tham khảo PomyAI
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// Phân phối: EY - Trí Tuệ Nhân Tạo & Trò Chơi Giáo Dục
// =============================================================================

(function (global) {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO SYNTHESIZER FOR JIANGSHI THEME
  // =========================================================================
  class JiangshiAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    tone({ freq = 440, to = null, dur = 0.2, gain = 0.3, type = 'sine', delay = 0 }) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (to) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, to), t0 + dur);
      }

      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(g);
      g.connect(this.ctx.destination);

      osc.start(t0);
      osc.stop(t0 + dur);
    }

    noise({ dur = 0.2, gain = 0.2, freq = 800, q = 1, delay = 0 }) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t0 = this.ctx.currentTime + delay;
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, t0);
      filter.Q.setValueAtTime(q, t0);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      noiseNode.connect(filter);
      filter.connect(g);
      g.connect(this.ctx.destination);

      noiseNode.start(t0);
      noiseNode.stop(t0 + dur);
    }

    // Resonant Bronze Temple Chime / Bagua Bowl (Chuông bát quái)
    chuongBatQuai() {
      this.tone({ freq: 587.33, dur: 1.8, gain: 0.35, type: 'sine' }); // D5
      this.tone({ freq: 880, dur: 2.0, gain: 0.22, type: 'sine', delay: 0.02 }); // A5
      this.tone({ freq: 1174.66, dur: 2.2, gain: 0.18, type: 'sine', delay: 0.04 }); // D6
    }

    // Flying Talisman whistling energy whoosh (Tiếng phóng linh phù lướt gió)
    phongLinhPhu() {
      this.tone({ freq: 320, to: 1500, dur: 0.45, gain: 0.35, type: 'sawtooth' });
      this.tone({ freq: 700, to: 2200, dur: 0.5, gain: 0.25, type: 'sine', delay: 0.04 });
      this.noise({ dur: 0.4, gain: 0.2, freq: 2400, q: 3.5 });
    }

    // Sharp slap / seal impact when talisman strikes student's forehead (Dán linh phù lên trán)
    danLinhPhu() {
      this.tone({ freq: 950, to: 120, dur: 0.14, gain: 0.6, type: 'triangle' });
      this.noise({ dur: 0.12, gain: 0.45, freq: 1400, q: 2 });
    }

    // Heavy red seal stamp impact: "BỘP!" (Mời lên bảng)
    dongDau() {
      this.tone({ freq: 180, to: 45, dur: 0.25, gain: 0.75, type: 'triangle' });
      this.noise({ dur: 0.18, gain: 0.5, freq: 750, q: 1.5 });
    }

    // Pentatonic victory fanfare (Hoan hỉ linh thiêng)
    fanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, idx) => {
        this.tone({ freq: f, dur: 0.4, gain: 0.25, type: 'sine', delay: idx * 0.09 });
      });
    }

    // Bats fluttering wings
    tiengBat() {
      for (let i = 0; i < 4; i++) {
        this.noise({ dur: 0.05, gain: 0.08, freq: 1400, q: 2, delay: i * 0.08 });
      }
    }

    // Jiangshi hopping thud
    nhayCuongThi() {
      this.tone({ freq: 160, to: 70, dur: 0.1, gain: 0.25, type: 'sine' });
    }
  }

  // =========================================================================
  // 2. MAIN GAME ENGINE: CƯƠNG THI - THỬ THÁCH LINH PHÙ
  // =========================================================================
  function launchCuongThi(container, options = {}) {
    const audio = new JiangshiAudio();
    const roster = options.roster || [];
    const studentGenders = options.gioiTinh || {};
    const className = options.className || 'Chơi thử';
    const onExit = options.onExit || (() => {});

    // State management: LOADING -> IDLE -> SUMMONING -> REVEAL -> PAUSED
    let state = 'LOADING';
    let previousState = 'IDLE';
    let currentRound = 1;
    let animFrameId = null;
    let loadingProgress = 0;
    let summonTimer = 0;
    let hasSlapped = false;
    let masterOnAltar = false;
    let calledStudentNames = new Set();
    let currentSelectedStudents = []; // 1 or 2 chosen students this round
    let bgParticles = []; // Will-o'-the-wisps (ma trơi)
    let talismanParticles = []; // Flying talisman fiery red/gold trail
    let shockwaves = []; // Impact rings when talisman seals forehead
    let bats = [];

    // Preloaded image assets
    const assets = {
      cemeteryBg: null,
      baguaPlatform: null,
      priest: null,
      priestMeditate: null,
      redTalisman: null,
      loadingCover: null,
      scrollEdict: null
    };

    function loadImage(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    // Setup DOM Structure matching reference video exactly
    container.innerHTML = `
      <div id="jiangshi-root" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #0b071e; overflow: hidden; font-family: 'Be Vietnam Pro', system-ui, sans-serif; user-select: none;">
        <!-- Canvas for Game World -->
        <canvas id="jiangshi-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block;"></canvas>

        <!-- Top Right Header Controls (Clean single layer, zero ghosting - Matches Frames 0020s & 0059s) -->
        <div style="position: absolute; top: 16px; right: 20px; z-index: 50; display: flex; align-items: center; gap: 10px;">
          <button id="btn-fs" title="Toàn màn hình" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 38px; height: 38px; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            ⛶
          </button>
          <button id="btn-sound" title="Bật/Tắt âm thanh" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 38px; height: 38px; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            🔊
          </button>
          <button id="btn-pause" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 0 16px; height: 38px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            Tạm dừng
          </button>
          <button id="btn-exit" style="background: #ffffff; color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 0 18px; height: 38px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            Thoát
          </button>
        </div>

        <!-- Authentic Red Start Button & Student Count Selector at Bottom Center (Matches Frame 0020s) -->
        <div id="btn-summon-bar" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 50; display: none; flex-direction: column; align-items: center; gap: 9px;">
          <!-- Student Count Selector (1-2-3-4-5) -->
          <div id="count-selector-bar" style="display: flex; align-items: center; gap: 8px; background: rgba(15, 7, 30, 0.88); backdrop-filter: blur(8px); padding: 5px 14px; border-radius: 999px; border: 1.5px solid #ca8a04; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
            <span style="font-family: 'Times New Roman', 'Be Vietnam Pro', serif; font-size: 13.5px; font-weight: 700; color: #fef08a; letter-spacing: 0.3px; margin-right: 4px;">Số lượng gọi:</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn-count-opt" data-count="1" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #facc15; background: linear-gradient(180deg, #fde047 0%, #eab308 100%); color: #451a03; font-weight: 900; font-size: 14.5px; cursor: pointer; box-shadow: 0 0 10px rgba(250, 204, 21, 0.6); transition: all 0.15s ease;">1</button>
              <button class="btn-count-opt" data-count="2" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(250, 204, 21, 0.45); background: rgba(20, 10, 35, 0.75); color: #fef08a; font-weight: 700; font-size: 14.5px; cursor: pointer; transition: all 0.15s ease;">2</button>
              <button class="btn-count-opt" data-count="3" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(250, 204, 21, 0.45); background: rgba(20, 10, 35, 0.75); color: #fef08a; font-weight: 700; font-size: 14.5px; cursor: pointer; transition: all 0.15s ease;">3</button>
              <button class="btn-count-opt" data-count="4" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(250, 204, 21, 0.45); background: rgba(20, 10, 35, 0.75); color: #fef08a; font-weight: 700; font-size: 14.5px; cursor: pointer; transition: all 0.15s ease;">4</button>
              <button class="btn-count-opt" data-count="5" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(250, 204, 21, 0.45); background: rgba(20, 10, 35, 0.75); color: #fef08a; font-weight: 700; font-size: 14.5px; cursor: pointer; transition: all 0.15s ease;">5</button>
            </div>
          </div>

          <button id="btn-start-summon" style="background: linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); color: #ffffff; border: 2.5px solid #facc15; border-radius: 999px; padding: 10px 42px; font-size: 18px; font-weight: 900; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.3); text-shadow: 0 2px 4px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px; transition: all 0.15s ease;">
            <span style="color: #facc15; font-size: 18px;">▶</span> Bắt đầu
          </button>
        </div>

        <!-- Candidate Preview HUD during summoning -->
        <div id="summon-candidate-hud" style="position: absolute; top: 22px; left: 50%; transform: translateX(-50%); z-index: 50; display: none; align-items: center; gap: 12px;"></div>

        <!-- Imperial Edict Banner Modal (Chiếu Chỉ Phong Ấn / Mời Lên Bảng - Frame 0052s) -->
        <div id="edict-modal" style="position: absolute; inset: 0; z-index: 80; background: rgba(5, 3, 15, 0.85); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center;">
          <div id="edict-scroll-card" style="width: 410px; max-width: 90vw; animation: dropScroll 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28); position: relative; margin: auto;">
            <!-- Top Golden Roller Rod with Red Hanging Tassels (Frame 0052s) -->
            <div style="height: 15px; background: linear-gradient(180deg, #fef08a 0%, #ca8a04 50%, #854d0e 100%); border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); position: relative; z-index: 10;">
              <!-- Left Knob & Hanging Tassel -->
              <div style="position: absolute; left: -12px; top: -4px; width: 18px; height: 23px; background: #a16207; border-radius: 5px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);">
                <div style="position: absolute; left: 7px; top: 22px; width: 4px; height: 20px; background: #dc2626; border-radius: 0 0 2px 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
              </div>
              <!-- Right Knob & Hanging Tassel -->
              <div style="position: absolute; right: -12px; top: -4px; width: 18px; height: 23px; background: #a16207; border-radius: 5px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);">
                <div style="position: absolute; right: 7px; top: 22px; width: 4px; height: 20px; background: #dc2626; border-radius: 0 0 2px 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>
              </div>
            </div>

            <!-- Red Silk Banner Body with Jagged Swallowtail Bottom Edge -->
            <div style="background: #991b1b; background-image: repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px); border: 2.5px solid #facc15; border-top: none; padding: 16px 24px 34px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); text-align: center; position: relative; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), 80% 100%, 60% calc(100% - 16px), 40% 100%, 20% calc(100% - 16px), 0 100%);">
              <!-- Inner Ornamental Gold Border with Corner Notches -->
              <div style="position: absolute; inset: 6px; border: 1.5px solid rgba(250, 204, 21, 0.75); pointer-events: none;"></div>

              <!-- Round Title -->
              <div id="edict-round-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 17px; font-weight: 700; color: #fef08a; letter-spacing: 0.5px; margin-bottom: 6px;">
                Lượt 1
              </div>

              <!-- Humorous Status Pill Badge -->
              <div id="edict-status-badge" style="display: inline-block; background: #7f1d1d; border: 1.5px solid #fde047; border-radius: 999px; padding: 3px 18px; font-size: 13px; font-weight: 700; color: #fef08a; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                Cứu bạn nên bị kéo theo
              </div>

              <!-- Character Sprite Showcase in Edict Banner -->
              <div id="edict-avatar-row" style="display: flex; align-items: center; justify-content: center; gap: 20px; height: 110px; margin-bottom: 10px; position: relative;">
              </div>

              <!-- Selected Student Names in Radiant Golden Serif Font -->
              <div id="edict-names" style="font-family: 'Times New Roman', 'Be Vietnam Pro', serif; font-size: 27px; font-weight: 900; color: #fde047; text-shadow: 0 2px 10px rgba(0,0,0,0.8), 0 0 18px rgba(250, 204, 21, 0.6); line-height: 1.25; margin-bottom: 6px;">
                Quốc Bảo<br>Minh
              </div>

              <!-- Smooth Curved Golden Wave Line SVG -->
              <div style="display: flex; justify-content: center; margin: 4px 0 12px;">
                <svg width="120" height="10" viewBox="0 0 120 10" style="display: block;">
                  <path d="M5 5 Q 30 1 60 5 T 115 5" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>

              <!-- Red Angled Official Chop Stamp: "Mời lên bảng" -->
              <div style="display: flex; justify-content: center; margin-bottom: 8px;">
                <div id="edict-stamp" style="display: inline-block; padding: 5px 14px; border: 2.5px solid #ffffff; background: #dc2626; color: #ffffff; font-size: 16px; font-weight: 900; letter-spacing: 1px; transform: rotate(-9deg); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5); animation: stampThud 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); line-height: 1.15; text-align: center;">
                  Mời lên<br>bảng
                </div>
              </div>
            </div>

            <!-- Golden 3D Pill Button: Gọi lượt tiếp theo (Frame 0052s) -->
            <div style="display: flex; justify-content: center; margin-top: 10px; position: relative; z-index: 25;">
              <button id="btn-edict-next" style="background: linear-gradient(180deg, #fde047 0%, #eab308 50%, #ca8a04 100%); color: #451a03; border: 2px solid #fef08a; border-radius: 999px; padding: 10px 38px; font-size: 15.5px; font-weight: 900; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.4); transition: transform 0.15s ease;">
                Gọi lượt tiếp theo
              </button>
            </div>
          </div>
        </div>

        <!-- Exit Confirmation Dialog (Matches Frame 0064s exactly) -->
        <div id="exit-modal" style="position: absolute; inset: 0; z-index: 95; background: rgba(5, 3, 15, 0.82); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center;">
          <div style="background: #991b1b; background-image: repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px); border: 3px solid #facc15; border-radius: 6px; padding: 28px 42px; text-align: center; max-width: 440px; box-shadow: 0 10px 35px rgba(0,0,0,0.85); position: relative;">
            <div style="position: absolute; inset: 6px; border: 1.5px solid rgba(250, 204, 21, 0.7); pointer-events: none;"></div>
            <div style="font-family: 'Times New Roman', 'Be Vietnam Pro', serif; font-size: 32px; font-weight: 900; color: #fde047; text-shadow: 0 2px 6px rgba(0,0,0,0.7); margin-bottom: 8px;">
              Kết thúc ván?
            </div>
            <div style="font-family: 'Times New Roman', 'Be Vietnam Pro', serif; font-style: italic; font-size: 15px; color: #ffffff; margin-bottom: 24px; opacity: 0.95;">
              Các em chưa được gọi sẽ chờ ván sau.
            </div>
            <div style="display: flex; justify-content: center; gap: 16px;">
              <button id="btn-exit-cancel" style="background: #7f1d1d; color: #ffffff; border: 1.5px solid #facc15; border-radius: 999px; padding: 8px 26px; font-size: 14.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
                Chơi tiếp
              </button>
              <button id="btn-exit-confirm" style="background: linear-gradient(180deg, #fde047 0%, #eab308 100%); color: #451a03; border: 2px solid #fef08a; border-radius: 999px; padding: 8px 28px; font-size: 14.5px; font-weight: 900; cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
                Kết thúc
              </button>
            </div>
          </div>
        </div>

        <!-- Paused Overlay -->
        <div id="paused-overlay" style="position: absolute; inset: 0; z-index: 90; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; flex-direction: column;">
          <div style="font-size: 48px; margin-bottom: 12px;">⏸️</div>
          <div style="font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 20px;">ĐÃ TẠM DỪNG</div>
          <button id="btn-resume-modal" style="background: #00aa95; color: #fff; border: none; border-radius: 8px; padding: 10px 28px; font-size: 15px; font-weight: 700; cursor: pointer;">
            Tiếp tục (P)
          </button>
        </div>
      </div>

      <style>
        @keyframes dropScroll {
          0% { transform: translateY(-80px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes stampThud {
          0% { transform: scale(2.5) rotate(-25deg); opacity: 0; }
          70% { transform: scale(0.9) rotate(-8deg); opacity: 1; }
          100% { transform: scale(1) rotate(-8deg); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    const canvas = container.querySelector('#jiangshi-canvas');
    const ctx = canvas.getContext('2d');
    const btnFs = container.querySelector('#btn-fs');
    const btnSound = container.querySelector('#btn-sound');
    const btnPause = container.querySelector('#btn-pause');
    const btnExit = container.querySelector('#btn-exit');
    const btnSummonBar = container.querySelector('#btn-summon-bar');
    const btnStartSummon = container.querySelector('#btn-start-summon');
    const summonCandidateHud = container.querySelector('#summon-candidate-hud');
    const edictModal = container.querySelector('#edict-modal');
    const edictRoundTitle = container.querySelector('#edict-round-title');
    const edictStatusBadge = container.querySelector('#edict-status-badge');
    const edictAvatarRow = container.querySelector('#edict-avatar-row');
    const edictNames = container.querySelector('#edict-names');
    const btnEdictNext = container.querySelector('#btn-edict-next');
    const exitModal = container.querySelector('#exit-modal');
    const btnExitCancel = container.querySelector('#btn-exit-cancel');
    const btnExitConfirm = container.querySelector('#btn-exit-confirm');
    const pausedOverlay = container.querySelector('#paused-overlay');
    const btnResumeModal = container.querySelector('#btn-resume-modal');

    // =========================================================================
    // 3. STUDENT JIANGSHI CHARACTERS SETUP
    // =========================================================================
    const students = [];
    const colors = ['#2563eb', '#db2777', '#0d9488', '#b45309', '#7c3aed', '#ea580c', '#16a34a'];
    const boyImages = [
      '/ey/games/jiangshi_assets/jiangshi_boy_brown.png',
      '/ey/games/jiangshi_assets/jiangshi_boy_blue.png',
      '/ey/games/jiangshi_assets/jiangshi_boy_green.png',
      '/ey/games/jiangshi_assets/jiangshi_boy_purple.png',
      '/ey/games/jiangshi_assets/jiangshi_boy_yellow.png'
    ];
    const girlImages = [
      '/ey/games/jiangshi_assets/jiangshi_girl_teal.png',
      '/ey/games/jiangshi_assets/jiangshi_girl_pink.png',
      '/ey/games/jiangshi_assets/jiangshi_girl_red.png',
      '/ey/games/jiangshi_assets/jiangshi_girl_purple.png',
      '/ey/games/jiangshi_assets/jiangshi_girl_yellow.png'
    ];

    roster.forEach((name, idx) => {
      const g = studentGenders[name] || (idx % 2 === 0 ? 'nam' : 'nu');
      const avatarSrc = g === 'nu'
        ? girlImages[idx % girlImages.length]
        : boyImages[idx % boyImages.length];

      students.push({
        id: idx + 1,
        name: name,
        gender: g,
        avatarSrc: avatarSrc,
        tagColor: colors[idx % colors.length],
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        hopPhase: Math.random() * Math.PI * 2,
        hopSpeed: 0.08 + Math.random() * 0.04,
        isCalled: false,
        hasTalisman: false,
        surpriseHop: 0,
        imgObj: null
      });
    });

    // Daoist Priest (Đạo sĩ / Pháp sư)
    const priestObj = {
      visible: false, // In Idle before clicking start, priest is not yet on screen!
      x: 0,
      y: 0,
      floatPhase: 0,
      leapProgress: 0,
      meditating: false
    };

    // Flying Talisman Object
    const flyingTalisman = {
      active: false,
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      angle: 0,
      progress: 0,
      targetStudents: []
    };

    // 45 Preset Spots matching authentic video layout (Strictly Left Wing & Right Wing, Center Bagua Altar Empty)
    const PRESET_SPOTS = [
      // Left Wing Cluster (x: 0.05 to 0.355)
      [0.055, 0.64], [0.065, 0.78], [0.105, 0.66], [0.125, 0.75], [0.140, 0.84],
      [0.155, 0.58], [0.175, 0.72], [0.195, 0.88], [0.215, 0.78], [0.235, 0.55],
      [0.255, 0.66], [0.265, 0.52], [0.275, 0.76], [0.285, 0.70], [0.285, 0.88],
      [0.315, 0.62], [0.325, 0.68], [0.335, 0.54], [0.345, 0.80], [0.355, 0.62],
      [0.355, 0.74], [0.355, 0.86],

      // Right Wing Cluster (x: 0.645 to 0.925)
      [0.645, 0.64], [0.655, 0.78], [0.665, 0.54], [0.675, 0.74], [0.685, 0.86],
      [0.705, 0.62], [0.715, 0.72], [0.725, 0.80], [0.735, 0.56], [0.745, 0.66],
      [0.765, 0.76], [0.775, 0.86], [0.785, 0.62], [0.795, 0.70], [0.815, 0.82],
      [0.825, 0.56], [0.835, 0.68], [0.845, 0.78], [0.865, 0.88], [0.875, 0.64],
      [0.885, 0.74], [0.905, 0.82], [0.925, 0.70]
    ];

    let cw = 0;
    let ch = 0;

    function recalculateStudentPositions() {
      priestObj.x = cw * 0.5;
      priestObj.y = ch * 0.44;

      for (let i = 0; i < students.length; i++) {
        const spot = PRESET_SPOTS[i % PRESET_SPOTS.length];
        const st = students[i];
        st.baseX = cw * spot[0];
        st.baseY = ch * spot[1];
        if (state !== 'SUMMONING' && state !== 'REVEAL') {
          st.x = st.baseX;
          st.y = st.baseY;
        }
      }
    }

    function resizeCanvas() {
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
      recalculateStudentPositions();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Sound toggle
    btnSound.onclick = () => {
      audio.enabled = !audio.enabled;
      btnSound.innerHTML = audio.enabled ? '🔊' : '🔇';
    };

    // Fullscreen toggle
    btnFs.onclick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    // Pause toggle
    function togglePause() {
      if (state === 'PAUSED') {
        state = previousState;
        pausedOverlay.style.display = 'none';
        btnPause.textContent = 'Tạm dừng';
        btnPause.style.background = 'rgba(255, 255, 255, 0.95)';
        btnPause.style.color = '#0f172a';
      } else if (state !== 'LOADING') {
        previousState = state;
        state = 'PAUSED';
        pausedOverlay.style.display = 'none'; // Keep scene visible, just pause loop
        btnPause.textContent = 'Tiếp tục';
        btnPause.style.background = '#8b5cf6';
        btnPause.style.color = '#ffffff';
      }
    }
    btnPause.onclick = togglePause;
    btnResumeModal.onclick = togglePause;

    // Exit Confirmation Dialog
    btnExit.onclick = () => {
      exitModal.style.display = 'flex';
    };
    btnExitCancel.onclick = () => {
      exitModal.style.display = 'none';
    };
    btnExitConfirm.onclick = () => {
      exitModal.style.display = 'none';
      cleanup();
      onExit();
    };

    // Helper for authentic Vietnamese student display names
    function getShortDisplayName(fullName) {
      if (!fullName) return '';
      const clean = fullName.normalize('NFC').trim();
      const parts = clean.split(/\s+/);
      if (parts.length <= 1) return clean;
      const lastTwo = parts.slice(-2).join(' ');
      if (lastTwo.length <= 14) return lastTwo;
      return parts[parts.length - 1];
    }

    // Student Count Selection Setting (1-2-3-4-5)
    let selectedStudentCount = 1;
    const countBtns = container.querySelectorAll('.btn-count-opt');
    countBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedStudentCount = parseInt(btn.dataset.count, 10) || 1;
        countBtns.forEach(b => {
          const isActive = parseInt(b.dataset.count, 10) === selectedStudentCount;
          b.style.background = isActive
            ? 'linear-gradient(180deg, #fde047 0%, #eab308 100%)'
            : 'rgba(20, 10, 35, 0.75)';
          b.style.color = isActive ? '#451a03' : '#fef08a';
          b.style.fontWeight = isActive ? '900' : '700';
          b.style.border = isActive
            ? '1.5px solid #facc15'
            : '1.5px solid rgba(250, 204, 21, 0.45)';
          b.style.boxShadow = isActive
            ? '0 0 10px rgba(250, 204, 21, 0.6)'
            : 'none';
        });
      };
    });

    // =========================================================================
    // 4. TRIGGER SUMMON (LINH PHÙ XUẤT TRẬN - KHỞI ĐỘNG VÒNG GỌI)
    // =========================================================================
    function triggerSummon() {
      if (state !== 'IDLE') return;

      audio.chuongBatQuai();
      audio.tiengBat();

      state = 'SUMMONING';
      summonTimer = 0;
      hasSlapped = false;
      masterOnAltar = false;
      priestObj.visible = true;
      priestObj.meditating = false;

      // Update header controls (Matches Frame 0024s)
      btnSummonBar.style.display = 'none';
      btnPause.style.display = 'flex';
      btnPause.textContent = 'Tạm dừng';
      btnPause.style.background = 'rgba(255, 255, 255, 0.95)';
      btnPause.style.color = '#0f172a';
      btnExit.textContent = 'Kết thúc';

      // Pick candidates from remaining uncalled students based on selected count (1-2-3-4-5)
      const remaining = students.filter(s => !calledStudentNames.has(s.name));
      const pool = remaining.length > 0 ? remaining : students;

      const countToPick = Math.max(1, Math.min(pool.length, selectedStudentCount));
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      currentSelectedStudents = shuffled.slice(0, countToPick);

      // Reset talisman state for this round
      flyingTalisman.active = true;
      flyingTalisman.x = cw * 0.5;
      flyingTalisman.y = ch * 0.4;
      flyingTalisman.prevX = flyingTalisman.x;
      flyingTalisman.prevY = flyingTalisman.y;
      flyingTalisman.angle = 0;
      flyingTalisman.targetStudents = currentSelectedStudents;

      // Spawn Bats
      bats = [];
      for (let i = 0; i < 7; i++) {
        bats.push({
          x: cw * (0.15 + Math.random() * 0.7),
          y: ch * (0.08 + Math.random() * 0.35),
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 3,
          size: 14 + Math.random() * 10,
          wingPhase: Math.random() * Math.PI
        });
      }

      // Populate Candidate HUD at top
      summonCandidateHud.innerHTML = currentSelectedStudents.map(s => `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); color: #ffffff; border: 2px solid #fef08a; padding: 6px 20px; border-radius: 999px; font-size: 14.5px; font-weight: 800; box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px rgba(250, 204, 21, 0.45); animation: dropScroll 0.3s ease;">
          ${getShortDisplayName(s.name)}
        </div>
      `).join('');
      summonCandidateHud.style.display = 'flex';
    }

    btnStartSummon.onclick = triggerSummon;

    // Show Edict Reveal Modal (Frame 0052s)
    function showEdictModal() {
      state = 'REVEAL';
      audio.dongDau();
      audio.fanfare();

      edictRoundTitle.textContent = `Lượt ${currentRound}`;
      const statusPhrases = [
        'Cứu bạn nên bị kéo theo',
        'Bị dán linh phù phong ấn!',
        'Cương thi thức tỉnh!',
        'Trúng thử thách linh phù!',
        'Pháp sư đạo sĩ gọi tên!'
      ];
      edictStatusBadge.textContent = currentSelectedStudents.length > 1
        ? statusPhrases[(currentRound - 1) % statusPhrases.length]
        : 'Số phận đã điểm tên';

      // Chosen sprites in modal with individual spinning Bagua aura wheel (Frame 0052s)
      const count = currentSelectedStudents.length;
      const avatarSize = count > 3 ? (count === 4 ? 68 : 58) : (count === 3 ? 80 : 95);
      const avatarGap = count > 3 ? 8 : (count === 3 ? 12 : 20);

      edictAvatarRow.style.gap = `${avatarGap}px`;
      edictAvatarRow.innerHTML = currentSelectedStudents.map(st => `
        <div style="position: relative; width: ${avatarSize}px; height: ${avatarSize}px; display: flex; align-items: center; justify-content: center; z-index: 5;">
          <!-- Individual rotating golden Bagua wheel aura behind each sprite -->
          <div style="position: absolute; inset: -5px; border: 2px dashed rgba(250, 204, 21, 0.65); border-radius: 50%; animation: spin 20s linear infinite; pointer-events: none;"></div>
          <img src="${st.avatarSrc}" style="height: ${avatarSize}px; width: ${avatarSize}px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6)); position: relative; z-index: 2;" />
          <!-- Red Talisman on forehead inside modal -->
          <div style="position: absolute; top: ${count > 3 ? 4 : 8}px; left: 50%; transform: translateX(-50%); width: ${count > 3 ? 10 : 12}px; height: ${count > 3 ? 16 : 20}px; background: #dc2626; border: 1.5px solid #fef08a; border-radius: 2px; box-shadow: 0 0 8px rgba(250, 204, 21, 0.8); z-index: 3;">
            <div style="width: 3px; height: ${count > 3 ? 8 : 10}px; margin: 2px auto; background: #fef08a; border-radius: 1px;"></div>
          </div>
        </div>
      `).join('');

      const nameFontSize = count > 3 ? 18 : (count === 3 ? 22 : 26);
      edictNames.style.fontSize = `${nameFontSize}px`;
      edictNames.innerHTML = currentSelectedStudents.map(s => getShortDisplayName(s.name)).join(count > 2 ? ' • ' : '<br>');

      // Mark students as called
      currentSelectedStudents.forEach(s => {
        calledStudentNames.add(s.name);
        s.isCalled = true;
        s.hasTalisman = true;
      });

      edictModal.style.display = 'flex';
    }

    // Call Next Round (Frame 0057s: Directly kicks off next round!)
    function callNextRound() {
      edictModal.style.display = 'none';
      summonCandidateHud.style.display = 'none';
      currentRound++;

      // Keep previously called students marked with talisman on forehead
      currentSelectedStudents.forEach(st => {
        st.x = st.baseX;
        st.y = st.baseY;
      });

      // Master leaps back offscreen ready for next call
      priestObj.visible = false;
      priestObj.meditating = false;

      // Check if all students called
      const uncalled = students.filter(s => !calledStudentNames.has(s.name));
      if (uncalled.length === 0) {
        calledStudentNames.clear();
        students.forEach(s => {
          s.isCalled = false;
          s.hasTalisman = false;
        });
      }

      // Immediately launch next round summoning (Frame 0057s)
      state = 'IDLE';
      triggerSummon();
    }

    btnEdictNext.onclick = callNextRound;

    // Keyboard Hotkeys
    function handleKeyDown(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state === 'IDLE') {
          triggerSummon();
        } else if (state === 'REVEAL') {
          callNextRound();
        }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (state === 'REVEAL') {
          callNextRound();
        } else if (state === 'IDLE') {
          triggerSummon();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
      } else if (e.code === 'Escape') {
        if (state === 'REVEAL') {
          callNextRound();
        } else {
          exitModal.style.display = 'flex';
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    // Preload all assets
    async function initAssets() {
      assets.cemeteryBg = await loadImage('/ey/games/jiangshi_assets/cemetery_bg.webp');
      assets.baguaPlatform = await loadImage('/ey/games/jiangshi_assets/bagua_clean.png');
      assets.priest = await loadImage('/ey/games/jiangshi_assets/priest.png');
      assets.priestMeditate = await loadImage('/ey/games/jiangshi_assets/priest_meditate.png');
      assets.redTalisman = await loadImage('/ey/games/jiangshi_assets/red_talisman.png');
      assets.loadingCover = await loadImage('/ey/games/jiangshi_assets/loading_cover.webp');
      assets.scrollEdict = await loadImage('/ey/games/jiangshi_assets/scroll_edict.webp');

      // Load Jiangshi sprites into students
      for (const st of students) {
        st.imgObj = await loadImage(st.avatarSrc);
      }

      // Wisps particles
      for (let i = 0; i < 28; i++) {
        bgParticles.push({
          x: Math.random() * cw,
          y: ch * (0.4 + Math.random() * 0.55),
          r: 2 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.2 - Math.random() * 0.5,
          alpha: 0.3 + Math.random() * 0.6,
          hue: 160 + Math.random() * 40
        });
      }
    }

    initAssets();

    // =========================================================================
    // 5. TALISMAN FLIGHT SPLINE TRAJECTORY (Swoop across Left and Right Wings)
    // =========================================================================
    function getTalismanPosition(progress, primaryTarget) {
      const p0 = { x: cw * 0.5, y: ch * 0.40 }; // Start at priest mudra hands
      const p1 = { x: cw * 0.30, y: ch * 0.54 }; // Swoop into left cluster
      const p2 = { x: cw * 0.12, y: ch * 0.70 }; // Deep left wing
      const p3 = { x: cw * 0.18, y: ch * 0.86 }; // Bottom left arc
      const p4 = { x: cw * 0.44, y: ch * 0.30 }; // High climb near moon
      const p5 = { x: cw * 0.70, y: ch * 0.52 }; // Swoop into right cluster
      const p6 = { x: cw * 0.86, y: ch * 0.68 }; // Deep right wing
      const p7 = { x: cw * 0.78, y: ch * 0.88 }; // Bottom right arc
      const p8 = primaryTarget
        ? { x: primaryTarget.baseX, y: primaryTarget.baseY - 45 }
        : { x: cw * 0.5, y: ch * 0.6 };

      const waypoints = [p0, p1, p2, p3, p4, p5, p6, p7, p8];
      const n = waypoints.length - 1;
      const totalT = progress * n;
      const seg = Math.min(n - 1, Math.floor(totalT));
      const localT = totalT - seg;

      const wp0 = waypoints[Math.max(0, seg - 1)];
      const wp1 = waypoints[seg];
      const wp2 = waypoints[seg + 1];
      const wp3 = waypoints[Math.min(n, seg + 2)];

      const t = localT;
      const t2 = t * t;
      const t3 = t2 * t;

      const f1 = -0.5 * t3 + t2 - 0.5 * t;
      const f2 = 1.5 * t3 - 2.5 * t2 + 1.0;
      const f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
      const f4 = 0.5 * t3 - 0.5 * t2;

      const x = wp0.x * f1 + wp1.x * f2 + wp2.x * f3 + wp3.x * f4;
      const y = wp0.y * f1 + wp1.y * f2 + wp2.y * f3 + wp3.y * f4;

      return { x, y };
    }

    // =========================================================================
    // 6. MAIN RENDER & ANIMATION LOOP
    // =========================================================================
    let lastTime = performance.now();

    function renderLoop(now) {
      animFrameId = requestAnimationFrame(renderLoop);
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;

      if (state === 'PAUSED') return;

      // -----------------------------------------------------------------------
      // STATE: LOADING
      // -----------------------------------------------------------------------
      if (state === 'LOADING') {
        loadingProgress += dt * 45; // ~2.2s loading
        ctx.fillStyle = '#0b071e';
        ctx.fillRect(0, 0, cw, ch);

        if (assets.loadingCover) {
          ctx.drawImage(assets.loadingCover, 0, 0, cw, ch);

          const barX = cw * 0.297;
          const barY = ch * 0.686;
          const barW = cw * 0.406;
          const barH = ch * 0.022;

          const fillW = Math.max(0, Math.min(barW, barW * (loadingProgress / 100)));
          const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
          grad.addColorStop(0, '#ef4444');
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#fde047');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(barX, barY, fillW, barH, 4);
          ctx.fill();

          ctx.fillStyle = '#100927';
          ctx.fillRect(cw * 0.35, barY + barH + 4, cw * 0.3, 36);

          ctx.font = "700 15px Georgia, serif";
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText(`Đang chuẩn bị sân chơi  ${Math.min(100, Math.floor(loadingProgress))}%`, cw * 0.5, barY + barH + 26);
        } else {
          ctx.font = "900 40px 'Be Vietnam Pro', serif";
          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'center';
          ctx.fillText('Thử Thách Linh Phù', cw * 0.5, ch * 0.5 - 20);
          ctx.font = "600 16px 'Be Vietnam Pro', sans-serif";
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`Đang chuẩn bị sân chơi ${Math.min(100, Math.floor(loadingProgress))}%`, cw * 0.5, ch * 0.5 + 30);
        }

        if (loadingProgress >= 100) {
          state = 'IDLE';
          btnSummonBar.style.display = 'block';
          btnPause.style.display = 'none';
          btnExit.textContent = 'Thoát';
        }
        return;
      }

      // -----------------------------------------------------------------------
      // STATE: IDLE, SUMMONING, REVEAL
      // -----------------------------------------------------------------------
      // 1. Draw Cemetery Background (Moon, gate, lanterns, spooky trees)
      if (assets.cemeteryBg) {
        ctx.drawImage(assets.cemeteryBg, 0, 0, cw, ch);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, ch);
        bgGrad.addColorStop(0, '#0a051d');
        bgGrad.addColorStop(0.5, '#1e1145');
        bgGrad.addColorStop(1, '#080415');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, cw, ch);
      }

      // 2. Draw Floating Will-o'-the-wisps (Ma trơi)
      bgParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < ch * 0.3) {
          p.y = ch * 0.85;
          p.x = Math.random() * cw;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 55%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw Center Stone Bagua Platform (Fallback if cemeteryBg is missing, since cemeteryBg already includes seamless native altar)
      const baguaW = Math.min(620, cw * 0.44);
      const baguaH = baguaW * 0.543;
      const baguaX = cw * 0.5 - baguaW * 0.5;
      const baguaY = ch * 0.58;

      if (!assets.cemeteryBg && assets.baguaPlatform) {
        ctx.drawImage(assets.baguaPlatform, baguaX, baguaY, baguaW, baguaH);
      }

      // 4. SUMMONING EFFECTS (Radiant Golden Light Pillar & Wireframe Magic Dome)
      if (state === 'SUMMONING' || state === 'REVEAL') {
        summonTimer += dt;

        // Ascending Golden Light Pillar from Bagua Altar (Active when master is on altar, 0.8s - 3.8s)
        if (summonTimer >= 0.8 && summonTimer <= 4.5) {
          ctx.save();
          const beamW = baguaW * 0.65;
          const beamGrad = ctx.createLinearGradient(0, baguaY + baguaH * 0.6, 0, 0);
          beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.7)');
          beamGrad.addColorStop(0.3, 'rgba(250, 204, 21, 0.45)');
          beamGrad.addColorStop(0.8, 'rgba(234, 179, 8, 0.15)');
          beamGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(cw * 0.5 - beamW * 0.5, baguaY + baguaH * 0.5);
          ctx.lineTo(cw * 0.5 - beamW * 0.85, 0);
          ctx.lineTo(cw * 0.5 + beamW * 0.85, 0);
          ctx.lineTo(cw * 0.5 + beamW * 0.5, baguaY + baguaH * 0.5);
          ctx.closePath();
          ctx.fill();

          // Rotating Bagua Magic Hexagram Rune Ring
          ctx.translate(cw * 0.5, baguaY + baguaH * 0.4);
          ctx.scale(1, 0.5);
          ctx.rotate(summonTimer * 0.8);
          ctx.beginPath();
          ctx.arc(0, 0, baguaW * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.lineWidth = 4;
          ctx.stroke();

          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const rx = Math.cos(angle) * (baguaW * 0.4);
            const ry = Math.sin(angle) * (baguaW * 0.4);
            ctx.beginPath();
            ctx.arc(rx, ry, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#fde047';
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 12;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // Fluttering Bats across the sky
        bats.forEach(b => {
          b.x += b.vx;
          b.y += b.vy;
          b.wingPhase += 0.3;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          const wingSpan = Math.sin(b.wingPhase) * b.size;
          ctx.ellipse(0, 0, b.size * 0.4, b.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-b.size * 0.3, 0);
          ctx.lineTo(-b.size * 1.2, wingSpan);
          ctx.lineTo(-b.size * 0.6, 0);
          ctx.lineTo(0, 0);
          ctx.lineTo(b.size * 0.6, 0);
          ctx.lineTo(b.size * 1.2, wingSpan);
          ctx.lineTo(b.size * 0.3, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });

        // Golden Wireframe Protective Barrier Dome on Altar (Frame 0048s)
        if (summonTimer >= 4.5 || state === 'REVEAL') {
          const domeCx = cw * 0.5;
          const domeCy = baguaY + baguaH * 0.48;
          const domeRx = baguaW * 0.34;
          const domeRy = baguaH * 0.32;
          const domeTopY = domeCy - baguaH * 0.85;

          ctx.save();
          // Soft golden aura fill
          ctx.beginPath();
          ctx.arc(domeCx, domeCy, domeRx, Math.PI, 0, false);
          ctx.fillStyle = 'rgba(253, 224, 71, 0.12)';
          ctx.fill();

          // Outer Dome Arch
          ctx.beginPath();
          ctx.arc(domeCx, domeCy, domeRx, Math.PI, 0, false);
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Longitudinal Wireframe Arcs (Meridians)
          [-0.6, -0.25, 0.25, 0.6].forEach(offsetPct => {
            ctx.beginPath();
            ctx.moveTo(domeCx, domeTopY);
            ctx.bezierCurveTo(
              domeCx + domeRx * offsetPct * 1.2, domeCy - baguaH * 0.5,
              domeCx + domeRx * offsetPct * 1.1, domeCy - baguaH * 0.1,
              domeCx + domeRx * offsetPct, domeCy
            );
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          // Base Glow Ring
          ctx.beginPath();
          ctx.ellipse(domeCx, domeCy, domeRx, domeRy * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Red Diamond Stars on Base Ring (✦)
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const sx = domeCx + Math.cos(angle) * domeRx;
            const sy = domeCy + Math.sin(angle) * (domeRy * 0.6);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // 5. Draw Daoist Priest (Đạo sĩ) Leaping, Chanting & Meditating
      if (priestObj.visible) {
        priestObj.floatPhase += dt * 3;
        const priestW = Math.min(180, cw * 0.13);
        const priestH = priestW * 1.6;

        let priestX = cw * 0.5;
        let priestY = ch * 0.44;

        if (state === 'SUMMONING' || state === 'REVEAL') {
          if (summonTimer < 0.8) {
            // Master leaps in from above the left pillar (Frame 0022s)
            const t = summonTimer / 0.8;
            priestX = (cw * 0.32) + (cw * 0.18) * t;
            priestY = (-ch * 0.1) + (ch * 0.54) * t;
          } else if (summonTimer < 3.8) {
            // Master floats in center of Bagua holding red talisman (Frame 0030s)
            priestX = cw * 0.5;
            priestY = ch * 0.42 + Math.sin(priestObj.floatPhase * 2) * 8;
          } else {
            // Master steps down to the left of the altar into meditation (Frame 0039s, 0048s)
            priestX = cw * 0.35;
            priestY = ch * 0.65;
            priestObj.meditating = true;
          }
        }

        ctx.save();
        ctx.translate(priestX, priestY);

        if (summonTimer >= 0.8 && summonTimer < 3.8) {
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 24;
        }

        // Use meditative sprite when standing beside the altar
        const spriteToDraw = (priestObj.meditating && assets.priestMeditate)
          ? assets.priestMeditate
          : assets.priest;

        if (spriteToDraw) {
          ctx.drawImage(spriteToDraw, -priestW * 0.5, -priestH * 0.5, priestW, priestH);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 6. Draw 45 Student Jiangshis (Chibi Qing Robes)
      const spriteW = Math.min(80, cw * 0.055);
      const spriteH = spriteW * 1.45;

      students.forEach(st => {
        st.hopPhase += st.hopSpeed;

        let drawX = st.x;
        const hopOffset = Math.abs(Math.sin(st.hopPhase)) * 12 + st.surpriseHop;
        if (st.surpriseHop > 0) st.surpriseHop = Math.max(0, st.surpriseHop - dt * 25);

        let drawY = (st.y - spriteH * 0.5 - 10) - hopOffset;

        // Chosen students hop toward center Bagua Altar after being sealed (Frame 0041s - 0048s)
        const isChosenThisRound = currentSelectedStudents.includes(st);
        if ((state === 'SUMMONING' || state === 'REVEAL') && isChosenThisRound && summonTimer >= 3.8) {
          const slotIdx = currentSelectedStudents.indexOf(st);
          const totalSlot = currentSelectedStudents.length;
          let targetPlatformX = cw * 0.5;
          if (totalSlot > 1) {
            const spread = Math.min(baguaW * 0.55, (totalSlot - 1) * 55);
            const startX = cw * 0.5 - spread * 0.5;
            targetPlatformX = startX + (spread / (totalSlot - 1)) * slotIdx;
          }
          const targetPlatformY = baguaY + baguaH * 0.48;

          // Smooth leap toward altar platform
          st.x += (targetPlatformX - st.x) * 0.12;
          st.y += (targetPlatformY - st.y) * 0.12;
          drawX = st.x;
          drawY = (st.y - spriteH * 0.5 - 10) - (hopOffset * 1.6);

          // Golden spark trail
          ctx.beginPath();
          ctx.arc(drawX, drawY + spriteH * 0.4, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw Jiangshi Sprite
        ctx.save();
        ctx.translate(drawX, drawY);

        if (st.isCalled) {
          ctx.filter = 'brightness(0.85)';
        }

        if (st.imgObj) {
          ctx.drawImage(st.imgObj, -spriteW * 0.5, -spriteH * 0.5, spriteW, spriteH);
        } else {
          ctx.fillStyle = st.gender === 'nu' ? '#ec4899' : '#0284c7';
          ctx.fillRect(-spriteW * 0.4, -spriteH * 0.4, spriteW * 0.8, spriteH * 0.8);
        }
        ctx.filter = 'none';

        // Draw sealed red talisman covering forehead/face if sealed (Frame 0048s)
        if (st.hasTalisman || st.isCalled) {
          const talW = spriteW * 0.32;
          const talH = talW * 2.0;
          ctx.save();
          ctx.translate(0, -spriteH * 0.22);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-talW * 0.5, 0, talW, talH);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(-talW * 0.5, 0, talW, talH);
          // Gold rune lines
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-talW * 0.15, talH * 0.2, talW * 0.3, talH * 0.6);
          ctx.restore();
        }

        // Student Name Pill Tag
        // If on the altar: large glowing dark brown pill with thick gold border (Frame 0048s)
        const isOnAltar = isChosenThisRound && summonTimer >= 4.5;
        const displayName = getShortDisplayName(st.name);
        const namePill = (st.isCalled && !isOnAltar ? '✓ ' : '') + displayName;

        ctx.font = isOnAltar
          ? "900 15px 'Be Vietnam Pro', system-ui, sans-serif"
          : "800 12.5px 'Be Vietnam Pro', system-ui, sans-serif";
        const textMetrics = ctx.measureText(namePill);
        const pillW = Math.max(isOnAltar ? 70 : 54, textMetrics.width + (isOnAltar ? 24 : 16));
        const pillH = isOnAltar ? 28 : 22;
        const pillY = spriteH * 0.5 + (isOnAltar ? 8 : 4);

        ctx.beginPath();
        ctx.roundRect(-pillW * 0.5, pillY, pillW, pillH, 999);
        ctx.fillStyle = isOnAltar
          ? '#78350f'
          : (st.isCalled ? '#475569' : st.tagColor);
        ctx.shadowColor = isOnAltar ? '#facc15' : 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = isOnAltar ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isOnAltar ? '#fde047' : (st.hasTalisman ? '#facc15' : '#ffffff');
        ctx.lineWidth = isOnAltar ? 3.0 : (st.hasTalisman ? 2.5 : 1.8);
        ctx.stroke();

        ctx.fillStyle = isOnAltar ? '#fef08a' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(namePill, 0, pillY + pillH * 0.5);

        ctx.restore();
      });

      // 7. ANIMATE FLYING RED TALISMAN (LINH PHÙ BAY PHONG ẤN)
      if (state === 'SUMMONING' && flyingTalisman.active) {
        if (summonTimer >= 1.0 && summonTimer <= 3.8) {
          const flightProgress = (summonTimer - 1.0) / 2.8; // 0 to 1
          const primaryTarget = currentSelectedStudents[0] || students[0];
          const pos = getTalismanPosition(flightProgress, primaryTarget);

          flyingTalisman.prevX = flyingTalisman.x;
          flyingTalisman.prevY = flyingTalisman.y;
          flyingTalisman.x = pos.x;
          flyingTalisman.y = pos.y;

          const dx = flyingTalisman.x - flyingTalisman.prevX;
          const dy = flyingTalisman.y - flyingTalisman.prevY;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            flyingTalisman.angle = Math.atan2(dy, dx) + Math.PI / 2;
          }

          // Spawn sparkling particles along flight path
          for (let p = 0; p < 3; p++) {
            talismanParticles.push({
              x: flyingTalisman.x + (Math.random() - 0.5) * 10,
              y: flyingTalisman.y + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 30 - dx * 0.2,
              vy: (Math.random() - 0.5) * 30 - dy * 0.2,
              r: 3 + Math.random() * 4,
              color: Math.random() < 0.6 ? '#fde047' : '#ef4444',
              alpha: 1,
              life: 0.4
            });
          }

          // Students react when talisman flies close
          students.forEach(st => {
            const dist = Math.hypot(st.baseX - flyingTalisman.x, st.baseY - flyingTalisman.y);
            if (dist < 80 && st.surpriseHop <= 0) {
              st.surpriseHop = 18;
            }
          });

          // Draw the Flying Red Talisman
          ctx.save();
          ctx.translate(flyingTalisman.x, flyingTalisman.y);
          ctx.rotate(flyingTalisman.angle);

          const talW = 34;
          const talH = 68;

          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 18;

          if (assets.redTalisman) {
            ctx.drawImage(assets.redTalisman, -talW * 0.5, -talH * 0.5, talW, talH);
          } else {
            ctx.fillStyle = '#dc2626';
            ctx.roundRect(-talW * 0.5, -talH * 0.5, talW, talH, 4);
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // Talisman Hits forehead at 3.8s
        if (summonTimer >= 3.8 && !hasSlapped) {
          hasSlapped = true;
          audio.danLinhPhu();

          currentSelectedStudents.forEach(st => {
            st.hasTalisman = true;
            // Spawn shockwave ring on forehead
            shockwaves.push({
              x: st.baseX,
              y: st.baseY - 45,
              r: 8,
              maxR: 70,
              alpha: 1
            });
          });
        }
      }

      // 8. Render Talisman Trail Particles
      for (let i = talismanParticles.length - 1; i >= 0; i--) {
        const tp = talismanParticles[i];
        tp.x += tp.vx * dt;
        tp.y += tp.vy * dt;
        tp.alpha -= dt * 2.5;

        if (tp.alpha <= 0) {
          talismanParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.r * tp.alpha, 0, Math.PI * 2);
        ctx.fillStyle = tp.color;
        ctx.globalAlpha = Math.max(0, tp.alpha);
        ctx.shadowColor = tp.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 9. Render Seal Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += dt * 140;
        sw.alpha -= dt * 2.0;

        if (sw.alpha <= 0 || sw.r >= sw.maxR) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${sw.alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 10. Transition from SUMMONING to REVEAL after ~6.2s
      if (state === 'SUMMONING' && summonTimer >= 6.2) {
        showEdictModal();
      }
    }

    animFrameId = requestAnimationFrame(renderLoop);

    // Cleanup logic
    function cleanup() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      audio.enabled = false;
      if (container && container.contains(canvas)) {
        container.innerHTML = '';
      }
    }

    // Expose control interface for CDP automation & debugging
    const gameInstance = {
      cleanup: cleanup,
      getState: () => state,
      getStudents: () => students,
      triggerSummon: triggerSummon,
      callNextRound: callNextRound,
      togglePause: togglePause,
      fastForward: () => {
        if (state === 'LOADING') {
          loadingProgress = 100;
          state = 'IDLE';
          btnSummonBar.style.display = 'block';
          btnPause.style.display = 'none';
          btnExit.textContent = 'Thoát';
        } else if (state === 'SUMMONING') {
          summonTimer = 6.3;
        }
      }
    };

    window.__currentCuongThiInstance = gameInstance;
    return cleanup;
  }

  // Global exports
  global.launchCuongThi = launchCuongThi;
  global.launchJiangshiGame = launchCuongThi; // Alias
})(window);
