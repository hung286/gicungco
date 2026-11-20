/* =====================================================================
   SmartEdu — XẠ THỦ BẮN CUNG: ĐẤU ĐỘI (bancung)
   File logic dùng chung cho:
     - bản chính thức  (/game/bancung/):      window.__TRIAL__ không đặt
     - bản chơi thử   (/gametest/bancung/):   window.__TRIAL__ = true
   Luật chơi:
   - GV import HS + câu hỏi, cấu hình: số đội, số câu/đội, thời gian trả lời,
     thời gian bắn, tốc độ vòng quay, tốc độ cung, chế độ cung (đu đưa/cố định).
   - Chia đội ngẫu nhiên tương đối đều (phần dư chia ngẫu nhiên +1/đội).
   - Câu hỏi chia sẵn thành các gói đánh số (Gói 1, Gói 2...) từ đầu; mỗi đội
     chọn 1 gói (gói đã chọn không được chọn lại), chơi HẾT gói của mình
     rồi mới đến đội tiếp theo.
   - Mỗi lượt: chọn người bắn → chọn gói → trả lời từng câu (tính giờ) →
     đúng thì bắn vòng quay 6 ô (30x1, 20x2, 10x3).
   - Tổng kết: xếp hạng + tiebreak: ít thời gian trả lời → nhiều câu đúng
     → nhiều ô 30 → 20 → 10.
   ===================================================================== */
'use strict';
/* ============ CẤU HÌNH ============ */
var CFG = {
  trial: !!(window.__TRIAL__),                 // bản chơi thử đặt window.__TRIAL__ = true
  storeSuffix: window.__TRIAL__ ? '_trial' : '' // kho lưu tách riêng
};
var TRIAL_MSG = 'Đây là bản chơi thử nên chức năng này chưa khả dụng. Bạn cần đăng ký VIP.';
var DEFAULT_STUDENTS = window.SmartEduDefaultStudents || [];
var SAMPLE_QUESTIONS = window.SmartEduSampleQuestions || [];
/* Vòng quay 6 ô: 30đ x1, 20đ x2, 10đ x3.
   Ô đối diện: 30↔10, 20↔20, 10↔10 */
var WHEEL_SLOTS = [30, 20, 10, 10, 20, 10];
var WHEEL_COLORS = ['#ffd34d', '#4d7fe0', '#43b968', '#43b968', '#4d7fe0', '#43b968'];

/* ============ NGÂN HÀNG RICH (ảnh + LaTeX, session-only) ============
   Câu hỏi nhập từ Word (giữ ảnh) nằm ở RICHQ, KHÔNG lưu localStorage
   (base64 nặng). Tải lại trang thì nhập lại file Word. */
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
function $(s) { return document.querySelector(s); }
function toast(msg) {
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, 2800);
}
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/* ============ ÂM THANH (WebAudio mặc định, KHÔNG cần file)
   >>> THẦY MUỐN THAY NHẠC RIÊNG: sửa các hàm trong Snd, ví dụ:
   >>> team: function () { new Audio('nhac-chon-doi.mp3').play(); } */
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
  pack: function () { var s = this; [659, 784, 1047].forEach(function (f, i) { s.tone(f, 130, 'sine', .14, i * .1); }); },
  tick: function () { this.tone(1100, 50, 'square', .05); },
  correct: function () { var s = this; [523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 140, 'triangle', .15, i * .09); }); },
  wrong: function () { this.tone(220, 220, 'sawtooth', .12); this.tone(165, 300, 'sawtooth', .12, .18); },
  shoot: function () { this.tone(900, 90, 'sawtooth', .10); this.tone(420, 120, 'sawtooth', .08, .06); },
  hitWheel: function () { this.tone(140, 160, 'triangle', .22); },
  bull30: function () { var s = this; [523, 659, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, 150, 'triangle', .16, i * .08); }); },
  fanfare: function () { var s = this; [523, 523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 200, 'triangle', .16, i * .14); }); }
};
/* ============ KHO DỮ LIỆU ============ */
var LS_KEY = 'smartedu_bancung2' + CFG.storeSuffix;
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

/* ============ LOGIC THUẦN (kiểm thử được) ============ */
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
function dealPacks(qCount, k, qPerTeam) {
  var need = k * qPerTeam;
  if (qCount < need) return null;
  var idx = shuffle(Array.apply(null, { length: qCount }).map(function (_, i) { return i; }));
  var packs = [];
  for (var i = 0; i < k; i++) packs.push(idx.slice(i * qPerTeam, (i + 1) * qPerTeam));
  return packs;
}
function wheelSlotAt(hitAngle, wheelAngle) {
  var TAU = Math.PI * 2, seg = TAU / 6, rel = (hitAngle - wheelAngle) % TAU;
  if (rel < 0) rel += TAU;
  return Math.min(5, Math.floor(rel / seg));
}
function rankTeams(teams) {
  return teams.slice().sort(function (a, b) {
    return (b.score - a.score) ||
      (a.answerTime - b.answerTime) ||
      (b.correct - a.correct) ||
      (b.hits[30] - a.hits[30]) ||
      (b.hits[20] - a.hits[20]) ||
      (b.hits[10] - a.hits[10]);
  });
}

