/* 📤 NHẬP ĐỀ CỦA GIÁO VIÊN TỪ TỆP WORD (.docx) THEO MẪU CỦA WEB + đọc danh sách lớp từ Excel (.xlsx)
 * - Đọc .docx ngay trên trình duyệt (không gửi tệp đi đâu): chữ, công thức Equation của Word (đổi sang LaTeX), hình ảnh, gạch chân đáp án.
 * - Công thức MathType (đối tượng OLE) không đọc được: báo để thầy cô chuyển sang Equation (MathType › Convert Equations) hoặc gõ $...$.
 * - Phân tích theo mẫu: PHẦN I/II/III/IV, "Câu n.", A. B. C. D., a) b) c) d), "Đáp án:", "Lời giải:", "Hướng dẫn chấm:".
 */
(function (G) {
  'use strict';
  // ------------------------------------------------------------ đọc tệp zip (docx, xlsx)
  function u16(b, o) { return b[o] | b[o + 1] << 8; }
  function u32(b, o) { return (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0; }
  function giaiNen(du) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('Trình duyệt này chưa đọc được tệp nén — dùng Chrome, Edge hoặc Safari mới.'));
    var s = new Blob([du]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(s).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function docZip(buf) {
    var b = new Uint8Array(buf), e = -1;
    for (var i = b.length - 22; i >= Math.max(0, b.length - 70000); i--) if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 5 && b[i + 3] === 6) { e = i; break; }
    if (e < 0) return Promise.reject(new Error('Tệp không phải Word/Excel (.docx/.xlsx) hợp lệ. Nếu là .doc cũ, thầy cô mở bằng Word rồi Lưu thành .docx.'));
    var n = u16(b, e + 10), o = u32(b, e + 16), td = new TextDecoder(), tep = {}, viec = [];
    for (var k = 0; k < n; k++) {
      var cach = u16(b, o + 10), nen = u32(b, o + 20), lenTen = u16(b, o + 28), lenPhu = u16(b, o + 30), lenGhi = u16(b, o + 32), dauCuc = u32(b, o + 42);
      var ten = td.decode(b.subarray(o + 46, o + 46 + lenTen));
      (function (ten, cach, nen, dauCuc) {
        var bd = dauCuc + 30 + u16(b, dauCuc + 26) + u16(b, dauCuc + 28), du = b.subarray(bd, bd + nen);
        viec.push((cach === 0 ? Promise.resolve(du) : giaiNen(du)).then(function (x) { tep[ten] = x; }));
      })(ten, cach, nen, dauCuc);
      o += 46 + lenTen + lenPhu + lenGhi;
    }
    return Promise.all(viec).then(function () { return tep; });
  }
  var td8 = new TextDecoder();
  function xml(u) { return new DOMParser().parseFromString(td8.decode(u), 'application/xml'); }
  function con(n) { return Array.prototype.filter.call(n.childNodes, function (c) { return c.nodeType === 1; }); }
  function ten(n) { return n.localName; }
  function tim(n, t) { return con(n).filter(function (c) { return ten(c) === t; })[0]; }
  function thuoc(n, t, at) { var c = tim(n, t); if (!c) return null; for (var i = 0; i < c.attributes.length; i++) if (c.attributes[i].localName === (at || 'val')) return c.attributes[i].value; return ''; }

  // ------------------------------------------------------------ công thức Word (OMML) -> LaTeX
  var KI = { '≤': '\\le ', '≥': '\\ge ', '≠': '\\ne ', '±': '\\pm ', '∓': '\\mp ', '×': '\\times ', '÷': '\\div ', '·': '\\cdot ', '⋅': '\\cdot ', '∙': '\\cdot ', '∞': '\\infty ', '→': '\\to ', '⇒': '\\Rightarrow ', '⇔': '\\Leftrightarrow ', '⟺': '\\Leftrightarrow ', '⟹': '\\Rightarrow ',
    '∈': '\\in ', '∉': '\\notin ', '⊂': '\\subset ', '⊃': '\\supset ', '⊆': '\\subseteq ', '⊇': '\\supseteq ', '⊄': '\\not\\subset ', '∪': '\\cup ', '∩': '\\cap ', '∅': '\\varnothing ', '∀': '\\forall ', '∃': '\\exists ', '∖': '\\setminus ',
    'π': '\\pi ', 'α': '\\alpha ', 'β': '\\beta ', 'γ': '\\gamma ', 'δ': '\\delta ', 'Δ': '\\Delta ', 'ε': '\\varepsilon ', 'φ': '\\varphi ', 'ϕ': '\\phi ', 'θ': '\\theta ', 'λ': '\\lambda ', 'μ': '\\mu ', 'ρ': '\\rho ', 'σ': '\\sigma ', 'Σ': '\\Sigma ', 'ω': '\\omega ', 'Ω': '\\Omega ', 'τ': '\\tau ', 'η': '\\eta ', 'ξ': '\\xi ', 'ψ': '\\psi ',
    '°': '^\\circ ', '∠': '\\angle ', '△': '\\triangle ', '∆': '\\Delta ', '⊥': '\\perp ', '∥': '\\parallel ', '//': '\\parallel ', '≈': '\\approx ', '≡': '\\equiv ', '∼': '\\sim ', '≅': '\\cong ', '−': '-', '…': '\\ldots ', '⋯': '\\cdots ', '′': "'", '″': "''",
    'ℝ': '\\mathbb{R}', 'ℕ': '\\mathbb{N}', 'ℤ': '\\mathbb{Z}', 'ℚ': '\\mathbb{Q}', 'ℂ': '\\mathbb{C}', '{': '\\{', '}': '\\}', '%': '\\%', '#': '\\#', '&': '\\&', '∫': '\\int ', '∑': '\\sum ', '∏': '\\prod ', '√': '\\sqrt{}', '⃗': '' };
  var HAM = ['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lim', 'exp', 'max', 'min', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh'];
  function chuSo(s, thuong) {   // chữ trong công thức
    s = String(s).replace(/[⁡-⁤​‌‍﻿]/g, '');
    if (thuong && /[^\x00-\x7f]/.test(s) && /[a-zA-ZÀ-ỹ]/.test(s) && !/^[α-ωΑ-Ω∈∉⊂≤≥≠±×÷·∞→⇒⇔∪∩∅∀∃π°∠⊥∥≈ℝℕℤℚ−\s\d+\-=()<>|.,;:/]*$/.test(s)) return '\\text{' + s.replace(/[{}]/g, '') + '}';
    var o = '';
    for (var i = 0; i < s.length; i++) { var c = s[i]; o += KI[c] != null ? KI[c] : c; }
    HAM.forEach(function (h) { o = o.replace(new RegExp('(^|[^a-zA-Z\\\\])' + h + '(?![a-zA-Z])', 'g'), '$1\\' + h + ' '); });
    return o;
  }
  function nhom(s) { s = String(s).trim(); return s.length === 1 ? s : '{' + s + '}'; }
  function ngoac(c, dau) {
    if (c === '' || c == null) return dau ? '\\left.' : '\\right.';
    var m = { '(': '(', ')': ')', '[': '[', ']': ']', '{': '\\{', '}': '\\}', '|': '|', '‖': '\\|', '⟨': '\\langle ', '⟩': '\\rangle ', '⌊': '\\lfloor ', '⌋': '\\rfloor ', '⌈': '\\lceil ', '⌉': '\\rceil ' };
    return (dau ? '\\left' : '\\right') + (m[c] || c);
  }
  function om(n) {
    var t = ten(n), e = function (k) { var c = tim(n, k); return c ? omCon(c) : ''; };
    switch (t) {
      case 'r': { var tt = con(n).filter(function (c) { return ten(c) === 't'; }).map(function (c) { return c.textContent; }).join(''); var rp = tim(n, 'rPr'); return chuSo(tt, rp && tim(rp, 'nor')); }
      case 'f': { var lin = thuoc(tim(n, 'fPr') || n, 'type'); return lin === 'lin' ? e('num') + '/' + e('den') : '\\dfrac{' + e('num') + '}{' + e('den') + '}'; }
      case 'sSup': return nhom(e('e')) + '^' + nhom(e('sup'));
      case 'sSub': return nhom(e('e')) + '_' + nhom(e('sub'));
      case 'sSubSup': return nhom(e('e')) + '_' + nhom(e('sub')) + '^' + nhom(e('sup'));
      case 'sPre': return '{}_' + nhom(e('sub')) + '^' + nhom(e('sup')) + e('e');
      case 'rad': { var dg = e('deg').trim(); return '\\sqrt' + (dg ? '[' + dg + ']' : '') + '{' + e('e') + '}'; }
      case 'd': {
        var pr = tim(n, 'dPr'), bc = pr && tim(pr, 'begChr') ? thuoc(pr, 'begChr') : '(', ec = pr && tim(pr, 'endChr') ? thuoc(pr, 'endChr') : ')', sc = pr && tim(pr, 'sepChr') ? thuoc(pr, 'sepChr') : '|';
        var es = con(n).filter(function (c) { return ten(c) === 'e'; }).map(omCon);
        return ngoac(bc, true) + es.join(sc === '|' ? ' \\mid ' : sc) + ngoac(ec, false);
      }
      case 'nary': {
        var pr2 = tim(n, 'naryPr'), ch = pr2 && tim(pr2, 'chr') ? thuoc(pr2, 'chr') : '∫', op = { '∑': '\\sum', '∏': '\\prod', '∫': '\\int', '∬': '\\iint', '∮': '\\oint', '⋃': '\\bigcup', '⋂': '\\bigcap' }[ch] || '\\int';
        var sb = e('sub').trim(), sp = e('sup').trim();
        return op + (sb ? '_' + nhom(sb) : '') + (sp ? '^' + nhom(sp) : '') + ' ' + e('e');
      }
      case 'func': { var fn = e('fName').trim(); if (!/^\\/.test(fn) && HAM.indexOf(fn) >= 0) fn = '\\' + fn; return fn + ' ' + e('e'); }
      case 'limLow': { var bs = e('e').trim(); return (/^\\?lim$/.test(bs.replace(/\s/g, '')) ? '\\lim' : '\\underset{' + e('lim') + '}{' + bs + '}') + (/lim/.test(bs) ? '_{' + e('lim') + '}' : ''); }
      case 'limUpp': return '\\overset{' + e('lim') + '}{' + e('e') + '}';
      case 'acc': { var pa = tim(n, 'accPr'), ac = pa && tim(pa, 'chr') ? thuoc(pa, 'chr') : '̂'; var lenh = { '⃗': '\\overrightarrow', '→': '\\overrightarrow', '̂': '\\hat', '^': '\\hat', '̄': '\\overline', '¯': '\\overline', '̇': '\\dot', '̃': '\\tilde', '⃖': '\\overleftarrow', '⃡': '\\overleftrightarrow' }[ac] || '\\hat'; return lenh + '{' + e('e') + '}'; }
      case 'bar': { var pb = tim(n, 'barPr'); return (pb && thuoc(pb, 'pos') === 'bot' ? '\\underline{' : '\\overline{') + e('e') + '}'; }
      case 'groupChr': { var pg = tim(n, 'groupChrPr'), gc = pg && tim(pg, 'chr') ? thuoc(pg, 'chr') : '⏟'; return (gc === '⏞' ? '\\overbrace{' : gc === '⏟' ? '\\underbrace{' : '{') + e('e') + '}'; }
      case 'eqArr': return '\\begin{array}{l}' + con(n).filter(function (c) { return ten(c) === 'e'; }).map(omCon).join(' \\\\ ') + '\\end{array}';
      case 'm': return '\\begin{matrix}' + con(n).filter(function (c) { return ten(c) === 'mr'; }).map(function (r) { return con(r).filter(function (c) { return ten(c) === 'e'; }).map(omCon).join(' & '); }).join(' \\\\ ') + '\\end{matrix}';
      case 'box': case 'borderBox': case 'phant': return e('e');
      case 'rPr': case 'fPr': case 'dPr': case 'naryPr': case 'ctrlPr': case 'radPr': case 'sSupPr': case 'sSubPr': case 'funcPr': case 'accPr': case 'barPr': case 'eqArrPr': case 'mPr': case 'limLowPr': case 'limUppPr': case 'groupChrPr': case 'sSubSupPr': case 'boxPr': case 'oMathParaPr': return '';
      default: return omCon(n);
    }
  }
  function omCon(n) { return con(n).map(om).join(''); }
  function omSangTex(n) { return omCon(n).replace(/\s+/g, ' ').replace(/\\left\(\s*\\right\)/g, '()').trim(); }

  // ------------------------------------------------------------ docx -> các dòng chữ (công thức thành $...$)
  var DAU_GACH = '\u0005', CUOI_GACH = '\u0006';
  function docDocx(file) {
    return file.arrayBuffer().then(docZip).then(function (tep) {
      if (!tep['word/document.xml']) throw new Error('Không thấy nội dung Word trong tệp.');
      var doc = xml(tep['word/document.xml']), rels = {}, anh = {}, canhBao = [], soOle = 0, soAnhLoi = 0;
      if (tep['word/_rels/document.xml.rels']) Array.prototype.forEach.call(xml(tep['word/_rels/document.xml.rels']).getElementsByTagName('Relationship'), function (r) { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
      var dongs = [], viecAnh = [];
      var layAnh = function (rid) {
        var tg = rels[rid]; if (!tg) return '';
        var duong = 'word/' + tg.replace(/^\.?\//, '').replace(/^word\//, ''), u = tep[duong];
        if (!u) return '';
        var duoi = (duong.split('.').pop() || '').toLowerCase(), mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp' }[duoi];
        if (!mime) { soAnhLoi++; return ''; }
        var id = 'a' + Object.keys(anh).length; anh[id] = null;
        viecAnh.push(anhGon(u, mime).then(function (x) { anh[id] = x; }, function () { soAnhLoi++; }));
        return '\u0002' + id + '\u0002';
      };
      var docRun = function (r) {
        var s = '', rp = tim(r, 'rPr'), gach = rp && tim(rp, 'u') && thuoc(rp, 'u') !== 'none';
        con(r).forEach(function (c) {
          var t = ten(c);
          if (t === 't') s += c.textContent;
          else if (t === 'tab') s += '\t';
          else if (t === 'br' || t === 'cr') s += '\n';
          else if (t === 'drawing' || t === 'pict') Array.prototype.forEach.call(c.getElementsByTagName('*'), function (x) { if (x.localName === 'blip' || x.localName === 'imagedata') { var id = x.getAttribute('r:embed') || x.getAttribute('r:id'); if (id) s += layAnh(id); } });
          else if (t === 'object') { soOle++; s += '[[công thức MathType]]'; }
        });
        return gach && s.trim() ? DAU_GACH + s + CUOI_GACH : s;
      };
      var docDoan = function (p) {
        var s = '';
        var di = function (n) {
          con(n).forEach(function (c) {
            var t = ten(c);
            if (t === 'r') s += docRun(c);
            else if (t === 'oMath') s += '$' + omSangTex(c) + '$';
            else if (t === 'oMathPara') con(c).filter(function (x) { return ten(x) === 'oMath'; }).forEach(function (x) { s += '$' + omSangTex(x) + '$ '; });
            else if (t === 'hyperlink' || t === 'smartTag' || t === 'ins' || t === 'sdtContent' || t === 'fldSimple') di(c);
            else if (t === 'sdt') { var sc = tim(c, 'sdtContent'); if (sc) di(sc); }
          });
        };
        di(p); return s;
      };
      var duyet = function (n) {
        con(n).forEach(function (c) {
          var t = ten(c);
          if (t === 'p') dongs.push.apply(dongs, docDoan(c).split('\n'));
          else if (t === 'tbl') con(c).filter(function (r) { return ten(r) === 'tr'; }).forEach(function (r) { con(r).filter(function (x) { return ten(x) === 'tc'; }).forEach(function (tc) { duyet(tc); }); });
          else if (t === 'sdt') { var sc = tim(c, 'sdtContent'); if (sc) duyet(sc); }
        });
      };
      duyet(doc.getElementsByTagNameNS('*', 'body')[0] || doc.documentElement);
      return Promise.all(viecAnh).then(function () {
        if (soOle) canhBao.push('Có ' + soOle + ' công thức MathType/đối tượng nhúng không đọc được (đã đánh dấu [[công thức MathType]]). Trong Word: MathType › Convert Equations › chọn "Word 2007 and later (OMML)" rồi lưu và tải lại; hoặc sửa từng câu ở bước sau.');
        if (soAnhLoi) canhBao.push(soAnhLoi + ' hình dạng WMF/EMF (hình vẽ cũ) không hiển thị được trên web — thầy cô chèn lại hình dạng PNG/JPG ở bước sửa câu.');
        return { dongs: dongs, anh: anh, canhBao: canhBao };
      });
    });
  }
  function anhGon(u, mime) {   // thu ảnh về rộng tối đa 900px (data URL)
    return new Promise(function (ok, loi) {
      var url = URL.createObjectURL(new Blob([u], { type: mime })), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 900 / (im.naturalWidth || 900)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var duLieu = c.toDataURL(mime === 'image/png' || mime === 'image/gif' ? 'image/png' : 'image/jpeg', 0.85);
        ok({ src: duLieu, w: Math.min(8, Math.max(2, im.naturalWidth * k / 70)) });
      };
      im.onerror = function () { URL.revokeObjectURL(url); loi(new Error('ảnh')); };
      im.src = url;
    });
  }

  // ------------------------------------------------------------ PDF (có lớp chữ) -> các dòng; pdf.js chỉ tải khi cần
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function napPdfJs() {
    if (G.pdfjsLib) return Promise.resolve(G.pdfjsLib);
    return new Promise(function (ok, loi) {
      var s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js';
      s.onload = function () { G.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(G.pdfjsLib); };
      s.onerror = function () { loi(new Error('Chưa tải được bộ đọc PDF — kiểm tra mạng rồi thử lại.')); };
      document.head.appendChild(s);
    });
  }
  function chuToan(s) {   // chữ toán dạng 𝑥, 𝑦 (Cambria Math) -> x, y; bỏ kí tự ẩn
    return String(s).replace(/[\u{1D400}-\u{1D7FF}]/gu, function (c) { return c.normalize('NFKC'); }).replace(/[⁡-⁤​﻿]/g, '');
  }
  function docPdf(file) {
    return Promise.all([file.arrayBuffer(), napPdfJs()]).then(function (x) {
      return x[1].getDocument({ data: new Uint8Array(x[0]) }).promise;
    }).then(function (pdf) {
      var trang = []; for (var i = 1; i <= pdf.numPages; i++) trang.push(i);
      return Promise.all(trang.map(function (i) { return pdf.getPage(i).then(function (p) { return p.getTextContent(); }); }));
    }).then(function (noi) {
      var dongs = [], tong = 0;
      var laToan = function (t) { return t.length <= 24 && !/[À-ỹà-ỹĐđ]{1}[a-zà-ỹ]{2,}|\b(là|của|và|cho|tính|bằng)\b/i.test(t) && !/[ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i.test(t.replace(/\b(sin|cos|tan|cot|log|ln|lim)\b/g, '')); };
      noi.forEach(function (nd) {
        var ms = nd.items.filter(function (it) { return it.str != null && it.str !== ''; }).map(function (it) { var t = it.transform; return { s: chuToan(it.str), x: t[4], y: t[5], h: Math.abs(t[3]) || it.height || 10, w: it.width || 0 }; });
        if (!ms.length) return;
        var hs = ms.map(function (m) { return m.h; }).sort(function (a, b) { return a - b; }), H0 = hs[Math.floor(hs.length / 2)];
        var lon = ms.filter(function (m) { return m.h >= 0.8 * H0; }), nho = ms.filter(function (m) { return m.h < 0.8 * H0; });
        // lượt 1: chữ cỡ thường -> dòng
        lon.sort(function (a, b) { return b.y - a.y || a.x - b.x; });
        var hang = [];
        lon.forEach(function (m) {
          var d = hang.filter(function (h) { return Math.abs(h.y - m.y) < 0.45 * Math.max(h.h, m.h); })[0];
          if (d) d.ms.push(m); else hang.push({ y: m.y, h: m.h, ms: [m], tren: [], duoi: [] });
        });
        // lượt 2: chữ nhỏ (mũ, chỉ số, tử – mẫu phân số, cận tích phân) -> gắn vào dòng gần nhất
        nho.forEach(function (m) {
          var tot = null, kc = Infinity;
          hang.forEach(function (h) { var d = Math.abs(m.y - h.y); if (d <= 0.95 * h.h && d < kc && m.x >= h.ms[0].x - 2 * h.h) { kc = d; tot = h; } });
          if (!tot) { hang.push({ y: m.y, h: m.h, ms: [m], tren: [], duoi: [] }); return; }
          (m.y > tot.y + 0.1 * tot.h ? tot.tren : m.y < tot.y - 0.1 * tot.h ? tot.duoi : tot.ms).push(m);
        });
        hang.sort(function (a, b) { return b.y - a.y; });
        // dòng ngắn toàn công thức nằm sát trên một dòng có mẫu số -> tử số
        for (var k = 0; k + 1 < hang.length; k++) {
          var o = hang[k], l = hang[k + 1], chu = o.ms.map(function (m) { return m.s; }).join('').trim();
          if (o.tren.length || o.duoi.length || !laToan(chu) || o.y - l.y > 1.4 * l.h) continue;
          var x0 = Math.min.apply(null, o.ms.map(function (m) { return m.x; })), x1 = Math.max.apply(null, o.ms.map(function (m) { return m.x + m.w; }));
          if (l.duoi.some(function (d) { return d.x + d.w > x0 - 2 && d.x < x1 + 2; })) { o.ms.forEach(function (m) { m.h = 0; l.tren.push(m); }); hang.splice(k, 1); k--; }
        }
        var dongChu = function (ds) { var t = '', c = null; ds.sort(function (a, b) { return a.x - b.x; }).forEach(function (m) { if (c != null && m.x - c > 0.22 * H0 && !/\s$/.test(t)) t += ' '; t += m.s; c = m.x + m.w; }); return t.trim(); };
        var chong = function (a, b) { return a.x < b.x1 + 2 && b.x < a.x1 + 2; };
        hang.forEach(function (h) {
          var nhom = function (ds) {   // gom chữ nhỏ liền nhau thành cụm
            var cum = [];
            ds.sort(function (a, b) { return a.x - b.x; }).forEach(function (m) { var c = cum[cum.length - 1]; if (c && m.x - c.x1 < 0.35 * H0) { c.ds.push(m); c.x1 = Math.max(c.x1, m.x + m.w); } else cum.push({ x: m.x, x1: m.x + m.w, ds: [m] }); });
            cum.forEach(function (c) { c.s = dongChu(c.ds); }); return cum;
          };
          var tren = nhom(h.tren), duoi = nhom(h.duoi), chen = [];
          tren.forEach(function (t) {
            var d = duoi.filter(function (x) { return !x.dung && chong(t, x); })[0];
            var truoc = h.ms.filter(function (m) { return m.x + m.w <= t.x + 1; }).sort(function (a, b) { return b.x - a.x; })[0];
            var gioiHan = truoc && /[∫∑∏]$|lim$/.test(truoc.s.trim());
            if (d) { d.dung = 1; chen.push({ x: Math.min(t.x, d.x), s: gioiHan ? '$_{' + d.s + '}^{' + t.s + '}$' : '$\\dfrac{' + t.s + '}{' + d.s + '}$' }); }
            else chen.push({ x: t.x, s: '$^{' + t.s + '}$', dinh: 1 });
          });
          duoi.filter(function (x) { return !x.dung; }).forEach(function (d) { chen.push({ x: d.x, s: '$_{' + d.s + '}$', dinh: 1 }); });
          var tat = h.ms.map(function (m) { return { x: m.x, x1: m.x + m.w, s: m.s }; }).concat(chen.map(function (c) { return { x: c.x, x1: c.x, s: c.s, dinh: c.dinh }; })).sort(function (a, b) { return a.x - b.x; });
          var t = '', cuoi = null;
          tat.forEach(function (m) { if (cuoi != null && !m.dinh && m.x - cuoi > 0.22 * H0 && !/\s$/.test(t)) t += ' '; t += m.s; cuoi = Math.max(cuoi || 0, m.x1); tong += m.s.length; });
          dongs.push(t.replace(/\s+/g, ' ').trim());
        });
      });
      if (tong < 30) throw new Error('Tệp PDF này là ảnh chụp/scan (không có lớp chữ) nên chưa đọc được. Thầy cô dùng tệp Word theo đề mẫu nhé.');
      return { dongs: dongs, anh: {}, canhBao: ['Đề đọc từ PDF: chữ, mũ, chỉ số, phân số, cận tích phân đọc được; hệ phương trình, ma trận, căn nhiều tầng và hình vẽ có thể bị lệch hoặc thiếu. PDF không giữ gạch chân nên đáp án phải ghi bằng dòng "Đáp án: …". Thầy cô kiểm tra từng câu ở bước sau (nút ✏️ Sửa); muốn giữ nguyên công thức và hình, dùng tệp Word.'] };
    });
  }

  // ------------------------------------------------------------ phân tích theo mẫu
  var LOAI_TEN = { mc: 'Trắc nghiệm nhiều lựa chọn', tf: 'Đúng – Sai', sa: 'Trả lời ngắn', es: 'Tự luận' };
  function soThuc(s) { var v = parseFloat(String(s).replace(',', '.')); return isNaN(v) ? null : v; }
  function boDau(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D'); }
  function ngoaiCongThuc(s, re) {   // tìm theo regex nhưng bỏ qua phần trong $...$
    var phan = String(s).split(/(\$[^$]*\$)/), vt = 0, kq = [];
    phan.forEach(function (p) { if (p.charAt(0) !== '$') { var m, r = new RegExp(re.source, 'g'); while ((m = r.exec(p))) kq.push({ i: vt + m.index, m: m }); } vt += p.length; });
    return kq;
  }
  function tachLuaChon(s) {   // "A. x   B. y" trên một dòng -> [{chu, nd, gach}]
    var vt = ngoaiCongThuc(s, /(^|[\s\t\u0005])\u0005?([A-D])\s*[.)]\s*/);
    var cac = vt.filter(function (x, i) { return i === 0 ? x.i <= 2 : true; });
    if (!cac.length || cac[0].i > 2) return null;
    return cac.map(function (x, i) {
      var bd = x.i + x.m[0].length, kt = i + 1 < cac.length ? cac[i + 1].i : s.length;
      var dauGach = s.slice(Math.max(0, x.i - 1), bd).indexOf(DAU_GACH) >= 0;
      return { chu: x.m[2], nd: s.slice(bd, kt), gach: dauGach };
    });
  }
  function sach(s) { return String(s || '').split(DAU_GACH).join('').split(CUOI_GACH).join('').replace(/\t+/g, ' ').replace(/[  ]+/g, ' ').trim(); }
  function phanTich(dongs, anh, mac) {
    mac = mac || {};
    var de = { title: '', khoi: mac.khoi || 10, time: mac.time || 45, parts: [] }, loi = [], phan = null, cau = null, che = 'de', soCau = 0;
    var DIEM = { mc: 0.25, tf: 1, sa: (mac.khoi || 10) == 12 ? 0.5 : 0.5, es: 1 };
    var themAnh = function (s, dich) {
      return s.replace(/\u0002(a\d+)\u0002/g, function (m0, id) { if (anh && anh[id] && dich) { if (dich === 'fig' && !cau.fig) cau.fig = anh[id]; else if (dich === 'sol' && !cau.solfig) cau.solfig = anh[id]; } return ''; });
    };
    var dongCau = function () {
      if (!cau) return;
      var t = phan.type, so = 'Phần ' + ({ mc: 'I', tf: 'II', sa: 'III', es: 'IV' })[t] + ' câu ' + cau.so;
      cau.stem = sach(cau.stem);
      if (!cau.stem) loi.push(so + ': chưa có đề bài.');
      if (t === 'mc') {
        if (cau.opts.length !== 4) loi.push(so + ': cần đủ 4 phương án A, B, C, D (đang có ' + cau.opts.length + ').');
        if (cau.ans == null) loi.push(so + ': chưa có đáp án (dòng "Đáp án: B" hoặc gạch chân chữ cái đáp án đúng).');
        while (cau.opts.length < 4) cau.opts.push('');
        cau.opts = cau.opts.slice(0, 4).map(sach); cau.notes = ['', '', '', ''];
      }
      if (t === 'tf') {
        if (cau.items.length !== 4) loi.push(so + ': cần đủ 4 ý a), b), c), d) (đang có ' + cau.items.length + ').');
        while (cau.items.length < 4) cau.items.push({ t: '', ans: true, expl: '' });
        cau.items = cau.items.slice(0, 4).map(function (it) { return { t: sach(it.t), ans: it.ans, expl: '' }; });
        if (cau.tfAns == null) loi.push(so + ': chưa có đáp án Đúng/Sai (VD: "Đáp án: Đ S Đ S").');
        else cau.items.forEach(function (it, j) { it.ans = cau.tfAns[j]; });
        delete cau.tfAns;
      }
      if (t === 'sa') { cau.ans = sach(cau.ans || ''); if (!cau.ans || soThuc(cau.ans) == null) loi.push(so + ': đáp án trả lời ngắn phải là một số (VD: "Đáp án: 2,5").'); }
      if (t === 'es') { if (!cau.sol.length) cau.sol = [{ t: 'Lời giải đúng, đủ ý.', p: cau.pts }]; var tong = cau.sol.reduce(function (a, x) { return a + x.p; }, 0); if (Math.abs(tong - cau.pts) > 1e-9) loi.push(so + ': tổng điểm các bước (' + tong + ') khác điểm câu (' + cau.pts + ').'); }
      cau.expl = sach(cau.expl); if (!cau.expl) delete cau.expl;
      var so_ = cau.so; delete cau.so;
      if (t !== 'es') delete cau.pts;
      phan.qs.push(cau); cau = null; void so_;
    };
    var moPhan = function (t, diem) { dongCau(); phan = de.parts.filter(function (p) { return p.type === t; })[0]; if (!phan) { phan = { type: t, pts: diem != null ? diem : DIEM[t], qs: [] }; de.parts.push(phan); } else if (diem != null) phan.pts = diem; che = 'de'; };
    dongs.forEach(function (goc) {
      var s = goc.replace(/\r/g, ''), tron = sach(s), khong = boDau(tron).toUpperCase(), m;
      if (!tron && !/\u0002a\d+\u0002/.test(s)) return;
      if (/^(\/\/|#)/.test(tron)) return;                                   // dòng hướng dẫn
      if ((m = /^Tên đề\s*[:：]\s*(.+)$/i.exec(tron))) { de.title = m[1]; return; }
      if ((m = /^Khối\s*[:：]\s*(\d+)/i.exec(tron))) { de.khoi = +m[1]; return; }
      if ((m = /^Thời gian\s*[:：]\s*(\d+)/i.exec(tron))) { de.time = +m[1]; return; }
      if (/^PHAN\s+(I{1,3}|IV|[1-4])\b/.test(khong)) {
        var la = /^PHAN\s+(I{1,3}|IV|[1-4])\b/.exec(khong)[1], t = /NHIEU (LUA CHON|PHUONG AN)/.test(khong) ? 'mc' : /DUNG\s*[-–]?\s*SAI/.test(khong) ? 'tf' : /TRA LOI NGAN/.test(khong) ? 'sa' : /TU LUAN/.test(khong) ? 'es' : ({ I: 'mc', 1: 'mc', II: 'tf', 2: 'tf', III: 'sa', 3: 'sa', IV: 'es', 4: 'es' })[la];
        var dm = /DIEM MOI CAU[^\d]*([\d.,]+)/.exec(khong) || /\(([\d.,]+)\s*DIEM\s*\/\s*CAU\)/.exec(khong);
        moPhan(t, dm ? soThuc(dm[1]) : null); return;
      }
      if ((m = /^Câu\s*(\d+)\s*[.:)]?\s*/i.exec(tron))) {
        if (!phan) moPhan('mc');
        dongCau(); soCau++;
        var conLai = s.replace(/^\s*[\u0005\u0006]*Câu\s*\d+\s*[.:)]?\s*/i, '');
        cau = { so: +m[1], stem: '', expl: '' };
        if (phan.type === 'mc') { cau.opts = []; cau.ans = null; }
        if (phan.type === 'tf') { cau.items = []; cau.tfAns = null; }
        if (phan.type === 'es') {
          cau.pts = phan.pts; cau.sol = [];
          var dmc = /^\(?\s*([\d.,]+)\s*điểm\s*\)?\s*[.:]?\s*/i.exec(sach(conLai)); if (dmc) { cau.pts = soThuc(dmc[1]); conLai = conLai.replace(/^\s*\(?\s*[\d.,]+\s*điểm\s*\)?\s*[.:]?\s*/i, ''); }
        }
        cau.stem = themAnh(conLai, 'fig'); che = 'de'; return;
      }
      if (!cau) return;
      if ((m = /^Đáp án\s*(đúng)?\s*[:：]?\s*(.*)$/i.exec(tron))) {
        var da = m[2].trim();
        if (phan.type === 'mc') { var lc = /^([A-D])\b/i.exec(da); cau.ans = lc ? 'ABCD'.indexOf(lc[1].toUpperCase()) : null; }
        else if (phan.type === 'tf') { var kt = boDau(da).toUpperCase().replace(/DUNG/g, 'D').replace(/SAI/g, 'S').replace(/[^DST F]/g, '').replace(/\s/g, '').replace(/T/g, 'D').replace(/F/g, 'S'); cau.tfAns = kt.length === 4 ? kt.split('').map(function (c) { return c === 'D'; }) : null; }
        else if (phan.type === 'sa') cau.ans = da;
        che = 'xong'; return;
      }
      if ((m = /^(Lời giải|Hướng dẫn giải|Hướng dẫn|Giải)\s*[:：]?\s*(.*)$/i.exec(tron)) && phan.type !== 'es') { cau.expl = themAnh(m[2], 'sol'); che = 'giai'; return; }
      if (phan.type === 'es' && /^(Hướng dẫn chấm|Đáp án và hướng dẫn chấm|Lời giải)\s*[:：]?\s*$/i.test(tron)) { che = 'cham'; return; }
      if (che === 'cham' || (phan.type === 'es' && /^[-+•]\s/.test(tron))) {
        var bc = sach(themAnh(s, 'sol')).replace(/^[-+•]\s*/, ''), dbc = /\(?\s*([\d.,]+)\s*(điểm|đ)?\s*\)?\s*$/i.exec(bc);
        if (dbc && /[\d]/.test(dbc[1]) && (dbc[0].indexOf('(') >= 0 || /đ/.test(dbc[0]))) cau.sol.push({ t: bc.slice(0, dbc.index).trim(), p: soThuc(dbc[1]) });
        else if (cau.sol.length) cau.sol[cau.sol.length - 1].t += '<br>' + bc; else cau.sol.push({ t: bc, p: 0 });
        che = 'cham'; return;
      }
      if (che === 'giai') { cau.expl += '<br>' + themAnh(s, 'sol'); return; }
      if (phan.type === 'mc' && che === 'de') { var lcs = tachLuaChon(s); if (lcs) { lcs.forEach(function (x) { if (x.gach) cau.ans = cau.ans == null ? 'ABCD'.indexOf(x.chu) : cau.ans; cau.opts['ABCD'.indexOf(x.chu)] = themAnh(x.nd, 'fig'); }); cau.opts = cau.opts.filter(function (x) { return x != null; }); return; } }
      if (phan.type === 'tf' && che === 'de' && (m = /^\u0005?([a-d])\s*\)\s*/.exec(s.replace(/^\s+/, '')))) { cau.items.push({ t: themAnh(s.replace(/^\s*\u0005?[a-d]\s*\)\s*/, ''), 'fig'), ans: true }); return; }
      if (che === 'de') cau.stem += (cau.stem ? '<br>' : '') + themAnh(s, 'fig');
    });
    dongCau();
    de.parts = de.parts.filter(function (p) { return p.qs.length; });
    if (!de.parts.length) loi.unshift('Không tìm thấy câu hỏi nào. Kiểm tra lại các mốc "PHẦN I…", "Câu 1." theo đề mẫu.');
    return { de: de, loi: loi, soCau: soCau };
  }

  // ------------------------------------------------------------ Excel danh sách lớp (.xlsx): cột Họ và tên (+ Ngày sinh)
  function docXlsx(file) {
    return file.arrayBuffer().then(docZip).then(function (tep) {
      var chung = [];
      if (tep['xl/sharedStrings.xml']) Array.prototype.forEach.call(xml(tep['xl/sharedStrings.xml']).getElementsByTagName('si'), function (si) { chung.push(Array.prototype.map.call(si.getElementsByTagName('t'), function (t) { return t.textContent; }).join('')); });
      var ten1 = Object.keys(tep).filter(function (k) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(k); }).sort()[0];
      if (!ten1) throw new Error('Không thấy trang tính trong tệp Excel.');
      var bang = [];
      Array.prototype.forEach.call(xml(tep[ten1]).getElementsByTagName('row'), function (r) {
        var dong = [];
        Array.prototype.forEach.call(r.getElementsByTagName('c'), function (c) {
          var ref = c.getAttribute('r') || '', cot = 0; (ref.match(/^[A-Z]+/) || [''])[0].split('').forEach(function (ch) { cot = cot * 26 + ch.charCodeAt(0) - 64; });
          var t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], gt = '';
          if (t === 's' && v) gt = chung[+v.textContent] || '';
          else if (t === 'inlineStr') gt = Array.prototype.map.call(c.getElementsByTagName('t'), function (x) { return x.textContent; }).join('');
          else if (v) gt = v.textContent;
          dong[(cot || dong.length + 1) - 1] = gt;
        });
        bang.push(dong);
      });
      return bang;
    });
  }
  function ngaySo(v) {   // số ngày kiểu Excel -> dd/mm/yyyy
    var n = +v; if (!(n > 3000 && n < 80000)) return String(v || '');
    var d = new Date(Date.UTC(1899, 11, 30) + n * 864e5); return ('0' + d.getUTCDate()).slice(-2) + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/' + d.getUTCFullYear();
  }
  function dsTuBang(bang) {   // tìm cột "họ tên" (+ "ngày sinh"); dòng tiêu đề tuỳ ý
    var cotTen = -1, cotNs = -1, dau = 0;
    for (var i = 0; i < Math.min(10, bang.length); i++) {
      (bang[i] || []).forEach(function (c, j) { var k = boDau(c || '').toLowerCase(); if (cotTen < 0 && /ho (va )?ten|ho ten|ten hoc sinh|hoten/.test(k)) { cotTen = j; dau = i + 1; } if (cotNs < 0 && /ngay sinh|ns/.test(k)) cotNs = j; });
      if (cotTen >= 0) break;
    }
    if (cotTen < 0) { cotTen = (bang[0] || []).length > 1 && /^\d+$/.test(String((bang[1] || bang[0])[0] || '').trim()) ? 1 : 0; dau = 0; }
    return bang.slice(dau).map(function (r) { return { ten: String((r || [])[cotTen] || '').trim(), ns: cotNs >= 0 ? ngaySo((r || [])[cotNs]) : '' }; }).filter(function (h) { return h.ten.length >= 2 && !/^\d+$/.test(h.ten); });
  }
  function dsTuChu(s) {   // dán từ Excel/Word: mỗi dòng một học sinh; "STT  Họ tên  Ngày sinh" hoặc chỉ họ tên
    return String(s || '').split(/\r?\n/).map(function (d) {
      var o = d.split(/\t|;|\s{2,}/).map(function (x) { return x.trim(); }).filter(Boolean);
      if (o.length && /^\d+[.)]?$/.test(o[0])) o.shift();
      var ns = o.length > 1 && /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(o[o.length - 1]) ? o.pop() : '';
      return { ten: o.join(' ').replace(/^\d+[.)]\s*/, '').trim(), ns: ns };
    }).filter(function (h) { return h.ten.length >= 2 && !/^(stt|họ và tên|họ tên)$/i.test(h.ten); });
  }

  G.NHAP_DE = { docDocx: docDocx, docPdf: docPdf, docTep: function (f) { return /\.pdf$/i.test(f.name) ? docPdf(f) : docDocx(f); }, phanTich: phanTich, docXlsx: docXlsx, dsTuBang: dsTuBang, dsTuChu: dsTuChu, omSangTex: omSangTex, LOAI_TEN: LOAI_TEN };
})(window);
