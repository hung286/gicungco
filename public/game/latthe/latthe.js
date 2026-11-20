/* =====================================================================
   SmartEdu — LẬT THẺ TRÍ NHỚ (latthe)
   Dùng chung cho bản chính thức (/game/latthe/) và bản chơi thử
   (/gametest/latthe/, đặt window.__TRIAL__ = true).
   Luật chơi:
   - GV nhập HS (Excel/paste), cấu hình: số đội, số cặp thẻ, chủ đề thẻ.
   - Hệ thống có sẵn 50 cặp thẻ (môn học / loài hoa / loại quả / màu sắc),
     mỗi thẻ mở ra hiện ảnh (emoji) + tên cho sinh động.
   - Chia đội ngẫu nhiên đều (như game bắn cung).
   - Mỗi đội cử 1 đại diện lên chơi: lật 2 thẻ, trùng nhau thì ăn cặp,
     không trùng thì úp lại. Chơi đến khi mở hết các cặp.
   - Đồng hồ tính từ lần lật đầu tiên. Xếp hạng THEO THỜI GIAN (nhanh nhất
     thắng). Bằng thời gian → câu hỏi phụ trắc nghiệm A/B/C/D (đúng xếp
     trên, sai xếp dưới, không tính điểm) hoặc xếp ngẫu nhiên.
   ===================================================================== */
'use strict';
var CFG = {
  trial: !!(window.__TRIAL__),
  storeSuffix: window.__TRIAL__ ? '_trial' : ''
};
var TRIAL_MSG = 'Đây là bản chơi thử nên chức năng này chưa khả dụng. Bạn cần đăng ký VIP.';
var DEFAULT_STUDENTS = ['Lưu Bị','Quan Vũ','Trương Phi','Gia Cát Lượng','Tào Tháo',
  'Tôn Quyền','Tư Mã Ý','Lữ Bố','Điêu Thuyền','Triệu Vân','Mã Siêu','Hoàng Trung',
  'Chu Du','Lỗ Túc','Tào Phi'];
