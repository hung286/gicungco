/* =====================================================================
   SmartEdu Quiz Common — module DÙNG CHUNG cho mọi game trắc nghiệm
   (bancung, bimat_omau, latthe, ailatrieuphu...)
   - Render công thức toán: gõ $...$ (inline) hoặc $$...$$ (dòng riêng),
     dùng KaTeX chạy local (không cần mạng).
   - Import câu hỏi từ Word (.docx) GIỮ NGUYÊN ẢNH (base64, không upload
     đi đâu) + giữ chữ đậm/nghiêng/chỉ số.
   - Làm sạch HTML trước khi hiển thị (chỉ giữ img/data: + img Cloudinary,
     b, i, u, sub, sup, br).
   Cách dùng trong game:
     <link rel="stylesheet" href="./katex/katex.min.css">
     <script src="./katex/katex.min.js"></script>
     <script src="./smartedu-quiz-common.js"></script>
     // hiển thị câu hỏi:
     QuizCommon.setQuestion(elQ, q);            // q = {q, qHtml, ...}
     QuizCommon.setOption(elBtn, q, j);         // j = 0..3, tự thêm "A. "
     // nhập Word giữ ảnh:
     QuizCommon.importQuestionsFromWord(file, {
       onOk: function (qs) { ... },             // qs: [{q, qHtml, opts, optsHtml, answer}]
       onEmpty: function () { ... },
       onNoLib: function () { ... },
       onError: function () { ... }
     });
   ===================================================================== */
