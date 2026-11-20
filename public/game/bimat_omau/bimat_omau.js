/* =====================================================================
   SmartEdu — BÍ MẬT Ô MÀU (bimat_omau)
   Dùng chung cho bản chính thức (/game/bimat_omau/) và bản chơi thử
   (/gametest/bimat_omau/, đặt window.__TRIAL__ = true).
   Luật chơi:
   - GV nhập HS (Excel/paste) + câu hỏi (Word/paste), cấu hình: số đội,
     số bom, số ô quà. Chia đội ngẫu nhiên đều.
   - Bảng 25 ô đánh số 1-25. Các đội LẦN LƯỢT chọn ô.
   - Mở ô:
       + 💣 Bom → đội vừa chọn bị TRỪ 30% số điểm hiện tại.
       + ❓ Câu hỏi (10/20/30đ) hoặc 🎁 Quà (50đ) → hiện câu hỏi, các đội
         ĐUA nhau trả lời; GV bấm chọn đội nhanh nhất → đúng: +điểm,
         sai: −đúng bằng điểm câu đó. GV có thể cho đội khác trả lời tiếp
         hoặc đóng câu hỏi.
   - Bảng điểm các đội luôn hiện trên màn hình.
   - Tổng kết: nút "Câu hỏi phụ" để phân hạng khi bằng điểm (không tính
     điểm, đúng → xếp trên, sai → xếp dưới, có thể nhiều vòng), hoặc nút
     "Xếp ngẫu nhiên" cho nhanh.
   ===================================================================== */
'use strict';
var CFG = {
  trial: !!(window.__TRIAL__),
  storeSuffix: window.__TRIAL__ ? '_trial' : ''
};
var TRIAL_MSG = 'Đây là bản chơi thử nên chức năng này chưa khả dụng. Bạn cần đăng ký VIP.';
var DEFAULT_STUDENTS = window.SmartEduDefaultStudents || [];
var SAMPLE_QUESTIONS = window.SmartEduSampleQuestions || [];
var N_CELLS = 25;

/* ============ TIỆN ÍCH ============ */
function $(s) { return document.querySelector(s); }
function toast(msg) {
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, 2800);
}
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
/* Sửa 2026-10-30 (thầy: thêm nút toàn màn hình): bật/tắt fullscreen cho game */
function toggleFull() {
  try {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else { document.documentElement.requestFullscreen(); }
  } catch (e) { toast('Trình duyệt không hỗ trợ toàn màn hình.'); }
}

/* ============ ÂM THANH (WebAudio mặc định, KHÔNG cần file)
   >>> THẦY MUỐN THAY NHẠC RIÊNG: sửa các hàm trong Snd, ví dụ:
   >>> correct: function () { new Audio('nhac-dung.mp3').play(); } */
var Snd = {
  ctx: null,
  ensure: function () { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return this.ctx; },
  tone: function (f, ms, type, vol, delay) { var c = this.ensure(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(vol || .16, t0);
    g.gain.exponentialRampToValueAtTime(.001, t0 + ms / 1000);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + ms / 1000); },
  click: function () { this.tone(520, 60, 'triangle', .08); },
  team: function () { var s = this; [392, 523, 659].forEach(function (f, i) { s.tone(f, 150, 'triangle', .14, i * .12); }); },
  open: function () { this.tone(700, 90, 'triangle', .14); this.tone(1050, 120, 'triangle', .12, .08); },
  correct: function () { var s = this; [523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 140, 'triangle', .15, i * .09); }); },
  wrong: function () { this.tone(220, 220, 'sawtooth', .12); this.tone(165, 300, 'sawtooth', .12, .18); },
  bomb: function () { this.tone(90, 500, 'sawtooth', .25); this.tone(60, 700, 'triangle', .2, .1); },
  gift: function () { var s = this; [659, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, 130, 'sine', .15, i * .09); }); },
  fanfare: function () { var s = this; [523, 523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 200, 'triangle', .16, i * .14); }); }
};

/* ============ NGÂN HÀNG RICH (ảnh + LaTeX, session-only) ============
   Câu hỏi nhập từ Word (giữ ảnh) nằm ở RICHQ, KHÔNG lưu localStorage. */
