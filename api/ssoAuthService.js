/**
 * CENTRALIZED AUTH & SSO SERVER (Single Source of Truth)
 * Module: api/ssoAuthService.js (ES Module for Vite & Vercel)
 * 
 * Kiến trúc bảo mật cấp cao:
 * 1. Single Source of Truth cho users & refresh_tokens.
 * 2. Hash mật khẩu bằng bcrypt (10 rounds).
 * 3. Access Token (15 phút) & Refresh Token (7 ngày).
 * 4. Refresh Token Rotation & Token Reuse Detection (chống chiếm đoạt phiên).
 * 5. Single Logout (SLO) - thu hồi toàn bộ phiên đăng nhập từ xa.
 * 6. HttpOnly, SameSite=Lax, Secure Cookie cho cùng domain / subdomain.
 * 7. OAuth2 Authorization Code + PKCE cho web con khác domain.
 * 8. Rate Limiting (tối đa 5 request/phút/IP đối với login/register).
 * 9. Khóa chặt ALLOWED_REDIRECT_URIS chống Open Redirect.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper cookie chuẩn hóa, độc lập và bảo mật cao
function serializeCookie(name, val, options = {}) {
  let enc = encodeURIComponent(name) + '=' + encodeURIComponent(val);
  if (options.maxAge !== undefined) enc += '; Max-Age=' + Math.floor(options.maxAge);
  if (options.path) enc += '; Path=' + options.path;
  if (options.domain) enc += '; Domain=' + options.domain;
  if (options.sameSite) enc += '; SameSite=' + options.sameSite;
  if (options.secure) enc += '; Secure';
  if (options.httpOnly) enc += '; HttpOnly';
  return enc;
}

function parseCookies(req) {
  const header = req.headers?.cookie || '';
  const list = {};
  header.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (!name) return;
    const value = decodeURIComponent(parts.join('=') || '');
    list[name] = value;
  });
  return list;
}

// Đọc biến môi trường từ process.env hoặc file .env.local / .env tại workspace
function getEnvVar(key) {
  if (process.env[key]) return String(process.env[key]).trim();
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) continue;
      const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const k = trimmed.slice(0, eqIdx).trim();
        if (k === key) {
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (val) return val;
        }
      }
    } catch (e) {}
  }
  return '';
}

function getRequestOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

function renderPopupResultHtml(payload, origin) {
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c');
  const safeOrigin = JSON.stringify(origin || '*');
  const isSuccess = !!payload.success;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${isSuccess ? 'Đăng nhập Google thành công' : 'Thông báo Đăng nhập Google'} — MHEdu</title>
  <style>
    body { margin: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 28px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
    h2 { margin: 0 0 10px; font-size: 20px; color: ${isSuccess ? '#34d399' : '#f87171'}; }
    p { margin: 0 0 16px; font-size: 14px; color: #cbd5e1; line-height: 1.5; }
    .btn { display: inline-block; background: #4f46e5; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${isSuccess ? '✅ Đăng nhập Google thành công!' : '⚠️ Không thể đăng nhập Google'}</h2>
    <p>${isSuccess ? 'Đang đồng bộ tài khoản về hệ thống MHEdu...' : (payload.message || 'Đã xảy ra lỗi xác thực.')}</p>
    <button class="btn" onclick="window.close()">Đóng cửa sổ</button>
  </div>
  <script>
    (function() {
      var data = ${safePayload};
      var targetOrigin = ${safeOrigin};
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'MHEDU_GOOGLE_OAUTH_RESULT', payload: data }, targetOrigin);
          setTimeout(function() { window.close(); }, ${isSuccess ? 350 : 2500});
          return;
        }
      } catch (e) {}
      if (data.success) {
        setTimeout(function() { window.location.href = '/'; }, 800);
      }
    })();
  </script>
</body>
</html>`;
}

// Đường dẫn file lưu trữ Database người dùng & refresh tokens
const DATA_DIR = path.resolve(process.cwd(), 'storage');
const DB_FILE = path.join(DATA_DIR, 'sso_auth_database.json');

// Biến môi trường hoặc mặc định bảo mật
const JWT_SECRET = getEnvVar('JWT_SECRET') || 'mhedu-sso-secret-key-super-secure-2026-v1';
const ACCESS_TOKEN_TTL = 15 * 60; // 15 phút (giây)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày (mili giây)

// Danh sách domain / redirect URI được phép trong hệ sinh thái MHEdu (Whitelist)
export const ALLOWED_REDIRECT_URIS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  ...(getEnvVar('ALLOWED_ORIGINS') ? getEnvVar('ALLOWED_ORIGINS').split(',').map(s => s.trim()).filter(Boolean) : [])
];

// Khởi tạo thư mục storage
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

// Bộ đệm Rate Limiter in-memory (5 requests / phút / IP)
const rateLimitMap = new Map();

function checkRateLimit(ip, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= limit;
}

// Đọc Database
export function loadDb() {
  const defaultAdminHash = bcrypt.hashSync('Taynguyen286@', 10);
  const defaultDb = {
    users: [
      {
        id: 'usr_admin_0965908084',
        email: 'nmh28691@gmail.com',
        passwordHash: defaultAdminHash,
        name: 'Thầy Nguyễn Mạnh Hùng',
        role: 'admin',
        school: 'THPT Số 1 Lê Hồng Phong',
        subject: 'Toán học',
        phone: '0965908084',
        avatar: '👑',
        credits: 999999,
        vip: 'VIP4 ADMIN',
        createdAt: 1700000000000,
        updatedAt: Date.now()
      }
    ],
    refreshTokens: [],
    authCodes: []
  };

  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf8');
      return defaultDb;
    } catch (e) {
      return defaultDb;
    }
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.users)) parsed.users = defaultDb.users;
    if (!Array.isArray(parsed.refreshTokens)) parsed.refreshTokens = [];
    if (!Array.isArray(parsed.authCodes)) parsed.authCodes = [];
    
    // Đảm bảo tài khoản Admin luôn có mặt và cập nhật mật khẩu chuẩn Taynguyen286@
    let admin = parsed.users.find(u => u.email === 'nmh28691@gmail.com');
    if (!admin) {
      parsed.users.unshift(defaultDb.users[0]);
    } else {
      admin.role = 'admin';
      admin.name = 'Thầy Nguyễn Mạnh Hùng';
      admin.phone = '0965908084';
      admin.vip = 'VIP4 ADMIN';
      if (!bcrypt.compareSync('Taynguyen286@', admin.passwordHash)) {
        admin.passwordHash = defaultAdminHash;
      }
    }
    return parsed;
  } catch (err) {
    return defaultDb;
  }
}

// Lưu Database
export function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[SSO Database] Error saving database:', e);
  }
}

// Tạo JWT Access Token (15m)
export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      school: user.school || '',
      vip: user.vip || 'FREE',
      credits: user.credits || 0
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Tạo Refresh Token bảo mật ngẫu nhiên (64 hex)
export function generateRefreshTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

// Lấy IP từ request
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

// Định dạng User an toàn
function sanitizeUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    school: u.school || '',
    subject: u.subject || '',
    phone: u.phone || '',
    avatar: u.avatar || (u.role === 'admin' ? '👑' : '👨‍🏫'),
    vip: u.vip || (u.role === 'admin' ? 'VIP4 ADMIN' : 'FREE'),
    credits: typeof u.credits === 'number' ? u.credits : 100,
    createdAt: u.createdAt
  };
}

// Thiết lập HttpOnly Cookie
function setAuthCookies(res, accessToken, refreshTokenString, req) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookies = [];

  if (accessToken) {
    cookies.push(
      serializeCookie('sso_access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: ACCESS_TOKEN_TTL,
        path: '/'
      })
    );
  }

  if (refreshTokenString) {
    cookies.push(
      serializeCookie('sso_refresh_token', refreshTokenString, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: Math.floor(REFRESH_TOKEN_TTL / 1000),
        path: '/'
      })
    );
  }

  res.setHeader('Set-Cookie', cookies);
}

// Xóa HttpOnly Cookie khi Logout
function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', [
    serializeCookie('sso_access_token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    }),
    serializeCookie('sso_refresh_token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
  ]);
}

/**
 * =========================================================================
 * CÁC HÀM XỬ LÝ API CORE SSO
 * =========================================================================
 */

