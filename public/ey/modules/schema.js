// ============================================================================
// KHỐI 1A: SƠ ĐỒ CƠ SỞ DỮ LIỆU & STORAGE ENGINE (POMYAI - MHEDU)
// Tác giả: Thầy Hùng - Trường THPT Số 1 Lê Hồng Phong
// Hotline / Zalo: 0965908084 | Email: nmh28691@gmail.com | FB: fb.com/doiten234
// Bản quyền: Hoàn toàn Miễn phí 100% cho Giáo viên và Học sinh toàn quốc
// ============================================================================

(function(global) {
  const TEACHER_PROFILE = {
    name: "Thầy Hùng",
    school: "Trường THPT Số 1 Lê Hồng Phong",
    phone: "0965908084",
    zalo: "0965908084",
    email: "nmh28691@gmail.com",
    facebook: "https://fb.com/doiten234",
    donate: {
      bank: "BIDV",
      accountNumber: "6320495851",
      accountName: "NGUYEN MANH HUNG"
    },
    policy: "Hoàn toàn Miễn phí 100% cho Giáo viên và Học sinh toàn quốc",
    platform: "MHEdu - PomyAI Gamification Platform",
    version: "3.0.0-PRO"
  };

  class StorageEngine {
    constructor() {
      this.keyRooms = 'mhedu_ey_rooms_v3';
      this.keyActiveRoom = 'mhedu_ey_active_room_v3';
      this.initDefault();
    }

    initDefault() {
      if (!localStorage.getItem(this.keyRooms)) {
        const defaultRoom = {
          id: 'room_' + Date.now(),
          pin: '992886',
          title: 'Toán 10 - Ôn tập Hàm số & Đồ thị - THPT Số 1 Lê Hồng Phong',
          subject: 'Toán học',
          grade: '10',
          teacher: TEACHER_PROFILE,
          settings: {
            timePerQuestion: 30,
            shuffleQuestions: true,
            strictMode: true,
            gameMode: 'nhanh-chan-vao-lop'
          },
          roster: [
            { id: 'st_1', name: "Nguyễn Văn An", shortName: "An", gender: "nam", avatarIndex: 0, status: "ready", score: 0, violations: 0 },
            { id: 'st_2', name: "Trần Thị Bích", shortName: "Bích", gender: "nu", avatarIndex: 1, status: "ready", score: 0, violations: 0 },
            { id: 'st_3', name: "Lê Hoàng Long", shortName: "Long", gender: "nam", avatarIndex: 2, status: "ready", score: 0, violations: 0 },
            { id: 'st_4', name: "Phạm Minh Thư", shortName: "Thư", gender: "nu", avatarIndex: 3, status: "ready", score: 0, violations: 0 },
            { id: 'st_5', name: "Đặng Quốc Bảo", shortName: "Bảo", gender: "nam", avatarIndex: 4, status: "ready", score: 0, violations: 0 },
            { id: 'st_6', name: "Vũ Mai Phương", shortName: "Phương", gender: "nu", avatarIndex: 5, status: "ready", score: 0, violations: 0 },
            { id: 'st_7', name: "Bùi Tấn Phát", shortName: "Phát", gender: "nam", avatarIndex: 0, status: "ready", score: 0, violations: 0 },
            { id: 'st_8', name: "Hoàng Kim Ngân", shortName: "Ngân", gender: "nu", avatarIndex: 1, status: "ready", score: 0, violations: 0 }
          ],
          questions: [
            {
              id: 'q_1',
              number: 1,
              content: 'Tập xác định của hàm số $y = \\frac{1}{\\sqrt{x - 2}}$ là:',
              image: null,
              options: [
                { key: 'A', text: '$(2; +\\infty)$' },
                { key: 'B', text: '$[2; +\\infty)$' },
                { key: 'C', text: '$(-\\infty; 2)$' },
                { key: 'D', text: '$\\mathbb{R} \\setminus \\{2\\}$' }
              ],
              correctAnswer: 'A',
              explanation: 'Hàm số xác định khi biểu thức dưới căn ở mẫu dương: $x - 2 > 0 \\Leftrightarrow x > 2$.'
            },
            {
              id: 'q_2',
              number: 2,
              content: 'Cho parabol $(P): y = ax^2 + bx + c$ có đồ thị trong sơ đồ iMath bên dưới. Tọa độ đỉnh $I$ của parabol là:',
              image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23f8fafc"/><line x1="40" y1="200" x2="360" y2="200" stroke="%23334155" stroke-width="2"/><line x1="200" y1="20" x2="200" y2="220" stroke="%23334155" stroke-width="2"/><path d="M 80 40 Q 200 220 320 40" fill="none" stroke="%232563eb" stroke-width="3"/><circle cx="200" cy="130" r="5" fill="%23dc2626"/><text x="212" y="135" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23dc2626">Đỉnh I(2; -1)</text><text x="350" y="195" font-family="sans-serif" font-size="12">x</text><text x="205" y="30" font-family="sans-serif" font-size="12">y</text></svg>',
              options: [
                { key: 'A', text: '$I(2; -1)$' },
                { key: 'B', text: '$I(-2; 1)$' },
                { key: 'C', text: '$I(0; -1)$' },
                { key: 'D', text: '$I(2; 0)$' }
              ],
              correctAnswer: 'A',
              explanation: 'Dựa vào sơ đồ iMath, điểm thấp nhất của parabol là $I(2; -1)$.'
            },
            {
              id: 'q_3',
              number: 3,
              content: 'Giá trị nhỏ nhất của hàm số $f(x) = x^2 - 4x + 5$ trên đoạn $[0; 3]$ bằng:',
              image: null,
              options: [
                { key: 'A', text: '$1$' },
                { key: 'B', text: '$2$' },
                { key: 'C', text: '$5$' },
                { key: 'D', text: '$0$' }
              ],
              correctAnswer: 'A',
              explanation: 'Ta có $f(x) = (x - 2)^2 + 1 \\ge 1$. Đỉnh $x = 2 \\in [0; 3]$ nên $\\min f(x) = f(2) = 1$.'
            }
          ],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        this.saveRooms([defaultRoom]);
        this.setActiveRoomId(defaultRoom.id);
      }
    }

    getAllRooms() {
      try {
        const raw = localStorage.getItem(this.keyRooms);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveRooms(rooms) {
      localStorage.setItem(this.keyRooms, JSON.stringify(rooms));
    }

    getActiveRoom() {
      const rooms = this.getAllRooms();
      const id = localStorage.getItem(this.keyActiveRoom);
      return rooms.find(r => r.id === id) || rooms[0] || null;
    }

    setActiveRoomId(id) {
      localStorage.setItem(this.keyActiveRoom, id);
    }

    createRoom(title, subject = 'Toán học', grade = '10') {
      const rooms = this.getAllRooms();
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      const newRoom = {
        id: 'room_' + Date.now(),
        pin: pin,
        title: title || 'Phòng học mới - ' + TEACHER_PROFILE.school,
        subject: subject,
        grade: grade,
        teacher: TEACHER_PROFILE,
        settings: {
          timePerQuestion: 30,
          shuffleQuestions: true,
          strictMode: true,
          gameMode: 'nhanh-chan-vao-lop'
        },
        roster: [
          { id: 'st_1', name: "Nguyễn Văn An", shortName: "An", gender: "nam", avatarIndex: 0, status: "ready", score: 0, violations: 0 },
          { id: 'st_2', name: "Trần Thị Bích", shortName: "Bích", gender: "nu", avatarIndex: 1, status: "ready", score: 0, violations: 0 },
          { id: 'st_3', name: "Lê Hoàng Long", shortName: "Long", gender: "nam", avatarIndex: 2, status: "ready", score: 0, violations: 0 },
          { id: 'st_4', name: "Phạm Minh Thư", shortName: "Thư", gender: "nu", avatarIndex: 3, status: "ready", score: 0, violations: 0 }
        ],
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      rooms.unshift(newRoom);
      this.saveRooms(rooms);
      this.setActiveRoomId(newRoom.id);
      return newRoom;
    }

    updateActiveRoom(updater) {
      const rooms = this.getAllRooms();
      const id = localStorage.getItem(this.keyActiveRoom);
      const idx = rooms.findIndex(r => r.id === id);
      if (idx !== -1) {
        updater(rooms[idx]);
        rooms[idx].updatedAt = Date.now();
        this.saveRooms(rooms);
      }
    }

    // Helper: Standardize Vietnamese full name into short call name
    static extractShortName(fullName) {
      if (!fullName) return '';
      const parts = fullName.trim().split(/\s+/);
      return parts[parts.length - 1] || fullName;
    }
  }

  global.TEACHER_PROFILE = TEACHER_PROFILE;
  global.EyStorageEngine = new StorageEngine();
})(typeof window !== 'undefined' ? window : global);
