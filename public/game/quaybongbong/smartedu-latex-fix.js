/* =====================================================================
   SmartEdu — Bộ chuyển đổi LaTeX (MathType / Word) → chuẩn MathJax
   File: smartedu-latex-fix.js
   Đặt file này CÙNG THƯ MỤC với file game khi triển khai; game tự nạp
   qua thẻ <script src="smartedu-latex-fix.js"></script> ở cuối trang.
   Nếu thiếu file này, game vẫn chạy bình thường (chỉ không có chuẩn hoá).

   Vì sao cần: khi nhập câu hỏi từ file Word, các dấu > và < trong công
   thức bị mã hoá thành &gt; và &lt;. MathJax gặp ký tự & sẽ báo lỗi
   "Misplaced &" khiến công thức không hiện — dù mã LaTeX hoàn toàn đúng.
   Văn bản chép từ MathType/Word còn lẫn ký tự vô hình (zero-width),
   dấu trừ Unicode, khoảng trắng cứng... Bộ chuyển đổi này sửa ngay khi
   nhập câu hỏi, đồng thời tự sửa cả ngân hàng câu hỏi ĐÃ LƯU trong máy
   nên thầy cô không phải nhập lại.
   ===================================================================== */
(function () {
  'use strict';

  /* --- 1) Giải mã thực thể HTML: &gt; → >, &lt; → <, &amp; → & ... --- */
  function decodeEntities(s) {
    return String(s == null ? '' : s)
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#0?39;|&apos;/gi, "'")
      .replace(/&amp;/gi, '&');
  }

  /* --- 2) Chuẩn hoá bên trong một đoạn công thức $...$ --- */
  function fixMathSegment(seg) {
    return seg
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')   // ký tự vô hình (zero-width, BOM) lẫn từ Word/MathType
      .replace(/\u2212/g, '-')                      // dấu trừ Unicode (U+2212) → -
      .replace(/\u00A0/g, ' ')                      // khoảng trắng cứng (U+00A0) → thường
      .replace(/[\u2018\u2019]/g, "'")             // nháy đơn cong → thẳng
      .replace("dfrac", "frac")  
      .replace(/[\u201C\u201D]/g, '"');
  }

  /* --- 3) Hàm chính: chuẩn hoá một chuỗi văn bản có chứa công thức --- */
  function normalizeLatexForMathJax(s) {
    if (s == null) return s;
    var t = decodeEntities(String(s));
    t = t.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\\([\s\S]+?\\\)/g, function (m) { return fixMathSegment(m); });
    return t;
  }
  window.normalizeLatexForMathJax = normalizeLatexForMathJax;

  /* --- 4) Áp lên một câu hỏi: đề bài, các phương án, các mệnh đề, đáp án --- */
  function fixQuestion(q) {
    if (!q || typeof q !== 'object') return false;
    var changed = false;
    function apply(obj, key) {
      if (obj && typeof obj[key] === 'string') {
        var v = normalizeLatexForMathJax(obj[key]);
        if (v !== obj[key]) { obj[key] = v; changed = true; }
      }
    }
    apply(q, 'q'); apply(q, 'answer');
    if (Array.isArray(q.opts)) q.opts.forEach(function (o) { apply(o, 't'); });
    if (Array.isArray(q.statements)) q.statements.forEach(function (st) { apply(st, 't'); });
    return changed;
  }
  window.fixLatexQuestion = fixQuestion;

  /* --- 5) Bọc hàm nhập Word của game: câu hỏi mới nhập được sửa ngay --- */
  try {
    if (typeof parseWord === 'function') {
      var _parseWord = parseWord;
      parseWord = async function (buf) {
        var qs = await _parseWord(buf);
        if (Array.isArray(qs)) qs.forEach(fixQuestion);
        return qs;
      };
    }
  } catch (e) {}

  /* --- 6) Tự sửa ngân hàng câu hỏi đã lưu trong máy (khỏi nhập lại) --- */
  function fixSavedBank() {
    try {
      if (typeof S === 'undefined' || !S || !Array.isArray(S.questions)) return;
      var changed = 0;
      S.questions.forEach(function (q) { if (fixQuestion(q)) changed++; });
      if (changed && typeof save === 'function') save();
    } catch (e) {}
  }
  window.fixSavedLatexBank = fixSavedBank;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixSavedBank);
  else fixSavedBank();
  setTimeout(fixSavedBank, 1000); // chạy lại một lần cho chắc nếu game nạp dữ liệu chậm

  /* --- 7) Bảng kết quả: đáp án có công thức thì render bằng MathJax
         thay vì hiện nguyên mã LaTeX thô --- */
  try {
    if (typeof showFlash === 'function' && typeof esc === 'function') {
      var _showFlash = showFlash;
      showFlash = function (ok, msg, detail) {
        _showFlash(ok, msg, detail);
        try {
          var d = document.getElementById('flashDetail');
          if (d && detail && String(detail).indexOf('$') >= 0) {
            d.innerHTML = esc(detail);
            if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([d]).catch(function () {});
          }
        } catch (e) {}
      };
    }
  } catch (e) {}
})();