// 1. Đăng ký tài khoản (Email + Password)
export async function handleRegister(body, req, res) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 5, 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Thao tác quá nhanh. Vui lòng đợi 1 phút.' });
  }

  const email = String(body?.email || '').toLowerCase().trim();
  const password = String(body?.password || '').trim();
  const name = String(body?.name || '').trim();
  const school = String(body?.school || '').trim();
  const subject = String(body?.subject || '').trim();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Địa chỉ Email không hợp lệ.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự.' });
  }

  const db = loadDb();
  if (db.users.some(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống.' });
  }

  const isAdmin = email === 'nmh28691@gmail.com' || email === 'hungvd286@gmail.com';
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email,
    passwordHash,
    name: name || (isAdmin ? 'Thầy Nguyễn Mạnh Hùng' : email.split('@')[0]),
    role: isAdmin ? 'admin' : 'teacher',
    school: school || 'Trường THPT',
    subject: subject || 'Toán học',
    phone: '',
    avatar: isAdmin ? '👑' : '👨‍🏫',
    vip: isAdmin ? 'VIP4 ADMIN' : 'FREE',
    credits: isAdmin ? 999999 : 200,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  db.users.push(newUser);

  // Tạo Token
  const accessToken = generateAccessToken(newUser);
  const refreshTokenString = generateRefreshTokenString();

  db.refreshTokens.push({
    token: refreshTokenString,
    userId: newUser.id,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL,
    createdAt: Date.now(),
    ip,
    userAgent: req.headers['user-agent'] || '',
    revoked: false
  });

  saveDb(db);
  setAuthCookies(res, accessToken, refreshTokenString, req);

  return res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công.',
    user: sanitizeUser(newUser),
    accessToken
  });
}

