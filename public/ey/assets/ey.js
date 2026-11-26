/**
 * EY - Nền tảng Trí Tuệ Nhân Tạo & Game Học Tập Tương Tác
 * Thiết kế & Phát triển bởi: Thầy Nguyễn Mạnh Hùng · MHEdu
 * Liên hệ Zalo: 0965.908.084 · Email: nmh28691@gmail.com · FB: fb.com/doiten234
 */

// Audio Synthesizer using Web Audio API (Offline, Zero-dependency)
const soundFx = {
  ctx: null,
  enabled: true,
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  },
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },
  playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.25) {
    if (!this.enabled) return;
    try {
      this.resume();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  correct() {
    this.playTone(523.25, 'sine', 0.12, 0.3);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.3), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.35), 200);
  },
  wrong() {
    this.playTone(220, 'sawtooth', 0.2, 0.35);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.3, 0.4), 150);
  },
  whistle() {
    this.playTone(880, 'triangle', 0.15, 0.35);
    setTimeout(() => this.playTone(1760, 'triangle', 0.3, 0.45), 150);
  },
  tick() {
    this.playTone(1000, 'square', 0.03, 0.08);
  },
  fanfare() {
    [523, 659, 784, 1046].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.3), idx * 120);
    });
  },
  zaloRing() {
    if (!this.enabled) return;
    const notes = [659.25, 783.99, 880, 987.77, 1046.5, 987.77];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.16, 0.25), idx * 160);
    });
  },
  dogBark() {
    if (!this.enabled) return;
    this.playTone(280, 'sawtooth', 0.12, 0.35);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.18, 0.35), 70);
    setTimeout(() => {
      this.playTone(300, 'sawtooth', 0.12, 0.35);
      setTimeout(() => this.playTone(240, 'sawtooth', 0.18, 0.35), 70);
    }, 280);
  },
  wind() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      filter.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.8);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch(e) {}
  },
  explosion() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.7);
    } catch (e) {}
  },
  stamp() {
    this.playTone(160, 'square', 0.15, 0.4);
  },
  slap() {
    this.playTone(900, 'triangle', 0.05, 0.35);
    setTimeout(() => this.playTone(400, 'sawtooth', 0.08, 0.25), 30);
  }
};
window.soundFx = soundFx;

// Default Classroom Data
const defaultRoster = [
  "Khánh Linh", "Hoàng Long", "Phương Anh", "Mạnh Hùng", "Hải Yến", 
  "Bảo Diệp", "Quang Huy", "Mai Anh", "Gia Bảo", "Thùy Linh",
  "Đức Anh", "Minh Tuấn", "Bảo Châu", "Thanh Trúc", "Đức Long",
  "Ngọc Hân", "Anh Dũng", "Kim Ngân", "Hoàng Nam", "Văn Sơn",
  "Hữu Thắng", "Bích Thảo", "Trọng Khôi", "Như Quỳnh", "Thanh Hà"
];

