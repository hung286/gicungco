// Chạy Trốn Thầy Cô (Nhanh Chân Vào Lớp) - Official Fullscreen Engine for EY Portal / MHEdu
// Author: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)

(function() {
  const ASSET_BASE = '/ey/games/boss-chase';
  
  const DEFAULT_ROSTER = [
    "Nguyễn Minh An", "Trần Bảo Châu", "Lê Gia Huy", "Phạm Thùy Linh", "Hoàng Đức Mạnh",
    "Vũ Khánh Ngân", "Đặng Quốc Phong", "Bùi Thu Quỳnh", "Đỗ Hải Sơn", "Ngô Phương Thảo",
    "Dương Anh Tuấn", "Lý Bảo Vy", "Huỳnh Ngọc Hân", "Phan Nhật Minh", "Võ Thanh Trúc",
    "Hồ Gia Bảo", "Trịnh Mai Anh", "Đinh Tuấn Kiệt", "Lâm Khánh Linh", "Mai Đức Anh",
    "Tạ Hoài Nam", "Cao Thị Mỹ Duyên", "Chu Minh Khôi", "Lương Thảo Nguyên", "Tạ Quang Vinh",
    "Nguyễn Hoàng Yến", "Trần Đức Long", "Lê Phương Anh", "Phạm Gia Hưng", "Hoàng Thu Hà",
    "Vũ Minh Quân", "Đặng Ngọc Diệp", "Bùi Tiến Dũng", "Đỗ Khánh Vân", "Ngô Bảo Ngọc",
    "Dương Thanh Tùng", "Lý Hải Yến", "Huỳnh Tấn Phát", "Phan Như Ý", "Võ Hoàng Long",
    "Hồ Thị Kim Chi", "Trịnh Quốc Bảo", "Nguyễn Trần Minh Thư", "Lê Hoàng Phúc", "Phạm Ngọc Mai"
  ];

  const BADGE_COLORS = [
    "#2563eb", "#db2777", "#059669", "#d97706", "#7c3aed",
    "#0891b2", "#e11d48", "#4f46e5", "#16a34a", "#ea580c"
  ];

  const SHOUTS = [
    "😱 Á cứu em!", "🏃 Chạy mau!!", "💦 Đừng gọi em!",
    "💓 Hồi hộp quá!", "🙏 Tha em với!", "⚡ Chuồn lẹ!!"
  ];

  function tenGoiCua(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return parts[parts.length - 1] || fullName;
  }

  // Perspective geometry calculation
  function b(w, h, bgImg) {
    let r = bgImg && bgImg.naturalWidth > 0 ? bgImg.naturalWidth : 1024;
    let i = bgImg && bgImg.naturalHeight > 0 ? bgImg.naturalHeight : 559;
    let o = Math.max(w / r, h / i);
    let s = r * o;
    let l = i * o;
    let n = (w - s) / 2;
    let d = (h - l) / 2;
    let minY = Math.max(0.545 * h, d + 0.585 * l);
    let maxY = Math.min(h - 68, d + 0.915 * l);
    return {
      bgX: n,
      bgY: d,
      bgW: s,
      bgH: l,
      doorX: n + 0.4985 * s,
      doorY: d + 0.485 * l,
      minY: minY,
      maxY: maxY,
      boundsAtY: function(y) {
        let a = Math.max(0, Math.min(1, (y - minY) / Math.max(1, maxY - minY)));
        return {
          leftX: Math.max(88, n + s * (0.295 - 0.115 * a)),
          rightX: Math.min(w - 88, n + s * (0.705 + 0.115 * a))
        };
      }
    };
  }

  // Procedural Web Audio Engine + Music Player
  class BossChaseAudio {
    constructor() {
      this.ctx = null;
      this.noiseBuf = null;
      this.lastDoorTime = 0;
      this.lastStepTime = 0;
      this.enabled = true;
      this.bgMusic = null;
      this.currentMusicSrc = null;
    }

    getCtx() {
      if (!this.enabled) return null;
      try {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return null;
          this.ctx = new AudioContextClass();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      } catch (e) {
        return null;
      }
    }

    getNoiseBuffer(ctx) {
      if (!this.noiseBuf) {
        const len = Math.floor(0.8 * ctx.sampleRate);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = 2 * Math.random() - 1;
        }
        this.noiseBuf = buf;
      }
      return this.noiseBuf;
    }

    playTone(opts) {
      const ctx = this.getCtx();
      if (!ctx) return;
      const t = ctx.currentTime + (opts.delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = opts.type || 'sine';
      osc.frequency.setValueAtTime(Math.max(10, opts.freq), t);
      if (opts.to !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, opts.to), t + opts.dur);
      }
      const attack = opts.attack || 0.008;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain), t + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + opts.dur + 0.02);
    }

    playNoise(opts) {
      const ctx = this.getCtx();
      if (!ctx) return;
      const t = ctx.currentTime + (opts.delay || 0);
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = opts.type || 'bandpass';
      filter.frequency.setValueAtTime(opts.freq, t);
      if (opts.to !== undefined) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(30, opts.to), t + opts.dur);
      }
      filter.Q.value = opts.q || 1.4;
      const gain = ctx.createGain();
      const attack = opts.attack || 0.005;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain), t + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t, 0.25 * Math.random());
      src.stop(t + opts.dur + 0.02);
    }

    chuongKhaiCuoc() {
      if (!this.enabled) return;
      for (let i = 0; i < 6; i++) {
        const d = 0.055 * i;
        this.playTone({ freq: 1760, dur: 0.045, gain: 0.16, type: "triangle", delay: d });
        this.playTone({ freq: 2637, dur: 0.04, gain: 0.1, type: "sine", delay: d + 0.01 });
      }
      this.playTone({ freq: 2450, to: 2680, dur: 0.14, gain: 0.18, type: "sine", delay: 0.36 });
      this.playNoise({ dur: 0.12, freq: 3200, q: 4, gain: 0.07, type: "bandpass", delay: 0.36 });
      this.playTone({ freq: 2520, to: 2780, dur: 0.38, gain: 0.22, type: "sine", delay: 0.54 });
      this.playNoise({ dur: 0.35, freq: 3400, q: 4, gain: 0.08, type: "bandpass", delay: 0.54 });
    }

    buocChan(isBoss = false) {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      if (now - this.lastStepTime < (isBoss ? 0.11 : 0.14)) return;
      this.lastStepTime = now;
      if (isBoss) {
        this.playTone({ freq: 125, to: 52, dur: 0.065, gain: 0.14, type: "sine" });
        this.playNoise({ dur: 0.045, freq: 950, q: 1.8, gain: 0.07, type: "bandpass" });
      } else {
        this.playTone({ freq: 210 + 40 * Math.random(), to: 95, dur: 0.04, gain: 0.055, type: "triangle" });
        this.playNoise({ dur: 0.03, freq: 1800, q: 2, gain: 0.04, type: "bandpass" });
      }
    }

    nhayVaoCua() {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      if (now - this.lastDoorTime < 0.09) return;
      this.lastDoorTime = now;
      this.playTone({ freq: 520, to: 980, dur: 0.11, gain: 0.11, type: "sine" });
      this.playTone({ freq: 1046.5, dur: 0.14, gain: 0.13, type: "triangle", delay: 0.06 });
      this.playTone({ freq: 1568, dur: 0.22, gain: 0.12, type: "sine", delay: 0.12 });
    }

    khoaMucTieu() {
      if (!this.enabled) return;
      this.playTone({ freq: 987.77, dur: 0.07, gain: 0.18, type: "square", delay: 0 });
      this.playTone({ freq: 987.77, dur: 0.07, gain: 0.18, type: "square", delay: 0.09 });
      this.playTone({ freq: 1318.5, to: 1480, dur: 0.16, gain: 0.22, type: "sawtooth", delay: 0.18 });
      this.playTone({ freq: 146.8, to: 98, dur: 0.28, gain: 0.2, type: "sawtooth", delay: 0.18 });
    }

    lachThoat() {
      if (!this.enabled) return;
      this.playNoise({ dur: 0.22, freq: 600, to: 3400, q: 1.5, gain: 0.2, type: "bandpass", attack: 0.03 });
      this.playTone({ freq: 587.3, to: 1174.7, dur: 0.15, gain: 0.2, type: "sine", delay: 0.04 });
      this.playTone({ freq: 1318.5, to: 1760, dur: 0.22, gain: 0.18, type: "triangle", delay: 0.18 });
    }

    truotVoChuoi() {
      if (!this.enabled) return;
      this.playTone({ freq: 280, to: 1650, dur: 0.24, gain: 0.26, type: "sine" });
      this.playTone({ freq: 1650, to: 420, dur: 0.16, gain: 0.22, type: "triangle", delay: 0.22 });
      this.playTone({ freq: 220, to: 680, dur: 0.18, gain: 0.24, type: "sawtooth", delay: 0.12 });
      this.playTone({ freq: 680, to: 310, dur: 0.22, gain: 0.18, type: "sine", delay: 0.28 });
    }

    soNayDat() {
      if (!this.enabled) return;
      this.playTone({ freq: 240, to: 110, dur: 0.09, gain: 0.16, type: "triangle" });
      this.playNoise({ dur: 0.06, freq: 1400, q: 1.8, gain: 0.1, type: "bandpass" });
    }

    ngaBupChoang() {
      if (!this.enabled) return;
      this.playTone({ freq: 135, to: 36, dur: 0.34, gain: 0.42, type: "sine" });
      this.playNoise({ dur: 0.25, freq: 520, to: 120, q: 1, gain: 0.3, type: "lowpass" });
      [784, 988, 1175, 988, 880, 1047, 1319, 1047].forEach((f, idx) => {
        this.playTone({ freq: f, to: 1.06 * f, dur: 0.13, gain: 0.13, type: "triangle", delay: 0.22 + 0.11 * idx });
      });
    }

    dungDayGianDu() {
      if (!this.enabled) return;
      this.playNoise({ dur: 0.28, freq: 450, to: 2600, q: 1.4, gain: 0.18, type: "bandpass", attack: 0.05 });
      this.playTone({ freq: 165, to: 330, dur: 0.3, gain: 0.22, type: "sawtooth" });
      this.playTone({ freq: 440, to: 659.25, dur: 0.22, gain: 0.18, type: "triangle", delay: 0.18 });
    }

    timDap(intensity = 0.5) {
      if (!this.enabled) return;
      const g = 0.22 + 0.18 * Math.max(0, Math.min(1, intensity));
      this.playTone({ freq: 68, to: 40, dur: 0.13, gain: g, type: "sine", delay: 0 });
      this.playTone({ freq: 58, to: 34, dur: 0.16, gain: 0.78 * g, type: "sine", delay: 0.16 });
    }

    tocBienHoangKim() {
      if (!this.enabled) return;
      this.playNoise({ dur: 0.14, freq: 4200, to: 1600, q: 2.2, gain: 0.32, type: "highpass" });
      this.playTone({ freq: 1800, to: 280, dur: 0.18, gain: 0.28, type: "sawtooth" });
      this.playTone({ freq: 120, to: 28, dur: 0.65, gain: 0.45, type: "sine", delay: 0.06 });
      this.playNoise({ dur: 0.55, freq: 850, to: 90, q: 0.9, gain: 0.36, type: "lowpass", delay: 0.06 });
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
        this.playTone({ freq: f, dur: 0.45, gain: 0.16, type: "triangle", delay: 0.24 + 0.07 * idx });
      });
    }

    moSoDauBai() {
      if (!this.enabled) return;
      this.playNoise({ dur: 0.14, freq: 2400, to: 1200, q: 1.8, gain: 0.18, type: "bandpass" });
      [
        { f: 523.25, d: 0.1, l: 0.14 },
        { f: 659.25, d: 0.22, l: 0.14 },
        { f: 783.99, d: 0.34, l: 0.14 },
        { f: 1046.5, d: 0.48, l: 0.42 }
      ].forEach(e => {
        this.playTone({ freq: e.f, dur: e.l, gain: 0.22, type: "triangle", delay: e.d });
        this.playTone({ freq: 0.5 * e.f, dur: e.l, gain: 0.14, type: "sawtooth", delay: e.d });
      });
    }

    playMusic(url, volume = 0.36) {
      if (!this.enabled) {
        this.stopMusic();
        return;
      }
      if (this.currentMusicSrc === url && this.bgMusic) {
        this.bgMusic.volume = volume;
        return;
      }
      this.stopMusic();
      try {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = volume;
        audio.play().catch(() => {});
        this.bgMusic = audio;
        this.currentMusicSrc = url;
      } catch (e) {}
    }

    stopMusic() {
      if (this.bgMusic) {
        try {
          this.bgMusic.pause();
          this.bgMusic.currentTime = 0;
        } catch (e) {}
        this.bgMusic = null;
      }
      this.currentMusicSrc = null;
    }
  }

  // MAIN GAME LAUNCHER (100% Full Viewport)
  window.launchChayTronThayCo = function(container, options = {}) {
    const rawRoster = (options.roster && options.roster.length >= 2) ? options.roster : DEFAULT_ROSTER;
    const roster = rawRoster.map(s => (typeof s === 'string' ? s : s.name || s.ten || '')).filter(Boolean);
    const teacherGender = options.teacherGender === 'female' ? 'female' : 'male';
    const schoolName = (options.schoolName || 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG').trim().toUpperCase();
    const teacherName = options.teacherName || (teacherGender === 'male' ? 'Thầy Hùng' : 'Cô Giáo');

    container.innerHTML = '';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.overflow = 'hidden';
    container.style.userSelect = 'none';
    container.style.background = '#1e293b';
    container.style.zIndex = '999999';

    const audio = new BossChaseAudio();
    audio.enabled = options.soundEnabled !== false;

    // Asset Loading
    const images = {
      bg: new Image(),
      tMaleSheet: new Image(),
      tFemaleSheet: new Image(),
      tMaleStumble: new Image(),
      tMaleFallen: new Image(),
      tFemaleStumble: new Image(),
      tFemaleFallen: new Image(),
      bookProp: new Image(),
      tMaleStatic: new Image(),
      tFemaleStatic: new Image(),
      sSheets: [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()],
      sStatics: [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()]
    };

    images.bg.src = `${ASSET_BASE}/clean_bg_city.webp`;
    images.tMaleSheet.src = `${ASSET_BASE}/sheet_t_male.webp`;
    images.tFemaleSheet.src = `${ASSET_BASE}/sheet_t_female.webp`;
    images.tMaleStumble.src = `${ASSET_BASE}/clean_t_male_stumble.webp`;
    images.tMaleFallen.src = `${ASSET_BASE}/clean_t_male_fallen.webp`;
    images.tFemaleStumble.src = `${ASSET_BASE}/clean_t_female_stumble.webp`;
    images.tFemaleFallen.src = `${ASSET_BASE}/clean_t_female_fallen.webp`;
    images.bookProp.src = `${ASSET_BASE}/clean_book.webp`;
    images.tMaleStatic.src = `${ASSET_BASE}/clean_teacher_male.webp`;
    images.tFemaleStatic.src = `${ASSET_BASE}/clean_teacher_female.webp`;

    for (let i = 0; i < 6; i++) {
      images.sSheets[i].src = `${ASSET_BASE}/sheet_s${i + 1}.webp`;
    }
    images.sStatics[0].src = `${ASSET_BASE}/clean_boy.webp`;
    images.sStatics[1].src = `${ASSET_BASE}/clean_girl.webp`;
    images.sStatics[2].src = `${ASSET_BASE}/clean_s3.webp`;
    images.sStatics[3].src = `${ASSET_BASE}/clean_s4.webp`;
    images.sStatics[4].src = `${ASSET_BASE}/clean_s5.webp`;
    images.sStatics[5].src = `${ASSET_BASE}/clean_s6.webp`;

    // DOM Hierarchy - Canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position: absolute; inset: 0; width: 100vw; height: 100vh; display: block; z-index: 1;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Top-Left Header: Back Button & School Badge
    const topLeftBar = document.createElement('div');
    topLeftBar.style.cssText = 'position: absolute; top: 16px; left: 18px; display: flex; align-items: center; gap: 10px; z-index: 30;';
    topLeftBar.innerHTML = `
      <button id="btn-back-lobby" style="background: rgba(255,255,255,0.95); border: 1.5px solid #0d9488; color: #0d9488; border-radius: 10px; padding: 7px 16px; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: all 0.15s ease;">
        ← Về Sảnh
      </button>
    `;
    container.appendChild(topLeftBar);

    // Top-Right Floating Controls (Matching Images 4 & 5)
    const topRightBar = document.createElement('div');
    topRightBar.style.cssText = 'position: absolute; top: 16px; right: 18px; display: flex; align-items: center; gap: 8px; z-index: 30;';
    topRightBar.innerHTML = `
      <button id="btn-fullscreen-toggle" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.92); border: 1px solid #cbd5e1; color: #1e293b; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" title="Toàn màn hình">
        ⛶
      </button>
      <button id="btn-sound-toggle" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.92); border: 1px solid #cbd5e1; color: #1e293b; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" title="Bật/Tắt âm thanh">
        🔊
      </button>
      <button id="btn-pause-toggle" style="display: none; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #0f172a; border-radius: 10px; padding: 7px 16px; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        Tạm dừng
      </button>
      <button id="btn-end-race" style="display: none; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; color: #ef4444; border-radius: 10px; padding: 7px 16px; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        Kết thúc
      </button>
    `;
    container.appendChild(topRightBar);

    // Live Event Notification Banner (center top)
    const bannerBox = document.createElement('div');
    bannerBox.style.cssText = 'position: absolute; top: 16px; left: 50%; transform: translateX(-50%); max-width: min(580px, 50vw); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(15, 23, 42, 0.88); border: 2px solid #facc15; border-radius: 999px; padding: 7px 22px; font-weight: 800; font-size: 13.5px; color: #fef08a; z-index: 25; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.5); pointer-events: none; transition: all 0.2s ease;';
    bannerBox.textContent = '🔔 CẢ LỚP ĐANG TẬP TRUNG TRÊN SÂN TRƯỜNG — BẤM BẮT ĐẦU ĐỂ CHẠY TRỐN!';
    container.appendChild(bannerBox);

    // Start Button Overlay (bottom center - exactly matching Image 4)
    const startOverlay = document.createElement('div');
    startOverlay.style.cssText = 'position: absolute; bottom: 28px; left: 0; right: 0; display: flex; justify-content: center; z-index: 25; pointer-events: auto;';
    startOverlay.innerHTML = `
      <button id="btn-start-race" style="background: linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); color: #fff; font-size: 21px; font-weight: 900; padding: 13px 48px; border-radius: 16px; border: 3px solid #fde047; box-shadow: 0 6px 0 #7f1d1d, 0 14px 32px rgba(0,0,0,0.65); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.15s ease;">
        <span style="font-size: 22px; color: #fde047;">▶</span>
        <span>Bắt đầu</span>
      </button>
    `;
    container.appendChild(startOverlay);

    // Reveal Modal (Sổ Đầu Bài)
    const revealModal = document.createElement('div');
    revealModal.style.cssText = 'display: none; position: absolute; inset: 0; z-index: 40; background: rgba(15, 23, 42, 0.82); backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 20px;';
    container.appendChild(revealModal);

    // Simulation State
    let roundNumber = 1;
    let isRoundActive = false;
    let isPaused = false;
    let animFrameId = null;
    let roundTimers = [];
    let calledHistory = [];

    const state = {
      kids: [],
      boss: {
        x: 280,
        y: 460,
        vx: 2.5,
        vy: 0,
        flip: 1,
        animPhase: 0,
        lastFoot: -1,
        targetIdx: 0,
        state: 'chase',
        tripAge: 0,
        skidVx: 0,
        tripDir: 1,
        timer: 0,
        surgeBoost: 1,
        climaxMode: false,
        afterimage: null,
        banner: '🔔 CẢ LỚP ĐANG TẬP TRUNG TRÊN SÂN TRƯỜNG — BẤM BẮT ĐẦU ĐỂ CHẠY TRỐN!'
      },
      chosenIdx: 0,
      shake: 0,
      tick: 0,
      trap: { active: false, airborne: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0 },
      flyingBook: { active: false, x: 0, y: 0, groundY: 0, vx: 0, vy: 0, rot: 0, returning: false },
      droppedShoe: { active: false, airborne: false, x: 0, y: 0, groundY: 0, vx: 0, vy: 0, rot: 0, ownerIdx: -1, ownerShortName: '', pickedUp: false, revealOwner: false },
      doorFlashes: [],
      particles: [],
      bolts: [],
      floatingTexts: []
    };

    function clearTimers() {
      roundTimers.forEach(t => clearTimeout(t));
      roundTimers = [];
    }

    function spawnParticles(x, y, color, count = 18) {
      for (let i = 0; i < count; i++) {
        let angle = 2 * Math.PI * i / count + 0.35 * Math.random();
        let speed = 2 + 4.8 * Math.random();
        state.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          r: 3 + 3.5 * Math.random(),
          color: color,
          life: 1
        });
      }
    }

    function spawnFootDust(x, y, flip, isBoss = false) {
      if (state.particles.length > 120) return;
      let count = isBoss ? 4 : 1;
      for (let s = 0; s < count; s++) {
        state.particles.push({
          x: x - flip * (isBoss ? 16 : 10) + (Math.random() - 0.5) * (isBoss ? 18 : 7),
          y: y + 26 + (Math.random() - 0.5) * 6,
          vx: -flip * (0.8 + Math.random() * (isBoss ? 2.4 : 0.9)),
          vy: -0.4 - Math.random() * (isBoss ? 1.4 : 0.5),
          r: (isBoss ? 6 : 3.5) + 3.5 * Math.random(),
          color: isBoss ? "rgba(255, 255, 255, 0.82)" : "rgba(226, 232, 240, 0.65)",
          life: 1
        });
      }
    }

    function spawnFloatingText(x, y, text, color = '#facc15') {
      state.floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1
      });
    }

    // Initialize students and boss on courtyard
    function initPositions(rosterPool) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const geom = b(w, h, images.bg);

      const pool = rosterPool.length > 0 ? rosterPool : roster;
      const s = pool.length;
      const cols = Math.max(4, Math.min(9, Math.ceil(Math.sqrt(1.6 * s))));
      const rows = Math.max(1, Math.ceil(s / cols));
      const minY = geom.minY + 14;
      const maxY = Math.max(minY + 36, geom.maxY - 22);

      state.kids = pool.map((item, idx) => {
        const name = typeof item === 'string' ? item : (item.name || '');
        const gender = (typeof item === 'object' && item.gender) ? item.gender : ((options.gioiTinh && options.gioiTinh[name]) || ((name.includes('Thị') || name.includes('Ngân') || name.includes('Linh') || name.includes('Quỳnh') || name.includes('Hà') || name.includes('Vy') || name.includes('Trúc') || name.includes('Chi') || name.includes('Mai')) ? 'nu' : 'nam'));
        
        // Model idx: 0, 2, 4 for male; 1, 3, 5 for female
        const modelIdx = gender === 'nu' ? (1 + (idx % 3) * 2) : (0 + (idx % 3) * 2);
        const color = BADGE_COLORS[idx % BADGE_COLORS.length];
        const r = Math.floor(idx / cols);
        const countInRow = (r === rows - 1) ? s - r * cols : cols;
        const rowY = rows > 1 ? minY + (r / (rows - 1)) * (maxY - minY) : (minY + maxY) / 2;
        const bounds = geom.boundsAtY(rowY);
        const minX = bounds.leftX + 62;
        const maxX = Math.max(minX + 80, bounds.rightX - 18);
        const stagger = (rows > 1 && r % 2 === 1) ? ((maxX - minX) / Math.max(2, cols)) * 0.16 : 0;
        const posX = Math.min(maxX, minX + ((countInRow > 1 ? (idx % cols) / (countInRow - 1) : 0.5) * (maxX - minX)) + stagger);

        return {
          id: idx,
          name: name,
          shortName: tenGoiCua(name),
          gender: gender,
          modelIdx: modelIdx,
          badgeColor: color,
          x: posX,
          y: rowY,
          vx: (Math.random() - 0.5) * 2.8,
          vy: (Math.random() - 0.5) * 2,
          angle: Math.random() * Math.PI * 2,
          flip: 1,
          animPhase: (1.7 * idx) % 12,
          lastFoot: -1,
          escapingToDoor: false,
          enteringDoor: false,
          doorProgress: 0,
          doorStartX: 0,
          doorStartY: 0,
          escaped: false,
          caught: false,
          returningForShoe: false,
          speechText: '',
          speechTimer: 0,
          speedBoost: 1
        };
      });

      const boss = state.boss;
      boss.y = (minY + maxY) * 0.55;
      const bBounds = geom.boundsAtY(boss.y);
      boss.x = bBounds.leftX + 4;
      boss.flip = 1;
      boss.state = 'chase';
      boss.targetIdx = 0;
      boss.surgeBoost = 1;
      boss.climaxMode = false;
      boss.afterimage = null;
      state.trap.active = false;
      state.flyingBook.active = false;
      state.droppedShoe.active = false;
    }

    // Trigger banana peel incident
    function triggerIncident() {
      const dpr = window.devicePixelRatio || 1;
      const geom = b(canvas.width / dpr, canvas.height / dpr, images.bg);
      const boss = state.boss;
      boss.y = Math.max(geom.minY + 28, Math.min(geom.maxY - 24, boss.y));
      const bBounds = geom.boundsAtY(boss.y);
      const mid = (bBounds.leftX + bBounds.rightX) * 0.5;
      const dir = boss.x > mid + 30 ? -1 : 1;

      boss.tripDir = dir;
      boss.flip = dir;
      boss.state = 'trip';
      boss.tripAge = 0;
      boss.skidVx = 4.4 * dir;
      boss.surgeBoost = 1;

      state.trap = {
        active: true,
        airborne: false,
        x: Math.max(bBounds.leftX + 20, Math.min(bBounds.rightX - 20, boss.x + 42 * dir)),
        y: boss.y + 28,
        vx: 0,
        vy: 0,
        rot: 0
      };
      state.flyingBook.active = false;

      const title = teacherGender === 'male' ? 'THẦY GIÁO' : 'CÔ GIÁO';
      state.boss.banner = `🍌 BẤT NGỜ CHƯA! CÓ VỎ CHUỐI RƠI NGAY TRƯỚC CHÂN ${title}!`;
      bannerBox.textContent = state.boss.banner;
      audio.truotVoChuoi();
    }

    // Final catch: Teleport & Sổ Đầu Bài reveal
    function executeCatch() {
      const dpr = window.devicePixelRatio || 1;
      const geom = b(canvas.width / dpr, canvas.height / dpr, images.bg);
      const boss = state.boss;

      state.trap.active = false;
      state.flyingBook.active = false;
      state.droppedShoe.active = false;

      state.kids.forEach((k, idx) => {
        if (idx !== state.chosenIdx) {
          k.escaped = true;
          k.escapingToDoor = false;
          k.enteringDoor = false;
          k.returningForShoe = false;
        }
      });

      const targetKid = state.kids[state.chosenIdx];
      if (!targetKid) return;

      targetKid.escaped = false;
      targetKid.escapingToDoor = false;
      targetKid.enteringDoor = false;
      targetKid.returningForShoe = false;
      targetKid.caught = true;
      targetKid.speechText = '😱 Thôi xong em rồi!!';
      targetKid.speechTimer = 95;
      targetKid.y = Math.max(geom.minY + 34, Math.min(geom.maxY - 24, targetKid.y));
      const kBounds = geom.boundsAtY(targetKid.y);
      targetKid.x = Math.max(kBounds.leftX + 86, Math.min(kBounds.rightX - 42, targetKid.x));

      boss.afterimage = {
        x: boss.x,
        y: boss.y,
        flip: boss.flip,
        frame: Math.floor(boss.animPhase) % 12,
        life: 1
      };
      spawnParticles(boss.x, boss.y - 24, '#fde047', 24);
      state.bolts.push({
        x1: boss.x,
        y1: boss.y - 30,
        x2: targetKid.x - 66,
        y2: targetKid.y - 30,
        life: 1
      });

      boss.x = targetKid.x - 68;
      boss.y = targetKid.y + 2;
      boss.flip = 1;
      targetKid.flip = -1;
      state.shake = 18;

      spawnParticles(boss.x, boss.y - 24, '#facc15', 32);
      spawnFloatingText(boss.x + 28, boss.y - 118, '⚡ TỐC BIẾN + SỔ ĐẦU BÀI!', '#fde047');
      boss.state = 'flash';
      boss.timer = 95;
      boss.banner = `⚡ TỐC BIẾN HOÀNG KIM! TÓM GỌN ${targetKid.shortName.toUpperCase()} TRÊN SÂN TRƯỜNG!`;
      bannerBox.textContent = boss.banner;

      audio.stopMusic();
      audio.tocBienHoangKim();

      roundTimers.push(setTimeout(() => {
        isRoundActive = false;
        document.getElementById('btn-pause-toggle').style.display = 'none';
        document.getElementById('btn-end-race').style.display = 'none';
        audio.moSoDauBai();
        if (!calledHistory.includes(targetKid.name)) {
          calledHistory.push(targetKid.name);
        }
        showRevealModal(targetKid);
      }, 1600));
    }

    // Start a new race round
    function startRound(rNum) {
      clearTimers();
      const available = roster.filter(n => !calledHistory.includes(n));
      const currentPool = available.length >= 1 ? available : [...roster];
      initPositions(currentPool);

      roundNumber = rNum;
      state.chosenIdx = Math.floor(Math.random() * state.kids.length);
      isRoundActive = true;
      state.boss.surgeBoost = 1;
      state.boss.climaxMode = false;
      startOverlay.style.display = 'none';
      revealModal.style.display = 'none';

      document.getElementById('btn-pause-toggle').style.display = 'block';
      document.getElementById('btn-end-race').style.display = 'block';

      const tTitle = teacherGender === 'male' ? 'THẦY GIÁO' : 'CÔ GIÁO';
      state.boss.banner = `🔔 LƯỢT ${roundNumber} BẮT ĐẦU! ${state.kids.length} HỌC SINH ĐANG TÌM ĐƯỜNG VÀO CỬA LỚP AN TOÀN!`;
      bannerBox.textContent = state.boss.banner;

      audio.chuongKhaiCuoc();
      audio.playMusic(`${ASSET_BASE}/am/nhac-ruot-duoi.wav`, 0.36);

      // Student escape sequence
      const unchosen = state.kids.map((_, i) => i).filter(i => i !== state.chosenIdx);
      for (let i = unchosen.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [unchosen[i], unchosen[j]] = [unchosen[j], unchosen[i]];
      }

      const earlyRunner1 = unchosen.length >= 1 ? unchosen[0] : -1;
      const earlyRunner2 = unchosen.length >= 2 ? unchosen[1] : -1;
      const earlyRunner3 = unchosen.length >= 3 ? unchosen[2] : -1;
      const others = unchosen.slice(earlyRunner3 !== -1 ? 3 : earlyRunner2 !== -1 ? 2 : (earlyRunner1 !== -1 ? 1 : 0));

      others.forEach((kidIdx, idx) => {
        const delay = Math.max(1500, Math.round(1800 + (others.length > 1 ? idx / (others.length - 1) : 0.3) * 11600 + (Math.random() - 0.5) * 450));
        roundTimers.push(setTimeout(() => {
          const k = state.kids[kidIdx];
          if (k && !k.escaped && !k.enteringDoor) {
            k.escapingToDoor = true;
          }
        }, delay));
      });

      // Target lock at 4000ms
      const firstTarget = earlyRunner3 !== -1 ? earlyRunner3 : (earlyRunner2 !== -1 ? earlyRunner2 : state.chosenIdx);
      roundTimers.push(setTimeout(() => {
        const k = state.kids[firstTarget];
        if (k && !k.escaped) {
          state.boss.targetIdx = firstTarget;
          state.boss.surgeBoost = 1.36;
          k.speechText = '😱 Á! Đuổi sát quá!!';
          k.speechTimer = 140;
          audio.khoaMucTieu();
          spawnFloatingText(k.x, k.y - 98, '⚠️ BỊ KHÓA MỤC TIÊU!', '#f87171');
          state.boss.banner = `⚡ NGUY HIỂM! ${tTitle} ĐANG TĂNG TỐC ÁP SÁT ${k.shortName.toUpperCase()} — LIỆU CÓ THOÁT KỊP?!`;
          bannerBox.textContent = state.boss.banner;
        }
      }, 4000));

      // Escape at 6800ms
      if (earlyRunner3 !== -1) {
        roundTimers.push(setTimeout(() => {
          const k = state.kids[earlyRunner3];
          if (k && !k.escaped) {
            k.escapingToDoor = true;
            k.speedBoost = 1.35;
            k.speechText = '😅 Hú hồn! Chuồn lẹ!';
            k.speechTimer = 90;
            state.boss.surgeBoost = 1;
            audio.lachThoat();
            spawnFloatingText(k.x, k.y - 95, '💨 LÁCH QUA TRONG GANG TẤC!', '#34d399');
            state.boss.banner = `😅 HÚ HỒN! ${k.shortName.toUpperCase()} VỪA LÁCH QUA TAY ${tTitle} ĐỂ LAO VÀO CỬA LỚP!`;
            bannerBox.textContent = state.boss.banner;
          }
        }, 6800));
      }

      // Incident (Banana Trip) at 8600ms
      roundTimers.push(setTimeout(() => {
        triggerIncident();
      }, 8600));

      // Climax Mode at 13600ms
      roundTimers.push(setTimeout(() => {
        state.kids.forEach((k, idx) => {
          if (idx !== state.chosenIdx && idx !== earlyRunner1 && idx !== earlyRunner2 && !k.escaped && !k.enteringDoor) {
            k.escapingToDoor = true;
          }
        });
        state.boss.climaxMode = true;
        state.boss.surgeBoost = 1.18;
        const target = earlyRunner2 !== -1 ? earlyRunner2 : (earlyRunner1 !== -1 ? earlyRunner1 : state.chosenIdx);
        state.boss.targetIdx = target;
        const k = state.kids[target];
        if (k) {
          k.speechText = '💦 Đừng gọi tên em!!';
          k.speechTimer = 110;
        }
        audio.playMusic(`${ASSET_BASE}/am/nhac-cao-trao.wav`, 0.42);
        audio.khoaMucTieu();
        state.boss.banner = '🔥 GAY CẤN: CHỈ CÒN NHỮNG HỌC SINH CUỐI CÙNG TRÊN SÂN — AI SẼ BỊ GHI SỔ ĐẦU BÀI?!';
        bannerBox.textContent = state.boss.banner;
      }, 13600));

      // Target chosen student at 15000ms
      roundTimers.push(setTimeout(() => {
        state.boss.targetIdx = state.chosenIdx;
        const k = state.kids[state.chosenIdx];
        if (k) {
          k.speechText = '💓 Tim đập thình thịch!';
          k.speechTimer = 100;
        }
        audio.khoaMucTieu();
      }, 15000));

      // Runner 2 slips away at 16300ms
      if (earlyRunner2 !== -1) {
        roundTimers.push(setTimeout(() => {
          const k = state.kids[earlyRunner2];
          if (k && !k.escaped) {
            k.escapingToDoor = true;
            k.speedBoost = 1.4;
            k.speechText = '🏃‍♂️ Em vào lớp trước đây!';
            k.speechTimer = 90;
            audio.lachThoat();
            spawnFloatingText(k.x, k.y - 96, '✨ THOÁT HIỂM NGOẠN MỤC!', '#6ee7b7');
          }
        }, 16300));
      }

      // Final dramatic back and forth
      if (earlyRunner1 !== -1) {
        [
          { ms: 16900, idx: earlyRunner1, cry: '😱 Sao lại đuổi em?!' },
          { ms: 17850, idx: state.chosenIdx, cry: '😰 Á cứu em với!!' },
          { ms: 18750, idx: earlyRunner1, cry: '💦 Sắp bị tóm rồi!!' },
          { ms: 19450, idx: state.chosenIdx, cry: '⚡ Phải bứt tốc thôi!' }
        ].forEach(step => {
          roundTimers.push(setTimeout(() => {
            state.boss.targetIdx = step.idx;
            state.boss.surgeBoost = 1.28;
            const k = state.kids[step.idx];
            if (k && !k.escaped) {
              k.speechText = step.cry;
              k.speechTimer = 80;
              spawnFloatingText(k.x, k.y - 96, `🎯 Đang nhắm ${k.shortName}!`, '#fde047');
            }
          }, step.ms));
        });

        // Runner 1 escapes right at 20100ms
        roundTimers.push(setTimeout(() => {
          const k = state.kids[earlyRunner1];
          if (k && !k.escaped) {
            k.escapingToDoor = true;
            k.speedBoost = 1.48;
            k.speechText = '🎉 Cửa kìa! Thoát rồi!!';
            k.speechTimer = 85;
            audio.lachThoat();
            spawnFloatingText(k.x, k.y - 96, '🚪 VÀO CỬA AN TOÀN!', '#34d399');
          }
        }, 20100));
      }

      // Final catch trigger at 20900ms
      roundTimers.push(setTimeout(() => {
        executeCatch();
      }, 20900));
    }

    // Show winner reveal modal (Sổ Đầu Bài)
    function showRevealModal(kid) {
      revealModal.style.display = 'flex';
      const teacherImg = teacherGender === 'male' ? `${ASSET_BASE}/clean_teacher_male.webp` : `${ASSET_BASE}/clean_teacher_female.webp`;
      const kidImg = `${ASSET_BASE}/clean_${kid.modelIdx === 0 ? 'boy' : kid.modelIdx === 1 ? 'girl' : 's' + (kid.modelIdx + 1)}.webp`;

      revealModal.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 820px; animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <!-- Top Floating Pill -->
          <div style="position: relative; z-index: 20; margin-bottom: -22px; display: flex; justify-content: center;">
            <div style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(180deg, #dc2626 0%, #991b1b 50%, #450a0a 100%); border: 3px solid #fde047; border-radius: 999px; padding: 8px 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 24px rgba(251,191,36,0.45);">
              <img src="${ASSET_BASE}/clean_book.webp" style="width: 30px; height: 30px; object-contain: contain; filter: drop-shadow(0 2px 6px rgba(251,191,36,0.8));">
              <span style="font-size: 17px; font-weight: 900; letter-spacing: 2px; color: #fef08a; text-transform: uppercase;">Sổ Đầu Bài Đã Gọi Tên!</span>
            </div>
          </div>

          <!-- Open Notebook Book Frame -->
          <div style="background: linear-gradient(145deg, #dc2626 0%, #991b1b 50%, #450a0a 100%); border: 4px solid #fbbf24; border-radius: 32px; padding: 18px; box-shadow: 0 32px 70px rgba(0,0,0,0.82), 0 0 45px rgba(245,158,11,0.28);">
            <div style="position: relative; display: grid; grid-template-columns: repeat(12, 1fr); border-radius: 22px; overflow: hidden; background: #fffdf9; border: 3px solid rgba(217,119,6,0.8); min-height: 380px;">
              <!-- Spiral ring dividers in center -->
              <div style="display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; position: absolute; top: 0; bottom: 0; left: 41.666%; transform: translateX(-50%); width: 32px; z-index: 20; pointer-events: none; background: linear-gradient(90deg, rgba(180,83,9,0.18) 0%, rgba(251,191,36,0.35) 50%, rgba(180,83,9,0.18) 100%);">
                <span style="width: 24px; height: 10px; border-radius: 999px; border: 1px solid rgba(120,53,15,0.6); background: linear-gradient(180deg, #fef08a, #f59e0b);"></span>
                <span style="width: 24px; height: 10px; border-radius: 999px; border: 1px solid rgba(120,53,15,0.6); background: linear-gradient(180deg, #fef08a, #f59e0b);"></span>
                <span style="width: 24px; height: 10px; border-radius: 999px; border: 1px solid rgba(120,53,15,0.6); background: linear-gradient(180deg, #fef08a, #f59e0b);"></span>
                <span style="width: 24px; height: 10px; border-radius: 999px; border: 1px solid rgba(120,53,15,0.6); background: linear-gradient(180deg, #fef08a, #f59e0b);"></span>
                <span style="width: 24px; height: 10px; border-radius: 999px; border: 1px solid rgba(120,53,15,0.6); background: linear-gradient(180deg, #fef08a, #f59e0b);"></span>
              </div>

              <!-- Left Column: Teacher Portrait -->
              <div style="grid-column: span 5; padding: 24px; background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%); border-right: 2px solid rgba(251,191,36,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <div style="position: relative;">
                  <img src="${teacherImg}" style="height: 210px; object-fit: contain; filter: drop-shadow(0 14px 20px rgba(120,53,15,0.32));">
                  <div style="width: 120px; height: 16px; background: rgba(120,53,15,0.2); border-radius: 50%; filter: blur(3px); margin: -8px auto 0;"></div>
                </div>
                <div style="margin-top: 14px; background: linear-gradient(90deg, #b45309, #991b1b); color: #fff; padding: 5px 18px; border-radius: 999px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #fde047;">
                  ${teacherGender === 'female' ? 'Cô Giáo' : (teacherName || 'Thầy Hùng')}
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #78350f; margin-top: 4px;">
                  ${schoolName}
                </div>
              </div>

              <!-- Right Column: Chosen Student -->
              <div style="grid-column: span 7; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative;">
                <div style="display: inline-block; background: linear-gradient(90deg, #fef08a, #fde047); border: 2px solid #f59e0b; padding: 4px 18px; border-radius: 999px; font-size: 13px; font-weight: 900; color: #78350f; text-transform: uppercase; letter-spacing: 1.5px;">
                  ⭐ Lượt ${roundNumber} ⭐
                </div>
                <div style="margin-top: 14px; position: relative;">
                  <img src="${kidImg}" style="height: 180px; object-fit: contain; filter: drop-shadow(0 14px 18px rgba(15,23,42,0.28));">
                  <div style="width: 110px; height: 14px; background: rgba(217,119,6,0.25); border-radius: 50%; filter: blur(3px); margin: -8px auto 0;"></div>
                </div>
                <div style="margin-top: 12px; font-size: 36px; font-weight: 900; color: #991b1b; text-shadow: 0 3px 0 #fde047, 0 6px 14px rgba(153,27,27,0.2); line-height: 1.1;">
                  ${kid.name}
                </div>
                <div style="margin-top: 12px; display: inline-block; transform: rotate(-3deg); border: 4px solid #e11d48; color: #e11d48; padding: 4px 20px; border-radius: 14px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; background: #fff1f2; box-shadow: 0 6px 0 rgba(225,29,72,0.22);">
                  ⭐ MỜI LÊN BẢNG! ⭐
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Next Round Button -->
          <div style="margin-top: 24px; display: flex; justify-content: center;">
            <button id="btn-next-turn" style="background: linear-gradient(180deg, #fde047 0%, #facc15 50%, #eab308 100%); color: #020617; font-size: 18px; font-weight: 900; padding: 14px 38px; border-radius: 18px; border: 3px solid #fef08a; box-shadow: 0 6px 0 #a16207, 0 12px 28px rgba(0,0,0,0.5); cursor: pointer; transition: all 0.15s ease;">
              ▶ Gọi Lượt Tiếp Theo (Phím cách)
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-next-turn').onclick = function() {
        startRound(roundNumber + 1);
      };
    }

    // Helper functions for character rendering on canvas
    function drawSprite(sheet, frameIdx, targetH, offsetY) {
      if (!sheet || !sheet.complete || sheet.naturalWidth === 0) return;
      const frameW = sheet.naturalWidth / 13;
      const frameH = sheet.naturalHeight;
      const drawW = (frameW / frameH) * targetH;
      ctx.drawImage(sheet, frameIdx * frameW, 0, frameW, frameH, -drawW / 2, -targetH + offsetY, drawW, targetH);
    }

    function drawStatic(img, targetH, offsetY) {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const drawW = (img.naturalWidth / img.naturalHeight) * targetH;
      ctx.drawImage(img, -drawW / 2, -targetH + offsetY, drawW, targetH);
    }

    // Canvas Resize Handler
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!isRoundActive) {
        initPositions(roster);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    // RENDER LOOP
    function renderLoop() {
      if (!isPaused) {
        state.tick++;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();

      // Screen shake
      if (state.shake > 0.4) {
        ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
        state.shake *= 0.86;
      }

      const geom = b(w, h, images.bg);

      // Draw Courtyard Background
      if (images.bg && images.bg.complete && images.bg.naturalWidth > 0) {
        ctx.drawImage(images.bg, geom.bgX, geom.bgY, geom.bgW, geom.bgH);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);
      }

      // Safe Door Radial Glow
      const glow = ctx.createRadialGradient(geom.doorX, geom.doorY, 4, geom.doorX, geom.doorY, 54 + 7 * Math.sin(0.12 * state.tick));
      glow.addColorStop(0, "rgba(16, 185, 129, 0.7)");
      glow.addColorStop(0.55, "rgba(52, 211, 153, 0.28)");
      glow.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(geom.doorX, geom.doorY, 60, 0, 2 * Math.PI);
      ctx.fill();

      // Door Flash Rings
      for (let i = state.doorFlashes.length - 1; i >= 0; i--) {
        const fl = state.doorFlashes[i];
        ctx.save();
        const grad = ctx.createLinearGradient(geom.doorX, geom.doorY - 62, geom.doorX, geom.doorY + 20);
        grad.addColorStop(0, "rgba(52, 211, 153, 0)");
        grad.addColorStop(0.5, `rgba(110, 231, 183, ${0.55 * fl.life})`);
        grad.addColorStop(1, `rgba(16, 185, 129, ${0.85 * fl.life})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(geom.doorX - 26 * fl.life, geom.doorY - 56, 52 * fl.life, 72, 12);
        ctx.fill();
        ctx.strokeStyle = `rgba(167, 243, 208, ${0.9 * fl.life})`;
        ctx.lineWidth = 2.5 * fl.life;
        ctx.beginPath();
        ctx.ellipse(geom.doorX, geom.doorY + 8, fl.r, 0.42 * fl.r, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        if (!isPaused) {
          fl.r += 2.2;
          fl.life -= 0.06;
        }
        if (fl.life <= 0) state.doorFlashes.splice(i, 1);
      }

      // Safe Door Sign "CỬA LỚP AN TOÀN"
      const doorX = geom.bgX + 0.4563 * geom.bgW;
      const doorY = geom.bgY + 0.4115 * geom.bgH;
      const doorW = geom.bgW * (0.5406 - 0.4563);
      const doorH = geom.bgH * (0.4412 - 0.4115);

      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.38)";
      ctx.fillRect(doorX, doorY + doorH, doorW, 2.5);
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(doorX, doorY, doorW, doorH, 2);
      ctx.fill();
      ctx.stroke();

      const pad = Math.max(2, 0.1 * doorH);
      const innerX = doorX + pad;
      const innerY = doorY + pad;
      const innerW = Math.max(10, doorW - 2 * pad);
      const innerH = Math.max(8, doorH - 2 * pad);
      const dGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
      dGrad.addColorStop(0, "#064e3b");
      dGrad.addColorStop(0.5, "#047857");
      dGrad.addColorStop(1, "#022c22");
      ctx.fillStyle = dGrad;
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, innerW, innerH, 1.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
      ctx.fillRect(innerX + 1, innerY + 1, innerW - 2, 0.44 * innerH);

      const signText = "CỬA LỚP AN TOÀN";
      let fontSize = Math.max(7.5, Math.min(13, 0.56 * innerH));
      ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
      let textW = ctx.measureText(signText).width;
      if (textW > innerW - 8) {
        fontSize = ((innerW - 8) / Math.max(1, textW)) * fontSize;
        ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
      }
      ctx.fillStyle = "#ecfdf5";
      ctx.shadowColor = "rgba(52, 211, 153, 0.85)";
      ctx.shadowBlur = 4;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(signText, doorX + doorW / 2, doorY + doorH / 2 + 0.5);

      // School Name Sign Above Door on Courtyard Wall (Requirement 4)
      const schoolSignY = doorY - 24;
      ctx.save();
      ctx.font = "900 12.5px system-ui, sans-serif";
      const sW = ctx.measureText(schoolName).width + 24;
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.beginPath();
      ctx.roundRect(geom.doorX - sW / 2, schoolSignY - 10, sW, 20, 999);
      ctx.fill();
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(schoolName, geom.doorX, schoolSignY);
      ctx.restore();

      ctx.restore();

      // Update student physics & states
      if (isRoundActive && !isPaused) {
        state.kids.forEach((k, idx) => {
          if (k.escaped) return;
          if (k.speechTimer > 0) {
            k.speechTimer--;
            if (k.speechTimer <= 0) k.speechText = '';
          }

          // Diving into safe door
          if (k.enteringDoor) {
            k.doorProgress += 0.045;
            k.animPhase += 0.85;
            let t = Math.min(1, k.doorProgress);
            k.x = k.doorStartX + (geom.doorX - k.doorStartX) * t;
            let targetY = geom.doorY - 14;
            k.y = k.doorStartY + (targetY - k.doorStartY) * t - (20 * Math.sin(t * Math.PI));
            if (k.doorProgress >= 1) {
              k.enteringDoor = false;
              k.escapingToDoor = false;
              k.escaped = true;
            }
            return;
          }

          if (k.caught && state.boss.state === 'flash') {
            k.flip = -1;
            return;
          }

          // Escaping to Door
          if (k.escapingToDoor) {
            let doorApproachY = geom.minY + 6;
            let targetX = geom.doorX + ((idx % 3) - 1) * 14;
            let targetY = (k.y > doorApproachY + 24 && Math.abs(k.x - geom.doorX) > 0.09 * geom.bgW) ? doorApproachY : geom.doorY + 10;
            let dx = targetX - k.x;
            let dy = targetY - k.y;
            let distToDoor = Math.hypot(geom.doorX - k.x, geom.doorY + 10 - k.y) || 1;
            let dist = Math.hypot(dx, dy) || 1;
            let speed = (4.1 + (idx % 5) * 0.22) * (k.speedBoost || 1);

            k.vx += ((dx / dist) * speed - k.vx) * 0.22;
            k.vy += ((dy / dist) * speed - k.vy) * 0.22;
            k.x += k.vx;
            k.y += k.vy;

            if (k.y < geom.minY) {
              let corridor = 0.075 * geom.bgW;
              k.x = Math.max(geom.doorX - corridor, Math.min(geom.doorX + corridor, k.x));
            } else {
              let bounds = geom.boundsAtY(k.y);
              k.x = Math.max(bounds.leftX, Math.min(bounds.rightX, k.x));
            }

            if (distToDoor < 34) {
              k.enteringDoor = true;
              k.doorProgress = 0;
              k.doorStartX = k.x;
              k.doorStartY = k.y;
              audio.nhayVaoCua();
              spawnParticles(geom.doorX, geom.doorY + 4, '#34d399', 10);
              if (state.doorFlashes.length < 4) {
                state.doorFlashes.push({ r: 12, life: 1 });
              }
              if (state.floatingTexts.length < 5) {
                spawnFloatingText(geom.doorX + (Math.random() - 0.5) * 44, geom.doorY - 26, '🚪 +1 Vào lớp!', '#6ee7b7');
              }
              return;
            }
          } else {
            // Normal wandering / fleeing
            k.angle += 0.052 * Math.sin(0.042 * state.tick + 1.3 * idx);
            let ax = 0.13 * Math.cos(k.angle);
            let ay = 0.095 * Math.sin(k.angle);
            let dx = k.x - state.boss.x;
            let dy = k.y - state.boss.y;
            let dist = Math.hypot(dx, dy) || 1;
            let maxSpeed = state.boss.climaxMode ? 2.75 : 2.35;

            if (dist < 210 && state.boss.state === 'chase') {
              let repel = (210 - dist) / 210;
              ax += (dx / dist) * repel * 0.68;
              ay += (dy / dist) * repel * 0.52;
              maxSpeed = state.boss.climaxMode ? 3.65 : 3.35;

              if (!k.speechText && dist < 130 && Math.random() < 0.03) {
                k.speechText = SHOUTS[(idx + Math.floor(state.tick / 30)) % SHOUTS.length];
                k.speechTimer = 68;
              }
            }

            let bounds = geom.boundsAtY(k.y);
            if (k.x < bounds.leftX + 46) ax += 0.44;
            if (k.x > bounds.rightX - 46) ax -= 0.44;
            if (k.y < geom.minY + 34) ay += 0.38;
            if (k.y > geom.maxY - 34) ay -= 0.38;

            k.vx = (k.vx + ax) * 0.96;
            k.vy = (k.vy + ay) * 0.96;
            let curSpeed = Math.hypot(k.vx, k.vy) || 1;
            if (curSpeed > maxSpeed) {
              k.vx = (k.vx / curSpeed) * maxSpeed;
              k.vy = (k.vy / curSpeed) * maxSpeed;
            } else if (curSpeed < 1.55) {
              k.vx = (k.vx / curSpeed) * 1.55;
              k.vy = (k.vy / curSpeed) * 1.55;
            }

            k.y = Math.max(geom.minY, Math.min(geom.maxY, k.y + k.vy));
            let finalBounds = geom.boundsAtY(k.y);
            k.x = Math.max(finalBounds.leftX, Math.min(finalBounds.rightX, k.x + k.vx));
            k.angle = Math.atan2(k.vy, k.vx);
          }

          let dir = k.vx >= 0 ? 1 : -1;
          k.flip += (dir - k.flip) * 0.25;
          if (Math.abs(k.flip) < 0.15) k.flip = 0.15 * dir;

          let speed = Math.hypot(k.vx, k.vy);
          k.animPhase += 0.13 * speed * 4.2;

          let frame = Math.floor(k.animPhase) % 12;
          if ((frame === 0 || frame === 6) && frame !== k.lastFoot) {
            k.lastFoot = frame;
            spawnFootDust(k.x, k.y, dir);
            audio.buocChan(false);
          }
        });

        // Update Teacher Boss
        const boss = state.boss;
        if (boss.state === 'chase') {
          const target = state.kids[boss.targetIdx] || state.kids[state.chosenIdx];
          if (target && !target.escaped) {
            let dx = target.x - boss.x;
            let dy = target.y - boss.y;
            let dist = Math.hypot(dx, dy) || 1;
            let bossSpeed = (boss.climaxMode ? 4.1 : 3.4) * boss.surgeBoost;

            boss.vx += ((dx / dist) * bossSpeed - boss.vx) * 0.14;
            boss.vy += ((dy / dist) * bossSpeed - boss.vy) * 0.14;
            boss.x += boss.vx;
            boss.y += boss.vy;

            let bBounds = geom.boundsAtY(boss.y);
            boss.x = Math.max(bBounds.leftX, Math.min(bBounds.rightX, boss.x));
            boss.y = Math.max(geom.minY, Math.min(geom.maxY, boss.y));

            let dir = boss.vx >= 0 ? 1 : -1;
            boss.flip += (dir - boss.flip) * 0.25;
            if (Math.abs(boss.flip) < 0.15) boss.flip = 0.15 * dir;

            let speed = Math.hypot(boss.vx, boss.vy);
            boss.animPhase += 0.13 * speed * 3.8;

            let frame = Math.floor(boss.animPhase) % 12;
            if ((frame === 0 || frame === 6) && frame !== boss.lastFoot) {
              boss.lastFoot = frame;
              spawnFootDust(boss.x, boss.y, dir, true);
              audio.buocChan(true);
            }

            if (boss.climaxMode && state.tick % 32 === 0) {
              audio.timDap(0.85);
            }
          }
        } else if (boss.state === 'trip') {
          boss.tripAge++;
          const tAge = boss.tripAge;
          const tDir = boss.tripDir;
          const tTitle = teacherGender === 'male' ? 'THẦY GIÁO' : 'CÔ GIÁO';

          if (tAge < 10) {
            boss.x += 3.8 * tDir;
            boss.animPhase += 0.65;
          } else if (tAge === 10) {
            state.trap.airborne = true;
            state.trap.vx = -(4.5 * tDir);
            state.trap.vy = -6.2;
            state.flyingBook = {
              active: true,
              returning: false,
              x: boss.x + 32 * tDir,
              y: boss.y - 12,
              groundY: Math.max(geom.minY + 18, Math.min(geom.maxY - 18, boss.y + 26)),
              vx: 5.6 * tDir,
              vy: -7.4,
              rot: 0
            };
            audio.ngaBupChoang();
            state.shake = 14;
            spawnParticles(boss.x, boss.y + 12, '#fde047', 16);
          } else if (tAge < 29) {
            boss.x += boss.skidVx;
            boss.skidVx *= 0.94;
            spawnFootDust(boss.x, boss.y, tDir, true);
          } else if (tAge === 29) {
            boss.skidVx = 4.2 * tDir;
            boss.banner = `💫 ${tTitle} NGÃ BỆT TRƯỢT DÀI TRÊN SÂN — HỌC SINH TRANH THỦ CHẠY VÀO CỬA LỚP!`;
            bannerBox.textContent = boss.banner;
          } else if (tAge < 115) {
            if (Math.abs(boss.skidVx) > 0.15) {
              boss.x += boss.skidVx;
              boss.skidVx *= 0.92;
            }
            if (tAge === 90) {
              state.flyingBook.returning = true;
            }
          } else if (tAge === 115) {
            audio.dungDayGianDu();
            spawnParticles(boss.x, boss.y - 18, '#f59e0b', 24);
            state.shake = 8;
          } else if (tAge >= 138) {
            boss.state = 'chase';
            boss.tripAge = 0;
            boss.surgeBoost = 1.35;
            state.flyingBook.active = false;
            boss.banner = `🔥 ${tTitle} ĐÃ ĐỨNG DẬY CẦM LẠI SỔ ĐẦU BÀI — CUỘC RƯỢT ĐUỔI BƯỚC VÀO CAO TRÀO!`;
            bannerBox.textContent = boss.banner;
          }

          if (state.trap.active && state.trap.airborne) {
            state.trap.x += state.trap.vx;
            state.trap.y += state.trap.vy;
            state.trap.vy += 0.42;
            state.trap.rot += 0.32;
            if (state.trap.y > boss.y + 44) {
              state.trap.active = false;
            }
          }

          if (state.flyingBook.active) {
            const fb = state.flyingBook;
            if (fb.returning) {
              fb.x += (boss.x + 28 * tDir - fb.x) * 0.22;
              fb.y += (boss.y - 28 - fb.y) * 0.22;
              fb.rot *= 0.75;
            } else {
              fb.x += fb.vx;
              fb.y += fb.vy;
              fb.vy += 0.4;
              fb.rot += 0.24 * tDir;
              if (fb.y >= fb.groundY) {
                fb.y = fb.groundY;
                if (Math.abs(fb.vy) > 1.5) {
                  fb.vy = -(0.48 * fb.vy);
                  fb.vx *= 0.65;
                  audio.soNayDat();
                  spawnParticles(fb.x, fb.y, '#fde047', 6);
                } else {
                  fb.vy = 0;
                  fb.vx *= 0.8;
                }
              }
            }
          }
        }
      }

      // Collect runners for depth-sorted drawing
      const activeKids = state.kids.filter(k => !k.escaped);
      const bossDepth = 0.94 + 0.28 * Math.max(0, Math.min(1, (state.boss.y - geom.doorY) / (h - geom.doorY)));

      // Draw Character Shadows
      activeKids.forEach(k => {
        const isTarget = isRoundActive && ((state.boss.state === 'chase' && k.id === state.boss.targetIdx) || (state.boss.state === 'flash' && k.caught));
        let scale = 0.86 + 0.32 * Math.max(0, Math.min(1, (k.y - geom.doorY) / (h - geom.doorY)));
        let alpha = 1;
        if (k.enteringDoor) {
          let t = Math.min(1, k.doorProgress);
          scale = 0.9 * (1 - 0.72 * t);
          alpha = t < 0.65 ? 1 : Math.max(0, (1 - t) / 0.35);
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(k.x, k.y);
        ctx.scale(scale, scale);

        if (isTarget && !k.enteringDoor) {
          let ringR = 44 + 5 * Math.sin(0.32 * state.tick);
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.ellipse(0, 34, ringR, 0.38 * ringR, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(15, 23, 42, 0.30)";
        ctx.beginPath();
        ctx.ellipse(0, 34, 26, 8.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      // Boss Shadow
      ctx.save();
      ctx.translate(state.boss.x, state.boss.y);
      ctx.scale(bossDepth, bossDepth);
      ctx.fillStyle = "rgba(15, 23, 42, 0.38)";
      ctx.beginPath();
      ctx.ellipse(0, 40, 38, 12, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Banana Peel Trap on Floor
      if (state.trap.active) {
        ctx.save();
        ctx.translate(state.trap.x, state.trap.y);
        ctx.rotate(state.trap.rot);
        ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0, 5, 20, 6.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = "26px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍌", 0, -2);
        ctx.restore();
      }

      // Depth-Sorted Sprites List
      const drawables = [];

      // Students
      activeKids.forEach(k => {
        let scale = 0.86 + 0.32 * Math.max(0, Math.min(1, (k.y - geom.doorY) / (h - geom.doorY)));
        let alpha = 1;
        if (k.enteringDoor) {
          let t = Math.min(1, k.doorProgress);
          scale = 0.9 * (1 - 0.72 * t);
          alpha = t < 0.65 ? 1 : Math.max(0, (1 - t) / 0.35);
        }
        let footY = k.y + 34 * scale;

        drawables.push({
          footY: footY,
          draw: () => {
            const sheet = images.sSheets[k.modelIdx];
            const isFrozen = !isRoundActive || (k.caught && state.boss.state === 'flash');
            const frame = isFrozen ? 12 : Math.floor(k.animPhase) % 12;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(k.x, k.y);
            ctx.scale(scale, scale);

            if (k.enteringDoor) {
              ctx.strokeStyle = "#34d399";
              ctx.lineWidth = 3.4;
              ctx.beginPath();
              ctx.arc(0, -14, 44, 0, 2 * Math.PI);
              ctx.stroke();
            }

            ctx.save();
            ctx.scale(k.flip, 1);
            if (!isFrozen) ctx.rotate(0.055);
            drawSprite(sheet, frame, 126, 40);
            ctx.restore();

            ctx.restore();
          }
        });
      });

      // Teacher Boss (Requirement 6: Thầy Giáo or Cô Giáo)
      const bFootY = state.boss.y + 40 * bossDepth;
      drawables.push({
        footY: bFootY,
        draw: () => {
          const boss = state.boss;
          const tSheet = teacherGender === 'female' ? images.tFemaleSheet : images.tMaleSheet;
          const tStumble = teacherGender === 'female' ? images.tFemaleStumble : images.tMaleStumble;
          const tFallen = teacherGender === 'female' ? images.tFemaleFallen : images.tMaleFallen;

          ctx.save();
          ctx.translate(boss.x, boss.y);
          ctx.scale(bossDepth, bossDepth);

          ctx.save();
          if (boss.state === 'trip') {
            const tAge = boss.tripAge;
            const tDir = boss.tripDir;
            if (tAge < 10) {
              ctx.scale(tDir, 1);
              ctx.rotate(0.06);
              drawSprite(tSheet, Math.floor(boss.animPhase) % 12, 194, 52);
            } else if (tAge < 29) {
              let r = (tAge - 10) / 19;
              let jumpY = -(30 * Math.sin(r * Math.PI));
              ctx.translate(0, jumpY);
              ctx.rotate(0.42 * r * tDir);
              ctx.scale(tDir, 1);
              drawStatic(tStumble, 186, 50);
            } else if (tAge < 118) {
              let sx = 1, sy = 1, oy = 0, rot = 0;
              if (tAge < 36) { sx = 1.24; sy = 0.78; }
              else if (tAge < 44) { oy = -(11 * Math.sin((tAge - 36) / 8 * Math.PI)); sx = 0.94; sy = 1.06; }
              else if (tAge < 50) { sx = 1.08; sy = 0.92; }
              else { rot = 0.045 * Math.sin(0.16 * tAge); sy = 1 + 0.025 * Math.sin(0.2 * tAge); }
              ctx.translate(0, oy + 9);
              ctx.rotate(rot);
              ctx.scale(tDir * sx, sy);
              drawStatic(tFallen, 164, 45);
            } else {
              let i = (tAge - 118) / 20;
              let oy = 8 * Math.sin(i * Math.PI);
              let sy = i < 0.4 ? 0.84 : (i < 0.8 ? 1.08 : 1);
              ctx.translate(0, oy);
              ctx.scale(tDir * (2 - sy), sy);
              drawSprite(tSheet, 12, 194, 52);
            }
          } else {
            ctx.scale(boss.flip, 1);
            let isStationary = !isRoundActive || boss.state === 'flash';
            if (!isStationary && boss.state === 'chase') ctx.rotate(0.05);
            drawSprite(tSheet, isStationary ? 12 : Math.floor(boss.animPhase) % 12, 194, 52);
          }
          ctx.restore();

          // Dizzy stars over boss head when fallen
          if (boss.state === 'trip' && boss.tripAge >= 29 && boss.tripAge < 118) {
            ctx.save();
            ctx.strokeStyle = "rgba(250, 204, 21, 0.6)";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(0, -108, 42, 13, 0, 0, 2 * Math.PI);
            ctx.stroke();
            for (let s = 0; s < 3; s++) {
              let ang = 0.15 * state.tick + (s * Math.PI * 2) / 3;
              let starX = 42 * Math.cos(ang);
              let starY = -108 + 13 * Math.sin(ang);
              ctx.font = "19px system-ui";
              ctx.textAlign = "center";
              ctx.fillText(s % 2 === 0 ? "⭐" : "💫", starX, starY + 6);
            }
            ctx.restore();
          }

          ctx.restore();
        }
      });

      // Sort and Draw All Entities
      drawables.sort((a, b) => a.footY - b.footY);
      drawables.forEach(d => d.draw());

      // Flying Sổ Đầu Bài Prop
      if (state.flyingBook.active && images.bookProp && images.bookProp.complete) {
        ctx.save();
        ctx.translate(state.flyingBook.x, state.flyingBook.y);
        ctx.rotate(state.flyingBook.rot);
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 14;
        drawStatic(images.bookProp, 66, 33);
        ctx.restore();
      }

      // Teacher Name Pill (Requirement 6)
      const boss = state.boss;
      ctx.save();
      ctx.translate(boss.x, boss.y);
      ctx.scale(bossDepth, bossDepth);
      ctx.font = "900 13.5px system-ui, sans-serif";
      let bLabel = teacherGender === 'female' ? '👩‍🏫 CÔ GIÁO - SỔ ĐẦU BÀI' : '👨‍🏫 THẦY GIÁO - SỔ ĐẦU BÀI';
      if (boss.state === 'trip') {
        bLabel = boss.tripAge < 29 ? '❗ TRƯỢT VỎ CHUỐI!' : (boss.tripAge < 118 ? '💫 NGÃ CHOÁNG VÁNG @_@' : '💢 ĐỨNG DẬY RỒI!');
      } else if (boss.climaxMode && isRoundActive) {
        bLabel = `🔥 ${teacherGender === 'female' ? 'CÔ' : 'THẦY'} ĐANG CHỐT SỔ!`;
      }
      let bW = ctx.measureText(bLabel).width + 28;
      let bOffset = (boss.state === 'trip' && boss.tripAge >= 29 && boss.tripAge < 118) ? -154 : -148;
      ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      ctx.beginPath();
      ctx.roundRect(-bW / 2, bOffset + 3, bW, 27, 999);
      ctx.fill();
      ctx.fillStyle = boss.state === 'trip' ? "#d97706" : (teacherGender === 'female' ? "#be185d" : "#0369a1");
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-bW / 2, bOffset, bW, 27, 999);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.textAlign = "center";
      ctx.fillText(bLabel, 0, bOffset + 18);
      ctx.restore();

      // Student Nametag Pills & Speech Bubbles
      activeKids.forEach(k => {
        if (k.enteringDoor) return;
        const isTarget = isRoundActive && ((boss.state === 'chase' && k.id === boss.targetIdx) || (boss.state === 'flash' && k.caught));
        const scale = 0.86 + 0.32 * Math.max(0, Math.min(1, (k.y - geom.doorY) / (h - geom.doorY)));

        ctx.save();
        ctx.translate(k.x, k.y - 98 * scale);
        ctx.scale(scale, scale);

        // Speech Bubble
        if (k.speechText) {
          ctx.font = "800 12.5px system-ui, sans-serif";
          let sW = ctx.measureText(k.speechText).width + 16;
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.beginPath();
          ctx.roundRect(-sW / 2, -32, sW, 24, 8);
          ctx.fill();
          ctx.fillStyle = "#fde047";
          ctx.textAlign = "center";
          ctx.fillText(k.speechText, 0, -16);
        }

        // Nametag Pill
        ctx.font = isTarget ? "900 15px system-ui, sans-serif" : "800 13.5px system-ui, sans-serif";
        let label = isTarget ? `🎯 ${k.shortName}` : k.shortName;
        let lW = ctx.measureText(label).width + (isTarget ? 24 : 20);
        let pillH = isTarget ? 27 : 24;

        ctx.fillStyle = isTarget ? "#dc2626" : k.badgeColor;
        ctx.beginPath();
        ctx.roundRect(-lW / 2, -pillH / 2, lW, pillH, 999);
        ctx.fill();

        ctx.strokeStyle = isTarget ? "#fde047" : "#ffffff";
        ctx.lineWidth = isTarget ? 2.6 : 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, 0.5);

        ctx.restore();
      });

      // Golden Lightning Bolts
      for (let i = state.bolts.length - 1; i >= 0; i--) {
        const bolt = state.bolts[i];
        ctx.save();
        ctx.strokeStyle = `rgba(253, 224, 71, ${bolt.life})`;
        ctx.lineWidth = 3.5 * bolt.life;
        ctx.beginPath();
        ctx.moveTo(bolt.x1, bolt.y1);
        let mx = (bolt.x1 + bolt.x2) / 2 + (Math.random() - 0.5) * 18;
        let my = (bolt.y1 + bolt.y2) / 2 + (Math.random() - 0.5) * 18;
        ctx.lineTo(mx, my);
        ctx.lineTo(bolt.x2, bolt.y2);
        ctx.stroke();
        ctx.restore();
        if (!isPaused) bolt.life -= 0.08;
        if (bolt.life <= 0) state.bolts.splice(i, 1);
      }

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        if (!isPaused) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.03;
        }
        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Floating Texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        if (!isPaused) {
          ft.y -= 0.85;
          ft.life -= 0.02;
        }
        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, 1.4 * ft.life);
        ctx.font = "900 14px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(renderLoop);
    }

    // Start Animation Loop
    animFrameId = requestAnimationFrame(renderLoop);

    // Event Listeners for UI
    document.getElementById('btn-start-race').onclick = function() {
      startRound(1);
    };

    document.getElementById('btn-back-lobby').onclick = function() {
      cleanup();
      if (typeof options.onExit === 'function') {
        options.onExit();
      }
    };

    const soundBtn = document.getElementById('btn-sound-toggle');
    soundBtn.onclick = function() {
      audio.enabled = !audio.enabled;
      soundBtn.textContent = audio.enabled ? '🔊' : '🔇';
      if (!audio.enabled) audio.stopMusic();
      else if (isRoundActive) audio.playMusic(`${ASSET_BASE}/am/nhac-ruot-duoi.wav`, 0.36);
    };

    const fsBtn = document.getElementById('btn-fullscreen-toggle');
    fsBtn.onclick = function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    const pauseBtn = document.getElementById('btn-pause-toggle');
    pauseBtn.onclick = function() {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
    };

    const endBtn = document.getElementById('btn-end-race');
    endBtn.onclick = function() {
      if (confirm('Bạn có chắc chắn muốn kết thúc ván chơi hiện tại?')) {
        cleanup();
        if (typeof options.onExit === 'function') {
          options.onExit();
        }
      }
    };

    // Keyboard controls
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!isRoundActive) {
          if (revealModal.style.display === 'flex') {
            startRound(roundNumber + 1);
          } else {
            startRound(1);
          }
        } else {
          isPaused = !isPaused;
          pauseBtn.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isRoundActive) {
          isPaused = !isPaused;
          pauseBtn.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
        }
      } else if (e.key === 'Escape') {
        if (isRoundActive) {
          endBtn.click();
        } else {
          document.getElementById('btn-back-lobby').click();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    function cleanup() {
      cancelAnimationFrame(animFrameId);
      clearTimers();
      audio.stopMusic();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      container.innerHTML = '';
      container.style.display = 'none';
    }

    return cleanup;
  };
})();
