// ==============================================================================
// BATTLE SESSION & QUIZ MANAGER (Quản lý bộ câu hỏi & Phiên đấu đối kháng)
// Dành cho các trò chơi đối kháng: Kéo co, Thủ thành, Xây nhà, Robot...
// Tích hợp Import chuẩn Azota, iMath, Word (.docx) kèm trích xuất hình ảnh!
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  const STORAGE_KEY = 'mhedu_ey_battle_sessions_v2';

  const DEFAULT_SESSIONS = {
    'chiem-dat': [
      {
        id: 'session_chiemdat_default',
        title: 'Bộ câu hỏi Chiếm đất Tiêu chuẩn - 25 câu đa mức độ (Chuẩn iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 3,
        questions: [
          {
                    "text": "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?",
                    "options": [
                              "48 chiếc",
                              "56 chiếc",
                              "54 chiếc",
                              "63 chiếc"
                    ],
                    "correctIndex": 1,
                    "level": "nhan_biet"
          },
          {
                    "text": "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?",
                    "options": [
                              "22 quyển",
                              "26 quyển",
                              "24 quyển",
                              "28 quyển"
                    ],
                    "correctIndex": 2,
                    "level": "nhan_biet"
          },
          {
                    "text": "8 + 7 = ?",
                    "options": [
                              "15",
                              "13",
                              "16",
                              "14"
                    ],
                    "correctIndex": 0,
                    "level": "nhan_biet"
          },
          {
                    "text": "9 × 6 = ?",
                    "options": [
                              "45",
                              "54",
                              "48",
                              "63"
                    ],
                    "correctIndex": 1,
                    "level": "nhan_biet"
          },
          {
                    "text": "56 : 8 = ?",
                    "options": [
                              "6",
                              "9",
                              "8",
                              "7"
                    ],
                    "correctIndex": 3,
                    "level": "nhan_biet"
          },
          {
                    "text": "Số liền sau của số 99 là số nào?",
                    "options": [
                              "98",
                              "100",
                              "101",
                              "90"
                    ],
                    "correctIndex": 1,
                    "level": "nhan_biet"
          },
          {
                    "text": "Hình tam giác có bao nhiêu cạnh?",
                    "options": [
                              "2",
                              "3",
                              "4",
                              "5"
                    ],
                    "correctIndex": 1,
                    "level": "nhan_biet"
          },
          {
                    "text": "1 mét bằng bao nhiêu xăng-ti-mét (cm)?",
                    "options": [
                              "10cm",
                              "100cm",
                              "1000cm",
                              "50cm"
                    ],
                    "correctIndex": 1,
                    "level": "nhan_biet"
          },
          {
                    "text": "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?",
                    "options": [
                              "39",
                              "29",
                              "45",
                              "49"
                    ],
                    "correctIndex": 0,
                    "level": "thong_hieu"
          },
          {
                    "text": "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?",
                    "options": [
                              "60 cái",
                              "180 cái",
                              "240 cái",
                              "120 cái"
                    ],
                    "correctIndex": 2,
                    "level": "thong_hieu"
          },
          {
                    "text": "Tính giá trị của biểu thức: $3 \\\\times 12 - 20$",
                    "options": [
                              "16",
                              "26",
                              "36",
                              "24"
                    ],
                    "correctIndex": 0,
                    "level": "thong_hieu"
          },
          {
                    "text": "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?",
                    "options": [
                              "28 ngày",
                              "30 ngày",
                              "31 ngày",
                              "34 ngày"
                    ],
                    "correctIndex": 2,
                    "level": "thong_hieu"
          },
          {
                    "text": "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?",
                    "options": [
                              "27 quyển",
                              "37 quyển",
                              "25 quyển",
                              "29 quyển"
                    ],
                    "correctIndex": 0,
                    "level": "thong_hieu"
          },
          {
                    "text": "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?",
                    "options": [
                              "99",
                              "98",
                              "96",
                              "88"
                    ],
                    "correctIndex": 1,
                    "level": "thong_hieu"
          },
          {
                    "text": "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?",
                    "options": [
                              "Số 3",
                              "Số 15",
                              "Số 8",
                              "Số 6"
                    ],
                    "correctIndex": 0,
                    "level": "thong_hieu"
          },
          {
                    "text": "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?",
                    "options": [
                              "16",
                              "36",
                              "32",
                              "24"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung"
          },
          {
                    "text": "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?",
                    "options": [
                              "48 con",
                              "57 con",
                              "33 con",
                              "39 con"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung"
          },
          {
                    "text": "Một hình chữ nhật có chu vi 32cm, chiều dài 10cm. Chiều rộng hình chữ nhật là:",
                    "options": [
                              "6cm",
                              "12cm",
                              "8cm",
                              "5cm"
                    ],
                    "correctIndex": 0,
                    "level": "van_dung"
          },
          {
                    "text": "Tìm x, biết: $x \\\\times 4 + 18 = 50$",
                    "options": [
                              "6",
                              "8",
                              "7",
                              "9"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung_cao"
          },
          {
                    "text": "Có 48 cái kẹo chia đều vào 6 túi. Hỏi 4 túi như thế có bao nhiêu cái kẹo?",
                    "options": [
                              "32 cái",
                              "24 cái",
                              "36 cái",
                              "28 cái"
                    ],
                    "correctIndex": 0,
                    "level": "van_dung_cao"
          },
          {
                    "text": "Cho phương trình bậc hai $x^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:",
                    "options": [
                              "-5",
                              "5",
                              "6",
                              "-6"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung_cao"
          },
          {
                    "text": "Năm nay mẹ 36 tuổi, con 9 tuổi. Hỏi sau bao nhiêu năm nữa tuổi mẹ gấp 3 lần tuổi con?",
                    "options": [
                              "3 năm",
                              "4.5 năm",
                              "5 năm",
                              "6 năm"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung_cao"
          },
          {
                    "text": "Tính diện tích hình tròn có bán kính $r = 5\\\\text{ cm}$ (lấy $\\\\pi = 3{,}14$):",
                    "options": [
                              "78{,}5\\\\text{ cm}^2",
                              "31{,}4\\\\text{ cm}^2",
                              "15{,}7\\\\text{ cm}^2",
                              "100\\\\text{ cm}^2"
                    ],
                    "correctIndex": 0,
                    "level": "van_dung"
          },
          {
                    "text": "Một người đi xe máy từ A đến B dài 60km hết 1 giờ 30 phút. Vận tốc của người đó là:",
                    "options": [
                              "45 km/h",
                              "40 km/h",
                              "35 km/h",
                              "50 km/h"
                    ],
                    "correctIndex": 1,
                    "level": "van_dung"
          },
          {
                    "text": "Biết $\\\\frac{2}{5}$ số học sinh cả lớp là 16 em. Lớp đó có tất cả bao nhiêu học sinh?",
                    "options": [
                              "32 em",
                              "36 em",
                              "40 em",
                              "44 em"
                    ],
                    "correctIndex": 2,
                    "level": "van_dung_cao"
          }
]
      }
    ],

    'thu-thanh': [
      {
        id: 'session_thuthanh_default',
        title: 'Bộ câu hỏi Thủ thành Tiêu chuẩn - 20 câu đa mức độ (Chuẩn iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 2,
        questions: [
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3, level: "nhan_biet" },
          { text: "Số liền sau của số 99 là số nào?", options: ["98", "100", "101", "90"], correctIndex: 1, level: "nhan_biet" },
          { text: "Hình tam giác có bao nhiêu cạnh?", options: ["2", "3", "4", "5"], correctIndex: 1, level: "nhan_biet" },
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0, level: "nhan_biet" },
          { text: "Tháng nào sau đây luôn có 28 hoặc 29 ngày?", options: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"], correctIndex: 1, level: "nhan_biet" },
          { text: "1 mét bằng bao nhiêu xăng-ti-mét (cm)?", options: ["10cm", "100cm", "1000cm", "50cm"], correctIndex: 1, level: "nhan_biet" },

          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2, level: "thong_hieu" },
          { text: "Tính giá trị của biểu thức:  \times 12 - 20$", options: ["16", "26", "36", "24"], correctIndex: 0, level: "thong_hieu" },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2, level: "thong_hieu" },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "37 quyển", "25 quyển", "29 quyển"], correctIndex: 0, level: "thong_hieu" },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1, level: "thong_hieu" },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0, level: "thong_hieu" },

          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1, level: "van_dung" },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1, level: "van_dung" },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0, level: "van_dung" },
          { text: "Một hình chữ nhật có chu vi 32cm, chiều dài 10cm. Chiều rộng hình chữ nhật là:", options: ["6cm", "12cm", "8cm", "5cm"], correctIndex: 0, level: "van_dung" },

          { text: "Tìm x, biết:  \times 4 + 18 = 50$", options: ["6", "8", "7", "9"], correctIndex: 1, level: "van_dung_cao" },
          { text: "Có 48 cái kẹo chia đều vào 6 túi. Hỏi 4 túi như thế có bao nhiêu cái kẹo?", options: ["32 cái", "24 cái", "36 cái", "28 cái"], correctIndex: 0, level: "van_dung_cao" },
          { text: "Cho phương trình bậc hai ^2 - 5x + 6 = 0$. Tổng các nghiệm của phương trình là:", options: ["-5", "5", "6", "-6"], correctIndex: 1, level: "van_dung_cao" },
          { text: "Năm nay mẹ 36 tuổi, con 9 tuổi. Hỏi sau bao nhiêu năm nữa tuổi mẹ gấp 3 lần tuổi con?", options: ["3 năm", "4 năm", "4.5 năm", "5 năm"], correctIndex: 2, level: "van_dung_cao" }
        ]
      }
    ],
    'xay-nha': [
      {
        id: 'session_xaynha_default',
        title: 'Bộ câu hỏi Xây nhà Tiêu chuẩn - 18 câu đa mức độ',
        secondsPerQuestion: 30,
        teamCount: 2,
        questions: [
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0, level: "nhan_biet" },
          { text: "Số liền sau của số 99 là số nào?", options: ["98", "100", "101", "90"], correctIndex: 1, level: "nhan_biet" },
          { text: "Hình tam giác có bao nhiêu cạnh?", options: ["2", "3", "4", "5"], correctIndex: 1, level: "nhan_biet" },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3, level: "nhan_biet" },
          { text: "Tháng nào sau đây luôn có 28 hoặc 29 ngày?", options: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"], correctIndex: 1, level: "nhan_biet" },
          { text: "1 mét bằng bao nhiêu xăng-ti-mét (cm)?", options: ["10cm", "100cm", "1000cm", "50cm"], correctIndex: 1, level: "nhan_biet" },

          { text: "Tính giá trị của biểu thức: 3 × 12 - 20", options: ["16", "26", "36", "24"], correctIndex: 0, level: "thong_hieu" },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2, level: "thong_hieu" },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "37 quyển", "25 quyển", "29 quyển"], correctIndex: 0, level: "thong_hieu" },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1, level: "thong_hieu" },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0, level: "thong_hieu" },
          { text: "Bao gạo nặng 50kg, bao ngô nhẹ hơn bao gạo 15kg. Bao ngô nặng bao nhiêu kg?", options: ["35kg", "65kg", "30kg", "40kg"], correctIndex: 0, level: "thong_hieu" },

          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1, level: "van_dung" },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0, level: "van_dung" },
          { text: "Một hình chữ nhật có chu vi 32cm, chiều dài 10cm. Chiều rộng hình chữ nhật là:", options: ["6cm", "12cm", "8cm", "5cm"], correctIndex: 0, level: "van_dung" },
          { text: "Tìm x, biết: x × 4 + 18 = 50", options: ["6", "8", "7", "9"], correctIndex: 1, level: "van_dung" },
          { text: "Có 48 cái kẹo chia đều vào 6 túi. Hỏi 4 túi như thế có bao nhiêu cái kẹo?", options: ["32 cái", "24 cái", "36 cái", "28 cái"], correctIndex: 0, level: "van_dung" },
          { text: "Năm nay mẹ 36 tuổi, con 9 tuổi. Hỏi mẹ gấp mấy lần tuổi con?", options: ["4 lần", "3 lần", "5 lần", "6 lần"], correctIndex: 0, level: "van_dung" }
        ]
      }
    ],
                'banh-trung-thu': [
        {
          id: 'session_btt_default',
          title: 'Lò Bánh Trung Thu - Gọi tên học sinh rằm tháng tám',
          gameId: 'banh-trung-thu',
          created: '2026-11-08',
          questions: [
            { text: 'Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?', options: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'], correctIndex: 1 }
          ]
        }
      ],
      'tranh-bep-cung-trang': [
        {
          id: 'session_tb_default',
          title: 'Tranh Bếp Cung Trăng - Đố vui Trung Thu & Toán vui',
          gameId: 'tranh-bep-cung-trang',
          created: '2026-11-08',
          questions: [
            { text: 'Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?', options: ['28 ngày', '30 ngày', '31 ngày', '34 ngày'], correctIndex: 2, level: 'thong_hieu' },
            { text: 'Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?', options: ['39', '29', '45', '49'], correctIndex: 0, level: 'van_dung' },
            { text: 'Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?', options: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'], correctIndex: 1, level: 'nhan_biet' },
            { text: 'Bánh nướng truyền thống thường có nhân gì đặc trưng?', options: ['Thập cẩm trứng muối', 'Phô mai', 'Chocolate', 'Dâu tây'], correctIndex: 0, level: 'nhan_biet' },
            { text: 'Hình ảnh nào gắn liền với đêm rằm Trung Thu cổ truyền?', options: ['Chú Cuội, Cây Đa, Chị Hằng', 'Ông già Noel', 'Bánh Chưng', 'Hoa Đào'], correctIndex: 0, level: 'nhan_biet' },
            { text: 'Số liền sau của số lớn nhất có 2 chữ số khác nhau là số nào?', options: ['98', '99', '100', '97'], correctIndex: 1, level: 'thong_hieu' },
            { text: 'Đèn lồng truyền thống Trung Thu thường có hình con vật gì?', options: ['Cá chép', 'Cá mập', 'Hổ vằn', 'Đại bàng'], correctIndex: 0, level: 'nhan_biet' },
            { text: 'Lớp 3A có 36 học sinh chia đều thành 4 tổ. Hỏi mỗi tổ có bao nhiêu học sinh?', options: ['7 bạn', '8 bạn', '9 bạn', '10 bạn'], correctIndex: 2, level: 'thong_hieu' },
            { text: 'Bánh dẻo Trung Thu thường có màu gì chủ đạo?', options: ['Màu trắng', 'Màu vàng sẫm', 'Màu nâu', 'Màu đỏ sẫm'], correctIndex: 0, level: 'nhan_biet' },
            { text: '7 gấp lên 8 lần rồi bớt đi 6 thì được kết quả là:', options: ['50', '52', '56', '48'], correctIndex: 0, level: 'van_dung' },
            { text: 'Vị ngọt thanh và bùi của bánh dẻo thường đến từ hạt gì?', options: ['Hạt sen', 'Hạt ổi', 'Hạt tiêu', 'Hạt mít'], correctIndex: 0, level: 'nhan_biet' },
            { text: 'Quả nào sau đây là đặc sản mùa thu thường bày mâm cỗ Trung Thu?', options: ['Quả bưởi', 'Quả dưa hấu', 'Quả sầu riêng', 'Quả dứa'], correctIndex: 0, level: 'nhan_biet' }
          ],
          questionList: [
            { question: 'Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?', options: ['28 ngày', '30 ngày', '31 ngày', '34 ngày'], answer: 2 },
            { question: 'Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?', options: ['39', '29', '45', '49'], answer: 0 },
            { question: 'Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?', options: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'], answer: 1 },
            { question: 'Bánh nướng truyền thống thường có nhân gì đặc trưng?', options: ['Thập cẩm trứng muối', 'Phô mai', 'Chocolate', 'Dâu tây'], answer: 0 },
            { question: 'Hình ảnh nào gắn liền với đêm rằm Trung Thu cổ truyền?', options: ['Chú Cuội, Cây Đa, Chị Hằng', 'Ông già Noel', 'Bánh Chưng', 'Hoa Đào'], answer: 0 },
            { question: 'Số liền sau của số lớn nhất có 2 chữ số khác nhau là số nào?', options: ['98', '99', '100', '97'], answer: 1 },
            { question: 'Đèn lồng truyền thống Trung Thu thường có hình con vật gì?', options: ['Cá chép', 'Cá mập', 'Hổ vằn', 'Đại bàng'], answer: 0 },
            { question: 'Lớp 3A có 36 học sinh chia đều thành 4 tổ. Hỏi mỗi tổ có bao nhiêu học sinh?', options: ['7 bạn', '8 bạn', '9 bạn', '10 bạn'], answer: 2 },
            { question: 'Bánh dẻo Trung Thu thường có màu gì chủ đạo?', options: ['Màu trắng', 'Màu vàng sẫm', 'Màu nâu', 'Màu đỏ sẫm'], answer: 0 },
            { question: '7 gấp lên 8 lần rồi bớt đi 6 thì được kết quả là:', options: ['50', '52', '56', '48'], answer: 0 },
            { question: 'Vị ngọt thanh và bùi của bánh dẻo thường đến từ hạt gì?', options: ['Hạt sen', 'Hạt ổi', 'Hạt tiêu', 'Hạt mít'], answer: 0 },
            { question: 'Quả nào sau đây là đặc sản mùa thu thường bày mâm cỗ Trung Thu?', options: ['Quả bưởi', 'Quả dưa hấu', 'Quả sầu riêng', 'Quả dứa'], answer: 0 }
          ]
        }
      ],
      'dap-thu-bong': [
      {
        id: 'session_bsp_default',
        title: 'Bộ câu hỏi Trò Bí Ngô Halloween - 16 câu đa lĩnh vực',
        secondsPerQuestion: 30,
        winDistance: 10,
        teamAName: 'Đội A',
        teamAColor: '#3b82f6',
        teamBName: 'Đội B',
        teamBColor: '#ef4444',
        questions: [
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "Lễ hội Halloween thường diễn ra vào ngày nào hàng năm?", options: ["31 tháng 10", "25 tháng 12", "15 tháng 8", "1 tháng 1"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["54", "45", "63", "56"], correctIndex: 0 },
          { text: "Biểu tượng kinh điển của đêm Halloween là gì?", options: ["Quả bí ngô Jack-o'-lantern", "Cây nêu ngày Tết", "Đèn ông sao", "Bánh chưng"], correctIndex: 0 },
          { text: "56 : 8 = ?", options: ["7", "6", "8", "9"], correctIndex: 0 },
          { text: "Từ nào viết đúng chính tả tiếng Việt?", options: ["Xinh xắn", "Sinh xắn", "Xinh sắn", "Sinh sắn"], correctIndex: 0 },
          { text: "100 - 37 = ?", options: ["63", "67", "53", "73"], correctIndex: 0 },
          { text: "Thủ đô của nước ta là thành phố nào?", options: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"], correctIndex: 0 },
          { text: "15 - 8 = ?", options: ["7", "6", "8", "9"], correctIndex: 0 },
          { text: "Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?", options: ["Con cua", "Con tôm", "Con nhện", "Con ghẹ"], correctIndex: 0 },
          { text: "7 × 8 = ?", options: ["56", "54", "58", "64"], correctIndex: 0 },
          { text: "Trong câu 'Bé chăm ngoan học giỏi', từ nào là từ chỉ đặc điểm?", options: ["Chăm ngoan", "Bé", "Học", "Sách"], correctIndex: 0 },
          { text: "24 : 4 = ?", options: ["6", "7", "8", "5"], correctIndex: 0 },
          { text: "Câu đố: 'Vừa bằng quả ổi, khi nổi khi chìm là gì?'", options: ["Ốc nhồi", "Bóng nước", "Hòn đá", "Quả chanh"], correctIndex: 0 }
        ]
      }
    ],
        'day-gay': [
      {
        id: 'session_daygay_default',
        title: 'Bộ câu hỏi Đẩy Gậy Quyết Chiến Tiêu Chuẩn - 16 câu đa lĩnh vực',
        secondsPerQuestion: 30,
        winDistance: 80,
        pull: 1,
        teamAName: 'Đội A',
        teamAColor: '#3b82f6',
        teamBName: 'Đội B',
        teamBColor: '#ef4444',
        questions: [
          {
            text: "8 + 7 = ?",
            options: ["15", "13", "16", "14"],
            correctIndex: 0
          },
          {
            text: "Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?",
            options: ["Con cua", "Con tôm", "Con nhện", "Con ghẹ"],
            correctIndex: 0
          },
          {
            text: "56 : 8 = ?",
            options: ["6", "9", "8", "7"],
            correctIndex: 2
          },
          {
            text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?",
            options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"],
            correctIndex: 2
          },
          {
            text: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?",
            options: ["Đà Nẵng", "Hà Nội", "Hải Phòng", "TP. Hồ Chí Minh"],
            correctIndex: 1
          },
          {
            text: "Mặt trời mọc ở hướng nào?",
            options: ["Hướng Tây", "Hướng Nam", "Hướng Bắc", "Hướng Đông"],
            correctIndex: 3
          },
          {
            text: "Từ nào sau đây viết đúng chính tả tiếng Việt?",
            options: ["Suôn sẻ", "Xuôn xẻ", "Suôn xẻ", "Xuôn sẻ"],
            correctIndex: 0
          },
          {
            text: "Tam giác đều có mấy cạnh bằng nhau?",
            options: ["1 cạnh", "2 cạnh", "3 cạnh", "Không có cạnh nào"],
            correctIndex: 2
          },
          {
            text: "Tác phẩm văn học 'Dế Mèn phiêu lưu ký' là của tác giả nào?",
            options: ["Nguyễn Nhật Ánh", "Tô Hoài", "Võ Quảng", "Phạm Hổ"],
            correctIndex: 1
          },
          {
            text: "Hành tinh nào gần Mặt trời nhất trong Hệ Mặt trời?",
            options: ["Sao Hỏa", "Sao Thủy", "Sao Kim", "Trái Đất"],
            correctIndex: 1
          },
          {
            text: "Đơn vị đo cường độ dòng điện trong Hệ đo lường quốc tế (SI) là gì?",
            options: ["Vôn (V)", "Oát (W)", "Ampe (A)", "Ôm (Ω)"],
            correctIndex: 2
          },
          {
            text: "Việt Nam có bao nhiêu tỉnh thành phố trực thuộc Trung ương giáp biển?",
            options: ["20", "24", "28", "32"],
            correctIndex: 2
          },
          {
            text: "Ai là tác giả của Quốc ca nước Việt Nam (bài Tiến quân ca)?",
            options: ["Văn Cao", "Phạm Tuyên", "Trịnh Công Sơn", "Lưu Hữu Phước"],
            correctIndex: 0
          },
          {
            text: "Số nguyên tố chẵn duy nhất là số nào?",
            options: ["0", "2", "4", "6"],
            correctIndex: 1
          },
          {
            text: "7 x 8 = ?",
            options: ["54", "56", "58", "64"],
            correctIndex: 1
          },
          {
            text: "125 + 75 = ?",
            options: ["190", "200", "210", "220"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 'session_daygay_math',
        title: 'Toán học vui nhộn - Rèn tính nhanh',
        secondsPerQuestion: 25,
        winDistance: 80,
        pull: 1,
        teamAName: 'Đội A',
        teamAColor: '#059669',
        teamBName: 'Đội B',
        teamBColor: '#d97706',
        questions: [
          { text: "7 x 8 = ?", options: ["54", "56", "58", "64"], correctIndex: 1 },
          { text: "125 + 75 = ?", options: ["190", "200", "210", "220"], correctIndex: 1 },
          { text: "Hình chữ nhật có chu vi 20cm, chiều dài 6cm. Chiều rộng là bao nhiêu?", options: ["4cm", "5cm", "7cm", "8cm"], correctIndex: 0 },
          { text: "Một năm nhuận có bao nhiêu ngày?", options: ["364 ngày", "365 ngày", "366 ngày", "367 ngày"], correctIndex: 2 },
          { text: "99 - 45 + 16 = ?", options: ["70", "72", "68", "74"], correctIndex: 0 },
          { text: "Phân số 3/4 tương ứng với bao nhiêu phần trăm?", options: ["34%", "50%", "75%", "80%"], correctIndex: 2 }
        ]
      }
    ],
    'keo-co': [
      {
        id: 'session_keoco_default',
        title: 'Bộ câu hỏi Tiêu chuẩn - 16 câu đa lĩnh vực',
        secondsPerQuestion: 30,
        winDistance: 4,
        pull: 1,
        teamAName: 'Đội A',
        teamAColor: '#3b82f6',
        teamBName: 'Đội B',
        teamBColor: '#ef4444',
        questions: [
          {
            text: "8 + 7 = ?",
            options: ["15", "13", "16", "14"],
            correctIndex: 0
          },
          {
            text: "Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?",
            options: ["Con cua", "Con tôm", "Con nhện", "Con ghẹ"],
            correctIndex: 0
          },
          {
            text: "56 : 8 = ?",
            options: ["6", "9", "8", "7"],
            correctIndex: 2
          },
          {
            text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?",
            options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"],
            correctIndex: 2
          },
          {
            text: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?",
            options: ["TP. Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Hải Phòng"],
            correctIndex: 2
          },
          {
            text: "Kim loại nào sau đây có khả năng dẫn điện tốt nhất?",
            options: ["Đồng", "Nhôm", "Bạc", "Vàng"],
            correctIndex: 2
          },
          {
            text: "Tháng nào trong năm dương lịch có số ngày ít nhất?",
            options: ["Tháng 1", "Tháng 2", "Tháng 4", "Tháng 11"],
            correctIndex: 1
          },
          {
            text: "Mặt trời mọc ở hướng nào?",
            options: ["Hướng Tây", "Hướng Nam", "Hướng Bắc", "Hướng Đông"],
            correctIndex: 3
          },
          {
            text: "Từ nào sau đây viết đúng chính tả tiếng Việt?",
            options: ["Suôn sẻ", "Xuôn xẻ", "Suôn xẻ", "Xuôn sẻ"],
            correctIndex: 0
          },
          {
            text: "Tam giác đều có mấy cạnh bằng nhau?",
            options: ["1 cạnh", "2 cạnh", "3 cạnh", "Không có cạnh nào"],
            correctIndex: 2
          },
          {
            text: "Tác phẩm văn học 'Dế Mèn phiêu lưu ký' là của tác giả nào?",
            options: ["Nguyễn Nhật Ánh", "Tô Hoài", "Võ Quảng", "Phạm Hổ"],
            correctIndex: 1
          },
          {
            text: "Hành tinh nào gần Mặt trời nhất trong Hệ Mặt trời?",
            options: ["Sao Hỏa", "Sao Thủy", "Sao Kim", "Trái Đất"],
            correctIndex: 1
          },
          {
            text: "Đơn vị đo cường độ dòng điện trong Hệ đo lường quốc tế (SI) là gì?",
            options: ["Vôn (V)", "Oát (W)", "Ampe (A)", "Ôm (Ω)"],
            correctIndex: 2
          },
          {
            text: "Việt Nam có bao nhiêu tỉnh thành phố trực thuộc Trung ương giáp biển?",
            options: ["20", "24", "28", "32"],
            correctIndex: 2
          },
          {
            text: "Ai là tác giả của Quốc ca nước Việt Nam (bài Tiến quân ca)?",
            options: ["Văn Cao", "Phạm Tuyên", "Trịnh Công Sơn", "Lưu Hữu Phước"],
            correctIndex: 0
          },
          {
            text: "Số nguyên tố chẵn duy nhất là số nào?",
            options: ["0", "2", "4", "6"],
            correctIndex: 1
          }
        ]
      },
      {
        id: 'session_keoco_math',
        title: 'Toán học vui nhộn - Rèn tính nhanh',
        secondsPerQuestion: 25,
        winDistance: 3,
        pull: 1,
        teamAName: 'Đội A',
        teamAColor: '#059669',
        teamBName: 'Đội B',
        teamBColor: '#d97706',
        questions: [
          { text: "7 x 8 = ?", options: ["54", "56", "58", "64"], correctIndex: 1 },
          { text: "125 + 75 = ?", options: ["190", "200", "210", "220"], correctIndex: 1 },
          { text: "Hình chữ nhật có chu vi 20cm, chiều dài 6cm. Chiều rộng là bao nhiêu?", options: ["4cm", "5cm", "7cm", "8cm"], correctIndex: 0 },
          { text: "Một năm nhuận có bao nhiêu ngày?", options: ["364 ngày", "365 ngày", "366 ngày", "367 ngày"], correctIndex: 2 },
          { text: "99 - 45 + 16 = ?", options: ["70", "72", "68", "74"], correctIndex: 0 },
          { text: "Phân số 3/4 tương ứng với bao nhiêu phần trăm?", options: ["34%", "50%", "75%", "80%"], correctIndex: 2 }
        ]
      }
    ],
    'dai-chien-robot': [
      {
        id: 'session_robot_default',
        title: 'Bộ câu hỏi Đại Chiến Robot Tiêu chuẩn - Đấu trường Mecha (Chuẩn iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 4,
        questions: [
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "Số liền sau của số 99 là số nào?", options: ["98", "100", "101", "90"], correctIndex: 1 },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "23 quyển", "33 quyển", "37 quyển"], correctIndex: 0 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức: $3 \\times 12 - 20$", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1 },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 }
        ]
      }
    ],
    'dao-bang': [
      {
        id: 'session_daobang_default',
        title: 'Bộ câu hỏi Đảo Băng Sinh Tồn - 12 câu chuẩn iMath & Azota',
        secondsPerQuestion: 30,
        teamCount: 2,
        questions: [
          { text: "8 + 7 = ?", options: ["15", "14", "16", "13"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "48"], correctIndex: 1 },
          { text: "45 - 17 = ?", options: ["28", "32", "26", "38"], correctIndex: 0 },
          { text: "56 : 8 = ?", options: ["6", "9", "7", "8"], correctIndex: 2 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức: $3 \\times 12 - 20$", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Số chẵn lớn nhất có 2 chữ số khác nhau là số nào?", options: ["99", "98", "96", "88"], correctIndex: 1 },
          { text: "Đồng hồ chỉ 8 giờ 15 phút, kim phút đang chỉ vào số mấy?", options: ["Số 3", "Số 15", "Số 8", "Số 6"], correctIndex: 0 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 }
        ]
      }
    ],
    'duong-dua': [
      {
        id: 'session_duongdua_default',
        title: 'Bộ câu hỏi Đường Đua Siêu Tốc - 12 câu chuẩn iMath & Azota',
        secondsPerQuestion: 30,
        teamCount: 2,
        questions: [
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "8 + 7 = ?", options: ["15", "14", "16", "13"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "48"], correctIndex: 1 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 }
        ]
      }
    ],
    'buc-tranh-bi-an': [
      {
        id: 'session_buctranhbian_default',
        title: 'Chơi thử - 16 câu đố Bức Tranh Bí Ẩn (Hỗ trợ iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 2,
        gridDim: 4,
        picture: {
          id: 'cat',
          name: 'Con mèo',
          desc: 'Chú mèo vàng đáng yêu đang sưởi nắng trên bãi cỏ',
          url: '/ey/games/buc-tranh-bi-an/pictures/cat.webp'
        },
        questions: [
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correctIndex: 1 },
          { text: "Số nào cộng với 36 thì được 90?", options: ["64", "56", "44", "54"], correctIndex: 3 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 },
          { text: "Mua 3 quyển vở, mỗi quyển 8 000 đồng và đưa cô bán hàng 50 000 đồng. Cô phải trả lại bao nhiêu tiền?", options: ["24 000 đồng", "18 000 đồng", "32 000 đồng", "26 000 đồng"], correctIndex: 3 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1 }
        ]
      }
    ],
    'xa-thu': [
      {
        id: 'session_xathu_default',
        title: 'Bộ câu hỏi chuẩn Xạ Thủ Thiện Xạ - 16 câu tính nhanh & tư duy (Chuẩn iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 2,
        questions: [
          { text: "8 + 7 = ?", options: ["15", "14", "13", "16"], correctIndex: 0 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correctIndex: 1 },
          { text: "Số nào cộng với 36 thì được 90?", options: ["64", "56", "44", "54"], correctIndex: 3 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 },
          { text: "Mua 3 quyển vở, mỗi quyển 8 000 đồng và đưa cô bán hàng 50 000 đồng. Cô phải trả lại bao nhiêu tiền?", options: ["24 000 đồng", "18 000 đồng", "32 000 đồng", "26 000 đồng"], correctIndex: 3 },
          { text: "Chu vi hình vuông có cạnh dài 9 cm là bao nhiêu?", options: ["18 cm", "27 cm", "36 cm", "81 cm"], correctIndex: 2 },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1 }
        ]
      }
    ],
    'ten-lua-dinh-menh': [
      {
        id: 'session_tenluadinhmenh_default',
        title: 'Chơi thử - 16 câu chuẩn Tên Lửa Định Mệnh (Hỗ trợ iMath & Azota)',
        secondsPerQuestion: 30,
        teamCount: 45,
        questions: [
          { text: "Số nào cộng với 36 thì được 90?", options: ["64", "56", "44", "54"], correctIndex: 3 },
          { text: "Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?", options: ["60 cái", "180 cái", "240 cái", "120 cái"], correctIndex: 2 },
          { text: "Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?", options: ["48 con", "57 con", "33 con", "39 con"], correctIndex: 1 },
          { text: "Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?", options: ["180", "144", "300", "324"], correctIndex: 3 },
          { text: "Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?", options: ["39", "29", "45", "49"], correctIndex: 0 },
          { text: "Tổng của hai số là 48, số lớn gấp 3 lần số bé. Số lớn là số nào?", options: ["16", "36", "32", "24"], correctIndex: 1 },
          { text: "Mua 3 quyển vở, mỗi quyển 8 000 đồng và đưa cô bán hàng 50 000 đồng. Cô phải trả lại bao nhiêu tiền?", options: ["24 000 đồng", "18 000 đồng", "32 000 đồng", "26 000 đồng"], correctIndex: 3 },
          { text: "8 + 7 = ?", options: ["15", "13", "16", "14"], correctIndex: 0 },
          { text: "Tính giá trị của biểu thức $3 \\times 12 - 20$.", options: ["16", "26", "36", "24"], correctIndex: 0 },
          { text: "Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?", options: ["28 ngày", "30 ngày", "31 ngày", "34 ngày"], correctIndex: 2 },
          { text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?", options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"], correctIndex: 2 },
          { text: "56 : 8 = ?", options: ["6", "9", "8", "7"], correctIndex: 3 },
          { text: "Mỗi hộp có 8 chiếc bút. Hỏi 7 hộp như thế có bao nhiêu chiếc bút?", options: ["48 chiếc", "56 chiếc", "54 chiếc", "63 chiếc"], correctIndex: 1 },
          { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correctIndex: 1 },
          { text: "Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?", options: ["27 quyển", "23 quyển", "33 quyển", "37 quyển"], correctIndex: 0 },
          { text: "45 - 17 = ?", options: ["32", "22", "28", "38"], correctIndex: 2 }
        ]
      }
    ]
  };

  class BattleSessionManager {
    constructor() {
      this.sessions = this.loadAll();
    }

    loadAll() {
      const isCorruptedQuestion = (q) => {
        if (!q) return true;
        const txt = String(q.text || q.content || '');
        if (/MH\s*ĐỀ\s*ÔN\s*TẬP|Họ\s*tên\s*HS\s*:|Số\s*báo\s*danh\s*:/i.test(txt)) return true;
        const opts = Array.isArray(q.options) ? q.options.map(o => typeof o === 'object' ? (o.text || '') : String(o)) : [];
        if (opts.some(o => /^\*?\.$/.test(o.trim()) || /tChọn[A-D]làkhẳngđịnh/i.test(o))) return true;
        return false;
      };

      const sanitizeSessionsMap = (mapObj) => {
        if (!mapObj || typeof mapObj !== 'object') return {};
        const out = {};
        for (const [gId, list] of Object.entries(mapObj)) {
          if (!Array.isArray(list)) continue;
          const cleanList = list.map(sess => {
            if (!sess || !Array.isArray(sess.questions)) return null;
            const validQs = sess.questions.filter(q => !isCorruptedQuestion(q)).map(q => {
              if (global.FileParser && typeof global.FileParser.cleanMathText === 'function') {
                return {
                  ...q,
                  text: global.FileParser.cleanMathText(q.text || q.content || ''),
                  options: Array.isArray(q.options)
                    ? q.options.map(o => typeof o === 'object'
                        ? { ...o, text: global.FileParser.cleanMathText(o.text || '') }
                        : global.FileParser.cleanMathText(String(o)))
                    : q.options
                };
              }
              return q;
            });
            if (validQs.length === 0) return null;
            return { ...sess, questions: validQs };
          }).filter(Boolean);
          if (cleanList.length > 0) out[gId] = cleanList;
        }
        return out;
      };

      try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mhedu_ey_battle_sessions_v1');
        if (stored) {
          const parsed = sanitizeSessionsMap(JSON.parse(stored));
          const merged = { ...JSON.parse(JSON.stringify(DEFAULT_SESSIONS)), ...parsed };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.warn("Lỗi tải battle sessions từ localStorage:", e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
    }

    saveAll() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
      } catch (e) {
        console.error("Lỗi lưu battle sessions vào localStorage:", e);
      }
    }

    getSessions(gameId) {
      if (!this.sessions[gameId] || this.sessions[gameId].length === 0) {
        this.sessions[gameId] = DEFAULT_SESSIONS[gameId] ? JSON.parse(JSON.stringify(DEFAULT_SESSIONS[gameId])) : [];
      }
      return this.sessions[gameId];
    }

    getSession(gameId, sessionId) {
      const list = this.getSessions(gameId);
      return list.find(s => s.id === sessionId) || list[0] || null;
    }

    saveSession(gameId, session) {
      if (!this.sessions[gameId]) this.sessions[gameId] = [];
      const list = this.sessions[gameId];
      const idx = list.findIndex(s => s.id === session.id);
      if (idx >= 0) {
        list[idx] = session;
      } else {
        list.push(session);
      }
      this.saveAll();
    }

    deleteSession(gameId, sessionId) {
      if (!this.sessions[gameId]) return;
      this.sessions[gameId] = this.sessions[gameId].filter(s => s.id !== sessionId);
      this.saveAll();
    }

    // RENDER LOBBY
    renderLobby(container, gameId, onBack) {
      if (!container) return;
      const isStudent = (window.EyAuth && typeof window.EyAuth.isStudent === 'function' && window.EyAuth.isStudent()) || false;
      const sessions = this.getSessions(gameId);
      let gameTitle = 'Đấu Trường Tri Thức';
      let gameDesc = 'Thi đấu đối kháng học tập gay cấn và hấp dẫn.';
      let gameIcon = '🎮';
      let gameBadge = '⚔️ ĐẤU TRƯỜNG';

      if (gameId === 'buc-tranh-bi-an') {
        gameTitle = 'Bức Tranh Bí Ẩn - Giải Mã Ô Chữ';
        gameDesc = 'Trò chơi lật mở từng mảnh ghép che giấu bức tranh chủ đề! Trả lời đúng câu hỏi để lật mở ô số, hoặc bấm Đoán tranh sớm để giành trọn số điểm thưởng của các mảnh còn lại!';
        gameIcon = '🖼️';
        gameBadge = '🎨 LẬT MẢNH ĐOÁN TRANH';
      } else if (gameId === 'xa-thu') {
        gameTitle = 'Xạ Thủ Thiện Xạ - Đấu Trường Bia Di Động';
        gameDesc = 'Trò chơi bắn bia thi đấu đỉnh cao (Cá nhân, Đơn theo đội, Đôi theo đội)! Ngắm bắn chuẩn xác các bia đáp án đang bay lượn trên sân khấu. Hỗ trợ cảm ứng Tivi thông minh, phím bấm nhanh và tay cầm điện thoại!';
        gameIcon = '🎯';
        gameBadge = '🎯 BẮN BIA THI ĐẤU 2 - 4 ĐỘI';
      } else if (gameId === 'ten-lua-dinh-menh') {
        gameTitle = 'Tên Lửa Định Mệnh - Sân Khấu Sinh Tồn 40 Linh Vật';
        gameDesc = 'Trò chơi truyền tên lửa gay cấn cho cả lớp (40 linh vật Chibi hoặc Danh sách lớp / Chế độ Đội)! Học sinh đang giữ tên lửa trả lời đúng sẽ phóng tên lửa sang bạn khác; trả lời sai hoặc hết giờ sẽ bị tên lửa phóng bay lên vũ trụ!';
        gameIcon = '🚀';
        gameBadge = '🔥 TRUYỀN TÊN LỬA SINH TỒN';
      } else if (gameId === 'duong-dua') {
        gameTitle = 'Đường Đua Siêu Tốc - Đua Tàu Vượt Đồi Núi';
        gameDesc = 'Thi đấu đối kháng 2 đội (phím QWER vs UIOP hoặc Tivi cảm ứng)! Trả lời đúng để tăng vận tốc đoàn tàu, săn Câu Quà nhận Tên lửa tăng tốc, Xúc than vĩnh viễn và gắn Toa hàng kéo nặng đối thủ!';
        gameIcon = '🚂';
        gameBadge = '🚀 ĐUA TÀU SIÊU TỐC 2 ĐỘI';
      } else if (gameId === 'dao-bang') {
        gameTitle = 'Đảo Băng Sinh Tồn - Trụ Vững Tới Cuối';
        gameDesc = 'Thi đấu sinh tồn 2 - 4 đội trên tảng băng Bắc Cực đang tan chảy từng giây! Trả lời đúng được +5s băng, trả lời sai mất 10s băng và đội chim cánh cụt cứu hộ sẽ xuất phát khi băng tan hết!';
        gameIcon = '🧊';
        gameBadge = '🐧 ĐẢO BĂNG SINH TỒN 2 - 4 ĐỘI';
      } else if (gameId === 'dai-chien-robot') {
        gameTitle = 'Đại Chiến Robot - Võ Đài Chiến Binh Mecha';
        gameDesc = 'Thi đấu đối kháng 2 - 4 đội trên võ đài tương lai! Trả lời đúng để nạp pin năng lượng, kích hoạt Đấm, Laser, Rocket, Tuyệt chiêu, Khiên chắn và Hồi máu!';
        gameIcon = '🤖';
        gameBadge = '⚡ VÕ ĐÀI ROBOT 2 - 4 ĐỘI';
      } else if (gameId === 'chiem-dat') {
        gameTitle = 'Chiếm Đất - Tranh Tài Nông Trại';
        gameDesc = 'Thi đấu đối kháng 2 - 4 đội! Trả lời đúng để gieo hạt mở rộng nông trại rực rỡ sắc màu, cướp lượt gay cấn khi đối thủ trả lời sai!';
        gameIcon = '🚜';
        gameBadge = '🌾 TRANH TÀI NÔNG TRẠI 25 Ô';

      } else if (gameId === 'thu-thanh') {
        gameTitle = 'Thủ Thành Trí Tuệ';
        gameDesc = 'Thi đấu đối kháng phòng thủ tháp! Trả lời đúng để triệu hồi quân lính và phép thuật bảo vệ thành.';
        gameIcon = '🏰';
        gameBadge = '⚔️ ĐỐI KHÁNG THỦ THÀNH';
      } else if (gameId === 'xay-nha') {
        gameTitle = 'Xây Nhà Thông Thái';
        gameDesc = 'Thi đấu đối kháng 2 đội! Trả lời đúng để đặt các tầng nhà, đội nào xây xong ngôi nhà cao nhất sẽ chiến thắng.';
        gameIcon = '🏗️';
        gameBadge = '🏆 ĐUA XÂY TÒA NHÀ';
      } else if (gameId === 'banh-trung-thu') {
        gameTitle = 'Lò Bánh Trung Thu';
        gameDesc = 'Vòng quay rằm tháng tám cùng Chị Hằng gọi tên học sinh ngẫu nhiên! Nướng bánh Trung Thu vàng ươm và chọn em lên bảng.';
        gameIcon = '🥮';
        gameBadge = '🌙 GỌI TÊN LỄ HỘI TRUNG THU';
      } else if (gameId === 'banh-trung-thu') {
        if (typeof window.launchBanhTrungThuGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchBanhTrungThuGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/banh-trung-thu.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchBanhTrungThuGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchBanhTrungThuGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'tranh-bep-cung-trang') {
        gameTitle = 'Tranh Bếp Cung Trăng';
        gameDesc = 'Cuộc thi trổ tài nấu nướng trên Cung Trăng cùng Chú Cuội và Chị Hằng! Đội A và Đội B tranh nhau gom 4 nguyên liệu làm bánh từ kho chung.';
        gameIcon = '🥮';
        gameBadge = '🌙 ĐỐI KHÁNG LỄ HỘI TRUNG THU';
      } else if (gameId === 'dap-thu-bong' || gameId === 'bi-ngo') {
        gameTitle = 'Trò Bí Ngô - Đập Bí Ngô Halloween';
        gameDesc = 'Hai đội thay nhau đập bí ngô: ra kẹo, câu hỏi, bí may mắn hay ma quái cướp kẹo! Hết 20 quả bí, đội nhiều kẹo hơn sẽ giành chiến thắng!';
        gameIcon = '🎃';
        gameBadge = '🎃 LỄ HỘI HALLOWEEN';
      } else if (gameId === 'day-gay' || gameId === 'day-gay-quyet-chien') {
        gameTitle = 'Đẩy Gậy Quyết Chiến - Đấu Trường Thần Thú';
        gameDesc = 'Thi đấu đối kháng 2 đội cổ truyền đậm chất lễ hội Việt Nam! Hai võ sĩ cầm gậy tre trong vòng tròn sới đấu. Trả lời đúng để dồn sức đẩy gậy, bùng nổ hào quang tới Hóa Thần. Đẩy đối thủ bật ra khỏi vòng để giành chiến thắng!';
        gameIcon = '🎋';
        gameBadge = '⚡ ĐỐI KHÁNG 2 ĐỘI CỔ TRUYỀN';
      } else if (gameId === 'keo-co') {
        gameTitle = 'Kéo Co Tri Thức';
        gameDesc = 'Thi đấu đối kháng 2 người hoặc 2 đội! Trả lời đúng câu hỏi để kéo sợi dây chiến thắng về phía mình.';
        gameIcon = '🪢';
        gameBadge = '⚡ ĐỐI KHÁNG 2 ĐỘI';
      }

      container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto; padding: 28px 20px; animation: fadeIn 0.25s ease;">
          <!-- Top Breadcrumb & Actions -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
            <button id="battle-btn-back" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9999px; border: 1.5px solid #cbd5e1; background: #fff; font-size: 13.5px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s;">
              ← Quay lại danh mục
            </button>
            <div style="display: flex; gap: 10px;">
              ${!isStudent ? `
                <button id="battle-btn-import-lobby" style="padding: 8px 18px; border-radius: 9999px; border: 1.5px solid #0d9488; background: #f0fdfa; color: #0d9488; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                  <span>📥</span> <span>Nhập Azota / iMath / Word</span>
                </button>
                <button id="battle-btn-new-session" style="padding: 8px 18px; border-radius: 9999px; border: none; background: #0d9488; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
                  <span>➕</span> <span>Tạo bộ câu hỏi mới</span>
                </button>
              ` : `
                <div style="display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 9999px; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #047857; font-size: 13px; font-weight: 800;">
                  <span>👨‍🎓</span> <span>Chế độ Học sinh (Chỉ Xem câu hỏi & Chơi trận)</span>
                </div>
              `}
            </div>
          </div>

          <!-- Hero Banner -->
          <div style="background: linear-gradient(135deg, #0d9488 0%, #065f46 100%); border-radius: 24px; padding: 32px; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 24px; box-shadow: 0 10px 30px rgba(13,148,136,0.25); margin-bottom: 32px;">
            <div>
              <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); font-size: 12px; font-weight: 800; margin-bottom: 12px; letter-spacing: 0.5px;">${gameBadge}</span>
              <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px; letter-spacing: -0.5px;">${gameTitle}</h1>
              <p style="font-size: 14.5px; opacity: 0.9; max-width: 580px; line-height: 1.5;">${gameDesc}</p>
            </div>
            <div style="font-size: 84px; line-height: 1; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3)); flex-shrink: 0;">${gameIcon}</div>
          </div>

          <!-- Session Selection Grid -->
          <h2 style="font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 16px;">Chọn bộ câu hỏi để thi đấu:</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-bottom: 32px;">
            ${sessions.map((sess) => `
              <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transition: transform 0.2s, border-color 0.2s;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; background: #ccfbf1; color: #0f766e;">${(sess.questions || sess.questionList || []).length} câu hỏi</span>
                    <span style="font-size: 12px; font-weight: 700; color: #64748b;">⏱ ${sess.secondsPerQuestion || 30}s / câu</span>
                  </div>
                  <h3 style="font-size: 16.5px; font-weight: 800; color: #1e293b; margin-bottom: 8px; line-height: 1.4;">${sess.title}</h3>
                  <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Khoảng cách thắng: ${sess.winDistance || 4} nấc • Kéo: ${sess.pull || 1} nấc/câu đúng</p>
                </div>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                  <button class="battle-btn-play" data-session-id="${sess.id}" style="flex: 2; padding: 11px; border-radius: 12px; border: none; background: #0d9488; color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 10px rgba(13,148,136,0.3);">
                    ▶ Vào trận
                  </button>
                  ${!isStudent ? `
                    <button class="battle-btn-edit" data-session-id="${sess.id}" title="Chỉnh sửa câu hỏi" style="flex: 1; padding: 11px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer;">
                      ✏️ Sửa
                    </button>
                  ` : `
                    <button class="battle-btn-preview" data-session-id="${sess.id}" title="Xem câu hỏi ôn tập" style="flex: 1; padding: 11px; border-radius: 12px; border: 1.5px solid #0d9488; background: #f0fdfa; color: #0d9488; font-size: 13px; font-weight: 700; cursor: pointer;">
                      👁️ Xem câu hỏi
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Event Listeners
      document.getElementById('battle-btn-back')?.addEventListener('click', () => {
        if (typeof onBack === 'function') onBack();
      });

      document.getElementById('battle-btn-import-lobby')?.addEventListener('click', () => {
        const newSession = {
          id: 'session_' + Date.now(),
          title: 'Bộ câu hỏi Nhập mới ' + (sessions.length + 1),
          secondsPerQuestion: 30,
          winDistance: 4,
          pull: 1,
          questions: []
        };
        this.openImportModal((importedQuestions) => {
          if (importedQuestions && importedQuestions.length > 0) {
            newSession.questions = importedQuestions;
            this.saveSession(gameId, newSession);
            this.renderLobby(container, gameId, onBack);
          }
        });
      });

      document.getElementById('battle-btn-new-session')?.addEventListener('click', () => {
        const newSession = {
          id: 'session_' + Date.now(),
          title: 'Bộ câu hỏi mới ' + (sessions.length + 1),
          secondsPerQuestion: 30,
          winDistance: 4,
          pull: 1,
          questions: [
            { text: "Nhập nội dung câu hỏi số 1...", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctIndex: 0 }
          ]
        };
        this.saveSession(gameId, newSession);
        this.renderLobby(container, gameId, onBack);
        this.openQuestionEditor(gameId, newSession, () => this.renderLobby(container, gameId, onBack));
      });

      container.querySelectorAll('.battle-btn-play').forEach(btn => {
        btn.addEventListener('click', () => {
          const sessId = btn.dataset.sessionId;
          const sess = this.getSession(gameId, sessId);
          this.launchFullscreenBattleGame(gameId, sess, () => this.renderLobby(container, gameId, onBack));
        });
      });

      container.querySelectorAll('.battle-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const sessId = btn.dataset.sessionId;
          const sess = this.getSession(gameId, sessId);
          this.openQuestionEditor(gameId, sess, () => this.renderLobby(container, gameId, onBack));
        });
      });

      container.querySelectorAll('.battle-btn-preview').forEach(btn => {
        btn.addEventListener('click', () => {
          const sessId = btn.dataset.sessionId;
          const sess = this.getSession(gameId, sessId);
          this.openQuestionPreview(gameId, sess);
        });
      });
    }

    // QUESTION EDITOR MODAL
    
    // XEM CÂU HỎI & ÔN TẬP DÀNH CHO HỌC SINH (READ-ONLY)
    openQuestionPreview(gameId, session) {
      let modal = document.getElementById('battle-preview-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battle-preview-modal';
        document.body.appendChild(modal);
      }

      const qList = session.questions || session.questionList || [];

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="background: #ffffff; border-radius: 24px; max-width: 820px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
            <!-- Modal Header -->
            <div style="padding: 20px 26px; border-bottom: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #ccfbf1; color: #0d9488; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                  👁️
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #0f172a;">${session.title || 'Bộ câu hỏi'}</h3>
                    <span style="background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">Học sinh xem & học</span>
                  </div>
                  <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">
                    Tổng số: <strong>${qList.length} câu hỏi</strong> • Thời gian thi đấu: <strong>${session.secondsPerQuestion || 30}s / câu</strong>
                  </div>
                </div>
              </div>
              <button onclick="document.getElementById('battle-preview-modal').remove()" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid #cbd5e1; background: #fff; color: #64748b; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            </div>

            <!-- Modal Body (Questions List) -->
            <div id="preview-questions-container" style="flex: 1; overflow-y: auto; padding: 24px 26px; display: flex; flex-direction: column; gap: 18px; background: #f8fafc;">
              ${qList.length === 0 ? `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">Chưa có câu hỏi nào trong bộ đề này.</div>
              ` : qList.map((q, idx) => {
                const text = q.text || q.q || q.question || '';
                const opts = q.options || q.choices || [];
                const correct = q.correctIndex !== undefined ? q.correctIndex : (q.correct !== undefined ? q.correct : 0);
                const explanation = q.explanation || q.explain || '';
                const labels = ['A', 'B', 'C', 'D'];

                return `
                  <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <div style="font-weight: 800; font-size: 14.5px; color: #0f172a; margin-bottom: 12px; display: flex; gap: 8px;">
                      <span style="color: #0d9488;">Câu ${idx + 1}:</span>
                      <div class="katex-render-target" style="flex: 1;">${text}</div>
                    </div>
                    ${q.image ? `<div style="margin: 10px 0;"><img src="${q.image}" style="max-height: 180px; border-radius: 10px; border: 1px solid #e2e8f0;" /></div>` : ''}
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 10px;">
                      ${opts.map((opt, optIdx) => {
                        const isCorrect = optIdx === correct;
                        return `
                          <div style="padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: ${isCorrect ? '800' : '600'}; border: 1.5px solid ${isCorrect ? '#10b981' : '#e2e8f0'}; background: ${isCorrect ? '#ecfdf5' : '#f8fafc'}; color: ${isCorrect ? '#065f46' : '#334155'}; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; gap: 8px; align-items: center;">
                              <span style="color: ${isCorrect ? '#059669' : '#64748b'}; font-weight: 800;">${labels[optIdx]}.</span>
                              <span class="katex-render-target">${opt}</span>
                            </div>
                            ${isCorrect ? '<span style="color: #059669; font-weight: 900;">✓ Đáp án đúng</span>' : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                    ${explanation ? `
                      <div style="margin-top: 12px; padding: 10px 14px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 8px; font-size: 12.5px; color: #1e40af;">
                        <strong>💡 Lời giải chi tiết:</strong> <span class="katex-render-target">${explanation}</span>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Modal Footer -->
            <div style="padding: 16px 26px; border-top: 1.5px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
              <span style="font-size: 12.5px; color: #64748b;">
                💡 Học sinh có thể đọc và ôn tập kiến thức trước khi bước vào trận đấu!
              </span>
              <div style="display: flex; gap: 10px;">
                <button onclick="document.getElementById('battle-preview-modal').remove()" style="padding: 10px 20px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #475569; font-weight: 700; font-size: 13.5px; cursor: pointer;">
                  Đóng lại
                </button>
                <button id="btn-preview-play-now" style="padding: 10px 24px; border-radius: 12px; border: none; background: #0d9488; color: #ffffff; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
                  ▶ Vào trận chơi ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      modal.querySelector('#btn-preview-play-now')?.addEventListener('click', () => {
        modal.remove();
        this.launchFullscreenBattleGame(gameId, session);
      });

      // KaTeX math rendering
      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(modal, {
            delimiters: [
              { left: '$', right: '$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        } catch(e) {}
      }
    }

    openQuestionEditor(gameId, session, onSave) {
      if (window.EyAuth && window.EyAuth.isStudent()) {
        alert('⚠️ Ở chế độ Học sinh, bạn chỉ có thể xem, học và chơi trò chơi. Không có quyền chỉnh sửa bộ câu hỏi!');
        return;
      }
      let modal = document.getElementById('battle-editor-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battle-editor-modal';
        document.body.appendChild(modal);
      }

      modal.style.cssText = 'position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(6px); padding: 20px;';

      const renderQuestionsList = () => {
        return session.questions.map((q, qIdx) => {
          const qText = q.text || q.content || '';
          const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctAnswer ? ('ABCD'.indexOf(q.correctAnswer)) : 0);
          const hasImage = !!q.image;

          return `
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 16px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 900; font-size: 14.5px; color: #0d9488;">CÂU HỎI ${qIdx + 1}</span>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn-del-question" data-idx="${qIdx}" style="padding: 4px 10px; border-radius: 8px; border: 1px solid #fca5a5; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ✕ Xóa
                  </button>
                </div>
              </div>

              <!-- Question text -->
              <textarea class="input-q-text" data-idx="${qIdx}" rows="2" style="width: 100%; border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 10px; font-size: 14px; font-family: inherit; font-weight: 600; outline: none; margin-bottom: 10px;" placeholder="Nhập nội dung câu hỏi...">${qText}</textarea>
              
              <!-- Question Image Attachment -->
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding: 8px 12px; border-radius: 10px; background: #fff; border: 1px dashed #cbd5e1;">
                <label style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: #f1f5f9; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 700; color: #334155; cursor: pointer;">
                  <span>📷 Tải ảnh câu hỏi</span>
                  <input type="file" accept="image/*" class="input-q-image-file" data-idx="${qIdx}" style="display: none;">
                </label>
                <input type="text" class="input-q-image-url" data-idx="${qIdx}" value="${q.image || ''}" placeholder="Hoặc dán URL / Data URL hình ảnh..." style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 10px; font-size: 12px;">
                ${hasImage ? `
                  <img src="${q.image}" alt="Preview" style="height: 38px; max-width: 80px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1;">
                  <button type="button" class="btn-remove-q-image" data-idx="${qIdx}" style="border: none; background: transparent; color: #ef4444; font-size: 16px; cursor: pointer; font-weight: bold;" title="Xóa ảnh">✕</button>
                ` : ''}
              </div>

              <!-- 4 Options Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                  const opt = q.options[optIdx];
                  const optText = typeof opt === 'object' ? (opt.text || opt.content || '') : String(opt || '');
                  return `
                    <div style="display: flex; align-items: center; gap: 8px; background: #fff; padding: 6px 10px; border-radius: 10px; border: 1px solid #cbd5e1;">
                      <input type="radio" name="correct_${qIdx}" value="${optIdx}" ${correctIdx === optIdx ? 'checked' : ''} class="radio-correct" data-qidx="${qIdx}" data-optidx="${optIdx}" title="Chọn làm đáp án đúng" style="cursor: pointer;">
                      <span style="font-weight: 800; font-size: 13px; color: #475569;">${letter}.</span>
                      <input type="text" class="input-opt-text" data-qidx="${qIdx}" data-optidx="${optIdx}" value="${optText}" style="flex: 1; border: none; outline: none; font-size: 13.5px; font-weight: 600;" placeholder="Đáp án ${letter}">
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      };

      modal.innerHTML = `
        <div style="width: min(840px, 95vw); max-height: 90vh; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.4); display: flex; flex-direction: column; overflow: hidden;">
          <!-- Modal Header -->
          <div style="padding: 18px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fff;">
            <div>
              <h2 style="font-size: 19px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">Soạn bộ câu hỏi</h2>
              <p style="font-size: 12.5px; color: #64748b;">Trò chơi Kéo co (Tug of War) • ${session.questions.length} câu</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button id="editor-btn-import-modal" style="padding: 7px 16px; border-radius: 9999px; border: 1.5px solid #0d9488; background: #f0fdfa; color: #0d9488; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span>📥</span> <span>Nhập Azota / iMath / Word</span>
              </button>
              <button id="editor-btn-close" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #f8fafc; font-size: 16px; font-weight: 900; color: #64748b; cursor: pointer;">✕</button>
            </div>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div style="padding: 24px; overflow-y: auto; flex: 1;">
            <!-- Session Meta -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; margin-bottom: 24px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">Tên bộ câu hỏi:</label>
                <input type="text" id="editor-session-title" value="${session.title}" style="width: 100%; height: 42px; border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 0 12px; font-size: 14px; font-weight: 700; outline: none;">
              </div>
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">Thời gian / câu (giây):</label>
                <input type="number" id="editor-session-sec" value="${session.secondsPerQuestion || 30}" min="10" max="120" style="width: 100%; height: 42px; border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 0 12px; font-size: 14px; font-weight: 700; outline: none;">
              </div>
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">Nấc thắng (mặc định 4):</label>
                <input type="number" id="editor-session-win" value="${session.winDistance || 4}" min="2" max="6" style="width: 100%; height: 42px; border-radius: 10px; border: 1.5px solid #cbd5e1; padding: 0 12px; font-size: 14px; font-weight: 700; outline: none;">
              </div>
            </div>

            <!-- Question list container -->
            <div id="editor-questions-list">
              ${renderQuestionsList()}
            </div>

            <button type="button" id="editor-btn-add-q" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px dashed #0d9488; background: #f0fdfa; color: #0d9488; font-size: 14px; font-weight: 800; cursor: pointer; margin-top: 8px;">
              ➕ Thêm câu hỏi thủ công
            </button>
          </div>

          <!-- Modal Footer -->
          <div style="padding: 16px 24px; border-top: 2px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background: #fff;">
            <button id="editor-btn-cancel" style="padding: 10px 20px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #f8fafc; font-size: 14px; font-weight: 700; color: #475569; cursor: pointer;">Hủy</button>
            <button id="editor-btn-save" style="padding: 10px 26px; border-radius: 12px; border: none; background: #0d9488; color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.35);">Lưu bộ câu hỏi</button>
          </div>
        </div>
      `;

      const attachQuestionEvents = () => {
        modal.querySelectorAll('.btn-del-question').forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (session.questions.length <= 1) {
              alert("Cần giữ lại ít nhất 1 câu hỏi!");
              return;
            }
            session.questions.splice(idx, 1);
            document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
            attachQuestionEvents();
          };
        });

        modal.querySelectorAll('.input-q-text').forEach(tx => {
          tx.oninput = () => {
            const idx = parseInt(tx.dataset.idx, 10);
            session.questions[idx].text = tx.value;
          };
        });

        modal.querySelectorAll('.input-opt-text').forEach(inp => {
          inp.oninput = () => {
            const qidx = parseInt(inp.dataset.qidx, 10);
            const optidx = parseInt(inp.dataset.optidx, 10);
            session.questions[qidx].options[optidx] = inp.value;
          };
        });

        modal.querySelectorAll('.radio-correct').forEach(rad => {
          rad.onchange = () => {
            const qidx = parseInt(rad.dataset.qidx, 10);
            const optidx = parseInt(rad.dataset.optidx, 10);
            session.questions[qidx].correctIndex = optidx;
          };
        });

        modal.querySelectorAll('.input-q-image-url').forEach(inp => {
          inp.onchange = () => {
            const qidx = parseInt(inp.dataset.idx, 10);
            session.questions[qidx].image = inp.value.trim() || null;
            document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
            attachQuestionEvents();
          };
        });

        modal.querySelectorAll('.input-q-image-file').forEach(fileInp => {
          fileInp.onchange = () => {
            const qidx = parseInt(fileInp.dataset.idx, 10);
            const file = fileInp.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = e => {
                session.questions[qidx].image = e.target.result;
                document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
                attachQuestionEvents();
              };
              reader.readAsDataURL(file);
            }
          };
        });

        modal.querySelectorAll('.btn-remove-q-image').forEach(btn => {
          btn.onclick = () => {
            const qidx = parseInt(btn.dataset.idx, 10);
            session.questions[qidx].image = null;
            document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
            attachQuestionEvents();
          };
        });

        if (global.FileParser && global.FileParser.renderMath) {
          global.FileParser.renderMath(document.getElementById('editor-questions-list'));
        }
      };

      attachQuestionEvents();

      document.getElementById('editor-btn-import-modal').onclick = () => {
        this.openImportModal((importedQuestions, mode) => {
          if (importedQuestions && importedQuestions.length > 0) {
            if (mode === 'replace') {
              session.questions = importedQuestions;
            } else {
              session.questions.push(...importedQuestions);
            }
            document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
            attachQuestionEvents();
          }
        });
      };

      document.getElementById('editor-btn-add-q').onclick = () => {
        session.questions.push({
          text: `Câu hỏi số ${session.questions.length + 1}...`,
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correctIndex: 0
        });
        document.getElementById('editor-questions-list').innerHTML = renderQuestionsList();
        attachQuestionEvents();
      };

      const closeModal = () => {
        modal.remove();
      };

      document.getElementById('editor-btn-close').onclick = closeModal;
      document.getElementById('editor-btn-cancel').onclick = closeModal;

      document.getElementById('editor-btn-save').onclick = () => {
        const title = document.getElementById('editor-session-title')?.value.trim();
        const sec = parseInt(document.getElementById('editor-session-sec')?.value, 10);
        const win = parseInt(document.getElementById('editor-session-win')?.value, 10);

        if (title) session.title = title;
        if (!isNaN(sec) && sec >= 5) session.secondsPerQuestion = sec;
        if (!isNaN(win) && win >= 2) session.winDistance = win;

        this.saveSession(gameId, session);
        closeModal();
        if (typeof onSave === 'function') onSave();
      };
    }

    // MODAL IMPORT CHUẨN AZOTA / IMATH / WORD / EXCEL
    openImportModal(onImport) {
      if (window.EyAuth && window.EyAuth.isStudent()) {
        alert('⚠️ Ở chế độ Học sinh, bạn không có quyền nhập file câu hỏi!');
        return;
      }
      let modal = document.getElementById('battle-import-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battle-import-modal';
        document.body.appendChild(modal);
      }

      modal.style.cssText = 'position: fixed; inset: 0; z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); padding: 20px;';

      const sampleAzotaText = `Câu 1: 8 + 7 = ?
A. 15
B. 13
C. 16
D. 14
Đáp án: A

Câu 2: Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?
A. Con cua
B. Con tôm
C. Con nhện
D. Con ghẹ
Đáp án: A

Câu 3: 56 : 8 = ?
A. 6
B. 9
C. 8
D. 7
Đáp án: C

Câu 4: Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?
A. 22 quyển
B. 26 quyển
C. 24 quyển
D. 28 quyển
Đáp án: C`;

      modal.innerHTML = `
        <div style="width: min(760px, 95vw); max-height: 88vh; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 18px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #fff;">
            <div>
              <h2 style="font-size: 19px; font-weight: 900; color: #0f172a; margin-bottom: 4px;">Nhập câu hỏi (Azota / iMath / Word)</h2>
              <p style="font-size: 12.5px; color: #64748b;">Hỗ trợ file Word (.docx) kèm ảnh, Excel (.xlsx, .csv) hoặc dán văn bản trắc nghiệm chuẩn</p>
            </div>
            <button id="import-btn-close" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #f8fafc; font-size: 16px; font-weight: 900; color: #64748b; cursor: pointer;">✕</button>
          </div>

          <!-- Body -->
          <div style="padding: 24px; overflow-y: auto; flex: 1;">
            <!-- Tabs -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px;">
              <button type="button" id="tab-btn-file" class="import-tab-btn" style="padding: 8px 18px; border-radius: 10px; border: none; background: #0d9488; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer;">📁 Tải file Word / Excel</button>
              <button type="button" id="tab-btn-text" class="import-tab-btn" style="padding: 8px 18px; border-radius: 10px; border: none; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 800; cursor: pointer;">📋 Dán văn bản Azota / iMath</button>
            </div>

            <!-- Tab 1: File Upload -->
            <div id="tab-content-file" style="display: block;">
              <div id="import-drop-zone" style="border: 2.5px dashed #0d9488; border-radius: 18px; background: #f0fdfa; padding: 36px 20px; text-align: center; cursor: pointer; transition: background 0.2s;">
                <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                <h3 style="font-size: 16px; font-weight: 800; color: #0f766e; margin-bottom: 6px;">Kéo thả file vào đây hoặc bấm để chọn file</h3>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Định dạng hỗ trợ: Microsoft Word (.docx), Excel (.xlsx, .csv), Văn bản (.txt)</p>
                <input type="file" id="import-file-input" accept=".docx,.xlsx,.csv,.txt" style="display: none;">
                <button type="button" id="btn-browse-file" style="padding: 10px 24px; border-radius: 10px; border: none; background: #0d9488; color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.25);">Chọn file từ máy</button>
              </div>
              <div id="import-file-status" style="margin-top: 14px; font-size: 13.5px; font-weight: 700; color: #0f172a; display: none;"></div>
            </div>

            <!-- Tab 2: Text Paste -->
            <div id="tab-content-text" style="display: none;">
              <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">Dán nội dung câu hỏi theo chuẩn Azota / iMath:</label>
              <textarea id="import-textarea" rows="10" style="width: 100%; border-radius: 12px; border: 1.5px solid #cbd5e1; padding: 12px; font-size: 13.5px; font-family: monospace; outline: none; line-height: 1.5;" placeholder="Dán nội dung trắc nghiệm vào đây...">${sampleAzotaText}</textarea>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span id="import-text-parsed-count" style="font-size: 13px; font-weight: 800; color: #0d9488;">Đã nhận diện: 4 câu hỏi</span>
                <button type="button" id="btn-fill-sample" style="border: none; background: transparent; color: #2563eb; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline;">Điền mẫu thử</button>
              </div>
            </div>

            <!-- Import Mode (Append or Overwrite) -->
            <div style="margin-top: 20px; padding: 14px 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 24px;">
              <span style="font-size: 13px; font-weight: 800; color: #334155;">Chế độ nạp:</span>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
                <input type="radio" name="import_mode" value="replace" checked>
                <span>Ghi đè danh sách hiện tại</span>
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
                <input type="radio" name="import_mode" value="append">
                <span>Thêm tiếp vào cuối danh sách</span>
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; border-top: 2px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background: #fff;">
            <button id="import-modal-btn-cancel" style="padding: 10px 20px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #f8fafc; font-size: 14px; font-weight: 700; color: #475569; cursor: pointer;">Hủy</button>
            <button id="import-modal-btn-confirm" style="padding: 10px 26px; border-radius: 12px; border: none; background: #0d9488; color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.35);">Xác nhận nạp câu hỏi</button>
          </div>
        </div>
      `;

      let currentParsedQuestions = [];

      const updateTextParsedCount = () => {
        const text = document.getElementById('import-textarea')?.value || '';
        if (global.FileParser) {
          const raw = global.FileParser.parseTextOrCsv(text);
          currentParsedQuestions = global.FileParser.toGameQuestions ? global.FileParser.toGameQuestions(raw) : raw.map(q => ({
            text: q.content,
            image: q.image || null,
            options: (q.options || []).map(o => o.text),
            correctIndex: 'ABCD'.indexOf(q.correctAnswer) >= 0 ? 'ABCD'.indexOf(q.correctAnswer) : 0
          }));
          const cntEl = document.getElementById('import-text-parsed-count');
          if (cntEl) cntEl.textContent = `Đã nhận diện: ${currentParsedQuestions.length} câu hỏi chuẩn iMath / Azota`;
        }
      };

      updateTextParsedCount();

      // Tab switching
      const tabBtnFile = document.getElementById('tab-btn-file');
      const tabBtnText = document.getElementById('tab-btn-text');
      const tabContentFile = document.getElementById('tab-content-file');
      const tabContentText = document.getElementById('tab-content-text');

      tabBtnFile.onclick = () => {
        tabBtnFile.style.background = '#0d9488';
        tabBtnFile.style.color = '#fff';
        tabBtnText.style.background = '#f1f5f9';
        tabBtnText.style.color = '#475569';
        tabContentFile.style.display = 'block';
        tabContentText.style.display = 'none';
      };

      tabBtnText.onclick = () => {
        tabBtnText.style.background = '#0d9488';
        tabBtnText.style.color = '#fff';
        tabBtnFile.style.background = '#f1f5f9';
        tabBtnFile.style.color = '#475569';
        tabContentFile.style.display = 'none';
        tabContentText.style.display = 'block';
        updateTextParsedCount();
      };

      document.getElementById('import-textarea')?.addEventListener('input', updateTextParsedCount);

      document.getElementById('btn-fill-sample')?.addEventListener('click', () => {
        const tx = document.getElementById('import-textarea');
        if (tx) {
          tx.value = sampleAzotaText;
          updateTextParsedCount();
        }
      });

      // File upload handling
      const fileInput = document.getElementById('import-file-input');
      const dropZone = document.getElementById('import-drop-zone');
      const fileStatus = document.getElementById('import-file-status');

      const handleFile = async (file) => {
        if (!file) return;
        fileStatus.style.display = 'block';
        fileStatus.innerHTML = `<span style="color: #0d9488;">⏳ Đang phân tích file <b>${file.name}</b>...</span>`;

        try {
          if (file.name.endsWith('.docx')) {
            if (!global.FileParser) throw new Error("Chưa nạp module FileParser!");
            const raw = await global.FileParser.parseDocx(file);
            currentParsedQuestions = global.FileParser.toGameQuestions ? global.FileParser.toGameQuestions(raw) : raw.map(q => ({
              text: q.content,
              image: q.image || null,
              options: (q.options || []).map(o => o.text),
              correctIndex: 'ABCD'.indexOf(q.correctAnswer) >= 0 ? 'ABCD'.indexOf(q.correctAnswer) : 0
            }));
          } else {
            // Text or csv
            const text = await file.text();
            const raw = global.FileParser.parseTextOrCsv(text);
            currentParsedQuestions = global.FileParser.toGameQuestions ? global.FileParser.toGameQuestions(raw) : raw.map(q => ({
              text: q.content,
              image: q.image || null,
              options: (q.options || []).map(o => o.text),
              correctIndex: 'ABCD'.indexOf(q.correctAnswer) >= 0 ? 'ABCD'.indexOf(q.correctAnswer) : 0
            }));
          }

          fileStatus.innerHTML = `<span style="color: #16a34a;">✓ Đã nhận diện thành công <b>${currentParsedQuestions.length} câu hỏi</b> từ file ${file.name}!</span>`;
        } catch (err) {
          fileStatus.innerHTML = `<span style="color: #ef4444;">✕ Lỗi đọc file: ${err.message}</span>`;
        }
      };

      document.getElementById('btn-browse-file')?.addEventListener('click', () => {
        fileInput?.click();
      });

      fileInput?.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
        }
      });

      dropZone?.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.style.background = '#ccfbf1';
      });

      dropZone?.addEventListener('dragleave', e => {
        e.preventDefault();
        dropZone.style.background = '#f0fdfa';
      });

      dropZone?.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.style.background = '#f0fdfa';
        if (e.dataTransfer.files.length > 0) {
          handleFile(e.dataTransfer.files[0]);
        }
      });

      const closeModal = () => modal.remove();
      document.getElementById('import-btn-close').onclick = closeModal;
      document.getElementById('import-modal-btn-cancel').onclick = closeModal;

      document.getElementById('import-modal-btn-confirm').onclick = () => {
        if (tabContentText.style.display !== 'none') {
          updateTextParsedCount();
        }

        if (!currentParsedQuestions || currentParsedQuestions.length === 0) {
          alert("Chưa có câu hỏi nào được nhận diện! Vui lòng chọn file hoặc dán nội dung câu hỏi.");
          return;
        }

        const mode = modal.querySelector('input[name="import_mode"]:checked')?.value || 'replace';
        closeModal();
        if (typeof onImport === 'function') {
          onImport(currentParsedQuestions, mode);
        }
      };
    }

    // LAUNCH FULLSCREEN BATTLE GAME
    launchFullscreenBattleGame(gameId, session, onExit) {
      let gameContainer = document.getElementById('game-fullscreen-container');
      if (!gameContainer) {
        gameContainer = document.createElement('div');
        gameContainer.id = 'game-fullscreen-container';
        document.body.appendChild(gameContainer);
      }

      gameContainer.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 999999; background: #000000; overflow: hidden; display: block; margin: 0; padding: 0;';
      gameContainer.innerHTML = '';

      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}

      const options = {
        questions: session.questions,
        secondsPerQuestion: session.secondsPerQuestion || 30,
        winDistance: session.winDistance || 4,
        pull: session.pull || 1,
        teamAName: session.teamAName || 'Đội A',
        teamAColor: session.teamAColor || '#3b82f6',
        teamBName: session.teamBName || 'Đội B',
        teamBColor: session.teamBColor || '#ef4444',
        gridDim: session.gridDim || 4,
        picture: session.picture || null,
        onExit: () => {
          if (window.__activeFullscreenGameCleanup) {
            try {
              if (typeof window.__activeFullscreenGameCleanup === 'function') {
                window.__activeFullscreenGameCleanup();
              } else if (typeof window.__activeFullscreenGameCleanup.destroy === 'function') {
                window.__activeFullscreenGameCleanup.destroy();
              }
            } catch (e) {}
            window.__activeFullscreenGameCleanup = null;
          }
          if (document.fullscreenElement && document.exitFullscreen) {
            try { document.exitFullscreen().catch(() => {}); } catch (e) {}
          }
          gameContainer.style.display = 'none';
          gameContainer.innerHTML = '';
          if (typeof onExit === 'function') onExit();
        }
      };

      if (gameId === 'buc-tranh-bi-an') {
        if (typeof window.launchBucTranhBiAnGame === 'function') {
          const instance = window.launchBucTranhBiAnGame(gameContainer, options);
          window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/buc-tranh-bi-an.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchBucTranhBiAnGame === 'function') {
              const instance = window.launchBucTranhBiAnGame(gameContainer, options);
              window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'xa-thu') {
        if (typeof window.launchXaThuGame === 'function') {
          const instance = window.launchXaThuGame(gameContainer, options);
          window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/xa-thu.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchXaThuGame === 'function') {
              const instance = window.launchXaThuGame(gameContainer, options);
              window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'ten-lua-dinh-menh') {
        if (typeof window.launchTenLuaDinhMenhGame === 'function') {
          const instance = window.launchTenLuaDinhMenhGame(gameContainer, options);
          window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/ten-lua-dinh-menh.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchTenLuaDinhMenhGame === 'function') {
              const instance = window.launchTenLuaDinhMenhGame(gameContainer, options);
              window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'duong-dua') {
        if (typeof window.launchDuongDuaGame === 'function') {
          const instance = window.launchDuongDuaGame(gameContainer, options);
          window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/duong-dua.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchDuongDuaGame === 'function') {
              const instance = window.launchDuongDuaGame(gameContainer, options);
              window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'dao-bang') {
        if (typeof window.launchDaoBangGame === 'function') {
          const instance = window.launchDaoBangGame(gameContainer, options);
          window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/dao-bang.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchDaoBangGame === 'function') {
              const instance = window.launchDaoBangGame(gameContainer, options);
              window.__activeFullscreenGameCleanup = instance && typeof instance.destroy === 'function' ? () => instance.destroy() : null;
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'dai-chien-robot') {
        if (typeof window.launchDaiChienRobotGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchDaiChienRobotGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/dai-chien-robot.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchDaiChienRobotGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchDaiChienRobotGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'xay-nha') {
        if (typeof window.launchXayNhaGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchXayNhaGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/xay-nha.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchXayNhaGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchXayNhaGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'chiem-dat') {
          if (typeof window.launchChiemDatGame === 'function') {
            window.__activeFullscreenGameCleanup = window.launchChiemDatGame(gameContainer, options);
          } else {
            const s = document.createElement('script');
            s.src = '/ey/games/chiem-dat.js?v=' + Date.now();
            s.onload = () => {
              if (typeof window.launchChiemDatGame === 'function') {
                window.__activeFullscreenGameCleanup = window.launchChiemDatGame(gameContainer, options);
              }
            };
            document.head.appendChild(s);
          }
        } else if (gameId === 'thu-thanh') {
        if (typeof window.launchThuThanhGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchThuThanhGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/thu-thanh.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchThuThanhGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchThuThanhGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
                  } else if (gameId === 'dap-thu-bong' || gameId === 'bi-ngo') {
        if (typeof window.launchDapThuBongGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchDapThuBongGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/dap-thu-bong.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchDapThuBongGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchDapThuBongGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'banh-trung-thu') {
        if (typeof window.launchBanhTrungThuGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchBanhTrungThuGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/banh-trung-thu.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchBanhTrungThuGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchBanhTrungThuGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      
      } else if (gameId === 'tranh-bep-cung-trang') {
        if (typeof window.launchTranhBepCungTrangGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchTranhBepCungTrangGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/tranh-bep-cung-trang.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchTranhBepCungTrangGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchTranhBepCungTrangGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'day-gay' || gameId === 'day-gay-quyet-chien') {
        if (typeof window.launchDayGayGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchDayGayGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/day-gay.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchDayGayGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchDayGayGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else {
        if (typeof window.launchKeoCoGame === 'function') {
        window.__activeFullscreenGameCleanup = window.launchKeoCoGame(gameContainer, options);
      } else {
        const s = document.createElement('script');
        s.src = '/ey/games/keo-co.js?v=20261103_v2';
        s.onload = () => {
          if (typeof window.launchKeoCoGame === 'function') {
            window.__activeFullscreenGameCleanup = window.launchKeoCoGame(gameContainer, options);
          }
        };
        document.head.appendChild(s);
      }
      }
    }
  }

  global.EyBattleSessionManager = new BattleSessionManager();

})(typeof window !== 'undefined' ? window : this);