var RICHQ = [];
function showQuestion(el, q) {
  if (window.QuizCommon) QuizCommon.setQuestion(el, q);
  else el.textContent = q.q;
}
function showOption(el, q, j) {
  if (window.QuizCommon) QuizCommon.setOption(el, q, j);
  else el.textContent = 'ABCD'[j] + '. ' + q.opts[j];
}
function refreshWordBankInfo() {
  var el = $('#wordBankInfo'); if (!el) return;
  if (RICHQ.length) {
    var imgs = window.QuizCommon ? QuizCommon.countImages(RICHQ) : 0;
    el.textContent = 'Đã nhập ' + RICHQ.length + ' câu hỏi từ Word' + (imgs ? ' (kèm ' + imgs + ' ảnh)' : '') + '. Nhập lại sẽ thay thế.';
  } else el.textContent = '';
}
/* Ngân hàng hiệu dụng = câu hỏi Word (kèm ảnh, session) + câu hỏi gõ tay */
function effectiveBank() {
  var el = $('#setQuestions');
  var qs = parseQuestions(el ? el.value : '');
  return RICHQ.concat(qs);
}
/* ============ KHO DỮ LIỆU ============ */
var LS_KEY = 'smartedu_bomau' + CFG.storeSuffix;
var S = { students: [], questions: [] };
function save() {
  try {
    // chỉ lưu text (bỏ ảnh/base64 của ngân hàng rich để khỏi đầy localStorage)
    var lite = S.questions.map(function (q) { return { q: q.q, opts: q.opts, answer: q.answer }; });
    localStorage.setItem(LS_KEY, JSON.stringify({ students: S.students, questions: lite }));
  } catch (e) {}
}
function load() {
  try { var raw = localStorage.getItem(LS_KEY); if (raw) { S = JSON.parse(raw); return; } } catch (e) {}
  S = { students: DEFAULT_STUDENTS.map(function (n, i) { return { id: 's' + i, name: n }; }),
        questions: SAMPLE_QUESTIONS.slice() };
  save();
}
function parseQuestions(text) {
  var qs = [];
  String(text).split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean).forEach(function (b) {
    var lines = b.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length < 6) return;
    var opts = lines.slice(1, 5).map(function (l) { return l.replace(/^[A-Da-d][\.\)]\s*/, ''); });
    var am = b.match(/Đáp án:\s*([A-Da-d])/) || b.match(/Dap an:\s*([A-Da-d])/);
    if (!am) return;
    qs.push({ q: lines[0], opts: opts, answer: 'ABCD'.indexOf(am[1].toUpperCase()) });
  });
  return qs;
}
function questionsToText(qs) {
  return qs.map(function (x) {
    return x.q + '\n' + x.opts.map(function (o, j) { return 'ABCD'[j] + '. ' + o; }).join('\n') +
      '\nĐáp án: ' + 'ABCD'[x.answer];
  }).join('\n\n');
}
/* ============ NHẬP TỪ FILE ============ */
function parseStudentRows(rows) {
  var HEADER = ['stt', 'họ tên', 'ho ten', 'họ và tên', 'ho va ten', 'tên', 'ten',
    'họ tên học sinh', 'ho ten hoc sinh', 'danh sách', 'danh sach'];
  var names = [];
  rows.forEach(function (r, i) {
    if (!r || !r.length) return;
    var a = String(r[0] == null ? '' : r[0]).trim();
    var b = r.length > 1 ? String(r[1] == null ? '' : r[1]).trim() : '';
    if (!a && !b) return;
    if (i === 0 && HEADER.indexOf(a.toLowerCase()) >= 0) return;
    if (/^\d+$/.test(a)) { if (!b) return; a = b; }
    var v = a;
    if (v) names.push(v.split('\t')[0].trim());
  });
  return names.filter(Boolean);
}
function parseWordQuestions(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  var ps = div.getElementsByTagName('p');
  var qs = [], cur = null;
  function pushCur() { if (cur && cur.q && cur.opts.length === 4 && cur.answer >= 0) qs.push(cur); cur = null; }
  for (var i = 0; i < ps.length; i++) {
    var t = ps[i].textContent.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    var mQ = t.match(/^(Câu\s*\d+|Bài\s*\d+)\s*[\.:\)]?\s*(.*)$/i);
    var mO = t.match(/^([A-Da-d])\s*[\.\)]\s*(.+)$/);
    var mA = t.match(/Đáp án\s*:\s*([A-Da-d])/i);
    if (mQ) { pushCur(); cur = { q: mQ[2] || '', opts: [], answer: -1 }; }
    else if (mO && cur) { if (cur.opts.length < 4) cur.opts.push(mO[2]); }
    else if (mA && cur) { cur.answer = 'ABCD'.indexOf(mA[1].toUpperCase()); }
    else if (cur && !cur.q) { cur.q = t; }
  }
  pushCur();
  return qs;
}
function importStudentsFromExcel(file) {
  if (!window.XLSX) { toast('Chưa tải được thư viện Excel. Thầy copy danh sách paste vào giúp mình.'); return; }
  var rd = new FileReader();
  rd.onload = function (e) {
    try {
      var wb = XLSX.read(e.target.result, { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      var names = parseStudentRows(rows);
      if (!names.length) { toast('Không đọc được tên nào từ file Excel.'); return; }
      $('#setStudents').value = names.join('\n');
      toast('Đã nhập ' + names.length + ' học sinh từ Excel.');
    } catch (err) { toast('Lỗi đọc file Excel.'); }
  };
  rd.readAsArrayBuffer(file);
}
function importQuestionsFromWord(file) {
  if (!window.QuizCommon) { toast('Chưa tải được module dùng chung. Thầy copy câu hỏi paste vào giúp mình.'); return; }
  QuizCommon.importQuestionsFromWord(file, {
    onOk: function (qs) {
      qs.forEach(function (q) { q._rich = true; });
      RICHQ = qs;
      refreshWordBankInfo();
      var imgs = QuizCommon.countImages(qs);
      toast('Đã nhập ' + qs.length + ' câu hỏi từ Word' + (imgs ? ' (kèm ' + imgs + ' ảnh)' : '') + '. Công thức gõ dạng $...$ sẽ tự hiện đẹp.');
    },
    onEmpty: function () { toast('Không đọc được câu hỏi nào. Định dạng: "Câu 1. ..." / A. B. C. D. / "Đáp án: B".'); },
    onNoLib: function () { toast('Chưa tải được thư viện Word. Thầy copy câu hỏi paste vào giúp mình.'); },
    onError: function () { toast('Lỗi đọc file Word.'); }
  });
}

/* ============ LOGIC THUẦN ============ */
function splitTeams(ids, k) {
  var order = shuffle(ids.slice());
  var n = order.length, base = Math.floor(n / k), rem = n % k;
  var bonus = {};
  shuffle(Array.apply(null, { length: k }).map(function (_, i) { return i; })).slice(0, rem).forEach(function (i) { bonus[i] = 1; });
  var teams = [], p = 0;
  for (var i = 0; i < k; i++) {
    var size = base + (bonus[i] ? 1 : 0);
    teams.push(order.slice(p, p + size)); p += size;
  }
  return teams;
}
/* Chia 25 ô: bombs bom, gifts ô quà 50đ, còn lại câu hỏi 10/20/30đ ngẫu nhiên */
function dealCells(n, bombs, gifts) {
  var cells = [], i;
  for (i = 0; i < bombs; i++) cells.push({ type: 'bomb' });
  for (i = 0; i < gifts; i++) cells.push({ type: 'gift', value: 50 });
  var vals = [10, 20, 30];
  for (i = 0; i < n - bombs - gifts; i++) cells.push({ type: 'q', value: vals[Math.floor(Math.random() * 3)] });
  return shuffle(cells);
}
/* Bom: trừ 30% điểm hiện tại (làm tròn xuống) */
function bombPenalty(score) { return Math.floor(score * 0.7); }
/* Xếp hạng cơ bản theo điểm */
function rankByScore(teams) {
  return teams.map(function (_, i) { return i; }).sort(function (a, b) { return teams[b].score - teams[a].score; });
}
function tiedGroups(rankOrder, teams) {
  var groups = [], cur = [rankOrder[0]];
  for (var i = 1; i < rankOrder.length; i++) {
    if (teams[rankOrder[i]].score === teams[cur[0]].score) cur.push(rankOrder[i]);
    else { if (cur.length > 1) groups.push(cur); cur = [rankOrder[i]]; }
  }
  if (cur.length > 1) groups.push(cur);
  return groups;
}

/* ============ TRẠNG THÁI TRẬN ĐẤU ============ */
var M = null; // {cfg, teams:[{name,members,score}], pickPos, cells:[{type,value,open}], qOrder, qPtr, rankOrder}
var cur = { cell: -1, q: null, value: 0, answerTeam: -1, qOpen: false, autoCloseT: null };
function show(id) {
  ['scrStart', 'scrSetup', 'scrGame', 'scrResult'].forEach(function (s) {
    $('#' + s).classList.toggle('hidden', s !== id);
  });
}
function studentName(id) { var st = S.students.filter(function (x) { return x.id === id; })[0]; return st ? st.name : '?'; }
function buildMatch(cfg) {
  if (cfg.bombs + cfg.gifts >= N_CELLS) { toast('Số bom + số ô quà phải nhỏ hơn 25!'); return false; }
  var groups = splitTeams(S.students.map(function (s) { return s.id; }), cfg.teams);
  var cells = dealCells(N_CELLS, cfg.bombs, cfg.gifts);
  M = { cfg: cfg, pickPos: 0, teams: [], cells: cells,
        qOrder: shuffle(S.questions.map(function (_, i) { return i; })), qPtr: 0,
        rankOrder: [] };
  for (var i = 0; i < cfg.teams; i++) {
    M.teams.push({ name: 'Đội ' + (i + 1), members: groups[i], score: 0, correct: 0, wrong: 0 });
  }
  M.rankOrder = rankByScore(M.teams);
  return true;
}
function nextQuestion() {
  if (!S.questions.length) return null;
  if (M.qPtr >= M.qOrder.length) { M.qOrder = shuffle(M.qOrder); M.qPtr = 0; }
  return S.questions[M.qOrder[M.qPtr++]];
}
function allCellsOpen() { return M.cells.every(function (c) { return c.open; }); }
/* ============ BẢNG HƯỚNG DẪN ============ */
var helpOv = null;
function ensureHelpOverlay() {
  if (helpOv) return;
  var ov = document.createElement('div');
  ov.id = 'helpOverlay'; ov.className = 'overlay hidden';
  var panel = document.createElement('div'); panel.className = 'panel';
  panel.innerHTML =
    '<h3>📖 Hướng dẫn chơi</h3>' +
    '<div class="help-body">' +
    '<b>1. Chuẩn bị:</b> thầy/cô nhập danh sách học sinh (Excel/paste), ngân hàng câu hỏi (Word/paste), ' +
    'cấu hình số đội – số bom – số ô quà, rồi bấm <b>"Chia đội &amp; Bắt đầu"</b>.<br>' +
    '&nbsp;&nbsp;• <b>Công thức toán:</b> gõ dạng <b>$...$</b> (vd $x^2+1$) sẽ tự hiện đẹp.<br>' +
    '&nbsp;&nbsp;• <b>Nhập từ Word:</b> giữ nguyên <b>ảnh minh họa</b> trong câu hỏi.<br>' +
    '<b>2. Bảng ô:</b> 25 ô đánh số <b>1–25</b>, mỗi ô giấu bí mật: <b>câu hỏi 10/20/30đ</b>, ' +
    '<b>🎁 quà 50đ</b>, hoặc <b>💣 bom</b>. Các đội <b>lần lượt</b> chọn ô.<br>' +
    '<b>3. Mở ô câu hỏi:</b> hiện câu hỏi + số điểm. Các đội <b>đua nhau trả lời</b> — ' +
    'thầy/cô bấm chọn <b>đội nhanh nhất</b>, rồi bấm đáp án đội đó chọn.<br>' +
    '&nbsp;&nbsp;• Trả lời <b>đúng: +điểm</b> câu đó cho đội.<br>' +
    '&nbsp;&nbsp;• Trả lời <b>sai: −đúng bằng điểm</b> câu đó.<br>' +
    '&nbsp;&nbsp;• Thầy/cô có thể cho đội khác trả lời tiếp hoặc bấm <b>"Đóng câu hỏi"</b>.<br>' +
    '<b>4. Mở phải 💣 bom:</b> đội vừa chọn ô bị <b>trừ 30%</b> số điểm hiện tại.<br>' +
    '<b>5. Bảng điểm</b> các đội luôn hiện trên cùng màn hình cho gay cấn.<br>' +
    '<b>6. Tổng kết:</b> hết 25 ô (hoặc bấm Tổng kết) → xếp hạng theo điểm.<br>' +
    '&nbsp;&nbsp;• Nếu <b>bằng điểm</b>: dùng nút <b>"Câu hỏi phụ"</b> — chọn các đội, mỗi vòng 1 đội trả lời; ' +
    '<b>đúng → xếp trên, sai → xếp dưới</b> (không tính điểm, có thể nhiều vòng).<br>' +
    '&nbsp;&nbsp;• Hoặc bấm <b>"Xếp ngẫu nhiên"</b> cho nhanh.' +
    '</div>';
  var row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '14px';
  var btn = document.createElement('button'); btn.className = 'btn blue'; btn.textContent = 'Đã hiểu!';
  btn.onclick = function () { helpOv.classList.add('hidden'); };
  row.appendChild(btn); panel.appendChild(row); ov.appendChild(panel);
  document.body.appendChild(ov);
  helpOv = ov;
}
function openHelp() { ensureHelpOverlay(); helpOv.classList.remove('hidden'); }

/* ============ MÀN HÌNH CHƠI ============ */
function renderGame() {
  renderScoreBar();
  renderGrid();
  var t = M.teams[M.pickPos];
  $('#turnHint').innerHTML = allCellsOpen() ? 'Đã mở hết 25 ô! Bấm <b>"Tổng kết & Xếp hạng"</b>.'
    : 'Lượt chọn ô: <b>' + escapeHtml(t.name) + '</b> — bấm 1 ô trong bảng.';
}
function renderScoreBar() {
  var bar = $('#scoreBar'); bar.innerHTML = '';
  M.teams.forEach(function (t, i) {
    var d = document.createElement('div');
    d.className = 'score-chip' + (i === M.pickPos && !allCellsOpen() ? ' turn' : '');
    d.innerHTML = '<div class="sn">' + escapeHtml(t.name) + '</div><div class="sp">' + t.score + 'đ</div>';
    bar.appendChild(d);
  });
}
function renderGrid() {
  var g = $('#cellGrid'); g.innerHTML = '';
  M.cells.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'cell' + (c.open ? ' open ' + c.type : '');
    if (c.open) {
      b.innerHTML = c.type === 'bomb' ? '💣' : (c.type === 'gift' ? '🎁<div style="font-size:12px">50</div>' : '<div style="font-size:15px">' + c.value + 'đ</div>');
    } else {
      b.innerHTML = '<span class="cnum">' + (i + 1) + '</span>';
      (function (idx) { b.onclick = function () { pickCell(idx); }; })(i);
    }
    g.appendChild(b);
  });
}
function pickCell(i) {
  var c = M.cells[i];
  if (c.open) return;
  c.open = true;
  var t = M.teams[M.pickPos];
  if (c.type === 'bomb') {
    Snd.bomb();
    var lost = t.score - bombPenalty(t.score);
    t.score = bombPenalty(t.score);
    showBanner('💣 BOM! ' + t.name + ' bị trừ 30% (' + lost + 'đ)', 'bad');
    renderGame();
    setTimeout(function () {
      hideBanner();
      M.pickPos = (M.pickPos + 1) % M.teams.length;
      renderGame();
      if (allCellsOpen()) toast('Đã mở hết 25 ô! Bấm "Tổng kết & Xếp hạng".');
    }, 1800);
  } else {
    if (c.type === 'gift') Snd.gift(); else Snd.open();
    openQuestion(i, c);
  }
  renderGrid();
}

