/* =====================================================================
   SmartEdu — 20 CÂU HỎI MẪU mặc định, dùng chung cho các game trắc nghiệm
   Đặt ở thư mục cha (game/, gametest/), các game nạp bằng:
     <script src="../smartedu-default-questions.js"></script>
   Dùng trong game:  window.SmartEduSampleQuestions
   Mỗi câu: { q: 'nội dung', opts: ['A','B','C','D'], answer: 0..3 }
   Thầy muốn đổi/bổ sung câu mẫu thì sửa 1 chỗ ở file này, mọi game theo luôn.
   ===================================================================== */
window.SmartEduSampleQuestions = [
  { q: '5 + 7 = ?', opts: ['11','12','13','10'], answer: 1 },
  { q: 'Số nào là số chẵn?', opts: ['3','7','10','9'], answer: 2 },
  { q: '12 − 5 = ?', opts: ['7','6','8','9'], answer: 0 },
  { q: '3 × 4 = ?', opts: ['10','11','12','13'], answer: 2 },
  { q: '9 + 6 = ?', opts: ['14','15','16','13'], answer: 1 },
  { q: 'Số nào lớn nhất?', opts: ['45','54','40','49'], answer: 1 },
  { q: '"Yêu Tổ quốc, yêu đồng bào" là điều thứ mấy Bác Hồ dạy thiếu niên, nhi đồng?', opts: ['Điều 1','Điều 2','Điều 3','Điều 4'], answer: 0 },
  { q: 'Bác Hồ dạy: "Học tập tốt, ..." gì tốt?', opts: ['Lao động tốt','Vui chơi tốt','Ăn ngủ tốt','Ca hát tốt'], answer: 0 },
  { q: 'Bác Hồ dạy: "Đoàn kết tốt, ..." gì tốt?', opts: ['Kỷ luật tốt','Học tập tốt','Lao động tốt','Vệ sinh tốt'], answer: 0 },
  { q: '"Giữ gìn vệ sinh thật tốt" là điều thứ mấy Bác Hồ dạy?', opts: ['Điều 2','Điều 3','Điều 4','Điều 5'], answer: 2 },
  { q: 'Bác Hồ dạy: "Khiêm tốn, thật thà, ..." gì?', opts: ['Dũng cảm','Mạnh mẽ','Chăm chỉ','Hiền lành'], answer: 0 },
  { q: 'Bác Hồ sinh ngày nào?', opts: ['19/5/1890','2/9/1945','19/5/1945','2/9/1890'], answer: 0 },
  { q: 'Quê Bác Hồ ở tỉnh nào?', opts: ['Nghệ An','Hà Tĩnh','Thanh Hóa','Hà Nội'], answer: 0 },
  { q: 'Câu nói "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước" là của ai?', opts: ['Bác Hồ','Trần Hưng Đạo','Quang Trung','Lý Thường Kiệt'], answer: 0 },
  { q: 'Đội viên đeo khăn quàng màu gì?', opts: ['Đỏ','Xanh','Vàng','Trắng'], answer: 0 },
  { q: 'Một tuần lễ có mấy ngày?', opts: ['5','6','7','8'], answer: 2 },
  { q: 'Tháng 2 năm thường có bao nhiêu ngày?', opts: ['30','29','28','31'], answer: 2 },
  { q: '1 tá bút chì có mấy chiếc?', opts: ['10','11','12','20'], answer: 2 },
  { q: 'Con gà có mấy chân?', opts: ['4','2','6','8'], answer: 1 },
  { q: 'Lời dạy "Non sông Việt Nam có trở nên tươi đẹp hay không..." Bác Hồ gửi cho ai?', opts: ['Học sinh','Bộ đội','Nông dân','Công nhân'], answer: 0 }
];
