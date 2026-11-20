/**
 * OLM-Style Assignment & Learning Loop Engine for EY / SmartEdu
 * Module Quản lý bài tập, Giao đề theo lớp, Học sinh làm bài trực tuyến,
 * Tự động chấm điểm & Tích lũy Xu/Lúa đồng bộ vào Nông Trại Cá Nhân
 */

(function (window) {
  'use strict';

  // Câu hỏi ngân hàng mẫu Toán 10, 11, 12 chuẩn SGK mới
  const SAMPLE_QUESTION_BANKS = {
    'toan10': [
      { q: "Mệnh đề nào sau đây là mệnh đề đúng?", options: ["Số 2 là số nguyên tố chẵn duy nhất", "Mọi số nguyên tố đều là số lẻ", "Số 0 là số nguyên dương nhỏ nhất", "Tổng hai số lẻ là một số lẻ"], correct: 0, explain: "Số 2 là số nguyên tố chẵn duy nhất vì các số chẵn khác đều chia hết cho 2." },
      { q: "Cho tập hợp $A = \\{x \\in \\mathbb{R} \\mid x^2 - 4 = 0\\}$. Số phần tử của tập hợp $A$ là:", options: ["1 phần tử", "2 phần tử", "0 phần tử", "Vô số phần tử"], correct: 1, explain: "Phương trình $x^2 - 4 = 0 \\iff x = \\pm 2$, vậy $A = \\{-2; 2\\}$ có 2 phần tử." },
      { q: "Bất phương trình nào sau đây là bất phương trình bậc nhất hai ẩn?", options: ["$2x + 3y > 5$", "$x^2 + y \\le 1$", "$xy + 2x < 3$", "$x + y^2 \\ge 4$"], correct: 0, explain: "$2x + 3y > 5$ có dạng $ax + by > c$ với bậc của $x$ và $y$ đều là bậc 1." },
      { q: "Cho tam giác $ABC$ có cạnh $a = 6, b = 8$ và góc $\\widehat{C} = 60^\\circ$. Độ dài cạnh $c$ là:", options: ["$c = 2\\sqrt{13}$", "$c = 10$", "$c = 2\\sqrt{37}$", "$c = 7$"], correct: 0, explain: "Áp dụng định lý Cosin: $c^2 = a^2 + b^2 - 2ab\\cos C = 36 + 64 - 2 \\cdot 6 \\cdot 8 \\cdot \\frac{1}{2} = 52 \\implies c = \\sqrt{52} = 2\\sqrt{13}$." },
      { q: "Vectơ có điểm đầu là $A$ và điểm cuối là $B$ được ký hiệu là:", options: ["$\\vec{AB}$", "$\\vec{BA}$", "$AB$", "$|\\vec{AB}|$"], correct: 0, explain: "Vectơ có hướng từ $A$ đến $B$ ký hiệu là $\\vec{AB}$." }
    ],
    'toan11': [
      { q: "Tập xác định của hàm số $y = \\tan x$ là:", options: ["$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}\\}$", "$D = \\mathbb{R} \\setminus \\{k\\pi, k \\in \\mathbb{Z}\\}$", "$D = \\mathbb{R}$", "$D = [-1; 1]$"], correct: 0, explain: "Hàm số $\\tan x = \\frac{\\sin x}{\\cos x}$ xác định khi $\\cos x \\ne 0 \\iff x \\ne \\frac{\\pi}{2} + k\\pi$." },
      { q: "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Số hạng thứ 5 là:", options: ["$u_5 = 11$", "$u_5 = 13$", "$u_5 = 9$", "$u_5 = 15$"], correct: 0, explain: "$u_n = u_1 + (n - 1)d \\implies u_5 = 3 + 4 \\cdot 2 = 11$." },
      { q: "Giá trị của giới hạn $\\lim_{n \\to \\infty} \\frac{2n + 1}{n + 3}$ bằng:", options: ["2", "1", "$\\frac{1}{3}$", "$\\infty$"], correct: 0, explain: "Chia cả tử và mẫu cho $n$: $\\lim \\frac{2 + 1/n}{1 + 3/n} = \\frac{2}{1} = 2$." }
    ],
    'toan12': [
      { q: "Đạo hàm của hàm số $y = x^3 - 3x + 2$ là:", options: ["$y' = 3x^2 - 3$", "$y' = 3x^2 - 3x$", "$y' = x^2 - 3$", "$y' = 3x^2 + 2$"], correct: 0, explain: "$y' = (x^3)' - (3x)' + (2)' = 3x^2 - 3$." },
      { q: "Hàm số $y = f(x)$ đồng biến trên khoảng $(a; b)$ khi và chỉ khi:", options: ["$f'(x) \\ge 0, \\forall x \\in (a; b)$ (dấu '=' xảy ra tại hữu hạn điểm)", "$f'(x) \\le 0, \\forall x \\in (a; b)$", "$f'(x) = 0, \\forall x \\in (a; b)$", "$f'(x) < 0, \\forall x \\in (a; b)$"], correct: 0, explain: "Theo định lý mở rộng về tính đơn điệu, $f'(x) \\ge 0$ và bằng 0 tại hữu hạn điểm thì hàm số đồng biến." },
      { q: "Trong không gian $Oxyz$, tọa độ của vectơ $\\vec{u} = 2\\vec{i} - 3\\vec{j} + 5\\vec{k}$ là:", options: ["$(2; -3; 5)$", "$(2; 3; 5)$", "$(-2; 3; -5)$", "$(2; -3; -5)$"], correct: 0, explain: "Tọa độ vectơ $\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k}$ chính là $(x; y; z) = (2; -3; 5)$." }
    ]
  };

  class EyAssignmentManager {
    constructor() {
      this.fb = window.FirebaseService;
    }

    // ==========================================
    // 1. GIAO DIỆN GIÁO VIÊN: QUẢN LÝ BÀI TẬP CỦA LỚP
    // ==========================================

    async renderClassAssignments(container, cls) {
      const assignments = await this.fb.getAssignments(cls.id);

      container.innerHTML = `
        <div style="background: var(--bg-card, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 20px; padding: 24px; box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.05)); font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <!-- Header Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Bài tập & Đề thi — ${cls.name}</h3>
                <span style="font-size: 11.5px; font-weight: 700; background: #ecfdf5; color: #047857; padding: 3px 10px; border-radius: 9999px;">
                  ${assignments.length} bài đã giao
                </span>
              </div>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
                Giao bài tập trắc nghiệm tự động chấm điểm, học sinh hoàn thành sẽ được thưởng <strong>Xu Vàng 🪙</strong> vào Nông Trại cá nhân.
              </p>
            </div>

            <button id="btn-create-assignment" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
              <span>+</span> <span>Giao bài tập mới</span>
            </button>
          </div>

          <!-- Assignments List -->
          ${assignments.length === 0 ? `
            <div style="padding: 48px 20px; text-align: center; background: #f8fafc; border-radius: 16px; border: 1.5px dashed #cbd5e1;">
              <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
              <h4 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0;">Lớp này chưa có bài tập nào</h4>
              <p style="font-size: 13px; color: #64748b; max-width: 480px; margin: 0 auto 18px;">
                Thầy cô hãy bấm nút <strong>"Giao bài tập mới"</strong> để chọn đề kiểm tra và kích hoạt vòng lặp học tập nhận quà Nông trại cho học sinh!
              </p>
              <button onclick="document.getElementById('btn-create-assignment').click()" style="padding: 9px 18px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
                + Giao bài tập đầu tiên ngay
              </button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${assignments.map(a => `
                <div class="assignment-card" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                  <div style="flex: 1; min-width: 260px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                      <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${a.title}</h4>
                      <span style="font-size: 11px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 6px;">${a.grade || cls.grade}</span>
                      <span style="font-size: 11px; font-weight: 800; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px;">+${a.rewardCoins || 50} Xu 🪙</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 16px; font-size: 12.5px; color: #64748b; flex-wrap: wrap;">
                      <span>📋 <strong>${(a.questions || []).length}</strong> câu trắc nghiệm</span>
                      <span>⏱️ <strong>${a.durationMinutes ? `${a.durationMinutes} phút` : 'Tự do'}</strong></span>
                      <span>📅 Hạn chót: <strong>${a.deadline ? new Date(a.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}</strong></span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn-view-submissions" data-id="${a.id}" style="padding: 9px 16px; border-radius: 10px; background: #f0fdfa; color: #0d9488; border: 1.5px solid #99f6e4; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                      <span>📊 Bảng điểm</span>
                    </button>
                    <button class="btn-delete-assignment" data-id="${a.id}" style="width: 36px; height: 36px; border-radius: 10px; background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; font-weight: 800; font-size: 14px; cursor: pointer;" title="Xóa bài tập này">
                      🗑️
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;

      // Listeners
      container.querySelector('#btn-create-assignment')?.addEventListener('click', () => {
        this.showCreateAssignmentModal(cls, () => this.renderClassAssignments(container, cls));
      });

      container.querySelectorAll('.btn-view-submissions').forEach(btn => {
        btn.addEventListener('click', () => {
          const aId = btn.dataset.id;
          const a = assignments.find(x => x.id === aId);
          if (a) this.showSubmissionsModal(a, cls);
        });
      });

      container.querySelectorAll('.btn-delete-assignment').forEach(btn => {
        btn.addEventListener('click', async () => {
          const aId = btn.dataset.id;
          if (confirm('Thầy cô có chắc chắn muốn xóa bài tập này không?')) {
            await this.fb.deleteAssignment(aId);
            this.renderClassAssignments(container, cls);
          }
        });
      });
    }

    // Modal Tạo & Giao bài tập mới (Chuẩn OLM)
    showCreateAssignmentModal(cls, onCreated) {
      let modal = document.getElementById('assignment-create-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'assignment-create-modal';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(650px, 95vw); border-radius: 24px; padding: 30px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); border: 1px solid #cbd5e1; max-height: 90vh; overflow-y: auto; position: relative;">
            <button onclick="document.getElementById('assignment-create-modal').remove()" style="position: absolute; top: 20px; right: 20px; background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; color: #64748b;">✕</button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 48px; height: 48px; border-radius: 14px; background: #ccfbf1; color: #0d9488; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                📝
              </div>
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a;">Giao Bài Tập Cho ${cls.name}</h3>
                <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Thiết lập bài kiểm tra, phần thưởng Xu Nông Trại cho học sinh</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13.5px;">
              <div>
                <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 5px;">Tên bài tập / Kiểm tra:</label>
                <input type="text" id="asm-title" placeholder="VD: Ôn tập Chương 1 - Mệnh đề & Tập hợp" value="Bài tập Toán tuần: ${cls.name}" style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; box-sizing: border-box; outline: none;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 5px;">Khối kiến thức:</label>
                  <select id="asm-grade-bank" style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; box-sizing: border-box; background: #fff;">
                    <option value="toan10">Toán 10 (SGK Kết nối tri thức & CD)</option>
                    <option value="toan11">Toán 11 (SGK Kết nối tri thức & CD)</option>
                    <option value="toan12">Toán 12 (SGK Kết nối tri thức & CD)</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 5px;">Thời gian làm bài:</label>
                  <select id="asm-duration" style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; box-sizing: border-box; background: #fff;">
                    <option value="15">15 phút</option>
                    <option value="30" selected>30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                    <option value="0">Tự do (Không giới hạn)</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 5px;">Hạn chót nộp bài:</label>
                  <input type="date" id="asm-deadline" value="${new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}" style="width: 100%; padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 13.5px; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 5px;">Phần thưởng Xu Nông Trại:</label>
                  <select id="asm-reward" style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 14px; font-weight: 600; box-sizing: border-box; background: #fff;">
                    <option value="30">30 Xu 🪙 (Khích lệ)</option>
                    <option value="50" selected>50 Xu 🪙 (Chuẩn OLM)</option>
                    <option value="100">100 Xu 🪙 (Đặc biệt)</option>
                  </select>
                </div>
              </div>

              <div style="padding: 12px 16px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; font-size: 12.5px; color: #0f766e;">
                💡 <strong>Cơ chế Gamification OLM:</strong> Khi học sinh nộp bài thi, hệ thống sẽ tự động chấm điểm và lập tức cộng thưởng Xu và Lúa vào <strong>Nông Trại Vui Vẻ</strong> của học sinh để ấp trứng gà và mở ô đất mới!
              </div>
            </div>

            <div style="margin-top: 24px; display: flex; gap: 10px;">
              <button id="btn-submit-create-asm" style="flex: 2; padding: 12px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
                🚀 Giao Bài Ngay Cho Cả Lớp
              </button>
              <button onclick="document.getElementById('assignment-create-modal').remove()" style="flex: 1; padding: 12px; background: #f8fafc; color: #64748b; border: 1.5px solid #cbd5e1; border-radius: 12px; font-weight: 700; font-size: 13.5px; cursor: pointer;">
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      `;

      modal.querySelector('#btn-submit-create-asm').onclick = async () => {
        const title = modal.querySelector('#asm-title').value.trim();
        const gradeKey = modal.querySelector('#asm-grade-bank').value;
        const duration = parseInt(modal.querySelector('#asm-duration').value, 10);
        const deadline = modal.querySelector('#asm-deadline').value;
        const reward = parseInt(modal.querySelector('#asm-reward').value, 10);

        if (!title) {
          alert('Vui lòng nhập tên bài tập!');
          return;
        }

        const questions = SAMPLE_QUESTION_BANKS[gradeKey] || SAMPLE_QUESTION_BANKS['toan10'];

        const newAsm = {
          id: 'asm_' + Date.now().toString(36),
          title: title,
          classId: cls.id,
          className: cls.name,
          grade: cls.grade,
          gradeKey: gradeKey,
          durationMinutes: duration,
          deadline: deadline,
          rewardCoins: reward,
          rewardGrain: 10,
          questions: questions,
          createdAt: new Date().toISOString()
        };

        await this.fb.saveAssignment(newAsm);
        alert(`Đã giao bài tập thành công cho lớp ${cls.name}!`);
        modal.remove();
        if (typeof onCreated === 'function') onCreated();
      };
    }

    // Modal Bảng điểm & Danh sách bài nộp của cả lớp (Teacher view)
    async showSubmissionsModal(assignment, cls) {
      let modal = document.getElementById('submissions-list-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'submissions-list-modal';
        document.body.appendChild(modal);
      }

      const students = window.EyAuth ? window.EyAuth.getStudentsByClass(cls.id) : [];
      const submissions = await this.fb.getSubmissions(assignment.id);

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(780px, 95vw); border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); border: 1px solid #cbd5e1; max-height: 90vh; display: flex; flex-direction: column;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px;">
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Bảng Điểm: ${assignment.title}</h3>
                <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Lớp ${cls.name} · Đã nộp: <strong>${submissions.length} / ${students.length} học sinh</strong></p>
              </div>
              <button onclick="document.getElementById('submissions-list-modal').remove()" style="background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; color: #64748b;">✕</button>
            </div>

            <div style="flex: 1; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700;">
                    <th style="padding: 10px 14px;">MÃ HS</th>
                    <th style="padding: 10px 14px;">HỌ VÀ TÊN</th>
                    <th style="padding: 10px 14px; text-align: center;">ĐIỂM SỐ</th>
                    <th style="padding: 10px 14px; text-align: center;">KẾT QUẢ</th>
                    <th style="padding: 10px 14px; text-align: right;">THỜI GIAN NỘP</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(std => {
                    const sub = submissions.find(s => s.studentId === std.id);
                    return `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 14px; font-family: monospace; font-weight: 700; color: #0d9488;">${std.id}</td>
                        <td style="padding: 12px 14px; font-weight: 700; color: #0f172a;">${std.name}</td>
                        <td style="padding: 12px 14px; text-align: center;">
                          ${sub ? `<strong style="font-size: 15px; color: ${sub.score >= 8 ? '#15803d' : (sub.score >= 5 ? '#b45309' : '#dc2626')};">${sub.score.toFixed(1)} / 10</strong>` : '<span style="color: #94a3b8; font-style: italic;">Chưa nộp</span>'}
                        </td>
                        <td style="padding: 12px 14px; text-align: center;">
                          ${sub ? `<span style="background: #ecfdf5; color: #047857; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">Đúng ${sub.correctCount}/${sub.totalCount}</span>` : '<span style="color: #cbd5e1;">-</span>'}
                        </td>
                        <td style="padding: 12px 14px; text-align: right; color: #64748b; font-size: 12.5px;">
                          ${sub ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(sub.submittedAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: flex-end;">
              <button onclick="document.getElementById('submissions-list-modal').remove()" style="padding: 9px 20px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
                Đóng bảng điểm
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // 2. GIAO DIỆN HỌC SINH: LÀM BÀI TẬP & NHẬN THƯỞNG NÔNG TRẠI
    // ==========================================

    async renderStudentAssignments(container, student, cls) {
      const assignments = await this.fb.getAssignments(cls.id);
      const submissions = await this.fb.getSubmissions(null, student.id);

      container.innerHTML = `
        <div style="font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">📝 Bài tập do Thầy Cô giao cho ${cls.name}</h2>
            <p style="margin: 0; font-size: 13.5px; color: #64748b;">
              Hoàn thành bài tập để nhận <strong>Xu Vàng 🪙</strong> mua hạt giống và <strong>Lúa 🌾</strong> cho gà ăn trong Nông Trại Vui Vẻ!
            </p>
          </div>

          ${assignments.length === 0 ? `
            <div style="background: var(--bg-card, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 20px; padding: 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🌟</div>
              <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">Hiện tại bạn đã hoàn thành hết bài tập!</h3>
              <p style="font-size: 13.5px; color: #64748b; max-width: 460px; margin: 0 auto 20px;">
                Thầy cô chưa giao bài tập mới. Hãy vào <strong>Trò chơi hành trình (Nông trại vui vẻ)</strong> hoặc <strong>Sổ tay kiến thức</strong> để ôn tập nhé!
              </p>
              <button onclick="window.EyStudentUI ? window.EyStudentUI.switchTab('hanhTrinh') : (window.switchTab && window.switchTab('troChoiHanhTrinh'))" style="padding: 10px 22px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer;">
                🌾 Đến Nông Trại Vui Vẻ ›
              </button>
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
              ${assignments.map(a => {
                const sub = submissions.find(s => s.assignmentId === a.id);
                const isDone = !!sub;

                return `
                  <div style="background: #ffffff; border: 2px solid ${isDone ? '#a7f3d0' : '#e2e8f0'}; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                    ${isDone ? `<span style="position: absolute; top: 14px; right: 14px; background: #ecfdf5; color: #047857; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">✓ Đã nộp (${sub.score.toFixed(1)}đ)</span>` : `<span style="position: absolute; top: 14px; right: 14px; background: #fef3c7; color: #b45309; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: 9999px;">Chưa làm</span>`}
                    
                    <div>
                      <div style="font-size: 32px; margin-bottom: 10px;">${isDone ? '🎉' : '📚'}</div>
                      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.3;">${a.title}</h3>
                      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #64748b; margin-bottom: 16px;">
                        <span>📋 Số câu hỏi: <strong>${(a.questions || []).length} câu</strong></span>
                        <span>⏱️ Thời gian: <strong>${a.durationMinutes ? `${a.durationMinutes} phút` : 'Tự do'}</strong></span>
                        <span>🎁 Phần thưởng: <strong style="color: #d97706;">+${a.rewardCoins || 50} Xu 🪙</strong> và <strong style="color: #15803d;">+10 Lúa 🌾</strong></span>
                      </div>
                    </div>

                    ${isDone ? `
                      <div style="display: flex; gap: 8px;">
                        <button class="btn-review-sub" data-id="${a.id}" style="flex: 1; padding: 11px; background: #f0fdfa; color: #0d9488; border: 1.5px solid #99f6e4; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer;">
                          👁️ Xem lại bài làm
                        </button>
                        <button onclick="window.EyStudentUI ? window.EyStudentUI.switchTab('hanhTrinh') : (window.switchTab && window.switchTab('troChoiHanhTrinh'))" style="padding: 11px 16px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer;" title="Vào Nông Trại dùng Xu">
                          🌾 Nông trại
                        </button>
                      </div>
                    ` : `
                      <button class="btn-start-quiz" data-id="${a.id}" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(13,148,136,0.3);">
                        <span>Bắt đầu làm bài thi ➔</span>
                      </button>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;

      // Listeners
      container.querySelectorAll('.btn-start-quiz').forEach(btn => {
        btn.addEventListener('click', () => {
          const aId = btn.dataset.id;
          const a = assignments.find(x => x.id === aId);
          if (a) this.openQuizRunner(a, student, () => this.renderStudentAssignments(container, student, cls));
        });
      });

      container.querySelectorAll('.btn-review-sub').forEach(btn => {
        btn.addEventListener('click', () => {
          const aId = btn.dataset.id;
          const a = assignments.find(x => x.id === aId);
          const sub = submissions.find(s => s.assignmentId === aId);
          if (a && sub) this.openQuizReview(a, sub);
        });
      });
    }

    // Modal Làm Bài Thi Trắc Nghiệm Trực Tuyến Chuẩn OLM
    openQuizRunner(assignment, student, onComplete) {
      let modal = document.getElementById('quiz-runner-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quiz-runner-modal';
        document.body.appendChild(modal);
      }

      const qList = assignment.questions || [];
      const userAnswers = {};
      let remainingSec = (assignment.durationMinutes || 30) * 60;
      let timer = null;

      const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      };

      const renderRunner = () => {
        modal.innerHTML = `
          <div style="position: fixed; inset: 0; background: #0f172a; z-index: 9999999; display: flex; flex-direction: column; font-family: 'Be Vietnam Pro', system-ui, sans-serif; color: #f8fafc;">
            <!-- Topbar Header -->
            <div style="background: #1e293b; border-bottom: 1.5px solid rgba(255,255,255,0.1); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
              <div>
                <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #f8fafc;">${assignment.title}</h2>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Thí sinh: <strong>${student.name}</strong> (${student.id})</div>
              </div>

              <div style="display: flex; align-items: center; gap: 18px;">
                ${assignment.durationMinutes > 0 ? `
                  <div style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1.5px solid #0d9488; padding: 6px 14px; border-radius: 12px;">
                    <span style="font-size: 16px;">⏱️</span>
                    <span id="quiz-timer-display" style="font-size: 17px; font-weight: 900; color: #2dd4bf; font-family: monospace;">${formatTime(remainingSec)}</span>
                  </div>
                ` : ''}

                <button id="btn-submit-quiz-now" style="padding: 10px 22px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">
                  ✓ Nộp bài thi
                </button>
              </div>
            </div>

            <!-- Quiz Body Area -->
            <div style="flex: 1; display: flex; overflow: hidden;">
              <!-- Left Questions Stream -->
              <div id="quiz-questions-stream" style="flex: 1; overflow-y: auto; padding: 28px 36px; display: flex; flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                ${qList.map((q, idx) => {
                  const opts = q.options || q.choices || [];
                  const labels = ['A', 'B', 'C', 'D'];

                  return `
                    <div id="quiz-question-box-${idx}" style="background: #1e293b; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 22px 26px; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
                      <div style="font-size: 15.5px; font-weight: 800; color: #f8fafc; margin-bottom: 16px; display: flex; gap: 10px; line-height: 1.5;">
                        <span style="color: #2dd4bf; flex-shrink: 0;">Câu ${idx + 1}:</span>
                        <div class="katex-target" style="flex: 1;">${q.q || q.text || ''}</div>
                      </div>

                      <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${opts.map((opt, optIdx) => `
                          <label class="quiz-option-label" data-q="${idx}" data-opt="${optIdx}" style="display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.15s;">
                            <input type="radio" name="ans_q_${idx}" value="${optIdx}" style="accent-color: #0d9488; width: 18px; height: 18px;" />
                            <span style="font-weight: 800; color: #94a3b8;">${labels[optIdx]}.</span>
                            <span class="katex-target" style="font-size: 14.5px; color: #e2e8f0; font-weight: 600;">${opt}</span>
                          </label>
                        `).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Right Question Palette (Sidebar Jump) -->
              <div style="width: 220px; background: #1e293b; border-left: 1px solid rgba(255,255,255,0.08); padding: 20px; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0;">
                <div>
                  <h4 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Danh sách câu hỏi</h4>
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                    ${qList.map((_, i) => `
                      <button id="palette-btn-${i}" onclick="document.getElementById('quiz-question-box-${i}').scrollIntoView({ behavior: 'smooth' })" style="padding: 8px 0; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #cbd5e1; font-weight: 800; font-size: 12px; cursor: pointer;">
                        ${i + 1}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div style="background: rgba(0,0,0,0.25); border-radius: 12px; padding: 12px; font-size: 12px; color: #94a3b8;">
                  Đã làm: <strong id="answered-count-text" style="color: #2dd4bf;">0</strong> / ${qList.length} câu
                </div>
              </div>
            </div>
          </div>
        `;

        // KaTeX Math Rendering
        if (window.renderMathInElement) {
          try {
            window.renderMathInElement(modal, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
              ],
              throwOnError: false
            });
          } catch (e) {}
        }

        // Option selection
        modal.querySelectorAll('.quiz-option-label').forEach(label => {
          label.addEventListener('click', (e) => {
            const qIdx = parseInt(label.dataset.q, 10);
            const optIdx = parseInt(label.dataset.opt, 10);
            userAnswers[qIdx] = optIdx;

            const radio = label.querySelector('input');
            if (radio) radio.checked = true;

            // Highlight chosen label
            const parent = label.parentElement;
            parent.querySelectorAll('.quiz-option-label').forEach(l => {
              l.style.borderColor = 'rgba(255,255,255,0.1)';
              l.style.background = 'rgba(255,255,255,0.03)';
            });
            label.style.borderColor = '#0d9488';
            label.style.background = 'rgba(13, 148, 136, 0.2)';

            // Highlight palette button
            const pBtn = document.getElementById(`palette-btn-${qIdx}`);
            if (pBtn) {
              pBtn.style.background = '#0d9488';
              pBtn.style.borderColor = '#2dd4bf';
              pBtn.style.color = '#fff';
            }

            // Update count
            const answeredCount = Object.keys(userAnswers).length;
            const cntEl = document.getElementById('answered-count-text');
            if (cntEl) cntEl.textContent = answeredCount;
          });
        });

        // Submit Button
        modal.querySelector('#btn-submit-quiz-now').onclick = () => {
          const answered = Object.keys(userAnswers).length;
          if (answered < qList.length) {
            if (!confirm(`Bạn mới trả lời ${answered}/${qList.length} câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay không?`)) {
              return;
            }
          }
          this.gradeAndFinishQuiz(assignment, student, qList, userAnswers, timer, modal, onComplete);
        };
      };

      renderRunner();

      // Start Countdown Timer
      if (assignment.durationMinutes > 0) {
        timer = setInterval(() => {
          remainingSec--;
          const disp = document.getElementById('quiz-timer-display');
          if (disp) disp.textContent = formatTime(remainingSec);
          if (remainingSec <= 0) {
            clearInterval(timer);
            alert('Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài thi của bạn.');
            this.gradeAndFinishQuiz(assignment, student, qList, userAnswers, timer, modal, onComplete);
          }
        }, 1000);
      }
    }

    // Tự động chấm điểm, lưu kết quả & cộng thưởng vào Nông Trại
    async gradeAndFinishQuiz(assignment, student, qList, userAnswers, timer, modal, onComplete) {
      if (timer) clearInterval(timer);

      let correctCount = 0;
      qList.forEach((q, idx) => {
        const correctOpt = q.correct !== undefined ? q.correct : (q.correctIndex !== undefined ? q.correctIndex : 0);
        if (userAnswers[idx] === correctOpt) correctCount++;
      });

      const totalCount = qList.length;
      const score = totalCount > 0 ? (correctCount / totalCount) * 10 : 0;
      const earnedCoins = score >= 8 ? (assignment.rewardCoins || 50) : (score >= 5 ? 30 : 15);
      const earnedGrain = 10;

      const submission = {
        id: 'sub_' + Date.now().toString(36),
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        studentId: student.id,
        studentName: student.name,
        score: score,
        correctCount: correctCount,
        totalCount: totalCount,
        earnedCoins: earnedCoins,
        earnedGrain: earnedGrain,
        userAnswers: userAnswers,
        submittedAt: new Date().toISOString()
      };

      // Ghi nhận submission và tự động cộng Xu vào Nông Trại Vui Vẻ
      await this.fb.submitAssignment(submission);

      // Hiển thị Màn hình kết quả & Vinh danh OLM
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(540px, 92vw); border-radius: 28px; padding: 36px 30px; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.35); border: 2px solid #a7f3d0;">
            <div style="font-size: 64px; margin-bottom: 10px;">${score >= 8 ? '🏆' : (score >= 5 ? '🌟' : '💪')}</div>
            <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 6px 0; color: #0f172a;">Hoàn Thành Bài Thi!</h2>
            <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">${assignment.title}</p>

            <!-- Score Badge -->
            <div style="background: #f0fdfa; border: 2px solid #2dd4bf; border-radius: 20px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 42px; font-weight: 900; color: #0d9488; line-height: 1;">${score.toFixed(1)} <span style="font-size: 20px; font-weight: 700; color: #64748b;">/ 10</span></div>
              <div style="font-size: 13.5px; font-weight: 700; color: #0f766e; margin-top: 8px;">Trả lời đúng ${correctCount} / ${totalCount} câu hỏi</div>
            </div>

            <!-- Gamification Reward Box (Vòng lặp OLM -> Nông Trại) -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1.5px solid #fcd34d; border-radius: 18px; padding: 16px 20px; margin-bottom: 24px; text-align: left; display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 38px;">🌾</span>
              <div>
                <div style="font-weight: 800; font-size: 15px; color: #92400e;">PHẦN THƯỞNG NÔNG TRẠI VUI VẺ</div>
                <div style="font-size: 13px; color: #b45309; margin-top: 3px;">
                  Bạn nhận được <strong>+${earnedCoins} Xu Vàng 🪙</strong> và <strong>+${earnedGrain} Thóc 🌾</strong>! Số xu đã được cộng trực tiếp vào trang trại của bạn.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button id="btn-modal-go-farm" style="flex: 2; padding: 13px; background: #0d9488; color: #fff; border: none; border-radius: 14px; font-weight: 800; font-size: 14.5px; cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.3);">
                🌾 Vào Nông Trại Chăm Sóc Gà Ngay ➔
              </button>
              <button id="btn-modal-close-quiz" style="flex: 1; padding: 13px; background: #f8fafc; color: #475569; border: 1.5px solid #cbd5e1; border-radius: 14px; font-weight: 700; font-size: 13.5px; cursor: pointer;">
                Đóng
              </button>
            </div>
          </div>
        </div>
      `;

      modal.querySelector('#btn-modal-go-farm').onclick = () => {
        modal.remove();
        if (typeof onComplete === 'function') onComplete();
        if (window.EyStudentUI) window.EyStudentUI.switchTab('hanhTrinh');
      };

      modal.querySelector('#btn-modal-close-quiz').onclick = () => {
        modal.remove();
        if (typeof onComplete === 'function') onComplete();
      };
    }

    // Xem lại bài làm đã nộp kèm lời giải chi tiết
    openQuizReview(assignment, submission) {
      let modal = document.getElementById('quiz-review-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quiz-review-modal';
        document.body.appendChild(modal);
      }

      const qList = assignment.questions || [];
      const userAnswers = submission.userAnswers || {};

      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: 'Be Vietnam Pro', system-ui, sans-serif;">
          <div style="background: #ffffff; color: #1e293b; width: min(780px, 95vw); border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); border: 1px solid #cbd5e1; max-height: 90vh; display: flex; flex-direction: column;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px;">
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Xem Lại Bài Làm: ${assignment.title}</h3>
                <div style="font-size: 13px; color: #64748b; margin-top: 3px;">
                  Điểm số: <strong style="color: #0d9488;">${submission.score.toFixed(1)}/10</strong> · Đúng ${submission.correctCount}/${submission.totalCount} câu
                </div>
              </div>
              <button onclick="document.getElementById('quiz-review-modal').remove()" style="background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; color: #64748b;">✕</button>
            </div>

            <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;">
              ${qList.map((q, idx) => {
                const correctOpt = q.correct !== undefined ? q.correct : (q.correctIndex !== undefined ? q.correctIndex : 0);
                const userOpt = userAnswers[idx];
                const isCorrect = userOpt === correctOpt;
                const opts = q.options || q.choices || [];
                const labels = ['A', 'B', 'C', 'D'];

                return `
                  <div style="background: #f8fafc; border: 1.5px solid ${isCorrect ? '#a7f3d0' : '#fecaca'}; border-radius: 14px; padding: 16px 20px;">
                    <div style="font-weight: 800; font-size: 14.5px; color: #0f172a; margin-bottom: 10px; display: flex; justify-content: space-between;">
                      <span>Câu ${idx + 1}: ${q.q || q.text || ''}</span>
                      <span style="font-size: 12px; font-weight: 800; color: ${isCorrect ? '#059669' : '#dc2626'};">${isCorrect ? '✓ Đúng (+1đ)' : '✕ Sai'}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                      ${opts.map((opt, optIdx) => {
                        const isChosen = userOpt === optIdx;
                        const isRight = optIdx === correctOpt;
                        let bg = '#fff';
                        let border = '#e2e8f0';
                        if (isRight) { bg = '#ecfdf5'; border = '#10b981'; }
                        else if (isChosen && !isRight) { bg = '#fff1f2'; border = '#f43f5e'; }

                        return `
                          <div style="padding: 8px 12px; border-radius: 8px; border: 1.5px solid ${border}; background: ${bg}; font-size: 13px; font-weight: ${isRight || isChosen ? '700' : '500'};">
                            <strong>${labels[optIdx]}.</strong> ${opt}
                            ${isChosen ? ' <em>(Em chọn)</em>' : ''}
                            ${isRight ? ' <strong style="color: #059669;">✓</strong>' : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>

                    ${q.explain ? `
                      <div style="margin-top: 10px; padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 12.5px; color: #1e40af;">
                        <strong>💡 Lời giải:</strong> ${q.explain}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: flex-end;">
              <button onclick="document.getElementById('quiz-review-modal').remove()" style="padding: 9px 22px; background: #0d9488; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
                Đã hiểu, đóng lại
              </button>
            </div>
          </div>
        </div>
      `;

      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(modal, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {}
      }
    }
  }

  window.EyAssignmentManager = new EyAssignmentManager();
})(window);