/* ============ CÂU HỎI (GV điều khiển, các đội đua trả lời) ============ */
function openQuestion(i, c) {
  cur.cell = i; cur.value = c.value; cur.q = nextQuestion(); cur.answerTeam = -1; cur.qOpen = true;
  if (!cur.q) { toast('Ngân hàng chưa có câu hỏi!'); closeQuestion(); return; }
  var title = c.type === 'gift' ? '🎁 Ô QUÀ — Câu hỏi 50 điểm' : '❓ Câu hỏi ' + c.value + ' điểm';
  $('#qTitle').textContent = title;
  $('#qBadge').textContent = c.value + ' điểm';
  $('#qText').textContent = ''; showQuestion($('#qText'), cur.q);
  var box = $('#qOpts'); box.innerHTML = '';
  cur.q.opts.forEach(function (o, j) {
    var b = document.createElement('button'); b.className = 'opt-btn';
    showOption(b, cur.q, j);
    b.onclick = function () { answerOption(j, b); };
    box.appendChild(b);
  });
  var tl = $('#teamPickList'); tl.innerHTML = '';
  M.teams.forEach(function (t, ti) {
    var b = document.createElement('button'); b.className = 'team-btn'; b.textContent = t.name;
    b.onclick = function () { Snd.team(); cancelAutoClose(); cur.answerTeam = ti; paintTeamPick(); };
    tl.appendChild(b);
  });
  paintTeamPick();
  $('#qOverlay').classList.remove('hidden');
}
function paintTeamPick() {
  var btns = $('#teamPickList').children;
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('sel', i === cur.answerTeam);
  $('#answerTeamName').textContent = cur.answerTeam >= 0 ? M.teams[cur.answerTeam].name : '—';
}
function answerOption(j, btn) {
  if (!cur.qOpen) return;
  if (cur.answerTeam < 0) { toast('Thầy/cô bấm chọn đội trả lời trước đã!'); return; }
  var t = M.teams[cur.answerTeam];
  var btns = $('#qOpts').children;
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  if (j === cur.q.answer) {
    t.score += cur.value; t.correct++;
    if (btn) btn.classList.add('correct');
    Snd.correct();
    showBanner('✅ ' + t.name + ' +' + cur.value + 'đ', 'good');
  } else {
    t.score -= cur.value; t.wrong++;
    if (btn) btn.classList.add('wrong');
    if (btns[cur.q.answer]) btns[cur.q.answer].classList.add('correct');
    Snd.wrong();
    showBanner('❌ ' + t.name + ' −' + cur.value + 'đ', 'bad');
  }
  renderScoreBar();
  setTimeout(hideBanner, 1400);
  // Mở lại đáp án cho đội khác trả lời tiếp (nếu GV muốn)
  setTimeout(function () {
    if (!cur.qOpen) return;
    for (var i = 0; i < btns.length; i++) { btns[i].disabled = false; btns[i].classList.remove('correct', 'wrong'); }
    cur.answerTeam = -1; paintTeamPick();
  }, 1500);
  // 2 giây sau tự quay về bảng chọn ô (GV bấm đội khác để trả lời tiếp thì hủy hẹn giờ; nút Đóng vẫn dùng được)
  cancelAutoClose();
  cur.autoCloseT = setTimeout(function () { if (cur.qOpen) closeQuestion(); }, 2000);
}
function closeQuestion() {
  cancelAutoClose();
  cur.qOpen = false;
  $('#qOverlay').classList.add('hidden');
  M.pickPos = (M.pickPos + 1) % M.teams.length;
  renderGame();
  if (allCellsOpen()) toast('Đã mở hết 25 ô! Bấm "Tổng kết & Xếp hạng".');
}
function cancelAutoClose() { if (cur.autoCloseT) { clearTimeout(cur.autoCloseT); cur.autoCloseT = null; } }
function showBanner(txt, cls) { var b = $('#banner'); b.textContent = txt; b.className = 'show ' + cls; }
function hideBanner() { $('#banner').className = ''; }
/* ============ TỔNG KẾT & XẾP HẠNG ============ */
function showResults() {
  if (!M) { toast('Chưa có trận đấu nào.'); return; }
  Snd.fanfare();
  M.rankOrder = rankByScore(M.teams);
  renderResults();
  show('scrResult');
}
function renderResults() {
  var medals = ['🥇', '🥈', '🥉'];
  var groups = tiedGroups(M.rankOrder, M.teams);
  var tiedSet = {};
  groups.forEach(function (g) { g.forEach(function (ti) { tiedSet[ti] = 1; }); });
  $('#rankBoard').innerHTML = M.rankOrder.map(function (ti, pos) {
    var t = M.teams[ti];
    return '<div class="rank-row"><div class="medal">' + (medals[pos] || (pos + 1)) + '</div>' +
      '<div><div class="tname">' + escapeHtml(t.name) +
      (tiedSet[ti] ? '<span class="tie-tag">bằng điểm</span>' : '') + '</div>' +
      '<div class="hint">' + t.members.map(studentName).join(', ') + '</div></div>' +
      '<div class="tstat">Đúng: ' + t.correct + ' · Sai: ' + t.wrong + '</div>' +
      '<div class="tpts">' + t.score + 'đ</div></div>';
  }).join('');
  $('#btnTiebreak').disabled = groups.length === 0;
  $('#btnTiebreak').textContent = groups.length ? '⚖ Câu hỏi phụ (' + groups.length + ' nhóm bằng điểm)' : '⚖ Câu hỏi phụ';
}
/* ---- Câu hỏi phụ phân hạng ----
   Mỗi vòng: GV chọn 1 đội trong nhóm trả lời 1 câu (không tính điểm).
   Đúng → xếp TRÊN các đội còn lại; Sai → xếp DƯỚI. Lặp đến khi xong. */
