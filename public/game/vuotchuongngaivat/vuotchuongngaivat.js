/* ============================================================
 * VƯỢT CHƯỚNG NGẠI VẬT — SmartEdu (Kho Game Học Tập)
 * Luật (Thầy Nguyễn Mạnh Hùng chốt 2026-10-30, hướng 3 "Đào tốc độ"):
 * - Chia đội; mỗi đội có THỜI GIAN RIÊNG (cài đặt theo giây).
 * - Mỗi đội một GÓI CÂU HỎI riêng, KHÔNG trùng nhau.
 * - Mỗi đội một MỎ riêng. Trả lời ĐÚNG mới được đào 1 ô,
 *   rồi sang câu tiếp theo. Trả lời sai → không được đào.
 * - Đội kết thúc khi: HẾT GIỜ, HẾT CÂU HỎI, hoặc ĐÀO HẾT MỎ.
 * - Mỏ (tính trên 10 câu hỏi): 2 đá, 2 vàng to (30đ),
 *   4 vàng vừa (20đ), 4 vàng nhỏ (10đ), 2 kim cương (40đ),
 *   2 bom (-20đ), 2 hộp quà (ngẫu nhiên 10/20/30/40đ).
 * - Có NHẠC NỀN, thầy đổi được link nhạc trong Cài đặt.
 * Khung chuẩn: import HS Excel + câu hỏi Word (KaTeX/ảnh qua
 * QuizCommon), bản trial (window.__TRIAL__) 2 đội / 60 giây,
 * không nhập liệu, không security/gate.
 * ============================================================ */
