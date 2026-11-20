/* =====================================================================
   SmartEdu — Firebase Roster Addon (file dùng chung cho các game)
   ---------------------------------------------------------------------
   Chức năng:
   - Giáo viên LƯU danh sách học sinh lên Firebase theo từng lớp, dùng
     lâu dài (nhiều máy, nhiều năm) — lưu bằng: SĐT + MẬT KHẨU + Excel.
   - Trước khi quay: chỉ cần nhập SĐT (KHÔNG cần mật khẩu) → hiện tất
     cả các lớp → tích chọn 1 hoặc NHIỀU lớp → nạp vào game.
   - ĐỒNG BỘ danh sách giữa các game qua "kho dùng chung" (cần mật khẩu).
   - XOÁ học sinh / xoá cả lớp — trong 1 game hoặc mọi game (cần mật khẩu).
   - Chưa nhập gì: game tự dùng danh sách mẫu 10 nhân vật Tam Quốc.

   CÁCH DÙNG:
   1) Up file này cùng thư mục với file game khi deploy Firebase.
   2) Trong file HTML của game, dán 1 dòng ngay TRƯỚC </body>:
      <script src="smartedu-firebase-roster.js"></script>
      (file này tự nạp Firebase SDK từ CDN, không cần thêm gì khác)
   3) Mỗi game dùng 1 NHÃN riêng để không xung đột dữ liệu:
      mở file này, sửa GAME_ID ở dưới: 'vongquay' | 'trieuphu' | ...

   Dữ liệu trên Firestore (project gamesmartedu):
      teachers/{sđt}                    → { passHash, createdAt, updatedAt }
      teachers/{sđt}/rosters/{gameId}   → { classes: { "10A1": {students, updatedAt} } }
      teachers/{sđt}/rosters/_shared   → kho dùng chung giữa các game
   Mật khẩu KHÔNG lưu dạng thô — chỉ lưu mã băm SHA-256.
   ===================================================================== */
(function () {
'use strict';

/* ================= CẤU HÌNH — SỬA Ở ĐÂY ================= */
var GAME_ID = 'vongquay';                       // << nhãn của game này
var GAME_LABEL = 'Vòng Quay Gọi Tên';           // tên hiển thị
var KNOWN_GAMES = [                             // các game dùng chung hệ thống
  { id: 'vongquay', label: 'Vòng Quay Gọi Tên' },
  { id: 'trieuphu', label: 'Ai Là Triệu Phú' }
];
var SHARED_ID = '_shared';
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDxC9n_v9IqBHnSqq1pMrCuvhAzxxXcU7M",
  authDomain: "gamesmartedu.firebaseapp.com",
  projectId: "gamesmartedu",
  storageBucket: "gamesmartedu.firebasestorage.app",
  messagingSenderId: "215804695407",
  appId: "1:215804695407:web:b7fe5df298186e506f8e9a",
  measurementId: "G-M41ED3PR81"
};
var SDK_VER = '10.12.5';
/* ========================================================= */

var TAM_QUOC = ['Lưu Bị', 'Quan Vũ', 'Trương Phi', 'Gia Cát Lượng', 'Triệu Vân',
                'Tào Tháo', 'Tôn Quyền', 'Chu Du', 'Mã Siêu', 'Hoàng Trung'];

var db = null, fbReady = false, fbError = '';
var sessionPhone = '';        // sđt đã xác thực mật khẩu trong phiên mở panel này
var lastLoadData = null;      // { classesGame:{}, classesShared:{} } sau khi "Tìm lớp"

function $(s, r) { return (r || document).querySelector(s); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function escT(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function say(msg, icon) {
  if (typeof window.toast === 'function') { try { window.toast(msg, icon || 'i-check'); return; } catch (e) {} }
  if (typeof toast === 'function') { try { toast(msg, icon || 'i-check'); return; } catch (e) {} }
  var box = $('#sefbToasts');
  if (!box) { box = el('div'); box.id = 'sefbToasts'; document.body.appendChild(box); }
  var t = el('div', 'sefb-toast', escT(msg)); box.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, 2800);
}
function normPhone(p) { return String(p || '').replace(/[\s.\-()]/g, ''); }
function validPhone(p) { return /^0\d{9}$/.test(p); }

/* ---------- Băm mật khẩu (SHA-256; không lưu mật khẩu thô) ---------- */
function hashPass(phone, pass) {
  var raw = 'smartedu::' + phone + '::' + String(pass || '');
  if (window.crypto && crypto.subtle && crypto.subtle.digest) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)).then(function (buf) {
      return [...new Uint8Array(buf)].map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }).catch(function () { return Promise.resolve(fallbackHash(raw)); });
  }
  return Promise.resolve(fallbackHash(raw));
}
function fallbackHash(s) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (var i = 0; i < s.length; i++) { var ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'fh' + (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

/* ---------- Nạp Firebase SDK (compat) khi cần ---------- */
function loadScript(src) {
  return new Promise(function (res, rej) {
    var s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = res; s.onerror = function () { rej(new Error('Không tải được ' + src)); };
    document.head.appendChild(s);
  });
}
function initFirebase() {
  if (fbReady) return Promise.resolve(db);
  if (window.firebase && firebase.initializeApp) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(); fbReady = true; return Promise.resolve(db);
    } catch (e) { fbError = e.message; return Promise.reject(e); }
  }
  var base = 'https://www.gstatic.com/firebasejs/' + SDK_VER + '/';
  return loadScript(base + 'firebase-app-compat.js')
    .then(function () { return loadScript(base + 'firebase-firestore-compat.js'); })
    .then(function () {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(); fbReady = true; return db;
    })
    .catch(function (e) { fbError = e.message; throw e; });
}

