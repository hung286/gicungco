/* Khung xem ảnh (infographic, sơ đồ tư duy): mở ngay trên trang, ảnh căn giữa,
   phóng to / thu nhỏ (nút, con lăn, chụm 2 ngón, chạm đúp), kéo ảnh, vuốt ngang đổi ảnh.
   XEM_ANH.mo({ ds: [{src, ten, phu, tai, id}], i: 0, hien: fn(muc) -> fn dừng | undefined, dong: fn }) */
(function () {
  'use strict';
  var CSS = '' +
    '.xa{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:#1f1b2e;color:#fff;font-family:inherit;-webkit-user-select:none;user-select:none;animation:xa-hien .18s ease-out}' +
    '@keyframes xa-hien{from{opacity:0}to{opacity:1}}' +
    '.xa-thanh{display:flex;align-items:center;gap:6px;padding:8px 10px;padding-top:max(8px,env(safe-area-inset-top));background:rgba(20,17,32,.92);border-bottom:1px solid rgba(255,255,255,.08);flex:none}' +
    '.xa-ten{flex:1;min-width:0;line-height:1.25}.xa-ten b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.xa-ten small{display:block;font-size:12.5px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.xa button,.xa a.xa-n{appearance:none;border:0;background:rgba(255,255,255,.1);color:#fff;font:inherit;font-size:15px;font-weight:600;min-width:42px;height:42px;padding:0 12px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;text-decoration:none;flex:none}' +
    '.xa button:hover,.xa a.xa-n:hover{background:rgba(255,255,255,.2)}.xa button:disabled{opacity:.3;cursor:default}' +
    '.xa .xa-dong{background:#fff;color:#1f1b2e}.xa .xa-dong:hover{background:#ece9f7}' +
    '.xa-san{position:relative;flex:1;overflow:hidden;touch-action:none;cursor:grab}.xa-san.keo{cursor:grabbing}' +
    '.xa-san img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;max-height:none;box-shadow:0 6px 30px rgba(0,0,0,.45);background:#fff;-webkit-user-drag:none;pointer-events:none;will-change:transform}' +
    '.xa-san img.muot{transition:transform .22s ease-out}' +
    '.xa-cho{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;opacity:.85;pointer-events:none}' +
    '.xa-cho i{width:34px;height:34px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:xa-quay .8s linear infinite;display:block;margin:0 auto 10px}' +
    '@keyframes xa-quay{to{transform:rotate(360deg)}}' +
    '.xa-day{position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:5px;border-radius:16px;background:rgba(20,17,32,.88);box-shadow:0 4px 18px rgba(0,0,0,.35);z-index:2}' +
    '.xa-day .xa-ty{min-width:62px;font-size:14px;font-variant-numeric:tabular-nums;background:transparent}' +
    '.xa-ben{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:46px;height:64px!important;border-radius:14px!important;background:rgba(20,17,32,.6)!important;font-size:28px!important}' +
    '.xa-ben.trai{left:10px}.xa-ben.phai{right:10px}' +
    '.xa-goi{position:absolute;top:12px;left:50%;transform:translateX(-50%);background:rgba(20,17,32,.88);padding:8px 14px;border-radius:12px;font-size:13.5px;z-index:2;width:max-content;max-width:calc(100% - 24px);text-align:center;transition:opacity .4s;pointer-events:none}' +
    '@media (max-width:700px){.xa .xa-chu{display:none}.xa button,.xa a.xa-n{min-width:40px;height:40px;padding:0 10px}.xa-ben{display:none!important}.xa-goi{font-size:12.5px}}' +
    '.xa-day .xa-ty{min-width:58px}';

  var hop, img, san, tyEl, dsXem = [], viTri = 0, opt = {}, dung = null, daDay = false;
  var Z = { s: 1, x: 0, y: 0, vua: 1 };   // tỉ lệ, dịch, tỉ lệ "vừa màn hình"

  function $(s) { return hop.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function kichSan() { var r = san.getBoundingClientRect(); return { w: r.width, h: r.height }; }
  function kep() {   // ảnh nhỏ hơn khung thì căn giữa; lớn hơn thì không cho kéo hở mép
    var k = kichSan(), w = img.naturalWidth * Z.s, h = img.naturalHeight * Z.s, le = 12;
    Z.x = w <= k.w - 2 * le ? (k.w - w) / 2 : Math.min(le, Math.max(k.w - w - le, Z.x));
    Z.y = h <= k.h - 2 * le ? (k.h - h) / 2 : Math.min(le, Math.max(k.h - h - le, Z.y));
  }
  function ve(muot) {
    if (!img.naturalWidth) return;
    kep();
    img.classList.toggle('muot', !!muot);
    img.style.transform = 'translate(' + Z.x + 'px,' + Z.y + 'px) scale(' + Z.s + ')';
    tyEl.textContent = Math.round(Z.s / Z.vua * 100) + '%';
  }
  function tinhVua() {
    var k = kichSan(), le = 24;
    Z.vua = Math.min((k.w - le) / img.naturalWidth, (k.h - le) / img.naturalHeight);
  }
  function vuaManHinh(muot) { tinhVua(); Z.s = Z.vua; Z.x = 0; Z.y = 0; ve(muot); }
  function vuaNgang(muot) {   // lấp đầy màn hình (ảnh dọc: vừa ngang, kéo lên xuống; ảnh ngang trên điện thoại dọc: vừa cao, kéo sang ngang)
    tinhVua(); var k = kichSan();
    Z.s = Math.min(Math.max((k.w - 24) / img.naturalWidth, (k.h - 24) / img.naturalHeight), Z.vua * 8); Z.x = 12; Z.y = 12; ve(muot);
  }
  function zoomTai(heSo, cx, cy, muot) {   // phóng quanh điểm (cx, cy) trong khung
    var s = Math.min(Z.vua * 8, Math.max(Z.vua * 0.5, Z.s * heSo)), r = s / Z.s;
    Z.x = cx - (cx - Z.x) * r; Z.y = cy - (cy - Z.y) * r; Z.s = s; ve(muot);
  }
  function giua() { var k = kichSan(); return [k.w / 2, k.h / 2]; }
  function dangPhong() { return Z.s > Z.vua * 1.02; }

  function goi(chu) {
    var g = $('.xa-goi'); if (!g) return;
    g.textContent = chu; g.style.opacity = 1;
    clearTimeout(goi.t); goi.t = setTimeout(function () { g.style.opacity = 0; }, 3200);
  }

  function hienMuc(i) {
    if (i < 0 || i >= dsXem.length) return;
    viTri = i; var m = dsXem[i];
    if (dung) { try { dung(); } catch (e) { } dung = null; }
    $('.xa-ten').innerHTML = '<b>' + esc(m.ten) + '</b>' + (m.phu ? '<small>' + esc(m.phu) + (dsXem.length > 1 ? ' · ' + (i + 1) + '/' + dsXem.length : '') + '</small>' : '');
    var tai = $('.xa-tai'); if (m.tai) { tai.href = m.tai; tai.style.display = ''; } else tai.style.display = 'none';
    hop.querySelectorAll('[data-xa="truoc"]').forEach(function (b) { b.disabled = i === 0; b.style.display = dsXem.length > 1 ? '' : 'none'; });
    hop.querySelectorAll('[data-xa="sau"]').forEach(function (b) { b.disabled = i === dsXem.length - 1; b.style.display = dsXem.length > 1 ? '' : 'none'; });
    $('.xa-cho').style.display = ''; img.style.opacity = 0;
    img.onload = function () {
      $('.xa-cho').style.display = 'none'; img.style.opacity = 1;
      vuaManHinh(false);
      // ảnh dọc trên màn hình ngang rộng: vừa chiều ngang đọc dễ hơn (tối đa 1100px)
      var k = kichSan();
      if (k.w > 700 && img.naturalHeight > img.naturalWidth && k.w / k.h > 1.1) {
        var s = Math.min((Math.min(k.w, 1100) - 24) / img.naturalWidth, 1);
        if (s > Z.vua * 1.15) { Z.s = s; Z.y = 12; ve(false); }
      }
    };
    img.onerror = function () { $('.xa-cho').innerHTML = '⚠️ Chưa tải được ảnh — kiểm tra mạng rồi thử lại.'; };
    img.src = m.src;
    if (img.complete && img.naturalWidth) img.onload();
    if (opt.hien) { try { dung = opt.hien(m, i) || null; } catch (e) { } }
  }

  function dong(tuLichSu) {
    if (!hop) return;
    if (dung) { try { dung(); } catch (e) { } dung = null; }
    document.removeEventListener('keydown', phim, true);
    window.removeEventListener('resize', coGian);
    window.removeEventListener('popstate', quayLai);
    hop.remove(); hop = null;
    document.documentElement.style.overflow = '';
    if (!tuLichSu && daDay) { daDay = false; try { history.back(); } catch (e) { } }
    if (opt.dong) opt.dong();
  }
  function quayLai() { daDay = false; dong(true); }   // nút Quay lại của điện thoại = đóng ảnh
  function coGian() { var cu = Z.s / Z.vua; tinhVua(); Z.s = Z.vua * cu; ve(false); }

  function phim(e) {
    if (!hop) return;
    var k = e.key, c = giua(), xong = true;
    if (k === 'Escape') dong();
    else if (k === '+' || k === '=') zoomTai(1.4, c[0], c[1], true);
    else if (k === '-' || k === '_') zoomTai(1 / 1.4, c[0], c[1], true);
    else if (k === '0') vuaManHinh(true);
    else if (k === 'ArrowUp') { Z.y += 120; ve(true); }
    else if (k === 'ArrowDown') { Z.y -= 120; ve(true); }
    else if (k === 'PageUp') { Z.y += kichSan().h * 0.85; ve(true); }
    else if (k === 'PageDown' || k === ' ') { Z.y -= kichSan().h * 0.85; ve(true); }
    else if (k === 'Home') { Z.y = 12; ve(true); }
    else if (k === 'End') { Z.y = -1e9; ve(true); }
    else if (k === 'ArrowLeft') { if (dangPhong()) { Z.x += 120; ve(true); } else hienMuc(viTri - 1); }
    else if (k === 'ArrowRight') { if (dangPhong()) { Z.x -= 120; ve(true); } else hienMuc(viTri + 1); }
    else xong = false;
    if (xong) { e.preventDefault(); e.stopPropagation(); }
  }

  function ganCham() {
    var ngon = {}, bd = null, chamCuoi = 0, vuot = null;
    var dsNgon = function () { return Object.keys(ngon).map(function (k) { return ngon[k]; }); };
    var diem = function (e) { var r = san.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    var batDau = function () {
      var p = dsNgon();
      if (p.length === 1) bd = { x: p[0].x, y: p[0].y, zx: Z.x, zy: Z.y, s: Z.s };
      else if (p.length >= 2) {
        var cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
        bd = { kc: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, cx: cx, cy: cy, zx: Z.x, zy: Z.y, s: Z.s, hai: true };
      }
    };
    san.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      if (e.target.closest && e.target.closest('button,a')) return;
      try { san.setPointerCapture(e.pointerId); } catch (x) { }
      ngon[e.pointerId] = diem(e); san.classList.add('keo');
      if (dsNgon().length === 1) vuot = { x: ngon[e.pointerId].x, y: ngon[e.pointerId].y, t: Date.now(), s: Z.s };
      else vuot = null;
      batDau();
    });
    san.addEventListener('pointermove', function (e) {
      if (!ngon[e.pointerId]) return;
      ngon[e.pointerId] = diem(e);
      var p = dsNgon(); if (!bd) return;
      if (bd.hai && p.length >= 2) {
        var kc = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
        var s = Math.min(Z.vua * 8, Math.max(Z.vua * 0.5, bd.s * kc / bd.kc)), r = s / bd.s;
        Z.s = s; Z.x = cx - (bd.cx - bd.zx) * r; Z.y = cy - (bd.cy - bd.zy) * r;
      } else if (!bd.hai) { Z.x = bd.zx + p[0].x - bd.x; Z.y = bd.zy + p[0].y - bd.y; }
      ve(false);
    });
    var tha = function (e) {
      if (!ngon[e.pointerId]) return;
      var p = ngon[e.pointerId]; delete ngon[e.pointerId];
      if (!dsNgon().length) {
        san.classList.remove('keo'); bd = null;
        if (Z.s < Z.vua) vuaManHinh(true);
        var bay = vuot && Date.now() - vuot.t < 450, dx = vuot ? p.x - vuot.x : 0, dy = vuot ? p.y - vuot.y : 0;
        // vuốt ngang khi chưa phóng to: đổi ảnh
        if (bay && vuot.s <= Z.vua * 1.02 && Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) { hienMuc(viTri + (dx < 0 ? 1 : -1)); vuot = null; return; }
        // chạm (không kéo): chạm đúp để phóng to / trở về vừa màn hình
        if (vuot && Math.abs(dx) < 8 && Math.abs(dy) < 8 && Date.now() - vuot.t < 300) {
          var bay2 = Date.now() - chamCuoi < 320; chamCuoi = bay2 ? 0 : Date.now();
          if (bay2) { if (dangPhong()) vuaManHinh(true); else zoomTai(2.5, p.x, p.y, true); }
        }
        vuot = null;
      } else batDau();
    };
    san.addEventListener('pointerup', tha); san.addEventListener('pointercancel', tha);
    san.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = diem(e);
      if (e.ctrlKey || e.metaKey) { zoomTai(Math.exp(-e.deltaY * 0.01), p.x, p.y, false); return; }   // chụm bàn di chuột / Ctrl + lăn
      if (!dangPhong() && Z.s * img.naturalHeight <= kichSan().h) { zoomTai(e.deltaY < 0 ? 1.25 : 0.8, p.x, p.y, true); return; }   // ảnh nằm gọn: lăn = phóng
      var d = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? kichSan().h : 1;
      if (e.shiftKey) Z.x -= (e.deltaY || e.deltaX) * d; else { Z.x -= e.deltaX * d; Z.y -= e.deltaY * d; }
      ve(false);
    }, { passive: false });
    san.addEventListener('dblclick', function (e) {
      if (e.pointerType === 'touch') return; var p = diem(e);
      if (dangPhong()) vuaManHinh(true); else zoomTai(2.5, p.x, p.y, true);
    });
  }

  function mo(o) {
    if (hop) dong(true);
    opt = o || {}; dsXem = opt.ds || []; if (!dsXem.length) return;
    if (!document.getElementById('xa-css')) { var st = document.createElement('style'); st.id = 'xa-css'; st.textContent = CSS; document.head.appendChild(st); }
    hop = document.createElement('div'); hop.className = 'xa'; hop.setAttribute('role', 'dialog'); hop.setAttribute('aria-modal', 'true');
    hop.innerHTML =
      '<div class="xa-thanh"><button type="button" class="xa-dong" data-xa="dong" title="Đóng (Esc)">✕<span class="xa-chu"> Đóng</span></button>' +
      '<div class="xa-ten"></div>' +
      '<button type="button" data-xa="truoc" title="Ảnh trước">‹<span class="xa-chu"> Trước</span></button><button type="button" data-xa="sau" title="Ảnh tiếp">›<span class="xa-chu"> Tiếp</span></button>' +
      '<a class="xa-n xa-tai" download title="Tải ảnh về máy">⬇<span class="xa-chu"> Tải ảnh</span></a>' +
      (document.fullscreenEnabled ? '<button type="button" data-xa="toan" title="Toàn màn hình">⛶</button>' : '') + '</div>' +
      '<div class="xa-san"><img alt=""><div class="xa-cho"><div><i></i>Đang mở ảnh…</div></div>' +
      '<button type="button" class="xa-ben trai" data-xa="truoc" title="Ảnh trước">‹</button><button type="button" class="xa-ben phai" data-xa="sau" title="Ảnh tiếp">›</button>' +
      '<div class="xa-goi"></div>' +
      '<div class="xa-day"><button type="button" data-xa="nho" title="Thu nhỏ (−)">−</button><button type="button" class="xa-ty" data-xa="vua" title="Vừa màn hình (0)">100%</button><button type="button" data-xa="to" title="Phóng to (+)">+</button>' +
      '<button type="button" data-xa="ngang" title="Lấp đầy màn hình — chữ to hơn, kéo để xem phần còn lại">⤢<span class="xa-chu"> Lấp đầy</span></button></div></div>';
    document.body.appendChild(hop);
    document.documentElement.style.overflow = 'hidden';
    san = $('.xa-san'); img = $('.xa-san img'); tyEl = $('.xa-ty');
    hop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-xa]'); if (!b || b.disabled) return;
      var a = b.getAttribute('data-xa'), c = giua();
      if (a === 'dong') dong();
      else if (a === 'truoc') hienMuc(viTri - 1);
      else if (a === 'sau') hienMuc(viTri + 1);
      else if (a === 'to') zoomTai(1.4, c[0], c[1], true);
      else if (a === 'nho') zoomTai(1 / 1.4, c[0], c[1], true);
      else if (a === 'vua') vuaManHinh(true);
      else if (a === 'ngang') vuaNgang(true);
      else if (a === 'toan') { if (document.fullscreenElement) document.exitFullscreen(); else hop.requestFullscreen().then(function () { setTimeout(coGian, 120); }, function () { }); }
    });
    ganCham();
    document.addEventListener('keydown', phim, true);
    window.addEventListener('resize', coGian);
    if (opt.lichSu !== false) { try { history.pushState({ xemAnh: 1 }, ''); daDay = true; window.addEventListener('popstate', quayLai); } catch (e) { } }
    hienMuc(Math.max(0, Math.min(dsXem.length - 1, opt.i || 0)));
    var cham = matchMedia('(pointer: coarse)').matches;
    if (cham && innerHeight > innerWidth) img.addEventListener('load', function () { if (img.naturalWidth > img.naturalHeight * 1.15) goi('📱 Ảnh nằm ngang — xoay ngang điện thoại để xem to hơn, hoặc chụm 2 ngón để phóng to'); }, { once: true });
    goi(cham ? '🤏 Chụm 2 ngón để phóng to · kéo để di chuyển · chạm đúp để phóng nhanh' : '🖱 Lăn chuột hoặc + − để phóng to · kéo để di chuyển · bấm đúp để phóng nhanh');
  }

  window.XEM_ANH = { mo: mo, dong: function () { dong(); } };
})();
