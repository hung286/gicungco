/* 🏫 LỚP HỌC — giáo viên: tạo lớp, mã vào lớp, danh sách học sinh (dán / Excel), giao đề, kết quả theo lớp.
 * Học sinh: vào lớp (chọn đúng tên mình + mã lớp), xem đề được giao, nhận thông báo đề mới.
 * Dùng hàm chung của app qua window.APP; dữ liệu ở máy chủ (Apps Script, sheet LopHoc + GiaoDe).
 */
(function (G) {
  'use strict';
  var A = G.APP, R = G.ExamRunner, esc = R.esc, fmt = R.fmt;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function tk() { return A.tk(); }
  function goi(lenh, d) { d = d || {}; d.token = (tk() || {}).token; return A.call(lenh, d); }
  function hetPhien(r) { if (r && r.hsAuth === false) { A.dangXuat(); return true; } return false; }
  function ngay(s, gio) { if (!s) return ''; var d = new Date(s); return isNaN(d) ? '' : gio ? d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : d.toLocaleDateString('vi-VN'); }
  // ---- chọn hạn: ngày + giờ + các mốc nhanh. chonHan(id, ms, choPhepKhong) -> HTML; ganHan(n, id) -> { lay(): ISO | '' | null (null = chưa hợp lệ) }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function tachNgayGio(ms) { var d = new Date(ms); return { ngay: d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()), gio: p2(d.getHours()) + ':' + p2(d.getMinutes()) }; }
  function mocNhanh() {
    var c = function (n, h, m) { var d = new Date(Date.now() + n * 864e5); d.setHours(h, m, 0, 0); return d.getTime(); }, bay = new Date(); bay.setHours(23, 59, 0, 0);
    return [['Sau 1 giờ', Date.now() + 36e5], ['Hôm nay 23:59', bay.getTime()], ['Ngày mai 22:00', c(1, 22, 0)], ['3 ngày nữa', c(3, 22, 0)], ['1 tuần nữa', c(7, 22, 0)]];
  }
  function chonHan(id, ms, khong) {
    var t = ms ? tachNgayGio(ms) : { ngay: '', gio: '22:00' };
    return '<div class="lh-han"><label class="kd-chk"><input type="checkbox" id="' + id + '-co" ' + (ms || !khong ? 'checked' : '') + '> ' + (khong ? 'Có hạn vào làm bài' : 'Hạn vào làm bài') + '</label>' +
      '<div class="lh-han-in"><label>📅 Ngày<input type="date" id="' + id + '-ngay" value="' + t.ngay + '"></label><label>🕒 Giờ<input type="time" id="' + id + '-gio" value="' + t.gio + '"></label></div>' +
      '<div class="lh-chip">' + mocNhanh().map(function (m, i) { return '<button type="button" class="er-btn ap-sm" data-moc="' + i + '">' + m[0] + '</button>'; }).join('') + '</div>' +
      '<p class="ap-note" id="' + id + '-tom"></p></div>';
  }
  function ganHan(n, id) {
    var co = n.querySelector('#' + id + '-co'), ng = n.querySelector('#' + id + '-ngay'), gi = n.querySelector('#' + id + '-gio'), tom = n.querySelector('#' + id + '-tom');
    var doc = function () { if (!co.checked) return ''; if (!ng.value || !gi.value) return null; var d = new Date(ng.value + 'T' + gi.value); return isNaN(d) ? null : d; };
    var ve = function () {
      ng.disabled = gi.disabled = !co.checked;
      var d = doc();
      if (d === '') tom.innerHTML = '♾ Không giới hạn thời gian — học sinh vào làm lúc nào cũng được.';
      else if (d === null) tom.innerHTML = '<b style="color:#b91c1c">Chọn ngày và giờ.</b>';
      else if (d.getTime() <= Date.now()) tom.innerHTML = '<b style="color:#b91c1c">⚠ Thời điểm này đã qua — chọn lại.</b>';
      else { var phut = Math.round((d.getTime() - Date.now()) / 6e4), con = phut < 90 ? phut + ' phút' : phut < 2880 ? Math.round(phut / 60) + ' giờ' : Math.round(phut / 1440) + ' ngày'; tom.innerHTML = '⏰ Học sinh vào làm bài được đến <b>' + d.toLocaleString('vi-VN', { weekday: 'long', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + '</b> (còn ' + con + '). Sau đó học sinh vào sẽ thấy <i>“Đã hết thời gian vào làm bài”</i>.'; }
    };
    co.onchange = ng.oninput = gi.oninput = ng.onchange = gi.onchange = ve;
    $$('[data-moc]', n).forEach(function (b) { b.onclick = function () { var t = tachNgayGio(mocNhanh()[+b.dataset.moc][1]); co.checked = true; ng.value = t.ngay; gi.value = t.gio; ve(); }; });
    ve();
    return { lay: function () { var d = doc(); return d === '' ? '' : d && d.getTime() > Date.now() ? d.toISOString() : null; } };
  }
  function linkLop(ma) { return A.linkWeb('lop=' + encodeURIComponent(ma)); }
  function linkGiao(deId, ma) { return A.linkWeb('de=' + encodeURIComponent(deId) + '&lop=' + encodeURIComponent(ma)); }
  function chep(nut, chu) { (navigator.clipboard ? navigator.clipboard.writeText(chu) : Promise.reject()).then(function () { var c = nut.textContent; nut.textContent = '✔ Đã chép'; setTimeout(function () { nut.textContent = c; }, 1600); }, function () { prompt('Chép:', chu); }); }
  function taiBlob(blob, ten) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ten; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  function tenTep(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '_').slice(0, 50); }

  // ================================================================ GIÁO VIÊN: danh sách lớp
  function lopGV() {
    var t = tk(); if (!t) return A.home();
    if (t.vaiTro !== 'Giáo viên' && t.vaiTro !== 'Quản trị') { A.shell('<section class="ap-card"><h1>🏫 Lớp học</h1><p>Chức năng dành cho tài khoản <b>Giáo viên</b>.</p><button class="er-btn" id="lh-ve">Quay lại</button></section>'); $('#lh-ve').onclick = function () { A.home(); }; return; }
    A.shell('<section class="ap-card"><div class="kd-dau"><div><h1 style="margin:0">🏫 Lớp học của tôi</h1><p class="ap-note">Tạo lớp → đưa danh sách học sinh lên → gửi <b>link lớp</b> và <b>mã vào lớp</b> cho học sinh → giao đề. Học sinh chọn đúng tên mình, nhập mã lớp một lần; lần sau thầy cô giao đề mới, các em nhận được thông báo.</p></div>' +
      '<div class="kd-nut"><button class="er-btn er-btn-y" id="lh-moi">＋ Tạo lớp</button><button class="er-btn" id="lh-kho">🧑‍🏫 Kho đề</button><button class="er-btn" id="lh-ve">← Về luyện đề</button></div></div><div id="lh-ds"><p class="ap-load">Đang tải lớp…</p></div></section>');
    $('#lh-ve').onclick = function () { A.home(); };
    $('#lh-kho').onclick = function () { G.KHO_DE.moTrang(); };
    $('#lh-moi').onclick = function () { suaLop(null); };
    goi('lopDanhSach').then(function (r) {
      if (hetPhien(r)) return;
      var box = $('#lh-ds'); if (!box) return;
      if (!r || !r.ok) { box.innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ lớp học — Ban quản trị cần cập nhật máy chủ.') + '</p>'; return; }
      if (!r.ds.length) { box.innerHTML = '<p>Chưa có lớp nào. Bấm <b>＋ Tạo lớp</b> để bắt đầu.</p>'; return; }
      box.innerHTML = '<div class="lh-the">' + r.ds.map(function (l, i) {
        return '<article class="lh-lop"><h3>' + esc(l.ten) + '</h3><p class="ap-note">' + esc(l.truong || '') + (l.khoi ? ' · Khối ' + esc(l.khoi) : '') + '</p>' +
          '<p>👥 <b>' + l.soHS + '</b> học sinh · ✅ <b>' + l.soDaVao + '</b> đã vào lớp · 📝 <b>' + l.soGiao + '</b> đề đã giao</p>' +
          '<p class="lh-ma">Mã vào lớp: <b>' + esc(l.maVao) + '</b></p>' +
          '<p><button class="er-btn er-btn-y ap-sm" data-a="mo" data-i="' + i + '">Mở lớp</button> <button class="er-btn ap-sm" data-a="link" data-i="' + i + '">🔗 Chép link lớp</button> <button class="er-btn ap-sm" data-a="sua" data-i="' + i + '">✏️ Sửa</button> <button class="er-btn ap-sm ap-del" data-a="xoa" data-i="' + i + '">🗑</button></p></article>';
      }).join('') + '</div>';
      $$('#lh-ds [data-a]').forEach(function (b) {
        b.onclick = function () {
          var l = r.ds[+b.dataset.i], a = b.dataset.a;
          if (a === 'mo') moLop(l.ma);
          if (a === 'link') chep(b, 'Lớp ' + l.ten + ' — vào lớp tại: ' + linkLop(l.ma) + ' · Mã vào lớp: ' + l.maVao);
          if (a === 'sua') suaLop(l);
          if (a === 'xoa' && confirm('Xoá lớp "' + l.ten + '"? Danh sách học sinh và các đề đã giao cho lớp sẽ bị xoá (kết quả bài làm vẫn giữ trong đề).')) goi('lopXoa', { ma: l.ma }).then(lopGV);
        };
      });
    });
  }
  function suaLop(l) {
    var t = tk(), m = A.modal('<h2>' + (l ? '✏️ Sửa lớp' : '＋ Tạo lớp') + '</h2><label>Tên lớp<input id="sl-ten" maxlength="40" placeholder="VD: 10A1" value="' + esc(l ? l.ten : '') + '"></label>' +
      '<label>Trường<input id="sl-tr" maxlength="120" value="' + esc(l ? l.truong : (t.truong || '')) + '"></label><label>Khối<select id="sl-k">' + ['', '6', '7', '8', '9', '10', '11', '12'].map(function (k) { return '<option' + ((l ? l.khoi : '10') === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' +
      (l ? '<label class="kd-chk"><input type="checkbox" id="sl-doi"> Đổi <b>mã vào lớp</b> (mã cũ hết dùng được; học sinh đã vào lớp không bị ảnh hưởng)</label>' : '') +
      '<p class="ap-warn2" id="sl-loi" hidden></p><p><button class="er-btn er-btn-y" id="sl-luu">' + (l ? 'Lưu' : 'Tạo lớp') + '</button></p>');
    m.querySelector('#sl-luu').onclick = function () {
      var b = this; b.disabled = true;
      var d = { ten: m.querySelector('#sl-ten').value, truong: m.querySelector('#sl-tr').value, khoi: m.querySelector('#sl-k').value };
      (l ? goi('lopSua', Object.assign(d, { ma: l.ma, doiMaVao: m.querySelector('#sl-doi').checked })) : goi('lopTao', d)).then(function (r) {
        b.disabled = false;
        if (r && r.ok) { m.remove(); if (l) lopGV(); else moLop(r.ma); return; }
        var e = m.querySelector('#sl-loi'); e.hidden = false; e.textContent = (r && r.error) || 'Lỗi';
      });
    };
  }

  // ================================================================ GIÁO VIÊN: một lớp
  var LOP = null;
  function moLop(ma, tab) {
    A.shell('<section class="ap-card"><div id="ml-than"><p class="ap-load">Đang mở lớp…</p></div></section>');
    goi('lopChiTiet', { ma: ma }).then(function (r) {
      if (hetPhien(r)) return;
      if (!r || !r.ok) { $('#ml-than').innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Lỗi') + '</p>'; return; }
      LOP = r; veLop(tab || (r.lop.ds.length ? 'giao' : 'hs'));
    });
  }
  function veLop(tab) {
    var l = LOP.lop;
    $('#ml-than').innerHTML = '<div class="kd-dau"><div><h1 style="margin:0">🏫 ' + esc(l.ten) + '</h1><p class="ap-note">' + esc(l.truong || '') + (l.khoi ? ' · Khối ' + esc(l.khoi) : '') + ' · ' + l.ds.length + ' học sinh · ' + l.ds.filter(function (h) { return h.user; }).length + ' đã vào lớp</p></div>' +
      '<div class="kd-nut"><button class="er-btn" id="ml-ve">← Các lớp</button></div></div>' +
      '<div class="lh-vao"><div><b>Cách học sinh vào lớp</b><br>1) Mở link lớp (hoặc vào Phòng luyện đề → <i>Lớp của em</i>) · 2) Đăng nhập tài khoản · 3) Nhập mã lớp <b class="lh-mabig">' + esc(l.maVao) + '</b> · 4) Chọn đúng tên mình.</div>' +
      '<div><input class="kd-link" readonly value="' + esc(linkLop(l.ma)) + '"><button class="er-btn ap-sm" id="ml-chep">📋 Chép link + mã lớp</button></div></div>' +
      '<div class="lh-tab"><button data-t="giao" class="' + (tab === 'giao' ? 'on' : '') + '">📝 Đề đã giao (' + LOP.giao.length + ')</button><button data-t="hs" class="' + (tab === 'hs' ? 'on' : '') + '">👥 Danh sách học sinh (' + l.ds.length + ')</button></div><div id="ml-tab"></div>';
    $('#ml-ve').onclick = lopGV;
    $('#ml-chep').onclick = function () { chep(this, 'Lớp ' + l.ten + ' — vào lớp tại: ' + linkLop(l.ma) + ' · Mã vào lớp: ' + l.maVao); };
    $$('.lh-tab [data-t]').forEach(function (b) { b.onclick = function () { veLop(b.dataset.t); }; });
    if (tab === 'hs') tabHS(); else tabGiao();
  }
  function tabHS() {
    var l = LOP.lop, n = $('#ml-tab');
    n.innerHTML = '<p><button class="er-btn er-btn-y" id="hs-dan">📋 Dán danh sách</button> <label class="er-btn">📤 Tải tệp Excel…<input type="file" id="hs-xl" accept=".xlsx" hidden></label> <button class="er-btn" id="hs-mau">⬇ Tệp Excel mẫu</button></p>' +
      (l.ds.length ? '<div class="ap-tw"><table class="ap-t"><tr><th>STT</th><th>Họ và tên</th><th>Ngày sinh</th><th>Vào lớp</th><th></th></tr>' + l.ds.map(function (h, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(h.ten) + '</td><td>' + esc(h.ns || '') + '</td><td>' + (h.user ? '✅ <small>' + esc(h.user) + '</small>' : '<span class="ap-note">chưa vào</span>') + '</td><td>' + (h.user ? '<button class="er-btn ap-sm" data-go="' + esc(h.id) + '" title="Gỡ tài khoản đã chọn tên này (khi học sinh chọn nhầm)">Gỡ</button>' : '') + '</td></tr>';
      }).join('') + '</table></div>' : '<p class="ap-note">Chưa có học sinh. Dán danh sách (mỗi dòng một em) hoặc tải tệp Excel theo mẫu (cột <b>Họ và tên</b>, có thể thêm cột <b>Ngày sinh</b> để phân biệt các em trùng tên).</p>');
    $('#hs-mau').onclick = function () {
      taiBlob(G.XuatWord.taoXlsx([['STT', 'Họ và tên', 'Ngày sinh (không bắt buộc)'], [1, 'Nguyễn Văn An', '12/03/2010'], [2, 'Trần Thị Bình', '25/07/2010'], [3, 'Lê Minh Châu', '']], 'Danh sach lop'), 'Mau_danh_sach_lop.xlsx');
    };
    $('#hs-dan').onclick = function () { nhapDS(null); };
    $('#hs-xl').onchange = function () {
      var f = this.files[0]; this.value = ''; if (!f) return;
      G.NHAP_DE.docXlsx(f).then(function (bang) { nhapDS(G.NHAP_DE.dsTuBang(bang)); }, function (e) { alert(e.message); });
    };
    $$('#ml-tab [data-go]').forEach(function (b) { b.onclick = function () { if (!confirm('Gỡ tài khoản khỏi tên này? Học sinh sẽ chọn lại tên khi vào lớp.')) return; goi('lopGoTen', { ma: l.ma, id: b.dataset.go }).then(function () { moLop(l.ma, 'hs'); }); }; });
  }
  function nhapDS(ds) {
    var l = LOP.lop;
    var m = A.modal('<h2>👥 Danh sách học sinh — ' + esc(l.ten) + '</h2>' +
      (ds ? '' : '<p class="ap-note">Dán từ Excel/Word: mỗi dòng một học sinh. Có thể kèm STT đầu dòng và ngày sinh cuối dòng (cách nhau bằng phím Tab).</p><textarea id="nd-chu" rows="10" placeholder="1\tNguyễn Văn An\t12/03/2010&#10;2\tTrần Thị Bình"></textarea>') +
      '<div id="nd-xem"></div><div class="kd-kieu"><label><input type="radio" name="nd-cd" value="thay" checked> <b>Thay danh sách</b> (giữ nguyên các em đã vào lớp nếu tên trùng)</label><label><input type="radio" name="nd-cd" value="them"> <b>Thêm vào cuối</b> danh sách hiện có</label></div>' +
      '<p class="ap-warn2" id="nd-loi" hidden></p><p><button class="er-btn er-btn-y" id="nd-luu">Lưu danh sách</button></p>');
    var lay = function () { return ds || G.NHAP_DE.dsTuChu(m.querySelector('#nd-chu').value); };
    var xem = function () { var d = lay(); m.querySelector('#nd-xem').innerHTML = '<p>Nhận được <b>' + d.length + '</b> học sinh' + (d.length ? ': ' + d.slice(0, 6).map(function (h) { return esc(h.ten) + (h.ns ? ' (' + esc(h.ns) + ')' : ''); }).join(', ') + (d.length > 6 ? ', …' : '') : '') + '</p>'; };
    var o = m.querySelector('#nd-chu'); if (o) o.oninput = xem; xem();
    m.querySelector('#nd-luu').onclick = function () {
      var d = lay(), b = this; if (!d.length) return alert('Chưa có học sinh nào.');
      b.disabled = true;
      goi('lopLuuHS', { ma: l.ma, ds: d, cheDo: m.querySelector('input[name=nd-cd]:checked').value }).then(function (r) {
        b.disabled = false;
        if (r && r.ok) { m.remove(); moLop(l.ma, 'hs'); return; }
        var e = m.querySelector('#nd-loi'); e.hidden = false; e.textContent = (r && r.error) || 'Lỗi';
      });
    };
  }
  function tabGiao() {
    var l = LOP.lop, n = $('#ml-tab');
    n.innerHTML = '<p><button class="er-btn er-btn-y" id="gd-moi">＋ Giao đề cho lớp</button></p>' +
      (LOP.giao.length ? '<div class="ap-tw"><table class="ap-t"><tr><th>Đề</th><th>Giao lúc</th><th>Hạn vào làm bài</th><th></th></tr>' + LOP.giao.map(function (x, i) {
        var qua = x.han && new Date(x.han).getTime() < Date.now();
        return '<tr><td><b>' + esc(x.tenDe) + '</b>' + (x.ghiChu ? '<br><small>' + esc(x.ghiChu) + '</small>' : '') + '</td><td>' + ngay(x.giaoLuc, 1) + '</td><td>' + (x.han ? ngay(x.han, 1) + (qua ? '<br><b class="lh-het">⌛ Đã hết hạn</b>' : '') : '<span class="ap-note">không hạn</span>') + '</td>' +
          '<td class="ap-act"><button class="er-btn er-btn-y ap-sm" data-a="kq" data-i="' + i + '">📊 Kết quả</button><button class="er-btn ap-sm" data-a="han" data-i="' + i + '">⏰ Đổi hạn</button><button class="er-btn ap-sm" data-a="qlai" data-i="' + i + '">🔓 Cấp quyền làm lại</button><button class="er-btn ap-sm" data-a="link" data-i="' + i + '">🔗 Link</button><button class="er-btn ap-sm ap-del" data-a="huy" data-i="' + i + '">Huỷ giao</button></td></tr>';
      }).join('') + '</table></div>' : '<p class="ap-note">Chưa giao đề nào. Đề cần <b>xuất bản</b> trong Kho đề trước khi giao.</p>');
    $('#gd-moi').onclick = function () { giaoDe(l, null); };
    $$('#ml-tab [data-a]').forEach(function (b) {
      b.onclick = function () {
        var x = LOP.giao[+b.dataset.i], a = b.dataset.a;
        if (a === 'kq') ketQuaGiao(x);
        if (a === 'han') doiHan(x);
        if (a === 'qlai') capQuyen(x, null);
        if (a === 'link') chep(b, x.tenDe + ' — lớp ' + l.ten + ': ' + linkGiao(x.deId, l.ma));
        if (a === 'huy' && confirm('Huỷ giao đề "' + x.tenDe + '" cho lớp? (Bài đã nộp vẫn còn trong kết quả của đề.)')) goi('lopHuyGiao', { maGiao: x.maGiao }).then(function () { moLop(l.ma, 'giao'); });
      };
    });
  }
  // đổi hạn của cả lớp
  function doiHan(x) {
    var l = LOP.lop, mo = x.han && new Date(x.han).getTime() > Date.now() ? new Date(x.han).getTime() : Date.now() + 864e5;
    var m = A.modal('<h2>⏰ Đổi hạn vào làm bài</h2><p>Đề <b>' + esc(x.tenDe) + '</b> · lớp <b>' + esc(l.ten) + '</b>' + (x.han ? '<br>Hạn hiện tại: <b>' + ngay(x.han, 1) + '</b>' : '') + '</p>' + chonHan('dh', mo, true) +
      '<p class="ap-note">Đổi hạn áp dụng cho <b>cả lớp</b>. Muốn cho riêng một em làm lại sau khi hết hạn, dùng <b>🔓 Cấp quyền làm lại</b>.</p><p class="ap-warn2" id="dh-loi" hidden></p><p><button class="er-btn er-btn-y" id="dh-ok">Lưu hạn mới</button></p>');
    var c = ganHan(m, 'dh');
    m.querySelector('#dh-ok').onclick = function () {
      var han = c.lay(), b = this, e = m.querySelector('#dh-loi');
      if (han === null) { e.hidden = false; e.textContent = 'Chọn ngày giờ ở tương lai, hoặc bỏ dấu tick “Có hạn”.'; return; }
      b.disabled = true;
      goi('lopDoiHan', { ma: l.ma, maGiao: x.maGiao, han: han }).then(function (r) {
        b.disabled = false;
        if (r && r.ok) { m.remove(); moLop(l.ma, 'giao'); return; }
        e.hidden = false; e.textContent = (r && r.auth === false) || !r ? 'Máy chủ chưa hỗ trợ chức năng này — Ban quản trị cần cập nhật mã máy chủ.' : (r.error || 'Lỗi');
      });
    };
  }
  // cấp quyền làm lại (sau khi hết hạn): cho cả lớp hoặc từng em
  function capQuyen(x, truoc) {
    var l = LOP.lop, co = l.ds.filter(function (h) { return h.user; });
    var m = A.modal('<h2>🔓 Cấp quyền làm lại</h2><p>Đề <b>' + esc(x.tenDe) + '</b> · lớp <b>' + esc(l.ten) + '</b>. Học sinh được cấp quyền sẽ vào làm bài được đến hạn mới dù hạn cũ đã qua.</p>' +
      '<div class="kd-kieu lh-kieu"><label><input type="radio" name="cq-ai" value="lop" ' + (truoc ? '' : 'checked') + '> <b>Cả lớp</b> (' + l.ds.length + ' học sinh)</label><label><input type="radio" name="cq-ai" value="em" ' + (truoc ? 'checked' : '') + '> <b>Chọn từng em</b></label></div>' +
      '<div id="cq-ds" class="lh-cq-ds" ' + (truoc ? '' : 'hidden') + '>' + (co.length ? '<p><button type="button" class="er-btn ap-sm" id="cq-tat">Chọn tất cả</button> <button type="button" class="er-btn ap-sm" id="cq-bo">Bỏ chọn</button></p>' + co.map(function (h) { return '<label class="kd-chk"><input type="checkbox" data-id="' + esc(h.id) + '" ' + (truoc && truoc.indexOf(h.id) >= 0 ? 'checked' : '') + '> ' + esc(h.ten) + '</label>'; }).join('') : '<p class="ap-note">Chưa có em nào vào lớp bằng tài khoản.</p>') + '</div>' +
      chonHan('cq', Date.now() + 864e5, true) + '<p class="ap-note">Bỏ dấu tick “Có hạn” nếu muốn cho làm lại không giới hạn thời gian.</p><p class="ap-warn2" id="cq-loi" hidden></p><p><button class="er-btn er-btn-y" id="cq-ok">🔓 Cấp quyền</button></p>');
    var c = ganHan(m, 'cq');
    $$('input[name=cq-ai]', m).forEach(function (r) { r.onchange = function () { m.querySelector('#cq-ds').hidden = m.querySelector('input[name=cq-ai]:checked').value !== 'em'; }; });
    var tat = m.querySelector('#cq-tat'); if (tat) tat.onclick = function () { $$('#cq-ds [data-id]', m).forEach(function (i) { i.checked = true; }); };
    var bo = m.querySelector('#cq-bo'); if (bo) bo.onclick = function () { $$('#cq-ds [data-id]', m).forEach(function (i) { i.checked = false; }); };
    m.querySelector('#cq-ok').onclick = function () {
      var han = c.lay(), b = this, e = m.querySelector('#cq-loi'), caLop = m.querySelector('input[name=cq-ai]:checked').value === 'lop';
      var ids = $$('#cq-ds [data-id]:checked', m).map(function (i) { return i.dataset.id; });
      if (han === null) { e.hidden = false; e.textContent = 'Chọn ngày giờ ở tương lai, hoặc bỏ dấu tick “Có hạn”.'; return; }
      if (!caLop && !ids.length) { e.hidden = false; e.textContent = 'Chọn ít nhất một em.'; return; }
      b.disabled = true;
      goi('lopMoLai', { ma: l.ma, maGiao: x.maGiao, caLop: caLop, ids: ids, han: han }).then(function (r) {
        b.disabled = false;
        if (r && r.ok) { m.remove(); alert('✔ Đã cấp quyền làm lại cho ' + (caLop ? 'cả lớp' : r.soHS + ' học sinh') + (han ? ', đến ' + ngay(han, 1) : ' (không giới hạn thời gian)') + '.'); ketQuaGiao(x); return; }
        e.hidden = false; e.textContent = (r && r.auth === false) || !r ? 'Máy chủ chưa hỗ trợ chức năng này — Ban quản trị cần cập nhật mã máy chủ.' : (r.error || 'Lỗi');
      });
    };
  }
  // giao một đề (từ trang lớp: chọn đề; từ kho đề: chọn lớp)
  function giaoDe(lop, de) {
    var m = A.modal('<h2>📝 Giao đề cho lớp</h2><div id="gd-n"><p class="ap-load">Đang tải…</p></div>');
    var n = m.querySelector('#gd-n');
    Promise.all([de ? Promise.resolve(null) : goi('gvDanhSachDe'), lop ? Promise.resolve(null) : goi('lopDanhSach')]).then(function (rr) {
      if (hetPhien(rr[0]) || hetPhien(rr[1])) return m.remove();
      var des = de ? [de] : ((rr[0] && rr[0].ds) || []).filter(function (x) { return x.trangThai === 'Đã xuất bản'; });
      var lops = lop ? [lop] : ((rr[1] && rr[1].ds) || []);
      if (!des.length) { n.innerHTML = '<p>Chưa có đề nào đã xuất bản. Vào <b>Kho đề</b> → tạo đề → bước 3 bấm <b>Xuất bản</b>, rồi giao cho lớp.</p>'; return; }
      if (!lops.length) { n.innerHTML = '<p>Thầy cô chưa có lớp. Vào <b>🏫 Lớp học của tôi</b> để tạo lớp trước.</p><button class="er-btn er-btn-y" id="gd-taolop">🏫 Tạo lớp</button>'; n.querySelector('#gd-taolop').onclick = function () { m.remove(); lopGV(); }; return; }
      var mai = new Date(Date.now() + 7 * 864e5); mai.setHours(22, 0, 0, 0);
      var gt = new Date(mai.getTime() - mai.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      n.innerHTML = (de ? '<p>Đề: <b>' + esc(de.title) + '</b></p>' : '<label>Chọn đề<select id="gd-de">' + des.map(function (x, i) { return '<option value="' + i + '">' + esc(x.title) + ' (khối ' + esc(x.khoi) + ')</option>'; }).join('') + '</select></label>') +
        (lop ? '<p>Lớp: <b>' + esc(lop.ten) + '</b></p>' : '<label>Chọn lớp<select id="gd-lop">' + lops.map(function (x, i) { return '<option value="' + i + '">' + esc(x.ten) + ' — ' + x.soHS + ' học sinh</option>'; }).join('') + '</select></label>') +
        chonHan('gd', mai.getTime(), true) +
        '<label>Lời nhắn cho học sinh (không bắt buộc)<input id="gd-nhan" maxlength="200" placeholder="VD: Làm trong 45 phút, không mở sách."></label>' +
        '<p class="ap-warn2" id="gd-loi" hidden></p><p><button class="er-btn er-btn-y" id="gd-ok">📝 Giao đề</button></p>';
      var chonH = ganHan(n, 'gd');
      n.querySelector('#gd-ok').onclick = function () {
        var b = this, x = de || des[+n.querySelector('#gd-de').value], l = lop || lops[+n.querySelector('#gd-lop').value];
        var han = chonH.lay();
        if (han === null) { var e0 = n.querySelector('#gd-loi'); e0.hidden = false; e0.textContent = 'Hạn chưa hợp lệ: chọn ngày giờ ở tương lai, hoặc bỏ dấu tick “Có hạn”.'; return; }
        b.disabled = true;
        goi('lopGiao', { ma: l.ma, deId: x.id, han: han, ghiChu: n.querySelector('#gd-nhan').value }).then(function (r) {
          b.disabled = false;
          if (r && r.ok) {
            n.innerHTML = '<h3>✅ Đã giao đề cho lớp ' + esc(l.ten) + '</h3><p>Học sinh đã vào lớp sẽ thấy đề trong <b>Lớp của em</b> và có thông báo 📬 khi mở website. Có thể gửi thêm link này vào nhóm lớp:</p><input class="kd-link" readonly value="' + esc(linkGiao(x.id, l.ma)) + '"><p><button class="er-btn er-btn-y" id="gd-chep">📋 Chép link</button> <button class="er-btn" id="gd-mo">Mở lớp</button></p>';
            n.querySelector('#gd-chep').onclick = function () { chep(this, x.title + ' — lớp ' + l.ten + ': ' + linkGiao(x.id, l.ma)); };
            n.querySelector('#gd-mo').onclick = function () { m.remove(); moLop(l.ma, 'giao'); };
            return;
          }
          var e = n.querySelector('#gd-loi'); e.hidden = false; e.textContent = (r && r.error) || 'Lỗi';
        });
      };
    });
  }
  function ketQuaGiao(x) {
    var l = LOP.lop, n = $('#ml-tab');
    n.innerHTML = '<p class="ap-load">Đang tải kết quả…</p>';
    goi('lopKetQua', { ma: l.ma, maGiao: x.maGiao }).then(function (r) {
      if (hetPhien(r)) return;
      if (r && r.canMa) { n.innerHTML = '<p class="ap-warn2">' + esc(r.error) + '</p><p><button class="er-btn er-btn-y" id="kq-mo">Mở kết quả đề trong Kho đề (đăng ký mã)</button> <button class="er-btn" id="kq-lai">← Đề đã giao</button></p>'; $('#kq-mo').onclick = function () { G.KHO_DE.ketQua({ id: x.deId, title: x.tenDe, luot: '?' }); }; $('#kq-lai').onclick = tabGiao; return; }
      if (!r || !r.ok) { n.innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Lỗi') + '</p>'; return; }
      var diem = function (lt) { return lt.reduce(function (m, y) { var d = +y.diemTN || 0; return m == null || d > m.diemTN ? { diemTN: d, toiDaTN: +y.toiDaTN || 0, y: y } : m; }, null); };
      var dong = r.ds.map(function (h) { return { h: h, tot: diem(h.luot) }; });
      var nop = dong.filter(function (d) { return d.tot; }), chua = dong.filter(function (d) { return !d.tot; });
      var tb = nop.length ? nop.reduce(function (a, d) { return a + d.tot.diemTN; }, 0) / nop.length : 0;
      n.innerHTML = '<p><button class="er-btn" id="kq-lai">← Đề đã giao</button> <b>' + esc(x.tenDe) + '</b>' + (x.han ? ' · hạn ' + ngay(x.han, 1) : '') + '</p>' +
        '<div class="ap-lh-tom"><div><b>' + nop.length + '/' + r.ds.length + '</b><span>đã nộp</span></div><div><b>' + chua.length + '</b><span>chưa làm</span></div><div><b>' + fmt(Math.round(tb * 100) / 100) + '</b><span>điểm TN trung bình</span></div></div>' +
        '<p><button class="er-btn er-btn-y" id="kq-xl">⬇ Tải Excel theo danh sách lớp</button> <button class="er-btn" id="kq-pt">🔎 Phân tích lỗi cả lớp</button> <button class="er-btn" id="kq-han">⏰ Đổi hạn</button> <button class="er-btn" id="kq-ql">🔓 Cấp quyền làm lại…</button></p>' +
        (r.caLop ? '<p class="ap-note">🔓 Đã cấp quyền làm lại cho <b>cả lớp</b>.</p>' : '') +
        '<div class="ap-tw"><table class="ap-t"><tr><th>STT</th><th>Họ và tên</th><th>Trạng thái</th><th>Điểm TN (cao nhất)</th><th>Số lượt</th><th>Nộp lúc</th><th>Vi phạm</th><th>Hạn</th></tr>' + dong.map(function (d, i) {
          var h = d.h, t = d.tot;
          return '<tr class="' + (t ? '' : 'lh-chua') + '"><td>' + (i + 1) + '</td><td>' + esc(h.ten) + (h.ns ? ' <small>(' + esc(h.ns) + ')</small>' : '') + '</td><td>' + (!h.user ? '<span class="ap-note">chưa vào lớp</span>' : t ? '✅ đã nộp' : '⏳ chưa làm') + '</td>' +
            '<td>' + (t ? '<b>' + fmt(t.diemTN) + '</b>/' + fmt(t.toiDaTN) : '') + '</td><td>' + (h.luot.length || '') + '</td><td>' + (t ? ngay(t.y.nhan, 1) : '') + '</td><td>' + (t && +t.y.viPham ? '⚠ ' + t.y.viPham : '') + '</td><td class="lh-hn">' + (h.moLai ? '🔓 làm lại' + (h.hanMoLai ? ' đến ' + ngay(h.hanMoLai, 1) : '') : h.hetHan && h.user ? '<b class="lh-het">⌛ hết hạn</b>' : '') + (h.user ? ' <button class="er-btn ap-sm" data-ql="' + esc(h.id) + '" title="Cấp quyền làm lại cho em này">🔓</button>' : '') + '</td></tr>';
        }).join('') + '</table></div>';
      $('#kq-lai').onclick = tabGiao;
      $('#kq-han').onclick = function () { doiHan(x); };
      $('#kq-ql').onclick = function () { capQuyen(x, null); };
      $$('#ml-tab [data-ql]').forEach(function (b) { b.onclick = function () { capQuyen(x, [b.dataset.ql]); }; });
      $('#kq-pt').onclick = function () { G.KHO_DE.ketQua({ id: x.deId, title: x.tenDe, luot: nop.length }, 'pt'); };
      $('#kq-xl').onclick = function () {
        var bang = [['STT', 'Họ và tên', 'Ngày sinh', 'Tài khoản', 'Trạng thái', 'Điểm TN cao nhất', 'Tối đa TN', 'Điểm tự luận', 'Số lượt', 'Nộp lúc', 'Số lần vi phạm']].concat(dong.map(function (d, i) {
          var h = d.h, t = d.tot;
          return [i + 1, h.ten, h.ns || '', h.user || '', !h.user ? 'Chưa vào lớp' : t ? 'Đã nộp' : 'Chưa làm', t ? t.diemTN : '', t ? t.toiDaTN : '', t && t.y.diemTL !== '' && t.y.diemTL != null ? +t.y.diemTL : '', h.luot.length, t ? ngay(t.y.nhan, 1) : '', t ? +t.y.viPham || 0 : ''];
        }));
        taiBlob(G.XuatWord.taoXlsx(bang, 'Ket qua ' + l.ten), 'Ket-qua_' + tenTep(l.ten) + '_' + tenTep(x.tenDe) + '.xlsx');
      };
    });
  }

  // ================================================================ HỌC SINH: vào lớp, lớp của em
  function vaoLop(maLop, sau) {
    if (!tk()) return A.dangNhap(function () { vaoLop(maLop, sau); });
    A.shell('<section class="ap-card"><h1>🏫 Vào lớp</h1><div id="vl-n"><p class="ap-load">Đang mở…</p></div></section>');
    var n = $('#vl-n');
    var buoc1 = function (thongTin, loi) {
      n.innerHTML = (thongTin ? '<p>Lớp <b>' + esc(thongTin.ten) + '</b>' + (thongTin.truong ? ' · ' + esc(thongTin.truong) : '') + ' · thầy/cô <b>' + esc(thongTin.gvTen) + '</b></p>' : '<p>Nhập <b>mã lớp</b> thầy/cô gửi cho em (6 kí tự).</p>') +
        '<label>Mã vào lớp<input id="vl-ma" maxlength="10" autocomplete="off" style="text-transform:uppercase;font-size:20px;letter-spacing:3px;max-width:220px"></label>' +
        (loi ? '<p class="ap-warn2">' + esc(loi) + '</p>' : '') + '<p><button class="er-btn er-btn-y" id="vl-tiep">Tiếp tục →</button> <button class="er-btn" id="vl-ve">Về trang luyện đề</button></p>';
      $('#vl-ve').onclick = function () { A.home(); };
      var tiep = function () {
        var ma = $('#vl-ma').value.trim(); if (!ma) return;
        $('#vl-tiep').disabled = true;
        goi('hsLopXem', { ma: maLop || '', maVao: ma }).then(function (r) {
          if (hetPhien(r)) return;
          if (!r || !r.ok) return buoc1(r && r.lop || thongTin, (r && r.error) || 'Lỗi');
          chonTen(r, ma);
        });
      };
      $('#vl-tiep').onclick = tiep; $('#vl-ma').onkeydown = function (e) { if (e.key === 'Enter') tiep(); }; $('#vl-ma').focus();
    };
    var chonTen = function (r, ma) {
      var cua = r.ds.filter(function (h) { return h.laToi; })[0];
      n.innerHTML = '<p>Lớp <b>' + esc(r.lop.ten) + '</b> · thầy/cô <b>' + esc(r.lop.gvTen) + '</b></p>' + (cua ? '<p>✅ Em đã vào lớp với tên <b>' + esc(cua.ten) + '</b>. Chọn lại nếu nhầm.</p>' : '<p>Chọn <b>đúng tên của em</b> trong danh sách (mỗi tên chỉ một bạn chọn được):</p>') +
        '<input id="vl-loc" placeholder="🔎 Gõ để tìm tên…" style="max-width:320px"><div class="lh-ten">' + r.ds.map(function (h) {
          return '<label class="' + (h.daChon ? 'tat' : '') + '"><input type="radio" name="vl-ten" value="' + esc(h.id) + '"' + (h.daChon ? ' disabled' : '') + (h.laToi ? ' checked' : '') + '> ' + esc(h.ten) + (h.ns ? ' <small>(' + esc(h.ns) + ')</small>' : '') + (h.daChon ? ' <small>— đã có bạn chọn</small>' : '') + '</label>';
        }).join('') + '</div><p class="ap-note">Không thấy tên mình hoặc tên đã bị bạn khác chọn nhầm? Báo thầy/cô để sửa danh sách.</p><p class="ap-warn2" id="vl-loi" hidden></p><p><button class="er-btn er-btn-y er-big" id="vl-ok">Đây là tên của em ✔</button></p>';
      $('#vl-loc').oninput = function () { var q = this.value.trim().toLowerCase(); $$('.lh-ten label').forEach(function (x) { x.hidden = q && x.textContent.toLowerCase().indexOf(q) < 0; }); };
      $('#vl-ok').onclick = function () {
        var c = $('input[name=vl-ten]:checked'); if (!c) return alert('Em chọn tên của mình nhé.');
        var b = this; b.disabled = true;
        goi('hsVaoLop', { ma: r.lop.ma, maVao: ma, id: c.value }).then(function (x) {
          b.disabled = false;
          if (x && x.ok) { try { sessionStorage.removeItem('tb_lop'); } catch (e) { } if (sau) sau(); else lopCuaEm('✅ Em đã vào lớp ' + x.lop.ten + ' với tên ' + x.ten + '.'); return; }
          var e = $('#vl-loi'); e.hidden = false; e.textContent = (x && x.error) || 'Lỗi';
        });
      };
    };
    if (maLop) goi('hsLopXem', { ma: maLop }).then(function (r) { if (hetPhien(r)) return; buoc1(r && r.lop); }); else buoc1(null);
  }
  function lopCuaEm(bao) {
    if (!tk()) return A.dangNhap(function () { lopCuaEm(bao); });
    A.shell('<section class="ap-card"><div class="kd-dau"><div><h1 style="margin:0">📬 Lớp của em</h1>' + (bao ? '<p class="ap-ok2">' + esc(bao) + '</p>' : '') + '</div><div class="kd-nut"><button class="er-btn" id="lc-vao">＋ Vào lớp (nhập mã)</button><button class="er-btn" id="lc-ve">← Về luyện đề</button></div></div><div id="lc-n"><p class="ap-load">Đang tải…</p></div></section>');
    $('#lc-ve').onclick = function () { A.home(); };
    $('#lc-vao').onclick = function () { vaoLop(null); };
    goi('hsLopCuaToi', { moi: 1 }).then(function (r) {
      if (hetPhien(r)) return;
      var n = $('#lc-n'); if (!n) return;
      if (!r || !r.ok) { n.innerHTML = '<p class="ap-warn2">' + esc((r && r.error) || 'Máy chủ chưa hỗ trợ lớp học.') + '</p>'; return; }
      ghiThongBao(r.soMoi);
      if (!r.lop.length) { n.innerHTML = '<p>Em chưa vào lớp nào. Khi thầy/cô gửi <b>link lớp</b> hoặc <b>mã lớp</b>, bấm <b>＋ Vào lớp</b> và chọn đúng tên mình.</p>'; return; }
      n.innerHTML = r.lop.map(function (l) {
        return '<article class="lh-lop rong"><h3>🏫 ' + esc(l.ten) + ' <small class="ap-note">' + esc(l.truong || '') + ' · thầy/cô ' + esc(l.gvTen) + ' · em: ' + esc(l.tenEm) + '</small></h3>' +
          (l.giao.length ? l.giao.map(function (g) {
            var qua = g.hetHan != null ? g.hetHan : g.han && new Date(g.han).getTime() < Date.now();
            return '<div class="lh-giao ' + (qua ? 'qua' : g.daLam ? 'xong' : 'moi') + '"><div><b>' + esc(g.tenDe) + '</b><br><small>Giao ' + ngay(g.giaoLuc, 1) + (g.han ? ' · hạn ' + ngay(g.han, 1) : '') + '</small>' + (g.moLai && !qua ? '<br><small class="lh-lai">🔓 Thầy/cô cho phép làm lại' + (g.han ? ' đến ' + ngay(g.han, 1) : '') + '</small>' : '') + (g.ghiChu ? '<br><small>💬 ' + esc(g.ghiChu) + '</small>' : '') + '</div>' +
              '<div class="lh-tt">' + (g.daLam ? '✅ Đã làm · <b>' + fmt(g.diem) + '</b>/' + fmt(g.toiDa) : qua ? '⌛ Đã hết thời gian vào làm bài' : '🆕 Chưa làm') + '<br>' + (qua ? '<small class="ap-note">Nhắn thầy/cô để được làm lại</small>' : '<button class="er-btn ' + (g.daLam ? '' : 'er-btn-y') + ' ap-sm" data-de="' + esc(g.deId) + '">' + (g.daLam ? 'Làm lại' : 'Làm bài') + '</button>') + '</div></div>';
          }).join('') : '<p class="ap-note">Thầy/cô chưa giao đề nào.</p>') + '</article>';
      }).join('');
      $$('#lc-n [data-de]').forEach(function (b) { b.onclick = function () { A.moDeGV(b.dataset.de); }; });
    });
  }
  // thông báo đề mới (dùng chung với website: sessionStorage 'tb_lop')
  function ghiThongBao(n) { try { sessionStorage.setItem('tb_lop', JSON.stringify({ n: n, t: Date.now() })); } catch (e) { } try { if (window.parent && window.parent.WEB && window.parent.WEB.datThongBao) window.parent.WEB.datThongBao(n); } catch (e) { } }
  function demThongBao() {   // -> Promise<number>
    var t = tk(); if (!t) return Promise.resolve(0);
    try { var c = JSON.parse(sessionStorage.getItem('tb_lop') || 'null'); if (c && Date.now() - c.t < 5 * 60e3) return Promise.resolve(c.n); } catch (e) { }
    return goi('hsLopCuaToi').then(function (r) { var n = r && r.ok ? r.soMoi : 0; ghiThongBao(n); return n; }, function () { return 0; });
  }
  // học sinh mở link đề giao theo lớp (?de=…&lop=…): chưa vào lớp thì vào lớp trước
  function moDeTheoLop(deId, maLop) {
    goi('hsLopCuaToi', { moi: 1 }).then(function (r) {
      if (hetPhien(r)) return;
      var trong = r && r.ok && r.lop.some(function (l) { return l.ma === maLop; });
      if (trong) return A.moDeGV(deId);
      vaoLop(maLop, function () { A.moDeGV(deId); });
    }, function () { A.moDeGV(deId); });
  }

  G.LOP_HOC = { lopGV: lopGV, giaoDe: giaoDe, vaoLop: vaoLop, lopCuaEm: lopCuaEm, demThongBao: demThongBao, moDeTheoLop: moDeTheoLop };
})(window);
