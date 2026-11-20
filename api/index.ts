import {
  handleVisualize,
  handleOcrProblem,
  handleSolveMath,
  handleExportLatex,
  handleRefineSvg,
  handleTestKey,
  handlePdfExtractFigures
} from '../scripts/mathVisualizerEngine';
import { handleRealisticImage } from '../scripts/realisticImageService';
import {
  syncWithGoogleSheet,
  DEFAULT_GOOGLE_SHEET_URL
} from '../scripts/cloudStorageService';

const splitTtsChunks = (raw: string, maxLen = 165): string[] => {
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key, authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    if (pathname === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        hasSystemApiKey: !!process.env.GEMINI_API_KEY,
        systemKeyCount: process.env.GEMINI_API_KEY ? 1 : 0,
        author: 'NMH thầy Nguyễn Mạnh Hùng'
      });
    }

    if (pathname === '/api/server-info' || pathname === '/api/lan-ip') {
      return res.status(200).json({
        lanIp: req.headers.host || '127.0.0.1',
        ip: req.headers.host || '127.0.0.1',
        allIps: [],
        port: 443,
        author: 'NMH thầy Nguyễn Mạnh Hùng'
      });
    }

    if (pathname === '/api/tts') {
      const text = req.method === 'GET' ? (parsedUrl.searchParams.get('text') || '') : (req.body?.text || '');
      const lang = req.method === 'GET' ? (parsedUrl.searchParams.get('lang') || 'vi') : (req.body?.lang || 'vi');
      const slow = req.method === 'GET'
        ? (parsedUrl.searchParams.get('slow') === '1' || parsedUrl.searchParams.get('slow') === 'true')
        : !!req.body?.slow;

      const chunks = splitTtsChunks(text, 165);
      if (chunks.length === 0) {
        return res.status(400).json({ error: 'Thiếu nội dung văn bản để đọc.' });
      }
      const safeLang = (lang || 'vi').trim();
      const speedParam = slow ? '0.24' : '1';
      const audioBuffers: Buffer[] = [];
      for (const chunk of chunks) {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(safeLang)}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`;
        const upstream = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/'
          }
        });
        if (!upstream.ok) {
          throw new Error(`Upstream TTS HTTP ${upstream.status}`);
        }
        audioBuffers.push(Buffer.from(await upstream.arrayBuffer()));
      }
      const finalBuf = Buffer.concat(audioBuffers);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', String(finalBuf.length));
      res.setHeader('Content-Disposition', 'inline; filename="smartedu-voice.mp3"');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(finalBuf);
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (pathname === '/api/cloud-storage/smartedu-db') {
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
      const scriptUrl = body.scriptUrl || DEFAULT_GOOGLE_SHEET_URL;
      const result = await syncWithGoogleSheet(scriptUrl, body.db || body);
      return res.status(200).json(result);
    }

    if (!body.apiKey && process.env.GEMINI_API_KEY) {
      body.apiKey = process.env.GEMINI_API_KEY;
    }

    if (pathname === '/api/visualize') {
      const result = await handleVisualize(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/pdf-extract-figures') {
      const result = await handlePdfExtractFigures(body.pdfBase64 || body.base64);
      return res.status(200).json(result);
    }
    if (pathname === '/api/realistic-image') {
      const result = await handleRealisticImage(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/ocr-problem') {
      const result = await handleOcrProblem(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/solve-math') {
      const result = await handleSolveMath(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/export-latex') {
      const result = await handleExportLatex(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/refine-svg') {
      const result = await handleRefineSvg(body);
      return res.status(200).json(result);
    }
    if (pathname === '/api/test-key') {
      const result = await handleTestKey(body);
      return res.status(200).json(result);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