/* 20 câu mẫu dùng cho CÂU HỎI PHỤ phân hạng */
var SAMPLE_QUESTIONS = [
  { q: '5 + 7 = ?', opts: ['11','12','13','10'], answer: 1 },
  { q: 'Số nào là số chẵn?', opts: ['3','7','10','9'], answer: 2 },
  { q: '12 − 5 = ?', opts: ['7','6','8','9'], answer: 0 },
  { q: '3 × 4 = ?', opts: ['10','11','12','13'], answer: 2 },
  { q: '9 + 6 = ?', opts: ['14','15','16','13'], answer: 1 },
  { q: 'Số nào lớn nhất?', opts: ['45','54','40','49'], answer: 1 },
  { q: '"Yêu Tổ quốc, yêu đồng bào" là điều thứ mấy Bác Hồ dạy thiếu niên, nhi đồng?', opts: ['Điều 1','Điều 2','Điều 3','Điều 4'], answer: 0 },
  { q: 'Bác Hồ dạy: "Học tập tốt, ..." gì tốt?', opts: ['Lao động tốt','Vui chơi tốt','Ăn ngủ tốt','Ca hát tốt'], answer: 0 },
  { q: 'Bác Hồ dạy: "Đoàn kết tốt, ..." gì tốt?', opts: ['Kỷ luật tốt','Học tập tốt','Lao động tốt','Vệ sinh tốt'], answer: 0 },
  { q: '"Giữ gìn vệ sinh thật tốt" là điều thứ mấy Bác Hồ dạy?', opts: ['Điều 2','Điều 3','Điều 4','Điều 5'], answer: 2 },
  { q: 'Bác Hồ dạy: "Khiêm tốn, thật thà, ..." gì?', opts: ['Dũng cảm','Mạnh mẽ','Chăm chỉ','Hiền lành'], answer: 0 },
  { q: 'Bác Hồ sinh ngày nào?', opts: ['19/5/1890','2/9/1945','19/5/1945','2/9/1890'], answer: 0 },
  { q: 'Quê Bác Hồ ở tỉnh nào?', opts: ['Nghệ An','Hà Tĩnh','Thanh Hóa','Hà Nội'], answer: 0 },
  { q: '"Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước" là câu nói của ai?', opts: ['Bác Hồ','Trần Hưng Đạo','Quang Trung','Lý Thường Kiệt'], answer: 0 },
  { q: 'Đội viên đeo khăn quàng màu gì?', opts: ['Đỏ','Xanh','Vàng','Trắng'], answer: 0 },
  { q: 'Một tuần lễ có mấy ngày?', opts: ['5','6','7','8'], answer: 2 },
  { q: 'Tháng 2 năm thường có bao nhiêu ngày?', opts: ['30','29','28','31'], answer: 2 },
  { q: '1 tá bút chì có mấy chiếc?', opts: ['10','11','12','20'], answer: 2 },
  { q: 'Con gà có mấy chân?', opts: ['4','2','6','8'], answer: 1 },
  { q: '"Non sông Việt Nam có trở nên tươi đẹp hay không..." là lời Bác Hồ gửi cho ai?', opts: ['Học sinh','Bộ đội','Nông dân','Công nhân'], answer: 0 }
];
/* ============ NGÂN HÀNG 50 CẶP THẺ HỆ THỐNG ============ */
var CARD_BANK = [
  { theme: 'monhoc', name: 'Toán', icon: '📐' },
  { theme: 'monhoc', name: 'Ngữ văn', icon: '📖' },
  { theme: 'monhoc', name: 'Tiếng Anh', icon: '🔤' },
  { theme: 'monhoc', name: 'Vật lí', icon: '🧲' },
  { theme: 'monhoc', name: 'Hóa học', icon: '🧪' },
  { theme: 'monhoc', name: 'Sinh học', icon: '🧬' },
  { theme: 'monhoc', name: 'Lịch sử', icon: '🏛️' },
  { theme: 'monhoc', name: 'Địa lí', icon: '🌍' },
  { theme: 'monhoc', name: 'GDCD', icon: '⚖️' },
  { theme: 'monhoc', name: 'Tin học', icon: '💻' },
  { theme: 'monhoc', name: 'Công nghệ', icon: '⚙️' },
  { theme: 'monhoc', name: 'Thể dục', icon: '⚽' },
  { theme: 'monhoc', name: 'Âm nhạc', icon: '🎵' },
  { theme: 'hoa', name: 'Hoa hồng', icon: '🌹' },
  { theme: 'hoa', name: 'Hoa tulip', icon: '🌷' },
  { theme: 'hoa', name: 'Hoa hướng dương', icon: '🌻' },
  { theme: 'hoa', name: 'Hoa cúc', icon: '🌼' },
  { theme: 'hoa', name: 'Hoa lan', icon: '🌺' },
  { theme: 'hoa', name: 'Hoa sen', icon: '🪷' },
  { theme: 'hoa', name: 'Hoa anh đào', icon: '💮' },
  { theme: 'hoa', name: 'Hoa cẩm chướng', icon: '🏵️' },
  { theme: 'hoa', name: 'Hoa mẫu đơn', icon: '🌸' },
  { theme: 'hoa', name: 'Hoa bồ công anh', icon: '🌾' },
  { theme: 'hoa', name: 'Hoa xương rồng', icon: '🌵' },
  { theme: 'hoa', name: 'Hoa loa kèn', icon: '📯' },
  { theme: 'qua', name: 'Táo', icon: '🍎' },
  { theme: 'qua', name: 'Táo xanh', icon: '🍏' },
  { theme: 'qua', name: 'Cam', icon: '🍊' },
  { theme: 'qua', name: 'Chanh', icon: '🍋' },
  { theme: 'qua', name: 'Chuối', icon: '🍌' },
  { theme: 'qua', name: 'Dưa hấu', icon: '🍉' },
  { theme: 'qua', name: 'Nho', icon: '🍇' },
  { theme: 'qua', name: 'Dâu tây', icon: '🍓' },
  { theme: 'qua', name: 'Đào', icon: '🍑' },
  { theme: 'qua', name: 'Cherry', icon: '🍒' },
  { theme: 'qua', name: 'Dứa', icon: '🍍' },
  { theme: 'qua', name: 'Xoài', icon: '🥭' },
  { theme: 'qua', name: 'Dừa', icon: '🥥' },
  { theme: 'qua', name: 'Kiwi', icon: '🥝' },
  { theme: 'qua', name: 'Lê', icon: '🍐' },
  { theme: 'mau', name: 'Màu đỏ', icon: '🟥' },
  { theme: 'mau', name: 'Màu cam', icon: '🟧' },
  { theme: 'mau', name: 'Màu vàng', icon: '🟨' },
  { theme: 'mau', name: 'Màu xanh lá', icon: '🟩' },
  { theme: 'mau', name: 'Màu xanh dương', icon: '🟦' },
  { theme: 'mau', name: 'Màu tím', icon: '🟪' },
  { theme: 'mau', name: 'Màu hồng', icon: '🩷' },
  { theme: 'mau', name: 'Màu nâu', icon: '🟫' },
  { theme: 'mau', name: 'Màu đen', icon: '⬛' },
  { theme: 'mau', name: 'Màu trắng', icon: '⬜' }
];
var THEME_NAMES = { all: 'Trộn tất cả', monhoc: 'Môn học', hoa: 'Loài hoa', qua: 'Loại quả', mau: 'Màu sắc' };