var TB = null; // {group:[ti], unresolved:[ti], top:[ti], bottom:[ti], q, answerTeam}
function openTiebreak() {
  var groups = tiedGroups(M.rankOrder, M.teams);
  if (!groups.length) { toast('Không có đội nào bằng điểm.'); return; }
  TB = { groups: groups, group: null, unresolved: [], top: [], bottom: [], q: null, answerTeam: -1 };
  var list = $('#tbGroups'); list.innerHTML = '';
  groups.forEach(function (g, gi) {
    var d = document.createElement('div'); d.className = 'chk-row';
    d.innerHTML = '<input type="checkbox" ' + (gi === 0 ? 'checked' : '') + '> ' +
      g.map(function (ti) { return escapeHtml(M.teams[ti].name) + ' (' + M.teams[ti].score + 'đ)'; }).join(' · ');
    list.appendChild(d);
  });
  $('#tbPanel').classList.add('hidden');
  $('#tbOverlay').classList.remove('hidden');
}
function startTiebreak() {
  var boxes = $('#tbGroups').querySelectorAll('input');
  var groups = TB.groups;
  var chosen = [];
  groups.forEach(function (g, gi) { if (boxes[gi] && boxes[gi].checked) chosen = chosen.concat(g); });
  if (chosen.length < 2) { toast('Chọn ít nhất 2 đội để phân hạng.'); return; }
  TB.group = chosen; TB.unresolved = chosen.slice(); TB.top = []; TB.bottom = [];
  Snd.team();
  renderTiebreak();
  $('#tbPanel').classList.remove('hidden');
}
function renderTiebreak() {
  var nm = function (ti) { return M.teams[ti].name; };
  $('#tbStatus').innerHTML =
    'Trên: <b>' + (TB.top.map(nm).join(', ') || '—') + '</b><br>' +
    'Chưa phân: <b>' + (TB.unresolved.map(nm).join(', ') || '—') + '</b><br>' +
    'Dưới: <b>' + (TB.bottom.map(nm).join(', ') || '—') + '</b>';
  $('#tbQBox').classList.add('hidden');
  TB.q = null; TB.answerTeam = -1;
}
function tiebreakNextQ() {
  TB.q = nextQuestion();
  if (!TB.q) { toast('Hết câu hỏi!'); return; }
  TB.answerTeam = -1;
  $('#tbQText').textContent = ''; showQuestion($('#tbQText'), TB.q);
  var box = $('#tbQOpts'); box.innerHTML = '';
  TB.q.opts.forEach(function (o, j) {
    var b = document.createElement('button'); b.className = 'opt-btn';
    showOption(b, TB.q, j);
    b.onclick = function () { tiebreakAnswer(j, b); };
    box.appendChild(b);
  });
  var tl = $('#tbTeamList'); tl.innerHTML = '';
  TB.unresolved.forEach(function (ti) {
    var b = document.createElement('button'); b.className = 'team-btn'; b.textContent = M.teams[ti].name;
    (function (idx) { b.onclick = function () { Snd.team(); TB.answerTeam = idx; paintTbTeams(); }; })(ti);
    tl.appendChild(b);
  });
  paintTbTeams();
  $('#tbQBox').classList.remove('hidden');
}
function paintTbTeams() {
  var btns = $('#tbTeamList').children;
  var idx = TB.unresolved.indexOf(TB.answerTeam);
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('sel', i === idx);
}
function tiebreakAnswer(j, btn) {
  if (TB.answerTeam < 0) { toast('Chọn đội trả lời trước đã!'); return; }
  var ti = TB.answerTeam;
  var ok = (j === TB.q.answer);
  var btns = $('#tbQOpts').children;
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  if (btn) btn.classList.add(ok ? 'correct' : 'wrong');
  if (ok) { TB.top.push(ti); Snd.correct(); toast(M.teams[ti].name + ' trả lời ĐÚNG → xếp trên.'); }
  else { TB.bottom.push(ti); Snd.wrong(); toast(M.teams[ti].name + ' trả lời SAI → xếp dưới.'); }
  TB.unresolved.splice(TB.unresolved.indexOf(ti), 1);
  setTimeout(function () { afterTiebreakRound(); }, 1200);
}
function afterTiebreakRound() {
  if (TB.unresolved.length <= 1) { finishTiebreak(); return; }
  renderTiebreak();
  toast('Còn ' + TB.unresolved.length + ' đội chưa phân — bấm "Câu hỏi tiếp theo".');
}
function tiebreakRandom() {
  var rest = shuffle(TB.unresolved);
  var final = TB.top.concat(rest, TB.bottom.slice().reverse());
  applyTiebreak(final);
}
function finishTiebreak() {
  var final = TB.top.concat(TB.unresolved, TB.bottom.slice().reverse());
  applyTiebreak(final);
}
function applyTiebreak(finalGroup) {
  // Thay đoạn nhóm bằng điểm trong rankOrder bằng thứ tự mới
  var set = {};
  TB.group.forEach(function (ti) { set[ti] = 1; });
  var head = [], tail = [], started = false;
  M.rankOrder.forEach(function (ti) {
    if (set[ti]) { if (!started) { started = true; head = head.concat(finalGroup); } }
    else if (!started) head.push(ti);
    else tail.push(ti);
  });
  M.rankOrder = head.concat(tail);
  $('#tbOverlay').classList.add('hidden');
  renderResults();
  toast('Đã phân hạng xong.');
}

