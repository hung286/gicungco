const $ = s => document.querySelector(s);
const view = $('#view');
const SRC = '<!doctype html>\n' + document.documentElement.outerHTML;
const BANK_EL = $('#bank');
const KEY = 'dotrian3:' + BANK_EL.dataset.id;
const DEFAULT_TXT = BANK_EL.textContent.trim();
const COLORS = ['#d81a2a', '#1a6ad8', '#e08a00', '#2f9a4a'];
const CHANG = [
  { k: 1, ic: '⛵', name: 'Thuyền Giấy Lời Chúc', short: 'Thuyền giấy' },
  { k: 2, ic: '🖼️', name: 'Bức Tranh Kí Ức', short: 'Bức tranh' },
  { k: 3, ic: '🌷', name: 'Vườn Hoa Tri Ân', short: 'Vườn hoa' }
];

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Toán $...$ bằng KaTeX khi có (../katex/), không có thì hiện chữ thường đã bỏ dấu $. */
const M = s => {
  const parts = [];
  const txt = String(s ?? '').replace(/\$([^$]+)\$/g, function(_, tex){ parts.push(tex); return '\u0001' + (parts.length - 1) + '\u0002'; });
  const html = esc(txt)
    .replace(/\{([^{}\/]+)\/([^{}\/]+)\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>')
    .replace(/\^([0-9a-zA-Z]+)/g, '<sup>$1</sup>');
  return html.replace(/\u0001(\d+)\u0002/g, function(_, i){
    const tex = parts[+i];
    if (window.katex){ try { return katex.renderToString(tex, { throwOnError: false }); } catch (e){} }
    return esc(tex);
  });
};
const nrm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'D').toUpperCase().replace(/\s+/g, ' ').trim();
const slug = s => nrm(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'game';
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; };
function lsGet(k) { try { return localStorage.getItem(KEY + ':' + k); } catch (e) { return null; } }
function lsSet(k, v) { try { v == null ? localStorage.removeItem(KEY + ':' + k) : localStorage.setItem(KEY + ':' + k, v); return true; } catch (e) { return false; } }
/* Ván chơi chỉ lưu ở sessionStorage: F5 trong cùng tab vẫn giữ ván, đóng tab/trình duyệt là mất (reset game).
   Bộ câu hỏi ('bank') và ảnh ('assets') vẫn ở localStorage để khỏi nhập lại. */
function ssGet(k) { try { return sessionStorage.getItem(KEY + ':' + k); } catch (e) { return null; } }
function ssSet(k, v) { try { v == null ? sessionStorage.removeItem(KEY + ':' + k) : sessionStorage.setItem(KEY + ':' + k, v); return true; } catch (e) { return false; } }

/* =====================================================================
   ĐỌC BỘ CÂU HỎI
   ===================================================================== */
const INFO_FIELDS = [
  ['Tiêu đề dòng 1', 'Chuyến Đò'], ['Tiêu đề dòng 2', 'Tri Ân'], ['Khẩu hiệu', 'Mừng Ngày Nhà giáo Việt Nam 20/11'],
  ['Môn/lớp', ''], ['Bài', ''],
  ['Tên đội', 'Tổ 1 | Tổ 2', 'Ngăn cách bằng dấu |, từ 2 đến 4 đội'],
  ['Giây mỗi câu', '10'],
  ['Lời chúc thuyền giấy', 'Chúc thầy cô / luôn mạnh khỏe / và hạnh phúc, / mãi giữ ngọn lửa / yêu nghề, / dìu dắt chúng em / vững bước / trên con đường tri thức', 'Chặng 1: chia lời chúc bằng dấu /, mỗi phần nằm trên một chiếc thuyền giấy (4 đến 12 phần)', 1],
  ['Từ khóa bức tranh', 'NGƯỜI LÁI ĐÒ', 'Chặng 2: từ khóa học sinh phải đoán, tối đa 16 chữ cái'],
  ['Câu chuyện bức tranh', '', 'Chặng 2: câu chuyện hiện ra khi đoán đúng bức tranh', 1],
  ['Thư sau chặng 1', '', 'Lá thư tri ân hiện khi kết thúc chặng 1', 1],
  ['Thư sau chặng 2', '', 'Lá thư tri ân hiện khi kết thúc chặng 2', 1],
  ['Kính gửi', 'Kính gửi các thầy cô giáo', 'Dòng đầu tấm thiệp cuối trò chơi'],
  ['Lời chúc trên thiệp', 'Chúc thầy cô luôn mạnh khỏe, hạnh phúc!', '', 1],
  ['Lớp tặng', 'Tập thể lớp', 'Ví dụ: Tập thể lớp 3A']
];
const SECS = [['CHANG 1', 'CHẶNG 1'], ['CHANG 2', 'CHẶNG 2'], ['CHANG 3', 'CHẶNG 3']];
function kv(t) { const i = t.indexOf(':'); return i < 0 ? [null, t] : [t.slice(0, i).trim(), t.slice(i + 1).trim()]; }
const bars = v => String(v || '').split('|').map(x => x.trim()).filter(Boolean);
function splitSecs(txt) {
  const out = [{ name: '', lines: [] }];
  String(txt).replace(/^﻿/, '').split(/\r?\n/).forEach(raw => {
    const m = raw.trim().match(/^\[(.+)\]$/);
    if (m) out.push({ name: m[1].trim(), lines: [] }); else out[out.length - 1].lines.push(raw);
  });
  return out;
}
function parseMC(t) {
  const f = t.split('|').map(x => x.trim());
  if (f.length < 4) return { err: 'cần ít nhất "Câu hỏi | A | B | Đáp án"' };
  if (!f[0]) return { err: 'thiếu nội dung câu hỏi' };
  let o, a, rest;
  for (let i = Math.min(5, f.length - 1); i >= 3; i--) if (/^[A-D]$/i.test(f[i])) { o = f.slice(1, i); a = 'ABCD'.indexOf(f[i].toUpperCase()); rest = f.slice(i + 1); break; } // quét ngược: đáp án là chữ đơn cuối, phương án 1 chữ cái không bị nhận nhầm
  if (!o) return { err: 'không thấy đáp án đúng (ghi A, B, C hoặc D ngay sau các phương án)' };
  if (a >= o.length) return { err: `đáp án là ${'ABCD'[a]} nhưng chỉ có ${o.length} phương án` };
  if (o.some(x => !x)) return { err: 'có phương án bị bỏ trống' };
  if (new Set(o.map(nrm)).size < o.length) return { err: 'có hai phương án giống nhau' };
  return { q: f[0], o, a, s: rest[0] || '', v: parseInt(rest[1]) || 0 };
}
function parseBank(txt) {
  const E = [], err = (sec, msg) => E.push({ sec: nrm(sec), msg: `[${sec}] ${msg}` });
  const B = { info: {}, c: { 1: [], 2: [], 3: [] } };
  splitSecs(txt).forEach(s => {
    const N = nrm(s.name), L = s.lines.map(t => t.trim()).filter(t => t && !t.startsWith('#'));
    if (!s.name) return;
    if (N === 'THONG TIN') L.forEach(t => { const [k, v] = kv(t); if (k == null) err(s.name, `dòng "${t.slice(0, 40)}" thiếu dấu ":"`); else B.info[nrm(k)] = v; });
    else if (/^CHANG [123]$/.test(N)) { const k = +N.slice(-1); L.forEach((t, i) => { const r = parseMC(t); r.err ? err(s.name, `Câu ${i + 1}: ${r.err}`) : B.c[k].push(r); }); }
    else err(s.name, 'không nhận ra phần này (tên phần phải là [THÔNG TIN], [CHẶNG 1], [CHẶNG 2] hoặc [CHẶNG 3])');
  });
  const I = k => B.info[nrm(k)] ?? INFO_FIELDS.find(x => x[0] === k)[1];
  const teams = bars(I('Tên đội'));
  if (teams.length < 2 || teams.length > 4) err('THÔNG TIN', 'Tên đội: cần từ 2 đến 4 đội, ngăn cách bằng dấu |');
  const parts = String(I('Lời chúc thuyền giấy')).split('/').map(x => x.trim()).filter(Boolean);
  if (parts.length < 4 || parts.length > 12) err('THÔNG TIN', 'Lời chúc thuyền giấy: cần từ 4 đến 12 phần, ngăn cách bằng dấu /');
  const kw = String(I('Từ khóa bức tranh')).toUpperCase().trim();
  if (!kw || kw.replace(/\s/g, '').length > 16) err('THÔNG TIN', 'Từ khóa bức tranh: cần có, tối đa 16 chữ cái');
  /* cảnh báo: câu hỏi chặng 2 chứa nguyên từ khóa thì học sinh đoán ra ngay */
  const W = [], kwN = nrm(kw);
  if (kwN) B.c[2].forEach((q, i) => { if (nrm([q.q, ...q.o, q.s].join(' ')).includes(kwN)) W.push(`[CHẶNG 2] Câu ${i + 1} có chứa từ khóa "${kw}" (trong câu hỏi, phương án hoặc lời giải), học sinh sẽ đoán ra ngay. Nên đổi câu này.`); });
  if (kwN && nrm(parts.join(' ')).includes(kwN)) W.push(`[THÔNG TIN] "Lời chúc thuyền giấy" (chặng 1, chơi trước chặng 2) có chứa từ khóa "${kw}". Nên đổi lời chúc.`);
  if (kwN) B.c[1].forEach((q, i) => { if (nrm([q.q, ...q.o, q.s].join(' ')).includes(kwN)) W.push(`[CHẶNG 1] Câu ${i + 1} có chứa từ khóa "${kw}", chặng 1 chơi trước nên sẽ lộ đáp án chặng 2.`); });
  B.warn = W;
  if (B.c[1].length < 1) err('CHẶNG 1', 'cần ít nhất 1 câu hỏi');
  if (B.c[2].length < 4) err('CHẶNG 2', 'cần ít nhất 4 câu hỏi để lật tranh');
  if (B.c[3].length < 3) err('CHẶNG 3', 'cần ít nhất 3 câu hỏi (hoa là gói điểm: mỗi bông hoa lấy ngẫu nhiên một câu chưa hỏi trong bộ câu cùng mức điểm)');
  B.c[3].forEach((q, i) => { if (![10, 20, 30].includes(q.v)) q.v = [10, 20, 30][Math.min(2, Math.floor(i * 3 / B.c[3].length))]; });
  B.meta = {
    t1: I('Tiêu đề dòng 1'), t2: I('Tiêu đề dòng 2'), slogan: I('Khẩu hiệu'), tag: I('Môn/lớp'), lesson: I('Bài'),
    teams: teams.length >= 2 ? teams.slice(0, 4) : ['Tổ 1', 'Tổ 2'], sec: Math.max(5, parseInt(I('Giây mỗi câu')) || 10),
    parts: parts.length >= 4 ? parts.slice(0, 12) : ['Chúc thầy cô', 'luôn mạnh khỏe', 'và hạnh phúc', 'mãi yêu nghề'],
    kw: kw || 'NGƯỜI LÁI ĐÒ', story: I('Câu chuyện bức tranh'), letters: [I('Thư sau chặng 1'), I('Thư sau chặng 2')],
    to: I('Kính gửi'), wish: I('Lời chúc trên thiệp'), from: I('Lớp tặng')
  };
  return { B, E };
}
let INFO, Q, BANK_TXT;
function applyBank(txt, B) { BANK_TXT = txt; INFO = B.meta; Q = B.c; document.title = INFO.t1 + ' ' + INFO.t2; }
{
  let txt = lsGet('bank') || DEFAULT_TXT, P = parseBank(txt);
  if (P.E.length && txt !== DEFAULT_TXT) { txt = DEFAULT_TXT; P = parseBank(txt); }
  applyBank(txt, P.B);
}

/* =====================================================================
   HÌNH ẢNH 3D: ảnh nạp trên máy > ảnh nhúng trong file > hình vẽ sẵn
   ===================================================================== */
const ASSET_SLOTS = [
  { k: 'bg1', name: 'Nền màn mở đầu (bến đò)', ratio: '16:9', bg: true,
    p: 'Một bến đò làng quê Việt Nam buổi sáng đẹp trời, dòng sông xanh hiền hòa, lũy tre và cây đa bên bờ, một mái trường tiểu học nhỏ mái ngói đỏ ven sông, trước sân trường có cột cờ với lá cờ đỏ sao vàng tung bay, vài khóm hoa sen hồng trên mặt nước, nắng vàng ấm áp. Phần giữa phía trên là bầu trời thoáng để đặt tên trò chơi. Không có người.' },
  { k: 'bg2', name: 'Nền dòng sông (chặng 1, 3)', ratio: '16:9', bg: true,
    p: 'Một dòng sông quê Việt Nam rộng và hiền hòa trải dài, mặt nước xanh trong lấp lánh có nhiều lá sen và hoa sen, hai bên bờ là lũy tre xanh và cánh đồng lúa, xa xa có mái trường nhỏ với lá cờ đỏ sao vàng. Phần trên và giữa bức ảnh đơn giản, sáng sủa. Không có người, không có thuyền.' },
  { k: 'pic', name: 'Bức tranh kí ức (chặng 2)', ratio: '16:9', bg: true,
    p: 'Một cô giáo vùng cao Việt Nam mặc áo dài đang chèo chiếc đò gỗ nhỏ đưa các em học sinh quàng khăn quàng đỏ qua dòng sông buổi sớm có sương mỏng, các em ôm cặp sách mỉm cười, núi non xanh phía xa, ánh bình minh ấm áp, cảnh xúc động và ý nghĩa.' },
  { k: 'bg3', name: 'Nền kết thúc (sân trường 20/11)', ratio: '16:9', bg: true,
    p: 'Sân trường tiểu học Việt Nam trong ngày lễ 20/11, cột cờ với lá cờ đỏ sao vàng, cờ đuôi nheo đỏ vàng, bóng bay nhiều màu, hoa tươi, cây phượng, ánh nắng rực rỡ, không khí vui tươi. Phần giữa để trống, sáng sủa. Không có người, không có chữ.' },
  { k: 'co', name: 'Cô giáo áo dài', ratio: '2:3',
    p: 'Một cô giáo Việt Nam trẻ, hiền hậu, mặc áo dài truyền thống màu trắng tinh khôi có họa tiết hoa sen nhẹ, tóc dài đen, tay ôm bó hoa và cuốn sách, mỉm cười trìu mến, đứng toàn thân hơi nghiêng về bên trái. Toàn thân từ đầu đến chân, không bị cắt. Nền trắng trơn.' },
  { k: 'do', name: 'Đò chở học sinh', ratio: '4:3',
    p: 'Một chiếc đò gỗ nhỏ của làng quê Việt Nam nhìn nghiêng, mũi đò hướng sang phải, trên đò có hai học sinh tiểu học dễ thương mặc áo sơ mi trắng, quàng khăn quàng đỏ, một bạn trai cầm mái chèo đang chèo, một bạn gái ôm bó hoa tươi và tấm thiệp, cắm một lá cờ đỏ sao vàng nhỏ ở mũi đò. Toàn bộ chiếc đò và hai bạn, không bị cắt, không có nước. Nền trắng trơn.' }
];
const ASSET_STYLE = 'Phong cách hoạt hình 3D kiểu phim Pixar, màu sắc tươi sáng ấm áp, ánh sáng đẹp, chi tiết sắc nét, chất lượng cao. Không có chữ, không có logo, không có khung viền.';
let EMB = {}; try { EMB = JSON.parse($('#assets').textContent || '{}'); } catch (e) {}
let LOCAL = {}; try { LOCAL = JSON.parse(lsGet('assets') || '{}'); } catch (e) {}
const A = {};
function loadAssets() {
  return Promise.all(ASSET_SLOTS.map(sl => new Promise(res => {
    const srcs = [LOCAL[sl.k], EMB[sl.k]].filter(Boolean);
    const tryNext = () => {
      if (!srcs.length) { delete A[sl.k]; return res(); }
      const src = srcs.shift(), im = new Image();
      im.onload = () => { A[sl.k] = src; res(); }; im.onerror = tryNext; im.src = src;
    };
    tryNext();
  })));
}

/* =====================================================================
   TIẾN ĐỘ CHƠI
   ===================================================================== */
function fresh(cfg) {
  const c = { on: [true, true, true], sec: null, ...(cfg || {}) }, names = c.teams && c.teams.length >= 2 ? c.teams : INFO.teams;
  const kwIdx = [...INFO.kw].map((ch, i) => ch.trim() ? i : -1).filter(i => i >= 0);
  return {
    sig: hash(BANK_TXT), sound: true, screen: 'title', cfg: c, spun: false, end: false,
    order: [1, 2, 3].filter((k, i) => c.on[i]), st: 0, phase: 'intro',
    teams: names.map((n, i) => ({ n, c: COLORS[i % 4], s: 0, thu: false })), active: 0,
    c1: { done: {}, qmap: shuffle(INFO.parts.map((_, i) => i % Q[1].length)) },
    c2: { open: [], qi: 0, choose: null, solved: null, ban: [], hints: shuffle(kwIdx), qs: shuffle(Q[2].map((_, i) => i)) },
    c3: buildC3()
  };
}
/* Chặng 3: hoa là "gói điểm" — mỗi bông hoa mang một mức điểm (10/20/30).
   Khi chọn hoa, lấy ngẫu nhiên một câu chưa hỏi trong bộ câu cùng mức điểm
   (mỗi mức tối đa 3 bông hoa, ít hơn nếu không đủ câu). */
function buildC3(){
  const flowers = [];
  [10, 20, 30].forEach(function(v){
    const n = Q[3].filter(function(q){ return q.v === v; }).length;
    for (let k = 0; k < Math.min(3, n); k++) flowers.push({ v: v });
  });
  const pool = { 10: [], 20: [], 30: [] };
  Q[3].forEach(function(q, i){ if (pool[q.v]) pool[q.v].push(i); });
  Object.keys(pool).forEach(function(v){ pool[v] = shuffle(pool[v]); });
  return { used: {}, luck: flowers.length ? (Math.random() * flowers.length | 0) : 0, flowers: flowers, pool: pool };
}
let S = fresh();
try { lsSet('state', null); } catch (e) {} /* ván cũ lưu localStorage từ bản trước: xoá 1 lần để không bao giờ khôi phục lại */
try { const sv = JSON.parse(ssGet('state')); if (sv && sv.sig === S.sig) S = Object.assign(fresh(sv.cfg), sv); else if (sv) S.sound = sv.sound !== false; } catch (e) {}
if (!S.c3 || !Array.isArray(S.c3.flowers)) S.c3 = buildC3(); // bản lưu cũ chưa có hoa/gói điểm
function save() { ssSet('state', JSON.stringify(S)); }
const SEC = () => S.cfg.sec || INFO.sec;
const curK = () => S.order[S.st];
const nextTeam = () => { S.active = (S.active + 1) % S.teams.length; };

/* =====================================================================
   ÂM THANH: hiệu ứng + giọng đọc + nhạc nền ngũ cung
   ===================================================================== */
let AC;
function ac() { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'triangle', vol = .2, at = 0, f2) {
  if (!S.sound) return;
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}
const SFX = {
  click: () => tone(880, .06),
  ting: () => { tone(1568, .5, 'sine', .18); tone(2093, .6, 'sine', .1, .08); },
  bloom: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .25, 'sine', .14, .07 * i)),
  splash: () => { tone(300, .35, 'sine', .2, 0, 80); tone(180, .4, 'triangle', .12, .05, 60); },
  tick: () => tone(1250, .04, 'sine', .12),
  bell: () => { tone(523, 1.2, 'sine', .14); tone(784, 1, 'sine', .08, .02); },
  drum: () => [0, .18, .36, .5, .62].forEach((t, i) => tone(i < 3 ? 110 : 140, .15, 'sine', .3, t, 50)),
  flip: () => { tone(600, .12, 'triangle', .15, 0, 1200); tone(1400, .2, 'sine', .1, .1); },
  buzz: () => [880, 1175, 1568].forEach((f, i) => tone(f, .18, 'square', .08, .06 * i)),
  luck: () => [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, .2, 'triangle', .14, .06 * i)),
  win: () => [523, 587, 659, 784, 880, 1047, 880, 1047].forEach((f, i) => tone(f, i === 7 ? .8 : .2, 'triangle', .18, .16 * i)),
  paddle: () => { tone(220, .3, 'sine', .12, 0, 120); tone(200, .3, 'sine', .1, .45, 110); }
};
function sfx(k) { if (S.sound) SFX[k]?.(); }
let VOICE = null;
function pickVoice() { try { VOICE = speechSynthesis.getVoices().find(v => /^vi/i.test(v.lang)) || null; } catch (e) {} }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, rate = 1.02) {
  if (!S.sound || !VOICE) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = VOICE; u.lang = VOICE.lang; u.rate = rate; u.pitch = 1.1; u.onend = u.onerror = () => VTK.duck(false); VTK.duck(true); speechSynthesis.speak(u); } catch (e) {}
}
/* nhạc nền thi đội (VTK): 'vui' khi chơi, 'hoi' khi đồng hồ chạy, tắt khi tắt âm thanh */
let BGM = null;
function bgm(m) { BGM = m; VTK.music(S.sound ? m : null); }
/* nhạc ngũ cung cũ: chỉ chơi khi nhạc VTK đang tắt, tránh hai nhạc chồng nhau */
const MUSIC = { id: 0, step: 0 };
function musicOn() {
  if (MUSIC.id) return;
  const mel = [392, 440, 523, 587, 523, 440, 392, 330, 294, 330, 392, 440, 392, 330, 294, 262];
  MUSIC.id = setInterval(() => {
    if (!S.sound || S.screen !== 'play' || $('#ov') || $('#qm') || VTK.cfg.music) return;
    const f = mel[MUSIC.step++ % mel.length];
    tone(f, .55, 'sine', .035); if (MUSIC.step % 4 === 1) tone(f / 2, 1.5, 'triangle', .028);
  }, 420);
}
function musicOff() { clearInterval(MUSIC.id); MUSIC.id = 0; }

