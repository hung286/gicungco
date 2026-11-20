/* 🧑‍🏫 KHO ĐỀ CỦA GIÁO VIÊN — tạo đề từ ngân hàng câu hỏi (câu do máy sinh, có đáp án + lời giải), sửa, trộn mã, xuất Word,
 * xuất bản link cho học sinh, xem kết quả (cần mã của Ban quản trị). Dùng các hàm chung của app qua window.APP.
 */
(function (G) {
  'use strict';
  var A = G.APP, R = G.ExamRunner, esc = R.esc, fmt = R.fmt;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MUC = { B: 'Biết', H: 'Hiểu', VD: 'Vận dụng' };
  var LOAI_TEN = { mc: 'Nhiều lựa chọn', tf: 'Đúng – Sai', sa: 'Trả lời ngắn', es: 'Tự luận' };
  var NH = {};           // ngân hàng đã giải mã theo khối
  var KHOA_NH = null;

  function tk() { return A.tk(); }
  function goi(lenh, d) { d = d || {}; d.token = (tk() || {}).token; return A.call(lenh, d); }
  function hetPhien(r) { if (r && r.hsAuth === false) { A.dangXuat(); return true; } return false; }
  function ngauNhien(n) { return Math.floor(Math.random() * n); }
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = ngauNhien(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sao(o) { return JSON.parse(JSON.stringify(o)); }

  function napNH(k) {
    if (NH[k]) return Promise.resolve(NH[k]);
    var p = KHOA_NH ? Promise.resolve(KHOA_NH) : goi('nhKhoa').then(function (r) { if (hetPhien(r)) throw new Error('Phiên đăng nhập đã hết hạn.'); if (!r || !r.ok) throw new Error((r && r.error) || 'Không lấy được khoá ngân hàng.'); KHOA_NH = r.khoa; return KHOA_NH; });
    return p.then(function (kh) {
      if (!kh[k]) throw new Error('Máy chủ chưa có ngân hàng khối ' + k + ' (quản trị cần dán tệp DapAn.gs mới).');
      return A.giaiMaTxt('data/nh/' + k + '.txt?v=' + (G.PB_NH || ''), kh[k]);
    }).then(function (nh) {
      var ten = {};
      nh.slots.forEach(function (s) { var m = /^(Bài\s*[\d,\s–-]+)[.:]/.exec(s.nd); s.bai = m ? s.cd + '|' + m[1].replace(/\s+/g, ' ').trim() : s.cd + '|' + s.nd; if (!ten[s.bai] || s.nd.length > ten[s.bai].length) ten[s.bai] = s.nd; });
      nh.slots.forEach(function (s) { s.baiTen = ten[s.bai]; });
      nh.items.forEach(function (it, i) { it.id = k + '-' + i; it.slot = nh.slots[it.s]; });
      NH[k] = nh; return nh;
    });
  }

  // ================================================================ TRANG CHÍNH
  function moTrang() {
    var t = tk();
    if (!t) return A.home();
    if (t.vaiTro !== 'Giáo viên' && t.vaiTro !== 'Quản trị') {
      A.shell('<section class="ap-card"><h1>🧑‍🏫 Kho đề của giáo viên</h1><p>Chức năng tạo đề dành cho tài khoản có vai trò <b>Giáo viên</b>. Tài khoản <b>' + esc(t.user) + '</b> đang là <b>' + esc(t.vaiTro || 'Học sinh') + '</b>.</p><p>Thầy cô tạo tài khoản mới với vai trò Giáo viên, hoặc nhắn Ban quản trị để đổi vai trò.</p><button class="er-btn er-btn-y" id="kd-ve">Quay lại</button></section>');
      $('#kd-ve').onclick = function () { A.home(); }; return;
    }
    A.shell('<section class="ap-card"><div class="kd-dau"><div><h1 style="margin:0">🧑‍🏫 Kho đề của tôi</h1><p class="ap-note" id="kd-han">Đang kiểm tra hạn mức…</p></div>' +
      '<div class="kd-nut"><button class="er-btn er-btn-y" id="kd-moi">＋ Tạo đề mới</button><button class="er-btn" id="kd-lop">🏫 Lớp học của tôi</button><button class="er-btn" id="kd-goi">⭐ Đăng ký gói</button><button class="er-btn" id="kd-ve">← Về luyện đề</button></div></div>' +
      '<p class="ap-note">Tạo đề theo 3 cách: <b>chọn đề có sẵn</b> trên web, <b>tự chọn câu</b> theo thành phần và mức độ từ ngân hàng, hoặc <b>tải đề của thầy cô</b> từ máy tính (Word theo mẫu). Sửa, đổi câu → trộn mã, chống gian lận → <b>xuất bản</b> lấy link hoặc <b>giao cho lớp</b>, tải Word. <b>3 đề đầu tiên</b> xem kết quả miễn phí; từ đề thứ 4 cần mã của Ban quản trị (hoặc gói).</p>' +
      '<div id="kd-ds"><p class="ap-load">Đang tải đề của thầy cô…</p></div></section>');
    $('#kd-ve').onclick = function () { A.home(); };
    $('#kd-moi').onclick = function () { buoc1(); };
    $('#kd-goi').onclick = dangKyGoi;
    $('#kd-lop').onclick = function () { G.LOP_HOC.lopGV(); };
    goi('gvHanMuc').then(function (r) {
      if (hetPhien(r)) return;
      if (!r || !r.ok) { $('#kd-han').textContent = (r && r.error) || 'Máy chủ chưa hỗ trợ kho đề — quản trị cần cập nhật Code.gs.'; return; }
      HAN = r;
      $('#kd-han').innerHTML = r.qt ? '👑 Tài khoản <b>Quản trị</b> — tạo đề, xem kết quả, giao lớp <b>không giới hạn</b>.' : r.goiDen ? '⭐ Gói tạo đề còn hạn đến <b>' + new Date(r.goiDen).toLocaleDateString('vi-VN') + '</b> — tạo đề không giới hạn.' :
        'Đã tạo <b>' + r.daTao + '</b> đề · còn <b>' + r.conLai + '/' + r.mienPhi + '</b> lượt miễn phí.' + (r.conLai ? '' : ' Đăng ký gói để tạo thêm.');
    });
    veDanhSach();
  }
  var HAN = null;
  function veDanhSach() {
    goi('gvDanhSachDe').then(function (r) {
      if (hetPhien(r)) return;
      var box = $('#kd-ds'); if (!box) return;
      if (!r || !r.ok) { box.innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Không tải được.') + '</p>'; return; }
      var ds = (r.ds || []).sort(function (a, b) { return String(b.capNhat).localeCompare(String(a.capNhat)); });
      if (!ds.length) { box.innerHTML = '<p>Thầy cô chưa có đề nào. Bấm <b>＋ Tạo đề mới</b> để bắt đầu.</p>'; return; }
      box.innerHTML = '<div class="ap-tw"><table class="ap-t"><tr><th>Đề</th><th>Khối</th><th>Mã đề</th><th>Trạng thái</th><th>Lượt làm</th><th>Xem kết quả</th><th></th></tr>' + ds.map(function (x, i) {
        var kq = x.kqMienPhi ? '<span class="ap-tt ok" title="Một trong 3 đề đầu tiên">🆓 Miễn phí</span>' : x.kqMo ? '<span class="ap-tt ok">✔ Đã mở</span>' : x.kqMo === false ? '<span class="ap-tt cho">🔒 Cần mã</span>' : '';
        return '<tr><td><b>' + esc(x.title) + '</b><br><small>sửa ' + new Date(x.capNhat).toLocaleString('vi-VN') + '</small></td><td>' + esc(x.khoi) + '</td><td>' + esc(x.soMa) + '</td><td><span class="ap-tt ' + (x.trangThai === 'Đã xuất bản' ? 'ok' : 'cho') + '">' + esc(x.trangThai) + '</span></td><td>' + x.luot + '</td><td>' + kq + '</td>' +
          '<td class="ap-act"><button class="er-btn ap-sm" data-a="sua" data-i="' + i + '">✏️ Mở / sửa</button>' + (x.trangThai === 'Đã xuất bản' ? '<button class="er-btn ap-sm" data-a="link" data-i="' + i + '">🔗 Link</button><button class="er-btn ap-sm" data-a="giao" data-i="' + i + '">🏫 Giao lớp</button>' : '') +
          '<button class="er-btn ap-sm" data-a="word" data-i="' + i + '">⬇ Word</button><button class="er-btn ap-sm" data-a="kq" data-i="' + i + '">📊 Kết quả</button><button class="er-btn ap-sm ap-del" data-a="xoa" data-i="' + i + '">🗑</button></td></tr>';
      }).join('') + '</table></div>';
      $$('#kd-ds [data-a]').forEach(function (b) {
        b.onclick = function () {
          var x = ds[+b.dataset.i], a = b.dataset.a;
          if (a === 'link') return hopLink(x.id, x.title);
          if (a === 'giao') return G.LOP_HOC.giaoDe(null, x);
          if (a === 'kq') return ketQua(x);
          if (a === 'xoa') { if (confirm('Xoá đề "' + x.title + '"? (Lượt tạo đã dùng không được hoàn lại.)')) goi('gvXoaDe', { id: x.id }).then(function () { veDanhSach(); }); return; }
          b.disabled = true;
          goi('gvLayDe', { id: x.id }).then(function (r) {
            b.disabled = false;
            if (!r || !r.ok) return alert((r && r.error) || 'Không mở được đề.');
            if (a === 'sua') buoc2(r.de);
            if (a === 'word') taiWord(r.de, b);
          });
        };
      });
    });
  }
  function linkDe(id) { return A.linkWeb('de=' + encodeURIComponent(id)); }
  function hopLink(id, title) {
    var l = linkDe(id);
    var m = A.modal('<h2>🔗 Link làm bài</h2><p><b>' + esc(title) + '</b></p><p>Gửi link này cho học sinh (Zalo, nhóm lớp…). Học sinh <b>đăng nhập tài khoản</b> (họ tên, lớp, trường) rồi làm bài; mỗi em được giao ngẫu nhiên một mã đề.</p>' +
      '<input class="kd-link" readonly value="' + esc(l) + '"><p><button class="er-btn er-btn-y" id="kd-chep">📋 Chép link</button> <a class="er-btn" href="' + esc(l) + '" target="_blank" rel="noopener">Mở thử</a></p>');
    m.querySelector('#kd-chep').onclick = function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { b.textContent = '✔ Đã chép'; }, function () { prompt('Chép link:', l); }); };
  }

  // ================================================================ GÓI TẠO ĐỀ
  function dangKyGoi() {
    var t = tk(), goiDs = (HAN && HAN.goi) || [{ ma: '1T', ten: '1 tháng' }, { ma: 'HK', ten: '1 học kì' }, { ma: 'NAM', ten: '1 năm học' }];
    var m = A.modal('<h2>⭐ Đăng ký gói tạo đề</h2><p>Mỗi tài khoản giáo viên được tạo miễn phí <b>' + ((HAN && HAN.mienPhi) || 3) + ' đề</b>. Trong thời hạn gói, thầy cô tạo đề <b>không giới hạn</b>.</p><div id="kd-g"><p class="ap-load">Đang kiểm tra…</p></div>');
    var n = m.querySelector('#kd-g');
    goi('maTrangThai', { loai: 'GOI' }).then(function (r) {
      if (hetPhien(r)) return m.remove();
      var cho = ((r && r.ds) || []).filter(function (x) { return x.trangThai === 'Chờ kích hoạt'; })[0];
      if (!cho) {
        n.innerHTML = '<div class="kd-goi">' + goiDs.map(function (g) { return '<button class="er-btn" data-g="' + g.ma + '"><b>' + esc(g.ten) + '</b></button>'; }).join('') + '</div>';
        $$('[data-g]', n).forEach(function (b) {
          b.onclick = function () { goi('maDangKy', { loai: 'GOI', doiTuong: b.dataset.g, moTa: 'Gói ' + b.textContent }).then(function () { m.remove(); dangKyGoi(); }); };
        });
        return;
      }
      var ten = (goiDs.filter(function (g) { return g.ma === cho.doiTuong; })[0] || {}).ten || cho.doiTuong;
      n.innerHTML = A.huongDanZalo(t.user, 'gói <b>' + esc(ten) + '</b>') + '<label>Mã kích hoạt gói<input id="kd-ma" placeholder="VD: ABCD-1234" autocomplete="off"></label><button class="er-btn er-btn-y" id="kd-kh">Kích hoạt</button> <button class="er-btn" id="kd-doi">Chọn gói khác</button><p class="ap-note" id="kd-msg"></p>';
      n.querySelector('#kd-kh').onclick = function () {
        goi('maKichHoat', { loai: 'GOI', ma: n.querySelector('#kd-ma').value }).then(function (x) {
          if (x && x.ok) { m.remove(); alert('✔ Đã kích hoạt gói đến ' + new Date(x.han).toLocaleDateString('vi-VN') + '.'); moTrang(); }
          else n.querySelector('#kd-msg').textContent = (x && x.error) || 'Mã chưa đúng.';
        });
      };
      n.querySelector('#kd-doi').onclick = function () { n.innerHTML = '<p class="ap-note">Mã đang chờ sẽ được thay khi thầy cô chọn gói khác — nhắn Ban quản trị để huỷ mã cũ nếu cần.</p><div class="kd-goi">' + goiDs.map(function (g) { return '<button class="er-btn" data-g="' + g.ma + '"><b>' + esc(g.ten) + '</b></button>'; }).join('') + '</div>'; $$('[data-g]', n).forEach(function (b) { b.onclick = function () { goi('maDangKy', { loai: 'GOI', doiTuong: b.dataset.g, moTa: 'Gói ' + b.textContent }).then(function () { m.remove(); dangKyGoi(); }); }; }); };
    });
  }

  // ================================================================ BƯỚC 1: CHỌN NGUỒN ĐỀ (có sẵn trên web · tự chọn từ ngân hàng · tải từ máy tính)
  function buoc1() {
    if (HAN && !HAN.goiDen && HAN.conLai === 0) { if (confirm('Thầy cô đã dùng hết ' + (HAN.mienPhi || 3) + ' lượt tạo đề miễn phí. Từ đề thứ 4 cần mã (gói) của Ban quản trị. Đăng ký gói ngay?')) dangKyGoi(); return; }
    A.shell('<section class="ap-card"><h1>＋ Tạo đề mới <small class="ap-note">Bước 1/3 · Chọn cách tạo đề</small></h1>' +
      (HAN && !HAN.goiDen ? '<p class="ap-note">Còn <b>' + HAN.conLai + '/' + HAN.mienPhi + '</b> lượt tạo đề miễn phí (đầy đủ chức năng). Từ đề thứ 4 cần mã của Ban quản trị.</p>' : '') +
      '<div class="kd-nguon"><button class="kd-ng" data-n="san"><i>📚</i><b>Chọn đề có sẵn trên web</b><span>Lấy nguyên một đề kiểm tra / đề ôn tập của web (đủ đáp án, lời giải) rồi sửa theo ý mình.</span></button>' +
      '<button class="kd-ng" data-n="kho"><i>🧩</i><b>Tự chọn từ ngân hàng câu hỏi</b><span>Theo khung đề có sẵn, hoặc chọn bài học, số câu từng dạng (nhiều lựa chọn, đúng – sai, trả lời ngắn, tự luận) và mức độ.</span></button>' +
      '<button class="kd-ng" data-n="tai"><i>📤</i><b>Tải đề của tôi từ máy tính</b><span>Soạn đề trong Word theo <b>đề mẫu</b> của web (công thức Equation, hình ảnh) rồi tải lên — web tự nhận câu hỏi, đáp án, lời giải.</span></button></div>' +
      '<p><button class="er-btn" id="ng-huy">← Kho đề</button></p></section>');
    $('#ng-huy').onclick = moTrang;
    $$('.kd-ng').forEach(function (b) { b.onclick = function () { ({ san: deCoSan, kho: tuKho, tai: taiLen })[b.dataset.n](); }; });
  }
  function caiDatMacDinh() { return { chongGian: true, tronCau: true, tronPA: true, soMa: 4, hienDapAn: true, donVi: (tk() || {}).truong || '' }; }

  // ---- 1a. đề có sẵn trên web
  var TEN_LOAI_DE = { GK1: 'Giữa học kì I', CK1: 'Cuối học kì I', GK2: 'Giữa học kì II', CK2: 'Cuối học kì II', TN: 'Ôn thi tốt nghiệp THPT', OT: 'Ôn tập theo chương' };
  function deCoSan() {
    var k = A.lsGet('kd_khoi', 10), loai = '';
    A.shell('<section class="ap-card"><h1>📚 Chọn đề có sẵn trên web <small class="ap-note">Bước 1/3</small></h1><p class="ap-note">Chọn một đề → web lấy đủ câu hỏi, đáp án, lời giải → thầy cô đổi câu, sửa, trộn mã như đề tự tạo. (Đề siêu VIP không dùng được ở đây.)</p>' +
      '<div class="kd-hang"><label>Khối <select id="cs-k">' + [10, 11, 12].map(function (x) { return '<option' + (x === k ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label>Loại đề <select id="cs-l"><option value="">Tất cả</option>' + Object.keys(TEN_LOAI_DE).map(function (x) { return '<option value="' + x + '">' + TEN_LOAI_DE[x] + '</option>'; }).join('') + '</select></label><button class="er-btn" id="cs-ve">← Chọn cách khác</button></div><div id="cs-ds"></div></section>');
    var ve = function () {
      var ds = A.deGoc().filter(function (d) { return d.khoi == k && (!loai || (loai === 'OT' ? d.ot : d.loai === loai && !d.ot)); });
      $('#cs-ds').innerHTML = ds.length ? '<div class="kd-csan">' + ds.map(function (d) { return '<button class="kd-cs" data-id="' + esc(d.id) + '"><b>' + esc(d.title) + '</b><span>' + (d.time || '') + ' phút</span></button>'; }).join('') + '</div>' : '<p class="ap-note">Không có đề phù hợp.</p>';
      $$('.kd-cs').forEach(function (b) { b.onclick = function () { layDeCoSan(b.dataset.id, b); }; });
    };
    $('#cs-k').onchange = function () { k = +this.value; A.lsSet('kd_khoi', k); ve(); };
    $('#cs-l').onchange = function () { loai = this.value; ve(); };
    $('#cs-ve').onclick = buoc1;
    ve();
  }
  function layDeCoSan(id, nut) {
    var cu = nut.innerHTML; nut.disabled = true; nut.innerHTML = '⏳ Đang lấy đề…';
    var xong = function (e) { nut.disabled = false; nut.innerHTML = cu; if (e) alert(e.message || e); };
    goi('gvKhoaDe', { id: id }).then(function (r) {
      if (hetPhien(r)) return;
      if (!r || !r.ok) throw new Error((r && r.error) || 'Không lấy được đáp án đề này (máy chủ cần cập nhật).');
      return Promise.all([A.loadBase(id), A.giaiMaTxt('data/dap/' + id + '.txt', r.khoa)]);
    }).then(function (x) {
      if (!x) return;
      var ex = R.ghep(sao(x[0]), x[1]);
      var de = { title: ex.title, time: ex.time || 90, khoi: ex.khoi, parts: ex.parts.map(function (p) { return { type: p.type, pts: p.pts, qs: p.qs.map(function (q) { var c = sao(q); delete c.type; return c; }) }; }), caiDat: caiDatMacDinh(), nguon: id };
      xong(); buoc2(de);
    }).catch(xong);
  }

  // ---- 1c. tải đề từ máy tính (Word theo mẫu, hoặc dán nội dung)
  function taiLen() {
    var k = A.lsGet('kd_khoi', 10);
    A.shell('<section class="ap-card"><h1>📤 Tải đề của tôi <small class="ap-note">Bước 1/3</small></h1>' +
      '<div class="kd-tai"><div><h3>1️⃣ Tải đề mẫu, soạn theo mẫu</h3><p class="ap-note">Đề mẫu có đủ 4 phần (nhiều lựa chọn, đúng – sai, trả lời ngắn, tự luận) và cách ghi <b>Đáp án</b>, <b>Lời giải</b>, <b>Hướng dẫn chấm</b>. Công thức gõ bằng <b>Equation</b> của Word (Alt + =). Có thể gạch chân chữ cái đáp án đúng thay cho dòng "Đáp án".</p><button class="er-btn er-btn-y" id="tl-mau">⬇ Tải đề mẫu (Word)</button></div>' +
      '<div><h3>2️⃣ Chọn tệp đã soạn (Word .docx hoặc PDF)</h3><p class="ap-note">Ưu tiên <b>Word</b> để giữ nguyên công thức và hình. PDF (có chữ, không phải ảnh scan) cũng đọc được, nhưng cần soát lại công thức.</p><div class="kd-hang"><label>Khối <select id="tl-k">' + [6, 7, 8, 9, 10, 11, 12].map(function (x) { return '<option' + (x === k ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label>Thời gian (phút) <input id="tl-tg" type="number" value="45" min="5" max="180" style="width:90px"></label></div>' +
      '<label class="er-btn er-btn-y kd-chon-tep">📂 Chọn tệp Word hoặc PDF…<input type="file" id="tl-tep" accept=".docx,.pdf,application/pdf" hidden></label> <button class="er-btn" id="tl-dan">📋 Hoặc dán nội dung</button></div></div>' +
      '<div id="tl-kq"></div><p><button class="er-btn" id="tl-ve">← Chọn cách khác</button></p></section>');
    $('#tl-ve').onclick = buoc1;
    $('#tl-k').onchange = function () { k = +this.value; A.lsSet('kd_khoi', k); };
    $('#tl-mau').onclick = function () {
      var b = this; b.disabled = true; b.textContent = '⏳ Đang tạo…';
      G.XuatWord.taoMau().then(function (blob) { b.disabled = false; b.textContent = '⬇ Tải đề mẫu (Word)'; var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'De-mau_tai-len_Hoc-Toan-Thong-Minh.docx'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 2000); });
    };
    var ketQuaDoc = function (dongs, anh, canhBao) {
      var p = G.NHAP_DE.phanTich(dongs, anh, { khoi: k, time: +$('#tl-tg').value || 45 });
      var de = p.de, tom = de.parts.map(function (x) { return R.PART_NAME[x.type].replace(/^PHẦN [IV]+\.\s*/, '') + ': <b>' + x.qs.length + '</b> câu'; }).join(' · ');
      var kichThuoc = JSON.stringify(de).length;
      if (kichThuoc > 420000) p.loi.unshift('Đề quá lớn (nhiều hình hoặc hình to). Thầy cô bớt hoặc thu nhỏ hình rồi tải lại.');
      $('#tl-kq').innerHTML = '<div class="ap-card kd-tom"><h3>📄 ' + esc(de.title || 'Đề chưa có tên') + '</h3><p>' + (tom || 'Chưa nhận được câu nào') + '</p>' +
        (canhBao.length ? '<div class="ap-warn2">' + canhBao.map(esc).join('<br>') + '</div>' : '') +
        (p.loi.length ? '<div class="ap-warn2"><b>Cần sửa ' + p.loi.length + ' chỗ</b> (sửa trong Word rồi tải lại, hoặc tiếp tục và sửa ở bước sau):<br>' + p.loi.slice(0, 30).map(esc).join('<br>') + (p.loi.length > 30 ? '<br>…' : '') + '</div>' : '<p class="ap-ok2">✅ Đọc đủ câu hỏi, đáp án.</p>') +
        (de.parts.length ? '<p><button class="er-btn er-btn-y er-big" id="tl-tiep">Tiếp tục: kiểm tra từng câu →</button></p>' : '') + '</div>';
      var t = $('#tl-tiep');
      if (t) t.onclick = function () {
        if (p.loi.length && !confirm('Đề còn ' + p.loi.length + ' chỗ cần sửa. Tiếp tục và sửa từng câu ở bước sau?')) return;
        if (kichThuoc > 420000) return alert('Đề quá lớn để lưu — thầy cô thu nhỏ hình nhé.');
        de.title = de.title || 'Đề tải lên ' + new Date().toLocaleDateString('vi-VN'); de.khoi = de.khoi || k; de.time = de.time || +$('#tl-tg').value || 45;
        de.caiDat = caiDatMacDinh(); de.nguon = 'tai-len';
        buoc2(de);
      };
    };
    $('#tl-tep').onchange = function () {
      var f = this.files[0]; this.value = ''; if (!f) return;
      $('#tl-kq').innerHTML = '<p class="ap-load">Đang đọc tệp ' + esc(f.name) + '…</p>';
      G.NHAP_DE.docTep(f).then(function (r) { ketQuaDoc(r.dongs, r.anh, r.canhBao); }, function (e) { $('#tl-kq').innerHTML = '<p class="ap-warn2">' + esc(e.message) + '</p>'; });
    };
    $('#tl-dan').onclick = function () {
      var m = A.modal('<h2>📋 Dán nội dung đề</h2><p class="ap-note">Dán đúng theo đề mẫu. Công thức viết LaTeX giữa hai dấu $ (VD <code>$\\dfrac{1}{2}$</code>) — khi dán từ Word, công thức Equation sẽ mất, nên ưu tiên tải tệp .docx.</p><textarea id="dn-chu" rows="16" style="width:100%"></textarea><p><button class="er-btn er-btn-y" id="dn-ok">Đọc nội dung</button></p>');
      m.querySelector('.ap-modal-in').classList.add('kd-rong');
      m.querySelector('#dn-ok').onclick = function () { var s = m.querySelector('#dn-chu').value; m.remove(); ketQuaDoc(s.split(/\r?\n/), {}, []); };
    };
  }

  // ---- 1b. tự chọn từ ngân hàng câu hỏi
  function tuKho() {
    var k = A.lsGet('kd_khoi', 10);
    A.shell('<section class="ap-card"><h1>＋ Tạo đề mới <small class="ap-note">Bước 1/3 · Cấu trúc</small></h1><div id="kd-b1"><p class="ap-load">Đang mở ngân hàng câu hỏi…</p></div></section>');
    var ve = function () {
      napNH(k).then(function (nh) { veB1(nh); }).catch(function (e) { $('#kd-b1').innerHTML = '<p class="ap-warn2">' + esc(e.message) + '</p><button class="er-btn" id="kd-lai">Quay lại</button>'; $('#kd-lai').onclick = moTrang; });
    };
    var veB1 = function (nh) {
      var bai = {}; nh.slots.forEach(function (s) { (bai[s.cd] = bai[s.cd] || {})[s.bai] = s.baiTen; });
      var ten = { GK1: 'Giữa học kì I', CK1: 'Cuối học kì I', GK2: 'Giữa học kì II', CK2: 'Cuối học kì II', TN: 'Ôn thi tốt nghiệp THPT' };
      $('#kd-b1').innerHTML =
        '<div class="kd-hang"><label>Khối <select id="b1-k">' + [10, 11, 12].map(function (x) { return '<option' + (x === k ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' +
        '<label style="flex:1">Tên đề <input id="b1-ten" placeholder="VD: Kiểm tra 15 phút — Bài 2. Tập hợp" value=""></label><label>Thời gian (phút) <input id="b1-tg" type="number" value="90" min="5" max="180" style="width:90px"></label></div>' +
        '<h3>Kiểu đề</h3><div class="kd-kieu"><label><input type="radio" name="kieu" value="khung" checked> <b>Theo khung đề có sẵn</b> — cùng ma trận, cấu trúc như đề kiểm tra của tổ</label>' +
        '<select id="b1-khung">' + nh.presets.map(function (p, i) { return '<option value="' + i + '">' + esc(ten[p.loai] || p.ten) + ' — ' + p.slots.length + ' câu</option>'; }).join('') + '</select>' +
        '<label><input type="radio" name="kieu" value="tu"> <b>Tự chọn</b> — chọn bài học, số câu từng dạng, mức độ</label></div>' +
        '<div id="b1-tu" hidden><h3>Bài học</h3><p class="ap-note">Tích các bài muốn đưa vào đề. <a href="#" id="b1-all">Chọn tất cả</a> · <a href="#" id="b1-none">Bỏ chọn</a></p><div class="kd-bai">' +
        Object.keys(bai).map(function (cd) { return '<fieldset><legend>' + R.tex(cd) + '</legend>' + Object.keys(bai[cd]).map(function (b) { return '<label><input type="checkbox" class="b1-nd" value="' + esc(b) + '"> ' + R.tex(bai[cd][b]) + '</label>'; }).join('') + '</fieldset>'; }).join('') + '</div>' +
        '<h3>Số câu theo dạng và mức độ</h3><div class="ap-tw"><table class="ap-t kd-sl"><tr><th>Dạng câu</th><th>Điểm/câu</th><th>Biết</th><th>Hiểu</th><th>Vận dụng</th><th>Có trong kho</th></tr>' +
        ['mc', 'tf', 'sa', 'es'].filter(function (t) { return nh.slots.some(function (s) { return s.part === t; }); }).map(function (t) {
          var mac = k === 12 ? { mc: [8, 4, 0], tf: [0, 4, 0], sa: [0, 3, 3] }[t] : { mc: [8, 4, 0], tf: [0, 2, 0], sa: [0, 2, 2], es: [0, 1, 2] }[t];
          return '<tr><td>' + LOAI_TEN[t] + (t === 'tf' ? '<br><small>mỗi câu 4 ý Biết → Vận dụng</small>' : '') + '</td><td><input type="number" step="0.05" min="0" class="b1-pts" data-t="' + t + '" value="' + (nh.pts[t] || 0.25) + '" style="width:70px"></td>' +
            (t === 'tf' ? '<td colspan="3"><input type="number" min="0" max="10" class="b1-n" data-t="tf" data-m="H" value="' + mac[1] + '" style="width:60px"> câu</td>' :
              ['B', 'H', 'VD'].map(function (m, j) { return '<td><input type="number" min="0" max="30" class="b1-n" data-t="' + t + '" data-m="' + m + '" value="' + mac[j] + '" style="width:60px"></td>'; }).join('')) + '<td class="b1-co" data-t="' + t + '"></td></tr>';
        }).join('') + '</table></div><p class="ap-note">Đúng – Sai: mỗi câu có 4 ý a) b) c) d) từ Biết đến Vận dụng. Cột "Có trong kho" là số dạng câu khác nhau (mỗi dạng có nhiều biến thể số liệu).</p><p id="b1-tong"></p></div>' +
        '<p class="ap-warn2" id="b1-loi" hidden></p><p><button class="er-btn" id="b1-huy">← Chọn cách khác</button> <button class="er-btn er-btn-y er-big" id="b1-tao">Tạo đề →</button></p>';
      var kieu = function () { return $('input[name=kieu]:checked').value; };
      $$('input[name=kieu]').forEach(function (r) { r.onchange = function () { $('#b1-tu').hidden = kieu() !== 'tu'; }; });
      $('#b1-k').onchange = function () { k = +this.value; A.lsSet('kd_khoi', k); $('#kd-b1').innerHTML = '<p class="ap-load">Đang mở ngân hàng khối ' + k + '…</p>'; ve(); };
      $('#b1-huy').onclick = buoc1;
      $('#b1-all').onclick = function (e) { e.preventDefault(); $$('.b1-nd').forEach(function (c) { c.checked = true; }); dem(); };
      $('#b1-none').onclick = function (e) { e.preventDefault(); $$('.b1-nd').forEach(function (c) { c.checked = false; }); dem(); };
      var dem = function () {
        var nd = {}; $$('.b1-nd:checked').forEach(function (c) { nd[c.value] = 1; });
        var tong = 0;
        $$('.b1-co').forEach(function (td) {
          var t = td.dataset.t, c = { B: 0, H: 0, VD: 0 };
          nh.slots.forEach(function (s) { if (s.part === t && nd[s.bai]) { var m = t === 'tf' ? 'H' : s.muc; c[m] = (c[m] || 0) + 1; } });
          td.textContent = t === 'tf' ? (c.H + ' dạng') : ('B ' + c.B + ' · H ' + c.H + ' · VD ' + c.VD + ' dạng');
        });
        $$('.b1-n').forEach(function (i) { tong += (+i.value || 0) * (+($('.b1-pts[data-t="' + i.dataset.t + '"]').value) || 0); });
        $('#b1-tong').innerHTML = 'Tổng điểm: <b>' + fmt(Math.round(tong * 100) / 100) + '</b>';
      };
      $$('.b1-nd, .b1-n, .b1-pts').forEach(function (i) { i.oninput = i.onchange = dem; });
      dem();
      $('#b1-tao').onclick = function () {
        var loi = function (s) { var e = $('#b1-loi'); e.hidden = false; e.textContent = s; };
        var ten = $('#b1-ten').value.trim(), tg = +$('#b1-tg').value || 90;
        var de;
        if (kieu() === 'khung') {
          var p = nh.presets[+$('#b1-khung').value];
          de = taoTheoKhung(nh, p);
          if (!ten) ten = (({ GK1: 'Đề kiểm tra giữa học kì I', CK1: 'Đề kiểm tra cuối học kì I', GK2: 'Đề kiểm tra giữa học kì II', CK2: 'Đề kiểm tra cuối học kì II', TN: 'Đề ôn thi tốt nghiệp THPT' })[p.loai] || p.ten) + ' — Toán ' + k;
        } else {
          var nd = $$('.b1-nd:checked').map(function (c) { return c.value; });
          if (!nd.length) return loi('Thầy cô tích ít nhất một bài học nhé.');
          var yc = {}; $$('.b1-n').forEach(function (i) { var t = i.dataset.t; yc[t] = yc[t] || {}; yc[t][i.dataset.m] = +i.value || 0; });
          var pts = {}; $$('.b1-pts').forEach(function (i) { pts[i.dataset.t] = +i.value || 0; });
          var kq = taoTuChon(nh, nd, yc, pts);
          if (kq.loi) return loi(kq.loi);
          de = kq.de;
          if (!ten) return loi('Thầy cô đặt tên đề nhé.');
        }
        de.title = ten; de.time = tg; de.khoi = k;
        de.caiDat = caiDatMacDinh();
        buoc2(de);
      };
    };
    ve();
  }
  function cauTuKho(it, pts) { var q = sao(it.q); q.nh = it.id; q.m = { cd: it.slot.cd, nd: it.slot.nd, muc: it.slot.muc, yc: it.slot.yc }; return q; }
  function taoTheoKhung(nh, p) {
    var dung = {}, parts = {};
    p.slots.forEach(function (si) {
      var ung = nh.items.filter(function (it) { return it.s === si && !dung[it.id]; });
      if (!ung.length) return;
      var it = ung[ngauNhien(ung.length)]; dung[it.id] = 1;
      var t = it.slot.part; (parts[t] = parts[t] || []).push(cauTuKho(it));
    });
    return { parts: ['mc', 'tf', 'sa', 'es'].filter(function (t) { return parts[t]; }).map(function (t) { return { type: t, pts: nh.pts[t], qs: parts[t] }; }) };
  }
  function taoTuChon(nh, nd, yc, pts) {
    var cho = {}; nd.forEach(function (x) { cho[x] = 1; });
    var parts = [], thieu = [];
    ['mc', 'tf', 'sa', 'es'].forEach(function (t) {
      if (!yc[t]) return;
      var qs = [];
      ['B', 'H', 'VD'].forEach(function (m) {
        var can = yc[t][m] || 0; if (!can) return;
        if (t === 'tf' && m === 'B') return;
        var ung = nh.items.filter(function (it) { return it.slot.part === t && cho[it.slot.bai] && (t === 'tf' || it.slot.muc === m); });
        // rải đều theo dạng: mỗi vòng lấy một biến thể của mỗi dạng, trộn ngẫu nhiên
        var theoDang = {}; ung.forEach(function (it) { (theoDang[it.s] = theoDang[it.s] || []).push(it); });
        var dangs = tron(Object.keys(theoDang)); Object.keys(theoDang).forEach(function (s) { theoDang[s] = tron(theoDang[s]); });
        var lay = 0, vong = 0;
        while (lay < can && dangs.length) {
          var s = dangs[vong % dangs.length], it = theoDang[s].shift();
          if (it) { qs.push(cauTuKho(it)); lay++; }
          if (!theoDang[s].length) dangs.splice(vong % dangs.length, 1); else vong++;
        }
        if (lay < can) thieu.push(LOAI_TEN[t] + ' mức ' + MUC[m] + ': kho chỉ có ' + lay + '/' + can + ' câu cho các bài đã chọn');
      });
      if (qs.length) parts.push({ type: t, pts: pts[t] || nh.pts[t], qs: qs });
    });
    if (!parts.length) return { loi: 'Chưa có câu nào: thầy cô nhập số câu cần lấy.' };
    if (thieu.length && !confirm('Một số mức chưa đủ câu:\n' + thieu.join('\n') + '\n\nVẫn tạo đề với số câu hiện có?')) return { loi: 'Thầy cô chọn thêm bài học hoặc giảm số câu nhé.' };
    return { de: { parts: parts } };
  }

  // ================================================================ BƯỚC 2: SOẠN, ĐỔI CÂU, SỬA
  function buoc2(de) {
    de = sao(de);
    var goc = de.goc || { parts: de.parts };   // đề gốc (chưa trộn)
    de.goc = goc; delete de.parts;
    var k = de.khoi, coKho = [10, 11, 12].indexOf(+k) >= 0;
    A.shell('<section class="ap-card kd-soan"><div class="kd-dau"><div><h1 style="margin:0">✏️ ' + esc(de.title) + '</h1><p class="ap-note">Bước 2/3 · Kiểm tra từng câu: <b>🔁 Đổi câu</b> lấy câu cùng dạng, <b>📚 Chọn câu</b> từ kho, <b>✏️ Sửa</b> nội dung, đáp án. Khối ' + k + ' · ' + de.time + ' phút.</p></div>' +
      '<div class="kd-nut"><button class="er-btn" id="b2-ve">← Kho đề</button><button class="er-btn" id="b2-luu">💾 Lưu nháp</button><button class="er-btn er-btn-y" id="b2-tiep">Tiếp: trộn mã, xuất bản →</button></div></div><div id="b2-than"></div></section>');
    $('#b2-ve').onclick = function () { if (confirm('Rời trang soạn? Thay đổi chưa lưu sẽ mất.')) moTrang(); };
    $('#b2-luu').onclick = function () { luu(de, false, function () { alert('Đã lưu nháp.'); }); };
    $('#b2-tiep').onclick = function () { buoc3(de); };
    (coKho ? napNH(k) : Promise.resolve()).then(function () { ve(); }, function () { ve(); });
    function ve() {
      var h = '', tong = 0;
      goc.parts.forEach(function (p, pi) {
        tong += p.type === 'es' ? p.qs.reduce(function (a, q) { return a + (+q.pts || p.pts); }, 0) : p.qs.length * p.pts;
        h += '<h2 class="ap-g">' + R.PART_NAME[p.type] + ' <small>(' + p.qs.length + ' câu' + (p.type === 'es' ? '' : ' × ' + fmt(p.pts) + ' điểm') + ')</small></h2>';
        p.qs.forEach(function (q, qi) {
          h += '<article class="kd-cau" data-p="' + pi + '" data-q="' + qi + '"><div class="kd-cau-dau"><b>Câu ' + (qi + 1) + '</b>' + (q.m ? '<span class="er-bai">' + R.tex(q.m.nd) + ' · ' + esc(MUC[q.m.muc] || q.m.muc) + '</span>' : '<span class="er-bai">câu tự soạn</span>') +
            '<span class="ap-sp"></span><button class="er-btn ap-sm" data-a="doi">🔁 Đổi câu</button><button class="er-btn ap-sm" data-a="chon">📚 Chọn câu</button><button class="er-btn ap-sm" data-a="sua">✏️ Sửa</button>' +
            '<button class="er-btn ap-sm" data-a="len" title="Lên">↑</button><button class="er-btn ap-sm" data-a="xuong" title="Xuống">↓</button><button class="er-btn ap-sm ap-del" data-a="xoa">🗑</button></div>' + xemCau(q, p) + '</article>';
        });
        h += '<p><button class="er-btn ap-sm" data-them="' + pi + '">＋ Thêm câu từ kho</button> <button class="er-btn ap-sm" data-moi="' + pi + '">＋ Câu tự soạn</button></p>';
      });
      h += '<p class="ap-note">Tổng điểm: <b>' + fmt(Math.round(tong * 100) / 100) + '</b></p>';
      $('#b2-than').innerHTML = h;
      $$('#b2-than [data-a]').forEach(function (b) {
        b.onclick = function () {
          var c = b.closest('.kd-cau'), pi = +c.dataset.p, qi = +c.dataset.q, p = goc.parts[pi], q = p.qs[qi], a = b.dataset.a;
          if (a === 'doi') { var moi = doiCau(k, p.type, q, daDung()); if (moi) { p.qs[qi] = moi; ve(); } else alert('Kho không còn câu cùng dạng khác. Thầy cô dùng 📚 Chọn câu để lấy câu dạng khác.'); }
          if (a === 'chon') chonCau(k, p.type, q && q.m && q.m.nd, function (moi) { p.qs[qi] = moi; ve(); });
          if (a === 'sua') suaCau(p, q, function (moi) { p.qs[qi] = moi; ve(); });
          if (a === 'xoa' && confirm('Xoá câu ' + (qi + 1) + '?')) { p.qs.splice(qi, 1); ve(); }
          if (a === 'len' && qi > 0) { p.qs.splice(qi - 1, 0, p.qs.splice(qi, 1)[0]); ve(); }
          if (a === 'xuong' && qi < p.qs.length - 1) { p.qs.splice(qi + 1, 0, p.qs.splice(qi, 1)[0]); ve(); }
        };
      });
      $$('#b2-than [data-them]').forEach(function (b) { b.onclick = function () { var p = goc.parts[+b.dataset.them]; chonCau(k, p.type, null, function (moi) { p.qs.push(moi); ve(); }); }; });
      $$('#b2-than [data-moi]').forEach(function (b) { b.onclick = function () { var p = goc.parts[+b.dataset.moi]; suaCau(p, cauTrong(p.type), function (moi) { p.qs.push(moi); ve(); }); }; });
    }
    function daDung() { var d = {}; goc.parts.forEach(function (p) { p.qs.forEach(function (q) { if (q.nh) d[q.nh] = 1; }); }); return d; }
  }
  function xemCau(q, p) {
    var h = '<div class="er-stem">' + R.tex(q.stem) + '</div>';
    if (q.table) h += '<div class="er-tablewrap"><table class="er-table">' + q.table.map(function (r, i) { return '<tr>' + r.map(function (c) { return (i ? '<td>' : '<th>') + R.tex(c) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</table></div>';
    if (q.fig) h += '<div class="er-fig"><img src="' + esc(q.fig.src || q.fig.png || '') + '" style="max-width:min(100%,' + Math.round((q.fig.w || 5) * 38) + 'px)"></div>';
    if (q.after) h += '<div class="er-stem">' + R.tex(q.after) + '</div>';
    if (p.type === 'mc') h += '<div class="kd-pa">' + q.opts.map(function (o, j) { return '<div class="' + (j === q.ans ? 'kd-dung' : '') + '"><b>' + 'ABCD'[j] + '.</b> ' + R.tex(o) + '</div>'; }).join('') + '</div>';
    if (p.type === 'tf') h += '<div class="kd-pa">' + q.items.map(function (it, j) { return '<div><b>' + 'abcd'[j] + ')</b> ' + R.tex(it.t) + ' — <b class="' + (it.ans ? 'kd-d' : 'kd-s') + '">' + (it.ans ? 'Đúng' : 'Sai') + '</b></div>'; }).join('') + '</div>';
    if (p.type === 'sa') h += '<div>Đáp số: <b>' + esc(q.ans) + '</b></div>';
    if (p.type === 'es') h += '<div class="ap-note">' + fmt(q.pts || p.pts) + ' điểm · ' + (q.sol || []).length + ' bước chấm</div>';
    var lg = p.type === 'tf' ? q.items.map(function (it, j) { return 'abcd'[j] + ') ' + (it.expl || ''); }).join('<br>') : p.type === 'es' ? (q.sol || []).map(function (s) { return s.t + ' <b>(' + fmt(s.p) + ')</b>'; }).join('<br>') : q.expl;
    if (lg) h += '<details class="kd-lg"><summary>Lời giải</summary><div class="er-sol">' + R.tex(lg) + '</div></details>';
    return h;
  }
  function doiCau(k, t, q, dung) {
    var nh = NH[k]; if (!nh) return null;
    var cung = function (it) { return it.slot.part === t && !dung[it.id]; };
    var s = null; if (q && q.nh) { var cu = nh.items[+String(q.nh).split('-')[1]]; s = cu && cu.s; }
    var ung = nh.items.filter(function (it) { return cung(it) && it.s === s; });
    if (!ung.length && q && q.m) ung = nh.items.filter(function (it) { return cung(it) && it.slot.nd === q.m.nd && it.slot.muc === q.m.muc; });
    if (!ung.length) return null;
    return cauTuKho(ung[ngauNhien(ung.length)]);
  }
  function chonCau(k, t, nd, xong) {
    var nh = NH[k]; if (!nh) return alert('Chưa mở được ngân hàng câu hỏi.');
    var bais = {}; nh.slots.forEach(function (s) { if (s.part === t) bais[s.bai] = s.baiTen; });
    var chon = null; nh.slots.forEach(function (s) { if (s.nd === nd) chon = s.bai; });
    var m = A.modal('<h2>📚 Chọn câu từ kho — ' + LOAI_TEN[t] + '</h2><div class="ap-fbar"><select id="cc-nd"><option value="">Tất cả bài</option>' + Object.keys(bais).map(function (b) { return '<option value="' + esc(b) + '"' + (b === chon ? ' selected' : '') + '>' + esc(bais[b].replace(/\$([^$]*)\$/g, function (m, t) { return t.replace(/\^\\circ/g, '°').replace(/\\[a-z]+/g, '').replace(/[{}^]/g, ''); })) + '</option>'; }).join('') + '</select>' +
      '<select id="cc-m"><option value="">Mọi mức</option><option value="B">Biết</option><option value="H">Hiểu</option><option value="VD">Vận dụng</option></select><input id="cc-q" placeholder="Tìm chữ trong đề…"></div><div id="cc-ds" class="kd-chon"></div>');
    m.querySelector('.ap-modal-in').classList.add('kd-rong');
    var ve = function () {
      var b = m.querySelector('#cc-nd').value, mu = m.querySelector('#cc-m').value, q = m.querySelector('#cc-q').value.trim().toLowerCase();
      var ds = nh.items.filter(function (it) { return it.slot.part === t && (!b || it.slot.bai === b) && (!mu || it.slot.muc === mu || (t === 'tf')) && (!q || String(it.q.stem).toLowerCase().indexOf(q) >= 0); });
      var p = { type: t, pts: 1 };
      m.querySelector('#cc-ds').innerHTML = '<p class="ap-note">' + ds.length + ' câu' + (ds.length > 40 ? ' — hiện 40 câu ngẫu nhiên, lọc thêm để thu hẹp' : '') + '</p>' +
        tron(ds).slice(0, 40).map(function (it) { return '<article class="kd-cau"><div class="kd-cau-dau"><span class="er-bai">' + R.tex(it.slot.nd) + ' · ' + esc(MUC[it.slot.muc] || it.slot.muc) + '</span><span class="ap-sp"></span><button class="er-btn er-btn-y ap-sm" data-id="' + it.id + '">Chọn câu này</button></div>' + xemCau(it.q, p) + '</article>'; }).join('');
      $$('#cc-ds [data-id]', m).forEach(function (bt) { bt.onclick = function () { var it = nh.items[+bt.dataset.id.split('-')[1]]; m.remove(); xong(cauTuKho(it)); }; });
    };
    ['cc-nd', 'cc-m', 'cc-q'].forEach(function (id) { m.querySelector('#' + id).oninput = m.querySelector('#' + id).onchange = ve; });
    ve();
  }
  function cauTrong(t) {
    if (t === 'mc') return { stem: '', opts: ['', '', '', ''], notes: ['', '', '', ''], ans: 0, expl: '' };
    if (t === 'tf') return { stem: '', items: [0, 1, 2, 3].map(function () { return { t: '', ans: true, expl: '' }; }) };
    if (t === 'sa') return { stem: '', ans: '', expl: '' };
    return { stem: '', pts: 1, sol: [{ t: '', p: 1 }] };
  }
  function suaCau(p, q0, xong) {
    var q = sao(q0), t = p.type;
    var f = function (lbl, k, v, dong) { return '<label class="ed-f">' + lbl + (dong ? '<textarea rows="' + dong + '" data-k="' + k + '">' + esc(v) + '</textarea>' : '<input data-k="' + k + '" value="' + esc(v) + '">') + '</label>'; };
    var h = '<h2>✏️ Sửa câu — ' + LOAI_TEN[t] + '</h2><p class="ap-note">Công thức viết giữa hai dấu $ (LaTeX), VD <code>$\\dfrac{1}{2}$</code>, <code>$\\sqrt{3}$</code>. Khung dưới xem trước ngay.</p>' + f('Đề bài', 'stem', q.stem, 4);
    if (t === 'mc') { q.opts.forEach(function (o, j) { h += '<div class="ed-row"><label class="ed-rad"><input type="radio" name="sc-ans" value="' + j + '"' + (q.ans === j ? ' checked' : '') + '> ' + 'ABCD'[j] + '</label>' + f('', 'opts.' + j, o) + '</div>'; }); h += f('Lời giải', 'expl', q.expl || '', 3); }
    if (t === 'tf') q.items.forEach(function (it, j) { h += '<div class="ed-row"><b>' + 'abcd'[j] + ')</b>' + f('', 'items.' + j + '.t', it.t) + '<select data-tf="' + j + '"><option value="1"' + (it.ans ? ' selected' : '') + '>Đúng</option><option value="0"' + (!it.ans ? ' selected' : '') + '>Sai</option></select>' + f('Giải thích', 'items.' + j + '.expl', it.expl || '') + '</div>'; });
    if (t === 'sa') h += f('Đáp số (một số, dấu phẩy thập phân)', 'ans', q.ans) + f('Lời giải', 'expl', q.expl || '', 3);
    if (t === 'es') { h += f('Điểm của câu', 'pts', q.pts || p.pts); (q.sol || []).forEach(function (s, j) { h += '<div class="ed-row">' + f('Bước ' + (j + 1), 'sol.' + j + '.t', s.t) + f('Điểm', 'sol.' + j + '.p', s.p) + '</div>'; }); }
    h += '<div class="ed-img">Hình: ' + (q.fig ? '<img src="' + esc(q.fig.src || '') + '" style="max-height:60px"> <button class="er-btn ap-sm" id="sc-bo">Bỏ hình</button>' : '(không có)') + ' <label class="er-btn ap-sm">Chọn ảnh…<input type="file" accept="image/*" id="sc-anh" hidden></label></div>' +
      '<h3>Xem trước</h3><div id="sc-xem" class="kd-cau"></div><p><button class="er-btn er-btn-y" id="sc-luu">Dùng câu này</button></p>';
    var m = A.modal(h); m.querySelector('.ap-modal-in').classList.add('kd-rong');
    var xem = function () { m.querySelector('#sc-xem').innerHTML = xemCau(q, p); };
    m.addEventListener('input', function (e) {
      var k = e.target.dataset && e.target.dataset.k; if (!k) return;
      var ks = k.split('.'), o = q; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
      var last = ks[ks.length - 1]; o[last] = (last === 'pts' || last === 'p') ? (+String(e.target.value).replace(',', '.') || 0) : e.target.value; xem();
    });
    m.addEventListener('change', function (e) {
      if (e.target.name === 'sc-ans') { q.ans = +e.target.value; xem(); }
      if (e.target.dataset && e.target.dataset.tf != null) { q.items[+e.target.dataset.tf].ans = e.target.value === '1'; xem(); }
      if (e.target.id === 'sc-anh' && e.target.files[0]) A.shrink(e.target.files[0], function (url, w) { q.fig = { src: url, w: Math.min(8, w) }; xem(); });
    });
    var bo = m.querySelector('#sc-bo'); if (bo) bo.onclick = function () { delete q.fig; xem(); };
    m.querySelector('#sc-luu').onclick = function () {
      if (!String(q.stem).trim()) return alert('Câu chưa có đề bài.');
      if (t === 'mc' && q.opts.some(function (o) { return !String(o).trim(); })) return alert('Thiếu phương án.');
      if (t === 'sa' && isNaN(R.parseNum(q.ans))) return alert('Đáp số phải là một số.');
      if (t === 'es') { var s = (q.sol || []).reduce(function (a, x) { return a + (+x.p || 0); }, 0); if (Math.abs(s - q.pts) > 1e-9 && !confirm('Tổng điểm các bước (' + fmt(s) + ') khác điểm câu (' + fmt(q.pts) + '). Vẫn dùng?')) return; }
      if (q.nh && JSON.stringify(q) !== JSON.stringify(q0)) q.suaTay = true;
      m.remove(); xong(q);
    };
    xem();
  }

  // ================================================================ BƯỚC 3: TRỘN MÃ, CHỐNG GIAN LẬN, XUẤT BẢN
  function tronMa(goc, cd) {
    var so = Math.max(1, Math.min(8, +cd.soMa || 1)), ds = [];
    for (var i = 0; i < so; i++) {
      var de = { parts: goc.parts.map(function (p) {
        var qs = p.qs.map(sao);
        if (cd.tronCau && so > 1) qs = tron(qs);
        if (cd.tronPA && so > 1) qs.forEach(function (q) {
          if (p.type !== 'mc') return;
          var vt = tron([0, 1, 2, 3]);
          q.opts = vt.map(function (j) { return q.opts[j]; }); q.notes = vt.map(function (j) { return (q.notes || [])[j] || ''; }); q.ans = vt.indexOf(q.ans);
        });
        return { type: p.type, pts: p.pts, qs: qs };
      }) };
      ds.push({ ma: String(101 + i), de: de });
    }
    return ds;
  }
  function buoc3(de) {
    var cd = de.caiDat = de.caiDat || {};
    var o = function (k, ten, mo) { return '<label class="kd-chk"><input type="checkbox" data-c="' + k + '"' + (cd[k] !== false ? ' checked' : '') + '> <b>' + ten + '</b><br><small>' + mo + '</small></label>'; };
    A.shell('<section class="ap-card"><h1>🚀 Xuất bản đề <small class="ap-note">Bước 3/3</small></h1><p><b>' + esc(de.title) + '</b> · Khối ' + de.khoi + ' · ' + de.time + ' phút</p>' +
      '<div class="kd-cd">' + o('chongGian', '🛡️ Bảo vệ màn hình (chống gian lận)', 'Làm bài toàn màn hình; chuyển tab, thoát toàn màn hình: lần 1 cảnh báo, lần 2 làm lại từ đầu; ghi lại cho thầy cô.') +
      o('tronCau', '🔀 Trộn thứ tự câu', 'Mỗi mã đề một thứ tự câu khác nhau (trong từng phần).') + o('tronPA', '🔤 Trộn phương án A, B, C, D', 'Đáp án đúng ở vị trí khác nhau giữa các mã đề.') +
      o('hienDapAn', '📖 Cho học sinh xem đáp án, lời giải sau khi nộp', 'Bỏ tích: học sinh chỉ thấy điểm.') + '</div>' +
      '<div class="kd-hang"><label>Số mã đề <input type="number" id="b3-so" min="1" max="8" value="' + (cd.soMa || 4) + '" style="width:80px"></label><label style="flex:1">Tên trường / đơn vị (đầu trang Word) <input id="b3-dv" value="' + esc(cd.donVi || '') + '"></label></div>' +
      '<p class="ap-note">Mã đề đánh số 101, 102, … Mỗi học sinh mở link được giao ngẫu nhiên một mã; máy chủ chấm đúng theo mã của em.</p>' +
      '<p><button class="er-btn" id="b3-lai">← Sửa câu hỏi</button> <button class="er-btn" id="b3-luu">💾 Lưu nháp</button> <button class="er-btn er-btn-y er-big" id="b3-xb">🚀 Xuất bản và lấy link</button></p><div id="b3-kq"></div></section>');
    var doc = function () { $$('[data-c]').forEach(function (c) { cd[c.dataset.c] = c.checked; }); cd.soMa = +$('#b3-so').value || 1; cd.donVi = $('#b3-dv').value.trim(); de.ma = tronMa(de.goc, cd); };
    $('#b3-lai').onclick = function () { doc(); buoc2(de); };
    $('#b3-luu').onclick = function () { doc(); luu(de, false, function () { $('#b3-kq').innerHTML = '<p>✔ Đã lưu nháp.</p>'; }); };
    $('#b3-xb').onclick = function () {
      doc(); this.disabled = true;
      var b = this;
      luu(de, true, function () {
        b.disabled = false;
        var l = linkDe(de.id);
        $('#b3-kq').innerHTML = '<div class="ap-card kd-xong"><h2>✅ Đã xuất bản</h2><p>Link làm bài:</p><input class="kd-link" readonly value="' + esc(l) + '"><p><button class="er-btn er-btn-y" id="b3-chep">📋 Chép link</button> <button class="er-btn" id="b3-word">⬇ Tải Word (' + de.ma.length + ' mã đề + đáp án + lời giải)</button> <button class="er-btn" id="b3-kho">Về kho đề</button></p></div>';
        $('#b3-chep').onclick = function () { var x = this; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(function () { x.textContent = '✔ Đã chép'; }, function () { prompt('Chép link:', l); }); };
        $('#b3-word').onclick = function () { taiWord(de, this); };
        $('#b3-kho').onclick = moTrang;
      }, function () { b.disabled = false; });
    };
  }
  function luu(de, xuatBan, xong, loi) {
    if (!de.ma) de.ma = tronMa(de.goc, de.caiDat || {});
    de.xuatBan = !!xuatBan || !!de.xuatBan;
    de.gvTen = (tk() || {}).hoTen || '';
    goi('gvLuuDe', { de: de }).then(function (r) {
      if (hetPhien(r)) return;
      if (r && r.ok) { de.id = r.id; if (xong) xong(); return; }
      if (r && r.hetHanMuc) { if (confirm(r.error + '\n\nĐăng ký gói ngay?')) dangKyGoi(); }
      else alert((r && r.error) || 'Không lưu được đề.');
      if (loi) loi();
    }).catch(function () { alert('Không kết nối được máy chủ.'); if (loi) loi(); });
  }

  // ================================================================ WORD
  function taiWord(de, nut) {
    if (!de.id) return alert('Thầy cô lưu đề trước rồi tải Word nhé.');
    if (!de.ma) de.ma = tronMa(de.goc, de.caiDat || {});
    var cu = nut && nut.textContent; if (nut) { nut.disabled = true; nut.textContent = '⏳ Đang tạo file Word…'; }
    G.XuatWord.taoFile({ title: de.title, time: de.time, khoi: de.khoi, donVi: (de.caiDat || {}).donVi, ma: de.ma }).then(function (blob) {
      var ten = String(de.title || 'De').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '_').slice(0, 60) + '.docx';
      var url = URL.createObjectURL(blob);
      if (nut) { nut.disabled = false; nut.textContent = cu; }
      var m = A.modal('<h2>⬇ File Word đã sẵn sàng</h2><p>' + Math.round(blob.size / 1024) + ' KB · ' + de.ma.length + ' mã đề, bảng đáp án, lời giải chi tiết. Công thức là phương trình Word (Equation); muốn MathType: mở bằng Word có MathType → <i>MathType › Convert Equations</i>.</p>' +
        '<p><a class="er-btn er-btn-y er-big" href="' + url + '" download="' + esc(ten) + '">💾 Lưu file Word</a></p>');
      if (!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) m.querySelector('a').click();
    }).catch(function (e) { if (nut) { nut.disabled = false; nut.textContent = cu; } alert('Không tạo được file Word: ' + e.message); });
  }

  // ================================================================ KẾT QUẢ (cần mã của Ban quản trị)
  function ketQua(x, tab) {
    var t = tk();
    A.shell('<section class="ap-card"><div class="kd-dau"><div><h1 style="margin:0">📊 Kết quả — ' + esc(x.title) + '</h1></div><div class="kd-nut"><button class="er-btn" id="kq-ve">← Kho đề</button></div></div><div id="kq-than"><p class="ap-load">Đang tải…</p></div></section>');
    TAB_KQ = tab || 'ds';
    $('#kq-ve').onclick = moTrang;
    var than = $('#kq-than');
    goi('gvKetQua', { id: x.id }).then(function (r) {
      if (hetPhien(r)) return;
      if (r && r.ok) return goi('gvLayDe', { id: x.id }).then(function (d) { veKetQua(x, r.results || [], d && d.ok ? d.de : null); });
      if (!r || !r.canMa) { than.innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Lỗi') + '</p>'; return; }
      goi('maTrangThai', { loai: 'KETQUA' }).then(function (s) {
        var st = (((s && s.ds) || []).filter(function (y) { return y.doiTuong === x.id; })[0] || {}).trangThai;
        if (st === 'Đã khoá') { than.innerHTML = '<p class="ap-warn2">Mã xem kết quả của đề này đang bị khoá. Liên hệ Ban quản trị nhé.</p>'; return; }
        if (!st) {
          than.innerHTML = '<p>' + esc(r.error || '') + '</p><p>Đề đã có <b>' + x.luot + '</b> lượt làm. Để xem kết quả từng học sinh, phân tích lỗi và tải Excel, thầy cô đăng ký <b>mã xem kết quả</b> cho đề này rồi liên hệ Ban quản trị.</p><button class="er-btn er-btn-y" id="kq-dk">📝 Đăng ký xem kết quả</button>';
          $('#kq-dk').onclick = function () { goi('maDangKy', { loai: 'KETQUA', doiTuong: x.id, moTa: x.title }).then(function () { ketQua(x); }); };
          return;
        }
        than.innerHTML = A.huongDanZalo(t.user, 'tên đề <b>' + esc(x.title) + '</b>') + '<label>Mã xem kết quả<input id="kq-ma" placeholder="VD: ABCD-1234" autocomplete="off"></label><button class="er-btn er-btn-y" id="kq-kh">Kích hoạt</button><p class="ap-note" id="kq-msg"></p>';
        $('#kq-kh').onclick = function () { goi('maKichHoat', { loai: 'KETQUA', doiTuong: x.id, ma: $('#kq-ma').value }).then(function (k) { if (k && k.ok) ketQua(x); else $('#kq-msg').textContent = (k && k.error) || 'Mã chưa đúng.'; }); };
      });
    });
  }
  var TAB_KQ = 'ds';
  function veKetQua(x, rows, de) {
    if (TAB_KQ === 'pt') return phanTichLoi(x, rows, de);
    var coTL = de && (de.ma || []).some(function (m) { return m.de.parts.some(function (p) { return p.type === 'es'; }); });
    rows.sort(function (a, b) { return String(b.nhan).localeCompare(String(a.nhan)); });
    var tong = function (r) { return Math.round(((+r.diemTN || 0) + (+r.diemTL || 0)) * 100) / 100; };
    var diem = rows.map(function (r) { return +r.diemTN || 0; });
    var tb = diem.length ? diem.reduce(function (a, b) { return a + b; }, 0) / diem.length : 0;
    $('#kq-than').innerHTML = '<div class="ap-lh-tom"><div><b>' + rows.length + '</b><span>lượt làm</span></div><div><b>' + fmt(Math.round(tb * 100) / 100) + '</b><span>điểm TN trung bình</span></div><div><b>' + (diem.length ? fmt(Math.max.apply(0, diem)) : '—') + '</b><span>cao nhất</span></div><div><b>' + rows.filter(function (r) { return +r.viPham; }).length + '</b><span>bài có vi phạm</span></div></div>' +
      '<div class="lh-tab"><button class="on">📋 Danh sách học sinh</button><button id="kq-tpt">🔎 Phân tích lỗi cả lớp</button></div>' +
      '<p><button class="er-btn er-btn-y" id="kq-xl">⬇ Tải Excel</button></p>' +
      '<div class="ap-tw"><table class="ap-t"><tr><th>Nộp lúc</th><th>Họ tên</th><th>Lớp</th><th>Trường</th><th>Mã đề</th><th>Điểm TN</th><th>Số câu sai</th>' + (coTL ? '<th>Tự luận</th><th>Tổng</th>' : '') + '<th>Thời gian</th><th>Vi phạm</th><th></th></tr>' +
      (rows.map(function (r, i) {
        var soAnh = 0; try { var a = JSON.parse(r.anhTL || '{}'); Object.keys(a).forEach(function (k) { soAnh += a[k].length; }); } catch (e) { }
        var ct = []; try { ct = typeof r.chiTiet === 'string' ? JSON.parse(r.chiTiet || '[]') : (r.chiTiet || []); } catch (e) { }
        var sai = ct.filter(function (c) { return c[2] === 0; }).length;
        return '<tr><td>' + new Date(r.nhan).toLocaleString('vi-VN') + '</td><td>' + esc(r.hoTen) + '</td><td>' + esc(r.lop) + '</td><td>' + esc(r.truong) + '</td><td>' + esc(String(r.maDe).split('#')[1] || '') + '</td><td><b>' + fmt(+r.diemTN) + '</b>/' + fmt(+r.toiDaTN) + '</td><td>' + (ct.length ? sai : '') + '</td>' +
          (coTL ? '<td>' + (r.diemTL === '' || r.diemTL == null ? '<span class="ap-pend">chờ chấm</span>' : fmt(+r.diemTL)) + '</td><td><b>' + (r.diemTL === '' || r.diemTL == null ? '—' : fmt(tong(r))) + '</b></td>' : '') +
          '<td>' + Math.round((+r.giay || 0) / 60) + ' phút</td><td>' + (+r.viPham ? '⚠ ' + r.viPham : '') + '</td>' +
          '<td class="ap-act"><button class="er-btn ap-sm" data-bai="' + i + '">👁 Bài làm</button>' + (coTL ? '<button class="er-btn ap-sm" data-cham="' + i + '">✍️ Chấm' + (soAnh ? ' · 📷 ' + soAnh : '') + '</button>' : '') + '</td></tr>';
      }).join('') || '<tr><td colspan="11">Chưa có học sinh làm bài.</td></tr>') + '</table></div>';
    $$('#kq-than [data-cham]').forEach(function (b) { b.onclick = function () { chamTL(x, rows, +b.dataset.cham, de); }; });
    $$('#kq-than [data-bai]').forEach(function (b) { b.onclick = function () { xemBai(rows[+b.dataset.bai], de); }; });
    $('#kq-tpt').onclick = function () { TAB_KQ = 'pt'; veKetQua(x, rows, de); };
    $('#kq-xl').onclick = function () {
      var dong = [['STT', 'Nộp lúc', 'Họ và tên', 'Lớp', 'Trường', 'Mã đề', 'Điểm trắc nghiệm', 'Tối đa TN', 'Điểm tự luận', 'Tổng', 'Thời gian (phút)', 'Số lần vi phạm']].concat(rows.map(function (r, i) {
        return [i + 1, new Date(r.nhan).toLocaleString('vi-VN'), r.hoTen, r.lop, r.truong, String(r.maDe).split('#')[1] || '', +r.diemTN || 0, +r.toiDaTN || 0, r.diemTL === '' ? '' : +r.diemTL, tong(r), Math.round((+r.giay || 0) / 60), +r.viPham || 0];
      }));
      var blob = G.XuatWord.taoXlsx(dong, 'Ket qua');
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Ket-qua_' + String(x.title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').slice(0, 50) + '.xlsx';
      document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 2000);
    };
  }

  // Xem bài làm của một học sinh (đúng/sai từng câu, đáp án)
  function bienCua(r, de) { var maSo = String(r.maDe).split('#')[1]; return (de && de.ma || []).filter(function (m) { return m.ma === maSo; })[0]; }
  function traLoiCua(r) { try { return typeof r.traLoi === 'string' ? JSON.parse(r.traLoi || '[]') : (r.traLoi || []); } catch (e) { return []; } }
  function xemBai(r, de) {
    var bien = bienCua(r, de); if (!bien) return alert('Không tìm thấy mã đề của bài làm.');
    var m = A_modal('<h2>👁 ' + esc(r.hoTen) + ' · ' + esc(r.lop) + ' — mã đề ' + esc(bien.ma) + '</h2><div id="xb-n"></div>');
    R.xemLai(m.querySelector('#xb-n'), Object.assign({}, bien.de, { id: de.id + '#' + bien.ma, title: de.title, time: de.time }), traLoiCua(r), { name: r.hoTen, lop: r.lop }, { anNut: true });
  }
  // Phân tích lỗi cả lớp: tỉ lệ đúng từng câu, phương án sai hay chọn (kèm lỗi sai thường gặp), bài học cần ôn lại
  function phanTichLoi(x, rows, de) {
    var than = $('#kq-than');
    if (!de) { than.innerHTML = '<p class="ap-warn2">Không mở được đề để phân tích.</p>'; return; }
    var goc = (de.goc && de.goc.parts) || de.ma[0].de.parts, tk_ = {}, thuTu = [];
    var khoa = function (p, q) { return p.type + '|' + (q.nh || String(q.stem).slice(0, 160)); };
    goc.forEach(function (p, pi) { p.qs.forEach(function (q, qi) { var k = khoa(p, q); tk_[k] = { p: p, q: q, pi: pi, so: qi + 1, n: 0, dung: 0, trong: 0, chon: {}, sai: [], tf: [0, 0, 0, 0], sa: {} }; thuTu.push(k); }); });
    var trong = function (v) { return v == null || v === '' || (Array.isArray(v) && v.every(function (z) { return z == null; })); };
    rows.forEach(function (r) {
      var b = bienCua(r, de); if (!b) return;
      var A_ = traLoiCua(r);
      b.de.parts.forEach(function (p, pi) {
        if (p.type === 'es') return;
        p.qs.forEach(function (q, qi) {
          var s = tk_[khoa(p, q)]; if (!s) return;
          var v = (A_[pi] || [])[qi]; s.n++;
          if (trong(v)) { s.trong++; s.sai.push(r.hoTen); return; }
          var ok;
          if (p.type === 'mc') { ok = v === q.ans; var nd = q.opts[v]; s.chon[nd] = (s.chon[nd] || 0) + 1; }
          else if (p.type === 'tf') { ok = true; q.items.forEach(function (it, j) { var d = v[j] != null && !!v[j] === !!it.ans; if (d) s.tf[j]++; else ok = false; }); }
          else { var a = R.parseNum(v), c = R.parseNum(q.ans); ok = !isNaN(a) && Math.abs(a - c) < 1e-9; if (!ok) s.sa[String(v)] = (s.sa[String(v)] || 0) + 1; }
          if (ok) s.dung++; else s.sai.push(r.hoTen);
        });
      });
    });
    var ds = thuTu.map(function (k) { return tk_[k]; }).filter(function (s) { return s.p.type !== 'es' && s.n; });
    var pc = function (a, b) { return b ? Math.round(a * 100 / b) : 0; };
    // theo bài học
    var bai = {}; ds.forEach(function (s) { var t = (s.q.m && s.q.m.nd) || 'Câu thầy cô tự soạn'; bai[t] = bai[t] || { n: 0, d: 0 }; bai[t].n += s.n; bai[t].d += s.dung; });
    var dsBai = Object.keys(bai).map(function (t) { return { t: t, p: pc(bai[t].d, bai[t].n) }; }).sort(function (a, b) { return a.p - b.p; });
    var tenPhan = { mc: 'Phần I', tf: 'Phần II', sa: 'Phần III' };
    var h = '<div class="lh-tab"><button id="pt-ds">📋 Danh sách học sinh</button><button class="on">🔎 Phân tích lỗi cả lớp</button></div>' +
      (!rows.length ? '<p>Chưa có bài nộp để phân tích.</p>' :
      '<p class="ap-note">Phân tích ' + rows.length + ' bài nộp. Câu sắp theo tỉ lệ đúng từ thấp đến cao — câu nhiều em sai nên chữa chung cho cả lớp.</p>' +
      '<h3>📚 Bài học cần ôn lại</h3><div class="pt-bai">' + dsBai.map(function (b) { return '<div><span>' + R.tex(b.t) + '</span><div class="ap-bar-t"><div class="ap-bar-f' + (b.p < 50 ? ' low' : '') + '" style="width:' + b.p + '%"></div></div><b>' + b.p + '% đúng</b></div>'; }).join('') + '</div>' +
      '<h3>🧩 Từng câu (câu sai nhiều nhất trước)</h3>' +
      ds.slice().sort(function (a, b) { return pc(a.dung, a.n) - pc(b.dung, b.n); }).map(function (s) {
        var p = pc(s.dung, s.n), q = s.q, t = s.p.type, chiTiet = '';
        if (t === 'mc') chiTiet = '<div class="pt-pa">' + q.opts.map(function (o, j) { var c = s.chon[o] || 0, pp = pc(c, s.n); return '<div class="' + (j === q.ans ? 'dung' : '') + '"><b>' + 'ABCD'[j] + '.</b> ' + R.tex(o) + ' <span class="pt-so">' + pp + '%</span>' + (j !== q.ans && c && q.notes && q.notes[j] ? '<small>💡 Lỗi thường gặp: ' + R.tex(q.notes[j]) + '</small>' : '') + '</div>'; }).join('') + '</div>';
        if (t === 'tf') chiTiet = '<div class="pt-pa">' + q.items.map(function (it, j) { return '<div><b>' + 'abcd'[j] + ')</b> ' + R.tex(it.t) + ' — ' + (it.ans ? 'Đúng' : 'Sai') + ' <span class="pt-so">' + pc(s.tf[j], s.n) + '% làm đúng ý này</span></div>'; }).join('') + '</div>';
        if (t === 'sa') { var hay = Object.keys(s.sa).sort(function (a, b) { return s.sa[b] - s.sa[a]; }).slice(0, 4); chiTiet = '<p>Đáp số đúng: <b>' + esc(q.ans) + '</b>' + (hay.length ? ' · Đáp số sai hay gặp: ' + hay.map(function (v) { return '<b>' + esc(v) + '</b> (' + s.sa[v] + ' em)'; }).join(', ') : '') + '</p>'; }
        return '<article class="pt-cau' + (p < 50 ? ' kem' : '') + '"><div class="pt-dau"><b>' + tenPhan[t] + ' · Câu ' + s.so + '</b><span class="pt-tile">' + p + '% đúng</span><span class="ap-note">' + s.dung + '/' + s.n + ' em' + (s.trong ? ' · bỏ trống ' + s.trong : '') + '</span></div>' +
          '<div class="er-stem">' + R.tex(q.stem) + '</div>' + chiTiet +
          (s.sai.length ? '<details><summary>' + s.sai.length + ' em làm sai / bỏ trống</summary><p>' + s.sai.map(esc).join(', ') + '</p></details>' : '') + '</article>';
      }).join(''));
    than.innerHTML = h;
    $('#pt-ds').onclick = function () { TAB_KQ = 'ds'; veKetQua(x, rows, de); };
  }

  // Chấm tự luận: xem bài gõ + ảnh học sinh gửi, nhập điểm từng câu
  function chamTL(x, rows, i, de) {
    var r = rows[i], maSo = String(r.maDe).split('#')[1], bien = (de.ma || []).filter(function (m) { return m.ma === maSo; })[0];
    if (!bien) return alert('Không tìm thấy mã đề ' + maSo + '.');
    var A = []; try { A = typeof r.traLoi === 'string' ? JSON.parse(r.traLoi || '[]') : r.traLoi; } catch (e) { }
    var ct = []; try { ct = r.chiTietTL ? (typeof r.chiTietTL === 'string' ? JSON.parse(r.chiTietTL) : r.chiTietTL) : []; } catch (e) { }
    var H = G.APP_ANH, h = '<h2>✍️ ' + esc(r.hoTen) + ' · ' + esc(r.lop) + ' — mã đề ' + maSo + '</h2><p>Trắc nghiệm: <b>' + fmt(+r.diemTN) + '</b>/' + fmt(+r.toiDaTN) + '</p>', k = 0;
    bien.de.parts.forEach(function (p, pi) {
      if (p.type !== 'es') return;
      p.qs.forEach(function (q, qi) {
        var max = q.pts || p.pts;
        h += '<div class="ap-es"><div><b>Câu ' + (qi + 1) + '</b> (' + fmt(max) + ' điểm): ' + R.tex(q.stem) + '</div>' +
          '<div class="er-pre ap-box">' + esc(((A[pi] || [])[qi]) || '(học sinh không gõ bài)') + '</div>' + H.hopAnh(H.anhCua(r, pi, qi)) +
          '<details><summary>Hướng dẫn chấm</summary><table class="er-table er-rub">' + (q.sol || []).map(function (st) { return '<tr><td style="text-align:left">' + R.tex(st.t) + '</td><td>' + fmt(st.p) + '</td></tr>'; }).join('') + '</table></details>' +
          '<label>Điểm câu ' + (qi + 1) + ': <input type="number" class="ap-esin" min="0" max="' + max + '" step="0.25" value="' + (ct[k] != null ? ct[k] : '') + '"></label></div>';
        k++;
      });
    });
    h += '<label>Nhận xét: <input id="ct-nx" value="' + esc(r.ghiChu || '') + '" style="width:100%"></label><p><button class="er-btn er-btn-y" id="ct-luu">Lưu điểm tự luận</button></p>';
    var m = A_modal(h);
    H.napAnh(m, { hsToken: (tk() || {}).token });
    m.querySelector('#ct-luu').onclick = function () {
      var pts = $$('.ap-esin', m).map(function (i) { return i.value === '' ? null : Math.max(0, Math.min(+i.max, +i.value)); });
      if (pts.some(function (v) { return v === null; })) return alert('Thầy cô nhập đủ điểm các câu tự luận nhé.');
      var t = Math.round(pts.reduce(function (a, b) { return a + b; }, 0) * 100) / 100;
      goi('gvChamTL', { ma: r.ma, diemTL: t, chiTietTL: pts, ghiChu: m.querySelector('#ct-nx').value }).then(function (k2) {
        if (k2 && k2.ok) { r.diemTL = t; r.chiTietTL = pts; r.ghiChu = m.querySelector('#ct-nx').value; m.remove(); veKetQua(x, rows, de); } else alert((k2 && k2.error) || 'Lỗi lưu điểm');
      });
    };
  }
  function A_modal(h) { var m = A.modal(h); m.querySelector('.ap-modal-in').classList.add('kd-rong'); return m; }

  G.KHO_DE = { moTrang: moTrang, ketQua: ketQua };
})(window);
