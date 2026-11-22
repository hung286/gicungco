import path from 'path';
import os from 'os';
import fs from 'fs';
import https from 'https';
import { defineConfig, Plugin } from 'vite';
import { renderTikz } from './scripts/tikzRenderer';
import {
  handleVisualize,
  handleOcrProblem,
  handleSolveMath,
  handleExportLatex,
  handleRefineSvg,
  handleTestKey,
  handlePdfExtractFigures
} from './scripts/mathVisualizerEngine';
import { handleRealisticImage } from './scripts/realisticImageService';
import { handleCloudStorage } from './scripts/cloudStorageService';
import {
  handleUnlimitedOcr,
  handleUnlimitedOcrHealth,
  buildDocxFromMarkdown
} from './scripts/unlimitedOcrService';

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastDelta: number;
  isBot?: boolean;
  answers: Record<number, { answer: any; timeMs: number; isCorrect: boolean; points: number }>;
}

interface Room {
  pin: string;
  createdAt: number;
  stage: 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'finished';
  currentQIndex: number;
  timePerQuestion: number;
  questionStartTime: number;
  questions: any[];
  players: Record<string, Player>;
  sseClients: Set<any>;
}

const liveRooms = new Map<string, Room>();
const paperLiveSessions = new Map<string, { session: any; sseClients: Set<any> }>();

function broadcastPaperSession(sid: string, eventName: string, data: any) {
  const item = paperLiveSessions.get(sid);
  if (!item || !item.sseClients) return;
  const payload = JSON.stringify({ event: eventName, data });
  item.sseClients.forEach(res => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      item.sseClients.delete(res);
    }
  });
}

function getAllLanIps(): { name: string; ip: string; isWifiOrLan: boolean }[] {
  const ifaces = os.networkInterfaces();
  const results: { name: string; ip: string; isWifiOrLan: boolean }[] = [];
  const virtualRegex = /(virtualbox|vmware|vethernet|hyper-v|wsl|loopback|pseudo|tailscale|radmin|hamachi|bluetooth|tap|tun)/i;

  for (const dev in ifaces) {
    const list = ifaces[dev];
    if (!list) continue;
    const isVirtual = virtualRegex.test(dev);
    const isWifiOrLan = !isVirtual && /wi-fi|wifi|wlan|ethernet|mạng|local/i.test(dev);
    for (const details of list) {
      if (details.family === 'IPv4' && !details.internal) {
        results.push({
          name: dev,
          ip: details.address,
          isWifiOrLan
        });
      }
    }
  }

  // Sort: Wi-Fi / Physical LAN first
  results.sort((a, b) => {
    if (a.isWifiOrLan && !b.isWifiOrLan) return -1;
    if (!a.isWifiOrLan && b.isWifiOrLan) return 1;
    return 0;
  });

  return results;
}

function getLanIp(): string {
  const ips = getAllLanIps();
  if (ips.length === 0) return '127.0.0.1';
  // Pick first physical adapter, prefer standard LAN (192.168.x.x, 10.x.x.x)
  const pref = ips.find(i => i.isWifiOrLan && (i.ip.startsWith('192.168.') || i.ip.startsWith('10.')))
    || ips.find(i => i.isWifiOrLan)
    || ips[0];
  return pref ? pref.ip : '127.0.0.1';
}

function broadcastRoom(room: Room, eventName: string = 'update') {
  if (!room.sseClients) return;
  const payload = JSON.stringify({
    event: eventName,
    pin: room.pin,
    stage: room.stage,
    currentQIndex: room.currentQIndex,
    questionStartTime: room.questionStartTime,
    timePerQuestion: room.timePerQuestion,
    playersCount: Object.keys(room.players).length,
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      streak: p.streak,
      lastDelta: p.lastDelta,
      hasAnswered: !!p.answers[room.currentQIndex]
    }))
  });
  room.sseClients.forEach(res => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      room.sseClients.delete(res);
    }
  });
}