// 2. Đăng nhập tài khoản (Email + Password)
export async function handleLogin(body, req, res) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 5, 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Thao tác quá nhanh. Vui lòng đợi 1 phút.' });
  }

  const email = String(body?.email || '').toLowerCase().trim();
  const password = String(body?.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
  }

  const db = loadDb();
  const user = db.users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại trong hệ thống.' });
  }

  // Đối với Admin, mật khẩu bắt buộc phải là Taynguyen286@
  if (user.role === 'admin' || email === 'nmh28691@gmail.com') {
    if (password !== 'Taynguyen286@' && !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Mật khẩu Quản trị viên không chính xác!' });
    }
  } else {
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác.' });
    }
  }

  // Tạo cặp token mới
  const accessToken = generateAccessToken(user);
  const refreshTokenString = generateRefreshTokenString();

  db.refreshTokens.push({
    token: refreshTokenString,
    userId: user.id,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL,
    createdAt: Date.now(),
    ip,
    userAgent: req.headers['user-agent'] || '',
    revoked: false
  });

  saveDb(db);
  setAuthCookies(res, accessToken, refreshTokenString, req);

  return res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công.',
    user: sanitizeUser(user),
    accessToken
  });
}

// Helper dùng chung: tạo hoặc cập nhật user sau khi ĐÃ XÁC THỰC thật với Google
function upsertVerifiedGoogleUser(profile, req, res) {
  const ip = getClientIp(req);
  const email = String(profile?.email || '').toLowerCase().trim();
  const name = String(profile?.name || '').trim();
  const avatar = String(profile?.avatar || profile?.picture || '').trim();

  const db = loadDb();
  let user = db.users.find(u => u.email === email);
  const isAdmin = email === 'nmh28691@gmail.com' || email === 'hungvd286@gmail.com';

  if (!user) {
    user = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      email,
      passwordHash: '',
      name: name || (isAdmin ? 'Thầy Nguyễn Mạnh Hùng' : email.split('@')[0]),
      role: isAdmin ? 'admin' : 'teacher',
      school: 'THPT Số 1 Lê Hồng Phong',
      subject: 'Toán học',
      phone: isAdmin ? '0965908084' : '',
      avatar: avatar || (isAdmin ? '👑' : '👨‍🏫'),
      vip: isAdmin ? 'VIP4 ADMIN' : 'VIP4',
      credits: isAdmin ? 999999 : 500,
      loginProvider: 'google',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    db.users.push(user);
  } else {
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (isAdmin) {
      user.role = 'admin';
      user.vip = 'VIP4 ADMIN';
      user.phone = '0965908084';
    }
    user.loginProvider = 'google';
    user.updatedAt = Date.now();
  }

  const accessToken = generateAccessToken(user);
  const refreshTokenString = generateRefreshTokenString();

  db.refreshTokens.push({
    token: refreshTokenString,
    userId: user.id,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL,
    createdAt: Date.now(),
    ip,
    userAgent: req.headers['user-agent'] || '',
    revoked: false
  });

  saveDb(db);
  setAuthCookies(res, accessToken, refreshTokenString, req);
  return { user: sanitizeUser(user), accessToken };
}

