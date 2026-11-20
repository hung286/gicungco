// ============================================================================
// KHỐI 2: TRANG QUẢN TRỊ GIÁO VIÊN (DASHBOARD CMS) - POMYAI / MHEDU
// Tác giả: Thầy Hùng - Trường THPT Số 1 Lê Hồng Phong
// Hotline / Zalo: 0965908084 | Email: nmh28691@gmail.com | STK BIDV: 6320495851
// Bản quyền: Hoàn toàn Miễn phí 100% cho Giáo viên và Học sinh toàn quốc
// ============================================================================

(function(global) {
  const TEACHER_INFO = global.TEACHER_PROFILE || {
    name: "Thầy Hùng",
    school: "Trường THPT Số 1 Lê Hồng Phong",
    phone: "0965908084",
    zalo: "0965908084",
    email: "nmh28691@gmail.com",
    facebook: "https://fb.com/doiten234",
    donate: { bank: "BIDV", accountNumber: "6320495851", accountName: "NGUYEN MANH HUNG" },
    policy: "Hoàn toàn Miễn Phí 100% cho Giáo Viên và Học Sinh"
  };

  class TeacherDashboardCMS {
    constructor() {
      this.storage = global.EyStorageEngine;
      this.container = null;
      this.currentTab = 'questions'; // 'questions' | 'roster' | 'rooms'
    }

    render(container) {
      this.container = container;
      if (window.EyAuth && window.EyAuth.isStudent()) {
        container.innerHTML = `
          <div style="max-width: 600px; margin: 60px auto; padding: 40px; background: #fff; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); font-family: 'Be Vietnam Pro', sans-serif;">
            <div style="font-size: 56px; margin-bottom: 16px;">🛡️</div>
            <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Khu vực Quản trị dành riêng cho Giáo viên</h2>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.6;">
              Ở chế độ Học sinh, bạn chỉ có thể <strong>Xem</strong>, <strong>Học</strong> và <strong>Chơi trò chơi</strong>. Các tính năng quản trị ngân hàng câu hỏi, tạo phòng và quản lý sĩ số lớp đã được khóa an toàn.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button onclick="window.switchTab('hocTap')" style="padding: 12px 24px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer;">
                📖 Đến Sổ tay Học tập
              </button>
              <button onclick="window.switchTab('troChoi')" style="padding: 12px 24px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 800; cursor: pointer;">
                🎮 Chơi Trò chơi
              </button>
            </div>
          </div>
        `;
        return;
      }
      if (!this.storage) return;

      const room = this.storage.getActiveRoom();
      if (!room) return;

      container.innerHTML = `
        <div class="cms-shell" style="display: flex; height: 100%; width: 100%; background: #090d16; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; position: relative;">
          <!-- Left Navigation Sidebar -->
          <div style="width: 260px; background: #0f172a; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0;">
            <div>
              <!-- Brand Header -->
              <div style="padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 14px rgba(249,115,22,0.4);">
                  🎓
                </div>
                <div>
                  <div style="font-weight: 900; font-size: 15px; color: #fde047; letter-spacing: 0.5px;">POMYAI · MHEDU</div>
                  <div style="font-size: 11px; color: #94a3b8;">Quản Trị Giáo Viên Cấp Cao</div>
                </div>
              </div>

              <!-- Teacher Info Card -->
              <div style="margin: 14px 14px 10px 14px; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;">
                <div style="font-size: 10.5px; text-transform: uppercase; color: #f59e0b; font-weight: 800; letter-spacing: 0.5px;">Giáo viên phụ trách</div>
                <div style="font-weight: 900; font-size: 14px; color: #ffffff; margin-top: 2px;">${TEACHER_INFO.name}</div>
                <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 2px;">${TEACHER_INFO.school}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; pt: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #94a3b8;">
                  <span>Hotline: <b style="color: #fde047;">${TEACHER_INFO.phone}</b></span>
                  <span style="color: #4ade80; font-weight: 800;">✓ Miễn phí</span>
                </div>
              </div>

              <!-- Active Room Badge -->
              <div style="margin: 0 14px 14px 14px; padding: 10px 12px; background: rgba(234, 88, 12, 0.12); border: 1px solid rgba(234, 88, 12, 0.3); border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 800; color: #fb923c;">PHÒNG ĐANG CHỌN</span>
                  <span style="font-size: 12px; font-weight: 900; color: #4ade80;">PIN: ${room.pin}</span>
                </div>
                <div style="font-size: 12.5px; font-weight: 700; color: #ffffff; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${room.title}">
                  ${room.title}
                </div>
              </div>

              <!-- Nav Menu Buttons -->
              <nav style="padding: 0 12px; display: flex; flex-direction: column; gap: 4px;">
                <button class="cms-nav-tab ${this.currentTab === 'questions' ? 'active' : ''}" data-tab="questions" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border-radius: 12px; border: none; background: ${this.currentTab === 'questions' ? 'linear-gradient(90deg, #ea580c, #c2410c)' : 'transparent'}; color: white; font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: all 0.15s;">
                  <span>📝</span> Quản lý Bộ Câu hỏi (${room.questions.length})
                </button>
                <button class="cms-nav-tab ${this.currentTab === 'roster' ? 'active' : ''}" data-tab="roster" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border-radius: 12px; border: none; background: ${this.currentTab === 'roster' ? 'linear-gradient(90deg, #ea580c, #c2410c)' : 'transparent'}; color: white; font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: all 0.15s;">
                  <span>👥</span> Danh sách Học sinh (${room.roster.length})
                </button>
                <button class="cms-nav-tab ${this.currentTab === 'rooms' ? 'active' : ''}" data-tab="rooms" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border-radius: 12px; border: none; background: ${this.currentTab === 'rooms' ? 'linear-gradient(90deg, #ea580c, #c2410c)' : 'transparent'}; color: white; font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: all 0.15s;">
                  <span>🚪</span> Danh sách Phòng chơi
                </button>
              </nav>
            </div>

            <!-- Footer Author Badge -->
            <div style="padding: 14px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); font-size: 11.5px; color: #94a3b8;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Ủng hộ tác giả:</span>
                <b style="color: #fde047;">BIDV 6320495851</b>
              </div>
              <a href="/" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 8px 0; background: rgba(255,255,255,0.08); color: white; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 6px; font-size: 12px;">
                <span>🏠</span> Quay lại Trang chủ
              </a>
            </div>
          </div>

          <!-- Main Content Workspace -->
          <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #090d16;">
            <!-- Top Actions Header Bar -->
            <div style="height: 60px; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; background: #0f172a;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <h2 style="font-size: 17px; font-weight: 900; color: #ffffff; margin: 0;">
                  ${this.getTabTitle()}
                </h2>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <button id="cms-btn-new-room" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 7px 14px; border-radius: 10px; font-weight: 700; font-size: 12.5px; cursor: pointer;">
                  ➕ Tạo phòng mới
                </button>
                <button id="cms-btn-start-game-client" style="background: linear-gradient(180deg, #10b981, #059669); border: 2px solid #6ee7b7; color: white; padding: 8px 22px; border-radius: 12px; font-weight: 900; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.35); display: flex; align-items: center; gap: 8px;">
                  <span>🎮</span> Bắt đầu chơi (Game Client)
                </button>
              </div>
            </div>

            <!-- Tab Content Container -->
            <div id="cms-main-content-scroll" style="flex: 1; overflow-y: auto; padding: 24px;">
              ${this.renderTabBody(room)}
            </div>
          </div>
        </div>
      `;

      this.bindEvents(container, room);
      if (global.FileParser) {
        global.FileParser.renderMath(container);
      }
    }

    getTabTitle() {
      if (this.currentTab === 'questions') return '📝 Quản lý Bộ Câu hỏi & Đề thi iMath / Azota';
      if (this.currentTab === 'roster') return '👥 Lưới Danh sách Học sinh (Excel Grid Roster)';
      if (this.currentTab === 'rooms') return '🚪 Quản lý Phòng học & Cấu hình';
      return '';
    }

    renderTabBody(room) {
      if (this.currentTab === 'questions') {
        return `
          <!-- Toolbar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 14px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <label style="background: linear-gradient(180deg, #2563eb, #1d4ed8); border: 1px solid #93c5fd; color: white; padding: 8px 18px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                <span>📥</span> Tải lên File Word (.docx) chuẩn iMath / Azota
                <input type="file" id="cms-input-docx" accept=".docx" style="display: none;" />
              </label>

              <label style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <span>📊</span> Tải lên Excel (.xlsx) / CSV
                <input type="file" id="cms-input-text" accept=".txt,.csv,.xlsx" style="display: none;" />
              </label>
            </div>

            <button id="cms-btn-add-manual" style="background: linear-gradient(180deg, #ea580c, #c2410c); border: 1px solid #fed7aa; color: white; padding: 8px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer;">
              ➕ Thêm Câu hỏi Thủ công
            </button>
          </div>

          <!-- Questions List -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${room.questions.length === 0 ? `
              <div style="text-align: center; padding: 60px 20px; background: #0f172a; border-radius: 16px; border: 2px dashed rgba(255,255,255,0.15);">
                <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                <div style="font-size: 16px; font-weight: 800; color: #fde047;">Chưa có câu hỏi nào trong phòng!</div>
                <p style="font-size: 13px; color: #94a3b8; max-width: 440px; margin: 8px auto 20px auto;">
                  Hãy tải lên file đề Word (.docx) chuẩn iMath hoặc Azota để hệ thống tự động bóc tách câu hỏi, đáp án và hình vẽ đồ thị.
                </p>
              </div>
            ` : room.questions.map((q, idx) => {
              const typeBadge = q.type === 'tf' 
                ? '<span style="background: #8b5cf6; color: white; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Đúng / Sai (Phần II)</span>'
                : (q.type === 'short' 
                  ? '<span style="background: #10b981; color: white; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Trả lời ngắn (Phần III)</span>'
                  : '<span style="background: #3b82f6; color: white; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Trắc nghiệm (Phần I)</span>');

              return `
              <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px 22px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                  <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1;">
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                      <span style="background: #ea580c; color: white; font-weight: 900; font-size: 12px; padding: 4px 10px; border-radius: 8px; flex-shrink: 0;">
                        Câu ${idx + 1}
                      </span>
                      ${typeBadge}
                    </div>
                    <div style="font-size: 14.5px; font-weight: 600; color: #f8fafc; line-height: 1.6; flex: 1;">
                      ${q.content}
                    </div>
                  </div>
                  <button class="cms-del-q-btn" data-idx="${idx}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12px;">✕ Xóa</button>
                </div>

                ${q.image ? `
                  <div style="margin: 12px 0 12px 42px; display: inline-block; position: relative;">
                    <img src="${q.image}" class="imath-diagram-thumb" style="max-height: 140px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); cursor: zoom-in;" title="Bấm để phóng to sơ đồ iMath" />
                    <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); color: #fde047; font-size: 10px; padding: 2px 6px; border-radius: 4px; pointer-events: none;">🔍 Bấm để Zoom</span>
                  </div>
                ` : ''}

                ${q.type === 'tf' && q.subItems && q.subItems.length > 0 ? `
                  <div style="display: flex; flex-direction: column; gap: 8px; margin: 14px 0 0 42px;">
                    ${q.subItems.map(sub => `
                      <div style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid ${sub.isCorrect ? '#22c55e' : 'rgba(255,255,255,0.1)'};">
                        <span style="font-weight: 800; color: #f59e0b; font-size: 13px;">Ý ${sub.key})</span>
                        <span style="flex: 1; font-size: 13.5px; color: #f8fafc;">${sub.text}</span>
                        <span style="font-weight: 900; font-size: 11.5px; padding: 3px 10px; border-radius: 6px; background: ${sub.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}; border: 1px solid ${sub.isCorrect ? '#22c55e' : '#ef4444'}; color: ${sub.isCorrect ? '#86efac' : '#fca5a5'};">
                          ${sub.isCorrect ? '✓ ĐÚNG' : '✕ SAI'}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                ` : (q.type === 'short' ? `
                  <div style="margin: 14px 0 0 42px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; background: rgba(16,185,129,0.15); border: 1.5px solid #10b981; color: #6ee7b7; font-weight: 800; font-size: 13.5px;">
                    <span>🎯 Đáp án chuẩn:</span>
                    <span style="color: #fff; font-size: 15px; font-weight: 900;">${q.correctValue || q.correctAnswer}</span>
                  </div>
                ` : `
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 14px 0 0 42px;">
                    ${(q.options || []).map(opt => `
                      <div style="padding: 8px 12px; border-radius: 10px; font-size: 13px; display: flex; align-items: center; gap: 8px; background: ${opt.key === q.correctAnswer ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${opt.key === q.correctAnswer ? '#22c55e' : 'rgba(255,255,255,0.08)'}; color: ${opt.key === q.correctAnswer ? '#86efac' : '#cbd5e1'};">
                        <span style="font-weight: 900; color: ${opt.key === q.correctAnswer ? '#22c55e' : '#94a3b8'};">${opt.key}.</span>
                        <span>${opt.text}</span>
                        ${opt.key === q.correctAnswer ? '<span style="margin-left: auto; color: #4ade80; font-weight: 900;">✓</span>' : ''}
                      </div>
                    `).join('')}
                  </div>
                `)}

                ${q.explanation ? `
                  <div style="margin: 12px 0 0 42px; font-size: 12px; color: #94a3b8; font-style: italic;">
                    💡 Lời giải: ${q.explanation}
                  </div>
                ` : ''}
              </div>
            `;
            }).join('')}
          </div>
        `;
      } else if (this.currentTab === 'roster') {
        return `
          <div style="max-width: 900px; margin: 0 auto;">
            <div style="background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); padding: 24px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #fde047;">Dán nhanh từ Excel / Google Sheets</h3>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Copy cột danh sách họ và tên học sinh trong bảng tính Excel rồi dán thẳng vào ô bên dưới:</p>
                </div>
                <span style="font-size: 13px; font-weight: 800; color: #4ade80; background: rgba(74, 222, 128, 0.1); padding: 6px 14px; border-radius: 999px;">
                  Sĩ số: ${room.roster.length} học sinh
                </span>
              </div>

              <textarea id="cms-paste-roster-box" placeholder="Ví dụ:\\nNguyễn Văn An\\nTrần Thị Bích\\nLê Hoàng Long..." style="width: 100%; height: 140px; background: #020617; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: white; padding: 12px 14px; font-family: inherit; font-size: 13.5px; resize: vertical; box-sizing: border-box;"></textarea>

              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
                <button id="cms-btn-submit-roster" style="background: linear-gradient(180deg, #ea580c, #c2410c); border: 1px solid #fed7aa; color: white; padding: 10px 24px; border-radius: 10px; font-weight: 800; font-size: 13.5px; cursor: pointer;">
                  ✓ Cập nhật Danh sách Học sinh
                </button>
              </div>
            </div>

            <!-- Roster Grid Preview -->
            <div style="background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); padding: 20px;">
              <div style="font-size: 14px; font-weight: 800; color: #f8fafc; margin-bottom: 14px;">Danh sách hiển thị trong game:</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                ${room.roster.map((st, i) => `
                  <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                      <span style="font-size: 12px; color: #f59e0b; font-weight: 800;">${i + 1}.</span>
                      <span style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.name || st}</span>
                    </div>
                    <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; color: #cbd5e1; flex-shrink: 0;">
                      ${st.shortName || (st.name ? st.name.split(' ').pop() : st)}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else if (this.currentTab === 'rooms') {
        const allRooms = this.storage.getAllRooms();
        return `
          <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
            ${allRooms.map(r => `
              <div style="background: #0f172a; border: 2px solid ${r.id === room.id ? '#ea580c' : 'rgba(255,255,255,0.08)'}; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 900; font-size: 15px; color: white;">${r.title}</span>
                    ${r.id === room.id ? `<span style="background: #ea580c; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">Đang chọn</span>` : ''}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                    Mã PIN: <b style="color: #4ade80;">${r.pin}</b> | Lớp: ${r.grade} | ${r.questions.length} câu hỏi | ${r.roster.length} học sinh
                  </div>
                </div>

                <div>
                  ${r.id !== room.id ? `
                    <button class="cms-select-room-btn" data-id="${r.id}" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12px;">Chọn phòng</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      return '';
    }

    bindEvents(container, room) {
      // Tab switcher
      container.querySelectorAll('.cms-nav-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.currentTab = e.currentTarget.dataset.tab;
          this.render(container);
        });
      });

      // Launch Game Client
      const launchBtn = container.querySelector('#cms-btn-start-game-client');
      if (launchBtn) {
        launchBtn.addEventListener('click', () => {
          if (global.launch3DGameClient) {
            global.launch3DGameClient(room);
          } else if (global.openItem) {
            global.openItem('goiTen', 'chay-tron-thay-co');
          }
        });
      }

      // Diagram Zoom Overlay click
      container.querySelectorAll('.imath-diagram-thumb').forEach(img => {
        img.addEventListener('click', (e) => {
          if (global.ZoomPanOverlay) {
            global.ZoomPanOverlay.open(e.target.src);
          }
        });
      });

      // Upload Docx
      const docxInput = container.querySelector('#cms-input-docx');
      if (docxInput) {
        docxInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            alert('Đang đọc và phân tích cấu trúc file Word (.docx) chuẩn iMath & Azota...');
            const questions = await global.FileParser.parseDocx(file);
            this.storage.updateActiveRoom(r => {
              r.questions = questions;
            });
            alert(`Thành công! Đã trích xuất ${questions.length} câu hỏi & hình ảnh từ file.`);
            this.render(container);
          } catch (err) {
            alert('Lỗi import file docx: ' + err.message);
          }
        });
      }

      // Upload Text / CSV
      const textInput = container.querySelector('#cms-input-text');
      if (textInput) {
        textInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const content = evt.target.result;
            const questions = global.FileParser.parseTextOrCsv(content);
            this.storage.updateActiveRoom(r => {
              r.questions = questions;
            });
            alert(`Thành công! Đã phân tích ${questions.length} câu hỏi.`);
            this.render(container);
          };
          reader.readAsText(file);
        });
      }

      // Delete Question
      container.querySelectorAll('.cms-del-q-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx, 10);
          if (confirm(`Xác nhận xóa câu hỏi số ${idx + 1}?`)) {
            this.storage.updateActiveRoom(r => {
              r.questions.splice(idx, 1);
            });
            this.render(container);
          }
        });
      });

      // Apply Excel Roster Paste
      const submitRosterBtn = container.querySelector('#cms-btn-submit-roster');
      if (submitRosterBtn) {
        submitRosterBtn.addEventListener('click', () => {
          const text = container.querySelector('#cms-paste-roster-box').value;
          const names = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
          if (names.length === 0) {
            alert('Vui lòng dán danh sách tên học sinh vào ô văn bản!');
            return;
          }
          const newRoster = names.map((name, idx) => {
            const parts = name.split(/\s+/);
            const shortName = parts[parts.length - 1] || name;
            return {
              id: 'st_' + (idx + 1),
              name,
              shortName,
              gender: idx % 2 === 0 ? 'nam' : 'nu',
              avatarIndex: idx % 6,
              status: 'ready',
              score: 0,
              violations: 0
            };
          });

          this.storage.updateActiveRoom(r => {
            r.roster = newRoster;
          });
          alert(`Đã cập nhật thành công sĩ số ${newRoster.length} học sinh!`);
          this.render(container);
        });
      }

      // Create Room
      const createRoomBtn = container.querySelector('#cms-btn-new-room');
      if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
          const title = prompt('Nhập tên phòng học / bài kiểm tra mới:', 'Bài tập chuyên đề Toán - THPT Số 1 Lê Hồng Phong');
          if (title) {
            this.storage.createRoom(title);
            this.currentTab = 'questions';
            this.render(container);
          }
        });
      }

      // Select Room
      container.querySelectorAll('.cms-select-room-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.storage.setActiveRoomId(id);
          this.render(container);
        });
      });
    }
  }

  global.TeacherDashboardCMS = new TeacherDashboardCMS();
  global.TeacherDashboard = global.TeacherDashboardCMS;
})(typeof window !== 'undefined' ? window : global);
