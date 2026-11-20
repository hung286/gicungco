'use strict';
/* =====================================================================
   MHEdu Pro — Trộn đề trắc nghiệm thông minh (chạy 100% trên trình duyệt)
   Tác giả: Thầy Nguyễn Mạnh Hùng — Hotline/Zalo: 0965.908.084
   Nguyên lý: thao tác TRỰC TIẾP trên document.xml của file .docx.
   Mỗi câu hỏi = một cụm đoạn văn (w:p). Công thức OMML & hình ảnh nằm
   gọn trong các đoạn văn nên được bê nguyên khi xáo trộn — không cần
   render hay đọc hiểu công thức.
   ===================================================================== */
const $ = s => document.querySelector(s);
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const DP = () => new DOMParser();
const XS = () => new XMLSerializer();

function log(msg, cls) {
  const box = $('#logBox');
  const d = document.createElement('div');
  d.className = cls || '';
  d.textContent = msg;
  box.appendChild(d); box.scrollTop = box.scrollHeight;
}
/* xáo trộn Fisher–Yates */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* text thuần của một đoạn văn (nối mọi w:t) */
/* text thuần của một đoạn văn (nối mọi w:t theo thứ tự run; tab/xuống dòng
   tính là khoảng trắng — trước đây tab bị rớt hẳn nên "A. 6⇥B. 8..." bị đọc
   thành "A. 6B. 8...", máy đếm nhầm 1 nhãn/dòng và xếp dọc phương án) */
function paraText(pEl) {
  let t = '';
  const runs = pEl.getElementsByTagName('w:r');
  for (let i = 0; i < runs.length; i++) {
    const kids = runs[i].childNodes;
    for (let j = 0; j < kids.length; j++) {
      const n = kids[j];
      if (n.nodeType !== 1) continue;
      if (n.tagName === 'w:t') t += n.textContent;
      else if (n.tagName === 'w:tab') t += ' ';
      else if (n.tagName === 'w:br' || n.tagName === 'w:cr') t += '\n';
    }
  }
  return t.replace(/\s+/g, ' ').trim();
}
/* ---------- phân loại đoạn văn ---------- */
const RE_SECTION = /^PHẦN\s*(IV|III|II|I|4|3|2|1)\b/i;
const RE_QUESTION = /^(Câu|Bài)\s*(\d+)\s*[:.\-–]?\s*/i;
const RE_ANSWER = /^(Đáp án|Đáp số|Dap an|Dap so|Answer)\s*[:：]\s*(.+)$/i;
const RE_OPT = /^([A-Da-d])\s*[.\)]\s*/;
const LETTERS = 'ABCDEFGH';
const RE_ST = /^([a-d])\s*[.\)]\s*/;
const RE_TAG = /\s*\[(NB|TH|VD|VDC)\]\s*/gi;
function sectionType(text) {
  const m = text.match(RE_SECTION);
  if (!m) return null;
  const v = m[1].toUpperCase();
  if (v === 'I' || v === '1') return 'mc';
  if (v === 'II' || v === '2') return 'tf';
  if (v === 'III' || v === '3') return 'short';
  return 'essay';
}
function classify(text) {
  if (RE_SECTION.test(text)) return 'section';
  if (RE_ANSWER.test(text)) return 'answer';
  if (RE_QUESTION.test(text)) return 'question';
  return 'other';
}
/* ---------- đọc file .docx ---------- */
async function readDocx(fileOrBuf) {
  const buf = fileOrBuf instanceof ArrayBuffer ? fileOrBuf : await fileOrBuf.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const docXml = await zip.file('word/document.xml').async('string');
  return { zip, doc: DP().parseFromString(docXml, 'application/xml') };
}
function bodyChildren(doc) {
  const bodies = doc.getElementsByTagName('w:body');
  const body = bodies[0];
  return Array.from(body.childNodes).filter(n => n.nodeType === 1);
}
function childXml(el) { return XS().serializeToString(el); }
/* ---------- tách câu hỏi thành khối ---------- */
function splitQuestions(doc) {
  const kids = bodyChildren(doc);
  const sections = []; // {type, headXml, headText, tokens:[{kind:'note'|'question', paras:[{el,xml,text}]}]}
  let cur = null;
  const pending = []; // nội dung trước section/câu hỏi đầu tiên
  function newSection(type, headXml, headText) { cur = { type, headXml, headText, tokens: [] }; sections.push(cur); }
  function flushPending() { pending.forEach(t => cur.tokens.push(t)); pending.length = 0; }
  for (const el of kids) {
    const tag = el.tagName;
    if (tag === 'w:sectPr') { if (cur) cur.sectPr = el; continue; }
    if (tag !== 'w:p') { // bảng biểu...: giữ nguyên tại chỗ
      const tok = { kind: 'other', xml: childXml(el) };
      if (!cur) pending.push(tok); else cur.tokens.push(tok);
      continue;
    }
    const text = paraText(el), cls = classify(text);
    if (cls === 'section') { newSection(sectionType(text), childXml(el), text); flushPending(); continue; }
    if (!cur) {
      if (cls === 'question') { newSection('mc', null, null); }
      else { // nội dung mở đầu: chỉ giữ đoạn có chữ, bỏ dòng trống
        if (text) pending.push({ kind: 'note', paras: [{ el, xml: childXml(el), text, cls }] });
        continue;
      }
    }
    if (cls === 'question') {
      cur.tokens.push({ kind: 'question', paras: [{ el, xml: childXml(el), text }] });
    } else if (cls === 'answer' || cls === 'other') {
      const toks = cur.tokens, last = toks[toks.length - 1];
      if (last && last.kind === 'question') last.paras.push({ el, xml: childXml(el), text, cls });
      else cur.tokens.push({ kind: 'note', paras: [{ el, xml: childXml(el), text, cls }] });
    }
  }
  return sections;
}
/* ---------- phân tích đáp án gốc ---------- */
function parseAnswerKey(type, raw) {
  const r = String(raw).trim();
  if (type === 'mc') {
    const letters = (r.toUpperCase().match(/[A-D]/g) || []);
    const idx = letters.map(l => 'ABCD'.indexOf(l)).filter(i => i >= 0);
    return idx.length ? idx : null;
  }
  if (type === 'tf') {
    const pairs = [...r.matchAll(/([a-d])\s*[-.)]\s*(Đúng|Sai|True|False|[ĐDSdSTF])\s*(?=[,;)\s]|$)/gi)];
    if (pairs.length) {
      const map = {};
      pairs.forEach(pm => { map[pm[1].toLowerCase()] = /^(Đ|D|Đúng|True|T)$/i.test(pm[2]); });
      return map; // {a:true,...}
    }
    const compact = r.replace(/[\s,;.\-()]+/g, '');
    if (/^[ĐDSSTF]+$/i.test(compact) && compact.length)
      return [...compact].map(ch => /^(Đ|D|T)$/i.test(ch));
    return null;
  }
  return r; // short: text
}
/* =====================================================================
   PHẦN TRỘN — thao tác trên chuỗi XML của từng đoạn văn
   ===================================================================== */
