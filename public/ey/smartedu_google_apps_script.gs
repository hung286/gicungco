/**
 * ==============================================================================
 * HỆ THỐNG ĐÁM MÂY GOOGLE SHEETS — SMARTEDU PLAY / MHEDU & QUẢN LÝ NỀN NẾP
 * Tác giả & Quản trị viên: Thầy Nguyễn Mạnh Hùng (nmh28691@gmail.com)
 * Trường THPT Số 1 Lê Hồng Phong
 * ==============================================================================
 * Tự động lưu trữ và tạo các trang tính (Sheets) trực quan:
 * 1. GiaoVien_ApiKey   : Danh sách Giáo viên & Gemini API Key đám mây theo Email
 * 2. DanhSachHocSinh   : Danh sách Lớp học & Học sinh (Mã ID + Mã PIN)
 * 3. BaiTap            : Danh sách Bài tập đã giao
 * 4. BaiLam            : Danh sách Bài làm & Điểm số của học sinh
 * 5. NongTrai_VuonHoa  : Tiến độ Trò chơi Nông Trại Vui Vẻ & Vườn Hoa Tri Thức
 * 6. HeThong_Data      : Cơ sở dữ liệu JSON toàn vẹn (tương thích 100% Web & Mobile)
 * ==============================================================================
 */

var SHEET_TEACHERS = 'GiaoVien_ApiKey';
var SHEET_STUDENTS = 'DanhSachHocSinh';
var SHEET_ASSIGNMENTS = 'BaiTap';
var SHEET_SUBMISSIONS = 'BaiLam';
var SHEET_FARM_GARDEN = 'NongTrai_VuonHoa';
var SHEET_RAW_DATA = 'HeThong_Data';

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rawData = loadRawData(ss) || { version: 3, updated_at: Date.now(), violations: [], smartedu_cloud_db: {} };
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: rawData,
      timestamp: Date.now()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Empty payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Lưu toàn bộ JSON vào HeThong_Data
    saveRawData(ss, JSON.stringify(payload));

    // Cập nhật các trang tính trực quan của SmartEdu Play nếu có smartedu_cloud_db
    if (payload.smartedu_cloud_db) {
      updateSmartEduSheets(ss, payload.smartedu_cloud_db);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      updated_at: Date.now()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) lock.releaseLock();
  }
}

function updateSmartEduSheets(ss, db) {
  var syncTime = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

  // 1. GiaoVien_ApiKey
  var sTeachers = getOrCreateSheet(ss, SHEET_TEACHERS);
  sTeachers.clear();
  sTeachers.appendRow(['STT', 'Email Giáo Viên', 'Họ Và Tên', 'Vai Trò', 'Trường Học', 'Gemini API Key (Cloud)', 'Cập Nhật']);
  var apiKeys = db.apiKeys || {};
  var teachers = db.teachers || [];
  teachers.forEach(function(t, i) {
    var em = String(t.email || '').toLowerCase();
    var kObj = apiKeys[em] || {};
    sTeachers.appendRow([
      i + 1,
      em,
      t.name || '',
      em === 'nmh28691@gmail.com' ? 'Admin Quản trị' : 'Giáo viên',
      t.school || 'THPT Số 1 Lê Hồng Phong',
      kObj.apiKeyPool || kObj.apiKey || t.apiKey || '',
      syncTime
    ]);
  });

  // 2. DanhSachHocSinh
  var sStudents = getOrCreateSheet(ss, SHEET_STUDENTS);
  sStudents.clear();
  sStudents.appendRow(['STT', 'Mã Học Sinh (ID)', 'Họ Và Tên', 'Mã PIN', 'Lớp Học', 'Mã Lớp', 'Giới Tính']);
  var stIdx = 1;
  (db.classes || []).forEach(function(cls) {
    (cls.students || []).forEach(function(st) {
      sStudents.appendRow([stIdx++, st.id || '', st.name || '', st.pin || '', cls.name || '', cls.code || '', st.gender === 'nu' ? 'Nữ' : 'Nam']);
    });
  });

  // 3. BaiTap
  var sAss = getOrCreateSheet(ss, SHEET_ASSIGNMENTS);
  sAss.clear();
  sAss.appendRow(['STT', 'Mã Bài Tập', 'Tên Bài Tập', 'Lớp', 'Số Câu Hỏi', 'Thưởng Xu', 'Hạn Nộp']);
  (db.assignments || []).forEach(function(a, i) {
    sAss.appendRow([i + 1, a.id || '', a.title || '', a.className || '', (a.questions || []).length, a.rewardCoins || 50, a.deadline || '']);
  });

  // 4. BaiLam
  var sSub = getOrCreateSheet(ss, SHEET_SUBMISSIONS);
  sSub.clear();
  sSub.appendRow(['STT', 'Mã Bài Làm', 'Mã HS', 'Họ Tên HS', 'Bài Tập', 'Điểm Số', 'Số Câu Đúng', 'Thời Gian Nộp']);
  (db.submissions || []).forEach(function(s, i) {
    sSub.appendRow([i + 1, s.id || '', s.studentId || '', s.studentName || '', s.assignmentTitle || '', s.score || 0, (s.correctCount || 0) + '/' + (s.totalCount || 0), s.submittedAt || '']);
  });

  // 5. NongTrai_VuonHoa
  var sFarm = getOrCreateSheet(ss, SHEET_FARM_GARDEN);
  sFarm.clear();
  sFarm.appendRow(['STT', 'Mã Học Sinh', 'Xu Nông Trại', 'Lúa', 'Số Gà', 'Táo', 'Giọt Nước Vườn Hoa', 'Hoa Đã Nở', 'Điểm Vườn Hoa', 'Chuỗi Ngày Học']);
  var farms = db.farms || {};
  var gardens = db.gardens || {};
  var allIds = Object.keys(farms);
  Object.keys(gardens).forEach(function(id) { if (allIds.indexOf(id) === -1) allIds.push(id); });
  allIds.forEach(function(id, i) {
    var f = farms[id] || {};
    var g = gardens[id] || {};
    sFarm.appendRow([i + 1, id, f.coins || 0, f.grain || 0, f.chickens || 0, f.apples || 0, g.water || 0, g.bloomedFlowers || 0, g.points || 0, f.streakDays || g.streakDays || 1]);
  });
}

function saveRawData(ss, jsonString) {
  var sheet = getOrCreateSheet(ss, SHEET_RAW_DATA);
  sheet.clear();
  var chunkSize = 45000;
  var rows = [];
  for (var i = 0; i < jsonString.length; i += chunkSize) {
    rows.push([jsonString.substring(i, i + chunkSize)]);
  }
  if (rows.length === 0) rows.push(['{}']);
  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

function loadRawData(ss) {
  var sheet = ss.getSheetByName(SHEET_RAW_DATA);
  if (!sheet || sheet.getLastRow() < 1) return null;
  var values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  var jsonString = values.map(function(r) { return r[0]; }).join('');
  try { return JSON.parse(jsonString); } catch (e) { return null; }
}

function getOrCreateSheet(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  return s;
}
