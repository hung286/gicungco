// public/ai-tools/tao-game/assets/scormPackager.js
function sanitizeFilename(name) {
  return String(name || "MHEdu_Game").replace(/[^\p{L}\p{N}._-]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "MHEdu_Game";
}
function escapeXml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function generateScormManifest(gameTitle) {
  const safeTitle = escapeXml(gameTitle || "MHEdu Game");
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="vn.smartedu.aigame" version="1"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="smartedu_org">
    <organization identifier="smartedu_org">
      <title>${safeTitle}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${safeTitle}</title>
        <adlcp:masteryscore>50</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;
}
var SCORM_TRACKING_SCRIPT = `<script id="smartedu-scorm-bridge">
(function(){
  var api = null, w = window, n = 0;
  try {
    while (w && !w.API && w.parent && w.parent !== w && n < 10) {
      w = w.parent;
      n++;
    }
    api = w.API || null;
  } catch(e) {}
  if (!api) {
    try { api = window.opener && window.opener.API || null; } catch(e) {}
  }
  function call(f, a, b) {
    try { return api && api[f] ? api[f](a, b) : ""; } catch(e) { return ""; }
  }
  call("LMSInitialize", "");
  if (call("LMSGetValue", "cmi.core.lesson_status") === "not attempted") {
    call("LMSSetValue", "cmi.core.lesson_status", "incomplete");
  }
  call("LMSCommit", "");

  function reportComplete(data) {
    if (!data || data.type !== "GAME_COMPLETE") return;
    var max = Number(data.maxScore) || 100;
    var s = Number(data.score) || 0;
    var pct = max > 0 ? Math.round(s / max * 100) : 100;
    call("LMSSetValue", "cmi.core.score.min", "0");
    call("LMSSetValue", "cmi.core.score.max", "100");
    call("LMSSetValue", "cmi.core.score.raw", String(Math.max(0, Math.min(100, pct))));
    call("LMSSetValue", "cmi.core.lesson_status", pct >= 50 ? "passed" : "failed");
    call("LMSCommit", "");
    call("LMSFinish", "");
  }

  // L\u1EAFng nghe t\xEDn hi\u1EC7u ho\xE0n th\xE0nh t\u1EEB game
  window.addEventListener("message", function(e) {
    if (e && e.data && e.data.type === "GAME_COMPLETE") {
      reportComplete(e.data);
    }
  });

  // H\u1ED7 tr\u1EE3 hook tr\u1EF1c ti\u1EBFp window.parent.postMessage
  var origPostMessage = window.parent.postMessage;
  try {
    window.parent.postMessage = function(m, t) {
      reportComplete(m);
      if (origPostMessage) {
        try { origPostMessage.call(window.parent, m, t); } catch(err) {}
      }
    };
  } catch(e) {}
})();
<\/script>`;
function injectScormIntoHtml(html) {
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    return html.replace(headMatch[0], headMatch[0] + "\n" + SCORM_TRACKING_SCRIPT);
  }
  const htmlMatch = html.match(/<html[^>]*>/i);
  if (htmlMatch) {
    return html.replace(htmlMatch[0], htmlMatch[0] + "\n<head>" + SCORM_TRACKING_SCRIPT + "</head>");
  }
  return "<head>" + SCORM_TRACKING_SCRIPT + "</head>\n" + html;
}
async function createScormPackage(htmlContent, gameTitle) {
  if (!window.JSZip) {
    throw new Error("Th\u01B0 vi\u1EC7n JSZip ch\u01B0a \u0111\u01B0\u1EE3c t\u1EA3i. Vui l\xF2ng t\u1EA3i l\u1EA1i trang.");
  }
  const zip = new window.JSZip();
  const scormHtml = injectScormIntoHtml(htmlContent);
  const manifest = generateScormManifest(gameTitle);
  zip.file("index.html", scormHtml);
  zip.file("imsmanifest.xml", manifest);
  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// public/ai-tools/tao-game/app.js
var { useState, useEffect, useMemo, useRef } = React;
var GAME_TYPES = [
  { id: "quiz", icon: "\u{1F170}\uFE0F", label: "Tr\u1EAFc nghi\u1EC7m 4 \u0111\xE1p \xE1n", desc: "Ch\u1ECDn 1 \u0111\xE1p \xE1n \u0111\xFAng trong 4 ph\u01B0\u01A1ng \xE1n" },
  { id: "true_false", icon: "\u2705", label: "\u0110\xFAng / Sai", desc: "X\xE1c \u0111\u1ECBnh c\xE2u kh\u1EB3ng \u0111\u1ECBnh \u0111\xFAng hay sai" },
  { id: "matching", icon: "\u{1F517}", label: "N\u1ED1i c\u1EB7p t\u01B0\u01A1ng \u1EE9ng", desc: "N\u1ED1i c\u1ED9t kh\xE1i ni\u1EC7m v\u1EDBi \u0111\u1ECBnh ngh\u0129a/k\u1EBFt qu\u1EA3" },
  { id: "fill_blank", icon: "\u270F\uFE0F", label: "\u0110i\u1EC1n t\u1EEB v\xE0o ch\u1ED7 tr\u1ED1ng", desc: "G\xF5 t\u1EEB ho\u1EB7c ch\u1ECDn t\u1EEB c\xF2n thi\u1EBFu trong c\xE2u" },
  { id: "drag_drop", icon: "\u{1F5C2}\uFE0F", label: "K\xE9o th\u1EA3 ph\xE2n lo\u1EA1i", desc: "K\xE9o c\xE1c th\u1EBB v\xE0o \u0111\xFAng nh\xF3m ch\u1EE7 \u0111\u1EC1" },
  { id: "sequencing", icon: "\u{1F522}", label: "S\u1EAFp x\u1EBFp th\u1EE9 t\u1EF1", desc: "K\xE9o x\u1EBFp c\xE1c b\u01B0\u1EDBc ho\u1EB7c s\u1EF1 ki\u1EC7n theo tr\xECnh t\u1EF1" },
  { id: "memory", icon: "\u{1F0CF}", label: "L\u1EADt th\u1EBB ghi nh\u1EDB", desc: "L\u1EADt m\u1EDF v\xE0 t\xECm c\xE1c c\u1EB7p th\u1EBB t\u01B0\u01A1ng \u1EE9ng" },
  { id: "word_search", icon: "\u{1F50D}", label: "T\xECm ch\u1EEF \xF4 vu\xF4ng", desc: "T\xECm c\xE1c t\u1EEB kh\xF3a \u1EA9n trong ma tr\u1EADn ch\u1EEF" },
  { id: "crossword", icon: "\u{1F9E9}", label: "Gi\u1EA3i \xF4 ch\u1EEF", desc: "Tr\u1EA3 l\u1EDDi c\xE2u h\u1ECFi g\u1EE3i \xFD \u0111\u1EC3 m\u1EDF \xF4 ch\u1EEF h\xE0ng ngang" },
  { id: "hangman", icon: "\u{1F524}", label: "\u0110o\xE1n ch\u1EEF b\xED m\u1EADt", desc: "\u0110o\xE1n t\u1EEBng ch\u1EEF c\xE1i tr\u01B0\u1EDBc khi h\u1EBFt l\u01B0\u1EE3t" }
];
var THEME_COLORS = [
  { id: "blue", label: "Xanh d\u01B0\u01A1ng", hex: "#3b82f6", bg: "from-blue-600 to-indigo-600" },
  { id: "emerald", label: "Ng\u1ECDc l\u1EE5c b\u1EA3o", hex: "#10b981", bg: "from-emerald-600 to-teal-600" },
  { id: "violet", label: "T\xEDm m\u1ED9ng m\u01A1", hex: "#8b5cf6", bg: "from-purple-600 to-violet-600" },
  { id: "rose", label: "H\u1ED3ng quy\u1EBFn r\u0169", hex: "#f43f5e", bg: "from-rose-600 to-pink-600" },
  { id: "amber", label: "H\u1ED5 ph\xE1ch v\xE0ng", hex: "#f59e0b", bg: "from-amber-500 to-orange-600" },
  { id: "cyan", label: "Xanh l\u01A1 t\u01B0\u01A1i m\xE1t", hex: "#06b6d4", bg: "from-cyan-600 to-blue-600" }
];
var FONTS = ["Inter", "Quicksand", "Nunito", "Roboto"];
function App() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [docText, setDocText] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(["quiz"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [themeColor, setThemeColor] = useState("blue");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [iconsEnabled, setIconsEnabled] = useState(true);
  const [gameTitle, setGameTitle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState(null);
  const [gameHtml, setGameHtml] = useState("");
  const [adjustPrompt, setAdjustPrompt] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const iframeRef = useRef(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("smartedu_imath_questions") || localStorage.getItem("smartedu_imath_questions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBankQuestions(parsed);
        }
      }
    } catch (e) {
    }
  }, []);
  const handleUseMHEduQuestions = () => {
    if (bankQuestions.length === 0) {
      alert("Ch\u01B0a t\xECm th\u1EA5y c\xE2u h\u1ECFi n\xE0o trong kho MHEdu. Th\u1EA7y c\xF4 c\xF3 th\u1EC3 nh\u1EADp ch\u1EE7 \u0111\u1EC1 ho\u1EB7c t\u1EA3i t\xE0i li\u1EC7u b\xE0i h\u1ECDc.");
      return;
    }
    const formatted = bankQuestions.slice(0, 20).map((q, idx) => {
      const stem = q.stem || q.question || q.questionText || "";
      const opts = q.options ? q.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`).join("\n") : "";
      const ans = q.answer !== void 0 ? `  => \u0110\xE1p \xE1n \u0111\xFAng: ${q.answer}` : "";
      return `C\xE2u ${idx + 1}: ${stem}
${opts}${ans ? "\n" + ans : ""}`;
    }).join("\n\n");
    setDocText(formatted);
    setDocFileName(`Ng\xE2n h\xE0ng MHEdu (${bankQuestions.length} c\xE2u)`);
    setQuestionCount(Math.min(bankQuestions.length, 15));
    if (!gameTitle) setGameTitle("\u0110\u1ED1 vui ki\u1EBFn th\u1EE9c");
  };
  const handleFileUpload = async (file) => {
    if (!file) return;
    setDocFileName(file.name);
    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      setDocText(text.slice(0, 25e3));
    } else {
      try {
        if (window.JSZip && file.name.endsWith(".docx")) {
          const buf = await file.arrayBuffer();
          const zip = await window.JSZip.loadAsync(buf);
          const xml = await zip.file("word/document.xml")?.async("string");
          if (xml) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "application/xml");
            const textNodes = Array.from(xmlDoc.getElementsByTagName("w:t")).map((n) => n.textContent);
            setDocText(textNodes.join(" ").replace(/\s+/g, " ").slice(0, 25e3));
          }
        } else {
          setDocText(`T\xE0i li\u1EC7u b\xE0i h\u1ECDc: ${file.name}`);
        }
      } catch (err) {
        setDocText(`T\xE0i li\u1EC7u b\xE0i h\u1ECDc: ${file.name}`);
      }
    }
  };
  const handleGenerateGame = async (isAdjust = false) => {
    const inputContent = (topic.trim() + "\n" + docText.trim()).trim();
    if (!inputContent && !isAdjust) {
      setError("Vui l\xF2ng nh\u1EADp ch\u1EE7 \u0111\u1EC1 b\xE0i h\u1ECDc, t\u1EA3i t\xE0i li\u1EC7u ho\u1EB7c l\u1EA5y c\xE2u h\u1ECFi t\u1EEB MHEdu tr\u01B0\u1EDBc.");
      setStep(0);
      return;
    }
    setError(null);
    if (isAdjust) {
      if (!adjustPrompt.trim()) return;
      setAdjusting(true);
    } else {
      setLoading(true);
      setProgress(15);
      setProgressMsg("\u0110ang k\u1EBFt n\u1ED1i Gemini AI v\xE0 ph\xE2n t\xEDch n\u1ED9i dung h\u1ECDc t\u1EADp...");
    }
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
    const curColor = THEME_COLORS.find((c) => c.id === themeColor) || THEME_COLORS[0];
    const selectedTypesDesc = selectedTypes.map((t) => {
      const g = GAME_TYPES.find((gt) => gt.id === t);
      return g ? `${g.label} (${g.desc})` : t;
    }).join("; ");
    let prompt = "";
    if (isAdjust) {
      prompt = `B\u1EA1n l\xE0 Chuy\xEAn gia L\u1EADp tr\xECnh Web Game Gi\xE1o D\u1EE5c c\u1EE7a MHEdu.
D\u01B0\u1EDBi \u0111\xE2y l\xE0 m\xE3 ngu\u1ED3n HTML5 c\u1EE7a m\u1ED9t tr\xF2 ch\u01A1i t\u01B0\u01A1ng t\xE1c gi\xE1o d\u1EE5c:
\`\`\`html
${gameHtml}
\`\`\`

Y\xCAU C\u1EA6U \u0110I\u1EC0U CH\u1EC8NH T\u1EEA GI\xC1O VI\xCAN:
"${adjustPrompt.trim()}"

H\u01AF\u1EDANG D\u1EAAN C\u1EACP NH\u1EACT:
1. Gi\u1EEF nguy\xEAn c\u1EA5u tr\xFAc ho\u1EA1t \u0111\u1ED9ng c\u1ED1t l\xF5i c\u1EE7a game, c\xE1c c\xE2u h\u1ECFi v\xE0 c\u01A1 ch\u1EBF t\xEDnh \u0111i\u1EC3m.
2. C\u1EADp nh\u1EADt ch\xEDnh x\xE1c theo y\xEAu c\u1EA7u (giao di\u1EC7n, m\xE0u s\u1EAFc, th\u1EDDi gian, c\u1EE1 ch\u1EEF, lu\u1EADt ch\u01A1i, hi\u1EC7u \u1EE9ng \xE2m thanh...).
3. B\u1EAET BU\u1ED8C ch\u1EC9 tr\u1EA3 v\u1EC1 to\xE0n b\u1ED9 m\xE3 HTML5 ho\xE0n ch\u1EC9nh m\u1EDBi, b\u1EAFt \u0111\u1EA7u t\u1EEB <!DOCTYPE html> v\xE0 k\u1EBFt th\xFAc b\u1EB1ng </html>, kh\xF4ng b\u1ECDc trong markdown v\xE0 kh\xF4ng c\xF3 v\u0103n b\u1EA3n gi\u1EA3i th\xEDch.`;
    } else {
      prompt = `B\u1EA1n l\xE0 Chuy\xEAn gia L\u1EADp tr\xECnh Web Game Gi\xE1o D\u1EE5c c\u1EE7a MHEdu.
Nhi\u1EC7m v\u1EE5: L\u1EADp tr\xECnh m\u1ED9t MINI-GAME GI\xC1O D\u1EE4C HTML5 T\u01AF\u01A0NG T\xC1C HO\xC0N CH\u1EC8NH, \u0110\u1ED8C L\u1EACP (Single File HTML) \u0111\u1EC3 h\u1ECDc sinh ch\u01A1i \xF4n t\u1EADp b\xE0i h\u1ECDc.

TH\xD4NG TIN B\xC0I D\u1EA0Y & Y\xCAU C\u1EA6U C\u1EA4U H\xCCNH:
- Ti\xEAu \u0111\u1EC1 game: ${gameTitle || topic || "Th\u1EED Th\xE1ch Tr\xED Tu\u1EC7"}
- D\u1EA1ng game y\xEAu c\u1EA7u: ${selectedTypesDesc || "Tr\u1EAFc nghi\u1EC7m t\u01B0\u01A1ng t\xE1c sinh \u0111\u1ED9ng"}
- S\u1ED1 l\u01B0\u1EE3ng c\xE2u h\u1ECFi/th\u1EED th\xE1ch: ${questionCount} c\xE2u
- T\xF4ng m\xE0u ch\u1EE7 \u0111\u1EA1o: ${curColor.label} (M\xE3 m\xE0u ch\xEDnh: ${curColor.hex})
- Ph\xF4ng ch\u1EEF: "${fontFamily}", system-ui, sans-serif
- Emoji minh h\u1ECDa: ${iconsEnabled ? "S\u1EED d\u1EE5ng nhi\u1EC1u emoji sinh \u0111\u1ED9ng, b\u1EAFt m\u1EAFt trong t\u1EEBng c\xE2u h\u1ECFi v\xE0 giao di\u1EC7n" : "T\u1ED1i gi\u1EA3n"}
${customPrompt ? `- Y\xEAu c\u1EA7u \u0111\u1EB7c bi\u1EC7t: ${customPrompt}` : ""}

N\u1ED8I DUNG T\xC0I LI\u1EC6U H\u1ECCC T\u1EACP:
"""
${inputContent.slice(0, 15e3)}
"""

QUY CHU\u1EA8N K\u1EF8 THU\u1EACT B\u1EAET BU\u1ED8C CHO FILE HTML5:
1. SINGLE-FILE HO\xC0N CH\u1EC8NH: To\xE0n b\u1ED9 HTML, CSS trong <style> v\xE0 JavaScript trong <script> \u0111\u1EB7t trong 1 file duy nh\u1EA5t. Kh\xF4ng g\u1ECDi th\u01B0 vi\u1EC7n ngo\xE0i (tr\u1EEB Google Fonts), kh\xF4ng g\u1ECDi \u1EA3nh ngo\xE0i.
2. HI\u1EC6U \u1EE8NG \xC2M THANH (WEB AUDIO API):
   T\u1EA1o c\xE1c \xE2m thanh t\u01B0\u01A1ng t\xE1c b\u1EB1ng Web Audio API thu\u1EA7n (kh\xF4ng d\xF9ng file mp3):
   - \xC2m thanh b\u1EA5m n\xFAt (click beep)
   - \xC2m thanh tr\u1EA3 l\u1EDDi \u0110\xDANG (ti\u1EBFng ting cao v\xFAt vui t\u01B0\u01A1i)
   - \xC2m thanh tr\u1EA3 l\u1EDDi SAI (ti\u1EBFng buzz tr\u1EA7m nh\u1EB9)
   - \xC2m thanh CHI\u1EBEN TH\u1EAENG (chu\u1ED7i n\u1ED1t nh\u1EA1c fanfare hoan h\u1EC9)
3. TR\u1EA2I NGHI\u1EC6M H\u1ECCC T\u1EACP S\u01AF PH\u1EA0M:
   - M\xE0n h\xECnh b\u1EAFt \u0111\u1EA7u (Start Screen): T\xEAn game, h\u01B0\u1EDBng d\u1EABn ch\u01A1i, n\xFAt "B\u1EAFt \u0111\u1EA7u ch\u01A1i".
   - M\xE0n h\xECnh ch\u01A1i: Hi\u1EC3n th\u1ECB c\xE2u h\u1ECFi, ti\u1EBFn tr\xECnh (C\xE2u X / Y), \u0111i\u1EC3m s\u1ED1 hi\u1EC7n t\u1EA1i, \u0111\u1ED3ng h\u1ED3 \u0111\u1EBFm ng\u01B0\u1EE3c (n\u1EBFu ph\xF9 h\u1EE3p).
   - Ph\u1EA3n h\u1ED3i t\u1EE9c th\xEC: Khi ch\u1ECDn \u0111\xE1p \xE1n, \u0111\u1ED5i m\xE0u xanh (\u0111\xFAng) ho\u1EB7c \u0111\u1ECF (sai) k\xE8m gi\u1EA3i th\xEDch ng\u1EAFn g\u1ECDn v\xEC sao \u0111\xFAng/sai.
   - M\xE0n h\xECnh k\u1EBFt th\xFAc: T\u1ED5ng \u0111i\u1EC3m, t\u1EF7 l\u1EC7 %, danh hi\u1EC7u khen ng\u1EE3i (Xu\u1EA5t s\u1EAFc / T\u1ED1t / C\u1EA7n c\u1ED1 g\u1EAFng), n\xFAt "Ch\u01A1i l\u1EA1i".
   - Hi\u1EC7u \u1EE9ng ph\xE1o hoa ch\xFAc m\u1EEBng (Canvas Confetti) khi ho\xE0n th\xE0nh xu\u1EA5t s\u1EAFc.
4. T\u01AF\u01A0NG TH\xCDCH SCORM V\xC0 KHUNG EMBED:
   Khi ho\xE0n th\xE0nh tr\xF2 ch\u01A1i, k\xEDch ho\u1EA1t s\u1EF1 ki\u1EC7n:
   window.parent.postMessage({ type: "GAME_COMPLETE", score: score, maxScore: maxScore }, "*");
5. GIAO DI\u1EC6N RESPONSIVE: Thi\u1EBFt k\u1EBF co gi\xE3n ho\xE0n h\u1EA3o tr\xEAn m\xE0n h\xECnh m\xE1y t\xEDnh, m\xE1y chi\u1EBFu l\u1EDBp h\u1ECDc, b\u1EA3ng t\u01B0\u01A1ng t\xE1c v\xE0 \u0111i\u1EC7n tho\u1EA1i di \u0111\u1ED9ng.

\u0110\u1ECANH D\u1EA0NG \u0110\u1EA6U RA:
B\u1EAET BU\u1ED8C ch\u1EC9 tr\u1EA3 v\u1EC1 m\xE3 HTML5 thu\u1EA7n t\xFAy b\u1EAFt \u0111\u1EA7u t\u1EEB <!DOCTYPE html> \u0111\u1EBFn </html>. TUY\u1EC6T \u0110\u1ED0I KH\xD4NG b\u1ECDc trong markdown \`\`\`html ... \`\`\` v\xE0 KH\xD4NG vi\u1EBFt th\xEAm b\u1EA5t k\u1EF3 l\u1EDDi d\u1EABn n\xE0o.`;
    }
    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let generatedHtml = "";
    let lastErr = null;
    const timer = setInterval(() => {
      setProgress((p) => p < 85 ? p + Math.floor(Math.random() * 8) + 4 : p);
    }, 400);
    for (const key of keysToTry) {
      for (const model of MODELS) {
        try {
          if (!isAdjust) setProgressMsg(`AI (${model}) \u0111ang thi\u1EBFt k\u1EBF logic v\xE0 giao di\u1EC7n mini-game...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4
              }
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${res.status}`);
          }
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          text = text.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/i, "").trim();
          if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
            generatedHtml = text;
            break;
          }
        } catch (e) {
          lastErr = e;
          console.warn(`Th\u1EED model ${model} th\u1EA5t b\u1EA1i:`, e.message);
        }
      }
      if (generatedHtml) break;
    }
    clearInterval(timer);
    setLoading(false);
    setAdjusting(false);
    if (generatedHtml) {
      setProgress(100);
      setGameHtml(generatedHtml);
      setAdjustPrompt("");
      setStep(2);
    } else {
      setError("AI kh\xF4ng th\u1EC3 t\u1EA1o game: " + (lastErr?.message || "Vui l\xF2ng ki\u1EC3m tra l\u1EA1i k\u1EBFt n\u1ED1i m\u1EA1ng ho\u1EB7c th\u1EED \u0111\u1ED5i Gemini API Key qua n\xFAt tr\xEAn g\xF3c ph\u1EA3i."));
    }
  };
  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      }
    }
  };
  const handleDownloadHtml = () => {
    if (!gameHtml) return;
    const blob = new Blob([gameHtml], { type: "text/html;charset=utf-8" });
    const name = sanitizeFilename(gameTitle || topic || "MHEdu_Game");
    downloadBlob(blob, `${name}.html`);
  };
  const handleDownloadScorm = async () => {
    if (!gameHtml) return;
    try {
      const name = sanitizeFilename(gameTitle || topic || "MHEdu_Game");
      const zipBlob = await createScormPackage(gameHtml, gameTitle || topic || "MHEdu Game");
      downloadBlob(zipBlob, `${name}_SCORM.zip`);
    } catch (err) {
      console.error(err);
      alert("L\u1ED7i khi t\u1EA1o g\xF3i SCORM: " + err.message);
    }
  };
  const handleSaveToMHEdu = () => {
    if (!gameHtml) return;
    try {
      const customGames = JSON.parse(localStorage.getItem("smartedu_custom_html_games") || "[]");
      const newGame = {
        id: "game_" + Date.now(),
        title: gameTitle || topic || "Mini-game AI",
        htmlContent: gameHtml,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      customGames.unshift(newGame);
      localStorage.setItem("smartedu_custom_html_games", JSON.stringify(customGames.slice(0, 50)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3e3);
    } catch (e) {
      alert("L\u1ED7i l\u01B0u game: " + e.message);
    }
  };
  const handleCopyCode = () => {
    if (!gameHtml) return;
    navigator.clipboard.writeText(gameHtml).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-50 text-slate-800 font-sans pb-24" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-5xl mx-auto px-4 pt-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-md shrink-0" }, "\u{1F579}\uFE0F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight" }, "AI T\u1EA0O GAME NHANH"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider" }, "\u2728 B\u1EA2N \u0110\u1EA6Y \u0110\u1EE6 \u2022 MI\u1EC4N PH\xCD")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1 font-medium" }, "T\u1EA1o mini-game t\u01B0\u01A1ng t\xE1c trong 10 gi\xE2y t\u1EEB gi\xE1o \xE1n ho\u1EB7c c\xE2u h\u1ECFi c\xF3 s\u1EB5n. Xu\u1EA5t SCORM 1.2 n\u1ED9p LMS v\xE0 t\u1EA3i file HTML ch\u01A1i offline 100%.")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 sm:gap-4 mb-6" }, [
    { id: 0, num: "1", title: "T\xE0i li\u1EC7u & C\xE2u h\u1ECFi", desc: "Nh\u1EADp b\xE0i h\u1ECDc ho\u1EB7c ch\u1ECDn c\xE2u h\u1ECFi" },
    { id: 1, num: "2", title: "Lo\u1EA1i game & Giao di\u1EC7n", desc: "10 d\u1EA1ng game, m\xE0u s\u1EAFc, font" },
    { id: 2, num: "3", title: "Ch\u01A1i th\u1EED \xB7 L\u01B0u & Xu\u1EA5t", desc: "Preview, SCORM, T\u1EA3i HTML" }
  ].map((s) => {
    const isActive = step === s.id;
    const isDone = s.id === 0 && (!!topic || !!docText) || s.id === 1 && !!gameHtml || s.id === 2 && !!gameHtml;
    const canClick = s.id === 0 || s.id === 1 || !!gameHtml;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        onClick: () => {
          if (canClick) {
            setStep(s.id);
          }
        },
        className: `p-3 sm:p-4 rounded-2xl border text-left transition-all ${isActive ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300" : canClick ? "bg-white text-slate-800 border-purple-200 hover:border-purple-300 hover:shadow-sm" : "bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isActive ? "bg-white text-purple-700" : isDone ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-500"}` }, s.num), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-sm truncate" }, s.title)),
      /* @__PURE__ */ React.createElement("p", { className: `text-xs mt-1 truncate hidden sm:block ${isActive ? "text-purple-100" : "text-slate-500"}` }, s.desc)
    );
  })), error && /* @__PURE__ */ React.createElement("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 font-medium" }, error), /* @__PURE__ */ React.createElement("button", { onClick: () => setError(null), className: "text-red-400 hover:text-red-700 font-bold" }, "\u2715")), step === 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-800 mb-1 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4DA}"), " B\u01B0\u1EDBc 1: T\xE0i li\u1EC7u & C\xE2u h\u1ECFi cho game"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-6" }, "Th\u1EA7y/c\xF4 c\xF3 th\u1EC3 nh\u1EADp ch\u1EE7 \u0111\u1EC1 b\xE0i h\u1ECDc, t\u1EA3i file t\xE0i li\u1EC7u ho\u1EB7c ch\u1ECDn tr\u1EF1c ti\u1EBFp c\xE2u h\u1ECFi t\u1EEB MHEdu."), bankQuestions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F3AF}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-extrabold text-purple-900 uppercase tracking-wide" }, "Ph\xE1t hi\u1EC7n ng\xE2n h\xE0ng c\xE2u h\u1ECFi MHEdu"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-purple-700 mt-0.5" }, "\u0110ang c\xF3 ", /* @__PURE__ */ React.createElement("strong", null, bankQuestions.length, " c\xE2u h\u1ECFi"), " tr\u1EAFc nghi\u1EC7m s\u1EB5n s\xE0ng bi\u1EBFn th\xE0nh game t\u01B0\u01A1ng t\xE1c."))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleUseMHEduQuestions,
      className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
    },
    "\u26A1 N\u1EA1p c\xE2u h\u1ECFi v\xE0o game"
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 uppercase tracking-wide" }, "1. Nh\u1EADp ch\u1EE7 \u0111\u1EC1 ho\u1EB7c n\u1ED9i dung b\xE0i h\u1ECDc"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400 font-medium" }, "G\u1EE3i \xFD nhanh:"), [
    "To\xE1n 5: Ph\xE2n s\u1ED1",
    "KHTN: Chu tr\xECnh n\u01B0\u1EDBc",
    "Ti\u1EBFng Anh: Tenses",
    "L\u1ECBch s\u1EED: Kh\u1EDFi ngh\u0129a Lam S\u01A1n"
  ].map((sug, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      type: "button",
      onClick: () => {
        setTopic(sug);
        setGameTitle("Tr\xF2 ch\u01A1i: " + sug);
      },
      className: "text-[11px] bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors font-medium"
    },
    sug
  )))), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: topic,
      onChange: (e) => setTopic(e.target.value),
      placeholder: "VD: \u0110\u1ECBnh lu\u1EADt v\u1EA1n v\u1EADt h\u1EA5p d\u1EABn (V\u1EADt l\xED 10) \u2022 C\xE1c th\u1EDDi k\u1EF3 l\u1ECBch s\u1EED Vi\u1EC7t Nam \u2022 T\u1EEB v\u1EF1ng ti\u1EBFng Anh ch\u1EE7 \u0111\u1EC1 M\xF4i tr\u01B0\u1EDDng \u2022 Ph\xE9p c\u1ED9ng tr\u1EEB ph\xE2n s\u1ED1...",
      rows: 3,
      className: "w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-700 uppercase tracking-wide" }, "2. Ho\u1EB7c t\u1EA3i file t\xE0i li\u1EC7u gi\xE1o \xE1n (.docx, .txt)"), docFileName && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200" }, "\u0110\xE3 t\u1EA3i: ", docFileName)), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => document.getElementById("file-game-input").click(),
      className: "border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "file-game-input",
        type: "file",
        accept: ".docx,.txt",
        className: "hidden",
        onChange: (e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F4C1}"),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-slate-700" }, "B\u1EA5m \u0111\u1EC3 ch\u1ECDn file gi\xE1o \xE1n (.docx, .txt)"),
    /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "AI s\u1EBD t\u1EF1 \u0111\u1ED9ng \u0111\u1ECDc n\u1ED9i dung v\xE0 tr\xEDch xu\u1EA5t ki\u1EBFn th\u1EE9c tr\u1ECDng t\xE2m \u0111\u1EC3 t\u1EA1o tr\xF2 ch\u01A1i.")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end pt-4 border-t border-slate-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (!topic.trim() && !docText.trim()) {
          setTopic("\xD4n t\u1EADp ki\u1EBFn th\u1EE9c t\u1ED5ng h\u1EE3p");
        }
        setStep(1);
      },
      className: "px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", null, "Ti\u1EBFp t\u1EE5c: ch\u1ECDn lo\u1EA1i game & giao di\u1EC7n"),
    /* @__PURE__ */ React.createElement("span", null, "\u2192")
  ))), step === 1 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-800 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3AE}"), " B\u01B0\u1EDBc 2: Lo\u1EA1i game & Giao di\u1EC7n"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "Ch\u1ECDn 1 ho\u1EB7c nhi\u1EC1u d\u1EA1ng game y\xEAu th\xEDch. N\u1EBFu kh\xF4ng ch\u1ECDn, AI s\u1EBD t\u1EF1 \u0111\u1ED9ng ch\u1ECDn d\u1EA1ng ph\xF9 h\u1EE3p nh\u1EA5t.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(0),
      className: "text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl"
    },
    "\u2190 Quay l\u1EA1i t\xE0i li\u1EC7u"
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide" }, "1. Ch\u1ECDn c\xE1c d\u1EA1ng tr\xF2 ch\u01A1i mu\u1ED1n t\u1EA1o:"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" }, GAME_TYPES.map((gt) => {
    const isSel = selectedTypes.includes(gt.id);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: gt.id,
        onClick: () => {
          setSelectedTypes(
            (prev) => isSel ? prev.filter((t) => t !== gt.id) : [...prev, gt.id]
          );
        },
        className: `p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${isSel ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm" : "bg-slate-50/60 border-slate-200 hover:border-purple-300 text-slate-700"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, gt.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-xs" }, gt.label), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-0.5" }, gt.desc))),
      /* @__PURE__ */ React.createElement("div", { className: `w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${isSel ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-300 text-transparent"}` }, "\u2713")
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pt-5 border-t border-slate-100" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase" }, "S\u1ED1 c\xE2u h\u1ECFi"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: questionCount,
      onChange: (e) => setQuestionCount(Number(e.target.value)),
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: 5 }, "5 c\xE2u (Nhanh)"),
    /* @__PURE__ */ React.createElement("option", { value: 8 }, "8 c\xE2u (V\u1EEBa ph\u1EA3i)"),
    /* @__PURE__ */ React.createElement("option", { value: 10 }, "10 c\xE2u (Ti\xEAu chu\u1EA9n)"),
    /* @__PURE__ */ React.createElement("option", { value: 15 }, "15 c\xE2u (Chi ti\u1EBFt)"),
    /* @__PURE__ */ React.createElement("option", { value: 20 }, "20 c\xE2u (To\xE0n di\u1EC7n)")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase" }, "M\xE0u s\u1EAFc giao di\u1EC7n"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: themeColor,
      onChange: (e) => setThemeColor(e.target.value),
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
    },
    THEME_COLORS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.label))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase" }, "Ph\xF4ng ch\u1EEF"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: fontFamily,
      onChange: (e) => setFontFamily(e.target.value),
      className: "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
    },
    FONTS.map((f) => /* @__PURE__ */ React.createElement("option", { key: f, value: f }, f))
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 mb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase" }, "T\xEAn tr\xF2 ch\u01A1i (T\xF9y ch\u1ECDn)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: gameTitle,
      onChange: (e) => setGameTitle(e.target.value),
      placeholder: "VD: \u0110\u1EA5u Tr\u01B0\u1EDDng Tri Th\u1EE9c \u2022 V\u01B0\u1EE3t Ch\u01B0\u1EDBng Ng\u1EA1i V\u1EADt...",
      className: "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase" }, "Y\xEAu c\u1EA7u th\xEAm cho AI (T\xF9y ch\u1ECDn)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: customPrompt,
      onChange: (e) => setCustomPrompt(e.target.value),
      placeholder: "VD: C\xF3 \u0111\u1ED3ng h\u1ED3 \u0111\u1EBFm ng\u01B0\u1EE3c 15 gi\xE2y m\u1ED7i c\xE2u, nh\u1EA1c n\u1EC1n vui tai, giao di\u1EC7n ch\u1EE7 \u0111\u1EC1 \u0111\u1EA1i d\u01B0\u01A1ng...",
      className: "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
    }
  )), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: iconsEnabled,
      onChange: (e) => setIconsEnabled(e.target.checked),
      className: "w-4 h-4 accent-purple-600 rounded"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700" }, "Minh h\u1ECDa c\xE2u h\u1ECFi b\u1EB1ng nhi\u1EC1u emoji sinh \u0111\u1ED9ng"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pt-4 border-t border-slate-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(0),
      className: "px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-sm"
    },
    "\u2190 Quay l\u1EA1i t\xE0i li\u1EC7u"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleGenerateGame(false),
      className: "px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u2728 K\xCDCH HO\u1EA0T T\u1EA0O GAME AI")
  ))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-slate-900 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3AE}"), " ", gameTitle || topic || "Mini-game H\u1ECDc T\u1EADp T\u01B0\u01A1ng T\xE1c"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold" }, "HTML5 Standalone")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Ch\u01A1i tr\u1EF1c ti\u1EBFp b\xEAn d\u01B0\u1EDBi, m\u1EDF to\xE0n m\xE0n h\xECnh khi d\u1EA1y tr\xEAn l\u1EDBp ho\u1EB7c xu\u1EA5t g\xF3i SCORM cho LMS.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleFullscreen,
      className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u26F6"),
    " To\xE0n m\xE0n h\xECnh"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleDownloadHtml,
      className: "px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4E5}"),
    " T\u1EA3i HTML (Offline)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleDownloadScorm,
      className: "px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4E6}"),
    " T\u1EA3i SCORM (LMS)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveToMHEdu,
      className: "px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4BE}"),
    " ",
    isSaved ? "\u2713 \u0110\xE3 l\u01B0u!" : "L\u01B0u v\xE0o Game t\u1EF1 t\u1EA1o"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleCopyCode,
      className: "px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl",
      title: "Sao ch\xE9p to\xE0n b\u1ED9 m\xE3 HTML"
    },
    copiedCode ? "\u2713 \u0110\xE3 copy" : "Copy m\xE3"
  ))), /* @__PURE__ */ React.createElement("div", { className: "my-5 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900", style: { height: "560px" } }, /* @__PURE__ */ React.createElement(
    "iframe",
    {
      ref: iframeRef,
      srcDoc: gameHtml,
      className: "w-full h-full border-none bg-white",
      sandbox: "allow-scripts allow-same-origin allow-modals",
      title: "MHEdu Game Preview"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 pt-5 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u2728"), /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-slate-800 uppercase tracking-wide" }, "Tinh ch\u1EC9nh tr\xF2 ch\u01A1i b\u1EB1ng AI (In-place Adjustment)")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: adjustPrompt,
      onChange: (e) => setAdjustPrompt(e.target.value),
      placeholder: "Nh\u1EADp y\xEAu c\u1EA7u s\u1EEDa game (VD: \u0110\u1ED5i n\u1EC1n sang m\xE0u xanh mint, t\u0103ng c\u1EE1 ch\u1EEF c\xE2u h\u1ECFi, th\xEAm \xE2m thanh vui tai khi th\u1EAFng)...",
      className: "flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-purple-400",
      onKeyDown: (e) => e.key === "Enter" && handleGenerateGame(true)
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleGenerateGame(true),
      disabled: adjusting || !adjustPrompt.trim(),
      className: "px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
    },
    adjusting ? "\u0110ang s\u1EEDa..." : "S\u1EEDa game"
  ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 pt-4 border-t border-slate-100 flex justify-between items-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setStep(1),
      className: "text-xs font-bold text-slate-500 hover:text-slate-800"
    },
    "\u2190 \u0110i\u1EC1u ch\u1EC9nh c\u1EA5u h\xECnh game"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setStep(0);
        setGameHtml("");
        setTopic("");
        setDocText("");
      },
      className: "text-xs font-bold text-purple-700 hover:underline"
    },
    "\u{1F504} T\u1EA1o tr\xF2 ch\u01A1i m\u1EDBi t\u1EEB \u0111\u1EA7u"
  )))), loading && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce" }, "\u{1F579}\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "AI \u0110ang T\u1EA1o Mini-Game"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-6 font-medium" }, progressMsg), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300",
      style: { width: `${progress}%` }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-xs text-slate-400 font-bold" }, /* @__PURE__ */ React.createElement("span", null, "\u0110ang bi\xEAn so\u1EA1n code HTML5..."), /* @__PURE__ */ React.createElement("span", null, progress, "%")))), /* @__PURE__ */ React.createElement("footer", { className: "text-center text-slate-400 text-xs py-10 mt-12 border-t border-slate-200/60" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-600" }, "\u2728 MHEdu AI \u2022 N\u1EC1n t\u1EA3ng T\u1EA1o Tr\xF2 ch\u01A1i D\u1EA1y h\u1ECDc & Chuy\u1EC3n \u0111\u1ED5i s\u1ED1 Gi\xE1o d\u1EE5c"), /* @__PURE__ */ React.createElement("p", { className: "mt-1" }, "H\u1EC7 th\u1ED1ng ph\xE1t tri\u1EC3n b\u1EDFi NMH Th\u1EA7y Nguy\u1EC5n M\u1EA1nh H\xF9ng \u2022 Xu\u1EA5t SCORM 1.2 & Ch\u1EA1y Offline 100%")));
}
var rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
export {
  App
};