const defaultQuestions = [
  { q: "8 + 7 = ?", a: ["15", "13", "16", "14"], c: 0 },
  { q: "Số nguyên tố chẵn duy nhất là số nào?", a: ["0", "2", "4", "6"], c: 1 },
  { q: "Đạo hàm của hàm số y = x² là gì?", a: ["2x", "x", "2", "x²"], c: 0 },
  { q: "Hình chóp tứ giác đều có bao nhiêu mặt phẳng đối xứng?", a: ["2", "4", "6", "8"], c: 1 },
  { q: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?", a: ["TP. Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Huế"], c: 2 },
  { q: "Chiến thắng Điện Biên Phủ diễn ra vào năm nào?", a: ["1945", "1954", "1975", "1986"], c: 1 },
  { q: "Nguyên tố hóa học nào có ký hiệu là Fe?", a: ["Vàng", "Bạc", "Sắt", "Đồng"], c: 2 },
  { q: "Tích phân ∫ (2x) dx từ 0 đến 2 bằng bao nhiêu?", a: ["2", "4", "6", "8"], c: 1 },
  { q: "Hàm số y = sin(x) có chu kỳ tuần hoàn là bao nhiêu?", a: ["π", "2π", "π/2", "4π"], c: 1 },
  { q: "Tập hợp các số thực ký hiệu là gì?", a: ["N", "Z", "Q", "R"], c: 3 }
];

// Catalog of Modules (Matching PomyAI structure)
const EY_CATALOG = {
  congCu: [
    {
      id: "ngan-hang-cau-hoi",
      title: "Tải Ngân Hàng Câu Hỏi 12 Môn & Xuất Đề Word",
      desc: "Kho 14.271+ câu hỏi chuẩn GDPT 2018 (Phần I MCQ, Phần II Đúng/Sai, Phần III Ngắn), Sổ chọn chuyên đề 4 mức độ & Xuất Word VIP (.docx).",
      badge: "VIP4 · 14.271+ Câu",
      icon: "📚",
      color: "#d97706",
      bg: "#fef3c7",
      image: "modules/quiz.webp"
    },
    {
      id: "ra-de",
      title: "Ra đề theo ma trận",
      desc: "Xây dựng ma trận, bản đặc tả chuẩn CV 7991/QĐ 764, chọn phạm vi SGK Kết nối tri thức và xuất Word, Excel.",
      badge: "Đang phát triển",
      icon: "📋",
      color: "#0284c7",
      bg: "#e0f2fe",
      image: "modules/worksheet.webp"
    },
    {
      id: "cham-phieu",
      title: "Chấm phiếu trắc nghiệm",
      desc: "Quét và chấm phiếu trả lời trắc nghiệm chuẩn CV 1239 (4 phần, 40/8/6 câu), phân tích phổ điểm.",
      badge: "Đang phát triển",
      icon: "✅",
      color: "#0d9488",
      bg: "#ccfbf1",
      image: "modules/quiz.webp"
    },
    {
      id: "de-pdf",
      title: "Tải đề có sẵn (PDF)",
      desc: "Tải đề dạng PDF, hệ thống tự động bóc tách câu hỏi, thiết lập đáp án và chuyển vào ngân hàng đề lớp học.",
      badge: "Mới",
      icon: "📄",
      color: "#0ea5e9",
      bg: "#e0f2fe",
      image: "modules/worksheet.webp"
    },
    {
      id: "trac-nghiem",
      title: "Trắc nghiệm AI",
      desc: "Soạn đề bằng AI hoặc file có sẵn, giao bài trực tuyến, tự động xáo trộn đề và chấm điểm tức thì.",
      badge: "Phổ biến",
      icon: "🎯",
      color: "#10b3a3",
      bg: "#e6f7f4",
      image: "modules/quiz.webp"
    },
    {
      id: "phieu-hoc-tap",
      title: "Phiếu học tập",
      desc: "Tạo phiếu bài tập theo mẫu chuẩn sư phạm bằng AI, xuất file PDF in ấn kèm đáp án và hướng dẫn giải.",
      badge: "",
      icon: "📝",
      color: "#6366f1",
      bg: "#eef2ff",
      image: "modules/worksheet.webp"
    },
    {
      id: "cham-tu-luan",
      title: "Chấm tự luận AI",
      desc: "Quét ảnh bài làm viết tay của học sinh, AI nhận diện và chấm theo barem điểm chi tiết kèm lời nhận xét.",
      badge: "",
      icon: "🔍",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      image: "modules/quiz.webp"
    },
    {
      id: "thi-truc-tuyen",
      title: "Thi trực tuyến",
      desc: "Tổ chức kiểm tra trực tuyến có giám sát chống gian lận, tự động đảo đề và khóa màn hình thi.",
      badge: "",
      icon: "⏱️",
      color: "#ec4899",
      bg: "#fdf2f8",
      image: "modules/worksheet.webp"
    },
    {
      id: "sa-ban-lich-su",
      title: "Sa bàn Lịch sử",
      desc: "Mô phỏng trực quan các chiến dịch lịch sử tiêu biểu (Điện Biên Phủ, Chiến dịch HCM) qua sa bàn 3D tương tác.",
      badge: "Thử nghiệm",
      icon: "🛡️",
      color: "#f59e0b",
      bg: "#fef3c7",
      image: "modules/land-arena-avatar-v2.webp"
    },
    {
      id: "phong-trao",
      title: "Quản lý phong trào",
      desc: "Chấm điểm nề nếp, theo dõi thi đua và xếp hạng phong trào rèn luyện chuyên cần theo tuần.",
      badge: "",
      icon: "🏆",
      color: "#eab308",
      bg: "#fef9c3",
      image: "modules/phong-trao.webp"
    }
  ],
  troChoi: [
    {
      id: "hai-chien-toa-do",
      title: "Hải chiến tọa độ",
      desc: "Đại chiến tàu ngầm & chiến hạm trên hệ trục tọa độ Oxy! Trả lời câu hỏi nhận lượt bắn, dùng Radar soi vùng 3×3, né Thủy lôi & săn Rương quà!",
      badge: "MỚI 🔥",
      image: "modules/hai-chien-toa-do-avatar-v1.jpg",
      mode: "battle"
    },
    {
      id: "day-gay",
      title: "Đẩy gậy quyết chiến",
      desc: "Võ đài đẩy gậy cổ truyền 2 đội! Trả lời đúng để dồn sức đẩy gậy, bùng nổ hào quang tới Hóa Thần. Đẩy đối thủ bật ra khỏi vòng tròn là thắng!",
      badge: "MỚI 🔥",
      image: "modules/stick-push-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "keo-co",
      title: "Kéo co",
      desc: "Cuộc thi kéo co 2 đội (Đội A vs Đội B) tranh tài trả lời nhanh, đội trả lời đúng sẽ kéo dây về phía mình!",
      badge: "HOT 🔥",
      image: "modules/tug-of-war-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "thu-thanh",
      title: "Thủ thành",
      desc: "2 toà thành đối đầu với 100 HP, trả lời đúng phóng tên và pháo bảo vệ thành và hạ gục đối thủ!",
      badge: "HOT 🔥",
      image: "modules/castle-defense-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "xay-nha",
      title: "Xây nhà",
      desc: "Thi xây tháp cao tầng vượt chướng ngại vật, quái vật King Kong, Hổ, Gấu, Sói rình rập phá nhà!",
      badge: "Mới",
      image: "modules/build-house-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "dai-chien-robot",
      title: "Đại chiến robot",
      desc: "Võ đài chiến binh Robot tương lai 2 - 4 đội, tích lũy pin năng lượng và kích hoạt Đấm, Laser, Rocket, Tuyệt chiêu, Khiên chắn!",
      badge: "HOT 🔥",
      image: "modules/robot-war-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "chiem-dat",
        title: "Chiếm đất",
        desc: "Đại chiến nông trại 2 - 4 đội, trả lời đúng để chiếm các thửa đất, cướp lượt đối thủ và mở rộng lãnh địa!",
        badge: "MỚI 🔥",
      image: "modules/land-arena-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "dao-bang",
      title: "Đảo băng",
      desc: "Sân băng trơn trượt tan chảy theo thời gian, giữ thăng bằng và vượt câu hỏi để trụ lại cuối cùng.",
      badge: "",
      image: "modules/melting-ice-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "duong-dua",
      title: "Đường đua siêu tốc",
      desc: "Đua xe địa hình vượt núi, mỗi chặng dừng trả lời câu hỏi để tăng tốc Nitro về đích đầu tiên.",
      badge: "",
      image: "modules/mountain-race-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "buc-tranh-bi-an",
      title: "Bức tranh bí ẩn",
      desc: "Lật mở từng mảnh ghép che giấu bức tranh chủ đề, giải mã ô chữ và đoán hình ảnh bí ẩn.",
      badge: "Đoán tranh bí ẩn 🎨",
      image: "modules/mystery-picture-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "xa-thu",
      title: "Xạ thủ thiện xạ",
      desc: "Bắn trúng hồng tâm câu hỏi, ngắm bắn chuẩn xác và giành điểm số tuyệt đối cho đội nhà.",
      badge: "Bắn bia kịch tính 🎯",
      image: "modules/sniper-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "ten-lua-dinh-menh",
      title: "Tên lửa định mệnh",
      desc: "Đếm ngược phóng tên lửa thám hiểm không gian, nạp nhiên liệu bằng các câu trả lời chính xác.",
      badge: "",
      image: "modules/fate-rocket-avatar-v2.webp",
      mode: "battle"
    }
  ],
  goiTen: [
    {
      id: "ca-lop-oi-thoat-game",
      alias: "thay-kiem-tra-vo",
      title: "Thầy Kiểm Tra Vở",
      desc: "Lớp bốn dãy, thầy (cô) đi dọc các lối kiểm tra vở. Thầy tới gần ai, người đó ngồi im thót tim; có bạn được khen, có bạn bị 'Hửm…?' một lúc mới thở phào. Lần dừng cuối, thầy đọc vở và mời bạn đó lên bảng trình bày.",
      badge: "MỚI 🔥",
      icon: "📚",
      image: "modules/class-escape-avatar-v3.webp",
      mode: "picker"
    },
    {
      id: "chuyen-do-sang-song",
      alias: "chuyen-do",
      title: "Chuyến Đò Sang Sông",
      desc: "Người lái đò tri thức chèo thuyền vượt qua ghềnh thác giông bão. Sóng vỗ dập dềnh, mưa dông kịch tính. Em nào cập bờ tri thức sẽ được mời lên bảng!",
      badge: "MỚI 🔥",
      icon: "⛵",
      image: "modules/ferry-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "khoai-nong-bong-tay",
      alias: "khoai-nong",
      title: "Khoai Nóng Bỏng Tay",
      desc: "Cả lớp chuyền tay nhau củ khoai nóng hổi trên sân trường náo nhiệt. Tiếng chuông reo lên báo hết giờ, em nào cầm khoai bỏng tay sẽ lên bảng!",
      badge: "MỚI 🔥",
      icon: "🥔",
      image: "modules/hot-potato-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "nhay-du-dao-hoang",
      title: "Nhảy dù đảo hoang",
      desc: "Cả lớp đứng trên đỉnh núi cùng nhảy và lượn dù xuống thung lũng. Gió xoáy, chim bay, va chạm. Em nào đáp đất trước thì lên bảng!",
      badge: "Kịch tính 🪂",
      icon: "🪂",
      image: "modules/skydive-avatar-v3.webp",
      mode: "picker"
    },
    {
      id: "chay-tron-thay-co",
      title: "Chạy trốn thầy cô",
      desc: "Cả lớp chạy trốn Sổ Đầu Bài trên sân trường. Ai chạy vào Cửa Lớp An Toàn để thoát, người chậm chân quên giày bị gọi tên!",
      badge: "Hài hước 🏃",
      icon: "🏃",
      image: "modules/boss-chase-avatar-v3.webp",
      mode: "picker"
    },
    {
      id: "co-goi-ve-nha",
      title: "Cô gọi về nhà",
      desc: "Màn hình Zalo của cô hiện lên trước lớp. Con trỏ dò từng tên phụ huynh, đổ chuông video call. Phụ huynh em nào bắt máy, em đó lên bảng!",
      badge: "Thót tim 📞",
      icon: "📞",
      image: "modules/parent-call-avatar-v3.webp",
      mode: "picker"
    },
    {
      id: "cuong-thi",
      alias: "dai-nao-nghia-trang",
      title: "Cương thi",
      desc: "Cả lớp hóa thân thành những cương thi chibi tinh nghịch. Pháp sư xuất hiện niệm chú triệu hồi linh phù ngẫu nhiên chọn bạn lên bảng kiểm tra bài cũ!",
      badge: "Cực cuốn 👻",
      icon: "👻",
      image: "modules/linh-phu-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "muc-oi-dung-day",
      title: "Mực ơi, Đừng dậy! (Bản Mới Chibi)",
      desc: "Phiên bản Cổng trường Chibi mới: rón rén qua cổng, Cún đuổi rớt dép, kéo gấu quần, giả ngủ, leo cây, bắt nhầm & nhảy ăn mừng!",
      badge: "Mới · Chibi 🐾",
      icon: "🐕",
      image: "modules/dog-chase-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "muc-oi-dung-day-classic",
      title: "Mực ơi, Đừng dậy! (Bản Cũ)",
      desc: "Phiên bản ngõ hẻm cổ điển: cả đoàn rón rén đi qua chú chó Mực đang ngủ, Mực tỉnh dậy gầm gừ đuổi cả lớp chạy mất dép!",
      badge: "Bản Cũ 🐕",
      icon: "🐶",
      image: "modules/dog-chase-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "u-tim-tron-tim",
      title: "Ú Tim - Trốn Tìm",
      desc: "Cả lớp rón rén đi trốn sau lưng người canh (Mực, Cô giáo, Thầy giáo, Công chúa, Bà cụ, Siêu nhân)… Đếm xong quay lại rượt bắt ngẫu nhiên 1 bạn trả bài!",
      badge: "HOT 🔥",
      icon: "🙈",
      image: "modules/u-tim-tron-tim-avatar-v1.png",
      mode: "picker"
    },
    {
      id: "choc-xoai-cham-muoi",
      title: "Chọc xoài chấm muối",
      desc: "Mỗi bạn là một quả xoài trên cây. Bọn trẻ dưới gốc cầm sào chọc rụng quả rơi trúng đĩa muối tôm Tây Ninh là người lên bảng!",
      badge: "Chua cay 🥭",
      icon: "🥭",
      image: "modules/mango-poke-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "ca-xom-tron-tra-bai",
      title: "Cả xóm trốn trả bài",
      desc: "Mỗi bạn một căn nhà trong xóm. Gà công an chạy xe máy đi tuần, xe dừng trước nhà ai, người đó nhận giấy triệu tập lên bảng!",
      badge: "Sôi nổi 🛵",
      icon: "🛵",
      image: "modules/village-summon-avatar-v1.webp",
      mode: "picker"
    },
    {
      id: "thien-thach-diem-danh",
      title: "Thiên thạch điểm danh",
      desc: "Giờ tan học, bão thiên thạch rơi xuống phố, cả lớp chạy toán loạn. Viên thiên thạch cuối cùng trúng ai, người đó lên bảng!",
      badge: "Hủy diệt ☄️",
      icon: "☄️",
      image: "modules/meteor-avatar-v1.webp",
      mode: "picker"
    }
  ],
  leHoi: [
    {
      id: "day-gay",
      title: "Đẩy gậy quyết chiến",
      desc: "Võ đài đẩy gậy cổ truyền 2 đội! Trả lời đúng để dồn sức đẩy gậy, bùng nổ hào quang tới Hóa Thần. Đẩy đối thủ bật ra khỏi vòng tròn là thắng!",
      badge: "MỚI 🔥",
      image: "modules/stick-push-avatar-v2.webp",
      mode: "battle"
    },
    {
      id: "banh-trung-thu",
      title: "Bánh trung thu",
      desc: "Lễ hội trăng rằm, làm bánh dẻo bánh nướng và trả lời câu đố đêm Trung Thu.",
      badge: "Lễ hội 🥮",
      image: "modules/mooncake-press.webp",
      mode: "battle"
    },
    {
      id: "tranh-bep-cung-trang",
      title: "Tranh bếp Cung Trăng",
      desc: "Cuộc thi trổ tài nấu nướng trên Cung Trăng cùng Chú Cuội và Chị Hằng.",
      badge: "Lễ hội 🌙",
      image: "modules/moon-kitchen.webp",
      mode: "battle"
    },
    {
      id: "dap-thu-bong",
      title: "Trò Bí Ngô (Đập Bí Ngô)",
      desc: "Hai đội thay nhau đập bí ngô: ra kẹo, câu hỏi trắc nghiệm, bí may mắn hay ma cướp kẹo! Đội nhiều kẹo hơn thắng.",
      badge: "Lễ hội 🎃",
      image: "modules/plush-smash-avatar.png",
      mode: "battle"
    }
  ]
};

// Global State
let currentTab = 'congCu';
let classRoster = JSON.parse(localStorage.getItem('ey_roster') || 'null') || [...defaultRoster];
let questionsList = JSON.parse(localStorage.getItem('ey_questions') || 'null') || [...defaultQuestions];

// UI Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderContent('congCu');
  setupEventListeners();
  applyTheme();
});

function setupEventListeners() {
  // Dark Mode Toggle
  const userProfile = document.querySelector('.user-profile');
  if (userProfile) {
    userProfile.style.cursor = 'pointer';
    userProfile.title = 'Nhấn để xem Menu Tài khoản / Đăng nhập';
    userProfile.addEventListener('click', toggleProfileMenu);
  }
  updateUserProfileDisplay();
  window.addEventListener('ey:auth-change', () => {
    updateUserProfileDisplay();
    renderNav();
    if (window.EyAuth && window.EyAuth.isStudent()) {
      switchTab('troChoiHanhTrinh');
    }
  });

  const btnDark = document.getElementById('btn-dark-toggle');
  if (btnDark) {
    btnDark.addEventListener('click', toggleTheme);
  }

  // Coffee Donate Modal
  const btnCoffee = document.getElementById('btn-coffee');
  if (btnCoffee) {
    btnCoffee.addEventListener('click', () => {
      document.getElementById('coffee-modal').classList.add('open');
    });
  }

  // Close modals on click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('btn-close-modal')) {
        modal.classList.remove('open');
      }
    });
  });
}