/* thay nhãn ở w:t ĐẦU TIÊN chứa nhãn (vd "A." -> "C.", "Câu 5." -> "Câu 1.") */
function replaceFirstLabel(pXml, re, repl) {
  let done = false;
  return pXml.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, (m, t) => {
    if (!done && re.test(t)) {
      done = true;
      const nt = t.replace(re, repl);
      return m.slice(0, m.indexOf('>') + 1) + nt + '</w:t>';
    }
    return m;
  });
}
/* xóa nhãn mức độ [NB]/[TH]/[VD] trong mọi w:t của đoạn */
function cleanTags(pXml) {
  return pXml.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, (m, t) => {
    const nt = t.replace(RE_TAG, ' ').replace(/\s{2,}/g, ' ');
    return nt === t ? m : m.slice(0, m.indexOf('>') + 1) + nt + '</w:t>';
  });
}
/* dựng đoạn văn "Mã đề: 101" căn phải, in đậm */
function madeCodePara(code) {
  return '<w:p><w:pPr><w:jc w:val="right"/><w:rPr><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:pPr>' +
    '<w:r><w:rPr><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve">Mã đề: ' +
    code + '</w:t></w:r></w:p>';
}
/* chuẩn hóa lề: trên 2cm, dưới 2cm, trái 3cm, phải 2cm, khổ A4 */
function normalizeSectPr(sectPrXml) {
  const pgSz = '<w:pgSz w:w="11906" w:h="16838"/>';
  const pgMar = '<w:pgMar w:top="1134" w:bottom="1134" w:left="850" w:right="567" w:header="708" w:footer="708" w:gutter="0"/>';
  let s = sectPrXml || '';
  s = s.replace(/<w:pgMar\b[^>]*\/>/, pgMar).replace(/<w:pgMar\b[^>]*>[\s\S]*?<\/w:pgMar>/, pgMar);
  s = s.replace(/<w:pgSz\b[^>]*\/>/, pgSz).replace(/<w:pgSz\b[^>]*>[\s\S]*?<\/w:pgSz>/, pgSz);
  if (!s) s = '<w:sectPr>' + pgSz + pgMar + '</w:sectPr>';
  else {
    if (!/<w:pgMar\b/.test(s)) s = s.replace(/<\/w:sectPr>/, pgMar + '</w:sectPr>');
    if (!/<w:pgSz\b/.test(s)) s = s.replace(/<\/w:sectPr>/, pgSz + '</w:sectPr>');
  }
  return s;
}
/* tách đáp án ra khỏi khối câu hỏi, trả về {paras:[xml...], answerRaw} */
function extractAnswer(q, type) {
  const paras = [], ans = [];
  for (const p of q.paras) {
    if (p.cls === 'answer') ans.push(p.text.replace(RE_ANSWER, '$2'));
    else paras.push(p);
  }
  return { paras, answerRaw: ans.join(' ').trim() };
}
/* ---- trộn phương án theo SEGMENT: nhiều phương án có thể nằm chung 1 dòng,
   cách nhau bằng tab (vd "A. ⇥ B. ⇥ C. ⇥ D."). Cắt đoạn văn thành từng
   phương án tại vị trí nhãn, trộn, rồi ráp lại giữ nguyên bố cục dòng. ---- */
const HAS_LBL = /(^|[ \t\u00a0])([A-Da-d])\./; // probe (không /g để dùng với test())
function walkT(pEl) {
  const out = [];
  Array.from(pEl.childNodes).forEach(n => {
    if (n.nodeType !== 1 || n.tagName !== 'w:r') return;
    const ts = n.getElementsByTagName('w:t');
    for (let i = 0; i < ts.length; i++) out.push(ts[i]);
  });
  return out;
}
/* tách w:t / w:r sao cho mỗi nhãn phương án bắt đầu một run mới */
function splitLabelRuns(pEl) {
  const ts0 = walkT(pEl);
  const full = ts0.map(t => t.textContent).join('');
  const labels = [...full.matchAll(/(^|[ \t\u00a0])([A-Da-d])\./g)]
    .map(m => m.index + m[1].length);
  if (!labels.length) return 0;
  labels.forEach(pos => {
    const ts = walkT(pEl); // đi lại sau mỗi lần tách
    let acc = 0;
    for (const t of ts) {
      const tx = t.textContent, s = acc, e = acc + tx.length; acc = e;
      if (pos < s || pos > e) continue;
      const run = t.parentNode;
      let labelT = t;
      if (pos > s) { // tách w:t tại pos
        const off = pos - s;
        const t2 = t.cloneNode(false);
        t2.textContent = tx.slice(off);
        t.textContent = tx.slice(0, off);
        run.insertBefore(t2, t.nextSibling);
        labelT = t2;
      }
      const r = labelT.parentNode;
      if (r.firstChild !== labelT) { // tách run để nhãn đứng đầu run
        const run2 = r.cloneNode(false);
        let cur = labelT;
        while (cur) { const tmp = cur.nextSibling; run2.appendChild(cur); cur = tmp; }
        r.parentNode.insertBefore(run2, r.nextSibling);
      }
      break;
    }
  });
  return labels.length;
}
/* chuẩn hóa tab của 1 segment: bỏ tab thừa ở đầu/cuối để khi ráp lại đều nhau */
function cleanSegmentTabs(nodes) {
  const isTabRun = (n) => {
    if (!n || n.tagName !== 'w:r') return false;
    const kids = Array.from(n.childNodes).filter(c => c.nodeType === 1);
    return kids.length > 0 && kids.every(c => c.tagName === 'w:tab' || c.tagName === 'w:rPr');
  };
  while (nodes.length && isTabRun(nodes[0])) nodes.shift();
  while (nodes.length) {
    const last = nodes[nodes.length - 1];
    if (isTabRun(last)) { nodes.pop(); continue; }
    if (last.tagName === 'w:r') {
      const kids = Array.from(last.childNodes).filter(c => c.nodeType === 1);
      for (let i = kids.length - 1; i >= 0; i--) {
        if (kids[i].tagName === 'w:tab') last.removeChild(kids[i]);
        else break;
      }
    }
    break;
  }
}
function makeTabRun(doc) {
  const r = doc.createElementNS(W, 'w:r');
  r.appendChild(doc.createElementNS(W, 'w:tab'));
  return r;
}
/* tách đoạn văn thành {head, segments:[{letter, nodes}]} (bỏ qua w:pPr) */
function paraSegments(pEl) {
  splitLabelRuns(pEl);
  const kids = Array.from(pEl.childNodes).filter(n => n.nodeType === 1 && n.tagName !== 'w:pPr');
  const labelOf = (n) => {
    if (n.tagName !== 'w:r') return null;
    const ts = n.getElementsByTagName('w:t');
    if (!ts.length) return null;
    const mm = ts[0].textContent.match(/^([A-Da-d])\./);
    return mm ? mm[1].toUpperCase() : null;
  };
  const li = [];
  kids.forEach((n, i) => { if (labelOf(n)) li.push(i); });
  if (!li.length) return null;
  return {
    head: kids.slice(0, li[0]),
    segments: li.map((s, k) => ({
      letter: labelOf(kids[s]),
      nodes: kids.slice(s, li[k + 1] != null ? li[k + 1] : kids.length)
    }))
  };
}
/* dãy đáp án mục tiêu cân bằng: A/B/C/D phân bố đều nhau */
function balancedTargets(n) {
  const L = ['A', 'B', 'C', 'D'];
  const base = Math.floor(n / 4), rem = n % 4;
  const arr = [];
  L.forEach(x => { for (let k = 0; k < base; k++) arr.push(x); });
  shuffle(L).slice(0, rem).forEach(x => arr.push(x));
  return shuffle(arr);
}
/* chọn thứ tự câu: ưu tiên khác gốc và chưa dùng ở các mã đề trước */
function pickDiverseOrder(qToks, secType, usedOrders) {
  if (qToks.length < 2) return qToks;
  const used = usedOrders ? (usedOrders[secType] || (usedOrders[secType] = new Set())) : null;
  const sig = (arr) => arr.map(q => (q.paras[0].text.match(RE_QUESTION) || [])[2] || '?').join(',');
  const origSig = sig(qToks);
  let best = null, bestSig = null;
  // vòng 1: ưu tiên thứ tự khác gốc và chưa dùng
  for (let attempt = 0; attempt < 30; attempt++) {
    const arr = shuffle(qToks.slice());
    const s = sig(arr);
    if (s === origSig) continue;
    if (!used || !used.has(s)) { best = arr; bestSig = s; break; }
    if (!best) { best = arr; bestSig = s; }
  }
  // vòng 2: nếu mọi thứ tự khác gốc đều đã dùng (vd chỉ có 2 câu),
  // cho phép dùng lại bất kỳ thứ tự nào chưa dùng, kể cả gốc — để các mã đề đa dạng
  if (used && (!best || used.has(bestSig))) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const arr = shuffle(qToks.slice());
      const s = sig(arr);
      if (!used.has(s)) { best = arr; bestSig = s; break; }
    }
  }
  if (!best) best = shuffle(qToks.slice());
  if (used && bestSig) used.add(bestSig);
  return best;
}
/* nhận diện đáp án đúng qua gạch chân (w:u) — trả về index 0-3 hoặc null */
function detectUnderlineAnswer(t) {
  for (const p of t.paras) {
    if (!p.el.getElementsByTagName) continue;
    const runs = Array.from(p.el.getElementsByTagName('w:r'));
    let curLabel = null;
    for (const r of runs) {
      const tEl = r.getElementsByTagName('w:t')[0];
      if (tEl) {
        const m = tEl.textContent.match(/^([A-Da-d])\./);
        if (m) curLabel = m[1].toUpperCase();
      }
      const rPr = r.getElementsByTagName('w:rPr')[0];
      if (rPr && rPr.getElementsByTagName('w:u').length > 0) {
        const u = rPr.getElementsByTagName('w:u')[0];
        const val = u.getAttribute('w:val');
        if ((!val || val !== 'none') && curLabel) return LETTERS.indexOf(curLabel);
      }
    }
  }
  return null;
}
/* =====================================================================
   TÔ NHÃN — in đậm + xanh dương các nhãn, chạy SAU khi trộn xong.
   Lý do chạy sau: lúc trộn, nhãn phương án được dựng lại (mkLabelRun),
   số câu được đánh lại (replaceFirstLabel) nên tô trước sẽ bị mất;
   tô sau thì mọi nhãn trong đề cuối đều được tô. Tiêu đề (ghép ở
   makeExamDocx, SAU bước này) không đi qua hàm này nên giữ nguyên.
   Nhãn được tô: "Phần I." (chỉ phần nhãn, chữ sau giữ nguyên),
   "Câu N.", "Bài N.", "A."/"B."/"C."/"D.", "a)"/"b)"/"c)"/"d)".
   Nhãn phương án giữa đoạn chỉ tô khi cả đoạn có >= 2 nhãn (tránh tô
   nhầm chữ "A." trong câu văn thường).
   ===================================================================== */