/* ---------- Firestore helpers ---------- */
function teacherRef(phone) { return db.collection('teachers').doc(phone); }
function rosterRef(phone, gameId) { return teacherRef(phone).collection('rosters').doc(gameId); }

function getTeacher(phone) {
  return teacherRef(phone).get().then(function (snap) { return snap.exists ? snap.data() : null; });
}
/* Xác thực mật khẩu. Nếu giáo viên chưa có tài khoản và allowCreate=true → tạo mới. */
function verifyPass(phone, pass, allowCreate) {
  return hashPass(phone, pass).then(function (h) {
    return getTeacher(phone).then(function (t) {
      if (!t) {
        if (!allowCreate) throw new Error('Số điện thoại này chưa được đăng ký trên hệ thống. Hãy lưu danh sách lần đầu (tab "Lưu học sinh") để tạo tài khoản.');
        var now = Date.now();
        return teacherRef(phone).set({ passHash: h, createdAt: now, updatedAt: now })
          .then(function () { sessionPhone = phone; return true; });
      }
      if (t.passHash !== h) throw new Error('Mật khẩu không đúng. Vui lòng thử lại.');
      sessionPhone = phone;
      return true;
    });
  });
}
function requireVerified(phone, pass) {
  if (sessionPhone === phone && validPhone(phone)) return Promise.resolve(true);
  if (!pass) return Promise.reject(new Error('Việc này cần mật khẩu. Hãy nhập mật khẩu của bạn.'));
  return verifyPass(phone, pass, false);
}
function getRoster(phone, gameId) {
  return rosterRef(phone, gameId).get().then(function (snap) {
    var d = snap.exists ? snap.data() : null;
    return (d && d.classes) ? d.classes : {};
  });
}
function saveRosterClasses(phone, gameId, classesObj) {
  return getRoster(phone, gameId).then(function (cur) {
    var now = Date.now();
    Object.keys(classesObj).forEach(function (k) { cur[k] = { students: classesObj[k], updatedAt: now }; });
    return rosterRef(phone, gameId).set({ classes: cur, updatedAt: now }, { merge: false })
      .then(function () { return cur; });
  });
}
function writeRoster(phone, gameId, classes) {
  return rosterRef(phone, gameId).set({ classes: classes, updatedAt: Date.now() }, { merge: false });
}

/* =====================================================================
   TÍCH HỢP VÀO GAME
   - Vòng quay v2: dùng state S + save/renderStudents/renderStats/buildBalls.
   - Game khác: bổ sung adapter ở applyToGame() khi cần.
   ===================================================================== */
function gameHasWheelAPI() {
  return typeof S !== 'undefined' && S && Array.isArray(S.students)
    && typeof save === 'function' && typeof renderStudents === 'function';
}
function applyToGame(students, classLabel) {
  if (!gameHasWheelAPI()) { say('Không tìm thấy dữ liệu game để nạp danh sách.', 'i-x'); return false; }
  S.students = students.map(function (s, i) {
    return { id: 'fb_' + Date.now().toString(36) + '_' + i, name: s.name, className: s.className || '', avatar: s.avatar || '' };
  });
  S.calledIds = [];
  if (classLabel) {
    S.settings.className = classLabel;
    var inp = document.querySelector('#setClass'); if (inp) inp.value = classLabel;
  }
  save(); renderStudents(); renderStats();
  if (typeof buildBalls === 'function') buildBalls();
  return true;
}
function tamQuocStudents() {
  return TAM_QUOC.map(function (n) { return { name: n, className: 'Tam Quốc', avatar: '' }; });
}
function maybeApplyDefaults() {
  // Chưa có học sinh nào (chưa nhập gì) -> dùng danh sách mẫu Tam Quốc
  try {
    if (gameHasWheelAPI() && S.students.length === 0) {
      applyToGame(tamQuocStudents(), 'Tam Quốc');
    }
  } catch (e) {}
}