(function (G) {
'use strict';

var TRIAL = !!(G && G.__TRIAL__);
var CFG = {
  trial: TRIAL,
  storeSuffix: TRIAL ? '_trial' : '',
  maxTeams: 8,
  defaultSeconds: 90,   // thời gian mặc định mỗi đội (giây)
  trialSeconds: 60,
  storeKey: 'smartedu_vuotchuongngaivat_teams'
};

/* ============================================================
   ĐIỂM VÀ TỈ LỆ MỎ — THẦY ĐỔI TẠI ĐÂY (2026-10-31)
   - POINTS: điểm mỗi loại vật đào được. (Đá thầy chưa chốt điểm,
     mình đặt tạm 5đ — thầy sửa số này là xong.)
   - GIFT_VALUES: hộp quà bốc ngẫu nhiên một trong các số này.
   - MINE_RATIO: số vật mỗi loại TRÊN 10 CÂU HỎI của đội.
     Game tự co giãn theo số câu thật của gói (VD gói 5 câu
     → một nửa số vật, làm tròn).
   ============================================================ */
/* ============================================================
   VƯỢT CHƯỚNG NGẠI VẬT: Ô CHỮ (thầy chốt 2026-11-01, bản 2)
   - GV nhập chữ vào từng ô (mặc định 10 cột × 8 hàng), dòng riêng nhập từ khoá
   - Đội chọn 1 ô chưa mở → hiện câu hỏi → trả lời đúng +10đ mở ô
   - Sai → các đội còn lại được cướp (đúng +10đ, sai −5đ), hết giờ/không ai được → ô đỏ khoá
   - Đoán trúng từ khoá +100đ thắng luôn; đoán sai cấm 2 vòng
   ============================================================ */
var DEFAULT_ROWS = 8, DEFAULT_COLS = 10;
var DEFAULT_GRID_LETTERS = {};  // "r,c" -> chữ (bản mẫu cho trial)
/* Bảng mẫu trial 4x5 */
(function () {
  var rows = ['MỘTSỐ', 'CAOĐỘ', 'THÁNG', 'CONSỐ'];
  for (var r = 0; r < rows.length; r++)
    for (var c = 0; c < rows[r].length; c++)
      DEFAULT_GRID_LETTERS[r + ',' + c] = rows[r][c];
})();
var DEFAULT_KEYWORD = 'TOÁN';

var TEAM_COLORS = [
  { name: 'Đỏ',        hue: 0,   css: '#e11d48' },
  { name: 'Xanh dương', hue: 210, css: '#2563eb' },
  { name: 'Xanh lá',   hue: 120, css: '#16a34a' },
  { name: 'Vàng',      hue: 45,  css: '#eab308' },
  { name: 'Tím',       hue: 270, css: '#9333ea' },
  { name: 'Cam',       hue: 25,  css: '#ea580c' },
  { name: 'Hồng',      hue: 320, css: '#ec4899' },
  { name: 'Xanh ngọc', hue: 180, css: '#0891b2' }
];

/* ---------- state ---------- */
var S = {
  screen: 'setup',        // setup | play | result
  teams: [],              // {name,members[],colorIdx,points,penalty}
  order: [],              // thứ tự đội chơi
  curTeam: 0,             // index trong order (đội đang chọn ô)
  phase: 'pick',          // pick | answer | steal
  cur: null,              // câu hỏi đang chiếu
  curCell: null,          // {r, c} ô đang chơi
  grid: [],               // 2D: null hoặc {ch, opened, red}
  rows: DEFAULT_ROWS, cols: DEFAULT_COLS,
  keyword: '',
  stealTried: [],         // index đội đã cướp hụt ở ô này
  qSeconds: 30,           // thời gian trả lời mỗi câu
  timeLeft: 0, timerId: null,
  winner: -1,             // index đội đoán trúng từ khoá
  buzzSession: '',        // mã phòng bấm chuông
  buzzQueue: [],          // [{team, ts}] hàng chờ cướp
  buzzUnsub: null,        // hủy listener Firebase
  started: false
};

/* Ngân hàng rich (session-only, không lưu localStorage) */
var RICHQ = [];
var USE_DEFAULTS = true;
var QINFO = '';

/* ============================================================
   ÂM THANH + NHẠC NỀN (WebAudio)
   — THẦY THAY NHẠC TẠI ĐÂY —
   * Nhạc nền mặc định: giai điệu chip tự sinh (không cần file).
   * Muốn nhạc riêng: vào Cài đặt → dán link mp3 vào ô
     "Link nhạc nền", game sẽ phát file đó lặp lại thay cho
     giai điệu mặc định.
   * Muốn đổi giai điệu mặc định: sửa mảng MELODY bên dưới
     (số = tần số nốt nhạc, 0 = nghỉ).
   ============================================================ */
var Snd = (function () {
  var ctx = null;
  function ac() {
    if (!ctx) {
      var AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    try {
      var c = ac(); if (!c) return;
      var t = c.currentTime + (when || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  return {
    click: function () { tone(600, 0.07, 'square', 0.08); },
    correct: function () { tone(523, 0.12, 'sine', 0.2); tone(659, 0.12, 'sine', 0.2, 0.1); tone(784, 0.2, 'sine', 0.2, 0.2); },
    wrong: function () { tone(220, 0.18, 'sawtooth', 0.12); tone(165, 0.25, 'sawtooth', 0.12, 0.15); },
    tick: function () { tone(880, 0.08, 'square', 0.1); },
    /* đào trúng vàng / kim cương: leng keng đi lên */
    digGold: function () {
      tone(784, 0.1, 'triangle', 0.22); tone(988, 0.1, 'triangle', 0.22, 0.09);
      tone(1175, 0.18, 'triangle', 0.22, 0.18);
    },
    /* đào trúng đá: cụp nhẹ */
    digRock: function () { tone(180, 0.12, 'square', 0.12); },
    /* đào trúng bom: nổ */
    digBomb: function () {
      tone(120, 0.4, 'sawtooth', 0.25); tone(80, 0.5, 'sawtooth', 0.25, 0.1);
      tone(55, 0.6, 'square', 0.2, 0.2);
    },
    /* đào trúng quà: fanfare nhỏ */
    digGift: function () {
      var seq = [523, 659, 784, 1046];
      for (var i = 0; i < seq.length; i++) tone(seq[i], 0.14, 'triangle', 0.2, i * 0.11);
    },
    /* kết thúc lượt đội: còi */
    whistle: function () { tone(2093, 0.35, 'sine', 0.15); },
    /* vô địch: fanfare lớn */
    fanfare: function () {
      var seq = [523, 523, 523, 659, 784, 1046, 784, 1046];
      for (var j = 0; j < seq.length; j++) tone(seq[j], 0.16, 'triangle', 0.2, j * 0.15);
    },
    /* VƯỢT CHƯỚNG NGẠI VẬT: bão tuyết */
    storm: function () {
      tone(200, 0.5, 'sawtooth', 0.2); tone(150, 0.6, 'sawtooth', 0.2, 0.1);
      tone(100, 0.7, 'square', 0.15, 0.2);
    }
  };
})();

/* Nhạc nền: mp3 (nếu thầy dán link) hoặc giai điệu tự sinh */
var Music = (function () {
  /* THẦY THAY NHẠC TẠI ĐÂY: sửa nốt nhạc giai điệu mặc định.
     Số = tần số (Hz), 0 = nghỉ một nhịp. */
  var MELODY = [
    523, 587, 659, 784, 880, 784, 659, 587,
    523, 587, 659, 587, 523, 0,   392, 440,
    523, 587, 659, 784, 880, 1046, 880, 784,
    659, 784, 659, 587, 523, 0,   523, 0
  ];
  var STEP_MS = 280;
  var audioEl = null, genTimer = null, step = 0, on = false;
  function stopAll() {
    if (audioEl) { try { audioEl.pause(); } catch (e) {} audioEl = null; }
    if (genTimer) { (G.clearInterval || clearInterval)(genTimer); genTimer = null; }
    on = false;
  }
  function startGen() {
    stopAll();
    var AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return;
    on = true;
    var playStep = function () {
      if (!on || !S.musicOn) return;
      var f = MELODY[step % MELODY.length]; step++;
      if (!f) return;
      try {
        var c = new AC();
        var t = c.currentTime;
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.3);
        o.onended = function () { try { c.close(); } catch (e) {} };
      } catch (e) {}
    };
    genTimer = (G.setInterval || setInterval)(playStep, STEP_MS);
  }
  return {
    start: function () {
      if (!S.musicOn) return;
      stopAll();
      if (S.musicUrl) {
        try {
          audioEl = new Audio(S.musicUrl);
          audioEl.loop = true; audioEl.volume = 0.5;
          var p = audioEl.play();
          if (p && p.catch) p.catch(function () { startGen(); });
          on = true;
        } catch (e) { startGen(); }
      } else {
        startGen();
      }
    },
    stop: function () { stopAll(); },
    toggle: function () {
      S.musicOn = !S.musicOn;
      if (S.musicOn) this.start(); else this.stop();
      return S.musicOn;
    }
  };
})();

/* ---------- Bấm chuông QR (thầy 2026-11-01) ---------- */
var Buzz = (function () {
  var db = null, inited = false;
  function init() {
    if (inited) return true;
    try {
      if (typeof firebase === 'undefined') return false;
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyCUFvW7wqGx4mXFEy7m7qZxmwz9wwPkX4c",  // ← THẦY ĐIỀN: copy từ src/lib/firebase.ts
          authDomain: "gamehocvui.firebaseapp.com",
          projectId: "gamehocvui"
        });
      }
      db = firebase.firestore();
      inited = true;
      return true;
    } catch (e) { return false; }
  }
  function newSession() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  function qrUrl(session) {
    var buzzPage = 'https://khogamehoctap.vercel.app/buzz/?s=' + session;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(buzzPage);
  }
  function listen(session, cb) {
    if (!init()) return null;
    stop();
    try {
      S.buzzUnsub = db.collection('buzz').doc(session).collection('queue')
        .orderBy('ts', 'asc')
        .onSnapshot(function (snap) {
          var q = [];
          snap.forEach(function (d) {
            var v = d.data();
            if (v && v.team) q.push({ team: v.team });
          });
          S.buzzQueue = q;
          cb(q);
        }, function (err) {
          toast('Lỗi bấm chuông: ' + err.message);
        });
    } catch (e) { toast('Lỗi bấm chuông: ' + e.message); }
    return S.buzzUnsub;
  }
  function stop() {
    if (S.buzzUnsub) { try { S.buzzUnsub(); } catch (e) {} S.buzzUnsub = null; }
  }
  function clear(session) {
    if (!init() || !session) return;
    db.collection('buzz').doc(session).collection('queue').get().then(function (snap) {
      snap.forEach(function (d) { d.ref.delete(); });
    }).catch(function () {});
    S.buzzQueue = [];
  }
  return { init: init, newSession: newSession, qrUrl: qrUrl, listen: listen, stop: stop, clear: clear };
})();

/* ---------- tiện ích DOM ---------- */
function $(id) { return document.getElementById(id); }
function bind(id, fn) {
  var el = $(id);
  if (el) el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function toast(msg) {
  var t = $('toast');
  if (!t) { try { alert(msg); } catch (e) {} return; }
  t.textContent = msg; t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2600);
}
/* ============================================================
   THẦY CHỈNH THÔNG BÁO ĐÚNG/SAI TẠI ĐÂY (2026-10-31)
   announce(): hiện chữ TO GIỮA MÀN HÌNH (thầy: "cho máu").
   - ANNOUNCE_MS: thời gian hiện (ms)
   - Vị trí/cỡ chữ/màu: sửa trong CSS #announce (có khung ghi chú)
   Dùng cho Đúng/Sai khi trả lời. Các game sau cũng dùng mẫu này.
   ============================================================ */
var ANNOUNCE_MS = 1200;
function announce(msg, ok) {
  var a = $('announce');
  if (!a) {  // tự tạo nếu vỏ HTML cũ chưa có (null-safe)
    a = document.createElement('div');
    a.id = 'announce';
    document.body.appendChild(a);
  }
  a.textContent = msg;
  a.className = ok ? 'ok' : 'bad';
  // force reflow để animation chạy lại
  void a.offsetWidth;
  a.classList.add('show');
  setTimeout(function () { a.classList.remove('show'); }, ANNOUNCE_MS);
}
function shuffle(a) {
  a = a.slice();
  for (var j = a.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = a[j]; a[j] = a[k]; a[k] = tmp;
  }
  return a;
}

/* ---------- hiển thị câu hỏi (KaTeX/ảnh qua QuizCommon, fallback text) ---------- */
function renderRich(el, html, text) {
  if (!el) return;
  var QC = G.QuizCommon;
  if (QC && html) {
    el.innerHTML = '';
    QC.setHTML(el, html);
  } else {
    el.textContent = text;
  }
}

/* ---------- ngân hàng câu hỏi ---------- */
function defaultQuestions() {
  var arr = (G.SmartEduSampleQuestions || []);
  return arr.map(function (q) {
    return { q: q.q, opts: (q.opts || []).slice(), ans: q.answer, qHtml: null, optsHtml: null };
  });
}
function effectiveBank() {
  var base = USE_DEFAULTS ? defaultQuestions() : [];
  var rich = RICHQ.map(function (r) {
    return { q: r.q, opts: r.opts, ans: r.ans, qHtml: r.qHtml, optsHtml: r.optsHtml };
  });
  return rich.concat(base);
}
function rebuildBank() {
  var n = effectiveBank().length;
  QINFO = 'Kho câu hỏi: ' + n + ' câu' + (TRIAL ? ' (bản chơi thử).' : '.');
  var qi = $('qBankInfo');
  if (qi) qi.textContent = QINFO;
  renderQBankTable();
}
function renderQBankTable() {
  var box = $('qBankTable'); if (!box) return;
  var all = effectiveBank();
  if (!all.length) { box.innerHTML = '<span class="muted">Chưa có câu hỏi.</span>'; return; }
  var h = '<table class="qtable"><tr><th>#</th><th>Câu hỏi</th><th>Đáp án</th></tr>';
  all.forEach(function (q, i) {
    var txt = (q.q || '').length > 60 ? (q.q || '').slice(0, 60) + '…' : (q.q || '');
    var ans = 'ABCD'[(q.ans == null ? -1 : q.ans)] || '?';
    h += '<tr><td>' + (i + 1) + '</td><td>' + esc(txt) + '</td><td><b>' + ans + '</b></td></tr>';
  });
  h += '</table>';
  box.innerHTML = h;
}

/* ---------- học sinh / đội ---------- */
function defaultStudents() {
  return (G.SmartEduDefaultStudents || []).slice();
}
function loadStudents() {
  try {
    var raw = localStorage.getItem(CFG.storeKey + CFG.storeSuffix);
    if (raw) { var a = JSON.parse(raw); if (a && a.length) return a; }
  } catch (e) {}
  return defaultStudents();
}
function saveStudents(list) {
  try { localStorage.setItem(CFG.storeKey + CFG.storeSuffix, JSON.stringify(list)); } catch (e) {}
}
function splitTeams(students, k) {
  var n = students.length;
  var base = Math.floor(n / k), rem = n % k;
  var idx = shuffle(students.map(function (_, i) { return i; }));
  var teams = [], p = 0;
  for (var d = 0; d < k; d++) {
    var cnt = base + (d < rem ? 1 : 0);
    var members = [];
    for (var m = 0; m < cnt; m++) members.push(students[idx[p++]]);
    teams.push({
      name: 'Đội ' + (d + 1),
      members: members,
      colorIdx: d % TEAM_COLORS.length,
      points: 0, pack: [], packIdx: 0, mine: [],
      timeLeft: 0, timerId: null, done: false, reason: '', digCount: 0
    });
  }
  return teams;
}

/* ---------- import Excel (học sinh) ---------- */
function importStudentsFromExcel(file) {
  if (!G.XLSX) { toast('Thiếu thư viện đọc Excel (xlsx.min.js).'); return; }
  var rd = new FileReader();
  rd.onload = function (e) {
    try {
      var wb = G.XLSX.read(e.target.result, { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var rows = G.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      var names = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]; if (!row || !row.length) continue;
        var cell = String(row[0] == null ? '' : row[0]).trim();
        if (i === 0 && /họ|tên|danh sách|stt/i.test(cell)) continue;
        if (/^\d+$/.test(cell) && row[1] != null && String(row[1]).trim()) {
          cell = String(row[1]).trim();
        }
        if (/^\d+$/.test(cell)) continue;
        if (cell) names.push(cell.split('\t')[0].trim());
      }
      if (!names.length) { toast('Không đọc được tên học sinh trong file.'); return; }
      saveStudents(names);
      renderStudentInfo(names);
      toast('Đã nhập ' + names.length + ' học sinh.');
    } catch (err) { toast('Lỗi đọc file Excel.'); }
  };
  rd.readAsArrayBuffer(file);
}
function renderStudentInfo(names) {
  var el = $('studentInfo');
  if (el) el.textContent = 'Đã có ' + names.length + ' học sinh' + (TRIAL ? ' (bản chơi thử).' : '.');
  var ta = $('studentList');
  if (ta) ta.value = names.join('\n');
}

/* ---------- import Word (câu hỏi, rich) ---------- */
function importQuestionsFromWord(file) {
  var QC = G.QuizCommon;
  if (!QC) { toast('Thiếu module QuizCommon.'); return; }
  QC.importQuestionsFromWord(file, {
    onOk: function (list) {
      var valid = [], bad = 0;
      list.forEach(function (r) {
        var okQ = r && r.q && (r.opts || []).length >= 2;
        var okA = r && r.answer != null && r.answer >= 0 && r.answer < (r.opts || []).length;
        if (okQ && okA) valid.push(r); else bad++;
      });
      RICHQ = valid.map(function (r) {
        return { q: r.q, opts: r.opts, ans: r.answer, qHtml: r.qHtml, optsHtml: r.optsHtml };
      });
      rebuildBank();
      var msg = 'Đã nhập ' + valid.length + ' câu hỏi.';
      if (bad) msg += ' Bỏ qua ' + bad + ' câu lỗi định dạng.';
      toast(msg);
      Snd.correct();
    },
    onEmpty: function () { toast('Không tìm được câu hỏi nào trong file Word.'); },
    onNoLib: function () { toast('Thiếu thư viện đọc Word (mammoth).'); },
    onError: function () { toast('Lỗi đọc file Word.'); }
  });
}
/* ---------- mỏ vàng ---------- */
/* Dựng mỏ cho 1 đội từ số câu trong gói của đội.
   Tỉ lệ MINE_RATIO tính trên 10 câu, tự co giãn + làm tròn. */
function buildMine(n) {
  var items = [];
  if (n > 0) {
    var s = n / 10;
    var counts = {};
    var total = 0;
    Object.keys(MINE_RATIO).forEach(function (type) {
      var c = Math.max(0, Math.round(MINE_RATIO[type] * s));
      counts[type] = c; total += c;
    });
    if (total === 0) { counts.goldS = 1; total = 1; }  // gói quá nhỏ → ít nhất 1 vàng nhỏ
    /* Sửa 2026-10-31 (thầy: đào tĩnh hiện cục vàng nhiều cỡ cho đẹp):
       mỗi ô có kích cỡ visual riêng ĐỘC LẬP với item thật bên dưới.
       Điểm vẫn theo item.type ẩn — cục to chưa chắc điểm cao.
       Sửa 2026-10-31 (thầy: để quả cầu vàng): vẽ bằng CSS, không dùng emoji */
    var visuals = ['s', 's', 'm', 'm', 'm', 'l', 'l'];
    Object.keys(counts).forEach(function (type) {
      for (var i = 0; i < counts[type]; i++) {
        items.push({
          type: type, dug: false, giftVal: null,
          visSize: visuals[Math.floor(Math.random() * visuals.length)]
        });
      }
    });
    items = shuffle(items);
  }
  return items;
}
/* Điểm khi đào 1 ô. Hộp quà bốc ngẫu nhiên lúc đào. */
function digValue(item) {
  if (!item) return 0;
  if (item.type === 'gift') {
    if (item.giftVal == null) {
      item.giftVal = GIFT_VALUES[Math.floor(Math.random() * GIFT_VALUES.length)];
    }
    return item.giftVal;
  }
  return POINTS[item.type] || 0;
}
function mineAllDug(mine) {
  for (var i = 0; i < mine.length; i++) if (!mine[i].dug) return false;
  return true;
}

/* ---------- chia gói câu hỏi (không trùng) ---------- */
function dealPacks(bank, k) {
  var idx = shuffle(bank.map(function (_, i) { return i; }));
  var packs = [];
  for (var d = 0; d < k; d++) packs.push([]);
  idx.forEach(function (qi, p) { packs[p % k].push(bank[qi]); });
  return packs;
}

/* ---------- logic chơi ---------- */
/* Đọc bảng ô chữ từ editor (thầy 2026-11-01 bản 2) */
function readGridEditor() {
  var grid = [];
  var count = 0;
  for (var r = 0; r < S.rows; r++) {
    var row = [];
    for (var c = 0; c < S.cols; c++) {
      var el = $('cell_' + r + '_' + c);
      var ch = el ? (el.value || '').trim().toUpperCase() : '';
      if (ch) { row.push({ ch: ch[0], opened: false, red: false }); count++; }
      else row.push(null);
    }
    grid.push(row);
  }
  return { grid: grid, count: count };
}
function startDig() {
  var k = TRIAL ? 2 : parseInt(($('teamCount') || {}).value || '2', 10);
  if (!(k >= 2 && k <= CFG.maxTeams)) { toast('Số đội từ 2 đến ' + CFG.maxTeams + '.'); return; }
  var qs = TRIAL ? 30 : parseInt(($('qSeconds') || {}).value || '30', 10);
  if (!(qs >= 10 && qs <= 300)) { toast('Thời gian mỗi câu từ 10 đến 300 giây.'); return; }
  S.qSeconds = qs;
  /* Đọc bảng ô chữ */
  var g;
  if (TRIAL) {
    S.rows = 4; S.cols = 5;
    g = { grid: [], count: 0 };
    for (var r = 0; r < 4; r++) {
      var row = [];
      for (var c = 0; c < 5; c++) {
        var ch = DEFAULT_GRID_LETTERS[r + ',' + c];
        if (ch) { row.push({ ch: ch, opened: false, red: false }); g.count++; }
        else row.push(null);
      }
      g.grid.push(row);
    }
    S.keyword = DEFAULT_KEYWORD;
  } else {
    S.rows = parseInt(($('gridRows') || {}).value || DEFAULT_ROWS, 10);
    S.cols = parseInt(($('gridCols') || {}).value || DEFAULT_COLS, 10);
    if (!(S.rows >= 2 && S.rows <= 12 && S.cols >= 2 && S.cols <= 12)) { toast('Bảng từ 2×2 đến 12×12.'); return; }
    g = readGridEditor();
    if (g.count < 1) { toast('Hãy nhập ít nhất 1 chữ vào bảng!'); return; }
    S.keyword = (($('keywordInput') || {}).value || '').trim().toUpperCase();
    if (!S.keyword) { toast('Hãy nhập từ khoá!'); return; }
  }
  S.grid = g.grid;
  var students = loadStudents();
  if (students.length < k) { toast('Số học sinh ít hơn số đội!'); return; }
  var bank = effectiveBank();
  if (!bank.length) { toast('Chưa có câu hỏi! Hãy nhập câu hỏi.'); return; }
  S.bank = shuffle(bank.slice());  // xáo chung, dùng dần
  S.bankIdx = 0;
  S.teams = splitTeams(students, k);
  S.teams.forEach(function (t) { t.points = 0; t.penalty = 0; });
  S.order = S.teams.map(function (_, i) { return i; });
  shuffle(S.order);
  S.curTeam = -1;  // nextPick() +1 → đội đầu tiên
  S.winner = -1;
  // Bấm chuông QR
  S.buzzSession = Buzz.newSession();
  S.buzzQueue = [];
  Buzz.listen(S.buzzSession, function () { if (S.screen === 'play') render(); });
  S.started = true;
  S.screen = 'play';
  Snd.click();
  Music.start();
  nextPick();
  render();
}
/* Lấy câu hỏi tiếp theo (xáo chung) */
function nextQuestion() {
  if (S.bankIdx >= S.bank.length) {
    S.bank = shuffle(effectiveBank().slice());
    S.bankIdx = 0;
  }
  return S.bank[S.bankIdx++];
}
/* Đội hiện tại (bỏ qua đội bị cấm) */
function team() { return S.teams[S.order[S.curTeam]]; }
function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
/* Chuyển lượt chọn ô (bỏ qua đội bị cấm 2 vòng) */
function nextPick() {
  stopQTimer();
  // kiểm tra hết ô chưa
  if (allCellsResolved()) { endGame(-1); return; }
  var tries = 0;
  while (tries < S.order.length) {
    S.curTeam = (S.curTeam + 1) % S.order.length;
    // vòng đầu: curTeam bắt đầu -1 → thành 0
    var t = team();
    if (t.penalty > 0) { t.penalty--; tries++; continue; }
    break;
  }
  S.phase = 'pick';
  S.cur = null; S.curCell = null; S.stealTried = [];
  if (S.buzzSession) Buzz.clear(S.buzzSession);
  render();
}
function allCellsResolved() {
  for (var r = 0; r < S.rows; r++)
    for (var c = 0; c < S.cols; c++) {
      var cell = S.grid[r][c];
      if (cell && !cell.opened && !cell.red) return false;
    }
  return true;
}
/* Đội bấm chọn 1 ô */
function pickCell(r, c) {
  if (S.screen !== 'play' || S.phase !== 'pick') return;
  var cell = S.grid[r][c];
  if (!cell || cell.opened || cell.red) return;
  S.curCell = { r: r, c: c };
  S.cur = nextQuestion();
  S.phase = 'answer';
  S.stealTried = [];
  startQTimer();
  render();
}
/* Đồng hồ mỗi câu */
function startQTimer() {
  stopQTimer();
  S.timeLeft = S.qSeconds;
  S.timerId = setInterval(function () {
    S.timeLeft--;
    var el = $('qTimerText'); if (el) el.textContent = fmtTime(S.timeLeft);
    var bar = $('qTimerBar'); if (bar) bar.style.width = Math.max(0, Math.round(S.timeLeft / S.qSeconds * 100)) + '%';
    if (S.timeLeft <= 0) onQTimeout();
  }, 1000);
}
function stopQTimer() { if (S.timerId) { clearInterval(S.timerId); S.timerId = null; } }
function onQTimeout() {
  stopQTimer();
  if (S.phase === 'answer') {
    // đội chọn hết giờ → coi như sai → sang cướp
    toast('Hết giờ! Quyền trả lời cho các đội còn lại.');
    toStealPhase();
  } else if (S.phase === 'steal') {
    // cướp hết giờ → ô đỏ
    lockRed('Hết giờ cướp');
  }
}
/* Đội chọn ô trả lời */
function answer(optIdx) {
  if (S.screen !== 'play' || S.phase !== 'answer' || !S.cur) return;
  stopQTimer();
  var t = team();
  if (optIdx === S.cur.ans) {
    Snd.correct();
    announce('✅ ĐÚNG! +10đ', true);
    t.points += 10;
    openCell();
    nextPick();  // đội tiếp theo chọn (luân phiên)
  } else {
    Snd.wrong();
    announce('❌ SAI!', false);
    toast('Quyền trả lời cho các đội còn lại!');
    toStealPhase();
  }
}
/* Chuyển sang phase cướp */
function toStealPhase() {
  S.phase = 'steal';
  S.stealTried = [S.order[S.curTeam]];  // đội chọn sai không được cướp lại
  startQTimer();
  render();
}
/* Mở ô hiện tại */
function openCell() {
  var cell = S.grid[S.curCell.r][S.curCell.c];
  cell.opened = true;
  Snd.correct();
}
/* Khoá ô đỏ (không ai trả lời được) */
function lockRed(reason) {
  var cell = S.grid[S.curCell.r][S.curCell.c];
  cell.red = true;
  Snd.wrong();
  announce('🔴 KHOÁ Ô!', false);
  toast(reason + ' — ô bị khoá đỏ.');
  nextPick();  // đội tiếp theo chọn (luân phiên)
}
/* Đội cướp trả lời (GV bấm chọn đội rồi bấm đáp án) */
var stealTeamIdx = -1;
function selectStealTeam(i) {
  stealTeamIdx = i;
  render();
}
function stealAnswer(optIdx) {
  if (S.screen !== 'play' || S.phase !== 'steal' || !S.cur || stealTeamIdx < 0) return;
  stopQTimer();
  var t = S.teams[stealTeamIdx];
  if (optIdx === S.cur.ans) {
    Snd.correct();
    announce('✅ CƯỚP ĐÚNG! +10đ', true);
    t.points += 10;
    openCell();
    nextPick();  // đội tiếp theo chọn (luân phiên)
  } else {
    Snd.wrong();
    announce('❌ CƯỚP SAI! −5đ', false);
    t.points -= 5;
    S.stealTried.push(stealTeamIdx);
    stealTeamIdx = -1;
    // còn đội nào được cướp không?
    if (stealCandidates().length === 0) {
      lockRed('Không đội nào trả lời được');
    } else {
      startQTimer();
      render();
    }
  }
}
/* Các đội được quyền cướp (chưa thử, không bị cấm) */
function stealCandidates() {
  var out = [];
  for (var i = 0; i < S.teams.length; i++) {
    if (S.stealTried.indexOf(i) >= 0) continue;
    if (S.teams[i].penalty > 0) continue;
    out.push(i);
  }
  return out;
}
/* Không ai cướp → khoá đỏ */
function noSteal() {
  stopQTimer();
  lockRed('Không đội nào cướp');
}
/* Đoán từ khoá */
function guessKeyword() {
  if (S.screen !== 'play') return;
  var t = team();
  var ans = prompt('🔔 Đoán từ khoá (gõ đủ dấu):');
  if (ans == null) return;
  ans = ans.trim().toUpperCase();
  if (!ans) return;
  if (ans === S.keyword) {
    stopQTimer();
    S.winner = S.order[S.curTeam];
    t.points += 100;
    // mở toàn bộ
    for (var r = 0; r < S.rows; r++)
      for (var c = 0; c < S.cols; c++) {
        var cell = S.grid[r][c];
        if (cell) cell.opened = true;
      }
    Snd.fanfare();
    announce('🎉 ĐOÁN TRÚNG TỪ KHOÁ! +100đ', true);
    render();
    setTimeout(function () { endGame(S.winner); }, 2500);
  } else {
    Snd.wrong();
    announce('❌ SAI TỪ KHOÁ!', false);
    t.penalty = 2;  // cấm 2 vòng: không chọn, không cướp
    toast(t.name + ' bị cấm 2 vòng!');
    render();
  }
}
/* Kết thúc game */
function endGame(winnerIdx) {
  stopQTimer();
  Buzz.stop();
  S.winner = winnerIdx;
  S.screen = 'result';
  Music.stop();
  Snd.fanfare();
  render();
}
function rankTeams() {
  return S.teams.map(function (_, i) { return i; })
    .sort(function (a, b) { return S.teams[b].points - S.teams[a].points; });
}

/* ---------- render ---------- */
function scorebarHtml(activeIdx) {
  var h = '<div id="scorebar">';
  S.teams.forEach(function (t, i) {
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    h += '<div class="chip' + (i === activeIdx ? ' me' : '') + '"' +
      (t.penalty > 0 ? ' style="opacity:.55"' : '') + '>' +
      '<span class="dot" style="background:' + c.css + '"></span>' +
      esc(t.name) + ': <b>' + t.points + 'đ</b>' +
      (t.penalty > 0 ? ' ⛔' + t.penalty : '') + '</div>';
  });
  h += '</div>';
  return h;
}
/* ============================================================
   ĐÀO ĐỘNG (2026-10-31, thầy yêu cầu): canvas móc treo thả gắp vật thật.
   - Móc đu đưa ±60°, bấm THẢ MÓC để thả theo góc hiện tại
   - Vật hiện đúng hình dạng: to=điểm cao, bé=điểm thấp, bom/quà/kim cương rõ ràng
   - Còn ≤3 vật → tự thêm 3 vật ngẫu nhiên (không bao giờ hết mỏ)
   - KHÔNG kết thúc khi hết mỏ — chỉ hết giờ hoặc hết câu hỏi
   ============================================================ */
/* ============================================================
   THẦY CHỈNH MÓC TREO TẠI ĐÂY (2026-10-31)
   - HOOK_MAX_ANGLE: góc đu tối đa (radian). 1.31 = ±75°
   - HOOK_SWING_SPEED: tốc độ đu (radian/khung hình). Càng lớn càng nhanh
   - HOOK_EXTEND_SPEED: tốc độ thả móc xuống (pixel/khung hình)
   - HOOK_RETRACT_SPEED: tốc độ kéo móc lên (pixel/khung hình)
   ============================================================ */
var HOOK_MAX_ANGLE = 1.31;      // ±75° (thầy yêu cầu tăng từ 60°)
var HOOK_SWING_SPEED = 0.025;   // tốc độ đu (thầy chỉnh 10:xx — chậm lại)
var HOOK_EXTEND_SPEED = 4;      // tốc độ thả móc (thầy chỉnh)
var HOOK_RETRACT_SPEED = 3;     // tốc độ kéo móc lên (thầy chỉnh — kéo từ từ)
/* ============================================================
   THẦY CHỈNH VỊ TRÍ HIỆN ĐIỂM TẠI ĐÂY (2026-10-31)
   Điểm bay hiện tại ĐẦU MÓC lúc gắp trúng.
   - FLOAT_DX: lệch ngang so với đầu móc (pixel; + sang phải, - sang trái)
   - FLOAT_DY: lệch dọc so với đầu móc (pixel; số âm = lên trên)
   - FLOAT_SIZE: cỡ chữ điểm (pixel)
   - FLOAT_RISE: tốc độ chữ bay lên (pixel/khung hình)
   ============================================================ */
var FLOAT_DX = 0;      // lệch ngang
var FLOAT_DY = -10;    // lệch dọc (hiện phía trên đầu móc 10px)
var FLOAT_SIZE = 28;   // cỡ chữ
var FLOAT_RISE = 1.2;  // tốc độ bay lên
var DYN = null;
function dynItemRadius(type) {
  /* bán kính vật theo loại (to=điểm cao) */
  return { rock: 22, goldS: 14, goldM: 20, goldL: 28, diamond: 16, bomb: 18, gift: 20 }[type] || 16;
}
function buildDynMine(n) {
  /* dựng mỏ động: ĐÚNG n vật (không scale như buildMine), vị trí ngẫu nhiên không chồng lấp */
  /* Sửa 2026-10-31: buildMine(15) scale thành 27 vật — sai ý thầy (15 vật) */
  var totalRatio = 0;
  Object.keys(MINE_RATIO).forEach(function (k) { totalRatio += MINE_RATIO[k]; });
  var items = [];
  Object.keys(MINE_RATIO).forEach(function (type) {
    var c = Math.round(MINE_RATIO[type] / totalRatio * n);
    for (var i = 0; i < c; i++) items.push({ type: type, dug: false, giftVal: null });
  });
  while (items.length < n) items.push({ type: 'goldS', dug: false, giftVal: null });
  while (items.length > n) items.pop();
  items = shuffle(items);
  var W = 900, H = 340, placed = [];
  items.forEach(function (it) {
    var r = dynItemRadius(it.type), x, y, ok, tries = 0;
    do {
      ok = true;
      /* Sửa 2026-10-31: tránh rìa quá xa để móc với tới (góc 75° móc quét ngang nhanh) */
      x = 80 + Math.random() * (W - 160);
      y = 140 + Math.random() * (H - 180);
      for (var i = 0; i < placed.length; i++) {
        var p = placed[i], dx = x - p.x, dy = y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < r + p.r + 12) { ok = false; break; }
      }
      tries++;
    } while (!ok && tries < 60);
    placed.push({ x: x, y: y, r: r });
    it.x = x; it.y = y; it.r = r; it.taken = false;
  });
  return items;
}
function dynRefill(t) {
  /* còn ≤3 vật chưa gắp → thêm 3 vật ngẫu nhiên */
  var left = t.mine.filter(function (it) { return !it.taken; }).length;
  if (left > 3) return;
  var add = buildDynMine(3);
  /* đặt vị trí cho 3 vật mới */
  var W = 900, H = 340;
  add.forEach(function (it) {
    var x, y, ok, tries = 0;
    do {
      ok = true;
      x = 40 + Math.random() * (W - 80);
      y = 120 + Math.random() * (H - 160);
      for (var i = 0; i < t.mine.length; i++) {
        var p = t.mine[i];
        if (p.taken) continue;
        var dx = x - p.x, dy = y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < it.r + p.r + 12) { ok = false; break; }
      }
      tries++;
    } while (!ok && tries < 60);
    it.x = x; it.y = y; it.taken = false;
    t.mine.push(it);
  });
  toast('⛏️ Mỏ được bổ sung thêm 3 vật!');
}

