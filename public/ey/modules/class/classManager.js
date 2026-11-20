/**
 * Class Manager Module for EY
 * Chuẩn PomyAI & OLM — Quản lý lớp, Thêm học sinh hàng loạt, Tự sinh ID + PIN, Xuất PDF/In thẻ
 */

(function (window) {
  'use strict';

  class EyClassManager {
    constructor() {
      this.selectedClassId = null;
      this.activeTab = 'students'; // 'students' | 'assignments' | 'stats'
    }

    render(container) {
      if (!window.EyAuth) return;
      const classes = window.EyAuth.getAllClasses();

      // Nếu chưa chọn lớp thì mặc định chọn lớp đầu tiên
      if (!this.selectedClassId || !classes.find(c => c.id === this.selectedClassId)) {
        this.selectedClassId = classes[0] ? classes[0].id : null;
      }

      const currentClass = classes.find(c => c.id === this.selectedClassId);

      container.innerHTML = `
        <div class="class-manager-wrapper" style="max-width: 1200px; margin: 0 auto;">
          <!-- Top Header & Breadcrumb -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; font-weight: 600;">
              <span style="color: #0d9488; cursor: pointer;" onclick="window.EyClassUI.showClassListModal()">🗂️ Danh sách lớp (${classes.length})</span>
              <span>›</span>
              <span style="color: #0f172a; font-weight: 700;">${currentClass ? currentClass.name : 'Chưa có lớp'}</span>
            </div>

            <div style="display: flex; gap: 10px;">
              <button onclick="window.GoogleDriveSync.showCloudDialog()" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
                <span>☁️ Google Drive</span>
              </button>
              <button onclick="window.EyClassUI.showCreateClassModal()" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
                <span>+ Tạo lớp mới</span>
              </button>
            </div>
          </div>

          ${currentClass ? this.renderClassDetails(currentClass) : this.renderEmptyState()}
        </div>
      `;
    }

    renderEmptyState() {
      return `
        <div style="text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 20px; border: 1px dashed var(--border);">
          <div style="font-size: 54px; margin-bottom: 16px;">🏫</div>
          <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">Chưa có lớp học nào</h3>
          <p style="color: var(--text-muted); font-size: 14px; max-width: 400px; margin: 0 auto 20px;">Hãy tạo lớp học đầu tiên để thêm học sinh và cấp tài khoản tham gia Trò chơi hành trình!</p>
          <button onclick="window.EyClassUI.showCreateClassModal()" style="padding: 10px 20px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">
            + Tạo lớp học mới ngay
          </button>
        </div>
      `;
    }

    renderClassDetails(cls) {
      const students = window.EyAuth.getStudentsByClass(cls.id);

      return `
        <!-- Class Overview Card (Chuẩn PomyAI) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 22px; margin-bottom: 22px; box-shadow: var(--shadow);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 56px; height: 56px; background: #ecfdf5; color: #0d9488; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 1px solid #a7f3d0;">
                📋
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h2 style="font-size: 22px; font-weight: 800; margin: 0; color: var(--text-main);">${cls.name}</h2>
                  <span style="background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">${cls.grade}</span>
                  <span style="background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">👥 ${students.length} học sinh</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 13px; color: var(--text-muted);">
                  <span>MÃ LỚP:</span>
                  <strong style="color: #0d9488; font-family: monospace; font-size: 14px; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">${cls.code}</strong>
                  <button onclick="navigator.clipboard.writeText('${cls.code}'); alert('Đã sao chép mã lớp: ${cls.code}')" style="background: none; border: none; cursor: pointer; color: #64748b; font-size: 13px;" title="Sao chép mã lớp">❐</button>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button onclick="window.EyClassUI.showBatchAddStudentModal('${cls.id}')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.25);">
                <span>+ Thêm tên học sinh</span>
              </button>
              <button onclick="window.EyClassUI.exportStudentCredentialsPdf('${cls.id}')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer;">
                <span>📥 Tải PDF tài khoản</span>
              </button>
              <button onclick="window.EyClassUI.deleteClassConfirm('${cls.id}')" style="padding: 10px; background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer;" title="Xóa lớp này">
                🗑️
              </button>
            </div>
          </div>

          <!-- Class Tabs (Học sinh | Bài tập | Thống kê) -->
          <div style="display: flex; gap: 24px; border-bottom: 2px solid #e2e8f0; margin-top: 24px;">
            <div onclick="window.EyClassUI.switchClassTab('students')" style="padding: 10px 4px; font-weight: 700; font-size: 14px; cursor: pointer; color: ${this.activeTab === 'students' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -2px;">
              👥 Học sinh (${students.length})
            </div>
            <div onclick="window.EyClassUI.switchClassTab('assignments')" style="padding: 10px 4px; font-weight: 700; font-size: 14px; cursor: pointer; color: ${this.activeTab === 'assignments' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -2px;">
              📝 Bài tập & Đề thi
            </div>
            <div onclick="window.EyClassUI.switchClassTab('stats')" style="padding: 10px 4px; font-weight: 700; font-size: 14px; cursor: pointer; color: ${this.activeTab === 'stats' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -2px;">
              📊 Thống kê & Tiến độ
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        ${this.activeTab === 'students' ? this.renderStudentsTable(students, cls) : ''}
        ${this.activeTab === 'assignments' ? this.renderAssignmentsTab(cls) : ''}
        ${this.activeTab === 'stats' ? this.renderStatsTab(students, cls) : ''}
      `;
    }

    renderStudentsTable(students, cls) {
      if (students.length === 0) {
        return `
          <div style="background: var(--bg-card); border-radius: 16px; padding: 40px 20px; text-align: center; border: 1px solid var(--border);">
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 14px;">Lớp này chưa có học sinh nào. Hãy bấm "Thêm tên học sinh" để nhập danh sách nhanh!</p>
            <button onclick="window.EyClassUI.showBatchAddStudentModal('${cls.id}')" style="padding: 8px 16px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">
              + Thêm tên học sinh
            </button>
          </div>
        `;
      }

      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow);">
          <div style="padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fafafa;">
            <span style="font-size: 13px; font-weight: 700; color: #64748b;">${students.length} HỌC SINH</span>
            <span style="font-size: 12px; color: #0d9488; font-weight: 600;">Học sinh dùng TÀI KHOẢN + MẬT KHẨU để đăng nhập vào làm bài và chơi game</span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
              <thead>
                <tr style="background: #f8fafc; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 12px 20px;">STT</th>
                  <th style="padding: 12px 20px;">Họ và Tên</th>
                  <th style="padding: 12px 20px;">Tài khoản</th>
                  <th style="padding: 12px 20px;">Mật khẩu</th>
                  <th style="padding: 12px 20px; text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${students.map((s, idx) => `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 14px 20px; color: #94a3b8; font-weight: 600;">${idx + 1}</td>
                    <td style="padding: 14px 20px; font-weight: 700; color: var(--text-main);">${s.name}</td>
                    <td style="padding: 14px 20px; font-family: monospace; font-size: 14px; font-weight: 600; color: #334155;">
                      <span>${s.id}</span>
                      <button onclick="navigator.clipboard.writeText('${s.id}'); alert('Đã chép tài khoản: ${s.id}')" style="background: none; border: none; cursor: pointer; color: #94a3b8; margin-left: 6px;" title="Sao chép">❐</button>
                    </td>
                    <td style="padding: 14px 20px; font-family: monospace; font-size: 14px; font-weight: 700; color: #0d9488;">
                      <span>${s.pin}</span>
                      <button onclick="navigator.clipboard.writeText('${s.pin}'); alert('Đã chép mật khẩu: ${s.pin}')" style="background: none; border: none; cursor: pointer; color: #94a3b8; margin-left: 6px;" title="Sao chép">❐</button>
                    </td>
                    <td style="padding: 14px 20px; text-align: right;">
                      <button onclick="window.EyClassUI.resetPinConfirm('${s.id}', '${s.name}')" style="padding: 5px 10px; background: #f0fdfa; color: #0f766e; border: 1px solid #ccfbf1; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; margin-right: 6px;">
                        🔑 Đặt lại MK
                      </button>
                      <button onclick="window.EyClassUI.deleteStudentConfirm('${s.id}', '${s.name}')" style="padding: 5px 8px; background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
                        ✕
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderAssignmentsTab(cls) {
      setTimeout(() => {
        const mount = document.getElementById('class-assignments-mount');
        if (mount && window.EyAssignmentManager) {
          window.EyAssignmentManager.renderClassAssignments(mount, cls);
        }
      }, 20);

      return `
        <div id="class-assignments-mount">
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; padding: 40px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">⏳</div>
            <div style="font-size: 14px; color: #64748b; font-weight: 700;">Đang tải danh sách bài tập & đề thi của lớp ${cls.name}...</div>
          </div>
        </div>
      `;
    }

    renderStatsTab(students, cls) {
      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; padding: 24px; box-shadow: var(--shadow);">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 800;">Tiến độ Trò chơi Hành trình — ${cls.name}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px; color: #166534;">Trò chơi 1: Nông Trại</span>
                <span style="font-size: 22px;">🌾</span>
              </div>
              <div style="margin-top: 10px; font-size: 24px; font-weight: 900; color: #15803d;">8 / 8 HS</div>
              <div style="font-size: 12px; color: #166534; margin-top: 4px;">Đã sẵn sàng tham gia nuôi gà & ấp trứng</div>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 18px; border-radius: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px; color: #1e40af;">Trò chơi 2: Vườn Hoa</span>
                <span style="font-size: 22px;">🌺</span>
              </div>
              <div style="margin-top: 10px; font-size: 24px; font-weight: 900; color: #1d4ed8;">8 / 8 HS</div>
              <div style="font-size: 12px; color: #1e40af; margin-top: 4px;">Đã sẵn sàng trồng hoa & tích lũy giọt nước</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // UI Helper handlers & Modals
  window.EyClassUI = {
    manager: new EyClassManager(),

    render(container) {
      this.manager.render(container);
    },

    switchClassTab(tab) {
      this.manager.activeTab = tab;
      const c = document.getElementById('content-area');
      if (c) this.render(c);
    },

    selectClass(classId) {
      this.manager.selectedClassId = classId;
      const c = document.getElementById('content-area');
      if (c) this.render(c);
    },

    // Modal chọn lớp
    showClassListModal() {
      const classes = window.EyAuth.getAllClasses();
      const modal = document.createElement('div');
      modal.id = 'class-list-modal';
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
          <div style="background: #fff; width: min(440px, 92vw); border-radius: 20px; padding: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 800;">Chọn Lớp Học</h3>
              <button onclick="document.getElementById('class-list-modal').remove()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8;">&times;</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${classes.map(c => `
                <div onclick="window.EyClassUI.selectClass('${c.id}'); document.getElementById('class-list-modal').remove();" style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s;" onmouseover="this.style.borderColor='#0d9488'; this.style.background='#f0fdfa';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#fff';">
                  <div>
                    <strong style="color: #0f172a; font-size: 15px;">${c.name}</strong>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${c.grade} · ${c.studentCount || 0} học sinh · Mã: ${c.code}</div>
                  </div>
                  <span style="color: #0d9488; font-weight: 700;">›</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    // Modal tạo lớp mới
    showCreateClassModal() {
      const modal = document.createElement('div');
      modal.id = 'create-class-modal';
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
          <div style="background: #fff; width: min(420px, 92vw); border-radius: 20px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 800;">Tạo Lớp Học Mới</h3>
              <button onclick="document.getElementById('create-class-modal').remove()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #94a3b8;">&times;</button>
            </div>
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px;">Tên lớp học:</label>
              <input type="text" id="new-class-name" placeholder="Ví dụ: 10A1, 11B2, Toán Thầy Hùng..." style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; box-sizing: border-box;" />
            </div>
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px;">Khối lớp:</label>
              <select id="new-class-grade" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; box-sizing: border-box;">
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
                <option value="Khối 9">Khối 9</option>
                <option value="Khối 8">Khối 8</option>
                <option value="Khối 7">Khối 7</option>
                <option value="Khối 6">Khối 6</option>
                <option value="Tiểu học">Tiểu học</option>
              </select>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button onclick="document.getElementById('create-class-modal').remove()" style="padding: 10px 16px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">Hủy</button>
              <button id="btn-submit-create-class" style="padding: 10px 20px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">Tạo Lớp</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-submit-create-class').onclick = () => {
        const name = modal.querySelector('#new-class-name').value;
        const grade = modal.querySelector('#new-class-grade').value;
        if (!name.trim()) { alert('Vui lòng nhập tên lớp học!'); return; }
        const created = window.EyAuth.createClass(name, grade);
        modal.remove();
        this.selectClass(created.id);
      };
    },

    // Modal thêm học sinh hàng loạt (chuẩn PomyAI trích từ video)
    showBatchAddStudentModal(classId) {
      const modal = document.createElement('div');
      modal.id = 'batch-student-modal';
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
          <div style="background: #fff; width: min(520px, 92vw); border-radius: 24px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 20px; font-weight: 800;">Thêm tên học sinh</h3>
              <button onclick="document.getElementById('batch-student-modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8;">&times;</button>
            </div>

            <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">
              Dán danh sách tên học sinh (mỗi em một dòng). Hệ thống sẽ tự động cấp <strong>Tài khoản (ID)</strong> và <strong>Mật khẩu PIN 6 số</strong> chuẩn PomyAI & OLM.
            </p>

            <textarea id="batch-names-input" placeholder="Nguyễn Văn A&#10;Nguyễn Văn Linh&#10;Trần Thị Hằng&#10;Trần Thị Yến..." style="width: 100%; height: 200px; padding: 14px; border: 1px solid #cbd5e1; border-radius: 14px; font-size: 14px; font-family: inherit; line-height: 1.5; resize: vertical; box-sizing: border-box;"></textarea>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px;">
              <span id="detected-count" style="font-size: 13px; font-weight: 700; color: #0d9488;">0 học sinh</span>
              <div style="display: flex; gap: 10px;">
                <button onclick="document.getElementById('batch-student-modal').remove()" style="padding: 10px 18px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">Hủy</button>
                <button id="btn-submit-batch-students" style="padding: 10px 22px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">Thêm học sinh</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const ta = modal.querySelector('#batch-names-input');
      const counter = modal.querySelector('#detected-count');
      const submitBtn = modal.querySelector('#btn-submit-batch-students');

      ta.oninput = () => {
        const lines = ta.value.split('\n').map(l => l.trim()).filter(Boolean);
        counter.textContent = `${lines.length} học sinh`;
        submitBtn.textContent = lines.length > 0 ? `Thêm ${lines.length} học sinh` : 'Thêm học sinh';
      };

      submitBtn.onclick = () => {
        const lines = ta.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) { alert('Vui lòng nhập ít nhất 1 tên học sinh!'); return; }
        window.EyAuth.addStudentsBatch(classId, lines);
        modal.remove();
        const c = document.getElementById('content-area');
        if (c) this.render(c);
      };
    },

    // Đặt lại mật khẩu PIN
    resetPinConfirm(studentId, name) {
      if (confirm(`Bạn có chắc muốn cấp mật khẩu PIN mới cho học sinh ${name}?`)) {
        const newPin = window.EyAuth.resetStudentPin(studentId);
        alert(`Đã cấp mật khẩu mới cho ${name}: ${newPin}`);
        const c = document.getElementById('content-area');
        if (c) this.render(c);
      }
    },

    // Xóa học sinh
    deleteStudentConfirm(studentId, name) {
      if (confirm(`Bạn có chắc muốn xóa học sinh "${name}" khỏi lớp?`)) {
        window.EyAuth.deleteStudent(studentId);
        const c = document.getElementById('content-area');
        if (c) this.render(c);
      }
    },

    // Xóa lớp
    deleteClassConfirm(classId) {
      if (confirm('Bạn có chắc muốn xóa lớp học này và toàn bộ danh sách học sinh thuộc lớp?')) {
        window.EyAuth.deleteClass(classId);
        this.manager.selectedClassId = null;
        const c = document.getElementById('content-area');
        if (c) this.render(c);
      }
    },

    // Xuất thẻ tài khoản / PDF chuẩn in ấn phát cho học sinh (Printable Cards)
    exportStudentCredentialsPdf(classId) {
      const classes = window.EyAuth.getAllClasses();
      const cls = classes.find(c => c.id === classId);
      const students = window.EyAuth.getStudentsByClass(classId);

      if (!cls || students.length === 0) {
        alert('Lớp chưa có học sinh để xuất thẻ tài khoản!');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thẻ Tài Khoản Học Sinh - ${cls.name}</title>
          <meta charset="utf-8">
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #1e293b; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
            .header h1 { margin: 0 0 6px 0; font-size: 22px; color: #0d9488; }
            .header p { margin: 0; font-size: 13px; color: #64748b; }
            .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
            .card { border: 1.5px dashed #0d9488; border-radius: 12px; padding: 14px 18px; background: #fafafa; page-break-inside: avoid; }
            .card-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0d9488; margin-bottom: 6px; display: flex; justify-content: space-between; }
            .student-name { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .cred-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }
            .cred-label { color: #64748b; font-weight: 600; }
            .cred-val { font-family: monospace; font-size: 15px; font-weight: 800; color: #0f172a; }
            .pin-val { color: #0d9488; }
            .instructions { margin-top: 6px; font-size: 11px; color: #64748b; text-align: center; font-style: italic; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; margin-bottom: 16px;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #0d9488; color: #fff; font-weight: 800; font-size: 15px; border: none; border-radius: 8px; cursor: pointer;">
              🖨️ In Danh Sách / Lưu Thành File PDF
            </button>
            <span style="margin-left: 14px; font-size: 13px; color: #166534;">(Mẹo: Chọn "Save as PDF" trong mục Máy in để lưu file PDF)</span>
          </div>

          <div class="header">
            <h1>THẺ TÀI KHOẢN HỌC SINH — ${cls.name} (${cls.grade})</h1>
            <p>Mã Lớp: <strong>${cls.code}</strong> · Sử dụng để đăng nhập Cổng Học Sinh làm bài tập & chơi Trò Chơi Hành Trình</p>
          </div>

          <div class="cards-grid">
            ${students.map((s, idx) => `
              <div class="card">
                <div class="card-title">
                  <span>SmartEdu · Cổng Học Sinh</span>
                  <span>MÃ LỚP: ${cls.code}</span>
                </div>
                <div class="student-name">${idx + 1}. ${s.name}</div>
                <div class="cred-row">
                  <span class="cred-label">Tài khoản (ID):</span>
                  <span class="cred-val">${s.id}</span>
                </div>
                <div class="cred-row">
                  <span class="cred-label">Mật khẩu (PIN):</span>
                  <span class="cred-val pin-val">${s.pin}</span>
                </div>
                <div class="instructions">Giữ bí mật thẻ tài khoản này để tham gia Nông Trại & Vườn Hoa</div>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  window.EyClassManager = EyClassManager;
})(window);