/* ============ TIỆN ÍCH ============ */
function $(s) { return document.querySelector(s); }
function toast(msg) {
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  var box = $('#toasts'); if (box) box.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, 2800);
}
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmtTime(ms) {
  var s = ms / 1000;
  var m = Math.floor(s / 60);
  var sec = (s % 60).toFixed(1);
  return (m > 0 ? m + 'p ' : '') + sec + 's';
}

/* ============ ÂM THANH (WebAudio mặc định, KHÔNG cần file)
   >>> THẦY MUỐN THAY NHẠC RIÊNG: sửa các hàm trong Snd, ví dụ:
   >>> match: function () { new Audio('nhac-dung.mp3').play(); } */
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
  flip: function () { this.tone(660, 70, 'triangle', .12); },
  match: function () { var s = this; [523, 659, 784].forEach(function (f, i) { s.tone(f, 130, 'triangle', .15, i * .08); }); },
  nomatch: function () { this.tone(300, 150, 'sine', .1); this.tone(240, 180, 'sine', .1, .12); },
  fanfare: function () { var s = this; [523, 523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 200, 'triangle', .16, i * .14); }); }
};

/* ============ KHO DỮ LIỆU ============ */
var LS_KEY = 'smartedu_latthe' + CFG.storeSuffix;
var S = { students: [] };
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }
function load() {
  try { var raw = localStorage.getItem(LS_KEY); if (raw) { S = JSON.parse(raw); return; } } catch (e) {}
  S = { students: DEFAULT_STUDENTS.map(function (n, i) { return { id: 's' + i, name: n }; }) };
  save();
}
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
/* Chia n cặp thẻ theo chủ đề → mảng 2n lá {pair, card} đã xáo */
function dealPairs(n, theme) {
  var pool = CARD_BANK.filter(function (c) { return theme === 'all' || c.theme === theme; });
  var picked = shuffle(pool).slice(0, Math.min(n, pool.length));
  var board = [];
  picked.forEach(function (c, i) {
    board.push({ pair: i, card: c, open: false, matched: false });
    board.push({ pair: i, card: c, open: false, matched: false });
  });
  return shuffle(board);
}
function themeCount(theme) {
  return CARD_BANK.filter(function (c) { return theme === 'all' || c.theme === theme; }).length;
}
/* Xếp hạng theo thời gian (tăng dần); bằng nhau (làm tròn giây) → nhóm hòa */
function rankByTime(teams) {
  return teams.map(function (_, i) { return i; }).sort(function (a, b) { return teams[a].time - teams[b].time; });
}
function tiedGroups(rankOrder, teams) {
  var groups = [], cur = [rankOrder[0]];
  var sec = function (ti) { return Math.round(teams[ti].time / 1000); };
  for (var i = 1; i < rankOrder.length; i++) {
    if (sec(rankOrder[i]) === sec(cur[0])) cur.push(rankOrder[i]);
    else { if (cur.length > 1) groups.push(cur); cur = [rankOrder[i]]; }
  }
  if (cur.length > 1) groups.push(cur);
  return groups;
}

