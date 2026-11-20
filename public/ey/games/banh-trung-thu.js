/**
 * LÒ BÁNH TRUNG THU (PomyAI Festival Game)
 * Trò chơi gọi tên ngẫu nhiên theo cơ chế LOẠI TRỪ giống game gốc:
 *  - Màn mở đầu "Bắt đầu" -> đếm ngược 3, 2, 1, "SẴN SÀNG!"
 *  - Toàn bộ học sinh là bánh trong lò. Chị Hằng bay qua, vẽ vòng phép (vòng tím, nhãn đỏ)
 *    rồi hất văng từng cụm bánh (nhãn xanh, bánh xoay & bay đi).
 *  - Giai đoạn 1: còn 10 bánh -> phóng to. Giai đoạn 2: còn 3 bánh -> phóng to.
 *  - Giai đoạn 3: loại từng bánh, Chị Hằng "nhử" (vòng tím) rồi chốt (vòng vàng).
 *  - Bánh cuối cùng = em được gọi -> màn vinh danh (tia sáng xoay + vòng vàng) + "Gọi em tiếp theo".
 *  - Chuyển lượt: băng chuyền bánh chạy qua lò, bánh mới rơi xuống, tự động nướng tiếp.
 *  - Thanh trên: số lượt, x/N đã gọi, số bánh trong lò; Tạm dừng; Kết thúc (hỏi xác nhận) -> "Đã gọi tên".
 */
