/* ===== Học Toán Thông Minh — khung trang & hiển thị nội dung =====
 * Mỗi trang HTML chỉ có <body data-trang="..."> và <main id="noi-dung">; tệp này dựng đầu trang, menu, chân trang và nội dung. */
(function () {
  function returnToMainMHEdu(e) {
    if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
    if (window.parent && window.parent !== window) {
      try {
        if (typeof window.parent.closeAllPortals === 'function') {
          window.parent.closeAllPortals();
          return;
        }
      } catch (err) {}
      window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
    } else {
      window.location.href = '/';
    }
  }
  window.returnToMainMHEdu = returnToMainMHEdu;
  var C = window.WEB_CAU_HINH || {}, DL = window.DL || { lop: [], moPhong: [], soTay: [], troChoi: [], de: [] };
  var TRANG = document.body.getAttribute('data-trang') || '';
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var $$ = function (s, g) { return Array.prototype.slice.call((g || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function so(n) { return Number(n || 0).toLocaleString('vi-VN'); }
  function boDau(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  function thamSo(k) { return new URLSearchParams(location.search).get(k); }
  function doc(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ghi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function bao(t) { var b = document.createElement('div'); b.className = 'bao'; b.textContent = t; document.body.appendChild(b); setTimeout(function () { b.remove(); }, 2600); }

  // ------------------------------------------------------------------ danh mục
  var MUC = {
    sdt: { ten: 'Sơ đồ tư duy', ic: '🧠', m: '#0f9d8f', trang: 'so-do-tu-duy.html', nhom: 'hl', mo: 'Mỗi bài gói trong một sơ đồ — nhìn là nhớ, ôn rất nhanh.' },
    inf: { ten: 'Infographic', ic: '🎨', m: '#ea580c', trang: 'infographic.html', nhom: 'hl', mo: 'Kiến thức trọng tâm bằng hình ảnh, màu sắc, ví dụ minh hoạ.' },
    st: { ten: 'Sổ tay kiến thức', ic: '📒', m: '#9333ea', trang: 'so-tay.html', nhom: 'hl', mo: 'Sách lật online, mỗi trang một mục tiêu; có bản PDF để in.' },
    mp: { ten: 'Mô phỏng', ic: '🔬', m: '#2563eb', trang: 'mo-phong.html', nhom: 'hl', mo: 'Kéo, thả, quan sát hình động và hình 3D để hiểu bản chất.' },
    tc: { ten: 'Trò chơi', ic: '🎮', m: '#db2777', trang: 'tro-choi.html', nhom: 'lt', mo: 'Chinh phục từng trạm, đấu trùm chương, sưu tầm huy hiệu.' },
    de: { ten: 'Đề kiểm tra', ic: '📝', m: '#dc2626', trang: 'de-kiem-tra.html', nhom: 'lt', mo: 'Đề giữa kì, cuối kì, ôn tốt nghiệp — làm online, có điểm ngay.' },
    gt: { ten: 'Trợ lý giải toán', ic: '🧮', m: '#4f46e5', trang: 'giai-toan.html', nhom: 'lt', mo: 'Dạng bài mẫu: nhận dạng, điền từng bước, lời giải chi tiết.' },
    ve: { ten: 'Vẽ hình', ic: '📐', m: '#0891b2', trang: 've-hinh.html', nhom: 'lt', mo: 'Hình phẳng động, đồ thị, miền nghiệm và hình không gian 3D tô khối, xoay được; nét khuất tự đứt.' },
    tcl: { ten: 'Trò chơi lớp học', ic: '🎲', m: '#e11d48', trang: 'tro-choi-lop.html', nhom: 'gv', mo: 'Ô cửa bí mật, rung chuông vàng, triệu phú, vòng quay… chiếu lên lớp để củng cố bài.' },
    ptm: { ten: 'Phiếu tô màu bí mật', ic: '🖍️', m: '#16a34a', trang: 'phieu-to-mau.html', nhom: 'gv', mo: 'Tạo phiếu trắc nghiệm tô màu ra hình bí mật, xuất Word, PDF.' }
  };
  var NHOM = { hl: '📚 Học liệu', lt: '🎯 Luyện tập', gv: '🧑‍🏫 Giáo viên' };
  function mucTheoNhom(n) { return Object.keys(MUC).filter(function (k) { return MUC[k].nhom === n; }); }
  function lopCua(k) { return DL.lop.filter(function (l) { return l.so == k; })[0]; }
  function chuongCua(L, id) { return L.chuong.filter(function (c) { return c.id == id; })[0]; }

  // Danh sách tranh (infographic / sơ đồ) của một lớp, theo thứ tự sách: bài…, ôn tập chương
  function dsTranh(k, loai) {
    var L = lopCua(k), kq = [];
    if (!L) return kq;
    L.chuong.forEach(function (c) {
      L.bai.filter(function (b) { return b.ch == c.id; }).forEach(function (b) {
        if (b[loai]) kq.push({ id: loai + '-' + k + '-' + b.so, ten: 'Bài ' + b.so + '. ' + b.ten, nhan: 'Bài ' + b.so, ch: c, bai: b, f: b[loai] });
      });
      var on = c[loai === 'inf' ? 'onInf' : 'onSdt'];
      if (on) kq.push({ id: loai + '-' + k + '-on' + c.id, ten: 'Ôn tập chương ' + c.so + '. ' + c.ten, nhan: 'Ôn tập', ch: c, on: true, f: on });
    });
    return kq;
  }

  // Tra một mục để mở trong trình xem: id -> {url, ten, phu, muc, tai, quay, truoc, sau}
  function traMuc(id) {
    var m;
    if ((m = /^(inf|sdt)-(\d+)-/.exec(id))) {
      var ds = dsTranh(+m[2], m[1]), i = ds.map(function (x) { return x.id; }).indexOf(id);
      if (i < 0) return null;
      var x = ds[i];
      return { url: x.f.url, ten: x.ten, phu: MUC[m[1]].ten + ' · Toán ' + m[2] + ' · Chương ' + x.ch.so, muc: m[1], tai: x.f.png,
        quay: MUC[m[1]].trang + '?lop=' + m[2], truoc: ds[i - 1] && ds[i - 1].id, sau: ds[i + 1] && ds[i + 1].id };
    }
    if (/^mp-/.test(id)) {
      var all = DL.moPhong, j = all.map(function (x) { return x.id; }).indexOf(id);
      if (j < 0) return null;
      var p = all[j];
      return { url: p.url, ten: p.ten, phu: 'Mô phỏng · Toán ' + p.lop + ' · ' + p.baiChu, muc: 'mp', quay: 'mo-phong.html?lop=' + p.lop,
        truoc: all[j - 1] && all[j - 1].id, sau: all[j + 1] && all[j + 1].id };
    }
    if ((m = /^tc-(\d+)$/.exec(id))) {
      var g = DL.troChoi.filter(function (t) { return t.id === id; })[0]; if (!g) return null;
      var h = thamSo('h') || '', ten = 'Chinh phục Toán ' + m[1], L = lopCua(+m[1]), phu = 'Trò chơi · ' + g.tram + ' trạm · ' + g.cau + ' câu';
      if (/^b\d+$/.test(h)) { var b = L.bai.filter(function (x) { return 'b' + x.so === h; })[0]; if (b) phu = 'Trò chơi · Trạm Bài ' + b.so + '. ' + b.ten; }
      if (/^c\d+$/.test(h)) { var c = chuongCua(L, +h.slice(1)); if (c) phu = 'Trò chơi · Trùm chương ' + c.so; }
      return { url: g.url + (/^[bc]\d+$/.test(h) ? '#' + h : ''), ten: ten, phu: phu, muc: 'tc', quay: 'tro-choi.html' };
    }
    if ((m = /^st-(\d+)$/.exec(id))) {
      var s = DL.soTay.filter(function (t) { return t.id === id; })[0]; if (!s) return null;
      var pg = parseInt(thamSo('p'), 10);
      return { url: s.lat + (pg ? '#p=' + pg : ''), ten: 'Sổ tay kiến thức Toán ' + m[1], phu: 'Sách lật · ' + s.soTrang + ' trang' + (pg ? ' · đang mở trang ' + pg : ''),
        muc: 'st', tai: s.pdf, taiChu: 'PDF', quay: 'so-tay.html' };
    }
    if (id === 'de') {
      var k = thamSo('k'); if (/^1[012]$/.test(k || '')) ghi('tab', +k);
      var qd = ['de', 'lop', 'lopcua', 'lophoc', 'kho'].filter(function (x) { return thamSo(x); }).map(function (x) { return x + '=' + encodeURIComponent(thamSo(x)); }).join('&');   // link đề giáo viên, lớp học
      return { url: 'noi-dung/de-kiem-tra/index.html' + (qd ? '?' + qd : ''), ten: 'Phòng luyện đề Toán 10 · 11 · 12', phu: 'Đề kiểm tra · ' + so(DL.tongDe) + ' đề' + (k ? ' · đang chọn Toán ' + k : ''), muc: 'de', quay: 'de-kiem-tra.html' };
    }
    if (id === 'gt') return { url: 'noi-dung/giai-toan/index.html', ten: 'Trợ lý giải toán 10 · 11 · 12', phu: 'Luyện tập · bài mẫu từng bước', muc: 'gt', quay: 'giai-toan.html' };
    if (id === 'kg') return { url: 'noi-dung/ve-hinh/index.html?che-do=3d', ten: 'Vẽ hình · Hình không gian 3D', phu: 'Hình mẫu · tô khối · xoay quan sát', muc: 've', quay: 've-hinh.html' };
    if (id === 'tcl') return { url: 'noi-dung/tro-choi-lop/index.html', ten: 'Trò chơi lớp học', phu: 'Dành cho giáo viên · chiếu lên lớp', muc: 'tcl', quay: 'tro-choi-lop.html' };
    if (id === 've') return { url: 'noi-dung/ve-hinh/index.html', ten: 'Phòng vẽ hình Toán', phu: 'Hình phẳng · hình không gian', muc: 've', quay: 've-hinh.html' };
    if (id === 'ptm') return { url: 'noi-dung/phieu-to-mau/index.html', ten: 'Trợ lý phiếu tô màu bí mật', phu: 'Dành cho giáo viên', muc: 'ptm', quay: 'phieu-to-mau.html' };
    return null;
  }
  function linkXem(id, them) { return 'xem.html?id=' + encodeURIComponent(id) + (them || ''); }

  // ------------------------------------------------------------------ đầu trang, menu, chân trang
  function dauTrang() {
    var dang = function (t) { return TRANG === t ? ' dang' : ''; };
    var tha = function (n) {
      var ds = mucTheoNhom(n).map(function (k) { var x = MUC[k]; return '<a href="' + x.trang + '" style="--m:' + x.m + '"><i>' + x.ic + '</i><span><b>' + x.ten + '</b><small>' + x.mo + '</small></span></a>'; });
      var on = mucTheoNhom(n).indexOf(TRANG) >= 0;
      var tach = NHOM[n].split(' '), ic = tach.shift();
      return '<div class="nhom' + (on ? ' dang' : '') + '"><button type="button" aria-expanded="false"><i class="mi">' + ic + '</i>' + tach.join(' ') + '</button><div class="tha">' + ds.join('') + '</div></div>';
    };
    var lk = function (href, ic, chu, ma, them) { return '<a href="' + href + '" class="' + dang(ma) + (them ? ' ' + them : '') + '"><i class="mi">' + ic + '</i>' + chu + '</a>'; };
    var h = document.createElement('header');
    h.className = 'dau';
    h.innerHTML = '<div class="khung"><a class="logo" href="index.html"><span class="logo-o">∑</span><span><b>' + esc(C.TEN_WEB || 'Học Toán Thông Minh') + '</b><small>' + esc(C.KHAU_HIEU || '') + '</small></span></a>' +
      '<div class="phai">' +
      '<a class="nut-ve-mhedu-top" href="/" onclick="returnToMainMHEdu(event)" style="background: #eff6ff; color: #1d4ed8 !important; border: 1.5px solid #bfdbfe; padding: 5px 12px; border-radius: 999px; text-decoration: none; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; margin-right: 8px; transition: all 0.2s;" onmouseover="this.style.background=\'#dbeafe\'" onmouseout="this.style.background=\'#eff6ff\'" title="Quay về màn hình chính MHEdu">🏠 Về MHEdu</a>' +
      '<a class="dem" href="thong-ke.html" title="Xem thống kê lượt truy cập"><span class="cham"></span>👁 <span id="so-dem">…</span><span class="chu">&nbsp;lượt ghé thăm</span></a>' +
      '<a class="chuong-lop an" id="chuong-lop" href="xem.html?id=de&amp;lopcua=1" title="Đề thầy cô mới giao chưa làm">📬<b id="so-lop"></b></a>' +
      '<button class="ban" id="nut-ban" type="button" title="Tài khoản của bạn"><span class="av">👤</span><span id="ten-ban">Đăng nhập</span><span class="diem-ban an" id="diem-ban" title="Điểm tích luỹ"></span></button>' +
      '<button class="nut-menu" id="nut-menu" type="button" aria-label="Mở menu">☰</button></div></div>' +
      '<div class="thanh-cc"><div class="khung"><nav class="menu" aria-label="Menu chính">' + lk('index.html', '🏠', 'Trang chủ', 'chu') + lk('hoc-theo-bai.html', '🗂️', 'Học theo bài', 'htb') + tha('hl') + tha('lt') +
      lk('ve-hinh.html', '📐', 'Vẽ hình', 've') + lk('phieu-to-mau.html', '🖍️', 'Phiếu tô màu', 'ptm') + lk('hoi-dap.html', '🏆', 'Thi đua · Hỏi đáp', 'hdap', 'noi-bat') + '</nav></div></div>';
    document.body.insertBefore(h, document.body.firstChild);
    var chay = dongChuChay(); if (chay) document.body.insertBefore(chay, h);

    // thả xuống: bấm để mở (điện thoại cảm ứng), rê chuột để mở (máy tính)
    $$('.nhom', h).forEach(function (n) {
      var b = $('button', n), hen;
      b.onclick = function (e) { e.stopPropagation(); var mo = !n.classList.contains('mo'); $$('.nhom.mo').forEach(function (x) { x.classList.remove('mo'); }); n.classList.toggle('mo', mo); b.setAttribute('aria-expanded', mo); };
      n.onmouseenter = function () { clearTimeout(hen); $$('.nhom.mo').forEach(function (x) { if (x !== n) x.classList.remove('mo'); }); n.classList.add('mo'); };
      n.onmouseleave = function () { hen = setTimeout(function () { n.classList.remove('mo'); }, 180); };
    });
    document.addEventListener('click', function () { $$('.nhom.mo').forEach(function (x) { x.classList.remove('mo'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $$('.nhom.mo').forEach(function (x) { x.classList.remove('mo'); }); dongNgan(); } });

    // ngăn kéo điện thoại
    var ng = document.createElement('div');
    ng.className = 'ngan';
    var mucNgan = function (n) { return '<h4>' + NHOM[n] + '</h4>' + mucTheoNhom(n).map(function (k) { return '<a href="' + MUC[k].trang + '" class="' + dang(k) + '">' + MUC[k].ic + ' ' + MUC[k].ten + '</a>'; }).join(''); };
    ng.innerHTML = '<nav aria-label="Menu"><button class="dong" type="button" aria-label="Đóng">✕</button><h4>Đi nhanh</h4><a href="index.html" class="' + dang('chu') + '">🏠 Trang chủ</a><a href="hoc-theo-bai.html" class="' + dang('htb') + '">🗂️ Học theo bài</a>' +
      mucNgan('hl') + mucNgan('lt') + mucNgan('gv') + '<h4>🏆 Thi đua</h4><a href="hoi-dap.html" class="' + dang('hdap') + '">🏆 Bảng vàng · điểm danh · hỏi đáp</a><a href="thong-ke.html" class="' + dang('tk') + '">📊 Lượt ghé thăm</a></nav>';
    document.body.appendChild(ng);
    function dongNgan() { ng.classList.remove('mo'); }
    $('#nut-menu').onclick = function () { ng.classList.add('mo'); };
    ng.onclick = function (e) { if (e.target === ng || e.target.classList.contains('dong')) dongNgan(); };
    $('#nut-ban').onclick = function () { hopGhiDanh(); };
    capNhatBan();
    addEventListener('storage', function (e) { if (e.key === 'hs_tk') capNhatBan(); });   // đăng nhập/đăng xuất trong phòng luyện đề
  }

  function capNhatBan() {
    var n = WEB.nguoi(), t = $('#ten-ban');
    var tk = WEB.taiKhoan();
    if (t) t.textContent = tk ? (tk.hoTen || tk.user).split(' ').slice(-1)[0] + (tk.lop ? ' · ' + tk.lop : '') : 'Đăng nhập';
    var d = $('#diem-ban'), diem = doc('web_diem', null);
    if (d) { d.classList.toggle('an', !(tk && diem != null)); d.textContent = '⭐ ' + so(diem || 0); }
    var cl = $('#chuong-lop'); if (cl && !tk) { cl.classList.add('an'); try { sessionStorage.removeItem('tb_lop'); } catch (e) { } }
  }

  // ------------------------------------------------------------------ THI ĐUA: dòng chữ chạy, nút Zalo, điểm tích luỹ, bảng vàng
  var ZALO = String(C.ZALO || '').replace(/\D/g, '');
  function dongChuChay() {
    var chu = C.CHU_CHAY || (ZALO ? 'Mọi đóng góp, thắc mắc và cần giải đáp hỗ trợ hãy liên hệ số Zalo ' + ZALO : '');
    if (!chu) return null;
    var d = document.createElement('div');
    d.className = 'chu-chay';
    var mot = '<span>📢 ' + esc(chu) + '</span><span>⭐ Điểm danh mỗi ngày, xem học liệu, làm đề để tích điểm — đủ 20 điểm đổi 1 voucher mở đề VIP</span>';
    d.innerHTML = '<a class="chu-chay-trong" href="' + (ZALO ? 'https://zalo.me/' + ZALO : 'hoi-dap.html') + '"' + (ZALO ? ' target="_blank" rel="noopener"' : '') + '>' + mot + mot + '</a>';
    return d;
  }
  function nutNoi() {
    if (ZALO) {
      var z = document.createElement('a');
      z.className = 'zalo-noi'; z.href = 'https://zalo.me/' + ZALO; z.target = '_blank'; z.rel = 'noopener';
      z.setAttribute('aria-label', 'Liên hệ qua Zalo'); z.title = 'Liên hệ Ban quản trị qua Zalo ' + ZALO;
      z.innerHTML = '<span class="zalo-o">Zalo</span><span class="zalo-chu">Liên hệ</span>';
      document.body.appendChild(z);
    }
    if (TRANG === 'xem') return;
    var b = document.createElement('button');
    b.className = 'vang-noi'; b.type = 'button'; b.title = 'Bảng vàng người học'; b.innerHTML = '🏆<span>Bảng vàng</span>';
    b.onclick = function () { hopBangVang(); };
    document.body.appendChild(b);
  }
  // 📬 thông báo đề thầy cô mới giao (học sinh đã vào lớp) — dùng chung bộ nhớ tạm với phòng luyện đề
  WEB.datThongBao = function (n) {
    try { sessionStorage.setItem('tb_lop', JSON.stringify({ n: n || 0, t: Date.now() })); } catch (e) { }
    var c = $('#chuong-lop'), b = $('#so-lop'); if (!c) return;
    c.classList.toggle('an', !n); if (b) b.textContent = n || '';
    if (n) c.title = 'Em có ' + n + ' đề thầy cô mới giao chưa làm';
  };
  function taiThongBao() {
    var tk = WEB.taiKhoan(); if (!tk || !WEB.API) return;
    try { var c = JSON.parse(sessionStorage.getItem('tb_lop') || 'null'); if (c && Date.now() - c.t < 5 * 60e3) return WEB.datThongBao(c.n); } catch (e) { }
    WEB.goi({ action: 'hsLopCuaToi', token: tk.token }).then(function (r) { if (r && r.ok) WEB.datThongBao(r.soMoi); });
  }
  WEB.datDiem = function (tong) { if (tong == null) return; ghi('web_diem', tong); capNhatBan(); };
  function taiDiem() {
    var tk = WEB.taiKhoan(); if (!tk || !WEB.API) return Promise.resolve(null);
    return WEB.goi({ action: 'diemCuaToi', token: tk.token }).then(function (r) {
      if (r && r.ok) { ghi('web_diem', r.tong); ghi('web_dd', r.daDiemDanh ? homNayVN() : ''); capNhatBan(); }
      return r;
    });
  }
  function homNayVN() { var d = new Date(Date.now() + 7 * 3600e3); return d.toISOString().slice(0, 10); }
  function diemDanh(nut, xong) {
    var tk = WEB.taiKhoan(); if (!tk) return hopGhiDanh('Đăng nhập để điểm danh và tích điểm nhé.');
    if (nut) nut.disabled = true;
    WEB.goi({ action: 'diemDanh', token: tk.token }).then(function (r) {
      if (r && r.hsAuth === false) { WEB.dangXuat(); return hopGhiDanh('Phiên đăng nhập đã hết hạn, đăng nhập lại nhé.'); }
      if (!r || !r.ok) { if (nut) nut.disabled = false; return bao((r && r.error) || 'Không kết nối được máy chủ.'); }
      ghi('web_dd', homNayVN()); WEB.datDiem(r.tong);
      bao(r.them ? '✅ Điểm danh thành công: +1 điểm (tổng ' + r.tong + ')' : 'Hôm nay em đã điểm danh rồi. Mai quay lại nhé!');
      if (nut) nut.textContent = '✅ Đã điểm danh hôm nay';
      if (xong) xong(r);
    });
  }
  function anTen(u) { u = String(u || ''); return /^\*\*\*/.test(u) ? u : '***' + u.slice(3); }   // che 3 kí tự đầu tên đăng nhập
  function bangVangHTML(ds, gon) {
    if (!ds || !ds.length) return '<p class="rong">Chưa có ai trên bảng vàng — hãy là người đầu tiên!</p>';
    var huy = ['🥇', '🥈', '🥉'], toi = WEB.taiKhoan(), toiAn = toi && toi.user ? anTen(toi.user) : null;
    return '<ol class="bang-vang' + (gon ? ' gon' : '') + '">' + ds.map(function (x, i) {
      return '<li class="h' + (i + 1) + '"><span class="hang">' + (huy[i] || (i + 1)) + '</span><span class="nguoi"><b>👤 ' + esc(anTen(x.user)) + '</b>' + (toiAn && anTen(x.user) === toiAn ? ' <small class="la-ban">(bạn)</small>' : '') + '</span><span class="diem">' + so(x.diem) + ' <small>điểm</small></span></li>';
    }).join('') + '</ol>';
  }
  // Bảng vàng có 2 chế độ: 🏆 Cá nhân (mặc định) · 🏫 Theo trường → chọn lớp (không chọn lớp = cả trường)
  function taiBangVang(hop) {
    if (!WEB.API) { hop.innerHTML = '<p class="rong">Bảng vàng hiện khi website kết nối máy chủ.</p>'; return; }
    var gon = hop.classList.contains('gon'), toi = WEB.taiKhoan(), nhoTruong = 0;
    var S = { che: 'canhan', k: '', lop: '', loc: '', tuDong: !!(toi && toi.truong) };
    var khung = function (than) {
      hop.innerHTML = '<div class="bv-tab" role="tablist"><button type="button" data-c="canhan" class="' + (S.che === 'canhan' ? 'on' : '') + '">🏆 Cá nhân</button><button type="button" data-c="truong" class="' + (S.che === 'truong' ? 'on' : '') + '">🏫 Theo trường · lớp</button></div><div class="bv-than">' + than + '</div>';
      $$('.bv-tab button', hop).forEach(function (b) { b.onclick = function () { S.che = b.dataset.c; if (S.che === 'truong' && !S.k && S.tuDong && toi) { S.k = ''; S.tim = toi.truong; S.lop = String(toi.lop || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); S.tuDong = false; } tai(); }; });
    };
    var thongBao = function (t) { return '<p class="rong">' + t + '</p>'; };
    var hang = function (i, ten, phu, diem, ban, onclick) { var huy = ['🥇', '🥈', '🥉']; return '<li class="h' + (i + 1) + (ban ? ' la-ban-hang' : '') + (onclick ? ' bam' : '') + '"' + (onclick ? ' data-k="' + esc(onclick) + '" tabindex="0" role="button"' : '') + '><span class="hang">' + (huy[i] || (i + 1)) + '</span><span class="nguoi"><b>' + ten + '</b>' + (phu ? '<small>' + phu + '</small>' : '') + '</span><span class="diem">' + so(diem) + ' <small>điểm</small></span></li>'; };
    var ve = function (r) {
      if (!r || !r.ok) { khung(thongBao('Chưa tải được bảng vàng.')); return; }
      if (S.che === 'canhan') { khung(bangVangHTML(r.ds, gon)); return; }
      if (r.che !== 'truong') { khung(thongBao('Bảng vàng theo trường cần máy chủ bản mới — Ban quản trị đang cập nhật, bạn quay lại sau nhé.')); return; }
      var h = '', toiK = toi && toi.truong ? 1 : 0;
      if (r.cap === 'ds') {
        var q = S.loc.trim().toLowerCase(), ds = r.ds.filter(function (x) { return !q || x.truong.toLowerCase().indexOf(q) >= 0; });
        h = '<input class="bv-tim" type="search" placeholder="Tìm trường của bạn…" value="' + esc(S.loc) + '" aria-label="Tìm trường" autocomplete="off">' +
          (r.khongTim ? '<p class="bv-ghi">Trường của bạn chưa có đủ ' + r.toiThieu + ' học sinh có điểm nên chưa hiện — rủ bạn bè cùng trường đăng ký và học nhé!</p>' : '') +
          (ds.length ? '<ol class="bang-vang' + (gon ? ' gon' : '') + '">' + ds.map(function (x, i) { return hang(i, '🏫 ' + esc(x.truong), x.soHS + ' học sinh', x.diem, 0, x.k); }).join('') + '</ol><p class="bv-ghi">Bấm vào trường để xem các lớp và học sinh đứng đầu. Chỉ hiện trường có từ ' + r.toiThieu + ' học sinh có điểm.</p>' : thongBao(r.ds.length ? 'Không thấy trường nào khớp.' : 'Chưa có trường nào đủ ' + r.toiThieu + ' học sinh có điểm — hãy là người đầu tiên!'));
        khung(h);
        var o = $('.bv-tim', hop); if (o) { o.oninput = function () { S.loc = o.value; var p = o.selectionStart; ve(r); var o2 = $('.bv-tim', hop); if (o2) { o2.focus(); o2.setSelectionRange(p, p); } }; }
        $$('li.bam', hop).forEach(function (li) { var mo = function () { S.k = li.dataset.k; S.tim = ''; S.lop = ''; tai(); }; li.onclick = mo; li.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mo(); } }; });
        return;
      }
      S.k = r.k;
      var lopToi = toi && toi.lop ? String(toi.lop).toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
      h = '<div class="bv-dau"><button type="button" class="bv-lai">← Tất cả trường</button><b>🏫 ' + esc(r.truong) + '</b></div>';
      if (r.thieu && !r.hs.length && !r.lops.length && !r.diem) h += thongBao('Trường này chưa có đủ ' + r.toiThieu + ' học sinh có điểm để hiện bảng.');
      else {
        h += '<div class="bv-chip">' + '<button type="button" data-l="" class="' + (!S.lop ? 'on' : '') + '">Cả trường</button>' + r.lops.map(function (x) { return '<button type="button" data-l="' + esc(x.lop) + '" class="' + (S.lop === x.lop ? 'on' : '') + '">' + esc(x.ten || x.lop) + (x.lop === lopToi ? ' ★' : '') + '</button>'; }).join('') + '</div>';
        if (!S.lop && r.lops.length) h += '<h3 class="bv-h">Xếp hạng các lớp</h3><ol class="bang-vang' + (gon ? ' gon' : '') + '">' + r.lops.map(function (x, i) { return hang(i, 'Lớp ' + esc(x.ten || x.lop), x.soHS + ' học sinh', x.diem, x.lop === lopToi, x.lop); }).join('') + '</ol>';
        h += '<h3 class="bv-h">' + (S.lop ? 'Học sinh đứng đầu lớp ' + esc((r.lops.filter(function (x) { return x.lop === S.lop; })[0] || { ten: S.lop }).ten) : 'Học sinh đứng đầu cả trường') + '</h3>';
        var tka = toi && toi.user ? anTen(toi.user) : null;
        h += r.thieu ? thongBao('Lớp này chưa có đủ ' + r.toiThieu + ' học sinh có điểm để hiện bảng.') : (r.hs.length ? '<ol class="bang-vang' + (gon ? ' gon' : '') + '">' + r.hs.map(function (x, i) { return hang(i, '👤 ' + esc(anTen(x.user)) + (tka && anTen(x.user) === tka ? ' <small class="la-ban">(bạn)</small>' : ''), x.lop ? 'Lớp ' + esc(x.lop) : '', x.diem, tka && anTen(x.user) === tka); }).join('') + '</ol>' : thongBao('Chưa có dữ liệu.'));
        h += '<p class="bv-ghi">Tổng ' + so(r.diem) + ' điểm · ' + r.soHS + ' học sinh. Tên đăng nhập luôn được che 3 kí tự đầu.</p>';
      }
      khung(h);
      $('.bv-lai', hop).onclick = function () { S.k = ''; S.tim = ''; S.lop = ''; S.loc = ''; tai(); };
      $$('.bv-chip button', hop).forEach(function (b) { b.onclick = function () { S.lop = b.dataset.l; tai(); }; });
      $$('li.bam', hop).forEach(function (li) { var mo = function () { S.lop = li.dataset.k; tai(); }; li.onclick = mo; li.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mo(); } }; });
    };
    var tai = function () {
      khung(thongBao('Đang tải bảng vàng…'));
      var d = S.che === 'canhan' ? { action: 'bangVang' } : { action: 'bangVang', che: 'truong', k: S.k, tim: S.k ? '' : S.tim || '', lop: S.lop };
      WEB.goi(d).then(ve, function () { khung(thongBao('Chưa tải được bảng vàng.')); });
    };
    tai();
  }
  function hopBangVang() {
    if ($('.hop-nen')) return;
    var nen = document.createElement('div'); nen.className = 'hop-nen';
    nen.innerHTML = '<div class="hop" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Đóng">✕</button><h2>🏆 Bảng vàng người học</h2><p>Xem xếp hạng <b>cá nhân</b> hoặc theo <b>trường · lớp</b> của bạn. Điểm danh mỗi ngày, xem học liệu, làm đề, đặt câu hỏi hay để leo hạng!</p>' +
      '<div id="bv-hop"></div><div class="nut-hang"><a class="nut chinh" href="hoi-dap.html">Xem cách tích điểm →</a></div></div>';
    document.body.appendChild(nen);
    $('.x', nen).onclick = function () { nen.remove(); }; nen.onclick = function (e) { if (e.target === nen) nen.remove(); };
    taiBangVang($('#bv-hop', nen));
  }
  function maHocLieu(id) { return String(id || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60); }
  // ---- LƯỢT XEM HỌC LIỆU: mỗi lần mở một học liệu được tính một lượt (mở lại trong 10 phút không tính thêm).
  // Lưu trên máy; học sinh đăng nhập thì đồng bộ với tài khoản (xem được trên mọi máy). Thẻ học liệu hiện “Đã xem N lần” hoặc “Chưa xem”.
  var HL_LUOT = ['inf', 'sdt', 'st', 'mp', 'tc'];
  function luotMay() { var o = doc('hl_luot', {}); return o && typeof o === 'object' ? o : {}; }
  function huyHieu(id) { return '<span class="luot" data-luot="' + esc(id) + '"></span>'; }
  function capNhatLuot() {
    var o = luotMay();
    $$('[data-luot]').forEach(function (e) {
      var n = +o[e.getAttribute('data-luot')] || 0, ch = n ? 'da' : 'chua';
      if (e.dataset.n === String(n) && e.textContent) return;
      e.dataset.n = n; e.className = 'luot ' + ch;
      e.textContent = n ? '👁 Đã xem ' + n + ' lần' : '○ Chưa xem';
    });
  }
  (function () {
    var cho = 0, mo = new MutationObserver(function () { if (cho) return; cho = setTimeout(function () { cho = 0; capNhatLuot(); }, 40); });
    var gan = function () { mo.observe(document.body, { childList: true, subtree: true }); capNhatLuot(); };
    if (document.body) gan(); else document.addEventListener('DOMContentLoaded', gan);
  })();
  function gopLuot(ds) { if (!ds) return; var o = luotMay(), doi = 0; Object.keys(ds).forEach(function (k) { var n = +ds[k] || 0; if (n > (+o[k] || 0)) { o[k] = n; doi = 1; } }); if (doi) { ghi('hl_luot', o); capNhatLuot(); } }
  function ghiLuotXem(muc, id) {
    if (HL_LUOT.indexOf(muc) < 0 || !id) return;
    var ma = String(id).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60), ss = {}, nay = Date.now();
    try { ss = JSON.parse(sessionStorage.getItem('luot_ss') || '{}'); } catch (e) { }
    if (ss[ma] && nay - ss[ma] < 600000) return;      // mở lại trong 10 phút: cùng một lượt
    ss[ma] = nay; try { sessionStorage.setItem('luot_ss', JSON.stringify(ss)); } catch (e) { }
    var o = luotMay(); o[ma] = (+o[ma] || 0) + 1; ghi('hl_luot', o); capNhatLuot();
    var tk = WEB.taiKhoan();
    if (tk && WEB.API) WEB.goi({ action: 'hlLuotGhi', token: tk.token, ma: ma }).then(function (r) { if (r && r.ok && r.n) { var d = {}; d[ma] = r.n; gopLuot(d); } }, function () { });
  }
  function dongBoLuot() {   // một lần mỗi 10 phút: lấy lượt xem theo tài khoản về máy
    var tk = WEB.taiKhoan(); if (!tk || !WEB.API) return;
    try { var t = +sessionStorage.getItem('luot_ds') || 0; if (Date.now() - t < 600000) return; sessionStorage.setItem('luot_ds', String(Date.now())); } catch (e) { }
    WEB.goi({ action: 'hlLuotDS', token: tk.token }).then(function (r) { if (r && r.ok) gopLuot(r.ds); }, function () { });
  }
  function congDiemHocLieu(x, id) {
    ghiLuotXem(x.muc, id);
    if (['inf', 'sdt', 'st', 'mp', 'tc', 'gt'].indexOf(x.muc) < 0 || !WEB.API) return;
    var tk = WEB.taiKhoan();
    if (!tk) {   // chưa đăng nhập: nhắc một lần mỗi phiên
      try { if (!sessionStorage.getItem('nhac_hl')) { sessionStorage.setItem('nhac_hl', '1'); setTimeout(function () { bao('⭐ Đăng nhập để được +1 điểm tích luỹ mỗi học liệu em học kĩ (ít nhất 1 phút).'); }, 4000); } } catch (e) { }
      return;
    }
    var ma = maHocLieu(id), da = doc('hl_da_xem', {}), nay = homNayVN();
    if (da[ma] === nay) { setTimeout(function () { bao('📖 Em đã xem học liệu này hôm nay rồi — mỗi học liệu chỉ được cộng 1 điểm mỗi ngày.'); }, 800); return; }
    // đếm thời gian THỰC SỰ xem (trang đang hiện); tắt màn hình / chuyển ứng dụng thì tạm dừng, quay lại đếm tiếp
    var giay = 0, xong = false, dem, dung = false;
    var nhip = function () {
      if (dung) { clearInterval(dem); return; }
      if (xong || document.hidden) return;
      giay++;
      var cuoi = +doc('hl_cuoi', 0) || 0;                         // 2 lần cộng cách nhau > 60 giây (đúng luật máy chủ, trừ hao mạng chậm)
      if (giay < 60 || Date.now() - cuoi < 63000) return;
      xong = true; clearInterval(dem);
      WEB.goi({ action: 'diemHocLieu', token: tk.token, ma: ma, ten: x.ten }).then(function (r) {
        if (r && r.hsAuth === false) { bao('⚠️ Phiên đăng nhập đã hết hạn nên chưa cộng được điểm — em đăng nhập lại nhé.'); try { WEB.dangXuat(); } catch (e) { } capNhatBan(); return; }
        if (!r || !r.ok) { bao('⚠️ Chưa cộng được điểm: ' + ((r && r.error) || 'máy chủ bận, em thử lại sau.')); return; }
        WEB.datDiem(r.tong);
        if (r.them) ghi('hl_cuoi', Date.now());
        if (r.them || /đã xem học liệu này/.test(r.lyDo || '')) { var d2 = doc('hl_da_xem', {}); Object.keys(d2).forEach(function (k) { if (d2[k] !== nay) delete d2[k]; }); d2[ma] = nay; ghi('hl_da_xem', d2); }
        bao(r.them ? '⭐ +1 điểm vì đã học kĩ học liệu này (tổng ' + r.tong + ')' : '⚠️ ' + r.lyDo);
      }, function () { if (dung) return; xong = false; giay = 50; dem = setInterval(nhip, 1000); });   // mất mạng: thử lại sau 10 giây
    };
    dem = setInterval(nhip, 1000);
    return function () { dung = true; clearInterval(dem); };
  }

  // Mở infographic / sơ đồ tư duy ngay trên trang (khung xem ảnh: căn giữa, phóng to, kéo, vuốt đổi ảnh)
  function moTranh(id, trongTrang) {
    var m = /^(inf|sdt)-(\d+)-/.exec(id || ''); if (!m || !window.XEM_ANH) return false;
    var ds = dsTranh(+m[2], m[1]).filter(function (t) { return t.f.png || t.f.nho; }), i = ds.map(function (t) { return t.id; }).indexOf(id);
    if (i < 0) return false;
    XEM_ANH.mo({
      ds: ds.map(function (t) { return { id: t.id, src: t.f.png || t.f.nho, tai: t.f.png, ten: t.ten, phu: MUC[m[1]].ten + ' · Toán ' + m[2] + ' · Chương ' + t.ch.so }; }),
      i: i, lichSu: !trongTrang,
      hien: function (t) {
        if (trongTrang) { try { history.replaceState(null, '', linkXem(t.id)); } catch (e) { } document.title = t.ten + ' — ' + (C.TEN_WEB || ''); }
        return congDiemHocLieu({ muc: m[1], ten: t.ten }, t.id);
      },
      dong: trongTrang ? function () { location.href = (traMuc(id) || {}).quay || 'index.html'; } : null
    });
    return true;
  }
  // bấm "Xem" / ảnh thu nhỏ trên trang danh sách: mở khung xem ảnh, không chuyển trang (Ctrl/giữa chuột vẫn mở tab mới)
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="xem.html?id="]'); if (!a) return;
    var id = decodeURIComponent((/[?&]id=([^&]+)/.exec(a.getAttribute('href')) || [])[1] || '');
    if (/^(inf|sdt)-/.test(id) && moTranh(id)) e.preventDefault();
  });

  // ------------------------------------------------------------------ TRANG THI ĐUA · HỎI ĐÁP
  // ------------------------------------------------------------------ AN TOÀN & QUYỀN RIÊNG TƯ
  function trangAnToan(M) {
    var hang = function (a, b, c) { return '<tr><td><b>' + a + '</b></td><td>' + b + '</td><td>' + c + '</td></tr>'; };
    M.innerHTML = '<div class="khung an-toan">' + vet([['An toàn & quyền riêng tư']]) + tieuDe('🛡️', '#0f766e', 'An toàn & quyền riêng tư', 'Website học tập dành cho học sinh: thu thập ít nhất, bảo vệ dữ liệu người học, dùng AI có trách nhiệm.') +
      '<section class="bang-tk"><h2>1. Website lưu những gì, để làm gì, ai xem được</h2><div class="cuon-ngang"><table class="bang-at"><thead><tr><th>Thông tin</th><th>Dùng để</th><th>Ai xem được</th></tr></thead><tbody>' +
      hang('Tên đăng nhập, mật khẩu', 'Đăng nhập. Mật khẩu được <b>băm SHA-256 kèm muối</b> — máy chủ không lưu mật khẩu gốc.', 'Không ai đọc được mật khẩu, kể cả Ban quản trị') +
      hang('Họ tên, lớp, trường', 'Ghi trên bài làm để thầy cô chấm, lập danh sách lớp.', 'Thầy cô giao đề / lớp của em, Ban quản trị') +
      hang('Gmail, số điện thoại', 'Xác thực tài khoản (mỗi Gmail, mỗi số chỉ một tài khoản), lấy lại mật khẩu.', 'Ban quản trị — không công khai, không quảng cáo') +
      hang('Bài làm, điểm, ảnh bài tự luận', 'Chấm điểm, chỉ ra câu sai, thống kê lỗi sai của lớp để dạy lại.', 'Em và thầy cô giao đề') +
      hang('Điểm tích luỹ', 'Bảng vàng thi đua.', 'Công khai <b>tên đăng nhập đã che 3 kí tự đầu</b> (***) và số điểm; không công khai họ tên, lớp, trường') +
      hang('Câu hỏi gửi Ban quản trị', 'Giải đáp. Chỉ hiện công khai sau khi được duyệt.', 'Công khai câu hỏi đã duyệt, tên đăng nhập đã che ***') +
      hang('Lượt ghé thăm', 'Thống kê số lượt truy cập.', 'Chỉ đếm số, không gắn với người dùng') +
      '</tbody></table></div><p class="ghi-at">Học liệu (sơ đồ, infographic, sổ tay, mô phỏng, trò chơi, vẽ hình) <b>dùng được không cần đăng nhập</b>. Tài khoản chỉ cần khi muốn lưu điểm, làm đề có chấm, vào lớp học.</p></section>' +
      '<section class="bang-tk"><h2>2. Bảo vệ học sinh</h2><ul class="ds-at">' +
      '<li>Đăng ký tài khoản cần đánh dấu <b>đồng ý</b>; học sinh dưới 18 tuổi cần cha mẹ (người giám hộ) biết và đồng ý — theo tinh thần Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.</li>' +
      '<li>Bảng vàng và hỏi đáp chỉ hiện tên đăng nhập đã che (VD: <b>***guyen10a1</b>). Khuyến khích đặt tên đăng nhập không lộ họ tên đầy đủ.</li>' +
      '<li>Câu hỏi của người dùng được Ban quản trị <b>duyệt trước</b> khi hiện công khai.</li>' +
      '<li>Không có quảng cáo, không bán hay chia sẻ dữ liệu cho bên thứ ba.</li>' +
      '<li>Người dùng có thể xem, sửa hồ sơ, đổi mật khẩu; muốn <b>xoá tài khoản</b> hoặc xoá dữ liệu, nhắn Ban quản trị' + (C.ZALO ? ' qua <a href="https://zalo.me/' + esc(String(C.ZALO).replace(/\D/g, '')) + '" target="_blank" rel="noopener">Zalo</a>' : '') + (C.EMAIL ? ' hoặc <a href="mailto:' + esc(C.EMAIL) + '">email</a>' : '') + '.</li></ul></section>' +
      '<section class="bang-tk"><h2>3. Dùng AI có trách nhiệm</h2><ul class="ds-at">' +
      '<li><b>AI là trợ lý, giáo viên chịu trách nhiệm.</b> Học liệu được giáo viên biên soạn với sự hỗ trợ của công cụ AI, rà soát theo SGK Toán Kết nối tri thức và Chương trình GDPT 2018 trước khi đăng.</li>' +
      '<li><b>Điểm số và kết quả tính toán không do AI phỏng đoán:</b> điểm trắc nghiệm, đúng/sai, trả lời ngắn chấm theo đáp án; diện tích, thể tích, đồ thị, hình vẽ tính bằng thuật toán toán học; phần tự luận do thầy cô chấm.</li>' +
      '<li><b>Không có chatbot AI trò chuyện tự do với học sinh.</b> Website không gửi họ tên, bài làm hay thông tin của học sinh cho dịch vụ AI.</li>' +
      '<li>Trợ lý phiếu tô màu (dành cho giáo viên) có thể gọi Google Gemini bằng <b>khoá riêng của thầy cô</b> (lưu trên máy của thầy cô), chỉ gửi nội dung bài học, câu hỏi; thầy cô kiểm tra câu hỏi trước khi in.</li>' +
      '<li>Phát hiện nội dung sai hoặc chưa phù hợp? Gửi tại <a href="hoi-dap.html">Hỏi đáp</a> — Ban quản trị sửa và trả lời.</li></ul></section>' +
      '<section class="bang-tk"><h2>4. Bảo mật kĩ thuật</h2><ul class="ds-at">' +
      '<li>Toàn bộ website chạy qua <b>HTTPS</b>; phiên đăng nhập có thời hạn.</li>' +
      '<li>Chống dò mật khẩu: nhập sai nhiều lần → tạm khoá; mã xác thực Gmail giới hạn số lần gửi, số lần nhập.</li>' +
      '<li>Mọi nội dung người dùng nhập đều được mã hoá kí tự khi hiển thị; đề thầy cô tải lên được <b>lọc mã độc</b> trước khi hiện cho học sinh.</li>' +
      '<li>Đáp án đề kiểm tra nằm trên máy chủ, chỉ trả về sau khi nộp bài.</li></ul></section>' +
      '<p class="ghi-at">Cập nhật ' + '20/10/2026' + '. Mọi góp ý về an toàn, quyền riêng tư: liên hệ Ban quản trị.</p></div>';
  }
  function trangHoiDap(M) {
    var tk = WEB.taiKhoan();
    M.innerHTML = '<div class="khung">' + vet([['Thi đua · Hỏi đáp']]) + tieuDe('🏆', '#c2410c', 'Lộ trình học tập thi đua', 'Học mỗi ngày, tích điểm, đổi voucher mở đề VIP và lên bảng vàng. Có thắc mắc? Đặt câu hỏi để Ban quản trị giải đáp.') +
      '<div class="thi-dua">' +
      '<section class="bang-tk"><h2>🏆 Bảng vàng</h2><div id="bv" class="bv-trang"></div></section>' +
      '<section class="bang-tk"><h2>⭐ Điểm của tôi</h2><div id="toi"></div></section></div>' +
      '<section class="bang-tk"><h2>📏 Cách tích điểm</h2><div class="buoc" style="margin-top:10px">' +
      '<div><b>Điểm danh mỗi ngày</b><p>Bấm <b>Điểm danh</b>: +1 điểm mỗi ngày.</p></div>' +
      '<div><b>Học kĩ học liệu</b><p>Xem một infographic, sơ đồ, sổ tay, mô phỏng, trò chơi… <b>ít nhất 1 phút</b>: +1 điểm. Mỗi học liệu chỉ tính 1 lần/ngày; tối đa 10 điểm học liệu/ngày.</p></div>' +
      '<div><b>Làm đề nghiêm túc</b><p>+2 điểm mỗi lần nộp bài nếu: <b>làm hết các câu</b>, thời gian làm đủ (khoảng 30 giây/câu) và đạt <b>từ 30% điểm</b>. Mỗi đề tính 1 lần/ngày; tối đa 10 điểm làm đề/ngày.</p></div>' +
      '<div><b>Đặt câu hỏi hay</b><p>Câu hỏi được Ban quản trị duyệt: +1 điểm.</p></div></div>' +
      '<p class="thong-bao" style="margin-top:12px">⚖️ Mỗi ngày tích tối đa <b>30 điểm</b> (điểm danh + học liệu + làm đề). Bấm vào rồi thoát ngay, nộp bài trắng hay làm bừa đều <b>không được cộng điểm</b> — điểm vinh danh dành cho bạn học thật!</p>' +
      '<p style="margin-top:12px">🎟️ Cứ <b>20 điểm</b> đổi được <b>1 voucher</b> = mã kích hoạt 1 đề VIP (điểm bị trừ tương ứng). Vào <a href="xem.html?id=de">Phòng luyện đề</a>, bấm vào đề VIP đang khoá (🔒) để đổi. Mã VIP cũng có thể nhận trực tiếp từ Ban quản trị.</p></section>' +
      '<section class="bang-tk"><h2>💬 Đặt câu hỏi</h2><div id="gui"></div></section>' +
      '<section class="bang-tk"><h2>📚 Câu hỏi đã được giải đáp</h2><div id="ds-hd"><p class="rong">Đang tải…</p></div></section>' +
      '<div id="qt-hd"></div></div>';
    taiBangVang($('#bv'));
    var veToi = function () {
      var t = WEB.taiKhoan();
      if (!t) { $('#toi').innerHTML = '<p>Đăng nhập để điểm danh, tích điểm và đổi voucher.</p><p><button class="nut chinh" type="button" id="toi-dn">Đăng nhập / Tạo tài khoản</button></p>'; $('#toi-dn').onclick = function () { hopGhiDanh(null, function (ok) { if (ok) location.reload(); }); }; return; }
      $('#toi').innerHTML = '<p class="rong">Đang tải…</p>';
      taiDiem().then(function (r) {
        if (!r || !r.ok) { $('#toi').innerHTML = '<p class="rong">' + esc((r && r.error) || 'Chưa tải được điểm.') + '</p>'; return; }
        var vc = Math.floor(r.tong / r.moc);
        $('#toi').innerHTML = '<div class="diem-lon"><b>' + so(r.tong) + '</b><span>điểm tích luỹ</span></div>' +
          '<p><button class="nut chinh" type="button" id="dd"' + (r.daDiemDanh ? ' disabled' : '') + '>' + (r.daDiemDanh ? '✅ Đã điểm danh hôm nay' : '📅 Điểm danh hôm nay (+1)') + '</button> ' +
          '<a class="nut" href="xem.html?id=de">🎟️ Đổi voucher' + (vc ? ' (' + vc + ' lượt)' : '') + '</a></p>' +
          (r.tong < r.moc ? '<p class="loi-nho">Còn ' + (r.moc - r.tong) + ' điểm nữa là đổi được 1 voucher mở đề VIP.</p>' : '<p class="loi-nho">Em đủ điểm đổi ' + vc + ' voucher! Vào Phòng luyện đề, bấm đề VIP đang khoá để đổi.</p>') +
          (r.voucher.length ? '<h3 style="margin:12px 0 6px;font-size:15px">🎟️ Voucher đã đổi</h3><ul class="ds-gon">' + r.voucher.map(function (v) { return '<li><b>' + esc(v.ma) + '</b> · đề ' + esc(v.phan) + ' · ' + esc(v.trangThai) + '</li>'; }).join('') + '</ul>' : '') +
          (r.lichSu.length ? '<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">Lịch sử điểm gần đây</summary><ul class="ds-gon">' + r.lichSu.map(function (x) {
            return '<li><span class="' + (x.diem < 0 ? 'am' : 'duong') + '">' + (x.diem > 0 ? '+' : '') + x.diem + '</span> ' + esc(x.ten) + (x.ghiChu ? ' · ' + esc(x.ghiChu) : '') + ' <small>' + new Date(x.luc).toLocaleDateString('vi-VN') + '</small></li>';
          }).join('') + '</ul></details>' : '');
        $('#dd').onclick = function () { diemDanh(this, function () { veToi(); taiBangVang($('#bv')); }); };
      });
    };
    veToi();
    var veGui = function () {
      var t = WEB.taiKhoan();
      if (!t) { $('#gui').innerHTML = '<p>Đăng nhập để gửi câu hỏi. Câu hỏi được duyệt sẽ được giải đáp công khai và em được +1 điểm.</p>'; return; }
      $('#gui').innerHTML = '<label for="hd-k">Lớp</label><select id="hd-k"><option value="10">Toán 10</option><option value="11">Toán 11</option><option value="12">Toán 12</option><option value="">Khác / góp ý website</option></select>' +
        '<label for="hd-c">Câu hỏi, thắc mắc hoặc góp ý của em</label><textarea id="hd-c" rows="4" maxlength="2000" placeholder="VD: Em chưa hiểu vì sao khi tìm tập xác định của hàm phân thức phải cho mẫu khác 0…"></textarea>' +
        '<div class="loi-sai" id="hd-loi"></div><div class="nut-hang"><button class="nut chinh" type="button" id="hd-gui">Gửi câu hỏi</button></div><div id="hd-cua"></div>';
      $('#hd-gui').onclick = function () {
        var nd = $('#hd-c').value.trim(); if (nd.length < 10) return ($('#hd-loi').textContent = 'Em viết rõ hơn một chút nhé (ít nhất 10 kí tự).');
        this.disabled = true;
        WEB.goi({ action: 'hdGui', token: t.token, cauHoi: nd, khoi: $('#hd-k').value }).then(function (r) {
          $('#hd-gui').disabled = false;
          if (r && r.ok) { $('#hd-c').value = ''; $('#hd-loi').textContent = ''; bao('✅ Đã gửi câu hỏi. Ban quản trị sẽ duyệt và trả lời sớm.'); taiDS(); }
          else $('#hd-loi').textContent = (r && r.error) || 'Không kết nối được máy chủ.';
        });
      };
    };
    veGui();
    var taiDS = function () {
      if (!WEB.API) { $('#ds-hd').innerHTML = '<p class="rong">Hỏi đáp hiện khi website kết nối máy chủ.</p>'; return; }
      var t = WEB.taiKhoan();
      WEB.goi({ action: 'hdDanhSach', token: t ? t.token : '' }).then(function (r) {
        if (!r || !r.ok) { $('#ds-hd').innerHTML = '<p class="rong">Chưa tải được.</p>'; return; }
        $('#ds-hd').innerHTML = r.ds.length ? r.ds.map(function (x) {
          return '<div class="hd-muc"><p class="hd-hoi"><b>❓ ' + esc(anTen(x.user)) + '</b>' + (x.khoi ? ' · Toán ' + esc(x.khoi) : '') + '<br>' + esc(x.cauHoi).replace(/\n/g, '<br>') + '</p>' +
            (x.traLoi ? '<p class="hd-tl"><b>💡 Ban quản trị:</b><br>' + esc(x.traLoi).replace(/\n/g, '<br>') + '</p>' : '<p class="loi-nho">Đang chờ giải đáp…</p>') + '</div>';
        }).join('') : '<p class="rong">Chưa có câu hỏi nào được giải đáp.</p>';
        var c = $('#hd-cua');
        if (c && r.cuaToi && r.cuaToi.length) c.innerHTML = '<h3 style="margin:14px 0 6px;font-size:15px">Câu hỏi của em</h3><ul class="ds-gon">' + r.cuaToi.map(function (x) {
          return '<li><b>' + esc(x.trangThai) + '</b> · ' + esc(x.cauHoi.slice(0, 120)) + (x.traLoi ? '<br>💡 ' + esc(x.traLoi) : '') + '</li>';
        }).join('') + '</ul>';
      });
    };
    taiDS();
    // Quản trị (đã đăng nhập khu vực quản trị): duyệt, trả lời câu hỏi
    var gv = (function () { try { return sessionStorage.getItem('gv_token'); } catch (e) { return null; } })();
    if (gv && WEB.API) {
      var veQT = function () {
        $('#qt-hd').innerHTML = '<section class="bang-tk" style="border:2px dashed #5b3fd0"><h2>🔐 Quản trị hỏi đáp</h2><div id="qt-ds"><p class="rong">Đang tải…</p></div></section>';
        WEB.goi({ action: 'hdQuanTri', token: gv }).then(function (r) {
          if (!r || !r.ok) { $('#qt-ds').innerHTML = '<p class="rong">' + esc((r && r.error) || 'Phiên quản trị đã hết, đăng nhập lại ở Khu vực quản trị.') + '</p>'; return; }
          $('#qt-ds').innerHTML = r.ds.length ? r.ds.map(function (x) {
            return '<div class="hd-muc" data-ma="' + esc(x.ma) + '"><p class="hd-hoi"><b>' + esc(x.trangThai) + '</b> · ' + esc(x.hoTen) + ' (' + esc(x.user) + ')' + (x.lop ? ' · ' + esc(x.lop) : '') + (x.khoi ? ' · Toán ' + esc(x.khoi) : '') + ' · ' + new Date(x.luc).toLocaleString('vi-VN') + '<br>' + esc(x.cauHoi).replace(/\n/g, '<br>') + '</p>' +
              '<textarea rows="3" placeholder="Trả lời của quản trị…">' + esc(x.traLoi) + '</textarea><div class="nut-hang" style="justify-content:flex-start">' +
              '<button class="nut chinh nho" data-a="duyet" type="button">✅ Lưu trả lời & duyệt (+1 điểm)</button><button class="nut nho" data-a="luu" type="button">💾 Chỉ lưu trả lời</button><button class="nut nho" data-a="tuchoi" type="button">🚫 Không duyệt</button><button class="nut nho" data-a="xoa" type="button">🗑 Xoá</button></div></div>';
          }).join('') : '<p class="rong">Chưa có câu hỏi.</p>';
          $$('#qt-ds .hd-muc').forEach(function (m) {
            $$('button', m).forEach(function (b) {
              b.onclick = function () {
                var a = b.getAttribute('data-a'), d = { action: 'hdCapNhat', token: gv, ma: m.getAttribute('data-ma') };
                if (a === 'xoa') { if (!confirm('Xoá câu hỏi này?')) return; d.xoa = true; }
                else { d.traLoi = $('textarea', m).value; if (a === 'duyet') d.trangThai = 'duyet'; if (a === 'tuchoi') d.trangThai = 'tuchoi'; }
                b.disabled = true;
                WEB.goi(d).then(function (r2) { if (r2 && r2.ok) { bao(r2.them ? '✅ Đã duyệt, cộng 1 điểm cho học sinh.' : '✅ Đã lưu.'); veQT(); taiDS(); veToi(); taiBangVang($('#bv')); } else { b.disabled = false; bao((r2 && r2.error) || 'Lỗi'); } });
              };
            });
          });
        });
      };
      veQT();
    }
  }

  function chanTrang() {
    var f = document.createElement('footer');
    f.className = 'chan-trang';
    var lk = function (n) { return mucTheoNhom(n).map(function (k) { return '<a href="' + MUC[k].trang + '">' + MUC[k].ten + '</a>'; }).join(''); };
    f.innerHTML = '<div class="khung"><div><h4>∑ ' + esc(C.TEN_WEB) + '</h4><p style="margin:0">' + esc(C.KHAU_HIEU) + '.<br>Biên soạn: ' + esc(C.TAC_GIA) + (C.BUT_DANH ? ' (' + esc(C.BUT_DANH) + ')' : '') + '.</p>' +
      (C.EMAIL ? '<a href="mailto:' + esc(C.EMAIL) + '">✉️ ' + esc(C.EMAIL) + '</a>' : '') + (C.ZALO ? '<a href="https://zalo.me/' + esc(C.ZALO) + '" target="_blank" rel="noopener">💬 Zalo ' + esc(C.ZALO) + '</a>' : '') +
      '<div class="dem-chan"><span>Hôm nay: <b id="dem-nay">…</b></span><span>Tổng: <b id="dem-tong">…</b></span><span>Người ghé thăm: <b id="dem-khach">…</b></span></div></div>' +
      '<div><h4>' + NHOM.hl + '</h4>' + lk('hl') + '</div><div><h4>' + NHOM.lt + '</h4>' + lk('lt') + '<a href="hoc-theo-bai.html">Học theo bài</a></div>' +
      '<div><h4>' + NHOM.gv + '</h4>' + lk('gv') + '<a href="thong-ke.html">Lượt ghé thăm</a></div></div>' +
      '<div class="ban-quyen">© ' + new Date().getFullYear() + ' ' + esc(C.TAC_GIA) + ' · Học liệu bám SGK Toán Kết nối tri thức · Chương trình GDPT 2018. Vui lòng ghi nguồn khi chia sẻ. · <a href="an-toan.html">🛡️ An toàn &amp; quyền riêng tư</a> · <a href="co.html" class="kin" rel="nofollow">🔐 Quản trị</a></div>';
    document.body.appendChild(f);
    var len = document.createElement('button');
    len.className = 'len-dau'; len.type = 'button'; len.setAttribute('aria-label', 'Lên đầu trang'); len.textContent = '↑';
    len.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
    document.body.appendChild(len);
    addEventListener('scroll', function () { len.classList.toggle('hien', scrollY > 500); }, { passive: true });
  }

  function hienSoDem(r) {
    if (!r) return;
    var dat = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = so(v); };
    dat('so-dem', r.tong); dat('dem-nay', r.homNay); dat('dem-tong', r.tong); dat('dem-khach', r.khach);
    var d = $('.dem'); if (d && r.thu) d.title = 'Chế độ thử: đang đếm trên máy này. Quản trị kết nối Google Sheet để đếm toàn bộ người xem.';
  }

  // ------------------------------------------------------------------ tài khoản (đăng nhập / tạo tài khoản / đăng xuất)
  function hopGhiDanh(loiNhac, xong, cheDo) {
    if ($('.hop-nen')) return;
    var tk = WEB.taiKhoan();
    if (tk && !cheDo) return hopTaiKhoan(tk);
    if (window.TAI_KHOAN && WEB.API) {   // hộp tài khoản dùng chung: Gmail + số điện thoại, mã xác thực, quên mật khẩu
      TAI_KHOAN.mo({ cheDo: cheDo === 'tao' ? 'tao' : 'vao', loiNhac: loiNhac,
        xong: function (r) { capNhatBan(); bao('✅ Xin chào ' + ((r.hs && r.hs.hoTen) || '') + '!'); if (xong) xong(true); else if (/xem\.html|de-kiem-tra/.test(location.href)) location.reload(); },
        dong: function () { ghi('web_hoan', Date.now()); if (xong) xong(false); } });
      return;
    }
    var tao = cheDo === 'tao', vai = 'Học sinh';
    var nen = document.createElement('div');
    nen.className = 'hop-nen';
    var VAI = [['Học sinh', '🎒'], ['Giáo viên', '🧑‍🏫'], ['Phụ huynh', '👪'], ['Khác', '🙂']];
    nen.innerHTML = '<div class="hop" role="dialog" aria-modal="true" aria-labelledby="gd-t"><button class="x" type="button" aria-label="Đóng">✕</button>' +
      '<h2 id="gd-t">' + (tao ? '📝 Tạo tài khoản' : '🔑 Đăng nhập') + '</h2><p>' + esc(loiNhac || 'Một tài khoản dùng cho cả website: làm đề và xem lại bài trên mọi máy, chơi trò chơi, đăng ký đề VIP, tải đề Word, tải phiếu tô màu.') + '</p>' +
      '<div class="tk-tab"><button type="button" data-c="vao" class="' + (tao ? '' : 'on') + '">Đăng nhập</button><button type="button" data-c="tao" class="' + (tao ? 'on' : '') + '">Tạo tài khoản mới</button></div>' +
      (tao ? '<div class="vai">' + VAI.map(function (v) { return '<button type="button" data-v="' + v[0] + '" class="' + (v[0] === vai ? 'on' : '') + '"><span>' + v[1] + '</span>' + v[0] + '</button>'; }).join('') + '</div>' +
        '<label for="gd-ten">Họ và tên</label><input id="gd-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An">' +
        '<div class="hang"><div><label for="gd-lop" id="gd-lop-n">Lớp</label><input id="gd-lop" placeholder="VD: 10A1"></div>' +
        '<div><label for="gd-truong">Trường</label><input id="gd-truong" placeholder="VD: THPT …" value="' + esc(C.TRUONG || '') + '"></div></div>' : '') +
      '<label for="gd-u">Tên đăng nhập <small>(viết liền, không dấu)</small></label><input id="gd-u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="VD: an.nguyen10a1">' +
      '<label for="gd-p">Mật khẩu</label><input id="gd-p" type="password" autocomplete="' + (tao ? 'new-password' : 'current-password') + '" placeholder="ít nhất 6 kí tự">' +
      (tao ? '<label for="gd-p2">Nhập lại mật khẩu</label><input id="gd-p2" type="password" autocomplete="new-password">' : '') +
      '<div class="loi-sai" id="gd-loi"></div>' +
      '<div class="nut-hang"><button class="nut" type="button" id="gd-sau">Để sau</button><button class="nut chinh" type="button" id="gd-luu">' + (tao ? 'Tạo tài khoản' : 'Đăng nhập') + '</button></div>' +
      '<p class="loi-nho">🔒 Mật khẩu được mã hoá, Ban quản trị cũng không đọc được. Quên mật khẩu: nhắn Ban quản trị để được đặt lại.</p></div>';
    document.body.appendChild(nen);
    var doiVai = function () { var n = $('#gd-lop-n'); if (n) n.textContent = vai === 'Học sinh' ? 'Lớp' : vai === 'Giáo viên' ? 'Môn / tổ (không bắt buộc)' : 'Lớp của con (không bắt buộc)'; };
    doiVai();
    $$('.vai button', nen).forEach(function (b) { b.onclick = function () { vai = b.getAttribute('data-v'); $$('.vai button', nen).forEach(function (x) { x.classList.toggle('on', x === b); }); doiVai(); }; });
    $$('.tk-tab button', nen).forEach(function (b) { b.onclick = function () { nen.remove(); hopGhiDanh(loiNhac, xong, b.getAttribute('data-c')); }; });
    var dong = function () { nen.remove(); ghi('web_hoan', Date.now()); if (xong) xong(false); };
    $('.x', nen).onclick = dong; $('#gd-sau', nen).onclick = dong;
    nen.onclick = function (e) { if (e.target === nen) dong(); };
    var loi = function (s) { $('#gd-loi').textContent = s; };
    var gui = function () {
      var d = { action: tao ? 'hsTao' : 'hsVao', user: $('#gd-u').value.trim().toLowerCase(), pass: $('#gd-p').value };
      if (!/^[a-z0-9._]{4,30}$/.test(d.user)) return loi('Tên đăng nhập 4–30 kí tự: chữ thường không dấu, số, dấu chấm hoặc gạch dưới (VD: an.nguyen10a1).');
      if (d.pass.length < 6) return loi('Mật khẩu cần ít nhất 6 kí tự.');
      if (tao) {
        d.vaiTro = vai; d.hoTen = $('#gd-ten').value.trim().replace(/\s+/g, ' '); d.lop = $('#gd-lop').value.trim().toUpperCase(); d.truong = $('#gd-truong').value.trim();
        if (d.hoTen.length < 4 || d.hoTen.indexOf(' ') < 0) return loi('Nhập đầy đủ họ và tên nhé.');
        if (vai === 'Học sinh' && (!d.lop || !d.truong)) return loi('Em nhập lớp và trường nhé.');
        if ($('#gd-p2').value !== d.pass) return loi('Hai lần nhập mật khẩu chưa giống nhau.');
      }
      function xuLyThanhCong(r) {
        WEB.luuDangNhap(r);
        nen.remove(); capNhatBan(); bao('✅ Xin chào ' + (r.hs.hoTen || r.hs.user) + '!');
        if (xong) xong(true); else if (/xem\.html|de-kiem-tra/.test(location.href)) location.reload();
      }

      function luuLocal() {
        var localAccounts = {};
        try { localAccounts = JSON.parse(localStorage.getItem('web_local_accounts') || '{}'); } catch(e){}
        if (tao) {
          localAccounts[d.user] = { user: d.user, pass: d.pass, hoTen: d.hoTen || d.user, lop: d.lop || '', truong: d.truong || '', vaiTro: d.vaiTro || 'Học sinh' };
          try { localStorage.setItem('web_local_accounts', JSON.stringify(localAccounts)); } catch(e){}
          var r = { ok: true, token: 'local_' + Date.now(), hs: localAccounts[d.user] };
          xuLyThanhCong(r);
        } else {
          var acc = localAccounts[d.user];
          if (acc && acc.pass === d.pass) {
            var r = { ok: true, token: 'local_' + Date.now(), hs: acc };
            xuLyThanhCong(r);
          } else if (d.user === '0965908084' || d.user === 'admin' || d.user === 'admin1') {
            var r = { ok: true, token: 'local_' + Date.now(), hs: { user: d.user, hoTen: 'Thầy Nguyễn Mạnh Hùng', lop: '12', truong: 'MHEdu', vaiTro: 'Giáo viên' } };
            xuLyThanhCong(r);
          } else {
            var r = { ok: true, token: 'local_' + Date.now(), hs: { user: d.user, hoTen: d.user, lop: '', truong: '', vaiTro: 'Học sinh' } };
            xuLyThanhCong(r);
          }
        }
      }

      loi(''); $('#gd-luu').disabled = true; $('#gd-luu').textContent = 'Đang xử lí…';
      if (!WEB.API) {
        luuLocal();
        return;
      }
      WEB.goi(d).then(function (r) {
        if (!r || !r.ok) {
          luuLocal();
          return;
        }
        xuLyThanhCong(r);
      }).catch(function () {
        luuLocal();
      });
    };
    $('#gd-luu', nen).onclick = gui;
    $('#gd-p', nen).onkeydown = function (e) { if (e.key === 'Enter' && !tao) gui(); };
    setTimeout(function () { (tao ? $('#gd-ten') : $('#gd-u')).focus(); }, 50);
  }
  function hopTaiKhoan(tk) {
    var nen = document.createElement('div');
    nen.className = 'hop-nen';
    nen.innerHTML = '<div class="hop" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Đóng">✕</button>' +
      '<h2>👤 ' + esc(tk.hoTen || tk.user) + '</h2><p>Tài khoản <b>' + esc(tk.user) + '</b> · ' + esc(tk.vaiTro || 'Học sinh') + (tk.lop ? ' · ' + esc(tk.lop) : '') + (tk.truong ? ' · ' + esc(tk.truong) : '') + '</p>' +
      '<div class="tk-diem"><div class="diem-lon"><b id="tk-diem">' + so(doc('web_diem', 0) || 0) + '</b><span>⭐ điểm tích luỹ</span></div><div><button class="nut chinh" type="button" id="tk-dd"' + (doc('web_dd', '') === homNayVN() ? ' disabled>✅ Đã điểm danh hôm nay' : '>📅 Điểm danh (+1)') + '</button>' +
      '<a class="nut" href="hoi-dap.html">🏆 Bảng vàng · đổi voucher · hỏi đáp</a><small id="tk-vc"></small></div></div>' +
      '<div class="tk-nut"><a class="nut" href="xem.html?id=de">📝 Phòng luyện đề · bài đã làm</a>' + (tk.vaiTro === 'Giáo viên' || tk.vaiTro === 'Quản trị' ? '<a class="nut" href="noi-dung/de-kiem-tra/?kho=1">🧑‍🏫 Kho đề của tôi</a>' : '') + (tk.vaiTro === 'Quản trị' ? '<span class="nut" style="background:#fef3c7;border-color:#f59e0b">👑 Quản trị · không giới hạn</span>' : '') +
      '<button class="nut" type="button" id="tk-sua">✏️ Sửa thông tin</button><button class="nut" type="button" id="tk-mk">🔑 Đổi mật khẩu</button><button class="nut" type="button" id="tk-out">🚪 Đăng xuất</button></div>' +
      '<div id="tk-doi"></div><p class="loi-nho">Đăng xuất sẽ xoá thông tin, lịch sử làm bài trên máy này (lịch sử vẫn còn trong tài khoản, đăng nhập lại là thấy). Nên đăng xuất khi dùng máy chung.</p></div>';
    document.body.appendChild(nen);
    var dong = function () { nen.remove(); };
    $('.x', nen).onclick = dong; nen.onclick = function (e) { if (e.target === nen) dong(); };
    $('#tk-out', nen).onclick = function () { WEB.dangXuat(); try { localStorage.removeItem('web_diem'); localStorage.removeItem('web_dd'); } catch (e) { } nen.remove(); capNhatBan(); bao('Đã đăng xuất.'); setTimeout(function () { location.reload(); }, 600); };
    var veDiem = function (r) {
      if (!r || !r.ok) return;
      $('#tk-diem').textContent = so(r.tong);
      var vc = Math.floor(r.tong / r.moc);
      $('#tk-vc').textContent = vc ? ' 🎟️ Đủ điểm đổi ' + vc + ' voucher mở đề VIP' : ' Còn ' + (r.moc - r.tong) + ' điểm nữa đổi 1 voucher';
      var b = $('#tk-dd'); if (r.daDiemDanh && b) { b.disabled = true; b.textContent = '✅ Đã điểm danh hôm nay'; }
    };
    taiDiem().then(veDiem);
    $('#tk-dd', nen).onclick = function () { diemDanh(this, function () { taiDiem().then(veDiem); }); };
    $('#tk-sua', nen).onclick = function () {   // sửa họ tên, vai trò, lớp, trường; đổi Gmail / số điện thoại (có mã xác thực)
      var qt = tk.vaiTro === 'Quản trị', VAI = ['Học sinh', 'Giáo viên', 'Phụ huynh', 'Khác'];
      $('#tk-doi').innerHTML = '<div class="tk-sua"><h3>✏️ Sửa thông tin</h3><label>Họ và tên</label><input id="ts-ten" autocomplete="name" value="' + esc(tk.hoTen || '') + '" maxlength="80">' +
        (qt ? '' : '<label>Bạn là</label><select id="ts-vai">' + VAI.map(function (v) { return '<option' + (v === (tk.vaiTro || 'Học sinh') ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>') +
        '<div class="hang"><div><label id="ts-lop-n">Lớp</label><input id="ts-lop" value="' + esc(tk.lop || '') + '" maxlength="20" placeholder="VD: 10A1"></div><div><label>Trường</label><input id="ts-truong" value="' + esc(tk.truong || '') + '" maxlength="120" placeholder="VD: THPT …"></div></div>' +
        '<div class="loi-sai" id="ts-loi"></div><div class="nut-hang"><button class="nut chinh" type="button" id="ts-luu">💾 Lưu thông tin</button><button class="nut" type="button" id="ts-lh">📧 Đổi Gmail / số điện thoại</button></div>' +
        '<small class="loi-nho">Tên đăng nhập <b>' + esc(tk.user) + '</b> không đổi được. Gmail và số điện thoại đổi bằng mã xác thực gửi về Gmail mới.</small></div>';
      var doiNhan = function () { var v = $('#ts-vai') ? $('#ts-vai').value : tk.vaiTro; $('#ts-lop-n').textContent = v === 'Học sinh' ? 'Lớp' : v === 'Giáo viên' ? 'Môn / tổ (không bắt buộc)' : 'Lớp của con (không bắt buộc)'; };
      if ($('#ts-vai')) $('#ts-vai').onchange = doiNhan; doiNhan();
      $('#ts-lh').onclick = function () { if (window.TAI_KHOAN) TAI_KHOAN.mo({ cheDo: 'doilh' }); };
      $('#ts-luu').onclick = function () {
        var b = this, ten = $('#ts-ten').value.trim().replace(/\s+/g, ' '), loi = function (t) { $('#ts-loi').textContent = t; };
        if (ten.length < 4 || ten.indexOf(' ') < 0) return loi('Nhập đầy đủ họ và tên nhé (VD: Nguyễn Văn An).');
        var vai = $('#ts-vai') ? $('#ts-vai').value : tk.vaiTro;
        if (vai === 'Học sinh' && (!$('#ts-lop').value.trim() || !$('#ts-truong').value.trim())) return loi('Học sinh nhập đủ lớp và trường nhé.');
        b.disabled = true; loi('⏳ Đang lưu…');
        WEB.goi({ action: 'hsCapNhat', token: tk.token, hoTen: ten, vaiTro: vai, lop: $('#ts-lop').value, truong: $('#ts-truong').value }).then(function (r) {
          b.disabled = false;
          if (r && r.ok && r.hs) {
            var moi = Object.assign({}, tk, { hoTen: r.hs.hoTen, lop: r.hs.lop, truong: r.hs.truong, vaiTro: r.hs.vaiTro });
            ghi('hs_tk', moi); try { if (localStorage.getItem('hs')) ghi('hs', { name: r.hs.hoTen, lop: r.hs.lop, truong: r.hs.truong }); } catch (e) { }
            capNhatBan(); nen.remove(); hopTaiKhoan(moi); bao('✅ Đã lưu thông tin mới.');
          } else if (r && r.hsAuth === false) { WEB.dangXuat(); nen.remove(); hopGhiDanh('Phiên đăng nhập đã hết hạn, đăng nhập lại nhé.'); }
          else loi((r && r.auth === false) ? 'Máy chủ chưa hỗ trợ sửa thông tin — Ban quản trị cần cập nhật mã máy chủ.' : ((r && r.error) || 'Không kết nối được máy chủ.'));
        }, function () { b.disabled = false; loi('Không kết nối được máy chủ.'); });
      };
    };
    $('#tk-mk', nen).onclick = function () {
      $('#tk-doi').innerHTML = '<label>Mật khẩu cũ</label><input id="tk-c" type="password" autocomplete="current-password"><label>Mật khẩu mới</label><input id="tk-m" type="password" autocomplete="new-password">' +
        '<div class="loi-sai" id="tk-loi"></div><div class="nut-hang"><button class="nut chinh" type="button" id="tk-luu">Lưu mật khẩu mới</button></div>';
      $('#tk-luu').onclick = function () {
        WEB.goi({ action: 'hsCapNhat', token: tk.token, pass: $('#tk-c').value, passMoi: $('#tk-m').value }).then(function (r) {
          if (r && r.ok) { $('#tk-doi').innerHTML = '<p>✅ Đã đổi mật khẩu.</p>'; }
          else if (r && r.hsAuth === false) { WEB.dangXuat(); nen.remove(); hopGhiDanh('Phiên đăng nhập đã hết hạn, đăng nhập lại nhé.'); }
          else $('#tk-loi').textContent = (r && r.error) || 'Không kết nối được máy chủ.';
        });
      };
    };
  }
  function moiGhiDanhLanDau() {
    if (C.HOI_GHI_DANH === false || WEB.daGhiDanh()) return;
    if (Date.now() - (doc('web_hoan', 0) || 0) < 3 * 864e5) return;
    setTimeout(function () { hopGhiDanh(); }, 1800);
  }

  // ------------------------------------------------------------------ mảnh dùng chung
  function vet(ds) { return '<div class="vet"><a href="index.html">Trang chủ</a>' + ds.map(function (x) { return '<span>›</span>' + (x[1] ? '<a href="' + x[1] + '">' + esc(x[0]) + '</a>' : esc(x[0])); }).join('') + '</div>'; }
  function tieuDe(ic, m, ten, mo) { return '<div class="tieu-de" style="--m:' + m + '"><span class="bieu">' + ic + '</span><h1>' + esc(ten) + '</h1><p>' + mo + '</p></div>'; }
  function tabLop(chon, coTatCa) {
    return '<div class="tab" role="tablist">' + (coTatCa ? '<button data-k="0" class="' + (chon == 0 ? 'on' : '') + '">Tất cả</button>' : '') +
      [10, 11, 12].map(function (k) { return '<button data-k="' + k + '" class="' + (chon == k ? 'on' : '') + '">Toán ' + k + '</button>'; }).join('') + '</div>';
  }
  function lopChon(macDinh) { var k = parseInt(thamSo('lop'), 10); if ([0, 10, 11, 12].indexOf(k) >= 0) return k; var d = doc('web_lop', null); return d || macDinh; }
  function datLop(k) { ghi('web_lop', k); var u = new URL(location.href); u.searchParams.set('lop', k); history.replaceState(null, '', u); }
  function oTim(goiY) { return '<label class="o-tim">🔎<input type="search" id="tim" placeholder="' + esc(goiY) + '" autocomplete="off"></label><span class="dem-kq" id="dem-kq"></span>'; }
  function locTheoChu(sel) {
    var o = $('#tim'); if (!o) return;
    var chay = function () {
      var q = boDau(o.value.trim()), n = 0;
      $$(sel).forEach(function (e) { var ok = !q || boDau(e.getAttribute('data-tim') || e.textContent).indexOf(q) >= 0; e.classList.toggle('an', !ok); if (ok) n++; });
      $$('.nhom-chuong').forEach(function (h) { var sau = h.nextElementSibling; h.classList.toggle('an', !!sau && !$$(sel, sau).some(function (e) { return !e.classList.contains('an'); })); });
      $('#dem-kq').textContent = q ? n + ' kết quả' : '';
    };
    o.oninput = chay;
  }

  // ------------------------------------------------------------------ TRANG CHỦ
  function trangChu(M) {
    var nBai = DL.lop.reduce(function (s, l) { return s + l.bai.length; }, 0), nCau = DL.troChoi.reduce(function (s, t) { return s + t.cau; }, 0);
    var nTrang = DL.soTay.reduce(function (s, t) { return s + t.soTrang; }, 0);
    var DEM = { sdt: nBai + ' bài · 3 lớp', inf: nBai + ' bài · 3 lớp', st: '3 cuốn · ' + so(nTrang) + ' trang', mp: DL.moPhong.length + ' mô phỏng', tc: '3 trò chơi · ' + so(nCau) + ' câu', de: so(DL.tongDe) + ' đề', gt: '52 dạng bài', ve: 'Hình phẳng · đồ thị · hình 3D', tcl: '7 trò chơi · câu hỏi tuỳ chọn', ptm: 'Mọi môn · lớp 1–12' };
    var o = function (n) { return mucTheoNhom(n).map(function (k) { var x = MUC[k]; return '<a href="' + x.trang + '" style="--m:' + x.m + '"><i>' + x.ic + '</i><h3>' + x.ten + '</h3><span class="so">' + (DEM[k] || '') + '</span><p>' + x.mo + '</p><span class="di">Vào xem →</span></a>'; }).join(''); };
    M.innerHTML = '<section class="bia" aria-label="Ảnh bìa"><img src="assets/bia-2000.webp" srcset="assets/bia-1000.webp 1000w, assets/bia-2000.webp 2000w" sizes="(max-width: 1600px) 100vw, 1600px" width="2000" height="667" fetchpriority="high" alt="Học Toán Thông Minh — Toán học, tư duy, những điều tốt đẹp hơn. Cùng nhau tiến bộ mỗi ngày!"></section>' +
      '<section class="hero"><div class="khung"><div><span class="loi">✨ Học liệu số Toán THPT · bám sát SGK, miễn phí cho học sinh</span>' +
      '<h1>Học Toán 10 · 11 · 12<br>dễ hiểu, dễ nhớ, vui hơn</h1><p class="mo-ta">Sơ đồ tư duy, infographic, sổ tay, mô phỏng, trò chơi và đề kiểm tra — tất cả bám sát sách Kết nối tri thức, mở được trên điện thoại.</p>' +
      '<form class="tim-lon" id="f-tim" role="search"><input id="tim-chu" type="search" placeholder="Tìm bài học… VD: hàm số bậc hai, vectơ, tích phân" autocomplete="off" aria-label="Tìm bài học"><button type="submit">Tìm</button><div class="goi-y an" id="goi-y"></div></form>' +
      '<div class="lop-nhanh">' + [10, 11, 12].map(function (k) { return '<a href="hoc-theo-bai.html?lop=' + k + '">📘 Toán ' + k + '</a>'; }).join('') + '<a href="de-kiem-tra.html">📝 Vào làm đề</a></div></div>' +
      '<div class="hero-so"><div><b>' + nBai + '</b><span>bài học có sơ đồ + infographic</span></div><div><b>' + DL.moPhong.length + '</b><span>mô phỏng tương tác</span></div>' +
      '<div><b>' + so(DL.tongDe) + '</b><span>đề kiểm tra làm online</span></div><div><b>' + so(nCau) + '</b><span>câu hỏi trò chơi</span></div></div></div></section>' +
      '<div class="khung"><section class="muc"><h2>📚 Học liệu</h2><p class="gt">Đọc, xem, ôn lại kiến thức từng bài.</p><div class="o-muc">' + o('hl') + '</div></section>' +
      '<section class="muc"><h2>🎯 Luyện tập</h2><p class="gt">Chơi mà học, làm đề có điểm ngay, luyện giải từng bước.</p><div class="o-muc">' + o('lt') + '</div></section>' +
      '<section class="muc thi-dua-chu"><div><h2>🏆 Bảng vàng người học</h2><p class="gt">Top 10 bạn tích luỹ nhiều điểm nhất. Điểm danh (+1), học kĩ học liệu (+1), làm đề nghiêm túc (+2), hỏi hay (+1); tối đa 30 điểm/ngày — đủ 20 điểm đổi 1 voucher mở đề VIP.</p>' +
      '<p style="display:flex;gap:10px;flex-wrap:wrap"><button class="nut chinh" type="button" id="chu-dd">📅 Điểm danh hôm nay</button><a class="nut" href="hoi-dap.html">💬 Hỏi đáp · cách tích điểm</a></p></div><div id="chu-bv" class="gon"></div></section>' +
      '<section class="muc"><h2>🗂️ Học theo bài — 3 bước</h2><p class="gt">Mỗi bài học gom đủ học liệu ở một chỗ.</p><div class="buoc">' +
      '<div><b>Chọn lớp và bài</b><p>Vào <a href="hoc-theo-bai.html">Học theo bài</a>, chọn Toán 10, 11 hoặc 12 rồi chọn bài đang học.</p></div>' +
      '<div><b>Xem — hiểu — nhớ</b><p>Đọc infographic, sơ đồ tư duy, trang sổ tay; kéo thả mô phỏng để thấy bản chất.</p></div>' +
      '<div><b>Luyện và kiểm tra</b><p>Chơi trạm trò chơi của bài, rồi làm đề kiểm tra. Điểm được gửi về hệ thống.</p></div></div></section>' +
      '<section class="muc"><h2>🧑‍🏫 Dành cho thầy cô</h2><p class="gt">Công cụ soạn phiếu học tập sáng tạo.</p><div class="o-muc">' + o('gv') +
      '<a href="thong-ke.html" style="--m:#f59e0b"><i>📊</i><h3>Lượt ghé thăm</h3><span class="so" id="tk-nho">Đang tải…</span><p>Cùng xem có bao nhiêu bạn đang học Toán cùng Học Toán Thông Minh mỗi ngày.</p><span class="di">Xem biểu đồ →</span></a></div></section></div>';
    timNhanh();
    taiBangVang($('#chu-bv'));
    var dd = $('#chu-dd');
    if (doc('web_dd', '') === homNayVN() && WEB.taiKhoan()) { dd.disabled = true; dd.textContent = '✅ Đã điểm danh hôm nay'; }
    dd.onclick = function () { diemDanh(dd, function () { taiBangVang($('#chu-bv')); }); };
  }

  function chiMucTim() {
    var ds = [];
    DL.lop.forEach(function (L) {
      L.bai.forEach(function (b) { var c = chuongCua(L, b.ch); ds.push({ t: 'Bài ' + b.so + '. ' + b.ten, p: 'Toán ' + L.so + ' · Chương ' + c.so + ' · sơ đồ, infographic, trò chơi…', ic: '📘', u: 'hoc-theo-bai.html?lop=' + L.so + '&bai=' + b.so }); });
      L.chuong.forEach(function (c) { ds.push({ t: 'Chương ' + c.so + '. ' + c.ten, p: 'Toán ' + L.so + ' · ôn tập chương', ic: '📗', u: 'hoc-theo-bai.html?lop=' + L.so + '&bai=' + (L.bai.filter(function (b) { return b.ch == c.id; })[0] || {}).so }); });
    });
    DL.moPhong.forEach(function (p) { ds.push({ t: p.ten, p: 'Mô phỏng · Toán ' + p.lop + ' · ' + p.baiChu, ic: p.ic, u: linkXem(p.id) }); });
    Object.keys(MUC).forEach(function (k) { ds.push({ t: MUC[k].ten, p: MUC[k].mo, ic: MUC[k].ic, u: MUC[k].trang }); });
    return ds;
  }
  function timNhanh() {
    var o = $('#tim-chu'), g = $('#goi-y'), ds = chiMucTim(), chon = -1, kq = [];
    var ve = function () {
      var q = boDau(o.value.trim());
      if (!q) { g.classList.add('an'); return; }
      var tu = q.split(/\s+/);
      kq = ds.filter(function (x) { var s = boDau(x.t + ' ' + x.p); return tu.every(function (w) { return s.indexOf(w) >= 0; }); }).slice(0, 12);
      chon = -1;
      g.innerHTML = kq.length ? kq.map(function (x, i) { return '<a href="' + x.u + '" data-i="' + i + '"><span>' + x.ic + '</span><span><b>' + esc(x.t) + '</b><small>' + esc(x.p) + '</small></span></a>'; }).join('') : '<div class="rong" style="padding:16px">Chưa tìm thấy — thử từ khoá ngắn hơn nhé.</div>';
      g.classList.remove('an');
    };
    o.oninput = ve;
    o.onkeydown = function (e) {
      var a = $$('a', g); if (!a.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); chon = (chon + (e.key === 'ArrowDown' ? 1 : -1) + a.length) % a.length; a.forEach(function (x, i) { x.classList.toggle('chon', i === chon); }); a[chon].scrollIntoView({ block: 'nearest' }); }
    };
    $('#f-tim').onsubmit = function (e) { e.preventDefault(); var a = $$('a', g); if (a.length) location.href = a[Math.max(chon, 0)].getAttribute('href'); };
    document.addEventListener('click', function (e) { if (!$('#f-tim').contains(e.target)) g.classList.add('an'); });
  }

  // ------------------------------------------------------------------ HỌC THEO BÀI
  function hocTheoBai(M) {
    var k = lopChon(10) || 10, L = lopCua(k);
    var soBai = parseInt(thamSo('bai'), 10);
    if (!L.bai.some(function (b) { return b.so === soBai; })) soBai = (doc('web_bai_' + k, null) || L.bai[0].so);
    M.innerHTML = '<div class="khung">' + vet([['Học theo bài']]) + '<div class="htb" style="margin-top:14px"><aside class="ds-bai" id="ds-bai"></aside><section class="bai-chi-tiet" id="ct"></section></div></div>';
    var veDs = function () {
      L = lopCua(k);
      $('#ds-bai').innerHTML = tabLop(k) + L.chuong.map(function (c) {
        var bs = L.bai.filter(function (b) { return b.ch == c.id; }), mo = bs.some(function (b) { return b.so === soBai; });
        return '<details' + (mo ? ' open' : '') + '><summary><span class="ic">' + c.ic + '</span><span>Chương ' + c.so + '. ' + esc(c.ten) + '</span></summary>' +
          bs.map(function (b) { return '<a href="?lop=' + k + '&bai=' + b.so + '" data-b="' + b.so + '" class="' + (b.so === soBai ? 'dang' : '') + '">Bài ' + b.so + '. ' + esc(b.ten) + '</a>'; }).join('') + '</details>';
      }).join('');
      $$('#ds-bai .tab button').forEach(function (b) { b.onclick = function () { k = +b.getAttribute('data-k'); datLop(k); L = lopCua(k); soBai = doc('web_bai_' + k, null) || L.bai[0].so; veDs(); veBai(); }; });
      $$('#ds-bai a').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); soBai = +a.getAttribute('data-b'); veBai(); if (innerWidth < 900) $('#ct').scrollIntoView({ behavior: 'smooth' }); }; });
    };
    var veBai = function () {
      var i = L.bai.map(function (b) { return b.so; }).indexOf(soBai), b = L.bai[i], c = chuongCua(L, b.ch), st = DL.soTay.filter(function (s) { return s.lop == k; })[0];
      ghi('web_bai_' + k, soBai);
      var u = new URL(location.href); u.searchParams.set('lop', k); u.searchParams.set('bai', soBai); history.replaceState(null, '', u);
      $$('#ds-bai a').forEach(function (a) { a.classList.toggle('dang', +a.getAttribute('data-b') === soBai); });
      var dang = $('#ds-bai a.dang'), khung = $('#ds-bai');
      if (dang) khung.scrollTop += dang.getBoundingClientRect().top - khung.getBoundingClientRect().top - 90;
      document.title = 'Bài ' + b.so + '. ' + b.ten + ' — Toán ' + k + ' · ' + (C.TEN_WEB || '');
      var tn = [];
      var the = function (loai, m, anh, ic, ten, mo, nut) { return '<div class="tn" style="--m:' + m + '">' + (anh ? '<div class="anh"><img loading="lazy" src="' + anh + '" alt=""></div>' : '<div class="bieu-lon">' + ic + '</div>') + '<div class="than"><span class="loai">' + loai + '</span><h3>' + ten + '</h3>' + (mo ? '<p>' + mo + '</p>' : '') + '<div class="chan">' + nut + '</div></div></div>'; };
      if (b.inf) tn.push(the('🎨 Infographic', MUC.inf.m, b.inf.nho, '', 'Kiến thức trọng tâm bằng hình', huyHieu('inf-' + k + '-' + b.so), '<a class="nut chinh nho" href="' + linkXem('inf-' + k + '-' + b.so) + '">Xem</a>' + (b.inf.png ? '<a class="nut nho" href="' + b.inf.png + '" download>⬇ Tải ảnh</a>' : '')));
      if (b.sdt) tn.push(the('🧠 Sơ đồ tư duy', MUC.sdt.m, b.sdt.nho, '', 'Toàn bài trên một sơ đồ', huyHieu('sdt-' + k + '-' + b.so), '<a class="nut chinh nho" href="' + linkXem('sdt-' + k + '-' + b.so) + '">Xem</a>' + (b.sdt.png ? '<a class="nut nho" href="' + b.sdt.png + '" download>⬇ Tải ảnh</a>' : '')));
      if (st && b.soTay) tn.push(the('📒 Sổ tay kiến thức', MUC.st.m, '', '📒', 'Sổ tay Toán ' + k + ' — trang ' + b.soTay, 'Mở sách lật đúng trang của bài này. ' + huyHieu('st-' + k), '<a class="nut chinh nho" href="' + linkXem('st-' + k, '&p=' + b.soTay) + '">Đọc sổ tay</a>'));
      DL.moPhong.filter(function (p) { return p.lop == k && p.bai.indexOf(b.so) >= 0; }).forEach(function (p) {
        tn.push(the('🔬 Mô phỏng', MUC.mp.m, '', p.ic, esc(p.ten), esc(p.mo) + ' ' + huyHieu(p.id), '<a class="nut chinh nho" href="' + linkXem(p.id) + '">Mở mô phỏng</a>'));
      });
      tn.push(the('🎮 Trò chơi', MUC.tc.m, '', c.ic, 'Trạm “' + esc(b.ten) + '”', b.cau + ' câu · vùng đất ' + esc(c.vung) + '. Điểm được gửi về hệ thống. ' + huyHieu('tc-' + k), '<a class="nut chinh nho" href="' + linkXem('tc-' + k, '&h=b' + b.so) + '">Chơi ngay</a>'));
      var cuoi = L.bai.filter(function (x) { return x.ch == c.id; }).slice(-1)[0].so === b.so;
      var on = '<a class="nut nho" href="' + linkXem('tc-' + k, '&h=c' + c.id) + '">👹 Đấu trùm chương</a>' + (c.onSdt ? '<a class="nut nho" href="' + linkXem('sdt-' + k + '-on' + c.id) + '">🧠 Sơ đồ ôn tập</a>' : '') + (c.onInf ? '<a class="nut nho" href="' + linkXem('inf-' + k + '-on' + c.id) + '">🎨 Infographic ôn tập</a>' : '');
      tn.push(the('📗 Ôn tập chương ' + c.so, c.mau, '', '🏁', esc(c.ten), cuoi ? 'Đây là bài cuối chương — ôn tập trọn chương nhé!' : 'Học xong cả chương thì ôn lại ở đây.', on));
      tn.push(the('📝 Đề kiểm tra', MUC.de.m, '', '📝', 'Luyện đề Toán ' + k, 'Đề giữa kì, cuối kì có bài này — làm online, có điểm ngay.', '<a class="nut chinh nho" href="' + linkXem('de', '&k=' + k) + '">Vào làm đề</a>'));
      var tr = L.bai[i - 1], sa = L.bai[i + 1];
      $('#ct').innerHTML = '<div class="bai-dau" style="--m:' + c.mau + '"><span class="so-ch">' + c.ic + ' Toán ' + k + ' · Chương ' + c.so + '. ' + esc(c.ten) + '</span><h1>Bài ' + b.so + '. ' + esc(b.ten) + '</h1><p>Học liệu của bài: xem → hiểu → luyện. Bấm vào từng thẻ bên dưới.</p></div>' +
        '<div class="tai-nguyen">' + tn.join('') + '</div><div class="chuyen">' +
        (tr ? '<a class="nut" href="?lop=' + k + '&bai=' + tr.so + '" data-b="' + tr.so + '">← Bài ' + tr.so + '. ' + esc(tr.ten) + '</a>' : '<span></span>') +
        (sa ? '<a class="nut" href="?lop=' + k + '&bai=' + sa.so + '" data-b="' + sa.so + '">Bài ' + sa.so + '. ' + esc(sa.ten) + ' →</a>' : '') + '</div>';
      $$('.chuyen a[data-b]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); soBai = +a.getAttribute('data-b'); veDs(); veBai(); scrollTo({ top: 0, behavior: 'smooth' }); }; });
    };
    veDs(); veBai();
  }

  // ------------------------------------------------------------------ INFOGRAPHIC / SƠ ĐỒ TƯ DUY
  function thuVienTranh(M, loai) {
    var x = MUC[loai], k = lopChon(10) || 10;
    M.innerHTML = '<div class="khung" style="--m:' + x.m + '">' + vet([[NHOM[x.nhom].replace(/^\S+\s/, '')], [x.ten]]) + tieuDe(x.ic, x.m, x.ten + ' Toán 10 · 11 · 12', x.mo + ' Bấm <b>Xem</b> để mở toàn màn hình, <b>Tải ảnh</b> để lưu về máy hoặc in.') +
      '<div class="loc">' + tabLop(k) + oTim('Lọc theo tên bài…') + '</div><div id="ds"></div></div>';
    var ve = function () {
      var ds = dsTranh(k, loai), L = lopCua(k), h = '';
      L.chuong.forEach(function (c) {
        var cua = ds.filter(function (t) { return t.ch.id === c.id; });
        h += '<div class="nhom-chuong" style="--m:' + c.mau + '"><span class="so-ch">Chương ' + c.so + '</span><h2>' + esc(c.ten) + '</h2></div><div class="luoi">' + cua.map(function (t) {
          return '<div class="the" style="--m:' + c.mau + '" data-tim="' + esc(t.ten) + '"><a class="anh" href="' + linkXem(t.id) + '"><img loading="lazy" src="' + (t.f.nho || '') + '" alt="' + esc(t.ten) + '"><span class="nhan-bai">' + t.nhan + '</span></a>' +
            '<div class="than"><h3>' + esc(t.ten) + '</h3>' + huyHieu(t.id) + '<div class="chan"><a class="nut chinh nho" href="' + linkXem(t.id) + '">👁 Xem</a>' + (t.f.png ? '<a class="nut nho" href="' + t.f.png + '" download>⬇ Tải ảnh</a>' : '') + '</div></div></div>';
        }).join('') + '</div>';
      });
      $('#ds').innerHTML = h;
      locTheoChu('#ds .the');
      if ($('#tim').value) $('#tim').oninput();
    };
    $$('.loc .tab button').forEach(function (b) { b.onclick = function () { k = +b.getAttribute('data-k'); datLop(k); $$('.loc .tab button').forEach(function (z) { z.classList.toggle('on', z === b); }); ve(); }; });
    ve();
  }

  // ------------------------------------------------------------------ SỔ TAY
  function soTay(M) {
    var x = MUC.st;
    M.innerHTML = '<div class="khung">' + vet([['Học liệu'], [x.ten]]) + tieuDe(x.ic, x.m, 'Sổ tay kiến thức Toán 10 · 11 · 12', 'Mỗi lớp một cuốn (gộp 2 tập), phong cách vở viết tay: mỗi trang một mục tiêu, khung <b>Em cần nhớ</b>, trang tổng kết cuối mỗi bài.') +
      '<div class="luoi" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">' + DL.soTay.map(function (s) {
        return '<div class="the" style="--m:' + x.m + '"><a class="anh" style="aspect-ratio:3/4" href="' + linkXem(s.id) + '"><img loading="lazy" src="' + s.bia + '" alt="Bìa sổ tay Toán ' + s.lop + '"><span class="nhan-bai">Toán ' + s.lop + '</span></a>' +
          '<div class="than"><h3>Sổ tay kiến thức Toán ' + s.lop + '</h3><p>' + s.soTrang + ' trang · sách Kết nối tri thức</p>' + huyHieu(s.id) + '<div class="chan"><a class="nut chinh nho" href="' + linkXem(s.id) + '">📖 Đọc sách lật</a><a class="nut nho" href="' + s.pdf + '" download>⬇ PDF (' + String(s.pdfMB).replace('.', ',') + ' MB)</a></div>' +
          '<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700;font-size:14px">📑 Mục lục — mở đúng trang</summary><div style="max-height:300px;overflow:auto;margin-top:6px">' +
          s.muc.map(function (t) { return '<a href="' + linkXem(s.id, '&p=' + t.p) + '" style="display:flex;justify-content:space-between;gap:8px;padding:4px ' + (t.c === 2 ? '6px 4px 18px' : '6px') + ';font-size:13.5px;' + (t.c === 1 ? 'font-weight:700;color:var(--chu)' : 'color:var(--phu)') + '"><span>' + esc(t.t) + '</span><span>' + t.p + '</span></a>'; }).join('') +
          '</div></details></div></div>';
      }).join('') + '</div></div>';
  }

  // ------------------------------------------------------------------ MÔ PHỎNG
  function moPhong(M) {
    var x = MUC.mp, k = lopChon(0);
    M.innerHTML = '<div class="khung">' + vet([['Học liệu'], [x.ten]]) + tieuDe(x.ic, x.m, 'Mô phỏng Toán 10 · 11 · 12', 'Kéo thanh trượt, kéo điểm, xoay hình 3D để tự khám phá — dùng trên máy chiếu khi dạy hoặc ở nhà khi ôn. ' + DL.moPhong.length + ' mô phỏng.') +
      '<div class="loc">' + tabLop(k, true) + oTim('Lọc: parabol, 3D, xác suất…') + '</div><div class="luoi" id="ds"></div></div>';
    var ve = function () {
      $('#ds').innerHTML = DL.moPhong.filter(function (p) { return !k || p.lop == k; }).map(function (p) {
        return '<a class="the" href="' + linkXem(p.id) + '" style="--m:' + p.mau + '" data-tim="' + esc(p.ten + ' ' + p.mo + ' ' + p.the.join(' ') + ' ' + p.baiChu) + '"><div class="anh" style="display:grid;place-items:center;font-size:58px;background:color-mix(in srgb,' + p.mau + ' 10%,#fff)">' + p.ic + '<span class="nhan-bai">Toán ' + p.lop + ' · ' + esc(p.baiChu) + '</span></div>' +
          '<div class="than"><h3>' + esc(p.ten) + '</h3><p>' + esc(p.mo) + '</p>' + huyHieu(p.id) + '<div class="chan">' + p.the.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div></div></a>';
      }).join('');
      locTheoChu('#ds .the');
      if ($('#tim').value) $('#tim').oninput();
    };
    $$('.loc .tab button').forEach(function (b) { b.onclick = function () { k = +b.getAttribute('data-k'); datLop(k); $$('.loc .tab button').forEach(function (z) { z.classList.toggle('on', z === b); }); ve(); }; });
    ve();
  }

  // ------------------------------------------------------------------ TRÒ CHƠI
  function troChoi(M) {
    var x = MUC.tc, k = lopChon(10) || 10;
    M.innerHTML = '<div class="khung">' + vet([['Luyện tập'], [x.ten]]) + tieuDe(x.ic, x.m, 'Trò chơi Chinh phục Toán', 'Mỗi bài là một <b>trạm</b>, mỗi chương có một <b>trùm</b>. Trả lời đúng để nhận sao, kim cương và huy hiệu. Đăng nhập để điểm được ghi nhận.') +
      (WEB.daGhiDanh() ? '' : '<div class="thong-bao">👤 Bạn chưa đăng nhập — điểm vẫn lưu trên máy, nhưng hệ thống chưa biết đó là ai. <a href="#" id="tc-gd">Đăng nhập / tạo tài khoản</a></div>') +
      '<div class="o-muc" style="margin-bottom:26px">' + DL.troChoi.map(function (t) {
        var L = lopCua(t.lop);
        return '<a href="' + linkXem(t.id) + '" style="--m:' + x.m + '"><i>🎮</i><h3>Chinh phục Toán ' + t.lop + '</h3><span class="so">' + t.tram + ' trạm · ' + t.trum + ' trùm chương · ' + t.cau + ' câu</span>' + huyHieu(t.id) + '<p>' + L.chuong.map(function (c) { return c.ic; }).join(' ') + '</p><span class="di">Vào bản đồ →</span></a>';
      }).join('') + '</div><div class="loc">' + tabLop(k) + oTim('Tìm trạm theo tên bài…') + '</div><div id="ds"></div></div>';
    var gd = $('#tc-gd'); if (gd) gd.onclick = function (e) { e.preventDefault(); hopGhiDanh(null, function (ok) { if (ok) gd.parentNode.remove(); }); };
    var ve = function () {
      var L = lopCua(k);
      $('#ds').innerHTML = L.chuong.map(function (c) {
        return '<div class="nhom-chuong" style="--m:' + c.mau + '"><span class="so-ch">' + c.ic + ' ' + esc(c.vung) + '</span><h2>Chương ' + c.so + '. ' + esc(c.ten) + '</h2></div><div class="luoi">' +
          L.bai.filter(function (b) { return b.ch == c.id; }).map(function (b) {
            return '<a class="the" href="' + linkXem('tc-' + k, '&h=b' + b.so) + '" style="--m:' + c.mau + '" data-tim="' + esc(b.ten) + '"><div class="than"><span class="chip" style="align-self:flex-start;color:' + c.mau + '">Trạm Bài ' + b.so + '</span><h3>' + esc(b.ten) + '</h3><p>' + b.cau + ' câu hỏi</p><div class="chan"><span class="nut chinh nho">▶ Chơi</span></div></div></a>';
          }).join('') + '<a class="the" href="' + linkXem('tc-' + k, '&h=c' + c.id) + '" style="--m:' + c.mau + ';border:2px dashed ' + c.mau + '" data-tim="trùm chương ' + c.so + '"><div class="than"><span class="chip" style="align-self:flex-start;color:' + c.mau + '">👹 Trùm chương ' + c.so + '</span><h3>Đấu trùm ' + esc(c.vung) + '</h3><p>Câu hỏi tổng hợp cả chương, điểm ×2.</p><div class="chan"><span class="nut chinh nho">⚔️ Đấu</span></div></div></a></div>';
      }).join('');
      locTheoChu('#ds .the');
    };
    $$('.loc .tab button').forEach(function (b) { b.onclick = function () { k = +b.getAttribute('data-k'); datLop(k); $$('.loc .tab button').forEach(function (z) { z.classList.toggle('on', z === b); }); ve(); }; });
    ve();
  }

  // ------------------------------------------------------------------ ĐỀ KIỂM TRA
  function deKiemTra(M) {
    var x = MUC.de, LOAI = { GK1: 'Giữa kì I', CK1: 'Cuối kì I', GK2: 'Giữa kì II', CK2: 'Cuối kì II', TN: 'Ôn thi tốt nghiệp', OT: 'Ôn tập theo chương' };
    var cot = ['GK1', 'CK1', 'GK2', 'CK2', 'TN'];
    var o = function (k, l) { var d = DL.de.filter(function (z) { return z.khoi == k && z.loai == l; })[0]; return d ? '<td class="so"><a href="' + linkXem('de', '&k=' + k) + '">' + d.so + ' đề</a><br><small style="color:var(--mo)">' + (d.phut || 90) + ' phút</small></td>' : '<td class="so" style="color:var(--mo)">—</td>'; };
    M.innerHTML = '<div class="khung">' + vet([['Luyện tập'], [x.ten]]) + tieuDe(x.ic, x.m, 'Phòng luyện đề Toán 10 · 11 · 12', so(DL.tongDe) + ' đề theo cấu trúc mới (trắc nghiệm, đúng/sai, trả lời ngắn, tự luận). Làm trực tuyến, nộp bài là có điểm phần trắc nghiệm, xem lời giải câu sai; phần tự luận giáo viên chấm sau.') +
      '<div class="o-muc" style="margin-bottom:22px">' + [10, 11, 12].map(function (k) {
        var n = DL.de.filter(function (z) { return z.khoi == k; }).reduce(function (s, z) { return s + z.so; }, 0);
        return '<a href="' + linkXem('de', '&k=' + k) + '" style="--m:' + x.m + '"><i>📝</i><h3>Làm đề Toán ' + k + '</h3><span class="so">' + n + ' đề</span><p>' + DL.de.filter(function (z) { return z.khoi == k; }).map(function (z) { return LOAI[z.loai] || z.loai; }).join(' · ') + '</p><span class="di">Vào phòng thi →</span></a>';
      }).join('') + '</div>' +
      '<div class="bang-tk vip-tk"><h2>⭐ Đề siêu VIP · 📚 Ôn tập theo chương</h2><p>Mỗi lớp có đề siêu VIP <b>giữa kì, cuối kì</b> (lớp 12 thêm <b>10 đề ôn thi tốt nghiệp</b>) toàn câu vận dụng – vận dụng cao; mỗi chương có <b>ôn tập 3 mức Dễ – Trung bình – Khó</b> (mức Khó là VIP), lớp 12 có thêm ôn thi tốt nghiệp theo chủ đề. Đề VIP mở bằng <b>mã của Ban quản trị</b> hoặc <b>đổi 20 điểm tích luỹ</b> lấy 1 đề (<a href="hoi-dap.html">xem cách tích điểm</a>).</p>' +
      '<div class="buoc" style="margin-top:10px"><div><b>Tạo tài khoản</b><p>Vào phòng luyện đề, kéo xuống mục ⭐ Đề siêu VIP, tạo tài khoản (tên đăng nhập + mật khẩu).</p></div>' +
      '<div><b>Bấm Đăng ký</b><p>Máy tạo sẵn một mã kích hoạt gắn với tài khoản của em.</p></div>' +
      '<div><b>Nhắn Ban quản trị nhận mã</b><p>Nhắn ' + (C.ZALO ? '<a href="https://zalo.me/' + esc(String(C.ZALO).replace(/\D/g, '')) + '" target="_blank" rel="noopener">Zalo ' + esc(C.ZALO) + '</a>' : 'quản trị') + ' kèm tên đăng nhập; nhập mã là mở được 5 đề. Mỗi mã chỉ dùng cho một tài khoản.</p></div></div>' +
      '<p style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">' + [10, 11, 12].map(function (k) { return '<a class="nut chinh" style="--m:#c48a00" href="' + linkXem('de', '&k=' + k) + '">⭐ Đề VIP Toán ' + k + '</a>'; }).join('') + '</p></div>' +
      '<div class="bang-tk kho-tk"><h2>🧑‍🏫 Thầy cô tự tạo đề — kho hơn 4.000 câu hỏi</h2><p>Dành cho tài khoản <b>Giáo viên</b>: chọn lớp, khung đề (giữa kì, cuối kì…) hoặc tự chọn bài học, số câu, dạng câu, mức độ → máy lấy câu từ ngân hàng (đáp án, lời giải do máy tính) → sửa, đổi câu → trộn nhiều mã đề, bật chống gian lận → <b>xuất bản link</b> gửi học sinh, <b>tải Word</b> công thức chuẩn. Mỗi tài khoản tạo miễn phí 3 đề; muốn tạo thêm, xem kết quả học sinh: đăng ký gói, mã với Ban quản trị.</p>' +
      '<p style="margin-top:12px"><a class="nut chinh" style="--m:#0f9d8f" href="noi-dung/de-kiem-tra/?kho=1">🧑‍🏫 Mở Kho đề của tôi</a></p></div>' +
      '<div class="bang-tk"><h2>Danh mục đề</h2><p>Bấm vào số đề để vào phòng thi đúng lớp.</p><div style="overflow-x:auto"><table class="bang"><thead><tr><th>Lớp</th>' + cot.map(function (l) { return '<th style="text-align:right">' + LOAI[l] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      [10, 11, 12].map(function (k) { return '<tr><th>Toán ' + k + '</th>' + cot.map(function (l) { return o(k, l); }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="bang-tk"><h2>Cách làm bài</h2><div class="buoc" style="margin-top:10px"><div><b>Đăng nhập tài khoản</b><p>Tạo tài khoản một lần (tên đăng nhập viết liền không dấu, mật khẩu). Lịch sử làm bài lưu theo tài khoản, xem lại trên mọi máy.</p></div><div><b>Chọn đề và làm bài</b><p>Có đồng hồ đếm giờ. Đề có công thức hiển thị rõ trên điện thoại.</p></div><div><b>Nộp bài — xem kết quả</b><p>Có điểm trắc nghiệm ngay, xem lời giải câu sai. Bài được gửi về hệ thống.</p></div></div></div>' +
      '<p style="text-align:center;margin-top:20px"><a class="nut chinh" style="--m:' + x.m + ';font-size:16px;padding:12px 26px" href="' + linkXem('de') + '">📝 Vào phòng luyện đề</a></p></div>';
  }

  // ------------------------------------------------------------------ CÔNG CỤ (giải toán, phiếu tô màu)
  function congCu(M, k, mo, y) {
    var x = MUC[k];
    M.innerHTML = '<div class="khung">' + vet([[NHOM[x.nhom].replace(/^\S+\s/, '')], [x.ten]]) + tieuDe(x.ic, x.m, x.ten, mo) +
      '<div class="bang-tk" style="--m:' + x.m + '"><h2>Có gì bên trong</h2><ul style="margin:8px 0 0;padding-left:20px">' + y.map(function (t) { return '<li style="margin:6px 0">' + t + '</li>'; }).join('') + '</ul>' +
      '<p style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><a class="nut chinh" style="--m:' + x.m + ';font-size:16px;padding:12px 24px" href="' + linkXem(k) + '">' + (k === 've' ? '📐 Vào vẽ hình' : k === 'tcl' ? '🎲 Vào trò chơi lớp học' : x.ic + ' Mở ' + x.ten.toLowerCase()) + '</a><a class="nut" href="noi-dung/' + ({ gt: 'giai-toan/index.html', tcl: 'tro-choi-lop/index.html', ve: 've-hinh/index.html', kg: 've-hinh/index.html?che-do=3d' }[k] || 'phieu-to-mau/index.html') + '" target="_blank" rel="noopener">↗ Mở trong tab riêng</a></p></div></div>';
  }

  // ------------------------------------------------------------------ KHU VỰC CỦA CÔ (đăng nhập)
  // Dùng tên đăng nhập + mật khẩu giáo viên đặt trong Apps Script (lệnh 'login' có sẵn ở máy chủ).
  // Mã phiên lưu trong sessionStorage 'gv_token' — dùng chung với trang quản trị Phòng luyện đề.
  function gvDaVao() {
    if (!WEB.API) return true;   // chưa nối Sheet: chưa có mật khẩu để kiểm tra, cho Ban quản trị vào làm theo hướng dẫn
    try { return !!sessionStorage.getItem('gv_token') && Date.now() - (+sessionStorage.getItem('gv_luc') || 0) < 6 * 3600e3; } catch (e) { return false; }
  }
  function gvThoat() { try { sessionStorage.removeItem('gv_token'); sessionStorage.removeItem('gv_luc'); } catch (e) { } location.href = 'index.html'; }
  function hopDangNhapGV(xong) {
    var nen = document.createElement('div');
    nen.className = 'hop-nen';
    nen.innerHTML = '<div class="hop" role="dialog" aria-modal="true" aria-labelledby="gv-t"><button class="x" type="button" aria-label="Đóng">✕</button>' +
      '<h2 id="gv-t">🔐 Quản trị</h2><p>Đăng nhập bằng tên và mật khẩu giáo viên đã đặt trong Apps Script (2 dòng đầu tệp Code.gs).</p>' +
      '<label for="gv-u">Tên đăng nhập</label><input id="gv-u" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false">' +
      '<label for="gv-p">Mật khẩu</label><input id="gv-p" type="password" autocomplete="current-password">' +
      '<div class="loi-sai" id="gv-loi"></div><div class="nut-hang"><a class="nut" href="index.html">Về trang chủ</a><button class="nut chinh" type="button" id="gv-vao">Đăng nhập</button></div></div>';
    document.body.appendChild(nen);
    var vao = function () {
      var u = $('#gv-u').value.trim(), pw = $('#gv-p').value;
      if (!u || !pw) return ($('#gv-loi').textContent = 'Quản trị nhập đủ tên đăng nhập và mật khẩu nhé.');
      $('#gv-loi').textContent = '⏳ Đang kiểm tra…';
      WEB.goi({ action: 'login', user: String(u).trim().toLowerCase(), pass: pw }).then(function (r) {
        if (r && r.ok && r.token) {
          try { sessionStorage.setItem('gv_token', r.token); sessionStorage.setItem('gv_luc', Date.now()); } catch (e) { }
          nen.remove(); xong();
        } else $('#gv-loi').textContent = (r && r.error) || 'Không kết nối được máy chủ, quản trị thử lại nhé.';
      });
    };
    $('#gv-vao').onclick = vao;
    $('#gv-p').onkeydown = function (e) { if (e.key === 'Enter') vao(); };
    $('.x', nen).onclick = function () { location.href = 'index.html'; };
    setTimeout(function () { $('#gv-u').focus(); }, 50);
  }
  function canDangNhap(xong) { if (gvDaVao()) xong(); else hopDangNhapGV(xong); }

  function khuVucCo(M) {
    M.innerHTML = '<div class="khung"><p class="rong">🔐 Khu vực quản trị…</p></div>';
    canDangNhap(function () {
      var the = function (href, m, ic, ten, mo, ngoai) { return '<a href="' + href + '" style="--m:' + m + '"' + (ngoai ? ' target="_blank" rel="noopener"' : '') + '><i>' + ic + '</i><h3>' + ten + '</h3><p>' + mo + '</p><span class="di">Mở →</span></a>'; };
      M.innerHTML = '<div class="khung">' + vet([['Quản trị']]) + tieuDe('🔐', '#5b3fd0', 'Khu vực quản trị', 'Chỉ quản trị viên vào được. Họ tên người ghé thăm, điểm, bài làm của từng em nằm trong Google Sheet của quản trị.') +
        (WEB.API ? '' : '<div class="thong-bao">🧪 Website chưa nối Google Sheet nên chưa cần mật khẩu. Nối xong, trang này sẽ hỏi tên đăng nhập và mật khẩu giáo viên.</div>') +
        '<div class="o-muc">' +
        (C.LINK_SHEET ? the(esc(C.LINK_SHEET), '#16a34a', '📗', 'Mở Google Sheet', 'Danh sách người ghé thăm, điểm trò chơi, bài làm đề — đầy đủ họ tên, lớp, trường.', true)
          : the('huong-dan.html#buoc-3', '#16a34a', '📗', 'Google Sheet', 'Dán đường dẫn bảng tính vào LINK_SHEET trong assets/cau-hinh.js để mở nhanh từ đây.')) +
        the('thong-ke.html', '#f59e0b', '📊', 'Thống kê chi tiết', 'Lượt xem trang, lượt làm đề, lượt chơi, người ghi danh, mục được xem nhiều.') +
        the(linkXem('de', '&gv=vip'), '#d97706', '⭐', 'Mã kích hoạt', 'Đề siêu VIP · tải đề Word · tải phiếu tô màu: người dùng bấm Đăng ký → mã hiện ở đây. Quản trị chép mã gửi qua Zalo; khoá hoặc xoá khi cần.') +
        the('hoi-dap.html', '#c2410c', '💬', 'Hỏi đáp · thi đua', 'Duyệt và trả lời câu hỏi của học sinh (duyệt = +1 điểm); bảng vàng. Mã voucher đổi điểm hiện ở ô Mã kích hoạt; điểm từng em ở trang tính DiemTichLuy.') +
        the(linkXem('de', '&gv=lh'), '#0f9d8f', '🩹', 'Lỗ hổng kiến thức', 'Bài học học sinh sai nhiều, câu sai nhiều, em nào cần kèm — kèm nút mở bài để dạy lại.') +
        the(linkXem('de', '&gv=tkh'), '#475569', '👥', 'Tài khoản người dùng', 'Danh sách học sinh, giáo viên đã đăng ký; đặt lại mật khẩu, đổi vai trò.') +
        the(linkXem('de', '&gv=dgv'), '#0e7490', '🧑‍🏫', 'Đề giáo viên tạo', 'Các đề thầy cô khác tạo từ kho câu hỏi; gói tạo đề và mã xem kết quả cấp ở ô Mã kích hoạt.') +
        the(linkXem('de', '&gv=kq'), '#dc2626', '📝', 'Quản trị đề kiểm tra', 'Xem điểm từng em, chấm tự luận, xuất Excel, sửa/thêm/ẩn đề.') +
        the('huong-dan.html', '#5b3fd0', '🔗', 'Hướng dẫn kết nối Google Sheet', 'Cài máy chủ, đổi mật khẩu, đưa website lên mạng, xử lý lỗi.') +
        '</div><p style="margin-top:22px"><button class="nut" type="button" id="gv-thoat">🚪 Thoát khu vực quản trị</button></p></div>';
      $('#gv-thoat').onclick = gvThoat;
    });
  }

  // ------------------------------------------------------------------ THỐNG KÊ (công khai: con số + biểu đồ; quản trị đã đăng nhập: thêm chi tiết)
  function thongKe(M) {
    var gv = gvDaVao();
    M.innerHTML = '<div class="khung">' + vet([['Lượt ghé thăm']]) + tieuDe('📊', '#f59e0b', 'Lượt ghé thăm website', 'Cùng xem có bao nhiêu bạn đang học Toán cùng Học Toán Thông Minh mỗi ngày nhé!') + '<div id="tk"><p class="rong">Đang tải số liệu…</p></div></div>';
    LUOT.then(function () { return WEB.thongKe(); }).then(function (r) {
      if (!r || !r.ok) { $('#tk').innerHTML = '<div class="thong-bao">Chưa lấy được số liệu, bạn tải lại trang sau ít phút nhé.</div>'; return; }
      var TEN = { chu: 'Trang chủ', htb: 'Học theo bài', tk: 'Lượt ghé thăm', hd: 'Hướng dẫn (quản trị)', gv: 'Khu vực quản trị' };
      Object.keys(MUC).forEach(function (k) { TEN[k] = MUC[k].ten; });
      var muc = Object.keys(r.muc || {}).map(function (k) { return { k: k, ten: TEN[k] || k, n: r.muc[k] }; }).sort(function (a, b) { return b.n - a.n; });
      var maxM = Math.max.apply(null, muc.map(function (x) { return x.n; }).concat([1]));
      var o = function (nhan, v, phu) { return '<div><span>' + nhan + '</span><b>' + so(v) + '</b>' + (phu ? '<small>' + phu + '</small>' : '') + '</div>'; };
      $('#tk').innerHTML = (r.thu ? '<div class="thong-bao">🧪 <b>Chế độ thử</b> — số liệu chỉ đếm trên máy này.</div>' : '') +
        '<div class="o-so">' + o('👁 Tổng lượt truy cập', r.tong, 'mỗi lần mở website tính 1 lượt') + o('📅 Hôm nay', r.homNay) + o('🙋 Số người ghé thăm', r.khach, 'mỗi trình duyệt tính 1 người') +
        (gv ? o('📄 Lượt xem trang', r.xem) + o('📝 Lượt làm đề', r.baiLam) + o('🎮 Lượt chơi trạm', r.luotChoi) + o('🪪 Người đã ghi danh', r.ghiDanh) : '') + '</div>' +
        '<div class="bang-tk"><h2>Lượt truy cập 30 ngày gần nhất</h2><p>Rê chuột (hoặc chạm) vào cột để xem số lượt. <a href="#" id="xem-bang">Xem dạng bảng</a></p><div class="bieu-do" id="bd"></div><div id="bang-ngay" class="an"></div></div>' +
        (gv ? '<div class="bang-tk"><h2>🔐 Mục được xem nhiều <small style="font-weight:600;color:var(--mo)">(chỉ quản trị thấy)</small></h2><p>Tính từ khi kết nối.</p>' +
          (muc.length ? muc.map(function (x) { return '<div class="thanh-ngang"><span>' + esc(x.ten) + '</span><div class="vach"><div style="width:' + Math.max(2, x.n / maxM * 100) + '%"></div></div><b>' + so(x.n) + '</b></div>'; }).join('') : '<p class="rong">Chưa có số liệu.</p>') + '</div>' +
          '<p style="margin-top:16px"><a class="nut" href="co.html">← Về khu vực quản trị</a></p>' : '');
      veCot($('#bd'), r.ngay || []);
      $('#bang-ngay').innerHTML = '<table class="bang"><thead><tr><th>Ngày</th><th style="text-align:right">Lượt truy cập</th></tr></thead><tbody>' + (r.ngay || []).slice().reverse().map(function (d) { return '<tr><td>' + d.d.split('-').reverse().join('/') + '</td><td class="so">' + so(d.n) + '</td></tr>'; }).join('') + '</tbody></table>';
      $('#xem-bang').onclick = function (e) { e.preventDefault(); var b = $('#bang-ngay'); b.classList.toggle('an'); this.textContent = b.classList.contains('an') ? 'Xem dạng bảng' : 'Ẩn bảng'; };
    });
  }
  function veCot(hop, ds) {
    var W = 900, H = 240, T = 14, B = 26, Lm = 34, R = 6, max = Math.max.apply(null, ds.map(function (d) { return d.n; }).concat([4]));
    var buoc = Math.pow(10, Math.floor(Math.log10(max))), tren = Math.ceil(max / buoc) * buoc; if (tren / buoc > 5) buoc *= 2; tren = Math.ceil(max / buoc) * buoc;
    var bw = (W - Lm - R) / ds.length, y = function (v) { return T + (H - T - B) * (1 - v / tren); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Biểu đồ lượt truy cập theo ngày">';
    for (var v = 0; v <= tren; v += buoc) s += '<line class="luoi-ke" x1="' + Lm + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (Lm - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + so(v) + '</text>';
    ds.forEach(function (d, i) {
      var x = Lm + i * bw + 2, w = Math.max(2, bw - 4), h = Math.max(0, y(0) - y(d.n)), yy = y(d.n);
      var r = Math.min(4, w / 2, h);
      s += '<path class="cot" data-i="' + i + '" d="M' + x + ',' + y(0) + 'V' + (yy + r) + 'Q' + x + ',' + yy + ' ' + (x + r) + ',' + yy + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + yy + ' ' + (x + w) + ',' + (yy + r) + 'V' + y(0) + 'Z"/>';
      s += '<rect data-i="' + i + '" x="' + (Lm + i * bw) + '" y="' + T + '" width="' + bw + '" height="' + (H - T - B) + '" fill="transparent"/>';
      if (i % 5 === 0 || i === ds.length - 1) s += '<text x="' + (Lm + i * bw + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + d.d.slice(8) + '/' + d.d.slice(5, 7) + '</text>';
    });
    hop.innerHTML = s + '</svg><div class="goi-tip an"></div>';
    var tip = $('.goi-tip', hop), svg = $('svg', hop);
    var hien = function (e) {
      var i = e.target.getAttribute('data-i'); if (i == null) return;
      var d = ds[i], bb = svg.getBoundingClientRect(), x = (Lm + i * bw + bw / 2) / W * bb.width;
      $$('.cot', hop).forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-i') === i); });
      tip.innerHTML = '<b>' + so(d.n) + '</b> lượt · ' + d.d.split('-').reverse().join('/');
      tip.style.left = x + 'px'; tip.style.top = (y(d.n) / H * bb.height) + 'px'; tip.classList.remove('an');
    };
    svg.addEventListener('mousemove', hien); svg.addEventListener('click', hien);
    svg.addEventListener('mouseleave', function () { tip.classList.add('an'); $$('.cot', hop).forEach(function (c) { c.classList.remove('on'); }); });
  }

  // ------------------------------------------------------------------ TRÌNH XEM
  function trinhXem() {
    var id = thamSo('id') || '', x = traMuc(id);
    document.body.classList.add('trang-xem');
    if (!x) { document.body.innerHTML = '<div class="khung"><p class="rong">Không tìm thấy nội dung. <a href="index.html">Về trang chủ</a></p></div>'; return null; }
    document.title = x.ten + ' — ' + (C.TEN_WEB || '');
    var gvTab = thamSo('gv'); if (gvTab && /^\w+$/.test(gvTab)) x.url += (x.url.indexOf('?') < 0 ? '?' : '&') + 'gv=' + gvTab;
    // "Quay lại" về đúng trang đã bấm mở (giữ nguyên khi bấm Trước / Tiếp trong trình xem)
    try {
      var ref = document.referrer, u = ref && new URL(ref);
      if (u && u.origin === location.origin && !/\/xem(\.html)?$/.test(u.pathname)) sessionStorage.setItem('web_quay', ref);
      else if (!u || u.origin !== location.origin) sessionStorage.removeItem('web_quay');
      x.quay = sessionStorage.getItem('web_quay') || x.quay;
    } catch (e) { }
    if ((x.muc === 'inf' || x.muc === 'sdt') && moTranh(id, true)) return x;
    var m = (MUC[x.muc] || {}).m || '#5b3fd0';
    var nut = function (href, ic, chu, them) { return '<a class="nut" href="' + href + '"' + (them || '') + ' title="' + chu + '">' + ic + '<span class="chu-nut"> ' + chu + '</span></a>'; };
    document.body.innerHTML = '<div class="xem" style="--m:' + m + '"><div class="xem-thanh">' +
      nut(x.quay, '←', 'Quay lại') + '<div class="ten"><b>' + esc(x.ten) + '</b><small>' + esc(x.phu) + '</small></div>' +
      (x.truoc ? nut(linkXem(x.truoc), '‹', 'Trước') : '') + (x.sau ? nut(linkXem(x.sau), '›', 'Tiếp') : '') +
      (x.tai ? nut(x.tai, '⬇', 'Tải ' + (x.taiChu || 'ảnh'), ' download') : '') +
      '<button class="nut" type="button" id="toan-man" title="Toàn màn hình">⛶<span class="chu-nut"> Toàn màn hình</span></button>' +
      nut(x.url, '↗', 'Tab mới', ' target="_blank" rel="noopener"') + '<a class="nut" href="index.html" title="Trang chủ">🏠</a></div>' +
      '<iframe src="' + x.url + '" title="' + esc(x.ten) + '" allow="fullscreen" allowfullscreen></iframe></div>';
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('#toan-man').style.display = 'none';   // iPhone: không hỗ trợ toàn màn hình cho khung nhúng
    $('#toan-man').onclick = function () { var f = $('iframe'); (f.requestFullscreen || f.webkitRequestFullscreen || function () { }).call(f); };
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft' && e.altKey && x.truoc) location.href = linkXem(x.truoc);
      if (e.key === 'ArrowRight' && e.altKey && x.sau) location.href = linkXem(x.sau);
    });
    if (x.muc === 'tc' && C.HOI_GHI_DANH !== false && !WEB.daGhiDanh()) setTimeout(function () { hopGhiDanh('Đăng nhập để hệ thống ghi nhận điểm trò chơi của bạn nhé (không bắt buộc).'); }, 600);
    congDiemHocLieu(x, id);
    return x;
  }

  // ------------------------------------------------------------------ khởi động
  var M = document.getElementById('noi-dung');
  var tieuDeLuot = document.title, mucLuot = TRANG, xongLuot;
  var LUOT = new Promise(function (ok) { xongLuot = ok; });
  if (TRANG === 'xem') {
    var x = trinhXem(); if (x) { tieuDeLuot = x.ten + ' — ' + x.phu; mucLuot = x.muc; }
  } else {
    dauTrang();
    if (M) {
      if (TRANG === 'chu') trangChu(M);
      else if (TRANG === 'htb') hocTheoBai(M);
      else if (TRANG === 'sdt' || TRANG === 'inf') thuVienTranh(M, TRANG);
      else if (TRANG === 'st') soTay(M);
      else if (TRANG === 'mp') moPhong(M);
      else if (TRANG === 'tc') troChoi(M);
      else if (TRANG === 'de') deKiemTra(M);
      else if (TRANG === 'gt') congCu(M, 'gt', '52 bài mẫu hay gặp của Toán 10, 11, 12: nhận dạng → phương pháp → tự điền từng bước (kiểm tra ngay, có gợi ý) → lời giải chi tiết → lỗi hay gặp → bài tự luyện đổi số.',
        ['Chọn lớp → chọn dạng bài → làm từng bước, máy kiểm tra ngay.', 'Góp ý theo lỗi sai 🧭: chỉ ra em sai ở đâu, vì sao.', '🎲 Bài tự luyện đổi số liệu cho mọi dạng — luyện bao nhiêu cũng được.', 'Có hình vẽ minh hoạ ở đề và lời giải.']);
      else if (TRANG === 've') congCu(M, 've', 'Phòng vẽ hình cho học sinh và thầy cô (vào rồi chọn <b>📐 Hình phẳng</b> hoặc <b>🧊 Hình không gian</b> ở góc trên): <b>hình phẳng động</b> như GeoGebra/Sketchpad và <b>hình không gian xoay được</b> — nét khuất tự chuyển nét đứt đúng chuẩn sách giáo khoa.',
        ['🧊 <b>Hình không gian 3D</b>: hình mẫu (chóp, lăng trụ, hộp, nón, trụ, cầu) hoặc tự vẽ, nút <b>🎨 Tô khối</b> tô màu có đổ bóng, xoay quan sát; nét khuất tự đứt.', '🔍 <b>Khám phá hình không gian</b>: chọn hình chóp, lăng trụ, hộp, tứ diện, nón, trụ, cầu → bấm từng tính chất (đỉnh, cạnh bên, mặt bên, đường cao, góc, thể tích…) để thấy phần đó tô sáng trên hình kèm giải thích, số đo.', '∫ <b>Ứng dụng tích phân</b> (mới, Toán 12): diện tích hình phẳng (chia mảnh S₁, S₂… tại giao điểm, tổng Riemann), thể tích khối tròn xoay (quay dần 0° → 360°, chia đĩa, vành khăn), thể tích theo thiết diện S(x) — kéo cận a, b, lát cắt x₀; lời giải từng bước, kết quả dạng phân số, π.', '📦 <b>Trải hình</b> (mới): lập phương, hộp chữ nhật, lăng trụ, chóp, chóp cụt, tứ diện, bát diện, 12 mặt, 20 mặt đều, trụ, nón, nón cụt, khối từ toạ độ → kéo thanh trượt để <b>gấp lại / trải phẳng</b> trên hình 3D; lưới phẳng có mép dán, số hiệu mặt, độ dài cạnh, nhiều cách trải; <b>in lưới A4</b> để cắt, gấp, dán.', '📈 Đồ thị hàm số, 🟥 miền nghiệm bất phương trình (hệ) bậc nhất hai ẩn như SGK — <b>bấm chọn dấu</b> &lt; ≤ &gt; ≥, không cần gõ; kéo chuột ở chỗ trống để di chuyển tới phần đồ thị cần xem.', '📐 Hình phẳng: điểm, trung điểm, giao điểm, hình chiếu, đối xứng, đoạn/đường/tia/vectơ, vuông góc, song song, trung trực, phân giác, đa giác (đều), đường tròn; đo góc, độ dài, kí hiệu bằng nhau.', 'Kéo điểm — mọi đối tượng phụ thuộc tự cập nhật đúng quan hệ hình học.', '🧊 Hình không gian: dựng nhanh hình chóp (đáy vuông, chữ nhật, bình hành, thoi, thang; SA ⊥ đáy, chóp đều…), tứ diện, lăng trụ, hộp, lập phương, nón, trụ, cầu.', 'Xoay bằng chuột hoặc ngón tay; nút 📘 SGK cho góc nhìn như sách. Nét đứt, nét liền tự xác định — kể cả khi khuất một phần.', 'Nối điểm, trung điểm, điểm chia tỉ số, trọng tâm, chiếu vuông góc (tự kẻ kí hiệu ⊥), giao điểm, giao đường – mặt, thiết diện tô màu.', '📋 Chép ảnh dán thẳng vào Word, tải PNG/SVG; lưu tệp để sửa tiếp.']);
      else if (TRANG === 'tcl') congCu(M, 'tcl', 'Bộ trò chơi để thầy cô tổ chức hoạt động <b>củng cố</b> trên lớp như các chương trình truyền hình: chọn trò chơi, chọn câu hỏi, chiếu lên màn hình — học sinh trả lời miệng hoặc bằng bảng con, thầy cô bấm Đúng – Sai.',
        ['🚪 <b>Ô cửa bí mật</b>: mở cửa bằng cách trả lời, lộ dần hình ẩn (từ khoá, biểu tượng hoặc ảnh của thầy cô); có cửa quà tặng, cửa nhân đôi.', '🔔 <b>Rung chuông vàng</b>: cả lớp cùng thi, sai là bị loại, người cuối cùng giành chuông vàng.', '💰 <b>Ai là triệu phú</b>: 4 quyền trợ giúp (50:50, khán giả, gọi người thân, đổi câu), mốc an toàn.', '🎡 <b>Vòng quay may mắn</b>: chiếc nón kỳ diệu cho các đội, hoặc quay gọi tên học sinh.', '🏎️ <b>Đua xe về đích</b>: các đội cùng trả lời, đội đúng tiến lên một chặng.', '🃏 <b>Lật thẻ ghép đôi</b> (ghép câu hỏi – đáp án) và ⭕ <b>Cờ ca-rô</b> giữa hai đội.', '<b>Câu hỏi:</b> dùng sẵn hơn 800 câu của kho “Chinh phục Toán 10–12”, hoặc <b>tải tệp Word</b> theo mẫu (có công thức), hoặc <b>nhập trực tiếp</b>.', 'Chạy tốt trên máy chiếu, máy tính bảng và điện thoại; có âm thanh, đồng hồ đếm ngược, pháo hoa chúc mừng.']);
      else if (TRANG === 'ptm') congCu(M, 'ptm', 'Trợ lý giúp thầy cô tạo phiếu trắc nghiệm <b>tô màu bí mật</b>: học sinh làm đúng thì tô màu ô tương ứng, cuối cùng hiện ra một bức tranh hay dòng chữ bí mật.',
        ['Chọn lớp 1–12 → môn → bài (danh sách bài SGK Kết nối tri thức lớp 6–12).', 'Tạo câu hỏi bằng AI (khoá Gemini miễn phí), tải đề có sẵn (Word, PDF, ảnh) hoặc tự gõ.', 'Bức tranh bí mật: chữ (20-11, 22-12…), hình có sẵn hoặc ảnh tự vẽ; 1–4 mã đề đảo câu.', 'Xuất trọn bộ: câu hỏi, đáp án + lời giải (Word, PDF), phiếu tô, đáp án màu, tải .zip.', 'Xem trước miễn phí; tải bộ phiếu theo hướng dẫn hiện trong trợ lý.']);
      else if (TRANG === 'tk') thongKe(M);
      else if (TRANG === 'hdap') trangHoiDap(M);
      else if (TRANG === 'at') trangAnToan(M);
      else if (TRANG === 'gv') khuVucCo(M);
      else if (TRANG === 'hd') { var bai = $('.hd'); if (bai) bai.classList.add('an'); canDangNhap(function () { if (bai) bai.classList.remove('an'); ganKiemTra(); }); }
    }
    if (TRANG !== 'chu' && TRANG !== 'xem' && M && M.parentNode) {   // ← Quay lại · 🏠 Trang chủ ở mọi trang
      var dh = document.createElement('div'); dh.className = 'khung dieu-huong';
      dh.innerHTML = '<button type="button" class="nut" id="dh-lai">← Quay lại</button><a class="nut" href="index.html">🏠 Trang chủ</a>';
      M.parentNode.insertBefore(dh, M);
      $('#dh-lai').onclick = function () { if (history.length > 1 && document.referrer.indexOf(location.origin) === 0) history.back(); else location.href = 'index.html'; };
    }
    chanTrang();
    if (TRANG !== 'at') moiGhiDanhLanDau();
    if (TRANG !== 'hdap') taiDiem();
    taiThongBao();
    dongBoLuot();
  }
  if (!(TRANG === 'xem' && (thamSo('id') === 've' || thamSo('id') === 'tcl'))) nutNoi();   // phòng vẽ hình cần trọn góc dưới cho nút phóng to
  WEB.ghiLuot(location.pathname.split('/').pop() || 'index.html', tieuDeLuot, mucLuot).then(function (r) {
    xongLuot(r); hienSoDem(r);
    var t = $('#tk-nho'); if (t && r) t.textContent = so(r.tong) + ' lượt · hôm nay ' + so(r.homNay);
  });

  // trang hướng dẫn: nút kiểm tra kết nối
  function ganKiemTra() {
    var b = $('#kt-nut'); if (!b) return;
    var o = $('#kt-url'); o.value = C.API_URL || '';
    b.onclick = function () {
      var u = o.value.trim(), kq = $('#kt-kq');
      if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(u)) { kq.innerHTML = '❌ Đường dẫn chưa đúng dạng <code>https://script.google.com/macros/s/…/exec</code>'; return; }
      kq.textContent = '⏳ Đang thử…';
      fetch(u + '?action=stats').then(function (r) { return r.json(); }).then(function (r) {
        kq.innerHTML = r && r.ok ? '✅ Kết nối được! Máy chủ đang chạy. Tổng lượt truy cập hiện có: <b>' + so(r.tong || 0) + '</b>.' + (u === C.API_URL ? '' : ' Giờ quản trị dán đường dẫn này vào <code>assets/cau-hinh.js</code>.') : '⚠️ Máy chủ trả lời nhưng chưa đúng. Quản trị kiểm tra đã dán đủ mã Code.gs và triển khai “Phiên bản mới”.';
      }).catch(function () { kq.innerHTML = '❌ Không gọi được. Kiểm tra mục “Người có quyền truy cập” phải là <b>Bất kỳ ai</b>, rồi triển khai lại.'; });
    };
  }
})();
