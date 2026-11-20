/* ← Quay lại · 🏠 Trang chủ cho mọi trang học liệu, ứng dụng khi mở riêng (tab mới).
 * Trong khung website (xem.html) đã có sẵn hai nút này nên không hiện thêm.
 * Trang có chỗ đặt sẵn [data-nut-ve] thì gắn vào đó; không thì nổi ở góc dưới bên trái. */
(function () {
  'use strict';
  try { if (window.top !== window) return; } catch (e) { return; }
  var s = document.currentScript && document.currentScript.src || '';
  var goc = s.replace(/assets\/nut-ve\.js.*$/, '') || '/';
  function lam() {
    if (document.getElementById('nut-ve-chung')) return;
    var cho = document.querySelector('[data-nut-ve]'), d = document.createElement('div');
    d.id = 'nut-ve-chung';
    d.innerHTML = '<button type="button" title="Quay lại trang trước">← Quay lại</button><a href="' + goc + 'index.html" title="Về trang chủ Học Toán Thông Minh">🏠 Trang chủ Học Toán</a><a href="/" title="Về màn hình chính MHEdu / SmartEdu Play" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff !important; border: none; font-weight: 800; box-shadow: 0 3px 12px rgba(79, 70, 229, 0.35);">🏠 Về Màn Hình Chính MHEdu</a>';
    var css = document.createElement('style');
    css.textContent = '#nut-ve-chung{display:flex;gap:6px;z-index:99990;font:600 13.5px/1 system-ui,"Segoe UI",Arial,sans-serif}' +
      '#nut-ve-chung>*{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid #d9d5e8;background:rgba(255,255,255,.96);color:#1e1a2e;text-decoration:none;cursor:pointer;box-shadow:0 3px 12px rgba(30,20,60,.12);font:inherit}' +
      '#nut-ve-chung>*:hover{border-color:#8b5cf6;color:#5b3fd0}' +
      '#nut-ve-chung.noi{position:fixed;left:10px;bottom:10px}@media print{#nut-ve-chung{display:none}}';
    document.head.appendChild(css);
    if (cho) cho.appendChild(d); else { d.className = 'noi'; document.body.appendChild(d); }
    d.querySelector('button').onclick = function () {
      if (history.length > 1 && document.referrer && document.referrer.indexOf(location.origin) === 0) history.back();
      else location.href = goc + 'index.html';
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lam); else lam();
})();
