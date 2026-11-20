/* ===== LƯU BÀI VẼ VÀO TÀI KHOẢN (Học Toán Thông Minh) =====
 * Dùng chung tài khoản của website (khoá 'hs_tk' trên máy). Mỗi tài khoản lưu miễn phí 1 bài;
 * muốn lưu thêm: đăng ký gói -> nhắn Ban quản trị nhận mã -> nhập mã (mã loại VEHINH ở máy chủ).
 */
(function () {
  'use strict';
  var C = window.WEB_CAU_HINH || {};
  var API = String(C.API_URL || '').trim(), ZALO = String(C.ZALO || '').replace(/\D/g, '');
  var e_ = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var el = function (id) { return document.getElementById(id); };
  function goi(o) { return fetch(API, { method: 'POST', body: JSON.stringify(o) }).then(function (r) { return r.json(); }); }
  function doc(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }
  function ghi(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (x) { } }
  function tk() { return doc('hs_tk'); }
  function datTK(r) { ghi('hs_tk', { token: r.token, user: r.hs.user, hoTen: r.hs.hoTen, lop: r.hs.lop, truong: r.hs.truong, vaiTro: r.hs.vaiTro || 'Học sinh', luc: Date.now() }); }
  function dangMo() { return doc('ve_dang_mo'); }          // bài trên tài khoản đang mở ở máy này: { id, ten, user }
  function bao(t, tin) { if (window.VE_HINH && VE_HINH.bao) VE_HINH.bao(t, tin); }
  function ngay(s) { try { return new Date(s).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (x) { return ''; } }
  function tenMacDinh() { var d = new Date(); return 'Bài vẽ ' + d.getDate() + '/' + (d.getMonth() + 1) + ' ' + (VE_HINH.xuat().mode === '3d' ? '(không gian)' : '(phẳng)'); }

  // ---- hộp
  function hop(html) {
    var h = el('hop-may');
    if (!h) {
      h = document.createElement('div'); h.id = 'hop-may'; h.className = 'an';
      h.innerHTML = '<div class="hop-trong rong" role="dialog" aria-modal="true" aria-labelledby="may-t"><button type="button" class="may-x" aria-label="Đóng">✕</button><h3 id="may-t">☁ Bài vẽ của tôi</h3><div id="may-n"></div></div>';
      document.body.appendChild(h);
      h.querySelector('.may-x').onclick = dong;
      h.addEventListener('click', function (ev) { if (ev.target === h) dong(); });
    }
    el('may-n').innerHTML = html; h.classList.remove('an');
  }
  function dong() { var h = el('hop-may'); if (h) h.classList.add('an'); }
  function loiMang() { hop('<p>⚠ Không kết nối được máy chủ — kiểm tra mạng rồi thử lại.</p>'); }
  function hetPhien(r) { if (r && r.hsAuth === false) { ghi('hs_tk', null); dangNhap(false, 'Phiên đăng nhập đã hết hạn, đăng nhập lại nhé.'); return true; } return false; }

  // ---- mở hộp: danh sách bài + lưu
  function mo(thongDiep) {
    if (!API) return hop('<p>Trang này chưa kết nối máy chủ. Hãy mở <b>Phòng vẽ hình</b> từ website Học Toán Thông Minh để lưu bài vào tài khoản.</p><p>Trong lúc chờ, dùng nút <b>💾 Tệp</b> để tải tệp hình về máy (mở lại bằng nút 📂 Mở).</p>');
    var t = tk(); if (!t) return dangNhap(false);
    hop('<p>⏳ Đang tải các bài đã lưu của <b>' + e_(t.user) + '</b>…</p>');
    goi({ action: 'veDanhSach', token: t.token }).then(function (r) {
      if (r && r.auth === false && r.hsAuth === undefined) return hop('<p>⚠ Máy chủ chưa có chức năng lưu bài vẽ — Ban quản trị cần cập nhật máy chủ (Apps Script). Trong lúc chờ, dùng nút <b>💾 Tệp</b> để tải hình về máy.</p>');
      if (hetPhien(r)) return;
      if (!r || !r.ok) return hop('<p>⚠ ' + e_((r && r.error) || 'Máy chủ chưa hỗ trợ lưu bài vẽ — Ban quản trị cần cập nhật máy chủ.') + '</p>');
      danhSach(t, r, thongDiep);
    }).catch(loiMang);
  }
  function danhSach(t, r, thongDiep) {
    var dm = dangMo(), cua = dm && dm.user === t.user && r.ds.some(function (x) { return x.id === dm.id; }) ? dm : null;
    var day = r.ds.length >= r.hanMuc, hien = cua ? cua.ten : tenMacDinh();
    var h = (thongDiep ? '<p class="may-bao">' + thongDiep + '</p>' : '') +
      '<p class="may-tk">👤 <b>' + e_(t.user) + '</b> · Đã lưu <b>' + r.ds.length + (r.hanMuc >= 9999 ? '</b> bài (👑 không giới hạn)' : '/' + r.hanMuc + '</b> bài') + ' · <a href="#" id="may-out">Đăng xuất</a></p>' +
      '<div class="may-luu"><label for="may-ten">Tên bài</label><input id="may-ten" maxlength="120" value="' + e_(hien) + '">' +
      '<div class="may-nut">' + (cua ? '<button type="button" class="chinh" id="may-de">💾 Lưu đè bài đang mở</button>' : '') +
      '<button type="button" class="' + (cua ? '' : 'chinh') + '" id="may-moi"' + (day ? ' disabled title="Đã lưu đủ số bài"' : '') + '>➕ Lưu thành bài mới</button></div>' +
      (day && !cua ? '<p class="may-chu">Tài khoản đã lưu đủ <b>' + r.hanMuc + '</b> bài. Bấm <b>Lưu đè</b> ở một bài bên dưới, xoá bớt bài, hoặc <b>nâng cấp</b> để lưu thêm.</p>' : '') + '</div>' +
      (r.ds.length ? '<div class="may-ds">' + r.ds.map(function (x) {
        return '<div class="may-bai' + (cua && cua.id === x.id ? ' dang' : '') + '"><div><b>' + e_(x.ten) + '</b><small>' + e_(x.loai) + ' · lưu lúc ' + ngay(x.capNhat) + (cua && cua.id === x.id ? ' · <i>đang mở</i>' : '') + '</small></div>' +
          '<span><button type="button" data-mo="' + e_(x.id) + '" title="Mở bài này">📂 Mở</button><button type="button" data-de="' + e_(x.id) + '" data-ten="' + e_(x.ten) + '" title="Lưu hình đang vẽ đè lên bài này">💾 Lưu đè</button><button type="button" data-xoa="' + e_(x.id) + '" data-ten="' + e_(x.ten) + '" title="Xoá bài">🗑</button></span></div>';
      }).join('') + '</div>' : '<p class="may-chu">Chưa có bài nào được lưu.</p>') +
      nangCap(r, day);
    hop(h);
    el('may-out').onclick = function (ev) { ev.preventDefault(); ghi('hs_tk', null); ghi('ve_dang_mo', null); dangNhap(false); };
    var ten = function () { return (el('may-ten').value || '').trim() || tenMacDinh(); };
    if (el('may-de')) el('may-de').onclick = function () { luu(t, cua.id, ten()); };
    el('may-moi').onclick = function () { luu(t, '', ten()); };
    document.querySelectorAll('#may-n [data-mo]').forEach(function (b) { b.onclick = function () { moBai(t, b.dataset.mo); }; });
    document.querySelectorAll('#may-n [data-de]').forEach(function (b) {
      b.onclick = function () { if (confirm('Lưu hình đang vẽ ĐÈ lên bài “' + b.dataset.ten + '”? Nội dung cũ của bài đó sẽ mất.')) luu(t, b.dataset.de, (el('may-ten').value || '').trim() || b.dataset.ten); };
    });
    document.querySelectorAll('#may-n [data-xoa]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm('Xoá bài “' + b.dataset.ten + '” khỏi tài khoản? Không lấy lại được.')) return;
        b.disabled = true;
        goi({ action: 'veXoa', token: t.token, id: b.dataset.xoa }).then(function (x) {
          if (hetPhien(x)) return;
          if (dangMo() && dangMo().id === b.dataset.xoa) ghi('ve_dang_mo', null);
          mo(x && x.ok ? '🗑 Đã xoá bài.' : '⚠ ' + e_((x && x.error) || 'Chưa xoá được.'));
        }).catch(loiMang);
      };
    });
    ganNangCap(t, r);
  }
  function nangCap(r, day) {
    var zalo = ZALO ? ' qua <a href="https://zalo.me/' + ZALO + '" target="_blank" rel="noopener"><b>Zalo ' + ZALO + '</b></a>' : '';
    var h = '<details class="may-nc"' + (day || r.choMa ? ' open' : '') + '><summary>⭐ Nâng cấp: lưu được nhiều bài hơn</summary>';
    if (r.choMa) h += '<p>✅ Đã đăng ký gói <b>thêm ' + e_(r.choMa) + ' bài</b>. Nhắn Ban quản trị' + zalo + ' kèm <b>tên đăng nhập</b> để nhận mã, rồi nhập mã vào đây.</p>' +
      '<label for="may-ma">Mã nâng cấp</label><input id="may-ma" maxlength="14" placeholder="VD: ABCD-1234" autocomplete="off"><div class="may-nut"><button type="button" class="chinh" id="may-kh">🔓 Kích hoạt</button></div>';
    else h += '<p>Mỗi tài khoản lưu miễn phí <b>1 bài</b>. Muốn lưu thêm, chọn gói rồi bấm đăng ký — sau đó liên hệ Ban quản trị' + zalo + ' để được cấp mã.</p>' +
      '<label for="may-goi">Chọn gói</label><select id="may-goi">' + (r.goi || []).map(function (g) { return '<option value="' + e_(g.ma) + '">' + e_(g.ten) + '</option>'; }).join('') + '</select>' +
      '<div class="may-nut"><button type="button" id="may-dk">📝 Đăng ký nâng cấp</button></div>';
    return h + '<p class="may-chu" id="may-nc-bao"></p></details>';
  }
  function ganNangCap(t, r) {
    var b = el('may-nc-bao');
    if (el('may-dk')) el('may-dk').onclick = function () {
      var g = el('may-goi').value; this.disabled = true; b.textContent = 'Đang đăng ký…';
      goi({ action: 'maDangKy', token: t.token, loai: 'VEHINH', doiTuong: g, moTa: 'Lưu thêm ' + g + ' bài vẽ hình' }).then(function (x) {
        if (hetPhien(x)) return;
        if (x && x.ok) mo('📝 Đã đăng ký nâng cấp. Liên hệ Ban quản trị để nhận mã.'); else b.textContent = '⚠ ' + ((x && x.error) || 'Chưa đăng ký được.');
      }).catch(loiMang);
    };
    if (el('may-kh')) el('may-kh').onclick = function () {
      var ma = el('may-ma').value.trim(); if (!ma) { b.textContent = 'Nhập mã Ban quản trị gửi cho bạn.'; return; }
      b.textContent = 'Đang kiểm tra mã…';
      goi({ action: 'maKichHoat', token: t.token, loai: 'VEHINH', ma: ma }).then(function (x) {
        if (hetPhien(x)) return;
        if (x && x.ok) mo('🎉 Đã nâng cấp! Tài khoản lưu được tối đa <b>' + x.hanMuc + '</b> bài.'); else b.textContent = '⚠ ' + ((x && x.error) || 'Mã chưa đúng.');
      }).catch(loiMang);
    };
  }

  // ---- lưu / mở
  function luu(t, id, ten) {
    var data = VE_HINH.xuat();
    if (!data.sc || !data.sc.objs || !data.sc.objs.length) { mo('⚠ Trang vẽ đang trống — vẽ hình trước rồi lưu nhé.'); return; }
    hop('<p>⏳ Đang lưu bài “' + e_(ten) + '”…</p>');
    goi({ action: 'veLuu', token: t.token, id: id, ten: ten, loai: data.mode, data: data }).then(function (r) {
      if (hetPhien(r)) return;
      if (r && r.ok) { ghi('ve_dang_mo', { id: r.id, ten: ten, user: t.user }); dong(); bao('Đã lưu “' + ten + '” vào tài khoản ' + t.user + ' — buổi sau bấm ☁ Lưu bài → 📂 Mở để vẽ tiếp.', 1); return; }
      mo('⚠ ' + e_((r && r.error) || 'Chưa lưu được.'));
    }).catch(loiMang);
  }
  function moBai(t, id) {
    if (VE_HINH.xuat().sc.objs.length && !confirm('Mở bài đã lưu? Hình đang vẽ trên màn hình sẽ được thay (bấm Hoàn tác để lấy lại).')) return;
    hop('<p>⏳ Đang mở bài…</p>');
    goi({ action: 'veMo', token: t.token, id: id }).then(function (r) {
      if (hetPhien(r)) return;
      if (!r || !r.ok) return mo('⚠ ' + e_((r && r.error) || 'Chưa mở được bài.'));
      try { VE_HINH.nap(r.data); } catch (x) { return mo('⚠ Dữ liệu bài vẽ không đúng định dạng.'); }
      ghi('ve_dang_mo', { id: r.id, ten: r.ten, user: t.user }); dong(); bao('Đã mở bài “' + r.ten + '”.', 1);
    }).catch(loiMang);
  }

  // ---- đăng nhập / tạo tài khoản (dùng chung toàn website)
  function dangNhap(tao, loi) {
    if (window.TAI_KHOAN) {   // hộp tài khoản dùng chung của website
      dong();
      TAI_KHOAN.mo({ cheDo: tao ? 'tao' : 'vao', loiNhac: loi || 'Đăng nhập để lưu bài vẽ và mở lại vào buổi sau.', xong: function () { mo('✅ Đã đăng nhập.'); } });
      return;
    }
    hop((loi ? '<p class="may-bao">⚠ ' + e_(loi) + '</p>' : '') +
      '<p>Đăng nhập tài khoản website (dùng chung với phòng luyện đề, đề VIP) để lưu bài vẽ và mở lại vào buổi sau.</p>' +
      '<div class="may-nut trai"><button type="button" class="' + (tao ? '' : 'chinh') + '" id="may-t1">Đăng nhập</button><button type="button" class="' + (tao ? 'chinh' : '') + '" id="may-t2">Tạo tài khoản mới</button></div>' +
      (tao ? '<label>Họ và tên</label><input id="may-hoten" maxlength="80"><label>Lớp (hoặc Tổ chuyên môn)</label><input id="may-lop" maxlength="20" placeholder="VD: 10A1, Tổ Toán"><label>Trường</label><input id="may-truong" maxlength="120">' : '') +
      '<label>Tên đăng nhập</label><input id="may-u" autocomplete="username" placeholder="chữ thường không dấu, VD: lan.toan"><label>Mật khẩu</label><input id="may-p" type="password" autocomplete="' + (tao ? 'new-password' : 'current-password') + '">' +
      '<div class="may-nut"><button type="button" class="chinh" id="may-go">' + (tao ? 'Tạo tài khoản' : 'Đăng nhập') + '</button></div><p class="may-chu" id="may-bao"></p>');
    el('may-t1').onclick = function () { dangNhap(false); };
    el('may-t2').onclick = function () { dangNhap(true); };
    var go = function () {
      var d = { action: tao ? 'hsTao' : 'hsVao', user: el('may-u').value.trim().toLowerCase(), pass: el('may-p').value };
      if (tao) { d.hoTen = el('may-hoten').value.trim().replace(/\s+/g, ' '); d.lop = el('may-lop').value.trim(); d.truong = el('may-truong').value.trim(); }
      if (!d.user || !d.pass) { el('may-bao').textContent = 'Nhập đủ tên đăng nhập và mật khẩu nhé.'; return; }
      el('may-bao').textContent = 'Đang xử lí…';
      goi(d).then(function (r) {
        if (r && r.ok && r.token) { datTK(r); mo('✅ Đã đăng nhập.'); }
        else el('may-bao').textContent = '⚠ ' + ((r && r.error) || 'Chưa đăng nhập được.');
      }).catch(function () { el('may-bao').textContent = '⚠ Không kết nối được máy chủ.'; });
    };
    el('may-go').onclick = go;
    el('may-p').onkeydown = function (ev) { if (ev.key === 'Enter') go(); };
  }

  // Ctrl+S: lưu nhanh vào bài đang mở (nếu có), không thì mở hộp lưu
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      var t = tk(), dm = dangMo();
      if (API && t && dm && dm.user === t.user) luu(t, dm.id, dm.ten); else mo();
    }
  });
  window.VE_LUU = { mo: mo };
})();