/* ============ TRẠNG THÁI TRẬN ĐẤU ============ */
var M = null;
var cur = { team: -1, qIdx: -1, q: null };
function show(id) {
  ['scrStart', 'scrSetup', 'scrLobby', 'scrQuiz', 'scrShoot', 'scrResult'].forEach(function (s) {
    $('#' + s).classList.toggle('hidden', s !== id);
  });
}
function studentName(id) { var st = S.students.filter(function (x) { return x.id === id; })[0]; return st ? st.name : '?'; }
function buildMatch(cfg) {
  var packs = dealPacks(S.questions.length, cfg.teams, cfg.qPerTeam);
  if (!packs) { toast('Ngân hàng thiếu câu hỏi: cần ' + (cfg.teams * cfg.qPerTeam) + ' câu, hiện có ' + S.questions.length + '.'); return false; }
  var groups = splitTeams(S.students.map(function (s) { return s.id; }), cfg.teams);
  M = { cfg: cfg, teamPos: 0, teams: [], packs: [] };
  for (var i = 0; i < cfg.teams; i++) {
    M.packs.push({ n: i + 1, qs: packs[i], takenBy: null });
    M.teams.push({ name: 'Đội ' + (i + 1), members: groups[i], packIdx: null, qi: 0,
      score: 0, answerTime: 0, correct: 0, hits: { 30: 0, 20: 0, 10: 0 }, repId: null });
  }
  return true;
}
function teamPack(t) { return t.packIdx === null ? null : M.packs[t.packIdx]; }
function teamDone(t) { var p = teamPack(t); return !!p && t.qi >= p.qs.length; }
function allDone() { return M.teamPos >= M.teams.length; }
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
    '<b>1. Chuẩn bị:</b> thầy/cô nhập danh sách học sinh, ngân hàng câu hỏi trắc nghiệm, ' +
    'cấu hình số đội – số câu mỗi đội – thời gian – tốc độ, rồi bấm <b>"Chia đội &amp; Bắt đầu"</b>.<br>' +
    '&nbsp;&nbsp;• <b>Công thức toán:</b> gõ dạng <b>$...$</b> (vd $x^2+1$) sẽ tự hiện đẹp.<br>' +
    '&nbsp;&nbsp;• <b>Nhập từ Word:</b> giữ nguyên <b>ảnh minh họa</b> trong câu hỏi (nhập lại sẽ thay thế; tải lại trang cần nhập lại).<br>' +
    '<b>2. Chia đội &amp; chia gói:</b> hệ thống chia ngẫu nhiên thành các đội tương đối đều nhau; ' +
    'câu hỏi được chia sẵn thành các <b>gói đánh số (Gói 1, Gói 2, Gói 3...)</b>, mỗi gói đúng số câu đã cài đặt, ' +
    'các gói không trùng câu.<br>' +
    '<b>3. Vào lượt:</b> bấm vào đội tới lượt → chọn người lên bắn (hoặc ngẫu nhiên) → ' +
    'đại diện chọn 1 <b>gói câu hỏi</b> (gói đã chọn thì đội sau không được chọn nữa).<br>' +
    '<b>4. Trả lời:</b> trả lời trắc nghiệm trong thời gian quy định. ' +
    '<b>Trả lời đúng mới được bắn cung</b>; sai hoặc hết giờ = 0 điểm.<br>' +
    '<b>5. Bắn cung:</b> vòng quay có 6 ô <b>30 – 20 – 10 điểm</b>. Trúng ô nào cộng điểm đó; ' +
    'trượt ra ngoài = 0 điểm.<br>' +
    '&nbsp;&nbsp;• <b>Cung tự đu đưa:</b> cung tự đung đưa, canh đúng nhịp bấm <b>BẮN</b> ' +
    '(hoặc chạm màn hình / phím Space).<br>' +
    '&nbsp;&nbsp;• <b>Ngắm tay rồi cố định:</b> <b>chạm / kéo</b> trên màn hình để xoay cung ' +
    'theo hướng bất kỳ (cung đứng yên tại hướng đã ngắm), rồi bấm <b>BẮN</b>.<br>' +
    '<b>6. Thứ tự:</b> mỗi đội chơi <b>hết gói câu hỏi của mình</b> rồi mới đến đội tiếp theo → ' +
    'xong hết thì bấm <b>"Tổng kết &amp; Xếp hạng"</b>.<br>' +
    '<b>7. Xếp hạng:</b> theo điểm số; nếu bằng điểm thì xét lần lượt: <i>ít thời gian trả lời hơn → ' +
    'nhiều câu đúng hơn → nhiều ô 30 → ô 20 → ô 10 hơn</i>.' +
    '</div>';
  var row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '14px';
  var btn = document.createElement('button'); btn.className = 'btn blue'; btn.textContent = 'Đã hiểu!';
  btn.onclick = function () { helpOv.classList.add('hidden'); };
  row.appendChild(btn); panel.appendChild(row); ov.appendChild(panel);
  document.body.appendChild(ov);
  helpOv = ov;
}
function openHelp() { ensureHelpOverlay(); helpOv.classList.remove('hidden'); }