(function (G) {
'use strict';
var doc = G.document;

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- Render $...$ / $$...$$ bằng KaTeX ---------- */
function renderTeX(root) {
  if (!root || !G.katex) return;
  var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  var nodes = [], tn;
  while ((tn = walker.nextNode())) nodes.push(tn);
  var re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  nodes.forEach(function (t) {
    var text = t.nodeValue;
    if (text.indexOf('$') < 0) return;
    // bỏ qua text nằm trong thẻ script/style
    var p = t.parentNode;
    if (p && /^(SCRIPT|STYLE)$/.test(p.tagName)) return;
    var frag = doc.createDocumentFragment();
    var last = 0, m, has = false;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      has = true;
      if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
      var tex = (m[1] !== undefined) ? m[1] : m[2];
      var display = (m[1] !== undefined);
      var span = doc.createElement('span');
      try { G.katex.render(tex, span, { throwOnError: false, displayMode: display }); }
      catch (e) { span.textContent = m[0]; }
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (!has) return;
    if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
}

/* ---------- Làm sạch HTML: chỉ giữ img(data:), b, i, u, sub, sup, br ---------- */
function sanitizeInline(html) {
  var div = doc.createElement('div');
  div.innerHTML = String(html == null ? '' : html);
  var allowed = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, SUB: 1, SUP: 1, BR: 1, SPAN: 1, IMG: 1, P: 1 };
  function clean(node) {
    var kids = Array.prototype.slice.call(node.childNodes), i, ch;
    for (i = 0; i < kids.length; i++) {
      ch = kids[i];
      if (ch.nodeType === 3) continue;
      if (ch.nodeType !== 1) { node.removeChild(ch); continue; }
      var tag = ch.tagName;
      if (!allowed[tag]) {
        node.replaceChild(doc.createTextNode(ch.textContent), ch);
        continue;
      }
      if (tag === 'IMG') {
        var src = ch.getAttribute('src') || '';
        /* Anh giu lai 2 dang: data:image/ (nhap Word) + https://res.cloudinary.com/
           (anh ngan hang cau hoi — toan bo 3070 anh trong bank deu o host nay).
           Ban cu chi cho data: nen anh BBT Cloudinary bi cat mat. */
        if (!/^(data:image\/|https:\/\/res\.cloudinary\.com\/)/i.test(src)) { node.removeChild(ch); continue; }
        var ni = doc.createElement('img');
        ni.setAttribute('src', src);
        ni.setAttribute('alt', ch.getAttribute('alt') || 'hình minh họa');
        ni.style.maxWidth = '100%';
        ni.style.height = 'auto';
        ni.style.borderRadius = '8px';
        node.replaceChild(ni, ch);
        continue;
      }
      clean(ch);
      var nn = doc.createElement(tag.toLowerCase());
      while (ch.firstChild) nn.appendChild(ch.firstChild);
      node.replaceChild(nn, ch);
    }
  }
  clean(div);
  return div.innerHTML;
}

/* ---------- Hiển thị câu hỏi / phương án ---------- */
function questionHtml(q) { return q.qHtml || escapeHtml(q.q || ''); }
function optionHtml(q, j) {
  var body = (q.optsHtml && q.optsHtml[j]) || escapeHtml((q.opts || [])[j] || '');
  return '<b>' + 'ABCD'[j] + '.</b> ' + body;
}
function setHTML(el, html) {
  if (!el) return;
  el.innerHTML = sanitizeInline(html);
  renderTeX(el);
}
function setQuestion(el, q) { setHTML(el, questionHtml(q)); }
function setOption(el, q, j) { setHTML(el, optionHtml(q, j)); }

/* ---------- Đọc câu hỏi từ HTML của mammoth, GIỮ ẢNH ---------- */
function stripLeadingMarker(rawHtml, marker) {
  var t = String(rawHtml).replace(/^\s+/, '');
  if (marker && t.indexOf(marker) === 0) return t.slice(marker.length);
  var m = t.match(/^\s*(Câu\s*\d+|Bài\s*\d+)\s*[\.:\)]?\s*/i) || t.match(/^\s*[A-Da-d]\s*[\.\)]\s*/);
  return m ? t.slice(m[0].length) : t;
}
function parseWordQuestionsRich(html) {
  var div = doc.createElement('div');
  div.innerHTML = String(html || '');
  var ps = div.getElementsByTagName('p');
  var qs = [], cur = null, i, p, text, rawHtml, mQ, mO, mA;
  function pushCur() {
    if (cur && cur.q && cur.opts.length === 4 && cur.answer >= 0) qs.push(cur);
    cur = null;
  }
  for (i = 0; i < ps.length; i++) {
    p = ps[i];
    text = p.textContent.replace(/\s+/g, ' ').trim();
    rawHtml = p.innerHTML;
    var hasImg = p.getElementsByTagName('img').length > 0;
    if (!text && !hasImg) continue;
    mQ = text.match(/^(Câu\s*\d+|Bài\s*\d+)\s*[\.:\)]?\s*/i);
    mO = text.match(/^([A-Da-d])\s*[\.\)]\s*/);
    mA = text.match(/Đáp án\s*:\s*([A-Da-d])/i);
    if (mQ) {
      pushCur();
      cur = { q: text.slice(mQ[0].length).trim(),
              qHtml: stripLeadingMarker(rawHtml, mQ[0]),
              opts: [], optsHtml: [], answer: -1 };
    } else if (mO && cur) {
      if (cur.opts.length < 4) {
        cur.opts.push(text.slice(mO[0].length).trim());
        cur.optsHtml.push(stripLeadingMarker(rawHtml, mO[0]));
      }
    } else if (mA && cur) {
      cur.answer = 'ABCD'.indexOf(mA[1].toUpperCase());
    } else if (cur && !cur.q) {
      cur.q = text;
      cur.qHtml = rawHtml;
    } else if (cur && cur.q && hasImg && !text) {
      // ảnh nằm ở đoạn riêng không chữ → gộp vào câu hỏi
      cur.qHtml = (cur.qHtml || '') + rawHtml;
    }
    // đoạn chữ lẻ không thuộc mẫu nào → bỏ qua (tránh nuốt đáp án)
  }
  pushCur();
  return qs;
}
function countImages(qs) {
  var n = 0;
  qs.forEach(function (q) {
    var h = (q.qHtml || '') + ((q.optsHtml || []).join(''));
    n += (h.match(/<img/gi) || []).length;
  });
  return n;
}
/* Bản text gọn để hiện trong ô nhập / lưu trữ */
function questionsToText(qs) {
  return qs.map(function (x) {
    var img = /<img/i.test((x.qHtml || '') + ((x.optsHtml || []).join(''))) ? ' [có ảnh]' : '';
    return x.q + img + '\n' + x.opts.map(function (o, j) { return 'ABCD'[j] + '. ' + o; }).join('\n') +
      '\nĐáp án: ' + 'ABCD'[x.answer];
  }).join('\n\n');
}

