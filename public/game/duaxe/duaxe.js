/* ============================================================
 * ĐUA XE TRI THỨC — SmartEdu
 * Luật (Thầy Nguyễn Mạnh Hùng chốt 2026-10-30):
 * - Mỗi đội 1 xe, màu khác nhau, phun lửa phía sau; càng gần đích lửa càng dài.
 * - Tổng quãng đường 100m. Câu đúng +10m (10 điểm).
 * - Sai 2 lần LIÊN TIẾP → lùi 10m (không quá vạch xuất phát).
 * - Cơ chế đội nhanh nhất: GV bấm chọn đội nhanh nhất trả lời;
 *   sai → đội nhanh thứ 2 được trả lời tiếp (cùng câu hỏi).
 * - Câu hỏi bốc ngẫu nhiên từ kho import, không lặp trong 1 cuộc đua.
 * - Kết thúc khi 1 đội về đích (100m) hoặc hết câu hỏi.
 *   Hết câu hỏi → xếp theo khoảng cách đến đích (gần đích hơn xếp trên).
 * - Hòa → câu hỏi phụ (3 câu cuối của đợt import được tách riêng).
 * - Âm thanh theo chặng: đúng / sai / nửa đường / về đích / bị lùi.
 * Khung chuẩn: import HS Excel + câu hỏi Word (KaTeX/ảnh qua QuizCommon),
 * bản trial (window.__TRIAL__) 2 đội, không nhập liệu, không security/gate.
 * ============================================================ */
