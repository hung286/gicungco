/**
 * Module: realisticImageService.ts
 * Kiến trúc: 2 Lớp Khóa Tọa Độ (Dual-Layer Coordinate Lock)
 *   - Lớp 1 (Realistic Background): Sinh bởi AI vẽ nền không chữ (Pollinations.ai / Flux)
 *   - Lớp 2 (Mathematical Overlay): Sinh bởi Gemini Vision/Text, chứa hệ trục Oxyz, vector, nét đứt, nhãn điểm
 *   - Bộ lọc In Đề Thi (Exam Print Filter): Tối ưu in ấn đen trắng độ tương phản cao, nền trắng sạch sẽ
 * 
 * Bảo toàn 100% hệ thống cũ, chạy độc lập trên endpoint mới /api/realistic-image.
 */

export interface RealisticImageRequest {
  problemText?: string;
  image?: {
    base64: string;
    mimeType?: string;
  } | null;
  apiKey?: string;
  model?: string;
  subject?: 'math' | 'physics' | 'chemistry' | 'biology';
  generateBackground?: boolean;
}

export interface RealisticImageResponse {
  success: boolean;
  title: string;
  modelUsed: string;
  promptBackground?: string;
  backgroundImageData?: string | null;
  svgOverlay?: string;
  examPrintSvg?: string;
  error?: string;
}

export class KeyPoolManager {
  private keys: string[] = [];
  private currentIndex: number = 0;

  constructor(providedKeys?: string) {
    let envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (!envKeys) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const txt = fs.readFileSync(envPath, 'utf8');
          const m = txt.match(/GEMINI_API_KEY=([^\r\n]+)/);
          if (m && m[1]) envKeys = m[1].trim();
        }
      } catch {}
    }
    const raw = (providedKeys || envKeys).trim();
    
    // Tách bằng dấu phẩy, chấm phẩy hoặc xuống dòng
    this.keys = raw
      .replace(/[\n;\t]/g, ',')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 20 && k !== 'MY_GEMINI_API_KEY');
  }

  getCurrentKey(): string | null {
    if (this.keys.length === 0) return null;
    return this.keys[this.currentIndex % this.keys.length];
  }

  switchToNextKey(reason: string = ''): string | null {
    if (this.keys.length <= 1) return this.getCurrentKey();
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    const nextKey = this.getCurrentKey();
    console.warn(`[KeyPoolManager] Chuyển sang API Key tiếp theo (${reason}). Hậu tố: ...${nextKey ? nextKey.slice(-6) : 'None'}`);
    return nextKey;
  }

  hasKeys(): boolean {
    return this.keys.length > 0;
  }
}

/**
 * Hàm gọi Gemini an toàn với cơ chế xoay vòng Key và chuyển model tự động
 */
