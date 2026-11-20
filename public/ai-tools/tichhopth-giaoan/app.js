/**
 * MHEdu - Công cụ Tích Hợp Nội Dung Vào Giáo Án
 * Giao diện hiện đại 100% chuẩn theo quy trình 3 bước sư phạm
 * Phát triển bởi NMH Thầy Nguyễn Mạnh Hùng
 */

import { readDocxFile, guessMetadata, generatePatchedDocx, CATEGORIES } from './assets/docxModel.js';

const { useState, useEffect, useMemo, useRef } = React;

// Danh mục 23 môn học phổ thông chuẩn
const SUBJECTS = [
  "Tin học", "Toán", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", "Lịch sử và Địa lí",
  "Giáo dục công dân", "Công nghệ", "Giáo dục thể chất", "Nghệ thuật", "Âm nhạc", "Mĩ thuật",
  "Hoạt động trải nghiệm", "Vật lí", "Hoá học", "Sinh học", "Lịch sử", "Địa lí",
  "Giáo dục Kinh tế và Pháp luật", "Giáo dục quốc phòng và an ninh", "Tiếng Việt", "Tự nhiên và Xã hội", "Khoa học"
];

// 10 Dạng khuyết tật hòa nhập
const DISABILITY_TYPES = [
  { key: "nhin", label: "Khuyết tật về mắt (nhìn)", chip: "Hỗ trợ chữ phóng to và mô tả trực quan" },
  { key: "vandong", label: "Khuyết tật về xương (vận động)", chip: "Bố trí chỗ ngồi thuận tiện, miễn vận động mạnh" },
  { key: "tritue", label: "Khuyết tật về trí tuệ", chip: "Giảm 50% độ khó, tăng thời gian làm bài" },
  { key: "nghenoi", label: "Khuyết tật nghe, nói", chip: "Sử dụng bảng phụ, ký hiệu và bạn hỗ trợ" },
  { key: "tuky", label: "Rối loạn phổ tự kỷ", chip: "Tạo không gian yên tĩnh, hướng dẫn 1-1" },
  { key: "rlht", label: "Rối loạn học tập đặc thù", chip: "Chia nhỏ nhiệm vụ, kèm sơ đồ tư duy" },
  { key: "thankinh", label: "Khuyết tật thần kinh", chip: "Động viên tâm lý, không áp lực điểm số" },
  { key: "tamthan", label: "Khuyết tật tâm thần", chip: "Theo dõi sát cảm xúc, hỗ trợ hòa nhập nhóm" },
  { key: "khac", label: "Khuyết tật khác", chip: "Điều chỉnh phù hợp theo thể trạng" },
  { key: "chung", label: "Khuyết tật chung", chip: "Phân công bạn cùng bàn hỗ trợ học tập" }
];

// Gợi ý nhanh GDQP&AN theo TT 08/2024
const GDQPAN_SUGGESTIONS = [
  "Liên hệ bài toán số liệu bảo vệ chủ quyền biên giới và biển đảo Tổ quốc",
  "Giáo dục ý thức an toàn thông tin cá nhân và an ninh mạng",
  "Lồng ghép truyền thống vẻ vang, gương anh hùng liệt sĩ QĐND và CAND",
  "Nhắc nhở tinh thần kỷ luật, đoàn kết và trách nhiệm của học sinh với Tổ quốc"
];

// Gợi ý nhanh BĐKH & Môi trường
const BDKH_SUGGESTIONS = [
  "Liên hệ bài toán số liệu về lượng rác thải, tiết kiệm năng lượng điện nước",
  "Tổ chức hoạt động phân loại rác và giảm thiểu đồ nhựa dùng một lần",
  "Thực hành lối sống xanh, chăm sóc và bảo vệ cây xanh học đường",
  "Ý thức thích ứng và phòng tránh tai nạn thương tích khi thiên tai bão lũ"
];