function dynMineHtml(t) {
  var h = '<div class="minewrap"><div class="minetitle">🪝 Mỏ vàng động — ' + esc(t.name) +
    ' <span class="muted">(còn ' + t.mine.filter(function (it) { return !it.taken; }).length + ' vật)</span></div>';
  h += '<canvas id="dynCanvas" width="900" height="340" class="dyncanvas"></canvas>';
  var canDrop = (S.phase === 'dig' && !t.done && DYN && DYN.state === 'swing');
  h += '<div class="row center"><button id="btnDrop" class="btn primary big"' +
    (canDrop ? '' : ' disabled') + '>🪝 THẢ MÓC</button></div>';
  h += '</div>';
  return h;
}
/* Vẽ 1 vật trong mỏ động: vàng/đá vẽ hình (emoji không hiện), còn lại dùng emoji */
function dynDrawItem(ctx, it) {
  var r = it.r, x = it.x, y = it.y;
  if (it.type === 'rock') {
    ctx.fillStyle = '#6b7280';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4b5563';
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (it.type === 'goldS' || it.type === 'goldM' || it.type === 'goldL') {
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.15, x, y, r);
    g.addColorStop(0, '#ffe066'); g.addColorStop(0.6, '#f5b301'); g.addColorStop(1, '#9a6b00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a5200'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else {
    var iv = ITEM_VIEW[it.type];
    ctx.font = (r * 2) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(iv.emoji, x, y);
  }
}
/* Vẽ canvas đào động: móc treo + vật */
function dynDraw() {
  var cv = document.getElementById('dynCanvas');
  if (!cv || !DYN) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  /* nền mỏ */
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a1208'); g.addColorStop(1, '#2d1f0e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  var t = team();
  if (!t) return;
  /* vẽ vật chưa gắp */
  /* Sửa 2026-10-31: emoji 🪙🪨 có máy không hiển thị trên canvas → vàng/đá vẽ bằng hình */
  t.mine.forEach(function (it) {
    if (it.taken) return;
    dynDrawItem(ctx, it);
  });
  /* vẽ móc treo — đẹp: đế + dây + càng cua 3 chấu */
  var px = W / 2, py = 10;
  var ang = DYN.angle, len = DYN.len;
  var hx = px + Math.sin(ang) * len, hy = py + Math.cos(ang) * len;
  /* đế treo */
  ctx.fillStyle = '#5a4426';
  ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
  /* dây */
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke();
  /* càng cua: 3 chấu */
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(-ang);  // giữ càng cua thẳng đứng
  ctx.strokeStyle = '#e8c547'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  /* chấu giữa */
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 26, 6, 0, Math.PI); ctx.stroke();  // móc cong
  /* chấu trái */
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 16); ctx.stroke();
  ctx.beginPath(); ctx.arc(-16, 20, 5, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  /* chấu phải */
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 16); ctx.stroke();
  ctx.beginPath(); ctx.arc(16, 20, 5, Math.PI * 1.5, Math.PI * 0.5); ctx.stroke();
  ctx.restore();
  /* vật đang gắp theo móc */
  if (DYN.held) {
    var hx2 = DYN.held;
    var sx = hx, sy = hy + 26;
    var ox = hx2.x, oy = hx2.y;
    hx2.x = sx; hx2.y = sy;
    dynDrawItem(ctx, hx2);
    hx2.x = ox; hx2.y = oy;
  }
  /* Sửa 2026-10-31 (thầy: điểm hiện tại chỗ móc): vẽ chữ điểm bay */
  if (DYN.floaters) {
    DYN.floaters.forEach(function (fl) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, fl.life));
      ctx.font = 'bold ' + FLOAT_SIZE + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
      ctx.restore();
    });
  }
}
function dynTick() {
  if (!DYN) return;
  /* Sửa 2026-10-31: cập nhật chữ điểm bay (nổi lên + mờ dần) */
  if (DYN.floaters) {
    for (var fi = DYN.floaters.length - 1; fi >= 0; fi--) {
      var fl = DYN.floaters[fi];
      fl.y -= FLOAT_RISE; fl.life -= 0.012;
      if (fl.life <= 0) DYN.floaters.splice(fi, 1);
    }
  }
  if (DYN.state === 'swing') {
    DYN.angle += DYN.dir * HOOK_SWING_SPEED;
    if (DYN.angle > HOOK_MAX_ANGLE) { DYN.angle = HOOK_MAX_ANGLE; DYN.dir = -1; }
    if (DYN.angle < -HOOK_MAX_ANGLE) { DYN.angle = -HOOK_MAX_ANGLE; DYN.dir = 1; }
  } else if (DYN.state === 'extend') {
    DYN.len += HOOK_EXTEND_SPEED;
    var cv = document.getElementById('dynCanvas');
    var maxLen = cv ? Math.sqrt(cv.width * cv.width + cv.height * cv.height) : 900;
    /* kiểm tra chạm vật */
    var t = team();
    var px = 450, py = 10;
    var hx = px + Math.sin(DYN.angle) * DYN.len, hy = py + Math.cos(DYN.angle) * DYN.len;
    var hit = null;
    if (t) {
      for (var i = 0; i < t.mine.length; i++) {
        var it = t.mine[i];
        if (it.taken) continue;
        var dx = hx - it.x, dy = hy - it.y;
        if (Math.sqrt(dx * dx + dy * dy) < it.r + 10) { hit = it; break; }
      }
    }
    if (hit) { DYN.held = hit; DYN.state = 'retract'; Snd.grab(); }
    /* Sửa 2026-10-31: móc chạm biên (trên/dưới/trái/phải) thì thu về — trước đây chỉ chặn dưới nên góc lớn móc chạy ra ngoài mà không thu */
    else if (DYN.len >= maxLen || hy > 340 || hy < 0 || hx < 0 || hx > 900) { DYN.state = 'retract'; }
  } else if (DYN.state === 'retract') {
    DYN.len -= HOOK_RETRACT_SPEED;
    if (DYN.len <= 40) {
      DYN.len = 40; DYN.state = 'swing';
      if (DYN.held) {
        /* gắp thành công: cộng điểm */
        var t2 = team();
        var item = DYN.held;
        item.taken = true;
        var val = digValue(item);
        t2.points += val;
        t2.digCount++;
        var iname = ITEM_VIEW[item.type].name;
        /* Sửa 2026-10-31 (thầy: hiện điểm bay tại chỗ móc) — thêm chữ điểm nổi */
        var cvf = document.getElementById('dynCanvas');
        var fpx = cvf ? cvf.width / 2 : 450, fpy = 10;
        var fhx = fpx + Math.sin(DYN.angle) * DYN.len, fhy = fpy + Math.cos(DYN.angle) * DYN.len;
        DYN.floaters.push({
          x: fhx + FLOAT_DX, y: fhy + FLOAT_DY,
          text: (val >= 0 ? '+' : '') + val + 'đ',
          color: val >= 0 ? '#ffd34d' : '#ff6b6b',
          life: 1.0
        });
        if (val >= 0) { Snd.correct(); toast('⛏️ Gắp được ' + iname + ' +' + val + 'đ!'); }
        else { Snd.wrong(); toast('💣 Gắp phải ' + iname + ' ' + val + 'đ!'); }
        DYN.held = null;
        dynRefill(t2);
        /* Sửa 2026-10-31 (BUG thầy báo: chỉ bốc 1 câu) — phải sang câu tiếp */
        nextQuestionOrEnd();
      } else {
        /* thả hụt */
        toast('🪝 Thả hụt rồi!');
        /* Sửa 2026-10-31: hụt cũng sang câu tiếp (đã dùng lượt đào) */
        nextQuestionOrEnd();
      }
    }
  }
  dynDraw();
}
function dynDrop() {
  if (!DYN || DYN.state !== 'swing') return;
  var t = team();
  if (!t || t.done || S.phase !== 'dig') return;
  DYN.state = 'extend';
  Snd.drop();
  var btn = document.getElementById('btnDrop');
  if (btn) btn.disabled = true;
}
function dynStart() {
  DYN = { angle: 0, dir: 1, len: 40, state: 'swing', held: null, timer: 0, floaters: [] };
  cancelAnimationFrame(DYN.timer);
  var loop = function () {
    if (!DYN) return;
    /* chỉ chạy khi đang ở màn hình chơi và chế độ động */
    if (S.digMode === 'dynamic' && (S.screen === 'play')) dynTick();
    DYN.timer = requestAnimationFrame(loop);
  };
  loop();
}
function dynStop() {
  if (DYN) { cancelAnimationFrame(DYN.timer); DYN = null; }
}

