import{r as s,j as e}from"./vendor-react-Cg7KvPel.js";
import{n as R,b as O,a as F,H,m as C,l as _,U as B}from"./index-DnvAnRgE.js";
import"./vendor-3d-BEYLZICz.js";
import"./vendor-firebase-CDwhJuH3.js";
import{k as katex}from"./vendor-katex-DqEyuLHo.js";
import{J as JSZip}from"./jszip.min-BXVbx_Ig.js";

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// 1. CHUYỂN ĐỔI LATEX -> MATHML (KATEX) -> WORD OMML (<m:oMath>) TỰ ĐỘNG 100%
// ============================================================================
function parseXmlToAst(xmlStr) {
  var idx = 0;
  function skipWs() {
    while (idx < xmlStr.length && /\s/.test(xmlStr[idx])) idx++;
  }
  function decodeEntities(str) {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(Number(n)); })
      .replace(/&#x([0-9a-fA-F]+);/g, function(_, h) { return String.fromCharCode(parseInt(h, 16)); });
  }
  function parseNode() {
    skipWs();
    if (idx >= xmlStr.length) return null;
    if (xmlStr[idx] === '<') {
      if (xmlStr.startsWith('<!--', idx)) {
        var cEnd = xmlStr.indexOf('-->', idx + 4);
        idx = cEnd === -1 ? xmlStr.length : cEnd + 3;
        return parseNode();
      }
      if (xmlStr.startsWith('</', idx)) return null;
      idx++;
      var tagEnd = idx;
      while (tagEnd < xmlStr.length && !/[\s\/>]/.test(xmlStr[tagEnd])) tagEnd++;
      var tag = xmlStr.slice(idx, tagEnd);
      idx = tagEnd;
      var attrs = {};
      while (idx < xmlStr.length) {
        skipWs();
        if (xmlStr.startsWith('/>', idx)) {
          idx += 2;
          return { type: 'el', tag: tag, attrs: attrs, children: [] };
        }
        if (xmlStr[idx] === '>') {
          idx++;
          break;
        }
        var attrEnd = idx;
        while (attrEnd < xmlStr.length && !/[\s=/>]/.test(xmlStr[attrEnd])) attrEnd++;
        var attrName = xmlStr.slice(idx, attrEnd);
        idx = attrEnd;
        skipWs();
        var attrVal = '';
        if (xmlStr[idx] === '=') {
          idx++;
          skipWs();
          var quote = xmlStr[idx];
          if (quote === '"' || quote === "'") {
            idx++;
            var valEnd = xmlStr.indexOf(quote, idx);
            attrVal = decodeEntities(xmlStr.slice(idx, valEnd));
            idx = valEnd + 1;
          } else {
            var valEnd2 = idx;
            while (valEnd2 < xmlStr.length && !/[\s>]/.test(xmlStr[valEnd2])) valEnd2++;
            attrVal = decodeEntities(xmlStr.slice(idx, valEnd2));
            idx = valEnd2;
          }
        }
        if (attrName) attrs[attrName] = attrVal;
      }
      var children = [];
      while (idx < xmlStr.length) {
        if (xmlStr.startsWith('</', idx)) {
          var closeEnd = xmlStr.indexOf('>', idx);
          idx = closeEnd === -1 ? xmlStr.length : closeEnd + 1;
          break;
        }
        var child = parseNode();
        if (child) children.push(child);
        else break;
      }
      return { type: 'el', tag: tag, attrs: attrs, children: children };
    } else {
      var nextTag = xmlStr.indexOf('<', idx);
      var raw = nextTag === -1 ? xmlStr.slice(idx) : xmlStr.slice(idx, nextTag);
      idx = nextTag === -1 ? xmlStr.length : nextTag;
      return { type: 'text', text: decodeEntities(raw) };
    }
  }
  return parseNode();
}

function getAstText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text;
  var out = '';
  var ch = node.children || [];
  for (var i = 0; i < ch.length; i++) out += getAstText(ch[i]);
  return out;
}

var NARY_OPS = { '∫': 1, '∬': 1, '∭': 1, '∮': 1, '∑': 1, '∏': 1, '⋃': 1, '⋂': 1, '⋁': 1, '⋀': 1, '∐': 1 };
var LIMIT_WORDS = { 'lim': 1, 'max': 1, 'min': 1, 'sup': 1, 'inf': 1, 'det': 1, 'gcd': 1 };

function makeOmmlRun(text, opts) {
  opts = opts || {};
  var clean = String(text || '').replace(/\u2061/g, '').replace(/\u200B/g, '');
  if (!clean) return '';
  var sz = opts.szVal || 24;
  var mRPr = '';
  if (opts.plain || opts.bold) {
    mRPr = '<m:rPr>';
    if (opts.plain && opts.bold) mRPr += '<m:sty m:val="b"/>';
    else if (opts.plain) mRPr += '<m:sty m:val="p"/>';
    else if (opts.bold) mRPr += '<m:sty m:val="bi"/>';
    mRPr += '</m:rPr>';
  }
  var wRPr = '<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Cambria Math"/>';
  if (opts.bold) wRPr += '<w:b/><w:bCs/>';
  wRPr += '<w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/></w:rPr>';
  return '<m:r>' + mRPr + wRPr + '<m:t xml:space="preserve">' + escapeXml(clean) + '</m:t></m:r>';
}

function convertMathmlNodeToOmml(node, szVal) {
  if (!node) return '';
  szVal = szVal || 24;
  if (node.type === 'text') return makeOmmlRun(node.text, { szVal: szVal });
  var tag = node.tag;
  var rawChildren = node.children || [];
  var children = [];
  for (var i = 0; i < rawChildren.length; i++) {
    var c = rawChildren[i];
    if (c.type === 'text' && !c.text.trim() && tag !== 'mtext') continue;
    children.push(c);
  }

  if (tag === 'span' || tag === 'math' || tag === 'semantics' || tag === 'mstyle' || tag === 'mpadded') {
    var res = '';
    for (var j = 0; j < children.length; j++) {
      if (children[j].tag === 'annotation' || children[j].tag === 'annotation-xml') continue;
      res += convertMathmlNodeToOmml(children[j], szVal);
    }
    return res;
  }
  if (tag === 'annotation' || tag === 'annotation-xml') return '';
  if (tag === 'mspace') return makeOmmlRun(' ', { szVal: szVal, plain: true });
  if (tag === 'mi') {
    var txt = getAstText(node).replace(/\u2061/g, '');
    var mv = node.attrs.mathvariant;
    var isPlain = mv === 'normal' || mv === 'double-struck' || mv === 'bold' || txt.length > 1;
    var isBold = mv === 'bold' || mv === 'bold-italic';
    return makeOmmlRun(txt, { szVal: szVal, plain: isPlain, bold: isBold });
  }
  if (tag === 'mn') return makeOmmlRun(getAstText(node), { szVal: szVal, plain: true });
  if (tag === 'mo') return makeOmmlRun(getAstText(node).replace(/\u2061/g, ''), { szVal: szVal });
  if (tag === 'mtext') return makeOmmlRun(getAstText(node), { szVal: szVal, plain: true });
  if (tag === 'mrow') return convertChildrenListToOmml(children, szVal);

  if (tag === 'mfrac') {
    var num = convertMathmlNodeToOmml(children[0], szVal);
    var den = convertMathmlNodeToOmml(children[1], szVal);
    var noBar = node.attrs.linethickness === '0' || node.attrs.linethickness === '0px';
    return '<m:f><m:fPr><m:type m:val="' + (noBar ? 'noBar' : 'bar') + '"/></m:fPr><m:num>' + num + '</m:num><m:den>' + den + '</m:den></m:f>';
  }
  if (tag === 'msqrt') {
    var body = convertChildrenListToOmml(children, szVal);
    return '<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>' + body + '</m:e></m:rad>';
  }
  if (tag === 'mroot') {
    var base = convertMathmlNodeToOmml(children[0], szVal);
    var deg = convertMathmlNodeToOmml(children[1], szVal);
    return '<m:rad><m:radPr><m:degHide m:val="0"/></m:radPr><m:deg>' + deg + '</m:deg><m:e>' + base + '</m:e></m:rad>';
  }
  if (tag === 'msup') {
    return '<m:sSup><m:e>' + convertMathmlNodeToOmml(children[0], szVal) + '</m:e><m:sup>' + convertMathmlNodeToOmml(children[1], szVal) + '</m:sup></m:sSup>';
  }
  if (tag === 'msub') {
    var baseTxt = getAstText(children[0]).replace(/\u2061/g, '').trim();
    var baseXml = convertMathmlNodeToOmml(children[0], szVal);
    var subXml = convertMathmlNodeToOmml(children[1], szVal);
    if (LIMIT_WORDS[baseTxt]) {
      return '<m:limLow><m:e>' + baseXml + '</m:e><m:lim>' + subXml + '</m:lim></m:limLow>';
    }
    return '<m:sSub><m:e>' + baseXml + '</m:e><m:sub>' + subXml + '</m:sub></m:sSub>';
  }
  if (tag === 'msubsup') {
    return '<m:sSubSup><m:e>' + convertMathmlNodeToOmml(children[0], szVal) + '</m:e><m:sub>' + convertMathmlNodeToOmml(children[1], szVal) + '</m:sub><m:sup>' + convertMathmlNodeToOmml(children[2], szVal) + '</m:sup></m:sSubSup>';
  }
  if (tag === 'mover') {
    var baseRaw = getAstText(children[0]).trim();
    var baseX = convertMathmlNodeToOmml(children[0], szVal);
    var accTxt = getAstText(children[1]).trim();
    if (accTxt === '‾' || accTxt === '¯' || accTxt === '_') return '<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>' + baseX + '</m:e></m:bar>';
    if (accTxt === '→' || accTxt === '⃗') {
      if (baseRaw.length > 1) {
        return '<m:groupChr><m:groupChrPr><m:chr m:val="&#x2192;"/><m:pos m:val="top"/><m:vertJc m:val="bot"/></m:groupChrPr><m:e>' + baseX + '</m:e></m:groupChr>';
      }
      return '<m:acc><m:accPr><m:chr m:val="&#x20D7;"/></m:accPr><m:e>' + baseX + '</m:e></m:acc>';
    }
    if (accTxt === '←') {
      if (baseRaw.length > 1) {
        return '<m:groupChr><m:groupChrPr><m:chr m:val="&#x2190;"/><m:pos m:val="top"/><m:vertJc m:val="bot"/></m:groupChrPr><m:e>' + baseX + '</m:e></m:groupChr>';
      }
      return '<m:acc><m:accPr><m:chr m:val="&#x20D6;"/></m:accPr><m:e>' + baseX + '</m:e></m:acc>';
    }
    if (accTxt === '^' || accTxt === 'ˆ') return '<m:acc><m:accPr><m:chr m:val="&#x0302;"/></m:accPr><m:e>' + baseX + '</m:e></m:acc>';
    if (accTxt === '~' || accTxt === '˜') return '<m:acc><m:accPr><m:chr m:val="&#x0303;"/></m:accPr><m:e>' + baseX + '</m:e></m:acc>';
    if (accTxt === '˙' || accTxt === '.') return '<m:acc><m:accPr><m:chr m:val="&#x0307;"/></m:accPr><m:e>' + baseX + '</m:e></m:acc>';
    return '<m:limUpp><m:e>' + baseX + '</m:e><m:lim>' + convertMathmlNodeToOmml(children[1], szVal) + '</m:lim></m:limUpp>';
  }
  if (tag === 'munder') {
    var baseU = convertMathmlNodeToOmml(children[0], szVal);
    var limU = convertMathmlNodeToOmml(children[1], szVal);
    var limTxt = getAstText(children[1]).trim();
    if (limTxt === '_' || limTxt === '‾') return '<m:bar><m:barPr><m:pos m:val="bot"/></m:barPr><m:e>' + baseU + '</m:e></m:bar>';
    return '<m:limLow><m:e>' + baseU + '</m:e><m:lim>' + limU + '</m:lim></m:limLow>';
  }
  if (tag === 'munderover') {
    return '<m:limLow><m:e><m:limUpp><m:e>' + convertMathmlNodeToOmml(children[0], szVal) + '</m:e><m:lim>' + convertMathmlNodeToOmml(children[2], szVal) + '</m:lim></m:limUpp></m:e><m:lim>' + convertMathmlNodeToOmml(children[1], szVal) + '</m:lim></m:limLow>';
  }
  if (tag === 'mtable') {
    var mrXml = '';
    for (var r = 0; r < children.length; r++) {
      var row = children[r];
      if (row.tag !== 'mtr' && row.tag !== 'mlabeledtr') continue;
      var cells = row.children || [];
      mrXml += '<m:mr>';
      for (var d = 0; d < cells.length; d++) {
        if (cells[d].tag !== 'mtd') continue;
        mrXml += '<m:e>' + convertChildrenListToOmml(cells[d].children || [], szVal) + '</m:e>';
      }
      mrXml += '</m:mr>';
    }
    return '<m:m>' + mrXml + '</m:m>';
  }
  if (tag === 'mfenced') {
    var open = node.attrs.open !== undefined ? node.attrs.open : '(';
    var close = node.attrs.close !== undefined ? node.attrs.close : ')';
    return '<m:d><m:dPr><m:begChr m:val="' + escapeXml(open) + '"/><m:endChr m:val="' + escapeXml(close) + '"/></m:dPr><m:e>' + convertChildrenListToOmml(children, szVal) + '</m:e></m:d>';
  }
  return convertChildrenListToOmml(children, szVal);
}

function convertChildrenListToOmml(children, szVal) {
  szVal = szVal || 24;
  var len = children.length;
  // Pattern A: Entire mrow is wrapped in matching \left ... \right fences (including (..], [..), |..|, etc.)
  if (len >= 2 && children[0].tag === 'mo' && children[0].attrs.fence === 'true' &&
      children[len - 1].tag === 'mo' && children[len - 1].attrs.fence === 'true') {
    var begChr = getAstText(children[0]).trim();
    var endChr = getAstText(children[len - 1]).trim();
    var innerXml = convertChildrenListToOmml(children.slice(1, len - 1), szVal);
    return '<m:d><m:dPr><m:begChr m:val="' + escapeXml(begChr) + '"/><m:endChr m:val="' + escapeXml(endChr) + '"/></m:dPr><m:e>' + innerXml + '</m:e></m:d>';
  }

  var out = '';
  var i = 0;
  while (i < len) {
    var curr = children[i];
    var next = children[i + 1];

    // Pattern B: \begin{cases} or \left[ \begin{matrix} ... \right.
    if (curr.tag === 'mo' && curr.attrs.fence === 'true' && next && next.tag === 'mtable') {
      var beg = getAstText(curr).trim();
      var end = '';
      var after = children[i + 2];
      if (after && after.tag === 'mo' && after.attrs.fence === 'true') {
        end = getAstText(after).trim();
        i += 3;
      } else {
        i += 2;
      }
      out += '<m:d><m:dPr><m:begChr m:val="' + escapeXml(beg) + '"/><m:endChr m:val="' + escapeXml(end) + '"/></m:dPr><m:e>' + convertMathmlNodeToOmml(next, szVal) + '</m:e></m:d>';
      continue;
    }

    // Pattern C: N-ary operators (\int, \sum, \prod) + integrand
    if (curr.tag === 'msubsup' || curr.tag === 'msub' || curr.tag === 'msup' || curr.tag === 'munderover' || curr.tag === 'mo') {
      var opChar = '';
      var subNode = null;
      var supNode = null;
      if (curr.tag === 'mo') {
        opChar = getAstText(curr).trim();
      } else if (curr.children && curr.children[0] && curr.children[0].tag === 'mo') {
        opChar = getAstText(curr.children[0]).trim();
        if (curr.tag === 'msub') subNode = curr.children[1];
        if (curr.tag === 'msup') supNode = curr.children[1];
        if (curr.tag === 'msubsup' || curr.tag === 'munderover') {
          subNode = curr.children[1];
          supNode = curr.children[2];
        }
      }
      if (NARY_OPS[opChar]) {
        var endIdx = i + 1;
        while (endIdx < len) {
          var cand = children[endIdx];
          if (cand.type === 'el' && cand.tag === 'mo') {
            var opT = getAstText(cand).trim();
            if (opT === '=' || opT === ',' || opT === ';' || opT === '⇒' || opT === '⇔' || opT === '<' || opT === '>' || opT === '≤' || opT === '≥' || opT === '≠') break;
          }
          endIdx++;
        }
        if (endIdx > i + 1) {
          var integrandXml = convertChildrenListToOmml(children.slice(i + 1, endIdx), szVal);
          var subXml = subNode ? convertMathmlNodeToOmml(subNode, szVal) : '';
          var supXml = supNode ? convertMathmlNodeToOmml(supNode, szVal) : '';
          out += '<m:nary><m:naryPr><m:chr m:val="' + escapeXml(opChar) + '"/><m:limLoc m:val="subSup"/><m:subHide m:val="' + (subNode ? '0' : '1') + '"/><m:supHide m:val="' + (supNode ? '0' : '1') + '"/></m:naryPr><m:sub>' + subXml + '</m:sub><m:sup>' + supXml + '</m:sup><m:e>' + integrandXml + '</m:e></m:nary>';
          i = endIdx;
          continue;
        }
      }
    }

    out += convertMathmlNodeToOmml(curr, szVal);
    i++;
  }
  return out;
}

function latexToOmml(tex, isDisplay, szVal) {
  try {
    var mml = katex.renderToString(tex, { output: 'mathml', displayMode: !!isDisplay, throwOnError: true });
    if (!mml || mml.indexOf('katex-error') !== -1) return null;
    var ast = parseXmlToAst(mml);
    var inner = convertMathmlNodeToOmml(ast, szVal || 24);
    if (!inner) return null;
    if (isDisplay) {
      return '<m:oMathPara><m:oMathParaPr><m:jc m:val="center"/></m:oMathParaPr><m:oMath>' + inner + '</m:oMath></m:oMathPara>';
    }
    return '<m:oMath>' + inner + '</m:oMath>';
  } catch (err) {
    return null;
  }
}

// ============================================================================
// 2. CHUẨN HÓA LATEX & CĂN CHỈNH TỰ ĐỘNG CHUẨN BTPRO
// ============================================================================
function cleanLatexBody(f) {
  var str = String(f || '')
    .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim();
  // Chuẩn hóa ký tự Unicode hay bị AI chèn lẫn vào trong công thức
  str = str.replace(/[’‘′‛]/g, "'");
  str = str.replace(/[“”]/g, '"');
  str = str.replace(/−/g, '-');
  str = str.replace(/×/g, '\\times ');
  str = str.replace(/÷/g, '\\div ');
  str = str.replace(/≤/g, '\\le ');
  str = str.replace(/≥/g, '\\ge ');
  str = str.replace(/≠/g, '\\ne ');
  str = str.replace(/±/g, '\\pm ');
  str = str.replace(/∞/g, '\\infty ');
  str = str.replace(/∈/g, '\\in ');
  str = str.replace(/∉/g, '\\notin ');
  str = str.replace(/⇒/g, '\\Rightarrow ');
  str = str.replace(/⇔/g, '\\Leftrightarrow ');
  str = str.replace(/→/g, '\\to ');
  str = str.replace(/°/g, '^\\circ');
  str = str.replace(/∣/g, '\\mid ');
  str = str.replace(/ℝ/g, '\\mathbb{R}');
  str = str.replace(/ℤ/g, '\\mathbb{Z}');
  str = str.replace(/ℕ/g, '\\mathbb{N}');
  str = str.replace(/ℚ/g, '\\mathbb{Q}');
  str = str.replace(/∅/g, '\\emptyset ');
  str = str.replace(/∪/g, '\\cup ');
  str = str.replace(/∩/g, '\\cap ');
  str = str.replace(/⊂/g, '\\subset ');
  str = str.replace(/⊆/g, '\\subseteq ');
  str = str.replace(/π/g, '\\pi ');
  str = str.replace(/α/g, '\\alpha ');
  str = str.replace(/β/g, '\\beta ');
  str = str.replace(/γ/g, '\\gamma ');
  str = str.replace(/Δ/g, '\\Delta ');
  str = str.replace(/δ/g, '\\delta ');
  str = str.replace(/θ/g, '\\theta ');
  str = str.replace(/λ/g, '\\lambda ');
  str = str.replace(/φ/g, '\\varphi ');
  str = str.replace(/ω/g, '\\omega ');
  str = str.replace(/Ω/g, '\\Omega ');

  str = str.replace(/\\(dfrac|tfrac|cfrac)\b/g, '\\frac');
  str = str.replace(/\\not\\in\b/g, '\\notin');
  str = str.replace(/\\not=/g, '\\ne');
  str = str.replace(/\\implies\b/g, '\\Rightarrow');
  str = str.replace(/\\iff\b/g, '\\Leftrightarrow');
  str = str.replace(/\\vec\{([A-Z][A-Z0-9']+)\}/g, '\\overrightarrow{$1}');
  str = str.replace(/\\operatorname\{([^}]*)\}/g, '\\mathrm{$1}');
  str = str.replace(/\\hat\{([^}]+)\}/g, '\\widehat{$1}');
  str = str.replace(/\^\{\s*o\s*\}/g, '^\\circ');
  str = str.replace(/\^o\b/g, '^\\circ');
  str = str.replace(/\\text\{([^}]*)\}/g, '\\mathrm{$1}');
  str = str.replace(/\\bm\{([^}]*)\}/g, '\\mathbf{$1}');
  str = str.replace(/\\displaystyle\s*/g, '');
  str = str.replace(/\s+/g, ' ').trim();
  return str;
}

