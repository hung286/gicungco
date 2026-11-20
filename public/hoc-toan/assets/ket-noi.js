/* Kết nối website ↔ Google Sheet (Apps Script). Dùng chung cho trang chính, trò chơi, mô phỏng.
 * Chưa có API_URL -> chế độ thử: đếm và lưu điểm ngay trên trình duyệt này. */
(function () {
  var C = window.WEB_CAU_HINH || {};
  var API = String(C.API_URL || '').trim();

  function doc(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ghi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function phienDoc(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function phienGhi(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  function homNay() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function thietBi() { return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Điện thoại' : /iPad|Tablet/i.test(navigator.userAgent) ? 'Máy tính bảng' : 'Máy tính'; }

  // Mã khách ngẫu nhiên, lưu trên trình duyệt (không chứa thông tin cá nhân)
  var khachMoi = false;
  var maKhach = doc('web_khach', null);
  if (!maKhach) { maKhach = 'K' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 6).toUpperCase(); ghi('web_khach', maKhach); khachMoi = true; }

  // Thông tin ghi danh — dùng chung khoá 'hs' với app Luyện đề để học sinh không phải nhập lại
  function nguoi() {
    var hs = doc('hs', null) || {};
    return { khach: maKhach, hoTen: hs.name || '', lop: hs.lop || '', truong: hs.truong || '', vaiTro: doc('web_vai', hs.name ? 'Học sinh' : '') };
  }

  function goi(payload) {
    if (!API) return Promise.resolve(null);
    return fetch(API, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  // Bộ đếm chế độ thử (trên máy này)
  function demThu(phien, muc) {
    var t = doc('web_thu', { tong: 0, xem: 0, khach: 0, ngay: {}, muc: {} });
    t.xem++;
    if (phien) { t.tong++; t.ngay[homNay()] = (t.ngay[homNay()] || 0) + 1; }
    if (khachMoi) t.khach++;
    if (muc) t.muc[muc] = (t.muc[muc] || 0) + 1;
    ghi('web_thu', t);
    return t;
  }

  // Ghi danh lúc website còn ở chế độ thử -> khi đã nối Sheet thì gửi bù một lần
  setTimeout(function () {
    var n = nguoi();
    if (API && n.hoTen && !doc('web_dk_gui', false)) {
      ghi('web_dk_gui', true);
      goi({ action: 'dangKy', data: { khach: maKhach, vaiTro: n.vaiTro, hoTen: n.hoTen, lop: n.lop, truong: n.truong, thietBi: thietBi() } });
    }
  }, 1500);

  var WEB = window.WEB = {
    API: API,
    goi: goi,
    cheDoThu: !API,
    maKhach: maKhach,
    nguoi: nguoi,
    daGhiDanh: function () { return !!doc('hs_tk', null) || !!nguoi().hoTen || !!doc('web_vai', ''); },

    /* ---- TÀI KHOẢN (dùng chung toàn website: luyện đề, đề VIP, tải Word, phiếu tô màu). Lưu 'hs_tk' trên máy. */
    taiKhoan: function () { return doc('hs_tk', null); },
    // r: kết quả hsTao/hsVao {token, hs:{user,hoTen,lop,truong,vaiTro}}
    luuDangNhap: function (r) {
      var h = r.hs || {};
      ghi('hs_tk', { token: r.token, user: h.user, hoTen: h.hoTen, lop: h.lop, truong: h.truong, vaiTro: h.vaiTro || 'Học sinh', luc: Date.now() });
      ghi('hs', { name: h.hoTen, lop: h.lop, truong: h.truong }); ghi('web_vai', h.vaiTro || 'Học sinh');
      goi({ action: 'dangKy', data: { khach: maKhach, vaiTro: h.vaiTro || 'Học sinh', hoTen: h.hoTen, lop: h.lop, truong: h.truong, thietBi: thietBi() } });
    },
    // Đăng xuất: xoá thông tin cá nhân, lịch sử, chìa khoá trên máy này (lịch sử vẫn còn trên máy chủ theo tài khoản)
    dangXuat: function () {
      try {
        Object.keys(localStorage).forEach(function (k) {
          if (/^(hs|hs_tk|web_vai|lichsu|cho_gui_x|tab)$/.test(k) || /^(dk_|vip_k_|er_bai_)/.test(k)) localStorage.removeItem(k);
        });
      } catch (e) { }
    },

    /* Ghi một lượt xem trang. Trả về {tong, homNay, khach, xem}. */
    ghiLuot: function (trang, tieuDe, muc) {
      var phien = !phienDoc('web_phien');
      phienGhi('web_phien', '1');
      var t = demThu(phien, muc);
      var thu = { tong: t.tong, homNay: t.ngay[homNay()] || 0, khach: t.khach, xem: t.xem, thu: true };
      if (!API) return Promise.resolve(thu);
      var n = nguoi();
      var moi = !doc('web_khach_gui', false); ghi('web_khach_gui', true);   // lần đầu máy này gửi lên Sheet = 1 người mới
      return goi({ action: 'visit', khach: maKhach, moi: moi, phien: phien, trang: trang, tieuDe: tieuDe, muc: muc || '',
        thietBi: thietBi(), hoTen: n.hoTen, lop: n.lop, vaiTro: n.vaiTro })
        .then(function (r) { if (r && r.ok) { ghi('web_so_cuoi', r); return r; } return doc('web_so_cuoi', null) || thu; });
    },

    thongKe: function () {
      if (!API) {
        var t = doc('web_thu', { tong: 0, xem: 0, khach: 0, ngay: {}, muc: {} }), ngay = [], d = new Date();
        for (var i = 29; i >= 0; i--) {
          var x = new Date(d.getTime() - i * 864e5), k = x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2);
          ngay.push({ d: k, n: t.ngay[k] || 0 });
        }
        var diem = doc('web_diem', []);
        return Promise.resolve({ ok: true, thu: true, tong: t.tong, homNay: t.ngay[homNay()] || 0, khach: t.khach, xem: t.xem, ngay: ngay, muc: t.muc,
          baiLam: (doc('lt_ketqua', []) || []).length, luotChoi: diem.length, ghiDanh: nguoi().hoTen ? 1 : 0 });
      }
      return goi({ action: 'stats' });
    },

    ghiDanh: function (v) {
      // v: {vaiTro, hoTen, lop, truong}
      var hs = doc('hs', null) || {};
      hs.name = v.hoTen; hs.lop = v.lop; hs.truong = v.truong;
      ghi('hs', hs); ghi('web_vai', v.vaiTro);
      ghi('web_dk_gui', !!API);
      return goi({ action: 'dangKy', data: { khach: maKhach, vaiTro: v.vaiTro, hoTen: v.hoTen, lop: v.lop, truong: v.truong, thietBi: thietBi() } });
    },

    /* Điểm trò chơi: {troChoi, tram, dung, tong, diem, sao, kc, het} */
    guiDiem: function (d) {
      var n = nguoi();
      var ban = { luc: new Date().toISOString(), troChoi: d.troChoi, tram: d.tram, diem: d.diem, dung: d.dung, tong: d.tong, sao: d.sao };
      var ds = doc('web_diem', []); ds.unshift(ban); ghi('web_diem', ds.slice(0, 200));
      return goi({ action: 'diem', data: Object.assign({}, d, n) });
    }
  };
})();