function applyTheme() {
  const isDark = localStorage.getItem('ey_theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const txt = document.getElementById('theme-status-text');
  if (txt) txt.textContent = isDark ? 'Chế độ: Tối' : 'Chế độ: Sáng';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ey_theme', next);
  applyTheme();
}

function renderNav() {
  const isStudent = window.EyAuth && window.EyAuth.isStudent();
  let navItems;
  if (isStudent) {
    navItems = [
      { id: 'hocTap', label: 'Học tập & Sổ tay', icon: '📖' },
      { id: 'troChoiHanhTrinh', label: 'Trò chơi hành trình', icon: '🧭' },
      { id: 'troChoi', label: 'Trò chơi đối kháng', icon: '🎮' },
      { id: 'games2', label: 'Kho 24 Trò chơi Games 2', icon: '🕹️' },
      { id: 'goiTen', label: 'Trò chơi lớp học', icon: '🎲' },
      { id: 'leHoi', label: 'Trò chơi lễ hội', icon: '🏮' }
    ];
  } else {
    navItems = [
      { id: 'cms', label: 'Quản trị Giáo viên (CMS)', icon: '🎓' },
      { id: 'congCu', label: 'Công cụ Giáo viên & AI', icon: '🛠️' },
      { id: 'hocTap', label: 'Tài liệu & Sổ tay Toán', icon: '📖' },
      { id: 'troChoi', label: 'Trò chơi đối kháng', icon: '🎮' },
      { id: 'games2', label: 'Kho 24 Trò chơi Games 2', icon: '🕹️' },
      { id: 'goiTen', label: 'Trò chơi gọi tên', icon: '🎲' },
      { id: 'leHoi', label: 'Trò chơi lễ hội', icon: '🏮' },
      { id: 'troChoiHanhTrinh', label: 'Trò chơi hành trình', icon: '🧭' },
      { id: 'lopHoc', label: 'Quản lý lớp học', icon: '🏫' },
      { id: 'phanHoi', label: 'Phản hồi & Tác giả', icon: '💬' }
    ];
  }

  const menu = document.getElementById('sidebar-menu');
  if (!menu) return;

  const roleBadgeHtml = isStudent ? `
    <div style="margin: 0 10px 12px 10px; padding: 10px 12px; background: rgba(13, 148, 136, 0.12); border: 1.5px solid rgba(13, 148, 136, 0.3); border-radius: 12px; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px;">👨‍🎓</span>
      <div>
        <div style="font-size: 11.5px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px;">Chế độ Học sinh</div>
        <div style="font-size: 10.5px; color: var(--text-muted, #64748b);">Chỉ Xem · Học · Chơi trò chơi</div>
      </div>
    </div>
  ` : `
    <div style="margin: 0 10px 12px 10px; padding: 8px 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 16px;">👨‍🏫</span>
        <span style="font-size: 11.5px; font-weight: 800; color: #d97706;">Quyền Giáo viên</span>
      </div>
      <button onclick="window.EyAuth.switchRole('student')" style="padding: 3px 8px; font-size: 10px; font-weight: 700; background: #0d9488; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Làm HS</button>
    </div>
  `;
  menu.innerHTML = roleBadgeHtml + navItems.map(item => `
    <div class="nav-item ${item.id === currentTab ? 'active' : ''}" onclick="switchTab('${item.id}')">
      <span class="icon">${item.icon}</span>
      <span>${item.label}</span>
    </div>
  `).join('');
}

window.switchTab = function (tabId) {
  const isStudent = window.EyAuth && window.EyAuth.isStudent();
  if (isStudent && (tabId === 'cms' || tabId === 'congCu' || tabId === 'lopHoc')) {
    alert('⚠️ Ở chế độ Học sinh, bạn chỉ có thể Xem, Học và Chơi trò chơi!\nCác tính năng Quản trị / Soạn đề dành riêng cho Giáo viên.');
    tabId = 'hocTap';
  }
  currentTab = tabId;
  renderNav();
  renderContent(tabId);
};

function renderContent(tabId) {
  const container = document.getElementById('content-area');
  if (!container) return;

  if (tabId === 'cms') {
    if (window.TeacherDashboard) {
      window.TeacherDashboard.render(container);
    }
    return;
  }

  if (tabId === 'hocTap') {
    renderHocTap(container);
    return;
  }

  if (tabId === 'games2') {
    renderGames2View(container);
    return;
  }

  if (tabId === 'troChoiHanhTrinh') {
    if (window.EyStudentUI) {
      window.EyStudentUI.render(container);
    }
    return;
  }

  if (tabId === 'lopHoc') {
    if (window.EyClassUI) {
      window.EyClassUI.render(container);
    } else {
      renderClassManager(container);
    }
    return;
  }

  if (tabId === 'phanHoi') {
    renderAuthorFeedback(container);
    return;
  }

  const items = EY_CATALOG[tabId] || [];
  const titles = {
    congCu: { t: "Công cụ Giáo viên & AI", d: "Trợ lý thiết kế đề thi, chấm phiếu trắc nghiệm, sa bàn lịch sử và phiếu học tập tự động." },
    troChoi: { t: "Trò chơi Đấu Đội & Tương Tác", d: "Các game thi đấu 2 đội (Đội A vs Đội B) sôi động, gắn liền câu hỏi kiến thức." },
    goiTen: { t: "Trò chơi Gọi Tên Ngẫu Nhiên", d: "Vòng quay và minigame gọi tên học sinh lên bảng đầy bất ngờ và hào hứng." },
    leHoi: { t: "Trò chơi Lễ Hội & Sự Kiện", d: "Chủ đề Trung Thu, Lễ hội thiếu nhi và trò chơi dân gian tương tác." }
  };

  const info = titles[tabId] || { t: "Danh mục", d: "" };

  container.innerHTML = `
    <div class="section-header">
      <h2>${info.t}</h2>
      <p>${info.d}</p>
    </div>
    <div class="grid-cards">
      ${items.map(item => `
        <div class="app-card" onclick="openItem('${tabId}', '${item.id}')">
          <div class="card-cover">
            <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='modules/quiz.webp'">
            ${item.badge ? `<span class="card-badge ${item.badge.includes('HOT') ? 'hot' : 'dev'}">${item.badge}</span>` : ''}
            <button class="card-fav-btn" onclick="event.stopPropagation(); this.classList.toggle('active')">★</button>
          </div>
          <div class="card-body">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.desc}</p>
            <div class="card-action">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-muted)">
                ${item.mode === 'picker' ? '🎲 Gọi ngẫu nhiên' : item.mode === 'battle' ? '⚔️ Đấu 2 đội' : '⚡ AI Tool'}
              </span>
              <button class="btn-card-play">
                ${item.mode === 'picker' ? 'Gọi tên' : item.mode === 'battle' ? 'Vào chơi' : 'Mở công cụ'} →
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Open and launch tool or game
window.openItem = function (tabId, itemId) {
  soundFx.whistle();
  if (tabId === 'goiTen') {
    if (window.EyGameSessionManager) {
      window.EyGameSessionManager.renderLobby(document.getElementById('content-area'), itemId, () => renderContent(tabId));
    } else {
      launchPickerGame(itemId);
    }
  } else if (tabId === 'troChoi' || tabId === 'leHoi') {
    if ((itemId === 'hai-chien-toa-do' || itemId === 'keo-co' || itemId === 'xay-nha' || itemId === 'thu-thanh' || itemId === 'chiem-dat' || itemId === 'dai-chien-robot' || itemId === 'dao-bang' || itemId === 'duong-dua' || itemId === 'ten-lua-dinh-menh' || itemId === 'xa-thu' || itemId === 'buc-tranh-bi-an' || itemId === 'day-gay' || itemId === 'dap-thu-bong' || itemId === 'tranh-bep-cung-trang' || itemId === 'banh-trung-thu') && window.EyBattleSessionManager) {
      window.EyBattleSessionManager.renderLobby(document.getElementById('content-area'), itemId, () => renderContent(tabId));
    } else {
      launchBattleGame(itemId);
    }
  } else if (tabId === 'congCu') {
    launchAiTool(itemId);
  }
};