/* =====================================================================
   ĐỌC EXCEL (Họ tên | Lớp | Link ảnh)
   Ưu tiên dùng parseExcel() có sẵn của game; không có thì dùng bản gọn.
   ===================================================================== */
function normKey2(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
}
function parseExcelFallback(buf) {
  if (typeof XLSX === 'undefined') throw new Error('Thiếu thư viện đọc Excel (XLSX).');
  var wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
  var ws = wb.Sheets[wb.SheetNames[0]];
  var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!rows.length) throw new Error('File Excel trống.');
  var hi = rows.findIndex(function (r) { return r.some(function (c) { return normKey2(c).includes('hoten'); }); });
  if (hi < 0) hi = 0;
  var head = rows[hi].map(normKey2);
  var ciName = head.findIndex(function (h) { return h.includes('hoten') || h === 'ten' || h.includes('name'); });
  var ciCls = head.findIndex(function (h) { return h.includes('lop') || h.includes('class'); });
  var ciImg = head.findIndex(function (h) { return h.includes('linkanh') || h.includes('anh') || h.includes('avatar') || h.includes('image'); });
  if (ciName < 0) throw new Error('Không tìm thấy cột "Họ tên". Hãy dùng file mẫu.');
  var norm = (typeof normalizeImageUrl === 'function') ? normalizeImageUrl : function (u) { return String(u || '').trim(); };
  var out = [];
  for (var i = hi + 1; i < rows.length; i++) {
    var name = String(rows[i][ciName] || '').trim();
    if (!name) continue;
    out.push({ name: name, className: ciCls >= 0 ? String(rows[i][ciCls] || '').trim() : '', avatar: norm(ciImg >= 0 ? rows[i][ciImg] : '') });
  }
  if (!out.length) throw new Error('Không đọc được học sinh nào. Kiểm tra lại file.');
  return out;
}
function parseStudentsExcel(buf) {
  var list = (typeof parseExcel === 'function') ? parseExcel(buf) : parseExcelFallback(buf);
  return list.map(function (s) { return { name: s.name, className: s.className || '', avatar: s.avatar || '' }; });
}
/* Gom theo lớp + chống trùng tên trong cùng lớp (ý tưởng bổ sung) */
function groupByClass(list) {
  var out = {};
  list.forEach(function (s) {
    var cls = (s.className || '').trim() || 'Chưa xếp lớp';
    if (!out[cls]) out[cls] = [];
    var key = s.name.trim().toLowerCase();
    var dup = out[cls].some(function (x) { return x.name.trim().toLowerCase() === key; });
    if (!dup) out[cls].push({ name: s.name, avatar: s.avatar || '' });
  });
  return out;
}
function studentsOf(classesObj, classNames) {
  var out = [];
  classNames.forEach(function (cn) {
    var c = classesObj[cn]; if (!c) return;
    (c.students || []).forEach(function (s) { out.push({ name: s.name, className: cn, avatar: s.avatar || '' }); });
  });
  return out;
}

/* =====================================================================
   ĐỒNG BỘ 2 CHIỀU: game này <-> kho dùng chung (theo lớp, bản mới hơn thắng)
   ===================================================================== */
function mergeClasses(a, b) {
  var out = {};
  Object.keys(a || {}).forEach(function (k) { out[k] = a[k]; });
  Object.keys(b || {}).forEach(function (k) {
    if (!out[k] || (b[k].updatedAt || 0) > (out[k].updatedAt || 0)) out[k] = b[k];
  });
  return out;
}
function syncGameWithShared(phone) {
  return Promise.all([getRoster(phone, GAME_ID), getRoster(phone, SHARED_ID)]).then(function (rs) {
    var merged = mergeClasses(rs[0], rs[1]);
    return Promise.all([writeRoster(phone, GAME_ID, merged), writeRoster(phone, SHARED_ID, merged)])
      .then(function () { return merged; });
  });
}

/* =====================================================================
   GIAO DIỆN PANEL
   ===================================================================== */