/* ============ SẢNH ĐỘI ============ */
function renderLobby() {
  var g = $('#teamGrid'); g.innerHTML = '';
  M.teams.forEach(function (t, i) {
    var d = document.createElement('div');
    var p = teamPack(t);
    var isCur = (i === M.teamPos && !allDone());
    d.className = 'team-card' + (teamDone(t) ? ' done' : '') + (isCur ? ' active' : '');
    var names = t.members.map(studentName).join(', ');
    var prog = p ? ('Gói ' + p.n + ' · đã xong ' + t.qi + '/' + p.qs.length + ' câu') : 'Chưa chọn gói câu hỏi';
    d.innerHTML = '<div class="team-name">' + escapeHtml(t.name) + '</div>' +
      '<div class="team-score">' + t.score + ' điểm</div>' +
      (t.repId ? '<div class="rep-line">Người bắn: ' + escapeHtml(studentName(t.repId)) + '</div>' : '') +
      '<div class="team-prog">' + prog + '</div>' +
      '<div class="team-members">' + escapeHtml(names) + '</div>';
    if (isCur) { (function (idx) { d.onclick = function () { Snd.click(); startTeamTurn(idx); }; })(i); }
    else if (!allDone() && !teamDone(t)) { d.onclick = function () { toast('Chưa tới lượt đội này — mỗi đội chơi hết gói của mình rồi mới đến đội tiếp theo.'); }; }
    g.appendChild(d);
  });
  $('#lobbyHint').textContent = allDone()
    ? 'Tất cả các đội đã xong! Bấm "Tổng kết & Xếp hạng".'
    : 'Tới lượt: ' + M.teams[M.teamPos].name + ' — bấm vào thẻ đội để thi đấu (chơi hết gói rồi mới đến đội tiếp theo).';
}
/* Sau mỗi câu: cùng đội chơi tiếp câu kế; hết gói thì sang đội kế tiếp */
function afterQuestion(teamIdx) {
  var t = M.teams[teamIdx], p = teamPack(t);
  if (t.qi >= p.qs.length) {
    M.teamPos++;
    renderLobby(); show('scrLobby');
    if (allDone()) toast('Tất cả các đội đã xong! Bấm "Tổng kết & Xếp hạng".');
  } else {
    askQuestion(teamIdx);
  }
}
function pickRep(teamIdx, done) {
  var t = M.teams[teamIdx];
  $('#pickTitle').textContent = t.name + ' — cử đại diện lên bắn cung';
  var list = $('#pickList'); list.innerHTML = '';
  t.members.forEach(function (id) {
    var b = document.createElement('button'); b.className = 'pick-item'; b.textContent = studentName(id);
    b.onclick = function () { Snd.team(); t.repId = id; hidePick(); done(); };
    list.appendChild(b);
  });
  var rnd = document.createElement('button'); rnd.className = 'pick-item'; rnd.textContent = '🎲 Ngẫu nhiên';
  rnd.onclick = function () { Snd.team(); t.repId = t.members[Math.floor(Math.random() * t.members.length)]; hidePick(); done(); };
  list.appendChild(rnd);
  $('#pickOverlay').classList.remove('hidden');
}
function hidePick() { $('#pickOverlay').classList.add('hidden'); }
function pickPack(teamIdx) {
  var t = M.teams[teamIdx];
  $('#pickTitle').textContent = t.name + ' — đại diện chọn 1 gói câu hỏi';
  var list = $('#pickList'); list.innerHTML = '';
  M.packs.forEach(function (p, pi) {
    if (p.takenBy !== null) return;
    (function (idx, pack) {
      var e = document.createElement('div'); e.className = 'envelope';
      e.innerHTML = '🎁<div style="font-size:14px;font-weight:800;margin-top:4px">Gói ' + pack.n + '</div>';
      e.onclick = function () { Snd.pack(); pack.takenBy = teamIdx; t.packIdx = idx; hidePick(); askQuestion(teamIdx); };
      list.appendChild(e);
    })(pi, p);
  });
  $('#pickOverlay').classList.remove('hidden');
}
function startTeamTurn(teamIdx) {
  cur.team = teamIdx;
  var t = M.teams[teamIdx];
  var go = function () { pickPack(teamIdx); };
  if (!t.repId) pickRep(teamIdx, go); else { Snd.team(); go(); }
}
/* ============ TRẢ LỜI CÂU HỎI (tính giờ) ============ */
var QZ = { t: 0, total: 30, timer: 0, lastTick: -1, answered: false };
function askQuestion(teamIdx) {
  var t = M.teams[teamIdx];
  cur.qIdx = teamPack(t).qs[t.qi];
  cur.q = S.questions[cur.qIdx];
  QZ.total = M.cfg.answerTime; QZ.t = QZ.total; QZ.answered = false; QZ.lastTick = -1;
  $('#quizTeam').textContent = t.name;
  $('#quizRep').textContent = 'Người trả lời: ' + studentName(t.repId);
  $('#qText').textContent = ''; showQuestion($('#qText'), cur.q);
  var box = $('#qOpts'); box.innerHTML = '';
  cur.q.opts.forEach(function (o, j) {
    var b = document.createElement('button'); b.className = 'opt-btn';
    showOption(b, cur.q, j);
    b.onclick = function () { answerQuiz(teamIdx, j, b); };
    box.appendChild(b);
  });
  show('scrQuiz');
  updateQTimer();
  cancelAnimationFrame(QZ.timer);
  var last = performance.now();
  var step = function (now) {
    var dt = (now - last) / 1000; last = now;
    QZ.t -= dt;
    if (QZ.t <= 5.05 && Math.ceil(QZ.t) !== QZ.lastTick && QZ.t > 0) { QZ.lastTick = Math.ceil(QZ.t); Snd.tick(); }
    updateQTimer();
    if (QZ.t <= 0) { answerQuiz(teamIdx, -1, null); return; }
    if (!QZ.answered) QZ.timer = requestAnimationFrame(step);
  };
  QZ.timer = requestAnimationFrame(step);
}
function updateQTimer() {
  $('#qTimerBar').style.width = Math.max(0, QZ.t / QZ.total * 100) + '%';
  $('#qTimerNum').textContent = Math.ceil(Math.max(0, QZ.t));
}
function answerQuiz(teamIdx, j, btn) {
  if (QZ.answered) return;
  QZ.answered = true; cancelAnimationFrame(QZ.timer);
  var t = M.teams[teamIdx];
  t.answerTime += QZ.total - Math.max(0, QZ.t);
  var btns = $('#qOpts').children;
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  if (j === cur.q.answer) {
    t.correct++;
    if (btn) btn.classList.add('correct');
    Snd.correct();
    setTimeout(function () { startShoot(teamIdx); }, 900);
  } else {
    if (btn) btn.classList.add('wrong');
    if (btns[cur.q.answer]) btns[cur.q.answer].classList.add('correct');
    Snd.wrong();
    var msg = j < 0 ? 'Hết giờ! Đáp án đúng: ' : 'Sai rồi! Đáp án đúng: ';
    toast(t.name + ': ' + msg + 'ABCD'[cur.q.answer] + ' (0 điểm)');
    setTimeout(function () { t.qi++; afterQuestion(teamIdx); }, 1600);
  }
}

