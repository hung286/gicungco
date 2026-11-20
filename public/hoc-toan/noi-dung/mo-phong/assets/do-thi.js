/* do-thi.js — mặt phẳng toạ độ Oxy dùng chung cho các mô phỏng (canvas, chạy offline).
   const mp = new MatPhang(canvas, {cx:0, cy:0, donVi:40, ve:()=>{...}})
   - mp.X(x), mp.Y(y): toạ độ → điểm ảnh ; mp.x(px), mp.y(py): ngược lại
   - mp.luoi(), mp.ham(f,mau), mp.doan(A,B,o), mp.muiTen(A,B,o), mp.diem(P,o), mp.chu(t,x,y,o), mp.duongThang(a,b,c,o)
   - mp.keo([{lay:()=>({x,y}), dat:(x,y)=>{}, buoc:1}])  kéo điểm bằng chuột/ngón tay
   - Kéo chỗ trống để di chuyển, lăn chuột (hoặc nút +/−) để phóng to. */
(function(){
const fmt = (v, n = 2) => {
  if (!isFinite(v)) return '—';
  let s = (Math.round(v * 10 ** n) / 10 ** n).toString();
  if (s === '-0') s = '0';
  return s.replace('-', '−').replace('.', ',');
};
window.fmt = fmt;

class MatPhang {
  constructor(cv, o = {}) {
    this.cv = cv; this.g = cv.getContext('2d');
    this.cx = o.cx || 0; this.cy = o.cy || 0; this.dv = o.donVi || 40; this.ve = o.ve || (() => {});
    this.diemKeo = []; this.dang = null; this.khoa = !!o.khoaKhung;
    this.onClick = o.onClick || null;
    const ro = new ResizeObserver(() => this.doiCo()); ro.observe(cv);
    this.doiCo(); this.chuot();
  }
  doiCo() {
    const r = this.cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    if (!r.width) return;
    this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(r.width * d); this.cv.height = Math.round(r.height * d);
    this.g.setTransform(d, 0, 0, d, 0, 0); this.ve0();
  }
  X(x) { return this.W / 2 + (x - this.cx) * this.dv }
  Y(y) { return this.H / 2 - (y - this.cy) * this.dv }
  x(px) { return (px - this.W / 2) / this.dv + this.cx }
  y(py) { return -(py - this.H / 2) / this.dv + this.cy }
  get xmin() { return this.x(0) } get xmax() { return this.x(this.W) }
  get ymin() { return this.y(this.H) } get ymax() { return this.y(0) }
  ve0() { if (!this.W) return; this.g.clearRect(0, 0, this.W, this.H); this.ve(this) }
  veLai() { this.ve0() }
  phong(k) { this.dv = Math.min(200, Math.max(6, this.dv * k)); this.ve0() }
  buocLuoi() { const s = [1, 2, 5, 10, 20, 50]; for (const b of s) if (b * this.dv >= 28) return b; return 100 }
  luoi() {
    const g = this.g, b = this.buocLuoi();
    g.save(); g.lineWidth = 1;
    for (let x = Math.ceil(this.xmin); x <= this.xmax; x++) {
      g.strokeStyle = x % b === 0 ? '#e2e8f0' : '#f4f6fa'; if (this.dv < 14 && x % b) continue;
      g.beginPath(); g.moveTo(this.X(x) + .5, 0); g.lineTo(this.X(x) + .5, this.H); g.stroke();
    }
    for (let y = Math.ceil(this.ymin); y <= this.ymax; y++) {
      g.strokeStyle = y % b === 0 ? '#e2e8f0' : '#f4f6fa'; if (this.dv < 14 && y % b) continue;
      g.beginPath(); g.moveTo(0, this.Y(y) + .5); g.lineTo(this.W, this.Y(y) + .5); g.stroke();
    }
    // trục
    g.strokeStyle = '#334155'; g.lineWidth = 1.4; g.fillStyle = '#334155';
    const oy = Math.min(this.H - 1, Math.max(1, this.Y(0))), ox = Math.min(this.W - 1, Math.max(1, this.X(0)));
    g.beginPath(); g.moveTo(0, oy); g.lineTo(this.W, oy); g.moveTo(ox, this.H); g.lineTo(ox, 0); g.stroke();
    g.beginPath(); g.moveTo(this.W, oy); g.lineTo(this.W - 9, oy - 4); g.lineTo(this.W - 9, oy + 4); g.fill();
    g.beginPath(); g.moveTo(ox, 0); g.lineTo(ox - 4, 9); g.lineTo(ox + 4, 9); g.fill();
    g.font = 'italic 15px "Cambria Math","Times New Roman",serif';
    g.fillText('x', this.W - 14, oy - 8); g.fillText('y', ox + 8, 14);
    g.font = '12px "Segoe UI",Arial'; g.fillStyle = '#64748b';
    g.textAlign = 'center';
    for (let x = Math.ceil(this.xmin / b) * b; x <= this.xmax; x += b) if (x) g.fillText(fmt(x), this.X(x), Math.min(this.H - 4, oy + 15));
    g.textAlign = 'right';
    for (let y = Math.ceil(this.ymin / b) * b; y <= this.ymax; y += b) if (y) g.fillText(fmt(y), Math.max(24, ox - 5), this.Y(y) + 4);
    g.fillText('O', ox - 5, oy + 15);
    g.restore();
  }
  ham(f, o = {}) {
    const g = this.g; g.save(); g.strokeStyle = o.mau || '#1d4ed8'; g.lineWidth = o.day || 2.6;
    if (o.net) g.setLineDash(o.net);
    g.beginPath(); let dau = true;
    for (let px = 0; px <= this.W; px += 1) {
      const y = f(this.x(px)), py = this.Y(y);
      if (!isFinite(py) || Math.abs(py) > 5 * this.H) { dau = true; continue }
      dau ? g.moveTo(px, py) : g.lineTo(px, py); dau = false;
    }
    g.stroke(); g.restore();
  }
  thamSo(fx, fy, t0, t1, o = {}) {
    const g = this.g; g.save(); g.strokeStyle = o.mau || '#1d4ed8'; g.lineWidth = o.day || 2.6;
    if (o.net) g.setLineDash(o.net);
    g.beginPath(); const n = o.n || 600;
    for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n, px = this.X(fx(t)), py = this.Y(fy(t)); i ? g.lineTo(px, py) : g.moveTo(px, py) }
    g.stroke(); g.restore();
  }
  doan(A, B, o = {}) {
    const g = this.g; g.save(); g.strokeStyle = o.mau || '#334155'; g.lineWidth = o.day || 2;
    if (o.net) g.setLineDash(o.net);
    g.beginPath(); g.moveTo(this.X(A.x), this.Y(A.y)); g.lineTo(this.X(B.x), this.Y(B.y)); g.stroke(); g.restore();
  }
  // đường thẳng ax + by = c
  duongThang(a, b, c, o = {}) {
    if (Math.abs(b) > 1e-12) { const x0 = this.xmin - 1, x1 = this.xmax + 1; this.doan({ x: x0, y: (c - a * x0) / b }, { x: x1, y: (c - a * x1) / b }, o) }
    else if (Math.abs(a) > 1e-12) { const x = c / a; this.doan({ x, y: this.ymin - 1 }, { x, y: this.ymax + 1 }, o) }
  }
  muiTen(A, B, o = {}) {
    const g = this.g, x0 = this.X(A.x), y0 = this.Y(A.y), x1 = this.X(B.x), y1 = this.Y(B.y), L = Math.hypot(x1 - x0, y1 - y0);
    g.save(); g.strokeStyle = g.fillStyle = o.mau || '#1d4ed8'; g.lineWidth = o.day || 3;
    if (o.net) g.setLineDash(o.net);
    if (L < 1) { g.restore(); return }
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = Math.min(14, L * .45);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - ux * h * .8, y1 - uy * h * .8); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - ux * h - uy * h * .45, y1 - uy * h + ux * h * .45); g.lineTo(x1 - ux * h + uy * h * .45, y1 - uy * h - ux * h * .45); g.closePath(); g.fill();
    if (o.ten) this.chuGiua(o.ten, (A.x + B.x) / 2, (A.y + B.y) / 2, { mau: o.mau, lech: o.lech });
    g.restore();
  }
  diem(P, o = {}) {
    const g = this.g; g.save(); g.fillStyle = o.mau || '#dc2626'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.arc(this.X(P.x), this.Y(P.y), o.r || (o.keo ? 7 : 4.5), 0, 7); g.fill(); g.stroke();
    if (o.ten) { g.font = (o.dam ? 'bold ' : '') + '15px "Segoe UI",Arial'; g.fillStyle = o.mauChu || '#0f172a'; g.fillText(o.ten, this.X(P.x) + (o.dx ?? 9), this.Y(P.y) + (o.dy ?? -9)) }
    g.restore();
  }
  chu(t, x, y, o = {}) {
    const g = this.g; g.save(); g.font = o.font || '14px "Segoe UI",Arial'; g.fillStyle = o.mau || '#0f172a'; g.textAlign = o.canh || 'left';
    if (o.nen) { const w = g.measureText(t).width; g.fillStyle = o.nen; const px = this.X(x) - (o.canh === 'center' ? w / 2 : 0); g.fillRect(px - 3, this.Y(y) - 14, w + 6, 19); g.fillStyle = o.mau || '#0f172a' }
    g.fillText(t, this.X(x), this.Y(y)); g.restore();
  }
  chuGiua(t, x, y, o = {}) { this.chu(t, x, y, { canh: 'center', mau: o.mau, font: 'bold italic 16px "Cambria Math","Times New Roman",serif', nen: 'rgba(255,255,255,.8)' }) }
  keo(ds) { this.diemKeo = ds }
  chuot() {
    const cv = this.cv; let pan = null, moved = false;
    const vt = e => { const r = cv.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top } };
    cv.addEventListener('pointerdown', e => {
      const { px, py } = vt(e); moved = false;
      let tot = null, dmin = e.pointerType === 'touch' ? 26 : 16;
      for (const d of this.diemKeo) { const p = d.lay(), dd = Math.hypot(this.X(p.x) - px, this.Y(p.y) - py); if (dd < dmin) { dmin = dd; tot = d } }
      cv.setPointerCapture(e.pointerId);
      if (tot) this.dang = tot; else if (!this.khoa) pan = { px, py, cx: this.cx, cy: this.cy };
      else pan = { px, py, chiClick: true };
    });
    cv.addEventListener('pointermove', e => {
      const { px, py } = vt(e);
      if (this.dang) {
        const b = this.dang.buoc ?? 0.5; let x = this.x(px), y = this.y(py);
        if (b) { x = Math.round(x / b) * b; y = Math.round(y / b) * b }
        this.dang.dat(x, y); this.ve0(); moved = true;
      } else if (pan && !pan.chiClick) {
        if (Math.hypot(px - pan.px, py - pan.py) > 3) moved = true;
        this.cx = pan.cx - (px - pan.px) / this.dv; this.cy = pan.cy + (py - pan.py) / this.dv; this.ve0();
      } else {
        let gan = false; for (const d of this.diemKeo) { const p = d.lay(); if (Math.hypot(this.X(p.x) - px, this.Y(p.y) - py) < 16) gan = true }
        cv.style.cursor = gan ? 'grab' : (this.khoa ? 'crosshair' : 'move');
      }
    });
    const len = e => {
      const { px, py } = vt(e);
      if (!moved && this.onClick && !this.dang) this.onClick(this.x(px), this.y(py));
      this.dang = null; pan = null;
    };
    cv.addEventListener('pointerup', len); cv.addEventListener('pointercancel', () => { this.dang = null; pan = null });
    cv.addEventListener('wheel', e => { if (this.khoa) return; e.preventDefault(); this.phong(e.deltaY < 0 ? 1.12 : 1 / 1.12) }, { passive: false });
  }
}
window.MatPhang = MatPhang;

// Thanh trượt gắn số: tt('a', -5, 5, .1, 1, fn) → trả về {get v, set v}
window.thanhTruot = function (hop, ten, min, max, buoc, gt, doi, nhan) {
  const d = document.createElement('div'); d.className = 'dk';
  d.innerHTML = `<label>${nhan || ten}</label><input type="range" min="${min}" max="${max}" step="${buoc}" value="${gt}"><input type="number" min="${min}" max="${max}" step="${buoc}" value="${gt}">`;
  hop.appendChild(d);
  const r = d.querySelector('input[type=range]'), n = d.querySelector('input[type=number]');
  r.oninput = () => { n.value = r.value; doi() }; n.onchange = () => { r.value = n.value; n.value = r.value; doi() };
  return { get v() { return +r.value }, set v(x) { r.value = x; n.value = r.value } };
};
})();