/* ============ TRẠNG THÁI TRẬN ĐẤU ============ */
var M = null; // {cfg, teams:[{name,members,rep,time,moves}], pos, board, pairs, first, lock, startT, timerId, matches, moves, qOrder, qPtr, rankOrder}
function show(id) {
  ['scrStart', 'scrSetup', 'scrLobby', 'scrPlay', 'scrResult'].forEach(function (s) {
    var el = $('#' + s); if (el) el.classList.toggle('hidden', s !== id);
  });
}
function studentName(id) { var st = S.students.filter(function (x) { return x.id === id; })[0]; return st ? st.name : '?'; }
function buildMatch(cfg) {
  var maxPairs = Math.min(25, themeCount(cfg.theme));
  if (cfg.pairs > maxPairs) { toast('Chủ đề này chỉ có ' + maxPairs + ' cặp thẻ. Đã tự điều chỉnh.'); cfg.pairs = maxPairs; }
  if (cfg.pairs < 2) cfg.pairs = 2;
  var groups = splitTeams(S.students.map(function (s) { return s.id; }), cfg.teams);
  M = { cfg: cfg, pos: 0, teams: [], board: [], pairs: cfg.pairs, first: -1, lock: false,
        startT: 0, timerId: null, matches: 0, moves: 0, player: null,
        qOrder: shuffle(SAMPLE_QUESTIONS.map(function (_, i) { return i; })), qPtr: 0, rankOrder: [] };
  for (var i = 0; i < cfg.teams; i++) {
    M.teams.push({ name: 'Đội ' + (i + 1), members: groups[i], rep: null, time: null, moves: null });
  }
  return true;
}
function nextTiebreakQ() {
  if (M.qPtr >= M.qOrder.length) { M.qOrder = shuffle(M.qOrder); M.qPtr = 0; }
  return SAMPLE_QUESTIONS[M.qOrder[M.qPtr++]];
}
function boardCols() {
  var p = M.pairs;
  return p <= 4 ? 4 : (p <= 9 ? 6 : 8);
}