/* ---------- tiện ích ---------- */
function toggleSound() { S.sound = !S.sound; save(); VTK.music(S.sound ? BGM : null); if (!S.sound) try { speechSynthesis.cancel(); } catch (e) {} document.querySelectorAll('.sndb').forEach(b => b.innerHTML = (S.sound ? '🔊' : '🔇') + '<small>ÂM</small>'); }
function toggleFull() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
function toast(msg) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = msg; document.body.appendChild(d);
  setTimeout(() => d.remove(), 2800);
}
function burst(n = 160) {
  const c = $('#fx'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#da251d', '#ffcd00', '#ff7a9a', '#ffffff', '#ff9a3a', '#5ac84a'];
  const P = Array.from({ length: n }, () => ({ x: innerWidth / 2, y: innerHeight * .4, vx: (Math.random() - .5) * 18, vy: -Math.random() * 15 - 4, s: Math.random() * 8 + 6, c: cols[Math.random() * 6 | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .3 }));
  let f = 0;
  (function loop() {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
    if (++f < 170) requestAnimationFrame(loop); else x.clearRect(0, 0, c.width, c.height);
  })();
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function fit() {
  const W = document.documentElement.clientWidth || innerWidth, H = document.documentElement.clientHeight || innerHeight, st = document.documentElement.style;
  const portrait = H > W * 1.1;
  st.setProperty('--r', portrait ? '90deg' : '0deg');
  st.setProperty('--s', portrait ? Math.min(W / 900, H / 1600) : Math.min(W / 1600, H / 900));
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 300)); fit();
(function petals() {
  const c = $('#petals'), x = c.getContext('2d');
  const P = Array.from({ length: 24 }, () => ({ x: Math.random() * 1600, y: Math.random() * 900, r: Math.random() * 6 + 5, v: Math.random() * .6 + .4, a: Math.random() * 6.28, c: ['#ff9ab0', '#ffd0dc', '#fff2a8', '#ff6a7a'][Math.random() * 4 | 0] }));
  (function loop() {
    x.clearRect(0, 0, 1600, 900);
    P.forEach(p => {
      p.y += p.v; p.a += .02; p.x += Math.sin(p.a) * .8; if (p.y > 910) { p.y = -10; p.x = Math.random() * 1600; }
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.globalAlpha = .8; x.beginPath(); x.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.28); x.fill(); x.restore();
    });
    requestAnimationFrame(loop);
  })();
})();
function fxEl(cls, style, html, ms) { const d = document.createElement('div'); d.className = cls; d.setAttribute('style', style || ''); d.innerHTML = html || ''; $('#stage').appendChild(d); setTimeout(() => d.remove(), ms || 1300); return d; }
function popPts(text, sub, x = 700, y = 330) { fxEl('pts', `left:${x}px;top:${y}px`, `${text}${sub ? `<small>${sub}</small>` : ''}`, 1600); }

/* ---------- hình vẽ sẵn ---------- */
function bg(k) {
  const src = A[k] || (k === 'pic' ? A.bg2 : null);
  if (src) return `<img class="bgimg" src="${src}" alt="">`;
  return `<div class="art ${k === 'bg3' ? 'win' : ''}"><div class="bank"></div><div class="water"></div></div>`;
}
function boatSVG() {
  return `<svg viewBox="0 0 460 340" xmlns="http://www.w3.org/2000/svg"><path d="M20 230 Q230 300 440 210 L410 270 Q230 330 50 280Z" fill="#8a5a2a" stroke="#4a2a0a" stroke-width="6"/>
    <line x1="420" y1="215" x2="420" y2="120" stroke="#6a4a2a" stroke-width="6"/><rect x="420" y="120" width="60" height="40" fill="#da251d"/>
    <circle cx="160" cy="120" r="34" fill="#ffd8b8"/><rect x="128" y="152" width="64" height="76" rx="18" fill="#fff"/><path d="M140 156 L160 186 L180 156Z" fill="#da251d"/>
    <circle cx="300" cy="130" r="32" fill="#ffd8b8"/><rect x="270" y="160" width="62" height="70" rx="18" fill="#fff"/><path d="M282 164 L300 192 L318 164Z" fill="#da251d"/></svg>`;
}
function teacherSVG() {
  return `<svg viewBox="0 0 240 420" xmlns="http://www.w3.org/2000/svg"><path d="M80 150 L50 400 L190 400 L160 150Z" fill="#fff" stroke="#e0d8e8" stroke-width="4"/>
    <rect x="80" y="140" width="80" height="120" rx="30" fill="#fff" stroke="#e0d8e8" stroke-width="4"/><circle cx="120" cy="90" r="46" fill="#ffd8b8"/>
    <path d="M72 92 Q74 36 120 36 Q168 36 170 96 L172 220 L154 220 L156 100 Q150 64 120 62 Q90 64 86 100 L88 220 L70 220Z" fill="#1a1010"/></svg>`;
}
function ch(k, style, cls) {
  const inner = A[k] ? `<img src="${A[k]}" alt="">` : { co: teacherSVG, do: boatSVG }[k]();
  return `<div class="char ${cls || ''}" id="ch-${k}" style="${style}">${inner}</div>`;
}
const paperBoat = c => `<svg viewBox="0 0 300 190"><path d="M20 110 L280 110 L230 170 L70 170Z" fill="#fffef6" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="M150 18 L150 110 L60 110Z" fill="#fff6e0" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="M150 18 L240 110 L150 110Z" fill="#ffe8c8" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="M40 176 Q150 196 260 176" stroke="#ffffff" stroke-width="6" fill="none" opacity=".7"/></svg>`;

/* ---------- đội ---------- */
function teamsHTML() {
  return `<div class="teams" id="teams">${S.teams.map((t, i) => `<div class="team ${i === S.active ? 'on' : ''}" style="--c:${t.c}" onclick="setActive(${i})" title="Bấm chọn đội đến lượt · bấm đúp vào tên để đổi tên">
    <span class="tn" ondblclick="rename(${i})">${esc(t.n)}</span><b class="sc" id="sc${i}">${t.s}</b></div>`).join('')}</div>`;
}
function refreshTeams() { const el = $('#teams'); if (el) el.outerHTML = teamsHTML(); }
function setActive(i) { if ($('#qm')) return; S.active = i; save(); refreshTeams(); const h = $('#turnhint'); if (h) h.textContent = h.dataset.tpl.replace('{t}', S.teams[i].n); }
function rename(i) { const n = prompt('Tên đội:', S.teams[i].n); if (n && n.trim()) { S.teams[i].n = n.trim(); save(); refreshTeams(); } }
function addPts(i, v) { S.teams[i].s += v; save(); refreshTeams(); $('#sc' + i)?.classList.add('bump'); }
const turnHint = (tpl, style) => `<div class="hint" id="turnhint" data-tpl="${esc(tpl)}" style="${style}">${esc(tpl.replace('{t}', S.teams[S.active].n))}</div>`;

/* =====================================================================
   MÀN HÌNH
   ===================================================================== */
function go(k) { closeQ(true); closeOv(); S.screen = k; save(); ({ title: rTitle, play: rPlay, end: rEnd })[k](); }
function toolsHTML(style) {
  return `<div class="tools" style="${style}">
    <button class="ibtn" onclick="openEditor()" title="Soạn câu hỏi, lời chúc, hình ảnh">⚙️<small>SOẠN</small></button>
    <button class="ibtn" onclick="showGuide()" title="Hướng dẫn">📘<small>HD</small></button>
    <button class="ibtn sndb" onclick="toggleSound()" title="Âm thanh">${S.sound ? '🔊' : '🔇'}<small>ÂM</small></button>
    ${VTK.musicButton('ibtn')}
    <button class="ibtn" onclick="toggleFull()" title="Toàn màn hình">⛶<small>FULL</small></button></div>`;
}
function rTitle() {
  musicOff(); bgm(null);
  view.innerHTML = `<div class="layer">${bg('bg1')}</div><div class="layer">
    ${INFO.tag || INFO.lesson ? `<div class="subtag">${esc([INFO.tag, INFO.lesson].filter(Boolean).join(' · '))}</div>` : ''}
    <div class="logo"><span class="l1">${esc(INFO.t1)}</span><span class="l2">${esc(INFO.t2)}</span>${INFO.slogan ? `<span class="ribbon">${esc(INFO.slogan)}</span>` : ''}</div>
    ${ch('do', 'left:30px;bottom:30px;width:520px;height:390px', 'bob')}
    ${ch('co', 'right:50px;bottom:20px;width:330px;height:560px', 'sway')}
    <button class="gbtn big pulse" style="position:absolute;left:50%;bottom:120px;transform:translateX(-50%)" onclick="board()">🛶 LÊN ĐÒ</button>
    <button class="gbtn mid gold" style="position:absolute;left:50%;bottom:36px;transform:translateX(-50%);font-size:24px;padding:2px 26px" onclick="openSetup()">🎛️ BẢNG ĐIỀU KHIỂN</button>
    ${toolsHTML('right:20px;top:20px')}
    ${S.spun || S.end ? `<button class="gbtn sm blue" style="position:absolute;left:30px;top:20px" onclick="resetAll()">↺ Chơi lại từ đầu</button>` : ''}
  </div>`;
}
/* ---------- bảng điều khiển ---------- */
let CFG = null;
function openSetup() { sfx('click'); CFG = { on: [...S.cfg.on], sec: SEC(), teams: S.teams.map(t => t.n) }; overlay(setupHTML()); }
function setupHTML() {
  const c = CFG, chip = (on, js, label) => `<button class="chip ${on ? 'on' : ''}" onclick="${js}">${label}</button>`;
  return `<h2>🎛️ Bảng điều khiển</h2><div class="sgrid">
    <div class="wide"><div class="slab">Các chặng sẽ chơi</div><div class="chips">${CHANG.map((x, i) => chip(c.on[i], `CFG.on[${i}]=!CFG.on[${i}];if(!CFG.on.some(Boolean))CFG.on[${i}]=true;rs()`, `${x.ic} Chặng ${x.k}: ${x.name}`)).join('')}</div>
      <div class="snote">Đủ 3 chặng khoảng 30–35 phút. Bỏ bớt chặng nếu tiết học ngắn.</div></div>
    <div><div class="slab">Số đội</div><div class="chips">${[2, 3, 4].map(n => chip(c.teams.length === n, `setTeams(${n})`, n + ' đội')).join('')}</div></div>
    <div><div class="slab">Thời gian mỗi câu</div><div class="chips">${[10, 15, 20, 30].map(n => chip(c.sec === n, `CFG.sec=${n};rs()`, n + ' giây')).join('')}</div></div>
    <div class="wide"><div class="slab">Tên đội</div><div class="chips">${c.teams.map((t, i) => `<input class="sin" value="${esc(t)}" oninput="CFG.teams[${i}]=this.value">`).join('')}</div></div>
  </div><div class="row"><button class="gbtn mid gold" onclick="applySetup()">✨ LƯU, CHƠI VÁN MỚI</button><button class="gbtn mid blue" onclick="closeOv()">Đóng</button></div>
  <p class="snote">Câu hỏi từng chặng, lời chúc, từ khóa bức tranh, tấm thiệp: sửa ở nút ⚙️ SOẠN.</p>`;
}
function rs() { $('#ov .ovcard').innerHTML = setupHTML(); }
function setTeams(n) { const def = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4']; CFG.teams = Array.from({ length: n }, (_, i) => CFG.teams[i] || def[i]); rs(); }
function applySetup() {
  const snd = S.sound; S = fresh({ on: CFG.on, sec: CFG.sec, teams: CFG.teams.map((t, i) => t.trim() || 'Đội ' + (i + 1)) }); S.sound = snd; save();
  closeOv(); sfx('bell'); toast('✨ Đã lưu. Bấm LÊN ĐÒ để bắt đầu!'); rTitle();
}
function board() {
  ac(); sfx('paddle');
  if (S.end) { if (!confirm('Chuyến đò trước đã cập bến. Đi chuyến mới?')) return go('end'); newGame(); }
  if (!S.spun) {
    if (VTK.cfg.spin) return rSpin();
    S.active = 0; S.spun = true; save(); /* vòng quay đã tắt trong 🏆 Thi đội: đội 1 đi trước */
  }
  go('play');
}
/* ---------- vòng quay chọn đội đi trước ---------- */
function rSpin() {
  S.screen = 'title';
  const n = S.teams.length, segN = n * 2, deg = 360 / segN;
  const seg = i => { const a0 = (i * deg - 90) * Math.PI / 180, a1 = ((i + 1) * deg - 90) * Math.PI / 180, r = 100, t = S.teams[i % n];
    return `<path d="M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}Z" fill="${t.c}" stroke="#fff" stroke-width="2.5"/>
      <text transform="rotate(${i * deg + deg / 2 - 90}) translate(64 0)" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="800" fill="#fff" font-family="Baloo 2,sans-serif">${esc(t.n.slice(0, 12))}</text>`; };
  view.innerHTML = `<div class="layer">${bg('bg1')}</div><div class="layer" style="background:rgba(255,248,232,.3)">
    <div class="spintitle">🎡 Vòng quay may mắn · Đội nào đi trước?</div>
    <div class="tbadges">${S.teams.map((t, i) => `<div class="tbadge" id="tb${i}" style="--c:${t.c}">🛶 ${esc(t.n)}</div>`).join('')}</div>
    <div class="wheelbox"><div class="ptr"></div><svg class="wh" id="wh" viewBox="-108 -108 216 216"><circle r="106" fill="#ffcd00" stroke="#c8102e" stroke-width="5"/>${Array.from({ length: segN }, (_, i) => seg(i)).join('')}</svg><div class="hub">🌸</div></div>
    ${ch('co', 'right:40px;bottom:10px;width:300px;height:520px', 'sway')}
    <div class="spinmsg" id="spinmsg"></div>
    <button class="gbtn big pulse" id="spinbtn" style="position:absolute;left:50%;bottom:40px;transform:translateX(-50%)" onclick="spin()">QUAY! 🎡</button>
    ${toolsHTML('right:20px;top:132px')}</div>`;
}
function spin() {
  ac();
  const n = S.teams.length, segN = n * 2, deg = 360 / segN, btn = $('#spinbtn');
  btn.disabled = true; btn.style.visibility = 'hidden';
  const first = Math.random() * n | 0, seg = first + n * (Math.random() * 2 | 0);
  $('#wh').style.transform = `rotate(${360 * 6 - (seg * deg + deg / 2) + (Math.random() - .5) * deg * .6}deg)`;
  let d = 45, t = 0; (function tick() { tone(1100, .03, 'square', .07); t += d; d *= 1.09; if (t < 4300) setTimeout(tick, d); })();
  setTimeout(() => {
    sfx('win'); burst(100);
    S.teams.forEach((_, i) => $('#tb' + i)?.classList.add(i === first ? 'win' : 'lose'));
    $('#spinmsg').textContent = `🎉 ${S.teams[first].n} được đi trước!`;
    say(`${S.teams[first].n} được đi trước!`);
    S.active = first; S.spun = true; save();
    btn.textContent = '🛶 LÊN ĐÒ'; btn.onclick = () => go('play'); btn.disabled = false; btn.style.visibility = 'visible';
  }, 4750);
}

/* ---------- khung chặng ---------- */
function mapHTML() {
  return `<div class="map"><div class="river"></div>${S.order.map((k, i) => { const c = CHANG[k - 1], x = (i + .5) / S.order.length;
    return `<div class="ben ${i === S.st ? 'cur' : ''}" style="left:calc(30px + ${x} * (100% - 60px))"><i>${c.ic}</i>Chặng ${i + 1}<br>${c.short}</div>`; }).join('')}
    <div class="boat" style="left:calc(30px + ${(S.st + .5) / S.order.length} * (100% - 60px));top:14px;margin-left:-92px">🛶</div></div>`;
}
function hudHTML() { return `<div class="hud"><button class="ibtn" onclick="go('title')" title="Về màn chính">🏠<small>HOME</small></button>${teamsHTML()}${mapHTML()}${toolsHTML('position:static;transform:scale(.85);transform-origin:right center')}</div>`; }
const RULES = {
  1: `Trên sông có <b>{n} chiếc thuyền giấy</b>, mỗi chiếc chở một câu hỏi và một mảnh lời chúc.<br>Đội đến lượt chọn một chiếc thuyền. Trả lời đúng <b>+10 điểm</b>, mảnh lời chúc mang màu của đội được ghép vào câu chúc chung. Sai thì đội khác được <b>giành quyền</b>.<br>Ghép xong, cả lớp cùng đọc to lời chúc tặng thầy cô!`,
  2: `Một <b>bức tranh kí ức</b> đang bị che bởi <b>12 lá sen</b>. Đội trả lời đúng <b>+10 điểm</b> và được <b>tự chọn một lá sen để lật</b>. Cứ lật 3 lá thì lộ thêm một chữ cái gợi ý.<br>Đội nào nghĩ ra <b>từ khóa</b> thì bấm <b>🔔 ĐOÁN TỪ KHÓA</b>. Đoán đúng được <b>10 điểm cho mỗi lá sen còn che</b> (ít nhất 20). Đoán sai thì không được đoán nữa.`,
  3: `Vườn hoa có <b>{n} bông hoa</b> mang 10, 20 hoặc 30 điểm, trong đó giấu một <b>🍀 bông hoa may mắn</b> nhân đôi điểm.<br>Các đội lần lượt chọn hoa. Sai thì đội khác được giành quyền với <b>nửa số điểm</b>.<br>Mỗi đội có một lần <b>💌 Gửi lời tri ân</b>: cả đội đứng lên nói lời cảm ơn thầy cô, được <b>+20 điểm</b>.`
};
function rPlay() {
  if (S.end) return go('end');
  const k = curK();
  musicOn(); bgm('vui');
  if (S.phase === 'intro') return rIntro(k);
  ({ 1: rC1, 2: rC2, 3: rC3 })[k]();
}
function rIntro(k) {
  const c = CHANG[k - 1], n = k === 1 ? INFO.parts.length : Q[3].length;
  view.innerHTML = `<div class="layer">${bg(k === 2 ? 'bg1' : 'bg2')}</div><div class="layer">${hudHTML()}${ch('do', 'left:20px;bottom:20px;width:440px;height:330px', 'bob')}</div>`;
  sfx('drum');
  overlay(`<p class="big">${c.ic}</p><h2>Chặng ${S.st + 1}: ${c.name}</h2><div class="rules">${RULES[k].replace(/\{n\}/g, n)}</div>
    <div class="row"><button class="gbtn mid gold pulse" onclick="S.phase='play';save();closeOv();rPlay()">🚣 BẮT ĐẦU CHẶNG ${S.st + 1}</button></div>`);
  setTimeout(() => say(`Chặng ${S.st + 1}: ${c.name}`), 700);
}
/* lá thư tri ân rồi sang chặng tiếp */
function stageDone() {
  const k = curK(), last = S.st >= S.order.length - 1, letter = INFO.letters[k - 1];
  sfx('bell');
  if (last) return finish();
  overlay(`<p class="big">💌</p><h2>Hoàn thành chặng ${S.st + 1}!</h2>
    ${letter ? `<div class="letter"><div class="wish">“${esc(letter)}”</div></div>` : ''}
    <div class="row"><button class="gbtn mid" onclick="nextStage()">🚣 CHÈO SANG CHẶNG ${S.st + 2}</button></div>`);
  if (letter) setTimeout(() => say(letter, .95), 600);
}
function nextStage() { closeOv(); sfx('paddle'); S.st++; S.phase = 'intro'; nextTeam(); save(); rPlay(); }

/* =====================================================================
   HỘP CÂU HỎI DÙNG CHUNG: hẹn giờ, chấm, giành quyền
   ===================================================================== */
const T = { id: null, left: 0, total: 0, run: false };
let QS0 = null;
function askQ(q, opt) {
  QS0 = { q, opt, team: S.active, phase: 'ask', wrong: [], tried: [] };
  const d = document.createElement('div'); d.className = 'qm'; d.id = 'qm'; $('#stage').appendChild(d);
  drawQ(); T.total = SEC(); T.left = SEC(); ac(); startTimer(); // đồng hồ tự chạy ngay khi hiện câu hỏi (không cần bấm BẮT ĐẦU)
}
function drawQ() {
  const X = QS0, q = X.q, t = S.teams[X.team], one = q.o.some(o => o.length > 24);
  $('#qm').innerHTML = `<div class="panel qcard"><div class="qhead"><span class="qwho" style="--c:${t.c}">${X.phase === 'steal' ? '⚡ ' + esc(t.n) + ' giành quyền' : '🛶 Lượt của ' + esc(t.n)}</span>${X.opt.label ? `<span class="qval">${X.opt.label}</span>` : ''}</div>
    <div class="qtext ${q.q.length > 80 ? 'long' : ''}">${M(q.q)}</div>
    <div class="opts ${one ? 'one' : ''}">${q.o.map((o, k) => `<button class="opt ${X.wrong.includes(k) ? 'wrong' : ''}" id="op${k}" ${X.wrong.includes(k) ? 'disabled' : ''} onclick="pickQ(${k})"><span class="L L${k}">${'ABCD'[k]}</span><span>${M(o)}</span></button>`).join('')}</div>
    <div class="qctrl"><button class="tbtn" id="tbtn" onclick="toggleTimer()">▶ BẮT ĐẦU</button><div class="bar"><div class="fill" id="fill"></div></div><span class="lab" id="flab"></span></div>
    <div class="fb" id="qfb"></div></div>`;
}
function startTimer() {
  stopTimer(); T.run = true; bgm('hoi');
  T.id = setInterval(() => { T.left--; drawCtrl(); if (T.left <= 5 && T.left > 0) sfx('tick'); if (T.left <= 0) { stopTimer(); pickQ(-1); } }, 1000);
  drawCtrl();
}
function stopTimer() { const was = T.run; clearInterval(T.id); T.id = null; T.run = false; if (was) bgm('vui'); }
function toggleTimer() { if (!QS0 || !['ask', 'steal'].includes(QS0.phase)) return; ac(); sfx('click'); if (T.run) { stopTimer(); drawCtrl(); } else if (T.left > 0) startTimer(); }
function drawCtrl() {
  const f = $('#fill'), l = $('#flab'), b = $('#tbtn'); if (!f) return;
  const p = T.left / T.total, done = !QS0 || !['ask', 'steal'].includes(QS0.phase);
  f.style.width = p * 100 + '%'; f.className = 'fill ' + (p <= .25 ? 'low' : p <= .5 ? 'mid' : '');
  l.textContent = `⏳ ${Math.max(0, T.left)} giây`;
  b.style.visibility = done ? 'hidden' : 'visible'; b.className = 'tbtn ' + (T.run ? 'stop' : ''); b.textContent = T.run ? '⏸ DỪNG' : T.left < T.total ? '▶ TIẾP TỤC' : '▶ BẮT ĐẦU';
}
const PRAISE = ['Chính xác!', 'Tuyệt vời!', 'Giỏi quá!', 'Xuất sắc!', 'Thầy cô sẽ rất vui!'];
function pickQ(k) {
  const X = QS0; if (!X || (X.phase !== 'ask' && X.phase !== 'steal')) return;
  ac(); stopTimer();
  const q = X.q;
  if (k === q.a) return qDone(true);
  if (k >= 0) { X.wrong.push(k); $('#op' + k)?.classList.add('wrong'); }
  sfx('splash'); $('#stage').classList.add('rock'); setTimeout(() => $('#stage').classList.remove('rock'), 650);
  X.tried.push(X.team);
  const others = S.teams.map((_, i) => i).filter(i => !X.tried.includes(i));
  if (X.phase === 'ask' && others.length && q.o.length - X.wrong.length > 1) {
    X.phase = 'stealpick'; drawCtrl();
    say(k < 0 ? 'Hết giờ! Đội nào giành quyền?' : 'Chưa đúng rồi! Đội nào giành quyền?');
    $('#qfb').innerHTML = `<span class="no">${k < 0 ? '⏳ Hết giờ!' : '🌊 Chưa đúng!'}</span><div class="steal">Đội giơ tay giành quyền: ${others.map(i => `<button style="--c:${S.teams[i].c}" onclick="steal(${i})">✋ ${esc(S.teams[i].n)}</button>`).join('')}<button style="--c:#8a7a6a" onclick="qDone(false)">Không ai giành, xem đáp án</button></div>`;
    return;
  }
  qDone(false, k < 0);
}
function steal(i) { const X = QS0; sfx('buzz'); X.team = i; X.phase = 'steal'; X.stolen = true; drawQ(); T.total = SEC(); T.left = SEC(); startTimer(); say(`${S.teams[i].n} giành quyền!`); }
function qDone(ok, timeout) {
  const X = QS0, q = X.q; X.phase = 'done'; X.ok = ok; stopTimer();
  document.querySelectorAll('#qm .opt').forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); else if (!X.wrong.includes(j)) b.classList.add('dim'); });
  drawCtrl();
  const gain = ok ? X.opt.points(X.team, !!X.stolen) : 0;
  X.gain = gain;
  if (ok) { sfx('bloom'); setTimeout(() => sfx('ting'), 300); addPts(X.team, gain); popPts(`+${gain}`, X.opt.sub ? X.opt.sub(X.team, !!X.stolen) : esc(S.teams[X.team].n), 560, 260); say(`${PRAISE[Math.random() * PRAISE.length | 0]} ${S.teams[X.team].n} cộng ${gain} điểm!`); }
  else if (!timeout) say('Đáp án đúng là ' + 'ABCD'[q.a]);
  $('#qfb').innerHTML = `<span class="${ok ? 'ok' : 'no'}">${ok ? `🌸 ${esc(S.teams[X.team].n)} trả lời đúng! +${gain} điểm` : `Đáp án đúng là ${'ABCD'[q.a]}`}</span><span class="sol">${q.s ? '💡 ' + M(q.s) : ''}</span>
    <button class="gbtn mid" onclick="closeQ()">TIẾP TỤC ➜</button>`;
}
function closeQ(silent) {
  stopTimer(); const X = QS0; $('#qm')?.remove(); QS0 = null;
  if (!silent) try { speechSynthesis.cancel(); } catch (e) {}
  if (!silent && X && X.phase === 'done') X.opt.done({ ok: X.ok, team: X.team, stolen: !!X.stolen, gain: X.gain });
}