/* ============ BẮN CUNG: vòng quay 6 ô + cung ============ */
var cv = $('#cv'), ctx = cv.getContext('2d');
var W = 0, H = 0, DPR = 1, stars = [];
var SH = { phase: 'idle', t: 0, total: 15, wheelAngle: 0, aimAngle: 0,
  bowSpeed: 1.6, wheelSpeed: 0.6, arrow: null, particles: [], timer: 0, lastTick: -1, done: false };
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  stars = [];
  for (var i = 0; i < 90; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * .5, r: Math.random() * 1.6 + .4, p: Math.random() * 6.28 });
}
window.addEventListener('resize', resize);
function wheelR() { return Math.min(W * 0.26, 185) * 0.75; }  /* thầy 2026-10-30: vòng bia chỉ = 3/4 hiện tại */
function wheelC() { return { x: W / 2, y: Math.max(140, H * 0.25) }; }
function bowP() { return { x: W / 2, y: H - 84 }; }
function startShoot(teamIdx) {
  cur.team = teamIdx;
  var t = M.teams[teamIdx];
  $('#shootTeam').textContent = t.name + ' — ' + studentName(t.repId);
  SH.phase = 'aim'; SH.done = false; SH.arrow = null; SH.particles = [];
  SH.t = 0; SH.wheelAngle = Math.random() * Math.PI * 2;
  SH.total = M.cfg.shootTime; SH.lastTick = -1;
  SH.bowSpeed = M.cfg.bowSpeed;
  SH.wheelSpeed = M.cfg.wheelSpeed * Math.PI * 2;
  if (M.cfg.bowMode === 'fixed') { SH.aimAngle = 0; $('#shootHint').textContent = 'Chạm/kéo để ngắm, bấm BẮN để bắn!'; }
  else $('#shootHint').textContent = 'Canh nhịp rồi bấm BẮN!';
  show('scrShoot');
  updateSTimer();
  cancelAnimationFrame(SH.timer);
  var last = performance.now();
  var step = function (now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    SH.t -= dt;
    if (SH.t <= 5.05 && Math.ceil(SH.t) !== SH.lastTick && SH.t > 0 && !SH.done) { SH.lastTick = Math.ceil(SH.t); Snd.tick(); }
    updateSTimer();
    if (SH.t <= 0 && !SH.done) { shootTimeout(teamIdx); return; }
    if (!SH.done) SH.timer = requestAnimationFrame(step);
  };
  SH.t = SH.total;
  SH.timer = requestAnimationFrame(step);
}
function updateSTimer() {
  $('#sTimerBar').style.width = Math.max(0, SH.t / SH.total * 100) + '%';
  $('#sTimerNum').textContent = Math.ceil(Math.max(0, SH.t));
}
function doShoot() {
  if (SH.phase !== 'aim' || SH.done) return;
  Snd.shoot();
  var b = bowP(), a = SH.aimAngle;
  var dx = Math.sin(a), dy = -Math.cos(a), tip = 74;
  SH.arrow = { x: b.x + dx * tip, y: b.y + dy * tip, vx: dx * 1500, vy: dy * 1500, angle: a };
  SH.phase = 'fly';
}
function shootTimeout(teamIdx) {
  SH.done = true; cancelAnimationFrame(SH.timer);
  Snd.wrong();
  showBanner('Hết giờ bắn! (0 điểm)', 'bad');
  setTimeout(function () { finishShootTurn(teamIdx); }, 1400);
}
function resolveWheelHit(px, py) {
  var c = wheelC(), R = wheelR();
  var dx = px - c.x, dy = py - c.y;
  if (Math.hypot(dx, dy) > R) return 0;
  var ang = Math.atan2(dy, dx); if (ang < 0) ang += Math.PI * 2;
  return WHEEL_SLOTS[wheelSlotAt(ang, SH.wheelAngle)];
}
function onWheelHit(value) {
  var teamIdx = cur.team, t = M.teams[teamIdx];
  SH.done = true; cancelAnimationFrame(SH.timer);
  var c = wheelC();
  if (value > 0) {
    t.score += value; t.hits[value]++;
    if (value === 30) { Snd.bull30(); showBanner('Ô 30 ĐIỂM! +' + value, 'gold'); }
    else { Snd.hitWheel(); Snd.correct(); showBanner('Trúng ô ' + value + ' điểm! +' + value, 'good'); }
    burst(c.x, c.y, value === 30 ? '#ffd34d' : '#7be3a8', 22);
  } else {
    Snd.wrong();
    showBanner('Trượt vòng quay! (0 điểm)', 'bad');
  }
  setTimeout(function () { finishShootTurn(teamIdx); }, 1500);
}
function finishShootTurn(teamIdx) {
  M.teams[teamIdx].qi++;
  hideBanner();
  afterQuestion(teamIdx);
}
function showBanner(txt, cls) { var b = $('#banner'); b.textContent = txt; b.className = 'show ' + cls; }
function hideBanner() { $('#banner').className = ''; }
function burst(x, y, color, n) {
  for (var i = 0; i < n; i++) {
    var a = Math.random() * 6.283, sp = 60 + Math.random() * 220;
    SH.particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: .7 + Math.random() * .5, color: color });
  }
}

