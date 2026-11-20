import fs from 'fs';
import path from 'path';
import https from 'https';
import { IncomingMessage, ServerResponse } from 'http';

const ROOT_STORAGE_DIR = path.resolve(process.cwd(), 'public', 'storage');
const PAGES_DIR = path.join(ROOT_STORAGE_DIR, 'exam_pages');
const FIGURES_DIR = path.join(ROOT_STORAGE_DIR, 'exam_figures');
const SMARTEDU_DB_FILE = path.join(ROOT_STORAGE_DIR, 'smartedu_cloud_db.json');

export const DEFAULT_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbwQxI054Rt_-t8oVCUcAQ4F-DHTklMfv7JPyrS-pKTkqV2vtW4zPCup0UXFAIyDxNXZvQ/exec';

export const ADMIN_EMAIL = 'nmh28691@gmail.com';

function ensureDirs() {
  try {
    if (!fs.existsSync(ROOT_STORAGE_DIR)) fs.mkdirSync(ROOT_STORAGE_DIR, { recursive: true });
    if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
    if (!fs.existsSync(FIGURES_DIR)) fs.mkdirSync(FIGURES_DIR, { recursive: true });
  } catch {
    // Read-only filesystem on serverless (e.g. Vercel) — safe no-op
  }
}

export function getLocalSmartEduDb(): any {
  ensureDirs();
  try {
    if (fs.existsSync(SMARTEDU_DB_FILE)) {
      return JSON.parse(fs.readFileSync(SMARTEDU_DB_FILE, 'utf8'));
    }
  } catch {}
  return {
    updatedAt: Date.now(),
    adminEmail: ADMIN_EMAIL,
    teachers: [
      {
        email: ADMIN_EMAIL,
        name: 'Thầy Nguyễn Mạnh Hùng (Admin)',
        role: 'admin',
        status: 'approved',
        school: 'THPT Số 1 Lê Hồng Phong',
        subject: 'Toán học',
        updatedAt: Date.now()
      }
    ],
    apiKeys: {},
    classes: [],
    assignments: [],
    submissions: [],
    farms: {},
    gardens: {}
  };
}