function normalizeLatexForToggleTex(text) {
  if (!text) return '';
  var str = String(text)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Chuẩn hóa lỗi OCR/AI thường gặp theo chuẩn macro ChuanhoaSualoi (BTPro)
  str = str.replace(/\b(?:C©u|Caâu|CâU)\s*(\d+)/g, 'Câu $1');
  str = str.replace(/\(Lưu ý:\s*Các phần tiếp theo của đề thi[\s\S]*?\)\s*$/gi, '');
  str = str.replace(/\n{3,}/g, '\n\n');

  // Chuyển code block đặc thù trước khi xử lý TeX
  str = str.replace(/```(?:graph|dothi)\s*\n([\s\S]*?)```/gi, function(m, c) {
    return '\n[GRAPH: ' + c.replace(/\n+/g, '; ').trim() + ']\n';
  });
  str = str.replace(/```bbt\s*\n([\s\S]*?)```/gi, function(m, c) {
    return '\n[BBT: ' + c.replace(/\n+/g, ' | ').trim() + ']\n';
  });
  str = str.replace(/```svg\s*\n([\s\S]*?)```/gi, function(m, c) {
    return '\n' + c.trim() + '\n';
  });
  str = str.replace(/```(?:tikz)\s*\n([\s\S]*?)```/gi, function(m, c) {
    return '\n' + c.trim() + '\n';
  });
  str = str.replace(/```(?:latex|tex)\s*\n([\s\S]*?)```/gi, function(m, c) {
    var trimmed = c.trim();
    if (/\\tkzTabInit/.test(trimmed) || /<svg\b/i.test(trimmed)) return '\n' + trimmed + '\n';
    return '\n\n$$' + trimmed + '$$\n\n';
  });

  // Che tạm thẻ hình ảnh / đồ thị / SVG để bộ lọc TeX không làm hỏng URL hay thuộc tính SVG
  var preserved = [];
  var holdToken = function(raw) {
    var id = preserved.length;
    preserved.push(raw);
    return '\uE002V' + id + '\uE003';
  };
  str = str.replace(/<svg\b[\s\S]*?<\/svg>/gi, holdToken);
  str = str.replace(/!\[[^\]]*\]\(data:image\/[^)]+\)/gi, holdToken);
  str = str.replace(/\[(?:IMG|GRAPH|DO_THI|BBT):(?:\[HATCH\]|[^\]])+\]/gi, holdToken);
  str = str.replace(/(?:\\begin\{tikzpicture\}[\s\S]*?\\tkzTabInit[\s\S]*?\\end\{tikzpicture\}|\\tkzTabInit[\s\S]*?\\tkzTabVar\{[^}]*\}(?:\{[^}]*\})*)/g, holdToken);

  str = str.replace(/\\\[([\s\S]*?)\\\]/g, function(m, f) {
    return '\n\n$$' + f.trim() + '$$\n\n';
  });
  str = str.replace(/\\\(([\s\S]*?)\\\)/g, function(m, f) {
    return '$' + f.replace(/\s*\n\s*/g, ' ').trim() + '$';
  });
  // Thu gọn \begin{array}...\end{array} nhiều dòng về cùng khối sạch để không bị cắt dòng
  str = str.replace(/\$\$?\s*(\\begin\{array\}[\s\S]*?\\end\{array\})\s*\$?\$/g, function(m, body) {
    var compact = body.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return '$' + compact + '$';
  });
  str = str.replace(/\$\$([\s\S]*?)\$\$/g, function(m, f) {
    var cleanDisp = cleanLatexBody(f);
    return cleanDisp ? '$$' + cleanDisp + '$$' : '';
  });
  str = str.replace(/(?<!\$)\$(?!\$)((?:\\.|[^\\\$\n])+?)(?<!\$)\$(?!\$)/g, function(m, f) {
    var clean = cleanLatexBody(f);
    if (!clean) return '';
    var trailingPunct = '';
    // CỰC KỲ QUAN TRỌNG: KHÔNG cắt dấu chấm thuộc cặp lệnh LaTeX \right. hoặc \left. !
    if (/\\(?:left|right)\.\.$/.test(clean)) {
      trailingPunct = '.';
      clean = clean.slice(0, -1).trim();
    } else if (!/\\(?:left|right)\.$/.test(clean)) {
      var punctMatch = clean.match(/([.,;:?!]+)$/);
      if (punctMatch) {
        trailingPunct = punctMatch[1];
        clean = clean.slice(0, -trailingPunct.length).trim();
      }
    }
    return (clean ? '$' + clean + '$' : '') + trailingPunct;
  });

  // Che toàn bộ $$...$$ và $...$ trước khi căn khoảng trắng dấu câu để KHÔNG phá hỏng bên trong công thức (VD: $ABCD.A'B'C'D'$)
  str = str.replace(/\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$)/g, holdToken);

  // Đảm bảo có khoảng trắng hợp lý quanh công thức ngoài vùng dấu câu
  str = str.replace(/([a-zA-ZÀ-ỹ0-9_\):;])(\uE002V\d+\uE003)/g, function(match, p1, p2) {
    var mId = Number(p2.slice(2, -1));
    return preserved[mId] && preserved[mId][0] === '$' ? p1 + ' ' + p2 : match;
  });
  str = str.replace(/(\uE002V\d+\uE003)([a-zA-ZÀ-ỹ0-9_])/g, function(match, p1, p2) {
    var mId = Number(p1.slice(2, -1));
    return preserved[mId] && preserved[mId][0] === '$' ? p1 + ' ' + p2 : match;
  });
  str = str.replace(/(\uE002V\d+\uE003)(\([a-zA-ZÀ-ỹ])/g, function(match, p1, p2) {
    var mId = Number(p1.slice(2, -1));
    return preserved[mId] && preserved[mId][0] === '$' ? p1 + ' ' + p2 : match;
  });
  str = str.replace(/([.,;:?!])([a-zA-ZÀ-ỹ])/g, function(match, p1, p2) {
    return p1 + ' ' + p2;
  });
  str = str.replace(/\s+([.,;:?!\)])/g, '$1');
  str = str.replace(/\(\s+/g, '(');

  // Khôi phục thẻ công thức, hình ảnh, đồ thị, BBT nguyên vẹn
  str = str.replace(/\uE002V(\d+)\uE003/g, function(m, idx) {
    return preserved[Number(idx)];
  });
  return str;
}

function parseInlineTokens(text) {
  if (!text) return [];
  // Bước 1: Che toàn bộ công thức $...$ / $$...$$ để *italic* hoặc **bold** bên ngoài không nuốt mất công thức
  var mathList = [];
  var masked = String(text).replace(/(\$\$[\s\S]+?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$))/g, function(m) {
    var idx = mathList.length;
    mathList.push(m);
    return '\uE000M' + idx + '\uE001';
  });

  // Bước 2: Tách **bold** và *italic* trên văn bản đã che công thức
  var styleRuns = [];
  var styleRegex = /(\*\*[\s\S]+?\*\*)|(\*[^\*\n]+?\*)/g;
  var lastIndex = 0;
  var m;
  var pushCleanTextRun = function(seg, bold, italic) {
    if (!seg) return;
    // Loại bỏ dấu * thừa sót lại (không ghép cặp) ngoài vùng công thức
    var cleaned = seg.replace(/\*+/g, '');
    if (cleaned) styleRuns.push({ text: cleaned, bold: bold, italic: italic });
  };

  while ((m = styleRegex.exec(masked)) !== null) {
    if (m.index > lastIndex) {
      pushCleanTextRun(masked.slice(lastIndex, m.index), false, false);
    }
    if (m[1]) {
      pushCleanTextRun(m[1].slice(2, -2), true, false);
    } else if (m[2]) {
      pushCleanTextRun(m[2].slice(1, -1), false, true);
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < masked.length) {
    pushCleanTextRun(masked.slice(lastIndex), false, false);
  }

  // Bước 3: Khôi phục lại công thức vào đúng vị trí, giữ nguyên cờ bold/italic bao ngoài
  var tokens = [];
  for (var r = 0; r < styleRuns.length; r++) {
    var run = styleRuns[r];
    var parts = run.text.split(/(\uE000M\d+\uE001)/g);
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      if (!part) continue;
      var mId = part.match(/^\uE000M(\d+)\uE001$/);
      if (mId) {
        tokens.push({ text: mathList[Number(mId[1])], bold: run.bold, italic: run.italic, math: true });
      } else {
        tokens.push({ text: part, bold: run.bold, italic: run.italic, math: false });
      }
    }
  }
  return tokens;
}

function splitRowUnescapedAmp(rowStr) {
  var cells = [];
  var curr = '';
  for (var i = 0; i < rowStr.length; i++) {
    if (rowStr[i] === '&' && (i === 0 || rowStr[i - 1] !== '\\')) {
      cells.push(curr.trim());
      curr = '';
    } else {
      curr += rowStr[i];
    }
  }
  cells.push(curr.trim());
  return cells;
}

function parseLatexArrayTable(rawLatex) {
  var cleaned = String(rawLatex || '').replace(/^\$+|\$+$/g, '').trim();
  var m = cleaned.match(/^\\begin\{array\}\{([^}]*)\}([\s\S]*?)\\end\{array\}$/);
  if (!m) return null;
  var colSpec = m[1] || '';
  var body = m[2] || '';

  var vertAfterCols = {};
  var colIdx = -1;
  for (var s = 0; s < colSpec.length; s++) {
    var ch = colSpec[s];
    if (ch === '|') {
      if (colIdx >= 0) vertAfterCols[colIdx] = true;
      else vertAfterCols[-1] = true;
    } else if (!/\s/.test(ch)) {
      colIdx++;
    }
  }

  var rawRows = body.split(/\\\\/);
  var rows = [];
  var hlinesBeforeRow = {};
  var maxCols = 0;

  for (var r = 0; r < rawRows.length; r++) {
    var rowStr = rawRows[r].trim();
    while (/^\\hline\b/.test(rowStr)) {
      hlinesBeforeRow[rows.length] = true;
      rowStr = rowStr.replace(/^\\hline\b/, '').trim();
    }
    if (!rowStr) continue;
    var cells = splitRowUnescapedAmp(rowStr);
    if (cells.length > maxCols) maxCols = cells.length;
    rows.push(cells);
  }

  if (rows.length === 0 || maxCols === 0) return null;
  for (var r2 = 0; r2 < rows.length; r2++) {
    while (rows[r2].length < maxCols) rows[r2].push('');
  }

  return {
    type: 'variation-table',
    vertAfterCols: vertAfterCols,
    hlinesBeforeRow: hlinesBeforeRow,
    rows: rows,
    maxCols: maxCols,
    rawTex: cleaned
  };
}

// ============================================================================
// 2B. BỘ DỰNG HÌNH TOÁN HỌC: BẢNG BIẾN THIÊN (BBT/TKZ-TAB), ĐỒ THỊ, HÌNH ẢNH
// ============================================================================
function compileMathExpr(rawExpr) {
  var s = String(rawExpr || '').trim().replace(/\$/g, '');
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\)|g\s*\(\s*x\s*\))\s*=\s*/i, '');
  s = s.replace(/−/g, '-').replace(/×/g, '*').replace(/\\cdot/g, '*').replace(/\\times/g, '*');
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '(').replace(/\\right\]/g, ')');
  s = s.replace(/\\left\|/g, 'abs(').replace(/\\right\|/g, ')');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  for (var iter = 0; iter < 4; iter++) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  }
  s = s.replace(/\\(sin|cos|tan|cot|ln|log|exp|sqrt|abs)\b/g, '$1');
  s = s.replace(/\\pi\b/g, 'pi');
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)');
  s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  s = s.replace(/([x)])(\d|\(|[x])/g, function(m, a, b) {
    if (a === 'x' && /[a-zA-Z]/.test(b) && b !== 'x') return a + '*' + b;
    return a + '*' + b;
  });
  s = s.replace(/\)\s*\(/g, ')*(');
  s = s.replace(/\bx\s*\(/g, 'x*(');
  s = s.replace(/\)\s*x\b/g, ')*x');
  s = s.replace(/\s+/g, '');

  var pos = 0;
  function peek() { return s[pos] || ''; }
  function parseExpr() {
    var v = parseTerm();
    while (peek() === '+' || peek() === '-') {
      var op = s[pos++];
      var r = parseTerm();
      v = (function(left, right, oper) {
        return oper === '+' ? function(x) { return left(x) + right(x); } : function(x) { return left(x) - right(x); };
      })(v, r, op);
    }
    return v;
  }
  function parseTerm() {
    var v = parsePower();
    while (peek() === '*' || peek() === '/') {
      var op = s[pos++];
      var r = parsePower();
      v = (function(left, right, oper) {
        return oper === '*' ? function(x) { return left(x) * right(x); } : function(x) { return left(x) / right(x); };
      })(v, r, op);
    }
    return v;
  }
  function parsePower() {
    var base = parseUnary();
    if (peek() === '^') {
      pos++;
      var exp = parsePower();
      return function(x) {
        var b = base(x), p = exp(x);
        if (b < 0 && Math.abs(p - Math.round(p)) < 1e-9) return Math.pow(b, Math.round(p));
        return Math.pow(b, p);
      };
    }
    return base;
  }
  function parseUnary() {
    if (peek() === '+') { pos++; return parseUnary(); }
    if (peek() === '-') { pos++; var u = parseUnary(); return function(x) { return -u(x); }; }
    return parsePrimary();
  }
  function parsePrimary() {
    if (peek() === '(') {
      pos++;
      var inner = parseExpr();
      if (peek() === ')') pos++;
      return inner;
    }
    var numMatch = s.slice(pos).match(/^(\d+(?:\.\d+)?)/);
    if (numMatch) {
      pos += numMatch[1].length;
      var val = parseFloat(numMatch[1]);
      return function() { return val; };
    }
    var idMatch = s.slice(pos).match(/^([a-zA-Z]+)/);
    if (idMatch) {
      var name = idMatch[1].toLowerCase();
      pos += name.length;
      if (peek() === '(') {
        pos++;
        var arg = parseExpr();
        if (peek() === ')') pos++;
        return function(x) {
          var a = arg(x);
          if (name === 'sin') return Math.sin(a);
          if (name === 'cos') return Math.cos(a);
          if (name === 'tan') return Math.tan(a);
          if (name === 'cot') return 1 / Math.tan(a);
          if (name === 'sqrt') return a >= 0 ? Math.sqrt(a) : NaN;
          if (name === 'abs') return Math.abs(a);
          if (name === 'ln') return a > 0 ? Math.log(a) : NaN;
          if (name === 'log') return a > 0 ? Math.log10(a) : NaN;
          if (name === 'exp') return Math.exp(a);
          if (name === 'asin') return Math.asin(a);
          if (name === 'acos') return Math.acos(a);
          if (name === 'atan') return Math.atan(a);
          return NaN;
        };
      }
      if (name === 'x') return function(x) { return x; };
      if (name === 'pi') return function() { return Math.PI; };
      if (name === 'e') return function() { return Math.E; };
    }
    return function() { return NaN; };
  }
  try {
    var fn = parseExpr();
    return fn;
  } catch (err) {
    return function() { return NaN; };
  }
}

function formatCleanNumberForMath(val) {
  if (!Number.isFinite(val)) return val > 0 ? '+\\infty' : '-\\infty';
  if (Math.abs(val) < 1e-6) return '0';
  var r = Math.round(val);
  if (Math.abs(val - r) < 1e-5) return String(r);
  for (var d = 2; d <= 12; d++) {
    var n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-5) {
      return n < 0 ? '-\\frac{' + Math.abs(n) + '}{' + d + '}' : '\\frac{' + n + '}{' + d + '}';
    }
  }
  return String(Math.round(val * 100) / 100);
}

function toCleanRational(val) {
  if (!Number.isFinite(val)) return null;
  if (Math.abs(val) < 1e-7) return { num: 0, den: 1, value: 0 };
  var r = Math.round(val);
  if (Math.abs(val - r) < 1e-5) return { num: r, den: 1, value: r };
  for (var d = 2; d <= 24; d++) {
    var n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-5) return { num: n, den: d, value: n / d };
  }
  return null;
}

function polyToLatex(coeffs, varName) {
  var xSym = varName || 'x';
  var parts = [];
  for (var deg = coeffs.length - 1; deg >= 0; deg--) {
    var c = coeffs[deg];
    if (!Number.isFinite(c) || Math.abs(c) < 1e-6) continue;
    var isFirst = parts.length === 0;
    var sign = c < 0 ? '-' : '+';
    var absVal = Math.abs(c);
    var rat = toCleanRational(absVal);
    var magStr;
    if (rat) {
      if (rat.den === 1) {
        magStr = (deg > 0 && rat.num === 1) ? '' : String(rat.num);
      } else {
        magStr = '\\frac{' + rat.num + '}{' + rat.den + '}';
      }
    } else {
      magStr = String(Math.round(absVal * 100) / 100);
    }
    var varPart = deg === 0 ? '' : (deg === 1 ? xSym : xSym + '^' + deg);
    parts.push((isFirst ? (c < 0 ? '-' : '') : (' ' + sign + ' ')) + magStr + varPart);
  }
  return parts.length ? parts.join('') : '0';
}

function fitPolyDeg4(fn, shift) {
  var s0 = shift || 0;
  var g = function(t) { return fn(t + s0); };
  var y0 = g(0), y1 = g(1), ym1 = g(-1), y2 = g(2), ym2 = g(-2);
  if (![y0, y1, ym1, y2, ym2].every(Number.isFinite)) return null;
  var S1 = (y1 - ym1) / 2;
  var E1 = (y1 + ym1) / 2 - y0;
  var S2 = (y2 - ym2) / 4;
  var E2 = (y2 + ym2) / 2 - y0;
  var c3 = (S2 - S1) / 3;
  var c1 = S1 - c3;
  var c4 = (E2 - 4 * E1) / 12;
  var c2 = E1 - c4;
  var evalShifted = function(t) { return y0 + c1 * t + c2 * t * t + c3 * t * t * t + c4 * t * t * t * t; };
  var probes = [-1.5, 0.5, 1.5, 2.5];
  for (var i = 0; i < probes.length; i++) {
    var actual = g(probes[i]);
    if (!Number.isFinite(actual) || Math.abs(actual - evalShifted(probes[i])) > 1e-5) return null;
  }
  var c = [y0, c1, c2, c3, c4];
  if (s0 !== 0) {
    // Khai triển lại về biến x từ t = x - s0 (dùng cho pole-shift bậc <= 2)
    if (Math.abs(c3) > 1e-6 || Math.abs(c4) > 1e-6) return null;
    c = [
      y0 - c1 * s0 + c2 * s0 * s0,
      c1 - 2 * c2 * s0,
      c2,
      0,
      0
    ];
  }
  return c.map(function(v) {
    if (Math.abs(v) < 1e-7) return 0;
    var r = toCleanRational(v);
    return r ? r.value : v;
  });
}