export async function safeGeminiCall(
  keyManager: KeyPoolManager,
  preferredModel: string,
  payload: any,
  maxRetries: number = 3
): Promise<{ text: string; modelUsed: string }> {
  const modelQueue = [
    preferredModel && !preferredModel.includes('2.5') && !preferredModel.includes('1.5') && !preferredModel.includes('2.0') ? preferredModel : 'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest'
  ];

  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries * 2; attempt++) {
    const currentKey = keyManager.getCurrentKey();
    if (!currentKey) {
      throw new Error('Chưa cấu hình API Key Google Gemini hợp lệ trong Key Pool.');
    }

    const currentModel = modelQueue[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentKey}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }

      const data = await res.json() as any;

      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          text: data.candidates[0].content.parts[0].text,
          modelUsed: currentModel
        };
      }

      const errMsg = data.error?.message || `HTTP ${res.status}`;
      const status = res.status;
      console.warn(`[safeGeminiCall] Model ${currentModel} gặp lỗi (${status}): ${errMsg.slice(0, 120)}`);

      // 429 Quota Exceeded hoặc 503 Overloaded / High Demand -> Đổi model tiếp theo ngay
      if (status === 429 || status === 503 || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        if (modelQueue.length > 1) {
          modelQueue.shift();
        } else {
          keyManager.switchToNextKey('Quota/High Demand');
        }
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      // 403 Forbidden / Invalid Key -> Đổi sang Key tiếp theo ngay
      if (status === 403 || errMsg.includes('API_KEY_INVALID') || errMsg.includes('PERMISSION_DENIED')) {
        keyManager.switchToNextKey('Key 403 Invalid/Forbidden');
        await new Promise(r => setTimeout(r, 800));
        continue;
      }

      // 404 Model Not Found -> Bỏ model hiện tại, thử model tiếp theo trong queue
      if (status === 404 || errMsg.includes('not found') || errMsg.includes('not supported')) {
        if (modelQueue.length > 1) {
          modelQueue.shift();
        }
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      lastError = new Error(errMsg);
      await new Promise(r => setTimeout(r, 1200));
    } catch (e: any) {
      lastError = e;
      console.warn('[safeGeminiCall] Lỗi fetch mạng:', e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  throw lastError || new Error('Không thể kết nối Gemini API sau nhiều lần thử.');
}

/**
 * Tải ảnh bối cảnh thực tế Lớp 1 từ Pollinations.ai (Hoàn toàn miễn phí, không cần Key)
 */
export async function fetchPollinationsBackground(prompt: string, width: number = 860, height: number = 540): Promise<string | null> {
  try {
    const cleanPrompt = (prompt || '').trim();
    // Ép chuẩn Negative Prompt để ảnh hoàn toàn sạch chữ, sạch số, sạch trục toạ độ
    const negative = 'no text, no numbers, no words, no letters, no coordinate axes, no lines, no labels, clean white background, studio soft lighting, modern 2.5D textbook illustration';
    const fullPrompt = `${cleanPrompt}, ${negative}`;

    const encoded = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=false`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      // Kiểm tra dung lượng > 5KB để chống ảnh rỗng/lỗi
      if (buffer.byteLength > 5120) {
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64}`;
      } else {
        console.warn(`[Pollinations] Ảnh nhận về quá nhỏ (${buffer.byteLength} bytes).`);
      }
    } else {
      console.warn(`[Pollinations] HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.warn('[Pollinations] Lỗi kết nối:', err.message);
  }
  return null;
}

/**
 * Xử lý chính của dịch vụ Hình Thực Tế AI (2 Lớp Khóa Tọa Độ)
 */
export async function handleRealisticImage(reqBody: RealisticImageRequest): Promise<RealisticImageResponse> {
  const { problemText, image, apiKey, model, subject = 'math', generateBackground = true } = reqBody;
  const keyManager = new KeyPoolManager(apiKey);

  if (!keyManager.hasKeys()) {
    return {
      success: false,
      title: 'Thiếu API Key',
      modelUsed: 'None',
      error: 'Vui lòng cung cấp ít nhất 1 Google Gemini API Key để thực hiện phân tích đề bài và tạo lớp phủ hình học.'
    };
  }

  const systemInstruction = `Bạn là Chuyên gia Đồ họa Khoa học & Sư phạm THPT Việt Nam (Toán, Lý, Hóa, Sinh - GDPT 2018).
Nhiệm vụ của bạn là phân tích đề bài hoặc ảnh bài tập đính kèm để xuất ra ĐÚNG 2 LỚP ĐỒ HỌA RIÊNG BIỆT theo định dạng JSON:

1. Lớp 1 (prompt_background):
   - Chuỗi mô tả tiếng Anh mô tả bối cảnh / vật thể thực tế dưới góc nhìn 2.5D (ví dụ: "A clean modern house with orange clay tiled roof on green grass lawn", "A majestic mountain peak with a rescue helicopter flying towards it under blue sky", "Chemistry laboratory glass beaker on a clean white desk").
   - TUYỆT ĐỐI KHÔNG chứa chữ cái, số, trục toạ độ, mũi tên hay nhãn điểm (strict: no text, no numbers, no lines, no labels).

2. Lớp 2 (svg_overlay):
   - Mã thẻ <svg viewBox="0 0 860 540" style="background: transparent;">...</svg> hoàn chỉnh với nền trong suốt.
   - Chứa ĐẦY ĐỦ các yếu tố toán học chuẩn xác 100%:
     + Hệ trục tọa độ Oxyz hoặc Oxy sắc nét, mũi tên các trục, gốc O.
     + Các cạnh nhìn thấy nét liền (stroke-width: 2px), cạnh khuất vẽ nét đứt (stroke-dasharray="5,5").
     + Mũi tên vectơ lực/vận tốc, góc vuông, ký hiệu toán học.
     + Toàn bộ nhãn đỉnh (O, A, B, C, S, F, E, H...) và số đo kích thước (4m, 8m, 2m...) bằng font 'Times New Roman' in nghiêng đặt đúng vị trí.
     + Mặt phẳng cắt bán trong suốt (fill-opacity="0.3").

3. Bản in đề thi (exam_print_svg):
   - Mã thẻ <svg viewBox="0 0 860 540" style="background: #ffffff;">...</svg> độc lập nền trắng sạch, nét vẽ kỹ thuật thanh tú màu đen (#0F172A), tối ưu hoàn hảo để in ấn đề thi THPT đen trắng không bị đen kịt hay mờ nét.

CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "title": "Tên bài toán ngắn gọn",
  "prompt_background": "Mô tả tiếng Anh cho Lớp 1...",
  "svg_overlay": "<svg ...>...</svg>",
  "exam_print_svg": "<svg ...>...</svg>"
}`;

  try {
    const parts: any[] = [];
    if (image && image.base64) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType || 'image/jpeg',
          data: image.base64.replace(/^data:[^;]+;base64,/, '')
        }
      });
    }

    const promptUser = `Môn học: ${subject}\nNội dung đề bài / Yêu cầu vẽ:\n${problemText || 'Hãy quan sát kỹ ảnh đính kèm và tái tạo lại chính xác theo mô hình 2 lớp.'}`;
    parts.push({ text: promptUser });

    const payload = {
      contents: [{ parts }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    };

    const aiResult = await safeGeminiCall(keyManager, model || 'gemini-2.5-flash', payload);
    
    let parsed: any = {};
    try {
      parsed = JSON.parse(aiResult.text);
    } catch {
      // Nếu có markdown code fence
      const clean = aiResult.text.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    const title = parsed.title || 'Hình Vẽ Minh Họa Thực Tế';
    const promptBg = parsed.prompt_background || '';
    const svgOverlay = parsed.svg_overlay || '';
    const examPrintSvg = parsed.exam_print_svg || svgOverlay;

    // Lấy ảnh bối cảnh thực tế Lớp 1
    let bgDataUrl: string | null = null;
    if (generateBackground && promptBg) {
      bgDataUrl = await fetchPollinationsBackground(promptBg, 860, 540);
    }

    return {
      success: true,
      title,
      modelUsed: aiResult.modelUsed,
      promptBackground: promptBg,
      backgroundImageData: bgDataUrl,
      svgOverlay,
      examPrintSvg
    };
  } catch (err: any) {
    console.error('[handleRealisticImage Error]', err.message);
    return {
      success: false,
      title: 'Lỗi Tạo Hình Thực Tế',
      modelUsed: 'Error',
      error: `Không thể tạo hình thực tế: ${err.message}. Vui lòng thử lại hoặc kiểm tra lại kết nối mạng / API Key.`
    };
  }
}
