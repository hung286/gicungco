const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyC05V5-94kS10hR7wXgXm0gD5p41XgE-B4e2iBqQ/exec';

const splitTtsChunks = (raw: string, maxLen = 160): string[] => {
  const clean = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.split(/(?<=[.!?;\n])\s+/);
  const chunks: string[] = [];
  let current = '';
  const pushWordSplit = (seg: string) => {
    const words = seg.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur ? cur + ' ' + w : w).length <= maxLen) {
        cur = cur ? cur + ' ' + w : w;
      } else {
        if (cur) chunks.push(cur);
        cur = w.length > maxLen ? w.slice(0, maxLen) : w;
      }
    }
    if (cur) chunks.push(cur);
  };
  for (const s of sentences) {
    if (!s) continue;
    if ((current ? current + ' ' + s : s).length <= maxLen) {
      current = current ? current + ' ' + s : s;
    } else {
      if (current) { chunks.push(current); current = ''; }
      if (s.length <= maxLen) current = s;
      else pushWordSplit(s);
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health check
    if (pathname === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        hasSystemApiKey: !!process.env.GEMINI_API_KEY,
        systemKeyCount: process.env.GEMINI_API_KEY ? 1 : 0,
        author: 'NMH thầy Nguyễn Mạnh Hùng'
      });
    }

    // 2. Server info
    if (pathname === '/api/server-info' || pathname === '/api/lan-ip') {
      return res.status(200).json({
        lanIp: req.headers.host || '127.0.0.1',
        ip: req.headers.host || '127.0.0.1',
        allIps: [],
        port: 443,
        author: 'NMH thầy Nguyễn Mạnh Hùng'
      });
    }

    // 3. AI Text-To-Speech (Giọng Chuẩn Tiếng Việt AI 100% Miễn Phí)
    if (pathname === '/api/tts') {
      try {
        const reqBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const text = req.method === 'GET' ? (parsedUrl.searchParams.get('text') || '') : (reqBody?.text || '');
        const lang = req.method === 'GET' ? (parsedUrl.searchParams.get('lang') || 'vi') : (reqBody?.lang || 'vi');
        const slow = req.method === 'GET'
          ? (parsedUrl.searchParams.get('slow') === '1' || parsedUrl.searchParams.get('slow') === 'true')
          : !!reqBody?.slow;

        const chunks = splitTtsChunks(text, 160);
        if (chunks.length === 0) {
          return res.status(400).json({ ok: false, error: 'Thiếu nội dung văn bản để đọc.' });
        }

        const safeLang = (lang || 'vi').trim();
        const speedParam = slow ? '0.24' : '1';
        const audioBuffers: Buffer[] = [];

        for (const chunk of chunks) {
          let chunkBuf: Buffer | null = null;
          const ttsUrls = [
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(safeLang)}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`,
            `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${encodeURIComponent(safeLang)}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`
          ];

          for (const ttsUrl of ttsUrls) {
            try {
              const upstream = await fetch(ttsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                  'Referer': 'https://translate.google.com/'
                }
              });
              if (upstream.ok) {
                const arr = await upstream.arrayBuffer();
                if (arr.byteLength > 100) {
                  chunkBuf = Buffer.from(arr);
                  break;
                }
              }
            } catch {}
          }

          if (chunkBuf) {
            audioBuffers.push(chunkBuf);
          }
        }

        if (audioBuffers.length === 0) {
          throw new Error('Không thể tải dữ liệu âm thanh từ máy chủ TTS.');
        }

        const finalBuf = Buffer.concat(audioBuffers);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', String(finalBuf.length));
        res.setHeader('Content-Disposition', 'inline; filename="smartedu-voice.mp3"');
        res.setHeader('X-TTS-Provider', 'google-vietnamese-standard');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(finalBuf);
      } catch (ttsErr: any) {
        console.error('[API /api/tts Error]:', ttsErr);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(500).json({ ok: false, error: ttsErr?.message || 'Lỗi tạo giọng đọc' });
      }
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // 4. Cloud Storage Database
    if (pathname === '/api/cloud-storage/smartedu-db') {
      const { syncWithGoogleSheet } = await import('../scripts/cloudStorageService');
      if (req.method === 'GET') {
        const sheetUrl = parsedUrl.searchParams.get('sheetUrl') || DEFAULT_GOOGLE_SHEET_URL;
        const result = await syncWithGoogleSheet(sheetUrl);
        return res.status(200).json(result);
      }
      if (req.method === 'POST') {
        const sheetUrl = body.sheetUrl || DEFAULT_GOOGLE_SHEET_URL;
        const incomingDb = body.db || body;
        const result = await syncWithGoogleSheet(sheetUrl, incomingDb);
        return res.status(200).json(result);
      }
    }

    if (pathname === '/api/cloud-storage/sync-sheet') {
      const { syncWithGoogleSheet } = await import('../scripts/cloudStorageService');
      const scriptUrl = body.scriptUrl || DEFAULT_GOOGLE_SHEET_URL;
      const result = await syncWithGoogleSheet(scriptUrl, body.db || body);
      return res.status(200).json(result);
    }

    if (!body.apiKey && process.env.GEMINI_API_KEY) {
      body.apiKey = process.env.GEMINI_API_KEY;
    }

    // 5. Math Visualizer & Solver Engine
    if (pathname.startsWith('/api/visualize') ||
        pathname === '/api/pdf-extract-figures' ||
        pathname === '/api/ocr-problem' ||
        pathname === '/api/solve-math' ||
        pathname === '/api/export-latex' ||
        pathname === '/api/refine-svg' ||
        pathname === '/api/test-key') {
      const mathEngine = await import('../scripts/mathVisualizerEngine');
      if (pathname === '/api/visualize') {
        const result = await mathEngine.handleVisualize(body);
        return res.status(200).json(result);
      }
      if (pathname === '/api/pdf-extract-figures') {
        const result = await mathEngine.handlePdfExtractFigures(body.pdfBase64 || body.base64);
        return res.status(200).json(result);
      }
      if (pathname === '/api/ocr-problem') {
        const result = await mathEngine.handleOcrProblem(body);
        return res.status(200).json(result);
      }
      if (pathname === '/api/solve-math') {
        const result = await mathEngine.handleSolveMath(body);
        return res.status(200).json(result);
      }
      if (pathname === '/api/export-latex') {
        const result = await mathEngine.handleExportLatex(body);
        return res.status(200).json(result);
      }
      if (pathname === '/api/refine-svg') {
        const result = await mathEngine.handleRefineSvg(body);
        return res.status(200).json(result);
      }
      if (pathname === '/api/test-key') {
        const result = await mathEngine.handleTestKey(body);
        return res.status(200).json(result);
      }
    }

    // 6. Realistic Image Generator
    if (pathname === '/api/realistic-image') {
      const { handleRealisticImage } = await import('../scripts/realisticImageService');
      const result = await handleRealisticImage(body);
      return res.status(200).json(result);
    }

    // 7. Unlimited OCR
    if (pathname === '/api/unlimited-ocr/health') {
      const { handleUnlimitedOcrHealth } = await import('../scripts/unlimitedOcrService');
      const result = await handleUnlimitedOcrHealth(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/unlimited-ocr') {
      const { handleUnlimitedOcr } = await import('../scripts/unlimitedOcrService');
      const result = await handleUnlimitedOcr(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/unlimited-ocr/docx') {
      const { buildDocxFromMarkdown } = await import('../scripts/unlimitedOcrService');
      const docxBuf = await buildDocxFromMarkdown(body);
      const safeName = String(body?.fileName || 'De_Toan_UnlimitedOCR.docx')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const finalName = safeName.endsWith('.docx') ? safeName : `${safeName}.docx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);
      res.setHeader('Content-Length', String(docxBuf.length));
      return res.status(200).send(docxBuf);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
