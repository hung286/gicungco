
  // Breakout disabled: allow running inside portal modal


/**
 * iMath Game Core JS - Chuẩn Giáo Viên Đổi Mới & iMath THPT 2025
 * Tích hợp công thức Toán KaTeX, Phóng to/Thu nhỏ đề bài, Lightbox hình ảnh & Cơ chế Sư phạm
 * Bản quyền phát triển bởi NMH Thầy Nguyễn Mạnh Hùng
 */

(function () {
  'use strict';

  // 1. Tự động nạp KaTeX và CSS nếu trang chưa có
  function injectKaTeX() {
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/katex.min.css';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[href*="imath-game-core.css"]')) {
      const coreCss = document.createElement('link');
      coreCss.rel = 'stylesheet';
      coreCss.href = '/games_2/imath-game-core.css';
      document.head.appendChild(coreCss);
    }
    if (typeof window.katex === 'undefined' && !document.querySelector('script[src*="katex.min.js"]')) {
      const script = document.createElement('script');
      script.src = '/assets/katex.min.js';
      script.defer = true;
      script.onload = () => {
        if (!document.querySelector('script[src*="auto-render.min.js"]')) {
          const autoScript = document.createElement('script');
          autoScript.src = '/assets/auto-render.min.js';
          autoScript.defer = true;
          document.head.appendChild(autoScript);
        }
      };
      document.head.appendChild(script);
    }
      if (!document.querySelector('script[src*="smartedu-game-tts.js"]')) {
      const ttsScript = document.createElement('script');
      ttsScript.src = '/assets/smartedu-game-tts.js';
      ttsScript.defer = true;
      document.head.appendChild(ttsScript);
    }
  }

  injectKaTeX();

  // 2. Đối tượng quản lý iMathCore toàn cục
  const iMathCore = {
    currentFontSizePercent: 100,
    activeZoomTargets: new Set(),
    questions: [],

    // Chuẩn hóa chuỗi Toán học LaTeX (sửa lỗi gõ mũ 4^10 -> 4^{10}, dfrac -> frac, v.v.)
    cleanMathString(str) {
      if (!str || typeof str !== 'string') return str || '';
      let text = str.trim();
      // Khôi phục phân số \dfrac -> \frac
      text = text.replace(/\\dfrac/g, '\\frac');
      // Sửa số mũ liền kề không ngoặc
      text = text.replace(/\^([0-9]{2,})/g, '^{$1}');
      return text;
    },

    // Quét và render KaTeX cho một phần tử bất kỳ
    renderMath(container) {
      if (!container) return;
      try {
        if (window.renderMathInElement) {
          window.renderMathInElement(container, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
          });
        } else if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([container]).catch(() => {});
        }
      } catch (err) {
        console.warn('Lỗi render KaTeX:', err);
      }
    },

    // Trích xuất link ảnh từ câu hỏi (hỗ trợ imageUrl, markdown ![](..), html <img src=..>)
    extractImageUrl(qObj) {
      if (!qObj) return null;
      if (qObj.imageUrl && typeof qObj.imageUrl === 'string') return qObj.imageUrl.trim();
      if (Array.isArray(qObj.image_paths) && qObj.image_paths.length > 0) return qObj.image_paths[0];

      const content = qObj.q || qObj.content || qObj.question || '';
      const mdMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (mdMatch) return mdMatch[2];

      const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (htmlMatch) return htmlMatch[1];

      return null;
    },

    // 3. Khởi tạo Thanh công cụ Phóng to / Thu nhỏ đề bài (iMath Font Zoom Toolbar)
    initZoomControls(targetContainer, targetZoomElements) {
      if (!targetContainer) return;
      if (targetContainer.querySelector('.imath-zoom-bar')) return;

      const bar = document.createElement('div');
      bar.className = 'imath-zoom-bar';
      bar.innerHTML = `
        <span class="imath-zoom-label">🔍 Cỡ chữ:</span>
        <button type="button" class="imath-zoom-btn" title="Thu nhỏ chữ đề bài" id="imath-btn-zoom-out">A-</button>
        <span class="imath-zoom-label" id="imath-zoom-val" style="min-width: 36px; text-align: center;">100%</span>
        <button type="button" class="imath-zoom-btn" title="Phóng to chữ đề bài" id="imath-btn-zoom-in">A+</button>
        <button type="button" class="imath-zoom-btn" title="Đặt lại cỡ chữ chuẩn" id="imath-btn-zoom-reset">↺</button>
      `;

      targetContainer.insertBefore(bar, targetContainer.firstChild);

      const zoomIn = bar.querySelector('#imath-btn-zoom-in');
      const zoomOut = bar.querySelector('#imath-btn-zoom-out');
      const zoomReset = bar.querySelector('#imath-btn-zoom-reset');
      const zoomVal = bar.querySelector('#imath-zoom-val');

      const applyZoom = (delta, reset = false) => {
        if (reset) {
          this.currentFontSizePercent = 100;
        } else {
          this.currentFontSizePercent = Math.max(80, Math.min(220, this.currentFontSizePercent + delta));
        }
        zoomVal.textContent = `${this.currentFontSizePercent}%`;

        const elements = typeof targetZoomElements === 'string'
          ? document.querySelectorAll(targetZoomElements)
          : (Array.isArray(targetZoomElements) ? targetZoomElements : [targetZoomElements]);

        const ratio = this.currentFontSizePercent / 100;
        elements.forEach(el => {
          if (!el) return;
          const nodes = [el, ...Array.from(el.querySelectorAll('div, span, p, .katex, .notranslate'))];
          nodes.forEach(node => {
            if (node.classList.contains('imath-zoom-btn') || node.classList.contains('imath-zoom-label')) return;
            if (!node.dataset.imathBaseFs) {
              const cs = parseFloat(window.getComputedStyle(node).fontSize) || 16;
              node.dataset.imathBaseFs = cs;
            }
            const base = parseFloat(node.dataset.imathBaseFs);
            if (base > 8) {
              node.style.setProperty('font-size', `${Math.round(base * ratio)}px`, 'important');
              node.style.setProperty('line-height', '1.55', 'important');
            }
          });
          const comp = window.getComputedStyle(el);
          if (comp.overflow === 'hidden' || el.style.overflow === 'hidden') {
            el.style.setProperty('overflow', ratio > 1 ? 'auto' : 'hidden', 'important');
          }
        });
      };

      zoomIn.onclick = () => applyZoom(15);
      zoomOut.onclick = () => applyZoom(-15);
      zoomReset.onclick = () => applyZoom(0, true);
    },

    // 4. Khởi tạo Lightbox phóng to ảnh toàn màn hình
    initImageLightbox() {
      if (document.getElementById('imath-global-lightbox')) return;

      const modal = document.createElement('div');
      modal.id = 'imath-global-lightbox';
      modal.className = 'imath-lightbox-overlay imath-hidden';
      modal.innerHTML = `
        <div class="imath-lightbox-container" onclick="event.stopPropagation()">
          <button type="button" class="imath-lightbox-close" title="Đóng phóng to">✕</button>
          <img id="imath-lightbox-img" class="imath-lightbox-img" src="" alt="Hình minh họa phóng to" />
          <div class="imath-lightbox-footer">
            <span>✨ Chạm ra ngoài hoặc bấm nút ✕ để đóng</span>
          </div>
        </div>
      `;

      modal.onclick = () => this.closeLightbox();
      modal.querySelector('.imath-lightbox-close').onclick = () => this.closeLightbox();
      document.body.appendChild(modal);

      // Nhấn ESC để đóng
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeLightbox();
      });
    },

    openLightbox(src) {
      this.initImageLightbox();
      const modal = document.getElementById('imath-global-lightbox');
      const img = document.getElementById('imath-lightbox-img');
      if (modal && img && src) {
        img.src = src;
        modal.classList.remove('imath-hidden');
      }
    },

    closeLightbox() {
      const modal = document.getElementById('imath-global-lightbox');
      if (modal) modal.classList.add('imath-hidden');
    },

    // Tạo hộp ảnh minh họa đính kèm câu hỏi
    createImageBox(imgUrl, caption = 'Chạm vào hình để phóng to toàn màn hình') {
      if (!imgUrl) return null;
      const box = document.createElement('div');
      box.className = 'imath-image-box';
      box.innerHTML = `
        <img src="${imgUrl}" class="imath-image-thumb" alt="Hình minh họa đề bài" />
        <div class="imath-image-caption">🔍 ${caption}</div>
      `;
      const imgEl = box.querySelector('.imath-image-thumb');
      imgEl.onclick = () => this.openLightbox(imgUrl);
      return box;
    },

    // 5. Nạp danh sách câu hỏi từ SmartEdu Play (sessionStorage)
    loadQuestions() {
      try {
        const raw = sessionStorage.getItem('smartedu_imath_questions');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.questions = parsed.map((item, idx) => {
              // Bóc tách text câu hỏi và các phương án
              let qText = item.q || item.content || item.question || `Câu hỏi số ${idx + 1}`;
              let opts = item.options || [];
              let ans = item.a || item.correctAnswer || item.correct_answer || 'A';
              let expl = item.explanation || item.explain || 'Xem lại lý thuyết và công thức trong SGK để giải câu này nhé!';
              let img = this.extractImageUrl(item);

              // Nếu options là mảng object
              if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === 'object') {
                opts = opts.map(o => o.text || o.content || JSON.stringify(o));
              }

              return {
                id: item.id || idx + 1,
                q: qText,
                options: opts,
                a: ans,
                explanation: expl,
                imageUrl: img,
                type: item.type || 'Trắc nghiệm khách quan'
              };
            });
            return this.questions;
          }
        }
      } catch (err) {
        console.warn('Lỗi đọc smartedu_imath_questions:', err);
      }

      // Ngân hàng câu hỏi mẫu chuẩn iMath THPT 2025 nếu chưa nạp đề
      this.questions = [
        {
          id: 1,
          q: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đồ thị như hình vẽ bên. Điểm cực đại của đồ thị hàm số đã cho là:',
          options: [
            'A. $(1; -2)$',
            'B. $(-1; 2)$',
            'C. $x = -1$',
            'D. $y = 2$'
          ],
          a: 'B',
          explanation: 'Dựa vào đồ thị, điểm nhô cao nhất cục bộ là $(-1; 2)$. Chú ý đề hỏi "Điểm cực đại của đồ thị hàm số" nên đáp án phải là toạ độ $(x; y) = (-1; 2)$.',
          imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
          type: 'Trắc nghiệm khách quan'
        },
        {
          id: 2,
          q: 'Tập nghiệm của bất phương trình $\\log_2(2x - 4) \\le 3$ là:',
          options: [
            'A. $(2; 6]$',
            'B. $(-\\infty; 6]$',
            'C. $[2; 6]$',
            'D. $(2; +\\infty)$'
          ],
          a: 'A',
          explanation: 'Điều kiện xác định: $2x - 4 > 0 \\Leftrightarrow x > 2$.\\nTa có: $\\log_2(2x - 4) \\le 3 \\Leftrightarrow 2x - 4 \\le 2^3 = 8 \\Leftrightarrow 2x \\le 12 \\Leftrightarrow x \\le 6$.\\nKết hợp điều kiện suy ra tập nghiệm là $S = (2; 6]$.',
          imageUrl: '',
          type: 'Trắc nghiệm khách quan'
        },
        {
          id: 3,
          q: 'Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$. Tâm và bán kính của mặt cầu $(S)$ lần lượt là:',
          options: [
            'A. $I(-1; 2; -3), R = 16$',
            'B. $I(1; -2; 3), R = 4$',
            'C. $I(1; -2; 3), R = 16$',
            'D. $I(-1; 2; -3), R = 4$'
          ],
          a: 'B',
          explanation: 'Mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a; b; c)$ và bán kính $R = \\sqrt{R^2}$.\\nDo đó tâm $I(1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.',
          imageUrl: '',
          type: 'Trắc nghiệm khách quan'
        }
      ];
      return this.questions;
    },

    // 6. Hiển thị Modal Sư phạm Hướng dẫn giải chi tiết khi học sinh làm sai
    showPedagogyModal(explanation, onRetry) {
      let modal = document.getElementById('imath-pedagogy-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imath-pedagogy-modal';
        modal.className = 'imath-pedagogy-modal imath-hidden';
        modal.innerHTML = `
          <div class="imath-pedagogy-card">
            <div class="imath-pedagogy-header">
              <span style="font-size: 26px;">💡</span>
              <h3 class="imath-pedagogy-title">Chưa chính xác rồi! Hãy xem gợi ý:</h3>
            </div>
            <div class="imath-pedagogy-body" id="imath-pedagogy-content"></div>
            <div style="text-align: right;">
              <button type="button" class="imath-pedagogy-btn" id="imath-pedagogy-close-btn">
                <span>🤔</span> Suy nghĩ & Chọn lại
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const contentEl = modal.querySelector('#imath-pedagogy-content');
      contentEl.innerHTML = this.cleanMathString(explanation || 'Hãy đọc kỹ lại đề bài và xem lại các công thức liên quan nhé!');
      this.renderMath(contentEl);

      const closeBtn = modal.querySelector('#imath-pedagogy-close-btn');
      closeBtn.onclick = () => {
        modal.classList.add('imath-hidden');
        if (typeof onRetry === 'function') onRetry();
      };

      modal.classList.remove('imath-hidden');
    }
  };

  // =========================================================================
  // 7. KHO 24 TRÒ CHƠI GIÁO DỤC TƯƠNG TÁC (TÍCH HỢP TRỰC TIẾP TRÊN THANH HEADER)
  // =========================================================================
  const GAMES_2_CATALOG = [
    // 1. Camera AI & Cử chỉ (4 trò)
    {
      id: 'star-bag',
      title: 'Cuộc Đua Ngôi Sao',
      icon: '⭐',
      cat: 'ai',
      catLabel: 'Camera AI',
      gradient: 'linear-gradient(135deg, #0d9488, #10b981)',
      desc: 'Giơ 1-4 ngón tay tương ứng A-B-C-D qua Camera để thu thập sao.',
      route: '/star-bag-game'
    },
    {
      id: 'head-tilt',
      title: 'Quiz Nghiêng Đầu',
      icon: '🧘',
      cat: 'ai',
      catLabel: 'FaceMesh AI',
      gradient: 'linear-gradient(135deg, #9333ea, #db2777)',
      desc: 'Nghiêng đầu sang trái/phải để chọn đáp án A/B qua webcam.',
      route: '/head-tilt-quiz'
    },
    {
      id: 'hand-slash',
      title: 'Chém Hoa Quả & Bắt Bóng',
      icon: '🍉',
      cat: 'ai',
      catLabel: 'Cử chỉ tay AI',
      gradient: 'linear-gradient(135deg, #ea580c, #f59e0b)',
      desc: 'Vung tay chém hoa quả bay hoặc chọc bóng nổ mang đáp án đúng.',
      route: '/hand-slash-quiz'
    },
    {
      id: 'pose-quiz',
      title: 'Thể Dục ABC (Pose AI)',
      icon: '🤸',
      cat: 'ai',
      catLabel: 'Pose AI',
      gradient: 'linear-gradient(135deg, #059669, #14b8a6)',
      desc: 'Học sinh thực hiện động tác thể dục trả lời trắc nghiệm qua camera.',
      route: '/pose-quiz'
    },

    // 2. Đối kháng & Đấu đội (4 trò)
    {
      id: 'tug-of-war',
      title: 'Kéo Co Kiến Thức',
      icon: '🪢',
      cat: 'versus',
      catLabel: 'Đối kháng 2 Đội',
      gradient: 'linear-gradient(135deg, #2563eb, #dc2626)',
      desc: 'Hai đội Đỏ - Xanh thi đấu trả lời câu hỏi kéo dây thừng sôi động.',
      route: '/tug-of-war-game'
    },
    {
      id: 'day-gay',
      title: 'Đẩy Gậy Quyết Chiến',
      icon: '🥊',
      cat: 'versus',
      catLabel: 'Đấu trường 1v1',
      gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
      desc: 'Đấu trường đẩy gậy tre dân gian thi đấu đối kháng trực tiếp 2 đội.',
      url: '/games/day_gay/index.html'
    },
    {
      id: 'versus-game',
      title: 'Game Đối Kháng (1v1 Live)',
      icon: '⚔️',
      cat: 'versus',
      catLabel: '1v1 Trực tiếp',
      gradient: 'linear-gradient(135deg, #b91c1c, #991b1b)',
      desc: 'Học sinh thi đấu 1v1 trên thiết bị riêng đẩy lùi đối thủ về phía sau.',
      route: '/versus-game'
    },
    {
      id: 'turn-based',
      title: 'Game Theo Lượt (Cờ Bàn)',
      icon: '🎲',
      cat: 'versus',
      catLabel: 'Nhóm 2-4 bạn',
      gradient: 'linear-gradient(135deg, #0f766e, #047857)',
      desc: 'Tung xúc xắc, di chuyển nhân vật, vượt chướng ngại vật bằng câu hỏi.',
      route: '/turn-based-game'
    },

    // 3. Trắc nghiệm & Trí tuệ (9 trò)
    {
      id: 'zombie-defense',
      title: 'Chặn Zombie (Zombie Defense)',
      icon: '🧟',
      cat: 'quiz',
      catLabel: 'Thủ thành',
      gradient: 'linear-gradient(135deg, #16a34a, #047857)',
      desc: 'Bắn hạ zombie mang đáp án đúng trước khi tràn qua hàng rào chiến lũy.',
      route: '/zombie-defense'
    },
    {
      id: 'minesweeper',
      title: 'Dò Mìn (Minesweeper Quiz)',
      icon: '💣',
      cat: 'quiz',
      catLabel: 'Vượt bãi mìn',
      gradient: 'linear-gradient(135deg, #d97706, #78350f)',
      desc: 'Chọn ô đáp án đúng để vượt qua bãi mìn với 3 mạng sống.',
      route: '/minesweeper'
    },
    {
      id: 'flip-puzzle',
      title: 'Trò Chơi Lật Mảnh Ghép',
      icon: '🖼️',
      cat: 'quiz',
      catLabel: 'Giải mã ảnh',
      gradient: 'linear-gradient(135deg, #e11d48, #db2777)',
      desc: 'Trả lời đúng câu hỏi để lật mở từng mảnh ghép giải mã ảnh ẩn.',
      route: '/flip-puzzle-game'
    },
    {
      id: 'knowledge-train',
      title: 'Đoàn Tàu Tri Thức',
      icon: '🚂',
      cat: 'quiz',
      catLabel: 'Kéo thả toa',
      gradient: 'linear-gradient(135deg, #0284c7, #2563eb)',
      desc: 'Kéo thả xếp các toa thành đoàn tàu đúng thứ tự câu hỏi và đáp án.',
      route: '/knowledge-train-game'
    },
    {
      id: 'crossword',
      title: 'Ô Chữ Khóa Bí Mật',
      icon: '🔤',
      cat: 'quiz',
      catLabel: 'Tư duy từ vựng',
      gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
      desc: 'Tạo ô chữ hoặc ma trận chữ cái tìm từ khóa bí mật chủ đề bài học.',
      route: '/crossword-puzzle'
    },
    {
      id: 'flashcard',
      title: 'Thẻ Lật Học Nhóm (Flashcard)',
      icon: '🃏',
      cat: 'quiz',
      catLabel: 'Ghi nhớ',
      gradient: 'linear-gradient(135deg, #2563eb, #38bdf8)',
      desc: 'Thẻ ghi nhớ âm thanh hình ảnh 2 mặt, tự đánh giá mức độ nhớ bài.',
      route: '/flashcard'
    },
    {
      id: 'mind-map',
      title: 'Sơ Đồ Tư Duy Tương Tác',
      icon: '🧠',
      cat: 'quiz',
      catLabel: 'Mind Map',
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      desc: 'Học sinh cùng tham gia kéo ghép xây dựng sơ đồ tư duy hoàn chỉnh.',
      route: '/mind-map'
    },
    {
      id: 'paced-quiz',
      title: 'Trắc Nghiệm Theo Nhịp Độ',
      icon: '⏱️',
      cat: 'quiz',
      catLabel: 'Màn chiếu lớp',
      gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
      desc: 'Giáo viên điều khiển nhịp độ câu hỏi trực tiếp trên màn chiếu lớp học.',
      route: '/paced-quiz'
    },
    {
      id: 'quiz-game',
      title: 'Kéo Thả - Nối Ý Tri Thức',
      icon: '🎯',
      cat: 'quiz',
      catLabel: 'Nối mệnh đề',
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
      desc: 'Kéo ghép nối mệnh đề, công thức, đồ thị tương ứng sinh động.',
      route: '/quiz-game'
    },

    // 4. Tiện ích sư phạm & Lớp học (5 trò)
    {
      id: 'goi-ten',
      title: 'Bộ Game Gọi Tên (7 trò)',
      icon: '🎡',
      cat: 'tools',
      catLabel: 'Vòng quay & Đua',
      gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)',
      desc: 'Vòng quay, Đua vịt, Đua bi, Bắt vịt 3D, Gọi tên ảnh, Ghép cặp.',
      route: '/goi-ten'
    },
    {
      id: 'class-timer',
      title: 'Đồng Hồ Đếm Ngược Lớp Học',
      icon: '⏳',
      cat: 'tools',
      catLabel: 'Đồng hồ lớp',
      gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
      desc: '10 kiểu đồng hồ vui nhộn: bom nổ, đồng hồ cát, tên lửa, đường đua.',
      route: '/class-timer'
    },
    {
      id: 'noise-tracker',
      title: 'Rồng Ngủ Quản Lý Lớp',
      icon: '🐉',
      cat: 'tools',
      catLabel: 'Đo tiếng ồn',
      gradient: 'linear-gradient(135deg, #312e81, #581c87)',
      desc: 'Rồng ngủ say khi lớp yên tĩnh và thức giấc phun lửa khi ồn ào.',
      route: '/noise-tracker'
    },
    {
      id: 'paper-mode',
      title: 'Chế Độ Giấy (Quét Mã QR)',
      icon: '📄',
      cat: 'tools',
      catLabel: 'Quét Camera',
      gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
      desc: 'Quét thẻ A/B/C/D bằng camera chấm bài cả lớp trong vài giây.',
      route: '/paper-mode'
    },
    {
      id: 'interactive-image',
      title: 'Ảnh Tương Tác Sư Phạm',
      icon: '🖼️',
      cat: 'tools',
      catLabel: 'Điểm chạm Hotspot',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      desc: 'Gắn các điểm chạm kiến thức, audio, câu hỏi trên hình học & biểu đồ.',
      route: '/interactive-image'
    },

    // 5. Hành động & Khám phá tương tác (4 trò)
    {
      id: 'flying-words',
      title: 'Từ Ngữ Biết Bay',
      icon: '🕊️',
      cat: 'action',
      catLabel: 'Vui nhộn phản xạ',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      desc: 'Bắt các từ đang bay lượn để sắp xếp thành câu hoặc công thức chuẩn.',
      route: '/flying-words-game'
    },
    {
      id: 'panorama-museum',
      title: 'Phòng Tranh 3D & Ảnh 360°',
      icon: '🏛️',
      cat: 'action',
      catLabel: 'Bảo tàng ảo 3D',
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      desc: 'Bảo tàng ảo 3D đi lại tự do hoặc tham quan ảnh 360° tương tác.',
      route: '/panorama-museum'
    },
    {
      id: 'interactive-video',
      title: 'Video Tương Tác',
      icon: '🎥',
      cat: 'action',
      catLabel: 'Video Quiz',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      desc: 'Tự động dừng bài giảng video để hiện câu hỏi kiểm tra kiến thức.',
      route: '/interactive-video'
    },
    {
      id: 'journey',
      title: 'Hành Trình Học Tập',
      icon: '🗺️',
      cat: 'action',
      catLabel: 'Bản đồ thử thách',
      gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
      desc: 'Bản đồ lộ trình học tập với các chặng thử thách kiến thức kỳ thú.',
      route: '/journey'
    }
  ];

  let currentCategory = 'all';
  let currentSearch = '';

  function navigateToGame(game) {
    closeGames2Picker();
    if (!game) return;

    // Cập nhật tiêu đề trên thanh điều hướng khung của SmartEdu Play
    try {
      if (window.parent && window.parent.document) {
        var parentTitle = window.parent.document.getElementById('gvdm-player-title');
        if (parentTitle) parentTitle.textContent = '🎮 ' + game.title + ' (SmartEdu Play)';
      }
    } catch (e) {}

    if (game.url) {
      window.location.href = game.url;
      return;
    }

    if (game.route) {
      // 1. Thử chuyển route mượt mà qua React Router
      if (typeof window.__gvdmNavigate === 'function') {
        try {
          window.__gvdmNavigate(game.route);
          // Kiểm tra xem trang có đổi route không, nếu không thì nạp lại URL chắc chắn 100%
          setTimeout(function() {
            if (!window.location.pathname.includes(game.route)) {
              window.location.href = '/games_2/runner.html?game=' + encodeURIComponent(game.route);
            }
          }, 150);
          return;
        } catch (err) {
          console.warn('__gvdmNavigate error:', err);
        }
      }

      // 2. Chuyển hướng chắc chắn 100% qua runner.html
      window.location.href = '/games_2/runner.html?game=' + encodeURIComponent(game.route);
    }
  }

  function renderPickerCards() {
    const grid = document.getElementById('gvdm-picker-grid-container');
    if (!grid) return;

    const filtered = GAMES_2_CATALOG.filter(game => {
      const matchCat = (currentCategory === 'all' || game.cat === currentCategory);
      const matchSearch = !currentSearch ||
        game.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        game.desc.toLowerCase().includes(currentSearch.toLowerCase()) ||
        game.catLabel.toLowerCase().includes(currentSearch.toLowerCase());
      return matchCat && matchSearch;
    });

    const countEl = document.getElementById('gvdm-visible-count');
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
          <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
          <p style="margin: 0; font-size: 14px; font-weight: 700;">Không tìm thấy trò chơi nào phù hợp</p>
          <span style="font-size: 12px; color: #64748b;">Hãy thử tìm từ khóa khác hoặc chuyển danh mục</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(game => {
      const gameUrl = game.url || (game.route ? ('/games_2/runner.html?game=' + encodeURIComponent(game.route)) : '#');
      return `
      <a href="${gameUrl}" target="_blank" rel="noopener noreferrer" class="gvdm-picker-card" data-id="${game.id}" onclick="window.__selectGvdmGame(event, '${game.id}')" title="Nhấn để mở ${game.title} (Chuột phải để mở trong tab mới)" style="text-decoration:none;color:inherit;">
        <div class="gvdm-picker-card-icon" style="background: ${game.gradient};">
          ${game.icon}
        </div>
        <div class="gvdm-picker-card-info">
          <div class="gvdm-picker-card-title-row">
            <h4 class="gvdm-picker-card-title" title="${game.title}">${game.title}</h4>
            <span class="gvdm-picker-card-badge">${game.catLabel}</span>
          </div>
          <p class="gvdm-picker-card-desc" title="${game.desc}">${game.desc}</p>
          <div class="gvdm-picker-card-btn-row">
            <span class="gvdm-picker-card-source">⭐ SmartEdu</span>
            <span class="gvdm-picker-card-btn">Chơi ngay ➔</span>
          </div>
        </div>
      </a>
    `;
    }).join('');
  }

  window.__selectGvdmGame = function(event, gameId) {
    if (typeof event === 'string') {
      gameId = event;
      event = null;
    }
    const game = GAMES_2_CATALOG.find(g => g.id === gameId);
    if (!game) return;

    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1)) {
      return;
    }

    if (event) event.preventDefault();
    navigateToGame(game);
  };

  // Hàm cuộn danh sách mượt mà (Nút cuộn lên / xuống)
  window.__scrollGvdmGrid = function(direction) {
    const grid = document.getElementById('gvdm-picker-grid-container');
    if (!grid) return;
    const scrollStep = direction * 240;
    grid.scrollBy({ top: scrollStep, behavior: 'smooth' });
  };

  function openGames2Picker() {
    let overlay = document.getElementById('gvdm-games-picker-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'gvdm-games-picker-overlay';
      overlay.className = 'gvdm-games-picker-overlay';
      overlay.innerHTML = `
        <div class="gvdm-games-picker-modal" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="gvdm-picker-header">
            <div class="gvdm-picker-title-box">
              <span style="font-size: 32px;">🎮</span>
              <div>
                <h2>Kho 24 Trò Chơi Giáo Dục Tương Tác</h2>
                <p>Khởi động, đối kháng, đấu đội, camera AI & ôn tập kiến thức</p>
              </div>
            </div>
            <div class="gvdm-picker-search">
              <input type="text" id="gvdm-picker-search-input" placeholder="Tìm theo tên, cử chỉ, camera AI, đối kháng..." />
            </div>
            <button type="button" class="gvdm-picker-close-btn" onclick="window.closeGames2Picker()" title="Đóng bảng trò chơi">✕</button>
          </div>

          <!-- Thanh điều hướng danh mục & Nút cuộn tiện ích -->
          <div class="gvdm-picker-subbar">
            <div class="gvdm-picker-filters" id="gvdm-picker-filter-tabs">
              <button class="gvdm-picker-filter-btn active" data-cat="all">✨ Tất cả (24)</button>
              <button class="gvdm-picker-filter-btn" data-cat="ai">📷 Camera AI (4)</button>
              <button class="gvdm-picker-filter-btn" data-cat="versus">⚔️ Đối kháng & Đấu đội (4)</button>
              <button class="gvdm-picker-filter-btn" data-cat="quiz">🔤 Trắc nghiệm & Trí tuệ (9)</button>
              <button class="gvdm-picker-filter-btn" data-cat="tools">🛠️ Tiện ích sư phạm (5)</button>
              <button class="gvdm-picker-filter-btn" data-cat="action">⚡ Hành động & Khám phá (4)</button>
            </div>
            <div class="gvdm-picker-scroll-controls">
              <span class="gvdm-scroll-hint">↕ Cuộn xem:</span>
              <button type="button" class="gvdm-scroll-btn" onclick="window.__scrollGvdmGrid(-1)" title="Cuộn danh sách lên">▲ Cuộn lên</button>
              <button type="button" class="gvdm-scroll-btn active" onclick="window.__scrollGvdmGrid(1)" title="Cuộn danh sách xuống">▼ Cuộn xuống</button>
            </div>
          </div>

          <!-- Lưới 4x6 Chuẩn - Không bị đè chữ -->
          <div class="gvdm-picker-grid" id="gvdm-picker-grid-container"></div>

          <!-- Chân trang Modal: Hiển thị đếm số lượng & Nút cuộn -->
          <div class="gvdm-picker-footer">
            <div class="gvdm-picker-footer-info">
              <span>🎮 Đang hiển thị: <b id="gvdm-visible-count">24</b>/24 trò chơi (Lưới 4x6) · Nhấn vào trò chơi để bắt đầu</span>
            </div>
            <div class="gvdm-picker-footer-actions">
              <button type="button" class="gvdm-scroll-btn" onclick="window.__scrollGvdmGrid(-1)" title="Cuộn danh sách lên">▲ Cuộn lên</button>
              <button type="button" class="gvdm-scroll-btn active" onclick="window.__scrollGvdmGrid(1)" title="Cuộn danh sách xuống">▼ Cuộn xuống</button>
              <button type="button" class="gvdm-picker-footer-close" onclick="window.closeGames2Picker()">✕ Đóng</button>
            </div>
          </div>
        </div>
      `;

      overlay.onclick = () => closeGames2Picker();
      document.body.appendChild(overlay);

      // Search event
      const searchInput = overlay.querySelector('#gvdm-picker-search-input');
      searchInput.oninput = (e) => {
        currentSearch = e.target.value.trim();
        renderPickerCards();
      };

      // Filter events
      const filterBtns = overlay.querySelectorAll('.gvdm-picker-filter-btn');
      filterBtns.forEach(btn => {
        btn.onclick = () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.dataset.cat;
          renderPickerCards();
        };
      });

      // ESC to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGames2Picker();
      });
    }

    currentCategory = 'all';
    currentSearch = '';
    const searchInput = overlay.querySelector('#gvdm-picker-search-input');
    if (searchInput) searchInput.value = '';
    const filterBtns = overlay.querySelectorAll('.gvdm-picker-filter-btn');
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));

    renderPickerCards();
    overlay.style.display = 'flex';
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 100);
  }

  function closeGames2Picker() {
    const overlay = document.getElementById('gvdm-games-picker-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  window.openGames2Picker = openGames2Picker;
  window.closeGames2Picker = closeGames2Picker;
  window.toggleGames2Dropdown = function() {
    const overlay = document.getElementById('gvdm-games-picker-overlay');
    if (overlay && overlay.style.display === 'flex') {
      closeGames2Picker();
    } else {
      openGames2Picker();
    }
  };

  // =========================================================================
  // CƠ CHẾ QUAY LẠI MÀN HÌNH CHÍNH MHEDU KHI CLICK LOGO MHEDU HOẶC NÚT TRANG CHỦ
  // =========================================================================
  function returnToMainScreen() {
    if (window.parent && window.parent !== window) {
      try {
        if (typeof window.parent.closeAllPortals === 'function') {
          window.parent.closeAllPortals();
          return;
        }
      } catch (e) {}
      window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
    } else {
      window.location.href = '/';
    }
  }
  window.returnToMainScreen = returnToMainScreen;

  // Lắng nghe sự kiện click trên logo MHEdu (cả khi click chữ logo hoặc biểu tượng)
  document.addEventListener('click', function(e) {
    const logo = e.target.closest('.header-logo, .logo-text, .header-title, [data-mhedu-logo]');
    if (logo) {
      e.preventDefault();
      e.stopPropagation();
      returnToMainScreen();
    }
  }, true);

  // Observer tự động chèn nút 🎮 Trò chơi vào thanh điều hướng Header nếu chưa có
  function injectGames2NavButton() {
    // 1. Hook logo MHEdu để có tooltip rõ ràng
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo && !headerLogo.hasAttribute('data-mhedu-hooked')) {
      headerLogo.setAttribute('data-mhedu-hooked', 'true');
      headerLogo.setAttribute('title', '🏠 Nhấn vào MHEdu để quay về Màn hình chính');
      headerLogo.style.cursor = 'pointer';
      headerLogo.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        returnToMainScreen();
      };
    }

    const headerNav = document.querySelector('.header-slogan-section') || document.querySelector('.nav-actions');
    if (!headerNav) return;

    // 2. Chèn nút 🎮 Trò chơi (24)
    if (headerNav.querySelector('#gvdm-nav-games2-btn') || headerNav.querySelector('.games2-nav-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'gvdm-nav-games2-btn';
    btn.className = 'home-nav-btn games2-nav-btn gvdm-nav-games2-btn';
    btn.title = 'Kho 24 Trò chơi Giáo dục tương tác';
    btn.innerHTML = `
      <span class="home-nav-icon">🎮</span>
      <span>Trò chơi</span>
      <span class="gvdm-nav-badge-24">24</span>
    `;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGames2Picker();
    };

    // Chèn ngay sau nút Trang chủ (phần tử đầu tiên)
    if (headerNav.children.length > 1) {
      headerNav.insertBefore(btn, headerNav.children[1]);
    } else {
      headerNav.appendChild(btn);
    }
  }

  // Chạy inject định kỳ và theo MutationObserver
  setInterval(injectGames2NavButton, 400);
  document.addEventListener('DOMContentLoaded', injectGames2NavButton);

  // Xuất ra cửa sổ window
  
  // Tự động thu gọn các mục menu phụ trên thanh Header vào dropdown "Thêm..."
  function applyHeaderCompactMode() {
    const headerNav = document.querySelector('.header-slogan-section');
    if (!headerNav) return;
    
    // Nếu đã tạo nút "Thêm..." rồi thì bỏ qua
    if (headerNav.querySelector('#gvdm-header-more-btn')) return;
    
    const children = Array.from(headerNav.children);
    // Giữ lại 5 mục chính: [0] Trang chủ, [1] Trò chơi (24), [2] Bộ công cụ AI, [3] Tiện ích GD, [4] Mô phỏng bài dạy
    if (children.length <= 5) return;
    
    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.id = 'gvdm-header-more-btn';
    moreBtn.className = 'header-more-btn';
    moreBtn.innerHTML = '<span>✨ Thêm...</span> <span>▾</span>';
    
    const dropdown = document.createElement('div');
    dropdown.id = 'gvdm-header-more-dropdown';
    dropdown.className = 'header-more-dropdown';
    
    // Di chuyển các mục phụ từ vị trí thứ 5 trở đi vào dropdown
    for (let i = 5; i < children.length; i++) {
      dropdown.appendChild(children[i]);
    }
    
    moreBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('show');
    };
    
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target) && e.target !== moreBtn) {
        dropdown.classList.remove('show');
      }
    });
    
    headerNav.appendChild(moreBtn);
    headerNav.appendChild(dropdown);
  }
  
  setInterval(applyHeaderCompactMode, 500);
  document.addEventListener('DOMContentLoaded', applyHeaderCompactMode);


  window.iMathCore = iMathCore;
})();