function splitTopLevelRational(rawExpr) {
  var s = String(rawExpr || '').trim().replace(/\$/g, '');
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\)|g\s*\(\s*x\s*\))\s*=\s*/i, '').replace(/\s+/g, '');
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  for (var iter = 0; iter < 4; iter++) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  }
  var leadSign = 1;
  while (s.length >= 2 && s[0] === '(' && s[s.length - 1] === ')') {
    var d0 = 0, wraps = true;
    for (var i = 0; i < s.length - 1; i++) {
      if (s[i] === '(') d0++;
      else if (s[i] === ')') d0--;
      if (d0 === 0) { wraps = false; break; }
    }
    if (wraps) s = s.slice(1, -1);
    else break;
  }
  if (s[0] === '-') { leadSign = -1; s = s.slice(1); }
  while (s.length >= 2 && s[0] === '(' && s[s.length - 1] === ')') {
    var d1 = 0, w1 = true;
    for (var j = 0; j < s.length - 1; j++) {
      if (s[j] === '(') d1++;
      else if (s[j] === ')') d1--;
      if (d1 === 0) { w1 = false; break; }
    }
    if (w1) s = s.slice(1, -1);
    else break;
  }
  var depth = 0, slashIdx = -1, topCount = 0;
  for (var k = 0; k < s.length; k++) {
    var ch = s[k];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && (ch === '+' || ch === '-' || ch === '*' || ch === '/')) {
      topCount++;
      if (ch === '/') slashIdx = k;
    }
  }
  if (topCount === 1 && slashIdx > 0) {
    return {
      sign: leadSign,
      numExpr: s.slice(0, slashIdx),
      denExpr: s.slice(slashIdx + 1)
    };
  }
  return null;
}

function analyzeMathFunction(formulaStr) {
  var expr = String(formulaStr || '').trim();
  if (!expr) return null;
  var fn = compileMathExpr(expr);

  function buildRationalResult(a, b, c, m, n) {
    if (Math.abs(m) < 1e-8) return null;
    if (m < 0) { a = -a; b = -b; c = -c; m = -m; n = -n; }
    var x0 = -n / m;
    var rem = a * x0 * x0 + b * x0 + c;
    if (Math.abs(rem) < 1e-6) return null; // Phân thức rút gọn được thành đa thức
    var denTex = '(' + polyToLatex([n, m]) + ')^2';
    var tcdTex = 'x = ' + formatCleanNumberForMath(x0);
    if (Math.abs(a) < 1e-7) {
      var derivConst = b * n - c * m;
      var derivTex1 = '\\frac{' + polyToLatex([derivConst]) + '}{' + denTex + '}';
      var tcnVal = b / m;
      return {
        kind: 'rational_1_1',
        derivLatex: derivTex1,
        fullDerivLatex: "y' = " + derivTex1,
        tcd: tcdTex,
        tcn: 'y = ' + formatCleanNumberForMath(tcnVal),
        tcx: null,
        asymptoteK: 0,
        asymptoteQ: tcnVal,
        poles: [x0]
      };
    }
    // Bậc 2 / Bậc 1: y = (ax^2 + bx + c) / (mx + n)
    var d0 = b * n - c * m;
    var d1 = 2 * a * n;
    var d2 = a * m;
    var derivTex2 = '\\frac{' + polyToLatex([d0, d1, d2]) + '}{' + denTex + '}';
    var kSlope = a / m;
    var qInt = (b - kSlope * n) / m;
    return {
      kind: 'rational_2_1',
      derivLatex: derivTex2,
      fullDerivLatex: "y' = " + derivTex2,
      tcd: tcdTex,
      tcn: null,
      tcx: 'y = ' + polyToLatex([qInt, kSlope]),
      asymptoteK: kSlope,
      asymptoteQ: qInt,
      poles: [x0]
    };
  }

  // 1. Thử phân tích đa thức bậc <= 4
  var poly = fitPolyDeg4(fn, 0);
  if (poly) {
    var dPoly = [poly[1], 2 * poly[2], 3 * poly[3], 4 * poly[4]];
    var derivPolyTex = polyToLatex(dPoly);
    return {
      kind: 'polynomial',
      derivLatex: derivPolyTex,
      fullDerivLatex: "y' = " + derivPolyTex,
      tcd: null,
      tcn: null,
      tcx: null,
      poles: []
    };
  }

  // 2. Thử phân tách phân thức dạng A/B hoặc \frac{A}{B}
  var split = splitTopLevelRational(expr);
  if (split) {
    var numPoly = fitPolyDeg4(compileMathExpr(split.numExpr), 0);
    var denPoly = fitPolyDeg4(compileMathExpr(split.denExpr), 0);
    if (numPoly && denPoly && Math.abs(denPoly[2]) < 1e-7 && Math.abs(denPoly[3]) < 1e-7 && Math.abs(denPoly[4]) < 1e-7 && Math.abs(denPoly[1]) > 1e-7 && Math.abs(numPoly[3]) < 1e-7 && Math.abs(numPoly[4]) < 1e-7) {
      var resSplit = buildRationalResult(
        split.sign * numPoly[2],
        split.sign * numPoly[1],
        split.sign * numPoly[0],
        denPoly[1],
        denPoly[0]
      );
      if (resSplit) return resSplit;
    }
  }

  // 3. Thử nhận diện phân thức 1 cực đơn dạng viết tách (VD: y = x - 1 + 1/(x - 1))
  var poleFound = NaN;
  var pStep = 0.05;
  var prevV = fn(-10);
  for (var px = -10 + pStep; px <= 10 + 1e-9; px += pStep) {
    var v = fn(px);
    var j = (Number.isFinite(prevV) && Number.isFinite(v) && v * prevV < 0 && Math.abs(v - prevV) > 40) ||
            (!Number.isFinite(v) && Number.isFinite(prevV)) ||
            (Number.isFinite(v) && !Number.isFinite(prevV));
    if (j) {
      var lo = px - pStep, hi = px, sLo = fn(lo);
      for (var bit = 0; bit < 32; bit++) {
        var md = (lo + hi) / 2, ym = fn(md);
        if (!Number.isFinite(ym) || Math.abs(ym) > 1e8) { lo = hi = md; break; }
        if ((sLo > 0 && ym > 0) || (sLo < 0 && ym < 0)) lo = md;
        else hi = md;
      }
      poleFound = (lo + hi) / 2;
      break;
    }
    prevV = v;
  }
  if (Number.isFinite(poleFound)) {
    var ratP = toCleanRational(poleFound);
    var pVal = ratP ? ratP.value : Math.round(poleFound * 1000) / 1000;
    var pDen = ratP ? ratP.den : 1;
    var pNum = ratP ? ratP.num : pVal;
    var shiftX = Math.round(pVal) + 4;
    var multFn = function(x) { return (x - pVal) * fn(x); };
    var multPoly = fitPolyDeg4(multFn, shiftX);
    if (multPoly && Math.abs(multPoly[3]) < 1e-6 && Math.abs(multPoly[4]) < 1e-6) {
      var resPole = buildRationalResult(
        multPoly[2] * pDen,
        multPoly[1] * pDen,
        multPoly[0] * pDen,
        pDen,
        -pNum
      );
      if (resPole) return resPole;
    }
  }

  return null;
}

function generateBbtFromFunction(formulaStr) {
  var expr = String(formulaStr || '').trim();
  var fn = compileMathExpr(expr);
  var h = 1e-5;
  var df = function(x) { return (fn(x + h) - fn(x - h)) / (2 * h); };

  // Quét nghiệm đạo hàm & điểm gián đoạn (tiệm cận đứng) trong [-10, 10]
  var events = [];
  var prevX = -10;
  var prevY = fn(prevX);
  var prevDy = df(prevX);
  var step = 0.025;
  for (var x = -10 + step; x <= 10 + 1e-9; x += step) {
    var y = fn(x);
    var dy = df(x);
    var jumpY = (Number.isFinite(prevY) && Number.isFinite(y) && (y * prevY < 0) && Math.abs(y - prevY) > 40) ||
                (!Number.isFinite(y) && Number.isFinite(prevY)) ||
                (Number.isFinite(y) && !Number.isFinite(prevY));
    if (jumpY) {
      // Định vị chính xác điểm gián đoạn bằng chia đôi theo dấu đổi cực (từ -∞ sang +∞ hoặc ngược lại)
      var lo = prevX, hi = x;
      var sgnLo = fn(lo);
      for (var b = 0; b < 32; b++) {
        var mid = (lo + hi) / 2;
        var ym = fn(mid);
        if (!Number.isFinite(ym) || Math.abs(ym) > 1e8) {
          lo = hi = mid;
          break;
        }
        if ((sgnLo > 0 && ym > 0) || (sgnLo < 0 && ym < 0)) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      var pole = (lo + hi) / 2;
      if (Math.abs(pole - Math.round(pole * 12) / 12) < 1e-3) pole = Math.round(pole * 12) / 12;
      if (Math.abs(fn(pole)) > 50 || !Number.isFinite(fn(pole))) {
        if (!events.some(function(ev) { return Math.abs(ev.x - pole) < 0.15; })) {
          events.push({ x: pole, type: 'pole' });
        }
      }
    } else if (Number.isFinite(prevDy) && Number.isFinite(dy) && (prevDy === 0 || (prevDy * dy < 0 && Math.abs(dy - prevDy) < 50))) {
      var a = prevX, b2 = x, fa = prevDy;
      for (var it = 0; it < 28; it++) {
        var m = (a + b2) / 2;
        var fm = df(m);
        if (fa * fm <= 0) b2 = m;
        else { a = m; fa = fm; }
      }
      var root = (a + b2) / 2;
      if (Math.abs(df(root)) < 0.05 && Number.isFinite(fn(root)) && Math.abs(fn(root)) < 1e4) {
        if (!events.some(function(ev) { return Math.abs(ev.x - root) < 0.08; })) {
          events.push({ x: root, type: 'crit' });
        }
      }
    }
    prevX = x; prevY = y; prevDy = dy;
  }

  events.sort(function(p, q) { return p.x - q.x; });
  if (events.length > 5) events = events.slice(0, 5);

  var xCols = ['-\\infty'];
  var ypCols = [];
  var yCols = [];

  var sampleLimitInf = function(valAtEdge, slopeEdge) {
    if (!Number.isFinite(valAtEdge)) return valAtEdge > 0 ? '+\\infty' : '-\\infty';
    var yFar = fn(valAtEdge > 0 ? 500 : -500);
    var yFar2 = fn(valAtEdge > 0 ? 1000 : -1000);
    if (!Number.isFinite(yFar2)) return yFar > 0 ? '+\\infty' : '-\\infty';
    if (Math.abs(yFar2) > 100 && Math.abs(yFar2 - yFar) > 20) {
      return yFar2 > 0 ? '+\\infty' : '-\\infty';
    }
    if (Math.abs(yFar2 - yFar) < 0.05) {
      return formatCleanNumberForMath(yFar2);
    }
    return slopeEdge > 0 ? '+\\infty' : '-\\infty';
  };

  var pts = [{ x: -100, type: 'leftInf' }].concat(events).concat([{ x: 100, type: 'rightInf' }]);
  for (var pIdx = 0; pIdx < pts.length; pIdx++) {
    var pt = pts[pIdx];
    if (pt.type === 'leftInf') {
      var probeL = events.length > 0 ? events[0].x - 2 : -2;
      var dyInfL = df(-20);
      yCols.push(sampleLimitInf(-100, -dyInfL));
    } else if (pt.type === 'rightInf') {
      xCols.push('+\\infty');
      var dyInfR = df(20);
      yCols.push(sampleLimitInf(100, dyInfR));
    } else if (pt.type === 'crit') {
      xCols.push(formatCleanNumberForMath(pt.x));
      ypCols.push('0');
      yCols.push(formatCleanNumberForMath(fn(pt.x)));
    } else if (pt.type === 'pole') {
      xCols.push(formatCleanNumberForMath(pt.x));
      ypCols.push('||');
      var limL = fn(pt.x - 1e-4) > 0 ? '+\\infty' : '-\\infty';
      var limR = fn(pt.x + 1e-4) > 0 ? '+\\infty' : '-\\infty';
      yCols.push(limL + ' || ' + limR);
    }

    if (pIdx < pts.length - 1) {
      var nextPt = pts[pIdx + 1];
      var midX;
      if (pt.type === 'leftInf') midX = nextPt.type === 'rightInf' ? 0 : nextPt.x - 1.5;
      else if (nextPt.type === 'rightInf') midX = pt.x + 1.5;
      else midX = (pt.x + nextPt.x) / 2;

      var sgn = df(midX);
      xCols.push('');
      if (!Number.isFinite(sgn)) {
        ypCols.push('');
        yCols.push('');
      } else if (sgn >= 0) {
        ypCols.push('+');
        yCols.push('\\nearrow');
      } else {
        ypCols.push('-');
        yCols.push('\\searrow');
      }
    }
  }

  return '[BBT: x = ' + xCols.join(', ') + " | y' = " + ypCols.join(', ') + ' | y = ' + yCols.join(', ') + ']';
}

function parseTkzTab(rawTikz) {
  var rows = [];
  var initM = rawTikz.match(/\\tkzTabInit[\s\S]*?\{([^}]*)\}\s*\{([^}]*)\}/);
  var xHeader = 'x';
  var xVals = [];
  if (initM) {
    var leftParts = initM[1].split(',').map(function(s) { return s.replace(/\$/g, '').trim(); }).filter(Boolean);
    if (leftParts[0]) xHeader = leftParts[0].split('/')[0].trim() || 'x';
    xVals = initM[2].split(',').map(function(s) { return s.replace(/\$/g, '').trim(); });
  }
  var spacedX = [xHeader];
  for (var i = 0; i < xVals.length; i++) {
    spacedX.push(xVals[i]);
    if (i < xVals.length - 1) spacedX.push('');
  }
  var maxCols = spacedX.length;
  rows.push(spacedX);

  var lineM = rawTikz.match(/\\tkzTabLine\s*\{([^}]*)\}/);
  var hlines = { 1: true };
  if (lineM) {
    var items = lineM[1].split(',').map(function(s) { return s.trim(); });
    var ypRow = ["y'"];
    for (var j = 1; j < maxCols; j++) {
      var tok = (items[j] || '').replace(/\$/g, '').trim();
      if (tok === 'z') tok = '0';
      else if (tok === 'd') tok = '||';
      else if (tok === 't' || tok === 'h') tok = '';
      ypRow.push(tok);
    }
    rows.push(ypRow);
    hlines[2] = true;
  }

  var varM = rawTikz.match(/\\tkzTabVar\s*\{([^}]*)\}/);
  if (varM) {
    var vRaw = varM[1].split(',').map(function(s) { return s.trim(); });
    var yRow = ['y'];
    for (var k = 1; k < maxCols; k++) yRow.push('');
    var colCursor = 1;
    var levels = [];
    for (var vi = 0; vi < vRaw.length && colCursor < maxCols; vi++) {
      var item = vRaw[vi].replace(/\$/g, '').trim();
      if (item.indexOf('-D+') !== -1 || item.indexOf('+D-') !== -1 || item.indexOf('-D-') !== -1 || item.indexOf('+D+') !== -1) {
        var dParts = item.split('/');
        var leftVal = (dParts[1] || '').trim();
        var rightVal = (dParts[2] || '').trim();
        yRow[colCursor] = (leftVal || '-\\infty') + ' || ' + (rightVal || '+\\infty');
        levels.push({ col: colCursor, lv: item[0] === '+' ? 'top' : 'bot', endLv: item.indexOf('D+') !== -1 ? 'top' : 'bot' });
      } else {
        var slashIdx = item.indexOf('/');
        var posFlag = slashIdx !== -1 ? item.slice(0, slashIdx).trim() : '';
        var valStr = slashIdx !== -1 ? item.slice(slashIdx + 1).trim() : item;
        yRow[colCursor] = valStr;
        levels.push({ col: colCursor, lv: posFlag.indexOf('+') !== -1 ? 'top' : 'bot' });
      }
      colCursor += 2;
    }
    for (var li = 0; li < levels.length - 1; li++) {
      var curL = levels[li].endLv || levels[li].lv;
      var nxtL = levels[li + 1].lv;
      var midCol = levels[li].col + 1;
      if (midCol < maxCols) {
        if (curL === 'bot' && nxtL === 'top') yRow[midCol] = '\\nearrow';
        else if (curL === 'top' && nxtL === 'bot') yRow[midCol] = '\\searrow';
        else yRow[midCol] = '\\rightarrow';
      }
    }
    rows.push(yRow);
  }

  return {
    type: 'variation-table',
    vertAfterCols: { 0: true },
    hlinesBeforeRow: hlines,
    rows: rows,
    maxCols: maxCols,
    rawTex: rawTikz
  };
}

function parseBbtShorthand(specStr) {
  var body = String(specStr || '').trim();
  if (/^y\s*=\s*/i.test(body) && body.indexOf('|') === -1) {
    var gen = generateBbtFromFunction(body);
    body = gen.replace(/^\[BBT:\s*|\s*\]$/g, '');
  }
  var parts = body.split(/\s*\|\s*(?=[a-zA-Z'()fx]+\s*=)/i);
  if (parts.length < 2) return null;
  var rows = [];
  var hlines = {};
  var maxCols = 0;
  for (var i = 0; i < parts.length; i++) {
    var eqIdx = parts[i].indexOf('=');
    if (eqIdx === -1) continue;
    var label = parts[i].slice(0, eqIdx).trim();
    var valsStr = parts[i].slice(eqIdx + 1).trim();
    var cells = [label].concat(valsStr.split(',').map(function(s) {
      return s.trim().replace(/\+inf\b/gi, '+\\infty').replace(/-inf\b/gi, '-\\infty').replace(/\binf\b/gi, '\\infty');
    }));
    if (i > 0) hlines[i] = true;
    if (cells.length > maxCols) maxCols = cells.length;
    rows.push(cells);
  }
  if (rows.length === 0) return null;
  for (var r = 0; r < rows.length; r++) {
    while (rows[r].length < maxCols) rows[r].push('');
  }
  return {
    type: 'variation-table',
    vertAfterCols: { 0: true },
    hlinesBeforeRow: hlines,
    rows: rows,
    maxCols: maxCols,
    rawTex: specStr
  };
}

function formatCanvasMathText(str) {
  var s = String(str || '').trim();
  s = s.replace(/^\$+|\$+$/g, '');
  s = s.replace(/\\infty/g, '∞').replace(/\\pm/g, '±').replace(/\\pi/g, 'π');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '√$1');
  s = s.replace(/\\left|\\right/g, '');
  s = s.replace(/\\mathrm\{([^}]*)\}/g, '$1').replace(/\\text\{([^}]*)\}/g, '$1');
  s = s.replace(/-/g, '−');
  s = s.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return s;
}

function drawCanvasMathCell(ctx, rawText, cx, cy, fontSizePx) {
  var str = String(rawText || '').trim();
  if (!str) return { w: 0, h: 0 };
  var fracMatch = str.match(/^([+-]?)\s*\\frac\{([^{}]+)\}\{([^{}]+)\}$/);
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#111827';
  if (fracMatch) {
    var sign = fracMatch[1] === '-' ? '−' : (fracMatch[1] === '+' ? '+' : '');
    var num = formatCanvasMathText(fracMatch[2]);
    var den = formatCanvasMathText(fracMatch[3]);
    var smallSz = Math.round(fontSizePx * 0.82);
    ctx.font = 'italic ' + smallSz + 'px "Times New Roman", serif';
    var numW = ctx.measureText(num).width;
    var denW = ctx.measureText(den).width;
    var barW = Math.max(numW, denW) + 6;
    ctx.font = fontSizePx + 'px "Times New Roman", serif';
    var signW = sign ? ctx.measureText(sign).width + 2 : 0;
    var totalW = signW + barW;
    var barX = cx - totalW / 2 + signW;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (sign) {
      ctx.fillText(sign, barX - signW / 2 - 1, cy);
    }
    ctx.beginPath();
    ctx.lineWidth = 1.2;
    ctx.moveTo(barX, cy);
    ctx.lineTo(barX + barW, cy);
    ctx.stroke();
    ctx.font = 'italic ' + smallSz + 'px "Times New Roman", serif';
    ctx.fillText(num, barX + barW / 2, cy - smallSz * 0.62);
    ctx.fillText(den, barX + barW / 2, cy + smallSz * 0.68);
    ctx.restore();
    return { w: totalW + 8, h: fontSizePx * 1.9 };
  }
  var clean = formatCanvasMathText(str);
  var isItalic = /[a-zA-Z]/.test(clean) && !/^[+\-−∞0-9.,]+$/.test(clean);
  ctx.font = (isItalic ? 'italic ' : '') + fontSizePx + 'px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, cx, cy);
  var w = ctx.measureText(clean).width;
  ctx.restore();
  return { w: w + 8, h: fontSizePx * 1.1 };
}

