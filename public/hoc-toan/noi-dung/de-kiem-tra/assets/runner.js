/* Bộ máy làm bài – dùng chung cho app và từng file đề HTML.
 * ExamRunner.mount(el, exam, {student, pre, onSubmit(result), onExit()})
 *  exam: {id,title,khoi,loai,time,parts:[{type:'mc'|'tf'|'sa'|'es', pts, qs:[...]}]}
 *  pre=true: chuỗi đã dựng sẵn HTML (KaTeX), không cần thư viện KaTeX.
 */
(function (G) {
  'use strict';
  var PART_NAME = { mc: 'PHẦN I. Trắc nghiệm nhiều phương án lựa chọn', tf: 'PHẦN II. Trắc nghiệm đúng sai', sa: 'PHẦN III. Trắc nghiệm trả lời ngắn', es: 'PHẦN IV. Tự luận' };
  var PART_HINT = {
    mc: 'Mỗi câu chọn một phương án đúng.',
    tf: 'Mỗi ý a), b), c), d) chọn Đúng hoặc Sai.',
    sa: 'Ghi đáp số là một số (dùng dấu phẩy cho số thập phân, ví dụ: -1,5).',
    es: 'Làm bài ra giấy (hoặc gõ tóm tắt vào ô). Giáo viên chấm phần này.'
  };
  var LETTERS = 'ABCD';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(x) { var s = (Math.round(x * 100) / 100).toString(); return s.replace('.', ','); }

  // Dựng công thức: $...$ -> KaTeX (nếu có), phần chữ giữ nguyên (cho phép <b>, <i>, <br>)
  // Lọc HTML trong nội dung đề: chỉ giữ thẻ định dạng an toàn, bỏ script, sự kiện on…, liên kết javascript:
  var THE_DUOC = /^(B|I|U|EM|STRONG|BR|SUB|SUP|SPAN|DIV|P|SMALL|MARK|TABLE|THEAD|TBODY|TR|TD|TH|IMG|UL|OL|LI|S|CODE)$/;
  var THUOC_TINH = /^(class|colspan|rowspan|alt|src|width|height)$/;
  function sach(s) {
    if (!/[<&]/.test(s) || !G.document) return s;
    var t = G.document.createElement('template'); t.innerHTML = s;
    (function don(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 8) { c.remove(); return; }
        if (c.nodeType !== 1) return;
        if (!THE_DUOC.test(c.tagName)) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|LINK|META|svg|SVG|MATH|TEMPLATE|FORM|BASE)$/i.test(c.tagName)) { c.remove(); return; }
          var f = G.document.createDocumentFragment(); while (c.firstChild) f.appendChild(c.firstChild); don(f); c.replaceWith(f); return;
        }
        [].slice.call(c.attributes).forEach(function (a) {
          var ten = a.name.toLowerCase();
          if (!THUOC_TINH.test(ten)) c.removeAttribute(a.name);
          else if (ten === 'src' && !/^(data:image\/(png|jpe?g|gif|webp);|https:\/\/|\.?\.?\/?[\w\-./%]+$)/i.test(a.value.trim())) c.removeAttribute(a.name);
        });
        don(c);
      });
    })(t.content);
    return t.innerHTML;
  }
  function tex(s, pre) {
    if (s == null) return '';
    s = String(s);
    if (pre || !G.katex) return sach(s);
    var ra = [], cuoi = 0;
    s.replace(/\$([^$]+)\$/g, function (m, t, vt) {
      ra.push(sach(s.slice(cuoi, vt)));
      try { ra.push(G.katex.renderToString(t, { throwOnError: false, strict: false })); } catch (e) { ra.push(esc(m)); }
      cuoi = vt + m.length; return m;
    });
    ra.push(sach(s.slice(cuoi)));
    return ra.join('');
  }

  function tfScore(k) { return [0, 0.1, 0.25, 0.5, 1][k]; }

  function parseNum(s) {
    if (s == null) return NaN;
    s = String(s).trim().replace(/\s+/g, '').replace(/[\u2212\u2013\u2014\u2012]/g, '-').replace(',', '.');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }

  function grade(exam, ans) {
    var res = { parts: [], auto: 0, maxAuto: 0, essayMax: 0, detail: [] };
    exam.parts.forEach(function (p, pi) {
      var pr = { type: p.type, correct: 0, n: p.qs.length, score: 0, max: 0 };
      p.qs.forEach(function (q, qi) {
        var a = ans[pi][qi], d = { p: pi, q: qi, type: p.type, a: a };
        if (p.type === 'mc') {
          d.ok = a === q.ans; d.earn = d.ok ? p.pts : 0; pr.max += p.pts;
          if (d.ok) pr.correct++;
        } else if (p.type === 'tf') {
          var k = 0; q.items.forEach(function (it, j) { if (a && a[j] === it.ans) k++; });
          d.k = k; d.ok = k === 4; d.earn = tfScore(k) * p.pts; pr.max += p.pts;
          if (d.ok) pr.correct++;
        } else if (p.type === 'sa') {
          var x = parseNum(a), y = parseNum(q.ans);
          d.ok = !isNaN(x) && !isNaN(y) && Math.abs(x - y) < 1e-9; d.earn = d.ok ? p.pts : 0; pr.max += p.pts;
          if (d.ok) pr.correct++;
        } else {
          d.ok = null; d.earn = 0; res.essayMax += (q.pts || p.pts);
        }
        pr.score += d.earn;
        res.detail.push(d);
      });
      if (p.type !== 'es') { res.auto += pr.score; res.maxAuto += pr.max; }
      res.parts.push(pr);
    });
    res.auto = Math.round(res.auto * 100) / 100;
    res.maxAuto = Math.round(res.maxAuto * 100) / 100;
    return res;
  }

  function emptyAnswers(exam) {
    return exam.parts.map(function (p) {
      return p.qs.map(function () { return p.type === 'tf' ? [null, null, null, null] : (p.type === 'mc' ? null : ''); });
    });
  }

  function answered(p, a) {
    if (p.type === 'mc') return a !== null && a !== undefined;
    if (p.type === 'tf') return a && a.every(function (x) { return x !== null; });
    return a && String(a).trim() !== '';
  }

  function figHtml(f, cls) {
    if (!f) return '';
    var src = String(f.src || f.data || f.png || '').trim();
    if (!/^(data:image\/(png|jpe?g|gif|webp|svg\+xml);|https:\/\/|\.?\.?\/?[\w\-./%]+$)/i.test(src)) return '';
    src = esc(src);
    var w = Math.round((f.w || 5) * 38);
    return '<div class="er-fig ' + (cls || '') + '"><img alt="Hình vẽ" src="' + src + '" style="max-width:min(100%,' + w + 'px)"></div>';
  }
  function tableHtml(t, pre) {
    if (!t) return '';
    var h = '<div class="er-tablewrap"><table class="er-table">';
    t.forEach(function (row, i) {
      h += '<tr>' + row.map(function (c) { return (i === 0 ? '<th>' : '<td>') + tex(c, pre) + (i === 0 ? '</th>' : '</td>'); }).join('') + '</tr>';
    });
    return h + '</table></div>';
  }
  function body(q, pre) {
    return '<div class="er-stem">' + tex(q.stem, pre) + '</div>' + tableHtml(q.table, pre) + figHtml(q.fig) + (q.after ? '<div class="er-stem">' + tex(q.after, pre) + '</div>' : '');
  }

  // Đề có kèm đáp án chưa (bản web đã tách đáp án: phải nộp bài mới nhận lời giải)
  function coDapAn(exam) {
    var p = exam.parts[0], q = p && p.qs[0];
    if (!q) return true;
    if (p.type === 'tf') return q.items && q.items[0] && q.items[0].ans !== undefined;
    if (p.type === 'es') return !!q.sol;
    return q.ans !== undefined;
  }
  // Ghép phần riêng (đáp án, lời giải) vào đề công khai
  function ghep(exam, rieng) {
    var e = JSON.parse(JSON.stringify(exam));
    (rieng || []).forEach(function (pp, pi) {
      (pp || []).forEach(function (r, qi) {
        var q = e.parts[pi] && e.parts[pi].qs[qi]; if (!q || !r) return;
        Object.keys(r).forEach(function (k) {
          if (k === 'items') r.items.forEach(function (it, j) { if (q.items[j]) { q.items[j].ans = it.ans; q.items[j].expl = it.expl; } });
          else q[k] = r[k];
        });
      });
    });
    delete e.anDap;
    return e;
  }

  // Hộp thoại trong trang (không dùng alert/confirm của trình duyệt để không làm thoát toàn màn hình)
  function hop(el, html, nut) {
    var m = document.createElement('div'); m.className = 'er-ov';
    m.innerHTML = '<div class="er-ov-in">' + html + '<div class="er-ov-b">' + nut.map(function (b, i) { return '<button type="button" class="er-btn' + (b.chinh ? ' er-btn-y' : '') + '" data-i="' + i + '">' + b.chu + '</button>'; }).join(' ') + '</div></div>';
    (el.ownerDocument || document).body.appendChild(m);
    m.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { m.remove(); var f = nut[+b.dataset.i].lam; if (f) f(); }; });
    return m;
  }

  function vaoToanManHinh() {
    var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!f) return Promise.resolve(false);
    try {
      var r = f.call(d);
      var cho = new Promise(function (ok) { setTimeout(function () { ok(dangToanManHinh()); }, 1500); });   // trình duyệt không trả lời -> vẫn cho làm bài
      return Promise.race([(r && r.then ? r : Promise.resolve()).then(function () { return true; }, function () { return false; }), cho]);
    } catch (e) { return Promise.resolve(false); }
  }
  function dangToanManHinh() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function raToanManHinh() { try { if (dangToanManHinh()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { } }

  function mount(el, exam, opt) {
    opt = opt || {};
    var pre = !!(opt.pre || exam.pre);
    var cg = !!opt.chongGian;                      // phòng thi: toàn màn hình, không chuyển tab
    // Điện thoại / máy tính bảng: không ép toàn màn hình (bàn phím ảo làm thoát toàn màn hình) và KHÔNG huỷ bài khi em rời trang
    // (em cần nhắn Zalo cho thầy cô, nhận cuộc gọi…) — chỉ ghi nhận để thầy cô biết.
    var coTuLuan = exam.parts.some(function (p) { return p.type === 'es'; });
    var tamNghiDen = 0, roiLuc = 0, khoaMan = null, nghiTimer = null, nghiBar = null;   // nghỉ lấy ảnh · lúc rời trang (điện thoại) · giữ sáng màn hình
    var mobi = (function () { try { return matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile|Zalo|FB_IAB|FBAN/i.test(navigator.userAgent); } catch (e) { return false; } })();
    var key = 'er_bai_' + exam.id + '_' + (exam.ver || '');
    var state = null;
    try { state = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { state = null; }
    if (!state || !state.ans || state.done || (exam.time * 60 - (Date.now() - state.start) / 1000) <= 0)
      state = { ans: emptyAnswers(exam), start: Date.now(), done: false, vp: 0, lamLai: 0 };
    state.vp = state.vp || 0; state.lamLai = state.lamLai || 0; state.anh = state.anh || {};
    var timer = null, submitted = false, dangThi = false, daVaoFS = false, lanCuoi = 0, wm = null;
    var chupAnh = false, mayAnhHet = 0;   // đang mở máy ảnh / chọn ảnh: không tính là rời trang

    function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { } }

    // ---------------- phòng thi
    function cong() {
      var tiep = state.ans.some(function (p) { return p.some(function (a) { return a !== null && a !== '' && !(Array.isArray(a) && a.every(function (x) { return x === null; })); }); });
      el.innerHTML = '<div class="er"><div class="er-q er-cong"><h1>' + esc(exam.title) + '</h1>' +
        (opt.student ? '<p>Thí sinh: <b>' + esc(opt.student.name) + '</b> · Lớp ' + esc(opt.student.lop) + ' · ' + esc(opt.student.truong) + '</p>' : '') +
        '<p>Thời gian: <b>' + exam.time + ' phút</b> · ' + exam.parts.map(function (p) { return p.qs.length; }).reduce(function (a, b) { return a + b; }, 0) + ' câu.</p>' +
        '<div class="er-quyche"><b>🛡️ Quy chế phòng thi</b><ul>' +
        (mobi ? '<li>Em làm bài ngay trên điện thoại; máy tự <b>giữ màn hình luôn sáng</b>. Rời trang ngắn (' + (coTuLuan ? 'dưới 20 phút — đủ để em viết bài ra giấy rồi chụp' : 'dưới 2 phút') + ') không bị tính; rời lâu hơn sẽ được <b>ghi nhận và báo cho giáo viên</b>.</li>' +
          '<li><b>Bài làm của em luôn được giữ nguyên</b> khi rời trang hoặc tải lại. Cần báo lỗi cho thầy/cô: bấm nút <b>🆘 Báo lỗi</b> trên thanh trên cùng (không bị tính là vi phạm).</li>' :
          '<li>Bài làm ở chế độ <b>toàn màn hình</b>. Không thoát toàn màn hình, không chuyển sang tab hay ứng dụng khác.</li>' +
          (coTuLuan ? '<li><b>Có phần tự luận:</b> em làm ra giấy, chụp bằng điện thoại rồi chuyển ảnh sang máy tính. Cần mở Zalo / thư mục để lấy ảnh thì bấm nút <b>📱 Lấy ảnh từ điện thoại</b> trên thanh trên cùng: được <b>nghỉ 10 phút không tính vi phạm</b> (đồng hồ làm bài vẫn chạy). Bấm <b>📷 Chọn ảnh</b> cũng được nghỉ tương tự.</li>' : '') +
          '<li>Vi phạm <b>lần 1</b>: hệ thống ghi nhận và cảnh báo. Từ <b>lần 2</b>: bài đang làm bị huỷ, em phải <b>làm lại từ đầu</b>. Mọi lần vi phạm đều được báo cho giáo viên. Cần báo lỗi cho thầy/cô: bấm <b>🆘 Báo lỗi</b> (không bị tính là vi phạm).</li>') +
        '<li>Đáp án và lời giải chỉ hiện <b>sau khi nộp bài</b>; điểm do máy chủ chấm.</li></ul></div>' +
        (state.vp ? '<p class="er-why bad">Em đã vi phạm ' + state.vp + ' lần trong bài này.</p>' : '') +
        '<p style="text-align:center"><button class="er-btn er-btn-y er-big" id="er-vao">' + (tiep ? 'Tiếp tục làm bài' : 'Vào phòng thi') + '</button>' +
        (opt.onExit ? ' <button class="er-btn" id="er-ve">Quay lại</button>' : '') + '</p></div></div>';
      el.querySelector('#er-vao').onclick = function () {
        (mobi ? Promise.resolve(false) : vaoToanManHinh()).then(function (ok) { daVaoFS = ok; batDau(); });
      };
      var v = el.querySelector('#er-ve'); if (v) v.onclick = function () { opt.onExit(); };
    }
    function batDau() {
      dangThi = true;
      if (cg) giuManHinh();
      render();
      if (cg) {
        el.classList.add('er-khoa');
        var hs = opt.student || {};
        wm = document.createElement('div'); wm.className = 'er-wm'; wm.setAttribute('aria-hidden', 'true');
        var s = esc((hs.name || 'Thí sinh') + ' · ' + (hs.lop || '') + ' · ' + new Date().toLocaleDateString('vi-VN'));
        wm.innerHTML = new Array(40).join('<span>' + s + '</span>');
        document.body.appendChild(wm);
        document.body.classList.add('er-dang-thi');
      }
    }
    function viPham(hanhVi) {
      if (!cg || !dangThi || submitted) return;
      var now = Date.now(); if (now - lanCuoi < (mobi ? 20000 : 2500)) return; lanCuoi = now;
      state.vp++;
      var huy = !mobi && state.vp >= 2;
      var xuLy = huy ? 'Huỷ bài, làm lại từ đầu' : (mobi ? 'Ghi nhận, giữ nguyên bài (điện thoại)' : 'Cảnh báo');
      if (huy) { state.ans = emptyAnswers(exam); state.anh = {}; state.start = Date.now(); state.lamLai++; }
      save();
      if (opt.onViPham) try { opt.onViPham({ lan: state.vp, hanhVi: hanhVi, xuLy: xuLy }); } catch (e) { }
      if (huy) { restore(); palette(); tick(); window.scrollTo(0, 0); }
      var cu = document.querySelector('.er-ov'); if (cu) cu.remove();
      hop(el, huy
        ? '<h2>⛔ Bài làm đã bị huỷ</h2><p>Em vừa <b>' + esc(hanhVi.toLowerCase()) + '</b> (lần ' + state.vp + '). Theo quy chế, bài đang làm bị xoá và đồng hồ tính lại từ đầu. Giáo viên đã nhận được thông báo.</p>'
        : mobi ? '<h2>ℹ️ Em vừa rời khỏi trang làm bài</h2><p>Bài làm của em <b>vẫn được giữ nguyên</b>. Việc rời trang đã được ghi nhận và báo cho giáo viên (lần ' + state.vp + '). Cần báo lỗi cho thầy/cô, em bấm nút <b>🆘 Báo lỗi</b> ở trên cùng để không bị tính.</p>'
        : '<h2>⚠️ Cảnh báo vi phạm (lần 1)</h2><p>Em vừa <b>' + esc(hanhVi.toLowerCase()) + '</b>. Hệ thống đã ghi nhận và báo cho giáo viên.</p><p><b>Lần sau bài làm sẽ bị huỷ</b> và em phải làm lại từ đầu.</p>',
        [{ chu: 'Quay lại làm bài', chinh: true, lam: function () { if (daVaoFS) vaoToanManHinh(); } }]);
    }
    // Miễn tính vi phạm từ lúc bấm nút chụp đến khi NHẬN ĐƯỢC ẢNH hoặc bấm huỷ (+8 giây đệm), tối đa 3 phút.
    // (Điện thoại thoát toàn màn hình khi mở máy ảnh và có thể báo trễ vài giây sau khi quay lại.)
    var chupTu = 0;
    function dangChup() { return (chupAnh && Date.now() - chupTu < 900000) || Date.now() < mayAnhHet || Date.now() < tamNghiDen; }
    function veLaiSauChup() {
      if (!chupAnh) return;
      chupAnh = false; mayAnhHet = Date.now() + 25000;
      if (daVaoFS && dangThi && !submitted) setTimeout(function () {
        if (!dangToanManHinh()) hop(el, '<h2>📷 Đã nhận ảnh</h2><p>Bấm nút dưới để quay lại làm bài ở chế độ toàn màn hình.</p>', [{ chu: 'Tiếp tục làm bài', chinh: true, lam: function () { vaoToanManHinh(); } }]);
      }, 700);
    }
    function anTab() {
      if (document.visibilityState === 'hidden') {
        if (dangChup()) return;
        if (mobi) { roiLuc = Date.now(); return; }          // điện thoại: tính theo thời gian rời trang khi em quay lại
        viPham('Chuyển tab hoặc rời khỏi trang làm bài');
      } else if (mobi && roiLuc) {
        // Điện thoại: màn hình tự tắt khi em viết bài ra giấy rồi mới chụp → rời ngắn không bị tính.
        // Đề có tự luận được chờ tới 20 phút; đề chỉ trắc nghiệm 2 phút.
        var vang = Date.now() - roiLuc, hanChot = (coTuLuan ? 20 : 2) * 60000; roiLuc = 0;
        if (vang > hanChot && !dangChup()) viPham('Rời khỏi trang làm bài ' + Math.round(vang / 60000) + ' phút');
      }
    }
    // Giữ màn hình điện thoại luôn sáng khi đang làm bài (không bị tắt khi em viết ra giấy)
    function giuManHinh() {
      try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (l) { khoaMan = l; l.addEventListener('release', function () { khoaMan = null; }); }, function () { }); } catch (e) { }
    }
    function thaManHinh() { try { if (khoaMan) khoaMan.release(); } catch (e) { } khoaMan = null; }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && dangThi && !submitted && !khoaMan) giuManHinh(); });
    // Nghỉ lấy ảnh (máy tính): em cần mở Zalo / thư mục để chuyển ảnh bài làm từ điện thoại sang máy → 10 phút không tính vi phạm
    function batDauNghi() {
      tamNghiDen = Date.now() + 600000; raToanManHinh();
      if (nghiBar) nghiBar.remove();
      nghiBar = document.createElement('div'); nghiBar.className = 'er-nghi-bar';
      nghiBar.innerHTML = '<span>📱 Đang <b>tạm nghỉ để lấy ảnh</b> từ điện thoại — còn <b id="er-nghi-t">10:00</b>. Đồng hồ làm bài vẫn chạy.</span><button type="button" class="er-btn er-btn-y" id="er-nghi-xong">Xong, quay lại làm bài</button>';
      document.body.appendChild(nghiBar);
      nghiBar.querySelector('#er-nghi-xong').onclick = ketNghi;
      clearInterval(nghiTimer);
      nghiTimer = setInterval(function () {
        var c = Math.max(0, Math.ceil((tamNghiDen - Date.now()) / 1000)), t = nghiBar && nghiBar.querySelector('#er-nghi-t');
        if (t) t.textContent = Math.floor(c / 60) + ':' + ('0' + (c % 60)).slice(-2);
        if (c <= 0) ketNghi();
      }, 500);
    }
    var nghiTimer = null;
    function ketNghi() {
      clearInterval(nghiTimer); tamNghiDen = 0; mayAnhHet = Date.now() + 20000;
      if (nghiBar) { nghiBar.remove(); nghiBar = null; }
      if (daVaoFS && dangThi && !submitted && !dangToanManHinh()) hop(el, '<h2>📱 Đã xong phần lấy ảnh</h2><p>Bấm nút dưới để quay lại làm bài ở chế độ toàn màn hình.</p>', [{ chu: 'Tiếp tục làm bài', chinh: true, lam: function () { vaoToanManHinh(); } }]);
    }
    function doiFS() { if (daVaoFS && !dangToanManHinh() && !dangChup()) viPham('Thoát chế độ toàn màn hình'); }
    function chanPhim(e) {
      if (!dangThi || submitted) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'f12' || ((e.ctrlKey || e.metaKey) && (['c', 'x', 'p', 's', 'u', 'a'].indexOf(k) >= 0 || (e.shiftKey && ['i', 'j', 'c'].indexOf(k) >= 0)))) {
        var t = e.target; if (k === 'a' && t && /INPUT|TEXTAREA/.test(t.tagName)) return;
        e.preventDefault();
      }
      if (k === 'printscreen') { try { navigator.clipboard.writeText(''); } catch (x) { } }
    }
    function chan(e) { if (dangThi && !submitted && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.type !== 'contextmenu')) e.preventDefault(); }
    function boNghe() {
      thaManHinh(); clearInterval(nghiTimer); if (nghiBar) { nghiBar.remove(); nghiBar = null; }
      document.removeEventListener('visibilitychange', anTab);
      document.removeEventListener('fullscreenchange', doiFS); document.removeEventListener('webkitfullscreenchange', doiFS);
      document.removeEventListener('keydown', chanPhim, true);
      ['contextmenu', 'copy', 'cut', 'dragstart'].forEach(function (t) { el.removeEventListener(t, chan); });
      if (wm) wm.remove(); wm = null;
      document.body.classList.remove('er-dang-thi'); el.classList.remove('er-khoa');
      raToanManHinh();
    }
    if (cg) {
      document.addEventListener('visibilitychange', anTab);
      document.addEventListener('fullscreenchange', doiFS); document.addEventListener('webkitfullscreenchange', doiFS);
      document.addEventListener('keydown', chanPhim, true);
      ['contextmenu', 'copy', 'cut', 'dragstart'].forEach(function (t) { el.addEventListener(t, chan); });
    }

    function render() {
      var h = '<div class="er">';
      h += '<div class="er-top"><div class="er-top-in"><div class="er-title">' + esc(exam.title) + '</div>' +
        '<div class="er-meta"><span class="er-time" id="er-time">--:--</span><span class="er-prog" id="er-prog"></span>' + (cg ? '<span class="er-vp" id="er-vp" title="Số lần vi phạm"></span>' : '') +
        (!mobi && coTuLuan && opt.guiAnh ? '<button class="er-btn" id="er-nghi" title="Tạm nghỉ 10 phút để chuyển ảnh bài làm từ điện thoại sang máy tính (không tính vi phạm)">📱 Lấy ảnh từ điện thoại</button>' : '') + (opt.baoLoi ? '<button class="er-btn" id="er-baoloi" title="Báo lỗi cho thầy/cô qua Zalo (không bị tính là vi phạm)">🆘 Báo lỗi</button>' : '') + '<button class="er-btn er-btn-y" id="er-submit">Nộp bài</button></div></div>' +
        '<div class="er-pal" id="er-pal"></div></div>';
      if (opt.student) h += '<div class="er-who">Thí sinh: <b>' + esc(opt.student.name) + '</b> · Lớp ' + esc(opt.student.lop) + ' · ' + esc(opt.student.truong) + '</div>';
      exam.parts.forEach(function (p, pi) {
        h += '<section class="er-part"><h2>' + PART_NAME[p.type] + '</h2><p class="er-hint">' + PART_HINT[p.type] + '</p>';
        p.qs.forEach(function (q, qi) {
          var id = 'q' + pi + '_' + qi;
          h += '<article class="er-q" id="' + id + '"><div class="er-qn">Câu ' + (qi + 1) + (p.type === 'es' ? ' <span class="er-pts">(' + fmt(q.pts || p.pts) + ' điểm)</span>' : '') + '</div>' + body(q, pre);
          if (p.type === 'mc') {
            h += '<div class="er-opts">';
            q.opts.forEach(function (o, j) {
              h += '<button type="button" class="er-opt" data-p="' + pi + '" data-q="' + qi + '" data-v="' + j + '"><span class="er-L">' + LETTERS[j] + '</span><span class="er-ot">' + tex(o, pre) + '</span></button>';
            });
            h += '</div>';
          } else if (p.type === 'tf') {
            h += '<div class="er-tf">';
            q.items.forEach(function (it, j) {
              h += '<div class="er-tfrow"><div class="er-tft"><b>' + 'abcd'[j] + ')</b> ' + tex(it.t, pre) + '</div><div class="er-tfb">' +
                '<button type="button" class="er-ds" data-p="' + pi + '" data-q="' + qi + '" data-i="' + j + '" data-v="1">Đúng</button>' +
                '<button type="button" class="er-ds" data-p="' + pi + '" data-q="' + qi + '" data-i="' + j + '" data-v="0">Sai</button></div></div>';
            });
            h += '</div>';
          } else if (p.type === 'sa') {
            h += '<div class="er-sa-w"><label class="er-sa">Đáp số: <input inputmode="decimal" autocomplete="off" autocorrect="off" maxlength="9" data-p="' + pi + '" data-q="' + qi + '" placeholder="VD: -1,5"></label><button type="button" class="er-dau" title="Đổi dấu âm / dương" aria-label="Đổi dấu âm dương">−/+</button></div>';
          } else {
            h += '<textarea class="er-es" rows="4" data-p="' + pi + '" data-q="' + qi + '" placeholder="Gõ tóm tắt bài làm (không bắt buộc)…"></textarea>';
            if (opt.guiAnh) h += '<div class="er-anh" data-k="' + pi + '_' + qi + '"><label class="er-btn er-chup">📷 Chụp / chọn ảnh bài làm<input type="file" accept="image/*" multiple hidden></label><span class="er-anh-tt"></span><div class="er-anh-ds"></div></div>';
          }
          h += '</article>';
        });
        h += '</section>';
      });
      h += '<div class="er-end"><button class="er-btn er-btn-y er-big" id="er-submit2">Nộp bài</button>' + (opt.onExit ? ' <button class="er-btn" id="er-exit">Thoát</button>' : '') + '</div></div>';
      el.innerHTML = h;
      restore();
      bind();
      palette();
      tick();
      clearInterval(timer);
      timer = setInterval(tick, 1000);
    }

    function restore() {
      el.querySelectorAll('.er-opt').forEach(function (b) {
        var a = state.ans[b.dataset.p][b.dataset.q];
        b.classList.toggle('on', a === +b.dataset.v);
      });
      el.querySelectorAll('.er-ds').forEach(function (b) {
        var a = state.ans[b.dataset.p][b.dataset.q][b.dataset.i];
        b.classList.toggle('on', a !== null && a === (b.dataset.v === '1'));
      });
      el.querySelectorAll('.er-sa input, .er-es').forEach(function (i) { i.value = state.ans[i.dataset.p][i.dataset.q] || ''; });
      var v = el.querySelector('#er-vp'); if (v) { v.textContent = state.vp ? '⚠ ' + state.vp : ''; v.style.display = state.vp ? '' : 'none'; }
      el.querySelectorAll('.er-anh').forEach(veAnh);
    }
    function veAnh(box) {
      var ds = state.anh[box.dataset.k] || [];
      box.querySelector('.er-anh-ds').innerHTML = ds.map(function (a, i) { return '<span class="er-anh-o"><img src="' + a.nho + '" alt="Ảnh ' + (i + 1) + '"><button type="button" class="er-anh-x" data-i="' + i + '" title="Bỏ ảnh">✕</button></span>'; }).join('');
      var lb = box.querySelector('.er-chup'); if (lb) lb.style.display = ds.length >= 4 ? 'none' : '';
    }
    // nén ảnh: cạnh dài tối đa 1600px, JPEG; kèm ảnh nhỏ để xem trước
    function nenAnh(file) {
      return new Promise(function (ok, loi) {
        var rd = new FileReader();
        rd.onerror = function () { loi(new Error('Không đọc được ảnh.')); };
        rd.onload = function () {
          var img = new Image();
          img.onerror = function () { loi(new Error('Tệp không phải ảnh.')); };
          img.onload = function () {
            var ve = function (max, q) {
              var t = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
              c.width = Math.round(img.width * t); c.height = Math.round(img.height * t);
              var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
              return c.toDataURL('image/jpeg', q);
            };
            ok({ du: ve(1600, 0.72), nho: ve(160, 0.6) });
          };
          img.src = rd.result;
        };
        rd.readAsDataURL(file);
      });
    }

    var daBind = false;
    function bind() {
      if (daBind) return; daBind = true;
      el.addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b || submitted || !dangThi) return;
        if (b.classList.contains('er-opt')) {
          var p = +b.dataset.p, q = +b.dataset.q, v = +b.dataset.v;
          state.ans[p][q] = state.ans[p][q] === v ? null : v; save(); restore(); palette();
        } else if (b.classList.contains('er-ds')) {
          var a = state.ans[+b.dataset.p][+b.dataset.q], i = +b.dataset.i, val = b.dataset.v === '1';
          a[i] = a[i] === val ? null : val; save(); restore(); palette();
        } else if (b.classList.contains('er-dau')) {   // bàn phím số trên điện thoại không có dấu âm
          var ip = b.parentNode.querySelector('input'), vv = String(ip.value || '').trim();
          ip.value = /^[-\u2212]/.test(vv) ? vv.replace(/^[-\u2212]\s*/, '') : '-' + vv;
          ip.dispatchEvent(new Event('input', { bubbles: true })); try { ip.focus(); } catch (e) { }
        } else if (b.id === 'er-nghi') {
          batDauNghi();
        } else if (b.id === 'er-baoloi') {
          mayAnhHet = Date.now() + 240000;   // 4 phút không tính vi phạm
          try { window.open(opt.baoLoi, '_blank', 'noopener'); } catch (e) { }
        } else if (b.id === 'er-submit' || b.id === 'er-submit2') {
          confirmSubmit();
        } else if (b.id === 'er-exit') {
          if (cg) hop(el, '<h2>Thoát khỏi phòng thi?</h2><p>Bài đang làm sẽ <b>bị huỷ</b>. Lần sau em vào lại sẽ làm từ đầu.</p>', [
            { chu: 'Ở lại làm tiếp', chinh: true }, { chu: 'Thoát, huỷ bài', lam: function () { dangThi = false; clearInterval(timer); try { localStorage.removeItem(key); } catch (e) { } boNghe(); opt.onExit(); } }]);
          else if (confirm('Thoát khỏi bài làm? Bài đang làm vẫn được lưu trên máy này.')) { clearInterval(timer); opt.onExit(); }
        } else if (b.classList.contains('er-pi')) {
          var t = document.getElementById(b.dataset.t); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      var batDauChup = function (ev) { if (ev.target.closest && ev.target.closest('.er-chup') && !submitted) { chupAnh = true; chupTu = Date.now(); } };
      el.addEventListener('pointerdown', batDauChup, true);
      el.addEventListener('cancel', function (ev) { if (ev.target.closest && ev.target.closest('.er-anh')) veLaiSauChup(); }, true);   // bấm huỷ chọn ảnh
      el.addEventListener('click', function (ev) {
        batDauChup(ev);
        var x = ev.target.closest && ev.target.closest('.er-anh-x');
        if (x && !submitted) { var box = x.closest('.er-anh'); state.anh[box.dataset.k].splice(+x.dataset.i, 1); save(); veAnh(box); }
      }, true);
      el.addEventListener('change', function (ev) {
        var f = ev.target; if (!f.files || !f.closest('.er-anh') || submitted) return;
        var box = f.closest('.er-anh'), k = box.dataset.k, tt = box.querySelector('.er-anh-tt');
        setTimeout(veLaiSauChup, 300);
        var ds = state.anh[k] = state.anh[k] || [];
        var tep = Array.prototype.slice.call(f.files, 0, Math.max(0, 4 - ds.length)); f.value = '';
        var lam = function (i) {
          if (i >= tep.length) { tt.textContent = ''; return; }
          tt.textContent = '⏳ Đang gửi ảnh ' + (i + 1) + '/' + tep.length + '…';
          nenAnh(tep[i]).then(function (a) {
            return opt.guiAnh({ cau: k, du: a.du }).then(function (r) { ds.push({ id: r.id, nho: a.nho }); save(); veAnh(box); });
          }).catch(function (e) { tt.textContent = '⚠ ' + (e && e.message || 'Chưa gửi được ảnh') + ' — thử lại nhé.'; tep = []; }).then(function () { if (tep.length) lam(i + 1); });
        };
        lam(0);
      });
      el.addEventListener('input', function (ev) {
        var i = ev.target; if (!i.dataset || i.dataset.p == null || submitted) return;
        state.ans[+i.dataset.p][+i.dataset.q] = i.value; save(); palette();
      });
    }

    function palette() {
      var h = '', done = 0, total = 0;
      exam.parts.forEach(function (p, pi) {
        h += '<span class="er-pl">' + ['I', 'II', 'III', 'IV'][pi] + '</span>';
        p.qs.forEach(function (q, qi) {
          var ok = answered(p, state.ans[pi][qi]); total++; if (ok) done++;
          h += '<button type="button" class="er-pi' + (ok ? ' on' : '') + '" data-t="q' + pi + '_' + qi + '">' + (qi + 1) + '</button>';
        });
      });
      var pal = el.querySelector('#er-pal'); if (pal) pal.innerHTML = h;
      var pg = el.querySelector('#er-prog'); if (pg) pg.textContent = 'Đã làm ' + done + '/' + total;
    }

    function left() { return exam.time * 60 - Math.floor((Date.now() - state.start) / 1000); }
    function tick() {
      var s = left(), t = el.querySelector('#er-time');
      if (!t) return;
      if (s <= 0) {
        t.textContent = '00:00'; clearInterval(timer);
        if (!submitted) { if (cg) { doSubmit(); hop(el, '<h2>⏰ Hết giờ làm bài</h2><p>Bài làm đã được nộp tự động.</p>', [{ chu: 'Xem kết quả', chinh: true }]); } else { alert('Hết giờ làm bài! Bài làm được nộp tự động.'); doSubmit(); } }
        return;
      }
      var m = Math.floor(s / 60), ss = s % 60;
      t.textContent = (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
      t.classList.toggle('warn', s <= 300);
    }

    function confirmSubmit() {
      var miss = 0;
      exam.parts.forEach(function (p, pi) { if (p.type === 'es') return; p.qs.forEach(function (q, qi) { if (!answered(p, state.ans[pi][qi])) miss++; }); });
      var msg = miss ? ('Còn ' + miss + ' câu trắc nghiệm chưa trả lời. Vẫn nộp bài?') : 'Nộp bài và xem kết quả?';
      // Cảnh báo điểm vinh danh: phải làm hết các câu và không làm quá nhanh (30 giây/câu) — máy chủ kiểm tra lại
      if (opt.diemVinhDanh) {
        var nCau = 0; exam.parts.forEach(function (p) { if (p.type !== 'es') nCau += p.qs.length; });
        var daLam = Math.round((Date.now() - state.start) / 1000);
        if (miss) msg += '<br><br>⚠️ <b>Bài chưa làm hết câu sẽ KHÔNG được cộng điểm vinh danh.</b>';
        else if (daLam < nCau * 30) msg += '<br><br>⚠️ <b>Em làm quá nhanh (dưới ' + Math.ceil(nCau * 30 / 60) + ' phút) nên bài này sẽ KHÔNG được cộng điểm vinh danh.</b> Hãy kiểm tra lại bài.';
        if (!cg) msg = msg.replace(/<br>/g, '\n').replace(/<\/?b>/g, '');
      }
      if (cg) hop(el, '<h2>Nộp bài</h2><p>' + msg + '</p>', [{ chu: 'Làm tiếp' }, { chu: 'Nộp bài', chinh: true, lam: doSubmit }]);
      else if (confirm(msg)) doSubmit();
    }

    function doSubmit() {
      if (submitted) return; submitted = true; dangThi = false; clearInterval(timer);
      var ans = state.ans;
      state.done = true; save();
      try { localStorage.removeItem(key); } catch (e) { }
      if (cg) boNghe();
      var result = {
        examId: exam.id, title: exam.title, khoi: exam.khoi, loai: exam.loai,
        start: new Date(state.start).toISOString(), end: new Date().toISOString(),
        seconds: Math.round((Date.now() - state.start) / 1000),
        answers: ans, viPham: state.vp, lamLai: state.lamLai,
        anhTL: (function () { var o = {}; Object.keys(state.anh || {}).forEach(function (k) { if (state.anh[k].length) o[k] = state.anh[k].map(function (a) { return a.id; }); }); return o; })()
      };
      if (coDapAn(exam)) {                     // đề có sẵn đáp án (bản độc lập, giáo viên xem thử)
        var g = grade(exam, ans);
        Object.assign(result, { score: g.auto, maxAuto: g.maxAuto, essayMax: g.essayMax, detail: chiTiet(g) });
        ketQua(el, exam, ans, g, result, opt);
        if (opt.onSubmit) opt.onSubmit(result, trangThai);
        return;
      }
      // bản web: gửi bài -> máy chủ chấm -> nhận lời giải
      el.innerHTML = '<div class="er"><p class="er-load">⏳ Đang nộp bài và chấm điểm…</p></div>';
      (opt.nopBai ? opt.nopBai(result) : Promise.reject(new Error('Chưa kết nối máy chủ.'))).then(function (r) {
        if (r.chiDiem) {      // giáo viên chọn không hiện đáp án: chỉ báo điểm
          Object.assign(result, { score: r.diemTN, maxAuto: r.toiDaTN, ma: r.ma });
          el.innerHTML = '<div class="er er-res"><div class="er-score"><div class="er-score-l">Kết quả</div><div class="er-score-n">' + fmt(r.diemTN) + '<small> / ' + fmt(r.toiDaTN) + ' điểm</small></div>' +
            '<div class="er-score-s">' + esc(exam.title) + ' · Thầy/cô không mở đáp án, lời giải cho đề này.' + (state.vp ? ' · <b>Vi phạm: ' + state.vp + ' lần</b>' : '') + '</div><div class="er-send ok">✔ Đã nộp bài cho thầy/cô.</div></div>' +
            (opt.onExit ? '<p style="text-align:center"><button class="er-btn er-btn-y" id="er-back">Về trang luyện đề</button></p>' : '') + '</div>';
          var bk0 = el.querySelector('#er-back'); if (bk0) bk0.onclick = function () { opt.onExit(); };
          if (opt.onSubmit) opt.onSubmit(result, trangThai, null);
          return;
        }
        var full = ghep(exam, r.rieng);
        var g = grade(full, ans);
        if (r.diemTN != null && Math.abs(r.diemTN - g.auto) > 1e-6) g.auto = +r.diemTN;
        Object.assign(result, { score: g.auto, maxAuto: g.maxAuto, essayMax: g.essayMax, detail: chiTiet(g), ma: r.ma });
        ketQua(el, full, ans, g, result, opt);
        trangThai(r.thongBao || '✔ Đã nộp bài. Điểm do máy chủ chấm.', true);
        if (opt.onSubmit) opt.onSubmit(result, trangThai, full);
      }).catch(function (e) {
        if (e && e.hetGio) {   // máy chủ không nhận bài vì quá hạn
          el.innerHTML = '<div class="er"><div class="er-q er-cong"><h2>⌛ Đã hết thời gian nộp bài</h2><p>' + esc(e.message) + '</p>' +
            (opt.onExit ? '<p><button class="er-btn er-btn-y" id="er-back">Về danh sách đề</button></p>' : '') + '</div></div>';
          var bk1 = el.querySelector('#er-back'); if (bk1) bk1.onclick = function () { opt.onExit(); };
          return;
        }
        el.innerHTML = '<div class="er"><div class="er-q er-cong"><h2>📨 Bài làm đã được lưu</h2><p>' + esc(e && e.message || 'Chưa gửi được bài.') + '</p>' +
          '<p>Máy sẽ tự gửi lại khi có mạng. Điểm, đáp án và lời giải hiện ra sau khi bài được gửi thành công (xem ở mục <b>Bài đã làm</b>).</p>' +
          (opt.onExit ? '<p><button class="er-btn er-btn-y" id="er-back">Về danh sách đề</button></p>' : '') + '</div></div>';
        var bk = el.querySelector('#er-back'); if (bk) bk.onclick = function () { opt.onExit(); };
        if (opt.onSubmit) opt.onSubmit(result, trangThai, null);
      });
    }
    function trangThai(msg, ok) {
      var s = el.querySelector('#er-send'); if (s) { s.textContent = msg; s.className = 'er-send ' + (ok ? 'ok' : 'err'); }
    }

    if (cg) cong(); else batDau();
    return { stop: function () { clearInterval(timer); boNghe(); } };
  }

  function chiTiet(g) { return g.detail.map(function (d) { return [d.p, d.q, d.ok === null ? null : (d.ok ? 1 : 0), Math.round(d.earn * 100) / 100]; }); }

  // Trang kết quả + xem lại (dùng cả cho mục "Bài đã làm")
  function ketQua(el, exam, ans, g, result, opt) {
    opt = opt || {};
    var pre = !!(opt.pre || exam.pre);
    var max10 = g.maxAuto + g.essayMax;
    var h = '<div class="er er-res">';
    h += '<div class="er-score"><div class="er-score-l">' + (opt.xemLai ? 'Xem lại bài làm' : 'Kết quả') + '</div><div class="er-score-n">' + fmt(g.auto) + '<small> / ' + fmt(g.maxAuto) + ' điểm</small></div>';
    if (g.essayMax) h += '<div class="er-score-s">Phần tự luận (' + fmt(g.essayMax) + ' điểm) do giáo viên chấm. Tổng điểm bài = ' + fmt(g.auto) + ' + điểm tự luận (tối đa ' + fmt(max10) + ').</div>';
    h += '<div class="er-score-s">' + esc(exam.title) + (opt.student ? ' · ' + esc(opt.student.name) + ' – ' + esc(opt.student.lop) : '') +
      (result.seconds != null ? ' · Thời gian làm: ' + Math.floor(result.seconds / 60) + ' phút ' + (result.seconds % 60) + ' giây' : '') +
      (result.end ? ' · Nộp lúc ' + new Date(result.end).toLocaleString('vi-VN') : '') + (result.viPham ? ' · <b>Vi phạm: ' + result.viPham + ' lần</b>' : '') + '</div>';
    h += '<div id="er-send" class="er-send"></div></div>';
    h += '<table class="er-sum"><tr><th>Phần</th><th>Số câu đúng</th><th>Điểm</th><th>Cách tính</th></tr>';
    exam.parts.forEach(function (p, pi) {
      var pr = g.parts[pi];
      if (p.type === 'es') { h += '<tr><td>IV. Tự luận</td><td>—</td><td>chờ chấm</td><td>Giáo viên chấm theo hướng dẫn chấm</td></tr>'; return; }
      var rule = p.type === 'mc' ? 'Mỗi câu đúng ' + fmt(p.pts) + ' điểm' : p.type === 'sa' ? 'Mỗi câu đúng ' + fmt(p.pts) + ' điểm' : 'Mỗi câu: đúng 1 ý 0,1 · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1 điểm';
      h += '<tr><td>' + ['I. Nhiều lựa chọn', 'II. Đúng – Sai', 'III. Trả lời ngắn', ''][pi] + '</td><td>' + pr.correct + '/' + pr.n + (p.type === 'tf' ? ' câu đúng cả 4 ý' : '') + '</td><td><b>' + fmt(pr.score) + '</b> / ' + fmt(pr.max) + '</td><td>' + rule + '</td></tr>';
    });
    h += '</table>';
    // kiến thức cần ôn: gom câu sai theo bài học
    var on = {};
    g.detail.forEach(function (d) {
      if (d.ok !== false) return;
      var q = exam.parts[d.p].qs[d.q], b = (q.m && q.m.nd) || '';
      if (b) on[b] = (on[b] || 0) + 1;
    });
    var ks = Object.keys(on).sort(function (a, b) { return on[b] - on[a]; });
    if (ks.length) h += '<div class="er-on"><b>🩹 Kiến thức em cần ôn lại:</b><ul>' + ks.slice(0, 6).map(function (k) { return '<li>' + tex(k) + ' <small>(' + on[k] + ' câu sai)</small></li>'; }).join('') + '</ul></div>';
    h += '<div class="er-filter"><label><input type="checkbox" id="er-onlywrong"> Chỉ xem câu sai</label> <button class="er-btn" id="er-print">In / lưu PDF</button>' + (opt.onExit ? ' <button class="er-btn er-btn-y" id="er-back">Về danh sách đề</button>' : '') + '</div>';
    exam.parts.forEach(function (p, pi) {
      h += '<section class="er-part"><h2>' + PART_NAME[p.type] + '</h2>';
      p.qs.forEach(function (q, qi) {
        var d = g.detail.filter(function (x) { return x.p === pi && x.q === qi; })[0];
        var a = (ans[pi] || [])[qi];
        if (a === undefined) a = p.type === 'tf' ? [null, null, null, null] : null;
        var cls = d.ok === null ? 'es' : (d.ok ? 'ok' : 'bad');
        h += '<article class="er-q er-rv ' + cls + '"><div class="er-qn">Câu ' + (qi + 1) + ' <span class="er-badge">' +
          (d.ok === null ? 'Tự luận' : (d.ok ? '✔ Đúng' : (p.type === 'tf' ? 'Đúng ' + d.k + '/4 ý' : '✘ Sai'))) + (d.ok === null ? '' : ' · ' + fmt(d.earn) + ' đ') + '</span>' +
          (q.m && q.m.nd ? '<span class="er-bai">' + tex(q.m.nd) + '</span>' : '') + '</div>' + body(q, pre);
        if (p.type === 'mc') {
          h += '<div class="er-opts">';
          q.opts.forEach(function (o, j) {
            var c = j === q.ans ? ' right' : (a === j ? ' wrong' : '');
            h += '<div class="er-opt' + c + '"><span class="er-L">' + LETTERS[j] + '</span><span class="er-ot">' + tex(o, pre) + '</span></div>';
          });
          h += '</div>';
          if (a === null || a === undefined) h += '<div class="er-why bad">Em chưa chọn đáp án. Đáp án đúng: <b>' + LETTERS[q.ans] + '</b>.</div>';
          else if (a !== q.ans) h += '<div class="er-why bad">Em chọn <b>' + LETTERS[a] + '</b> — chưa đúng' + (q.notes && q.notes[a] ? ': ' + tex(q.notes[a], pre) : '') + '. Đáp án đúng: <b>' + LETTERS[q.ans] + '</b>.</div>';
          h += '<div class="er-sol"><b>Lời giải.</b> ' + tex(q.expl, pre) + '</div>';
        } else if (p.type === 'tf') {
          h += '<div class="er-tf">';
          q.items.forEach(function (it, j) {
            var aj = a ? a[j] : null, okj = aj === it.ans;
            h += '<div class="er-tfrow ' + (okj ? 'ok' : 'bad') + '"><div class="er-tft"><b>' + 'abcd'[j] + ')</b> ' + tex(it.t, pre) +
              '<div class="er-mini">Em chọn: <b>' + (aj === null || aj === undefined ? '—' : (aj ? 'Đúng' : 'Sai')) + '</b> · Đáp án: <b>' + (it.ans ? 'Đúng' : 'Sai') + '</b>. ' + tex(it.expl, pre) + '</div></div></div>';
          });
          h += '</div>';
        } else if (p.type === 'sa') {
          h += '<div class="er-why ' + (d.ok ? 'ok' : 'bad') + '">Em trả lời: <b>' + esc(a || '—') + '</b> · Đáp án: <b>' + esc(q.ans) + '</b></div>';
          h += '<div class="er-sol"><b>Lời giải.</b> ' + tex(q.expl, pre) + '</div>';
        } else {
          if (a) h += '<div class="er-why">Bài làm của em: <div class="er-pre">' + esc(a) + '</div></div>';
          var soAnh = ((result.anhTL || {})[pi + '_' + qi] || []).length;
          if (soAnh) h += '<div class="er-why ok">📷 Em đã gửi ' + soAnh + ' ảnh bài làm câu này — thầy/cô chấm và báo điểm sau.</div>';
          h += '<div class="er-sol"><b>Hướng dẫn chấm.</b><table class="er-table er-rub"><tr><th>Nội dung</th><th>Điểm</th></tr>' +
            (q.sol || []).map(function (s) { return '<tr><td style="text-align:left">' + tex(s.t, pre) + '</td><td>' + fmt(s.p) + '</td></tr>'; }).join('') + '</table>' +
            (q.solfig ? figHtml(q.solfig) : '') + '</div>';
        }
        h += '</article>';
      });
      h += '</section>';
    });
    h += '</div>';
    el.innerHTML = h;
    window.scrollTo(0, 0);
    var ow = el.querySelector('#er-onlywrong');
    ow.addEventListener('change', function () { el.querySelectorAll('.er-rv.ok').forEach(function (x) { x.style.display = ow.checked ? 'none' : ''; }); });
    el.querySelector('#er-print').addEventListener('click', function () { window.print(); });
    var bk = el.querySelector('#er-back'); if (bk) bk.addEventListener('click', function () { opt.onExit(); });
  }

  // Xem lại một lượt đã làm: exam phải có đáp án (đã ghép phần riêng)
  function xemLai(el, exam, ans, info, opt) {
    var g = grade(exam, ans);
    ketQua(el, exam, ans, g, info || {}, Object.assign({ xemLai: true }, opt || {}));
    return g;
  }

  G.ExamRunner = { mount: mount, grade: grade, tex: tex, esc: esc, fmt: fmt, parseNum: parseNum, PART_NAME: PART_NAME, tfScore: tfScore, ghep: ghep, coDapAn: coDapAn, xemLai: xemLai, emptyAnswers: emptyAnswers };
})(window);