/* =====================================================================
   CHẶNG 1: THUYỀN GIẤY LỜI CHÚC
   ===================================================================== */
function rC1() {
  const D = S.c1, n = INFO.parts.length, cols = n <= 8 ? 4 : n <= 10 ? 5 : 6;
  view.innerHTML = `<div class="layer">${bg('bg2')}</div><div class="layer">${hudHTML()}
    <div class="panel wishbar">${INFO.parts.map((p, i) => { const w = D.done[i]; return `<span class="wpart ${w >= 0 ? 'on' : w === -1 ? 'lost' : ''}" style="--c:${w >= 0 ? S.teams[w].c : '#999'}">${w == null ? '?' : esc(p)}</span>`; }).join('')}</div>
    ${ch('do', 'left:-10px;bottom:10px;width:230px;height:180px', 'bob')}
    <div class="boats" style="grid-template-columns:repeat(${cols},1fr)">${INFO.parts.map((_, i) => `<button class="pboat ${D.done[i] != null ? 'done' : ''}" ${D.done[i] != null ? 'disabled' : ''} onclick="pickBoat(${i})">${paperBoat(D.done[i] >= 0 ? S.teams[D.done[i]].c : '#c8102e')}<b>${i + 1}</b></button>`).join('')}</div>
    ${Object.keys(D.done).length >= n ? `<button class="gbtn big gold pulse" style="position:absolute;left:50%;bottom:30px;transform:translateX(-50%);z-index:13" onclick="c1Read()">📜 ĐỌC LỜI CHÚC</button>` : turnHint('👉 {t} chọn một chiếc thuyền giấy', 'left:240px;bottom:16px')}
  </div>`;
}
function pickBoat(i) {
  if (S.c1.done[i] != null || $('#qm')) return;
  sfx('click');
  askQ(Q[1][S.c1.qmap[i]], {
    label: `⛵ Thuyền số ${i + 1}`, points: () => 10,
    done: r => { S.c1.done[i] = r.ok ? r.team : -1; nextTeam(); save(); rC1(); if (r.ok) setTimeout(() => say(INFO.parts[i]), 400); }
  });
}
function c1Read() {
  const full = INFO.parts.join(' ');
  sfx('win'); burst(160);
  overlay(`<p class="big">⛵💌</p><h2>Lời chúc của cả lớp</h2><div class="letter"><div class="wish">“${esc(full)}”</div></div>
    <p>👏 Cả lớp cùng đứng lên đọc to lời chúc tặng thầy cô nhé!</p><div class="row"><button class="gbtn mid gold" onclick="say(INFO.parts.join(' '), .9)">🔊 NGHE ĐỌC</button><button class="gbtn mid" onclick="closeOv();stageDone()">TIẾP TỤC ➜</button></div>`);
  setTimeout(() => say(full, .9), 800);
}