function drawCanvasArrow(ctx, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var len = Math.hypot(dx, dy);
  if (len < 6) return;
  var angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = '#111827';
  ctx.fillStyle = '#111827';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - 5 * Math.cos(angle), y2 - 5 * Math.sin(angle));
  ctx.stroke();
  var headLen = 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 7), y2 - headLen * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 7), y2 - headLen * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function isArrowToken(s) {
  var t = String(s || '').trim();
  if (/\\nearrow|↗|\\uparrow|↑/.test(t)) return 'up';
  if (/\\searrow|↘|\\downarrow|↓/.test(t)) return 'down';
  if (/\\rightarrow|→/.test(t)) return 'flat';
  return null;
}

function isDoubleBarToken(s) {
  var t = String(s || '').trim();
  return t === '||' || t === '\\parallel' || t === 'KXĐ' || t === 'kxd' || /\|\|/.test(t);
}

function isHatchToken(s) {
  var t = String(s || '').trim();
  return /^(\[?HATCH\]?|\/\/\/+|\\hatch|gạch\s*chéo)$/i.test(t);
}

function drawHatchRect(ctx, x, y, w, h) {
  if (w <= 2 || h <= 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.05;
  var step = 7;
  for (var d = -h; d < w + h; d += step) {
    ctx.beginPath();
    ctx.moveTo(x + d, y + h);
    ctx.lineTo(x + d + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderVariationTableToPngDataUrl(block) {
  if (typeof document === 'undefined') return null;
  var rows = block.rows || [];
  var maxCols = block.maxCols || 1;
  if (rows.length === 0 || maxCols === 0) return null;

  var col0W = 68;
  var dataCols = Math.max(1, maxCols - 1);
  var cellW = Math.max(46, Math.min(72, Math.floor(460 / dataCols)));
  var totalW = col0W + dataCols * cellW + 24;

  var rowHeights = rows.map(function(row, idx) {
    var hasArr = row.some(function(c) { return !!isArrowToken(c); });
    if (hasArr) return 96;
    if (idx === rows.length - 1 && rows.length >= 3) return 86;
    return 36;
  });
  var totalH = rowHeights.reduce(function(a, b) { return a + b; }, 0) + 12;

  var dpr = 2.5;
  var canvas = document.createElement('canvas');
  canvas.width = Math.round(totalW * dpr);
  canvas.height = Math.round(totalH * dpr);
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);

  var padX = 12, padY = 6;
  var tableW = col0W + dataCols * cellW;
  var colCenters = [padX + col0W / 2];
  for (var c = 1; c < maxCols; c++) {
    colCenters.push(padX + col0W + (c - 0.5) * cellW);
  }

  var curY = padY;
  var rowTops = [];
  for (var r = 0; r < rows.length; r++) {
    rowTops.push(curY);
    curY += rowHeights[r];
  }
  var tableH = curY - padY;

  // Vẽ khung ngoài và vạch ngăn
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(padX, padY, tableW, tableH);

  for (var vc in block.vertAfterCols) {
    var colNum = Number(vc);
    if (colNum >= 0 && colNum < maxCols - 1) {
      var xLine = colNum === 0 ? (padX + col0W) : (padX + col0W + colNum * cellW);
      ctx.beginPath();
      ctx.moveTo(xLine, padY);
      ctx.lineTo(xLine, padY + tableH);
      ctx.stroke();
    }
  }
  for (var hr in block.hlinesBeforeRow) {
    var rNum = Number(hr);
    if (rNum > 0 && rNum < rows.length) {
      ctx.beginPath();
      ctx.moveTo(padX, rowTops[rNum]);
      ctx.lineTo(padX + tableW, rowTops[rNum]);
      ctx.stroke();
    }
  }

  // Vẽ nội dung từng dòng
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var rTop = rowTops[r];
    var rH = rowHeights[r];
    var rMid = rTop + rH / 2;
    var hasArrRow = row.some(function(c) { return !!isArrowToken(c); }) || (r === rows.length - 1 && rows.length >= 3);

    // Nhãn cột đầu
    drawCanvasMathCell(ctx, row[0], colCenters[0], rMid, 16);

    if (!hasArrRow) {
      for (var c = 1; c < maxCols; c++) {
        var cellTxt = (row[c] || '').trim();
        if (!cellTxt) continue;
        if (isHatchToken(cellTxt)) {
          var hx1 = c === 1 ? (padX + col0W) : (isDoubleBarToken(row[c - 1]) ? colCenters[c - 1] + 2.5 : (padX + col0W + (c - 1) * cellW));
          var hx2 = c === maxCols - 1 ? (padX + tableW) : (isDoubleBarToken(row[c + 1]) ? colCenters[c + 1] - 2.5 : (padX + col0W + c * cellW));
          drawHatchRect(ctx, hx1, rTop, Math.max(0, hx2 - hx1), rH);
        } else if (isDoubleBarToken(cellTxt)) {
          ctx.save();
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(colCenters[c] - 2.5, rTop);
          ctx.lineTo(colCenters[c] - 2.5, rTop + rH);
          ctx.moveTo(colCenters[c] + 2.5, rTop);
          ctx.lineTo(colCenters[c] + 2.5, rTop + rH);
          ctx.stroke();
          ctx.restore();
        } else {
          drawCanvasMathCell(ctx, cellTxt, colCenters[c], rMid, 15);
        }
      }
    } else {
      // Dòng biến thiên: xác định vị trí cao/thấp và mũi tên nối
      var nodes = [];
      for (var c = 1; c < maxCols; c++) {
        var txt = (row[c] || '').trim();
        if (!txt || isArrowToken(txt)) continue;
        if (isHatchToken(txt)) {
          var hyx1 = c === 1 ? (padX + col0W) : (isDoubleBarToken(row[c - 1]) ? colCenters[c - 1] + 2.5 : (padX + col0W + (c - 1) * cellW));
          var hyx2 = c === maxCols - 1 ? (padX + tableW) : (isDoubleBarToken(row[c + 1]) ? colCenters[c + 1] - 2.5 : (padX + col0W + c * cellW));
          drawHatchRect(ctx, hyx1, rTop, Math.max(0, hyx2 - hyx1), rH);
          continue;
        }
        var leftArr = null, rightArr = null;
        for (var l = c - 1; l >= 1; l--) {
          var la = isArrowToken(row[l]);
          if (la) { leftArr = la; break; }
          if ((row[l] || '').trim()) break;
        }
        for (var ri = c + 1; ri < maxCols; ri++) {
          var ra = isArrowToken(row[ri]);
          if (ra) { rightArr = ra; break; }
          if ((row[ri] || '').trim()) break;
        }

        var yPosLevel = function(dirL, dirR, valStr) {
          if (dirL === 'up' && dirR === 'down') return rTop + 20;
          if (dirL === 'down' && dirR === 'up') return rTop + rH - 20;
          if (dirL === 'up') return rTop + 20;
          if (dirL === 'down') return rTop + rH - 20;
          if (dirR === 'down') return rTop + 20;
          if (dirR === 'up') return rTop + rH - 20;
          if (/^\+?\\infty/.test(valStr)) return rTop + 20;
          if (/^-\\infty/.test(valStr)) return rTop + rH - 20;
          return rMid;
        };

        if (isDoubleBarToken(txt)) {
          ctx.save();
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(colCenters[c] - 2.5, rTop);
          ctx.lineTo(colCenters[c] - 2.5, rTop + rH);
          ctx.moveTo(colCenters[c] + 2.5, rTop);
          ctx.lineTo(colCenters[c] + 2.5, rTop + rH);
          ctx.stroke();
          ctx.restore();
          var splitSides = txt.split(/\|\||\\parallel/);
          var lSide = (splitSides[0] || '').trim();
          var rSide = (splitSides[1] || '').trim();
          var lHatched = c > 1 && isHatchToken(row[c - 1]);
          var rHatched = c < maxCols - 1 && isHatchToken(row[c + 1]);
          var ly = yPosLevel(leftArr, null, lSide);
          var ry = yPosLevel(null, rightArr, rSide);
          if (lSide && !lHatched && !isHatchToken(lSide)) drawCanvasMathCell(ctx, lSide, colCenters[c] - 18, ly, 14);
          if (rSide && !rHatched && !isHatchToken(rSide)) drawCanvasMathCell(ctx, rSide, colCenters[c] + 18, ry, 14);
          if (lSide || rSide) {
            if (!rHatched) {
              nodes.push({ col: c, outX: colCenters[c] + (rSide ? 32 : 10), outY: ry, inX: colCenters[c] - (lSide ? 32 : 10), inY: ly });
            } else if (!lHatched) {
              nodes.push({ col: c, outX: null, outY: ry, inX: colCenters[c] - (lSide ? 32 : 10), inY: ly });
            }
          }
        } else {
          var ny = yPosLevel(leftArr, rightArr, txt);
          var box = drawCanvasMathCell(ctx, txt, colCenters[c], ny, 15);
          var halfBox = Math.max(12, box.w / 2 + 4);
          nodes.push({ col: c, outX: colCenters[c] + halfBox, outY: ny, inX: colCenters[c] - halfBox, inY: ny });
        }
      }
      var doubleBarCols = {};
      for (var rIdx = 0; rIdx < rows.length; rIdx++) {
        for (var cIdx = 0; cIdx < (rows[rIdx] || []).length; cIdx++) {
          if (isDoubleBarToken(rows[rIdx][cIdx])) {
            doubleBarCols[cIdx] = true;
          }
        }
      }
      for (var ni = 0; ni < nodes.length - 1; ni++) {
        var n1 = nodes[ni], n2 = nodes[ni + 1];
        if (n1.outX !== null && n2.inX !== null) {
          var hasBarBetween = false;
          var minC = Math.min(n1.col, n2.col);
          var maxC = Math.max(n1.col, n2.col);
          for (var ck = minC + 1; ck <= maxC - 1; ck++) {
            if (doubleBarCols[ck]) { hasBarBetween = true; break; }
          }
          if (!hasBarBetween && !doubleBarCols[n1.col] && !doubleBarCols[n2.col]) {
            drawCanvasArrow(ctx, n1.outX, n1.outY, n2.inX, n2.inY);
          }
        }
      }
    }
  }

  return { dataUrl: canvas.toDataURL('image/png'), pxW: totalW, pxH: totalH };
}

function renderGraphToPngDataUrl(specStr) {
  if (typeof document === 'undefined') return null;
  var raw = String(specStr || '').trim();
  var segments = raw.split('|').map(function(s) { return s.trim(); }).filter(Boolean);
  var funcsPart = segments[0] || 'x^3 - 3x + 2';
  var xMin = -4, xMax = 4, yMin = -4, yMax = 4;

  for (var i = 1; i < segments.length; i++) {
    var xm = segments[i].match(/^x\s*=\s*\[?\s*(-?\d+(?:\.\d+)?)\s*(?:\.\.|,|;)\s*(-?\d+(?:\.\d+)?)\s*\]?$/i);
    if (xm) { xMin = parseFloat(xm[1]); xMax = parseFloat(xm[2]); }
    var ym = segments[i].match(/^y\s*=\s*\[?\s*(-?\d+(?:\.\d+)?)\s*(?:\.\.|,|;)\s*(-?\d+(?:\.\d+)?)\s*\]?$/i);
    if (ym) { yMin = parseFloat(ym[1]); yMax = parseFloat(ym[2]); }
  }
  if (xMax <= xMin) { xMin = -4; xMax = 4; }
  if (yMax <= yMin) { yMin = -4; yMax = 4; }

  var funcExprs = funcsPart.split(';').map(function(s) { return s.trim(); }).filter(Boolean);
  var compiled = funcExprs.map(compileMathExpr);

  var W = 380, H = 320;
  var dpr = 2.5;
  var canvas = document.createElement('canvas');
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  var pad = 28;
  var plotW = W - 2 * pad, plotH = H - 2 * pad;
  var toPx = function(x) { return pad + ((x - xMin) / (xMax - xMin)) * plotW; };
  var toPy = function(y) { return pad + ((yMax - y) / (yMax - yMin)) * plotH; };

  // Lưới tọa độ
  var stepX = (xMax - xMin) > 12 ? 2 : 1;
  var stepY = (yMax - yMin) > 12 ? 2 : 1;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.8;
  for (var gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx += stepX) {
    ctx.beginPath();
    ctx.moveTo(toPx(gx), pad);
    ctx.lineTo(toPx(gx), pad + plotH);
    ctx.stroke();
  }
  for (var gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy += stepY) {
    ctx.beginPath();
    ctx.moveTo(pad, toPy(gy));
    ctx.lineTo(pad + plotW, toPy(gy));
    ctx.stroke();
  }

  // Trục Ox và Oy
  var oxY = (yMin <= 0 && yMax >= 0) ? toPy(0) : (pad + plotH);
  var oyX = (xMin <= 0 && xMax >= 0) ? toPx(0) : pad;
  drawCanvasArrow(ctx, pad - 10, oxY, pad + plotW + 14, oxY);
  drawCanvasArrow(ctx, oyX, pad + plotH + 10, oyX, pad - 14);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic 15px "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('x', pad + plotW + 6, oxY + 13);
  ctx.fillText('y', oyX + 10, pad - 10);
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    ctx.fillText('O', oyX - 14, oxY + 13);
  }

  // Vạch chia & số
  ctx.font = '11px "Times New Roman", serif';
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  for (var tx = Math.ceil(xMin); tx <= Math.floor(xMax); tx += stepX) {
    if (tx === 0) continue;
    var px = toPx(tx);
    ctx.beginPath(); ctx.moveTo(px, oxY - 3); ctx.lineTo(px, oxY + 3); ctx.stroke();
    ctx.fillText(String(tx), px, oxY + 12);
  }
  ctx.textAlign = 'right';
  for (var ty = Math.ceil(yMin); ty <= Math.floor(yMax); ty += stepY) {
    if (ty === 0) continue;
    var py = toPy(ty);
    ctx.beginPath(); ctx.moveTo(oyX - 3, py); ctx.lineTo(oyX + 3, py); ctx.stroke();
    ctx.fillText(String(ty), oyX - 6, py);
  }

  // Vẽ đồ thị từng hàm số & tự phát hiện tiệm cận đứng đơn giản
  var colors = ['#1e3a8a', '#dc2626', '#059669'];
  var spanY = yMax - yMin;
  ctx.save();
  ctx.beginPath();
  ctx.rect(pad, pad, plotW, plotH);
  ctx.clip();

  for (var ci = 0; ci < compiled.length; ci++) {
    var f = compiled[ci];
    var analysis = analyzeMathFunction(funcExprs[ci]);
    ctx.strokeStyle = colors[ci % colors.length];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    var drawing = false;
    var prevVal = NaN;
    var prevXVal = NaN;
    var N = 800;
    var poles = analysis && analysis.poles ? analysis.poles.slice() : [];
    for (var sIdx = 0; sIdx <= N; sIdx++) {
      var xVal = xMin + (sIdx / N) * (xMax - xMin);
      var yVal = f(xVal);
      if (!Number.isFinite(yVal)) {
        if (Number.isFinite(prevVal) && Math.abs(prevVal) > spanY * 1.5) {
          if (!poles.some(function(p) { return Math.abs(p - xVal) < 0.15; })) poles.push(xVal);
        }
        drawing = false;
        prevVal = NaN;
        prevXVal = xVal;
        continue;
      }
      var jump = Number.isFinite(prevVal) && Math.abs(yVal - prevVal) > spanY * 0.65 && (yVal * prevVal < 0 || Math.abs(yVal) > spanY * 2);
      if (jump) {
        var poleEst = Number.isFinite(prevXVal) ? (prevXVal + xVal) / 2 : xVal;
        if (!poles.some(function(p) { return Math.abs(p - poleEst) < 0.15; })) poles.push(poleEst);
        drawing = false;
      }
      if (yVal < yMin - spanY * 0.8 || yVal > yMax + spanY * 0.8) {
        drawing = false;
        prevVal = yVal;
        prevXVal = xVal;
        continue;
      }
      var cpx = toPx(xVal), cpy = toPy(yVal);
      if (!drawing) {
        ctx.moveTo(cpx, cpy);
        drawing = true;
      } else {
        ctx.lineTo(cpx, cpy);
      }
      prevVal = yVal;
      prevXVal = xVal;
    }
    ctx.stroke();

    // Thu thập tiệm cận ngang / xiên (symbolic ưu tiên, dự phòng số học cho hàm hữu tỉ tổng quát)
    var slantLines = [];
    if (analysis && typeof analysis.asymptoteK === 'number' && typeof analysis.asymptoteQ === 'number') {
      slantLines.push({ k: analysis.asymptoteK, q: analysis.asymptoteQ });
    } else {
      var checkSideAsymptote = function(signDir) {
        var xA = signDir * 600, xB = signDir * 1200;
        var yA = f(xA), yB = f(xB);
        if (!Number.isFinite(yA) || !Number.isFinite(yB)) return;
        var kEst = (yB - yA) / (xB - xA);
        if (!Number.isFinite(kEst) || Math.abs(kEst) >= 50) return;
        if (Math.abs(kEst) < 1e-4) kEst = 0;
        var qEst = yB - kEst * xB;
        if (!Number.isFinite(qEst)) return;
        var resFar = Math.abs(f(signDir * 300) - (kEst * signDir * 300 + qEst));
        if (resFar > 0.25) return;
        var maxMidDiff = 0;
        var testPts = [-1.7, 0.3, 2.7, 15];
        for (var tp = 0; tp < testPts.length; tp++) {
          var tv = f(testPts[tp]);
          if (Number.isFinite(tv)) maxMidDiff = Math.max(maxMidDiff, Math.abs(tv - (kEst * testPts[tp] + qEst)));
        }
        if (maxMidDiff < 1e-5) return; // Đường thẳng thuần túy không phải tiệm cận
        if (!slantLines.some(function(sl) { return Math.abs(sl.k - kEst) < 1e-3 && Math.abs(sl.q - qEst) < 1e-2; })) {
          slantLines.push({ k: kEst, q: qEst });
        }
      };
      checkSideAsymptote(1);
      checkSideAsymptote(-1);
    }

    // Vẽ đường nét đứt tiệm cận đứng (TCĐ), tiệm cận ngang (TCN) và tiệm cận xiên (TCX)
    if ((poles.length > 0 && poles.length <= 3) || slantLines.length > 0) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.1;
      for (var pi = 0; pi < poles.length && pi < 3; pi++) {
        var axPx = toPx(poles[pi]);
        ctx.beginPath(); ctx.moveTo(axPx, pad); ctx.lineTo(axPx, pad + plotH); ctx.stroke();
      }
      for (var si = 0; si < slantLines.length; si++) {
        var sl = slantLines[si];
        ctx.beginPath();
        ctx.moveTo(toPx(xMin), toPy(sl.k * xMin + sl.q));
        ctx.lineTo(toPx(xMax), toPy(sl.k * xMax + sl.q));
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();

  return { dataUrl: canvas.toDataURL('image/png'), pxW: W, pxH: H };
}

function rasterizeSvgOrImageToPng(block) {
  return new Promise(function(resolve) {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    var img = new Image();
    var blobUrl = null;
    img.onload = function() {
      var natW = img.naturalWidth || img.width || 360;
      var natH = img.naturalHeight || img.height || 260;
      var scale = block.kind === 'svg'
        ? Math.max(2.5, Math.min(4, 1100 / Math.max(natW, 1)))
        : (natW < 420 ? 2 : 1);
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(natW * scale);
      canvas.height = Math.round(natH * scale);
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      var dispW = block.kind === 'svg'
        ? Math.min(natW, 380)
        : (natW > 560 ? Math.min(Math.round(natW / 2.2), 400) : natW);
      var dispH = Math.round(dispW * (natH / Math.max(natW, 1)));
      resolve({ dataUrl: canvas.toDataURL('image/png'), pxW: dispW, pxH: dispH });
    };
    img.onerror = function() {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve(null);
    };
    if (block.kind === 'svg') {
      var svgStr = block.svg;
      if (!/xmlns=/.test(svgStr)) svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      var blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
    } else {
      img.src = block.src;
    }
  });
}

function extractChoices(lines) {
  if (!lines || lines.length === 0) return null;
  var joined = lines.join(' ').trim();
  // Che tạm công thức $...$ / $$...$$ để dấu A., B., C., D. bên trong công thức không cắt nhầm đáp án
  var mathHolders = [];
  var masked = joined.replace(/\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$)/g, function(m) {
    var idx = mathHolders.length;
    mathHolders.push(m);
    return '\uE004M' + idx + '\uE005';
  });

  var regex = /(?:^|\s)((?:<u>|\*{1,2})?\s*([A-D])\.\s*(?:<\/u>|\*{1,2})?)\s*([\s\S]*?)(?=(?:\s+(?:<u>|\*{1,2})?[A-D]\.(?:\s|<\/u>|\*{1,2}|\$|$)|$))/g;
  var matches = [];
  var m;
  while ((m = regex.exec(masked)) !== null) {
    var rawMarker = m[1] || '';
    var label = m[2].toUpperCase();
    var isMarkedCorrect = /<u>/i.test(rawMarker) || (/^\s*\*(?!\*)/.test(rawMarker));
    var optText = (m[3] || '').replace(/\uE004M(\d+)\uE005/g, function(_, idx) {
      return mathHolders[Number(idx)];
    }).trim().replace(/^<\/?(?:u|b|strong)>\s*|\s*<\/?(?:u|b|strong)>$/gi, '').replace(/^\*\*|\*\*$/g, '').trim();
    matches.push({ label: label, text: optText, correct: isMarkedCorrect });
  }
  if (matches.length === 4 &&
      matches[0].label === 'A' &&
      matches[1].label === 'B' &&
      matches[2].label === 'C' &&
      matches[3].label === 'D') {
    return matches;
  }
  return null;
}

function parseMarkdownTable(lines) {
  var rows = [];
  for (var j = 0; j < lines.length; j++) {
    var line = lines[j].trim();
    if (!line) continue;
    if (line.match(/^\|?[\s\-:|]+\|?$/)) continue;
    var cells;
    if (line.indexOf('|') !== -1) {
      var trimmed = line.replace(/^\|/, '').replace(/\|$/, '');
      cells = trimmed.split('|').map(function(c) { return c.trim(); });
    } else if (line.indexOf('\t') !== -1) {
      cells = line.split('\t').map(function(c) { return c.trim(); });
    } else {
      continue;
    }
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0) return { type: 'table', header: [], rows: [] };
  var maxCols = 0;
  for (var r = 0; r < rows.length; r++) {
    if (rows[r].length > maxCols) maxCols = rows[r].length;
  }
  for (var r2 = 0; r2 < rows.length; r2++) {
    while (rows[r2].length < maxCols) rows[r2].push('');
  }
  return { type: 'table', header: rows[0] || [], rows: rows.slice(1) };
}

function splitTextWithSpecialVisuals(text, imageMap) {
  imageMap = imageMap || {};
  var regex = /\$\$?\s*(\\begin\{array\}\{[^}]*\}[\s\S]*?\\end\{array\})\s*\$?\$|\[BBT:\s*((?:\[HATCH\]|[^\]])+)\]|\[(?:GRAPH|DO_THI):\s*([^\]]+)\]|\[IMG:([a-zA-Z0-9_-]+)\]|!\[([^\]]*)\]\((data:image\/[^)]+)\)|(<svg\b[\s\S]*?<\/svg>)/gi;
  var segments = [];
  var lastIdx = 0;
  var m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      var before = text.slice(lastIdx, m.index).trim();
      if (before) segments.push({ kind: 'text', text: before });
    }
    if (m[1]) {
      var tbl = parseLatexArrayTable(m[1]);
      segments.push(tbl ? { kind: 'block', block: tbl } : { kind: 'text', text: m[0] });
    } else if (m[2]) {
      var bbt = parseBbtShorthand(m[2]);
      segments.push(bbt ? { kind: 'block', block: bbt } : { kind: 'text', text: m[0] });
    } else if (m[3]) {
      segments.push({ kind: 'block', block: { type: 'math-graph', spec: m[3].trim() } });
    } else if (m[4]) {
      var imgSrc = imageMap[m[4]];
      if (imgSrc) {
        segments.push({ kind: 'block', block: { type: 'math-image', kind: 'dataurl', src: imgSrc, alt: m[4] } });
      }
    } else if (m[5] !== undefined && m[6]) {
      segments.push({ kind: 'block', block: { type: 'math-image', kind: 'dataurl', src: m[6], alt: m[5] } });
    } else if (m[7]) {
      segments.push({ kind: 'block', block: { type: 'math-image', kind: 'svg', svg: m[7], alt: 'SVG Figure' } });
    } else if (m[8]) {
      var tikzImg = imageMap["tikz_" + segments.length] || imageMap["fig_" + segments.length];
      if (tikzImg) {
        segments.push({ kind: "block", block: { type: "math-image", kind: "dataurl", src: tikzImg, alt: "Hình vẽ TikZ" } });
      }
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    var after = text.slice(lastIdx).trim();
    if (after) segments.push({ kind: 'text', text: after });
  }
  return segments;
}

