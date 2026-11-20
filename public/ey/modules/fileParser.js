// ============================================================================
// Advanced File Parser for iMath & Azota formats (.docx, .xlsx, .txt)
// Extracts text, options, answers, OMML math formulas, MathType OLE TeX, embedded images & diagrams!
// Compliant with GDPT 2018 / iMath THPT 2025 Standard (Phần I, Phần II, Phần III)
// Designed by Thầy Nguyễn Mạnh Hùng - MHEdu & PomyAI
// ============================================================================

(function(global) {
  'use strict';

  /**
   * Trích xuất chuỗi LaTeX ẩn trong đối tượng nhị phân MathType OLE ("TeX Input Language")
   */
  function extractTeXFromBinary(bytes) {
    if (!bytes || bytes.length < 20) return '';
    const marker = 'TeX Input Language';
    let pos = -1;
    const len = bytes.length;
    for (let i = 0; i < len - marker.length; i++) {
      let match = true;
      for (let j = 0; j < marker.length; j++) {
        if (bytes[i + j] !== marker.charCodeAt(j)) {
          match = false;
          break;
        }
      }
      if (match) {
        pos = i + marker.length;
        break;
      }
    }
    if (pos !== -1) {
      while (pos < len && bytes[pos] === 0) pos++;
      let end = pos;
      while (end < len && bytes[end] !== 0) end++;
      if (end > pos) {
        let str = '';
        for (let k = pos; k < end; k++) str += String.fromCharCode(bytes[k]);
        str = str.replace(/^\$+/, '').replace(/\$+$/, '').trim();
        if (str) return '$' + cleanInnerLatex(str) + '$';
      }
    }
    return '';
  }

  /**
   * Bảng ký tự Toán học Unicode sang LaTeX chuẩn KaTeX
   */
  const UNICODE_MATH_MAP = {
    '\u2212': '-',
    '\u2013': '-',
    '\u2014': '-',
    '\u00B7': '\\cdot ',
    '\u22C5': '\\cdot ',
    '\u00D7': '\\times ',
    '\u00F7': '\\div ',
    '\u00B1': '\\pm ',
    '\u2213': '\\mp ',
    '\u2264': '\\le ',
    '\u2265': '\\ge ',
    '\u2260': '\\ne ',
    '\u2248': '\\approx ',
    '\u2261': '\\equiv ',
    '\u2208': '\\in ',
    '\u2209': '\\notin ',
    '\u2282': '\\subset ',
    '\u2283': '\\supset ',
    '\u2286': '\\subseteq ',
    '\u2287': '\\supseteq ',
    '\u222A': '\\cup ',
    '\u2229': '\\cap ',
    '\u2205': '\\varnothing ',
    '\u221E': '\\infty ',
    '\u21D2': '\\Rightarrow ',
    '\u21D4': '\\Leftrightarrow ',
    '\u2192': '\\to ',
    '\u2190': '\\leftarrow ',
    '\u2194': '\\leftrightarrow ',
    '\u2200': '\\forall ',
    '\u2203': '\\exists ',
    '\u2202': '\\partial ',
    '\u2207': '\\nabla ',
    '\u2220': '\\angle ',
    '\u22A5': '\\perp ',
    '\u2225': '\\parallel ',
    '\u25B3': '\\triangle ',
    '\u03B1': '\\alpha ',
    '\u03B2': '\\beta ',
    '\u03B3': '\\gamma ',
    '\u03B4': '\\delta ',
    '\u03B5': '\\varepsilon ',
    '\u03B8': '\\theta ',
    '\u03BB': '\\lambda ',
    '\u03BC': '\\mu ',
    '\u03C0': '\\pi ',
    '\u03C1': '\\rho ',
    '\u03C3': '\\sigma ',
    '\u03C6': '\\varphi ',
    '\u03D5': '\\phi ',
    '\u03C9': '\\omega ',
    '\u0394': '\\Delta ',
    '\u03A9': '\\Omega ',
    '\u03A3': '\\Sigma ',
    '\u03A0': '\\Pi ',
    '\u2115': '\\mathbb{N}',
    '\u2124': '\\mathbb{Z}',
    '\u211A': '\\mathbb{Q}',
    '\u211D': '\\mathbb{R}',
    '\u2102': '\\mathbb{C}'
  };

  function replaceUnicodeMath(str) {
    if (!str) return '';
    let t = str.replace(/[\u2218\u00B0]/g, '^\\circ ');
    t = t.replace(/([A-Za-z]{2,})\u20D7/g, '\\overrightarrow{$1}');
    t = t.replace(/([A-Za-z0-9])\u20D7/g, '\\vec{$1}');
    let out = '';
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      out += UNICODE_MATH_MAP[ch] !== undefined ? UNICODE_MATH_MAP[ch] : ch;
    }
    return out;
  }

  function cleanInnerLatex(inner) {
    if (!inner) return '';
    return replaceUnicodeMath(inner)
      .replace(/&lt;/g, ' \\lt ')
      .replace(/&gt;/g, ' \\gt ')
      .replace(/\^\{\s*\^\\circ\s*\}/g, '^\\circ ')
      .replace(/\^\{\s*\\circ\s*\}/g, '^\\circ ')
      .replace(/\^\{\s*[\u2218\u00B0]\s*\}/g, '^\\circ ')
      .replace(/\^\\circ\s*\^\\circ/g, '^\\circ ')
      .replace(/(?<!\\)(?:^|(?<=[^a-zA-Z]))(arcsin|arccos|arctan|sin|cos|tan|cot|ln|log|lim|min|max)(?![a-zA-Z])/g, '\\$1 ')
      .replace(/(?<!\\)(arcsin|arccos|arctan|sin|cos|tan|cot|ln|log|lim)(?=[A-DF-Zxy\d\b])/g, '\\$1 ')
      .replace(/\\\\(arcsin|arccos|arctan|sin|cos|tan|cot|ln|log|lim|min|max)\b/g, '\\$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanMathText(str) {
    if (!str || typeof str !== 'string') return str || '';
    let text = str.trim();
    text = text.replace(/(\d+)\s*[\u2218\u00B0]/g, '$1^\\circ ');
    text = text.replace(/\^\{\s*[\u2218\u00B0]\s*\}/g, '^\\circ ');
    text = text.replace(/\^[\u2218\u00B0]/g, '^\\circ ');

    if (!text.includes('$')) {
      if (/(\\[a-zA-Z]+|\^|\_)/.test(text)) {
        return '$' + cleanInnerLatex(text) + '$';
      }
      return text;
    }

    const dollars = text.match(/\$/g) || [];
    if (dollars.length % 2 !== 0) {
      if (text.endsWith('$') && !text.startsWith('$')) {
        text = '$' + text;
      } else if (text.startsWith('$') && !text.endsWith('$')) {
        text = text + '$';
      }
    }

    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (m, inner) => '$$' + cleanInnerLatex(inner) + '$$');
    text = text.replace(/(?<!\$)\$([^\$\n]+)\$(?!\$)/g, (m, inner) => '$' + cleanInnerLatex(inner) + '$');
    return text.replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Chuyển đổi cây OMML (Office Math Markup Language) sang LaTeX chuẩn KaTeX
   * Đồng bộ 100% với bộ xử lý chuẩn trong iMath (public/assets/index.js)
   */
  function ommlToLatexInner(node) {
    if (!node) return '';
    if (node.nodeType === 3) return replaceUnicodeMath(node.textContent || '');
    if (node.nodeType !== 1) return '';

    const local = (node.localName || node.nodeName || '').replace(/^[a-zA-Z0-9_-]+:/, '').toLowerCase();

    const getChildByTag = (parent, tagName) => {
      if (!parent || !parent.childNodes) return null;
      for (let i = 0; i < parent.childNodes.length; i++) {
        const c = parent.childNodes[i];
        if (c.nodeType === 1) {
          const cl = (c.localName || c.nodeName || '').replace(/^[a-zA-Z0-9_-]+:/, '').toLowerCase();
          if (cl === tagName) return c;
        }
      }
      return null;
    };

    const getChildrenByTag = (parent, tagName) => {
      const res = [];
      if (!parent || !parent.childNodes) return res;
      for (let i = 0; i < parent.childNodes.length; i++) {
        const c = parent.childNodes[i];
        if (c.nodeType === 1) {
          const cl = (c.localName || c.nodeName || '').replace(/^[a-zA-Z0-9_-]+:/, '').toLowerCase();
          if (cl === tagName) res.push(c);
        }
      }
      return res;
    };

    const getAttrVal = (el, attrName) => {
      if (!el || !el.getAttribute) return '';
      return el.getAttribute('m:' + attrName) || el.getAttribute(attrName) || '';
    };

    switch (local) {
      case 't': {
        return replaceUnicodeMath(node.textContent || '');
      }
      case 'r': {
        let rText = '';
        for (let i = 0; i < node.childNodes.length; i++) {
          rText += ommlToLatexInner(node.childNodes[i]);
        }
        return rText;
      }
      case 'f': {
        const numNode = getChildByTag(node, 'num');
        const denNode = getChildByTag(node, 'den');
        return `\\frac{${ommlToLatexInner(numNode).trim()}}{${ommlToLatexInner(denNode).trim()}}`;
      }
      case 'rad': {
        const degNode = getChildByTag(node, 'deg');
        const eNode = getChildByTag(node, 'e');
        const deg = ommlToLatexInner(degNode).trim();
        const base = ommlToLatexInner(eNode).trim();
        return deg ? `\\sqrt[${deg}]{${base}}` : `\\sqrt{${base}}`;
      }
      case 'ssup': {
        const eNode = getChildByTag(node, 'e');
        const supNode = getChildByTag(node, 'sup');
        const base = ommlToLatexInner(eNode).trim();
        const supText = ommlToLatexInner(supNode).trim();
        if (supText === '^\\circ' || supText === '\\circ' || supText === '∘' || supText === '°') {
          return `${base}^\\circ `;
        }
        return `${base}^{${supText}}`;
      }
      case 'ssub': {
        const eNode = getChildByTag(node, 'e');
        const subNode = getChildByTag(node, 'sub');
        return `${ommlToLatexInner(eNode).trim()}_{${ommlToLatexInner(subNode).trim()}}`;
      }
      case 'ssubsup': {
        const eNode = getChildByTag(node, 'e');
        const subNode = getChildByTag(node, 'sub');
        const supNode = getChildByTag(node, 'sup');
        const supText = ommlToLatexInner(supNode).trim();
        const cleanSup = (supText === '^\\circ' || supText === '\\circ') ? '\\circ' : supText;
        return `${ommlToLatexInner(eNode).trim()}_{${ommlToLatexInner(subNode).trim()}}^{${cleanSup}}`;
      }
      case 'd': {
        const dPr = getChildByTag(node, 'dpr');
        let begChr = '(';
        let endChr = ')';
        if (dPr) {
          const bNode = getChildByTag(dPr, 'begchr');
          const eNodeChr = getChildByTag(dPr, 'endchr');
          if (bNode) {
            const v = getAttrVal(bNode, 'val');
            if (bNode.hasAttribute && (bNode.hasAttribute('m:val') || bNode.hasAttribute('val'))) begChr = v;
          }
          if (eNodeChr) {
            const v = getAttrVal(eNodeChr, 'val');
            if (eNodeChr.hasAttribute && (eNodeChr.hasAttribute('m:val') || eNodeChr.hasAttribute('val'))) endChr = v;
          }
        }
        const eNodes = getChildrenByTag(node, 'e');
        const inner = eNodes.map(eN => ommlToLatexInner(eN).trim()).join('; ');
        const left = begChr === '{' ? '\\left\\{' : (begChr === '[' ? '\\left[' : (begChr === '|' ? '\\left|' : (begChr === '' ? '\\left.' : '\\left(')));
        const right = endChr === '}' ? '\\right\\}' : (endChr === ']' ? '\\right]' : (endChr === '|' ? '\\right|' : (endChr === '' ? '\\right.' : '\\right)')));
        return `${left}${inner}${right}`;
      }
      case 'eqarr': {
        const eNodes = getChildrenByTag(node, 'e');
        const rows = eNodes.map(eN => ommlToLatexInner(eN).trim());
        return `\\begin{aligned} ${rows.join(' \\\\ ')} \\end{aligned}`;
      }
      case 'acc': {
        const accPr = getChildByTag(node, 'accpr');
        let chrVal = '\u20D7';
        if (accPr) {
          const chEl = getChildByTag(accPr, 'chr');
          if (chEl) chrVal = getAttrVal(chEl, 'val') || '\u20D7';
        }
        const e = ommlToLatexInner(getChildByTag(node, 'e')).trim();
        if (chrVal === '¯' || chrVal === '\u0304' || chrVal === '_') return `\\overline{${e}}`;
        if (chrVal === '^' || chrVal === '\u0302' || chrVal === 'ˆ') return `\\widehat{${e}}`;
        if (/[\u20D7\u20D6\u20E1\u20D1\u2192\u27F6\u2190\u2194→⟶←↔]/.test(chrVal) || !chrVal) {
          return e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`;
        }
        return e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`;
      }
      case 'groupchr': {
        const gPr = getChildByTag(node, 'groupchrpr');
        let chrVal = '\u23DF';
        let posVal = 'bot';
        if (gPr) {
          const chEl = getChildByTag(gPr, 'chr');
          const posEl = getChildByTag(gPr, 'pos');
          if (chEl) chrVal = getAttrVal(chEl, 'val') || chrVal;
          if (posEl) posVal = getAttrVal(posEl, 'val') || posVal;
        }
        const e = ommlToLatexInner(getChildByTag(node, 'e')).trim();
        if (/[\u2192\u27F6\u20D7\u20D1→⟶]/.test(chrVal)) {
          return e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`;
        }
        if (/[\u2190\u27F5\u20D6←⟵]/.test(chrVal)) return `\\overleftarrow{${e}}`;
        if (/[\u2194\u20E1↔]/.test(chrVal)) return `\\overleftrightarrow{${e}}`;
        if (chrVal === '\u23DE' || chrVal === '⏞') return `\\overbrace{${e}}`;
        if (chrVal === '\u23DF' || chrVal === '⏟') return `\\underbrace{${e}}`;
        if (chrVal === '¯' || chrVal === '\u0304' || chrVal === '_') {
          return posVal === 'bot' ? `\\underline{${e}}` : `\\overline{${e}}`;
        }
        return posVal === 'top' ? (e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`) : e;
      }
      case 'limupp': {
        const e = ommlToLatexInner(getChildByTag(node, 'e')).trim();
        const lim = ommlToLatexInner(getChildByTag(node, 'lim')).trim();
        if (/^(?:\\to|\\rightarrow|\\leftarrow|\\leftrightarrow|→|⟶|←|↔|\u20D7)$/.test(lim)) {
          return e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`;
        }
        return `\\overset{${lim}}{${e}}`;
      }
      case 'bar': {
        const e = ommlToLatexInner(getChildByTag(node, 'e')).trim();
        return `\\overline{${e}}`;
      }
      case 'func': {
        const fNameNode = getChildByTag(node, 'fname');
        const eNode = getChildByTag(node, 'e');
        let fName = ommlToLatexInner(fNameNode).trim();
        if (fName && !fName.startsWith('\\') && /^(sin|cos|tan|cot|arcsin|arccos|arctan|ln|log|lim|min|max)$/i.test(fName)) {
          fName = '\\' + fName;
        }
        return `${fName} ${ommlToLatexInner(eNode).trim()}`;
      }
      case 'limlow': {
        const eNode = getChildByTag(node, 'e');
        const limNode = getChildByTag(node, 'lim');
        return `\\lim_{${ommlToLatexInner(limNode).trim()}} {${ommlToLatexInner(eNode).trim()}}`;
      }
      case 'nary': {
        const naryPr = getChildByTag(node, 'narypr');
        let op = '\\int';
        if (naryPr) {
          const chrNode = getChildByTag(naryPr, 'chr');
          const chr = chrNode ? getAttrVal(chrNode, 'val') : '';
          if (chr.includes('∑')) op = '\\sum';
          else if (chr.includes('∏')) op = '\\prod';
          else if (chr.includes('⋃')) op = '\\bigcup';
          else if (chr.includes('⋂')) op = '\\bigcap';
        }
        const sub = ommlToLatexInner(getChildByTag(node, 'sub')).trim();
        const sup = ommlToLatexInner(getChildByTag(node, 'sup')).trim();
        const e = ommlToLatexInner(getChildByTag(node, 'e')).trim();
        return `${op}${sub ? `_{${sub}}` : ''}${sup ? `^{${sup}}` : ''} {${e}}`;
      }
      case 'm': {
        const mrNodes = getChildrenByTag(node, 'mr');
        const rows = mrNodes.map(mr => {
          const cells = getChildrenByTag(mr, 'e');
          return cells.map(c => ommlToLatexInner(c).trim()).join(' & ');
        });
        return `\\begin{matrix} ${rows.join(' \\\\ ')} \\end{matrix}`;
      }
      default: {
        let out = '';
        for (let i = 0; i < node.childNodes.length; i++) {
          out += ommlToLatexInner(node.childNodes[i]);
        }
        return out;
      }
    }
  }

  function ommlToLatex(node) {
    const inner = cleanInnerLatex(ommlToLatexInner(node));
    return inner ? ` $${inner}$ ` : '';
  }

  /**
   * Mask các vùng công thức Toán $...$ để không bị regex tách phương án A. B. C. D. hoặc dấu chấm cắt nhầm
   */
  function maskMathRegions(str) {
    const tokens = [];
    const masked = (str || '').replace(/\$\$[\s\S]*?\$\$|\$[^\$\n]+\$/g, (m) => {
      const idx = tokens.length;
      tokens.push(m);
      // Giữ nguyên chính xác độ dài chuỗi bằng ký tự placeholder an toàn
      const ph = `__M${idx}__`;
      return ph.length <= m.length ? ph.padEnd(m.length, '#') : '#'.repeat(m.length);
    });
    return {
      masked,
      tokens,
      restore(s) {
        return (s || '').replace(/__M(\d+)__#*/g, (m, i) => tokens[parseInt(i, 10)] || m);
      }
    };
  }

  /**
   * Làm sạch text phương án trắc nghiệm (bỏ dấu * đánh dấu đáp án và dấu chấm câu thừa ở cuối)
   */
  function cleanOptionText(raw) {
    if (!raw) return '';
    let s = raw.trim();
    // Bỏ dấu * hoặc ** ở đầu nếu có (VD: "* $\tan 150^\circ = ...$" hoặc "**AC**")
    s = s.replace(/^\*{1,2}\s*/, '').trim();
    // Bỏ dấu chấm/chấm phẩy thừa ở cuối phương án (nhưng ngoài vùng $...$)
    s = s.replace(/[\.\;]+\s*$/, '').trim();
    // Nếu còn dấu * hoặc ** ở cuối
    s = s.replace(/\s*\*{1,2}$/, '').trim();
    return cleanMathText(s);
  }

  /**
   * Suy luận đáp án đúng cho câu hỏi trắc nghiệm (Phần I) từ lời giải hoặc bảng đáp án
   */
  function inferMcCorrectAnswer(cleanStemWithOpts, explanation, options, qNum, answerKeyMap) {
    const normExpr = (s) => (s || '')
      .replace(/\$+/g, '')
      .replace(/\\vec\s*\{([^}]*)\}/g, '$1')
      .replace(/\\overrightarrow\s*\{([^}]*)\}/g, '$1')
      .replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '$1$2')
      .replace(/\\cdot/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/[\s\.\;\,\:\u2212]/g, (ch) => (ch === '\u2212' ? '-' : ''))
      .toLowerCase();

    const stripCaveats = (s) => (s || '')
      .replace(/\((?:Lưu\s*ý|Chú\s*ý|Ghi\s*chú|Không\s*khớp)[^)]*\)/gi, ' ');

    const extractExplicitLetter = (text) => {
      if (!text) return '';
      let found = '';
      const p1 = /(?:Chọn(?:\s*đáp\s*án)?|Đáp\s*án\s*(?:đúng)?\s*(?:phải\s*)?(?:là)?|Đ\/A|Key)\s*[\.:\-–]*\s*\*{0,2}\s*([A-D])\b/gi;
      for (const m of text.matchAll(p1)) {
        found = m[1].toUpperCase();
      }
      if (found) return found;

      const p2 = /(?:khẳng\s*định|mệnh\s*đề|phương\s*án|câu|ý)\s*\*{0,2}\s*([A-D])\s*\*{0,2}\s*(?:đúng|sai|là\s*(?:đúng|sai)|chính\s*xác)\b/gi;
      for (const m of text.matchAll(p2)) {
        found = m[1].toUpperCase();
      }
      return found;
    };

    const expNoParens = stripCaveats(explanation);
    const explicitFromExp = extractExplicitLetter(expNoParens);
    if (explicitFromExp) return explicitFromExp;

    const explicitFromStem = extractExplicitLetter(cleanStemWithOpts);
    if (explicitFromStem) return explicitFromStem;

    if (answerKeyMap && answerKeyMap.part1 && answerKeyMap.part1[qNum]) {
      return answerKeyMap.part1[qNum];
    }

    // Đối chiếu nội dung kết luận trong Lời giải với nội dung các phương án A, B, C, D
    if (expNoParens && Array.isArray(options) && options.length > 0) {
      const sentences = expNoParens
        .split(/[\n\.\;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      const lastSentence = sentences.length > 0 ? sentences[sentences.length - 1] : expNoParens;
      const nLast = normExpr(lastSentence);
      const nExp = normExpr(expNoParens);

      let bestKey = '';
      let bestScore = 0;
      let isTie = false;

      for (const opt of options) {
        if (!opt || /^Phương án [A-D]$/i.test(opt.text || '')) continue;
        const nOpt = normExpr(opt.text);
        if (!nOpt) continue;

        let score = 0;
        if (nLast.endsWith('=' + nOpt) || nLast.endsWith('là' + nOpt) || nLast === nOpt) {
          score = 100 + nOpt.length;
        } else if (nOpt.includes('=')) {
          const eqParts = nOpt.split('=');
          const lhs = eqParts[0];
          const rhs = eqParts[eqParts.length - 1];
          if (eqParts.length >= 3 && lhs && eqParts.slice(1).every(p => p && nExp.includes(lhs + '=' + p))) {
            score = 85 + nOpt.length;
          } else if (lhs && rhs && nLast.includes(lhs + '=') && nLast.endsWith('=' + rhs)) {
            score = 90 + nOpt.length;
          } else if (nLast.includes(nOpt)) {
            score = 80 + nOpt.length;
          } else if (nExp.includes(nOpt) && nOpt.length >= 3) {
            score = 40 + nOpt.length;
          }
        } else if (nLast.includes(nOpt) && (nOpt.length >= 2 || nLast.endsWith(nOpt))) {
          score = 50 + nOpt.length;
        } else if (nExp.includes(nOpt) && nOpt.length >= 3) {
          score = 10 + nOpt.length;
        }

        if (score > bestScore) {
          bestScore = score;
          bestKey = opt.key;
          isTie = false;
        } else if (score > 0 && score === bestScore) {
          isTie = true;
        }
      }

      if (bestKey && !isTie) return bestKey;
    }

    return 'A';
  }

  /**
   * Bộ phân tích văn bản đề thi chuẩn iMath / Azota (3 phần: Phần I, Phần II, Phần III)
   * Bóc tách theo từng khối Câu hỏi & tách Lời giải trước khi tách phương án
   */
  function parseQuestionsFromRawText(rawText, images, underlinedByQ) {
    if (!rawText || !rawText.trim()) return [];
    const cleanRaw = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Phân tích Bảng đáp án ở cuối đề thi (nếu có)
    const answerKeyMap = { part1: {}, part2: {}, part3: {} };
    const keyTableMatch = cleanRaw.match(/(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*CÁC\s*CÂU|HƯỚNG\s*DẪN\s*CHẤM)[\s\S]*$/i);
    if (keyTableMatch) {
      const keyText = keyTableMatch[0];
      for (const m of keyText.matchAll(/(?:Câu\s*)?(\d+)\s*[\.\:\-\/]?\s*([A-D])\b/gi)) {
        answerKeyMap.part1[parseInt(m[1], 10)] = m[2].toUpperCase();
      }
      for (const m of keyText.matchAll(/(?:Câu\s*)?(\d+)\s*[\.\:\-\/]?\s*([a-d])[\)\.\:\-]\s*([ĐS]|Đúng|Sai)/gi)) {
        const qNum = parseInt(m[1], 10);
        const sub = m[2].toLowerCase();
        const isTrue = /^đ/i.test(m[3]);
        if (!answerKeyMap.part2[qNum]) answerKeyMap.part2[qNum] = {};
        answerKeyMap.part2[qNum][sub] = isTrue;
      }
      for (const m of keyText.matchAll(/(?:Câu\s*)?(\d+)\s*[\.\:\-\=]\s*([−\-]?[0-9]+(?:[\.,][0-9]+)?)/gi)) {
        answerKeyMap.part3[parseInt(m[1], 10)] = m[2].replace('−', '-');
      }
    }

    // 2. Chia các PHẦN (PHẦN I, PHẦN II, PHẦN III) và loại bỏ hoàn toàn phần Header trước Câu 1!
    const sectionSplitRegex = /(?:^|\n)\s*(?:PHẦN|Phần)\s*(I{1,3}|[123]|Một|Hai|Ba)\b[\s.:\-–]*([^\n]*)/gi;
    const secMatches = [...cleanRaw.matchAll(sectionSplitRegex)];

    const sections = [];
    if (secMatches.length >= 1) {
      for (let i = 0; i < secMatches.length; i++) {
        const start = secMatches[i].index + secMatches[i][0].length;
        const end = (i + 1 < secMatches.length) ? secMatches[i + 1].index : cleanRaw.length;
        const numStr = secMatches[i][1].toUpperCase();
        const title = (secMatches[i][2] || '').toLowerCase();
        let type = 'mc';
        let partNum = 1;
        if (numStr === 'II' || numStr === '2' || numStr === 'HAI' || title.includes('đúng') || title.includes('sai')) {
          type = 'tf';
          partNum = 2;
        } else if (numStr === 'III' || numStr === '3' || numStr === 'BA' || title.includes('ngắn') || title.includes('tự luận')) {
          type = 'short';
          partNum = 3;
        }
        sections.push({
          type,
          partNum,
          content: cleanRaw.slice(start, end)
        });
      }
    } else {
      sections.push({ type: 'auto', partNum: 1, content: cleanRaw });
    }

    const questions = [];
    let globalId = 1;

    sections.forEach(sec => {
      // Cắt phần BẢNG ĐÁP ÁN ở cuối section nếu có
      const secContent = sec.content.replace(/(?:^|\n)\s*(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*CÁC\s*CÂU|HƯỚNG\s*DẪN\s*CHẤM)[\s\S]*$/i, '');

      // Tìm các mốc Câu 1., Câu 2:... (Bỏ qua toàn bộ tiêu đề đề thi phía trước Câu 1!)
      const qSplitRegex = /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Câu|Bài|Question|\[Câu\])\s*(\d+)\s*[\.:\)\-–](?:\*{1,2})?/gi;
      const qMatches = [...secContent.matchAll(qSplitRegex)];

      const rawBlocks = [];
      if (qMatches.length >= 1) {
        for (let i = 0; i < qMatches.length; i++) {
          const start = qMatches[i].index;
          const end = (i + 1 < qMatches.length) ? qMatches[i + 1].index : secContent.length;
          rawBlocks.push({
            num: parseInt(qMatches[i][1], 10),
            text: secContent.slice(start, end).trim()
          });
        }
      } else if (sec.type === 'auto') {
        // Trường hợp văn bản dán nhanh đánh số 1. 2. 3.
        const altSplitRegex = /(?:^|\n)\s*(\d+)\s*[\.:\)]/g;
        const altMatches = [...secContent.matchAll(altSplitRegex)];
        if (altMatches.length >= 2) {
          for (let i = 0; i < altMatches.length; i++) {
            const start = altMatches[i].index;
            const end = (i + 1 < altMatches.length) ? altMatches[i + 1].index : secContent.length;
            rawBlocks.push({
              num: parseInt(altMatches[i][1], 10),
              text: secContent.slice(start, end).trim()
            });
          }
        }
      }

      // Nếu AI tự sửa đề ngay sau đó với cùng số thứ tự Câu N liên tiếp, giữ bản mới nhất
      const blocks = [];
      for (let i = 0; i < rawBlocks.length; i++) {
        if (i + 1 < rawBlocks.length && rawBlocks[i].num === rawBlocks[i + 1].num) {
          continue;
        }
        blocks.push(rawBlocks[i]);
      }

      blocks.forEach(blockObj => {
        let block = blockObj.text;
        const qNum = blockObj.num;
        const uKey = `${sec.partNum}_${qNum}`;
        const underlinedLetters = (underlinedByQ && (underlinedByQ[uKey] || underlinedByQ[qNum])) || [];

        // 1. Trích xuất hình ảnh đính kèm [Hình X] hoặc ![...](...)
        let qImage = null;
        const mdImgMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (mdImgMatch) {
          qImage = mdImgMatch[2];
          block = block.replace(mdImgMatch[0], '');
        } else {
          const hMatch = block.match(/\[Hình\s*(\d+)\]/i);
          if (hMatch && Array.isArray(images)) {
            const hIdx = parseInt(hMatch[1], 10) - 1;
            if (hIdx >= 0 && hIdx < images.length) {
              qImage = images[hIdx];
              block = block.replace(hMatch[0], '');
            }
          }
        }

        // 2. Tách phần Lời giải / Hướng dẫn giải TRƯỚC KHI tách phương án!
        let explanation = '';
        const expMatch = block.match(/(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Lời\s*giải|Hướng\s*dẫn\s*giải|Hướng\s*dẫn|Giải\s*thích|HDG|HD)\s*(?:\*{1,2})?\s*[\.:\-–]*\s*(?:\*{1,2})?\s*([\s\S]*)$/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
          block = block.slice(0, expMatch.index).trim();
        }

        // Bỏ tiền tố "Câu X." ở đầu câu
        const cleanStemWithOpts = block.replace(/^\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Câu|Bài|Question|\[Câu\])\s*\d+\s*[\.:\)\-–]*(?:\*{1,2})?\s*/i, '').trim();

        // 3. Xác định loại câu hỏi (mc, tf, short)
        let qType = sec.type;
        if (qType === 'auto') {
          const maskedTest = maskMathRegions(cleanStemWithOpts).masked;
          if (/(?:^|[\n\t]|\s{2,})\s*(?:-\s+|•\s+)?(?:\*{1,2})?\s*[a-d]\s*\)/i.test(maskedTest)) {
            qType = 'tf';
          } else if (/(?:^|[\n\t]|\s{2,})\s*(?:-\s+|•\s+)?(?:\*{1,2})?\s*[A-D]\s*[\.\)]/.test(maskedTest)) {
            qType = 'mc';
          } else {
            qType = 'short';
          }
        }

        // ====================================================================
        // DẠNG 1: PHẦN II - CÂU TRẮC NGHIỆM ĐÚNG / SAI (a, b, c, d)
        // ====================================================================
        if (qType === 'tf') {
          const { masked } = maskMathRegions(cleanStemWithOpts);
          const subStmtRegex = /(?:^|[\n\r\t]|\s{2,}|(?<=[\.\;\)\]\}\#])\s+)(\*?\s*([a-d])\s*[\)\.]\s*\*?)(?=\s|$|\_)/gi;
          const subMatches = [];
          let sm;
          while ((sm = subStmtRegex.exec(masked)) !== null) {
            const letter = sm[2].toLowerCase();
            const marker = sm[1];
            const markerIndex = sm.index + sm[0].indexOf(marker);
            const expected = subMatches.length === 0 ? 'a' : String.fromCharCode(subMatches[subMatches.length - 1].letter.charCodeAt(0) + 1);
            if ((subMatches.length === 0 && letter === 'a') || (subMatches.length > 0 && (letter === expected || letter > subMatches[subMatches.length - 1].letter))) {
              subMatches.push({
                letter,
                marker,
                index: markerIndex,
                hasAsterisk: marker.includes('*')
              });
            }
          }

          // Phân tích đáp án Đúng/Sai từ Lời giải:
          // Hỗ trợ cả "a-đúng, b-sai, c-đúng, d-sai" và từng dòng "a) Đúng", "b) Sai"
          const explAnswers = {};
          if (explanation) {
            for (const em of explanation.matchAll(/(?:^|[\s,;(\n])([a-d])\s*(?:[\-\:\=\)\.]|\s+là\s+)\s*(đúng|sai|đ|s)\b/gi)) {
              const k = em[1].toLowerCase();
              if (explAnswers[k] === undefined) {
                explAnswers[k] = /^đ/i.test(em[2]);
              }
            }
          }

          let stemOnly = cleanStemWithOpts;
          const subItems = [];

          if (subMatches.length >= 2) {
            stemOnly = cleanStemWithOpts.slice(0, subMatches[0].index).trim();
            const hasAnyStarOrUnderline = subMatches.some(s => s.hasAsterisk || underlinedLetters.includes(s.letter.toUpperCase()));

            for (let i = 0; i < subMatches.length; i++) {
              const cur = subMatches[i];
              const next = subMatches[i + 1];
              const startPos = cur.index + cur.marker.length;
              const endPos = next ? next.index : cleanStemWithOpts.length;
              let stmtText = cleanOptionText(cleanStemWithOpts.slice(startPos, endPos));

              let isCorrect = false;
              const inlineMatch = stmtText.match(/(?:[\(\[\{])\s*(Đúng|Sai|Đ|S)\s*(?:[\)\]\}])\s*$/i);
              if (inlineMatch) {
                isCorrect = /^đ/i.test(inlineMatch[1]);
                stmtText = cleanOptionText(stmtText.slice(0, inlineMatch.index));
              } else if (cur.hasAsterisk || underlinedLetters.includes(cur.letter.toUpperCase())) {
                isCorrect = true;
              } else if (explAnswers[cur.letter] !== undefined) {
                isCorrect = explAnswers[cur.letter];
              } else if (answerKeyMap.part2[qNum] && answerKeyMap.part2[qNum][cur.letter] !== undefined) {
                isCorrect = answerKeyMap.part2[qNum][cur.letter];
              } else if (!hasAnyStarOrUnderline && i === 0) {
                isCorrect = false;
              }

              subItems.push({
                key: cur.letter,
                text: stmtText,
                isCorrect: !!isCorrect
              });
            }
          }

          // Đảm bảo đủ 4 ý a, b, c, d
          const existingKeys = new Set(subItems.map(s => s.key));
          ['a', 'b', 'c', 'd'].forEach(k => {
            if (!existingKeys.has(k)) {
              subItems.push({ key: k, text: `Ý ${k}`, isCorrect: !!explAnswers[k] });
            }
          });
          subItems.sort((a, b) => a.key.localeCompare(b.key));

          const options = subItems.slice(0, 4).map((s, idx) => ({
            key: String.fromCharCode(65 + idx),
            text: `Ý ${s.key}) ${s.text}`,
            image: null
          }));
          const firstCorrectIdx = subItems.findIndex(s => s.isCorrect);

          questions.push({
            id: 'q_' + (globalId++),
            number: qNum,
            part: 2,
            type: 'tf',
            content: cleanMathText(stemOnly),
            image: qImage,
            options,
            subItems,
            correctAnswer: firstCorrectIdx >= 0 ? String.fromCharCode(65 + firstCorrectIdx) : 'A',
            correctValue: '',
            explanation: cleanMathText(explanation),
            category: 'Toán học'
          });
          return;
        }

        // ====================================================================
        // DẠNG 2: PHẦN III - CÂU TRẢ LỜI NGẮN (SHORT ANSWER)
        // ====================================================================
        if (qType === 'short') {
          let cleanQ = cleanStemWithOpts;
          let ansVal = '';

          // Kiểm tra dòng Đáp án / Đáp số ngay trong thân câu hỏi
          const ansInBody = cleanQ.match(/(?:^|\n|;\s*|\.\s*)(?:Đáp\s*án|Đáp\s*số|ĐA|Key|Trả\s*lời)\s*[\:\.\=\-]?\s*([^\n]+)/i);
          if (ansInBody) {
            const rawAns = ansInBody[1].replace(/\$/g, '').trim();
            if (rawAns && !/làm\s*tròn/i.test(rawAns)) {
              ansVal = rawAns.replace(/[\.\;]+$/, '').trim();
              cleanQ = cleanQ.slice(0, ansInBody.index).trim();
            }
          }

          // Tìm "Đáp án: 3,0" hoặc "Vậy ... = ..." trong Lời giải (chuẩn iMath: "Đáp án: $3,0$")
          if (!ansVal && explanation) {
            const cleanExpl = explanation.replace(/\$/g, ' ').replace(/\u2212/g, '-');
            const explKeyMatch = cleanExpl.match(/(?:Đáp\s*án|Đáp\s*số|Kết\s*quả|Trả\s*lời)\s*(?:là)?\s*[\:\.\=\-]?\s*([\-]?[0-9]+(?:[\.,][0-9]+)?)/i);
            if (explKeyMatch) {
              ansVal = explKeyMatch[1].trim();
            } else {
              const eqMatches = [...cleanExpl.matchAll(/=\s*([\-]?[0-9]+(?:[\.,][0-9]+)?)\s*(?:[\.\;\n]|$)/g)];
              if (eqMatches.length > 0) {
                ansVal = eqMatches[eqMatches.length - 1][1].trim();
              }
            }
          }

          if (!ansVal && answerKeyMap.part3[qNum]) {
            ansVal = answerKeyMap.part3[qNum];
          }

          const finalVal = ansVal || '0';
          const numVal = parseFloat(finalVal.replace(',', '.'));
          const distractors = !isNaN(numVal)
            ? [
                String(numVal === 0 ? 1 : -numVal).replace('.', ','),
                String(Math.round((numVal + 1) * 100) / 100).replace('.', ','),
                String(Math.round((numVal * 2 + 0.5) * 100) / 100).replace('.', ',')
              ]
            : ['Không tồn tại', 'Vô nghiệm', '0'];

          questions.push({
            id: 'q_' + (globalId++),
            number: qNum,
            part: 3,
            type: 'short',
            content: cleanMathText(cleanQ),
            image: qImage,
            options: [
              { key: 'A', text: finalVal, image: null },
              { key: 'B', text: distractors[0], image: null },
              { key: 'C', text: distractors[1], image: null },
              { key: 'D', text: distractors[2], image: null }
            ],
            subItems: [],
            correctAnswer: 'A',
            correctValue: finalVal,
            explanation: cleanMathText(explanation),
            category: 'Toán học'
          });
          return;
        }

        // ====================================================================
        // DẠNG 3: PHẦN I - TRẮC NGHIỆM 4 PHƯƠNG ÁN (A, B, C, D)
        // ====================================================================
        const { masked } = maskMathRegions(cleanStemWithOpts);
        // Tìm vị trí A., B., C., D. ngoài vùng công thức $...$ (hỗ trợ cả Markdown **A.** hoặc - A.)
        const optMarkerRegex = /(?:^|[\n\r\t]|\s{2,}|(?<=[\.\;\)\]\}\#])\s+)((?:-\s+|•\s+)?(?:\*{1,2})?\s*([A-D])\s*[\.\)]\s*(?:\*{1,2})?)(?=\s|$|\_)/g;
        const optMatches = [];
        let om;
        while ((om = optMarkerRegex.exec(masked)) !== null) {
          const letter = om[2].toUpperCase();
          const marker = om[1];
          const markerIndex = om.index + om[0].indexOf(marker);
          const expected = optMatches.length === 0 ? 'A' : String.fromCharCode(optMatches[optMatches.length - 1].letter.charCodeAt(0) + 1);
          if ((optMatches.length === 0 && letter === 'A') || (optMatches.length > 0 && (letter === expected || letter > optMatches[optMatches.length - 1].letter))) {
            optMatches.push({
              letter,
              marker,
              index: markerIndex,
              hasAsterisk: marker.replace(/\*\*/g, '').includes('*')
            });
          }
        }

        let cleanQ = cleanStemWithOpts;
        const options = [];
        let correctAnswer = '';

        if (optMatches.length >= 2) {
          cleanQ = cleanStemWithOpts.slice(0, optMatches[0].index).trim();
          for (let i = 0; i < optMatches.length; i++) {
            const cur = optMatches[i];
            const next = optMatches[i + 1];
            const startPos = cur.index + cur.marker.length;
            const endPos = next ? next.index : cleanStemWithOpts.length;
            const rawSlice = cleanStemWithOpts.slice(startPos, endPos);
            const hasLeadingStar = /^\s*\*(?!\*)/.test(rawSlice);
            const optText = cleanOptionText(rawSlice);

            if (cur.hasAsterisk || hasLeadingStar || underlinedLetters.includes(cur.letter)) {
              correctAnswer = cur.letter;
            }

            options.push({
              key: cur.letter,
              text: optText,
              image: null
            });
          }
        }

        // Bổ sung đủ A, B, C, D nếu thiếu
        const existingOptKeys = new Set(options.map(o => o.key));
        ['A', 'B', 'C', 'D'].forEach(k => {
          if (!existingOptKeys.has(k)) {
            options.push({ key: k, text: `Phương án ${k}`, image: null });
          }
        });
        options.sort((a, b) => a.key.localeCompare(b.key));

        // Tìm đáp án đúng trong Lời giải, Bảng đáp án hoặc đối chiếu nội dung lời giải
        if (!correctAnswer) {
          correctAnswer = inferMcCorrectAnswer(cleanStemWithOpts, explanation, options, qNum, answerKeyMap);
        }

        questions.push({
          id: 'q_' + (globalId++),
          number: qNum,
          part: 1,
          type: 'mc',
          content: cleanMathText(cleanQ),
          image: qImage,
          options,
          subItems: [],
          correctAnswer,
          correctValue: '',
          explanation: cleanMathText(explanation),
          category: 'Toán học'
        });
      });
    });

    return questions;
  }

  const FileParser = {
    // 1. Phân tích file Word (.docx) chuẩn iMath / Azota (hỗ trợ cả OMML, MathType OLE TeX, Bảng, Ảnh)
    async parseDocx(fileOrBlob) {
      if (!global.JSZip) {
        throw new Error('Thư viện JSZip chưa được nạp. Vui lòng kiểm tra file script jszip.min.js.');
      }
      const zip = await global.JSZip.loadAsync(fileOrBlob);

      // 1.1. Trích xuất toàn bộ ảnh trong word/media/ (bỏ qua WMF/EMF nếu là ảnh rác công thức OLE đã có TeX)
      const mediaPaths = Object.keys(zip.files)
        .filter(p => p.startsWith('word/media/') && !zip.files[p].dir)
        .sort();

      const mediaDataUrls = {};
      await Promise.all(mediaPaths.map(async (p) => {
        const ext = (p.split('.').pop() || 'png').toLowerCase();
        if (ext === 'wmf' || ext === 'emf') return; // Tránh nạp ảnh vector WMF lỗi trên trình duyệt
        const mime = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          bmp: 'image/bmp',
          webp: 'image/webp',
          svg: 'image/svg+xml'
        }[ext] || 'image/png';
        const base64 = await zip.files[p].async('base64');
        mediaDataUrls[p] = `data:${mime};base64,${base64}`;
      }));

      // 1.2. Đọc word/_rels/document.xml.rels để map rId -> Ảnh hoặc đối tượng MathType OLE
      const relsFile = zip.file('word/_rels/document.xml.rels');
      const rIdToImgIdx = {};
      const imagesList = [];
      const oleMap = {};
      const oleTexMap = {};

      if (relsFile) {
        const relsXml = await relsFile.async('string');
        const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
        const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
        for (const rNode of relNodes) {
          const rId = rNode.getAttribute('Id') || '';
          const target = rNode.getAttribute('Target') || '';
          if (!rId || !target) continue;

          const normTarget = 'word/' + target.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
          if (mediaDataUrls[normTarget]) {
            imagesList.push(mediaDataUrls[normTarget]);
            rIdToImgIdx[rId] = imagesList.length; // 1-based index cho [Hình X]
          } else if (target.includes('embeddings/oleObject')) {
            oleMap[rId] = normTarget;
          }
        }
      }

      // Giải mã TeX Input Language từ các file nhị phân MathType OLE
      await Promise.all(Object.entries(oleMap).map(async ([rId, zipPath]) => {
        const f = zip.file(zipPath);
        if (f) {
          try {
            const bytes = await f.async('uint8array');
            const tex = extractTeXFromBinary(bytes);
            if (tex) oleTexMap[rId] = tex;
          } catch (e) {}
        }
      }));

      // 1.3. Đọc word/document.xml và duyệt theo thứ tự xuất hiện (bao gồm cả Bảng <w:tbl> và Đoạn văn <w:p>)
      const docXmlFile = zip.file('word/document.xml');
      if (!docXmlFile) {
        throw new Error('File Word không hợp lệ (thiếu word/document.xml)');
      }
      const docXml = await docXmlFile.async('string');
      const xmlDoc = new DOMParser().parseFromString(docXml, 'application/xml');

      const underlinedByQ = {};
      let currentPart = 1;
      let currentQNum = 0;
      const autoNumberedCounters = {};

      const extractParagraph = (pNode) => {
        let pText = '';
        const pUnderlined = [];
        const underlinedRanges = [];

        // Kiểm tra xem đoạn văn có đánh số tự động (Word Auto-Numbering <w:numPr>) ở cấp đầu (ilvl=0) không
        let hasAutoNumbering = false;
        let autoNumId = '';
        const pPr = (pNode.getElementsByTagName && (pNode.getElementsByTagName('w:pPr')[0] || pNode.getElementsByTagName('pPr')[0])) || null;
        if (pPr) {
          const numPr = pPr.getElementsByTagName('w:numPr')[0] || pPr.getElementsByTagName('numPr')[0];
          if (numPr) {
            const ilvlEl = numPr.getElementsByTagName('w:ilvl')[0] || numPr.getElementsByTagName('ilvl')[0];
            const numIdEl = numPr.getElementsByTagName('w:numId')[0] || numPr.getElementsByTagName('numId')[0];
            const ilvl = ilvlEl ? (ilvlEl.getAttribute('w:val') || ilvlEl.getAttribute('val') || '0') : '0';
            const numId = numIdEl ? (numIdEl.getAttribute('w:val') || numIdEl.getAttribute('val') || '') : '';
            if (ilvl === '0' && numId && numId !== '0') {
              hasAutoNumbering = true;
              autoNumId = numId;
            }
          }
        }

        const walk = (parent) => {
          if (!parent || !parent.childNodes) return;
          for (let i = 0; i < parent.childNodes.length; i++) {
            const nd = parent.childNodes[i];
            if (nd.nodeType !== 1) continue;
            const tag = (nd.localName || nd.nodeName || '').replace(/^[a-zA-Z0-9_-]+:/, '').toLowerCase();

            if (tag === 'omath' || tag === 'omathpara') {
              pText += ommlToLatex(nd);
            } else if (tag === 't') {
              pText += nd.textContent || '';
            } else if (tag === 'tab') {
              pText += '\t';
            } else if (tag === 'br' || tag === 'cr') {
              pText += '\n';
            } else if (tag === 'drawing' || tag === 'pict') {
              const blips = nd.getElementsByTagName ? Array.from(nd.getElementsByTagName('a:blip')).concat(Array.from(nd.getElementsByTagName('blip'))) : [];
              for (const b of blips) {
                const embedId = b.getAttribute('r:embed') || b.getAttribute('embed') || '';
                if (embedId && rIdToImgIdx[embedId]) {
                  pText += ` [Hình ${rIdToImgIdx[embedId]}] `;
                  break;
                }
              }
              const vImgs = nd.getElementsByTagName ? Array.from(nd.getElementsByTagName('v:imagedata')).concat(Array.from(nd.getElementsByTagName('imagedata'))) : [];
              for (const v of vImgs) {
                const rId = v.getAttribute('r:id') || v.getAttribute('id') || '';
                if (rId && rIdToImgIdx[rId]) {
                  pText += ` [Hình ${rIdToImgIdx[rId]}] `;
                  break;
                }
              }
            } else if (tag === 'object') {
              const oleObjs = nd.getElementsByTagName ? Array.from(nd.getElementsByTagName('o:OLEObject')).concat(Array.from(nd.getElementsByTagName('OLEObject'))) : [];
              if (oleObjs.length > 0) {
                const rId = oleObjs[0].getAttribute('r:id') || oleObjs[0].getAttribute('id') || '';
                if (rId && oleTexMap[rId]) {
                  pText += ` ${oleTexMap[rId]} `;
                }
              }
            } else if (tag === 'r') {
              // Kiểm tra gạch chân (underline) trên ký tự phương án A, B, C, D
              const rPr = (nd.getElementsByTagName && (nd.getElementsByTagName('w:rPr')[0] || nd.getElementsByTagName('rPr')[0])) || null;
              let hasU = false;
              if (rPr) {
                const uEl = rPr.getElementsByTagName('w:u')[0] || rPr.getElementsByTagName('u')[0];
                if (uEl) {
                  const uVal = uEl.getAttribute('w:val') || uEl.getAttribute('val') || 'single';
                  if (uVal !== 'none') hasU = true;
                }
              }
              const beforeLen = pText.length;
              walk(nd);
              if (hasU && pText.length > beforeLen) {
                underlinedRanges.push({ start: beforeLen, end: pText.length });
              }
            } else if (tag === 'hyperlink' || tag === 'smarttag' || tag === 'ins' || tag === 'sdt' || tag === 'sdtcontent') {
              walk(nd);
            }
          }
        };

        walk(pNode);
        if (underlinedRanges.length > 0) {
          const isIdxUnderlined = (idx) => underlinedRanges.some(r => idx >= r.start && idx < r.end);
          const optRe = /(?:^|[\t\n]|\s{2,})\s*\*?\s*([A-Da-d])\s*[\.\)]/g;
          let om;
          while ((om = optRe.exec(pText)) !== null) {
            const letterOffset = om.index + om[0].lastIndexOf(om[1]);
            if (isIdxUnderlined(letterOffset)) {
              pUnderlined.push(om[1].toUpperCase());
            }
          }
        }
        let trimmed = pText.trim();
        if (trimmed) {
          if (/^(?:PHẦN|Phần)\s*(?:II|2|Hai)\b/i.test(trimmed)) currentPart = 2;
          else if (/^(?:PHẦN|Phần)\s*(?:III|3|Ba)\b/i.test(trimmed)) currentPart = 3;
          else if (/^(?:PHẦN|Phần)\s*(?:I|1|Một)\b/i.test(trimmed)) currentPart = 1;

          // Nếu đoạn văn dùng Auto-Numbering của Word và chưa có chữ "Câu X" hay "A. / a)"
          if (hasAutoNumbering && !/^(?:Câu|Bài|Question|\[Câu\]|PHẦN|Phần|[A-Da-d][\.\)]|\*[A-Da-d][\.\)]|Lời\s*giải|Hướng\s*dẫn)/i.test(trimmed)) {
            const cKey = `${currentPart}_${autoNumId}`;
            autoNumberedCounters[cKey] = (autoNumberedCounters[cKey] || 0) + 1;
            trimmed = `Câu ${autoNumberedCounters[cKey]}. ${trimmed}`;
          }

          const qM = trimmed.match(/^(?:Câu|Bài|Question|\[Câu\])\s*(\d+)\b/i);
          if (qM) {
            currentQNum = parseInt(qM[1], 10);
          }
          if (currentQNum > 0 && pUnderlined.length > 0) {
            const key = `${currentPart}_${currentQNum}`;
            if (!underlinedByQ[key]) underlinedByQ[key] = [];
            underlinedByQ[key].push(...pUnderlined);
          }
        }
        return trimmed;
      };

      const body = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.getElementsByTagName('body')[0] || xmlDoc.documentElement;
      const lines = [];

      const walkBody = (container) => {
        if (!container || !container.childNodes) return;
        for (let i = 0; i < container.childNodes.length; i++) {
          const child = container.childNodes[i];
          if (child.nodeType !== 1) continue;
          const tag = (child.localName || child.nodeName || '').replace(/^[a-zA-Z0-9_-]+:/, '').toLowerCase();
          if (tag === 'p') {
            const line = extractParagraph(child);
            if (line) lines.push(line);
          } else if (tag === 'tbl') {
            const rows = child.getElementsByTagName ? Array.from(child.getElementsByTagName('w:tr')).concat(Array.from(child.getElementsByTagName('tr'))) : [];
            const seenRows = new Set();
            for (const tr of rows) {
              if (seenRows.has(tr)) continue;
              seenRows.add(tr);
              const cells = tr.childElements || Array.from(tr.childNodes).filter(n => n.nodeType === 1 && (n.localName === 'tc' || n.nodeName === 'w:tc'));
              const cellTexts = cells.map(tc => {
                const ps = Array.from(tc.childNodes).filter(n => n.nodeType === 1 && (n.localName === 'p' || n.nodeName === 'w:p'));
                return ps.map(p => extractParagraph(p)).filter(Boolean).join(' ');
              });
              if (cellTexts.some(Boolean)) {
                lines.push(cellTexts.join('\t'));
              }
            }
          } else if (tag === 'sdt' || tag === 'sdtcontent' || tag === 'body') {
            walkBody(child);
          }
        }
      };

      walkBody(body);
      const fullText = lines.join('\n');
      return parseQuestionsFromRawText(fullText, imagesList, underlinedByQ);
    },

    // 2. Phân tích văn bản thô hoặc CSV / text dán từ đề thi
    parseTextOrCsv(content) {
      if (!content || typeof content !== 'string') return [];
      return parseQuestionsFromRawText(content, [], {});
    },

    // 3. Cấu trúc hóa danh sách đoạn văn (tương thích ngược với các module gọi trực tiếp structureQuestions)
    structureQuestions(items) {
      if (!Array.isArray(items) || items.length === 0) return [];
      const images = [];
      const underlinedByQ = {};
      let currentPart = 1;
      let currentQNum = 0;

      const lines = items.map(item => {
        let t = (item.text || '').trim();
        if (/^(?:PHẦN|Phần)\s*(?:II|2|Hai)\b/i.test(t)) currentPart = 2;
        else if (/^(?:PHẦN|Phần)\s*(?:III|3|Ba)\b/i.test(t)) currentPart = 3;
        else if (/^(?:PHẦN|Phần)\s*(?:I|1|Một)\b/i.test(t)) currentPart = 1;

        const qM = t.match(/^(?:Câu|Bài|Question|\[Câu\])\s*(\d+)\b/i);
        if (qM) currentQNum = parseInt(qM[1], 10);

        if (item.image) {
          images.push(item.image);
          t += ` [Hình ${images.length}]`;
        }
        if (currentQNum > 0 && Array.isArray(item.underlinedLetters) && item.underlinedLetters.length > 0) {
          const key = `${currentPart}_${currentQNum}`;
          if (!underlinedByQ[key]) underlinedByQ[key] = [];
          underlinedByQ[key].push(...item.underlinedLetters);
        }
        return t;
      }).filter(Boolean);

      return parseQuestionsFromRawText(lines.join('\n'), images, underlinedByQ);
    },

    /**
     * Chuyển đổi danh sách câu hỏi trích xuất sang định dạng tương thích 100% với các trò chơi đối kháng (Kéo co, Thủ thành, Xây nhà, Chiếm đất...)
     */
    toGameQuestions(rawQuestions) {
      if (!Array.isArray(rawQuestions)) return [];
      const gameQs = [];

      rawQuestions.forEach((q, idx) => {
        const qLevel = q.level || (idx < 6 ? 'nhan_biet' : (idx < 12 ? 'thong_hieu' : (idx < 18 ? 'van_dung' : 'van_dung_cao')));
        if (q.type === 'tf' && q.subItems && q.subItems.length > 0) {
          // Với câu Đúng/Sai (Phần II): tạo các câu hỏi thi đấu kiểm tra tính Đúng/Sai của từng ý a, b, c, d
          q.subItems.forEach((sub) => {
            const prompt = `[Ý ${sub.key.toUpperCase()}] ${q.content ? q.content + ' — ' : ''}${sub.text}`;
            gameQs.push({
              text: cleanMathText(prompt),
              image: q.image || null,
              options: ['Đúng', 'Sai', 'Không xác định', 'Chưa đủ dữ kiện'],
              correctIndex: sub.isCorrect ? 0 : 1,
              _level: qLevel
            });
          });
        } else if (q.type === 'short') {
          const val = String(q.correctValue || '0').trim();
          const numVal = parseFloat(val.replace(',', '.'));
          const distractors = !isNaN(numVal)
            ? [
                String(numVal === 0 ? 1 : -numVal).replace('.', ','),
                String(Math.round((numVal + 1) * 100) / 100).replace('.', ','),
                String(Math.round((numVal * 2 + 0.5) * 100) / 100).replace('.', ',')
              ]
            : ['Không tồn tại', 'Vô nghiệm', '0'];
          gameQs.push({
            text: cleanMathText(q.content),
            image: q.image || null,
            options: [val, distractors[0], distractors[1], distractors[2]],
            correctIndex: 0,
            _level: qLevel
          });
        } else {
          // Trắc nghiệm thông thường (Phần I)
          const opts = (q.options && q.options.length > 0)
            ? q.options.map(o => cleanMathText(typeof o === 'object' ? o.text : String(o)))
            : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
          while (opts.length < 4) {
            opts.push(`Phương án ${'ABCD'[opts.length]}`);
          }
          let cIdx = 'ABCD'.indexOf(q.correctAnswer);
          if (cIdx < 0) cIdx = 0;
          gameQs.push({
            text: cleanMathText(q.content),
            image: q.image || null,
            options: opts.slice(0, 4),
            correctIndex: cIdx,
            _level: qLevel
          });
        }
      });

      return gameQs;
    },

    // 4. Render công thức Toán KaTeX trong HTML element an toàn, mượt mà
    renderMath(element) {
      if (!element) return;
      if (global.renderMathInElement) {
        try {
          global.renderMathInElement(element, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
          return;
        } catch (e) {
          console.warn('KaTeX renderMathInElement error:', e);
        }
      }

      if (global.katex && typeof global.katex.renderToString === 'function') {
        try {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
          const textNodes = [];
          let node;
          while ((node = walker.nextNode())) {
            if (node.nodeValue && (node.nodeValue.includes('$') || node.nodeValue.includes('\\(') || node.nodeValue.includes('\\['))) {
              textNodes.push(node);
            }
          }
          textNodes.forEach(tn => {
            const text = tn.nodeValue;
            if (!text) return;
            const replaced = text
              .replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => {
                try { return global.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
              })
              .replace(/\$([^\$\n]+?)\$/g, (m, f) => {
                try { return global.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
              })
              .replace(/\\\(([\s\S]+?)\\\)/g, (m, f) => {
                try { return global.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
              })
              .replace(/\\\[([\s\S]+?)\\\]/g, (m, f) => {
                try { return global.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
              });
            if (replaced !== text) {
              const span = document.createElement('span');
              span.innerHTML = replaced;
              if (tn.parentNode) {
                tn.parentNode.replaceChild(span, tn);
              }
            }
          });
        } catch (err) {
          console.warn('KaTeX fallback render error:', err);
        }
      }
    },

    formatMath(text) {
      if (!text) return '';
      text = cleanMathText(String(text));
      if (global.katex && typeof global.katex.renderToString === 'function') {
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => {
          try { return global.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
        });
        text = text.replace(/\$([^\$\n]+?)\$/g, (m, f) => {
          try { return global.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
        });
        text = text.replace(/\\\(([\s\S]+?)\\\)/g, (m, f) => {
          try { return global.katex.renderToString(f, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
        });
        text = text.replace(/\\\[([\s\S]+?)\\\]/g, (m, f) => {
          try { return global.katex.renderToString(f, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
        });
      }
      return text;
    },

    cleanMathText
  };

  global.FileParser = FileParser;
})(typeof window !== 'undefined' ? window : global);