// ==========================================
// BATTLE GAME ENGINE (Kéo co, Thủ thành, Xây nhà, Robot, etc.)
// ==========================================
window.launchBattleGame = function (gameId) {
  if ((gameId === 'hai-chien-toa-do' || gameId === 'keo-co' || gameId === 'xay-nha' || gameId === 'thu-thanh' || gameId === 'chiem-dat' || gameId === 'dai-chien-robot' || gameId === 'dao-bang' || gameId === 'duong-dua' || gameId === 'ten-lua-dinh-menh' || gameId === 'xa-thu' || gameId === 'buc-tranh-bi-an' || gameId === 'day-gay' || gameId === 'dap-thu-bong' || gameId === 'tranh-bep-cung-trang' || gameId === 'banh-trung-thu') && window.EyBattleSessionManager) {
    const sessions = window.EyBattleSessionManager.getSessions(gameId);
    const session = (sessions && sessions[0]) || window.EyBattleSessionManager.getSession(gameId, `session_${gameId.replace(/-/g, '')}_default`);
    window.EyBattleSessionManager.launchFullscreenBattleGame(gameId, session);
    return;
  }

  const game = [...EY_CATALOG.troChoi, ...EY_CATALOG.leHoi].find(g => g.id === gameId);
  if (!game) return;

  const modal = document.getElementById('game-modal');
  const arena = document.getElementById('game-arena-content');
  const title = document.getElementById('game-modal-title');
  if (title) title.textContent = `🎮 ${game.title} - Thi đấu 2 Đội`;

  let currentQIndex = 0;
  let scoreA = 0;
  let scoreB = 0;
  let hpA = 100;
  let hpB = 100;
  let ropeOffset = 0; // -100 (A wins) to +100 (B wins)
  let timer = 25;
  let timerInterval = null;

  function renderBattleArena() {
    const q = questionsList[currentQIndex % questionsList.length];
    
    arena.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: #f0fdfa; overflow: hidden; position: relative;">
        <!-- Top Status Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #fff; border-bottom: 2px solid #ccfbf1;">
          <!-- Team A -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">A</div>
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #1e3a8a;">ĐỘI XANH (A)</div>
              <div style="font-size: 13px; font-weight: 700; color: #2563eb;">Điểm: ${scoreA} · Máu: ${hpA}%</div>
            </div>
          </div>

          <!-- Timer & Central Round Indicator -->
          <div style="text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">CÂU HỎI ${currentQIndex + 1} / ${questionsList.length}</div>
            <div style="font-size: 26px; font-weight: 900; color: #0d9488; font-variant-numeric: tabular-nums;" id="timer-display">${timer}s</div>
          </div>

          <!-- Team B -->
          <div style="display: flex; align-items: center; gap: 12px; text-align: right;">
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #991b1b;">ĐỘI ĐỎ (B)</div>
              <div style="font-size: 13px; font-weight: 700; color: #dc2626;">Điểm: ${scoreB} · Máu: ${hpB}%</div>
            </div>
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #dc2626; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">B</div>
          </div>
        </div>

        <!-- Question Box -->
        <div style="background: #ffffff; margin: 16px 24px 8px; padding: 18px 24px; border-radius: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 2px solid #0d9488;">
          <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; text-align: center;">${q.q}</h3>
        </div>

        <!-- Visual Stage Arena -->
        <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 60%, #86efac 60%, #4ade80 100%);">
          <img src="${game.image}" style="max-height: 85%; max-width: 90%; object-fit: contain; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); transition: transform 0.3s; transform: translateX(${ropeOffset * 2}px);" id="battle-hero-img">

          <!-- Dynamic Tension Indicator -->
          <div style="position: absolute; bottom: 20px; width: 60%; height: 12px; background: rgba(255,255,255,0.7); border-radius: 6px; overflow: hidden; border: 2px solid #fff;">
            <div style="height: 100%; width: 50%; background: #2563eb; float: left; transition: width 0.3s;" id="bar-a"></div>
            <div style="height: 100%; width: 50%; background: #dc2626; float: right; transition: width 0.3s;" id="bar-b"></div>
          </div>
        </div>

        <!-- Dual Team Answer Buttons Panel -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 16px 24px 20px; background: #ffffff; border-top: 2px solid #e2e8f0;">
          <!-- Team A Answers -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 800; font-size: 13px; color: #2563eb; display: flex; justify-content: space-between;">
              <span>ĐỘI A TRẢ LỜI:</span>
              <span>BẤM ĐÁP ÁN</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${q.a.map((opt, i) => `
                <button onclick="handleAnswer('A', ${i})" style="padding: 10px 14px; font-size: 14px; font-weight: 700; border-radius: 10px; border: 2px solid #93c5fd; background: #eff6ff; color: #1e3a8a; cursor: pointer; text-align: left; transition: all 0.15s;">
                  <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Team B Answers -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 800; font-size: 13px; color: #dc2626; display: flex; justify-content: space-between;">
              <span>ĐỘI B TRẢ LỜI:</span>
              <span>BẤM ĐÁP ÁN</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${q.a.map((opt, i) => `
                <button onclick="handleAnswer('B', ${i})" style="padding: 10px 14px; font-size: 14px; font-weight: 700; border-radius: 10px; border: 2px solid #fca5a5; background: #fef2f2; color: #991b1b; cursor: pointer; text-align: left; transition: all 0.15s;">
                  <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Reset timer
    clearInterval(timerInterval);
    timer = 25;
    timerInterval = setInterval(() => {
      timer--;
      const el = document.getElementById('timer-display');
      if (el) el.textContent = `${timer}s`;
      if (timer <= 5) soundFx.tick();
      if (timer <= 0) {
        clearInterval(timerInterval);
        soundFx.wrong();
        currentQIndex++;
        renderBattleArena();
      }
    }, 1000);
  }

  window.handleAnswer = function (team, ansIndex) {
    const q = questionsList[currentQIndex % questionsList.length];
    if (ansIndex === q.c) {
      soundFx.correct();
      if (team === 'A') {
        scoreA += 10;
        hpB = Math.max(0, hpB - 20);
        ropeOffset -= 25;
      } else {
        scoreB += 10;
        hpA = Math.max(0, hpA - 20);
        ropeOffset += 25;
      }
    } else {
      soundFx.wrong();
      if (team === 'A') hpA = Math.max(0, hpA - 10);
      else hpB = Math.max(0, hpB - 10);
    }

    // Check winner
    if (hpA <= 0 || hpB <= 0 || currentQIndex >= questionsList.length - 1) {
      clearInterval(timerInterval);
      soundFx.fanfare();
      const winner = scoreA > scoreB ? "ĐỘI XANH (A)" : scoreB > scoreA ? "ĐỘI ĐỎ (B)" : "HAI ĐỘI HÒA NHAU";
      arena.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; padding: 30px; text-align: center;">
          <div style="font-size: 72px; margin-bottom: 12px;">🏆</div>
          <h2 style="font-size: 32px; font-weight: 900; color: #0d9488; margin-bottom: 8px;">KẾT THÚC TRẬN ĐẤU!</h2>
          <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 18px;">CHÚC MỪNG: ${winner}!</h3>
          <p style="font-size: 16px; color: #64748b; margin-bottom: 24px;">Điểm số chung cuộc: Đội A (${scoreA} điểm) — Đội B (${scoreB} điểm)</p>
          <div style="display: flex; gap: 14px;">
            <button onclick="launchBattleGame('${gameId}')" style="padding: 12px 28px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">Chơi Lại Trận Mới 🔄</button>
            <button onclick="document.getElementById('game-modal').classList.remove('open')" style="padding: 12px 28px; background: #e2e8f0; color: #0f172a; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">Đóng Trò Chơi ✖️</button>
          </div>
        </div>
      `;
      return;
    }

    currentQIndex++;
    renderBattleArena();
  };

  modal.classList.add('open');
  renderBattleArena();
};

// ==========================================
// RANDOM STUDENT PICKER ENGINE (Đại náo nghĩa trang, Chạy trốn thầy cô, Nhảy dù, etc.)
// ==========================================
// ==========================================
// AI TEACHER TOOLS WORKFLOW
// ==========================================
window.launchAiTool = function (toolId) {
  if (toolId === 'ngan-hang-cau-hoi') {
    window.location.href = '/ngan-hang-cau-hoi/index.html';
    return;
  }
  const tool = EY_CATALOG.congCu.find(t => t.id === toolId);
  if (!tool) return;

  const modal = document.getElementById('game-modal');
  const arena = document.getElementById('game-arena-content');
  const title = document.getElementById('game-modal-title');
  if (title) title.textContent = `⚡ ${tool.title} - Trợ lý Sư Phạm MHEdu`;

  arena.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; background: #f8fafc; padding: 28px; overflow-y: auto;">
      <div style="background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: ${tool.bg}; color: ${tool.color}; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ${tool.icon}
          </div>
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: #0f172a;">${tool.title}</h2>
            <p style="font-size: 14px; color: #64748b;">${tool.desc}</p>
          </div>
        </div>
      </div>

      <!-- Tool Workspace Simulator -->
      <div style="background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; flex: 1;">
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #0f172a;">Cấu hình & Dữ liệu đầu vào:</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Môn học & Khối lớp:</label>
            <select style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px;">
              <option>Toán học - Lớp 10 (Kết nối tri thức)</option>
              <option>Toán học - Lớp 11 (Kết nối tri thức)</option>
              <option>Toán học - Lớp 12 (Kết nối tri thức)</option>
              <option>Vật lý - Lớp 11</option>
              <option>Hóa học - Lớp 10</option>
              <option>Ngữ văn - Lớp 12</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Quy chuẩn & Thông tư:</label>
            <select style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px;">
              <option>Công văn 7991/BGDĐT-GDTrH (Ma trận & Đặc tả đề)</option>
              <option>Quyết định 764/QĐ-BGDĐT (Cấu trúc định dạng đề 2025)</option>
              <option>Công văn 1239/BGDĐT-GDTrH (Chấm phiếu 4 phần)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Nội dung yêu cầu / Gợi ý cho AI:</label>
          <textarea style="width: 100%; height: 90px; padding: 12px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; font-family: inherit; resize: none;" placeholder="Ví dụ: Tạo ma trận đề kiểm tra giữa kỳ 1 gồm 12 câu trắc nghiệm nhiều lựa chọn, 4 câu đúng sai và 6 câu trả lời ngắn..."></textarea>
        </div>

        <div style="display: flex; gap: 12px;">
          <button onclick="simulateAiGenerate()" id="btn-ai-gen" style="padding: 12px 28px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">
            Thực Hiện Bằng AI ✨
          </button>
          <button onclick="alert('Đã tải mẫu ma trận đề chuẩn Bộ GD&ĐT (Word/Excel) thành công!')" style="padding: 12px 24px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">
            Xuất File Word / Excel 📥
          </button>
        </div>

        <div id="ai-result-box" style="margin-top: 20px; display: none; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; color: #166534; font-size: 14px; line-height: 1.6;">
          <strong>🎉 Hoàn tất phân tích & xử lý:</strong><br>
          Hệ thống đã xây dựng thành công bộ khung ma trận và bản đặc tả đáp ứng 100% chuẩn kiểm tra đánh giá của Bộ Giáo dục & Đào tạo. File đã sẵn sàng để giáo viên sử dụng trong giảng dạy và in ấn!
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

window.simulateAiGenerate = function () {
  const btn = document.getElementById('btn-ai-gen');
  const res = document.getElementById('ai-result-box');
  if (!btn || !res) return;

  btn.disabled = true;
  btn.textContent = 'Đang phân tích & khởi tạo... ⏳';
  soundFx.tick();

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Thực Hiện Bằng AI ✨';
    res.style.display = 'block';
    soundFx.correct();
  }, 1200);
};

// ==========================================
// CLASSROOM & QUESTIONS MANAGER
// ==========================================
function renderClassManager(container) {
  container.innerHTML = `
    <div class="section-header">
      <h2>🏫 Quản lý Lớp học & Ngân hàng Câu hỏi</h2>
      <p>Tùy chỉnh danh sách học sinh và bộ câu hỏi dùng trong các trò chơi gọi tên và thi đấu.</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <!-- Roster Box -->
      <div style="background: var(--bg-card); padding: 22px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>Danh sách học sinh (${classRoster.length})</span>
          <button onclick="resetRoster()" style="font-size: 12px; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">Đặt lại mẫu</button>
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Mỗi tên học sinh trên một dòng:</p>
        <textarea id="roster-textarea" style="width: 100%; height: 260px; padding: 12px; border-radius: 10px; border: 1px solid var(--border); font-family: inherit; font-size: 14px; resize: vertical; background: var(--bg-main); color: var(--text-main);">${classRoster.join('\n')}</textarea>
        <button onclick="saveRoster()" style="margin-top: 14px; width: 100%; padding: 10px; background: var(--primary); color: #fff; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;">Lưu Danh Sách Học Sinh 💾</button>
      </div>

      <!-- Question Bank Box -->
      <div style="background: var(--bg-card); padding: 22px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>Ngân hàng câu hỏi (${questionsList.length})</span>
          <button onclick="resetQuestions()" style="font-size: 12px; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">Đặt lại mẫu</button>
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Định dạng JSON hoặc danh sách câu hỏi trắc nghiệm:</p>
        <div style="max-height: 260px; overflow-y: auto; padding: 8px; background: var(--bg-main); border-radius: 10px; border: 1px solid var(--border); font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
          ${questionsList.map((q, idx) => `
            <div style="padding: 8px 12px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
              <strong>Câu ${idx + 1}:</strong> ${q.q}<br>
              <span style="color: var(--primary); font-weight: 600;">Đáp án đúng: ${q.a[q.c]}</span>
            </div>
          `).join('')}
        </div>
        <button onclick="alert('Ngân hàng câu hỏi đã được đồng bộ sẵn sàng cho mọi trò chơi!')" style="margin-top: 14px; width: 100%; padding: 10px; background: #0284c7; color: #fff; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;">Đồng Bộ Câu Hỏi Mới ⚡</button>
      </div>
    </div>
  `;
}

window.saveRoster = function () {
  const txt = document.getElementById('roster-textarea');
  if (!txt) return;
  const list = txt.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) {
    alert('Vui lòng nhập ít nhất 1 học sinh!');
    return;
  }
  classRoster = list;
  localStorage.setItem('ey_roster', JSON.stringify(classRoster));
  soundFx.correct();
  alert(`Đã lưu thành công ${classRoster.length} học sinh!`);
};

window.resetRoster = function () {
  classRoster = [...defaultRoster];
  localStorage.removeItem('ey_roster');
  renderContent('lopHoc');
  soundFx.whistle();
};

window.resetQuestions = function () {
  questionsList = [...defaultQuestions];
  localStorage.removeItem('ey_questions');
  renderContent('lopHoc');
  soundFx.whistle();
};

// ==========================================
// AUTHOR & FEEDBACK VIEW
// ==========================================
function renderAuthorFeedback(container) {
  container.innerHTML = `
    <div class="section-header">
      <h2>💬 Thông tin Tác giả & Hỗ trợ Kỹ thuật</h2>
      <p>Mọi đóng góp ý kiến, thắc mắc và yêu cầu nâng cấp xin vui lòng liên hệ trực tiếp.</p>
    </div>

    <div style="max-width: 680px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-lg); padding: 32px;">
      <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800;">
          H
        </div>
        <div>
          <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main);">Thầy Nguyễn Mạnh Hùng</h3>
          <p style="font-size: 14px; color: var(--primary); font-weight: 600;">Hệ sinh thái Giáo dục MHEdu</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 15px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--border);">
          <span style="font-size: 20px;">📱</span>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">SỐ ĐIỆN THOẠI & ZALO:</div>
            <a href="https://zalo.me/0965908084" target="_blank" style="font-weight: 800; color: #0284c7; text-decoration: none;">0965.908.084</a>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--border);">
          <span style="font-size: 20px;">✉️</span>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">EMAIL LIÊN HỆ:</div>
            <a href="mailto:nmh28691@gmail.com" style="font-weight: 800; color: #0d9488; text-decoration: none;">nmh28691@gmail.com</a>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--border);">
          <span style="font-size: 20px;">🌐</span>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">TRANG FACEBOOK CÁ NHÂN:</div>
            <a href="https://www.facebook.com/doiten234" target="_blank" style="font-weight: 800; color: #2563eb; text-decoration: none;">fb.com/doiten234</a>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <button onclick="document.getElementById('coffee-modal').classList.add('open')" style="padding: 12px 28px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; font-weight: 800; font-size: 15px; border: none; border-radius: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
          ☕ Mời tác giả ly cà phê (Ủng hộ dự án)
        </button>
      </div>
    </div>
  `;
}


// Hash routing support for modal quick buttons
function checkHash() {
  let hash = window.location.hash.replace('#', '');
  if (hash === 'tacGia') hash = 'phanHoi';
  if (hash && ['congCu', 'troChoi', 'goiTen', 'leHoi', 'lopHoc', 'phanHoi', 'hocTap', 'troChoiHanhTrinh', 'cms', 'games2'].includes(hash)) {
    window.switchTab(hash);
  }
}
window.addEventListener('hashchange', checkHash);
window.addEventListener('DOMContentLoaded', checkHash);
setTimeout(checkHash, 100);



// ==============================================================================
// 8 TRÒ CHƠI GỌI TÊN NGẪU NHIÊN - SIMULATION & INTERACTIVE ENGINES
// Mô phỏng chuẩn xác từ PomyAI (https://pomyai.com/gv/tro-choi-goi-ten/...)
// Tác giả: Thầy Nguyễn Mạnh Hùng - MHEdu (0965.908.084)
// ==============================================================================

window.launchPickerGame = function (gameId) {
  if (gameId === 'thay-kiem-tra-vo') gameId = 'ca-lop-oi-thoat-game';
  if (gameId === 'chuyen-do' || gameId === 'ferry') gameId = 'chuyen-do-sang-song';
  if (gameId === 'khoai-nong' || gameId === 'hot-potato') gameId = 'khoai-nong-bong-tay';
  if (gameId === 'dai-nao-nghia-trang') gameId = 'cuong-thi';
  if (gameId === 'luon-du-dinh-nui') gameId = 'nhay-du-dao-hoang';
  if (gameId === 'choc-xoai') gameId = 'choc-xoai-cham-muoi';
  if (gameId === 'thien-thach' || gameId === 'thien-thach-goi-ten') gameId = 'thien-thach-diem-danh';

  if (window.EyGameSessionManager) {
    const session = window.EyGameSessionManager.getSession(gameId, 'session_default');
    window.EyGameSessionManager.launchFullscreenGame(gameId, session);
    return;
  }

  // Clear any existing game timers/intervals
  if (window.__activePickerInterval) {
    clearInterval(window.__activePickerInterval);
    window.__activePickerInterval = null;
  }
  if (window.__activePickerTimeouts) {
    window.__activePickerTimeouts.forEach(t => clearTimeout(t));
    window.__activePickerTimeouts = [];
  } else {
    window.__activePickerTimeouts = [];
  }
  const safeTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    window.__activePickerTimeouts.push(id);
    return id;
  };

  const game = EY_CATALOG.goiTen.find(g => g.id === gameId);
  if (!game) return;

  const modal = document.getElementById('game-modal');
  const arena = document.getElementById('game-arena-content');
  const title = document.getElementById('game-modal-title');
  if (title) title.innerHTML = `<span style="margin-right: 6px;">${game.icon || '🎲'}</span> ${game.title} <span style="font-size: 13px; font-weight: 500; color: #64748b; margin-left: 8px;">(Sĩ số: ${classRoster.length} học sinh)</span>`;

  if (modal) modal.classList.add('open');
  if (arena) arena.innerHTML = '';

  // Setup soundFx resume on user interaction
  soundFx.resume();

  // Route to corresponding game renderer
  switch (gameId) {
    case 'nhay-du-dao-hoang':
      renderSkydiveGame(arena, game);
      break;
    case 'chay-tron-thay-co':
      renderBossChaseGame(arena, game);
      break;
    case 'co-goi-ve-nha':
      renderParentCallGame(arena, game);
      break;
    case 'cuong-thi':
    case 'dai-nao-nghia-trang':
      renderJiangshiGame(arena, game);
      break;
    case 'muc-oi-dung-day':
      renderDogChaseGame(arena, game, 'new');
      break;
    case 'muc-oi-dung-day-classic':
      renderDogChaseGame(arena, game, 'classic');
      break;
    case 'u-tim-tron-tim':
      renderUTimTronTimGame(arena, game);
      break;
    case 'choc-xoai-cham-muoi':
    case 'choc-xoai':
      if (window.EyGameSessionManager) {
        const session = window.EyGameSessionManager.getSession('choc-xoai-cham-muoi', 'session_default');
        window.EyGameSessionManager.launchFullscreenGame('choc-xoai-cham-muoi', session);
      } else {
        renderMangoPokeGame(arena, game);
      }
      break;
    case 'ca-xom-tron-tra-bai':
      renderVillageSummonGame(arena, game);
      break;
    case 'thien-thach-diem-danh':
    case 'thien-thach':
      if (window.EyGameSessionManager) {
        const session = window.EyGameSessionManager.getSession('thien-thach-diem-danh', 'session_default');
        window.EyGameSessionManager.launchFullscreenGame('thien-thach-diem-danh', session);
      } else {
        renderMeteorGame(arena, game);
      }
      break;
    default:
      renderJiangshiGame(arena, game);
      break;
  }
};

// Helper: Common Winner Modal Overlay
function showWinnerOverlay(arena, winnerName, subtitle, icon, bannerColor, onRetry) {
  soundFx.fanfare();
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: absolute; inset: 0; z-index: 100; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; animation: fadeIn 0.3s ease;';
  
  overlay.innerHTML = `
    <div style="font-size: 72px; margin-bottom: 12px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4)); animation: pulse 1s infinite alternate;">
      ${icon}
    </div>
    <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px;">
      KẾT QUẢ ĐIỂM DANH
    </div>
    <h2 style="font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #ffffff; margin: 0 0 10px; text-shadow: 0 4px 16px rgba(0,0,0,0.6);">
      ${winnerName}
    </h2>
    <div style="font-size: 16px; font-weight: 700; color: ${bannerColor || '#38bdf8'}; background: rgba(255,255,255,0.08); padding: 8px 24px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); margin-bottom: 28px; max-width: 90%;">
      ${subtitle}
    </div>
    <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;">
      <button id="btn-winner-retry" style="padding: 12px 28px; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #fff; font-weight: 800; font-size: 15px; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 20px rgba(13,148,136,0.4); display: flex; align-items: center; gap: 8px;">
        🔄 Chọn bạn tiếp theo
      </button>
      <button id="btn-winner-close" style="padding: 12px 24px; background: #334155; color: #fff; font-weight: 700; font-size: 15px; border: none; border-radius: 12px; cursor: pointer;">
        ✕ Thoát
      </button>
    </div>
  `;

  arena.appendChild(overlay);

  document.getElementById('btn-winner-retry').onclick = () => {
    overlay.remove();
    if (onRetry) onRetry();
  };
  document.getElementById('btn-winner-close').onclick = () => {
    closeGameModal();
  };
}

// ------------------------------------------------------------------------------
// 1. NHẢY DÙ ĐẢO HOANG (LƯỢN DÙ ĐỈNH NÚI)
// ------------------------------------------------------------------------------
function renderSkydiveGame(arena, game) {
  if (window.__activePickerCleanup) {
    try { window.__activePickerCleanup(); } catch (e) {}
    window.__activePickerCleanup = null;
  }

  const startSkydive = () => {
    if (typeof window.launchNhayDuDaoHoang === 'function') {
      window.__activePickerCleanup = window.launchNhayDuDaoHoang(arena, {
        classRoster: classRoster,
        onExit: () => {
          const modal = document.getElementById('game-modal');
          if (modal) modal.classList.remove('open');
        }
      });
    }
  };

  if (typeof window.launchNhayDuDaoHoang === 'function') {
    startSkydive();
  } else {
    const s = document.createElement('script');
    s.src = '/ey/games/nhay-du-dao-hoang.js';
    s.onload = startSkydive;
    document.head.appendChild(s);
  }
}

// ------------------------------------------------------------------------------
// 2. CHẠY TRỐN THẦY CÔ (NHANH CHÂN VÀO LỚP)
// ------------------------------------------------------------------------------
function renderBossChaseGame(arena, game) {
  if (window.__activePickerCleanup) {
    try { window.__activePickerCleanup(); } catch (e) {}
    window.__activePickerCleanup = null;
  }
  const options = {
    roster: window.classRoster,
    schoolName: 'TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG',
    teacherName: 'Thầy Hùng',
    teacherGender: 'male',
    onExit: () => {
      const modal = document.getElementById('game-modal');
      if (modal) modal.classList.remove('open');
    }
  };
  if (typeof window.launchChayTronThayCo === 'function') {
    window.__activePickerCleanup = window.launchChayTronThayCo(arena, options);
  } else {
    const s = document.createElement('script');
    s.src = '/ey/games/chay-tron-thay-co.js';
    s.onload = () => {
      if (typeof window.launchChayTronThayCo === 'function') {
        window.__activePickerCleanup = window.launchChayTronThayCo(arena, options);
      }
    };
    document.head.appendChild(s);
  }
}

// ------------------------------------------------------------------------------
// 3. CÔ GỌI VỀ NHÀ (ZALO VIDEO CALL)
// ------------------------------------------------------------------------------
function renderParentCallGame(arena, game) {
  if (window.__activePickerCleanup) {
    try { window.__activePickerCleanup(); } catch (e) {}
    window.__activePickerCleanup = null;
  }

  const startParentCall = () => {
    if (typeof window.launchCoGoiVeNha === 'function') {
      window.__activePickerCleanup = window.launchCoGoiVeNha(arena, {
        classRoster: classRoster,
        onExit: () => {
          const modal = document.getElementById('game-modal');
          if (modal) modal.classList.remove('open');
        }
      });
    }
  };

  if (typeof window.launchCoGoiVeNha === 'function') {
    startParentCall();
  } else {
    const s = document.createElement('script');
    s.src = '/ey/games/co-goi-ve-nha.js';
    s.onload = startParentCall;
    document.head.appendChild(s);
  }
}

// ------------------------------------------------------------------------------
// 4. ĐẠI NÁO NGHĨA TRANG (THỬ THÁCH LINH PHÙ)
// ------------------------------------------------------------------------------
function renderJiangshiGame(arena, game) {
  let isRolling = false;

  function init() {
    arena.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #fff; overflow: hidden; position: relative;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(30, 41, 59, 0.85); border-bottom: 1px solid #334155; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">👻</span>
            <span style="font-weight: 800; color: #38bdf8; font-size: 15px;">Thử Thách Linh Phù (Đại Náo Nghĩa Trang)</span>
            <span style="font-size: 12px; color: #94a3b8;">(Cương thi học sinh, lá linh phù phong ấn ai người đó lên bảng!)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-sound" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #475569; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; cursor: pointer;">🔊</button>
            <button id="btn-jiangshi-start" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #fff; border: none; border-radius: 10px; padding: 8px 22px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(217,119,6,0.3); display: flex; align-items: center; gap: 6px;">
              ▶ Triệu hồi linh phù
            </button>
          </div>
        </div>

        <!-- Spooky Graveyard Arena -->
        <div id="spooky-arena" style="flex: 1; position: relative; overflow-y: auto; padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 16px; align-content: start;"></div>
      </div>
    `;

    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn.onclick = () => {
      soundFx.enabled = !soundFx.enabled;
      soundBtn.textContent = soundFx.enabled ? '🔊' : '🔇';
    };

    const container = document.getElementById('spooky-arena');
    const startBtn = document.getElementById('btn-jiangshi-start');

    const jiangshis = classRoster.map((name, i) => {
      const card = document.createElement('div');
      card.className = 'jiangshi-char';
      card.style.cssText = 'background: rgba(30, 41, 59, 0.6); border: 2px solid #334155; border-radius: 14px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; transition: all 0.25s; cursor: pointer;';
      card.innerHTML = `
        <div style="font-size: 38px; line-height: 1; margin-bottom: 6px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">👻</div>
        <div style="font-weight: 800; font-size: 12px; color: #e2e8f0; line-height: 1.3;">${name}</div>
        <div class="talisman-slot" style="position: absolute; top: 10px; width: 22px; height: 38px; border-radius: 4px; display: none;"></div>
      `;
      container.appendChild(card);
      return { name, card };
    });

    startBtn.onclick = () => {
      if (isRolling) return;
      isRolling = true;
      startBtn.disabled = true;

      const winnerIdx = Math.floor(Math.random() * classRoster.length);
      const winner = classRoster[winnerIdx];

      let count = 0;
      const totalSteps = 30;
      const interval = setInterval(() => {
        jiangshis.forEach(j => {
          j.card.style.borderColor = '#334155';
          j.card.style.background = 'rgba(30, 41, 59, 0.6)';
          j.card.style.transform = 'scale(1)';
        });

        const activeIdx = (count + winnerIdx) % jiangshis.length;
        jiangshis[activeIdx].card.style.borderColor = '#f59e0b';
        jiangshis[activeIdx].card.style.background = 'rgba(245, 158, 11, 0.2)';
        jiangshis[activeIdx].card.style.transform = 'scale(1.08)';
        soundFx.tick();

        count++;
        if (count >= totalSteps) {
          clearInterval(interval);

          // Slap talisman onto winner
          jiangshis[winnerIdx].card.style.borderColor = '#ef4444';
          jiangshis[winnerIdx].card.style.background = 'rgba(239, 68, 68, 0.3)';
          jiangshis[winnerIdx].card.style.transform = 'scale(1.15)';
          jiangshis[winnerIdx].card.style.boxShadow = '0 0 30px #f59e0b';

          const slot = jiangshis[winnerIdx].card.querySelector('.talisman-slot');
          if (slot) {
            slot.style.display = 'block';
            slot.style.background = 'linear-gradient(180deg, #fde047 0%, #eab308 100%)';
            slot.style.border = '1px solid #ca8a04';
            slot.innerHTML = '<span style="font-size: 10px; color: #dc2626; font-weight: 900;">勅令</span>';
          }

          soundFx.slap();

          setTimeout(() => {
            showWinnerOverlay(
              arena,
              winner,
              '⚡ Linh phù đã phong ấn thành công! Mời bạn lên bảng kiểm tra bài cũ!',
              '📜',
              '#f59e0b',
              () => init()
            );
          }, 900);
        }
      }, 90);
    };
  }

  init();
}