function hasSpecialVisualMarker(str) {
  if (!str) return false;
  return /\\begin\{array\}|\[(?:BBT|GRAPH|DO_THI|IMG):|!\[[^\]]*\]\(data:image\/|<svg\b/i.test(str);
}

function postProcessVisualBlocks(rawBlocks, imageMap) {
  var result = [];
  for (var b = 0; b < rawBlocks.length; b++) {
    var blk = rawBlocks[b];
    if (blk.type === 'display-math' && /\\begin\{array\}/.test(blk.content)) {
      var directTbl = parseLatexArrayTable(blk.content);
      if (directTbl) {
        result.push(directTbl);
        continue;
      }
    }
    if ((blk.type === 'question' || blk.type === 'mcq-question') && hasSpecialVisualMarker(blk.body)) {
      var segs = splitTextWithSpecialVisuals(blk.body, imageMap);
      var usedPrefix = false;
      for (var s = 0; s < segs.length; s++) {
        if (segs[s].kind === 'block') {
          if (!usedPrefix) {
            result.push({ type: 'question', prefix: blk.prefix, body: '', italic: blk.italic });
            usedPrefix = true;
          }
          result.push(segs[s].block);
        } else {
          if (!usedPrefix) {
            result.push({ type: 'question', prefix: blk.prefix, body: segs[s].text, italic: blk.italic });
            usedPrefix = true;
          } else {
            result.push({ type: 'paragraph', content: segs[s].text, italic: blk.italic });
          }
        }
      }
      if (!usedPrefix) result.push({ type: 'question', prefix: blk.prefix, body: '', italic: blk.italic });
      if (blk.type === 'mcq-question') {
        result.push({ type: 'mcq-choices', choices: blk.choices });
      }
      continue;
    } else if ((blk.type === 'paragraph' || blk.type === 'solution-header' || blk.type === 'bullet' || blk.type === 'tf-item') && hasSpecialVisualMarker(blk.content)) {
      var pSegs = splitTextWithSpecialVisuals(blk.content, imageMap);
      var firstText = true;
      for (var p = 0; p < pSegs.length; p++) {
        if (pSegs[p].kind === 'block') {
          result.push(pSegs[p].block);
        } else if (firstText && blk.type === 'tf-item') {
          result.push({ type: 'tf-item', label: blk.label, content: pSegs[p].text });
          firstText = false;
        } else if (firstText && blk.type === 'bullet') {
          result.push({ type: 'bullet', content: pSegs[p].text });
          firstText = false;
        } else {
          result.push({ type: 'paragraph', content: pSegs[p].text, italic: blk.italic });
          firstText = false;
        }
      }
      continue;
    }
    result.push(blk);
  }
  return result;
}

function parseAndAlignContent(rawText, imageMap) {
  imageMap = imageMap || {};
  var normalized = normalizeLatexForToggleTex(rawText);

  // Tách trước các khối nhiều dòng đặc biệt: <svg>...</svg> và tkz-tab
  var preBlocks = [];
  var multiRegex = /(<svg\b[\s\S]*?<\/svg>)|(\\begin\{tikzpicture\}[\s\S]*?\\tkzTabInit[\s\S]*?\\end\{tikzpicture\}|\\tkzTabInit[\s\S]*?\\tkzTabVar\{[^}]*\}(?:\{[^}]*\})*)/gi;
  var lastPos = 0;
  var mm;
  var preparedLines = [];
  while ((mm = multiRegex.exec(normalized)) !== null) {
    if (mm.index > lastPos) {
      preparedLines.push(normalized.slice(lastPos, mm.index));
    }
    var holderKey = '__PRE_VISUAL_BLOCK_' + preBlocks.length + '__';
    if (mm[1]) {
      preBlocks.push({ type: 'math-image', kind: 'svg', svg: mm[1], alt: 'SVG Figure' });
    } else if (mm[2]) {
      var tkz = parseTkzTab(mm[2]);
      preBlocks.push(tkz || { type: 'paragraph', content: mm[2] });
    }
    preparedLines.push('\n' + holderKey + '\n');
    lastPos = mm.index + mm[0].length;
  }
  if (lastPos < normalized.length) {
    preparedLines.push(normalized.slice(lastPos));
  }

  var lines = preparedLines.join('').split(/\r?\n/);
  var blocks = [];
  var i = 0;

  while (i < lines.length) {
    var line = lines[i].trim();
    if (!line || /^\s*<!--[\s\S]*?-->\s*$/.test(line) || /^\s*<!--\s*\/?FIG/i.test(line)) {
      i++;
      continue;
    }

    var preM = line.match(/^__PRE_VISUAL_BLOCK_(\d+)__$/);
    if (preM) {
      blocks.push(preBlocks[Number(preM[1])]);
      i++;
      continue;
    }

    // Bỏ qua đường kẻ ngang Markdown (---, ***, ___)
    if (/^([-*_])\1{2,}$/.test(line.replace(/\s+/g, ''))) {
      i++;
      continue;
    }

    var isPipeTableLine = function(ln) {
      if (!ln) return false;
      if (/^(?:<u>|\*{1,2})?(?:[A-D]\.|[a-d]\)|Câu|Bài)/i.test(ln)) return false;
      var noMath = ln.replace(/\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$)/g, ' ');
      var trMath = noMath.trim();
      var pipes = (trMath.match(/\|/g) || []).length;
      return (trMath.startsWith('|') && trMath.endsWith('|')) || pipes >= 2;
    };
    var isTabTableLine = function(ln) {
      return !!ln && (ln.match(/\t/g) || []).length >= 2 && !/^(?:<u>|\*{1,2})?[A-D]\./i.test(ln);
    };

    if (isPipeTableLine(line)) {
      var tableLines = [];
      while (i < lines.length && isPipeTableLine(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        blocks.push(parseMarkdownTable(tableLines));
        continue;
      }
    }
    if (isTabTableLine(line) && i + 1 < lines.length && isTabTableLine(lines[i + 1].trim())) {
      var tabLines = [];
      while (i < lines.length && isTabTableLine(lines[i].trim())) {
        tabLines.push(lines[i].trim());
        i++;
      }
      blocks.push(parseMarkdownTable(tabLines));
      continue;
    }

    if (line.startsWith('$$')) {
      var formula = line;
      if (!line.endsWith('$$') || line === '$$') {
        i++;
        while (i < lines.length && !lines[i].includes('$$')) {
          formula += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          formula += '\n' + lines[i];
          i++;
        }
      } else {
        i++;
      }
      blocks.push({ type: 'display-math', content: formula.replace(/^\$\$|\$\$$/g, '').trim() });
      continue;
    }

    // Kiểm tra Câu hỏi TRƯỚC Heading để "### Câu 1:" hoặc "**Câu 1:**" KHÔNG bị tách thành tiêu đề đứng riêng
    var cleanQCandidate = line.replace(/^#{1,4}\s+/, '').trim();
    var qMatch = cleanQCandidate.match(/^(\s*\*{1,2})?(Câu|Bài|Ví dụ|Dạng)\s+(\d+)([\.:\s-]+)(\*{1,2})?\s*(.*)$/i);
    if (qMatch) {
      var openStars = (qMatch[1] || '').trim();
      var closeStars = (qMatch[5] || '').trim();
      var qPrefix = qMatch[2] + ' ' + qMatch[3] + '.';
      var qBody = (qMatch[6] || '').trim();
      var qItalic = false;

      if (openStars === '*' && !closeStars) {
        qItalic = true;
        if (/[^*]\*$/.test(qBody) || qBody === '*') {
          qBody = qBody.slice(0, -1).trim();
        }
      } else if (openStars === '**' && !closeStars && qBody.endsWith('**')) {
        qBody = qBody.slice(0, -2).trim();
      }
      qBody = qBody.replace(/^\*(?!\*)/, '').replace(/(?<!\*)\*$/, '').trim();

      var isChoiceRowLine = function(ln) {
        if (!ln) return false;
        if (/^\s*(?:<u>|\*{1,2})?[A-D]\.(?:<\/u>|\*{1,2})?(?:\s|$)/i.test(ln)) return true;
        var tmp = ln.replace(/\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$)/g, ' ');
        return (tmp.match(/\b[A-D]\./g) || []).length >= 2;
      };

      // Gộp dòng thân câu hỏi (kể cả khi "Câu 1:" đứng riêng ở dòng trên) và tìm bộ 4 đáp án A. B. C. D.
      var stemExtraLines = [];
      var choiceLines = [];
      var nextIdx = i + 1;
      while (nextIdx < lines.length) {
        var nextLine = lines[nextIdx].trim();
        if (!nextLine) {
          // Nếu Câu X: chưa có nội dung thân câu hỏi, cho phép vượt qua 1 dòng trống để ghép liền mạch
          if (!qBody && stemExtraLines.length === 0 && choiceLines.length === 0 && nextIdx + 1 < lines.length && lines[nextIdx + 1].trim()) {
            nextIdx++;
            continue;
          }
          if (choiceLines.length > 0) {
            nextIdx++;
            continue;
          }
          break;
        }
        if (/^__PRE_VISUAL_BLOCK_\d+__$/.test(nextLine)) break;
        if (/^([-*_])\1{2,}$/.test(nextLine.replace(/\s+/g, ''))) break;
        if (isPipeTableLine(nextLine) || isTabTableLine(nextLine)) break;
        if (nextLine.replace(/^#{1,4}\s+/, '').match(/^(\*{1,2})?(Câu|Bài|Ví dụ|Dạng|PHẦN|HƯỚNG DẪN GIẢI|Lời giải|Hướng dẫn giải|Giải|Đáp án chi tiết|#)/i)) break;
        if (nextLine.match(/^[-*+]\s+/) || nextLine.match(/^\*{0,2}[a-d]\)\*{0,2}\s+/)) break;

        if (isChoiceRowLine(nextLine)) {
          choiceLines.push(nextLine);
          nextIdx++;
        } else if (choiceLines.length === 0) {
          stemExtraLines.push(nextLine);
          nextIdx++;
        } else {
          break;
        }
      }

      var fullStem = stemExtraLines.length > 0 ? (qBody ? qBody + ' ' + stemExtraLines.join(' ') : stemExtraLines.join(' ')) : qBody;
      var choices = extractChoices(choiceLines);
      if (choices && choices.length === 4) {
        blocks.push({ type: 'mcq-question', prefix: qPrefix, body: fullStem, choices: choices, italic: qItalic });
        i = nextIdx;
        continue;
      } else {
        // Vẫn giữ toàn bộ fullStem nối liền sau "Câu X." ngay cả khi phía sau là Hình/Bảng rồi mới tới A. B. C. D.
        blocks.push({ type: 'question', prefix: qPrefix, body: fullStem, italic: qItalic });
        i = nextIdx;
        continue;
      }
    }

    // Nhóm các đáp án A. B. C. D. đứng độc lập ngay sau hình ảnh / bảng biểu
    var standaloneChoiceCheck = function(ln) {
      if (!ln) return false;
      if (/^\s*(?:<u>|\*{1,2})?[A-D]\.(?:<\/u>|\*{1,2})?(?:\s|$)/i.test(ln)) return true;
      var tmp = ln.replace(/\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)(?:\\.|[^\\\$\n])+?(?<!\$)\$(?!\$)/g, ' ');
      return (tmp.match(/\b[A-D]\./g) || []).length >= 2;
    };
    if (standaloneChoiceCheck(line)) {
      var scLines = [line];
      var scIdx = i + 1;
      while (scIdx < lines.length) {
        var scNext = lines[scIdx].trim();
        if (!scNext) { scIdx++; continue; }
        if (/^__PRE_VISUAL_BLOCK_\d+__$/.test(scNext)) break;
        if (scNext.replace(/^#{1,4}\s+/, '').match(/^(\*{1,2})?(Câu|Bài|Ví dụ|Dạng|PHẦN|HƯỚNG DẪN GIẢI|Lời giải|Hướng dẫn giải|Giải|Đáp án chi tiết|#)/i)) break;
        if (standaloneChoiceCheck(scNext)) {
          scLines.push(scNext);
          scIdx++;
        } else {
          break;
        }
      }
      var scChoices = extractChoices(scLines);
      if (scChoices && scChoices.length === 4) {
        blocks.push({ type: 'mcq-choices', choices: scChoices });
        i = scIdx;
        continue;
      }
    }

    var headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2].trim() });
      i++;
      continue;
    }

    var partMatch = line.match(/^(\*{1,2})?(PHẦN\s+[IVX\d]+[\.:\s].*?)(\*{1,2})?$/i);
    if (partMatch) {
      blocks.push({ type: 'exam-part', content: partMatch[2].trim() });
      i++;
      continue;
    }

    // Tiêu đề phần đáp án / hướng dẫn giải chi tiết đứng riêng (không chèn dấu hai chấm thừa)
    var guideTitleMatch = line.match(/^(\*{1,2})?(HƯỚNG DẪN GIẢI(?:\s+CHI\s+TIẾT)?|ĐÁP ÁN(?:\s+CHI\s+TIẾT)?|BÀI GIẢI(?:\s+CHI\s+TIẾT)?)(\*{1,2})?$/i);
    if (guideTitleMatch) {
      blocks.push({ type: 'exam-part', content: guideTitleMatch[2].trim() });
      i++;
      continue;
    }

    // Mục Đúng/Sai a) b) c) d) (kể cả **a)**)
    var tfMatch = line.match(/^\*{0,2}([a-d]\))\*{0,2}\s+(.*)$/);
    if (tfMatch) {
      blocks.push({ type: 'tf-item', label: tfMatch[1], content: tfMatch[2].trim() });
      i++;
      continue;
    }

    // Bullet list - ... / * ...
    var bulletMatch = line.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', content: bulletMatch[1].trim() });
      i++;
      continue;
    }

    var solMatch = line.match(/^(\s*\*{1,2})?(Lời giải|Hướng dẫn giải|Giải|Đáp án chi tiết)(\*{1,2})?[\.:\s-]+(\*{1,2})?\s*(.*)$/i);
    if (solMatch) {
      var rest = (solMatch[5] || '').replace(/^\*{1,2}|\*{1,2}$/g, '').trim();
      blocks.push({ type: 'solution-header', content: solMatch[2] + (rest ? ': ' + rest : ':') });
      i++;
      continue;
    }

    var ansPickMatch = line.match(/^(\*{1,2})?(Chọn\s+[A-D]|Đáp án\s*:\s*[A-D])[\.:\s]?(.*?)(\*{1,2})?$/i);
    if (ansPickMatch) {
      blocks.push({ type: 'answer-choice', content: line.replace(/^\*{1,2}|\*{1,2}$/g, '').trim() });
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', content: line });
    i++;
  }

  return postProcessVisualBlocks(blocks, imageMap);
}