var CSS = '\
#sefbToasts{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;align-items:center}\
.sefb-toast{background:#1d1a3d;color:#fff;border:1px solid #4a4580;border-radius:12px;padding:10px 18px;font:500 14px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.45);transition:.4s}\
.sefb-overlay{position:fixed;inset:0;background:rgba(8,6,24,.72);display:none;z-index:99990;align-items:flex-start;justify-content:center;overflow:auto;padding:26px 12px}\
.sefb-overlay.open{display:flex}\
.sefb-modal{background:#171430;color:#eceaf8;border:1px solid #37336b;border-radius:18px;max-width:640px;width:100%;padding:22px 22px 18px;position:relative;font-family:system-ui}\
.sefb-modal h2{margin:0 34px 4px 0;font-size:20px}\
.sefb-sub{color:#a5a1c8;font-size:13px;margin-bottom:14px}\
.sefb-close{position:absolute;top:12px;right:12px;background:#262154;color:#fff;border:1px solid #37336b;border-radius:10px;width:34px;height:34px;cursor:pointer;font-size:15px}\
.sefb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}\
.sefb-tab{background:#221e4d;color:#cfccf0;border:1px solid #37336b;border-radius:999px;padding:8px 14px;cursor:pointer;font-size:13.5px;font-weight:600}\
.sefb-tab.active{background:#6d5cff;color:#fff;border-color:#6d5cff}\
.sefb-field{margin-bottom:12px}\
.sefb-field label{display:block;font-size:13px;color:#a5a1c8;margin-bottom:5px;font-weight:600}\
.sefb-field input[type=text],.sefb-field input[type=password],.sefb-field input[type=tel],.sefb-field select{width:100%;box-sizing:border-box;background:#100e28;border:1px solid #37336b;border-radius:10px;color:#fff;padding:10px 12px;font-size:15px}\
.sefb-btn{display:inline-flex;align-items:center;gap:7px;background:#6d5cff;color:#fff;border:0;border-radius:11px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer}\
.sefb-btn.gold{background:linear-gradient(180deg,#ffd34d,#f5a623);color:#3a2703}\
.sefb-btn.ghost{background:#262154;border:1px solid #37336b;color:#eceaf8}\
.sefb-btn.bad{background:#3d1430;border:1px solid #7a2149;color:#ff9dbd}\
.sefb-btn:disabled{opacity:.55;cursor:wait}\
.sefb-row{display:flex;gap:9px;flex-wrap:wrap;align-items:center}\
.sefb-hint{font-size:12.5px;color:#a5a1c8;line-height:1.5;margin-top:10px}\
.sefb-status{font-size:13.5px;margin-top:10px;min-height:18px}\
.sefb-status.err{color:#ff9dbd}.sefb-status.ok{color:#7be3a8}\
.sefb-cls{display:flex;align-items:center;gap:10px;background:#100e28;border:1px solid #37336b;border-radius:11px;padding:9px 12px;margin-bottom:8px}\
.sefb-cls input{width:17px;height:17px;accent-color:#6d5cff}\
.sefb-cls b{font-size:14.5px}.sefb-cls span{color:#a5a1c8;font-size:12.5px}\
.sefb-cls .sp{flex:1}\
.sefb-stu{display:flex;align-items:center;gap:8px;padding:5px 10px 5px 34px;font-size:14px}\
.sefb-x{background:#3d1430;color:#ff9dbd;border:1px solid #7a2149;border-radius:8px;width:24px;height:24px;cursor:pointer;line-height:1}\
.sefb-open-btn{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;background:linear-gradient(135deg,#2a2560,#1a1745);border:1px dashed #6d5cff;color:#fff;border-radius:12px;padding:13px 15px;cursor:pointer;font-size:14.5px;font-weight:700;margin-top:14px;text-align:left}\
.sefb-open-btn small{display:block;font-weight:400;color:#a5a1c8;font-size:12.5px;margin-top:2px}\
';

