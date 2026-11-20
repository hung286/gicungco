// public/ai-tools/tichhopth-giaoan/assets/docxModel.js
var W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
var MATH_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math";
var XML_NS = "http://www.w3.org/XML/1998/namespace";
var IGNORE_TAGS = /* @__PURE__ */ new Set(["txbxContent", "drawing", "pict", "object", "Fallback", "footnote", "endnote", "comment"]);
function getBodyParagraphs(doc) {
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
function getTableCoord(pNode, tableMap) {
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
function extractParagraphText(pNode, stats) {
  let text = "";
  const walk = (node) => {
    for (let l = node.firstChild; l; l = l.nextSibling) {
      if (l.nodeType !== 1) continue;
      const tag = l.localName;
      if (l.namespaceURI === MATH_NS && (tag === "oMath" || tag === "oMathPara")) {
        stats.maths++;
        text += " [C\xF4ng th\u1EE9c] ";
        continue;
      }
      if (tag === "t" && l.namespaceURI === W_NS) {
        text += l.textContent || "";
      } else if (tag === "tab" || tag === "br" || tag === "cr") {
        text += " ";
      } else if (tag === "drawing" || tag === "pict") {
        text += " [H\xECnh] ";
        stats.images++;
      } else if (tag === "object") {
        text += " [C\xF4ng th\u1EE9c] ";
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
function serializeXml(xmlDoc, origXml) {
  let serialized = new XMLSerializer().serializeToString(xmlDoc);
  if (!serialized.startsWith("<?xml")) {
    const declMatch = /^<\?xml[^>]*\?>/.exec(origXml);
    const decl = declMatch ? declMatch[0] : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    serialized = decl + "\r\n" + serialized;
  }
  return serialized;
}
function parseXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("File Word b\u1ECB l\u1ED7i c\u1EA5u tr\xFAc XML, kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c.");
  }
  return doc;
}
async function readDocxFile(file) {
  const buf = await file.arrayBuffer();
  if (!window.JSZip) throw new Error("Ch\u01B0a t\u1EA3i \u0111\u01B0\u1EE3c th\u01B0 vi\u1EC7n JSZip.");
  const zip = await window.JSZip.loadAsync(buf);
  const docFile = zip.file("word/document.xml");
  if (!docFile) throw new Error("File kh\xF4ng ph\u1EA3i v\u0103n b\u1EA3n Word .docx h\u1EE3p l\u1EC7.");
  const xmlString = await docFile.async("string");
  const xmlDoc = parseXml(xmlString);
  const tables = Array.from(xmlDoc.getElementsByTagNameNS(W_NS, "tbl"));
  const tableMap = new Map(tables.map((tbl, idx) => [tbl, idx + 1]));
  const stats = { images: 0, maths: 0 };
  const lines = [];
  const paraMap = /* @__PURE__ */ new Map();
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
function guessMetadata(docInfo) {
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
    const found = firstParas.find((p) => pat.test(p) && p.length < 200);
    if (found) {
      foundTitle = found.replace(/^(?:tên bài|bài học)\s*:\s*/i, "").slice(0, 200).trim();
      break;
    }
  }
  return { grade: grade || 6, title: foundTitle };
}
var CATEGORIES = {
  nls: { key: "nls", label: "N\u0103ng l\u1EF1c s\u1ED1", color: "1D4ED8", bg: "#eff6ff", border: "#93c5fd", textCol: "#1e40af" },
  ai: { key: "ai", label: "N\u0103ng l\u1EF1c AI", color: "DC2626", bg: "#fef2f2", border: "#fca5a5", textCol: "#991b1b" },
  kt: { key: "kt", label: "HS khuy\u1EBFt t\u1EADt", color: "15803D", bg: "#f0fdf4", border: "#86efac", textCol: "#166534" },
  qp: { key: "qp", label: "GDQPAN", color: "1D4ED8", bg: "#eef2ff", border: "#a5b4fc", textCol: "#3730a3", prefix: "[T\xEDch h\u1EE3p GDQPAN]: " },
  bd: { key: "bd", label: "B\u0110KH - M\xF4i tr\u01B0\u1EDDng", color: "C2410C", bg: "#fff7ed", border: "#fdba74", textCol: "#9a3412", prefix: "[T\xEDch h\u1EE3p B\u0110KH-PCTT]: " }
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
  const runs = Array.from(pNode.getElementsByTagNameNS(W_NS, "r")).filter((r) => r.getElementsByTagNameNS(W_NS, "t").length);
  const rPr = runs.length ? Array.from(runs[runs.length - 1].children).find((c) => c.localName === "rPr") : null;
  return rPr ? Array.from(rPr.children).filter((c) => ["rFonts", "sz", "szCs", "lang"].includes(c.localName)) : [];
}
function createTextRun(doc, text, style, templateRuns) {
  const r = createEl(doc, "r");
  const rPr = createEl(doc, "rPr");
  for (const t2 of templateRuns) {
    if (t2.localName === "rFonts" || t2.localName === "sz" || t2.localName === "szCs" || t2.localName === "lang") {
      rPr.appendChild(t2.cloneNode(true));
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
  return tokens.filter((t) => t.text.length > 0);
}
function buildRunsForItem(doc, item, colorEnabled, templateRuns) {
  const cat = CATEGORIES[item.k] || CATEGORIES.nls;
  const color = colorEnabled ? cat.color : void 0;
  const italic = item.k === "kt";
  const underline = colorEnabled && item.k === "nls";
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
async function generatePatchedDocx(docInfo, items, colorEnabled = true) {
  if (!window.JSZip) throw new Error("Th\u01B0 vi\u1EC7n JSZip ch\u01B0a s\u1EB5n s\xE0ng.");
  const xmlDoc = parseXml(docInfo.xml);
  const bodyParas = getBodyParagraphs(xmlDoc);
  const findPara = (pId) => {
    const num = Number(pId.replace(/^p/i, "")) - 1;
    return bodyParas[num] || null;
  };
  const insertedMap = /* @__PURE__ */ new Map();
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
      const newP = createEl(xmlDoc, "p");
      const pPr = targetPara.getElementsByTagNameNS(W_NS, "pPr")[0];
      if (pPr) {
        const clonedPr = pPr.cloneNode(true);
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

// public/ai-tools/tichhopth-giaoan/app.js
var { useState, useEffect, useMemo, useRef } = React;
var SUBJECTS = [
  "Tin h\u1ECDc",
  "To\xE1n",
  "Ng\u1EEF v\u0103n",
  "Ti\u1EBFng Anh",
  "Khoa h\u1ECDc t\u1EF1 nhi\xEAn",
  "L\u1ECBch s\u1EED v\xE0 \u0110\u1ECBa l\xED",
  "Gi\xE1o d\u1EE5c c\xF4ng d\xE2n",
  "C\xF4ng ngh\u1EC7",
  "Gi\xE1o d\u1EE5c th\u1EC3 ch\u1EA5t",
  "Ngh\u1EC7 thu\u1EADt",
  "\xC2m nh\u1EA1c",
  "M\u0129 thu\u1EADt",
  "Ho\u1EA1t \u0111\u1ED9ng tr\u1EA3i nghi\u1EC7m",
  "V\u1EADt l\xED",
  "Ho\xE1 h\u1ECDc",
  "Sinh h\u1ECDc",
  "L\u1ECBch s\u1EED",
  "\u0110\u1ECBa l\xED",
  "Gi\xE1o d\u1EE5c Kinh t\u1EBF v\xE0 Ph\xE1p lu\u1EADt",
  "Gi\xE1o d\u1EE5c qu\u1ED1c ph\xF2ng v\xE0 an ninh",
  "Ti\u1EBFng Vi\u1EC7t",
  "T\u1EF1 nhi\xEAn v\xE0 X\xE3 h\u1ED9i",
  "Khoa h\u1ECDc"
];
var DISABILITY_TYPES = [
  { key: "nhin", label: "Khuy\u1EBFt t\u1EADt v\u1EC1 m\u1EAFt (nh\xECn)", chip: "H\u1ED7 tr\u1EE3 ch\u1EEF ph\xF3ng to v\xE0 m\xF4 t\u1EA3 tr\u1EF1c quan" },
  { key: "vandong", label: "Khuy\u1EBFt t\u1EADt v\u1EC1 x\u01B0\u01A1ng (v\u1EADn \u0111\u1ED9ng)", chip: "B\u1ED1 tr\xED ch\u1ED7 ng\u1ED3i thu\u1EADn ti\u1EC7n, mi\u1EC5n v\u1EADn \u0111\u1ED9ng m\u1EA1nh" },
  { key: "tritue", label: "Khuy\u1EBFt t\u1EADt v\u1EC1 tr\xED tu\u1EC7", chip: "Gi\u1EA3m 50% \u0111\u1ED9 kh\xF3, t\u0103ng th\u1EDDi gian l\xE0m b\xE0i" },
  { key: "nghenoi", label: "Khuy\u1EBFt t\u1EADt nghe, n\xF3i", chip: "S\u1EED d\u1EE5ng b\u1EA3ng ph\u1EE5, k\xFD hi\u1EC7u v\xE0 b\u1EA1n h\u1ED7 tr\u1EE3" },
  { key: "tuky", label: "R\u1ED1i lo\u1EA1n ph\u1ED5 t\u1EF1 k\u1EF7", chip: "T\u1EA1o kh\xF4ng gian y\xEAn t\u0129nh, h\u01B0\u1EDBng d\u1EABn 1-1" },
  { key: "rlht", label: "R\u1ED1i lo\u1EA1n h\u1ECDc t\u1EADp \u0111\u1EB7c th\xF9", chip: "Chia nh\u1ECF nhi\u1EC7m v\u1EE5, k\xE8m s\u01A1 \u0111\u1ED3 t\u01B0 duy" },
  { key: "thankinh", label: "Khuy\u1EBFt t\u1EADt th\u1EA7n kinh", chip: "\u0110\u1ED9ng vi\xEAn t\xE2m l\xFD, kh\xF4ng \xE1p l\u1EF1c \u0111i\u1EC3m s\u1ED1" },
  { key: "tamthan", label: "Khuy\u1EBFt t\u1EADt t\xE2m th\u1EA7n", chip: "Theo d\xF5i s\xE1t c\u1EA3m x\xFAc, h\u1ED7 tr\u1EE3 h\xF2a nh\u1EADp nh\xF3m" },
  { key: "khac", label: "Khuy\u1EBFt t\u1EADt kh\xE1c", chip: "\u0110i\u1EC1u ch\u1EC9nh ph\xF9 h\u1EE3p theo th\u1EC3 tr\u1EA1ng" },
  { key: "chung", label: "Khuy\u1EBFt t\u1EADt chung", chip: "Ph\xE2n c\xF4ng b\u1EA1n c\xF9ng b\xE0n h\u1ED7 tr\u1EE3 h\u1ECDc t\u1EADp" }
];
var GDQPAN_SUGGESTIONS = [
  "Li\xEAn h\u1EC7 b\xE0i to\xE1n s\u1ED1 li\u1EC7u b\u1EA3o v\u1EC7 ch\u1EE7 quy\u1EC1n bi\xEAn gi\u1EDBi v\xE0 bi\u1EC3n \u0111\u1EA3o T\u1ED5 qu\u1ED1c",
  "Gi\xE1o d\u1EE5c \xFD th\u1EE9c an to\xE0n th\xF4ng tin c\xE1 nh\xE2n v\xE0 an ninh m\u1EA1ng",
  "L\u1ED3ng gh\xE9p truy\u1EC1n th\u1ED1ng v\u1EBB vang, g\u01B0\u01A1ng anh h\xF9ng li\u1EC7t s\u0129 Q\u0110ND v\xE0 CAND",
  "Nh\u1EAFc nh\u1EDF tinh th\u1EA7n k\u1EF7 lu\u1EADt, \u0111o\xE0n k\u1EBFt v\xE0 tr\xE1ch nhi\u1EC7m c\u1EE7a h\u1ECDc sinh v\u1EDBi T\u1ED5 qu\u1ED1c"
];
var BDKH_SUGGESTIONS = [
  "Li\xEAn h\u1EC7 b\xE0i to\xE1n s\u1ED1 li\u1EC7u v\u1EC1 l\u01B0\u1EE3ng r\xE1c th\u1EA3i, ti\u1EBFt ki\u1EC7m n\u0103ng l\u01B0\u1EE3ng \u0111i\u1EC7n n\u01B0\u1EDBc",
  "T\u1ED5 ch\u1EE9c ho\u1EA1t \u0111\u1ED9ng ph\xE2n lo\u1EA1i r\xE1c v\xE0 gi\u1EA3m thi\u1EC3u \u0111\u1ED3 nh\u1EF1a d\xF9ng m\u1ED9t l\u1EA7n",
  "Th\u1EF1c h\xE0nh l\u1ED1i s\u1ED1ng xanh, ch\u0103m s\xF3c v\xE0 b\u1EA3o v\u1EC7 c\xE2y xanh h\u1ECDc \u0111\u01B0\u1EDDng",
  "\xDD th\u1EE9c th\xEDch \u1EE9ng v\xE0 ph\xF2ng tr\xE1nh tai n\u1EA1n th\u01B0\u01A1ng t\xEDch khi thi\xEAn tai b\xE3o l\u0169"
];
function App() {
  const [step, setStep] = useState(0);
  const [docInfo, setDocInfo] = useState(null);
  const [subject, setSubject] = useState("Tin h\u1ECDc");
  const [grade, setGrade] = useState(6);
  const [title, setTitle] = useState("");
  const [ppctName, setPpctName] = useState("");
  const [ppctText, setPpctText] = useState("");
  const [opts, setOpts] = useState({
    nls: true,
    ai: true,
    kt: false,
    qp: false,
    bd: false
  });
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [disabilityNote, setDisabilityNote] = useState("");
  const [qpNote, setQpNote] = useState("");
  const [bdNote, setBdNote] = useState("");
  const [nlsNote, setNlsNote] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [colorEnabled, setColorEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedReport, setCopiedReport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError("Vui l\xF2ng ch\u1ECDn file Word \u0111\u1ECBnh d\u1EA1ng .docx (Word 2007 tr\u1EDF l\xEAn). V\u1EDBi file .doc c\u0169, h\xE3y m\u1EDF trong Word v\xE0 ch\u1ECDn L\u01B0u th\xE0nh (Save As) d\u1EA1ng .docx.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(30);
    setProgressStatus("\u0110ang \u0111\u1ECDc v\xE0 ph\xE2n t\xEDch c\u1EA5u tr\xFAc gi\xE1o \xE1n...");
    try {
      const parsed = await readDocxFile(file);
      setDocInfo(parsed);
      const meta = guessMetadata(parsed);
      if (meta.grade) setGrade(meta.grade);
      if (meta.title) setTitle(meta.title);
      setProgress(100);
      setItems([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Kh\xF4ng th\u1EC3 \u0111\u1ECDc file Word. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i file.");
    } finally {
      setLoading(false);
    }
  };
  const handlePpctUpload = async (file) => {
    if (!file) return;
    try {
      if (file.name.endsWith(".docx")) {
        const parsed = await readDocxFile(file);
        setPpctName(file.name);
        setPpctText(parsed.text.slice(0, 4e3));
      } else {
        setPpctName(file.name);
        setPpctText(`File PPCT: ${file.name}`);
      }
    } catch (err) {
      console.warn("L\u1ED7i \u0111\u1ECDc PPCT", err);
    }
  };
  const handleRunAi = async () => {
    if (!docInfo) {
      setError("Ch\u01B0a c\xF3 gi\xE1o \xE1n \u0111\u1EC3 t\xEDch h\u1EE3p. H\xE3y ch\u1ECDn file Word tr\u01B0\u1EDBc.");
      setStep(0);
      return;
    }
    const activeOpts = Object.entries(opts).filter(([_, v]) => v).map(([k]) => k);
    if (activeOpts.length === 0) {
      setError("Vui l\xF2ng b\u1EADt \xEDt nh\u1EA5t 1 n\u1ED9i dung c\u1EA7n t\xEDch h\u1EE3p (N\u0103ng l\u1EF1c s\u1ED1, N\u0103ng l\u1EF1c AI, Khuy\u1EBFt t\u1EADt, GDQPAN ho\u1EB7c B\u0110KH).");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(15);
    setProgressStatus("\u0110ang k\u1EBFt n\u1ED1i Gemini AI v\xE0 ph\xE2n t\xEDch c\u1EA5u tr\xFAc b\xE0i d\u1EA1y...");
    let userKey = "";
    try {
      userKey = (localStorage.getItem("smartedu_gemini_api_key") || "").trim();
    } catch {
    }
    const BACKUP_KEYS = [
      "",
      "",
      "",
      "",
      ""
    ];
    const keysToTry = userKey ? [userKey, ...BACKUP_KEYS] : BACKUP_KEYS;
    const parasSlice = docInfo.text.split("\n").slice(0, 80).join("\n");
    let promptText = `B\u1EA1n l\xE0 Chuy\xEAn gia Ph\u01B0\u01A1ng ph\xE1p D\u1EA1y h\u1ECDc v\xE0 Tr\u1EE3 l\xFD AI Gi\xE1o d\u1EE5c c\u1EE7a MHEdu.
Nhi\u1EC7m v\u1EE5: Ph\xE2n t\xEDch b\xE0i gi\xE1o \xE1n d\u01B0\u1EDBi \u0111\xE2y v\xE0 \u0111\u1EC1 xu\u1EA5t c\xE1c \u0111o\u1EA1n ch\xE8n t\xEDch h\u1EE3p v\xE0o \u0111\xFAng c\xE1c ho\u1EA1t \u0111\u1ED9ng (M\u1EE5c ti\xEAu, Kh\u1EDFi \u0111\u1ED9ng, H\xECnh th\xE0nh ki\u1EBFn th\u1EE9c, Luy\u1EC7n t\u1EADp, V\u1EADn d\u1EE5ng).

TH\xD4NG TIN B\xC0I H\u1ECCC:
- M\xF4n h\u1ECDc: ${subject}
- Kh\u1ED1i l\u1EDBp: L\u1EDBp ${grade}
- T\xEAn b\xE0i: ${title || docInfo.fileName}
${ppctText ? `- C\u0103n c\u1EE9 PPCT:
${ppctText}
` : ""}

C\xC1C N\u1ED8I DUNG Y\xCAU C\u1EA6U T\xCDCH H\u1EE2P:
${opts.nls ? `- N\u0102NG L\u1EF0C S\u1ED0 (NLS): L\u1ED3ng gh\xE9p m\u1EE5c ti\xEAu v\xE0 ho\u1EA1t \u0111\u1ED9ng \u1EE9ng d\u1EE5ng c\xF4ng ngh\u1EC7/thi\u1EBFt b\u1ECB s\u1ED1, g\u1EAFn m\xE3 ch\u1EC9 b\xE1o (vd 1.2.TC1a). ${nlsNote ? `[Y\xEAu c\u1EA7u ri\xEAng: ${nlsNote}]` : ""}` : ""}
${opts.ai ? `- N\u0102NG L\u1EF0C TR\xCD TU\u1EC6 NH\xC2N T\u1EA0O (AI): L\u1ED3ng gh\xE9p nh\u1EADn th\u1EE9c ho\u1EB7c ho\u1EA1t \u0111\u1ED9ng \u1EE9ng d\u1EE5ng AI theo Q\u0110 2422. ${aiNote ? `[Y\xEAu c\u1EA7u ri\xEAng: ${aiNote}]` : ""}` : ""}
${opts.kt ? `- H\u1ECCC SINH KHUY\u1EBET T\u1EACT H\xD2A NH\u1EACP: L\u1ED3ng gh\xE9p m\u1EE5c ti\xEAu ri\xEAng v\xE0 bi\u1EC7n ph\xE1p \u0111i\u1EC1u ch\u1EC9nh \u1EDF c\xE1c ho\u1EA1t \u0111\u1ED9ng cho h\u1ECDc sinh: ${selectedDisabilities.join(", ") || "Khuy\u1EBFt t\u1EADt chung"}. ${disabilityNote ? `[Bi\u1EC7n ph\xE1p: ${disabilityNote}]` : ""}` : ""}
${opts.qp ? `- GI\xC1O D\u1EE4C QU\u1ED0C PH\xD2NG & AN NINH (GDQP&AN): L\u1ED3ng gh\xE9p theo Th\xF4ng t\u01B0 08/2024/TT-BGD\u0110T. ${qpNote ? `[Ghi ch\xFA: ${qpNote}]` : ""}` : ""}
${opts.bd ? `- BI\u1EBEN \u0110\u1ED4I KH\xCD H\u1EACU & M\xD4I TR\u01AF\u1EDCNG (B\u0110KH - PCTT): L\u1ED3ng gh\xE9p gi\xE1o d\u1EE5c m\xF4i tr\u01B0\u1EDDng, l\u1ED1i s\u1ED1ng xanh, gi\u1EA3m r\xE1c th\u1EA3i ho\u1EB7c ph\xF2ng tr\xE1nh thi\xEAn tai. ${bdNote ? `[Ghi ch\xFA: ${bdNote}]` : ""}` : ""}

DANH S\xC1CH C\xC1C \u0110O\u1EA0N V\u0102N C\u1EE6A GI\xC1O \xC1N G\u1ED0C (c\xF3 g\u1EAFn ID \u0111o\u1EA1n [p1], [p2], ...):
"""
${parasSlice}
"""

QUY T\u1EAEC B\u1EAET BU\u1ED8C:
1. \u0110\u1ECDc k\u1EF9 c\xE1c \u0111o\u1EA1n v\u0103n, x\xE1c \u0111\u1ECBnh \u0111\xFAng c\xE1c ph\u1EA7n M\u1EE5c ti\xEAu, Kh\u1EDFi \u0111\u1ED9ng, Kh\xE1m ph\xE1, Luy\u1EC7n t\u1EADp, V\u1EADn d\u1EE5ng.
2. Ch\u1ECDn \u0111\xFAng m\xE3 \u0111o\u1EA1n "a" (v\xED d\u1EE5 "p4", "p12", "p25") c\u1EA7n ch\xE8n th\xEAm n\u1ED9i dung.
3. Tr\u1EA3 v\u1EC1 \u0111\xFAng \u0111\u1ECBnh d\u1EA1ng JSON thu\u1EA7n t\xFAy (kh\xF4ng k\xE8m markdown ngo\xE0i kh\u1ED1i json) theo c\u1EA5u tr\xFAc:
{
  "items": [
    {
      "a": "p4",
      "w": "below",
      "k": "nls",
      "t": "N\u1ED9i dung t\xEDch h\u1EE3p c\u1EE5 th\u1EC3..."
    }
  ]
}
Trong \u0111\xF3:
- "a": ID \u0111o\u1EA1n g\u1ED1c c\u1EA7n ch\xE8n (v\xED d\u1EE5 "p5", "p18")
- "w": "below" (th\xEAm d\xF2ng m\u1EDBi ngay d\u01B0\u1EDBi) ho\u1EB7c "end" (n\u1ED1i ti\u1EBFp v\xE0o \u0111u\xF4i \u0111o\u1EA1n v\u0103n \u0111\xF3)
- "k": lo\u1EA1i t\xEDch h\u1EE3p, ch\u1EC9 ch\u1ECDn 1 trong c\xE1c m\xE3 sau: "nls", "ai", "kt", "qp", "bd"
- "t": n\u1ED9i dung t\xEDch h\u1EE3p chu\u1EA9n m\u1EF1c s\u01B0 ph\u1EA1m, chi ti\u1EBFt, ph\xF9 h\u1EE3p \u0111\xFAng \u0111\u1EB7c tr\u01B0ng m\xF4n h\u1ECDc v\xE0 l\u1EDBp. H\xE3y t\u1EA1o t\u1EEB 4 \u0111\u1EBFn 8 \u0111o\u1EA1n ch\xE8n ph\xE2n b\u1ED5 \u0111\u1EC1u cho c\xE1c ho\u1EA1t \u0111\u1ED9ng.`;
    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let successItems = null;
    let lastErr = null;
    const timer = setInterval(() => {
      setProgress((p) => p < 85 ? p + Math.floor(Math.random() * 8) + 4 : p);
    }, 400);
    for (const key of keysToTry) {
      for (const model of MODELS) {
        try {
          setProgressStatus(`AI (${model}) \u0111ang ph\xE2n t\xEDch gi\xE1o \xE1n v\xE0 t\u1EA1o c\xE1c \u0111o\u1EA1n ch\xE8n...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${res.status}`);
          }
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            successItems = parsed.items.map((it, idx) => ({
              id: "item-" + idx,
              a: it.a || "p1",
              w: it.w || "below",
              k: it.k || "nls",
              t: it.t || "",
              on: true
            }));
            break;
          }
        } catch (e) {
          lastErr = e;
          console.warn(`Th\u1EED model ${model} th\u1EA5t b\u1EA1i:`, e.message);
        }
      }
      if (successItems) break;
    }
    clearInterval(timer);
    setLoading(false);
    if (successItems) {
      setProgress(100);
      setItems(successItems);
      setStep(2);
    } else {
      setError("AI kh\xF4ng th\u1EC3 ph\u1EA3n h\u1ED3i: " + (lastErr?.message || "Ki\u1EC3m tra l\u1EA1i k\u1EBFt n\u1ED1i m\u1EA1ng ho\u1EB7c th\u1EED \u0111\u1ED5i Gemini API Key qua n\xFAt tr\xEAn g\xF3c ph\u1EA3i."));
    }
  };
  const handleCopyReport = () => {
    const selectedCats = items.filter((i) => i.on);
    const nlsCount = selectedCats.filter((i) => i.k === "nls").length;
    const aiCount = selectedCats.filter((i) => i.k === "ai").length;
    const ktCount = selectedCats.filter((i) => i.k === "kt").length;
    const qpCount = selectedCats.filter((i) => i.k === "qp").length;
    const bdCount = selectedCats.filter((i) => i.k === "bd").length;
    const rpt = `\u{1F4CB} B\xC1O C\xC1O T\xCDCH H\u1EE2P GI\xC1O \xC1N
\u2022 N\u1EC1n t\u1EA3ng: MHEdu AI (Th\u1EA7y Nguy\u1EC5n M\u1EA1nh H\xF9ng)
\u2022 B\xE0i h\u1ECDc: ${title || docInfo?.fileName || "K\u1EBF ho\u1EA1ch b\xE0i d\u1EA1y"}
\u2022 M\xF4n h\u1ECDc: ${subject} - Kh\u1ED1i l\u1EDBp: L\u1EDBp ${grade}
\u2022 C\u0103n c\u1EE9 ph\xE1p l\xFD:
  - Khung n\u0103ng l\u1EF1c s\u1ED1 d\xE0nh cho ng\u01B0\u1EDDi h\u1ECDc (B\u1ED9 GD&\u0110T)
  - Khung n\u0103ng l\u1EF1c Tr\xED tu\u1EC7 nh\xE2n t\u1EA1o (Quy\u1EBFt \u0111\u1ECBnh 2422/Q\u0110-BGD\u0110T)
  - Gi\xE1o d\u1EE5c h\xF2a nh\u1EADp h\u1ECDc sinh khuy\u1EBFt t\u1EADt
  - Th\xF4ng t\u01B0 08/2024/TT-BGD\u0110T v\u1EC1 l\u1ED3ng gh\xE9p GDQP&AN
  - \u0110\u1ECBnh h\u01B0\u1EDBng l\u1ED3ng gh\xE9p gi\xE1o d\u1EE5c m\xF4i tr\u01B0\u1EDDng & \u1EE9ng ph\xF3 B\u0110KH
\u2022 T\u1ED5ng s\u1ED1 \u0111o\u1EA1n ch\xE8n \u0111\xE3 duy\u1EC7t: ${selectedCats.length} \u0111o\u1EA1n
  + N\u0103ng l\u1EF1c s\u1ED1 (NLS): ${nlsCount} \u0111o\u1EA1n
  + N\u0103ng l\u1EF1c AI: ${aiCount} \u0111o\u1EA1n
  + H\u1ECDc sinh khuy\u1EBFt t\u1EADt h\xF2a nh\u1EADp: ${ktCount} \u0111o\u1EA1n
  + Gi\xE1o d\u1EE5c Qu\u1ED1c ph\xF2ng & An ninh: ${qpCount} \u0111o\u1EA1n
  + Bi\u1EBFn \u0111\u1ED5i kh\xED h\u1EADu & M\xF4i tr\u01B0\u1EDDng: ${bdCount} \u0111o\u1EA1n
\u2022 Th\u1EDDi gian xu\u1EA5t b\xE1o c\xE1o: ${(/* @__PURE__ */ new Date()).toLocaleString("vi-VN")}`;
    navigator.clipboard.writeText(rpt).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3e3);
    }).catch(() => {
      alert("Kh\xF4ng th\u1EC3 sao ch\xE9p t\u1EF1 \u0111\u1ED9ng, vui l\xF2ng th\u1EED l\u1EA1i.");
    });
  };
  const handleDownloadWord = async () => {
    if (!docInfo || items.length === 0) return;
    setDownloading(true);
    try {
      const activeItems = items.filter((it) => it.on);
      const blob = await generatePatchedDocx(docInfo, activeItems, colorEnabled);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const baseName = docInfo.fileName.replace(/\.docx$/i, "");
      a.href = url;
      a.download = `${baseName}_Tich_Hop.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("L\u1ED7i khi t\u1EA1o file Word: " + (err.message || "Kh\xF4ng x\xE1c \u0111\u1ECBnh"));
    } finally {
      setDownloading(false);
    }
  };
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((it) => it.k === activeFilter);
  }, [items, activeFilter]);
  const activeCount = useMemo(() => items.filter((it) => it.on).length, [items]);
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-50 text-slate-800 font-sans pb-24" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-5xl mx-auto px-4 pt-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-3xl shadow-md shrink-0" }, "\u{1F9E9}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight" }, "T\xCDCH H\u1EE2P C\xC1C N\u1ED8I DUNG V\xC0O GI\xC1O \xC1N"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider" }, "\u2728 B\u1EA2N \u0110\u1EA6Y \u0110\u1EE6 \u2022 MI\u1EC4N PH\xCD")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1 font-medium" }, "T\u1EA3i gi\xE1o \xE1n Word \u2192 Ch\u1ECDn n\u1ED9i dung t\xEDch h\u1EE3p (NLS, AI, Khuy\u1EBFt t\u1EADt, GDQPAN, B\u0110KH) \u2192 AI ch\xE8n v\xE0o \u0111\xFAng ch\u1ED7, gi\u1EEF nguy\xEAn 100% \u1EA3nh, b\u1EA3ng, c\xF4ng th\u1EE9c c\u1EE7a file g\u1ED1c.")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 sm:gap-4 mb-6" }, [
    { id: 0, num: "1", title: "Gi\xE1o \xE1n", desc: "T\u1EA3i file Word & Ph\xE2n t\xEDch" },
    { id: 1, num: "2", title: "N\u1ED9i dung t\xEDch h\u1EE3p", desc: "Ch\u1ECDn NLS, AI, HSKT, QP, B\u0110KH" },
    { id: 2, num: "3", title: "Duy\u1EC7t \xB7 T\u1EA3i Word", desc: `Xem ${items.length} \u0111o\u1EA1n ch\xE8n & T\u1EA3i docx` }
  ].map((s) => {
    const isActive = step === s.id;
    const isDone = s.id === 0 && !!docInfo || s.id === 1 && items.length > 0 || s.id === 2 && activeCount > 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        onClick: () => {
          if (s.id === 0 || s.id === 1 && docInfo || s.id === 2 && items.length > 0) {
            setStep(s.id);
          }
        },
        className: `p-3 sm:p-4 rounded-2xl border text-left transition-all ${isActive ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300" : isDone ? "bg-white text-slate-800 border-purple-200 hover:border-purple-300" : "bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isActive ? "bg-white text-purple-700" : isDone ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-500"}` }, s.num), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-sm truncate" }, s.title)),
      /* @__PURE__ */ React.createElement("p", { className: `text-xs mt-1 truncate hidden sm:block ${isActive ? "text-purple-100" : "text-slate-500"}` }, s.desc)
    );
  })), error && /* @__PURE__ */ React.createElement("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 font-medium" }, error), /* @__PURE__ */ React.createElement("button", { onClick: () => setError(null), className: "text-red-400 hover:text-red-700 font-bold" }, "\u2715")), step === 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-800 mb-1 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4C4}"), " B\u01B0\u1EDBc 1: Ch\u1ECDn gi\xE1o \xE1n c\u1EA7n t\xEDch h\u1EE3p"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-6" }, "H\u1ED7 tr\u1EE3 file Word (.docx). H\u1EC7 th\u1ED1ng s\u1EBD t\u1EF1 \u0111\u1ED9ng qu\xE9t s\u1ED1 \u0111o\u1EA1n, b\u1EA3ng bi\u1EC3u, \u1EA3nh v\xE0 c\xF4ng th\u1EE9c to\xE1n h\u1ECDc."), !docInfo ? /* @__PURE__ */ React.createElement(
    "div",
    {
      onDragOver: (e) => {
        e.preventDefault();
        setIsDragging(true);
      },
      onDragLeave: () => setIsDragging(false),
      onDrop: (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
      },
      className: `border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${isDragging ? "border-purple-500 bg-purple-50/50 scale-[1.01]" : "border-slate-300 hover:border-purple-400 hover:bg-slate-50/50"}`,
      onClick: () => document.getElementById("file-lesson-input").click()
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "file-lesson-input",
        type: "file",
        accept: ".docx",
        className: "hidden",
        onChange: (e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4" }, "\u{1F4E5}"),
    /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-slate-800" }, "B\u1EA5m ho\u1EB7c k\xE9o th\u1EA3 file gi\xE1o \xE1n Word (.docx) v\xE0o \u0111\xE2y"),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1 max-w-md mx-auto" }, "Khuy\u1EBFn ngh\u1ECB t\u1EA3i t\u1EEBng b\xE0i d\u1EA1y (1 - 3 ti\u1EBFt) \u0111\u1EC3 AI ph\xE2n t\xEDch chu\u1EA9n x\xE1c v\xE0 chi ti\u1EBFt nh\u1EA5t.")
  ) : /* @__PURE__ */ React.createElement("div", { className: "bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-2xl shrink-0 font-bold" }, "W"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-base" }, docInfo.fileName), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap mt-1 text-xs font-semibold text-slate-600" }, /* @__PURE__ */ React.createElement("span", { className: "bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-md" }, docInfo.paraCount, " \u0111o\u1EA1n v\u0103n"), /* @__PURE__ */ React.createElement("span", { className: "bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md" }, docInfo.tables, " b\u1EA3ng bi\u1EC3u"), /* @__PURE__ */ React.createElement("span", { className: "bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-md" }, docInfo.images, " h\xECnh \u1EA3nh"), /* @__PURE__ */ React.createElement("span", { className: "bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-md" }, docInfo.maths, " c\xF4ng th\u1EE9c")))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setDocInfo(null);
        setItems([]);
      },
      className: "text-xs font-bold text-purple-700 hover:text-purple-900 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all self-start sm:self-center"
    },
    "Ch\u1ECDn file kh\xE1c"
  ))), docInfo && /* @__PURE__ */ React.createElement("div", { className: "mt-6 pt-6 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-800 text-sm mb-4" }, "X\xE1c nh\u1EADn th\xF4ng tin b\xE0i d\u1EA1y (AI t\u1EF1 \u0111\u1ED9ng nh\u1EADn di\u1EC7n t\u1EEB file)"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-600 mb-1.5 uppercase" }, "M\xF4n h\u1ECDc"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: subject,
      onChange: (e) => setSubject(e.target.value),
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
    },
    SUBJECTS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-600 mb-1.5 uppercase" }, "Kh\u1ED1i l\u1EDBp"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: grade,
      onChange: (e) => setGrade(Number(e.target.value)),
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
    },
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => /* @__PURE__ */ React.createElement("option", { key: g, value: g }, "L\u1EDBp ", g))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-600 mb-1.5 uppercase" }, "T\xEAn b\xE0i h\u1ECDc"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: title,
      onChange: (e) => setTitle(e.target.value),
      placeholder: "Nh\u1EADp t\xEAn b\xE0i d\u1EA1y...",
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-indigo-900" }, "Ph\xE2n ph\u1ED1i ch\u01B0\u01A1ng tr\xECnh (PPCT - T\xF9y ch\u1ECDn)"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-indigo-600" }, ppctName ? `\u0110\xE3 t\u1EA3i: ${ppctName}` : "T\u1EA3i file PPCT (.docx/.xlsx) \u0111\u1EC3 AI tr\xEDch xu\u1EA5t ch\xEDnh x\xE1c theo quy \u0111\u1ECBnh nh\xE0 tr\u01B0\u1EDDng.")), /* @__PURE__ */ React.createElement("label", { className: "px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-50 shrink-0" }, ppctName ? "\u0110\u1ED5i file" : "T\u1EA3i PPCT", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".docx,.xlsx", className: "hidden", onChange: (e) => e.target.files?.[0] && handlePpctUpload(e.target.files[0]) }))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(1),
      className: "px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, "Ti\u1EBFp t\u1EE5c: ch\u1ECDn n\u1ED9i dung t\xEDch h\u1EE3p"),
    /* @__PURE__ */ React.createElement("span", null, "\u2192")
  )))), step === 1 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-800 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F9E9}"), " B\u01B0\u1EDBc 2: Ch\u1ECDn n\u1ED9i dung c\u1EA7n t\xEDch h\u1EE3p"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "B\u1EADt c\xE1c n\u1ED9i dung th\u1EA7y/c\xF4 mu\u1ED1n l\u1ED3ng gh\xE9p v\xE0o k\u1EBF ho\u1EA1ch b\xE0i d\u1EA1y.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(0),
      className: "text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl"
    },
    "\u2190 Quay l\u1EA1i gi\xE1o \xE1n"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 my-6" }, /* @__PURE__ */ React.createElement("div", { className: `p-5 rounded-2xl border transition-all ${opts.nls ? "bg-blue-50/50 border-blue-400" : "bg-slate-50/50 border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F4BB}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-sm" }, "N\u0103ng l\u1EF1c s\u1ED1 (NLS)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "M\u1EE5c ti\xEAu + ho\u1EA1t \u0111\u1ED9ng, g\u1EA1ch ch\xE2n k\xE8m m\xE3 ch\u1EC9 b\xE1o (vd 1.2.TC1a)"))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: opts.nls,
      onChange: (e) => setOpts({ ...opts, nls: e.target.checked }),
      className: "w-5 h-5 accent-blue-600 rounded cursor-pointer"
    }
  )), opts.nls && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-blue-100" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: nlsNote,
      onChange: (e) => setNlsNote(e.target.value),
      placeholder: "Y\xEAu c\u1EA7u NLS c\u1EE5 th\u1EC3 (\u0111\u1EC3 tr\u1ED1ng = AI t\u1EF1 ch\u1ECDn ch\u1EC9 b\xE1o chu\u1EA9n theo b\xE0i)...",
      className: "w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: `p-5 rounded-2xl border transition-all ${opts.ai ? "bg-red-50/50 border-red-400" : "bg-slate-50/50 border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F916}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-sm" }, "N\u0103ng l\u1EF1c Tr\xED tu\u1EC7 nh\xE2n t\u1EA1o (AI)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Theo khung Q\u0110 2422 c\u1EE7a B\u1ED9 GD&\u0110T, ch\u1EEF \u0111\u1ECF ph\xE2n bi\u1EC7t"))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: opts.ai,
      onChange: (e) => setOpts({ ...opts, ai: e.target.checked }),
      className: "w-5 h-5 accent-red-600 rounded cursor-pointer"
    }
  )), opts.ai && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-red-100" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: aiNote,
      onChange: (e) => setAiNote(e.target.value),
      placeholder: "Y\xEAu c\u1EA7u AI c\u1EE5 th\u1EC3 (v\xED d\u1EE5: d\xF9ng chatbot AI tra c\u1EE9u, t\u1EA1o \u1EA3nh minh h\u1ECDa b\xE0i h\u1ECDc)...",
      className: "w-full p-2.5 bg-white border border-red-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-400"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: `p-5 rounded-2xl border transition-all ${opts.kt ? "bg-emerald-50/50 border-emerald-400" : "bg-slate-50/50 border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F331}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-sm" }, "H\u1ECDc sinh khuy\u1EBFt t\u1EADt h\xF2a nh\u1EADp"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "M\u1EE5c ti\xEAu ri\xEAng + nhi\u1EC7m v\u1EE5 \u0111i\u1EC1u ch\u1EC9nh gi\u1EA3m t\u1EA3i \u1EDF t\u1EEBng ho\u1EA1t \u0111\u1ED9ng, ch\u1EEF xanh l\xE1"))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: opts.kt,
      onChange: (e) => setOpts({ ...opts, kt: e.target.checked }),
      className: "w-5 h-5 accent-emerald-600 rounded cursor-pointer"
    }
  )), opts.kt && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-emerald-100" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-emerald-800 mb-2" }, "Ch\u1ECDn d\u1EA1ng khuy\u1EBFt t\u1EADt trong l\u1EDBp:"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3" }, DISABILITY_TYPES.map((d) => {
    const isSel = selectedDisabilities.includes(d.key);
    return /* @__PURE__ */ React.createElement(
      "label",
      {
        key: d.key,
        onClick: () => {
          setSelectedDisabilities(
            (prev) => isSel ? prev.filter((k) => k !== d.key) : [...prev, d.key]
          );
        },
        className: `p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${isSel ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"}`
      },
      /* @__PURE__ */ React.createElement("span", null, d.label),
      /* @__PURE__ */ React.createElement("span", { className: "text-emerald-700 font-bold" }, isSel ? "\u2713" : "+")
    );
  })), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: disabilityNote,
      onChange: (e) => setDisabilityNote(e.target.value),
      placeholder: "Ghi ch\xFA \u0111i\u1EC1u ch\u1EC9nh ri\xEAng cho HSKT (v\xED d\u1EE5: Gi\u1EA3m nh\u1EB9 m\u1EE5c ti\xEAu 2, cho d\xF9ng m\xE1y t\xEDnh c\u1EA7m tay, c\u1EED b\u1EA1n h\u1ED7 tr\u1EE3)...",
      rows: 2,
      className: "w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: `p-5 rounded-2xl border transition-all ${opts.qp ? "bg-indigo-50/50 border-indigo-400" : "bg-slate-50/50 border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F1FB}\u{1F1F3}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-sm" }, "Gi\xE1o d\u1EE5c qu\u1ED1c ph\xF2ng v\xE0 an ninh (GDQP&AN)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "C\u0103n c\u1EE9 Th\xF4ng t\u01B0 08/2024/TT-BGD\u0110T, ch\u1EEF xanh d\u01B0\u01A1ng, c\xF3 ti\u1EC1n t\u1ED1 [T\xEDch h\u1EE3p GDQPAN]"))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: opts.qp,
      onChange: (e) => setOpts({ ...opts, qp: e.target.checked }),
      className: "w-5 h-5 accent-indigo-600 rounded cursor-pointer"
    }
  )), opts.qp && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-indigo-100" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-indigo-900 mb-2" }, "B\u1EA5m g\u1EE3i \xFD nhanh ch\u1EE7 \u0111\u1EC1 l\u1ED3ng gh\xE9p:"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-3" }, GDQPAN_SUGGESTIONS.map((sug, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      type: "button",
      onClick: () => setQpNote((prev) => prev ? prev + "; " + sug : sug),
      className: "text-[11px] bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg font-medium"
    },
    "+ ",
    sug
  ))), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: qpNote,
      onChange: (e) => setQpNote(e.target.value),
      placeholder: "Nh\u1EADp n\u1ED9i dung l\u1ED3ng gh\xE9p GDQP&AN c\u1EE5 th\u1EC3 cho b\xE0i d\u1EA1y n\xE0y...",
      rows: 2,
      className: "w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-400"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: `p-5 rounded-2xl border transition-all ${opts.bd ? "bg-orange-50/50 border-orange-400" : "bg-slate-50/50 border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F30D}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-slate-900 text-sm" }, "Bi\u1EBFn \u0111\u1ED5i kh\xED h\u1EADu - Ph\xF2ng ch\u1ED1ng thi\xEAn tai (B\u0110KH)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Gi\xE1o d\u1EE5c sinh th\xE1i, ti\u1EBFt ki\u1EC7m n\u0103ng l\u01B0\u1EE3ng, l\u1ED1i s\u1ED1ng xanh, ch\u1EEF m\xE0u cam"))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: opts.bd,
      onChange: (e) => setOpts({ ...opts, bd: e.target.checked }),
      className: "w-5 h-5 accent-orange-600 rounded cursor-pointer"
    }
  )), opts.bd && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-orange-100" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-orange-900 mb-2" }, "B\u1EA5m g\u1EE3i \xFD nhanh ch\u1EE7 \u0111\u1EC1 m\xF4i tr\u01B0\u1EDDng:"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mb-3" }, BDKH_SUGGESTIONS.map((sug, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      type: "button",
      onClick: () => setBdNote((prev) => prev ? prev + "; " + sug : sug),
      className: "text-[11px] bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 px-2.5 py-1 rounded-lg font-medium"
    },
    "+ ",
    sug
  ))), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: bdNote,
      onChange: (e) => setBdNote(e.target.value),
      placeholder: "Nh\u1EADp n\u1ED9i dung l\u1ED3ng gh\xE9p B\u0110KH c\u1EE5 th\u1EC3 (v\xED d\u1EE5: li\xEAn h\u1EC7 b\xE0i to\xE1n r\xE1c th\u1EA3i nh\u1EF1a, ti\u1EBFt ki\u1EC7m \u0111i\u1EC7n ph\xF2ng h\u1ECDc)...",
      rows: 2,
      className: "w-full p-2.5 bg-white border border-orange-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-400"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pt-4 border-t border-slate-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(0),
      className: "px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-sm"
    },
    "\u2190 Quay l\u1EA1i gi\xE1o \xE1n"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleRunAi,
      className: "px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u2728 K\xCDCH HO\u1EA0T T\xCDCH H\u1EE2P V\xC0O GI\xC1O \xC1N")
  ))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-900 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4E5}"), " B\u01B0\u1EDBc 3: Duy\u1EC7t c\xE1c \u0111o\u1EA1n ch\xE8n & T\u1EA3i file Word"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "AI \u0111\u1ECDc gi\xE1o \xE1n v\xE0 \u0111\u1EC1 xu\u1EA5t ", items.length, " \u0111o\u1EA1n ch\xE8n. Th\u1EA7y/c\xF4 c\xF3 th\u1EC3 b\u1EADt/t\u1EAFt ho\u1EB7c ch\u1EC9nh s\u1EEDa c\xE2u ch\u1EEF tr\u1EF1c ti\u1EBFp tr\u01B0\u1EDBc khi xu\u1EA5t file.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleCopyReport,
      className: "px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4CB}"),
    /* @__PURE__ */ React.createElement("span", null, copiedReport ? "\u2713 \u0110\xE3 sao ch\xE9p!" : "B\xE1o c\xE1o t\xEDch h\u1EE3p")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(1),
      className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
    },
    "\u{1F504} T\xEDch h\u1EE3p l\u1EA1i"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 py-4 border-b border-slate-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-1.5" }, [
    { id: "all", label: `T\u1EA5t c\u1EA3 (${items.length})` },
    { id: "nls", label: `N\u0103ng l\u1EF1c s\u1ED1 (${items.filter((i) => i.k === "nls").length})` },
    { id: "ai", label: `N\u0103ng l\u1EF1c AI (${items.filter((i) => i.k === "ai").length})` },
    { id: "kt", label: `HS khuy\u1EBFt t\u1EADt (${items.filter((i) => i.k === "kt").length})` },
    { id: "qp", label: `GDQPAN (${items.filter((i) => i.k === "qp").length})` },
    { id: "bd", label: `B\u0110KH (${items.filter((i) => i.k === "bd").length})` }
  ].map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      onClick: () => setActiveFilter(f.id),
      className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeFilter === f.id ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`
    },
    f.label
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setItems((prev) => prev.map((it) => ({ ...it, on: true }))),
      className: "text-xs font-bold text-purple-700 hover:underline"
    },
    "Ch\u1ECDn h\u1EBFt"
  ), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "\u2022"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setItems((prev) => prev.map((it) => ({ ...it, on: false }))),
      className: "text-xs font-bold text-slate-500 hover:underline"
    },
    "B\u1ECF h\u1EBFt"
  ), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "\u2022"), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: colorEnabled,
      onChange: (e) => setColorEnabled(e.target.checked),
      className: "w-4 h-4 accent-purple-600 rounded"
    }
  ), /* @__PURE__ */ React.createElement("span", null, "T\xF4 m\xE0u ph\u1EA7n t\xEDch h\u1EE3p")))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 my-6" }, filteredItems.map((item) => {
    const cat = CATEGORIES[item.k] || CATEGORIES.nls;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: item.id,
        className: `p-4 rounded-2xl border transition-all ${item.on ? "bg-white border-slate-300 shadow-sm" : "bg-slate-50/60 border-slate-200 opacity-60"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: item.on,
          onChange: (e) => {
            const val = e.target.checked;
            setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, on: val } : it));
          },
          className: "w-4 h-4 accent-purple-600 rounded cursor-pointer"
        }
      ), /* @__PURE__ */ React.createElement(
        "span",
        {
          style: { backgroundColor: cat.bg, color: cat.textCol, borderColor: cat.border },
          className: "px-2.5 py-0.5 rounded-lg border text-xs font-extrabold uppercase tracking-wide"
        },
        cat.label
      ), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "V\u1ECB tr\xED: sau \u0111o\u1EA1n ", item.a, " \u2022 Ki\u1EC3u: ", item.w === "end" ? "n\u1ED1i cu\u1ED1i \u0111o\u1EA1n" : "d\xF2ng m\u1EDBi b\xEAn d\u01B0\u1EDBi"))),
      /* @__PURE__ */ React.createElement(
        "textarea",
        {
          value: item.t,
          onChange: (e) => {
            const val = e.target.value;
            setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, t: val } : it));
          },
          rows: 2,
          className: "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
        }
      )
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "sticky bottom-4 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-40" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4E5}"), " \u0110\xE3 duy\u1EC7t ", activeCount, " / ", items.length, " \u0111o\u1EA1n ch\xE8n"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 mt-0.5" }, "File Word gi\u1EEF nguy\xEAn 100% font ch\u1EEF, b\u1EA3ng, \u1EA3nh, c\xF4ng th\u1EE9c g\u1ED1c c\u1EE7a gi\xE1o \xE1n.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 w-full sm:w-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setStep(0);
        setDocInfo(null);
        setItems([]);
      },
      className: "px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
    },
    "\u{1F504} Gi\xE1o \xE1n kh\xE1c"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleDownloadWord,
      disabled: downloading || activeCount === 0,
      className: "flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, downloading ? "\u0110ang t\u1EA1o file..." : `\u{1F4E5} T\u1EA3i Word (${activeCount} \u0111o\u1EA1n)`)
  ))))), loading && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce" }, "\u2728"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "AI \u0110ang X\u1EED L\xFD T\xEDch H\u1EE3p"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-6 font-medium" }, progressStatus), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300",
      style: { width: `${progress}%` }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-xs text-slate-400 font-bold" }, /* @__PURE__ */ React.createElement("span", null, "\u0110ang t\xEDnh to\xE1n..."), /* @__PURE__ */ React.createElement("span", null, progress, "%")))), /* @__PURE__ */ React.createElement("footer", { className: "text-center text-slate-400 text-xs py-10 mt-12 border-t border-slate-200/60" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-600" }, "\u2728 MHEdu AI \u2022 \u0110\u1ED3ng h\xE0nh c\xF9ng Gi\xE1o vi\xEAn \u0110\u1ED5i m\u1EDBi & Chuy\u1EC3n \u0111\u1ED5i s\u1ED1 Gi\xE1o d\u1EE5c"), /* @__PURE__ */ React.createElement("p", { className: "mt-1" }, "H\u1EC7 th\u1ED1ng ph\xE1t tri\u1EC3n b\u1EDFi NMH Th\u1EA7y Nguy\u1EC5n M\u1EA1nh H\xF9ng \u2022 B\u1EA3o to\xE0n 100% \u0111\u1ECBnh d\u1EA1ng gi\xE1o \xE1n g\u1ED1c")));
}
var rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
export {
  App
};