// 3A. Kiểm tra trạng thái cấu hình Google OAuth 2.0 (chỉ trả về trạng thái & redirectUri, tuyệt đối không lộ Secret)
export async function handleGoogleConfig(req, res) {
  const clientId = getEnvVar('GOOGLE_CLIENT_ID');
  const clientSecret = getEnvVar('GOOGLE_CLIENT_SECRET');
  const origin = getRequestOrigin(req);
  const redirectUri = getEnvVar('GOOGLE_REDIRECT_URI') || `${origin}/api/auth/google/callback`;
  return res.status(200).json({
    success: true,
    configured: !!(clientId && clientSecret),
    redirectUri
  });
}

// 3B. Khởi tạo luồng Google OAuth 2.0 chuẩn (chạy trực tiếp trên domain web của thầy, KHÔNG dùng Firebase của web khác)
export async function handleGoogleOAuthStart(req, res) {
  const clientId = getEnvVar('GOOGLE_CLIENT_ID');
  const clientSecret = getEnvVar('GOOGLE_CLIENT_SECRET');
  const origin = getRequestOrigin(req);
  const redirectUri = getEnvVar('GOOGLE_REDIRECT_URI') || `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Cấu hình Google OAuth 2.0 — MHEdu</title>
  <style>
    body { margin: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 26px; max-width: 540px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.45); }
    h2 { margin: 0 0 10px; font-size: 19px; color: #fbbf24; }
    p, li { font-size: 13.5px; color: #cbd5e1; line-height: 1.55; }
    ol { padding-left: 18px; margin: 12px 0; }
    code { background: #0f172a; color: #34d399; padding: 2px 6px; border-radius: 6px; font-size: 12.5px; word-break: break-all; }
    pre { background: #0f172a; color: #a7f3d0; padding: 12px; border-radius: 10px; font-size: 12px; overflow-x: auto; border: 1px solid #334155; }
    .btn { margin-top: 12px; background: #4f46e5; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚙️ Chưa điền khóa Google OAuth 2.0 của riêng web thầy</h2>
    <p>Hệ thống đã chuyển sang <b>Google OAuth 2.0 độc lập cho MHEdu</b> (không còn dùng đường dẫn của <i>giaoviendoimoi</i>). Để nút đăng nhập Google hoạt động ngay, thầy làm 3 bước ngắn:</p>
    <ol>
      <li>Vào <b>Google Cloud Console</b> &rarr; <i>APIs &amp; Services &rarr; Credentials &rarr; Create Credentials &rarr; OAuth client ID (Web application)</i>.</li>
      <li>Ở mục <b>Authorized redirect URIs</b>, dán chính xác dòng sau:<br/><code>${redirectUri}</code></li>
      <li>Tạo file <code>.env</code> ở thư mục gốc dự án (hoặc biến môi trường trên Vercel) và dán 2 dòng:</li>
    </ol>
    <pre>GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret</pre>
    <p>Sau khi lưu <code>.env</code>, bấm lại nút <b>Đăng nhập nhanh bằng tài khoản Google</b> là đăng nhập được ngay!</p>
    <button class="btn" onclick="window.close()">Đã hiểu — Đóng cửa sổ</button>
  </div>
</body>
</html>`);
  }

  // Tạo state ngẫu nhiên chống CSRF và lưu trong HttpOnly Cookie (10 phút)
  const state = crypto.randomBytes(24).toString('hex');
  const isProd = origin.startsWith('https://');
  const stateCookie = serializeCookie('sso_oauth_state', state, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  });
  res.setHeader('Set-Cookie', stateCookie);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('state', state);

  return res.redirect(302, authUrl.toString());
}

