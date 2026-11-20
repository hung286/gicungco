// Game Session Manager - PomyAI / EY Gamification Platform
// Author: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)

(function(global) {
  const STORAGE_KEY = 'mhedu_ey_game_sessions_v1';

  // 45 Standard Sample Students matching official PomyAI
  const DEFAULT_45_STUDENTS = [
    { name: "Nguyễn Minh An", gender: "nam" },
    { name: "Trần Bảo Châu", gender: "nu" },
    { name: "Lê Gia Huy", gender: "nam" },
    { name: "Phạm Thùy Linh", gender: "nu" },
    { name: "Hoàng Đức Mạnh", gender: "nam" },
    { name: "Vũ Khánh Ngân", gender: "nu" },
    { name: "Đặng Quốc Phong", gender: "nam" },
    { name: "Bùi Thu Quỳnh", gender: "nu" },
    { name: "Đỗ Hải Sơn", gender: "nam" },
    { name: "Ngô Phương Thảo", gender: "nu" },
    { name: "Dương Anh Tuấn", gender: "nam" },
    { name: "Lý Bảo Vy", gender: "nu" },
    { name: "Huỳnh Ngọc Hân", gender: "nu" },
    { name: "Phan Nhật Minh", gender: "nam" },
    { name: "Võ Thanh Trúc", gender: "nu" },
    { name: "Hồ Gia Bảo", gender: "nam" },
    { name: "Trịnh Mai Anh", gender: "nu" },
    { name: "Đinh Tuấn Kiệt", gender: "nam" },
    { name: "Lâm Khánh Linh", gender: "nu" },
    { name: "Mai Đức Anh", gender: "nam" },
    { name: "Tạ Hoài Nam", gender: "nam" },
    { name: "Cao Thị Mỹ Duyên", gender: "nu" },
    { name: "Chu Minh Khôi", gender: "nam" },
    { name: "Lương Thảo Nguyên", gender: "nu" },
    { name: "Tạ Quang Vinh", gender: "nam" },
    { name: "Nguyễn Hoàng Yến", gender: "nu" },
    { name: "Trần Đức Long", gender: "nam" },
    { name: "Lê Phương Anh", gender: "nu" },
    { name: "Phạm Gia Hưng", gender: "nam" },
    { name: "Hoàng Thu Hà", gender: "nu" },
    { name: "Vũ Minh Quân", gender: "nam" },
    { name: "Đặng Ngọc Diệp", gender: "nu" },
    { name: "Bùi Tiến Dũng", gender: "nam" },
    { name: "Đỗ Khánh Vân", gender: "nu" },
    { name: "Ngô Bảo Ngọc", gender: "nu" },
    { name: "Dương Thanh Tùng", gender: "nam" },
    { name: "Lý Hải Yến", gender: "nu" },
    { name: "Huỳnh Tấn Phát", gender: "nam" },
    { name: "Phan Như Ý", gender: "nu" },
    { name: "Võ Hoàng Long", gender: "nam" },
    { name: "Hồ Thị Kim Chi", gender: "nu" },
    { name: "Trịnh Quốc Bảo", gender: "nam" },
    { name: "Nguyễn Trần Minh Thư", gender: "nu" },
    { name: "Lê Hoàng Phúc", gender: "nam" },
    { name: "Phạm Ngọc Mai", gender: "nu" }
  ];

  class GameSessionManager {
    constructor() {
      this.initDefault();
    }

    initDefault() {
      let data = null;
      try {
        data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch (e) {}

      if (!data || typeof data !== 'object') {
        data = {
          'chay-tron-thay-co': [
            {
              id: 'session_default',
              gameId: 'chay-tron-thay-co',
              title: 'Chơi thử',
              schoolName: 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
              teacherGender: 'male',
              teacherName: 'Thầy Hùng',
              students: DEFAULT_45_STUDENTS.map((s, idx) => ({
                id: 'st_' + (idx + 1),
                name: s.name,
                gender: s.gender
              })),
              createdAt: Date.now()
            }
          ]
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }

    getAllSessions() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    saveAllSessions(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {}
    }

    normalizeGameId(gameId) {
      if (gameId === 'thay-kiem-tra-vo') return 'ca-lop-oi-thoat-game';
      if (gameId === 'chuyen-do' || gameId === 'ferry') return 'chuyen-do-sang-song';
      if (gameId === 'khoai-nong' || gameId === 'hot-potato') return 'khoai-nong-bong-tay';
      if (gameId === 'dai-nao-nghia-trang') return 'cuong-thi';
      if (gameId === 'choc-xoai') return 'choc-xoai-cham-muoi';
      if (gameId === 'thien-thach' || gameId === 'thien-thach-goi-ten') return 'thien-thach-diem-danh';
      return gameId;
    }

    getSessions(gameId) {
      gameId = this.normalizeGameId(gameId);
      const all = this.getAllSessions();
      if (!all[gameId] || all[gameId].length === 0) {
        all[gameId] = [
          {
            id: 'session_' + Date.now(),
            gameId: gameId,
            title: 'Chơi thử',
            schoolName: 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
            teacherGender: 'male',
            teacherName: 'Thầy Hùng',
            students: DEFAULT_45_STUDENTS.map((s, idx) => ({
              id: 'st_' + (idx + 1),
              name: s.name,
              gender: s.gender
            })),
            createdAt: Date.now()
          }
        ];
        this.saveAllSessions(all);
      }
      return all[gameId];
    }

    getSession(gameId, sessionId) {
      const list = this.getSessions(gameId);
      return list.find(s => s.id === sessionId) || list[0];
    }

    saveSession(gameId, session) {
      gameId = this.normalizeGameId(gameId);
      const all = this.getAllSessions();
      if (!all[gameId]) all[gameId] = [];
      const idx = all[gameId].findIndex(s => s.id === session.id);
      if (idx !== -1) {
        all[gameId][idx] = session;
      } else {
        all[gameId].push(session);
      }
      this.saveAllSessions(all);
    }

    deleteSession(gameId, sessionId) {
      gameId = this.normalizeGameId(gameId);
      const all = this.getAllSessions();
      if (!all[gameId]) return;
      all[gameId] = all[gameId].filter(s => s.id !== sessionId);
      if (all[gameId].length === 0) {
        // Reset to default sample
        all[gameId].push({
          id: 'session_' + Date.now(),
          gameId: gameId,
          title: 'Chơi thử',
          schoolName: 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
          teacherGender: 'male',
          teacherName: 'Thầy Hùng',
          students: DEFAULT_45_STUDENTS.map((s, idx) => ({
            id: 'st_' + (idx + 1),
            name: s.name,
            gender: s.gender
          })),
          createdAt: Date.now()
        });
      }
      this.saveAllSessions(all);
    }

    createSession(gameId, title = 'Lớp mới') {
      gameId = this.normalizeGameId(gameId);
      const newSession = {
        id: 'session_' + Date.now(),
        gameId: gameId,
        title: title,
        schoolName: 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
        teacherGender: 'male',
        teacherName: 'Thầy Hùng',
        students: DEFAULT_45_STUDENTS.slice(0, 30).map((s, idx) => ({
          id: 'st_' + (idx + 1),
          name: s.name,
          gender: s.gender
        })),
        createdAt: Date.now()
      };
      this.saveSession(gameId, newSession);
      return newSession;
    }

    // =========================================================================
    // SCREEN 1: TRANG DANH SÁCH VÁN CHƠI (LOBBY - Image 1)
    // =========================================================================
    renderLobby(container, gameId, onBack) {
      gameId = this.normalizeGameId(gameId);
      const isStudent = (window.EyAuth && typeof window.EyAuth.isStudent === 'function' && window.EyAuth.isStudent()) || false;
      const sessions = this.getSessions(gameId);
      const gameInfo = (global.EY_CATALOG && global.EY_CATALOG.goiTen && global.EY_CATALOG.goiTen.find(g => g.id === gameId)) || {
        title: 'Chạy trốn thầy cô',
        icon: '🏃'
      };

      container.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto; padding: 20px; font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;">
          <!-- Topbar (Image 1) -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
            <button id="btn-lobby-back" style="width: 38px; height: 38px; border-radius: 8px; background: transparent; border: 1.5px solid #2dd4bf; color: #0d9488; font-size: 18px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s;">
              &lt;
            </button>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button id="btn-guide" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                📖 Hướng dẫn
              </button>
              ${!isStudent ? `
                <button id="btn-create-session" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: #00aa95; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0,170,149,0.25);">
                  Tạo ván
                </button>
              ` : `
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 13px; font-weight: 700;">
                  👨‍🎓 Chế độ Học sinh (Chỉ xem và chơi)
                </span>
              `}
            </div>
          </div>

          <!-- Main Card Container (Image 1) -->
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 18px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${sessions.map(s => `
                <div class="session-item-row" data-id="${s.id}" style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 16px 20px; transition: all 0.15s ease;">
                  <div>
                    <div style="font-size: 15.5px; font-weight: 700; color: #1e293b;">${s.title}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${s.students.length} học sinh</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-play-session" data-id="${s.id}" style="background: #00aa95; color: #ffffff; border: none; border-radius: 8px; padding: 7px 18px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,170,149,0.2);">
                      ▶ Chơi
                    </button>
                    ${!isStudent ? `
                      <button class="btn-edit-session" data-id="${s.id}" style="background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px 16px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
                        Sửa
                      </button>
                      <button class="btn-delete-session" data-id="${s.id}" style="background: #ffffff; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; cursor: pointer;" title="Xoá ván này">
                        ✕
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Event handlers
      const btnBack = container.querySelector('#btn-lobby-back');
      if (btnBack) {
        btnBack.onclick = () => {
          if (typeof onBack === 'function') onBack();
        };
      }

      const btnGuide = container.querySelector('#btn-guide');
      if (btnGuide) {
        btnGuide.onclick = () => {
          alert(
            '📖 HƯỚNG DẪN TRÒ CHƠI GỌI TÊN:\n\n' +
            '1. Bấm "Tạo ván" hoặc "Sửa" để cấu hình danh sách học sinh, tên lớp và chọn Thầy Giáo / Cô Giáo.\n' +
            '2. Có thể đổi tên trường học để hiển thị chính xác lên biển hiệu trường trong game (mặc định: TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG).\n' +
            '3. Bấm "▶ Chơi" để bước vào giao diện Full màn hình.\n' +
            '4. Bấm "Bắt đầu" (hoặc Phím cách) để khởi động lượt chạy trốn kịch tính và tìm ra bạn may mắn lên bảng!'
          );
        };
      }

      const btnCreate = container.querySelector('#btn-create-session');
      if (btnCreate) btnCreate.onclick = () => {
        const s = this.createSession(gameId, `Lớp ${sessions.length + 1}`);
        this.renderEditor(container, gameId, s.id, onBack);
      };

      container.querySelectorAll('.btn-edit-session').forEach(btn => {
        btn.onclick = () => {
          const sId = btn.getAttribute('data-id');
          this.renderEditor(container, gameId, sId, onBack);
        };
      });

      container.querySelectorAll('.btn-delete-session').forEach(btn => {
        btn.onclick = () => {
          const sId = btn.getAttribute('data-id');
          if (confirm('Bạn có chắc chắn muốn xóa ván này không?')) {
            this.deleteSession(gameId, sId);
            this.renderLobby(container, gameId, onBack);
          }
        };
      });

      container.querySelectorAll('.btn-play-session').forEach(btn => {
        btn.onclick = () => {
          const sId = btn.getAttribute('data-id');
          const session = this.getSession(gameId, sId);
          this.launchFullscreenGame(gameId, session, () => {
            this.renderLobby(container, gameId, onBack);
          });
        };
      });
    }

    // =========================================================================
    // SCREEN 2: TRANG CHỈNH SỬA VÁN CHƠI (EDIT VIEW - Image 2)
    // =========================================================================
    renderEditor(container, gameId, sessionId, onBack) {
      if (window.EyAuth && window.EyAuth.isStudent()) {
        alert('⚠️ Ở chế độ Học sinh, bạn chỉ có thể xem và chơi trò chơi. Không có quyền sửa danh sách lớp!');
        if (typeof onBack === 'function') onBack();
        return;
      }
      gameId = this.normalizeGameId(gameId);
      const session = this.getSession(gameId, sessionId);
      let localSession = JSON.parse(JSON.stringify(session));

      const renderView = () => {
        const hasTeacher = (gameId === 'chay-tron-thay-co' || gameId === 'co-goi-ve-nha' || gameId === 'ca-lop-oi-thoat-game' || gameId === 'thay-kiem-tra-vo' || gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry');
        const teacherLabel = (gameId === 'co-goi-ve-nha') ? 'NGƯỜI GỌI ĐIỆN' : (gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry') ? 'NGƯỜI LÁI ĐÒ' : 'CHỌN THẦY / CÔ';

        container.innerHTML = `
          <div style="max-width: 1100px; margin: 0 auto; padding: 24px 20px; font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;">
            <!-- Top Navigation Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
              <button id="btn-edit-back" style="width: 38px; height: 38px; border-radius: 8px; background: transparent; border: 1.5px solid #2dd4bf; color: #0d9488; font-size: 18px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                &lt;
              </button>
              <button id="btn-save-session" style="padding: 8px 24px; background: #00aa95; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0,170,149,0.25);">
                Lưu
              </button>
            </div>

            ${hasTeacher ? `
              <!-- CHỌN THẦY / CÔ -->
              <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 18px 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
                  ${teacherLabel}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <button type="button" id="tab-teacher-male" style="display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; text-align: left; transition: all 0.15s; ${localSession.teacherGender === 'male' ? 'background: #e6fbf7; border: 2px solid #2dd4bf; color: #042f2e;' : 'background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;'}">
                    <span>👨‍🏫</span> ${(gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry') ? 'Thầy Chèo Đò' : 'Thầy Giáo'}
                  </button>
                  <button type="button" id="tab-teacher-female" style="display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; text-align: left; transition: all 0.15s; ${localSession.teacherGender === 'female' ? 'background: #e6fbf7; border: 2px solid #2dd4bf; color: #042f2e;' : 'background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;'}">
                    <span>👩‍🏫</span> ${(gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry') ? 'Cô Chèo Đò' : 'Cô Giáo'}
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- TIÊU ĐỀ TRƯỜNG / LỚP / BÀI HỌC -->
            <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 18px 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">
                ${(gameId === 'khoai-nong-bong-tay' || gameId === 'khoai-nong' || gameId === 'hot-potato') ? 'TÊN TRƯỜNG TRONG GAME / TIÊU ĐỀ BÀI HỌC' : (gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry') ? 'TIÊU ĐỀ BẾN ĐÒ (TÊN TRƯỜNG / LỚP / BÀI HỌC)' : (gameId === 'ca-lop-oi-thoat-game' || gameId === 'thay-kiem-tra-vo') ? 'TIÊU ĐỀ BẢNG ĐEN (TÊN BÀI HỌC)' : 'TÊN TRƯỜNG / TIÊU ĐỀ BÀI HỌC'}
              </div>
              <input type="text" id="input-lesson-title" value="${localSession.lessonTitle || localSession.schoolName || ((gameId === 'ca-lop-oi-thoat-game' || gameId === 'thay-kiem-tra-vo') ? 'Bài 8: Ôn tập giữa học kì I' : 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG')}" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 14.5px; font-weight: 700; color: #0f172a; outline: none; box-sizing: border-box;" placeholder="Nhập tên trường học hoặc tiêu đề bài học" />
            </div>

            <!-- Main Content: Left (Students) & Right (Class / School Name) -->
            <div style="display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start;">
              <!-- Left Column: Danh sách học sinh -->
              <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 16px; font-weight: 800; color: #0f172a;">Danh sách học sinh</span>
                    <span id="badge-student-count" style="background: #e6fbf7; color: #00aa95; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">
                      ${localSession.students.length} học sinh
                    </span>
                  </div>
                  <button type="button" id="btn-clear-all" style="color: #ef4444; background: none; border: none; font-size: 13px; font-weight: 700; cursor: pointer;">
                    Xoá tất cả
                  </button>
                </div>

                <!-- Action Bar -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                  <select id="select-class-preset" style="flex: 1; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; padding: 8px 12px; font-size: 13.5px; font-weight: 600; color: #334155; outline: none; cursor: pointer;">
                    <option value="">Chưa có lớp nào</option>
                    <option value="default_45">Nạp lớp chuẩn THPT (45 em)</option>
                    <option value="sample_20">Nạp lớp mẫu 20 em</option>
                  </select>
                  <button type="button" id="btn-open-add-modal" style="background: #ffffff; color: #00aa95; border: 1.5px solid #2dd4bf; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                    Thêm tên học sinh
                  </button>
                </div>

                <!-- Students 2-Column Grid -->
                <div id="students-grid" style="max-height: 460px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-right: 4px;">
                  ${localSession.students.map((st, idx) => `
                    <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                      <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; flex: 1;">
                        <span style="font-size: 12px; font-weight: 800; color: #94a3b8; width: 20px; flex-shrink: 0;">${idx + 1}.</span>
                        <input type="text" class="student-name-input" data-idx="${idx}" value="${st.name}" style="border: none; background: transparent; font-size: 13.5px; font-weight: 700; color: #0f172a; width: 100%; outline: none;" />
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                        <button type="button" class="btn-gender-toggle" data-idx="${idx}" data-gender="nam" style="padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; ${st.gender === 'nam' ? 'background: #0284c7; color: #fff;' : 'background: #e2e8f0; color: #64748b;'}">
                          Nam
                        </button>
                        <button type="button" class="btn-gender-toggle" data-idx="${idx}" data-gender="nu" style="padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; ${st.gender === 'nu' ? 'background: #db2777; color: #fff;' : 'background: #e2e8f0; color: #64748b;'}">
                          Nữ
                        </button>
                        <button type="button" class="btn-del-student" data-idx="${idx}" style="color: #ef4444; background: none; border: none; font-size: 14px; font-weight: 800; cursor: pointer; padding: 0 4px;">
                          ✕
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right Column: Tên Lớp & Tên Trường -->
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- TÊN LỚP -->
                <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                  <div style="font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">
                    TÊN LỚP
                  </div>
                  <input type="text" id="input-class-name" value="${localSession.title}" placeholder="Nhập tên lớp..." style="width: 100%; box-sizing: border-box; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; padding: 10px 14px; font-size: 15px; font-weight: 700; color: #0f172a; outline: none;" />
                </div>

                ${hasTeacher ? `
                  <!-- TÊN TRƯỜNG TRONG GAME -->
                  <div style="background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div style="font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">
                      TÊN TRƯỜNG TRONG GAME
                    </div>
                    <input type="text" id="input-school-name" value="${localSession.schoolName || 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG'}" placeholder="TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG" style="width: 100%; box-sizing: border-box; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 8px; padding: 10px 14px; font-size: 14.5px; font-weight: 800; color: #0369a1; outline: none;" />
                    <p style="font-size: 11.5px; color: #64748b; margin: 8px 0 0 0; line-height: 1.4;">
                      * Tên trường sẽ được hiển thị trên biển hiệu tòa nhà 3D, thanh thông báo và trong Sổ Đầu Bài.
                    </p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;

        // Bind interactive events
        container.querySelector('#btn-edit-back').onclick = () => {
          this.renderLobby(container, gameId, onBack);
        };

        // Save
        container.querySelector('#btn-save-session').onclick = () => {
          localSession.title = container.querySelector('#input-class-name').value.trim() || 'Chơi thử';
          const schoolInp = container.querySelector('#input-school-name');
          if (schoolInp) {
            localSession.schoolName = schoolInp.value.trim().toUpperCase() || 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG';
          }
          const lessonInp = container.querySelector('#input-lesson-title');
          if (lessonInp) {
            localSession.lessonTitle = lessonInp.value.trim() || 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG';
            localSession.schoolName = localSession.lessonTitle;
          }
          if (lessonInp) {
            localSession.lessonTitle = lessonInp.value.trim() || 'Bài 8: Ôn tập giữa học kì I';
          }
          this.saveSession(gameId, localSession);
          this.renderLobby(container, gameId, onBack);
        };

        // Gender toggle
        const tMale = container.querySelector('#tab-teacher-male');
        if (tMale) {
          tMale.onclick = () => {
            localSession.teacherGender = 'male';
            renderView();
          };
        }
        const tFemale = container.querySelector('#tab-teacher-female');
        if (tFemale) {
          tFemale.onclick = () => {
            localSession.teacherGender = 'female';
            renderView();
          };
        }

        // Input sync
        container.querySelector('#input-class-name').oninput = (e) => {
          localSession.title = e.target.value;
        };
        const schoolInp = container.querySelector('#input-school-name');
        if (schoolInp) {
          schoolInp.oninput = (e) => {
            localSession.schoolName = e.target.value;
          };
        }

        // Clear all students
        container.querySelector('#btn-clear-all').onclick = () => {
          if (confirm('Bạn có chắc chắn muốn xóa tất cả học sinh trong danh sách?')) {
            localSession.students = [];
            renderView();
          }
        };

        // Preset dropdown
        container.querySelector('#select-class-preset').onchange = (e) => {
          if (e.target.value === 'default_45') {
            localSession.students = DEFAULT_45_STUDENTS.map((s, i) => ({
              id: 'st_' + (i + 1),
              name: s.name,
              gender: s.gender
            }));
            renderView();
          } else if (e.target.value === 'sample_20') {
            localSession.students = DEFAULT_45_STUDENTS.slice(0, 20).map((s, i) => ({
              id: 'st_' + (i + 1),
              name: s.name,
              gender: s.gender
            }));
            renderView();
          }
        };

        // Student name edits
        container.querySelectorAll('.student-name-input').forEach(input => {
          input.oninput = (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            if (localSession.students[idx]) {
              localSession.students[idx].name = e.target.value;
            }
          };
        });

        // Student gender toggle
        container.querySelectorAll('.btn-gender-toggle').forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const g = btn.getAttribute('data-gender');
            if (localSession.students[idx]) {
              localSession.students[idx].gender = g;
              renderView();
            }
          };
        });

        // Delete individual student
        container.querySelectorAll('.btn-del-student').forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            localSession.students.splice(idx, 1);
            renderView();
          };
        });

        // Open Add Student Modal (Image 3)
        container.querySelector('#btn-open-add-modal').onclick = () => {
          this.renderAddStudentsModal(
            (newNames) => {
              newNames.forEach((name, i) => {
                localSession.students.push({
                  id: 'st_' + Date.now() + '_' + i,
                  name: name,
                  gender: (name.includes('Thị') || name.includes('Ngân') || name.includes('Linh') || name.includes('Quỳnh') || name.includes('Hà') || name.includes('Vy') || name.includes('Trúc') || name.includes('Anh') || name.includes('Chi') || name.includes('Mai')) ? 'nu' : 'nam'
                });
              });
              renderView();
            }
          );
        };
      };

      renderView();
    }

    // =========================================================================
    // SCREEN 3: MODAL THÊM TÊN HỌC SINH (Image 3)
    // =========================================================================
    renderAddStudentsModal(onAdd, onCancel) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; font-family: "Be Vietnam Pro", system-ui, sans-serif;';
      modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 20px; width: 100%; max-width: 520px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.18); animation: popIn 0.2s ease;">
          <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">Thêm tên học sinh</h3>
          <textarea id="paste-names-box" placeholder="Dán hoặc gõ tên, mỗi dòng một học sinh&#10;Nguyễn Văn An&#10;Trần Thị Bình&#10;Lê Minh Châu" style="width: 100%; height: 260px; box-sizing: border-box; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 14px; padding: 14px; font-size: 14px; font-family: inherit; line-height: 1.6; color: #0f172a; outline: none; resize: none;"></textarea>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
            <span style="font-size: 13px; color: #64748b; font-weight: 600;">Mỗi dòng một tên</span>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button type="button" id="btn-cancel-modal" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;">
                Huỷ
              </button>
              <button type="button" id="btn-submit-modal" style="background: #2dd4bf; color: #042f2e; border: none; padding: 8px 24px; border-radius: 10px; font-size: 14px; font-weight: 800; cursor: pointer;">
                Thêm
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-cancel-modal').onclick = () => {
        modal.remove();
        if (typeof onCancel === 'function') onCancel();
      };

      modal.querySelector('#btn-submit-modal').onclick = () => {
        const text = modal.querySelector('#paste-names-box').value;
        const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        modal.remove();
        if (lines.length > 0 && typeof onAdd === 'function') {
          onAdd(lines);
        }
      };
    }

    // =========================================================================
    // SCREEN 4: FULL VIEWPORT GAME LAUNCHER (Images 4 & 5 - 100% Fullscreen)
    // =========================================================================
    launchFullscreenGame(gameId, session, onExit) {
      gameId = this.normalizeGameId(gameId);
      // Create dedicated full viewport container
      let gameContainer = document.getElementById('game-fullscreen-container');
      if (!gameContainer) {
        gameContainer = document.createElement('div');
        gameContainer.id = 'game-fullscreen-container';
        document.body.appendChild(gameContainer);
      }

      gameContainer.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 999999; background: #000000; overflow: hidden; display: block; margin: 0; padding: 0;';
      gameContainer.innerHTML = '';

      // Tự động yêu cầu Toàn màn hình trình duyệt (Native Fullscreen)
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}

      const rosterNames = session.students.map(s => s.name);
      const studentGenders = {};
      session.students.forEach(s => {
        studentGenders[s.name] = s.gender;
      });

      const options = {
        roster: rosterNames,
        gioiTinh: studentGenders,
        teacherGender: session.teacherGender || 'male',
        schoolName: session.schoolName || 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
        teacherName: session.teacherGender === 'female' ? 'Cô Giáo' : (session.teacherName || 'Thầy Hùng'),
        className: session.title,
        lessonTitle: session.lessonTitle || 'Bài 8: Ôn tập giữa học kì I',
        onExit: () => {
          if (window.__activeFullscreenGameCleanup) {
            try { window.__activeFullscreenGameCleanup(); } catch (e) {}
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

      if (gameId === 'ca-lop-oi-thoat-game' || gameId === 'thay-kiem-tra-vo') {
        if (typeof window.launchCaLopOiThoatGame === 'function') {
          window.__activeFullscreenGameCleanup = window.launchCaLopOiThoatGame(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/ca-lop-oi-thoat-game.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchCaLopOiThoatGame === 'function') {
              window.__activeFullscreenGameCleanup = window.launchCaLopOiThoatGame(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'chuyen-do-sang-song' || gameId === 'chuyen-do' || gameId === 'ferry') {
        if (typeof window.launchChuyenDoSangSong === 'function') {
          window.__activeFullscreenGameCleanup = window.launchChuyenDoSangSong(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/chuyen-do-sang-song.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchChuyenDoSangSong === 'function') {
              window.__activeFullscreenGameCleanup = window.launchChuyenDoSangSong(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'khoai-nong-bong-tay' || gameId === 'khoai-nong' || gameId === 'hot-potato') {
        if (typeof window.launchKhoaiNongBongTay === 'function') {
          window.__activeFullscreenGameCleanup = window.launchKhoaiNongBongTay(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/khoai-nong-bong-tay.js?v=' + Date.now();
          s.onload = () => {
            if (typeof window.launchKhoaiNongBongTay === 'function') {
              window.__activeFullscreenGameCleanup = window.launchKhoaiNongBongTay(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'chay-tron-thay-co') {
        if (typeof window.launchChayTronThayCo === 'function') {
          window.__activeFullscreenGameCleanup = window.launchChayTronThayCo(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/chay-tron-thay-co.js';
          s.onload = () => {
            if (typeof window.launchChayTronThayCo === 'function') {
              window.__activeFullscreenGameCleanup = window.launchChayTronThayCo(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'muc-oi-dung-day' || gameId === 'muc-oi-dung-day-classic') {
        const fnName = gameId === 'muc-oi-dung-day-classic' ? 'launchMucOiDungDayClassic' : 'launchMucOiDungDay';
        const src = gameId === 'muc-oi-dung-day-classic' ? '/ey/games/muc-oi-dung-day-classic.js?v=20261111_classic' : '/ey/games/muc-oi-dung-day.js?v=20261111_chibi';
        if (typeof window[fnName] === 'function') {
          window.__activeFullscreenGameCleanup = window[fnName](gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => {
            if (typeof window[fnName] === 'function') {
              window.__activeFullscreenGameCleanup = window[fnName](gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'u-tim-tron-tim') {
        if (typeof window.launchUTimTronTim === 'function') {
          window.__activeFullscreenGameCleanup = window.launchUTimTronTim(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/u-tim-tron-tim.js?v=20261111';
          s.onload = () => {
            if (typeof window.launchUTimTronTim === 'function') {
              window.__activeFullscreenGameCleanup = window.launchUTimTronTim(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'ca-xom-tron-tra-bai') {
        if (typeof window.launchCaXomTronTraBai === 'function') {
          window.__activeFullscreenGameCleanup = window.launchCaXomTronTraBai(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/ca-xom-tron-tra-bai.js';
          s.onload = () => {
            if (typeof window.launchCaXomTronTraBai === 'function') {
              window.__activeFullscreenGameCleanup = window.launchCaXomTronTraBai(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'cuong-thi' || gameId === 'dai-nao-nghia-trang') {
        if (typeof window.launchCuongThi === 'function') {
          window.__activeFullscreenGameCleanup = window.launchCuongThi(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/cuong-thi.js';
          s.onload = () => {
            if (typeof window.launchCuongThi === 'function') {
              window.__activeFullscreenGameCleanup = window.launchCuongThi(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'nhay-du-dao-hoang' || gameId === 'luon-du-dinh-nui') {
        if (typeof window.launchNhayDuDaoHoang === 'function') {
          window.__activeFullscreenGameCleanup = window.launchNhayDuDaoHoang(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/nhay-du-dao-hoang.js';
          s.onload = () => {
            if (typeof window.launchNhayDuDaoHoang === 'function') {
              window.__activeFullscreenGameCleanup = window.launchNhayDuDaoHoang(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'co-goi-ve-nha') {
        if (typeof window.launchCoGoiVeNha === 'function') {
          window.__activeFullscreenGameCleanup = window.launchCoGoiVeNha(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/co-goi-ve-nha.js';
          s.onload = () => {
            if (typeof window.launchCoGoiVeNha === 'function') {
              window.__activeFullscreenGameCleanup = window.launchCoGoiVeNha(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'choc-xoai-cham-muoi' || gameId === 'choc-xoai') {
        if (typeof window.launchChocXoaiChamMuoi === 'function') {
          window.__activeFullscreenGameCleanup = window.launchChocXoaiChamMuoi(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/choc-xoai-cham-muoi.js';
          s.onload = () => {
            if (typeof window.launchChocXoaiChamMuoi === 'function') {
              window.__activeFullscreenGameCleanup = window.launchChocXoaiChamMuoi(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      } else if (gameId === 'thien-thach-diem-danh' || gameId === 'thien-thach' || gameId === 'thien-thach-goi-ten') {
        if (typeof window.launchThienThachDiemDanh === 'function') {
          window.__activeFullscreenGameCleanup = window.launchThienThachDiemDanh(gameContainer, options);
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/thien-thach-diem-danh.js';
          s.onload = () => {
            if (typeof window.launchThienThachDiemDanh === 'function') {
              window.__activeFullscreenGameCleanup = window.launchThienThachDiemDanh(gameContainer, options);
            }
          };
          document.head.appendChild(s);
        }
      }
    }
  }

  global.EyGameSessionManager = new GameSessionManager();
})(window);