/* Bảng ô chữ */
/* Bảng ô chữ (lúc chơi: không đánh số) */
function crosswordHtml() {
  var t = team();
  var h = '<div class="crosswrap"><div class="crosstitle">📝 Ô chữ' +
    (t ? ' — <span style="color:' + TEAM_COLORS[t.colorIdx % TEAM_COLORS.length].css + '">' + esc(t.name) + '</span> đang chọn ô' : '') + '</div>';
  h += '<table class="crosstable">';
  for (var r = 0; r < S.rows; r++) {
    h += '<tr>';
    for (var c = 0; c < S.cols; c++) {
      var cell = S.grid[r][c];
      if (!cell) {
        h += '<td><div class="cell empty"></div></td>';
        continue;
      }
      var cls = 'cell' + (cell.opened ? ' open' : '') + (cell.red ? ' red' : '');
      var canPick = (S.phase === 'pick' && !cell.opened && !cell.red);
      var content = cell.opened ? esc(cell.ch) : '';
      if (canPick) {
        h += '<td><button class="' + cls + ' pickable" data-r="' + r + '" data-c="' + c + '">' + content + '</button></td>';
      } else {
        h += '<td><div class="' + cls + '">' + content + '</div></td>';
      }
    }
    h += '</tr>';
  }
  h += '</table>';
  // nút đoán từ khoá
  if (S.screen === 'play' && S.winner < 0) {
    h += '<div class="row center" style="margin-top:10px">' +
      '<button id="btnGuess" class="btn primary big">🔔 ĐOÁN TỪ KHOÁ</button></div>';
  }
  h += '</div>';
  return h;
}
function questionHtml() {
  if (!S.cur) return '';
  var h = '<div class="panel qpanel">';
  if (S.phase === 'answer') {
    var t = team();
    h += '<div class="qhead"><span class="qteam">' + esc(t.name) + '</span>' +
      '<span class="qtimer">⏱ <span id="qTimerText">' + fmtTime(S.timeLeft) + '</span></span></div>';
  } else if (S.phase === 'steal') {
    h += '<div class="qhead"><span class="qteam">🔔 CƯỚP!</span>' +
      '<span class="qtimer">⏱ <span id="qTimerText">' + fmtTime(S.timeLeft) + '</span></span></div>';
    h += '<div class="stealnotice">Quyền trả lời cho các đội còn lại!</div>';
  }
  h += '<div class="qtimerbar"><div class="qtimerfill" id="qTimerBar" style="width:100%"></div></div>';
  h += '<div id="qText" class="qtext"></div><div id="qOpts" class="qopts"></div>';
  // phase cướp: QR bấm chuông + hàng chờ
  if (S.phase === 'steal') {
    if (S.buzzSession) {
      h += '<div class="buzzpanel"><b>📱 HS quét QR để cướp:</b><br>' +
        '<img src="' + Buzz.qrUrl(S.buzzSession) + '" alt="QR" style="width:140px;height:140px;border:4px solid #fff;border-radius:8px;">' +
        '<div class="muted">Mã phòng: <b>' + S.buzzSession + '</b></div>';
      if (S.buzzQueue.length) {
        h += '<div class="buzzqueue"><b>🔔 Hàng chờ:</b><ol>';
        S.buzzQueue.forEach(function (b, i) {
          h += '<li>Đội ' + b.team + (i === 0 ? ' ⚡' : '') + '</li>';
        });
        h += '</ol></div>';
      } else {
        h += '<div class="muted">Chưa có đội nào bấm chuông...</div>';
      }
      h += '<button id="btnClearBuzz" class="btn btn-sm ghost">🗑 Xóa hàng chờ</button></div>';
    }
    h += '<div class="stealteams"><b>Đội cướp (chọn tay):</b> ';
    var cands = stealCandidates();
    if (!cands.length) {
      h += '<span class="muted">Không còn đội nào được cướp.</span>';
    } else {
      cands.forEach(function (i) {
        var tm = S.teams[i];
        var sel = (stealTeamIdx === i) ? ' sel' : '';
        h += '<button class="btn btn-sm stealbtn' + sel + '" data-team="' + i + '">' + esc(tm.name) + '</button> ';
      });
    }
    h += '<button id="btnNoSteal" class="btn btn-sm ghost">🔴 Không ai trả lời được</button></div>';
    if (stealTeamIdx >= 0) {
      h += '<div class="muted">👆 GV bấm đáp án mà <b>' + esc(S.teams[stealTeamIdx].name) + '</b> chọn.</div>';
    } else {
      h += '<div class="muted">👆 GV chọn đội cướp trước, rồi bấm đáp án.</div>';
    }
  } else {
    h += '<div class="muted" style="margin-top:8px">👆 GV bấm vào đáp án đội vừa trả lời.</div>';
  }
  h += '</div>';
  return h;
}
/* Vẽ bảng editor nhập chữ (giữ chữ cũ khi đổi kích thước) */
function buildGridEditor() {
  var rN = parseInt(($('gridRows') || {}).value || DEFAULT_ROWS, 10);
  var cN = parseInt(($('gridCols') || {}).value || DEFAULT_COLS, 10);
  rN = Math.max(2, Math.min(12, rN)); cN = Math.max(2, Math.min(12, cN));
  // lưu chữ cũ
  var old = {};
  var ed = $('gridEditor');
  if (ed) {
    var inputs = ed.querySelectorAll('input[data-r]');
    for (var i = 0; i < inputs.length; i++) {
      var v = (inputs[i].value || '').trim().toUpperCase();
      if (v) old[inputs[i].getAttribute('data-r') + ',' + inputs[i].getAttribute('data-c')] = v[0];
    }
  }
  S.rows = rN; S.cols = cN;
  var h = '<table class="grideditor">';
  for (var r = 0; r < rN; r++) {
    h += '<tr>';
    for (var c = 0; c < cN; c++) {
      var v = old[r + ',' + c] || '';
      h += '<td><input id="cell_' + r + '_' + c + '" data-r="' + r + '" data-c="' + c + '" maxlength="1" value="' + esc(v) + '"></td>';
    }
    h += '</tr>';
  }
  h += '</table><div class="muted">Ô nào có chữ sẽ vàng lúc chơi. Ô trống = không chơi.</div>';
  if (ed) ed.innerHTML = h;
}
function renderSetup() {
  var root = $('screen'); if (!root) return;
  var h = '<div class="screen">' +
    (TRIAL ? '<div class="badge-trial">BẢN CHƠI THỬ — 2 đội, bảng mẫu</div>' : '') +
    '<h1 class="game-title">📝 Vượt Chướng Ngại Vật: Ô Chữ</h1>' +
    '<div class="subtitle">Chọn ô → trả lời đúng mở ô → đoán trúng từ khoá thắng!</div>' +
    '<div class="cfg">';
  if (!TRIAL) {
    h += '<label>Số đội (2–8): <input id="teamCount" type="number" min="2" max="8" value="2"></label>';
    h += '<label>Thời gian trả lời mỗi câu (giây): <input id="qSeconds" type="number" min="10" max="300" value="30"></label>';
    h += '<div class="gridsetup"><b>📝 Bảng ô chữ</b> <span class="muted">(nhập chữ vào từng ô)</span><br>' +
      '<label>Số hàng: <input id="gridRows" type="number" min="2" max="12" value="' + DEFAULT_ROWS + '" style="width:60px"></label> ' +
      '<label>Số cột: <input id="gridCols" type="number" min="2" max="12" value="' + DEFAULT_COLS + '" style="width:60px"></label> ' +
      '<button id="btnResizeGrid" class="btn btn-sm">↔ Tạo lại bảng</button>' +
      '<div id="gridEditor"></div></div>';
    h += '<label>🔑 Từ khoá (gõ đủ dấu): <input id="keywordInput" type="text" placeholder="VD: HÀM SỐ BẬC HAI" style="width:300px"></label>';
    h += '<div class="row muted">Đúng +10đ mở ô · Cướp đúng +10đ, cướp sai −5đ · Đoán trúng từ khoá +100đ · Đoán sai cấm 2 vòng</div>';
    h += '<label>Link nhạc nền (mp3, để trống = nhạc mặc định): <input id="musicUrl" type="text" placeholder="https://.../nhac.mp3"></label>';
    h += '<label class="chk"><input id="musicOn" type="checkbox" checked> 🔊 Nhạc nền</label>';
  } else {
    h += '<div class="hint">Bản chơi thử: 2 đội, bảng mẫu 4×5, từ khoá "TOÁN".</div>';
  }
  h += '</div><div class="row">' +
    '<button class="btn primary big" id="btnPlay">▶ Bắt đầu chơi</button>' +
    '<button class="btn ghost" id="btnHelp">📖 Hướng dẫn</button>' +
    '<button class="btn ghost" id="btnFull">⛶ Toàn màn hình</button></div>';
  if (!TRIAL) {
    h += '<div class="panel setup"><h3>⚙ Cài đặt</h3>' +
      '<div class="hint" id="studentInfo"></div>' +
      '<div class="row"><label class="filebtn">📥 Nhập HS (Excel)<input type="file" id="fileExcel" accept=".xlsx,.xls" hidden></label>' +
      '<label class="filebtn">📝 Nhập câu hỏi (Word)<input type="file" id="fileWord" accept=".docx,.doc" hidden></label></div>' +
      '<div class="row"><button class="btn ghost btn-sm" id="btnClearQ">🗑 Xóa câu hỏi đã nhập</button> ' +
      '<button class="btn ghost btn-sm" id="btnToggleDefaults">🗑 Xóa câu mẫu</button></div>' +
      '<div class="hint" id="qBankInfo"></div><div id="qBankTable"></div>' +
      '</div>';
  } else {
    h += '<div class="hint" id="qBankInfo"></div>';
  }
  h += '<div id="helpBox" class="panel hidden"><h3>📖 Hướng dẫn chơi</h3>' + guideHtml() + '</div>';
  h += '</div>';
  root.innerHTML = h;
  bind('btnPlay', startDig);
  bind('btnHelp', function () { var b = $('helpBox'); if (b) b.classList.toggle('hidden'); Snd.click(); });
  bind('btnFull', toggleFullscreen);
  if (!TRIAL) {
    buildGridEditor();
    bind('btnResizeGrid', buildGridEditor);
    bind('btnClearQ', function () {
      if (!RICHQ.length) { toast('Chưa có câu hỏi nào đã nhập.'); return; }
      if (confirm('Xóa tất cả câu hỏi đã nhập? (Câu mẫu giữ lại)')) {
        RICHQ = []; rebuildBank(); toast('Đã xóa câu hỏi đã nhập.');
      }
    });
    bind('btnToggleDefaults', function () {
      USE_DEFAULTS = !USE_DEFAULTS;
      rebuildBank();
      var btn = $('btnToggleDefaults');
      if (btn) btn.textContent = USE_DEFAULTS ? '🗑 Xóa câu mẫu' : '↩ Khôi phục câu mẫu';
      toast(USE_DEFAULTS ? 'Đã bật lại câu hỏi mẫu.' : 'Đã tắt câu hỏi mẫu. Chỉ chơi câu đã nhập.');
    });
    var fe = $('fileExcel');
    if (fe) fe.addEventListener('change', function () { if (fe.files[0]) importStudentsFromExcel(fe.files[0]); fe.value = ''; });
    var fw = $('fileWord');
    if (fw) fw.addEventListener('change', function () { if (fw.files[0]) importQuestionsFromWord(fw.files[0]); fw.value = ''; });
    var mu = $('musicUrl');
    if (mu) mu.addEventListener('change', function () { S.musicUrl = mu.value.trim(); });
    var mo = $('musicOn');
    if (mo) mo.addEventListener('change', function () { S.musicOn = mo.checked; });
    renderStudentInfo(loadStudents());
  }
  rebuildBank();
}
function guideHtml() {
  return '<ul class="guide">' +
    '<li>👥 <b>Chia đội</b> — các đội lần lượt chọn ô.</li>' +
    '<li>📝 <b>Bảng ô chữ</b> — GV nhập chữ vào từng ô (mặc định 10×8); ô có chữ hiện màu vàng, chưa hiện chữ.</li>' +
    '<li>🔑 <b>Từ khoá</b> — GV nhập riêng 1 dòng (gõ đủ dấu).</li>' +
    '<li>⏱ <b>Thời gian</b> — mỗi câu trả lời có giới hạn (mặc định 30 giây).</li>' +
    '<li>✅ <b>Đội chọn ô trả lời đúng</b> → +10đ, mở ô.</li>' +
    '<li>❌ <b>Đội chọn ô sai/hết giờ</b> → các đội còn lại được <b>cướp</b> (đúng +10đ, sai −5đ) trong cùng thời gian.</li>' +
    '<li>🔴 <b>Không ai trả lời được</b> → ô khoá đỏ, không mở nữa.</li>' +
    '<li>🔔 <b>Đoán từ khoá</b> (gõ đủ dấu): đúng → <b>+100đ</b>, thắng luôn; sai → <b>cấm 2 vòng</b> (không chọn, không cướp).</li>' +
    '<li>🏁 <b>Hết ô</b> → xếp hạng theo tổng điểm.</li></ul>';
}
function toggleFullscreen() {
  try {
    var de = document.documentElement;
    if (!document.fullscreenElement) { if (de.requestFullscreen) de.requestFullscreen(); }
    else if (document.exitFullscreen) document.exitFullscreen();
  } catch (e) {}
}
function renderPlay() {
  var root = $('screen'); if (!root) return;
  var t = team();
  var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
  var h = scorebarHtml(S.order[S.curTeam]);
  var phaseTxt = S.phase === 'pick' ? 'đang chọn ô' : (S.phase === 'answer' ? 'đang trả lời' : 'đang bị cướp!');
  h += '<div class="playhead"><h2>📝 ' + esc(t.name) +
    ' ' + phaseTxt + '</h2>' +
    '<button id="btnMusic" class="btn ghost btn-sm">' + (S.musicOn ? '🔊' : '🔇') + '</button>' +
    '<button id="btnHelpPlay" class="btn ghost btn-sm">📖</button>' +
    '<button id="btnEndGame" class="btn ghost btn-sm">🏁 Kết thúc</button></div>' +
    '<div id="helpPlayBox" class="panel hidden"><h3>📖 Hướng dẫn chơi</h3>' + guideHtml() + '</div>';
  h += '<div class="playgrid">' + questionHtml() + crosswordHtml() + '</div>';
  root.innerHTML = h;
  renderRich($('qText'), S.cur && S.cur.qHtml, S.cur && S.cur.q);
  var qo = $('qOpts');
  if (qo && S.cur) {
    qo.innerHTML = '';
    var QC = G.QuizCommon;
    // phase answer: đội chọn bấm; phase steal: đội cướp đã chọn bấm
    var canAns = (S.phase === 'answer') || (S.phase === 'steal' && stealTeamIdx >= 0);
    (S.cur.opts || []).forEach(function (op, i) {
      var d = document.createElement(canAns ? 'button' : 'div');
      d.className = 'opt' + (canAns ? ' pickable' : '');
      var lab = document.createElement('b'); lab.textContent = 'ABCD'[i] + '. ';
      d.appendChild(lab);
      var sp = document.createElement('span');
      if (QC && S.cur.optsHtml && S.cur.optsHtml[i]) QC.setHTML(sp, S.cur.optsHtml[i]);
      else sp.textContent = op;
      d.appendChild(sp);
      if (canAns) {
        (function (idx) {
          d.addEventListener('click', function () {
            if (S.phase === 'answer') answer(idx);
            else if (S.phase === 'steal') stealAnswer(idx);
          });
        })(i);
      }
      qo.appendChild(d);
    });
  }
  bind('btnMusic', function () {
    var on = Music.toggle();
    var bm = $('btnMusic'); if (bm) bm.textContent = on ? '🔊' : '🔇';
  });
  bind('btnHelpPlay', function () { var b = $('helpPlayBox'); if (b) b.classList.toggle('hidden'); Snd.click(); });
  bind('btnEndGame', function () {
    if (confirm('Kết thúc game và xem xếp hạng?')) endGame(-1);
  });
  /* Ô chữ: bấm ô + nút đoán từ khoá */
  bind('btnGuess', function () { guessKeyword(); });
  var cells = document.querySelectorAll('.cell.pickable');
  for (var i = 0; i < cells.length; i++) {
    (function (el) {
      el.addEventListener('click', function () {
        pickCell(parseInt(el.getAttribute('data-r'), 10), parseInt(el.getAttribute('data-c'), 10));
      });
    })(cells[i]);
  }
  /* Nút chọn đội cướp */
  var sbtns = document.querySelectorAll('.stealbtn[data-team]');
  for (var s = 0; s < sbtns.length; s++) {
    (function (el) {
      el.addEventListener('click', function () {
        selectStealTeam(parseInt(el.getAttribute('data-team'), 10));
      });
    })(sbtns[s]);
  }
  bind('btnNoSteal', function () { noSteal(); });
  bind('btnClearBuzz', function () { if (S.buzzSession) { Buzz.clear(S.buzzSession); render(); } });
}
function renderResult() {
  var root = $('screen'); if (!root) return;
  var rank = rankTeams();
  var medals = ['🥇', '🥈', '🥉'];
  var h = '<div class="panel result"><h2>🏆 Kết quả Vượt Chướng Ngại Vật</h2>';
  if (S.winner >= 0) {
    var wt = S.teams[S.winner];
    h += '<div class="winnerannounce">🎉 Đội <b>' + esc(wt.name) + '</b> đoán trúng từ khoá <b>"' + esc(S.keyword) + '"</b>! +100đ</div>';
  } else {
    h += '<div class="winnerannounce">🔑 Từ khoá là <b>"' + esc(S.keyword) + '"</b></div>';
  }
  // hiện đáp án ô chữ
  h += '<div class="crosswrap"><table class="crosstable">';
  for (var r = 0; r < S.rows; r++) {
    h += '<tr>';
    for (var c = 0; c < S.cols; c++) {
      var cell = S.grid[r][c];
      if (!cell) h += '<td><div class="cell empty"></div></td>';
      else h += '<td><div class="cell open">' + esc(cell.ch) + '</div></td>';
    }
    h += '</tr>';
  }
  h += '</table></div>';
  h += '<table class="rtable">';
  h += '<tr><th>Hạng</th><th>Đội</th><th>Điểm</th></tr>';
  rank.forEach(function (r, pos) {
    var t = S.teams[r.i];
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    var first = pos === 0 ? ' class="first"' : '';
    h += '<tr' + first + '><td>' + (medals[pos] || (pos + 1)) + '</td>' +
      '<td><span class="dot" style="background:' + c.css + '"></span><b>' + esc(t.name) + '</b><br><small>' +
      esc(t.members.join(', ')) + '</small></td>' +
      '<td><b>' + t.points + 'đ</b></td></tr>';
  });
  h += '</table><div class="row">' +
    '<button id="btnAgain" class="btn primary">🔄 Chơi lại</button> ' +
    '<button id="btnSetup" class="btn">⚙ Về cài đặt</button></div></div>';
  root.innerHTML = h;
  bind('btnAgain', function () { S.screen = 'setup'; Music.stop(); render(); });
  bind('btnSetup', function () { S.screen = 'setup'; Music.stop(); render(); });
}
function render() {
  if (S.screen === 'setup') renderSetup();
  else if (S.screen === 'play') renderPlay();
  else if (S.screen === 'result') renderResult();
}

