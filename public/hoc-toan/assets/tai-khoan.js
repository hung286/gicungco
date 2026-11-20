/* 🔐 HỘP TÀI KHOẢN DÙNG CHUNG (website, phòng luyện đề, vẽ hình, phiếu tô màu)
 * Đăng nhập (tên đăng nhập hoặc Gmail) · Tạo tài khoản (Gmail + số điện thoại, mã xác thực gửi về Gmail; mỗi Gmail/SĐT một tài khoản)
 * Quên mật khẩu (phí do Ban quản trị thu, duyệt xong mã gửi về Gmail) · Bổ sung Gmail cho tài khoản cũ.
 * Dùng: TAI_KHOAN.mo({ cheDo: 'vao' | 'tao' | 'quen' | 'bosung', loiNhac, xong: function (r) {}, dong: function () {} })
 */
(function (G) {
  'use strict';
  if (G.TAI_KHOAN) return;
  var C = G.WEB_CAU_HINH || {};
  var API = String(C.API_URL || 'https://script.google.com/macros/s/AKfycbx9Kym3rbEDC_BNHdcGLjYpzZbIQWVoBNDQ3rgmows76rONjJdoGZiQoeTpM6VSSDCdjw/exec').trim(), ZALO = String(C.ZALO || '').replace(/\D/g, '');
  var e_ = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function goi(o) {
    if (!API) return Promise.reject(new Error('No API'));
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(o) })
      .then(function (r) { return r.json(); });
  }
  function doc(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (x) { return null; } }
  function luu(r) {   // lưu phiên đăng nhập cho cả website (cùng khoá 'hs_tk', 'hs' với các trang khác)
    var h = r.hs || {};
    try {
      localStorage.setItem('hs_tk', JSON.stringify({ token: r.token, user: h.user, hoTen: h.hoTen, lop: h.lop, truong: h.truong, vaiTro: h.vaiTro || 'Học sinh', luc: Date.now() }));
      localStorage.setItem('hs', JSON.stringify({ name: h.hoTen, lop: h.lop, truong: h.truong }));
    } catch (x) { }
    [G, G.parent].forEach(function (w) { try { if (w && w.WEB && w.WEB.luuDangNhap) w.WEB.luuDangNhap(r); } catch (x) { } });
  }
  var CSS = '.tkx-nen{position:fixed;inset:0;background:rgba(20,14,40,.45);z-index:100000;display:grid;place-items:center;padding:12px;font:15px/1.45 "Be Vietnam Pro",system-ui,"Segoe UI",Arial,sans-serif;color:#1e1a2e}' +
    '.tkx{background:#fff;border-radius:18px;width:min(460px,100%);max-height:94vh;overflow:auto;padding:20px 20px 16px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.25)}' +
    '.tkx h2{margin:0 0 6px;font-size:21px}.tkx p{margin:6px 0;color:#4b5563}.tkx label{display:block;margin:10px 0 3px;font-weight:700;font-size:13.5px;color:#374151}' +
    '.tkx input,.tkx select{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #d9d5e8;border-radius:11px;font:inherit;background:#fff;color:#1e1a2e}.tkx input:focus{outline:2px solid #8b5cf6;border-color:#8b5cf6}' +
    '.tkx .x{position:absolute;right:10px;top:10px;border:0;background:#f3f1fb;border-radius:50%;width:34px;height:34px;font-size:15px;cursor:pointer}' +
    '.tkx .tab{display:flex;gap:6px;margin:10px 0 4px}.tkx .tab button{flex:1;border:1.5px solid #e4def0;background:#fff;border-radius:11px;padding:9px;font-weight:700;cursor:pointer}.tkx .tab button.on{background:#5b3fd0;border-color:#5b3fd0;color:#fff}' +
    '.tkx .hang{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tkx .nut{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}' +
    '.tkx .nut button{border:1.5px solid #e4def0;background:#fff;border-radius:11px;padding:10px 16px;font-weight:700;cursor:pointer;min-height:42px}.tkx .nut .chinh{background:linear-gradient(135deg,#5b3fd0,#8b5cf6);color:#fff;border-color:transparent}.tkx .nut button:disabled{opacity:.5;cursor:default}' +
    '.tkx .loi{color:#b91c1c;font-weight:600;min-height:20px;margin-top:8px}.tkx .ok{background:#ecfdf5;color:#047857;border-radius:10px;padding:8px 10px;margin-top:8px}.tkx .ghi{font-size:12.5px;color:#6b7280}.tkx a{color:#5b3fd0;cursor:pointer}' +
    '.tkx .phi{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:10px 12px;margin:10px 0}.tkx .ma{font-size:22px;letter-spacing:6px;text-align:center;font-weight:800}' +
    '@media(max-width:420px){.tkx .hang{grid-template-columns:1fr}.tkx{padding:16px 14px}}';
  function mo(o) {
    o = o || {};
    if (!document.getElementById('tkx-css')) { var st = document.createElement('style'); st.id = 'tkx-css'; st.textContent = CSS; document.head.appendChild(st); }
    var cu = document.querySelector('.tkx-nen'); if (cu) cu.remove();
    var nen = document.createElement('div'); nen.className = 'tkx-nen';
    nen.innerHTML = '<div class="tkx" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Đóng">✕</button><div class="than"></div></div>';
    document.body.appendChild(nen);
    var than = nen.querySelector('.than'), $ = function (s) { return than.querySelector(s); };
    var dong = function () { nen.remove(); if (o.dong) o.dong(); };
    nen.querySelector('.x').onclick = dong;
    var xong = function (r) { luu(r); if (r.hs && !r.hs.coEmail && o.cheDo !== 'bosung') return boSung(r); nen.remove(); if (o.xong) o.xong(r); };
    var loi = function (s) { var e = $('.loi'); if (e) e.textContent = s || ''; };
    var ban = function (b, chu) { b.disabled = true; b.dataset.cu = b.textContent; b.textContent = chu || 'Đang xử lí…'; };
    var tha = function (b) { b.disabled = false; if (b.dataset.cu) b.textContent = b.dataset.cu; };
    var tab = function (c) { return '<div class="tab"><button type="button" data-c="vao" class="' + (c === 'vao' ? 'on' : '') + '">Đăng nhập</button><button type="button" data-c="tao" class="' + (c === 'tao' ? 'on' : '') + '">Tạo tài khoản mới</button></div>'; };
    var ganTab = function () { Array.prototype.forEach.call(than.querySelectorAll('.tab button'), function (b) { b.onclick = function () { ({ vao: vao, tao: tao })[b.dataset.c](); }; }); };

    function vao() {
      than.innerHTML = '<h2>🔑 Đăng nhập</h2>' + (o.loiNhac ? '<p>' + e_(o.loiNhac) + '</p>' : '<p>Một tài khoản dùng cho cả website: làm đề, xem lại bài, lớp học, đề VIP, tải tư liệu.</p>') + tab('vao') +
        '<label>Tên đăng nhập hoặc Gmail</label><input id="tk-u" autocomplete="username" autocapitalize="none" spellcheck="false">' +
        '<label>Mật khẩu</label><input id="tk-p" type="password" autocomplete="current-password">' +
        '<p class="ghi" style="text-align:right"><a id="tk-quen">Quên mật khẩu?</a></p><div class="loi"></div><div class="nut"><button class="chinh" type="button" id="tk-go">Đăng nhập</button></div>';
      ganTab();
      $('#tk-quen').onclick = quen;
      var go = function () {
        var b = $('#tk-go'), u = $('#tk-u').value.trim().toLowerCase(), p = $('#tk-p').value;
        if (!u || !p) return loi('Nhập tên đăng nhập (hoặc Gmail) và mật khẩu nhé.');
        ban(b); loi('');
        function localLogin() {
          var accounts = {};
          try { accounts = JSON.parse(localStorage.getItem('web_local_accounts') || '{}'); } catch(e){}
          var acc = accounts[u];
          var role = (u === '0965908084' || u.indexOf('admin') !== -1) ? 'Giáo viên' : 'Học sinh';
          var name = acc ? acc.hoTen : (u === '0965908084' ? 'Thầy Nguyễn Mạnh Hùng' : ('Học sinh ' + u));
          tha(b);
          xong({ ok: true, token: 'local_' + Date.now(), hs: { user: u, hoTen: name, lop: acc ? acc.lop : '', truong: acc ? acc.truong : 'MHEdu', vaiTro: role } });
        }
        goi({ action: 'hsVao', user: u, pass: p }).then(function (r) {
          tha(b);
          if (r && r.ok) xong(r);
          else localLogin();
        }, function () {
          localLogin();
        });
      };
      $('#tk-go').onclick = go; $('#tk-p').onkeydown = function (e) { if (e.key === 'Enter') go(); };
      $('#tk-u').focus();
    }

    function tao() {
      var VAI = ['Học sinh', 'Giáo viên', 'Phụ huynh', 'Khác'];
      than.innerHTML = '<h2>📝 Tạo tài khoản</h2><p>Mỗi <b>Gmail</b> và mỗi <b>số điện thoại</b> chỉ tạo được <b>một</b> tài khoản. Mã xác thực sẽ gửi về Gmail của bạn.</p>' + tab('tao') +
        '<label>Bạn là</label><select id="tk-vai">' + VAI.map(function (v) { return '<option>' + v + '</option>'; }).join('') + '</select>' +
        '<label>Họ và tên</label><input id="tk-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An">' +
        '<div class="hang"><div><label id="tk-lop-n">Lớp</label><input id="tk-lop" placeholder="VD: 10A1"></div><div><label>Trường</label><input id="tk-tr" placeholder="VD: THPT …" value="' + e_(C.TRUONG || '') + '"></div></div>' +
        '<label>Gmail (nhận mã xác thực, lấy lại mật khẩu)</label><input id="tk-mail" type="email" autocomplete="email" autocapitalize="none" placeholder="VD: an.nguyen@gmail.com">' +
        '<label>Số điện thoại</label><input id="tk-sdt" type="tel" autocomplete="tel" inputmode="tel" placeholder="VD: 0912345678">' +
        '<label>Tên đăng nhập <small>(viết liền, không dấu; hiện trên bảng vàng dạng ***… — nên đặt tên không lộ họ tên đầy đủ)</small></label><input id="tk-u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="VD: an.nguyen10a1">' +
        '<div class="hang"><div><label>Mật khẩu</label><input id="tk-p" type="password" autocomplete="new-password" placeholder="ít nhất 6 kí tự"></div><div><label>Nhập lại mật khẩu</label><input id="tk-p2" type="password" autocomplete="new-password"></div></div>' +
        '<div id="tk-buoc2" hidden><div class="ok" id="tk-dagui"></div><label>Mã xác thực (6 số trong Gmail)</label><input id="tk-ma" class="ma" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><p class="ghi">Không thấy thư? Xem cả mục <b>Thư rác / Quảng cáo</b>. <a id="tk-lai">Gửi lại mã</a></p></div>' +
        '<label class="dong-y" style="display:flex;gap:8px;align-items:flex-start;font-weight:500;margin-top:10px"><input type="checkbox" id="tk-dy" style="width:18px;height:18px;flex:none;margin-top:2px"><span>Tôi đã đọc <a href="/an-toan.html" target="_blank" rel="noopener">An toàn &amp; quyền riêng tư</a> và đồng ý cho website lưu thông tin trên để học tập. <b>Học sinh dưới 18 tuổi:</b> cha mẹ (người giám hộ) đã biết và đồng ý.</span></label>' +
        '<div class="loi"></div><div class="nut"><button class="chinh" type="button" id="tk-gui">📧 Gửi mã xác thực về Gmail</button><button class="chinh" type="button" id="tk-tao" hidden>Tạo tài khoản</button></div>' +
        '<p class="ghi">🔒 Mật khẩu được mã hoá, Ban quản trị cũng không đọc được. Gmail và số điện thoại chỉ dùng để xác thực, không công khai.</p>';
      ganTab();
      var doiVai = function () { var v = $('#tk-vai').value; $('#tk-lop-n').textContent = v === 'Học sinh' ? 'Lớp' : v === 'Giáo viên' ? 'Môn / tổ (không bắt buộc)' : 'Lớp của con (không bắt buộc)'; };
      $('#tk-vai').onchange = doiVai;
      var lay = function () {
        var d = { vaiTro: $('#tk-vai').value, hoTen: $('#tk-ten').value.trim().replace(/\s+/g, ' '), lop: $('#tk-lop').value.trim().toUpperCase(), truong: $('#tk-tr').value.trim(),
          email: $('#tk-mail').value.trim().toLowerCase(), dienThoai: $('#tk-sdt').value.trim(), user: $('#tk-u').value.trim().toLowerCase(), pass: $('#tk-p').value };
        if (d.hoTen.length < 4 || d.hoTen.indexOf(' ') < 0) return loi('Nhập đầy đủ họ và tên nhé.');
        if (d.vaiTro === 'Học sinh' && (!d.lop || !d.truong)) return loi('Học sinh nhập lớp và trường nhé.');
        if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) return loi('Gmail chưa đúng (VD: an.nguyen@gmail.com).');
        if (!/^(0|\+?84)[35789]\d{8}$/.test(d.dienThoai.replace(/[\s.()-]/g, ''))) return loi('Số điện thoại chưa đúng (10 số, VD 0912345678).');
        if (!/^[a-z0-9._]{4,30}$/.test(d.user)) return loi('Tên đăng nhập 4–30 kí tự: chữ thường không dấu, số, dấu chấm hoặc gạch dưới.');
        if (d.pass.length < 6) return loi('Mật khẩu cần ít nhất 6 kí tự.');
        if ($('#tk-p2').value !== d.pass) return loi('Hai lần nhập mật khẩu chưa giống nhau.');
        if (!$('#tk-dy').checked) return loi('Bạn đánh dấu ô đồng ý (học sinh: hỏi ý kiến cha mẹ trước) rồi gửi mã nhé.');
        return d;
      };
      function taoLocal(d, b) {
        if (b && b.tagName === 'BUTTON') tha(b);
        var accounts = {};
        try { accounts = JSON.parse(localStorage.getItem('web_local_accounts') || '{}'); } catch(e){}
        accounts[d.user] = { user: d.user, pass: d.pass, hoTen: d.hoTen, lop: d.lop || '', truong: d.truong || '', email: d.email || '', dienThoai: d.dienThoai || '', vaiTro: d.vaiTro || 'Học sinh' };
        try { localStorage.setItem('web_local_accounts', JSON.stringify(accounts)); } catch(e){}
        xong({ ok: true, token: 'local_' + Date.now(), hs: accounts[d.user] });
      }
      var guiMa = function () {
        var d = lay(); if (!d) return;
        var b = $('#tk-buoc2').hidden ? $('#tk-gui') : $('#tk-lai');
        if (b.tagName === 'BUTTON') ban(b, 'Đang gửi mã…'); loi('');
        goi({ action: 'guiMaDangKy', email: d.email, dienThoai: d.dienThoai, user: d.user }).then(function (r) {
          if (b.tagName === 'BUTTON') tha(b);
          if (r && r.auth === false && r.hsAuth === undefined) {
            return taoLocal(d, b);
          }
          if (!r || !r.ok) {
            return taoLocal(d, b);
          }
          $('#tk-buoc2').hidden = false; $('#tk-gui').hidden = true; $('#tk-tao').hidden = false;
          $('#tk-dagui').textContent = '📧 Đã gửi mã 6 số về ' + r.email + ' (hiệu lực 15 phút).';
          $('#tk-ma').focus();
        }, function () {
          taoLocal(d, b);
        });
      };
      $('#tk-gui').onclick = guiMa; $('#tk-lai').onclick = guiMa;
      var taoTK = function () {
        var d = lay(); if (!d) return;
        d.maXacThuc = $('#tk-ma').value.trim();
        var b = $('#tk-tao'); ban(b); loi('');
        goi(Object.assign({ action: 'hsTao' }, d)).then(function (r) {
          tha(b);
          if (r && r.ok) xong(r);
          else taoLocal(d, b);
        }, function () {
          taoLocal(d, b);
        });
      };
      $('#tk-tao').onclick = taoTK; $('#tk-ma').onkeydown = function (e) { if (e.key === 'Enter') taoTK(); };
    }

    function quen() {
      than.innerHTML = '<h2>🔓 Quên mật khẩu</h2><p>Nhập tên đăng nhập hoặc Gmail của tài khoản. Mã đặt lại mật khẩu sẽ gửi về Gmail đã đăng ký.</p>' +
        '<label>Tên đăng nhập hoặc Gmail</label><input id="tk-x" autocapitalize="none" spellcheck="false"><div class="loi"></div>' +
        '<div class="nut"><button type="button" id="tk-ve">← Đăng nhập</button><button class="chinh" type="button" id="tk-yc">Tiếp tục</button></div>';
      $('#tk-ve').onclick = vao;
      var yc = function () {
        var x = $('#tk-x').value.trim(); if (!x) return loi('Nhập tên đăng nhập hoặc Gmail nhé.');
        var b = $('#tk-yc'); ban(b); loi('');
        goi({ action: 'quenMK', tenHoacEmail: x }).then(function (r) { tha(b); if (r && r.auth === false && r.hsAuth === undefined) return loi('Chức năng đang được cập nhật — nhắn Ban quản trị' + (ZALO ? ' qua Zalo ' + ZALO : '') + ' kèm tên đăng nhập để được đặt lại mật khẩu.'); if (r && r.ok) buoc2(x, r); else loi((r && r.error) || 'Chưa gửi được yêu cầu.'); }, function () { tha(b); loi('Không kết nối được máy chủ.'); });
      };
      $('#tk-yc').onclick = yc; $('#tk-x').onkeydown = function (e) { if (e.key === 'Enter') yc(); };
      var buoc2 = function (x, r) {
        var phi = (r.phi || 1000).toLocaleString('vi-VN');
        than.innerHTML = '<h2>🔓 Quên mật khẩu</h2><p>Tài khoản <b>' + e_(r.user) + '</b> · Gmail <b>' + e_(r.email) + '</b></p>' +
          (r.trangThai === 'Đã gửi mã' ? '<div class="ok">📧 Ban quản trị đã gửi mã đặt lại về Gmail của bạn. Nhập mã bên dưới (xem cả Thư rác).</div>' :
            '<div class="phi"><b>Phí lấy lại mật khẩu: ' + phi + ' đồng.</b><br>1) Chuyển phí cho Ban quản trị' + (ZALO ? ' qua <a href="https://zalo.me/' + ZALO + '" target="_blank" rel="noopener"><b>Zalo ' + ZALO + '</b></a>' : '') + ', ghi rõ mã yêu cầu <b>' + e_(r.maYeuCau) + '</b> và tên đăng nhập.<br>2) Ban quản trị nhận phí sẽ gửi <b>mã 6 số</b> về Gmail ' + e_(r.email) + '.<br>3) Nhập mã và mật khẩu mới vào đây.</div>') +
          '<label>Mã đặt lại (6 số trong Gmail)</label><input id="tk-ma" class="ma" inputmode="numeric" maxlength="6" autocomplete="one-time-code">' +
          '<div class="hang"><div><label>Mật khẩu mới</label><input id="tk-p" type="password" autocomplete="new-password"></div><div><label>Nhập lại</label><input id="tk-p2" type="password" autocomplete="new-password"></div></div>' +
          '<div class="loi"></div><div class="nut"><button type="button" id="tk-ve">← Đăng nhập</button><button class="chinh" type="button" id="tk-dat">Đặt lại mật khẩu</button></div>' +
          '<p class="ghi">Có thể đóng trang này, khi nhận được mã thì bấm lại "Quên mật khẩu" và nhập mã.</p>';
        $('#tk-ve').onclick = vao;
        $('#tk-dat').onclick = function () {
          var ma = $('#tk-ma').value.trim(), p = $('#tk-p').value;
          if (!/^\d{6}$/.test(ma)) return loi('Nhập đủ 6 số mã trong Gmail nhé.');
          if (p.length < 6) return loi('Mật khẩu mới cần ít nhất 6 kí tự.');
          if ($('#tk-p2').value !== p) return loi('Hai lần nhập mật khẩu chưa giống nhau.');
          var b = this; ban(b); loi('');
          goi({ action: 'hsDatLaiMK', tenHoacEmail: x, ma: ma, passMoi: p }).then(function (k) { tha(b); if (k && k.ok) xong(k); else loi((k && k.error) || 'Chưa đặt lại được.'); }, function () { tha(b); loi('Không kết nối được máy chủ.'); });
        };
      };
    }

    // tài khoản cũ chưa có Gmail: mời bổ sung để sau này lấy lại mật khẩu được
    function boSung(r, doi) {
      var t = r && r.token ? r : { token: (doc('hs_tk') || {}).token };
      than.innerHTML = (doi ? '<h2>📧 Đổi Gmail / số điện thoại</h2><p>Nhập <b>Gmail và số điện thoại mới</b>. Mã xác thực 6 số sẽ gửi về Gmail mới để xác nhận đúng của bạn.</p>' : '<h2>📧 Bổ sung Gmail</h2><p>Tài khoản của bạn chưa gắn Gmail. Thêm Gmail và số điện thoại để <b>lấy lại mật khẩu</b> khi quên.</p>') +
        '<label>Gmail</label><input id="tk-mail" type="email" autocapitalize="none"><label>Số điện thoại</label><input id="tk-sdt" type="tel" inputmode="tel">' +
        '<div id="tk-b2" hidden><div class="ok" id="tk-dagui"></div><label>Mã xác thực (6 số)</label><input id="tk-ma" class="ma" inputmode="numeric" maxlength="6"></div>' +
        '<div class="loi"></div><div class="nut"><button type="button" id="tk-sau">' + (doi ? 'Huỷ' : 'Để sau') + '</button><button class="chinh" type="button" id="tk-gui">Gửi mã</button><button class="chinh" type="button" id="tk-ok" hidden>Xác nhận</button></div>';
      var het = function () { nen.remove(); if (o.xong && r && r.token) o.xong(r); };
      $('#tk-sau').onclick = het;
      $('#tk-gui').onclick = function () {
        var b = this; ban(b, 'Đang gửi…'); loi('');
        goi({ action: 'guiMaBoSung', token: t.token, email: $('#tk-mail').value, dienThoai: $('#tk-sdt').value }).then(function (k) {
          tha(b); if (!k || !k.ok) return loi((k && k.error) || 'Chưa gửi được mã.');
          $('#tk-b2').hidden = false; b.hidden = true; $('#tk-ok').hidden = false; $('#tk-dagui').textContent = '📧 Đã gửi mã về ' + k.email;
        }, function () { tha(b); loi('Không kết nối được máy chủ.'); });
      };
      $('#tk-ok').onclick = function () {
        var b = this; ban(b); loi('');
        goi({ action: 'hsBoSung', token: t.token, ma: $('#tk-ma').value }).then(function (k) { tha(b); if (k && k.ok) { if (r && r.token) r.hs = k.hs; het(); } else loi((k && k.error) || 'Mã chưa đúng.'); }, function () { tha(b); loi('Không kết nối được máy chủ.'); });
      };
    }
    ({ tao: tao, quen: quen, bosung: function () { boSung(null); }, doilh: function () { boSung(null, true); } }[o.cheDo] || vao)();
  }
  G.TAI_KHOAN = { mo: mo };
})(window);