function injectUI() {
  if ($('#sefbOverlay')) return;
  var st = el('style'); st.textContent = CSS; document.head.appendChild(st);

  // Nút mở panel: gắn vào tab Học sinh của game; không thấy thì dùng nút nổi
  var openBtn = el('button', 'sefb-open-btn',
    '<span style="font-size:20px">☁️</span><span>Chọn danh sách đã lưu trên hệ thống' +
    '<small>Nhập SĐT để tải lớp về quay · Lưu lớp mới bằng SĐT + mật khẩu + file Excel</small></span>');
  openBtn.type = 'button';
  openBtn.onclick = function () { openPanel(); };
  var anchor = $('#t-students');
  if (anchor) anchor.appendChild(openBtn);
  else {
    openBtn.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99980;width:auto;max-width:300px';
    document.body.appendChild(openBtn);
  }

  var ov = el('div', 'sefb-overlay'); ov.id = 'sefbOverlay';
  ov.innerHTML =
    '<div class="sefb-modal">' +
      '<button class="sefb-close" id="sefbClose">✕</button>' +
      '<h2>☁️ Lớp học Firebase</h2>' +
      '<div class="sefb-sub">Game: <b>' + escT(GAME_LABEL) + '</b> · Danh sách lưu trên Firebase theo số điện thoại giáo viên, dùng lâu dài và đồng bộ được giữa các game.</div>' +
      '<div class="sefb-field"><label>Số điện thoại giáo viên</label>' +
      '<input type="tel" id="sefbPhone" placeholder="VD: 0912345678" autocomplete="tel"></div>' +
      '<div class="sefb-tabs">' +
        '<button class="sefb-tab active" data-sefb-tab="tai">🎡 Tải lớp để quay</button>' +
        '<button class="sefb-tab" data-sefb-tab="luu">⬆️ Lưu học sinh</button>' +
        '<button class="sefb-tab" data-sefb-tab="quanly">🗑️ Quản lý & xoá</button>' +
        '<button class="sefb-tab" data-sefb-tab="dongbo">🔄 Đồng bộ</button>' +
      '</div>' +
      '<div id="sefbTab-tai">' +
        '<div class="sefb-hint" style="margin:0 0 12px">Chỉ cần SĐT, <b>không cần mật khẩu</b>. Tích chọn 1 hoặc nhiều lớp rồi nạp vào vòng quay.</div>' +
        '<div class="sefb-row"><button class="sefb-btn" id="sefbFind">🔍 Tìm các lớp của tôi</button>' +
        '<button class="sefb-btn ghost" id="sefbSample">🎭 Danh sách mẫu Tam Quốc</button></div>' +
        '<div class="sefb-status" id="sefbLoadStatus"></div>' +
        '<div id="sefbClassList" style="margin-top:8px"></div>' +
        '<div class="sefb-row" style="margin-top:6px"><button class="sefb-btn gold" id="sefbApply" style="display:none">✅ Nạp các lớp đã chọn vào vòng quay</button></div>' +
      '</div>' +
      '<div id="sefbTab-luu" style="display:none">' +
        '<div class="sefb-field"><label>Mật khẩu (lần đầu lưu = tạo tài khoản với mật khẩu này)</label>' +
        '<input type="password" id="sefbPassSave" placeholder="Nhập mật khẩu" autocomplete="current-password"></div>' +
        '<div class="sefb-field"><label>File Excel danh sách học sinh (cột: Họ tên | Lớp | Link ảnh — đúng mẫu cũ)</label>' +
        '<input type="file" id="sefbFile" accept=".xlsx,.xls"></div>' +
        '<div class="sefb-status" id="sefbSavePreview"></div>' +
        '<div class="sefb-row"><button class="sefb-btn gold" id="sefbSave">⬆️ Lưu danh sách</button></div>' +
        '<div class="sefb-status" id="sefbSaveStatus"></div>' +
        '<div class="sefb-hint">Học sinh được lưu theo đúng cột "Lớp" trong file. Tên trùng trong cùng một lớp sẽ tự bỏ qua. File có nhiều lớp thì lưu tất cả các lớp một lượt.</div>' +
      '</div>' +
      '<div id="sefbTab-quanly" style="display:none">' +
        '<div class="sefb-field"><label>Mật khẩu (bắt buộc khi xoá)</label>' +
        '<input type="password" id="sefbPassManage" placeholder="Nhập mật khẩu" autocomplete="current-password"></div>' +
        '<div class="sefb-row"><button class="sefb-btn" id="sefbManageOpen">🔓 Mở quản lý</button>' +
        '<select id="sefbScope" style="background:#100e28;border:1px solid #37336b;border-radius:10px;color:#fff;padding:9px">' +
          '<option value="game">Chỉ game này (' + escT(GAME_LABEL) + ')</option>' +
          '<option value="all">Tất cả các game + kho chung</option>' +
        '</select></div>' +
        '<div class="sefb-status" id="sefbManageStatus"></div>' +
        '<div id="sefbManageList" style="margin-top:8px"></div>' +
      '</div>' +
      '<div id="sefbTab-dongbo" style="display:none">' +
        '<div class="sefb-hint" style="margin:0 0 12px">Đồng bộ 2 chiều giữa <b>' + escT(GAME_LABEL) + '</b> và <b>kho dùng chung</b>: lớp nào mới hơn sẽ thắng. Sau khi đồng bộ, mở game khác và bấm đồng bộ ở đó là các game dùng chung một danh sách.</div>' +
        '<div class="sefb-field"><label>Mật khẩu</label>' +
        '<input type="password" id="sefbPassSync" placeholder="Nhập mật khẩu" autocomplete="current-password"></div>' +
        '<div class="sefb-row"><button class="sefb-btn gold" id="sefbSync">🔄 Đồng bộ ngay</button></div>' +
        '<div class="sefb-status" id="sefbSyncStatus"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('pointerdown', function (e) { if (e.target === ov) ov.classList.remove('open'); });
  $('#sefbClose').onclick = function () { ov.classList.remove('open'); };

  // chuyển tab
  ov.querySelectorAll('.sefb-tab').forEach(function (t) {
    t.onclick = function () {
      ov.querySelectorAll('.sefb-tab').forEach(function (x) { x.classList.toggle('active', x === t); });
      ['tai', 'luu', 'quanly', 'dongbo'].forEach(function (k) {
        $('#sefbTab-' + k).style.display = (k === t.dataset.sefbTab) ? '' : 'none';
      });
    };
  });

  // nhớ SĐT cho lần sau (ý tưởng bổ sung: khỏi gõ lại)
  var phoneInp = $('#sefbPhone');
  try { phoneInp.value = localStorage.getItem('sefb_phone_v1') || ''; } catch (e) {}
  phoneInp.addEventListener('change', function () {
    try { localStorage.setItem('sefb_phone_v1', normPhone(phoneInp.value)); } catch (e) {}
    sessionPhone = ''; lastLoadData = null;
  });

  bindLoadTab(); bindSaveTab(); bindManageTab(); bindSyncTab();
}
function openPanel() {
  $('#sefbOverlay').classList.add('open');
  initFirebase().catch(function () {
    setStatus('#sefbLoadStatus', 'Chưa kết nối được Firebase (' + escT(fbError || 'lỗi mạng') + '). Kiểm tra mạng rồi thử lại.', 'err');
  });
}
function setStatus(sel, msg, cls) { var n = $(sel); if (n) { n.innerHTML = msg; n.className = 'sefb-status ' + (cls || ''); } }
function phoneVal() { return normPhone($('#sefbPhone').value); }
function busy(btn, on) { if (btn) btn.disabled = !!on; }