/* ---- Vòng lặp vẽ ---- */
var lastT = 0;
function frame(ts) {
  var dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016); lastT = ts;
  update(dt); render();
  requestAnimationFrame(frame);
}
function update(dt) {
  if ($('#scrShoot').classList.contains('hidden')) return;
  SH.wheelAngle = (SH.wheelAngle + SH.wheelSpeed * dt) % (Math.PI * 2);
  if (M && M.cfg.bowMode === 'swing' && SH.phase === 'aim') {
    SH.aimAngle = Math.sin(performance.now() / 1000 * SH.bowSpeed) * 0.45;
  }
  SH.particles = SH.particles.filter(function (p) { return (p.life -= dt) > 0; });
  SH.particles.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; });
  var ar = SH.arrow;
  if (ar && !SH.done) {
    var hit = 0;
    for (var s = 0; s < 3; s++) {
      ar.x += ar.vx * dt / 3; ar.y += ar.vy * dt / 3;
      var c = wheelC(), R = wheelR();
      if (Math.hypot(ar.x - c.x, ar.y - c.y) <= R) { hit = resolveWheelHit(ar.x, ar.y); break; }
    }
    if (hit || ar.x < -60 || ar.x > W + 60 || ar.y < -60 || ar.y > H + 60) {
      SH.arrow = null; SH.phase = 'aim';
      var out = (ar.x < -60 || ar.x > W + 60 || ar.y < -60 || ar.y > H + 60);
      onWheelHit(out ? 0 : hit);
    }
  }
}
function render() {
  if ($('#scrShoot').classList.contains('hidden')) return;
  drawBackground(); drawWheel(); drawBow(); drawArrowFlight(); drawParticles();
}
function drawBackground() {
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b1026'); g.addColorStop(0.62, '#101a3f'); g.addColorStop(1, '#0a1f16');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#cdd6ff';
  var t = performance.now() / 1000;
  stars.forEach(function (s) { ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + s.p)); ctx.fillRect(s.x, s.y, s.r, s.r); });
  ctx.globalAlpha = 1;
  var gg = ctx.createLinearGradient(0, H - 120, 0, H);
  gg.addColorStop(0, '#14532d'); gg.addColorStop(1, '#0a2e18');
  ctx.fillStyle = gg; ctx.fillRect(0, H - 120, W, 140);
}
function drawWheel() {
  var c = wheelC(), R = wheelR(), TAU = Math.PI * 2, seg = TAU / 6;
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.arc(c.x + 6, c.y + 10, R, 0, TAU); ctx.fill();
  for (var i = 0; i < 6; i++) {
    var a0 = SH.wheelAngle + i * seg, a1 = a0 + seg;
    ctx.fillStyle = WHEEL_COLORS[i];
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.arc(c.x, c.y, R, a0, a1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3; ctx.stroke();
    var mid = a0 + seg / 2;
    ctx.fillStyle = '#fff'; ctx.font = '900 ' + Math.max(16, R * 0.16) + 'px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(WHEEL_SLOTS[i], c.x + Math.cos(mid) * R * 0.68, c.y + Math.sin(mid) * R * 0.68);
  }
  ctx.fillStyle = '#8a6136';
  ctx.beginPath(); ctx.arc(c.x, c.y, R * 0.10, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(c.x, c.y, R * 0.055, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '700 13px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('VÒNG QUAY ĐIỂM', c.x, c.y - R - 16);
}
function drawBow() {
  var b = bowP();
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(SH.aimAngle);
  ctx.strokeStyle = '#a06a35'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 6, 56, -Math.PI / 2 - 1.05, -Math.PI / 2 + 1.05); ctx.stroke();
  ctx.strokeStyle = '#e8c98a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 6, 56, -Math.PI / 2 - 1.05, -Math.PI / 2 + 1.05); ctx.stroke();
  var e1x = 56 * Math.cos(-Math.PI / 2 - 1.05), e1y = 6 + 56 * Math.sin(-Math.PI / 2 - 1.05);
  var e2x = 56 * Math.cos(-Math.PI / 2 + 1.05), e2y = 6 + 56 * Math.sin(-Math.PI / 2 + 1.05);
  ctx.strokeStyle = '#f2ead8'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(e1x, e1y); ctx.lineTo(0, 30); ctx.lineTo(e2x, e2y); ctx.stroke();
  if (SH.phase === 'aim') {
    ctx.strokeStyle = '#d8b25c'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -72); ctx.stroke();
    ctx.fillStyle = '#dfe5ff';
    ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(-7, -70); ctx.lineTo(7, -70); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#233026';
  ctx.beginPath(); ctx.ellipse(b.x, b.y + 44, 66, 16, 0, 0, 6.283); ctx.fill();
}
function drawArrowFlight() {
  var ar = SH.arrow; if (!ar) return;
  ctx.save(); ctx.translate(ar.x, ar.y); ctx.rotate(Math.atan2(ar.vy, ar.vx) + Math.PI / 2);
  ctx.strokeStyle = '#d8b25c'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(0, -30); ctx.stroke();
  ctx.fillStyle = '#dfe5ff';
  ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-7, -28); ctx.lineTo(7, -28); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawParticles() {
  SH.particles.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.283); ctx.fill();
  });
  ctx.globalAlpha = 1;
}
/* ============ TỔNG KẾT & XẾP HẠNG ============ */
function showResults() {
  if (!M) { toast('Chưa có trận đấu nào.'); return; }
  Snd.fanfare();
  var ranked = rankTeams(M.teams);
  var medals = ['🥇', '🥈', '🥉'];
  var packLen = function (t) { var p = teamPack(t); return p ? p.qs.length : 0; };
  $('#rankBoard').innerHTML = ranked.map(function (t, i) {
    return '<div class="rank-row"><div class="medal">' + (medals[i] || (i + 1)) + '</div>' +
      '<div><div class="tname">' + escapeHtml(t.name) + '</div>' +
      '<div class="hint">' + t.members.map(studentName).join(', ') + '</div></div>' +
      '<div class="tstat">Trả lời đúng: ' + t.correct + '/' + packLen(t) +
      '<br>Tổng giờ trả lời: ' + Math.round(t.answerTime) + 's' +
      '<br>Ô 30: ' + t.hits[30] + ' | Ô 20: ' + t.hits[20] + ' | Ô 10: ' + t.hits[10] + '</div>' +
      '<div class="tpts">' + t.score + 'đ</div></div>';
  }).join('');
  show('scrResult');
}

