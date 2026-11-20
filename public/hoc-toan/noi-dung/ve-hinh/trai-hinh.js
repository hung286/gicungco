/* TRẢI HÌNH — hình trải (lưới) của khối: gấp / trải động trên hình 3D, lưới phẳng có mép dán, số hiệu mặt, độ dài cạnh; in đúng tỉ lệ.
   Khối đa diện: cây khung các mặt (mỗi cạnh trong cây là nếp gấp, cạnh còn lại là nét cắt).
   Mặt cong (trụ, nón, nón cụt): xấp xỉ bằng dải nhiều mặt nhỏ, nếp gấp giữa các dải ẩn đi (mặt xung quanh trải thành hình chữ nhật, hình quạt). */
(function () {
  'use strict';
  // ------------------------------------------------------------------ toán vectơ
  var V = function (x, y, z) { return { x: x, y: y, z: z }; };
  var cong = function (a, b) { return V(a.x + b.x, a.y + b.y, a.z + b.z); };
  var tru = function (a, b) { return V(a.x - b.x, a.y - b.y, a.z - b.z); };
  var nhan = function (a, k) { return V(a.x * k, a.y * k, a.z * k); };
  var vh = function (a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; };
  var co = function (a, b) { return V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); };
  var dai = function (a) { return Math.sqrt(vh(a, a)); };
  var don = function (a) { var l = dai(a) || 1; return nhan(a, 1 / l); };
  // phép biến đổi cứng: { R: ma trận 3x3 (mảng 9), t: vectơ }
  var MT_DV = function () { return { R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: V(0, 0, 0) }; };
  function apR(R, p) { return V(R[0] * p.x + R[1] * p.y + R[2] * p.z, R[3] * p.x + R[4] * p.y + R[5] * p.z, R[6] * p.x + R[7] * p.y + R[8] * p.z); }
  function ap(M, p) { return cong(apR(M.R, p), M.t); }
  function nhanR(A, B) { var C = []; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return C; }
  function ghep(A, B) { return { R: nhanR(A.R, B.R), t: cong(apR(A.R, B.t), A.t) }; }   // A sau B
  function quayTruc(a, e, g) {   // quay góc g quanh trục qua điểm a, hướng e (đơn vị)
    var c = Math.cos(g), s = Math.sin(g), C = 1 - c, x = e.x, y = e.y, z = e.z;
    var R = [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C];
    return { R: R, t: tru(a, apR(R, a)) };
  }
  function phapTuyen(ps) {   // Newell
    var n = V(0, 0, 0);
    for (var i = 0; i < ps.length; i++) { var a = ps[i], b = ps[(i + 1) % ps.length]; n.x += (a.y - b.y) * (a.z + b.z); n.y += (a.z - b.z) * (a.x + b.x); n.z += (a.x - b.x) * (a.y + b.y); }
    return n;
  }
  var trongTam = function (ps) { var c = V(0, 0, 0); ps.forEach(function (p) { c = cong(c, p); }); return nhan(c, 1 / ps.length); };
  var so = function (x, k) { var m = Math.pow(10, k == null ? 2 : k), v = Math.round(x * m) / m; return String(v).replace('.', ','); };

  // ------------------------------------------------------------------ bao lồi + gộp mặt đồng phẳng (khối đều, khối từ toạ độ)
  function baoLoi(ps) {
    var n = ps.length; if (n < 4) throw new Error('Cần ít nhất 4 điểm không đồng phẳng.');
    var L = 1; ps.forEach(function (p) { L = Math.max(L, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)); });
    var eps = 1e-9 * L, i1 = -1, i2 = -1, i3 = -1, k;
    for (k = 1; k < n; k++) if (dai(tru(ps[k], ps[0])) > 1e-6 * L) { i1 = k; break; }
    if (i1 < 0) throw new Error('Các điểm trùng nhau.');
    for (k = 1; k < n; k++) if (dai(co(tru(ps[i1], ps[0]), tru(ps[k], ps[0]))) > 1e-6 * L * L) { i2 = k; break; }
    if (i2 < 0) throw new Error('Các điểm thẳng hàng.');
    var nn = co(tru(ps[i1], ps[0]), tru(ps[i2], ps[0]));
    for (k = 1; k < n; k++) if (Math.abs(vh(nn, tru(ps[k], ps[0]))) > 1e-6 * L * dai(nn)) { i3 = k; break; }
    if (i3 < 0) throw new Error('Các điểm đồng phẳng — chưa tạo thành khối.');
    var tam = nhan(cong(cong(ps[0], ps[i1]), cong(ps[i2], ps[i3])), 0.25);
    var mat = function (a, b, c) { var no = co(tru(ps[b], ps[a]), tru(ps[c], ps[a])); if (vh(no, tru(tam, ps[a])) > 0) { var t = b; b = c; c = t; no = nhan(no, -1); } return { a: a, b: b, c: c, n: no }; };
    var F = [mat(0, i1, i2), mat(0, i1, i3), mat(0, i2, i3), mat(i1, i2, i3)];
    for (k = 0; k < n; k++) {
      if (k === 0 || k === i1 || k === i2 || k === i3) continue;
      var thay = F.filter(function (m) { return vh(m.n, tru(ps[k], ps[m.a])) > eps * dai(m.n) * 10; });
      if (!thay.length) continue;
      var canh = {};
      thay.forEach(function (m) { [[m.a, m.b], [m.b, m.c], [m.c, m.a]].forEach(function (e) { canh[e[0] + ',' + e[1]] = e; }); });
      F = F.filter(function (m) { return thay.indexOf(m) < 0; });
      Object.keys(canh).forEach(function (key) { var e = canh[key]; if (!canh[e[1] + ',' + e[0]]) F.push(mat(e[0], e[1], k)); });
    }
    // gộp tam giác đồng phẳng thành đa giác
    var nhom = [];
    F.forEach(function (m) {
      var nu = don(m.n), d = vh(nu, ps[m.a]);
      var g = nhom.filter(function (q) { return vh(q.n, nu) > 1 - 1e-7 && Math.abs(q.d - d) < 1e-6 * L; })[0];
      if (!g) { g = { n: nu, d: d, t: [] }; nhom.push(g); }
      g.t.push(m);
    });
    var dung = {};
    var mats = nhom.map(function (g) {
      var canh = {};
      g.t.forEach(function (m) { [[m.a, m.b], [m.b, m.c], [m.c, m.a]].forEach(function (e) { canh[e[0] + ',' + e[1]] = e; }); });
      var bien = {};
      Object.keys(canh).forEach(function (key) { var e = canh[key]; if (!canh[e[1] + ',' + e[0]]) bien[e[0]] = e[1]; });
      var dau = +Object.keys(bien)[0], vong = [dau], x = bien[dau], an = 0;
      while (x !== dau && an++ < 1000) { vong.push(x); x = bien[x]; }
      // bỏ đỉnh nằm giữa cạnh (thẳng hàng)
      vong = vong.filter(function (v, i) { var a = ps[vong[(i + vong.length - 1) % vong.length]], b = ps[vong[(i + 1) % vong.length]]; return dai(co(tru(ps[v], a), tru(b, ps[v]))) > 1e-9 * L * L; });
      vong.forEach(function (v) { dung[v] = 1; });
      return vong;
    });
    // đánh số lại các đỉnh dùng tới
    var moi = {}, V2 = [];
    Object.keys(dung).map(Number).sort(function (a, b) { return a - b; }).forEach(function (v) { moi[v] = V2.length; V2.push(ps[v]); });
    return { V: V2, F: mats.map(function (f) { return { v: f.map(function (v) { return moi[v]; }) }; }) };
  }

  // ------------------------------------------------------------------ danh mục khối
  var PHI = (1 + Math.sqrt(5)) / 2;
  function daGiacDeu(n, R, z, lech) { var ps = []; for (var i = 0; i < n; i++) { var g = (lech || 0) + 2 * Math.PI * i / n - Math.PI / 2 + Math.PI / n; ps.push(V(R * Math.cos(g), R * Math.sin(g), z)); } return ps; }
  function lang(day, tren) {   // khối có hai đáy cùng số đỉnh (lăng trụ, chóp cụt, hộp)
    var n = day.length, Vs = day.concat(tren), F = [];
    F.push({ v: day.map(function (_, i) { return n - 1 - i; }), g: 'day' });
    F.push({ v: tren.map(function (_, i) { return n + i; }), g: 'tren' });
    for (var i = 0; i < n; i++) F.push({ v: [i, (i + 1) % n, n + (i + 1) % n, n + i] });
    return { V: Vs, F: F };
  }
  function chop(day, dinh) {
    var n = day.length, Vs = day.concat([dinh]), F = [{ v: day.map(function (_, i) { return n - 1 - i; }), g: 'day' }];
    for (var i = 0; i < n; i++) F.push({ v: [i, (i + 1) % n, n] });
    return { V: Vs, F: F };
  }
  var N_TRON = 60;
  function quayCong(r1, r2, h) {   // trụ (r1 = r2), nón (r2 = 0), nón cụt: dải mặt xung quanh + đáy
    var n = N_TRON, day = daGiacDeu(n, r1, 0), K;
    if (r2 > 1e-9) K = lang(day, daGiacDeu(n, r2, h)); else K = chop(day, V(0, 0, h));
    K.cong = true;
    K.F.forEach(function (f) { if (!f.g) f.g = 'xq'; });
    return K;
  }
  var DM = [
    { id: 'lap', ten: 'Hình lập phương', ts: [['a', 'Cạnh', 3]], tao: function (p) { return lang(daGiacDeu(4, p.a / Math.SQRT2, 0), daGiacDeu(4, p.a / Math.SQRT2, p.a)); } },
    { id: 'hop', ten: 'Hình hộp chữ nhật', ts: [['a', 'Chiều dài', 4], ['b', 'Chiều rộng', 2.5], ['c', 'Chiều cao', 2]], tao: function (p) { var a = p.a / 2, b = p.b / 2; var d = [V(-a, -b, 0), V(a, -b, 0), V(a, b, 0), V(-a, b, 0)]; return lang(d, d.map(function (q) { return V(q.x, q.y, p.c); })); } },
    { id: 'langtru', ten: 'Lăng trụ đều', ts: [['n', 'Số cạnh đáy', 3, 1], ['a', 'Cạnh đáy', 3], ['h', 'Chiều cao', 4]], tao: function (p) { var R = p.a / (2 * Math.sin(Math.PI / p.n)); return lang(daGiacDeu(p.n, R, 0), daGiacDeu(p.n, R, p.h)); } },
    { id: 'chop', ten: 'Hình chóp đều', ts: [['n', 'Số cạnh đáy', 4, 1], ['a', 'Cạnh đáy', 4], ['h', 'Chiều cao', 4]], tao: function (p) { var R = p.a / (2 * Math.sin(Math.PI / p.n)); return chop(daGiacDeu(p.n, R, 0), V(0, 0, p.h)); } },
    { id: 'chopSA', ten: 'Chóp có SA ⊥ đáy', ts: [['a', 'Cạnh đáy (vuông)', 3], ['h', 'SA', 4]], tao: function (p) { var a = p.a / 2; return chop([V(-a, -a, 0), V(a, -a, 0), V(a, a, 0), V(-a, a, 0)], V(-a, -a, p.h)); } },
    { id: 'chopcut', ten: 'Chóp cụt đều', ts: [['n', 'Số cạnh đáy', 4, 1], ['a', 'Cạnh đáy lớn', 4], ['b', 'Cạnh đáy nhỏ', 2], ['h', 'Chiều cao', 2.5]], tao: function (p) { var s = 2 * Math.sin(Math.PI / p.n); return lang(daGiacDeu(p.n, p.a / s, 0), daGiacDeu(p.n, p.b / s, p.h)); } },
    { id: 'tudien', ten: 'Tứ diện đều', ts: [['a', 'Cạnh', 4]], deu: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], canh0: 2 * Math.SQRT2 },
    { id: 'tdvuong', ten: 'Tứ diện vuông OABC', ts: [['a', 'OA', 3], ['b', 'OB', 3], ['c', 'OC', 3]], tao: function (p) { return baoLoi([V(0, 0, 0), V(p.a, 0, 0), V(0, p.b, 0), V(0, 0, p.c)]); } },
    { id: 'batdien', ten: 'Bát diện đều', ts: [['a', 'Cạnh', 3]], deu: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], canh0: Math.SQRT2 },
    { id: 'thapnhi', ten: 'Mười hai mặt đều', ts: [['a', 'Cạnh', 2]], deu: (function () { var q = [], i = 1 / PHI; [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { q.push([x, y, z]); }); q.push([0, x * i, y * PHI], [x * i, y * PHI, 0], [x * PHI, 0, y * i]); }); }); return q; })(), canh0: 2 / PHI },
    { id: 'nhithap', ten: 'Hai mươi mặt đều', ts: [['a', 'Cạnh', 2]], deu: (function () { var q = []; [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { q.push([0, x, y * PHI], [x, y * PHI, 0], [y * PHI, 0, x]); }); }); return q; })(), canh0: 2 },
    { id: 'tru', ten: 'Hình trụ', ts: [['r', 'Bán kính đáy', 1.5], ['h', 'Chiều cao', 4]], tao: function (p) { return quayCong(p.r, p.r, p.h); } },
    { id: 'non', ten: 'Hình nón', ts: [['r', 'Bán kính đáy', 2], ['h', 'Chiều cao', 4]], tao: function (p) { return quayCong(p.r, 0, p.h); } },
    { id: 'noncut', ten: 'Hình nón cụt', ts: [['r', 'Bán kính đáy lớn', 2.5], ['r2', 'Bán kính đáy nhỏ', 1.2], ['h', 'Chiều cao', 2.5]], tao: function (p) { return quayCong(p.r, p.r2, p.h); } },
    { id: 'toado', ten: 'Khối từ toạ độ…', ts: [], toado: true }
  ];
  var TOADO_MAU = '0 0 0\n4 0 0\n4 4 0\n0 4 0\n2 2 4';

  // ------------------------------------------------------------------ trạng thái
  var T = {
    dm: DM[0], ts: {}, toado: TOADO_MAU, K: null, goc: 0, cay: null, chon: -1, hover: -1,
    gap: 0, chay: null, tuXoay: false, phoiCanh: true, nen: 'macdinh',
    tuyChon: { dan: true, canh: true, so: true },
    cam: { yaw: -0.55, pitch: 0.62, zoom: 1, ox: 0, oy: 0 },
    luoi: { zoom: 1, ox: 0, oy: 0 }, loi: ''
  };
  var MAU = ['#5eead4', '#fcd34d', '#a5b4fc', '#fda4af', '#7dd3fc', '#bef264', '#f0abfc', '#fdba74', '#c4b5fd', '#86efac', '#fde047', '#93c5fd'];
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var $$ = function (s, g) { return [].slice.call((g || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ------------------------------------------------------------------ dựng khối: chuẩn hoá hướng mặt, cạnh kề, nhóm mặt
  function dungKhoi() {
    var d = T.dm, K;
    if (d.toado) {
      var ps = T.toado.split(/\n|;/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
        var v = l.replace(/[()]/g, '').split(/[\s,]+/).filter(Boolean).map(function (x) { return parseFloat(x.replace(',', '.')); });
        if (v.length !== 3 || v.some(isNaN)) throw new Error('Mỗi dòng ghi 3 số x y z (VD: 0 0 0).');
        return V(v[0], v[1], v[2]);
      });
      K = baoLoi(ps);
    } else if (d.deu) {
      var k = T.ts.a / d.canh0;
      K = baoLoi(d.deu.map(function (q) { return V(q[0] * k, q[1] * k, q[2] * k); }));
    } else K = d.tao(T.ts);
    // hướng mặt ra ngoài
    var tam = trongTam(K.V);
    K.F.forEach(function (f) {
      var ps = f.v.map(function (i) { return K.V[i]; }), n = phapTuyen(ps);
      if (vh(n, tru(trongTam(ps), tam)) < 0) { f.v.reverse(); n = nhan(n, -1); }
      f.n = don(n); f.dt = dai(n) / 2;
    });
    // cạnh kề: "i,j" -> [mặt, vị trí]
    var C = {};
    K.F.forEach(function (f, fi) { f.v.forEach(function (a, k) { var b = f.v[(k + 1) % f.v.length]; C[Math.min(a, b) + ',' + Math.max(a, b)] = (C[Math.min(a, b) + ',' + Math.max(a, b)] || []).concat([[fi, k]]); }); });
    K.C = C;
    K.ke = K.F.map(function () { return []; });
    Object.keys(C).forEach(function (key) { var e = C[key]; if (e.length === 2) { K.ke[e[0][0]].push({ f: e[1][0], key: key }); K.ke[e[1][0]].push({ f: e[0][0], key: key }); } });
    // nếp ẩn: giữa hai mặt cùng nhóm mặt cong
    K.tron = {};
    if (K.cong) Object.keys(C).forEach(function (key) { var e = C[key]; if (e.length === 2 && K.F[e[0][0]].g === 'xq' && K.F[e[1][0]].g === 'xq') K.tron[key] = 1; });
    // nhóm mặt -> số hiệu
    var nh = {}, dsNhom = [];
    K.F.forEach(function (f, fi) { var g = K.cong ? f.g : 'm' + fi; if (!(g in nh)) { nh[g] = dsNhom.length; dsNhom.push({ g: g, f: [] }); } f.nhom = nh[g]; dsNhom[nh[g]].f.push(fi); });
    K.nhom = dsNhom;
    K.L = Math.max.apply(null, K.V.map(function (p) { return Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)); }).concat([1]));
    return K;
  }

  // đặt mặt gốc nằm dưới (pháp tuyến hướng xuống), tâm mặt gốc ở gốc toạ độ
  function datGoc(K, g) {
    var f = K.F[g], n = f.n, dich = V(0, 0, -1), truc = co(n, dich), s = dai(truc), c = vh(n, dich), M;
    if (s < 1e-9) M = c > 0 ? MT_DV() : quayTruc(V(0, 0, 0), V(1, 0, 0), Math.PI);
    else M = quayTruc(V(0, 0, 0), nhan(truc, 1 / s), Math.atan2(s, c));
    // quay quanh trục đứng để cạnh đầu của mặt gốc nằm ngang (lưới ngay ngắn)
    var p0 = ap(M, K.V[f.v[0]]), p1 = ap(M, K.V[f.v[1]]), e = tru(p1, p0), goc = -Math.atan2(e.y, e.x);
    M = ghep(quayTruc(V(0, 0, 0), V(0, 0, 1), goc), M);
    var c0 = ap(M, trongTam(f.v.map(function (i) { return K.V[i]; })));
    M.t = tru(M.t, c0);
    K.W = K.V.map(function (p) { return ap(M, p); });   // toạ độ khối đã đặt
    K.Fn = K.F.map(function (q) { return apR(M.R, q.n); });
  }

  // ------------------------------------------------------------------ cây trải (cây khung các mặt)
  function cayBFS(K, g, tron) {
    var cha = K.F.map(function () { return null; }), da = {}, hang = [g]; da[g] = 1;
    if (K.cong) {   // mặt cong: dải xung quanh nối liền (trải ra hai phía từ dải giữa), các đáy gắn vào dải giữa
      var tim = function (ten) { for (var q = 0; q < K.F.length; q++) if (K.F[q].g === ten) return q; return -1; };
      var day = tim('day'), tren = tim('tren');
      if (g !== day && g !== tren) g = day;
      var f0 = K.F[g], k0 = Math.min(f0.v[0], f0.v[1]) + ',' + Math.max(f0.v[0], f0.v[1]);
      var giua = K.ke[g].filter(function (e) { return e.key === k0; })[0].f;
      cha[giua] = { f: g, key: k0 }; da[giua] = 1; hang = [giua];
      while (hang.length) { var x = hang.shift(); K.ke[x].forEach(function (e) { if (!da[e.f] && K.F[e.f].g === 'xq') { da[e.f] = 1; cha[e.f] = { f: x, key: e.key }; hang.push(e.f); } }); }
      var khac = g === day ? tren : day;
      if (khac >= 0) { var e2 = K.ke[giua].filter(function (e) { return e.f === khac; })[0]; if (e2) cha[khac] = { f: giua, key: e2.key }; }
      return { cha: cha, goc: g };
    }
    var ngau = tron ? function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(tron() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; } : function (a) { return a; };
    var sau = tron && tron() < 0.5;   // xen kẽ BFS / DFS để có nhiều kiểu lưới
    while (hang.length) {
      var f = sau ? hang.pop() : hang.shift();
      ngau(K.ke[f].slice()).forEach(function (e) { if (!da[e.f]) { da[e.f] = 1; cha[e.f] = { f: f, key: e.key }; hang.push(e.f); } });
    }
    return { cha: cha, goc: g };
  }
  function gocTrai(K, cay) {   // góc mở ở mỗi nếp: quay mặt con quanh cạnh chung cho đồng phẳng với mặt cha
    cay.phi = K.F.map(function (f, i) {
      var c = cay.cha[i]; if (!c) return 0;
      var ab = c.key.split(',').map(Number), a = K.W[ab[0]], e = don(tru(K.W[ab[1]], a));
      var nc = K.Fn[i], np = K.Fn[c.f];
      return Math.atan2(vh(e, co(nc, np)), vh(nc, np));
    });
    // thứ tự: cha trước con
    var thuTu = [], da = {};
    var them = function (i) { if (da[i]) return; var c = cay.cha[i]; if (c) them(c.f); da[i] = 1; thuTu.push(i); };
    K.F.forEach(function (_, i) { them(i); });
    cay.thuTu = thuTu;
    cay.sau = K.F.map(function () { return 0; });   // độ sâu (gấp lần lượt)
    thuTu.forEach(function (i) { var c = cay.cha[i]; cay.sau[i] = c ? cay.sau[c.f] + 1 : 0; });
    cay.sauMax = Math.max.apply(null, cay.sau);
  }
  function viTriMat(K, cay, t) {   // t = 0: trải phẳng · t = 1: gấp thành khối → toạ độ đỉnh của từng mặt
    var M = [], kq = [];
    cay.thuTu.forEach(function (i) {
      var c = cay.cha[i];
      if (!c) M[i] = MT_DV();
      else {
        var ab = c.key.split(',').map(Number), a = K.W[ab[0]], e = don(tru(K.W[ab[1]], a));
        M[i] = ghep(M[c.f], quayTruc(a, e, cay.phi[i] * (1 - t)));
      }
      kq[i] = K.F[i].v.map(function (v) { return ap(M[i], K.W[v]); });
    });
    return kq;
  }

  // ------------------------------------------------------------------ lưới phẳng 2D: mặt, nếp gấp, nét cắt, mép dán
  function chieu2(p) { return { x: p.x, y: -p.y }; }   // nhìn từ dưới lên = mặt ngoài của khối
  function chongLan(A, B) {   // hai đa giác lồi có phần trong chung? (định lí trục tách)
    var truc = function (P) { var ds = []; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; ds.push({ x: a.y - b.y, y: b.x - a.x }); } return ds; };
    var tr = truc(A).concat(truc(B));
    for (var k = 0; k < tr.length; k++) {
      var n = tr[k], l = Math.hypot(n.x, n.y); if (l < 1e-12) continue;
      var mnA = Infinity, mxA = -Infinity, mnB = Infinity, mxB = -Infinity;
      A.forEach(function (p) { var v = (p.x * n.x + p.y * n.y) / l; mnA = Math.min(mnA, v); mxA = Math.max(mxA, v); });
      B.forEach(function (p) { var v = (p.x * n.x + p.y * n.y) / l; mnB = Math.min(mnB, v); mxB = Math.max(mxB, v); });
      if (mxA <= mnB + 1e-6 || mxB <= mnA + 1e-6) return false;
    }
    return true;
  }
  function co2(P, k) { var c = { x: 0, y: 0 }; P.forEach(function (p) { c.x += p.x; c.y += p.y; }); c.x /= P.length; c.y /= P.length; return P.map(function (p) { return { x: c.x + (p.x - c.x) * k, y: c.y + (p.y - c.y) * k }; }); }
  function hop2(P) { var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }; P.forEach(function (p) { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); }); return b; }
  var giaoHop = function (a, b) { return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1; };
  function dungLuoi(K, cay) {
    var P3 = viTriMat(K, cay, 0), mat = P3.map(function (ps) { return ps.map(chieu2); });
    var hop = mat.map(hop2), co98 = mat.map(function (P) { return co2(P, 0.98); });
    // chồng lấn?
    var chong = 0;
    for (var i = 0; i < mat.length && !chong; i++) for (var j = i + 1; j < mat.length; j++) if (giaoHop(hop[i], hop[j]) && chongLan(co98[i], co98[j])) { chong = 1; break; }
    // cạnh: nếp gấp / nét cắt
    var nep = [], cat = {};
    Object.keys(K.C).forEach(function (key) {
      var e = K.C[key];
      var laNep = e.length === 2 && ((cay.cha[e[0][0]] && cay.cha[e[0][0]].key === key && cay.cha[e[0][0]].f === e[1][0]) || (cay.cha[e[1][0]] && cay.cha[e[1][0]].key === key && cay.cha[e[1][0]].f === e[0][0]));
      e.forEach(function (o) {
        var P = mat[o[0]], a = P[o[1]], b = P[(o[1] + 1) % P.length];
        if (laNep) { if (o === e[0]) nep.push({ a: a, b: b, key: key, an: !!K.tron[key] }); }
        else (cat[key] = cat[key] || []).push({ a: a, b: b, f: o[0], key: key });
      });
    });
    // độ dài cạnh mẫu (để định cỡ mép dán)
    var dd = Object.keys(K.C).map(function (key) { var ab = key.split(',').map(Number); return dai(tru(K.W[ab[0]], K.W[ab[1]])); }).sort(function (a, b) { return a - b; });
    var Lm = K.cong ? Math.max.apply(null, dd) * 0.5 : dd[Math.floor(dd.length / 2)];
    var dan = [], dsCat = [];
    var tamMat = mat.map(function (P) { var c = { x: 0, y: 0 }; P.forEach(function (p) { c.x += p.x; c.y += p.y; }); return { x: c.x / P.length, y: c.y / P.length }; });
    var hinhDan = function (o) {
      var a = o.a, b = o.b, l = Math.hypot(b.x - a.x, b.y - a.y); if (l < 1e-9) return null;
      var u = { x: (b.x - a.x) / l, y: (b.y - a.y) / l }, n = { x: -u.y, y: u.x }, c = tamMat[o.f];
      if ((c.x - a.x) * n.x + (c.y - a.y) * n.y > 0) n = { x: -n.x, y: -n.y };
      var d = Math.min(Lm * 0.2, l * 0.42), lui = Math.min(d * 0.9, l * 0.3);
      return [a, b, { x: b.x + n.x * d - u.x * lui, y: b.y + n.y * d - u.y * lui }, { x: a.x + n.x * d + u.x * lui, y: a.y + n.y * d + u.y * lui }];
    };
    var vuong = function (H) { var h = hop2(H), Hc = co2(H, 0.96); for (var i = 0; i < mat.length; i++) if (giaoHop(h, hop[i]) && chongLan(Hc, co98[i])) return true; for (i = 0; i < dan.length; i++) if (giaoHop(h, dan[i].h) && chongLan(Hc, co2(dan[i].P, 0.96))) return true; return false; };
    Object.keys(cat).forEach(function (key) {
      var ds = cat[key]; ds.forEach(function (o) { dsCat.push(o); });
      if (ds.length < 2) return;
      var uu = ds.slice().sort(function (p, q) { return (K.F[q.f].g === 'xq' ? 1 : 0) - (K.F[p.f].g === 'xq' ? 1 : 0); });
      var chon = null;
      for (var i = 0; i < uu.length && !chon; i++) { var H = hinhDan(uu[i]); if (H && !vuong(H)) chon = H; }
      if (!chon) chon = hinhDan(uu[0]);
      if (chon) dan.push({ P: chon, h: hop2(chon), key: key });
    });
    // nhãn độ dài: mỗi giá trị khác nhau ghi một lần, ưu tiên trên nét cắt
    var nhanCanh = [], daGhi = {};
    if (!K.cong) {
      dsCat.concat(nep).forEach(function (o) {
        var ab = o.key.split(',').map(Number), l = dai(tru(K.W[ab[0]], K.W[ab[1]])), k = so(l);
        if (daGhi[k]) return; daGhi[k] = 1;
        nhanCanh.push({ a: o.a, b: o.b, t: k, f: o.f != null ? o.f : null });
      });
    }
    var tatCa = mat.reduce(function (s, P) { return s.concat(P); }, []).concat(dan.reduce(function (s, d) { return s.concat(d.P); }, []));
    return { mat: mat, nep: nep, cat: dsCat, dan: dan, nhanCanh: nhanCanh, chong: chong, hop: hop2(tatCa), tamMat: tamMat };
  }
  function tron(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function chonCay(khac) {   // khac: tìm cách trải khác không chồng lấn
    var K = T.K, cay, lu;
    if (!khac) { cay = cayBFS(K, T.goc); gocTrai(K, cay); lu = dungLuoi(K, cay); if (!lu.chong || K.cong) { T.cay = cay; T.lu = lu; return; } }
    var seed = (Date.now() & 0xffff) + 1;
    for (var lan = 0; lan < 300; lan++) {
      cay = cayBFS(K, T.goc, tron(seed + lan * 7919)); gocTrai(K, cay); lu = dungLuoi(K, cay);
      if (!lu.chong && (!T.cay || lan > 40 || khacCay(cay, T.cay))) { T.cay = cay; T.lu = lu; return; }
    }
    T.cay = cay; T.lu = lu;
  }
  function khacCay(a, b) { return a.cha.some(function (c, i) { var d = b.cha[i]; return (c && c.key) !== (d && d.key); }); }

  // ------------------------------------------------------------------ đo đạc, công thức
  function thongTin() {
    var K = T.K, d = T.dm, p = T.ts, h = [];
    var Stp = K.F.reduce(function (s, f) { return s + f.dt; }, 0);
    var Vt = 0; K.F.forEach(function (f) { var a = K.V[f.v[0]]; for (var i = 1; i + 1 < f.v.length; i++) Vt += vh(a, co(K.V[f.v[i]], K.V[f.v[i + 1]])) / 6; });
    Vt = Math.abs(Vt);
    var PI = Math.PI;
    if (K.cong) {
      var r = p.r, r2 = d.id === 'tru' ? p.r : d.id === 'non' ? 0 : p.r2, hh = p.h, l = Math.sqrt(hh * hh + (r - r2) * (r - r2));
      if (d.id === 'tru') {
        h.push('Mặt xung quanh trải ra là <b>hình chữ nhật</b> ' + so(2 * PI * r) + ' × ' + so(hh) + ' (dài = chu vi đáy 2πr).');
        h.push('S<sub>xq</sub> = 2πrh ≈ <b>' + so(2 * PI * r * hh) + '</b>; S<sub>tp</sub> = 2πrh + 2πr² ≈ <b>' + so(2 * PI * r * hh + 2 * PI * r * r) + '</b>');
        h.push('V = πr²h ≈ <b>' + so(PI * r * r * hh) + '</b>');
      } else if (d.id === 'non') {
        var goc = 360 * r / l;
        h.push('Mặt xung quanh trải ra là <b>hình quạt</b> bán kính l = ' + so(l) + ' (đường sinh), góc ở tâm ' + so(goc, 1) + '° (= 360°·r/l).');
        h.push('S<sub>xq</sub> = πrl ≈ <b>' + so(PI * r * l) + '</b>; S<sub>tp</sub> = πrl + πr² ≈ <b>' + so(PI * r * l + PI * r * r) + '</b>');
        h.push('V = ⅓πr²h ≈ <b>' + so(PI * r * r * hh / 3) + '</b>');
      } else {
        h.push('Mặt xung quanh trải ra là <b>hình vành khuyên cắt</b> (phần của hình quạt), đường sinh l = ' + so(l) + '.');
        h.push('S<sub>xq</sub> = π(r + r′)l ≈ <b>' + so(PI * (r + r2) * l) + '</b>; S<sub>tp</sub> ≈ <b>' + so(PI * (r + r2) * l + PI * (r * r + r2 * r2)) + '</b>');
        h.push('V = ⅓πh(r² + rr′ + r′²) ≈ <b>' + so(PI * hh * (r * r + r * r2 + r2 * r2) / 3) + '</b>');
      }
    } else {
      var soCanh = Object.keys(K.C).length;
      h.push('<b>' + K.V.length + '</b> đỉnh · <b>' + soCanh + '</b> cạnh · <b>' + K.F.length + '</b> mặt  (Ơ-le: Đ − C + M = ' + (K.V.length - soCanh + K.F.length) + ')');
      var day = K.F.filter(function (f) { return f.g === 'day' || f.g === 'tren'; }).reduce(function (s, f) { return s + f.dt; }, 0);
      if (day) h.push('S<sub>xq</sub> ≈ <b>' + so(Stp - day) + '</b>; S<sub>tp</sub> ≈ <b>' + so(Stp) + '</b>');
      else h.push('Tổng diện tích các mặt S<sub>tp</sub> ≈ <b>' + so(Stp) + '</b>');
      h.push('Thể tích V ≈ <b>' + so(Vt) + '</b>');
      h.push('Mô hình có <b>' + (K.F.length - 1) + '</b> nếp gấp (nét đứt) · ' + (Object.keys(K.C).length - K.F.length + 1) + ' cặp cạnh dán (ô xanh ngọc).');
    }
    return h.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  }

  // ------------------------------------------------------------------ giao diện
  var hop, cv3, cv2, g3, g2, W3, H3, W2, H2, dpr = 1, raf = 0;
  var NHOM_KHOI = [
    ['Đa diện đều', ['lap', 'tudien', 'batdien', 'thapnhi', 'nhithap']],
    ['Lăng trụ · hộp', ['hop', 'langtru']],
    ['Hình chóp', ['chop', 'chopSA', 'chopcut', 'tdvuong']],
    ['Tròn xoay', ['tru', 'non', 'noncut']],
    ['Tuỳ ý', ['toado']]
  ];
  var BIEU = { lap: '🧊', hop: '📦', langtru: '🔻', chop: '🔺', chopSA: '📐', chopcut: '🏺', tudien: '🔷', tdvuong: '📏', batdien: '💠', thapnhi: '⚽', nhithap: '🎲', tru: '🥫', non: '🍦', noncut: '🪣', toado: '✏️' };
  function taoGiaoDien() {
    hop = document.createElement('section'); hop.id = 'xuong'; hop.className = 'an'; hop.setAttribute('aria-label', 'Xưởng khai triển hình');
    var ten = function (id) { return DM.filter(function (d) { return d.id === id; })[0].ten; };
    hop.innerHTML =
      '<div class="xt-dau"><div class="xt-logo">📦</div><div><h2>Xưởng khai triển hình</h2><p>Mở phẳng · đóng khối · in mô hình giấy để gấp tại lớp</p></div></div>' +
      '<div class="xt-chon"><div class="tr-khoi">' + NHOM_KHOI.map(function (g) { return '<div class="xt-nhom"><span class="xt-nhan">' + g[0] + '</span>' + g[1].map(function (id) { return '<button type="button" data-k="' + id + '"><i>' + BIEU[id] + '</i><b>' + esc(ten(id)) + '</b></button>'; }).join('') + '</div>'; }).join('') + '</div></div>' +
      '<div class="xt-tham"><div class="tr-ts"></div><div class="tr-tc"><label><input type="checkbox" data-tc="dan" checked> Ô dán</label><label><input type="checkbox" data-tc="canh" checked> Số đo cạnh</label><label><input type="checkbox" data-tc="so" checked> Đánh số mặt</label></div></div>' +
      '<div class="xt-san">' +
        '<div class="xt-c3"><div class="tr-3d"><canvas></canvas>' +
          '<div class="xt-dungcu"><div class="tr-goc">' + [['truoc', 'Trước'], ['sau', 'Sau'], ['trai', 'Trái'], ['phai', 'Phải'], ['tren', 'Trên'], ['duoi', 'Dưới'], ['cheo', 'Chéo']].map(function (g) { return '<button type="button" data-g="' + g[0] + '">' + g[1] + '</button>'; }).join('') + '</div>' +
          '<select data-s="pc" aria-label="Kiểu chiếu"><option value="1">Phối cảnh</option><option value="0">Song song</option></select>' +
          '<select data-s="nen" aria-label="Màu nền"><option value="macdinh">Nền đêm xanh</option><option value="sang">Nền xám nhạt</option><option value="trang">Nền trắng</option><option value="luoi">Giấy ô li</option></select>' +
          '<label class="tr-tx"><input type="checkbox" data-tc="xoay"> Tự xoay</label></div>' +
          '<div class="tr-goi3">Kéo để xoay · lăn chuột hoặc chụm 2 ngón để phóng to · chuột phải / 2 ngón để dời</div></div></div>' +
        '<div class="xt-c2"><div class="tr-luoi"><canvas></canvas><div class="tr-goi">Mô hình phẳng · <b>nét liền</b> = cắt · <b>nét đứt</b> = gấp · <b>vùng xanh ngọc</b> = ô dán. Bấm một mặt để xem nó trên khối. Lăn chuột / chụm 2 ngón để phóng to.</div><div class="tr-chong an">⚠ Mô hình này có mặt chồng nhau — bấm <b>Kiểu khác</b>.</div></div>' +
          '<div class="xt-info"><ul class="tr-tt"></ul><div class="tr-nut"><button type="button" data-l="khac" title="Tìm một kiểu mở phẳng khác của cùng khối">🔀 Kiểu khác</button><button type="button" data-l="goc" title="Chọn mặt làm đáy cố định (bấm một mặt trên mô hình rồi bấm nút này)">⬇ Chọn đáy</button><button type="button" data-l="datlai" title="Đưa hai hình về vị trí và cỡ ban đầu">⟲ Căn lại</button><button type="button" data-l="in" class="chinh" title="In mô hình ra giấy A4 để cắt, gấp, dán">🖨 In mô hình</button><button type="button" data-l="svg" title="Tải mô hình dạng SVG (nét sắc)">✒ Tải SVG</button></div></div></div>' +
      '</div>' +
      '<div class="xt-dock"><button type="button" data-l="chay" class="chinh tr-chay">▶ Đóng thành khối</button>' +
        '<div class="tr-gap"><span>Mở phẳng</span><input type="range" min="0" max="1000" value="0" aria-label="Mức đóng khối"><span>Đóng khối</span></div>' +
        '<button type="button" data-l="png" title="Lưu ảnh hình 3D">🖼 Ảnh 3D</button><button type="button" data-l="toan" title="Toàn màn hình">⛶</button></div>';
    document.body.appendChild(hop);
    cv2 = $('.tr-luoi canvas', hop); cv3 = $('.tr-3d canvas', hop); g2 = cv2.getContext('2d'); g3 = cv3.getContext('2d');
    hop.addEventListener('click', bam);
    hop.addEventListener('change', doi);
    hop.addEventListener('input', function (e) { if (e.target.type === 'range') { dungChay(); T.gap = e.target.value / 1000; capNhatNutChay(); ve3(); } });
    ganCham3(); ganCham2();
    new ResizeObserver(function () { coGian(); }).observe(hop);
  }
  function veTs() {
    var d = T.dm;
    $$('.tr-khoi button', hop).forEach(function (b) { b.classList.toggle('on', b.dataset.k === d.id); });
    var h = d.toado ? '<label class="tr-o">Toạ độ các đỉnh (mỗi dòng: x y z) — máy tự lấy khối lồi bao các điểm<textarea data-td rows="6" spellcheck="false">' + esc(T.toado) + '</textarea></label><button type="button" data-l="vetd" class="tr-vetd">Dựng khối</button>'
      : '<div class="tr-o-ds">' + d.ts.map(function (t) { return '<label class="tr-o">' + esc(t[1]) + '<input type="number" data-t="' + t[0] + '" value="' + T.ts[t[0]] + '" min="' + (t[3] ? 3 : 0.1) + '" max="' + (t[3] ? 12 : 100) + '" step="' + (t[3] ? 1 : 0.5) + '" inputmode="decimal"></label>'; }).join('') + '</div>';
    $('.tr-ts', hop).innerHTML = h + (T.loi ? '<p class="tr-loi">⚠ ' + esc(T.loi) + '</p>' : '');
  }
  function chonKhoi(id) {
    var d = DM.filter(function (x) { return x.id === id; })[0] || DM[0];
    T.dm = d; T.ts = {}; d.ts.forEach(function (t) { T.ts[t[0]] = t[2]; });
    T.goc = -1; T.cay = null; T.chon = -1; T.loi = '';
    datLaiCam(); dung(); veTs();
  }
  function dung() {
    try {
      T.K = dungKhoi(); T.loi = '';
      var Fg = T.K.F[T.goc];
      if (T.K.cong) { if (!Fg || !/^(day|tren)$/.test(Fg.g)) T.goc = T.K.F.findIndex(function (f) { return f.g === 'day'; }); }
      else if (!Fg) {   // mặc định: mặt đáy (pháp tuyến hướng xuống nhất) nằm yên khi trải
        var tot = 0; T.K.F.forEach(function (f, i) { if (f.n.z < T.K.F[tot].n.z - 1e-9) tot = i; }); T.goc = tot;
      }
      datGoc(T.K, T.goc);
      T.cay = null; chonCay(false);
    } catch (e) { T.loi = e.message; }
    $('.tr-tt', hop).innerHTML = T.K && !T.loi ? thongTin() : '';
    $('.tr-chong', hop).classList.toggle('an', !(T.lu && T.lu.chong));
    $$('[data-l="goc"]', hop).forEach(function (b) { b.disabled = !!(T.K && T.K.cong); });
    ve2(); ve3();
  }
  function bam(e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { chonKhoi(b.dataset.k); return; }
    if (b.dataset.g) { datGocNhin(b.dataset.g); return; }
    var l = b.dataset.l;
    if ((!T.K || T.loi) && l !== 'vetd') return;
    if (l === 'khac') { if (T.K.cong) { var muon = T.K.F[T.goc].g === 'day' && T.K.F.some(function (f) { return f.g === 'tren'; }) ? 'tren' : 'day'; T.goc = T.K.F.findIndex(function (f) { return f.g === muon; }); datGoc(T.K, T.goc); T.cay = null; chonCay(false); } else chonCay(true); T.chon = -1; datLaiLuoi(); ve2(); ve3(); $('.tr-chong', hop).classList.toggle('an', !T.lu.chong); }
    else if (l === 'goc') {
      if (T.K.cong) return;
      T.goc = T.chon >= 0 && T.chon !== T.goc ? T.chon : (T.goc + 1) % T.K.F.length;
      datGoc(T.K, T.goc); T.cay = null; chonCay(false); T.chon = -1; datLaiLuoi(); $('.tr-chong', hop).classList.toggle('an', !T.lu.chong); ve2(); ve3();
    }
    else if (l === 'datlai') { datLaiCam(); ve2(); ve3(); }
    else if (l === 'chay') chay();
    else if (l === 'png') taiPNG();
    else if (l === 'svg') taiSVG();
    else if (l === 'in') inLuoi();
    else if (l === 'vetd') { var ta = $('[data-td]', hop); T.toado = ta.value; T.goc = -1; T.cay = null; datLaiCam(); dung(); veTs(); }
    else if (l === 'toan') { var el = $('.xt-san', hop); if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); }
  }
  function doi(e) {
    var x = e.target;
    if (x.dataset.t) { var v = parseFloat(String(x.value).replace(',', '.')), t = T.dm.ts.filter(function (q) { return q[0] === x.dataset.t; })[0]; if (!(v > 0)) return; if (t[3]) v = Math.max(3, Math.min(12, Math.round(v))); T.ts[x.dataset.t] = v; if (T.dm.id === 'noncut' && T.ts.r2 >= T.ts.r) T.ts.r2 = Math.round(T.ts.r * 0.5 * 100) / 100; if (T.dm.id === 'chopcut' && T.ts.b >= T.ts.a) T.ts.b = Math.round(T.ts.a * 0.5 * 100) / 100; T.cay = null; dung(); veTs(); return; }
    if (x.dataset.tc === 'xoay') { T.tuXoay = x.checked; if (T.tuXoay) vongXoay(); return; }
    if (x.dataset.tc) { T.tuyChon[x.dataset.tc] = x.checked; ve2(); return; }
    if (x.dataset.s === 'pc') { T.phoiCanh = x.value === '1'; ve3(); return; }
    if (x.dataset.s === 'nen') { T.nen = x.value; ve3(); return; }
  }

  // ------------------------------------------------------------------ gấp / trải động
  function capNhatNutChay() {
    var b = $('.tr-chay', hop); b.textContent = T.chay ? '⏸ Dừng' : T.gap > 0.5 ? '▶ Mở phẳng' : '▶ Đóng thành khối';
    $('.tr-gap input', hop).value = Math.round(T.gap * 1000);
  }
  function dungChay() { if (T.chay) { cancelAnimationFrame(T.chay.id); T.chay = null; capNhatNutChay(); } }
  function chay() {
    if (T.chay) { dungChay(); return; }
    var tu = T.gap, den = T.gap > 0.5 ? 0 : 1, t0 = performance.now(), lau = 2600 * Math.abs(den - tu) + 200;
    T.chay = {};
    var buoc = function (now) {
      var k = Math.min(1, (now - t0) / lau), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      T.gap = tu + (den - tu) * e; $('.tr-gap input', hop).value = Math.round(T.gap * 1000); ve3();
      if (k < 1) T.chay.id = requestAnimationFrame(buoc); else { T.chay = null; capNhatNutChay(); }
    };
    T.chay.id = requestAnimationFrame(buoc); capNhatNutChay();
  }
  function tGapMat(i) {   // gấp lần lượt: nếp gần gốc gấp trước, nếp xa gấp sau (mặt cong: gấp đều)
    var c = T.cay, t = T.gap; if (T.K.cong || !c.sauMax) return t;
    var n = c.sauMax, d = c.sau[i] - 1, dai_ = 1 / (1 + (n - 1) * 0.45), bd = d * 0.45 * dai_;
    return Math.max(0, Math.min(1, (t - bd) / dai_));
  }
  function viTriGap() {   // như viTriMat nhưng mỗi nếp có mức gấp riêng
    var K = T.K, cay = T.cay, M = [], kq = [];
    cay.thuTu.forEach(function (i) {
      var c = cay.cha[i];
      if (!c) M[i] = MT_DV();
      else { var ab = c.key.split(',').map(Number), a = K.W[ab[0]], e = don(tru(K.W[ab[1]], a)); M[i] = ghep(M[c.f], quayTruc(a, e, cay.phi[i] * (1 - tGapMat(i)))); }
      kq[i] = { p: K.F[i].v.map(function (v) { return ap(M[i], K.W[v]); }), n: apR(M[i].R, K.Fn[i]) };
    });
    return kq;
  }
  var xoayId = 0;
  function vongXoay() { cancelAnimationFrame(xoayId); var truoc = performance.now(); var b = function (now) { if (!T.tuXoay || hop.classList.contains('an')) return; T.cam.yaw += (now - truoc) * 0.0004; truoc = now; ve3(); xoayId = requestAnimationFrame(b); }; xoayId = requestAnimationFrame(b); }

  // ------------------------------------------------------------------ vẽ 3D
  function datLaiCam() { T.cam = { yaw: -0.55, pitch: 0.62, zoom: 1, ox: 0, oy: 0 }; datLaiLuoi(); }
  function datLaiLuoi() { T.luoi = { zoom: 1, ox: 0, oy: 0 }; }
  function datGocNhin(g) {
    var c = T.cam, G = { truoc: [0, 0.02], sau: [Math.PI, 0.02], trai: [Math.PI / 2, 0.02], phai: [-Math.PI / 2, 0.02], tren: [0, Math.PI / 2], duoi: [0, -Math.PI / 2], cheo: [-0.55, 0.62] }[g];
    c.yaw = G[0]; c.pitch = G[1]; ve3();
  }
  function chieu3(p, c) {
    var cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    var x = p.x * cy - p.y * sy, y = p.x * sy + p.y * cy;
    return { X: x, Y: y * sp + p.z * cp, d: y * cp - p.z * sp };
  }
  function ve3() {
    if (!g3 || !W3 || !T.K || T.loi) { if (g3 && W3) { g3.clearRect(0, 0, W3, H3); } return; }
    var g = g3, c = T.cam, K = T.K;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var toi = false;   // nét viền luôn đậm để rõ trên màu mặt
    if (T.nen === 'trang') { g.fillStyle = '#fff'; g.fillRect(0, 0, W3, H3); }
    else if (T.nen === 'sang') { g.fillStyle = '#e6ecf3'; g.fillRect(0, 0, W3, H3); }
    else if (T.nen === 'luoi') { g.fillStyle = '#fffdf7'; g.fillRect(0, 0, W3, H3); }
    else {   // đêm xanh + chấm sao mờ
      var gr = g.createLinearGradient(0, 0, W3, H3); gr.addColorStop(0, '#0b1220'); gr.addColorStop(1, '#17315a'); g.fillStyle = gr; g.fillRect(0, 0, W3, H3);
      g.fillStyle = 'rgba(255,255,255,.16)'; for (var sx = 18; sx < W3; sx += 46) for (var sy = 18; sy < H3; sy += 46) g.fillRect(sx, sy, 2, 2);
    }
    // cỡ: vừa cả lưới trải phẳng lẫn khối
    var R = 0; T.lu.mat.forEach(function (P) { P.forEach(function (q) { R = Math.max(R, Math.hypot(q.x, q.y)); }); }); K.W.forEach(function (p) { R = Math.max(R, dai(p)); });
    var s = Math.min(W3, H3) / (2.25 * R) * c.zoom, D = 4.2 * R, cx = W3 / 2 + c.ox, cyy = H3 * 0.54 + c.oy;
    var hc = function (p) { var q = chieu3(p, c), f = T.phoiCanh ? D / (D + q.d) : 1; return { x: cx + q.X * s * f, y: cyy - q.Y * s * f, d: q.d }; };
    if (T.nen === 'luoi') {   // lưới sàn
      g.strokeStyle = 'rgba(15,118,110,.2)'; g.lineWidth = 1; var b = Math.ceil(R * 1.3);
      for (var k = -b; k <= b; k++) { var a1 = hc(V(k, -b, 0)), a2 = hc(V(k, b, 0)), b1 = hc(V(-b, k, 0)), b2 = hc(V(b, k, 0)); g.beginPath(); g.moveTo(a1.x, a1.y); g.lineTo(a2.x, a2.y); g.moveTo(b1.x, b1.y); g.lineTo(b2.x, b2.y); g.stroke(); }
    }
    var vt = viTriGap(), L = don(V(0.35, -0.5, 0.8)), cam = V(0, 0, 0);
    var ds = vt.map(function (m, i) {
      var P = m.p.map(hc), dd = 0; P.forEach(function (q) { dd += q.d; });
      return { i: i, P: P, d: dd / P.length, n: m.n };
    });
    ds.sort(function (a, b) { return b.d - a.d; });
    // hướng nhìn (để biết đang thấy mặt trong hay mặt ngoài)
    var cp = Math.cos(c.pitch);
    cam = V(-cp * Math.sin(c.yaw), -cp * Math.cos(c.yaw), Math.sin(c.pitch));   // hướng từ khối tới mắt
    ds.forEach(function (o) {
      var f = K.F[o.i], nhom = f.nhom, mau = MAU[nhom % MAU.length], ngoai = vh(o.n, cam) >= 0;
      var sang = 0.8 + 0.2 * Math.abs(vh(o.n, L)); if (!ngoai) sang *= 0.9;
      var noi = T.chon >= 0 && (T.K.cong ? K.F[T.chon].nhom === nhom : T.chon === o.i), luot = T.hover >= 0 && (T.K.cong ? K.F[T.hover].nhom === nhom : T.hover === o.i);
      g.beginPath(); o.P.forEach(function (q, k) { if (k) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); g.closePath();
      g.fillStyle = toMau(noi ? '#fdba74' : luot ? '#fed7aa' : mau, sang); g.fill();
      if (K.cong) { g.strokeStyle = g.fillStyle; g.lineWidth = 0.8; g.stroke(); }
      // cạnh (bỏ nếp ẩn của mặt cong)
      g.strokeStyle = toi ? 'rgba(255,255,255,.85)' : 'rgba(30,26,46,.82)'; g.lineWidth = 1.4;
      g.beginPath();
      f.v.forEach(function (a, k) { var b2 = f.v[(k + 1) % f.v.length], key = Math.min(a, b2) + ',' + Math.max(a, b2); if (K.tron[key]) return; var p = o.P[k], q = o.P[(k + 1) % o.P.length]; g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); });
      g.stroke();
    });
  }
  function toMau(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; return 'rgb(' + Math.round(r * k) + ',' + Math.round(gg * k) + ',' + Math.round(b * k) + ')'; }

  // ------------------------------------------------------------------ vẽ lưới 2D
  function khungLuoi(W, H, le, duoi) {   // phép đổi toạ độ lưới -> màn hình (duoi: chừa thêm phía dưới cho dòng hướng dẫn)
    duoi = duoi || 0;
    var h = T.lu.hop, s = Math.min((W - 2 * le) / (h.x1 - h.x0 || 1), (H - 2 * le - duoi) / (h.y1 - h.y0 || 1));
    return { s: s, x: W / 2 - (h.x0 + h.x1) / 2 * s, y: (H - duoi) / 2 - (h.y0 + h.y1) / 2 * s };
  }
  function veLuoiLen(g, W, H, opt) {   // dùng chung: màn hình, PNG, SVG (qua đối tượng vẽ giả)
    var lu = T.lu, K = T.K, k = khungLuoi(W, H, opt.le || 24, opt.duoi), z = opt.zoom || 1;
    var s = k.s * z, ox = W / 2 + ((k.x - W / 2) * z) + (opt.ox || 0), oy = H / 2 + ((k.y - H / 2) * z) + (opt.oy || 0);
    var M = function (p) { return { x: ox + p.x * s, y: oy + p.y * s }; };
    var duong = function (P, kin) { g.beginPath(); P.forEach(function (p, i) { var q = M(p); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); if (kin) g.closePath(); };
    var co_ = opt.coChu || 1;
    if (T.tuyChon.dan) lu.dan.forEach(function (d) { duong(d.P, true); g.fillStyle = opt.inDen ? '#eefaf7' : '#c7f0e8'; g.fill(); g.strokeStyle = '#0f766e'; g.lineWidth = 1.2 * co_; g.setLineDash([]); g.stroke(); });
    lu.mat.forEach(function (P, i) {
      var f = K.F[i], noi = T.chon >= 0 && (K.cong ? K.F[T.chon].nhom === f.nhom : T.chon === i), luot = T.hover >= 0 && (K.cong ? K.F[T.hover].nhom === f.nhom : T.hover === i);
      duong(P, true); g.fillStyle = noi ? '#fbbf24' : luot ? '#fde68a' : (opt.inDen ? '#fff' : MAU[f.nhom % MAU.length]); g.fill();
      if (K.cong) { g.strokeStyle = g.fillStyle; g.lineWidth = 0.8; g.setLineDash([]); g.stroke(); }
    });
    // nếp gấp: nét đứt
    g.strokeStyle = '#0f766e'; g.lineWidth = 1.6 * co_; g.setLineDash([9 * co_, 5 * co_]);
    g.beginPath(); lu.nep.forEach(function (n) { if (n.an) return; var a = M(n.a), b = M(n.b); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); }); g.stroke();
    // mép dán gắn vào mặt: chỗ gắn cũng là nếp gấp
    if (T.tuyChon.dan) { g.beginPath(); lu.dan.forEach(function (d) { var a = M(d.P[0]), b = M(d.P[1]); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); }); g.stroke(); }
    // nét cắt: nét liền
    g.setLineDash([]); g.strokeStyle = '#0f172a'; g.lineWidth = 2.4 * co_;
    var daDan = {}; if (T.tuyChon.dan) lu.dan.forEach(function (d) { daDan[d.P[0].x.toFixed(6) + ',' + d.P[0].y.toFixed(6) + ',' + d.P[1].x.toFixed(6) + ',' + d.P[1].y.toFixed(6)] = 1; });
    g.beginPath(); lu.cat.forEach(function (o) { if (daDan[o.a.x.toFixed(6) + ',' + o.a.y.toFixed(6) + ',' + o.b.x.toFixed(6) + ',' + o.b.y.toFixed(6)]) return; var a = M(o.a), b = M(o.b); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); }); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    // số hiệu mặt
    if (T.tuyChon.so) K.nhom.forEach(function (nh, j) {
      var fi = nh.f[0];
      if (nh.f.length > 1) {   // mặt cong: lấy dải gần trọng tâm nhóm
        var c = { x: 0, y: 0 }, A = 0; nh.f.forEach(function (i) { var a = K.F[i].dt; c.x += lu.tamMat[i].x * a; c.y += lu.tamMat[i].y * a; A += a; }); c.x /= A; c.y /= A;
        var tot = Infinity; nh.f.forEach(function (i) { var d = Math.hypot(lu.tamMat[i].x - c.x, lu.tamMat[i].y - c.y); if (d < tot) { tot = d; fi = i; } });
      }
      var q = M(lu.tamMat[fi]), cz = Math.max(11, Math.min(26, s * Math.sqrt(K.F[fi].dt * (nh.f.length > 1 ? nh.f.length : 1)) * 0.22)) * co_;
      var h2 = cz * 0.78, v = h2 * 0.38; g.beginPath(); g.moveTo(q.x - h2 + v, q.y - h2); g.lineTo(q.x + h2 - v, q.y - h2); g.lineTo(q.x + h2, q.y - h2 + v); g.lineTo(q.x + h2, q.y + h2 - v); g.lineTo(q.x + h2 - v, q.y + h2); g.lineTo(q.x - h2 + v, q.y + h2); g.lineTo(q.x - h2, q.y + h2 - v); g.lineTo(q.x - h2, q.y - h2 + v); g.closePath(); g.fillStyle = opt.inDen ? '#fff' : '#0f766e'; g.fill(); g.lineWidth = 1.4 * co_; g.strokeStyle = '#0f766e'; g.setLineDash([]); g.stroke();
      g.font = '800 ' + cz + 'px system-ui, Segoe UI, Arial'; g.fillStyle = opt.inDen ? '#0f766e' : '#fff'; g.fillText(String(j + 1), q.x, q.y);
      var nhan = K.cong ? ({ day: T.dm.id === 'non' ? 'đáy' : 'đáy', tren: 'đáy trên', xq: 'mặt xung quanh' })[nh.g] : '';
      if (nhan) { g.font = '700 ' + Math.max(10, cz * 0.5) + 'px system-ui, Segoe UI, Arial'; g.fillStyle = '#134e4a'; g.fillText(nhan, q.x, q.y + cz * 1.05); }
    });
    // độ dài cạnh
    if (T.tuyChon.canh) {
      g.font = '600 ' + (11.5 * co_) + 'px system-ui, Segoe UI, Arial';
      var ghi = function (a, b, t, tam) {
        var A = M(a), B = M(b), mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        if (tam) { var C = M(tam); if ((C.x - mx) * nx + (C.y - my) * ny < 0) { nx = -nx; ny = -ny; } }   // ghi vào phía trong mặt
        var goc = Math.atan2(dy, dx); if (goc > Math.PI / 2) goc -= Math.PI; if (goc < -Math.PI / 2) goc += Math.PI;
        g.save(); g.translate(mx + nx * 11 * co_, my + ny * 11 * co_); g.rotate(goc); g.fillStyle = '#9a3412'; g.fillText(t, 0, 0); g.restore();
      };
      lu.nhanCanh.forEach(function (n) { ghi(n.a, n.b, n.t, n.f != null ? lu.tamMat[n.f] : null); });
      if (K.cong) {   // trụ, nón: ghi kích thước chính
        var p = T.ts, d = T.dm.id, l = Math.sqrt(p.h * p.h + Math.pow(p.r - (d === 'tru' ? p.r : d === 'non' ? 0 : p.r2), 2));
        lu.cat.forEach(function (o) { if (!o.ghi && K.F[o.f].g === 'xq') { var ab = o.key.split(',').map(Number), dl = dai(tru(K.W[ab[0]], K.W[ab[1]])); if (dl > 0.3 * l && !ghi.da) { ghi.da = 1; ghi(o.a, o.b, (d === 'tru' ? 'h = ' : 'l = ') + so(d === 'tru' ? p.h : l), lu.tamMat[o.f]); } } });
        K.nhom.forEach(function (nh) { if (nh.g === 'xq') return; var f = nh.f[0], q = M(lu.tamMat[f]), r = nh.g === 'day' ? p.r : (d === 'tru' ? p.r : p.r2); g.fillStyle = '#9a3412'; g.fillText('r = ' + so(r), q.x, q.y + 30 * co_); });
      }
    }
    return { s: s, ox: ox, oy: oy };
  }
  function ve2() {
    if (!g2 || !W2) return;
    var g = g2; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W2, H2);
    g.fillStyle = '#fffdf7'; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = 'rgba(15,118,110,.10)'; g.lineWidth = 1; g.beginPath();
    for (var gx = 0; gx < W2; gx += 24) { g.moveTo(gx + .5, 0); g.lineTo(gx + .5, H2); } for (var gy = 0; gy < H2; gy += 24) { g.moveTo(0, gy + .5); g.lineTo(W2, gy + .5); } g.stroke();
    if (!T.K || T.loi || !T.lu) { g.fillStyle = '#b91c1c'; g.font = '600 14px system-ui'; g.textAlign = 'center'; g.fillText(T.loi || '', W2 / 2, H2 / 2); return; }
    T.k2 = veLuoiLen(g, W2, H2, { le: 22, duoi: 40, zoom: T.luoi.zoom, ox: T.luoi.ox, oy: T.luoi.oy });
  }
  function matTai(m) {   // mặt của lưới tại điểm màn hình
    if (!T.k2) return -1;
    var p = { x: (m.x - T.k2.ox) / T.k2.s, y: (m.y - T.k2.oy) / T.k2.s }, P = T.lu.mat;
    for (var i = P.length - 1; i >= 0; i--) { var A = P[i], trong = false; for (var j = 0, k = A.length - 1; j < A.length; k = j++) { if (((A[j].y > p.y) !== (A[k].y > p.y)) && (p.x < (A[k].x - A[j].x) * (p.y - A[j].y) / (A[k].y - A[j].y) + A[j].x)) trong = !trong; } if (trong) return i; }
    return -1;
  }

  // ------------------------------------------------------------------ chuột / cảm ứng
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
      if (bd.hai && p.length >= 2) { var kc = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), m = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; c.zoom = Math.max(0.3, Math.min(6, bd.c.zoom * kc / bd.kc)); c.ox = bd.c.ox + m.x - bd.m.x; c.oy = bd.c.oy + m.y - bd.m.y; }
      else if (!bd.hai) { var dx = p[0].x - bd.m.x, dy = p[0].y - bd.m.y; if (bd.dich) { c.ox = bd.c.ox + dx; c.oy = bd.c.oy + dy; } else { c.yaw = bd.c.yaw - dx * 0.008; c.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bd.c.pitch + dy * 0.008)); } }
      ve3();
    });
    var tha = function (e) { delete ngon[e.pointerId]; var p = Object.keys(ngon).map(function (k) { return ngon[k]; }); bd = p.length === 1 ? { m: p[0], c: Object.assign({}, T.cam) } : null; };
    cv3.addEventListener('pointerup', tha); cv3.addEventListener('pointercancel', tha);
    cv3.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv3.addEventListener('wheel', function (e) { e.preventDefault(); T.cam.zoom = Math.max(0.3, Math.min(6, T.cam.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); ve3(); }, { passive: false });
  }
  function ganCham2() {
    var ngon = {}, bd = null, di = false;
    var diem = function (e) { var r = cv2.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv2.addEventListener('pointerdown', function (e) {
      try { cv2.setPointerCapture(e.pointerId); } catch (x) { }
      ngon[e.pointerId] = diem(e); var p = Object.keys(ngon).map(function (k) { return ngon[k]; }); di = false;
      if (p.length === 1) bd = { m: p[0], v: Object.assign({}, T.luoi) };
      else bd = { kc: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, m: { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }, v: Object.assign({}, T.luoi), hai: true };
      cv2.style.cursor = 'grabbing';
    });
    cv2.addEventListener('pointermove', function (e) {
      var m = diem(e);
      if (!ngon[e.pointerId] || !bd) { var h = matTai(m); if (h !== T.hover) { T.hover = h; ve2(); ve3(); } return; }
      ngon[e.pointerId] = m;
      var p = Object.keys(ngon).map(function (k) { return ngon[k]; }), L = T.luoi;
      if (bd.hai && p.length >= 2) { var kc = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mm = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; phongLuoi(bd.v, kc / bd.kc, bd.m, mm); di = true; }
      else if (!bd.hai) { if (Math.hypot(m.x - bd.m.x, m.y - bd.m.y) > 4) di = true; if (di) { L.ox = bd.v.ox + m.x - bd.m.x; L.oy = bd.v.oy + m.y - bd.m.y; } }
      ve2();
    });
    var tha = function (e) {
      var m = ngon[e.pointerId]; delete ngon[e.pointerId]; cv2.style.cursor = '';
      if (!Object.keys(ngon).length) { if (!di && m) { var f = matTai(m); T.chon = f === T.chon ? -1 : f; ve2(); ve3(); } bd = null; }
      else { var p = Object.keys(ngon).map(function (k) { return ngon[k]; }); bd = { m: p[0], v: Object.assign({}, T.luoi) }; di = true; }
    };
    cv2.addEventListener('pointerup', tha); cv2.addEventListener('pointercancel', tha);
    cv2.addEventListener('pointerleave', function () { if (T.hover >= 0) { T.hover = -1; ve2(); ve3(); } });
    cv2.addEventListener('wheel', function (e) { e.preventDefault(); var m = diem(e); phongLuoi(Object.assign({}, T.luoi), e.deltaY < 0 ? 1.12 : 1 / 1.12, m, m); ve2(); }, { passive: false });
  }
  function phongLuoi(v0, k, m0, m1) {   // phóng quanh điểm m0 (rồi dời tới m1)
    var L = T.luoi, z = Math.max(0.3, Math.min(8, v0.zoom * k)), r = z / v0.zoom;
    // điểm màn hình X = W/2 + (X0 - W/2)·zoom + ox  → giữ điểm dưới ngón cố định
    L.ox = m1.x - W2 / 2 - (m0.x - W2 / 2 - v0.ox) * r; L.oy = m1.y - H2 / 2 - (m0.y - H2 / 2 - v0.oy) * r; L.zoom = z;
  }

  // ------------------------------------------------------------------ cỡ khung
  function coGian() {
    if (!hop || hop.classList.contains('an')) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    [[cv2, 2], [cv3, 3]].forEach(function (x) {
      var c = x[0], r = c.parentNode.getBoundingClientRect(), w = Math.max(10, Math.floor(r.width)), h = Math.max(10, Math.floor(r.height));
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      if (x[1] === 2) { W2 = w; H2 = h; } else { W3 = w; H3 = h; }
    });
    ve2(); ve3();
  }

  // ------------------------------------------------------------------ xuất: PNG 3D, SVG lưới, in A4
  function tenTep() { return 'trai-hinh_' + T.dm.ten.replace(/[^\wÀ-ỹ]+/g, '-').replace(/-+$/, ''); }
  function taiPNG() { cv3.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = tenTep() + '.png'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }); }
  function svgLuoi(rongMM, caoMM) {   // lưới dạng SVG; rongMM/caoMM: khổ giấy (để in đúng tỉ lệ)
    var lu = T.lu, h = lu.hop, w = h.x1 - h.x0, hh = h.y1 - h.y0;
    var W = rongMM || 800, H = caoMM || Math.round(800 * hh / w + 40), le = rongMM ? 0 : 20;
    // vẽ qua "bút ghi SVG" giả lập API canvas
    var ra = [], duong = '', kieu = {}, dash = [];
    var g = {
      beginPath: function () { duong = ''; }, moveTo: function (x, y) { duong += 'M' + x.toFixed(2) + ' ' + y.toFixed(2); }, lineTo: function (x, y) { duong += 'L' + x.toFixed(2) + ' ' + y.toFixed(2); }, closePath: function () { duong += 'Z'; },
      setLineDash: function (d) { dash = d; }, fill: function () { ra.push('<path d="' + duong + '" fill="' + this.fillStyle + '"/>'); },
      stroke: function () { if (duong) ra.push('<path d="' + duong + '" fill="none" stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '"' + (dash.length ? ' stroke-dasharray="' + dash.join(' ') + '"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>'); },
      save: function () { kieu = { t: this._t, r: this._r }; }, restore: function () { this._t = null; this._r = 0; }, translate: function (x, y) { this._t = [x, y]; }, rotate: function (r) { this._r = r; },
      fillText: function (t, x, y) {
        var fs = parseFloat(/(\d+(\.\d+)?)px/.exec(this.font)[1]), w8 = /800/.test(this.font) ? 800 : 600;
        var tf = this._t ? ' transform="translate(' + (this._t[0] + x).toFixed(2) + ' ' + (this._t[1] + y).toFixed(2) + ') rotate(' + (this._r * 180 / Math.PI).toFixed(1) + ')"' : ' x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '"';
        ra.push('<text' + tf + ' font-size="' + fs.toFixed(2) + '" font-weight="' + w8 + '" fill="' + this.fillStyle + '" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">' + esc(t) + '</text>');
      },
      fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '12px Arial', textAlign: 'center', textBaseline: 'middle', fillRect: function () { }
    };
    var opt = { le: le, coChu: rongMM ? 0.35 : 1 };
    if (rongMM) opt.le = 6;
    veLuoiLen(g, W, H, opt);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '"' + (rongMM ? ' width="' + W + 'mm" height="' + H + 'mm"' : ' width="' + W + '" height="' + H + '"') + '><rect width="100%" height="100%" fill="#fff"/>' + ra.join('') + '</svg>';
  }
  function taiSVG() { var b = new Blob([svgLuoi()], { type: 'image/svg+xml' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = tenTep() + '_luoi.svg'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  function inLuoi() {
    var h = T.lu.hop, w = h.x1 - h.x0, hh = h.y1 - h.y0, ngang = w > hh * 1.15;
    var rong = ngang ? 277 : 190, cao = ngang ? 175 : 262;   // vùng in A4 (mm), chừa chỗ tiêu đề
    var svg = svgLuoi(rong, cao);
    var tl = Math.min((rong - 12) / w, (cao - 12) / hh);   // mm cho 1 đơn vị
    var html = '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Lưới ' + esc(T.dm.ten) + '</title><style>@page{size:A4 ' + (ngang ? 'landscape' : 'portrait') + ';margin:10mm}body{margin:0;font:12px Arial,sans-serif;color:#1e1a2e}h1{font-size:15px;margin:0 0 2px}p{margin:0 0 4px;color:#475569}svg{display:block}</style></head><body>' +
      '<h1>Mô hình khai triển: ' + esc(T.dm.ten) + '</h1><p>Cắt theo <b>nét liền</b> · gấp theo <b>nét đứt</b> · bôi keo vào <b>ô dán</b> (vùng tô nhạt). Tỉ lệ: 1 đơn vị = ' + so(tl / 10, 2) + ' cm.</p>' + svg + '</body></html>';
    var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
    var d = f.contentWindow.document; d.open(); d.write(html); d.close();
    setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } setTimeout(function () { f.remove(); }, 60000); }, 300);
  }

  // ------------------------------------------------------------------ bật / tắt chế độ Trải hình
  var dangMo = false;
  function viTriHop() { var tr = document.querySelector('.tren'); hop.style.top = (tr ? tr.getBoundingClientRect().bottom : 0) + 'px'; }
  function mo() {
    if (!hop) { taoGiaoDien(); chonKhoi('lap'); }
    dangMo = true; hop.classList.remove('an'); document.body.classList.add('che-trai');
    $$('.che-do button').forEach(function (b) { b.classList.toggle('on', b.hasAttribute('data-trai')); });
    viTriHop(); coGian();
    try { var u = new URL(location.href); u.searchParams.set('che-do', 'trai'); history.replaceState(null, '', u); } catch (e) { }
    if (T.tuXoay) vongXoay();
  }
  function dong() {
    if (!dangMo) return; dangMo = false; dungChay();
    hop.classList.add('an'); document.body.classList.remove('che-trai');
    try { var u = new URL(location.href); u.searchParams.delete('che-do'); history.replaceState(null, '', u); } catch (e) { }
    window.dispatchEvent(new Event('resize'));
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.che-do button'); if (!b) return;
    if (b.hasAttribute('data-trai')) { e.stopPropagation(); e.preventDefault(); mo(); }
    else dong();
  }, true);
  window.addEventListener('resize', function () { if (dangMo) { viTriHop(); } });
  if (new URLSearchParams(location.search).get('che-do') === 'trai') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mo); else setTimeout(mo, 0); }
  window.TRAI_HINH = { mo: mo, dong: dong, _T: T, _DM: DM, _kt: { chonKhoi: chonKhoi, viTriMat: viTriMat, dungLuoi: dungLuoi, chonCay: chonCay, svg: svgLuoi } };
})();
