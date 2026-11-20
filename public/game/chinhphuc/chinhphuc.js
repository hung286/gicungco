/* ============================================================
 * CHINH PHỤC ĐỈNH CAO — SmartEdu (Kho Game Học Tập)
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
  storeKey: 'smartedu_chinhphuc_teams'
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
   CHINH PHỤC ĐỈNH CAO — cấu hình (thầy duyệt 2026-10-31)
   - Núi 10 tầng, điểm tăng dần theo độ cao
   - Liều ăn nhiều: đúng → chọn DỪNG (chốt điểm) hoặc LEO TIẾP
   - Sai → RƠI xuống chân núi, mất sạch điểm chưa chốt!
   ============================================================ */
var MOUNTAIN_LEVELS = 10;  // mặc định, thầy chọn ở setup (10/15/20)
var LEVEL_POINTS = [];     // tính động theo số tầng
function buildLevelPoints(n) {
  var arr = [0];
  for (var i = 1; i <= n; i++) arr.push(i * 10);  // tầng i = i*10 điểm
  return arr;
}
var STORM_MIN_LEVEL = 5;   // bão chỉ xuất hiện từ tầng 5 trở lên
var STORM_CHANCE = 0.2;    // 20% gặp bão mỗi lần leo
/* THẦY CHỈNH TẠI ĐÂY: tỉ lệ bão, tầng bắt đầu có bão */

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
  teams: [],              // {name,members[],colorIdx,banked,unbanked,level,pack[],packIdx,timeLeft,timerId,done,reason}
  order: [],              // thứ tự đội chơi
  curTeam: 0,             // index trong order
  phase: 'question',      // question | choice  (trong lượt 1 đội)
  cur: null,              // câu hỏi đang chiếu
  seconds: CFG.defaultSeconds,
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
    /* CHINH PHỤC ĐỈNH CAO: bão tuyết */
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
  /* Thầy 2026-11-01: chọn số tầng 10/15/20 (radio, chỉ 1) */
  var ml = document.querySelector('input[name="mountLevels"]:checked');
  MOUNTAIN_LEVELS = TRIAL ? 10 : (ml ? parseInt(ml.value, 10) : 10);
  LEVEL_POINTS = buildLevelPoints(MOUNTAIN_LEVELS);
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
    t.level = 0; t.banked = 0; t.unbanked = 0; t.climbs = 0;
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
  var t = team();
  if (optIdx === S.cur.ans) {
    Snd.correct();
    announce('✅ ĐÚNG!', true);
    // leo lên 1 tầng
    t.level = Math.min(t.level + 1, MOUNTAIN_LEVELS);
    t.climbs++;
    var pts = LEVEL_POINTS[t.level] || 0;
    t.unbanked += pts;
    t.points = t.banked + t.unbanked;  // điểm hiển thị = đã chốt + đang liều
    // bão ngẫu nhiên từ tầng 5
    if (t.level >= STORM_MIN_LEVEL && Math.random() < STORM_CHANCE) {
      Snd.storm();
      announce('⛈️ BÃO TUYẾT!', false);
      toast('Dính bão! Rơi xuống chân núi, mất ' + t.unbanked + 'đ chưa chốt!');
      t.level = 0; t.unbanked = 0; t.points = t.banked;
      nextQuestionOrEnd();
      return;
    }
    if (t.level >= MOUNTAIN_LEVELS) {
      // chạm đỉnh! tự động chốt
      t.banked += t.unbanked;
      t.points = t.banked;
      t.unbanked = 0; t.level = 0;
      Snd.fanfare();
      announce('🏔️ CHINH PHỤC ĐỈNH!', true);
      toast('Chạm đỉnh + chốt ' + pts + 'đ!');
      nextQuestionOrEnd();
      return;
    }
    // cho đội chọn: dừng hay leo tiếp
    S.phase = 'choice';
    render();
  } else {
    Snd.wrong();
    announce('❌ SAI!', false);
    if (t.unbanked > 0) {
      toast('RƠI xuống núi! Mất ' + t.unbanked + 'đ chưa chốt!');
    } else {
      toast('Sai rồi — sang câu tiếp theo.');
    }
    t.level = 0; t.unbanked = 0; t.points = t.banked;
    nextQuestionOrEnd();  // tự render bên trong
  }
}
/* Đội chọn DỪNG (chốt điểm) hoặc LEO TIẾP */
function makeChoice(stop) {
  if (S.screen !== 'play' || S.phase !== 'choice') return;
  var t = team();
  if (stop) {
    t.banked += t.unbanked;
    t.points = t.banked;
    toast('🛑 Chốt ' + t.unbanked + 'đ an toàn!');
    t.unbanked = 0; t.level = 0;
    Snd.correct();
  } else {
    toast('🧗 Leo tiếp lên tầng ' + (t.level + 1) + '!');
    Snd.click();
  }
  nextQuestionOrEnd();
}
/* Đội bấm 1 ô trong mỏ để đào (chỉ chế độ tĩnh — động dùng móc treo) */
function nextQuestionOrEnd() {
  var t = team();
  t.packIdx++;
  if (t.packIdx >= t.pack.length) { endTeam('Hết câu hỏi ❓'); return; }
  S.phase = 'question';
  S.cur = t.pack[t.packIdx];
  render();
}
function endTeam(reason) {
  var t = team();
  stopTimer(t);
  t.done = true;
  t.reason = reason;
  Snd.whistle();
  dynStop();  // Sửa 2026-10-31: dừng animation móc treo khi hết lượt
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

function mountainHtml(t) {
  var h = '<div class="mountainwrap"><div class="mountaintitle">🏔️ Núi — ' + esc(t.name) +
    ' <span class="muted">(chốt: ' + t.banked + 'đ · đang liều: ' + t.unbanked + 'đ)</span></div>';
  h += '<div class="mountain">';
  for (var lv = MOUNTAIN_LEVELS; lv >= 1; lv--) {
    var pts = LEVEL_POINTS[lv];
    var cls = 'mlevel';
    if (lv === t.level) cls += ' here';
    if (lv < t.level) cls += ' passed';
    if (lv === MOUNTAIN_LEVELS) cls += ' peak';
    var icon = lv === MOUNTAIN_LEVELS ? '🏔️' : (lv >= STORM_MIN_LEVEL ? '⛈️' : '⛰️');
    var marker = lv === t.level ? ' 🧗' : '';
    h += '<div class="' + cls + '"><span>' + icon + ' Tầng ' + lv + ' (' + pts + 'đ)' + marker + '</span></div>';
  }
  h += '<div class="mbase">🏕️ Chân núi</div>';
  h += '</div></div>';
  return h;
}
/* Hộp chọn DỪNG / LEO TIẾP — đặt ngay dưới câu hỏi (thầy 2026-11-01: màn nhỏ đỡ mỏi) */
function choiceHtml(t) {
  if (S.phase !== 'choice' || t.done) return '';
  return '<div class="choicebox"><h3>🎯 Tầng ' + t.level + ' — đang giữ ' + t.unbanked + 'đ chưa chốt!</h3>' +
    '<div class="row center">' +
    '<button id="btnStop" class="btn primary big">🛑 DỪNG LẠI (chốt ' + t.unbanked + 'đ)</button> ' +
    '<button id="btnContinue" class="btn big">🧗 LEO TIẾP (tầng ' + (t.level + 1) + ' = ' + (LEVEL_POINTS[t.level + 1] || 0) + 'đ)</button>' +
    '</div><p class="muted center">Leo tiếp mà sai sẽ RƠI mất hết ' + t.unbanked + 'đ!</p></div>';
}
function mineHtml(t) {
  return mountainHtml(t);
}
function questionHtml() {
  if (!S.cur) return '<div class="panel center"><span class="muted">Hết câu hỏi.</span></div>';
  var t = team();
  var h = '<div class="panel qpanel">';
  h += '<div class="qhead"><span class="qteam">' + esc(t.name) + '</span>' +
    '<span class="muted">Câu ' + (t.packIdx + 1) + '/' + t.pack.length + '</span></div>';
  h += '<div id="qText" class="qtext"></div><div id="qOpts" class="qopts"></div>';
  var canAns = (S.phase === 'question' && !t.done);
  h += '<div class="muted" style="margin-top:8px">' +
    (canAns ? '👆 GV bấm vào đáp án đội vừa trả lời.' : '🧗 Đúng rồi! 🛑 DỪNG LẠI hay 🧗 LEO TIẾP?') + '</div>';
  h += '</div>';
  return h;
}
function renderSetup() {
  var root = $('screen'); if (!root) return;
  var h = '<div class="screen">' +
    (TRIAL ? '<div class="badge-trial">BẢN CHƠI THỬ — 2 đội, 60 giây/đội</div>' : '') +
    '<h1 class="game-title">🏔️ Chinh Phục Đỉnh Cao</h1>' +
    '<div class="subtitle">Trả lời đúng để chinh phục đỉnh cao — đội nào nhiều điểm nhất thắng!</div>' +
    '<div class="cfg">';
  if (!TRIAL) {
    h += '<label>Số đội (2–8): <input id="teamCount" type="number" min="2" max="8" value="2"></label>';
    h += '<label>Thời gian mỗi đội (giây): <input id="teamSeconds" type="number" min="10" max="1800" value="' + CFG.defaultSeconds + '"></label>';
    h += '<div class="row muted">🏔️ Số tầng: ' +
      '<label class="chk"><input type="radio" name="mountLevels" value="10" checked> 10 tầng</label> ' +
      '<label class="chk"><input type="radio" name="mountLevels" value="15"> 15 tầng</label> ' +
      '<label class="chk"><input type="radio" name="mountLevels" value="20"> 20 tầng</label></div>';
    h += '<div class="row muted">Tầng cao điểm to · sai là rơi mất điểm chưa chốt!</div>';
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
    '<li>👥 <b>Chia đội</b> — các đội chơi lần lượt, mỗi đội một lượt riêng.</li>' +
    '<li>🏔️ <b>Chọn số tầng</b> — 10 / 15 / 20 tầng (chỉ chọn 1); điểm = tầng × 10đ, đỉnh 20 tầng = 200đ.</li>' +
    '<li>⏱ <b>Thời gian riêng</b> — mỗi đội có đồng hồ riêng (mặc định 90 giây, chỉnh được).</li>' +
    '<li>✅ <b>Trả lời đúng</b> → leo lên 1 tầng, điểm cộng vào "đang liều".</li>' +
    '<li>🎯 <b>Sau mỗi câu đúng</b>, đội chọn: 🛑 <b>DỪNG LẠI</b> (chốt điểm, an toàn) hoặc 🧗 <b>LEO TIẾP</b> (lên tầng cao ăn điểm to hơn).</li>' +
    '<li>❌ <b>Trả lời sai</b> → RƠI xuống chân núi, mất sạch điểm chưa chốt!</li>' +
    '<li>⛈️ <b>Từ tầng 5</b> trở lên có 20% gặp bão tuyết — rơi mất hết!</li>' +
    '<li>🏁 <b>Hết câu hỏi</b> → đội chốt được nhiều điểm nhất thắng; hòa → câu hỏi phụ.</li>' +
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
  h += '<div class="playhead"><h2>🏔️ <span style="color:' + c.css + '">' + esc(t.name) +
    '</span> đang leo núi</h2>' +
    '<div class="timerwrap"><div class="timer" id="timerText">' + fmtTime(t.timeLeft) + '</div>' +
    '<div class="timerbar"><div class="timerfill" id="timerBar" style="width:' +
    Math.max(0, Math.round(t.timeLeft / S.seconds * 100)) + '%"></div></div></div>' +
    '<button id="btnMusic" class="btn ghost btn-sm">' + (S.musicOn ? '🔊' : '🔇') + '</button></div>';
  h += '<div class="playgrid"><div class="qcol">' + questionHtml() + choiceHtml(t) + '</div>' + mineHtml(t) + '</div>';
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
  /* CHINH PHỤC ĐỈNH CAO: nút DỪNG / LEO TIẾP */
  bind('btnStop', function () { makeChoice(true); });
  bind('btnContinue', function () { makeChoice(false); });
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
    '<p class="muted">' + esc(t.reason) + ' · Đã leo ' + (t.climbs || 0) + ' tầng · ' +
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
  var h = '<div class="panel result"><h2>🏆 Kết quả Chinh Phục Đỉnh Cao</h2><table class="rtable">';
  h += '<tr><th>Hạng</th><th>Đội</th><th>Điểm</th><th>Đã leo</th></tr>';
  rank.forEach(function (r, pos) {
    var t = S.teams[r.i];
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    var first = pos === 0 ? ' class="first"' : '';
    h += '<tr' + first + '><td>' + (medals[pos] || (pos + 1)) + '</td>' +
      '<td><span class="dot" style="background:' + c.css + '"></span><b>' + esc(t.name) + '</b><br><small>' +
      esc(t.members.join(', ')) + '</small><br><small class="muted">' + esc(t.reason) + '</small></td>' +
      '<td><b>' + t.points + 'đ</b></td><td>' + (t.climbs || 0) + ' tầng</td></tr>';
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
G.__CHINHPHUC = {
  S: S, CFG: CFG, MOUNTAIN_LEVELS: MOUNTAIN_LEVELS, LEVEL_POINTS: LEVEL_POINTS,
  STORM_MIN_LEVEL: STORM_MIN_LEVEL, STORM_CHANCE: STORM_CHANCE,
  buildLevelPoints: buildLevelPoints,
  dealPacks: dealPacks, splitTeams: splitTeams, fmtTime: fmtTime,
  answer: answer, makeChoice: makeChoice, tick: tick,
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