export function saveLocalSmartEduDb(db: any) {
  ensureDirs();
  try {
    fs.writeFileSync(SMARTEDU_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch {}
}

export function mergeSmartEduDb(base: any, incoming: any): any {
  const result = {
    updatedAt: Date.now(),
    adminEmail: ADMIN_EMAIL,
    teachers: Array.isArray(base?.teachers) ? [...base.teachers] : [],
    apiKeys: { ...(base?.apiKeys || {}) },
    classes: Array.isArray(base?.classes) ? [...base.classes] : [],
    assignments: Array.isArray(base?.assignments) ? [...base.assignments] : [],
    submissions: Array.isArray(base?.submissions) ? [...base.submissions] : [],
    farms: { ...(base?.farms || {}) },
    gardens: { ...(base?.gardens || {}) }
  };

  if (!incoming || typeof incoming !== 'object') return result;

  // Merge teachers by email
  if (Array.isArray(incoming.teachers)) {
    const map = new Map<string, any>();
    result.teachers.forEach((t: any) => {
      if (t && t.email) map.set(String(t.email).toLowerCase().trim(), t);
    });
    incoming.teachers.forEach((t: any) => {
      if (t && t.email) {
        const key = String(t.email).toLowerCase().trim();
        const prev = map.get(key) || {};
        map.set(key, {
          ...prev,
          ...t,
          email: key,
          role: key === ADMIN_EMAIL ? 'admin' : (t.role === 'admin' ? 'teacher' : (t.role || prev.role || 'teacher')),
          status: 'approved'
        });
      }
    });
    // Ensure Admin nmh28691@gmail.com always exists
    if (!map.has(ADMIN_EMAIL)) {
      map.set(ADMIN_EMAIL, {
        email: ADMIN_EMAIL,
        name: 'Thầy Nguyễn Mạnh Hùng (Admin)',
        role: 'admin',
        status: 'approved',
        school: 'THPT Số 1 Lê Hồng Phong',
        subject: 'Toán học',
        updatedAt: Date.now()
      });
    } else {
      const adm = map.get(ADMIN_EMAIL);
      adm.role = 'admin';
      adm.status = 'approved';
    }
    result.teachers = Array.from(map.values());
  }

  // Merge apiKeys by email
  if (incoming.apiKeys && typeof incoming.apiKeys === 'object') {
    for (const [rawEmail, val] of Object.entries(incoming.apiKeys)) {
      const email = String(rawEmail).toLowerCase().trim();
      if (!email) continue;
      if (typeof val === 'string' && val.trim()) {
        result.apiKeys[email] = {
          apiKey: val.trim(),
          apiKeyPool: val.trim(),
          updatedAt: Date.now()
        };
      } else if (val && typeof val === 'object' && (val as any).apiKey) {
        result.apiKeys[email] = {
          ...(result.apiKeys[email] || {}),
          ...(val as any),
          updatedAt: (val as any).updatedAt || Date.now()
        };
      }
    }
  }

  // Merge classes by id
  if (Array.isArray(incoming.classes) && incoming.classes.length > 0) {
    const map = new Map<string, any>();
    result.classes.forEach((c: any) => { if (c && c.id) map.set(String(c.id), c); });
    incoming.classes.forEach((c: any) => { if (c && c.id) map.set(String(c.id), c); });
    result.classes = Array.from(map.values());
  }

  // Merge assignments by id
  if (Array.isArray(incoming.assignments) && incoming.assignments.length > 0) {
    const map = new Map<string, any>();
    result.assignments.forEach((a: any) => { if (a && a.id) map.set(String(a.id), a); });
    incoming.assignments.forEach((a: any) => { if (a && a.id) map.set(String(a.id), a); });
    result.assignments = Array.from(map.values());
  }

  // Merge submissions by id
  if (Array.isArray(incoming.submissions) && incoming.submissions.length > 0) {
    const map = new Map<string, any>();
    result.submissions.forEach((s: any) => { if (s && s.id) map.set(String(s.id), s); });
    incoming.submissions.forEach((s: any) => { if (s && s.id) map.set(String(s.id), s); });
    result.submissions = Array.from(map.values());
  }

  // Merge farms & gardens by studentId
  if (incoming.farms && typeof incoming.farms === 'object') {
    for (const [stdId, fData] of Object.entries(incoming.farms)) {
      if (stdId && fData && typeof fData === 'object') {
        result.farms[stdId] = { ...(result.farms[stdId] || {}), ...(fData as any) };
      }
    }
  }
  if (incoming.gardens && typeof incoming.gardens === 'object') {
    for (const [stdId, gData] of Object.entries(incoming.gardens)) {
      if (stdId && gData && typeof gData === 'object') {
        result.gardens[stdId] = { ...(result.gardens[stdId] || {}), ...(gData as any) };
      }
    }
  }

  return result;
}

export async function syncWithGoogleSheet(sheetUrl: string, incomingDb?: any): Promise<any> {
  const targetUrl = (sheetUrl && sheetUrl.includes('script.google.com')) ? sheetUrl.trim() : DEFAULT_GOOGLE_SHEET_URL;
  let localDb = getLocalSmartEduDb();
  if (incomingDb) {
    localDb = mergeSmartEduDb(localDb, incomingDb);
    saveLocalSmartEduDb(localDb);
  }

  try {
    const getResp = await fetch(`${targetUrl}?action=get&_t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const remoteJson: any = await getResp.json();
    const rawData = remoteJson?.data || remoteJson || {};
    const remoteSmartEdu = rawData?.smartedu_cloud_db || rawData?.smartedu || null;

    if (remoteSmartEdu && typeof remoteSmartEdu === 'object') {
      localDb = mergeSmartEduDb(remoteSmartEdu, localDb);
      if (incomingDb) {
        localDb = mergeSmartEduDb(localDb, incomingDb);
      }
      saveLocalSmartEduDb(localDb);
    }

    // If incomingDb was provided, push merged state back to Google Sheet
    if (incomingDb) {
      const postPayload = {
        ...rawData,
        action: 'sync',
        violations: Array.isArray(rawData.violations) ? rawData.violations : [],
        smartedu_cloud_db: localDb
      };
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(postPayload)
      }).catch(() => {});
    }

    return { ok: true, db: localDb, sheetUrl: targetUrl, syncedWithGoogleSheet: true };
  } catch (err: any) {
    return { ok: true, db: localDb, sheetUrl: targetUrl, syncedWithGoogleSheet: false, warning: err?.message };
  }
}

function getPagesIndex(): any[] {
  ensureDirs();
  const indexFile = path.join(PAGES_DIR, 'pages.json');
  if (!fs.existsSync(indexFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  } catch {
    return [];
  }
}

function savePagesIndex(list: any[]) {
  ensureDirs();
  try {
    const indexFile = path.join(PAGES_DIR, 'pages.json');
    fs.writeFileSync(indexFile, JSON.stringify(list, null, 2), 'utf8');
  } catch {}
}

function getFiguresIndex(): any[] {
  ensureDirs();
  const indexFile = path.join(FIGURES_DIR, 'figures.json');
  if (!fs.existsSync(indexFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  } catch {
    return [];
  }
}

function saveFiguresIndex(list: any[]) {
  ensureDirs();
  try {
    const indexFile = path.join(FIGURES_DIR, 'figures.json');
    fs.writeFileSync(indexFile, JSON.stringify(list, null, 2), 'utf8');
  } catch {}
}

function parseBase64(dataUrl: string): { ext: string; buffer: Buffer } {
  const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (matches) {
    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    return { ext, buffer: Buffer.from(matches[2], 'base64') };
  }
  return { ext: 'png', buffer: Buffer.from(dataUrl, 'base64') };
}

export async function handleCloudStorage(req: IncomingMessage, res: ServerResponse) {
  ensureDirs();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 0. GET / POST /api/cloud-storage/smartedu-db (Đồng bộ dữ liệu Giáo viên, API Key, Lớp học, Bài tập, Bài làm, Nông trại với Google Sheet)
  if (pathname === '/api/cloud-storage/smartedu-db') {
    if (req.method === 'GET') {
      const sheetUrl = urlObj.searchParams.get('sheetUrl') || DEFAULT_GOOGLE_SHEET_URL;
      const result = await syncWithGoogleSheet(sheetUrl);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const sheetUrl = payload.sheetUrl || DEFAULT_GOOGLE_SHEET_URL;
          const incomingDb = payload.db || payload;
          const result = await syncWithGoogleSheet(sheetUrl, incomingDb);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      });
      return;
    }
  }

  // 1. GET /api/cloud-storage/pages
  if (req.method === 'GET' && pathname === '/api/cloud-storage/pages') {
    const pages = getPagesIndex();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, pages }));
    return;
  }

  // 2. GET /api/cloud-storage/figures
  if (req.method === 'GET' && pathname === '/api/cloud-storage/figures') {
    const figures = getFiguresIndex();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, figures }));
    return;
  }

  // 3. POST /api/cloud-storage/save-page
  if (req.method === 'POST' && pathname === '/api/cloud-storage/save-page') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { id, dataUrl, name, meta } = payload;
        if (!dataUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Thiếu dataUrl ảnh trang' }));
          return;
        }
        const safeId = String(id || `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const { ext, buffer } = parseBase64(dataUrl);
        const fileName = `${safeId}.${ext}`;
        const filePath = path.join(PAGES_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        const pageUrl = `/storage/exam_pages/${fileName}`;
        const pages = getPagesIndex();
        const existingIdx = pages.findIndex(p => p.id === safeId);
        const item = {
          id: safeId,
          url: pageUrl,
          name: name || fileName,
          size: buffer.length,
          updatedAt: new Date().toISOString(),
          meta: meta || {}
        };
        if (existingIdx >= 0) {
          pages[existingIdx] = item;
        } else {
          pages.unshift(item);
        }
        savePagesIndex(pages);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, page: item }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 4. POST /api/cloud-storage/save-figure
  if (req.method === 'POST' && pathname === '/api/cloud-storage/save-figure') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { id, dataUrl, pageNo, bbox, desc, pageId } = payload;
        if (!dataUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Thiếu dataUrl ảnh hình đã cắt' }));
          return;
        }
        const safeId = String(id || `fig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const { ext, buffer } = parseBase64(dataUrl);
        const fileName = `${safeId}.${ext}`;
        const filePath = path.join(FIGURES_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        const figUrl = `/storage/exam_figures/${fileName}`;
        const figures = getFiguresIndex();
        const existingIdx = figures.findIndex(f => f.id === safeId);
        const item = {
          id: safeId,
          url: figUrl,
          pageId: pageId || null,
          pageNo: pageNo || 1,
          bbox: bbox || null,
          desc: desc || '',
          size: buffer.length,
          updatedAt: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          figures[existingIdx] = item;
        } else {
          figures.unshift(item);
        }
        saveFiguresIndex(figures);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, figure: item }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 5. POST /api/cloud-storage/sync-sheet (Đồng bộ lên Google Trang tính qua Apps Script)
  if (req.method === 'POST' && pathname === '/api/cloud-storage/sync-sheet') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const scriptUrl = payload.scriptUrl || DEFAULT_GOOGLE_SHEET_URL;
        const { examTitle, examMarkdown, figuresCount, pagesCount, author } = payload;
        if (!scriptUrl || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'URL Google Apps Script chưa đúng định dạng https://script.google.com/macros/s/.../exec' }));
          return;
        }

        const forwardPayload = JSON.stringify({
          action: 'saveExam',
          timestamp: new Date().toISOString(),
          title: examTitle || 'Đề thi THPT',
          markdown: examMarkdown || '',
          figuresCount: figuresCount || 0,
          pagesCount: pagesCount || 0,
          author: author || 'Thầy Nguyễn Mạnh Hùng'
        });

        const clientReq = https.request(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Content-Length': Buffer.byteLength(forwardPayload)
          }
        }, (clientRes) => {
          let resBody = '';
          clientRes.on('data', d => { resBody += d; });
          clientRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, message: 'Đã gửi dữ liệu tới Google Trang tính!', response: resBody }));
          });
        });

        clientReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'Không thể kết nối tới Google Sheets Apps Script: ' + e.message }));
        });

        clientReq.write(forwardPayload);
        clientReq.end();
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Endpoint cloud storage không tồn tại' }));
}