/* ---------- TAB: TẢI LỚP ---------- */
function renderClassChoices(groups) {
  var box = $('#sefbClassList'); box.innerHTML = '';
  var any = false;
  groups.forEach(function (g) {
    var names = Object.keys(g.classes || {});
    if (!names.length) return;
    any = true;
    box.appendChild(el('div', 'sefb-hint', '<b style="color:#fff">' + escT(g.title) + '</b>'));
    names.sort().forEach(function (cn) {
      var row = el('label', 'sefb-cls');
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = true;
      cb.dataset.src = g.src; cb.dataset.cls = cn; cb.className = 'sefb-cls-cb';
      row.appendChild(cb);
      row.appendChild(el('b', null, escT(cn)));
      row.appendChild(el('span', null, (g.classes[cn].students || []).length + ' học sinh'));
      box.appendChild(row);
    });
  });
  $('#sefbApply').style.display = any ? '' : 'none';
  return any;
}
function bindLoadTab() {
  $('#sefbFind').onclick = function () {
    var phone = phoneVal(), btn = this;
    if (!validPhone(phone)) { setStatus('#sefbLoadStatus', 'Số điện thoại chưa đúng định dạng (10 số, bắt đầu bằng 0).', 'err'); return; }
    busy(btn, true); setStatus('#sefbLoadStatus', 'Đang tìm lớp trên Firebase...');
    initFirebase()
      .then(function () { return Promise.all([getRoster(phone, GAME_ID), getRoster(phone, SHARED_ID)]); })
      .then(function (rs) {
        lastLoadData = { game: rs[0], shared: rs[1] };
        var any = renderClassChoices([
          { src: 'game', title: 'Lớp trong game ' + GAME_LABEL, classes: rs[0] },
          { src: 'shared', title: 'Lớp dùng chung (đồng bộ từ game khác)', classes: rs[1] }
        ]);
        setStatus('#sefbLoadStatus', any ? 'Chọn lớp rồi bấm "Nạp" ở dưới.' :
          'Chưa có lớp nào được lưu cho số này. Hãy lưu ở tab "Lưu học sinh" trước, hoặc dùng danh sách mẫu Tam Quốc.', any ? 'ok' : 'err');
      })
      .catch(function (e) { setStatus('#sefbLoadStatus', 'Lỗi: ' + escT(e.message), 'err'); })
      .finally(function () { busy(btn, false); });
  };
  $('#sefbApply').onclick = function () {
    if (!lastLoadData) return;
    var students = [], picked = [];
    document.querySelectorAll('.sefb-cls-cb:checked').forEach(function (cb) {
      var src = cb.dataset.src === 'shared' ? lastLoadData.shared : lastLoadData.game;
      students = students.concat(studentsOf(src, [cb.dataset.cls]));
      picked.push(cb.dataset.cls);
    });
    if (!picked.length) { setStatus('#sefbLoadStatus', 'Hãy tích chọn ít nhất 1 lớp.', 'err'); return; }
    var label = picked.join(' + '); if (label.length > 44) label = picked.length + ' lớp';
    if (applyToGame(students, label)) {
      $('#sefbOverlay').classList.remove('open');
      say('Đã nạp ' + students.length + ' học sinh (' + picked.join(', ') + ') vào vòng quay', 'i-check');
    }
  };
  $('#sefbSample').onclick = function () {
    if (applyToGame(tamQuocStudents(), 'Tam Quốc')) {
      $('#sefbOverlay').classList.remove('open');
      say('Đã dùng danh sách mẫu 10 nhân vật Tam Quốc', 'i-check');
    }
  };
}