/* ---------- init ---------- */
function init() {
  if (!G.SmartEduDefaultStudents || !G.SmartEduSampleQuestions) {
    toast('Thiếu file dùng chung (smartedu-default-*.js).');
  }
  rebuildBank();
  renderSetup();
}

/* hook kiểm thử */
G.__VUOTCHUONGNGAIVAT = {
  S: S, CFG: CFG,
  DEFAULT_ROWS: DEFAULT_ROWS, DEFAULT_COLS: DEFAULT_COLS, DEFAULT_KEYWORD: DEFAULT_KEYWORD,
  splitTeams: splitTeams, fmtTime: fmtTime, shuffle: shuffle,
  answer: answer, pickCell: pickCell, stealAnswer: stealAnswer, selectStealTeam: selectStealTeam,
  guessKeyword: guessKeyword, nextPick: nextPick, endGame: endGame,
  rankTeams: rankTeams, effectiveBank: effectiveBank, rebuildBank: rebuildBank,
  readGridEditor: readGridEditor, buildGridEditor: buildGridEditor,
  allCellsResolved: allCellsResolved, stealCandidates: stealCandidates,
  setRICHQ: function (a) { RICHQ = a; rebuildBank(); },
  setDefaults: function (v) { USE_DEFAULTS = !!v; rebuildBank(); },
  render: render, guideHtml: guideHtml
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})(typeof window !== 'undefined' ? window : this);
