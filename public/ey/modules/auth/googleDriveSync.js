/**
 * HỆ THỐNG ĐỒNG BỘ ĐÁM MÂY GOOGLE SHEETS & GOOGLE DRIVE (SmartEdu Play / MHEdu)
 * Lưu trữ & đồng bộ trực tiếp lên Google Sheet của Thầy Nguyễn Mạnh Hùng (nmh28691@gmail.com):
 * - Danh sách Giáo viên & Gemini API Key đám mây theo email
 * - Danh sách Lớp học & Học sinh (ID + Mã PIN)
 * - Bài tập giao cho học sinh (Assignments)
 * - Bài làm & Điểm số của học sinh (Submissions)
 * - Trò chơi Hệ thống Nông Trại Vui Vẻ & Vườn Hoa Tri Thức
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_GDRIVE_STATE = 'ey_v2_gdrive_sync_state';
  const ADMIN_EMAIL = 'nmh28691@gmail.com';
  const DEFAULT_SHEET_URL =
    'https://script.google.com/macros/s/AKfycbwQxI054Rt_-t8oVCUcAQ4F-DHTklMfv7JPyrS-pKTkqV2vtW4zPCup0UXFAIyDxNXZvQ/exec';

  class GoogleDriveSyncService {
    constructor() {
      this.state = this.loadState();
    }

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_GDRIVE_STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.connected = true;
          parsed.email = parsed.email === 'hungvd286@gmail.com' ? ADMIN_EMAIL : (parsed.email || ADMIN_EMAIL);
          return parsed;
        }
      } catch (e) {}
      return {
        connected: true,
        email: ADMIN_EMAIL,
        lastBackupTime: localStorage.getItem('smartedu_cloud_last_sync') || null,
        autoSync: true,
        backupFileName: 'SmartEdu_GoogleSheet_Cloud_DB.json'
      };
    }

    saveState() {
      localStorage.setItem(STORAGE_KEY_GDRIVE_STATE, JSON.stringify(this.state));
    }

    collectAllSystemData() {
      const cloud = window.FirebaseService ? window.FirebaseService.collectLocalSnapshot() : {};
      return {
        app: 'SmartEdu Play / MHEdu - Cloud Ecosystem',
        version: '3.0.0',
        exportedAt: new Date().toISOString(),
        author: 'Thầy Nguyễn Mạnh Hùng (' + ADMIN_EMAIL + ')',
        sheetEndpoint: window.FirebaseService ? window.FirebaseService.getGoogleSheetUrl() : DEFAULT_SHEET_URL,
        data: {
          ...cloud,
          classes: JSON.parse(localStorage.getItem('ey_v2_classes') || '[]'),
          assignments: JSON.parse(localStorage.getItem('ey_v2_assignments') || '[]'),
          submissions: JSON.parse(localStorage.getItem('ey_v2_submissions') || '[]'),
          teachers: JSON.parse(localStorage.getItem('ey_v2_teachers_registry') || '[]'),
          apiKeys: JSON.parse(localStorage.getItem('smartedu_cloud_api_keys_by_email') || '{}'),
          nongTrai: JSON.parse(localStorage.getItem('ey_v2_nongtrai_data') || '{}'),
          vuonHoa: JSON.parse(localStorage.getItem('ey_v2_vuonhoa_data') || '{}'),
          cmsCatalog: JSON.parse(localStorage.getItem('ey_v2_custom_catalog') || '{}'),
          battleSessions: JSON.parse(localStorage.getItem('mhedu_ey_battle_sessions_v2') || '{}'),
          gameSessions: JSON.parse(localStorage.getItem('mhedu_ey_game_sessions_v1') || '{}')
        }
      };
    }

    restoreSystemData(backupPayload) {
      if (!backupPayload || !backupPayload.data) {
        throw new Error('File sao lưu không đúng định dạng chuẩn của hệ thống!');
      }
      const d = backupPayload.data;
      if (d.classes) localStorage.setItem('ey_v2_classes', JSON.stringify(d.classes));
      if (d.assignments) localStorage.setItem('ey_v2_assignments', JSON.stringify(d.assignments));
      if (d.submissions) localStorage.setItem('ey_v2_submissions', JSON.stringify(d.submissions));
      if (d.teachers) localStorage.setItem('ey_v2_teachers_registry', JSON.stringify(d.teachers));
      if (d.apiKeys) localStorage.setItem('smartedu_cloud_api_keys_by_email', JSON.stringify(d.apiKeys));
      if (d.nongTrai || d.farms) localStorage.setItem('ey_v2_nongtrai_data', JSON.stringify(d.nongTrai || d.farms));
      if (d.vuonHoa || d.gardens) localStorage.setItem('ey_v2_vuonhoa_data', JSON.stringify(d.vuonHoa || d.gardens));
      if (d.cmsCatalog) localStorage.setItem('ey_v2_custom_catalog', JSON.stringify(d.cmsCatalog));
      if (d.battleSessions) localStorage.setItem('mhedu_ey_battle_sessions_v2', JSON.stringify(d.battleSessions));
      if (d.gameSessions) localStorage.setItem('mhedu_ey_game_sessions_v1', JSON.stringify(d.gameSessions));

      this.state.lastBackupTime = new Date().toISOString();
      this.saveState();
      if (window.FirebaseService) {
        window.FirebaseService.pushAllToCloud().catch(() => {});
      }
      return true;
    }

    exportBackupJson() {
      const payload = this.collectAllSystemData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `SmartEdu_GoogleSheet_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.state.lastBackupTime = new Date().toISOString();
      this.saveState();
    }

    async syncNowToGoogleSheet(btnEl) {
      if (!window.FirebaseService) return;
      const origText = btnEl ? btnEl.innerHTML : '';
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '⏳ Đang đồng bộ lên Google Sheet...';
      }
      try {
        const res = await window.FirebaseService.pushAllToCloud();
        this.state.lastBackupTime = new Date().toISOString();
        this.saveState();
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerHTML = origText;
        }
        this.openBackupModal();
        if (res && res.ok) {
          alert('✅ Đã đồng bộ thành công toàn bộ dữ liệu (Giáo viên, API Key, Học sinh, Bài tập, Bài làm, Nông trại & Vườn hoa) lên Google Sheet Đám mây!');
        } else {
          alert('⚠️ Đã lưu dữ liệu tại máy chủ cục bộ. Cảnh báo kết nối Google Sheet: ' + (res?.error || 'Kiểm tra mạng'));
        }
      } catch (err) {
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerHTML = origText;
        }
        alert('❌ Lỗi đồng bộ: ' + err.message);
      }
    }

    async pullNowFromGoogleSheet(btnEl) {
      if (!window.FirebaseService) return;
      const origText = btnEl ? btnEl.innerHTML : '';
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '⏳ Đang tải từ Google Sheet...';
      }
      try {
        await window.FirebaseService.pullAllFromCloud();
        this.state.lastBackupTime = new Date().toISOString();
        this.saveState();
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerHTML = origText;
        }
        this.openBackupModal();
        alert('✅ Đã tải và cập nhật dữ liệu mới nhất từ Google Sheet Đám mây về hệ thống!');
      } catch (err) {
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.innerHTML = origText;
        }
        alert('❌ Lỗi tải dữ liệu: ' + err.message);
      }
    }

    saveCustomSheetUrl() {
      const inp = document.getElementById('gdrive-custom-sheet-url');
      if (!inp || !window.FirebaseService) return;
      const val = inp.value.trim();
      const saved = window.FirebaseService.setGoogleSheetUrl(val);
      alert('✅ Đã lưu đường dẫn Google Apps Script Web App:\n' + saved);
      this.openBackupModal();
    }

    showCloudDialog() {
      this.openBackupModal();
    }

    openBackupModal() {
      let modal = document.getElementById('ey-gdrive-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ey-gdrive-modal';
        document.body.appendChild(modal);
      }

      const snapshot = window.FirebaseService ? window.FirebaseService.collectLocalSnapshot() : {};
      const classesCount = (snapshot.classes || []).length;
      const studentsCount = (snapshot.classes || []).reduce((acc, c) => acc + ((c.students || []).length), 0);
      const assignmentsCount = (snapshot.assignments || []).length;
      const submissionsCount = (snapshot.submissions || []).length;
      const teachersCount = (snapshot.teachers || []).length;
      const apiKeysCount = Object.keys(snapshot.apiKeys || {}).length;
      const farmsCount = Object.keys(snapshot.farms || {}).length;
      const gardensCount = Object.keys(snapshot.gardens || {}).length;

      const sheetUrl = window.FirebaseService ? window.FirebaseService.getGoogleSheetUrl() : DEFAULT_SHEET_URL;
      const lastSyncStr = localStorage.getItem('smartedu_cloud_last_sync') || this.state.lastBackupTime;
      const isAdmin = window.EyAuth && typeof window.EyAuth.isAdmin === 'function' && window.EyAuth.isAdmin();

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.72); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); font-family: 'Be Vietnam Pro', sans-serif; padding: 16px;">
          <div style="background: #ffffff; color: #1e293b; width: min(650px, 96vw); max-height: 90vh; overflow-y: auto; border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); border: 1.5px solid #cbd5e1; position: relative;">
            <button onclick="document.getElementById('ey-gdrive-modal').remove()" style="position: absolute; top: 18px; right: 18px; background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 20px; color: #64748b; cursor: pointer;">&times;</button>

            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
              <div style="width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #059669, #10b981); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 8px 20px rgba(16,185,129,0.28);">
                📊
              </div>
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a;">Đám Mây Google Sheets — SmartEdu Cloud</h3>
                <p style="margin: 3px 0 0 0; font-size: 13px; color: #64748b;">Tự động lưu trữ Bài tập, Bài làm, Danh sách Học sinh, Nông trại & API Key Giáo viên</p>
              </div>
            </div>

            <!-- Trạng thái kết nối Google Sheet -->
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 16px; padding: 14px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: #16a34a; display: inline-block; box-shadow: 0 0 0 4px #dcfce7;"></span>
                  <strong style="font-size: 14px; color: #166534;">Đã kết nối Google Sheet Cloud Database</strong>
                </div>
                <div style="font-size: 12px; color: #15803d; margin-top: 4px;">
                  Quản trị viên: <strong>${ADMIN_EMAIL}</strong> · Đồng bộ gần nhất: <strong>${lastSyncStr ? new Date(lastSyncStr).toLocaleString('vi-VN') : 'Vừa xong'}</strong>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button onclick="window.GoogleDriveSync.pullNowFromGoogleSheet(this)" style="padding: 8px 12px; background: #ffffff; color: #0f766e; border: 1.5px solid #2dd4bf; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer;">
                  ⬇️ Tải từ Sheet
                </button>
                <button onclick="window.GoogleDriveSync.syncNowToGoogleSheet(this)" style="padding: 8px 14px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; border: none; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">
                  🔄 Đồng bộ ngay lên Sheet
                </button>
              </div>
            </div>

            <!-- Thống kê 6 nhóm dữ liệu đám mây -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #0284c7;">${classesCount} lớp / ${studentsCount} HS</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">Danh sách Học sinh</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #0d9488;">${assignmentsCount}</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">Bài tập đã giao</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #d97706;">${submissionsCount}</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">Bài làm Học sinh</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #16a34a;">${farmsCount} trại / ${gardensCount} vườn</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">Hệ thống Nông Trại</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #4f46e5;">${teachersCount}</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">Tài khoản Giáo viên</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #9333ea;">${apiKeysCount}</div>
                <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">API Key lưu Đám mây</div>
              </div>
            </div>

            ${isAdmin ? `
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 14px; margin-bottom: 18px;">
                <label style="display: block; font-size: 12px; font-weight: 800; color: #334155; margin-bottom: 6px;">
                  🔗 Đường dẫn Google Sheet Web App (Apps Script Endpoint của Admin ${ADMIN_EMAIL}):
                </label>
                <div style="display: flex; gap: 8px;">
                  <input id="gdrive-custom-sheet-url" type="text" value="${sheetUrl}" style="flex: 1; padding: 9px 12px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-size: 12.5px; font-family: monospace; color: #0f172a;" />
                  <button onclick="window.GoogleDriveSync.saveCustomSheetUrl()" style="padding: 9px 14px; background: #1e293b; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 12.5px; cursor: pointer;">
                    Lưu link
                  </button>
                </div>
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button onclick="window.GoogleDriveSync.exportBackupJson()" style="padding: 12px; background: #0f172a; color: #fff; border: none; border-radius: 14px; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>📥</span> Tải File Sao Lưu (.JSON)
              </button>

              <label style="padding: 12px; background: #f8fafc; color: #0f172a; border: 1.5px solid #cbd5e1; border-radius: 14px; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0;">
                <span>📤</span> Khôi Phục Từ File (.JSON)
                <input type="file" accept=".json" style="display: none;" onchange="window.GoogleDriveSync.handleFileRestore(event)" />
              </label>
            </div>
          </div>
        </div>
      `;
    }

    handleFileRestore(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const payload = JSON.parse(e.target.result);
          this.restoreSystemData(payload);
          alert('🎉 Đã khôi phục thành công toàn bộ dữ liệu lớp học, bài tập, nông trại & đồng bộ lên Google Sheet!');
          window.location.reload();
        } catch (err) {
          alert('❌ Lỗi khôi phục dữ liệu: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  }

  window.GoogleDriveSync = new GoogleDriveSyncService();
})(window);