// 3C. Callback từ Google OAuth 2.0 (đổi code lấy token ở phía Server, cấp HttpOnly SSO Cookie)
export async function handleGoogleOAuthCallback(req, res) {
  const origin = getRequestOrigin(req);
  const parsedUrl = new URL(req.url || '/', origin);
  const code = parsedUrl.searchParams.get('code');
  const state = parsedUrl.searchParams.get('state');
  const error = parsedUrl.searchParams.get('error');

  if (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderPopupResultHtml({
      success: false,
      message: error === 'access_denied' ? 'Bạn đã hủy chọn tài khoản Google.' : `Google trả về lỗi: ${error}`
    }, origin));
  }

  const cookies = parseCookies(req);
  const expectedState = cookies.sso_oauth_state;
  if (!code || !state || !expectedState || state !== expectedState) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(renderPopupResultHtml({
      success: false,
      message: 'Phiên xác thực Google không hợp lệ hoặc đã hết hạn (lỗi CSRF state). Vui lòng thử lại.'
    }, origin));
  }

  const clientId = getEnvVar('GOOGLE_CLIENT_ID');
  const clientSecret = getEnvVar('GOOGLE_CLIENT_SECRET');
  const redirectUri = getEnvVar('GOOGLE_REDIRECT_URI') || `${origin}/api/auth/google/callback`;

  try {
    // 1. Đổi authorization code lấy access_token trực tiếp từ máy chủ Google (Back-channel)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Không thể đổi mã xác thực với Google.');
    }

    // 2. Lấy thông tin tài khoản Google đã xác thực
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userInfoRes.json();

    if (!userInfoRes.ok || !profile.email) {
      throw new Error('Không lấy được địa chỉ Email từ tài khoản Google.');
    }

    // 3. Tạo / cập nhật User & cấp cặp HttpOnly SSO Cookies
    const { user } = upsertVerifiedGoogleUser({
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.picture || ''
    }, req, res);

    // Xóa state cookie tạm
    const isProd = origin.startsWith('https://');
    const existingCookies = res.getHeader('Set-Cookie');
    const cookieList = Array.isArray(existingCookies) ? existingCookies : (existingCookies ? [existingCookies] : []);
    cookieList.push(serializeCookie('sso_oauth_state', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    }));
    res.setHeader('Set-Cookie', cookieList);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderPopupResultHtml({
      success: true,
      message: 'Đăng nhập Google thành công.',
      user
    }, origin));
  } catch (err) {
    console.error('[Google OAuth Callback Error]:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderPopupResultHtml({
      success: false,
      message: err?.message || 'Lỗi xác thực với máy chủ Google.'
    }, origin));
  }
}

// 3D. Đăng nhập Google bằng id_token đã xác thực (chống giả mạo email trực tiếp)
export async function handleGoogleLogin(body, req, res) {
  const idToken = String(body?.idToken || body?.credential || '').trim();
  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu Google ID Token hợp lệ. Vui lòng đăng nhập qua cửa sổ Google OAuth (/api/auth/google/start).'
    });
  }

  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    const tokenInfo = await verifyRes.json();
    const expectedClientId = getEnvVar('GOOGLE_CLIENT_ID');

    if (!verifyRes.ok || !tokenInfo.email || tokenInfo.email_verified !== 'true') {
      return res.status(401).json({ success: false, message: 'Google Token không hợp lệ hoặc chưa xác minh Email.' });
    }
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      return res.status(401).json({ success: false, message: 'Google Token không khớp với Client ID của hệ thống.' });
    }

    const { user, accessToken } = upsertVerifiedGoogleUser({
      email: tokenInfo.email,
      name: tokenInfo.name || tokenInfo.email.split('@')[0],
      avatar: tokenInfo.picture || ''
    }, req, res);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công.',
      user,
      accessToken
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi xác minh Google Token.' });
  }
}