// ------------------------------------------------------------------------------
// 5. MỰC ƠI, ĐỪNG DẬY! (HỖ TRỢ CẢ BẢN MỚI CHIBI & BẢN CŨ CỔ ĐIỂN)
// ------------------------------------------------------------------------------
function renderDogChaseGame(arena, game, variant = 'new') {
  if (window.__activePickerCleanup) {
    try { window.__activePickerCleanup(); } catch (e) {}
    window.__activePickerCleanup = null;
  }
  const fnName = variant === 'classic' ? 'launchMucOiDungDayClassic' : 'launchMucOiDungDay';
  const scriptSrc = variant === 'classic'
    ? '/ey/games/muc-oi-dung-day-classic.js?v=20261111_classic'
    : '/ey/games/muc-oi-dung-day.js?v=20261111_chibi';
  const start = () => {
    if (typeof window[fnName] === 'function') {
      window.__activePickerCleanup = window[fnName](arena, { roster: window.classRoster });
    }
  };
  if (typeof window[fnName] === 'function') {
    start();
  } else {
    const s = document.createElement('script');
    s.src = scriptSrc;
    s.onload = start;
    document.head.appendChild(s);
  }
}

function renderUTimTronTimGame(arena, game) {
  if (window.__activePickerCleanup) {
    try { window.__activePickerCleanup(); } catch (e) {}
    window.__activePickerCleanup = null;
  }
  const start = () => {
    if (typeof window.launchUTimTronTim === 'function') {
      window.__activePickerCleanup = window.launchUTimTronTim(arena, {
        roster: window.classRoster,
        gioiTinh: window.classGenders
      });
    }
  };
  if (typeof window.launchUTimTronTim === 'function') {
    start();
  } else {
    const s = document.createElement('script');
    s.src = '/ey/games/u-tim-tron-tim.js?v=20261111';
    s.onload = start;
    document.head.appendChild(s);
  }
}