/* ---------- Nhập file Word giữ ảnh ---------- */
function importQuestionsFromWord(file, cb) {
  cb = cb || {};
  function noop() {}
  var onOk = cb.onOk || noop, onEmpty = cb.onEmpty || noop,
      onNoLib = cb.onNoLib || noop, onError = cb.onError || noop;
  if (!G.mammoth) { onNoLib(); return; }
  var rd = new FileReader();
  rd.onload = function (e) {
    G.mammoth.convertToHtml({ arrayBuffer: e.target.result }).then(function (res) {
      var qs = parseWordQuestionsRich(res.value);
      if (!qs.length) { onEmpty(); return; }
      onOk(qs);
    }).catch(function () { onError(); });
  };
  rd.onerror = function () { onError(); };
  rd.readAsArrayBuffer(file);
}

/* ---------- Chon cau hoi tu ngan hang Firebase (nganhanggame) ----------
   Nut "📚 Ngân hàng câu hỏi" tu chen canh nut Nhap Word (auto-inject):
   - bancung/bimat_omau: canh #btnImportWord
   - duaxe: canh #btnWord
   - chinhphuc/daovang/haichien/ongtimmat/vuotchuongngaivat: canh label.filebtn chua #fileWord
   - ailatrieuphu: canh #addonBtnQ (nut nhap Word cua addon trong file v9)
   Cau hoi boc duoc dat vao window.RICHQ (giong nhap Word: thay the), roi goi
   rebuildBank() / refreshWordBankInfo() cua game. Dinh dang cau hoi:
   {q, qHtml, opts[4], optsHtml[4], answer, ans, exp, _bank, _id}
   (ca 2 khoa answer + ans de vua bancung/bimat (dung answer) vua cac game
   moi (dung ans). */
function bankToast(msg) {
  if (typeof G.toast === 'function') G.toast(msg);
}

function defaultBankPick(qs, info) {
  /* Game co hook rieng (vd Ai La Trieu Phu): de game tu xu ly. */
  if (typeof G.SmartEduBankOnPick === 'function') { G.SmartEduBankOnPick(qs, info); return; }
  var valid = (qs || []).filter(function (q) {
    return q && q.q && (q.opts || []).length >= 2 &&
      q.answer != null && q.answer >= 0 && q.answer < q.opts.length;
  });
  /* Dat kho vao game: uu tien setRICHQ() cua game (cac game moi boc
     code trong IIFE nen gan window.RICHQ khong toi duoc bien RICHQ
     trong ham); khong co thi gan thang window.RICHQ (bancung/bimat). */
  var api = G.__CHINHPHUC || G.__DAOVANG || G.__DUAXE || G.__HAICHIEN ||
    G.__ONGTIMMAT || G.__VUOTCHUONGNGAIVAT || G.__BCT;
  if (api && typeof api.setRICHQ === 'function') api.setRICHQ(valid);
  else G.RICHQ = valid;
  /* Boc tu ngan hang = THAY THE kho dang choi, khong tron voi cau mau /
     cau go tay (neu khong, boc 3 cau ma tran van toan cau mau): tat cau
     mau (nut #btnToggleDefaults) + xoa o go tay #setQuestions. */
  var tq = doc.getElementById('setQuestions');
  if (tq) tq.value = '';
  var td = doc.getElementById('btnToggleDefaults');
  if (td && td.textContent && td.textContent.indexOf('Xóa câu mẫu') !== -1) td.click();
  if (typeof G.rebuildBank === 'function') G.rebuildBank();
  else if (typeof G.refreshWordBankInfo === 'function') G.refreshWordBankInfo();
  var msg = 'Đã bốc ' + valid.length + ' câu hỏi từ ngân hàng.';
  if (info && info.short && info.short.length) {
    msg += ' Còn thiếu: ' + info.short.map(function (s) { return s.got + '/' + s.want + ' câu'; }).join(', ') +
      ' (ngân hàng không đủ câu mức 1+2).';
  }
  bankToast(msg);
}