/* =====================================================================
   CHẶNG 2: BỨC TRANH KÍ ỨC
   ===================================================================== */
const KWLEN = () => [...INFO.kw].filter(c => c.trim()).length;
function hintCount() { return Math.min(Math.floor(S.c2.open.length / 3), Math.max(0, KWLEN() - 2)); }
const guessPts = () => Math.max(20, 10 * (12 - S.c2.open.length));
function rC2() {
  const D = S.c2, allOpen = D.solved != null || D.revealAll;
  const shown = new Set(allOpen ? [...INFO.kw].map((_, i) => i) : D.hints.slice(0, hintCount()));
  const qsLeft = D.qi < D.qs.length, canGuess = !allOpen && S.teams.some((_, i) => !D.ban.includes(i));
  view.innerHTML = `<div class="layer">${bg('bg1')}</div><div class="layer" style="background:rgba(120,10,20,.25)">${hudHTML()}
    <div class="picbox">${bg('pic')}<div class="tiles ${D.choose != null ? 'choose' : ''}">${Array.from({ length: 12 }, (_, i) => `<div class="tile ${allOpen || D.open.includes(i) ? 'open' : ''}" onclick="openTile(${i})">${i + 1}<span>🍃</span></div>`).join('')}</div></div>
    <div class="panel side">
      <h3>🖼️ Bức tranh nói về điều gì?</h3>
      <div class="kw">${[...INFO.kw].map((c, i) => c.trim() ? `<i class="${shown.has(i) ? 'show' : ''}">${shown.has(i) ? esc(c) : ''}</i>` : '<i class="sp"></i>').join('')}</div>
      <div class="tip">${KWLEN()} chữ cái · đã lật ${allOpen ? 12 : D.open.length}/12 lá sen${!allOpen ? `<br>Đoán đúng lúc này được <b style="color:#c8102e">${guessPts()} điểm</b>` : ''}</div>
      ${D.choose != null ? `<div class="tip" style="color:${S.teams[D.choose].c};font-size:24px">👉 ${esc(S.teams[D.choose].n)} chọn một lá sen để lật!</div>`
        : allOpen ? `<button class="gbtn mid gold pulse" onclick="c2Story()">📖 CÂU CHUYỆN BỨC TRANH</button>`
        : qsLeft ? `<button class="gbtn mid" onclick="c2Ask()">🌸 CÂU HỎI TIẾP (${D.qi + 1}/${D.qs.length})</button>${turnHint('Lượt của {t}', 'position:static;color:#4a3a2a;text-shadow:none;text-align:center;font-size:22px')}`
        : `<button class="gbtn mid blue" onclick="S.c2.revealAll=true;save();sfx('flip');rC2()">Hết câu hỏi · MỞ BỨC TRANH</button>`}
      ${canGuess && D.choose == null ? `<button class="gbtn mid gold" onclick="c2Guess()">🔔 ĐOÁN TỪ KHÓA</button>` : ''}
      ${D.ban.length ? `<div class="banned">Hết quyền đoán: ${D.ban.map(i => esc(S.teams[i].n)).join(', ')}</div>` : ''}
    </div></div>`;
}
function c2Ask() {
  const D = S.c2; if (D.qi >= D.qs.length || $('#qm')) return;
  sfx('click');
  askQ(Q[2][D.qs[D.qi]], {
    label: `🖼️ Câu ${D.qi + 1}/${D.qs.length}`, points: () => 10, sub: () => 'ĐƯỢC LẬT MỘT LÁ SEN',
    done: r => { D.qi++; if (r.ok) D.choose = r.team; else nextTeam(); save(); rC2(); if (r.ok) setTimeout(() => say(`${S.teams[r.team].n} chọn một lá sen để lật!`), 300); }
  });
}
function openTile(i) {
  const D = S.c2; if (D.choose == null || D.open.includes(i)) return;
  const before = hintCount();
  D.open.push(i); S.active = D.choose; D.choose = null; nextTeam(); sfx('flip');
  if (D.open.length >= 12) D.revealAll = true;
  save(); rC2();
  if (hintCount() > before && !D.revealAll) setTimeout(() => { sfx('ting'); toast('💡 Lộ thêm một chữ cái gợi ý!'); }, 500);
}
function c2Guess() {
  const D = S.c2; sfx('buzz');
  overlay(`<p class="big">🔔</p><h2>Đội nào đoán từ khóa?</h2><p>Đoán đúng lúc này được <b style="color:#c8102e">${guessPts()} điểm</b>. Đoán sai thì đội đó không được đoán nữa.</p>
    <div class="row">${S.teams.map((t, i) => D.ban.includes(i) ? '' : `<button class="gbtn mid" style="background:${t.c};border-color:#fff" onclick="c2Judge(${i})">✋ ${esc(t.n)}</button>`).join('')}</div>
    <div class="row"><button class="gbtn sm blue" onclick="closeOv()">Đóng</button></div>`);
}
function c2Judge(i) {
  const t = S.teams[i];
  overlay(`<p class="big">🤔</p><h2>${esc(t.n)} trả lời</h2><p>Đội nói to từ khóa. Cô bấm <b>Đúng</b> hoặc <b>Sai</b>.</p>
    <div class="row"><button class="gbtn mid green" onclick="c2Result(${i},true)">✅ ĐÚNG</button><button class="gbtn mid" onclick="c2Result(${i},false)">❌ SAI</button></div>
    <p style="font-size:18px;color:#8a7a6a">Đáp án (rê chuột vào để xem): <span style="filter:blur(7px)" onmouseenter="this.style.filter='none'" onmouseleave="this.style.filter='blur(7px)'">${esc(INFO.kw)}</span></p>`);
}
function c2Result(i, ok) {
  const D = S.c2; closeOv();
  if (ok) {
    const p = guessPts(); D.solved = i; save(); addPts(i, p); sfx('win'); burst(220);
    rC2(); popPts(`+${p}`, `${esc(S.teams[i].n)} ĐOÁN ĐÚNG!`, 380, 300);
    say(`Chính xác! Từ khóa là ${INFO.kw}. ${S.teams[i].n} cộng ${p} điểm!`);
  } else { D.ban.push(i); save(); sfx('splash'); say(`Chưa đúng rồi! ${S.teams[i].n} hết quyền đoán.`); rC2(); }
}
function c2Story() {
  const st = INFO.story;
  overlay(`<p class="big">🖼️</p><h2>${esc(INFO.kw)}</h2>${st ? `<div class="letter"><div class="story">${esc(st)}</div></div>` : ''}
    <div class="row">${st ? `<button class="gbtn mid gold" onclick="say(INFO.story,.95)">🔊 NGHE KỂ</button>` : ''}<button class="gbtn mid" onclick="closeOv();stageDone()">TIẾP TỤC ➜</button></div>`);
  if (st) setTimeout(() => say(st, .95), 700);
}

