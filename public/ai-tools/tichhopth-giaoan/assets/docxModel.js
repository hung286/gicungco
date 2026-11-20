/**
 * MHEdu - DocxModel Engine
 * Parses, inspects, and patches Word (.docx) files preserving 100% formatting, tables, images, and math formulas.
 * Developed for MHEdu - Thầy Nguyễn Mạnh Hùng Thầy Nguyễn Mạnh Hùng
 */

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const MATH_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math";
const XML_NS = "http://www.w3.org/XML/1998/namespace";
const IGNORE_TAGS = new Set(["txbxContent", "drawing", "pict", "object", "Fallback", "footnote", "endnote", "comment"]);

export function getBodyParagraphs(doc) {
  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  if (!body) return [];
  const paras = body.getElementsByTagNameNS(W_NS, "p");
  const result = [];
  for (let s = 0; s < paras.length; s++) {
    let ignore = false;
    for (let r = paras[s].parentNode; r && r !== body; r = r.parentNode) {
      if (IGNORE_TAGS.has(r.localName)) {
        ignore = true;
        break;
      }
    }
    if (!ignore) result.push(paras[s]);
  }
  return result;
}

export function getTableCoord(pNode, tableMap) {
  let tc = null;
  for (let r = pNode.parentNode; r && r.nodeType === 1; r = r.parentNode) {
    if (r.namespaceURI === W_NS && r.localName === "tc") {
      tc = r;
      break;
    }
    if (r.localName === "body") break;
  }
  if (!tc) return "";
  const tr = tc.parentNode;
  const tbl = tr?.parentNode;
  if (!tr || !tbl || tbl.localName !== "tbl") return "";
  const getIndex = (parent, tag) => {
    let idx = 0;
    for (let f = parent.parentNode.firstChild; f; f = f.nextSibling) {
      if (f.nodeType === 1 && f.localName === tag) {
        idx++;
        if (f === parent) return idx;
      }
    }
    return idx;
  };
  return `B${tableMap.get(tbl) ?? 0}.H${getIndex(tr, "tr")}.C${getIndex(tc, "tc")}`;
}

export function extractParagraphText(pNode, stats) {
  let text = "";
  const walk = (node) => {
    for (let l = node.firstChild; l; l = l.nextSibling) {
      if (l.nodeType !== 1) continue;
      const tag = l.localName;
      if (l.namespaceURI === MATH_NS && (tag === "oMath" || tag === "oMathPara")) {
        stats.maths++;
        text += " [Công thức] ";
        continue;
      }
      if (tag === "t" && l.namespaceURI === W_NS) {
        text += l.textContent || "";
      } else if (tag === "tab" || tag === "br" || tag === "cr") {
        text += " ";
      } else if (tag === "drawing" || tag === "pict") {
        text += " [Hình] ";
        stats.images++;
      } else if (tag === "object") {
        text += " [Công thức] ";
        stats.maths++;
      } else {
        if (tag === "delText" || tag === "instrText" || tag === "rPr" || tag === "pPr") continue;
        walk(l);
      }
    }
  };
  walk(pNode);
  return text.replace(/\s+/g, " ").trim();
}

export function serializeXml(xmlDoc, origXml) {
  let serialized = new XMLSerializer().serializeToString(xmlDoc);
  if (!serialized.startsWith("<?xml")) {
    const declMatch = /^<\?xml[^>]*\?>/.exec(origXml);
    const decl = declMatch ? declMatch[0] : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    serialized = decl + "\r\n" + serialized;
  }
  return serialized;
}

export function parseXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("File Word bị lỗi cấu trúc XML, không đọc được.");
  }
  return doc;
}