/* ============ SẢNH ĐỘI ============ */
function renderLobby() {
  var box = $('#lobbyList'); box.innerHTML = '';
  M.teams.forEach(function (t, ti) {
    var d = document.createElement('div');
    d.className = 'team-card' + (t.time != null ? ' done' : '');
    var h = document.createElement('h3'); h.textContent = t.name; d.appendChild(h);
    var tm = document.createElement('div'); tm.className = 'tm';
    tm.textContent = t.members.map(studentName).join(', '); d.appendChild(tm);
    if (t.time != null) {
      var tt = document.createElement('div'); tt.className = 'team-time';
      tt.textContent = '⏱ ' + fmtTime(t.time) + ' (' + t.moves + ' lượt lật)'; d.appendChild(tt);
      if (t.rep) { var rp = document.createElement('div'); rp.className = 'hint'; rp.textContent = 'Người chơi: ' + studentName(t.rep); d.appendChild(rp); }
    } else {
      var hint = document.createElement('div'); hint.className = 'hint';
      hint.textContent = 'Chọn người đại diện:'; d.appendChild(hint);
      var list = document.createElement('div'); list.className = 'rep-list'; d.appendChild(list);
      t.members.forEach(function (mid) {
        var b = document.createElement('button');
        b.className = 'rep-btn' + (t.rep === mid ? ' sel' : '');
        b.textContent = studentName(mid);
        (function (m) { b.onclick = function () { Snd.team(); t.rep = m; renderLobby(); }; })(mid);
        list.appendChild(b);
      });
      var rb = document.createElement('button');
      rb.className = 'rep-btn'; rb.textContent = '🎲 Ngẫu nhiên';
      rb.onclick = function () { Snd.team(); t.rep = t.members[Math.floor(Math.random() * t.members.length)]; renderLobby(); };
      list.appendChild(rb);
      var row = document.createElement('div'); row.className = 'row';
      row.style.marginTop = '10px'; row.style.justifyContent = 'flex-start';
      var play = document.createElement('button');
      play.className = 'btn blue btn-play'; play.textContent = '▶ Vào chơi';
      play.onclick = function () {
        if (!t.rep) { t.rep = t.members[Math.floor(Math.random() * t.members.length)]; toast('Đã chọn ngẫu nhiên: ' + studentName(t.rep)); }
        Snd.team(); startTeamPlay(ti);
      };
      row.appendChild(play); d.appendChild(row);
    }
    box.appendChild(d);
  });
  var allDone = M.teams.every(function (t) { return t.time != null; });
  var br = $('#btnLobbyResults'); if (br) br.classList.toggle('hidden', !allDone);
}
/* ============ BÀN CHƠI ============ */
function startTeamPlay(ti) {
  M.pos = ti;
  M.board = dealPairs(M.pairs, M.cfg.theme);
  M.first = -1; M.lock = false; M.matches = 0; M.moves = 0;
  M.startT = 0;
  if (M.timerId) { clearInterval(M.timerId); M.timerId = null; }
  $('#playTeam').textContent = M.teams[ti].name + ' — ' + studentName(M.teams[ti].rep);
  $('#playInfo').textContent = M.pairs + ' cặp thẻ · Chủ đề: ' + THEME_NAMES[M.cfg.theme];
  renderBoard();
  updateHud();
  $('#btnNextTeam').classList.add('hidden');
  show('scrPlay');
}
function renderBoard() {
  var g = $('#memBoard');
  g.style.gridTemplateColumns = 'repeat(' + boardCols() + ', 1fr)';
  g.innerHTML = '';
  M.board.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'mcard ' + (c.matched ? 'matched' : (c.open ? 'front' : 'back'));
    if (c.open || c.matched) {
      b.innerHTML = '<span class="ico">' + c.card.icon + '</span><span class="lbl">' + escapeHtml(c.card.name) + '</span>';
    } else {
      b.textContent = '❓';
      (function (idx) { b.onclick = function () { flip(idx); }; })(i);
    }
    g.appendChild(b);
  });
}
function updateHud() {
  $('#statMoves').textContent = M.moves + ' lượt';
  $('#statPairs').textContent = M.matches + '/' + M.pairs + ' cặp';
}
function tickTimer() {
  if (!M.startT) return;
  $('#timer').textContent = fmtTime(Date.now() - M.startT);
}
function flip(i) {
  var c = M.board[i];
  if (M.lock || c.open || c.matched) return;
  if (!M.startT) {
    M.startT = Date.now();
    M.timerId = setInterval(tickTimer, 100);
  }
  c.open = true;
  Snd.flip();
  renderBoard(); updateHud();
  if (M.first < 0) { M.first = i; return; }
  M.moves++;
  var a = M.board[M.first], b = c;
  if (a.pair === b.pair) {
    a.matched = true; b.matched = true;
    M.first = -1; M.matches++;
    Snd.match();
    renderBoard(); updateHud();
    if (M.matches >= M.pairs) setTimeout(finishTeam, 600);
  } else {
    M.lock = true;
    Snd.nomatch();
    var i1 = M.first, i2 = i;
    M.first = -1;
    setTimeout(function () {
      M.board[i1].open = false; M.board[i2].open = false;
      M.lock = false;
      renderBoard(); updateHud();
    }, 800);
  }
}
function finishTeam() {
  if (M.timerId) { clearInterval(M.timerId); M.timerId = null; }
  var ms = Date.now() - M.startT;
  var t = M.teams[M.pos];
  t.time = ms; t.moves = M.moves;
  Snd.fanfare();
  showBanner('🎉 ' + t.name + ' xong!<br>⏱ ' + fmtTime(ms) + ' · ' + M.moves + ' lượt lật', 'gold');
  renderBoard(); updateHud();
  var btn = $('#btnNextTeam');
  var next = M.teams.findIndex(function (x) { return x.time == null; });
  btn.textContent = next >= 0 ? '➡ ' + M.teams[next].name + ' vào chơi' : '🏁 Xem bảng xếp hạng';
  btn.classList.remove('hidden');
  setTimeout(hideBanner, 2200);
}
function showBanner(txt, cls) { var b = $('#banner'); b.innerHTML = txt; b.className = 'show ' + cls; }
function hideBanner() { var b = $('#banner'); if (b) b.className = ''; }
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
    '<b>1. Chuẩn bị:</b> thầy/cô nhập danh sách học sinh (Excel/paste), chọn <b>số đội</b>, ' +
    '<b>số cặp thẻ</b> (2–25) và <b>chủ đề thẻ</b> (môn học / loài hoa / loại quả / màu sắc / trộn tất cả), ' +
    'rồi bấm <b>"Chia đội &amp; Bắt đầu"</b>.<br>' +
    '<b>2. Sảnh đội:</b> mỗi đội <b>chọn 1 đại diện</b> (bấm tên hoặc 🎲 ngẫu nhiên), rồi bấm <b>"Vào chơi"</b>.<br>' +
    '<b>3. Cách chơi:</b> các thẻ úp mặt ❓. Đại diện bấm <b>lật 2 thẻ</b> — ' +
    '<b>trùng nhau</b> thì ăn cặp (thẻ hiện ảnh + tên, ví dụ 🌹 Hoa hồng), ' +
    '<b>không trùng</b> thì úp lại. Chơi đến khi <b>mở hết</b> các cặp.<br>' +
    '<b>4. Tính giờ:</b> đồng hồ chạy từ <b>lần lật đầu tiên</b>. Mỗi đội chơi <b>cùng bộ thẻ</b> ' +
    '(được xáo lại) nên rất công bằng.<br>' +
    '<b>5. Xếp hạng:</b> theo <b>thời gian</b> — đội nhanh nhất thắng 🥇.<br>' +
    '&nbsp;&nbsp;• Nếu <b>bằng thời gian</b>: dùng nút <b>"Câu hỏi phụ"</b> — mỗi vòng 1 đội trả lời trắc nghiệm A/B/C/D; ' +
    '<b>đúng → xếp trên, sai → xếp dưới</b> (không tính điểm).<br>' +
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