(function (G) {
'use strict';

var TRIAL = !!(G && G.__TRIAL__);
var CFG = {
  trial: TRIAL,
  storeSuffix: TRIAL ? '_trial' : '',
  raceDist: 100,      // tổng quãng đường (m)
  perCorrect: 10,     // mỗi câu đúng +10m
  backDist: 10,       // lùi 10m khi sai 2 lần liên tiếp
  halfway: 50,        // mốc nửa đường
  maxTeams: 8,
  storeKey: 'smartedu_duaxe_teams'
};

/* ---------- màu xe (dùng hue-rotate lên emoji) ---------- */
var TEAM_COLORS = [
  { name: 'Đỏ',     hue: 0,   css: '#e11d48' },
  { name: 'Xanh dương', hue: 210, css: '#2563eb' },
  { name: 'Xanh lá', hue: 120, css: '#16a34a' },
  { name: 'Vàng',   hue: 45,  css: '#eab308' },
  { name: 'Tím',    hue: 270, css: '#9333ea' },
  { name: 'Cam',    hue: 25,  css: '#ea580c' },
  { name: 'Hồng',   hue: 320, css: '#ec4899' },
  { name: 'Xanh ngọc', hue: 180, css: '#0891b2' }
];

/* ---------- state ---------- */
var S = {
  screen: 'setup',          // setup | race | tiebreak | result
  teams: [],                // {name, members[], colorIdx, dist, score, wrongStreak, finished, halfwayNotified}
  mainQ: [],                // ngân hàng câu hỏi chính (đã tách 3 câu phụ)
  tieQ: [],                 // 3 câu hỏi phụ
  drawPile: [],             // chỉ số câu hỏi còn lại để bốc (không lặp)
  cur: null,                // câu hỏi đang chiếu {q, opts, ans, qHtml, optsHtml}
  buzzed: [],               // thứ tự đội GV đã bấm (nhanh nhất trước)
  answering: -1,            // index đội đang trả lời (-1 = chưa chọn)
  qCount: 0,                // số câu đã hỏi
  winner: -1,
  tieState: null,           // state cho vòng câu hỏi phụ
  raceOver: false
};

/* Ngân hàng rich (session-only, không lưu localStorage) */
var RICHQ = [];   // [{q, opts[4], ans, qHtml, optsHtml}]
var USE_DEFAULTS = true;  // Sửa 2026-10-31: thầy muốn tắt câu mẫu hệ thống → false
var QINFO = '';

/* ============================================================
   ÂM THANH GAME (WebAudio) — THẦY THAY NHẠC TẠI ĐÂY (2026-10-31)
   Các hiệu ứng hiện có: click, correct (trả lời đúng), wrong (sai),
   halfway (nửa đường 50m), finish (về đích), pushback (bị lùi 10m),
   whistle (còi khai cuộc), tick (đếm giờ).
   Muốn thay bằng file nhạc riêng: dùng thẻ <audio> hoặc Audio() với
   đường dẫn file mp3, gọi .play() trong các hàm tương ứng bên dưới.
   Game này chưa có nhạc nền — thầy yêu cầu thêm ở bản Đào Vàng.
   ============================================================ */
// THẦY MUỐN THAY NHẠC RIÊNG: sửa các hàm trong Snd bên dưới.
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
    halfway: function () { tone(880, 0.15, 'triangle', 0.2); tone(1174, 0.25, 'triangle', 0.2, 0.14); },
    back: function () { tone(400, 0.3, 'sawtooth', 0.12); tone(300, 0.3, 'sawtooth', 0.12, 0.12); tone(200, 0.4, 'sawtooth', 0.12, 0.24); },
    finish: function () {
      var seq = [523, 659, 784, 1046, 784, 1046];
      for (var i = 0; i < seq.length; i++) tone(seq[i], 0.16, 'triangle', 0.2, i * 0.14);
    },
    whistle: function () { tone(2093, 0.35, 'sine', 0.15); }
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
/* Tách 3 câu cuối làm câu hỏi phụ. Trả về {main, tie}. */
function splitBank(bank) {
  bank = bank || [];
  if (bank.length <= 3) return { main: bank.slice(), tie: [] };
  return { main: bank.slice(0, bank.length - 3), tie: bank.slice(bank.length - 3) };
}
function effectiveBank() {
  // Câu import (rich) + câu mẫu hệ thống (nếu bật); câu rich session-only.
  // Sửa 2026-10-31 (thầy: muốn xóa cả câu mẫu để chỉ chơi câu import)
  var base = USE_DEFAULTS ? defaultQuestions() : [];
  var rich = RICHQ.map(function (r) {
    return { q: r.q, opts: r.opts, ans: r.ans, qHtml: r.qHtml, optsHtml: r.optsHtml };
  });
  return rich.concat(base);
}
function rebuildBank() {
  var sp = splitBank(effectiveBank());
  S.mainQ = sp.main;
  S.tieQ = sp.tie;
  resetDrawPile();
  QINFO = 'Kho câu hỏi: ' + S.mainQ.length + ' câu đua + ' + S.tieQ.length + ' câu phụ.';
  var qi = $('qBankInfo');
  if (qi) qi.textContent = QINFO;
  renderQBankTable();
}
/* Sửa 2026-10-30 (thầy: nhập câu hỏi phải hiện bảng): liệt kê câu hỏi trong kho */
function renderQBankTable() {
  var box = $('qBankTable'); if (!box) return;
  var all = (S.mainQ || []).concat(S.tieQ || []);
  if (!all.length) { box.innerHTML = '<span class="muted">Chưa có câu hỏi.</span>'; return; }
  var h = '<table class="qtable"><tr><th>#</th><th>Câu hỏi</th><th>Đáp án</th><th>Loại</th></tr>';
  all.forEach(function (q, i) {
    var isTie = i >= (S.mainQ || []).length;
    var txt = (q.q || '').length > 60 ? (q.q || '').slice(0, 60) + '…' : (q.q || '');
    var ans = 'ABCD'[(q.ans == null ? -1 : q.ans)] || '?';
    h += '<tr><td>' + (i + 1) + '</td><td>' + esc(txt) + '</td><td><b>' + ans + '</b></td><td>' +
      (isTie ? '<span class="tag-tie">Phụ</span>' : '<span class="tag-main">Đua</span>') + '</td></tr>';
  });
  h += '</table>';
  box.innerHTML = h;
}
function resetDrawPile() {
  S.drawPile = [];
  for (var i = 0; i < S.mainQ.length; i++) S.drawPile.push(i);
  // xáo
  for (var j = S.drawPile.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = S.drawPile[j]; S.drawPile[j] = S.drawPile[k]; S.drawPile[k] = tmp;
  }
}
function drawQuestion() {
  if (!S.drawPile.length) return null;
  var idx = S.drawPile.pop();
  return S.mainQ[idx];
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
/* Chia đội ngẫu nhiên đều: floor(n/k), phần dư +1 ngẫu nhiên. */
function splitTeams(students, k) {
  var n = students.length;
  var base = Math.floor(n / k), rem = n % k;
  var idx = [];
  for (var i = 0; i < n; i++) idx.push(i);
  for (var j = idx.length - 1; j > 0; j--) {
    var r = Math.floor(Math.random() * (j + 1));
    var t = idx[j]; idx[j] = idx[r]; idx[r] = t;
  }
  var teams = [], p = 0;
  for (var d = 0; d < k; d++) {
    var cnt = base + (d < rem ? 1 : 0);
    var members = [];
    for (var m = 0; m < cnt; m++) members.push(students[idx[p++]]);
    teams.push({
      name: 'Đội ' + (d + 1),
      members: members,
      colorIdx: d % TEAM_COLORS.length,
      dist: 0, score: 0, wrongStreak: 0,
      finished: false, halfwayNotified: false
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
        // bỏ dòng tiêu đề
        if (i === 0 && /họ|tên|danh sách|stt/i.test(cell)) continue;
        // cột A là STT số → lấy cột B
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
      /* Lọc câu lỗi: thiếu nội dung, thiếu phương án, hoặc đáp án không hợp lệ */
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
      var msg = 'Đã nhập ' + valid.length + ' câu hỏi (' + S.tieQ.length + ' câu cuối làm câu phụ).';
      if (bad) msg += ' Bỏ qua ' + bad + ' câu lỗi định dạng.';
      toast(msg);
      Snd.correct();
    },
    onEmpty: function () { toast('Không tìm được câu hỏi nào trong file Word.'); },
    onNoLib: function () { toast('Thiếu thư viện đọc Word (mammoth).'); },
    onError: function () { toast('Lỗi đọc file Word.'); }
  });
}

/* ---------- logic đua ---------- */
function startRace() {
  var k = parseInt(($('teamCount') || {}).value || '2', 10);
  if (TRIAL) k = 2;
  if (!(k >= 2 && k <= CFG.maxTeams)) { toast('Số đội từ 2 đến ' + CFG.maxTeams + '.'); return; }
  var students = loadStudents();
  if (students.length < k) { toast('Số học sinh ít hơn số đội!'); return; }
  if (!S.mainQ.length) { toast('Chưa có câu hỏi nào.'); return; }
  S.teams = splitTeams(students, k);
  S.qCount = 0; S.winner = -1; S.raceOver = false;
  S.cur = null; S.buzzed = []; S.answering = -1;
  S.tieState = null;
  resetDrawPile();
  S.screen = 'race';
  Snd.whistle();
  render();
}
function nextQuestion() {
  if (S.raceOver) return;
  var q = drawQuestion();
  if (!q) { endByExhaustion(); return; }
  S.cur = q; S.qCount++;
  S.buzzed = []; S.answering = -1;
  render();
}
/* GV bấm chọn đội theo thứ tự nhanh nhất */
function buzzTeam(ti) {
  if (!S.cur || S.answering !== -1) return;
  if (S.buzzed.indexOf(ti) !== -1) return;
  S.buzzed.push(ti);
  S.answering = ti;
  Snd.click();
  render();
}
/* GV đánh giá đội đang trả lời: true = đúng, false = sai */
function judge(ok) {
  var ti = S.answering;
  if (!S.cur || ti < 0 || S.raceOver) return;
  var team = S.teams[ti];
  if (ok) {
    team.dist = Math.min(CFG.raceDist, team.dist + CFG.perCorrect);
    team.score += CFG.perCorrect;
    team.wrongStreak = 0;
    Snd.correct();
    // mốc nửa đường
    if (!team.halfwayNotified && team.dist >= CFG.halfway && team.dist < CFG.raceDist) {
      team.halfwayNotified = true;
      Snd.halfway();
      toast(team.name + ' đã đi được nửa đường!');
    }
    if (team.dist >= CFG.raceDist) {
      team.finished = true;
      S.winner = ti;
      S.raceOver = true;
      Snd.finish();
      render();
      setTimeout(function () { showResult(); }, 1200);
      return;
    }
  } else {
    team.wrongStreak++;
    Snd.wrong();
    if (team.wrongStreak >= 2) {
      team.wrongStreak = 0;
      var old = team.dist;
      team.dist = Math.max(0, team.dist - CFG.backDist);
      team.score = Math.max(0, team.score - CFG.backDist);
      if (team.dist < old) {
        Snd.back();
        toast(team.name + ' trả lời sai 2 lần liên tiếp — lùi ' + CFG.backDist + 'm!');
      }
    }
    // đội nhanh tiếp theo được trả lời cùng câu
    S.answering = -1;
    render();
    return;
  }
  // đúng → câu tiếp theo
  S.cur = null; S.buzzed = []; S.answering = -1;
  render();
  setTimeout(nextQuestion, 900);
}
/* Bỏ qua câu hiện tại */
function skipQuestion() {
  S.cur = null; S.buzzed = []; S.answering = -1;
  S.teams.forEach(function (t) { t.wrongStreak = 0; });
  render();
  setTimeout(nextQuestion, 300);
}
/* Hết câu hỏi → xếp theo khoảng cách đến đích (gần đích hơn xếp trên) */
function endByExhaustion() {
  S.raceOver = true;
  S.cur = null;
  Snd.whistle();
  showResult();
}
/* Thứ hạng: dist giảm dần; hòa dist → tiebreak */
function rankTeams() {
  var arr = S.teams.map(function (t, i) { return { t: t, i: i }; });
  arr.sort(function (a, b) { return b.t.dist - a.t.dist; });
  return arr;
}
function tiedGroups() {
  var ranked = rankTeams();
  var groups = [], cur = [];
  for (var i = 0; i < ranked.length; i++) {
    if (!cur.length || ranked[i].t.dist === cur[0].t.dist) cur.push(ranked[i]);
    else { if (cur.length > 1) groups.push(cur); cur = [ranked[i]]; }
  }
  if (cur.length > 1) groups.push(cur);
  return groups;
}

/* ---------- câu hỏi phụ ---------- */
function startTiebreak() {
  var groups = tiedGroups();
  if (!groups.length) { showResult(); return; }
  if (!S.tieQ.length) { toast('Không có câu hỏi phụ — xếp ngẫu nhiên.'); randomRank(); return; }
  // gộp tất cả đội hòa vào 1 vòng
  var ids = [];
  groups.forEach(function (g) { g.forEach(function (r) { ids.push(r.i); }); });
  S.tieState = {
    teamIds: ids,
    qIdx: 0,
    results: {} // teamIdx -> true/false
  };
  S.screen = 'tiebreak';
  render();
}
function tiebreakAnswer(ti, ok) {
  var ts = S.tieState; if (!ts) return;
  ts.results[ti] = !!ok;
  if (ok) Snd.correct(); else Snd.wrong();
  // xong 1 vòng khi mọi đội đã trả lời
  var done = ts.teamIds.every(function (id) { return id in ts.results; });
  if (done) {
    applyTiebreak();
  } else {
    render();
  }
}
function applyTiebreak() {
  var ts = S.tieState; if (!ts) return;
  // đúng xếp trên, sai xếp dưới (giữ nguyên nhóm)
  var order = S.teams.map(function (t, i) { return i; });
  var rank = rankTeams().map(function (r) { return r.i; });
  // sắp lại trong từng nhóm hòa
  var groups = tiedGroups();
  groups.forEach(function (g) {
    var ids = g.map(function (r) { return r.i; });
    ids.sort(function (a, b) {
      var ra = ts.results[a] ? 0 : 1, rb = ts.results[b] ? 0 : 1;
      return ra - rb;
    });
    // thay thế thứ tự trong rank
    var pos = [];
    rank.forEach(function (id, p) { if (ids.indexOf(id) !== -1) pos.push(p); });
    pos.forEach(function (p, k) { rank[p] = ids[k]; });
  });
  S.tieState.rank = rank;
  S.screen = 'result';
  render();
}
function randomRank() {
  var rank = rankTeams().map(function (r) { return r.i; });
  var groups = tiedGroups();
  groups.forEach(function (g) {
    var ids = g.map(function (r) { return r.i; });
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    }
    var pos = [];
    rank.forEach(function (id, p) { if (ids.indexOf(id) !== -1) pos.push(p); });
    pos.forEach(function (p, k) { rank[p] = ids[k]; });
  });
  S.tieState = { rank: rank };
  S.screen = 'result';
  render();
}

/* ---------- tổng kết ---------- */
function showResult() {
  var groups = tiedGroups();
  if (groups.length && S.winner === -1) {
    // hòa mà chưa có người thắng → đề xuất câu hỏi phụ
    S.screen = 'tieask';
  } else {
    S.tieState = { rank: rankTeams().map(function (r) { return r.i; }) };
    S.screen = 'result';
  }
  render();
}

/* ---------- render ---------- */
function carStyle(colorIdx) {
  var c = TEAM_COLORS[colorIdx % TEAM_COLORS.length];
  return 'filter:hue-rotate(' + c.hue + 'deg);';
}
/* độ dài lửa theo tiến trình: 0.4 → 2.2 */
function flameScale(dist) {
  return (0.4 + (dist / CFG.raceDist) * 1.8).toFixed(2);
}
function renderSetup() {
  var root = $('screen'); if (!root) return;
  var students = loadStudents();
  var h = '';
  h += '<div class="panel">';
  h += '<h2>🏁 Đua Xe Tri Thức</h2>';
  h += '<p class="muted">Mỗi câu đúng +10m. Sai 2 lần liên tiếp lùi 10m. Về đích 100m thắng!</p>';
  if (!TRIAL) {
    h += '<div class="row"><label>Số đội (2–8):</label><input id="teamCount" type="number" min="2" max="8" value="4"></div>';
    /* Nhóm học sinh: nút nhập + ô danh sách + nút lưu gom chung một chỗ */
    h += '<div class="setup-group"><div class="row"><button id="btnExcel" class="btn">📥 Nhập HS từ Excel</button><input type="file" id="fileExcel" accept=".xlsx,.xls" class="hidden"></div>';
    h += '<div class="row"><label><b>Danh sách học sinh</b> <span class="muted">(mỗi dòng 1 tên — sửa trực tiếp rồi bấm Lưu):</span></label></div>';
    h += '<div class="row"><textarea id="studentList" rows="6" placeholder="Dán danh sách HS, mỗi dòng 1 tên..."></textarea></div>';
    h += '<div class="row"><button id="btnSaveStudents" class="btn">💾 Lưu danh sách HS</button> <span id="studentInfo" class="muted"></span></div></div>';
    /* Nhóm câu hỏi: nút nhập + nút xóa + thông tin kho + bảng câu hỏi gom chung một chỗ */
    h += '<div class="setup-group"><div class="row"><button id="btnWord" class="btn">📥 Nhập câu hỏi từ Word</button><input type="file" id="fileWord" accept=".docx" class="hidden"> ';
    h += '<button id="btnClearQ" class="btn bad">🗑 Xóa câu đã nhập</button> ';
    h += '<button id="btnToggleDefaults" class="btn bad">🗑 Xóa câu mẫu</button></div>';
    h += '<div class="row"><span id="qBankInfo" class="muted"></span></div>';
    h += '<div class="row"><div id="qBankTable" class="qbank-wrap"></div></div></div>';
  } else {
    h += '<div class="row"><span class="muted">Bản chơi thử: 2 đội, câu hỏi mẫu.</span></div>';
  }
  h += '<div class="row"><button id="btnStart" class="btn primary big">🚦 Bắt đầu đua</button> <button id="btnHelp" class="btn">📖 Hướng dẫn</button></div>';
  h += '</div><div id="helpBox" class="panel hidden"></div>';
  root.innerHTML = h;
  renderStudentInfo(students);
  var qi = $('qBankInfo'); if (qi) qi.textContent = QINFO;
  renderQBankTable();
  bind('btnStart', startRace);
  bind('btnHelp', showHelp);
  if (!TRIAL) {
    bind('btnExcel', function () { var f = $('fileExcel'); if (f) f.click(); });
    bind('btnWord', function () { var f = $('fileWord'); if (f) f.click(); });
    /* Sửa 2026-10-31 (thầy: cần nút xóa để câu cũ không bị giữ lại) */
    bind('btnClearQ', function () {
      if (!RICHQ.length) { toast('Chưa có câu hỏi nào được nhập.'); return; }
      if (!confirm('Xóa tất cả ' + RICHQ.length + ' câu hỏi đã nhập? (Câu hỏi mẫu vẫn giữ lại)')) return;
      RICHQ = [];
      rebuildBank();
      toast('Đã xóa câu hỏi đã nhập. Kho còn câu hỏi mẫu.');
    });
    /* Sửa 2026-10-31 (thầy: muốn xóa cả câu mẫu hệ thống) */
    bind('btnToggleDefaults', function () {
      USE_DEFAULTS = !USE_DEFAULTS;
      rebuildBank();
      var btn = $('btnToggleDefaults');
      if (btn) btn.textContent = USE_DEFAULTS ? '🗑 Xóa câu mẫu' : '↩ Khôi phục câu mẫu';
      toast(USE_DEFAULTS ? 'Đã bật lại câu hỏi mẫu.' : 'Đã tắt câu hỏi mẫu. Chỉ chơi câu đã nhập.');
    });
    bind('btnSaveStudents', function () {
      var ta = $('studentList');
      var names = ta ? ta.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : [];
      if (!names.length) { toast('Chưa có tên học sinh.'); return; }
      saveStudents(names); renderStudentInfo(names); toast('Đã lưu ' + names.length + ' học sinh.');
    });
    var fe = $('fileExcel');
    if (fe) fe.addEventListener('change', function () { if (fe.files[0]) importStudentsFromExcel(fe.files[0]); fe.value = ''; });
    var fw = $('fileWord');
    if (fw) fw.addEventListener('change', function () { if (fw.files[0]) importQuestionsFromWord(fw.files[0]); fw.value = ''; });
  }
}
function showHelp() {
  var box = $('helpBox'); if (!box) return;
  box.classList.toggle('hidden');
  box.innerHTML = '<h3>📖 Hướng dẫn</h3><ol>' +
    '<li>Mỗi đội 1 xe riêng, màu khác nhau. Xe phun lửa phía sau — càng gần đích lửa càng dài.</li>' +
    '<li>GV chiếu câu hỏi, các đội giơ tay. GV bấm chọn <b>đội nhanh nhất</b> cho trả lời.</li>' +
    '<li>Trả lời <b>đúng: +10m</b>. <b>Sai:</b> đội nhanh thứ 2 được trả lời tiếp câu đó.</li>' +
    '<li>Đội nào <b>sai 2 lần liên tiếp → lùi 10m</b> (không lùi quá vạch xuất phát).</li>' +
    '<li>Câu hỏi bốc ngẫu nhiên, không lặp lại trong 1 cuộc đua. 3 câu cuối của đợt import làm <b>câu hỏi phụ</b>.</li>' +
    '<li>Kết thúc khi 1 đội về đích (100m) hoặc hết câu hỏi. Hết câu hỏi → xếp theo khoảng cách đến đích.</li>' +
    '<li>Câu hỏi có thể chứa công thức $...$ và hình ảnh (nhập từ Word).</li>' +
    '</ol>';
}
function laneHtml(t, i) {
  var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
  var pct = Math.max(0, Math.min(100, (t.dist / CFG.raceDist) * 100));
  var h = '<div class="lane">';
  h += '<div class="lane-label" style="border-color:' + c.css + '"><b>' + esc(t.name) + '</b><span>' + t.dist + 'm</span></div>';
  h += '<div class="track">';
  h += '<div class="halfway" style="left:50%" title="50m"></div>';
  h += '<div class="finish" title="Đích 100m">🏁</div>';
  // xe: lửa phía sau (bên trái), xe bên phải
  h += '<div class="car" style="left:calc(' + pct + '% - 34px)">';
  h += '<span class="flame" style="transform:scaleX(' + flameScale(t.dist) + ')">🔥</span>';
  /* ============================================================
     THẦY THAY ẢNH XE TẠI ĐÂY (2026-10-31)
     Hiện tại: emoji 🏎️ (màu đội đổi bằng hue-rotate trong carStyle).
     Muốn dùng ảnh riêng: thay '🏎️' bằng '<img src="ten-file.png" ...>'
     và chỉnh kích thước ở duaxe.css (.carbody).
     ============================================================ */
  h += '<span class="carbody" style="' + carStyle(t.colorIdx) + '">🏎️</span>';
  h += '</div>';
  if (t.wrongStreak === 1) h += '<div class="warn">⚠️ sai 1 lần</div>';
  h += '</div></div>';
  return h;
}
function questionHtml() {
  if (!S.cur) return '';
  var h = '<div class="qbox"><div class="qmeta">Câu ' + S.qCount + ' / còn ' + S.drawPile.length + ' câu</div>';
  h += '<div id="qText" class="qtext"></div><div id="qOpts" class="qopts"></div>';
  h += '</div>';
  return h;
}
function buzzHtml() {
  var h = '<div class="panel"><h3>🎙️ GV chọn đội trả lời (nhanh nhất trước)</h3><div class="teamgrid">';
  S.teams.forEach(function (t, i) {
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    var used = S.buzzed.indexOf(i) !== -1;
    h += '<button class="teambtn' + (used ? ' used' : '') + '" data-team="' + i + '" ' + (used || S.answering !== -1 ? 'disabled' : '') +
      ' style="border-color:' + c.css + '">' + esc(t.name) + ' <small>' + t.dist + 'm</small></button>';
  });
  h += '</div>';
  if (S.answering !== -1) {
    var t = S.teams[S.answering];
    h += '<div class="answering"><b>' + esc(t.name) + '</b> đang trả lời… ';
    h += '<button id="btnRight" class="btn good">✔ Đúng (+10m)</button> ';
    h += '<button id="btnWrong" class="btn bad">✘ Sai</button></div>';
  }
  h += '<div class="row"><button id="btnSkip" class="btn">⏭ Bỏ qua câu này</button> <button id="btnEnd" class="btn">🏁 Kết thúc đua</button></div>';
  h += '</div>';
  return h;
}
function renderRace() {
  var root = $('screen'); if (!root) return;
  var h = '<div class="racetitle"><h2>🏁 Đua Xe Tri Thức</h2><span class="muted">Đã hỏi ' + S.qCount + ' câu</span></div>';
  h += '<div class="lanes">';
  S.teams.forEach(function (t, i) { h += laneHtml(t, i); });
  h += '</div>';
  h += questionHtml();
  if (S.cur) h += buzzHtml();
  else h += '<div class="panel center"><button id="btnNextQ" class="btn primary big">❓ Bốc câu hỏi tiếp</button></div>';
  root.innerHTML = h;
  // render câu hỏi rich — phương án bấm được để GV chọn đáp án đội trả lời (tự chấm đúng/sai)
  if (S.cur) {
    renderRich($('qText'), S.cur.qHtml, S.cur.q);
    var qo = $('qOpts');
    if (qo) {
      qo.innerHTML = '';
      var QC = G.QuizCommon;
      var canPick = (S.answering !== -1 && !S.raceOver);
      (S.cur.opts || []).forEach(function (op, i) {
        var d = document.createElement(canPick ? 'button' : 'div');
        d.className = 'opt' + (canPick ? ' pickable' : '');
        var lab = document.createElement('b'); lab.textContent = 'ABCD'[i] + '. ';
        d.appendChild(lab);
        var sp = document.createElement('span');
        if (QC && S.cur.optsHtml && S.cur.optsHtml[i]) QC.setHTML(sp, S.cur.optsHtml[i]);
        else sp.textContent = op;
        d.appendChild(sp);
        if (canPick) {
          (function (idx) {
            d.addEventListener('click', function () {
              if (S.answering === -1 || S.raceOver || !S.cur) return;
              judge(idx === S.cur.ans);
            });
          })(i);
        }
        qo.appendChild(d);
      });
    }
  }
  // bind
  var btns = root.querySelectorAll('.teambtn');
  for (var i = 0; i < btns.length; i++) {
    (function (b) {
      b.addEventListener('click', function () { buzzTeam(parseInt(b.getAttribute('data-team'), 10)); });
    })(btns[i]);
  }
  bind('btnRight', function () { judge(true); });
  bind('btnWrong', function () { judge(false); });
  bind('btnSkip', skipQuestion);
  bind('btnNextQ', nextQuestion);
  bind('btnEnd', endByExhaustion);
}
function renderTieAsk() {
  var root = $('screen'); if (!root) return;
  var h = '<div class="panel center"><h2>🤝 Có đội bằng điểm!</h2>';
  h += '<p class="muted">Các đội bằng khoảng cách đến đích. Thầy chọn cách phân hạng:</p>';
  h += '<button id="btnTieQ" class="btn primary">⚖ Câu hỏi phụ (' + S.tieQ.length + ' câu)</button> ';
  h += '<button id="btnTieRandom" class="btn">🎲 Xếp ngẫu nhiên</button></div>';
  root.innerHTML = h;
  bind('btnTieQ', startTiebreak);
  bind('btnTieRandom', randomRank);
}
function renderTiebreak() {
  var root = $('screen'); if (!root) return;
  var ts = S.tieState; if (!ts) { showResult(); return; }
  var q = S.tieQ[ts.qIdx % S.tieQ.length];
  var h = '<div class="panel"><h2>⚖ Câu hỏi phụ ' + (ts.qIdx + 1) + '</h2>';
  h += '<p class="muted">Mỗi đội cử đại diện trả lời. Đúng xếp trên, sai xếp dưới (không tính điểm).</p>';
  h += '<div id="tqText" class="qtext"></div><div id="tqOpts" class="qopts"></div>';
  h += '<div class="teamgrid">';
  ts.teamIds.forEach(function (ti) {
    var t = S.teams[ti];
    var done = ti in ts.results;
    var cls = done ? (ts.results[ti] ? ' good' : ' bad') : '';
    h += '<div class="tieTeam' + cls + '"><b>' + esc(t.name) + '</b><br>' +
      (done ? (ts.results[ti] ? '✔ Đúng' : '✘ Sai') :
        '<button class="btn good btn-sm" data-tie="' + ti + '|1">✔ Đúng</button> ' +
        '<button class="btn bad btn-sm" data-tie="' + ti + '|0">✘ Sai</button>') + '</div>';
  });
  h += '</div></div>';
  root.innerHTML = h;
  renderRich($('tqText'), q.qHtml, q.q);
  var qo = $('tqOpts');
  if (qo) {
    qo.innerHTML = '';
    var QC = G.QuizCommon;
    (q.opts || []).forEach(function (op, i) {
      var d = document.createElement('div'); d.className = 'opt';
      var lab = document.createElement('b'); lab.textContent = 'ABCD'[i] + '. ';
      d.appendChild(lab);
      var sp = document.createElement('span');
      if (QC && q.optsHtml && q.optsHtml[i]) QC.setHTML(sp, q.optsHtml[i]);
      else sp.textContent = op;
      d.appendChild(sp);
      qo.appendChild(d);
    });
  }
  var btns = root.querySelectorAll('[data-tie]');
  for (var i = 0; i < btns.length; i++) {
    (function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-tie').split('|');
        tiebreakAnswer(parseInt(p[0], 10), p[1] === '1');
      });
    })(btns[i]);
  }
}
function renderResult() {
  var root = $('screen'); if (!root) return;
  var rank = (S.tieState && S.tieState.rank) ? S.tieState.rank : rankTeams().map(function (r) { return r.i; });
  var medals = ['🥇', '🥈', '🥉'];
  var h = '<div class="panel result"><h2>🏆 Kết quả</h2><table class="rtable">';
  h += '<tr><th>Hạng</th><th>Đội</th><th>Quãng đường</th><th>Điểm</th></tr>';
  rank.forEach(function (ti, pos) {
    var t = S.teams[ti];
    var c = TEAM_COLORS[t.colorIdx % TEAM_COLORS.length];
    var first = pos === 0 ? ' class="first"' : '';
    h += '<tr' + first + '><td>' + (medals[pos] || (pos + 1)) + '</td>' +
      '<td><span class="dot" style="background:' + c.css + '"></span><b>' + esc(t.name) + '</b><br><small>' +
      esc(t.members.join(', ')) + '</small></td>' +
      '<td>' + t.dist + 'm</td><td>' + t.score + '</td></tr>';
  });
  h += '</table><div class="row">';
  h += '<button id="btnAgain" class="btn primary">🔄 Đua lại</button> ';
  h += '<button id="btnSetup" class="btn">⚙ Về cài đặt</button></div></div>';
  root.innerHTML = h;
  bind('btnAgain', function () { S.screen = 'setup'; render(); });
  bind('btnSetup', function () { S.screen = 'setup'; render(); });
}
function render() {
  if (S.screen === 'setup') renderSetup();
  else if (S.screen === 'race') renderRace();
  else if (S.screen === 'tieask') renderTieAsk();
  else if (S.screen === 'tiebreak') renderTiebreak();
  else if (S.screen === 'result') renderResult();
}

/* ---------- init ---------- */
function init() {
  // cảnh báo nếu thiếu file dùng chung
  if (!G.SmartEduDefaultStudents || !G.SmartEduSampleQuestions) {
    toast('Thiếu file dùng chung (smartedu-default-*.js).');
  }
  rebuildBank();
  renderSetup();
}

/* hook kiểm thử — gán ngay khi nạp script */
G.__DUAXE = {
  S: S, CFG: CFG,
  startRace: startRace, nextQuestion: nextQuestion,
  buzzTeam: buzzTeam, judge: judge, skipQuestion: skipQuestion,
  endByExhaustion: endByExhaustion, splitBank: splitBank,
  splitTeams: splitTeams, drawQuestion: drawQuestion,
  startTiebreak: startTiebreak, tiebreakAnswer: tiebreakAnswer,
  randomRank: randomRank, rankTeams: rankTeams, tiedGroups: tiedGroups,
  rebuildBank: rebuildBank,
  setRICHQ: function (a) { RICHQ = a; rebuildBank(); },
  render: render
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})(typeof window !== 'undefined' ? window : this);