export async function readDocxFile(file) {
  const buf = await file.arrayBuffer();
  if (!window.JSZip) throw new Error("Chưa tải được thư viện JSZip.");
  const zip = await window.JSZip.loadAsync(buf);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("File không phải văn bản Word .docx hợp lệ.");
  const xmlString = await docFile.async("string");
  const xmlDoc = parseXml(xmlString);

  const tables = Array.from(xmlDoc.getElementsByTagNameNS(W_NS, "tbl"));
  const tableMap = new Map(tables.map((tbl, idx) => [tbl, idx + 1]));
  const stats = { images: 0, maths: 0 };
  const lines = [];
  const paraMap = new Map();
  const bodyParas = getBodyParagraphs(xmlDoc);

  bodyParas.forEach((pNode, idx) => {
    const text = extractParagraphText(pNode, stats);
    if (!text) return;
    const pId = `p${idx + 1}`;
    const coord = getTableCoord(pNode, tableMap);
    paraMap.set(pId, text);
    lines.push(`[${pId}${coord ? "|" + coord : ""}] ${text}`);
  });

  return {
    fileName: file.name,
    buf,
    xml: xmlString,
    text: lines.join("\n"),
    paras: paraMap,
    paraCount: bodyParas.length,
    tables: tables.length,
    images: stats.images,
    maths: stats.maths
  };
}

export function guessMetadata(docInfo) {
  const firstParas = [...docInfo.paras.values()].slice(0, 40);
  let grade = null;
  for (const text of firstParas) {
    const match = /(?:lớp|khối)\s*:?\s*(1[0-2]|[1-9])(?!\d)/i.exec(text);
    if (match) {
      grade = Number(match[1]);
      break;
    }
  }
  if (!grade) {
    const fnMatch = /(?:lớp|lop|khối|khoi|toán|toan|văn|van|tiếng việt|tieng viet|anh|lý|ly|hoá|hóa|hoa|sinh|sử|su|địa|dia|tin|khtn|gdcd|công nghệ|cong nghe)[\s_-]*(1[0-2]|[1-9])(?!\d)/i.exec(docInfo.fileName);
    if (fnMatch) grade = Number(fnMatch[1]);
  }
  const titlePatterns = [
    /^(?:bài|tiết)\s*\d+\s*[:.\-–]/i,
    /^chủ đề\s*[\dIVX]+\s*[:.\-–]/i,
    /^(?:tên bài|bài học)\s*:/i
  ];
  let foundTitle = "";
  for (const pat of titlePatterns) {
    const found = firstParas.find(p => pat.test(p) && p.length < 200);
    if (found) {
      foundTitle = found.replace(/^(?:tên bài|bài học)\s*:\s*/i, "").slice(0, 200).trim();
      break;
    }
  }
  return { grade: grade || 6, title: foundTitle };
}

export const CATEGORIES = {
  nls: { key: "nls", label: "Năng lực số", color: "1D4ED8", bg: "#eff6ff", border: "#93c5fd", textCol: "#1e40af" },
  ai:  { key: "ai",  label: "Năng lực AI", color: "DC2626", bg: "#fef2f2", border: "#fca5a5", textCol: "#991b1b" },
  kt:  { key: "kt",  label: "HS khuyết tật", color: "15803D", bg: "#f0fdf4", border: "#86efac", textCol: "#166534" },
  qp:  { key: "qp",  label: "GDQPAN", color: "1D4ED8", bg: "#eef2ff", border: "#a5b4fc", textCol: "#3730a3", prefix: "[Tích hợp GDQPAN]: " },
  bd:  { key: "bd",  label: "BĐKH - Môi trường", color: "C2410C", bg: "#fff7ed", border: "#fdba74", textCol: "#9a3412", prefix: "[Tích hợp BĐKH-PCTT]: " }
};

function createEl(doc, tag, attrs = {}) {
  const el = doc.createElementNS(W_NS, "w:" + tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttributeNS(W_NS, "w:" + k, v);
  }
  return el;
}

function getRunFormatting(pNode) {
  if (!pNode) return [];
  const runs = Array.from(pNode.getElementsByTagNameNS(W_NS, "r")).filter(r => r.getElementsByTagNameNS(W_NS, "t").length);
  const rPr = runs.length ? Array.from(runs[runs.length - 1].children).find(c => c.localName === "rPr") : null;
  return rPr ? Array.from(rPr.children).filter(c => ["rFonts", "sz", "szCs", "lang"].includes(c.localName)) : [];
}

