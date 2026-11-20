// ===================================================
// AI QUESTION GENERATOR MODULE - LIÊN CẤP & ĐA MÔN HỌC
// Hỗ trợ Gemini API, LaTeX & Bộ sinh câu hỏi chuẩn chuyên biệt từng môn
// v3.0 - Topic-aware: câu hỏi LUÔN bám sát chủ đề GV nhập
// ===================================================

class AIGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
    }

    setApiKey(key) {
        this.apiKey = key.trim();
        localStorage.setItem('gemini_api_key', this.apiKey);
    }

    getApiKey() {
        return this.apiKey;
    }

    // Hàm chính sinh câu hỏi
    async generateQuestions(topic, count, type = 'tnkq', gradeLevel = 'cap1') {
        count = parseInt(count) || 10;
        topic = topic ? topic.trim() : 'Kiến thức tổng hợp';

        // 1. Thử gọi Gemini API nếu có API key
        if (this.apiKey) {
            try {
                const aiResult = await this.callGeminiAPI(topic, count, type, gradeLevel);
                if (aiResult && aiResult.length > 0) {
                    return aiResult;
                }
            } catch (err) {
                console.warn('Lỗi khi gọi Gemini API, chuyển sang bộ sinh dự phòng chuyên môn:', err);
            }
        }

        // 2. Dự phòng thông minh offline theo đúng môn học và cấp học
        return this.generateSmartFallback(topic, count, type, gradeLevel);
    }

    // Gọi Gemini API với hướng dẫn LaTeX và chuyên môn sâu
    async callGeminiAPI(topic, count, type, gradeLevel) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        const gradeDescriptions = {
            'cap1': 'CẤP 1 (Tiểu học - Lớp 1 đến 5): Ngôn ngữ trong sáng, gần gũi, câu hỏi vui tươi, kiến thức chuẩn tiểu học.',
            'cap2': 'CẤP 2 (THCS - Lớp 6 đến 9): Mức độ nhận biết và thông hiểu theo chương trình GDPT THCS.',
            'cap3': 'CẤP 3 (THPT - Lớp 10 đến 12): Mức độ thông hiểu và vận dụng bám sát chương trình THPT và đề thi Tốt nghiệp THPT.'
        };

        const targetGrade = gradeDescriptions[gradeLevel] || gradeDescriptions['cap1'];

        let formatInstruction = '';
        if (type === 'tnkq') {
            formatInstruction = `Mỗi câu hỏi có 4 lựa chọn A, B, C, D và ghi rõ đáp án đúng là chữ cái A, B, C hoặc D.
Định dạng JSON yêu cầu:
[
  {
    "question": "Nội dung câu hỏi (chứa công thức LaTeX kẹp trong dấu $ nếu có)?",
    "type": "tnkq",
    "options": ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"],
    "answer": "A",
    "explanation": "Giải thích ngắn"
  }
]`;
        } else {
            formatInstruction = `Mỗi câu hỏi là câu hỏi tự luận ngắn hoặc câu hỏi tính toán có đáp án ngắn gọn (từ 1-5 từ hoặc một con số/công thức).
Định dạng JSON yêu cầu:
[
  {
    "question": "Nội dung câu hỏi ngắn (chứa LaTeX nếu có)?",
    "type": "tuluan",
    "answer": "Đáp án chuẩn",
    "explanation": "Giải thích ngắn"
  }
]`;
        }

        const promptText = `Bạn là một chuyên gia giáo dục thiết kế câu hỏi trò chơi học tập cho học sinh Việt Nam.
Đối tượng học sinh: ${targetGrade}
Chủ đề môn học BẮT BUỘC: "${topic}".
Số lượng: ${count} câu hỏi.
Loại câu hỏi: ${type === 'tnkq' ? 'Trắc nghiệm khách quan 4 lựa chọn (TNKQ)' : 'Tự luận / Trả lời ngắn'}.
${formatInstruction}

LƯU Ý QUAN TRỌNG:
1. BẮT BUỘC toàn bộ câu hỏi phải thuộc đúng chủ đề "${topic}". Tuyệt đối KHÔNG được lẫn sang chủ đề/môn khác.
2. Đối với các công thức Toán học, Hóa học hoặc Vật lý: BẮT BUỘC sử dụng ký hiệu LaTeX kẹp trong cặp dấu $ (Ví dụ: $H_2SO_4$, $N_2$, $NH_3$, $\\frac{a}{b}$, $\\sqrt{x}$).
3. Độ khó và thuật ngữ PHẢI chuẩn xác theo cấp học (${gradeLevel.toUpperCase()}).
4. Chỉ trả về duy nhất chuỗi JSON hợp lệ trong một cặp ngoặc vuông [ ... ], không thêm bất kỳ văn bản Markdown, giải thích ngoài lề nào khác.`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 3500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.map((q, idx) => ({
                id: idx + 1,
                question: q.question || `Câu hỏi ${idx + 1}`,
                type: type,
                options: q.options || (type === 'tnkq' ? ['A. Đúng', 'B. Sai', 'C. Có thể', 'D. Không rõ'] : []),
                answer: (q.answer || 'A').toString().trim(),
                explanation: q.explanation || ''
            }));
        }

        throw new Error('Không phân tích được định dạng JSON từ Gemini');
    }

    // =====================================================
    // NHẬN DIỆN MÔN HỌC CHÍNH XÁC (mở rộng 100+ từ khóa)
    // =====================================================
    detectSubject(topic) {
        const t = topic.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu để so khớp dễ hơn
            .toLowerCase();

        // HÓA HỌC — phải đặt trước vì có nhiều từ chung
        if (
            t.includes('hoa hoc') || t.includes('hoa') && (t.includes('huu co') || t.includes('vo co')) ||
            t.includes('nito') || t.includes('nitrogen') || t.includes('nitơ') || t.includes('nito') ||
            t.includes('cacbon') || t.includes('carbon') || t.includes('luu huynh') || t.includes('sulfur') ||
            t.includes('photpho') || t.includes('phosphorus') || t.includes('halogen') ||
            t.includes('oxi') || t.includes('oxygen') || t.includes('hidro') || t.includes('hydrogen') ||
            t.includes('amoniac') || t.includes('ammonia') || t.includes('este') || t.includes('ester') ||
            t.includes('amin') || t.includes('ancol') || t.includes('alcohol') ||
            t.includes('axit') && !t.includes('bazo') || t.includes('acid') ||
            t.includes('muoi') && !t.includes('an') && !t.includes('bep') ||
            t.includes('baze') || t.includes('bazo') || t.includes('hidroxit') ||
            t.includes('kim loai') || t.includes('phi kim') || t.includes('a kim') ||
            t.includes('nguyen to') || t.includes('bang tuan hoan') || t.includes('periodic') ||
            t.includes('phan ung') && !t.includes('vat ly') || t.includes('reaction') ||
            t.includes('nguyen tu') || t.includes('phan tu') || t.includes('ion') ||
            t.includes('glucozo') || t.includes('glucose') || t.includes('saccarozo') ||
            t.includes('tinh bot') || t.includes('xenlulozo') || t.includes('cellulose') ||
            t.includes('protein') || t.includes('amino acid') ||
            t.includes('lipid') || t.includes('chat beo') || t.includes('chat deo') ||
            t.includes('polymer') || t.includes('polime') ||
            t.includes('dien phan') || t.includes('electrolysis') ||
            t.includes('pin dien') || t.includes('an mon') || t.includes('corrosion') ||
            t.includes('nhiet phan') || t.includes('thuy phan') ||
            t.includes('oxi hoa') || t.includes('khu') && t.includes('phan ung') ||
            t.includes('h2so4') || t.includes('hno3') || t.includes('hcl') ||
            t.includes('naoh') || t.includes('nacl') || t.includes('caco3') ||
            t.includes('fe2o3') || t.includes('al2o3') || t.includes('cu') && t.includes('kim') ||
            t.includes('sat') && !t.includes('lich') || t.includes('nhom') && !t.includes('bai') ||
            t.includes('dong') && (t.includes('kim') || t.includes('loai')) ||
            t.includes('vang') && t.includes('kim') || t.includes('bac') && t.includes('kim') ||
            t.includes('crom') || t.includes('mangan') || t.includes('kali') || t.includes('natri') ||
            t.includes('canxi') || t.includes('magie') || t.includes('kem') && t.includes('kim')
        ) return 'chemistry';

        // VẬT LÝ
        if (
            t.includes('vat ly') || t.includes('physics') || t.includes('dao dong') ||
            t.includes('song') && (t.includes('am') || t.includes('co') || t.includes('dien tu')) ||
            t.includes('dien xoay chieu') || t.includes('tu truong') || t.includes('dien truong') ||
            t.includes('quang hoc') || t.includes('luong tu') || t.includes('hat nhan') ||
            t.includes('dong hoc') || t.includes('dong luc') || t.includes('co hoc') ||
            t.includes('nhiet hoc') || t.includes('quang ly') || t.includes('suc can') ||
            t.includes('luc') && !t.includes('bao') || t.includes('khoi luong') ||
            t.includes('gia toc') || t.includes('van toc') || t.includes('momentum') ||
            t.includes('dong nang') || t.includes('the nang') || t.includes('cong suat') ||
            t.includes('dien tro') || t.includes('tu cam') || t.includes('dien dung') ||
            t.includes('pho hap thu') || t.includes('phan xa') || t.includes('khuc xa')
        ) return 'physics';

        // SINH HỌC
        if (
            t.includes('sinh hoc') || t.includes('biology') || t.includes('di truyen') ||
            t.includes('menden') || t.includes('te bao') || t.includes('adn') || t.includes('gen') ||
            t.includes('nhiem sac the') || t.includes('chromosom') ||
            t.includes('quang hop') || t.includes('photosynthesis') ||
            t.includes('han hap') || t.includes('respiration') || t.includes('enzyme') ||
            t.includes('tien hoa') || t.includes('evolution') || t.includes('sinh thai') ||
            t.includes('he sinh thai') || t.includes('quan the') || t.includes('quan xa') ||
            t.includes('ho sinh san') || t.includes('mau sac') && t.includes('hoa') ||
            t.includes('vi khuan') || t.includes('bacteria') || t.includes('virus') ||
            t.includes('nam') && t.includes('thuc vat') || t.includes('thuc vat') ||
            t.includes('dong vat') || t.includes('nguoi') && t.includes('gioi tinh')
        ) return 'biology';

        // TOÁN HỌC
        if (
            t.includes('toan') || t.includes('math') || t.includes('tinh') && !t.includes('hoa') ||
            t.includes('dai so') || t.includes('hinh hoc') || t.includes('giai tich') ||
            t.includes('dao ham') || t.includes('tich phan') || t.includes('gioi han') ||
            t.includes('ham so') || t.includes('phuong trinh') || t.includes('bat phuong trinh') ||
            t.includes('ma tran') || t.includes('vector') || t.includes('oxyz') ||
            t.includes('xac suat') || t.includes('thong ke') || t.includes('to hop') ||
            t.includes('luong giac') || t.includes('so phuc') || t.includes('logarit') ||
            t.includes('cot so') || t.includes('hinh khong gian') || t.includes('khai niem') && t.includes('so')
        ) return 'math';

        // LỊCH SỬ
        if (
            t.includes('lich su') || t.includes('history') || t.includes('chien dich') ||
            t.includes('khang chien') || t.includes('cach mang') || t.includes('trieu dai') ||
            t.includes('vua') || t.includes('chinh tri') && t.includes('lich') ||
            t.includes('dien bien phu') || t.includes('chien tranh') || t.includes('giai phong') ||
            t.includes('bac ho') || t.includes('ho chi minh') && t.includes('su')
        ) return 'history';

        // ĐỊA LÝ
        if (
            t.includes('dia ly') || t.includes('geography') || t.includes('ban do') ||
            t.includes('khi hau') || t.includes('dia hinh') || t.includes('song') && t.includes('bien') ||
            t.includes('dan cu') || t.includes('kinh te') && t.includes('dia') ||
            t.includes('tu nhien') && t.includes('viet nam') || t.includes('chau a') || t.includes('trai dat')
        ) return 'geography';

        // VĂN HỌC
        if (
            t.includes('van hoc') || t.includes('ngu van') || t.includes('tho') && !t.includes('hoc sinh') ||
            t.includes('truyen') || t.includes('tac pham') || t.includes('tac gia') ||
            t.includes('nguyen du') || t.includes('kieu') && t.includes('truyen') ||
            t.includes('tieng viet') || t.includes('tu vung') || t.includes('ngu phap') && t.includes('viet') ||
            t.includes('van ban') || t.includes('bai tho') || t.includes('doan van')
        ) return 'literature';

        // TIẾNG ANH
        if (
            t.includes('tieng anh') || t.includes('english') || t.includes('grammar') ||
            t.includes('vocabulary') || t.includes('tu vung') && t.includes('anh') ||
            t.includes('ngu phap') && t.includes('anh') || t.includes('thptqg') && t.includes('anh') ||
            t.includes('listening') || t.includes('reading') || t.includes('writing') && t.includes('anh')
        ) return 'english';

        return 'general';
    }

    // =====================================================
    // NGÂN HÀNG CÂU HỎI CHUYÊN ĐỀ (topic-specific banks)
    // Các chủ đề phổ biến nhất trong CT phổ thông VN
    // =====================================================
    getTopicSpecificBank(topic, gradeLevel) {
        const t = topic.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        // === NITƠ & HỢP CHẤT CỦA NITƠ ===
        if (t.includes('nito') || t.includes('nitrogen') || t.includes('nito')) {
            return [
                { q: "Nitơ ($N_2$) chiếm bao nhiêu phần trăm thể tích không khí khô?", opt: ["A. 78%", "B. 21%", "C. 1%", "D. 96%"], ans: "A", val: "78" },
                { q: "Cấu hình electron lớp ngoài cùng của nguyên tử Nitơ (số hiệu nguyên tử 7) là gì?", opt: ["A. $2s^2 2p^3$", "B. $2s^2 2p^4$", "C. $2s^2 2p^5$", "D. $2s^2 2p^2$"], ans: "A", val: "2s2 2p3" },
                { q: "Amoniac ($NH_3$) có tính chất vật lý nào sau đây?", opt: ["A. Chất khí không màu, mùi khai, nhẹ hơn không khí", "B. Chất lỏng màu vàng, mùi hăng", "C. Chất rắn màu trắng, không mùi", "D. Chất khí màu nâu đỏ, độc hại"], ans: "A", val: "khi khong mau mui khai" },
                { q: "Phản ứng tổng hợp amoniac ($NH_3$) từ $N_2$ và $H_2$ (phương pháp Haber) xảy ra ở điều kiện nào?", opt: ["A. Nhiệt độ cao, áp suất cao, xúc tác $Fe$", "B. Nhiệt độ thường, áp suất thường, không cần xúc tác", "C. Nhiệt độ thấp, áp suất thấp, xúc tác $Pt$", "D. Điện phân trong dung dịch"], ans: "A", val: "nhiet do cao ap suat cao Fe" },
                { q: "Axit nitric ($HNO_3$) đặc, nóng tác dụng với hầu hết kim loại sinh ra sản phẩm khí nào?", opt: ["A. $NO_2$ (màu nâu đỏ)", "B. $NO$ (không màu)", "C. $N_2O$ (cười)", "D. $NH_3$ (mùi khai)"], ans: "A", val: "NO2" },
                { q: "Muối amoni ($NH_4^+$) khi bị nhiệt phân thường tạo ra sản phẩm nào?", opt: ["A. Amoniac ($NH_3$) và axit tương ứng", "B. Khí Nitơ ($N_2$) và nước", "C. Khí Oxy ($O_2$) và nước", "D. Không bị phân hủy"], ans: "A", val: "NH3 va axit" },
                { q: "Dung dịch $HNO_3$ loãng tác dụng với kim loại $Fe$ tạo ra muối $Fe$ ở hóa trị mấy?", opt: ["A. $Fe^{3+}$ (sắt III)", "B. $Fe^{2+}$ (sắt II)", "C. $Fe^{0}$ (sắt nguyên chất)", "D. Không phản ứng"], ans: "A", val: "Fe3+" },
                { q: "Trong phòng thí nghiệm, khí Nitơ ($N_2$) được điều chế bằng cách đun nóng dung dịch muối nào?", opt: ["A. Amoni nitrit ($NH_4NO_2$)", "B. Amoni clorua ($NH_4Cl$)", "C. Natri nitrat ($NaNO_3$)", "D. Canxi nitrat ($Ca(NO_3)_2$)"], ans: "A", val: "NH4NO2" },
                { q: "Phản ứng nào sau đây chứng minh $NH_3$ có tính khử?", opt: ["A. $4NH_3 + 3O_2 \\xrightarrow{t^\\circ} 2N_2 + 6H_2O$", "B. $NH_3 + HCl \\rightarrow NH_4Cl$", "C. $NH_3 + H_2O \\rightleftharpoons NH_4^+ + OH^-$", "D. $2NH_3 \\xrightarrow{t^\\circ} N_2 + 3H_2$"], ans: "A", val: "khu" },
                { q: "Phân đạm urê có công thức hóa học là gì?", opt: ["A. $(NH_2)_2CO$", "B. $NH_4NO_3$", "C. $(NH_4)_2SO_4$", "D. $Ca(H_2PO_4)_2$"], ans: "A", val: "(NH2)2CO" },
                { q: "Nitơ đioxit ($NO_2$) khi hòa tan vào nước tạo ra hỗn hợp sản phẩm nào?", opt: ["A. $HNO_3$ và $HNO_2$", "B. Chỉ $HNO_3$", "C. $HNO_2$ và $NO$", "D. $HNO_3$ và $N_2O$"], ans: "A", val: "HNO3 va HNO2" },
                { q: "Trong phân tử $N_2$, hai nguyên tử N liên kết với nhau bằng loại liên kết nào?", opt: ["A. Ba liên kết cộng hóa trị (liên kết ba)", "B. Một liên kết cộng hóa trị (liên kết đơn)", "C. Hai liên kết cộng hóa trị (liên kết đôi)", "D. Liên kết ion"], ans: "A", val: "lien ket ba" }
            ];
        }

        // === CACBON & HỢP CHẤT ===
        if (t.includes('cacbon') || t.includes('carbon') || t.includes('cacbon') || 
            t.includes('co2') || t.includes('co,') || t.includes('hop chat cacbon')) {
            return [
                { q: "Cacbon ($C$) có số hiệu nguyên tử là bao nhiêu trong Bảng tuần hoàn?", opt: ["A. 6", "B. 7", "C. 8", "D. 14"], ans: "A", val: "6" },
                { q: "Khí $CO_2$ khi sục vào nước vôi trong dư tạo ra kết tủa màu trắng là chất nào?", opt: ["A. $CaCO_3$", "B. $Ca(OH)_2$", "C. $CaO$", "D. $Ca(HCO_3)_2$"], ans: "A", val: "CaCO3" },
                { q: "Kim cương và than chì là hai dạng thù hình của nguyên tố nào?", opt: ["A. Cacbon ($C$)", "B. Silic ($Si$)", "C. Lưu huỳnh ($S$)", "D. Photpho ($P$)"], ans: "A", val: "Cacbon" },
                { q: "Cacbon monoxit ($CO$) là khí rất độc vì lý do gì?", opt: ["A. Kết hợp với hemoglobin, ngăn O₂ vào máu", "B. Làm oxy hóa phổi mạnh", "C. Hòa tan muối trong máu", "D. Chất khí gây bỏng hô hấp"], ans: "A", val: "hemoglobin" },
                { q: "Khí $CO_2$ không duy trì sự cháy vì lý do gì?", opt: ["A. $CO_2$ là sản phẩm của sự cháy hoàn toàn, không còn phản ứng được nữa", "B. $CO_2$ là chất oxy hóa mạnh", "C. $CO_2$ nặng hơn không khí, dập tắt lửa", "D. Cả A và C đều đúng"], ans: "D", val: "D" },
                { q: "Phản ứng quang hợp của cây xanh liên quan trực tiếp đến khí nào sau đây?", opt: ["A. $CO_2$ và $O_2$", "B. $CO_2$ và $N_2$", "C. $O_2$ và $H_2$", "D. $CO$ và $H_2O$"], ans: "A", val: "CO2 va O2" },
                { q: "Hiệu ứng nhà kính chủ yếu do khí nào gây ra trong khí quyển?", opt: ["A. $CO_2$", "B. $O_2$", "C. $N_2$", "D. $Ar$"], ans: "A", val: "CO2" }
            ];
        }

        // === LƯU HUỲNH ===
        if (t.includes('luu huynh') || t.includes('sulfur') || t.includes('lưu huỳnh') ||
            t.includes('h2so4') || t.includes('so2') || t.includes('so3')) {
            return [
                { q: "Axit sunfuric ($H_2SO_4$) đặc có khả năng đặc biệt nào sau đây?", opt: ["A. Háo nước (hút ẩm mạnh, than hóa chất hữu cơ)", "B. Bay hơi nhanh ở nhiệt độ thường", "C. Ăn mòn thủy tinh", "D. Phát sáng trong bóng tối"], ans: "A", val: "hao nuoc" },
                { q: "Lưu huỳnh đioxit ($SO_2$) là một trong các nguyên nhân gây mưa axit. Mưa axit sinh ra axit nào?", opt: ["A. $H_2SO_3$ và $H_2SO_4$", "B. $HCl$", "C. $HNO_3$ và $H_2SO_4$", "D. $H_2SO_4$ và $HF$"], ans: "A", val: "H2SO3 va H2SO4" },
                { q: "Phương pháp công nghiệp sản xuất $H_2SO_4$ là phương pháp nào?", opt: ["A. Phương pháp tiếp xúc (oxi hóa $SO_2$ bằng $O_2$ có xúc tác $V_2O_5$)", "B. Phương pháp chưng cất lưu huỳnh", "C. Phương pháp điện phân $SO_3$", "D. Phương pháp Haber"], ans: "A", val: "tiep xuc" }
            ];
        }

        // === OXIT ===
        if (t.includes('oxit') || t.includes('oxide') || t.includes('oxi') || t.includes('oxygen')) {
            return [
                { q: "Oxi ($O_2$) chiếm bao nhiêu phần trăm thể tích không khí?", opt: ["A. 21%", "B. 78%", "C. 1%", "D. 50%"], ans: "A", val: "21" },
                { q: "Oxit nào sau đây là oxit axit?", opt: ["A. $SO_2$", "B. $Na_2O$", "C. $CaO$", "D. $MgO$"], ans: "A", val: "SO2" },
                { q: "Oxit nào sau đây là oxit bazơ tan trong nước tạo dung dịch kiềm?", opt: ["A. $Na_2O$", "B. $SO_3$", "C. $CO_2$", "D. $Al_2O_3$"], ans: "A", val: "Na2O" },
                { q: "Phản ứng của $CaO$ với $CO_2$ tạo ra sản phẩm gì?", opt: ["A. $CaCO_3$", "B. $Ca(OH)_2$", "C. $CaCl_2$", "D. $CaO_2$"], ans: "A", val: "CaCO3" },
                { q: "Nguyên tố Oxi có số oxi hóa nào trong phần lớn các hợp chất?", opt: ["A. -2", "B. +2", "C. -1", "D. 0"], ans: "A", val: "-2" }
            ];
        }

        // === HALOGEN (F, Cl, Br, I) ===
        if (t.includes('halogen') || t.includes('clo') || t.includes('chlorine') ||
            t.includes('flo') || t.includes('brom') || t.includes('iot') || t.includes('iodine')) {
            return [
                { q: "Khí clo ($Cl_2$) ở điều kiện thường có màu gì?", opt: ["A. Màu vàng lục", "B. Màu đỏ nâu", "C. Không màu", "D. Màu tím"], ans: "A", val: "vang luc" },
                { q: "Halogen nào có tính oxi hóa mạnh nhất?", opt: ["A. Flo ($F_2$)", "B. Clo ($Cl_2$)", "C. Brom ($Br_2$)", "D. Iot ($I_2$)"], ans: "A", val: "Flo" },
                { q: "Nước clo là hỗn hợp của những chất nào?", opt: ["A. $HCl$ và $HClO$", "B. $HClO_3$ và $HCl$", "C. $Cl_2$ và $H_2O$", "D. $HClO_4$ và $HCl$"], ans: "A", val: "HCl va HClO" },
                { q: "Nước Gia-ven (nước Javel) có thành phần chính là gì?", opt: ["A. $NaCl$ và $NaClO$", "B. $NaOH$ và $NaCl$", "C. $Cl_2$ và $NaOH$", "D. $HCl$ và $NaClO$"], ans: "A", val: "NaCl va NaClO" },
                { q: "Axit clohidric ($HCl$) tác dụng với kim loại $Zn$ tạo ra khí gì?", opt: ["A. $H_2$", "B. $Cl_2$", "C. $HCl$", "D. $ZnCl_2$"], ans: "A", val: "H2" }
            ];
        }

        // === KIM LOẠI KIỀM ===
        if (t.includes('kim loai kiem') || t.includes('nhom ia') || t.includes('natri') || 
            t.includes('kali') || t.includes('liti') || t.includes('sodium') || t.includes('potassium')) {
            return [
                { q: "Kim loại kiềm thuộc nhóm nào trong Bảng tuần hoàn?", opt: ["A. Nhóm IA", "B. Nhóm IIA", "C. Nhóm VIIA", "D. Nhóm VIII"], ans: "A", val: "IA" },
                { q: "Kim loại kiềm tác dụng với nước ở nhiệt độ thường tạo ra gì?", opt: ["A. Dung dịch kiềm và khí $H_2$", "B. Muối và nước", "C. Oxit kim loại và nước", "D. Không phản ứng"], ans: "A", val: "kiem va H2" },
                { q: "Kim loại nào trong nhóm IA có khối lượng riêng nhỏ nhất (nhẹ nhất)?", opt: ["A. Liti ($Li$)", "B. Natri ($Na$)", "C. Kali ($K$)", "D. Xesi ($Cs$)"], ans: "A", val: "Li" },
                { q: "Natri hiđroxit ($NaOH$) còn được gọi là gì?", opt: ["A. Xút ăn da", "B. Vôi sống", "C. Vôi tôi", "D. Muối ăn"], ans: "A", val: "xut an da" }
            ];
        }

        // === ESTE ===
        if (t.includes('este') || t.includes('ester') || t.includes('lip') || t.includes('chat beo')) {
            return [
                { q: "Este no, đơn chức, mạch hở có công thức phân tử tổng quát là gì?", opt: ["A. $C_n H_{2n} O_2$ $(n \\ge 2)$", "B. $C_n H_{2n-2} O_2$ $(n \\ge 3)$", "C. $C_n H_{2n} O$ $(n \\ge 1)$", "D. $C_n H_{2n+2} O_2$ $(n \\ge 2)$"], ans: "A", val: "CnH2nO2" },
                { q: "Chất nào sau đây là este có mùi thơm của chuối chín (isoamyl axetat)?", opt: ["A. $CH_3COOC_5H_{11}$", "B. $C_2H_5COOCH_3$", "C. $HCOOC_2H_5$", "D. $CH_3COOCH_3$"], ans: "A", val: "CH3COOC5H11" },
                { q: "Phản ứng thủy phân este trong môi trường kiềm gọi là gì?", opt: ["A. Phản ứng xà phòng hóa", "B. Phản ứng este hóa", "C. Phản ứng cộng hợp", "D. Phản ứng trùng hợp"], ans: "A", val: "xa phong hoa" },
                { q: "Chất béo là trieste của $C_3H_5(OH)_3$ (glixerol) với loại axit nào?", opt: ["A. Axit béo (axit cacboxylic mạch dài)", "B. Axit sunfuric ($H_2SO_4$)", "C. Axit axetic ($CH_3COOH$)", "D. Axit fomic ($HCOOH$)"], ans: "A", val: "axit beo" }
            ];
        }

        // === AMIN / AMINO AXIT ===
        if (t.includes('amin') && !t.includes('vitamin') || t.includes('amino') || t.includes('protein')) {
            return [
                { q: "Amin bậc một có công thức tổng quát là gì?", opt: ["A. $RNH_2$", "B. $R_2NH$", "C. $R_3N$", "D. $R_4N^+OH^-$"], ans: "A", val: "RNH2" },
                { q: "Metylamin ($CH_3NH_2$) khi tan vào nước tạo ra dung dịch có tính gì?", opt: ["A. Tính bazơ (làm quỳ tím hóa xanh)", "B. Tính axit (làm quỳ tím hóa đỏ)", "C. Trung tính", "D. Không tan trong nước"], ans: "A", val: "bazo" },
                { q: "Anilin ($C_6H_5NH_2$) có phản ứng đặc trưng với dung dịch brom tạo kết tủa màu gì?", opt: ["A. Màu trắng (2,4,6-tribromanilin)", "B. Màu vàng", "C. Màu xanh lam", "D. Màu đỏ nâu"], ans: "A", val: "trang" }
            ];
        }

        // === Không có bank riêng cho topic này ===
        return null;
    }

    // =====================================================
    // BỘ SINH FALLBACK CHÍNH: LUÔN BÁM SÁT TOPIC GV NHẬP
    // =====================================================
    generateSmartFallback(topic, count, type, gradeLevel = 'cap1') {
        const subject = this.detectSubject(topic);
        const results = [];

        // Bước 1: Thử lấy ngân hàng câu hỏi chuyên đề (topic-specific bank)
        const topicBank = this.getTopicSpecificBank(topic, gradeLevel);

        // Bước 2: Ngân hàng theo môn học chung
        const subjectDatabases = {
            chemistry: {
                cap3: [
                    { q: "Este no, đơn chức, mạch hở có công thức phân tử tổng quát là gì?", opt: ["A. $C_n H_{2n} O_2$ $(n \\ge 2)$", "B. $C_n H_{2n-2} O_2$ $(n \\ge 3)$", "C. $C_n H_{2n} O$ $(n \\ge 1)$", "D. $C_n H_{2n+2} O_2$ $(n \\ge 2)$"], ans: "A", val: "CnH2nO2" },
                    { q: "Anilin ($C_6H_5NH_2$) tác dụng với dung dịch nước brom tạo kết tủa màu gì?", opt: ["A. Màu trắng", "B. Màu vàng", "C. Màu xanh lam", "D. Màu đỏ nâu"], ans: "A", val: "trang" },
                    { q: "Kim loại kiềm nào thuộc nhóm IA có khối lượng riêng nhẹ nhất?", opt: ["A. Liti ($Li$)", "B. Natri ($Na$)", "C. Kali ($K$)", "D. Xesi ($Cs$)"], ans: "A", val: "Li" },
                    { q: "Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh?", opt: ["A. Metylamin ($CH_3NH_2$)", "B. Axit axetic ($CH_3COOH$)", "C. Anilin ($C_6H_5NH_2$)", "D. Glucozơ ($C_6H_{12}O_6$)"], ans: "A", val: "Metylamin" },
                    { q: "Kim loại nào sau đây có tính cứng nhất trong tất cả các kim loại?", opt: ["A. Crôm ($Cr$)", "B. Sắt ($Fe$)", "C. Titan ($Ti$)", "D. Vonfram ($W$)"], ans: "A", val: "Cr" },
                    { q: "Thủy phân hoàn toàn tinh bột trong môi trường axit thu được monosaccarit nào?", opt: ["A. Glucozơ", "B. Fructozơ", "C. Saccarozơ", "D. Mantozơ"], ans: "A", val: "Glucozo" },
                    { q: "Trong các kim loại sau, kim loại nào có tính dẫn điện tốt nhất?", opt: ["A. Bạc ($Ag$)", "B. Đồng ($Cu$)", "C. Vàng ($Au$)", "D. Nhôm ($Al$)"], ans: "A", val: "Ag" },
                    { q: "Số nguyên tử hiđro trong một phân tử axit axetic ($CH_3COOH$) là bao nhiêu?", opt: ["A. 4", "B. 2", "C. 3", "D. 6"], ans: "A", val: "4" }
                ],
                cap2: [
                    { q: "Ký hiệu hóa học của nguyên tố kim loại Sắt là gì?", opt: ["A. $Fe$", "B. $Cu$", "C. $Al$", "D. $Zn$"], ans: "A", val: "Fe" },
                    { q: "Công thức hóa học của Axit sunfuric là gì?", opt: ["A. $H_2SO_4$", "B. $HCl$", "C. $HNO_3$", "D. $H_2SO_3$"], ans: "A", val: "H2SO4" },
                    { q: "Khí nào sau đây duy trì sự cháy và sự sống?", opt: ["A. Khí Oxy ($O_2$)", "B. Khí Nitơ ($N_2$)", "C. Khí Carbonic ($CO_2$)", "D. Khí Hidro ($H_2$)"], ans: "A", val: "O2" },
                    { q: "Dung dịch nào sau đây làm quỳ tím hóa đỏ?", opt: ["A. Axit clohidric ($HCl$)", "B. Natri hidroxit ($NaOH$)", "C. Nước cất ($H_2O$)", "D. Muối ăn ($NaCl$)"], ans: "A", val: "HCl" },
                    { q: "Công thức hóa học của nước vôi trong là gì?", opt: ["A. $Ca(OH)_2$", "B. $CaO$", "C. $CaCO_3$", "D. $CaCl_2$"], ans: "A", val: "Ca(OH)2" },
                    { q: "Ở nhiệt độ thường, kim loại nào sau đây ở thể lỏng?", opt: ["A. Thủy ngân ($Hg$)", "B. Chì ($Pb$)", "C. Nhôm ($Al$)", "D. Vàng ($Au$)"], ans: "A", val: "Hg" }
                ],
                cap1: [
                    { q: "Nước nguyên chất đóng băng ở nhiệt độ bao nhiêu độ C?", opt: ["A. $0^\\circ C$", "B. $10^\\circ C$", "C. $100^\\circ C$", "D. $-10^\\circ C$"], ans: "A", val: "0" },
                    { q: "Khí nào cần thiết nhất cho con người và động vật hít thở?", opt: ["A. Khí Oxy", "B. Khí Gas", "C. Khí Khói bụi", "D. Khí Clo"], ans: "A", val: "Oxy" },
                    { q: "Muối ăn hàng ngày có vị gì đặc trưng?", opt: ["A. Vị mặn", "B. Vị ngọt", "C. Vị chua", "D. Vị cay"], ans: "A", val: "man" }
                ]
            },
            math: {
                cap3: [
                    { q: "Đạo hàm của hàm số $y = x^3 - 3x + 1$ là biểu thức nào?", opt: ["A. $y' = 3x^2 - 3$", "B. $y' = 3x^2 + 3$", "C. $y' = x^2 - 3$", "D. $y' = 3x - 3$"], ans: "A", val: "3x^2-3" },
                    { q: "Tích phân $\\int_0^1 x\\,dx$ có giá trị bằng bao nhiêu?", opt: ["A. $\\frac{1}{2}$", "B. 1", "C. $\\frac{1}{3}$", "D. 2"], ans: "A", val: "1/2" },
                    { q: "Số phức $z = 3 - 4i$ có môđun $|z|$ bằng bao nhiêu?", opt: ["A. 5", "B. 25", "C. 7", "D. $\\sqrt{7}$"], ans: "A", val: "5" }
                ],
                cap2: [
                    { q: "Nghiệm của phương trình bậc nhất $2x - 10 = 0$ là?", opt: ["A. $x = 5$", "B. $x = -5$", "C. $x = 2$", "D. $x = 10$"], ans: "A", val: "5" },
                    { q: "Tổng số đo ba góc trong một tam giác bằng bao nhiêu độ?", opt: ["A. $180^\\circ$", "B. $90^\\circ$", "C. $360^\\circ$", "D. $270^\\circ$"], ans: "A", val: "180" }
                ],
                cap1: [
                    { q: "Kết quả của phép tính: $25 \\times 4$ là bao nhiêu?", opt: ["A. 100", "B. 90", "C. 120", "D. 80"], ans: "A", val: "100" },
                    { q: "Một hình vuông có cạnh dài 6cm. Chu vi của hình vuông đó là?", opt: ["A. 24cm", "B. 36cm", "C. 18cm", "D. 30cm"], ans: "A", val: "24" }
                ]
            },
            physics: {
                cap3: [
                    { q: "Một vật dao động điều hòa với phương trình $x = A\\cos(\\omega t + \\varphi)$. Đại lượng $\\omega$ gọi là gì?", opt: ["A. Tần số góc", "B. Biên độ dao động", "C. Pha ban đầu", "D. Chu kì dao động"], ans: "A", val: "tan so goc" },
                    { q: "Công thức liên hệ giữa chu kì $T$ và tần số $f$ là?", opt: ["A. $T = \\frac{1}{f}$", "B. $T = 2\\pi f$", "C. $T = f$", "D. $T = \\frac{\\omega}{f}$"], ans: "A", val: "T=1/f" }
                ],
                cap2: [
                    { q: "Đơn vị đo cường độ dòng điện trong hệ SI là gì?", opt: ["A. Ampe ($A$)", "B. Vôn ($V$)", "C. Oát ($W$)", "D. Jun ($J$)"], ans: "A", val: "Ampe" },
                    { q: "Công thức định luật Ôm cho đoạn mạch chứa điện trở $R$ là gì?", opt: ["A. $I = \\frac{U}{R}$", "B. $I = U \\cdot R$", "C. $I = \\frac{R}{U}$", "D. $U = \\frac{I}{R}$"], ans: "A", val: "I=U/R" }
                ]
            },
            biology: {
                cap3: [
                    { q: "Quy luật phân li độc lập được phát hiện bởi nhà khoa học nào?", opt: ["A. Menđen", "B. Moocgan", "C. Đacuyn", "D. Lamac"], ans: "A", val: "Menden" },
                    { q: "Trong phân tử ADN kép, nguyên tắc bổ sung giữa các bazơ nitơ là?", opt: ["A. $A - T$ và $G - X$", "B. $A - U$ và $G - X$", "C. $A - G$ và $T - X$", "D. $A - X$ và $T - G$"], ans: "A", val: "A-T G-X" }
                ],
                cap2: [
                    { q: "Cơ quan nào trong cơ thể người có chức năng co bóp bơm máu đi nuôi cơ thể?", opt: ["A. Quả tim", "B. Hai lá phổi", "C. Dạ dày", "D. Gan"], ans: "A", val: "Tim" }
                ]
            },
            history: {
                cap3: [
                    { q: "Chiến dịch mang tên Bác giải phóng hoàn toàn miền Nam thống nhất đất nước diễn ra năm nào?", opt: ["A. 1975", "B. 1973", "C. 1976", "D. 1979"], ans: "A", val: "1975" }
                ],
                cap2: [
                    { q: "Chiến thắng Điện Biên Phủ kết thúc thắng lợi vào năm nào?", opt: ["A. 1954", "B. 1945", "C. 1975", "D. 1968"], ans: "A", val: "1954" }
                ],
                cap1: [
                    { q: "Bác Hồ đọc Tuyên ngôn Độc lập ngày nào?", opt: ["A. 02/09/1945", "B. 19/08/1945", "C. 30/04/1975", "D. 07/05/1954"], ans: "A", val: "02/09/1945" }
                ]
            },
            english: {
                cap3: [
                    { q: "If I ______ the lottery, I would travel around the world.", opt: ["A. won", "B. win", "C. had won", "D. would win"], ans: "A", val: "won" }
                ],
                cap2: [
                    { q: "She has lived in this city ______ 2015.", opt: ["A. since", "B. for", "C. at", "D. in"], ans: "A", val: "since" }
                ],
                cap1: [
                    { q: "How many months are there in one year?", opt: ["A. 12", "B. 10", "C. 7", "D. 24"], ans: "A", val: "12" }
                ]
            }
        };

        // Bước 3: Ghép nguồn câu hỏi (topic-specific trước, subject bank sau)
        let questionPool = [];

        if (topicBank && topicBank.length > 0) {
            questionPool = [...topicBank];
        }

        // Bổ sung từ subject bank nếu chưa đủ
        const subjectBank = subjectDatabases[subject];
        if (subjectBank) {
            const gradeBank = subjectBank[gradeLevel] || subjectBank['cap3'] || subjectBank['cap2'] || subjectBank['cap1'] || [];
            const otherGrades = Object.values(subjectBank).flat().filter(q => !gradeBank.includes(q));
            questionPool = [...questionPool, ...gradeBank, ...otherGrades];
        }

        // Nếu vẫn không có câu hỏi → dùng template nhúng topic
        if (questionPool.length === 0) {
            questionPool = this.buildTopicTemplates(topic, subject, gradeLevel);
        }

        // Trộn ngẫu nhiên
        const shuffled = [...questionPool].sort(() => 0.5 - Math.random());

        for (let i = 0; i < count; i++) {
            let item;

            if (i < shuffled.length) {
                item = shuffled[i];
            } else {
                // Sinh câu hỏi bổ sung nhúng topic khi hết bank
                item = this.generateExtraQuestion(topic, subject, gradeLevel, i);
            }

            if (type === 'tnkq') {
                results.push({
                    id: i + 1,
                    question: item.q,
                    type: 'tnkq',
                    options: item.opt || ["A. Đúng", "B. Sai", "C. Có thể", "D. Không rõ"],
                    answer: item.ans || "A",
                    explanation: ""
                });
            } else {
                results.push({
                    id: i + 1,
                    question: item.q,
                    type: 'tuluan',
                    answer: item.val || item.ans || "1",
                    explanation: ""
                });
            }
        }

        return results;
    }

    // =====================================================
    // TEMPLATE NHÚNG TOPIC — dùng khi không có ngân hàng
    // =====================================================
    buildTopicTemplates(topic, subject, gradeLevel) {
        const capName = gradeLevel === 'cap1' ? 'tiểu học' : gradeLevel === 'cap2' ? 'THCS' : 'THPT';
        return [
            { q: `Trong chương trình ${capName}, "${topic}" thuộc lĩnh vực kiến thức nào?`, opt: ["A. Lý thuyết cơ bản", "B. Thực hành nâng cao", "C. Ứng dụng thực tiễn", "D. Kiến thức mở rộng"], ans: "A", val: "co ban" },
            { q: `Đặc điểm nổi bật nhất của "${topic}" trong chương trình học ${capName} là gì?`, opt: ["A. Tính hệ thống và ứng dụng thực tế rõ ràng", "B. Hoàn toàn trừu tượng, không cần thực nghiệm", "C. Chỉ áp dụng trong điều kiện lý tưởng", "D. Không liên quan đến các môn học khác"], ans: "A", val: "he thong" },
            { q: `Để học tốt chủ đề "${topic}", học sinh ${capName} cần nắm vững điều gì trước tiên?`, opt: ["A. Nắm chắc các khái niệm và định nghĩa cơ bản", "B. Chỉ cần học thuộc lòng công thức", "C. Không cần nền tảng kiến thức trước", "D. Bỏ qua lý thuyết, chú trọng bài tập"], ans: "A", val: "khai niem co ban" }
        ];
    }

    // =====================================================
    // SINH CÂU HỎI BỔ SUNG KHI HẾT BANK
    // =====================================================
    generateExtraQuestion(topic, subject, gradeLevel, idx) {
        const capName = gradeLevel === 'cap1' ? 'Tiểu học' : gradeLevel === 'cap2' ? 'THCS' : 'THPT';

        if (subject === 'chemistry') {
            const chemicals = [
                { name: `${topic}`, formula: ``, mass: 28 },
                { name: "Axit clohiđric", formula: "$HCl$", mass: 36.5 },
                { name: "Natri hiđroxit", formula: "$NaOH$", mass: 40 },
                { name: "Axit sunfuric", formula: "$H_2SO_4$", mass: 98 }
            ];
            const chem = chemicals[idx % chemicals.length];
            return {
                q: `[${capName}] Ứng dụng thực tiễn quan trọng của ${chem.name} ${chem.formula} trong đời sống hoặc công nghiệp là gì?`,
                opt: [`A. Được sử dụng rộng rãi trong sản xuất phân bón, công nghiệp hóa chất`, `B. Không có ứng dụng thực tiễn`, `C. Chỉ tồn tại trong thí nghiệm phòng lab`, `D. Chỉ dùng trong y tế`],
                ans: "A", val: "san xuat"
            };
        } else if (subject === 'math') {
            const a = Math.floor(Math.random() * 20) + 2;
            const b = Math.floor(Math.random() * 20) + 2;
            return {
                q: `[${capName}] Giá trị của biểu thức: $${a} \\times ${b}$ là bao nhiêu?`,
                opt: [`A. ${a * b}`, `B. ${a * b + 5}`, `C. ${a * b - 5}`, `D. ${a * b + 10}`],
                ans: "A", val: (a * b).toString()
            };
        } else if (subject === 'physics') {
            const f = Math.floor(Math.random() * 50) + 10;
            const T = (1 / f).toFixed(3);
            return {
                q: `[${capName}] Trong bài học về "${topic}", một vật dao động với tần số $f = ${f}\\text{ Hz}$. Chu kì dao động $T$ là bao nhiêu giây?`,
                opt: [`A. $${T}\\text{ s}$`, `B. $${(f).toFixed(0)}\\text{ s}$`, `C. $${(T * 2).toFixed(3)}\\text{ s}$`, `D. $${(T / 2).toFixed(3)}\\text{ s}$`],
                ans: "A", val: T.toString()
            };
        } else {
            return {
                q: `[${capName}] Khái niệm nào KHÔNG liên quan đến chủ đề "${topic}"?`,
                opt: [`A. Chủ đề hoàn toàn độc lập`, `B. Định nghĩa cơ bản`, `C. Ứng dụng thực tiễn`, `D. Phân loại và đặc điểm`],
                ans: "A", val: "doc lap"
            };
        }
    }
}

const aiQuestionGenerator = new AIGenerator();
window.aiQuestionGenerator = aiQuestionGenerator;