const LABEL_BLUE = '0000FF';
function labelSpansOf(full) {
  const spans = [];
  const lead = (full.match(/^\s*/) || [''])[0].length;
  const rest = full.slice(lead);
  const m0 = rest.match(/^(PHẦN|Phần|phần)\s+(IV|III|II|I|4|3|2|1)\s*[.:]?/i)
    || rest.match(/^(Câu|Bài)\s*\d+\s*[.:]?/i)
    || rest.match(/^[A-D][.)]/)
    || rest.match(/^[a-d][.)]/);
  if (m0) spans.push([lead, lead + m0[0].length]);
  // nhãn phương án/mệnh đề trong đoạn (kể cả ở đầu đoạn)
  const opt = [];
  const re = /(^|[\s\u00a0])([A-Da-d][.)])/g;
  let mm;
  while ((mm = re.exec(full)) !== null) {
    const s = mm.index + mm[1].length, e = s + mm[2].length;
    if (!opt.some(o => o[0] === s)) opt.push([s, e]);
  }
  if (opt.length >= 2) opt.forEach(o => { if (!spans.some(sp => sp[0] === o[0])) spans.push(o); });
  spans.sort((a, b) => a[0] - b[0]);
  return spans;
}
/* các đoạn text của đoạn văn theo thứ tự: w:t thật + ký tự giữ chỗ cho tab/xuống dòng
   (để nhãn sau tab vẫn tính đúng vị trí khi nối text thành chuỗi) */
function paraTextSegs(pEl) {
  const segs = [];
  Array.from(pEl.getElementsByTagName('w:r')).forEach(r => {
    Array.from(r.childNodes).forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.tagName === 'w:t') segs.push({ t: n, text: n.textContent });
      else if (n.tagName === 'w:tab') segs.push({ t: null, text: '\t' });
      else if (n.tagName === 'w:br' || n.tagName === 'w:cr') segs.push({ t: null, text: '\n' });
    });
  });
  return segs;
}
/* tách + tô 1 nhãn [start,end) trong đoạn văn (đi lại sau mỗi lần tách, như splitLabelRuns) */
function styleRunLabel(doc, pEl, span) {
  let start = span[0], end = span[1];
  for (;;) {
    const segs = paraTextSegs(pEl);
    let acc = 0, piece = null;
    for (const sg of segs) {
      const s = acc, e = acc + sg.text.length; acc = e;
      if (!sg.t) continue; // ký tự giữ chỗ (tab/xuống dòng) không chứa nhãn
      const ps = Math.max(s, start), pe = Math.min(e, end);
      if (pe > ps) { piece = { t: sg.t, s, e, ps, pe }; break; }
    }
    if (!piece) return;
    const run = piece.t.parentNode;
    const rPr = run.getElementsByTagName('w:rPr')[0];
    // tách w:t để nhãn bắt đầu đúng đầu w:t
    if (piece.ps > piece.s) {
      const off = piece.ps - piece.s;
      const t2 = piece.t.cloneNode(false);
      t2.textContent = piece.t.textContent.slice(off);
      piece.t.textContent = piece.t.textContent.slice(0, off);
      run.insertBefore(t2, piece.t.nextSibling);
      piece.t = t2; piece.s = piece.ps;
    }
    // tách run để nhãn đứng đầu run (run mới GIỮ rPr gốc, khác splitLabelRuns)
    let labelRun = run;
    if (run.firstChild !== piece.t) {
      const run2 = doc.createElementNS(W, 'w:r');
      if (rPr) run2.appendChild(rPr.cloneNode(true));
      let cur = piece.t;
      while (cur) { const tmp = cur.nextSibling; run2.appendChild(cur); cur = tmp; }
      run.parentNode.insertBefore(run2, run.nextSibling);
      labelRun = run2;
    }
    // tách run để nhãn kết thúc đúng cuối run: phần sau nhãn sang run mới giữ định dạng gốc
    const lt = labelRun.getElementsByTagName('w:t')[0];
    if (piece.pe < piece.e) {
      const off = piece.pe - piece.ps;
      const t2 = lt.cloneNode(false);
      t2.textContent = lt.textContent.slice(off);
      lt.textContent = lt.textContent.slice(0, off);
      labelRun.insertBefore(t2, lt.nextSibling);
      const run3 = doc.createElementNS(W, 'w:r');
      if (rPr) run3.appendChild(rPr.cloneNode(true));
      let cur = t2;
      while (cur) { const tmp = cur.nextSibling; run3.appendChild(cur); cur = tmp; }
      labelRun.parentNode.insertBefore(run3, labelRun.nextSibling);
    } else if (lt.nextSibling) {
      const run3 = doc.createElementNS(W, 'w:r');
      if (rPr) run3.appendChild(rPr.cloneNode(true));
      let cur = lt.nextSibling;
      while (cur) { const tmp = cur.nextSibling; run3.appendChild(cur); cur = tmp; }
      labelRun.parentNode.insertBefore(run3, labelRun.nextSibling);
    }
    // tô run nhãn: đảm bảo rPr, bỏ b/bCs/color cũ, thêm b + bCs + xanh dương
    let lPr = labelRun.getElementsByTagName('w:rPr')[0];
    if (!lPr) { lPr = doc.createElementNS(W, 'w:rPr'); labelRun.insertBefore(lPr, labelRun.firstChild); }
    ['w:b', 'w:bCs', 'w:color'].forEach(tag => {
      const els = lPr.getElementsByTagName(tag);
      for (let i = els.length - 1; i >= 0; i--) lPr.removeChild(els[i]);
    });
    const b = doc.createElementNS(W, 'w:b');
    const bCs = doc.createElementNS(W, 'w:bCs');
    const col = doc.createElementNS(W, 'w:color');
    col.setAttribute('w:val', LABEL_BLUE);
    lPr.appendChild(b); lPr.appendChild(bCs); lPr.appendChild(col);
    // nhãn bị tách làm nhiều run (vd "A" + ". ")? tô tiếp phần còn lại
    if (piece.pe < end) { start = piece.pe; continue; }
    return;
  }
}
/* tô nhãn cho toàn bộ bodyInner (kể cả đoạn trong ô bảng) */
function styleLabelsInBody(bodyInner) {
  const frag = DP().parseFromString('<w:root xmlns:w="' + W + '">' + bodyInner + '</w:root>', 'application/xml');
  const paras = Array.from(frag.getElementsByTagName('w:p'));
  paras.forEach(pEl => {
    const full = paraTextSegs(pEl).map(sg => sg.text).join('');
    labelSpansOf(full).forEach(sp => styleRunLabel(frag, pEl, sp));
  });
  let out = '';
  const root = frag.documentElement;
  for (let n = root.firstChild; n; n = n.nextSibling) out += XS().serializeToString(n);
  return out;
}
/* tách run/w:t tại vị trí các nhãn a)/b)/c)/d) (tab tính là khoảng trắng),
   để mỗi nhãn bắt đầu 1 run mới — phục vụ cắt khối mệnh đề Đ/S */
