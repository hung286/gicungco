/**
 * MHEdu - AI Tạo Game Nhanh
 * Tự động tạo mini-game HTML5 tương tác, xuất SCORM 1.2 cho LMS & chơi offline
 * Phát triển bởi NMH Thầy Nguyễn Mạnh Hùng
 */

import { createScormPackage, downloadBlob, sanitizeFilename } from './assets/scormPackager.js';

const { useState, useEffect, useMemo, useRef } = React;

// 10 Dạng mini-game giáo dục chuẩn
const GAME_TYPES = [
  { id: "quiz", icon: "🅰️", label: "Trắc nghiệm 4 đáp án", desc: "Chọn 1 đáp án đúng trong 4 phương án" },
  { id: "true_false", icon: "✅", label: "Đúng / Sai", desc: "Xác định câu khẳng định đúng hay sai" },
  { id: "matching", icon: "🔗", label: "Nối cặp tương ứng", desc: "Nối cột khái niệm với định nghĩa/kết quả" },
  { id: "fill_blank", icon: "✏️", label: "Điền từ vào chỗ trống", desc: "Gõ từ hoặc chọn từ còn thiếu trong câu" },
  { id: "drag_drop", icon: "🗂️", label: "Kéo thả phân loại", desc: "Kéo các thẻ vào đúng nhóm chủ đề" },
  { id: "sequencing", icon: "🔢", label: "Sắp xếp thứ tự", desc: "Kéo xếp các bước hoặc sự kiện theo trình tự" },
  { id: "memory", icon: "🃏", label: "Lật thẻ ghi nhớ", desc: "Lật mở và tìm các cặp thẻ tương ứng" },
  { id: "word_search", icon: "🔍", label: "Tìm chữ ô vuông", desc: "Tìm các từ khóa ẩn trong ma trận chữ" },
  { id: "crossword", icon: "🧩", label: "Giải ô chữ", desc: "Trả lời câu hỏi gợi ý để mở ô chữ hàng ngang" },
  { id: "hangman", icon: "🔤", label: "Đoán chữ bí mật", desc: "Đoán từng chữ cái trước khi hết lượt" }
];

// Bảng màu giao diện
const THEME_COLORS = [
  { id: "blue", label: "Xanh dương", hex: "#3b82f6", bg: "from-blue-600 to-indigo-600" },
  { id: "emerald", label: "Ngọc lục bảo", hex: "#10b981", bg: "from-emerald-600 to-teal-600" },
  { id: "violet", label: "Tím mộng mơ", hex: "#8b5cf6", bg: "from-purple-600 to-violet-600" },
  { id: "rose", label: "Hồng quyến rũ", hex: "#f43f5e", bg: "from-rose-600 to-pink-600" },
  { id: "amber", label: "Hổ phách vàng", hex: "#f59e0b", bg: "from-amber-500 to-orange-600" },
  { id: "cyan", label: "Xanh lơ tươi mát", hex: "#06b6d4", bg: "from-cyan-600 to-blue-600" }
];

// Phông chữ sư phạm
const FONTS = ["Inter", "Quicksand", "Nunito", "Roboto"];

