/* khong-gian.js — vẽ hình không gian XOAY ĐƯỢC cho các mô phỏng (canvas, chạy offline).
   const kg = new KhongGian(canvas, {ve: k => {...}, tyLe: 55, goc: [-125, 20], tam: {x,y,z}})
   - Kéo chuột/ngón tay: xoay hình · lăn chuột: phóng to, thu nhỏ · kg.tuXoay(true): tự quay.
   - kg.hc(P) → {px, py, sau}: hình chiếu của điểm P(x, y, z) lên màn hình (sau càng lớn càng ở xa).
   - kg.doan(A,B,o) · kg.muiTen(A,B,o) · kg.diem(P,o) · kg.chu(t,P,o) · kg.daGiac(ds,o) · kg.duongCong(f,t0,t1,o)
   - kg.daDien(dinh, mat, o): vẽ khối đa diện lồi, cạnh khuất tự chuyển nét đứt.
   - kg.gocVuong(P, A, B) · kg.cungGoc(P, A, B, r, o) · kg.truc(L) (trục Oxyz) · kg.mpLuoi(L)
   - V3: phép toán vectơ · catDaDien(dinh, canh, n, d): thiết diện khối lồi với mặt phẳng n·X = d. */
(function () {
const V3 = {
  p: (x, y, z) => ({ x, y, z }),
  c: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  t: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  k: (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  vh: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  ch: (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }),
  dai: a => Math.hypot(a.x, a.y, a.z),
  don: a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l } },
  giua: (a, b, t = .5) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }),
  tb: ds => { const s = ds.reduce((u, p) => V3.c(u, p), { x: 0, y: 0, z: 0 }); return V3.k(s, 1 / ds.length) },
  kc: (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
  // chân đường vuông góc từ P xuống đường thẳng AB
  chanDT: (P, A, B) => { const u = V3.t(B, A), t = V3.vh(V3.t(P, A), u) / V3.vh(u, u); return V3.c(A, V3.k(u, t)) },
  // chân đường vuông góc từ P xuống mặt phẳng qua A có pháp tuyến n
  chanMP: (P, A, n) => { const t = V3.vh(V3.t(P, A), n) / V3.vh(n, n); return V3.t(P, V3.k(n, t)) }
};
window.V3 = V3;

// Thiết diện của khối lồi (danh sách đỉnh + cạnh) với mặt phẳng n·X = d → đa giác đã sắp thứ tự
window.catDaDien = function (dinh, canh, n, d) {
  const eps = 1e-9, ds = [];
  const them = P => { if (!ds.some(Q => V3.kc(P, Q) < 1e-6)) ds.push(P) };
  for (const [i, j] of canh) {
    const A = dinh[i], B = dinh[j], f0 = V3.vh(n, A) - d, f1 = V3.vh(n, B) - d;
    if (Math.abs(f0) < eps) them(A);
    if (Math.abs(f1) < eps) them(B);
    if (f0 * f1 < -eps * eps && Math.abs(f0) > eps && Math.abs(f1) > eps) them(V3.giua(A, B, f0 / (f0 - f1)));
  }
  if (ds.length < 3) return ds;
  const G = V3.tb(ds), nn = V3.don(n);
  let u = Math.abs(nn.x) < .9 ? V3.ch(nn, { x: 1, y: 0, z: 0 }) : V3.ch(nn, { x: 0, y: 1, z: 0 });
  u = V3.don(u); const w = V3.ch(nn, u);
  return ds.map(P => ({ P, g: Math.atan2(V3.vh(V3.t(P, G), w), V3.vh(V3.t(P, G), u)) })).sort((a, b) => a.g - b.g).map(o => o.P);
};
// Lấy danh sách cạnh từ danh sách mặt
window.canhTuMat = function (mat) {
  const s = new Set(), kq = [];
  for (const m of mat) for (let i = 0; i < m.length; i++) {
    const a = m[i], b = m[(i + 1) % m.length], k = a < b ? a + '|' + b : b + '|' + a;
    if (!s.has(k)) { s.add(k); kq.push([a, b]) }
  }
  return kq;
};