function splitTFLabelRuns(pEl) {
  const full0 = paraTextSegs(pEl).map(sg => sg.text).join('');
  const positions = [];
  const re = /(^|[\s\u00a0])([a-dA-D])[.)]/g;
  let mm;
  while ((mm = re.exec(full0)) !== null) positions.push(mm.index + mm[1].length);
  positions.forEach(pos => {
    const segs = paraTextSegs(pEl); // đi lại sau mỗi lần tách (text không đổi)
    let acc = 0;
    for (const sg of segs) {
      const s = acc, e = acc + sg.text.length; acc = e;
      if (!sg.t || pos < s || pos >= e) continue;
      const run = sg.t.parentNode;
      let labelT = sg.t;
      if (pos > s) {
        const off = pos - s;
        const t2 = sg.t.cloneNode(false);
        t2.textContent = sg.t.textContent.slice(off);
        sg.t.textContent = sg.t.textContent.slice(0, off);
        run.insertBefore(t2, sg.t.nextSibling);
        labelT = t2;
      }
      const r = labelT.parentNode;
      if (r.firstChild !== labelT) {
        const run2 = pEl.ownerDocument.createElementNS(W, 'w:r');
        const rPr = r.getElementsByTagName('w:rPr')[0];
        if (rPr) run2.appendChild(rPr.cloneNode(true));
        let cur = labelT;
        while (cur) { const tmp = cur.nextSibling; run2.appendChild(cur); cur = tmp; }
        r.parentNode.insertBefore(run2, r.nextSibling);
      }
      break;
    }
  });
}
/* bỏ phần nhãn khỏi đoạn đầu của 1 nhóm mệnh đề đã nhân bản; trả về rPr nhãn gốc */
function stripTFGroupLabel(clonedSegs) {
  const seg0 = clonedSegs[0];
  if (!seg0 || !seg0.runs.length) return null;
  const first = seg0.runs[0];
  const rPr = first.getElementsByTagName('w:rPr')[0];
  const labelRpr = rPr ? rPr.cloneNode(true) : null;
  const runEmpty = (run) => run.getElementsByTagName('w:t').length === 0;
  const stripSepFromRun = (run) => {
    const tn = run.getElementsByTagName('w:t')[0];
    if (!tn) return;
    const m2 = tn.textContent.match(/^\s*[.)]\s*/);
    if (!m2) return;
    if (m2[0].length < tn.textContent.length) tn.textContent = tn.textContent.slice(m2[0].length);
    else run.removeChild(tn);
  };
  const t0 = first.getElementsByTagName('w:t')[0];
  if (!t0) return labelRpr;
  const tx = t0.textContent;
  const m = tx.match(/^\s*[a-dA-D][.)]\s*/);
  if (m) {
    if (m[0].length < tx.length) t0.textContent = tx.slice(m[0].length);
    else {
      first.removeChild(t0);
      if (runEmpty(first)) seg0.runs.shift();
    }
    return labelRpr;
  }
  if (/^\s*[a-dA-D]\s*$/.test(tx)) {
    first.removeChild(t0);
    if (runEmpty(first)) {
      seg0.runs.shift();
      const nx = seg0.runs[0];
      if (nx) { stripSepFromRun(nx); if (runEmpty(nx)) seg0.runs.shift(); }
    } else {
      stripSepFromRun(first);
    }
    return labelRpr;
  }
  return labelRpr;
}
/* trộn MỘT mã đề — trả về {bodyInnerXml, keys:[{id,key,essay}]} */
function buildVersion(sections, code, opts, usedOrders) {
  const keys = [];
  const out = [];
  const SEC_LABEL = { mc: 'I', tf: 'II', short: 'III', essay: 'IV' };
  // đọc trước đáp án các câu Phần I (để cân bằng + gán mục tiêu)
  sections.forEach(sec => {
    if (sec.type !== 'mc') return;
    sec.tokens.forEach(t => {
      if (t.kind !== 'question') return;
      delete t._target;
      const { answerRaw } = extractAnswer(t, 'mc');
      const k = parseAnswerKey('mc', answerRaw);
      t._key = (k && k[0] != null) ? k[0] : null;
      if (t._key == null) t._key = detectUnderlineAnswer(t); // fallback: gạch chân
    });
  });
  sections.forEach((sec, si) => {
    if (sec.headXml) out.push(sec.headXml);
    const qToks = sec.tokens.filter(t => t.kind === 'question');
    let order;
    if (sec.type === 'essay') order = qToks;
    else order = pickDiverseOrder(qToks, sec.type, usedOrders);
    // cân bằng đáp án đúng cho Phần I: A/B/C/D phân bố đều mỗi mã đề
    if (sec.type === 'mc' && opts.balanceKeys) {
      const keyed = order.filter(q => q._key != null);
      const tg = balancedTargets(keyed.length);
      keyed.forEach((q, i) => { q._target = tg[i]; });
    }
    let qNo = 0;
    const queue = order.slice();
    for (const tok of sec.tokens) {
      if (tok.kind !== 'question') { // note / other / bảng: giữ nguyên vị trí
        if (tok.kind === 'note') tok.paras.forEach(p => out.push(p.xml));
        else out.push(tok.xml);
        continue;
      }
      const q = queue.shift();
      qNo++;
      const origNo = (q.paras[0].text.match(RE_QUESTION) || [])[2] || '?';
      const id = SEC_LABEL[sec.type] + '-' + origNo;
      const { paras, answerRaw } = extractAnswer(q, sec.type);
      if (sec.type === 'mc') {
        let newKey = '?';
        // vùng phương án: từ đoạn đầu tiên có nhãn đến đoạn cuối cùng có nhãn
        let z0 = -1, z1 = -1;
        paras.forEach((p, i) => { if (HAS_LBL.test(p.text)) { if (z0 < 0) z0 = i; z1 = i; } });
        if (z0 >= 0 && opts.shuffleOpts) {
          // Nhóm các run theo nhãn phương án (xử lý cả nhãn bị tách 2 run: "B" + ". ")
          // rồi xáo trộn, cho vào bảng 4 ô (1/2/4 hàng theo file gốc), đánh lại nhãn.
          const runText = (r) => {
            const ts = r.getElementsByTagName('w:t');
            let t = '';
            for (let k = 0; k < ts.length; k++) t += ts[k].textContent;
            return t;
          };
          const isLabelRun = (r) => {
            const t = runText(r).trim();
            return /^[A-Da-d]\.?$/.test(t) || t === '.';
          };
          const allRuns = [];
          for (let i = z0; i <= z1; i++) {
            const rs = paras[i].el.getElementsByTagName('w:r');
            for (let j = 0; j < rs.length; j++) allRuns.push(rs[j]);
          }
          const groups = [];
          let curG = null;
          for (let i = 0; i < allRuns.length; i++) {
            const t = runText(allRuns[i]);
            let isLbl = false, letter = null;
            const m1 = t.match(/^\s*([A-Da-d])\./);
            if (m1) { isLbl = true; letter = m1[1].toUpperCase(); }
            else {
              const m2 = t.match(/^\s*([A-Da-d])\s*$/);
              if (m2 && i + 1 < allRuns.length && /^\s*\./.test(runText(allRuns[i + 1]))) {
                isLbl = true; letter = m2[1].toUpperCase();
              }
            }
            if (isLbl) { curG = { letter, runs: [] }; groups.push(curG); }
            if (curG) curG.runs.push(allRuns[i]);
          }
          if (groups.length >= 2) {
            // tách content (bỏ các run chỉ là nhãn)
            groups.forEach(g => { g.contentRuns = g.runs.filter(r => !isLabelRun(r)); });
            const correct = q._key != null ? groups.find(g => LETTERS.indexOf(g.letter) === q._key) : null;
            const sh = shuffle(groups.slice());
            let newOrder = sh;
            if (correct && q._target) {
              const tp = LETTERS.indexOf(q._target);
              if (tp >= 0 && tp < sh.length) {
                const rest = sh.filter(g => g !== correct);
                newOrder = [];
                for (let pos = 0; pos < sh.length; pos++) newOrder[pos] = (pos === tp) ? correct : rest.shift();
                newKey = q._target;
              }
            }
            if (newKey === '?') newKey = correct ? LETTERS[newOrder.indexOf(correct)] : '?';
            // layout gốc: đếm số nhãn trên mỗi dòng
            let perRow = 2;
            const lineCounts = paras.slice(z0, z1 + 1).map(p => (p.text.match(/(^|[\s\u00a0])([A-Da-d])\./g) || []).length);
            const maxPerLine = Math.max(...lineCounts);
            if (maxPerLine >= 4) perRow = 4; else if (maxPerLine <= 1) perRow = 1;
            const doc = paras[z0].el.ownerDocument;
            const mkEl = (tag) => doc.createElementNS(W, tag);
            const mkLabelRun = (label) => {
              const r = mkEl('w:r');
              // copy định dạng từ run nhãn gốc đầu tiên
              const srcR = groups[0].runs[0];
              const srcPr = srcR.getElementsByTagName('w:rPr')[0];
              if (srcPr) r.appendChild(srcPr.cloneNode(true));
              const t = mkEl('w:t');
              t.setAttribute('xml:space', 'preserve');
              t.textContent = label + '. ';
              r.appendChild(t);
              return r;
            };
            const mkCellPara = (label, contentRuns) => {
              const pEl = mkEl('w:p');
              const pPr = mkEl('w:pPr');
              const jc = mkEl('w:jc'); jc.setAttribute('w:val', 'left');
              pPr.appendChild(jc);
              const sp = mkEl('w:spacing'); sp.setAttribute('w:before', '0'); sp.setAttribute('w:after', '0');
              sp.setAttribute('w:line', '240'); sp.setAttribute('w:lineRule', 'auto');
              pPr.appendChild(sp);
              pEl.appendChild(pPr);
              pEl.appendChild(mkLabelRun(label));
              contentRuns.forEach(nd => pEl.appendChild(nd.cloneNode(true)));
              return pEl;
            };
            const newBlocks = [];
            if (perRow === 1) {
              newOrder.forEach((g, pos) => newBlocks.push(mkCellPara(LETTERS[pos], g.contentRuns)));
            } else {
              // Bảng rộng bằng nhau (10490 twips = A4 trừ lề trái 1.5cm/phải 1cm), các cột chia đều,
              // ô căn trên để cùng hàng thẳng nhau.
              const TBL_W = 10490;
              const COL_W = Math.floor(TBL_W / perRow);
              const tbl = mkEl('w:tbl');
              const tblPr = mkEl('w:tblPr');
              const tblW = mkEl('w:tblW'); tblW.setAttribute('w:w', String(TBL_W)); tblW.setAttribute('w:type', 'dxa');
              tblPr.appendChild(tblW);
              const tbd = mkEl('w:tblBorders');
              ['top','left','bottom','right','insideH','insideV'].forEach(bn => {
                const be = mkEl('w:' + bn);
                be.setAttribute('w:val', 'nil'); be.setAttribute('w:sz', '0');
                be.setAttribute('w:space', '0'); be.setAttribute('w:color', 'auto');
                tbd.appendChild(be);
              });
              tblPr.appendChild(tbd);
              tbl.appendChild(tblPr);
              const grid = mkEl('w:tblGrid');
              for (let c = 0; c < perRow; c++) {
                const gc = mkEl('w:gridCol');
                gc.setAttribute('w:w', String(COL_W));
                grid.appendChild(gc);
              }
              tbl.appendChild(grid);
              for (let r = 0; r < newOrder.length; r += perRow) {
                const tr = mkEl('w:tr');
                for (let c = 0; c < perRow; c++) {
                  const tc = mkEl('w:tc');
                  const idx = r + c;
                  if (idx < newOrder.length) tc.appendChild(mkCellPara(LETTERS[idx], newOrder[idx].contentRuns));
                  else { const ep = mkEl('w:p'); tc.appendChild(ep); }
                  const tcPr = mkEl('w:tcPr');
                  const tcW = mkEl('w:tcW'); tcW.setAttribute('w:w', String(COL_W)); tcW.setAttribute('w:type', 'dxa');
                  tcPr.appendChild(tcW);
                  const vA = mkEl('w:vAlign'); vA.setAttribute('w:val', 'top');
                  tcPr.appendChild(vA);
                  const tcMar = mkEl('w:tcMar');
                  [['w:top', '0'], ['w:bottom', '0'], ['w:left', '40'], ['w:right', '40']].forEach(([tn, tv]) => {
                    const me = mkEl(tn); me.setAttribute('w:w', tv); me.setAttribute('w:type', 'dxa');
                    tcMar.appendChild(me);
                  });
                  tcPr.appendChild(tcMar);
                  tc.insertBefore(tcPr, tc.firstChild);
                  tr.appendChild(tc);
                }
                tbl.appendChild(tr);
              }
              newBlocks.push(tbl);
            }
            const firstEl = paras[z0].el;
            const parent = firstEl.parentNode;
            newBlocks.forEach(el => parent.insertBefore(el, firstEl));
            for (let i = z1; i >= z0; i--) {
              const oldEl = paras[i].el;
              if (oldEl.parentNode) oldEl.parentNode.removeChild(oldEl);
            }
            if (newBlocks.length === 1 && newBlocks[0].tagName === 'w:tbl') {
              paras.splice(z0, z1 - z0 + 1, { el: newBlocks[0], text: '', xml: '', isTbl: true });
            } else {
              paras.splice(z0, z1 - z0 + 1, ...newBlocks.map(el => ({ el, text: '', xml: '' })));
            }
          } else if (q._key != null) newKey = LETTERS[q._key];
        } else if (q._key != null) {
          newKey = LETTERS[q._key];
        }
        keys.push({ id, key: newKey, essay: false });
      } else if (sec.type === 'tf') {
        const key = parseAnswerKey(sec.type, answerRaw);
        let k = '?';
        if (Array.isArray(key)) k = key.map(b => b ? 'D' : 'S').join('');
        else if (key && typeof key === 'object') k = ['a','b','c','d'].map(L => key[L] == null ? '?' : (key[L] ? 'D' : 'S')).join('');
        // Trộn mệnh đề a-d (nếu bật) theo kiểu phương án Phần I: cắt mỗi mệnh đề
        // thành 1 khối DOM (giữ nguyên công thức OMML, hình, định dạng), xáo khối,
        // xếp tất cả vào 1 bảng 1 cột (không viền), đánh lại nhãn a)/b)/c)/d).
        // Đáp án Đ/S đi theo từng mệnh đề, ghép theo CHỮ CÁI (không theo vị trí).
        // (Bản cũ tách nội dung thành text thuần rồi viết lại nên công thức bị phá.)
        if (opts.shuffleTF && k !== '?' && paras.length) {
          const doc = paras[0].el.ownerDocument;
          const mkEl = (tag) => doc.createElementNS(W, tag);
          const runText = (r) => {
            const ts = r.getElementsByTagName('w:t');
            let t = '';
            for (let i = 0; i < ts.length; i++) t += ts[i].textContent;
            return t;
          };
          const tfLabelOf = (r, nextR) => {
            const t = runText(r);
            const m = t.match(/^\s*([a-dA-D])[.)]/);
            if (m) return m[1].toLowerCase();
            if (/^\s*[a-dA-D]\s*$/.test(t)) {
              const ts = r.getElementsByTagName('w:t');
              const tn = ts.length > 1 ? ts[1] : (nextR ? nextR.getElementsByTagName('w:t')[0] : null);
              if (tn && /^\s*[.)]/.test(tn.textContent)) return t.trim().toLowerCase();
            }
            return null;
          };
          let s0 = -1, s1 = -1;
          paras.forEach((p, i) => {
            if (/^\s*[aA][.)]/.test(p.text)) { if (s0 < 0) s0 = i; }
            if (/(^|[\s\u00a0])[a-dA-D][.)]/.test(p.text)) s1 = i;
          });
          if (s0 >= 0 && s1 >= s0) {
            for (let i = s0; i <= s1; i++) splitTFLabelRuns(paras[i].el);
            const groups = [];
            let curG = null;
            for (let i = s0; i <= s1; i++) {
              const pEl = paras[i].el;
              const pPr = pEl.getElementsByTagName('w:pPr')[0];
              let curSeg = null;
              const newSeg = () => {
                curSeg = { pPr: pPr ? pPr.cloneNode(true) : null, runs: [] };
                if (curG) curG.segs.push(curSeg);
              };
              newSeg();
              const runs = Array.from(pEl.getElementsByTagName('w:r'));
              for (let j = 0; j < runs.length; j++) {
                const letter = tfLabelOf(runs[j], runs[j + 1] || null);
                if (letter) {
                  curG = { letter, segs: [] };
                  groups.push(curG);
                  newSeg();
                }
                if (curG) curSeg.runs.push(runs[j]);
              }
            }
            groups.forEach(g => { g.segs = g.segs.filter(sg => sg.runs.length > 0); });
            const okGroups = groups.filter(g => g.segs.length > 0);
            const letters = okGroups.map(g => g.letter);
            const distinct = new Set(letters).size === letters.length;
            if (okGroups.length >= 2 && okGroups.length === k.length && distinct && !k.includes('?')) {
              okGroups.forEach(g => {
                g.firstPPr = g.segs[0].pPr;
                g.cloned = g.segs.map(sg => ({ pPr: sg.pPr, runs: sg.runs.map(r => r.cloneNode(true)) }));
                g.labelRpr = stripTFGroupLabel(g.cloned);
                g.cloned = g.cloned.filter(sg => sg.runs.length > 0);
                g.isTrue = k['abcd'.indexOf(g.letter)] === 'D';
              });
              const sh = shuffle(okGroups.slice());
              const tbl = mkEl('w:tbl');
              const tblPr = mkEl('w:tblPr');
              const tblW = mkEl('w:tblW'); tblW.setAttribute('w:w', '10490'); tblW.setAttribute('w:type', 'dxa');
              tblPr.appendChild(tblW);
              const tbd = mkEl('w:tblBorders');
              ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].forEach(bn => {
                const be = mkEl('w:' + bn);
                be.setAttribute('w:val', 'nil'); be.setAttribute('w:sz', '0');
                be.setAttribute('w:space', '0'); be.setAttribute('w:color', 'auto');
                tbd.appendChild(be);
              });
              tblPr.appendChild(tbd);
              tbl.appendChild(tblPr);
              const grid = mkEl('w:tblGrid');
              const gc = mkEl('w:gridCol'); gc.setAttribute('w:w', '10490');
              grid.appendChild(gc);
              tbl.appendChild(grid);
              sh.forEach((g, pos) => {
                const tr = mkEl('w:tr');
                const tc = mkEl('w:tc');
                const tcPr = mkEl('w:tcPr');
                const tcW = mkEl('w:tcW'); tcW.setAttribute('w:w', '10490'); tcW.setAttribute('w:type', 'dxa');
                tcPr.appendChild(tcW);
                const vA = mkEl('w:vAlign'); vA.setAttribute('w:val', 'top');
                tcPr.appendChild(vA);
                const tcMar2 = mkEl('w:tcMar');
                [['w:top', '0'], ['w:bottom', '0'], ['w:left', '40'], ['w:right', '40']].forEach(([tn, tv]) => {
                  const me2 = mkEl(tn); me2.setAttribute('w:w', tv); me2.setAttribute('w:type', 'dxa');
                  tcMar2.appendChild(me2);
                });
                tcPr.appendChild(tcMar2);
                tc.appendChild(tcPr);
                g.cloned.forEach((sg, si) => {
                  const pEl = mkEl('w:p');
                  const usePr = si === 0 ? g.firstPPr : sg.pPr;
                  if (usePr) {
                    const pPrC = usePr.cloneNode(true);
                    let sp2 = null;
                    for (let k = 0; k < pPrC.childNodes.length; k++) {
                      if (pPrC.childNodes[k].tagName === 'w:spacing') { sp2 = pPrC.childNodes[k]; break; }
                    }
                    if (!sp2) { sp2 = mkEl('w:spacing'); pPrC.appendChild(sp2); }
                    sp2.setAttribute('w:before', '0'); sp2.setAttribute('w:after', '0');
                    sp2.setAttribute('w:line', '240'); sp2.setAttribute('w:lineRule', 'auto');
                    pEl.appendChild(pPrC);
                  }
                  if (si === 0) {
                    const lr = mkEl('w:r');
                    if (g.labelRpr) lr.appendChild(g.labelRpr.cloneNode(true));
                    const lt = mkEl('w:t'); lt.setAttribute('xml:space', 'preserve');
                    lt.textContent = 'abcd'[pos] + ') ';
                    lr.appendChild(lt);
                    pEl.appendChild(lr);
                  }
                  sg.runs.forEach(r => pEl.appendChild(r));
                  tc.appendChild(pEl);
                });
                tr.appendChild(tc);
                tbl.appendChild(tr);
              });
              const firstEl = paras[s0].el;
              const parent = firstEl.parentNode;
              parent.insertBefore(tbl, firstEl);
              for (let i = s1; i >= s0; i--) {
                const oldEl = paras[i].el;
                if (oldEl.parentNode) oldEl.parentNode.removeChild(oldEl);
              }
              paras.splice(s0, s1 - s0 + 1, { el: tbl, text: '', xml: '', isTbl: true });
              k = sh.map(g => g.isTrue ? 'D' : 'S').join('');
            }
          }
        }
        keys.push({ id, key: k, essay: false });
      } else if (sec.type === 'short') {
        keys.push({ id, key: parseAnswerKey(sec.type, answerRaw) || '?', essay: false });
      } else {
        keys.push({ id, key: '—', essay: true });
      }
      // serialize SAU khi trộn (mc sửa trực tiếp DOM)
      const xmls = paras.map(p => childXml(p.el));
      // đánh lại số câu + xóa nhãn mức độ ở đoạn đầu (giữ nguyên "Câu"/"Bài")
      if (xmls.length) {
        let first = xmls[0];
        if (opts.renumber) {
          const qm = q.paras[0].text.match(RE_QUESTION);
          const word = qm ? qm[1] : 'Câu';
          first = replaceFirstLabel(first, RE_QUESTION, word + ' ' + qNo + '. ');
        }
        if (opts.cleanTags) first = cleanTags(first);
        xmls[0] = first;
      }
      xmls.forEach(x => out.push(x));
    }
    if (sec.sectPr) out._sectPr = childXml(sec.sectPr);
  });
  const sectPr = normalizeSectPr(out._sectPr);
  delete out._sectPr;
  const bodyInner = opts.labelStyle !== false ? styleLabelsInBody(out.join('')) : out.join('');
  return { bodyInner, sectPr, keys };
}
/* =====================================================================
   DỰNG FILE — ghép tiêu đề + câu hỏi đã trộn thành document.xml mới
   ===================================================================== */
