/* Xuất đề ra Word (.docx) ngay trên trình duyệt — công thức là PHƯƠNG TRÌNH WORD (Office Math, sửa được trực tiếp;
 * muốn MathType: mở bằng Word có MathType > Convert Equations). Không cần máy chủ.
 * LaTeX -> (KaTeX) MathML -> OMML. Hình PNG/JPEG nhúng vào file.
 * window.XuatWord.taiDe(de, tuyChon)  de: {title, time, khoi, gvTen, ma:[{ma, de:{parts}}]}  (đề phải có đáp án)
 */
(function (G) {
  'use strict';
  var R = G.ExamRunner;

  // ------------------------------------------------------------ XML helpers
  function x(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var FONT = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>';

  // ------------------------------------------------------------ MathML -> OMML
  function mr(t, sty) {
    if (t === '') return '';
    return '<m:r>' + (sty ? '<m:rPr><m:sty m:val="' + sty + '"/></m:rPr>' : '') + '<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr><m:t xml:space="preserve">' + x(t) + '</m:t></m:r>';
  }
  function con(n) { return Array.prototype.filter.call(n.childNodes, function (c) { return c.nodeType === 1; }); }
  function tat(n) { return con(n).map(om).join(''); }
  function e(s) { return '<m:e>' + s + '</m:e>'; }
  var NARY = { '∑': 1, '∫': 1, '∏': 1, '∬': 1, '∮': 1, '⋃': 1, '⋂': 1 };
  function laNary(n) { return n && n.localName === 'mo' && NARY[n.textContent.trim()]; }
  function nary(chr, sub, sup) {
    return '<m:nary><m:naryPr><m:chr m:val="' + x(chr) + '"/>' + (sub == null ? '<m:subHide m:val="1"/>' : '') + (sup == null ? '<m:supHide m:val="1"/>' : '') +
      '<m:limLoc m:val="' + (chr === '∫' ? 'subSup' : 'undOvr') + '"/></m:naryPr><m:sub>' + (sub || '') + '</m:sub><m:sup>' + (sup || '') + '</m:sup><m:e></m:e></m:nary>';
  }
  var DAU_MU = { '→': '⃗', '⃗': '⃗', '^': '̂', 'ˆ': '̂', '~': '̃', '˜': '̃', '˙': '̇', '¨': '̈' };
  function om(n) {
    var t = n.localName, c = con(n), tx = n.textContent;
    switch (t) {
      case 'math': case 'semantics': return c.filter(function (k) { return k.localName !== 'annotation'; }).map(om).join('');
      case 'annotation': return '';
      case 'mrow': case 'mstyle': case 'mpadded': case 'menclose': case 'mtd': return dongNgoac(n);
      case 'mphantom': return '';
      case 'mi': return mr(tx, tx.length > 1 ? 'p' : (n.getAttribute('mathvariant') === 'normal' ? 'p' : null));
      case 'mn': return mr(tx, 'p');
      case 'mo': return mr(tx, 'p');
      case 'mtext': case 'ms': return mr(tx.replace(/ /g, ' '), 'p');
      case 'mspace': return mr(' ', 'p');
      case 'mfrac':
        return '<m:f>' + (n.getAttribute('linethickness') === '0' || n.getAttribute('linethickness') === '0px' ? '<m:fPr><m:type m:val="noBar"/></m:fPr>' : '') + '<m:num>' + om(c[0]) + '</m:num><m:den>' + om(c[1]) + '</m:den></m:f>';
      case 'msqrt': return '<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/>' + e(tat(n)) + '</m:rad>';
      case 'mroot': return '<m:rad><m:deg>' + om(c[1]) + '</m:deg>' + e(om(c[0])) + '</m:rad>';
      case 'msup': if (laNary(c[0])) return nary(c[0].textContent.trim(), null, om(c[1]));
        return '<m:sSup>' + e(om(c[0])) + '<m:sup>' + om(c[1]) + '</m:sup></m:sSup>';
      case 'msub': if (laNary(c[0])) return nary(c[0].textContent.trim(), om(c[1]), null);
        return '<m:sSub>' + e(om(c[0])) + '<m:sub>' + om(c[1]) + '</m:sub></m:sSub>';
      case 'msubsup': if (laNary(c[0])) return nary(c[0].textContent.trim(), om(c[1]), om(c[2]));
        return '<m:sSubSup>' + e(om(c[0])) + '<m:sub>' + om(c[1]) + '</m:sub><m:sup>' + om(c[2]) + '</m:sup></m:sSubSup>';
      case 'munderover': if (laNary(c[0])) return nary(c[0].textContent.trim(), om(c[1]), om(c[2]));
        return '<m:limUpp>' + e('<m:limLow>' + e(om(c[0])) + '<m:lim>' + om(c[1]) + '</m:lim></m:limLow>') + '<m:lim>' + om(c[2]) + '</m:lim></m:limUpp>';
      case 'munder': if (laNary(c[0])) return nary(c[0].textContent.trim(), om(c[1]), null);
        return '<m:limLow>' + e(om(c[0])) + '<m:lim>' + om(c[1]) + '</m:lim></m:limLow>';
      case 'mover':
        var a = c[1] && c[1].textContent.trim();
        if (a === '‾' || a === '¯' || a === '_' || a === '―') return '<m:bar><m:barPr><m:pos m:val="top"/></m:barPr>' + e(om(c[0])) + '</m:bar>';
        if (DAU_MU[a] || n.getAttribute('accent') === 'true') return '<m:acc><m:accPr><m:chr m:val="' + x(DAU_MU[a] || a) + '"/></m:accPr>' + e(om(c[0])) + '</m:acc>';
        return '<m:limUpp>' + e(om(c[0])) + '<m:lim>' + om(c[1]) + '</m:lim></m:limUpp>';
      case 'mtable':
        return '<m:m><m:mPr><m:mcs><m:mc><m:mcPr><m:count m:val="' + Math.max.apply(0, c.map(function (r) { return con(r).length; }).concat([1])) + '"/><m:mcJc m:val="left"/></m:mcPr></m:mc></m:mcs></m:mPr>' +
          c.map(function (row) { return '<m:mr>' + con(row).map(function (cell) { return e(om(cell)); }).join('') + '</m:mr>'; }).join('') + '</m:m>';
      default: return tat(n);
    }
  }
  // mrow có ngoặc co giãn ( \left( ... \right) , cases ) -> <m:d>
  function dongNgoac(n) {
    var c = con(n);
    var laFence = function (k) { return k && k.localName === 'mo' && (k.getAttribute('fence') === 'true' || k.getAttribute('stretchy') === 'true'); };
    if (c.length >= 2 && laFence(c[0]) && (laFence(c[c.length - 1]) || c[1].localName === 'mtable')) {
      var dau = c[0].textContent, cuoi = laFence(c[c.length - 1]) && c.length > 2 ? c[c.length - 1].textContent : '';
      var giua = c.slice(1, cuoi === '' && !laFence(c[c.length - 1]) ? c.length : c.length - 1);
      return '<m:d><m:dPr><m:begChr m:val="' + x(dau) + '"/><m:endChr m:val="' + x(cuoi) + '"/></m:dPr>' + e(giua.map(om).join('')) + '</m:d>';
    }
    return c.map(om).join('');
  }
  var parser = new DOMParser();
  function texSangOmml(tex) {
    try {
      var html = G.katex.renderToString(tex, { output: 'mathml', throwOnError: false, strict: false });
      var m = /<math[\s\S]*<\/math>/.exec(html); if (!m) throw 0;
      var doc = parser.parseFromString(m[0].replace(/&nbsp;/g, '&#160;'), 'application/xml');
      return '<m:oMath>' + om(doc.documentElement) + '</m:oMath>';
    } catch (er) { return '<w:r><w:rPr>' + FONT + '</w:rPr><w:t xml:space="preserve">' + x(tex) + '</w:t></w:r>'; }
  }

  // ------------------------------------------------------------ chữ có công thức $...$ -> runs
  function chuThuong(s) {   // bỏ thẻ HTML đơn giản, giữ xuống dòng
    return String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(b|strong)>/gi, '\u0001').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
  function runs(s, dam, nghieng) {
    var out = '', dangDam = !!dam;
    String(s == null ? '' : s).split(/(\$[^$]+\$)/).forEach(function (p) {
      if (!p) return;
      if (p.charAt(0) === '$' && p.length > 2) { out += texSangOmml(p.slice(1, -1)); return; }
      chuThuong(p).split('\u0001').forEach(function (doan, i) {
        if (i > 0) dangDam = !dangDam;
        doan.split('\n').forEach(function (dong, j) {
          if (j > 0) out += '<w:r><w:br/></w:r>';
          if (dong) out += '<w:r><w:rPr>' + FONT + (dangDam ? '<w:b/>' : '') + (nghieng ? '<w:i/>' : '') + '</w:rPr><w:t xml:space="preserve">' + x(dong) + '</w:t></w:r>';
        });
      });
    });
    return out;
  }
  function doanVan(noiDung, o) {
    o = o || {};
    return '<w:p><w:pPr>' + (o.giua ? '<w:jc w:val="center"/>' : '') + '<w:spacing w:before="' + (o.truoc || 0) + '" w:after="' + (o.sau == null ? 60 : o.sau) + '"/>' + (o.thut ? '<w:ind w:left="' + o.thut + '"/>' : '') + (o.giuSau ? '<w:keepNext/>' : '') + '</w:pPr>' + noiDung + '</w:p>';
  }
  function ngatTrang() { return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; }

  // ------------------------------------------------------------ hình
  var anh = [];   // {ten, bytes, w, h}
  function b64sangU8(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function taiAnh(src) {
    if (/^data:/.test(src)) { var m = /^data:([^;]+);base64,(.*)$/.exec(src); return Promise.resolve({ loai: m[1], u: b64sangU8(m[2]) }); }
    return fetch(src).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return { loai: /\.jpe?g$/i.test(src) ? 'image/jpeg' : 'image/png', u: new Uint8Array(ab) }; });
  }
  function kichThuoc(a) {
    var u = a.u;
    if (u[0] === 0x89) return { w: (u[16] << 24 | u[17] << 16 | u[18] << 8 | u[19]) >>> 0, h: (u[20] << 24 | u[21] << 16 | u[22] << 8 | u[23]) >>> 0 };
    for (var i = 2; i < u.length - 9;) {      // JPEG: tìm SOF
      if (u[i] !== 0xFF) { i++; continue; }
      var mk = u[i + 1], len = u[i + 2] << 8 | u[i + 3];
      if (mk >= 0xC0 && mk <= 0xC3) return { h: u[i + 5] << 8 | u[i + 6], w: u[i + 7] << 8 | u[i + 8] };
      i += 2 + len;
    }
    return { w: 400, h: 300 };
  }
  var choAnh = {};
  function hinh(f) {
    if (!f) return '';
    var src = f.src || f.data || f.png; if (!src) return '';
    var id = choAnh[src];
    if (id == null) { id = choAnh[src] = anh.length; anh.push({ src: src, cm: Math.min(15, f.w || 6) }); }
    return '\u0002ANH' + id + '\u0002';
  }
  function drawing(i, a) {
    var cx = Math.round(a.cm * 360000), cy = Math.round(cx * a.h / a.w);
    return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + (i + 1) + '" name="Hinh' + (i + 1) + '"/>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:nvPicPr><pic:cNvPr id="' + (i + 1) + '" name="Hinh' + (i + 1) + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdAnh' + i + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
  }

  // ------------------------------------------------------------ bảng
  function bang(rows, o) {
    o = o || {};
    var vien = '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (b) { return '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; }).join('') + '</w:tblBorders>';
    return '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:jc w:val="center"/>' + vien + '<w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      rows.map(function (r, i) {
        return '<w:tr>' + r.map(function (c) {
          return '<w:tc><w:tcPr>' + (i === 0 && o.dauDam ? '<w:shd w:val="clear" w:color="auto" w:fill="E7EEF8"/>' : '') + '</w:tcPr>' + doanVan(runs(c, i === 0 && o.dauDam), { giua: o.giua !== false, sau: 0 }) + '</w:tc>';
        }).join('') + '</w:tr>';
      }).join('') + '</w:tbl>' + doanVan('', { sau: 0 });
  }

  // ------------------------------------------------------------ nội dung đề
  var TEN_PHAN = R.PART_NAME;
  function cauHoi(q, so, p) {
    var s = doanVan('<w:r><w:rPr>' + FONT + '<w:b/></w:rPr><w:t xml:space="preserve">Câu ' + so + '. </w:t></w:r>' + (p.type === 'es' ? '<w:r><w:rPr>' + FONT + '<w:i/></w:rPr><w:t xml:space="preserve">(' + R.fmt(q.pts || p.pts) + ' điểm) </w:t></w:r>' : '') + runs(q.stem), { truoc: 80 });
    if (q.table) s += bang(q.table, { dauDam: true });
    if (q.fig) s += hinh(q.fig);
    if (q.after) s += doanVan(runs(q.after));
    if (p.type === 'mc') q.opts.forEach(function (o, j) { s += doanVan('<w:r><w:rPr>' + FONT + '<w:b/></w:rPr><w:t xml:space="preserve">' + 'ABCD'[j] + '. </w:t></w:r>' + runs(o), { thut: 400 }); });
    if (p.type === 'tf') q.items.forEach(function (it, j) { s += doanVan('<w:r><w:rPr>' + FONT + '</w:rPr><w:t xml:space="preserve">' + 'abcd'[j] + ') </w:t></w:r>' + runs(it.t), { thut: 400 }); });
    return s;
  }
  function deThi(d, de, ma) {
    var s = doanVan(runs('<b>' + (d.donVi || 'TRƯỜNG ………………………') + '</b>'), { sau: 0 }) +
      doanVan(runs('<b>' + String(d.title || 'ĐỀ KIỂM TRA').toUpperCase() + '</b>'), { giua: true, truoc: 120, sau: 0 }) +
      doanVan(runs('Môn: Toán ' + (d.khoi || '') + ' — Thời gian làm bài: ' + (d.time || 90) + ' phút, không kể thời gian phát đề'), { giua: true, sau: 0 }) +
      doanVan(runs('<b>Mã đề ' + ma + '</b>'), { giua: true, sau: 120 }) +
      doanVan(runs('Họ và tên: ……………………………………………… Lớp: ………… Số báo danh: …………'), { sau: 160 });
    de.parts.forEach(function (p) {
      s += doanVan(runs('<b>' + TEN_PHAN[p.type] + '.</b> ' + ({ mc: 'Mỗi câu chỉ chọn một phương án.', tf: 'Trong mỗi ý a), b), c), d) ở mỗi câu, chọn đúng hoặc sai.', sa: 'Ghi đáp số của mỗi câu.', es: 'Trình bày lời giải.' })[p.type]), { truoc: 160, giuSau: true });
      p.qs.forEach(function (q, i) { s += cauHoi(q, i + 1, p); });
    });
    s += doanVan(runs('<b>——— HẾT ———</b>'), { giua: true, truoc: 200 });
    return s;
  }
  function bangDapAn(d) {
    var s = doanVan(runs('<b>ĐÁP ÁN CÁC MÃ ĐỀ</b>'), { giua: true, sau: 120 });
    d.ma.forEach(function (m) {
      s += doanVan(runs('<b>Mã đề ' + m.ma + '</b>'), { truoc: 120 });
      m.de.parts.forEach(function (p) {
        if (p.type === 'es') return;
        var dong = [['Câu'].concat(p.qs.map(function (q, i) { return String(i + 1); })),
          ['Đáp án'].concat(p.qs.map(function (q) { return p.type === 'mc' ? 'ABCD'[q.ans] : p.type === 'tf' ? q.items.map(function (it, j) { return 'abcd'[j] + (it.ans ? 'Đ' : 'S'); }).join(' ') : String(q.ans); }))];
        s += doanVan(runs('<i>' + TEN_PHAN[p.type] + '</i>'), { sau: 40 }) + bang(dong, { dauDam: true });
      });
    });
    return s;
  }
  function loiGiai(d) {
    var goc = d.ma[0];
    var s = ngatTrang() + doanVan(runs('<b>HƯỚNG DẪN GIẢI CHI TIẾT (theo mã đề ' + goc.ma + ')</b>'), { giua: true, sau: 120 });
    goc.de.parts.forEach(function (p) {
      s += doanVan(runs('<b>' + TEN_PHAN[p.type] + '</b>'), { truoc: 120 });
      p.qs.forEach(function (q, i) {
        var dau = '<b>Câu ' + (i + 1) + '.</b> ';
        if (p.type === 'mc') s += doanVan(runs(dau + 'Chọn <b>' + 'ABCD'[q.ans] + '</b>. ' + (q.expl || '')));
        else if (p.type === 'sa') s += doanVan(runs(dau + 'Đáp số: <b>' + q.ans + '</b>. ' + (q.expl || '')));
        else if (p.type === 'tf') { s += doanVan(runs(dau)); q.items.forEach(function (it, j) { s += doanVan(runs('abcd'[j] + ') <b>' + (it.ans ? 'Đúng' : 'Sai') + '</b>. ' + (it.expl || '')), { thut: 400 }); }); }
        else { s += doanVan(runs(dau + '(' + R.fmt(q.pts || p.pts) + ' điểm)')); s += bang([['Nội dung', 'Điểm']].concat((q.sol || []).map(function (st) { return [st.t, R.fmt(st.p)]; })), { dauDam: true, giua: false }); if (q.solfig) s += hinh(q.solfig); }
      });
    });
    return s;
  }

  // ------------------------------------------------------------ đóng gói .docx (zip, không nén)
  var CRC = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var te = new TextEncoder(), parts = [], cen = [], off = 0;
    var u16 = function (v) { return [v & 255, v >> 8 & 255]; }, u32 = function (v) { return [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255]; };
    files.forEach(function (f) {
      var ten = te.encode(f.ten), du = typeof f.du === 'string' ? te.encode(f.du) : f.du, c = crc32(du);
      var dau = [].concat([0x50, 0x4b, 3, 4], u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(c), u32(du.length), u32(du.length), u16(ten.length), u16(0));
      parts.push(new Uint8Array(dau), ten, du);
      cen.push(new Uint8Array([].concat([0x50, 0x4b, 1, 2], u16(20), u16(20), u16(0x800), u16(0), u16(0), u16(0x21), u32(c), u32(du.length), u32(du.length), u16(ten.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), ten);
      off += dau.length + ten.length + du.length;
    });
    var cenLen = cen.reduce(function (a, b) { return a + b.length; }, 0);
    var het = new Uint8Array([].concat([0x50, 0x4b, 5, 6], u16(0), u16(0), u16(files.length), u16(files.length), u32(cenLen), u32(off), u16(0)));
    return new Blob(parts.concat(cen, [het]), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  function taoDocx(than) {
    return Promise.all(anh.map(function (a) { return taiAnh(a.src).then(function (r) { var k = kichThuoc(r); a.u = r.u; a.loai = r.loai; a.w = k.w || 400; a.h = k.h || 300; }); })).then(function () {
      than = than.replace(/\u0002ANH(\d+)\u0002/g, function (m, i) { return drawing(+i, anh[+i]); });   // hình luôn nằm giữa hai đoạn văn
      var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
      var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + than +
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1200" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>';
      var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        anh.map(function (a, i) { return '<Relationship Id="rIdAnh' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/anh' + i + (a.loai === 'image/jpeg' ? '.jpg' : '.png') + '"/>'; }).join('') + '</Relationships>';
      var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr>' + FONT +
        '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>';
      var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
      var goc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
      var files = [{ ten: '[Content_Types].xml', du: ct }, { ten: '_rels/.rels', du: goc }, { ten: 'word/document.xml', du: docXml }, { ten: 'word/_rels/document.xml.rels', du: rels }, { ten: 'word/styles.xml', du: styles }];
      anh.forEach(function (a, i) { files.push({ ten: 'word/media/anh' + i + (a.loai === 'image/jpeg' ? '.jpg' : '.png'), du: a.u }); });
      return zip(files);
    });
  }

  // tuyChon: {dapAn: true, loiGiai: true}
  function taoFile(d, tuyChon) {
    tuyChon = tuyChon || {};
    anh = []; choAnh = {};
    var than = '';
    d.ma.forEach(function (m, i) { if (i) than += ngatTrang(); than += deThi(d, m.de, m.ma); });
    if (tuyChon.dapAn !== false) than += ngatTrang() + bangDapAn(d);
    if (tuyChon.loiGiai !== false) than += loiGiai(d);
    return taoDocx(than);
  }
  // Đề mẫu để giáo viên soạn đề của mình rồi tải lên web (công thức là Equation thật của Word)
  var DE_MAU = [
    ['// ĐỀ MẪU TẢI LÊN — HỌC TOÁN THÔNG MINH. Các dòng bắt đầu bằng // là hướng dẫn, thầy cô có thể xoá.', 'ghi'],
    ['// Giữ đúng các mốc: "PHẦN I…", "Câu 1.", "A. B. C. D.", "a) b) c) d)", "Đáp án:", "Lời giải:", "Hướng dẫn chấm:". Có thể bỏ bớt phần không dùng.', 'ghi'],
    ['// Công thức: gõ bằng Equation của Word (Alt + =) hoặc LaTeX giữa hai dấu $, VD $\\dfrac{1}{2}$. Công thức MathType: MathType › Convert Equations sang Word Equation trước khi tải lên.', 'ghi'],
    ['// Đáp án trắc nghiệm: dòng "Đáp án: B" (hoặc gạch chân chữ cái của phương án đúng). Hình ảnh: chèn ngay dưới đề bài (PNG/JPG).', 'ghi'],
    ['Tên đề: Kiểm tra 45 phút — Bất phương trình bậc nhất hai ẩn', 'dam'], ['Khối: 10'], ['Thời gian: 45'],
    ['PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN — Điểm mỗi câu: 0,25', 'phan'],
    ['Câu 1. Cặp số nào sau đây là nghiệm của bất phương trình $2x - y + 1 > 0$?', 'cau'],
    ['A. $(0; 2)$', 'pa'], ['B. $(1; 4)$', 'pa'], ['C. $(1; 1)$', 'pa'], ['D. $(-1; 0)$', 'pa'],
    ['Đáp án: C'], ['Lời giải: Thay $x = 1,\\ y = 1$: $2 \\cdot 1 - 1 + 1 = 2 > 0$ nên $(1; 1)$ là nghiệm.'],
    ['Câu 2. Tập nghiệm của bất phương trình $\\dfrac{x - 1}{2} \\ge \\sqrt{4}$ là', 'cau'],
    ['A. $[5; +\\infty)$\tB. $(5; +\\infty)$\tC. $(-\\infty; 5]$\tD. $[3; +\\infty)$', 'pa'],
    ['Đáp án: A'], ['Lời giải: $\\dfrac{x - 1}{2} \\ge 2 \\Leftrightarrow x - 1 \\ge 4 \\Leftrightarrow x \\ge 5$.'],
    ['PHẦN II. TRẮC NGHIỆM ĐÚNG SAI — Điểm mỗi câu: 1', 'phan'],
    ['Câu 1. Cho hàm số $y = x^2 - 4x + 3$.', 'cau'],
    ['a) Đồ thị hàm số cắt trục tung tại điểm $(0; 3)$.', 'pa'], ['b) Hàm số đồng biến trên khoảng $(-\\infty; 2)$.', 'pa'],
    ['c) Đỉnh của parabol là $I(2; -1)$.', 'pa'], ['d) Phương trình $x^2 - 4x + 3 = 0$ có hai nghiệm trái dấu.', 'pa'],
    ['Đáp án: Đ S Đ S'], ['Lời giải: a) $y(0) = 3$. b) Sai, hàm số nghịch biến trên $(-\\infty; 2)$. c) $x_I = 2,\\ y_I = -1$. d) Sai, hai nghiệm $1$ và $3$ cùng dấu.'],
    ['PHẦN III. TRẢ LỜI NGẮN — Điểm mỗi câu: 0,5', 'phan'],
    ['Câu 1. Tính giá trị của biểu thức $P = \\log_2 8 + 3^2$.', 'cau'],
    ['Đáp án: 12'], ['Lời giải: $\\log_2 8 = 3$ nên $P = 3 + 9 = 12$.'],
    ['PHẦN IV. TỰ LUẬN', 'phan'],
    ['Câu 1. (1 điểm) Giải bất phương trình $\\sqrt{x + 3} \\le x - 3$.', 'cau'],
    ['Hướng dẫn chấm:'], ['- Điều kiện $x \\ge 3$. (0,25)'], ['- Bình phương hai vế: $x + 3 \\le x^2 - 6x + 9 \\Leftrightarrow x^2 - 7x + 6 \\ge 0$. (0,5)'],
    ['- Kết hợp điều kiện được $x \\ge 6$. (0,25)']
  ];
  function taoMau() {
    anh = []; choAnh = {};
    var than = DE_MAU.map(function (d) {
      var kieu = d[1] || '';
      if (kieu === 'ghi') return doanVan('<w:r><w:rPr>' + FONT + '<w:i/><w:color w:val="6B7280"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">' + x(d[0]) + '</w:t></w:r>', { sau: 40 });
      if (kieu === 'phan') return doanVan(runs('<b>' + d[0] + '</b>'), { truoc: 200, sau: 80 });
      if (kieu === 'cau') { var m = /^(Câu \d+\.)\s*(.*)$/.exec(d[0]); return doanVan(runs('<b>' + m[1] + '</b> ' + m[2]), { truoc: 100 }); }
      if (kieu === 'dam') return doanVan(runs('<b>' + d[0] + '</b>'));
      if (kieu === 'pa') return doanVan(d[0].split('\t').map(function (p, i) { return (i ? '<w:r><w:tab/></w:r>' : '') + runs(p); }).join(''), { thut: 300 });
      return doanVan(runs(d[0]));
    }).join('');
    return taoDocx(than);
  }
  // Tệp mẫu câu hỏi cho TRÒ CHƠI LỚP HỌC: chỉ cần phần trắc nghiệm 4 lựa chọn (Câu n., A. B. C. D., Đáp án:, Lời giải: không bắt buộc)
  var DE_MAU_CHOI = [
    ['// MẪU CÂU HỎI CHO TRÒ CHƠI LỚP HỌC — HỌC TOÁN THÔNG MINH. Dòng bắt đầu bằng // là hướng dẫn, thầy cô xoá đi cũng được.', 'ghi'],
    ['// Mỗi câu: dòng "Câu n.", bốn phương án A. B. C. D. (mỗi phương án một dòng), dòng "Đáp án: B". Lời giải (không bắt buộc): dòng "Lời giải: …" — sẽ hiện khi thầy cô bấm Hiện đáp án.', 'ghi'],
    ['// Công thức: gõ bằng Equation của Word (Alt + =) hoặc LaTeX giữa hai dấu $, VD $\\dfrac{1}{2}$. Giữ dòng “PHẦN I.” bên dưới.', 'ghi'],
    ['Tên bộ câu hỏi: Củng cố — Tổng và hiệu hai vectơ', 'dam'],
    ['PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN', 'phan'],
    ['Câu 1. Cho ba điểm $A, B, C$ bất kì. Khẳng định nào sau đây đúng?', 'cau'],
    ['A. $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$', 'pa'],
    ['B. $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{CA}$', 'pa'],
    ['C. $\\overrightarrow{AB} - \\overrightarrow{BC} = \\overrightarrow{AC}$', 'pa'],
    ['D. $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{BC}$', 'pa'],
    ['Đáp án: A'],
    ['Lời giải: Quy tắc ba điểm: $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$.'],
    ['Câu 2. Cho hình bình hành $ABCD$. Vectơ $\\overrightarrow{AB} + \\overrightarrow{AD}$ bằng', 'cau'],
    ['A. $\\overrightarrow{BD}$', 'pa'],
    ['B. $\\overrightarrow{AC}$', 'pa'],
    ['C. $\\overrightarrow{CA}$', 'pa'],
    ['D. $\\overrightarrow{DB}$', 'pa'],
    ['Đáp án: B'],
    ['Lời giải: Quy tắc hình bình hành.'],
    ['Câu 3. Vectơ đối của vectơ $\\overrightarrow{AB}$ là', 'cau'],
    ['A. $\\overrightarrow{AB}$', 'pa'],
    ['B. $\\overrightarrow{0}$', 'pa'],
    ['C. $\\overrightarrow{BA}$', 'pa'],
    ['D. $\\overrightarrow{AA}$', 'pa'],
    ['Đáp án: C'],
    ['Câu 4. Tính $\\left|\\overrightarrow{AB} + \\overrightarrow{BC}\\right|$ biết tam giác $ABC$ đều cạnh $a$.', 'cau'],
    ['A. $a$', 'pa'],
    ['B. $2a$', 'pa'],
    ['C. $\\dfrac{a\\sqrt{3}}{2}$', 'pa'],
    ['D. $0$', 'pa'],
    ['Đáp án: A'],
    ['Lời giải: $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ nên độ dài bằng $AC = a$.']
  ];
  function taoMauChoi() {
    anh = []; choAnh = {};
    var than = DE_MAU_CHOI.map(function (d) {
      var kieu = d[1] || '';
      if (kieu === 'ghi') return doanVan('<w:r><w:rPr>' + FONT + '<w:i/><w:color w:val="6B7280"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">' + x(d[0]) + '</w:t></w:r>', { sau: 40 });
      if (kieu === 'phan') return doanVan(runs('<b>' + d[0] + '</b>'), { truoc: 200, sau: 80 });
      if (kieu === 'cau') { var m = /^(Câu \d+\.)\s*(.*)$/.exec(d[0]); return doanVan(runs('<b>' + m[1] + '</b> ' + m[2]), { truoc: 100 }); }
      if (kieu === 'dam') return doanVan(runs('<b>' + d[0] + '</b>'));
      if (kieu === 'pa') return doanVan(d[0].split('\t').map(function (p, i) { return (i ? '<w:r><w:tab/></w:r>' : '') + runs(p); }).join(''), { thut: 300 });
      return doanVan(runs(d[0]));
    }).join('');
    return taoDocx(than);
  }
  // Excel .xlsx tối giản (một trang tính, chữ + số)
  function taoXlsx(dong, tenTrang) {
    var cot = function (i) { var s = ''; i++; while (i) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
      dong.map(function (r, i) {
        return '<row r="' + (i + 1) + '">' + r.map(function (c, j) {
          var ref = cot(j) + (i + 1);
          if (typeof c === 'number' && isFinite(c)) return '<c r="' + ref + '"' + (i === 0 ? ' s="1"' : '') + '><v>' + c + '</v></c>';
          return '<c r="' + ref + '" t="inlineStr"' + (i === 0 ? ' s="1"' : '') + '><is><t xml:space="preserve">' + x(c) + '</t></is></c>';
        }).join('') + '</row>';
      }).join('') + '</sheetData></worksheet>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs>' +
      '<cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>';
    var files = [
      { ten: '[Content_Types].xml', du: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { ten: '_rels/.rels', du: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { ten: 'xl/workbook.xml', du: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + x(String(tenTrang || 'Trang1').slice(0, 30)) + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { ten: 'xl/_rels/workbook.xml.rels', du: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { ten: 'xl/styles.xml', du: styles },
      { ten: 'xl/worksheets/sheet1.xml', du: sheet }];
    var b = zip(files);
    return new Blob([b], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  G.XuatWord = { taoFile: taoFile, taoMau: taoMau, taoMauChoi: taoMauChoi, texSangOmml: texSangOmml, taoXlsx: taoXlsx };
})(window);