/* ============ KHỞI ĐỘNG ============ */
function readCfg() {
  return {
    teams: Math.max(2, Math.min(8, parseInt($('#cfgTeams').value, 10) || 4)),
    bombs: Math.max(0, Math.min(8, parseInt($('#cfgBombs').value, 10) || 3)),
    gifts: Math.max(0, Math.min(5, parseInt($('#cfgGifts').value, 10) || 2))
  };
}
function prefillSetup() {
  $('#setStudents').value = S.students.map(function (s) { return s.name; }).join('\n');
  $('#setQuestions').value = questionsToText(S.questions.filter(function (q) { return !q._rich; }));
  refreshWordBankInfo();
}
function startTrialMatch() {
  var cfg = { teams: 2, bombs: 3, gifts: 2 };
  Snd.team(); buildMatch(cfg); renderGame(); show('scrGame');
  toast('Bản chơi thử: 2 đội, 25 ô (3 bom, 2 quà).');
}
function init() {
  if (!window.SmartEduDefaultStudents || !window.SmartEduSampleQuestions) {
    try { toast('Thiếu file dùng chung (smartedu-default-*.js). Thầy copy 2 file vào thư mục cha (game/) giúp mình.'); } catch (e) {}
  }
  resize0(); load();
  if (CFG.trial) $('#trialBadge').classList.remove('hidden');
  refreshRosterInfo();
  var bind = function (id, fn) { var el = $(id); if (el) el.onclick = fn; };
  var bindChange = function (id, fn) { var el = $(id); if (el) el.onchange = fn; };
  bind('#btnPlay', function () { Snd.click(); if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); });
  bind('#btnHelp', function () { Snd.click(); openHelp(); });
  bind('#btnFull', function () { Snd.click(); toggleFull(); });
  bind('#btnBackHome', function () { show('scrStart'); });
  bind('#btnImportExcel', function () { var f = $('#fileExcel'); if (f) f.click(); });
  bindChange('#fileExcel', function (e) { if (e.target.files[0]) importStudentsFromExcel(e.target.files[0]); e.target.value = ''; });
  bind('#btnImportWord', function () { var f = $('#fileWord'); if (f) f.click(); });
  bindChange('#fileWord', function (e) { if (e.target.files[0]) importQuestionsFromWord(e.target.files[0]); e.target.value = ''; });
  bind('#btnMakeMatch', function () {
    var el = $('#setStudents');
    var names = el ? el.value.split('\n').map(function (s) { return s.split('\t')[0].trim(); }).filter(Boolean) : [];
    if (names.length >= 2) S.students = names.map(function (n, i) { return { id: 's' + i, name: n }; });
    var qel = $('#setQuestions');
    var qs = qel ? parseQuestions(qel.value) : [];
    S.questions = effectiveBank(); // ngân hàng Word (kèm ảnh) + câu hỏi gõ tay
    save(); refreshRosterInfo();
    var cfg = readCfg();
    if (S.students.length < cfg.teams) { toast('Số học sinh ít hơn số đội!'); return; }
    if (!S.questions.length) { toast('Ngân hàng chưa có câu hỏi!'); return; }
    if (!buildMatch(cfg)) return;
    Snd.team(); renderGame(); show('scrGame');
  });
  bind('#btnCloseQ', function () { Snd.click(); closeQuestion(); });
  bind('#btnResults', function () { Snd.click(); showResults(); });
  bind('#btnAgain', function () { if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); });
  bind('#btnHome2', function () { show('scrStart'); });
  bind('#btnTiebreak', function () { Snd.click(); openTiebreak(); });
  bind('#btnTbStart', function () { startTiebreak(); });
  bind('#btnTbNextQ', function () { Snd.click(); tiebreakNextQ(); });
  bind('#btnTbRandom', function () { Snd.click(); tiebreakRandom(); });
  bind('#btnTbClose', function () { var o = $('#tbOverlay'); if (o) o.classList.add('hidden'); });
}
function resize0() {}
function refreshRosterInfo() {
  $('#rosterInfo').textContent = S.students.length + ' học sinh, ' + S.questions.length + ' câu hỏi' +
    (CFG.trial ? ' (bản chơi thử)' : '');
}
/* Hook kiểm thử */
window.__BCT = { CFG: CFG, getS: function () { return S; }, buildMatch: buildMatch, splitTeams: splitTeams,
  dealCells: dealCells, bombPenalty: bombPenalty, rankByScore: rankByScore, tiedGroups: tiedGroups,
  nextQuestion: nextQuestion, pickCell: pickCell, openQuestion: openQuestion, answerOption: answerOption,
  closeQuestion: closeQuestion, showResults: showResults, openTiebreak: openTiebreak,
  startTiebreak: startTiebreak, tiebreakNextQ: tiebreakNextQ, tiebreakAnswer: tiebreakAnswer,
  tiebreakRandom: tiebreakRandom, finishTiebreak: finishTiebreak, applyTiebreak: applyTiebreak,
  openHelp: openHelp, getM: function () { return M; }, getTB: function () { return TB; },
  getCur: function () { return cur; }, showQuestion: showQuestion, showOption: showOption,
  effectiveBank: effectiveBank,
  getRICHQ: function () { return RICHQ; }, setRICHQ: function (q) { RICHQ = q; } };
document.addEventListener('DOMContentLoaded', init);