/* =====================================================================
   CHẶNG 3: VƯỜN HOA TRI ÂN
   ===================================================================== */
const FLOWER = { 10: ['🌼', '#e09000'], 20: ['🌷', '#d8204a'], 30: ['🌹', '#9a0a18'] };
function rC3() {
  const D = S.c3, fl = D.flowers || [], n = fl.length, cols = n <= 9 ? 3 : 4, left = n - Object.keys(D.used).length;
  view.innerHTML = `<div class="layer">${bg('bg2')}</div><div class="layer">${hudHTML()}
    <div class="panel thu"><h3>💌 Gửi lời tri ân</h3><div style="font-size:17px;text-align:center;line-height:1.25">Mỗi đội một lần: cả đội đứng lên nói lời cảm ơn thầy cô, <b>+20 điểm</b></div>
      ${S.teams.map((t, i) => `<button style="--c:${t.c}" ${t.thu ? 'disabled' : ''} onclick="thuTay(${i})">${t.thu ? '✅' : '💌'} ${esc(t.n)}</button>`).join('')}</div>
    <div class="garden" style="grid-template-columns:repeat(${cols},1fr)">${fl.map((f, i) => { const u = D.used[i], [em, c] = FLOWER[f.v];
      return `<button class="fl" style="--c:${c}" ${u ? 'disabled' : ''} onclick="pickFlower(${i})"><span class="em">${u && i === D.luck ? '🍀' : em}</span><span class="pt">${f.v} điểm</span>${u ? `<span class="who" style="background:${u.t >= 0 ? S.teams[u.t].c : '#8a7a6a'}">${u.t >= 0 ? esc(S.teams[u.t].n) : '—'}</span>` : ''}</button>`; }).join('')}</div>
    ${left ? turnHint('👉 {t} chọn một bông hoa', 'left:340px;bottom:6px') : `<button class="gbtn big gold pulse" style="position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:13" onclick="stageDone()">💐 CẬP BẾN TRI ÂN</button>`}
  </div>`;
}
function pickFlower(i) {
  const D = S.c3, fl = D.flowers || [];
  if (D.used[i] || $('#qm') || !fl[i]) return;
  sfx('click');
  const v = fl[i].v;
  if (!D.pool) D.pool = { 10: [], 20: [], 30: [] };
  let qi = (D.pool[v] && D.pool[v].length) ? D.pool[v].pop() : -1;
  if (qi < 0){ // hết câu cùng mức điểm (hiếm) — lấy tạm câu chưa dùng trong vườn
    const rest = Q[3].map(function(q, k){ return k; }).filter(function(k){ return !Object.keys(D.used).some(function(u){ return D.used[u].qi === k; }); });
    qi = rest.length ? rest[Math.random() * rest.length | 0] : -1;
  }
  if (qi < 0) return;
  const q = Q[3][qi], lucky = i === D.luck;
  askQ(q, {
    label: `${FLOWER[v][0]} Bông hoa ${v} điểm`,
    points: (team, stolen) => stolen ? v / 2 : v * (lucky ? 2 : 1),
    sub: (team, stolen) => stolen ? 'GIÀNH QUYỀN · NỬA ĐIỂM' : lucky ? '🍀 BÔNG HOA MAY MẮN x2' : esc(S.teams[team].n),
    done: r => { D.used[i] = { t: r.ok ? r.team : -1, qi: qi }; nextTeam(); save(); rC3(); if (lucky && r.ok && !r.stolen) { sfx('luck'); toast('🍀 Bông hoa may mắn! Điểm nhân đôi!'); } }
  });
}
function thuTay(i) {
  const t = S.teams[i]; if (t.thu) return;
  sfx('bell');
  overlay(`<p class="big">💌</p><h2>${esc(t.n)} gửi lời tri ân</h2><p>Mời cả đội đứng lên, cùng nói một lời cảm ơn hoặc một lời chúc tặng thầy cô.</p>
    <div class="row"><button class="gbtn mid green" onclick="thuDone(${i})">💖 HAY LẮM! +20 ĐIỂM</button><button class="gbtn mid blue" onclick="closeOv()">Để sau</button></div>`);
  say(`Mời ${t.n} gửi lời tri ân tới thầy cô!`);
}
function thuDone(i) { S.teams[i].thu = true; closeOv(); addPts(i, 20); sfx('win'); burst(120); rC3(); popPts('+20', '💌 LỜI TRI ÂN', 560, 300); say('Cảm ơn các con! Cộng 20 điểm!'); }