/* ============ NHẬP TỪ FILE (Excel cho HS, Word cho câu hỏi) ============ */
/* Đọc cột đầu của sheet đầu: bỏ dòng tiêu đề, bỏ ô trống; nếu cột A là số
   thứ tự thì lấy tên ở cột B. Hàm thuần để kiểm thử được. */
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
    if (/^\d+$/.test(a)) { if (!b) return; a = b; } // cột A là STT: lấy tên ở cột B, trống tên thì bỏ
    var v = a;
    if (v) names.push(v.split('\t')[0].trim());
  });
  return names.filter(Boolean);
}
/* Đọc câu hỏi từ HTML do mammoth xuất ra. Định dạng Word:
     Câu 1. Nội dung câu hỏi?
     A. ...
     B. ...
     C. ...
     D. ...
     Đáp án: B
   LƯU Ý: chỉ lấy được chữ; hình ảnh & công thức Equation không qua được. */
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
      if (!names.length) { toast('Không đọc được tên nào từ file Excel (lấy cột đầu tiên của sheet đầu).'); return; }
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

function refreshRosterInfo() {
  $('#rosterInfo').textContent = S.students.length + ' học sinh, ' + S.questions.length + ' câu hỏi' +
    (CFG.trial ? ' (bản chơi thử)' : '');
}

