/* ============================================================
 * HẢI CHIẾN — SmartEdu (Kho Game Học Tập)
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
  maxTeams: 5, // thầy: hải chiến tối đa 5 đội
  defaultSeconds: 90,   // thời gian mặc định mỗi đội (giây)
  trialSeconds: 60,
  storeKey: 'smartedu_haichien_teams'
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
var POINTS = {
  rock:    5,    // đá (thầy chưa chốt → tạm 5đ)
  goldS:   10,   // vàng nhỏ
  goldM:   20,   // vàng vừa
  goldL:   30,   // vàng to
  diamond: 40,   // kim cương
  bomb:    -20   // bom (trừ điểm, điểm có thể âm)
};
var GIFT_VALUES = [10, 20, 30, 40];  // hộp quà: ngẫu nhiên 1 số
var MINE_RATIO = {                   // số vật / 10 câu hỏi
  rock: 2, goldL: 2, goldM: 4, goldS: 4, diamond: 2, bomb: 2, gift: 2
};
/* Tên + emoji hiển thị của từng loại vật */
var ITEM_VIEW = {
  rock:    { name: 'Đá',        emoji: '🪨', cls: 'it-rock' },
  goldS:   { name: 'Vàng nhỏ',  emoji: '🪙', cls: 'it-gold s' },
  goldM:   { name: 'Vàng vừa',  emoji: '🪙', cls: 'it-gold m' },
  goldL:   { name: 'Vàng to',   emoji: '🪙', cls: 'it-gold l' },
  diamond: { name: 'Kim cương', emoji: '💎', cls: 'it-diamond' },
  bomb:    { name: 'Bom',       emoji: '💣', cls: 'it-bomb' },
  gift:    { name: 'Hộp quà',   emoji: '🎁', cls: 'it-gift' }
};

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
  screen: 'setup',        // setup | play | teamsummary | result
  teams: [],              // {name,members[],colorIdx,points,pack[],packIdx,targets[],timeLeft,timerId,done,reason,shotCount}
  order: [],              // thứ tự đội chơi
  curTeam: 0,             // index trong order
  phase: 'question',      // question | fire  (trong lượt 1 đội)
  cur: null,              // câu hỏi đang chiếu
  seconds: CFG.defaultSeconds,
  qSeconds: 30,           // thời gian trả lời mỗi câu (thầy: cài đặt được)
  qTimeLeft: 0,           // đếm ngược câu hiện tại
  qTimerId: 0,
  musicOn: true,
  musicUrl: '',
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
    /* Sửa 2026-10-31 (đào động): thả móc + gắp trúng */
    drop: function () { tone(300, 0.15, 'sine', 0.15); tone(200, 0.2, 'sine', 0.15, 0.1); },
    grab: function () { tone(400, 0.1, 'square', 0.15); tone(600, 0.12, 'square', 0.15, 0.08); },
    /* HẢI CHIẾN (thầy yêu cầu): tiếng pháo bắn + trúng mục tiêu */
    cannon: function () {
      tone(90, 0.5, 'sawtooth', 0.3); tone(60, 0.6, 'square', 0.25, 0.05);
      tone(150, 0.3, 'sawtooth', 0.2, 0.1);
    },
    hitTarget: function () {
      tone(523, 0.1, 'triangle', 0.25); tone(784, 0.15, 'triangle', 0.25, 0.08);
      tone(1046, 0.25, 'triangle', 0.25, 0.16);
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
function startDig() {
  var k = TRIAL ? 2 : parseInt(($('teamCount') || {}).value || '2', 10);
  if (!(k >= 2 && k <= CFG.maxTeams)) { toast('Số đội từ 2 đến ' + CFG.maxTeams + '.'); return; }
  var sec = TRIAL ? CFG.trialSeconds : parseInt(($('teamSeconds') || {}).value || CFG.defaultSeconds, 10);
  if (!(sec >= 10 && sec <= 1800)) { toast('Thời gian mỗi đội từ 10 đến 1800 giây.'); return; }
  S.seconds = sec;
  var qs = TRIAL ? 30 : parseInt(($('qSeconds') || {}).value || '30', 10);
  if (!(qs >= 5 && qs <= 300)) { toast('Thời gian mỗi câu từ 5 đến 300 giây.'); return; }
  S.qSeconds = qs;
  var students = loadStudents();
  if (students.length < k) { toast('Số học sinh ít hơn số đội!'); return; }
  var bank = effectiveBank();
  if (bank.length < k) { toast('Kho câu hỏi ít hơn số đội! Hãy nhập thêm câu hỏi.'); return; }
  var packs = dealPacks(bank, k);
  S.teams = splitTeams(students, k);
  S.teams.forEach(function (t, i) {
    t.pack = packs[i];
    t.packIdx = 0;
    /* Sửa 2026-10-31: đào động dùng mỏ có vị trí (15 vật), đào tĩnh dùng lưới ô */
    t.targets = buildTargets();
    t.decorData = buildDecor(t.targets);  // xáo 1 lần/đội, tránh che mục tiêu
    t.points = 0; t.done = false; t.reason = ''; t.digCount = 0;
    t.timeLeft = sec;
  });
  S.order = S.teams.map(function (_, i) { return i; });
  S.curTeam = 0;
  S.started = true;
  S.screen = 'play';
  Snd.click();
  Music.start();
  startTeamTurn();
  render();
}
function team() { return S.teams[S.order[S.curTeam]]; }
function stopTimer(t) {
  if (t && t.timerId != null) {
    (G.clearInterval || clearInterval)(t.timerId);
    t.timerId = null;
  }
}
function startTeamTurn() {
  var t = team();
  t.packIdx = 0;
  t.timeLeft = S.seconds;
  S.phase = 'question';
  S.cur = t.pack[0] || null;
  stopTimer(t);
  t.timerId = (G.setInterval || setInterval)(tick, 1000);
  Snd.whistle();
  cannonStart();  // khởi động animation pháo
  startQTimer();  // đếm giờ câu đầu tiên
}
function tick() {
  if (S.screen !== 'play') return;
  var t = team();
  if (!t || t.done) return;
  t.timeLeft--;
  if (t.timeLeft <= 10 && t.timeLeft > 0) Snd.tick();
  if (t.timeLeft <= 0) { endTeam('Hết giờ ⏱'); return; }
  var tel = $('timerText');
  if (tel) tel.textContent = fmtTime(t.timeLeft);
  var bar = $('timerBar');
  if (bar) {
    var pct = Math.max(0, Math.round(t.timeLeft / S.seconds * 100));
    bar.style.width = pct + '%';
    bar.className = 'timerfill' + (t.timeLeft <= 10 ? ' danger' : '');
  }
}
function fmtTime(sec) {
  sec = Math.max(0, sec);
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m > 0 ? m + 'p ' : '') + s + 's';
}
/* GV bấm đáp án đội vừa trả lời */
function answer(optIdx) {
  if (S.screen !== 'play' || S.phase !== 'question' || !S.cur) return;
  stopQTimer();  // dừng đếm giờ câu hỏi
  if (optIdx === S.cur.ans) {
    Snd.correct();
    S.phase = 'fire';   // đúng → chờ đội bấm BẮN PHÁO
    announce('✅ ĐÚNG!', true);
    toast('Bấm 💥 BẮN PHÁO để bắn!');
    render();
  } else {
    Snd.wrong();
    announce('❌ SAI!', false);
    toast('Sang câu tiếp theo.');
    nextQuestionOrEnd();  // tự render bên trong
  }
}
/* Đội bấm 1 ô trong mỏ để đào (chỉ chế độ tĩnh — động dùng móc treo) */
function dig(tileIdx) {
  if (S.digMode === 'dynamic') return;  // động: dùng dynDrop() thay vì dig()
  if (S.screen !== 'play' || S.phase !== 'dig') return;
  var t = team();
  var item = t.mine[tileIdx];
  if (!item || item.dug) return;
  item.dug = true;
  t.digCount++;
  var v = digValue(item);
  t.points += v;
  var iv = ITEM_VIEW[item.type];
  if (item.type === 'bomb') { Snd.digBomb(); toast('💣 BÙM! Trừ ' + (-v) + ' điểm!'); }
  else if (item.type === 'gift') { Snd.digGift(); toast('🎁 Hộp quà: +' + v + ' điểm!'); }
  else if (item.type === 'rock') { Snd.digRock(); toast('🪨 Đào trúng đá: +' + v + ' điểm.'); }
  else if (item.type === 'diamond') { Snd.digGold(); toast('💎 Kim cương: +' + v + ' điểm!'); }
  else { Snd.digGold(); toast(iv.emoji + ' ' + iv.name + ': +' + v + ' điểm!'); }
  nextQuestionOrEnd();
}
function nextQuestionOrEnd() {
  var t = team();
  t.packIdx++;
  stopQTimer();
  if (t.packIdx >= t.pack.length) { endTeam('Hết câu hỏi ❓'); return; }
  if (t.targets && t.targets.every(function (x) { return x.hit; })) { endTeam('Bắn hết mục tiêu 💥'); return; }
  S.phase = 'question';
  S.cur = t.pack[t.packIdx];
  startQTimer();  // bắt đầu đếm giờ câu mới (thầy yêu cầu)
  render();
}
/* Đếm giờ trả lời mỗi câu (thầy yêu cầu) */
function startQTimer() {
  stopQTimer();
  S.qTimeLeft = S.qSeconds;
  S.qTimerId = (G.setInterval || setInterval)(function () {
    if (S.screen !== 'play' || S.phase !== 'question') return;
    S.qTimeLeft--;
    var el = document.getElementById('qTimer');
    if (el) el.textContent = S.qTimeLeft + 's';
    if (S.qTimeLeft <= 0) {
      stopQTimer();
      Snd.wrong();
      announce('⏰ HẾT GIỜ!', false);
      toast('Hết giờ trả lời — sang câu tiếp.');
      nextQuestionOrEnd();
    }
  }, 1000);
}
function stopQTimer() {
  if (S.qTimerId) { (G.clearInterval || clearInterval)(S.qTimerId); S.qTimerId = 0; }
}
function endTeam(reason) {
  var t = team();
  stopTimer(t);
  stopQTimer();
  t.done = true;
  t.reason = reason;
  Snd.whistle();
  cannonStop();  // dừng animation pháo khi hết lượt
  S.screen = 'teamsummary';
  render();
}
function nextTeam() {
  S.curTeam++;
  if (S.curTeam >= S.order.length) {
    S.screen = 'result';
    Music.stop();
    Snd.fanfare();
  } else {
    S.screen = 'play';
    startTeamTurn();
  }
  render();
}
function rankTeams() {
  return S.teams.map(function (t, i) { return { i: i, points: t.points }; })
    .sort(function (a, b) { return b.points - a.points; });
}
function endAll() {
  S.teams.forEach(stopTimer);
  S.screen = 'result';
  Music.stop();
  Snd.fanfare();
  render();
}