function openBankPicker(opts) {
  opts = opts || {};
  var Bank = G.SmartEduBank;
  if (!Bank) { bankToast('Chưa tải được module ngân hàng. Thầy kiểm tra lại file smartedu-bank-client.js.'); return; }
  if (!Bank.ready()) { bankToast(Bank.initError() || 'Chưa kết nối được ngân hàng câu hỏi.'); return; }
  var onPick = opts.onPick || defaultBankPick;
  var old = doc.getElementById('qcBankModal');
  if (old) old.parentNode.removeChild(old);

  var overlay = doc.createElement('div');
  overlay.id = 'qcBankModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
  var card = doc.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:14px;max-width:680px;width:100%;max-height:88vh;overflow:auto;padding:18px 20px;box-sizing:border-box;font-family:inherit;color:#1f2937;box-shadow:0 10px 40px rgba(0,0,0,.35)';
  overlay.appendChild(card);
  card.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h3 style="margin:0;font-size:19px">📚 Ngân hàng câu hỏi</h3>' +
      '<button type="button" id="qcBankClose" style="border:none;background:#f1f5f9;border-radius:8px;width:32px;height:32px;font-size:18px;cursor:pointer">×</button>' +
    '</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">' +
      '<label style="flex:1;min-width:150px;font-size:14px">Môn<br><select id="qcBankSubject" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;margin-top:4px"></select></label>' +
      '<label style="flex:1;min-width:150px;font-size:14px">Lớp<br><select id="qcBankGrade" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;margin-top:4px">' +
        '<option value="">— Chọn lớp —</option><option value="0">Tất cả các lớp</option>' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (n) { return '<option value="' + n + '">Lớp ' + n + '</option>'; }).join('') +
      '</select></label>' +
    '</div>' +
    '<div id="qcBankTopics" style="font-size:14px;color:#475569">Thầy chọn môn và lớp để hiện danh sách chuyên đề nhé.</div>' +
    '<div id="qcBankStatus" style="font-size:13px;color:#64748b;margin-top:8px"></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">' +
      '<span id="qcBankTotal" style="margin-right:auto;align-self:center;font-size:14px;font-weight:600"></span>' +
      '<button type="button" id="qcBankDraw" style="background:#2563eb;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:15px;cursor:pointer">🎲 Bốc câu hỏi</button>' +
      '<button type="button" id="qcBankCancel" style="background:#f1f5f9;border:none;border-radius:9px;padding:10px 16px;font-size:15px;cursor:pointer">Đóng</button>' +
    '</div>';
  doc.body.appendChild(overlay);

  /* Bootstrap giu focus trong modal dang mo (enforceFocus): neu nut mo
     picker nam trong 1 modal Bootstrap (VD modal Cai dat cua Trieu Phu)
     ma de modal mo chong thi o nhap so cau cua picker (nam ngoai modal)
     khong go duoc — cung loi nhu panel roster da gap truoc day. Tam an
     modal chu khi mo picker, mo lai khi dong picker. Game khong co
     modal (VD Hai Chien mo tu tab SOAN) thi khong anh huong gi. */
  var hostModalEl = null, hostModalWasOpen = false;
  try {
    var trig = opts.trigger || null;
    var host = (trig && trig.closest) ? trig.closest('.modal') : null;
    if (!host) host = doc.querySelector('.modal.show');
    if (host && host.classList.contains('show') && typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(host).hide();
      hostModalEl = host; hostModalWasOpen = true;
    }
  } catch (e) {}

  var selSubject = overlay.querySelector('#qcBankSubject');
  var selGrade = overlay.querySelector('#qcBankGrade');
  var boxTopics = overlay.querySelector('#qcBankTopics');
  var elStatus = overlay.querySelector('#qcBankStatus');
  var elTotal = overlay.querySelector('#qcBankTotal');
  var btnDraw = overlay.querySelector('#qcBankDraw');

  Bank.subjects.forEach(function (s) {
    var o = doc.createElement('option');
    o.value = s.id;
    o.textContent = s.name + (s.sheetId ? '' : ' (chưa có ngân hàng)');
    o.disabled = !s.sheetId;
    selSubject.appendChild(o);
  });
  selSubject.value = 'toan';

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (hostModalWasOpen && hostModalEl) {
      hostModalWasOpen = false;
      try { window.bootstrap.Modal.getOrCreateInstance(hostModalEl).show(); } catch (e) {}
    }
  }
  overlay.querySelector('#qcBankClose').onclick = close;
  overlay.querySelector('#qcBankCancel').onclick = close;
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  function updateTotal() {
    var n = 0;
    var inputs = boxTopics.querySelectorAll('input[data-idcd]');
    for (var i = 0; i < inputs.length; i++) n += Math.max(0, parseInt(inputs[i].value, 10) || 0);
    elTotal.textContent = n ? ('Đã chọn: ' + n + ' câu') : '';
  }

  function loadTopics() {
    var subject = selSubject.value;
    var grade = parseInt(selGrade.value, 10);
    if (!subject) { boxTopics.textContent = 'Thầy chọn môn đã nhé.'; return; }
    if (!selGrade.value) { boxTopics.textContent = 'Thầy chọn lớp để hiện danh sách chuyên đề nhé.'; return; }
    boxTopics.textContent = 'Đang tải danh sách chuyên đề...';
    elStatus.textContent = '';
    Bank.listTopics(subject, grade || 0).then(function (topics) {
      if (!topics.length) {
        boxTopics.innerHTML = '<div style="padding:10px 0">Chưa có chuyên đề nào cho lựa chọn này.</div>';
        return;
      }
      var html = '', lastGrade = 0;
      topics.forEach(function (t) {
        if (!grade && t.lop !== lastGrade) {
          lastGrade = t.lop;
          html += '<div style="font-weight:700;margin:12px 0 4px;color:#0f172a">Lớp ' + t.lop + '</div>';
        }
        var max = t.mcqAB || 0;
        /* O nhap dang text + inputmode numeric (khong dung type=number):
           tren dien thoai o number trong khung co dinh thuong khong bat
           duoc ban phim (bam vao chi tang/giam duoc). Nut - / + tu lam
           de giu duoc tang giam bang chuot. */
        html += '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f1f5f9">' +
          '<span style="flex:1">' + escapeHtml(t.name || t.idcd) +
          ' <small style="color:#64748b">(có ' + max + ' câu mức 1+2)</small></span>' +
          '<span style="display:inline-flex;align-items:center;gap:3px;flex:none">' +
          '<button type="button" class="qcBankStep" data-step="-1" data-idcd="' + escapeHtml(String(t.idcd)) + '" style="width:28px;height:30px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;font-size:16px;line-height:1;cursor:pointer"' + (max ? '' : ' disabled') + '>−</button>' +
          '<input type="text" inputmode="numeric" autocomplete="off" data-idcd="' + escapeHtml(String(t.idcd)) + '" data-max="' + max + '" value="0" ' +
          'style="width:52px;padding:6px 2px;border:1px solid #cbd5e1;border-radius:7px;text-align:center"' + (max ? '' : ' disabled') + '>' +
          '<button type="button" class="qcBankStep" data-step="1" data-idcd="' + escapeHtml(String(t.idcd)) + '" style="width:28px;height:30px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;font-size:16px;line-height:1;cursor:pointer"' + (max ? '' : ' disabled') + '>+</button></span>' +
          '</div>';
      });
      boxTopics.innerHTML = html;
      var inputs = boxTopics.querySelectorAll('input[data-idcd]');
      for (var i = 0; i < inputs.length; i++) {
        /* Go "012" thi cat so 0 thua o dau thanh "12" (o mac dinh la "0"
           nen go them so se dinh "0" o truoc); chi giu ky so. */
        inputs[i].addEventListener('input', function () {
          var digits = String(this.value).replace(/[^0-9]/g, '');
          if (digits !== this.value) this.value = digits;
          var mx = parseInt(this.getAttribute('data-max'), 10) || 0;
          var v = parseInt(this.value, 10) || 0;
          if (v > mx) { this.value = mx; v = mx; }
          if (v < 0) { this.value = 0; v = 0; }
          if (v > 0) this.value = v;
          updateTotal();
        });
      }
      var steps = boxTopics.querySelectorAll('button.qcBankStep');
      for (var j = 0; j < steps.length; j++) {
        steps[j].addEventListener('click', function () {
          var inp = boxTopics.querySelector('input[data-idcd="' + this.getAttribute('data-idcd') + '"]');
          if (!inp || inp.disabled) return;
          var mx = parseInt(inp.getAttribute('data-max'), 10) || 0;
          var v = (parseInt(inp.value, 10) || 0) + parseInt(this.getAttribute('data-step'), 10);
          if (v > mx) v = mx;
          if (v < 0) v = 0;
          inp.value = v;
          updateTotal();
        });
      }
      updateTotal();
    }).catch(function (err) {
      boxTopics.textContent = 'Không tải được chuyên đề: ' + (err && err.message ? err.message : err);
    });
  }
  selSubject.addEventListener('change', loadTopics);
  selGrade.addEventListener('change', loadTopics);

  btnDraw.onclick = function () {
    var picks = [];
    var inputs = boxTopics.querySelectorAll('input[data-idcd]');
    for (var i = 0; i < inputs.length; i++) {
      var c = parseInt(inputs[i].value, 10) || 0;
      if (c > 0) picks.push({ idcd: inputs[i].getAttribute('data-idcd'), count: c });
    }
    if (!picks.length) { elStatus.textContent = 'Thầy nhập số câu cho ít nhất 1 chuyên đề nhé.'; return; }
    btnDraw.disabled = true;
    btnDraw.textContent = 'Đang bốc...';
    elStatus.textContent = 'Đang bốc câu hỏi từ ngân hàng...';
    Bank.drawMany(selSubject.value, picks).then(function (res) {
      close();
      onPick(res.questions, { short: res.short, got: res.got });
    }).catch(function (err) {
      btnDraw.disabled = false;
      btnDraw.textContent = '🎲 Bốc câu hỏi';
      elStatus.textContent = 'Lỗi bốc câu hỏi: ' + (err && err.message ? err.message : err);
    });
  };
}

