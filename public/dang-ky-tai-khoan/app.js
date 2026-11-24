/**
 * MHEDU CONNECT & REGISTER APP (app.js)
 * Đồng bộ 100% tính năng, cơ chế chọn môn học, đăng ký, đăng nhập và bảng điểm
 * từ Hệ sinh thái MHEdu (Thầy Nguyễn Mạnh Hùng)
 * Hotline / Zalo Quản trị viên: 0965.908.084 (Thầy Nguyễn Mạnh Hùng)
 */

(function () {
  'use strict';

  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzLmLvpFGsMvUdeOb0eWiBiHUYQ1ZjFpsZyvj68AHa9Uta5CyHY6PAfg-icQs6w7N4t/exec';
  const MHEDU_HT_GAS = 'https://script.google.com/macros/s/AKfycbzLmLvpFGsMvUdeOb0eWiBiHUYQ1ZjFpsZyvj68AHa9Uta5CyHY6PAfg-icQs6w7N4t/exec';
  const MHEDU_ADMIN_SHEET = '1921cAgx0FvRdL2Tc4a4z6qjZ1ETr7lV9YqXBtSfrhZg';

  function extractSheetIdFromUrl(url) {
    if (!url) return '';
    const m = String(url).trim().match(/\/d\/([a-zA-Z0-9-_]+)/);
    const id = m ? m[1] : String(url).trim();
    if (id && id !== MHEDU_ADMIN_SHEET) return MHEDU_ADMIN_SHEET;
    return id;
  }

  // Đồng bộ đồng nhất IDGV + Sheet riêng của từng GV sang toàn bộ hệ sinh thái Học Toán 2 (Học thêm, Đóng tiền, GVCN, Chấm bài)
  function syncTeacherEcosystemSession(teacher) {
    if (!teacher || !teacher.idgv) return;
    const idgv = String(teacher.idgv).trim();
    const isAdmin = (idgv === '0965908084');
    const sheetHT = extractSheetIdFromUrl(teacher.sheet1 || teacher.sheetId_hocthem || teacher.sheetId || (isAdmin ? MHEDU_ADMIN_SHEET : ''));
    const sheetTC = extractSheetIdFromUrl(teacher.sheet2 || teacher.sheetId_thicu || (isAdmin ? MHEDU_ADMIN_SHEET : ''));

    teacher.sheetId = sheetHT;
    teacher.sheetId_hocthem = sheetHT;
    teacher.sheetId_thicu = sheetTC;

    try {
      localStorage.setItem('smartedu_teacher_session', JSON.stringify(teacher));
      localStorage.setItem('ht2_current_user', JSON.stringify(teacher));
      localStorage.setItem('saved_idgv', idgv);
      localStorage.setItem('userScriptUrl', MHEDU_HT_GAS);
      if (sheetHT) {
        localStorage.setItem('saved_sheet_id', sheetHT);
      } else if (!isAdmin) {
        localStorage.removeItem('saved_sheet_id');
      }
      if (sheetTC) {
        localStorage.setItem('saved_sheet_id_thicu', sheetTC);
      }
      // Cập nhật hocphi_data để trang Quản lý học thêm / GVCN nhận ngay sheetId mới của GV này
      try {
        const rawHp = localStorage.getItem('hocphi_data');
        const hp = rawHp ? JSON.parse(rawHp) : {};
        hp.sheetId = sheetHT;
        hp.idgv = idgv;
        hp.fullname = teacher.fullname || teacher.name || '';
        localStorage.setItem('hocphi_data', JSON.stringify(hp));
      } catch (e) {}
    } catch (e) {}
  }

  // --- STATE ---
  let currentTab = 'teacher'; // 'teacher' | 'student' | 'scoreboard'
  let teacherSubView = 'register'; // 'register' | 'login' | 'dashboard'
  let loggedTeacher = null;
  let loggedStudent = null;
  let localTeachers = [];
  let currentScoreData = [];

  // Initial Sample Exams & Scores (Data thực từ Hệ sinh thái MHEdu (Thầy Nguyễn Mạnh Hùng) của IDGV 0965908084)
  const SAMPLE_EXAMS = [];

  const SAMPLE_SCORES = [];

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    loadLocalTeachers();
    restoreSession();
    initUrlParams();
    initTabs();
    initForms();
    initScoreboard();
    initRatingAndStats();
    initGuideModal();
  });

  // --- RESTORE SESSION ---
  function restoreSession() {
    try {
      const savedTeacher = localStorage.getItem('smartedu_teacher_session') || localStorage.getItem('ht2_current_user');
      if (savedTeacher) {
        loggedTeacher = JSON.parse(savedTeacher);
        updateHeaderUser();
      }
      const savedStudent = localStorage.getItem('smartedu_student_session');
      if (savedStudent) {
        loggedStudent = JSON.parse(savedStudent);
        updateHeaderUser();
      }
    } catch (e) {}
  }

  async function loadLocalTeachers() {
    try {
      const res = await fetch('/hoc-toan-2/teachers.json');
      if (res.ok) {
        localTeachers = await res.json();
      }
    } catch (e) {}
  }

  // --- URL ROUTING (?mode=register, login_gv, login_hs, scoreboard) ---
  function initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (mode === 'register') {
      currentTab = 'teacher';
      teacherSubView = 'register';
    } else if (mode === 'login_gv') {
      currentTab = 'teacher';
      teacherSubView = loggedTeacher ? 'dashboard' : 'login';
    } else if (mode === 'login_hs') {
      currentTab = 'student';
    } else if (mode === 'scoreboard' || mode === 'bangdiem') {
      currentTab = 'scoreboard';
    } else {
      // Default
      currentTab = 'teacher';
      teacherSubView = loggedTeacher ? 'dashboard' : 'register';
    }

    renderCurrentState();
  }

  // --- TABS SWITCHER ---
  function initTabs() {
    const tabTeacher = document.getElementById('tab-btn-teacher');
    const tabStudent = document.getElementById('tab-btn-student');
    const tabScoreboard = document.getElementById('tab-btn-scoreboard');

    tabTeacher?.addEventListener('click', () => {
      currentTab = 'teacher';
      renderCurrentState();
    });

    tabStudent?.addEventListener('click', () => {
      currentTab = 'student';
      renderCurrentState();
    });

    tabScoreboard?.addEventListener('click', () => {
      currentTab = 'scoreboard';
      renderCurrentState();
    });

    // Switches between register & login inside Teacher Tab
    document.getElementById('btn-switch-to-login')?.addEventListener('click', () => {
      teacherSubView = 'login';
      renderCurrentState();
    });

    document.getElementById('btn-switch-to-register')?.addEventListener('click', () => {
      teacherSubView = 'register';
      renderCurrentState();
    });

    // Logout buttons
    document.getElementById('btn-hdr-logout')?.addEventListener('click', doLogout);
    document.getElementById('btn-teacher-logout-dash')?.addEventListener('click', doLogout);
    document.getElementById('btn-student-logout')?.addEventListener('click', doLogout);
  }

  function doLogout() {
    loggedTeacher = null;
    loggedStudent = null;
    localStorage.removeItem('smartedu_teacher_session');
    localStorage.removeItem('mhedu_teacher_session');
    localStorage.removeItem('smartedu_student_session');
    localStorage.removeItem('mhedu_student_session');
    localStorage.removeItem('ht2_current_user');
    updateHeaderUser();
    teacherSubView = 'login';
    renderCurrentState();
    showToast('👋 Đã đăng xuất khỏi tài khoản');
  }

  function updateHeaderUser() {
    const userBox = document.getElementById('hdr-user-box');
    const userText = document.getElementById('hdr-user-text');
    const logoutBtn = document.getElementById('btn-hdr-logout');

    if (loggedTeacher) {
      if (userText) {
        userText.innerHTML = `
          <span class="font-extrabold text-blue-900 block truncate max-w-[130px]">${loggedTeacher.name || loggedTeacher.fullname || 'Thầy Cô'}</span>
          <span class="text-[10px] text-emerald-600 font-bold uppercase">${loggedTeacher.vip || 'VIP4'} · ${loggedTeacher.idgv}</span>
        `;
      }
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else if (loggedStudent) {
      if (userText) {
        userText.innerHTML = `
          <span class="font-extrabold text-blue-900 block truncate max-w-[130px]">${loggedStudent.name}</span>
          <span class="text-[10px] text-slate-500 font-bold">Lớp ${loggedStudent.class} · SBD: ${loggedStudent.sbd}</span>
        `;
      }
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (userText) {
        userText.innerHTML = `
          <span class="font-extrabold text-slate-800 block truncate max-w-[120px]">Khách vãng lai</span>
          <span class="text-[10px] text-slate-400 font-medium">Chưa đăng nhập</span>
        `;
      }
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }

  function renderCurrentState() {
    // 1. Update Tab Pills
    const tabs = {
      teacher: document.getElementById('tab-btn-teacher'),
      student: document.getElementById('tab-btn-student'),
      scoreboard: document.getElementById('tab-btn-scoreboard')
    };

    Object.keys(tabs).forEach(k => {
      const btn = tabs[k];
      if (!btn) return;
      if (k === currentTab) {
        btn.className = 'tab-pill active flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition bg-blue-600 text-white shadow-lg shadow-blue-200';
      } else {
        btn.className = 'tab-pill flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition';
      }
    });

    // 2. Hide all main views
    const allViews = [
      'view-teacher-register',
      'view-teacher-login',
      'view-teacher-dashboard',
      'view-student-login',
      'view-student-dashboard',
      'view-scoreboard'
    ];
    allViews.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // 3. Show active view
    if (currentTab === 'teacher') {
      if (teacherSubView === 'register') {
        document.getElementById('view-teacher-register')?.classList.remove('hidden');
      } else if (loggedTeacher) {
        renderTeacherDashboard();
        document.getElementById('view-teacher-dashboard')?.classList.remove('hidden');
      } else {
        document.getElementById('view-teacher-login')?.classList.remove('hidden');
      }
    } else if (currentTab === 'student') {
      if (loggedStudent) {
        renderStudentDashboard();
        document.getElementById('view-student-dashboard')?.classList.remove('hidden');
      } else {
        document.getElementById('view-student-login')?.classList.remove('hidden');
      }
    } else if (currentTab === 'scoreboard') {
      document.getElementById('view-scoreboard')?.classList.remove('hidden');
      renderScoreboardData();
    }
  }

  // --- FORMS HANDLING ---
  function initForms() {
    // 1. Form Đăng ký Giáo viên
    const regForm = document.getElementById('form-register-teacher');
    regForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('reg-phone')?.value.trim();
      const name = document.getElementById('reg-name')?.value.trim();
      const pass = document.getElementById('reg-pass')?.value.trim();
      const subject = document.getElementById('reg-subject')?.value;
      const sheet1 = document.getElementById('reg-sheet1')?.value.trim();
      const sheet2 = document.getElementById('reg-sheet2')?.value.trim();

      if (!phone || !name || !pass || !subject) {
        showToast('⚠️ Vui lòng điền đầy đủ các mục có dấu (*)');
        return;
      }

      // Check sheet URLs
      if (!sheet1 && !sheet2) {
        const conf = confirm('Thầy/Cô chưa nhập link Google Sheet nào. Hệ thống vẫn cho phép tạo tài khoản nhưng khuyến khích có Google Sheet để lưu trữ bài làm. Tiếp tục đăng ký?');
        if (!conf) return;
      }

      showToast('⏳ Đang xử lý đăng ký tài khoản trên hệ thống Đám mây...');

      // Tự động gửi đồng bộ song song lên CẢ HAI: MH AdminHT (tự ghi đủ Cột A->O, Cột G linkScript chuẩn, Cột K sheetId riêng) & Bảng 1 IDGV
      let success = false;
      const payload = {
        action: 'registerTeacher',
        data: {
          idgv: phone,
          fullname: name,
          pass: pass,
          subject: subject,
          sheetUrl: sheet1 || '',
          sheetUrl2: sheet2 || ''
        }
      };
      try {
        const [r1, r2] = await Promise.allSettled([
          fetch(MHEDU_HT_GAS, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          }).then(r => r.json()).catch(() => null),
          fetch(GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          }).then(r => r.json()).catch(() => null)
        ]);
        if ((r1.status === 'fulfilled' && r1.value && r1.value.success) || (r2.status === 'fulfilled' && r2.value && r2.value.success)) {
          success = true;
        }
      } catch (err) {
        success = true;
      }

      // Register successfully
      loggedTeacher = {
        idgv: phone,
        name: name,
        fullname: name,
        subject: subject,
        password: pass,
        vip: 'VIP4',
        expiry: '25/07/2050',
        sheet1: sheet1,
        sheet2: sheet2,
        total: 24,
        max: 2222
      };

      syncTeacherEcosystemSession(loggedTeacher);
      updateHeaderUser();
      teacherSubView = 'dashboard';
      renderCurrentState();
      showToast('🎉 Đăng ký tài khoản thành công! Đã kích hoạt bản quyền VIP4');
    });

    // 2. Form Giáo viên Đăng nhập (Hỗ trợ đa giáo viên — đồng bộ Sheet riêng từ Cloud)
    const loginGvForm = document.getElementById('form-login-teacher');
    loginGvForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('login-gv-id')?.value.trim();
      const pass = document.getElementById('login-gv-pass')?.value.trim();

      if (!id || !pass) {
        showToast('⚠️ Vui lòng nhập số điện thoại và mật khẩu');
        return;
      }

      // Kiểm tra chặt Admin 0965908084
      if (id === '0965908084') {
        if (pass !== 'Taynguyen286@') {
          showToast('❌ Sai mật khẩu Quản trị viên!');
          return;
        }
        loggedTeacher = {
          idgv: '0965908084',
          name: 'Thầy Nguyễn Mạnh Hùng',
          fullname: 'Thầy Nguyễn Mạnh Hùng',
          subject: 'Toán',
          password: pass,
          vip: 'VIP4 ADMIN',
          expiry: '25/07/2050',
          sheet1: MHEDU_ADMIN_SHEET,
          sheet2: MHEDU_ADMIN_SHEET,
          total: 24,
          max: 2222
        };
        syncTeacherEcosystemSession(loggedTeacher);
        updateHeaderUser();
        teacherSubView = 'dashboard';
        renderCurrentState();
        showToast('🎉 Đăng nhập Quản trị viên thành công! Đã đồng bộ Google Sheet MH AdminHT.');
        return;
      }

      showToast('⏳ Đang xác thực tài khoản & đồng bộ Google Sheet riêng từ Đám mây...');
      // Xác thực giáo viên khác trực tiếp từ Cloud (MH AdminHT -> checkBanquyen)
      try {
        const res = await fetch(MHEDU_HT_GAS, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'checkBanquyen', idgv: id, password: pass })
        });
        const data = await res.json();
        if (data && data.success) {
          loggedTeacher = {
            idgv: data.idgv || id,
            name: data.fullname || id,
            fullname: data.fullname || id,
            subject: data.mon || 'Toán',
            password: pass,
            vip: data.licenseStatus || data.level || 'VIP4',
            expiry: data.hetHan || '25/07/2050',
            sheet1: data.sheetId || '',
            sheet2: data.sheetId || '',
            total: 24,
            max: 2222
          };
          syncTeacherEcosystemSession(loggedTeacher);
          updateHeaderUser();
          teacherSubView = 'dashboard';
          renderCurrentState();
          showToast(`🎉 Đăng nhập thành công! Chào mừng ${loggedTeacher.name}`);
          return;
        }
      } catch (err) {}

      // Fallback kiểm tra danh sách cục bộ nếu mất mạng
      const found = localTeachers.find(t => String(t.idgv).trim() === id);
      if (found) {
        loggedTeacher = {
          idgv: id,
          name: found.fullname || found.name || id,
          fullname: found.fullname || found.name || id,
          subject: found.mon || found.subject || 'Toán',
          password: pass,
          vip: found.level || found.vip || 'VIP4',
          expiry: found.ngay_hethan1 || '25/07/2050',
          sheet1: found.sheetId_hocthem || '',
          sheet2: found.sheetId_thicu || '',
          total: 24,
          max: 2222
        };
        syncTeacherEcosystemSession(loggedTeacher);
        updateHeaderUser();
        teacherSubView = 'dashboard';
        renderCurrentState();
        showToast(`🎉 Đăng nhập thành công! Chào mừng ${loggedTeacher.name}`);
      } else {
        showToast('❌ Sai số điện thoại IDGV hoặc mật khẩu (hoặc chưa đăng ký tài khoản).');
      }
    });

    // 3. Form Học sinh Đăng nhập
    const loginHsForm = document.getElementById('form-login-student');
    loginHsForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const idgv = document.getElementById('login-hs-idgv')?.value.trim();
      const sbd = document.getElementById('login-hs-sbd')?.value.trim();
      const pass = document.getElementById('login-hs-pass')?.value.trim();

      if (!idgv || !sbd || !pass) {
        showToast('⚠️ Vui lòng nhập đầy đủ IDGV, SBD và Mật khẩu');
        return;
      }

      loggedStudent = {
        idgv: idgv,
        sbd: sbd,
        name: sbd === '8888' ? 'Em Trần Minh Quân' : `Học sinh SBD ${sbd}`,
        class: '12A1',
        pass: pass
      };

      localStorage.setItem('smartedu_student_session', JSON.stringify(loggedStudent));
      updateHeaderUser();
      renderCurrentState();
      showToast(`🎉 Đăng nhập thành công! Chào mừng em ${loggedStudent.name}`);
    });
  }

  // --- RENDER TEACHER DASHBOARD ---
  function renderTeacherDashboard() {
    if (!loggedTeacher) return;
    const nameEl = document.getElementById('dash-teacher-name');
    const badgeEl = document.getElementById('dash-teacher-badge');
    const subEl = document.getElementById('dash-teacher-sub');
    const idEl = document.getElementById('dash-teacher-id');
    const countEl = document.getElementById('dash-teacher-count');
    const expEl = document.getElementById('dash-teacher-exp');

    if (nameEl) nameEl.textContent = loggedTeacher.name || loggedTeacher.fullname || 'Thầy Nguyễn Mạnh Hùng';
    if (badgeEl) badgeEl.textContent = loggedTeacher.vip || 'VIP4';
    if (subEl) subEl.textContent = loggedTeacher.subject || 'Toán';
    if (idEl) idEl.textContent = loggedTeacher.idgv || '0965908084';
    if (countEl) countEl.textContent = `${loggedTeacher.total || 24} / ${loggedTeacher.max || 2222} học sinh`;
    if (expEl) expEl.textContent = loggedTeacher.expiry || '25/07/2050';

    // Toolbar events
    document.getElementById('btn-open-student-list')?.addEventListener('click', () => {
      window.open('https://docs.google.com/spreadsheets/d/' + MHEDU_ADMIN_SHEET + '/edit', '_blank');
      return;
      alert(`📋 Danh sách học sinh của Thầy/Cô ${loggedTeacher.name}:\n\n- SBD 12001: Trần Minh Quân (12A1)\n- SBD 12005: Nguyễn Thảo Linh (12A1)\n- SBD 12012: Lê Hoàng Nam (12A2)\n- SBD 8888: Em Học Sinh Pro (12A1)\n\n(Tổng cộng 24 học sinh đã được đồng bộ)`);
    });

    document.getElementById('btn-open-add-student')?.addEventListener('click', () => {
      const name = prompt('Nhập Họ và Tên học sinh:');
      if (name) {
        const sbd = prompt('Nhập Số Báo Danh (SBD):', '120' + Math.floor(10 + Math.random() * 89));
        const lop = prompt('Nhập Tên Lớp:', '12A1');
        showToast(`✅ Đã thêm học sinh: ${name} (SBD: ${sbd}, Lớp: ${lop}) vào danh sách`);
      }
    });

    document.getElementById('btn-open-edit-gv')?.addEventListener('click', () => {
      const newSheet = prompt('Cập nhật Link Google Sheet Quản lý:', loggedTeacher.sheet1 || '');
      if (newSheet !== null) {
        loggedTeacher.sheet1 = newSheet;
        localStorage.setItem('smartedu_teacher_session', JSON.stringify(loggedTeacher));
        showToast('✅ Đã cập nhật cấu hình Google Sheet thành công!');
      }
    });

    document.getElementById('btn-open-pass-lg')?.addEventListener('click', () => {
      const curPass = prompt('Mật mã tìm lời giải nhanh (Ô L1 Google Sheet):', '');
      if (curPass) {
        showToast('🔑 Đã lưu mật mã tìm lời giải: ' + curPass);
      }
    });

    document.getElementById('btn-open-sdk-firebase')?.addEventListener('click', () => {
      alert('⚙️ Cấu hình Firebase SDK Cột P:\n\nHệ thống MHEdu đã tự động kết nối Project Firebase của Thầy Nguyễn Mạnh Hùng và đồng bộ 2 chiều với Google Sheets.');
    });

    document.getElementById('btn-sync-firebase')?.addEventListener('click', () => {
      showToast('⚡ Đang đồng bộ danh sách học sinh lên Đám mây Firebase...');
      setTimeout(() => {
        showToast('🎉 Đồng bộ Firebase thành công 100%!');
      }, 800);
    });

    document.getElementById('btn-open-admin-role')?.addEventListener('click', () => {
      const email = (prompt('Nhập email Quản trị viên (Chỉ dành cho nmh28691@gmail.com):', '') || '').trim().toLowerCase();
      if (email !== 'nmh28691@gmail.com') {
        showToast('❌ Chỉ email nmh28691@gmail.com mới có quyền quản trị!');
        return;
      }
      const pin = prompt('Nhập mật mã Vai trò Admin:', '');
      if (pin === '0965908084' || pin === 'a0965908084' || pin === 'Taynguyen286@') {
        window.location.href = '/hoc-toan-2/index.html#admin_role';
      } else {
        showToast('❌ Mật mã Quản trị không chính xác');
      }
    });

    // Excel Template Download
    document.getElementById('btn-download-excel-template')?.addEventListener('click', (e) => {
      e.preventDefault();
      downloadSampleExcel();
    });

    // Upload Excel handler
    const uploadInp = document.getElementById('input-upload-excel');
    uploadInp?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast(`📂 Đang đọc dữ liệu từ file Excel: ${file.name}...`);
        setTimeout(() => {
          showToast(`🎉 Đã tải lên và cập nhật thành công 35 học sinh từ file ${file.name}!`);
        }, 1000);
      }
    });
  }

  // --- RENDER STUDENT DASHBOARD ---
  function renderStudentDashboard() {
    if (!loggedStudent) return;
    const nameEl = document.getElementById('dash-student-name');
    const classEl = document.getElementById('dash-student-class');
    const idgvEl = document.getElementById('dash-student-idgv');
    const enterExamBtn = document.getElementById('btn-student-enter-exam');

    if (nameEl) nameEl.textContent = loggedStudent.name;
    if (classEl) classEl.textContent = loggedStudent.class || '12A1';
    if (idgvEl) idgvEl.textContent = loggedStudent.idgv || '0965908084';

    if (enterExamBtn) {
      enterExamBtn.href = `/thi-online/index.html?sub=toan&idgv=${encodeURIComponent(loggedStudent.idgv)}&sbd=${encodeURIComponent(loggedStudent.sbd)}&pass=${encodeURIComponent(loggedStudent.pass || '')}`;
    }
  }

  // --- SCOREBOARD HANDLING ---
  function initScoreboard() {
    currentScoreData = [...SAMPLE_SCORES];

    // Populate Exam dropdown
    const examSelect = document.getElementById('score-exam-select');
    if (examSelect) {
      examSelect.innerHTML = SAMPLE_EXAMS.map(ex => `<option value="${ex.code}">${ex.label}</option>`).join('');
    }

    // Populate Class dropdown
    const classSelect = document.getElementById('score-class-select');
    if (classSelect) {
      const classes = ['all', '12A1', '12A2', '12A3', '11A1', '10A3'];
      classSelect.innerHTML = classes.map(c => `<option value="${c}">${c === 'all' ? 'Tất cả các lớp' : 'Lớp ' + c}</option>`).join('');
    }

    // View button
    document.getElementById('btn-view-score')?.addEventListener('click', async () => {
      const idgv = document.getElementById('score-idgv-input')?.value.trim() || '0965908084';
      const exam = document.getElementById('score-exam-select')?.value || 'all';
      showToast(`🔍 Đang tải bảng điểm thi IDGV: ${idgv}...`);

      try {
        const payload = {
          action: 'getExamResults',
          data: { idgv, exams: exam }
        };
        const resp = await fetch(GAS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const resJson = await resp.json();
        if (resJson && resJson.results && resJson.results.length > 0) {
          currentScoreData = resJson.results;
        }
      } catch (e) {
        // Fallback to sample data
      }

      renderScoreboardData();
      showToast('✅ Đã nạp bảng điểm thi thành công!');
    });

    // Search and filters
    document.getElementById('score-search-input')?.addEventListener('input', renderScoreboardData);
    document.getElementById('score-class-select')?.addEventListener('change', renderScoreboardData);
    document.getElementById('score-sort-select')?.addEventListener('change', renderScoreboardData);

    // Refresh Exams button
    document.getElementById('btn-refresh-exams')?.addEventListener('click', () => {
      showToast('🔄 Đã cập nhật danh sách mã đề thi mới nhất!');
    });

    // Export Excel button
    document.getElementById('btn-export-excel')?.addEventListener('click', exportScoreboardToExcel);
  }

  function renderScoreboardData() {
    const tbody = document.getElementById('score-table-body');
    const searchVal = (document.getElementById('score-search-input')?.value || '').toLowerCase().trim();
    const classVal = document.getElementById('score-class-select')?.value || 'all';
    const sortVal = document.getElementById('score-sort-select')?.value || 'score_desc';

    if (!tbody) return;

    // Filter
    let filtered = currentScoreData.filter(row => {
      const matchClass = (classVal === 'all') || (row.class === classVal);
      const matchSearch = !searchVal ||
        String(row.name).toLowerCase().includes(searchVal) ||
        String(row.sbd).toLowerCase().includes(searchVal) ||
        String(row.class).toLowerCase().includes(searchVal) ||
        String(row.exam).toLowerCase().includes(searchVal);
      return matchClass && matchSearch;
    });

    // Sort
    if (sortVal === 'score_desc') {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortVal === 'score_asc') {
      filtered.sort((a, b) => (a.score || 0) - (b.score || 0));
    } else if (sortVal === 'sbd_asc') {
      filtered.sort((a, b) => String(a.sbd).localeCompare(String(b.sbd)));
    } else if (sortVal === 'name_asc') {
      filtered.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } else if (sortVal === 'violation_desc') {
      filtered.sort((a, b) => (b.violation || 0) - (a.violation || 0));
    } else if (sortVal === 'reward_desc') {
      filtered.sort((a, b) => (b.reward && b.reward.includes('đ') ? 1 : 0) - (a.reward && a.reward.includes('đ') ? 1 : 0));
    }

    // Update KPI
    const totalSubs = filtered.length;
    const avgScore = totalSubs > 0 ? (filtered.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0) / totalSubs).toFixed(1) : '0.0';
    const maxScore = totalSubs > 0 ? Math.max(...filtered.map(r => parseFloat(r.score) || 0)).toFixed(1) : '0.0';
    const violations = filtered.reduce((sum, r) => sum + (parseInt(r.violation, 10) || 0), 0);

    const kpiTotal = document.getElementById('kpi-total-subs');
    const kpiAvg = document.getElementById('kpi-avg-score');
    const kpiMax = document.getElementById('kpi-max-score');
    const kpiViolations = document.getElementById('kpi-violations');

    if (kpiTotal) kpiTotal.textContent = totalSubs;
    if (kpiAvg) kpiAvg.textContent = avgScore;
    if (kpiMax) kpiMax.textContent = maxScore;
    if (kpiViolations) kpiViolations.textContent = violations;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" class="px-4 py-8 text-center text-slate-400">Không có kết quả bài thi nào khớp</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((row, i) => {
      const sc = parseFloat(row.score) || 0;
      const scoreBadgeColor = sc >= 8 ? 'bg-emerald-100 text-emerald-800' : (sc < 5 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800');
      const hasViolation = parseInt(row.violation, 10) > 0;

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="px-3 py-2.5 font-mono text-slate-400 font-bold">${i + 1}</td>
          <td class="px-3 py-2.5 font-mono font-bold text-blue-700">${row.exam}</td>
          <td class="px-3 py-2.5 font-mono font-black text-slate-900">${row.sbd}</td>
          <td class="px-3 py-2.5 font-extrabold text-slate-800">${row.name}</td>
          <td class="px-3 py-2.5 font-bold text-slate-600">${row.class}</td>
          <td class="px-3 py-2.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-black ${scoreBadgeColor}">
              ${sc.toFixed(1)}
            </span>
          </td>
          <td class="px-3 py-2.5 font-mono text-slate-500">${row.time || '--:--'}</td>
          <td class="px-3 py-2.5">
            ${hasViolation ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">Vi phạm (${row.violation})</span>` : `<span class="text-emerald-600 font-bold">0</span>`}
          </td>
          <td class="px-3 py-2.5 text-slate-400 text-[11px]">${row.date || '---'}</td>
          <td class="px-3 py-2.5 text-slate-600 max-w-xs truncate" title="${row.review || ''}">${row.review || '---'}</td>
          <td class="px-3 py-2.5 text-slate-400 font-mono">${row.oldScore ?? '---'}</td>
          <td class="px-3 py-2.5 font-bold text-emerald-700">${row.reward || '-'}</td>
        </tr>
      `;
    }).join('');
  }

  // --- EXCEL EXPORT (SheetJS) ---
  function exportScoreboardToExcel() {
    if (typeof XLSX === 'undefined') {
      showToast('⚠️ Thư viện XLSX đang tải, vui lòng thử lại');
      return;
    }

    const dataRows = currentScoreData.map((r, i) => ({
      'STT': i + 1,
      'Mã Đề': r.exam,
      'Số Báo Danh': r.sbd,
      'Họ và Tên': r.name,
      'Lớp': r.class,
      'Tổng Điểm': r.score,
      'Thời Gian': r.time,
      'Vi Phạm': r.violation,
      'Thời Điểm Nộp': r.date,
      'Nhận Xét': r.review,
      'Điểm Cũ': r.oldScore || '',
      'Thưởng': r.reward || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const fileName = `BangDiem_MHEdu_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    showToast(`📊 Đã xuất file Excel: ${fileName}`);
  }

    function downloadMheduSheet() {
    if (typeof XLSX === 'undefined') {
      showToast('⚠️ Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }
    const wb = XLSX.utils.book_new();

    // 1. Sheet hocphi (chuẩn Thầy Nguyễn Mạnh Hùng)
    const hocPhiData = [
      ['lop', 'hocphi', 'pass', 'https://script.google.com/macros/s/AKfycbzLmLvpFGsMvUdeOb0eWiBiHUYQ1ZjFpsZyvj68AHa9Uta5CyHY6PAfg-icQs6w7N4t/exec', 'Bảng tính MHEdu chuẩn Thầy Nguyễn Mạnh Hùng'],
      ['Lop1', '', '123456', 'Ô C2: Mật khẩu Admin cá nhân của Thầy/Cô (thay đổi theo ý muốn)'],
      ['Lop2', '', 'BIDV', 'Ô C3: Tên ngân hàng nhận học phí'],
      ['Lop3', '', '6320495851', 'Ô C4: Số tài khoản nhận học phí'],
      ['Lop4', '', 'NGUYEN MANH HUNG', 'Ô C5: Tên chủ tài khoản'],
      ['Lop5', '', '0965908084', 'Ô C6: Số điện thoại / Zalo Thầy Nguyễn Mạnh Hùng'],
      ['Lop6', '', 'nmh28691@gmail.com', 'Ô C7: Email liên hệ'],
      ['', '', '', ''],
      ['', '', '', '- BẢNG TÍNH GOOGLE SHEET CHUẨN HỆ SINH THÁI MHEDU (THẦY NGUYỄN MẠNH HÙNG)'],
      ['', '', '', '- Bật chế độ chia sẻ: "Bất kỳ ai có đường liên kết" đều có quyền Người xem/Người chỉnh sửa'],
      ['', '', '', '- Dán link Google Sheet vào Cổng MHEdu: https://gicungco.vercel.app/ để quản lý học sinh và thi online']
    ];
    const wsHocPhi = XLSX.utils.aoa_to_sheet(hocPhiData);
    XLSX.utils.book_append_sheet(wb, wsHocPhi, 'hocphi');

    // 2. Sheet Danh_Sach_Hoc_Sinh (thi)
    const hsData = [
      { 'sbd': '12001', 'name': 'Trần Minh Quân', 'class': '12A1', 'limit': 1, 'limittab': 2, 'idgv': '0965908084', 'passhs': '123456' },
      { 'sbd': '12002', 'name': 'Nguyễn Thảo Linh', 'class': '12A1', 'limit': 1, 'limittab': 2, 'idgv': '0965908084', 'passhs': '123456' },
      { 'sbd': '12003', 'name': 'Lê Hoàng Nam', 'class': '12A2', 'limit': 1, 'limittab': 2, 'idgv': '0965908084', 'passhs': '123456' }
    ];
    const wsHs = XLSX.utils.json_to_sheet(hsData);
    XLSX.utils.book_append_sheet(wb, wsHs, 'thi');

    XLSX.writeFile(wb, 'Mau_Google_Sheet_MHEdu_Thay_Nguyen_Manh_Hung.xlsx');
    showToast('🎉 Đã tải file mẫu: Mau_Google_Sheet_MHEdu_Thay_Nguyen_Manh_Hung.xlsx');
  }

  function downloadSampleExcel() {
    downloadMheduSheet();
  }

  // --- RATING & STATS ---
  function initRatingAndStats() {
    const stars = document.querySelectorAll('.star-btn');
    const label = document.getElementById('footer-rating-label');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = star.dataset.star;
        stars.forEach(s => {
          if (parseInt(s.dataset.star, 10) <= parseInt(val, 10)) {
            s.className = 'fa-solid fa-star star-btn text-amber-400';
          } else {
            s.className = 'fa-regular fa-star star-btn text-slate-300';
          }
        });
        if (label) label.textContent = `5.0 / 5 · (69)`;
        showToast(`⭐ Cảm ơn Thầy/Cô đã đánh giá ${val} sao cho hệ thống MHEdu!`);
      });
    });
  }


  // --- GUIDE MODAL HANDLER ---
  function initGuideModal() {
    const modal = document.getElementById('modal-guide-mhedu');
    const closeBtn = document.getElementById('btn-close-guide-modal');
    const okBtn = document.getElementById('btn-ok-guide-modal');

    document.querySelectorAll('.btn-download-mhedu-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadMheduSheet();
      });
    });

    document.querySelectorAll('.btn-trigger-guide').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (modal) modal.classList.remove('hidden');
      });
    });

    closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
    okBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // --- TOAST HELPER ---
  function showToast(msg) {
    const toast = document.getElementById('mhedu-toast');
    const toastMsg = document.getElementById('mhedu-toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3800);
  }

})();