/* ---------- TAB: LƯU HỌC SINH ---------- */
var pendingSaveClasses = null;
function readFileBuf(file) {
  return new Promise(function (res, rej) {
    var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}
function bindSaveTab() {
  $('#sefbFile').addEventListener('change', function () {
    var f = this.files && this.files[0]; pendingSaveClasses = null;
    if (!f) { setStatus('#sefbSavePreview', ''); return; }
    setStatus('#sefbSavePreview', 'Đang đọc file...');
    readFileBuf(f).then(function (buf) {
      var list = parseStudentsExcel(buf);
      pendingSaveClasses = groupByClass(list);
      var names = Object.keys(pendingSaveClasses);
      var total = names.reduce(function (a, k) { return a + pendingSaveClasses[k].length; }, 0);
      setStatus('#sefbSavePreview', 'Đọc được <b>' + total + ' học sinh</b> thuộc ' + names.length + ' lớp: ' +
        names.map(function (k) { return escT(k) + ' (' + pendingSaveClasses[k].length + ')'; }).join(' · '), 'ok');
    }).catch(function (e) { setStatus('#sefbSavePreview', 'Lỗi đọc file: ' + escT(e.message), 'err'); });
  });
  $('#sefbSave').onclick = function () {
    var phone = phoneVal(), pass = $('#sefbPassSave').value, btn = this;
    if (!validPhone(phone)) { setStatus('#sefbSaveStatus', 'Số điện thoại chưa đúng định dạng (10 số, bắt đầu bằng 0).', 'err'); return; }
    if (!pass) { setStatus('#sefbSaveStatus', 'Hãy nhập mật khẩu.', 'err'); return; }
    if (!pendingSaveClasses) { setStatus('#sefbSaveStatus', 'Hãy chọn file Excel trước.', 'err'); return; }
    busy(btn, true); setStatus('#sefbSaveStatus', 'Đang kiểm tra tài khoản và lưu...');
    initFirebase()
      .then(function () { return verifyPass(phone, pass, true); })
      .then(function () { return saveRosterClasses(phone, GAME_ID, pendingSaveClasses); })
      .then(function (cur) {
        setStatus('#sefbSaveStatus', '✅ Đã lưu lên hệ thống (game ' + escT(GAME_LABEL) + '). Tổng số lớp hiện có: ' + Object.keys(cur).length + '.', 'ok');
        say('Đã lưu danh sách học sinh lên Firebase', 'i-check');
      })
      .catch(function (e) { setStatus('#sefbSaveStatus', 'Lỗi: ' + escT(e.message), 'err'); })
      .finally(function () { busy(btn, false); });
  };
}

/* ---------- TAB: QUẢN LÝ & XOÁ ---------- */
var manageSources = []; // [{gameId, label, classes}]
function loadManageData(phone) {
  var scope = $('#sefbScope').value;
  var jobs = [];
  if (scope === 'all') {
    KNOWN_GAMES.forEach(function (g) { jobs.push({ gameId: g.id, label: g.label }); });
    jobs.push({ gameId: SHARED_ID, label: 'Kho dùng chung' });
  } else {
    jobs.push({ gameId: GAME_ID, label: GAME_LABEL });
  }
  return Promise.all(jobs.map(function (j) {
    return getRoster(phone, j.gameId).then(function (classes) { return { gameId: j.gameId, label: j.label, classes: classes }; });
  })).then(function (rs) { manageSources = rs; renderManage(); });
}
function renderManage() {
  var box = $('#sefbManageList'); box.innerHTML = '';
  var any = false;
  manageSources.forEach(function (src) {
    var names = Object.keys(src.classes || {});
    if (!names.length) return;
    any = true;
    box.appendChild(el('div', 'sefb-hint', '<b style="color:#fff">' + escT(src.label) + '</b>'));
    names.sort().forEach(function (cn) {
      var head = el('div', 'sefb-cls');
      head.appendChild(el('b', null, escT(cn)));
      head.appendChild(el('span', null, (src.classes[cn].students || []).length + ' học sinh'));
      head.appendChild(el('span', 'sp'));
      var delCls = el('button', 'sefb-btn bad', 'Xoá lớp');
      delCls.style.padding = '6px 12px'; delCls.style.fontSize = '12.5px';
      delCls.dataset.act = 'del-class'; delCls.dataset.game = src.gameId; delCls.dataset.cls = cn;
      head.appendChild(delCls); box.appendChild(head);
      (src.classes[cn].students || []).forEach(function (s, idx) {
        var row = el('div', 'sefb-stu');
        row.appendChild(el('span', null, escT(s.name)));
        row.appendChild(el('span', 'sp'));
        var x = el('button', 'sefb-x', '×');
        x.dataset.act = 'del-stu'; x.dataset.game = src.gameId; x.dataset.cls = cn; x.dataset.idx = idx;
        x.title = 'Xoá học sinh này';
        row.appendChild(x); box.appendChild(row);
      });
    });
  });
  if (!any) box.appendChild(el('div', 'sefb-hint', 'Chưa có dữ liệu nào trong phạm vi này.'));
}
function bindManageTab() {
  $('#sefbManageOpen').onclick = function () {
    var phone = phoneVal(), pass = $('#sefbPassManage').value, btn = this;
    if (!validPhone(phone)) { setStatus('#sefbManageStatus', 'Số điện thoại chưa đúng định dạng.', 'err'); return; }
    busy(btn, true); setStatus('#sefbManageStatus', 'Đang xác thực...');
    initFirebase()
      .then(function () { return requireVerified(phone, pass); })
      .then(function () { return loadManageData(phone); })
      .then(function () { setStatus('#sefbManageStatus', 'Đã mở quản lý. Bấm × để xoá học sinh, "Xoá lớp" để xoá cả lớp.', 'ok'); })
      .catch(function (e) { setStatus('#sefbManageStatus', 'Lỗi: ' + escT(e.message), 'err'); })
      .finally(function () { busy(btn, false); });
  };
  $('#sefbScope').addEventListener('change', function () {
    var phone = phoneVal();
    if (sessionPhone === phone) { loadManageData(phone).catch(function () {}); }
  });
  $('#sefbManageList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var phone = phoneVal(), gid = b.dataset.game, cn = b.dataset.cls;
    var srcLabel = (manageSources.find(function (x) { return x.gameId === gid; }) || {}).label || gid;
    if (b.dataset.act === 'del-class') {
      if (!confirm('Xoá cả lớp "' + cn + '" khỏi ' + srcLabel + '? Hành động này không hoàn tác được.')) return;
      getRoster(phone, gid).then(function (classes) {
        delete classes[cn];
        return writeRoster(phone, gid, classes);
      }).then(function () { say('Đã xoá lớp ' + cn, 'i-check'); return loadManageData(phone); })
        .catch(function (err) { setStatus('#sefbManageStatus', 'Lỗi: ' + escT(err.message), 'err'); });
    } else if (b.dataset.act === 'del-stu') {
      var idx = +b.dataset.idx;
      var stu = ((manageSources.find(function (x) { return x.gameId === gid; }) || {}).classes || {})[cn];
      var nm = stu && stu.students[idx] ? stu.students[idx].name : '';
      if (!confirm('Xoá học sinh "' + nm + '" khỏi lớp ' + cn + ' (' + srcLabel + ')?')) return;
      getRoster(phone, gid).then(function (classes) {
        if (classes[cn]) {
          classes[cn].students.splice(idx, 1);
          classes[cn].updatedAt = Date.now();
          if (!classes[cn].students.length) delete classes[cn];
        }
        return writeRoster(phone, gid, classes);
      }).then(function () { say('Đã xoá ' + nm, 'i-check'); return loadManageData(phone); })
        .catch(function (err) { setStatus('#sefbManageStatus', 'Lỗi: ' + escT(err.message), 'err'); });
    }
  });
}

/* ---------- TAB: ĐỒNG BỘ ---------- */
function bindSyncTab() {
  $('#sefbSync').onclick = function () {
    var phone = phoneVal(), pass = $('#sefbPassSync').value, btn = this;
    if (!validPhone(phone)) { setStatus('#sefbSyncStatus', 'Số điện thoại chưa đúng định dạng.', 'err'); return; }
    busy(btn, true); setStatus('#sefbSyncStatus', 'Đang đồng bộ...');
    initFirebase()
      .then(function () { return requireVerified(phone, pass); })
      .then(function () { return syncGameWithShared(phone); })
      .then(function (merged) {
        setStatus('#sefbSyncStatus', '✅ Đã đồng bộ ' + Object.keys(merged).length + ' lớp giữa ' + escT(GAME_LABEL) + ' và kho dùng chung. Mở game khác, bấm Đồng bộ ở đó để nhận danh sách này.', 'ok');
        say('Đồng bộ hoàn tất', 'i-check');
      })
      .catch(function (e) { setStatus('#sefbSyncStatus', 'Lỗi: ' + escT(e.message), 'err'); })
      .finally(function () { busy(btn, false); });
  };
}

/* ---------- KHỞI ĐỘNG ---------- */
function boot() { injectUI(); maybeApplyDefaults(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
