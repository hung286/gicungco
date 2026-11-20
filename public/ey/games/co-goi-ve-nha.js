/**
 * ==============================================================================
 * GAME: CÔ GỌI VỀ NHÀ (ZALO VIDEO & VOICE CALL SIMULATION)
 * Mô phỏng chính xác 100% từ video gốc & PomyAI
 * (https://pomyai.com/gv/tro-choi-goi-ten/co-goi-ve-nha)
 * ==============================================================================
 */

(function (global) {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. WEB AUDIO SYNTHESIS ENGINE (Chuông Zalo, gõ phím, tin nhắn, ăn mừng)
  // ----------------------------------------------------------------------------
  class ZaloAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.ringtoneTimer = null;
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
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }

    playKeypress() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 450 + Math.random() * 200;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.035);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    }

    playMessageSent() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); // A5
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    playMessageReceived() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, t); // C5
      osc1.frequency.setValueAtTime(659.25, t + 0.06); // E5
      osc2.frequency.setValueAtTime(783.99, t); // G5
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.18);
      osc2.stop(t + 0.18);
    }

    // Zalo Outgoing Call Ringtone (Giai điệu chuông gọi đi Zalo)
    startRingtone() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      this.stopRingtone();

      const playChimePattern = () => {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // Giai điệu chuông ấm áp của Zalo
        const notes = [
          { f: 523.25, t: 0.00, d: 0.14 }, // C5
          { f: 659.25, t: 0.14, d: 0.14 }, // E5
          { f: 783.99, t: 0.28, d: 0.18 }, // G5
          { f: 1046.50, t: 0.46, d: 0.35 } // C6
        ];
        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f, now + n.t);
          gain.gain.setValueAtTime(0.28, now + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + n.t);
          osc.stop(now + n.t + n.d);
        });
      };

      playChimePattern();
      this.ringtoneTimer = setInterval(playChimePattern, 2400);
    }

    stopRingtone() {
      if (this.ringtoneTimer) {
        clearInterval(this.ringtoneTimer);
        this.ringtoneTimer = null;
      }
    }

    playConnected() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    playVictory() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Hợp âm vinh danh rực rỡ C Major 9
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 987.77, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        gain.gain.setValueAtTime(0.18, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + 1.8);
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. HELPER FUNCTIONS & COLOR PALETTES
  // ----------------------------------------------------------------------------
  const AVATAR_COLORS = [
    { bg: '#10b981', fg: '#ffffff' }, // emerald
    { bg: '#f59e0b', fg: '#ffffff' }, // amber
    { bg: '#06b6d4', fg: '#ffffff' }, // cyan
    { bg: '#8b5cf6', fg: '#ffffff' }, // purple
    { bg: '#ec4899', fg: '#ffffff' }, // pink
    { bg: '#3b82f6', fg: '#ffffff' }, // blue
    { bg: '#14b8a6', fg: '#ffffff' }, // teal
    { bg: '#ef4444', fg: '#ffffff' }, // red
    { bg: '#f97316', fg: '#ffffff' }  // orange
  ];

  function getInitials(fullName) {
    if (!fullName) return 'PH';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  function getFirstName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1];
  }

  function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  // ----------------------------------------------------------------------------
  // 3. MAIN GAME CONTROLLER CLASS
  // ----------------------------------------------------------------------------
  class CoGoiVeNhaGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.audio = new ZaloAudio();

      // Roster & Settings
      this.classRoster = this.normalizeRoster(options.classRoster || options.session?.students || []);
      this.isTeacherFemale = (options.session?.teacherGender !== 'male');
      this.teacherRoleName = this.isTeacherFemale ? 'cô giáo' : 'thầy giáo';
      this.teacherTitle = this.isTeacherFemale ? 'Cô giáo' : 'Thầy giáo';
      this.teacherInitials = this.isTeacherFemale ? 'CN' : 'TH'; // Cô Ngọc / Thầy Hùng

      // State machine: 'DESKTOP' | 'SPLASH' | 'ZALO_HOME' | 'ZALO_CHAT' | 'CALLING' | 'REVEAL'
      this.state = 'DESKTOP';
      this.selectedStudent = null;
      this.filteredStudents = [...this.classRoster];
      this.isAutoRunning = false;
      this.isPaused = false;
      this.searchKeyword = '';

      // Typing animation state
      this.typingTimer = null;
      this.callTimer = null;

      this.initDom();
      this.bindEvents();
      this.enterDesktop();
    }

    normalizeRoster(raw) {
      if (!Array.isArray(raw) || raw.length === 0) {
        return [
          { name: 'Nguyễn Minh An', gender: 'nam' },
          { name: 'Trần Bảo Châu', gender: 'nu' },
          { name: 'Lê Gia Huy', gender: 'nam' },
          { name: 'Phạm Thùy Linh', gender: 'nu' },
          { name: 'Hoàng Đức Mạnh', gender: 'nam' },
          { name: 'Vũ Khánh Ngân', gender: 'nu' },
          { name: 'Đặng Quốc Phong', gender: 'nam' },
          { name: 'Bùi Thu Quỳnh', gender: 'nu' },
          { name: 'Đỗ Hải Sơn', gender: 'nam' },
          { name: 'Ngô Phương Thảo', gender: 'nu' },
          { name: 'Dương Anh Tuấn', gender: 'nam' },
          { name: 'Lý Bảo Vy', gender: 'nu' },
          { name: 'Huỳnh Ngọc Hân', gender: 'nu' },
          { name: 'Phan Nhật Minh', gender: 'nam' },
          { name: 'Võ Thanh Trúc', gender: 'nu' },
          { name: 'Hồ Gia Bảo', gender: 'nam' },
          { name: 'Nguyễn Hoàng Yến', gender: 'nu' },
          { name: 'Chu Minh Khôi', gender: 'nam' },
          { name: 'Lê Phương Anh', gender: 'nu' },
          { name: 'Đặng Ngọc Diệp', gender: 'nu' }
        ];
      }
      return raw.map(item => {
        if (typeof item === 'string') return { name: item, gender: 'nam' };
        return { name: item.name || 'Học sinh', gender: item.gender || 'nam' };
      });
    }

    initDom() {
      this.container.innerHTML = `
        <div id="cogoivenha-root" class="cogoivenha-wrapper" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; user-select: none;">
          <!-- Top Utility Toolbar (Ey standard) -->
          <div id="cg-topbar" style="position: absolute; top: 12px; right: 16px; z-index: 9999; display: flex; align-items: center; gap: 8px;">
            <button id="cg-btn-random" class="cg-pill-btn cg-pill-btn-accent" title="Nhấn Space hoặc Enter để gọi">
              🎲 Gọi ngẫu nhiên
            </button>
            <button id="cg-btn-fullscreen" class="cg-pill-btn" title="Toàn màn hình">⛶</button>
            <button id="cg-btn-sound" class="cg-pill-btn" title="Bật/Tắt âm thanh">🔊</button>
            <button id="cg-btn-pause" class="cg-pill-btn" title="Tạm dừng">Tạm dừng</button>
            <button id="cg-btn-exit" class="cg-pill-btn cg-pill-btn-danger" title="Thoát trò chơi">Thoát</button>
          </div>

          <!-- 1. WINDOWS 11 DESKTOP VIEW -->
          <div id="cg-desktop-view" style="position: absolute; inset: 0; display: flex; flex-direction: column; background: #000; overflow: hidden;">
            <!-- Wallpaper canvas with clean 4K Bloom wallpaper -->
            <div id="cg-desktop-canvas" style="flex: 1; position: relative; background: url('/ey/games/cogoivenha/win11_bloom_clean.webp') no-repeat center center; background-size: cover; cursor: default; overflow: hidden;">
              <!-- Simulated Desktop Icons Column Grid -->
              <div id="cg-desktop-icons" style="position: absolute; top: 16px; left: 18px; bottom: 56px; display: grid; grid-template-rows: repeat(auto-fill, 78px); grid-auto-flow: column; grid-auto-columns: 82px; gap: 6px 12px; z-index: 10;">
                <!-- Column 1 -->
                <div class="cg-dicon" data-app="pc">
                  <div class="cg-dicon__img">🖥️</div>
                  <div class="cg-dicon__label">Máy tính này</div>
                </div>
                <div class="cg-dicon" data-app="recycle">
                  <div class="cg-dicon__img">🗑️</div>
                  <div class="cg-dicon__label">Thùng rác</div>
                </div>
                <div class="cg-dicon cg-dicon--zalo" id="cg-icon-zalo" data-app="zalo" title="Nhấp hoặc nhấp đúp để mở Zalo PC">
                  <div class="cg-dicon__zalo-bubble">
                    <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                      <rect width="48" height="48" rx="12" fill="#0068FF"/>
                      <path d="M11 24.5C11 17.5964 16.8203 12 24 12C31.1797 12 37 17.5964 37 24.5C37 31.4036 31.1797 37 24 37C21.6542 37 19.4526 36.3768 17.5684 35.2892L11.5 36.5L13.1678 32.1865C11.8217 29.9859 11 27.3486 11 24.5Z" fill="white"/>
                      <path d="M17 20H31V22.5L21.5 29.5H31V32H17V29.5L26.5 22.5H17V20Z" fill="#0068FF"/>
                    </svg>
                  </div>
                  <div class="cg-dicon__label" style="font-weight: 700; color: #ffffff;">Zalo</div>
                </div>
                <div class="cg-dicon" data-app="chrome">
                  <div class="cg-dicon__img">🌐</div>
                  <div class="cg-dicon__label">Google Chrome</div>
                </div>
                <div class="cg-dicon" data-app="giaoan">
                  <div class="cg-dicon__img">📁</div>
                  <div class="cg-dicon__label">Giáo án 2026-2027</div>
                </div>
                <div class="cg-dicon" data-app="dekiemtra">
                  <div class="cg-dicon__img">📁</div>
                  <div class="cg-dicon__label">Đề kiểm tra giữa kì I</div>
                </div>

                <!-- Column 2 -->
                <div class="cg-dicon" data-app="anhhoatdong">
                  <div class="cg-dicon__img">📁</div>
                  <div class="cg-dicon__label">Ảnh hoạt động lớp</div>
                </div>
                <div class="cg-dicon" data-app="sodiem">
                  <div class="cg-dicon__img">📊</div>
                  <div class="cg-dicon__label">Sổ điểm học kì I</div>
                </div>
                <div class="cg-dicon" data-app="danhsachph">
                  <div class="cg-dicon__img">📑</div>
                  <div class="cg-dicon__label">Danh sách phụ huynh</div>
                </div>
                <div class="cg-dicon" data-app="kehoach">
                  <div class="cg-dicon__img">📝</div>
                  <div class="cg-dicon__label">Kế hoạch tuần 7</div>
                </div>
                <div class="cg-dicon" data-app="baigiang">
                  <div class="cg-dicon__img">📊</div>
                  <div class="cg-dicon__label">Bài giảng tuần 7</div>
                </div>
                <div class="cg-dicon" data-app="bienban">
                  <div class="cg-dicon__img">📑</div>
                  <div class="cg-dicon__label">Biên bản họp phụ huynh</div>
                </div>

                <!-- Column 3 -->
                <div class="cg-dicon" data-app="noiquy">
                  <div class="cg-dicon__img">📝</div>
                  <div class="cg-dicon__label">Nội quy lớp học</div>
                </div>
              </div>

              <!-- Animated Simulated Cursor -->
              <div id="cg-simulated-cursor" style="position: absolute; top: 40%; left: 50%; width: 24px; height: 24px; pointer-events: none; z-index: 1000; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); opacity: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 2L20 10L12 12L10 20L4 2Z" fill="#000" stroke="#fff" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <!-- Windows 11 Taskbar (Crisp, zero character cut-off, always visible at bottom) -->
            <div id="cg-taskbar" style="height: 48px; background: rgba(30, 41, 59, 0.92); backdrop-filter: blur(20px); border-top: 1px solid rgba(255, 255, 255, 0.12); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; color: #f1f5f9; z-index: 100; box-sizing: border-box; flex-shrink: 0;">
              <!-- Left: Weather Widget -->
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #e2e8f0; min-width: 130px;">
                <span>🌤️ 30°C</span>
                <span style="opacity: 0.9;">Trời ít mây</span>
              </div>

              <!-- Center: App Launcher & Icons -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <div class="cg-tb-icon" title="Start">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#00a4ef">
                    <rect x="2" y="2" width="9" height="9" rx="1"/>
                    <rect x="13" y="2" width="9" height="9" rx="1"/>
                    <rect x="2" y="13" width="9" height="9" rx="1"/>
                    <rect x="13" y="13" width="9" height="9" rx="1"/>
                  </svg>
                </div>
                <div class="cg-tb-search" style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); padding: 5px 12px; border-radius: 20px; font-size: 12px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.08);">
                  <span>🔍</span>
                  <span>Tìm kiếm</span>
                </div>
                <div class="cg-tb-icon" title="File Explorer">📁</div>
                <div class="cg-tb-icon" title="Google Chrome">🌐</div>
                <div class="cg-tb-icon" title="Word">📝</div>
                <div class="cg-tb-icon" title="Excel">📊</div>
                <!-- Zalo Taskbar App Icon -->
                <div class="cg-tb-icon cg-tb-icon--active" id="cg-tb-zalo" title="Zalo PC">
                  <div style="width: 26px; height: 26px; border-radius: 6px; background: #0068ff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,104,255,0.4);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C10.5 20 9.1 19.6 7.9 18.9L4 20L5.1 16.1C4.4 14.9 4 13.5 4 12Z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Right: System Tray & Clock -->
              <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; color: #e2e8f0; min-width: 130px; justify-content: flex-end;">
                <span style="font-size: 10px; cursor: pointer;">⌃</span>
                <span style="font-weight: 600; font-size: 11px;">VIE</span>
                <span>📶</span>
                <span>🔊</span>
                <span>🔋</span>
                <div style="text-align: right; line-height: 1.15; padding-left: 4px;">
                  <div id="cg-tb-clock-time" style="font-weight: 600; font-size: 12px;">11:25</div>
                  <div id="cg-tb-clock-date" style="font-size: 10px; color: #cbd5e1;">01/11/2026</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. ZALO SPLASH SCREEN -->
          <div id="cg-splash-view" style="position: absolute; inset: 0; background: #ffffff; display: none; align-items: center; justify-content: center; z-index: 200;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 24px; animation: scaleIn 0.3s ease;">
              <div style="font-size: 64px; font-weight: 900; color: #0068ff; letter-spacing: -1px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
                Zalo
              </div>
              <div style="width: 220px; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; position: relative;">
                <div id="cg-splash-bar" style="width: 0%; height: 100%; background: #0068ff; transition: width 1.2s cubic-bezier(0.1, 0.8, 0.2, 1);"></div>
              </div>
            </div>
          </div>

          <!-- 3. ZALO PC APPLICATION WINDOW -->
          <div id="cg-zalo-view" style="position: absolute; inset: 0; display: none; flex-direction: column; background: #ffffff; z-index: 300;">
            <!-- Window Title Bar -->
            <div style="height: 38px; background: #0068ff; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; color: #ffffff; font-size: 13px; font-weight: 600; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 800; font-size: 14px;">Zalo</span>
                <span style="font-size: 11px; opacity: 0.85; font-weight: 400;">· Lớp học thông minh</span>
              </div>
              <div style="display: flex; align-items: center; gap: 16px; font-size: 13px;">
                <span class="cg-win-btn" title="Thu nhỏ">_</span>
                <span class="cg-win-btn" title="Phóng to">▢</span>
                <span class="cg-win-btn cg-win-btn--close" id="cg-zalo-close" title="Đóng">✕</span>
              </div>
            </div>

            <!-- Zalo Main Body: 3-Column Layout -->
            <div style="flex: 1; display: flex; overflow: hidden; position: relative;">
              <!-- 3.1. Left Slim Navigation Rail (Blue) -->
              <div style="width: 68px; background: #0068ff; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 16px 0; color: #ffffff; flex-shrink: 0;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%;">
                  <!-- User Avatar -->
                  <div class="cg-rail-avatar" id="cg-user-avatar" title="${this.teacherTitle}">
                    ${this.teacherInitials}
                  </div>
                  <!-- Chat Icon with badge -->
                  <div class="cg-rail-icon cg-rail-icon--active" title="Tin nhắn">
                    <span style="font-size: 22px;">💬</span>
                    <span class="cg-rail-badge">5+</span>
                  </div>
                  <!-- Contact Icon -->
                  <div class="cg-rail-icon" title="Danh bạ">
                    <span style="font-size: 20px;">👤</span>
                  </div>
                  <!-- Todo / Tasks -->
                  <div class="cg-rail-icon" title="Giao việc">
                    <span style="font-size: 20px;">☑</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 18px;">
                  <div class="cg-rail-icon" title="Cloud của tôi">
                    <span style="font-size: 18px;">☁️</span>
                  </div>
                  <div class="cg-rail-icon" title="Công cụ">
                    <span style="font-size: 18px;">💼</span>
                  </div>
                  <div class="cg-rail-icon" title="Cài đặt">
                    <span style="font-size: 18px;">⚙️</span>
                  </div>
                </div>
              </div>

              <!-- 3.2. Middle Column: Parent Contact List (Width ~340px) -->
              <div style="width: 340px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; background: #ffffff; flex-shrink: 0;">
                <!-- Search & Filter Header -->
                <div style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; display: flex; align-items: center; background: #f1f5f9; border-radius: 6px; padding: 6px 10px; gap: 8px; border: 1px solid #e2e8f0;">
                      <span style="color: #94a3b8; font-size: 14px;">🔍</span>
                      <input id="cg-search-input" type="text" placeholder="Tìm kiếm" style="flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #1e293b;">
                    </div>
                    <button class="cg-icon-btn" title="Thêm bạn">👤⁺</button>
                    <button class="cg-icon-btn" title="Tạo nhóm">👥⁺</button>
                  </div>

                  <!-- Sub Tabs: Ưu tiên | Khác -->
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 12px; font-weight: 600; color: #64748b;">
                    <div style="display: flex; gap: 14px;">
                      <span id="cg-tab-priority" class="cg-tab-item cg-tab-item--active">Ưu tiên</span>
                      <span id="cg-tab-other" class="cg-tab-item">Khác</span>
                    </div>
                    <span style="font-size: 11px; color: #94a3b8; cursor: pointer;">Phân loại ▾</span>
                  </div>
                </div>

                <!-- Contact Rows Scroll Area -->
                <div id="cg-contact-list" style="flex: 1; overflow-y: auto;">
                  <!-- Dynamically rendered -->
                </div>
              </div>

              <!-- 3.3. Right Column: Chat Thread / Welcome Splash -->
              <div id="cg-right-pane" style="flex: 1; display: flex; flex-direction: column; background: #f8fafc; position: relative;">
                <!-- Default Welcome Screen -->
                <div id="cg-welcome-screen" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
                  <h2 style="font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Chào mừng đến với Zalo PC!</h2>
                  <p style="font-size: 14px; color: #64748b; max-width: 520px; line-height: 1.6; margin-bottom: 30px;">
                    Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng phụ huynh, học sinh được tối ưu hoá cho máy tính của bạn.
                  </p>
                  <div style="margin-bottom: 30px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
                    <img src="/ey/games/cogoivenha/zalo_welcome_illust.webp" alt="Zalo PC" style="display: block; max-width: 440px; height: auto;">
                  </div>
                  <div style="font-weight: 700; font-size: 16px; color: #0284c7; margin-bottom: 6px;">Nhắn tin nhiều hơn, soạn thảo ít hơn</div>
                  <div style="font-size: 13px; color: #64748b; max-width: 480px; margin-bottom: 24px;">
                    Sử dụng Tin Nhắn Nhanh để lưu sẵn các tin nhắn thường dùng và gửi nhanh trong hội thoại bất kỳ.
                  </div>
                  <button id="cg-welcome-start-btn" style="padding: 12px 28px; background: linear-gradient(135deg, #0068ff, #0284c7); color: #fff; font-weight: 700; font-size: 15px; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,104,255,0.35); transition: transform 0.15s;">
                    📞 Bắt đầu gọi ngẫu nhiên (Enter)
                  </button>
                </div>

                <!-- Chat Thread Screen (Visible when a contact is selected) -->
                <div id="cg-chat-screen" style="flex: 1; display: none; flex-direction: column; background: #ffffff;">
                  <!-- Chat Header -->
                  <div style="height: 60px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #ffffff; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div id="cg-chat-header-avatar" style="width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #fff;">
                        NM
                      </div>
                      <div>
                        <div id="cg-chat-header-name" style="font-weight: 700; font-size: 15px; color: #1e293b;">
                          PH Phan Nhật Minh
                        </div>
                        <div style="font-size: 12px; color: #64748b;">Vừa truy cập</div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 16px; color: #475569;">
                      <span class="cg-chat-tool-btn" title="Thêm thành viên">👥</span>
                      <span class="cg-chat-tool-btn" title="Tìm kiếm">🔍</span>
                      <span class="cg-chat-tool-btn cg-chat-tool-btn--call" id="cg-btn-trigger-voice" title="Cuộc gọi thoại">📞</span>
                      <span class="cg-chat-tool-btn" title="Cuộc gọi video">📹</span>
                      <span class="cg-chat-tool-btn" title="Bố cục">🗖</span>
                    </div>
                  </div>

                  <!-- Messages Body -->
                  <div id="cg-messages-body" style="flex: 1; overflow-y: auto; padding: 20px 24px; background: #f1f5f9; display: flex; flex-direction: column; gap: 14px;">
                    <!-- Message items dynamically populated -->
                  </div>

                  <!-- Chat Input Bar -->
                  <div style="background: #ffffff; border-top: 1px solid #e2e8f0; padding: 10px 16px; flex-shrink: 0;">
                    <!-- Formatting icons -->
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 8px; color: #64748b; font-size: 15px;">
                      <span style="cursor: pointer;">😊</span>
                      <span style="cursor: pointer;">🖼️</span>
                      <span style="cursor: pointer;">📎</span>
                      <span style="cursor: pointer;">✂️</span>
                      <span style="font-weight: 700; font-size: 13px; cursor: pointer;">Aa</span>
                    </div>
                    <!-- Typing line -->
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <div id="cg-typing-preview" style="font-size: 14px; color: #1e293b; min-height: 24px; display: flex; align-items: center;">
                        <span id="cg-typing-text" style="color: #64748b;">Nhập @, tin nhắn tới phụ huynh...</span>
                        <span id="cg-typing-cursor" style="display: none; width: 2px; height: 16px; background: #0068ff; margin-left: 2px; animation: blink 0.8s infinite;"></span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 18px;">
                        <span style="cursor: pointer;">😀</span>
                        <span style="cursor: pointer; color: #f59e0b;">👍</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. ZALO CALL MODAL WINDOW (Zalo · Cuộc gọi thoại) -->
          <div id="cg-call-dialog" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(440px, 92vw); height: 500px; background: linear-gradient(180deg, #182234 0%, #0f172a 100%); border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.1); display: none; flex-direction: column; overflow: hidden; z-index: 500; animation: popupScale 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);">
            <!-- Dialog Topbar -->
            <div style="height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; color: #94a3b8; font-size: 12px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span>Zalo · Cuộc gọi thoại</span>
              <div style="display: flex; gap: 12px; font-size: 13px;">
                <span style="cursor: pointer;">_</span>
                <span id="cg-call-close" style="cursor: pointer; color: #ef4444;">✕</span>
              </div>
            </div>

            <!-- Call Avatar & Wave Waves Area -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
              <!-- Expanding ripple rings -->
              <div class="cg-call-ripple cg-call-ripple-1"></div>
              <div class="cg-call-ripple cg-call-ripple-2"></div>
              <div class="cg-call-ripple cg-call-ripple-3"></div>

              <!-- Main Round Avatar -->
              <div id="cg-call-avatar" style="position: relative; width: 110px; height: 110px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 2;">
                NM
              </div>

              <!-- Contact Name & Status -->
              <div id="cg-call-name" style="margin-top: 24px; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; z-index: 2;">
                PH Phan Nhật Minh
              </div>
              <div id="cg-call-status" style="margin-top: 6px; font-size: 14px; color: #38bdf8; font-weight: 500; z-index: 2;">
                Đang đổ chuông...
              </div>
            </div>

            <!-- Call Controls (Speaker, Mute, End Call) -->
            <div style="height: 90px; display: flex; align-items: center; justify-content: center; gap: 28px; padding-bottom: 12px; z-index: 2;">
              <button class="cg-call-btn" id="cg-btn-speaker" title="Loa ngoài">🔊</button>
              <button class="cg-call-btn" id="cg-btn-mute" title="Tắt tiếng">🎤</button>
              <button class="cg-call-btn cg-call-btn--end" id="cg-btn-endcall" title="Kết thúc cuộc gọi">📞</button>
            </div>
          </div>

          <!-- 5. VINH DANH LÊN BẢNG MODAL (MẸ/BỐ EM ĐÃ BẮT MÁY) -->
          <div id="cg-result-modal" style="position: absolute; inset: 0; background: rgba(5, 7, 15, 0.78); backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; z-index: 800; animation: fadeIn 0.3s ease;">
            <div style="width: min(620px, 92vw); background: linear-gradient(145deg, #1e1338 0%, #110926 100%); border-radius: 24px; border: 1.5px solid rgba(234, 179, 8, 0.35); box-shadow: 0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(168, 85, 247, 0.15); padding: 48px 36px; text-align: center; position: relative; animation: modalPop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);">
              <!-- Top Ribbon Header -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 18px;">
                <div style="height: 1px; width: 60px; background: linear-gradient(90deg, transparent, #fbbf24);"></div>
                <div id="cg-result-role" style="font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #fbbf24;">
                  MẸ EM ĐÃ BẮT MÁY
                </div>
                <div style="height: 1px; width: 60px; background: linear-gradient(90deg, #fbbf24, transparent);"></div>
              </div>

              <!-- Student Name in Giant Golden Font -->
              <div id="cg-result-name" style="font-size: clamp(42px, 7vw, 68px); font-weight: 900; line-height: 1.15; color: #ffffff; text-shadow: 0 4px 20px rgba(251, 191, 36, 0.4); margin-bottom: 16px; background: linear-gradient(180deg, #fffbeb 0%, #fef08a 50%, #facc15 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Nhật Minh
              </div>

              <!-- Invitation -->
              <div style="font-size: 20px; font-weight: 700; color: #fde047; margin-bottom: 36px; letter-spacing: 0.5px;">
                Mời em lên bảng!
              </div>

              <!-- Buttons -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                <button id="cg-btn-next-student" style="padding: 14px 34px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-weight: 800; font-size: 15px; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 6px 20px rgba(234, 88, 12, 0.45); transition: transform 0.15s;">
                  Gọi em tiếp theo
                </button>
                <button id="cg-btn-back-list" style="padding: 14px 28px; background: rgba(255,255,255,0.06); color: #cbd5e1; font-weight: 700; font-size: 14px; border: 1.5px solid rgba(255,255,255,0.18); border-radius: 12px; cursor: pointer; transition: all 0.15s;">
                  Về danh sách
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>
          .cg-zalo-hint-ring {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            border: 2px solid rgba(0, 104, 255, 0.6);
            animation: zaloPulse 1.8s infinite;
          }
          @keyframes zaloPulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 0.2; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }

          /* Global UI Styles & Animations */
          .cg-pill-btn {
            background: rgba(255, 255, 255, 0.92);
            color: #1e293b;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            transition: all 0.15s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .cg-pill-btn:hover {
            transform: translateY(-1px);
            background: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.12);
          }
          .cg-pill-btn-accent {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35) !important;
          }
          .cg-pill-btn-danger {
            color: #ef4444 !important;
          }

          /* Desktop Icons */
          .cg-dicon {
            width: 78px;
            height: 74px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            cursor: pointer;
            padding: 4px;
            text-align: center;
            transition: all 0.15s;
          }
          .cg-dicon:hover {
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.25);
          }
          .cg-dicon--zalo {
            border: 1px solid rgba(0, 104, 255, 0.4);
            background: rgba(0, 104, 255, 0.12);
          }
          .cg-dicon--zalo:hover {
            background: rgba(0, 104, 255, 0.25);
            box-shadow: 0 0 16px rgba(0, 104, 255, 0.5);
          }
          .cg-dicon__zalo-bubble {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2px;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
          }
          .cg-dicon__img {
            font-size: 28px;
            line-height: 1;
            margin-bottom: 3px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          }
          .cg-dicon__label {
            font-size: 11px;
            color: #ffffff;
            font-weight: 500;
            text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 2px 6px #000;
            line-height: 1.15;
            max-width: 74px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          /* Taskbar */
          .cg-tb-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-size: 18px;
            cursor: pointer;
            transition: background 0.15s;
          }
          .cg-tb-icon:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .cg-tb-icon--active {
            position: relative;
          }
          .cg-tb-icon--active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            width: 14px;
            height: 3px;
            background: #38bdf8;
            border-radius: 2px;
          }

          /* Zalo Rail */
          .cg-rail-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #ec4899;
            color: #fff;
            font-weight: 800;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .cg-rail-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            cursor: pointer;
            position: relative;
            transition: background 0.15s;
          }
          .cg-rail-icon:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .cg-rail-icon--active {
            background: rgba(255, 255, 255, 0.22);
          }
          .cg-rail-badge {
            position: absolute;
            top: 4px;
            right: 4px;
            background: #ef4444;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 8px;
            line-height: 1.2;
          }

          /* Contacts list */
          .cg-contact-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            cursor: pointer;
            transition: background 0.15s;
            border-bottom: 1px solid #f8fafc;
          }
          .cg-contact-row:hover {
            background: #f1f5f9;
          }
          .cg-contact-row--active {
            background: #e0f2fe !important;
          }

          .cg-tab-item {
            cursor: pointer;
            padding-bottom: 4px;
          }
          .cg-tab-item--active {
            color: #0068ff;
            border-bottom: 2px solid #0068ff;
          }
          .cg-icon-btn {
            background: transparent;
            border: none;
            color: #64748b;
            font-size: 15px;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 4px;
          }
          .cg-icon-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
          }

          /* Chat tool buttons */
          .cg-chat-tool-btn {
            cursor: pointer;
            font-size: 16px;
            padding: 6px;
            border-radius: 6px;
            transition: background 0.15s;
          }
          .cg-chat-tool-btn:hover {
            background: #f1f5f9;
          }
          .cg-chat-tool-btn--call {
            background: #eff6ff;
            color: #0068ff;
          }
          .cg-chat-tool-btn--call:hover {
            background: #dbeafe;
          }

          /* Window buttons */
          .cg-win-btn {
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .cg-win-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .cg-win-btn--close:hover {
            background: #ef4444 !important;
          }

          /* Call Dialog Ripple Waves */
          .cg-call-ripple {
            position: absolute;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            border: 2px solid rgba(56, 189, 248, 0.4);
            animation: callWave 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .cg-call-ripple-2 { animation-delay: 0.8s; }
          .cg-call-ripple-3 { animation-delay: 1.6s; }

          @keyframes callWave {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.8); opacity: 0; }
          }

          .cg-call-btn {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border: none;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s;
          }
          .cg-call-btn:hover {
            transform: scale(1.08);
            background: rgba(255, 255, 255, 0.2);
          }
          .cg-call-btn--end {
            background: #ef4444 !important;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);
          }
          .cg-call-btn--end:hover {
            background: #dc2626 !important;
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes popupScale {
            0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          @keyframes modalPop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        </style>
      `;
    }

    bindEvents() {
      // Top utility buttons
      const btnRandom = this.container.querySelector('#cg-btn-random');
      const btnFs = this.container.querySelector('#cg-btn-fullscreen');
      const btnSound = this.container.querySelector('#cg-btn-sound');
      const btnPause = this.container.querySelector('#cg-btn-pause');
      const btnExit = this.container.querySelector('#cg-btn-exit');

      btnRandom.onclick = () => this.triggerRandomCall();

      btnFs.onclick = () => {
        if (!document.fullscreenElement) {
          this.container.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      };

      btnSound.onclick = () => {
        this.audio.enabled = !this.audio.enabled;
        btnSound.textContent = this.audio.enabled ? '🔊' : '🔇';
      };

      btnPause.onclick = () => {
        this.isPaused = !this.isPaused;
        btnPause.textContent = this.isPaused ? 'Tiếp tục' : 'Tạm dừng';
      };

      btnExit.onclick = () => {
        if (typeof this.options.onExit === 'function') {
          this.options.onExit();
        }
      };

      // Desktop Zalo Launch
      const dZalo = this.container.querySelector('#cg-icon-zalo');
      const tbZalo = this.container.querySelector('#cg-tb-zalo');
      const openZaloApp = () => {
        this.audio.playClick();
        this.launchZaloApp();
      };
      if (dZalo) dZalo.ondblclick = openZaloApp;
      if (dZalo) dZalo.onclick = openZaloApp;
      if (tbZalo) tbZalo.onclick = openZaloApp;

      // Close Zalo window
      const btnZaloClose = this.container.querySelector('#cg-zalo-close');
      if (btnZaloClose) {
        btnZaloClose.onclick = () => {
          this.audio.playClick();
          this.enterDesktop();
        };
      }

      // Welcome Screen Call Button
      const btnWelcomeCall = this.container.querySelector('#cg-welcome-start-btn');
      if (btnWelcomeCall) {
        btnWelcomeCall.onclick = () => this.triggerRandomCall();
      }

      // Voice Call Trigger Button in Chat Header
      const btnVoice = this.container.querySelector('#cg-btn-trigger-voice');
      if (btnVoice) {
        btnVoice.onclick = () => {
          if (this.selectedStudent) {
            this.startVoiceCall(this.selectedStudent);
          }
        };
      }

      // Call Dialog buttons
      const btnEnd = this.container.querySelector('#cg-btn-endcall');
      const btnCallClose = this.container.querySelector('#cg-call-close');
      const endCallFn = () => {
        this.audio.playClick();
        this.audio.stopRingtone();
        this.container.querySelector('#cg-call-dialog').style.display = 'none';
        this.state = 'ZALO_CHAT';
      };
      if (btnEnd) btnEnd.onclick = endCallFn;
      if (btnCallClose) btnCallClose.onclick = endCallFn;

      // Result Modal Buttons
      const btnNext = this.container.querySelector('#cg-btn-next-student');
      const btnBackList = this.container.querySelector('#cg-btn-back-list');

      btnNext.onclick = () => {
        this.audio.playClick();
        this.container.querySelector('#cg-result-modal').style.display = 'none';
        this.triggerRandomCall();
      };

      btnBackList.onclick = () => {
        this.audio.playClick();
        this.container.querySelector('#cg-result-modal').style.display = 'none';
        this.container.querySelector('#cg-chat-screen').style.display = 'none';
        this.container.querySelector('#cg-welcome-screen').style.display = 'flex';
        this.state = 'ZALO_HOME';
      };

      // Search Filter
      const searchInput = this.container.querySelector('#cg-search-input');
      if (searchInput) {
        searchInput.oninput = (e) => {
          this.searchKeyword = e.target.value.trim().toLowerCase();
          this.filterContactList();
        };
      }

      // Keyboard Shortcuts
      this.keyHandler = (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          // If in reveal state, go to next
          if (this.state === 'REVEAL') {
            e.preventDefault();
            btnNext.click();
            return;
          }
          // If in desktop, open Zalo
          if (this.state === 'DESKTOP') {
            e.preventDefault();
            this.launchZaloApp();
            return;
          }
          // If in calling state, speed up / connect immediately
          if (this.state === 'CALLING') {
            e.preventDefault();
            this.connectCallImmediately();
            return;
          }
          // If in chat / home, trigger random call
          if (this.state === 'ZALO_HOME' || this.state === 'ZALO_CHAT') {
            e.preventDefault();
            this.triggerRandomCall();
          }
        }
      };
      window.addEventListener('keydown', this.keyHandler);
    }

    // --------------------------------------------------------------------------
    // 4. SCENE CONTROLLERS
    // --------------------------------------------------------------------------
    enterDesktop() {
      this.state = 'DESKTOP';
      this.container.querySelector('#cg-desktop-view').style.display = 'flex';
      this.container.querySelector('#cg-splash-view').style.display = 'none';
      this.container.querySelector('#cg-zalo-view').style.display = 'none';
      this.container.querySelector('#cg-call-dialog').style.display = 'none';
      this.container.querySelector('#cg-result-modal').style.display = 'none';
    }

    launchZaloApp() {
      this.state = 'SPLASH';
      this.container.querySelector('#cg-desktop-view').style.display = 'none';
      const splash = this.container.querySelector('#cg-splash-view');
      const splashBar = this.container.querySelector('#cg-splash-bar');
      splash.style.display = 'flex';
      splashBar.style.width = '0%';

      setTimeout(() => {
        splashBar.style.width = '100%';
      }, 100);

      setTimeout(() => {
        splash.style.display = 'none';
        this.enterZaloHome();
      }, 1200);
    }

    enterZaloHome() {
      this.state = 'ZALO_HOME';
      this.container.querySelector('#cg-zalo-view').style.display = 'flex';
      this.container.querySelector('#cg-welcome-screen').style.display = 'flex';
      this.container.querySelector('#cg-chat-screen').style.display = 'none';
      this.renderContactsList();
    }

    renderContactsList() {
      const listEl = this.container.querySelector('#cg-contact-list');
      if (!listEl) return;

      listEl.innerHTML = '';
      this.filteredStudents.forEach((st) => {
        const initials = getInitials(st.name);
        const col = getAvatarColor(st.name);
        const row = document.createElement('div');
        row.className = 'cg-contact-row';
        row.setAttribute('data-name', st.name);
        row.innerHTML = `
          <div style="width: 44px; height: 44px; border-radius: 50%; background: ${col.bg}; color: ${col.fg}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0;">
            ${initials}
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; font-size: 14px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              PH ${st.name}
            </div>
            <div class="cg-contact-subtitle" style="font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
              Dạ vâng, em cảm ơn anh/chị ạ.
            </div>
          </div>
          <div style="font-size: 11px; color: #94a3b8; flex-shrink: 0;">
            Vài giây
          </div>
        `;

        row.onclick = () => {
          this.audio.playClick();
          this.openChatWithStudent(st);
        };

        listEl.appendChild(row);
      });
    }

    filterContactList() {
      if (!this.searchKeyword) {
        this.filteredStudents = [...this.classRoster];
      } else {
        this.filteredStudents = this.classRoster.filter(st => {
          const full = `ph ${st.name}`.toLowerCase();
          return full.includes(this.searchKeyword);
        });
      }
      this.renderContactsList();
    }

    // --------------------------------------------------------------------------
    // 5. CHAT & CONVERSATION SIMULATION
    // --------------------------------------------------------------------------
    openChatWithStudent(student, autoCall = false) {
      this.selectedStudent = student;
      this.state = 'ZALO_CHAT';

      // Update UI selection
      this.container.querySelectorAll('.cg-contact-row').forEach(r => {
        if (r.getAttribute('data-name') === student.name) {
          r.classList.add('cg-contact-row--active');
          r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          r.classList.remove('cg-contact-row--active');
        }
      });

      // Switch pane
      this.container.querySelector('#cg-welcome-screen').style.display = 'none';
      const chatScreen = this.container.querySelector('#cg-chat-screen');
      chatScreen.style.display = 'flex';

      // Update Header
      const col = getAvatarColor(student.name);
      const initials = getInitials(student.name);
      const hAvatar = this.container.querySelector('#cg-chat-header-avatar');
      const hName = this.container.querySelector('#cg-chat-header-name');
      hAvatar.style.background = col.bg;
      hAvatar.textContent = initials;
      hName.textContent = `PH ${student.name}`;

      // Populate Initial Messages History
      const msgBody = this.container.querySelector('#cg-messages-body');
      msgBody.innerHTML = `
        <!-- Timestamp yesterday -->
        <div style="align-self: center; background: #e2e8f0; color: #64748b; font-size: 11px; padding: 3px 12px; border-radius: 12px; margin: 4px 0;">
          Hôm qua
        </div>

        <!-- Yesterday messages -->
        <div style="display: flex; gap: 10px; max-width: 75%; align-self: flex-start;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${col.bg}; color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${initials}
          </div>
          <div style="background: #ffffff; border-radius: 12px; border-top-left-radius: 2px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; color: #1e293b;">
            Gia đình cảm ơn ${this.teacherRoleName}, có việc gì cô cứ nhắn cho gia đình ạ.
            <div style="font-size: 10px; color: #94a3b8; text-align: right; margin-top: 4px;">20:12</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; max-width: 75%; align-self: flex-end; flex-direction: row-reverse;">
          <div style="background: #e0f2fe; border-radius: 12px; border-top-right-radius: 2px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; color: #0369a1;">
            Dạ vâng, em cảm ơn anh/chị ạ.
            <div style="font-size: 10px; color: #0284c7; text-align: right; margin-top: 4px;">21:16 · Đã xem</div>
          </div>
        </div>

        <!-- Timestamp Today -->
        <div style="align-self: center; background: #e2e8f0; color: #64748b; font-size: 11px; padding: 3px 12px; border-radius: 12px; margin: 8px 0;">
          Hôm nay
        </div>
      `;

      if (autoCall) {
        this.runDramaticTypingSequence(student);
      }
    }

    // Kịch bản tự động gõ tin nhắn kịch tính như video mẫu
    runDramaticTypingSequence(student) {
      if (this.typingTimer) clearTimeout(this.typingTimer);

      const msgBody = this.container.querySelector('#cg-messages-body');
      const typingPreview = this.container.querySelector('#cg-typing-text');
      const typingCursor = this.container.querySelector('#cg-typing-cursor');
      const firstName = getFirstName(student.name);

      const messagesToSend = [
        `Em chào anh/chị ạ. Em là ${this.teacherRoleName} ở trường của em ${firstName} ạ.`,
        `Nhà trường đang tổng hợp tình hình học tập trên lớp, em cần trao đổi với gia đình về em ${firstName}.`,
        `Không biết lúc này anh/chị có tiện nghe điện thoại không ạ?`
      ];

      let msgIndex = 0;

      const appendTeacherMessage = (text) => {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display: flex; gap: 10px; max-width: 75%; align-self: flex-end; flex-direction: row-reverse; animation: fadeIn 0.25s ease;';
        bubble.innerHTML = `
          <div style="background: #e0f2fe; border-radius: 12px; border-top-right-radius: 2px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; color: #0369a1;">
            ${text}
            <div style="font-size: 10px; color: #0284c7; text-align: right; margin-top: 4px;">11:25 · Đã xem</div>
          </div>
        `;
        msgBody.appendChild(bubble);
        msgBody.scrollTop = msgBody.scrollHeight;
        this.audio.playMessageSent();
      };

      const appendParentReply = (text) => {
        const col = getAvatarColor(student.name);
        const initials = getInitials(student.name);
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display: flex; gap: 10px; max-width: 75%; align-self: flex-start; animation: fadeIn 0.25s ease;';
        bubble.innerHTML = `
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${col.bg}; color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${initials}
          </div>
          <div style="background: #ffffff; border-radius: 12px; border-top-left-radius: 2px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; color: #1e293b;">
            ${text}
            <div style="font-size: 10px; color: #94a3b8; text-align: right; margin-top: 4px;">11:25</div>
          </div>
        `;
        msgBody.appendChild(bubble);
        msgBody.scrollTop = msgBody.scrollHeight;
        this.audio.playMessageReceived();
      };

      const typeNextMessage = () => {
        if (msgIndex >= messagesToSend.length) {
          // Parent answers!
          setTimeout(() => {
            appendParentReply(`Dạ gia đình đang nghe đây ${this.teacherRoleName}.`);
            setTimeout(() => {
              appendParentReply(`Vâng, ${this.teacherRoleName} gọi cho tôi nhé.`);
              setTimeout(() => {
                appendTeacherMessage(`Dạ em cảm ơn anh/chị, em gọi ngay ạ.`);
                // Trigger Voice Call Dialog!
                setTimeout(() => {
                  this.startVoiceCall(student);
                }, 900);
              }, 600);
            }, 600);
          }, 800);
          return;
        }

        const fullText = messagesToSend[msgIndex];
        let charIdx = 0;
        typingCursor.style.display = 'inline-block';
        typingPreview.textContent = '';

        const typeChar = () => {
          if (charIdx < fullText.length) {
            typingPreview.textContent += fullText.charAt(charIdx);
            this.audio.playKeypress();
            charIdx++;
            this.typingTimer = setTimeout(typeChar, 25 + Math.random() * 25);
          } else {
            // Finished typing one message -> send it
            setTimeout(() => {
              appendTeacherMessage(fullText);
              typingPreview.textContent = 'Nhập @, tin nhắn tới phụ huynh...';
              typingCursor.style.display = 'none';
              msgIndex++;
              this.typingTimer = setTimeout(typeNextMessage, 500);
            }, 300);
          }
        };

        typeChar();
      };

      typeNextMessage();
    }

    // --------------------------------------------------------------------------
    // 6. VOICE CALL & RINGING
    // --------------------------------------------------------------------------
    startVoiceCall(student) {
      this.selectedStudent = student;
      this.state = 'CALLING';

      const col = getAvatarColor(student.name);
      const initials = getInitials(student.name);

      const dialog = this.container.querySelector('#cg-call-dialog');
      const callAvatar = this.container.querySelector('#cg-call-avatar');
      const callName = this.container.querySelector('#cg-call-name');
      const callStatus = this.container.querySelector('#cg-call-status');

      callAvatar.style.background = col.bg;
      callAvatar.textContent = initials;
      callName.textContent = `PH ${student.name}`;
      callStatus.textContent = 'Đang đổ chuông...';
      callStatus.style.color = '#38bdf8';

      dialog.style.display = 'flex';
      this.audio.startRingtone();

      // Ring for 3.5s then pick up
      if (this.callTimer) clearTimeout(this.callTimer);
      this.callTimer = setTimeout(() => {
        this.connectCallImmediately();
      }, 3500);
    }

    connectCallImmediately() {
      if (this.callTimer) {
        clearTimeout(this.callTimer);
        this.callTimer = null;
      }
      this.audio.stopRingtone();
      this.audio.playConnected();

      const callStatus = this.container.querySelector('#cg-call-status');
      callStatus.textContent = '00:01';
      callStatus.style.color = '#22c55e';

      setTimeout(() => {
        this.showResultModal(this.selectedStudent);
      }, 700);
    }

    // --------------------------------------------------------------------------
    // 7. RESULT REVEAL MODAL
    // --------------------------------------------------------------------------
    showResultModal(student) {
      this.state = 'REVEAL';
      this.container.querySelector('#cg-call-dialog').style.display = 'none';

      const modal = this.container.querySelector('#cg-result-modal');
      const roleEl = this.container.querySelector('#cg-result-role');
      const nameEl = this.container.querySelector('#cg-result-name');

      // Randomly pick "MẸ EM ĐÃ BẮT MÁY" or "BỐ EM ĐÃ BẮT MÁY"
      const parentRoles = ['MẸ EM ĐÃ BẮT MÁY', 'BỐ EM ĐÃ BẮT MÁY'];
      roleEl.textContent = parentRoles[Math.floor(Math.random() * parentRoles.length)];
      nameEl.textContent = student.name;

      modal.style.display = 'flex';
      this.audio.playVictory();
    }

    // --------------------------------------------------------------------------
    // 8. RANDOM PICKER TRIGGER
    // --------------------------------------------------------------------------
    triggerRandomCall() {
      if (this.classRoster.length === 0) return;

      this.audio.playClick();
      // Ensure we are inside Zalo
      if (this.state === 'DESKTOP' || this.state === 'SPLASH') {
        this.launchZaloApp();
        setTimeout(() => this.triggerRandomCall(), 1400);
        return;
      }

      // Pick a random student
      const randomIndex = Math.floor(Math.random() * this.classRoster.length);
      const student = this.classRoster[randomIndex];

      // Close previous modals if open
      this.container.querySelector('#cg-result-modal').style.display = 'none';
      this.container.querySelector('#cg-call-dialog').style.display = 'none';

      // Open chat and trigger typing + call
      this.openChatWithStudent(student, true);
    }

    // Fast forward shortcut for tests
    fastForward() {
      if (this.state === 'CALLING') {
        this.connectCallImmediately();
      } else if (this.state === 'ZALO_CHAT') {
        if (this.typingTimer) clearTimeout(this.typingTimer);
        this.startVoiceCall(this.selectedStudent);
      } else {
        this.triggerRandomCall();
      }
    }

    getState() {
      return this.state;
    }

    destroy() {
      if (this.typingTimer) clearTimeout(this.typingTimer);
      if (this.callTimer) clearTimeout(this.callTimer);
      this.audio.stopRingtone();
      window.removeEventListener('keydown', this.keyHandler);
      this.container.innerHTML = '';
    }
  }

  // ----------------------------------------------------------------------------
  // 9. GLOBAL LAUNCHER REGISTRATION
  // ----------------------------------------------------------------------------
  global.launchCoGoiVeNha = function (container, options = {}) {
    const game = new CoGoiVeNhaGame(container, options);
    window.__currentCoGoiVeNhaInstance = game;
    return () => {
      game.destroy();
      window.__currentCoGoiVeNhaInstance = null;
    };
  };

})(typeof window !== 'undefined' ? window : this);