function getBodyInner(docXml) {
  const m = docXml.match(/<w:body[^>]*>([\s\S]*)<\/w:body>/);
  return m ? m[1] : '';
}
/* lấy các đoạn văn trong file tiêu đề (bỏ sectPr) */
function headerParas(doc) {
  const out = [];
  for (const el of bodyChildren(doc)) {
    if (el.tagName === 'w:sectPr') continue;
    out.push({ xml: childXml(el), text: el.tagName === 'w:p' ? paraText(el) : '' });
  }
  return out;
}
/* dựng 1 file đề hoàn chỉnh -> Uint8Array (docx) */
async function makeExamDocx(examZip, examDocXml, headerDoc, version, code) {
  let bodyInner = getBodyInner(examDocXml);
  // chèn tiêu đề lên đầu
  let headXml = '';
  if (headerDoc) {
    const hps = headerParas(headerDoc);
    let replaced = false;
    headXml = hps.map(h => {
      if (!replaced && h.text && /mã đề/i.test(h.text)) {
        replaced = true;
        return madeCodePara(code); // thay dòng "Mã đề: ..." bằng mã thật
      }
      return h.xml;
    }).join('');
    if (!replaced) headXml += madeCodePara(code);
  } else {
    headXml = madeCodePara(code);
  }
  const newBody = headXml + version.bodyInner + version.sectPr;
  const newDocXml = examDocXml.replace(/<w:body[^>]*>[\s\S]*<\/w:body>/, () => '<w:body>' + newBody + '</w:body>');
  const zip = examZip.clone();
  zip.file('word/document.xml', newDocXml);
  return await zip.generateAsync({ type: 'uint8array' });
}
/* ---------- file đáp án Word: bảng Câu x Mã đề ---------- */
function tableCell(text, bold, center) {
  const t = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>' +
    '<w:tcMar><w:top w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:left w:w="40" w:type="dxa"/><w:right w:w="40" w:type="dxa"/></w:tcMar></w:tcPr><w:p>' +
    '<w:pPr>' + (center ? '<w:jc w:val="center"/>' : '') + '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' +
    '<w:r>' + (bold ? '<w:rPr><w:b/><w:bCs/></w:rPr>' : '') +
    '<w:t xml:space="preserve">' + t + '</w:t></w:r></w:p></w:tc>';
}
function buildAnswerTable(headers, rows) {
  const borders = ['top','left','bottom','right','insideH','insideV']
    .map(b => '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="000000"/>').join('');
  let s = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>' +
    '<w:tblBorders>' + borders + '</w:tblBorders></w:tblPr><w:tblGrid>';
  headers.forEach(() => { s += '<w:gridCol w:w="1200"/>'; });
  s += '</w:tblGrid>';
  s += '<w:tr>' + headers.map((h, i) => tableCell(h, true, true)).join('') + '</w:tr>';
  rows.forEach(r => {
    s += '<w:tr>' + r.map((c, i) => tableCell(c, i === 0, i > 0)).join('') + '</w:tr>';
  });
  return s + '</w:tbl>';
}
async function makeAnswerDocx(examZip, examDocXml, codes, matrix) {
  const headers = ['Câu', ...codes];
  const rows = matrix.map(m => [m.disp, ...m.perVersion]);
  const title = '<w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr>' +
    '<w:r><w:rPr><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t>MHEdu — BẢNG ĐÁP ÁN ĐỀ THI ĐÃ TRỘN</w:t></w:r></w:p>' +
    '<w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:i/><w:iCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr>' +
    '<w:r><w:rPr><w:i/><w:iCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Hệ thống khảo thí MHEdu · Tác giả: Thầy Nguyễn Mạnh Hùng (Hotline/Zalo: 0965.908.084)</w:t></w:r></w:p>' +
    '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>';
  const newBody = title + buildAnswerTable(headers, rows) + normalizeSectPr(null);
  const newDocXml = examDocXml.replace(/<w:body[^>]*>[\s\S]*<\/w:body>/, () => '<w:body>' + newBody + '</w:body>');
  const zip = examZip.clone();
  zip.file('word/document.xml', newDocXml);
  return await zip.generateAsync({ type: 'uint8array' });
}
/* ---------- file đáp án Excel ---------- */
function makeAnswerXlsx(codes, matrix) {
  const aoa = [['Câu', ...codes]];
  matrix.forEach(m => aoa.push([m.disp, ...m.perVersion]));
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 14 }, ...codes.map(() => ({ wch: 16 }))];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DapAn');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}
/* =====================================================================
   ĐIỀU PHỐI UI
   ===================================================================== */