/* ---------- render ---------- */
function scorebarHtml(activeIdx) {
  var h = '<div id="scorebar">';
  S.teams.forEach(function (t, i) {
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    h += '<div class="chip' + (i === activeIdx ? ' me' : '') + '"' +
      (t.done ? ' style="opacity:.55"' : '') + '>' +
      '<span class="dot" style="background:' + c.css + '"></span>' +
      esc(t.name) + ': <b>' + t.points + 'đ</b>' +
      (t.done ? ' ✔' : '') + '</div>';
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
   HẢI CHIẾN — cấu hình (thầy duyệt 2026-10-31)
   - Pháo xoay bắn đạn vào mục tiêu trên đảo (giống cơ chế móc treo đào vàng động)
   - Tối đa 5 đội, mỗi đội 1 tàu chiến, tấn công 1 đảo
   ============================================================ */
var CANNON_MAX_ANGLE = 1.05;   // góc xoay nòng pháo ±60°
var CANNON_ROT_SPEED = 0.06;   // tốc độ xoay (thầy 2026-11-01: tăng 20% cho khó bắn)
var SHELL_SPEED = 10;          // tốc độ đạn bay (pixel/khung hình)
/* THẦY CHỈNH PHÁO TẠI ĐÂY: sửa 3 số trên */
/* Mục tiêu trên đảo: điểm + loại */
var TARGET_POINTS = { normal: 10, gold: 20, diamond: 30, gift: 25, bomb: -15 };
var TARGET_VIEW = {
  normal:  { name: 'Mục tiêu', emoji: '🎯' },
  gold:    { name: 'Rương vàng', emoji: '🎯' },
  diamond: { name: 'Rương kim cương', emoji: '🎯' },
  gift:    { name: 'Hộp quà', emoji: '🎁' },
  bomb:    { name: 'Mìn', emoji: '💣' }
};

/* ============================================================
   HẢI CHIẾN — hệ pháo bắn (2026-10-31, thầy duyệt)
   - Nòng pháo xoay ±60°, bấm BẮN sau khi trả lời đúng
   - Đạn bay theo hướng nòng, trúng mục tiêu trên đảo → cộng điểm
   - Mục tiêu đặt CỐ ĐỊNH trên đảo (không ngẫu nhiên)
   ============================================================ */
var CANNON = null;
/* Vị trí mục tiêu trên đảo (tọa độ canvas 900x340) — THẦY ĐỔI TẠI ĐÂY */
var TARGET_SPOTS = [
  { x: 280, y: 95, type: 'normal' },
  { x: 390, y: 80, type: 'gold' },
  { x: 500, y: 90, type: 'normal' },
  { x: 610, y: 85, type: 'diamond' },
  { x: 330, y: 140, type: 'gift' },
  { x: 450, y: 145, type: 'normal' },
  { x: 560, y: 140, type: 'bomb' },
  { x: 660, y: 135, type: 'gold' }
];
function buildTargets() {
  // Thầy 2026-11-01: hoán vị vị trí mục tiêu mỗi ván cho đỡ nhàm
  var spots = TARGET_SPOTS.slice();
  for (var i = spots.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = spots[i]; spots[i] = spots[j]; spots[j] = tmp;
  }
  // loại mục tiêu giữ nguyên thứ tự, chỉ xáo vị trí
  return TARGET_SPOTS.map(function (s, i) {
    return { x: spots[i].x, y: spots[i].y, type: s.type, hit: false, idx: i };
  });
}
/* Khoảng cách tối thiểu giữa mục tiêu và trang trí (thầy 2026-11-01) */
var MIN_TARGET_CLEAR = 30;  // giảm từ 55 → giữ đảo dày mà mục tiêu vẫn thấy
function tooCloseToTarget(x, y, targets) {
  for (var i = 0; i < targets.length; i++) {
    var dx = x - targets[i].x, dy = y - targets[i].y;
    if (Math.sqrt(dx * dx + dy * dy) < MIN_TARGET_CLEAR) return true;
  }
  return false;
}
/* Vị trí trang trí đảo — xáo mỗi ván (thầy 2026-11-01) */
var DECOR_SPOTS = [
  [155, 130], [190, 155], [735, 132], [705, 158], [250, 62], [650, 60],
  [235, 118], [270, 150], [350, 58], [520, 155], [585, 55], [675, 115],
  [390, 155], [480, 58], [560, 115]
];
var DECOR_TYPES = ['rock', 'rock', 'rock', 'rock', 'rock', 'rock',
                   'flower', 'flower', 'flower', 'flower', 'flower', 'flower',
                   'leaf', 'leaf', 'leaf'];
function buildDecor(targets) {
  targets = targets || [];
  var idx = DECOR_SPOTS.map(function (_, i) { return i; });
  for (var i = idx.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
  }
  var decor = [];
  var used = [];
  idx.forEach(function (k) {
    var x = DECOR_SPOTS[k][0], y = DECOR_SPOTS[k][1];
    // bỏ qua vị trí quá gần mục tiêu hoặc đã dùng (thầy 2026-11-01: tránh che bom/bia)
    if (tooCloseToTarget(x, y, targets)) return;
    for (var u = 0; u < used.length; u++) {
      var dx = x - used[u][0], dy = y - used[u][1];
      if (Math.sqrt(dx * dx + dy * dy) < 25) return;  // giảm từ 40 → đảo dày hơn
    }
    used.push([x, y]);
    var tp = DECOR_TYPES[decor.length % DECOR_TYPES.length];
    var em = null;
    if (tp === 'flower') em = ['🌼', '🌺', '🌸', '🌷'][Math.floor(Math.random() * 4)];
    else if (tp === 'leaf') em = ['🍀', '🌿'][Math.floor(Math.random() * 2)];
    decor.push({ x: x, y: y, type: tp, emoji: em });
  });
  // cây: xáo 1 lần cho cả đội, tránh xa mục tiêu (thầy 2026-11-01)
  var treeDefs = [
    [300, 95, '🌳', 42], [620, 90, '🌲', 42], [205, 92, '🌴', 42], [700, 92, '🌴', 42],
    [385, 58, '🌳', 30], [555, 62, '🌳', 30],
    [200, 155, '🌴', 46], [700, 150, '🌴', 46],
    [120, 100, '🌴', 40], [780, 95, '🌴', 40]
  ];
  for (var ti = treeDefs.length - 1; ti > 0; ti--) {
    var tj = Math.floor(Math.random() * (ti + 1));
    var ttmp = treeDefs[ti]; treeDefs[ti] = treeDefs[tj]; treeDefs[tj] = ttmp;
  }
  var trees = [];
  treeDefs.forEach(function (td) {
    if (tooCloseToTarget(td[0], td[1], targets)) return;  // cây tránh xa mục tiêu
    trees.push(td);
  });
  return { decor: decor, trees: trees };
}
function cannonHtml(t) {
  var left = t.targets.filter(function (x) { return !x.hit; }).length;
  var h = '<div class="seawrap"><div class="seatitle">🚢 Hải chiến — ' + esc(t.name) +
    ' <span class="muted">(còn ' + left + ' mục tiêu)</span></div>';
  h += '<canvas id="seaCanvas" width="900" height="340" class="seacanvas"></canvas>';
  var canFire = (S.phase === 'fire' && !t.done && CANNON && !CANNON.shell);
  h += '<div class="row center"><button id="btnFire" class="btn primary big"' +
    (canFire ? '' : ' disabled') + '>💥 BẮN PHÁO <small>(hoặc phím Space)</small></button></div>';
  h += '</div>';
  return h;
}
function cannonDraw() {
  var cv = document.getElementById('seaCanvas');
  if (!cv || !CANNON) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  // biển (thầy: đổi màu nước — xanh đại dương đậm)
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0f4c81'); g.addColorStop(1, '#082a4d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // sóng lăn tăn (vài đường cong nhẹ)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
  for (var wi = 0; wi < 5; wi++) {
    var wy = 40 + wi * 60;
    ctx.beginPath();
    for (var wx = 0; wx <= W; wx += 30) {
      var woy = Math.sin(wx * 0.03 + wi) * 6;
      if (wx === 0) ctx.moveTo(wx, wy + woy); else ctx.lineTo(wx, wy + woy);
    }
    ctx.stroke();
  }
  /* Đảo (thầy 20:03): xa hơn, có đá + nhiều loại cây, mục tiêu núp sau cây */
  var icx = 450, icy = 110;  // đảo lên cao hơn (xa pháo)
  // bờ cát
  ctx.fillStyle = '#e8c547';
  ctx.beginPath(); ctx.ellipse(icx, icy, 360, 95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f5d76e';
  ctx.beginPath(); ctx.ellipse(icx, icy, 330, 82, 0, 0, Math.PI * 2); ctx.fill();
  // cỏ
  ctx.fillStyle = '#4a9a2a';
  ctx.beginPath(); ctx.ellipse(icx, icy, 285, 68, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5cb833';
  ctx.beginPath(); ctx.ellipse(icx, icy, 245, 55, 0, 0, Math.PI * 2); ctx.fill();
  var t = team();
  if (!t) return;
  // Cảnh quan đảo: đá ven bờ, cây xanh, bụi cây và hoa.
  // Các chi tiết nền được vẽ trước mục tiêu để không che khuất mục tiêu.
  // Sửa 2026-11-01: đá VẼ BẰNG HÌNH (emoji 🪨 không hiện trên nhiều máy)
  // Thầy 2026-11-01: hoán vị vị trí đá/hoa/cỏ mỗi ván (t.decor đã xáo)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ((t.decorData && t.decorData.decor) || []).forEach(function (d) {
    if (d.type === 'rock') {
      // hòn đá: hình đa giác xám
      ctx.fillStyle = '#8a8a8a';
      ctx.beginPath();
      ctx.moveTo(d.x - 14, d.y + 8);
      ctx.lineTo(d.x - 8, d.y - 10);
      ctx.lineTo(d.x + 6, d.y - 12);
      ctx.lineTo(d.x + 14, d.y - 2);
      ctx.lineTo(d.x + 10, d.y + 10);
      ctx.lineTo(d.x - 6, d.y + 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a8a8a8';  // highlight
      ctx.beginPath();
      ctx.moveTo(d.x - 8, d.y - 10);
      ctx.lineTo(d.x + 6, d.y - 12);
      ctx.lineTo(d.x + 2, d.y - 2);
      ctx.lineTo(d.x - 6, d.y - 2);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.font = '28px serif';
      ctx.fillText(d.emoji, d.x, d.y);
    }
  });

  // Hàng cây — đã xáo 1 lần lúc tạo đội (t.decorData.trees), vẽ ổn định
  var treeSpots = (t.decorData && t.decorData.trees) || [];
  // vẽ cây sau lưng mục tiêu (tạo chiều sâu)
  treeSpots.slice(0, 6).forEach(function (ts) {
    ctx.font = ts[3] + 'px serif';
    ctx.fillText(ts[2], ts[0], ts[1]);
  });
  // Cây phía trước — dùng 4 cây còn lại sau khi xáo
  treeSpots.slice(6).forEach(function (ts) {
    ctx.font = ts[3] + 'px serif';
    ctx.fillText(ts[2], ts[0], ts[1]);
  });
  ctx.font = '46px serif';
  ctx.fillText('🌺', icx + 210, icy + 30);
  ctx.fillText('🌿', icx - 190, icy + 48);
  ctx.fillText('🌼', icx + 175, icy + 48);
  // mục tiêu vẽ TRÊN CÙNG (thầy 2026-11-01: đảo dày mà bom/bia vẫn thấy)
  t.targets.forEach(function (tg) {
    if (tg.hit) return;
    var tv = TARGET_VIEW[tg.type];
    ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(tv.emoji, tg.x, tg.y);
  });
  // (đá đã vẽ bằng hình ở trên — không dùng emoji 🪨)
  // Chim tự vẽ: mỏ hướng sang phải, cùng chiều di chuyển (vx dương).
  // Hai cánh xoay lên/xuống theo thời gian để tạo chuyển động vỗ cánh rõ ràng.
  if (CANNON.birds) {
    CANNON.birds.forEach(function (b) {
      var flap = Math.sin(Date.now() / 105 + b.phase);
      ctx.save();
      ctx.translate(b.x, b.y);
      // Thân chim và đầu
      ctx.fillStyle = '#f7fbff';
      ctx.strokeStyle = '#42627b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4.2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, -2, 3.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Mỏ luôn chĩa về bên phải — hướng bay
      ctx.fillStyle = '#f4a340';
      ctx.beginPath();
      ctx.moveTo(10.5, -2.5); ctx.lineTo(16, -1); ctx.lineTo(10, 0);
      ctx.closePath(); ctx.fill();
      // Đuôi hướng về phía sau
      ctx.fillStyle = '#e8f1f8';
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(-15, -4); ctx.lineTo(-12, 1);
      ctx.lineTo(-15, 4); ctx.closePath(); ctx.fill();
      // Cánh gần và cánh xa vỗ luân phiên
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#7892a6';
      ctx.lineWidth = 1;
      ctx.save();
      ctx.rotate(-0.15 - flap * 0.72);
      ctx.beginPath();
      ctx.ellipse(-1, -5, 4.2, 10 + Math.max(0, flap) * 2, -0.25, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.rotate(0.12 + flap * 0.58);
      ctx.beginPath();
      ctx.ellipse(-1, 4, 3.5, 7, 0.25, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      // Mắt nhỏ
      ctx.fillStyle = '#243746';
      ctx.beginPath(); ctx.arc(8.7, -3, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }
  // máy bay bay qua (thầy yêu cầu 2026-11-01: cứ 20s 1 chiếc)
  // Sửa 2026-11-01: bay NGANG (xoay emoji ✈️ cho thẳng)
  if (CANNON.plane) {
    var pl = CANNON.plane;
    ctx.save();
    ctx.translate(pl.x, pl.y);
    ctx.rotate(Math.PI / 4);  // xoay 45° cho máy bay nằm ngang
    ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✈️', 0, 0);
    ctx.restore();
  }
  // đám mây trắng bay qua màn hình (thầy yêu cầu: cứ 15s lại bay qua, tốc độ chậm)
  if (CANNON.cloud) {
    var cl = CANNON.cloud;
    ctx.save();
    ctx.translate(cl.x, cl.y);
    var sc = cl.scale || 1.15;
    ctx.scale(sc, sc);

    // Bóng nhẹ dưới đáy mây tạo độ nổi 3D bồng bềnh
    ctx.fillStyle = 'rgba(210, 235, 252, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 5, 23, 0, Math.PI * 2);
    ctx.arc(-22, 9, 18, 0, Math.PI * 2);
    ctx.arc(23, 8, 19, 0, Math.PI * 2);
    ctx.arc(-42, 12, 13, 0, Math.PI * 2);
    ctx.arc(43, 11, 14, 0, Math.PI * 2);
    ctx.ellipse(0, 10, 48, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thân mây trắng bồng bềnh
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(-22, 3, 19, 0, Math.PI * 2);
    ctx.arc(-42, 8, 14, 0, Math.PI * 2);
    ctx.arc(23, 2, 20, 0, Math.PI * 2);
    ctx.arc(43, 7, 15, 0, Math.PI * 2);
    ctx.ellipse(0, 8, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vệt sáng trắng tinh ở đỉnh mây
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.beginPath();
    ctx.arc(-5, -4, 16, 0, Math.PI * 2);
    ctx.arc(15, -3, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  // ============================================================
  // THẦY CHỈNH TÀU TẠI ĐÂY (2026-11-01)
  //   - SHIP_SIZE: cỡ tàu (px) — thầy yêu cầu x2 = 96
  //   - BARREL_LEN: độ dài nòng pháo — thầy yêu cầu = 3/4 (41)
  //   - Muốn tàu to hơn nữa: tăng SHIP_SIZE; nòng dài hơn: tăng BARREL_LEN
  // ============================================================
  var SHIP_SIZE = 96;
  var BARREL_LEN = 41;
  // tàu chiến của đội (dưới cùng giữa)
  var px = W / 2, py = H - 30;
  ctx.font = SHIP_SIZE + 'px serif';
  ctx.fillText('🚢', px, py);
  // nòng pháo xoay
  var ang = CANNON.angle;
  var bx = px, by = py - 20;
  var ex = bx + Math.sin(ang) * BARREL_LEN, ey = by - Math.cos(ang) * BARREL_LEN;
  ctx.strokeStyle = '#333'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = '#666'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
  // đạn đang bay
  if (CANNON.shell) {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath(); ctx.arc(CANNON.shell.x, CANNON.shell.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffa500';
    ctx.beginPath(); ctx.arc(CANNON.shell.x, CANNON.shell.y, 4, 0, Math.PI * 2); ctx.fill();
  }
  // chữ điểm bay
  if (CANNON.floaters) {
    CANNON.floaters.forEach(function (fl) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, fl.life));
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
      ctx.restore();
    });
  }
}
function cannonTick() {
  if (!CANNON) return;
  // chim bay qua màn hình
  if (CANNON.birds) {
    CANNON.birds.forEach(function (b) {
      b.x += b.vx;
      if (b.x > 920) { b.x = -20; b.y = 30 + Math.random() * 60; }
    });
  }
  // máy bay: cứ 20s bay qua 1 chiếc (thầy yêu cầu 2026-11-01)
  CANNON.planeTimer++;
  if (CANNON.planeTimer >= 20 * 60 && !CANNON.plane) {  // 60fps × 20s
    CANNON.plane = { x: -60, y: 40 + Math.random() * 40, vx: 3 };
    CANNON.planeTimer = 0;
  }
  if (CANNON.plane) {
    CANNON.plane.x += CANNON.plane.vx;
    if (CANNON.plane.x > 960) CANNON.plane = null;
  }
  // đám mây trắng: cứ 15s lại bay qua màn hình 1 lần, tốc độ chậm (thầy yêu cầu)
  CANNON.cloudTimer = (CANNON.cloudTimer || 0) + 1;
  if (CANNON.cloudTimer >= 15 * 60 && !CANNON.cloud) {  // 60fps × 15s = 900 khung hình
    CANNON.cloud = {
      x: -120,
      y: 28 + Math.random() * 32,
      vx: 1.25,  // tốc độ chậm (~15s để lướt qua màn hình 900px)
      scale: 1.05 + Math.random() * 0.25
    };
    CANNON.cloudTimer = 0;
  }
  if (CANNON.cloud) {
    CANNON.cloud.x += CANNON.cloud.vx;
    if (CANNON.cloud.x > 1020) CANNON.cloud = null;
  }
  // cập nhật chữ bay
  if (CANNON.floaters) {
    for (var fi = CANNON.floaters.length - 1; fi >= 0; fi--) {
      var fl = CANNON.floaters[fi];
      fl.y -= 1.2; fl.life -= 0.012;
      if (fl.life <= 0) CANNON.floaters.splice(fi, 1);
    }
  }
  // xoay nòng pháo (khi chưa bắn)
  if (!CANNON.shell) {
    CANNON.angle += CANNON.dir * CANNON_ROT_SPEED;
    if (CANNON.angle > CANNON_MAX_ANGLE) { CANNON.angle = CANNON_MAX_ANGLE; CANNON.dir = -1; }
    if (CANNON.angle < -CANNON_MAX_ANGLE) { CANNON.angle = -CANNON_MAX_ANGLE; CANNON.dir = 1; }
  } else {
    // đạn bay
    var sh = CANNON.shell;
    sh.x += sh.vx; sh.y += sh.vy;
    var t = team();
    var hit = null;
    if (t) {
      for (var i = 0; i < t.targets.length; i++) {
        var tg = t.targets[i];
        if (tg.hit) continue;
        var dx = sh.x - tg.x, dy = sh.y - tg.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) { hit = tg; break; }
      }
    }
    if (hit) {
      // trúng mục tiêu!
      hit.hit = true;
      var val = TARGET_POINTS[hit.type] || 0;
      t.points += val;
      t.shotCount = (t.shotCount || 0) + 1;
      var tv = TARGET_VIEW[hit.type];
      CANNON.floaters.push({
        x: hit.x, y: hit.y - 20,
        text: (val >= 0 ? '+' : '') + val + 'đ',
        color: val >= 0 ? '#ffd34d' : '#ff6b6b',
        life: 1.0
      });
      if (val >= 0) { Snd.hitTarget(); toast('💥 Trúng ' + tv.name + ' +' + val + 'đ!'); }
      else { Snd.wrong(); toast('💣 Trúng mìn ' + val + 'đ!'); }
      CANNON.shell = null;
      nextQuestionOrEnd();
    } else if (sh.x < 0 || sh.x > 900 || sh.y < 0 || sh.y > 340) {
      // đạn bay ra ngoài
      toast('🌊 Bắn trượt rồi!');
      CANNON.shell = null;
      nextQuestionOrEnd();
    }
  }
  cannonDraw();
}
function cannonFire() {
  if (!CANNON || CANNON.shell) return;
  var t = team();
  if (!t || t.done || S.phase !== 'fire') return;
  var cv = document.getElementById('seaCanvas');
  var px = cv ? cv.width / 2 : 450, py = cv ? cv.height - 50 : 290;
  var BL = 41;  // khớp BARREL_LEN trong hàm vẽ (thầy chỉnh tàu: sửa cả 2 chỗ)
  CANNON.shell = {
    x: px + Math.sin(CANNON.angle) * BL,
    y: py - Math.cos(CANNON.angle) * BL,
    vx: Math.sin(CANNON.angle) * SHELL_SPEED,
    vy: -Math.cos(CANNON.angle) * SHELL_SPEED
  };
  Snd.cannon();
  var btn = document.getElementById('btnFire');
  if (btn) btn.disabled = true;
}
/* Thầy 2026-11-01: bấm Space để bắn (nhanh hơn click chuột) */
document.addEventListener('keydown', function (e) {
  if (e.code === 'Space' || e.key === ' ') {
    if (S.screen === 'play' && S.phase === 'fire') {
      e.preventDefault();
      cannonFire();
    }
  }
});
function cannonStart() {
  CANNON = {
    angle: 0,
    dir: 1,
    shell: null,
    floaters: [],
    timer: 0,
    birds: [],
    plane: null,
    planeTimer: 0,
    cloud: { x: -60, y: 36, vx: 1.25, scale: 1.15 },  // mây trắng bay ngay khi vào ván đấu
    cloudTimer: 0
  };
  // chim bay ngẫu nhiên (thầy yêu cầu)
  for (var i = 0; i < 3; i++) {
    CANNON.birds.push({
      x: Math.random() * 900, y: 25 + Math.random() * 55,
      vx: 1 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    });
  }
  // máy bay: cứ 20s bay qua 1 chiếc (thầy yêu cầu 2026-11-01)
  CANNON.planeTimer = 0;
  cancelAnimationFrame(CANNON.timer);
  var loop = function () {
    if (!CANNON) return;
    if (S.screen === 'play') cannonTick();
    CANNON.timer = requestAnimationFrame(loop);
  };
  loop();
}
function cannonStop() {
  if (CANNON) { cancelAnimationFrame(CANNON.timer); CANNON = null; }
}

function mineHtml(t) {
  return cannonHtml(t);  // hải chiến: pháo bắn thay cho mỏ vàng
}
function questionHtml() {
  if (!S.cur) return '<div class="panel center"><span class="muted">Hết câu hỏi.</span></div>';
  var t = team();
  var h = '<div class="panel qpanel">';
  h += '<div class="qhead"><span class="qteam">' + esc(t.name) + '</span>' +
    '<span class="muted">Câu ' + (t.packIdx + 1) + '/' + t.pack.length + '</span>' +
    '<span id="qTimer" class="qtimer">' + S.qSeconds + 's</span></div>';
  h += '<div id="qText" class="qtext"></div><div id="qOpts" class="qopts"></div>';
  var canAns = (S.phase === 'question' && !t.done);
  h += '<div class="muted" style="margin-top:8px">' +
    (canAns ? '👆 GV bấm vào đáp án đội vừa trả lời.' : '💥 Đúng rồi! Bấm BẮN PHÁO (hoặc phím Space)!') + '</div>';
  h += '</div>';
  return h;
}
function renderSetup() {
  var root = $('screen'); if (!root) return;
  var h = '<div class="screen">' +
    (TRIAL ? '<div class="badge-trial">BẢN CHƠI THỬ — 2 đội, 60 giây/đội</div>' : '') +
    '<h1 class="game-title">🚢 Hải Chiến</h1>' +
    '<div class="subtitle">Trả lời đúng để hải chiến — đội nào nhiều điểm nhất thắng!</div>' +
    '<div class="cfg">';
  if (!TRIAL) {
    h += '<label>Số đội (2–5): <input id="teamCount" type="number" min="2" max="5" value="2"></label>';
    h += '<label>Thời gian mỗi đội (giây): <input id="teamSeconds" type="number" min="10" max="1800" value="' + CFG.defaultSeconds + '"></label>';
    h += '<label>Thời gian trả lời mỗi câu (giây): <input id="qSeconds" type="number" min="5" max="300" value="30"></label>';
    h += '<label>Link nhạc nền (mp3, để trống = nhạc mặc định): <input id="musicUrl" type="text" placeholder="https://.../nhac.mp3"></label>';
    h += '<label class="chk"><input id="musicOn" type="checkbox" checked> 🔊 Nhạc nền</label>';
  } else {
    h += '<div class="hint">Bản chơi thử: 2 đội, mỗi đội 60 giây, 20 câu hỏi mẫu.</div>';
  }
  h += '</div><div class="row">' +
    '<button class="btn primary big" id="btnPlay">▶ Bắt đầu chơi</button>' +
    '<button class="btn ghost" id="btnHelp">📖 Hướng dẫn</button>' +
    '<button class="btn ghost" id="btnFull">⛶ Toàn màn hình</button></div>';
  if (!TRIAL) {
    h += '<div class="panel setup"><h3>⚙ Cài đặt</h3>' +
      '<div class="hint" id="studentInfo"></div>' +
      '<div class="row"><label class="filebtn">📥 Nhập HS (Excel)<input type="file" id="fileExcel" accept=".xlsx,.xls" hidden></label>' +
      '<label class="filebtn">📝 Nhập câu hỏi (Word)<input type="file" id="fileWord" accept=".docx" hidden></label></div>' +
      '<div class="row"><button class="btn ghost btn-sm" id="btnClearQ">🗑 Xóa câu hỏi đã nhập</button> ' +
      '<button class="btn ghost btn-sm" id="btnToggleDefaults">🗑 Xóa câu mẫu</button></div>' +
      '<div class="hint" id="qBankInfo"></div><div id="qBankTable"></div>' +
      '<div class="hint">💡 Mỏ mỗi đội tự co giãn theo số câu trong gói (chuẩn: 10 câu → 18 vật).</div>' +
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
    '<li>👥 <b>Chia đội</b> — tối đa 5 đội, chơi quay vòng 1→2→3→4→5; vào lượt đội nào mới tính giờ đội đó.</li>' +
    '<li>⏱ <b>Thời gian riêng</b> — mỗi đội có đồng hồ riêng (mặc định 90 giây, chỉnh được).</li>' +
    '<li>📦 <b>Gói câu hỏi riêng</b> — mỗi đội một gói, không trùng câu với đội khác.</li>' +
    '<li>✅ <b>Trả lời đúng</b> trong giờ → bấm <b>💥 BẮN PHÁO</b> (hoặc phím <b>Space</b>).</li>' +
    '<li>🎯 <b>Trúng mục tiêu</b> trên đảo: 🎯 +10đ, rương vàng +20đ, kim cương +30đ, 🎁 +25đ, 💣 mìn −15đ.</li>' +
    '<li>🗺️ <b>Mỗi đội một đảo riêng</b> — vị trí mục tiêu, cây, đá, hoa xáo ngẫu nhiên mỗi lượt.</li>' +
    '<li>🏁 <b>Hết giờ / hết câu hỏi</b> → đội nhiều điểm nhất thắng; hòa → câu hỏi phụ.</li>' +
    '<li>🏆 <b>Xếp hạng</b> theo tổng điểm các đội.</li></ul>';
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
  h += '<div class="playhead"><h2>🚢 <span style="color:' + c.css + '">' + esc(t.name) +
    '</span> đang chiến đấu</h2>' +
    '<div class="timerwrap"><div class="timer" id="timerText">' + fmtTime(t.timeLeft) + '</div>' +
    '<div class="timerbar"><div class="timerfill" id="timerBar" style="width:' +
    Math.max(0, Math.round(t.timeLeft / S.seconds * 100)) + '%"></div></div></div>' +
    '<button id="btnMusic" class="btn ghost btn-sm">' + (S.musicOn ? '🔊' : '🔇') + '</button></div>';
  h += '<div class="playgrid">' + questionHtml() + mineHtml(t) + '</div>';
  h += '<div class="row"><button id="btnEndTeam" class="btn">⏹ Kết thúc lượt đội này</button></div>';
  root.innerHTML = h;
  renderRich($('qText'), S.cur && S.cur.qHtml, S.cur && S.cur.q);
  var qo = $('qOpts');
  if (qo && S.cur) {
    qo.innerHTML = '';
    var QC = G.QuizCommon;
    var canAns = (S.phase === 'question');
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
          d.addEventListener('click', function () { answer(idx); });
        })(i);
      }
      qo.appendChild(d);
    });
  }
  var tiles = root.querySelectorAll('.tile[data-tile]');
  for (var i = 0; i < tiles.length; i++) {
    (function (b) {
      b.addEventListener('click', function () {
        dig(parseInt(b.getAttribute('data-tile'), 10));
      });
    })(tiles[i]);
  }
  bind('btnMusic', function () {
    var on = Music.toggle();
    var bm = $('btnMusic'); if (bm) bm.textContent = on ? '🔊' : '🔇';
  });
  /* Sửa 2026-10-31: nút THẢ MÓC cho chế độ động */
  bind('btnFire', cannonFire);
  bind('btnEndTeam', function () { endTeam('GV kết thúc lượt ⏹'); });
}
function renderTeamSummary() {
  var root = $('screen'); if (!root) return;
  var t = team();
  var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
  var last = S.curTeam >= S.order.length - 1;
  var h = '<div class="panel center teamsum"><h2 style="color:' + c.css + '">' + esc(t.name) +
    ' — xong lượt!</h2>' +
    '<div class="bigscore">' + t.points + 'đ</div>' +
    '<p class="muted">' + esc(t.reason) + ' · Đã bắn ' + (t.shotCount || 0) + ' phát · ' +
    'Trả lời ' + t.packIdx + '/' + t.pack.length + ' câu</p>' +
    '<button id="btnNextTeam" class="btn primary big">' +
    (last ? '🏆 Xem kết quả' : '▶ Lượt của đội tiếp theo') + '</button></div>';
  root.innerHTML = h;
  bind('btnNextTeam', nextTeam);
}
function renderResult() {
  var root = $('screen'); if (!root) return;
  var rank = rankTeams();
  var medals = ['🥇', '🥈', '🥉'];
  var h = '<div class="panel result"><h2>🏆 Kết quả Hải Chiến</h2><table class="rtable">';
  h += '<tr><th>Hạng</th><th>Đội</th><th>Điểm</th><th>Đã bắn</th></tr>';
  rank.forEach(function (r, pos) {
    var t = S.teams[r.i];
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    var first = pos === 0 ? ' class="first"' : '';
    h += '<tr' + first + '><td>' + (medals[pos] || (pos + 1)) + '</td>' +
      '<td><span class="dot" style="background:' + c.css + '"></span><b>' + esc(t.name) + '</b><br><small>' +
      esc(t.members.join(', ')) + '</small><br><small class="muted">' + esc(t.reason) + '</small></td>' +
      '<td><b>' + t.points + 'đ</b></td><td>' + (t.shotCount || 0) + ' phát</td></tr>';
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
  else if (S.screen === 'teamsummary') renderTeamSummary();
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
G.__HAICHIEN = {
  S: S, CFG: CFG, TARGET_POINTS: TARGET_POINTS, TARGET_VIEW: TARGET_VIEW,
  buildTargets: buildTargets, buildDecor: buildDecor,
  dealPacks: dealPacks, splitTeams: splitTeams, fmtTime: fmtTime,
  startDig: startDig, answer: answer, cannonFire: cannonFire, tick: tick,
  nextQuestionOrEnd: nextQuestionOrEnd, endTeam: endTeam, nextTeam: nextTeam,
  rankTeams: rankTeams, effectiveBank: effectiveBank, rebuildBank: rebuildBank,
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
