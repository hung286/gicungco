/**
 * ==============================================================================
 * GAME: CHỌC XOÀI CHẤM MUỐI (POKE MANGO DIP IN CHILI SALT)
 * Chuẩn 100% PomyAI Native Canvas 2D Engine - 60fps - 0% Giật Lag
 * (https://pomyai.com/gv/tro-choi-goi-ten/choc-xoai-cham-muoi)
 * Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
 * ==============================================================================
 */

(function (global) {
  'use strict';

  // ----------------------------------------------------------------------------
  // 1. EMBEDDED COMPLETE STYLES FOR CHỌC XOÀI CHẤM MUỐI
  // ----------------------------------------------------------------------------
  const GAME_CSS = `
.cx-shell {
  background: #6b8f3a;
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  z-index: 60;
  display: flex;
  flex-direction: column;
}

.cx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.cx-lop {
  pointer-events: none;
  z-index: 20;
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cx-ten {
  color: #1a2e05;
  white-space: nowrap;
  will-change: transform;
  background: #fffdf0eb;
  border: 1px solid #4d7c0f8c;
  border-radius: 6px;
  padding: 0 6px;
  font-weight: 800;
  line-height: 1.35;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.05s linear;
}

.cx-ten.is-nguy {
  color: #9f1239;
  background: #fff1f2;
  border-color: #e11d48;
  animation: 0.6s ease-in-out infinite cx-tim;
}

.cx-ten.is-chon {
  color: #fff;
  background: #b91c1c;
  border: 2px solid #fde047;
  border-radius: 10px;
  padding: 2px 14px;
  animation: none;
  box-shadow: 0 4px #7f1d1d;
  z-index: 25;
}

@keyframes cx-tim {
  0%, 100% { box-shadow: 0 0 #e11d488c; }
  30% { box-shadow: 0 0 0 6px #e11d4800; }
}

.cx-lop-thoai {
  z-index: 22;
}

.cx-thoai {
  color: #1c1917;
  max-width: 320px;
  text-align: center;
  will-change: transform;
  background: #fff;
  border: 3px solid #1c1917;
  border-radius: 18px;
  padding: 8px 16px;
  font-size: clamp(15px, 1.35vw, 22px);
  font-weight: 800;
  line-height: 1.25;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 4px #1c191759;
}

.cx-thoai:after {
  content: "";
  top: 100%;
  left: calc(50% + var(--duoi, 0px) - 10px);
  border: 10px solid transparent;
  border-top: 14px solid #1c1917;
  border-bottom: 0;
  position: absolute;
}

.cx-chu {
  color: #fde047;
  -webkit-text-stroke: 3px #7c2d12;
  paint-order: stroke fill;
  text-shadow: 0 5px #7c2d12;
  white-space: nowrap;
  will-change: transform, opacity;
  font-size: clamp(24px, 2.6vw, 42px);
  font-weight: 900;
  position: absolute;
  top: 0;
  left: 0;
}

.cx-chu--lon {
  -webkit-text-stroke: 5px #7c2d12;
  text-shadow: 0 8px #7c2d12;
  font-size: clamp(56px, 8vw, 120px);
}

.cx-tai {
  z-index: 35;
  color: #1a2e05;
  text-align: center;
  background: #a3c45a;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  position: absolute;
  inset: 0;
}

.cx-tai__vong {
  border: 6px solid #1a2e0533;
  border-top-color: #1a2e05;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  animation: 0.9s linear infinite cx-quay;
}

@keyframes cx-quay {
  to { transform: rotate(360deg); }
}

.cx-sanh {
  z-index: 30;
  pointer-events: none;
  justify-content: center;
  align-items: center;
  padding: 16px;
  display: flex;
  position: absolute;
  inset: 0;
  flex-direction: column;
  gap: 14px;
}

.cx-sanh > * {
  pointer-events: auto;
}

.cx-nut {
  appearance: none;
  cursor: pointer;
  color: #fff;
  background: #65a30d;
  border: 3px solid #fde047;
  border-radius: 18px;
  padding: 12px 34px;
  font-size: clamp(17px, 1.5vw, 24px);
  font-weight: 900;
  transition: transform 0.12s, box-shadow 0.12s;
  box-shadow: 0 6px #365314;
}

.cx-nut:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px #365314;
}

.cx-nut:active {
  transform: translateY(4px);
  box-shadow: 0 2px #365314;
}

.cx-nut:disabled {
  opacity: 0.5;
  cursor: default;
}

.cx-nut--lon {
  padding: 16px 64px;
  font-size: clamp(22px, 2vw, 32px);
}

.cx-goi-y {
  z-index: 30;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.75);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 700;
  position: absolute;
  bottom: 18px;
  right: 20px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.cx-the-nen {
  z-index: 45;
  background: radial-gradient(#03253a60, #03253acc);
  justify-content: center;
  align-items: center;
  padding: 16px;
  display: flex;
  position: absolute;
  inset: 0;
  animation: cx-fade-in 0.3s ease-out;
}

@keyframes cx-fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.cx-the-khung {
  flex-direction: column;
  align-items: center;
  width: min(840px, 92vw);
  display: flex;
}

.cx-the__du {
  z-index: 1;
  justify-content: center;
  margin-bottom: -44px;
  display: flex;
  position: relative;
}

.cx-the__nhan {
  color: #fff7ed;
  letter-spacing: 0.1em;
  white-space: nowrap;
  background: #b91c1c;
  border: 3px solid #fffbeb;
  border-radius: 999px;
  padding: 8px 24px;
  font-size: clamp(14px, 1.4vw, 20px);
  font-weight: 900;
  box-shadow: 0 4px #7f1d1d;
}

.cx-the {
  color: #0f172a;
  text-align: center;
  background: #fffdf5;
  border: 5px solid #4d7c0f;
  border-radius: 32px;
  width: 100%;
  margin-top: 26px;
  padding: 34px clamp(20px, 4vw, 48px) 56px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px #1a2e05, 0 24px 56px rgba(2, 6, 23, 0.5);
}

.cx-the__ds {
  flex-direction: column;
  align-items: center;
  gap: 8px;
  display: flex;
}

.cx-the__ten {
  color: #b91c1c;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 900;
  line-height: 1.15;
  font-size: min(92px, calc(150cqi / var(--n, 10)));
  text-shadow: 0 4px #fecaca, 0 0 18px rgba(255, 255, 255, 0.9);
}

.cx-the__ds--2 .cx-the__ten,
.cx-the__ds--3 .cx-the__ten,
.cx-the__ds--4 .cx-the__ten,
.cx-the__ds--5 .cx-the__ten {
  font-size: clamp(32px, 5vw, 60px);
}

.cx-the__loi {
  color: #3f6212;
  margin-top: 10px;
  font-size: clamp(18px, 1.7vw, 26px);
  font-weight: 800;
}

.cx-the__nut {
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
  display: flex;
}

.cx-the__co {
  pointer-events: none;
  background: radial-gradient(3px at 8px 10px, #ea580c 95%, transparent 100%) 0 0/23px 13px,
              radial-gradient(2px at 16px 4px, #dc2626 95%, transparent 100%) 0 0/31px 11px,
              linear-gradient(transparent, rgba(234, 88, 12, 0.12));
  height: 32px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

/* Roster Drawer */
.cx-drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.cx-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}
.cx-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 88vw);
  background: #0f172a;
  border-left: 1.5px solid rgba(250, 204, 21, 0.4);
  box-shadow: -8px 0 32px rgba(0,0,0,0.6);
  z-index: 51;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}
.cx-drawer.is-open {
  transform: translateX(0);
}
`;

  function injectGameStyles() {
    let style = document.getElementById('cx-custom-game-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'cx-custom-game-styles';
      style.textContent = GAME_CSS;
      document.head.appendChild(style);
    }
  }

  // ----------------------------------------------------------------------------
  // 2. MATHEMATICAL ENGINE & CONSTANTS (MODULE 12099)
  // ----------------------------------------------------------------------------
  const clamp01 = e => Math.max(0, Math.min(1, e));
  const smoothstep = e => { let a = clamp01(e); return a * a * (3 - 2 * a); };
  const lerp = (e, t, n) => e + (t - e) * smoothstep(n);
  const THE_GIOI = { rong: 1536, cao: 1024 };
  const GOC_CAY = { x: 740 };
  const GIAY = { x: 560, y: 912 };
  const tan70Inv = 1 / Math.tan(70 * Math.PI / 180);
  const CAO_TY = 215;
  const CAO_BEO = 290;
  const CAO_MIT = 225;
  const CAO_QUA = 66;
  const MAT_DAT = 905;
  const T_MO_DAU = 6.4;

  const offsets = { ty: { dx: 42, h: 103 }, beo: { dx: 89, h: 173 } };
  const U = { quet: 1.4, diChuyen: 0.85, dung: 0.95, ne: 1.1 };

  const KHUNG_XOAI = {
    vui: 0, ngu: 1, lo: 2, so: 3, ratSo: 4, phao: 5, hoang: 6, roi: 7, choang: 8, ngai: 9, treu: 10, cuoi: 11
  };

  function hashString(e, t = 0) {
    let a = 0x811c9dc5 ^ t;
    for (let i = 0; i < e.length; i++) a ^= e.charCodeAt(i), a = Math.imul(a, 0x1000193);
    return (a >>> 0) % 1e5 / 1e5;
  }

  const bieuCamRanh = ["vui", "ngu", "vui", "treu", "cuoi", "vui"];

  function mocLuot(e) {
    let t = U.quet + e.khung.length * (U.diChuyen + U.dung);
    if (e.noi) return {
      quetXong: t, denA: -1, chocA: -1, kien: -1, datSao: -1, gai: -1, nhatSao: -1, quen: -1, denB: -1, nhon: -1, hut: -1, beoVao: -1, doiSao: -1, ...mocCuoi(e, t, 0.9)
    };
    let a = t + 0.9,
        n = a + 1.3,
        i = n + 0.8,
        r = i + 0.55,
        o = r + 2,
        u = o + 0.55,
        s = u + 1.4,
        l = s + 0.9,
        h = l + 2,
        d = h + 0.4,
        f = d + 1.6;
    return {
      quetXong: t, denA: t, chocA: a, kien: n, datSao: i, gai: r, nhatSao: o, quen: u, denB: s, nhon: l, hut: h, beoVao: d, doiSao: f, ...mocCuoi(e, f, 0.7)
    };
  }

  function mocCuoi(e, t, a) {
    let n = t + a,
        i = n + e.ne * U.ne + 0.1,
        r = i + 0.95,
        o = r + 1,
        u = r + 0.9,
        s = u + 0.85,
        l = s + 1,
        h = e.kem ? Math.max(o + 2.6, l + 1.6) : o + 2.6;
    return { nham: t, ne: n, choc: i, rung: r, cham: o, kemRoi: u, kemBop: s, kemCham: l, the: h };
  }

  const timQua = (e, t) => e.qua.find(e => e.ten === t);
  const toaDoQua = e => ({ x: e.x, y: e.y + 13.2 });
  const tinhXNguoi = (e, t) => {
    let a = offsets[e];
    return Math.max(110, Math.min(THE_GIOI.rong - 110, t.x - a.dx - (905 - a.h - t.y) * tan70Inv));
  };
  const nhipSong = (e, t, a = 0.42) => e >= 0 && e < t * a ? Math.max(0, Math.sin(e % a / a * Math.PI)) : 0;

  function duongDiDauSao(e, a, i) {
    let o = [{ u: 0, dau: { x: GOC_CAY.x - 300, y: 435 } }],
        u = U.quet;
    for (let t of e.khung) {
      let a = toaDoQua(timQua(e, t));
      u += U.diChuyen;
      o.push({ u: u, dau: { x: a.x, y: a.y + 22 } });
      u += U.dung;
      o.push({ u: u, dau: { x: a.x, y: a.y + 22 } });
    }
    o.push(i);
    let s = 0;
    for (; s < o.length - 1 && o[s + 1].u <= a;) s++;
    let l = o[s],
        h = o[Math.min(o.length - 1, s + 1)],
        d = h.u > l.u ? (a - l.u) / (h.u - l.u) : 1,
        p = l.dau.x === h.dau.x ? 0 : 40 * Math.sin(Math.PI * clamp01(d));
    return {
      x: lerp(l.dau.x, h.dau.x, d) + 4 * Math.sin(7 * a),
      y: lerp(l.dau.y, h.dau.y, d) - p + 3 * Math.cos(5 * a)
    };
  }

  function viTriSaoTy(e, t, i) {
    let r = toaDoQua(timQua(e, e.moi)),
        o = toaDoQua(timQua(e, e.chon));
    if (t < i.kien) {
      if (t >= i.chocA) {
        let e = nhipSong(t - i.chocA - 0.1, 2);
        return { x: r.x - 22 * e * tan70Inv, y: r.y + 18 - 22 * e };
      }
      return duongDiDauSao(e, t, { u: i.chocA, dau: { x: r.x, y: r.y + 18 } });
    }
    let s = {
      x: (r.x + o.x) / 2 + 120 * Math.sin(1.6 * t),
      y: Math.max(r.y, o.y) + 120 + 40 * Math.cos(2.1 * t)
    };
    if (t < i.denB) return s;
    let c = t < i.nhon ? 95 : 95 - 50 * smoothstep((t - i.nhon) / 1.5),
        l = t > i.nhon ? { x: 6 * Math.sin(23 * t), y: 5 * Math.sin(17 * t) } : { x: 0, y: 0 },
        h = { x: lerp(s.x, o.x, (t - i.denB) / 0.9) + l.x, y: lerp(s.y, o.y + c, (t - i.denB) / 0.9) + l.y };
    return t < i.hut ? h : { x: h.x - 60 * smoothstep((t - i.hut) / 0.4), y: h.y + 200 * smoothstep((t - i.hut) / 0.4) };
  }

  function sao(e, r) {
    let o, s = mocLuot(e);
    if (r < 0) return null;
    if (e.noi && r < s.ne) {
      let t = toaDoQua(timQua(e, e.chon)),
          a = duongDiDauSao(e, r, { u: s.ne, dau: { x: t.x, y: t.y + 22 } });
      return { ai: "beo", dau: a, xNguoi: tinhXNguoi("beo", { x: a.x, y: a.y - 22 }) };
    }
    if (r < s.kien) {
      let t = viTriSaoTy(e, r, s);
      return { ai: "ty", dau: t, xNguoi: tinhXNguoi("ty", t) };
    }
    let l = viTriSaoTy(e, s.kien - 0.001, s),
        h = tinhXNguoi("ty", l),
        p = h + 80 + 520 < THE_GIOI.rong - 20 ? 1 : -1,
        b = { x: h + 560 * p, y: 901 };
    if (r < s.datSao) {
      let e = (r - s.kien) / 0.8;
      return { ai: "ty", dau: { x: l.x + 30 * Math.sin(20 * r) * e, y: l.y + 90 * e }, xNguoi: h };
    }
    if (r < s.gai) {
      let e = smoothstep((r - s.datSao) / 0.5),
          t = { x: l.x, y: l.y + 90 };
      return { ai: "ty", dau: { x: t.x + (b.x - t.x) * e, y: t.y + (b.y - t.y) * e }, xNguoi: h };
    }
    if (r < s.nhatSao) return { ai: "ty", dau: b, xNguoi: h, goc: { x: h + 40 * p, y: 911 } };
    if (r < s.quen) {
      let t = smoothstep((r - s.nhatSao) / 0.5),
          n = viTriSaoTy(e, s.quen, s);
      return { ai: "ty", dau: { x: b.x + (n.x - b.x) * t, y: b.y + (n.y - b.y) * t }, xNguoi: h };
    }
    if (r < s.doiSao) {
      let t = viTriSaoTy(e, r, s);
      return { ai: "ty", dau: t, xNguoi: lerp(h, tinhXNguoi("ty", t), (r - s.quen) / 1.2) };
    }
    let k = toaDoQua(timQua(e, e.chon)),
        T = tinhXNguoi("beo", k);
    if (r < s.ne) {
      let e = (r - s.nham) / 0.7;
      o = { x: lerp(k.x - 140, k.x, e), y: lerp(k.y + 260, k.y + 22, e) };
    } else if (r < s.choc) {
      let e = nhipSong((r - s.ne) % U.ne - 0.15, 1, 0.5);
      o = { x: k.x - 30 * e * tan70Inv, y: k.y + 22 - 30 * e };
    } else {
      let e = nhipSong(r - s.choc, 2, 0.45),
          a = clamp01((r - s.rung) / 0.6);
      o = { x: k.x - 24 * e * tan70Inv - 60 * a, y: k.y + 22 - 24 * e + 220 * a };
    }
    return { ai: "beo", dau: o, xNguoi: T };
  }

  function neCuaQua(e, t) {
    let n = mocLuot(e);
    if (!e.ne || t < n.ne || t >= n.choc) return { dx: 0, dy: 0, nghieng: 0, xoay: 0, nhat: -1, chieu: null, nhanh: 0 };
    let i = t - n.ne,
        r = Math.min(e.ne - 1, Math.floor(i / U.ne)),
        o = i - r * U.ne,
        u = r % 2 ? -1 : 1,
        s = 1 === e.ne || r > 0 ? "lon" : "luot",
        l = o < 0.7 ? 1 : 1 - smoothstep((o - 0.7) / 0.35);
    if ("luot" === s) {
      let e = (1 - (1 - (o < 0.1 ? 0 : Math.min(1, (o - 0.1) / 0.12))) ** 3) * l;
      return { dx: 92 * u * e, dy: 0, nghieng: -(0.5 * u) * e, xoay: 0, nhat: r, chieu: s, nhanh: +(o >= 0.1 && o < 0.24) };
    }
    let h = o < 0.08 ? 0 : smoothstep((o - 0.08) / 0.4);
    return { dx: 86 * u * h * l, dy: -48 * Math.sin(Math.PI * h), nghieng: -(0.3 * u) * h * l, xoay: u * Math.PI * 2 * h, nhat: r, chieu: s, nhanh: +(o >= 0.08 && o < 0.48) };
  }

  function viTriTyDung(e) {
    if (e.noi) {
      let t = sao(e, mocLuot(e).ne).xNguoi;
      return t - 260 >= 110 ? t - 260 : t + 230;
    }
    return sao(e, mocLuot(e).doiSao - 0.001).xNguoi - 150;
  }

  const GIAY_KEM = { x: GIAY.x + 42, y: GIAY.y };
  const toaDoDiaMuoi = e => GIAY.x - 42 * !(!e.kem);

  function taoLuot(students, calledSet, isFirstRound, rng = Math.random, opts = {}) {
    let uniqueNames = [...new Set(students)].sort((a, b) => hashString(a) - hashString(b) || a.localeCompare(b));
    let count = uniqueNames.length;
    if (count <= 0) return null;

    let canopySlots = (function (n) {
      let R_X = 630, R_Y = 168;
      let tiers = Math.max(1, Math.min(6, Math.round(Math.sqrt(n / 2.4))));
      let yCoords = Array.from({ length: tiers }, (_, t) => 1 === tiers ? 305 : 305 - 0.82 * R_Y + 1.64 * R_Y * t / (tiers - 1));
      let tierWidths = yCoords.map(y => 2 * R_X * Math.sqrt(Math.max(0.08, 1 - ((y - 305) / R_Y) ** 2)));
      let totalWidth = tierWidths.reduce((a, b) => a + b, 0);
      let countsPerTier = tierWidths.map(w => Math.max(1, Math.floor(n * w / totalWidth)));
      let remaining = n - countsPerTier.reduce((a, b) => a + b, 0);
      for (; remaining > 0; remaining--) {
        let maxIdx = 0;
        for (let t = 1; t < tiers; t++) {
          if (tierWidths[t] / (countsPerTier[t] + 1) > tierWidths[maxIdx] / (countsPerTier[maxIdx] + 1)) {
            maxIdx = t;
          }
        }
        countsPerTier[maxIdx]++;
      }
      let res = [];
      yCoords.forEach((y, t) => {
        let rowCount = countsPerTier[t];
        let rowWidth = tierWidths[t];
        let offset = rowCount > 1 ? rowWidth / rowCount * (t % 2 ? 0.25 : -0.25) : 0;
        for (let i = 0; i < rowCount; i++) {
          res.push({ x: 768 - rowWidth / 2 + rowWidth * (i + 0.5) / rowCount + offset, y: y });
        }
      });
      return res.slice(0, n);
    })(count);

    let allMangoes = canopySlots.map((slot, idx) => {
      let name = uniqueNames[idx];
      return {
        ten: name,
        x: slot.x + (hashString(name, 7) - 0.5) * 16,
        y: slot.y + (hashString(name, 9) - 0.5) * 18,
        pha: hashString(name, 3) * Math.PI * 2,
        ranh: bieuCamRanh[Math.floor(hashString(name, 5) * bieuCamRanh.length)]
      };
    });

    let uncalled = allMangoes.filter(m => !calledSet.has(m.ten));
    let wrapAround = (uncalled.length === 0);
    if (wrapAround) uncalled = allMangoes;

    let targetName = uncalled[Math.min(uncalled.length - 1, Math.floor(rng() * uncalled.length))].ten;
    let targetMango = allMangoes.find(m => m.ten === targetName);
    let otherMangoes = allMangoes.filter(m => m.ten !== targetName);

    let belowTarget = otherMangoes.filter(m => m.y > targetMango.y + 30);
    let sortedByX = (belowTarget.length ? belowTarget : otherMangoes)
      .sort((a, b) => Math.abs(a.x - targetMango.x) - Math.abs(b.x - targetMango.x))
      .slice(0, Math.max(1, Math.ceil(0.5 * otherMangoes.length)));

    let baitName = sortedByX.length ? sortedByX[Math.floor(rng() * sortedByX.length)].ten : targetName;
    let scanCandidates = otherMangoes.filter(m => m.ten !== baitName && m.y > 205);
    for (let i = scanCandidates.length - 1; i > 0; i--) {
      let j = Math.floor(rng() * (i + 1));
      [scanCandidates[i], scanCandidates[j]] = [scanCandidates[j], scanCandidates[i]];
    }
    let leftCandidates = scanCandidates.filter(m => m.x < 768);
    let rightCandidates = scanCandidates.filter(m => m.x >= 768);
    let scannedKeys = [];
    let numScanned = Math.min(2, scanCandidates.length);
    for (let i = 0; scannedKeys.length < numScanned; i++) {
      let pool = (i % 2 ? rightCandidates : leftCandidates);
      let alt = (i % 2 ? leftCandidates : rightCandidates);
      let chosen = (pool.length ? pool : alt).shift();
      if (chosen) scannedKeys.push(chosen.ten);
      else break;
    }

    let dodgeCount = Math.max(0, Math.min(2, opts.ne ?? (rng() < 0.5 ? 2 : 1)));
    let nearestOthers = otherMangoes.filter(m => m.ten !== baitName)
      .sort((a, b) => Math.hypot(a.x - targetMango.x, a.y - targetMango.y) - Math.hypot(b.x - targetMango.x, b.y - targetMango.y));

    return {
      chon: targetName,
      moi: baitName,
      khung: scannedKeys,
      qua: allMangoes,
      moDau: isFirstRound,
      lamLai: wrapAround,
      ne: dodgeCount,
      kem: (opts.kem ?? (rng() < 0.3)) && nearestOthers.length ? nearestOthers[0].ten : null,
      noi: !(!opts.noi)
    };
  }

  function trangThaiQua(e, t, a, n) {
    let i = mocLuot(e),
        r = sao(e, a),
        u = t.ten === e.chon,
        s = t.ten === e.moi,
        l = !(!e.kem) && t.ten === e.kem,
        h = 0.06 * Math.sin(1.3 * n + t.pha),
        p = Math.floor(n / 3.4 + t.pha) % 3 === 0 ? ("vui" === t.ranh ? "cuoi" : "vui") : t.ranh;
    if (u && a >= i.rung) {
      let n = a - i.rung,
          r = i.cham - i.rung;
      if (n < r) {
        let a = n / r,
            i = t.y + 40.92,
            u = GIAY.y - 19.8;
        return { x: t.x + (toaDoDiaMuoi(e) - t.x) * a, y: i + (u - i) * a * a - 40 * Math.sin(Math.PI * a), goc: a * Math.PI * 2, bieuCam: "roi", treo: !1, run: 0 };
      }
      let u = n - r < 0.4 ? 26 * Math.sin((n - r) / 0.4 * Math.PI) : 0;
      return { x: toaDoDiaMuoi(e), y: GIAY.y - 19.8 - u, goc: 0, bieuCam: n - r < 1.3 ? "choang" : "ngai", treo: !1, run: 0 };
    }
    if (l && a >= i.kemRoi) {
      let n = t.y + 40.92,
          r = { x: viTriTyDung(e), y: 660.3 },
          o = { x: GIAY_KEM.x, y: GIAY_KEM.y - 19.8 };
      if (a < i.kemBop) {
        let e = (a - i.kemRoi) / (i.kemBop - i.kemRoi);
        return { x: t.x + (r.x - t.x) * e, y: n + (r.y - n) * e * e, goc: e * Math.PI * 1.5, bieuCam: "roi", treo: !1, run: 0 };
      }
      if (a < i.kemCham) {
        let e = (a - i.kemBop) / (i.kemCham - i.kemBop);
        return { x: r.x + (o.x - r.x) * e, y: r.y + (o.y - r.y) * e * e - 130 * Math.sin(Math.PI * e), goc: 1.5 * Math.PI + e * Math.PI * 2.5, bieuCam: "choang", treo: !1, run: 0 };
      }
      let u = a - i.kemCham,
          s = u < 0.35 ? 18 * Math.sin(u / 0.35 * Math.PI) : 0;
      return { x: o.x, y: o.y - s, goc: 0, bieuCam: u < 1.2 ? "choang" : "ngai", treo: !1, run: 0 };
    }
    if (u && e.ne && a >= i.ne && a < i.choc) {
      let i = neCuaQua(e, a),
          r = Math.abs(i.dx) > 30 || i.nhanh > 0;
      return { x: t.x + i.dx, y: t.y + i.dy, goc: h + i.nghieng + i.xoay + (r ? 0 : 0.03 * Math.sin(38 * n + t.pha)), bieuCam: r ? "treu" : "so", treo: !0, run: 0.5 * !r };
    }
    let f = p,
        y = 0,
        x = h;
    if (r && !r.goc) {
      let n = toaDoQua(t),
          i = Math.hypot(r.dau.x - n.x, r.dau.y - n.y);
      if (i < 95 ? (f = "ratSo", y = 1) : i < 170 ? (f = "so", y = 0.5) : i < 300 && (f = "lo"), i >= 170 && a > U.quet)
        for (let t = 0.15; t <= 1.2; t += 0.15) {
          let i = sao(e, a - t);
          if (i && !i.goc && 95 > Math.hypot(i.dau.x - n.x, i.dau.y - n.y)) {
            f = "phao";
            break;
          }
        }
    }
    if (s && !e.noi && (a >= i.chocA && a < i.kien ? (f = "hoang", y = 1, x += 0.35 * nhipSong(a - i.chocA - 0.1, 2)) : a >= i.datSao && a < i.nhatSao ? f = a < i.gai + 0.8 ? "phao" : "ngu" : a >= i.quen && a < i.cham && (f = a < i.hut ? "cuoi" : "treu")),
        u && a >= i.hut && a < i.doiSao && (f = "treu"),
        l && a >= i.rung && (f = "hoang", y = 1, x += 0.25 * Math.sin(30 * n)),
        u && a >= i.choc) {
      f = "hoang";
      y = 1;
      let e = a - i.choc;
      x += e < 0.9 ? 0.5 * nhipSong(e, 2, 0.45) : 0.2 * Math.sin(30 * e);
    }
    return !u && a >= i.cham && (f = "cuoi"),
           y && (x += 0.05 * Math.sin(38 * n + t.pha) * y),
           { x: t.x, y: t.y, goc: x, bieuCam: f, treo: !0, run: y };
  }

  function cacBe(e, a) {
    let r = mocLuot(e),
        u = a - 6.4 * !(!e.moDau),
        s = e => Math.floor(a * e) % 2,
        l = [],
        h = 0;
    h = u < 0 ? 11 * (a < 3.6) : u < r.chocA || e.noi && u < r.ne ? [0, 2][Math.floor(u / 1.8) % 2] : u < r.kien ? 1 : u < r.quen ? 6 : u < r.hut ? 2 : u < r.doiSao ? 6 : u < r.rung ? 1 : u < r.cham ? 5 : 3 + s(4);
    let p = GIAY.x + 150,
        f = !0;
    if (u >= 0) {
      let a = e.noi ? sao(e, r.ne).xNguoi : (sao(e, r.chocA).xNguoi + sao(e, r.nhon).xNguoi) / 2,
          c = a > GIAY.x - 40,
          l = c ? Math.max(90, Math.min(GIAY.x - 170, a - 330)) : Math.min(THE_GIOI.rong - 90, Math.max(GIAY.x + 170, a + 330)),
          d = clamp01(u / 1.1);
      p = lerp(GIAY.x + 150, l, d);
      f = d < 1 ? l < GIAY.x + 150 : !c;
      d > 0 && d < 1 && Math.abs(l - GIAY.x - 150) > 20 && (h = 9 + s(4));
    }
    l.push({ to: "gai", o: h, x: p, lat: f, hien: 1 });

    if (u < 0) {
      let e = a < 1.2 ? s(5) : a < 4.6 ? 2 + s(3) : 4,
          t = a < 1.2 ? lerp(GIAY.x - 480, GIAY.x - 60, a / 1.2) : GIAY.x - 60;
      l.push({ to: "thap", o: e, x: t, lat: !1, hien: 1 });
    } else if (e.noi) {
      let t = 4,
          a = viTriTyDung(e);
      e.kem && u >= r.kemBop && u < r.kemBop + 1.5 ? (t = 9, a += 8 * Math.sin(40 * u) * (1 - (u - r.kemBop) / 1.5)) : u >= r.cham && (t = 10 + s(4));
      l.push({ to: "thap", o: t, x: a, lat: !1, hien: 1 });
    } else {
      let t = sao(e, Math.min(u, r.doiSao - 0.001)),
          a = "thap2",
          i = Math.floor(1.2 * u) % 2,
          o = t.xNguoi;
      u >= r.chocA && u < r.kien ? i = nhipSong(u - r.chocA - 0.1, 2) > 0.4 ? 2 : 3 :
      u >= r.kien && u < r.datSao ? (i = 6, o += 10 * Math.sin(14 * u)) :
      u >= r.datSao && u < r.gai ? i = 9 :
      u >= r.gai && u < r.nhatSao ? i = 7 + s(3) :
      u >= r.nhatSao && u < r.quen ? i = 9 :
      u >= r.quen && u < r.denB ? i = 10 :
      u >= r.nhon && u < r.hut ? i = 4 + s(6) :
      u >= r.hut && u < r.doiSao && (i = 3);

      u >= r.doiSao && (o = lerp(t.xNguoi, t.xNguoi - 150, (u - r.doiSao) / 0.6),
        e.kem && u >= r.kemBop && u < r.kemBop + 1.5 ? (a = "thap", i = 9, o += 8 * Math.sin(40 * u) * (1 - (u - r.kemBop) / 1.5)) :
        u < r.cham ? i = 11 : (a = "thap", i = 10 + s(4))
      );
      l.push({ to: a, o: i, x: o, lat: !1, hien: 1 });
    }

    if (u >= r.beoVao) {
      let t = sao(e, u),
          a = e.noi ? t.xNguoi : sao(e, r.doiSao - 0.001).xNguoi + 110;
      if (!e.noi && u < r.beoVao + 1.1) {
        l.push({ to: "cao", o: s(4), x: lerp(THE_GIOI.rong + 120, a, (u - r.beoVao) / 1.1), lat: !0, hien: 1 });
        return l;
      }
      if (!e.noi && u < r.doiSao) {
        l.push({ to: "cao2", o: 5, x: a, lat: !0, hien: 1 });
        return l;
      }
      let o = "cao2",
          h = 0,
          d = lerp(a, t.xNguoi, (u - r.doiSao) / 0.5);
      if (u < r.ne) h = e.noi ? Math.floor(1.2 * u) % 2 : u < r.nham + 0.4 ? 0 : 1;
      else if (u < r.choc) h = nhipSong((u - r.ne) % U.ne - 0.15, 1, 0.5) > 0.4 ? 2 : 3;
      else if (u < r.rung) {
        let e = u - r.choc;
        h = nhipSong(e, 2, 0.45) > 0.4 ? e > 0.45 ? 4 : 2 : 3;
      } else u < r.cham ? h = 6 : u < r.cham + 1.2 ? h = 7 : (o = "cao", h = 8 + s(4));
      l.push({ to: o, o: h, x: d, lat: !1, hien: 1 });
    }
    return l;
  }

  function loiThoai(e) {
    let t = mocLuot(e),
        a = 6.4 * !(!e.moDau),
        n = [];
    e.moDau && (
      n.push({ ai: "ty", chu: "Muối tôm Tây Ninh chính hiệu nè!", t0: 1.6, t1: 4.2 }),
      n.push({ ai: "mit", chu: "Giờ chỉ thiếu xoài thôi…", t0: 4.3, t1: 6.2 })
    );
    e.noi ? (
      n.push({ ai: "beo", chu: "Để anh chọc tiếp cho!", t0: a + 0.2, t1: a + Math.min(1.9, t.quetXong - 0.1) }),
      n.push({ ai: "ty", chu: "Anh Bèo chọc lẹ lên!", t0: a + 1.2, t1: a + 3 }),
      e.khung.length && n.push({ ai: "beo", chu: "Quả nào ngon ta…", t0: a + 2, t1: a + t.quetXong - 0.1 }),
      n.push({ ai: "beo", chu: "Quả này nè!", t0: a + t.quetXong, t1: a + (e.ne ? t.ne + 0.3 : t.choc + 0.3) })
    ) : (
      e.khung.length && n.push({ ai: "ty", chu: "Quả nào ngon nhất ta?", t0: a + U.quet, t1: a + U.quet + 1.7 }),
      n.push({ ai: "ty", chu: "Quả này chắc ngọt nè!", t0: a + t.denA, t1: a + t.kien }),
      n.push({ ai: "ty", chu: "Á! Kiến cắn!!", t0: a + t.kien, t1: a + t.gai }),
      n.push({ ai: "ty", chu: "Ui da… ngứa quá!", t0: a + t.gai + 0.3, t1: a + t.nhatSao }),
      n.push({ ai: "mit", chu: "Hi hi, đáng đời!", t0: a + t.gai + 0.2, t1: a + t.nhatSao - 0.2 }),
      n.push({ ai: "ty", chu: "Ủa… nãy chọc quả nào ta?", t0: a + t.quen, t1: a + t.denB }),
      n.push({ ai: "ty", chu: "Thôi, quả này!", t0: a + t.denB, t1: a + t.nhon }),
      n.push({ ai: "ty", chu: "Ráng… ráng chút nữa…", t0: a + t.nhon, t1: a + t.hut - 0.2 }),
      n.push({ ai: "ty", chu: "Không tới!!", t0: a + t.hut - 0.2, t1: a + t.beoVao + 0.9 }),
      n.push({ ai: "beo", chu: "Đưa đây, để anh!", t0: a + t.beoVao + 1, t1: a + t.doiSao + 0.4 }),
      n.push({ ai: "beo", chu: "Quả đó hả? Dễ ợt!", t0: a + t.doiSao + 0.4, t1: a + (e.ne ? t.ne + 0.3 : t.choc + 0.3) })
    );
    e.ne && (
      n.push({ ai: "beo", chu: "Ơ kìa, nó có võ!", t0: a + t.ne + 0.4, t1: a + (e.ne > 1 ? t.ne + U.ne + 0.4 : t.choc + 0.3) }),
      e.ne > 1 && n.push({ ai: "beo", chu: "Còn lộn nhào nữa hả?!", t0: a + t.ne + U.ne + 0.4, t1: a + t.choc + 0.3 }),
      n.push({ ai: "mit", chu: "Xoài học võ Thiếu Lâm hả?!", t0: a + t.ne + 0.6, t1: a + t.choc + 0.2 })
    );
    e.kem && n.push({ ai: "ty", chu: "Úi da! Rụng trúng đầu tui!", t0: a + t.kemBop, t1: a + t.the });
    n.push({
      ai: "mit",
      chu: e.kem ? "Hai quả luôn kìa!" : "Chấm muối thôi!",
      t0: a + (e.kem ? t.kemCham + 0.2 : t.cham + 0.5),
      t1: a + t.the
    });
    return n;
  }

  // ----------------------------------------------------------------------------
  // 3. NAME TABLE GENERATOR (MODULE 54407)
  // ----------------------------------------------------------------------------
  function bangTenGoi(students) {
    let res = {},
        map = new Map(students.map(s => [s, s.trim().split(/\s+/).filter(Boolean)])),
        maxLen = Math.max(0, ...[...map.values()].map(w => w.length)),
        sliceEnd = (s, len) => (map.get(s) ?? []).slice(-len).join(" ");
    for (let len = 1; len < maxLen; len++) {
      let countMap = new Map();
      for (let s of students) if (!res[s]) countMap.set(sliceEnd(s, len), (countMap.get(sliceEnd(s, len)) ?? 0) + 1);
      let assigned = new Set(Object.values(res));
      for (let s of students) {
        if (!res[s] && countMap.get(sliceEnd(s, len)) === 1 && !assigned.has(sliceEnd(s, len))) {
          res[s] = sliceEnd(s, len);
        }
      }
    }
    for (let s of students) if (!res[s]) res[s] = s.trim();
    return res;
  }

  function tenGoiCua(table, id) {
    return table[id] ?? bangTenGoi([id])[id] ?? id;
  }

  // ----------------------------------------------------------------------------
  // 4. CANVAS RENDERER CLASS (CanhChocXoai - MODULE 68849)
  // ----------------------------------------------------------------------------
  const ASSET_BASE = "/ey/games/mango-poke/";
  const taySaoMapping = {
    thap2: {
      0: [[0.66, 0.53], [0.76, 0.26]],
      1: [[0.64, 0.51], [0.73, 0.23]],
      2: [[0.66, 0.28], [0.7, 0.11]],
      3: [[0.6, 0.54], [0.7, 0.36]],
      4: [[0.67, 0.26], [0.7, 0.115]],
      5: [[0.67, 0.26], [0.69, 0.1]],
      10: [[0.63, 0.46]]
    },
    cao2: {
      0: [[0.74, 0.43], [0.79, 0.19]],
      1: [[0.71, 0.43], [0.78, 0.25]],
      2: [[0.64, 0.28], [0.72, 0.1]],
      3: [[0.67, 0.53], [0.73, 0.29]],
      4: [[0.7, 0.3], [0.81, 0.08]],
      6: [[0.68, 0.42], [0.75, 0.22]],
      7: [[0.67, 0.48]]
    }
  };
  const saoGocTyle = [0.8, 0.84];
  const chieuCaoBe = { thap: CAO_TY, thap2: CAO_TY, cao: CAO_BEO, cao2: CAO_BEO, gai: CAO_MIT };
  const atlasBeGoc = { thap: "thap", thap2: "thap", cao: "cao", cao2: "cao", gai: "gai" };
  const nhanVatId = { thap: "ty", thap2: "ty", cao: "beo", cao2: "beo", gai: "mit" };

  const loadImage = url => new Promise((resolve, reject) => {
    let img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Không tải được ảnh ${url}`));
    img.src = `${url}?v=2`;
  });

  async function loadAtlas(name) {
    let [img, res] = await Promise.all([
      loadImage(ASSET_BASE + name + ".webp"),
      fetch(`${ASSET_BASE}${name}.json?v=2`)
    ]);
    if (!res.ok) throw new Error(`Không tải được dải hoạt cảnh ${name}`);
    let json = await res.json();
    return { img, frames: json.frames };
  }

  class CanhChocXoai {
    constructor(canvas, nen, be, xoai, dov, saoAnh, sanh) {
      this.cv = canvas;
      this.nen = nen;
      this.be = be;
      this.xoai = xoai;
      this.dov = dov;
      this.saoAnh = saoAnh;
      this.sanh = sanh;
      this.onMoc = () => {};
      this.luot = null;
      this.goi = {};
      this.t = 0;
      this.tNen = 0;
      this.dung = false;
      this.dpr = 1;
      this.moc = [];
      this.thoai = [];
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("Không mở được màn vẽ 2D");
      this.ctx = ctx;
    }

    static async tao(canvas, sanh) {
      let [nen, thap, cao, gai, thap2, cao2, xoai, dov, saoAnh] = await Promise.all([
        loadImage(ASSET_BASE + "nen.webp"),
        loadAtlas("thap"),
        loadAtlas("cao"),
        loadAtlas("gai"),
        loadAtlas("thap2"),
        loadAtlas("cao2"),
        loadAtlas("xoai"),
        loadAtlas("do"),
        loadImage(ASSET_BASE + "sao.webp").catch(() => null)
      ]);
      return new CanhChocXoai(canvas, nen, { thap, cao, gai, thap2, cao2 }, xoai, dov, saoAnh, sanh);
    }

    doiCo(w, h, dpr) {
      this.dpr = dpr;
      this.cv.width = Math.round(w * dpr);
      this.cv.height = Math.round(h * dpr);
    }

    datTamDung(p) {
      this.dung = p;
    }

    datThoiGian(t) {
      this.t = t;
    }

    batDauLuot(t) {
      this.luot = t;
      this.t = 0;
      this.dung = false;
      let h = t.moDau ? T_MO_DAU : 0;
      let o = mocLuot(t);
      this.moc = [];
      t.moDau && this.moc.push({ t: 1.3, ten: "do" }, { t: 4.7, ten: "vut" });
      let a = 1.4;
      for (let e = 0; e < t.khung.length; e++) {
        this.moc.push({ t: h + a, ten: "quet" }, { t: h + a + 0.85, ten: "run" });
        a += 1.8;
      }
      this.moc.push(
        { t: h + o.denA, ten: "quet" },
        { t: h + o.chocA + 0.3, ten: "choc" },
        { t: h + o.chocA + 0.72, ten: "choc" },
        { t: h + o.kien, ten: "kien" },
        { t: h + o.datSao + 0.3, ten: "dat" },
        { t: h + o.gai, ten: "gai" },
        { t: h + o.gai + 1, ten: "gai" },
        { t: h + o.nhatSao + 0.3, ten: "dat" },
        { t: h + o.denB, ten: "quet" },
        { t: h + o.nhon, ten: "nhon" },
        { t: h + o.hut - 0.2, ten: "hut" },
        { t: h + o.beoVao, ten: "buoc" },
        { t: h + o.doiSao, ten: "vut" },
        ...(t.noi ? [{ t: h + o.quetXong, ten: "quet" }] : []),
        ...Array.from({ length: t.ne }, (t, a) => [
          { t: h + o.ne + a * U.ne + 0.08, ten: "vo" },
          { t: h + o.ne + a * U.ne + 0.3, ten: "vut" }
        ]).flat(),
        ...(t.kem ? [
          { t: h + o.kemRoi, ten: "roi" },
          { t: h + o.kemBop, ten: "bop" },
          { t: h + o.kemCham, ten: "dat" }
        ] : []),
        { t: h + o.choc + 0.22, ten: "choc" },
        { t: h + o.choc + 0.67, ten: "choc" },
        { t: h + o.rung, ten: "gay" },
        { t: h + o.rung + 0.05, ten: "roi" },
        { t: h + o.cham, ten: "bich" },
        { t: h + o.cham + 0.4, ten: "mung" },
        { t: h + o.the, ten: "the" }
      );
      this.thoai = loiThoai(t);
    }

    tua() {
      if (this.luot) {
        let tEnd = (this.luot.moDau ? T_MO_DAU : 0) + mocLuot(this.luot).the + 0.01;
        this.t = Math.max(this.t, tEnd);
        this.onMoc("the");
      }
    }

    veKhung(atlas, frameIdx, x, y, w, h, opts = {}) {
      let f = atlas.frames[String(frameIdx)];
      if (!f) return;
      let s = this.ctx;
      s.save();
      s.translate(x, y);
      opts.quay && s.rotate(opts.quay);
      opts.lat && s.scale(-1, 1);
      opts.alpha !== undefined && (s.globalAlpha = opts.alpha);
      s.drawImage(atlas.img, f.x, f.y, f.w, f.h, -w * (opts.ox ?? 0.5), -h * (opts.oy ?? 0.5), w, h);
      s.restore();
    }

    mayQuay(t, h) {
      let o = { cx: THE_GIOI.rong / 2, cy: 545, z: 1 };
      if (!t) return o;
      let a = h - (t.moDau ? T_MO_DAU : 0),
          n = mocLuot(t),
          l = (t, e, h) => {
            let a = smoothstep(h);
            return { cx: t.cx + (e.cx - t.cx) * a, cy: t.cy + (e.cy - t.cy) * a, z: t.z + (e.z - t.z) * a };
          };
      if (a < 0) return l({ cx: GIAY.x + 30, cy: 800, z: 1.9 }, o, (h - 4.6) / 1.8);
      let s = t.qua.find(e => e.ten === t.moi),
          u = t.qua.find(e => e.ten === t.chon),
          c = t => ({ cx: Math.max(560, Math.min(THE_GIOI.rong - 560, t.x)), cy: Math.min(560, t.y + 280), z: 1.18 });
      if (t.noi) return a < n.quetXong ? o : a < n.rung ? l(o, c(u), (a - n.quetXong) / 0.8) : l(c(u), o, (a - n.rung) / 0.9);
      let r = { cx: sao(t, n.gai).xNguoi + 120, cy: 780, z: 1.55 };
      return a < n.denA ? o : a < n.kien ? l(o, c(s), (a - n.denA) / 0.8) : a < n.nhatSao ? l(c(s), r, (a - n.kien) / 0.6) : a < n.denB ? l(r, o, (a - n.nhatSao) / 0.9) : a < n.rung ? l(o, c(u), (a - n.denB) / 0.8) : l(c(u), o, (a - n.rung) / 0.9);
    }

    khungHinh(dt, o, a) {
      let n = Math.min(0.06, Math.max(0, dt));
      if (!this.dung) {
        this.tNen += n;
        if (this.luot) {
          let prevT = this.t;
          this.t += n;
          for (let e of this.moc) {
            if (prevT < e.t && this.t >= e.t) this.onMoc(e.ten);
          }
        }
      }
      let m = this.ctx,
          g = this.luot ?? this.sanh,
          y = !(!this.luot),
          x = y ? this.t : this.tNen,
          d = g.moDau && y ? T_MO_DAU : 0,
          f = y ? x - d : -999,
          p = mocLuot(g),
          A = { ten: [], chu: [], thoai: [] };

      m.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      m.globalAlpha = 1;
      m.imageSmoothingEnabled = true;
      m.imageSmoothingQuality = "medium";

      let v = Math.max(o / THE_GIOI.rong, a / THE_GIOI.cao),
          b = this.mayQuay(y ? g : null, x),
          M = Math.max(v, Math.min(o / 1336, a / 865)) * b.z,
          T = Math.max(0, Math.min(THE_GIOI.rong - o / M, b.cx - o / M / 2)),
          k = Math.max(0, Math.min(THE_GIOI.cao - a / M, b.cy - a / M / 2));

      m.drawImage(this.nen, -T * M, -k * M, THE_GIOI.rong * M, THE_GIOI.cao * M);

      let C = t => (t - T) * M,
          _ = t => (t - k) * M,
          I = 190 * M,
          O = 228 / 256 * I,
          S = y && g.moDau ? clamp01((x - 2) / 2.2) : 1;

      S < 1 && this.veKhung(this.dov, 2, C(GIAY.x), _(GIAY.y), I, O);
      S > 0 && this.veKhung(this.dov, 3, C(GIAY.x), _(GIAY.y), I, O, { alpha: S });

      let K = CAO_QUA / 0.62 * M * (192 / 171),
          G = CAO_QUA / 0.62 * M,
          q = Math.max(10, Math.min(16, 13 * M)),
          w = [];

      for (let t of g.qua) {
        let o = y ? trangThaiQua(g, t, f, x) : { x: t.x, y: t.y, goc: 0.06 * Math.sin(1.3 * x + t.pha), bieuCam: t.ranh, treo: true, run: 0 },
            a = KHUNG_XOAI[o.bieuCam];
        if (y && (t.ten === g.chon || t.ten === g.kem) && !o.treo) {
          w.push({ ten: t.ten, x: o.x, y: o.y, goc: o.goc, khung: a });
          continue;
        }
        let n = y && t.ten === g.chon ? neCuaQua(g, f) : null,
            i = n && n.nhat >= 0 ? 0.5 : 0.08,
            l = (i - 0.08) * G;

        if (n && n.nhanh > 0) {
          for (let h = 5; h >= 1; h--) {
            let o = trangThaiQua(g, t, f - 0.028 * h, x - 0.028 * h);
            this.veKhung(this.xoai, a, C(o.x), _(o.y) + l, K, G, { quay: o.goc, oy: i, alpha: 0.42 * (1 - h / 6) * n.nhanh });
          }
          let h = trangThaiQua(g, t, f - 0.12, x - 0.12);
          m.save();
          m.strokeStyle = "rgba(255,255,255,0.85)";
          m.lineCap = "round";
          m.lineWidth = Math.max(1.5, 3 * M);
          for (let t of [-0.35, 0, 0.35]) {
            let a = _(o.y + CAO_QUA * (0.45 + t)),
                i = _(h.y + CAO_QUA * (0.45 + t));
            m.globalAlpha = 0.7 * n.nhanh;
            m.beginPath();
            m.moveTo(C(o.x) - Math.sign(o.x - h.x) * K * 0.45, a);
            m.lineTo(C(h.x), i);
            m.stroke();
          }
          m.restore();
        }
        this.veKhung(this.xoai, a, C(o.x), _(o.y) + l, K, G, { quay: o.goc, oy: i });
        A.ten.push({
          id: t.ten,
          ten: tenGoiCua(this.goi, t.ten),
          x: C(o.x),
          y: _(o.y + 1.06 * CAO_QUA),
          coChu: q,
          chon: false,
          nguy: o.run > 0.9
        });
      }

      let B = y ? cacBe(g, x) : [],
          D = {},
          P = y && f >= 0 ? sao(g, f) : null,
          U_be = B.map(t => {
            let h = this.be[t.to],
                o = h.frames[String(t.o)];
            if (!o) return null;
            let a = this.be[atlasBeGoc[t.to]].frames["0"],
                n = chieuCaoBe[t.to] / (a.bb[3] - a.bb[1]) * M,
                i = n * (o.w / o.h),
                l = _(MAT_DAT) - o.bb[3] * n,
                s = C(t.x);
            return {
              b: t,
              a: h,
              f: o,
              oh: n,
              ow: i,
              top: l,
              x: s,
              diem: e => ({ x: s + (t.lat ? -1 : 1) * (e[0] - 0.5) * i, y: l + e[1] * n })
            };
          }).filter(Boolean);

      if (P) {
        let t = { x: C(P.dau.x), y: _(P.dau.y) };
        if (P.goc) {
          this.veSao({ x: C(P.goc.x), y: _(P.goc.y) }, t, M, 0);
        } else {
          let e = U_be.find(t => nhanVatId[t.b.to] === P.ai),
              h = e && taySaoMapping[e.b.to]?.[e.b.o];
          if (e && h) {
            this.veSao(e.diem(h[0]), t, M, h[1] ? Math.hypot((h[1][0] - h[0][0]) * e.ow, (h[1][1] - h[0][1]) * e.oh) : 40 * M);
          } else if (e && "thap2" === e.b.to && 9 === e.b.o) {
            this.veSao(e.diem(saoGocTyle), t, M, 0);
          } else if (e) {
            this.veSao(e.diem([0.62, 0.66]), t, M, 0);
          }
        }
      }

      for (let { b: t, a: h, oh: o, ow: a, top: n, x: i, f: l } of U_be) {
        m.save();
        m.globalAlpha = 0.28;
        m.fillStyle = "#3b1d0a";
        m.beginPath();
        m.ellipse(i, _(MAT_DAT), 0.22 * a, 0.045 * a, 0, 0, 2 * Math.PI);
        m.fill();
        m.restore();
        this.veKhung(h, t.o, i, n, a, o, { oy: 0, lat: t.lat });
        D[nhanVatId[t.to]] = { x: i, y: n + l.bb[1] * o };
      }

      if (y && f >= p.denA - 1.5 && f < p.nhatSao) {
        let t = U_be.find(t => "ty" === nhanVatId[t.b.to]);
        if (t) {
          let h = t.x + 0.08 * t.ow,
              o = _(MAT_DAT) - 4 * M;
          for (let a = 0; a < 7; a++) {
            let n, l;
            if (f < p.kien) {
              let t = clamp01((f - (p.denA - 1.5) - 0.18 * a) / (p.kien - p.denA + 1.2)),
                  s = C(GOC_CAY.x + 40);
              n = s + (h - s) * t + 3 * Math.sin(9 * f + a) * M;
              l = o + 6 * M + 5 * Math.sin(1.7 * a) * M;
            } else {
              let e = 3 * f + 0.9 * a;
              n = h + 12 * Math.cos(e) * M;
              l = o - 0.08 * t.oh - Math.abs(Math.sin(0.7 * e)) * t.oh * 0.12;
            }
            this.veKien(n, l, M, Math.atan2(Math.sin(5 * f + a), 1));
          }
        }
      }

      for (let t of w) {
        this.veKhung(this.xoai, t.khung, C(t.x), _(t.y), 1.15 * K, 1.15 * G, { quay: t.goc });
        let o = f - (t.ten === g.chon ? p.cham : p.kemCham);
        o >= 0 && o < 0.7 && this.veKhung(this.dov, 9, C(t.x), _(t.y + 10), 1.1 * I, 1.1 * O, { alpha: 1 - o / 0.7 });
        o >= 0 && o < 1.4 && this.veKhung(this.dov, 8, C(t.x), _(t.y - 46), 90 * M, 80 * M, { quay: 2 * x, alpha: 1 - clamp01((o - 1) / 0.4) });
        let a = t.ten === g.kem ? _(t.y - 0.75 * CAO_QUA) - 1.6 * q - 6 : _(t.y + 0.62 * CAO_QUA);
        A.ten.push({
          id: t.ten,
          ten: tenGoiCua(this.goi, t.ten),
          x: C(t.x),
          y: a,
          coChu: 1.6 * q,
          chon: true,
          nguy: false
        });
      }

      if (P) {
        for (let t = 0; t < 3; t++) {
          let e = (0.6 * x + t / 3) % 1,
              h = P.dau.x + 40 * Math.sin(2 * x + 2.1 * t),
              o = P.dau.y + 260 * e;
          this.veKhung(this.dov, 4 + t % 2, C(h), _(o), 34 * M, 30 * M, { quay: 3 * x + t, alpha: 0.9 * (1 - e) });
        }
      }

      if (y) {
        for (let t of [p.choc + 0.22, p.choc + 0.67]) {
          let e = f - t;
          if (e >= 0 && e < 0.6) {
            let h = g.qua.find(t => t.ten === g.chon);
            this.veKhung(this.dov, 10, C(h.x), _(h.y + 10), 130 * M * (0.7 + e), 116 * M * (0.7 + e), { alpha: 1 - e / 0.6 });
            A.chu.push({ id: `choc-${t}`, chu: "CHỌC!", x: C(h.x + 90), y: _(h.y - 10), k: e / 0.6 });
          }
        }
      }

      if (y) {
        let t = g.qua.find(t => t.ten === g.chon);
        if (f >= p.kien && f < p.kien + 0.8) {
          let t = B.find(t => "ty" === nhanVatId[t.to]);
          t && A.chu.push({ id: "kien", chu: "CHÍCH!", x: C(t.x + 60), y: _(MAT_DAT - 60), k: (f - p.kien) / 0.8 });
        }
        if (f >= p.rung && f < p.rung + 0.9) {
          A.chu.push({ id: "a", chu: "Á!", x: C(t.x - 60), y: _(t.y), k: (f - p.rung) / 0.9 });
        }
        if (g.ne && f >= p.ne && f < p.choc) {
          let h = neCuaQua(g, f),
              n = f - p.ne - h.nhat * U.ne - 0.15;
          n >= 0 && n < 0.8 && A.chu.push({
            id: `ne-${h.nhat}`,
            chu: "luot" === h.chieu ? "LĂNG BA VI BỘ!" : "HÂY-A!",
            x: C(t.x) < o / 2 ? 0.7 * o : 0.3 * o,
            y: 0.36 * a,
            k: n / 0.8,
            lon: true
          });
        }
        if (g.kem && f >= p.kemBop && f < p.kemBop + 1 && D.ty) {
          A.chu.push({ id: "bop", chu: "BỐP!", x: D.ty.x + 120 * M, y: D.ty.y - 20 * M, k: (f - p.kemBop) / 1 });
        }
        if (f >= p.cham && f < p.cham + 1.1) {
          A.chu.push({ id: "bich", chu: "BỊCH!", x: C(GIAY.x + 120), y: _(GIAY.y - 120), k: (f - p.cham) / 1.1, lon: true });
        }
        for (let t of this.thoai) {
          if (x < t.t0 || x >= t.t1) continue;
          let e = D[t.ai];
          e && A.thoai.push({ id: `${t.ai}-${t.t0}`, chu: t.chu, x: e.x, y: e.y - 8 });
        }
      }

      A.ten = (function (t, e, h) {
        let o = [], a = [];
        for (let n of [...t].sort((t, e) => Number(t.chon) - Number(e.chon) || t.y - e.y || t.x - e.x)) {
          let t_w = n.ten.length * n.coChu * 0.55 + 10,
              i = n.coChu + 6,
              l = Math.max(4 + t_w / 2, Math.min(e - 4 - t_w / 2, n.x)),
              s = n.y,
              u = e => o.some(h => l - t_w / 2 < h.x1 && l + t_w / 2 > h.x0 && e < h.y1 && e + i > h.y0);
          !n.chon && u(s) && (u(s + i + 1) ? u(s - i - 1) || (s -= i + 1) : s += i + 1);
          s = Math.min(h - i - 4, s);
          o.push({ x0: l - t_w / 2, x1: l + t_w / 2, y0: s, y1: s + i });
          a.push({ ...n, x: l, y: s });
        }
        return a;
      })(A.ten, o, a);

      return A;
    }

    veKien(t, e, h, o) {
      let a = this.ctx,
          n = Math.max(1.2, 2.2 * h);
      a.save();
      a.translate(t, e);
      a.rotate(o);
      a.fillStyle = "#7f1d1d";
      a.strokeStyle = "#450a0a";
      a.lineWidth = Math.max(0.6, 0.8 * h);
      for (let [i, l] of [[-(2 * n), 1.2 * n], [0, 0.8 * n], [1.7 * n, n]]) {
        a.beginPath();
        a.ellipse(i, 0, l, 0.8 * l, 0, 0, 2 * Math.PI);
        a.fill();
      }
      a.beginPath();
      for (let t of [-n, 0, n]) {
        a.moveTo(t, 0);
        a.lineTo(t - 0.6 * n, 1.8 * n);
        a.moveTo(t, 0);
        a.lineTo(t - 0.6 * n, -(1.8 * n));
      }
      a.stroke();
      a.restore();
    }

    veSao(t, e, h, o) {
      let a = this.ctx,
          n = e.x - t.x,
          i = e.y - t.y,
          l = Math.hypot(n, i),
          s = Math.atan2(i, n),
          u = 0.9 * o;
      a.save();
      a.translate(t.x, t.y);
      a.rotate(s);
      if (this.saoAnh) {
        let t = 30 * h;
        a.drawImage(this.saoAnh, -u, -t / 2, l + u, t);
      } else {
        let t = Math.max(3, 9 * h);
        a.lineCap = "round";
        a.strokeStyle = "#6b4f1d";
        a.lineWidth = t + 3;
        a.beginPath();
        a.moveTo(-u, 0);
        a.lineTo(l - 30 * h, 0);
        a.stroke();
        a.strokeStyle = "#b9a04a";
        a.lineWidth = t;
        a.beginPath();
        a.moveTo(-u, 0);
        a.lineTo(l - 30 * h, 0);
        a.stroke();
      }
      a.restore();
    }

    huy() {
      this.moc = [];
      this.luot = null;
    }
  }

  // ----------------------------------------------------------------------------
  // 5. WEB AUDIO SOUND ENGINE (MODULE 16749)
  // ----------------------------------------------------------------------------
  const SOUND_NAMES = ["gay", "choc", "bich", "bop", "vut", "kiem", "chieng", "la", "muoi", "buoc", "cuoi", "nen-vuon"];
  const l_midi = e => 440 * Math.pow(2, (e - 69) / 12);
  const MELODY_H = [
    [67, 0, 69, 71, 74, 0, 71, 69], [67, 0, 64, 0, 67, 0, -1, -1], [71, 0, 74, 76, 74, 0, 71, 74],
    [69, 0, 0, 0, -1, -1, -1, -1], [76, 0, 74, 76, 79, 0, 76, 74], [71, 0, 69, 71, 74, 0, -1, -1],
    [69, 71, 69, 67, 64, 0, 67, 69], [67, 0, 0, 0, -1, -1, -1, -1], [74, 76, 74, 71, 69, 0, 71, 0],
    [74, 0, 71, 69, 67, 0, -1, -1], [64, 67, 69, 71, 69, 67, 64, 0], [62, 0, 0, 0, -1, -1, -1, -1],
    [67, 69, 71, 74, 76, 0, 74, 76], [79, 0, 76, 74, 71, 0, -1, -1], [74, 71, 69, 67, 69, 0, 71, 69],
    [67, 0, 0, 0, -1, -1, -1, -1]
  ];
  const BASS_D = [55, 55, 52, 50, 48, 55, 50, 55, 55, 50, 48, 50, 52, 48, 50, 55];
  const SET_P = new Set([2, 12]);

  class ChocXoaiSoundEngine {
    constructor() {
      this.ctx = null;
      this.tong = null;
      this.on = null;
      this.nen = null;
      this.henNhac = null;
      this.nhipTiep = 0;
      this.buoc = 0;
      this.chimTiep = 0;
      this.mau = {};
      this.daNap = false;
      this.nenMau = null;
      this.enabled = true;
    }

    c() {
      if (!this.enabled) return null;
      try {
        if (!this.ctx) {
          let AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return null;
          this.ctx = new AudioCtx();
          this.tong = this.ctx.createGain();
          this.tong.gain.value = 0.8;
          this.tong.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      } catch (e) {
        return null;
      }
    }

    nguonOn(e, loop = false) {
      if (!this.on) {
        let buf = e.createBuffer(1, 2 * e.sampleRate, e.sampleRate),
            data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = 2 * Math.random() - 1;
        this.on = buf;
      }
      let src = e.createBufferSource();
      src.buffer = this.on;
      src.loop = loop;
      return src;
    }

    napTruoc() {
      let ctx = this.c();
      if (ctx && !this.daNap) {
        this.daNap = true;
        for (let name of SOUND_NAMES) {
          fetch(`/ey/games/mango-poke/am/${name}.mp3`)
            .then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status))))
            .then(buf => ctx.decodeAudioData(buf))
            .then(decoded => {
              this.mau[name] = decoded;
              if (name === "nen-vuon" && this.nen && !this.nenMau) this.batNenVuon();
            })
            .catch(() => {});
        }
      }
    }

    choi(name, t, vol, rate = 1) {
      let ctx = this.ctx,
          buf = this.mau[name];
      if (!ctx || !buf || !this.tong) return false;
      let src = ctx.createBufferSource(),
          gain = ctx.createGain();
      src.buffer = buf;
      src.playbackRate.value = rate;
      gain.gain.value = vol;
      src.connect(gain).connect(this.tong);
      src.start(t);
      return true;
    }

    batNenVuon() {
      let ctx = this.ctx,
          buf = this.mau["nen-vuon"],
          nen = this.nen;
      if (!ctx || !buf || !nen) return;
      let src = ctx.createBufferSource(),
          gain = ctx.createGain();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = 0.03;
      src.loopEnd = buf.duration - 0.03;
      gain.gain.value = 9;
      src.connect(gain).connect(nen.ve);
      src.start(ctx.currentTime, 0.03);
      this.nenMau = src;
      nen.veTongHop.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }

    batNen() {
      let ctx = this.c();
      if (!ctx || this.nen) return;
      this.napTruoc();
      let t = ctx.currentTime,
          makeGain = maxVol => {
            let g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(maxVol, t + 1.2);
            g.connect(this.tong);
            return g;
          },
          veGain = makeGain(0.022),
          nhacGain = makeGain(0.34),
          vangGain = ctx.createGain();
      vangGain.gain.value = 0.22;
      let delay = ctx.createDelay(1);
      delay.delayTime.value = 0.27;
      let delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.3;
      let delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.value = 2600;
      vangGain.connect(delay).connect(delayFilter).connect(delayFeedback).connect(delay);
      delayFilter.connect(nhacGain);

      let noise = this.nguonOn(ctx, true),
          bandFilter = ctx.createBiquadFilter();
      bandFilter.type = "bandpass";
      bandFilter.frequency.value = 5200;
      bandFilter.Q.value = 6;
      let noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;

      let lfo1 = ctx.createOscillator();
      lfo1.frequency.value = 38;
      let lfoGain1 = ctx.createGain();
      lfoGain1.gain.value = 0.5;
      lfo1.connect(lfoGain1).connect(noiseGain.gain);

      let lfo2 = ctx.createOscillator();
      lfo2.frequency.value = 0.18;
      let lfoGain2 = ctx.createGain();
      lfoGain2.gain.value = 0.3;
      lfo2.connect(lfoGain2).connect(noiseGain.gain);

      let veTongHop = ctx.createGain();
      noise.connect(bandFilter).connect(noiseGain).connect(veTongHop).connect(veGain);
      noise.start();
      lfo1.start();
      lfo2.start();

      this.nen = { ve: veGain, nhac: nhacGain, vang: vangGain, veTongHop };
      this.batNenVuon();
      this.nhipTiep = ctx.currentTime + 0.2;
      this.buoc = 0;
      this.chimTiep = ctx.currentTime + 2.5;
      this.henNhac = window.setInterval(() => this.lichNhac(), 120);
    }

    tatNen() {
      if (this.henNhac !== null) window.clearInterval(this.henNhac);
      this.henNhac = null;
      let ctx = this.ctx;
      if (ctx && this.nen) {
        let t = ctx.currentTime;
        for (let g of Object.values(this.nen)) {
          g.gain.cancelScheduledValues(t);
          g.gain.setTargetAtTime(0, t, 0.15);
        }
        let nenObj = this.nen,
            nenMau = this.nenMau;
        window.setTimeout(() => {
          Object.values(nenObj).forEach(g => g.disconnect());
          try { nenMau?.stop(); } catch (e) {}
        }, 900);
      }
      this.nen = null;
      this.nenMau = null;
    }

    lichNhac() {
      let ctx = this.ctx;
      if (!ctx || !this.nen) return;
      let tempo = 60 / 112 / 2;
      while (this.nhipTiep < ctx.currentTime + 0.4) {
        let t = this.nhipTiep,
            step = this.buoc % 128,
            sub = step % 8,
            bar = Math.floor(step / 8),
            note = MELODY_H[bar][sub];
        if (note > 0) {
          let dur = 1;
          for (let i = sub + 1; i < 8 && MELODY_H[bar][i] === 0; i++) dur++;
          bar < 8 ? this.synthSao(l_midi(note), t, dur * tempo, 0.2, 0 === sub || dur >= 2)
                    : this.synthTranh(l_midi(note), t, 0.26, this.nen.nhac, 0.9 + 0.2 * dur);
        }
        let bass = BASS_D[bar],
            extra = SET_P.has(bar) ? 15 : 16;
        0 === sub && this.synthTranh(l_midi(bass - 12), t, 0.34, this.nen.nhac, 1.1);
        4 === sub && this.synthTranh(l_midi(bass - 5), t, 0.24, this.nen.nhac, 0.8);
        (2 === sub || 6 === sub) && (
          this.synthTranh(l_midi(bass + 7), t, 0.07, this.nen.nhac, 0.5),
          this.synthTranh(l_midi(bass + extra - 12), t + 0.012, 0.06, this.nen.nhac, 0.5)
        );
        (0 === sub || 4 === sub) && this.synthMo(t, 0.16, 820, this.nen.nhac);
        (2 === sub || 6 === sub) && this.synthMo(t, 0.07, 2100, this.nen.nhac);
        bar % 8 === 7 && sub >= 5 && this.synthMo(t, 0.1 + (sub - 5) * 0.03, 1050 + (sub - 5) * 140, this.nen.nhac);

        this.nhipTiep += tempo;
        this.buoc++;
      }
      if (!this.nenMau && ctx.currentTime > this.chimTiep) {
        this.synthChim(ctx.currentTime + 0.05, this.nen.ve);
        this.chimTiep = ctx.currentTime + 5 + 6 * Math.random();
      }
    }

    synthSao(freq, t, dur, vol, vibrato) {
      let ctx = this.ctx,
          nen = this.nen;
      let osc1 = ctx.createOscillator(),
          osc2 = ctx.createOscillator(),
          g1 = ctx.createGain(),
          g2 = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(vibrato ? 0.95 * freq : freq, t);
      osc1.frequency.exponentialRampToValueAtTime(freq, t + (vibrato ? 0.07 : 0.01));
      osc2.frequency.value = 2 * freq;
      g2.gain.value = 0.08;
      let lfo = ctx.createOscillator(),
          lfoG = ctx.createGain();
      lfo.frequency.value = 5.6;
      lfoG.gain.setValueAtTime(0, t);
      lfoG.gain.linearRampToValueAtTime(0.012 * freq, t + Math.min(0.35, dur));
      lfo.connect(lfoG).connect(osc1.frequency);
      let endT = t + Math.max(0.12, 0.94 * dur);
      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(vol, t + 0.035);
      g1.gain.setValueAtTime(0.85 * vol, endT - 0.05);
      g1.gain.linearRampToValueAtTime(0, endT + 0.06);
      osc1.connect(g1);
      osc2.connect(g2).connect(g1);
      g1.connect(nen.nhac);
      g1.connect(nen.vang);
      osc1.start(t);
      osc1.stop(endT + 0.1);
      osc2.start(t);
      osc2.stop(endT + 0.1);
      lfo.start(t);
      lfo.stop(endT + 0.1);
    }

    synthTranh(freq, t, vol, target, decay = 0.9) {
      let ctx = this.ctx,
          osc1 = ctx.createOscillator(),
          osc2 = ctx.createOscillator(),
          filter = ctx.createBiquadFilter(),
          g1 = ctx.createGain(),
          g2 = ctx.createGain();
      osc1.type = "triangle";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(1.012 * freq, t);
      osc1.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
      osc2.frequency.value = 2 * freq;
      g2.gain.value = 0.35;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(9 * freq, t);
      filter.frequency.exponentialRampToValueAtTime(1.8 * freq, t + decay);
      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(vol, t + 0.004);
      g1.gain.exponentialRampToValueAtTime(0.001, t + decay);
      osc1.connect(filter);
      osc2.connect(g2).connect(filter);
      filter.connect(g1).connect(target);
      osc1.start(t);
      osc1.stop(t + decay + 0.05);
      osc2.start(t);
      osc2.stop(t + decay + 0.05);
    }

    synthMo(t, vol, freq, target) {
      let ctx = this.ctx,
          osc = ctx.createOscillator(),
          gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1.3 * freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.012);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain).connect(target);
      osc.start(t);
      osc.stop(t + 0.1);
    }

    synthChim(t, target) {
      let ctx = this.ctx,
          count = 2 + Math.floor(3 * Math.random()),
          freq = 2600 + 900 * Math.random();
      for (let i = 0; i < count; i++) {
        let osc = ctx.createOscillator(),
            gain = ctx.createGain(),
            startT = t + i * (0.11 + 0.05 * Math.random());
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startT);
        osc.frequency.exponentialRampToValueAtTime(1.45 * freq, startT + 0.06);
        gain.gain.setValueAtTime(0, startT);
        gain.gain.linearRampToValueAtTime(1.6, startT + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.08);
        osc.connect(gain).connect(target);
        osc.start(startT);
        osc.stop(startT + 0.1);
      }
    }

    onNgan(e, t, dur, type, freq1, freq2, vol) {
      let noise = this.nguonOn(e),
          filter = e.createBiquadFilter(),
          gain = e.createGain();
      filter.type = type;
      filter.frequency.setValueAtTime(freq1, t);
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(filter).connect(gain).connect(this.tong);
      noise.start(t);
      noise.stop(t + dur + 0.05);
    }

    synthAm(e, t, type, f1, f2, dur, vol) {
      let osc = e.createOscillator(),
          gain = e.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(this.tong);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }

    phat(event) {
      let ctx = this.c();
      if (!ctx || !this.tong) return;
      let t = ctx.currentTime,
          tong = this.tong;
      switch (event) {
        case "do":
          if (this.choi("muoi", t, 0.5)) break;
          for (let i = 0; i < 26; i++) this.onNgan(ctx, t + 0.09 * i + 0.05 * Math.random(), 0.05, "highpass", 3000 + 3000 * Math.random(), 2500, 0.18);
          break;
        case "vut":
          this.choi("vut", t, 0.55) || this.onNgan(ctx, t, 0.35, "bandpass", 400, 2600, 0.6);
          break;
        case "quet":
          if (this.choi("la", t, 0.45, 0.95 + 0.15 * Math.random())) break;
          this.onNgan(ctx, t, 0.6, "bandpass", 2400, 1200, 0.35);
          break;
        case "run":
          for (let i = 0; i < 6; i++) this.synthAm(ctx, t + 0.05 * i, "square", 660 + i % 2 * 40, 640, 0.04, 0.05);
          break;
        case "nhon":
          [62, 64, 67, 69, 71].forEach((note, idx) => this.synthTranh(l_midi(note + 12), t + 0.2 * idx, 0.3, tong, 0.5));
          break;
        case "hut":
          this.synthAm(ctx, t, "sine", 780, 520, 0.45, 0.14);
          this.synthAm(ctx, t + 0.5, "sine", 600, 260, 0.85, 0.15);
          break;
        case "buoc":
          for (let i = 0; i < 4; i++) {
            this.choi("buoc", t + 0.27 * i, 0.5, 0.9 + i % 2 * 0.12) || this.onNgan(ctx, t + 0.27 * i, 0.07, "lowpass", 500, 120, 0.5);
          }
          break;
        case "choc":
          if (this.choi("choc", t, 0.6, 0.92 + 0.16 * Math.random())) break;
          this.synthMo(t, 0.5, 620, tong);
          this.onNgan(ctx, t, 0.1, "bandpass", 2200, 1200, 0.3);
          break;
        case "gay":
          if (this.choi("gay", t, 0.75)) break;
          this.onNgan(ctx, t, 0.06, "highpass", 2500, 1500, 0.55);
          break;
        case "roi":
          this.synthAm(ctx, t, "sine", 1500, 420, 0.95, 0.15);
          break;
        case "bich":
          if (this.choi("bich", t, 0.8)) break;
          this.synthAm(ctx, t, "sine", 140, 45, 0.4, 0.9);
          this.onNgan(ctx, t, 0.25, "lowpass", 900, 100, 0.8);
          break;
        case "kien":
          this.synthAm(ctx, t, "square", 2400, 1800, 0.06, 0.18);
          this.synthAm(ctx, t + 0.08, "triangle", 900, 300, 0.4, 0.3);
          break;
        case "gai":
          for (let i = 0; i < 7; i++) this.onNgan(ctx, t + 0.13 * i, 0.09, "bandpass", 2600, 1400, 0.3);
          break;
        case "dat":
          this.synthMo(t, 0.35, 480, tong);
          this.synthMo(t + 0.11, 0.22, 430, tong);
          break;
        case "bop":
          this.choi("bop", t, 0.6) || this.synthAm(ctx, t, "sine", 520, 180, 0.35, 0.4);
          break;
        case "mung":
          [67, 71, 74, 76, 79, 83].forEach((note, idx) => this.synthTranh(l_midi(note), t + 0.07 * idx, 0.3, tong, 0.9));
          this.synthMo(t + 0.45, 0.3, 900, tong);
          this.choi("cuoi", t + 0.15, 0.32);
          break;
        case "vo":
          this.choi("kiem", t, 0.6) || this.onNgan(ctx, t, 0.22, "bandpass", 700, 5200, 0.7);
          this.choi("chieng", t + 0.08, 0.3);
          break;
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 6. MAIN CHỌC XOÀI CHẤM MUỐI CONTROLLER CLASS
  // ----------------------------------------------------------------------------
  class ChocXoaiChamMuoiGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.roster = this.normalizeRoster(options.roster || options.classRoster || []);
      this.calledStudents = new Set();
      this.pickCount = 1;
      this.currentWinners = [];
      this.scene = null;
      this.sound = new ChocXoaiSoundEngine();
      this.status = "tai"; // tai | sanh | luot | the | het
      this.isPaused = false;
      this.hasPlayedIntro = false;
      this.rafId = null;
      this.lastTime = 0;
      this.resizeObserver = null;
      this.keyHandler = this.handleKeyDown.bind(this);

      injectGameStyles();
      this.initDom();
      this.initEngine();
    }

    normalizeRoster(rawRoster) {
      if (!Array.isArray(rawRoster) || rawRoster.length === 0) {
        return [
          "Ngọc", "Mai Anh", "Ý", "Vy", "Phương Anh", "Mạnh", "Tùng", "Thảo",
          "Diệp", "Hoàng Long", "Ngân", "Trúc", "Huy", "Thư", "Tuấn", "Quốc Bảo",
          "Hưng", "Hoàng Yến", "Duyên", "Phong", "Thùy Linh", "Mai", "Châu", "Minh",
          "Đức Long", "Phát", "Phúc", "Sơn", "Quân", "Hân", "An", "Vân", "Dũng",
          "Nam", "Quỳnh", "Hà", "Gia Bảo", "Nguyên", "Chi", "Khánh Linh", "Đức Anh",
          "Hải Yến", "Vinh", "Kiệt", "Khôi"
        ];
      }
      return rawRoster.map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && item.name) return item.name.trim();
        return String(item);
      }).filter(Boolean);
    }

    initDom() {
      this.container.innerHTML = `
        <div class="mooncake-shell cx-shell">
          <canvas id="cx-main-canvas" class="cx-canvas"></canvas>
          <div id="cx-lop-ten" class="cx-lop" aria-hidden="true"></div>
          <div id="cx-lop-chu" class="cx-lop" aria-hidden="true"></div>
          <div id="cx-lop-thoai" class="cx-lop cx-lop-thoai" aria-hidden="true"></div>

          <!-- Top Control Header -->
          <div style="position: absolute; top: 16px; left: 24px; right: 24px; z-index: 35; display: flex; justify-content: space-between; align-items: center; pointer-events: auto;">
            <!-- Title & Class Info -->
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); padding: 8px 18px; border-radius: 9999px; border: 1.5px solid rgba(250, 204, 21, 0.45); box-shadow: 0 6px 18px rgba(0,0,0,0.4);">
                <span style="font-size: 22px;">🥭</span>
                <div>
                  <span style="font-weight: 900; font-size: 15px; color: #facc15; letter-spacing: 0.5px;">Chọc Xoài Chấm Muối</span>
                  <span id="cx-class-title" style="font-size: 12.5px; color: #94a3b8; margin-left: 8px; font-weight: 700;">${this.options.className || 'Chơi thử'} (${this.roster.length} bạn)</span>
                </div>
              </div>
              <button id="cx-btn-roster" title="Xem danh sách học sinh" style="padding: 0 16px; height: 42px; border-radius: 9999px; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #f1f5f9; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px); transition: all 0.2s;">
                <span>📋</span> <span>Danh sách</span>
              </button>
            </div>

            <!-- Pick Count Selector -->
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); padding: 5px 14px; border-radius: 9999px; border: 1.5px solid rgba(250, 204, 21, 0.45); box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
              <span style="font-size: 12.5px; font-weight: 800; color: #facc15; white-space: nowrap;">Gọi cùng lúc:</span>
              <div id="cx-count-selector" style="display: flex; gap: 5px;">
                <button data-count="1" class="cx-count-btn is-active" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: #ea580c; color: #fff; font-size: 14px; font-weight: 900; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(234,88,12,0.5);">1</button>
                <button data-count="2" class="cx-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">2</button>
                <button data-count="3" class="cx-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">3</button>
                <button data-count="4" class="cx-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">4</button>
                <button data-count="5" class="cx-count-btn" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">5</button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; align-items: center; gap: 10px;">
              <button id="cx-btn-fullscreen" title="Toàn màn hình" style="width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s;">
                ⛶
              </button>
              <button id="cx-btn-sound" title="Bật/Tắt âm thanh" style="width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.2s;">
                🔊
              </button>
              <button id="cx-btn-pause" title="Tạm dừng" style="padding: 0 16px; height: 42px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.85); color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px); transition: all 0.2s;">
                <span id="cx-pause-icon">⏸</span> <span id="cx-pause-text">Tạm dừng</span>
              </button>
              <button id="cx-btn-exit" title="Thoát trò chơi" style="padding: 0 18px; height: 42px; border-radius: 12px; border: 1.5px solid rgba(239, 68, 68, 0.4); background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(239,68,68,0.4); transition: all 0.2s;">
                ✕ Thoát
              </button>
            </div>
          </div>

          <!-- Loading View -->
          <div id="cx-loading" class="cx-tai">
            <div class="cx-tai__vong"></div>
            <p>Đang ra vườn xoài…</p>
          </div>

          <!-- Lobby Start Button View -->
          <div id="cx-lobby" class="cx-sanh" style="display: none;">
            <button id="cx-btn-start" type="button" class="cx-nut cx-nut--lon">Bắt đầu</button>
          </div>

          <!-- Keyboard Shortcut Hint -->
          <div id="cx-hint" class="cx-goi-y" style="display: none;">Enter: xem ngay kết quả</div>

          <!-- Winner Card Modal -->
          <div id="cx-modal" class="cx-the-nen" style="display: none;">
            <div class="cx-the-khung">
              <div class="cx-the__du" aria-hidden="true">
                <span class="cx-the__nhan">XOÀI RỤNG RỒI!</span>
              </div>
              <div class="cx-the">
                <div id="cx-winner-list" class="cx-the__ds"></div>
                <div class="cx-the__nut">
                  <button id="cx-btn-next" type="button" class="cx-nut cx-nut--lon">Chọc tiếp</button>
                  <button id="cx-btn-replay" type="button" class="cx-nut" style="background: #0284c7; border-color: #7dd3fc; box-shadow: 0 6px #0369a1;">Chơi lại</button>
                </div>
                <div class="cx-the__co" aria-hidden="true"></div>
              </div>
            </div>
          </div>

          <!-- Roster Drawer -->
          <div id="cx-drawer-mask" class="cx-drawer-overlay"></div>
          <div id="cx-drawer" class="cx-drawer">
            <div style="padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 900; color: #facc15;">Danh sách học sinh</h3>
                <span id="cx-drawer-stats" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Đã gọi: 0 / ${this.roster.length}</span>
              </div>
              <button id="cx-btn-close-drawer" style="width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,0.1); color: #fff; font-size: 16px; cursor: pointer;">✕</button>
            </div>
            <div id="cx-drawer-list" style="flex: 1; overflow-y: auto; padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;"></div>
            <div style="padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: space-between; gap: 10px;">
              <button id="cx-btn-reset-called" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #f87171; font-weight: 800; cursor: pointer;">Đặt lại danh sách</button>
            </div>
          </div>

        </div>
      `;

      this.canvas = document.getElementById('cx-main-canvas');
      this.lopTen = document.getElementById('cx-lop-ten');
      this.lopChu = document.getElementById('cx-lop-chu');
      this.lopThoai = document.getElementById('cx-lop-thoai');
      this.loadingEl = document.getElementById('cx-loading');
      this.lobbyEl = document.getElementById('cx-lobby');
      this.hintEl = document.getElementById('cx-hint');
      this.modalEl = document.getElementById('cx-modal');
      this.winnerListEl = document.getElementById('cx-winner-list');
      this.drawerEl = document.getElementById('cx-drawer');
      this.drawerMaskEl = document.getElementById('cx-drawer-mask');

      this.bindUiEvents();
    }

    bindUiEvents() {
      // Start button
      document.getElementById('cx-btn-start')?.addEventListener('click', () => {
        this.startTurn({ noi: false });
      });

      // Next poke button
      document.getElementById('cx-btn-next')?.addEventListener('click', () => {
        this.modalEl.style.display = 'none';
        this.startTurn({ noi: true });
      });

      // Replay all button
      document.getElementById('cx-btn-replay')?.addEventListener('click', () => {
        this.calledStudents.clear();
        this.modalEl.style.display = 'none';
        this.hasPlayedIntro = false;
        this.startTurn({ noi: false });
      });

      // Pick count buttons
      const countBtns = document.querySelectorAll('.cx-count-btn');
      countBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.pickCount = parseInt(btn.dataset.count, 10) || 1;
          countBtns.forEach(b => {
            if (b === btn) {
              b.style.background = '#ea580c';
              b.style.color = '#fff';
              b.style.boxShadow = '0 2px 8px rgba(234,88,12,0.5)';
            } else {
              b.style.background = 'rgba(255,255,255,0.08)';
              b.style.color = '#94a3b8';
              b.style.boxShadow = 'none';
            }
          });
        });
      });

      // Pause button
      document.getElementById('cx-btn-pause')?.addEventListener('click', () => {
        this.togglePause();
      });

      // Sound button
      document.getElementById('cx-btn-sound')?.addEventListener('click', () => {
        this.toggleSound();
      });

      // Fullscreen button
      document.getElementById('cx-btn-fullscreen')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          this.container.requestFullscreen?.() || document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      });

      // Exit button
      document.getElementById('cx-btn-exit')?.addEventListener('click', () => {
        this.destroy();
        if (typeof this.options.onExit === 'function') {
          this.options.onExit();
        }
      });

      // Roster drawer open/close
      document.getElementById('cx-btn-roster')?.addEventListener('click', () => {
        this.openDrawer();
      });
      document.getElementById('cx-btn-close-drawer')?.addEventListener('click', () => {
        this.closeDrawer();
      });
      this.drawerMaskEl?.addEventListener('click', () => {
        this.closeDrawer();
      });
      document.getElementById('cx-btn-reset-called')?.addEventListener('click', () => {
        this.calledStudents.clear();
        this.updateDrawer();
      });

      // Keydown events
      window.addEventListener('keydown', this.keyHandler);
    }

    handleKeyDown(e) {
      if (e.target?.tagName === 'INPUT') return;
      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        if (this.status === 'luot') {
          e.preventDefault();
          this.togglePause();
        }
      } else if (e.key === 'Enter') {
        if (this.status === 'luot') {
          e.preventDefault();
          this.scene?.tua();
        }
      } else if (e.key === 'Escape') {
        this.closeDrawer();
      }
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      this.scene?.datTamDung(this.isPaused);
      const icon = document.getElementById('cx-pause-icon');
      const text = document.getElementById('cx-pause-text');
      if (icon && text) {
        icon.textContent = this.isPaused ? '▶' : '⏸';
        text.textContent = this.isPaused ? 'Tiếp tục' : 'Tạm dừng';
      }
      if (this.isPaused) {
        this.sound.tatNen();
      } else {
        this.sound.batNen();
      }
    }

    toggleSound() {
      this.sound.enabled = !this.sound.enabled;
      const btn = document.getElementById('cx-btn-sound');
      if (btn) {
        btn.textContent = this.sound.enabled ? '🔊' : '🔇';
      }
      if (!this.sound.enabled) {
        this.sound.tatNen();
      } else if (this.status === 'luot') {
        this.sound.batNen();
      }
    }

    openDrawer() {
      this.updateDrawer();
      this.drawerEl?.classList.add('is-open');
      this.drawerMaskEl?.classList.add('is-open');
    }

    closeDrawer() {
      this.drawerEl?.classList.remove('is-open');
      this.drawerMaskEl?.classList.remove('is-open');
    }

    updateDrawer() {
      const stats = document.getElementById('cx-drawer-stats');
      if (stats) stats.textContent = `Đã gọi: ${this.calledStudents.size} / ${this.roster.length}`;
      const listEl = document.getElementById('cx-drawer-list');
      if (!listEl) return;
      listEl.innerHTML = this.roster.map((name, i) => {
        const isCalled = this.calledStudents.has(name);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 8px; background: ${isCalled ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${isCalled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)'};">
            <span style="font-weight: 700; color: ${isCalled ? '#4ade80' : '#e2e8f0'}; font-size: 14px;">${i + 1}. ${name}</span>
            <span style="font-size: 12px; font-weight: 800; color: ${isCalled ? '#4ade80' : '#64748b'};">${isCalled ? '✓ Đã gọi' : 'Chưa gọi'}</span>
          </div>
        `;
      }).join('');
    }

    async initEngine() {
      try {
        let initialSanh = taoLuot(this.roster, new Set(), false) || {
          chon: "", moi: "", khung: [], qua: [], moDau: false, lamLai: false, ne: 0, kem: null, noi: false
        };
        this.nameTable = bangTenGoi(this.roster);

        this.scene = await CanhChocXoai.tao(this.canvas, initialSanh);
        this.scene.goi = this.nameTable;

        this.scene.onMoc = name => {
          if (name === "the") {
            this.handleMilestoneThe();
          } else {
            this.sound.phat(name);
          }
        };

        const handleResize = () => {
          const w = this.canvas.clientWidth;
          const h = this.canvas.clientHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          this.scene.doiCo(w, h, dpr);
        };
        this.resizeObserver = new ResizeObserver(handleResize);
        this.resizeObserver.observe(this.canvas);
        handleResize();

        // Sound preloading
        this.sound.napTruoc();

        // Loading complete -> show lobby
        this.loadingEl.style.display = 'none';
        this.lobbyEl.style.display = 'flex';
        this.status = "sanh";

        // Start render loop
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        this.rafId = requestAnimationFrame(this.loop);
      } catch (err) {
        console.error("Lỗi khởi tạo vườn xoài:", err);
        if (this.loadingEl) {
          this.loadingEl.innerHTML = '<p style="color: #ef4444; font-weight: 900;">Không thể tải vườn xoài. Vui lòng tải lại trang!</p>';
        }
      }
    }

    startTurn(opts = {}) {
      if (!this.scene) return;
      if (this.roster.length === 0) {
        alert("Danh sách học sinh đang trống!");
        return;
      }

      // If all called, wrap around
      if (this.calledStudents.size >= this.roster.length) {
        this.calledStudents.clear();
      }

      const isFirst = !this.hasPlayedIntro && !opts.noi;
      const turnOpts = {
        noi: !!opts.noi,
        kem: this.pickCount >= 2 || (Math.random() < 0.25)
      };

      const turn = taoLuot(this.roster, this.calledStudents, isFirst, Math.random, turnOpts);
      if (!turn) return;

      this.hasPlayedIntro = true;
      this.status = "luot";
      this.isPaused = false;
      this.scene.batDauLuot(turn);

      // Determine winners
      const winners = [turn.chon];
      if (turn.kem && !winners.includes(turn.kem)) {
        winners.push(turn.kem);
      }
      // If user selected pickCount > 2, add additional uncalled students
      if (this.pickCount > winners.length) {
        const remaining = this.roster.filter(s => !this.calledStudents.has(s) && !winners.includes(s));
        while (winners.length < this.pickCount && remaining.length > 0) {
          const randIdx = Math.floor(Math.random() * remaining.length);
          winners.push(remaining.splice(randIdx, 1)[0]);
        }
      }
      this.currentWinners = winners;

      // Mark winners in called set
      for (const w of winners) {
        this.calledStudents.add(w);
      }

      this.lobbyEl.style.display = 'none';
      this.hintEl.style.display = 'block';
      this.modalEl.style.display = 'none';

      this.sound.batNen();
      this.updateDrawer();
    }

    handleMilestoneThe() {
      this.status = "the";
      this.hintEl.style.display = 'none';

      // Render winners
      if (this.winnerListEl) {
        this.winnerListEl.className = `cx-the__ds cx-the__ds--${Math.min(5, this.currentWinners.length)}`;
        this.winnerListEl.innerHTML = this.currentWinners.map(name => {
          const shortName = tenGoiCua(this.nameTable, name);
          return `<div class="cx-the__ten" style="--n: ${Math.max(8, shortName.length)};">${shortName}</div>`;
        }).join('');
      }

      this.modalEl.style.display = 'flex';
      this.updateDrawer();
    }

    loop(now) {
      this.rafId = requestAnimationFrame(this.loop);
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      if (!this.scene) return;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      const frameData = this.scene.khungHinh(dt, w, h);
      this.renderOverlays(frameData);
    }

    renderOverlays(data) {
      if (!data) return;

      // 1. Render name badges (.cx-ten)
      this.syncDomList(this.lopTen, data.ten, item => {
        const el = document.createElement('div');
        el.className = 'cx-ten';
        el.textContent = item.ten;
        return el;
      }, (el, item) => {
        if (el.textContent !== item.ten) el.textContent = item.ten;
        el.classList.toggle('is-nguy', !!item.nguy);
        el.classList.toggle('is-chon', !!item.chon);
        el.style.fontSize = `${item.coChu.toFixed(1)}px`;
        el.style.transform = `translate(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px) translate(-50%, 0)`;
      });

      // 2. Render action popups (.cx-chu)
      this.syncDomList(this.lopChu, data.chu, item => {
        const el = document.createElement('div');
        el.className = item.lon ? 'cx-chu cx-chu--lon' : 'cx-chu';
        el.textContent = item.chu;
        return el;
      }, (el, item) => {
        let scale = item.k < 0.15 ? 0.4 + item.k / 0.15 * 0.8 : 1.2 - Math.min(0.2, (item.k - 0.15) * 0.4);
        el.style.opacity = String(item.k > 0.8 ? (1 - item.k) / 0.2 : 1);
        el.style.transform = `translate(${item.x.toFixed(1)}px, ${(item.y - 40 * item.k).toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(3)}) rotate(-6deg)`;
      });

      // 3. Render dialogue bubbles (.cx-thoai)
      this.syncDomList(this.lopThoai, data.thoai, item => {
        const el = document.createElement('div');
        el.className = 'cx-thoai';
        el.textContent = item.chu;
        return el;
      }, (el, item) => {
        let halfW = Math.min(150, el.offsetWidth / 2 || 80);
        let clampedX = Math.max(halfW + 8, Math.min(window.innerWidth - halfW - 8, item.x));
        el.style.transform = `translate(${clampedX.toFixed(1)}px, ${item.y.toFixed(1)}px) translate(-50%, -100%)`;
        el.style.setProperty('--duoi', `${(item.x - clampedX).toFixed(1)}px`);
      });
    }

    syncDomList(parent, items, createFn, updateFn) {
      if (!parent) return;
      const seen = new Set();
      for (const item of items) {
        seen.add(item.id);
        let el = parent.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
        if (!el) {
          el = createFn(item);
          el.dataset.id = item.id;
          parent.appendChild(el);
        }
        updateFn(el, item);
      }
      for (const child of Array.from(parent.children)) {
        if (!seen.has(child.dataset.id)) {
          child.remove();
        }
      }
    }

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.resizeObserver?.disconnect();
      window.removeEventListener('keydown', this.keyHandler);
      this.sound.tatNen();
      this.scene?.huy();
      this.scene = null;
      if (this.container) {
        this.container.innerHTML = '';
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 7. GLOBAL EXPORT
  // ----------------------------------------------------------------------------
  global.launchChocXoaiChamMuoi = function (container, options = {}) {
    const game = new ChocXoaiChamMuoiGame(container, options);
    window.__currentChocXoaiInstance = game;
    return () => {
      game.destroy();
      window.__currentChocXoaiInstance = null;
    };
  };

})(typeof window !== 'undefined' ? window : this);
