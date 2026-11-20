/**
 * Student Portal Module for EY (/ey/hs)
 * Cổng giao diện học sinh: Bài tập, Trò chơi hành trình, Kết quả
 * Chuẩn PomyAI trích xuất từ video thực tế
 */

(function (window) {
  'use strict';

  class EyStudentPortal {
    constructor() {
      this.currentStudentTab = 'hanhTrinh'; // 'baiTap' | 'hanhTrinh' | 'ketQua'
    }

    render(container) {
      const session = window.EyAuth.getSession();
      const student = window.EyAuth.getAllStudents().find(s => s.id === session.studentId) || {
        id: session.studentId || '10011634',
        name: session.name || 'Học sinh',
        classId: session.classId
      };

      const classes = window.EyAuth.getAllClasses();
      const cls = classes.find(c => c.id === student.classId) || { name: 'Lớp 10A6', code: 'MZYKZF' };

      container.innerHTML = `
        <div class="student-portal-wrapper" style="max-width: 1100px; margin: 0 auto; font-family: 'Be Vietnam Pro', sans-serif;">
          <!-- Student Sub-Header Bar -->
          <div style="background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; border-radius: 20px; padding: 22px 28px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 10px 25px rgba(13,148,136,0.25);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 54px; height: 54px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; border: 2px solid rgba(255,255,255,0.4);">
                ${student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                  <span>${student.name}</span>
                  <span style="font-size: 11px; background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 20px; font-weight: 700;">Học sinh · Chỉ Xem • Học • Chơi trò chơi</span>
                </div>
                <div style="font-size: 13px; opacity: 0.9; margin-top: 3px;">
                  Mã học sinh: <strong>${student.id}</strong> · ${cls.name} (Mã lớp: <strong>${cls.code}</strong>)
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button onclick="window.EyStudentUI.switchRoleToTeacher()" style="padding: 9px 16px; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4); border-radius: 12px; font-weight: 700; font-size: 12.5px; cursor: pointer; backdrop-filter: blur(4px);">
                👨‍🏫 Về quyền Giáo viên
              </button>
              <button onclick="window.EyStudentUI.logoutStudent()" style="padding: 9px 16px; background: rgba(0,0,0,0.25); color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 12.5px; cursor: pointer;">
                Đăng xuất ⎋
              </button>
            </div>
          </div>

          <!-- Student Nav Tabs -->
          <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 2px; overflow-x: auto;">
            <button onclick="window.EyStudentUI.switchTab('hanhTrinh')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; background: none; font-weight: 800; font-size: 14.5px; cursor: pointer; color: ${this.currentStudentTab === 'hanhTrinh' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -4px; white-space: nowrap;">
              <span>🧭 Trò chơi hành trình</span>
            </button>
            <button onclick="window.EyStudentUI.switchTab('soTay')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; background: none; font-weight: 800; font-size: 14.5px; cursor: pointer; color: ${this.currentStudentTab === 'soTay' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -4px; white-space: nowrap;">
              <span>📖 Học tập & Sổ tay</span>
            </button>
            <button onclick="window.EyStudentUI.switchTab('troChoi')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; background: none; font-weight: 800; font-size: 14.5px; cursor: pointer; color: ${this.currentStudentTab === 'troChoi' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -4px; white-space: nowrap;">
              <span>🎮 Trò chơi đối kháng</span>
            </button>
            <button onclick="window.EyStudentUI.switchTab('baiTap')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; background: none; font-weight: 800; font-size: 14.5px; cursor: pointer; color: ${this.currentStudentTab === 'baiTap' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -4px; white-space: nowrap;">
              <span>📝 Bài tập của em</span>
            </button>
            <button onclick="window.EyStudentUI.switchTab('ketQua')" style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; background: none; font-weight: 800; font-size: 14.5px; cursor: pointer; color: ${this.currentStudentTab === 'ketQua' ? '#0d9488; border-bottom: 3px solid #0d9488;' : '#64748b;'} margin-bottom: -4px; white-space: nowrap;">
              <span>📊 Bảng kết quả</span>
            </button>
          </div>

          <!-- Tab Contents -->
          ${this.currentStudentTab === 'hanhTrinh' ? this.renderHanhTrinhCards(student, cls) : ''}
          ${this.currentStudentTab === 'soTay' ? this.renderSoTayView(student, cls) : ''}
          ${this.currentStudentTab === 'troChoi' ? this.renderTroChoiView(student, cls) : ''}
          ${this.currentStudentTab === 'baiTap' ? this.renderBaiTapView(student, cls) : ''}
          ${this.currentStudentTab === 'ketQua' ? this.renderKetQuaView(student, cls) : ''}
        </div>
      `;
    }

    
    renderSoTayView(student, cls) {
      return `
        <div style="background: var(--bg-card, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 20px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">📖 Sổ Tay & Học Toán Thông Minh</h2>
              <p style="font-size: 13.5px; color: #64748b; margin: 0;">Tra cứu công thức Toán 10 - 11 - 12, Infographic tóm tắt kiến thức và Mô phỏng 3D tương tác</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="document.getElementById('hs-so-tay-frame').src='/hoc-toan/so-tay.html'" style="padding: 7px 14px; background: #0d9488; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer;">Sổ tay</button>
              <button onclick="document.getElementById('hs-so-tay-frame').src='/hoc-toan/#infographic'" style="padding: 7px 14px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer;">Infographic</button>
              <button onclick="document.getElementById('hs-so-tay-frame').src='/hoc-toan/#moPhong'" style="padding: 7px 14px; background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer;">Mô phỏng</button>
              <button onclick="window.open('/hoc-toan/so-tay.html', '_blank')" style="padding: 7px 14px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer;">↗ Tab mới</button>
            </div>
          </div>
          <div style="height: 650px; border-radius: 14px; overflow: hidden; border: 1.5px solid #e2e8f0;">
            <iframe id="hs-so-tay-frame" src="/hoc-toan/so-tay.html" style="width: 100%; height: 100%; border: none;"></iframe>
          </div>
        </div>
      `;
    }

    renderTroChoiView(student, cls) {
      return `
        <div>
          <div style="margin-bottom: 18px;">
            <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #0f172a;">🎮 Trò Chơi Đối Kháng & Đấu Đội</h2>
            <p style="margin: 0; font-size: 13.5px; color: #64748b;">
              Chọn trò chơi yêu thích, thi đấu trả lời câu hỏi và giành chiến thắng vinh quang!
            </p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
            <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
              <div>
                <div style="font-size: 36px; margin-bottom: 10px;">🪢</div>
                <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #0f172a;">Kéo Co Tri Thức</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Thi đấu kéo co 2 đội sôi động, kéo dây về phía đội mình sau mỗi câu đúng.</p>
              </div>
              <button onclick="window.switchTab('troChoi'); window.openItem && window.openItem('troChoi', 'keo-co');" style="margin-top: 16px; width: 100%; padding: 11px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">Vào chơi ngay ➔</button>
            </div>

            <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
              <div>
                <div style="font-size: 36px; margin-bottom: 10px;">🏰</div>
                <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #0f172a;">Xây Nhà Tri Thức</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Trả lời đúng để thu thập vật liệu gạch ngói, hoàn thành ngôi nhà mơ ước.</p>
              </div>
              <button onclick="window.switchTab('troChoi'); window.openItem && window.openItem('troChoi', 'xay-nha');" style="margin-top: 16px; width: 100%; padding: 11px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">Vào chơi ngay ➔</button>
            </div>

            <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
              <div>
                <div style="font-size: 36px; margin-bottom: 10px;">🛡️</div>
                <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #0f172a;">Thủ Thành Kiến Thức</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Bảo vệ pháo đài tri thức, bắn hạ quái vật bằng câu trả lời chính xác.</p>
              </div>
              <button onclick="window.switchTab('troChoi'); window.openItem && window.openItem('troChoi', 'thu-thanh');" style="margin-top: 16px; width: 100%; padding: 11px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">Vào chơi ngay ➔</button>
            </div>

            <div style="background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
              <div>
                <div style="font-size: 36px; margin-bottom: 10px;">⛳</div>
                <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #0f172a;">Chiếm Đất Xâm Lược</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Đặt cờ cắm mốc mở rộng lãnh thổ trên bản đồ qua các thử thách.</p>
              </div>
              <button onclick="window.switchTab('troChoi'); window.openItem && window.openItem('troChoi', 'chiem-dat');" style="margin-top: 16px; width: 100%; padding: 11px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">Vào chơi ngay ➔</button>
            </div>
          </div>
        </div>
      `;
    }

    renderHanhTrinhCards(student, cls) {
      return `
        <div>
          <div style="margin-bottom: 18px;">
            <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: var(--text-main);">Trò chơi hành trình</h2>
            <p style="margin: 0; font-size: 13.5px; color: var(--text-muted);">
              Hoàn thành các câu hỏi bài tập để kiếm tiền vàng, mở ổ ấp trứng nông trại và tích lũy giọt nước tưới hoa!
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            <!-- Game 1: Nông trại -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div style="position: relative; height: 210px; overflow: hidden; background: #fef3c7;">
                <img src="/ey/games/nong-trai/cover.jpg" onerror="this.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80'" style="width: 100%; height: 100%; object-fit: cover;" alt="Nông trại vui vẻ" />
                <span style="position: absolute; top: 12px; right: 12px; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                  TRÒ CHƠI 1 · NÔNG TRẠI
                </span>
              </div>
              <div style="padding: 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: var(--text-main);">Nông Trại Vui Vẻ</h3>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                  Ấp trứng gà, nuôi đàn gà con, tích lũy rơm thóc và chăm sóc trang trại sau mỗi câu trả lời đúng!
                </p>
                <button onclick="window.EyStudentUI.launchGame('nong-trai')" style="width: 100%; padding: 12px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>Vào chơi ngay 🌾</span>
                </button>
              </div>
            </div>

            <!-- Game 2: Vườn hoa -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div style="position: relative; height: 210px; overflow: hidden; background: #fce7f3;">
                <img src="/ey/games/vuon-hoa/cover.jpg" onerror="this.src='https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'" style="width: 100%; height: 100%; object-fit: cover;" alt="Vườn hoa tri thức" />
                <span style="position: absolute; top: 12px; right: 12px; background: #ec4899; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                  TRÒ CHƠI 2 · VƯỜN HOA
                </span>
              </div>
              <div style="padding: 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: var(--text-main);">Vườn Hoa Tri Thức</h3>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                  Gieo hạt giống hoa trong sân trường, tưới nước bằng giọt nước tích lũy khi làm bài và vinh danh Vườn Lớp!
                </p>
                <button onclick="window.EyStudentUI.launchGame('vuon-hoa')" style="width: 100%; padding: 12px; background: #ec4899; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>Vào chơi ngay 🌺</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderBaiTapView(student, cls) {
      setTimeout(() => {
        const mount = document.getElementById('student-assignments-mount');
        if (mount && window.EyAssignmentManager) {
          window.EyAssignmentManager.renderStudentAssignments(mount, student, cls);
        }
      }, 20);

      return `
        <div id="student-assignments-mount">
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 40px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">⏳</div>
            <div style="font-size: 14px; color: #64748b; font-weight: 700;">Đang kết nối Cloud & tải danh sách bài tập của ${student.name}...</div>
          </div>
        </div>
      `;
    }

    renderKetQuaView(student, cls) {
      let farmData = { coins: 50, grain: 15, chickens: 2, streakDays: 1 };
      let gardenData = { water: 25, bloomedFlowers: 4, points: 120 };
      let studentSubs = [];
      try {
        const allFarms = JSON.parse(localStorage.getItem('ey_v2_nongtrai_data') || '{}');
        if (allFarms[student.id]) farmData = { ...farmData, ...allFarms[student.id] };
      } catch (e) {}
      try {
        const allGardens = JSON.parse(localStorage.getItem('ey_v2_vuonhoa_data') || '{}');
        if (allGardens[student.id]) gardenData = { ...gardenData, ...allGardens[student.id] };
      } catch (e) {}
      try {
        const allSubs = JSON.parse(localStorage.getItem('ey_v2_submissions') || '[]');
        studentSubs = (Array.isArray(allSubs) ? allSubs : []).filter(s => String(s.studentId) === String(student.id));
      } catch (e) {}

      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">Bảng kết quả học tập — ${student.name}</h3>
          <p style="color: var(--text-muted); font-size: 13.5px; max-width: 600px; margin: 0 auto 20px;">
            Chuỗi ngày học: <strong>🔥 ${farmData.streakDays || 1} ngày</strong> · Bài đã nộp: <strong>📝 ${studentSubs.length} bài</strong> · Giọt nước: <strong>💧 ${gardenData.water || 0} giọt</strong> · Hoa đã nở: <strong>🌺 ${gardenData.bloomedFlowers || 0} bông</strong> · Xu trang trại: <strong>🪙 ${farmData.coins || 0} xu</strong>
          </p>
          <button onclick="window.EyStudentUI.switchTab('hanhTrinh')" style="padding: 10px 20px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">
            Vào chăm sóc Nông trại & Vườn hoa ›
          </button>
        </div>
      `;
    }
  }

  // Student UI Actions & Modal
  window.EyStudentUI = {
    portal: new EyStudentPortal(),

    render(container) {
      this.portal.render(container);
    },

    switchTab(tab) {
      this.portal.currentStudentTab = tab;
      const c = document.getElementById('content-area');
      if (c) this.render(c);
    },

    switchRoleToTeacher() {
      window.EyAuth.switchRole('teacher');
      if (window.switchTab) window.switchTab('lopHoc');
    },

    logoutStudent() {
      window.EyAuth.logout();
      if (window.switchTab) window.switchTab('congCu');
    },

    launchGame(gameKey) {
      if (gameKey === 'nong-trai') {
        if (window.openNongTraiGame) {
          window.openNongTraiGame();
        } else {
          alert('Đang mở Trò chơi 1: Nông Trại Vui Vẻ!');
          if (window.switchTab) window.switchTab('troChoiHanhTrinh');
        }
      } else if (gameKey === 'vuon-hoa') {
        if (window.openVuonHoaGame) {
          window.openVuonHoaGame();
        } else {
          alert('Đang mở Trò chơi 2: Vườn Hoa Tri Thức!');
          if (window.switchTab) window.switchTab('troChoiHanhTrinh');
        }
      }
    },

    // Modal Đăng nhập Học sinh (chuẩn ảnh video hanh_trinh_sec_250.jpg)
    showLoginModal() {
      let modal = document.getElementById('ey-login-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ey-login-modal';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); font-family: 'Be Vietnam Pro', sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(420px, 92vw); border-radius: 24px; padding: 32px 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); border: 1px solid #e2e8f0; position: relative;">
            <button onclick="document.getElementById('ey-login-modal').remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer;">&times;</button>

            <h2 style="margin: 0 0 22px 0; text-align: center; font-size: 22px; font-weight: 800; color: #0f172a;">Đăng nhập</h2>

            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">TÀI KHOẢN</label>
              <input type="text" id="login-account-input" placeholder="Nhập mã học sinh (VD: 10011634)" style="width: 100%; padding: 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14.5px; box-sizing: border-box; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#cbd5e1'" />
            </div>

            <div style="margin-bottom: 18px;">
              <label style="display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">MẬT KHẨU</label>
              <div style="position: relative;">
                <input type="password" id="login-password-input" placeholder="Mật khẩu PIN 6 số (VD: 188464)" style="width: 100%; padding: 12px 40px 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14.5px; box-sizing: border-box; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#cbd5e1'" />
                <button type="button" onclick="const f=document.getElementById('login-password-input'); f.type = f.type==='password'?'text':'password';" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 16px;">👁</button>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 12.5px; color: #64748b;">
              <input type="checkbox" id="login-agree-terms" checked style="accent-color: #0d9488; width: 16px; height: 16px;" />
              <label for="login-agree-terms">Tôi đã đọc và đồng ý với <strong style="color: #0d9488;">Điều khoản sử dụng</strong>.</label>
            </div>

            <button id="btn-login-submit" style="width: 100%; padding: 12px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.3); transition: all 0.2s;">
              Đăng nhập
            </button>

            <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
              <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">hoặc</span>
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
            </div>

            <button id="btn-login-teacher-google" style="width: 100%; padding: 11px; background: #fff; color: #334155; border: 1.5px solid #cbd5e1; border-radius: 12px; font-weight: 700; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Đăng nhập Giáo viên (Google)</span>
            </button>
          </div>
        </div>
      `;

      modal.querySelector('#btn-login-submit').onclick = () => {
        const acc = modal.querySelector('#login-account-input').value;
        const pwd = modal.querySelector('#login-password-input').value;
        const res = window.EyAuth.loginStudent(acc, pwd);
        if (res.success) {
          modal.remove();
          if (window.switchTab) window.switchTab('troChoiHanhTrinh');
        } else {
          alert(res.message);
        }
      };

      modal.querySelector('#btn-login-teacher-google').onclick = () => {
        modal.remove();
        window.EyAuth.openLoginModal('teacher');
      };
    }
  };

  window.EyStudentPortal = EyStudentPortal;
})(window);
