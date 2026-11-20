/**
 * HỆ THỐNG XÁC THỰC & PHÂN QUYỀN TÀI KHOẢN (EY AUTH & ROLE MANAGER)
 * - Quản trị viên duy nhất: Thầy Nguyễn Mạnh Hùng (nmh28691@gmail.com)
 * - Giáo viên: Đăng nhập bằng Email, tự động lưu & khôi phục Gemini API Key từ Đám mây Google Sheets
 * - Học sinh: Đăng nhập bằng Mã Học Sinh (ID) + Mã PIN
 */

(function (window) {
  'use strict';

  const ADMIN_EMAIL = 'nmh28691@gmail.com';
  const STORAGE_KEY_SESSION = 'ey_v2_auth_session';
  const STORAGE_KEY_CLASSES = 'ey_v2_classes';

  const DEFAULT_CLASSES = [
    {
      id: 'class_default_1',
      name: 'Chơi thử - THPT Lê Hồng Phong',
      grade: '12',
      schoolYear: '2025 - 2026',
      createdAt: 1710000000000,
      students: [
        { id: '10011634', name: 'Đinh Tuấn Kiệt', pin: '070720', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011635', name: 'Nguyễn Minh An', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011636', name: 'Trần Bảo Châu', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011637', name: 'Lê Gia Huy', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011638', name: 'Phạm Thùy Linh', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011639', name: 'Hoàng Đức Mạnh', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011640', name: 'Vũ Khánh Ngân', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011641', name: 'Đặng Quốc Phong', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011642', name: 'Bùi Thu Quỳnh', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011643', name: 'Đỗ Hải Sơn', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011644', name: 'Ngô Phương Thảo', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011645', name: 'Dương Anh Tuấn', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011646', name: 'Lý Bảo Vy', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011647', name: 'Huỳnh Ngọc Hân', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011648', name: 'Phan Nhật Minh', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011649', name: 'Võ Thanh Trúc', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011650', name: 'Hồ Gia Bảo', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' },
        { id: '10011651', name: 'Trịnh Mai Anh', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011652', name: 'Lâm Khánh Linh', pin: '123456', gender: 'nu', avatar: '👧', classId: 'class_default_1' },
        { id: '10011653', name: 'Mai Đức Anh', pin: '123456', gender: 'nam', avatar: '👦', classId: 'class_default_1' }
      ]
    }
  ];

  class EyAuthService {
    constructor() {
      this.initDefaultData();
      window.addEventListener('smartedu:cloud-synced', () => {
        this.syncHeaderUserBadge();
      });
    }

    initDefaultData() {
      try {
        const rawClasses = localStorage.getItem(STORAGE_KEY_CLASSES);
        if (!rawClasses) {
          localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(DEFAULT_CLASSES));
        } else {
          const parsed = JSON.parse(rawClasses);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(DEFAULT_CLASSES));
          }
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(DEFAULT_CLASSES));
      }

      // Đồng bộ từ smartedu_auth_user nếu có
      try {
        const mainUser = JSON.parse(localStorage.getItem('smartedu_auth_user') || 'null');
        const rawSession = localStorage.getItem(STORAGE_KEY_SESSION);
        if (mainUser && mainUser.email && !rawSession) {
          const cleanEmail = String(mainUser.email).toLowerCase().trim();
          const role = cleanEmail === ADMIN_EMAIL ? 'admin' : (mainUser.role === 'student' ? 'student' : 'teacher');
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
            role,
            name: mainUser.name || (cleanEmail === ADMIN_EMAIL ? 'Thầy Nguyễn Mạnh Hùng' : cleanEmail.split('@')[0]),
            email: cleanEmail,
            studentId: mainUser.studentId,
            classId: mainUser.classId,
            className: mainUser.grade,
            status: 'approved',
            loginTime: Date.now()
          }));
        } else if (rawSession) {
          const sess = JSON.parse(rawSession);
          // Chuẩn hóa: chỉ nmh28691@gmail.com mới có quyền admin
          if (sess && sess.email) {
            const cleanEmail = String(sess.email).toLowerCase().trim();
            if (cleanEmail === 'hungvd286@gmail.com') {
              sess.email = ADMIN_EMAIL;
              sess.role = 'admin';
              localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sess));
            } else if (sess.role === 'admin' && cleanEmail !== ADMIN_EMAIL) {
              sess.role = 'teacher';
              localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sess));
            }
          }
        }
      } catch (e) {}
    }

    getSession() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSION);
        if (raw) {
          const sess = JSON.parse(raw);
          if (sess && sess.email) {
            const cleanEm = String(sess.email).toLowerCase().trim();
            if (cleanEm === ADMIN_EMAIL && sess.role !== 'student') {
              sess.role = 'admin';
            } else if (sess.role === 'admin' && cleanEm !== ADMIN_EMAIL) {
              sess.role = 'teacher';
            }
          }
          return sess;
        }
      } catch (e) {}

      // Fallback đọc từ smartedu_auth_user
      try {
        const mainUser = JSON.parse(localStorage.getItem('smartedu_auth_user') || 'null');
        if (mainUser && (mainUser.email || mainUser.username)) {
          const em = String(mainUser.email || '').toLowerCase().trim();
          const role = em === ADMIN_EMAIL ? 'admin' : (mainUser.role === 'student' ? 'student' : 'teacher');
          return {
            role,
            name: mainUser.name || 'Giáo viên',
            email: em,
            studentId: mainUser.studentId || (role === 'student' ? '10011634' : undefined),
            status: 'approved'
          };
        }
      } catch (e) {}

      return {
        role: 'teacher',
        name: 'Khách (Chưa đăng nhập)',
        email: '',
        status: 'guest'
      };
    }

    setSession(sessionData) {
      const cleanEmail = String(sessionData.email || '').toLowerCase().trim();
      if (sessionData.role !== 'student') {
        sessionData.role = (cleanEmail === ADMIN_EMAIL) ? 'admin' : 'teacher';
      }
      sessionData.email = cleanEmail;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));

      // Đồng bộ sang smartedu_auth_user của trang chủ
      try {
        const mainUser = {
          id: sessionData.studentId || ('u_' + (cleanEmail || Date.now())),
          username: cleanEmail ? cleanEmail.split('@')[0] : (sessionData.studentId || 'user'),
          name: sessionData.name || (cleanEmail === ADMIN_EMAIL ? 'Thầy Nguyễn Mạnh Hùng' : 'Giáo viên'),
          role: sessionData.role,
          email: cleanEmail,
          studentId: sessionData.studentId,
          classId: sessionData.classId,
          grade: sessionData.className,
          school: sessionData.school || 'THPT Số 1 Lê Hồng Phong',
          avatar: sessionData.role === 'admin' ? '👑' : (sessionData.role === 'student' ? '👨‍🎓' : '👨‍🏫')
        };
        localStorage.setItem('smartedu_auth_user', JSON.stringify(mainUser));
        localStorage.setItem('user_role', sessionData.role);
      } catch (e) {}

      this.syncHeaderUserBadge();
      window.dispatchEvent(new CustomEvent('ey:auth-change', { detail: sessionData }));
    }

    syncHeaderUserBadge() {
      try {
        const sess = this.getSession();
        const nameEl = document.querySelector('.sidebar-footer .user-name');
        const roleEl = document.querySelector('.sidebar-footer .user-role');
        if (nameEl) {
          nameEl.textContent = sess.name || 'Giáo viên';
        }
        if (roleEl) {
          if (sess.role === 'student') {
            roleEl.textContent = `HS · Mã: ${sess.studentId || ''}`;
          } else if (sess.role === 'admin') {
            roleEl.textContent = `👑 Admin · ${ADMIN_EMAIL}`;
          } else {
            roleEl.textContent = sess.email || 'Chưa đăng nhập Email';
          }
        }
      } catch (e) {}
    }

    isTeacher() {
      const s = this.getSession();
      return s.role === 'teacher' || s.role === 'admin';
    }

    isAdmin() {
      const s = this.getSession();
      return s.role === 'admin' && String(s.email || '').toLowerCase().trim() === ADMIN_EMAIL;
    }

    isApprovedTeacher() {
      const s = this.getSession();
      if (this.isAdmin()) return true;
      return s.role === 'teacher' && s.status !== 'pending' && !!s.email;
    }

    isStudent() {
      return this.getSession().role === 'student';
    }

    switchRole(role) {
      const current = this.getSession();
      if (role === 'student') {
        const classes = this.getClasses();
        const firstClass = classes[0] || DEFAULT_CLASSES[0];
        const firstStudent = (firstClass.students && firstClass.students[0]) || DEFAULT_CLASSES[0].students[0];
        this.setSession({
          role: 'student',
          studentId: firstStudent.id,
          name: firstStudent.name,
          classId: firstClass.id,
          className: firstClass.name,
          avatar: firstStudent.avatar || '👦',
          previousTeacherEmail: current.email || '',
          previousTeacherName: current.name || '',
          loginTime: Date.now()
        });
        return;
      }

      if (role === 'admin') {
        const checkEmail = String(current.email || current.previousTeacherEmail || '').toLowerCase().trim();
        if (checkEmail !== ADMIN_EMAIL) {
          alert('🔒 Quyền Quản trị viên (Admin) chỉ dành riêng cho Thầy Nguyễn Mạnh Hùng (' + ADMIN_EMAIL + ').\nVui lòng đăng nhập bằng email: ' + ADMIN_EMAIL);
          this.openLoginModal('teacher', ADMIN_EMAIL);
          return;
        }
        this.setSession({
          role: 'admin',
          name: 'Thầy Nguyễn Mạnh Hùng (Admin)',
          email: ADMIN_EMAIL,
          status: 'approved',
          loginTime: Date.now()
        });
        return;
      }

      // Chuyển sang Giáo viên: bắt buộc phải có email giáo viên đã đăng nhập
      const teacherEmail = String(current.email || current.previousTeacherEmail || '').toLowerCase().trim();
      if (!teacherEmail || !teacherEmail.includes('@')) {
        this.openLoginModal('teacher');
        return;
      }

      const finalRole = teacherEmail === ADMIN_EMAIL ? 'admin' : 'teacher';
      this.setSession({
        role: finalRole,
        name: current.previousTeacherName || current.name || (finalRole === 'admin' ? 'Thầy Nguyễn Mạnh Hùng' : teacherEmail.split('@')[0]),
        email: teacherEmail,
        status: 'approved',
        loginTime: Date.now()
      });
    }

    getClasses() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
        const list = raw ? JSON.parse(raw) : DEFAULT_CLASSES;
        return (Array.isArray(list) ? list : DEFAULT_CLASSES).map(c => ({
          ...c,
          code: c.code || String(c.id || 'MZYKZF').slice(-6).toUpperCase(),
          studentCount: Array.isArray(c.students) ? c.students.length : 0
        }));
      } catch (e) {
        return DEFAULT_CLASSES;
      }
    }

    getAllClasses() {
      return this.getClasses();
    }

    getAllStudents() {
      const classes = this.getClasses();
      const all = [];
      classes.forEach(cls => {
        if (Array.isArray(cls.students)) {
          cls.students.forEach(s => {
            all.push({ ...s, classId: cls.id, className: cls.name });
          });
        }
      });
      return all;
    }

    getStudentsByClass(classId) {
      const cls = this.getClassById(classId);
      return (cls && Array.isArray(cls.students)) ? cls.students : [];
    }

    createClass(name, grade = 'Khối 10') {
      const classes = this.getClasses();
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      const newClass = {
        id: 'class_' + Date.now().toString(36),
        name: String(name || 'Lớp mới').trim(),
        grade: grade,
        code: code,
        schoolYear: '2025 - 2026',
        createdAt: Date.now(),
        students: []
      };
      classes.push(newClass);
      this.saveClasses(classes);
      return newClass;
    }

    deleteClass(classId) {
      let classes = this.getClasses().filter(c => c.id !== classId);
      if (classes.length === 0) classes = [...DEFAULT_CLASSES];
      this.saveClasses(classes);
      return true;
    }

    addStudentsBatch(classId, namesList) {
      const classes = this.getClasses();
      const cls = classes.find(c => c.id === classId) || classes[0];
      if (!cls) return [];
      if (!Array.isArray(cls.students)) cls.students = [];

      const existingIds = new Set(this.getAllStudents().map(s => String(s.id)));
      const added = [];
      (namesList || []).forEach((rawName, idx) => {
        const cleanName = String(rawName || '').trim();
        if (!cleanName) return;
        let newId = String(10011654 + existingIds.size + idx);
        while (existingIds.has(newId)) {
          newId = String(Math.floor(10000000 + Math.random() * 89999999));
        }
        existingIds.add(newId);
        const pin = String(Math.floor(100000 + Math.random() * 900000));
        const isFemale = /\b(Thị|Hương|Lan|Linh|Ngọc|Châu|Quỳnh|Thảo|Vy|Hân|Trúc|Anh|Duyên|Nguyên|Yến|Hà|Diệp|Vân|Chi|Thư|Mai|Hằng)\b/i.test(cleanName);
        const studentObj = {
          id: newId,
          name: cleanName,
          pin: pin,
          gender: isFemale ? 'nu' : 'nam',
          avatar: isFemale ? '👧' : '👦',
          classId: cls.id
        };
        cls.students.push(studentObj);
        added.push(studentObj);
      });

      this.saveClasses(classes);
      return added;
    }

    resetStudentPin(studentId) {
      const classes = this.getClasses();
      const newPin = String(Math.floor(100000 + Math.random() * 900000));
      classes.forEach(cls => {
        if (Array.isArray(cls.students)) {
          const st = cls.students.find(s => String(s.id) === String(studentId));
          if (st) st.pin = newPin;
        }
      });
      this.saveClasses(classes);
      return newPin;
    }

    deleteStudent(studentId) {
      const classes = this.getClasses();
      classes.forEach(cls => {
        if (Array.isArray(cls.students)) {
          cls.students = cls.students.filter(s => String(s.id) !== String(studentId));
        }
      });
      this.saveClasses(classes);
      return true;
    }

    loginStudent(studentId, pin) {
      const res = this.authenticateStudent(studentId, pin);
      return {
        success: res.ok,
        ok: res.ok,
        message: res.message || 'Đăng nhập thành công!',
        session: res.session
      };
    }

    logout() {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem('smartedu_auth_user');
      this.syncHeaderUserBadge();
      this.openLoginModal('teacher');
    }

    showAdminTeacherModal() {
      if (window.switchTab) window.switchTab('cms');
    }

    showTeacherRegisterModal() {
      this.openLoginModal('teacher');
    }

    saveClasses(classes) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
      if (window.FirebaseService && typeof window.FirebaseService.saveClassesToCloud === 'function') {
        window.FirebaseService.saveClassesToCloud(classes).catch(() => {});
      }
    }

    getClassById(classId) {
      const classes = this.getClasses();
      return classes.find(c => c.id === classId) || classes[0];
    }

    authenticateStudent(studentId, pin) {
      const cleanId = String(studentId || '').trim();
      const cleanPin = String(pin || '').trim();
      const classes = this.getClasses();

      for (const cls of classes) {
        if (!Array.isArray(cls.students)) continue;
        const found = cls.students.find(s => String(s.id).trim() === cleanId && String(s.pin).trim() === cleanPin);
        if (found) {
          const session = {
            role: 'student',
            studentId: found.id,
            name: found.name,
            classId: cls.id,
            className: cls.name,
            avatar: found.avatar || (found.gender === 'nu' ? '👧' : '👦'),
            loginTime: Date.now()
          };
          this.setSession(session);
          return { ok: true, session };
        }
      }
      return { ok: false, message: 'Mã học sinh (ID) hoặc Mã PIN không chính xác!' };
    }

    openLoginModal(defaultTab = 'student', prefillEmail = '') {
      let modal = document.getElementById('ey-auth-login-modal');
      if (modal) modal.remove();

      modal = document.createElement('div');
      modal.id = 'ey-auth-login-modal';
      modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.72); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); font-family: "Be Vietnam Pro", system-ui, sans-serif; padding: 16px;';

      const sess = this.getSession();
      const currentEmail = prefillEmail || (sess.role !== 'student' ? (sess.email || '') : (sess.previousTeacherEmail || ''));
      const currentApiKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('smartedu_gemini_key') || '';
      const cleanCurrentKey = currentApiKey.startsWith('AQ.Ab8RN6') ? '' : currentApiKey;

      modal.innerHTML = `
        <div style="background: #ffffff; color: #1e293b; width: min(500px, 95vw); border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); position: relative; border: 1px solid #e2e8f0; max-height: 92vh; overflow-y: auto;">
          <button id="ey-auth-close-btn" style="position: absolute; top: 18px; right: 18px; background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 18px; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>

          <div style="text-align: center; margin-bottom: 18px;">
            <div style="width: 54px; height: 54px; background: linear-gradient(135deg, #0d9488, #0284c7); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 900; margin-bottom: 8px; box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3);">
              EY
            </div>
            <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">Đăng nhập Hệ thống SmartEdu / EY</h3>
            <p style="margin: 4px 0 0; font-size: 12.5px; color: #64748b;">Quản trị viên (${ADMIN_EMAIL}) · Giáo viên (Email + Cloud API Key) · Học sinh</p>
          </div>

          <!-- Role Switch Tabs -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; padding: 4px; border-radius: 12px; margin-bottom: 18px;">
            <button id="tab-login-teacher" style="padding: 10px; border: none; border-radius: 9px; font-weight: 800; font-size: 13.5px; cursor: pointer; background: ${defaultTab === 'teacher' ? '#ffffff' : 'transparent'}; color: ${defaultTab === 'teacher' ? '#0f172a' : '#64748b'}; box-shadow: ${defaultTab === 'teacher' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'}; transition: all 0.15s;">
              👨‍🏫 Giáo viên / Admin
            </button>
            <button id="tab-login-student" style="padding: 10px; border: none; border-radius: 9px; font-weight: 800; font-size: 13.5px; cursor: pointer; background: ${defaultTab === 'student' ? '#ffffff' : 'transparent'}; color: ${defaultTab === 'student' ? '#0f766e' : '#64748b'}; box-shadow: ${defaultTab === 'student' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'}; transition: all 0.15s;">
              👨‍🎓 Học sinh (ID + PIN)
            </button>
          </div>

          <!-- Form Học sinh -->
          <div id="form-login-student" style="display: ${defaultTab === 'student' ? 'block' : 'none'};">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Mã Học sinh (ID)</label>
              <input id="input-student-id" type="text" value="10011634" placeholder="Nhập mã ID (VD: 10011634)" style="width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; box-sizing: border-box; outline: none;" />
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Mã PIN (6 chữ số)</label>
              <input id="input-student-pin" type="password" value="070720" placeholder="Nhập mã PIN (VD: 070720)" style="width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; box-sizing: border-box; outline: none;" />
            </div>
            <div id="student-login-error" style="display: none; color: #dc2626; font-size: 12.5px; font-weight: 600; margin-bottom: 12px; background: #fef2f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #fecaca;"></div>
            <button id="btn-submit-student-login" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #0d9488, #0f766e); color: #ffffff; border: none; border-radius: 12px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 6px 16px rgba(13, 148, 136, 0.28);">
              🚀 Vào Bàn Học & Nông Trại
            </button>
            <div style="margin-top: 12px; padding: 10px 12px; background: #f0fdf4; border: 1px dashed #86efac; border-radius: 10px; font-size: 12px; color: #166534;">
              💡 <strong>Tài khoản mẫu:</strong> ID <code>10011634</code> — PIN <code>070720</code> (Em Đinh Tuấn Kiệt)
            </div>
          </div>

          <!-- Form Giáo viên & Quản trị viên -->
          <div id="form-login-teacher" style="display: ${defaultTab === 'teacher' ? 'block' : 'none'};">
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 5px;">
                📧 Email Giáo viên / Quản trị viên <span style="color:#ef4444;">*</span>
              </label>
              <input id="input-teacher-email" type="email" value="${currentEmail}" placeholder="VD: nmh28691@gmail.com hoặc giaovien@gmail.com" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; box-sizing: border-box;" />
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                👑 Quản trị viên (Thầy Hùng) đăng nhập bằng: <strong>${ADMIN_EMAIL}</strong>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 5px;">
                👤 Họ và tên Giáo viên
              </label>
              <input id="input-teacher-name" type="text" value="${sess.role !== 'student' && sess.email ? (sess.name || '') : ''}" placeholder="VD: Thầy Nguyễn Mạnh Hùng" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 14px; font-weight: 600; box-sizing: border-box;" />
            </div>

            <div style="margin-bottom: 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px;">
              <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; font-weight: 800; color: #1e293b; margin-bottom: 5px;">
                <span>🔑 Gemini API Key (Tự động lưu Đám mây theo Email)</span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #2563eb; font-size: 11px; text-decoration: none;">Lấy Key miễn phí ↗</a>
              </label>
              <input id="input-teacher-apikey" type="password" value="${cleanCurrentKey}" placeholder="Nhập AIzaSy... (Để trống nếu đã lưu trên Đám mây)" style="width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; font-family: monospace; box-sizing: border-box;" />
              <div style="font-size: 11px; color: #0f766e; margin-top: 5px; font-weight: 600;">
                ☁️ Mỗi lần nhập API Key, hệ thống tự động lưu lên Đám mây gắn với Email của thầy/cô để tự nạp cho mọi lần đăng nhập sau!
              </div>
            </div>

            <button id="btn-submit-teacher-login" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; border: none; border-radius: 12px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);">
              ✅ Đăng Nhập & Đồng Bộ Đám Mây
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('#ey-auth-close-btn').onclick = () => modal.remove();

      const tabStudent = modal.querySelector('#tab-login-student');
      const tabTeacher = modal.querySelector('#tab-login-teacher');
      const formStudent = modal.querySelector('#form-login-student');
      const formTeacher = modal.querySelector('#form-login-teacher');

      tabStudent.onclick = () => {
        tabStudent.style.background = '#ffffff';
        tabStudent.style.color = '#0f766e';
        tabTeacher.style.background = 'transparent';
        tabTeacher.style.color = '#64748b';
        formStudent.style.display = 'block';
        formTeacher.style.display = 'none';
      };

      tabTeacher.onclick = () => {
        tabTeacher.style.background = '#ffffff';
        tabTeacher.style.color = '#0f172a';
        tabStudent.style.background = 'transparent';
        tabStudent.style.color = '#64748b';
        formTeacher.style.display = 'block';
        formStudent.style.display = 'none';
      };

      // Tự động điền tên & API Key khi gõ email
      const emailInp = modal.querySelector('#input-teacher-email');
      const nameInp = modal.querySelector('#input-teacher-name');
      const keyInp = modal.querySelector('#input-teacher-apikey');
      if (emailInp) {
        emailInp.addEventListener('change', async () => {
          const em = emailInp.value.trim().toLowerCase();
          if (em === ADMIN_EMAIL && !nameInp.value.trim()) {
            nameInp.value = 'Thầy Nguyễn Mạnh Hùng';
          }
          if (em && window.FirebaseService) {
            const savedKey = await window.FirebaseService.getTeacherApiKey(em);
            if (savedKey && savedKey.apiKey && !keyInp.value.trim()) {
              keyInp.value = savedKey.apiKey;
            }
          }
        });
      }

      modal.querySelector('#btn-submit-student-login').onclick = () => {
        const id = modal.querySelector('#input-student-id').value;
        const pin = modal.querySelector('#input-student-pin').value;
        const res = this.authenticateStudent(id, pin);
        if (res.ok) {
          modal.remove();
        } else {
          const errEl = modal.querySelector('#student-login-error');
          errEl.textContent = res.message;
          errEl.style.display = 'block';
        }
      };

      modal.querySelector('#btn-submit-teacher-login').onclick = async () => {
        const email = modal.querySelector('#input-teacher-email').value.trim().toLowerCase();
        let name = modal.querySelector('#input-teacher-name').value.trim();
        const apiKeyVal = modal.querySelector('#input-teacher-apikey').value.trim();

        if (!email || !email.includes('@')) {
          alert('Vui lòng nhập địa chỉ Email hợp lệ của Giáo viên (ví dụ: ' + ADMIN_EMAIL + ' hoặc giaovien@gmail.com)!');
          return;
        }

        if (email === ADMIN_EMAIL && !name) {
          name = 'Thầy Nguyễn Mạnh Hùng';
        } else if (!name) {
          name = 'GV ' + email.split('@')[0];
        }

        const btn = modal.querySelector('#btn-submit-teacher-login');
        btn.disabled = true;
        btn.textContent = '⏳ Đang đồng bộ tài khoản & API Key Đám mây...';

        let record = {
          role: email === ADMIN_EMAIL ? 'admin' : 'teacher',
          name,
          email,
          status: 'approved'
        };

        if (window.FirebaseService) {
          try {
            record = await window.FirebaseService.registerOrCheckTeacher(email, name);
            if (apiKeyVal && apiKeyVal.length >= 15) {
              await window.FirebaseService.saveTeacherApiKey(email, apiKeyVal, apiKeyVal);
              record.apiKey = apiKeyVal;
            } else {
              const cloudKey = await window.FirebaseService.getTeacherApiKey(email);
              if (cloudKey && cloudKey.apiKey) {
                record.apiKey = cloudKey.apiKey;
              }
            }
          } catch (err) {}
        }

        this.setSession({
          role: email === ADMIN_EMAIL ? 'admin' : 'teacher',
          name: record.name || name,
          email: record.email || email,
          status: 'approved',
          loginTime: Date.now()
        });

        modal.remove();
        const roleLabel = email === ADMIN_EMAIL ? '👑 Quản trị viên (Admin)' : '👨‍🏫 Giáo viên';
        const keyMsg = record.apiKey
          ? '\n🔑 Gemini API Key của thầy/cô đã được đồng bộ & kích hoạt trên Đám mây!'
          : '\n💡 Thầy/cô có thể nhập Gemini API Key bất kỳ lúc nào, hệ thống sẽ tự lưu lên Đám mây cho các lần sau.';
        alert(`✅ Đăng nhập thành công!\nXin chào ${record.name || name} (${email}) — Vai trò: ${roleLabel}${keyMsg}`);
      };
    }
  }

  window.EyAuth = new EyAuthService();
})(window);