/* =====================================================================
   KẾT THÚC
   ===================================================================== */
/* câu hỏi phụ khi các đội bằng điểm cao nhất (VTK), trước tấm thiệp tổng kết, mỗi chuyến hỏi 1 lần */
let FINISHING = false;
async function finish() {
  if (FINISHING) return;
  FINISHING = true;
  try {
    if (S.teams.length > 1 && !S.tieDone) {
      const tied = VTK.tiedTop(S.teams.map(t => t.s));
      if (tied.length > 1) {
        S.tieDone = true; save();
        const w = await VTK.tie(S.teams.map(t => ({ name: t.n, color: t.c })), tied);
        if (w != null) addPts(w, 10);
      }
    }
    S.end = true; save(); go('end');
  } finally { FINISHING = false; }
}
function rEnd() {
  musicOff(); bgm(null);
  const rank = [...S.teams].sort((a, b) => b.s - a.s);
  view.innerHTML = `<div class="layer">${bg('bg3')}</div><div class="layer">${ch('co', 'right:20px;bottom:0;width:300px;height:520px', 'sway')}</div>`;
  sfx('win'); burst(280);
  overlay(`<div class="card20"><div class="to">${esc(INFO.to)}</div><div class="msg">${esc(INFO.wish)}</div><div class="from">${esc(INFO.from)} 💐</div></div>
    <div class="rank">${rank.map((t, i) => `<div class="rk" style="--c:${t.c}"><span>${['🥇', '🥈', '🥉', '🎖️'][i]}</span><b>${esc(t.n)}</b><span class="p">${t.s} điểm</span></div>`).join('')}</div>
    <div class="row"><button class="gbtn mid gold" onclick="readWish()">🔊 ĐỌC LỜI CHÚC</button><button class="gbtn mid" onclick="newGame();board()">🛶 CHUYẾN MỚI</button><button class="gbtn mid blue" onclick="go('title')">🏠 MÀN CHÍNH</button></div>`);
  setTimeout(() => say(`Chúc mừng ${rank[0].n} về nhất! ${INFO.to}. ${INFO.wish} ${INFO.from}.`, .92), 1300);
}
function readWish() { say(`${INFO.to}. ${INFO.wish} ${INFO.from}.`, .92); }
function newGame() { const cfg = { ...S.cfg, teams: S.teams.map(t => t.n) }, snd = S.sound; S = fresh(cfg); S.sound = snd; save(); }
function overlay(html) { closeOv(); const d = document.createElement('div'); d.className = 'ov'; d.id = 'ov'; d.innerHTML = `<div class="ovcard">${html}</div>`; $('#stage').appendChild(d); }
function closeOv() { $('#ov')?.remove(); }
function resetAll() { if (!confirm('Xóa điểm và tiến độ để chơi lại từ đầu?')) return; newGame(); go('title'); }
function showGuide() {
  if (T.run) { stopTimer(); drawCtrl(); }
  overlay(`<h2>📘 Hướng dẫn giáo viên</h2><ol>
    <li><b>🎛️ Bảng điều khiển</b>: chọn số đội (2–4), thời gian mỗi câu, bật/tắt từng chặng. <b>⚙️ SOẠN</b>: sửa câu hỏi từng chặng, lời chúc, từ khóa bức tranh, tấm thiệp, hình ảnh.</li>
    <li>Bấm <b>LÊN ĐÒ</b>, quay vòng quay chọn đội đi trước. Các đội lần lượt chơi qua 3 chặng.</li>
    <li>Mỗi câu hỏi: đồng hồ <b>tự chạy ngay</b> khi hiện câu hỏi, bấm <b>⏸ DỪNG</b> để tạm dừng. Sai hoặc hết giờ thì đội khác giơ tay giành quyền.</li>
    <li><b>Chặng 1</b>: chọn thuyền giấy, đúng thì ghép một mảnh lời chúc. <b>Chặng 2</b>: đúng thì tự chọn lá sen để lật tranh, bấm 🔔 để đoán từ khóa. <b>Chặng 3</b>: chọn bông hoa 10/20/30 điểm, có bông hoa may mắn x2 và lời tri ân +20.</li>
    <li>Bấm vào tên đội ở trên để đổi đội đến lượt, bấm đúp để đổi tên.</li>
    <li>Phím tắt trong hộp câu hỏi: <b>A, B, C, D</b> chọn đáp án, <b>Space</b> bắt đầu/dừng, <b>Enter</b> tiếp tục.</li></ol>
    <button class="gbtn mid" onclick="closeOv()">ĐÃ HIỂU</button>`);
}
document.addEventListener('keydown', e => {
  if (ED || /INPUT|TEXTAREA/.test(document.activeElement?.tagName) || $('#vtk-ov')) return;
  if (e.key === 'Escape' && $('#ov')) return closeOv();
  if (!QS0) return;
  const k = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[e.key.toLowerCase()];
  if (k != null && k < QS0.q.o.length && !QS0.wrong.includes(k)) pickQ(k);
  else if (e.key === 'Enter' && QS0.phase === 'done') closeQ();
  else if (e.key === ' ') { e.preventDefault(); toggleTimer(); }
});

/* =====================================================================
   SOẠN CÂU HỎI, LỜI CHÚC VÀ HÌNH ẢNH
   ===================================================================== */