function createTextRun(doc, text, style, templateRuns) {
  const r = createEl(doc, "r");
  const rPr = createEl(doc, "rPr");
  for (const t of templateRuns) {
    if (t.localName === "rFonts" || t.localName === "sz" || t.localName === "szCs" || t.localName === "lang") {
      rPr.appendChild(t.cloneNode(true));
    }
  }
  if (style.bold) {
    rPr.appendChild(createEl(doc, "b"));
    rPr.appendChild(createEl(doc, "bCs"));
  }
  if (style.italic) {
    rPr.appendChild(createEl(doc, "i"));
    rPr.appendChild(createEl(doc, "iCs"));
  }
  if (style.underline) {
    rPr.appendChild(createEl(doc, "u", { val: "single" }));
  }
  if (style.color) {
    rPr.appendChild(createEl(doc, "color", { val: style.color }));
  }
  if (rPr.childNodes.length) r.appendChild(rPr);
  const t = createEl(doc, "t");
  t.setAttributeNS(XML_NS, "xml:space", "preserve");
  t.textContent = text;
  r.appendChild(t);
  return r;
}

function parseBold(text) {
  const tokens = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    tokens.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), bold: false });
  }
  return tokens.filter(t => t.text.length > 0);
}

function buildRunsForItem(doc, item, colorEnabled, templateRuns) {
  const cat = CATEGORIES[item.k] || CATEGORIES.nls;
  const color = colorEnabled ? cat.color : undefined;
  const italic = (item.k === "kt");
  const underline = colorEnabled && (item.k === "nls");
  const runs = [];

  let text = item.t.trim();
  if (cat.prefix && !text.startsWith(cat.prefix)) {
    runs.push(createTextRun(doc, cat.prefix, { bold: true, color, italic }, templateRuns));
  }
  const parts = parseBold(text);
  for (const p of parts) {
    runs.push(createTextRun(doc, p.text, { bold: p.bold, italic, underline, color }, templateRuns));
  }
  return runs;
}

export async function generatePatchedDocx(docInfo, items, colorEnabled = true) {
  if (!window.JSZip) throw new Error("Thư viện JSZip chưa sẵn sàng.");
  const xmlDoc = parseXml(docInfo.xml);
  const bodyParas = getBodyParagraphs(xmlDoc);
  const findPara = (pId) => {
    const num = Number(pId.replace(/^p/i, "")) - 1;
    return bodyParas[num] || null;
  };

  const insertedMap = new Map();
  for (const item of items) {
    if (item.on === false || !item.t.trim()) continue;
    const targetPara = findPara(item.a);
    if (!targetPara) continue;
    const templateRuns = getRunFormatting(targetPara);
    const newRuns = buildRunsForItem(xmlDoc, item, colorEnabled, templateRuns);

    if (item.w === "end") {
      newRuns.unshift(createTextRun(xmlDoc, " ", {}, templateRuns));
      for (const r of newRuns) targetPara.appendChild(r);
    } else {
      // below
      const newP = createEl(xmlDoc, "p");
      const pPr = targetPara.getElementsByTagNameNS(W_NS, "pPr")[0];
      if (pPr) {
        const clonedPr = pPr.cloneNode(true);
        // remove heading styles or pagebreak
        for (const child of Array.from(clonedPr.children)) {
          if (["pageBreakBefore", "pPrChange"].includes(child.localName)) {
            clonedPr.removeChild(child);
          }
        }
        newP.appendChild(clonedPr);
      }
      for (const r of newRuns) newP.appendChild(r);
      const anchorNode = insertedMap.get(item.a) || targetPara;
      anchorNode.parentNode.insertBefore(newP, anchorNode.nextSibling);
      insertedMap.set(item.a, newP);
    }
  }

  const zip = await window.JSZip.loadAsync(docInfo.buf);
  const newXml = serializeXml(xmlDoc, docInfo.xml);
  zip.file("word/document.xml", newXml, { createFolders: false });
  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}