/* ============ TỔNG KẾT & XẾP HẠNG ============ */
function showResults() {
  M.rankOrder = rankByTime(M.teams);
  Snd.fanfare();
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
      (tiedSet[ti] ? '<span class="tie-tag">bằng giờ</span>' : '') + '</div>' +
      '<div class="hint">' + escapeHtml(studentName(t.rep)) + ' · ' + t.members.map(studentName).join(', ') + '</div></div>' +
      '<div class="tstat">' + t.moves + ' lượt lật</div>' +
      '<div class="tpts">⏱ ' + fmtTime(t.time) + '</div></div>';
  }).join('');
  var btn = $('#btnTiebreak');
  btn.disabled = groups.length === 0;
  btn.textContent = groups.length ? '⚖ Câu hỏi phụ (' + groups.length + ' nhóm bằng giờ)' : '⚖ Câu hỏi phụ';
}
var TB = null;
function openTiebreak() {
  var groups = tiedGroups(M.rankOrder, M.teams);
  if (!groups.length) { toast('Không có đội nào bằng thời gian.'); return; }
  TB = { groups: groups, group: null, unresolved: [], top: [], bottom: [], q: null, answerTeam: -1 };
  var list = $('#tbGroups'); list.innerHTML = '';
  groups.forEach(function (g, gi) {
    var d = document.createElement('div'); d.className = 'chk-row';
    d.innerHTML = '<input type="checkbox" ' + (gi === 0 ? 'checked' : '') + '> ' +
      g.map(function (ti) { return escapeHtml(M.teams[ti].name) + ' (' + fmtTime(M.teams[ti].time) + ')'; }).join(' · ');
    list.appendChild(d);
  });
  $('#tbPanel').classList.add('hidden');
  $('#tbOverlay').classList.remove('hidden');
}
function startTiebreak() {
  var boxes = $('#tbGroups').querySelectorAll('input');
  var chosen = [];
  TB.groups.forEach(function (g, gi) { if (boxes[gi] && boxes[gi].checked) chosen = chosen.concat(g); });
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
  TB.q = nextTiebreakQ();
  TB.answerTeam = -1;
  $('#tbQText').textContent = TB.q.q;
  var box = $('#tbQOpts'); box.innerHTML = '';
  TB.q.opts.forEach(function (o, j) {
    var b = document.createElement('button'); b.className = 'opt-btn';
    b.textContent = 'ABCD'[j] + '. ' + o;
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
  if (ok) { TB.top.push(ti); Snd.match(); toast(M.teams[ti].name + ' trả lời ĐÚNG → xếp trên.'); }
  else { TB.bottom.push(ti); Snd.nomatch(); toast(M.teams[ti].name + ' trả lời SAI → xếp dưới.'); }
  TB.unresolved.splice(TB.unresolved.indexOf(ti), 1);
  setTimeout(function () {
    if (TB.unresolved.length <= 1) finishTiebreak(); else { renderTiebreak(); toast('Còn ' + TB.unresolved.length + ' đội chưa phân — bấm "Câu hỏi tiếp theo".'); }
  }, 1200);
}
function tiebreakRandom() {
  var rest = shuffle(TB.unresolved);
  applyTiebreak(TB.top.concat(rest, TB.bottom.slice().reverse()));
}
function finishTiebreak() {
  applyTiebreak(TB.top.concat(TB.unresolved, TB.bottom.slice().reverse()));
}
function applyTiebreak(finalGroup) {
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
    teams: Math.max(2, Math.min(8, parseInt((($('#cfgTeams') || {}).value || '4'), 10) || 4)),
    pairs: Math.max(2, Math.min(25, parseInt((($('#cfgPairs') || {}).value || '6'), 10) || 6)),
    theme: (($('#cfgTheme') || {}).value || 'all')
  };
}
function prefillSetup() {
  var a = $('#setStudents'); if (a) a.value = S.students.map(function (s) { return s.name; }).join('\n');
}
function startTrialMatch() {
  buildMatch({ teams: 2, pairs: 4, theme: 'all' });
  Snd.team(); renderLobby(); show('scrLobby');
  toast('Bản chơi thử: 2 đội, 4 cặp thẻ mẫu.');
}
function init() {
  load();
  if (CFG.trial) { var tb = $('#trialBadge'); if (tb) tb.classList.remove('hidden'); }
  refreshRosterInfo();
  var bind = function (id, fn) { var el = $(id); if (el) el.onclick = fn; };
  var bindChange = function (id, fn) { var el = $(id); if (el) el.onchange = fn; };
  bind('#btnPlay', function () { Snd.click(); if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); });
  bind('#btnHelp', function () { Snd.click(); openHelp(); });
  bind('#btnBackHome', function () { show('scrStart'); });
  bind('#btnImportExcel', function () { var f = $('#fileExcel'); if (f) f.click(); });
  bindChange('#fileExcel', function (e) { if (e.target.files[0]) importStudentsFromExcel(e.target.files[0]); e.target.value = ''; });
  bind('#btnMakeMatch', function () {
    var el = $('#setStudents');
    var names = el ? el.value.split('\n').map(function (s) { return s.split('\t')[0].trim(); }).filter(Boolean) : [];
    if (names.length >= 2) S.students = names.map(function (n, i) { return { id: 's' + i, name: n }; });
    save(); refreshRosterInfo();
    var cfg = readCfg();
    if (S.students.length < cfg.teams) { toast('Số học sinh ít hơn số đội!'); return; }
    buildMatch(cfg);
    Snd.team(); renderLobby(); show('scrLobby');
  });
  bind('#btnLobbyResults', function () { Snd.click(); showResults(); });
  bind('#btnNextTeam', function () {
    Snd.click(); hideBanner();
    var next = M.teams.findIndex(function (x) { return x.time == null; });
    if (next >= 0) { renderLobby(); show('scrLobby'); }
    else showResults();
  });
  bind('#btnAgain', function () { if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); });
  bind('#btnHome2', function () { show('scrStart'); });
  bind('#btnTiebreak', function () { Snd.click(); openTiebreak(); });
  bind('#btnTbStart', function () { startTiebreak(); });
  bind('#btnTbNextQ', function () { Snd.click(); tiebreakNextQ(); });
  bind('#btnTbRandom', function () { Snd.click(); tiebreakRandom(); });
  bind('#btnTbClose', function () { var o = $('#tbOverlay'); if (o) o.classList.add('hidden'); });
}
function refreshRosterInfo() {
  var el = $('#rosterInfo');
  if (el) el.textContent = S.students.length + ' học sinh · 50 cặp thẻ hệ thống' + (CFG.trial ? ' (bản chơi thử)' : '');
}
/* Hook kiểm thử */
window.__BCT = { CFG: CFG, CARD_BANK: CARD_BANK, THEME_NAMES: THEME_NAMES,
  getS: function () { return S; }, buildMatch: buildMatch, splitTeams: splitTeams,
  dealPairs: dealPairs, themeCount: themeCount, rankByTime: rankByTime, tiedGroups: tiedGroups,
  fmtTime: fmtTime, startTeamPlay: startTeamPlay, flip: flip, finishTeam: finishTeam,
  showResults: showResults, openTiebreak: openTiebreak, startTiebreak: startTiebreak,
  tiebreakNextQ: tiebreakNextQ, tiebreakAnswer: tiebreakAnswer, tiebreakRandom: tiebreakRandom,
  finishTiebreak: finishTiebreak, applyTiebreak: applyTiebreak, nextTiebreakQ: nextTiebreakQ,
  openHelp: openHelp, renderLobby: renderLobby,
  getM: function () { return M; }, getTB: function () { return TB; } };
document.addEventListener('DOMContentLoaded', init);
