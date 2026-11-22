/**
 * HỌC TOÁN 2 - MHEDU VIP PORTAL (app.js)
 * Đồng bộ 100% tính năng, cơ chế quản trị và phân quyền VIP từ MHEdu VIP — Thầy Nguyễn Mạnh Hùng
 * Tông màu chủ đạo: Xanh lá cây (Emerald / Green)
 * Hotline / Zalo hỗ trợ: 0965908084
 */

(function () {
  'use strict';

  // --- STATE ---
  let teachersData = [];
  let currentUser = null;
  let currentSlideIndex = 0;
  let slideTimer = null;
  let currentTierFilter = 'ALL';
  let isAdminAuthenticated = false;
  const ADMIN_HASH = '662c1c5567f14a12b5d6fd6df9876cd04f6efaaaf3147277f5c9f2a2e8ff762c';
  async function computeSha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // --- 15 HERO SLIDES (Chuẩn 15 Lô Ứng dụng giaovien8888) ---
  const HERO_SLIDES = [
    {
      badge: 'Lô #1 • Đăng ký tài khoản • FREE',
      counter: '1 / 15',
      title: 'Hệ thống Cổng Đăng ký & Cấp quyền Giáo viên Thông minh',
      desc: 'Đăng ký thành viên, kích hoạt tài khoản và đồng bộ phân quyền giảng dạy tự động qua hệ thống đám mây MHEdu.',
      ctaText: 'Đăng ký tài khoản',
      ctaUrl: '/dang-ky-tai-khoan/?mode=register'
    },
    {
      badge: 'Lô #2 • Game học tập • FREE',
      counter: '2 / 15',
      title: 'Kho Trò Chơi Học Tập Tương Tác MHEdu (Gamification)',
      desc: 'Hàng chục trò chơi lớp học sinh động 2D & 3D: Ong tìm mật, Vòng quay may mắn, Đua xe tri thức, Chuyến đò tri ân, Đấu trường sinh tồn...',
      ctaText: 'Khám phá Kho Game',
      ctaUrl: '/kho-game-hoc-tap/index.html'
    },
    {
      badge: 'Lô #3 • Tải và tạo chuyên đề • VIP3',
      counter: '3 / 15',
      title: 'Nền tảng tải câu hỏi theo chủ đề bài học, môn học từ đề thi thực tế',
      desc: 'Đã mở khóa toàn bộ 12 môn học chuẩn GDPT 2018 với tài khoản VIP4 — Tải đề Word (.docx) siêu tốc.',
      ctaText: 'Tải chuyên đề dạy thêm',
      ctaUrl: '/ngan-hang-cau-hoi/index.html'
    },
    {
      badge: 'Lô #4 • Trộn đề trắc nghiệm • VIP2',
      counter: '4 / 15',
      title: 'MHEdu — Trộn Đề Trực Tiếp Siêu Nhanh Chuẩn Bộ GD&ĐT',
      desc: 'Hoán vị câu hỏi và đáp án ngẫu nhiên, sinh mã đề tự động, xuất file Word chuẩn định dạng in ấn và bảng đáp án chi tiết.',
      ctaText: 'Mở công cụ trộn đề',
      ctaUrl: '/tron-de/index.html'
    },
    {
      badge: 'Lô #5 • Học Tiếng Anh • FREE',
      counter: '5 / 15',
      title: 'MHEdu — Học Tiếng Anh Thông Minh Lớp 1–12 Tương Tác AI',
      desc: 'Luyện phát âm chuẩn bản ngữ, bổ sung vốn từ vựng theo chủ đề và luyện đề trắc nghiệm Tiếng Anh tương tác.',
      ctaText: 'Học Tiếng Anh ngay',
      ctaUrl: '/hoc-tieng-anh/index.html'
    },
    {
      badge: 'Lô #6 • Quản lý trung tâm • VIP3',
      counter: '6 / 15',
      title: 'MHEdu Pro — Quản Lý Trung Tâm & Lớp Dạy Thêm Thông Minh',
      desc: 'Theo dõi học phí, lịch học, điểm danh sĩ số học sinh và tài chính lớp học tự động liên kết với Google Sheets.',
      ctaText: 'Quản lý lớp học',
      ctaUrl: '/quan-ly-trung-tam/index.html'
    },
    {
      badge: 'Lô #7 • Ngân hàng 12 môn • VIP4',
      counter: '7 / 15',
      title: 'Kho Ngân Hàng Câu Hỏi 12 Môn GDPT 2018 Hơn 14.270 Câu',
      desc: 'Đầy đủ cấu trúc mới 3 phần (MCQ, Đúng/Sai, Trả lời ngắn), có lời giải chi tiết, tạo đề thi và xuất file Word VIP.',
      ctaText: 'Vào Kho Ngân Hàng',
      ctaUrl: '/ngan-hang-cau-hoi/index.html'
    },
    {
      badge: 'Lô #8 • Chấm tự luận AI • VIP3',
      counter: '8 / 15',
      title: 'MHEdu — Chấm Bài Tự Luận AI & Nộp Bài Trực Tuyến',
      desc: 'Chụp ảnh bài làm của học sinh, AI tự động đọc chữ viết tay, so khớp biểu điểm đáp án và đưa ra nhận xét chi tiết.',
      ctaText: 'Mở Chấm Tự Luận',
      ctaUrl: '/cham-tu-luan/index.html'
    },
    {
      badge: 'Lô #9 • Trợ lý GVCN • VIP3',
      counter: '9 / 15',
      title: 'MHEdu GVCN Pro — Quản Lý Giáo Viên Chủ Nhiệm Tổng Thể',
      desc: 'Quản lý hạnh kiểm, nề nếp thi đua, liên lạc phụ huynh và xuất báo cáo tự động bằng Google Sheets cá nhân.',
      ctaText: 'Mở Trợ Lý GVCN',
      ctaUrl: '/quan-ly-gvcn/index.html'
    },
    {
      badge: 'Lô #10 • Thi Online • VIP3',
      counter: '10 / 15',
      title: 'MHEdu Exam — Thi Trực Tuyến & Giao Bài Tập Chống Gian Lận',
      desc: 'Học sinh làm bài trên điện thoại hoặc máy tính, tự động chấm điểm, thống kê phổ điểm và phân tích lỗ hổng kiến thức.',
      ctaText: 'Vào Phòng Thi Online',
      ctaUrl: '/thi-online/index.html'
    },
    {
      badge: 'Lô #11 • Vẽ đồ thị • VIP2',
      counter: '11 / 15',
      title: 'MHEdu — Vẽ Bảng Biến Thiên & Đồ Thị Hàm Số 2D/3D Chuẩn SGK',
      desc: 'Mô phỏng hình học trực quan, vẽ đồ thị hàm số giải tích và miền nghiệm bất phương trình chuẩn sách giáo khoa mới.',
      ctaText: 'Mở Vẽ Đồ Thị',
      ctaUrl: '/ve-do-thi/index.html'
    },
    {
      badge: 'Lô #12 • Tạo QR SePay • VIP2',
      counter: '12 / 15',
      title: 'Tạo Mã QR Học Phí & Tự Động Gạch Nợ Ngân Hàng SePay',
      desc: 'Tích hợp ngân hàng tự động, học sinh quét mã QR thanh toán học phí hệ thống tự động cập nhật trạng thái đã nộp.',
      ctaText: 'Tạo Mã QR Học Phí',
      ctaUrl: '/quan-ly-trung-tam/index.html?view=import-qr'
    },
    {
      badge: 'Lô #13 • AI Tạo câu hỏi • VIP2',
      counter: '13 / 15',
      title: 'MHEdu AI — Sinh Câu Hỏi Tương Tự Chuẩn Ma Trận Đề Thi',
      desc: 'Nhập một câu hỏi mẫu, AI lập tức sinh 5-10 câu hỏi tương tự cùng dạng toán, đa dạng ngữ cảnh và đầy đủ lời giải.',
      ctaText: 'Sinh câu hỏi tương tự',
      ctaUrl: '/sinh-cau-hoi/index.html'
    },
    {
      badge: 'Lô #14 • PDF sang Word • VIP3',
      counter: '14 / 15',
      title: 'MHEdu — Chuyển Đổi File Đề PDF / Ảnh Sang Word Giữ Nguyên Công Thức',
      desc: 'Giữ nguyên 100% công thức Toán MathType, sơ đồ hình vẽ và cấu trúc bảng biểu giáo án.',
      ctaText: 'Chuyển Đổi Ngay',
      ctaUrl: '/convert-word/index.html'
    },
    {
      badge: 'Lô #15 • Soạn KHBG 5512 • VIP2',
      counter: '15 / 15',
      title: 'MHEdu — Thiết Kế Kế Hoạch Bài Dạy Chuẩn Công Văn 5512',
      desc: 'Tự động soạn giáo án bài dạy 4 bước phát triển năng lực phẩm chất học sinh chỉ trong 1 click.',
      ctaText: 'Soạn Kế Hoạch Bài Dạy',
      ctaUrl: '/ke-hoach-bai-day/index.html'
    }
  ];

  // --- 10 SUBJECT ACCOUNTS CONFIG (Tài khoản môn học Thầy Nguyễn Mạnh Hùng) ---
  const SUBJECTS_CONFIG = [
    { sub: 'Toán', id: '0965908084', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-calculator', tier: 'VIP4' },
    { sub: 'Vật lí', id: '0965908084VL', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-atom', tier: 'VIP4' },
    { sub: 'Hóa học', id: '0965908084HH', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-flask', tier: 'VIP4' },
    { sub: 'Sinh học', id: '0965908084SH', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-dna', tier: 'VIP4' },
    { sub: 'Lịch sử', id: '0965908084LS', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-landmark', tier: 'VIP4' },
    { sub: 'Địa lí', id: '0965908084DL', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-earth-americas', tier: 'VIP4' },
    { sub: 'KT&PL', id: '0965908084PL', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-scale-balanced', tier: 'VIP4' },
    { sub: 'CNCN', id: '0965908084CN', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '16/10/2027', icon: 'fa-microchip', tier: 'VIP4' },
    { sub: 'CNNN', id: '0965908084NN', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '14/10/2027', icon: 'fa-wheat-awn', tier: 'VIP4' },
    { sub: 'Tin học', id: '0965908084free', name: 'Thầy Nguyễn Mạnh Hùng', expiry: '25/07/2050', icon: 'fa-laptop-code', tier: 'VIP4' }
  ];

  // --- 17 APPS CATALOG (Chuẩn giaovien8888) ---
  const APPS_CATALOG = [
    {
      lo: 1,
      id: 'dangkytk',
      title: 'Cổng Đăng Ký Tài Khoản MHEdu',
      category: 'Tài khoản',
      tier: 'FREE',
      icon: 'fa-id-card',
      color: 'from-emerald-500 to-green-600',
      visits: '4.812',
      url: '/dang-ky-tai-khoan/?mode=register',
      desc: 'Đăng ký và cấp quyền truy cập hệ thống MHEdu cho giáo viên và các nhà trường toàn quốc.'
    },
    {
      lo: 2,
      id: 'game',
      title: 'Kho Game Học Tập Tương Tác',
      category: 'Trò chơi',
      tier: 'FREE',
      icon: 'fa-gamepad',
      color: 'from-teal-500 to-emerald-600',
      visits: '5.240',
      url: '/kho-game-hoc-tap/index.html',
      desc: 'Hàng chục trò chơi lớp học tương tác 2D & 3D: Ong tìm mật, Vòng quay may mắn, Đua xe tri thức, Chuyến đò tri ân, Đấu trường sinh tồn...'
    },
    {
      lo: 3,
      id: 'chamtracnghiem',
      title: 'Chấm Trắc Nghiệm Siêu Nhanh',
      category: 'Khảo thí',
      tier: 'VIP1',
      icon: 'fa-camera',
      color: 'from-green-600 to-emerald-700',
      visits: '3.910',
      url: '/cham-trac-nghiem/index.html',
      desc: 'Quét và chấm phiếu trả lời trắc nghiệm chuẩn BGD 2025 bằng ảnh chụp/scan, nhận diện siêu tốc, xuất Excel & tra cứu điểm.'
    },
    {
      lo: 4,
      id: 'tronde2s',
      title: 'Trộn Đề Trực Tiếp Siêu Nhanh',
      category: 'Khảo thí',
      tier: 'VIP2',
      icon: 'fa-shuffle',
      color: 'from-emerald-600 to-teal-700',
      visits: '6.450',
      url: '/tron-de/index.html',
      desc: 'Hoán vị câu hỏi, đáp án, ma trận câu hỏi, xuất file Word chuẩn định dạng in ấn và bảng đáp án chi tiết.'
    },
    {
      lo: 5,
      id: 'hoctienganh',
      title: 'MHEdu Học Tiếng Anh Tương Tác AI',
      category: 'Học tập',
      tier: 'FREE',
      icon: 'fa-language',
      color: 'from-emerald-600 to-teal-600',
      visits: '2.840',
      url: '/hoc-tieng-anh/index.html',
      desc: 'Luyện phát âm AI, từ vựng theo chủ đề và hệ thống bài tập ngữ pháp tương tác chuẩn quốc tế.'
    },
    {
      lo: 6,
      id: 'qltrungtam',
      title: 'MHEdu Quản Lý Trung Tâm & Dạy Thêm',
      category: 'Quản lý',
      tier: 'VIP3',
      icon: 'fa-school',
      color: 'from-teal-600 to-emerald-800',
      visits: '4.120',
      url: '/quan-ly-trung-tam/index.html',
      desc: 'Theo dõi học phí, lịch học, điểm danh, sĩ số học sinh và tài chính lớp học tự động liên kết Google Sheets.'
    },
    {
      lo: 7,
      id: 'taicd',
      title: 'Kho Ngân Hàng 12 Môn GDPT 2018',
      category: 'Ngân hàng đề',
      tier: 'VIP4',
      icon: 'fa-database',
      color: 'from-emerald-600 to-green-700',
      visits: '9.830',
      url: '/ngan-hang-cau-hoi/index.html',
      desc: 'Hơn 14.270 câu hỏi đủ 3 phần cấu trúc mới nhất Bộ GD&ĐT, có lời giải chi tiết và xuất Word VIP.'
    },
    {
      lo: 8,
      id: 'chamtuluan',
      title: 'MHEdu GV Chấm & HS Nộp Tự Luận AI',
      category: 'Khảo thí',
      tier: 'VIP3',
      icon: 'fa-pen-fancy',
      color: 'from-green-600 to-emerald-800',
      visits: '3.670',
      url: '/cham-tu-luan/index.html',
      desc: 'Chụp ảnh bài làm của học sinh, AI tự động đọc chữ viết tay, so khớp biểu điểm đáp án và đưa ra nhận xét chi tiết.'
    },
    {
      lo: 9,
      id: 'gvcn',
      title: 'MHEdu Quản Lý GVCN Tổng Thể',
      category: 'Quản lý',
      tier: 'VIP3',
      icon: 'fa-user-tie',
      color: 'from-teal-700 to-emerald-900',
      visits: '5.180',
      url: '/quan-ly-gvcn/index.html',
      desc: 'Quản lý nề nếp, điểm danh, hạnh kiểm, liên lạc phụ huynh và xuất báo cáo tự động bằng Google Sheets cá nhân.'
    },
    {
      lo: 10,
      id: 'thionline',
      title: 'MHEdu Exam Thi Online & Giao Bài',
      category: 'Khảo thí',
      tier: 'VIP3',
      icon: 'fa-laptop-code',
      color: 'from-emerald-500 to-teal-600',
      visits: '7.340',
      url: '/thi-online/index.html',
      desc: 'Tổ chức thi trực tuyến, làm bài trên điện thoại/máy tính, chống gian lận, báo cáo kết quả tức thì.'
    },
    {
      lo: 11,
      id: 'vedothi',
      title: 'MHEdu Vẽ Đồ Thị & Bảng Biến Thiên',
      category: 'Toán học',
      tier: 'VIP2',
      icon: 'fa-chart-line',
      color: 'from-green-500 to-emerald-700',
      visits: '6.210',
      url: '/ve-do-thi/index.html',
      desc: 'Mô phỏng hình học trực quan, vẽ đồ thị hàm số giải tích và miền nghiệm bất phương trình chuẩn sách giáo khoa mới.'
    },
    {
      lo: 12,
      id: 'taoQR',
      title: 'Tạo Mã QR Học Phí & Tự Động SePay',
      category: 'Tài chính',
      tier: 'VIP2',
      icon: 'fa-qrcode',
      color: 'from-emerald-600 to-teal-700',
      visits: '3.420',
      url: '/quan-ly-trung-tam/index.html?view=import-qr',
      desc: 'Tạo QR ngân hàng động, tự động gạch nợ học phí khi phụ huynh chuyển khoản chính xác nội dung.'
    },
    {
      lo: 13,
      id: 'taocautuongtu',
      title: 'MHEdu AI Sinh Câu Hỏi Tương Tự',
      category: 'AI Sư phạm',
      tier: 'VIP2',
      icon: 'fa-wand-magic-sparkles',
      color: 'from-cyan-600 to-emerald-600',
      visits: '4.890',
      url: '/sinh-cau-hoi/index.html',
      desc: 'Nhập một câu hỏi mẫu, AI lập tức sinh 5-10 câu hỏi tương tự cùng dạng toán, đa dạng ngữ cảnh và đầy đủ lời giải.'
    },
    {
      lo: 14,
      id: 'pdftoword',
      title: 'MHEdu Chuyển Đổi Đề PDF Sang Word',
      category: 'Tiện ích',
      tier: 'VIP3',
      icon: 'fa-file-word',
      color: 'from-teal-600 to-green-700',
      visits: '8.430',
      url: '/convert-word/index.html',
      desc: 'Giữ nguyên 100% công thức Toán MathType, LaTeX và tự động trích xuất hình vẽ sang tài liệu Word (.docx).'
    },
    {
      lo: 15,
      id: 'khbg',
      title: 'MHEdu Soạn KHBG Chuẩn CV 5512',
      category: 'Giảng dạy',
      tier: 'VIP2',
      icon: 'fa-book-open',
      color: 'from-emerald-600 to-green-600',
      visits: '5.920',
      url: '/ke-hoach-bai-day/index.html',
      desc: 'Tự động soạn KHBG 4 bước phát triển năng lực phẩm chất học sinh theo Công văn 5512 chỉ trong 1 click.'
    },
    {
      lo: 16,
      id: 'tronde',
      title: 'Thư Viện Đề Thi Chuẩn Bộ GD&ĐT',
      category: 'Tài liệu',
      tier: 'VIP1',
      icon: 'fa-folder-open',
      color: 'from-emerald-500 to-teal-700',
      visits: '6.780',
      url: '/ngan-hang-cau-hoi/index.html',
      desc: 'Thư viện đề thi học kỳ, thi thử tốt nghiệp THPT chuẩn cấu trúc ma trận cập nhật liên tục.'
    },
    {
      lo: 17,
      id: 'trolyAI',
      title: 'MHEdu Trợ Lý AI Sư Phạm Toàn Năng',
      category: 'AI Sư phạm',
      tier: 'VIP4',
      icon: 'fa-brain',
      color: 'from-emerald-700 to-teal-900',
      visits: '7.820',
      url: '/tro-ly-ai/index.html',
      desc: 'Giải đáp mọi thắc mắc chuyên môn, gợi ý phương pháp dạy học tích cực và đổi mới giáo dục hiệu quả.'
    }
  ];

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTeachersData();
    initNavigation();
    initHeroCarousel();
    initSubjectSwitcher();
    initAppCards();
    initTeacherLoginView();
    initAdminRoleView();
    initLookupModal();
    initModalsAndTriggers();
    updateHeaderAndSidebarUser();
  });

  // --- THEME ---
  function initTheme() {
    const isDark = localStorage.getItem('ht2_theme') === 'dark';
    if (isDark) document.documentElement.classList.add('dark');

    const toggleBtn = document.getElementById('btn-toggle-dark');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const darkActive = document.documentElement.classList.contains('dark');
        localStorage.setItem('ht2_theme', darkActive ? 'dark' : 'light');
        showToast(darkActive ? '🌙 Đã chuyển sang giao diện Tối' : '☀️ Đã chuyển sang giao diện Sáng');
      });
    }

    // Sidebar Toggle
    const sidebar = document.getElementById('ht2-sidebar');
    const toggleSidebarBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-20');
        document.querySelectorAll('.sidebar-label').forEach(el => el.classList.toggle('hidden'));
      });
    }
  }

  // --- LOAD TEACHERS DATABASE ---
  async function loadTeachersData() {
    try {
      const resp = await fetch('/hoc-toan-2/teachers.json');
      if (resp.ok) {
        teachersData = await resp.json();
      }
    } catch (e) {
      console.warn('Could not load teachers.json', e);
    }
    // Also restore logged in user if saved
    let saved = localStorage.getItem('ht2_current_user') || localStorage.getItem('smartedu_auth_user') || localStorage.getItem('smartedu_current_user');
    if (!saved) {
      const defaultAdmin = {
        idgv: '0965908084',
        name: 'Thầy Nguyễn Mạnh Hùng',
        fullname: 'Thầy Nguyễn Mạnh Hùng',
        email: 'nmh28691@gmail.com',
        subject: 'Toán học & Khoa học',
        vip: 'VIP4 ADMIN',
        role: 'admin',
        isAdmin: true,
        expiry: '25/07/2050',
        status: 'Hoạt động',
        total: 24,
        max: 2222
      };
      saved = JSON.stringify(defaultAdmin);
      localStorage.setItem('ht2_current_user', saved);
      localStorage.setItem('smartedu_auth_user', saved);
    }
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {}
    }
    updateHeaderAndSidebarUser();
  }

  // --- UPDATE HEADER & SIDEBAR PROFILE INFO ---
  function updateHeaderAndSidebarUser() {
    const hdrName = document.getElementById('hdr-teacher-name');
    const hdrLevel = document.getElementById('hdr-teacher-level');
    const sideName = document.getElementById('side-teacher-name');
    const sideIdgv = document.getElementById('side-teacher-idgv');

    if (currentUser) {
      if (hdrName) hdrName.textContent = currentUser.name || 'Thầy/Cô';
      if (hdrLevel) hdrLevel.textContent = `${currentUser.vip || 'VIP4'} · ${currentUser.idgv}`;
      if (sideName) sideName.textContent = currentUser.name || 'Thầy/Cô';
      if (sideIdgv) sideIdgv.textContent = `${currentUser.idgv} (${currentUser.vip || 'VIP4'})`;
    } else {
      if (hdrName) hdrName.textContent = 'Chưa đăng nhập';
      if (hdrLevel) hdrLevel.textContent = 'Khách · Đăng ký VIP';
      if (sideName) sideName.textContent = 'Chưa đăng nhập';
      if (sideIdgv) sideIdgv.textContent = 'Khách (Chưa kích hoạt)';
    }
  }

  // --- NAVIGATION (DASHBOARD, TEACHER_LOGIN, ADMIN_ROLE) ---
  function initNavigation() {
    const tabs = {
      dashboard: document.getElementById('tab-dashboard'),
      teacher_login: document.getElementById('tab-teacher_login'),
      admin_role: document.getElementById('tab-admin_role')
    };

    const navBtns = document.querySelectorAll('[data-nav]');

    function switchTab(target) {
      Object.keys(tabs).forEach(k => {
        if (tabs[k]) {
          if (k === target) {
            tabs[k].classList.remove('hidden');
          } else {
            tabs[k].classList.add('hidden');
          }
        }
      });

      // Update button active state
      navBtns.forEach(btn => {
        const btnTarget = btn.dataset.nav;
        const isHeaderBtn = btn.classList.contains('ht2-nav-btn');
        const isSideBtn = btn.classList.contains('ht2-side-btn');

        if (btnTarget === target) {
          btn.classList.add('active');
          if (isHeaderBtn) {
            btn.className = 'ht2-nav-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-600 text-white shadow-sm cursor-pointer';
          }
          if (isSideBtn) {
            btn.className = 'ht2-side-btn active w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-xs border border-emerald-200 dark:border-emerald-800 cursor-pointer';
          }
        } else {
          btn.classList.remove('active');
          if (isHeaderBtn) {
            btn.className = 'ht2-nav-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer';
          }
          if (isSideBtn) {
            btn.className = 'ht2-side-btn w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800 font-semibold cursor-pointer';
          }
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.nav;
        if (t && tabs[t]) switchTab(t);
      });
    });

    // Profile pill click switches to teacher_login tab
    const pill = document.getElementById('hdr-teacher-pill');
    if (pill) {
      pill.addEventListener('click', () => switchTab('teacher_login'));
    }

    window.ht2SwitchTab = switchTab;
  }

  // --- 15 HERO CAROUSEL ---
  function initHeroCarousel() {
    const badgeEl = document.getElementById('hero-slide-badge');
    const counterEl = document.getElementById('hero-slide-counter');
    const titleEl = document.getElementById('hero-slide-title');
    const descEl = document.getElementById('hero-slide-desc');
    const ctaBtn = document.getElementById('btn-hero-cta');
    const ctaLabel = document.getElementById('hero-slide-cta-label');
    const prevBtn = document.getElementById('btn-slide-prev');
    const nextBtn = document.getElementById('btn-slide-next');

    function renderSlide() {
      const s = HERO_SLIDES[currentSlideIndex];
      if (badgeEl) badgeEl.textContent = s.badge;
      if (counterEl) counterEl.textContent = s.counter;
      if (titleEl) titleEl.textContent = s.title;
      if (descEl) descEl.textContent = s.desc;
      if (ctaLabel) ctaLabel.textContent = s.ctaText;
      if (ctaBtn) {
        ctaBtn.onclick = () => {
          if (s.ctaUrl.includes('/dang-ky-tai-khoan')) {
            window.openRegisterPortal();
          } else if (s.ctaUrl.includes('/kho-game-hoc-tap') || s.ctaUrl.includes('khogamehoctap')) {
            window.openGamePortal();
          } else if (s.ctaUrl.startsWith('http') || s.ctaUrl.startsWith('/')) {
            window.open(s.ctaUrl, '_blank');
          }
        };
      }
    }

    function resetTimer() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % HERO_SLIDES.length;
        renderSlide();
      }, 5500);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
        renderSlide();
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex + 1) % HERO_SLIDES.length;
        renderSlide();
        resetTimer();
      });
    }

    renderSlide();
    resetTimer();
  }

  // --- 10 SUBJECT QUICK SWITCHER BAR ---
  function initSubjectSwitcher() {
    const container = document.getElementById('quick-subject-accounts');
    if (!container) return;

    container.innerHTML = SUBJECTS_CONFIG.map((cfg, i) => `
      <button type="button" class="subject-chip px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${i === 0 ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'}" data-index="${i}">
        <i class="fa-solid ${cfg.icon} text-[11px] ${i === 0 ? 'text-white' : 'text-emerald-600'}"></i>
        <span>${cfg.sub}</span>
        <span class="text-[9px] font-mono opacity-80">(${cfg.id})</span>
      </button>
    `).join('');

    const chips = container.querySelectorAll('.subject-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.className = 'subject-chip px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400';
          const icon = c.querySelector('i');
          if (icon) icon.className = icon.className.replace('text-white', 'text-emerald-600');
        });

        chip.className = 'subject-chip px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 text-white border-emerald-700 shadow-sm';
        const icon = chip.querySelector('i');
        if (icon) icon.className = icon.className.replace('text-emerald-600', 'text-white');

        const idx = parseInt(chip.dataset.index, 10);
        const sel = SUBJECTS_CONFIG[idx];
        currentUser = {
          idgv: sel.id,
          name: sel.name,
          subject: sel.sub,
          vip: sel.tier,
          expiry: sel.expiry,
          status: 'Hoạt động'
        };
        localStorage.setItem('ht2_current_user', JSON.stringify(currentUser));
        updateHeaderAndSidebarUser();
        initTeacherLoginView();
        showToast(`⚡ Đã chuyển sang chuyên mục Môn ${sel.sub} (ID: ${sel.id} · VIP4)`);
      });
    });
  }

  // --- 17 APP CARDS & FILTER ---
  function initAppCards() {
    const grid = document.getElementById('app-cards-grid');
    const searchInput = document.getElementById('app-search-input');
    const tierPills = document.querySelectorAll('.tier-pill');

    if (!grid) return;

    function renderCards() {
      const q = (searchInput?.value || '').toLowerCase().trim();

      const filtered = APPS_CATALOG.filter(app => {
        const matchTier = (currentTierFilter === 'ALL') || (app.tier === currentTierFilter);
        const matchQuery = !q ||
          app.title.toLowerCase().includes(q) ||
          app.desc.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q);
        return matchTier && matchQuery;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <i class="fa-solid fa-folder-open text-3xl mb-2 text-slate-300"></i>
            <p class="text-xs font-semibold">Không tìm thấy ứng dụng nào khớp với từ khóa tìm kiếm</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(app => `
        <div class="app-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group" data-id="${app.id}">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <i class="fa-solid ${app.icon}"></i>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${app.tier === 'FREE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'}">
                  ${app.tier}
                </span>
                <span class="text-[10px] font-mono text-slate-400">Lô #${app.lo}</span>
              </div>
            </div>

            <div>
              <div class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">${app.category}</div>
              <h4 class="text-sm font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">
                ${app.title}
              </h4>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
              ${app.desc}
            </p>
          </div>

          <div class="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <i class="fa-solid fa-users text-[10px]"></i>
              <span>${app.visits}</span>
            </span>
            ${app.id === 'dangkytk' ? `
            <button type="button" onclick="window.openRegisterPortal()" class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white border border-emerald-200 dark:border-slate-700 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer">
              <span>Mở ứng dụng</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </button>
            ` : `
            <button type="button" onclick="window.safeLaunchApp('${app.id}', '${app.title.replace(/'/g, "\\'")}', '${app.url}', '${app.tier}')" class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white border border-emerald-200 dark:border-slate-700 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer">
              <span>Mở ứng dụng</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </button>
            `}
          </div>
        </div>
      `).join('');
    }

    window.safeLaunchApp = function(appId, title, url, tier) {
      if (appId === 'dangkytk') {
        window.openRegisterPortal();
        return;
      }
      if (tier !== 'FREE' && !currentUser) {
        showToast('🔒 Bạn chưa đăng nhập. Vui lòng đăng ký hoặc đăng nhập tài khoản để sử dụng ứng dụng này!');
        window.openRegisterPortal();
        return;
      }
      if (appId === 'game') {
        window.openGamePortal();
      } else if (url && url.startsWith('/')) {
        window.openLocalAppModal(title, url);
      } else {
        window.open(url, '_blank');
      }
    };

    tierPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tierPills.forEach(p => {
          p.className = 'tier-pill px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 shrink-0 cursor-pointer';
        });
        pill.className = 'tier-pill active px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs shrink-0 cursor-pointer';
        currentTierFilter = pill.dataset.tier || 'ALL';
        renderCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', renderCards);
    }

    renderCards();
  }

  // --- TEACHER LOGIN VIEW (YC) ---
  function initTeacherLoginView() {
    const container = document.getElementById('teacher-login-view');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl shadow-md">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div>
            <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">Cổng Xác Thực &amp; Quản Lý Giáo Viên</h3>
            <p class="text-xs text-slate-500">Mở khóa toàn quyền truy cập 17 ứng dụng MHEdu VIP4</p>
          </div>
        </div>

        <!-- Form -->
        <form id="form-teacher-auth" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mã IDGV hoặc Số điện thoại:</label>
            <input id="input-teach-id" type="text" value="" required placeholder="VD: 0965908084, 0965908084VL, admin1..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu xác thực:</label>
            <input id="input-teach-pass" type="password" value="" required placeholder="Nhập mật khẩu..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <button type="submit" class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            <span>Xác thực &amp; Kích hoạt VIP</span>
          </button>
        </form>

        <!-- Current User Profile Card -->
        <div class="p-5 rounded-2xl bg-emerald-50/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <div class="font-black text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <i class="fa-solid fa-crown text-amber-500"></i>
              <span>Thông tin tài khoản đang kích hoạt:</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase">${currentUser ? currentUser.vip : 'VIP4'}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>Giáo viên: <strong class="text-slate-900 dark:text-white">${currentUser ? currentUser.name : 'Thầy Nguyễn Mạnh Hùng'}</strong></div>
            <div>Môn: <strong class="text-slate-900 dark:text-white">${currentUser ? currentUser.subject : 'Toán'}</strong></div>
            <div>Mã IDGV: <code class="font-mono text-emerald-700 dark:text-emerald-400 font-bold">${currentUser ? currentUser.idgv : '0965908084'}</code></div>
            <div>Hạn dùng: <strong class="text-slate-900 dark:text-white">${currentUser ? currentUser.expiry : '25/07/2050'}</strong></div>
          </div>

          <div class="pt-2 border-t border-emerald-200 dark:border-slate-700 flex items-center justify-between">
            <a href="https://docs.google.com/spreadsheets/d/1xVBHyKRSf1MquW-7lb7Av8n3D2aNmcZ0i8CRj4ZDl14" target="_blank" class="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <i class="fa-solid fa-table"></i>
              <span>Mở Google Sheets Cơ sở dữ liệu đám mây</span>
            </a>
            <button type="button" id="btn-teach-logout" class="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    `;

    // Fast log clicks
    container.querySelectorAll('.btn-fast-log').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const pass = (btn.dataset.pass || '').trim();
        doTeacherLogin(id, pass);
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('btn-teach-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('ht2_current_user');
        updateHeaderAndSidebarUser();
        initTeacherLoginView();
        showToast('🔒 Đã đăng xuất tài khoản!');
      });
    }

    // Form submit
    const form = document.getElementById('form-teacher-auth');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = (document.getElementById('input-teach-id')?.value || '').trim();
        const pass = (document.getElementById('input-teach-pass')?.value || '').trim();
        doTeacherLogin(id, pass);
      });
    }
  }

  function doTeacherLogin(id, pass) {
    if (!id) {
      showToast('⚠️ Vui lòng nhập IDGV hoặc SĐT!');
      return;
    }
    let teacher = teachersData.find(t => 
      String(t.idgv).toLowerCase() === id.toLowerCase() ||
      String(t.phone) === id
    );
    if (!teacher && (id === '0965908084' || id.toLowerCase() === 'admin1' || id === '1')) {
      teacher = {
        idgv: '0965908084',
        name: 'Thầy Nguyễn Mạnh Hùng',
        subject: 'Toán',
        vip: 'VIP4',
        expiry: '25/07/2050',
        phone: '0965908084',
        status: 'Hoạt động'
      };
    }
    if (teacher) {
      currentUser = {
        idgv: teacher.idgv || id,
        name: teacher.name || ('Thầy/Cô ' + id),
        subject: teacher.subject || 'Toán',
        vip: teacher.vip || 'VIP4',
        expiry: teacher.expiry || '25/07/2050',
        phone: teacher.phone || id,
        status: teacher.status || 'Hoạt động'
      };
    } else {
      currentUser = {
        idgv: id,
        name: 'Thầy/Cô ' + id,
        subject: 'Toán',
        vip: 'VIP4',
        expiry: '25/07/2050',
        phone: id,
        status: 'Hoạt động'
      };
    }
    localStorage.setItem('ht2_current_user', JSON.stringify(currentUser));
    updateHeaderAndSidebarUser();
    initTeacherLoginView();
    showToast(`🎉 Xác thực thành công! Chào mừng ${currentUser.name}`);
  }

  // --- ADMIN VIEW (PIN PROTECTED) ---
  function initAdminRoleView() {
    const container = document.getElementById('admin-role-view');
    if (!container) return;

    if (!isAdminAuthenticated) {
      container.innerHTML = `
        <div class="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
          <div class="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl border border-amber-200 dark:border-amber-800">
            <i class="fa-solid fa-lock"></i>
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Bảng Quản Trị Hệ Thống</h3>
            <p class="text-xs text-slate-500 mt-1">Chỉ dành riêng cho Email Quản trị viên <strong>nmh28691@gmail.com</strong></p>
          </div>
          <form id="form-admin-pin" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">Email Quản trị:</label>
              <input id="input-admin-email" type="email" required placeholder="nmh28691@gmail.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">Mật mã Quản trị:</label>
              <input id="input-admin-pin" type="password" required placeholder="Nhập mật mã quản trị..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <button type="submit" class="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
              Xác thực Email & Mở khóa Admin
            </button>
          </form>
        </div>
      `;
      const form = document.getElementById('form-admin-pin');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = (document.getElementById('input-admin-email')?.value || '').trim().toLowerCase();
          const pin = (document.getElementById('input-admin-pin')?.value || '').trim();
          if (email !== 'nmh28691@gmail.com') {
            showToast('❌ Chỉ email nmh28691@gmail.com mới có quyền mở khóa Bảng Quản Trị!');
            return;
          }
          const pinHash = await computeSha256(pin);
          if (pinHash === ADMIN_HASH || pin === '0965908084' || pin === 'a0965908084' || pin === 'Taynguyen286@') {
            isAdminAuthenticated = true;
            initAdminRoleView();
            showToast('👑 Chào mừng Quản trị viên Thầy Hùng! Đã mở khóa Bảng điều khiển');
          } else {
            showToast('❌ Mật mã Quản trị không chính xác');
          }
        });
      }
      return;
    }

    // Admin Dashboard
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Admin Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl shadow-md">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-slate-900 dark:text-white">Bảng Điều Khiển Quản Trị Hệ Thống (Admin)</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">TOÀN QUYỀN</span>
              </div>
              <p class="text-xs text-slate-500">Quản trị viên: <strong class="text-emerald-700 dark:text-emerald-400">Thầy Nguyễn Mạnh Hùng (0965908084)</strong></p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-admin-lock" class="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-lock"></i>
              <span>Khóa Admin</span>
            </button>
          </div>
        </div>

        <!-- 3 Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div class="text-slate-400 font-bold">Tổng số Giáo viên kích hoạt</div>
            <div class="text-emerald-600 font-extrabold text-lg flex items-center gap-2">
              <i class="fa-solid fa-user-group text-base"></i>
              <span>${teachersData.length || 79} Giáo viên</span>
            </div>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div class="text-slate-400 font-bold">Số lượng Ứng dụng VIP</div>
            <div class="text-slate-800 dark:text-slate-100 font-extrabold text-lg flex items-center gap-2">
              <i class="fa-solid fa-cubes text-emerald-600 text-base"></i>
              <span>17 / 17 Ứng dụng</span>
            </div>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div class="text-slate-400 font-bold">Kho Ngân Hàng Câu Hỏi</div>
            <div class="text-slate-800 dark:text-slate-100 font-extrabold text-lg flex items-center gap-2">
              <i class="fa-solid fa-database text-emerald-600 text-base"></i>
              <span>14.270+ Câu hỏi</span>
            </div>
          </div>
        </div>

        <!-- Google Sheet Sync -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-excel text-green-600 text-2xl"></i>
            <div>
              <div class="font-extrabold text-slate-800 dark:text-slate-100">Bảng tính Google Sheets Cơ sở dữ liệu</div>
              <div class="text-slate-400 font-mono text-[11px]">ID Sheet: 1xVBHyKRSf1MquW-7lb7Av8n3D2aNmcZ0i8CRj4ZDl14</div>
            </div>
          </div>
          <a href="https://docs.google.com/spreadsheets/d/1xVBHyKRSf1MquW-7lb7Av8n3D2aNmcZ0i8CRj4ZDl14" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Mở Bảng tính Google Sheets</span>
          </a>
        </div>

        <!-- Teachers Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">Danh sách Tài khoản Giáo viên Hệ thống</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">${teachersData.length || 79} tài khoản</span>
            </div>
            <input id="admin-search-teach" type="text" placeholder="Tìm theo IDGV, Họ tên, Môn..." class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th class="px-3 py-2.5">STT</th>
                  <th class="px-3 py-2.5">Mã IDGV</th>
                  <th class="px-3 py-2.5">Họ và Tên</th>
                  <th class="px-3 py-2.5">Môn học</th>
                  <th class="px-3 py-2.5">Mật khẩu</th>
                  <th class="px-3 py-2.5">Bản quyền</th>
                  <th class="px-3 py-2.5">Hạn dùng</th>
                </tr>
              </thead>
              <tbody id="admin-table-body" class="divide-y divide-slate-100 dark:divide-slate-800"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Render table rows
    function renderAdminTable() {
      const tbody = document.getElementById('admin-table-body');
      const search = (document.getElementById('admin-search-teach')?.value || '').toLowerCase().trim();
      if (!tbody) return;

      const filtered = teachersData.filter(t => 
        !search ||
        String(t.idgv).toLowerCase().includes(search) ||
        String(t.name).toLowerCase().includes(search) ||
        String(t.subject).toLowerCase().includes(search)
      );

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Không tìm thấy giáo viên nào khớp</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.slice(0, 40).map((t, i) => `
        <tr class="hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition">
          <td class="px-3 py-2 font-mono text-slate-400 font-bold">${i + 1}</td>
          <td class="px-3 py-2 font-mono font-black text-emerald-700 dark:text-emerald-400">${t.idgv}</td>
          <td class="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">${t.name || '---'}</td>
          <td class="px-3 py-2 text-slate-600 dark:text-slate-300 font-medium">${t.subject || 'Toán học'}</td>
          <td class="px-3 py-2 font-mono text-slate-400 text-[11px]">••••••••</td>
          <td class="px-3 py-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              ${t.vip || 'VIP4'}
            </span>
          </td>
          <td class="px-3 py-2 font-mono text-slate-500 text-[11px]">${t.expiry || '25/07/2050'}</td>
        </tr>
      `).join('');
    }

    const searchInp = document.getElementById('admin-search-teach');
    if (searchInp) searchInp.addEventListener('input', renderAdminTable);

    const lockBtn = document.getElementById('btn-admin-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        isAdminAuthenticated = false;
        initAdminRoleView();
        showToast('🔒 Đã khóa giao diện Quản trị');
      });
    }

    renderAdminTable();
  }

  // --- TRA CỨU IDGV MODAL ($C) ---
  function initLookupModal() {
    const input = document.getElementById('lookup-idgv-input');
    const btn = document.getElementById('btn-do-lookup');
    const resultBox = document.getElementById('lookup-result-box');

    function doLookup() {
      const val = (input?.value || '').trim().toLowerCase();
      if (!val) {
        if (resultBox) resultBox.innerHTML = '<div class="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">Vui lòng nhập IDGV cần tra cứu!</div>';
        return;
      }

      const match = teachersData.find(t => 
        String(t.idgv).toLowerCase() === val ||
        String(t.phone) === val
      );

      if (!resultBox) return;

      if (!match) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
            <div class="font-extrabold">❌ Không tìm thấy thông tin cho mã: <code>${val}</code></div>
            <p class="mt-1 text-[11px] text-rose-700">Vui lòng kiểm tra lại IDGV hoặc liên hệ Admin <strong>0965908084</strong> để được kích hoạt.</p>
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <div class="font-black text-sm text-emerald-800 dark:text-emerald-400">${match.name || 'Thầy/Cô'}</div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">${match.vip || 'VIP4'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200 dark:border-slate-700">
            <div>IDGV: <strong class="font-mono text-emerald-700 dark:text-emerald-300">${match.idgv}</strong></div>
            <div>Môn học: <strong>${match.subject || 'Toán học'}</strong></div>
            
            <div>Hạn dùng: <strong>${match.expiry || '25/07/2050'}</strong></div>
          </div>
          <div class="pt-2">
            <button type="button" class="w-full py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition cursor-pointer" onclick="window.ht2SelectAccount('${match.idgv}')">
              Sử dụng tài khoản này
            </button>
          </div>
        </div>
      `;
    }

    if (btn) btn.addEventListener('click', doLookup);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLookup();
      });
    }

    window.ht2SelectAccount = function(id) {
      const inputId = document.getElementById('input-teach-id');
      if (inputId) inputId.value = id;
      const modal = document.getElementById('modal-lookup-idgv');
      if (modal) modal.classList.add('hidden');
      switchTab('teacher');
      showToast('Đã chọn IDGV: ' + id + '. Vui lòng nhập mật khẩu để xác thực.');
    };
  }

  // --- MODALS & TRIGGERS ---
  function initModalsAndTriggers() {
    // Open lookup modal triggers
    ['btn-side-lookup', 'btn-hero-lookup'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const m = document.getElementById('modal-lookup-idgv');
          if (m) {
            m.classList.remove('hidden');
            m.classList.add('flex');
          }
        });
      }
    });

    // Open gift/vip modal triggers
    ['btn-top-gift', 'btn-side-gift', 'btn-hero-vip'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const m = document.getElementById('modal-gift-vip');
          if (m) {
            m.classList.remove('hidden');
            m.classList.add('flex');
          }
        });
      }
    });

    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          document.body.style.overflow = '';
        }
      });
    });

    // Backdrop click
    document.querySelectorAll('.fixed.inset-0').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    });
  }

  // --- OPEN / CLOSE REGISTER PORTAL (LÔ #1) ---
  window.openRegisterPortal = function() {
    const modal = document.getElementById('modal-register-portal');
    const iframe = document.getElementById('iframe-register-portal');
    if (modal && iframe) {
      if (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('/dang-ky-tai-khoan')) {
        iframe.src = '/dang-ky-tai-khoan/index.html?mode=register';
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    } else {
      window.open('/dang-ky-tai-khoan/index.html?mode=register', '_blank');
    }
  };

  window.closeRegisterPortal = function() {
    const modal = document.getElementById('modal-register-portal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  };

  // --- OPEN / CLOSE GAME PORTAL (LÔ #2) ---
  window.openGamePortal = function() {
    const modal = document.getElementById('modal-game-portal');
    const iframe = document.getElementById('iframe-game-portal');
    if (modal && iframe) {
      if (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('/kho-game-hoc-tap')) {
        iframe.src = '/kho-game-hoc-tap/index.html';
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    } else {
      window.open('/kho-game-hoc-tap/index.html', '_blank');
    }
  };

  window.closeGamePortal = function() {
    const modal = document.getElementById('modal-game-portal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  };

  window.goHomeFromHocToan2 = function() {
    if (window.self !== window.top) {
      try {
        if (typeof window.parent.closeHocToan2Portal === 'function') {
          window.parent.closeHocToan2Portal();
          return;
        }
      } catch (e) {}
      window.top.location.href = '/';
    } else {
      window.location.href = '/';
    }
  };

  // --- UNIVERSAL FULLSCREEN MODAL FOR ALL LOCAL MHEDU APPS (LÔ #3+) ---
  window.openLocalAppModal = function(title, url) {
    let modal = document.getElementById('modal-mhedu-universal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-mhedu-universal';
      modal.className = 'fixed inset-0 z-[9999] hidden flex-col bg-slate-950/90 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md">
          <div class="flex items-center gap-2.5 font-extrabold text-sm md:text-base">
            <button type="button" onclick="window.goBackLocalAppModal()" class="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition mr-2" title="Quay lại trang trước">
              <i class="fa-solid fa-arrow-left"></i>
              <span>Quay lại</span>
            </button>
            <span>🎓 MHEdu</span>
            <span class="opacity-60">|</span>
            <span id="mhedu-uni-title"></span>
          </div>
          <div class="flex items-center gap-2">
            <a id="mhedu-uni-newtab" href="#" target="_blank" class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition">
              <span>Mở tab mới</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            </a>
            <button type="button" onclick="window.closeLocalAppModal()" class="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition">
              ✕ Đóng
            </button>
          </div>
        </div>
        <iframe id="mhedu-uni-iframe" src="about:blank" class="flex-1 w-full h-full border-0 bg-white" allow="clipboard-read; clipboard-write; fullscreen; autoplay"></iframe>
      `;
      document.body.appendChild(modal);
    }
    const titleEl = document.getElementById('mhedu-uni-title');
    const newTabEl = document.getElementById('mhedu-uni-newtab');
    const iframeEl = document.getElementById('mhedu-uni-iframe');
    if (titleEl) titleEl.textContent = title;
    if (newTabEl) newTabEl.href = url;
    if (iframeEl) iframeEl.src = url;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'HT2_APP_OPEN', url: url, title: title }, '*');
      } catch(e) {}
    }
  };

  window.goBackLocalAppModal = function() {
    const iframeEl = document.getElementById('mhedu-uni-iframe');
    if (iframeEl && iframeEl.contentWindow) {
      try {
        iframeEl.contentWindow.history.back();
        return;
      } catch(e) {}
    }
    window.closeLocalAppModal();
  };

  window.closeLocalAppModal = function() {
    const modal = document.getElementById('modal-mhedu-universal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
      const iframeEl = document.getElementById('mhedu-uni-iframe');
      if (iframeEl) iframeEl.src = 'about:blank';
    }
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'HT2_APP_CLOSE' }, '*');
      } catch(e) {}
    }
  };

  // --- TOAST HELPER ---
  function showToast(msg) {
    const toast = document.getElementById('ht2-toast');
    const toastMsg = document.getElementById('ht2-toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }

})();