(function () {
  'use strict';

  const DEFAULT_STUDENTS = [
    'Phạm Gia Hưng', 'Lý Bảo Vy', 'Lê Phương Anh', 'Phạm Thùy Linh', 'Đặng Ngọc Diệp',
    'Lê Hoàng Phúc', 'Huỳnh Tấn Phát', 'Phạm Ngọc Mai', 'Hoàng Thu Hà', 'Lâm Khánh Linh',
    'Tạ Quang Vinh', 'Ngô Bảo Ngọc', 'Trần Bảo Châu', 'Phan Nhật Minh', 'Dương Thảo Nguyên',
    'Hồ Gia Bảo', 'Dương Anh Tuấn', 'Vũ Khánh Ngân', 'Nguyễn Trần Minh Thư', 'Đỗ Khánh Vân',
    'Trần Đức Long', 'Vũ Minh Quân', 'Võ Hoàng Long', 'Hoàng Đức Mạnh', 'Trịnh Mai Anh',
    'Mai Đức Anh', 'Đặng Quốc Phong', 'Phan Như Ý', 'Cao Thị Mỹ Duyên', 'Bùi Tiến Dũng',
    'Nguyễn Minh An', 'Ngô Phương Thảo', 'Võ Thanh Trúc', 'Hồ Thị Kim Chi', 'Huỳnh Ngọc Hân',
    'Chu Minh Khôi', 'Dương Thanh Tùng', 'Đỗ Hải Sơn', 'Lê Gia Huy', 'Bùi Thu Quỳnh',
    'Lý Hải Yến', 'Trịnh Quốc Bảo', 'Tô Hoài Nam', 'Đinh Tuấn Kiệt', 'Nguyễn Hoàng Yến'
  ];

  const CANCEL = { cancelled: true };
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------- AUDIO
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, type, dur, gain, slideTo) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      g.gain.setValueAtTime(gain || 0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------- STYLES
  const CSS = `
  .btt-root{position:fixed;inset:0;z-index:99999;overflow:hidden;user-select:none;color:#fff;
    font-family:'Baloo 2','Nunito','Segoe UI',system-ui,sans-serif;background:#060512;}
  .btt-bg{position:absolute;inset:0;background-size:cover;background-position:center bottom;transition:filter .5s;}
  .btt-sky{position:absolute;left:0;right:0;top:0;height:62%;pointer-events:none;
    background:radial-gradient(ellipse at 70% 20%,rgba(120,110,230,.35),transparent 55%),
      radial-gradient(ellipse at 20% 40%,rgba(160,90,200,.25),transparent 60%),
      linear-gradient(180deg,#0f1638 0%,#1d1d55 45%,rgba(52,40,110,.85) 82%,rgba(52,40,110,0) 100%);}
  .btt-stars{position:absolute;inset:0;pointer-events:none;}
  .btt-star{position:absolute;border-radius:50%;background:#fff;animation:btt-twinkle 3s ease-in-out infinite;}
  .btt-lantern{position:absolute;width:10px;height:13px;border-radius:40% 40% 30% 30%;
    background:radial-gradient(circle at 50% 40%,#ffe7a3,#f59e0b 60%,#b45309);box-shadow:0 0 10px 3px rgba(251,191,36,.55);
    animation:btt-lantern-up linear infinite;opacity:.85;}
  .btt-cloud{position:absolute;font-size:60px;opacity:.35;filter:grayscale(1) brightness(1.6);animation:btt-drift 40s linear infinite;pointer-events:none;}
  @keyframes btt-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
  @keyframes btt-lantern-up{from{transform:translateY(0)}to{transform:translateY(-110vh)}}
  @keyframes btt-drift{from{transform:translateX(-15vw)}to{transform:translateX(115vw)}}

  /* top bar */
  .btt-top{position:absolute;top:12px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;z-index:60;}
  .btt-top-l,.btt-top-r{display:flex;align-items:center;gap:10px;}
  .btt-pill{display:flex;align-items:center;gap:8px;height:44px;padding:0 14px;border-radius:12px;
    background:rgba(10,10,30,.72);border:1px solid rgba(255,255,255,.14);font-weight:700;font-size:14px;white-space:nowrap;}
  .btt-pill b{color:#fbbf24;font-size:20px;font-weight:800;}
  .btt-pill .btt-sep{width:1px;height:20px;background:rgba(255,255,255,.25);}
  .btt-title{color:#fcd34d;font-weight:800;}
  .btt-dot{width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fde68a,#f59e0b 65%,#b45309);}
  .btt-btn-w{height:44px;min-width:44px;padding:0 16px;border-radius:12px;border:none;background:#fff;color:#1e1b4b;
    font-weight:800;font-size:15px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;}
  .btt-btn-w:hover{background:#fef3c7;}
  .btt-btn-w.icon{padding:0;width:44px;font-size:18px;}
  .btt-hide{display:none!important;}

  /* stage & cakes */
  .btt-stage{position:absolute;left:1.5%;right:1.5%;top:72px;z-index:10;}
  .btt-cake{position:absolute;transition:left .7s cubic-bezier(.4,1.3,.5,1),top .7s cubic-bezier(.4,1.3,.5,1),width .7s,height .7s;}
  .btt-cake.no-anim{transition:none!important;}
  .btt-cake-body{position:absolute;inset:0;transition:transform .35s ease,opacity .35s;}
  .btt-cake-body img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55));pointer-events:none;}
  .btt-cake.drop .btt-cake-body{animation:btt-drop .6s cubic-bezier(.3,1.5,.6,1) both;}
  @keyframes btt-drop{from{transform:translateY(-120vh) rotate(-30deg);opacity:0}to{transform:none;opacity:1}}
  .btt-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:86%;padding:.12em .2em;box-sizing:border-box;
    background:#fdf5e4;color:#8b1414;border:.09em solid #8b1414;outline:.05em solid #fdf5e4;box-shadow:0 0 0 .1em #b91c1c,0 3px 6px rgba(0,0,0,.35);
    border-radius:.12em;text-align:center;font-weight:800;line-height:1.08;font-size:calc(var(--s) * .155);
    display:flex;align-items:center;justify-content:center;min-height:1.6em;transition:background .25s,color .25s,border-color .25s;word-break:keep-all;}
  .btt-cake.mark .btt-label,.btt-cake.target .btt-label{background:#c81e1e;color:#fff;border-color:#fff;outline-color:#c81e1e;box-shadow:0 0 0 .1em #7f1d1d,0 0 14px rgba(255,80,80,.6);}
  .btt-cake.out .btt-label{background:#effbf1;color:#166534;border-color:#15803d;outline-color:#effbf1;box-shadow:0 0 0 .1em #15803d,0 4px 10px rgba(0,0,0,.4);}
  .btt-cake.out .btt-cake-body{transform:rotate(-14deg) scale(1.06);}
  .btt-cake.fly .btt-cake-body{transition:transform .9s cubic-bezier(.5,0,.9,.5),opacity .9s ease-in;opacity:0;}
  .btt-ring{position:absolute;left:50%;top:50%;width:150%;height:150%;transform:translate(-50%,-50%) scale(.4);opacity:0;border-radius:50%;
    pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.3,1.6,.6,1);--rc:#c084fc;
    border:2px solid var(--rc);box-shadow:0 0 14px var(--rc),inset 0 0 14px var(--rc);}
  .btt-ring::before{content:'';position:absolute;inset:7%;border-radius:50%;border:2px dashed var(--rc);animation:btt-spin 6s linear infinite;}
  .btt-ring::after{content:'';position:absolute;inset:16%;border-radius:50%;border:1px solid var(--rc);opacity:.8;
    background:repeating-conic-gradient(from 0deg,transparent 0 28deg,color-mix(in srgb,var(--rc) 35%,transparent) 28deg 30deg);animation:btt-spin 9s linear infinite reverse;}
  .btt-cake.mark .btt-ring,.btt-cake.target .btt-ring{opacity:1;transform:translate(-50%,-50%) scale(1);}
  .btt-cake.target .btt-ring{--rc:#facc15;border-width:4px;}
  .btt-flash{position:absolute;border-radius:50%;border:3px solid rgba(255,255,255,.75);box-shadow:0 0 20px rgba(255,255,255,.5);
    pointer-events:none;animation:btt-flash .8s ease-out forwards;z-index:30;}
  @keyframes btt-flash{from{transform:translate(-50%,-50%) scale(.6);opacity:1}to{transform:translate(-50%,-50%) scale(2.2);opacity:0}}
  @keyframes btt-spin{to{transform:rotate(360deg)}}

  /* Chi Hang */
  .btt-hang{position:absolute;z-index:40;pointer-events:none;width:var(--hs,130px);transform:translate(-50%,-50%);
    transition:left .55s cubic-bezier(.45,.05,.4,1),top .55s cubic-bezier(.45,.05,.4,1),opacity .4s;}
  .btt-hang img{width:100%;display:block;animation:btt-bob 2.2s ease-in-out infinite;filter:drop-shadow(0 6px 14px rgba(255,220,120,.45));transition:transform .3s;}
  .btt-hang.flip img{transform:scaleX(-1);}
  @keyframes btt-bob{0%,100%{translate:0 0;rotate:-3deg}50%{translate:0 -10px;rotate:3deg}}
  .btt-spark{position:absolute;z-index:39;color:#fff7c2;pointer-events:none;text-shadow:0 0 8px #ffd76a;animation:btt-spark 0.9s ease-out forwards;}
  @keyframes btt-spark{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-50%) translateY(18px) scale(.3)}}

  /* conveyor */
  .btt-conveyor{position:absolute;left:0;right:0;z-index:8;overflow:hidden;opacity:0;transition:opacity .4s;
    background:repeating-linear-gradient(90deg,#9ca3af 0 4%,#d1d5db 4% 7%,#9ca3af 7% 11%),#9ca3af;border-top:3px solid #6b7280;border-bottom:3px solid #4b5563;}
  .btt-conveyor.on{opacity:1;}
  .btt-conveyor-track{position:absolute;left:0;top:0;bottom:0;width:200%;display:flex;align-items:center;justify-content:space-around;animation:btt-belt 3.2s linear infinite;}
  .btt-conveyor-track img{height:118%;margin-top:-18%;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5));}
  @keyframes btt-belt{from{transform:translateX(-50%)}to{transform:translateX(0)}}

  /* overlays */
  .btt-overlay{position:absolute;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;}
  .btt-blur{background:rgba(6,4,18,.88);}
  .btt-count{font-size:min(26vh,220px);font-weight:900;color:#f59e0b;-webkit-text-stroke:3px #5b2a06;text-shadow:0 10px 0 #5b2a06,0 0 40px rgba(251,191,36,.7);
    animation:btt-pop .9s ease-out both;}
  .btt-ready{font-size:min(9vh,80px);font-weight:900;color:#fcd34d;-webkit-text-stroke:2px #5b2a06;text-shadow:0 6px 0 #5b2a06,0 0 30px rgba(251,191,36,.7);
    animation:btt-pop .9s ease-out both;display:flex;align-items:center;gap:24px;}
  @keyframes btt-pop{0%{transform:scale(2.4);opacity:0}25%{transform:scale(.92);opacity:1}40%{transform:scale(1.05)}55%,85%{transform:scale(1);opacity:1}100%{transform:scale(.8);opacity:0}}

  .btt-intro{position:absolute;inset:0;z-index:80;background:#05040f;display:flex;align-items:center;justify-content:center;}
  .btt-card{width:min(600px,90vw);padding:44px 30px 48px;border-radius:14px;text-align:center;
    background:linear-gradient(160deg,#1e2050 0%,#1b1840 55%,#2a1a3c 100%);border:1px solid rgba(251,191,36,.45);
    box-shadow:0 0 60px rgba(251,191,36,.35),0 0 140px rgba(251,191,36,.12);}
  .btt-card-icon{width:80px;height:80px;margin:0 auto 26px;border-radius:12px;background:linear-gradient(160deg,#7c4a12,#3b2a10);
    border:1px solid rgba(251,191,36,.5);display:flex;align-items:center;justify-content:center;}
  .btt-card-icon img{width:48px;height:48px;}
  .btt-card h1{margin:0 0 34px;font-size:44px;font-weight:800;color:#fcd34d;text-shadow:0 0 22px rgba(251,191,36,.45);}
  .btt-btn-gold{border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:22px;color:#1e1b4b;padding:16px 58px;border-radius:8px;
    background:linear-gradient(180deg,#fcd34d,#f59e0b);box-shadow:0 0 26px rgba(251,191,36,.55);transition:transform .15s;}
  .btt-btn-gold:hover{transform:translateY(-2px) scale(1.03);}
  .btt-btn-orange{border:none;cursor:pointer;font-family:inherit;font-weight:800;color:#3b1d04;border-radius:12px;
    background:linear-gradient(180deg,#fbbf24,#d97706);box-shadow:0 6px 18px rgba(217,119,6,.5);transition:transform .15s;}
  .btt-btn-orange:hover{transform:translateY(-2px);}
  .btt-btn-dark{border:1px solid rgba(255,255,255,.3);cursor:pointer;font-family:inherit;font-weight:800;color:#fff;border-radius:12px;background:rgba(255,255,255,.06);}
  .btt-btn-dark:hover{background:rgba(255,255,255,.14);}

  /* reveal */
  .btt-reveal{position:absolute;left:0;right:0;top:0;z-index:50;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .5s;pointer-events:none;}
  .btt-reveal.on{opacity:1;pointer-events:auto;}
  .btt-rays{position:absolute;width:170vmax;height:170vmax;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;
    background:repeating-conic-gradient(from 0deg,rgba(255,206,120,.26) 0 7deg,transparent 7deg 18deg);
    -webkit-mask:radial-gradient(circle,#000 10%,transparent 38%);mask:radial-gradient(circle,#000 10%,transparent 38%);animation:btt-rays 40s linear infinite;}
  @keyframes btt-rays{to{transform:translate(-50%,-50%) rotate(360deg)}}
  .btt-reveal-cake{position:relative;width:var(--rs);height:var(--rs);animation:btt-reveal-in .7s cubic-bezier(.3,1.5,.6,1) both;}
  @keyframes btt-reveal-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
  .btt-dial{position:absolute;left:50%;top:50%;width:142%;height:142%;transform:translate(-50%,-50%);animation:btt-dial 30s linear infinite;
    filter:drop-shadow(0 0 10px rgba(253,224,71,.9));}
  @keyframes btt-dial{to{transform:translate(-50%,-50%) rotate(360deg)}}
  .btt-reveal-cake > img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 30px rgba(0,0,0,.6));}
  .btt-reveal-cake .btt-label{width:auto;min-width:64%;max-width:118%;white-space:nowrap;padding:.08em .35em;font-size:calc(var(--rs) * .13);}
  .btt-reveal-hang{position:absolute;width:calc(var(--rs) * .42);left:calc(100% + var(--rs) * .02);top:18%;}
  .btt-reveal-hang img{width:100%;animation:btt-bob 2.4s ease-in-out infinite;}
  .btt-next{position:absolute;left:50%;transform:translateX(-50%);z-index:55;font-size:20px;padding:14px 30px;}
  .btt-next:hover{transform:translateX(-50%) translateY(-2px);}

  .btt-modal{width:min(380px,88vw);padding:28px 24px 24px;border-radius:16px;text-align:center;background:linear-gradient(180deg,#24173f,#160f2c);
    border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 60px rgba(0,0,0,.6);animation:btt-reveal-in .35s ease-out both;}
  .btt-modal h2{margin:0 0 20px;font-size:26px;font-weight:800;}
  .btt-modal .row{display:flex;gap:12px;justify-content:center;}
  .btt-modal button{font-size:16px;padding:11px 22px;}
  .btt-end{width:min(560px,90vw);}
  .btt-end h2{font-size:34px;margin-bottom:10px;}
  .btt-end .names{color:#e2e8f0;font-size:16px;margin-bottom:24px;line-height:1.6;max-height:40vh;overflow:auto;}
  .btt-confetti{position:absolute;top:-20px;width:10px;height:14px;z-index:69;animation:btt-confetti linear forwards;pointer-events:none;}
  @keyframes btt-confetti{to{transform:translateY(110vh) rotate(720deg)}}
  `;

  function dialSvg() {
    let s = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fde047">';
    s += '<circle cx="50" cy="50" r="48" stroke-width="1.6"/><circle cx="50" cy="50" r="41.5" stroke-width=".8"/>';
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const x = 50 + Math.cos(a) * 44.8, y = 50 + Math.sin(a) * 44.8;
      if (i % 3 === 0) s += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.25" fill="#fde047" stroke="none"/>`;
      else {
        const x2 = 50 + Math.cos(a) * 46.6, y2 = 50 + Math.sin(a) * 46.6;
        const x1 = 50 + Math.cos(a) * 43, y1 = 50 + Math.sin(a) * 43;
        s += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width=".9"/>`;
      }
    }
    [0, 90, 180, 270].forEach((d) => {
      s += `<path d="M50 4.5 L52 8.5 L48 8.5 Z" fill="#fde047" stroke="none" transform="rotate(${d + 45} 50 50)"/>`;
    });
    return s + '</svg>';
  }

  // ---------------------------------------------------------------- GAME
  class BanhTrungThuGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.baseAssetUrl = options.baseAssetUrl || '/ey/games/banh-trung-thu/';
      this.onExit = typeof options.onExit === 'function' ? options.onExit : null;
      this.sessionTitle = (options.session && options.session.title && options.session.title.length < 28) ? options.session.title : 'Chơi thử';

      const raw = options.students || (options.session && options.session.students) || [];
      const list = (Array.isArray(raw) ? raw : String(raw).split(/\r?\n/))
        .map((s) => (typeof s === 'string' ? s : (s && (s.name || s.fullName || s.ten)) || ''))
        .map((s) => s.trim()).filter(Boolean);
      this.students = list.length ? list : DEFAULT_STUDENTS.slice();

      this.turn = 0;
      this.calledSet = new Set(); // index of students called
      this.calledOrder = [];
      this.cakes = [];
      this.phase = 'intro';
      this.paused = false;
      this.soundOn = true;
      this.runToken = 0;
      this.destroyed = false;
      this._timeouts = new Set();
      this._waitCleanups = new Set();

      this._onResize = this.onResize.bind(this);
      this._onKey = this.onKey.bind(this);
      this.build();
      window.addEventListener('resize', this._onResize);
      window.addEventListener('keydown', this._onKey);
      this.onResize();
    }

    addTimeout(fn, ms) {
      if (this.destroyed) return null;
      const id = setTimeout(() => {
        this._timeouts.delete(id);
        if (!this.destroyed) fn();
      }, ms);
      this._timeouts.add(id);
      return id;
    }

    clearTimeouts() {
      this._timeouts.forEach(id => clearTimeout(id));
      this._timeouts.clear();
      this._waitCleanups.forEach(cleanup => {
        try { cleanup(); } catch (e) {}
      });
      this._waitCleanups.clear();
    }

    asset(p) { return (this.baseAssetUrl.replace(/\/?$/, '/') + p); }

    sfx(kind) {
      if (!this.soundOn) return;
      switch (kind) {
        case 'click': tone(560, 'triangle', 0.08, 0.1); break;
        case 'count': tone(440, 'square', 0.18, 0.08); break;
        case 'go': [523, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.25, 0.14), i * 90)); break;
        case 'fly': tone(300, 'sine', 0.45, 0.1, 900); break;
        case 'mark': tone(880, 'sine', 0.12, 0.06); break;
        case 'pop': tone(620, 'triangle', 0.18, 0.1, 180); break;
        case 'tick': tone(1200, 'square', 0.05, 0.05); break;
        case 'target': tone(660, 'sawtooth', 0.3, 0.07, 990); break;
        case 'belt': tone(160, 'sawtooth', 0.8, 0.04, 120); break;
        case 'win': [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => setTimeout(() => tone(f, 'triangle', 0.35, 0.16), i * 85)); break;
        default: break;
      }
    }

    // ---------------- DOM
    build() {
      const lanterns = Array.from({ length: 26 }, () => {
        const d = rand(28, 60);
        return `<div class="btt-lantern" style="left:${rand(0, 100)}%;top:${rand(30, 110)}%;transform:scale(${rand(0.5, 1.2).toFixed(2)});animation-duration:${d}s;animation-delay:-${rand(0, d).toFixed(1)}s"></div>`;
      }).join('');
      const stars = Array.from({ length: 90 }, () => {
        const sz = rand(1, 2.6).toFixed(1);
        return `<div class="btt-star" style="left:${rand(0, 100)}%;top:${rand(0, 60)}%;width:${sz}px;height:${sz}px;animation-delay:-${rand(0, 3).toFixed(1)}s"></div>`;
      }).join('');

      this.container.innerHTML = `
        <div class="btt-root">
          <style>${CSS}</style>
          <div class="btt-bg" style="background-image:url('${this.asset('assets/bg_clean.jpg')}'),url('${this.asset('assets/bg.jpg')}')"></div>
          <div class="btt-sky"></div>
          <div class="btt-stars">${stars}${lanterns}
            <div class="btt-cloud" style="top:12%;animation-duration:70s;animation-delay:-20s">☁️</div>
            <div class="btt-cloud" style="top:24%;animation-duration:90s;animation-delay:-60s;font-size:80px">☁️</div>
          </div>
          <div class="btt-conveyor"><div class="btt-conveyor-track">${'<img src="' + this.asset('assets/mooncake.png') + '">'.repeat(14)}</div></div>
          <div class="btt-stage"></div>
          <div class="btt-reveal"></div>

          <div class="btt-top">
            <div class="btt-top-l">
              <div class="btt-pill"><span class="btt-dot"></span><span class="btt-title">Lò Bánh Trung Thu</span><span class="btt-sep"></span><span>${esc(this.sessionTitle)}</span></div>
              <div class="btt-pill btt-hud btt-hide"><b data-k="turn">1</b> lượt</div>
              <div class="btt-pill btt-hud btt-hide"><b data-k="called">0/0</b> đã gọi</div>
              <div class="btt-pill btt-hud btt-hide" data-k="ovenPill"><b data-k="oven">0</b> trong lò</div>
            </div>
            <div class="btt-top-r">
              <button class="btt-btn-w icon" data-act="fs" title="Toàn màn hình">⛶</button>
              <button class="btt-btn-w icon" data-act="sound" title="Âm thanh">🔊</button>
              <button class="btt-btn-w btt-hud btt-hide" data-act="pause">Tạm dừng</button>
              <button class="btt-btn-w btt-hud btt-hide" data-act="end">Kết thúc</button>
            </div>
          </div>
          <div class="btt-layer"></div>
        </div>`;

      this.root = this.container.querySelector('.btt-root');
      this.stage = this.root.querySelector('.btt-stage');
      this.revealEl = this.root.querySelector('.btt-reveal');
      this.conveyor = this.root.querySelector('.btt-conveyor');
      this.layer = this.root.querySelector('.btt-layer');

      this.root.querySelector('[data-act="fs"]').onclick = () => this.toggleFullscreen();
      this.root.querySelector('[data-act="sound"]').onclick = (e) => {
        this.soundOn = !this.soundOn;
        e.currentTarget.textContent = this.soundOn ? '🔊' : '🔇';
        this.sfx('click');
      };
      this.root.querySelector('[data-act="pause"]').onclick = (e) => {
        this.setPaused(!this.paused);
        e.currentTarget.textContent = this.paused ? 'Tiếp tục' : 'Tạm dừng';
      };
      this.root.querySelector('[data-act="end"]').onclick = () => this.askEnd();

      this.showIntro();
    }

    toggleFullscreen() {
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else (this.root.requestFullscreen ? this.root : document.documentElement).requestFullscreen().catch(() => {});
      } catch (e) { /* ignore */ }
    }

    setHud(show) {
      this.root.querySelectorAll('.btt-hud').forEach((el) => el.classList.toggle('btt-hide', !show));
    }

    updateHud() {
      const q = (k) => this.root.querySelector(`[data-k="${k}"]`);
      q('turn').textContent = Math.max(1, this.turn);
      q('called').textContent = `${this.calledSet.size}/${this.students.length}`;
      q('oven').textContent = this.cakes.filter((c) => c.alive).length;
    }

    showOvenPill(show) {
      this.root.querySelector('[data-k="ovenPill"]').classList.toggle('btt-hide', !show);
    }

    // ---------------- geometry
    onResize() {
      if (!this.root) return;
      const W = window.innerWidth, H = window.innerHeight;
      const scale = Math.max(W / 1910, H / 962);
      const brick = Math.round(62 * scale); // brick wall height in bg image
      this.brick = brick;
      // phủ bầu trời xanh tím lên phần trời của ảnh nền, mờ dần xuống mái nhà
      this.root.querySelector('.btt-sky').style.height = Math.max(0, H - (962 - 625) * scale) + 'px';
      const beltH = Math.max(36, Math.round(H * 0.075));
      Object.assign(this.conveyor.style, { bottom: brick + 'px', height: beltH + 'px' });
      this.stage.style.bottom = (brick + 14) + 'px';
      this.revealEl.style.bottom = brick + 'px';
      this.root.style.setProperty('--hs', Math.round(Math.min(150, Math.max(80, Math.min(W, H * 1.6) * 0.085))) + 'px');
      const nextBtn = this.root.querySelector('.btt-next');
      if (nextBtn) nextBtn.style.bottom = Math.max(10, brick - 26) + 'px';
      this.layoutCakes(true);
    }

    stageSize() {
      const r = this.stage.getBoundingClientRect();
      return { W: Math.max(200, r.width), H: Math.max(150, r.height) };
    }

    computeLayout(n) {
      const { W, H } = this.stageSize();
      let best = null;
      for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        const size = Math.min(W / cols, H / rows);
        if (!best || size > best.size + 0.5) best = { cols, rows, size };
      }
      const { cols, rows } = best;
      const cw = W / cols, ch = Math.min(H / rows, cw * 1.05);
      const cake = Math.min(best.size * 0.9, H * 0.62, 320);
      const offY = (H - ch * rows) / 2;
      const pos = [];
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), c = i % cols;
        const inRow = r === rows - 1 ? n - r * cols : cols;
        const offX = (cols - inRow) * cw / 2;
        pos.push({ x: offX + c * cw + cw / 2, y: offY + r * ch + ch / 2, size: cake });
      }
      return pos;
    }

    layoutCakes(instant) {
      const alive = this.cakes.filter((c) => c.alive);
      if (!alive.length) return;
      const pos = this.computeLayout(alive.length);
      alive.forEach((c, i) => this.placeCake(c, pos[i], instant));
    }

    placeCake(c, p, instant) {
      c.x = p.x; c.y = p.y; c.size = p.size;
      if (instant) c.el.classList.add('no-anim');
      Object.assign(c.el.style, { left: (p.x - p.size / 2) + 'px', top: (p.y - p.size / 2) + 'px', width: p.size + 'px', height: p.size + 'px' });
      c.el.style.setProperty('--s', p.size + 'px');
      if (instant) { void c.el.offsetWidth; c.el.classList.remove('no-anim'); }
    }

    // ---------------- timing helpers (pause & cancel aware)
    wait(ms, token) {
      return new Promise((resolve, reject) => {
        let timer = null;
        const cleanup = () => {
          if (timer) clearTimeout(timer);
          this._waitCleanups.delete(cleanup);
        };
        this._waitCleanups.add(cleanup);
        let left = ms, last = performance.now();
        const tick = () => {
          if (this.destroyed || token !== this.runToken) {
            cleanup();
            return reject(CANCEL);
          }
          const now = performance.now();
          if (!this.paused) left -= (now - last);
          last = now;
          if (left <= 0) {
            cleanup();
            resolve();
          } else {
            timer = setTimeout(tick, this.paused ? 150 : Math.min(left, 50));
          }
        };
        timer = setTimeout(tick, Math.min(left, 50));
      });
    }

    setPaused(p) {
      this.paused = p;
    }

    // ---------------- screens
    showIntro() {
      this.phase = 'intro';
      this.setHud(false);
      this.layer.innerHTML = `
        <div class="btt-intro">
          <div class="btt-card">
            <div class="btt-card-icon"><img src="${this.asset('assets/mooncake.png')}"></div>
            <h1>Lò Bánh Trung Thu</h1>
            <button class="btt-btn-gold" data-act="start">▶&nbsp; Bắt đầu</button>
          </div>
        </div>`;
      this.layer.querySelector('[data-act="start"]').onclick = () => { this.sfx('click'); this.startGame(); };
    }

    async startGame() {
      const token = ++this.runToken;
      this.layer.innerHTML = '';
      this.turn = 1;
      this.calledSet.clear();
      this.calledOrder = [];
      this.setPaused(false);
      const pb = this.root.querySelector('[data-act="pause"]');
      if (pb) pb.textContent = 'Tạm dừng';
      this.setHud(true);
      this.showOvenPill(false);
      this.stage.innerHTML = '';
      this.cakes = [];
      this.updateHud();
      this.phase = 'countdown';
      try {
        this.conveyor.classList.add('on');
        this.layer.innerHTML = '<div class="btt-overlay btt-blur"></div>';
        const ov = this.layer.firstElementChild;
        for (const n of ['3', '2', '1']) {
          ov.innerHTML = `<div class="btt-count">${n}</div>`;
          this.sfx('count');
          if (n === '1') { this.conveyor.classList.remove('on'); this.spawnCakes(); }
          await this.wait(1000, token);
        }
        ov.innerHTML = `<div class="btt-ready"><span>🏮</span>SẴN SÀNG!<span>🥮</span></div>`;
        this.sfx('go');
        await this.wait(1000, token);
        this.layer.innerHTML = '';
        await this.runTurn(token);
      } catch (e) {
        if (e !== CANCEL) console.error(e);
      }
    }

    spawnCakes() {
      this.stage.innerHTML = '';
      this.hang = null;
      const order = shuffle(this.students.map((name, idx) => ({ name, idx })));
      this.cakes = order.map((s, i) => {
        const el = document.createElement('div');
        el.className = 'btt-cake drop';
        el.innerHTML = `<div class="btt-ring"></div><div class="btt-cake-body"><img src="${this.asset('assets/mooncake.png')}" draggable="false"><div class="btt-label">${esc(s.name)}</div></div>`;
        const body = el.querySelector('.btt-cake-body');
        body.style.animationDelay = (i * 18) + 'ms';
        // bỏ animation rơi sau khi xong để không đè transform lúc bánh bị hất văng
        body.addEventListener('animationend', () => el.classList.remove('drop'), { once: true });
        this.stage.appendChild(el);
        return { name: s.name, idx: s.idx, el, alive: true, x: 0, y: 0, size: 0 };
      });
      this.layoutCakes(true);
      this.showOvenPill(true);
      this.updateHud();
    }

    // ---------------- Chi Hang
    ensureHang() {
      if (this.hang && this.hang.isConnected) return this.hang;
      const h = document.createElement('div');
      h.className = 'btt-hang';
      h.innerHTML = `<img src="${this.asset('assets/hang_nga.png')}" draggable="false">`;
      const { W } = this.stageSize();
      h.style.left = (W + 120) + 'px';
      h.style.top = '60px';
      this.stage.appendChild(h);
      this.hang = h;
      this.hangX = W + 120; this.hangY = 60;
      void h.offsetWidth;
      return h;
    }

    async flyHang(x, y, token, ms = 600) {
      const h = this.ensureHang();
      const { W, H } = this.stageSize();
      x = Math.max(40, Math.min(W - 40, x));
      y = Math.max(30, Math.min(H - 30, y));
      h.classList.toggle('flip', x < this.hangX - 4);
      const fx = this.hangX, fy = this.hangY;
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      this.hangX = x; this.hangY = y;
      for (let i = 1; i <= 4; i++) {
        this.addTimeout(() => {
          if (!this.stage || !this.stage.isConnected) return;
          const s = document.createElement('div');
          s.className = 'btt-spark';
          s.textContent = i % 2 ? '✦' : '✧';
          s.style.left = (fx + (x - fx) * i / 5 + rand(-14, 14)) + 'px';
          s.style.top = (fy + (y - fy) * i / 5 + rand(10, 30)) + 'px';
          s.style.fontSize = rand(12, 20) + 'px';
          this.stage.appendChild(s);
          this.addTimeout(() => s.remove(), 900);
        }, i * 90);
      }
      await this.wait(ms, token);
    }

    hoverPoint(c) { return { x: c.x + c.size * 0.32, y: c.y - c.size * 0.42 }; }

    // ---------------- elimination
    async eliminate(cakes, token) {
      for (const c of cakes) { c.el.classList.remove('mark', 'target'); c.el.classList.add('out'); }
      this.sfx('pop');
      await this.wait(380, token);
      const { W } = this.stageSize();
      cakes.forEach((c, i) => {
        this.addTimeout(() => {
          if (!this.stage || !this.stage.isConnected) return;
          const f = document.createElement('div');
          f.className = 'btt-flash';
          Object.assign(f.style, { left: c.x + 'px', top: c.y + 'px', width: c.size * 1.3 + 'px', height: c.size * 1.3 + 'px' });
          this.stage.appendChild(f);
          this.addTimeout(() => f.remove(), 850);
          const dir = c.x < W / 2 ? -1 : 1;
          const body = c.el.querySelector('.btt-cake-body');
          c.el.classList.add('fly');
          body.style.transform = `translate(${dir * rand(120, 320)}px, ${-rand(260, 520)}px) rotate(${dir * rand(120, 300)}deg) scale(.45)`;
        }, i * 45);
        c.alive = false;
      });
      this.updateHud();
      await this.wait(500 + cakes.length * 45, token);
      cakes.forEach((c) => c.el.remove());
    }

    async waveStage(target, token) {
      let alive = this.cakes.filter((c) => c.alive);
      const remove = alive.length - target;
      if (remove <= 0) return;
      let waves = Math.min(remove, Math.max(2, Math.ceil(remove / 9)));
      let left = remove;
      while (left > 0) {
        alive = this.cakes.filter((c) => c.alive);
        const k = Math.ceil(left / waves);
        const anchor = alive[Math.floor(Math.random() * alive.length)];
        const group = alive.slice().sort((a, b) => Math.hypot(a.x - anchor.x, a.y - anchor.y) - Math.hypot(b.x - anchor.x, b.y - anchor.y)).slice(0, k);
        this.sfx('fly');
        const hp = this.hoverPoint(anchor);
        await this.flyHang(hp.x, hp.y, token, 520);
        const cx = group.reduce((s, c) => s + c.x, 0) / group.length;
        const cy = group.reduce((s, c) => s + c.y, 0) / group.length;
        const hh = this.ensureHang();
        hh.classList.toggle('flip', cx < this.hangX - 4);
        hh.style.left = cx + 'px'; hh.style.top = (cy - (group[0].size * 0.5)) + 'px';
        this.hangX = cx; this.hangY = cy - group[0].size * 0.5;
        for (const c of group) {
          c.el.classList.add('mark');
          this.sfx('mark');
          await this.wait(Math.max(35, 260 / k), token);
        }
        await this.wait(650, token);
        await this.eliminate(group, token);
        left -= k; waves -= 1;
        await this.wait(220, token);
      }
    }

    async suspenseEliminate(token) {
      const alive = this.cakes.filter((c) => c.alive);
      const victim = alive[Math.floor(Math.random() * alive.length)];
      const fakes = randInt(1, alive.length >= 3 ? 3 : 2);
      let last = null;
      for (let i = 0; i < fakes; i++) {
        let pick = alive[Math.floor(Math.random() * alive.length)];
        if (pick === last && alive.length > 1) pick = alive.find((c) => c !== last);
        last = pick;
        const hp = this.hoverPoint(pick);
        this.sfx('fly');
        await this.flyHang(hp.x, hp.y, token, 520);
        pick.el.classList.add('mark');
        this.sfx('tick');
        await this.wait(650, token);
        pick.el.classList.remove('mark');
        await this.wait(150, token);
      }
      const hp = this.hoverPoint(victim);
      await this.flyHang(hp.x, hp.y, token, 520);
      victim.el.classList.add('target');
      this.sfx('target');
      await this.wait(850, token);
      await this.eliminate([victim], token);
      await this.wait(400, token);
    }

    async runTurn(token) {
      this.phase = 'baking';
      this.updateHud();
      await this.wait(700, token);
      this.ensureHang();
      const aliveCount = () => this.cakes.filter((c) => c.alive).length;

      if (aliveCount() > 10) {
        await this.waveStage(10, token);
        await this.flyHang(this.stageSize().W * 0.55, 50, token, 300);
        this.layoutCakes(false);
        await this.wait(1000, token);
      }
      if (aliveCount() > 3) {
        await this.waveStage(3, token);
        await this.flyHang(this.stageSize().W * 0.25, 60, token, 300);
        this.layoutCakes(false);
        await this.wait(1000, token);
      }
      while (aliveCount() > 1) {
        await this.suspenseEliminate(token);
      }
      await this.revealWinner(token);
    }

    async revealWinner(token) {
      const winner = this.cakes.find((c) => c.alive);
      if (!winner) return;
      const hp = this.hoverPoint(winner);
      await this.flyHang(hp.x, hp.y, token, 520);
      winner.el.classList.add('mark');
      winner.el.querySelector('.btt-ring').style.opacity = '0';
      await this.wait(700, token);
      // move to the center
      const { W, H } = this.stageSize();
      winner.el.classList.remove('mark');
      this.placeCake(winner, { x: W / 2, y: H / 2, size: Math.min(H * 0.6, 330) }, false);
      if (this.hang) this.hang.style.opacity = '0';
      await this.wait(750, token);

      if (!this.calledSet.has(winner.idx)) {
        this.calledSet.add(winner.idx);
      }
      this.calledOrder.push(winner.name);
      this.showOvenPill(false);
      this.updateHud();
      this.phase = 'reveal';
      this.sfx('win');

      const rs = Math.round(Math.min(H * 0.66, W * 0.42, 520));
      this.revealEl.innerHTML = `
        <div class="btt-rays"></div>
        <div class="btt-reveal-cake" style="--rs:${rs}px">
          <div class="btt-dial">${dialSvg()}</div>
          <img src="${this.asset('assets/mooncake.png')}">
          <div class="btt-label">${esc(winner.name)}</div>
          <div class="btt-reveal-hang"><img src="${this.asset('assets/hang_nga.png')}"></div>
        </div>`;
      this.revealEl.classList.add('on');
      this.stage.style.opacity = '0';
      const btn = document.createElement('button');
      btn.className = 'btt-btn-orange btt-next';
      btn.textContent = 'Gọi em tiếp theo';
      btn.style.bottom = Math.max(10, this.brick - 26) + 'px';
      btn.onclick = () => this.nextTurn();
      this.root.appendChild(btn);
      this.confetti(40);
    }

    async nextTurn() {
      if (this.phase !== 'reveal') return;
      this.sfx('click');
      const token = ++this.runToken;
      this.phase = 'transition';
      const btn = this.root.querySelector('.btt-next');
      if (btn) btn.remove();
      this.revealEl.classList.remove('on');
      try {
        await this.wait(450, token);
        this.revealEl.innerHTML = '';
        this.stage.innerHTML = '';
        this.stage.style.opacity = '1';
        this.cakes = [];
        this.hang = null;
        this.conveyor.classList.add('on');
        this.sfx('belt');
        await this.wait(1500, token);
        this.conveyor.classList.remove('on');
        this.turn += 1;
        this.spawnCakes();
        await this.wait(900, token);
        await this.runTurn(token);
      } catch (e) {
        if (e !== CANCEL) console.error(e);
      }
    }

    // ---------------- end
    askEnd() {
      if (this.layer.querySelector('.btt-modal')) return;
      this.sfx('click');
      const wasPaused = this.paused;
      this.setPaused(true);
      this.layer.insertAdjacentHTML('beforeend', `
        <div class="btt-overlay btt-blur" data-modal>
          <div class="btt-modal">
            <h2>Kết thúc ván?</h2>
            <div class="row">
              <button class="btt-btn-dark" data-act="cont">Chơi tiếp</button>
              <button class="btt-btn-orange" data-act="stop">Kết thúc</button>
            </div>
          </div>
        </div>`);
      const m = this.layer.querySelector('[data-modal]');
      m.querySelector('[data-act="cont"]').onclick = () => { this.sfx('click'); m.remove(); this.setPaused(wasPaused); };
      m.querySelector('[data-act="stop"]').onclick = () => { this.sfx('click'); m.remove(); this.showEnd(); };
    }

    showEnd() {
      this.runToken++;
      this.clearTimeouts();
      this.phase = 'end';
      this.setPaused(false);
      const btn = this.root.querySelector('.btt-next');
      if (btn) btn.remove();
      this.revealEl.classList.remove('on');
      this.revealEl.innerHTML = '';
      this.stage.innerHTML = '';
      this.stage.style.opacity = '1';
      this.cakes = [];
      this.hang = null;
      this.conveyor.classList.remove('on');
      this.setHud(false);
      const names = this.calledOrder.length ? this.calledOrder.map(esc).join(', ') : 'Chưa gọi em nào';
      this.layer.innerHTML = `
        <div class="btt-overlay">
          <div class="btt-modal btt-end">
            <h2>Đã gọi tên</h2>
            <div class="names">${names}</div>
            <div class="row">
              <button class="btt-btn-orange" data-act="again">Chơi lại</button>
              <button class="btt-btn-dark" data-act="back">Về danh sách</button>
            </div>
          </div>
        </div>`;
      this.layer.querySelector('[data-act="again"]').onclick = () => { this.sfx('click'); this.startGame(); };
      this.layer.querySelector('[data-act="back"]').onclick = () => {
        this.sfx('click');
        this.destroy();
        if (typeof this.onExit === 'function') this.onExit();
      };
      this.confetti(24);
    }

    confetti(n) {
      const colors = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#c084fc', '#fde68a'];
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'btt-confetti';
        const d = rand(2, 3.5);
        Object.assign(c.style, {
          left: rand(0, 100) + '%', background: colors[i % colors.length],
          animationDuration: d + 's', animationDelay: rand(0, 0.8) + 's'
        });
        this.root.appendChild(c);
        this.addTimeout(() => c.remove(), (d + 1) * 1000);
      }
    }

    onKey(e) {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      if (this.layer.querySelector('[data-modal]')) return;
      if (this.phase === 'intro') { e.preventDefault(); this.sfx('click'); this.startGame(); }
      else if (this.phase === 'reveal') { e.preventDefault(); this.nextTurn(); }
    }

    destroy() {
      this.destroyed = true;
      this.runToken++;
      this.clearTimeouts();
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('keydown', this._onKey);
      if (this.container) this.container.innerHTML = '';
    }
  }

  // Global launcher – trả về hàm cleanup (đồng thời có .destroy để tương thích)
  window.launchBanhTrungThuGame = function (containerOrSession, options = {}) {
    let container = containerOrSession;
    let finalOptions = options;
    if (!container || !container.appendChild) {
      finalOptions = Object.assign({}, containerOrSession, options);
      let el = document.getElementById('banh-trung-thu-game-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'banh-trung-thu-game-container';
        document.body.appendChild(el);
      }
      container = el;
    }
    const game = new BanhTrungThuGame(container, finalOptions);
    const cleanup = () => game.destroy();
    cleanup.destroy = cleanup;
    cleanup.game = game;
    return cleanup;
  };
})();