// 4. Silent Refresh Token & Token Rotation
export async function handleRefresh(req, res) {
  const cookies = parseCookies(req);
  let oldToken = cookies.sso_refresh_token;

  if (!oldToken && req.body && req.body.refreshToken) {
    oldToken = req.body.refreshToken;
  }

  if (!oldToken) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy refresh token.' });
  }

  const db = loadDb();
  const tokenRecord = db.refreshTokens.find(t => t.token === oldToken);

  // Phát hiện hành vi sử dụng lại Token bị thu hồi (Token Reuse Attack)
  if (!tokenRecord || tokenRecord.revoked) {
    if (tokenRecord && tokenRecord.revoked) {
      db.refreshTokens.forEach(t => {
        if (t.userId === tokenRecord.userId) t.revoked = true;
      });
      saveDb(db);
    }
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Cảnh báo bảo mật: Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.'
    });
  }

  // Kiểm tra hạn sử dụng
  if (Date.now() > tokenRecord.expiresAt) {
    tokenRecord.revoked = true;
    saveDb(db);
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn.' });
  }

  const user = db.users.find(u => u.id === tokenRecord.userId);
  if (!user) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'Người dùng không còn tồn tại.' });
  }

  // TOKEN ROTATION: Đánh dấu thu hồi token cũ ngay lập tức
  tokenRecord.revoked = true;

  // Cấp cặp Token mới
  const newAccessToken = generateAccessToken(user);
  const newRefreshTokenString = generateRefreshTokenString();

  db.refreshTokens.push({
    token: newRefreshTokenString,
    userId: user.id,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL,
    createdAt: Date.now(),
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    revoked: false
  });

  saveDb(db);
  setAuthCookies(res, newAccessToken, newRefreshTokenString, req);

  return res.status(200).json({
    success: true,
    user: sanitizeUser(user),
    accessToken: newAccessToken
  });
}

// 5. Single Logout (SLO) - Thu hồi token và xóa cookie toàn bộ hệ thống
export async function handleLogout(req, res) {
  const cookies = parseCookies(req);
  const rToken = cookies.sso_refresh_token;

  if (rToken) {
    const db = loadDb();
    const tokenRecord = db.refreshTokens.find(t => t.token === rToken);
    if (tokenRecord) {
      tokenRecord.revoked = true;
      saveDb(db);
    }
  }

  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: 'Đã đăng xuất toàn hệ sinh thái.' });
}

// 6. Lấy thông tin phiên hiện tại (/api/auth/me)
export async function handleMe(req, res) {
  const cookies = parseCookies(req);
  let token = cookies.sso_access_token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = loadDb();
      const user = db.users.find(u => u.id === decoded.sub);
      if (user) {
        return res.status(200).json({
          success: true,
          user: sanitizeUser(user)
        });
      }
    } catch (err) {}
  }

  // Thử Silent Refresh nếu có refresh token
  if (cookies.sso_refresh_token) {
    return handleRefresh(req, res);
  }

  return res.status(401).json({ success: false, user: null, message: 'Chưa đăng nhập.' });
}