function renderMangoPokeGame(arena, game) {
  let isRolling = false;

  function init() {
    arena.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #ecfccb 0%, #d9f99d 50%, #fef08a 100%); overflow: hidden; position: relative;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border-bottom: 1px solid #bef264; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🥭</span>
            <span style="font-weight: 800; color: #4d7c0f; font-size: 15px;">Chọc Xoài Chấm Muối</span>
            <span style="font-size: 12px; color: #3f6212;">(Xoài nào rụng vào đĩa muối tôm Tây Ninh sẽ lên bảng!)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-sound" style="background: #fff; border: 1px solid #bef264; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; cursor: pointer;">🔊</button>
            <button id="btn-mango-start" style="background: linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%); color: #fff; border: none; border-radius: 10px; padding: 8px 22px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(101,163,13,0.3); display: flex; align-items: center; gap: 6px;">
              ▶ Bắt đầu chọc xoài
            </button>
          </div>
        </div>

        <!-- Mango Tree Canopy & Salt Plate Arena -->
        <div id="tree-arena" style="flex: 1; position: relative; overflow: hidden;">
          <!-- Giant Tree Foliage Background at top -->
          <div style="position: absolute; top: -40px; left: -10%; right: -10%; height: 260px; background: radial-gradient(circle at 50% 50%, #65a30d 0%, #3f6212 100%); border-radius: 0 0 50% 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 2;"></div>

          <!-- Salt Plate at bottom -->
          <div id="salt-plate" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 220px; height: 75px; background: radial-gradient(ellipse at 50% 50%, #f97316 0%, #ea580c 60%, #c2410c 100%); border-radius: 50%; border: 6px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.25); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5;">
            <div style="font-weight: 900; font-size: 12px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">🌶️ MUỐI TÔM TÂY NINH</div>
            <div style="font-size: 10px; color: #ffedd5; font-weight: 700;">Đĩa chấm điểm danh</div>
          </div>

          <!-- Hanging Mangoes Grid -->
          <div id="mangoes-canopy" style="position: absolute; top: 15px; left: 5%; right: 5%; height: 210px; display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; z-index: 4;"></div>
        </div>
      </div>
    `;

    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn.onclick = () => {
      soundFx.enabled = !soundFx.enabled;
      soundBtn.textContent = soundFx.enabled ? '🔊' : '🔇';
    };

    const canopy = document.getElementById('mangoes-canopy');
    const startBtn = document.getElementById('btn-mango-start');

    const mangoes = classRoster.map((name, i) => {
      const el = document.createElement('div');
      el.className = 'mango-item';
      el.style.cssText = 'display: flex; flex-direction: column; align-items: center; transition: all 0.25s; cursor: pointer;';
      el.innerHTML = `
        <div style="width: 2px; height: 10px; background: #3f6212;"></div>
        <div class="mango-fruit" style="font-size: 32px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));">🥭</div>
        <div style="background: rgba(255,255,255,0.92); border: 1px solid #d9f99d; padding: 1px 6px; border-radius: 6px; font-weight: 800; font-size: 10px; color: #1e3a8a; white-space: nowrap; margin-top: -2px;">
          ${name.split(' ').pop()}
        </div>
      `;
      canopy.appendChild(el);
      return { name, el };
    });

    startBtn.onclick = () => {
      if (isRolling) return;
      isRolling = true;
      startBtn.disabled = true;

      const winnerIdx = Math.floor(Math.random() * classRoster.length);
      const winner = classRoster[winnerIdx];

      let count = 0;
      const interval = setInterval(() => {
        mangoes.forEach(m => {
          m.el.classList.remove('mango-wobble');
          m.el.style.transform = 'scale(1)';
        });

        const activeIdx = (count + winnerIdx) % mangoes.length;
        mangoes[activeIdx].el.classList.add('mango-wobble');
        mangoes[activeIdx].el.style.transform = 'scale(1.25)';
        soundFx.tick();

        count++;
        if (count >= 25) {
          clearInterval(interval);

          // Mango snaps off & drops down
          soundFx.slap();
          const fallingMango = mangoes[winnerIdx].el;
          fallingMango.style.transition = 'all 0.6s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
          fallingMango.style.position = 'absolute';
          fallingMango.style.left = '50%';
          fallingMango.style.transform = 'translate(-50%, 0)';
          fallingMango.style.top = '65%';

          setTimeout(() => {
            soundFx.correct();
            const plate = document.getElementById('salt-plate');
            plate.style.transform = 'translateX(-50%) scale(1.15)';

            setTimeout(() => {
              showWinnerOverlay(
                arena,
                winner,
                '🌶️ Quả xoài đã rớt trúng đĩa muối tôm! Mời bạn lên bảng "chấm muối" trả bài!',
                '🥭',
                '#65a30d',
                () => init()
              );
            }, 800);
          }, 600);
        }
      }, 100);
    };
  }

  init();
}

// ------------------------------------------------------------------------------
// 7. CẢ XÓM TRỐN TRẢ BÀI (GÀ CÔNG AN ĐI TUẦN)
// ------------------------------------------------------------------------------
function renderVillageSummonGame(arena, game) {
  let isRolling = false;

  function init() {
    arena.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: #dcfce7; overflow: hidden; position: relative;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border-bottom: 1px solid #bbf7d0; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🛵</span>
            <span style="font-weight: 800; color: #15803d; font-size: 15px;">Cả Xóm Trốn Trả Bài (Gà Công An Đi Tuần)</span>
            <span style="font-size: 12px; color: #166534;">(Xe dừng trước nhà ai, người đó nhận giấy triệu tập lên bảng!)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-sound" style="background: #fff; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; cursor: pointer;">🔊</button>
            <button id="btn-village-start" style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); color: #fff; border: none; border-radius: 10px; padding: 8px 22px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(21,128,61,0.3); display: flex; align-items: center; gap: 6px;">
              ▶ Gà công an đi tuần
            </button>
          </div>
        </div>

        <!-- Village Street Arena -->
        <div id="village-street" style="flex: 1; position: relative; overflow-y: auto; padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; align-content: start;">
        </div>

        <!-- Motorbike Patrol Indicator -->
        <div id="police-bike" class="moto-running" style="position: absolute; bottom: 20px; left: 30px; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.9); padding: 8px 18px; border-radius: 999px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border: 2px solid #15803d; z-index: 20; transition: all 0.4s ease;">
          <span style="font-size: 28px;">🐔🛵</span>
          <span style="font-size: 12px; font-weight: 900; color: #15803d;">CÔNG AN XÓM GÀ</span>
        </div>
      </div>
    `;

    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn.onclick = () => {
      soundFx.enabled = !soundFx.enabled;
      soundBtn.textContent = soundFx.enabled ? '🔊' : '🔇';
    };

    const container = document.getElementById('village-street');
    const startBtn = document.getElementById('btn-village-start');
    const bike = document.getElementById('police-bike');

    const houses = classRoster.map((name, i) => {
      const el = document.createElement('div');
      const roofColors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];
      const roof = roofColors[i % roofColors.length];
      
      el.style.cssText = 'background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; transition: all 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.06);';
      el.innerHTML = `
        <div style="font-size: 36px; line-height: 1; margin-bottom: 4px;">🏠</div>
        <div style="font-weight: 800; font-size: 11px; color: #0f172a; line-height: 1.2;">Nhà ${name.split(' ').pop()}</div>
        <div class="stamp-slot" style="position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); border-radius: 10px;">
          <div class="stamp-effect" style="border: 3px solid #dc2626; color: #dc2626; font-weight: 900; font-size: 12px; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
            TRIỆU TẬP
          </div>
        </div>
      `;
      container.appendChild(el);
      return { name, el };
    });

    startBtn.onclick = () => {
      if (isRolling) return;
      isRolling = true;
      startBtn.disabled = true;
      soundFx.whistle();

      const winnerIdx = Math.floor(Math.random() * classRoster.length);
      const winner = classRoster[winnerIdx];

      let count = 0;
      const interval = setInterval(() => {
        houses.forEach(h => {
          h.el.style.borderColor = '#cbd5e1';
          h.el.style.background = '#ffffff';
          h.el.style.transform = 'scale(1)';
        });

        const activeIdx = (count + winnerIdx) % houses.length;
        houses[activeIdx].el.style.borderColor = '#15803d';
        houses[activeIdx].el.style.background = '#dcfce7';
        houses[activeIdx].el.style.transform = 'scale(1.08)';
        soundFx.tick();

        count++;
        if (count >= 26) {
          clearInterval(interval);

          // Motorbike stops at winner's house
          const target = houses[winnerIdx];
          target.el.style.borderColor = '#dc2626';
          target.el.style.background = '#fee2e2';
          target.el.style.transform = 'scale(1.15)';
          target.el.style.boxShadow = '0 0 25px rgba(220,38,38,0.4)';

          const slot = target.el.querySelector('.stamp-slot');
          if (slot) slot.style.display = 'flex';

          soundFx.stamp();

          setTimeout(() => {
            showWinnerOverlay(
              arena,
              winner,
              '📜 Gà công an đã gửi giấy triệu tập! Mời bạn lên bảng kiểm tra bài cũ!',
              '🛵',
              '#15803d',
              () => init()
            );
          }, 900);
        }
      }, 95);
    };
  }

  init();
}

