/* ============================================================
   KIỂM TRA QR v2 (thầy chốt 2026-11-02)
   - GV định danh bằng SĐT; mỗi GV 1 mã QR cố định (tạo 1 lần, lưu Firebase)
   - HS quét QR GV → chọn Mã kỳ thi → chọn Mã đề → nhập Mã HS → làm bài
   - Mode 1 (Word): nhập đề mẫu (tự nhận đáp án), nhập mã đề (≤4, cách phẩy),
     nhập số câu mỗi phần + điểm mỗi câu; hệ thống chia ngẫu nhiên, trùng tối thiểu
   - Mode 2 (PDF): mã đề ↔ file PDF theo thứ tự; đáp án Excel có cột mã đề + điểm
   - HS làm từng câu, hết giờ tự chuyển, được next sớm, KHÔNG quay lại
   - GV xem song song các mã đề
   - Kỳ thi đủ 7 ngày → chặn ở cổng vào, bắt xóa mới được tạo mới
   - Giới hạn: 150 HS/GV (xem ghi chú MAX_STUDENTS); trial: 5 HS, 1 kỳ/loại, ≤2 mã đề
   ============================================================ */
(function () {
  'use strict';

  // THẦY ĐỔI TẠI ĐÂY: giới hạn số HS mỗi GV
  var MAX_STUDENTS = 150;
  var TRIAL_MAX_STUDENTS = 5;

  firebase.initializeApp({
    apiKey: "AIzaSyCUFvW7wqGx4mXFEy7m7qZxmwz9wwPkX4c",
    authDomain: "gamehocvui.firebaseapp.com",
    projectId: "gamehocvui"
  });
  var db = firebase.firestore();
  var TRIAL = !!(window.__TRIAL__);

  var S = {
    screen: 'login',       // login | blocked | setup | live | result
    teacherPhone: '',
    teacherQR: '',
    examCode: '',
    examName: '',
    mode: 'word',
    versions: [],          // [{code, questions[]}] word mode
    pdfs: [],              // [{code, name, dataUrl}] pdf mode
    answerKey: {},         // versionCode -> {qNum: {phan, diem, dapAn}}
    students: [],
    qSeconds: 30,
    session: '',
    oldExams: [],          // kỳ thi quá 7 ngày
    submissions: {},
    unsub: null,
    // live (word mode)
    versionState: {},      // versionCode -> {curQ}
    timerId: null
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function toast(m) { var t = $('toast'); if (!t) return; t.textContent = m; t.className = 'show'; setTimeout(function () { t.className = ''; }, 2500); }
  function newCode(n) { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < (n || 6); i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

  /* ============ CỔNG VÀO: SĐT + CHẶN 7 NGÀY ============ */
  function renderLogin() {
    // Thử lấy SĐT từ hub
    var saved = '';
    try { saved = localStorage.getItem('kg_current_teacher_id') || ''; } catch (e) {}
    var h = '<div class="screen"><h1>📝 Kiểm Tra QR</h1>' +
      '<div class="subtitle">Kỳ thi QR — HS quét mã làm bài trên điện thoại</div>' +
      '<div class="cfg" style="max-width:480px;margin:0 auto">' +
      '<label>Số điện thoại GV: <input id="teacherPhone" type="text" placeholder="VD: 0987654321" value="' + esc(saved) + '" style="width:200px"></label>' +
      '<div class="row"><button class="btn primary big" id="btnLogin">▶ Vào</button></div>' +
      (TRIAL ? '<div class="hint">Bản chơi thử: tối đa 5 HS, 1 kỳ thi mỗi loại, ≤2 mã đề.</div>' : '') +
      '</div></div>';
    $('screen').innerHTML = h;
    $('btnLogin').addEventListener('click', function () {
      var phone = ($('teacherPhone').value || '').trim().replace(/\D/g, '');
      if (phone.length < 9) { toast('Nhập số điện thoại!'); return; }
      S.teacherPhone = phone;
      checkOldExams();
    });
  }

  function checkOldExams() {
    // Kiểm tra kỳ thi quá 7 ngày → chặn
    db.collection('exams').where('teacherPhone', '==', S.teacherPhone).get().then(function (snap) {
      var now = Date.now(), olds = [];
      snap.forEach(function (d) {
        var v = d.data();
        var created = v.createdAt && v.createdAt.toMillis ? v.createdAt.toMillis() : 0;
        if (now - created > 7 * 24 * 3600 * 1000) olds.push({ code: d.id, name: v.name || d.id });
      });
      if (olds.length) {
        S.oldExams = olds;
        S.screen = 'blocked';
        render();
      } else {
        loadTeacherQR();
      }
    }).catch(function (e) { toast('Lỗi: ' + e.message); });
  }

  function renderBlocked() {
    var h = '<div class="screen"><h1>⛔ Kỳ thi quá hạn</h1>' +
      '<div class="cfg" style="max-width:560px;margin:0 auto">' +
      '<p>Các kỳ thi sau đã quá <b>7 ngày</b>. Thầy cần <b>xóa</b> mới được tạo kỳ thi mới:</p><ul>';
    S.oldExams.forEach(function (e) {
      h += '<li>' + esc(e.name) + ' (' + esc(e.code) + ') <button class="btn btn-sm danger" data-del="' + esc(e.code) + '">🗑 Xóa</button></li>';
    });
    h += '</ul></div></div>';
    $('screen').innerHTML = h;
    h = document.querySelectorAll('[data-del]');
    for (var i = 0; i < h.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () { deleteExam(btn.getAttribute('data-del'), true); });
      })(h[i]);
    }
  }

  function loadTeacherQR() {
    // QR cố định mỗi GV: tạo 1 lần, lưu Firebase
    db.collection('teachers').doc(S.teacherPhone).get().then(function (d) {
      var v = d.data() || {};
      if (v.examQR) {
        S.teacherQR = v.examQR;
      } else {
        S.teacherQR = 'https://khogamehoctap.vercel.app/bailam/?t=' + S.teacherPhone;
        db.collection('teachers').doc(S.teacherPhone).set({ examQR: S.teacherQR }, { merge: true });
      }
      S.screen = 'setup';
      render();
      listMyExams(); // Danh sách kỳ thi đã tạo (để mở lại bảng điểm cũ)
    });
  }

  function deleteExam(code, fromBlock) {
    if (!confirm('Xóa kỳ thi ' + code + ' và toàn bộ dữ liệu?')) return;
    db.collection('exams').doc(code).collection('submissions').get().then(function (snap) {
      var batch = db.batch();
      snap.forEach(function (d) { batch.delete(d.ref); });
      batch.delete(db.collection('exams').doc(code));
      return batch.commit();
    }).then(function () {
      toast('Đã xóa.');
      if (fromBlock) checkOldExams();
      else { S.screen = 'setup'; render(); }
    });
  }

  function listMyExams() {
    // Liệt kê kỳ thi của GV để mở lại bảng điểm cũ (không cần orderBy -> tránh lỗi composite index)
    db.collection('exams').where('teacherPhone', '==', S.teacherPhone).get().then(function (snap) {
      var list = [];
      snap.forEach(function (d) { list.push({ id: d.id, v: d.data() || {} }); });
      list.sort(function (a, b) {
        var ta = a.v.createdAt && a.v.createdAt.toMillis ? a.v.createdAt.toMillis() : 0;
        var tb = b.v.createdAt && b.v.createdAt.toMillis ? b.v.createdAt.toMillis() : 0;
        return tb - ta;
      });
      var h = '<b>📂 Kỳ thi đã tạo</b> <span class="muted">(bấm để xem lại bảng điểm)</span><br>';
      if (!list.length) h += '<span class="muted">Chưa có kỳ thi nào.</span>';
      list.slice(0, 10).forEach(function (e) {
        h += '<div class="row"><span>' + esc(e.v.name || e.id) + ' (' + esc(e.id) + ') — ' +
          esc(e.v.status === 'closed' ? 'đã đóng' : 'đang mở') + '</span> ' +
          '<button class="btn btn-sm" data-openexam="' + esc(e.id) + '">📊 Xem kết quả</button> ' +
          '<button class="btn btn-sm danger" data-delexam="' + esc(e.id) + '">🗑 Xóa</button></div>';
      });
      var el = $('myExams');
      if (el) {
        el.innerHTML = h;
        el.querySelectorAll('[data-openexam]').forEach(function (btn) {
          btn.addEventListener('click', function () { openExamResults(btn.getAttribute('data-openexam')); });
        });
        el.querySelectorAll('[data-delexam]').forEach(function (btn) {
          btn.addEventListener('click', function () { deleteExam(btn.getAttribute('data-delexam'), false); });
        });
      }
    }).catch(function (e) {
      var el = $('myExams');
      if (el) el.textContent = 'Không tải được danh sách kỳ thi.';
    });
  }

  function openExamResults(code) {
    // Mở lại bảng điểm của kỳ thi cũ: tải đáp án TƯƠI từ server rồi tính lại điểm
    if (!confirm('Mở bảng điểm kỳ thi ' + code + '?')) return;
    toast('Đang tải kết quả...');
    S.session = code; S.examCode = code;
    db.collection('exams').doc(code).collection('submissions').get().then(function (snap) {
      S.submissions = {};
      snap.forEach(function (d) { S.submissions[d.id] = d.data(); });
      return db.collection('exams').doc(code).collection('roster').get();
    }).then(function (rs) {
      var roster = {};
      rs.forEach(function (d) { roster[d.id] = d.data(); });
      S.roster = roster;
      return db.collection('exams').doc(code).get({ source: 'server' });
    }).then(function (ed) {
      S.examDoc = ed.data() || {};
      S.examName = S.examDoc.name || code;
      S.screen = 'result';
      render();
    }).catch(function (e) { toast('Lỗi: ' + e.message); });
  }

  /* ============ CHIA ĐỀ NGẪU NHIÊN (mode word) ============ */
  // bank: {phan: [q,...]}, need: {phan: soCau}, versions: [code,...]
  // Trả về: {versionCode: {phan: [q,...]}}
  function distributeQuestions(bank, need, versions) {
    var out = {};
    versions.forEach(function (vc) { out[vc] = {}; });
    Object.keys(need).forEach(function (phan) {
      var pool = shuffle((bank[phan] || []).slice());
      var m = need[phan] || 0, V = versions.length;
      if (!pool.length || !m) return;
      // Chia vòng tròn để trùng tối thiểu
      var idx = 0;
      versions.forEach(function (vc) {
        out[vc][phan] = [];
        for (var i = 0; i < m; i++) {
          out[vc][phan].push(pool[idx % pool.length]);
          idx++;
        }
      });
    });
    return out;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ============ SETUP ============ */
  var GUIDE_HTML = '<div style="text-align:left;max-width:640px;margin:0 auto">' +
    '<h3>📖 Hướng dẫn Kiểm Tra QR</h3>' +
    '<p><b>Bước 1 — Chuẩn bị:</b> Nhập mã kỳ thi, tên kỳ thi, chọn chế độ đề (Word/PDF).</p>' +
    '<p><b>Bước 2 — Đề Word:</b> Nhập file Word đề mẫu (tự nhận câu hỏi) → nhập các mã đề (cách nhau dấu phẩy, ≤4) → nhập số câu mỗi phần + điểm mỗi câu → hệ thống tự chia đề ngẫu nhiên.</p>' +
    '<p><b>Bước 2 — Đề PDF:</b> Nhập các mã đề (theo thứ tự file) → tải file PDF → nhập đáp án Excel (cột Câu/Điểm/Phần + mỗi mã đề 1 cột).</p>' +
    '<p><b>Bước 3 — HS:</b> Nhập danh sách HS (Excel) — không bắt buộc, khách vãng lai vẫn thi được.</p>' +
    '<p><b>Bước 4 — Thi:</b> Bấm "Bắt đầu" → in QR cố định của thầy cho HS quét → HS chọn kỳ thi → chọn mã đề → nhập mã HS → làm bài.</p>' +
    '<p><b>Chấm:</b> Bấm "Kết thúc & Chấm" → xem bảng điểm → tải Excel. Muốn chấm lại bấm "🔄 Chấm lại".</p>' +
    '<p><b>Xóa kỳ thi:</b> Bấm nút 🗑 Xóa trong mục "📂 Kỳ thi đã tạo" bên dưới, hoặc trong màn hình live.</p>' +
    '<p class="muted">Kỳ thi tự hết hạn sau 7 ngày. Quá hạn phải xóa mới tạo được kỳ mới.</p></div>';

  function renderSetup() {
    var qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(S.teacherQR);
    var h = '<div class="screen"><h1>📝 Kiểm Tra QR</h1>' +
      '<div class="subtitle">GV: ' + esc(S.teacherPhone) + ' <button id="btnHelp" class="btn btn-sm">📖 Hướng dẫn</button></div>' +
      '<div id="helpBox" style="display:none;background:#f0f9ff;border:1px solid #93c5fd;border-radius:10px;padding:12px;margin:10px auto;max-width:700px"></div>' +
      '<div class="cfg">' +
      '<div class="qrbox"><b>📱 QR cố định của thầy (in 1 lần dùng mãi)</b><br>' +
      '<img src="' + qrImg + '" style="width:160px;height:160px"><br>' +
      '<span class="muted">' + esc(S.teacherQR) + '</span></div>' +
      '<label>Mã kỳ thi: <input id="examCode" type="text" placeholder="VD: KT15P-T10" style="width:200px"></label>' +
      '<label>Tên kỳ thi: <input id="examName" type="text" placeholder="VD: Kiểm tra 15 phút" style="width:300px"></label>' +
      '<div class="row"><b>Chế độ:</b> ' +
      '<label class="chk"><input type="radio" name="mode" value="word" checked> 📄 Đề Word (chia mã)</label> ' +
      '<label class="chk"><input type="radio" name="mode" value="pdf"> 📑 Đề PDF</label></div>' +

      '<div id="modeWord">' +
      '<label class="filebtn">📝 Nhập đề Word (mẫu có đáp án)<input type="file" id="fileWord" accept=".docx,.doc" hidden></label> ' +
      '<span id="wordInfo" class="muted"></span><br>' +
      '<label>Mã đề (cách nhau dấu phẩy, ≤' + (TRIAL ? 2 : 4) + '): <input id="versionCodes" type="text" placeholder="VD: 1001,1002" style="width:250px"></label>' +
      '<div class="row"><b>Số câu mỗi phần / mã đề:</b> ' +
      'Phần I: <input id="nPI" type="number" min="0" max="50" value="10" style="width:60px"> ' +
      'Phần II: <input id="nPII" type="number" min="0" max="20" value="2" style="width:60px"> ' +
      'Phần III: <input id="nPIII" type="number" min="0" max="20" value="4" style="width:60px"></div>' +
      '<div class="row"><b>Điểm mỗi câu:</b> ' +
      'Phần I: <input id="pPI" type="number" min="0" step="0.05" value="0.25" style="width:70px"> ' +
      'Phần II: <input id="pPII" type="number" min="0" step="0.05" value="1" style="width:70px"> ' +
      'Phần III: <input id="pPIII" type="number" min="0" step="0.05" value="0.5" style="width:70px"></div>' +
      '<label>Thời gian mỗi câu (giây): <input id="qSeconds" type="number" min="10" max="300" value="30" style="width:70px"></label>' +
      '</div>' +

      '<div id="modePdf" style="display:none">' +
      '<label>Mã đề (cách nhau dấu phẩy, theo thứ tự file): <input id="pdfCodes" type="text" placeholder="VD: 1001,1002" style="width:250px"></label><br>' +
      '<label class="filebtn">📑 Nhập đề PDF<input type="file" id="filePdf" accept=".pdf" multiple hidden></label> ' +
      '<span id="pdfInfo" class="muted"></span>' +
      '</div>' +

      '<div class="row" style="margin-top:10px">' +
      '<label class="filebtn">✅ Nhập đáp án (Excel)<input type="file" id="fileAns" accept=".xlsx,.xls" hidden></label> ' +
      '<span id="ansInfo" class="muted"></span> ' +
      '<a href="#" id="dlAnsTpl" class="link">⬇ Mẫu Excel đáp án</a></div>' +
      '<div class="row muted">Mode PDF: cột Câu/Điểm/Phần + mỗi mã đề 1 cột. Mode Word: đáp án tự nhận từ file Word.</div>' +
      '<div class="row">' +
      '<label class="filebtn">👥 Nhập HS (Excel)<input type="file" id="fileStu" accept=".xlsx,.xls" hidden></label> ' +
      '<span id="stuInfo" class="muted"></span> ' +
      '<a href="#" id="dlStuTpl" class="link">⬇ Mẫu Excel HS</a></div>' +
      '<div class="row"><b>Chấm Đúng/Sai:</b> ' +
      '<label class="chk"><input type="radio" name="tfMode" value="bgd" checked> Theo BGD</label> ' +
      '<label class="chk"><input type="radio" name="tfMode" value="deu"> Chia đều</label></div>' +
      '</div>' +
      '<div class="row"><button class="btn primary big" id="btnStart">▶ Bắt đầu kỳ thi</button></div>' +
      '<div class="cfg" style="margin-top:12px"><div id="myExams" class="muted">Đang tải danh sách kỳ thi...</div></div>' +
      '</div>';
    $('screen').innerHTML = h;

    document.querySelectorAll('input[name=mode]').forEach(function (r) {
      r.addEventListener('change', function () {
        S.mode = document.querySelector('input[name=mode]:checked').value;
        $('modeWord').style.display = S.mode === 'word' ? 'block' : 'none';
        $('modePdf').style.display = S.mode === 'pdf' ? 'block' : 'none';
      });
    });
    $('fileWord').addEventListener('change', function () {
      if (this.files[0]) importWord(this.files[0], function (bank) {
        S.wordBank = bank;
        var n = Object.keys(bank).reduce(function (s, k) { return s + bank[k].length; }, 0);
        $('wordInfo').textContent = 'Đã nhập ' + n + ' câu.';
      });
      this.value = '';
    });
    $('filePdf').addEventListener('change', function () {
      var files = Array.prototype.slice.call(this.files, 0, 4);
      S.pdfFiles = files;
      $('pdfInfo').textContent = 'Đã chọn ' + files.length + ' file PDF.';
      this.value = '';
    });
    $('fileAns').addEventListener('change', function () {
      if (this.files[0]) importAnswerExcel(this.files[0], function (key) {
        S.answerKey = key;
        // Preview để thầy kiểm tra
        var pv = '<div style="background:#f0fdf4;border:1px solid #16a34a;border-radius:8px;padding:8px;margin-top:8px;font-size:13px"><b>✅ Xem trước đáp án:</b><br>';
        Object.keys(key).forEach(function (vc) {
          var qs = Object.keys(key[vc]);
          pv += 'Mã ' + esc(vc) + ' (' + qs.length + ' câu): ';
          pv += qs.slice(0, 6).map(function (qn) {
            var k = key[vc][qn];
            return qn + '=' + esc(k.dapAn) + '(' + k.diem + 'đ)';
          }).join(', ');
          if (qs.length > 6) pv += '...';
          pv += '<br>';
        });
        pv += '</div>';
        $('ansInfo').innerHTML = 'Đã nhập đáp án.' + pv;
      });
      this.value = '';
    });
    $('fileStu').addEventListener('change', function () {
      if (this.files[0]) importStudentExcel(this.files[0], function (list) {
        var max = TRIAL ? TRIAL_MAX_STUDENTS : MAX_STUDENTS;
        if (list.length > max) { toast('Tối đa ' + max + ' HS!'); return; }
        S.students = list;
        $('stuInfo').textContent = 'Đã nhập ' + list.length + ' HS.';
      });
      this.value = '';
    });
    $('dlAnsTpl').addEventListener('click', function (e) { e.preventDefault(); downloadAnsTpl(); });
    $('dlStuTpl').addEventListener('click', function (e) { e.preventDefault(); downloadStuTpl(); });
    $('btnStart').addEventListener('click', startExam);
    var hb = $('btnHelp'), hx = $('helpBox');
    if (hb && hx) hb.addEventListener('click', function () {
      hx.style.display = hx.style.display === 'none' ? 'block' : 'none';
      if (hx.style.display === 'block') hx.innerHTML = GUIDE_HTML;
    });
  }

  /* ============ IMPORT ============ */
  function importWord(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      mammoth.convertToHtml({ arrayBuffer: rd.result }).then(function (r) {
        var div = document.createElement('div');
        div.innerHTML = r.value;
        cb(parseWordBank(div));
      }).catch(function (e) { toast('Lỗi đọc Word: ' + e.message); });
    };
    rd.readAsArrayBuffer(file);
  }
  // Parse theo mẫu game: Câu N + đáp án; tự nhận Phần I/II/III qua tiêu đề
  function parseWordBank(div) {
    var bank = { I: [], II: [], III: [] }, phan = 'I', cur = null;
    div.querySelectorAll('p').forEach(function (p) {
      var t = p.textContent.trim();
      if (/^Phần\s*I\b/i.test(t) && !/^Phần\s*II/i.test(t)) phan = 'I';
      else if (/^Phần\s*II\b/i.test(t)) phan = 'II';
      else if (/^Phần\s*III\b/i.test(t)) phan = 'III';
      var mCau = t.match(/^Câu\s*(\d+)\s*[:.]\s*(.+)/i);
      var mOpt = t.match(/^([A-D])\s*[.)]\s*(.+)/i);
      var mDS = t.match(/^([a-d])\)\s*(.+)/i);
      var mAns = t.match(/^Đáp án\s*:\s*(.+)/i);
      if (mAns && cur) {
        // Đáp án đi kèm câu hỏi (VD: Đáp án: A / DSSD / 2,45)
        cur.ans = mAns[1].trim();
      } else if (mCau) {
        if (cur) bank[cur.phan].push(cur);
        cur = { phan: phan, q: mCau[2], opts: [], ds: [], ans: null };
      } else if (mOpt && cur && phan === 'I') {
        cur.opts.push(mOpt[2]);
      } else if (mDS && cur && phan === 'II') {
        cur.ds.push(mDS[2]);
      }
    });
    if (cur) bank[cur.phan].push(cur);
    return bank;
  }
  function importAnswerExcel(file, cb) {
    // Cột: Câu | Điểm | Phần | [mã đề 1] | [mã đề 2] | ...
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var wb = XLSX.read(rd.result, { type: 'array' });
        var rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        var header = rows[0] || [];
        var vCodes = [];
        for (var c = 3; c < header.length; c++) {
          if (header[c] != null && String(header[c]).trim()) vCodes.push(String(header[c]).trim());
        }
        var key = {};  // versionCode -> {qNum: {phan, diem, dapAn}}
        vCodes.forEach(function (vc) { key[vc] = {}; });
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (r[0] == null) continue;
          var qn = String(r[0]).trim(), diem = parseFloat(r[1]) || 0, phan = String(r[2] || 'I').trim().toUpperCase();
          vCodes.forEach(function (vc, ci) {
            var da = r[3 + ci];
            if (da != null && String(da).trim()) key[vc][qn] = { phan: phan, diem: diem, dapAn: String(da).trim() };
          });
        }
        cb(key);
      } catch (e) { toast('Lỗi đọc Excel: ' + e.message); }
    };
    rd.readAsArrayBuffer(file);
  }
  function importStudentExcel(file, cb) {
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var wb = XLSX.read(rd.result, { type: 'array' });
        var rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        var list = [];
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          if (r[1] == null) continue;
          list.push({ ma: String(r[1]).trim(), ten: String(r[2] || '').trim(), lop: String(r[3] || '').trim() });
        }
        cb(list);
      } catch (e) { toast('Lỗi đọc Excel HS: ' + e.message); }
    };
    rd.readAsArrayBuffer(file);
  }
  function downloadAnsTpl() {
    var data = [
      ['Câu', 'Điểm', 'Phần', '1001', '1002'],
      [1, 0.25, 'I', 'A', 'C'],
      [2, 0.25, 'I', 'B', 'D'],
      [3, 1, 'II', 'DSSD', 'DSSD'],
      [4, 0.5, 'III', '12,5', '15']
    ];
    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DapAn');
    XLSX.writeFile(wb, 'MauDapAn.xlsx');
  }
  function downloadStuTpl() {
    var data = [['STT', 'Mã HS', 'Họ tên', 'Lớp'], [1, 'HS001', 'Nguyễn Văn An', '10A1']];
    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HocSinh');
    XLSX.writeFile(wb, 'MauHocSinh.xlsx');
  }

  /* ============ BẮT ĐẦU KỲ THI ============ */
  function startExam() {
    S.examCode = ($('examCode').value || '').trim().toUpperCase();
    S.examName = ($('examName').value || '').trim();
    if (!S.examCode) { toast('Nhập mã kỳ thi!'); return; }
    if (!S.examName) { toast('Nhập tên kỳ thi!'); return; }

    // Trial: mỗi loại (word/pdf) chỉ 1 kỳ thi
    if (TRIAL) {
      var modeNow = (document.querySelector('input[name=mode]:checked') || {}).value || 'word';
      db.collection('exams').where('teacherPhone', '==', S.teacherPhone).where('mode', '==', modeNow).get().then(function (snap) {
        if (!snap.empty) { toast('Bản thử: mỗi loại chỉ tạo 1 kỳ thi!'); return; }
        doStartExam();
      }).catch(function (e) { toast('Lỗi: ' + e.message); });
      return;
    }
    doStartExam();
  }
  function doStartExam() {
    var tfMode = (document.querySelector('input[name=tfMode]:checked') || {}).value || 'bgd';
    S.qSeconds = parseInt(($('qSeconds') || {}).value || '30', 10);
    var expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);

    if (S.mode === 'word') {
      var vcs = ($('versionCodes').value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var maxV = TRIAL ? 2 : 4;
      if (!vcs.length || vcs.length > maxV) { toast('Nhập 1–' + maxV + ' mã đề!'); return; }
      if (!S.wordBank) { toast('Hãy nhập đề Word!'); return; }
      var need = { I: parseInt($('nPI').value || '0', 10), II: parseInt($('nPII').value || '0', 10), III: parseInt($('nPIII').value || '0', 10) };
      var pts = { I: parseFloat($('pPI').value || '0'), II: parseFloat($('pPII').value || '0'), III: parseFloat($('pPIII').value || '0') };
      // Chia đề
      var dist = distributeQuestions(S.wordBank, need, vcs);
      S.versions = vcs.map(function (vc) {
        var qs = [];
        ['I', 'II', 'III'].forEach(function (ph) {
          (dist[vc][ph] || []).forEach(function (q, i) {
            qs.push({ phan: ph, q: q.q, opts: q.opts, ds: q.ds, diem: pts[ph], num: qs.length + 1, ans: q.ans || '' });
          });
        });
        return { code: vc, questions: qs };
      });
      // Đáp án word mode: lấy từ key GV nhập? Tạm dùng answerKey nếu có
      saveExamDoc({ mode: 'word', tfMode: tfMode, expiresAt: expiresAt, versions: vcs,
        versionQuestions: S.versions.map(function (v) { return { code: v.code, count: v.questions.length }; }) });
    } else {
      var pcs = ($('pdfCodes').value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!pcs.length || !(S.pdfFiles || []).length) { toast('Nhập mã đề + file PDF!'); return; }
      if (!S.answerKey || !Object.keys(S.answerKey).length) { toast('Hãy nhập đáp án Excel!'); return; }
      // Upload PDF -> dataUrl (lưu tạm, bản chính thức nên dùng Storage)
      var pdfs = [], done = 0;
      S.pdfFiles.forEach(function (f, i) {
        var rd = new FileReader();
        rd.onload = function () {
          pdfs.push({ code: pcs[i] || ('PDF' + (i + 1)), name: f.name, dataUrl: rd.result });
          if (++done === S.pdfFiles.length) {
            S.pdfs = pdfs;
            saveExamDoc({ mode: 'pdf', tfMode: tfMode, expiresAt: expiresAt, versions: pcs, answerKey: S.answerKey });
          }
        };
        rd.readAsDataURL(f);
      });
    }
  }

  function saveExamDoc(extra) {
    var doc = Object.assign({
      teacherPhone: S.teacherPhone,
      code: S.examCode,
      name: S.examName,
      status: 'open',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      numStudents: S.students.length
    }, extra);
    // Lưu danh sách HS riêng (giới hạn)
    var batch = db.batch();
    batch.set(db.collection('exams').doc(S.examCode), doc);
    (S.students || []).forEach(function (st) {
      batch.set(db.collection('exams').doc(S.examCode).collection('roster').doc(st.ma), st);
    });
    // Lưu câu hỏi + đáp án word mode (đáp án đi kèm từng câu)
    if (S.mode === 'word' && S.versions) {
      var wordKey = {};
      S.versions.forEach(function (v) {
        batch.set(db.collection('exams').doc(S.examCode).collection('versions').doc(v.code), {
          questions: v.questions.map(function (q) { return { phan: q.phan, q: q.q, opts: q.opts, ds: q.ds, diem: q.diem, num: q.num }; })
        });
        wordKey[v.code] = {};
        v.questions.forEach(function (q) {
          if (q.ans) wordKey[v.code][String(q.num)] = { phan: q.phan, diem: q.diem, dapAn: q.ans };
        });
      });
      doc.answerKey = wordKey;
    }
    // Lưu PDF
    if (S.mode === 'pdf' && S.pdfs) {
      S.pdfs.forEach(function (p) {
        batch.set(db.collection('exams').doc(S.examCode).collection('versions').doc(p.code), {
          pdfName: p.name, pdfUrl: p.dataUrl
        });
      });
    }
    batch.commit().then(function () {
      S.session = S.examCode;
      S.screen = 'live';
      render();
      listenSubmissions();
      if (S.mode === 'word') { S.versionState = {}; S.versions.forEach(function (v) { S.versionState[v.code] = 0; }); tickWord(); }
    }).catch(function (e) { toast('Lỗi: ' + e.message); });
  }

  function listenSubmissions() {
    if (S.unsub) S.unsub();
    S.unsub = db.collection('exams').doc(S.session).collection('submissions').onSnapshot(function (snap) {
      snap.forEach(function (d) { S.submissions[d.id] = d.data(); });
      var el = $('subCount');
      if (el) el.textContent = Object.keys(S.submissions).length;
    });
  }

  /* ============ LIVE: WORD MODE ============ */
  function tickWord() {
    // Mỗi mã đề có con trỏ câu riêng; timer chung
    S.timeLeft = S.qSeconds;
    render();
    clearInterval(S.timerId);
    S.timerId = setInterval(function () {
      S.timeLeft--;
      document.querySelectorAll('.qTimer').forEach(function (el) { el.textContent = S.timeLeft + 's'; });
      if (S.timeLeft <= 0) {
        // Hết giờ: tất cả mã đề cùng next
        S.versions.forEach(function (v) {
          if (S.versionState[v.code] < v.questions.length - 1) S.versionState[v.code]++;
        });
        tickWord();
      }
    }, 1000);
  }
  function nextQuestionWord(vc) {
    var v = S.versions.find(function (x) { return x.code === vc; });
    if (v && S.versionState[vc] < v.questions.length - 1) {
      S.versionState[vc]++;
      tickWord();
    }
  }

  /* ============ CHẤM ============ */
  function normNum(s) { return String(s).trim().replace(',', '.'); }
  function tfScore(correct, total, mode) {
    if (mode === 'bgd' && total === 4) return [0, 0.1, 0.25, 0.5, 1.0][correct] || 0;
    return total ? correct / total : 0;
  }
  function gradeAnswer(key, given, tfMode) {
    if (!key || given == null || given === '') return 0;
    var phan = key.phan, ka = String(key.dapAn).trim().toUpperCase(), ga = String(given).trim().toUpperCase();
    if (phan === 'II') {
      var total = ka.length, correct = 0;
      for (var i = 0; i < total; i++) if ((ga[i] || '') === ka[i]) correct++;
      return tfScore(correct, total, tfMode) * (key.diem || 1);
    }
    if (phan === 'III') return normNum(ga) === normNum(ka) ? (key.diem || 1) : 0;
    return ga === ka ? (key.diem || 1) : 0;
  }

  /* ============ RENDER LIVE/RESULT ============ */
  function teacherQRImg() {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(S.teacherQR);
  }
  function renderLive() {
    var h = '<div class="screen"><h1>📝 ' + esc(S.examName) + ' (' + esc(S.examCode) + ')</h1><div class="livegrid">';
    h += '<div class="exampanel">';
    if (S.mode === 'word') {
      // Song song các mã đề
      h += '<div class="vgrid">';
      S.versions.forEach(function (v) {
        var qi = S.versionState[v.code] || 0, q = v.questions[qi];
        h += '<div class="vcol"><div class="vhead">Mã ' + esc(v.code) + ' — Câu ' + (qi + 1) + '/' + v.questions.length +
          ' <span class="qTimer">' + S.timeLeft + 's</span></div>';
        if (q) {
          h += '<div class="qtext">' + esc(q.q) + '</div>';
          if (q.phan === 'I') q.opts.forEach(function (o, i) { h += '<div class="opt"><b>' + 'ABCD'[i] + '.</b> ' + esc(o) + '</div>'; });
          if (q.phan === 'II') q.ds.forEach(function (d, i) { h += '<div class="opt">' + String.fromCharCode(97 + i) + ') ' + esc(d) + '</div>'; });
        }
        h += '<div class="row"><button class="btn btn-sm" data-next="' + esc(v.code) + '">Câu tiếp ▶</button></div></div>';
      });
      h += '</div>';
    } else {
      S.pdfs.forEach(function (p) {
        h += '<div class="pdfblock"><div class="pdfname">Mã ' + esc(p.code) + ' — ' + esc(p.name) + '</div>' +
          '<iframe src="' + p.dataUrl + '"></iframe></div>';
      });
    }
    h += '</div>';
    h += '<div class="sidepanel"><div class="qrbox"><b>📱 QR của thầy</b><br><img src="' + teacherQRImg() + '" style="width:160px;height:160px"></div>' +
      '<div class="subbox">📤 Đã nộp: <b id="subCount">' + Object.keys(S.submissions).length + '</b></div>' +
      '<button id="btnFinish" class="btn primary big">🏁 Kết thúc & Chấm</button> ' +
      '<button id="btnDelExam" class="btn danger">🗑 Xóa kỳ thi</button></div>';
    h += '</div></div>';
    $('screen').innerHTML = h;
    document.querySelectorAll('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () { nextQuestionWord(b.getAttribute('data-next')); });
    });
    $('btnFinish').addEventListener('click', function () { if (confirm('Kết thúc và chấm?')) finishExam(); });
    $('btnDelExam').addEventListener('click', function () { deleteExam(S.examCode, false); });
  }

  function finishExam() {
    clearInterval(S.timerId);
    db.collection('exams').doc(S.session).update({ status: 'closed' }).then(function () {
      toast('Đang thu bài...');
      setTimeout(function () {
        db.collection('exams').doc(S.session).collection('submissions').get().then(function (snap) {
          snap.forEach(function (d) { S.submissions[d.id] = d.data(); });
          // Lấy roster để map tên
          db.collection('exams').doc(S.session).collection('roster').get().then(function (rs) {
            var roster = {};
            rs.forEach(function (d) { roster[d.id] = d.data(); });
            S.roster = roster;
            // Lấy đáp án TƯƠI từ server (không dùng cache)
            db.collection('exams').doc(S.session).get({ source: 'server' }).then(function (ed) {
              S.examDoc = ed.data() || {};
              var ak = S.examDoc.answerKey || {};
              var missing = [];
              Object.keys(S.submissions).forEach(function (sid) {
                var md = (sid.split('_')[1] || '');
                if (md && !ak[md]) missing.push(md);
              });
              if (missing.length) toast('Thiếu đáp án mã: ' + missing.join(','));
              S.screen = 'result';
              render();
            });
          });
        });
      }, 3000);
    });
  }

  function renderResult() {
    var tfMode = (S.examDoc || {}).tfMode || 'bgd';
    var results = [];
    Object.keys(S.submissions).forEach(function (sid) {
      var sub = S.submissions[sid];
      // sid dạng "MÃHS_MÃĐỀ" hoặc mã HS
      var parts = sid.split('_'), maHS = parts[0], maDe = parts[1] || '';
      var key = ((S.examDoc || {}).answerKey || {})[maDe] || S.answerKey[maDe] || {};
      // Word mode: đáp án từ version
      var total = 0;
      Object.keys(key).forEach(function (qn) {
        total += gradeAnswer(key[qn], (sub.answers || {})[qn], tfMode);
      });
      var info = (S.roster || {})[maHS];
      results.push({ ma: maHS, made: maDe, ten: info ? info.ten : 'Khách', lop: info ? info.lop : '', diem: Math.round(total * 100) / 100 });
    });
    results.sort(function (a, b) { return b.diem - a.diem; });
    var h = '<div class="screen"><h1>🏆 ' + esc(S.examName) + '</h1>' +
      '<div class="row"><button id="btnExport" class="btn primary">⬇ Tải Excel</button> ' +
      '<button id="btnRegrade" class="btn">🔄 Chấm lại</button> ' +
      '<button id="btnBack" class="btn">◀ Về đầu</button></div>' +
      '<table class="rtable"><tr><th>Hạng</th><th>Mã HS</th><th>Mã đề</th><th>Họ tên</th><th>Lớp</th><th>Điểm</th></tr>';
    var medals = ['🥇', '🥈', '🥉'];
    results.forEach(function (r, i) {
      h += '<tr><td>' + (medals[i] || (i + 1)) + '</td><td>' + esc(r.ma) + '</td><td>' + esc(r.made) + '</td>' +
        '<td>' + esc(r.ten) + '</td><td>' + esc(r.lop) + '</td><td><b>' + r.diem + '</b></td></tr>';
    });
    h += '</table></div>';
    if (!results.length) h += '<p class="muted center">Chưa có bài nộp.</p>';
    h += '<div class="row" style="margin-top:20px"><button id="btnDebug" class="btn btn-sm">🔍 Debug chấm điểm</button></div><div id="debugOut" style="font-size:12px;background:#f8fafc;padding:10px;border-radius:8px;margin-top:8px;white-space:pre-wrap"></div>';
    $('screen').innerHTML = h;
    $('btnDebug').addEventListener('click', function () {
      var out = 'examDoc.answerKey keys: ' + Object.keys((S.examDoc||{}).answerKey||{}).join(',') + '\n';
      out += 'S.answerKey keys: ' + Object.keys(S.answerKey||{}).join(',') + '\n';
      out += 'submissions: ' + Object.keys(S.submissions).join(',') + '\n';
      Object.keys(S.submissions).forEach(function (sid) {
        var sub = S.submissions[sid];
        var maDe = sid.split('_')[1] || '';
        var key = ((S.examDoc||{}).answerKey||{})[maDe] || {};
        out += '\n--- ' + sid + ' (maDe=' + maDe + ') ---\n';
        out += 'key questions: ' + Object.keys(key).join(',') + '\n';
        out += 'answers: ' + JSON.stringify(sub.answers) + '\n';
        Object.keys(key).slice(0,3).forEach(function (qn) {
          out += 'Q' + qn + ': key=' + JSON.stringify(key[qn]) + ' given=' + JSON.stringify((sub.answers||{})[qn]) + '\n';
        });
      });
      $('debugOut').textContent = out;
    });
    $('btnExport').addEventListener('click', function () {
      var data = [['Hạng', 'Mã HS', 'Mã đề', 'Họ tên', 'Lớp', 'Điểm']];
      results.forEach(function (r, i) { data.push([i + 1, r.ma, r.made, r.ten, r.lop, r.diem]); });
      var ws = XLSX.utils.aoa_to_sheet(data);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'KetQua');
      XLSX.writeFile(wb, 'KetQua_' + S.examCode + '.xlsx');
    });
    $('btnBack').addEventListener('click', function () { S.screen = 'setup'; S.submissions = {}; render(); });
    $('btnRegrade').addEventListener('click', function () {
      toast('Đang tải lại đáp án...');
      db.collection('exams').doc(S.session).get({ source: 'server' }).then(function (ed) {
        S.examDoc = ed.data() || {};
        render();
        toast('Đã chấm lại!');
      });
    });
  }

  function render() {
    if (S.screen === 'login') renderLogin();
    else if (S.screen === 'blocked') renderBlocked();
    else if (S.screen === 'setup') renderSetup();
    else if (S.screen === 'live') renderLive();
    else if (S.screen === 'result') renderResult();
  }

  window.__KIEMTRAQR2 = { S: S, distributeQuestions: distributeQuestions, gradeAnswer: gradeAnswer, normNum: normNum, tfScore: tfScore, shuffle: shuffle, MAX_STUDENTS: MAX_STUDENTS };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderLogin);
  else renderLogin();
})();