const S = { exam: null, header: null, sections: null, examDocXml: '', examZip: null, headerDoc: null };
function bindDrop(dropId, inputId, kind) {
  const drop = $(dropId), input = $(inputId);
  drop.addEventListener('click', () => input.click());
  ['dragover','dragenter'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', ev => { if (ev.dataTransfer.files[0]) loadFile(ev.dataTransfer.files[0], kind); });
  input.addEventListener('change', () => { if (input.files[0]) loadFile(input.files[0], kind); });
}
async function loadFile(file, kind) {
  if (!/\.docx$/i.test(file.name)) { alert('Chỉ nhận file .docx (Word 2007 trở lên).'); return; }
  try {
    const { zip, doc } = await readDocx(file);
    if (kind === 'exam') {
      S.exam = file; S.examZip = zip;
      S.examDocXml = await zip.file('word/document.xml').async('string');
      S.sections = splitQuestions(doc);
      $('#examName').textContent = file.name; $('#examName').classList.remove('hidden');
      renderPreview();
    } else {
      S.header = file; S.headerDoc = doc;
      $('#headerName').textContent = file.name; $('#headerName').classList.remove('hidden');
    }
    $('#btnGo').disabled = !S.exam;
  } catch (e) {
    alert('Không đọc được file Word: ' + e.message);
  }
}
const SEC_NAMES = { mc: 'Phần I — Trắc nghiệm (trộn câu + phương án)', tf: 'Phần II — Đúng/Sai (chỉ trộn câu)', short: 'Phần III — Trả lời ngắn (chỉ trộn câu)', essay: 'Phần IV — Tự luận (giữ nguyên)' };
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function renderPreview() {
  const box = $('#previewBox');
  $('#previewCard').classList.remove('hidden');
  let html = '', total = 0, missing = 0;
  S.sections.forEach(sec => {
    const n = sec.tokens.filter(t => t.kind === 'question').length;
    total += n;
    sec.tokens.filter(t => t.kind === 'question').forEach(q => {
      const { answerRaw } = extractAnswer(q, sec.type);
      if (!answerRaw && sec.type !== 'essay') missing++;
    });
    const ht = sec.headText ? ' <span style="color:var(--muted);font-size:12px">“' + escHtml(sec.headText.slice(0, 45)) + '”</span>' : '';
    html += '<div class="sec"><span>' + SEC_NAMES[sec.type] + ht + '</span><span class="tag">' + n + ' câu</span></div>';
  });
  html += '<div class="sec"><span><b>Tổng cộng</b></span><span class="tag">' + total + ' câu</span></div>';
  if (missing) html += '<div class="warn">⚠ Có ' + missing + ' câu chưa phát hiện đư��c "Đáp án:" — đáp án của các câu này sẽ để trống.</div>';
  box.innerHTML = html;
  document.getElementById('previewCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function parseCodes() {
  const n = Math.max(1, Math.min(24, parseInt($('#optCount').value) || 4));
  const raw = $('#optCodes').value.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  const codes = raw.slice(0, n);
  let last = parseInt(codes[codes.length - 1]) || 100;
  while (codes.length < n) { last++; codes.push(String(last)); }
  return codes;
}
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
async function go() {
  const btn = $('#btnGo');
  btn.disabled = true; $('#goLabel').textContent = 'ĐANG TRỘN...';
  $('#logCard').classList.remove('hidden'); $('#logBox').innerHTML = '';
  try {
    const codes = parseCodes();
    const opts = { shuffleOpts: $('#optShuffleOpts').checked, renumber: $('#optRenumber').checked, cleanTags: $('#optCleanTags').checked, balanceKeys: $('#optBalance').checked, shuffleTF: $('#optShuffleTF').checked, labelStyle: $('#optLabelStyle').checked };
    log('→ [MHEdu Pro] Bắt đầu trộn đề: ' + codes.length + ' mã đề (' + codes.join(', ') + ')' + (opts.balanceKeys ? ' · cân bằng đáp án: BẬT' : '') + (opts.labelStyle ? ' · nhãn đậm xanh: BẬT' : ''), 'inf');
    const zip = new JSZip();
    const usedQOrders = {}; // đa dạng thứ tự câu giữa các mã đề
    const versionKeys = []; // mỗi mã đề: [{key, essay}] theo đúng thứ tự hiển thị
    for (let v = 0; v < codes.length; v++) {
      const code = codes[v];
      // parse lại từ file gốc cho mỗi mã đề: luôn bắt đầu từ đề pristine,
      // tránh việc nhãn A/B/C/D đã bị xáo ở mã đề trước làm sai lệch đáp án
      const freshDoc = new DOMParser().parseFromString(S.examDocXml, 'application/xml');
      const ver = buildVersion(splitQuestions(freshDoc), code, opts, usedQOrders);
      versionKeys.push(ver.keys);
      const data = await makeExamDocx(S.examZip, S.examDocXml, S.headerDoc, ver, code);
      zip.file('De_' + code + '.docx', data);
      log('✓ Xong mã đề ' + code, 'ok');
    }
    // Bảng đáp án theo đúng thứ tự câu HIỂN THỊ trong từng mã đề
    // (ver.keys đã theo thứ tự hiển thị: từng phần, câu đã trộn)
    const tnKeys = v => versionKeys[v].filter(k => !k.essay);
    const tlKeys = v => versionKeys[v].filter(k => k.essay);
    const nTN = tnKeys(0).length, nTL = tlKeys(0).length;
    const ansRows = [];
    for (let i = 0; i < nTN; i++)
      ansRows.push({ disp: String(i + 1), perVersion: versionKeys.map((vk, v) => tnKeys(v)[i].key) });
    for (let i = 0; i < nTL; i++)
      ansRows.push({ disp: 'TL-' + (i + 1), perVersion: versionKeys.map((vk, v) => tlKeys(v)[i].key) });
    log('→ Đang tạo file đáp án Word + Excel...', 'inf');
    zip.file('Dap_An.docx', await makeAnswerDocx(S.examZip, S.examDocXml, codes, ansRows));
    zip.file('Dap_An.xlsx', makeAnswerXlsx(codes, ansRows.filter(r => !r.disp.startsWith('TL-'))));
    log('→ Đang đóng gói ZIP...', 'inf');
    const blob = await zip.generateAsync({ type: 'blob' });
    const d = new Date(), p = n => String(n).padStart(2, '0');
    download(blob, 'MHEdu_BoDe_Tron_' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + '.zip');
    log('✓ HOÀN TẤT — MHEdu đã tạo và tải thành công gói ZIP (' + codes.length + ' đề Word + đáp án Word + đáp án Excel)', 'ok');
    log('⭐ Bản quyền hệ thống: Thầy Nguyễn Mạnh Hùng (Hotline/Zalo: 0965.908.084) — Cảm ơn quý Thầy/Cô đã tin dùng!', 'inf');
  } catch (e) {
    log('✗ Lỗi: ' + e.message, 'err');
    console.error(e);
  }
  btn.disabled = false; $('#goLabel').textContent = 'TRỘN ĐỀ NGAY (MHEDU PRO)';
}
bindDrop('#dropHeader', '#fileHeader', 'header');
bindDrop('#dropExam', '#fileExam', 'exam');
$('#btnGo').addEventListener('click', go);