const TABS = [
  { id: 'info', icon: '💌', name: 'Thông tin · Lời chúc', secs: ['THONG TIN'] },
  { id: 'c1', icon: '⛵', name: 'Chặng 1', secs: ['CHANG 1'] },
  { id: 'c2', icon: '🖼️', name: 'Chặng 2', secs: ['CHANG 2'] },
  { id: 'c3', icon: '🌷', name: 'Chặng 3', secs: ['CHANG 3'] },
  { id: 'img', icon: '🎨', name: 'Hình ảnh 3D' },
  { id: 'io', icon: '📦', name: 'ChatGPT · Nhập / Xuất' }
];
let ED = null, LASTF = null;
function fromTxt(t, base) {
  const ed = base ? { ...base, info: { ...base.info }, c: { ...base.c } } : { tab: 'info', info: {}, c: { 1: '', 2: '', 3: '' }, assets: { ...LOCAL } };
  splitSecs(t).forEach(s => {
    if (!s.name) return;
    const N = nrm(s.name);
    if (N === 'THONG TIN') s.lines.forEach(l => { const [k, v] = kv(l.trim()); if (k == null) return; const f = INFO_FIELDS.find(([lab]) => nrm(lab) === nrm(k)); if (f) ed.info[f[0]] = v; });
    else if (/^CHANG [123]$/.test(N)) ed.c[+N.slice(-1)] = s.lines.join('\n').trim();
  });
  return ed;
}
function assemble() {
  return '# Bộ câu hỏi của game. Sửa ngay trong game bằng nút ⚙️ SOẠN.\n[THÔNG TIN]\n'
    + INFO_FIELDS.map(([k]) => k + ': ' + String(ED.info[k] ?? '').replace(/\s*\n\s*/g, ' ').trim()).join('\n')
    + SECS.map(([, label], i) => `\n\n[${label}]\n` + String(ED.c[i + 1] || '').trim()).join('') + '\n';
}
function openEditor() {
  if (T.run) { stopTimer(); drawCtrl(); }
  ED = fromTxt(BANK_TXT); ED.dirty = false;
  const m = document.createElement('div'); m.id = 'editor'; m.className = 'modal ed'; document.body.appendChild(m);
  renderEditor();
}
function closeEditor(force) {
  if (!force && ED && ED.dirty && !confirm('Các thay đổi chưa được lưu. Vẫn đóng?')) return;
  $('#editor')?.remove(); ED = null;
}
function edTab(id) { if (ED.tab === 'info') VTK.readSettings($('#editor')); ED.tab = id; renderEditor(); }
function renderEditor() {
  $('#editor').innerHTML = `<div class="card edcard">
    <div class="edhead"><h2>⚙️ Soạn câu hỏi, lời chúc, hình ảnh</h2><button class="x" onclick="closeEditor()" aria-label="Đóng">✕</button></div>
    <div class="edtabs">${TABS.map(t => `<button id="tb-${t.id}" class="${t.id === ED.tab ? 'on' : ''}" onclick="edTab('${t.id}')">${t.icon} ${t.name}</button>`).join('')}</div>
    <div class="edbody">${edBody()}</div>
    <div class="edfoot"><span id="edstat"></span><button class="sbtn ghost" onclick="closeEditor()">Đóng</button><button class="sbtn" onclick="saveEditor()">💾 Lưu</button></div>
  </div>`;
  edCheck();
}
document.addEventListener('focusin', e => { if (e.target.closest && e.target.closest('#editor') && /TEXTAREA|INPUT/.test(e.target.tagName) && !e.target.readOnly) LASTF = e.target; });
const C_HELP = {
  1: 'Chặng 1, mỗi câu là một chiếc thuyền giấy. Số thuyền bằng số phần của "Lời chúc thuyền giấy"; ít câu hơn thì câu hỏi được dùng lại.',
  2: 'Chặng 2, các câu hỏi để lật 12 lá sen che bức tranh. Nên có 8–12 câu, câu cuối có thể gợi ý dần tới từ khóa.',
  3: 'Chặng 3, hoa là gói điểm: mỗi bông hoa mang 10, 20 hoặc 30 điểm; khi chọn hoa sẽ lấy ngẫu nhiên một câu chưa hỏi trong bộ câu cùng mức điểm. Nhập bao nhiêu câu cũng được (ít nhất 3 câu).'
};
function edBody() {
  const tab = ED.tab;
  if (tab === 'info') return `<div class="fmt">Thông tin chung, lời chúc và từ khóa. Các ô có nhiều chữ được tự gộp thành một dòng khi lưu.</div>
    <div class="fields">${INFO_FIELDS.map(([k, def, tip, big]) => `<label class="fld ${tip || big ? 'wide' : ''}">${k}${tip ? ` <small>${tip}</small>` : ''}
      ${big ? `<textarea data-k="${k}" placeholder="${esc(def)}" oninput="edInfo(this)">${esc(ED.info[k] ?? '')}</textarea>` : `<input data-k="${k}" value="${esc(ED.info[k] ?? '')}" placeholder="${esc(def)}" oninput="edInfo(this)">`}</label>`).join('')}</div>
    ${VTK.settingsHTML()}`;
  if (/^c[123]$/.test(tab)) { const n = +tab[1]; return `<div class="fmt">Mỗi câu một dòng: <code>Câu hỏi | A | B | C | D | Đáp án | Lời giải${n === 3 ? ' | Điểm' : ''}</code>. ${C_HELP[n]}</div>
    <div class="edgrid"><textarea class="src" spellcheck="false" wrap="off" oninput="ED.c[${n}]=this.value;edDirty()">${esc(ED.c[n])}</textarea>
    <div><p class="prevh">👀 Xem trước</p><div class="prev" id="prev"></div></div></div>`; }
  if (tab === 'img') return `<div class="fmt">Thay hình bằng ảnh 3D tạo bằng AI: bấm <b>Copy câu lệnh</b>, dán vào ChatGPT để tạo ảnh, tải ảnh về rồi bấm <b>Chọn ảnh</b>. Ảnh nhân vật nền trắng sẽ được tự xóa nền. Đổi "Bức tranh kí ức" thì nhớ đổi cả từ khóa và câu chuyện ở mục Thông tin.</div>
    <div class="assets">${ASSET_SLOTS.map(sl => { const src = ED.assets[sl.k] || EMB[sl.k] || A[sl.k] || ''; return `<div class="asset">
      <div class="th" style="${src ? `background-image:url('${src}')` : ''}">${src ? '' : 'Đang dùng hình vẽ sẵn'}</div>
      <div><b>${sl.name}</b><small>Tỉ lệ ${sl.ratio}${sl.bg ? '' : ' · nền trắng trơn'}</small>
        <button class="sbtn gold" onclick="copyText(imgPrompt('${sl.k}'),'📋 Đã copy câu lệnh tạo ảnh')">📋 Copy câu lệnh</button>
        <button class="sbtn" onclick="pickImg('${sl.k}')">⬆ Chọn ảnh</button>
        ${ED.assets[sl.k] ? `<button class="sbtn ghost" onclick="delete ED.assets['${sl.k}'];ED.dirty=true;renderEditor()">✕ Bỏ</button>` : ''}</div></div>`; }).join('')}</div>
    <input type="file" id="imgIn" accept="image/*" class="hidden" onchange="loadImg(this)">`;
  return `
    <div class="iobox"><h3>🤖 Nhờ ChatGPT soạn câu hỏi cho cả 3 chặng</h3>
      <ol><li>Điền chủ đề hoặc tên bài, bấm <b>Copy câu lệnh</b>.</li><li>Dán vào ChatGPT (hoặc Gemini), chờ trả lời.</li><li>Copy khối kết quả, dán vào ô bên dưới, bấm <b>Nạp vào game</b>.</li><li>Xem lại đáp án từng chặng (AI có thể sai), rồi bấm <b>Lưu</b>.</li></ol>
      <div class="fields"><label class="fld">Chủ đề / tên bài<input id="gpBai" placeholder="Ví dụ: Tri ân thầy cô 20/11, hoặc Ôn tập Tiếng Việt 4"></label><label class="fld">Môn/lớp<input id="gpLop" value="${esc(ED.info['Môn/lớp'] ?? '')}"></label></div>
      <div style="margin:.7rem 0"><button class="sbtn gold" onclick="copyPrompt()">📋 Copy câu lệnh</button></div>
      <textarea id="gpOut" placeholder="Dán kết quả từ ChatGPT vào đây..."></textarea>
      <button class="sbtn" onclick="loadTxt($('#gpOut').value)">⬆ Nạp vào game</button>
    </div>
    <div class="iobox"><h3>📄 File câu hỏi (.txt)</h3><p>Lưu bộ câu hỏi ra file để cất giữ hoặc nạp lại sau.</p>
      <button class="sbtn ghost" onclick="exportTxt()">⬇ Xuất TXT</button><button class="sbtn ghost" onclick="$('#txtIn').click()">⬆ Nhập TXT</button><input type="file" id="txtIn" accept=".txt,text/plain" class="hidden" onchange="importFile(this)">
    </div>
    <div class="iobox"><h3>📝 File Word (.docx) — Nhập câu hỏi trắc nghiệm</h3><p>Nhập câu hỏi trắc nghiệm từ file Word, chỉ loại A/B/C/D. Chọn chặng cần nhập rồi bấm nút dưới. Mẫu mỗi câu:<br><code>Câu 1. ...<br>A. ... &nbsp; B. ... &nbsp; C. ... &nbsp; D. ...<br>Đáp án: B (hoặc Trả lời: B / Đáp số: B)<br>Điểm: 10</code><br>Điểm chỉ có ý nghĩa ở Chặng 3 (gói 10/20/30); Chặng 1 và Chặng 2 luôn tính 10 điểm/câu. Công thức <code>$...$</code> hiện bằng KaTeX.</p>
      <label style="display:block;margin:.4rem 0">Nhập vào: <select id="wordStage"><option value="1">Chặng 1 — Thuyền giấy</option><option value="2">Chặng 2 — Bức tranh</option><option value="3" selected>Chặng 3 — Vườn hoa</option></select></label>
      <button class="sbtn gold" onclick="$('#wordIn').click()">⬆ Nhập Word (.docx)</button><input type="file" id="wordIn" accept=".docx" class="hidden" onchange="importWordFile(this)">
    </div>
    <div class="iobox"><h3>🎮 Tải file game có sẵn câu hỏi và hình ảnh</h3>
      <p>Tạo một file game mới (.html) chứa sẵn câu hỏi, lời chúc và ảnh 3D đã nạp. Gửi cho đồng nghiệp, mở bằng Chrome/Edge là chơi được, không cần mạng.</p>
      <button class="sbtn gold" onclick="exportHtml()">⬇ Tải file game</button>
    </div>
    <div class="iobox"><h3>↺ Khôi phục</h3><p>Quay về bộ câu hỏi gốc có sẵn trong file (ảnh đã nạp vẫn giữ).</p>
      <button class="sbtn ghost" onclick="restoreDefault()">Khôi phục bộ câu hỏi gốc</button></div>`;
}
function edInfo(el) { ED.info[el.dataset.k] = el.value; edDirty(); }
function edDirty() { ED.dirty = true; clearTimeout(ED.tm); ED.tm = setTimeout(edCheck, 250); }
function edCheck() {
  if (!ED) return;
  const { B, E } = parseBank(assemble()), st = $('#edstat');
  st.className = E.length ? 'bad' : 'ok';
  st.textContent = E.length ? `⚠️ Còn ${E.length} lỗi` : B.warn.length ? `⚠️ ${B.warn.length} câu chặng 2 làm lộ từ khóa (vẫn lưu được)` : `✅ Không có lỗi · chặng 1: ${B.meta.parts.length} thuyền · chặng 2: ${B.c[2].length} câu · chặng 3: ${B.c[3].length} bông hoa`;
  if (!E.length && B.warn.length) st.className = 'bad';
  TABS.forEach(t => { const b = $('#tb-' + t.id); if (b && t.secs) b.classList.toggle('bad', E.some(e => t.secs.includes(e.sec))); });
  const pv = $('#prev'); if (!pv) return;
  const n = +ED.tab[1], sec = SECS[n - 1][0];
  const msgs = [...E.filter(e => e.sec === sec).map(e => e.msg), ...B.warn.filter(w => w.startsWith(`[${SECS[n - 1][1]}]`))];
  pv.innerHTML = (msgs.length ? `<ul class="errs">${msgs.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '')
    + `<ol>${B.c[n].map(q => `<li>${n === 3 ? `<span class="crit">${q.v} điểm</span> ` : ''}<b>${M(q.q)}</b><br>${q.o.map((o, k) => `<span class="${k === q.a ? 'okk' : 'muted'}">${'ABCD'[k]}. ${M(o)}</span>`).join(' &nbsp; ')}${q.s ? `<br><span class="muted">💡 ${M(q.s)}</span>` : ''}</li>`).join('')}</ol>`;
}
function imgPrompt(k) { const sl = ASSET_SLOTS.find(x => x.k === k); return `Tạo một hình ảnh tỉ lệ ${sl.ratio}. ${sl.p} ${ASSET_STYLE}`; }
function copyText(p, msg) {
  const done = () => toast(msg || '📋 Đã copy');
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = p; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(p).then(done, fallback); else fallback();
}
/* xóa nền trắng tinh nối với mép ảnh (giữ áo trắng của nhân vật) */
function cutWhite(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h), p = d.data, seen = new Uint8Array(w * h), st = [];
  const isBg = i => { const r = p[i * 4], g = p[i * 4 + 1], b = p[i * 4 + 2], lo = Math.min(r, g, b); return p[i * 4 + 3] > 0 && lo >= 250 && Math.max(r, g, b) - lo <= 4; };
  for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
  let n = 0;
  while (st.length) {
    const i = st.pop(); if (seen[i] || !isBg(i)) continue; seen[i] = 1; p[i * 4 + 3] = 0; n++;
    const x = i % w; if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w);
  }
  if (n) ctx.putImageData(d, 0, 0);
}
let PICK = null;
function pickImg(k) { PICK = k; $('#imgIn').click(); }
function loadImg(inp) {
  const f = inp.files[0]; inp.value = ''; if (!f) return;
  const sl = ASSET_SLOTS.find(x => x.k === PICK), url = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    const max = sl.bg ? 1600 : 900, sc = Math.min(1, max / Math.max(im.width, im.height));
    const c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
    const ctx = c.getContext('2d'); ctx.drawImage(im, 0, 0, c.width, c.height);
    if (!sl.bg) cutWhite(ctx, c.width, c.height);
    let d = c.toDataURL('image/webp', sl.bg ? .82 : .9);
    if (!d.startsWith('data:image/webp')) d = sl.bg ? c.toDataURL('image/jpeg', .85) : c.toDataURL('image/png');
    ED.assets[sl.k] = d; ED.dirty = true; URL.revokeObjectURL(url); renderEditor(); toast(`Đã nạp ảnh "${sl.name}". Bấm Lưu để dùng`);
  };
  im.onerror = () => toast('Không đọc được ảnh này');
  im.src = url;
}
function saveEditor() {
  const verr = VTK.readSettings($('#editor'));
  if (verr) return toast(verr);
  const txt = assemble(), { B, E } = parseBank(txt);
  if (E.length) { edCheck(); return toast(`Còn ${E.length} lỗi, xem các mục có dấu ⚠️`); }
  const canon = t => t.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')).join('\n');
  lsSet('bank', canon(txt) === canon(DEFAULT_TXT) ? null : txt);
  if (!lsSet('assets', Object.keys(ED.assets).length ? JSON.stringify(ED.assets) : null)) toast('⚠️ Ảnh quá nặng để lưu trên trình duyệt. Hãy dùng Tải file game để giữ ảnh.');
  LOCAL = { ...ED.assets };
  const changed = txt !== BANK_TXT;
  applyBank(txt, B);
  if (changed) newGame();
  closeEditor(true);
  loadAssets().then(() => { go(changed ? 'title' : S.screen); toast('✅ Đã lưu'); });
}
function loadTxt(t) {
  t = String(t || '').replace(/^﻿/, '').replace(/^```[^\n]*\n?|```\s*$/gm, '').trim();
  if (!t) return toast('Chưa có nội dung để nạp');
  if (!/^\s*\[.+\]\s*$/m.test(t)) return toast('Không thấy các phần [CHẶNG 1], [CHẶNG 2], [CHẶNG 3]');
  ED = { ...fromTxt(t, ED), tab: 'c1' }; toast('Đã nạp. Kiểm tra lại từng chặng rồi bấm Lưu');
  ED.dirty = true; renderEditor();
}
/* Nhập câu hỏi Word (chỉ TN A/B/C/D) cho Chặng 3 — mẫu:
   Câu 1. <câu hỏi>
   A. ...  B. ...  C. ...  D. ...
   Đáp án: B  (hoặc Trả lời: B / Đáp số: B)
   Điểm: 10   (10/20/30; thiếu thì mặc định 10)
   Lời giải: ... (không bắt buộc) */
function parseWordMC(text){
  const raw = String(text || '').replace(/\r\n?/g, '\n').split('\n').map(function(x){ return x.trim(); }).filter(Boolean);
  const lines = [];
  raw.forEach(function(line){
    // Tách dòng chứa nhiều phương án trên cùng 1 dòng: "A. x B. y C. z D. w"
    if (/^[A-D]\s*[.:)]/.test(line)){
      const parts = line.split(/\s+(?=[A-D]\s*[.:)])/);
      if (parts.length > 1 && parts.every(function(pt){ return /^[A-D]\s*[.:)]/.test(pt.trim()); })) { parts.forEach(function(pt){ lines.push(pt.trim()); }); return; }
    }
    lines.push(line);
  });
  const out = [], errs = [];
  let cur = null;
  const flush = function(){
    if (!cur) return;
    if (!cur.q) errs.push('Thiếu nội dung câu hỏi');
    else if (cur.o.filter(Boolean).length < 2) errs.push('"' + cur.q.slice(0, 30) + '": cần ít nhất 2 phương án');
    else if (cur.a == null) errs.push('"' + cur.q.slice(0, 30) + '": thiếu đáp án (Đáp án: A/B/C/D)');
    else if (cur.a >= cur.o.length) errs.push('"' + cur.q.slice(0, 30) + '": đáp án ' + 'ABCD'[cur.a] + ' nhưng chỉ có ' + cur.o.length + ' phương án');
    else { if (![10, 20, 30].includes(cur.v)) cur.v = 10; out.push(cur); }
    cur = null;
  };
  lines.forEach(function(line){
    let m;
    if ((m = line.match(/^Câu\s*\d+\s*[.:)]\s*(.*)$/i))){ flush(); cur = { q: m[1], o: [], a: null, s: '', v: 10 }; return; }
    if (!cur) return;
    if ((m = line.match(/^([A-D])\s*[.:)]\s*(.*)$/i))){ cur.o['ABCD'.indexOf(m[1].toUpperCase())] = m[2]; return; }
    if ((m = line.match(/^(?:Đáp án|Trả lời|Đáp số)\s*:\s*([A-D])\b/i))){ cur.a = 'ABCD'.indexOf(m[1].toUpperCase()); return; }
    if ((m = line.match(/^Điểm\s*:\s*(\d+)/i))){ cur.v = parseInt(m[1], 10); return; }
    if ((m = line.match(/^(?:Lời giải|Giải thích)\s*:\s*(.*)$/i))){ cur.s = m[1]; return; }
    if (cur.a != null) cur.s = (cur.s ? cur.s + ' ' : '') + line;
    else if (cur.o.some(Boolean)){ const last = cur.o.length - 1; cur.o[last] = (cur.o[last] || '') + ' ' + line; }
    else cur.q = (cur.q ? cur.q + ' ' : '') + line;
  });
  flush();
  return { qs: out, errs: errs };
}
async function importWordFile(inp){
  const f = inp.files && inp.files[0]; if (!f) return;
  if (!window.mammoth){ toast('Chưa tải được thư viện đọc Word (mammoth). Kiểm tra mạng rồi thử lại.'); inp.value = ''; return; }
  toast('Đang đọc file Word...');
  try {
    const buf = await f.arrayBuffer();
    const res = await mammoth.extractRawText({ arrayBuffer: buf });
    const parsed = parseWordMC(res.value || '');
    if (!parsed.qs.length){ toast('Không đọc được câu hỏi nào. Kiểm tra mẫu: Câu 1. ... / A. ... / Đáp án: B / Điểm: 10'); inp.value = ''; return; }
    const add = parsed.qs.map(function(q){
      const opts = q.o.filter(function(x){ return x != null && x !== ''; });
      return [q.q].concat(opts, ['ABCD'[q.a], q.s || '', q.v]).join(' | ');
    }).join('\n');
    const stage = parseInt((($('#wordStage') || {}).value) || '3', 10) || 3; // nhập Word: chọn chặng đích (mặc định Chặng 3)
    const stageName = { 1: 'Chặng 1 (Thuyền giấy)', 2: 'Chặng 2 (Bức tranh)', 3: 'Chặng 3 (Vườn hoa)' }[stage] || 'Chặng 3 (Vườn hoa)';
    ED.c[stage] = (ED.c[stage] ? ED.c[stage].replace(/\s+$/, '') + '\n' : '') + add;
    ED.dirty = true; edCheck();
    toast('Đã nhập ' + parsed.qs.length + ' câu vào ' + stageName + '.' + (parsed.errs.length ? ' (Bỏ ' + parsed.errs.length + ' câu lỗi — xem mục ' + stageName + '.)' : ''));
    if (parsed.errs.length) console.warn('Word import errors:', parsed.errs);
  } catch (e){ toast('Lỗi đọc file Word: ' + e.message); }
  inp.value = '';
}
function importFile(inp) { const f = inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => loadTxt(rd.result); rd.readAsText(f, 'UTF-8'); inp.value = ''; }
function exportTxt() { download('do-tri-an-' + slug(ED.info['Bài'] || 'cau-hoi') + '.txt', '﻿' + assemble(), 'text/plain;charset=utf-8'); }
async function exportHtml() {
  const txt = assemble(), { E } = parseBank(txt);
  if (E.length) { edCheck(); return toast('Sửa hết lỗi trước khi tải file game'); }
  const id = 'g' + Date.now().toString(36), assets = JSON.stringify({ ...EMB, ...ED.assets }).replace(/</g, '\\u003c');
  if (ED.tab === 'info') VTK.readSettings($('#editor'));
  let html = VTK.embed(SRC
    .replace(/<script id="bank"[^>]*>[\s\S]*?<\/script>/, () => `<script id="bank" type="text/plain" data-id="${id}">\n${txt}\n<\/script>`)
    .replace(/<script id="assets"[^>]*>[\s\S]*?<\/script>/, () => `<script id="assets" type="application/json">${assets}<\/script>`));
  // Gộp file đã tách (CSS/JS) vào 1 file HTML duy nhất để gửi đồng nghiệp (cần mở game qua máy chủ, không mở bằng file://)
  try {
    const get = async function(u){ const r = await fetch(u); if (!r.ok) throw new Error(u); return await r.text(); };
    const escClose = function(t){ return t.replace(/<\//g, '<\\/'); };
    const css = await get('chuyendotrian.css');
    html = html.replace(/<link[^>]*chuyendotrian\.css[^>]*>/, function(){ return '<style>\n' + escClose(css) + '\n</style>'; });
    const vtk = await get('vtk-kit.js');
    html = html.replace(/<script[^>]*vtk-kit\.js[^>]*><\/script>/, function(){ return '<script id="vtk-kit">\n' + escClose(vtk) + '\n</script>'; });
    const js = await get('chuyendotrian.js');
    html = html.replace(/<script[^>]*chuyendotrian\.js[^>]*><\/script>/, function(){ return '<script>\n' + escClose(js) + '\n</script>'; });
    // Bỏ các script SmartEdu (bảo mật/gate, đọc Word, KaTeX) khỏi file tải về — file này chỉ để chơi độc lập
    html = html.replace(/<script[^>]*(?:xlsx|mammoth|katex|smartedu|security|gate)[^>]*><\/script>/g, '');
    html = html.replace(/<link[^>]*katex[^>]*>/g, '');
  } catch (e){ return toast('Không gộp được file (cần mở game qua máy chủ, không mở bằng file://). ' + e.message); }
  download('chuyen-do-tri-an-' + slug(ED.info['Bài'] || ED.info['Môn/lớp'] || 'game').slice(0, 70) + '.html', html, 'text/html;charset=utf-8');
  toast('⬇ Đã tải file game mới');
}
function copyPrompt() {
  const bai = $('#gpBai').value.trim(), lop = $('#gpLop').value.trim();
  if (!bai) { $('#gpBai').focus(); return toast('Nhập chủ đề hoặc tên bài trước'); }
  copyText(`Bạn là giáo viên giỏi, đang soạn câu hỏi cho trò chơi "${ED.info['Tiêu đề dòng 1'] || ''} ${ED.info['Tiêu đề dòng 2'] || ''}" gồm 3 chặng, chào mừng Ngày Nhà giáo Việt Nam 20/11.

Môn/lớp: ${lop || '(ghi môn và lớp)'}
Chủ đề / bài: ${bai}

YÊU CẦU
- [CHẶNG 1] Thuyền giấy lời chúc: 8 câu trắc nghiệm 4 phương án, dễ, khởi động.
- [CHẶNG 2] Bức tranh kí ức: 9 câu trắc nghiệm 4 phương án về chủ đề. TUYỆT ĐỐI không để từ khóa của bức tranh (hoặc cụm từ trùng với từ khóa) xuất hiện trong câu hỏi, phương án hay lời giải, vì học sinh phải tự đoán từ khóa.
- [CHẶNG 3] Vườn hoa tri ân: 9 câu trắc nghiệm 4 phương án, 3 câu 10 điểm (dễ), 3 câu 20 điểm (vừa), 3 câu 30 điểm (khó); ghi điểm ở cột cuối.
- Trong [THÔNG TIN], viết lại: Môn/lớp, Bài, Từ khóa bức tranh (tối đa 16 chữ cái) và Câu chuyện bức tranh (khoảng 60 chữ, xúc động, nói về thầy cô) cho hợp chủ đề; giữ nguyên các dòng khác.
- Phương án ngắn gọn (tối đa 8 từ). Mỗi câu có lời giải ngắn. Không để hai phương án trùng nhau. Đáp án đúng rải đều ở A, B, C, D.
- Tự giải lại và kiểm tra MỌI đáp án trước khi trả lời.

QUY ƯỚC VIẾT
- Mỗi câu nằm trọn trên một dòng: Câu hỏi | A | B | C | D | Đáp án | Lời giải   (chặng 3 thêm: | Điểm)
- Đáp án ghi một chữ A, B, C hoặc D. Dấu | chỉ dùng để ngăn cách các cột.
- Giữ nguyên các tiêu đề [THÔNG TIN], [CHẶNG 1], [CHẶNG 2], [CHẶNG 3] như mẫu.

Chỉ trả về nội dung theo đúng định dạng mẫu dưới đây, đặt trong MỘT khối code, không giải thích thêm.

MẪU ĐỊNH DẠNG (chỉ để tham khảo cách viết):
${assemble()}`, '📋 Đã copy câu lệnh. Dán vào ChatGPT nhé!');
}
function restoreDefault() {
  if (!confirm('Quay về bộ câu hỏi gốc của file?')) return;
  ED = { ...fromTxt(DEFAULT_TXT), assets: ED.assets, tab: 'info', dirty: true }; renderEditor(); toast('Đã nạp bộ gốc. Bấm Lưu để áp dụng');
}

loadAssets().then(() => go(['title', 'play', 'end'].includes(S.screen) ? S.screen : 'title'));