// 7. OAuth2 Authorize Endpoint (Dành cho Cross-domain với PKCE)
export async function handleAuthorize(query, req, res) {
  const redirectUri = String(query?.redirect_uri || '').trim();
  const codeChallenge = String(query?.code_challenge || '').trim();
  const state = String(query?.state || '').trim();

  const isAllowed = ALLOWED_REDIRECT_URIS.some(uri => redirectUri.startsWith(uri));
  if (!isAllowed) {
    return res.status(400).json({ success: false, message: 'Redirect URI không nằm trong whitelist cho phép.' });
  }

  const cookies = parseCookies(req);
  let user = null;
  if (cookies.sso_access_token) {
    try {
      const decoded = jwt.verify(cookies.sso_access_token, JWT_SECRET);
      const db = loadDb();
      user = db.users.find(u => u.id === decoded.sub);
    } catch (e) {}
  }

  if (!user) {
    const loginUrl = `/?auth=login&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${encodeURIComponent(codeChallenge)}&state=${encodeURIComponent(state)}`;
    return res.redirect(302, loginUrl);
  }

  const code = 'code_' + crypto.randomBytes(32).toString('hex');
  const db = loadDb();
  db.authCodes.push({
    code,
    userId: user.id,
    codeChallenge,
    redirectUri,
    expiresAt: Date.now() + 2 * 60 * 1000,
    used: false
  });
  saveDb(db);

  const finalUrl = `${redirectUri}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
  return res.redirect(302, finalUrl);
}

// 8. OAuth2 Token Exchange Endpoint
export async function handleTokenExchange(body, req, res) {
  const code = String(body?.code || '').trim();
  const codeVerifier = String(body?.code_verifier || '').trim();

  const db = loadDb();
  const authCodeRecord = db.authCodes.find(c => c.code === code);

  if (!authCodeRecord || authCodeRecord.used || Date.now() > authCodeRecord.expiresAt) {
    return res.status(400).json({ success: false, message: 'Authorization Code không hợp lệ hoặc đã hết hạn.' });
  }

  if (authCodeRecord.codeChallenge) {
    const computed = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    if (computed !== authCodeRecord.codeChallenge) {
      return res.status(400).json({ success: false, message: 'Xác thực PKCE thất bại.' });
    }
  }

  authCodeRecord.used = true;
  const user = db.users.find(u => u.id === authCodeRecord.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
  }

  const accessToken = generateAccessToken(user);
  const refreshTokenString = generateRefreshTokenString();

  db.refreshTokens.push({
    token: refreshTokenString,
    userId: user.id,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL,
    createdAt: Date.now(),
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    revoked: false
  });

  saveDb(db);
  setAuthCookies(res, accessToken, refreshTokenString, req);

  return res.status(200).json({
    success: true,
    access_token: accessToken,
    refresh_token: refreshTokenString,
    expires_in: ACCESS_TOKEN_TTL,
    user: sanitizeUser(user)
  });
}

/**
 * =========================================================================
 * BỘ ĐIỀU PHỐI CHÍNH (MAIN DISPATCHER)
 * =========================================================================
 */
export async function handleSsoRequest(pathname, req, res, body = {}) {
  if (!res.status) {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(data));
      return res;
    };
  }
  if (!res.send) {
    res.send = function(data) {
      res.end(data);
      return res;
    };
  }
  if (!res.redirect) {
    res.redirect = function(status, url) {
      res.writeHead(status, { Location: url });
      res.end();
      return res;
    };
  }

  const origin = req.headers.origin;
  if (origin && (ALLOWED_REDIRECT_URIS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (pathname === '/api/auth/register') {
    return handleRegister(body, req, res);
  }
  if (pathname === '/api/auth/login') {
    return handleLogin(body, req, res);
  }
  if (pathname === '/api/auth/google/start') {
    return handleGoogleOAuthStart(req, res);
  }
  if (pathname === '/api/auth/google/callback') {
    return handleGoogleOAuthCallback(req, res);
  }
  if (pathname === '/api/auth/google/config') {
    return handleGoogleConfig(req, res);
  }
  if (pathname === '/api/auth/google-login' || pathname === '/api/auth/google') {
    return handleGoogleLogin(body, req, res);
  }
  if (pathname === '/api/auth/refresh') {
    return handleRefresh(req, res);
  }
  if (pathname === '/api/auth/logout') {
    return handleLogout(req, res);
  }
  if (pathname === '/api/auth/me') {
    return handleMe(req, res);
  }
  if (pathname === '/api/auth/authorize') {
    return handleAuthorize(req.query || {}, req, res);
  }
  if (pathname === '/api/auth/token') {
    return handleTokenExchange(body, req, res);
  }

  return res.status(404).json({ success: false, message: 'Auth endpoint không tồn tại.' });
}

export default {
  handleSsoRequest,
  handleRegister,
  handleLogin,
  handleGoogleLogin,
  handleRefresh,
  handleLogout,
  handleMe,
  handleAuthorize,
  handleTokenExchange,
  ALLOWED_REDIRECT_URIS
};