/* Tu chen nut "Ngân hàng câu hỏi" canh nut Nhap Word (chay ca khi man hinh
   cai dat duoc game ve bang JS sau). */
function injectBankButton() {
  if (!doc || doc.getElementById('btnBankQuestions')) return true;
  var anchor = doc.getElementById('btnImportWord') || doc.getElementById('btnWord') || doc.getElementById('addonBtnQ');
  var target = anchor;
  if (!target) {
    var fw = doc.getElementById('fileWord');
    if (fw && fw.parentElement && fw.parentElement.tagName === 'LABEL') target = fw.parentElement;
  }
  if (!target || !target.parentNode) return false;
  var btn = doc.createElement('button');
  btn.id = 'btnBankQuestions';
  btn.type = 'button';
  btn.className = anchor ? anchor.className : 'btn blue';
  btn.textContent = '📚 Ngân hàng câu hỏi';
  btn.style.marginLeft = '8px';
  btn.onclick = function () { openBankPicker({ trigger: btn }); };
  target.parentNode.insertBefore(btn, target.nextSibling);
  return true;
}
function startBankInject() {
  if (injectBankButton()) return;
  if (typeof MutationObserver === 'undefined') return;
  var ob = new MutationObserver(function () { if (injectBankButton()) ob.disconnect(); });
  ob.observe(doc.documentElement, { childList: true, subtree: true });
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', startBankInject);
else startBankInject();

/* =====================================================================
   MHEdu — HỆ THỐNG GIỌNG ĐỌC AI TOÀN DIỆN CHO TẤT CẢ TRÒ CHƠI
   Tác giả: Thầy Nguyễn Mạnh Hùng - 0965.908.084
   Tự động nhận diện câu hỏi và đọc to bằng AI Tiếng Việt chuẩn hóa.
   ===================================================================== */
(function initMheduUniversalAiVoice() {
  if (typeof window === 'undefined') return;

  // 1. Tự động tải smartedu-ai-voice.js nếu chưa có
  if (!window.MHEDU_AI_VOICE) {
    var script = doc.createElement('script');
    script.src = '../smartedu-ai-voice.js';
    script.async = true;
    doc.head.appendChild(script);
  }

  var isAutoVoice = true;
  try {
    var saved = localStorage.getItem('mhedu_auto_ai_voice');
    if (saved !== null) isAutoVoice = saved === 'true';
  } catch (e) {}

  var lastSpokenText = '';
  var currentQuestionData = null;

  // 2. Chèn CSS cho Widget Giọng Đọc AI gọn gàng, thu gọn được, không che nút game
  var style = doc.createElement('style');
  style.id = 'mhedu-universal-ai-voice-style';
  style.textContent = `
    .mhedu-ai-voice-floating {
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 2147483600;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(6, 78, 59, 0.88);
      backdrop-filter: blur(8px);
      border: 1.5px solid #10b981;
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 3px 14px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .mhedu-ai-voice-floating.collapsed .mhedu-voice-extra {
      display: none !important;
    }
    .mhedu-ai-voice-floating.collapsed {
      padding: 4px 8px;
      opacity: 0.82;
    }
    .mhedu-ai-voice-floating:hover {
      opacity: 1;
      box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4);
    }
    .mhedu-voice-btn-speak {
      background: #059669;
      color: #ffffff;
      border: none;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .mhedu-voice-btn-speak:hover {
      background: #10b981;
    }
    .mhedu-voice-btn-speak.speaking {
      background: #e11d48 !important;
      animation: mheduPulse 1s infinite alternate;
    }
    @keyframes mheduPulse {
      from { box-shadow: 0 0 4px #e11d48; }
      to { box-shadow: 0 0 14px #fb7185; }
    }
    .mhedu-voice-label-auto {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #a7f3d0;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      margin: 0;
      white-space: nowrap;
    }
    .mhedu-voice-label-auto input {
      accent-color: #10b981;
      cursor: pointer;
      margin: 0;
    }
    .mhedu-voice-btn-stop {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid #f87171;
      border-radius: 999px;
      padding: 2px 7px;
      font-size: 10.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mhedu-voice-btn-stop:hover {
      background: #ef4444;
      color: #ffffff;
    }
    .mhedu-voice-btn-toggle {
      background: transparent;
      color: #a7f3d0;
      border: none;
      font-size: 12px;
      cursor: pointer;
      padding: 0 3px;
      line-height: 1;
    }
    .mhedu-voice-btn-toggle:hover {
      color: #ffffff;
    }
  `;
  doc.head.appendChild(style);

  // 3. Tạo thanh điều khiển nổi trên màn hình
  function createFloatingVoiceWidget() {
    // ailatrieuphu đã có thanh công cụ chuyên biệt phía trên câu hỏi
    if (window.location && window.location.pathname.indexOf('ailatrieuphu') !== -1) return;
    if (doc.getElementById('mhedu-ai-voice-floating-bar') || doc.getElementById('mhedu-ai-voice-bar')) return;

    var bar = doc.createElement('div');
    bar.id = 'mhedu-ai-voice-floating-bar';
    bar.className = 'mhedu-ai-voice-floating';
    bar.innerHTML = `
      <button type="button" class="mhedu-voice-btn-speak" id="mheduVoiceSpeakBtn" title="Đọc câu hỏi bằng AI">
        <span>🔊</span>
        <span id="mheduVoiceSpeakTxt">AI Đọc</span>
      </button>
      <label class="mhedu-voice-label-auto mhedu-voice-extra" title="Tự động đọc to khi sang câu hỏi mới">
        <input type="checkbox" id="mheduVoiceAutoChk" ${isAutoVoice ? 'checked' : ''}>
        <span>Tự động</span>
      </label>
      <button type="button" class="mhedu-voice-btn-stop mhedu-voice-extra" id="mheduVoiceStopBtn" title="Dừng đọc ngay">⏹️</button>
      <button type="button" class="mhedu-voice-btn-toggle" id="mheduVoiceCollapseBtn" title="Thu gọn / Mở rộng">➖</button>
    `;

    doc.body.appendChild(bar);

    var btnSpeak = doc.getElementById('mheduVoiceSpeakBtn');
    var chkAuto = doc.getElementById('mheduVoiceAutoChk');
    var btnStop = doc.getElementById('mheduVoiceStopBtn');
    var btnCollapse = doc.getElementById('mheduVoiceCollapseBtn');

    if (btnCollapse) {
      btnCollapse.onclick = function (e) {
        e.preventDefault();
        var isCol = bar.classList.toggle('collapsed');
        btnCollapse.textContent = isCol ? '➕' : '➖';
      };
    }

    if (btnSpeak) {
      btnSpeak.onclick = function (e) {
        e.preventDefault();
        if (window.MHEDU_AI_VOICE && window.MHEDU_AI_VOICE.speaking) {
          window.MHEDU_AI_VOICE.stop();
          updateButtonSpeakingState(false);
        } else {
          readActiveQuestion(true);
        }
      };
    }

    if (chkAuto) {
      chkAuto.onchange = function () {
        isAutoVoice = chkAuto.checked;
        if (window.MHEDU_AI_VOICE) window.MHEDU_AI_VOICE.autoRead = isAutoVoice;
        try { localStorage.setItem('mhedu_auto_ai_voice', isAutoVoice ? 'true' : 'false'); } catch (e) {}
      };
    }

    if (btnStop) {
      btnStop.onclick = function (e) {
        e.preventDefault();
        if (window.MHEDU_AI_VOICE) window.MHEDU_AI_VOICE.stop();
        updateButtonSpeakingState(false);
      };
    }
  }

  function updateButtonSpeakingState(speaking) {
    var btn = doc.getElementById('mheduVoiceSpeakBtn');
    var txt = doc.getElementById('mheduVoiceSpeakTxt');
    if (btn && txt) {
      if (speaking) {
        btn.classList.add('speaking');
        txt.textContent = 'Đang đọc...';
      } else {
        btn.classList.remove('speaking');
        txt.textContent = 'AI Đọc';
      }
    }
  }

  // 4. Tìm và trích xuất câu hỏi + 4 đáp án trên giao diện hiện tại
  function extractActiveQuestion() {
    // 1) Nếu có dữ liệu từ setQuestion gần nhất
    if (currentQuestionData && currentQuestionData.q) {
      return {
        q: currentQuestionData.q,
        opts: currentQuestionData.opts || []
      };
    }

    // 2) Quét các selector phổ biến trong mọi game
    var qSelectors = [
      '#qText', '#question', '.question-text', '#question_content',
      '.st-question-text', '#q-text', '.q-body', '.card-question',
      '.wpqg-question', '#questionArea', '#questionDisplay', '.question-box'
    ];
    var qEl = null;
    for (var i = 0; i < qSelectors.length; i++) {
      var found = doc.querySelector(qSelectors[i]);
      if (found && found.innerText && found.innerText.trim().length > 3) {
        qEl = found;
        break;
      }
    }
    if (!qEl) return null;

    var qText = qEl.innerText.trim();

    // Quét các đáp án
    var optSelectors = [
      '.opt-btn', '.ans-btn', '.choice-btn', '.btn-opt', '.option-btn',
      '.st-answer-text', '.answer-item', '.choice-item', '.opt', '.option'
    ];
    var opts = [];
    for (var j = 0; j < optSelectors.length; j++) {
      var optNodes = doc.querySelectorAll(optSelectors[j]);
      if (optNodes && optNodes.length >= 2) {
        optNodes.forEach(function (n) {
          var t = n.innerText.trim();
          if (t && t.length > 0) opts.push(t);
        });
        break;
      }
    }

    // Nếu không tìm thấy bằng class, thử quét thẻ ans_0..ans_3 hoặc opt_0..opt_3
    if (!opts.length) {
      for (var k = 0; k < 4; k++) {
        var el = doc.getElementById('ans_' + k) || doc.getElementById('opt_' + k);
        if (el && el.innerText.trim()) opts.push(el.innerText.trim());
      }
    }

    return { q: qText, opts: opts };
  }

  // 5. Đọc to câu hỏi bằng AI
  function readActiveQuestion(force) {
    var data = extractActiveQuestion();
    if (!data || !data.q) return;

    var textKey = data.q + '|' + (data.opts || []).join('|');
    if (!force && !isAutoVoice) return;
    if (!force && textKey === lastSpokenText) return;

    lastSpokenText = textKey;

    if (window.MHEDU_AI_VOICE) {
      updateButtonSpeakingState(true);
      window.MHEDU_AI_VOICE.speakQuiz(data.q, data.opts);
      var interval = setInterval(function () {
        if (!window.MHEDU_AI_VOICE.speaking) {
          clearInterval(interval);
          updateButtonSpeakingState(false);
        }
      }, 400);
    }
  }

  // Hook setQuestion để tự động bắt dữ liệu câu hỏi
  var originalSetQuestion = setQuestion;
  setQuestion = function (el, q) {
    currentQuestionData = q;
    originalSetQuestion(el, q);
    setTimeout(function () {
      readActiveQuestion(false);
    }, 400);
  };

  // Giám sát DOM thay đổi câu hỏi
  function watchDOM() {
    createFloatingVoiceWidget();
    var observer = new MutationObserver(function () {
      createFloatingVoiceWidget();
      // Nếu có màn chơi đang mở, thử nhận diện câu hỏi
      setTimeout(function () {
        readActiveQuestion(false);
      }, 500);
    });
    observer.observe(doc.body || doc.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', watchDOM);
  } else {
    watchDOM();
  }
})();

G.QuizCommon = {
  renderTeX: renderTeX,
  sanitizeInline: sanitizeInline,
  setHTML: setHTML,
  setQuestion: setQuestion,
  setOption: setOption,
  questionHtml: questionHtml,
  optionHtml: optionHtml,
  parseWordQuestionsRich: parseWordQuestionsRich,
  countImages: countImages,
  questionsToText: questionsToText,
  importQuestionsFromWord: importQuestionsFromWord,
  escapeHtml: escapeHtml,
  openBankPicker: openBankPicker,
  hasKaTeX: function () { return !!(G && G.katex); }
};
})(typeof window !== 'undefined' ? window : this);