class KhongGian {
  constructor(cv, o = {}) {
    this.cv = cv; this.g = cv.getContext('2d');
    const goc = o.goc || [-125, 20];
    this.th = goc[0] * Math.PI / 180; this.ph = goc[1] * Math.PI / 180;
    this.s = o.tyLe || 55; this.tam = o.tam || { x: 0, y: 0, z: 0 }; this.ve = o.ve || (() => {});
    this.hen = null;
    new ResizeObserver(() => this.doiCo()).observe(cv);
    this.doiCo(); this.chuot();
  }
  doiCo() {
    const r = this.cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    if (!r.width) return;
    this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(r.width * d); this.cv.height = Math.round(r.height * d);
    this.g.setTransform(d, 0, 0, d, 0, 0); this.veLai();
  }
  veLai() { if (!this.W) return; this.g.clearRect(0, 0, this.W, this.H); this.ve(this) }
  // hướng nhìn (từ mắt vào hình) trong hệ toạ độ thật
  get huong() { return { x: Math.sin(this.th) * Math.cos(this.ph), y: Math.cos(this.th) * Math.cos(this.ph), z: -Math.sin(this.ph) } }
  hc(P) {
    const x = P.x - this.tam.x, y = P.y - this.tam.y, z = P.z - this.tam.z;
    const xr = x * Math.cos(this.th) - y * Math.sin(this.th), yr = x * Math.sin(this.th) + y * Math.cos(this.th);
    const len = z * Math.cos(this.ph) + yr * Math.sin(this.ph), sau = yr * Math.cos(this.ph) - z * Math.sin(this.ph);
    return { px: this.W / 2 + this.s * xr, py: this.H / 2 - this.s * len, sau };
  }
  sau(P) { return this.hc(P).sau }
  tuXoay(bat) {
    clearInterval(this.hen); this.hen = null;
    if (bat) this.hen = setInterval(() => { this.th += .012; this.veLai() }, 30);
  }
  chuot() {
    const cv = this.cv; let keo = null;
    cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => { keo = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing' });
    cv.addEventListener('pointermove', e => {
      if (!keo) return;
      this.th -= (e.clientX - keo.x) * .008;
      this.ph = Math.max(-1.5, Math.min(1.5, this.ph + (e.clientY - keo.y) * .008));
      keo = { x: e.clientX, y: e.clientY }; this.veLai();
    });
    const tha = () => { keo = null; cv.style.cursor = 'grab' };
    cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', tha);
    cv.addEventListener('wheel', e => { e.preventDefault(); this.s = Math.max(8, Math.min(400, this.s * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); this.veLai() }, { passive: false });
  }
  datGoc(th, ph) { this.th = th * Math.PI / 180; this.ph = ph * Math.PI / 180; this.veLai() }
  // ---------- vẽ ----------
  doan(A, B, o = {}) {
    const g = this.g, a = this.hc(A), b = this.hc(B);
    g.save(); g.strokeStyle = o.mau || '#334155'; g.lineWidth = o.day || 2; g.globalAlpha = o.mo ?? 1;
    if (o.net) g.setLineDash(o.net === true ? [6, 5] : o.net);
    g.beginPath(); g.moveTo(a.px, a.py); g.lineTo(b.px, b.py); g.stroke(); g.restore();
  }
  muiTen(A, B, o = {}) {
    const g = this.g, a = this.hc(A), b = this.hc(B), L = Math.hypot(b.px - a.px, b.py - a.py);
    g.save(); g.strokeStyle = g.fillStyle = o.mau || '#1d4ed8'; g.lineWidth = o.day || 3; g.globalAlpha = o.mo ?? 1;
    if (L < 1) { g.restore(); return }
    const ux = (b.px - a.px) / L, uy = (b.py - a.py) / L, h = Math.min(14, L * .45);
    if (o.net) g.setLineDash(o.net === true ? [6, 5] : o.net);
    g.beginPath(); g.moveTo(a.px, a.py); g.lineTo(b.px - ux * h * .8, b.py - uy * h * .8); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(b.px, b.py); g.lineTo(b.px - ux * h - uy * h * .45, b.py - uy * h + ux * h * .45); g.lineTo(b.px - ux * h + uy * h * .45, b.py - uy * h - ux * h * .45); g.closePath(); g.fill();
    g.restore();
    if (o.ten) this.chu(o.ten, V3.giua(A, B, o.viTri ?? .6), { mau: o.mau, font: 'bold italic 16px "Cambria Math","Times New Roman",serif', dx: 8, dy: -8, nen: 'rgba(255,255,255,.75)' });
  }
  diem(P, o = {}) {
    const g = this.g, a = this.hc(P);
    g.save(); g.fillStyle = o.mau || '#dc2626'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.arc(a.px, a.py, o.r || 4.5, 0, 7); g.fill(); g.stroke(); g.restore();
    if (o.ten) this.chu(o.ten, P, { dx: o.dx ?? 8, dy: o.dy ?? -8, mau: o.mauChu || '#0f172a', font: 'bold 15px "Segoe UI",Arial' });
  }
  chu(t, P, o = {}) {
    const g = this.g, a = this.hc(P);
    g.save(); g.font = o.font || '14px "Segoe UI",Arial'; g.textAlign = o.canh || 'left';
    const x = a.px + (o.dx || 0), y = a.py + (o.dy || 0);
    if (o.nen) { const w = g.measureText(t).width, x0 = o.canh === 'center' ? x - w / 2 : x; g.fillStyle = o.nen; g.fillRect(x0 - 3, y - 14, w + 6, 19) }
    g.fillStyle = o.mau || '#0f172a'; g.fillText(t, x, y); g.restore();
  }
  daGiac(ds, o = {}) {
    if (ds.length < 3) return;
    const g = this.g; g.save(); g.beginPath();
    ds.forEach((P, i) => { const a = this.hc(P); i ? g.lineTo(a.px, a.py) : g.moveTo(a.px, a.py) }); g.closePath();
    if (o.to) { g.fillStyle = o.to; g.globalAlpha = o.mo ?? .3; g.fill(); g.globalAlpha = 1 }
    if (o.vien) { g.strokeStyle = o.vien; g.lineWidth = o.day || 2; if (o.net) g.setLineDash(o.net === true ? [6, 5] : o.net); g.stroke() }
    g.restore();
  }
  // đường cong tham số f(t) → điểm 3D; o.khuat(P) → true thì vẽ nét đứt đoạn đó
  duongCong(f, t0, t1, o = {}) {
    const g = this.g, n = o.n || 160;
    g.save(); g.strokeStyle = o.mau || '#1d4ed8'; g.lineWidth = o.day || 2.4; g.globalAlpha = o.mo ?? 1;
    let truoc = null, kTruoc = null;
    for (let i = 0; i <= n; i++) {
      const P = f(t0 + (t1 - t0) * i / n), a = this.hc(P), k = o.khuat ? !!o.khuat(P) : !!o.net;
      if (truoc) {
        g.setLineDash(k ? [5, 5] : []); g.globalAlpha = (o.mo ?? 1) * (k && o.khuat ? .55 : 1);
        g.beginPath(); g.moveTo(truoc.px, truoc.py); g.lineTo(a.px, a.py); g.stroke();
      }
      truoc = a; kTruoc = k;
    }
    g.restore();
  }
  // đường tròn tâm C, bán kính r, nằm trong mặt phẳng có pháp tuyến n
  duongTron(C, n, r, o = {}) {
    const nn = V3.don(n); let u = Math.abs(nn.x) < .9 ? V3.ch(nn, { x: 1, y: 0, z: 0 }) : V3.ch(nn, { x: 0, y: 1, z: 0 });
    u = V3.don(u); const w = V3.ch(nn, u);
    this.duongCong(t => V3.c(C, V3.c(V3.k(u, r * Math.cos(t)), V3.k(w, r * Math.sin(t)))), 0, 2 * Math.PI, o);
    return t => V3.c(C, V3.c(V3.k(u, r * Math.cos(t)), V3.k(w, r * Math.sin(t))));
  }
  // khối đa diện lồi: dinh = {A: P, ...}; mat = [['A','B','C'], ...]
  daDien(dinh, mat, o = {}) {
    const ten = Object.keys(dinh), G = V3.tb(ten.map(k => dinh[k])), d = this.huong, thay = [];
    for (const m of mat) {
      const P0 = dinh[m[0]], P1 = dinh[m[1]], P2 = dinh[m[2]];
      let n = V3.ch(V3.t(P1, P0), V3.t(P2, P0));
      if (V3.vh(n, V3.t(P0, G)) < 0) n = V3.k(n, -1);
      thay.push(V3.vh(n, d) < -1e-9);
    }
    if (o.to) mat.forEach((m, i) => { if (thay[i]) this.daGiac(m.map(k => dinh[k]), { to: o.to, mo: o.mo ?? .08 }) });
    const canh = canhTuMat(mat), ke = {};
    mat.forEach((m, i) => m.forEach((a, j) => { const b = m[(j + 1) % m.length], k = a < b ? a + '|' + b : b + '|' + a; (ke[k] = ke[k] || []).push(i) }));
    const veCanh = khuat => canh.forEach(([a, b]) => {
      const k = a < b ? a + '|' + b : b + '|' + a, h = !ke[k].some(i => thay[i]);
      if (h === khuat) this.doan(dinh[a], dinh[b], { mau: o.mau || '#1e293b', day: khuat ? 1.4 : (o.day || 2.2), net: khuat ? [6, 5] : null, mo: khuat ? .7 : 1 });
    });
    veCanh(true); veCanh(false);
    if (o.ten !== false) ten.forEach(k => {
      if (o.anTen && o.anTen.includes(k)) return;
      const a = this.hc(dinh[k]), gg = this.hc(G), dx = a.px - gg.px, dy = a.py - gg.py, L = Math.hypot(dx, dy) || 1;
      this.g.save(); this.g.font = 'bold 16px "Segoe UI",Arial'; this.g.fillStyle = '#0f172a'; this.g.textAlign = 'center';
      this.g.fillText(k, a.px + dx / L * 15, a.py + dy / L * 15 + 5); this.g.restore();
    });
    return { thay, matThay: i => thay[i] };
  }
  // kí hiệu góc vuông tại P giữa hai hướng PA, PB
  gocVuong(P, A, B, o = {}) {
    const k = o.k || .3, u = V3.k(V3.don(V3.t(A, P)), k), v = V3.k(V3.don(V3.t(B, P)), k);
    const g = this.g, q = [V3.c(P, u), V3.c(V3.c(P, u), v), V3.c(P, v)].map(X => this.hc(X));
    g.save(); g.strokeStyle = o.mau || '#dc2626'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(q[0].px, q[0].py); g.lineTo(q[1].px, q[1].py); g.lineTo(q[2].px, q[2].py); g.stroke(); g.restore();
  }
  // cung đánh dấu góc APB
  cungGoc(P, A, B, r, o = {}) {
    const u = V3.don(V3.t(A, P)), v0 = V3.t(B, P), w = V3.don(V3.t(v0, V3.k(u, V3.vh(v0, u)))), a = Math.acos(Math.max(-1, Math.min(1, V3.vh(u, V3.don(v0)))));
    const f = t => V3.c(P, V3.c(V3.k(u, r * Math.cos(t)), V3.k(w, r * Math.sin(t))));
    const g = this.g; g.save(); g.fillStyle = o.mau || '#f59e0b'; g.globalAlpha = .3; g.beginPath();
    const p0 = this.hc(P); g.moveTo(p0.px, p0.py);
    for (let i = 0; i <= 30; i++) { const q = this.hc(f(a * i / 30)); g.lineTo(q.px, q.py) }
    g.closePath(); g.fill(); g.restore();
    this.duongCong(f, 0, a, { mau: o.mau || '#d97706', day: 2, n: 30 });
    if (o.ten) this.chu(o.ten, f(a / 2), { dx: 4, dy: 4, mau: o.mauChu || '#b45309', font: 'bold italic 16px "Cambria Math","Times New Roman",serif' });
    return a;
  }
  truc(L = 5, o = {}) {
    const O = { x: 0, y: 0, z: 0 }, ds = [['x', { x: L, y: 0, z: 0 }], ['y', { x: 0, y: L, z: 0 }], ['z', { x: 0, y: 0, z: L }]];
    for (const [t, P] of ds) {
      this.doan(O, V3.k(P, -(o.am ?? .6)), { mau: '#94a3b8', day: 1.2, net: [4, 4] });
      this.muiTen(O, P, { mau: '#475569', day: 1.6 });
      this.chu(t, P, { dx: 6, dy: -4, font: 'italic bold 17px "Cambria Math","Times New Roman",serif', mau: '#334155' });
    }
    if (o.vach !== false) for (const [, P] of ds) for (let i = 1; i < L; i++) {
      const Q = V3.k(V3.don(P), i), a = this.hc(Q);
      this.g.save(); this.g.fillStyle = '#64748b'; this.g.beginPath(); this.g.arc(a.px, a.py, 1.8, 0, 7); this.g.fill(); this.g.restore();
    }
    this.chu('O', O, { dx: -16, dy: 14, font: 'italic 15px "Cambria Math",serif', mau: '#334155' });
  }
  mpLuoi(L = 5, o = {}) {
    for (let i = -L; i <= L; i++) {
      this.doan({ x: i, y: -L, z: 0 }, { x: i, y: L, z: 0 }, { mau: '#e2e8f0', day: 1 });
      this.doan({ x: -L, y: i, z: 0 }, { x: L, y: i, z: 0 }, { mau: '#e2e8f0', day: 1 });
    }
  }
}
window.KhongGian = KhongGian;
})();
