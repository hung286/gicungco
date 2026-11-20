/**
 * GVDM Offline Bridge & Local Data Provider
 * Tự động đồng bộ ngân hàng câu hỏi SmartEdu Play và cung cấp LocalStorage Mock cho Firebase Firestore
 * Đảm bảo 26 trò chơi GVDM chạy mượt mà 100% offline, không giật lag, không nhấp nháy, không bị treo spinner.
 * Tác giả: NMH Thầy Nguyễn Mạnh Hùng
 */

(function () {
  try {
    let authUser = null;
    try { authUser = JSON.parse(localStorage.getItem('smartedu_auth_user') || 'null'); } catch (e) {}
    if (!authUser || !authUser.email) {
      try { authUser = JSON.parse(localStorage.getItem('ey_v2_auth_session') || 'null'); } catch (e) {}
    }
    if (authUser && authUser.email) {
      const userEmail = String(authUser.email).toLowerCase().trim();
      const userName = authUser.name || authUser.displayName || 'Giáo viên';
      const isAdmin = userEmail === 'nmh28691@gmail.com';
      const mockUser = {
        uid: isAdmin ? 'admin_nmh28691' : ('teacher_' + userEmail.replace(/[^a-z0-9]/g, '_')),
        email: userEmail,
        displayName: userName,
        role: isAdmin ? 'admin' : (authUser.role || 'teacher'),
        photoURL: authUser.photoURL || '/images/unnamed.png',
        emailVerified: true
      };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    } else {
      const mockGuest = {
        uid: 'guest_user',
        email: '',
        displayName: 'Khách',
        role: 'guest',
        photoURL: '/images/unnamed.png',
        emailVerified: false
      };
      localStorage.setItem('currentUser', JSON.stringify(mockGuest));
    }
    sessionStorage.removeItem('isGoogleRedirecting');

    // Khôi phục API Key từ Đám mây theo email của giáo viên đang đăng nhập
    try {
      const keyMap = JSON.parse(localStorage.getItem('smartedu_cloud_api_keys_by_email') || '{}');
      if (keyMap[userEmail] && keyMap[userEmail].apiKey) {
        const k = keyMap[userEmail].apiKey;
        const pool = keyMap[userEmail].apiKeyPool || k;
        ['gemini_api_key', 'smartedu_gemini_key', 'smartedu_gemini_api_key', 'math_visualizer_api_key', 'ocr_typst_key_gemini'].forEach(n => {
          localStorage.setItem(n, k);
        });
        ['gemini_api_keys', 'ocr_typst_key_gemini_pool'].forEach(n => {
          localStorage.setItem(n, pool);
        });
      }
    } catch (e) {}
  } catch (e) {}

  'use strict';

  // 1. Lấy danh sách câu hỏi từ SmartEdu Play (ưu tiên sessionStorage, sau đó localStorage)
  function getSmartEduQuestions() {
    try {
      const raw = sessionStorage.getItem('smartedu_imath_questions') || localStorage.getItem('smartedu_imath_questions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(item => {
            const t = (item.type || item.question_type || '').toLowerCase();
            return t !== 'tf' && t !== 'short' && t !== 'essay' && item.part !== 2 && item.part !== 3;
          });
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc smartedu_imath_questions:', e);
    }

    // Bộ câu hỏi Toán THPT dự phòng chuẩn KaTeX
    return [
      {
        q: 'Tính tích phân $I = \\int_{0}^{1} (2x + 1) \\, dx$.',
        a: '$I = 2$',
        b: '$I = 1$',
        c: '$I = 3$',
        d: '$I = 4$',
        correct: 'A',
        explanation: 'Ta có $I = [x^2 + x]_{0}^{1} = (1 + 1) - 0 = 2$.'
      },
      {
        q: 'Cho hàm số $y = x^3 - 3x + 2$. Điểm cực đại của đồ thị hàm số là:',
        a: '$(-1; 4)$',
        b: '$(1; 0)$',
        c: '$(0; 2)$',
        d: '$(2; 4)$',
        correct: 'A',
        explanation: '$y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = -1$, $y\'\'(-1) = -6 < 0$ nên cực đại tại $(-1; 4)$.'
      },
      {
        q: 'Tìm tập nghiệm của phương trình $\\log_2(x - 1) = 3$.',
        a: '$S = \\{9\\}$',
        b: '$S = \\{7\\}$',
        c: '$S = \\{8\\}$',
        d: '$S = \\{10\\}$',
        correct: 'A',
        explanation: 'Điều kiện $x > 1$. Phương trình tương đương $x - 1 = 2^3 = 8 \\Rightarrow x = 9$.'
      },
      {
        q: 'Trong không gian $Oxyz$, mặt phẳng $(P): 2x - y + 3z - 5 = 0$ có một vectơ pháp tuyến là:',
        a: '$\\vec{n} = (2; -1; 3)$',
        b: '$\\vec{n} = (2; 1; 3)$',
        c: '$\\vec{n} = (-2; -1; 3)$',
        d: '$\\vec{n} = (2; -1; -5)$',
        correct: 'A',
        explanation: 'Từ phương trình tổng quát, hệ số của $x, y, z$ cho vectơ pháp tuyến $\\vec{n} = (2; -1; 3)$.'
      },
      {
        q: 'Môđun của số phức $z = 3 - 4i$ bằng:',
        a: '$5$',
        b: '$7$',
        c: '$\\sqrt{7}$',
        d: '$25$',
        correct: 'A',
        explanation: '$|z| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = 5$.'
      },
      {
        q: 'Tiệm cận ngang của đồ thị hàm số $y = \\frac{2x + 1}{x - 3}$ là đường thẳng:',
        a: '$y = 2$',
        b: '$x = 3$',
        c: '$y = -\\frac{1}{3}$',
        d: '$x = 2$',
        correct: 'A',
        explanation: '$\\lim_{x \\to \\pm\\infty} \\frac{2x + 1}{x - 3} = 2 \\Rightarrow$ Tiệm cận ngang $y = 2$.'
      },
      {
        q: 'Số cách chọn 3 học sinh từ một nhóm gồm 10 học sinh là:',
        a: '$C_{10}^{3} = 120$',
        b: '$A_{10}^{3} = 720$',
        c: '$10^3 = 1000$',
        d: '$30$',
        correct: 'A',
        explanation: 'Chọn không phân biệt thứ tự là tổ hợp chập 3 của 10 phần tử: $C_{10}^3 = 120$.'
      },
      {
        q: 'Cho hình chóp $S.ABC$ có đáy là tam giác vuông tại $B$, $AB = a, BC = 2a$. Chiều cao $SA = 3a$. Thể tích khối chóp là:',
        a: '$V = a^3$',
        b: '$V = 2a^3$',
        c: '$V = 3a^3$',
        d: '$V = \\frac{1}{3}a^3$',
        correct: 'A',
        explanation: '$S_{ABC} = \\frac{1}{2} a \\cdot 2a = a^2$. Thể tích $V = \\frac{1}{3} S_{ABC} \\cdot SA = \\frac{1}{3} a^2 \\cdot 3a = a^3$.'
      },
      {
        q: 'Nghiệm của phương trình $2^{2x-1} = 8$ là:',
        a: '$x = 2$',
        b: '$x = 1$',
        c: '$x = 3$',
        d: '$x = \\frac{3}{2}$',
        correct: 'A',
        explanation: '$2^{2x-1} = 2^3 \\Leftrightarrow 2x - 1 = 3 \\Leftrightarrow 2x = 4 \\Leftrightarrow x = 2$.'
      }
    ];
  }

  // 2. Chuyển đổi định dạng câu hỏi cho từng loại game GVDM
  function formatStandardQuestions(rawQs) {
    if (!Array.isArray(rawQs)) return [];
    return rawQs.map((item, idx) => {
      const qText = item.questionText || item.q || item.question || item.content || item.stem || ('Câu hỏi ' + (idx + 1));
      let options = [];
      if (Array.isArray(item.options) && item.options.length >= 2) {
        options = item.options.map(opt => typeof opt === 'string' ? opt : (opt.text || opt.content || ''));
      } else if (Array.isArray(item.answers) && item.answers.length >= 2) {
        options = item.answers.map(a => typeof a === 'string' ? a : (a.text || a.content || ''));
      } else {
        options = [item.a || 'Đáp án A', item.b || 'Đáp án B', item.c || 'Đáp án C', item.d || 'Đáp án D'].filter(Boolean);
      }

      let correctIdx = 0;
      if (typeof item.correctIndex === 'number') correctIdx = item.correctIndex;
      else if (Array.isArray(item.correctAnswerIndices) && item.correctAnswerIndices.length > 0) correctIdx = item.correctAnswerIndices[0];
      else if (Array.isArray(item.answers)) {
        const found = item.answers.findIndex(a => a && a.isCorrect);
        if (found !== -1) correctIdx = found;
      } else if (typeof item.correct === 'string') {
        const char = item.correct.trim().toUpperCase();
        if (char === 'A') correctIdx = 0;
        else if (char === 'B') correctIdx = 1;
        else if (char === 'C') correctIdx = 2;
        else if (char === 'D') correctIdx = 3;
        else {
          const num = parseInt(char, 10);
          if (!isNaN(num)) correctIdx = num;
        }
      }

      const answers = options.map((opt, oIdx) => ({
        id: 'ans_' + oIdx + '_' + (idx + 1),
        text: opt,
        content: opt,
        isCorrect: oIdx === correctIdx,
        image: ''
      }));

      return {
        id: item.id || ('q_' + (idx + 1) + '_' + Date.now()),
        questionText: qText,
        question: qText,
        q: qText,
        stem: qText,
        content: qText,
        options: options,
        answers: answers,
        answerA: options[0] || '',
        answerB: options[1] || '',
        answerC: options[2] || '',
        answerD: options[3] || '',
        answerAText: options[0] || '',
        answerBText: options[1] || '',
        answerCText: options[2] || '',
        answerDText: options[3] || '',
        imageA: (item.imageA || (answers[0] && answers[0].image) || ''),
        imageB: (item.imageB || (answers[1] && answers[1].image) || ''),
        imageC: (item.imageC || (answers[2] && answers[2].image) || ''),
        imageD: (item.imageD || (answers[3] && answers[3].image) || ''),
        correct: correctIdx,
        correctIndex: correctIdx,
        correctAnswer: ['A', 'B', 'C', 'D'][correctIdx] || 'A',
        correctAnswerIndices: [correctIdx],
        explanation: item.explanation || item.explain || '',
        imageUrl: item.imageUrl || item.image || '',
        timeLimit: item.timeLimit || 30
      };
    });
  }

  function normalizeGameQuestions(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      if (!item) return item;
      if (Array.isArray(item.questions)) {
        item.questions = formatStandardQuestions(item.questions);
      }
      return item;
    });
  }

  // 3. Khởi tạo kho dữ liệu mẫu mặc định cho từng game
  
  function formatKnowledgeTrainQuestions(rawQs, authorName) {
    if (Array.isArray(rawQs) && rawQs.length >= 3) {
      const list = rawQs.slice(0, 6).map((item, idx) => {
        const qText = item.questionText || item.q || item.question || item.content || item.stem || ('Câu hỏi ' + (idx + 1));
        let ansText = '';
        if (Array.isArray(item.answers) && item.answers.length > 0) {
          const correct = item.answers.find(a => a && (a.isCorrect || a.correct)) || item.answers[0];
          ansText = (correct.text || correct.content || '').trim();
        } else if (Array.isArray(item.options) && item.options.length > 0) {
          let optIdx = 0;
          if (typeof item.correctIndex === 'number' && item.correctIndex >= 0 && item.correctIndex < item.options.length) {
            optIdx = item.correctIndex;
          } else if (typeof item.correctAnswer === 'string') {
            const c = item.correctAnswer.trim().toUpperCase();
            if (['A','B','C','D'].includes(c)) optIdx = c.charCodeAt(0) - 65;
          }
          const opt = item.options[optIdx] || item.options[0];
          ansText = typeof opt === 'string' ? opt : (opt.text || opt.content || '');
        } else if (item.correctAnswer && typeof item.correctAnswer === 'string' && item.correctAnswer.length > 1) {
          ansText = item.correctAnswer.trim();
        } else if (item.a && typeof item.a === 'string' && item.a.length > 1) {
          ansText = item.a.trim();
        }
        ansText = ansText.replace(/^[A-Da-d][\.\)\:\s]\s*/, '').trim();
        if (!ansText || ['A','B','C','D'].includes(ansText.toUpperCase())) {
          ansText = 'Đáp án ' + (idx + 1);
        }

        return {
          id: 'train_q_' + (idx + 1),
          questionText: qText,
          correctAnswer: ansText,
          answers: [{ text: ansText, isCorrect: true }]
        };
      });
      if (list.length >= 3) return list;
    }

    return [
      {
        id: 'train_q_1',
        questionText: 'Tiệm cận ngang của đồ thị hàm số $y = \\frac{2x + 1}{x - 3}$ là đường thẳng:',
        correctAnswer: '$y = 2$',
        answers: [{ text: '$y = 2$', isCorrect: true }]
      },
      {
        id: 'train_q_2',
        questionText: 'Tìm tập nghiệm của phương trình $\\log_2(x - 1) = 3$:',
        correctAnswer: '$x = 9$',
        answers: [{ text: '$x = 9$', isCorrect: true }]
      },
      {
        id: 'train_q_3',
        questionText: 'Số cách chọn 3 học sinh từ một nhóm gồm 10 học sinh là:',
        correctAnswer: '$120$',
        answers: [{ text: '$120$', isCorrect: true }]
      },
      {
        id: 'train_q_4',
        questionText: 'Tính tích phân $I = \\int_{0}^{1} (2x + 1) \\, dx$:',
        correctAnswer: '$I = 2$',
        answers: [{ text: '$I = 2$', isCorrect: true }]
      },
      {
        id: 'train_q_5',
        questionText: 'Trong không gian $Oxyz$, một vectơ pháp tuyến của $(P): 2x - y + 3z - 1 = 0$ là:',
        correctAnswer: '$\\vec{n} = (2; -1; 3)$',
        answers: [{ text: '$\\vec{n} = (2; -1; 3)$', isCorrect: true }]
      }
    ];
  }

  
  function sanitizeItem(item) {
    if (!item || typeof item !== 'object') return item;
    if (!Array.isArray(item.questions)) item.questions = [];
    if (!Array.isArray(item.cards)) item.cards = [];
    if (!Array.isArray(item.nodes)) item.nodes = [];
    if (!Array.isArray(item.cells)) item.cells = [];
    if (!Array.isArray(item.clues)) item.clues = [];
    if (!Array.isArray(item.pairs)) item.pairs = [];
    if (!Array.isArray(item.names)) item.names = [];
    if (!Array.isArray(item.students)) item.students = [];
    if (!Array.isArray(item.hotspots)) item.hotspots = [];
    return item;
  }

  function generateDefaultGames() {
    const rawQs = getSmartEduQuestions();
    const formatted = formatStandardQuestions(rawQs);
    const authorName = localStorage.getItem('app_author_name') || 'NMH Thầy Nguyễn Mạnh Hùng';

    // A. Lật mảnh ghép (Flip Puzzle) - Yêu cầu đúng 9 ô cho lưới 3x3
    const flipCells = [];
    const gridSize = { rows: 3, cols: 3 };
    const totalCells = gridSize.rows * gridSize.cols;
    for (let i = 0; i < totalCells; i++) {
      const q = formatted[i % formatted.length];
      flipCells.push({
        id: `cell_${i + 1}`,
        number: i + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        imageUrl: q.imageUrl || '',
        position: i
      });
    }

    const defaultFlip = {
      id: 'default_flip_puzzle_math',
      title: '🧩 Lật Mảnh Ghép Toán Học - ' + authorName,
      imageUrl: '/images/unnamed.png',
      imageName: 'Ảnh Bí Ẩn Toán Học',
      gridSize: gridSize,
      cellSizeMode: 'equal',
      pieceShape: 'rect',
      pieceColor: 'blue',
      cells: flipCells,
      questionTimeLimit: 0,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // B. Chặn Zombie (Zombie Defense)
    const defaultZombie = {
      id: 'default_zombie_defense_math',
      title: '🧟 Chặn Zombie - Đấu Trường Toán Học (' + authorName + ')',
      questions: formatted,
      difficulty: 'normal',
      timePerQuestion: 25,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // C. Kéo co tri thức (Tug of War)
    const defaultTug = {
      id: 'default_tug_of_war_math',
      title: '⚔️ Kéo Co Tri Thức - ' + authorName,
      questions: formatted,
      targetScore: 5,
      timePerRound: 20,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // D. Dò mìn (Minesweeper)
    const defaultMinesweeper = {
      id: 'default_minesweeper_math',
      title: '💣 Dò Mìn Tri Thức - ' + authorName,
      questions: formatted,
      gridRows: 5,
      gridCols: 6,
      mineCount: 5,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // E. Quiz Nghiêng Đầu (Head Tilt)
    const defaultHeadTilt = {
      id: 'default_head_tilt_math',
      title: '👤 Quiz Nghiêng Đầu AI Camera - ' + authorName,
      questions: formatted,
      tiltSensitivity: 1.0,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // F. Quiz Chém Hoa Quả (Hand Slash)
    const defaultHandSlash = {
      id: 'default_hand_slash_math',
      title: '🖐️ Quiz Chém Hoa Quả AI Camera - ' + authorName,
      questions: formatted,
      slashSpeed: 'normal',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // G. Túi Ba Gang (Star Bag)
    const defaultStarBag = {
      id: 'default_star_bag_math',
      title: '⭐ Túi Ba Gang Tri Thức - ' + authorName,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // H. Đoàn Tàu Tri Thức (Knowledge Train)
    const defaultKnowledgeTrain = {
      id: 'default_knowledge_train_math',
      title: '🚂 Đoàn Tàu Tri Thức - ' + authorName,
      questions: formatKnowledgeTrainQuestions(rawQs, authorName),
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // I. Đấu Tướng RPG (Turn-based RPG)
    const defaultTurnBased = {
      id: 'default_turn_based_math',
      title: '🛡️ Đấu Tướng RPG Tri Thức - ' + authorName,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // J. Đối Kháng 1vs1 (Versus)
    const defaultVersus = {
      id: 'default_versus_math',
      title: '⚡ Đấu Trường Đối Kháng 1vs1 - ' + authorName,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // K. Trắc nghiệm theo nhịp độ (Paced Quiz)
    const defaultPaced = {
      id: 'default_paced_math',
      title: '⏱️ Trắc Nghiệm Theo Nhịp Độ - ' + authorName,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // L. Bắn từ bay (Flying Words)
    const defaultFlying = {
      id: 'default_flying_math',
      title: '🚀 Bắn Từ Bay Tri Thức - ' + authorName,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // M. Ô chữ kỳ diệu (Crossword)
    const defaultCrossword = {
      id: 'default_crossword_math',
      title: '🔠 Ô Chữ Kỳ Diệu Toán Học - ' + authorName,
      keyword: 'TOANHOC',
      clues: [
        { word: 'TICHPHAN', clue: 'Phép toán ngược với đạo hàm là phép tính gì?' },
        { word: 'HAMSO', clue: 'Quy tắc tương ứng giữa hai tập hợp là khái niệm gì?' },
        { word: 'DAOHAM', clue: 'Tốc độ biến thiên tức thời của hàm số' },
        { word: 'NGHIEM', clue: 'Giá trị của ẩn làm phương trình đúng' },
        { word: 'HINHCHOP', clue: 'Hình đa diện có đáy là đa giác và các mặt bên là tam giác' },
        { word: 'OCTA', clue: 'Bát diện đều có mấy mặt?' },
        { word: 'CUCBAC', clue: 'Điểm cực trị tại đó đạo hàm đổi dấu từ dương sang âm' }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // N. Kéo thả nối ý (Quiz Game / Drag & Drop)
    const defaultDragDrop = {
      id: 'default_drag_drop_math',
      title: '🧩 Kéo Thả Nối Ý Tri Thức - ' + authorName,
      pairs: [
        { left: 'Đạo hàm của $\\sin(x)$', right: '$\\cos(x)$' },
        { left: 'Đạo hàm của $\\cos(x)$', right: '$-\\sin(x)$' },
        { left: 'Đạo hàm của $e^x$', right: '$e^x$' },
        { left: 'Đạo hàm của $\\ln(x)$', right: '$\\frac{1}{x}$' }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // O. Vòng quay gọi tên / Gọi tên ngẫu nhiên
    const defaultWheel = {
      id: 'default_wheel_names',
      title: '🎡 Vòng Quay May Mắn - Danh Sách Học Sinh',
      names: [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Mỹ Duyên',
        'Vũ Minh Đức', 'Hoàng Ngọc Hà', 'Đỗ Trung Hải', 'Bùi Kim Ngân',
        'Phan Quốc Phong', 'Trịnh Thanh Thảo', 'Lương Anh Tuấn', 'Ngô Thu Uyên'
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

        // P. Thể Dục ABC (Pose AI)
    const defaultPose = {
      id: 'default_pose_quiz_math',
      title: '🤸 Thể Dục ABC (Pose AI) - ' + authorName,
      cameraMode: true,
      slideMode: 'manual',
      autoSeconds: 15,
      bgmTrack: '',
      bgmFileName: '',
      poseSize: 'm',
      poseSet: 'body',
      globalFs: 2,
      globalAfs: 2,
      ttsEnabled: false,
      shuffleMode: false,
      questions: formatted,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Q. Thẻ lật ghi nhớ (Flashcard)
    const defaultFlashcard = {
      id: 'default_flashcard_deck_math',
      title: '🃏 Bộ Thẻ Ghi Nhớ Toán Học - ' + authorName,
      cards: formatted.map((q, idx) => ({
        id: 'card_' + (idx + 1),
        front: q.question,
        back: q.correctAnswer || (q.options && q.options[0]) || 'Đáp án đúng'
      })),
      shuffleCards: false,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // R. Sơ đồ tư duy (Mind Map)
    const defaultMindMap = {
      id: 'default_mind_map_math',
      title: '🔀 Sơ Đồ Tư Duy Toán Học - ' + authorName,
      centralTopic: 'Hệ Thống Toán Học 12',
      nodes: [
        { id: 'node_1', label: 'Khảo sát hàm số', selectedTexts: ['Đạo hàm', 'Cực trị'], options: [{ id: 'opt_1', text: 'Đạo hàm' }, { id: 'opt_2', text: 'Cực trị' }], correctOptionIds: ['opt_1', 'opt_2'] },
        { id: 'node_2', label: 'Nguyên hàm & Tích phân', selectedTexts: ['Định nghĩa', 'Bảng công thức'], options: [{ id: 'opt_3', text: 'Định nghĩa' }, { id: 'opt_4', text: 'Bảng công thức' }], correctOptionIds: ['opt_3', 'opt_4'] },
        { id: 'node_3', label: 'Hình học Oxyz', selectedTexts: ['Toạ độ vectơ', 'Phương trình mặt phẳng'], options: [{ id: 'opt_5', text: 'Toạ độ vectơ' }, { id: 'opt_6', text: 'Phương trình mặt phẳng' }], correctOptionIds: ['opt_5', 'opt_6'] }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // S. Ảnh tương tác (Interactive Image)
    const defaultInteractiveImage = {
      id: 'default_interactive_image_math',
      title: '🖼️ Ảnh Tương Tác Sư Phạm - ' + authorName,
      imageUrl: '/images/unnamed.png',
      hotspots: [
        { id: 'hs_1', x: 25, y: 35, title: 'Điểm Cực Trị', content: 'Điểm cực đại của đồ thị hàm số', type: 'text' },
        { id: 'hs_2', x: 65, y: 70, title: 'Tiệm Cận Ngang', content: 'Đường thẳng y = 2', type: 'text' }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // T. Video tương tác (Interactive Video)
    const defaultInteractiveVideo = {
      id: 'default_interactive_video_math',
      title: '🎬 Video Tương Tác Toán Học - ' + authorName,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      stops: [
        { time: 30, question: formatted[0] },
        { time: 60, question: formatted[1] }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // U. Game HTML nhúng tùy biến (HTML Games)
    const defaultHtmlGame = {
      id: 'default_html_game_math',
      title: '🎮 Game HTML Nhúng Tùy Biến - ' + authorName,
      pairs: [
        { left: 'Khái niệm A', right: 'Định nghĩa A' },
        { left: 'Khái niệm B', right: 'Định nghĩa B' }
      ],
      htmlContent: '<div style="padding:20px;text-align:center;"><h2>Trò chơi tương tác</h2></div>',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // V. Săn kho báu (Scavenger Hunt)
    const defaultHunt = {
      id: 'default_hunt_math',
      title: '💎 Săn Kho Báu Bí Ẩn - ' + authorName,
      questions: formatted,
      clues: [
        { id: 'clue_1', text: 'Giải câu hỏi để mở rương vàng', question: formatted[0] }
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // W. Danh sách lớp học (Classes)
    const defaultClasses = [
      {
        id: 'class_12a1',
        name: 'Lớp 12A1',
        students: [
          'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Mỹ Duyên',
          'Vũ Minh Đức', 'Hoàng Ngọc Hà', 'Đỗ Trung Hải', 'Bùi Kim Ngân'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return {
      pose_quizzes: [defaultPose],
      quizzes: [defaultPose],
      flip_puzzles: [defaultFlip],
      zombie_defense: [defaultZombie],
      zombieDefense_games: [defaultZombie],
      tug_of_war: [defaultTug],
      tug_of_wars: [defaultTug],
      minesweeper: [defaultMinesweeper],
      minesweeper_games: [defaultMinesweeper],
      head_tilt_lessons: [defaultHeadTilt],
      hand_slash_lessons: [defaultHandSlash],
      star_bag_games: [defaultStarBag],
      knowledge_train_games: [defaultKnowledgeTrain],
      knowledge_trains: [defaultKnowledgeTrain],
      turn_based_games: [defaultTurnBased],
      versus_games: [defaultVersus],
      paced_quizzes: [defaultPaced],
      flying_words_lessons: [defaultFlying],
      crossword_puzzles: [defaultCrossword],
      drag_drop_quizzes: [defaultDragDrop],
      wheel_quizzes: [defaultWheel],
      flashcard_decks: [defaultFlashcard],
      mind_maps: [defaultMindMap],
      interactive_images: [defaultInteractiveImage],
      interactive_video: [defaultInteractiveVideo],
      html_games: [defaultHtmlGame],
      scavenger_hunts: [defaultHunt],
      wheelQuiz_classes: defaultClasses,
      wheelQuiz_questionSets: [{ id: 'wheel_qset_1', title: 'Bộ Câu Hỏi Vòng Quay', questions: formatted }],
      lessons: [defaultZombie, defaultTug]
    };
  }

  // 4. Đối tượng Offline Fallback Adapter cho Firebase Firestore
  const defaultSeeds = generateDefaultGames();

  function getFeatureKeyFromPath(path) {
    if (!path) return 'general';
    const clean = path.toLowerCase();
    if (clean.includes('flashcard')) return 'flashcard_decks';
    if (clean.includes('mind') || clean.includes('map')) return 'mind_maps';
    if (clean.includes('interactive_image') || clean.includes('interactiveimage') || clean.includes('image')) return 'interactive_images';
    if (clean.includes('video')) return 'interactive_video';
    if (clean.includes('hunt') || clean.includes('scavenger')) return 'scavenger_hunts';
    if (clean.includes('html')) return 'html_games';
    if (clean.includes('class')) return 'wheelQuiz_classes';
    if (clean.includes('questionset') || clean.includes('wheelquiz_question')) return 'wheelQuiz_questionSets';
    if (clean.includes('pose')) return 'pose_quizzes';
    if (clean.includes('flip')) return 'flip_puzzles';
    if (clean.includes('zombie')) return 'zombieDefense_games';
    if (clean.includes('tug')) return 'tug_of_wars';
    if (clean.includes('minesweeper')) return 'minesweeper_games';
    if (clean.includes('tilt')) return 'head_tilt_lessons';
    if (clean.includes('slash')) return 'hand_slash_lessons';
    if (clean.includes('star') || clean.includes('bag')) return 'star_bag_games';
    if (clean.includes('train')) return 'knowledge_train_games';
    if (clean.includes('turn')) return 'turn_based_games';
    if (clean.includes('versus')) return 'versus_games';
    if (clean.includes('paced')) return 'paced_quizzes';
    if (clean.includes('flying')) return 'flying_words_lessons';
    if (clean.includes('crossword')) return 'crossword_puzzles';
    if (clean.includes('drag') || clean.includes('quiz_game')) return 'drag_drop_quizzes';
    if (clean.includes('wheel') || clean.includes('goi-ten')) return 'wheel_quizzes';
    return 'lessons';
  }

  function getLocalItems(key) {
    const storageKey = 'gvdm_db_' + key;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (key === 'knowledge_train_games') {
            const needsFix = parsed.some(game => 
              Array.isArray(game.questions) && game.questions.every(q => q.correctAnswer === 'A' || q.correctAnswer === 'A.')
            );
            if (needsFix) {
              const freshSeeds = (defaultSeeds[key] || []).map(sanitizeItem);
              localStorage.setItem(storageKey, JSON.stringify(freshSeeds));
              return freshSeeds;
            }
          }
          return parsed.map(sanitizeItem);
        }
      } catch(e) {}
    }
    const rawSeeds = defaultSeeds[key] || defaultSeeds.lessons || [];
    const seeds = rawSeeds.map(sanitizeItem);
    localStorage.setItem(storageKey, JSON.stringify(seeds));
    return seeds;
  }

  function saveLocalItems(key, items) {
    const storageKey = 'gvdm_db_' + key;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Lỗi lưu gvdm_db:', e);
    }
  }

  // Khai báo đối tượng Fallback toàn cục
  window.__gvdmOfflineFallback = {
    // A. Lấy danh sách tài liệu
    getDocs: async function (queryOrCol) {
      let path = '';
      if (queryOrCol) {
        if (typeof queryOrCol.path === 'string') {
          path = queryOrCol.path;
        } else if (queryOrCol._query && queryOrCol._query.path) {
          const qp = queryOrCol._query.path;
          if (typeof qp.canonicalString === 'function') {
            path = qp.canonicalString();
          } else if (Array.isArray(qp.segments)) {
            path = qp.segments.join('/');
          } else {
            path = String(qp);
          }
        }
      }

      // CRITICAL FIX: Folders / Groups MUST return empty list
      // Otherwise @dnd-kit mounts duplicate IDs between folder and puzzle cards,
      // causing infinite render loop (React Error #185) and browser freeze!
      if (path && (path.includes('groups') || path.includes('_groups'))) {
        return {
          docs: [],
          size: 0,
          empty: true,
          forEach: function () {}
        };
      }

      const key = getFeatureKeyFromPath(path);
      const items = getLocalItems(key);

      const docs = items.map(item => ({
        id: item.id || ('doc_' + Math.random().toString(36).substring(2, 9)),
        data: () => item,
        exists: () => true
      }));

      return {
        docs: docs,
        size: docs.length,
        empty: docs.length === 0,
        forEach: function (fn) {
          docs.forEach(fn);
        }
      };
    },

    // B. Lấy một tài liệu cụ thể theo ID
    getDoc: async function (docRef) {
      const path = (docRef && docRef.path) || '';
      const id = (docRef && docRef.id) || '';

      if (path && (path.includes('groups') || path.includes('_groups'))) {
        return {
          id: id || 'none',
          data: () => null,
          exists: () => false
        };
      }

      const key = getFeatureKeyFromPath(path);
      const items = getLocalItems(key);
      const item = items.find(it => it.id === id) || items[0] || null;

      return {
        id: id || (item ? item.id : 'unknown'),
        data: () => item,
        exists: () => !!item
      };
    },

    // C. Lưu hoặc ghi đè tài liệu
    setDoc: async function (docRef, data, options) {
      const path = (docRef && docRef.path) || '';
      const id = (docRef && docRef.id) || ('doc_' + Date.now());
      const key = getFeatureKeyFromPath(path);
      const items = getLocalItems(key);
      const existingIdx = items.findIndex(it => it.id === id);

      const finalItem = { ...(existingIdx >= 0 ? items[existingIdx] : {}), ...data, id: id };
      if (existingIdx >= 0) {
        items[existingIdx] = finalItem;
      } else {
        items.unshift(finalItem);
      }
      saveLocalItems(key, items);
      return Promise.resolve();
    },

    // D. Thêm mới tài liệu
    addDoc: async function (colRef, data) {
      const path = (colRef && colRef.path) || '';
      const key = getFeatureKeyFromPath(path);
      const items = getLocalItems(key);
      const newId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const finalItem = { ...data, id: newId };
      items.unshift(finalItem);
      saveLocalItems(key, items);
      return Promise.resolve({ id: newId });
    },

    // E. Cập nhật tài liệu
    updateDoc: async function (docRef, data) {
      return this.setDoc(docRef, data, { merge: true });
    },

    // F. Xóa tài liệu
    deleteDoc: async function (docRef) {
      const path = (docRef && docRef.path) || '';
      const id = (docRef && docRef.id) || '';
      const key = getFeatureKeyFromPath(path);
      let items = getLocalItems(key);
      items = items.filter(it => it.id !== id);
      saveLocalItems(key, items);
      return Promise.resolve();
    }
  };

  console.log('✅ GVDM Offline Bridge & Local Data Provider initialized successfully.');

  
  // =========================================================================
  // BỘ CHUẨN HOÁ CÂU HỎI AZOTA / IEXAM / IMATH / WORD-TO-GAME (TAB GAMES 2)
  // =========================================================================
  var SAMPLE_EXAM_TEMPLATE_TEXT = "SỞ GD&ĐT ....................                     ĐỀ THI TRẮC NGHIỆM CHUẨN HOÁ (GV GAME NEW)\n" +
    "TRƯỜNG THPT .................                     MÔN: TOÁN HỌC - NĂM HỌC 2025 - 2026\n" +
    "                                                  Thời gian làm bài: 45 phút (không kể thời gian phát đề)\n" +
    "                                                  Mã đề: 101\n\n" +
    "Câu 1: Cho hàm số $y = f(x) = x^3 - 3x^2 + 2$. Điểm cực đại của đồ thị hàm số là:\n" +
    "*A. $(0; 2)$\n" +
    "B. $(2; -2)$\n" +
    "C. $(1; 0)$\n" +
    "D. $(-1; -2)$\n" +
    "Lời giải: Ta có $y' = 3x^2 - 6x = 3x(x - 2)$. $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Với $x = 0 \\Rightarrow y = 2$ là điểm cực đại.\n\n" +
    "Câu 2: Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:\n" +
    "A. $x = 8$\n" +
    "B. $x = 7$\n" +
    "*C. $x = 9$\n" +
    "D. $x = 10$\n" +
    "Lời giải: Điều kiện $x > 1$. Phương trình tương đương $x - 1 = 2^3 = 8 \\Rightarrow x = 9$.\n\n" +
    "Câu 3: Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$. Tọa độ tâm $I$ và bán kính $R$ của mặt cầu là:\n" +
    "*A. $I(1; -2; 3), R = 4$\n" +
    "B. $I(-1; 2; -3), R = 4$\n" +
    "C. $I(1; -2; 3), R = 16$\n" +
    "D. $I(-1; 2; -3), R = 16$\n" +
    "Lời giải: Mặt cầu có tâm $I(1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.\n\n" +
    "Câu 4: Cho khối lăng trụ có diện tích đáy $B = 6$ và chiều cao $h = 4$. Thể tích của khối lăng trụ đã cho bằng:\n" +
    "A. $8$\n" +
    "*B. $24$\n" +
    "C. $12$\n" +
    "D. $72$\n" +
    "Lời giải: Thể tích khối lăng trụ $V = B \\cdot h = 6 \\cdot 4 = 24$.\n\n" +
    "Câu 5: Nguyên hàm của hàm số $f(x) = 2x + \\cos x$ là:\n" +
    "*A. $F(x) = x^2 + \\sin x + C$\n" +
    "B. $F(x) = x^2 - \\sin x + C$\n" +
    "C. $F(x) = 2 - \\sin x + C$\n" +
    "D. $F(x) = x^2 + \\cos x + C$\n" +
    "Lời giải: $\\int (2x + \\cos x) dx = x^2 + \\sin x + C$.\n\n" +
    "Câu 6: [NB] Đạo hàm của hàm số $y = e^{2x}$ là:\n" +
    "A. $y' = e^{2x}$\n" +
    "*B. $y' = 2e^{2x}$\n" +
    "C. $y' = \\frac{1}{2}e^{2x}$\n" +
    "D. $y' = 2x e^{2x-1}$\n" +
    "Lời giải: $(e^u)' = u' \\cdot e^u \\Rightarrow (e^{2x})' = 2e^{2x}.\n\n" +
    "Câu 7: Gieo một con súc sắc cân đối và đồng chất hai lần. Xác suất để tổng số chấm xuất hiện trong hai lần gieo bằng 7 là:\n" +
    "A. $\\frac{5}{36}$\n" +
    "*B. $\\frac{1}{6}$\n" +
    "C. $\\frac{7}{36}$\n" +
    "D. $\\frac{1}{12}$\n" +
    "Lời giải: Không gian mẫu $n(\\Omega) = 36$. Các cặp có tổng bằng 7 là (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) có 6 kết quả. Xác suất $P = \\frac{6}{36} = \\frac{1}{6}.\n\n" +
    "Câu 8: Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 2$. Giá trị của $u_5$ bằng:\n" +
    "A. $13$\n" +
    "*B. $11$\n" +
    "C. $15$\n" +
    "D. $9$\n" +
    "Lời giải: $u_5 = u_1 + 4d = 3 + 4 \\cdot 2 = 11.\n\n" +
    "Câu 9: Trong mặt phẳng $Oxy$, khoảng cách từ điểm $M(1; 2)$ đến đường thẳng $\\Delta: 3x - 4y + 10 = 0$ là:\n" +
    "A. $2$\n" +
    "*B. $1$\n" +
    "C. $\\frac{5}{2}$\n" +
    "D. $3$\n" +
    "Lời giải: $d(M, \\Delta) = \\frac{|3(1) - 4(2) + 10|}{\\sqrt{3^2 + (-4)^2}} = \\frac{5}{5} = 1.\n\n" +
    "Câu 10: Tập nghiệm của bất phương trình $2^{x+1} > 8$ là:\n" +
    "*A. $(2; +\\infty)$\n" +
    "B. $(3; +\\infty)$\n" +
    "C. $(-\\infty; 2)$\n" +
    "D. $[2; +\\infty)$\n" +
    "Lời giải: $2^{x+1} > 2^3 \\Leftrightarrow x + 1 > 3 \\Leftrightarrow x > 2.\n\n" +
    "BẢNG ĐÁP ÁN:\n" +
    "1.A   2.C   3.A   4.B   5.A   6.B   7.B   8.B   9.B   10.A\n";

  function parseStandardExamText(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];
    var clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Trích xuất Bảng đáp án ở cuối đề thi nếu có
    var answerKeyMap = {};
    var tableMatch = clean.match(/(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*CÁC\s*CÂU|BẢNG\s*KEY|BẢNG\s*TRA\s*ĐÁP\s*ÁN|KEY)[:\s]+([\s\S]*)$/i);
    var mainBody = clean;
    if (tableMatch) {
      mainBody = clean.substring(0, tableMatch.index);
      var tableStr = tableMatch[1];
      var keyPairs = [...tableStr.matchAll(/(\\d+)[\\.\\s\\:\\-]+([A-D])/gi)];
      keyPairs.forEach(function(m) {
        answerKeyMap[parseInt(m[1], 10)] = m[2].toUpperCase();
      });
    }

    // 2. Tách từng câu hỏi
    var qSplitter = /(?:^|\n)(?=(?:Câu|Bài|Question|\\d+)\\s*(?:\\d+|\\[\\d+\\])[\\.:\\)\\s])/i;
    var blocks = mainBody.split(qSplitter).map(function(b) { return b.trim(); }).filter(Boolean);
    var results = [];

    blocks.forEach(function(block, idx) {
      var qNum = idx + 1;
      var numMatch = block.match(/^(?:Câu|Bài|Question)?\\s*(\\d+)[\\.:\\)\\s]/i);
      if (numMatch) {
        qNum = parseInt(numMatch[1], 10);
      }

      // Tách Lời giải / Hướng dẫn giải
      var contentAndOpts = block;
      var explanation = '';
      var expMatch = block.match(/(?:Lời giải|Hướng dẫn giải|Giải thích|Chi tiết|HDG|Explanation)[:\\s]+([\\s\\S]*)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        contentAndOpts = block.substring(0, expMatch.index).trim();
      }

      // Kiểm tra đáp án ghi chú ở cuối câu: "Đáp án: A", "Chọn B"
      var inlineAns = null;
      var ansMatch = contentAndOpts.match(/(?:Đáp án|Chọn|Key)[:\s]*([A-D])/i);
      if (ansMatch) {
        inlineAns = ansMatch[1].toUpperCase();
      }

      // Tách phần thân câu hỏi và các phương án A, B, C, D
      var firstOptIdx = contentAndOpts.search(/(?:^|\n|\\t|\\s{2,})(?:[\\*]|\\<u\\>|\\<b\\>)?([A-D])[\\.\\)]/i);
      var qContent = contentAndOpts;
      var optPart = '';
      if (firstOptIdx !== -1) {
        qContent = contentAndOpts.substring(0, firstOptIdx).trim();
        optPart = contentAndOpts.substring(firstOptIdx).trim();
      }

      // Làm sạch tiền tố Câu 1: ở đầu câu hỏi
      qContent = qContent.replace(/^(?:Câu|Bài|Question|\\d+)\\s*(?:\\d+|\\[\\d+\\])[\\.:\\)\\s]*/i, '').trim();

      // Quét từng phương án A, B, C, D
      var optRegex = /(?:^|\n|\\t|\\s{2,})([*]|\\<u\\>|\\<b\\>)?([A-D])[\\.\\)]([\\s\\S]*?)(?=(?:(?:^|\n|\\t|\\s{2,})([*]|\\<u\\>|\\<b\\>)?[A-D][\\.\\)])|(?:(?:Đáp án|Chọn|Key)[:\\s]*[A-D])|$)/gi;
      var matches = [...optPart.matchAll(optRegex)];

      var options = [];
      var correctIdx = 0;
      var tableAns = answerKeyMap[qNum] || null;
      var targetAnsLetter = tableAns || inlineAns || null;

      if (matches.length >= 2) {
        matches.forEach(function(m, mIdx) {
          var marker = m[1] || '';
          var letter = m[2].toUpperCase();
          var optText = m[3].replace(/(?:Đáp án|Chọn|Key)[:\\s]*[A-D]/gi, '').trim();
          optText = optText.replace(/<[^>]+>/g, '').trim();

          options.push(optText || ('Phương án ' + letter));

          var isMarked = marker.includes('*') || marker.includes('<u>') || marker.includes('<b>');
          if (isMarked || (targetAnsLetter && targetAnsLetter === letter)) {
            correctIdx = mIdx;
          }
        });
      } else {
        options.push('Đúng', 'Sai');
      }

      // Xây dựng mảng answers chuẩn tương thích 100% toàn bộ 24 games
      var answers = options.map(function(opt, oIdx) {
        return {
          id: 'ans_' + oIdx + '_' + qNum,
          text: opt,
          content: opt,
          isCorrect: oIdx === correctIdx,
          image: ''
        };
      });

      results.push({
        id: 'q_' + qNum + '_' + Math.random().toString(36).substring(2, 7),
        questionText: qContent || ('Câu hỏi ' + qNum),
        question: qContent || ('Câu hỏi ' + qNum),
        q: qContent || ('Câu hỏi ' + qNum),
        stem: qContent || ('Câu hỏi ' + qNum),
        content: qContent || ('Câu hỏi ' + qNum),
        answers: answers,
        options: options.slice(0, 4),
        correctIndex: correctIdx,
        correct: correctIdx,
        correctAnswer: ['A', 'B', 'C', 'D'][correctIdx] || 'A',
        correctAnswerIndices: [correctIdx],
        explanation: explanation || 'Lời giải chi tiết đang cập nhật.',
        timeLimit: 30
      });
    });

    return results;
  }

  function downloadStandardExamFile(format) {
    format = format || 'doc';
    var filename = 'De_Thi_Chuan_Azota_iMath_Word.doc';
    var mimeType = 'application/msword;charset=utf-8';
    var content = '';

    if (format === 'txt') {
      filename = 'De_Thi_Chuan_Azota_iMath.txt';
      mimeType = 'text/plain;charset=utf-8';
      content = SAMPLE_EXAM_TEMPLATE_TEXT;
    } else {
      // Chuẩn Word .doc (Office MSO HTML XML format - mở trực tiếp trong Microsoft Word & WPS)
      var lines = SAMPLE_EXAM_TEMPLATE_TEXT.split('\n');
      var bodyHtml = '';
      lines.forEach(function(l) {
        var trimmed = l.trim();
        if (!trimmed) {
          bodyHtml += '<p style="margin:4px 0;">&nbsp;</p>';
        } else if (trimmed.startsWith('Câu')) {
          bodyHtml += '<p style="font-weight:bold; margin-top:12px; margin-bottom:4px; color:#0f172a;">' + l + '</p>';
        } else if (trimmed.startsWith('*')) {
          bodyHtml += '<p style="margin-left:24px; margin-top:2px; margin-bottom:2px; font-weight:bold; color:#15803d;">' + l + ' <span style="font-size:10pt; color:#16a34a;">(ĐÁP ÁN ĐÚNG)</span></p>';
        } else if (trimmed.match(/^[A-D]./)) {
          bodyHtml += '<p style="margin-left:24px; margin-top:2px; margin-bottom:2px; color:#1e293b;">' + l + '</p>';
        } else if (trimmed.startsWith('Lời giải:')) {
          bodyHtml += '<p style="margin-left:24px; margin-top:4px; margin-bottom:8px; font-style:italic; color:#475569;">' + l + '</p>';
        } else if (trimmed.startsWith('BẢNG ĐÁP ÁN')) {
          bodyHtml += '<h3 style="margin-top:20px; color:#1e3a8a;">' + l + '</h3>';
        } else {
          bodyHtml += '<p style="margin:3px 0;">' + l + '</p>';
        }
      });

      content = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>Đề thi chuẩn Azota iMath</title>' +
        '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
        '<style>body{font-family:\'Times New Roman\',serif; font-size:13pt; line-height:1.5; color:#000; margin:20mm;}' +
        'table{width:100%; border:none; margin-bottom:15px; font-weight:bold;}' +
        'td{border:none; padding:4px; vertical-align:top;}</style></head><body>' +
        '<table><tr><td style="width:50%;">SỞ GD&ĐT ....................<br>TRƯỜNG THPT .................</td>' +
        '<td style="text-align:right;">ĐỀ THI TRẮC NGHIỆM CHUẨN HOÁ<br>MÔN: TOÁN HỌC - NĂM HỌC 2025 - 2026<br><span style="font-size:11pt; font-weight:normal;">Mã đề: 101</span></td></tr></table>' +
        '<hr style="border:none; border-top:1.5px solid #000; margin-bottom:15px;">' +
        bodyHtml +
        '</body></html>';
    }

    var blob = new Blob([content], { type: mimeType });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function importQuestionsIntoGames(rawText, lessonTitle) {
    lessonTitle = lessonTitle || 'Đề ôn tập chuẩn hóa iMath';
    var questions = parseStandardExamText(rawText);
    if (!questions || questions.length === 0) {
      return false;
    }

    var jsonStr = JSON.stringify(questions);
    try {
      localStorage.setItem('smartedu_imath_questions', jsonStr);
      sessionStorage.setItem('smartedu_imath_questions', jsonStr);
      localStorage.setItem('gvdm_active_questions', jsonStr);
      localStorage.setItem('smartedu_questions_bridge', jsonStr);

      var newLesson = {
        id: 'lesson_' + Date.now(),
        title: lessonTitle,
        name: lessonTitle,
        questions: questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      var keysToUpdate = [
        'zombie_defense', 'minesweeper', 'tug_of_war', 'star_bag_games',
        'knowledge_train_games', 'flip_puzzles', 'turn_based_games', 'versus_games',
        'paced_quizzes', 'flying_words_lessons', 'crossword_puzzles', 'head_tilt_lessons',
        'hand_slash_lessons', 'drag_drop_quizzes', 'wheel_quizzes'
      ];

      keysToUpdate.forEach(function(k) {
        try {
          var sk = 'gvdm_db_' + k;
          var list = [];
          var cur = localStorage.getItem(sk);
          if (cur) list = JSON.parse(cur);
          if (!Array.isArray(list)) list = [];
          list.unshift(newLesson);
          localStorage.setItem(sk, JSON.stringify(list));
        } catch(e) {}
      });

      return questions.length;
    } catch(e) {
      console.error('Import error:', e);
      return false;
    }
  }

  window.GVDMStandardExam = {
    parse: parseStandardExamText,
    parseAzotaImathExam: parseStandardExamText,
    downloadTemplate: downloadStandardExamFile,
    importText: importQuestionsIntoGames,
    templateText: SAMPLE_EXAM_TEMPLATE_TEXT
  };

  })();