export function App() {
  const [step, setStep] = useState(0); // 0: Giáo án, 1: Nội dung, 2: Duyệt & Tải
  const [docInfo, setDocInfo] = useState(null);
  const [subject, setSubject] = useState("Tin học");
  const [grade, setGrade] = useState(6);
  const [title, setTitle] = useState("");
  const [ppctName, setPpctName] = useState("");
  const [ppctText, setPpctText] = useState("");

  // Nội dung tích hợp
  const [opts, setOpts] = useState({
    nls: true,
    ai: true,
    kt: false,
    qp: false,
    bd: false
  });

  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [disabilityNote, setDisabilityNote] = useState("");
  const [qpNote, setQpNote] = useState("");
  const [bdNote, setBdNote] = useState("");
  const [nlsNote, setNlsNote] = useState("");
  const [aiNote, setAiNote] = useState("");

  // Quá trình xử lý AI
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [error, setError] = useState(null);

  // Kết quả
  const [items, setItems] = useState([]);
  const [colorEnabled, setColorEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedReport, setCopiedReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // File drag & drop
  const [isDragging, setIsDragging] = useState(false);

  // Xử lý nạp file Word
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError("Vui lòng chọn file Word định dạng .docx (Word 2007 trở lên). Với file .doc cũ, hãy mở trong Word và chọn Lưu thành (Save As) dạng .docx.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(30);
    setProgressStatus("Đang đọc và phân tích cấu trúc giáo án...");
    try {
      const parsed = await readDocxFile(file);
      setDocInfo(parsed);
      const meta = guessMetadata(parsed);
      if (meta.grade) setGrade(meta.grade);
      if (meta.title) setTitle(meta.title);
      setProgress(100);
      setItems([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể đọc file Word. Vui lòng kiểm tra lại file.");
    } finally {
      setLoading(false);
    }
  };

  // Upload PPCT tùy chọn
  const handlePpctUpload = async (file) => {
    if (!file) return;
    try {
      if (file.name.endsWith(".docx")) {
        const parsed = await readDocxFile(file);
        setPpctName(file.name);
        setPpctText(parsed.text.slice(0, 4000));
      } else {
        setPpctName(file.name);
        setPpctText(`File PPCT: ${file.name}`);
      }
    } catch (err) {
      console.warn("Lỗi đọc PPCT", err);
    }
  };

  // Kích hoạt AI tích hợp
  const handleRunAi = async () => {
    if (!docInfo) {
      setError("Chưa có giáo án để tích hợp. Hãy chọn file Word trước.");
      setStep(0);
      return;
    }

    const activeOpts = Object.entries(opts).filter(([_, v]) => v).map(([k]) => k);
    if (activeOpts.length === 0) {
      setError("Vui lòng bật ít nhất 1 nội dung cần tích hợp (Năng lực số, Năng lực AI, Khuyết tật, GDQPAN hoặc BĐKH).");
      return;
    }

    setError(null);
    setLoading(true);
    setProgress(15);
    setProgressStatus("Đang kết nối Gemini AI và phân tích cấu trúc bài dạy...");

    // Lấy API key
    let userKey = "";
    try {
      userKey = (localStorage.getItem("smartedu_gemini_api_key") || "").trim();
    } catch {}

    // Danh sách key dự phòng
    const BACKUP_KEYS = [
      "",
      "",
      "",
      "",
      ""
    ];
    const keysToTry = userKey ? [userKey, ...BACKUP_KEYS] : BACKUP_KEYS;

    // Chuẩn bị prompt
    const parasSlice = docInfo.text.split("\n").slice(0, 80).join("\n");
    
    let promptText = `Bạn là Chuyên gia Phương pháp Dạy học và Trợ lý AI Giáo dục của MHEdu.
Nhiệm vụ: Phân tích bài giáo án dưới đây và đề xuất các đoạn chèn tích hợp vào đúng các hoạt động (Mục tiêu, Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).

THÔNG TIN BÀI HỌC:
- Môn học: ${subject}
- Khối lớp: Lớp ${grade}
- Tên bài: ${title || docInfo.fileName}
${ppctText ? `- Căn cứ PPCT:\n${ppctText}\n` : ""}

CÁC NỘI DUNG YÊU CẦU TÍCH HỢP:
${opts.nls ? `- NĂNG LỰC SỐ (NLS): Lồng ghép mục tiêu và hoạt động ứng dụng công nghệ/thiết bị số, gắn mã chỉ báo (vd 1.2.TC1a). ${nlsNote ? `[Yêu cầu riêng: ${nlsNote}]` : ""}` : ""}
${opts.ai ? `- NĂNG LỰC TRÍ TUỆ NHÂN TẠO (AI): Lồng ghép nhận thức hoặc hoạt động ứng dụng AI theo QĐ 2422. ${aiNote ? `[Yêu cầu riêng: ${aiNote}]` : ""}` : ""}
${opts.kt ? `- HỌC SINH KHUYẾT TẬT HÒA NHẬP: Lồng ghép mục tiêu riêng và biện pháp điều chỉnh ở các hoạt động cho học sinh: ${selectedDisabilities.join(", ") || "Khuyết tật chung"}. ${disabilityNote ? `[Biện pháp: ${disabilityNote}]` : ""}` : ""}
${opts.qp ? `- GIÁO DỤC QUỐC PHÒNG & AN NINH (GDQP&AN): Lồng ghép theo Thông tư 08/2024/TT-BGDĐT. ${qpNote ? `[Ghi chú: ${qpNote}]` : ""}` : ""}
${opts.bd ? `- BIẾN ĐỔI KHÍ HẬU & MÔI TRƯỜNG (BĐKH - PCTT): Lồng ghép giáo dục môi trường, lối sống xanh, giảm rác thải hoặc phòng tránh thiên tai. ${bdNote ? `[Ghi chú: ${bdNote}]` : ""}` : ""}

DANH SÁCH CÁC ĐOẠN VĂN CỦA GIÁO ÁN GỐC (có gắn ID đoạn [p1], [p2], ...):
"""
${parasSlice}
"""

QUY TẮC BẮT BUỘC:
1. Đọc kỹ các đoạn văn, xác định đúng các phần Mục tiêu, Khởi động, Khám phá, Luyện tập, Vận dụng.
2. Chọn đúng mã đoạn "a" (ví dụ "p4", "p12", "p25") cần chèn thêm nội dung.
3. Trả về đúng định dạng JSON thuần túy (không kèm markdown ngoài khối json) theo cấu trúc:
{
  "items": [
    {
      "a": "p4",
      "w": "below",
      "k": "nls",
      "t": "Nội dung tích hợp cụ thể..."
    }
  ]
}
Trong đó:
- "a": ID đoạn gốc cần chèn (ví dụ "p5", "p18")
- "w": "below" (thêm dòng mới ngay dưới) hoặc "end" (nối tiếp vào đuôi đoạn văn đó)
- "k": loại tích hợp, chỉ chọn 1 trong các mã sau: "nls", "ai", "kt", "qp", "bd"
- "t": nội dung tích hợp chuẩn mực sư phạm, chi tiết, phù hợp đúng đặc trưng môn học và lớp. Hãy tạo từ 4 đến 8 đoạn chèn phân bổ đều cho các hoạt động.`;

    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    let successItems = null;
    let lastErr = null;

    // Giả lập tiến trình mượt mà
    const timer = setInterval(() => {
      setProgress(p => (p < 85 ? p + Math.floor(Math.random() * 8) + 4 : p));
    }, 400);

    for (const key of keysToTry) {
      for (const model of MODELS) {
        try {
          setProgressStatus(`AI (${model}) đang phân tích giáo án và tạo các đoạn chèn...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${res.status}`);
          }

          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            successItems = parsed.items.map((it, idx) => ({
              id: "item-" + idx,
              a: it.a || "p1",
              w: it.w || "below",
              k: it.k || "nls",
              t: it.t || "",
              on: true
            }));
            break;
          }
        } catch (e) {
          lastErr = e;
          console.warn(`Thử model ${model} thất bại:`, e.message);
        }
      }
      if (successItems) break;
    }

    clearInterval(timer);
    setLoading(false);

    if (successItems) {
      setProgress(100);
      setItems(successItems);
      setStep(2); // Chuyển sang bước Duyệt & Tải
    } else {
      setError("AI không thể phản hồi: " + (lastErr?.message || "Kiểm tra lại kết nối mạng hoặc thử đổi Gemini API Key qua nút trên góc phải."));
    }
  };

  // Sao chép báo cáo tích hợp
  const handleCopyReport = () => {
    const selectedCats = items.filter(i => i.on);
    const nlsCount = selectedCats.filter(i => i.k === "nls").length;
    const aiCount = selectedCats.filter(i => i.k === "ai").length;
    const ktCount = selectedCats.filter(i => i.k === "kt").length;
    const qpCount = selectedCats.filter(i => i.k === "qp").length;
    const bdCount = selectedCats.filter(i => i.k === "bd").length;

    const rpt = `📋 BÁO CÁO TÍCH HỢP GIÁO ÁN
• Nền tảng: MHEdu AI (Thầy Nguyễn Mạnh Hùng)
• Bài học: ${title || docInfo?.fileName || "Kế hoạch bài dạy"}
• Môn học: ${subject} - Khối lớp: Lớp ${grade}
• Căn cứ pháp lý:
  - Khung năng lực số dành cho người học (Bộ GD&ĐT)
  - Khung năng lực Trí tuệ nhân tạo (Quyết định 2422/QĐ-BGDĐT)
  - Giáo dục hòa nhập học sinh khuyết tật
  - Thông tư 08/2024/TT-BGDĐT về lồng ghép GDQP&AN
  - Định hướng lồng ghép giáo dục môi trường & ứng phó BĐKH
• Tổng số đoạn chèn đã duyệt: ${selectedCats.length} đoạn
  + Năng lực số (NLS): ${nlsCount} đoạn
  + Năng lực AI: ${aiCount} đoạn
  + Học sinh khuyết tật hòa nhập: ${ktCount} đoạn
  + Giáo dục Quốc phòng & An ninh: ${qpCount} đoạn
  + Biến đổi khí hậu & Môi trường: ${bdCount} đoạn
• Thời gian xuất báo cáo: ${new Date().toLocaleString("vi-VN")}`;

    navigator.clipboard.writeText(rpt).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    }).catch(() => {
      alert("Không thể sao chép tự động, vui lòng thử lại.");
    });
  };

  // Tải file Word đã chèn
  const handleDownloadWord = async () => {
    if (!docInfo || items.length === 0) return;
    setDownloading(true);
    try {
      const activeItems = items.filter(it => it.on);
      const blob = await generatePatchedDocx(docInfo, activeItems, colorEnabled);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const baseName = docInfo.fileName.replace(/\.docx$/i, "");
      a.href = url;
      a.download = `${baseName}_Tich_Hop.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo file Word: " + (err.message || "Không xác định"));
    } finally {
      setDownloading(false);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter(it => it.k === activeFilter);
  }, [items, activeFilter]);

  const activeCount = useMemo(() => items.filter(it => it.on).length, [items]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Container */}
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header Title Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-3xl shadow-md shrink-0">
              🧩
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  TÍCH HỢP CÁC NỘI DUNG VÀO GIÁO ÁN
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
                  ✨ BẢN ĐẦY ĐỦ • MIỄN PHÍ
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Tải giáo án Word → Chọn nội dung tích hợp (NLS, AI, Khuyết tật, GDQPAN, BĐKH) → AI chèn vào đúng chỗ, giữ nguyên 100% ảnh, bảng, công thức của file gốc.
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {[
            { id: 0, num: "1", title: "Giáo án", desc: "Tải file Word & Phân tích" },
            { id: 1, num: "2", title: "Nội dung tích hợp", desc: "Chọn NLS, AI, HSKT, QP, BĐKH" },
            { id: 2, num: "3", title: "Duyệt · Tải Word", desc: `Xem ${items.length} đoạn chèn & Tải docx` }
          ].map(s => {
            const isActive = step === s.id;
            const isDone = (s.id === 0 && !!docInfo) || (s.id === 1 && items.length > 0) || (s.id === 2 && activeCount > 0);
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id === 0 || (s.id === 1 && docInfo) || (s.id === 2 && items.length > 0)) {
                    setStep(s.id);
                  }
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300"
                    : isDone
                    ? "bg-white text-slate-800 border-purple-200 hover:border-purple-300"
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

        {/* Alert Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* ==================== BƯỚC 1: GIÁO ÁN ==================== */}
        {step === 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span>📄</span> Bước 1: Chọn giáo án cần tích hợp
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Hỗ trợ file Word (.docx). Hệ thống sẽ tự động quét số đoạn, bảng biểu, ảnh và công thức toán học.
            </p>

            {/* Upload Area */}
            {!docInfo ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-purple-500 bg-purple-50/50 scale-[1.01]"
                    : "border-slate-300 hover:border-purple-400 hover:bg-slate-50/50"
                }`}
                onClick={() => document.getElementById("file-lesson-input").click()}
              >
                <input
                  id="file-lesson-input"
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                  📥
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Bấm hoặc kéo thả file giáo án Word (.docx) vào đây
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Khuyến nghị tải từng bài dạy (1 - 3 tiết) để AI phân tích chuẩn xác và chi tiết nhất.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-2xl shrink-0 font-bold">
                      W
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{docInfo.fileName}</h4>
                      <div className="flex items-center gap-2 flex-wrap mt-1 text-xs font-semibold text-slate-600">
                        <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-md">
                          {docInfo.paraCount} đoạn văn
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md">
                          {docInfo.tables} bảng biểu
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-md">
                          {docInfo.images} hình ảnh
                        </span>
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-md">
                          {docInfo.maths} công thức
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDocInfo(null); setItems([]); }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all self-start sm:self-center"
                  >
                    Chọn file khác
                  </button>
                </div>
              </div>
            )}

            {/* Form Thiết Lập Môn & Lớp */}
            {docInfo && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-4">
                  Xác nhận thông tin bài dạy (AI tự động nhận diện từ file)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Môn học</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Khối lớp</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(Number(e.target.value))}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Tên bài học</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Nhập tên bài dạy..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* PPCT Upload Option */}
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-indigo-900">
                      Phân phối chương trình (PPCT - Tùy chọn)
                    </div>
                    <div className="text-xs text-indigo-600">
                      {ppctName ? `Đã tải: ${ppctName}` : "Tải file PPCT (.docx/.xlsx) để AI trích xuất chính xác theo quy định nhà trường."}
                    </div>
                  </div>
                  <label className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-50 shrink-0">
                    {ppctName ? "Đổi file" : "Tải PPCT"}
                    <input type="file" accept=".docx,.xlsx" className="hidden" onChange={e => e.target.files?.[0] && handlePpctUpload(e.target.files[0])} />
                  </label>
                </div>

                {/* Action button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Tiếp tục: chọn nội dung tích hợp</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== BƯỚC 2: NỘI DUNG TÍCH HỢP ==================== */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>🧩</span> Bước 2: Chọn nội dung cần tích hợp
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Bật các nội dung thầy/cô muốn lồng ghép vào kế hoạch bài dạy.
                </p>
              </div>
              <button
                onClick={() => setStep(0)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl"
              >
                ← Quay lại giáo án
              </button>
            </div>

            <div className="space-y-4 my-6">
              {/* 1. Năng lực số */}
              <div className={`p-5 rounded-2xl border transition-all ${opts.nls ? "bg-blue-50/50 border-blue-400" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💻</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Năng lực số (NLS)</h4>
                      <p className="text-xs text-slate-500">Mục tiêu + hoạt động, gạch chân kèm mã chỉ báo (vd 1.2.TC1a)</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={opts.nls}
                    onChange={e => setOpts({ ...opts, nls: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
                {opts.nls && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <input
                      type="text"
                      value={nlsNote}
                      onChange={e => setNlsNote(e.target.value)}
                      placeholder="Yêu cầu NLS cụ thể (để trống = AI tự chọn chỉ báo chuẩn theo bài)..."
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                )}
              </div>

              {/* 2. Năng lực AI */}
              <div className={`p-5 rounded-2xl border transition-all ${opts.ai ? "bg-red-50/50 border-red-400" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Năng lực Trí tuệ nhân tạo (AI)</h4>
                      <p className="text-xs text-slate-500">Theo khung QĐ 2422 của Bộ GD&ĐT, chữ đỏ phân biệt</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={opts.ai}
                    onChange={e => setOpts({ ...opts, ai: e.target.checked })}
                    className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                  />
                </div>
                {opts.ai && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <input
                      type="text"
                      value={aiNote}
                      onChange={e => setAiNote(e.target.value)}
                      placeholder="Yêu cầu AI cụ thể (ví dụ: dùng chatbot AI tra cứu, tạo ảnh minh họa bài học)..."
                      className="w-full p-2.5 bg-white border border-red-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                )}
              </div>

              {/* 3. Dạy học hòa nhập HSKT */}
              <div className={`p-5 rounded-2xl border transition-all ${opts.kt ? "bg-emerald-50/50 border-emerald-400" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Học sinh khuyết tật hòa nhập</h4>
                      <p className="text-xs text-slate-500">Mục tiêu riêng + nhiệm vụ điều chỉnh giảm tải ở từng hoạt động, chữ xanh lá</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={opts.kt}
                    onChange={e => setOpts({ ...opts, kt: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                {opts.kt && (
                  <div className="mt-3 pt-3 border-t border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800 mb-2">Chọn dạng khuyết tật trong lớp:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {DISABILITY_TYPES.map(d => {
                        const isSel = selectedDisabilities.includes(d.key);
                        return (
                          <label
                            key={d.key}
                            onClick={() => {
                              setSelectedDisabilities(prev =>
                                isSel ? prev.filter(k => k !== d.key) : [...prev, d.key]
                              );
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              isSel ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <span>{d.label}</span>
                            <span className="text-emerald-700 font-bold">{isSel ? "✓" : "+"}</span>
                          </label>
                        );
                      })}
                    </div>
                    <textarea
                      value={disabilityNote}
                      onChange={e => setDisabilityNote(e.target.value)}
                      placeholder="Ghi chú điều chỉnh riêng cho HSKT (ví dụ: Giảm nhẹ mục tiêu 2, cho dùng máy tính cầm tay, cử bạn hỗ trợ)..."
                      rows={2}
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* 4. Giáo dục Quốc phòng & An ninh */}
              <div className={`p-5 rounded-2xl border transition-all ${opts.qp ? "bg-indigo-50/50 border-indigo-400" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇻🇳</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Giáo dục quốc phòng và an ninh (GDQP&AN)</h4>
                      <p className="text-xs text-slate-500">Căn cứ Thông tư 08/2024/TT-BGDĐT, chữ xanh dương, có tiền tố [Tích hợp GDQPAN]</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={opts.qp}
                    onChange={e => setOpts({ ...opts, qp: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                {opts.qp && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-xs font-bold text-indigo-900 mb-2">Bấm gợi ý nhanh chủ đề lồng ghép:</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {GDQPAN_SUGGESTIONS.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setQpNote(prev => (prev ? prev + "; " + sug : sug))}
                          className="text-[11px] bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg font-medium"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={qpNote}
                      onChange={e => setQpNote(e.target.value)}
                      placeholder="Nhập nội dung lồng ghép GDQP&AN cụ thể cho bài dạy này..."
                      rows={2}
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                )}
              </div>

              {/* 5. Biến đổi khí hậu & Môi trường */}
              <div className={`p-5 rounded-2xl border transition-all ${opts.bd ? "bg-orange-50/50 border-orange-400" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Biến đổi khí hậu - Phòng chống thiên tai (BĐKH)</h4>
                      <p className="text-xs text-slate-500">Giáo dục sinh thái, tiết kiệm năng lượng, lối sống xanh, chữ màu cam</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={opts.bd}
                    onChange={e => setOpts({ ...opts, bd: e.target.checked })}
                    className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                  />
                </div>
                {opts.bd && (
                  <div className="mt-3 pt-3 border-t border-orange-100">
                    <p className="text-xs font-bold text-orange-900 mb-2">Bấm gợi ý nhanh chủ đề môi trường:</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {BDKH_SUGGESTIONS.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBdNote(prev => (prev ? prev + "; " + sug : sug))}
                          className="text-[11px] bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 px-2.5 py-1 rounded-lg font-medium"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={bdNote}
                      onChange={e => setBdNote(e.target.value)}
                      placeholder="Nhập nội dung lồng ghép BĐKH cụ thể (ví dụ: liên hệ bài toán rác thải nhựa, tiết kiệm điện phòng học)..."
                      rows={2}
                      className="w-full p-2.5 bg-white border border-orange-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Run Action */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-sm"
              >
                ← Quay lại giáo án
              </button>
              <button
                onClick={handleRunAi}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <span>✨ KÍCH HOẠT TÍCH HỢP VÀO GIÁO ÁN</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 3: DUYỆT & TẢI WORD ==================== */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            {/* Header Duyệt */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📥</span> Bước 3: Duyệt các đoạn chèn & Tải file Word
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  AI đọc giáo án và đề xuất {items.length} đoạn chèn. Thầy/cô có thể bật/tắt hoặc chỉnh sửa câu chữ trực tiếp trước khi xuất file.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>📋</span>
                  <span>{copiedReport ? "✓ Đã sao chép!" : "Báo cáo tích hợp"}</span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  🔄 Tích hợp lại
                </button>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: `Tất cả (${items.length})` },
                  { id: "nls", label: `Năng lực số (${items.filter(i => i.k === "nls").length})` },
                  { id: "ai", label: `Năng lực AI (${items.filter(i => i.k === "ai").length})` },
                  { id: "kt", label: `HS khuyết tật (${items.filter(i => i.k === "kt").length})` },
                  { id: "qp", label: `GDQPAN (${items.filter(i => i.k === "qp").length})` },
                  { id: "bd", label: `BĐKH (${items.filter(i => i.k === "bd").length})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === f.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setItems(prev => prev.map(it => ({ ...it, on: true })))}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  Chọn hết
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setItems(prev => prev.map(it => ({ ...it, on: false })))}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Bỏ hết
                </button>
                <span className="text-slate-300">•</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={colorEnabled}
                    onChange={e => setColorEnabled(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <span>Tô màu phần tích hợp</span>
                </label>
              </div>
            </div>

            {/* List of Inserted Segments */}
            <div className="space-y-4 my-6">
              {filteredItems.map(item => {
                const cat = CATEGORIES[item.k] || CATEGORIES.nls;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.on ? "bg-white border-slate-300 shadow-sm" : "bg-slate-50/60 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.on}
                          onChange={e => {
                            const val = e.target.checked;
                            setItems(prev => prev.map(it => it.id === item.id ? { ...it, on: val } : it));
                          }}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                        <span
                          style={{ backgroundColor: cat.bg, color: cat.textCol, borderColor: cat.border }}
                          className="px-2.5 py-0.5 rounded-lg border text-xs font-extrabold uppercase tracking-wide"
                        >
                          {cat.label}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Vị trí: sau đoạn {item.a} • Kiểu: {item.w === "end" ? "nối cuối đoạn" : "dòng mới bên dưới"}
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={item.t}
                      onChange={e => {
                        const val = e.target.value;
                        setItems(prev => prev.map(it => it.id === item.id ? { ...it, t: val } : it));
                      }}
                      rows={2}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                );
              })}
            </div>

            {/* Download CTA Bar */}
            <div className="sticky bottom-4 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>📥</span> Đã duyệt {activeCount} / {items.length} đoạn chèn
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  File Word giữ nguyên 100% font chữ, bảng, ảnh, công thức gốc của giáo án.
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => { setStep(0); setDocInfo(null); setItems([]); }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
                >
                  🔄 Giáo án khác
                </button>
                <button
                  onClick={handleDownloadWord}
                  disabled={downloading || activeCount === 0}
                  className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{downloading ? "Đang tạo file..." : `📥 Tải Word (${activeCount} đoạn)`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              ✨
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">AI Đang Xử Lý Tích Hợp</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">{progressStatus}</p>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-bold">
              <span>Đang tính toán...</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-10 mt-12 border-t border-slate-200/60">
        <p className="font-semibold text-slate-600">
          ✨ MHEdu AI • Đồng hành cùng Giáo viên Đổi mới & Chuyển đổi số Giáo dục
        </p>
        <p className="mt-1">
          Hệ thống phát triển bởi NMH Thầy Nguyễn Mạnh Hùng • Bảo toàn 100% định dạng giáo án gốc
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