export function App() {
  const [step, setStep] = useState(0); // 0: Tài liệu, 1: Cấu hình game, 2: Chơi thử & Lưu

  // Dữ liệu đầu vào
  const [topic, setTopic] = useState("");
  const [docText, setDocText] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [bankQuestions, setBankQuestions] = useState([]);

  // Cấu hình game
  const [selectedTypes, setSelectedTypes] = useState(["quiz"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [themeColor, setThemeColor] = useState("blue");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [iconsEnabled, setIconsEnabled] = useState(true);
  const [gameTitle, setGameTitle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Trạng thái AI
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState(null);

  // Kết quả Game HTML
  const [gameHtml, setGameHtml] = useState("");
  const [adjustPrompt, setAdjustPrompt] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const iframeRef = useRef(null);

  // Kiểm tra câu hỏi có sẵn từ MHEdu khi tải trang
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("smartedu_imath_questions") || localStorage.getItem("smartedu_imath_questions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBankQuestions(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Lấy câu hỏi từ ngân hàng MHEdu
  const handleUseMHEduQuestions = () => {
    if (bankQuestions.length === 0) {
      alert("Chưa tìm thấy câu hỏi nào trong kho MHEdu. Thầy cô có thể nhập chủ đề hoặc tải tài liệu bài học.");
      return;
    }
    const formatted = bankQuestions.slice(0, 20).map((q, idx) => {
      const stem = q.stem || q.question || q.questionText || "";
      const opts = q.options ? q.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`).join("\n") : "";
      const ans = q.answer !== undefined ? `  => Đáp án đúng: ${q.answer}` : "";
      return `Câu ${idx + 1}: ${stem}\n${opts}${ans ? "\n" + ans : ""}`;
    }).join("\n\n");

    setDocText(formatted);
    setDocFileName(`Ngân hàng MHEdu (${bankQuestions.length} câu)`);
    setQuestionCount(Math.min(bankQuestions.length, 15));
    if (!gameTitle) setGameTitle("Đố vui kiến thức");
  };

  // Upload file bài học (.txt, .docx)
  const handleFileUpload = async (file) => {
    if (!file) return;
    setDocFileName(file.name);
    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      setDocText(text.slice(0, 25000));
    } else {
      // Giả sử file docx hoặc văn bản khác
      try {
        if (window.JSZip && file.name.endsWith(".docx")) {
          const buf = await file.arrayBuffer();
          const zip = await window.JSZip.loadAsync(buf);
          const xml = await zip.file("word/document.xml")?.async("string");
          if (xml) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "application/xml");
            const textNodes = Array.from(xmlDoc.getElementsByTagName("w:t")).map(n => n.textContent);
            setDocText(textNodes.join(" ").replace(/\s+/g, " ").slice(0, 25000));
          }
        } else {
          setDocText(`Tài liệu bài học: ${file.name}`);
        }
      } catch (err) {
        setDocText(`Tài liệu bài học: ${file.name}`);
      }
    }
  };

  // Gọi Gemini AI tạo game
  const handleGenerateGame = async (isAdjust = false) => {
    const inputContent = (topic.trim() + "\n" + docText.trim()).trim();
    if (!inputContent && !isAdjust) {
      setError("Vui lòng nhập chủ đề bài học, tải tài liệu hoặc lấy câu hỏi từ MHEdu trước.");
      setStep(0);
      return;
    }

    setError(null);
    if (isAdjust) {
      if (!adjustPrompt.trim()) return;
      setAdjusting(true);
    } else {
      setLoading(true);
      setProgress(15);
      setProgressMsg("Đang kết nối Gemini AI và phân tích nội dung học tập...");
    }

    let userKey = "";
    try {
      userKey = (localStorage.getItem("smartedu_gemini_api_key") || "").trim();
    } catch {}

    const BACKUP_KEYS = [
      "",
      "",
      "",
      "",
      ""
    ];
    const keysToTry = userKey ? [userKey, ...BACKUP_KEYS] : BACKUP_KEYS;

    const curColor = THEME_COLORS.find(c => c.id === themeColor) || THEME_COLORS[0];
    const selectedTypesDesc = selectedTypes.map(t => {
      const g = GAME_TYPES.find(gt => gt.id === t);
      return g ? `${g.label} (${g.desc})` : t;
    }).join("; ");

    let prompt = "";
    if (isAdjust) {
      prompt = `Bạn là Chuyên gia Lập trình Web Game Giáo Dục của MHEdu.
Dưới đây là mã nguồn HTML5 của một trò chơi tương tác giáo dục:
\`\`\`html
${gameHtml}
\`\`\`

YÊU CẦU ĐIỀU CHỈNH TỪ GIÁO VIÊN:
"${adjustPrompt.trim()}"

HƯỚNG DẪN CẬP NHẬT:
1. Giữ nguyên cấu trúc hoạt động cốt lõi của game, các câu hỏi và cơ chế tính điểm.
2. Cập nhật chính xác theo yêu cầu (giao diện, màu sắc, thời gian, cỡ chữ, luật chơi, hiệu ứng âm thanh...).
3. BẮT BUỘC chỉ trả về toàn bộ mã HTML5 hoàn chỉnh mới, bắt đầu từ <!DOCTYPE html> và kết thúc bằng </html>, không bọc trong markdown và không có văn bản giải thích.`;
    } else {
      prompt = `Bạn là Chuyên gia Lập trình Web Game Giáo Dục của MHEdu.
Nhiệm vụ: Lập trình một MINI-GAME GIÁO DỤC HTML5 TƯƠNG TÁC HOÀN CHỈNH, ĐỘC LẬP (Single File HTML) để học sinh chơi ôn tập bài học.

THÔNG TIN BÀI DẠY & YÊU CẦU CẤU HÌNH:
- Tiêu đề game: ${gameTitle || topic || "Thử Thách Trí Tuệ"}
- Dạng game yêu cầu: ${selectedTypesDesc || "Trắc nghiệm tương tác sinh động"}
- Số lượng câu hỏi/thử thách: ${questionCount} câu
- Tông màu chủ đạo: ${curColor.label} (Mã màu chính: ${curColor.hex})
- Phông chữ: "${fontFamily}", system-ui, sans-serif
- Emoji minh họa: ${iconsEnabled ? "Sử dụng nhiều emoji sinh động, bắt mắt trong từng câu hỏi và giao diện" : "Tối giản"}
${customPrompt ? `- Yêu cầu đặc biệt: ${customPrompt}` : ""}

NỘI DUNG TÀI LIỆU HỌC TẬP:
"""
${inputContent.slice(0, 15000)}
"""

QUY CHUẨN KỸ THUẬT BẮT BUỘC CHO FILE HTML5:
1. SINGLE-FILE HOÀN CHỈNH: Toàn bộ HTML, CSS trong <style> và JavaScript trong <script> đặt trong 1 file duy nhất. Không gọi thư viện ngoài (trừ Google Fonts), không gọi ảnh ngoài.
2. HIỆU ỨNG ÂM THANH (WEB AUDIO API):
   Tạo các âm thanh tương tác bằng Web Audio API thuần (không dùng file mp3):
   - Âm thanh bấm nút (click beep)
   - Âm thanh trả lời ĐÚNG (tiếng ting cao vút vui tươi)
   - Âm thanh trả lời SAI (tiếng buzz trầm nhẹ)
   - Âm thanh CHIẾN THẮNG (chuỗi nốt nhạc fanfare hoan hỉ)
3. TRẢI NGHIỆM HỌC TẬP SƯ PHẠM:
   - Màn hình bắt đầu (Start Screen): Tên game, hướng dẫn chơi, nút "Bắt đầu chơi".
   - Màn hình chơi: Hiển thị câu hỏi, tiến trình (Câu X / Y), điểm số hiện tại, đồng hồ đếm ngược (nếu phù hợp).
   - Phản hồi tức thì: Khi chọn đáp án, đổi màu xanh (đúng) hoặc đỏ (sai) kèm giải thích ngắn gọn vì sao đúng/sai.
   - Màn hình kết thúc: Tổng điểm, tỷ lệ %, danh hiệu khen ngợi (Xuất sắc / Tốt / Cần cố gắng), nút "Chơi lại".
   - Hiệu ứng pháo hoa chúc mừng (Canvas Confetti) khi hoàn thành xuất sắc.
4. TƯƠNG THÍCH SCORM VÀ KHUNG EMBED:
   Khi hoàn thành trò chơi, kích hoạt sự kiện:
   window.parent.postMessage({ type: "GAME_COMPLETE", score: score, maxScore: maxScore }, "*");
5. GIAO DIỆN RESPONSIVE: Thiết kế co giãn hoàn hảo trên màn hình máy tính, máy chiếu lớp học, bảng tương tác và điện thoại di động.

ĐỊNH DẠNG ĐẦU RA:
BẮT BUỘC chỉ trả về mã HTML5 thuần túy bắt đầu từ <!DOCTYPE html> đến </html>. TUYỆT ĐỐI KHÔNG bọc trong markdown \`\`\`html ... \`\`\` và KHÔNG viết thêm bất kỳ lời dẫn nào.`;
    }

    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let generatedHtml = "";
    let lastErr = null;

    const timer = setInterval(() => {
      setProgress(p => (p < 85 ? p + Math.floor(Math.random() * 8) + 4 : p));
    }, 400);

    for (const key of keysToTry) {
      for (const model of MODELS) {
        try {
          if (!isAdjust) setProgressMsg(`AI (${model}) đang thiết kế logic và giao diện mini-game...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4
              }
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${res.status}`);
          }

          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          text = text.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();

          if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
            generatedHtml = text;
            break;
          }
        } catch (e) {
          lastErr = e;
          console.warn(`Thử model ${model} thất bại:`, e.message);
        }
      }
      if (generatedHtml) break;
    }

    clearInterval(timer);
    setLoading(false);
    setAdjusting(false);

    if (generatedHtml) {
      setProgress(100);
      setGameHtml(generatedHtml);
      setAdjustPrompt("");
      setStep(2); // Chuyển sang bước Chơi thử & Lưu
    } else {
      setError("AI không thể tạo game: " + (lastErr?.message || "Vui lòng kiểm tra lại kết nối mạng hoặc thử đổi Gemini API Key qua nút trên góc phải."));
    }
  };

  // Mở toàn màn hình cho iframe chơi thử
  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      }
    }
  };

  // Tải file HTML offline
  const handleDownloadHtml = () => {
    if (!gameHtml) return;
    const blob = new Blob([gameHtml], { type: "text/html;charset=utf-8" });
    const name = sanitizeFilename(gameTitle || topic || "MHEdu_Game");
    downloadBlob(blob, `${name}.html`);
  };

  // Tải gói SCORM 1.2
  const handleDownloadScorm = async () => {
    if (!gameHtml) return;
    try {
      const name = sanitizeFilename(gameTitle || topic || "MHEdu_Game");
      const zipBlob = await createScormPackage(gameHtml, gameTitle || topic || "MHEdu Game");
      downloadBlob(zipBlob, `${name}_SCORM.zip`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo gói SCORM: " + err.message);
    }
  };

  // Lưu vào Game tự tạo của MHEdu
  const handleSaveToMHEdu = () => {
    if (!gameHtml) return;
    try {
      const customGames = JSON.parse(localStorage.getItem("smartedu_custom_html_games") || "[]");
      const newGame = {
        id: "game_" + Date.now(),
        title: gameTitle || topic || "Mini-game AI",
        htmlContent: gameHtml,
        createdAt: new Date().toISOString()
      };
      customGames.unshift(newGame);
      localStorage.setItem("smartedu_custom_html_games", JSON.stringify(customGames.slice(0, 50)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert("Lỗi lưu game: " + e.message);
    }
  };

  // Sao chép mã nguồn HTML
  const handleCopyCode = () => {
    if (!gameHtml) return;
    navigator.clipboard.writeText(gameHtml).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header Title Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-md shrink-0">
              🕹️
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  AI TẠO GAME NHANH
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
                  ✨ BẢN ĐẦY ĐỦ • MIỄN PHÍ
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Tạo mini-game tương tác trong 10 giây từ giáo án hoặc câu hỏi có sẵn. Xuất SCORM 1.2 nộp LMS và tải file HTML chơi offline 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {[
            { id: 0, num: "1", title: "Tài liệu & Câu hỏi", desc: "Nhập bài học hoặc chọn câu hỏi" },
            { id: 1, num: "2", title: "Loại game & Giao diện", desc: "10 dạng game, màu sắc, font" },
            { id: 2, num: "3", title: "Chơi thử · Lưu & Xuất", desc: "Preview, SCORM, Tải HTML" }
          ].map(s => {
            const isActive = step === s.id;
            const isDone = (s.id === 0 && (!!topic || !!docText)) || (s.id === 1 && !!gameHtml) || (s.id === 2 && !!gameHtml);
            const canClick = s.id === 0 || s.id === 1 || !!gameHtml;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (canClick) {
                    setStep(s.id);
                  }
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300"
                    : canClick
                    ? "bg-white text-slate-800 border-purple-200 hover:border-purple-300 hover:shadow-sm"
                    : "bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isActive ? "bg-white text-purple-700" : isDone ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-500"
                  }`}>
                    {s.num}
                  </span>
                  <span className="font-bold text-sm truncate">{s.title}</span>
                </div>
                <p className={`text-xs mt-1 truncate hidden sm:block ${isActive ? "text-purple-100" : "text-slate-500"}`}>
                  {s.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* ==================== BƯỚC 1: TÀI LIỆU & CÂU HỎI ==================== */}
        {step === 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span>📚</span> Bước 1: Tài liệu & Câu hỏi cho game
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Thầy/cô có thể nhập chủ đề bài học, tải file tài liệu hoặc chọn trực tiếp câu hỏi từ MHEdu.
            </p>

            {/* MHEdu Question Bank Banner */}
            {bankQuestions.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wide">
                      Phát hiện ngân hàng câu hỏi MHEdu
                    </h4>
                    <p className="text-xs text-purple-700 mt-0.5">
                      Đang có <strong>{bankQuestions.length} câu hỏi</strong> trắc nghiệm sẵn sàng biến thành game tương tác.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUseMHEduQuestions}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                >
                  ⚡ Nạp câu hỏi vào game
                </button>
              </div>
            )}

            {/* Topic Input */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  1. Nhập chủ đề hoặc nội dung bài học
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                  {[
                    "Toán 5: Phân số",
                    "KHTN: Chu trình nước",
                    "Tiếng Anh: Tenses",
                    "Lịch sử: Khởi nghĩa Lam Sơn"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTopic(sug);
                        setGameTitle("Trò chơi: " + sug);
                      }}
                      className="text-[11px] bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors font-medium"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Định luật vạn vật hấp dẫn (Vật lí 10) • Các thời kỳ lịch sử Việt Nam • Từ vựng tiếng Anh chủ đề Môi trường • Phép cộng trừ phân số..."
                rows={3}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* File Upload / Document Text */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Hoặc tải file tài liệu giáo án (.docx, .txt)
                </label>
                {docFileName && (
                  <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    Đã tải: {docFileName}
                  </span>
                )}
              </div>
              <div
                onClick={() => document.getElementById("file-game-input").click()}
                className="border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <input
                  id="file-game-input"
                  type="file"
                  accept=".docx,.txt"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div className="text-3xl mb-2">📁</div>
                <p className="text-xs font-bold text-slate-700">
                  Bấm để chọn file giáo án (.docx, .txt)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI sẽ tự động đọc nội dung và trích xuất kiến thức trọng tâm để tạo trò chơi.
                </p>
              </div>
            </div>

            {/* Next Action */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  if (!topic.trim() && !docText.trim()) {
                    setTopic("Ôn tập kiến thức tổng hợp");
                  }
                  setStep(1);
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp tục: chọn loại game & giao diện</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 2: LOẠI GAME & GIAO DIỆN ==================== */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>🎮</span> Bước 2: Loại game & Giao diện
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn 1 hoặc nhiều dạng game yêu thích. Nếu không chọn, AI sẽ tự động chọn dạng phù hợp nhất.
                </p>
              </div>
              <button
                onClick={() => setStep(0)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl"
              >
                ← Quay lại tài liệu
              </button>
            </div>

            {/* 10 Dạng Mini-game */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide">
                1. Chọn các dạng trò chơi muốn tạo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GAME_TYPES.map(gt => {
                  const isSel = selectedTypes.includes(gt.id);
                  return (
                    <div
                      key={gt.id}
                      onClick={() => {
                        setSelectedTypes(prev =>
                          isSel ? prev.filter(t => t !== gt.id) : [...prev, gt.id]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSel
                          ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                          : "bg-slate-50/60 border-slate-200 hover:border-purple-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{gt.icon}</span>
                        <div>
                          <div className="font-bold text-xs">{gt.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{gt.desc}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
                        isSel ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-300 text-transparent"
                      }`}>
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Game Settings: Count, Color, Font */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pt-5 border-t border-slate-100">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Số câu hỏi</label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5 câu (Nhanh)</option>
                  <option value={8}>8 câu (Vừa phải)</option>
                  <option value={10}>10 câu (Tiêu chuẩn)</option>
                  <option value={15}>15 câu (Chi tiết)</option>
                  <option value={20}>20 câu (Toàn diện)</option>
                </select>
              </div>

              {/* Theme Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Màu sắc giao diện</label>
                <select
                  value={themeColor}
                  onChange={e => setThemeColor(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {THEME_COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Font */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Phông chữ</label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {FONTS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Custom prompt */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Tên trò chơi (Tùy chọn)</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={e => setGameTitle(e.target.value)}
                  placeholder="VD: Đấu Trường Tri Thức • Vượt Chướng Ngại Vật..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Yêu cầu thêm cho AI (Tùy chọn)</label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="VD: Có đồng hồ đếm ngược 15 giây mỗi câu, nhạc nền vui tai, giao diện chủ đề đại dương..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iconsEnabled}
                  onChange={e => setIconsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span className="text-xs font-bold text-slate-700">Minh họa câu hỏi bằng nhiều emoji sinh động</span>
              </label>
            </div>

            {/* Run Action */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-sm"
              >
                ← Quay lại tài liệu
              </button>
              <button
                onClick={() => handleGenerateGame(false)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <span>✨ KÍCH HOẠT TẠO GAME AI</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 3: CHƠI THỬ · LƯU & XUẤT BẢN ==================== */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>🎮</span> {gameTitle || topic || "Mini-game Học Tập Tương Tác"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    HTML5 Standalone
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chơi trực tiếp bên dưới, mở toàn màn hình khi dạy trên lớp hoặc xuất gói SCORM cho LMS.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleFullscreen}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>⛶</span> Toàn màn hình
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>📥</span> Tải HTML (Offline)
                </button>
                <button
                  onClick={handleDownloadScorm}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>📦</span> Tải SCORM (LMS)
                </button>
                <button
                  onClick={handleSaveToMHEdu}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>💾</span> {isSaved ? "✓ Đã lưu!" : "Lưu vào Game tự tạo"}
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  title="Sao chép toàn bộ mã HTML"
                >
                  {copiedCode ? "✓ Đã copy" : "Copy mã"}
                </button>
              </div>
            </div>

            {/* Interactive Preview Iframe */}
            <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900" style={{ height: "560px" }}>
              <iframe
                ref={iframeRef}
                srcDoc={gameHtml}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin allow-modals"
                title="MHEdu Game Preview"
              />
            </div>

            {/* AI In-Place Adjustment (Chat sửa game) */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">✨</span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Tinh chỉnh trò chơi bằng AI (In-place Adjustment)
                </h4>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adjustPrompt}
                  onChange={e => setAdjustPrompt(e.target.value)}
                  placeholder="Nhập yêu cầu sửa game (VD: Đổi nền sang màu xanh mint, tăng cỡ chữ câu hỏi, thêm âm thanh vui tai khi thắng)..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
                  onKeyDown={e => e.key === "Enter" && handleGenerateGame(true)}
                />
                <button
                  onClick={() => handleGenerateGame(true)}
                  disabled={adjusting || !adjustPrompt.trim()}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                >
                  {adjusting ? "Đang sửa..." : "Sửa game"}
                </button>
              </div>
            </div>

            {/* Back action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Điều chỉnh cấu hình game
              </button>
              <button
                onClick={() => { setStep(0); setGameHtml(""); setTopic(""); setDocText(""); }}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                🔄 Tạo trò chơi mới từ đầu
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              🕹️
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">AI Đang Tạo Mini-Game</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">{progressMsg}</p>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-bold">
              <span>Đang biên soạn code HTML5...</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-10 mt-12 border-t border-slate-200/60">
        <p className="font-semibold text-slate-600">
          ✨ MHEdu AI • Nền tảng Tạo Trò chơi Dạy học &amp; Chuyển đổi số Giáo dục
        </p>
        <p className="mt-1">
          Hệ thống phát triển bởi NMH Thầy Nguyễn Mạnh Hùng • Xuất SCORM 1.2 &amp; Chạy Offline 100%
        </p>
      </footer>
    </div>
  );
}

// Mount React App
const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
