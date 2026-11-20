/* gate.js — MHEdu Cổng Bản Quyền Game Học Tập Toàn Hệ Thống.
 * Tác giả: Thầy Nguyễn Mạnh Hùng - 0965.908.084
 * Web: MHEdu
 * Luôn kích hoạt window.__KG_LICENSED = true cho toàn bộ game!
 */
(function () {
  var idgv = '0965908084';
  try {
    var stored = localStorage.getItem('kg_current_teacher_id') || localStorage.getItem('mhedu_teacher_id');
    if (stored) idgv = stored;
  } catch (e) {}

  window.__KG_TEACHER = idgv;
  window.__KG_LICENSED = true; // Full VIP mở khóa 100% tính năng nâng cao, không giới hạn câu hỏi
  window.__MHEDU_LICENSED = true;

  try {
    sessionStorage.setItem('kg_admin_session', 'true');
    sessionStorage.setItem('mhedu_admin_session', 'true');
  } catch (e) {}
})();
