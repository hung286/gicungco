/* ỨNG DỤNG HÌNH HỌC CỦA TÍCH PHÂN (Toán 12): diện tích hình phẳng · thể tích khối tròn xoay · thể tích theo thiết diện S(x).
   Mặt phẳng: đường cong, miền tô theo từng mảnh S1, S2… (chia tại giao điểm), cận a, b kéo được, tổng Riemann, lát cắt x₀.
   Khối 3D: quay dần quanh Ox (0° → 360°), chia lát đĩa / vành khăn, khối có thiết diện vuông, tam giác, nửa tròn…; lời giải từng bước. */
(function () {
  'use strict';
  // ------------------------------------------------------------------ biên dịch biểu thức một biến x (an toàn, không dùng eval)
  var TEN = ['sqrt', 'sin', 'cos', 'tan', 'cot', 'abs', 'exp', 'log', 'ln', 'pi', 'e', 'x'];
  var HAM = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: function (u) { return 1 / Math.tan(u); }, abs: Math.abs, exp: Math.exp, log: function (u) { return Math.log(u) / Math.LN10; }, ln: Math.log };
  function bienDich(nguon) {
    var s = String(nguon || '').toLowerCase().replace(/^\s*y\s*=\s*/, '').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/,/g, '.').replace(/[×·]/g, '*').replace(/[−–]/g, '-').replace(/²/g, '^2').replace(/³/g, '^3').replace(/:/g, '/');
    var tk = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (m) { tk.push({ l: 'so', v: parseFloat(m[1]) }); i += m[1].length; continue; }
      if ('+-*/^()|'.indexOf(c) >= 0) { tk.push({ l: c }); i++; continue; }
      var t = null; for (var k = 0; k < TEN.length; k++) if (s.substr(i, TEN[k].length) === TEN[k]) { t = TEN[k]; break; }
      if (!t) throw new Error('Chưa hiểu kí tự "' + s.slice(i, i + 4) + '". Dùng x, số, + − * / ^, sqrt, sin, cos, tan, ln, e, pi, |…|.');
      tk.push({ l: 'ten', v: t }); i += t.length;
    }
    var p = 0, sauAbs = 0;
    var xem = function () { return tk[p]; };
    var la = function (l) { return tk[p] && tk[p].l === l; };
    var hs = function (v) { return function () { return v; }; };
    var phep = function (a, b, o) { return o === '+' ? function (x) { return a(x) + b(x); } : o === '-' ? function (x) { return a(x) - b(x); } : o === '*' ? function (x) { return a(x) * b(x); } : function (x) { return a(x) / b(x); }; };
    var am = function (a) { return function (x) { return -a(x); }; };
    var mu = function (a, b) { return function (x) { var u = a(x), v = b(x); if (u < 0 && Math.abs(v - Math.round(v)) > 1e-12) { var q = 1 / v, qn = Math.round(q); if (Math.abs(q - qn) < 1e-9 && qn % 2) return -Math.pow(-u, v); } return Math.pow(u, v); }; };
    var ap = function (f, a) { return function (x) { return f(a(x)); }; };
    function tong() { var f = tich(); while (la('+') || la('-')) { var o = tk[p++].l; f = phep(f, tich(), o); } return f; }
    function batDauNhan() { var t = xem(); return t && (t.l === 'so' || t.l === 'ten' || t.l === '(' || (t.l === '|' && !sauAbs)); }
    function tich() { var f = dau(); for (;;) { if (la('*') || la('/')) { var o = tk[p++].l; f = phep(f, dau(), o); } else if (batDauNhan()) f = phep(f, luy(), '*'); else return f; } }
    function dau() { if (la('-')) { p++; return am(dau()); } if (la('+')) { p++; return dau(); } return luy(); }
    function luy() { var b = nguyenTo(); if (la('^')) { p++; return mu(b, dau()); } return b; }
    function nguyenTo() {
      var t = xem(); if (!t) throw new Error('Biểu thức còn thiếu ở cuối.');
      p++;
      if (t.l === 'so') return hs(t.v);
      if (t.l === '(') { var f = tong(); if (!la(')')) throw new Error('Thiếu dấu ")".'); p++; return f; }
      if (t.l === '|') { var g0 = sauAbs; sauAbs = 1; var g = tong(); sauAbs = g0; if (!la('|')) throw new Error('Thiếu dấu "|" đóng.'); p++; return ap(Math.abs, g); }
      if (t.l === 'ten') {
        if (t.v === 'x') return function (x) { return x; };
        if (t.v === 'pi') return hs(Math.PI);
        if (t.v === 'e') return hs(Math.E);
        var h = HAM[t.v], doi = la('(') ? nguyenTo() : luy();
        return ap(h, doi);
      }
      throw new Error('Chỗ "' + (t.l === 'so' ? t.v : t.l) + '" chưa đúng.');
    }
    if (!tk.length) throw new Error('Chưa nhập biểu thức.');
    var kq = tong();
    if (p < tk.length) throw new Error('Có chỗ chưa đúng gần "' + (tk[p].v != null ? tk[p].v : tk[p].l) + '".');
    var thu = [0.3, 1.7, -2.2, 3.1].map(function (x) { return kq(x); });
    if (!thu.some(isFinite)) throw new Error('Biểu thức không xác định ở các điểm thử.');
    return kq;
  }
  function docSo(s) { var f = bienDich(s), v = f(0); if (!isFinite(v)) throw new Error('Cận "' + s + '" chưa phải là số.'); return v; }
  function dep(s) {   // x^2 -> x², sqrt -> √, * -> ·
    return String(s || '').replace(/^\s*y\s*=\s*/i, '').replace(/\s+/g, ' ').trim().replace(/\*/g, '·').replace(/sqrt/g, '√').replace(/pi/g, 'π').replace(/-/g, '−')
      .replace(/\^\(?(−?\d+)\)?/g, function (m0, d) { return d.split('').map(function (c) { return { '−': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }[c]; }).join(''); })
      .replace(/\^x/g, 'ˣ').replace(/√\(([a-z0-9.]+)\)/g, '√$1').replace(/\b(sin|cos|tan|cot|ln|log)\(([a-z0-9.]+)\)/g, '$1 $2');
  }

  // ------------------------------------------------------------------ số học
  function simpson(f, a, b) {   // Simpson thích nghi
    var S = function (a, b, fa, fm, fb) { return (b - a) / 6 * (fa + 4 * fm + fb); };
    var lap = function (a, b, fa, fm, fb, toan, eps, sau) {
      var m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2, flm = f(lm), frm = f(rm);
      var trai = S(a, m, fa, flm, fm), phai = S(m, b, fm, frm, fb), d = trai + phai - toan;
      if (sau <= 0 || Math.abs(d) <= 15 * eps) return trai + phai + d / 15;
      return lap(a, m, fa, flm, fm, trai, eps / 2, sau - 1) + lap(m, b, fm, frm, fb, phai, eps / 2, sau - 1);
    };
    if (!(b > a)) return 0;
    var n = 16, h = (b - a) / n, tong = 0;
    for (var i = 0; i < n; i++) { var x0 = a + i * h, x1 = x0 + h, f0 = an(f, x0), f1 = an(f, x1), fm = an(f, (x0 + x1) / 2); tong += lap(x0, x1, f0, fm, f1, S(x0, x1, f0, fm, f1), 1e-11, 18); }
    return tong;
    function an(f, x) { var v = f(x); return isFinite(v) ? v : 0; }
  }
  function nghiem(h, a, b) {   // các nghiệm của h trên (a, b)
    var N = 1600, kq = [], x0 = a, h0 = h(a), d = (b - a) / N;
    for (var i = 1; i <= N; i++) {
      var x1 = a + i * d, h1 = h(x1);
      if (isFinite(h0) && isFinite(h1)) {
        if (h1 === 0) { if (i < N) kq.push(x1); }
        else if (h0 !== 0 && (h0 < 0) !== (h1 < 0)) {
          var l = x0, r = x1, hl = h0;
          for (var k = 0; k < 70; k++) { var m = (l + r) / 2, hm = h(m); if (!isFinite(hm)) break; if ((hm < 0) === (hl < 0)) { l = m; hl = hm; } else r = m; }
          var xm = (l + r) / 2; if (Math.abs(h(xm)) < 1e-6 * (1 + Math.abs(h0) + Math.abs(h1))) kq.push(xm);   // bỏ chỗ nhảy (tiệm cận)
        }
      }
      x0 = x1; h0 = h1;
    }
    return kq.filter(function (x, i) { return x > a + 1e-9 && x < b - 1e-9 && (!i || x - kq[i - 1] > 1e-7); });
  }
  function soDep(v, k) { if (!isFinite(v)) return '—'; var m = Math.pow(10, k == null ? 4 : k), r = Math.round(v * m) / m; if (Object.is(r, -0)) r = 0; return String(r).replace('.', ','); }
  function phanSo(v) {   // giá trị đúng: p/q, pπ/q, pπ²/q, a + b·e (nếu nhận ra), ngược lại null
    var thu = function (w, Q) { for (var q = 1; q <= (Q || 240); q++) { var p = Math.round(w * q); if (Math.abs(w - p / q) < 2e-9 * Math.max(1, Math.abs(w))) return [p, q]; } return null; };
    var phan = function (r, ki) { var p = r[0], q = r[1], dau = p < 0 ? '−' : '', a = Math.abs(p); if (!ki) return dau + a + (q > 1 ? '/' + q : ''); return dau + (a === 1 ? '' : a) + ki + (q > 1 ? '/' + q : ''); };
    var r = thu(v); if (r) return phan(r);
    r = thu(v / Math.PI); if (r && r[0]) return phan(r, 'π');
    r = thu(v / (Math.PI * Math.PI), 60); if (r && r[0]) return phan(r, 'π²');
    for (var cn = 2; cn <= 3; cn++) { r = thu(v / Math.sqrt(cn), 240); if (r && r[0]) return phan(r, '√' + cn); }
    for (var b = -4; b <= 4; b++) { if (!b) continue; r = thu(v - b * Math.E, 12); if (r) { var be = (b === 1 ? '' : b === -1 ? '−' : b) + 'e'; return r[0] ? be + (r[0] < 0 ? ' − ' : ' + ') + phan([Math.abs(r[0]), r[1]]) : be; } }
    return null;
  }
  function giaTri(v) { var p = phanSo(v); return p ? p + (/^−?\d+$/.test(p) ? '' : ' ≈ ' + soDep(v)) : '≈ ' + soDep(v); }
  function veMay(p) { return p.replace(/−/g, '-').replace(/π/g, 'pi').replace(/²/g, '^2'); }
  function tp(a, b, than) { return '<span class="tp-int"><span class="tp-dau">∫</span><span class="tp-gh"><sup>' + a + '</sup><sub>' + b + '</sub></span></span>' + than; }   // tích phân có cận

  // ------------------------------------------------------------------ dữ liệu
  var MAU_DUONG = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];
  var MAU_MANH = ['rgba(16,185,129,.38)', 'rgba(168,85,247,.32)', 'rgba(249,115,22,.32)', 'rgba(14,165,233,.32)', 'rgba(236,72,153,.3)'];
  var THU_VIEN = [['x^2', 'x²'], ['x^3', 'x³'], ['sqrt(x)', '√x'], ['|x|', '|x|'], ['1/x', '1/x'], ['sin(x)', 'sin x'], ['cos(x)', 'cos x'], ['e^x', 'eˣ'], ['ln(x)', 'ln x'], ['x', 'x'], ['2', 'y = c'], ['sqrt(4-x^2)', '√(4−x²)']];
  var MAU = {
    dt: [['x^2', 'x', '0', '1', 'y = x², y = x'], ['x^2-2x', '', '0', '2', 'y = x² − 2x và Ox'], ['x^3-x', '', '-1', '1', 'y = x³ − x và Ox (2 mảnh)'], ['sin(x)', '', '0', '2pi', 'y = sin x trên [0; 2π]'], ['sqrt(x)', 'x-2', '0', '4', 'y = √x, y = x − 2'], ['e^x', '1', '0', '1', 'y = eˣ, y = 1']],
    vt: [['sqrt(x)', '', '0', '4', 'y = √x quanh Ox'], ['sqrt(4-x^2)', '', '-2', '2', 'Khối cầu bán kính 2'], ['x', '', '0', '3', 'Khối nón (y = x)'], ['2', '', '0', '3', 'Khối trụ (y = 2)'], ['x', 'x^2', '0', '1', 'Vành khăn: y = x, y = x²'], ['sin(x)', '', '0', 'pi', 'y = sin x trên [0; π]']],
    tl: [['x', 'x^2', '0', '1', 'Đáy giữa y = x và y = x²'], ['sqrt(x)', '', '0', '4', 'Đáy dưới y = √x'], ['sqrt(4-x^2)', '-sqrt(4-x^2)', '-2', '2', 'Đáy là hình tròn bán kính 2'], ['1-x', '', '0', '1', 'Đáy tam giác vuông']]
  };
  var THIET_DIEN = [
    { id: 'vuong', ten: 'Hình vuông', k: function () { return 1; }, ct: 'S(x) = w²(x)' },
    { id: 'cn', ten: 'Chữ nhật (cao t·w)', k: function (t) { return t; }, ct: 'S(x) = t·w²(x)' },
    { id: 'nuatron', ten: 'Nửa hình tròn', k: function () { return Math.PI / 8; }, ct: 'S(x) = π·w²(x)/8' },
    { id: 'tron', ten: 'Hình tròn', k: function () { return Math.PI / 4; }, ct: 'S(x) = π·w²(x)/4' },
    { id: 'tgdeu', ten: 'Tam giác đều', k: function () { return Math.sqrt(3) / 4; }, ct: 'S(x) = (√3/4)·w²(x)' },
    { id: 'vcgoc', ten: 'Vuông cân (góc vuông w)', k: function () { return 0.5; }, ct: 'S(x) = w²(x)/2' },
    { id: 'vchuyen', ten: 'Vuông cân (huyền w)', k: function () { return 0.25; }, ct: 'S(x) = w²(x)/4' }
  ];
  var T = {
    loai: 'dt', duong: [], a: 0, b: 1, aCh: '0', bCh: '1', tat: {},
    riemann: false, nR: 10, kieuR: 'giua', goc: 360, diaN: 12, dia: false, x0: null,
    td: 'vuong', t: 1, nLat: 14, lien: true,
    xem: 'ca', v2: { cx: 0.5, cy: 0.5, s: 120 }, cam: { yaw: -0.6, pitch: 0.38, zoom: 1, ox: 0, oy: 0 }, phoiCanh: true, nen: 'macdinh', tuXoay: false,
    loi: ''
  };
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var $$ = function (s, g) { return [].slice.call((g || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ------------------------------------------------------------------ tính toán miền
  function dsBat() { return T.duong.filter(function (d) { return d.bat && d.f; }); }
  function capHam() {   // f (trên/đường 1), g (đường 2 hoặc Ox)
    var ds = dsBat(); if (!ds.length) return null;
    return { f: ds[0].f, g: ds[1] ? ds[1].f : function () { return 0; }, mot: !ds[1], d1: ds[0], d2: ds[1] || null };
  }
  function tinh() {
    var c = capHam(); T.kq = null; if (!c || !(T.b > T.a)) return;
    var h = function (x) { return c.f(x) - c.g(x); }, a = T.a, b = T.b;
    var ng = nghiem(h, a, b), moc = [a].concat(ng, [b]), manh = [];
    for (var i = 0; i + 1 < moc.length; i++) {
      var I = simpson(h, moc[i], moc[i + 1]);
      manh.push({ a: moc[i], b: moc[i + 1], I: I, S: Math.abs(I), bat: !T.tat[i] });
    }
    var S = manh.reduce(function (s, m) { return s + (m.bat ? m.S : 0); }, 0);
    // khối tròn xoay: bán kính lớn R(x), nhỏ r(x)
    var Rr = function (x) { var u = c.f(x), v = c.g(x), lo = Math.min(u, v), hi = Math.max(u, v); if (!isFinite(lo) || !isFinite(hi)) return [0, 0]; if (lo >= 0) return [hi, lo]; if (hi <= 0) return [-lo, -hi]; return [Math.max(hi, -lo), 0]; };
    var V = Math.PI * simpson(function (x) { var q = Rr(x); return q[0] * q[0] - q[1] * q[1]; }, a, b);
    var catTruc = false;   // hai đường nằm khác phía trục Ox ở đâu đó → công thức π∫|f² − g²| không còn đúng
    if (!c.mot) for (var j = 0; j <= 400 && !catTruc; j++) { var xj = a + (b - a) * j / 400; if (c.f(xj) * c.g(xj) < -1e-12) catTruc = true; }
    var td = THIET_DIEN.filter(function (q) { return q.id === T.td; })[0], k = td.k(T.t);
    var Vtd = k * simpson(function (x) { var w = h(x); return w * w; }, a, b);
    T.kq = { c: c, h: h, ng: ng, manh: manh, S: S, Rr: Rr, V: V, catTruc: catTruc, td: td, k: k, Vtd: Vtd };
  }

  // ------------------------------------------------------------------ giao diện
  var hop, cv2, cv3, g2, g3, W2 = 0, H2 = 0, W3 = 0, H3 = 0, dpr = 1;
  function taoGiaoDien() {
    hop = document.createElement('section'); hop.id = 'tp'; hop.className = 'an'; hop.setAttribute('aria-label', 'Ứng dụng hình học của tích phân');
    hop.innerHTML =
      '<div class="tp-trai">' +
        '<div class="tp-the"><h4>Bài toán</h4><div class="tp-loai">' +
          '<button type="button" data-loai="dt">📐 Diện tích hình phẳng</button><button type="button" data-loai="vt">🧊 Thể tích khối tròn xoay</button><button type="button" data-loai="tl">🍞 Cắt lát S(x)</button></div>' +
          '<p class="tp-mo"></p><div class="tp-tdien"></div></div>' +
        '<div class="tp-the"><h4>Các đường giới hạn</h4><div class="tp-ds"></div>' +
          '<div class="tp-hang-nut"><button type="button" data-l="them">＋ Thêm đường</button></div>' +
          '<p class="tp-nho">Thư viện — bấm để thêm (hoặc thay đường đang chọn):</p><div class="tp-tv">' + THU_VIEN.map(function (q) { return '<button type="button" data-tv="' + esc(q[0]) + '">' + esc(q[1]) + '</button>'; }).join('') + '</div>' +
          '<p class="tp-nho">Mẫu nhanh:</p><div class="tp-mau"></div></div>' +
        '<div class="tp-the"><h4>Cận tích phân</h4><div class="tp-can"><label>a =<input data-can="a" inputmode="decimal" autocomplete="off"></label><label>b =<input data-can="b" inputmode="decimal" autocomplete="off"></label></div>' +
          '<div class="tp-hang-nut"><button type="button" data-l="giao">⇔ Lấy giao điểm làm cận</button></div><p class="tp-nho">Gõ được 2, -1, 1/2, pi, pi/2, sqrt(3)… hoặc <b>kéo mốc vàng a, b</b> trên hình.</p></div>' +
        '<div class="tp-the tp-hien"></div>' +
        '<div class="tp-the tp-giai"><h4>Lời giải</h4><div class="tp-buoc"></div></div>' +
      '</div>' +
      '<div class="tp-phai">' +
        '<div class="tp-dk"><div class="tp-xem"><button type="button" data-xem="ca">Cả hai</button><button type="button" data-xem="2d">Mặt phẳng</button><button type="button" data-xem="3d">Khối 3D</button></div>' +
          '<button type="button" data-l="vua" title="Vừa khung">⤢<span class="tp-chu"> Vừa khung</span></button><button type="button" data-l="png" title="Lưu ảnh PNG">🖼<span class="tp-chu"> Lưu ảnh</span></button><button type="button" data-l="toan" title="Toàn màn hình">⛶<span class="tp-chu"> Toàn màn hình</span></button></div>' +
        '<div class="tp-dk tp-dk3"><div class="tp-goc">' + [['truoc', 'Trước'], ['sau', 'Sau'], ['trai', 'Trái'], ['phai', 'Phải'], ['tren', 'Trên'], ['duoi', 'Dưới'], ['cheo', 'Chéo']].map(function (g) { return '<button type="button" data-g="' + g[0] + '">' + g[1] + '</button>'; }).join('') + '</div>' +
          '<select data-s="pc" aria-label="Phép chiếu"><option value="1">Phối cảnh</option><option value="0">Song song</option></select>' +
          '<select data-s="nen" aria-label="Nền"><option value="macdinh">Nền: mặc định</option><option value="trang">Nền: trắng</option><option value="toi">Nền: tối</option></select>' +
          '<label class="tp-chk"><input type="checkbox" data-s="xoay"> Tự xoay</label></div>' +
        '<div class="tp-san">' +
          '<div class="tp-o2"><canvas></canvas><div class="tp-ct"></div><div class="tp-goi">Kéo <b>mốc vàng a, b</b> · kéo <b>mốc xanh x₀</b> (lát cắt) · bấm vào mảnh để bật/tắt · kéo nền để di chuyển · lăn chuột / chụm 2 ngón để phóng to</div></div>' +
          '<div class="tp-o3"><canvas></canvas><div class="tp-ct3"></div><div class="tp-goi">Kéo để xoay · lăn chuột / chụm 2 ngón để phóng to · chuột phải hoặc 2 ngón kéo để dời</div></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(hop);
    cv2 = $('.tp-o2 canvas', hop); cv3 = $('.tp-o3 canvas', hop); g2 = cv2.getContext('2d'); g3 = cv3.getContext('2d');
    hop.addEventListener('click', bam);
    hop.addEventListener('change', doi);
    hop.addEventListener('input', nhapLien);
    ganCham2(); ganCham3();
    new ResizeObserver(function () { coGian(); }).observe($('.tp-san', hop));
  }
  function datMau(m) {
    T.duong = [m[0], m[1]].filter(function (x) { return x !== ''; }).map(function (x, i) { return { bt: x, bat: true, mau: MAU_DUONG[i] }; });
    T.duong.forEach(bienDichDuong);
    T.aCh = m[2]; T.bCh = m[3]; T.tat = {}; T.x0 = null;
    try { T.a = docSo(m[2]); T.b = docSo(m[3]); } catch (e) { }
  }
  function bienDichDuong(d) { try { d.f = bienDich(d.bt); d.loi = ''; } catch (e) { d.f = null; d.loi = e.message; } }
  function veTrai() {
    $$('.tp-loai button', hop).forEach(function (b) { b.classList.toggle('on', b.dataset.loai === T.loai); });
    $('.tp-mo', hop).innerHTML = { dt: 'Diện tích hình phẳng giới hạn bởi các đường y = f(x), y = g(x) (hoặc trục Ox) và hai đường thẳng x = a, x = b.', vt: 'Quay hình phẳng giới hạn bởi các đường quanh <b>trục Ox</b> → khối tròn xoay. Kéo thanh <b>Góc quay</b> để thấy khối hình thành.', tl: 'Vật thể có đáy là hình phẳng; cắt bởi mặt phẳng vuông góc với Ox tại x được <b>thiết diện</b> dựng trên đoạn nối hai đường (độ dài w(x)).' }[T.loai];
    $('.tp-tdien', hop).innerHTML = T.loai !== 'tl' ? '' : '<div class="tp-chip">' + THIET_DIEN.map(function (q) { return '<button type="button" data-td="' + q.id + '" class="' + (q.id === T.td ? 'on' : '') + '">' + esc(q.ten) + '</button>'; }).join('') + '</div>' +
      (T.td === 'cn' ? '<label class="tp-o">Tỉ lệ t (chiều cao = t·w)<input data-tt inputmode="decimal" value="' + T.t + '"></label>' : '');
    veDuong();
    $('.tp-mau', hop).innerHTML = MAU[T.loai].map(function (m, i) { return '<button type="button" data-mau="' + i + '">' + esc(m[4]) + '</button>'; }).join('');
    $('[data-can="a"]', hop).value = T.aCh; $('[data-can="b"]', hop).value = T.bCh;
    var h = '<h4>Hiển thị</h4>';
    if (T.loai === 'dt') h += '<label class="tp-chk"><input type="checkbox" data-o="riemann"' + (T.riemann ? ' checked' : '') + '> Hình chữ nhật xấp xỉ (tổng Riemann)</label>' +
      '<div class="tp-tt' + (T.riemann ? '' : ' an') + '"><label>Số hình chữ nhật n = <b data-hien="nR">' + T.nR + '</b><input type="range" min="1" max="200" value="' + T.nR + '" data-r="nR"></label>' +
      '<div class="tp-chip">' + [['trai', 'Đầu trái'], ['giua', 'Điểm giữa'], ['phai', 'Đầu phải']].map(function (q) { return '<button type="button" data-kr="' + q[0] + '" class="' + (T.kieuR === q[0] ? 'on' : '') + '">' + q[1] + '</button>'; }).join('') + '</div></div>';
    if (T.loai === 'vt') h += '<label>Góc quay quanh Ox: <b data-hien="goc">' + T.goc + '°</b><input type="range" min="0" max="360" value="' + T.goc + '" data-r="goc"></label>' +
      '<div class="tp-hang-nut"><button type="button" data-l="quay" class="chinh">▶ Quay từ 0° đến 360°</button></div>' +
      '<label class="tp-chk"><input type="checkbox" data-o="dia"' + (T.dia ? ' checked' : '') + '> Chia thành các đĩa (vành khăn) mỏng</label>' +
      '<div class="tp-tt' + (T.dia ? '' : ' an') + '"><label>Số đĩa n = <b data-hien="diaN">' + T.diaN + '</b><input type="range" min="2" max="80" value="' + T.diaN + '" data-r="diaN"></label></div>';
    if (T.loai === 'tl') h += '<label>Số lát cắt hiển thị: <b data-hien="nLat">' + T.nLat + '</b><input type="range" min="2" max="60" value="' + T.nLat + '" data-r="nLat"></label>' +
      '<label class="tp-chk"><input type="checkbox" data-o="lien"' + (T.lien ? ' checked' : '') + '> Vẽ khối liền (bỏ chọn: chỉ các lát)</label>';
    if (T.loai !== 'dt') h += '<label>Lát cắt tại x₀ = <b data-hien="x0">' + soDep(x0(), 3) + '</b><input type="range" min="0" max="1000" value="' + Math.round((x0() - T.a) / ((T.b - T.a) || 1) * 1000) + '" data-r="x0"></label>';
    $('.tp-hien', hop).innerHTML = h;
    $$('.tp-xem button', hop).forEach(function (b) { b.classList.toggle('on', b.dataset.xem === xemThat()); b.disabled = T.loai === 'dt' && b.dataset.xem !== '2d'; });
    $('.tp-dk3', hop).classList.toggle('an', xemThat() === '2d');
  }
  function veDuong() {
    $('.tp-ds', hop).innerHTML = T.duong.map(function (d, i) {
      return '<div class="tp-dg' + (d.loi ? ' loi' : '') + '"><input type="checkbox" data-bat="' + i + '"' + (d.bat ? ' checked' : '') + ' title="Dùng đường này"><i style="background:' + d.mau + '"></i><span>y =</span><input class="tp-bt" data-bt="' + i + '" value="' + esc(d.bt) + '" placeholder="VD: x^2 - 2x" autocomplete="off" spellcheck="false"><button type="button" data-xoa="' + i + '" title="Xoá đường">✕</button></div>' + (d.loi ? '<p class="tp-loi">⚠ ' + esc(d.loi) + '</p>' : '');
    }).join('') + (dsBat().length > 2 ? '<p class="tp-nho">ℹ Đang dùng 2 đường được chọn đầu tiên để giới hạn miền.</p>' : '') + (dsBat().length === 1 ? '<p class="tp-nho">ℹ Một đường: miền giới hạn bởi đường đó và trục Ox.</p>' : '');
  }
  function xemThat() { return T.loai === 'dt' ? '2d' : T.xem; }
  function x0() { if (T.x0 == null || T.x0 < T.a || T.x0 > T.b) T.x0 = T.a + (T.b - T.a) * 0.6; return T.x0; }
  function veGiai() {
    var K = T.kq, h = '';
    if (!K) { $('.tp-buoc', hop).innerHTML = '<p class="tp-nho">' + (T.loi ? '⚠ ' + esc(T.loi) : 'Nhập ít nhất một đường và hai cận a &lt; b.') + '</p>'; $('.tp-ct', hop).innerHTML = ''; $('.tp-ct3', hop).innerHTML = ''; return; }
    var c = K.c, ten1 = dep(c.d1.bt), ten2 = c.mot ? '0' : dep(c.d2.bt), A = soDep(T.a, 3), B = soDep(T.b, 3), Ach = dep(T.aCh), Bch = dep(T.bCh);
    var boc = function (t) { return /[+−]/.test(t.replace(/^−/, '')) ? '(' + t + ')' : t; };
    var hieu = c.mot ? ten1 : ten1 + ' − ' + boc(ten2);
    var ptGiao = c.mot ? ten1 + ' = 0' : ten1 + ' = ' + ten2;
    var ds = K.ng.length ? K.ng.map(function (x) { var p = phanSo(x); return 'x = ' + (p || soDep(x)); }).join('; ') : 'không có nghiệm trong khoảng (a; b)';
    var ct = '';
    if (T.loai === 'dt') {
      h += '<ol><li>Phương trình hoành độ giao điểm: <b>' + esc(ptGiao) + '</b> → ' + esc(ds) + '.</li>';
      h += '<li>' + tp(Bch, Ach, '|' + esc(hieu) + '| dx') + ' — chia đoạn [' + esc(Ach) + '; ' + esc(Bch) + '] tại các giao điểm, trên mỗi đoạn biểu thức không đổi dấu:</li></ol><div class="tp-manh">';
      K.manh.forEach(function (m, i) { h += '<div class="' + (m.bat ? '' : 'tat') + '"><i style="background:' + MAU_MANH[i % MAU_MANH.length] + '"></i>S<sub>' + (i + 1) + '</sub> = |' + tp(soDep(m.b, 3), soDep(m.a, 3), '(…) dx') + '| = ' + giaTri(m.S) + (m.I < 0 ? ' <small>(tích phân âm → lấy trị tuyệt đối)</small>' : '') + '</div>'; });
      var bat = K.manh.map(function (m, i) { return m.bat ? 'S<sub>' + (i + 1) + '</sub>' : null; }).filter(Boolean);
      h += '</div><p class="tp-kq">S = ' + (bat.length > 1 ? bat.join(' + ') + ' = ' : '') + '<b>' + giaTri(K.S) + '</b></p>';
      if (T.riemann) { var R = tongRiemann(); h += '<p class="tp-nho">Tổng diện tích ' + T.nR + ' hình chữ nhật ≈ <b>' + soDep(R) + '</b> (sai lệch ' + soDep(Math.abs(R - K.S)) + '). Tăng n → tổng dần tới S.</p>'; }
      ct = '<div>S = ' + tp(Bch, Ach, '|' + esc(hieu) + '| dx') + '</div><div class="tp-to">S ' + (phanSo(K.S) ? '= ' + phanSo(K.S) : '≈ ' + soDep(K.S)) + '</div>';
    } else if (T.loai === 'vt') {
      var tron = !K.catTruc;
      var mu2 = function (t) { return /^(x|\d+(,\d+)?)$/.test(t) ? t + '²' : '(' + t + ')²'; };
      var bieu = c.mot ? mu2(ten1) : '|' + mu2(ten1) + ' − ' + mu2(ten2) + '|';
      h += '<ol><li>Quay hình phẳng giới hạn bởi y = ' + esc(ten1) + ', ' + (c.mot ? 'trục Ox' : 'y = ' + esc(ten2)) + ', x = ' + esc(Ach) + ', x = ' + esc(Bch) + ' quanh trục Ox.</li>';
      h += '<li>Cắt khối bởi mặt phẳng vuông góc với Ox tại x: thiết diện là ' + (c.mot ? '<b>hình tròn</b> bán kính |f(x)| → S(x) = π·f²(x)' : '<b>hình vành khăn</b> (hoặc hình tròn) → S(x) = π·|f²(x) − g²(x)|') + '.</li>';
      if (!tron) h += '<li class="tp-luu">Hình phẳng nằm về hai phía trục Ox: khi quay, phần nhỏ bị phần lớn che lấp → em lấy bán kính lớn R(x) = max(|f|, |g|), bán kính nhỏ r(x) (r = 0 khi miền chứa trục).</li>';
      h += '<li>V = π' + tp(Bch, Ach, esc(tron ? bieu : '(R² − r²)') + ' dx') + '</li></ol>';
      h += '<p class="tp-kq">V = <b>' + giaTri(K.V) + '</b></p>';
      var q = K.Rr(x0()), Sx = Math.PI * (q[0] * q[0] - q[1] * q[1]);
      h += '<p class="tp-nho">Tại x₀ = ' + soDep(x0(), 3) + ': R = ' + soDep(q[0], 3) + (q[1] > 1e-9 ? ', r = ' + soDep(q[1], 3) : '') + ' → S(x₀) ≈ ' + soDep(Sx, 3) + '.</p>';
      if (T.dia) { var Vd = tongDia(); h += '<p class="tp-nho">Tổng thể tích ' + T.diaN + ' đĩa ≈ <b>' + soDep(Vd) + '</b> (sai lệch ' + soDep(Math.abs(Vd - K.V)) + '). Tăng n → tổng dần tới V.</p>'; }
      ct = '<div>V = π' + tp(Bch, Ach, esc(tron ? bieu : '(R² − r²)') + ' dx') + '</div><div class="tp-to">V ' + (phanSo(K.V) ? '= ' + phanSo(K.V) : '≈ ' + soDep(K.V)) + '</div>';
    } else {
      var wbt = c.mot ? '|' + ten1 + '|' : '|' + hieu + '|';
      h += '<ol><li>Tại x ∈ [' + esc(Ach) + '; ' + esc(Bch) + '], đoạn đáy của thiết diện dài <b>w(x) = ' + esc(wbt) + '</b>.</li>';
      h += '<li>Thiết diện là <b>' + esc(K.td.ten.toLowerCase()) + '</b>: ' + K.td.ct.replace('t·', T.td === 'cn' ? soDep(T.t, 3) + '·' : 't·') + '.</li>';
      h += '<li>V = ' + tp(Bch, Ach, 'S(x) dx') + ' = ' + (K.k === 1 ? '' : esc(phanSo(K.k) || soDep(K.k, 4)) + '·') + tp(Bch, Ach, 'w²(x) dx') + '</li></ol>';
      h += '<p class="tp-kq">V = <b>' + giaTri(K.Vtd) + '</b></p>';
      var w0 = Math.abs(K.h(x0())); h += '<p class="tp-nho">Tại x₀ = ' + soDep(x0(), 3) + ': w = ' + soDep(w0, 3) + ' → S(x₀) ≈ ' + soDep(K.k * w0 * w0, 3) + '.</p>';
      ct = '<div>V = ' + tp(Bch, Ach, 'S(x) dx') + '</div><div class="tp-to">V ' + (phanSo(K.Vtd) ? '= ' + phanSo(K.Vtd) : '≈ ' + soDep(K.Vtd)) + '</div>';
    }
    $('.tp-buoc', hop).innerHTML = h + '<p class="tp-nho">✅ Kết quả tính bằng máy (tích phân số, chính xác tới ~10 chữ số); dạng phân số chỉ hiện khi máy nhận ra đúng.</p>';
    $('.tp-ct', hop).innerHTML = ct; $('.tp-ct3', hop).innerHTML = T.loai === 'dt' ? '' : ct;
  }
  function tongRiemann() {
    var K = T.kq, n = T.nR, d = (T.b - T.a) / n, s = 0;
    for (var i = 0; i < n; i++) { var x = T.a + d * (i + (T.kieuR === 'trai' ? 0 : T.kieuR === 'phai' ? 1 : 0.5)); var v = K.h(x); if (isFinite(v)) s += Math.abs(v) * d; }
    return s;
  }
  function tongDia() { var K = T.kq, n = T.diaN, d = (T.b - T.a) / n, s = 0; for (var i = 0; i < n; i++) { var q = K.Rr(T.a + d * (i + 0.5)); s += Math.PI * (q[0] * q[0] - q[1] * q[1]) * d; } return s; }
  function capNhat(vua) {
    T.loi = '';
    try { T.a = docSo(T.aCh); T.b = docSo(T.bCh); if (!(T.b > T.a)) T.loi = 'Cần a < b.'; } catch (e) { T.loi = e.message; }
    if (!T.loi) tinh(); else T.kq = null;
    veGiai();
    if (vua) vuaKhung();
    ve2(); ve3();
  }
  function veLai() { veTrai(); coGian(); capNhat(true); }

  function bam(e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.loai) { T.loai = b.dataset.loai; datMau(MAU[T.loai][0]); if (T.loai !== 'dt' && T.xem === '2d') T.xem = 'ca'; datLaiCam(); veLai(); return; }
    if (b.dataset.mau) { datMau(MAU[T.loai][+b.dataset.mau]); datLaiCam(); veTrai(); capNhat(true); return; }
    if (b.dataset.td) { T.td = b.dataset.td; veTrai(); capNhat(false); return; }
    if (b.dataset.kr) { T.kieuR = b.dataset.kr; veTrai(); capNhat(false); return; }
    if (b.dataset.xoa != null) { T.duong.splice(+b.dataset.xoa, 1); T.tat = {}; veDuong(); capNhat(false); return; }
    if (b.dataset.tv) {
      var o = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.bt != null ? +document.activeElement.dataset.bt : -1;
      var trong = T.duong.findIndex(function (d) { return !d.bt.trim(); });
      if (o < 0) o = trong;
      if (o < 0 && T.duong.length >= 2) o = T.duong.length - 1;
      if (o < 0) { T.duong.push({ bt: '', bat: true, mau: mauMoi() }); o = T.duong.length - 1; }
      T.duong[o].bt = b.dataset.tv; bienDichDuong(T.duong[o]); T.tat = {}; veDuong(); capNhat(true); return;
    }
    if (b.dataset.xem) { T.xem = b.dataset.xem; veTrai(); coGian(); vuaKhung(); ve2(); return; }
    if (b.dataset.g) { var G = { truoc: [0, 0.02], sau: [Math.PI, 0.02], trai: [Math.PI / 2, 0.02], phai: [-Math.PI / 2, 0.02], tren: [0, Math.PI / 2], duoi: [0, -Math.PI / 2], cheo: [-0.6, 0.38] }[b.dataset.g]; T.cam.yaw = G[0]; T.cam.pitch = G[1]; ve3(); return; }
    var l = b.dataset.l;
    if (l === 'them') { T.duong.push({ bt: '', bat: true, mau: mauMoi() }); veDuong(); var ip = $$('.tp-bt', hop); ip[ip.length - 1].focus(); }
    else if (l === 'giao') layGiao();
    else if (l === 'vua') { vuaKhung(); datLaiCam(); ve2(); ve3(); }
    else if (l === 'quay') chayQuay();
    else if (l === 'png') taiPNG();
    else if (l === 'toan') { var el = $('.tp-phai', hop); if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); }
  }
  function mauMoi() { var dung = T.duong.map(function (d) { return d.mau; }); return MAU_DUONG.filter(function (m) { return dung.indexOf(m) < 0; })[0] || MAU_DUONG[T.duong.length % MAU_DUONG.length]; }
  function doi(e) {
    var x = e.target;
    if (x.dataset.bt != null) { var d = T.duong[+x.dataset.bt]; d.bt = x.value; bienDichDuong(d); T.tat = {}; veDuong(); capNhat(true); return; }
    if (x.dataset.bat != null) { T.duong[+x.dataset.bat].bat = x.checked; T.tat = {}; veDuong(); capNhat(true); return; }
    if (x.dataset.can) { T[x.dataset.can + 'Ch'] = x.value.trim() || '0'; T.tat = {}; capNhat(true); veTrai(); return; }
    if (x.dataset.tt != null) { var v = parseFloat(x.value.replace(',', '.')); if (v > 0) { T.t = v; capNhat(false); } return; }
    if (x.dataset.o) { T[x.dataset.o] = x.checked; veTrai(); capNhat(false); return; }
    if (x.dataset.s === 'pc') { T.phoiCanh = x.value === '1'; ve3(); return; }
    if (x.dataset.s === 'nen') { T.nen = x.value; ve3(); return; }
    if (x.dataset.s === 'xoay') { T.tuXoay = x.checked; if (T.tuXoay) vongXoay(); return; }
  }
  function nhapLien(e) {
    var x = e.target, k = x.dataset.r; if (!k) return;
    var v = +x.value;
    if (k === 'x0') T.x0 = T.a + (T.b - T.a) * v / 1000; else T[k] = v;
    var hien = $('[data-hien="' + k + '"]', hop); if (hien) hien.textContent = k === 'goc' ? v + '°' : k === 'x0' ? soDep(T.x0, 3) : v;
    if (k === 'goc') dungQuay();
    veGiai(); ve2(); ve3();
  }
  function layGiao() {
    var c = capHam(); if (!c) return;
    var h = function (x) { return c.f(x) - c.g(x); };
    var ng = nghiem(h, -12, 12); if (Math.abs(h(-12)) < 1e-12) ng.unshift(-12);
    if (ng.length < 2) { thongBao(ng.length ? 'Chỉ có một giao điểm x = ' + soDep(ng[0], 3) + ' trong [−12; 12] — sếp nhập thêm cận còn lại.' : 'Không tìm thấy giao điểm trong [−12; 12].'); return; }
    // hai giao điểm gần nhau nhất quanh cận hiện tại
    var tot = [ng[0], ng[1]], g = (T.a + T.b) / 2;
    for (var i = 0; i + 1 < ng.length; i++) if (ng[i] <= g && ng[i + 1] >= g) tot = [ng[i], ng[i + 1]];
    T.aCh = phanSo(tot[0]) ? veMay(phanSo(tot[0])) : soDep(tot[0], 6).replace(',', '.');
    T.bCh = phanSo(tot[1]) ? veMay(phanSo(tot[1])) : soDep(tot[1], 6).replace(',', '.');
    T.tat = {}; veTrai(); capNhat(true);
  }
  function thongBao(t) { var p = $('.tp-buoc', hop); var d = document.createElement('p'); d.className = 'tp-loi'; d.textContent = '⚠ ' + t; p.prepend(d); setTimeout(function () { d.remove(); }, 5000); }
  var quayId = 0;
  function dungQuay() { if (quayId) { cancelAnimationFrame(quayId); quayId = 0; } }
  function chayQuay() {
    dungQuay(); var t0 = performance.now(); T.goc = 0;
    var b = function (now) {
      var k = Math.min(1, (now - t0) / 3200); T.goc = Math.round(360 * k);
      var r = $('[data-r="goc"]', hop); if (r) r.value = T.goc; var hh = $('[data-hien="goc"]', hop); if (hh) hh.textContent = T.goc + '°';
      ve3(); quayId = k < 1 ? requestAnimationFrame(b) : 0;
    };
    quayId = requestAnimationFrame(b);
  }
  var xoayId = 0;
  function vongXoay() { cancelAnimationFrame(xoayId); var truoc = performance.now(); var b = function (now) { if (!T.tuXoay || !dangMo) return; T.cam.yaw += (now - truoc) * 0.0004; truoc = now; ve3(); xoayId = requestAnimationFrame(b); }; xoayId = requestAnimationFrame(b); }

  // ------------------------------------------------------------------ mặt phẳng toạ độ
  function vuaKhung() {
    if (!W2) return;
    var a = T.a, b = T.b; if (!(b > a)) { a = -3; b = 3; }
    var x0_ = a - (b - a) * 0.25 - 0.5, x1 = b + (b - a) * 0.25 + 0.5, lo = 0, hi = 0;
    dsBat().forEach(function (d) { for (var i = 0; i <= 200; i++) { var x = a + (b - a) * i / 200, y = d.f(x); if (isFinite(y) && Math.abs(y) < 1e4) { lo = Math.min(lo, y); hi = Math.max(hi, y); } } });
    if (T.loai === 'vt') { var m = Math.max(Math.abs(lo), Math.abs(hi)); lo = -m; hi = m; }
    var pad = (hi - lo) * 0.18 + 0.6; lo -= pad; hi += pad;
    var s = Math.min(W2 / (x1 - x0_), (H2 - 30) / (hi - lo));
    T.v2 = { cx: (x0_ + x1) / 2, cy: (lo + hi) / 2, s: Math.max(4, Math.min(600, s)) };
  }
  var X = function (x) { return W2 / 2 + (x - T.v2.cx) * T.v2.s; }, Y = function (y) { return H2 / 2 - (y - T.v2.cy) * T.v2.s; };
  var Xi = function (px) { return T.v2.cx + (px - W2 / 2) / T.v2.s; }, Yi = function (py) { return T.v2.cy - (py - H2 / 2) / T.v2.s; };
  function ve2() {
    if (!g2 || !W2) return;
    var g = g2; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W2, H2);
    // lưới, trục
    var st = (function () { var muc = 55 / T.v2.s, p = Math.pow(10, Math.floor(Math.log10(muc))), q = muc / p; return (q <= 1 ? 1 : q <= 2 ? 2 : q <= 5 ? 5 : 10) * p; })();
    var xa = Xi(0), xb = Xi(W2), yb = Yi(H2), ya = Yi(0);
    g.lineWidth = 1; g.strokeStyle = '#eef0f6'; g.beginPath();
    for (var x = Math.ceil(xa / st) * st; x <= xb; x += st) { g.moveTo(Math.round(X(x)) + 0.5, 0); g.lineTo(Math.round(X(x)) + 0.5, H2); }
    for (var y = Math.ceil(yb / st) * st; y <= ya; y += st) { g.moveTo(0, Math.round(Y(y)) + 0.5); g.lineTo(W2, Math.round(Y(y)) + 0.5); }
    g.stroke();
    var ox = Math.min(W2 - 1, Math.max(0, X(0))), oy = Math.min(H2 - 1, Math.max(0, Y(0)));
    g.strokeStyle = T.loai === 'vt' ? '#ea580c' : '#94a3b8'; g.lineWidth = T.loai === 'vt' ? 2.2 : 1.3; g.beginPath(); g.moveTo(0, oy); g.lineTo(W2, oy); g.stroke();
    g.strokeStyle = '#94a3b8'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(ox, 0); g.lineTo(ox, H2); g.stroke();
    g.fillStyle = '#64748b'; g.font = '12px system-ui, Segoe UI, Arial'; g.textAlign = 'center'; g.textBaseline = 'top';
    for (x = Math.ceil(xa / st) * st; x <= xb; x += st) if (Math.abs(x) > st / 2) g.fillText(soDep(x, 3), X(x), Math.min(H2 - 16, oy + 4));
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (y = Math.ceil(yb / st) * st; y <= ya; y += st) if (Math.abs(y) > st / 2) g.fillText(soDep(y, 3), Math.max(26, ox - 5), Y(y));
    g.textAlign = 'left'; g.font = 'italic 600 14px Georgia, serif'; g.fillStyle = '#475569'; g.fillText('x', W2 - 14, oy - 10); g.fillText('y', ox + 6, 10); g.fillText('O', ox + 4, oy + 10);
    if (T.loai === 'vt') { g.fillStyle = '#ea580c'; g.font = '700 12.5px system-ui'; g.fillText('↻ trục quay Ox', 10, oy - 12); }
    var K = T.kq;
    // miền
    if (K) {
      var c = K.c;
      K.manh.forEach(function (m, i) {
        var n = 160, tren = [], duoi = [];
        for (var k = 0; k <= n; k++) { var xx = m.a + (m.b - m.a) * k / n, u = c.f(xx), v = c.g(xx); if (!isFinite(u) || !isFinite(v)) continue; tren.push([X(xx), Y(u)]); duoi.push([X(xx), Y(v)]); }
        if (tren.length < 2) return;
        g.beginPath(); tren.forEach(function (p, k) { if (k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); duoi.reverse().forEach(function (p) { g.lineTo(p[0], p[1]); }); g.closePath();
        g.fillStyle = m.bat ? MAU_MANH[i % MAU_MANH.length] : 'rgba(148,163,184,.12)'; g.fill();
        if (T.loai === 'vt' && m.bat) {   // ảnh đối xứng qua Ox (gợi ý phần quét khi quay)
          g.save(); g.setLineDash([5, 4]); g.strokeStyle = 'rgba(234,88,12,.55)'; g.lineWidth = 1.2; g.beginPath();
          for (k = 0; k <= n; k++) { xx = m.a + (m.b - m.a) * k / n; u = c.f(xx); if (isFinite(u)) { if (k) g.lineTo(X(xx), Y(-u)); else g.moveTo(X(xx), Y(-u)); } }
          if (!c.mot) for (k = n; k >= 0; k--) { xx = m.a + (m.b - m.a) * k / n; v = c.g(xx); if (isFinite(v)) g.lineTo(X(xx), Y(-v)); }
          g.stroke(); g.restore();
        }
        if (T.loai === 'dt' && X(m.b) - X(m.a) > 22) {
          var xm = (m.a + m.b) / 2, ym = (c.f(xm) + c.g(xm)) / 2;
          if (isFinite(ym)) { g.font = '800 15px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText('S' + (i + 1), X(xm), Y(ym)); g.fillStyle = m.bat ? '#1e1a2e' : '#94a3b8'; g.fillText('S' + (i + 1), X(xm), Y(ym)); }
        }
      });
      if (T.loai === 'dt' && T.riemann) {
        var n = T.nR, d = (T.b - T.a) / n;
        g.lineWidth = n > 60 ? 0.6 : 1; g.strokeStyle = 'rgba(37,99,235,.9)'; g.fillStyle = 'rgba(59,130,246,.18)';
        for (var i = 0; i < n; i++) {
          var x1 = T.a + d * i, xs = x1 + d * (T.kieuR === 'trai' ? 0 : T.kieuR === 'phai' ? 1 : 0.5), u2 = c.f(xs), v2 = c.g(xs); if (!isFinite(u2) || !isFinite(v2)) continue;
          var top = Y(Math.max(u2, v2)), bot = Y(Math.min(u2, v2));
          g.fillRect(X(x1), top, X(x1 + d) - X(x1), bot - top); g.strokeRect(X(x1), top, X(x1 + d) - X(x1), bot - top);
        }
      }
      if (T.loai !== 'dt') {   // lát cắt tại x0
        var xx0 = x0(), u0 = c.f(xx0), v0 = c.g(xx0);
        g.strokeStyle = '#059669'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(xx0), Y(u0)); g.lineTo(X(xx0), Y(v0)); g.stroke();
        if (T.loai === 'vt') { var q = K.Rr(xx0); g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(xx0), Y(q[0])); g.lineTo(X(xx0), Y(-q[0])); g.stroke(); g.setLineDash([]); }
        g.fillStyle = '#059669'; g.beginPath(); g.moveTo(X(xx0), H2 - 18); g.lineTo(X(xx0) - 9, H2 - 2); g.lineTo(X(xx0) + 9, H2 - 2); g.closePath(); g.fill();
        g.font = '700 13px system-ui'; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText('x₀', X(xx0), H2 - 19);
      }
    }
    // đồ thị
    T.duong.forEach(function (d) {
      if (!d.f) return;
      g.strokeStyle = d.mau; g.lineWidth = d.bat ? 2.4 : 1.2; g.globalAlpha = d.bat ? 1 : 0.4; g.beginPath();
      var dang = false, tr = null;
      for (var px = 0; px <= W2; px += 1) {
        var yy = d.f(Xi(px)), py = Y(yy);
        if (!isFinite(yy) || (tr != null && Math.abs(py - tr) > H2 * 1.5)) { dang = false; tr = null; continue; }
        py = Math.max(-H2, Math.min(2 * H2, py));
        if (dang) g.lineTo(px, py); else { g.moveTo(px, py); dang = true; } tr = py;
      }
      g.stroke(); g.globalAlpha = 1;
    });
    // giao điểm
    if (K) { g.fillStyle = '#fff'; g.strokeStyle = '#1e1a2e'; g.lineWidth = 2; K.ng.concat([T.a, T.b]).forEach(function (x, i) { var y = K.c.f(x); if (i < K.ng.length && isFinite(y)) { g.beginPath(); g.arc(X(x), Y(y), 5.5, 0, 7); g.fill(); g.stroke(); } }); }
    // cận a, b
    if (T.b > T.a || isFinite(T.a)) [['a', T.a], ['b', T.b]].forEach(function (q) {
      if (!isFinite(q[1])) return; var px = X(q[1]);
      g.strokeStyle = '#f59e0b'; g.lineWidth = 1.8; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(px, 0); g.lineTo(px, H2); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#f59e0b'; g.beginPath(); g.moveTo(px - 10, 0); g.lineTo(px + 10, 0); g.lineTo(px, 17); g.closePath(); g.fill();
      g.fillStyle = '#7c2d12'; g.font = '800 13px system-ui'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(q[0], px, 18);
    });
    // nhãn các đường
    T.duong.forEach(function (d, i) {
      if (!d.f || !d.bat) return;
      var px = W2 - 70 - i * 6, tot = null;
      for (var k = 0; k < 40; k++) { var xx = Xi(W2 * (0.92 - k * 0.02)), yy = d.f(xx); if (isFinite(yy) && Y(yy) > 20 && Y(yy) < H2 - 20) { tot = [X(xx), Y(yy)]; break; } }
      if (!tot) return;
      g.font = '700 13px system-ui'; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.95)';
      var t = 'y = ' + dep(d.bt); g.strokeText(t, tot[0] - 4, tot[1] - 4 - i * 2); g.fillStyle = d.mau; g.fillText(t, tot[0] - 4, tot[1] - 4 - i * 2);
    });
  }
  function ganCham2() {
    var ngon = {}, bd = null, di = false;
    var diem = function (e) { var r = cv2.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    var trung = function (m) {
      if (T.loai !== 'dt' && T.kq && Math.abs(m.x - X(x0())) < 12 && m.y > H2 - 40) return 'x0';
      var da = Math.abs(m.x - X(T.a)), db = Math.abs(m.x - X(T.b)), gan = m.y < 40 ? 14 : 8;
      if (Math.min(da, db) < gan) return da <= db ? 'a' : 'b';
      if (T.loai !== 'dt' && T.kq && Math.abs(m.x - X(x0())) < 7) return 'x0';
      return null;
    };
    var batDinh = function (x) {   // hút về giao điểm, số nguyên, nửa
      var tot = x, tg = 9 / T.v2.s, ds = (T.kq ? T.kq.ng : []).slice();
      var c = capHam(); if (c) ds = ds.concat(nghiem(function (t) { return c.f(t) - c.g(t); }, Xi(0), Xi(W2)));
      ds.forEach(function (n) { if (Math.abs(n - x) < tg) { tot = n; tg = Math.abs(n - x); } });
      if (tot === x) { var r = Math.round(x * 2) / 2; if (Math.abs(r - x) < 7 / T.v2.s) tot = r; }
      return tot;
    };
    var ghiCan = function (k, x) { var p = phanSo(x); T[k + 'Ch'] = p ? veMay(p) : soDep(x, 4).replace(',', '.'); };
    cv2.addEventListener('pointerdown', function (e) {
      try { cv2.setPointerCapture(e.pointerId); } catch (x) { }
      ngon[e.pointerId] = diem(e); di = false;
      var p = Object.keys(ngon).map(function (k) { return ngon[k]; });
      if (p.length === 1) { var t = trung(p[0]); bd = { m: p[0], v: Object.assign({}, T.v2), keo: t }; }
      else bd = { kc: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, m: { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }, v: Object.assign({}, T.v2), hai: true };
    });
    cv2.addEventListener('pointermove', function (e) {
      var m = diem(e);
      if (!ngon[e.pointerId] || !bd) { var t = trung(m); cv2.style.cursor = t ? 'ew-resize' : 'grab'; return; }
      ngon[e.pointerId] = m;
      var p = Object.keys(ngon).map(function (k) { return ngon[k]; });
      if (bd.hai && p.length >= 2) {
        var kc = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mm = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }, s = Math.max(4, Math.min(2000, bd.v.s * kc / bd.kc));
        var wx = bd.v.cx + (bd.m.x - W2 / 2) / bd.v.s, wy = bd.v.cy - (bd.m.y - H2 / 2) / bd.v.s;
        T.v2 = { s: s, cx: wx - (mm.x - W2 / 2) / s, cy: wy + (mm.y - H2 / 2) / s }; di = true; ve2(); return;
      }
      if (Math.hypot(m.x - bd.m.x, m.y - bd.m.y) > 3) di = true;
      if (!di) return;
      if (bd.keo === 'a' || bd.keo === 'b') {
        var x = batDinh(Xi(m.x));
        if (bd.keo === 'a' && x >= T.b) x = T.b - 1e-3; if (bd.keo === 'b' && x <= T.a) x = T.a + 1e-3;
        ghiCan(bd.keo, x); T.tat = {}; T.a = docSo(T.aCh); T.b = docSo(T.bCh); $('[data-can="' + bd.keo + '"]', hop).value = T[bd.keo + 'Ch']; tinh(); veGiai(); ve2(); ve3(); capNhatX0();
      } else if (bd.keo === 'x0') { T.x0 = Math.max(T.a, Math.min(T.b, Xi(m.x))); capNhatX0(); veGiai(); ve2(); ve3(); }
      else { cv2.style.cursor = 'grabbing'; T.v2.cx = bd.v.cx - (m.x - bd.m.x) / bd.v.s; T.v2.cy = bd.v.cy + (m.y - bd.m.y) / bd.v.s; ve2(); }
    });
    var tha = function (e) {
      var m = ngon[e.pointerId]; delete ngon[e.pointerId];
      if (Object.keys(ngon).length) { var p = Object.keys(ngon).map(function (k) { return ngon[k]; }); bd = { m: p[0], v: Object.assign({}, T.v2) }; di = true; return; }
      if (bd && !di && m && !bd.keo && T.kq) {   // bấm vào mảnh: bật / tắt
        var x = Xi(m.x), y = Yi(m.y), c = T.kq.c;
        T.kq.manh.forEach(function (q, i) { if (x >= q.a && x <= q.b) { var u = c.f(x), v = c.g(x); if (y <= Math.max(u, v) && y >= Math.min(u, v)) { T.tat[i] = !T.tat[i]; } } });
        tinh(); veGiai(); ve2(); ve3();
      }
      bd = null; cv2.style.cursor = '';
    };
    cv2.addEventListener('pointerup', tha); cv2.addEventListener('pointercancel', tha);
    cv2.addEventListener('wheel', function (e) {
      e.preventDefault(); var m = diem(e), k = e.deltaY < 0 ? 1.15 : 1 / 1.15, wx = Xi(m.x), wy = Yi(m.y);
      T.v2.s = Math.max(4, Math.min(2000, T.v2.s * k)); T.v2.cx = wx - (m.x - W2 / 2) / T.v2.s; T.v2.cy = wy + (m.y - H2 / 2) / T.v2.s; ve2();
    }, { passive: false });
  }
  function capNhatX0() { var r = $('[data-r="x0"]', hop); if (r) r.value = Math.round((x0() - T.a) / ((T.b - T.a) || 1) * 1000); var h = $('[data-hien="x0"]', hop); if (h) h.textContent = soDep(x0(), 3); }

  // ------------------------------------------------------------------ khối 3D
  var V3 = function (x, y, z) { return { x: x, y: y, z: z }; };
  function datLaiCam() { T.cam = { yaw: -0.6, pitch: 0.38, zoom: 1, ox: 0, oy: 0 }; }
  function luoi3() {   // danh sách mặt { p: [điểm 3D], mau, a (độ trong) }
    var K = T.kq, F = []; if (!K) return F;
    var a = T.a, b = T.b, c = K.c;
    if (T.loai === 'vt') {
      var G = T.goc * Math.PI / 180; if (G < 1e-4) G = 1e-4;
      var m = Math.max(2, Math.ceil(56 * G / (2 * Math.PI))), P = function (x, r, t) { return V3(x, -r * Math.sin(t), r * Math.cos(t)); };
      var mat = function (pts, mau, al, loai) { F.push({ p: pts, mau: mau, a: al, loai: loai }); };
      var khoi = function (xs, Rf, mau) {   // xs: các mốc x; Rf(x) -> [R, r]
        for (var i = 0; i + 1 < xs.length; i++) {
          var x1 = xs[i], x2 = xs[i + 1], q1 = Rf(x1), q2 = Rf(x2);
          for (var j = 0; j < m; j++) {
            var t1 = G * j / m, t2 = G * (j + 1) / m;
            mat([P(x1, q1[0], t1), P(x2, q2[0], t1), P(x2, q2[0], t2), P(x1, q1[0], t2)], mau || '#60a5fa', 0.9, 'ngoai');
            if (q1[1] > 1e-6 || q2[1] > 1e-6) mat([P(x1, q1[1], t1), P(x2, q2[1], t1), P(x2, q2[1], t2), P(x1, q1[1], t2)], '#fbbf24', 0.9, 'trong');
          }
          if (G < 2 * Math.PI - 1e-6) [0, G].forEach(function (t) { mat([P(x1, q1[1], t), P(x2, q2[1], t), P(x2, q2[0], t), P(x1, q1[0], t)], '#34d399', 0.95, 'cat'); });
        }
        [xs[0], xs[xs.length - 1]].forEach(function (x) { var q = Rf(x); if (q[0] - q[1] < 1e-6) return; for (var j = 0; j < m; j++) { var t1 = G * j / m, t2 = G * (j + 1) / m; mat([P(x, q[1], t1), P(x, q[0], t1), P(x, q[0], t2), P(x, q[1], t2)], mau || '#93c5fd', 0.9, 'nap'); } });
      };
      if (T.dia) {
        var n = T.diaN, d = (b - a) / n;
        for (var i = 0; i < n; i++) { var q = K.Rr(a + d * (i + 0.5)); khoi([a + d * i, a + d * (i + 1)], function () { return q; }, i % 2 ? '#7cb4fa' : '#5b9cf5'); }
      } else {
        var xs = [], N = 70; for (i = 0; i <= N; i++) xs.push(a + (b - a) * i / N);
        K.ng.forEach(function (x) { xs.push(x); }); xs.sort(function (u, v) { return u - v; });
        khoi(xs, K.Rr);
      }
      // lát cắt tại x0
      var x = x0(), q0 = K.Rr(x), M = Math.max(24, m);
      for (var j = 0; j < M; j++) { var t1 = G * j / M, t2 = G * (j + 1) / M; F.push({ p: [P(x, q0[1], t1), P(x, q0[0], t1), P(x, q0[0], t2), P(x, q0[1], t2)], mau: '#f97316', a: 0.95, loai: 'lat', truoc: 1 }); }
    } else if (T.loai === 'tl') {
      var w = function (x) { var u = c.f(x), v = c.g(x); return [Math.min(u, v), Math.max(u, v)]; };
      var hinh = function (x) {   // đường viền thiết diện tại x: các điểm (y, z)
        var q = w(x), y0 = q[0], y1 = q[1], ww = y1 - y0, ym = (y0 + y1) / 2, id = T.td, kq = [];
        if (!(ww > 1e-9)) return null;
        if (id === 'vuong' || id === 'cn') { var hh = id === 'cn' ? T.t * ww : ww; return [[y0, 0], [y1, 0], [y1, hh], [y0, hh]]; }
        if (id === 'tgdeu') return [[y0, 0], [y1, 0], [ym, ww * Math.sqrt(3) / 2]];
        if (id === 'vcgoc') return [[y0, 0], [y1, 0], [y0, ww]];
        if (id === 'vchuyen') return [[y0, 0], [y1, 0], [ym, ww / 2]];
        var nn = 28;
        if (id === 'nuatron') { for (var k = 0; k <= nn; k++) { var t = Math.PI * k / nn; kq.push([ym - ww / 2 * Math.cos(t), ww / 2 * Math.sin(t)]); } return kq; }
        for (k = 0; k < nn; k++) { t = 2 * Math.PI * k / nn - Math.PI / 2; kq.push([ym + ww / 2 * Math.cos(t), ww / 2 + ww / 2 * Math.sin(t)]); } return kq;
      };
      // đáy (miền trên mặt sàn)
      var N2 = 80;
      for (i = 0; i < N2; i++) { var xa = a + (b - a) * i / N2, xb = a + (b - a) * (i + 1) / N2, qa = w(xa), qb = w(xb); if (isFinite(qa[0] + qb[0] + qa[1] + qb[1])) F.push({ p: [V3(xa, qa[0], 0), V3(xb, qb[0], 0), V3(xb, qb[1], 0), V3(xa, qa[1], 0)], mau: '#a7f3d0', a: 0.85, loai: 'day', sau: 1 }); }
      var n2 = T.nLat;
      if (T.lien) {
        var NS = 60, truoc = null;
        for (i = 0; i <= NS; i++) {
          var xx = a + (b - a) * i / NS, H = hinh(xx);
          if (H && truoc && H.length === truoc.h.length) for (var k = 0; k < H.length; k++) { var k2 = (k + 1) % H.length; if (k === H.length - 1 && T.td === 'nuatron') continue; F.push({ p: [V3(truoc.x, truoc.h[k][0], truoc.h[k][1]), V3(xx, H[k][0], H[k][1]), V3(xx, H[k2][0], H[k2][1]), V3(truoc.x, truoc.h[k2][0], truoc.h[k2][1])], mau: '#93c5fd', a: 0.55, loai: 'ngoai' }); }
          truoc = H ? { x: xx, h: H } : null;
        }
      }
      for (i = 0; i < n2; i++) { xx = a + (b - a) * (i + 0.5) / n2; H = hinh(xx); if (H) F.push({ p: H.map(function (q) { return V3(xx, q[0], q[1]); }), mau: '#60a5fa', a: T.lien ? 0.5 : 0.82, loai: 'lat' }); }
      H = hinh(x0()); if (H) F.push({ p: H.map(function (q) { return V3(x0(), q[0], q[1]); }), mau: '#f97316', a: 0.95, loai: 'lat', truoc: 1 });
    }
    return F;
  }
  function chieu3(p, c) {
    var cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    var x = p.x * cy - p.y * sy, y = p.x * sy + p.y * cy;
    return { X: x, Y: y * sp + p.z * cp, d: y * cp - p.z * sp };
  }
  function ve3() {
    if (!g3 || !W3) return;
    var g = g3, c = T.cam; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var toi = T.nen === 'toi';
    if (T.nen === 'trang') { g.fillStyle = '#fff'; g.fillRect(0, 0, W3, H3); }
    else if (toi) { g.fillStyle = '#1e1b2e'; g.fillRect(0, 0, W3, H3); }
    else { var gr = g.createLinearGradient(0, 0, 0, H3); gr.addColorStop(0, '#f4f7ff'); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; g.fillRect(0, 0, W3, H3); }
    var K = T.kq; if (!K || T.loai === 'dt') return;
    var F = luoi3();
    // cỡ: theo hộp bao của khối đầy đủ
    var R = Math.max(Math.abs(T.a), Math.abs(T.b), 1) * 0.5, tam = V3((T.a + T.b) / 2, 0, 0), Rm = 0;
    for (var i = 0; i <= 60; i++) { var xx = T.a + (T.b - T.a) * i / 60, q = T.loai === 'vt' ? K.Rr(xx) : [Math.abs(K.h(xx)) * Math.max(1, T.td === 'cn' ? T.t : 1), 0]; if (isFinite(q[0])) Rm = Math.max(Rm, q[0]); }
    if (T.loai === 'tl') { var ys = []; for (i = 0; i <= 60; i++) { xx = T.a + (T.b - T.a) * i / 60; ys.push(K.c.f(xx), K.c.g(xx)); } ys = ys.filter(isFinite); tam = V3((T.a + T.b) / 2, (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2, Rm / 2); }
    R = Math.max((T.b - T.a) / 2, Rm, 1e-3) * 1.2;
    var s = Math.min(W3, H3) / (2.3 * R) * c.zoom, D = 5 * R, cx = W3 / 2 + c.ox, cyy = H3 / 2 + c.oy;
    var hc = function (p) { var q = chieu3(V3(p.x - tam.x, p.y - tam.y, p.z - tam.z), c), f = T.phoiCanh ? D / (D + q.d) : 1; return { x: cx + q.X * s * f, y: cyy - q.Y * s * f, d: q.d }; };
    var L = { x: 0.3, y: -0.45, z: 0.85 }, ll = Math.hypot(L.x, L.y, L.z); L = V3(L.x / ll, L.y / ll, L.z / ll);
    // trục Ox (vẽ dưới khối; phần ngoài khối vẽ lại phía trên)
    var xMin = Math.min(T.a, 0) - R * 0.35, xMax = Math.max(T.b, 0) + R * 0.35;
    var truc = function (x1, x2, trenCung) { var A = hc(V3(x1, 0, 0)), B = hc(V3(x2, 0, 0)); g.strokeStyle = toi ? '#fdba74' : '#ea580c'; g.lineWidth = 2; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); if (trenCung) { var dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1; g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(B.x, B.y); g.lineTo(B.x - 12 * dx / l + 5 * dy / l, B.y - 12 * dy / l - 5 * dx / l); g.lineTo(B.x - 12 * dx / l - 5 * dy / l, B.y - 12 * dy / l + 5 * dx / l); g.closePath(); g.fill(); g.font = 'italic 700 15px Georgia, serif'; g.fillText('x', B.x + 6, B.y - 6); } };
    if (T.loai === 'tl') {   // trục Oy, Oz mờ cho vật thể cắt lát
      var O = hc(V3(0, 0, 0)), Yp = hc(V3(0, R * 0.9, 0)), Zp = hc(V3(0, 0, R * 0.9)); g.strokeStyle = 'rgba(100,116,139,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(O.x, O.y); g.lineTo(Yp.x, Yp.y); g.moveTo(O.x, O.y); g.lineTo(Zp.x, Zp.y); g.stroke();
      g.fillStyle = '#64748b'; g.font = 'italic 600 13px Georgia, serif'; g.fillText('y', Yp.x + 4, Yp.y); g.fillText('z', Zp.x + 4, Zp.y - 4);
    }
    truc(xMin, xMax, false);
    var ds = F.map(function (f) { var P = f.p.map(hc), d = 0; P.forEach(function (q) { d += q.d; }); return { P: P, d: d / P.length - (f.truoc ? R * 0.02 : 0) + (f.sau ? R * 0.5 : 0), f: f }; });
    ds.sort(function (u, v) { return (u.f.truoc ? 1 : 0) - (v.f.truoc ? 1 : 0) || v.d - u.d; });   // lát cắt x₀ luôn vẽ sau cùng (nổi trên khối)
    ds.forEach(function (o) {
      var p = o.f.p, n = { x: 0, y: 0, z: 0 };
      for (var k = 0; k < p.length; k++) { var A = p[k], B = p[(k + 1) % p.length]; n.x += (A.y - B.y) * (A.z + B.z); n.y += (A.z - B.z) * (A.x + B.x); n.z += (A.x - B.x) * (A.y + B.y); }
      var nl = Math.hypot(n.x, n.y, n.z) || 1, sang = 0.72 + 0.28 * Math.abs((n.x * L.x + n.y * L.y + n.z * L.z) / nl);
      g.beginPath(); o.P.forEach(function (q, k) { if (k) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); g.closePath();
      g.globalAlpha = o.f.a; g.fillStyle = toMau(o.f.mau, sang); g.fill();
      if ((o.f.loai === 'lat' && T.loai === 'tl') || (T.dia && o.f.loai === 'nap')) { g.globalAlpha = 1; g.strokeStyle = o.f.loai === 'lat' && o.f.truoc ? '#c2410c' : 'rgba(30,58,138,.55)'; g.lineWidth = o.f.truoc ? 1.6 : 0.6; g.stroke(); }
      else { g.globalAlpha = o.f.a * 0.6; g.strokeStyle = g.fillStyle; g.lineWidth = 0.7; g.stroke(); }
      g.globalAlpha = 1;
    });
    // phần trục ở ngoài khối
    if (T.loai === 'vt') { truc(xMin, Math.min(T.a, xMax), false); truc(Math.max(T.b, xMin), xMax, true); } else truc(xMin, xMax, true);
    var O2 = hc(V3(0, 0, 0)); g.fillStyle = toi ? '#fff' : '#475569'; g.font = 'italic 600 13px Georgia, serif'; g.fillText('O', O2.x - 14, O2.y + 14);
    // nhãn cận
    [[T.a, 'a'], [T.b, 'b'], [x0(), 'x₀']].forEach(function (q, i) { var A = hc(V3(q[0], 0, 0)); g.fillStyle = i === 2 ? '#c2410c' : '#b45309'; g.font = '700 12.5px system-ui'; g.fillText(q[1], A.x - 4, A.y + 16); });
  }
  function toMau(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; return 'rgb(' + Math.round(r * k) + ',' + Math.round(gg * k) + ',' + Math.round(b * k) + ')'; }
  function ganCham3() {
    var ngon = {}, bd = null;
    var diem = function (e) { var r = cv3.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv3.addEventListener('pointerdown', function (e) {
      try { cv3.setPointerCapture(e.pointerId); } catch (x) { }
      ngon[e.pointerId] = diem(e); var p = Object.keys(ngon).map(function (k) { return ngon[k]; });
      if (p.length === 1) bd = { m: p[0], c: Object.assign({}, T.cam), dich: e.button === 2 || e.button === 1 || e.shiftKey };
      else bd = { kc: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, m: { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }, c: Object.assign({}, T.cam), hai: true };
    });
    cv3.addEventListener('pointermove', function (e) {
      if (!ngon[e.pointerId] || !bd) return; ngon[e.pointerId] = diem(e);
      var p = Object.keys(ngon).map(function (k) { return ngon[k]; }), c = T.cam;
      if (bd.hai && p.length >= 2) { var kc = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), m = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; c.zoom = Math.max(0.3, Math.min(8, bd.c.zoom * kc / bd.kc)); c.ox = bd.c.ox + m.x - bd.m.x; c.oy = bd.c.oy + m.y - bd.m.y; }
      else if (!bd.hai) { var dx = p[0].x - bd.m.x, dy = p[0].y - bd.m.y; if (bd.dich) { c.ox = bd.c.ox + dx; c.oy = bd.c.oy + dy; } else { c.yaw = bd.c.yaw - dx * 0.008; c.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bd.c.pitch + dy * 0.008)); } }
      ve3();
    });
    var tha = function (e) { delete ngon[e.pointerId]; var p = Object.keys(ngon).map(function (k) { return ngon[k]; }); bd = p.length === 1 ? { m: p[0], c: Object.assign({}, T.cam) } : null; };
    cv3.addEventListener('pointerup', tha); cv3.addEventListener('pointercancel', tha);
    cv3.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv3.addEventListener('wheel', function (e) { e.preventDefault(); T.cam.zoom = Math.max(0.3, Math.min(8, T.cam.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); ve3(); }, { passive: false });
  }

  // ------------------------------------------------------------------ bố cục, xuất ảnh
  function coGian() {
    if (!hop || !dangMo) return;
    var san = $('.tp-san', hop), r = san.getBoundingClientRect(), xem = xemThat();
    var ngang = r.width > 860 && r.width / Math.max(1, r.height) > 1.3;
    san.className = 'tp-san xem-' + xem + (ngang ? ' ngang' : ' doc');
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var cu = W2;
    [[cv2, 2], [cv3, 3]].forEach(function (x) {
      var cv = x[0], b = cv.parentNode.getBoundingClientRect(), w = Math.max(0, Math.floor(b.width)), h = Math.max(0, Math.floor(b.height));
      cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
      if (x[1] === 2) { W2 = w; H2 = h; } else { W3 = w; H3 = h; }
    });
    if (!cu && W2) vuaKhung();
    ve2(); ve3();
  }
  function taiPNG() {
    var xem = xemThat(), cv = xem === '3d' ? cv3 : cv2;
    if (xem === 'ca') {   // ghép hai hình
      var c = document.createElement('canvas'), ngang = $('.tp-san', hop).classList.contains('ngang');
      c.width = ngang ? cv2.width + cv3.width : Math.max(cv2.width, cv3.width); c.height = ngang ? Math.max(cv2.height, cv3.height) : cv2.height + cv3.height;
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(cv2, 0, 0); g.drawImage(cv3, ngang ? cv2.width : 0, ngang ? 0 : cv2.height); cv = c;
    }
    cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ung-dung-tich-phan_' + T.loai + '.png'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); });
  }

  // ------------------------------------------------------------------ bật / tắt chế độ
  var dangMo = false;
  function viTriHop() { var tr = document.querySelector('.tren'); hop.style.top = (tr ? tr.getBoundingClientRect().bottom : 0) + 'px'; }
  function mo() {
    var dau = !hop;
    if (dau) { taoGiaoDien(); datMau(MAU.dt[0]); }
    dangMo = true; hop.classList.remove('an'); document.body.classList.add('che-tp');
    $$('.che-do button').forEach(function (b) { b.classList.toggle('on', b.hasAttribute('data-tp')); });
    viTriHop();
    if (dau) { veTrai(); }
    coGian(); capNhat(dau);
    try { var u = new URL(location.href); u.searchParams.set('che-do', 'tichphan'); history.replaceState(null, '', u); } catch (e) { }
    if (T.tuXoay) vongXoay();
  }
  function dong() {
    if (!dangMo) return; dangMo = false; dungQuay();
    hop.classList.add('an'); document.body.classList.remove('che-tp');
    try { var u = new URL(location.href); if (u.searchParams.get('che-do') === 'tichphan') { u.searchParams.delete('che-do'); history.replaceState(null, '', u); } } catch (e) { }
    window.dispatchEvent(new Event('resize'));
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.che-do button'); if (!b) return;
    if (b.hasAttribute('data-tp')) { e.stopPropagation(); e.preventDefault(); if (window.TRAI_HINH) TRAI_HINH.dong(); mo(); }
    else dong();
  }, true);
  window.addEventListener('resize', function () { if (dangMo) { viTriHop(); coGian(); } });
  if (new URLSearchParams(location.search).get('che-do') === 'tichphan') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mo); else setTimeout(mo, 0); }
  window.TICH_PHAN = { mo: mo, dong: dong, _T: T, _kt: { bienDich: bienDich, simpson: simpson, nghiem: nghiem, phanSo: phanSo, luoi3: luoi3, tinh: tinh, capNhat: capNhat, datMau: datMau, MAU: MAU } };
})();
