/* ===== PHÒNG VẼ HÌNH TOÁN 2D · 3D (Học Toán Thông Minh) =====
 * Hình phẳng: dựng hình động (kéo điểm tự do, mọi đối tượng phụ thuộc tự cập nhật) — như GeoGebra/Sketchpad.
 * Hình không gian: hình mẫu SGK, xoay tự do; NÉT ĐỨT/NÉT LIỀN TỰ ĐỘNG bằng thuật toán chiếu tia:
 *   một điểm trên nét bị khuất nếu tia từ điểm đó về phía mắt người nhìn cắt một mặt của khối (hoặc mặt cầu).
 *   Mỗi nét được lấy mẫu dày nên khuất một phần vẫn vẽ đúng (đoạn liền + đoạn đứt).
 * Mọi đối tượng lưu dạng "công thức dựng" (phụ thuộc) nên lưu/mở/hoàn tác chính xác.
 */
(function () {
  'use strict';
  // ------------------------------------------------------------------ toán vectơ
  var sub2 = function (a, b) { return { x: a.x - b.x, y: a.y - b.y }; }, add2 = function (a, b) { return { x: a.x + b.x, y: a.y + b.y }; };
  var mul2 = function (a, k) { return { x: a.x * k, y: a.y * k }; }, dot2 = function (a, b) { return a.x * b.x + a.y * b.y; };
  var cr2 = function (a, b) { return a.x * b.y - a.y * b.x; }, len2 = function (a) { return Math.hypot(a.x, a.y); };
  var rot2 = function (a, t) { var c = Math.cos(t), s = Math.sin(t); return { x: a.x * c - a.y * s, y: a.x * s + a.y * c }; };
  var sub3 = function (a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }, add3 = function (a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; };
  var mul3 = function (a, k) { return { x: a.x * k, y: a.y * k, z: a.z * k }; }, dot3 = function (a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; };
  var cr3 = function (a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; };
  var len3 = function (a) { return Math.hypot(a.x, a.y, a.z); }, unit3 = function (a) { var l = len3(a) || 1; return mul3(a, 1 / l); };
  var P3 = function (x, y, z) { return { x: x, y: y, z: z }; };
  var so = function (x, n) { return (Math.round(x * Math.pow(10, n == null ? 2 : n)) / Math.pow(10, n == null ? 2 : n)).toString().replace('.', ','); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CHI_SO = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  var tenHien = function (s) { return String(s || '').replace(/_(\d+)/g, function (m, d) { return d.split('').map(function (c) { return CHI_SO[c]; }).join(''); }); };

  // ------------------------------------------------------------------ trạng thái
  var MAU = ['#1e1a2e', '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea', '#0891b2', '#db2777'];
  function canhMoi() { return { objs: [], next: 1 }; }
  var S = {
    mode: '2d',
    d2: { sc: canhMoi(), view: { s: 46, ox: 0, oy: 0 }, luoi: true, truc: false, bat: true, kieu: { coTen: 16, coDiem: 1, day: 1, mauTen: '#1e1a2e' } },
    d3: { sc: canhMoi(), view: { yaw: -1.2, pitch: 0.4, s: 70, ox: 0, oy: 0, sgk: true }, luoi: false, truc: false, quay: false, kieu: { coTen: 17, coDiem: 1, day: 1, mauTen: '#1e1a2e' } }
  };
  function K() { return D().kieu; }
  var BUOC = null;   // chế độ trình chiếu các bước vẽ: { k, ds: [{ids, moTa}], hien: {id:1}, moi: {id:1} }
  function hienO(o) { return !o.an && (!BUOC || BUOC.hien[o.id]); }
  var HIST = { '2d': { u: [], r: [] }, '3d': { u: [], r: [] } };
  var VAL = {}, chon = null, cong = { '2d': 'move', '3d': 'xoay' }, picks = [], tam = null, chuot = { x: 0, y: 0 }, keo = null, hover = null;
  var cv = document.getElementById('cv'), g = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  function D() { return S.mode === '3d' ? S.d3 : S.d2; }
  function SC() { return D().sc; }
  function obj(id) { var L = SC().objs; for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  function them(o) { o.id = SC().next++; SC().objs.push(o); return o; }
  function luuLS() { try { localStorage.setItem('vehinh_v1', JSON.stringify({ d2: { sc: S.d2.sc, view: S.d2.view, luoi: S.d2.luoi, truc: S.d2.truc, kieu: S.d2.kieu }, d3: { sc: S.d3.sc, view: S.d3.view, truc: S.d3.truc, luoi: S.d3.luoi, kieu: S.d3.kieu, daVao: S.d3.daVao, toKhoi: S.d3.toKhoi, mauKhoi: S.d3.mauKhoi }, mode: S.mode })); } catch (e) { } }
  function napLS() {
    try {
      var d = JSON.parse(localStorage.getItem('vehinh_v1') || 'null'); if (!d) return false;
      if (d.d2) Object.assign(S.d2, d.d2); if (d.d3) Object.assign(S.d3, d.d3); S.mode = d.mode || '2d';
      if (!(S.d2.view.s > 0)) S.d2.view.s = 46; if (!(S.d3.view.s > 0)) S.d3.view.s = 70;   // sửa tỉ lệ hỏng lưu từ bản cũ
      return true;
    } catch (e) { return false; }
  }
  function ghiLS() { HIST[S.mode].u.push(JSON.stringify(SC())); if (HIST[S.mode].u.length > 120) HIST[S.mode].u.shift(); HIST[S.mode].r = []; }
  function hoanTac(lai) {
    var h = HIST[S.mode], tu = lai ? h.r : h.u, den = lai ? h.u : h.r;
    if (!tu.length) return;
    den.push(JSON.stringify(SC())); D().sc = JSON.parse(tu.pop()); boChon(); picks = []; capNhat();
  }

  // ------------------------------------------------------------------ hộp hỏi
  function hoi(tieuDe, truong, ghiChu) {
    return new Promise(function (ok) {
      $('#hop-t').textContent = tieuDe;
      $('#hop-n').innerHTML = (ghiChu ? '<p>' + ghiChu + '</p>' : '') + truong.map(function (f, i) { return '<p><b>' + esc(f.nhan) + '</b></p><input id="hop-f' + i + '" value="' + esc(f.v == null ? '' : f.v) + '"' + (f.so ? ' inputmode="decimal"' : '') + '>'; }).join('');
      $('#hop').classList.remove('an');
      var o0 = $('#hop-f0'); if (o0) setTimeout(function () { o0.focus(); o0.select(); }, 30);
      var xong = function (v) { $('#hop').classList.add('an'); $('#hop-ok').onclick = $('#hop-huy').onclick = null; ok(v); };
      $('#hop-huy').onclick = function () { xong(null); };
      $('#hop-ok').onclick = function () { xong(truong.map(function (f, i) { return $('#hop-f' + i).value; })); };
      $('#hop-n').onkeydown = function (e) { if (e.key === 'Enter') $('#hop-ok').onclick(); if (e.key === 'Escape') $('#hop-huy').onclick(); };
    });
  }
  function docSo(s) {   // "3", "2,5", "1/3", "sqrt(2)", "2√3"
    s = String(s || '').trim().replace(/,/g, '.').replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)').replace(/sqrt/g, 'Math.sqrt').replace(/(\d)(Math)/g, '$1*$2').replace(/π|pi/g, 'Math.PI');
    if (!/^[\d\s.+\-*/()MathsqrtPI]*$/.test(s)) return NaN;
    try { var v = Function('return (' + s + ')')(); return typeof v === 'number' && isFinite(v) ? v : NaN; } catch (e) { return NaN; }
  }
  function tenMoi(kieu) {
    var dung = {}; SC().objs.forEach(function (o) { if (o.ten) dung[o.ten] = 1; });
    if (kieu === 'diem') {
      var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (var k = 0; k < 9; k++) for (var i = 0; i < CH.length; i++) { var t = CH[i] + (k ? '_' + k : ''); if (!dung[t]) return t; }
    }
    var goc = kieu === 'tron' ? '(C' : 'd', n = 1;
    if (kieu === 'tron') { while (dung['(C_' + n + ')']) n++; return '(C_' + n + ')'; }
    while (dung[goc + '_' + n]) n++; return goc + '_' + n;
  }

  // ================================================================== BIỂU THỨC TOÁN
  // Đọc "x^2 - 2x + 1", "sqrt(x+1)", "2sin(x)", "|x-1|", "ln x", "1/(x-2)" … thành hàm số. Nhân ngầm: 2x, 3(x+1), x sin x.
  var HAM_SO = { sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, cot: function (x) { return 1 / Math.tan(x); }, cotg: function (x) { return 1 / Math.tan(x); },
    sqrt: Math.sqrt, can: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, ln: Math.log, log: Math.log10, lg: Math.log10, exp: Math.exp,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, asin: Math.asin, acos: Math.acos, atan: Math.atan, floor: Math.floor, ceil: Math.ceil };
  var HANG = { pi: Math.PI, e: Math.E };
  var BD_NHO = {};
  function bienDich(chuoi, bien) {   // -> function(x, y) hoặc ném lỗi có lời nhắn tiếng Việt
    var s0 = String(chuoi || '').toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/[×·]/g, '*').replace(/[÷:]/g, '/').replace(/[−–]/g, '-')
      .replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/\*\*/g, '^');
    if (!s0) throw new Error('Chưa nhập biểu thức.');
    var ten = Object.keys(HAM_SO).concat(Object.keys(HANG), bien).sort(function (a, b) { return b.length - a.length; });
    var tk = [], i = 0;
    while (i < s0.length) {
      var ch = s0[i], m = /^(\d+\.?\d*|\.\d+)/.exec(s0.slice(i));
      if (m) { tk.push({ l: 'so', v: parseFloat(m[1]) }); i += m[1].length; continue; }
      if (/[a-z]/.test(ch)) {
        var k = ten.filter(function (t) { return s0.substr(i, t.length) === t; })[0];
        if (!k) throw new Error('Không hiểu "' + s0.slice(i, i + 6) + '" — dùng biến ' + bien.join(', ') + ', hàm sin, cos, tan, sqrt, ln, log, exp, abs, |…|.');
        tk.push(HAM_SO[k] ? { l: 'ham', v: k } : HANG[k] != null ? { l: 'so', v: HANG[k] } : { l: 'bien', v: k }); i += k.length; continue;
      }
      if ('+-*/^()|'.indexOf(ch) >= 0) { tk.push({ l: ch }); i++; continue; }
      throw new Error('Kí tự "' + ch + '" chưa dùng được.');
    }
    var p = 0, trongTri = 0;
    var xem = function () { return tk[p]; }, an = function (l) { if (tk[p] && tk[p].l === l) { p++; return true; } return false; };
    var moDau = function (t) { return t && (t.l === 'so' || t.l === 'bien' || t.l === 'ham' || t.l === '('); };
    var batDauNguyenTo = function (t) { return moDau(t) || (t && t.l === '|' && (!trongTri || moDau(tk[p + 1]))); };   // trong |…|: dấu | mở mới nếu ngay sau là số/biến
    function ghep(op, a, b) {   // mỗi lần ghép tạo hàm mới, không dùng chung biến vòng lặp
      if (op === '+') return function (v) { return a(v) + b(v); };
      if (op === '-') return function (v) { return a(v) - b(v); };
      if (op === '*') return function (v) { return a(v) * b(v); };
      return function (v) { return a(v) / b(v); };
    }
    function bieuThuc() {
      var a = hang();
      for (;;) {
        if (an('+')) a = ghep('+', a, hang());
        else if (an('-')) a = ghep('-', a, hang());
        else return a;
      }
    }
    function hang() {
      var a = moNguyen();
      for (;;) {
        if (an('*')) a = ghep('*', a, moNguyen());
        else if (an('/')) a = ghep('/', a, moNguyen());
        else if (batDauNguyenTo(xem())) a = ghep('*', a, luyThua());
        else return a;
      }
    }
    function moNguyen() {
      if (an('-')) { var a = moNguyen(); return function (v) { return -a(v); }; }
      if (an('+')) return moNguyen();
      return luyThua();
    }
    function luyThua() {
      var a = nguyenTo();
      if (an('^')) { var b = moNguyen(); return function (v) { var x = a(v), y = b(v); if (x < 0 && Math.abs(y - Math.round(y)) > 1e-12) { var q = Math.round(1 / y); if (Math.abs(1 / y - q) < 1e-9 && q % 2) return -Math.pow(-x, y); } return Math.pow(x, y); }; }
      return a;
    }
    function nguyenTo() {
      var t = xem(); if (!t) throw new Error('Biểu thức bị thiếu ở cuối.');
      p++;
      if (t.l === 'so') { var c = t.v; return function () { return c; }; }
      if (t.l === 'bien') { var k = bien.indexOf(t.v); return function (v) { return v[k]; }; }
      if (t.l === 'ham') {
        var fn = HAM_SO[t.v], mu = null;
        if (an('^')) { var mt = moNguyen(); mu = mt; }   // sin^2 x
        var a = xem() && xem().l === '(' ? nguyenTo() : luyThua();
        return mu ? function (v) { return Math.pow(fn(a(v)), mu(v)); } : function (v) { return fn(a(v)); };
      }
      if (t.l === '(') { var e = bieuThuc(); if (!an(')')) throw new Error('Thiếu dấu ")".'); return e; }
      if (t.l === '|') { trongTri++; var g = bieuThuc(); trongTri--; if (!an('|')) throw new Error('Thiếu dấu "|" đóng giá trị tuyệt đối.'); return function (v) { return Math.abs(g(v)); }; }
      throw new Error('Có chỗ chưa đúng gần "' + (t.l || '') + '".');
    }
    var kq = bieuThuc();
    if (p < tk.length) throw new Error('Có chỗ chưa đúng gần "' + (tk[p].l === 'so' ? tk[p].v : tk[p].v || tk[p].l) + '".');
    return function (x, y) { return kq([x, y]); };
  }
  function hamCua(bt) { var k = 'f|' + bt; if (!BD_NHO[k]) BD_NHO[k] = bienDich(bt, ['x']); return BD_NHO[k]; }
  function docBPT(chuoi) {   // "2x + y <= 4" -> { a, b, c, dau } với nghiệm: a·x + b·y + c (dau) 0
    var s0 = String(chuoi || '').replace(/≤|=</g, '<=').replace(/≥|=>/g, '>=');
    var m = /(<=|>=|<|>)/.exec(s0); if (!m) throw new Error('Thiếu dấu <, >, ≤ (<=) hoặc ≥ (>=).');
    var trai = s0.slice(0, m.index), phai = s0.slice(m.index + m[1].length);
    if (/[<>]/.test(phai)) throw new Error('Mỗi bất phương trình chỉ có một dấu so sánh; hệ thì cách nhau bằng dấu ;');
    var L = bienDich(trai || '0', ['x', 'y']), R = bienDich(phai || '0', ['x', 'y']), g = function (x, y) { return L(x, y) - R(x, y); };
    var c = g(0, 0), a = g(1, 0) - c, b = g(0, 1) - c;
    [[2, 3], [-1.5, 4], [5, -2]].forEach(function (q) { if (Math.abs(g(q[0], q[1]) - (a * q[0] + b * q[1] + c)) > 1e-7 * (1 + Math.abs(c) + Math.abs(a) + Math.abs(b))) throw new Error('Chỉ biểu diễn được bất phương trình bậc nhất hai ẩn (dạng ax + by + c < 0).'); });
    if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) throw new Error('Bất phương trình không chứa x, y.');
    return { a: a, b: b, c: c, dau: m[1] };
  }
  function depBT(s) {   // hiển thị đẹp: x^2 -> x², <= -> ≤, * -> ·
    return String(s || '').replace(/\s+/g, ' ').trim().replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/\*/g, '·').replace(/sqrt/g, '√')
      .replace(/\^\(?(-?\d+)\)?/g, function (m0, d) { return d.split('').map(function (c) { return { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }[c]; }).join(''); });
  }
  function mauHam(v) {   // lấy mẫu đồ thị theo bề ngang màn hình -> các đoạn liền (ngắt ở tiệm cận, chỗ không xác định)
    var x0 = tuMH(0, 0).x, x1 = tuMH(W, 0).x;
    if (v.a != null) x0 = Math.max(x0, v.a); if (v.b != null) x1 = Math.min(x1, v.b);
    var runs = [], run = [], buoc = 1.5 / S.d2.view.s, truoc = null;
    if (!(x1 > x0)) return runs;
    var day = function () { if (run.length > 1) runs.push(run); run = []; };
    for (var x = x0; x <= x1 + buoc * 0.5; x += buoc) {
      var xx = Math.min(x, x1), y; try { y = v.f(xx); } catch (e) { y = NaN; }
      if (!isFinite(y)) { day(); truoc = null; continue; }
      var p = toMH({ x: xx, y: y });
      if (truoc && Math.abs(p.y - truoc.y) > H * 1.2) { day(); }
      p.y = Math.max(-2 * H, Math.min(3 * H, p.y));
      run.push(p); truoc = p;
    }
    day();
    return runs;
  }
  function giaoHam(h, v2) {   // giao điểm đồ thị với đường thẳng/đoạn/tia hoặc đồ thị khác: tìm nghiệm số trên khoảng đang xem (rộng gấp 3)
    var x0 = tuMH(0, 0).x, x1 = tuMH(W, 0).x, r = x1 - x0; x0 -= r; x1 += r;
    if (h.a != null) x0 = Math.max(x0, h.a); if (h.b != null) x1 = Math.min(x1, h.b);
    var g, kq = [];
    if (v2.k === 'ham') { if (v2.a != null) x0 = Math.max(x0, v2.a); if (v2.b != null) x1 = Math.min(x1, v2.b); g = function (x) { return h.f(x) - v2.f(x); }; }
    else if (v2.a && v2.b) {
      var dx = v2.b.x - v2.a.x;
      if (Math.abs(dx) < 1e-12) { var xv = v2.a.x; if (xv < x0 || xv > x1) return []; var yv = h.f(xv); if (!isFinite(yv)) return []; var tv = (yv - v2.a.y) / (v2.b.y - v2.a.y); return trongDoan(v2.k, tv) ? [{ x: xv, y: yv }] : []; }
      var mm = (v2.b.y - v2.a.y) / dx; g = function (x) { return h.f(x) - (v2.a.y + mm * (x - v2.a.x)); };
    } else return [];
    var n = 1200, bx = (x1 - x0) / n, xa = x0, ga = g(xa);
    for (var i = 1; i <= n; i++) {
      var xb = x0 + i * bx, gb = g(xb);
      if (isFinite(ga) && isFinite(gb)) {
        if (ga === 0) kq.push(xa);
        else if (ga * gb < 0) {
          var lo = xa, hi = xb, glo = ga; for (var k = 0; k < 60; k++) { var mi = (lo + hi) / 2, gm = g(mi); if (glo * gm <= 0) hi = mi; else { lo = mi; glo = gm; } }
          var xr = (lo + hi) / 2; if (Math.abs(g(xr)) < 1e-6 * (1 + Math.abs(h.f(xr)))) kq.push(xr);   // bỏ chỗ đổi dấu do tiệm cận
        }
      }
      xa = xb; ga = gb;
    }
    return kq.map(function (x) { return { x: x, y: h.f(x) }; }).filter(function (p) {
      if (v2.k === 'ham' || !v2.a) return true;
      var d = sub2(v2.b, v2.a), t = Math.abs(d.x) > Math.abs(d.y) ? (p.x - v2.a.x) / d.x : (p.y - v2.a.y) / d.y; return trongDoan(v2.k, t);
    });
  }

  // ================================================================== HÌNH PHẲNG
  var LAM_DUONG = { seg: 1, line: 1, ray: 1, vec: 1, perp: 1, par: 1, mtt: 1, bis: 1 };
  var LA_DIEM = { pt: 1, on: 1, mid: 1, int: 1, reg: 1, proj: 1, refl: 1 };
  function laDuong(o) { return o && LAM_DUONG[o.t]; }
  function laTron(o) { return o && /^circ/.test(o.t); }
  function laDiem2(o) { return o && LA_DIEM[o.t]; }
  function giaoLL(a, b) {
    var d1 = sub2(a.b, a.a), d2 = sub2(b.b, b.a), den = cr2(d1, d2);
    if (Math.abs(den) < 1e-12) return [];
    var w = sub2(b.a, a.a), t = cr2(w, d2) / den, u = cr2(w, d1) / den;
    if (!trongDoan(a.k, t) || !trongDoan(b.k, u)) return [];
    return [add2(a.a, mul2(d1, t))];
  }
  function trongDoan(k, t) { var e = 1e-9; return (k === 'seg' || k === 'vec') ? t >= -e && t <= 1 + e : k === 'ray' ? t >= -e : true; }
  function giaoLC(l, c) {
    var d = sub2(l.b, l.a), f = sub2(l.a, c.c), A = dot2(d, d), B = 2 * dot2(f, d), C = dot2(f, f) - c.r * c.r, de = B * B - 4 * A * C;
    if (de < -1e-12) return [];
    var s = Math.sqrt(Math.max(0, de)), ts = de < 1e-12 ? [-B / (2 * A)] : [(-B - s) / (2 * A), (-B + s) / (2 * A)];
    return ts.filter(function (t) { return trongDoan(l.k, t); }).map(function (t) { return add2(l.a, mul2(d, t)); });
  }
  function giaoCC(a, b) {
    var d = len2(sub2(b.c, a.c)); if (d < 1e-12 || d > a.r + b.r + 1e-12 || d < Math.abs(a.r - b.r) - 1e-12) return [];
    var x = (d * d + a.r * a.r - b.r * b.r) / (2 * d), h = Math.sqrt(Math.max(0, a.r * a.r - x * x)), u = mul2(sub2(b.c, a.c), 1 / d), m = add2(a.c, mul2(u, x));
    var n = { x: -u.y, y: u.x };
    return h < 1e-12 ? [m] : [add2(m, mul2(n, h)), sub2(m, mul2(n, h))];
  }
  function canhDaGiac(v) { var L = []; for (var i = 0; i < v.pts.length; i++) L.push({ k: 'seg', a: v.pts[i], b: v.pts[(i + 1) % v.pts.length] }); return L; }
  function giao(v1, v2) {
    if (!v1 || !v2) return [];
    if (v1.k === 'bpt' || v2.k === 'bpt') return [];
    if (v1.k === 'ham') return v2.k === 'circ' ? [] : giaoHam(v1, v2);
    if (v2.k === 'ham') return v1.k === 'circ' ? [] : giaoHam(v2, v1);
    if (v1.k === 'poly') return [].concat.apply([], canhDaGiac(v1).map(function (s) { return giao(s, v2); }));
    if (v2.k === 'poly') return [].concat.apply([], canhDaGiac(v2).map(function (s) { return giao(v1, s); }));
    if (v1.k === 'circ' && v2.k === 'circ') return giaoCC(v1, v2);
    if (v1.k === 'circ') return giaoLC(v2, v1);
    if (v2.k === 'circ') return giaoLC(v1, v2);
    return giaoLL(v1, v2);
  }
  function tinh2(o) {
    var V = function (i) { return VAL[i]; }, d = o.d || [];
    switch (o.t) {
      case 'pt': return { x: o.x, y: o.y };
      case 'on': {
        var T = V(d[0]); if (!T) return null;
        if (T.k === 'circ') return add2(T.c, { x: T.r * Math.cos(o.u), y: T.r * Math.sin(o.u) });
        if (T.k === 'ham') { var yh = T.f(o.u); return isFinite(yh) ? { x: o.u, y: yh } : null; }
        if (T.k === 'poly') { var n = T.pts.length, i = Math.floor(o.u) % n, f = o.u - Math.floor(o.u); return add2(T.pts[i], mul2(sub2(T.pts[(i + 1) % n], T.pts[i]), f)); }
        var u = (T.k === 'seg' || T.k === 'vec') ? Math.min(1, Math.max(0, o.u)) : T.k === 'ray' ? Math.max(0, o.u) : o.u;
        return add2(T.a, mul2(sub2(T.b, T.a), u));
      }
      case 'mid': { if (d.length === 1) { var s = V(d[0]); return s ? mul2(add2(s.a, s.b), 0.5) : null; } var a = V(d[0]), b = V(d[1]); return a && b ? mul2(add2(a, b), 0.5) : null; }
      case 'int': { var L = giao(V(d[0]), V(d[1])); return L[o.k || 0] || null; }
      case 'seg': case 'line': case 'ray': case 'vec': { var p = V(d[0]), q = V(d[1]); return p && q && len2(sub2(p, q)) > 1e-12 ? { k: o.t, a: p, b: q } : null; }
      case 'poly': { var ps = d.map(V); return ps.every(Boolean) ? { k: 'poly', pts: ps } : null; }
      case 'reg': {
        var A0 = V(d[0]), B0 = V(d[1]); if (!A0 || !B0) return null;
        var pv = A0, cu = B0, goc = 2 * Math.PI / o.n * (o.chieu || 1);
        for (var j = 2; j <= o.k; j++) { var nx = add2(cu, rot2(sub2(cu, pv), goc)); pv = cu; cu = nx; }
        return cu;
      }
      case 'circ': { var c = V(d[0]), pp = V(d[1]); return c && pp ? { k: 'circ', c: c, r: len2(sub2(pp, c)) } : null; }
      case 'circr': { var c2 = V(d[0]); return c2 ? { k: 'circ', c: c2, r: o.r } : null; }
      case 'circ3': {
        var a3 = V(d[0]), b3 = V(d[1]), c3 = V(d[2]); if (!a3 || !b3 || !c3) return null;
        var D_ = 2 * (a3.x * (b3.y - c3.y) + b3.x * (c3.y - a3.y) + c3.x * (a3.y - b3.y)); if (Math.abs(D_) < 1e-12) return null;
        var A2 = dot2(a3, a3), B2 = dot2(b3, b3), C2 = dot2(c3, c3);
        var cc = { x: (A2 * (b3.y - c3.y) + B2 * (c3.y - a3.y) + C2 * (a3.y - b3.y)) / D_, y: (A2 * (c3.x - b3.x) + B2 * (a3.x - c3.x) + C2 * (b3.x - a3.x)) / D_ };
        return { k: 'circ', c: cc, r: len2(sub2(a3, cc)) };
      }
      case 'perp': case 'par': {
        var P = V(d[0]), Lv = V(d[1]); if (!P || !Lv) return null;
        var dv = sub2(Lv.b, Lv.a); if (o.t === 'perp') dv = { x: -dv.y, y: dv.x };
        return { k: 'line', a: P, b: add2(P, dv) };
      }
      case 'proj': { var P2 = V(d[0]), L2 = V(d[1]); if (!P2 || !L2) return null; var dd = sub2(L2.b, L2.a); return add2(L2.a, mul2(dd, dot2(sub2(P2, L2.a), dd) / dot2(dd, dd))); }
      case 'mtt': { var a4 = V(d[0]), b4 = V(d[1]); if (!a4 || !b4) return null; var m = mul2(add2(a4, b4), 0.5), w = sub2(b4, a4); return { k: 'line', a: m, b: add2(m, { x: -w.y, y: w.x }) }; }
      case 'bis': {
        var A5 = V(d[0]), B5 = V(d[1]), C5 = V(d[2]); if (!A5 || !B5 || !C5) return null;
        var u1 = sub2(A5, B5), u2 = sub2(C5, B5); u1 = mul2(u1, 1 / len2(u1)); u2 = mul2(u2, 1 / len2(u2));
        var bb = add2(u1, u2); if (len2(bb) < 1e-9) bb = { x: -u1.y, y: u1.x };
        return { k: 'ray', a: B5, b: add2(B5, bb) };
      }
      case 'refl': {
        var P6 = V(d[0]), T6 = V(d[1]); if (!P6 || !T6) return null;
        if (T6.k) { var d6 = sub2(T6.b, T6.a), f6 = add2(T6.a, mul2(d6, dot2(sub2(P6, T6.a), d6) / dot2(d6, d6))); return sub2(mul2(f6, 2), P6); }
        return sub2(mul2(T6, 2), P6);
      }
      case 'ang': case 'len': case 'eq': { var vs = d.map(V); return vs.every(Boolean) ? { k: o.t, pts: vs } : null; }
      case 'txt': return { x: o.x, y: o.y };
      case 'ham': return { k: 'ham', f: hamCua(o.bt), a: o.a, b: o.b };
      case 'bpt': return { k: 'bpt', a: o.a, b: o.b, c: o.c, dau: o.dau };
    }
    return null;
  }
  function tinhHet() {
    VAL = {};
    var L = SC().objs;
    for (var i = 0; i < L.length; i++) { try { VAL[L[i].id] = S.mode === '2d' ? tinh2(L[i]) : tinh3(L[i]); } catch (e) { VAL[L[i].id] = null; } }
  }
  // ---- toạ độ màn hình 2D
  function toMH(p) { var v = S.d2.view; return { x: W / 2 + v.ox + p.x * v.s, y: H / 2 + v.oy - p.y * v.s }; }
  function tuMH(x, y) { var v = S.d2.view; return { x: (x - W / 2 - v.ox) / v.s, y: -(y - H / 2 - v.oy) / v.s }; }
  function bat(p) {   // bắt điểm lưới
    if (!S.d2.bat || !S.d2.luoi) return p;
    var b = buocLuoi(), q = { x: Math.round(p.x / b) * b, y: Math.round(p.y / b) * b };
    return len2(sub2(q, p)) * S.d2.view.s < 9 ? q : p;
  }
  function buocLuoi() { var s = S.d2.view.s; return s >= 30 ? 1 : s >= 12 ? 2 : 5; }
  function kcDoanMH(p, a, b, k) {
    var d = sub2(b, a), L = dot2(d, d); if (L < 1e-9) return len2(sub2(p, a));
    var t = dot2(sub2(p, a), d) / L; if (k === 'seg' || k === 'vec') t = Math.max(0, Math.min(1, t)); else if (k === 'ray') t = Math.max(0, t);
    return len2(sub2(p, add2(a, mul2(d, t))));
  }
  function kcMH2(o, m) {   // khoảng cách (px) từ chuột tới đối tượng
    var v = VAL[o.id]; if (!v || o.an) return Infinity;
    if (laDiem2(o)) return len2(sub2(toMH(v), m));
    if (v.k === 'circ') { var c = toMH(v.c); return Math.abs(len2(sub2(m, c)) - v.r * S.d2.view.s); }
    if (v.k === 'ham') { var best0 = Infinity; mauHam(v).forEach(function (r) { for (var i = 0; i + 1 < r.length; i += 2) best0 = Math.min(best0, kcDoanMH(m, r[i], r[Math.min(i + 2, r.length - 1)], 'seg')); }); return best0; }
    if (v.k === 'bpt') { var bl = bienBPT(v); return bl ? kcDoanMH(m, toMH(bl[0]), toMH(bl[1]), 'line') : Infinity; }
    if (v.k === 'poly') { var ps = v.pts.map(toMH), best = Infinity; for (var i = 0; i < ps.length; i++) best = Math.min(best, kcDoanMH(m, ps[i], ps[(i + 1) % ps.length], 'seg')); return trongDaGiac(m, ps) ? Math.min(best, 6) : best; }
    if (v.k && v.a) return kcDoanMH(m, toMH(v.a), toMH(v.b), v.k);
    if (o.t === 'txt' || v.k === 'ang' || v.k === 'len') { var q = viTriNhan2(o, v); return q ? len2(sub2(q, m)) - 6 : Infinity; }
    return Infinity;
  }
  function trongDaGiac(p, ps) { var c = false; for (var i = 0, j = ps.length - 1; i < ps.length; j = i++) { if (((ps[i].y > p.y) !== (ps[j].y > p.y)) && (p.x < (ps[j].x - ps[i].x) * (p.y - ps[i].y) / (ps[j].y - ps[i].y) + ps[i].x)) c = !c; } return c; }
  function trung2(m, loc) {   // loc: 'P' điểm, 'L' đường thẳng/đoạn/tia, 'C' đường (kể cả tròn, đa giác), 'X' điểm hoặc đường, '*' mọi thứ
    var L = SC().objs, best = null, bd = Infinity;
    for (var i = L.length - 1; i >= 0; i--) {
      var o = L[i]; if (o.an) continue;
      var ok = loc === '*' || (loc === 'P' && laDiem2(o)) || (loc === 'L' && laDuong(o)) || (loc === 'C' && (laDuong(o) || laTron(o) || o.t === 'poly' || o.t === 'ham')) || (loc === 'X' && (laDiem2(o) || laDuong(o)));
      if (!ok) continue;
      var dd = kcMH2(o, m), nguong = (laDiem2(o) ? 11 : 7) * TO;
      if (laDiem2(o)) dd -= 3;     // ưu tiên điểm
      if (dd < nguong && dd < bd) { bd = dd; best = o; }
    }
    return best;
  }
  function layDiem2(m) {   // điểm có sẵn / giao điểm / điểm trên đường / điểm tự do mới
    var p = trung2(m, 'P'); if (p) return p.id;
    var cs = SC().objs.filter(function (o) { return !o.an && (laDuong(o) || laTron(o) || o.t === 'poly' || o.t === 'ham') && kcMH2(o, m) < 8 * TO; });
    if (cs.length >= 2) {
      for (var i = 0; i < cs.length; i++) for (var j = i + 1; j < cs.length; j++) {
        var G = giao(VAL[cs[i].id], VAL[cs[j].id]);
        for (var k = 0; k < G.length; k++) if (len2(sub2(toMH(G[k]), m)) < 12 * TO) return them({ t: 'int', d: [cs[i].id, cs[j].id], k: k, ten: tenMoi('diem') }).id;
      }
    }
    var w = tuMH(m.x, m.y);
    if (cs.length) return them({ t: 'on', d: [cs[0].id], u: thamSo(VAL[cs[0].id], w), ten: tenMoi('diem') }).id;
    var q = bat(w);
    return them({ t: 'pt', x: q.x, y: q.y, ten: tenMoi('diem') }).id;
  }
  function thamSo(T, w) {
    if (T.k === 'circ') return Math.atan2(w.y - T.c.y, w.x - T.c.x);
    if (T.k === 'ham') return w.x;
    if (T.k === 'poly') {
      var best = 0, bd = Infinity;
      for (var i = 0; i < T.pts.length; i++) { var a = T.pts[i], b = T.pts[(i + 1) % T.pts.length], d = sub2(b, a), t = Math.max(0, Math.min(1, dot2(sub2(w, a), d) / dot2(d, d))), dd = len2(sub2(w, add2(a, mul2(d, t)))); if (dd < bd) { bd = dd; best = i + t; } }
      return best;
    }
    var dd2 = sub2(T.b, T.a); return dot2(sub2(w, T.a), dd2) / dot2(dd2, dd2);
  }

  // ---- công cụ hình phẳng
  var IC = {   // biểu tượng SVG (24×24)
    move: '<path d="M5 3l14 8-6 1.5L16 20l-2.5 1-3-7.5L5 17z" fill="none" stroke="#1e1a2e" stroke-width="1.6" stroke-linejoin="round"/>',
    pt: '<circle cx="12" cy="12" r="4" fill="#5b3fd0" stroke="#1e1a2e" stroke-width="1.4"/><path d="M14.5 6.5h4" stroke="#1e1a2e" stroke-width="1.5"/>',
    mid: '<path d="M3 17L21 7" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="3" cy="17" r="2" fill="#1e1a2e"/><circle cx="21" cy="7" r="2" fill="#1e1a2e"/><circle cx="12" cy="12" r="3" fill="#5b3fd0"/>',
    int: '<path d="M3 5l18 14M3 19L21 5" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#5b3fd0"/>',
    seg: '<path d="M4 18L20 6" stroke="#1e1a2e" stroke-width="1.8"/><circle cx="4" cy="18" r="2.4" fill="#5b3fd0"/><circle cx="20" cy="6" r="2.4" fill="#5b3fd0"/>',
    line: '<path d="M1 20L23 4" stroke="#1e1a2e" stroke-width="1.8"/><circle cx="8" cy="15" r="2.4" fill="#5b3fd0"/><circle cx="16" cy="9" r="2.4" fill="#5b3fd0"/>',
    ray: '<path d="M4 18L23 4" stroke="#1e1a2e" stroke-width="1.8"/><circle cx="4" cy="18" r="2.4" fill="#5b3fd0"/><circle cx="13" cy="11.5" r="2.2" fill="#5b3fd0"/>',
    vec: '<path d="M4 18L19 7" stroke="#1e1a2e" stroke-width="1.8"/><path d="M13 6.5L20 6l-2.5 6.5" fill="none" stroke="#1e1a2e" stroke-width="1.8"/>',
    poly: '<path class="to" d="M4 18l4-12 11 3 1 9z" fill="#ddd6fe" stroke="#1e1a2e" stroke-width="1.6"/>',
    reg: '<path class="to" d="M12 3l8.5 6.2-3.3 10H6.8L3.5 9.2z" fill="#ddd6fe" stroke="#1e1a2e" stroke-width="1.6"/>',
    circ: '<circle cx="12" cy="12" r="8" fill="none" stroke="#1e1a2e" stroke-width="1.7"/><circle cx="12" cy="12" r="2" fill="#5b3fd0"/><circle cx="20" cy="12" r="2" fill="#5b3fd0"/>',
    circ3: '<circle cx="12" cy="12" r="8" fill="none" stroke="#1e1a2e" stroke-width="1.7"/><circle cx="5" cy="8" r="2" fill="#5b3fd0"/><circle cx="18" cy="17.5" r="2" fill="#5b3fd0"/><circle cx="17" cy="5.5" r="2" fill="#5b3fd0"/>',
    circr: '<circle cx="12" cy="12" r="8" fill="none" stroke="#1e1a2e" stroke-width="1.7"/><path d="M12 12h8" stroke="#dc2626" stroke-width="1.6"/><circle cx="12" cy="12" r="2" fill="#5b3fd0"/>',
    perp: '<path d="M2 18h20M12 18V3" stroke="#1e1a2e" stroke-width="1.7"/><path d="M12 14h4v4" fill="none" stroke="#1e1a2e" stroke-width="1.3"/>',
    par: '<path d="M2 16L22 9M2 22L22 15" stroke="#1e1a2e" stroke-width="1.7"/>',
    proj: '<path d="M2 19h20" stroke="#1e1a2e" stroke-width="1.7"/><path d="M12 4v15" stroke="#1e1a2e" stroke-width="1.4" stroke-dasharray="2.5 2"/><circle cx="12" cy="4" r="2.3" fill="#5b3fd0"/><circle cx="12" cy="19" r="2.3" fill="#dc2626"/>',
    mtt: '<path d="M3 17L21 7" stroke="#1e1a2e" stroke-width="1.6"/><path d="M8 3l8 18" stroke="#2563eb" stroke-width="1.7"/>',
    bis: '<path d="M3 20h19M3 20L18 4" stroke="#1e1a2e" stroke-width="1.6"/><path d="M3 20l19-8" stroke="#2563eb" stroke-width="1.7"/>',
    ang: '<path d="M3 20h19M3 20L16 5" stroke="#1e1a2e" stroke-width="1.6"/><path d="M11 20a8 8 0 0 0-2.6-6" fill="none" stroke="#ea580c" stroke-width="1.8"/>',
    len: '<path d="M3 16L21 8" stroke="#1e1a2e" stroke-width="1.6"/><text x="6" y="10" font-size="8" font-weight="700" fill="#ea580c">3,2</text>',
    eq: '<path d="M3 18L21 6" stroke="#1e1a2e" stroke-width="1.6"/><path d="M10 9l3 4M12.5 7.5l3 4" stroke="#dc2626" stroke-width="1.6"/>',
    refl: '<path d="M12 2v20" stroke="#1e1a2e" stroke-width="1.4" stroke-dasharray="2 2"/><circle cx="6" cy="9" r="2.4" fill="#5b3fd0"/><circle cx="18" cy="9" r="2.4" fill="#dc2626"/>',
    txt: '<text x="4" y="18" font-size="16" font-weight="800" fill="#1e1a2e">Aa</text>',
    del: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" fill="none" stroke="#b91c1c" stroke-width="1.7" stroke-linejoin="round"/>',
    // 3D
    xoay: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="#1e1a2e" stroke-width="1.7"/><path d="M18 2.5v4.5h-4.5M6 21.5V17h4.5" fill="none" stroke="#1e1a2e" stroke-width="1.7"/>',
    noi: '<path d="M4 18L20 6" stroke="#1e1a2e" stroke-width="1.8"/><circle cx="4" cy="18" r="2.4" fill="#5b3fd0"/><circle cx="20" cy="6" r="2.4" fill="#5b3fd0"/>',
    chia: '<path d="M3 17L21 7" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="9" cy="13.7" r="2.6" fill="#dc2626"/><text x="12" y="22" font-size="8" font-weight="700" fill="#dc2626">1:2</text>',
    chieuMP: '<path class="to" d="M2 18l6-6h14l-6 6z" fill="#ddd6fe" stroke="#1e1a2e" stroke-width="1.4"/><path d="M12 3v12" stroke="#1e1a2e" stroke-width="1.4" stroke-dasharray="2 2"/><circle cx="12" cy="3.5" r="2.2" fill="#5b3fd0"/><circle cx="12" cy="15" r="2" fill="#dc2626"/>',
    chieuDT: '<path d="M2 19L22 13" stroke="#1e1a2e" stroke-width="1.7"/><path d="M8 4l3.5 13" stroke="#1e1a2e" stroke-width="1.4" stroke-dasharray="2 2"/><circle cx="8" cy="4" r="2.2" fill="#5b3fd0"/>',
    giao2: '<path d="M3 5l18 14M3 19L21 5" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#dc2626"/>',
    giaoDM: '<path class="to" d="M2 18l6-6h14l-6 6z" fill="#ddd6fe" stroke="#1e1a2e" stroke-width="1.4"/><path d="M6 3l9 20" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="12" cy="15.5" r="2.3" fill="#dc2626"/>',
    thietDien: '<path d="M3 20L12 3l9 17z" fill="none" stroke="#1e1a2e" stroke-width="1.4"/><path class="to" d="M6 15l9-3 3 4z" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>',
    vuong: '<path d="M4 20V4M4 20h16" stroke="#1e1a2e" stroke-width="1.7"/><path d="M4 13h7v7" fill="none" stroke="#dc2626" stroke-width="1.6"/>',
    trongTam: '<path d="M12 3L3 20h18z" fill="none" stroke="#1e1a2e" stroke-width="1.5"/><circle cx="12" cy="14.3" r="2.5" fill="#dc2626"/>',
    dich: '<path d="M12 2v20M2 12h20" stroke="#1e1a2e" stroke-width="1.6"/><path d="M12 2l-3 3h6zM12 22l-3-3h6zM2 12l3-3v6zM22 12l-3-3v6z" fill="#1e1a2e"/>',
    diem: '<path d="M3 17l7-5h11l-7 5z" fill="none" stroke="#94a3b8" stroke-width="1.3"/><circle cx="12" cy="14.5" r="3.2" fill="#5b3fd0" stroke="#1e1a2e" stroke-width="1.2"/>',
    diemCao: '<path d="M3 20l6-4h12l-6 4z" fill="none" stroke="#94a3b8" stroke-width="1.3"/><path d="M12 18V5" stroke="#1e1a2e" stroke-width="1.6"/><circle cx="12" cy="4.5" r="2.6" fill="#5b3fd0"/><circle cx="12" cy="18" r="2" fill="#1e1a2e"/>',
    dt3: '<path d="M1 20L23 4" stroke="#2563eb" stroke-width="1.8"/><circle cx="8" cy="15" r="2.4" fill="#5b3fd0"/><circle cx="16" cy="9" r="2.4" fill="#5b3fd0"/>',
    ss3: '<path d="M2 15L18 9M6 21L22 15" stroke="#1e1a2e" stroke-width="1.7"/><path d="M8.5 11.5l1.5 2.5M13 9.8l1.5 2.5" stroke="#dc2626" stroke-width="1.3"/>',
    mp3: '<path class="to" d="M3 8l9-5 9 6-7 12-11-4z" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/>',
    matP: '<path class="to" d="M2 18l5-10h15l-5 10z" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/><text x="9" y="16" font-size="7" font-style="italic" font-weight="700" fill="#1e1a2e">(P)</text>',
    chop: '<path d="M12 2L3 19l7 3 11-5z" fill="none" stroke="#1e1a2e" stroke-width="1.5"/><path d="M12 2l-2 20" stroke="#1e1a2e" stroke-width="1.5"/><path d="M12 2l5 10M3 19l14-7 4 5" stroke="#1e1a2e" stroke-width="1.2" stroke-dasharray="2 1.6"/>',
    langTru: '<path d="M3 6l6 3 11-3M3 6v13l6 3 11-3V6M9 9v13" fill="none" stroke="#1e1a2e" stroke-width="1.5"/><path d="M3 19l17 0" stroke="#1e1a2e" stroke-width="1.2" stroke-dasharray="2 1.6"/>',
    len3: '<path d="M3 18L21 8" stroke="#1e1a2e" stroke-width="1.6"/><text x="5" y="11" font-size="8" font-weight="700" fill="#ea580c">4,5</text>',
    diem3: '<path d="M4 20V5M4 20l16-2M4 20l9-8" stroke="#94a3b8" stroke-width="1.4"/><circle cx="15" cy="8" r="3" fill="#5b3fd0"/>'
  };
  IC.tay = IC.dich; IC.chon = IC.move; IC.khung = '<path d="M3 3h6M15 3h6v6M21 15v6h-6M9 21H3v-6M3 9V3" fill="none" stroke="#1e1a2e" stroke-width="1.7" stroke-dasharray="3 2"/><path d="M10 9l8 4.5-3.4.8 1.9 3.7-1.5.7-1.9-3.7-2.6 2.2z" fill="#5b3fd0"/>';
  IC.ham = '<path d="M2 12h20M12 2v20" stroke="#94a3b8" stroke-width="1.2"/><path d="M4 3c3 16 13 16 16 0" fill="none" stroke="#2563eb" stroke-width="2"/>';
  IC.bpt = '<path class="to" d="M2 22L22 6V22z" fill="#fecaca" stroke="none"/><path d="M5 22l3-3M9 22l7-6M14 22l7-6M19 22l3-3" stroke="#dc2626" stroke-width="1.1"/><path d="M2 22L22 6" stroke="#1e1a2e" stroke-width="1.8"/>';
  var TOOLS2 = [
    { nhom: 'Chọn', id: 'move', ten: 'Chọn · kéo' },
    { nhom: 'Chọn', id: 'khung', ten: 'Chọn nhiều', hd: ['Kéo khung để chọn nhiều đối tượng · chạm/bấm từng đối tượng để thêm, bớt · kéo đối tượng đã chọn để dời cả nhóm'] },
    { nhom: 'Chọn', id: 'tay', ten: 'Dời trang vẽ', hd: ['Kéo để dời trang vẽ (cũng dời được bằng chuột phải hoặc hai ngón tay)'] },
    { nhom: 'Điểm', id: 'pt', ten: 'Điểm', can: ['P'], hd: ['Bấm chỗ trống để tạo điểm, bấm lên đường để tạo điểm trên đường, bấm chỗ hai đường cắt nhau để lấy giao điểm.'] },
    { nhom: 'Điểm', id: 'mid', ten: 'Trung điểm', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất (hoặc bấm vào một đoạn thẳng)', 'Chọn điểm thứ hai'] },
    { nhom: 'Điểm', id: 'int', ten: 'Giao điểm', can: ['C', 'C'], hd: ['Chọn đường thứ nhất (đoạn, đường thẳng, đường tròn…)', 'Chọn đường thứ hai'] },
    { nhom: 'Điểm', id: 'proj', ten: 'Hình chiếu', can: ['P', 'L'], hd: ['Chọn điểm', 'Chọn đường thẳng để chiếu vuông góc xuống'] },
    { nhom: 'Điểm', id: 'refl', ten: 'Đối xứng', can: ['P', 'X'], hd: ['Chọn điểm cần lấy đối xứng', 'Chọn tâm đối xứng (điểm) hoặc trục đối xứng (đường thẳng)'] },
    { nhom: 'Đường', id: 'seg', ten: 'Đoạn thẳng', can: ['P', 'P'], hd: ['Chọn điểm đầu', 'Chọn điểm cuối'] },
    { nhom: 'Đường', id: 'line', ten: 'Đường thẳng', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'] },
    { nhom: 'Đường', id: 'ray', ten: 'Tia', can: ['P', 'P'], hd: ['Chọn gốc của tia', 'Chọn điểm thuộc tia'] },
    { nhom: 'Đường', id: 'vec', ten: 'Vectơ', can: ['P', 'P'], hd: ['Chọn điểm đầu', 'Chọn điểm cuối'] },
    { nhom: 'Đường', id: 'perp', ten: 'Vuông góc', can: ['P', 'L'], hd: ['Chọn điểm đi qua', 'Chọn đường thẳng (đoạn) cần vuông góc'] },
    { nhom: 'Đường', id: 'par', ten: 'Song song', can: ['P', 'L'], hd: ['Chọn điểm đi qua', 'Chọn đường thẳng (đoạn) cần song song'] },
    { nhom: 'Đường', id: 'mtt', ten: 'Trung trực', can: ['P', 'P'], hd: ['Chọn đầu mút thứ nhất', 'Chọn đầu mút thứ hai'] },
    { nhom: 'Đường', id: 'bis', ten: 'Phân giác', can: ['P', 'P', 'P'], hd: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'] },
    { nhom: 'Hình', id: 'poly', ten: 'Đa giác', hd: ['Chọn lần lượt các đỉnh; bấm lại đỉnh đầu tiên để khép kín'] },
    { nhom: 'Hình', id: 'reg', ten: 'Đa giác đều', can: ['P', 'P'], hd: ['Chọn đỉnh thứ nhất', 'Chọn đỉnh thứ hai (cạnh đầu tiên)'] },
    { nhom: 'Hình', id: 'circ', ten: 'Đ.tròn tâm–điểm', can: ['P', 'P'], hd: ['Chọn tâm', 'Chọn một điểm trên đường tròn'] },
    { nhom: 'Hình', id: 'circr', ten: 'Đ.tròn bán kính', can: ['P'], hd: ['Chọn tâm, sau đó nhập bán kính'] },
    { nhom: 'Hình', id: 'circ3', ten: 'Đ.tròn qua 3 điểm', can: ['P', 'P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai', 'Chọn điểm thứ ba'] },
    { nhom: 'Đồ thị · miền nghiệm', id: 'ham', ten: 'Đồ thị hàm số', can: [], hd: ['Bấm nút để nhập hàm số y = f(x)'] },
    { nhom: 'Đồ thị · miền nghiệm', id: 'bpt', ten: 'Miền nghiệm BPT', can: [], hd: ['Bấm nút để nhập bất phương trình (hoặc hệ) bậc nhất hai ẩn'] },
    { nhom: 'Đo · kí hiệu', id: 'ang', ten: 'Góc', can: ['P', 'P', 'P'], hd: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc', 'Chọn điểm trên cạnh thứ hai'] },
    { nhom: 'Đo · kí hiệu', id: 'len', ten: 'Độ dài', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'] },
    { nhom: 'Đo · kí hiệu', id: 'eq', ten: 'Gạch bằng nhau', can: ['P', 'P'], hd: ['Chọn đầu đoạn cần đánh dấu', 'Chọn cuối đoạn (bấm thêm lần nữa để đổi số gạch)'] },
    { nhom: 'Đo · kí hiệu', id: 'txt', ten: 'Chữ', can: [], hd: ['Bấm vào vị trí cần ghi chữ'] },
    { nhom: 'Đo · kí hiệu', id: 'del', ten: 'Xoá', hd: ['Bấm vào đối tượng cần xoá (các đối tượng phụ thuộc cũng bị xoá)'] }
  ];
  var TOOLS3 = [
    { nhom: 'Chọn', id: 'xoay', ten: 'Xoay · chọn', hd: ['Kéo chỗ trống để xoay · kéo điểm để dời (giữ Shift: lên/xuống) · Shift/Ctrl + bấm: chọn nhiều · Ctrl + kéo: khung chọn'] },
    { nhom: 'Chọn', id: 'chon', ten: 'Chọn · dời', hd: ['Kéo khung chỗ trống để chọn nhiều · Shift/Ctrl + bấm để thêm/bớt · kéo đối tượng để dời (giữ Shift: lên/xuống)'] },
    { nhom: 'Chọn', id: 'dich', ten: 'Dời trang vẽ', hd: ['Kéo để dời cả hình trên trang vẽ (cũng dời được bằng chuột phải)'] },
    { nhom: 'Điểm', id: 'diem', ten: 'Điểm', can: ['*'], hd: ['Bấm chỗ trống: điểm trên mặt đáy (z = 0) · bấm lên đoạn/đường: điểm thuộc đoạn đó'] },
    { nhom: 'Điểm', id: 'diemCao', ten: 'Điểm trên cao', can: ['P'], hd: ['Chọn điểm ở đáy (chân đường cao), rồi nhập chiều cao — tạo điểm thẳng đứng phía trên'] },
    { nhom: 'Điểm', id: 'trung', ten: 'Trung điểm', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'] },
    { nhom: 'Điểm', id: 'chia', ten: 'Điểm chia đoạn', can: ['P', 'P'], hd: ['Chọn điểm đầu A', 'Chọn điểm cuối B, rồi nhập tỉ số AM/AB'] },
    { nhom: 'Điểm', id: 'trongTam', ten: 'Trọng tâm', can: ['P', 'P', 'P'], hd: ['Chọn đỉnh thứ nhất', 'Chọn đỉnh thứ hai', 'Chọn đỉnh thứ ba'] },
    { nhom: 'Điểm', id: 'diem3', ten: 'Điểm theo toạ độ', can: [], hd: ['Bấm vào vùng vẽ rồi nhập toạ độ (x; y; z)'] },
    { nhom: 'Đường · mặt', id: 'noi', ten: 'Đoạn thẳng', can: ['P', 'P'], hd: ['Chọn điểm đầu', 'Chọn điểm cuối — nét đứt, nét liền tự xác định'] },
    { nhom: 'Đường · mặt', id: 'dt3', ten: 'Đường thẳng', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'] },
    { nhom: 'Đường · mặt', id: 'ss3', ten: 'Song song', can: ['P', 'P', 'P'], hd: ['Chọn điểm đi qua', 'Chọn điểm đầu của đoạn cần song song', 'Chọn điểm cuối — tạo đoạn song song, bằng đoạn đó'] },
    { nhom: 'Đường · mặt', id: 'matP', ten: 'Mặt phẳng (P)', can: ['P', 'P', 'P'], hd: ['Chọn điểm 1 của mặt phẳng', 'Chọn điểm 2', 'Chọn điểm 3'] },
    { nhom: 'Đường · mặt', id: 'mp3', ten: 'Tô mặt (đa giác)', vong: 1, hd: ['Chọn lần lượt các đỉnh; bấm lại đỉnh đầu để khép kín và tô mặt'] },
    { nhom: 'Khối', id: 'chop', ten: 'Khối chóp', vong: 1, hd: ['Chọn lần lượt các đỉnh của đáy; bấm lại đỉnh đầu để khép đáy', 'Chọn đỉnh của hình chóp (VD: điểm S tạo bằng "Điểm trên cao")'] },
    { nhom: 'Khối', id: 'langTru', ten: 'Khối lăng trụ', vong: 1, hd: ['Chọn lần lượt các đỉnh đáy dưới; bấm lại đỉnh đầu để khép đáy', 'Chọn đỉnh đáy trên ứng với đỉnh đầu tiên (VD: A\' tạo bằng "Điểm trên cao")'] },
    { nhom: 'Vuông góc · đo', id: 'chieuMP', ten: 'Chiếu xuống mặt', can: ['P', 'P', 'P', 'P'], hd: ['Chọn điểm cần chiếu', 'Chọn điểm 1 của mặt phẳng', 'Chọn điểm 2 của mặt phẳng', 'Chọn điểm 3 của mặt phẳng'] },
    { nhom: 'Vuông góc · đo', id: 'chieuDT', ten: 'Chiếu xuống đường', can: ['P', 'P', 'P'], hd: ['Chọn điểm cần chiếu', 'Chọn điểm 1 của đường thẳng', 'Chọn điểm 2 của đường thẳng'] },
    { nhom: 'Vuông góc · đo', id: 'vuong', ten: 'Kí hiệu góc vuông', can: ['P', 'P', 'P'], hd: ['Chọn điểm trên cạnh thứ nhất', 'Chọn đỉnh góc vuông', 'Chọn điểm trên cạnh thứ hai'] },
    { nhom: 'Vuông góc · đo', id: 'len3', ten: 'Độ dài', can: ['P', 'P'], hd: ['Chọn điểm thứ nhất', 'Chọn điểm thứ hai'] },
    { nhom: 'Giao · thiết diện', id: 'giao2', ten: 'Giao 2 đường', can: ['P', 'P', 'P', 'P'], hd: ['Đường thứ nhất: chọn điểm 1', 'Đường thứ nhất: chọn điểm 2', 'Đường thứ hai: chọn điểm 1', 'Đường thứ hai: chọn điểm 2'] },
    { nhom: 'Giao · thiết diện', id: 'giaoDM', ten: 'Giao đường–mặt', can: ['P', 'P', 'P', 'P', 'P'], hd: ['Đường thẳng: chọn điểm 1', 'Đường thẳng: chọn điểm 2', 'Mặt phẳng: chọn điểm 1', 'Mặt phẳng: chọn điểm 2', 'Mặt phẳng: chọn điểm 3'] },
    { nhom: 'Giao · thiết diện', id: 'thietDien', ten: 'Thiết diện', can: ['P', 'P', 'P'], hd: ['Chọn điểm 1 của mặt phẳng cắt', 'Chọn điểm 2', 'Chọn điểm 3 — máy tô thiết diện'] },
    { nhom: 'Giao · thiết diện', id: 'del', ten: 'Xoá', hd: ['Bấm vào đối tượng cần xoá (đối tượng phụ thuộc cũng bị xoá)'] }
  ];
  function dsCong() { return S.mode === '2d' ? TOOLS2 : TOOLS3; }
  function congHT() { var id = cong[S.mode]; return dsCong().filter(function (t) { return t.id === id; })[0]; }
  function veCongCu() {
    var nhom = {}, thu = [];
    dsCong().forEach(function (t) { if (!nhom[t.nhom]) { nhom[t.nhom] = []; thu.push(t.nhom); } nhom[t.nhom].push(t); });
    $('#cong-cu').innerHTML = thu.map(function (n) {
      return '<div class="nhom-cc"><h4>' + n + '</h4><div class="luoi-cc">' + nhom[n].map(function (t) {
        return '<button type="button" class="cc' + (cong[S.mode] === t.id ? ' on' : '') + '" data-t="' + t.id + '" title="' + esc((t.hd || [''])[0]) + '"><svg viewBox="0 0 24 24">' + (IC[t.id] || IC.pt) + '</svg>' + t.ten + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    document.querySelectorAll('.cc').forEach(function (b) { b.onclick = function () { chonCong(b.dataset.t); }; });
  }
  function chonCong(id) {
    if (S.mode === '2d' && (id === 'ham' || id === 'bpt')) { moDoThi(id); return; } cong[S.mode] = id; picks = []; vongXong = false; tam = null; boChon(); veCongCu(); goiY(); veBang(); ve(); }
  function goiY() {
    var t = congHT(), el = $('#goi-y');
    if (!t) { el.textContent = ''; return; }
    if (t.id === 'move') { el.textContent = matchMedia('(pointer: coarse)').matches ? '👆 Kéo điểm để sửa hình · kéo nét để dời cả hình · kéo chỗ trống để dời trang · chụm 2 ngón để phóng to' : '👆 Kéo điểm để sửa hình · kéo nét để dời cả hình · kéo chỗ trống để di chuyển trang vẽ · lăn chuột để phóng to · Shift + kéo để chọn nhiều'; return; }
    var h = t.hd || [''], i = t.vong ? (vongXong ? 1 : 0) : Math.min(picks.length, h.length - 1);
    el.textContent = '✏️ ' + t.ten + ': ' + h[i] + (picks.length ? '  ·  Esc để huỷ' : '');
  }
  // xử lí một lần bấm của công cụ 2D
  function bam2(m) {
    var t = congHT(); if (!t) return;
    if (t.id === 'del') { var o = trung2(m, '*'); if (o) { ghiLS(); xoa(o.id); capNhat(); } return; }
    if (t.id === 'txt') {
      var w = tuMH(m.x, m.y);
      hoi('Ghi chữ', [{ nhan: 'Nội dung (VD: (d), ΔABC, a = 3cm)', v: '' }]).then(function (r) { if (r && r[0].trim()) { ghiLS(); them({ t: 'txt', x: w.x, y: w.y, s: r[0].trim() }); capNhat(); } });
      return;
    }
    if (t.id === 'poly') {
      ghiLSmotLan();
      var id = layDiem2(m);
      if (picks.length >= 3 && id === picks[0]) { them({ t: 'poly', d: picks.slice(), mau: '#5b3fd0' }); picks.forEach(function (pid, i) { them({ t: 'seg', d: [pid, picks[(i + 1) % picks.length]], phu: true }); }); xongLS(); picks = []; capNhat(); return; }
      if (picks.indexOf(id) < 0) picks.push(id);
      capNhat(); return;
    }
    var can = t.can[picks.length], id2 = null;
    if (can === 'P') {
      if (t.id === 'mid' && !picks.length) { var sg = trung2(m, 'P') ? null : trung2(m, 'L'); if (sg && sg.t === 'seg') { ghiLS(); them({ t: 'mid', d: [sg.id], ten: tenMoi('diem') }); capNhat(); return; } }
      ghiLSmotLan(); id2 = layDiem2(m);
    } else {
      var o2 = trung2(m, can); if (!o2) return; id2 = o2.id;
      ghiLSmotLan();
    }
    if (can === 'P' && picks.indexOf(id2) >= 0 && t.id !== 'eq') { capNhat(); return; }
    picks.push(id2);
    if (picks.length < t.can.length) { capNhat(); return; }
    tao2(t.id, picks.slice()); picks = []; xongLS(); capNhat();
  }
  var daGhi = false;
  function ghiLSmotLan() { if (!daGhi) { ghiLS(); daGhi = true; } }
  function xongLS() { daGhi = false; }
  function tao2(id, p) {
    var mau = '#1e1a2e';
    switch (id) {
      case 'pt': break;
      case 'mid': them({ t: 'mid', d: p, ten: tenMoi('diem') }); break;
      case 'int': { var G = giao(VAL[p[0]], VAL[p[1]]); if (!G.length) { thongBao('Hai đường này không cắt nhau.'); return; } G.forEach(function (x, k) { them({ t: 'int', d: p, k: k, ten: tenMoi('diem') }); }); break; }
      case 'proj': them({ t: 'proj', d: p, ten: tenMoi('diem') }); var h = SC().objs[SC().objs.length - 1]; them({ t: 'seg', d: [p[0], h.id], net: 'dut', mau: '#64748b' }); break;
      case 'refl': them({ t: 'refl', d: p, ten: tenMoi('diem') }); break;
      case 'seg': case 'line': case 'ray': case 'vec': them({ t: id, d: p, mau: mau }); break;
      case 'perp': case 'par': case 'mtt': case 'bis': them({ t: id, d: p, mau: '#2563eb' }); break;
      case 'circ': case 'circ3': them({ t: id, d: p, mau: mau, ten: tenMoi('tron'), anTen: true }); break;
      case 'circr': hoi('Đường tròn bán kính', [{ nhan: 'Bán kính (VD: 3; 2,5; √2)', v: '3', so: 1 }]).then(function (r) { var v = r && docSo(r[0]); if (v > 0) { them({ t: 'circr', d: p, r: v, mau: mau, ten: tenMoi('tron'), anTen: true }); capNhat(); } }); break;
      case 'reg': hoi('Đa giác đều', [{ nhan: 'Số cạnh (3 – 12)', v: '5', so: 1 }]).then(function (r) {
        var n = r && parseInt(r[0], 10); if (!(n >= 3 && n <= 12)) return;
        var ids = [p[0], p[1]];
        for (var k = 2; k < n; k++) ids.push(them({ t: 'reg', d: p, n: n, k: k, chieu: 1, ten: tenMoi('diem') }).id);
        them({ t: 'poly', d: ids, mau: '#5b3fd0' }); ids.forEach(function (a, i) { them({ t: 'seg', d: [a, ids[(i + 1) % n]], phu: true }); });
        capNhat();
      }); break;
      case 'ang': them({ t: 'ang', d: p, mau: '#ea580c', soDo: true }); break;
      case 'len': them({ t: 'len', d: p, mau: '#ea580c' }); break;
      case 'eq': {
        var cu = SC().objs.filter(function (o) { return o.t === 'eq' && ((o.d[0] === p[0] && o.d[1] === p[1]) || (o.d[0] === p[1] && o.d[1] === p[0])); })[0];
        if (cu) cu.n = cu.n % 3 + 1; else them({ t: 'eq', d: p, n: 1, mau: '#dc2626' });
        break;
      }
    }
  }
  function xoa(id) {
    var bo = {}; bo[id] = 1;
    SC().objs.forEach(function (o) { if ((o.d || []).some(function (x) { return bo[x]; }) || (o.dinh || []).some(function (x) { return bo[x]; }) || [].concat.apply([], o.f || []).some(function (x) { return bo[x]; })) bo[o.id] = 1; });
    SC().objs = SC().objs.filter(function (o) { return !bo[o.id]; });
    if (bo[chon]) chon = null; Object.keys(bo).forEach(function (i) { delete nhom[i]; });
  }
  function batTruc() { if (!S.d2.truc) { S.d2.truc = true; document.querySelector('[data-a="truc"]').classList.add('bat'); } if (!SC().objs.some(function (o) { return o.t !== 'ham' && o.t !== 'bpt' && !o.an; })) S.d2.view = { s: Math.max(30, Math.min(60, S.d2.view.s)), ox: 0, oy: 20 }; }
  var MAU_DT = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777'];
  function mauMoi(loai) { var n = SC().objs.filter(function (o) { return o.t === loai; }).length; return MAU_DT[n % MAU_DT.length]; }
  function moDoThi(loai, cu, loi) {
    var bLoi = loi ? '<b style="color:#b91c1c">⚠ ' + esc(loi) + '</b><br>' : '';
    if (loai === 'ham') {
      hoi('📈 Vẽ đồ thị hàm số', [{ nhan: 'y =', v: cu ? cu[0] : 'x^2 - 2x - 3' }, { nhan: 'Chỉ vẽ với x trong đoạn (để trống: vẽ hết; VD: -1; 3)', v: cu ? cu[1] : '' }],
        bLoi + 'Gõ như viết tay: <b>x^2 - 2x - 3</b>, <b>2x + 1</b>, <b>(x+1)/(x-2)</b>, <b>sqrt(x)</b>, <b>|x - 1|</b>, <b>sin(x)</b>, <b>2^x</b>, <b>ln(x)</b>, <b>x^3 - 3x</b>. Dấu thập phân dùng dấu phẩy hoặc chấm.').then(function (r) {
        if (!r) return;
        try {
          var bt = r[0].trim(), f = hamCua(bt); f(0.37); f(1.3);
          var o = { t: 'ham', bt: bt, mau: mauMoi('ham'), ten: 'y = ' + depBT(bt) }, kh = r[1].trim();
          if (kh) { var ab = kh.replace(/[\[\]()]/g, '').split(/;/).map(docSo); if (ab.length !== 2 || ab.some(isNaN) || ab[0] >= ab[1]) throw new Error('Đoạn x cần dạng a; b với a < b (VD: -1; 3).'); o.a = ab[0]; o.b = ab[1]; }
          ghiLS(); batTruc(); them(o); capNhat();
        } catch (e) { setTimeout(function () { moDoThi('ham', r, e.message); }, 50); }
      });
      return;
    }
    hoiBPT(cu ? cu[0] : null, loi).then(function (r) {
      if (!r) return;
      try {
        var ds = r[0].split(';').map(function (x) { return x.trim(); }).filter(Boolean);
        if (!ds.length) throw new Error('Chưa nhập bất phương trình.');
        var dl = ds.map(function (x) { var q = docBPT(x); q.bt = x; return q; });
        ghiLS(); batTruc();
        dl.forEach(function (q) { them({ t: 'bpt', a: q.a, b: q.b, c: q.c, dau: q.dau, bt: q.bt, ten: depBT(q.bt), mau: mauMoi('bpt') }); });
        capNhat();
      } catch (e) { setTimeout(function () { moDoThi('bpt', r, e.message); }, 50); }
    });
  }
  var DAU_BPT = [['<', '<', 'nhỏ hơn'], ['<=', '≤', 'nhỏ hơn hoặc bằng'], ['>', '>', 'lớn hơn'], ['>=', '≥', 'lớn hơn hoặc bằng']];
  function tachBPT(s) {   // "2x + y <= 4" -> { t: '2x + y', d: '<=', p: '4' }
    s = String(s || '').replace(/≤|=</g, '<=').replace(/≥|=>/g, '>=');
    var m = /(<=|>=|<|>)/.exec(s);
    return m ? { t: s.slice(0, m.index).trim(), d: m[1], p: s.slice(m.index + m[1].length).trim() } : { t: s.trim(), d: '<=', p: '0' };
  }
  function hoiBPT(cu, loi) {   // hộp nhập BPT / hệ BPT: vế trái · nút chọn dấu · vế phải; trả về chuỗi "a; b; c"
    return new Promise(function (ok) {
      var ds = String(cu || 'x + y <= 4; x >= 0; y >= 0').split(';').map(function (x) { return x.trim(); }).filter(Boolean).map(tachBPT);
      if (!ds.length) ds = [{ t: '', d: '<=', p: '0' }];
      var MAU = [['x + y <= 4; x >= 0; y >= 0', 'x + y ≤ 4, x ≥ 0, y ≥ 0'], ['2x - y > 1', '2x − y > 1'], ['x - 2y < 0; x + 3y > -2; y < 3', 'Hệ 3 BPT (SGK)'], ['x + 2y <= 10; 2x + y <= 8; x >= 0; y >= 0', 'Bài toán kinh tế']];
      var hop = $('#hop .hop-trong'), doc = function () {
        $$('#bpt-ds .bpt-hang').forEach(function (h, i) { ds[i].t = h.querySelector('.bpt-t').value; ds[i].p = h.querySelector('.bpt-p').value; });
      };
      var veLai = function (oMoi) {
        $('#bpt-ds').innerHTML = ds.map(function (q, i) {
          return '<div class="bpt-hang"><span class="bpt-so">' + (ds.length > 1 ? (i + 1) + '.' : '') + '</span><input class="bpt-t" value="' + esc(q.t) + '" placeholder="vế trái, VD: 2x + y" aria-label="Vế trái" autocomplete="off">' +
            '<div class="bpt-dau" role="group" aria-label="Chọn dấu">' + DAU_BPT.map(function (d) { return '<button type="button" data-d="' + d[0] + '" data-i="' + i + '" class="' + (q.d === d[0] ? 'on' : '') + '" title="' + d[2] + '">' + esc(d[1]) + '</button>'; }).join('') + '</div>' +
            '<input class="bpt-p" value="' + esc(q.p) + '" placeholder="vế phải" aria-label="Vế phải" autocomplete="off">' +
            (ds.length > 1 ? '<button type="button" class="bpt-xoa" data-x="' + i + '" title="Bỏ bất phương trình này">✕</button>' : '') + '</div>';
        }).join('');
        if (oMoi != null) { var o = $$('#bpt-ds .bpt-t')[oMoi]; if (o) o.focus(); }
      };
      $('#hop-t').textContent = '🟥 Biểu diễn miền nghiệm';
      hop.classList.add('rong');
      $('#hop-n').innerHTML = (loi ? '<p><b style="color:#b91c1c">⚠ ' + esc(loi) + '</b></p>' : '') +
        '<p>Gõ vế trái → <b>bấm chọn dấu</b> → gõ vế phải. Hệ bất phương trình: bấm <b>＋ Thêm</b>.</p><div id="bpt-ds"></div>' +
        '<div class="bpt-cuoi"><button type="button" id="bpt-them">＋ Thêm bất phương trình</button></div>' +
        '<p><b>Mẫu nhanh:</b></p><div class="bpt-mau">' + MAU.map(function (m) { return '<button type="button" data-m="' + esc(m[0]) + '">' + esc(m[1]) + '</button>'; }).join('') + '</div>' +
        '<p>Như SGK: <b>gạch bỏ phần không là nghiệm</b>, phần để trắng là miền nghiệm; bờ vẽ <b>nét đứt</b> nếu dấu &lt; hoặc &gt;, <b>nét liền</b> nếu dấu ≤ hoặc ≥.</p>';
      veLai();
      $('#hop').classList.remove('an');
      setTimeout(function () { var o = $('#bpt-ds .bpt-t'); if (o) { o.focus(); o.select(); } }, 30);
      $('#hop-n').onclick = function (e) {
        var b = e.target.closest('button'); if (!b) return;
        doc();
        if (b.dataset.d) { ds[+b.dataset.i].d = b.dataset.d; veLai(); var p = $$('#bpt-ds .bpt-p')[+b.dataset.i]; if (p && !p.value) p.focus(); return; }
        if (b.dataset.x != null) { ds.splice(+b.dataset.x, 1); veLai(); return; }
        if (b.id === 'bpt-them') { ds.push({ t: '', d: '>=', p: '0' }); veLai(ds.length - 1); return; }
        if (b.dataset.m) { ds = b.dataset.m.split(';').map(tachBPT); veLai(); }
      };
      var xong = function (v) { $('#hop').classList.add('an'); hop.classList.remove('rong'); $('#hop-ok').onclick = $('#hop-huy').onclick = $('#hop-n').onclick = null; ok(v); };
      $('#hop-huy').onclick = function () { xong(null); };
      $('#hop-ok').onclick = function () {
        doc();
        xong([ds.filter(function (q) { return q.t.trim() || q.p.trim(); }).map(function (q) { return (q.t.trim() || '0') + ' ' + q.d + ' ' + (q.p.trim() || '0'); }).join('; ')]);
      };
      $('#hop-n').onkeydown = function (e) {
        if (e.key === 'Escape') { $('#hop-huy').onclick(); return; }
        if (e.key !== 'Enter') return;
        e.preventDefault(); $('#hop-ok').onclick();
      };
    });
  }
  function thongBao(t, tin) { var el = $('#goi-y'); el.textContent = (tin ? 'ℹ️ ' : '⚠️ ') + t; setTimeout(goiY, 2600); }

  // ---- vẽ 2D (ra danh sách nét để dùng chung cho màn hình và xuất SVG)
  function nets2() {
    var N = [], v = S.d2.view, nen = [];
    if (S.d2.luoi) {
      var b = buocLuoi(), x0 = tuMH(0, 0), x1 = tuMH(W, H);
      for (var x = Math.ceil(x0.x / b) * b; x <= x1.x; x += b) nen.push({ t: 'line', p: [toMH({ x: x, y: x0.y }), toMH({ x: x, y: x1.y })], c: '#e9e5f3', w: 1 });
      for (var y = Math.ceil(x1.y / b) * b; y <= x0.y; y += b) nen.push({ t: 'line', p: [toMH({ x: x0.x, y: y }), toMH({ x: x1.x, y: y })], c: '#e9e5f3', w: 1 });
    }
    if (S.d2.truc) {
      var o = toMH({ x: 0, y: 0 });
      nen.push({ t: 'line', p: [{ x: 0, y: o.y }, { x: W, y: o.y }], c: '#64748b', w: 1.3, mui: 1 }, { t: 'line', p: [{ x: o.x, y: H }, { x: o.x, y: 0 }], c: '#64748b', w: 1.3, mui: 1 });
      nen.push({ t: 'text', x: W - 14, y: o.y - 10, s: 'x', c: '#475569', size: 14, i: 1 }, { t: 'text', x: o.x + 12, y: 14, s: 'y', c: '#475569', size: 14, i: 1 }, { t: 'text', x: o.x - 10, y: o.y + 14, s: 'O', c: '#475569', size: 13, i: 1 });
      var b2 = buocLuoi(), a0 = tuMH(0, 0), a1 = tuMH(W, H);
      for (var tx = Math.ceil(a0.x / b2) * b2; tx <= a1.x; tx += b2) if (Math.abs(tx) > 1e-9) { var p = toMH({ x: tx, y: 0 }); nen.push({ t: 'line', p: [{ x: p.x, y: p.y - 3 }, { x: p.x, y: p.y + 3 }], c: '#64748b', w: 1 }, { t: 'text', x: p.x, y: p.y + 15, s: so(tx, 1), c: '#64748b', size: 11 }); }
      for (var ty = Math.ceil(a1.y / b2) * b2; ty <= a0.y; ty += b2) if (Math.abs(ty) > 1e-9) { var q = toMH({ x: 0, y: ty }); nen.push({ t: 'line', p: [{ x: q.x - 3, y: q.y }, { x: q.x + 3, y: q.y }], c: '#64748b', w: 1 }, { t: 'text', x: q.x - 12, y: q.y + 4, s: so(ty, 1), c: '#64748b', size: 11 }); }
    }
    var L = SC().objs.filter(function (o) { return hienO(o) && VAL[o.id]; }), KK = K();
    var nhanDiem = [];
    NHAN_DA = [];
    var lop = function (o) { return o.t === 'bpt' ? -1 : o.t === 'ham' ? 2 : o.t === 'poly' ? 0 : laTron(o) ? 1 : laDuong(o) ? 2 : (o.t === 'ang' || o.t === 'eq' || o.t === 'len') ? 3 : laDiem2(o) ? 5 : 4; };
    L.slice().sort(function (a, b) { return lop(a) - lop(b); }).forEach(function (o) {
      var val = VAL[o.id], mau = o.mau || '#1e1a2e', w = (o.day || (o.phu ? 1.8 : 1.9)) * KK.day, dut = o.net === 'dut', noi = laChon(o.id) || (o.id === hover && cong[S.mode] !== 'xoay') || (BUOC && BUOC.moi[o.id]);
      if (o.t === 'ham') {
        var runs = mauHam(val);
        runs.forEach(function (r) { if (noi) N.push({ t: 'line', p: r, c: laChon(o.id) ? 'rgba(91,63,208,.35)' : 'rgba(91,63,208,.18)', w: w + 6 }); N.push({ t: 'line', p: r, c: mau, w: w, dash: dut }); });
        if (o.ten && !o.anTen && runs.length) {
          var dai = runs.reduce(function (a, b) { return b.length > a.length ? b : a; }), q = dai[Math.floor(dai.length * 0.82)];
          if (q && q.y > 20 && q.y < H - 20) nhanDiem.push({ t: 'text', x: q.x + 6, y: q.y - 10, s: tenHien(o.ten), c: o.mauTen || mau, size: o.coTen || KK.coTen - 1, b: 1, i: 1, trai: 1, nen: 1 });
        }
        return;
      }
      if (o.t === 'bpt') {
        var bien = bienBPT(val); if (!bien) return;
        var vung = vungTo(val, !!o.toNghiem);
        if (vung.length > 2) N.push({ t: 'poly', p: vung.map(toMH), fill: o.kieuTo === 'mau' ? hexA(mau, 0.22) : hexA(mau, 0.07), gach: o.kieuTo === 'mau' ? null : hexA(mau, 0.6), c: null });
        var a0 = toMH(bien[0]), b0 = toMH(bien[1]);
        if (noi) N.push({ t: 'line', p: [a0, b0], c: laChon(o.id) ? 'rgba(91,63,208,.35)' : 'rgba(91,63,208,.18)', w: w + 6 });
        N.push({ t: 'line', p: [a0, b0], c: mau, w: w, dash: val.dau === '<' || val.dau === '>' });
        if (o.ten && !o.anTen) { var nb = nhanBPT(val, bien); if (nb) nhanDiem.push({ t: 'text', x: nb.x, y: nb.y, s: o.ten, c: o.mauTen || mau, size: o.coTen || KK.coTen - 2, b: 1, nen: 1 }); }
        return;
      }
      if (noi && !laDiem2(o)) N.push(Object.assign(hinhNet2(o, val), { c: laChon(o.id) ? 'rgba(91,63,208,.35)' : 'rgba(91,63,208,.18)', w: w + 6, dash: 0, fill: null }));
      if (o.t === 'poly') { N.push({ t: 'poly', p: val.pts.map(toMH), fill: o.to === false ? null : hexA(o.mau || '#5b3fd0', 0.12), c: null }); return; }
      if (laDuong(o) || laTron(o)) { N.push(Object.assign(hinhNet2(o, val), { c: mau, w: w, dash: dut })); if (o.t === 'vec') N.push(muiTen(toMH(val.a), toMH(val.b), mau)); if (o.ten && !o.anTen) nhanDiem.push(nhanDuong(o, val)); return; }
      if (o.t === 'ang') { N.push.apply(N, kiHieuGoc(val.pts, mau, o.soDo)); return; }
      if (o.t === 'eq') { N.push.apply(N, gach(toMH(val.pts[0]), toMH(val.pts[1]), o.n || 1, mau)); return; }
      if (o.t === 'len') { var a = toMH(val.pts[0]), bb = toMH(val.pts[1]), mm = viTriNhan2(o, val); N.push({ t: 'text', x: mm.x, y: mm.y, s: (tenHien(ten2(o.d[0])) + tenHien(ten2(o.d[1]))) + ' = ' + so(len2(sub2(val.pts[0], val.pts[1]))), c: mau, size: 13, b: 1, nen: 1 }); return; }
      if (o.t === 'txt') { var tp = toMH(val); N.push({ t: 'text', x: tp.x, y: tp.y, s: o.s, c: mau, size: o.co || 16, b: 1, trai: 1 }); if (noi) N.push({ t: 'circle', x: tp.x - 4, y: tp.y - 5, r: 4, c: '#5b3fd0', w: 2 }); return; }
      if (laDiem2(o)) {
        var p2 = toMH(val), tu = o.t === 'pt', tren = o.t === 'on';
        if (noi) N.push({ t: 'dot', x: p2.x, y: p2.y, r: 9, fill: laChon(o.id) ? 'rgba(91,63,208,.3)' : 'rgba(91,63,208,.18)' });
        N.push({ t: 'dot', x: p2.x, y: p2.y, r: (tu ? 4.5 : 3.8) * KK.coDiem, fill: o.mau || (tu ? '#5b3fd0' : tren ? '#0f9d8f' : '#1e1a2e'), c: '#fff', w: 1.2 });
        if (o.ten && !o.anTen) nhanDiem.push({ t: 'text', x: p2.x + (o.lx == null ? 9 : o.lx), y: p2.y + (o.ly == null ? -9 : o.ly), s: tenHien(o.ten), c: o.mauTen || KK.mauTen, size: o.coTen || KK.coTen, b: 1, i: 1 });
      }
    });
    if (tam) N.push.apply(N, tam);
    return nen.concat(N, nhanDiem);
  }
  function khungTG() { var a = tuMH(0, 0), b = tuMH(W, H); return [{ x: a.x, y: a.y }, { x: b.x, y: a.y }, { x: b.x, y: b.y }, { x: a.x, y: b.y }]; }
  function bienBPT(v) {   // hai điểm của đường thẳng bờ a·x + b·y + c = 0 nằm ngoài khung nhìn
    var K = khungTG(), cx = (K[0].x + K[2].x) / 2, cy = (K[0].y + K[2].y) / 2, R = Math.hypot(K[2].x - K[0].x, K[2].y - K[0].y) * 2;
    var n = Math.hypot(v.a, v.b); if (n < 1e-12) return null;
    var t = -(v.a * cx + v.b * cy + v.c) / (n * n), p = { x: cx + v.a * t, y: cy + v.b * t }, d = { x: -v.b / n, y: v.a / n };
    return [{ x: p.x - d.x * R, y: p.y - d.y * R }, { x: p.x + d.x * R, y: p.y + d.y * R }];
  }
  function vungTo(v, toNghiem) {   // cắt khung nhìn theo nửa mặt phẳng cần tô (SGK: tô/gạch phần KHÔNG là nghiệm)
    var nho = v.dau === '<' || v.dau === '<=', s0 = (nho ? 1 : -1) * (toNghiem ? -1 : 1), K = khungTG(), out = [];
    var g = function (p) { return s0 * (v.a * p.x + v.b * p.y + v.c); };
    for (var i = 0; i < K.length; i++) {
      var P = K[i], Q = K[(i + 1) % K.length], gp = g(P), gq = g(Q);
      if (gp >= 0) out.push(P);
      if ((gp >= 0) !== (gq >= 0)) { var t = gp / (gp - gq); out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t }); }
    }
    return out;
  }
  var NHAN_DA = [];   // các nhãn BPT đã đặt trong lần vẽ này (để nhãn không đè nhau)
  function nhanBPT(v, bien) {   // chỗ ghi bất phương trình: trên đường bờ, trong khung nhìn, xa các nhãn khác, lệch về phía miền nghiệm
    var a = toMH(bien[0]), b = toMH(bien[1]), best = null, diem = -Infinity;
    for (var k = 0.3; k <= 0.7; k += 0.01) {
      var p = add2(a, mul2(sub2(b, a), k)); if (!(p.x > 70 && p.x < W - 70 && p.y > 80 && p.y < H - 50)) continue;
      var xa = NHAN_DA.reduce(function (m, q) { return Math.min(m, len2(sub2(q, p))); }, 400), d = Math.min(xa, 160) - Math.abs(p.x - W / 2) * 0.05 - Math.abs(p.y - H / 2) * 0.05;
      if (d > diem) { diem = d; best = p; }
    }
    if (!best) return null;
    NHAN_DA.push(best);
    var d = sub2(b, a), l = len2(d) || 1, n = { x: d.y / l, y: -d.x / l }, w = tuMH(best.x + n.x * 10, best.y + n.y * 10), nho = v.dau === '<' || v.dau === '<=';
    if ((v.a * w.x + v.b * w.y + v.c < 0) !== nho) n = mul2(n, -1);
    return add2(best, mul2(n, 18));
  }
  function ten2(id) { var o = obj(id); return o && o.ten || '?'; }
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function hinhNet2(o, val) {
    if (val.k === 'circ') { var c = toMH(val.c); return { t: 'circle', x: c.x, y: c.y, r: val.r * S.d2.view.s }; }
    if (val.k === 'poly') return { t: 'poly', p: val.pts.map(toMH) };
    var a = toMH(val.a), b = toMH(val.b), d = sub2(b, a), l = len2(d) || 1, K = (W + H) * 2;
    d = mul2(d, 1 / l);
    if (val.k === 'line') return { t: 'line', p: [sub2(a, mul2(d, K)), add2(a, mul2(d, K))] };
    if (val.k === 'ray') return { t: 'line', p: [a, add2(a, mul2(d, K))] };
    return { t: 'line', p: [a, b] };
  }
  function nhanDuong(o, val) {
    var p;
    if (val.k === 'circ') { var c = toMH(val.c), r = val.r * S.d2.view.s; p = { x: c.x + r * 0.72 + 6, y: c.y - r * 0.72 - 6 }; }
    else { var a = toMH(val.a), b = toMH(val.b); p = add2(mul2(add2(a, b), 0.5), { x: 8, y: -8 }); if (val.k === 'line' || val.k === 'ray') p = add2(add2(a, mul2(sub2(b, a), val.k === 'ray' ? 1.5 : 1.25)), { x: 6, y: -8 }); }
    return { t: 'text', x: p.x, y: p.y, s: tenHien(o.ten), c: o.mauTen || o.mau || K().mauTen, size: o.coTen || K().coTen - 1, b: 1, i: 1 };
  }
  function muiTen(a, b, c) { var d = sub2(b, a), l = len2(d) || 1, u = mul2(d, 1 / l), n = { x: -u.y, y: u.x }; return { t: 'poly', p: [b, add2(sub2(b, mul2(u, 12)), mul2(n, 5)), sub2(sub2(b, mul2(u, 12)), mul2(n, 5))], fill: c, c: null }; }
  function kiHieuGoc(pts, c, soDo) {
    var A = toMH(pts[0]), B = toMH(pts[1]), C = toMH(pts[2]);
    var a1 = Math.atan2(A.y - B.y, A.x - B.x), a2 = Math.atan2(C.y - B.y, C.x - B.x), sw = a2 - a1;
    while (sw <= -Math.PI) sw += 2 * Math.PI; while (sw > Math.PI) sw -= 2 * Math.PI;
    var va = sub2(pts[0], pts[1]), vc = sub2(pts[2], pts[1]), deg = Math.acos(Math.max(-1, Math.min(1, dot2(va, vc) / (len2(va) * len2(vc))))) * 180 / Math.PI, R = 20, out = [];
    if (Math.abs(deg - 90) < 0.05) {
      var u1 = { x: Math.cos(a1), y: Math.sin(a1) }, u2 = { x: Math.cos(a2), y: Math.sin(a2) }, s = 12;
      out.push({ t: 'line', p: [add2(B, mul2(u1, s)), add2(add2(B, mul2(u1, s)), mul2(u2, s)), add2(B, mul2(u2, s))], c: c, w: 1.6 });
    } else out.push({ t: 'arc', x: B.x, y: B.y, r: R, a0: a1, a1: a1 + sw, c: c, w: 1.8 });
    if (soDo) { var m = a1 + sw / 2; out.push({ t: 'text', x: B.x + Math.cos(m) * (R + 16), y: B.y + Math.sin(m) * (R + 16) + 4, s: so(deg, 1) + '°', c: c, size: 13, b: 1 }); }
    return out;
  }
  function gach(a, b, n, c) {
    var m = mul2(add2(a, b), 0.5), d = sub2(b, a), l = len2(d) || 1, u = mul2(d, 1 / l), nn = { x: -u.y, y: u.x }, out = [];
    for (var i = 0; i < n; i++) { var o = add2(m, mul2(u, (i - (n - 1) / 2) * 5)); out.push({ t: 'line', p: [add2(o, add2(mul2(nn, 6), mul2(u, 2))), sub2(o, add2(mul2(nn, 6), mul2(u, 2)))], c: c, w: 1.7 }); }
    return out;
  }
  function viTriNhan2(o, val) {
    if (o.t === 'txt') return toMH(val);
    if (val.k === 'len') { var a = toMH(val.pts[0]), b = toMH(val.pts[1]), d = sub2(b, a), l = len2(d) || 1; return add2(mul2(add2(a, b), 0.5), mul2({ x: d.y / l, y: -d.x / l }, 16)); }
    if (val.k === 'ang') return toMH(val.pts[1]);
    return null;
  }

  // ================================================================== HÌNH KHÔNG GIAN
  function tinh3(o) {
    var V = function (i) { return VAL[i]; }, d = o.d || [];
    switch (o.t) {
      case 'p3': return P3(o.x, o.y, o.z);
      case 'mid3': { var a = V(d[0]), b = V(d[1]); return a && b ? mul3(add3(a, b), 0.5) : null; }
      case 'on3': { var a1 = V(d[0]), b1 = V(d[1]); return a1 && b1 ? add3(a1, mul3(sub3(b1, a1), o.u)) : null; }
      case 'cen3': { var ps = d.map(V); if (!ps.every(Boolean)) return null; var s = P3(0, 0, 0); ps.forEach(function (p) { s = add3(s, p); }); return mul3(s, 1 / ps.length); }
      case 'projP': { var P = V(d[0]), A = V(d[1]), B = V(d[2]), C = V(d[3]); if (!P || !A || !B || !C) return null; var n = cr3(sub3(B, A), sub3(C, A)); if (len3(n) < 1e-12) return null; return sub3(P, mul3(n, dot3(sub3(P, A), n) / dot3(n, n))); }
      case 'projL': { var P1 = V(d[0]), A1 = V(d[1]), B1 = V(d[2]); if (!P1 || !A1 || !B1) return null; var u = sub3(B1, A1); return add3(A1, mul3(u, dot3(sub3(P1, A1), u) / dot3(u, u))); }
      case 'int3': {
        var a2 = V(d[0]), b2 = V(d[1]), c2 = V(d[2]), d2 = V(d[3]); if (!a2 || !b2 || !c2 || !d2) return null;
        var u2 = sub3(b2, a2), v2 = sub3(d2, c2), w0 = sub3(a2, c2), A_ = dot3(u2, u2), B_ = dot3(u2, v2), C_ = dot3(v2, v2), D_ = dot3(u2, w0), E_ = dot3(v2, w0), den = A_ * C_ - B_ * B_;
        if (Math.abs(den) < 1e-12) return null;
        var t = (B_ * E_ - C_ * D_) / den, s2 = (A_ * E_ - B_ * D_) / den, p1 = add3(a2, mul3(u2, t)), p2 = add3(c2, mul3(v2, s2));
        return len3(sub3(p1, p2)) < 1e-6 * (1 + len3(u2) + len3(v2)) ? mul3(add3(p1, p2), 0.5) : null;
      }
      case 'intLP': {
        var a3 = V(d[0]), b3 = V(d[1]), c3 = V(d[2]), e3 = V(d[3]), f3 = V(d[4]); if (!a3 || !b3 || !c3 || !e3 || !f3) return null;
        var n3 = cr3(sub3(e3, c3), sub3(f3, c3)), u3 = sub3(b3, a3), dn = dot3(n3, u3); if (Math.abs(dn) < 1e-12) return null;
        return add3(a3, mul3(u3, dot3(n3, sub3(c3, a3)) / dn));
      }
      case 'seg3': { var x = V(d[0]), y = V(d[1]); return x && y ? { k: 'seg', a: x, b: y } : null; }
      case 'up3': { var U = V(d[0]); return U ? P3(U.x, U.y, U.z + o.h) : null; }
      case 'tr3': { var T0 = V(d[0]), T1 = V(d[1]), T2 = V(d[2]); return T0 && T1 && T2 ? add3(T0, sub3(T2, T1)) : null; }
      case 'line3': { var l1 = V(d[0]), l2 = V(d[1]); return l1 && l2 && len3(sub3(l1, l2)) > 1e-9 ? { k: 'line3', a: l1, b: l2 } : null; }
      case 'len3': { var m1 = V(d[0]), m2 = V(d[1]); return m1 && m2 ? { k: 'len3', a: m1, b: m2 } : null; }
      case 'mp3': { var ps3 = d.map(V); return ps3.every(Boolean) ? { k: 'mp', pts: ps3 } : null; }
      case 'matP': {
        var q0 = V(d[0]), q1 = V(d[1]), q2 = V(d[2]); if (!q0 || !q1 || !q2) return null;
        var nP = cr3(sub3(q1, q0), sub3(q2, q0)); if (len3(nP) < 1e-9) return null;
        var cP = mul3(add3(add3(q0, q1), q2), 1 / 3), e1 = unit3(sub3(q1, q0)), e2 = unit3(cr3(nP, e1)), R = Math.max(len3(sub3(q0, cP)), len3(sub3(q1, cP)), len3(sub3(q2, cP))) * (o.co || 1.1);
        return { k: 'mp', P: 1, pts: [[-1.35, -1], [1.35, -1], [1.35, 1], [-1.35, 1]].map(function (t) { return add3(cP, add3(mul3(e1, t[0] * R), mul3(e2, t[1] * R))); }) };
      }
      case 'rt3': { var vs = d.map(V); return vs.every(Boolean) ? { k: 'rt', pts: vs } : null; }
      case 'solid': { var f = o.f.map(function (mat) { return mat.map(V); }); return f.every(function (m) { return m.every(Boolean); }) ? { k: 'solid', f: f } : null; }
      case 'sec': { var s3 = SC().objs.filter(function (z) { return z.t === 'solid'; })[0]; var A3 = V(d[0]), B3 = V(d[1]), C3 = V(d[2]); if (!A3 || !B3 || !C3) return null; if (s3 && VAL[s3.id]) return thietDien(VAL[s3.id], A3, B3, C3); var hk = khoiTuDong(); return hk ? thietDien({ f: hk }, A3, B3, C3) : null; }
      case 'cone': case 'cyl': { var p0 = V(d[0]), p1b = V(d[1]); return p0 && p1b ? { k: o.t, a: p0, b: p1b, r: o.r } : null; }
      case 'sph': { var c4 = V(d[0]); return c4 ? { k: 'sph', c: c4, r: o.r } : null; }
    }
    return null;
  }
  function laDiem3(o) { return o && /^(p3|mid3|on3|cen3|projP|projL|int3|intLP|up3|tr3)$/.test(o.t); }
  function thietDien(sol, A, B, C) {
    var n = cr3(sub3(B, A), sub3(C, A)); if (len3(n) < 1e-12) return null;
    var ds = [], L = 0, canh = {};
    sol.f.forEach(function (f) { f.forEach(function (p) { L = Math.max(L, len3(sub3(p, A))); }); });
    var eps = 1e-9 * (L + 1) * len3(n);
    var them_ = function (p) { for (var i = 0; i < ds.length; i++) if (len3(sub3(ds[i], p)) < 1e-7 * (L + 1)) return; ds.push(p); };
    sol.f.forEach(function (f) {
      for (var i = 0; i < f.length; i++) {
        var P = f[i], Q = f[(i + 1) % f.length], dp = dot3(n, sub3(P, A)), dq = dot3(n, sub3(Q, A));
        if (Math.abs(dp) <= eps) them_(P);
        if ((dp < -eps && dq > eps) || (dp > eps && dq < -eps)) them_(add3(P, mul3(sub3(Q, P), dp / (dp - dq))));
      }
    });
    if (ds.length < 3) return null;
    var c = P3(0, 0, 0); ds.forEach(function (p) { c = add3(c, p); }); c = mul3(c, 1 / ds.length);
    var e1 = unit3(sub3(ds[0], c)), e2 = unit3(cr3(unit3(n), e1));
    ds.sort(function (p, q) { var a = sub3(p, c), b = sub3(q, c); return Math.atan2(dot3(a, e2), dot3(a, e1)) - Math.atan2(dot3(b, e2), dot3(b, e1)); });
    return { k: 'sec', pts: ds };
  }
  // ---- phép chiếu: xoay tự do (chiếu song song vuông góc) hoặc kiểu SGK (chiếu song song xiên)
  var CAM = null;
  function lapCam() {
    var v = S.d3.view, cx = W / 2 + v.ox, cy = H / 2 + v.oy, s = v.s;
    if (v.sgk) {
      var a = 0.45 * Math.cos(Math.PI / 5.2), b = 0.45 * Math.sin(Math.PI / 5.2);
      CAM = { proj: function (p) { return { x: cx + s * (p.x + a * p.y), y: cy - s * (p.z + b * p.y) }; }, toi: unit3(P3(a, -1, b)), sgk: true };
    } else {
      var f = v.yaw, t = v.pitch, u = P3(Math.cos(t) * Math.cos(f), Math.cos(t) * Math.sin(f), Math.sin(t)), ex = P3(-Math.sin(f), Math.cos(f), 0), ey = P3(-Math.sin(t) * Math.cos(f), -Math.sin(t) * Math.sin(f), Math.cos(t));
      CAM = { proj: function (p) { return { x: cx + s * dot3(ex, p), y: cy - s * dot3(ey, p) }; }, toi: u };
    }
  }
  // ---- che khuất: tia từ điểm P đi về phía người nhìn có cắt mặt nào không
  var CHE = [], KT = 1;
  // ---- khối tự động: hình vẽ tay bằng "Nối 2 điểm" (chưa có khối) -> bao lồi của các điểm đã nối dùng làm khối che khuất
  function baoLoi(ps) {   // bao lồi 3D (thêm dần từng điểm); trả về các mặt tam giác [p, q, r] hoặc null nếu các điểm đồng phẳng
    var n = ps.length; if (n < 4) return null;
    var L = 1; ps.forEach(function (p) { L = Math.max(L, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)); });
    var eps = 1e-7 * L;
    var i0 = 0, i1 = -1, i2 = -1, i3 = -1, k;
    for (k = 1; k < n; k++) if (len3(sub3(ps[k], ps[i0])) > 1e-6 * L) { i1 = k; break; }
    if (i1 < 0) return null;
    for (k = 1; k < n; k++) if (len3(cr3(sub3(ps[i1], ps[i0]), sub3(ps[k], ps[i0]))) > 1e-6 * L * L) { i2 = k; break; }
    if (i2 < 0) return null;
    var nn = cr3(sub3(ps[i1], ps[i0]), sub3(ps[i2], ps[i0]));
    for (k = 1; k < n; k++) if (Math.abs(dot3(nn, sub3(ps[k], ps[i0]))) > 1e-6 * L * len3(nn)) { i3 = k; break; }
    if (i3 < 0) return null;
    var tam = mul3(add3(add3(ps[i0], ps[i1]), add3(ps[i2], ps[i3])), 0.25);
    var mat = function (a, b, c) { var no = cr3(sub3(ps[b], ps[a]), sub3(ps[c], ps[a])); if (dot3(no, sub3(tam, ps[a])) > 0) { var t = b; b = c; c = t; no = mul3(no, -1); } return { a: a, b: b, c: c, n: no }; };
    var F = [mat(i0, i1, i2), mat(i0, i1, i3), mat(i0, i2, i3), mat(i1, i2, i3)];
    for (k = 0; k < n; k++) {
      if (k === i0 || k === i1 || k === i2 || k === i3) continue;
      var thay_ = F.filter(function (m) { return dot3(m.n, sub3(ps[k], ps[m.a])) > eps * len3(m.n); });
      if (!thay_.length) continue;
      var canh = {};
      thay_.forEach(function (m) { [[m.a, m.b], [m.b, m.c], [m.c, m.a]].forEach(function (e) { canh[e[0] + ',' + e[1]] = e; }); });
      F = F.filter(function (m) { return thay_.indexOf(m) < 0; });
      Object.keys(canh).forEach(function (key) { var e = canh[key]; if (!canh[e[1] + ',' + e[0]]) F.push(mat(e[0], e[1], k)); });
    }
    return F.map(function (m) { return [ps[m.a], ps[m.b], ps[m.c]]; });
  }
  function khoiCanh_() {   // khối tự động dưới dạng danh sách cạnh (id) để đặt tên giao điểm thiết diện
    var f = []; SC().objs.forEach(function (o) { if (o.t === 'seg3' && !o.an) f.push([o.d[0], o.d[1]]); });
    return { f: f };
  }
  function khoiTuDong() {
    if (SC().objs.some(function (o) { return o.t === 'solid' && !o.an && VAL[o.id]; })) return null;
    var dung = {}, ps = [];
    SC().objs.forEach(function (o) { if (o.t === 'seg3' && !o.an) o.d.forEach(function (id) { dung[id] = 1; }); });
    SC().objs.forEach(function (o) {
      if (!dung[o.id] || !laDiem3(o) || !VAL[o.id]) return;
      var p = VAL[o.id]; if (!ps.some(function (q) { return len3(sub3(p, q)) < 1e-9; })) ps.push(p);
    });
    return ps.length >= 4 ? baoLoi(ps) : null;
  }
  function lapChe() {
    CHE = []; var pts = [];
    SC().objs.forEach(function (o) {
      var v = VAL[o.id]; if (!v || o.an) return;
      if (v.k === 'solid') v.f.forEach(function (f) { themMat(f); });
      if (BUOC && !BUOC.hien[o.id] && /cone|cyl|sph|mp/.test(v.k)) return;
      if (v.k === 'cone' || v.k === 'cyl') matCong(v).forEach(themMat);
      if (v.k === 'sph') CHE.push({ cau: 1, c: v.c, r: v.r });
      if (v.k === 'mp' && o.che) themMat(v.pts);
      if (laDiem3(o)) pts.push(v);
    });
    var bb = 1; pts.forEach(function (p) { bb = Math.max(bb, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)); }); KT = bb;
    var tuDong = khoiTuDong(); if (tuDong) tuDong.forEach(themMat);
  }
  function themMat(f) {
    if (f.length < 3) return;
    var n = P3(0, 0, 0); for (var i = 0; i < f.length; i++) { var a = f[i], b = f[(i + 1) % f.length]; n = add3(n, P3((a.y - b.y) * (a.z + b.z), (a.z - b.z) * (a.x + b.x), (a.x - b.x) * (a.y + b.y))); }   // pháp tuyến Newell
    if (len3(n) < 1e-12) return;
    n = unit3(n);
    var ax = Math.abs(n.x) >= Math.abs(n.y) && Math.abs(n.x) >= Math.abs(n.z) ? 'x' : Math.abs(n.y) >= Math.abs(n.z) ? 'y' : 'z';
    var k1 = ax === 'x' ? 'y' : 'x', k2 = ax === 'z' ? 'y' : 'z';
    var lo1 = Infinity, hi1 = -Infinity, lo2 = Infinity, hi2 = -Infinity;
    var p2 = f.map(function (p) { lo1 = Math.min(lo1, p[k1]); hi1 = Math.max(hi1, p[k1]); lo2 = Math.min(lo2, p[k2]); hi2 = Math.max(hi2, p[k2]); return { x: p[k1], y: p[k2] }; });
    CHE.push({ n: n, c: dot3(n, f[0]), k1: k1, k2: k2, p2: p2, bb: [lo1, hi1, lo2, hi2] });
  }
  function biKhuat(P) {
    var T = CAM.toi, eps = 1e-7 * KT;
    for (var i = 0; i < CHE.length; i++) {
      var m = CHE[i];
      if (m.cau) {
        var w = sub3(P, m.c), bq = dot3(T, w), cq = dot3(w, w) - m.r * m.r, de = bq * bq - cq;
        if (de <= 0) continue;
        var sq = Math.sqrt(de), t1 = -bq - sq, t2 = -bq + sq;
        if (t2 > 0.02 * m.r) return true;   // điểm lấy mẫu hơi lọt vào trong mặt cầu (trung điểm dây cung) không tính là bị che
        continue;
      }
      var dn = dot3(m.n, T); if (Math.abs(dn) < 1e-12) continue;
      var t = (m.c - dot3(m.n, P)) / dn; if (t <= eps * 10) continue;
      var Hh = add3(P, mul3(T, t)), x = Hh[m.k1], y = Hh[m.k2];
      if (x < m.bb[0] - eps || x > m.bb[1] + eps || y < m.bb[2] - eps || y > m.bb[3] + eps) continue;
      if (trongNghiem(m.p2, x, y, eps * 20)) return true;
    }
    return false;
  }
  function trongNghiem(ps, x, y, tol) {   // trong đa giác, cách biên > tol
    var c = false;
    for (var i = 0, j = ps.length - 1; i < ps.length; j = i++) {
      var a = ps[i], b = ps[j];
      if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) c = !c;
      var d = { x: b.x - a.x, y: b.y - a.y }, L = d.x * d.x + d.y * d.y, t = L ? Math.max(0, Math.min(1, ((x - a.x) * d.x + (y - a.y) * d.y) / L)) : 0;
      if (Math.hypot(x - (a.x + d.x * t), y - (a.y + d.y * t)) < tol) return true;   // tia đi đúng qua mép (đường ghép hai mặt) vẫn tính là bị che, tránh lọt khe
    }
    return c;
  }
  // nét 3D: chia nhỏ, đoạn khuất vẽ đứt
  function net3(A, B, mau, w, kieu, N) {
    var pa = CAM.proj(A), pb = CAM.proj(B), n = Math.max(6, Math.min(240, Math.ceil(len2(sub2(pa, pb)) / 3)));
    if (kieu === 'lien' || kieu === 'dut') { N.push({ t: 'line', p: [pa, pb], c: mau, w: w, dash: kieu === 'dut' }); return; }
    var trc = null, dau = 0;
    for (var i = 0; i <= n; i++) {
      var kh = i < n ? biKhuat(add3(A, mul3(sub3(B, A), (i + 0.5) / n))) : null;
      if (i === n || (trc !== null && kh !== trc)) {
        var p0 = add2(pa, mul2(sub2(pb, pa), dau / n)), p1 = add2(pa, mul2(sub2(pb, pa), i / n));
        N.push({ t: 'line', p: [p0, p1], c: mau, w: trc ? w * 0.85 : w, dash: trc });
        dau = i;
      }
      trc = kh;
    }
  }
  function duongCong3(pts, mau, w, N, dong) {   // đường cong (đường tròn đáy…) nhiều điểm: gộp đoạn cùng trạng thái
    var m = dong ? pts.length : pts.length - 1, run = [], trc = null;
    var day = function () { if (run.length > 1) N.push({ t: 'line', p: run, c: mau, w: trc ? w * 0.85 : w, dash: trc }); };
    for (var i = 0; i < m; i++) {
      var A = pts[i], B = pts[(i + 1) % pts.length], kh = biKhuat(mul3(add3(A, B), 0.5));
      if (kh !== trc) { day(); run = [CAM.proj(A)]; trc = kh; }
      run.push(CAM.proj(B));
    }
    day();
  }
  function coSo(trucv) { var w = unit3(trucv), t = Math.abs(w.z) < 0.9 ? P3(0, 0, 1) : P3(1, 0, 0), e1 = unit3(cr3(t, w)), e2 = cr3(w, e1); return [e1, e2, w]; }
  var NC = 96;
  function vongTron(c, r, b) { var L = []; for (var i = 0; i < NC; i++) { var a = 2 * Math.PI * i / NC; L.push(add3(c, add3(mul3(b[0], r * Math.cos(a)), mul3(b[1], r * Math.sin(a))))); } return L; }
  function matCong(v) {   // nón: v.a đỉnh, v.b tâm đáy · trụ: v.a tâm đáy dưới, v.b tâm đáy trên
    var b = coSo(sub3(v.a, v.b)), F = [];
    if (v.k === 'cone') { var day = vongTron(v.b, v.r, b); for (var i = 0; i < NC; i++) F.push([v.a, day[i], day[(i + 1) % NC]]); F.push(day); }
    else { var d1 = vongTron(v.a, v.r, b), d2 = vongTron(v.b, v.r, b); for (var j = 0; j < NC; j++) F.push([d1[j], d1[(j + 1) % NC], d2[(j + 1) % NC], d2[j]]); F.push(d1); F.push(d2); }
    return F;
  }
  function veCong(v, N) {
    var b = v.a ? coSo(sub3(v.a, v.b)) : null, T = CAM.toi;
    if (v.k === 'cone') {
      var day = vongTron(v.b, v.r, b);
      duongCong3(day, '#1e1a2e', 1.9, N, true);
      var mt = []; for (var i = 0; i < NC; i++) { var nn = cr3(sub3(day[i], v.a), sub3(day[(i + 1) % NC], v.a)); if (dot3(nn, sub3(mul3(add3(day[i], day[(i + 1) % NC]), 0.5), v.b)) < 0) nn = mul3(nn, -1); mt.push(dot3(nn, T) > 0); }
      for (var k = 0; k < NC; k++) if (mt[k] !== mt[(k + NC - 1) % NC]) net3(v.a, day[k], '#1e1a2e', 1.9, 'tu', N);
    } else if (v.k === 'cyl') {
      var d1 = vongTron(v.a, v.r, b), d2 = vongTron(v.b, v.r, b);
      duongCong3(d1, '#1e1a2e', 1.9, N, true); duongCong3(d2, '#1e1a2e', 1.9, N, true);
      var m2 = []; for (var j = 0; j < NC; j++) { var dir = sub3(mul3(add3(d1[j], d1[(j + 1) % NC]), 0.5), v.a); m2.push(dot3(dir, T) > 0); }
      for (var q = 0; q < NC; q++) if (m2[q] !== m2[(q + NC - 1) % NC]) net3(d1[q], d2[q], '#1e1a2e', 1.9, 'tu', N);
    } else if (v.k === 'sph') {
      var c = CAM.proj(v.c);
      N.push({ t: 'circle', x: c.x, y: c.y, r: v.r * S.d3.view.s * (CAM.sgk ? 1 : 1), c: '#1e1a2e', w: 1.9 });
      duongCong3(vongTron(v.c, v.r, [P3(1, 0, 0), P3(0, 1, 0)]), '#1e1a2e', 1.6, N, true);
    }
  }
  function nets3() {
    lapCam(); lapChe();
    var N = [], nhan = [], KK = K(), L = SC().objs.filter(function (o) { return hienO(o) && VAL[o.id]; });
    var sang = function (o) { return laChon(o.id) || o.id === hover || (BUOC && BUOC.moi[o.id]); };
    if (S.d3.luoi) {   // lưới ô vuông trên mặt phẳng đáy z = 0 (mỗi ô 1 đơn vị)
      var R = Math.max(3, Math.ceil(KT * 1.4)), bl = R > 12 ? 2 : 1;
      for (var gi = -R; gi <= R; gi += bl) {
        N.push({ t: 'line', p: [CAM.proj(P3(gi, -R, 0)), CAM.proj(P3(gi, R, 0))], c: gi ? '#e6e1f2' : '#d4cce8', w: 1 });
        N.push({ t: 'line', p: [CAM.proj(P3(-R, gi, 0)), CAM.proj(P3(R, gi, 0))], c: gi ? '#e6e1f2' : '#d4cce8', w: 1 });
      }
    }
    var tatCa = []; L.forEach(function (o) { if (laDiem3(o)) tatCa.push(CAM.proj(VAL[o.id])); });
    var tamMH = { x: W / 2, y: H / 2 }; if (tatCa.length) { tamMH = { x: 0, y: 0 }; tatCa.forEach(function (p) { tamMH = add2(tamMH, p); }); tamMH = mul2(tamMH, 1 / tatCa.length); }
    if (S.d3.truc) {
      var O = P3(0, 0, 0), dai = KT * 1.35;
      [['x', P3(dai, 0, 0)], ['y', P3(0, dai, 0)], ['z', P3(0, 0, dai)]].forEach(function (a) {
        var p0 = CAM.proj(O), p1 = CAM.proj(a[1]); N.push({ t: 'line', p: [p0, p1], c: '#64748b', w: 1.3, mui: 1 });
        N.push({ t: 'text', x: p1.x + 8, y: p1.y - 6, s: a[0], c: '#475569', size: 15, i: 1 });
      });
      var po = CAM.proj(O); N.push({ t: 'text', x: po.x - 14, y: po.y + 14, s: 'O', c: '#475569', size: 14, i: 1 });
    }
    if (S.d3.toKhoi) toKhoi(L, N);
    L.forEach(function (o) { var v = VAL[o.id]; if (v.k === 'sec') N.push({ t: 'poly', p: v.pts.map(CAM.proj), fill: hexA(o.mau || '#ea580c', S.d3.toKhoi ? 0.55 : 0.22), c: null }); });
    L.forEach(function (o) {
      var v = VAL[o.id]; if (v.k !== 'mp') return;
      if (sang(o)) N.push({ t: 'poly', p: v.pts.map(CAM.proj), fill: 'rgba(91,63,208,.12)', c: null });
      N.push({ t: 'poly', p: v.pts.map(CAM.proj), fill: o.to === false ? null : hexA(o.mau || '#2563eb', 0.11), c: null });
    });
    L.forEach(function (o) { var v = VAL[o.id]; if (v.k === 'cone' || v.k === 'cyl' || v.k === 'sph') veCong(v, N); });
    L.forEach(function (o) {
      var v = VAL[o.id];
      if (v.k === 'seg') {
        if (sang(o)) N.push({ t: 'line', p: [CAM.proj(v.a), CAM.proj(v.b)], c: laChon(o.id) ? 'rgba(91,63,208,.35)' : 'rgba(91,63,208,.2)', w: 8 });
        net3(v.a, v.b, o.mau || (o.canh ? '#1e1a2e' : '#2563eb'), (o.day || (o.canh ? 2 : 1.8)) * KK.day, o.net || 'tu', N);
        if (o.ten && !o.anTen) { var gm = CAM.proj(mul3(add3(v.a, v.b), 0.5)); nhan.push({ t: 'text', x: gm.x + 9, y: gm.y - 7, s: tenHien(o.ten), c: o.mauTen || o.mau || KK.mauTen, size: o.coTen || KK.coTen - 2, b: 1, i: 1 }); }
      }
      if (v.k === 'line3') {
        var du = sub3(v.b, v.a), A2 = sub3(v.a, mul3(du, o.ra || 0.45)), B2 = add3(v.b, mul3(du, o.ra || 0.45));
        if (sang(o)) N.push({ t: 'line', p: [CAM.proj(A2), CAM.proj(B2)], c: laChon(o.id) ? 'rgba(91,63,208,.35)' : 'rgba(91,63,208,.2)', w: 8 });
        net3(A2, B2, o.mau || '#2563eb', (o.day || 1.8) * KK.day, o.net || 'tu', N);
        if (o.ten && !o.anTen) { var gl = CAM.proj(B2); nhan.push({ t: 'text', x: gl.x + 10, y: gl.y - 6, s: tenHien(o.ten), c: o.mauTen || o.mau || '#2563eb', size: o.coTen || KK.coTen - 1, b: 1, i: 1 }); }
      }
      if (v.k === 'mp' && (o.vien || v.P)) for (var j = 0; j < v.pts.length; j++) net3(v.pts[j], v.pts[(j + 1) % v.pts.length], o.mau || '#2563eb', 1.5 * KK.day, o.net || 'tu', N);
      if (v.k === 'mp' && o.ten && !o.anTen) { var gp = CAM.proj(v.pts[v.P ? 2 : 0]); nhan.push({ t: 'text', x: gp.x - 16, y: gp.y + 18, s: tenHien(o.ten), c: o.mauTen || o.mau || '#2563eb', size: o.coTen || KK.coTen - 1, b: 1, i: 1 }); }
      if (v.k === 'len3') { var gn = CAM.proj(add3(v.a, mul3(sub3(v.b, v.a), 0.36))), gd = sub2(CAM.proj(v.b), CAM.proj(v.a)), gl = len2(gd) || 1, gv = { x: gd.y / gl, y: -gd.x / gl }; if (dot2(gv, sub2(gn, tamMH)) > 0) gv = mul2(gv, -1); gn = add2(gn, mul2(gv, 16)); nhan.push({ t: 'text', x: gn.x, y: gn.y + 4, s: tenHien(ten2(o.d[0])) + tenHien(ten2(o.d[1])) + ' = ' + so(len3(sub3(v.a, v.b))), c: o.mau || '#ea580c', size: 13, b: 1, nen: 1 }); }
      if (v.k === 'sec') for (var i = 0; i < v.pts.length; i++) net3(v.pts[i], v.pts[(i + 1) % v.pts.length], o.mau || '#ea580c', 2, 'tu', N);
      if (v.k === 'rt') {
        var B = v.pts[1], u1 = unit3(sub3(v.pts[0], B)), u2 = unit3(sub3(v.pts[2], B)), s = Math.min(KT * 0.11, len3(sub3(v.pts[0], B)) * 0.3, len3(sub3(v.pts[2], B)) * 0.3);
        var q1 = add3(B, mul3(u1, s)), q2 = add3(q1, mul3(u2, s)), q3 = add3(B, mul3(u2, s)), kh = biKhuat(q2);
        N.push({ t: 'line', p: [CAM.proj(q1), CAM.proj(q2), CAM.proj(q3)], c: o.mau || '#dc2626', w: 1.5, dash: kh });
      }
    });
    L.forEach(function (o) {
      if (!laDiem3(o)) return;
      var p = CAM.proj(VAL[o.id]), noi = sang(o);
      if (noi) N.push({ t: 'dot', x: p.x, y: p.y, r: 9, fill: laChon(o.id) ? 'rgba(91,63,208,.3)' : 'rgba(91,63,208,.18)' });
      N.push({ t: 'dot', x: p.x, y: p.y, r: (o.t === 'p3' ? 3.6 : 3.2) * KK.coDiem, fill: o.mau || (o.t === 'p3' ? '#1e1a2e' : '#dc2626') });
      if (o.ten && !o.anTen) {
        var d = sub2(p, tamMH), l = len2(d); d = l > 1 ? mul2(d, 1 / l) : { x: 0.6, y: -0.8 };
        if (o.lx != null) d = { x: o.lx, y: o.ly };
        var kc = 9 + (o.coTen || KK.coTen) * 0.4;
        nhan.push({ t: 'text', x: p.x + d.x * kc, y: p.y + d.y * kc + 5, s: tenHien(o.ten), c: o.mauTen || KK.mauTen, size: o.coTen || KK.coTen, b: 1, i: 1 });
      }
    });
    if (tam) N.push.apply(N, tam);
    if (S.mode === '3d') veKP(N);
    return N.concat(nhan);
  }
  // Tô các mặt nhìn thấy của khối (đa diện, nón, trụ, cầu): màu theo góc chiếu sáng, mặt xa vẽ trước
  function sangMau(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255, f = function (c) { return Math.max(0, Math.min(255, Math.round(k < 1 ? c * k : c + (255 - c) * (k - 1)))); }; return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  function toKhoi(L, N) {
    var T = CAM.toi, den = unit3(add3(T, P3(-0.25, 0.15, 0.9))), mau = S.d3.mauKhoi || '#60a5fa', mats = [];
    var them_ = function (f, tam, goc) {
      var n = P3(0, 0, 0); for (var i = 0; i < f.length; i++) { var a = f[i], b = f[(i + 1) % f.length]; n = add3(n, P3((a.y - b.y) * (a.z + b.z), (a.z - b.z) * (a.x + b.x), (a.x - b.x) * (a.y + b.y))); }
      if (len3(n) < 1e-12) return; n = unit3(n);
      var c = P3(0, 0, 0); f.forEach(function (p) { c = add3(c, p); }); c = mul3(c, 1 / f.length);
      if (dot3(n, sub3(c, tam)) < 0) n = mul3(n, -1);          // pháp tuyến hướng ra ngoài
      if (dot3(n, T) <= 1e-9) return;                          // mặt quay lưng: bị che
      mats.push({ p: f.map(CAM.proj), sau: dot3(c, T), k: 0.5 + 0.9 * Math.max(0, dot3(n, den)), mau: goc });
    };
    var tuDong = khoiTuDong();
    if (tuDong) { var tt = P3(0, 0, 0), sl = 0; tuDong.forEach(function (f) { f.forEach(function (p) { tt = add3(tt, p); sl++; }); }); tt = mul3(tt, 1 / sl); tuDong.forEach(function (f) { them_(f, tt, mau); }); }
    L.forEach(function (o) {
      var v = VAL[o.id];
      if (v.k === 'solid') { var ds = [], tam = P3(0, 0, 0); v.f.forEach(function (f) { f.forEach(function (p) { ds.push(p); }); }); ds.forEach(function (p) { tam = add3(tam, p); }); tam = mul3(tam, 1 / (ds.length || 1)); v.f.forEach(function (f) { them_(f, tam, o.mau || mau); }); }
      if (v.k === 'cone' || v.k === 'cyl') { var tc = mul3(add3(v.a, v.b), 0.5); matCong(v).forEach(function (f) { them_(f, tc, mau); }); }
      if (v.k === 'sph') { var c = CAM.proj(v.c), r = v.r * S.d3.view.s; N.push({ t: 'circle', x: c.x, y: c.y, r: r, fill: sangMau(mau, 1.25), c: null }); N.push({ t: 'circle', x: c.x - r * 0.18, y: c.y - r * 0.2, r: r * 0.72, fill: sangMau(mau, 1.45), c: null }); N.push({ t: 'circle', x: c.x - r * 0.32, y: c.y - r * 0.36, r: r * 0.3, fill: sangMau(mau, 1.7), c: null }); }
    });
    mats.sort(function (a, b) { return a.sau - b.sau; }).forEach(function (m) { N.push({ t: 'poly', p: m.p, fill: sangMau(m.mau, m.k), c: sangMau(m.mau, m.k), w: 0.6 }); });
  }
  // ================================================================== KHÁM PHÁ HÌNH KHÔNG GIAN
  var KP = { bat: false, k: null };
  var TEN_DAY = { vuong: 'hình vuông', chunhat: 'hình chữ nhật', binhhanh: 'hình bình hành', thoi: 'hình thoi', thang: 'hình thang vuông', deu: 'tam giác đều', vuongB: 'tam giác vuông tại B', vuongA: 'tam giác vuông tại A', can: 'tam giác cân tại A' };
  function dtDaGiac(ps) { var n = P3(0, 0, 0); for (var i = 0; i < ps.length; i++) n = add3(n, cr3(ps[i], ps[(i + 1) % ps.length])); return len3(n) / 2; }
  function gocDo(A, O, B) { var u = sub3(A, O), v = sub3(B, O); return Math.acos(Math.max(-1, Math.min(1, dot3(u, v) / (len3(u) * len3(v))))) * 180 / Math.PI; }
  function chieuMP(P, A, B, C) { var n = cr3(sub3(B, A), sub3(C, A)); return sub3(P, mul3(n, dot3(sub3(P, A), n) / dot3(n, n))); }
  function dsKP() {
    var ct = SC().cauTruc; if (!ct) return [];
    var I = ct.ids, P = function (t) { var id = I[t]; return id && VAL[id] && VAL[id].x != null ? VAL[id] : null; }, T = function (t) { return tenHien(t); };
    var L_ = function (a, b) { return len3(sub3(P(a), P(b))); }, sd = function (x, n) { return so(x, n == null ? 2 : n); };
    var ds = [], them_ = function (k, ten, mo, hinh) { ds.push({ k: k, ten: ten, mo: mo, hinh: hinh || {} }); };
    var mats = function (ds_) { return ds_.map(function (f) { return f.map(P); }); }, segs = function (ds_) { return ds_.map(function (e) { return [P(e[0]), P(e[1])]; }); };
    var loai = ct.loai;
    if (loai === 'chop4' || loai === 'chop3') {
      var day = loai === 'chop4' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'], n = day.length, chan = ct.chan || 'A';
      var tenDay = day.join(''), canhDay = day.map(function (x, i) { return [x, day[(i + 1) % n]]; }), canhBen = day.map(function (x) { return ['S', x]; });
      var Sday = dtDaGiac(day.map(P)), hc = len3(sub3(P('S'), P(chan))), V = Sday * hc / 3, deu = (ct.kd === 'vuong' || ct.kd === 'deu') && (chan === 'O' || chan === 'G');
      them_('dinh', '📍 Đỉnh', 'Điểm <b>S</b> là <b>đỉnh</b> của hình chóp — điểm chung của tất cả các mặt bên.', { diem: [P('S')] });
      them_('day', '🟧 Mặt đáy', 'Đáy là ' + (TEN_DAY[ct.kd] || 'đa giác') + ' <b>' + tenDay + '</b>. Diện tích đáy S<sub>đáy</sub> ≈ <b>' + sd(Sday) + '</b>.', { mat: mats([day]) });
      them_('canhday', '➖ Cạnh đáy', n + ' cạnh đáy: ' + canhDay.map(function (e) { return '<b>' + e.join('') + '</b> = ' + sd(L_(e[0], e[1])); }).join(', ') + '.', { seg: segs(canhDay) });
      them_('canhben', '📐 Cạnh bên', n + ' cạnh bên (nối đỉnh với các đỉnh của đáy): ' + canhBen.map(function (e) { return '<b>' + e.join('') + '</b> = ' + sd(L_(e[0], e[1])); }).join(', ') + '.' + (deu ? ' Hình chóp đều nên <b>các cạnh bên bằng nhau</b>.' : ''), { seg: segs(canhBen) });
      them_('matben', '🔺 Mặt bên', n + ' mặt bên là các tam giác ' + day.map(function (x, i) { return '<b>S' + x + day[(i + 1) % n] + '</b>'; }).join(', ') + '.' + (deu ? ' Các mặt bên là những <b>tam giác cân bằng nhau</b>.' : ''), { mat: mats(day.map(function (x, i) { return ['S', x, day[(i + 1) % n]]; })) });
      them_('cao', '📏 Đường cao', '<b>S' + T(chan) + '</b> ⊥ (' + tenDay + '), độ dài đường cao h = S' + T(chan) + ' ≈ <b>' + sd(hc) + '</b>.' + (chan === 'A' ? ' Cạnh bên SA vuông góc với đáy nên SA chính là đường cao.' : chan === 'O' ? ' Chân đường cao là giao điểm O của hai đường chéo đáy.' : chan === 'G' ? ' Chân đường cao là trọng tâm G (cũng là tâm) của tam giác đáy.' : ' Mặt bên (SAB) vuông góc với đáy nên chân đường cao H nằm trên AB.'), { seg: [[P('S'), P(chan)]], diem: [P(chan)] });
      if (chan === 'A') them_('vuong', '⊾ Tính chất SA ⊥ đáy', 'SA ⊥ (' + tenDay + ') nên SA vuông góc với mọi đường thẳng nằm trong đáy: SA ⊥ AB, SA ⊥ A' + day[n - 1] + '. Các tam giác <b>SAB</b>, <b>SA' + day[n - 1] + '</b> vuông tại A.', { mat: mats([['S', 'A', 'B'], ['S', 'A', day[n - 1]]]), seg: segs([['S', 'A']]) });
      if (deu) them_('deu', '⭐ Hình chóp đều', 'Đáy là đa giác đều, chân đường cao trùng với <b>tâm của đáy</b> (' + T(chan) + '). Suy ra: các cạnh bên bằng nhau, các mặt bên là các tam giác cân bằng nhau, góc giữa các cạnh bên với đáy bằng nhau.', { seg: segs(canhBen.concat([['S', chan]])), diem: [P(chan)] });
      var C1 = day[Math.min(2, n - 1)], goc1 = chan === C1 ? 90 : gocDo(P('S'), P(C1), P(chan));
      them_('goccb', '∠ Góc cạnh bên – đáy', 'Hình chiếu của S lên đáy là ' + T(chan) + ' nên góc giữa S' + C1 + ' và đáy là góc <b>S' + C1 + T(chan) + '</b> ≈ <b>' + sd(goc1, 1) + '°</b>.', { seg: segs([['S', C1]]), duong: [[P(C1), P(chan)], [P('S'), P(chan)]], diem: [P(chan)] });
      them_('dem', '🔢 Đỉnh – cạnh – mặt', 'Hình chóp có <b>' + (n + 1) + ' đỉnh</b>, <b>' + 2 * n + ' cạnh</b>, <b>' + (n + 1) + ' mặt</b>. Kiểm tra công thức Ơ-le: Đ − C + M = ' + (n + 1) + ' − ' + 2 * n + ' + ' + (n + 1) + ' = 2.', { diem: day.concat(['S']).map(P) });
      them_('V', '📦 Thể tích', 'V = ⅓ · S<sub>đáy</sub> · h = ⅓ · ' + sd(Sday) + ' · ' + sd(hc) + ' ≈ <b>' + sd(V) + '</b>.', { mat: mats([day]), seg: [[P('S'), P(chan)]] });
    } else if (loai === 'langtru' || loai === 'hop') {
      var d4 = loai === 'hop' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'], m = d4.length, tren = d4.map(function (x) { return x + "'"; });
      var Sd = dtDaGiac(d4.map(P)), An = P(d4[0]), Hn = chieuMP(P(tren[0]), P(d4[0]), P(d4[1]), P(d4[2])), hh = len3(sub3(P(tren[0]), Hn)), dung = ct.kieu !== 'xien';
      var ten2 = loai === 'hop' ? (ct.kieu === 'lp' ? 'Hình lập phương' : ct.kieu === 'xien' ? 'Hình hộp' : 'Hình hộp chữ nhật') : (dung ? 'Lăng trụ đứng' : 'Lăng trụ xiên');
      them_('day', '🟧 Hai đáy', 'Hai đáy <b>' + d4.join('') + '</b> và <b>' + tren.map(T).join('') + '</b> là hai ' + (loai === 'hop' ? (ct.kieu === 'xien' ? 'hình bình hành' : ct.kieu === 'lp' ? 'hình vuông' : 'hình chữ nhật') : (TEN_DAY[ct.kd] || 'tam giác')) + ' bằng nhau, nằm trên hai mặt phẳng song song. S<sub>đáy</sub> ≈ <b>' + sd(Sd) + '</b>.', { mat: mats([d4, tren]) });
      them_('canhben', '📐 Cạnh bên', 'Các cạnh bên ' + d4.map(function (x, i) { return '<b>' + x + T(tren[i]) + '</b>'; }).join(', ') + ' <b>song song và bằng nhau</b> (= ' + sd(L_(d4[0], tren[0])) + ').' + (dung ? ' ' + ten2 + ' có cạnh bên vuông góc với đáy.' : ''), { seg: segs(d4.map(function (x, i) { return [x, tren[i]]; })) });
      them_('matben', '▭ Mặt bên', 'Các mặt bên là các <b>' + (dung ? 'hình chữ nhật' : 'hình bình hành') + '</b>: ' + d4.map(function (x, i) { var j = (i + 1) % m; return '<b>' + x + d4[j] + T(tren[j]) + T(tren[i]) + '</b>'; }).join(', ') + '.', { mat: mats(d4.map(function (x, i) { var j = (i + 1) % m; return [x, d4[j], tren[j], tren[i]]; })) });
      them_('cao', '📏 Đường cao', dung ? 'Cạnh bên vuông góc với đáy nên chính là đường cao: h = ' + d4[0] + T(tren[0]) + ' ≈ <b>' + sd(hh) + '</b>.' : 'Hạ ' + T(tren[0]) + 'H ⊥ (' + d4.join('') + '): h = ' + T(tren[0]) + 'H ≈ <b>' + sd(hh) + '</b> (khoảng cách giữa hai đáy).', { duong: [[P(tren[0]), Hn]], diem: [Hn], seg: dung ? segs([[d4[0], tren[0]]]) : [] });
      if (loai === 'hop' && ct.kieu !== 'xien') { var dc = L_('A', "C'"); them_('cheo', '✳️ Đường chéo', 'Bốn đường chéo <b>AC\'</b>, <b>BD\'</b>, <b>CA\'</b>, <b>DB\'</b> bằng nhau, cắt nhau tại trung điểm mỗi đường. Độ dài: d = √(a² + b² + c²) ≈ <b>' + sd(dc) + '</b>.', { seg: segs([['A', "C'"], ['B', "D'"], ['C', "A'"], ['D', "B'"]]) }); }
      them_('dem', '🔢 Đỉnh – cạnh – mặt', 'Có <b>' + 2 * m + ' đỉnh</b>, <b>' + 3 * m + ' cạnh</b>, <b>' + (m + 2) + ' mặt</b>. Đ − C + M = ' + 2 * m + ' − ' + 3 * m + ' + ' + (m + 2) + ' = 2.', { diem: d4.concat(tren).map(P) });
      them_('V', '📦 Thể tích', 'V = S<sub>đáy</sub> · h = ' + sd(Sd) + ' · ' + sd(hh) + ' ≈ <b>' + sd(Sd * hh) + '</b>.', { mat: mats([d4]), duong: [[P(tren[0]), Hn]] });
      void An;
    } else if (loai === 'tudien') {
      var vuong = ct.kieu === 'vuong', dd = vuong ? ['O', 'A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
      var canh6 = [[dd[0], dd[1]], [dd[0], dd[2]], [dd[0], dd[3]], [dd[1], dd[2]], [dd[2], dd[3]], [dd[3], dd[1]]];
      var dinh = vuong ? 'O' : 'A', dayT = vuong ? ['A', 'B', 'C'] : ['B', 'C', 'D'], Hh = chieuMP(P(dinh), P(dayT[0]), P(dayT[1]), P(dayT[2])), hT = len3(sub3(P(dinh), Hh)), VT = dtDaGiac(dayT.map(P)) * hT / 3;
      them_('dinh', '📍 Bốn đỉnh', 'Tứ diện có 4 đỉnh <b>' + dd.join(', ') + '</b>; mỗi đỉnh nối với 3 đỉnh còn lại.', { diem: dd.map(P) });
      them_('canh', '➖ Sáu cạnh', canh6.map(function (e) { return '<b>' + e.join('') + '</b> = ' + sd(L_(e[0], e[1])); }).join(', ') + '.' + (vuong ? '' : ' Tứ diện đều: <b>6 cạnh bằng nhau</b>.'), { seg: segs(canh6) });
      them_('mat', '🔺 Bốn mặt', 'Bốn mặt là các tam giác ' + [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 2, 3]].map(function (t) { return '<b>' + t.map(function (i) { return dd[i]; }).join('') + '</b>'; }).join(', ') + '.' + (vuong ? ' Ba mặt OAB, OBC, OCA là tam giác vuông tại O.' : ' Tứ diện đều: 4 mặt là <b>tam giác đều</b>.'), { mat: mats([[dd[1], dd[2], dd[3]], [dd[0], dd[1], dd[2]]]) });
      if (vuong) them_('vuong', '⊾ Ba cạnh vuông góc', '<b>OA, OB, OC đôi một vuông góc</b>. Đường cao OH (H là trực tâm tam giác ABC) có 1/OH² = 1/OA² + 1/OB² + 1/OC², OH ≈ <b>' + sd(hT) + '</b>.', { seg: segs([['O', 'A'], ['O', 'B'], ['O', 'C']]), duong: [[P('O'), Hh]], diem: [Hh] });
      them_('cao', '📏 Đường cao', 'Hạ ' + dinh + 'H ⊥ (' + dayT.join('') + ')' + (vuong ? '' : ', H là tâm (trọng tâm) tam giác đều BCD') + ': h ≈ <b>' + sd(hT) + '</b>.', { duong: [[P(dinh), Hh]], diem: [Hh], mat: mats([dayT]) });
      them_('V', '📦 Thể tích', (vuong ? 'V = ⅙ · OA · OB · OC' : 'V = a³√2 / 12') + ' ≈ <b>' + sd(VT) + '</b>.', { mat: mats([dayT]), duong: [[P(dinh), Hh]] });
    } else if (loai === 'non' || loai === 'tru' || loai === 'cau') {
      var kh = SC().objs.filter(function (o) { return /^(cone|cyl|sph)$/.test(o.t); })[0], v = kh && VAL[kh.id]; if (!v) return ds;
      var r = v.r, PI = Math.PI;
      if (loai === 'non') {
        var h2 = len3(sub3(v.a, v.b)), l = Math.sqrt(r * r + h2 * h2), A2 = P('A'), A3 = sub3(mul3(v.b, 2), A2);
        them_('dinh', '📍 Đỉnh, đáy', 'Đỉnh <b>S</b>; đáy là hình tròn tâm <b>O</b>, bán kính r = OA = <b>' + sd(r) + '</b>.', { diem: [v.a], vong: [{ c: v.b, r: r, truc: sub3(v.a, v.b) }] });
        them_('cao', '📏 Đường cao (trục)', '<b>SO</b> ⊥ đáy, h = SO = <b>' + sd(h2) + '</b>. SO là trục của hình nón.', { seg: [[v.a, v.b]] });
        them_('sinh', '📐 Đường sinh', 'Đoạn nối đỉnh với một điểm trên đường tròn đáy, VD <b>SA</b>. l = √(r² + h²) ≈ <b>' + sd(l) + '</b>. Mọi đường sinh bằng nhau.', { seg: [[v.a, A2], [v.a, A3]] });
        them_('td', '🔺 Thiết diện qua trục', 'Mặt phẳng qua trục cắt hình nón theo <b>tam giác cân</b> SAA\' (cạnh đáy 2r, cạnh bên l).', { mat: [[v.a, A2, A3]] });
        them_('S', '🧻 Diện tích', 'S<sub>xq</sub> = πrl ≈ <b>' + sd(PI * r * l) + '</b>; S<sub>tp</sub> = πrl + πr² ≈ <b>' + sd(PI * r * l + PI * r * r) + '</b>.', { vong: [{ c: v.b, r: r, truc: sub3(v.a, v.b) }] });
        them_('V', '📦 Thể tích', 'V = ⅓ · πr² · h ≈ <b>' + sd(PI * r * r * h2 / 3) + '</b>.', { vong: [{ c: v.b, r: r, truc: sub3(v.a, v.b) }], seg: [[v.a, v.b]] });
      } else if (loai === 'tru') {
        var h3 = len3(sub3(v.b, v.a)), B1 = P('A'), B2 = P("A'"), B3 = sub3(mul3(v.a, 2), B1), B4 = add3(B3, sub3(v.b, v.a));
        them_('day', '🟧 Hai đáy', 'Hai đáy là hai hình tròn bằng nhau tâm <b>O</b>, <b>O\'</b>, bán kính r = <b>' + sd(r) + '</b>, nằm trên hai mặt phẳng song song.', { vong: [{ c: v.a, r: r, truc: sub3(v.b, v.a) }, { c: v.b, r: r, truc: sub3(v.b, v.a) }] });
        them_('truc', '📏 Trục, đường cao', '<b>OO\'</b> là trục, h = OO\' = <b>' + sd(h3) + '</b>.', { seg: [[v.a, v.b]] });
        them_('sinh', '📐 Đường sinh', 'Đường sinh <b>AA\'</b> song song và bằng trục: l = h = <b>' + sd(h3) + '</b>.', { seg: [[B1, B2], [B3, B4]] });
        them_('td', '▭ Thiết diện qua trục', 'Mặt phẳng qua trục cắt hình trụ theo <b>hình chữ nhật</b> kích thước 2r × h.', { mat: [[B1, B3, B4, B2]] });
        them_('S', '🧻 Diện tích', 'S<sub>xq</sub> = 2πrh ≈ <b>' + sd(2 * PI * r * h3) + '</b>; S<sub>tp</sub> = 2πrh + 2πr² ≈ <b>' + sd(2 * PI * r * h3 + 2 * PI * r * r) + '</b>.', { vong: [{ c: v.a, r: r, truc: sub3(v.b, v.a) }, { c: v.b, r: r, truc: sub3(v.b, v.a) }] });
        them_('V', '📦 Thể tích', 'V = πr² · h ≈ <b>' + sd(PI * r * r * h3) + '</b>.', { vong: [{ c: v.a, r: r, truc: sub3(v.b, v.a) }], seg: [[v.a, v.b]] });
      } else {
        var C0 = v.c, A4 = P('A'), A5 = sub3(mul3(C0, 2), A4);
        them_('tam', '📍 Tâm, bán kính', 'Mặt cầu tâm <b>O</b>, bán kính R = OA = <b>' + sd(r) + '</b>: tập hợp các điểm cách O một khoảng R.', { diem: [C0], seg: [[C0, A4]] });
        them_('kinh', '↔ Đường kính', 'Đoạn <b>AA\'</b> qua tâm, dài 2R = <b>' + sd(2 * r) + '</b>.', { seg: [[A4, A5]] });
        them_('lon', '⭕ Đường tròn lớn', 'Mặt phẳng qua tâm O cắt mặt cầu theo <b>đường tròn lớn</b> bán kính R.', { vong: [{ c: C0, r: r, truc: P3(0, 0, 1) }] });
        them_('S', '🧻 Diện tích mặt cầu', 'S = 4πR² ≈ <b>' + sd(4 * PI * r * r) + '</b>.', { vong: [{ c: C0, r: r, truc: P3(0, 0, 1) }] });
        them_('V', '📦 Thể tích khối cầu', 'V = ⁴⁄₃ πR³ ≈ <b>' + sd(4 / 3 * PI * r * r * r) + '</b>.', { diem: [C0] });
      }
    }
    return ds;
  }
  function veKP(N) {   // tô sáng tính chất đang chọn
    if (!KP.bat || !KP.k) return;
    var it = dsKP().filter(function (x) { return x.k === KP.k; })[0]; if (!it) return;
    var h = it.hinh, CAM_ = CAM;
    (h.mat || []).forEach(function (f) { if (f.every(Boolean)) N.push({ t: 'poly', p: f.map(CAM_.proj), fill: 'rgba(234,88,12,.30)', c: '#ea580c', w: 1.2 }); });
    (h.vong || []).forEach(function (vg) { var bs = coSo(vg.truc), ps = vongTron(vg.c, vg.r, bs); N.push({ t: 'poly', p: ps.map(CAM_.proj), fill: 'rgba(234,88,12,.25)', c: null }); duongCong3(ps, '#ea580c', 3, N, true); });
    (h.seg || []).forEach(function (e) { if (e[0] && e[1]) net3(e[0], e[1], '#ea580c', 4, 'tu', N); });
    (h.duong || []).forEach(function (e) { if (e[0] && e[1]) net3(e[0], e[1], '#16a34a', 2.6, 'tu', N); });
    (h.diem || []).forEach(function (p) { if (p) { var q = CAM_.proj(p); N.push({ t: 'circle', x: q.x, y: q.y, r: 11, c: '#ea580c', w: 3 }); } });
  }
  function moKP(k) {
    var ds = dsKP(); if (!ds.length) { thongBao('Chọn một hình mẫu ở bảng 🔍 Khám phá trước nhé.'); return; }
    KP.bat = true; KP.k = k || ds[0].k; veTheKP(); ve();
  }
  function veTheKP() {
    var the = $('#kp-the'); if (!the) return;
    var ds = dsKP(), i = ds.map(function (x) { return x.k; }).indexOf(KP.k);
    $('#goi-y').classList.toggle('an', !!(KP.bat && i >= 0));
    document.querySelectorAll('[data-kpk]').forEach(function (b) { b.classList.toggle('on', !!(KP.bat && b.dataset.kpk === KP.k)); });
    if (!KP.bat || i < 0) { the.classList.add('an'); return; }
    var it = ds[i], ten = (MAU3.filter(function (x) { return x.id === SC().cauTruc.loai; })[0] || {}).ten || '';
    the.innerHTML = '<div class="kp-dau"><small>🔍 ' + esc(ten) + ' · ' + (i + 1) + '/' + ds.length + '</small><button type="button" data-kp="tat" title="Tắt khám phá">✕</button></div><b>' + it.ten + '</b><p>' + it.mo + '</p>' +
      '<div class="kp-nut"><button type="button" data-kp="lui">◀</button><select data-kp="chon">' + ds.map(function (x) { return '<option value="' + x.k + '"' + (x.k === it.k ? ' selected' : '') + '>' + x.ten + '</option>'; }).join('') + '</select><button type="button" data-kp="toi">▶</button></div>';
    the.classList.remove('an');
    the.querySelector('[data-kp="tat"]').onclick = function () { KP.bat = false; KP.k = null; veTheKP(); ve(); if (S.mode === '3d') veBang(); };
    the.querySelector('[data-kp="lui"]').onclick = function () { KP.k = ds[(i - 1 + ds.length) % ds.length].k; veTheKP(); ve(); };
    the.querySelector('[data-kp="toi"]').onclick = function () { KP.k = ds[(i + 1) % ds.length].k; veTheKP(); ve(); };
    the.querySelector('[data-kp="chon"]').onchange = function () { KP.k = this.value; veTheKP(); ve(); };
  }
  function kcMH3(o, m) {
    var v = VAL[o.id]; if (!v || o.an) return Infinity;
    if (laDiem3(o)) return len2(sub2(CAM.proj(v), m)) - 3;
    if (v.k === 'seg') return kcDoanMH(m, CAM.proj(v.a), CAM.proj(v.b), 'seg');
    if (v.k === 'line3') { var du = sub3(v.b, v.a), ra = o.ra || 0.45; return kcDoanMH(m, CAM.proj(sub3(v.a, mul3(du, ra))), CAM.proj(add3(v.b, mul3(du, ra))), 'seg'); }
    if (v.k === 'len3') return kcDoanMH(m, CAM.proj(v.a), CAM.proj(v.b), 'seg') + 2;
    if (v.k === 'sec' || v.k === 'mp') { var ps = v.pts.map(CAM.proj); return trongDaGiac(m, ps) ? 6.5 : Infinity; }
    return Infinity;
  }
  function trung3(m, chiDiem) {
    var best = null, bd = Infinity;
    SC().objs.forEach(function (o) {
      if (!hienO(o)) return;
      if (chiDiem && !laDiem3(o)) return;
      var d = kcMH3(o, m), ng = (laDiem3(o) ? 11 : 7) * TO;
      if (d < ng && d < bd) { bd = d; best = o; }
    });
    return best;
  }
  var vongXong = false;
  function tuMH3(m, z0) {   // điểm màn hình -> điểm trên mặt phẳng z = z0
    lapCam();
    var o = CAM.proj(P3(0, 0, z0)), ax = sub2(CAM.proj(P3(1, 0, z0)), o), ay = sub2(CAM.proj(P3(0, 1, z0)), o), det = cr2(ax, ay);
    if (Math.abs(det) < 1e-3 * S.d3.view.s * S.d3.view.s) return null;
    var r = sub2(m, o); return P3(cr2(r, ay) / det, cr2(ax, r) / det, z0);
  }
  function tenMP() { var dung = {}; SC().objs.forEach(function (o) { if (o.ten) dung[o.ten] = 1; }); var L = ['(P)', '(Q)', '(R)', '(α)', '(β)', '(γ)']; for (var i = 0; i < L.length; i++) if (!dung[L[i]]) return L[i]; return '(P_' + SC().next + ')'; }
  function bam3(m) {
    var t = congHT(); if (!t || t.id === 'dich') return;
    if (t.id === 'del') { var o = trung3(m); if (o) { ghiLS(); xoa(o.id); capNhat(); } return; }
    if (t.id === 'diem3') {
      hoi('Thêm điểm theo toạ độ', [{ nhan: 'Tên điểm', v: tenMoi('diem') }, { nhan: 'Toạ độ x; y; z (VD: 1; 0; 2,5)', v: '0; 0; 0' }]).then(function (r) {
        if (!r) return; var xs = r[1].split(/[;]/).map(docSo); if (xs.length !== 3 || xs.some(isNaN)) return thongBao('Toạ độ chưa đúng dạng x; y; z');
        ghiLS(); them({ t: 'p3', x: xs[0], y: xs[1], z: xs[2], ten: r[0].trim() || tenMoi('diem') }); capNhat();
      });
      return;
    }
    if (t.id === 'diem') {
      var q = trung3(m);
      if (q && laDiem3(q)) { thongBao('Đã có điểm ' + tenHien(q.ten || '') + ' ở đây.'); return; }
      if (q && (q.t === 'seg3' || q.t === 'line3')) {
        var a = CAM.proj(VAL[q.d[0]]), b = CAM.proj(VAL[q.d[1]]), dd = sub2(b, a), u = dot2(sub2(m, a), dd) / dot2(dd, dd);
        if (q.t === 'seg3') u = Math.max(0, Math.min(1, u));
        ghiLS(); them({ t: 'on3', d: q.d.slice(), u: Math.round(u * 1000) / 1000, ten: tenMoi('diem') }); capNhat(); return;
      }
      var w = tuMH3(m, 0); if (!w) { thongBao('Hãy xoay hình để nhìn thấy mặt đáy rồi bấm lại.'); return; }
      if (S.d3.luoi) { w.x = Math.round(w.x * 2) / 2; w.y = Math.round(w.y * 2) / 2; }
      ghiLS(); them({ t: 'p3', x: Math.round(w.x * 100) / 100, y: Math.round(w.y * 100) / 100, z: 0, ten: tenMoi('diem') }); capNhat(); return;
    }
    if (!picks.length && !vongXong) xongLS();
    var p;
    if (t.vong && vongXong) { p = trung3(m, true) || dinhMoi(t.id, picks, m); if (!p) return; }
    else { var pid = layDiem3(m); if (pid == null) { thongBao('Hãy xoay hình để nhìn thấy mặt đáy rồi bấm lại.'); return; } p = obj(pid); }
    if (t.id === 'diemCao') {
      hoi('Điểm trên cao (thẳng đứng phía trên ' + tenHien(p.ten || '') + ')', [{ nhan: 'Tên điểm', v: SC().objs.some(function (x) { return x.ten === 'S'; }) ? tenMoi('diem') : 'S' }, { nhan: 'Chiều cao h (VD: 4; 2,5; √3; số âm: phía dưới)', v: '4', so: 1 }]).then(function (r) {
        var h = r && docSo(r[1]); if (!r || isNaN(h) || !h) return;
        ghiLSmotLan(); xongLS(); var c = them({ t: 'up3', d: [p.id], h: h, ten: r[0].trim() || tenMoi('diem') }); them({ t: 'seg3', d: [p.id, c.id] }); capNhat();
      });
      return;
    }
    if (t.vong) {
      if (!vongXong) {
        if (picks.length >= 3 && p.id === picks[0]) {
          if (t.id === 'mp3') { ghiLS(); them({ t: 'mp3', d: picks.slice(), mau: '#2563eb' }); picks = []; capNhat(); return; }
          vongXong = true; capNhat(); return;
        }
        if (picks.indexOf(p.id) < 0) picks.push(p.id);
        capNhat(); return;
      }
      if (picks.indexOf(p.id) >= 0) { thongBao('Hãy chọn một điểm không nằm trên đáy.'); return; }
      var day = picks.slice(); picks = []; vongXong = false;
      dungKhoi(t.id, day, p.id); return;
    }
    if (picks.indexOf(p.id) >= 0 && !(t.id === 'giao2' || t.id === 'giaoDM' || t.id === 'ss3')) return;
    picks.push(p.id);
    if (picks.length < t.can.length) { capNhat(); return; }
    var k = picks.slice(); picks = [];
    tao3(t.id, k);
  }
  function layDiem3(m) {   // bấm vào điểm có sẵn / lên đoạn, đường (điểm thuộc đoạn) / chỗ trống (điểm mới ở mặt đáy, bắt lưới)
    lapCam();
    var q = trung3(m);
    if (q && laDiem3(q)) return q.id;
    if (q && (q.t === 'seg3' || q.t === 'line3')) {
      var a = CAM.proj(VAL[q.d[0]]), b = CAM.proj(VAL[q.d[1]]), dd = sub2(b, a), u = dot2(sub2(m, a), dd) / dot2(dd, dd);
      if (q.t === 'seg3') u = Math.max(0, Math.min(1, u));
      ghiLSmotLan(); var o = them({ t: 'on3', d: q.d.slice(), u: Math.round(u * 1000) / 1000, ten: tenMoi('diem') }); tinhHet(); return o.id;
    }
    var w = tuMH3(m, 0); if (!w) return null;
    if (S.d3.luoi) { w.x = Math.round(w.x * 2) / 2; w.y = Math.round(w.y * 2) / 2; }
    var trung = SC().objs.filter(function (o) { var v = VAL[o.id]; return laDiem3(o) && hienO(o) && v && Math.abs(v.x - w.x) < 1e-6 && Math.abs(v.y - w.y) < 1e-6 && Math.abs(v.z) < 1e-6; })[0];
    if (trung) return trung.id;
    ghiLSmotLan(); var o2 = them({ t: 'p3', x: Math.round(w.x * 100) / 100, y: Math.round(w.y * 100) / 100, z: 0, ten: tenMoi('diem') }); tinhHet(); return o2.id;
  }
  function dinhMoi(loai, day, m) {   // bấm chỗ trống để đặt đỉnh chóp / đỉnh đáy trên lăng trụ: điểm thẳng đứng phía trên một điểm của đáy
    lapCam();
    var ps = day.map(function (id) { return VAL[id]; }), c = P3(0, 0, 0); ps.forEach(function (p) { c = add3(c, p); }); c = mul3(c, 1 / ps.length);
    var ung = loai === 'langTru' ? [ps[0]] : ps.concat([c]), chan = ung[0], bd = Infinity;
    if (loai !== 'langTru') ung.forEach(function (p) { var d = Math.abs(CAM.proj(p).x - m.x); if (d < bd) { bd = d; chan = p; } });
    var dz = sub2(CAM.proj(P3(0, 0, 1)), CAM.proj(P3(0, 0, 0))), h = dot2(sub2(m, CAM.proj(chan)), dz) / dot2(dz, dz);
    h = S.d3.luoi ? Math.round(h * 2) / 2 : Math.round(h * 100) / 100;
    if (!(h > 0.2)) { thongBao('Bấm vào chỗ phía trên mặt đáy để đặt đỉnh.'); return null; }
    var coTen = function (t) { return SC().objs.some(function (x) { return x.ten === t; }); };
    var ten = loai === 'langTru' ? ((obj(day[0]).ten || 'A').replace(/'+$/, '') + "'") : (coTen('S') ? tenMoi('diem') : 'S');
    ghiLSmotLan();
    var o = them({ t: 'p3', x: Math.round(chan.x * 100) / 100, y: Math.round(chan.y * 100) / 100, z: Math.round((chan.z + h) * 100) / 100, ten: ten });
    if (loai !== 'langTru') {
      var chanId = day[ps.indexOf(chan)];
      if (chan === c) { var tO = day.length === 3 ? 'G' : 'O'; chanId = them({ t: 'cen3', d: day.slice(), ten: coTen(tO) ? tenMoi('diem') : tO }).id; }
      them({ t: 'seg3', d: [chanId, o.id] });   // đường cao
      them({ t: 'rt3', d: [o.id, chanId, day[0] === chanId ? day[1] : day[0]] });
    }
    tinhHet(); return o;
  }
  function dungKhoi(loai, day, dinh) {   // khối chóp (đáy + đỉnh) hoặc lăng trụ (đáy + đỉnh trên ứng với đỉnh đầu)
    ghiLSmotLan();
    var coCanh = function (a, b) { return SC().objs.some(function (o) { return o.t === 'seg3' && ((o.d[0] === a && o.d[1] === b) || (o.d[0] === b && o.d[1] === a)); }); };
    var canh = function (a, b) { var c = SC().objs.filter(function (o) { return o.t === 'seg3' && ((o.d[0] === a && o.d[1] === b) || (o.d[0] === b && o.d[1] === a)); })[0]; if (c) { c.canh = true; delete c.net; } else them({ t: 'seg3', d: [a, b], canh: true }); };
    var n = day.length, F = [day.slice()];
    if (loai === 'chop') {
      day.forEach(function (a, i) { canh(a, day[(i + 1) % n]); canh(dinh, a); F.push([dinh, a, day[(i + 1) % n]]); });
    } else {
      var tren = [dinh];
      for (var i = 1; i < n; i++) { var ta = obj(day[i]); tren.push(them({ t: 'tr3', d: [day[i], day[0], dinh], ten: (ta && ta.ten ? ta.ten.replace(/'+$/, '') : 'X') + "'" }).id); }
      day.forEach(function (a, i) { var j = (i + 1) % n; canh(a, day[j]); canh(tren[i], tren[j]); canh(a, tren[i]); F.push([a, day[j], tren[j], tren[i]]); });
      F.push(tren.slice());
    }
    SC().objs = SC().objs.filter(function (o) { return o.t !== 'solid'; });   // mỗi trang một khối dùng cho che khuất, thiết diện
    them({ t: 'solid', f: F });
    xongLS(); capNhat();
  }
  function tao3(id, p) {
    var xong = function () { xongLS(); capNhat(); };
    switch (id) {
      case 'noi': ghiLSmotLan(); them({ t: 'seg3', d: p }); break;
      case 'dt3': ghiLSmotLan(); them({ t: 'line3', d: p, mau: '#2563eb' }); break;
      case 'len3': ghiLSmotLan(); them({ t: 'len3', d: p, mau: '#ea580c' }); break;
      case 'matP': { ghiLSmotLan(); var mp = them({ t: 'matP', d: p, mau: '#2563eb', ten: tenMP() }); tinhHet(); if (!VAL[mp.id]) { xoa(mp.id); thongBao('Ba điểm thẳng hàng — chưa xác định mặt phẳng.'); } break; }
      case 'ss3': {
        if (p[1] === p[2]) { thongBao('Hai điểm của đoạn phải khác nhau.'); break; }
        ghiLSmotLan(); var q = them({ t: 'tr3', d: [p[0], p[1], p[2]], ten: tenMoi('diem') }); them({ t: 'seg3', d: [p[0], q.id] }); break;
      }
      case 'trung': ghiLSmotLan(); them({ t: 'mid3', d: p, ten: tenMoi('diem') }); break;
      case 'trongTam': ghiLSmotLan(); them({ t: 'cen3', d: p, ten: tenMoi('diem') }); break;
      case 'chia':
        hoi('Điểm chia đoạn ' + ten2(p[0]) + ten2(p[1]), [{ nhan: 'Tên điểm', v: tenMoi('diem') }, { nhan: 'Tỉ số ' + ten2(p[0]) + 'M / ' + ten2(p[0]) + ten2(p[1]) + ' (VD: 1/3; 2/3; 0,25)', v: '1/3' }], 'M nằm trên đường thẳng ' + ten2(p[0]) + ten2(p[1]) + '; tỉ số âm hoặc lớn hơn 1 cho điểm nằm ngoài đoạn.').then(function (r) {
          var u = r && docSo(r[1]); if (!r || isNaN(u)) return; ghiLSmotLan(); them({ t: 'on3', d: p, u: u, ten: r[0].trim() || tenMoi('diem') }); xong();
        });
        return;
      case 'chieuMP': {
        ghiLSmotLan(); var h = them({ t: 'projP', d: p, ten: tenMoi('diem') });
        if (!VAL[p[0]] || !tinh3(h)) { xoa(h.id); thongBao('Ba điểm mặt phẳng thẳng hàng.'); break; }
        them({ t: 'seg3', d: [p[0], h.id] }); them({ t: 'rt3', d: [p[0], h.id, p[1] !== h.id ? p[1] : p[2]] }); break;
      }
      case 'chieuDT': { ghiLSmotLan(); var h2 = them({ t: 'projL', d: p, ten: tenMoi('diem') }); them({ t: 'seg3', d: [p[0], h2.id] }); them({ t: 'rt3', d: [p[0], h2.id, p[1]] }); break; }
      case 'vuong': ghiLSmotLan(); them({ t: 'rt3', d: p }); break;
      case 'giao2': { ghiLSmotLan(); var g2 = them({ t: 'int3', d: p, ten: tenMoi('diem') }); tinhHet(); if (!VAL[g2.id]) { xoa(g2.id); thongBao('Hai đường thẳng này không cắt nhau (chéo nhau hoặc song song).'); } break; }
      case 'giaoDM': { ghiLSmotLan(); var g3 = them({ t: 'intLP', d: p, ten: tenMoi('diem') }); tinhHet(); if (!VAL[g3.id]) { xoa(g3.id); thongBao('Đường thẳng song song với mặt phẳng.'); } break; }
      case 'thietDien': {
        if (!SC().objs.some(function (o) { return o.t === 'solid'; }) && !khoiTuDong()) { thongBao('Cần một khối (hình chóp, lăng trụ, hộp… — dựng hình mẫu, dùng Khối chóp/Khối lăng trụ, hoặc nối đủ các cạnh) trước.'); break; }
        ghiLSmotLan(); var sc = them({ t: 'sec', d: p, mau: '#ea580c' }); tinhHet(); if (!VAL[sc.id]) { xoa(sc.id); thongBao('Mặt phẳng không cắt khối theo một đa giác.'); break; }
        // tự tạo, đặt tên các giao điểm của mặt cắt với cạnh khối (điểm phụ thuộc, nằm trên cạnh)
        var kh = SC().objs.filter(function (o) { return o.t === 'solid'; })[0], A = VAL[p[0]], n = cr3(sub3(VAL[p[1]], A), sub3(VAL[p[2]], A)), daCo = {};
        if (!kh) kh = khoiCanh_();
        var gan = function (X) { return SC().objs.some(function (o) { return laDiem3(o) && VAL[o.id] && len3(sub3(VAL[o.id], X)) < 1e-6 * (KT + 1); }); };
        kh.f.forEach(function (f) {
          for (var i = 0; i < f.length; i++) {
            var a = f[i], b = f[(i + 1) % f.length], key = Math.min(a, b) + '-' + Math.max(a, b); if (daCo[key]) continue; daCo[key] = 1;
            var da = dot3(n, sub3(VAL[a], A)), db = dot3(n, sub3(VAL[b], A)); if (da * db >= 0) continue;
            var u = da / (da - db), X = add3(VAL[a], mul3(sub3(VAL[b], VAL[a]), u));
            if (!gan(X)) { var q = them({ t: 'on3', d: [a, b], u: u, ten: tenMoi('diem') }); VAL[q.id] = X; }
          }
        });
        break;
      }
    }
    xong();
  }

  // ------------------------------------------------------------------ HÌNH MẪU KHÔNG GIAN
  var MAU3 = [
    { id: 'chop4', ic: '🔺', ten: 'Chóp tứ giác', ts: ['day4', 'chan4', 'a', 'b', 'h'] },
    { id: 'chop3', ic: '◭', ten: 'Chóp tam giác', ts: ['day3', 'chan3', 'a', 'b', 'h'] },
    { id: 'tudien', ic: '△', ten: 'Tứ diện', ts: ['tdkieu', 'a', 'b', 'h'] },
    { id: 'langtru', ic: '⬡', ten: 'Lăng trụ tam giác', ts: ['ltkieu', 'day3b', 'a', 'h'] },
    { id: 'hop', ic: '▣', ten: 'Hộp · lập phương', ts: ['hopkieu', 'a', 'b', 'h'] },
    { id: 'non', ic: '▲', ten: 'Hình nón', ts: ['r', 'h'] },
    { id: 'tru', ic: '▮', ten: 'Hình trụ', ts: ['r', 'h'] },
    { id: 'cau', ic: '●', ten: 'Mặt cầu', ts: ['r'] },
    { id: 'trong', ic: '▢', ten: 'Trang trắng (Oxyz)', ts: [] }
  ];
  var TS = {
    day4: { nhan: 'Đáy ABCD', loai: 'chon', ds: [['vuong', 'Hình vuông'], ['chunhat', 'Hình chữ nhật'], ['binhhanh', 'Hình bình hành'], ['thoi', 'Hình thoi'], ['thang', 'Hình thang vuông']], v: 'vuong' },
    chan4: { nhan: 'Chân đường cao', loai: 'chon', ds: [['A', 'SA ⊥ đáy'], ['O', 'Tâm O (chóp đều)'], ['mAB', '(SAB) ⊥ đáy']], v: 'A' },
    day3: { nhan: 'Đáy ABC', loai: 'chon', ds: [['deu', 'Tam giác đều'], ['vuongB', 'Vuông tại B'], ['vuongA', 'Vuông tại A'], ['can', 'Cân tại A']], v: 'deu' },
    day3b: { nhan: 'Đáy ABC', loai: 'chon', ds: [['deu', 'Tam giác đều'], ['vuongA', 'Vuông tại A']], v: 'deu' },
    chan3: { nhan: 'Chân đường cao', loai: 'chon', ds: [['A', 'SA ⊥ đáy'], ['G', 'Trọng tâm G (chóp đều)'], ['mAB', '(SAB) ⊥ đáy']], v: 'A' },
    tdkieu: { nhan: 'Loại tứ diện', loai: 'chon', ds: [['deu', 'Tứ diện đều ABCD'], ['vuong', 'OABC vuông tại O']], v: 'deu' },
    ltkieu: { nhan: 'Loại', loai: 'chon', ds: [['dung', 'Lăng trụ đứng'], ['xien', 'Lăng trụ xiên']], v: 'dung' },
    hopkieu: { nhan: 'Loại', loai: 'chon', ds: [['hcn', 'Hộp chữ nhật'], ['lp', 'Lập phương'], ['xien', 'Hộp xiên']], v: 'hcn' },
    a: { nhan: 'Cạnh a', v: 4 }, b: { nhan: 'Cạnh b', v: 3 }, h: { nhan: 'Chiều cao h', v: 4 }, r: { nhan: 'Bán kính r', v: 2.5 }
  };
  var mauDangChon = 'chop4', giaTri = {}, bangMo = false;
  function gt(k) { return giaTri[k] != null ? giaTri[k] : TS[k].v; }
  function dungMau(id) {
    ghiLS(); S.d3.sc = canhMoi(); boChon(); picks = []; if (KP.bat) KP.k = null;
    var a = +gt('a'), b = +gt('b'), h = +gt('h'), r = +gt('r'), ids = {};
    var D_ = function (ten, x, y, z) { ids[ten] = them({ t: 'p3', x: x, y: y, z: z, ten: ten }).id; return ids[ten]; };
    var C_ = function (A, B, canh) { them({ t: 'seg3', d: [ids[A], ids[B]], canh: canh !== false }); };
    var K_ = function (mat) { them({ t: 'solid', f: mat.map(function (f) { return f.map(function (n) { return ids[n]; }); }) }); };
    var R_ = function (A, B, C) { them({ t: 'rt3', d: [ids[A], ids[B], ids[C]] }); };
    var day = [];
    if (id === 'chop4' || id === 'chop3') {
      var kd = id === 'chop4' ? gt('day4') : gt('day3'), chan = id === 'chop4' ? gt('chan4') : gt('chan3'), P = {};
      if (id === 'chop4') {
        if (kd === 'vuong') P = { A: [0, 0], B: [a, 0], C: [a, a], D: [0, a] };
        else if (kd === 'chunhat') P = { A: [0, 0], B: [a, 0], C: [a, b], D: [0, b] };
        else if (kd === 'binhhanh') P = { A: [0, 0], B: [a, 0], C: [a + a * 0.35, b], D: [a * 0.35, b] };
        else if (kd === 'thoi') P = { A: [0, 0], B: [a, 0], C: [a * 1.5, a * Math.sqrt(3) / 2], D: [a / 2, a * Math.sqrt(3) / 2] };
        else P = { A: [0, 0], B: [a, 0], C: [a / 2, a / 2], D: [0, a / 2] };
        day = ['A', 'B', 'C', 'D'];
      } else {
        if (kd === 'deu') P = { A: [0, 0], B: [a / 2, -a * Math.sqrt(3) / 2], C: [a, 0] };
        else if (kd === 'vuongB') P = { A: [0, b], B: [0, 0], C: [a, 0] };
        else if (kd === 'vuongA') P = { A: [0, 0], B: [0, -a], C: [b, 0] };
        else P = { A: [a / 2, -b], B: [0, 0], C: [a, 0] };
        day = ['A', 'B', 'C'];
      }
      var cx = 0, cy = 0; day.forEach(function (n) { cx += P[n][0]; cy += P[n][1]; }); cx /= day.length; cy /= day.length;
      day.forEach(function (n) { D_(n, P[n][0] - cx, P[n][1] - cy, 0); });
      var chanTen = 'A', chanXY;
      if (chan === 'A') chanXY = [P.A[0] - cx, P.A[1] - cy];
      else if (chan === 'O' || chan === 'G') {
        if (id === 'chop4') { // giao hai đường chéo
          var p1 = P.A, p2 = P.C, p3 = P.B, p4 = P.D, d1 = [p2[0] - p1[0], p2[1] - p1[1]], d2 = [p4[0] - p3[0], p4[1] - p3[1]], den = d1[0] * d2[1] - d1[1] * d2[0], t = ((p3[0] - p1[0]) * d2[1] - (p3[1] - p1[1]) * d2[0]) / den;
          chanXY = [p1[0] + d1[0] * t - cx, p1[1] + d1[1] * t - cy]; chanTen = 'O';
        } else { chanXY = [0, 0]; chanTen = 'G'; }
        D_(chanTen, chanXY[0], chanXY[1], 0);
      } else { chanXY = [(P.A[0] + P.B[0]) / 2 - cx, (P.A[1] + P.B[1]) / 2 - cy]; chanTen = 'H'; D_('H', chanXY[0], chanXY[1], 0); }
      D_('S', chanXY[0], chanXY[1], h);
      day.forEach(function (n, i) { C_(n, day[(i + 1) % day.length]); C_('S', n); });
      if (chanTen !== 'A') { C_('S', chanTen, false); if (chanTen === 'O' && id === 'chop4') { C_('A', 'C', false); C_('B', 'D', false); } if (chanTen === 'G') { ids.M = them({ t: 'mid3', d: [ids.B, ids.C], ten: 'M' }).id; C_('A', 'M', false); } }
      R_('S', chanTen, chanTen === 'A' ? 'B' : (chanTen === 'G' ? 'M' : (chanTen === 'H' ? 'B' : 'B')));
      if (chanTen === 'A' && day.length === 4) R_('S', 'A', 'D');
      if (chanTen === 'A' && day.length === 3) R_('S', 'A', 'C');
      K_([day].concat(day.map(function (n, i) { return ['S', n, day[(i + 1) % day.length]]; })));
    } else if (id === 'tudien') {
      if (gt('tdkieu') === 'deu') {
        var s3 = Math.sqrt(3), gx = a / 2, gy = -a * s3 / 6;
        D_('B', -gx, -gy - a * s3 / 2 + a * s3 / 3 * 0 - 0, 0);
        ids = {}; S.d3.sc = canhMoi();
        D_('B', 0 - a / 2, a * s3 / 6, 0); D_('C', a / 2, a * s3 / 6, 0); D_('D', 0, -a * s3 / 3, 0); D_('A', 0, 0, a * Math.sqrt(2 / 3));
        ['B', 'C', 'D'].forEach(function (n, i, L) { C_(n, L[(i + 1) % 3]); C_('A', n); });
        K_([['B', 'C', 'D'], ['A', 'B', 'C'], ['A', 'C', 'D'], ['A', 'D', 'B']]);
      } else {
        D_('O', 0, 0, 0); D_('A', a, 0, 0); D_('B', 0, b, 0); D_('C', 0, 0, h);
        C_('O', 'A'); C_('O', 'B'); C_('O', 'C'); C_('A', 'B'); C_('B', 'C'); C_('C', 'A');
        R_('A', 'O', 'B'); R_('B', 'O', 'C'); R_('C', 'O', 'A');
        K_([['O', 'A', 'B'], ['O', 'B', 'C'], ['O', 'C', 'A'], ['A', 'B', 'C']]);
      }
    } else if (id === 'langtru') {
      var Q = gt('day3b') === 'deu' ? { A: [0, 0], B: [a / 2, -a * Math.sqrt(3) / 2], C: [a, 0] } : { A: [0, 0], B: [0, -a], C: [a, 0] };
      var lx = gt('ltkieu') === 'xien' ? a * 0.35 : 0, ly = gt('ltkieu') === 'xien' ? a * 0.2 : 0, mx = (Q.A[0] + Q.B[0] + Q.C[0]) / 3, my = (Q.A[1] + Q.B[1] + Q.C[1]) / 3;
      ['A', 'B', 'C'].forEach(function (n) { D_(n, Q[n][0] - mx, Q[n][1] - my, 0); D_(n + "'", Q[n][0] - mx + lx, Q[n][1] - my + ly, h); });
      ['A', 'B', 'C'].forEach(function (n, i, L) { var m = L[(i + 1) % 3]; C_(n, m); C_(n + "'", m + "'"); C_(n, n + "'"); });
      K_([['A', 'B', 'C'], ["A'", "B'", "C'"], ['A', 'B', "B'", "A'"], ['B', 'C', "C'", "B'"], ['C', 'A', "A'", "C'"]]);
    } else if (id === 'hop') {
      var k = gt('hopkieu'), aa = a, bb = k === 'lp' ? a : b, hh = k === 'lp' ? a : h, dx = k === 'xien' ? a * 0.3 : 0, dy = k === 'xien' ? a * 0.15 : 0;
      var V4 = { A: [0, 0], B: [aa, 0], C: [aa, bb], D: [0, bb] };
      ['A', 'B', 'C', 'D'].forEach(function (n) { D_(n, V4[n][0] - aa / 2, V4[n][1] - bb / 2, 0); D_(n + "'", V4[n][0] - aa / 2 + dx, V4[n][1] - bb / 2 + dy, hh); });
      ['A', 'B', 'C', 'D'].forEach(function (n, i, L) { var m = L[(i + 1) % 4]; C_(n, m); C_(n + "'", m + "'"); C_(n, n + "'"); });
      K_([['A', 'B', 'C', 'D'], ["A'", "B'", "C'", "D'"], ['A', 'B', "B'", "A'"], ['B', 'C', "C'", "B'"], ['C', 'D', "D'", "C'"], ['D', 'A', "A'", "D'"]]);
    } else if (id === 'non') {
      D_('O', 0, 0, 0); D_('S', 0, 0, h); D_('A', r, 0, 0);
      them({ t: 'cone', d: [ids.S, ids.O], r: r }); C_('S', 'O', false); C_('O', 'A', false); C_('S', 'A', false); R_('S', 'O', 'A');
    } else if (id === 'tru') {
      D_('O', 0, 0, 0); D_("O'", 0, 0, h); D_('A', r, 0, 0); D_("A'", r, 0, h);
      them({ t: 'cyl', d: [ids.O, ids["O'"]], r: r }); C_('O', "O'", false); C_('O', 'A', false); C_("O'", "A'", false);
    } else if (id === 'cau') {
      D_('O', 0, 0, 0); D_('A', r, 0, 0); them({ t: 'sph', d: [ids.O], r: r }); C_('O', 'A', false);
    }
    if (id === 'trong') S.d3.truc = true;
    SC().cauTruc = { loai: id, ids: ids, kd: id === 'chop4' ? gt('day4') : id === 'chop3' ? gt('day3') : id === 'langtru' ? gt('day3b') : '', chan: typeof chanTen === 'string' ? chanTen : '', kieu: id === 'tudien' ? gt('tdkieu') : id === 'langtru' ? gt('ltkieu') : id === 'hop' ? gt('hopkieu') : '' };
    bangMo = false;
    vuaKhung(); capNhat();
  }

  // ------------------------------------------------------------------ BẢNG THUỘC TÍNH
  var MO = { mau: false, kieu: false, ds: false, kp: true };
  function veBang() {
    var b = $('#bang'), o = chon ? obj(chon) : null, nh = dsChon();
    if (nh.length > 1) { b.innerHTML = bangNhieu(nh); ganNhieu(nh); b.classList.add('mo'); return; }
    if (o) { b.innerHTML = bangDoiTuong(o); ganBang(o); b.classList.add('mo'); return; }
    b.classList.toggle('mo', bangMo);
    veBangChinh(b);
    b.insertAdjacentHTML('beforeend', bangKieu() + bangDanhSach());
    ganKieu(b); ganDanhSach(b);
    b.querySelectorAll('details[data-mo]').forEach(function (x) { x.ontoggle = function () { MO[x.dataset.mo] = x.open; }; });
  }
  function bangNhieu(ids) {
    var L = ids.map(obj).filter(Boolean), sw = function (attr) { return '<div class="mau">' + MAU.map(function (m) { return '<button type="button" ' + attr + '="' + m + '" style="background:' + m + '"></button>'; }).join('') + '</div>'; };
    var net = S.mode === '3d' ? [['tu', 'Tự động'], ['lien', 'Liền'], ['dut', 'Đứt']] : [['lien', 'Liền'], ['dut', 'Đứt']];
    return '<h3>✅ Đã chọn ' + L.length + ' đối tượng</h3><div class="ghi-chu">' + L.slice(0, 14).map(function (o) { return esc(NHAN_LOAI[o.t] || o.t) + ' <b>' + esc(tenO(o)) + '</b>'; }).join(' · ') + (L.length > 14 ? ' …' : '') + '</div>' +
      '<div class="ghi-chu">✋ Kéo một đối tượng đang chọn để <b>dời cả nhóm</b>' + (S.mode === '3d' ? ' (giữ Shift: dời lên/xuống)' : '') + ' · <b>Shift/Ctrl + bấm</b> để thêm/bớt · <b>Delete</b> xoá cả nhóm.</div>' +
      '<label>Màu nét</label>' + sw('data-gmau') + '<label>Màu tên</label>' + sw('data-gmten') +
      '<label>Cỡ tên</label><input type="range" id="g-coten" min="10" max="40" step="1" value="' + K().coTen + '">' +
      '<label>Nét</label><div class="chon">' + net.map(function (n) { return '<button type="button" data-gnet="' + n[0] + '">' + n[1] + '</button>'; }).join('') + '</div>' +
      '<label>Độ dày</label><div class="chon">' + [1.2, 1.9, 2.6, 3.4].map(function (d, i) { return '<button type="button" data-gday="' + d + '">' + ['Mảnh', 'Vừa', 'Đậm', 'Rất đậm'][i] + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="nut-phu" id="g-an">🙈 Ẩn các đối tượng này</button><button type="button" class="nut-phu nut-xoa" id="g-xoa">🗑 Xoá các đối tượng này</button><button type="button" class="nut-phu" id="g-bo">✓ Bỏ chọn</button>';
  }
  function ganNhieu(ids) {
    var b = $('#bang'), L = ids.map(obj).filter(Boolean), doi = function (f) { ghiLS(); L.forEach(f); capNhat(); };
    var coTen = function (o) { return o.ten !== undefined || laDiem2(o) || laDiem3(o); }, laNet = function (o) { return !(laDiem2(o) || laDiem3(o)) && !/^(txt|ang|len|len3|eq)$/.test(o.t); };
    b.querySelectorAll('[data-gmau]').forEach(function (x) { x.onclick = function () { doi(function (o) { o.mau = x.dataset.gmau; }); }; });
    b.querySelectorAll('[data-gmten]').forEach(function (x) { x.onclick = function () { doi(function (o) { if (coTen(o)) o.mauTen = x.dataset.gmten; }); }; });
    var ct = $('#g-coten'); ct.oninput = function () { L.forEach(function (o) { if (coTen(o)) o.coTen = +ct.value; }); ve(); }; ct.onchange = function () { luuLS(); };
    b.querySelectorAll('[data-gnet]').forEach(function (x) { x.onclick = function () { doi(function (o) { if (laNet(o)) o.net = x.dataset.gnet; }); }; });
    b.querySelectorAll('[data-gday]').forEach(function (x) { x.onclick = function () { doi(function (o) { if (laNet(o)) o.day = +x.dataset.gday; }); }; });
    $('#g-an').onclick = function () { ghiLS(); L.forEach(function (o) { o.an = true; }); boChon(); capNhat(); };
    $('#g-xoa').onclick = function () { ghiLS(); ids.forEach(function (id) { if (obj(id)) xoa(id); }); boChon(); capNhat(); };
    $('#g-bo').onclick = function () { boChon(); capNhat(); };
  }
  function bangKieu() {
    var k = K(), v = D().view, sw = function (attr, cur) { return '<div class="mau">' + MAU.map(function (m) { return '<button type="button" ' + attr + '="' + m + '" style="background:' + m + '" class="' + (cur === m ? 'on' : '') + '"></button>'; }).join('') + '</div>'; };
    return '<details data-mo="kieu"' + (MO.kieu ? ' open' : '') + '><summary>🎨 Kiểu hình vẽ · cỡ hình, cỡ tên, màu</summary>' +
      '<label>Cỡ hình <small id="k-s-v">' + Math.round(v.s) + '</small></label><input type="range" id="k-s" min="8" max="260" step="1" value="' + Math.round(v.s) + '">' +
      '<label>Cỡ tên điểm <small>' + k.coTen + '</small></label><input type="range" data-kieu="coTen" min="10" max="34" step="1" value="' + k.coTen + '">' +
      '<label>Cỡ chấm điểm</label><input type="range" data-kieu="coDiem" min="0.4" max="2.6" step="0.1" value="' + k.coDiem + '">' +
      '<label>Độ đậm nét</label><input type="range" data-kieu="day" min="0.5" max="2.6" step="0.1" value="' + k.day + '">' +
      '<label>Màu tên điểm</label>' + sw('data-mten', k.mauTen) +
      '<label>Đổi màu nét cả hình</label>' + sw('data-mhinh', '') +
      (S.mode === '3d' ? '<label>Màu tô khối (bật nút 🎨 Tô khối)</label>' + sw('data-mkhoi', S.d3.mauKhoi || '#60a5fa') : '') +
      '<button type="button" class="nut-phu" id="k-mac">↺ Về kiểu mặc định</button></details>';
  }
  function tenO(o) {
    if (o.ten) return tenHien(o.ten);
    var ds = (o.d || []).map(function (id) { var q = obj(id); return q && q.ten ? tenHien(q.ten) : ''; });
    if (o.t === 'rt3' || o.t === 'ang') return '∠' + ds.join('');
    return ds.join('');
  }
  function bangDanhSach() {
    var L = SC().objs.filter(function (o) { return o.t !== 'solid'; });
    if (!L.length) return '';
    return '<details data-mo="ds"' + (MO.ds ? ' open' : '') + '><summary>👁 Đối tượng đã vẽ (' + L.length + ')</summary><div class="ds-dt">' +
      L.map(function (o) { return '<div class="dt' + (o.an ? ' tat' : '') + '"><button type="button" class="mat" data-an="' + o.id + '" title="' + (o.an ? 'Hiện' : 'Ẩn') + '">' + (o.an ? '🙈' : '👁') + '</button><span data-chon="' + o.id + '"><i style="background:' + (o.mau || '#1e1a2e') + '"></i>' + esc(NHAN_LOAI[o.t] || o.t) + ' <b>' + esc(tenO(o)) + '</b></span></div>'; }).join('') +
      '</div><div class="hang"><button type="button" class="nut-phu" id="ds-hien">👁 Hiện tất cả</button><button type="button" class="nut-phu" id="ds-an">🙈 Ẩn tất cả</button></div></details>';
  }
  function ganKieu(b) {
    var ks = $('#k-s'); if (!ks) return;
    ks.oninput = function () { phong(+ks.value / D().view.s); $('#k-s-v').textContent = ks.value; };
    b.querySelectorAll('[data-kieu]').forEach(function (x) {
      x.oninput = function () { K()[x.dataset.kieu] = +x.value; var sm = x.previousElementSibling.querySelector('small'); if (sm) sm.textContent = x.value; ve(); };
      x.onchange = function () { luuLS(); };
    });
    b.querySelectorAll('[data-mten]').forEach(function (x) { x.onclick = function () { K().mauTen = x.dataset.mten; capNhat(); }; });
    b.querySelectorAll('[data-mhinh]').forEach(function (x) {
      x.onclick = function () {
        ghiLS();
        SC().objs.forEach(function (o) { if (laDuong(o) || laTron(o) || /^(seg3|line3|poly|mp3|matP|ham|bpt)$/.test(o.t)) o.mau = x.dataset.mhinh; });
        capNhat();
      };
    });
    b.querySelectorAll('[data-mkhoi]').forEach(function (x) { x.onclick = function () { S.d3.mauKhoi = x.dataset.mkhoi; S.d3.toKhoi = true; datCheDo(); luuLS(); }; });
    $('#k-mac').onclick = function () { D().kieu = { coTen: S.mode === '3d' ? 17 : 16, coDiem: 1, day: 1, mauTen: '#1e1a2e' }; capNhat(); };
  }
  function ganDanhSach(b) {
    b.querySelectorAll('[data-an]').forEach(function (x) { x.onclick = function () { var o = obj(+x.dataset.an); if (!o) return; ghiLS(); o.an = !o.an; capNhat(); }; });
    b.querySelectorAll('[data-chon]').forEach(function (x) { x.onclick = function (ev) { if (ev.shiftKey || ev.ctrlKey || ev.metaKey) doiChon(+x.dataset.chon); else datChon(+x.dataset.chon); capNhat(); }; });
    var h = $('#ds-hien'); if (h) h.onclick = function () { ghiLS(); SC().objs.forEach(function (o) { delete o.an; }); capNhat(); };
    var a = $('#ds-an'); if (a) a.onclick = function () { ghiLS(); SC().objs.forEach(function (o) { if (o.t !== 'solid') o.an = true; }); capNhat(); };
  }
  function veBangChinh(b) {
    if (S.mode === '3d') {
      var m = MAU3.filter(function (x) { return x.id === mauDangChon; })[0], ct = SC().cauTruc, dsk = dsKP();
      var kp = '<details data-mo="kp"' + (MO.kp !== false ? ' open' : '') + '><summary>🔍 Khám phá hình không gian</summary><p class="ghi-chu" style="margin-top:4px">Chọn hình → bấm từng tính chất: phần đó được <b>tô sáng trên hình</b>, kèm giải thích và số đo. Xoay hình để quan sát.</p><div class="mau-hinh">' +
        MAU3.filter(function (x) { return x.id !== 'trong'; }).map(function (x) { return '<button type="button" data-kpm="' + x.id + '" class="' + (ct && ct.loai === x.id ? 'on' : '') + '"><i>' + x.ic + '</i>' + x.ten + '</button>'; }).join('') + '</div>' +
        (dsk.length ? '<div class="kp-ds">' + dsk.map(function (x) { return '<button type="button" data-kpk="' + x.k + '" class="' + (KP.bat && KP.k === x.k ? 'on' : '') + '">' + x.ten + '</button>'; }).join('') + '</div>' : '') + '</details>';
      b.innerHTML = kp + '<details data-mo="mau"' + (MO.mau ? ' open' : '') + '><summary>🧊 Dựng nhanh hình mẫu</summary><div class="mau-hinh">' + MAU3.map(function (x) { return '<button type="button" data-m="' + x.id + '" class="' + (x.id === mauDangChon ? 'on' : '') + '"><i>' + x.ic + '</i>' + x.ten + '</button>'; }).join('') + '</div>' +
        m.ts.map(function (k) {
          var f = TS[k];
          if (f.loai === 'chon') return '<label>' + f.nhan + '</label><select data-k="' + k + '">' + f.ds.map(function (d) { return '<option value="' + d[0] + '"' + (gt(k) === d[0] ? ' selected' : '') + '>' + d[1] + '</option>'; }).join('') + '</select>';
          return '<label>' + f.nhan + '</label><input type="number" step="0.5" min="0.5" data-k="' + k + '" value="' + gt(k) + '">';
        }).join('') +
        '<button type="button" class="nut-to" id="dung">✨ Dựng hình</button>' +
        '<div class="ghi-chu">🔄 <b>Kéo chuột / vuốt</b> để xoay, kéo điểm để dời điểm. Nét khuất tự chuyển <b>nét đứt</b>.<br>✏️ <b>Tự vẽ</b>: Điểm → Điểm trên cao (đỉnh S) → Khối chóp / Khối lăng trụ, hoặc nối từng đoạn.<br>🎬 Vẽ xong bấm <b>Các bước</b> để trình chiếu lại từng bước.</div></details>';
      b.querySelectorAll('[data-m]').forEach(function (x) { x.onclick = function () { mauDangChon = x.dataset.m; veBang(); }; });
      b.querySelectorAll('[data-kpm]').forEach(function (x) { x.onclick = function () { mauDangChon = x.dataset.kpm; KP.bat = true; KP.k = null; S.d3.view = { yaw: -1.2, pitch: 0.4, s: 70, ox: 0, oy: 0, sgk: true }; dungMau(x.dataset.kpm); moKP(); datCheDo(); vuaKhung(); veBang(); }; });
      b.querySelectorAll('[data-kpk]').forEach(function (x) { x.onclick = function () { moKP(x.dataset.kpk); veBang(); if (matchMedia('(max-width: 1000px)').matches) { bangMo = false; veBang(); } }; });
      b.querySelectorAll('[data-k]').forEach(function (x) { x.onchange = function () { giaTri[x.dataset.k] = x.tagName === 'SELECT' ? x.value : (docSo(x.value) || TS[x.dataset.k].v); }; });
      $('#dung').onclick = function () { b.querySelectorAll('[data-k]').forEach(function (x) { x.onchange(); }); dungMau(mauDangChon); };
      return;
    }
    b.innerHTML = '<h3>📐 Hình phẳng</h3><div class="ghi-chu">1️⃣ Chọn công cụ bên trái.<br>2️⃣ Bấm lên vùng vẽ: bấm <b>chỗ trống</b> tạo điểm mới, bấm <b>lên đường</b> tạo điểm trên đường, bấm <b>chỗ cắt nhau</b> lấy giao điểm.<br>3️⃣ Dùng <b>Chọn · kéo</b> để kéo điểm tự do — hình tự cập nhật, đúng quan hệ.</div>' +
      '<label><input type="checkbox" id="o-bat"' + (S.d2.bat ? ' checked' : '') + '> Bắt điểm vào lưới</label>' +
      '<div class="ghi-chu">⌨️ <b>Ctrl+Z</b> hoàn tác · <b>Delete</b> xoá đối tượng đang chọn · <b>Esc</b> huỷ thao tác.<br>💾 Hình tự lưu trên máy này; bấm <b>Lưu</b> để tải tệp, <b>Chép ảnh</b> rồi dán (Ctrl+V) vào Word.</div>' +
      '<button type="button" class="nut-phu" id="vd1">📌 Ví dụ: tam giác, đường tròn ngoại tiếp</button><button type="button" class="nut-phu" id="vd2">📌 Ví dụ: đường cao, trực tâm</button>' +
      '<div class="ghi-chu">✋ Kéo <b>đoạn, đường, đa giác</b> để dời cả hình; kéo chỗ trống để dời trang vẽ.<br>🎬 Vẽ xong bấm <b>Các bước</b> để trình chiếu lại từng bước.</div>';
    $('#o-bat').onchange = function () { S.d2.bat = this.checked; };
    $('#vd1').onclick = function () { viDu2(1); }; $('#vd2').onclick = function () { viDu2(2); };
  }
  var NHAN_LOAI = { ham: 'Đồ thị', bpt: 'Miền nghiệm', pt: 'Điểm tự do', on: 'Điểm trên đường', mid: 'Trung điểm', int: 'Giao điểm', proj: 'Hình chiếu', refl: 'Điểm đối xứng', reg: 'Đỉnh đa giác đều', seg: 'Đoạn thẳng', line: 'Đường thẳng', ray: 'Tia', vec: 'Vectơ', perp: 'Đường vuông góc', par: 'Đường song song', mtt: 'Đường trung trực', bis: 'Phân giác', poly: 'Đa giác', circ: 'Đường tròn', circr: 'Đường tròn', circ3: 'Đường tròn', ang: 'Góc', len: 'Độ dài', eq: 'Kí hiệu bằng nhau', txt: 'Chữ',
    p3: 'Điểm', up3: 'Điểm trên cao', tr3: 'Điểm', line3: 'Đường thẳng', mp3: 'Mặt', matP: 'Mặt phẳng', len3: 'Độ dài', cone: 'Hình nón', cyl: 'Hình trụ', sph: 'Mặt cầu', mid3: 'Trung điểm', on3: 'Điểm chia đoạn', cen3: 'Trọng tâm', projP: 'Hình chiếu lên mặt phẳng', projL: 'Hình chiếu lên đường thẳng', int3: 'Giao điểm', intLP: 'Giao điểm', seg3: 'Đoạn thẳng', rt3: 'Kí hiệu góc vuông', sec: 'Thiết diện' };
  function bangDoiTuong(o) {
    var h = '<h3>' + (NHAN_LOAI[o.t] || 'Đối tượng') + (o.ten ? ' <small>' + esc(tenHien(o.ten)) + '</small>' : '') + '</h3>';
    var diem = laDiem2(o) || laDiem3(o);
    if (diem || laDuong(o) || laTron(o) || /^(seg3|line3|mp3|matP|ham|bpt)$/.test(o.t)) h += '<label>' + (o.t === 'ham' || o.t === 'bpt' ? 'Nhãn ghi trên hình' : 'Tên') + '</label><input type="text" id="b-ten" value="' + esc(o.ten || '') + '" placeholder="VD: A, M_1, (d), A\'">';
    if (o.t === 'pt') h += '<div class="hang"><div><label>x</label><input type="number" step="0.5" id="b-x" value="' + so(o.x, 4).replace(',', '.') + '"></div><div><label>y</label><input type="number" step="0.5" id="b-y" value="' + so(o.y, 4).replace(',', '.') + '"></div></div>';
    if (o.t === 'p3') h += '<div class="hang3"><div><label>x</label><input type="number" step="0.5" id="b-x" value="' + o.x + '"></div><div><label>y</label><input type="number" step="0.5" id="b-y" value="' + o.y + '"></div><div><label>z</label><input type="number" step="0.5" id="b-z" value="' + o.z + '"></div></div>';
    if (o.t === 'on3') h += '<label>Tỉ số (vị trí trên đoạn)</label><input type="text" id="b-u" value="' + so(o.u, 4) + '">';
    if (o.t === 'ham') h += '<label>y =</label><input type="text" id="b-bt" value="' + esc(o.bt) + '"><label>Chỉ vẽ với x trong đoạn (để trống: vẽ hết)</label><input type="text" id="b-ab" value="' + (o.a != null ? so(o.a, 4) + '; ' + so(o.b, 4) : '') + '" placeholder="VD: -1; 3">';
    if (o.t === 'bpt') h += '<label>Bất phương trình</label><input type="text" id="b-bt" value="' + esc(o.bt) + '"><div class="chon dau-bpt">' + DAU_BPT.map(function (d) { return '<button type="button" data-bdau="' + d[0] + '" class="' + (o.dau === d[0] ? 'on' : '') + '" title="Đổi dấu: ' + d[2] + '">' + esc(d[1]) + '</button>'; }).join('') + '</div><label>Tô</label><div class="chon"><button type="button" data-tn="0" class="' + (!o.toNghiem ? 'on' : '') + '">Phần KHÔNG là nghiệm (SGK)</button><button type="button" data-tn="1" class="' + (o.toNghiem ? 'on' : '') + '">Miền nghiệm</button></div><label>Kiểu tô</label><div class="chon"><button type="button" data-kt="gach" class="' + (o.kieuTo !== 'mau' ? 'on' : '') + '">Gạch chéo</button><button type="button" data-kt="mau" class="' + (o.kieuTo === 'mau' ? 'on' : '') + '">Tô màu</button></div>';
    if (o.t === 'circr') h += '<label>Bán kính</label><input type="text" id="b-r" value="' + so(o.r, 4) + '">';
    if (o.t === 'txt') h += '<label>Nội dung</label><input type="text" id="b-s" value="' + esc(o.s) + '"><label>Cỡ chữ</label><input type="number" id="b-co" value="' + (o.co || 16) + '">';
    var v = VAL[o.id];
    if (v && S.mode === '2d') {
      if (laDiem2(o)) h += '<div class="ghi-chu">Toạ độ: (' + so(v.x) + '; ' + so(v.y) + ')</div>';
      if (o.t === 'seg' || o.t === 'vec') h += '<div class="ghi-chu">Độ dài: <b>' + so(len2(sub2(v.a, v.b))) + '</b></div>';
      if (v.k === 'circ') h += '<div class="ghi-chu">Tâm (' + so(v.c.x) + '; ' + so(v.c.y) + '), bán kính <b>' + so(v.r) + '</b></div>';
      if (o.t === 'poly') { var A = 0, Pp = 0; for (var i = 0; i < v.pts.length; i++) { A += cr2(v.pts[i], v.pts[(i + 1) % v.pts.length]); Pp += len2(sub2(v.pts[i], v.pts[(i + 1) % v.pts.length])); } h += '<div class="ghi-chu">Chu vi <b>' + so(Pp) + '</b> · Diện tích <b>' + so(Math.abs(A) / 2) + '</b></div>'; }
    }
    if (v && S.mode === '3d' && o.t === 'seg3') h += '<div class="ghi-chu">Độ dài: <b>' + so(len3(sub3(v.a, v.b))) + '</b></div>';
    if (v && S.mode === '3d' && laDiem3(o)) h += '<div class="ghi-chu">Toạ độ: (' + so(v.x) + '; ' + so(v.y) + '; ' + so(v.z) + ')</div>';
    h += '<label>Màu</label><div class="mau">' + MAU.map(function (m) { return '<button type="button" data-mau="' + m + '" style="background:' + m + '" class="' + ((o.mau || '') === m ? 'on' : '') + '"></button>'; }).join('') + '</div>';
    if (!diem && o.t !== 'txt' && o.t !== 'ang' && o.t !== 'len') {
      if (o.t !== 'bpt') h += '<label>Nét</label><div class="chon">' + (S.mode === '3d' ? [['tu', 'Tự động'], ['lien', 'Liền'], ['dut', 'Đứt']] : [['lien', 'Liền'], ['dut', 'Đứt']]).map(function (n) { var on = (o.net || (S.mode === '3d' ? 'tu' : 'lien')) === n[0]; return '<button type="button" data-net="' + n[0] + '" class="' + (on ? 'on' : '') + '">' + n[1] + '</button>'; }).join('') + '</div>';
      h += '<label>Độ dày</label><div class="chon">' + [1.2, 1.9, 2.6, 3.4].map(function (d, i) { return '<button type="button" data-day="' + d + '" class="' + ((o.day || 1.9) === d ? 'on' : '') + '">' + ['Mảnh', 'Vừa', 'Đậm', 'Rất đậm'][i] + '</button>'; }).join('') + '</div>';
    }
    if (o.t === 'ang') h += '<label><input type="checkbox" id="b-sodo"' + (o.soDo ? ' checked' : '') + '> Hiện số đo góc</label>';
    if (o.t === 'poly') h += '<label><input type="checkbox" id="b-to"' + (o.to !== false ? ' checked' : '') + '> Tô màu bên trong</label>';
    if (o.ten !== undefined || diem) {
      h += '<label>Màu tên</label><div class="mau">' + MAU.map(function (m) { return '<button type="button" data-mauten="' + m + '" style="background:' + m + '" class="' + ((o.mauTen || '') === m ? 'on' : '') + '"></button>'; }).join('') + '</div>';
      h += '<label>Cỡ tên <small>' + (o.coTen || K().coTen) + '</small></label><input type="range" id="b-coten" min="10" max="40" step="1" value="' + (o.coTen || K().coTen) + '">';
    }
    if (o.t === 'mp3' || o.t === 'matP') h += '<label><input type="checkbox" id="b-to"' + (o.to !== false ? ' checked' : '') + '> Tô màu mặt</label><label><input type="checkbox" id="b-che"' + (o.che ? ' checked' : '') + '> Mặt che khuất (nét phía sau thành nét đứt)</label>' + (o.t === 'mp3' ? '<label><input type="checkbox" id="b-vien"' + (o.vien ? ' checked' : '') + '> Kẻ viền</label>' : '<label>Cỡ mặt phẳng</label><input type="range" id="b-comp" min="0.8" max="3" step="0.1" value="' + (o.co || 1.1) + '">');
    if (o.ten !== undefined) h += '<label><input type="checkbox" id="b-anten"' + (o.anTen ? ' checked' : '') + '> Ẩn tên</label>';
    h += '<button type="button" class="nut-phu" id="b-an">🙈 Ẩn đối tượng</button><button type="button" class="nut-phu nut-xoa" id="b-xoa">🗑 Xoá</button><button type="button" class="nut-phu" id="b-dong">✓ Xong</button>';
    if (SC().objs.some(function (x) { return x.an; })) h += '<button type="button" class="nut-phu" id="b-hien">👁 Hiện lại các đối tượng đã ẩn</button>';
    return h;
  }
  function ganBang(o) {
    var b = $('#bang'), doi = function (f) { ghiLS(); f(); capNhat(true); };
    var ten = $('#b-ten'); if (ten) ten.onchange = function () { doi(function () { o.ten = ten.value.trim(); }); };
    ['x', 'y', 'z'].forEach(function (k) { var e = $('#b-' + k); if (e) e.onchange = function () { var v = parseFloat(e.value); if (!isNaN(v)) doi(function () { o[k] = v; }); }; });
    var bt = $('#b-bt'); if (bt) bt.onchange = function () {
      try {
        if (o.t === 'ham') { hamCua(bt.value.trim())(0.37); doi(function () { var cu = 'y = ' + depBT(o.bt); o.bt = bt.value.trim(); if (!o.ten || o.ten === cu) o.ten = 'y = ' + depBT(o.bt); }); }
        else { var q = docBPT(bt.value); doi(function () { var cu = depBT(o.bt); o.a = q.a; o.b = q.b; o.c = q.c; o.dau = q.dau; o.bt = bt.value.trim(); if (!o.ten || o.ten === cu) o.ten = depBT(o.bt); }); }
      } catch (e) { thongBao(e.message); }
    };
    b.querySelectorAll('[data-bdau]').forEach(function (x) { x.onclick = function () { var q = tachBPT(o.bt); bt.value = q.t + ' ' + x.dataset.bdau + ' ' + q.p; bt.onchange(); }; });
    var ab = $('#b-ab'); if (ab) ab.onchange = function () {
      var t = ab.value.trim(); if (!t) { doi(function () { delete o.a; delete o.b; }); return; }
      var v = t.replace(/[\[\]()]/g, '').split(';').map(docSo); if (v.length === 2 && !v.some(isNaN) && v[0] < v[1]) doi(function () { o.a = v[0]; o.b = v[1]; }); else thongBao('Đoạn x cần dạng a; b với a < b.');
    };
    b.querySelectorAll('[data-tn]').forEach(function (x) { x.onclick = function () { doi(function () { o.toNghiem = x.dataset.tn === '1'; }); }; });
    b.querySelectorAll('[data-kt]').forEach(function (x) { x.onclick = function () { doi(function () { o.kieuTo = x.dataset.kt; }); }; });
    var u = $('#b-u'); if (u) u.onchange = function () { var v = docSo(u.value); if (!isNaN(v)) doi(function () { o.u = v; }); };
    var r = $('#b-r'); if (r) r.onchange = function () { var v = docSo(r.value); if (v > 0) doi(function () { o.r = v; }); };
    var s = $('#b-s'); if (s) s.onchange = function () { doi(function () { o.s = s.value; }); };
    var co = $('#b-co'); if (co) co.onchange = function () { doi(function () { o.co = +co.value || 16; }); };
    b.querySelectorAll('[data-mau]').forEach(function (x) { x.onclick = function () { doi(function () { o.mau = x.dataset.mau; }); }; });
    b.querySelectorAll('[data-net]').forEach(function (x) { x.onclick = function () { doi(function () { o.net = x.dataset.net; }); }; });
    b.querySelectorAll('[data-day]').forEach(function (x) { x.onclick = function () { doi(function () { o.day = +x.dataset.day; }); }; });
    var sd = $('#b-sodo'); if (sd) sd.onchange = function () { doi(function () { o.soDo = sd.checked; }); };
    var to = $('#b-to'); if (to) to.onchange = function () { doi(function () { o.to = to.checked; }); };
    b.querySelectorAll('[data-mauten]').forEach(function (x) { x.onclick = function () { doi(function () { o.mauTen = x.dataset.mauten; }); }; });
    var ct = $('#b-coten'); if (ct) { ct.oninput = function () { o.coTen = +ct.value; ct.previousElementSibling.querySelector('small').textContent = ct.value; ve(); }; ct.onchange = function () { luuLS(); }; }
    var ch = $('#b-che'); if (ch) ch.onchange = function () { doi(function () { o.che = ch.checked; }); };
    var vi = $('#b-vien'); if (vi) vi.onchange = function () { doi(function () { o.vien = vi.checked; }); };
    var cm = $('#b-comp'); if (cm) { cm.oninput = function () { o.co = +cm.value; ve(); }; cm.onchange = function () { luuLS(); }; }
    var at = $('#b-anten'); if (at) at.onchange = function () { doi(function () { o.anTen = at.checked; }); };
    $('#b-an').onclick = function () { doi(function () { o.an = true; boChon(); }); };
    $('#b-xoa').onclick = function () { ghiLS(); xoa(o.id); boChon(); capNhat(); };
    $('#b-dong').onclick = function () { boChon(); capNhat(); };
    var hl = $('#b-hien'); if (hl) hl.onclick = function () { doi(function () { SC().objs.forEach(function (x) { delete x.an; }); }); };
  }
  function viDu2(n) {
    ghiLS(); S.d2.sc = canhMoi(); boChon();
    var A = them({ t: 'pt', x: -3, y: -2, ten: 'A' }).id, B = them({ t: 'pt', x: 4, y: -2, ten: 'B' }).id, C = them({ t: 'pt', x: 1, y: 3, ten: 'C' }).id;
    [[A, B], [B, C], [C, A]].forEach(function (p) { them({ t: 'seg', d: p }); });
    if (n === 1) { them({ t: 'circ3', d: [A, B, C], mau: '#2563eb', ten: '(C)' }); them({ t: 'mtt', d: [A, B], mau: '#94a3b8', net: 'dut' }); them({ t: 'mtt', d: [B, C], mau: '#94a3b8', net: 'dut' }); var o1 = SC().objs.length; them({ t: 'int', d: [SC().objs[o1 - 2].id, SC().objs[o1 - 1].id], k: 0, ten: 'O' }); }
    else {
      var s1 = SC().objs[3].id, s2 = SC().objs[4].id, s3 = SC().objs[5].id;
      var H1 = them({ t: 'proj', d: [C, s1], ten: 'D' }).id, H2 = them({ t: 'proj', d: [A, s2], ten: 'E' }).id;
      them({ t: 'seg', d: [C, H1], mau: '#2563eb' }); them({ t: 'seg', d: [A, H2], mau: '#2563eb' });
      them({ t: 'ang', d: [A, H1, C], mau: '#dc2626' }); them({ t: 'ang', d: [C, H2, A], mau: '#dc2626' });
      var l1 = them({ t: 'line', d: [C, H1], an: true }).id, l2 = them({ t: 'line', d: [A, H2], an: true }).id;
      them({ t: 'int', d: [l1, l2], k: 0, ten: 'H', mau: '#dc2626' });
    }
    capNhat();
  }

  // ------------------------------------------------------------------ VẼ RA CANVAS / SVG
  function veNet(c, N) {
    N.forEach(function (n) {
      c.save();
      if (n.t === 'line') {
        c.beginPath(); c.moveTo(n.p[0].x, n.p[0].y); for (var i = 1; i < n.p.length; i++) c.lineTo(n.p[i].x, n.p[i].y);
        c.strokeStyle = n.c; c.lineWidth = n.w || 1.8; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash(n.dash ? [7, 5] : []); c.stroke();
        if (n.mui) { var a = n.p[n.p.length - 2], b = n.p[n.p.length - 1], d = sub2(b, a), l = len2(d) || 1, u = mul2(d, 1 / l), nn = { x: -u.y, y: u.x }; c.setLineDash([]); c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - u.x * 10 + nn.x * 4.5, b.y - u.y * 10 + nn.y * 4.5); c.lineTo(b.x - u.x * 10 - nn.x * 4.5, b.y - u.y * 10 - nn.y * 4.5); c.closePath(); c.fillStyle = n.c; c.fill(); }
      } else if (n.t === 'poly') {
        c.beginPath(); n.p.forEach(function (p, i) { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.closePath();
        if (n.fill) { c.fillStyle = n.fill; c.fill(); }
        if (n.gach) {
          c.save(); c.clip(); c.beginPath();
          var xs = n.p.map(function (q) { return q.x; }), ys = n.p.map(function (q) { return q.y; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
          for (var gx = x0 - (y1 - y0); gx < x1; gx += 9) { c.moveTo(gx, y1); c.lineTo(gx + (y1 - y0), y0); }
          c.strokeStyle = n.gach; c.lineWidth = 1.1; c.setLineDash([]); c.stroke(); c.restore();
          c.beginPath(); n.p.forEach(function (p, i) { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.closePath();
        }
        if (n.c) { c.strokeStyle = n.c; c.lineWidth = n.w || 1.8; c.setLineDash(n.dash ? [7, 5] : []); c.stroke(); }
      } else if (n.t === 'circle') {
        c.beginPath(); c.arc(n.x, n.y, Math.max(0.1, n.r), 0, 2 * Math.PI);
        if (n.fill) { c.fillStyle = n.fill; c.fill(); }
        if (n.c) { c.strokeStyle = n.c; c.lineWidth = n.w || 1.8; c.setLineDash(n.dash ? [7, 5] : []); c.stroke(); }
      } else if (n.t === 'arc') {
        c.beginPath(); c.arc(n.x, n.y, n.r, n.a0, n.a1, n.a1 < n.a0); c.strokeStyle = n.c; c.lineWidth = n.w; c.stroke();
      } else if (n.t === 'dot') {
        c.beginPath(); c.arc(n.x, n.y, n.r, 0, 2 * Math.PI); c.fillStyle = n.fill; c.fill(); if (n.c) { c.strokeStyle = n.c; c.lineWidth = n.w; c.stroke(); }
      } else if (n.t === 'text') {
        c.font = (n.i ? 'italic ' : '') + (n.b ? '700 ' : '600 ') + (n.size || 14) + 'px "Times New Roman", Cambria, serif';
        c.textAlign = n.trai ? 'left' : 'center';
        if (n.nen) { var w = c.measureText(n.s).width; c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(n.x - w / 2 - 3, n.y - n.size + 1, w + 6, n.size + 5); }
        c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,.9)'; c.strokeText(n.s, n.x, n.y); c.fillStyle = n.c; c.fillText(n.s, n.x, n.y);
      }
      c.restore();
    });
  }
  var MAU_GACH = {};
  function svgTu(N, w, h) {
    MAU_GACH = {};
    var f = function (x) { return Math.round(x * 10) / 10; };
    var out = N.map(function (n) {
      if (n.t === 'line') {
        var s = '<polyline fill="none" points="' + n.p.map(function (p) { return f(p.x) + ',' + f(p.y); }).join(' ') + '" stroke="' + n.c + '" stroke-width="' + (n.w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"' + (n.dash ? ' stroke-dasharray="7 5"' : '') + '/>';
        if (n.mui) { var a = n.p[n.p.length - 2], b = n.p[n.p.length - 1], d = sub2(b, a), l = len2(d) || 1, u = mul2(d, 1 / l), nn = { x: -u.y, y: u.x }; s += '<polygon points="' + [b, { x: b.x - u.x * 10 + nn.x * 4.5, y: b.y - u.y * 10 + nn.y * 4.5 }, { x: b.x - u.x * 10 - nn.x * 4.5, y: b.y - u.y * 10 - nn.y * 4.5 }].map(function (p) { return f(p.x) + ',' + f(p.y); }).join(' ') + '" fill="' + n.c + '"/>'; }
        return s;
      }
      if (n.t === 'poly') {
        var pts = n.p.map(function (p) { return f(p.x) + ',' + f(p.y); }).join(' '), sp = '<polygon points="' + pts + '" fill="' + (n.fill || 'none') + '"' + (n.c ? ' stroke="' + n.c + '" stroke-width="' + (n.w || 1.8) + '"' : '') + '/>';
        if (n.gach) { var id = 'g' + (Object.keys(MAU_GACH).length + 1); if (!MAU_GACH[n.gach]) MAU_GACH[n.gach] = id; sp += '<polygon points="' + pts + '" fill="url(#' + MAU_GACH[n.gach] + ')"/>'; }
        return sp;
      }
      if (n.t === 'circle') return '<circle cx="' + f(n.x) + '" cy="' + f(n.y) + '" r="' + f(n.r) + '" fill="' + (n.fill || 'none') + '"' + (n.c ? ' stroke="' + n.c + '" stroke-width="' + (n.w || 1.8) + '"' : '') + (n.dash ? ' stroke-dasharray="7 5"' : '') + '/>';
      if (n.t === 'arc') { var x0 = n.x + n.r * Math.cos(n.a0), y0 = n.y + n.r * Math.sin(n.a0), x1 = n.x + n.r * Math.cos(n.a1), y1 = n.y + n.r * Math.sin(n.a1); return '<path d="M' + f(x0) + ' ' + f(y0) + 'A' + n.r + ' ' + n.r + ' 0 0 ' + (n.a1 > n.a0 ? 1 : 0) + ' ' + f(x1) + ' ' + f(y1) + '" fill="none" stroke="' + n.c + '" stroke-width="' + n.w + '"/>'; }
      if (n.t === 'dot') return '<circle cx="' + f(n.x) + '" cy="' + f(n.y) + '" r="' + n.r + '" fill="' + n.fill + '"/>';
      if (n.t === 'text') return '<text x="' + f(n.x) + '" y="' + f(n.y) + '" font-family="Times New Roman, serif" font-size="' + (n.size || 14) + '" font-weight="' + (n.b ? 700 : 600) + '"' + (n.i ? ' font-style="italic"' : '') + ' text-anchor="' + (n.trai ? 'start' : 'middle') + '" fill="' + n.c + '" stroke="#fff" stroke-width="3" paint-order="stroke">' + esc(n.s) + '</text>';
      return '';
    }).join('\n');
    var defs = Object.keys(MAU_GACH).map(function (c) { return '<pattern id="' + MAU_GACH[c] + '" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="9" stroke="' + c + '" stroke-width="2.2"/></pattern>'; }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + (defs ? '<defs>' + defs + '</defs>' : '') + '<rect width="100%" height="100%" fill="#fff"/>\n' + out + '\n</svg>';
  }
  function netsHet(xuat) {
    var h0 = hover, c0 = chon, n0 = nhom, t0 = tam, b0 = BUOC && BUOC.moi;
    if (xuat) { hover = null; chon = null; nhom = {}; tam = null; if (BUOC) BUOC.moi = {}; }
    var N = S.mode === '2d' ? nets2() : nets3();
    if (xuat) { hover = h0; chon = c0; nhom = n0; tam = t0; if (BUOC) BUOC.moi = b0; }
    return N;
  }
  function ve() {
    tinhHet();
    tam = null;
    if (picks.length && congHT() && S.mode === '2d') tam = xemTruoc2();
    if (picks.length && S.mode === '3d') { lapCam(); tam = picks.map(function (id) { var v = VAL[id]; if (!v) return null; var p = CAM.proj(v); return { t: 'dot', x: p.x, y: p.y, r: 10, fill: 'rgba(234,88,12,.35)' }; }).filter(Boolean); }
    if (keo && keo.loai === 'khung' && daDi) { var ka = keo.m, kb = chuot; (tam = tam || []).push({ t: 'poly', p: [ka, { x: kb.x, y: ka.y }, kb, { x: ka.x, y: kb.y }], fill: 'rgba(91,63,208,.08)', c: '#5b3fd0', w: 1.2, dash: 1 }); }
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    veNet(g, S.mode === '2d' ? nets2() : nets3());
  }
  function xemTruoc2() {
    var t = congHT(), last = VAL[picks[picks.length - 1]], m = chuot, out = [];
    picks.forEach(function (id) { var v = VAL[id]; if (v && v.x != null) { var p = toMH(v); out.push({ t: 'dot', x: p.x, y: p.y, r: 9, fill: 'rgba(234,88,12,.3)' }); } });
    if (!last || last.x == null) return out;
    var a = toMH(last);
    if (/^(seg|line|ray|vec|len|eq|mid|mtt)$/.test(t.id)) out.push({ t: 'line', p: [a, m], c: '#ea580c', w: 1.5, dash: 1 });
    if (t.id === 'poly') { var ps = picks.map(function (id) { return toMH(VAL[id]); }); out.push({ t: 'line', p: ps.concat([m]), c: '#ea580c', w: 1.5, dash: 1 }); }
    if (t.id === 'circ') out.push({ t: 'circle', x: a.x, y: a.y, r: len2(sub2(m, a)), c: '#ea580c', w: 1.5, dash: 1 });
    if ((t.id === 'ang' || t.id === 'bis' || t.id === 'circ3') && picks.length >= 1) { var ps2 = picks.map(function (id) { return toMH(VAL[id]); }); out.push({ t: 'line', p: ps2.concat([m]), c: '#ea580c', w: 1.5, dash: 1 }); }
    return out;
  }
  function capNhat(giuBang) { ve(); if (!giuBang) veBang(); goiY(); luuLS(); }

  // ------------------------------------------------------------------ KHUNG NHÌN
  function vuaKhung() {
    tinhHet();
    if (S.mode === '2d') {
      var ps = []; SC().objs.forEach(function (o) { var v = VAL[o.id]; if (v && v.x != null) ps.push(v); if (v && v.k === 'circ') { ps.push(add2(v.c, { x: v.r, y: v.r }), sub2(v.c, { x: v.r, y: v.r })); } });
      if (!ps.length) { S.d2.view = { s: 46, ox: 0, oy: 0 }; ve(); return; }
      var x0 = Math.min.apply(null, ps.map(function (p) { return p.x; })), x1 = Math.max.apply(null, ps.map(function (p) { return p.x; })), y0 = Math.min.apply(null, ps.map(function (p) { return p.y; })), y1 = Math.max.apply(null, ps.map(function (p) { return p.y; }));
      var s = Math.max(4, Math.min(Math.max(120, W - 80) / Math.max(1, x1 - x0), Math.max(60, H - Math.min(110, H * 0.22) - Math.min(60, H * 0.12)) / Math.max(1, y1 - y0), 90));
      S.d2.view = { s: s, ox: -(x0 + x1) / 2 * s, oy: (y0 + y1) / 2 * s + 30 }; ve(); return;
    }
    var v = S.d3.view; v.ox = 0; v.oy = 0; v.s = 70; lapCam();
    var pts = []; SC().objs.forEach(function (o) { var q = VAL[o.id]; if (q && laDiem3(o)) pts.push(CAM.proj(q)); if (q && (q.k === 'cone' || q.k === 'cyl' || q.k === 'sph')) { [q.a, q.b, q.c].forEach(function (z) { if (z) { pts.push(add2(CAM.proj(z), { x: q.r * v.s, y: q.r * v.s }), sub2(CAM.proj(z), { x: q.r * v.s, y: q.r * v.s })); } }); } });
    if (!pts.length) { ve(); return; }
    var X0 = Math.min.apply(null, pts.map(function (p) { return p.x; })), X1 = Math.max.apply(null, pts.map(function (p) { return p.x; })), Y0 = Math.min.apply(null, pts.map(function (p) { return p.y; })), Y1 = Math.max.apply(null, pts.map(function (p) { return p.y; }));
    // chừa chỗ thật cho thẻ khám phá / gợi ý phía trên và hàng nút 3D phía dưới (đo kích thước thật, hợp cả điện thoại)
    var oTren = KP.bat && !$('#kp-the').classList.contains('an') ? $('#kp-the') : $('#goi-y'), n3 = $('#nut-3d');
    var tren = (oTren && oTren.offsetHeight ? oTren.offsetTop + oTren.offsetHeight : 60) + 30, duoi = (n3 && n3.offsetHeight ? H - n3.offsetTop : 60) + 24;
    var k = Math.max(0.05, Math.min(Math.max(120, W - 120) / Math.max(10, X1 - X0), Math.max(60, H - tren - duoi) / Math.max(10, Y1 - Y0)));   // khung nhỏ (điện thoại nằm ngang) vẫn giữ tỉ lệ dương
    v.s *= k; v.ox = -((X0 + X1) / 2 - W / 2) * k; v.oy = -((Y0 + Y1) / 2 - H / 2) * k + (tren - duoi) / 2;
    ve();
  }
  function coGian() {
    var r = $('#san').getBoundingClientRect(); DPR = window.devicePixelRatio || 1; W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ve();
  }
  function phong(k, cx, cy) {
    var v = D().view; cx = cx == null ? W / 2 : cx; cy = cy == null ? H / 2 : cy;
    var ox = cx - W / 2 - v.ox, oy = cy - H / 2 - v.oy;
    v.s *= k; v.ox = cx - W / 2 - ox * k; v.oy = cy - H / 2 - oy * k; ve(); luuLS();
  }

  // ------------------------------------------------------------------ CHUỘT / CHẠM
  var cham = {}, dauCham = null, daDi = false, TO = 1;   // TO: phóng vùng chạm khi dùng ngón tay
  function viTri(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  // ---- chọn nhiều: chon = đối tượng chính, nhom = các đối tượng chọn thêm
  var nhom = {};
  function laChon(id) { return id != null && (id === chon || !!nhom[id]); }
  function dsChon() { var a = Object.keys(nhom).map(Number).filter(function (x) { return x !== chon && obj(x); }); if (chon != null && obj(chon)) a.unshift(chon); return a; }
  function boChon() { chon = null; nhom = {}; }
  function datChon(id) { chon = id; nhom = {}; }
  function doiChon(id) {
    if (!laChon(id)) { if (chon == null) chon = id; else nhom[id] = 1; return; }
    var a = dsChon().filter(function (x) { return x !== id; }); chon = a.length ? a[0] : null; nhom = {}; a.slice(1).forEach(function (x) { nhom[x] = 1; });
  }
  function themNhieu(ids, giu) { if (!giu) boChon(); ids.forEach(function (id) { if (!laChon(id)) { if (chon == null) chon = id; else nhom[id] = 1; } }); }
  function diemMH(o) {   // các điểm màn hình đại diện cho một đối tượng (để chọn bằng khung)
    var v = VAL[o.id]; if (!v || !hienO(o)) return null;
    if (S.mode === '2d') {
      if (laDiem2(o) || o.t === 'txt') return [toMH(v)];
      if (v.k === 'circ') return [toMH(add2(v.c, { x: v.r, y: v.r })), toMH(sub2(v.c, { x: v.r, y: v.r }))];
      if (v.pts) return v.pts.map(toMH);
      if (v.a) return [toMH(v.a), toMH(v.b)];
      return null;
    }
    if (laDiem3(o)) return [CAM.proj(v)];
    if (v.pts) return v.pts.map(CAM.proj);
    if (v.a && (v.k === 'seg' || v.k === 'line3' || v.k === 'len3')) return [CAM.proj(v.a), CAM.proj(v.b)];
    return null;
  }
  function chonKhung(a, b, giu) {
    var x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y), ids = [];
    if (S.mode === '3d') lapCam();
    SC().objs.forEach(function (o) { if (o.t === 'solid') return; var ps = diemMH(o); if (ps && ps.length && ps.every(function (p) { return p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1; })) ids.push(o.id); });
    themNhieu(ids, giu);
    if (ids.length) thongBao('Đã chọn ' + dsChon().length + ' đối tượng — kéo một đối tượng trong nhóm để dời cả nhóm.', 1);
  }
  function goc1(id) {   // các điểm tự do (và chữ) mà một đối tượng phụ thuộc vào
    var kq = [], da = {};
    (function di(i) { if (da[i]) return; da[i] = 1; var o = obj(i); if (!o) return; if (o.t === 'pt' || o.t === 'txt') { kq.push(i); return; } (o.d || []).forEach(di); })(id);
    return kq;
  }
  function gocNhom2(ids) { var tap = {}; ids.forEach(function (id) { goc1(id).forEach(function (i) { tap[i] = 1; }); }); return Object.keys(tap).map(Number); }
  function diemGoc(id) {   // cả khối hình liền với đối tượng: kéo một nét là dời cả hình
    var tap = {}; goc1(id).forEach(function (i) { tap[i] = 1; });
    var L = SC().objs.filter(function (o) { return o.t !== 'pt' && o.t !== 'txt'; }).map(function (o) { return goc1(o.id); }), doi = true;
    while (doi) {
      doi = false;
      L.forEach(function (g) { if (g.some(function (i) { return tap[i]; }) && g.some(function (i) { return !tap[i]; })) { g.forEach(function (i) { tap[i] = 1; }); doi = true; } });
    }
    return Object.keys(tap).map(Number);
  }
  function gocNhom3(ids) {   // các điểm toạ độ (p3) mà nhóm đối tượng phụ thuộc vào
    var kq = [], da = {};
    var di = function (i) { if (da[i]) return; da[i] = 1; var o = obj(i); if (!o) return; if (o.t === 'p3') { kq.push(i); return; } (o.d || []).concat([].concat.apply([], o.f || [])).forEach(di); };
    ids.forEach(di); return kq;
  }
  cv.addEventListener('pointerdown', function (e) {
    try { cv.setPointerCapture(e.pointerId); } catch (x) { }
    cham[e.pointerId] = viTri(e);
    var ids = Object.keys(cham);
    if (ids.length === 2) { var a = cham[ids[0]], b = cham[ids[1]]; dauCham = { d: len2(sub2(a, b)), m: mul2(add2(a, b), 0.5) }; keo = null; return; }
    var m = viTri(e); chuot = m; daDi = false;
    TO = e.pointerType === 'touch' ? 2.2 : e.pointerType === 'pen' ? 1.4 : 1;
    var t = cong[S.mode], giu = e.shiftKey || e.ctrlKey || e.metaKey, phai = e.button === 1 || e.button === 2, ngon = e.pointerType === 'touch';
    if (BUOC) { keo = S.mode === '2d' ? { loai: 'dich', m: m, v: Object.assign({}, S.d2.view) } : { loai: 'xoay', m: m, v: Object.assign({}, S.d3.view) }; return; }
    if (phai || t === 'tay' || t === 'dich') { keo = { loai: S.mode === '2d' ? 'dich' : 'dich3', m: m, v: Object.assign({}, D().view) }; return; }
    if (S.mode === '2d') {
      if (t !== 'move' && t !== 'khung') { keo = { loai: 'cong', m: m }; return; }
      var o = trung2(m, '*');
      if (t === 'khung') {   // chọn nhiều: kéo khung, chạm để thêm/bớt, kéo đối tượng đã chọn để dời nhóm
        if (!o) { keo = { loai: 'khung', m: m, giu: true, xoa: true }; return; }
        if (!laChon(o.id)) { keo = { loai: 'chonThem', id: o.id, m: m }; return; }
        var gk = gocNhom2(dsChon());
        keo = { loai: 'khoi', m: m, w0: tuMH(m.x, m.y), ids: gk, goc: gk.map(function (id) { var q = obj(id); return { x: q.x, y: q.y }; }), tat: o.id };
        return;
      }
      if (!o) { keo = !giu ? { loai: 'dich', m: m, v: Object.assign({}, S.d2.view), boChon: true } : { loai: 'khung', m: m, giu: giu }; cv.style.cursor = giu ? '' : 'grabbing'; return; }
      if (giu) { keo = { loai: 'chonThem', id: o.id, m: m }; return; }
      var nhieu = laChon(o.id) && dsChon().length > 1;
      if (!nhieu && (o.t === 'pt' || o.t === 'on' || o.t === 'txt')) { keo = { loai: 'diem', id: o.id, ghi: false, m: m }; datChon(o.id); veBang(); return; }
      var goc = nhieu ? gocNhom2(dsChon()) : diemGoc(o.id);
      if (!nhieu) datChon(o.id);
      veBang();
      keo = goc.length ? { loai: 'khoi', m: m, w0: tuMH(m.x, m.y), ids: goc, goc: goc.map(function (id) { var q = obj(id); return { x: q.x, y: q.y }; }) } : { loai: 'chon', m: m };
      return;
    }
    lapCam();
    var tc = t === 'xoay' || t === 'chon', q = tc ? trung3(m) : null;
    if (!tc) { keo = { loai: 'xoay', m: m, v: Object.assign({}, S.d3.view) }; return; }
    if (ngon && t === 'chon') giu = true;   // điện thoại: chạm để thêm/bớt
    if (!q) { keo = (t === 'chon' || (giu && !ngon)) ? { loai: 'khung', m: m, giu: giu, xoa: ngon } : { loai: 'xoay', m: m, v: Object.assign({}, S.d3.view) }; return; }
    var nhieu3 = laChon(q.id) && dsChon().length > 1;
    if (q.t === 'p3' || t === 'chon' || nhieu3) {
      var g3 = gocNhom3(nhieu3 ? dsChon() : [q.id]);
      if (g3.length) { keo = { loai: 'diem3', id: q.id, giu: giu, m: m, ids: g3, goc: g3.map(function (id) { var p = obj(id); return { x: p.x, y: p.y, z: p.z }; }), z0: q.t === 'p3' ? q.z : obj(g3[0]).z }; return; }
    }
    keo = giu ? { loai: 'chonThem', id: q.id, m: m } : { loai: 'xoay', m: m, v: Object.assign({}, S.d3.view) };
  });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  cv.addEventListener('pointermove', function (e) {
    var m = viTri(e); chuot = m;
    if (cham[e.pointerId]) cham[e.pointerId] = m;
    var ids = Object.keys(cham);
    if (ids.length === 2 && dauCham) {   // hai ngón: chụm để phóng to, kéo để dời trang
      var a = cham[ids[0]], b = cham[ids[1]], d = len2(sub2(a, b)), giua = mul2(add2(a, b), 0.5), v0 = D().view;
      if (dauCham.d > 10) { var k = d / dauCham.d; var ox = giua.x - W / 2 - v0.ox, oy = giua.y - H / 2 - v0.oy; v0.s *= k; v0.ox = giua.x - W / 2 - ox * k; v0.oy = giua.y - H / 2 - oy * k; dauCham.d = d; }
      v0.ox += giua.x - dauCham.m.x; v0.oy += giua.y - dauCham.m.y; dauCham.m = giua; ve();
      return;
    }
    if (!keo) {
      var cu = hover; hover = null;
      if (BUOC) return;
      if (S.mode === '2d') { var o = trung2(m, cong['2d'] === 'move' || cong['2d'] === 'del' ? '*' : congHT().can && /[LC]/.test(congHT().can[picks.length] || '') ? congHT().can[picks.length] : 'P'); hover = o ? o.id : null; }
      else { lapCam(); var o3 = trung3(m, !/^(xoay|chon|del|diem|dich)$/.test(cong['3d']) && !(congHT() && congHT().can && /P/.test(congHT().can[0] || ''))); hover = o3 ? o3.id : null; }
      if (hover !== cu || picks.length) ve();
      return;
    }
    if (len2(sub2(m, keo.m || m)) > 4) daDi = true;
    if (keo.loai === 'cong' && daDi && S.mode === '2d') { keo = { loai: 'dich', m: keo.m, v: Object.assign({}, S.d2.view) }; cv.style.cursor = 'grabbing'; }   // đang cầm công cụ vẽ mà kéo chỗ trống: dời trang
    if (keo.loai === 'khung') { if (daDi) ve(); return; }
    if (keo.loai === 'diem') {
      if (!daDi) return;
      var o2 = obj(keo.id); if (!o2) return;
      if (!keo.ghi) { ghiLS(); keo.ghi = true; }
      var w = tuMH(m.x, m.y);
      if (o2.t === 'pt') { var q = bat(w); o2.x = q.x; o2.y = q.y; }
      else if (o2.t === 'txt') { o2.x = w.x; o2.y = w.y; }
      else if (o2.t === 'on') { var T = VAL[o2.d[0]]; if (T) o2.u = thamSo(T, w); }
      ve();
    } else if (keo.loai === 'khoi' && daDi) {
      if (!keo.ghi) { ghiLS(); keo.ghi = true; }
      var dw = sub2(tuMH(m.x, m.y), keo.w0);
      if (S.d2.bat && S.d2.luoi) { var bl = buocLuoi(); dw = { x: Math.round(dw.x / bl) * bl, y: Math.round(dw.y / bl) * bl }; }
      keo.ids.forEach(function (id, i) { var q = obj(id); q.x = keo.goc[i].x + dw.x; q.y = keo.goc[i].y + dw.y; });
      ve();
    } else if (keo.loai === 'diem3' && daDi) {
      if (!keo.ghi) { ghiLS(); keo.ghi = true; }
      lapCam();
      var tron2 = function (x) { return Math.round(x * 100) / 100; };
      if (e.shiftKey) {
        var dz = sub2(CAM.proj(P3(0, 0, 1)), CAM.proj(P3(0, 0, 0))), ddz = dot2(sub2(m, keo.m), dz) / dot2(dz, dz);
        if (S.d3.luoi) ddz = Math.round(ddz * 2) / 2;
        keo.ids.forEach(function (id, i) { var p = obj(id); p.x = keo.goc[i].x; p.y = keo.goc[i].y; p.z = tron2(keo.goc[i].z + ddz); });
      } else {
        var w0 = tuMH3(keo.m, keo.z0), w1 = tuMH3(m, keo.z0);
        if (w0 && w1) {
          var dx = w1.x - w0.x, dy = w1.y - w0.y; if (S.d3.luoi) { dx = Math.round(dx * 2) / 2; dy = Math.round(dy * 2) / 2; }
          keo.ids.forEach(function (id, i) { var p = obj(id); p.x = tron2(keo.goc[i].x + dx); p.y = tron2(keo.goc[i].y + dy); p.z = keo.goc[i].z; });
        }
      }
      ve();
    } else if (keo.loai === 'dich3' && daDi) { S.d3.view.ox = keo.v.ox + m.x - keo.m.x; S.d3.view.oy = keo.v.oy + m.y - keo.m.y; ve();
    } else if (keo.loai === 'dich' && daDi) { S.d2.view.ox = keo.v.ox + m.x - keo.m.x; S.d2.view.oy = keo.v.oy + m.y - keo.m.y; ve(); }
    else if (keo.loai === 'xoay' && daDi) {
      var v = S.d3.view;
      if (v.sgk) { v.sgk = false; $('#nut-3d [data-v="sgk"]').classList.remove('bat'); }
      v.yaw = keo.v.yaw - (m.x - keo.m.x) * 0.008; v.pitch = Math.max(-1.45, Math.min(1.45, keo.v.pitch + (m.y - keo.m.y) * 0.008)); ve();
    }
  });
  function len_(e) {
    delete cham[e.pointerId];
    if (Object.keys(cham).length < 2) dauCham = null;
    if (!keo) return;
    var k = keo; keo = null; cv.style.cursor = '';
    if (BUOC) { if (!daDi) diBuoc(1); return; }
    if (k.loai === 'khung') { if (daDi) chonKhung(k.m, chuot, k.giu); else if (!k.giu || k.xoa) boChon(); capNhat(); return; }
    if (k.loai === 'chonThem') { doiChon(k.id); capNhat(); return; }
    if (k.loai === 'diem') { capNhat(daDi); return; }
    if (k.loai === 'khoi' && !daDi && k.tat != null) { doiChon(k.tat); capNhat(); return; }
    if (k.loai === 'khoi' || k.loai === 'chon') { capNhat(daDi); return; }
    if (k.loai === 'diem3') {
      if (daDi) { capNhat(true); return; }
      if (k.giu) doiChon(k.id); else if (!(laChon(k.id) && dsChon().length > 1)) datChon(k.id);
      capNhat(); return;
    }
    if (k.loai === 'dich' || k.loai === 'dich3') {
      if (!daDi && k.boChon) { boChon(); capNhat(); return; }
      if (!daDi && /^(tay|dich)$/.test(cong[S.mode])) { var od; if (S.mode === '3d') { lapCam(); od = trung3(k.m); } else od = trung2(k.m, '*'); if (od) datChon(od.id); else boChon(); capNhat(); }
      else luuLS();
      return;
    }
    if (k.loai === 'cong' && !daDi) { bam2(k.m); return; }
    if (k.loai === 'xoay' && !daDi) {
      lapCam();
      if (cong['3d'] === 'xoay' || cong['3d'] === 'chon') { var o = trung3(k.m); if (o) datChon(o.id); else boChon(); capNhat(); }
      else bam3(k.m);
      return;
    }
    luuLS();
  }
  cv.addEventListener('pointerup', len_); cv.addEventListener('pointercancel', len_);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); var m = viTri(e); phong(e.deltaY < 0 ? 1.12 : 1 / 1.12, m.x, m.y); }, { passive: false });
  cv.addEventListener('dblclick', function (e) {
    if (BUOC) return;
    var o;
    if (S.mode === '2d') { if (cong['2d'] !== 'move') return; o = trung2(viTri(e), '*'); }
    else { if (!/^(xoay|chon|dich)$/.test(cong['3d'])) return; lapCam(); o = trung3(viTri(e)); }
    if (!o || (o.ten === undefined && !laDiem3(o))) return;
    hoi('Đổi tên', [{ nhan: 'Tên mới (VD: A, M_1, A\', (d))', v: o.ten || '' }]).then(function (r) { if (r) { ghiLS(); o.ten = r[0].trim(); capNhat(); } });
  });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || !$('#hop').classList.contains('an')) return;
    var ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); hoanTac(e.shiftKey); }
    else if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); hoanTac(true); }
    else if (ctrl && e.key.toLowerCase() === 'a' && !BUOC) { e.preventDefault(); themNhieu(SC().objs.filter(function (o) { return o.t !== 'solid' && hienO(o); }).map(function (o) { return o.id; })); capNhat(); }
    else if (BUOC && (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown')) { e.preventDefault(); diBuoc(1); }
    else if (BUOC && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); diBuoc(-1); }
    else if (BUOC && e.key === 'Escape') thoatBuoc();
    else if (e.key === 'Escape') { picks = []; vongXong = false; boChon(); capNhat(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && dsChon().length) { ghiLS(); dsChon().forEach(function (id) { if (obj(id)) xoa(id); }); boChon(); capNhat(); }
  });

  // ------------------------------------------------------------------ NÚT
  document.querySelectorAll('.che-do button').forEach(function (b) {
    b.onclick = function () { if (BUOC) thoatBuoc(); S.mode = b.dataset.mode; boChon(); picks = []; vongXong = false; hover = null; datCheDo(); };
  });
  function datCheDo() {
    document.querySelectorAll('.che-do button').forEach(function (x) { x.classList.toggle('on', x.dataset.mode === S.mode); });
    $('#nut-3d').classList.toggle('an', S.mode !== '3d');
    document.querySelector('[data-a="luoi"]').classList.toggle('bat', !!D().luoi);
    document.querySelector('[data-a="truc"]').classList.toggle('bat', !!D().truc);
    $('#nut-3d [data-v="sgk"]').classList.toggle('bat', !!S.d3.view.sgk);
    $('#nut-3d [data-v="quay"]').classList.toggle('bat', !!S.d3.quay);
    $('#nut-3d [data-v="to"]').classList.toggle('bat', !!S.d3.toKhoi);
    $('#nut-3d [data-v="kp"]').classList.toggle('bat', !!KP.bat);
    if (S.mode !== '3d') $('#kp-the').classList.add('an'); else veTheKP();
    veCongCu(); goiY(); veBang(); ve();
    if (S.mode === '3d' && !SC().objs.length && !S.d3.daVao) dungMau('chop4');   // chỉ dựng hình mẫu lần đầu vào trang không gian
    if (S.mode === '3d') S.d3.daVao = true;
  }
  document.querySelectorAll('.hanh-dong button').forEach(function (b) {
    b.onclick = function () {
      var a = b.dataset.a;
      if (BUOC && a !== 'buoc' && a !== 'png' && a !== 'svg' && a !== 'chep' && a !== 'hd') thoatBuoc();
      if (a === 'undo') hoanTac(false);
      else if (a === 'redo') hoanTac(true);
      else if (a === 'luoi') { D().luoi = !D().luoi; datCheDo(); luuLS(); }
      else if (a === 'buoc') { if (BUOC) thoatBuoc(); else batBuoc(); }
      else if (a === 'truc') { D().truc = !D().truc; datCheDo(); luuLS(); }
      else if (a === 'moi') { if (SC().objs.length && !confirm('Xoá hình đang vẽ để bắt đầu trang mới? (Có thể bấm Hoàn tác để lấy lại)')) return; ghiLS(); D().sc = canhMoi(); boChon(); picks = []; capNhat(); }
      else if (a === 'luu') taiVe(new Blob([JSON.stringify(xuatBai())], { type: 'application/json' }), 'hinh-ve-' + S.mode + '.json');
      else if (a === 'may') { if (window.VE_LUU) VE_LUU.mo(); else thongBao('Chưa tải được phần lưu bài — tải lại trang rồi thử lại.'); }
      else if (a === 'mo') $('#tep').click();
      else if (a === 'png') xuatPNG().then(function (bl) { taiVe(bl, 'hinh-ve.png'); });
      else if (a === 'svg') { var N = netsHet(true); taiVe(new Blob([svgTu(N, Math.round(W), Math.round(H))], { type: 'image/svg+xml' }), 'hinh-ve.svg'); }
      else if (a === 'chep') xuatPNG().then(function (bl) {
        if (navigator.clipboard && window.ClipboardItem) navigator.clipboard.write([new ClipboardItem({ 'image/png': bl })]).then(function () { thongBao('Đã chép ảnh — mở Word và bấm Ctrl+V để dán.'); }, function () { taiVe(bl, 'hinh-ve.png'); });
        else taiVe(bl, 'hinh-ve.png');
      });
      else if (a === 'hd') huongDan();
      else if (a === 'bang') { bangMo = !bangMo; boChon(); veBang(); }
    };
  });
  $('#tep').onchange = function () {
    var f = this.files[0]; if (!f) return;
    f.text().then(function (s) {
      try { napBai(JSON.parse(s)); }
      catch (e) { thongBao('Tệp không đúng định dạng của phần mềm vẽ hình.'); }
    });
    this.value = '';
  };
  document.querySelectorAll('#nut-3d button').forEach(function (b) {
    b.onclick = function () {
      var v = S.d3.view, k = b.dataset.v;
      if (k === 'sgk') { v.sgk = !v.sgk; }
      else if (k === 'chuan') { v.sgk = false; v.yaw = -1.2; v.pitch = 0.4; }
      else if (k === 'tren') { v.sgk = false; v.yaw = -Math.PI / 2; v.pitch = 1.45; }
      else if (k === 'truoc') { v.sgk = false; v.yaw = -Math.PI / 2; v.pitch = 0.05; }
      else if (k === 'quay') { S.d3.quay = !S.d3.quay; if (S.d3.quay) { v.sgk = false; quayTuDong(); } }
      else if (k === 'to') { S.d3.toKhoi = !S.d3.toKhoi; }
      else if (k === 'kp') { if (KP.bat) { KP.bat = false; KP.k = null; veTheKP(); } else { if (!SC().cauTruc) dungMau(mauDangChon === 'trong' ? 'chop4' : mauDangChon); moKP(); } veBang(); }
      datCheDo(); if (k !== 'quay' && k !== 'to' && k !== 'kp') vuaKhung(); luuLS();
    };
  });
  function quayTuDong() { if (!S.d3.quay || S.mode !== '3d') return; S.d3.view.yaw += 0.008; ve(); requestAnimationFrame(quayTuDong); }
  document.querySelectorAll('#phong button').forEach(function (b) { b.onclick = function () { var z = +b.dataset.z; if (z) phong(z > 0 ? 1.2 : 1 / 1.2); else vuaKhung(); }; });
  function xuatPNG() {
    var k = 2, c = document.createElement('canvas'); c.width = W * k; c.height = H * k;
    var x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    veNet(x, netsHet(true));
    return new Promise(function (ok) { c.toBlob(ok, 'image/png'); });
  }
  function taiVe(blob, ten) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ten; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function huongDan() {
    $('#hop-t').textContent = '❓ Hướng dẫn vẽ hình';
    $('#hop-n').innerHTML = '<div class="hd"><b>📐 Hình phẳng</b><ul><li>Chọn công cụ → bấm lên vùng vẽ. Bấm <b>chỗ trống</b> tạo điểm mới, <b>lên đường</b> tạo điểm trên đường, <b>chỗ cắt nhau</b> lấy giao điểm.</li><li><b>Chọn · kéo</b>: kéo điểm tự do (tím) hoặc điểm trên đường (xanh) — mọi đối tượng phụ thuộc tự cập nhật đúng quan hệ.</li><li>✋ Kéo một <b>đoạn, đường, đa giác</b> để dời cả hình. Dời trang vẽ (xem phần đồ thị ở xa): <b>kéo chỗ trống</b> bằng chuột hoặc ngón tay; phóng to, thu nhỏ: lăn chuột hoặc chụm hai ngón.</li><li>🔲 <b>Chọn nhiều</b>: công cụ Chọn nhiều, hoặc giữ <b>Shift</b> rồi kéo khung ở chỗ trống, hoặc giữ <b>Shift/Ctrl</b> rồi bấm từng đối tượng (Ctrl+A chọn tất cả) → đổi màu, nét, cỡ tên, ẩn, xoá hoặc kéo dời cả nhóm.</li><li>Bấm một đối tượng để đổi <b>tên, màu tên, cỡ tên, màu nét, nét đứt, độ dày</b>, ẩn hoặc xoá. Nhấp đúp vào điểm để đổi tên. Tên có chỉ số: gõ <b>M_1</b> → M₁.</li><li>📈 <b>Đồ thị hàm số</b>: gõ y = x^2 - 2x - 3, (x+1)/(x-2), sqrt(x), |x-1|, sin(x)… (có thể giới hạn đoạn x). Bấm lên đồ thị để lấy điểm thuộc đồ thị; công cụ Giao điểm tìm giao của đồ thị với đường thẳng hoặc đồ thị khác.</li><li>🟥 <b>Miền nghiệm</b>: gõ bất phương trình hoặc hệ (cách nhau bằng ;). Như SGK, phần không là nghiệm bị gạch bỏ, bờ nét đứt khi dấu &lt; hoặc &gt;. Bấm vào bờ để đổi sang tô miền nghiệm hoặc tô màu.</li><li>📱 Trên điện thoại: kéo chỗ trống để dời trang, chụm 2 ngón để phóng to, công cụ <b>Chọn nhiều</b> để chạm chọn từng đối tượng.</li><li><b>Đo · kí hiệu</b>: góc (tự vẽ kí hiệu góc vuông khi bằng 90°), độ dài, gạch bằng nhau (bấm lại để đổi 1–2–3 gạch).</li></ul>' +
      '<b>🧊 Hình không gian</b><ul><li>Chọn <b>hình mẫu</b> ở bảng bên phải (chóp, tứ diện, lăng trụ, hộp, nón, trụ, cầu), nhập kích thước → <b>Dựng hình</b>.</li><li><b>Kéo</b> để xoay, lăn chuột / chụm 2 ngón để phóng to. Nút <b>SGK</b> cho góc nhìn như sách giáo khoa.</li><li>Nét khuất <b>tự động chuyển nét đứt</b> theo góc nhìn (kể cả khuất một phần). Muốn cố định: bấm đoạn → Nét: Liền/Đứt.</li><li>✏️ Với mọi công cụ, <b>bấm chỗ trống</b> là máy tự tạo điểm mới ở mặt đáy (bấm lên đoạn: điểm thuộc đoạn) — không cần chấm điểm trước. Khi chọn đỉnh khối chóp/lăng trụ, bấm chỗ trống phía trên đáy là có đỉnh.</li><li>✏️ <b>Tự vẽ</b>: <b>Điểm</b> (bấm chỗ trống: điểm ở mặt đáy, có lưới để đặt đúng ô) → <b>Điểm trên cao</b> (đỉnh S, A′…) → <b>Khối chóp</b> / <b>Khối lăng trụ</b> (máy tự kẻ cạnh, tự xác định nét khuất). Có thêm đường thẳng, song song, mặt phẳng (P), tô mặt, đo độ dài. Kéo điểm đáy để sửa hình (giữ Shift: kéo lên/xuống).</li><li>Công cụ: nối điểm, trung điểm, điểm chia theo tỉ số, trọng tâm, hình chiếu vuông góc lên mặt/đường (tự kẻ kí hiệu góc vuông), giao 2 đường, giao đường – mặt, <b>thiết diện</b> (tô màu).</li></ul>' +
      '<b>🎨 Kiểu · 👁 Ẩn hiện · 🎬 Các bước</b><ul><li>Bảng bên phải: <b>Kiểu hình vẽ</b> (cỡ hình, cỡ tên, cỡ điểm, độ đậm nét, màu tên, màu cả hình) và <b>Đối tượng đã vẽ</b> (bấm 👁 để ẩn/hiện từng đối tượng).</li><li><b>▦ Lưới</b> bật/tắt lưới ô vuông (mỗi ô 1 đơn vị) ở cả hình phẳng và hình không gian.</li><li>Vẽ xong bấm <b>🎬 Các bước</b>: bấm vào hình (hoặc ▶, phím →) để hình hiện lần lượt từng bước từ đầu đến khi hoàn thiện; <b>Tự chạy</b> để máy tự trình chiếu.</li></ul><b>💾 Lưu, xuất</b><ul><li><b>☁ Lưu bài</b>: lưu hình vào tài khoản website để buổi sau mở lại trên bất kì máy nào (Ctrl+S lưu nhanh). Mỗi tài khoản lưu miễn phí 1 bài; muốn lưu thêm thì đăng ký nâng cấp và liên hệ Ban quản trị để được cấp mã.</li><li>Hình tự lưu trên máy. <b>Lưu</b> tải tệp .json để mở sửa lại; <b>Chép ảnh</b> rồi Ctrl+V vào Word; <b>PNG</b>, <b>SVG</b> (nét sắc khi in).</li></ul></div>';
    $('#hop').classList.remove('an'); $('#hop-huy').style.display = 'none';
    $('#hop-ok').onclick = function () { $('#hop').classList.add('an'); $('#hop-huy').style.display = ''; };
  }

  // ------------------------------------------------------------------ CÁC BƯỚC VẼ (trình chiếu lại hình từ đầu)
  var DONG_TU = { ham: 'Vẽ đồ thị hàm số', bpt: 'Biểu diễn miền nghiệm của', seg: 'Vẽ đoạn thẳng', seg3: 'Vẽ đoạn thẳng', line: 'Vẽ đường thẳng', line3: 'Vẽ đường thẳng', ray: 'Vẽ tia', vec: 'Vẽ vectơ', perp: 'Kẻ đường vuông góc', par: 'Kẻ đường song song', mtt: 'Dựng đường trung trực của', bis: 'Dựng tia phân giác góc', poly: 'Tô đa giác', circ: 'Vẽ đường tròn', circr: 'Vẽ đường tròn', circ3: 'Vẽ đường tròn', ang: 'Đánh dấu góc', len: 'Đo độ dài', len3: 'Đo độ dài', eq: 'Đánh dấu hai đoạn bằng nhau', txt: 'Ghi chú', mid: 'Lấy trung điểm', mid3: 'Lấy trung điểm', int: 'Lấy giao điểm', int3: 'Lấy giao điểm', intLP: 'Lấy giao điểm', proj: 'Dựng hình chiếu vuông góc', projP: 'Dựng hình chiếu vuông góc', projL: 'Dựng hình chiếu vuông góc', refl: 'Lấy điểm đối xứng', on: 'Lấy điểm', on3: 'Lấy điểm', cen3: 'Lấy trọng tâm', up3: 'Dựng điểm', tr3: 'Dựng điểm', reg: 'Dựng đỉnh', rt3: 'Kí hiệu góc vuông', sec: 'Dựng thiết diện', mp3: 'Tô mặt', matP: 'Vẽ mặt phẳng', cone: 'Vẽ hình nón', cyl: 'Vẽ hình trụ', sph: 'Vẽ mặt cầu', pt: 'Lấy điểm', p3: 'Lấy điểm' };
  var CUA = { mid: 1, mid3: 1, proj: 1, projP: 1, projL: 1, refl: 1, cen3: 1 };
  function moTaBuoc(o) {
    var ten = function (id) { var q = obj(id); return q && q.ten ? tenHien(q.ten) : ''; }, chu = DONG_TU[o.t] || 'Vẽ';
    if (o.t === 'txt') return chu + ' “' + o.s + '”';
    if (o.t === 'ham') return chu + ' y = ' + depBT(o.bt);
    if (o.t === 'bpt') return chu + ' ' + depBT(o.bt);
    if (CUA[o.t]) return chu + ' ' + tenHien(o.ten || '') + ' của ' + (o.t === 'cen3' ? 'tam giác ' : '') + (o.t === 'proj' || o.t === 'projP' || o.t === 'projL' || o.t === 'refl' ? ten(o.d[0]) : o.d.map(ten).join(''));
    if (o.t === 'up3') return chu + ' ' + tenHien(o.ten || '') + ' thẳng đứng phía trên ' + ten(o.d[0]);
    if (o.t === 'on3') return chu + ' ' + tenHien(o.ten || '') + ' trên đoạn ' + o.d.map(ten).join('');
    if (o.t === 'rt3') return chu + ' tại ' + ten(o.d[1]);
    return chu + ' ' + tenO(o);
  }
  function lapBuoc() {   // điểm tự do hiện cùng đối tượng đầu tiên dùng nó; điểm dựng từ điểm khác thì điểm gốc hiện trước
    var L = SC().objs.filter(function (o) { return !o.an && o.t !== 'solid'; }), tuDo = function (o) { return o.t === 'pt' || o.t === 'p3'; };
    var laD = function (o) { return laDiem2(o) || laDiem3(o); }, dep = function (o) { return (o.d || []).concat([].concat.apply([], o.f || [])); };
    var dung = {}, da = {}, ds = [];
    L.forEach(function (o) { if (!tuDo(o)) dep(o).forEach(function (id) { dung[id] = 1; }); });
    L.forEach(function (o) {
      if (tuDo(o)) { if (!dung[o.id] && !da[o.id]) { da[o.id] = 1; ds.push({ ids: [o.id], moTa: moTaBuoc(o) }); } return; }
      var moi = dep(o).filter(function (id) { var q = obj(id); return q && tuDo(q) && !q.an && !da[id]; });
      moi.forEach(function (id) { da[id] = 1; });
      if (laD(o)) { moi.forEach(function (id) { ds.push({ ids: [id], moTa: moTaBuoc(obj(id)) }); }); moi = []; }
      da[o.id] = 1; ds.push({ ids: [o.id].concat(moi), moTa: moTaBuoc(o) });
    });
    return ds;
  }
  var hen = null;
  function batBuoc() {
    var ds = lapBuoc(); if (!ds.length) { thongBao('Chưa có hình để trình chiếu.'); return; }
    boChon(); picks = []; vongXong = false;
    BUOC = { k: 0, ds: ds, hien: {}, moi: {} };
    veBang();
    $('#buoc').classList.remove('an'); document.querySelector('[data-a="buoc"]').classList.add('bat');
    datBuoc(0);
  }
  function thoatBuoc() {
    if (hen) { clearInterval(hen); hen = null; }
    BUOC = null; $('#buoc').classList.add('an'); document.querySelector('[data-a="buoc"]').classList.remove('bat');
    capNhat();
  }
  function datBuoc(k) {
    var n = BUOC.ds.length; k = Math.max(0, Math.min(n, k)); BUOC.k = k; BUOC.hien = {}; BUOC.moi = {};
    for (var i = 0; i < k; i++) BUOC.ds[i].ids.forEach(function (id) { BUOC.hien[id] = 1; if (i === k - 1) BUOC.moi[id] = 1; });
    $('#buoc-t').innerHTML = k ? '<b>Bước ' + k + '/' + n + '</b> · ' + esc(BUOC.ds[k - 1].moTa) : 'Bấm ▶ (hoặc bấm vào hình, phím →) để vẽ lần lượt <b>' + n + ' bước</b>';
    $('#buoc-chay').textContent = hen ? '⏸ Dừng' : '⏵ Tự chạy';
    $('#goi-y').textContent = k === n ? '✅ Hoàn thành hình vẽ · bấm ✕ để quay lại vẽ tiếp' : '🎬 Đang trình chiếu các bước vẽ';
    ve();
  }
  function diBuoc(d) { if (!BUOC) return; datBuoc(BUOC.k + d); if (hen && BUOC.k >= BUOC.ds.length) { clearInterval(hen); hen = null; datBuoc(BUOC.k); } }
  document.querySelectorAll('#buoc [data-b]').forEach(function (b) {
    b.onclick = function () {
      var k = b.dataset.b;
      if (k === 'dau') datBuoc(0); else if (k === 'lui') diBuoc(-1); else if (k === 'toi') diBuoc(1); else if (k === 'cuoi') datBuoc(BUOC.ds.length);
      else if (k === 'thoat') thoatBuoc();
      else if (k === 'chay') {
        if (hen) { clearInterval(hen); hen = null; datBuoc(BUOC.k); return; }
        if (BUOC.k >= BUOC.ds.length) datBuoc(0);
        hen = setInterval(function () { diBuoc(1); }, 1400); diBuoc(1);
      }
    };
  });

  // ------------------------------------------------------------------ KHỞI ĐỘNG
  var coLuu = napLS();
  var cheDoLink = new URLSearchParams(location.search).get('che-do');
  if (cheDoLink === '3d' || cheDoLink === '2d') S.mode = cheDoLink; else if (!coLuu) S.mode = '2d';
  window.addEventListener('resize', coGian);
  coGian();
  datCheDo();
  if (!coLuu && S.mode === '2d') { viDu2(1); HIST['2d'].u = []; }
  setTimeout(function () { if (!coLuu) vuaKhung(); }, 50);
  function xuatBai() { return { phanMem: 'vehinh', ban: 2, mode: S.mode, sc: SC(), view: D().view, kieu: K(), luoi: D().luoi, truc: D().truc }; }
  function napBai(d) {
    if (!d || d.phanMem !== 'vehinh' || (d.mode !== '2d' && d.mode !== '3d') || !d.sc || !d.sc.objs) throw new Error('sai dinh dang');
    if (BUOC) thoatBuoc();
    S.mode = d.mode; ghiLS(); D().sc = d.sc; if (d.view) D().view = d.view; if (d.kieu) D().kieu = d.kieu;
    if (d.luoi != null) D().luoi = d.luoi; if (d.truc != null) D().truc = d.truc;
    boChon(); picks = []; vongXong = false; datCheDo(); luuLS();
  }
  window.VE_HINH = { _kt: { cam: function () { lapCam(); lapChe(); return CAM; }, biKhuat: function (p) { return biKhuat(p); }, val: function () { tinhHet(); return VAL; } }, xuat: xuatBai, nap: napBai, bao: function (t, tin) { thongBao(t, tin); }, proj: function (x, y, z) { lapCam(); return CAM.proj(P3(x, y, z)); }, mh: function (ten) { var o = SC().objs.filter(function (x) { return x.ten === ten; })[0]; if (!o) return null; if (S.mode === '2d') return toMH(VAL[o.id]); lapCam(); return CAM.proj(VAL[o.id]); }, S: S, VAL: function () { return VAL; }, dungMau: dungMau, nets: netsHet, biKhuat: function (p) { lapCam(); lapChe(); return biKhuat(p); } };
})();
