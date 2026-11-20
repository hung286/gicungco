/**
 * TRANH BẾP CUNG TRĂNG (PomyAI Festival Game)
 * Battle Cooking Game: Đội A vs Đội B thi làm bánh Trung Thu rằm tháng tám
 * 2 teams take turns claiming ingredients from a shared pantry (Kho nguyên liệu chung)
 * by answering multiple-choice questions.
 */
(function() {
  'use strict';

  // Recipe catalog
  const RECIPES = {
    nuong_thapcam: {
      id: 'nuong_thapcam',
      name: 'Bánh nướng thập cẩm',
      type: 'nuong',
      icon: 'assets/cake_nuong_thapcam.png',
      ingredients: ['bot_mi', 'nuoc_duong', 'hat_thap_cam', 'trung_muoi']
    },
    nuong_dauxanh: {
      id: 'nuong_dauxanh',
      name: 'Bánh nướng đậu xanh',
      type: 'nuong',
      icon: 'assets/cake_nuong_dauxanh.png',
      ingredients: ['bot_mi', 'nuoc_duong', 'dau_xanh', 'trung_muoi']
    },
    nuong_hatsen: {
      id: 'nuong_hatsen',
      name: 'Bánh nướng hạt sen',
      type: 'nuong',
      icon: 'assets/cake_nuong_hatsen.png',
      ingredients: ['bot_mi', 'nuoc_duong', 'hat_sen', 'trung_muoi']
    },
    deo_hatsen: {
      id: 'deo_hatsen',
      name: 'Bánh dẻo hạt sen',
      type: 'deo',
      icon: 'assets/cake_deo_hatsen.png',
      ingredients: ['bot_nep', 'nuoc_duong', 'hat_sen', 'dua']
    },
    tra_xanh: {
      id: 'tra_xanh',
      name: 'Bánh trà xanh',
      type: 'tra_xanh',
      icon: 'assets/cake_tra_xanh.png',
      ingredients: ['bot_nep', 'nuoc_duong', 'tra_xanh', 'dau_xanh']
    },
    deo_khoaimon: {
      id: 'deo_khoaimon',
      name: 'Bánh dẻo khoai môn',
      type: 'deo',
      icon: 'assets/cake_deo_khoaimon.png',
      ingredients: ['bot_nep', 'nuoc_duong', 'khoai_mon', 'dua']
    }
  };

  const INGREDIENTS = {
    bot_mi: { id: 'bot_mi', name: 'Bột mì', icon: 'assets/bot_mi.png' },
    bot_nep: { id: 'bot_nep', name: 'Bột nếp', icon: 'assets/bot_nep.png' },
    nuoc_duong: { id: 'nuoc_duong', name: 'Nước đường', icon: 'assets/nuoc_duong.png' },
    trung_muoi: { id: 'trung_muoi', name: 'Trứng muối', icon: 'assets/trung_muoi.png' },
    hat_sen: { id: 'hat_sen', name: 'Hạt sen', icon: 'assets/hat_sen.png' },
    dau_xanh: { id: 'dau_xanh', name: 'Đậu xanh', icon: 'assets/dau_xanh.png' },
    hat_thap_cam: { id: 'hat_thap_cam', name: 'Hạt thập cẩm', icon: 'assets/hat_thap_cam.png' },
    dua: { id: 'dua', name: 'Dừa', icon: 'assets/dua.png' },
    tra_xanh: { id: 'tra_xanh', name: 'Trà xanh', icon: 'assets/tra_xanh.png' },
    khoai_mon: { id: 'khoai_mon', name: 'Khoai môn', icon: 'assets/khoai_mon.png' }
  };

  const PANTRY_LAYOUT = [
    'bot_mi', 'bot_nep', 'nuoc_duong', 'trung_muoi', 'hat_sen',
    'dau_xanh', 'hat_thap_cam', 'dua', 'tra_xanh', 'khoai_mon'
  ];

  const DEFAULT_QUESTIONS = [
    { question: 'Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?', options: ['28 ngày', '30 ngày', '31 ngày', '34 ngày'], answer: 2 },
    { question: 'Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?', options: ['39', '29', '45', '49'], answer: 0 },
    { question: 'Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?', options: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'], answer: 1 },
    { question: 'Bánh nướng truyền thống thường có nhân gì đặc trưng?', options: ['Thập cẩm trứng muối', 'Phô mai', 'Chocolate', 'Dâu tây'], answer: 0 },
    { question: 'Hình ảnh nào gắn liền với đêm rằm Trung Thu cổ truyền?', options: ['Chú Cuội, Cây Đa, Chị Hằng', 'Ông già Noel', 'Bánh Chưng', 'Hoa Đào'], answer: 0 },
    { question: 'Số liền sau của số lớn nhất có 2 chữ số khác nhau là số nào?', options: ['98', '99', '100', '97'], answer: 1 },
    { question: 'Đèn lồng truyền thống Trung Thu thường có hình con vật gì?', options: ['Cá chép', 'Cá mập', 'Hổ vằn', 'Đại bàng'], answer: 0 },
    { question: 'Lớp 3A có 36 học sinh chia đều thành 4 tổ. Hỏi mỗi tổ có bao nhiêu học sinh?', options: ['7 bạn', '8 bạn', '9 bạn', '10 bạn'], answer: 2 },
    { question: 'Bánh dẻo Trung Thu thường có màu gì chủ đạo?', options: ['Màu trắng', 'Màu vàng sẫm', 'Màu nâu', 'Màu đỏ sẫm'], answer: 0 },
    { question: '7 gấp lên 8 lần rồi bớt đi 6 thì được kết quả là:', options: ['50', '52', '56', '48'], answer: 0 },
    { question: 'Vị ngọt thanh và bùi của bánh dẻo thường đến từ hạt gì?', options: ['Hạt sen', 'Hạt ổi', 'Hạt tiêu', 'Hạt mít'], answer: 0 },
    { question: 'Quả nào sau đây là đặc sản mùa thu thường bày mâm cỗ Trung Thu?', options: ['Quả bưởi', 'Quả dưa hấu', 'Quả sầu riêng', 'Quả dứa'], answer: 0 }
  ];

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function soundClick() { playTone(540, 'triangle', 0.08, 0.1); }
  function soundTurn() {
    playTone(440, 'sine', 0.1, 0.15);
    setTimeout(() => playTone(660, 'sine', 0.18, 0.18), 100);
  }
  function soundSuccess() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => playTone(f, 'triangle', 0.22, 0.2), i * 80);
    });
  }
  function soundWrong() {
    playTone(220, 'sawtooth', 0.25, 0.2);
    setTimeout(() => playTone(180, 'sawtooth', 0.3, 0.2), 150);
  }
  function soundFanfare() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.35, 0.22), i * 110);
    });
  }

  class TranhBepCungTrangGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.baseAssetUrl = options.baseAssetUrl || '/ey/games/tranh-bep/';
      this.onExit = options.onExit || (() => {});
      
      this.teamACake = 'nuong_thapcam';
      this.teamBCake = 'deo_hatsen';
      
      this.currentTurn = 'A'; // 'A' or 'B'
      this.pantryState = {}; // id -> { available: true/false, owner: 'A'|'B'|null }
      PANTRY_LAYOUT.forEach(id => {
        this.pantryState[id] = { available: true, owner: null };
      });

      this.collectedA = [];
      this.collectedB = [];
      this.blockedA = []; // items A took that B needed
      this.blockedB = []; // items B took that A needed

      this.questionList = (options.session && options.session.questionList && options.session.questionList.length > 0)
        ? JSON.parse(JSON.stringify(options.session.questionList))
        : JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
      
      this.currentQIndex = 0;
      this.activeItem = null;
      this.timerInterval = null;
      this.timeLeft = 30;
      this.gameState = 'lobby'; // 'lobby' | 'playing' | 'question' | 'gameover'
      this.isSoundOn = true;

      this.init();
    }

    asset(path) {
      return (this.baseAssetUrl + path).replace('//', '/');
    }

    init() {
      this.resizeHandler = this.onResize.bind(this);
      window.addEventListener('resize', this.resizeHandler);
      this.render();
      this.onResize();
    }

    onResize() {
      const board = this.container.querySelector('.tb-board');
      if (!board) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / 1280, h / 720);
      board.style.transform = `scale(${Math.max(0.45, Math.min(scale, 1.25))})`;
    }

    render() {
      this.container.innerHTML = `
        <div class="tb-fullscreen-root" style="
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: #0d0918 url('${this.asset('assets/bg.jpg')}') center/cover no-repeat;
          z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif; color: #fff; overflow: hidden; user-select: none;">
          
          <div class="tb-top-nav" style="position: absolute; top: 14px; left: 24px; right: 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 20px;">🥮</span>
              <span style="font-size: 16px; font-weight: 700; color: #f6c86a; letter-spacing: 0.5px;">Bếp Trăng Rằm</span>
              <span style="background: rgba(255,255,255,0.12); padding: 3px 10px; border-radius: 99px; font-size: 12px; color: #ddd;">Tranh Bếp Cung Trăng</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="tb-btn-sound" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 14px;">🔊</button>
              <button class="tb-btn-exit" style="background: #e11d48; border: none; color: #fff; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Kết thúc</button>
            </div>
          </div>

          <div class="tb-board" style="
            width: 1240px; height: 680px; position: relative;
            transform-origin: center center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 50px;">
            <div class="tb-content-area" style="width: 100%; height: 100%;"></div>
          </div>
        </div>
      `;

      this.container.querySelector('.tb-btn-sound').addEventListener('click', () => {
        this.isSoundOn = !this.isSoundOn;
        this.container.querySelector('.tb-btn-sound').textContent = this.isSoundOn ? '🔊' : '🔇';
      });

      this.container.querySelector('.tb-btn-exit').addEventListener('click', () => {
        if (this.container.querySelector('.tb-modal-confirm')) return;
        const modal = document.createElement('div');
        modal.className = 'tb-modal-confirm';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(8,6,20,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
          <div style="background:#1e183a;border:1px solid rgba(255,215,0,0.3);border-radius:16px;padding:28px 32px;text-align:center;max-width:380px;box-shadow:0 12px 40px rgba(0,0,0,0.7);">
            <h3 style="color:#fff;font-size:22px;margin:0 0 16px 0;">Kết thúc ván?</h3>
            <p style="color:#cbd5e1;font-size:14px;margin:0 0 24px 0;">Bạn có chắc muốn thoát khỏi Tranh Bếp Cung Trăng?</p>
            <div style="display:flex;gap:12px;justify-content:center;">
              <button id="tb-confirm-no" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:10px 22px;border-radius:10px;font-weight:700;cursor:pointer;">Chơi tiếp</button>
              <button id="tb-confirm-yes" style="background:#e11d48;border:none;color:#fff;padding:10px 22px;border-radius:10px;font-weight:700;cursor:pointer;">Kết thúc</button>
            </div>
          </div>
        `;
        this.container.appendChild(modal);
        modal.querySelector('#tb-confirm-no').onclick = () => modal.remove();
        modal.querySelector('#tb-confirm-yes').onclick = () => {
          modal.remove();
          this.destroy();
          if (typeof this.onExit === 'function') this.onExit();
        };
      });

      this.renderContent();
    }

    renderContent() {
      const area = this.container.querySelector('.tb-content-area');
      if (!area) return;

      if (this.gameState === 'lobby') {
        this.renderLobby(area);
      } else if (this.gameState === 'playing' || this.gameState === 'question') {
        this.renderGame(area);
      } else if (this.gameState === 'gameover') {
        this.renderGameOver(area);
      }
    }

    renderLobby(area) {
      area.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
          <div style="background: rgba(18, 14, 34, 0.94); border: 1px solid rgba(255, 215, 0, 0.25); box-shadow: 0 16px 40px rgba(0,0,0,0.6); border-radius: 20px; padding: 32px 40px; width: 880px; text-align: center;">
            <div style="font-size: 13px; color: #eab308; letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">BẾP TRĂNG RẰM</div>
            <h1 style="font-size: 32px; font-weight: 800; color: #fff; margin: 6px 0 16px 0; font-family: serif;">Thiết lập ván đấu</h1>
            <div style="width: 40px; height: 1px; background: rgba(255,215,0,0.4); margin: 0 auto 24px auto;"></div>

            <!-- Team A Selection -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="background: #2563eb; color: #fff; padding: 2px 12px; border-radius: 6px; font-weight: 700; font-size: 14px;">Đội A</span>
                <span style="color: #94a3b8; font-size: 13px;">chọn món thi bánh Trung Thu</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" id="tb-team-a-cakes">
                ${Object.values(RECIPES).map(r => `
                  <div class="tb-cake-opt ${r.id === this.teamACake ? 'selected-a' : ''}" data-team="A" data-id="${r.id}" style="
                    background: ${r.id === this.teamACake ? 'rgba(37, 99, 235, 0.28)' : 'rgba(255,255,255,0.04)'};
                    border: 1px solid ${r.id === this.teamACake ? '#3b82f6' : 'rgba(255,255,255,0.1)'};
                    border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;">
                    <img src="${this.asset(r.icon)}" style="width: 38px; height: 38px; object-fit: contain;">
                    <span style="font-size: 14px; font-weight: 600; color: #fff;">${r.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Team B Selection -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(225, 29, 72, 0.4); border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="background: #e11d48; color: #fff; padding: 2px 12px; border-radius: 6px; font-weight: 700; font-size: 14px;">Đội B</span>
                <span style="color: #94a3b8; font-size: 13px;">chọn món thi bánh Trung Thu</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" id="tb-team-b-cakes">
                ${Object.values(RECIPES).map(r => `
                  <div class="tb-cake-opt ${r.id === this.teamBCake ? 'selected-b' : ''}" data-team="B" data-id="${r.id}" style="
                    background: ${r.id === this.teamBCake ? 'rgba(225, 29, 72, 0.28)' : 'rgba(255,255,255,0.04)'};
                    border: 1px solid ${r.id === this.teamBCake ? '#f43f5e' : 'rgba(255,255,255,0.1)'};
                    border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;">
                    <img src="${this.asset(r.icon)}" style="width: 38px; height: 38px; object-fit: contain;">
                    <span style="font-size: 14px; font-weight: 600; color: #fff;">${r.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <button id="tb-btn-start" style="
              background: linear-gradient(180deg, #fce07a 0%, #dfa527 100%);
              border: none; color: #1e1b4b; font-size: 18px; font-weight: 800; padding: 12px 48px; border-radius: 99px; cursor: pointer;
              box-shadow: 0 4px 16px rgba(223, 165, 39, 0.4); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.15s;">
              ▶ BẮT ĐẦU
            </button>
          </div>
        </div>
      `;

      area.querySelectorAll('.tb-cake-opt').forEach(el => {
        el.addEventListener('click', () => {
          soundClick();
          const team = el.getAttribute('data-team');
          const id = el.getAttribute('data-id');
          if (team === 'A') {
            if (id === this.teamBCake) return; // cannot pick same cake
            this.teamACake = id;
          } else {
            if (id === this.teamACake) return;
            this.teamBCake = id;
          }
          this.renderLobby(area);
        });
      });

      area.querySelector('#tb-btn-start').addEventListener('click', () => {
        soundTurn();
        this.gameState = 'playing';
        this.renderContent();
      });
    }

    renderGame(area) {
      const cakeA = RECIPES[this.teamACake];
      const cakeB = RECIPES[this.teamBCake];
      const activeQ = this.questionList[this.currentQIndex % this.questionList.length];

      area.innerHTML = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%;">
          
          <!-- Top Question / Turn Header -->
          <div style="width: 100%; min-height: 90px; margin-bottom: 12px; display: flex; justify-content: center;">
            ${this.gameState === 'question' ? `
              <div style="background: rgba(18, 14, 34, 0.95); border: 1px solid rgba(255, 215, 0, 0.35); border-radius: 16px; padding: 14px 24px; width: 100%; display: flex; flex-direction: column; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: #eab308; color: #1e1b4b; font-weight: 800; font-size: 13px; padding: 2px 10px; border-radius: 6px;">CÂU ${this.currentQIndex + 1}</span>
                    <span style="font-size: 17px; font-weight: 700; color: #fff;">${activeQ.question}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: #10b981; color: #fff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px;" id="tb-timer-badge">${this.timeLeft}</div>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                  ${activeQ.options.map((opt, idx) => `
                    <button class="tb-opt-btn" data-index="${idx}" style="
                      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; padding: 8px 12px;
                      color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; transition: all 0.15s;">
                      <span style="color: #eab308; font-weight: 800; margin-right: 6px;">${['A', 'B', 'C', 'D'][idx]}.</span> ${opt}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="background: rgba(18, 14, 34, 0.85); border: 1px solid ${this.currentTurn === 'A' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(225, 29, 72, 0.5)'}; border-radius: 14px; padding: 12px 32px; display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 20px;">${this.currentTurn === 'A' ? '🔵' : '🔴'}</span>
                <span style="font-size: 20px; font-weight: 800; color: ${this.currentTurn === 'A' ? '#60a5fa' : '#fb7185'}; font-style: italic;">
                  Đội ${this.currentTurn}
                </span>
                <span style="font-size: 18px; font-weight: 600; color: #fff;">chọn 1 nguyên liệu trong kho</span>
              </div>
            `}
          </div>

          <!-- Main 3-Column Arena -->
          <div style="display: grid; grid-template-columns: 280px 1fr 280px; gap: 18px; flex: 1;">
            
            <!-- Column 1: Table Đội A -->
            <div style="background: rgba(18, 14, 34, 0.9); border: 1px solid ${this.currentTurn === 'A' ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: ${this.currentTurn === 'A' ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'};">
              <div>
                <div style="font-size: 11px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">BÀN BẾP I</div>
                <div style="font-size: 24px; font-weight: 800; color: #60a5fa; margin-bottom: 12px;">Đội A</div>
                
                <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                  <img src="${this.asset(cakeA.icon)}" style="width: 44px; height: 44px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #eab308; font-weight: 700; text-transform: uppercase;">MÓN THI</div>
                    <div style="font-size: 14px; font-weight: 700; color: #fff;">${cakeA.name}</div>
                  </div>
                </div>

                <!-- 4 Slots (2x2) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  ${cakeA.ingredients.map(ingId => {
                    const ing = INGREDIENTS[ingId];
                    const isCollected = this.collectedA.includes(ingId);
                    return `
                      <div style="
                        background: ${isCollected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)'};
                        border: 1px ${isCollected ? 'solid #3b82f6' : 'dashed rgba(255,255,255,0.18)'};
                        border-radius: 12px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <img src="${this.asset(ing.icon)}" style="
                          width: 58px; height: 58px; object-fit: contain;
                          filter: ${isCollected ? 'none' : 'grayscale(100%) opacity(25%)'}; transition: all 0.3s;">
                        <span style="font-size: 12px; color: ${isCollected ? '#93c5fd' : '#64748b'}; margin-top: 6px; font-weight: 600;">${ing.name}</span>
                        ${isCollected ? '<span style="position: absolute; top: 6px; right: 6px; color: #22c55e; font-size: 14px;">✓</span>' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Teacher Quick Scoring for A -->
              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="tb-btn-score-a-correct" style="flex: 1; background: #059669; border: none; color: #fff; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">✓ Đúng</button>
                <button class="tb-btn-score-a-wrong" style="flex: 1; background: #881337; border: none; color: #fff; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">✗ Sai</button>
              </div>
            </div>

            <!-- Column 2: Shared Pantry (Kho nguyên liệu chung) -->
            <div style="background: rgba(18, 14, 34, 0.88); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="text-align: center;">
                <div style="font-size: 11px; letter-spacing: 2px; color: #eab308; font-weight: 700;">TẾT TRUNG THU · RẰM THÁNG TÁM</div>
                <h2 style="font-size: 24px; font-weight: 800; color: #fef08a; margin: 4px 0 16px 0; font-family: serif;">Kho nguyên liệu chung</h2>
                <div style="width: 32px; height: 1px; background: rgba(255,215,0,0.3); margin: 0 auto 16px auto;"></div>

                <!-- 2x5 Grid of 10 Ingredients -->
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 10px;">
                  ${PANTRY_LAYOUT.map(id => {
                    const ing = INGREDIENTS[id];
                    const item = this.pantryState[id];
                    const isTaken = !item.available;
                    return `
                      <div class="tb-pantry-card ${isTaken ? 'taken' : 'available'}" data-id="${id}" style="
                        background: ${isTaken ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.04)'};
                        border: 1px solid ${isTaken ? 'rgba(255,255,255,0.06)' : 'rgba(255, 215, 0, 0.3)'};
                        border-radius: 12px; height: 115px; display: flex; flex-direction: column; align-items: center; justify-content: center;
                        cursor: ${isTaken || this.gameState === 'question' ? 'default' : 'pointer'};
                        position: relative; transition: all 0.2s;">
                        ${!isTaken ? `
                          <img src="${this.asset(ing.icon)}" style="width: 60px; height: 60px; object-fit: contain;">
                          <span style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 6px;">${ing.name}</span>
                        ` : `
                          <span style="font-size: 11px; color: #64748b; font-weight: 600;">Đã lấy</span>
                          <span style="font-size: 12px; font-weight: 800; color: ${item.owner === 'A' ? '#60a5fa' : '#fb7185'};">
                            ${item.owner ? 'Đội ' + item.owner : ''}
                          </span>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Bottom Helper Note -->
              <div style="text-align: center; color: #94a3b8; font-size: 12px; font-style: italic; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
                Mỗi món chỉ có một – lấy trước món đối thủ cần để chặn đường
              </div>
            </div>

            <!-- Column 3: Table Đội B -->
            <div style="background: rgba(18, 14, 34, 0.9); border: 1px solid ${this.currentTurn === 'B' ? '#e11d48' : 'rgba(225, 29, 72, 0.3)'}; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: ${this.currentTurn === 'B' ? '0 0 20px rgba(225, 29, 72, 0.3)' : 'none'};">
              <div>
                <div style="font-size: 11px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">BÀN BẾP II</div>
                <div style="font-size: 24px; font-weight: 800; color: #fb7185; margin-bottom: 12px;">Đội B</div>
                
                <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                  <img src="${this.asset(cakeB.icon)}" style="width: 44px; height: 44px; object-fit: contain;">
                  <div>
                    <div style="font-size: 11px; color: #eab308; font-weight: 700; text-transform: uppercase;">MÓN THI</div>
                    <div style="font-size: 14px; font-weight: 700; color: #fff;">${cakeB.name}</div>
                  </div>
                </div>

                <!-- 4 Slots (2x2) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  ${cakeB.ingredients.map(ingId => {
                    const ing = INGREDIENTS[ingId];
                    const isCollected = this.collectedB.includes(ingId);
                    return `
                      <div style="
                        background: ${isCollected ? 'rgba(225, 29, 72, 0.2)' : 'rgba(255,255,255,0.02)'};
                        border: 1px ${isCollected ? 'solid #f43f5e' : 'dashed rgba(255,255,255,0.18)'};
                        border-radius: 12px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <img src="${this.asset(ing.icon)}" style="
                          width: 58px; height: 58px; object-fit: contain;
                          filter: ${isCollected ? 'none' : 'grayscale(100%) opacity(25%)'}; transition: all 0.3s;">
                        <span style="font-size: 12px; color: ${isCollected ? '#fca5a5' : '#64748b'}; margin-top: 6px; font-weight: 600;">${ing.name}</span>
                        ${isCollected ? '<span style="position: absolute; top: 6px; right: 6px; color: #22c55e; font-size: 14px;">✓</span>' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Teacher Quick Scoring for B -->
              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="tb-btn-score-b-correct" style="flex: 1; background: #059669; border: none; color: #fff; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">✓ Đúng</button>
                <button class="tb-btn-score-b-wrong" style="flex: 1; background: #881337; border: none; color: #fff; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">✗ Sai</button>
              </div>
            </div>

          </div>
        </div>
      `;

      // Event: click pantry item
      area.querySelectorAll('.tb-pantry-card.available').forEach(el => {
        el.addEventListener('click', () => {
          if (this.gameState === 'question') return;
          const id = el.getAttribute('data-id');
          this.triggerQuestion(id);
        });
      });

      // Event: question options
      if (this.gameState === 'question') {
        area.querySelectorAll('.tb-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            this.handleAnswer(idx);
          });
        });
      }

      // Teacher scoring events
      const btnAOk = area.querySelector('.tb-btn-score-a-correct');
      const btnANo = area.querySelector('.tb-btn-score-a-wrong');
      const btnBOk = area.querySelector('.tb-btn-score-b-correct');
      const btnBNo = area.querySelector('.tb-btn-score-b-wrong');

      if (btnAOk) btnAOk.addEventListener('click', () => this.handleTeacherScore('A', true));
      if (btnANo) btnANo.addEventListener('click', () => this.handleTeacherScore('A', false));
      if (btnBOk) btnBOk.addEventListener('click', () => this.handleTeacherScore('B', true));
      if (btnBNo) btnBNo.addEventListener('click', () => this.handleTeacherScore('B', false));
    }

    triggerQuestion(itemId) {
      soundClick();
      this.activeItem = itemId;
      this.gameState = 'question';
      this.timeLeft = 30;
      this.startTimer();
      this.renderContent();
    }

    startTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        const badge = this.container.querySelector('#tb-timer-badge');
        if (badge) {
          badge.textContent = this.timeLeft;
          if (this.timeLeft <= 5) badge.style.background = '#e11d48';
        }
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
      }, 1000);
    }

    handleAnswer(chosenIdx) {
      clearInterval(this.timerInterval);
      const activeQ = this.questionList[this.currentQIndex % this.questionList.length];
      const isCorrect = chosenIdx === activeQ.answer;
      this.processResult(isCorrect);
    }

    handleTeacherScore(team, isCorrect) {
      clearInterval(this.timerInterval);
      if (this.currentTurn !== team) {
        // Teacher scored directly for team
        this.currentTurn = team;
      }
      this.processResult(isCorrect);
    }

    handleTimeout() {
      this.processResult(false);
    }

    processResult(isCorrect) {
      const activeTeam = this.currentTurn;
      const otherTeam = activeTeam === 'A' ? 'B' : 'A';
      const cake = RECIPES[activeTeam === 'A' ? this.teamACake : this.teamBCake];
      const otherCake = RECIPES[otherTeam === 'A' ? this.teamACake : this.teamBCake];

      if (isCorrect) {
        soundSuccess();
        if (this.activeItem) {
          this.pantryState[this.activeItem].available = false;
          this.pantryState[this.activeItem].owner = activeTeam;

          if (cake.ingredients.includes(this.activeItem)) {
            if (activeTeam === 'A') this.collectedA.push(this.activeItem);
            else this.collectedB.push(this.activeItem);
          } else if (otherCake.ingredients.includes(this.activeItem)) {
            // Blocked item
            if (activeTeam === 'A') this.blockedA.push(this.activeItem);
            else this.blockedB.push(this.activeItem);
          }
        }
      } else {
        soundWrong();
      }

      this.currentQIndex++;
      this.activeItem = null;
      this.gameState = 'playing';

      // Check win condition
      if (this.checkGameOver()) {
        this.gameState = 'gameover';
        soundFanfare();
        this.renderContent();
        return;
      }

      // Turn passes to next team
      this.currentTurn = otherTeam;
      this.renderContent();
    }

    checkGameOver() {
      const cakeA = RECIPES[this.teamACake];
      const cakeB = RECIPES[this.teamBCake];
      
      const finishedA = cakeA.ingredients.every(id => this.collectedA.includes(id));
      const finishedB = cakeB.ingredients.every(id => this.collectedB.includes(id));

      if (finishedA || finishedB) return true;

      // Or pantry is empty
      const remaining = Object.values(this.pantryState).filter(p => p.available).length;
      return remaining === 0;
    }

    renderGameOver(area) {
      const cakeA = RECIPES[this.teamACake];
      const cakeB = RECIPES[this.teamBCake];
      const scoreA = this.collectedA.length;
      const scoreB = this.collectedB.length;

      let winner = 'A';
      if (scoreB > scoreA) winner = 'B';
      else if (scoreA === scoreB) {
        if (this.blockedB.length > this.blockedA.length) winner = 'B';
        else winner = 'A';
      }

      const winCake = winner === 'A' ? cakeA : cakeB;

      area.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
          <div style="background: rgba(18, 14, 34, 0.95); border: 1px solid rgba(255, 215, 0, 0.4); box-shadow: 0 16px 50px rgba(0,0,0,0.7); border-radius: 24px; padding: 36px 48px; width: 620px; text-align: center;">
            
            <!-- Glowing winner mooncake -->
            <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);"></div>
              <img src="${this.asset(winCake.icon)}" style="width: 100px; height: 100px; object-fit: contain; position: relative; z-index: 2;">
            </div>

            <div style="font-size: 13px; color: #eab308; letter-spacing: 2.5px; font-weight: 700; text-transform: uppercase;">QUÁN QUÂN ĐÊM RẰM</div>
            <h1 style="font-size: 42px; font-weight: 900; color: ${winner === 'A' ? '#60a5fa' : '#fb7185'}; margin: 4px 0 10px 0; font-family: serif;">Đội ${winner}</h1>
            <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 24px;">Gom được nhiều nguyên liệu nhất — Chiến thắng!</p>

            <!-- Leaderboard rankings -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
              <div style="background: rgba(255,255,255,0.05); border: 1px solid ${winner === 'A' ? '#3b82f6' : '#f43f5e'}; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="background: #eab308; color: #1e1b4b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">I</span>
                  <img src="${this.asset(winCake.icon)}" style="width: 32px; height: 32px; object-fit: contain;">
                  <div style="text-align: left;">
                    <div style="font-size: 15px; font-weight: 800; color: #fff;">Đội ${winner}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${winCake.name}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${(winner === 'A' ? this.collectedA : this.collectedB).map(id => `
                    <img src="${this.asset(INGREDIENTS[id].icon)}" style="width: 24px; height: 24px; object-fit: contain;">
                  `).join('')}
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="background: rgba(255,255,255,0.15); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">II</span>
                  <img src="${this.asset(winner === 'A' ? cakeB.icon : cakeA.icon)}" style="width: 32px; height: 32px; object-fit: contain;">
                  <div style="text-align: left;">
                    <div style="font-size: 15px; font-weight: 800; color: #cbd5e1;">Đội ${winner === 'A' ? 'B' : 'A'}</div>
                    <div style="font-size: 12px; color: #64748b;">${(winner === 'A' ? cakeB : cakeA).name}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${(winner === 'A' ? this.collectedB : this.collectedA).map(id => `
                    <img src="${this.asset(INGREDIENTS[id].icon)}" style="width: 24px; height: 24px; object-fit: contain;">
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 14px; justify-content: center;">
              <button id="tb-btn-replay" style="
                background: linear-gradient(180deg, #fce07a 0%, #dfa527 100%);
                border: none; color: #1e1b4b; font-size: 16px; font-weight: 800; padding: 12px 32px; border-radius: 99px; cursor: pointer;
                box-shadow: 0 4px 16px rgba(223, 165, 39, 0.4);">
                CHƠI LẠI
              </button>
              <button id="tb-btn-exit-done" style="
                background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 16px; font-weight: 700;
                padding: 12px 32px; border-radius: 99px; cursor: pointer;">
                VỀ DANH SÁCH
              </button>
            </div>

          </div>
        </div>
      `;

      area.querySelector('#tb-btn-replay').addEventListener('click', () => {
        soundClick();
        this.collectedA = [];
        this.collectedB = [];
        this.blockedA = [];
        this.blockedB = [];
        this.currentTurn = 'A';
        PANTRY_LAYOUT.forEach(id => {
          this.pantryState[id] = { available: true, owner: null };
        });
        this.gameState = 'lobby';
        this.renderContent();
      });

      area.querySelector('#tb-btn-exit-done').addEventListener('click', () => {
        this.destroy();
        this.onExit();
      });
    }

    destroy() {
      clearInterval(this.timerInterval);
      if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
      if (this.container) this.container.innerHTML = '';
    }
  }

  // Global launcher
  window.launchTranhBepCungTrangGame = function(containerOrSession, options = {}) {
    let container = containerOrSession;
    let finalOptions = options;

    if (!container || !container.appendChild) {
      finalOptions = Object.assign({}, containerOrSession, options);
      let el = document.getElementById('tranh-bep-game-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'tranh-bep-game-container';
        document.body.appendChild(el);
      }
      container = el;
    }

    const game = new TranhBepCungTrangGame(container, finalOptions);
    const cleanup = () => game.destroy();
    cleanup.destroy = cleanup;
    cleanup.game = game;
    return cleanup;
  };
})();
