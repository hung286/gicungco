/* App "Luyện đề Toán 10 – 11 – 12": học sinh làm bài, giáo viên quản trị.
 * Dữ liệu đề gốc: data/catalog.js (window.DE_GOC) + data/de/<mã>.js (window.__nap_de(...)).
 * Máy chủ: Google Apps Script (CAU_HINH.API_URL). Chưa có API -> chế độ thử, lưu trên trình duyệt này.
 */
(function () {
  'use strict';
  var CH = window.CAU_HINH || {};
  var API = (CH.API_URL || '').trim();
  var R = window.ExamRunner, esc = R.esc, fmt = R.fmt;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var app = $('#app');
  var LOAI = { GK1: 'Đề kiểm tra giữa học kì I', CK1: 'Đề kiểm tra cuối học kì I', GK2: 'Đề kiểm tra giữa học kì II', CK2: 'Đề kiểm tra cuối học kì II', TN: 'Đề ôn thi tốt nghiệp THPT', KHAC: 'Đề luyện tập khác' };
  var LOAI_NGAN = { GK1: 'Giữa kì I', CK1: 'Cuối kì I', GK2: 'Giữa kì II', CK2: 'Cuối kì II', TN: 'Ôn thi TN', KHAC: 'Khác' };

  // ---------------------------------------------------------------- lưu trữ cục bộ
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert('Không lưu được trên trình duyệt này (bộ nhớ đầy hoặc bị chặn).'); } }

  // ---------------------------------------------------------------- SHA-256 (cho chế độ thử)
  function sha256(ascii) {
    function rr(v, n) { return (v >>> n) | (v << (32 - n)); }
    var mp = Math.pow, maxWord = mp(2, 32), result = '', words = [], asciiBitLength = ascii.length * 8, hash = [], k = [], primeCounter = 0, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mp(candidate, .5) * maxWord) | 0; k[primeCounter++] = (mp(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    hash = hash.slice(0, 8);
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) { var j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((asciiBitLength / maxWord) | 0); words[words.length] = (asciiBitLength);
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var temp1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash); hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
    return result;
  }
  function utf8(s) { return unescape(encodeURIComponent(s)); }

  // ---------------------------------------------------------------- gọi máy chủ (hoặc giả lập cục bộ)
  function call(action, payload) {
    payload = payload || {};
    payload.action = action;
    if (!API) return Promise.resolve(local(action, payload));
    return fetch(API, { method: 'POST', body: JSON.stringify(payload) }).then(function (r) { return r.json(); });
  }
  function local(action, p) {
    var kq = lsGet('lt_ketqua', []), de = lsGet('lt_de', {});
    switch (action) {
      case 'exams': return { ok: true, exams: Object.keys(de).map(function (k) { return de[k]; }) };
      case 'submit':
        var row = p.data; row.ma = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); row.nhan = new Date().toISOString();
        kq.push(row); lsSet('lt_ketqua', kq); return { ok: true, ma: row.ma, local: true };
      case 'login':
        return sha256(utf8(p.user + ':' + p.pass)) === CH.GV_HASH ? { ok: true, token: 'local' } : { ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }
    if (p.token !== 'local') return { ok: false, auth: false, error: 'Chưa đăng nhập.' };
    switch (action) {
      case 'results': return { ok: true, results: kq };
      case 'grade':
        kq.forEach(function (r) { if (r.ma === p.ma) { r.diemTL = p.diemTL; r.chiTietTL = p.chiTietTL; r.ghiChu = p.ghiChu || ''; } });
        lsSet('lt_ketqua', kq); return { ok: true };
      case 'deleteResult': lsSet('lt_ketqua', kq.filter(function (r) { return r.ma !== p.ma; })); return { ok: true };
      case 'saveExam': de[p.exam.id] = p.exam; lsSet('lt_de', de); return { ok: true };
      case 'deleteExam': delete de[p.id]; lsSet('lt_de', de); return { ok: true };
    }
    return { ok: false, error: 'Lệnh không hợp lệ' };
  }

  // ---------------------------------------------------------------- dữ liệu đề
  var GOC = window.DE_GOC || [];          // danh mục đề gốc
  var TUY = {};                            // đề giáo viên sửa/thêm: id -> exam
  var cache = {};                          // đề gốc đã nạp: id -> exam
  var napCho = {};
  window.__nap_de = function (ex) { cache[ex.id] = ex; if (napCho[ex.id]) { napCho[ex.id].forEach(function (f) { f(ex); }); delete napCho[ex.id]; } };

  function loadBase(id) {
    return new Promise(function (ok, fail) {
      if (cache[id]) return ok(cache[id]);
      (napCho[id] = napCho[id] || []).push(ok);
      var s = document.createElement('script'); s.src = 'data/de/' + id + '.js'; s.onerror = function () { fail(new Error('Không tải được đề ' + id)); };
      document.head.appendChild(s);
    });
  }
  function getExam(id) {
    if (laVip(id)) return getVip(id);
    if (TUY[id] && !TUY[id].xoa) return Promise.resolve(TUY[id]);
    return loadBase(id);
  }
  // Đề đầy đủ đáp án, lời giải: giáo viên (chìa khoá từ máy chủ) hoặc học sinh xem lại bài đã nộp (chìa khoá lưu sau khi nộp).
  var DAP_GV = null, TUY_GV = null;
  function khoaGV() {
    if (!TOKEN) return Promise.resolve(null);
    if (DAP_GV) return Promise.resolve(DAP_GV);
    return call('dapKhoaGV', { token: TOKEN }).then(function (r) { if (r && r.ok) DAP_GV = r.khoa || {}; return DAP_GV; }).catch(function () { return null; });
  }
  function deGV() {
    if (!TOKEN) return Promise.resolve({});
    if (TUY_GV) return Promise.resolve(TUY_GV);
    return call('examsGV', { token: TOKEN }).then(function (r) { TUY_GV = {}; ((r && r.exams) || []).forEach(function (e) { if (e && e.id) TUY_GV[e.id] = e; }); return TUY_GV; }).catch(function () { return {}; });
  }
  function getFull(id, khoa) {
    if (String(id).indexOf('#') > 0 && TOKEN) {
      var q2 = String(id).split('#');
      return call('deGVDayDu', { token: TOKEN, id: q2[0] }).then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || 'Không mở được đề giáo viên.');
        var b = (r.de.ma || []).filter(function (x) { return x.ma === q2[1]; })[0]; if (!b) throw new Error('Không tìm thấy mã đề.');
        return Object.assign({}, b.de, { id: id, title: r.de.title + ' — Mã đề ' + q2[1], time: r.de.time, khoi: r.de.khoi, ver: 'gv' });
      });
    }
    if (String(id).indexOf('#') > 0) {
      var pp = String(id).split('#'), rieng = lsGet('dr_' + id, null);
      if (!rieng) return Promise.reject(new Error('Thầy/cô không cho xem đáp án đề này, hoặc bài làm ở máy khác.'));
      return layDeGV(pp[0]).then(function (d) {
        var b = d.ma.filter(function (x) { return x.ma === pp[1]; })[0]; if (!b) throw new Error('Không tìm thấy mã đề.');
        return R.ghep(Object.assign({}, b.de, { id: id, title: d.title + ' — Mã đề ' + pp[1], time: d.time, khoi: d.khoi }), rieng);
      });
    }
    var cust = TUY[id] && !TUY[id].xoa;
    if (cust) {
      if (R.coDapAn(TUY[id])) return Promise.resolve(TUY[id]);
      return deGV().then(function (m) { if (m[id]) return m[id]; throw new Error('Cần đăng nhập giáo viên để xem đáp án đề này.'); });
    }
    return getExam(id).then(function (ex) {
      if (R.coDapAn(ex)) return ex;
      var k = khoa || lsGet('dk_' + id, null);
      return (k ? Promise.resolve(k) : khoaGV().then(function (m) { return m && m[id]; })).then(function (kk) {
        if (!kk) throw new Error('Chưa có đáp án của đề này (em cần nộp bài trước).');
        return giaiMaTxt('data/dap/' + id + '.txt', kk).then(function (rieng) { return R.ghep(ex, rieng); });
      });
    });
  }
  function list() {
    var m = {};
    GOC.forEach(function (d) { m[d.id] = Object.assign({ goc: true }, d); });
    Object.keys(TUY).forEach(function (id) {
      var t = TUY[id];
      if (t.xoa) { delete m[id]; return; }
      m[id] = { id: id, set: t.set, khoi: t.khoi, loai: t.loai || 'KHAC', ten: t.ten || LOAI[t.loai] || 'Đề luyện tập', so: t.so || 0, title: t.title, time: t.time, an: !!t.an, goc: !!(m[id] && m[id].goc), sua: true };
    });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) {
      return a.khoi - b.khoi || ord(a.loai) - ord(b.loai) || (a.so || 0) - (b.so || 0) || String(a.title).localeCompare(String(b.title));
    });
  }
  function ord(l) { return { GK1: 1, CK1: 2, GK2: 3, CK2: 4, TN: 5 }[l] || 9; }
  function refreshCustom() {
    return call('exams').then(function (r) {
      TUY = {};
      (r.exams || []).forEach(function (e) { if (e && e.id) TUY[e.id] = e; });
    }).catch(function () { /* mất mạng: dùng đề gốc */ });
  }

  // ---------------------------------------------------------------- khung trang
  function shell(inner, opts) {
    opts = opts || {};
    var hs = lsGet('hs', null);
    app.innerHTML = '<header class="ap-h"><div class="ap-h-in"><div class="ap-logo">∑</div><div><div class="ap-name">' + esc(CH.TEN_APP || 'Luyện đề Toán 10 · 11 · 12') +
      '</div><div class="ap-sub">' + esc(CH.TAC_GIA || '') + '</div></div><div class="ap-sp"></div>' + (opts.right || '') + '</div></header>' +
      (API ? '' : '<div class="ap-warn">Chế độ thử: kết quả chỉ lưu trên máy này. Giáo viên kết nối Google Sheet (xem <i>Hướng dẫn</i> trong trang quản trị) để nhận bài của cả lớp.</div>') +
      '<main class="ap-main">' + inner + '</main><footer class="ap-f">' + esc(CH.CHAN_TRANG || '') + ' · <a href="#" id="ap-gv">Giáo viên</a></footer>';
    $('#ap-gv').onclick = function (e) { e.preventDefault(); teacherLogin(); };
    return hs;
  }

  // ---------------------------------------------------------------- HỌC SINH
  function studentLogin(cheDo, loi) {
    var tao = cheDo === 'tao';
    if (!API) {   // chế độ thử không máy chủ: nhập tên như cũ
      shell('<section class="ap-card ap-login"><h1>Chào em! 👋</h1><label>Họ và tên<input id="f-name"></label><label>Lớp<input id="f-lop"></label><label>Trường<input id="f-truong" value="' + esc(CH.TRUONG_MAC_DINH || '') + '"></label><button class="er-btn er-btn-y er-big" id="f-go">Vào làm bài</button></section>');
      $('#f-go').onclick = function () { var v = { name: $('#f-name').value.trim(), lop: $('#f-lop').value.trim().toUpperCase(), truong: $('#f-truong').value.trim() }; if (v.name.length < 4 || !v.lop) return alert('Em nhập đủ họ tên, lớp nhé.'); lsSet('hs', v); home(); };
      return;
    }
    if (window.TAI_KHOAN) {   // hộp tài khoản dùng chung của website (Gmail + số điện thoại, mã xác thực, quên mật khẩu)
      shell('<section class="ap-card ap-login"><h1>Chào em! 👋</h1><p>Để làm bài, em cần <b>đăng nhập</b>. Một tài khoản dùng cho cả website: làm đề và xem lại bài trên mọi máy, lớp học, đề VIP, tải tư liệu.</p>' +
        '<p><button class="er-btn er-btn-y er-big" id="f-vao">🔑 Đăng nhập</button> <button class="er-btn er-big" id="f-tao">📝 Tạo tài khoản mới</button></p>' + (loi ? '<p class="ap-warn2">' + esc(loi) + '</p>' : '') +
        '<p class="ap-note">Tạo tài khoản cần <b>Gmail</b> (nhận mã xác thực) và <b>số điện thoại</b>; mỗi Gmail, mỗi số điện thoại chỉ một tài khoản. Quên mật khẩu: bấm "Quên mật khẩu?" trong hộp đăng nhập.</p></section>');
      var moHop = function (c) {
        TAI_KHOAN.mo({ cheDo: c, xong: function (r) {
          luuDangNhap(r);
          app.innerHTML = '<p class="ap-load">Đang lấy lịch sử làm bài của em…</p>';
          dongBoLichSu().then(function () { if (DANG_CHO) { var f = DANG_CHO; DANG_CHO = null; f(); } else home(); });
        } });
      };
      $('#f-vao').onclick = function () { moHop('vao'); }; $('#f-tao').onclick = function () { moHop('tao'); };
      moHop(tao ? 'tao' : 'vao');
      return;
    }
    var VAI = ['Học sinh', 'Giáo viên', 'Phụ huynh', 'Khác'];
    shell('<section class="ap-card ap-login"><h1>' + (tao ? '📝 Tạo tài khoản' : 'Chào em! 👋') + '</h1>' +
      '<p>Để làm bài, em cần <b>đăng nhập</b>. Một tài khoản dùng cho cả website: làm đề và xem lại bài trên mọi máy, đề VIP, tải tư liệu.</p>' +
      '<nav class="ap-tabs ap-tabs-s"><button class="ap-tab' + (tao ? '' : ' on') + '" data-c="vao">Đăng nhập</button><button class="ap-tab' + (tao ? ' on' : '') + '" data-c="tao">Tạo tài khoản mới</button></nav>' +
      (tao ? '<label>Em là<select id="f-vai">' + VAI.map(function (v) { return '<option>' + v + '</option>'; }).join('') + '</select></label>' +
        '<label>Họ và tên<input id="f-name" autocomplete="name" placeholder="VD: Nguyễn Văn An"></label><label>Lớp<input id="f-lop" placeholder="VD: 10A1"></label>' +
        '<label>Trường<input id="f-truong" value="' + esc(CH.TRUONG_MAC_DINH || '') + '" placeholder="VD: THPT …"></label>' : '') +
      '<label>Tên đăng nhập <small>(viết liền, không dấu)</small><input id="f-u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="VD: an.nguyen10a1"></label>' +
      '<label>Mật khẩu<input id="f-p" type="password" autocomplete="' + (tao ? 'new-password' : 'current-password') + '" placeholder="ít nhất 6 kí tự"></label>' +
      (tao ? '<label>Nhập lại mật khẩu<input id="f-p2" type="password" autocomplete="new-password"></label>' : '') +
      '<button class="er-btn er-btn-y er-big" id="f-go">' + (tao ? 'Tạo tài khoản và vào làm bài' : 'Đăng nhập') + '</button><p class="ap-warn2" id="f-loi"' + (loi ? '' : ' hidden') + '>' + esc(loi || '') + '</p>' +
      '<p class="ap-note">🔒 Mật khẩu được mã hoá, Ban quản trị cũng không đọc được. Quên mật khẩu: nhắn Ban quản trị để được đặt lại.</p></section>');
    app.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function () { studentLogin(b.dataset.c); }; });
    var bao = function (x) { var e = $('#f-loi'); e.hidden = !x; e.textContent = x; };
    var go = function () {
      var d = { user: $('#f-u').value.trim().toLowerCase(), pass: $('#f-p').value };
      if (!/^[a-z0-9._]{4,30}$/.test(d.user)) return bao('Tên đăng nhập 4–30 kí tự: chữ thường không dấu, số, dấu chấm hoặc gạch dưới (VD: an.nguyen10a1).');
      if (d.pass.length < 6) return bao('Mật khẩu cần ít nhất 6 kí tự.');
      if (tao) {
        d.vaiTro = $('#f-vai').value; d.hoTen = $('#f-name').value.trim().replace(/\s+/g, ' '); d.lop = $('#f-lop').value.trim().toUpperCase(); d.truong = $('#f-truong').value.trim();
        if (d.hoTen.length < 4 || d.hoTen.indexOf(' ') < 0) return bao('Em nhập đầy đủ họ và tên nhé.');
        if (d.vaiTro === 'Học sinh' && (!d.lop || !d.truong)) return bao('Em nhập lớp và trường nhé.');
        if ($('#f-p2').value !== d.pass) return bao('Hai lần nhập mật khẩu chưa giống nhau.');
      }
      bao(''); $('#f-go').disabled = true; $('#f-go').textContent = 'Đang xử lí…';
      call(tao ? 'hsTao' : 'hsVao', d).then(function (r) {
        if (!r || !r.ok) { studentLogin(cheDo, (r && r.error) || 'Có lỗi, em thử lại nhé.'); return; }
        luuDangNhap(r);
        app.innerHTML = '<p class="ap-load">Đang lấy lịch sử làm bài của em…</p>';
        dongBoLichSu().then(function () { if (DANG_CHO) { var f = DANG_CHO; DANG_CHO = null; f(); } else home(); });
      }).catch(function () { studentLogin(cheDo, 'Không kết nối được máy chủ, kiểm tra mạng rồi thử lại.'); });
    };
    $('#f-go').onclick = go;
    $('#f-p').onkeydown = function (e) { if (e.key === 'Enter' && !tao) go(); };
  }
  var DANG_CHO = null;   // việc cần làm sau khi đăng nhập (mở đề giáo viên, kho đề)
  function luuDangNhap(r) {
    var h = r.hs || {};
    if (window.parent && window.parent.WEB && window.parent.WEB.luuDangNhap) { try { window.parent.WEB.luuDangNhap(r); } catch (e) { } }
    lsSet('hs_tk', { token: r.token, user: h.user, hoTen: h.hoTen, lop: h.lop, truong: h.truong, vaiTro: h.vaiTro || 'Học sinh', luc: Date.now() });
    lsSet('hs', { name: h.hoTen, lop: h.lop, truong: h.truong });
  }
  function dangXuat() {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (/^(hs|hs_tk|web_vai|lichsu|tab)$/.test(k) || /^(dk_|vip_k_|er_bai_)/.test(k)) localStorage.removeItem(k);
      });
    } catch (e) { }
    studentLogin();
  }
  // Kéo lịch sử làm bài của tài khoản về máy này (để thẻ đề hiện "Đã làm", nút Xem lại)
  function dongBoLichSu() {
    var t = tk_(); if (!t || !API) return Promise.resolve();
    return call('lichSuHS', { token: t.token }).then(function (r) {
      if (!r || !r.ok) return;
      Object.keys(r.khoa || {}).forEach(function (id) { lsSet('dk_' + id, r.khoa[id]); });
      var cuc = lichSu(), co = {}; cuc.forEach(function (x) { if (x.ma) co[x.ma] = 1; });
      var them = (r.ds || []).filter(function (x) { return !co[x.ma]; }).map(function (x) {
        var a = []; try { a = typeof x.traLoi === 'string' ? JSON.parse(x.traLoi || '[]') : x.traLoi; } catch (e) { }
        return { examId: x.maDe, title: x.tenDe, score: +x.diemTN, maxAuto: +x.toiDaTN, end: x.nopLuc, ans: a, vp: +x.viPham || 0, ma: x.ma, ver: x.ver };
      });
      lsSet('lichsu', cuc.concat(them).sort(function (a, b) { return String(b.end).localeCompare(String(a.end)); }).slice(0, 200));
    }).catch(function () { });
  }

  // Lịch sử làm bài trên máy: mỗi lượt lưu đủ bài làm để xem lại câu sai
  function lichSu() { return lsGet('lichsu', []); }
  function thongKeDe() {
    var m = {};
    lichSu().forEach(function (h) {
      var x = m[h.examId] = m[h.examId] || { n: 0, best: null, cuoi: null };
      x.n++;
      if (h.score != null && (x.best == null || h.score > x.best)) x.best = h.score;
      if (!x.cuoi || String(h.end) > String(x.cuoi.end)) x.cuoi = h;
    });
    return m;
  }
  function theDe(d, tk, nhan) {
    var t = tk[d.id];
    return '<div class="ap-de-w"><button class="ap-de' + (d.vip ? ' ap-de-vip' : '') + '" data-id="' + esc(d.id) + '"><span class="ap-de-n">' + nhan + '</span>' +
      '<span class="ap-de-m">' + (d.time || 90) + ' phút</span>' +
      (t ? '<span class="ap-de-s">✔ Đã làm ' + t.n + ' lần' + (t.best != null ? ' · cao nhất ' + fmt(t.best) : '') + '</span>' : '<span class="ap-de-s new">Chưa làm</span>') + '</button>' +
      '<div class="ap-de-nut">' + (t && t.cuoi && t.cuoi.ans ? '<button class="ap-xl" data-xl="' + esc(d.id) + '" title="Xem lại bài làm gần nhất, đáp án và lời giải">📄 Xem lại</button>' : '') +
      (API && window.DE_WORD && window.DE_WORD[d.id] && !(d.sua && !d.goc) ? '<button class="ap-xl ap-w" data-tw="' + esc(d.id) + '" title="Tải đề Word (có đáp án, lời giải, công thức MathType) — cần mã của Ban quản trị">⬇ Word</button>' : '') + '</div></div>';
  }
  function home(tab) {
    var hs = lsGet('hs', null);
    if (!hs || (API && !tk_())) return studentLogin();
    var khoi = tab || lsGet('tab', 10);
    var L = list().filter(function (d) { return !d.an; });
    var tk = thongKeDe();
    var tabs = [10, 11, 12].map(function (k) { return '<button class="ap-tab' + (k == khoi ? ' on' : '') + '" data-k="' + k + '">Toán ' + k + '</button>'; }).join('');
    var groups = {};
    L.filter(function (d) { return d.khoi == khoi && d.loai !== 'OT'; }).forEach(function (d) { var g = d.loai || 'KHAC'; (groups[g] = groups[g] || []).push(d); });
    var body = '';
    Object.keys(groups).sort(function (a, b) { return ord(a) - ord(b); }).forEach(function (g) {
      var ds = groups[g], xong = ds.filter(function (d) { return tk[d.id]; }).length;
      body += '<h2 class="ap-g">' + esc(LOAI[g] || g) + ' <small class="ap-tien">đã làm ' + xong + '/' + ds.length + '</small></h2><div class="ap-grid">';
      ds.forEach(function (d) { body += theDe(d, tk, d.so ? 'Đề ' + (d.so < 10 ? '0' : '') + d.so : esc(d.title)); });
      body += '</div>';
    });
    if (!body) body = '<p class="ap-note">Chưa có đề cho khối này.</p>';
    vipPhanCua(khoi).forEach(function (ph) { body += '<section class="ap-vipbox"><h2 class="ap-g">⭐ Đề siêu VIP · ' + esc(tenPhan(ph)) + '</h2><div id="vip-' + ph + '"></div></section>'; });
    body = onTapHTML(khoi, L, tk) + body;
    var t = tk_();
    shell('<section class="ap-hello"><div>Xin chào <b>' + esc(hs.name) + '</b> · Lớp ' + esc(hs.lop) + ' · ' + esc(hs.truong) +
      (t ? '<br><small>Tài khoản: <b>' + esc(t.user) + '</b> — lịch sử làm bài được lưu trên mọi máy</small>' : '') +
      '</div><div>' + (t && (t.vaiTro === 'Giáo viên' || t.vaiTro === 'Quản trị') ? '<button class="er-btn er-btn-y" id="ap-kho">🧑‍🏫 Kho đề của tôi</button> <button class="er-btn" id="ap-lop">🏫 Lớp học</button> ' : '') + (t && API ? '<button class="er-btn" id="ap-lopem">📬 Lớp của em<span class="ap-chuong" id="ap-chuong" hidden></span></button> ' : '') + '<button class="er-btn" id="ap-hist">📚 Bài đã làm</button> <button class="er-btn" id="ap-out">🚪 Đăng xuất</button></div></section>' +
      '<div id="ap-tbao"></div>' +
      '<nav class="ap-tabs">' + tabs + '</nav>' + body);
    app.querySelectorAll('.ap-tab').forEach(function (b) { b.onclick = function () { lsSet('tab', +b.dataset.k); home(+b.dataset.k); }; });
    ganThe(app);
    $('#ap-out').onclick = function () {
      if (!confirm('Đăng xuất khỏi tài khoản ' + (t ? t.user : '') + '? Lịch sử làm bài vẫn còn trong tài khoản, đăng nhập lại là thấy.')) return;
      if (window.parent && window.parent.WEB && window.parent.WEB.dangXuat) { try { window.parent.WEB.dangXuat(); } catch (e) { } }
      dangXuat();
    };
    $('#ap-hist').onclick = function () { history(); };
    var kho = $('#ap-kho'); if (kho) kho.onclick = function () { window.KHO_DE.moTrang(); };
    var lop = $('#ap-lop'); if (lop) lop.onclick = function () { window.LOP_HOC.lopGV(); };
    var lopem = $('#ap-lopem');
    if (lopem && window.LOP_HOC) {
      lopem.onclick = function () { window.LOP_HOC.lopCuaEm(); };
      window.LOP_HOC.demThongBao().then(function (n) {
        var c = $('#ap-chuong'), b = $('#ap-tbao'); if (!c || !b) return;
        c.hidden = !n; c.textContent = n;
        if (n) { b.innerHTML = '<button class="ap-tbao" type="button">📬 Em có <b>' + n + '</b> đề thầy/cô mới giao chưa làm — bấm để xem</button>'; b.firstChild.onclick = function () { window.LOP_HOC.lopCuaEm(); }; }
      });
    }
    vipVe(khoi);
  }
  // ---- ÔN TẬP THEO CHƯƠNG / CHỦ ĐỀ: mỗi chương 3 mức Dễ – Trung bình – Khó (Khó là VIP: mã quản trị cấp hoặc voucher đổi điểm)
  var MUC_OT = [['DE', '🟢 Dễ'], ['TB', '🟡 Trung bình'], ['KHO', '🔴 Khó · VIP']];
  function otCua(khoi, L) {
    var m = {};
    L.filter(function (d) { return d.khoi == khoi && d.loai === 'OT'; }).concat(VIP.filter(function (d) { return d.khoi == khoi && d.ot; }))
      .forEach(function (d) { var x = m[d.ot] = m[d.ot] || { ot: d.ot, chuong: d.chuong, muc: {} }; (x.muc[d.muc_ot] = x.muc[d.muc_ot] || []).push(d); });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return (a.ot[0] === b.ot[0] ? 0 : a.ot[0] === 'C' ? -1 : 1) || (parseInt(a.ot.slice(1), 10) - parseInt(b.ot.slice(1), 10)); });
  }
  function onTapHTML(khoi, L, tk) {
    var ds = otCua(khoi, L); if (!ds.length) return '';
    var mo = lsGet('ot_mo', {});
    var khoiOT = function (tieuDe, gioiThieu, nhom) {
      if (!nhom.length) return '';
      return '<section class="ap-ot"><h2 class="ap-g">' + tieuDe + '</h2><p class="ap-note">' + gioiThieu + '</p>' + nhom.map(function (c) {
        var tat = [].concat(c.muc.DE || [], c.muc.TB || []), xong = tat.filter(function (d) { return tk[d.id]; }).length;
        return '<details class="ap-ot-c" data-ot="' + esc(khoi + c.ot) + '"' + (mo[khoi + c.ot] ? ' open' : '') + '><summary><b>' + esc(c.chuong) + '</b> <small class="ap-tien">đã làm ' + xong + '/' + tat.length + ' đề Dễ, Trung bình</small></summary>' +
          MUC_OT.map(function (m) {
            var de = (c.muc[m[0]] || []).sort(function (a, b) { return a.so - b.so; }); if (!de.length) return '';
            if (m[0] === 'KHO') return '<h3 class="ap-ot-m">' + m[1] + '</h3><div id="vip-' + esc(de[0].set) + '"></div>';
            return '<h3 class="ap-ot-m">' + m[1] + '</h3><div class="ap-grid">' + de.map(function (d) { return theDe(d, tk, 'Đề ' + (d.so < 10 ? '0' : '') + d.so); }).join('') + '</div>';
          }).join('') + '</details>';
      }).join('') + '</section>';
    };
    return khoiOT('📚 Ôn tập theo chương', 'Mỗi chương 3 mức: <b>Dễ</b>, <b>Trung bình</b> (miễn phí) và <b>Khó</b> (VIP — mở bằng mã của Ban quản trị hoặc đổi 20 điểm tích luỹ lấy 1 đề). Mỗi mức 5 đề, 22 câu, thang 10 điểm.', ds.filter(function (c) { return c.ot[0] === 'C'; })) +
      khoiOT('🎯 Ôn thi tốt nghiệp THPT theo chủ đề', 'Các chủ đề xuất hiện trong đề thi tốt nghiệp THPT theo cấu trúc mới, gồm cả nội dung Toán 11.', ds.filter(function (c) { return c.ot[0] === 'T'; }));
  }
  function ganOT(host) {
    host.querySelectorAll('.ap-ot-c').forEach(function (d) { d.ontoggle = function () { var mo = lsGet('ot_mo', {}); if (d.open) mo[d.dataset.ot] = 1; else delete mo[d.dataset.ot]; lsSet('ot_mo', mo); }; });
  }
  function ganThe(host) {
    ganOT(host);
    host.querySelectorAll('.ap-de').forEach(function (b) { b.onclick = function () { startExam(b.dataset.id); }; });
    host.querySelectorAll('[data-tw]').forEach(function (b) { b.onclick = function () { taiWord(b.dataset.tw); }; });
    host.querySelectorAll('[data-xl]').forEach(function (b) {
      b.onclick = function () { var c = thongKeDe()[b.dataset.xl]; if (c && c.cuoi) xemLaiBai(c.cuoi); };
    });
  }
  function tk_() { return lsGet('hs_tk', null); }

  function startExam(id) {
    app.innerHTML = '<p class="ap-load">Đang tải đề…</p>';
    getExam(id).then(function (ex) { lamDe(ex, !!API); }).catch(function (e) { app.innerHTML = '<p class="ap-load">' + esc(e.message) + '</p>'; });
  }
  function lamDe(ex, chongGian) {
    var hs = lsGet('hs', null);
    (function () {
      app.innerHTML = '<div id="er-host"></div>';
      window.scrollTo(0, 0);
      var coDap = R.coDapAn(ex);
      R.mount($('#er-host'), ex, {
        student: hs,
        chongGian: chongGian,                               // có máy chủ: thi theo quy chế phòng thi
        diemVinhDanh: !!(API && tk_()),                     // cảnh báo điều kiện cộng điểm vinh danh trước khi nộp
        onExit: function () { home(); },
        onViPham: function (v) {
          var t = tk_();
          call('viPham', { data: { hoTen: hs.name, lop: hs.lop, truong: hs.truong, maDe: ex.id, tenDe: ex.title, lan: v.lan, hanhVi: v.hanhVi, xuLy: v.xuLy, taiKhoan: t ? t.user : '' } }).catch(function () { });
        },
        nopBai: function (res) { return guiBai(hs, ex, res); },
        baoLoi: ZALO ? 'https://zalo.me/' + ZALO : '',
        guiAnh: API && tk_() ? function (x) {
          return call('anhTL', { hsToken: tk_().token, maDe: ex.id, cau: x.cau, du: x.du }).then(function (r) {
            if (!r || !r.ok) throw new Error((r && r.error) || 'Chưa gửi được ảnh'); return r;
          });
        } : null,
        onSubmit: function (res, status, full) {
          if (coDap) {   // chế độ thử không máy chủ: tự chấm trên máy
            luuLuot({ examId: res.examId, ver: ex.ver || '', title: res.title, score: res.score, maxAuto: res.maxAuto, end: res.end, ans: res.answers, vp: res.viPham });
            call('submit', { data: duLieuNop(hs, ex, res) }).then(function (r) { status(r && r.local ? 'Đã lưu kết quả trên máy này (chế độ thử).' : '✔ Đã gửi kết quả.', true); });
          }
        }
      });
    })();
  }
  // ---- ĐỀ CỦA GIÁO VIÊN (link ?de=GV-…): mỗi em được giao ngẫu nhiên một mã đề, máy chủ chấm theo mã
  function layDeGV(id) {
    var t = tk_();
    return call('deGVHS', { token: t ? t.token : '', id: id }).then(function (r) {
      if (r && r.hsAuth === false) throw new Error('Em đăng nhập để làm bài nhé.');
      if (!r || !r.ok) throw new Error((r && r.error) || 'Không mở được đề.');
      r.de.han = r.han || '';
      return r.de;
    });
  }
  function moDeGV(id) {
    app.innerHTML = '<p class="ap-load">Đang mở đề của thầy/cô…</p>';
    layDeGV(id).then(function (d) {
      var luu = lsGet('gvma_' + id, null), tkh = tk_(), bam = 0;
      if (tkh && tkh.user) { var sx = tkh.user + '|' + id; for (var ci = 0; ci < sx.length; ci++) bam = (bam * 31 + sx.charCodeAt(ci)) >>> 0; }
      // mã đề cố định theo tài khoản (cùng một em luôn ra cùng mã đề, kể cả khi tải lại trang hoặc máy xoá bộ nhớ)
      var bien = d.ma.filter(function (x) { return x.ma === luu; })[0] || (tkh && tkh.user ? d.ma[bam % d.ma.length] : d.ma[Math.floor(Math.random() * d.ma.length)]);
      lsSet('gvma_' + id, bien.ma);
      var ex = Object.assign({}, bien.de, { id: id + '#' + bien.ma, title: d.title + ' — Mã đề ' + bien.ma, time: d.time, khoi: d.khoi, loai: 'GV', ver: 'gv' });
      shell('<section class="ap-card"><h1>' + esc(d.title) + '</h1><p>Đề của ' + (d.gvTen ? 'thầy/cô <b>' + esc(d.gvTen) + '</b>' : 'giáo viên') + ' · ' + d.time + ' phút · Mã đề <b>' + bien.ma + '</b></p>' +
        (d.han ? '<p class="ap-warn2">⏰ Hạn vào làm bài: <b>' + new Date(d.han).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + '</b>. Hết hạn, em không vào làm được nữa — em bắt đầu sớm nhé.</p>' : '') +
        (lichSu().some(function (h) { return String(h.examId).split('#')[0] === id; }) ? '<p class="ap-warn2">Em đã làm đề này rồi. Làm lại sẽ là một lượt nộp mới gửi cho thầy/cô.</p>' : '') +
        '<p><button class="er-btn er-btn-y er-big" id="gv-lam">Bắt đầu làm bài</button> <button class="er-btn" id="gv-ve">Về trang luyện đề</button></p></section>');
      $('#gv-ve').onclick = function () { window.history.replaceState(null, '', location.pathname); home(); };
      $('#gv-lam').onclick = function () { lamDe(ex, (d.caiDat || {}).chongGian !== false); };
    }).catch(function (e) {
      shell('<section class="ap-card"><p class="ap-warn2">' + esc(e.message) + '</p><button class="er-btn" id="gv-ve">Về trang luyện đề</button></section>');
      $('#gv-ve').onclick = function () { home(); };
    });
  }
  function duLieuNop(hs, ex, res) {
    return { hoTen: hs.name, lop: hs.lop, truong: hs.truong, maDe: res.examId, tenDe: res.title, khoi: res.khoi, loai: res.loai,
      diemTN: res.score || 0, toiDaTN: res.maxAuto || 0, toiDaTL: res.essayMax || 0, giay: res.seconds, batDau: res.start, nopLuc: res.end,
      traLoi: res.answers, chiTiet: res.detail || [], ver: ex.ver || '', viPham: res.viPham || 0, lamLai: res.lamLai || 0, anhTL: res.anhTL || {} };
  }
  function toastDiem(t, canh) {
    var b = document.createElement('div'); b.className = 'ap-toast'; b.textContent = t;
    b.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:' + (canh ? '#c2410c' : '#16a34a') + ';color:#fff;padding:10px 18px;border-radius:999px;font-weight:700;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:92vw;text-align:center';
    document.body.appendChild(b); setTimeout(function () { b.remove(); }, canh ? 9000 : 4500);
  }
  function luuLuot(x) { var h = lichSu(); h.unshift(x); lsSet('lichsu', h.slice(0, 150)); }
  // Gửi bài cho máy chủ chấm; nhận chìa khoá mở lời giải
  function guiBai(hs, ex, res) {
    var t = tk_(), data = duLieuNop(hs, ex, res);
    var luot = { examId: res.examId, ver: ex.ver || '', title: res.title, end: res.end, ans: res.answers, vp: res.viPham, score: null, maxAuto: null, choGui: true };
    return call('submit', { data: data, hsToken: t ? t.token : '' }).then(function (r) {
      if (!r || !r.ok) { var er = new Error(r && r.hetGio ? r.error : 'Máy chủ báo lỗi: ' + ((r && r.error) || 'không rõ') + '.'); er.hetGio = !!(r && r.hetGio); throw er; }
      if (r.diemTong != null) { baoDiem(r.diemTong); if (r.diemThem) toastDiem('🎉 +' + r.diemThem + ' điểm vinh danh vì đã làm bài nghiêm túc · tổng ' + r.diemTong + ' điểm'); else if (r.diemLyDo) toastDiem('⚠️ ' + r.diemLyDo, true); }
      return nhanDap(ex, r).then(function (x) {
        luot.score = r.diemTN; luot.maxAuto = r.toiDaTN; luot.ma = r.ma; delete luot.choGui; luuLuot(luot);
        return x;
      });
    }, function () {
      var q = lsGet('cho_gui', []); q.push({ data: data, hsToken: t ? t.token : '' }); lsSet('cho_gui', q);
      luuLuot(luot);
      throw new Error('Chưa gửi được bài (mất mạng hoặc máy chủ bận).');
    });
  }
  function nhanDap(ex, r) {
    if (r.anDap) return Promise.resolve({ chiDiem: true, diemTN: r.diemTN, toiDaTN: r.toiDaTN, ma: r.ma });
    if (r.rieng) { if (String(ex.id).indexOf('#') > 0) lsSet('dr_' + ex.id, r.rieng); return Promise.resolve({ rieng: r.rieng, diemTN: r.diemTN, ma: r.ma }); }
    if (!r.khoa) return Promise.reject(new Error('Máy chủ chưa có đáp án đề này — quản trị cần dán tệp DapAn.gs mới vào Apps Script.'));
    lsSet('dk_' + ex.id, r.khoa);
    return giaiMaTxt('data/dap/' + ex.id + '.txt', r.khoa).then(function (rieng) { return { rieng: rieng, diemTN: r.diemTN, ma: r.ma }; });
  }

  function resend() {
    var q = lsGet('cho_gui', []); if (!q.length || !API) return;
    var rest = [];
    Promise.all(q.map(function (x) {
      var item = x.data ? x : { data: x };
      return call('submit', item).then(function (r) {
        if (!r || !r.ok) { rest.push(item); return; }
        if (r.khoa) lsSet('dk_' + item.data.maDe, r.khoa);
        var h = lichSu(); h.forEach(function (l) { if (l.choGui && l.examId === item.data.maDe && l.end === item.data.nopLuc) { l.score = r.diemTN; l.maxAuto = r.toiDaTN; l.ma = r.ma; delete l.choGui; } }); lsSet('lichsu', h);
      }).catch(function () { rest.push(item); });
    })).then(function () { lsSet('cho_gui', rest); });
  }

  function xemLaiBai(l) {
    app.innerHTML = '<p class="ap-load">Đang mở bài làm…</p>';
    getFull(l.examId, l.khoa).then(function (ex) {
      app.innerHTML = '<div id="er-host"></div>';
      R.xemLai($('#er-host'), ex, l.ans || [], { end: l.end, viPham: l.vp }, { student: lsGet('hs', null), onExit: function () { history(); } });
      if (ex.ver && l.ver && ex.ver !== l.ver && ex.ver !== 'goc') { var s = $('#er-send'); if (s) { s.textContent = 'Lưu ý: đề đã được giáo viên sửa sau lần em làm.'; s.className = 'er-send err'; } }
    }).catch(function (e) {
      shell('<section class="ap-card"><p>' + esc(e.message) + '</p><p><button class="er-btn er-btn-y" id="ap-back">Quay lại</button></p></section>');
      $('#ap-back').onclick = function () { history(); };
    });
  }

  function history() {
    var t = tk_();
    var ve = function (ds, ghiChu) {
      var rows = ds.map(function (x, i) {
        return '<tr><td>' + new Date(x.end).toLocaleString('vi-VN') + '</td><td>' + esc(x.title) + '</td><td>' + (x.score == null ? '<span class="ap-pend">chờ gửi</span>' : '<b>' + fmt(x.score) + '</b>/' + fmt(x.maxAuto)) +
          (x.vp ? ' <span class="ap-tt bad" title="Số lần vi phạm quy chế">⚠ ' + x.vp + '</span>' : '') + '</td><td>' + (x.ans && x.score != null ? '<button class="er-btn ap-sm" data-i="' + i + '">📄 Xem lại</button>' : '') + '</td></tr>';
      }).join('');
      shell('<section class="ap-card"><h1>📚 Bài đã làm</h1>' + (ghiChu || '') +
        (rows ? '<div class="ap-tw"><table class="ap-t"><tr><th>Nộp lúc</th><th>Đề</th><th>Điểm trắc nghiệm</th><th></th></tr>' + rows + '</table></div>' : '<p>Chưa có bài nào.</p>') +
        '<p><button class="er-btn er-btn-y" id="ap-back">Về danh sách đề</button></p></section>');
      $('#ap-back').onclick = function () { home(); };
      app.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { xemLaiBai(ds[+b.dataset.i]); }; });
    };
    var cuc = lichSu();
    if (!t || !API) return ve(cuc, t ? '' : '<p class="ap-note">Đây là các bài làm trên máy này. <a href="#" id="h-tk">Đăng nhập tài khoản</a> để xem bài đã làm trên mọi máy.</p>'), ganTK();
    ve(cuc, '<p class="ap-load">Đang lấy lịch sử từ tài khoản ' + esc(t.user) + '…</p>');
    call('lichSuHS', { token: t.token }).then(function (r) {
      if (!r || !r.ok) { if (r && r.hsAuth === false) localStorage.removeItem('hs_tk'); return ve(cuc, '<p class="ap-note">' + esc((r && r.error) || 'Không lấy được lịch sử từ máy chủ') + ' — đang hiện bài trên máy này.</p>'); }
      Object.keys(r.khoa || {}).forEach(function (id) { lsSet('dk_' + id, r.khoa[id]); });
      var co = {}; cuc.forEach(function (x) { if (x.ma) co[x.ma] = 1; });
      var tuMay = (r.ds || []).filter(function (x) { return !co[x.ma]; }).map(function (x) {
        var a = []; try { a = typeof x.traLoi === 'string' ? JSON.parse(x.traLoi || '[]') : x.traLoi; } catch (e) { }
        return { examId: x.maDe, title: x.tenDe, score: +x.diemTN, maxAuto: +x.toiDaTN, end: x.nopLuc, ans: a, vp: +x.viPham || 0, ma: x.ma, ver: x.ver };
      });
      ve(cuc.concat(tuMay).sort(function (a, b) { return String(b.end).localeCompare(String(a.end)); }), '<p class="ap-note">Tài khoản <b>' + esc(t.user) + '</b>: gồm bài làm trên máy này và trên các máy khác.</p>');
    }).catch(function () { ve(cuc, '<p class="ap-note">Không kết nối được máy chủ — đang hiện bài trên máy này.</p>'); });
    function ganTK() { var a = $('#h-tk'); if (a) a.onclick = function (e) { e.preventDefault(); hsDangNhap(history); }; }
  }

  // ---------------------------------------------------------------- GIÁO VIÊN
  var TOKEN = sessionStorage.getItem('gv_token') || '';
  function teacherLogin() {
    if (TOKEN) return admin();
    shell('<section class="ap-card ap-login"><h1>Giáo viên đăng nhập</h1>' +
      '<label>Tên đăng nhập<input id="g-u" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label><label>Mật khẩu<input id="g-p" type="password" autocomplete="current-password"></label>' +
      '<button class="er-btn er-btn-y er-big" id="g-go">Đăng nhập</button> <button class="er-btn" id="g-back">Quay lại</button><p id="g-msg" class="ap-note"></p></section>');
    $('#g-back').onclick = function () { home(); };
    var go = function () {
      $('#g-msg').textContent = 'Đang kiểm tra…';
      call('login', { user: $('#g-u').value.trim().toLowerCase(), pass: $('#g-p').value }).then(function (r) {
        if (r.ok) { TOKEN = r.token; sessionStorage.setItem('gv_token', TOKEN); admin(); } else $('#g-msg').textContent = r.error || 'Sai thông tin đăng nhập.';
      }).catch(function () { $('#g-msg').textContent = 'Không kết nối được máy chủ.'; });
    };
    $('#g-go').onclick = go; $('#g-p').onkeydown = function (e) { if (e.key === 'Enter') go(); };
  }
  function authFail(r) {
    if (r && r.auth === false) { TOKEN = ''; sessionStorage.removeItem('gv_token'); alert('Phiên đăng nhập đã hết hạn, thầy cô đăng nhập lại nhé.'); teacherLogin(); return true; }
    return false;
  }

  var ADM = { tab: 'kq', results: [], f: { khoi: '', de: '', lop: '', q: '' } };
  function admin(tab) {
    if (tab) ADM.tab = tab;
    var tabs = [['kq', 'Kết quả học sinh'], ['tk', 'Thống kê'], ['lh', '🩹 Lỗ hổng kiến thức'], ['vp', '🛡️ Vi phạm'], ['vip', '⭐ Mã kích hoạt'], ['tkh', '👥 Tài khoản'], ['qmk', '🔑 Quên mật khẩu'], ['dgv', '🧑‍🏫 Đề giáo viên'], ['de', 'Quản lí đề'], ['hd', 'Hướng dẫn']].map(function (t) {
      return '<button class="ap-tab' + (ADM.tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    shell('<nav class="ap-tabs">' + tabs + '</nav><div id="adm"></div>', { right: '<button class="er-btn" id="g-out">Đăng xuất</button>' });
    app.querySelectorAll('.ap-tab').forEach(function (b) { b.onclick = function () { admin(b.dataset.t); }; });
    $('#g-out').onclick = function () { TOKEN = ''; sessionStorage.removeItem('gv_token'); home(); };
    if (ADM.tab === 'kq' || ADM.tab === 'tk' || ADM.tab === 'lh') loadResults(); else if (ADM.tab === 'vp') viPhamAdmin(); else if (ADM.tab === 'vip') maAdmin(); else if (ADM.tab === 'tkh') tkAdmin(); else if (ADM.tab === 'qmk') qmkAdmin(); else if (ADM.tab === 'dgv') dgvAdmin(); else if (ADM.tab === 'de') manage(); else guide();
  }

  function loadResults() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải kết quả…</p>';
    call('results', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r.ok) { $('#adm').innerHTML = '<p class="ap-load">' + esc(r.error || 'Lỗi') + '</p>'; return; }
      ADM.results = (r.results || []).sort(function (a, b) { return String(b.nhan || b.nopLuc).localeCompare(String(a.nhan || a.nopLuc)); });
      // Chấm lại phần trắc nghiệm theo đáp án hiện có (không tin điểm do máy học sinh gửi lên)
      var ids = {}; ADM.results.forEach(function (x) { ids[x.maDe] = 1; });
      Promise.all(Object.keys(ids).map(function (id) { return getFull(id).catch(function () { return null; }); })).then(function (exs) {
        var m = {}; exs.forEach(function (e) { if (e) m[e.id] = e; });
        ADM.results.forEach(function (x) {
          var ex = m[x.maDe]; if (!ex) return;
          try {
            var A = typeof x.traLoi === 'string' ? JSON.parse(x.traLoi || '[]') : x.traLoi;
            var g = R.grade(ex, A);
            if (Math.abs(g.auto - (+x.diemTN)) > 1e-6) { x.diemGui = x.diemTN; x.diemTN = g.auto; x.lech = true; }
            x.toiDaTN = g.maxAuto;
          } catch (e) { }
        });
        if (ADM.tab === 'kq') results(); else if (ADM.tab === 'lh') loHong(); else stats();
      });
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }

  function total(r) { return r.diemTL === '' || r.diemTL == null ? null : Math.round((+r.diemTN + +r.diemTL) * 100) / 100; }
  function filtered() {
    var f = ADM.f;
    return ADM.results.filter(function (r) {
      return (!f.khoi || String(r.khoi) === f.khoi) && (!f.de || r.maDe === f.de) && (!f.lop || String(r.lop).toUpperCase().indexOf(f.lop.toUpperCase()) >= 0) &&
        (!f.q || String(r.hoTen).toLowerCase().indexOf(f.q.toLowerCase()) >= 0);
    });
  }
  function filterBar() {
    var des = {}; ADM.results.forEach(function (r) { des[r.maDe] = r.tenDe; });
    var f = ADM.f;
    return '<div class="ap-fbar"><select id="f-khoi"><option value="">Tất cả khối</option>' + [10, 11, 12].map(function (k) { return '<option' + (f.khoi == k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select>' +
      '<select id="f-de"><option value="">Tất cả đề</option>' + Object.keys(des).sort().map(function (k) { return '<option value="' + esc(k) + '"' + (f.de === k ? ' selected' : '') + '>' + esc(des[k]) + '</option>'; }).join('') + '</select>' +
      '<input id="f-lop" placeholder="Lớp" value="' + esc(f.lop) + '" size="6"><input id="f-q" placeholder="Tìm họ tên" value="' + esc(f.q) + '">' +
      '<button class="er-btn" id="f-reload">Tải lại</button><button class="er-btn er-btn-y" id="f-csv">Xuất Excel (CSV)</button></div>';
  }
  function bindFilter(after) {
    ['khoi', 'de', 'lop', 'q'].forEach(function (k) {
      var el = $('#f-' + k); el.oninput = el.onchange = function () { ADM.f[k] = el.value; after(); };
    });
    $('#f-reload').onclick = loadResults;
    $('#f-csv').onclick = csv;
  }
  function results() {
    var L = filtered();
    var rows = L.map(function (r, i) {
      var t = total(r);
      return '<tr><td>' + new Date(r.nhan || r.nopLuc).toLocaleString('vi-VN') + '</td><td>' + esc(r.hoTen) + '</td><td>' + esc(r.lop) + '</td><td>' + esc(r.truong) + '</td><td>' + esc(r.tenDe) +
        '</td><td><b>' + fmt(+r.diemTN) + '</b>/' + fmt(+r.toiDaTN) + (r.lech ? ' <span class="ap-pend" title="Điểm được chấm lại theo đáp án hiện tại (điểm gửi lên: ' + fmt(+r.diemGui) + ')">*</span>' : '') + '</td><td>' + (+r.toiDaTL ? (r.diemTL === '' || r.diemTL == null ? '<span class="ap-pend">chờ chấm</span>' : fmt(+r.diemTL)) : '—') +
        '</td><td><b>' + (+r.toiDaTL ? (t == null ? '—' : fmt(t)) : fmt(+r.diemTN)) + '</b></td><td>' + (+r.viPham ? '<span class="ap-tt bad" title="Số lần vi phạm quy chế' + (+r.lamLai ? '; bị làm lại ' + r.lamLai + ' lần' : '') + '">⚠ ' + r.viPham + '</span>' : '') + '</td><td><button class="er-btn ap-sm" data-i="' + i + '">Xem</button></td></tr>';
    }).join('');
    $('#adm').innerHTML = filterBar() + '<p class="ap-note">' + L.length + ' lượt làm bài.</p><div class="ap-tw"><table class="ap-t"><tr><th>Nộp lúc</th><th>Họ tên</th><th>Lớp</th><th>Trường</th><th>Đề</th><th>Trắc nghiệm</th><th>Tự luận</th><th>Tổng</th><th>Vi phạm</th><th></th></tr>' + rows + '</table></div>';
    bindFilter(results);
    app.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { detail(L[+b.dataset.i]); }; });
  }

  function csv() {
    var L = filtered();
    var head = ['Nộp lúc', 'Họ và tên', 'Lớp', 'Trường', 'Mã đề', 'Tên đề', 'Điểm trắc nghiệm', 'Tối đa TN', 'Điểm tự luận', 'Tổng điểm', 'Thời gian làm (phút)', 'Số lần vi phạm', 'Số lần bị làm lại', 'Tài khoản'];
    var lines = [head].concat(L.map(function (r) {
      var t = total(r);
      return [new Date(r.nhan || r.nopLuc).toLocaleString('vi-VN'), r.hoTen, r.lop, r.truong, r.maDe, r.tenDe, fmt(+r.diemTN), fmt(+r.toiDaTN), r.diemTL === '' || r.diemTL == null ? '' : fmt(+r.diemTL),
        +r.toiDaTL ? (t == null ? '' : fmt(t)) : fmt(+r.diemTN), Math.round((+r.giay || 0) / 60), +r.viPham || 0, +r.lamLai || 0, r.taiKhoan || ''];
    }));
    var s = '﻿' + lines.map(function (row) { return row.map(function (c) { c = String(c == null ? '' : c); return /[";,\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = 'ket-qua-lam-bai.csv'; a.click();
  }

  function modal(html) {
    var m = document.createElement('div'); m.className = 'ap-modal';
    m.innerHTML = '<div class="ap-modal-in"><button class="ap-x" aria-label="Đóng">×</button>' + html + '</div>';
    document.body.appendChild(m);
    m.querySelector('.ap-x').onclick = function () { m.remove(); };
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    return m;
  }

  function detail(r) {
    getFull(r.maDe).then(function (ex) { showDetail(r, ex); }).catch(function () { showDetail(r, null); });
  }
  function showDetail(r, ex) {
    var ans = typeof r.traLoi === 'string' ? JSON.parse(r.traLoi || '[]') : (r.traLoi || []);
    var h = '<h2>' + esc(r.hoTen) + ' · ' + esc(r.lop) + ' · ' + esc(r.truong) + '</h2><p>' + esc(r.tenDe) + ' · nộp lúc ' + new Date(r.nhan || r.nopLuc).toLocaleString('vi-VN') +
      ' · làm trong ' + Math.round((+r.giay || 0) / 60) + ' phút</p><p>Điểm trắc nghiệm: <b>' + fmt(+r.diemTN) + '</b>/' + fmt(+r.toiDaTN) + '</p>';
    if (!ex) { h += '<p class="ap-note">Không tải được đề gốc để đối chiếu đáp án.</p>'; modal(h); return; }
    if (r.ver && ex.ver && r.ver !== ex.ver) h += '<p class="ap-warn2">Lưu ý: đề đã được sửa sau khi học sinh nộp bài; bảng đối chiếu dưới đây dùng đáp án hiện tại.</p>';
    var essays = [];
    ex.parts.forEach(function (p, pi) {
      var a = ans[pi] || [];
      h += '<h3>' + R.PART_NAME[p.type] + '</h3>';
      if (p.type === 'mc') {
        h += '<div class="ap-tw"><table class="ap-t ap-c"><tr><th>Câu</th>' + p.qs.map(function (q, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '</tr><tr><th>HS chọn</th>' +
          p.qs.map(function (q, i) { var x = a[i]; return '<td class="' + (x === q.ans ? 'ok' : 'bad') + '">' + (x == null ? '—' : 'ABCD'[x]) + '</td>'; }).join('') + '</tr><tr><th>Đáp án</th>' +
          p.qs.map(function (q) { return '<td>' + 'ABCD'[q.ans] + '</td>'; }).join('') + '</tr></table></div>';
      } else if (p.type === 'tf') {
        h += '<div class="ap-tw"><table class="ap-t ap-c"><tr><th>Câu</th><th>a)</th><th>b)</th><th>c)</th><th>d)</th><th>Điểm</th></tr>' + p.qs.map(function (q, i) {
          var x = a[i] || [], k = 0;
          var cells = q.items.map(function (it, j) { var ok = x[j] === it.ans; if (ok) k++; return '<td class="' + (ok ? 'ok' : 'bad') + '">' + (x[j] == null ? '—' : (x[j] ? 'Đ' : 'S')) + ' <small>(' + (it.ans ? 'Đ' : 'S') + ')</small></td>'; }).join('');
          return '<tr><th>' + (i + 1) + '</th>' + cells + '<td>' + fmt(R.tfScore(k) * p.pts) + '</td></tr>';
        }).join('') + '</table></div>';
      } else if (p.type === 'sa') {
        h += '<div class="ap-tw"><table class="ap-t ap-c"><tr><th>Câu</th>' + p.qs.map(function (q, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '</tr><tr><th>HS trả lời</th>' +
          p.qs.map(function (q, i) { var x = a[i]; var ok = Math.abs(R.parseNum(x) - R.parseNum(q.ans)) < 1e-9; return '<td class="' + (ok ? 'ok' : 'bad') + '">' + esc(x || '—') + '</td>'; }).join('') + '</tr><tr><th>Đáp án</th>' +
          p.qs.map(function (q) { return '<td>' + esc(q.ans) + '</td>'; }).join('') + '</tr></table></div>';
      } else {
        var ct = typeof r.chiTietTL === 'string' ? (r.chiTietTL ? JSON.parse(r.chiTietTL) : []) : (r.chiTietTL || []);
        p.qs.forEach(function (q, i) {
          essays.push(q);
          h += '<div class="ap-es"><div><b>Câu ' + (i + 1) + '</b> (' + fmt(q.pts || p.pts) + ' điểm): ' + R.tex(q.stem) + '</div><div class="er-pre ap-box">' + esc(a[i] || (anhCua(r, pi, i).length ? '(học sinh gửi ảnh bài làm bên dưới)' : '(học sinh không gõ bài làm — chấm trên bài giấy)')) + '</div>' +
            '<details><summary>Hướng dẫn chấm</summary><table class="er-table er-rub">' + q.sol.map(function (s) { return '<tr><td style="text-align:left">' + R.tex(s.t) + '</td><td>' + fmt(s.p) + '</td></tr>'; }).join('') + '</table></details>' +
            hopAnh(anhCua(r, pi, i)) +
            '<label>Điểm câu ' + (i + 1) + ': <input type="number" class="ap-esin" min="0" max="' + (q.pts || p.pts) + '" step="0.25" value="' + (ct[i] != null ? ct[i] : '') + '"></label></div>';
        });
      }
    });
    if (essays.length) h += '<label>Nhận xét: <input id="ap-note" value="' + esc(r.ghiChu || '') + '" style="width:100%"></label><p><button class="er-btn er-btn-y" id="ap-save">Lưu điểm tự luận</button></p>';
    h += '<p><button class="er-btn ap-del" id="ap-del">Xoá lượt làm bài này</button></p>';
    var m = modal(h);
    napAnh(m, { token: TOKEN });
    var sv = m.querySelector('#ap-save');
    if (sv) sv.onclick = function () {
      var pts = [].map.call(m.querySelectorAll('.ap-esin'), function (i) { return i.value === '' ? null : Math.max(0, Math.min(+i.max, +i.value)); });
      if (pts.some(function (x) { return x === null; })) return alert('Thầy cô nhập đủ điểm các câu tự luận nhé.');
      var s = Math.round(pts.reduce(function (a, b) { return a + b; }, 0) * 100) / 100;
      call('grade', { token: TOKEN, ma: r.ma, diemTL: s, chiTietTL: pts, ghiChu: m.querySelector('#ap-note').value }).then(function (x) {
        if (authFail(x)) return;
        if (x.ok) { r.diemTL = s; r.chiTietTL = pts; m.remove(); results(); } else alert(x.error || 'Lỗi lưu điểm');
      });
    };
    m.querySelector('#ap-del').onclick = function () {
      if (!confirm('Xoá hẳn lượt làm bài này?')) return;
      call('deleteResult', { token: TOKEN, ma: r.ma }).then(function (x) { if (authFail(x)) return; ADM.results = ADM.results.filter(function (y) { return y.ma !== r.ma; }); m.remove(); results(); });
    };
  }

  // ---- ảnh bài làm tự luận (Google Drive của Ban quản trị): tải qua máy chủ, bấm để xem cỡ lớn
  function anhCua(r, pi, qi) { try { return (JSON.parse(r.anhTL || '{}')[pi + '_' + qi]) || []; } catch (e) { return []; } }
  function hopAnh(ids) {
    if (!ids.length) return '';
    return '<div class="ap-anh"><b>📷 Ảnh bài làm (' + ids.length + '):</b><div class="ap-anh-ds">' + ids.map(function (id) { return '<a href="#" class="ap-anh-o" data-anh="' + esc(id) + '"><span>⏳</span></a>'; }).join('') + '</div></div>';
  }
  function napAnh(host, quyen) {
    host.querySelectorAll('[data-anh]').forEach(function (a) {
      call('xemAnh', Object.assign({ id: a.dataset.anh }, quyen)).then(function (r) {
        if (!r || !r.ok) { a.innerHTML = '<span>' + esc((r && r.error) || 'Lỗi') + '</span>'; return; }
        a.innerHTML = '<img src="' + r.du + '" alt="Ảnh bài làm">';
        a.onclick = function (e) {
          e.preventDefault();
          var w = modal('<img src="' + r.du + '" style="width:100%;height:auto" alt="Ảnh bài làm"><p><a class="er-btn" href="' + r.du + '" download="bai-lam.jpg">💾 Lưu ảnh</a></p>');
          w.querySelector('.ap-modal-in').classList.add('kd-rong');
        };
      }).catch(function () { a.innerHTML = '<span>Lỗi mạng</span>'; });
    });
  }
  window.APP_ANH = { hopAnh: hopAnh, napAnh: napAnh, anhCua: anhCua };
  function stats() {
    var L = filtered();
    var by = {};
    L.forEach(function (r) { (by[r.maDe] = by[r.maDe] || []).push(r); });
    var h = filterBar() + '<p class="ap-note">Chọn một đề để xem tỉ lệ đúng từng câu. Câu có tỉ lệ đúng dưới 50% nên chữa chung trên lớp.</p>';
    h += '<div class="ap-tw"><table class="ap-t"><tr><th>Đề</th><th>Lượt làm</th><th>Điểm TN trung bình</th><th>Cao nhất</th><th>Thấp nhất</th></tr>' + Object.keys(by).sort().map(function (k) {
      var a = by[k].map(function (r) { return +r.diemTN; });
      return '<tr><td><a href="#" data-de="' + esc(k) + '">' + esc(by[k][0].tenDe) + '</a></td><td>' + a.length + '</td><td>' + fmt(a.reduce(function (x, y) { return x + y; }, 0) / a.length) + '</td><td>' + fmt(Math.max.apply(0, a)) + '</td><td>' + fmt(Math.min.apply(0, a)) + '</td></tr>';
    }).join('') + '</table></div><div id="tk-de"></div>';
    $('#adm').innerHTML = h;
    bindFilter(stats);
    app.querySelectorAll('[data-de]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); statDe(a.dataset.de, by[a.dataset.de]); }; });
    if (ADM.f.de && by[ADM.f.de]) statDe(ADM.f.de, by[ADM.f.de]);
  }
  function statDe(id, rows) {
    getFull(id).then(function (ex) {
      var h = '<h3>' + esc(ex.title) + ' — ' + rows.length + ' lượt</h3>';
      ex.parts.forEach(function (p, pi) {
        if (p.type === 'es') return;
        h += '<h4>' + R.PART_NAME[p.type] + '</h4><div class="ap-bars">';
        p.qs.forEach(function (q, qi) {
          var ok = 0, pick = [0, 0, 0, 0];
          rows.forEach(function (r) {
            var A = typeof r.traLoi === 'string' ? JSON.parse(r.traLoi || '[]') : r.traLoi;
            var a = (A[pi] || [])[qi];
            if (p.type === 'mc') { if (a === q.ans) ok++; if (a != null) pick[a]++; }
            else if (p.type === 'tf') { if (a && q.items.every(function (it, j) { return a[j] === it.ans; })) ok++; }
            else if (Math.abs(R.parseNum(a) - R.parseNum(q.ans)) < 1e-9) ok++;
          });
          var pc = Math.round(ok * 100 / rows.length);
          var extra = p.type === 'mc' ? ' <small>A:' + pick[0] + ' B:' + pick[1] + ' C:' + pick[2] + ' D:' + pick[3] + ' (đúng: ' + 'ABCD'[q.ans] + ')</small>' : '';
          h += '<div class="ap-bar"><span>Câu ' + (qi + 1) + '</span><div class="ap-bar-t"><div class="ap-bar-f' + (pc < 50 ? ' low' : '') + '" style="width:' + pc + '%"></div></div><b>' + pc + '%</b>' + extra + '</div>';
        });
        h += '</div>';
      });
      $('#tk-de').innerHTML = h;
    });
  }

  // ---------------------------------------------------------------- 🩹 LỖ HỔNG KIẾN THỨC
  // Gom mọi lượt làm (theo bộ lọc) -> tỉ lệ sai theo bài học, yêu cầu cần đạt, mức độ; gợi ý vá cho cả lớp và từng em.
  var MUC = { B: 'Biết', H: 'Hiểu', VD: 'Vận dụng' };
  var LH = { bai: '', hs: '' };
  function soBai(nd) { var m = /Bài\s*(\d+)/.exec(nd || ''); return m ? +m[1] : null; }
  function linkHoc(khoi, nd) { var b = soBai(nd); return b ? '../../hoc-theo-bai.html?lop=' + khoi + '&bai=' + b : null; }
  function gomLoHong(rows) {
    var ids = {}; rows.forEach(function (r) { ids[r.maDe] = 1; });
    return Promise.all(Object.keys(ids).map(function (id) { return getFull(id).catch(function () { return null; }); })).then(function (exs) {
      var E = {}; exs.forEach(function (e) { if (e) E[e.id] = e; });
      var bai = {};        // nd -> {nd, cd, khoi, n, sai, muc:{B:[n,sai]}, yc:{}, cau:{key:{n,sai,de,so}}, hs:{ten:[n,sai]}}
      var hs = {};         // tên|lớp -> {nd: [n, sai]}
      rows.forEach(function (r) {
        var ex = E[r.maDe]; if (!ex) return;
        var A; try { A = typeof r.traLoi === 'string' ? JSON.parse(r.traLoi || '[]') : r.traLoi; } catch (e) { return; }
        var ten = r.hoTen + ' · ' + r.lop;
        ex.parts.forEach(function (p, pi) {
          if (p.type === 'es') return;
          p.qs.forEach(function (q, qi) {
            var m = q.m || {}, nd = m.nd || '(chưa gắn bài)', a = (A[pi] || [])[qi];
            var muc = String(m.muc || '').split(',');
            var thu = [];   // các ý được chấm: [đúng?, mức]
            if (p.type === 'mc') thu.push([a === q.ans, muc[0]]);
            else if (p.type === 'sa') thu.push([Math.abs(R.parseNum(a) - R.parseNum(q.ans)) < 1e-9, muc[0]]);
            else q.items.forEach(function (it, j) { thu.push([!!a && a[j] === it.ans, muc[j] || muc[0]]); });
            var b = bai[nd] = bai[nd] || { nd: nd, cd: m.cd || '', khoi: ex.khoi, n: 0, sai: 0, muc: {}, yc: {}, cau: {}, hs: {} };
            var ck = ex.id + '|' + pi + '|' + qi, c = b.cau[ck] = b.cau[ck] || { n: 0, sai: 0, de: ex.title, so: (['I', 'II', 'III'][pi] || '') + '.' + (qi + 1), stem: q.stem };
            var h = hs[ten] = hs[ten] || {}; h[nd] = h[nd] || [0, 0];
            var bh = b.hs[ten] = b.hs[ten] || [0, 0];
            thu.forEach(function (t) {
              var sai = t[0] ? 0 : 1, mu = t[1] || '?';
              b.n++; b.sai += sai; c.n++; c.sai += sai; h[nd][0]++; h[nd][1] += sai; bh[0]++; bh[1] += sai;
              var mm = b.muc[mu] = b.muc[mu] || [0, 0]; mm[0]++; mm[1] += sai;
              if (m.yc) { var y = b.yc[m.yc] = b.yc[m.yc] || [0, 0]; y[0]++; y[1] += sai; }
            });
          });
        });
      });
      return { bai: bai, hs: hs };
    });
  }
  function pc(x) { return x[0] ? Math.round(x[1] * 100 / x[0]) : 0; }
  function thanh(p) { return '<div class="ap-bar-t"><div class="ap-bar-f' + (p >= 50 ? ' low' : '') + '" style="width:' + p + '%"></div></div><b>' + p + '%</b>'; }
  function loHong() {
    var L = filtered();
    $('#adm').innerHTML = filterBar() + '<p class="ap-load">Đang phân tích ' + L.length + ' lượt làm bài…</p>';
    bindFilter(loHong);
    if (!L.length) { $('#adm').querySelector('.ap-load').textContent = 'Chưa có lượt làm bài nào khớp bộ lọc.'; return; }
    gomLoHong(L).then(function (G) {
      var ds = Object.keys(G.bai).map(function (k) { return G.bai[k]; }).filter(function (b) { return b.n >= 1; })
        .sort(function (a, b) { return pc([b.n, b.sai]) - pc([a.n, a.sai]) || b.n - a.n; });
      var tong = ds.reduce(function (s, b) { return [s[0] + b.n, s[1] + b.sai]; }, [0, 0]);
      var tenHS = Object.keys(G.hs).sort();
      var h = filterBar() +
        '<div class="ap-lh-tom"><div><b>' + L.length + '</b><span>lượt làm bài</span></div><div><b>' + tenHS.length + '</b><span>học sinh</span></div><div><b>' + (100 - pc(tong)) + '%</b><span>ý trả lời đúng</span></div>' +
        '<div><b>' + ds.filter(function (b) { return pc([b.n, b.sai]) >= 50; }).length + '</b><span>bài học sai ≥ 50%</span></div></div>' +
        '<p class="ap-note">Tỉ lệ sai tính trên từng ý được chấm (mỗi câu nhiều lựa chọn, trả lời ngắn là 1 ý; mỗi câu đúng – sai là 4 ý). Bài học đỏ (sai từ 50%) nên dạy lại trên lớp; bấm tên bài để xem câu sai nhiều và các em cần kèm.</p>' +
        '<div class="ap-fbar"><label>Xem lỗ hổng của một em: <select id="lh-hs"><option value="">— cả nhóm đang lọc —</option>' + tenHS.map(function (t) { return '<option' + (LH.hs === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
        '<button class="er-btn" id="lh-csv">Xuất Excel (CSV)</button></div><div id="lh-hs-ct"></div>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Bài học</th><th>Số ý đã làm</th><th style="min-width:180px">Tỉ lệ sai</th><th>Theo mức độ (sai)</th><th>Vá lỗ hổng</th></tr>' +
        ds.map(function (b, i) {
          var lk = linkHoc(b.khoi, b.nd);
          return '<tr class="' + (pc([b.n, b.sai]) >= 50 ? 'ap-lh-do' : '') + '"><td><a href="#" data-b="' + i + '">' + R.tex(b.nd) + '</a><br><small>' + esc(b.cd) + '</small></td><td>' + b.n + '</td><td><div class="ap-bar">' + thanh(pc([b.n, b.sai])) + '</div></td><td>' +
            ['B', 'H', 'VD'].filter(function (k) { return b.muc[k]; }).map(function (k) { return MUC[k] + ' ' + pc(b.muc[k]) + '%'; }).join(' · ') + '</td><td>' +
            (lk ? '<a class="er-btn ap-sm" target="_top" href="' + lk + '">📘 Học lại bài</a>' : '') + '</td></tr>';
        }).join('') + '</table></div><div id="lh-ct"></div>';
      $('#adm').innerHTML = h;
      bindFilter(loHong); $('#f-csv').style.display = 'none';
      app.querySelectorAll('[data-b]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); chiTietBai(ds[+a.dataset.b]); }; });
      var chonHS = function () {
        var t = $('#lh-hs').value; LH.hs = t; var box = $('#lh-hs-ct');
        if (!t) { box.innerHTML = ''; return; }
        var m = G.hs[t] || {}, ks = Object.keys(m).filter(function (k) { return m[k][1]; }).sort(function (a, b) { return pc(m[b]) - pc(m[a]); });
        box.innerHTML = '<div class="ap-card ap-lh-em"><h3>🎯 ' + esc(t) + '</h3>' + (ks.length ? '<p>Các bài em này còn hổng (sai nhiều nhất trước):</p><ol>' + ks.slice(0, 8).map(function (k) {
          var lk = linkHoc(G.bai[k] && G.bai[k].khoi, k);
          return '<li>' + R.tex(k) + ' — sai <b>' + m[k][1] + '/' + m[k][0] + '</b> ý (' + pc(m[k]) + '%)' + (lk ? ' · <a target="_top" href="' + lk + '">học lại</a>' : '') + '</li>';
        }).join('') + '</ol>' : '<p>Em này chưa sai ý nào trong các bài đã lọc. 👏</p>') + '</div>';
      };
      $('#lh-hs').onchange = chonHS; chonHS();
      $('#lh-csv').onclick = function () {
        var rows = [['Bài học', 'Chương', 'Số ý đã làm', 'Số ý sai', 'Tỉ lệ sai (%)', 'Sai - Biết (%)', 'Sai - Hiểu (%)', 'Sai - Vận dụng (%)']].concat(ds.map(function (b) {
          return [b.nd, b.cd, b.n, b.sai, pc([b.n, b.sai]), b.muc.B ? pc(b.muc.B) : '', b.muc.H ? pc(b.muc.H) : '', b.muc.VD ? pc(b.muc.VD) : ''];
        }));
        taiCSV(rows, 'lo-hong-kien-thuc.csv');
      };
    });
  }
  function chiTietBai(b) {
    var cau = Object.keys(b.cau).map(function (k) { return b.cau[k]; }).sort(function (x, y) { return pc([y.n, y.sai]) - pc([x.n, x.sai]); });
    var em = Object.keys(b.hs).map(function (k) { return [k, b.hs[k]]; }).filter(function (x) { return x[1][1]; }).sort(function (x, y) { return pc(y[1]) - pc(x[1]) || y[1][1] - x[1][1]; });
    var yc = Object.keys(b.yc).sort(function (x, y) { return pc(b.yc[y]) - pc(b.yc[x]); });
    var lk = linkHoc(b.khoi, b.nd);
    modal('<h2>🩹 ' + R.tex(b.nd) + '</h2><p>' + esc(b.cd) + ' · sai ' + b.sai + '/' + b.n + ' ý (' + pc([b.n, b.sai]) + '%)</p>' +
      (lk ? '<p><a class="er-btn er-btn-y" target="_top" href="' + lk + '">📘 Mở trang Học theo bài (sơ đồ, infographic, sổ tay) để chữa bài</a></p>' : '') +
      (yc.length ? '<h3>Yêu cầu cần đạt</h3><div class="ap-bars">' + yc.map(function (y) { return '<div class="ap-bar yc"><span>' + esc(y) + '</span>' + thanh(pc(b.yc[y])) + '</div>'; }).join('') + '</div>' : '') +
      '<h3>Câu sai nhiều nhất</h3><div class="ap-tw"><table class="ap-t"><tr><th>Đề</th><th>Câu</th><th>Nội dung</th><th>Sai</th></tr>' + cau.slice(0, 12).map(function (c) {
        return '<tr><td>' + esc(c.de) + '</td><td>' + c.so + '</td><td>' + R.tex(String(c.stem)) + '</td><td><b>' + pc([c.n, c.sai]) + '%</b> (' + c.sai + '/' + c.n + ')</td></tr>';
      }).join('') + '</table></div>' +
      '<h3>Các em cần kèm thêm</h3>' + (em.length ? '<ol>' + em.slice(0, 20).map(function (x) { return '<li>' + esc(x[0]) + ' — sai ' + x[1][1] + '/' + x[1][0] + ' ý (' + pc(x[1]) + '%)</li>'; }).join('') + '</ol>' : '<p>Không có em nào sai.</p>'));
  }
  function taiCSV(lines, ten) {
    var s = '﻿' + lines.map(function (row) { return row.map(function (c) { c = String(c == null ? '' : c); return /[";,\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = ten; a.click();
  }

  // ---------------------------------------------------------------- 🛡️ VI PHẠM QUY CHẾ PHÒNG THI
  function viPhamAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải danh sách vi phạm…</p>';
    call('viPhamDS', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r || !r.ok) { $('#adm').innerHTML = '<p class="ap-load">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ — quản trị dán bản Code.gs mới và triển khai phiên bản mới.') + '</p>'; return; }
      var ds = (r.ds || []).sort(function (a, b) { return String(b.luc).localeCompare(String(a.luc)); });
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">🛡️ Vi phạm quy chế phòng thi</h2><p class="ap-note">Ghi lại mỗi lần học sinh chuyển tab, rời trang hoặc thoát toàn màn hình khi đang làm bài. Lần 1: cảnh báo. Từ lần 2: bài bị huỷ, làm lại từ đầu.</p>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Lúc</th><th>Họ tên</th><th>Lớp</th><th>Trường</th><th>Đề</th><th>Lần</th><th>Hành vi</th><th>Xử lý</th></tr>' +
        (ds.map(function (x) {
          return '<tr><td>' + new Date(x.luc).toLocaleString('vi-VN') + '</td><td>' + esc(x.hoTen) + '</td><td>' + esc(x.lop) + '</td><td>' + esc(x.truong) + '</td><td>' + esc(x.tenDe) + '</td><td><b>' + esc(x.lan) + '</b></td><td>' + esc(x.hanhVi) + '</td><td><span class="ap-tt ' + (/Huỷ/.test(x.xuLy) ? 'bad' : 'cho') + '">' + esc(x.xuLy) + '</span></td></tr>';
        }).join('') || '<tr><td colspan="8">Chưa có vi phạm nào.</td></tr>') + '</table></div></section>';
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }


  // ---------------------------------------------------------------- 👥 TÀI KHOẢN NGƯỜI DÙNG
  var TKF = { q: '', vai: '' };
  // 🔑 Yêu cầu quên mật khẩu: người dùng chuyển phí → quản trị bấm "Đã nhận phí, gửi mã" → mã 6 số gửi về Gmail của họ
  function qmkAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải yêu cầu…</p>';
    call('qmkDanhSach', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r || !r.ok) { $('#adm').innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ — dán MAY-CHU_Code.gs mới.') + '</p>'; return; }
      var cho = r.ds.filter(function (x) { return x.trangThai === 'Chờ thu phí'; }).length;
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">🔑 Quên mật khẩu</h2><p class="ap-note">Phí mỗi lần: <b>' + Number(r.phi || 0).toLocaleString('vi-VN') + ' đồng</b>. Khi đã nhận phí (người dùng nhắn kèm mã yêu cầu QMK-…), bấm <b>✅ Đã nhận phí, gửi mã</b> — máy gửi mã 6 số về Gmail của họ (hiệu lực 15 phút). Hôm nay còn gửi được <b>' + r.conThu + '</b> thư.</p>' +
        '<p>Đang chờ thu phí: <b>' + cho + '</b></p><div class="ap-tw"><table class="ap-t"><tr><th>Mã yêu cầu</th><th>Lúc</th><th>Tài khoản</th><th>Họ tên</th><th>Gmail</th><th>Số điện thoại</th><th>Trạng thái</th><th></th></tr>' +
        (r.ds.map(function (x, i) {
          return '<tr><td><b class="ap-ma">' + esc(x.ma) + '</b></td><td>' + new Date(x.luc).toLocaleString('vi-VN') + '</td><td>' + esc(x.user) + '</td><td>' + esc(x.hoTen) + '</td><td>' + esc(x.email) + '</td><td>' + esc(x.sdt) + '</td><td><span class="ap-tt ' + (x.trangThai === 'Chờ thu phí' ? 'cho' : 'ok') + '">' + esc(x.trangThai) + '</span></td>' +
            '<td class="ap-act">' + (x.trangThai === 'Chờ thu phí' || x.trangThai === 'Đã gửi mã' ? '<button class="er-btn er-btn-y ap-sm" data-a="gui" data-i="' + i + '">' + (x.trangThai === 'Đã gửi mã' ? '↻ Gửi lại mã' : '✅ Đã nhận phí, gửi mã') + '</button><button class="er-btn ap-sm" data-a="huy" data-i="' + i + '">Huỷ</button>' : '') + '</td></tr>';
        }).join('') || '<tr><td colspan="8">Chưa có yêu cầu nào.</td></tr>') + '</table></div></section>';
      $('#adm').querySelectorAll('[data-a]').forEach(function (b) {
        b.onclick = function () {
          var x = r.ds[+b.dataset.i];
          if (b.dataset.a === 'huy' && !confirm('Huỷ yêu cầu ' + x.ma + '?')) return;
          b.disabled = true;
          call(b.dataset.a === 'gui' ? 'qmkDuyet' : 'qmkHuy', { token: TOKEN, ma: x.ma }).then(function (k) { if (k && k.ok) { if (b.dataset.a === 'gui') alert('✔ Đã gửi mã về Gmail ' + x.email); qmkAdmin(); } else { b.disabled = false; alert((k && k.error) || 'Lỗi'); } });
        };
      });
    });
  }
  function tkAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải danh sách tài khoản…</p>';
    call('tkDanhSach', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r || !r.ok) { $('#adm').innerHTML = '<p class="ap-load">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ — quản trị dán bản Code.gs mới.') + '</p>'; return; }
      var ds = (r.ds || []).sort(function (a, b) { return String(b.ngay).localeCompare(String(a.ngay)); });
      var dem = {}; ds.forEach(function (x) { dem[x.vaiTro] = (dem[x.vaiTro] || 0) + 1; });
      var L = ds.filter(function (x) { return (!TKF.vai || x.vaiTro === TKF.vai) && (!TKF.q || (x.user + ' ' + x.hoTen + ' ' + x.lop + ' ' + x.truong + ' ' + (x.email || '') + ' ' + (x.sdt || '')).toLowerCase().indexOf(TKF.q.toLowerCase()) >= 0); });
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">👥 Tài khoản người dùng</h2><p class="ap-note">Tổng ' + ds.length + ' tài khoản · ' + Object.keys(dem).map(function (k) { return esc(k) + ': ' + dem[k]; }).join(' · ') +
        '. Mật khẩu được băm nên không ai xem được; người dùng quên mật khẩu thì quản trị bấm <b>Đặt lại mật khẩu</b> rồi báo mật khẩu mới cho em đó.</p>' +
        '<div class="ap-fbar"><select id="t-vai"><option value="">Tất cả vai trò</option>' + ['Học sinh', 'Giáo viên', 'Phụ huynh', 'Khác', 'Quản trị'].map(function (v) { return '<option' + (TKF.vai === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>' +
        '<input id="t-q" placeholder="Tìm tên, tài khoản, lớp…" value="' + esc(TKF.q) + '"><button class="er-btn" id="t-reload">Tải lại</button><button class="er-btn er-btn-y" id="t-qt">👑 Tạo tài khoản quản trị</button></div>' +
        '<p class="ap-note">👑 <b>Quản trị</b>: dùng mọi chức năng giáo viên, mở mọi đề VIP, tải mọi đề Word, phiếu tô màu, tạo đề, xem kết quả, lưu bài vẽ, tạo lớp <b>không giới hạn</b> — dùng để trình diễn sản phẩm. Không hiện trên bảng vàng. Nâng một tài khoản có sẵn: bấm <b>Đổi vai trò</b> → gõ <b>Quản trị</b>. Người dùng đăng xuất rồi đăng nhập lại để nhận quyền mới.</p>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Tài khoản</th><th>Họ tên</th><th>Vai trò</th><th>Lớp</th><th>Trường</th><th>Gmail</th><th>Số điện thoại</th><th>Tạo lúc</th><th>Đăng nhập cuối</th><th></th></tr>' +
        (L.map(function (x, i) {
          return '<tr><td><b>' + esc(x.user) + '</b></td><td>' + esc(x.hoTen) + '</td><td>' + esc(x.vaiTro) + '</td><td>' + esc(x.lop) + '</td><td>' + esc(x.truong) + '</td><td>' + esc(x.email || '') + '</td><td>' + esc(x.sdt || '') + '</td><td>' + (x.ngay ? new Date(x.ngay).toLocaleDateString('vi-VN') : '') +
            '</td><td>' + (x.cuoi ? new Date(x.cuoi).toLocaleString('vi-VN') : '') + '</td><td class="ap-act"><button class="er-btn ap-sm" data-dl="' + i + '">🔑 Đặt lại mật khẩu</button><button class="er-btn ap-sm" data-vai="' + i + '">Đổi vai trò</button><button class="er-btn ap-sm" data-sua="' + i + '">✏️ Sửa</button></td></tr>';
        }).join('') || '<tr><td colspan="10">Chưa có tài khoản nào.</td></tr>') + '</table></div></section>';
      $('#t-vai').onchange = function () { TKF.vai = this.value; tkAdmin(); };
      $('#t-q').onchange = function () { TKF.q = this.value; tkAdmin(); };
      $('#t-reload').onclick = tkAdmin;
      $('#t-qt').onclick = function () {
        var u = prompt('Tên đăng nhập cho tài khoản QUẢN TRỊ (chữ thường không dấu, VD: quantri.demo):', ''); if (!u) return;
        var p = prompt('Mật khẩu (ít nhất 8 kí tự) — cô ghi nhớ mật khẩu này:', ''); if (!p) return;
        var h = prompt('Họ và tên hiển thị:', 'Quản trị Học Toán Thông Minh') || 'Quản trị';
        call('tkTaoQT', { token: TOKEN, user: u.trim().toLowerCase(), pass: p, hoTen: h }).then(function (r) {
          if (authFail(r)) return;
          if (r && r.ok) { alert('✔ Đã tạo tài khoản quản trị ' + u.trim().toLowerCase() + '. Đăng nhập ở trang web như tài khoản thường để dùng mọi chức năng không giới hạn.'); tkAdmin(); }
          else alert((r && r.error) || 'Máy chủ chưa hỗ trợ — dán bản MAY-CHU_Code.gs mới.');
        });
      };
      app.querySelectorAll('[data-vai]').forEach(function (b) {
        b.onclick = function () {
          var x = L[+b.dataset.vai], v = prompt('Vai trò mới cho ' + x.user + ' (' + x.hoTen + '): Học sinh / Giáo viên / Phụ huynh / Khác / Quản trị', x.vaiTro); if (!v) return;
          call('tkDoiVai', { token: TOKEN, user: x.user, vaiTro: v.trim() }).then(function (r) { if (authFail(r)) return; if (r && r.ok) tkAdmin(); else alert((r && r.error) || 'Lỗi'); });
        };
      });
      app.querySelectorAll('[data-sua]').forEach(function (b) {
        b.onclick = function () {
          var x = L[+b.dataset.sua];
          var m = modal('<h2>✏️ Sửa thông tin · ' + esc(x.user) + '</h2><p class="ap-note">Quản trị sửa trực tiếp, không cần mã xác thực. Để trống Gmail / số điện thoại nếu muốn xoá.</p>' +
            '<label>Họ và tên<input id="s-ten" value="' + esc(x.hoTen) + '"></label><label>Lớp<input id="s-lop" value="' + esc(x.lop) + '"></label><label>Trường<input id="s-tr" value="' + esc(x.truong) + '"></label>' +
            '<label>Gmail<input id="s-mail" type="email" value="' + esc(x.email || '') + '"></label><label>Số điện thoại<input id="s-sdt" type="tel" value="' + esc(x.sdt || '') + '"></label>' +
            '<p class="ap-warn2" id="s-loi" hidden></p><p><button class="er-btn er-btn-y" id="s-luu">💾 Lưu</button></p>');
          m.querySelector('#s-luu').onclick = function () {
            var bt = this; bt.disabled = true;
            call('tkSua', { token: TOKEN, user: x.user, hoTen: m.querySelector('#s-ten').value, lop: m.querySelector('#s-lop').value, truong: m.querySelector('#s-tr').value, email: m.querySelector('#s-mail').value, sdt: m.querySelector('#s-sdt').value }).then(function (r) {
              bt.disabled = false; if (authFail(r)) return;
              if (r && r.ok) { m.remove(); tkAdmin(); } else { var e = m.querySelector('#s-loi'); e.hidden = false; e.textContent = (r && r.auth === false) ? 'Máy chủ chưa hỗ trợ — dán bản MAY-CHU_Code.gs mới.' : ((r && r.error) || 'Lỗi'); }
            });
          };
        };
      });
      app.querySelectorAll('[data-dl]').forEach(function (b) {
        b.onclick = function () {
          var x = L[+b.dataset.dl], goiY = 'toan' + Math.floor(100000 + Math.random() * 900000);
          var mk = prompt('Mật khẩu mới cho tài khoản ' + x.user + ' (' + x.hoTen + '):', goiY); if (mk == null) return;
          call('tkDatLaiMK', { token: TOKEN, user: x.user, passMoi: mk }).then(function (r) {
            if (authFail(r)) return;
            if (r && r.ok) alert('Đã đặt lại. Quản trị báo cho ' + x.hoTen + ': tài khoản ' + x.user + ' — mật khẩu mới ' + mk + ' (nên đổi lại sau khi đăng nhập).'); else alert((r && r.error) || 'Lỗi');
          });
        };
      });
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }

  // ---------------------------------------------------------------- 🧑‍🏫 ĐỀ DO GIÁO VIÊN TẠO (quản trị xem tổng quan)
  function dgvAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải…</p>';
    call('deGVTatCa', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r || !r.ok) { $('#adm').innerHTML = '<p class="ap-load">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ — quản trị dán bản Code.gs mới.') + '</p>'; return; }
      var ds = (r.ds || []).sort(function (a, b) { return String(b.tao).localeCompare(String(a.tao)); });
      var gv = {}; ds.forEach(function (x) { gv[x.gv] = (gv[x.gv] || 0) + 1; });
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">🧑‍🏫 Đề do giáo viên tạo</h2><p class="ap-note">' + ds.length + ' đề · ' + Object.keys(gv).length + ' giáo viên. Mỗi tài khoản giáo viên được tạo miễn phí 3 đề; thêm đề cần <b>gói</b> (tab ⭐ Mã kích hoạt). Xem kết quả học sinh của đề cần <b>mã xem kết quả</b>.</p>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Tạo lúc</th><th>Giáo viên</th><th>Đề</th><th>Khối</th><th>Mã đề</th><th>Trạng thái</th><th></th></tr>' +
        (ds.map(function (x) {
          return '<tr><td>' + (x.tao ? new Date(x.tao).toLocaleString('vi-VN') : '') + '</td><td>' + esc(x.gv) + '</td><td>' + esc(x.title) + '</td><td>' + esc(x.khoi) + '</td><td>' + esc(x.soMa) + '</td><td>' + esc(x.trangThai) + '</td><td>' +
            (x.trangThai === 'Đã xuất bản' ? '<a class="er-btn ap-sm" target="_blank" rel="noopener" href="?de=' + encodeURIComponent(x.id) + '">Mở link</a>' : '') + '</td></tr>';
        }).join('') || '<tr><td colspan="7">Chưa có giáo viên nào tạo đề.</td></tr>') + '</table></div></section>';
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }
  // ---------------------------------------------------------------- quản lí đề
  function manage() {
    refreshCustom().then(function () {
      var L = list();
      var hidden = {}; Object.keys(TUY).forEach(function (k) { if (TUY[k].an) hidden[k] = 1; });
      var h = '<div class="ap-fbar"><button class="er-btn er-btn-y" id="m-new">+ Thêm đề mới</button><span class="ap-note">Sửa đề: thầy cô sửa nội dung, đáp án, lời giải; học sinh thấy bản mới ngay. "Khôi phục" đưa đề về bản gốc.</span></div>';
      [10, 11, 12].forEach(function (k) {
        h += '<h2 class="ap-g">Toán ' + k + '</h2><div class="ap-tw"><table class="ap-t"><tr><th>Đề</th><th>Loại</th><th>Trạng thái</th><th></th></tr>';
        L.filter(function (d) { return d.khoi == k; }).forEach(function (d) {
          var st = (TUY[d.id] && TUY[d.id].an) ? '<span class="ap-pend">đang ẩn</span>' : 'hiển thị';
          if (d.sua) st += d.goc ? ' · đã sửa' : ' · đề mới';
          h += '<tr><td>' + esc(d.title) + '</td><td>' + esc(LOAI_NGAN[d.loai] || d.loai) + '</td><td>' + st + '</td><td class="ap-act">' +
            '<button class="er-btn ap-sm" data-a="xem" data-id="' + d.id + '">Xem</button><button class="er-btn ap-sm" data-a="sua" data-id="' + d.id + '">Sửa</button>' +
            '<button class="er-btn ap-sm" data-a="an" data-id="' + d.id + '">' + ((TUY[d.id] && TUY[d.id].an) ? 'Hiện' : 'Ẩn') + '</button>' +
            (d.sua ? '<button class="er-btn ap-sm ap-del" data-a="xoa" data-id="' + d.id + '">' + (d.goc ? 'Khôi phục gốc' : 'Xoá') + '</button>' : '') + '</td></tr>';
        });
        h += '</table></div>';
      });
      $('#adm').innerHTML = h;
      $('#m-new').onclick = newExam;
      app.querySelectorAll('[data-a]').forEach(function (b) {
        b.onclick = function () {
          var id = b.dataset.id, a = b.dataset.a;
          if (a === 'xem') getFull(id).then(preview, function (e) { alert(e.message); });
          if (a === 'sua') getFull(id).then(function (ex) { editor(JSON.parse(JSON.stringify(ex))); });
          if (a === 'an') getFull(id).then(function (ex) { var c = JSON.parse(JSON.stringify(ex)); c.an = !(TUY[id] && TUY[id].an); saveExam(c, manage); });
          if (a === 'xoa' && confirm(TUY[id] && list().filter(function (d) { return d.id === id && d.goc; }).length ? 'Đưa đề này về bản gốc (bỏ mọi chỉnh sửa)?' : 'Xoá đề này?'))
            call('deleteExam', { token: TOKEN, id: id }).then(function (x) { if (authFail(x)) return; delete TUY[id]; manage(); });
        };
      });
    });
  }
  function saveExam(ex, then) {
    ex.ver = Date.now().toString(36);
    call('saveExam', { token: TOKEN, exam: ex }).then(function (x) {
      if (authFail(x)) return;
      if (x.ok) { TUY[ex.id] = ex; if (TUY_GV) TUY_GV[ex.id] = ex; if (then) then(); } else alert(x.error || 'Lỗi lưu đề');
    }).catch(function () { alert('Không kết nối được máy chủ để lưu đề.'); });
  }
  function preview(ex) {
    var m = modal('<div id="pv"></div>');
    var host = m.querySelector('#pv');
    var ans = { examId: ex.id };
    // xem như bài đã nộp với bài làm trống -> hiện đầy đủ đáp án, lời giải
    R.mount(host, ex, {});
    setTimeout(function () {
      var b = host.querySelector('#er-submit'); if (!b) return;
      var c = window.confirm; window.confirm = function () { return true; };
      b.click(); window.confirm = c;
    }, 50);
  }

  function blankQ(type) {
    if (type === 'mc') return { stem: '', opts: ['', '', '', ''], notes: ['', '', '', ''], ans: 0, expl: '' };
    if (type === 'tf') return { stem: '', items: [0, 1, 2, 3].map(function () { return { t: '', ans: true, expl: '' }; }) };
    if (type === 'sa') return { stem: '', ans: '', expl: '' };
    return { stem: '', pts: 1, sol: [{ t: '', p: 1 }] };
  }
  function newExam() {
    var L = list();
    var m = modal('<h2>Thêm đề mới</h2><label>Khối <select id="n-k"><option>10</option><option>11</option><option>12</option></select></label>' +
      '<label>Loại đề <select id="n-l"><option value="GK1">Giữa kì I</option><option value="CK1">Cuối kì I</option><option value="GK2">Giữa kì II</option><option value="CK2">Cuối kì II</option><option value="TN">Ôn thi tốt nghiệp</option><option value="KHAC">Khác</option></select></label>' +
      '<label>Tên đề <input id="n-t" placeholder="VD: Đề kiểm tra giữa học kì I — Môn Toán 10 — Đề số 11"></label><label>Thời gian (phút) <input id="n-time" type="number" value="90"></label>' +
      '<label>Bắt đầu từ <select id="n-src"><option value="">Đề trống theo cấu trúc của khối</option>' + L.map(function (d) { return '<option value="' + d.id + '">Chép từ: ' + esc(d.title) + '</option>'; }).join('') + '</select></label>' +
      '<p><button class="er-btn er-btn-y" id="n-go">Tạo và soạn đề</button></p>');
    m.querySelector('#n-go').onclick = function () {
      var k = +m.querySelector('#n-k').value, l = m.querySelector('#n-l').value, t = m.querySelector('#n-t').value.trim(), tm = +m.querySelector('#n-time').value || 90, src = m.querySelector('#n-src').value;
      if (!t) return alert('Thầy cô đặt tên đề nhé.');
      var id = 'GV-' + k + '-' + Date.now().toString(36);
      var make = function (base) {
        var ex = base ? JSON.parse(JSON.stringify(base)) : {
          parts: k === 12 ? [{ type: 'mc', pts: 0.25, qs: [] }, { type: 'tf', pts: 1, qs: [] }, { type: 'sa', pts: 0.5, qs: [] }]
            : [{ type: 'mc', pts: 0.25, qs: [] }, { type: 'tf', pts: 1, qs: [] }, { type: 'sa', pts: 0.5, qs: [] }, { type: 'es', pts: 1, qs: [] }]
        };
        if (!base) { var nq = k === 12 ? [12, 4, 6] : [12, 2, 4, 3]; ex.parts.forEach(function (p, i) { for (var j = 0; j < nq[i]; j++) p.qs.push(blankQ(p.type)); }); }
        ex.id = id; ex.khoi = k; ex.loai = l; ex.set = k + '-' + l; ex.title = t; ex.time = tm; ex.so = 0; ex.ten = LOAI[l]; delete ex.an;
        m.remove(); editor(ex, true);
      };
      if (src) getFull(src).then(make); else make(null);
    };
  }

  function editor(ex, isNew) {
    var h = '<div class="ed"><div class="ed-bar"><b>Soạn đề</b><span class="ap-sp"></span><button class="er-btn" id="ed-cancel">Huỷ</button><button class="er-btn er-btn-y" id="ed-save">Lưu đề</button></div>' +
      '<div class="ed-help">Công thức viết giữa hai dấu $ theo cú pháp LaTeX, ví dụ <code>$\\dfrac{1}{2}$</code>, <code>$x^2-3x+2$</code>, <code>$\\sqrt{3}$</code>, <code>$\\overrightarrow{AB}$</code>. Khung bên phải xem trước ngay.</div>' +
      '<label>Tên đề <input id="ed-title" value="' + esc(ex.title) + '"></label> <label>Thời gian (phút) <input id="ed-time" type="number" value="' + (ex.time || 90) + '" style="width:90px"></label><div id="ed-parts"></div></div>';
    app.innerHTML = '<main class="ap-main ed-wrap">' + h + '</main>';
    var host = $('#ed-parts');
    function field(lbl, path, val, rows) {
      return '<label class="ed-f">' + lbl + (rows ? '<textarea rows="' + rows + '" data-k="' + path + '">' + esc(val) + '</textarea>' : '<input data-k="' + path + '" value="' + esc(val) + '">') + '</label>';
    }
    function draw() {
      var s = '';
      ex.parts.forEach(function (p, pi) {
        s += '<section class="ed-part"><h3>' + R.PART_NAME[p.type] + ' <small>(' + (p.type === 'es' ? 'điểm theo từng câu' : fmt(p.pts) + ' điểm/câu') + ')</small></h3>';
        p.qs.forEach(function (q, qi) {
          var b = 'p' + pi + 'q' + qi;
          s += '<div class="ed-q"><div class="ed-form"><div class="ed-qh"><b>Câu ' + (qi + 1) + '</b><span class="ap-sp"></span><button class="er-btn ap-sm" data-del="' + pi + ',' + qi + '">Xoá câu</button></div>';
          s += field('Đề bài', b + '.stem', q.stem, 3);
          s += '<div class="ed-img">Hình vẽ: ' + (q.fig ? '<img src="' + (q.fig.src || q.fig.png) + '" style="max-height:60px"> <button class="er-btn ap-sm" data-rmimg="' + pi + ',' + qi + '">Bỏ hình</button>' : '(không có)') +
            ' <label class="er-btn ap-sm">Chọn ảnh…<input type="file" accept="image/*" data-img="' + pi + ',' + qi + '" hidden></label></div>';
          if (p.type === 'mc') {
            q.opts.forEach(function (o, j) {
              s += '<div class="ed-row"><label class="ed-rad"><input type="radio" name="r' + b + '" data-ans="' + pi + ',' + qi + ',' + j + '"' + (q.ans === j ? ' checked' : '') + '> ' + 'ABCD'[j] + '</label>' + field('', b + '.opts.' + j, o) + field('Lỗi sai (khi HS chọn)', b + '.notes.' + j, (q.notes || [])[j] || '') + '</div>';
            });
            s += field('Lời giải', b + '.expl', q.expl, 3);
          } else if (p.type === 'tf') {
            q.items.forEach(function (it, j) {
              s += '<div class="ed-row"><b>' + 'abcd'[j] + ')</b>' + field('', b + '.items.' + j + '.t', it.t) +
                '<select data-tf="' + pi + ',' + qi + ',' + j + '"><option value="1"' + (it.ans ? ' selected' : '') + '>Đúng</option><option value="0"' + (!it.ans ? ' selected' : '') + '>Sai</option></select>' + field('Giải thích', b + '.items.' + j + '.expl', it.expl) + '</div>';
            });
          } else if (p.type === 'sa') {
            s += field('Đáp số (một số, dấu phẩy thập phân)', b + '.ans', q.ans) + field('Lời giải', b + '.expl', q.expl, 3);
          } else {
            s += field('Điểm của câu', b + '.pts', q.pts);
            q.sol.forEach(function (st, j) { s += '<div class="ed-row">' + field('Bước ' + (j + 1), b + '.sol.' + j + '.t', st.t) + field('Điểm', b + '.sol.' + j + '.p', st.p) + '</div>'; });
            s += '<button class="er-btn ap-sm" data-addstep="' + pi + ',' + qi + '">+ Thêm bước chấm</button>';
          }
          s += '</div><div class="ed-prev" id="pv-' + b + '"></div></div>';
        });
        s += '<button class="er-btn" data-add="' + pi + '">+ Thêm câu vào phần này</button></section>';
      });
      host.innerHTML = s;
      ex.parts.forEach(function (p, pi) { p.qs.forEach(function (q, qi) { prev(pi, qi); }); });
    }
    function prev(pi, qi) {
      var p = ex.parts[pi], q = p.qs[qi], el = document.getElementById('pv-p' + pi + 'q' + qi); if (!el) return;
      var t = R.tex;
      var s = '<div class="er-stem">' + t(q.stem) + '</div>' + (q.table ? '' : '') + (q.fig ? '<div class="er-fig"><img src="' + (q.fig.src || q.fig.png) + '" style="max-width:100%"></div>' : '');
      if (p.type === 'mc') s += q.opts.map(function (o, j) { return '<div class="' + (q.ans === j ? 'ed-ok' : '') + '"><b>' + 'ABCD'[j] + '.</b> ' + t(o) + '</div>'; }).join('') + '<div class="er-sol">' + t(q.expl) + '</div>';
      if (p.type === 'tf') s += q.items.map(function (it, j) { return '<div><b>' + 'abcd'[j] + ')</b> ' + t(it.t) + ' — <b>' + (it.ans ? 'Đúng' : 'Sai') + '</b></div>'; }).join('');
      if (p.type === 'sa') s += '<div>Đáp số: <b>' + esc(q.ans) + '</b></div><div class="er-sol">' + t(q.expl) + '</div>';
      if (p.type === 'es') s += q.sol.map(function (x) { return '<div>' + t(x.t) + ' <b>(' + fmt(+x.p || 0) + ')</b></div>'; }).join('');
      el.innerHTML = s;
    }
    function setPath(path, val) {
      var m = path.match(/^p(\d+)q(\d+)\.(.*)$/); var o = ex.parts[+m[1]].qs[+m[2]];
      var ks = m[3].split('.'), last = ks.pop();
      ks.forEach(function (k) { o = o[k]; });
      o[last] = (last === 'pts' || last === 'p') ? (+String(val).replace(',', '.') || 0) : val;
      prev(+m[1], +m[2]);
    }
    draw();
    host.addEventListener('input', function (e) {
      var k = e.target.dataset.k; if (k) setPath(k, e.target.value);
    });
    host.addEventListener('change', function (e) {
      var d = e.target.dataset;
      if (d.ans) { var a = d.ans.split(',').map(Number); ex.parts[a[0]].qs[a[1]].ans = a[2]; prev(a[0], a[1]); }
      if (d.tf) { var b = d.tf.split(',').map(Number); ex.parts[b[0]].qs[b[1]].items[b[2]].ans = e.target.value === '1'; prev(b[0], b[1]); }
      if (d.img && e.target.files[0]) {
        var c = d.img.split(',').map(Number);
        shrink(e.target.files[0], function (url, w) { ex.parts[c[0]].qs[c[1]].fig = { src: url, w: w }; draw(); });
      }
    });
    host.addEventListener('click', function (e) {
      var d = e.target.dataset; if (!d) return;
      if (d.add) { var p = ex.parts[+d.add]; p.qs.push(blankQ(p.type)); draw(); }
      if (d.del) { var x = d.del.split(',').map(Number); if (confirm('Xoá câu này?')) { ex.parts[x[0]].qs.splice(x[1], 1); draw(); } }
      if (d.rmimg) { var y = d.rmimg.split(',').map(Number); delete ex.parts[y[0]].qs[y[1]].fig; draw(); }
      if (d.addstep) { var z = d.addstep.split(',').map(Number); ex.parts[z[0]].qs[z[1]].sol.push({ t: '', p: 0.25 }); draw(); }
    });
    $('#ed-cancel').onclick = function () { if (confirm('Bỏ các thay đổi chưa lưu?')) admin('de'); };
    $('#ed-save').onclick = function () {
      ex.title = $('#ed-title').value.trim() || ex.title; ex.time = +$('#ed-time').value || 90;
      var err = check(ex); if (err && !confirm(err + '\n\nVẫn lưu?')) return;
      saveExam(ex, function () { alert('Đã lưu đề.'); admin('de'); });
    };
  }
  function check(ex) {
    var msg = [];
    ex.parts.forEach(function (p, pi) {
      p.qs.forEach(function (q, qi) {
        var c = 'Phần ' + (pi + 1) + ' câu ' + (qi + 1);
        if (!String(q.stem).trim()) msg.push(c + ': chưa có đề bài.');
        if (p.type === 'mc' && q.opts.some(function (o) { return !String(o).trim(); })) msg.push(c + ': thiếu phương án.');
        if (p.type === 'sa' && isNaN(R.parseNum(q.ans))) msg.push(c + ': đáp số phải là một số.');
        if (p.type === 'es') { var s = q.sol.reduce(function (a, x) { return a + (+x.p || 0); }, 0); if (Math.abs(s - q.pts) > 1e-9) msg.push(c + ': tổng điểm các bước (' + fmt(s) + ') khác điểm câu (' + fmt(q.pts) + ').'); }
        String(q.stem + (q.expl || '')).replace(/\$([^$]+)\$/g, function (m, t) { try { if (window.katex) katex.renderToString(t, { throwOnError: true }); } catch (e) { msg.push(c + ': công thức lỗi "' + t + '"'); } });
      });
    });
    return msg.slice(0, 12).join('\n');
  }
  function shrink(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var W = Math.min(900, img.width), H = Math.round(img.height * W / img.width);
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.drawImage(img, 0, 0, W, H);
        cb(c.toDataURL('image/jpeg', 0.85), Math.min(12, W / 60));
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }

  function guide() {
    $('#adm').innerHTML = '<section class="ap-card ap-guide">' + (window.HUONG_DAN_HTML || '<p>Xem tệp HƯỚNG DẪN đi kèm app.</p>') +
      '<p><b>Trạng thái:</b> ' + (API ? 'Đã kết nối máy chủ: <code>' + esc(API) + '</code>' : 'Chưa kết nối máy chủ (đang ở chế độ thử trên máy này).') + '</p></section>';
  }

  // ---------------------------------------------------------------- ĐỀ SIÊU VIP (tài khoản học sinh + mã kích hoạt)
  // Nội dung đề VIP được mã hoá (data/vip/<mã>.txt). Chìa khoá chỉ do máy chủ trả về khi tài khoản đã kích hoạt mã của phần đề đó.
  var VIP = [];                                // danh mục đề VIP (không chứa nội dung)
  var VIP_GV = null;                           // chìa khoá các phần (giáo viên đã đăng nhập)
  var WCH = window.WEB_CAU_HINH || {};
  var ZALO = String(WCH.ZALO || CH.ZALO || '').replace(/\D/g, '');
  function napVip() {
    return new Promise(function (ok) {
      var s = document.createElement('script'); s.src = 'data/vip/danh-sach.js?v=' + Date.now();
      s.onload = function () { VIP = window.DE_VIP || []; ok(); }; s.onerror = function () { ok(); };
      document.head.appendChild(s);
      var w = document.createElement('script'); w.src = 'data/word/danh-sach.js?v=' + Date.now(); document.head.appendChild(w);
    });
  }
  function laVip(id) { return VIP.some(function (d) { return d.id === id; }); }
  function phanCua(id) { var d = VIP.filter(function (x) { return x.id === id; })[0]; return d && d.set; }
  function tk() { return lsGet('hs_tk', null); }
  function khoaKey(phan) { var t = tk(); return 'vip_k_' + (t ? t.user : '') + '_' + phan; }
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function giaiMaTxt(url, khoa) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('Trình duyệt không hỗ trợ giải mã (cần mở web qua https).'));
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('Không tải được tệp ' + url); return r.text(); }).then(function (t) {
      var all = b64(t.trim()), iv = all.slice(0, 12), ct = all.slice(12);
      return crypto.subtle.importKey('raw', b64(khoa), 'AES-GCM', false, ['decrypt']).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, ct); });
    }).then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }
  function giaiMa(id, khoa) {
    return giaiMaTxt('data/vip/' + id + '.txt', khoa).then(function (ex) { cache[id] = ex; return ex; });
  }
  // Chìa từng đề VIP = HMAC-SHA256(chìa của bộ, mã đề). Có chìa bộ (mở cả bộ) thì tự suy ra; có chìa đề (voucher) thì dùng thẳng.
  function khoaDe(khoaBo, id) {
    return crypto.subtle.importKey('raw', b64(khoaBo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(function (k) { return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(id)); })
      .then(function (s) { var u = new Uint8Array(s), t = ''; for (var i = 0; i < u.length; i++) t += String.fromCharCode(u[i]); return btoa(t); });
  }
  function getVip(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('Trình duyệt không hỗ trợ giải mã (cần mở web qua https).'));
    var phan = phanCua(id), ke = lsGet(khoaKey(id), null), k = lsGet(khoaKey(phan), null);
    if (ke) return giaiMa(id, ke);
    if (k) return khoaDe(k, id).then(function (x) { return giaiMa(id, x); });
    if (TOKEN) {
      var p = VIP_GV ? Promise.resolve(VIP_GV) : call('vipKhoaGV', { token: TOKEN }).then(function (r) { if (r && r.ok) VIP_GV = r.khoa; return VIP_GV; });
      return p.then(function (m) { if (!m || !m[phan]) throw new Error('Chưa có chìa khoá đề VIP (quản trị kiểm tra lại máy chủ).'); return khoaDe(m[phan], id).then(function (x) { return giaiMa(id, x); }); });
    }
    return Promise.reject(new Error('Đề VIP chưa được kích hoạt trên tài khoản này.'));
  }

  function hsDangNhap(sau) {
    var m = modal('<h2>Tài khoản</h2><p class="ap-note">Tài khoản dùng để lưu lịch sử làm bài, mở đề siêu VIP và tải đề Word. Mỗi mã kích hoạt quản trị cấp chỉ dùng được cho đúng một tài khoản.</p>' +
      '<nav class="ap-tabs ap-tabs-s"><button class="ap-tab on" data-m="vao">Đăng nhập</button><button class="ap-tab" data-m="tao">Tạo tài khoản mới</button></nav><div id="hs-f"></div><p id="hs-msg" class="ap-note"></p>');
    var hs = lsGet('hs', {}) || {};
    var ve = function (mode) {
      m.querySelectorAll('[data-m]').forEach(function (b) { b.classList.toggle('on', b.dataset.m === mode); });
      m.querySelector('#hs-f').innerHTML = (mode === 'tao' ?
        '<label>Họ và tên<input id="hs-ten" value="' + esc(hs.name || '') + '"></label><label>Lớp<input id="hs-lop" value="' + esc(hs.lop || '') + '"></label><label>Trường<input id="hs-truong" value="' + esc(hs.truong || CH.TRUONG_MAC_DINH || '') + '"></label>' : '') +
        '<label>Tên đăng nhập<input id="hs-u" autocomplete="username" placeholder="VD: an.nguyen10a1"></label><label>Mật khẩu<input id="hs-p" type="password" autocomplete="' + (mode === 'tao' ? 'new-password' : 'current-password') + '" placeholder="ít nhất 6 kí tự"></label>' +
        '<button class="er-btn er-btn-y er-big" id="hs-go">' + (mode === 'tao' ? 'Tạo tài khoản' : 'Đăng nhập') + '</button>';
      var go = function () {
        var d = { user: m.querySelector('#hs-u').value.trim().toLowerCase(), pass: m.querySelector('#hs-p').value };
        if (mode === 'tao') { d.hoTen = m.querySelector('#hs-ten').value.trim().replace(/\s+/g, ' '); d.lop = m.querySelector('#hs-lop').value.trim().toUpperCase(); d.truong = m.querySelector('#hs-truong').value.trim(); }
        m.querySelector('#hs-msg').textContent = 'Đang xử lí…';
        call(mode === 'tao' ? 'hsTao' : 'hsVao', d).then(function (r) {
          if (!r || !r.ok) { m.querySelector('#hs-msg').textContent = (r && r.error) || 'Có lỗi, em thử lại nhé.'; return; }
          luuDangNhap(r);
          m.remove(); dongBoLichSu().then(function () { if (sau) sau(); });
        }).catch(function () { m.querySelector('#hs-msg').textContent = 'Không kết nối được máy chủ.'; });
      };
      m.querySelector('#hs-go').onclick = go; m.querySelector('#hs-p').onkeydown = function (e) { if (e.key === 'Enter') go(); };
    };
    m.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { ve(b.dataset.m); }; });
    ve('vao');
  }

  // Mỗi khối có nhiều phần đề VIP (giữa kì I, cuối kì I, giữa kì II, cuối kì II, ôn thi TN) — mỗi phần một mã kích hoạt riêng.
  var THU_TU_PHAN = ['GK1', 'CK1', 'GK2', 'CK2', 'TN'];
  var TEN_PHAN = { GK1: 'Giữa học kì I', CK1: 'Cuối học kì I', GK2: 'Giữa học kì II', CK2: 'Cuối học kì II', TN: 'Ôn thi tốt nghiệp THPT' };
  function loaiPhan(phan) { return String(phan).split('-')[1] || ''; }
  function tenPhan(phan) {
    var d = VIP.filter(function (x) { return x.set === phan && x.chuong; })[0];
    if (d) return 'Ôn tập ' + d.chuong + ' · mức Khó';
    if (/-\d{2}$/.test(phan)) { var e = VIP.filter(function (x) { return x.id === phan; })[0]; if (e) return e.title; }
    return TEN_PHAN[loaiPhan(phan)] || phan;
  }
  function vipPhanCua(khoi) {
    var ph = [];
    VIP.forEach(function (d) { if (d.khoi == khoi && !d.ot && ph.indexOf(d.set) < 0) ph.push(d.set); });
    return ph.sort(function (a, b) { return THU_TU_PHAN.indexOf(loaiPhan(a)) - THU_TU_PHAN.indexOf(loaiPhan(b)); });
  }
  var vipTT = null;                            // một lần hỏi trạng thái mã cho mọi phần đề trên trang
  function vipTrangThai_(t, moi) {
    if (moi || !vipTT) vipTT = call('vipTrangThai', { token: t.token });
    return vipTT;
  }
  function vipVe(khoi) {
    vipTT = null;
    vipPhanCua(khoi).forEach(function (phan) { vipPhan(phan); });
    var ot = []; VIP.forEach(function (d) { if (d.khoi == khoi && d.ot && ot.indexOf(d.set) < 0) ot.push(d.set); });
    ot.forEach(function (phan) { vipPhan(phan); });
  }
  // Thẻ đề VIP khi chưa mở cả bộ: đề đã mở riêng (voucher) thì làm được; đề còn khoá có nút đổi 20 điểm.
  function theVipLe(ds, t, tt, phan) {
    var tkd = thongKeDe(), canLay = [];
    var h = '<div class="ap-grid">' + ds.map(function (d) {
      var nhan = '⭐ VIP ' + (d.so < 10 ? '0' : '') + d.so;
      if (lsGet(khoaKey(d.id), null)) return theDe(Object.assign({ vip: true }, d), tkd, nhan);
      if (tt[d.id] === 'Đã kích hoạt') canLay.push(d.id);
      return '<div class="ap-de-w"><button class="ap-de ap-de-khoa" data-vc="' + esc(d.id) + '"><span class="ap-de-n">🔒 ' + nhan + '</span><span class="ap-de-m">' + (d.time || 90) + ' phút</span><span class="ap-de-s">🎟️ Đổi 20 điểm để mở</span></button></div>';
    }).join('') + '</div>';
    canLay.forEach(function (id) {   // đề đã kích hoạt riêng trên máy khác: lấy chìa về máy này
      call('vipKhoa', { token: t.token, phan: id }).then(function (x) { if (x && x.ok) { lsSet(khoaKey(id), x.khoa); vipPhan(phan); } }).catch(function () { });
    });
    return h;
  }
  function ganVoucher(hop, t, phan) {
    hop.querySelectorAll('[data-vc]').forEach(function (b) {
      b.onclick = function () {
        var id = b.dataset.vc;
        if (!confirm('Dùng 20 điểm tích luỹ để đổi 1 voucher mở đề ' + id + '?\nĐiểm sẽ bị trừ ngay, mã kích hoạt được tạo cho riêng tài khoản của em.')) return;
        b.disabled = true;
        call('doiVoucher', { token: t.token, de: id }).then(function (x) {
          if (x && x.hsAuth === false) { localStorage.removeItem('hs_tk'); return vipPhan(phan); }
          if (!x || !x.ok) { b.disabled = false; return alert((x && x.error) || 'Chưa đổi được voucher.'); }
          baoDiem(x.tong);
          return call('vipKichHoat', { token: t.token, phan: id, ma: x.ma }).then(function (y) {
            if (y && y.ok) { lsSet(khoaKey(id), y.khoa); alert('🎟️ Đổi voucher thành công!\nMã kích hoạt của em: ' + x.ma + '\nĐề đã được mở. Em còn ' + x.tong + ' điểm.'); }
            else alert('Mã kích hoạt của em: ' + x.ma + '\n' + ((y && y.error) || 'Chưa kích hoạt được, em thử lại nhé.'));
            vipPhan(phan);
          });
        }).catch(function () { b.disabled = false; alert('Không kết nối được máy chủ.'); });
      };
    });
  }
  function baoDiem(tong) { try { if (window.parent && window.parent.WEB && window.parent.WEB.datDiem) window.parent.WEB.datDiem(tong); } catch (e) { } }
  function vipPhan(phan, moi) {
    var hop = $('#vip-' + phan); if (!hop) return;
    var q = function (s) { return hop.querySelector(s); };
    var lai = function () { vipPhan(phan, true); };
    var ds = VIP.filter(function (d) { return d.set === phan; });
    if (!ds.length) { hop.parentNode.remove(); return; }
    var t = tk();
    var dong = function (html) { hop.innerHTML = html; };
    var nutTK = t ? '<p class="ap-note">Tài khoản: <b>' + esc(t.user) + '</b> (' + esc(t.hoTen) + ') · <a href="#" class="vip-out">Đăng xuất</a></p>' : '';
    var batOut = function () { var o = q('.vip-out'); if (o) o.onclick = function (e) { e.preventDefault(); localStorage.removeItem('hs_tk'); vipVe(String(phan).split('-')[0]); }; };
    var hetPhien = function () { localStorage.removeItem('hs_tk'); dong('<p class="ap-note">Phiên đăng nhập đã hết hạn.</p><button class="er-btn er-btn-y vip-dn">Đăng nhập lại</button>'); q('.vip-dn').onclick = function () { hsDangNhap(function () { vipVe(String(phan).split('-')[0]); }); }; };
    if (!API) return dong('<p class="ap-note">Đề siêu VIP chỉ dùng được khi app đã kết nối máy chủ của giáo viên.</p>');
    var k = lsGet(khoaKey(phan), null);
    if (t && k) {
      var tkd = thongKeDe();
      dong(nutTK + '<div class="ap-grid">' + ds.map(function (d) {
        return theDe(Object.assign({ vip: true }, d), tkd, '⭐ VIP ' + (d.so < 10 ? '0' : '') + d.so);
      }).join('') + '</div>');
      ganThe(hop);
      // kiểm tra lại với máy chủ: mã bị quản trị khoá hoặc xoá thì thu hồi chìa khoá trên máy này
      vipTrangThai_(t).then(function (r) {
        if (r && r.ok && (r.trangThai || {})[phan] !== 'Đã kích hoạt') { localStorage.removeItem(khoaKey(phan)); lai(); }
      }).catch(function () { });
      return batOut();
    }
    if (!t) {
      dong('<p>Gồm <b>' + ds.length + ' đề</b> toàn câu vận dụng – vận dụng cao để em thử thách bản thân. Em cần có tài khoản, đăng ký và nhập mã kích hoạt do quản trị cấp.</p><button class="er-btn er-btn-y vip-dn">Đăng nhập / Tạo tài khoản để đăng ký</button>');
      return (q('.vip-dn').onclick = function () { hsDangNhap(function () { vipVe(String(phan).split('-')[0]); }); });
    }
    dong(nutTK + '<p class="ap-load">Đang kiểm tra…</p>'); batOut();
    vipTrangThai_(t, moi).then(function (r) {
      if (r && r.hsAuth === false) return hetPhien();
      if (!r || !r.ok) return dong(nutTK + '<p class="ap-note">' + esc((r && r.error) || 'Không kiểm tra được.') + '</p>');
      var tt = r.trangThai || {}, st = tt[phan];
      var le = theVipLe(ds, t, tt, phan), cach = '<p class="ap-note">Mở đề bằng 1 trong 2 cách: <b>🎟️ đổi 20 điểm tích luỹ</b> lấy 1 đề (bấm vào đề bị khoá), hoặc <b>đăng ký mở cả bộ ' + ds.length + ' đề</b> và nhận mã từ Ban quản trị.</p>';
      if (!st) {
        dong(nutTK + cach + le + '<button class="er-btn er-btn-y vip-dk">Đăng ký mở cả bộ · ' + esc(tenPhan(phan)) + '</button>'); batOut(); ganThe(hop); ganVoucher(hop, t, phan);
        q('.vip-dk').onclick = function () { this.disabled = true; call('vipDangKy', { token: t.token, phan: phan }).then(function (x) { if (x && x.hsAuth === false) return hetPhien(); lai(); }); };
        return;
      }
      if (st === 'Đã khoá') { dong(nutTK + '<p class="ap-warn2">Mã của em đang bị khoá. Em liên hệ Ban quản trị để được hỗ trợ nhé.</p>'); return batOut(); }
      if (st === 'Đã kích hoạt') {
        return call('vipKhoa', { token: t.token, phan: phan }).then(function (x) { if (x && x.ok) { lsSet(khoaKey(phan), x.khoa); vipPhan(phan); } else dong(nutTK + '<p class="ap-note">' + esc((x && x.error) || 'Lỗi') + '</p>'); });
      }
      dong(nutTK + '<div class="ap-vip-cho"><p>✅ Em đã đăng ký phần <b>' + esc(tenPhan(phan)) + '</b>. Hãy nhắn cho Ban quản trị' + (ZALO ? ' qua <a href="https://zalo.me/' + ZALO + '" target="_blank" rel="noopener"><b>Zalo ' + ZALO + '</b></a>' : '') +
        ' kèm <b>tên đăng nhập: ' + esc(t.user) + '</b> và tên phần đề để nhận mã kích hoạt.</p><label>Mã kích hoạt<input class="vip-ma" placeholder="VD: ABCD-1234" autocomplete="off"></label>' +
        '<button class="er-btn er-btn-y vip-kh">Kích hoạt</button><p class="ap-note vip-msg"></p></div>' + cach + le); batOut(); ganThe(hop); ganVoucher(hop, t, phan);
      q('.vip-kh').onclick = function () {
        q('.vip-msg').textContent = 'Đang kiểm tra mã…';
        call('vipKichHoat', { token: t.token, phan: phan, ma: q('.vip-ma').value }).then(function (x) {
          if (x && x.hsAuth === false) return hetPhien();
          if (x && x.ok) { lsSet(khoaKey(phan), x.khoa); vipPhan(phan); } else q('.vip-msg').textContent = (x && x.error) || 'Mã chưa đúng.';
        }).catch(function () { q('.vip-msg').textContent = 'Không kết nối được máy chủ.'; });
      };
    }).catch(function () { dong(nutTK + '<p class="ap-note">Không kết nối được máy chủ.</p>'); });
  }


  // ---------------------------------------------------------------- ⬇ TẢI ĐỀ WORD BẰNG MÃ (mỗi mã tải đúng một đề)
  function luuFile(buf, ten, loai) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: loai })); a.download = ten;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  function giaiMaBin(url, khoa) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('Không tải được tệp.'); return r.arrayBuffer(); }).then(function (ab) {
      var u = new Uint8Array(ab);
      return crypto.subtle.importKey('raw', b64(khoa), 'AES-GCM', false, ['decrypt']).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, k, u.slice(12)); });
    });
  }
  function laDienThoai() { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)); }
  function trongApp() { return /Zalo|FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\//i.test(navigator.userAgent); }   // trình duyệt dựng sẵn trong Zalo, Facebook… chặn tải file
  function moNgoai() {
    var link = (window.top || window).location.href.split('#')[0];
    try { link = window.top.location.href; } catch (e) { }
    return '<p class="ap-warn2">Trang đang mở trong <b>Zalo / Facebook</b> — ứng dụng này không cho tải file.</p>' +
      '<p>Bấm <b>⋮</b> hoặc <b>…</b> ở góc trên → <b>Mở bằng trình duyệt</b> (Chrome / Safari), rồi đăng nhập và tải lại. Mã đã kích hoạt vẫn còn, không cần mã mới.</p>' +
      '<button class="er-btn" id="tw-chep" data-link="' + esc(link) + '">📋 Chép đường link trang</button>';
  }
  function ganChep(n) {
    var b = n.querySelector('#tw-chep'); if (!b) return;
    b.onclick = function () { var l = b.dataset.link; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { b.textContent = '✔ Đã chép — dán vào Chrome/Safari'; }, function () { prompt('Chép đường link:', l); }); };
  }
  function huongDanZalo(user, viec) {
    return '<p>✅ Đã đăng ký. Nhắn cho Ban quản trị' + (ZALO ? ' qua <a href="https://zalo.me/' + ZALO + '" target="_blank" rel="noopener"><b>Zalo ' + ZALO + '</b></a>' : '') +
      ' kèm <b>tên đăng nhập: ' + esc(user) + '</b> và ' + viec + ' để nhận mã.</p>';
  }
  function taiWord(id) {
    var d = list().filter(function (x) { return x.id === id; })[0] || VIP.filter(function (x) { return x.id === id; })[0] || { title: id };
    var t = tk_();
    if (!t) return hsDangNhap(function () { taiWord(id); });
    var m = modal('<h2>⬇ Tải đề Word</h2><p><b>' + esc(d.title) + '</b></p><p class="ap-note">File Word gồm đề, đáp án, hướng dẫn chấm và lời giải chi tiết; công thức MathType. Mỗi mã chỉ tải được <b>đúng đề này</b> và chỉ dùng cho tài khoản <b>' + esc(t.user) + '</b>.</p><div id="tw-n"><p class="ap-load">Đang kiểm tra…</p></div>');
    var n = m.querySelector('#tw-n');
    var tai = function (khoa) {
      if (trongApp()) { n.innerHTML = moNgoai(); ganChep(n); return; }
      n.innerHTML = '<p class="ap-load">Đang tải và giải mã file…</p>';
      giaiMaBin('data/word/' + id + '.bin', khoa).then(function (buf) {
        var ten = (window.DE_WORD || {})[id] || id + '.docx';
        var url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        // Điện thoại không cho trang tự tải sau khi chờ mạng -> để người dùng tự bấm nút lưu (đúng "thao tác tay")
        n.innerHTML = '<p>✔ File đã sẵn sàng (' + Math.round(buf.byteLength / 1024) + ' KB).</p><a class="er-btn er-btn-y er-big" id="tw-luu" href="' + url + '" download="' + esc(ten) + '">💾 Lưu file Word</a>' + (laDienThoai() ? ' <a class="er-btn" href="' + url + '" target="_blank" rel="noopener">📄 Mở file</a>' : '') +
          '<p class="ap-note">Điện thoại: bấm <b>💾 Lưu file Word</b> → chọn <b>Tải xuống</b>. iPhone nếu không thấy tải: bấm <b>📄 Mở file</b> → nút <b>Chia sẻ</b> → <b>Lưu vào Tệp</b>. File nằm trong mục <i>Tải xuống</i> (Android) hoặc ứng dụng <i>Tệp</i> (iPhone); mở bằng Word hoặc WPS.</p>';
        if (!laDienThoai()) n.querySelector('#tw-luu').click();
      }).catch(function (e) { n.innerHTML = '<p class="ap-warn2">' + esc(e.message) + '</p>'; });
    };
    var het = function () { localStorage.removeItem('hs_tk'); m.remove(); hsDangNhap(function () { taiWord(id); }); };
    call('maTrangThai', { token: t.token, loai: 'TAIDE' }).then(function (r) {
      if (r && r.hsAuth === false) return het();
      if (!r || !r.ok) { n.innerHTML = '<p class="ap-note">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ — quản trị cần cập nhật Code.gs.') + '</p>'; return; }
      var st = ((r.ds || []).filter(function (x) { return x.doiTuong === id; })[0] || {}).trangThai;
      if (st === 'Đã kích hoạt') {
        n.innerHTML = '<p>Tài khoản của em đã được mở đề này.</p><button class="er-btn er-btn-y" id="tw-go">⬇ Tải file Word</button>';
        n.querySelector('#tw-go').onclick = function () { call('maKhoaTai', { token: t.token, doiTuong: id }).then(function (x) { if (x && x.ok) tai(x.khoa); else n.innerHTML = '<p class="ap-warn2">' + esc((x && x.error) || 'Lỗi') + '</p>'; }); };
        return;
      }
      if (st === 'Đã khoá') { n.innerHTML = '<p class="ap-warn2">Mã tải đề này đang bị khoá. Liên hệ Ban quản trị nhé.</p>'; return; }
      if (!st) {
        n.innerHTML = '<button class="er-btn er-btn-y" id="tw-dk">📝 Đăng ký tải đề này</button>';
        n.querySelector('#tw-dk').onclick = function () {
          this.disabled = true;
          call('maDangKy', { token: t.token, loai: 'TAIDE', doiTuong: id, moTa: d.title }).then(function (x) { if (x && x.hsAuth === false) return het(); m.remove(); taiWord(id); });
        };
        return;
      }
      n.innerHTML = huongDanZalo(t.user, 'tên đề <b>' + esc(d.title) + '</b>') +
        '<label>Mã tải đề<input id="tw-ma" placeholder="VD: ABCD-1234" autocomplete="off"></label><button class="er-btn er-btn-y" id="tw-kh">Kích hoạt và tải</button><p id="tw-msg" class="ap-note"></p>';
      n.querySelector('#tw-kh').onclick = function () {
        n.querySelector('#tw-msg').textContent = 'Đang kiểm tra mã…';
        call('maKichHoat', { token: t.token, loai: 'TAIDE', doiTuong: id, ma: n.querySelector('#tw-ma').value }).then(function (x) {
          if (x && x.hsAuth === false) return het();
          if (x && x.ok) tai(x.khoa); else n.querySelector('#tw-msg').textContent = (x && x.error) || 'Mã chưa đúng.';
        }).catch(function () { n.querySelector('#tw-msg').textContent = 'Không kết nối được máy chủ.'; });
      };
    }).catch(function () { n.innerHTML = '<p class="ap-note">Không kết nối được máy chủ.</p>'; });
  }

  // ---------------------------------------------------------------- ⭐ QUẢN TRỊ MÃ KÍCH HOẠT (VIP · tải Word · phiếu tô màu)
  var TEN_LOAI = { VIP: '⭐ Đề VIP', TAIDE: '⬇ Tải đề Word', PHIEU: '🎨 Phiếu tô màu', GOI: '🧑‍🏫 Gói tạo đề', KETQUA: '📊 Xem kết quả đề GV', VEHINH: '📐 Lưu bài vẽ hình' };
  var TEN_GOI = { '1T': 'Gói 1 tháng', HK: 'Gói 1 học kì', NAM: 'Gói 1 năm học' };
  function maAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải danh sách mã…</p>';
    Promise.all([call('vipDanhSach', { token: TOKEN }), call('maDanhSach', { token: TOKEN }).catch(function () { return { ok: false }; })]).then(function (rr) {
      if (authFail(rr[0])) return;
      var ds = [];
      ((rr[0] && rr[0].ds) || []).forEach(function (x) { ds.push(Object.assign({ loai: 'VIP', doiTuong: x.phan, moTa: 'Lớp ' + String(x.phan).split('-')[0] + ' · ' + tenPhan(x.phan) }, x)); });
      ((rr[1] && rr[1].ds) || []).forEach(function (x) { ds.push(x); });
      var dem = {}; ds.forEach(function (x) { dem[x.trangThai] = (dem[x.trangThai] || 0) + 1; });
      var L = ds.filter(function (x) {
        return (!VIPF.loai || x.loai === VIPF.loai) && (!VIPF.tt || x.trangThai === VIPF.tt) &&
          (!VIPF.q || (x.hoTen + ' ' + x.user + ' ' + x.lop + ' ' + x.ma + ' ' + (x.moTa || '')).toLowerCase().indexOf(VIPF.q.toLowerCase()) >= 0);
      }).sort(function (a, b) { return (a.trangThai === 'Chờ kích hoạt' ? 0 : 1) - (b.trangThai === 'Chờ kích hoạt' ? 0 : 1) || String(b.ngay).localeCompare(String(a.ngay)); });
      var rows = L.map(function (x, i) {
        var nut = x.trangThai === 'Đã khoá' ? '<button class="er-btn ap-sm" data-a="mo" data-i="' + i + '">Mở khoá</button>' : '<button class="er-btn ap-sm" data-a="khoa" data-i="' + i + '">Khoá</button>';
        return '<tr><td><b class="ap-ma">' + esc(x.ma) + '</b> <button class="er-btn ap-sm" data-a="chep" data-i="' + i + '" title="Chép mã">📋</button></td><td>' + (TEN_LOAI[x.loai] || esc(x.loai)) + '</td><td>' + esc(x.moTa || TEN_GOI[x.doiTuong] || x.doiTuong) + (x.loai === 'GOI' && x.han ? '<br><small>hạn đến ' + new Date(x.han).toLocaleDateString('vi-VN') + '</small>' : '') + '</td><td>' + esc(x.user) + '</td><td>' + esc(x.hoTen) +
          '</td><td>' + esc(x.lop) + '</td><td>' + esc(x.truong) + '</td><td>' + (x.ngay ? new Date(x.ngay).toLocaleString('vi-VN') : '') + '</td><td><span class="ap-tt ' + (/kích hoạt|dùng/.test(x.trangThai) && x.trangThai !== 'Chờ kích hoạt' ? 'ok' : x.trangThai === 'Đã khoá' ? 'bad' : 'cho') + '">' + esc(x.trangThai) + '</span></td><td>' +
          nut + ' <button class="er-btn ap-sm" data-a="xoa" data-i="' + i + '">Xoá</button></td></tr>';
      }).join('');
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">⭐ Mã kích hoạt</h2><p class="ap-note">Người dùng bấm <b>Đăng ký</b> (đề VIP, tải đề Word, tải phiếu tô màu) thì máy tạo sẵn một mã gắn với tài khoản và đúng mục đăng ký. Quản trị chép mã gửi qua Zalo; mã nhập vào tài khoản khác hoặc mục khác sẽ không dùng được. Mã phiếu tô màu dùng một lần.</p>' +
        '<p>Chờ kích hoạt: <b>' + (dem['Chờ kích hoạt'] || 0) + '</b> · Đã kích hoạt/đã dùng: <b>' + ((dem['Đã kích hoạt'] || 0) + (dem['Đã dùng'] || 0)) + '</b> · Đã khoá: <b>' + (dem['Đã khoá'] || 0) + '</b></p>' +
        '<div class="ap-fbar"><select id="v-loai"><option value="">Tất cả loại mã</option>' + Object.keys(TEN_LOAI).map(function (k) { return '<option value="' + k + '"' + (VIPF.loai === k ? ' selected' : '') + '>' + TEN_LOAI[k] + '</option>'; }).join('') + '</select>' +
        '<select id="v-tt"><option value="">Tất cả trạng thái</option>' + ['Chờ kích hoạt', 'Đã kích hoạt', 'Đã dùng', 'Đã khoá'].map(function (s) { return '<option' + (VIPF.tt === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<input id="v-q" placeholder="Tìm tên, lớp, mã…" value="' + esc(VIPF.q) + '"><button class="er-btn" id="v-reload">Tải lại</button></div>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Mã</th><th>Loại</th><th>Mục</th><th>Tài khoản</th><th>Họ tên</th><th>Lớp</th><th>Trường</th><th>Đăng ký lúc</th><th>Trạng thái</th><th></th></tr>' + (rows || '<tr><td colspan="10">Chưa có đăng ký nào.</td></tr>') + '</table></div></section>';
      $('#v-loai').onchange = function () { VIPF.loai = this.value; maAdmin(); };
      $('#v-tt').onchange = function () { VIPF.tt = this.value; maAdmin(); };
      $('#v-q').onchange = function () { VIPF.q = this.value; maAdmin(); };
      $('#v-reload').onclick = maAdmin;
      app.querySelectorAll('#adm [data-a]').forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.a, x = L[+b.dataset.i], ma = x.ma;
          if (a === 'chep') { (navigator.clipboard ? navigator.clipboard.writeText(ma) : Promise.reject()).then(function () { b.textContent = '✔'; }, function () { prompt('Chép mã:', ma); }); return; }
          if (a === 'xoa' && !confirm('Xoá đăng ký có mã ' + ma + '? Người dùng sẽ phải đăng ký lại.')) return;
          var lenh = x.loai === 'VIP' ? 'vipCapNhat' : 'maCapNhat';
          call(lenh, { token: TOKEN, ma: ma, xoa: a === 'xoa', trangThai: a === 'khoa' ? 'khoa' : a === 'mo' ? 'mo' : '' }).then(function (r) { if (!authFail(r)) maAdmin(); });
        };
      });
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }

  // ---- quản trị mã VIP (giáo viên) — thay bằng maAdmin()
  var VIPF = { tt: '', q: '', loai: '' };
  function vipAdmin() {
    $('#adm').innerHTML = '<p class="ap-load">Đang tải danh sách đăng ký…</p>';
    call('vipDanhSach', { token: TOKEN }).then(function (r) {
      if (authFail(r)) return;
      if (!r || !r.ok) { $('#adm').innerHTML = '<p class="ap-load">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ đề VIP — quản trị dán bản Code.gs mới và triển khai phiên bản mới.') + '</p>'; return; }
      var ds = r.ds || [];
      var dem = { 'Chờ kích hoạt': 0, 'Đã kích hoạt': 0, 'Đã khoá': 0 };
      ds.forEach(function (x) { dem[x.trangThai] = (dem[x.trangThai] || 0) + 1; });
      var L = ds.filter(function (x) { return (!VIPF.tt || x.trangThai === VIPF.tt) && (!VIPF.q || (x.hoTen + ' ' + x.user + ' ' + x.lop + ' ' + x.ma).toLowerCase().indexOf(VIPF.q.toLowerCase()) >= 0); })
        .sort(function (a, b) { return String(b.ngay).localeCompare(String(a.ngay)); });
      var rows = L.map(function (x) {
        var nut = x.trangThai === 'Đã khoá' ? '<button class="er-btn ap-sm" data-a="mo" data-ma="' + esc(x.ma) + '">Mở khoá</button>' : '<button class="er-btn ap-sm" data-a="khoa" data-ma="' + esc(x.ma) + '">Khoá</button>';
        return '<tr><td><b class="ap-ma">' + esc(x.ma) + '</b> <button class="er-btn ap-sm" data-a="chep" data-ma="' + esc(x.ma) + '" title="Chép mã">📋</button></td><td>' + esc('Lớp ' + String(x.phan).split('-')[0] + ' · ' + tenPhan(x.phan)) + '</td><td>' + esc(x.user) + '</td><td>' + esc(x.hoTen) +
          '</td><td>' + esc(x.lop) + '</td><td>' + esc(x.truong) + '</td><td>' + (x.ngay ? new Date(x.ngay).toLocaleString('vi-VN') : '') + '</td><td><span class="ap-tt ' + (x.trangThai === 'Đã kích hoạt' ? 'ok' : x.trangThai === 'Đã khoá' ? 'bad' : 'cho') + '">' + esc(x.trangThai) + '</span></td><td>' +
          nut + ' <button class="er-btn ap-sm" data-a="xoa" data-ma="' + esc(x.ma) + '">Xoá</button></td></tr>';
      }).join('');
      $('#adm').innerHTML = '<section class="ap-card"><h2 style="margin-top:0">⭐ Mã kích hoạt đề siêu VIP</h2><p class="ap-note">Học sinh bấm <b>Đăng ký</b> thì máy tạo sẵn một mã gắn với tài khoản của em đó. Quản trị gửi đúng mã cho em qua Zalo; em nhập mã là mở được 5 đề VIP của phần đã đăng ký. Mã của em này nhập vào tài khoản khác sẽ không dùng được.</p>' +
        '<p>Chờ kích hoạt: <b>' + dem['Chờ kích hoạt'] + '</b> · Đã kích hoạt: <b>' + dem['Đã kích hoạt'] + '</b> · Đã khoá: <b>' + dem['Đã khoá'] + '</b></p>' +
        '<div class="ap-fbar"><select id="v-tt"><option value="">Tất cả trạng thái</option>' + ['Chờ kích hoạt', 'Đã kích hoạt', 'Đã khoá'].map(function (s) { return '<option' + (VIPF.tt === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<input id="v-q" placeholder="Tìm tên, lớp, mã…" value="' + esc(VIPF.q) + '"><button class="er-btn" id="v-reload">Tải lại</button></div>' +
        '<div class="ap-tw"><table class="ap-t"><tr><th>Mã</th><th>Phần đề</th><th>Tài khoản</th><th>Họ tên</th><th>Lớp</th><th>Trường</th><th>Đăng ký lúc</th><th>Trạng thái</th><th></th></tr>' + (rows || '<tr><td colspan="9">Chưa có học sinh đăng ký.</td></tr>') + '</table></div></section>';
      $('#v-tt').onchange = function () { VIPF.tt = this.value; vipAdmin(); };
      $('#v-q').onchange = function () { VIPF.q = this.value; vipAdmin(); };
      $('#v-reload').onclick = vipAdmin;
      app.querySelectorAll('[data-a]').forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.a, ma = b.dataset.ma;
          if (a === 'chep') { (navigator.clipboard ? navigator.clipboard.writeText(ma) : Promise.reject()).then(function () { b.textContent = '✔'; }, function () { prompt('Chép mã:', ma); }); return; }
          if (a === 'xoa' && !confirm('Xoá đăng ký có mã ' + ma + '? Học sinh sẽ phải đăng ký lại.')) return;
          call('vipCapNhat', { token: TOKEN, ma: ma, xoa: a === 'xoa', trangThai: a === 'khoa' ? 'khoa' : a === 'mo' ? 'mo' : '' }).then(function (r) { if (!authFail(r)) vipAdmin(); });
        };
      });
    }).catch(function () { $('#adm').innerHTML = '<p class="ap-load">Không kết nối được máy chủ.</p>'; });
  }

  // ---------------------------------------------------------------- khởi động
  var GV_TAB = (location.search.match(/[?&]gv=(\w+)/) || [])[1];
  function kiemPhien() {
    var t = tk_(); if (!t || !API) return Promise.resolve();
    return call('hsHoSo', { token: t.token }).then(function (r) {
      if (r && r.hsAuth === false) { try { Object.keys(localStorage).forEach(function (k) { if (/^(hs|hs_tk|lichsu)$/.test(k)) localStorage.removeItem(k); }); } catch (e) { } return; }
      if (r && r.ok && r.hs) { var c = tk_(); Object.assign(c, { hoTen: r.hs.hoTen, lop: r.hs.lop, truong: r.hs.truong, vaiTro: r.hs.vaiTro }); lsSet('hs_tk', c); lsSet('hs', { name: r.hs.hoTen, lop: r.hs.lop, truong: r.hs.truong }); }
      if (!lichSu().length) return dongBoLichSu();
    }).catch(function () { });
  }
  window.APP = { call: call, modal: modal, shell: shell, lsGet: lsGet, lsSet: lsSet, tk: tk_, giaiMaTxt: giaiMaTxt, home: function () { home(); },
    dangXuat: function () { dangXuat(); }, huongDanZalo: huongDanZalo, shrink: shrink,
    dangNhap: function (sau) { DANG_CHO = sau; studentLogin(); }, moDeGV: function (id) { window.history.replaceState(null, '', location.pathname + '?de=' + encodeURIComponent(id)); moDeGV(id); },
    loadBase: loadBase, deGoc: function () { return GOC; }, linkWeb: linkWeb };
  // link gửi học sinh: khi phòng luyện đề nằm trong website thì mở qua khung website (có đầu trang, đăng nhập chung)
  function linkWeb(q) {
    var p = location.pathname, i = p.indexOf('/noi-dung/de-kiem-tra/');
    if (i >= 0) return location.origin + p.slice(0, i + 1) + 'xem.html?id=de&' + q;
    return location.href.split('#')[0].split('?')[0].replace(/index\.html$/, '') + '?' + q;
  }
  var DE_GV = (location.search.match(/[?&]de=([\w-]+)/) || [])[1], MO_KHO = /[?&]kho=1/.test(location.search);
  var LOP_ID = (location.search.match(/[?&]lop=([\w-]+)/) || [])[1], LOP_CUA = /[?&]lopcua=1/.test(location.search), LOP_GV = /[?&]lophoc=1/.test(location.search);
  function moTheoDuong() {
    if (DE_GV && LOP_ID) return window.LOP_HOC.moDeTheoLop(DE_GV, LOP_ID);
    if (DE_GV) return moDeGV(DE_GV);
    if (LOP_ID) return window.LOP_HOC.vaoLop(LOP_ID);
    if (LOP_CUA) return window.LOP_HOC.lopCuaEm();
    if (LOP_GV) return window.LOP_HOC.lopGV();
    return window.KHO_DE.moTrang();
  }
  napVip().then(refreshCustom).then(kiemPhien).then(function () {
    resend();
    var coDuong = DE_GV || MO_KHO || LOP_ID || LOP_CUA || LOP_GV;
    if (coDuong && API && !tk_()) { DANG_CHO = moTheoDuong; return studentLogin(); }
    if (coDuong && API) return moTheoDuong();
    if (GV_TAB) { ADM.tab = GV_TAB; if (TOKEN) admin(); else teacherLogin(); } else home();
  });
})();
