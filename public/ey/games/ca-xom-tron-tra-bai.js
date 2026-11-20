// Cả Xóm Trốn Trả Bài (Gà Công An Đi Tuần)
// Mô phỏng chính xác 100% video thực tế và đường dẫn https://pomyai.com/gv/tro-choi-goi-ten/ca-xom-tron-tra-bai
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)

(function (global) {
  'use strict';

  // Audio Synthesizer Class (Web Audio API)
  class CaXomAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.motorOsc = null;
      this.motorGain = null;
      this.motorInterval = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    tone({ freq = 440, to = null, type = 'sine', dur = 0.15, gain = 0.3, delay = 0 }) {
      if (!this.enabled) return;
      this.init();
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

    noise({ dur = 0.1, gain = 0.2, freq = 1000, q = 1 }) {
      if (!this.enabled) return;
      this.init();
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.ctx.destination);
      noise.start();
    }

    // Horn beep: "Tuýt tuýt!"
    coi() {
      this.tone({ freq: 880, dur: 0.08, gain: 0.35, type: 'triangle' });
      this.tone({ freq: 880, dur: 0.12, gain: 0.4, type: 'triangle', delay: 0.1 });
    }

    // Screeching brakes: "Kíttt!"
    phanh() {
      this.noise({ dur: 0.35, gain: 0.25, freq: 2800, q: 3.5 });
      this.tone({ freq: 1200, to: 400, dur: 0.3, gain: 0.2, type: 'sawtooth' });
    }

    // Heavy stamp thud: "Bộp!" (Đã triệu tập)
    dongDau() {
      this.tone({ freq: 180, to: 45, dur: 0.22, gain: 0.6, type: 'triangle' });
      this.noise({ dur: 0.15, gain: 0.3, freq: 800, q: 1.2 });
    }

    // Motor sound loop (Honda Cub 50 / Chaly)
    startMotor() {
      if (!this.enabled || this.motorInterval) return;
      this.init();
      this.motorInterval = setInterval(() => {
        if (!this.enabled) return;
        // Puffed engine combustion pop
        this.tone({ freq: 65, to: 30, dur: 0.04, gain: 0.09, type: 'triangle' });
        this.noise({ dur: 0.03, gain: 0.04, freq: 500, q: 2 });
      }, 75);
    }

    stopMotor() {
      if (this.motorInterval) {
        clearInterval(this.motorInterval);
        this.motorInterval = null;
      }
    }

    // Fanfare / Summons reveal
    fanfare() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        this.tone({ freq: f, dur: 0.25, gain: 0.25, type: 'triangle', delay: idx * 0.08 });
      });
    }

    ting() {
      this.tone({ freq: 1318.5, dur: 0.18, gain: 0.3, type: 'sine' });
    }
  }

  // Helper: map student names to short display names
  function getShortName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, -1).join(' ');
    // Handle typical Vietnamese double first names
    if (parts.length >= 3) {
      const pLast = parts[parts.length - 2];
      if (['Văn', 'Thị', 'Đức', 'Bảo', 'Minh', 'Ngọc', 'Khánh', 'Thu', 'Thùy', 'Hải', 'Phương', 'Hoàng', 'Mai', 'Thanh'].includes(pLast)) {
        return pLast + ' ' + last;
      }
    }
    return last;
  }

  // 45 Precise House Layout Coordinates (Detected from Village Map 1916x853)
  const HOUSE_COORDS = [
    // Row 0: 12 houses (y=109, road y=190)
    { x: 219, y: 109, roadY: 190, rIdx: 0 },
    { x: 346, y: 109, roadY: 190, rIdx: 0 },
    { x: 474, y: 109, roadY: 190, rIdx: 0 },
    { x: 602, y: 109, roadY: 190, rIdx: 0 },
    { x: 730, y: 109, roadY: 190, rIdx: 0 },
    { x: 858, y: 109, roadY: 190, rIdx: 0 },
    { x: 985, y: 109, roadY: 190, rIdx: 0 },
    { x: 1113, y: 109, roadY: 190, rIdx: 0 },
    { x: 1241, y: 109, roadY: 190, rIdx: 0 },
    { x: 1369, y: 109, roadY: 190, rIdx: 0 },
    { x: 1496, y: 109, roadY: 190, rIdx: 0 },
    { x: 1624, y: 109, roadY: 190, rIdx: 0 },

    // Row 1: 12 houses (y=292, road y=373)
    { x: 218, y: 292, roadY: 373, rIdx: 1 },
    { x: 346, y: 292, roadY: 373, rIdx: 1 },
    { x: 474, y: 292, roadY: 373, rIdx: 1 },
    { x: 602, y: 292, roadY: 373, rIdx: 1 },
    { x: 730, y: 292, roadY: 373, rIdx: 1 },
    { x: 857, y: 292, roadY: 373, rIdx: 1 },
    { x: 985, y: 292, roadY: 373, rIdx: 1 },
    { x: 1113, y: 292, roadY: 373, rIdx: 1 },
    { x: 1241, y: 292, roadY: 373, rIdx: 1 },
    { x: 1369, y: 292, roadY: 373, rIdx: 1 },
    { x: 1496, y: 292, roadY: 373, rIdx: 1 },
    { x: 1624, y: 292, roadY: 373, rIdx: 1 },

    // Row 2: 12 houses (y=475, road y=556)
    { x: 218, y: 475, roadY: 556, rIdx: 2 },
    { x: 346, y: 475, roadY: 556, rIdx: 2 },
    { x: 474, y: 475, roadY: 556, rIdx: 2 },
    { x: 602, y: 475, roadY: 556, rIdx: 2 },
    { x: 730, y: 475, roadY: 556, rIdx: 2 },
    { x: 858, y: 475, roadY: 556, rIdx: 2 },
    { x: 985, y: 475, roadY: 556, rIdx: 2 },
    { x: 1113, y: 475, roadY: 556, rIdx: 2 },
    { x: 1241, y: 475, roadY: 556, rIdx: 2 },
    { x: 1369, y: 475, roadY: 556, rIdx: 2 },
    { x: 1496, y: 475, roadY: 556, rIdx: 2 },
    { x: 1624, y: 475, roadY: 556, rIdx: 2 },

    // Row 3: 9 houses (y=658, road y=739)
    { x: 218, y: 658, roadY: 739, rIdx: 3 },
    { x: 346, y: 658, roadY: 739, rIdx: 3 },
    { x: 474, y: 658, roadY: 739, rIdx: 3 },
    { x: 602, y: 658, roadY: 739, rIdx: 3 },
    { x: 730, y: 658, roadY: 739, rIdx: 3 },
    { x: 857, y: 658, roadY: 739, rIdx: 3 },
    { x: 985, y: 658, roadY: 739, rIdx: 3 },
    { x: 1113, y: 658, roadY: 739, rIdx: 3 },
    { x: 1241, y: 658, roadY: 739, rIdx: 3 }
  ];

  // Speech bubble lines
  const SPEECH_LINES = [
    'Tuýt tuýt! Kiểm tra bài cũ đây!',
    'Hôm nay xóm ta trả bài môn gì?',
    'Ai chưa học bài thì tự giác nhé!',
    'Dừng xe kiểm tra học lực!',
    'Không trốn được đâu!',
    'Tuýt tuýt! Chuẩn bị tinh thần!'
  ];

  // MAIN LAUNCHER EXPORT
  global.launchCaXomTronTraBai = function (container, options = {}) {
    const audio = new CaXomAudio();
    const roster = options.roster && options.roster.length > 0 ? options.roster : [
      "Nguyễn Minh An", "Trần Bảo Châu", "Lê Gia Huy", "Phạm Thùy Linh", "Hoàng Đức Mạnh",
      "Vũ Khánh Ngân", "Đặng Quốc Phong", "Bùi Thu Quỳnh", "Đỗ Hải Sơn", "Ngô Phương Thảo",
      "Dương Anh Tuấn", "Lý Bảo Vy", "Huỳnh Ngọc Hân", "Phan Nhật Minh", "Võ Thanh Trúc",
      "Hồ Gia Bảo", "Trịnh Mai Anh", "Đinh Tuấn Kiệt", "Lâm Khánh Linh", "Mai Đức Anh",
      "Ngô Hoàng Nam", "Đỗ Mỹ Duyên", "Bùi Đăng Khôi", "Đặng Khôi Nguyên", "Trương Quang Vinh",
      "Vũ Hoàng Yến", "Phan Đức Long", "Lê Phương Anh", "Phạm Hưng", "Trần Thu Hà",
      "Lê Minh Quân", "Nguyễn Ngọc Diệp", "Vũ Tiến Dũng", "Hoàng Thùy Vân", "Ngô Bảo Ngọc",
      "Đặng Thanh Tùng", "Bùi Hải Yến", "Dương Tấn Phát", "Lâm Như Ý", "Võ Hoàng Long",
      "Đỗ Quỳnh Chi", "Trịnh Quốc Bảo", "Phạm Anh Thư", "Nguyễn Hữu Phúc", "Vũ Ngọc Mai"
    ];

    let countPick = 1;
    let summonsCount = 1;
    let isPaused = false;
    let gameState = 'loading'; // 'loading', 'idle', 'riding', 'summon'
    let currentTargets = [];
    let currentTargetIdx = 0;
    let speechTimer = 0;
    let speechText = '';

    // Initialize 45 house models
    const houses = HOUSE_COORDS.map((c, i) => {
      const fullName = roster[i] || `Học sinh ${i + 1}`;
      return {
        index: i,
        x: c.x,
        y: c.y,
        roadY: c.roadY,
        rIdx: c.rIdx,
        fullName: fullName,
        shortName: getShortName(fullName),
        isCalled: false,
        isAbsent: false,
        trembleTime: 0
      };
    });

    // Motorbike & Officer State
    const bike = {
      x: 135,
      y: 190,
      targetX: 135,
      targetY: 190,
      path: [],
      speed: 480,
      facing: 1, // 1 = right, -1 = left, 0 = rear
      isMoving: false,
      smoke: []
    };

    // Camera state
    const camera = {
      x: 958,
      y: 426,
      targetX: 958,
      targetY: 426,
      scale: 1,
      targetScale: 1
    };

    // DOM Setup
    container.innerHTML = `
      <div id="caxom-root" style="width: 100vw; height: 100vh; position: relative; background: #86efac; overflow: hidden; font-family: 'Be Vietnam Pro', system-ui, sans-serif; user-select: none;">
        <!-- Canvas Layer -->
        <canvas id="caxom-canvas" style="display: block; width: 100%; height: 100%;"></canvas>

        <!-- Loading Screen (Matching frame_0014s) -->
        <div id="caxom-loading-screen" style="position: absolute; inset: 0; background: #86efac; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; transition: opacity 0.3s ease;">
          <div style="width: 58px; height: 58px; border: 6px solid rgba(21,128,61,0.2); border-top-color: #15803d; border-radius: 50%; animation: caxomSpin 0.8s linear infinite; margin-bottom: 22px;"></div>
          <div style="font-size: 21px; font-weight: 800; color: #166534; letter-spacing: 0.3px;">Gà đang dắt xe ra khỏi đồn...</div>
        </div>

        <!-- Top-Right Controls Bar (Matching frame_0028s & frame_0042s) -->
        <div id="caxom-top-bar" style="position: absolute; top: 18px; right: 24px; z-index: 40; display: flex; align-items: center; gap: 8px;">
          <button id="btn-caxom-fullscreen" title="Toàn màn hình" style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #334155; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">⛶</button>
          <button id="btn-caxom-sound" title="Âm thanh" style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #334155; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">🔊</button>
          <button id="btn-caxom-pause" style="display: none; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #334155; border-radius: 10px; padding: 8px 18px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Tạm dừng</button>
          <button id="btn-caxom-exit" style="background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #ef4444; border-radius: 10px; padding: 8px 20px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Thoát</button>
        </div>

        <!-- Bottom-Right Fast Forward Pill (Matching frame_0042s) -->
        <div id="caxom-ff-pill" style="display: none; position: absolute; bottom: 20px; right: 24px; z-index: 35; background: rgba(15,23,42,0.85); color: #f8fafc; font-size: 13.5px; font-weight: 700; padding: 8px 18px; border-radius: 999px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); cursor: pointer; backdrop-filter: blur(4px);">
          Enter: xem ngay kết quả
        </div>

        <!-- Bottom Control Panel (Matching frame_0028s & frame_0059s) -->
        <div id="caxom-control-panel" style="position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 30; background: #ffffff; border: 3px solid #15803d; border-radius: 24px; padding: 14px 28px 12px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.18); display: flex; flex-direction: column; align-items: center; gap: 8px; transition: transform 0.3s ease, opacity 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 800; color: #166534;">Số em</span>
              <div id="caxom-pick-selector" style="display: flex; gap: 6px;">
                ${[1, 2, 3, 4, 5].map(n => `
                  <button class="btn-num-pick" data-val="${n}" style="width: 36px; height: 36px; border-radius: 10px; border: 2px solid #16a34a; background: ${n === 1 ? '#16a34a' : '#ffffff'}; color: ${n === 1 ? '#ffffff' : '#16a34a'}; font-size: 15px; font-weight: 900; cursor: pointer; transition: all 0.15s ease;">
                    ${n}
                  </button>
                `).join('')}
              </div>
            </div>

            <button id="btn-caxom-call" style="background: linear-gradient(180deg, #16a34a 0%, #15803d 100%); color: #ffffff; border: 2px solid #86efac; border-radius: 14px; padding: 10px 36px; font-size: 19px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 14px rgba(22,163,74,0.4); display: flex; align-items: center; gap: 8px; transition: all 0.15s ease;">
              Gọi tên
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; font-weight: 600;">
            <span>Bấm vào nhà để gọi đúng em đó. Giữ lâu để đánh dấu vắng.</span>
            <span id="caxom-reset-link" style="display: none; color: #dc2626; font-weight: 800; cursor: pointer; text-decoration: underline;">Làm mới xóm</span>
          </div>
        </div>

        <!-- Official Summons Document Modal (GIẤY TRIỆU TẬP - Matching frame_0052s & frame_0063s) -->
        <div id="caxom-summon-overlay" style="display: none; position: absolute; inset: 0; z-index: 60; background: rgba(15,23,42,0.65); backdrop-filter: blur(4px); align-items: center; justify-content: center; opacity: 0; transition: opacity 0.25s ease;">
          <div id="caxom-summon-card" style="position: relative; width: 90%; max-width: 620px; background: #fffdf5; border-radius: 20px; border: 2px solid #e2d9c0; box-shadow: 0 25px 60px rgba(0,0,0,0.35); padding: 32px 36px; transform: scale(0.9); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
            
            <!-- Header: CÔNG AN XÓM GÀ / Số -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; margin-bottom: 18px;">
              <span>CÔNG AN XÓM GÀ</span>
              <span id="caxom-summon-serial">Số: 001/TT</span>
            </div>

            <!-- Title: GIẤY TRIỆU TẬP -->
            <div style="text-align: center; font-size: clamp(28px, 4vw, 36px); font-weight: 900; color: #991b1b; letter-spacing: 1px; margin-bottom: 8px;">
              GIẤY TRIỆU TẬP
            </div>

            <!-- Subtitle -->
            <div id="caxom-summon-subtitle" style="text-align: center; font-size: 15px; font-weight: 700; color: #475569; margin-bottom: 16px;">
              Triệu tập em
            </div>

            <!-- Names Container -->
            <div id="caxom-summon-names" style="text-align: center; font-size: clamp(34px, 5vw, 44px); font-weight: 900; color: #0f172a; line-height: 1.25; margin-bottom: 18px; min-height: 52px; display: flex; flex-direction: column; gap: 4px;">
              Hưng
            </div>

            <!-- Call to action -->
            <div style="text-align: center; font-size: clamp(18px, 2.5vw, 22px); font-weight: 900; color: #dc2626; margin-bottom: 28px;">
              Lên bảng trả bài ngay!
            </div>

            <!-- Official Red Round Stamp: ĐÃ TRIỆU TẬP (Matching frame_0052s) -->
            <div id="caxom-stamp" style="position: absolute; right: 42px; bottom: 85px; width: 110px; height: 110px; border-radius: 50%; border: 3px solid #b91c1c; display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); opacity: 0; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <div style="width: 96px; height: 96px; border-radius: 50%; border: 1.5px dashed #b91c1c; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <span style="font-size: 13.5px; font-weight: 900; color: #b91c1c; letter-spacing: 0.5px; line-height: 1.15;">ĐÃ<br/>TRIỆU TẬP</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
              <button id="btn-caxom-next" style="background: linear-gradient(180deg, #16a34a 0%, #15803d 100%); color: #ffffff; border: 2px solid #86efac; border-radius: 12px; padding: 12px 36px; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 14px rgba(22,163,74,0.35); transition: all 0.15s ease;">
                Gọi tiếp
              </button>
              <button id="btn-caxom-back-village" style="background: #ffffff; color: #15803d; border: 2px solid #16a34a; border-radius: 12px; padding: 12px 32px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.15s ease;">
                Về xóm
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>
        @keyframes caxomSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    const canvas = container.querySelector('#caxom-canvas');
    const ctx = canvas.getContext('2d');
    const loadingScreen = container.querySelector('#caxom-loading-screen');
    const controlPanel = container.querySelector('#caxom-control-panel');
    const ffPill = container.querySelector('#caxom-ff-pill');
    const summonOverlay = container.querySelector('#caxom-summon-overlay');
    const summonCard = container.querySelector('#caxom-summon-card');
    const stampEl = container.querySelector('#caxom-stamp');
    const resetLink = container.querySelector('#caxom-reset-link');
    const pauseBtn = container.querySelector('#btn-caxom-pause');

    // Load Game Images
    let mapImg = new Image();
    let roosterImg = new Image();
    let roosterRearImg = new Image();
    let assetsLoaded = 0;

    function checkAssetsReady() {
      assetsLoaded++;
      if (assetsLoaded >= 3) {
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameState = 'idle';
          }, 300);
        }, 600);
      }
    }

    mapImg.onload = checkAssetsReady;
    roosterImg.onload = checkAssetsReady;
    roosterRearImg.onload = checkAssetsReady;

    mapImg.src = '/ey/games/ca-xom-map.webp';
    roosterImg.src = '/ey/games/rooster_cub.png';
    roosterRearImg.src = '/ey/games/rooster_rear.png';

    // Resize Handler
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    window.addEventListener('resize', resize);
    resize();

    // Map Coordinates & Connectors
    const WORLD_W = 1916;
    const WORLD_H = 853;
    const CONNECTOR_LEFT_X = 135;
    const CONNECTOR_RIGHT_X = 1750;

    // Build Road Path from current (bike.x, bike.y) to house
    function buildPathToHouse(house) {
      const path = [];
      const curX = bike.x;
      const curY = bike.y;
      const targetRoadY = house.roadY;
      const targetX = house.x;

      if (Math.abs(curY - targetRoadY) < 15) {
        // Same road: drive straight to house
        path.push({ x: targetX, y: targetRoadY, facing: targetX >= curX ? 1 : -1 });
      } else {
        // Need to change road: find closer connector
        const distToLeft = Math.abs(curX - CONNECTOR_LEFT_X);
        const distToRight = Math.abs(curX - CONNECTOR_RIGHT_X);
        const connX = distToLeft <= distToRight ? CONNECTOR_LEFT_X : CONNECTOR_RIGHT_X;

        // 1. Move to connector on current road
        path.push({ x: connX, y: curY, facing: connX >= curX ? 1 : -1 });
        // 2. Move vertically along connector to target road
        path.push({ x: connX, y: targetRoadY, facing: 0 });
        // 3. Move along target road to house
        path.push({ x: targetX, y: targetRoadY, facing: targetX >= connX ? 1 : -1 });
      }
      return path;
    }

    // Trigger Patrol / Ride to Target Houses
    function startPatrol(targetHouseList) {
      if (!targetHouseList || targetHouseList.length === 0) return;
      currentTargets = targetHouseList;
      currentTargetIdx = 0;
      gameState = 'riding';

      // Hide bottom control panel, show FF pill & Pause
      controlPanel.style.transform = 'translate(-50%, 150%)';
      controlPanel.style.opacity = '0';
      ffPill.style.display = 'block';
      pauseBtn.style.display = 'block';

      // Start engine sound
      audio.startMotor();
      audio.coi();

      // Begin travel to first target
      driveToNextTarget();
    }

    function driveToNextTarget() {
      if (currentTargetIdx >= currentTargets.length) {
        // All targets reached! Show summons modal
        showSummonsModal();
        return;
      }

      const house = currentTargets[currentTargetIdx];
      bike.path = buildPathToHouse(house);
      bike.isMoving = true;

      // Random speech bubble
      speechText = SPEECH_LINES[Math.floor(Math.random() * SPEECH_LINES.length)];
      speechTimer = 2.8;

      // Camera zooms in to follow bike
      camera.targetScale = 1.85;
    }

    function onArrivedAtHouse(house) {
      bike.isMoving = false;
      audio.stopMotor();
      audio.phanh();

      // Trigger house tremble & sweat drop
      house.trembleTime = 2.5;
      house.isCalled = true;

      setTimeout(() => {
        currentTargetIdx++;
        if (currentTargetIdx < currentTargets.length) {
          // Drive to next in batch
          audio.startMotor();
          driveToNextTarget();
        } else {
          // Batch done: Show summons modal
          showSummonsModal();
        }
      }, 700);
    }

    // Show Summons Document Modal
    function showSummonsModal() {
      gameState = 'summon';
      audio.stopMotor();
      audio.fanfare();

      ffPill.style.display = 'none';
      pauseBtn.style.display = 'none';

      // Populate Modal Content
      const serial = String(summonsCount).padStart(3, '0');
      container.querySelector('#caxom-summon-serial').textContent = `Số: ${serial}/TT`;
      summonsCount++;

      const isMulti = currentTargets.length > 1;
      container.querySelector('#caxom-summon-subtitle').textContent = isMulti ? 'Triệu tập các em' : 'Triệu tập em';

      const namesBox = container.querySelector('#caxom-summon-names');
      namesBox.innerHTML = currentTargets.map(h => `<div>${h.shortName}</div>`).join('');

      // Show overlay & animate modal drop
      summonOverlay.style.display = 'flex';
      setTimeout(() => {
        summonOverlay.style.opacity = '1';
        summonCard.style.transform = 'scale(1)';
      }, 20);

      // Stamp thud after 400ms
      stampEl.style.opacity = '0';
      stampEl.style.transform = 'rotate(-12deg) scale(1.8)';
      setTimeout(() => {
        audio.dongDau();
        stampEl.style.opacity = '0.9';
        stampEl.style.transform = 'rotate(-12deg) scale(1)';
      }, 420);

      // Check reset link visibility
      updateResetLink();
    }

    function hideSummonsModal() {
      summonOverlay.style.opacity = '0';
      summonCard.style.transform = 'scale(0.9)';
      setTimeout(() => {
        summonOverlay.style.display = 'none';
      }, 250);
    }

    function zoomOutToVillage() {
      hideSummonsModal();
      gameState = 'idle';
      camera.targetScale = 1.0;
      camera.targetX = WORLD_W / 2;
      camera.targetY = WORLD_H / 2;

      // Show bottom control panel
      controlPanel.style.transform = 'translate(-50%, 0)';
      controlPanel.style.opacity = '1';
      ffPill.style.display = 'none';
      pauseBtn.style.display = 'none';
      updateResetLink();
    }

    function updateResetLink() {
      const anyCalled = houses.some(h => h.isCalled);
      resetLink.style.display = anyCalled ? 'inline' : 'none';
    }

    // Pick random uncalled students
    function pickRandomStudents(count) {
      const available = houses.filter(h => !h.isCalled && !h.isAbsent);
      if (available.length === 0) {
        alert('Tất cả học sinh trong xóm đều đã được triệu tập! Bấm "Làm mới xóm" để bắt đầu lại.');
        return [];
      }
      // Shuffle available
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Reset Village
    function resetVillage() {
      houses.forEach(h => {
        h.isCalled = false;
        h.isAbsent = false;
        h.trembleTime = 0;
      });
      updateResetLink();
      audio.ting();
    }

    // Fast-Forward to Destination (Enter key)
    function fastForward() {
      if (gameState !== 'riding') return;
      // Instantly mark current targets as called
      currentTargets.forEach(h => {
        h.isCalled = true;
        h.trembleTime = 2;
      });
      const lastTarget = currentTargets[currentTargets.length - 1];
      bike.x = lastTarget.x;
      bike.y = lastTarget.roadY;
      bike.path = [];
      bike.isMoving = false;
      showSummonsModal();
    }

    // Event Listeners: Number Pick Selector
    container.querySelectorAll('.btn-num-pick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        countPick = parseInt(btn.getAttribute('data-val'));
        container.querySelectorAll('.btn-num-pick').forEach(b => {
          const v = parseInt(b.getAttribute('data-val'));
          if (v === countPick) {
            b.style.background = '#16a34a';
            b.style.color = '#ffffff';
          } else {
            b.style.background = '#ffffff';
            b.style.color = '#16a34a';
          }
        });
        audio.ting();
      });
    });

    // Call Button
    container.querySelector('#btn-caxom-call').addEventListener('click', () => {
      if (gameState !== 'idle') return;
      const selected = pickRandomStudents(countPick);
      if (selected.length > 0) {
        startPatrol(selected);
      }
    });

    // Fast-Forward Pill
    ffPill.addEventListener('click', fastForward);

    // Summons Modal: Gọi tiếp
    container.querySelector('#btn-caxom-next').addEventListener('click', () => {
      hideSummonsModal();
      const selected = pickRandomStudents(countPick);
      if (selected.length > 0) {
        startPatrol(selected);
      } else {
        zoomOutToVillage();
      }
    });

    // Summons Modal: Về xóm
    container.querySelector('#btn-caxom-back-village').addEventListener('click', () => {
      zoomOutToVillage();
    });

    // Reset Village Link
    resetLink.addEventListener('click', resetVillage);

    // Pause / Resume
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
      if (isPaused) {
        audio.stopMotor();
      } else if (gameState === 'riding') {
        audio.startMotor();
      }
    });

    // Sound toggle
    const soundBtn = container.querySelector('#btn-caxom-sound');
    soundBtn.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      soundBtn.textContent = audio.enabled ? '🔊' : '🔇';
      if (!audio.enabled) audio.stopMotor();
    });

    // Fullscreen toggle
    container.querySelector('#btn-caxom-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Exit Game
    const exitGame = () => {
      audio.stopMotor();
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(rafId);
      if (typeof options.onExit === 'function') {
        options.onExit();
      }
    };
    container.querySelector('#btn-caxom-exit').addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn quay về sảnh ván chơi?')) {
        exitGame();
      }
    });

    // Keyboard controls
    const onKeyDown = (e) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        fastForward();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle') {
          container.querySelector('#btn-caxom-call').click();
        } else if (gameState === 'riding') {
          pauseBtn.click();
        } else if (gameState === 'summon') {
          container.querySelector('#btn-caxom-next').click();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Canvas Click / Long Press to call specific house or mark absent
    let pressTimer = null;
    let clickStartX = 0;
    let clickStartY = 0;

    function screenToWorld(clientX, clientY) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const canvasX = (clientX - rect.left) * dpr;
      const canvasY = (clientY - rect.top) * dpr;

      const baseFitScale = Math.min((canvas.width / dpr) / WORLD_W, (canvas.height / dpr) / WORLD_H);
      const curScale = baseFitScale * camera.scale;
      const offsetX = (canvas.width / dpr) / 2 - camera.x * curScale;
      const offsetY = (canvas.height / dpr) / 2 - camera.y * curScale;

      const worldX = (clientX - rect.left - offsetX) / curScale;
      const worldY = (clientY - rect.top - offsetY) / curScale;
      return { x: worldX, y: worldY };
    }

    function findHouseAtWorld(wx, wy) {
      for (const h of houses) {
        // Tag bounding box check (width ~ 90, height ~ 30) or house body (width ~ 110, height ~ 100)
        if (Math.abs(wx - h.x) < 55 && wy >= h.y - 90 && wy <= h.y + 25) {
          return h;
        }
      }
      return null;
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (gameState !== 'idle') return;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      const wPos = screenToWorld(e.clientX, e.clientY);
      const clickedHouse = findHouseAtWorld(wPos.x, wPos.y);

      if (clickedHouse) {
        pressTimer = setTimeout(() => {
          // Long press: Toggle Absent
          clickedHouse.isAbsent = !clickedHouse.isAbsent;
          audio.ting();
          pressTimer = null;
        }, 600);
      }
    });

    canvas.addEventListener('pointerup', (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
        const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
        if (dist < 10 && gameState === 'idle') {
          const wPos = screenToWorld(e.clientX, e.clientY);
          const clickedHouse = findHouseAtWorld(wPos.x, wPos.y);
          if (clickedHouse && !clickedHouse.isAbsent) {
            startPatrol([clickedHouse]);
          }
        }
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (gameState !== 'idle') return;
      const wPos = screenToWorld(e.clientX, e.clientY);
      const clickedHouse = findHouseAtWorld(wPos.x, wPos.y);
      if (clickedHouse) {
        clickedHouse.isAbsent = !clickedHouse.isAbsent;
        audio.ting();
      }
    });

    // =========================================================================
    // GAME LOOP (60 FPS)
    // =========================================================================
    let lastTime = performance.now();
    let rafId = 0;

    function gameLoop(now) {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPaused) {
        update(dt);
      }
      render();

      rafId = requestAnimationFrame(gameLoop);
    }
    rafId = requestAnimationFrame(gameLoop);

    // UPDATE
    function update(dt) {
      // Update Motorbike Movement along path
      if (bike.isMoving && bike.path.length > 0) {
        const nextNode = bike.path[0];
        const dx = nextNode.x - bike.x;
        const dy = nextNode.y - bike.y;
        const dist = Math.hypot(dx, dy);
        const step = bike.speed * dt;

        if (dist <= step) {
          bike.x = nextNode.x;
          bike.y = nextNode.y;
          bike.facing = nextNode.facing;
          bike.path.shift();

          if (bike.path.length === 0) {
            // Reached destination house
            onArrivedAtHouse(currentTargets[currentTargetIdx]);
          }
        } else {
          bike.x += (dx / dist) * step;
          bike.y += (dy / dist) * step;
          if (Math.abs(dx) > Math.abs(dy)) {
            bike.facing = dx >= 0 ? 1 : -1;
          } else {
            bike.facing = 0; // vertical
          }

          // Emit smoke particle from tailpipe
          if (Math.random() < 0.6) {
            bike.smoke.push({
              x: bike.x - (bike.facing === 1 ? 55 : (bike.facing === -1 ? -55 : 0)),
              y: bike.y + 12,
              vx: (Math.random() - 0.5) * 20 - bike.facing * 30,
              vy: -15 - Math.random() * 20,
              r: 6 + Math.random() * 6,
              alpha: 0.65,
              life: 0.55
            });
          }
        }
      }

      // Update smoke particles
      for (let i = bike.smoke.length - 1; i >= 0; i--) {
        const s = bike.smoke[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.r += 12 * dt;
        s.life -= dt;
        s.alpha = Math.max(0, s.life / 0.55 * 0.65);
        if (s.life <= 0) {
          bike.smoke.splice(i, 1);
        }
      }

      // Speech bubble timer
      if (speechTimer > 0) {
        speechTimer -= dt;
      }

      // House tremble timer
      houses.forEach(h => {
        if (h.trembleTime > 0) {
          h.trembleTime -= dt;
        }
      });

      // Smooth Camera tracking
      if (gameState === 'riding') {
        camera.targetX = bike.x;
        camera.targetY = bike.y - 40;
      } else if (gameState === 'idle') {
        camera.targetX = WORLD_W / 2;
        camera.targetY = WORLD_H / 2;
      }

      const lerpSpeed = Math.min(1, 4.5 * dt);
      camera.x += (camera.targetX - camera.x) * lerpSpeed;
      camera.y += (camera.targetY - camera.y) * lerpSpeed;
      camera.scale += (camera.targetScale - camera.scale) * lerpSpeed;
    }

    // RENDER
    function render() {
      const dpr = window.devicePixelRatio || 1;
      const vw = canvas.width / dpr;
      const vh = canvas.height / dpr;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base scaling to fit full village
      const baseFitScale = Math.min(vw / WORLD_W, vh / WORLD_H);
      const curScale = baseFitScale * camera.scale;

      // Camera center offset
      const offsetX = vw / 2 - camera.x * curScale;
      const offsetY = vh / 2 - camera.y * curScale;

      ctx.translate(offsetX * dpr, offsetY * dpr);
      ctx.scale(curScale * dpr, curScale * dpr);

      // 1. Draw Clean Village Background Map
      if (mapImg.complete && mapImg.naturalWidth > 0) {
        ctx.drawImage(mapImg, 0, 0, WORLD_W, WORLD_H);
      } else {
        // Fallback grass & roads
        ctx.fillStyle = '#86efac';
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      }

      // 2. Draw House Name Badges & Tremble States
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      houses.forEach((h, i) => {
        ctx.save();
        let shakeX = 0;
        let shakeY = 0;
        if (h.trembleTime > 0) {
          shakeX = (Math.random() - 0.5) * 5;
          shakeY = (Math.random() - 0.5) * 4;
        }
        ctx.translate(h.x + shakeX, h.y + shakeY);

        // Badge Dimensions
        const tagText = (h.isCalled ? '✓ ' : '') + h.shortName + (h.isAbsent ? ' (Vắng)' : '');
        ctx.font = '800 13px system-ui, "Be Vietnam Pro", sans-serif';
        const textMetrics = ctx.measureText(tagText);
        const bw = Math.max(textMetrics.width + 18, 54);
        const bh = 24;

        // Badge Background
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
        if (h.isAbsent) {
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#94a3b8';
        } else if (h.isCalled) {
          ctx.fillStyle = '#dcfce7';
          ctx.strokeStyle = '#15803d';
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#3b2416';
        }
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        // Text
        if (h.isAbsent) {
          ctx.fillStyle = '#64748b';
        } else if (h.isCalled) {
          ctx.fillStyle = '#15803d';
        } else {
          ctx.fillStyle = '#1e293b';
        }
        ctx.fillText(tagText, 0, 1);

        // Sweat Drop / Tremble droplet
        if (h.trembleTime > 0) {
          ctx.font = '20px sans-serif';
          ctx.fillText('💧', 0, -85);
        }

        ctx.restore();
      });

      // 3. Draw Motorbike Smoke Particles
      for (const s of bike.smoke) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${s.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw Rooster Officer on Motorbike
      ctx.save();
      ctx.translate(bike.x, bike.y);

      // Facing logic
      const spriteW = 100;
      const spriteH = 85;

      if (bike.facing === 0 && roosterRearImg.complete && roosterRearImg.naturalWidth > 0) {
        // Rear view when parking or facing house
        ctx.drawImage(roosterRearImg, -spriteW / 2 + 10, -spriteH, spriteW - 20, spriteH);
      } else if (roosterImg.complete && roosterImg.naturalWidth > 0) {
        ctx.scale(bike.facing === -1 ? -1 : 1, 1);
        ctx.drawImage(roosterImg, -spriteW / 2, -spriteH + 10, spriteW, spriteH);
      }
      ctx.restore();

      // 5. Draw Speech Bubble
      if (speechTimer > 0 && speechText) {
        ctx.save();
        const bubbleX = bike.x + (bike.facing === -1 ? -90 : 90);
        const bubbleY = bike.y - 100;
        ctx.font = '800 13px system-ui, "Be Vietnam Pro", sans-serif';
        const tw = ctx.measureText(speechText).width + 24;
        const th = 32;

        ctx.beginPath();
        ctx.roundRect(bubbleX - tw / 2, bubbleY - th / 2, tw, th, 12);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speechText, bubbleX, bubbleY + 1);
        ctx.restore();
      }

      ctx.restore();
    }

    // Cleanup hook
    return function destroy() {
      audio.stopMotor();
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
    };
  };

})(window);