/* ============ KHỞI ĐỘNG ============ */
function readCfg() {
  var mode = 'swing';
  var radios = document.getElementsByName('bowMode');
  for (var i = 0; i < radios.length; i++) if (radios[i].checked) mode = radios[i].value;
  return {
    teams: Math.max(2, Math.min(8, parseInt($('#cfgTeams').value, 10) || 4)),
    qPerTeam: Math.max(1, Math.min(20, parseInt($('#cfgQPerTeam').value, 10) || 3)),
    answerTime: Math.max(5, Math.min(120, parseInt($('#cfgAnswerTime').value, 10) || 30)),
    shootTime: Math.max(5, Math.min(60, parseInt($('#cfgShootTime').value, 10) || 15)),
    wheelSpeed: Math.max(0.2, Math.min(1.5, parseFloat($('#cfgWheelSpeed').value) || 0.9)),
    bowSpeed: Math.max(0.5, Math.min(4, parseFloat($('#cfgBowSpeed').value) || 1.6)),
    bowMode: mode
  };
}
function prefillSetup() {
  $('#setStudents').value = S.students.map(function (s) { return s.name; }).join('\n');
  $('#setQuestions').value = questionsToText(S.questions.filter(function (q) { return !q._rich; }));
  refreshWordBankInfo();
}
function startTrialMatch() {
  var cfg = { teams: 2, qPerTeam: 2, answerTime: 30, shootTime: 15, wheelSpeed: 0.9, bowSpeed: 1.6, bowMode: 'swing' };
  var keepS = S.students;
  S.students = keepS.slice(0, 8);
  /* Sửa 2026-10-30 (thầy báo trial bốc lặp câu): giữ nguyên 20 câu mẫu,
     dealPacks() sẽ xáo và bốc ngẫu nhiên 4 câu không trùng mỗi lần chơi,
     thay vì cố định 4 câu đầu như trước. */
  var ok = buildMatch(cfg);
  S.students = keepS;
  if (!ok) return;
  Snd.team(); renderLobby(); show('scrLobby');
  toast('Bản chơi thử: 2 đội, mỗi đội 2 câu hỏi mẫu.');
}
/* Chế độ cung cố định: chạm/kéo để ngắm theo hướng bất kỳ (giới hạn ±60°) */
function aimFixed(e) {
  var b = bowP();
  var r = cv.getBoundingClientRect();
  var px = (e.clientX == null ? 0 : e.clientX) - r.left;
  var py = (e.clientY == null ? 0 : e.clientY) - r.top;
  SH.aimAngle = Math.max(-1.05, Math.min(1.05, Math.atan2(px - b.x, -(py - b.y))));
}
function init() {
  if (!window.SmartEduDefaultStudents || !window.SmartEduSampleQuestions) {
    try { toast('Thiếu file dùng chung (smartedu-default-*.js). Thầy copy 2 file vào thư mục cha (game/) giúp mình.'); } catch (e) {}
  }
  /* Sửa 2026-10-30 (thầy báo công thức hiện dạng $...$ thô): cảnh báo rõ để thầy biết thiếu file nào */
  if (!window.QuizCommon) {
    try { toast('Thiếu smartedu-quiz-common.js ở thư mục game/ — công thức sẽ hiện dạng text thô.'); } catch (e) {}
  } else if (!QuizCommon.hasKaTeX()) {
    try { toast('Thiếu thư mục katex/ ở game/ — công thức $...$ sẽ hiện dạng text thô.'); } catch (e) {}
  }
  resize(); load();
  if (CFG.trial) $('#trialBadge').classList.remove('hidden');
  refreshRosterInfo();
  $('#btnPlay').onclick = function () { Snd.click(); if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); };
  $('#btnHelp').onclick = function () { Snd.click(); openHelp(); };
  $('#btnBackHome').onclick = function () { show('scrStart'); };
  $('#btnImportExcel').onclick = function () { $('#fileExcel').click(); };
  $('#fileExcel').onchange = function (e) { if (e.target.files[0]) importStudentsFromExcel(e.target.files[0]); e.target.value = ''; };
  $('#btnImportWord').onclick = function () { $('#fileWord').click(); };
  $('#fileWord').onchange = function (e) { if (e.target.files[0]) importQuestionsFromWord(e.target.files[0]); e.target.value = ''; };
  $('#btnMakeMatch').onclick = function () {
    var names = $('#setStudents').value.split('\n').map(function (s) { return s.split('\t')[0].trim(); }).filter(Boolean);
    if (names.length >= 2) S.students = names.map(function (n, i) { return { id: 's' + i, name: n }; });
    var qs = effectiveBank();
    S.questions = qs; // ngân hàng Word (kèm ảnh) + câu hỏi gõ tay
    save(); refreshRosterInfo();
    var cfg = readCfg();
    if (S.students.length < cfg.teams) { toast('Số học sinh ít hơn số đội!'); return; }
    if (!buildMatch(cfg)) return;
    Snd.team(); renderLobby(); show('scrLobby');
  };
  $('#btnNewMatch').onclick = function () { if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); };
  $('#btnAgain').onclick = function () { if (CFG.trial) { startTrialMatch(); return; } show('scrSetup'); prefillSetup(); };
  $('#btnHome2').onclick = function () { show('scrStart'); };
  $('#btnResults').onclick = function () { Snd.click(); showResults(); };
  $('#btnPickCancel').onclick = hidePick;
  $('#btnShoot').onclick = function (e) { e.stopPropagation(); doShoot(); };
  cv.addEventListener('pointerdown', function (e) {
    if (SH.phase !== 'aim' || SH.done) return;
    if (M && M.cfg.bowMode === 'fixed') { aimFixed(e); return; }
    doShoot();
  });
  cv.addEventListener('pointermove', function (e) {
    if (M && M.cfg.bowMode === 'fixed' && SH.phase === 'aim' && !SH.done) aimFixed(e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !$('#scrShoot').classList.contains('hidden')) { e.preventDefault(); doShoot(); }
  });
  lastT = performance.now();
  requestAnimationFrame(frame);
}
/* Hook kiểm thử */
window.__BCT = { CFG: CFG, getS: function () { return S; }, buildMatch: buildMatch, splitTeams: splitTeams,
  dealPacks: dealPacks, wheelSlotAt: wheelSlotAt, rankTeams: rankTeams, resolveWheelHit: resolveWheelHit,
  startTrialMatch: startTrialMatch, askQuestion: askQuestion, startShoot: startShoot, doShoot: doShoot,
  showResults: showResults, answerQuiz: answerQuiz, openHelp: openHelp, aimFixed: aimFixed,
  afterQuestion: afterQuestion, teamPack: teamPack, parseStudentRows: parseStudentRows,
  parseWordQuestions: parseWordQuestions, showQuestion: showQuestion, showOption: showOption,
  effectiveBank: effectiveBank,
  getRICHQ: function () { return RICHQ; }, setRICHQ: function (q) { RICHQ = q; },
  getM: function () { return M; }, SH: SH, WHEEL_SLOTS: WHEEL_SLOTS };
document.addEventListener('DOMContentLoaded', init);