function estimateVisualLength(text) {
  var raw = String(text || '');
  if (!raw) return 0;
  var s = raw
    .replace(/\\overrightarrow\{([^}]*)\}/g, '$1')
    .replace(/\\overline\{([^}]*)\}/g, '$1')
    .replace(/\\widehat\{([^}]*)\}/g, '$1')
    .replace(/\\vec\{([^}]*)\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, function(_, a, b) {
      return a.length >= b.length ? a : b;
    })
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, function(_, a, b) {
      return a.length >= b.length ? a : b;
    })
    .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
    .replace(/\\(left|right|mathrm|text|mathbf|mathbb|sin|cos|tan|cot|log|ln|lim|sum|int|mid|cdot|times|pi|infty)\b/g, ' ')
    .replace(/[{}$\\^_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length;
}

function determineBtproChoiceLayout(choices) {
  var maxLen = 0;
  for (var j = 0; j < choices.length; j++) {
    var vLen = estimateVisualLength(choices[j].text);
    if (vLen > maxLen) maxLen = vLen;
  }
  // Chuẩn BTPro2020 (macro CH_345 kind=3 trang A4: < 24 -> 4 cột, < 45 -> 2 cột, còn lại -> 1 cột)
  if (maxLen < 24) return 4;
  if (maxLen < 45) return 2;
  return 1;
}

// ============================================================================
// 3. TẠO FILE WORD .DOCX (KẾT HỢP WORD EQUATION OMML TỰ ĐỘNG HOẶC TOGGLE TEX)
// ============================================================================
function renderTokensToXml(tokens, defaultOpts, mathMode, texDelimiter) {
  defaultOpts = defaultOpts || {};
  var xml = '';
  var szVal = defaultOpts.fontSize ? defaultOpts.fontSize * 2 : 24;
  var useParensTex = texDelimiter !== 'dollar';

  for (var j = 0; j < tokens.length; j++) {
    var t = tokens[j];

    if (t.math && mathMode === 'omml') {
      var rawTex = t.text.replace(/^\$\$?|\$\$?$/g, '');
      var ommlXml = latexToOmml(rawTex, false, szVal);
      if (ommlXml) {
        xml += ommlXml;
        continue;
      }
    }

    var textOut = t.text;
    if (t.math && mathMode === 'toggletex' && !/^\\\[/.test(textOut)) {
      var innerTex = textOut.replace(/^\$\$?|\$\$?$/g, '').trim();
      textOut = useParensTex ? ('\\(' + innerTex + '\\)') : ('$' + innerTex + '$');
    }

    var isBold = t.bold || defaultOpts.bold;
    var isItalic = t.italic || defaultOpts.italic;
    var isUnderline = t.underline || defaultOpts.underline;
    var color = t.color || defaultOpts.color || null;

    var rPr = '<w:rPr>';
    rPr += '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>';
    if (isBold) rPr += '<w:b/><w:bCs/>';
    if (isItalic) rPr += '<w:i/><w:iCs/>';
    if (isUnderline) rPr += '<w:u w:val="single"/>';
    if (color) rPr += '<w:color w:val="' + color + '"/>';
    rPr += '<w:sz w:val="' + szVal + '"/><w:szCs w:val="' + szVal + '"/>';
    rPr += '</w:rPr>';

    xml += '<w:r>' + rPr + '<w:t xml:space="preserve">' + escapeXml(textOut) + '</w:t></w:r>';
  }
  return xml;
}

function renderChoicesWithTabsXml(choices, layout, fontSize, lineDxa, mathMode, texDelimiter) {
  var szVal = fontSize * 2;
  var tabRun = '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="' + szVal + '"/><w:szCs w:val="' + szVal + '"/></w:rPr><w:tab/></w:r>';
  var renderChoice = function(c) {
    return renderTokensToXml([{ text: c.label + '. ', bold: true, color: '0000FF', underline: !!c.correct }].concat(parseInlineTokens(c.text)), { fontSize: fontSize }, mathMode, texDelimiter);
  };

  // Tab stops chuẩn BTPro2020.dotm macro CH_345 (kind=3 trang A4: 0.5cm=284, 5cm=2835, 9.5cm=5386, 14cm=7938 dxa)
  if (layout === 4) {
    return '<w:p><w:pPr><w:jc w:val="left"/><w:tabs><w:tab w:val="left" w:pos="284"/><w:tab w:val="left" w:pos="2835"/><w:tab w:val="left" w:pos="5386"/><w:tab w:val="left" w:pos="7938"/></w:tabs><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
      tabRun + renderChoice(choices[0]) + tabRun +
      renderChoice(choices[1]) + tabRun +
      renderChoice(choices[2]) + tabRun +
      renderChoice(choices[3]) + '</w:p>';
  }
  if (layout === 2) {
    var pPr2 = '<w:pPr><w:jc w:val="left"/><w:tabs><w:tab w:val="left" w:pos="284"/><w:tab w:val="left" w:pos="5386"/></w:tabs><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>';
    return '<w:p>' + pPr2 + tabRun + renderChoice(choices[0]) + tabRun + renderChoice(choices[1]) + '</w:p>' +
           '<w:p>' + pPr2 + tabRun + renderChoice(choices[2]) + tabRun + renderChoice(choices[3]) + '</w:p>';
  }
  var out = '';
  for (var cI = 0; cI < choices.length; cI++) {
    out += '<w:p><w:pPr><w:jc w:val="both"/><w:tabs><w:tab w:val="left" w:pos="284"/></w:tabs><w:ind w:left="620" w:hanging="336"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
      tabRun + renderChoice(choices[cI]) + '</w:p>';
  }
  return out;
}

function renderVariationTableXml(block, fontSize, lineDxa, mathMode, texDelimiter) {
  var maxCols = block.maxCols || 1;
  var firstColW = maxCols > 1 ? 1100 : 9000;
  var otherColW = maxCols > 1 ? Math.floor((9000 - firstColW) / (maxCols - 1)) : 0;
  var totalW = firstColW + otherColW * Math.max(0, maxCols - 1);

  var xml = '<w:tbl><w:tblPr><w:tblW w:w="' + totalW + '" w:type="dxa"/><w:jc w:val="center"/>' +
    '<w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders>' +
    '<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="40" w:type="dxa"/><w:right w:w="40" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>';
  for (var k = 0; k < maxCols; k++) {
    xml += '<w:gridCol w:w="' + (k === 0 ? firstColW : otherColW) + '"/>';
  }
  xml += '</w:tblGrid>';

  for (var rI = 0; rI < block.rows.length; rI++) {
    var row = block.rows[rI];
    xml += '<w:tr>';
    for (var cI = 0; cI < maxCols; cI++) {
      var colW = cI === 0 ? firstColW : otherColW;
      var cellRaw = (row[cI] || '').trim();
      var borders = '<w:tcBorders>';
      if (block.hlinesBeforeRow[rI]) {
        borders += '<w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>';
      }
      if (block.vertAfterCols[cI]) {
        borders += '<w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/>';
      }
      borders += '</w:tcBorders>';

      var cellRuns = '';
      if (cellRaw) {
        cellRuns = renderTokensToXml([{ text: '$' + cellRaw + '$', math: true }], { fontSize: fontSize }, mathMode, texDelimiter);
      }
      xml += '<w:tc><w:tcPr><w:tcW w:w="' + colW + '" w:type="dxa"/>' + borders + '<w:vAlign w:val="center"/></w:tcPr>' +
        '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
        cellRuns + '</w:p></w:tc>';
    }
    xml += '</w:tr>';
  }
  xml += '</w:tbl>';
  return xml;
}

function dataUrlToBase64(dataUrl) {
  var commaIdx = String(dataUrl || '').indexOf(',');
  if (commaIdx === -1) return null;
  return dataUrl.slice(commaIdx + 1).trim();
}

function makeDrawingParagraphXml(mediaItem, lineDxa) {
  return '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="40" w:after="40"/></w:pPr>' +
    '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">' +
    '<wp:extent cx="' + mediaItem.cx + '" cy="' + mediaItem.cy + '"/>' +
    '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
    '<wp:docPr id="' + mediaItem.id + '" name="MathVisual' + mediaItem.id + '"/>' +
    '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
    '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + mediaItem.id + '" name="MathVisual' + mediaItem.id + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
    '<pic:blipFill><a:blip r:embed="' + mediaItem.rId + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
    '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + mediaItem.cx + '" cy="' + mediaItem.cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
    '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}

async function generateBtproDocxBlob(rawText, userOptions) {
  userOptions = userOptions || {};
  var zip = new JSZip();
  var fontSize = userOptions.fontSize || 12;
  var lineSpacing = userOptions.lineSpacing || 1;
  var lineDxa = Math.round(lineSpacing * 240);
  var choiceLayoutPref = userOptions.choiceLayout || 'auto';
  var mathMode = userOptions.mathMode || 'omml'; // 'omml' hoặc 'toggletex'
  var texDelimiter = userOptions.texDelimiter || 'parens'; // 'parens' = \(...\), 'dollar' = $...$
  var visualMode = userOptions.visualMode || 'image'; // 'image' (BBT/Đồ thị sắc nét) hoặc 'table'
  var imageMap = userOptions.imageMap || {};

  var blocks = parseAndAlignContent(rawText, imageMap);
  var bodyXml = '';
  var mediaList = [];

  var registerPngForDocx = function(pngInfo, maxWidthEmu) {
    if (!pngInfo || !pngInfo.dataUrl) return null;
    var b64 = dataUrlToBase64(pngInfo.dataUrl);
    if (!b64) return null;
    var id = mediaList.length + 1;
    var rId = 'rId' + (2 + id);
    var filename = 'media/image' + id + '.png';
    var pxW = pngInfo.pxW || 380;
    var pxH = pngInfo.pxH || 240;
    var cx = Math.min(maxWidthEmu || 4800000, Math.round(pxW * 9525));
    var cy = Math.round(cx * (pxH / pxW));
    var item = { id: id, rId: rId, filename: filename, base64: b64, cx: cx, cy: cy };
    mediaList.push(item);
    return item;
  };

  for (var bIdx = 0; bIdx < blocks.length; bIdx++) {
    var block = blocks[bIdx];

    if (block.type === 'heading') {
      var hSz = block.level === 1 ? 32 : (block.level === 2 ? 28 : 26);
      var jc = block.level === 1 ? 'center' : 'left';
      var before = block.level === 1 ? 80 : 60;
      bodyXml += '<w:p><w:pPr><w:jc w:val="' + jc + '"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="' + before + '" w:after="40"/></w:pPr>' +
        renderTokensToXml(parseInlineTokens(block.content), { bold: true, fontSize: hSz / 2, color: '1E3A8A' }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'exam-part') {
      bodyXml += '<w:p><w:pPr><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="80" w:after="20"/></w:pPr>' +
        renderTokensToXml(parseInlineTokens(block.content), { bold: true, fontSize: fontSize + 1, color: '0F172A' }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'question' || block.type === 'mcq-question') {
      var prefixTok = { text: block.prefix + (block.body ? ' ' : ''), bold: true, color: '0000FF', italic: !!block.italic, math: false };
      var bodyTokens = block.body ? parseInlineTokens(block.body) : [];
      var allTokens = [prefixTok].concat(bodyTokens);
      bodyXml += '<w:p><w:pPr><w:jc w:val="both"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="120" w:after="0"/></w:pPr>' +
        renderTokensToXml(allTokens, { fontSize: fontSize, italic: !!block.italic }, mathMode, texDelimiter) + '</w:p>';

      if (block.type === 'mcq-question') {
        var layout = choiceLayoutPref === 'auto' ? determineBtproChoiceLayout(block.choices) : Number(choiceLayoutPref);
        bodyXml += renderChoicesWithTabsXml(block.choices, layout, fontSize, lineDxa, mathMode, texDelimiter);
      }
    } else if (block.type === 'mcq-choices') {
      var layoutC = choiceLayoutPref === 'auto' ? determineBtproChoiceLayout(block.choices) : Number(choiceLayoutPref);
      bodyXml += renderChoicesWithTabsXml(block.choices, layoutC, fontSize, lineDxa, mathMode, texDelimiter);
    } else if (block.type === 'variation-table') {
      var renderedBbtPng = visualMode === 'image' ? renderVariationTableToPngDataUrl(block) : null;
      var mediaBbt = registerPngForDocx(renderedBbtPng, 4600000);
      if (mediaBbt) {
        bodyXml += makeDrawingParagraphXml(mediaBbt, lineDxa);
      } else {
        bodyXml += renderVariationTableXml(block, fontSize, lineDxa, mathMode, texDelimiter);
      }
    } else if (block.type === 'math-graph') {
      var renderedGraphPng = renderGraphToPngDataUrl(block.spec);
      var mediaGraph = registerPngForDocx(renderedGraphPng, 3100000);
      if (mediaGraph) {
        bodyXml += makeDrawingParagraphXml(mediaGraph, lineDxa);
      } else {
        bodyXml += '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="20" w:after="20"/></w:pPr>' +
          renderTokensToXml([{ text: '[Đồ thị: ' + block.spec + ']', italic: true }], { fontSize: fontSize }, 'toggletex') + '</w:p>';
      }
    } else if (block.type === 'math-image') {
      var renderedImgPng = await rasterizeSvgOrImageToPng(block);
      var mediaImg = registerPngForDocx(renderedImgPng, 4800000);
      if (mediaImg) {
        bodyXml += makeDrawingParagraphXml(mediaImg, lineDxa);
      }
    } else if (block.type === 'tf-item') {
      bodyXml += '<w:p><w:pPr><w:jc w:val="both"/><w:ind w:left="567" w:hanging="283"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
        renderTokensToXml([{ text: block.label + ' ', bold: true, color: '0000FF' }].concat(parseInlineTokens(block.content)), { fontSize: fontSize }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'bullet') {
      bodyXml += '<w:p><w:pPr><w:jc w:val="both"/><w:ind w:left="360" w:hanging="180"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
        renderTokensToXml([{ text: '•  ', bold: true }].concat(parseInlineTokens(block.content)), { fontSize: fontSize }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'solution-header') {
      bodyXml += '<w:p><w:pPr><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="20" w:after="0"/></w:pPr>' +
        renderTokensToXml(parseInlineTokens(block.content), { bold: true, italic: true, fontSize: fontSize, color: '1E40AF' }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'answer-choice') {
      bodyXml += '<w:p><w:pPr><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
        renderTokensToXml(parseInlineTokens(block.content), { bold: true, fontSize: fontSize, color: 'B45309' }, mathMode, texDelimiter) + '</w:p>';
    } else if (block.type === 'display-math') {
      var ommlPara = mathMode === 'omml' ? latexToOmml(block.content, true, fontSize * 2) : null;
      if (ommlPara) {
        bodyXml += '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="20" w:after="20"/></w:pPr>' + ommlPara + '</w:p>';
      } else {
        // Chuẩn MathType Toggle TeX (Alt + \): display equation dùng \[ ... \]
        var dispTex = mathMode === 'toggletex' ? ('\\[' + block.content + '\\]') : ('$$' + block.content + '$$');
        bodyXml += '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="20" w:after="20"/></w:pPr>' +
          renderTokensToXml([{ text: dispTex, math: true }], { fontSize: fontSize }, 'toggletex', texDelimiter) + '</w:p>';
      }
    } else if (block.type === 'table') {
      var colCount = block.header.length || 1;
      for (var rI = 0; rI < block.rows.length; rI++) {
        if (block.rows[rI].length > colCount) colCount = block.rows[rI].length;
      }
      var colWidth = Math.floor(10000 / colCount);

      bodyXml += '<w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="888888"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="888888"/></w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>';
      for (var k = 0; k < colCount; k++) bodyXml += '<w:gridCol w:w="' + colWidth + '"/>';
      bodyXml += '</w:tblGrid>';

      if (block.header.length > 0) {
        bodyXml += '<w:tr><w:trPr><w:tblHeader/></w:trPr>';
        for (var cI = 0; cI < block.header.length; cI++) {
          bodyXml += '<w:tc><w:tcPr><w:tcW w:w="' + colWidth + '" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
            renderTokensToXml(parseInlineTokens(block.header[cI]), { bold: true, fontSize: fontSize }, mathMode, texDelimiter) + '</w:p></w:tc>';
        }
        bodyXml += '</w:tr>';
      }

      for (var rI = 0; rI < block.rows.length; rI++) {
        bodyXml += '<w:tr>';
        for (var cI = 0; cI < block.rows[rI].length; cI++) {
          bodyXml += '<w:tc><w:tcPr><w:tcW w:w="' + colWidth + '" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
            renderTokensToXml(parseInlineTokens(block.rows[rI][cI]), { fontSize: fontSize }, mathMode, texDelimiter) + '</w:p></w:tc>';
        }
        bodyXml += '</w:tr>';
      }
      bodyXml += '</w:tbl>';
    } else {
      bodyXml += '<w:p><w:pPr><w:jc w:val="both"/><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/></w:pPr>' +
        renderTokensToXml(parseInlineTokens(block.content), { fontSize: fontSize, italic: !!block.italic }, mathMode, texDelimiter) + '</w:p>';
    }
  }

  for (var mIdx = 0; mIdx < mediaList.length; mIdx++) {
    zip.file('word/' + mediaList[mIdx].filename, mediaList[mIdx].base64, { base64: true });
  }

  var relsItems = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
                  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>';
  for (var mIdx2 = 0; mIdx2 < mediaList.length; mIdx2++) {
    relsItems += '<Relationship Id="' + mediaList[mIdx2].rId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="' + mediaList[mIdx2].filename + '"/>';
  }

  var pngTypeDecl = mediaList.length > 0 ? '<Default Extension="png" ContentType="image/png"/>' : '';
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + pngTypeDecl + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + relsItems + '</Relationships>');
  zip.file('word/settings.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:mathPr><m:mathFont m:val="Cambria Math"/><m:brkBin m:val="before"/><m:brkBinSub m:val="--"/><m:smallFrac m:val="0"/><m:dispDef/><m:lMargin m:val="0"/><m:rMargin m:val="0"/><m:defJc m:val="centerGroup"/><m:wrapIndent m:val="1440"/><m:intLim m:val="subSup"/><m:naryLim m:val="undOvr"/></m:mathPr></w:settings>');
  zip.file('word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="' + (fontSize * 2) + '"/><w:szCs w:val="' + (fontSize * 2) + '"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="' + lineDxa + '" w:lineRule="auto" w:before="0" w:after="0"/><w:jc w:val="both"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>');
  zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' + bodyXml + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="1134"/></w:sectPr></w:body></w:document>');

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// ============================================================================
// 4. PREVIEW HTML VỚI KATEX + HÌNH ẢNH BBT & ĐỒ THỊ
// ============================================================================
function renderPreviewHtml(blocks, userOptions) {
  var choiceLayoutPref = userOptions.choiceLayout || 'auto';
  var visualMode = userOptions.visualMode || 'image';

  var formatWithKatex = function(text, forceItalic) {
    var tokens = parseInlineTokens(text);
    return tokens.map(function(t) {
      if (t.math) {
        var rawTex = t.text.replace(/^\$\$?|\$\$?$/g, '');
        try {
          return katex.renderToString(rawTex, { throwOnError: false });
        } catch (err) {
          return '<span style="color:#b91c1c;font-family:monospace;">' + escapeXml(t.text) + '</span>';
        }
      }
      var esc = escapeXml(t.text);
      if (t.bold) esc = '<strong>' + esc + '</strong>';
      if (t.italic || forceItalic) esc = '<em>' + esc + '</em>';
      return esc;
    }).join('');
  };

  var renderChoicesHtml = function(choices) {
    var layout = choiceLayoutPref === 'auto' ? determineBtproChoiceLayout(choices) : Number(choiceLayoutPref);
    var out = '';
    var renderChoiceLabel = function(c) {
      var uStyle = c.correct ? 'text-decoration:underline;' : '';
      return '<strong style="color:#0000ff;' + uStyle + '">' + c.label + '.</strong> ';
    };
    if (layout === 4) {
      out += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-left:18px;margin-bottom:4px;font-family:\'Times New Roman\',serif;">';
      for (var cI = 0; cI < choices.length; cI++) {
        out += '<div>' + renderChoiceLabel(choices[cI]) + formatWithKatex(choices[cI].text) + '</div>';
      }
      out += '</div>';
    } else if (layout === 2) {
      out += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding-left:18px;margin-bottom:4px;font-family:\'Times New Roman\',serif;">';
      for (var cI = 0; cI < choices.length; cI++) {
        out += '<div>' + renderChoiceLabel(choices[cI]) + formatWithKatex(choices[cI].text) + '</div>';
      }
      out += '</div>';
    } else {
      out += '<div style="padding-left:18px;margin-bottom:4px;font-family:\'Times New Roman\',serif;">';
      for (var cI = 0; cI < choices.length; cI++) {
        out += '<div style="margin-bottom:2px;">' + renderChoiceLabel(choices[cI]) + formatWithKatex(choices[cI].text) + '</div>';
      }
      out += '</div>';
    }
    return out;
  };

  var html = '';
  for (var bIdx = 0; bIdx < blocks.length; bIdx++) {
    var b = blocks[bIdx];
    if (b.type === 'heading') {
      var tag = b.level === 1 ? 'h1' : (b.level === 2 ? 'h2' : 'h3');
      var align = b.level === 1 ? 'text-align:center;' : '';
      html += '<' + tag + ' style="' + align + 'font-family:\'Times New Roman\',serif;color:#1e3a8a;margin:8px 0 4px;">' + formatWithKatex(b.content) + '</' + tag + '>';
    } else if (b.type === 'exam-part') {
      html += '<div style="font-weight:bold;font-size:1.05em;color:#0f172a;margin:10px 0 4px;font-family:\'Times New Roman\',serif;">' + formatWithKatex(b.content) + '</div>';
    } else if (b.type === 'question' || b.type === 'mcq-question') {
      var prefHtml = '<strong style="color:#0000ff;">' + (b.italic ? '<em>' + escapeXml(b.prefix) + '</em>' : escapeXml(b.prefix)) + '</strong>';
      html += '<div style="margin-top:8px;margin-bottom:2px;font-family:\'Times New Roman\',serif;text-align:justify;line-height:1.4;">';
      html += prefHtml + (b.body ? ' ' + formatWithKatex(b.body, !!b.italic) : '');
      html += '</div>';

      if (b.type === 'mcq-question') {
        html += renderChoicesHtml(b.choices);
      }
    } else if (b.type === 'mcq-choices') {
      html += renderChoicesHtml(b.choices);
    } else if (b.type === 'variation-table') {
      var bbtPng = visualMode === 'image' ? renderVariationTableToPngDataUrl(b) : null;
      if (bbtPng && bbtPng.dataUrl) {
        html += '<div style="margin:6px 0;text-align:center;"><img src="' + bbtPng.dataUrl + '" alt="Bảng biến thiên" style="max-width:100%;height:auto;border:1px solid #e2e8f0;border-radius:6px;"/></div>';
      } else {
        html += '<div style="margin:6px 0;overflow-x:auto;display:flex;justify-content:center;">';
        html += '<table style="border-collapse:collapse;border:1px solid #333;font-family:\'Times New Roman\',serif;min-width:65%;">';
        for (var rI = 0; rI < b.rows.length; rI++) {
          html += '<tr>';
          for (var cI = 0; cI < b.maxCols; cI++) {
            var cellVal = (b.rows[rI][cI] || '').trim();
            var borderTop = b.hlinesBeforeRow[rI] ? 'border-top:1px solid #333;' : '';
            var borderRight = b.vertAfterCols[cI] ? 'border-right:1px solid #333;' : '';
            html += '<td style="' + borderTop + borderRight + 'padding:4px 10px;text-align:center;">' + (cellVal ? formatWithKatex('$' + cellVal + '$') : '') + '</td>';
          }
          html += '</tr>';
        }
        html += '</table></div>';
      }
    } else if (b.type === 'math-graph') {
      var gPng = renderGraphToPngDataUrl(b.spec);
      if (gPng && gPng.dataUrl) {
        html += '<div style="margin:6px 0;text-align:center;"><img src="' + gPng.dataUrl + '" alt="Đồ thị hàm số" style="max-width:340px;width:100%;height:auto;border:1px solid #e2e8f0;border-radius:6px;"/></div>';
      } else {
        html += '<div style="text-align:center;color:#475569;font-style:italic;margin:6px 0;">[Đồ thị: ' + escapeXml(b.spec) + ']</div>';
      }
    } else if (b.type === 'math-image') {
      if (b.kind === 'svg') {
        html += '<div style="margin:6px 0;text-align:center;">' + b.svg + '</div>';
      } else if (b.src) {
        html += '<div style="margin:6px 0;text-align:center;"><img src="' + escapeXml(b.src) + '" alt="' + escapeXml(b.alt || 'Hình ảnh') + '" style="max-width:90%;max-height:320px;height:auto;border:1px solid #e2e8f0;border-radius:6px;"/></div>';
      }
    } else if (b.type === 'tf-item') {
      html += '<div style="margin-left:18px;margin-bottom:2px;font-family:\'Times New Roman\',serif;text-align:justify;line-height:1.4;"><strong style="color:#0000ff;">' + escapeXml(b.label) + '</strong> ' + formatWithKatex(b.content) + '</div>';
    } else if (b.type === 'bullet') {
      html += '<div style="margin-left:20px;margin-bottom:2px;font-family:\'Times New Roman\',serif;text-align:justify;line-height:1.35;">• ' + formatWithKatex(b.content) + '</div>';
    } else if (b.type === 'solution-header') {
      html += '<div style="font-weight:bold;font-style:italic;color:#1e40af;margin-top:6px;margin-bottom:2px;font-family:\'Times New Roman\',serif;line-height:1.35;">' + formatWithKatex(b.content) + '</div>';
    } else if (b.type === 'answer-choice') {
      html += '<div style="font-weight:bold;color:#b45309;margin:2px 0;font-family:\'Times New Roman\',serif;line-height:1.35;">' + formatWithKatex(b.content) + '</div>';
    } else if (b.type === 'display-math') {
      var rendered;
      try {
        rendered = katex.renderToString(b.content, { displayMode: true, throwOnError: false });
      } catch (err) {
        rendered = '$$' + escapeXml(b.content) + '$$';
      }
      html += '<div style="text-align:center;margin:6px 0;">' + rendered + '</div>';
    } else if (b.type === 'table') {
      html += '<table style="width:100%;border-collapse:collapse;margin:8px 0;font-family:\'Times New Roman\',serif;">';
      if (b.header.length > 0) {
        html += '<tr style="background:#f1f5f9;font-weight:bold;text-align:center;">';
        for (var cI = 0; cI < b.header.length; cI++) {
          html += '<th style="border:1px solid #333;padding:6px;">' + formatWithKatex(b.header[cI]) + '</th>';
        }
        html += '</tr>';
      }
      for (var rI = 0; rI < b.rows.length; rI++) {
        html += '<tr>';
        for (var cI = 0; cI < b.rows[rI].length; cI++) {
          html += '<td style="border:1px solid #888;padding:6px;text-align:center;">' + formatWithKatex(b.rows[rI][cI]) + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
    } else {
      html += '<p style="font-family:\'Times New Roman\',serif;text-align:justify;line-height:1.35;margin:2px 0;">' + formatWithKatex(b.content, !!b.italic) + '</p>';
    }
  }
  return html;
}

const SAMPLE_MATH_EXAM = "# ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN LỚP 12\n" +
"### NĂM HỌC 2025 - 2026 • THỜI GIAN LÀM BÀI: 90 PHÚT\n\n" +
"PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.\n\n" +
"Câu 1: Cho hàm số $y = \\frac{2x - 1}{x + 1}$. Tiệm cận ngang của đồ thị hàm số có phương trình là:\n" +
"A. $y = 2$\n" +
"B. $y = -1$\n" +
"C. $x = -1$\n" +
"D. $y = 1$\n\n" +
"Câu 2: Cho hàm số $y = x^3 - 3x^2 + 2$ có đồ thị như hình vẽ bên dưới.\n" +
"[GRAPH: y = x^3 - 3x^2 + 2 | x=-2..4 | y=-3..4]\n" +
"Điểm cực đại của đồ thị hàm số là:\n" +
"A. $(0; 2)$\n" +
"B. $(2; -2)$\n" +
"C. $(1; 0)$\n" +
"D. $(0; 0)$\n\n" +
"Câu 3: Cho hàm số $y = f(x)$ có bảng biến thiên như sau:\n" +
"[BBT: x = -inf, , -1, , 1, , +inf | y' = +, 0, -, 0, + | y = -inf, \\nearrow, 2, \\searrow, -2, \\nearrow, +inf]\n" +
"Hàm số đạt cực tiểu tại điểm nào dưới đây?\n" +
"A. $x = 1$\n" +
"B. $x = -1$\n" +
"C. $x = 2$\n" +
"D. $x = -2$\n\n" +
"HƯỚNG DẪN GIẢI CHI TIẾT\n" +
"Câu 1: Ta có $\\lim_{x \\to \\pm\\infty} \\frac{2x - 1}{x + 1} = 2$, suy ra tiệm cận ngang là đường thẳng $y = 2$. Chọn A.\n" +
"Câu 2: Ta có $y' = 3x^2 - 6x = 0 \\Leftrightarrow \\left[\\begin{matrix} x = 0 \\\\ x = 2 \\end{matrix}\\right.$.\n" +
"Với $x = 0 \\Rightarrow y = 2$, hàm số đạt cực đại tại điểm $(0; 2)$. Chọn A.\n";

function Z() {
  const k = R();
  const [d, E] = s.useState(() => {
    try {
      const prefill = sessionStorage.getItem("smartedu_paste_ai_prefill") || localStorage.getItem("smartedu_paste_ai_prefill") || localStorage.getItem("toan_docx_saved_markdown");
      if (prefill && prefill.trim()) {
        localStorage.setItem("toan_docx_saved_markdown", prefill);
        return prefill;
      }
    } catch {}
    return SAMPLE_MATH_EXAM;
  });
  const [h, N] = s.useState(!1);
  const [w, u] = s.useState(0);
  const [A, g] = s.useState(null);
  const [M, f] = s.useState(!1);
  const [copied, setCopied] = s.useState(!1);
  const [activeTab, setActiveTab] = s.useState('editor');
  const [fontSize, setFontSize] = s.useState(12);
  const [lineSpacing, setLineSpacing] = s.useState(1.15);
  const [choiceLayout, setChoiceLayout] = s.useState('auto');
  const [mathMode, setMathMode] = s.useState('omml'); // 'omml' hoặc 'toggletex' (MathType Alt+\)
  const [texDelimiter, setTexDelimiter] = s.useState('parens'); // 'parens' = \(...\) & \[...\], 'dollar' = $...$ & \[...\]
  const [visualMode, setVisualMode] = s.useState('image'); // 'image' (BBT/Đồ thị ảnh nét cao) hoặc 'table'
  const [imageMap, setImageMap] = s.useState(() => {
    try {
      const rawImgs = sessionStorage.getItem("smartedu_paste_ai_prefill_images") || localStorage.getItem("smartedu_paste_ai_prefill_images") || localStorage.getItem("toan_docx_saved_images");
      if (rawImgs) {
        localStorage.setItem("toan_docx_saved_images", rawImgs);
        const parsed = JSON.parse(rawImgs);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {}
    return {};
  });
  const [showStudio, setShowStudio] = s.useState(!1);
  const [studioTab, setStudioTab] = s.useState('graph');
  const [graphFormula, setGraphFormula] = s.useState('y = x^3 - 3x^2 + 2');
  const [graphRangeX, setGraphRangeX] = s.useState('-2..4');
  const [graphRangeY, setGraphRangeY] = s.useState('-3..4');
  const [bbtFormula, setBbtFormula] = s.useState('y = x^3 - 3x + 2');
  const [bbtCustom, setBbtCustom] = s.useState("[BBT: x = -inf, , -1, , 1, , +inf | y' = +, 0, -, 0, + | y = -inf, \\nearrow, 4, \\searrow, 0, \\nearrow, +inf]");

  const a = s.useRef(null);
  const textAreaRef = s.useRef(null);
  const fileInputRef = s.useRef(null);

  const insertAtCursor = function(snippet) {
    var el = textAreaRef.current;
    if (!el) {
      E(function(prev) { return (prev ? prev + '\n' : '') + snippet + '\n'; });
      return;
    }
    var start = el.selectionStart || d.length;
    var end = el.selectionEnd || d.length;
    var before = d.slice(0, start);
    var after = d.slice(end);
    var padBefore = before && !before.endsWith('\n') ? '\n' : '';
    var padAfter = after && !after.startsWith('\n') ? '\n' : '';
    E(before + padBefore + snippet + padAfter + after);
  };

  const addImageFileToEditor = function(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      var dataUrl = evt.target && evt.target.result;
      if (!dataUrl) return;
      var id = 'img_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000);
      setImageMap(function(prev) {
        var next = Object.assign({}, prev);
        next[id] = dataUrl;
        return next;
      });
      insertAtCursor('[IMG:' + id + ']');
    };
    reader.readAsDataURL(file);
  };

  const handleTextareaPaste = function(evt) {
    var clip = evt.clipboardData;
    if (!clip || !clip.items) return;
    for (var idx = 0; idx < clip.items.length; idx++) {
      var it = clip.items[idx];
      if (it.type && it.type.indexOf('image/') === 0) {
        evt.preventDefault();
        addImageFileToEditor(it.getAsFile());
        return;
      }
    }
  };

  const U = function() {
    u(0);
    var t = 0;
    a.current = setInterval(function() {
      t += Math.random() * 10 + 5;
      if (t >= 90) {
        t = 90;
        if (a.current) clearInterval(a.current);
      }
      u(Math.min(t, 90));
    }, 150);
  };
  const D = function() {
    if (a.current) clearInterval(a.current);
    u(100);
  };
  const S = function() {
    if (a.current) clearInterval(a.current);
    u(0);
  };

  const L = function(blob, filename) {
    const p = URL.createObjectURL(blob);
    const r = document.createElement("a");
    r.href = p;
    r.download = filename;
    document.body.appendChild(r);
    r.click();
    document.body.removeChild(r);
    URL.revokeObjectURL(p);
  };

  const handleExportDocx = async function() {
    if (!d.trim()) return;
    N(!0);
    g(null);
    f(!1);
    U();
    try {
      var blob = await generateBtproDocxBlob(d, {
        fontSize: fontSize,
        lineSpacing: lineSpacing,
        choiceLayout: choiceLayout,
        mathMode: mathMode,
        texDelimiter: texDelimiter,
        visualMode: visualMode,
        imageMap: imageMap
      });
      D();
      L(blob, mathMode === 'omml' ? "DeThi_WordEquation_TuDong.docx" : "DeThi_ToggleTeX_MathType.docx");
      f(!0);
    } catch(err) {
      S();
      g(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo file Word DOCX.");
    } finally {
      N(!1);
    }
  };

  const handleCopyCleanTex = function() {
    if (!d.trim()) return;
    var clean = normalizeLatexForToggleTex(d);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(clean);
      setCopied(!0);
      setTimeout(function() { setCopied(!1); }, 3000);
    } else {
      E(clean);
    }
  };

  const studioGraphPreview = s.useMemo(function() {
    if (!showStudio || studioTab !== 'graph') return null;
    var spec = graphFormula + ' | x=' + graphRangeX + ' | y=' + graphRangeY;
    return renderGraphToPngDataUrl(spec);
  }, [showStudio, studioTab, graphFormula, graphRangeX, graphRangeY]);

  const studioBbtPreview = s.useMemo(function() {
    if (!showStudio || studioTab !== 'bbt') return null;
    var parsed = parseBbtShorthand(bbtCustom.replace(/^\[BBT:\s*|\s*\]$/gi, ''));
    return parsed ? renderVariationTableToPngDataUrl(parsed) : null;
  }, [showStudio, studioTab, bbtCustom]);

  const studioAnalysis = s.useMemo(function() {
    if (!showStudio) return null;
    if (studioTab === 'graph') return analyzeMathFunction(String(graphFormula || '').split(';')[0]);
    if (studioTab === 'bbt') return analyzeMathFunction(bbtFormula);
    return null;
  }, [showStudio, studioTab, graphFormula, bbtFormula]);

  const buildAnalysisTextSnippet = function(analysis) {
    if (!analysis || !analysis.fullDerivLatex) return '';
    var parts = ['Ta có $' + analysis.fullDerivLatex + '$.'];
    var asym = [];
    if (analysis.tcd) asym.push('tiệm cận đứng $' + analysis.tcd + '$');
    if (analysis.tcn) asym.push('tiệm cận ngang $' + analysis.tcn + '$');
    if (analysis.tcx) asym.push('tiệm cận xiên $' + analysis.tcx + '$');
    if (asym.length) parts.push('Đồ thị có ' + asym.join(', ') + '.');
    return parts.join('\n');
  };

  const renderAnalysisBox = function(analysis) {
    if (!analysis || !analysis.fullDerivLatex) return null;
    var texParts = [analysis.fullDerivLatex];
    if (analysis.tcd) texParts.push('\\text{TCĐ: } ' + analysis.tcd);
    if (analysis.tcn) texParts.push('\\text{TCN: } ' + analysis.tcn);
    if (analysis.tcx) texParts.push('\\text{TCX: } ' + analysis.tcx);
    var htmlStr = katex.renderToString(texParts.join(' \\quad | \\quad '), { throwOnError: false, displayMode: false });
    return e.jsxs("div", {
      style: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 8,
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 6
      },
      children: [
        e.jsxs("div", {
          style: { fontSize: "0.78rem", fontWeight: 700, color: "#1e3a8a" },
          children: ["📐 Đạo hàm & Tiệm cận tự động:"]
        }),
        e.jsx("div", {
          style: { fontSize: "0.92rem", color: "#0f172a", overflowX: "auto" },
          dangerouslySetInnerHTML: { __html: htmlStr }
        }),
        e.jsx("button", {
          type: "button",
          className: "nd30-btn-secondary",
          style: { alignSelf: "flex-start", fontSize: "0.78rem", padding: "4px 10px" },
          onClick: function() {
            insertAtCursor(buildAnalysisTextSnippet(analysis));
            setActiveTab('editor');
          },
          children: "➕ Chèn công thức y' & tiệm cận"
        })
      ]
    });
  };

  const previewHtmlContent = s.useMemo(function() {
    if (!d.trim()) return "<p style='color:#94a3b8;text-align:center;padding:40px;'>Chưa có nội dung để xem trước...</p>";
    var blocks = parseAndAlignContent(d, imageMap);
    return renderPreviewHtml(blocks, { choiceLayout: choiceLayout, visualMode: visualMode });
  }, [d, choiceLayout, visualMode, imageMap]);

  return e.jsxs("div", {
    className: "nd30-page",
    children: [
      e.jsx(H, {}),
      e.jsxs("div", {
        className: "nd30-content",
        children: [
          e.jsxs(C.div, {
            className: "nd30-hero",
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.45 },
            children: [
              e.jsxs("div", {
                className: "nd30-back-bar",
                style: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "18px" },
                children: [
                  e.jsx("button", {
                    className: "nd30-back nd30-back-primary",
                    style: { background: "linear-gradient(135deg, #4f46e5, #6366f1)", border: "1.5px solid #a5b4fc", color: "#fff", fontWeight: "700", boxShadow: "0 4px 14px rgba(79,70,229,0.35)", position: "static" },
                    onClick: function() {
                      try {
                        if (d) {
                          sessionStorage.setItem("smartedu_paste_ai_prefill", d);
                          localStorage.setItem("smartedu_paste_ai_prefill", d);
                          localStorage.setItem("toan_docx_saved_markdown", d);
                        }
                        if (imageMap) {
                          const im = JSON.stringify(imageMap);
                          sessionStorage.setItem("smartedu_paste_ai_prefill_images", im);
                          localStorage.setItem("smartedu_paste_ai_prefill_images", im);
                          localStorage.setItem("toan_docx_saved_images", im);
                        }
                      } catch(e) {}
                      window.location.href = "/ai-tools/toan-markdown-docx/index.html";
                    },
                    children: "📐 Quay lại Trợ lý AI Soạn Đề Thi (Toán · KHTN · Lí · Hóa) → Markdown & DOCX"
                  }),
                  e.jsx("button", {
                    className: "nd30-back nd30-back-mathviz",
                    style: { background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontWeight: "600", position: "static" },
                    onClick: function() { window.location.href = "/ai-tools/mathviz-studio/index.html"; },
                    children: "🎨 Quay lại MathViz Studio"
                  }),
                  e.jsx("button", {
                    className: "nd30-back nd30-back-tienich",
                    style: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#e2e8f0", position: "static" },
                    onClick: function() { k("/tien-ich-giao-duc"); },
                    children: "← Tiện ích GD"
                  })
                ]
              }),
              e.jsx("h1", {
                className: "nd30-hero-title",
                children: "📋 Chuyển đổi AI sang DOCX (Word Equation & MathType)"
              }),
              e.jsx("p", {
                className: "nd30-hero-sub",
                children: "Chuyển đổi đề Toán từ AI sang Word chuẩn BTPro: chọn Tự động Word Equation hoặc Toggle TeX (MathType Alt + \\), dựng sẵn Bảng biến thiên, Đồ thị hàm số & Hình ảnh sắc nét!"
              })
            ]
          }),
          e.jsxs(C.div, {
            className: "nd30-card",
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1, duration: 0.4 },
            children: [
              e.jsxs("div", {
                className: "nd30-mode-pills",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    className: "nd30-mode-pill" + (mathMode === 'omml' ? " active" : ""),
                    onClick: function() { setMathMode('omml'); f(!1); },
                    children: [
                      e.jsx("strong", { children: "✨ Tự động Word Equation (Không cần Add-in)" }),
                      e.jsx("span", { children: "Tải về mở Word dùng ngay, công thức chỉnh sửa được" })
                    ]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    className: "nd30-mode-pill" + (mathMode === 'toggletex' ? " active" : ""),
                    onClick: function() { setMathMode('toggletex'); f(!1); },
                    children: [
                      e.jsx("strong", { children: "⚡ Chế độ Toggle TeX (MathType Alt + \\)" }),
                      e.jsx("span", { children: texDelimiter === 'parens' ? "Xuất \\(...\\) và \\[...\\] sạch để bấm Ctrl+A → Alt+\\ không lỗi $10$ / dấu cách" : "Xuất $...$ và \\[...\\] đã làm sạch dấu cách thừa" })
                    ]
                  })
                ]
              }),

              e.jsxs("div", {
                className: "nd30-btpro-panel",
                children: [
                  e.jsxs("div", {
                    className: "nd30-field-group",
                    children: [
                      e.jsx("label", { className: "nd30-field-label", children: "Cỡ chữ Word" }),
                      e.jsxs("select", {
                        className: "nd30-select",
                        value: fontSize,
                        onChange: function(evt) { setFontSize(Number(evt.target.value)); },
                        children: [
                          e.jsx("option", { value: 12, children: "12 pt (Chuẩn đề thi Bộ GD&ĐT)" }),
                          e.jsx("option", { value: 13, children: "13 pt (Chuẩn công văn NĐ 30)" }),
                          e.jsx("option", { value: 14, children: "14 pt (In ấn phóng to)" })
                        ]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "nd30-field-group",
                    children: [
                      e.jsx("label", { className: "nd30-field-label", children: "Dãn dòng" }),
                      e.jsxs("select", {
                        className: "nd30-select",
                        value: lineSpacing,
                        onChange: function(evt) { setLineSpacing(Number(evt.target.value)); },
                        children: [
                          e.jsx("option", { value: 1, children: "1.0x (Sát chuẩn - xuống dòng bình thường)" }),
                          e.jsx("option", { value: 1.15, children: "1.15x (Chuẩn BTPro tiết kiệm giấy)" }),
                          e.jsx("option", { value: 1.25, children: "1.25x (Thoáng đẹp)" }),
                          e.jsx("option", { value: 1.5, children: "1.5x (Rộng rãi)" })
                        ]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "nd30-field-group",
                    children: [
                      e.jsx("label", { className: "nd30-field-label", children: "Bố cục đáp án (Dùng Tab)" }),
                      e.jsxs("select", {
                        className: "nd30-select",
                        value: choiceLayout,
                        onChange: function(evt) { setChoiceLayout(evt.target.value); },
                        children: [
                          e.jsx("option", { value: "auto", children: "⚡ Tự động theo BTPro (Tab 4/2/1)" }),
                          e.jsx("option", { value: "4", children: "4 cột (Tab 1 dòng)" }),
                          e.jsx("option", { value: "2", children: "2 cột (Tab 2 dòng A-B, C-D)" }),
                          e.jsx("option", { value: "1", children: "1 cột (Mỗi đáp án 1 dòng)" })
                        ]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "nd30-field-group",
                    children: [
                      e.jsx("label", { className: "nd30-field-label", children: "Bảng biến thiên & Đồ thị" }),
                      e.jsxs("select", {
                        className: "nd30-select",
                        value: visualMode,
                        onChange: function(evt) { setVisualMode(evt.target.value); },
                        children: [
                          e.jsx("option", { value: "image", children: "🖼️ Hình ảnh nét cao (Mũi tên BBT chuẩn SGK)" }),
                          e.jsx("option", { value: "table", children: "📊 Bảng Word cho BBT/BXD (Đồ thị vẫn là ảnh)" })
                        ]
                      })
                    ]
                  })
                ]
              }),

              e.jsxs("div", {
                className: "nd30-guide-card",
                children: [
                  e.jsxs("div", {
                    className: "nd30-guide-title",
                    children: [
                      e.jsx("span", { style: { fontSize: "1.1rem" }, children: mathMode === 'omml' ? "✅" : "💡" }),
                      e.jsx("span", {
                        children: mathMode === 'omml'
                          ? "Chế độ Tự động Word Equation + Đồ thị & BBT hình ảnh:"
                          : "Hướng dẫn Toggle TeX sang MathType trong Word (bằng phím Alt + \\):"
                      })
                    ]
                  }),
                  mathMode === 'omml' ? e.jsx("div", {
                    className: "nd30-guide-steps",
                    children: e.jsx("span", {
                      children: "Hỗ trợ tự chuyển công thức sang Word Equation, căn đều A-B-C-D bằng Tab Word, tự render Bảng biến thiên (\\begin{array} / tkzTab), Đồ thị [GRAPH: ...] và Hình ảnh SVG/Ctrl+V."
                    })
                  }) : e.jsxs("div", {
                    className: "nd30-guide-steps",
                    style: { flexWrap: "wrap", rowGap: 8 },
                    children: [
                      e.jsxs("div", { className: "nd30-guide-step", children: [e.jsx("strong", { children: "Bước 1:" }), e.jsx("span", { children: "Tải file .docx và mở trong MS Word." })] }),
                      e.jsxs("div", { className: "nd30-guide-step", children: [e.jsx("strong", { children: "Bước 2:" }), e.jsx("span", { className: "nd30-badge-key", children: "Ctrl + A" })] }),
                      e.jsxs("div", { className: "nd30-guide-step", children: [e.jsx("strong", { children: "Bước 3:" }), e.jsx("span", { className: "nd30-badge-key", children: "Alt + \\" }), e.jsx("span", { children: texDelimiter === 'parens' ? "để MathType tự Toggle toàn bộ \\(...\\) và \\[...\\]." : "để MathType tự Toggle toàn bộ $...$ và \\[...\\]." })] }),
                      e.jsxs("div", {
                        className: "nd30-guide-step",
                        style: { marginLeft: "auto" },
                        children: [
                          e.jsx("strong", { children: "Thẻ TeX:" }),
                          e.jsxs("select", {
                            className: "nd30-select",
                            style: { width: "auto", padding: "3px 8px", fontSize: "0.78rem" },
                            value: texDelimiter,
                            onChange: function(evt) { setTexDelimiter(evt.target.value); },
                            children: [
                              e.jsx("option", { value: "parens", children: "\\(...\\) & \\[...\\] (Khuyên dùng - tránh lỗi $10$, $a$)" }),
                              e.jsx("option", { value: "dollar", children: "$...$ & \\[...\\] (Cổ điển / BTPro)" })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),

              e.jsxs("div", {
                className: "nd30-tabs-header",
                style: { justifyContent: "space-between", flexWrap: "wrap" },
                children: [
                  e.jsxs("div", {
                    style: { display: "flex", gap: 8 },
                    children: [
                      e.jsx("button", {
                        className: "nd30-tab-btn" + (activeTab === 'editor' ? " active" : ""),
                        onClick: function() { setActiveTab('editor'); },
                        children: "📝 Soạn thảo / Dán văn bản"
                      }),
                      e.jsx("button", {
                        className: "nd30-tab-btn" + (activeTab === 'preview' ? " active" : ""),
                        onClick: function() { setActiveTab('preview'); },
                        children: "👁️ Xem trước (Live Preview)"
                      })
                    ]
                  }),
                  e.jsx("button", {
                    type: "button",
                    className: "nd30-tab-btn" + (showStudio ? " active" : ""),
                    onClick: function() { setShowStudio(!showStudio); },
                    children: showStudio ? "🔽 Ẩn Studio Hình Toán Học" : "📐 Studio Đồ thị • BBT • Hình ảnh"
                  })
                ]
              }),

              showStudio && e.jsxs("div", {
                className: "nd30-studio-card",
                children: [
                  e.jsxs("div", {
                    className: "nd30-tabs-header",
                    children: [
                      e.jsx("button", { type: "button", className: "nd30-tab-btn" + (studioTab === 'graph' ? " active" : ""), onClick: function() { setStudioTab('graph'); }, children: "📈 Vẽ Đồ thị hàm số" }),
                      e.jsx("button", { type: "button", className: "nd30-tab-btn" + (studioTab === 'bbt' ? " active" : ""), onClick: function() { setStudioTab('bbt'); }, children: "📊 Tạo Bảng biến thiên" }),
                      e.jsx("button", { type: "button", className: "nd30-tab-btn" + (studioTab === 'image' ? " active" : ""), onClick: function() { setStudioTab('image'); }, children: "🖼️ Chèn / Dán Hình ảnh" })
                    ]
                  }),

                  studioTab === 'graph' && e.jsxs("div", {
                    className: "nd30-studio-grid",
                    children: [
                      e.jsxs("div", {
                        style: { display: "flex", flexDirection: "column", gap: 8 },
                        children: [
                          e.jsx("label", { className: "nd30-field-label", children: "Hàm số (nhiều hàm cách nhau bởi ;)" }),
                          e.jsx("input", { className: "nd30-input", value: graphFormula, onChange: function(evt) { setGraphFormula(evt.target.value); }, placeholder: "VD: y = x^3 - 3x^2 + 2" }),
                          e.jsxs("div", {
                            style: { display: "flex", gap: 8 },
                            children: [
                              e.jsxs("div", { style: { flex: 1 }, children: [e.jsx("label", { className: "nd30-field-label", children: "Khoảng x" }), e.jsx("input", { className: "nd30-input", value: graphRangeX, onChange: function(evt) { setGraphRangeX(evt.target.value); } })] }),
                              e.jsxs("div", { style: { flex: 1 }, children: [e.jsx("label", { className: "nd30-field-label", children: "Khoảng y" }), e.jsx("input", { className: "nd30-input", value: graphRangeY, onChange: function(evt) { setGraphRangeY(evt.target.value); } })] })
                            ]
                          }),
                          e.jsxs("div", {
                            className: "nd30-quick-btns",
                            children: [
                              e.jsx("button", { type: "button", className: "nd30-btn-secondary", onClick: function() { setGraphFormula('y = x^3 - 3x^2 + 2'); setGraphRangeX('-2..4'); setGraphRangeY('-3..4'); }, children: "Bậc 3" }),
                              e.jsx("button", { type: "button", className: "nd30-btn-secondary", onClick: function() { setGraphFormula('y = x^4 - 2x^2 - 1'); setGraphRangeX('-3..3'); setGraphRangeY('-3..4'); }, children: "Trùng phương" }),
                              e.jsx("button", { type: "button", className: "nd30-btn-secondary", onClick: function() { setGraphFormula('y = (2x - 1)/(x + 1)'); setGraphRangeX('-5..3'); setGraphRangeY('-4..6'); }, children: "Phân thức 1/1" }),
                              e.jsx("button", { type: "button", className: "nd30-btn-secondary", onClick: function() { setGraphFormula('y = (x^2 - 2x + 2)/(x - 1)'); setGraphRangeX('-4..6'); setGraphRangeY('-5..6'); }, children: "Bậc 2 / Bậc 1" }),
                              e.jsx("button", { type: "button", className: "nd30-btn-secondary", onClick: function() { setGraphFormula('y = x^2 ; y = x + 2'); setGraphRangeX('-2..3'); setGraphRangeY('-1..5'); }, children: "Tích phân 2 đường" })
                            ]
                          }),
                          renderAnalysisBox(studioAnalysis),
                          e.jsxs("div", {
                            style: { display: "flex", gap: 8, flexWrap: "wrap" },
                            children: [
                              e.jsx("button", {
                                type: "button",
                                className: "nd30-btn-process",
                                style: { padding: "10px 14px", fontSize: "0.88rem", flex: 1 },
                                onClick: function() {
                                  insertAtCursor('[GRAPH: ' + graphFormula + ' | x=' + graphRangeX + ' | y=' + graphRangeY + ']');
                                  setActiveTab('editor');
                                },
                                children: "➕ Chèn Đồ thị vào văn bản"
                              }),
                              studioAnalysis && studioAnalysis.fullDerivLatex && e.jsx("button", {
                                type: "button",
                                className: "nd30-btn-secondary",
                                style: { padding: "10px 12px", fontSize: "0.84rem" },
                                onClick: function() {
                                  insertAtCursor(buildAnalysisTextSnippet(studioAnalysis) + '\n[GRAPH: ' + graphFormula + ' | x=' + graphRangeX + ' | y=' + graphRangeY + ']');
                                  setActiveTab('editor');
                                },
                                children: "➕ Chèn y' + Đồ thị"
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx("div", {
                        style: { textAlign: "center", background: "#fff", borderRadius: 10, padding: 8, border: "1px solid #cbd5e1" },
                        children: studioGraphPreview && studioGraphPreview.dataUrl
                          ? e.jsx("img", { src: studioGraphPreview.dataUrl, alt: "Graph preview", style: { maxWidth: "100%", height: "auto" } })
                          : e.jsx("span", { style: { color: "#64748b", fontSize: "0.82rem" }, children: "Nhập công thức hợp lệ để xem trước" })
                      })
                    ]
                  }),

                  studioTab === 'bbt' && e.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: 8 },
                    children: [
                      e.jsxs("div", {
                        style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
                        children: [
                          e.jsx("input", { className: "nd30-input", style: { flex: 1, minWidth: 200 }, value: bbtFormula, onChange: function(evt) { setBbtFormula(evt.target.value); }, placeholder: "VD: y = (x^2 - 2x + 2)/(x - 1) hoặc y = x^3 - 3x + 2" }),
                          e.jsx("button", {
                            type: "button",
                            className: "nd30-btn-secondary",
                            onClick: function() { setBbtCustom(generateBbtFromFunction(bbtFormula)); },
                            children: "⚡ Tự tính BBT từ hàm số"
                          })
                        ]
                      }),
                      e.jsx("div", {
                        className: "nd30-quick-btns",
                        children: [
                          { label: 'Bậc 3', expr: 'y = x^3 - 3x^2 + 2' },
                          { label: 'Trùng phương', expr: 'y = x^4 - 2x^2 - 1' },
                          { label: 'Phân thức 1/1', expr: 'y = (2x - 1)/(x + 1)' },
                          { label: 'Bậc 2 / Bậc 1', expr: 'y = (x^2 - 2x + 2)/(x - 1)' }
                        ].map(function(p) {
                          return e.jsx("button", {
                            type: "button",
                            className: "nd30-btn-secondary",
                            onClick: function() {
                              setBbtFormula(p.expr);
                              setBbtCustom(generateBbtFromFunction(p.expr));
                            },
                            children: p.label
                          }, p.label);
                        })
                      }),
                      renderAnalysisBox(studioAnalysis),
                      e.jsx("textarea", {
                        className: "nd30-textarea",
                        rows: 2,
                        value: bbtCustom,
                        onChange: function(evt) { setBbtCustom(evt.target.value); }
                      }),
                      studioBbtPreview && studioBbtPreview.dataUrl && e.jsx("div", {
                        style: { textAlign: "center", background: "#fff", borderRadius: 8, padding: 8, border: "1px solid #cbd5e1" },
                        children: e.jsx("img", { src: studioBbtPreview.dataUrl, alt: "BBT preview", style: { maxWidth: "100%", height: "auto" } })
                      }),
                      e.jsxs("div", {
                        style: { display: "flex", gap: 8, flexWrap: "wrap" },
                        children: [
                          e.jsx("button", {
                            type: "button",
                            className: "nd30-btn-process",
                            style: { padding: "10px 14px", fontSize: "0.88rem", flex: 1 },
                            onClick: function() {
                              insertAtCursor(bbtCustom);
                              setActiveTab('editor');
                            },
                            children: "➕ Chèn Bảng biến thiên vào văn bản"
                          }),
                          studioAnalysis && studioAnalysis.fullDerivLatex && e.jsx("button", {
                            type: "button",
                            className: "nd30-btn-secondary",
                            style: { padding: "10px 12px", fontSize: "0.84rem" },
                            onClick: function() {
                              insertAtCursor(buildAnalysisTextSnippet(studioAnalysis) + '\n' + bbtCustom);
                              setActiveTab('editor');
                            },
                            children: "➕ Chèn cả Đạo hàm y' + BBT"
                          })
                        ]
                      })
                    ]
                  }),

                  studioTab === 'image' && e.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: 10 },
                    children: [
                      e.jsx("span", { style: { fontSize: "0.84rem", color: "#334155" }, children: "Bạn có thể nhấn Ctrl + V trực tiếp ảnh chụp (GeoGebra, hình chóp, đồ thị...) vào khung soạn thảo bên dưới, dán mã <svg>...</svg> từ AI, hoặc chọn file ảnh từ máy:" }),
                      e.jsx("input", {
                        ref: fileInputRef,
                        type: "file",
                        accept: "image/*",
                        style: { display: "none" },
                        onChange: function(evt) {
                          var fl = evt.target.files && evt.target.files[0];
                          if (fl) addImageFileToEditor(fl);
                          evt.target.value = '';
                        }
                      }),
                      e.jsx("button", {
                        type: "button",
                        className: "nd30-btn-secondary",
                        style: { alignSelf: "flex-start" },
                        onClick: function() { fileInputRef.current && fileInputRef.current.click(); },
                        children: "🖼️ Chọn file ảnh (.png, .jpg, .svg) từ máy"
                      })
                    ]
                  })
                ]
              }),

              activeTab === 'editor' ? e.jsxs("div", {
                className: "nd30-text-area-wrap",
                children: [
                  e.jsx("textarea", {
                    ref: textAreaRef,
                    className: "nd30-textarea",
                    placeholder: "Dán đề thi, giáo án từ AI vào đây (hỗ trợ $...$, $$...$$, [GRAPH: ...], [BBT: ...], \\begin{array}, \\tkzTab, <svg>, hoặc bấm Ctrl+V dán ảnh trực tiếp)...",
                    value: d,
                    onPaste: handleTextareaPaste,
                    onChange: function(evt) {
                      E(evt.target.value);
                      g(null);
                      f(!1);
                    },
                    rows: 14
                  }),
                  e.jsxs("div", {
                    className: "nd30-quick-btns",
                    children: [
                      e.jsxs("button", {
                        className: "nd30-btn-secondary",
                        onClick: function() { E(SAMPLE_MATH_EXAM); g(null); f(!1); },
                        children: [e.jsx("span", { children: "📝" }), " Dán đề mẫu (có Đồ thị & BBT)"]
                      }),
                      e.jsxs("button", {
                        className: "nd30-btn-secondary",
                        onClick: handleCopyCleanTex,
                        children: [e.jsx("span", { children: copied ? "✅" : "📋" }), copied ? " Đã sao chép!" : " Sao chép văn bản Toggle TeX"]
                      }),
                      e.jsxs("button", {
                        className: "nd30-btn-secondary",
                        onClick: function() { E(normalizeLatexForToggleTex(d)); },
                        children: [e.jsx("span", { children: "⚡" }), " Chuẩn hóa ký tự TeX"]
                      }),
                      e.jsxs("button", {
                        className: "nd30-btn-secondary",
                        onClick: function() { E(""); g(null); f(!1); },
                        children: [e.jsx("span", { children: "🗑️" }), " Xóa trắng"]
                      })
                    ]
                  })
                ]
              }) : e.jsx("div", {
                className: "nd30-preview-box",
                dangerouslySetInnerHTML: { __html: previewHtmlContent }
              }),

              e.jsxs("div", {
                className: "nd30-action",
                children: [
                  h && e.jsxs("div", {
                    className: "nd30-loading",
                    children: [
                      e.jsx("div", {
                        className: "nd30-progress-wrap",
                        children: e.jsx("div", { className: "nd30-progress-bar", style: { width: Math.round(w) + "%" } })
                      }),
                      e.jsxs("span", { className: "nd30-progress-label", children: ["Đang tạo Word (.docx), vẽ BBT/Đồ thị & nhúng hình ảnh... ", Math.round(w), "%"] })
                    ]
                  }),
                  A && e.jsxs("div", { className: "nd30-error", children: ["⚠️ ", A] }),
                  M && !h && e.jsx("div", {
                    className: "nd30-success",
                    children: mathMode === 'omml'
                      ? "✅ Hoàn thành! File Word (.docx) đã tự động chuyển Word Equation, nhúng hình BBT/Đồ thị và căn Tab A-B-C-D."
                      : "✅ Hoàn thành! File Word (.docx) chuẩn Toggle TeX ($...$ và \\[...\\]) đã tải về — Mở Word bấm Ctrl+A rồi Alt+\\ để MathType dịch công thức."
                  }),
                  e.jsxs("button", {
                    className: "nd30-btn-process",
                    disabled: h || !d.trim(),
                    onClick: handleExportDocx,
                    children: [
                      e.jsx("span", { style: { fontSize: "1.2rem" }, children: "📥" }),
                      h ? "Đang chuyển đổi..." : (mathMode === 'omml' ? "Tải file Word (.docx) Word Equation Tự Động" : "Tải file Word (.docx) Chế độ Toggle TeX (MathType)")
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

export { Z as default };