const liveRoomPlugin = (): Plugin => ({
  name: 'smartedu-live-room-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      // 0.0 AI Tools Handler: Direct serving of local cloned AI tools & AI tools catalog
      if (pathname === '/ai-tools') {
        const runnerPath = path.resolve(__dirname, 'public', 'games_2', 'runner.html');
        if (fs.existsSync(runnerPath)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fs.readFileSync(runnerPath, 'utf8'));
          return;
        }
      }

      // 0.1 Học Toán Handler & Cache
      if (pathname === '/hoc-toan' || pathname === '/hoc-toan/') {
        res.writeHead(302, { Location: '/hoc-toan/so-tay.html' });
        res.end();
        return;
      }
      if (pathname === '/so-tay' || pathname === '/so-tay/') {
        res.writeHead(302, { Location: '/hoc-toan/so-tay.html' });
        res.end();
        return;
      }

      // 0.2 EY AI & Trò Chơi Giáo Dục Handler
      if (pathname === '/ey' || pathname === '/ey/') {
        res.writeHead(302, { Location: '/ey/index.html' });
        res.end();
        return;
      }

      // 0.3 Kho Ngân Hàng Câu Hỏi & Đề Thi GDPT 2018 Handler
      if (pathname === '/ngan-hang-cau-hoi' || pathname === '/ngan-hang-cau-hoi/' || pathname === '/question-bank') {
        res.writeHead(302, { Location: '/ngan-hang-cau-hoi/index.html' });
        res.end();
        return;
      }

      // 0.4 Học Toán 2 Handler
      if (pathname === '/hoc-toan-2' || pathname === '/hoc-toan-2/') {
        res.writeHead(302, { Location: '/hoc-toan-2/index.html' + (parsedUrl.search || '') });
        res.end();
        return;
      }

      // 0.5 Cổng Đăng Ký Tài Khoản SmartEdu Handler
      if (pathname === '/dang-ky-tai-khoan' || pathname === '/dang-ky-tai-khoan/') {
        res.writeHead(302, { Location: '/dang-ky-tai-khoan/index.html' + (parsedUrl.search || '') });
        res.end();
        return;
      }

      // 0.6 MHEdu - Kho Game Học Tập Tương Tác Handler
      if (pathname === '/kho-game-hoc-tap' || pathname === '/kho-game-hoc-tap/') {
        res.writeHead(302, { Location: '/kho-game-hoc-tap/index.html' + (parsedUrl.search || '') });
        res.end();
        return;
      }

      // Serve static HTML without .html extension in /hoc-toan/
      if (pathname.startsWith('/hoc-toan/')) {
        let rel = pathname.slice('/hoc-toan/'.length);
        if (!rel || rel.endsWith('/')) rel += 'index.html';
        const candidate = path.resolve(__dirname, 'public', 'hoc-toan', rel);
        if (!path.extname(candidate)) {
          if (fs.existsSync(candidate + '.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(candidate + '.html'));
            return;
          }
        }
      }

      // Proxy & Local Cache for noi-dung assets (flipbooks, PDFs, images, mindmaps)
      if (pathname.startsWith('/hoc-toan/noi-dung/') || pathname.startsWith('/noi-dung/')) {
        const sub = pathname.startsWith('/hoc-toan/noi-dung/')
          ? pathname.slice('/hoc-toan/'.length)
          : pathname.slice(1);
        const localPath = path.resolve(__dirname, 'public', 'hoc-toan', sub);

        if (fs.existsSync(localPath) && !fs.statSync(localPath).isDirectory()) {
          const ext = path.extname(localPath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.json': 'application/json'
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.end(fs.readFileSync(localPath));
          return;
        }

        // Fetch from upstream and cache locally
        const upstreamUrl = 'https://hoctoanthongminh.pages.dev/' + sub;
        fetch(upstreamUrl)
          .then(async upstreamRes => {
            if (upstreamRes.ok) {
              const buf = Buffer.from(await upstreamRes.arrayBuffer());
              fs.mkdirSync(path.dirname(localPath), { recursive: true });
              fs.writeFileSync(localPath, buf);
              const distPath = path.resolve(__dirname, 'dist', 'hoc-toan', sub);
              fs.mkdirSync(path.dirname(distPath), { recursive: true });
              fs.writeFileSync(distPath, buf);

              const cType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
              res.setHeader('Content-Type', cType);
              res.end(buf);
            } else {
              res.writeHead(upstreamRes.status);
              res.end();
            }
          })
          .catch(() => {
            res.writeHead(502);
            res.end();
          });
        return;
      }

      if (pathname.startsWith('/ai-tools/')) {
        let relPath = pathname.slice('/ai-tools/'.length);
        if (!relPath || relPath.endsWith('/')) {
          relPath += 'index.html';
        }
        let fullPath = path.resolve(__dirname, 'public', 'ai-tools', relPath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
          res.writeHead(302, { Location: pathname + '/' });
          res.end();
          return;
        } else if (!fs.existsSync(fullPath) && !path.extname(fullPath)) {
          const candidate = path.resolve(__dirname, 'public', 'ai-tools', relPath, 'index.html');
          if (fs.existsSync(candidate)) {
            res.writeHead(302, { Location: pathname + '/' });
            res.end();
            return;
          }
        }

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.mjs': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.end(fs.readFileSync(fullPath));
          return;
        }
      }

      // 0.1 GVDM Game Routes SPA Fallback
      const gvdmRoutes = [
        '/zombie-defense', '/minesweeper', '/tug-of-war-game', '/star-bag-game',
        '/head-tilt-quiz', '/hand-slash-quiz', '/flip-puzzle-game', '/knowledge-train-game',
        '/turn-based-game', '/versus-game', '/pose-quiz', '/flying-words-game',
        '/goi-ten', '/class-timer', '/noise-tracker', '/paper-mode', '/paced-quiz',
        '/quiz-game', '/crossword-puzzle', '/flashcard', '/mind-map', '/panorama-museum',
        '/interactive-video', '/interactive-image', '/journey', '/scavenger-hunt', '/wheel-quiz',
        '/teacher-share', '/share', '/scan', '/thamgia', '/join',
        '/tien-ich-giao-duc', '/mo-phong-bai-day', '/teaching-materials', '/gv-chu-nhiem'
      ];

      if (gvdmRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
        const runnerPath = path.resolve(__dirname, 'public', 'games_2', 'runner.html');
        if (fs.existsSync(runnerPath)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fs.readFileSync(runnerPath, 'utf8'));
          return;
        }
      }

      // 0.2 Serve all assets properly from public/games_2/assets or public/assets
      if (pathname.startsWith('/assets/')) {
        const candidatePaths = [
          path.resolve(__dirname, 'public', 'games_2', pathname.slice(1)),
          path.resolve(__dirname, 'public', pathname.slice(1))
        ];
        for (const localAsset of candidatePaths) {
          if (fs.existsSync(localAsset) && fs.statSync(localAsset).isFile()) {
            const ext = path.extname(localAsset).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.js': 'application/javascript; charset=utf-8',
              '.css': 'text/css; charset=utf-8',
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.woff2': 'font/woff2',
              '.woff': 'font/woff',
              '.ttf': 'font/ttf',
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.end(fs.readFileSync(localAsset));
            return;
          }
        }
      }

      // 0.3 Serve static images, sounds, effects from public/ or public/games_2/
      if (pathname.startsWith('/images/') || pathname.startsWith('/sounds/') || pathname.startsWith('/effects/')) {
        const candidatePaths = [
          path.resolve(__dirname, 'public', pathname.slice(1)),
          path.resolve(__dirname, 'public', 'games_2', pathname.slice(1)),
          path.resolve(__dirname, 'public', 'games_2', 'assets', pathname.slice(1))
        ];
        for (const localAsset of candidatePaths) {
          if (fs.existsSync(localAsset) && fs.statSync(localAsset).isFile()) {
            const ext = path.extname(localAsset).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.end(fs.readFileSync(localAsset));
            return;
          }
        }
      }

      // 0. Support both /games 2/ and /games_2/
      if (pathname.startsWith('/games%202/') || pathname.startsWith('/games 2/')) {
        const rewritten = (req.url || '').replace(/^\/games(%20|\s)2\//, '/games_2/');
        req.url = rewritten;
      }

      // 1. Redirect /live to /games/choi_truc_tiep/index.html
      if (pathname === '/live' || pathname === '/live/' || pathname.startsWith('/live?')) {
        const target = '/games/choi_truc_tiep/index.html' + parsedUrl.search;
        res.writeHead(302, { Location: target });
        res.end();
        return;
      }

      // 1.0 Centralized SSO Authentication Server (/api/auth)
      if (pathname.startsWith('/api/auth/')) {
        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let body: any = {};
            if (rawBody) {
              try { body = JSON.parse(rawBody); } catch (e) {}
            }
            // @ts-ignore
            const ssoAuth = await import('./api/ssoAuthService.js').catch(() => require('./api/ssoAuthService.js'));
            const handlerFn = ssoAuth.handleSsoRequest || (ssoAuth.default && ssoAuth.default.handleSsoRequest);
            if (handlerFn) {
              return handlerFn(pathname, req, res, body);
            }
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Auth handler not found' }));
          } catch (authErr: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: authErr?.message || 'Auth internal error' }));
          }
        });
        return;
      }

      // 1a. Cloud Storage & Exam Backup API (/api/cloud-storage)
      if (pathname.startsWith('/api/cloud-storage')) {
        handleCloudStorage(req, res);
        return;
      }

      // 1b. Math Visualizer AI Endpoints (Độc lập, tốc độ cao, chuẩn xác 100% Toán & Vật lý)
      const mathVisualizerApiPaths = [
        '/api/solve-math',
        '/api/export-latex',
        '/api/refine-svg',
        '/api/test-key',
        '/api/health',
        '/api/ocr-problem',
        '/api/visualize',
        '/api/realistic-image',
        '/api/pdf-extract-figures',
        '/api/unlimited-ocr',
        '/api/unlimited-ocr/health',
        '/api/unlimited-ocr/docx',
      ];
      if (mathVisualizerApiPaths.includes(pathname)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key, authorization');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (pathname === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            status: 'ok',
            hasSystemApiKey: true,
            systemKeyCount: 1,
            author: 'NMH thầy Nguyễn Mạnh Hùng'
          }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const body = rawBody ? JSON.parse(rawBody) : {};

            if (pathname === '/api/visualize') {
              const result = await handleVisualize(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/pdf-extract-figures') {
              const result = await handlePdfExtractFigures(body.pdfBase64 || body.base64);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/unlimited-ocr/health') {
              const result = await handleUnlimitedOcrHealth(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/unlimited-ocr') {
              const result = await handleUnlimitedOcr(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/unlimited-ocr/docx') {
              const docxBuf = await buildDocxFromMarkdown(body);
              const safeName = String(body?.fileName || 'De_Toan_UnlimitedOCR.docx')
                .replace(/[^a-zA-Z0-9._-]/g, '_');
              const finalName = safeName.endsWith('.docx') ? safeName : `${safeName}.docx`;
              res.writeHead(200, {
                'Content-Type':
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${finalName}"`,
                'Content-Length': String(docxBuf.length)
              });
              res.end(docxBuf);
              return;
            }

            if (pathname === '/api/realistic-image') {
              // Module độc lập: Hình ảnh thực tế AI 2 Lớp Khóa Tọa Độ & Bộ lọc in đề thi
              if (!body.apiKey) {
                try {
                  const fs = await import('fs');
                  const path = await import('path');
                  const envPath = path.resolve(process.cwd(), '.env.local');
                  if (fs.existsSync(envPath)) {
                    const txt = fs.readFileSync(envPath, 'utf8');
                    const m = txt.match(/GEMINI_API_KEY=([^\r\n]+)/);
                    if (m && m[1]) body.apiKey = m[1].trim();
                  }
                } catch {}
              }
              const result = await handleRealisticImage(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/ocr-problem') {
              const result = await handleOcrProblem(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/solve-math') {
              const result = await handleSolveMath(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/export-latex') {
              const result = await handleExportLatex(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/refine-svg') {
              const result = await handleRefineSvg(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            if (pathname === '/api/test-key') {
              const result = await handleTestKey(body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(result));
              return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (err: any) {
            console.error('[MathVisualizer Error]', err);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err?.message || 'Lỗi xử lý Math Visualizer' }));
          }
        });
        return;
      }

      // 2. Server LAN Info
      if (pathname === '/api/server-info' || pathname === '/api/lan-ip') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const lanIp = getLanIp();
        const allIps = getAllLanIps();
        res.end(JSON.stringify({
          lanIp,
          ip: lanIp,
          allIps,
          port: 3000,
          author: 'NMH thầy Nguyễn Mạnh Hùng'
        }));
        return;
      }

      // 2.1 AI Text-to-Speech API (/api/tts) - Giọng AI Chuẩn Tiếng Việt Miễn Phí (Google Neural Standard)
      if (pathname === '/api/tts') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const handleTtsRequest = async (rawText: string, lang = 'vi', slow = false) => {
          const clean = String(rawText || '').replace(/\s+/g, ' ').trim();
          if (!clean) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: 'Thiếu nội dung văn bản để đọc.' }));
            return;
          }

          const sentences = clean.split(/(?<=[.!?;\n])\s+/);
          const chunks: string[] = [];
          let curChunk = '';
          for (const s of sentences) {
            if (!s) continue;
            if ((curChunk ? curChunk + ' ' + s : s).length <= 160) {
              curChunk = curChunk ? curChunk + ' ' + s : s;
            } else {
              if (curChunk) { chunks.push(curChunk); curChunk = ''; }
              if (s.length <= 160) curChunk = s;
              else {
                const words = s.split(' ');
                let wChunk = '';
                for (const w of words) {
                  if ((wChunk ? wChunk + ' ' + w : w).length <= 160) {
                    wChunk = wChunk ? wChunk + ' ' + w : w;
                  } else {
                    if (wChunk) chunks.push(wChunk);
                    wChunk = w;
                  }
                }
                if (wChunk) chunks.push(wChunk);
              }
            }
          }
          if (curChunk) chunks.push(curChunk);

          const safeLang = (lang || 'vi').trim();
          const speedParam = slow ? '0.24' : '1';
          const audioBuffers: Buffer[] = [];

          for (const chunk of chunks) {
            let chunkBuf: Buffer | null = null;
            const ttsUrls = [
              `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(safeLang)}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`,
              `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${encodeURIComponent(safeLang)}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`
            ];
            for (const u of ttsUrls) {
              try {
                const resp = await fetch(u, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Referer': 'https://translate.google.com/'
                  }
                });
                if (resp.ok) {
                  const arr = await resp.arrayBuffer();
                  if (arr.byteLength > 100) {
                    chunkBuf = Buffer.from(arr);
                    break;
                  }
                }
              } catch {}
            }
            if (chunkBuf) audioBuffers.push(chunkBuf);
          }

          if (audioBuffers.length === 0) {
            throw new Error('Không thể tải giọng đọc từ máy chủ.');
          }

          const finalBuf = Buffer.concat(audioBuffers);
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(finalBuf.length),
            'Content-Disposition': 'inline; filename="smartedu-voice.mp3"',
            'X-TTS-Provider': 'google-vietnamese-standard',
            'Cache-Control': 'public, max-age=86400'
          });
          res.end(finalBuf);
        };

        if (req.method === 'GET') {
          const text = parsedUrl.searchParams.get('text') || '';
          const lang = parsedUrl.searchParams.get('lang') || 'vi';
          const slow = parsedUrl.searchParams.get('slow') === '1' || parsedUrl.searchParams.get('slow') === 'true';
          handleTtsRequest(text, lang, slow).catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: err?.message || 'Lỗi tạo giọng đọc' }));
          });
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              handleTtsRequest(parsed.text || '', parsed.lang || 'vi', !!parsed.slow || (typeof parsed.speed === 'number' && parsed.speed <= 0.8)).catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, error: err?.message || 'Lỗi tạo giọng đọc' }));
              });
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: false, error: 'Yêu cầu không hợp lệ' }));
            }
          });
          return;
        }
      }

      // 2.5 Games Sync HTML / Save Questions to physical file
      if (pathname === '/api/games/sync-html') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const fileUrl = body.fileUrl || '/games/ban_chim/index.html';
              const gameDatabase = body.gameDatabase;

              if (gameDatabase) {
                const targetFilePath = path.resolve(__dirname, 'public', fileUrl.replace(/^\//, ''));
                if (fs.existsSync(targetFilePath)) {
                  let content = fs.readFileSync(targetFilePath, 'utf8');
                  const dataInjection = `window.__INJECTED_BIRD_DATA__ = ${JSON.stringify(gameDatabase, null, 2)};`;
                  if (content.includes('window.__INJECTED_BIRD_DATA__ =')) {
                    content = content.replace(/window\.__INJECTED_BIRD_DATA__\s*=\s*[\s\S]*?;\n/, dataInjection + '\n');
                  } else {
                    content = content.replace('<script>', `<script>\n    ${dataInjection}\n`);
                  }
                  fs.writeFileSync(targetFilePath, content, 'utf8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, message: 'Đã lưu thành công vào file vật lý' }));
                  return;
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'File không tồn tại' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err?.message }));
            }
          });
          return;
        }
      }

      // 3. Live Room API endpoints
      if (pathname.startsWith('/api/live/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        // SSE Event Stream
        if (pathname === '/api/live/stream') {
          const pin = parsedUrl.searchParams.get('pin') || '';
          const room = liveRooms.get(pin);
          if (!room) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Phòng không tồn tại' }));
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });
          res.write(`data: ${JSON.stringify({ event: 'connected', pin })}\n\n`);
          room.sseClients.add(res);

          req.on('close', () => {
            room.sseClients.delete(res);
          });
          return;
        }

        // Parse JSON Body for POST requests
        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            let body: any = {};
            try { body = JSON.parse(bodyStr || '{}'); } catch {}

            // Create / update room (Host)
            if (pathname === '/api/live/room') {
              const pin = String(body.pin || Math.floor(100000 + Math.random() * 900000));
              let room = liveRooms.get(pin);
              if (!room) {
                room = {
                  pin,
                  createdAt: Date.now(),
                  stage: 'lobby',
                  currentQIndex: 0,
                  timePerQuestion: body.timePerQuestion || 30,
                  questionStartTime: 0,
                  questions: body.questions || [],
                  players: {},
                  sseClients: new Set()
                };
                liveRooms.set(pin, room);
              } else {
                if (body.questions) room.questions = body.questions;
                if (body.timePerQuestion) room.timePerQuestion = body.timePerQuestion;
                if (body.stage) room.stage = body.stage;
                if (body.currentQIndex !== undefined) room.currentQIndex = body.currentQIndex;
                if (body.questionStartTime !== undefined) room.questionStartTime = body.questionStartTime;
              }
              broadcastRoom(room);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, room: { pin: room.pin, stage: room.stage, count: Object.keys(room.players).length } }));
              return;
            }

            // Student Joins Room
            if (pathname === '/api/live/join') {
              const pin = String(body.pin || '');
              const room = liveRooms.get(pin);
              if (!room) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Mã phòng không tồn tại hoặc đã kết thúc' }));
                return;
              }
              const studentId = String(body.studentId || `stu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
              const studentName = String(body.studentName || 'Học sinh').trim();
              const isBot = !!(body.isBot || studentId.startsWith('bot_') || studentId.includes('test'));
              if (!room.players[studentId]) {
                room.players[studentId] = {
                  id: studentId,
                  name: studentName,
                  score: 0,
                  streak: 0,
                  lastDelta: 0,
                  isBot: isBot,
                  answers: {}
                };
              }
              broadcastRoom(room, 'player_joined');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                studentId,
                room: {
                  pin: room.pin,
                  stage: room.stage,
                  currentQIndex: room.currentQIndex,
                  timePerQuestion: room.timePerQuestion,
                  totalQuestions: room.questions.length
                }
              }));
              return;
            }

            // Student Submits Answer
            if (pathname === '/api/live/submit') {
              const pin = String(body.pin || '');
              const studentId = String(body.studentId || '');
              const qIndex = Number(body.qIndex ?? 0);
              const answer = body.answer;
              const timeSpentMs = Number(body.timeSpentMs || 1000);

              const room = liveRooms.get(pin);
              if (!room || !room.players[studentId]) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Không tìm thấy phòng hoặc học sinh' }));
                return;
              }
              const player = room.players[studentId];
              const q = room.questions[qIndex];
              let isCorrect = false;

              // Kiểm tra đáp án
              if (q) {
                let correct = (q.correctAnswer || q.correct_answer || '').toString().trim().toUpperCase();
                if (!correct && Array.isArray(q.options)) {
                  const correctOpt = q.options.find((o: any) => o && (o.is_correct || o.isCorrect));
                  if (correctOpt) {
                    correct = (correctOpt.label || '').replace(/[\.\:\)\s]*/g, '').toUpperCase();
                  }
                }
                const userAns = (answer || '').toString().trim().toUpperCase();
                if (q.type === 'Đúng / Sai' || q.type === 'tf') {
                  // Với câu đúng sai
                  isCorrect = (userAns === correct) || (userAns === 'ĐÚNG' && correct === 'A') || (userAns === 'SAI' && correct === 'B') || (userAns === 'TRUE' && correct === 'A') || (userAns === 'FALSE' && correct === 'B');
                } else if (q.type === 'Trả lời ngắn' || q.type === 'short') {
                  const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
                  isCorrect = normalize(userAns) === normalize(correct);
                } else {
                  isCorrect = userAns === correct || (correct.length > 0 && userAns.startsWith(correct[0]));
                }
              }

              // Tính điểm: Điểm chuẩn 1000 + Thưởng tốc độ (tối đa 1000) + Điểm streak
              let points = 0;
              if (isCorrect) {
                const limitMs = (room.timePerQuestion || 30) * 1000;
                const speedFactor = Math.max(0, Math.min(1, 1 - (timeSpentMs / limitMs)));
                const speedBonus = Math.round(speedFactor * 1000);
                player.streak = (player.streak || 0) + 1;
                const streakBonus = Math.min(player.streak * 100, 500);
                points = 1000 + speedBonus + streakBonus;
                player.score += points;
                player.lastDelta = points;
              } else {
                player.streak = 0;
                player.lastDelta = 0;
              }

              player.answers[qIndex] = { answer, timeMs: timeSpentMs, isCorrect, points };
              broadcastRoom(room, 'answer_submitted');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                isCorrect,
                points,
                totalScore: player.score,
                streak: player.streak
              }));
              return;
            }

            // Host Updates State (advance question, reveal, etc.)
            if (pathname === '/api/live/state') {
              const pin = String(body.pin || '');
              const room = liveRooms.get(pin);
              if (!room) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phòng không tồn tại' }));
                return;
              }
              if (body.stage) room.stage = body.stage;
              if (body.currentQIndex !== undefined) {
                room.currentQIndex = body.currentQIndex;
                room.questionStartTime = Date.now();
              }
              broadcastRoom(room, 'state_change');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, room: { pin: room.pin, stage: room.stage, currentQIndex: room.currentQIndex } }));
              return;
            }

            // Simulate Bot Answers for Load Testing / Demo (up to 100+ students)
            if (pathname === '/api/live/bot-answer') {
              const pin = String(body.pin || '');
              const qIndex = Number(body.qIndex ?? 0);
              const room = liveRooms.get(pin);
              if (!room) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phòng không tồn tại' }));
                return;
              }
              const q = room.questions[qIndex];
              let correct = (q ? (q.correctAnswer || q.correct_answer || body.correctAnswer || 'A') : 'A').toString().trim().toUpperCase();
              if (!correct && q && Array.isArray(q.options)) {
                const opt = q.options.find((o: any) => o && (o.is_correct || o.isCorrect));
                if (opt) correct = (opt.label || 'A').toUpperCase().slice(0, 1);
              }
              const choices = ['A', 'B', 'C', 'D'];
              const botIds = Object.keys(room.players).filter(id => id.startsWith('bot_') || id.startsWith('test_') || id.startsWith('stu_test_') || (room.players[id] && (room.players[id] as any).isBot));

              botIds.forEach(id => {
                const player = room.players[id];
                if (!player) return;
                const isCorrect = Math.random() < 0.82;
                const chosen = isCorrect ? (choices.includes(correct) ? correct : 'A') : (choices.filter(c => c !== correct)[Math.floor(Math.random() * 3)] || 'B');
                const timeSpentMs = Math.floor(1200 + Math.random() * 6000);
                const limitMs = (room.timePerQuestion || 30) * 1000;
                const speedFactor = Math.max(0, Math.min(1, 1 - (timeSpentMs / limitMs)));
                const speedBonus = Math.round(speedFactor * 1000);
                if (isCorrect) {
                  player.streak = (player.streak || 0) + 1;
                  const streakBonus = Math.min(player.streak * 100, 500);
                  const points = 1000 + speedBonus + streakBonus;
                  player.score += points;
                  player.lastDelta = points;
                  player.answers[qIndex] = { answer: chosen, timeMs: timeSpentMs, isCorrect: true, points };
                } else {
                  player.streak = 0;
                  player.lastDelta = 0;
                  player.answers[qIndex] = { answer: chosen, timeMs: timeSpentMs, isCorrect: false, points: 0 };
                }
              });

              broadcastRoom(room, 'answer_submitted');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, answeredBots: botIds.length }));
              return;
            }

            res.writeHead(404);
            res.end();
          });
          return;
        }

        // GET room state / stats
        if (req.method === 'GET' && pathname === '/api/live/room') {
          const pin = parsedUrl.searchParams.get('pin') || '';
          const room = liveRooms.get(pin);
          if (!room) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Phòng không tồn tại' }));
            return;
          }
          const studentId = parsedUrl.searchParams.get('studentId');
          const player = studentId ? room.players[studentId] : null;

          // Compute rankings
          const sortedPlayers = Object.values(room.players).sort((a, b) => b.score - a.score);
          const studentRank = player ? sortedPlayers.findIndex(p => p.id === player.id) + 1 : 0;

          // Current question safe for students (hiding correctAnswer while stage === 'question')
          const curQ = room.questions[room.currentQIndex] || null;
          let safeQ = curQ;
          if (curQ && studentId && room.stage === 'question') {
            safeQ = { ...curQ, correctAnswer: undefined, explanation: undefined };
          }

          // Statistics for Host
          const currentAnswers = Object.values(room.players)
            .map(p => p.answers[room.currentQIndex])
            .filter(Boolean);
          const stats = {
            totalSubmissions: currentAnswers.length,
            correctCount: currentAnswers.filter(a => a.isCorrect).length,
            distribution: { A: 0, B: 0, C: 0, D: 0, others: 0 } as Record<string, number>
          };
          currentAnswers.forEach(a => {
            const letter = String(a.answer || '').toUpperCase().slice(0, 1);
            if (['A', 'B', 'C', 'D'].includes(letter)) stats.distribution[letter]++;
            else stats.distribution.others++;
          });

          // Compute full class statistics
          const allPlayers = Object.values(room.players);
          const totalJoined = allPlayers.length;
          const scores = allPlayers.map(p => p.score || 0);
          const avgScore = totalJoined > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalJoined) : 0;
          const maxScore = totalJoined > 0 ? Math.max(...scores) : 0;
          const minScore = totalJoined > 0 ? Math.min(...scores) : 0;

          // Question-by-question performance
          const questionStats = room.questions.map((q: any, qIdx: number) => {
            const answersForQ = allPlayers.map(p => p.answers[qIdx]).filter(Boolean);
            const correctForQ = answersForQ.filter(a => a.isCorrect).length;
            const accuracyPct = answersForQ.length > 0 ? Math.round((correctForQ / answersForQ.length) * 100) : 0;
            return {
              qIndex: qIdx,
              totalAnswers: answersForQ.length,
              correctCount: correctForQ,
              accuracyPct
            };
          });

          const totalAnswersAll = allPlayers.reduce((acc, p) => acc + Object.keys(p.answers).length, 0);
          const totalCorrectAll = allPlayers.reduce((acc, p) => acc + Object.values(p.answers).filter((a: any) => a.isCorrect).length, 0);
          const overallAccuracyPct = totalAnswersAll > 0 ? Math.round((totalCorrectAll / totalAnswersAll) * 100) : 0;

          const classSummary = {
            totalJoined,
            avgScore,
            maxScore,
            minScore,
            overallAccuracyPct,
            questionStats
          };

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            pin: room.pin,
            stage: room.stage,
            currentQIndex: room.currentQIndex,
            timePerQuestion: room.timePerQuestion,
            questionStartTime: room.questionStartTime,
            totalQuestions: room.questions.length,
            question: safeQ,
            totalPlayers: Object.keys(room.players).length,
            stats,
            classSummary,
            leaderboard: sortedPlayers.slice(0, 150).map((p, idx) => ({
              rank: idx + 1,
              id: p.id,
              name: p.name,
              score: p.score,
              streak: p.streak,
              lastDelta: p.lastDelta,
              correctCount: Object.values(p.answers).filter((a: any) => a.isCorrect).length,
              totalAnswered: Object.keys(p.answers).length
            })),
            student: player ? {
              id: player.id,
              name: player.name,
              score: player.score,
              streak: player.streak,
              rank: studentRank,
              lastAnswer: player.answers[room.currentQIndex] || null
            } : null
          }));
          return;
        }
      }

      // 4. Paper Live Session (QR Scanning Mode) API
      if (pathname.startsWith('/api/paper-live/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        // SSE Stream for Realtime Cross-Device updates
        if (pathname === '/api/paper-live/stream') {
          const sid = parsedUrl.searchParams.get('sid') || '';
          let item = paperLiveSessions.get(sid);
          if (!item) {
            item = { session: null, sseClients: new Set() };
            paperLiveSessions.set(sid, item);
          }
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(`data: ${JSON.stringify({ event: 'connected', sid })}\n\n`);
          item.sseClients.add(res);
          req.on('close', () => {
            item?.sseClients.delete(res);
          });
          return;
        }

        // GET Session
        if (req.method === 'GET' && pathname === '/api/paper-live/session') {
          const sid = parsedUrl.searchParams.get('sid') || '';
          const item = paperLiveSessions.get(sid);
          if (!item || !item.session) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Phiên không tồn tại' }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(item.session));
          return;
        }

        // POST requests
        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            let body: any = {};
            try { body = JSON.parse(bodyStr || '{}'); } catch {}

            // Save / Create session
            if (pathname === '/api/paper-live/session') {
              const sid = body.sid || ('S' + Math.floor(10000 + Math.random() * 90000));
              let item = paperLiveSessions.get(sid);
              if (!item) {
                item = { session: body.session || body, sseClients: new Set() };
                paperLiveSessions.set(sid, item);
              } else {
                item.session = body.session || body;
              }
              broadcastPaperSession(sid, 'session_update', item.session);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, sid }));
              return;
            }

            // Submit Scan
            if (pathname === '/api/paper-live/scan') {
              const { sid, questionIndex, cardNumber, answer, isCorrect } = body;
              let item = paperLiveSessions.get(sid);
              if (!item || !item.session) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phiên không tồn tại' }));
                return;
              }
              const sess = item.session;
              sess.scans = sess.scans || {};
              sess.scans[questionIndex] = sess.scans[questionIndex] || {};
              const existing = sess.scans[questionIndex][String(cardNumber)];
              const prev = existing ? existing.answer : null;
              const isNew = !existing;
              const changed = !isNew && prev !== answer;

              sess.scans[questionIndex][String(cardNumber)] = {
                answer,
                scannedAt: Date.now(),
                isCorrect: !!isCorrect
              };
              broadcastPaperSession(sid, 'scan', { questionIndex, cardNumber, answer, isCorrect, isNew, changed });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, isNew, changed, previousAnswer: prev }));
              return;
            }

            // Connect Device
            if (pathname === '/api/paper-live/connect') {
              const { sid, deviceId, deviceName } = body;
              let item = paperLiveSessions.get(sid);
              if (item && item.session) {
                item.session.devices = item.session.devices || {};
                item.session.devices[deviceId || 'dev_' + Date.now()] = {
                  name: deviceName || 'Máy quét camera',
                  connectedAt: Date.now(),
                  lastSeen: Date.now()
                };
                broadcastPaperSession(sid, 'devices', item.session.devices);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            // Update State (advance, results, status)
            if (pathname === '/api/paper-live/state') {
              const { sid, ...stateUpdate } = body;
              let item = paperLiveSessions.get(sid);
              if (item && item.session) {
                if (stateUpdate.status) {
                  item.session.info = item.session.info || {};
                  item.session.info.status = stateUpdate.status;
                }
                item.session.state = { ...(item.session.state || {}), ...stateUpdate };
                broadcastPaperSession(sid, 'state', item.session.state);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            res.writeHead(404);
            res.end();
          });
          return;
        }
      }

      // 2.2 Render TikZ/LaTeX sang Vector SVG / PDF / PNG (/api/render-tikz)
      if (pathname === '/api/render-tikz') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'Chỉ hỗ trợ POST.' }));
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        req.on('data', (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes <= 128 * 1024) chunks.push(chunk);
        });
        req.on('end', async () => {
          if (totalBytes > 128 * 1024) {
            res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: 'Mã TikZ vượt quá 128KB.' }));
            return;
          }
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const body = rawBody ? JSON.parse(rawBody) : {};
            const code = typeof body.code === 'string' ? body.code : '';
            if (!code.trim()) {
              res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: false, error: 'Thiếu trường code (mã TikZ).' }));
              return;
            }
            const format = ['svg', 'pdf', 'png', 'all'].includes(body.format) ? body.format : 'all';
            const borderPt = Number.isFinite(body.borderPt) ? Number(body.borderPt) : 2;
            const dpi = Number.isFinite(body.dpi) ? Number(body.dpi) : 300;
            const extraPreamble = typeof body.extraPreamble === 'string' ? body.extraPreamble : undefined;

            const result = await renderTikz(code, { format, borderPt, dpi, extraPreamble });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, ...result }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: err?.message || 'Lỗi render TikZ.' }));
          }
        });
        return;
      }

      next();
    });
  }
});

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      liveRoomPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