// ------------------------------------------------------------------------------
// 8. THIÊN THẠCH ĐIỂM DANH
// ------------------------------------------------------------------------------
function renderMeteorGame(arena, game) {
  let isRolling = false;

  function init() {
    arena.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; background: #0f172a; overflow: hidden; position: relative;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(30,41,59,0.85); backdrop-filter: blur(8px); border-bottom: 1px solid #334155; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">☄️</span>
            <span style="font-weight: 800; color: #f97316; font-size: 15px;">Thiên Thạch Điểm Danh</span>
            <span style="font-size: 12px; color: #94a3b8;">(Bão thiên thạch rơi xuống phố, trúng ai người đó lên bảng!)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-sound" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #475569; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; cursor: pointer;">🔊</button>
            <button id="btn-meteor-start" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: #fff; border: none; border-radius: 10px; padding: 8px 22px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(234,88,12,0.4); display: flex; align-items: center; gap: 6px;">
              ▶ Bão thiên thạch đổ bộ
            </button>
          </div>
        </div>

        <!-- City Street Arena with Falling Meteors -->
        <div id="meteor-arena" style="flex: 1; position: relative; overflow-y: auto; padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap: 16px; align-content: start;">
        </div>
      </div>
    `;

    const soundBtn = document.getElementById('btn-toggle-sound');
    soundBtn.onclick = () => {
      soundFx.enabled = !soundFx.enabled;
      soundBtn.textContent = soundFx.enabled ? '🔊' : '🔇';
    };

    const container = document.getElementById('meteor-arena');
    const startBtn = document.getElementById('btn-meteor-start');

    const students = classRoster.map((name, i) => {
      const el = document.createElement('div');
      el.style.cssText = 'background: rgba(30, 41, 59, 0.7); border: 2px solid #334155; border-radius: 14px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; transition: all 0.25s; color: #fff;';
      el.innerHTML = `
        <div style="font-size: 34px; line-height: 1; margin-bottom: 4px;">🚶</div>
        <div style="font-weight: 800; font-size: 11px; color: #e2e8f0; line-height: 1.2;">${name}</div>
        <div class="meteor-strike" style="position: absolute; top: -20px; font-size: 40px; display: none;">☄️</div>
      `;
      container.appendChild(el);
      return { name, el };
    });

    startBtn.onclick = () => {
      if (isRolling) return;
      isRolling = true;
      startBtn.disabled = true;
      soundFx.whistle();

      const winnerIdx = Math.floor(Math.random() * classRoster.length);
      const winner = classRoster[winnerIdx];

      let count = 0;
      const interval = setInterval(() => {
        students.forEach(s => {
          s.el.style.borderColor = '#334155';
          s.el.style.background = 'rgba(30, 41, 59, 0.7)';
          s.el.style.transform = 'scale(1)';
        });

        const activeIdx = (count + winnerIdx) % students.length;
        students[activeIdx].el.style.borderColor = '#f97316';
        students[activeIdx].el.style.background = 'rgba(249, 115, 22, 0.25)';
        students[activeIdx].el.style.transform = 'scale(1.1)';
        soundFx.tick();

        count++;
        if (count >= 28) {
          clearInterval(interval);

          // Meteor Strike on Winner
          const target = students[winnerIdx];
          target.el.style.borderColor = '#ef4444';
          target.el.style.background = 'rgba(239, 68, 68, 0.35)';
          target.el.style.transform = 'scale(1.2)';
          target.el.style.boxShadow = '0 0 35px #f97316';

          const strike = target.el.querySelector('.meteor-strike');
          if (strike) strike.style.display = 'block';

          // Screen shake
          const arenaWrap = document.getElementById('meteor-arena');
          if (arenaWrap) arenaWrap.classList.add('screen-shake');
          soundFx.explosion();

          setTimeout(() => {
            showWinnerOverlay(
              arena,
              winner,
              '⚡ Thiên thạch đã trúng bạn! Mời siêu nhân lên bảng giải cứu bài tập!',
              '☄️',
              '#f97316',
              () => init()
            );
          }, 950);
        }
      }, 90);
    };
  }

  init();
}


window.EY_CATALOG = EY_CATALOG;
window.classRoster = classRoster;


function updateUserProfileDisplay() {
  if (!window.EyAuth) return;
  const sess = window.EyAuth.getSession();
  const avatarEl = document.querySelector('.user-avatar');
  const nameEl = document.querySelector('.user-name');
  const roleEl = document.querySelector('.user-role');
  if (avatarEl) {
    if (sess.role === 'admin') avatarEl.textContent = '👑';
    else if (sess.role === 'student') avatarEl.textContent = '🎓';
    else avatarEl.textContent = (sess.name || 'G').charAt(0).toUpperCase();
  }
  if (nameEl) nameEl.textContent = sess.name || 'Người dùng';
  if (roleEl) {
    if (sess.role === 'admin') {
      roleEl.textContent = '👑 Quản trị viên (Admin)';
      roleEl.style.color = '#7c3aed';
      roleEl.style.fontWeight = '800';
    } else if (sess.role === 'student') {
      roleEl.textContent = `Học sinh · ${sess.studentId || ''}`;
      roleEl.style.color = '#0d9488';
      roleEl.style.fontWeight = '700';
    } else {
      roleEl.textContent = (sess.email || 'Giáo viên') + (sess.status === 'pending' ? ' (⏳ Chờ duyệt)' : '');
      roleEl.style.color = sess.status === 'pending' ? '#d97706' : '#2563eb';
      roleEl.style.fontWeight = '700';
    }
  }
}

function toggleProfileMenu(e) {
  e && e.stopPropagation();
  let existing = document.getElementById('ey-profile-dropdown');
  if (existing) { existing.remove(); return; }

  const sess = window.EyAuth.getSession();
  const role = sess.role || 'teacher';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';
  const isTeacher = !isAdmin && !isStudent;

  const roleBadgeStyle = isAdmin ? 'background: #ede9fe; color: #7c3aed;' : (isStudent ? 'background: #ecfdf5; color: #0d9488;' : 'background: #fef3c7; color: #d97706;');
  const roleLabel = isAdmin ? '👑 Admin' : (isStudent ? '👨‍🎓 Học sinh' : '👨‍🏫 Giáo viên');

  const menu = document.createElement('div');
  menu.id = 'ey-profile-dropdown';
  menu.style.cssText = 'position: fixed; top: 68px; right: 24px; background: #fff; color: #1e293b; width: 280px; border-radius: 18px; box-shadow: 0 15px 40px rgba(0,0,0,0.18); border: 1px solid #e2e8f0; padding: 14px; z-index: 999999; font-family: "Be Vietnam Pro", sans-serif;';
  menu.innerHTML = `
    <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
      <div style="font-weight: 800; font-size: 15px; color: #0f172a;">${sess.name || 'Giáo viên'}</div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; gap: 6px;">
        <span style="font-size: 12px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${isStudent ? `ID: ${sess.studentId}` : (sess.email || 'Chưa đăng nhập Email')}</span>
        <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; ${roleBadgeStyle}">
          ${roleLabel}
        </span>
      </div>
    </div>

    <!-- Quick Role Switcher Buttons -->
    <div style="display: flex; gap: 4px; background: #f8fafc; padding: 4px; border-radius: 10px; margin-bottom: 10px;">
      ${isAdmin ? `
        <button onclick="window.EyAuth.switchRole('admin'); document.getElementById('ey-profile-dropdown').remove();" style="flex: 1; padding: 6px 2px; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; background: #7c3aed; color: #fff;">👑 Admin</button>
      ` : ''}
      <button onclick="window.EyAuth.switchRole('teacher'); document.getElementById('ey-profile-dropdown').remove();" style="flex: 1; padding: 6px 2px; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; ${isTeacher ? 'background: #2563eb; color: #fff;' : 'background: transparent; color: #64748b;'}">👨‍🏫 Giáo viên</button>
      <button onclick="window.EyAuth.switchRole('student'); document.getElementById('ey-profile-dropdown').remove();" style="flex: 1; padding: 6px 2px; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; ${isStudent ? 'background: #0d9488; color: #fff;' : 'background: transparent; color: #64748b;'}">👨‍🎓 Học sinh</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13.5px; font-weight: 600;">
      ${isAdmin ? `
        <div onclick="window.switchTab('cms'); document.getElementById('ey-profile-dropdown').remove();" style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
          <span>👑</span> <span>Quản trị Giáo viên & Hệ thống (CMS)</span>
        </div>
      ` : ''}

      <div onclick="window.EyAuth.openLoginModal('teacher'); document.getElementById('ey-profile-dropdown').remove();" style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
        <span>📧</span> <span>Đăng nhập Email GV & Lưu API Key</span>
      </div>

      <div onclick="window.GoogleDriveSync && window.GoogleDriveSync.openBackupModal(); document.getElementById('ey-profile-dropdown').remove();" style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
        <span>☁️</span> <span>Đám mây Google Sheets (Đồng bộ)</span>
      </div>

      <div onclick="window.EyAuth.openLoginModal('student'); document.getElementById('ey-profile-dropdown').remove();" style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
        <span>🔑</span> <span>Đăng nhập Mã Học sinh (ID + PIN)</span>
      </div>

      <div onclick="localStorage.removeItem('ey_v2_auth_session'); localStorage.removeItem('smartedu_auth_user'); document.getElementById('ey-profile-dropdown').remove(); window.EyAuth.openLoginModal('teacher');" style="padding: 8px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #ef4444; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 10px;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">
        <span>⎋</span> <span>Đăng xuất / Đổi tài khoản</span>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  const closeDropdown = (evt) => {
    if (!menu.contains(evt.target) && !document.querySelector('.user-profile').contains(evt.target)) {
      menu.remove();
      document.removeEventListener('click', closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener('click', closeDropdown), 10);
}

// TRANG HỌC TẬP & SỔ TAY KIẾN THỨC CHO HỌC SINH
function renderHocTap(container) {
  container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 10px 0; font-family: 'Be Vietnam Pro', sans-serif;">
      <!-- Hero Banner -->
      <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0284c7 100%); border-radius: 24px; padding: 32px 36px; color: #fff; margin-bottom: 28px; box-shadow: 0 12px 30px rgba(13,148,136,0.25); display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; margin-bottom: 12px;">
            <span>👨‍🎓</span> <span>DÀNH RIÊNG CHO HỌC SINH · XEM & HỌC THÔNG MINH</span>
          </div>
          <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: -0.5px;">Sổ Tay Kiến Thức & Học Toán Trực Quan</h1>
          <p style="font-size: 14.5px; opacity: 0.95; max-width: 650px; line-height: 1.6; margin: 0;">
            Hệ thống hóa toàn bộ công thức, định lý, phương pháp giải Toán 10 - 11 - 12 (Kết nối tri thức, Cánh Diều, Chân trời sáng tạo). Kết hợp Infographic sinh động, Mô phỏng 3D tương tác và Máy tính Casio fx-580VN X!
          </p>
        </div>
        <div style="font-size: 80px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25)); flex-shrink: 0;">
          📐
        </div>
      </div>

      <!-- Quick Action Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <!-- Card 1: So Tay Toan -->
        <div style="background: var(--bg-card, #fff); border: 2px solid #ccfbf1; border-radius: 20px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="width: 50px; height: 50px; border-radius: 14px; background: #ccfbf1; color: #0d9488; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                📖
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px;">Lớp 10 · 11 · 12</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 8px 0;">Sổ Tay Công Thức Toán</h3>
            <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 16px 0;">
              Tra cứu nhanh lý thuyết, bảng đạo hàm, tích phân, lượng giác, tọa độ không gian Oxyz và xác suất thống kê.
            </p>
          </div>
          <button onclick="window.parent && window.parent.openHocToanPortal ? window.parent.openHocToanPortal('/hoc-toan/so-tay.html') : (window.openHocToanPortal ? window.openHocToanPortal('/hoc-toan/so-tay.html') : window.open('/hoc-toan/so-tay.html', '_blank'))" style="width: 100%; padding: 12px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>Xem Sổ Tay Ngay ➔</span>
          </button>
        </div>

        <!-- Card 2: Infographic -->
        <div style="background: var(--bg-card, #fff); border: 2px solid #bfdbfe; border-radius: 20px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="width: 50px; height: 50px; border-radius: 14px; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                📊
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 9999px;">Trực Quan</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 8px 0;">Infographic Tóm Tắt</h3>
            <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 16px 0;">
              Sơ đồ hình ảnh tổng kết toàn bộ kiến thức trọng tâm, sơ đồ cây tư duy trực quan giúp nhớ bài trong 3 phút.
            </p>
          </div>
          <button onclick="window.parent && window.parent.openHocToanPortal ? window.parent.openHocToanPortal('/hoc-toan/#infographic') : (window.openHocToanPortal ? window.openHocToanPortal('/hoc-toan/#infographic') : window.open('/hoc-toan/#infographic', '_blank'))" style="width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>Xem Infographic ➔</span>
          </button>
        </div>

        <!-- Card 3: Mo Phong 3D -->
        <div style="background: var(--bg-card, #fff); border: 2px solid #fbcfe8; border-radius: 20px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="width: 50px; height: 50px; border-radius: 14px; background: #fce7f3; color: #db2777; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                ⚡
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #fdf2f8; color: #be185d; padding: 4px 10px; border-radius: 9999px;">Tương Tác 3D</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 8px 0;">Mô Phỏng Toán Học</h3>
            <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 16px 0;">
              Xoay góc nhìn 3D không gian, tương tác kéo thả điểm, đồ thị hàm số và thí nghiệm hình học động sinh động.
            </p>
          </div>
          <button onclick="window.parent && window.parent.openHocToanPortal ? window.parent.openHocToanPortal('/hoc-toan/#moPhong') : (window.openHocToanPortal ? window.openHocToanPortal('/hoc-toan/#moPhong') : window.open('/hoc-toan/#moPhong', '_blank'))" style="width: 100%; padding: 12px; background: #db2777; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>Vào Mô Phỏng ➔</span>
          </button>
        </div>

        <!-- Card 4: Casio fx-580 -->
        <div style="background: var(--bg-card, #fff); border: 2px solid #fed7aa; border-radius: 20px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="width: 50px; height: 50px; border-radius: 14px; background: #ffedd5; color: #ea580c; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                🧮
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 9999px;">ClassWiz</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 8px 0;">Casio fx-580VN X</h3>
            <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 16px 0;">
              Máy tính khoa học chuẩn phòng thi THPT Quốc gia đầy đủ 521 tính năng: giải phương trình, ma trận, thống kê.
            </p>
          </div>
          <button onclick="window.parent && window.parent.document.getElementById('casio-modal-window') ? (window.parent.document.getElementById('casio-modal-window').style.display='flex') : (document.getElementById('casio-modal-window') ? document.getElementById('casio-modal-window').style.display='flex' : window.open('/tools/casio580/index.html', '_blank'))" style="width: 100%; padding: 12px; background: #ea580c; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>Mở Máy Tính Casio ➔</span>
          </button>
        </div>
      </div>

      <!-- Embedded Interactive Study Viewer -->
      <div style="background: var(--bg-card, #fff); border: 1px solid var(--border, #e2e8f0); border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; color: #0f172a;">
            <span>📖</span> <span>Khung Học Tập Tương Tác Trực Tuyến</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="document.getElementById('hoc-tap-embed-frame').src='/hoc-toan/so-tay.html'" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer;">Sổ tay</button>
            <button onclick="document.getElementById('hoc-tap-embed-frame').src='/hoc-toan/#infographic'" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer;">Infographic</button>
            <button onclick="document.getElementById('hoc-tap-embed-frame').src='/hoc-toan/#moPhong'" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer;">Mô phỏng</button>
            <button onclick="window.open(document.getElementById('hoc-tap-embed-frame').src, '_blank')" style="padding: 6px 14px; border-radius: 8px; border: none; background: #0d9488; color: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer;">↗ Toàn màn hình</button>
          </div>
        </div>
        <div style="height: 680px; width: 100%; position: relative;">
          <iframe id="hoc-tap-embed-frame" src="/hoc-toan/so-tay.html" style="width: 100%; height: 100%; border: none; background: #fff;"></iframe>
        </div>
      </div>
    </div>
  `;
}

// XEM DANH MỤC GAMES 2 DÀNH CHO HỌC SINH & GIÁO VIÊN
function renderGames2View(container) {
  if (window.parent && window.parent.openGames2Portal) {
    window.parent.openGames2Portal();
    return;
  }
  container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 10px 0; font-family: 'Be Vietnam Pro', sans-serif;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 24px; padding: 30px; color: #fff; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 8px 0;">🕹️ Kho 24 Trò Chơi Giáo Dục Tương Tác (SmartEdu Play)</h1>
          <p style="font-size: 14px; opacity: 0.9; margin: 0;">Chặn Zombie, Kéo co, Dò mìn, Đua sao, Camera AI nghiêng đầu, Chém hoa quả, Đua vịt... Hoàn toàn miễn phí!</p>
        </div>
        <button onclick="window.open('/ai-tools', '_blank')" style="padding: 12px 24px; background: #fde047; color: #1e1b4b; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; white-space: nowrap;">
          🚀 Chơi Games 2 ➔
        </button>
      </div>
      <div style="height: 700px; border-radius: 20px; overflow: hidden; border: 1px solid #334155;">
        <iframe src="/ai-tools" style="width: 100%; height: 100%; border: none; background: #0f172a;"></iframe>
      </div>
    </div>
  `;
}
