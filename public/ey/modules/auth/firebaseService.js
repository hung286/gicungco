/**
 * HỆ THỐNG ĐÁM MÂY GOOGLE SHEETS & FIREBASE CLOUD SERVICE (SmartEdu Play / MHEdu)
 * Quản lý đồng bộ thời gian thực & Offline-First cho:
 * 1. Quản trị viên (nmh28691@gmail.com) & Danh sách Giáo viên đăng nhập bằng Email
 * 2. Lưu trữ & Khôi phục tự động Gemini API Key theo Email Giáo viên trên Đám mây
 * 3. Danh sách Lớp học & Học sinh (ID + Mã PIN)
 * 4. Bài tập giao cho học sinh (Assignments)
 * 5. Bài làm & Điểm số của học sinh (Submissions)
 * 6. Tiến độ Trò chơi Hành trình: Nông Trại Vui Vẻ & Vườn Hoa Tri Thức
 */

(function (window) {
  'use strict';

  const ADMIN_EMAIL = 'nmh28691@gmail.com';
  const LEGACY_ADMIN_EMAIL = 'hungvd286@gmail.com';
  const DEFAULT_GOOGLE_SHEET_URL =
    'https://script.google.com/macros/s/AKfycbwQxI054Rt_-t8oVCUcAQ4F-DHTklMfv7JPyrS-pKTkqV2vtW4zPCup0UXFAIyDxNXZvQ/exec';

  const STORAGE_KEY_SHEET_URL = 'smartedu_google_sheet_url';
  const STORAGE_KEY_FIREBASE_CONFIG = 'ey_v2_firebase_config';
  const STORAGE_KEY_TEACHERS = 'ey_v2_teachers_registry';
  const STORAGE_KEY_API_KEYS_MAP = 'smartedu_cloud_api_keys_by_email';
  const STORAGE_KEY_CLASSES = 'ey_v2_classes';
  const STORAGE_KEY_ASSIGNMENTS = 'ey_v2_assignments';
  const STORAGE_KEY_SUBMISSIONS = 'ey_v2_submissions';
  const STORAGE_KEY_FARM = 'ey_v2_nongtrai_data';
  const STORAGE_KEY_GARDEN = 'ey_v2_vuonhoa_data';
  const STORAGE_KEY_LAST_SYNC = 'smartedu_cloud_last_sync';

  const API_KEY_STORAGE_NAMES = [
    'gemini_api_key',
    'gemini_api_keys',
    'smartedu_gemini_key',
    'smartedu_gemini_api_key',
    'math_visualizer_api_key',
    'ocr_typst_key_gemini',
    'ocr_typst_key_gemini_pool'
  ];

  const DEFAULT_TEACHERS = [
    {
      email: ADMIN_EMAIL,
      name: 'Thầy Nguyễn Mạnh Hùng (Admin)',
      role: 'admin',
      status: 'approved',
      school: 'THPT Số 1 Lê Hồng Phong',
      subject: 'Toán học',
      createdAt: 1710000000000
    }
  ];

  class FirebaseCloudService {
    constructor() {
      this.db = null;
      this.auth = null;
      this.isCloudEnabled = true; // Google Sheets Cloud luôn bật mặc định
      this._syncTimer = null;
      this._isSyncing = false;
      this._cachedRawSheetData = null;
      this.initLocalDefaults();
      this.installLocalStorageApiKeyHook();
      // Đồng bộ ngầm từ Google Sheets ngay khi khởi động
      setTimeout(() => {
        this.pullAllFromCloud().catch(() => {});
      }, 400);
    }

    getGoogleSheetUrl() {
      try {
        const custom = localStorage.getItem(STORAGE_KEY_SHEET_URL);
        if (custom && custom.trim().includes('script.google.com')) {
          return custom.trim();
        }
      } catch (e) {}
      return DEFAULT_GOOGLE_SHEET_URL;
    }

    setGoogleSheetUrl(url) {
      const clean = String(url || '').trim();
      if (!clean) {
        localStorage.removeItem(STORAGE_KEY_SHEET_URL);
        return DEFAULT_GOOGLE_SHEET_URL;
      }
      localStorage.setItem(STORAGE_KEY_SHEET_URL, clean);
      return clean;
    }

    isAdminEmail(email) {
      const clean = String(email || '').toLowerCase().trim();
      return clean === ADMIN_EMAIL;
    }

    initLocalDefaults() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];

        // Đảm bảo nmh28691@gmail.com luôn là Admin duy nhất
        let hasAdmin = false;
        list = list.map(t => {
          if (!t || !t.email) return t;
          const em = String(t.email).toLowerCase().trim();
          if (em === ADMIN_EMAIL) {
            hasAdmin = true;
            return {
              ...t,
              email: ADMIN_EMAIL,
              name: t.name || 'Thầy Nguyễn Mạnh Hùng (Admin)',
              role: 'admin',
              status: 'approved'
            };
          }
          // Các email khác chỉ là teacher
          return {
            ...t,
            email: em,
            role: 'teacher',
            status: t.status || 'approved'
          };
        });

        if (!hasAdmin) {
          list.unshift({ ...DEFAULT_TEACHERS[0] });
        }

        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(list));
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
      }
    }

    getCurrentLoggedEmail() {
      try {
        const eySess = JSON.parse(localStorage.getItem('ey_v2_auth_session') || 'null');
        if (eySess && eySess.email && eySess.role !== 'student') {
          return String(eySess.email).toLowerCase().trim();
        }
      } catch (e) {}
      try {
        const mainUser = JSON.parse(localStorage.getItem('smartedu_auth_user') || 'null');
        if (mainUser && mainUser.email && mainUser.role !== 'student') {
          return String(mainUser.email).toLowerCase().trim();
        }
      } catch (e) {}
      return '';
    }

    // Tự động bắt sự kiện khi giáo viên nhập API Key ở bất kỳ công cụ nào để lưu lên Đám mây
    installLocalStorageApiKeyHook() {
      if (window.__smarteduApiKeyHookInstalled) return;
      window.__smarteduApiKeyHookInstalled = true;
      const self = this;
      try {
        const origSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          origSetItem.call(this, key, value);
          if (this === window.localStorage && API_KEY_STORAGE_NAMES.includes(key)) {
            const valStr = String(value || '').trim();
            // Bỏ qua key mặc định hệ thống AQ.Ab8RN6...
            if (valStr && valStr.length >= 20 && !valStr.startsWith('AQ.Ab8RN6')) {
              const email = self.getCurrentLoggedEmail();
              if (email && email.includes('@')) {
                self.saveTeacherApiKeyInternal(email, valStr, false);
              }
            }
          }
        };
      } catch (e) {}
    }

    getApiKeysMapLocal() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_API_KEYS_MAP) || '{}') || {};
      } catch (e) {
        return {};
      }
    }

    saveTeacherApiKeyInternal(email, rawKeyString, applyToLocal = true) {
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes('@')) return null;
      const cleanKeyStr = String(rawKeyString || '').trim();
      if (!cleanKeyStr) return null;

      const firstKey = cleanKeyStr.split(/[\n,;\t\s]+/).map(s => s.trim()).filter(Boolean)[0] || cleanKeyStr;
      const map = this.getApiKeysMapLocal();
      const record = {
        email: cleanEmail,
        apiKey: firstKey,
        apiKeyPool: cleanKeyStr,
        updatedAt: Date.now()
      };
      map[cleanEmail] = record;

      try {
        const origSetItem = Storage.prototype.setItem;
        origSetItem.call(localStorage, STORAGE_KEY_API_KEYS_MAP, JSON.stringify(map));
        if (applyToLocal) {
          this.applyApiKeyToLocalStorage(firstKey, cleanKeyStr);
        }
      } catch (e) {}

      // Cập nhật vào hồ sơ giáo viên
      try {
        const teachers = this.getLocalTeachers();
        const idx = teachers.findIndex(t => String(t.email).toLowerCase() === cleanEmail);
        if (idx >= 0) {
          teachers[idx].apiKey = firstKey;
          teachers[idx].apiKeyPool = cleanKeyStr;
          teachers[idx].updatedAt = Date.now();
          this.saveLocalTeachers(teachers);
        }
      } catch (e) {}

      // Đẩy lên đám mây Google Sheets (debounce 800ms)
      this.scheduleCloudPush();
      return record;
    }

    applyApiKeyToLocalStorage(singleKey, poolKeys) {
      const k = String(singleKey || '').trim();
      const pool = String(poolKeys || k).trim();
      if (!k) return;
      try {
        API_KEY_STORAGE_NAMES.forEach(storageName => {
          const val = (storageName === 'gemini_api_keys' || storageName === 'ocr_typst_key_gemini_pool') ? pool : k;
          localStorage.setItem(storageName, val);
        });
      } catch (e) {}
    }

    async saveTeacherApiKey(email, apiKey, apiKeyPool) {
      const cleanEmail = String(email || this.getCurrentLoggedEmail() || '').toLowerCase().trim();
      if (!cleanEmail) return { ok: false, message: 'Chưa có email giáo viên đăng nhập!' };
      const combined = apiKeyPool || apiKey || '';
      const rec = this.saveTeacherApiKeyInternal(cleanEmail, combined, true);
      await this.pushAllToCloud();
      return { ok: true, record: rec };
    }

    async getTeacherApiKey(email) {
      const cleanEmail = String(email || this.getCurrentLoggedEmail() || '').toLowerCase().trim();
      if (!cleanEmail) return null;

      // 1. Kiểm tra bản lưu local trước
      const localMap = this.getApiKeysMapLocal();
      if (localMap[cleanEmail] && localMap[cleanEmail].apiKey) {
        this.applyApiKeyToLocalStorage(localMap[cleanEmail].apiKey, localMap[cleanEmail].apiKeyPool);
        return localMap[cleanEmail];
      }

      // 2. Kéo từ Đám mây Google Sheets về
      await this.pullAllFromCloud();
      const updatedMap = this.getApiKeysMapLocal();
      if (updatedMap[cleanEmail] && updatedMap[cleanEmail].apiKey) {
        this.applyApiKeyToLocalStorage(updatedMap[cleanEmail].apiKey, updatedMap[cleanEmail].apiKeyPool);
        return updatedMap[cleanEmail];
      }

      // 3. Kiểm tra trong danh sách giáo viên
      const teachers = this.getLocalTeachers();
      const found = teachers.find(t => String(t.email).toLowerCase() === cleanEmail);
      if (found && found.apiKey) {
        this.applyApiKeyToLocalStorage(found.apiKey, found.apiKeyPool || found.apiKey);
        return { email: cleanEmail, apiKey: found.apiKey, apiKeyPool: found.apiKeyPool || found.apiKey };
      }
      return null;
    }

    // Gom toàn bộ dữ liệu trên máy thành gói chuẩn để đồng bộ với Google Sheets
    collectLocalSnapshot() {
      let classes = [];
      let assignments = [];
      let submissions = [];
      let farms = {};
      let gardens = {};
      try { classes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLASSES) || '[]'); } catch (e) {}
      try { assignments = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || '[]'); } catch (e) {}
      try { submissions = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMISSIONS) || '[]'); } catch (e) {}
      try { farms = JSON.parse(localStorage.getItem(STORAGE_KEY_FARM) || '{}'); } catch (e) {}
      try { gardens = JSON.parse(localStorage.getItem(STORAGE_KEY_GARDEN) || '{}'); } catch (e) {}

      return {
        updatedAt: Date.now(),
        adminEmail: ADMIN_EMAIL,
        teachers: this.getLocalTeachers(),
        apiKeys: this.getApiKeysMapLocal(),
        classes: Array.isArray(classes) ? classes : [],
        assignments: Array.isArray(assignments) ? assignments : [],
        submissions: Array.isArray(submissions) ? submissions : [],
        farms: (farms && typeof farms === 'object') ? farms : {},
        gardens: (gardens && typeof gardens === 'object') ? gardens : {}
      };
    }

    // Hợp nhất thông minh dữ liệu từ Google Sheets về LocalStorage mà không làm mất dữ liệu mới
    mergeSnapshotIntoLocal(remoteDb) {
      if (!remoteDb || typeof remoteDb !== 'object') return;

      // 1. Teachers
      if (Array.isArray(remoteDb.teachers)) {
        const localTeachers = this.getLocalTeachers();
        const map = new Map();
        localTeachers.forEach(t => {
          if (t && t.email) map.set(String(t.email).toLowerCase().trim(), t);
        });
        remoteDb.teachers.forEach(t => {
          if (t && t.email) {
            const em = String(t.email).toLowerCase().trim();
            const prev = map.get(em) || {};
            map.set(em, {
              ...prev,
              ...t,
              email: em,
              role: em === ADMIN_EMAIL ? 'admin' : 'teacher',
              status: 'approved'
            });
          }
        });
        if (!map.has(ADMIN_EMAIL)) {
          map.set(ADMIN_EMAIL, { ...DEFAULT_TEACHERS[0] });
        } else {
          const adm = map.get(ADMIN_EMAIL);
          adm.role = 'admin';
          adm.status = 'approved';
        }
        this.saveLocalTeachers(Array.from(map.values()));
      }

      // 2. API Keys by Email
      if (remoteDb.apiKeys && typeof remoteDb.apiKeys === 'object') {
        const localKeys = this.getApiKeysMapLocal();
        for (const [em, val] of Object.entries(remoteDb.apiKeys)) {
          const cleanEm = String(em).toLowerCase().trim();
          if (!cleanEm) continue;
          const remoteRec = typeof val === 'string' ? { apiKey: val, apiKeyPool: val, updatedAt: 0 } : val;
          if (remoteRec && remoteRec.apiKey) {
            const localRec = localKeys[cleanEm];
            if (!localRec || (remoteRec.updatedAt || 0) >= (localRec.updatedAt || 0)) {
              localKeys[cleanEm] = remoteRec;
            }
          }
        }
        localStorage.setItem(STORAGE_KEY_API_KEYS_MAP, JSON.stringify(localKeys));

        // Nếu giáo viên hiện tại có key trên mây, tự động nạp luôn vào trình duyệt
        const currentEmail = this.getCurrentLoggedEmail();
        if (currentEmail && localKeys[currentEmail] && localKeys[currentEmail].apiKey) {
          this.applyApiKeyToLocalStorage(localKeys[currentEmail].apiKey, localKeys[currentEmail].apiKeyPool);
        }
      }

      // 3. Classes & Students
      if (Array.isArray(remoteDb.classes) && remoteDb.classes.length > 0) {
        let localClasses = [];
        try { localClasses = JSON.parse(localStorage.getItem(STORAGE_KEY_CLASSES) || '[]'); } catch (e) {}
        const map = new Map();
        (Array.isArray(localClasses) ? localClasses : []).forEach(c => { if (c && c.id) map.set(String(c.id), c); });
        remoteDb.classes.forEach(c => { if (c && c.id) map.set(String(c.id), c); });
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(Array.from(map.values())));
      }

      // 4. Assignments (Bài tập)
      if (Array.isArray(remoteDb.assignments) && remoteDb.assignments.length > 0) {
        let localAss = [];
        try { localAss = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || '[]'); } catch (e) {}
        const map = new Map();
        (Array.isArray(localAss) ? localAss : []).forEach(a => { if (a && a.id) map.set(String(a.id), a); });
        remoteDb.assignments.forEach(a => { if (a && a.id) map.set(String(a.id), a); });
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(Array.from(map.values())));
      }

      // 5. Submissions (Bài làm)
      if (Array.isArray(remoteDb.submissions) && remoteDb.submissions.length > 0) {
        let localSubs = [];
        try { localSubs = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMISSIONS) || '[]'); } catch (e) {}
        const map = new Map();
        (Array.isArray(localSubs) ? localSubs : []).forEach(s => { if (s && s.id) map.set(String(s.id), s); });
        remoteDb.submissions.forEach(s => { if (s && s.id) map.set(String(s.id), s); });
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(Array.from(map.values())));
      }

      // 6. Farms (Nông trại) & Gardens (Vườn hoa)
      if (remoteDb.farms && typeof remoteDb.farms === 'object') {
        let localFarms = {};
        try { localFarms = JSON.parse(localStorage.getItem(STORAGE_KEY_FARM) || '{}'); } catch (e) {}
        const mergedFarms = { ...remoteDb.farms, ...localFarms };
        for (const [stdId, rFarm] of Object.entries(remoteDb.farms)) {
          const lFarm = localFarms[stdId];
          if (!lFarm || (rFarm && (rFarm.coins || 0) > (lFarm.coins || 0))) {
            mergedFarms[stdId] = rFarm;
          }
        }
        localStorage.setItem(STORAGE_KEY_FARM, JSON.stringify(mergedFarms));
      }

      if (remoteDb.gardens && typeof remoteDb.gardens === 'object') {
        let localGardens = {};
        try { localGardens = JSON.parse(localStorage.getItem(STORAGE_KEY_GARDEN) || '{}'); } catch (e) {}
        const mergedGardens = { ...remoteDb.gardens, ...localGardens };
        for (const [stdId, rGarden] of Object.entries(remoteDb.gardens)) {
          const lGarden = localGardens[stdId];
          if (!lGarden || (rGarden && (rGarden.points || 0) > (lGarden.points || 0))) {
            mergedGardens[stdId] = rGarden;
          }
        }
        localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(mergedGardens));
      }

      localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
    }

    scheduleCloudPush() {
      if (this._syncTimer) clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(() => {
        this.pushAllToCloud().catch(() => {});
      }, 800);
    }

    async pullAllFromCloud() {
      const sheetUrl = this.getGoogleSheetUrl();
      try {
        // 1. Thử lấy trực tiếp từ Google Apps Script (Simple GET)
        const resp = await fetch(`${sheetUrl}?action=get&_t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          const json = await resp.json();
          const rawData = json?.data || json || {};
          this._cachedRawSheetData = rawData;
          const remoteDb = rawData?.smartedu_cloud_db || rawData?.smartedu || null;
          if (remoteDb && typeof remoteDb === 'object') {
            this.mergeSnapshotIntoLocal(remoteDb);
            window.dispatchEvent(new CustomEvent('smartedu:cloud-synced', { detail: { source: 'google-sheet', db: remoteDb } }));
            return remoteDb;
          }
        }
      } catch (e) {}

      // 2. Fallback qua API Backend (/api/cloud-storage/smartedu-db)
      try {
        const apiResp = await fetch(`/api/cloud-storage/smartedu-db?sheetUrl=${encodeURIComponent(sheetUrl)}&_t=${Date.now()}`);
        if (apiResp.ok) {
          const apiJson = await apiResp.json();
          if (apiJson && apiJson.db) {
            this.mergeSnapshotIntoLocal(apiJson.db);
            window.dispatchEvent(new CustomEvent('smartedu:cloud-synced', { detail: { source: 'api-backend', db: apiJson.db } }));
            return apiJson.db;
          }
        }
      } catch (e) {}

      return this.collectLocalSnapshot();
    }

    async pushAllToCloud() {
      if (this._isSyncing) return { ok: true, busy: true };
      this._isSyncing = true;
      const sheetUrl = this.getGoogleSheetUrl();
      const snapshot = this.collectLocalSnapshot();

      try {
        // 1. Đồng bộ qua API Server trước (không chặn CORS, lưu cả bản local server + Google Sheet)
        fetch('/api/cloud-storage/smartedu-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetUrl, db: snapshot })
        }).catch(() => {});

        // 2. Đồng bộ trực tiếp lên Google Sheet Apps Script bằng Simple CORS text/plain
        let baseSheetData = this._cachedRawSheetData;
        if (!baseSheetData || !Array.isArray(baseSheetData.violations)) {
          try {
            const gRes = await fetch(`${sheetUrl}?action=get&_t=${Date.now()}`);
            if (gRes.ok) {
              const gJson = await gRes.json();
              baseSheetData = gJson?.data || gJson || {};
              this._cachedRawSheetData = baseSheetData;
            }
          } catch (e) {}
        }

        const remoteExistingDb = baseSheetData?.smartedu_cloud_db || {};
        this.mergeSnapshotIntoLocal(remoteExistingDb);
        const finalSnapshot = this.collectLocalSnapshot();

        const postPayload = {
          ...(baseSheetData || {}),
          action: 'sync',
          violations: Array.isArray(baseSheetData?.violations) ? baseSheetData.violations : [],
          smartedu_cloud_db: finalSnapshot
        };

        await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(postPayload)
        });

        localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
        this._isSyncing = false;
        return { ok: true, db: finalSnapshot, sheetUrl };
      } catch (err) {
        this._isSyncing = false;
        return { ok: false, error: err?.message || 'Lỗi mạng khi đồng bộ Google Sheets', db: snapshot };
      }
    }

    saveConfig(configObj) {
      if (configObj && configObj.sheetUrl) {
        this.setGoogleSheetUrl(configObj.sheetUrl);
      }
      localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(configObj));
      this.isCloudEnabled = true;
      return true;
    }

    clearConfig() {
      localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
      this.isCloudEnabled = true;
    }

    // =========================================================================
    // 1. QUẢN LÝ GIÁO VIÊN & PHÂN QUYỀN ADMIN (nmh28691@gmail.com)
    // =========================================================================

    async getTeachers() {
      await this.pullAllFromCloud().catch(() => {});
      return this.getLocalTeachers();
    }

    getLocalTeachers() {
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_TEACHERS) || '[]');
        return Array.isArray(list) ? list : DEFAULT_TEACHERS;
      } catch (e) {
        return DEFAULT_TEACHERS;
      }
    }

    saveLocalTeachers(list) {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(list));
    }

    async registerOrCheckTeacher(email, name, extra = {}) {
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Vui lòng nhập địa chỉ Email hợp lệ (ví dụ: giaovien@gmail.com)');
      }

      // Kéo dữ liệu mới nhất từ Google Sheets về trước khi kiểm tra
      await this.pullAllFromCloud().catch(() => {});

      const list = this.getLocalTeachers();
      const isSystemAdmin = cleanEmail === ADMIN_EMAIL;
      let existingIdx = list.findIndex(t => String(t.email).toLowerCase().trim() === cleanEmail);

      let teacherRecord;
      if (existingIdx >= 0) {
        teacherRecord = {
          ...list[existingIdx],
          name: name || list[existingIdx].name || cleanEmail.split('@')[0],
          role: isSystemAdmin ? 'admin' : 'teacher',
          status: 'approved',
          school: extra.school || list[existingIdx].school || 'Trường THPT',
          subject: extra.subject || list[existingIdx].subject || 'Toán học',
          lastLoginAt: Date.now()
        };
        list[existingIdx] = teacherRecord;
      } else {
        teacherRecord = {
          email: cleanEmail,
          name: name || (isSystemAdmin ? 'Thầy Nguyễn Mạnh Hùng (Admin)' : cleanEmail.split('@')[0]),
          role: isSystemAdmin ? 'admin' : 'teacher',
          status: 'approved',
          school: extra.school || 'Trường THPT',
          subject: extra.subject || 'Toán học',
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        list.push(teacherRecord);
      }

      this.saveLocalTeachers(list);

      // Khôi phục API Key đã lưu trên đám mây của giáo viên này (nếu có)
      const savedKeyObj = await this.getTeacherApiKey(cleanEmail);
      if (savedKeyObj && savedKeyObj.apiKey) {
        teacherRecord.apiKey = savedKeyObj.apiKey;
      } else {
        // Nếu trên máy đang có sẵn API Key do giáo viên vừa nhập, gắn luôn vào email này
        const currentLocalKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('smartedu_gemini_key') || '';
        if (currentLocalKey && currentLocalKey.length >= 20 && !currentLocalKey.startsWith('AQ.Ab8RN6')) {
          this.saveTeacherApiKeyInternal(cleanEmail, currentLocalKey, true);
          teacherRecord.apiKey = currentLocalKey;
        }
      }

      this.scheduleCloudPush();
      return teacherRecord;
    }

    async updateTeacherStatus(email, newStatus, newRole = 'teacher') {
      const cleanEmail = String(email || '').toLowerCase().trim();
      const finalRole = cleanEmail === ADMIN_EMAIL ? 'admin' : (newRole === 'admin' ? 'teacher' : newRole);
      const list = this.getLocalTeachers();
      const idx = list.findIndex(t => String(t.email).toLowerCase().trim() === cleanEmail);
      if (idx !== -1) {
        list[idx].status = newStatus;
        list[idx].role = finalRole;
      } else {
        list.push({
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: finalRole,
          status: newStatus,
          createdAt: Date.now()
        });
      }
      this.saveLocalTeachers(list);
      await this.pushAllToCloud();
      return true;
    }

    async deleteTeacher(email) {
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (cleanEmail === ADMIN_EMAIL) {
        alert('Không thể xóa tài khoản Quản trị viên gốc (' + ADMIN_EMAIL + ')!');
        return false;
      }
      const list = this.getLocalTeachers().filter(t => String(t.email).toLowerCase().trim() !== cleanEmail);
      this.saveLocalTeachers(list);
      await this.pushAllToCloud();
      return true;
    }

    // =========================================================================
    // 2. QUẢN LÝ LỚP HỌC & DANH SÁCH HỌC SINH TRÊN GOOGLE SHEETS
    // =========================================================================

    async saveClassesToCloud(classesList) {
      if (Array.isArray(classesList)) {
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classesList));
      }
      this.scheduleCloudPush();
      return true;
    }

    async getClassesFromCloud() {
      await this.pullAllFromCloud().catch(() => {});
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_CLASSES) || '[]');
      } catch (e) {
        return [];
      }
    }

    // =========================================================================
    // 3. QUẢN LÝ BÀI TẬP (ASSIGNMENTS) & BÀI LÀM HỌC SINH (SUBMISSIONS)
    // =========================================================================

    async saveAssignment(assignment) {
      return this.saveAssignmentToCloud(assignment);
    }

    async saveAssignmentToCloud(assignment) {
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || '[]');
        const idx = list.findIndex(a => a.id === assignment.id);
        if (idx >= 0) list[idx] = assignment;
        else list.unshift(assignment);
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(list));
      } catch (e) {}
      this.scheduleCloudPush();
      return true;
    }

    async deleteAssignment(assignmentId) {
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || '[]').filter(a => a.id !== assignmentId);
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(list));
      } catch (e) {}
      this.scheduleCloudPush();
      return true;
    }

    async getAssignments(classId = null) {
      const all = await this.getAssignmentsFromCloud();
      if (!classId) return all;
      return all.filter(a => !a.classId || a.classId === classId);
    }

    async getAssignmentsFromCloud() {
      await this.pullAllFromCloud().catch(() => {});
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || '[]');
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    }

    async submitAssignment(submission) {
      await this.saveSubmissionToCloud(submission);
      if (submission && submission.studentId) {
        await this.rewardFarmFromQuiz(
          submission.studentId,
          submission.earnedCoins || 30,
          submission.earnedGrain || 10
        );
      }
      return true;
    }

    async saveSubmissionToCloud(submission) {
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMISSIONS) || '[]');
        const idx = list.findIndex(s => s.id === submission.id || (s.assignmentId === submission.assignmentId && s.studentId === submission.studentId));
        if (idx >= 0) list[idx] = submission;
        else list.unshift(submission);
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
      } catch (e) {}
      this.scheduleCloudPush();
      return true;
    }

    async getSubmissions(assignmentId = null, studentId = null) {
      await this.pullAllFromCloud().catch(() => {});
      try {
        let all = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBMISSIONS) || '[]');
        if (!Array.isArray(all)) all = [];
        if (assignmentId) all = all.filter(s => s.assignmentId === assignmentId);
        if (studentId) all = all.filter(s => String(s.studentId) === String(studentId));
        return all;
      } catch (e) {
        return [];
      }
    }

    async getSubmissionsFromCloud(assignmentId = null) {
      return this.getSubmissions(assignmentId, null);
    }

    showConfigModal() {
      if (window.GoogleDriveSync && typeof window.GoogleDriveSync.openBackupModal === 'function') {
        window.GoogleDriveSync.openBackupModal();
      }
    }

    // =========================================================================
    // 4. ĐỒNG BỘ TIẾN ĐỘ NÔNG TRẠI VUI VẺ & VƯỜN HOA TRI THỨC
    // =========================================================================

    async saveStudentFarmData(studentId, farmState) {
      if (!studentId) return false;
      try {
        const allFarms = JSON.parse(localStorage.getItem(STORAGE_KEY_FARM) || '{}');
        allFarms[studentId] = { ...farmState, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY_FARM, JSON.stringify(allFarms));
      } catch (e) {}
      this.scheduleCloudPush();
      return true;
    }

    async getStudentFarmData(studentId) {
      if (!studentId) return null;
      await this.pullAllFromCloud().catch(() => {});
      try {
        const allFarms = JSON.parse(localStorage.getItem(STORAGE_KEY_FARM) || '{}');
        return allFarms[studentId] || null;
      } catch (e) {
        return null;
      }
    }

    async saveStudentGardenData(studentId, gardenState) {
      if (!studentId) return false;
      try {
        const allGardens = JSON.parse(localStorage.getItem(STORAGE_KEY_GARDEN) || '{}');
        allGardens[studentId] = { ...gardenState, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(allGardens));
      } catch (e) {}
      this.scheduleCloudPush();
      return true;
    }

    async getStudentGardenData(studentId) {
      if (!studentId) return null;
      await this.pullAllFromCloud().catch(() => {});
      try {
        const allGardens = JSON.parse(localStorage.getItem(STORAGE_KEY_GARDEN) || '{}');
        return allGardens[studentId] || null;
      } catch (e) {
        return null;
      }
    }

    async rewardFarmFromQuiz(studentId, earnedCoins, earnedGrain) {
      const stdId = studentId || 'default_student';
      let allFarms = {};
      try {
        allFarms = JSON.parse(localStorage.getItem(STORAGE_KEY_FARM) || '{}');
      } catch (e) {}

      if (!allFarms[stdId]) {
        allFarms[stdId] = {
          coins: 50,
          grain: 15,
          apples: 0,
          chickens: 2,
          eggs: [
            { id: 1, name: 'Mơ - Trứng gà', totalSec: 180, remainingSec: 180, hatching: true },
            { id: 2, name: 'Vàng - Trứng gà', totalSec: 180, remainingSec: 120, hatching: true }
          ],
          fedToday: true,
          streakDays: 1,
          lastFedTime: Date.now()
        };
      }

      allFarms[stdId].coins = (allFarms[stdId].coins || 0) + earnedCoins;
      allFarms[stdId].grain = (allFarms[stdId].grain || 0) + earnedGrain;
      allFarms[stdId].updatedAt = Date.now();

      localStorage.setItem(STORAGE_KEY_FARM, JSON.stringify(allFarms));

      // Thưởng thêm giọt nước cho Vườn Hoa Tri Thức khi học sinh làm bài tập
      try {
        const allGardens = JSON.parse(localStorage.getItem(STORAGE_KEY_GARDEN) || '{}');
        if (allGardens[stdId]) {
          const bonusWater = Math.max(1, Math.round(earnedGrain / 2));
          allGardens[stdId].water = (allGardens[stdId].water || 0) + bonusWater;
          allGardens[stdId].points = (allGardens[stdId].points || 0) + earnedCoins;
          localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(allGardens));
        }
      } catch (e) {}

      this.scheduleCloudPush();
      window.dispatchEvent(new CustomEvent('ey:farm-updated', { detail: { studentId: stdId, state: allFarms[stdId] } }));
      return allFarms[stdId];
    }
  }

  window.FirebaseService = new FirebaseCloudService();
  window.SmartEduCloud = window.FirebaseService;
})(window);
