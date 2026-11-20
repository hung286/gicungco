/* Bản trong website: API_URL lấy từ assets/cau-hinh.js ở thư mục gốc website. */
/* CẤU HÌNH APP — thầy cô chỉ cần sửa các dòng dưới (giữ nguyên dấu nháy ' ').
 * API_URL: dán đường dẫn "Ứng dụng web" của Google Apps Script (xem HƯỚNG DẪN, mục 2). Để trống = chế độ thử, kết quả chỉ lưu trên máy đang dùng.
 */
window.CAU_HINH = {
  API_URL: ((window.WEB_CAU_HINH || {}).API_URL || ''),
  TEN_APP: 'Luyện đề Toán 10 · 11 · 12',
  TAC_GIA: 'Học Toán Thông Minh · Toán 10 · 11 · 12',
  CHAN_TRANG: 'Bộ đề theo SGK Kết nối tri thức · Năm học 2026 – 2027',
  TRUONG_MAC_DINH: ((window.WEB_CAU_HINH || {}).TRUONG || ''),
  // Mã băm của tên đăng nhập + mật khẩu giáo viên — chỉ dùng ở chế độ thử. Khi đã kết nối Google Sheet, mật khẩu được kiểm tra trên máy chủ (tệp Code.gs).
  GV_HASH: 'cca8dd7ce28e587a17ac5c4b8d2ec09443c917f8945a308a6c13c0ec4777669b'
};
