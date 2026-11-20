// ============================================
// FILE QUESTION PARSER MODULE
// Đọc & bóc tách đề thi từ Word (.docx), PDF (.pdf) và Text
// Hỗ trợ: OMML, MathType MTEF, WMF/EMF, Bảng số liệu, KaTeX & mhchem
// ============================================

// ============================================
// OLE 2.0 COMPOUND FILE BINARY (CFBF) PARSER
// Trích xuất stream nhị phân "Equation Native" chứa MTEF từ word/embeddings/oleObject*.bin
// ============================================
class CFBFParser {
    static extractEquationNative(buffer) {
        if (!buffer || buffer.byteLength < 512) return buffer;
        const dv = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);

        // Kiểm tra OLE Compound File Header magic: D0 CF 11 E0 A1 B1 1A E1
        const m1 = dv.getUint32(0, true);
        const m2 = dv.getUint32(4, true);
        if (m1 !== 0xE011CFD0 || m2 !== 0xE11AB1A1) {
            // Không phải CFBF -> trả về buffer gốc
            return buffer;
        }

        try {
            const sectorShift = dv.getUint16(30, true) || 9;
            const sectorSize = 1 << sectorShift;
            const miniSectorShift = dv.getUint16(32, true) || 6;
            const miniSectorSize = 1 << miniSectorShift;
            const miniCutoff = dv.getUint32(56, true) || 4096;

            const csectFat = dv.getUint32(44, true);
            const sectDirStart = dv.getUint32(48, true);
            const sectMiniFatStart = dv.getUint32(60, true);

            // Đọc DIFAT (109 entries trong header)
            const fatSectors = [];
            for (let i = 0; i < 109 && i < csectFat; i++) {
                const s = dv.getUint32(76 + i * 4, true);
                if (s !== 0xFFFFFFFF && s !== 0xFFFFFFFE) {
                    fatSectors.push(s);
                }
            }

            // Xây dựng bảng FAT
            const fat = [];
            for (let s of fatSectors) {
                const offset = (s + 1) * sectorSize;
                if (offset + sectorSize <= buffer.byteLength) {
                    for (let j = 0; j < sectorSize; j += 4) {
                        fat.push(dv.getUint32(offset + j, true));
                    }
                }
            }

            // Đọc chuỗi sectors theo FAT
            const readChain = (startSector) => {
                const chunks = [];
                let curr = startSector;
                let visited = new Set();
                while (curr < 0xFFFFFFFE && !visited.has(curr) && curr < fat.length) {
                    visited.add(curr);
                    const offset = (curr + 1) * sectorSize;
                    if (offset + sectorSize <= buffer.byteLength) {
                        chunks.push(new Uint8Array(buffer, offset, sectorSize));
                    }
                    curr = fat[curr];
                }
                const totalLen = chunks.reduce((acc, c) => acc + c.byteLength, 0);
                const res = new Uint8Array(totalLen);
                let ptr = 0;
                for (let c of chunks) {
                    res.set(c, ptr);
                    ptr += c.byteLength;
                }
                return res;
            };

            // Đọc Directory stream
            const dirData = readChain(sectDirStart);
            if (dirData.byteLength < 128) return buffer;
            const dirDv = new DataView(dirData.buffer, dirData.byteOffset, dirData.byteLength);

            // Entry 0 là Root Storage (chứa Mini-Stream container)
            const rootMiniStart = dirDv.getUint32(116, true);
            let miniStreamData = null;
            if (rootMiniStart < 0xFFFFFFFE) {
                miniStreamData = readChain(rootMiniStart);
            }

            // Đọc MiniFAT
            const miniFat = [];
            if (sectMiniFatStart < 0xFFFFFFFE) {
                const miniFatChain = readChain(sectMiniFatStart);
                const mDv = new DataView(miniFatChain.buffer, miniFatChain.byteOffset, miniFatChain.byteLength);
                for (let j = 0; j + 4 <= miniFatChain.byteLength; j += 4) {
                    miniFat.push(mDv.getUint32(j, true));
                }
            }

            // Quét tìm "Equation Native"
            const numEntries = Math.floor(dirData.byteLength / 128);
            for (let i = 0; i < numEntries; i++) {
                const eOff = i * 128;
                const nameLen = dirDv.getUint16(eOff + 64, true);
                let name = '';
                for (let k = 0; k < nameLen && k < 64; k += 2) {
                    const ch = dirDv.getUint16(eOff + k, true);
                    if (ch === 0) break;
                    name += String.fromCharCode(ch);
                }

                if (/Equation\s*Native/i.test(name)) {
                    const startSect = dirDv.getUint32(eOff + 116, true);
                    const streamSize = dirDv.getUint32(eOff + 120, true);

                    if (streamSize < miniCutoff && miniStreamData) {
                        const chunks = [];
                        let curr = startSect;
                        let visited = new Set();
                        while (curr < 0xFFFFFFFE && !visited.has(curr) && curr < miniFat.length) {
                            visited.add(curr);
                            const mOff = curr * miniSectorSize;
                            if (mOff + miniSectorSize <= miniStreamData.byteLength) {
                                chunks.push(new Uint8Array(miniStreamData.buffer, miniStreamData.byteOffset + mOff, miniSectorSize));
                            }
                            curr = miniFat[curr];
                        }
                        const totalLen = Math.min(streamSize, chunks.reduce((acc, c) => acc + c.byteLength, 0));
                        const res = new Uint8Array(totalLen);
                        let ptr = 0;
                        for (let c of chunks) {
                            const copyLen = Math.min(c.byteLength, totalLen - ptr);
                            res.set(c.subarray(0, copyLen), ptr);
                            ptr += copyLen;
                            if (ptr >= totalLen) break;
                        }
                        return res.buffer;
                    } else {
                        const fullChain = readChain(startSect);
                        return fullChain.subarray(0, streamSize).buffer;
                    }
                }
            }
        } catch (e) {
            console.warn('Lỗi bóc tách CFBF OLE:', e);
        }

        return buffer;
    }
}

// ============================================
// MATHTYPE EQUATION FORMAT (MTEF) DECODER  v3 / v4 / v5
// Giải mã đúng cấu trúc bản ghi MTEF (LINE, CHAR, TMPL, PILE, MATRIX, EMBELL...) sang LaTeX.
// Nguồn: OLE "Equation Native" trong word/embeddings/*.bin (MathType 6/7 & Equation Editor 3.0)
// Nguyên tắc an toàn: gặp cấu trúc lạ -> trả về '' để hệ thống tự dùng ảnh WMF/EMF dự phòng
// (không bao giờ sinh công thức rác).
// ============================================
class MTEFParser {
    static parse(buffer) {
        try {
            return MTEFParser._decode(buffer);
        } catch (e) {
            console.warn('MTEF: không giải mã được công thức, dùng ảnh dự phòng:', e && e.message);
            return '';
        }
    }

    // ---------- Bảng ánh xạ ----------
    static get SYMBOL_FONT() {
        // Mã ký tự trong font Symbol (dùng cho Equation Editor 3.0 và ký tự 8-bit) -> LaTeX
        if (!MTEFParser._sym) {
            const g = 'abgdezhqiklmnoprstufcyw';
            const gl = ['\\alpha','\\beta','\\gamma','\\delta','\\varepsilon','\\zeta','\\eta','\\theta','\\iota','\\kappa','\\lambda','\\mu','\\nu','o','\\pi','\\rho','\\sigma','\\tau','\\upsilon','\\varphi','\\chi','\\psi','\\omega'];
            const gu = ['A','B','\\Gamma','\\Delta','E','Z','H','\\Theta','I','K','\\Lambda','M','N','O','\\Pi','P','\\Sigma','T','Y','\\Phi','X','\\Psi','\\Omega'];
            const t = {};
            for (let i = 0; i < g.length; i++) {
                t[g.charCodeAt(i)] = gl[i];
                t[g.toUpperCase().charCodeAt(i)] = gu[i];
            }
            t[0x71] = '\\theta'; t[0x6A] = '\\varphi'; t[0x66] = '\\phi'; t[0x76] = '\\varpi'; t[0x56] = '\\varsigma';
            t[0x6F] = 'o'; t[0x4A] = '\\vartheta'; t[0x57] = '\\Omega'; t[0x58] = '\\Xi'; t[0x78] = '\\xi'; t[0x63] = '\\chi';
            t[0x7A] = '\\zeta'; t[0x59] = '\\Psi'; t[0x51] = '\\Theta'; t[0x46] = '\\Phi'; t[0x65] = '\\varepsilon';
            Object.assign(t, {
                0xB1: '\\pm', 0xB4: '\\times', 0xB8: '\\div', 0xB3: '\\ge', 0xA3: '\\le', 0xB9: '\\ne', 0xBB: '\\approx',
                0xAE: '\\rightarrow', 0xAC: '\\leftarrow', 0xAB: '\\leftrightarrow', 0xAD: '\\uparrow', 0xAF: '\\downarrow',
                0xDE: '\\Rightarrow', 0xDC: '\\Leftarrow', 0xDB: '\\Leftrightarrow', 0xA5: '\\infty', 0xB6: '\\partial',
                0xD1: '\\nabla', 0xB0: '^\\circ', 0xD7: '\\cdot', 0xB7: '\\bullet', 0xCE: '\\in', 0xCF: '\\notin',
                0xCC: '\\subset', 0xCD: '\\subseteq', 0xC9: '\\supset', 0xCA: '\\supseteq', 0xC8: '\\cup', 0xC7: '\\cap',
                0xC6: '\\emptyset', 0xD6: '\\surd', 0xB5: '\\propto', 0xBA: '\\equiv', 0xD5: '\\prod', 0xE5: '\\sum',
                0xF2: '\\int', 0xA2: "'", 0xB2: "''", 0x22: '\\forall', 0x24: '\\exists', 0x2D: '-', 0x2A: '*',
                0x40: '\\cong', 0x5C: '\\therefore', 0xBC: '\\ldots', 0xD0: '\\angle', 0x5E: '\\perp', 0x7E: '\\sim',
                0xA4: '/', 0xE9: '\\lceil', 0xF9: '\\rceil', 0xEB: '\\lfloor', 0xFB: '\\rfloor', 0xE1: '\\langle', 0xF1: '\\rangle',
                0xB2: '\\geq', 0xD4: '\\mathrm{TM}', 0xF3: '\\int'
            });
            t[0xB2] = "''";
            MTEFParser._sym = t;
        }
        return MTEFParser._sym;
    }

    static get UNICODE_MAP() {
        if (!MTEFParser._uni) {
            MTEFParser._uni = {
                0x03B1: '\\alpha', 0x03B2: '\\beta', 0x03B3: '\\gamma', 0x03B4: '\\delta', 0x03B5: '\\varepsilon', 0x03F5: '\\epsilon',
                0x03B6: '\\zeta', 0x03B7: '\\eta', 0x03B8: '\\theta', 0x03D1: '\\vartheta', 0x03B9: '\\iota', 0x03BA: '\\kappa',
                0x03BB: '\\lambda', 0x03BC: '\\mu', 0x00B5: '\\mu', 0x03BD: '\\nu', 0x03BE: '\\xi', 0x03BF: 'o', 0x03C0: '\\pi', 0x03D6: '\\varpi',
                0x03C1: '\\rho', 0x03C2: '\\varsigma', 0x03C3: '\\sigma', 0x03C4: '\\tau', 0x03C5: '\\upsilon', 0x03C6: '\\varphi', 0x03D5: '\\phi',
                0x03C7: '\\chi', 0x03C8: '\\psi', 0x03C9: '\\omega',
                0x0393: '\\Gamma', 0x0394: '\\Delta', 0x0398: '\\Theta', 0x039B: '\\Lambda', 0x039E: '\\Xi', 0x03A0: '\\Pi',
                0x03A3: '\\Sigma', 0x03A5: '\\Upsilon', 0x03A6: '\\Phi', 0x03A8: '\\Psi', 0x03A9: '\\Omega', 0x2126: '\\Omega',
                0x0391: 'A', 0x0392: 'B', 0x0395: 'E', 0x0396: 'Z', 0x0397: 'H', 0x0399: 'I', 0x039A: 'K', 0x039C: 'M', 0x039D: 'N',
                0x039F: 'O', 0x03A1: 'P', 0x03A4: 'T', 0x03A7: 'X',
                0x00B1: '\\pm', 0x2213: '\\mp', 0x00D7: '\\times', 0x00F7: '\\div', 0x22C5: '\\cdot', 0x00B7: '\\cdot', 0x2219: '\\cdot',
                0x2022: '\\bullet', 0x2217: '\\ast', 0x2218: '\\circ', 0x2A2F: '\\times',
                0x2264: '\\le', 0x2265: '\\ge', 0x2260: '\\ne', 0x2248: '\\approx', 0x2245: '\\cong', 0x2261: '\\equiv', 0x223C: '\\sim',
                0x221D: '\\propto', 0x226A: '\\ll', 0x226B: '\\gg', 0x2266: '\\leq', 0x2267: '\\geq',
                0x2192: '\\rightarrow', 0x2190: '\\leftarrow', 0x2194: '\\leftrightarrow', 0x2191: '\\uparrow', 0x2193: '\\downarrow',
                0x21D2: '\\Rightarrow', 0x21D0: '\\Leftarrow', 0x21D4: '\\Leftrightarrow', 0x27F6: '\\longrightarrow', 0x27F5: '\\longleftarrow',
                0x27F9: '\\Longrightarrow', 0x27FA: '\\Longleftrightarrow', 0x21CC: '\\rightleftharpoons', 0x21C4: '\\rightleftarrows',
                0x21A6: '\\mapsto', 0x2197: '\\nearrow', 0x2198: '\\searrow',
                0x221E: '\\infty', 0x2202: '\\partial', 0x2207: '\\nabla', 0x2220: '\\angle', 0x22A5: '\\perp', 0x2225: '\\parallel',
                0x25B3: '\\triangle', 0x2206: '\\Delta', 0x25A1: '\\square', 0x2113: '\\ell', 0x210F: '\\hbar', 0x2135: '\\aleph',
                0x2208: '\\in', 0x2209: '\\notin', 0x220B: '\\ni', 0x2282: '\\subset', 0x2283: '\\supset', 0x2286: '\\subseteq', 0x2287: '\\supseteq',
                0x222A: '\\cup', 0x2229: '\\cap', 0x2205: '\\emptyset', 0x2200: '\\forall', 0x2203: '\\exists', 0x2234: '\\therefore', 0x2235: '\\because',
                0x2227: '\\wedge', 0x2228: '\\vee', 0x00AC: '\\neg', 0x2295: '\\oplus', 0x2297: '\\otimes',
                0x221A: '\\surd', 0x2211: '\\sum', 0x220F: '\\prod', 0x222B: '\\int', 0x222C: '\\iint', 0x222D: '\\iiint', 0x222E: '\\oint',
                0x2212: '-', 0x2013: '-', 0x2014: '-', 0x2010: '-', 0x2011: '-',
                0x00B0: '^\\circ', 0x2103: '^\\circ C', 0x2109: '^\\circ F', 0x2032: "'", 0x2033: "''", 0x2034: "'''", 0x00B4: "'", 0x0060: '`',
                0x2026: '\\ldots', 0x22EF: '\\cdots', 0x22EE: '\\vdots', 0x22F1: '\\ddots', 0x2308: '\\lceil', 0x2309: '\\rceil', 0x230A: '\\lfloor', 0x230B: '\\rfloor',
                0x2329: '\\langle', 0x232A: '\\rangle', 0x27E8: '\\langle', 0x27E9: '\\rangle', 0x3008: '\\langle', 0x3009: '\\rangle',
                0x00BD: '\\frac{1}{2}', 0x00BC: '\\frac{1}{4}', 0x00BE: '\\frac{3}{4}',
                0x00B2: '^{2}', 0x00B3: '^{3}', 0x00B9: '^{1}', 0x2070: '^{0}', 0x207F: '^{n}', 0x207A: '^{+}', 0x207B: '^{-}',
                0x00A0: ' ', 0x2002: '\\ ', 0x2003: '\\quad ', 0x2009: '\\, ', 0x200A: '\\, ', 0x2005: '\\; ', 0x2004: '\\; ', 0x2006: '\\, ', 0x202F: '\\, ',
                0x2061: '', 0x2062: '', 0x2063: '', 0x2064: '', 0x200B: '', 0x200C: '', 0x200D: '', 0xFEFF: '', 0x00AD: ''
            };
            for (let d = 0x2080; d <= 0x2089; d++) MTEFParser._uni[d] = '_{' + (d - 0x2080) + '}';
            for (let d = 0x2074; d <= 0x2079; d++) MTEFParser._uni[d] = '^{' + (d - 0x2070) + '}';
        }
        return MTEFParser._uni;
    }

    static get FUNC_NAMES() {
        return {
            sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot', sec: '\\sec', csc: '\\csc', cosec: '\\csc',
            arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan', sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', coth: '\\coth',
            log: '\\log', ln: '\\ln', lg: '\\lg', lim: '\\lim', max: '\\max', min: '\\min', sup: '\\sup', inf: '\\inf',
            det: '\\det', exp: '\\exp', gcd: '\\gcd', deg: '\\deg', dim: '\\dim', ker: '\\ker', arg: '\\arg', hom: '\\hom',
            limsup: '\\limsup', liminf: '\\liminf', Pr: '\\Pr', tg: '\\mathrm{tg}', cotg: '\\mathrm{cotg}'
        };
    }

    // ---------- Ký tự đơn ----------
    // Trả về { s: chuỗi LaTeX, plain: ký tự thuần (để gom từ) }
    static _mapChar(code, typeface, from8bit) {
        if (!code) return { s: '', plain: '' };
        // Vùng private 0xF0xx = ký tự font Symbol
        if (code >= 0xF000 && code <= 0xF0FF) { code -= 0xF000; from8bit = true; }
        const symbolFace = (typeface === 4 || typeface === 5 || typeface === 6 || typeface === 7 || typeface === 11);
        if ((from8bit || (symbolFace && code < 0x100)) && code >= 0x20 && code < 0x100 && (symbolFace || from8bit === 'symbol')) {
            const m = MTEFParser.SYMBOL_FONT[code];
            if (m !== undefined) return { s: ' ' + m + ' ', plain: '' };
        }
        if (code >= 0x20 && code <= 0x7E) {
            const c = String.fromCharCode(code);
            const esc = {
                '<': ' \\lt ', '>': ' \\gt ', '%': '\\%', '&': '\\&', '#': '\\#', '$': '\\$', '_': '\\_', '{': '\\{', '}': '\\}',
                '~': '\\sim ', '^': '\\wedge ', '\\': '\\backslash '
            };
            return { s: esc[c] !== undefined ? esc[c] : c, plain: c };
        }
        const u = MTEFParser.UNICODE_MAP[code];
        if (u !== undefined) return { s: u === '' ? '' : (/^[\^_]/.test(u) ? u : ' ' + u + ' '), plain: u === ' ' ? ' ' : '' };
        // Vùng private của MathType (ký tự đệm, khoảng cách) -> bỏ qua
        if (code >= 0xE000 && code <= 0xF8FF) return { s: '', plain: '' };
        if (code >= 0x80) {
            const c = String.fromCharCode(code);
            return { s: c, plain: c };
        }
        return { s: '', plain: '' };
    }

    static _fmtRun(run, typeface) {
        if (!run) return '';
        // Cả Text lẫn Function: chỉ gồm dấu câu / số / ngoặc (không có chữ cái) -> in trực tiếp, không bọc \mathrm
        if (!/[A-Za-z\u00C0-\u1EF9]/.test(run)) {
            return [...run].map(ch => MTEFParser._mapChar(ch.charCodeAt(0), 8, false).s).join('');
        }
        if (typeface === 2) {
            const t = run.replace(/\s+/g, '');
            const f = MTEFParser.FUNC_NAMES[t];
            if (f) return ' ' + f + ' ';
            return '\\mathrm{' + MTEFParser._escText(t) + '}';
        }
        const esc = MTEFParser._escText(run);
        if (/^[A-Za-z0-9.,;:()\-+=*\/!?'\[\]|]+$/.test(run)) return '\\mathrm{' + esc + '}';
        return '\\text{' + esc + '}';
    }

    static _escText(s) {
        return s.replace(/\\/g, '\\textbackslash ').replace(/([{}$%&#_])/g, '\\$1').replace(/\^/g, '\\^{}').replace(/~/g, '\\~{}');
    }

    static _embell(type, base) {
        switch (type) {
            case 2: return `\\dot{${base}}`;
            case 3: return `\\ddot{${base}}`;
            case 4: return `\\dddot{${base}}`;
            case 5: return `${base}'`;
            case 6: return `${base}''`;
            case 7: return `${base}'`;
            case 8: return `\\tilde{${base}}`;
            case 9: return `\\hat{${base}}`;
            case 11: return `\\overrightarrow{${base}}`;
            case 12: return `\\overleftarrow{${base}}`;
            case 13: return `\\overleftrightarrow{${base}}`;
            case 14: return `\\overrightarrow{${base}}`;
            case 15: return `\\overleftarrow{${base}}`;
            case 16: return `\\underline{${base}}`;
            case 17: return `\\overline{${base}}`;
            case 18: return `\\overset{\\frown}{${base}}`;
            case 19: return `\\overset{\\smile}{${base}}`;
            default: return base;
        }
    }

    // ---------- Giải mã chính ----------
    static _decode(buffer) {
        if (!buffer || buffer.byteLength < 8) return '';
        const native = CFBFParser.extractEquationNative(buffer);
        const bytes = (native instanceof Uint8Array) ? native : new Uint8Array(native instanceof ArrayBuffer ? native : native.buffer);
        const len = bytes.length;

        // 1. Xác định vị trí bắt đầu MTEF
        let start = -1;
        if (len > 33 && (bytes[0] | (bytes[1] << 8)) === 28) {
            // EQNOLEFILEHDR (28 byte) rồi tới header MTEF
            const v = bytes[28];
            if (v >= 1 && v <= 5 && bytes[29] <= 1 && bytes[30] <= 1) start = 28;
        }
        if (start < 0) {
            // MTEF v5 có application key bắt đầu bằng "DSMT"
            for (let i = 5; i <= len - 5; i++) {
                if (bytes[i] === 0x44 && bytes[i + 1] === 0x53 && bytes[i + 2] === 0x4D && bytes[i + 3] === 0x54) {
                    const s = i - 5;
                    if (bytes[s] === 5 && bytes[s + 1] <= 1 && bytes[s + 2] <= 1) { start = s; break; }
                }
            }
        }
        if (start < 0) return '';

        let pos = start;
        const ver = bytes[pos];
        pos += 5; // version, platform, product, prodVersion, prodSubVersion

        const u8 = () => { if (pos >= len) throw new Error('hết dữ liệu'); return bytes[pos++]; };
        const u16 = () => { const a = u8(); const b = u8(); return a | (b << 8); };
        const cstr = () => { let s = ''; while (pos < len && bytes[pos] !== 0) s += String.fromCharCode(bytes[pos++]); pos++; return s; };

        if (ver >= 5) {
            cstr(); // application key ("DSMT6", "DSMT7"...)
            u8();   // equation options (bit0 = inline)
        }

        const skipNudge = () => {
            const dx = u8(), dy = u8();
            if (dx === 128 && dy === 128) pos += 4;
        };
        const isPrintableStr = (p) => {
            let n = 0;
            while (p < len && bytes[p] >= 0x20 && bytes[p] <= 0x7E) { p++; n++; }
            return n >= 2 && p < len && bytes[p] === 0;
        };

        const readHeader = () => {
            const b = u8();
            if (ver >= 5) {
                const tag = b;
                const opts = (tag >= 1 && tag <= 6) ? u8() : 0;
                return { tag, opts };
            }
            return { tag: b & 0x0F, opts: b >> 4 };
        };

        let guard = 0;
        const parseObjects = () => {
            const items = [];
            while (pos < len) {
                if (++guard > 200000) throw new Error('quá lớn');
                const h = readHeader();
                if (h.tag === 0) break;
                const it = parseObject(h.tag, h.opts);
                if (it) items.push(it);
            }
            return items;
        };

        const renderItems = (items) => {
            let out = '';
            let i = 0;
            while (i < items.length) {
                const it = items[i];
                if (it.t === 'c' && (it.tf === 1 || it.tf === 2) && !it.emb && it.plain) {
                    let j = i, run = '';
                    while (j < items.length && items[j].t === 'c' && items[j].tf === it.tf && !items[j].emb && (items[j].plain || items[j].plain === ' ')) {
                        run += items[j].plain; j++;
                    }
                    if (j > i) {
                        out += MTEFParser._fmtRun(run, it.tf);
                        i = j;
                        continue;
                    }
                }
                out += it.s;
                i++;
            }
            return out;
        };

        const parseObject = (tag, opts) => {
            switch (tag) {
                case 1: { // LINE
                    if (opts & 0x08) skipNudge();
                    if (opts & 0x04) pos += (ver >= 5 ? 2 : 1);
                    if (opts & 0x01) return { t: 'line', s: '' }; // dòng rỗng (không có danh sách đối tượng)
                    const items = parseObjects();
                    const only = (items.length === 1 && items[0].t === 'pile') ? items[0] : null;
                    return { t: 'line', s: renderItems(items), pile: only };
                }
                case 2: { // CHAR
                    if (opts & 0x08) skipNudge();
                    let tf = u8();
                    tf = (tf >= 128) ? tf - 128 : tf;
                    let mt = null, c8 = null, c16 = null;
                    if (ver >= 5) {
                        if (!(opts & 0x20)) mt = u16();
                        if (opts & 0x04) c8 = u8();
                        if (opts & 0x10) c16 = u16();
                    } else {
                        c8 = u8();
                        if (opts & 0x04 && false) c16 = null;
                    }
                    const emb = [];
                    const hasEmb = ver >= 5 ? (opts & 0x01) : (opts & 0x02);
                    if (hasEmb) {
                        while (pos < len) {
                            const h = readHeader();
                            if (h.tag === 0) break;
                            if (h.tag !== 6) throw new Error('embellishment lạ');
                            if (h.opts & 0x08) skipNudge();
                            emb.push(u8());
                        }
                    }
                    let res;
                    if (mt !== null && mt !== 0 && !(mt >= 0xF000 && mt <= 0xF0FF && c8 !== null)) {
                        res = MTEFParser._mapChar(mt, tf, false);
                    } else if (mt !== null && mt >= 0xF000 && mt <= 0xF0FF) {
                        res = MTEFParser._mapChar(mt, tf, 'symbol');
                    } else {
                        const code = (c16 !== null) ? c16 : c8;
                        res = MTEFParser._mapChar(code, tf, (tf === 4 || tf === 5 || tf === 6 || tf === 7 || tf === 11) ? 'symbol' : false);
                    }
                    let s = res.s;
                    if (emb.length && s.trim()) {
                        s = s.trim();
                        for (const e of emb) s = MTEFParser._embell(e, s);
                        s = ' ' + s + ' ';
                    }
                    return { t: 'c', s, plain: res.plain, tf, emb: emb.length > 0, glyph: (mt || c8 || c16 || 0) };
                }
                case 3: { // TMPL
                    if (opts & 0x08) skipNudge();
                    const sel = u8();
                    let vr = u8();
                    if (vr & 0x80) vr = (vr & 0x7F) | (u8() << 8);
                    u8(); // template-specific options
                    const kids = parseObjects();
                    return { t: 'x', s: MTEFParser._template(sel, vr, kids) };
                }
                case 4: { // PILE
                    if (opts & 0x08) skipNudge();
                    const halign = u8();
                    u8(); // valign
                    const kids = parseObjects();
                    const lines = kids.filter(k => k.t === 'line').map(k => k.s);
                    const al = halign === 2 ? 'c' : (halign === 3 ? 'r' : 'l');
                    return {
                        t: 'pile', lines,
                        s: `\\begin{array}{${al}} ${lines.join(' \\\\ ')} \\end{array}`
                    };
                }
                case 5: { // MATRIX
                    if (opts & 0x08) skipNudge();
                    u8(); u8(); u8(); // valign, h_just, v_just
                    const rows = u8(), cols = u8();
                    pos += Math.ceil((rows + 1) * 2 / 8) + Math.ceil((cols + 1) * 2 / 8);
                    const kids = parseObjects().filter(k => k.t === 'line').map(k => k.s);
                    const rs = [];
                    for (let r = 0; r < rows; r++) rs.push(kids.slice(r * cols, (r + 1) * cols).join(' & '));
                    return { t: 'matrix', s: `\\begin{array}{${'c'.repeat(Math.max(cols, 1))}} ${rs.join(' \\\\ ')} \\end{array}` };
                }
                case 6: { // EMBELL (lạc chỗ) - bỏ qua
                    if (opts & 0x08) skipNudge();
                    u8();
                    return null;
                }
                case 7: { // RULER
                    const n = u8();
                    pos += 3 * n;
                    return null;
                }
                case 8: { // FONT_STYLE_DEF (v5) / FONT (v3)
                    if (ver >= 5) { pos += 2; } else { pos += 2; cstr(); }
                    return null;
                }
                case 9: { // SIZE
                    const b = u8();
                    pos += (b === 101) ? 2 : 1;
                    return null;
                }
                case 10: case 11: case 12: case 13: case 14: // FULL, SUB, SUB2, SYM, SUBSYM
                    return null;
                case 15: // COLOR
                    u8();
                    return null;
                case 16: { // COLOR_DEF
                    const save = pos;
                    const tryRead = (w) => {
                        pos = save;
                        const o = u8();
                        pos += ((o & 0x01) ? 4 : 3) * w;
                        if (o & 0x04) cstr();
                        return pos <= len && (pos >= len || bytes[pos] <= 19);
                    };
                    if (!tryRead(2)) { if (!tryRead(1)) throw new Error('COLOR_DEF lạ'); }
                    return null;
                }
                case 17: // FONT_DEF
                    u8(); cstr();
                    return null;
                case 18: { // EQN_PREFS: [options][sizes][spaces][styles]
                    u8(); // options
                    const readNibbleArray = () => {
                        const count = u8();
                        let hi = true, cur = 0;
                        const nib = () => {
                            if (hi) { cur = u8(); hi = false; return cur >> 4; }
                            hi = true; return cur & 0x0F;
                        };
                        for (let i = 0; i < count; i++) {
                            let guardN = 0;
                            nib();                       // đơn vị (inch, cm, pt, pica, %)
                            while (nib() !== 0x0F) { if (++guardN > 40) throw new Error('EQN_PREFS lạ'); }
                        }
                    };
                    readNibbleArray(); // sizes
                    readNibbleArray(); // spaces
                    const nStyles = u8();
                    for (let i = 0; i < nStyles; i++) {
                        if (u8() !== 0) u8();            // font_def_index (+ char_style nếu khác 0)
                    }
                    return null;
                }
                case 19: // ENCODING_DEF
                    cstr();
                    return null;
                default:
                    throw new Error('Bản ghi MTEF không hỗ trợ: ' + tag);
            }
        };

        const items = parseObjects();
        const latex = renderItems(items).replace(/\s+/g, ' ').trim();
        return latex;
    }

    // ---------- Mẫu (template) -> LaTeX ----------
    static _template(sel, v, kids) {
        const slots = kids.filter(k => k.t === 'line' || k.t === 'pile' || k.t === 'matrix');
        const ls = slots.map(k => (k.s || '').trim());
        const l = (i) => ls[i] || '';
        const chars = kids.filter(k => k.t === 'c');
        const nonEmpty = ls.filter(x => x);
        const g = (x) => `{${x}}`;

        const FENCE = {
            0: ['\\langle', '\\rangle'], 1: ['(', ')'], 2: ['\\{', '\\}'], 3: ['[', ']'], 4: ['|', '|'], 5: ['\\|', '\\|'],
            6: ['\\lfloor', '\\rfloor'], 7: ['\\lceil', '\\rceil'], 8: ['[', ']'], 9: ['(', ']']
        };
        if (sel >= 0 && sel <= 9) {
            let [lf, rt] = FENCE[sel];
            const hasL = (v & 1) || !(v & 3);
            const hasR = (v & 2) || !(v & 3);
            if (sel === 8) { lf = ']'; rt = '['; }
            // khoảng (tmINTERVAL): lấy ký tự ngoặc thật nếu có
            if (sel === 9 && chars.length >= 2) {
                const dm = (c) => ({ 0x28: '(', 0x29: ')', 0x5B: '[', 0x5D: ']' }[c.glyph] || '.');
                lf = dm(chars[0]); rt = dm(chars[chars.length - 1]);
            }
            const main = slots[0];
            const content = main ? (main.s || '') : '';
            const pile = main && (main.t === 'pile' ? main : main.pile);
            if (sel === 2 && hasL && !hasR && pile) {
                return ` \\begin{cases} ${pile.lines.join(' \\\\ ')} \\end{cases} `;
            }
            return ` \\left${hasL ? lf : '.'} ${content} \\right${hasR ? rt : '.'} `;
        }

        switch (sel) {
            case 10: { // căn
                const idx = l(1);
                if ((v & 1) || idx) return idx ? `\\sqrt[${idx}]{${l(0)}}` : `\\sqrt{${l(0)}}`;
                return `\\sqrt{${l(0)}}`;
            }
            case 11: return `\\frac{${l(0)}}{${l(1)}}`;
            case 12: return `\\underline{${l(0)}}`;
            case 13: return `\\overline{${l(0)}}`;
            case 14: { // mũi tên có chữ trên/dưới (phản ứng hóa học)
                const gset = chars.map(c => c.glyph);
                const has = (x) => gset.indexOf(x) >= 0;
                let gl = gset.length ? gset[gset.length - 1] : 0x2192;
                if (has(0x21CC) || has(0x21C4) || (has(0x21C0) && has(0x21BD)) || (has(0x21C1) && has(0x21BC))) gl = 0x21CC;
                else if (has(0x2192) && has(0x2190)) gl = 0x2194;
                let top = '', bot = '';
                if (ls.length >= 2) { top = l(0); bot = l(1); }
                else if (ls.length === 1) { if ((v & 0x20) && !(v & 0x10)) bot = l(0); else top = l(0); }
                const kind = ({ 0x21CC: 'xrightleftharpoons', 0x21C4: 'xrightleftharpoons', 0x2190: 'xleftarrow', 0x27F5: 'xleftarrow', 0x2194: 'xleftrightarrow' })[gl] || 'xrightarrow';
                if (!top && !bot) {
                    const base = ({ xrightleftharpoons: '\\rightleftharpoons', xleftarrow: '\\leftarrow', xleftrightarrow: '\\leftrightarrow', xrightarrow: '\\rightarrow' })[kind];
                    return ` ${base} `;
                }
                return ` \\${kind}${bot ? `[${bot}]` : ''}{${top}} `;
            }
            case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: { // tích phân & toán tử lớn
                let op;
                const gl = chars.length ? chars[chars.length - 1].glyph : 0;
                if (sel === 15) {
                    op = ({ 0x222B: '\\int', 0x222C: '\\iint', 0x222D: '\\iiint', 0x222E: '\\oint' })[gl] || ((v & 3) === 2 ? '\\iint' : '\\int');
                } else {
                    op = ({ 16: '\\sum', 17: '\\prod', 18: '\\coprod', 19: '\\bigcup', 20: '\\bigcap' })[sel];
                    if (!op) op = ({ 0x2211: '\\sum', 0x220F: '\\prod', 0x222B: '\\int', 0x222E: '\\oint', 0x222A: '\\bigcup', 0x2229: '\\bigcap' })[gl] || '\\sum';
                }
                const main = l(0);
                let lo = '', up = '';
                if (ls.length >= 3) { lo = l(1); up = l(2); }
                else if (ls.length === 2) { if ((v & 2) && !(v & 1)) up = l(1); else lo = l(1); }
                return ` ${op}${lo ? `_{${lo}}` : ''}${up ? `^{${up}}` : ''} ${main} `;
            }
            case 23: { // lim
                const lo = l(1);
                return ` \\mathop{${l(0)}}\\limits${lo ? `_{${lo}}` : ''} `;
            }
            case 24: case 25: { // ngoặc ngang
                const lab = l(1);
                const over = (v & 1);
                const fn = sel === 24 ? (over ? 'overbrace' : 'underbrace') : (over ? 'overbracket' : 'underbracket');
                const f2 = (fn.indexOf('bracket') >= 0) ? (over ? 'overbrace' : 'underbrace') : fn;
                return `\\${f2}{${l(0)}}${lab ? (over ? `^{${lab}}` : `_{${lab}}`) : ''}`;
            }
            case 26: return l(0);
            case 27: return `_{${nonEmpty[0] || ''}}`;
            case 28: return `^{${nonEmpty[0] || ''}}`;
            case 29: {
                const a = l(0), b = l(1);
                return `${a ? `_{${a}}` : ''}${b ? `^{${b}}` : ''}`;
            }
            case 30: return ` \\left\\langle ${l(0)} \\right| `;
            case 31: { // vectơ
                const left = v & 1, right = v & 2, under = (v & 4) && !(v & 8);
                const arrow = (left && right) ? '\\leftrightarrow' : (left ? '\\leftarrow' : '\\rightarrow');
                if (under) return `\\underset{${arrow}}{${l(0)}}`;
                const cmd = (left && right) ? 'overleftrightarrow' : (left ? 'overleftarrow' : 'overrightarrow');
                return `\\${cmd}{${l(0)}}`;
            }
            case 32: return `\\widetilde{${l(0)}}`;
            case 33: return `\\widehat{${l(0)}}`;
            case 34: return `\\overset{\\frown}{${l(0)}}`;
            case 35: return l(0);
            case 36: return `\\cancel{${l(0)}}`;
            case 37: return `\\boxed{${l(0)}}`;
            default:
                return ls.join(' ');
        }
    }
}

class FileQuestionParser {
    constructor() {
        // Cấu hình worker cho PDF.js nếu có
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    // Đọc file chính với tùy chọn kiểu câu & số lượng câu
    async parseFile(file, options = {}) {
        const fileName = file.name.toLowerCase();
        let extractedText = '';

        if (fileName.endsWith('.docx')) {
            extractedText = await this.parseDocx(file);
        } else if (fileName.endsWith('.pdf')) {
            extractedText = await this.parsePdf(file);
        } else if (fileName.endsWith('.txt')) {
            extractedText = await this.parseTxt(file);
        } else if (fileName.endsWith('.csv')) {
            extractedText = await this.parseTxt(file);
            return this.parseCsv(extractedText, options);
        } else {
            throw new Error('Định dạng file không hỗ trợ. Vui lòng chọn file .docx, .pdf, .txt hoặc .csv');
        }

        return this.parseQuestionsFromText(extractedText, options);
    }

    // Đọc file Word (.docx) bảo toàn 100% công thức MathType và Word Equation (OMML)
    async parseDocx(file) {
        // Ưu tiên 1: Dùng JSZip đọc trực tiếp word/document.xml để chuyển OMML/MathType sang LaTeX
        if (window.JSZip) {
            try {
                const text = await this.parseDocxWithJSZip(file);
                if (text && text.trim().length > 15) {
                    return text;
                }
            } catch (err) {
                console.warn('Lỗi phân tích JSZip docx, dùng dự phòng Mammoth:', err);
            }
        }

        // Dự phòng 2: Dùng Mammoth.js
        if (window.mammoth) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            return this.autoFormatChemistry(result.value || '');
        }

        throw new Error('Chưa tải được thư viện giải mã file Word (JSZip / Mammoth). Vui lòng thử lại.');
    }

    // Giải nén .docx bằng JSZip và duyệt toàn bộ cây XML theo đúng thứ tự (đoạn văn bản + bảng biểu)
    async parseDocxWithJSZip(file) {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        const docXmlFile = zip.file('word/document.xml');
        if (!docXmlFile) {
            throw new Error('Không tìm thấy word/document.xml trong file docx.');
        }

        // 1. Trích xuất toàn bộ ảnh nhúng và công thức OLE / MathType MTEF
        const { imagesMap, formulasMap } = await this.extractDocxMediaAndFormulas(zip);

        const docXmlStr = await docXmlFile.async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');

        const body = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.documentElement;
        const lines = [];

        const processContainer = (parent) => {
            for (let child of parent.childNodes) {
                const name = child.localName || child.nodeName.split(':').pop();
                if (name === 'p') {
                    const pText = this.processParagraphNode(child, imagesMap, formulasMap);
                    if (pText && pText.trim().length > 0) {
                        lines.push(pText.trim());
                    }
                } else if (name === 'tbl') {
                    // Xử lý bảng biểu (Câu 10)
                    const tblHtml = this.processTableNode(child, imagesMap, formulasMap);
                    if (tblHtml) {
                        lines.push(tblHtml);
                    }
                } else if (name === 'sdt' || name === 'sdtContent' || name === 'ins') {
                    processContainer(child);
                }
            }
        };

        processContainer(body);

        return lines.join('\n');
    }

    // Xử lý bảng biểu w:tbl thành bảng HTML responsive và giữ trọn công thức (Câu 10)
    processTableNode(tblNode, imagesMap = {}, formulasMap = {}) {
        let html = '<div class="doc-table-wrap"><table class="doc-table">';
        const trEls = this.getChildrenByLocalName(tblNode, 'tr');
        if (trEls.length === 0) return '';

        for (let r = 0; r < trEls.length; r++) {
            html += '<tr>';
            const tcEls = this.getChildrenByLocalName(trEls[r], 'tc');
            for (let c = 0; c < tcEls.length; c++) {
                const pEls = this.getChildrenByLocalName(tcEls[c], 'p');
                let cellText = '';
                for (let p of pEls) {
                    const line = this.processParagraphNode(p, imagesMap, formulasMap);
                    if (line && line.trim()) {
                        cellText += (cellText ? '<br>' : '') + line.trim();
                    }
                }
                const tag = (r === 0) ? 'th' : 'td';
                html += `<${tag}>${cellText || '&nbsp;'}</${tag}>`;
            }
            html += '</tr>';
        }
        html += '</table></div>';
        return html;
    }

    // Trích xuất chuỗi ký tự TextOut / ExtTextOut từ file WMF (hỗ trợ đọc trực tiếp chữ trong công thức MathType như HCl, NaOH)
    extractTextFromWmf(buffer) {
        if (!buffer || buffer.byteLength < 24) return '';
        const dv = new DataView(buffer);
        let offset = 0;
        if (dv.getUint32(0, true) === 0x9AC6CDD7) {
            offset = 22;
        }
        offset += 18; // WMF Standard Header

        const textParts = [];
        while (offset + 6 <= buffer.byteLength) {
            const rdSize = dv.getUint32(offset, true) * 2;
            const rdFunc = dv.getUint16(offset + 4, true);
            if (rdSize < 6 || rdFunc === 0x0000) break;

            if (rdFunc === 0x0521 || rdFunc === 0x0A32) {
                let strLen = 0, textOffset = 0;
                if (rdFunc === 0x0521) {
                    strLen = dv.getInt16(offset + 6, true);
                    textOffset = offset + 8;
                } else {
                    strLen = dv.getInt16(offset + 10, true);
                    const fwOpts = dv.getUint16(offset + 12, true);
                    textOffset = (fwOpts & 0x0006) ? offset + 22 : offset + 14;
                }
                if (strLen > 0 && textOffset + strLen <= buffer.byteLength) {
                    const bytes = new Uint8Array(buffer, textOffset, strLen);
                    let decoded = '';
                    try {
                        decoded = new TextDecoder('windows-1258').decode(bytes);
                    } catch (e) {
                        decoded = String.fromCharCode.apply(null, bytes);
                    }
                    if (!decoded || /[\x00-\x08\x0E-\x1F]/.test(decoded)) {
                        decoded = String.fromCharCode.apply(null, bytes);
                    }
                    const cleaned = decoded.replace(/[\x00-\x1F]/g, '').trim();
                    if (cleaned) {
                        textParts.push(cleaned);
                    }
                }
            }
            offset += rdSize;
        }
        return textParts.join('');
    }

    // Trích xuất toàn bộ ảnh, vector WMF/EMF và đối tượng công thức OLE / MTEF từ file .docx
    async extractDocxMediaAndFormulas(zip) {
        const imagesMap = {};
        const formulasMap = {};

        try {
            const relsMap = {};
            const relsFile = zip.file('word/_rels/document.xml.rels');
            if (relsFile) {
                const relsXmlStr = await relsFile.async('string');
                const parser = new DOMParser();
                const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
                const relNodes = relsDoc.getElementsByTagName('Relationship');
                for (let i = 0; i < relNodes.length; i++) {
                    const rel = relNodes[i];
                    const id = rel.getAttribute('Id');
                    const target = rel.getAttribute('Target');
                    const type = rel.getAttribute('Type') || '';
                    if (id && target) {
                        relsMap[id] = { target, type };
                        let zipPath = target.replace(/^\.\.\//, '').replace(/^\//, '');
                        if (!zipPath.startsWith('word/')) zipPath = 'word/' + zipPath;
                        relsMap[zipPath.toLowerCase()] = id;
                        relsMap[target.toLowerCase()] = id;
                    }
                }
            }

            // 1. Quét toàn bộ OLE embeddings (word/embeddings/oleObject*.bin)
            const embeddingFiles = zip.file(/^word\/embeddings\//i);
            for (let embFile of embeddingFiles) {
                try {
                    const ab = await embFile.async('arraybuffer');
                    const formulaLatex = MTEFParser.parse(ab);
                    if (formulaLatex && formulaLatex.trim()) {
                        const normPath = embFile.name.toLowerCase();
                        const filename = normPath.split('/').pop();
                        const rId = relsMap[normPath] || relsMap[filename];
                        const wrapped = formulaLatex.startsWith('$') ? formulaLatex : `$${formulaLatex}$`;
                        if (rId) formulasMap[rId] = wrapped;
                        formulasMap[filename] = wrapped;
                        formulasMap[normPath] = wrapped;
                    }
                } catch (e) {
                    console.warn('Lỗi đọc embedding:', embFile.name, e);
                }
            }

            // 2. Quét toàn bộ file media (word/media/)
            const mediaFiles = zip.file(/^word\/media\//i);
            for (let mFile of mediaFiles) {
                const lower = mFile.name.toLowerCase();
                const filename = lower.split('/').pop();
                const rId = relsMap[lower] || relsMap[filename] || relsMap[`media/${filename}`];

                try {
                    if (lower.endsWith('.png')) {
                        const b64 = await mFile.async('base64');
                        const uri = `data:image/png;base64,${b64}`;
                        if (rId) imagesMap[rId] = uri;
                        imagesMap[filename] = uri;
                    } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
                        const b64 = await mFile.async('base64');
                        const uri = `data:image/jpeg;base64,${b64}`;
                        if (rId) imagesMap[rId] = uri;
                        imagesMap[filename] = uri;
                    } else if (lower.endsWith('.gif')) {
                        const b64 = await mFile.async('base64');
                        const uri = `data:image/gif;base64,${b64}`;
                        if (rId) imagesMap[rId] = uri;
                        imagesMap[filename] = uri;
                    } else if (lower.endsWith('.svg')) {
                        const svgStr = await mFile.async('string');
                        const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
                        if (rId) imagesMap[rId] = uri;
                        imagesMap[filename] = uri;
                    } else if (lower.endsWith('.wmf') || lower.endsWith('.emf')) {
                        const ab = await mFile.async('arraybuffer');
                        
                        // Ưu tiên 1: Giải mã MTEF nhúng trong WMF sang LaTeX (Câu 5: biểu thức hằng số cân bằng)
                        let formulaLatex = MTEFParser.parse(ab);
                        if (formulaLatex && formulaLatex.trim()) {
                            const wrapped = formulaLatex.startsWith('$') ? formulaLatex : `$${formulaLatex}$`;
                            if (rId) formulasMap[rId] = wrapped;
                            formulasMap[filename] = wrapped;
                            continue;
                        }

                        // Ưu tiên 2: Trích xuất chuỗi ký tự TextOut/ExtTextOut trong WMF (cho công thức dạng chữ như Câu 2: HCl, NaOH)
                        const extractedText = this.extractTextFromWmf(ab);
                        if (extractedText && extractedText.trim()) {
                            const formatted = this.autoFormatChemistry(extractedText.trim());
                            if (rId) formulasMap[rId] = formatted;
                            formulasMap[filename] = formatted;
                            continue;
                        }

                        // Ưu tiên 3: Nếu là hình vẽ / sơ đồ vector thì render sang Canvas PNG
                        const canvas = document.createElement('canvas');
                        const dataUri = this.renderWmfToCanvas(ab, canvas);
                        if (dataUri) {
                            if (rId) imagesMap[rId] = dataUri;
                            imagesMap[filename] = dataUri;
                        }
                    }
                } catch (e) {
                    console.warn('Lỗi xử lý media file:', mFile.name, e);
                }
            }

            // 3. Liên kết các cặp (ảnh xem trước WMF, đối tượng OLE) trong word/document.xml
            const docXmlFile = zip.file('word/document.xml');
            if (docXmlFile) {
                try {
                    const docXmlStr = await docXmlFile.async('string');
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');
                    const objNodes = xmlDoc.getElementsByTagName('w:object');
                    for (let obj of objNodes) {
                        let imgRId = '';
                        let oleRId = '';
                        for (let el of obj.getElementsByTagName('*')) {
                            const localName = (el.localName || el.nodeName).toLowerCase();
                            for (let attr of el.attributes || []) {
                                const val = attr.value;
                                if (val && val.startsWith('rId')) {
                                    if (localName.includes('imagedata') || localName.includes('blip')) {
                                        imgRId = val;
                                    } else if (localName.includes('oleobject') || localName.includes('object')) {
                                        oleRId = val;
                                    }
                                }
                            }
                        }
                        if (imgRId && oleRId) {
                            if (formulasMap[oleRId] && !formulasMap[imgRId]) {
                                formulasMap[imgRId] = formulasMap[oleRId];
                            } else if (formulasMap[imgRId] && !formulasMap[oleRId]) {
                                formulasMap[oleRId] = formulasMap[imgRId];
                            }
                            if (imagesMap[imgRId] && !imagesMap[oleRId]) {
                                imagesMap[oleRId] = imagesMap[imgRId];
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Lỗi liên kết w:object trong docx:', e);
                }
            }
        } catch (err) {
            console.warn('Lỗi trích xuất media và công thức từ docx:', err);
        }

        return { imagesMap, formulasMap };
    }

    // Tương thích ngược
    async extractDocxImages(zip) {
        const { imagesMap } = await this.extractDocxMediaAndFormulas(zip);
        return imagesMap;
    }

    // Bộ giải mã và vẽ file WMF / EMF (MathType & Vector Graphics) trực tiếp lên Canvas thuần
    renderWmfToCanvas(buffer, canvas) {
        try {
            if (!buffer || buffer.byteLength < 24) return '';
            const dv = new DataView(buffer);

            // 1. Kiểm tra định dạng EMF (Enhanced Metafile 32-bit GDI)
            // Header EMF: iType === 1 và Signature ở byte 40 là "EMF " (0x28434D45)
            if (dv.getUint32(0, true) === 1 && buffer.byteLength >= 88 && dv.getUint32(40, true) === 0x28434D45) {
                return this.renderEmfToCanvas(buffer, canvas);
            }

            let offset = 0;
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            // Kiểm tra Aldus Header (22 byte) chứa tọa độ Bounding Box chuẩn xác từ MathType
            const key = dv.getUint32(0, true);
            if (key === 0x9AC6CDD7) {
                const aldusLeft = dv.getInt16(6, true);
                const aldusTop = dv.getInt16(8, true);
                const aldusRight = dv.getInt16(10, true);
                const aldusBottom = dv.getInt16(12, true);
                const aldusW = aldusRight - aldusLeft;
                const aldusH = aldusBottom - aldusTop;
                if (aldusW > 0 && aldusH > 0 && aldusW < 30000 && aldusH < 30000) {
                    minX = aldusLeft;
                    maxX = aldusRight;
                    minY = aldusTop;
                    maxY = aldusBottom;
                }
                offset = 22;
            }

            offset += 18; // Bỏ qua WMF Header chuẩn (18 byte)

            // LƯỢT 1: Quét toàn bộ lệnh vẽ thực tế để tính toán chính xác Bounding Box (Tránh vẽ tràn/lệch tọa độ)
            let scanOffset = offset;
            let curScanX = 0, curScanY = 0;
            let hasPrimitives = (minX !== Infinity);

            const updateBBox = (x, y) => {
                if (typeof x === 'number' && !isNaN(x) && isFinite(x)) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                }
                if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            };

            while (scanOffset + 6 <= buffer.byteLength) {
                const rdSize = dv.getUint32(scanOffset, true) * 2;
                const rdFunc = dv.getUint16(scanOffset + 4, true);
                if (rdSize < 6 || rdFunc === 0x0000) break;

                switch (rdFunc) {
                    case 0x0214: // MoveTo
                        curScanY = dv.getInt16(scanOffset + 6, true);
                        curScanX = dv.getInt16(scanOffset + 8, true);
                        break;
                    case 0x012C: { // LineTo
                        const toY = dv.getInt16(scanOffset + 6, true);
                        const toX = dv.getInt16(scanOffset + 8, true);
                        updateBBox(curScanX, curScanY);
                        updateBBox(toX, toY);
                        curScanX = toX; curScanY = toY;
                        hasPrimitives = true;
                        break;
                    }
                    case 0x0325: // Polyline
                    case 0x0324: { // Polygon
                        const numPts = dv.getInt16(scanOffset + 6, true);
                        if (numPts > 1) {
                            for (let pi = 0; pi < numPts && scanOffset + 8 + pi * 4 + 4 <= buffer.byteLength; pi++) {
                                updateBBox(dv.getInt16(scanOffset + 8 + pi * 4, true), dv.getInt16(scanOffset + 10 + pi * 4, true));
                            }
                            hasPrimitives = true;
                        }
                        break;
                    }
                    case 0x041B: { // Rectangle
                        const b = dv.getInt16(scanOffset + 6, true);
                        const r = dv.getInt16(scanOffset + 8, true);
                        const t = dv.getInt16(scanOffset + 10, true);
                        const l = dv.getInt16(scanOffset + 12, true);
                        if (l !== r || t !== b) {
                            updateBBox(l, t);
                            updateBBox(r, b);
                            hasPrimitives = true;
                        }
                        break;
                    }
                    case 0x061D: { // PatBlt (Nét gạch ngang phân số, thanh căn của MathType)
                        const h = dv.getInt16(scanOffset + 10, true);
                        const w = dv.getInt16(scanOffset + 12, true);
                        const y = dv.getInt16(scanOffset + 14, true);
                        const x = dv.getInt16(scanOffset + 16, true);
                        if (w !== 0 || h !== 0) {
                            updateBBox(x, y);
                            updateBBox(x + w, y + h);
                            hasPrimitives = true;
                        }
                        break;
                    }
                    case 0x0521: // TextOut
                    case 0x0A32: { // ExtTextOut
                        let strLen = 0, tY = 0, tX = 0;
                        if (rdFunc === 0x0521) {
                            strLen = dv.getInt16(scanOffset + 6, true);
                            tY = dv.getInt16(scanOffset + 8 + ((strLen + 1) & ~1), true);
                            tX = dv.getInt16(scanOffset + 10 + ((strLen + 1) & ~1), true);
                        } else {
                            tY = dv.getInt16(scanOffset + 6, true);
                            tX = dv.getInt16(scanOffset + 8, true);
                            strLen = dv.getInt16(scanOffset + 10, true);
                        }
                        if (strLen > 0) {
                            updateBBox(tX, tY);
                            updateBBox(tX + strLen * 140, tY + 220);
                            updateBBox(tX, tY - 60);
                            hasPrimitives = true;
                        }
                        break;
                    }
                }
                scanOffset += rdSize;
            }

            if (!hasPrimitives || minX === Infinity || minY === Infinity) {
                return ''; // Không có nội dung vẽ thực tế -> Không xuất ảnh
            }

            let boxW = maxX - minX;
            let boxH = maxY - minY;
            if (boxW <= 0) boxW = 100;
            if (boxH <= 0) boxH = 40;

            const padX = Math.max(8, boxW * 0.05);
            const padY = Math.max(6, boxH * 0.05);
            const winOrgX = minX - padX;
            const winOrgY = minY - padY;
            const winExtX = boxW + 2 * padX;
            const winExtY = boxH + 2 * padY;

            // Thiết lập kích thước Canvas tỉ lệ chuẩn sắc nét (Retina 2x)
            const aspect = winExtX / Math.max(1, winExtY);
            const targetH = Math.max(48, Math.min(180, Math.round(52 * 2)));
            const targetW = Math.max(60, Math.min(650, Math.round(targetH * aspect)));
            canvas.width = targetW;
            canvas.height = targetH;

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mapX = (x) => ((x - winOrgX) / winExtX) * canvas.width;
            const mapY = (y) => ((y - winOrgY) / winExtY) * canvas.height;

            const gdiObjects = [];
            let curPen = { color: '#000000', width: 2 };
            let curBrush = { color: '#000000' };
            let curTextColor = '#000000';
            let curFont = { size: Math.round(canvas.height * 0.42), name: 'Times New Roman' };
            let curX = 0, curY = 0;
            let hasDrawnContent = false;

            while (offset + 6 <= buffer.byteLength) {
                const rdSize = dv.getUint32(offset, true) * 2;
                const rdFunc = dv.getUint16(offset + 4, true);
                if (rdSize < 6 || rdFunc === 0x0000) break;

                switch (rdFunc) {
                    case 0x02FA: { // CreatePenIndirect
                        const colorVal = dv.getUint32(offset + 10, true);
                        const r = colorVal & 0xFF, g = (colorVal >> 8) & 0xFF, b = (colorVal >> 16) & 0xFF;
                        const w = Math.max(1.5, dv.getInt16(offset + 8, true) * (canvas.width / winExtX));
                        gdiObjects.push({ type: 'pen', color: `rgb(${r},${g},${b})`, width: w });
                        break;
                    }
                    case 0x02FC: { // CreateBrushIndirect
                        const colorVal = dv.getUint32(offset + 8, true);
                        const r = colorVal & 0xFF, g = (colorVal >> 8) & 0xFF, b = (colorVal >> 16) & 0xFF;
                        gdiObjects.push({ type: 'brush', color: `rgb(${r},${g},${b})` });
                        break;
                    }
                    case 0x02FB: { // CreateFontIndirect
                        const h = Math.abs(dv.getInt16(offset + 6, true));
                        let fontName = '';
                        for (let fi = offset + 24; fi < offset + rdSize && fi < buffer.byteLength; fi++) {
                            const ch = dv.getUint8(fi);
                            if (ch === 0) break;
                            fontName += String.fromCharCode(ch);
                        }
                        const maxAllowedSize = Math.round(canvas.height * 0.72);
                        let calculatedSize = Math.round((h / winExtY) * canvas.height * 0.95);
                        if (isNaN(calculatedSize) || calculatedSize > maxAllowedSize) calculatedSize = maxAllowedSize;
                        if (calculatedSize < 14) calculatedSize = 14;
                        gdiObjects.push({ type: 'font', size: calculatedSize, name: fontName || 'Times New Roman' });
                        break;
                    }
                    case 0x012D: { // SelectObject
                        const objIdx = dv.getUint16(offset + 6, true);
                        const obj = gdiObjects[objIdx];
                        if (obj) {
                            if (obj.type === 'pen') curPen = obj;
                            else if (obj.type === 'brush') curBrush = obj;
                            else if (obj.type === 'font') curFont = obj;
                        }
                        break;
                    }
                    case 0x00F0: { // DeleteObject
                        const objIdx = dv.getUint16(offset + 6, true);
                        gdiObjects[objIdx] = null;
                        break;
                    }
                    case 0x0209: { // SetTextColor
                        const colorVal = dv.getUint32(offset + 6, true);
                        const r = colorVal & 0xFF, g = (colorVal >> 8) & 0xFF, b = (colorVal >> 16) & 0xFF;
                        curTextColor = `rgb(${r},${g},${b})`;
                        break;
                    }
                    case 0x0214: { // MoveTo
                        curY = dv.getInt16(offset + 6, true);
                        curX = dv.getInt16(offset + 8, true);
                        break;
                    }
                    case 0x012C: { // LineTo
                        const toY = dv.getInt16(offset + 6, true);
                        const toX = dv.getInt16(offset + 8, true);
                        ctx.beginPath();
                        ctx.strokeStyle = curPen.color || curTextColor || '#000000';
                        ctx.lineWidth = curPen.width || 2;
                        ctx.moveTo(mapX(curX), mapY(curY));
                        ctx.lineTo(mapX(toX), mapY(toY));
                        ctx.stroke();
                        curX = toX; curY = toY;
                        hasDrawnContent = true;
                        break;
                    }
                    case 0x0325: { // Polyline
                        const numPts = dv.getInt16(offset + 6, true);
                        if (numPts > 1) {
                            ctx.beginPath();
                            ctx.strokeStyle = curPen.color || curTextColor || '#000000';
                            ctx.lineWidth = curPen.width || 2;
                            for (let pi = 0; pi < numPts; pi++) {
                                const px = dv.getInt16(offset + 8 + pi * 4, true);
                                const py = dv.getInt16(offset + 10 + pi * 4, true);
                                if (pi === 0) ctx.moveTo(mapX(px), mapY(py));
                                else ctx.lineTo(mapX(px), mapY(py));
                            }
                            ctx.stroke();
                            hasDrawnContent = true;
                        }
                        break;
                    }
                    case 0x0324: { // Polygon
                        const numPts = dv.getInt16(offset + 6, true);
                        if (numPts > 2) {
                            ctx.beginPath();
                            ctx.fillStyle = curBrush.color || curTextColor || '#000000';
                            for (let pi = 0; pi < numPts; pi++) {
                                const px = dv.getInt16(offset + 8 + pi * 4, true);
                                const py = dv.getInt16(offset + 10 + pi * 4, true);
                                if (pi === 0) ctx.moveTo(mapX(px), mapY(py));
                                else ctx.lineTo(mapX(px), mapY(py));
                            }
                            ctx.closePath();
                            ctx.fill();
                            hasDrawnContent = true;
                        }
                        break;
                    }
                    case 0x041B: { // Rectangle
                        const b = dv.getInt16(offset + 6, true);
                        const r = dv.getInt16(offset + 8, true);
                        const t = dv.getInt16(offset + 10, true);
                        const l = dv.getInt16(offset + 12, true);
                        const fillClr = curBrush.color || curTextColor || '#000000';
                        if (fillClr !== '#ffffff' && fillClr !== 'rgb(255,255,255)') {
                            ctx.fillStyle = fillClr;
                            ctx.fillRect(mapX(l), mapY(t), mapX(r) - mapX(l), mapY(b) - mapY(t));
                            hasDrawnContent = true;
                        }
                        break;
                    }
                    case 0x061D: { // PatBlt (Dấu phân số nằm ngang, căn thức MathType)
                        const h = dv.getInt16(offset + 10, true);
                        const w = dv.getInt16(offset + 12, true);
                        const y = dv.getInt16(offset + 14, true);
                        const x = dv.getInt16(offset + 16, true);
                        const rx = Math.min(x, x + w);
                        const ry = Math.min(y, y + h);
                        const rw = Math.abs(w);
                        const rh = Math.abs(h);
                        ctx.fillStyle = curTextColor || curBrush.color || curPen.color || '#000000';
                        ctx.fillRect(mapX(rx), mapY(ry), Math.max(2, (rw / winExtX) * canvas.width), Math.max(2, (rh / winExtY) * canvas.height));
                        hasDrawnContent = true;
                        break;
                    }
                    case 0x0521:
                    case 0x0A32: { // TextOut / ExtTextOut
                        let strLen = 0, textY = 0, textX = 0, textOffset = 0;
                        if (rdFunc === 0x0521) {
                            strLen = dv.getInt16(offset + 6, true);
                            textOffset = offset + 8;
                            textY = dv.getInt16(offset + 8 + ((strLen + 1) & ~1), true);
                            textX = dv.getInt16(offset + 10 + ((strLen + 1) & ~1), true);
                        } else {
                            textY = dv.getInt16(offset + 6, true);
                            textX = dv.getInt16(offset + 8, true);
                            strLen = dv.getInt16(offset + 10, true);
                            const fwOpts = dv.getUint16(offset + 12, true);
                            textOffset = (fwOpts & 0x0006) ? offset + 22 : offset + 14;
                        }
                        if (strLen > 0 && textOffset + strLen <= buffer.byteLength) {
                            const bytes = new Uint8Array(buffer, textOffset, strLen);
                            let decoded = '';
                            try {
                                decoded = new TextDecoder('windows-1258').decode(bytes);
                            } catch (e) {
                                decoded = String.fromCharCode.apply(null, bytes);
                            }
                            if (decoded.trim()) {
                                ctx.fillStyle = curTextColor || '#000000';
                                const fontName = curFont.name || 'Times New Roman';
                                const actualFontSize = Math.min(Math.round(canvas.height * 0.72), Math.max(14, Math.round(curFont.size || 18)));
                                ctx.font = `${actualFontSize}px "${fontName}", "Cambria Math", "Times New Roman", serif`;
                                ctx.textBaseline = 'top';
                                ctx.fillText(decoded, mapX(textX), mapY(textY));
                                hasDrawnContent = true;
                            }
                        }
                        break;
                    }
                }
                offset += rdSize;
            }

            return hasDrawnContent ? canvas.toDataURL('image/png') : '';
        } catch (err) {
            console.warn('Lỗi vẽ WMF thuần:', err);
            return '';
        }
    }

    // Bộ giải mã file EMF (Enhanced Metafile 32-bit GDI)
    renderEmfToCanvas(buffer, canvas) {
        try {
            const dv = new DataView(buffer);
            const bL = dv.getInt32(8, true);
            const bT = dv.getInt32(12, true);
            const bR = dv.getInt32(16, true);
            const bB = dv.getInt32(20, true);

            let w = Math.abs(bR - bL);
            let h = Math.abs(bB - bT);
            if (w <= 0 || h <= 0) {
                w = 240; h = 70;
            }

            const aspect = w / Math.max(1, h);
            canvas.height = Math.max(48, Math.min(180, Math.round(52 * 2)));
            canvas.width = Math.max(60, Math.min(650, Math.round(canvas.height * aspect)));

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mapX = (x) => ((x - bL) / w) * canvas.width;
            const mapY = (y) => ((y - bT) / h) * canvas.height;

            let offset = 0;
            let curTextColor = '#000000';
            let curBrushColor = '#000000';
            let curPenColor = '#000000';
            let curX = 0, curY = 0;
            let hasDrawn = false;

            while (offset + 8 <= buffer.byteLength) {
                const iType = dv.getUint32(offset, true);
                const nSize = dv.getUint32(offset + 4, true);
                if (nSize < 8 || iType === 0x0E) break; // 0x0E = EMR_EOF

                switch (iType) {
                    case 0x18: { // EMR_SETTEXTCOLOR
                        const clr = dv.getUint32(offset + 8, true);
                        curTextColor = `rgb(${clr & 0xFF},${(clr >> 8) & 0xFF},${(clr >> 16) & 0xFF})`;
                        break;
                    }
                    case 0x1B: { // EMR_MOVETOEX
                        curX = dv.getInt32(offset + 8, true);
                        curY = dv.getInt32(offset + 12, true);
                        break;
                    }
                    case 0x36: { // EMR_LINETO
                        const toX = dv.getInt32(offset + 8, true);
                        const toY = dv.getInt32(offset + 12, true);
                        ctx.beginPath();
                        ctx.strokeStyle = curPenColor || curTextColor || '#000000';
                        ctx.lineWidth = 2;
                        ctx.moveTo(mapX(curX), mapY(curY));
                        ctx.lineTo(mapX(toX), mapY(toY));
                        ctx.stroke();
                        curX = toX; curY = toY;
                        hasDrawn = true;
                        break;
                    }
                    case 0x2B: { // EMR_RECTANGLE
                        const l = dv.getInt32(offset + 8, true);
                        const t = dv.getInt32(offset + 12, true);
                        const r = dv.getInt32(offset + 16, true);
                        const b = dv.getInt32(offset + 20, true);
                        ctx.fillStyle = curBrushColor || curTextColor || '#000000';
                        ctx.fillRect(mapX(l), mapY(t), mapX(r) - mapX(l), mapY(b) - mapY(t));
                        hasDrawn = true;
                        break;
                    }
                    case 0x4C: // EMR_BITBLT
                    case 0x4D: { // EMR_STRETCHBLT
                        const x = dv.getInt32(offset + 8, true);
                        const y = dv.getInt32(offset + 12, true);
                        const cx = dv.getInt32(offset + 16, true);
                        const cy = dv.getInt32(offset + 20, true);
                        ctx.fillStyle = curTextColor || curBrushColor || '#000000';
                        ctx.fillRect(mapX(x), mapY(y), Math.max(2, (cx / w) * canvas.width), Math.max(2, (cy / h) * canvas.height));
                        hasDrawn = true;
                        break;
                    }
                    case 0x54: // EMR_EXTTEXTOUTW (UTF-16 Unicode)
                    case 0x53: { // EMR_EXTTEXTOUTA
                        const charsCount = dv.getUint32(offset + 28, true);
                        const offString = dv.getUint32(offset + 32, true);
                        if (charsCount > 0 && offset + offString < buffer.byteLength) {
                            let text = '';
                            if (iType === 0x54) {
                                for (let c = 0; c < charsCount && offset + offString + c * 2 + 2 <= buffer.byteLength; c++) {
                                    text += String.fromCharCode(dv.getUint16(offset + offString + c * 2, true));
                                }
                            } else {
                                for (let c = 0; c < charsCount && offset + offString + c < buffer.byteLength; c++) {
                                    text += String.fromCharCode(dv.getUint8(offset + offString + c));
                                }
                            }
                            if (text.trim()) {
                                const rLeft = dv.getInt32(offset + 8, true);
                                const rTop = dv.getInt32(offset + 12, true);
                                ctx.fillStyle = curTextColor || '#000000';
                                ctx.font = `${Math.round(canvas.height * 0.42)}px "Cambria Math", "Times New Roman", serif`;
                                ctx.textBaseline = 'top';
                                ctx.fillText(text, mapX(rLeft), mapY(rTop));
                                hasDrawn = true;
                            }
                        }
                        break;
                    }
                }
                offset += nSize;
            }

            return hasDrawn ? canvas.toDataURL('image/png') : '';
        } catch (e) {
            console.warn('Lỗi vẽ EMF:', e);
            return '';
        }
    }

    // Trích xuất thẻ ảnh HTML từ node drawing, pict hoặc object
    extractImageFromNode(node, imagesMap) {
        if (!node || !imagesMap) return '';

        const findImgSrc = (val) => {
            if (!val) return '';
            if (imagesMap[val]) return imagesMap[val];
            const lower = val.toLowerCase();
            if (imagesMap[lower]) return imagesMap[lower];
            const fname = lower.split('/').pop();
            if (imagesMap[fname]) return imagesMap[fname];
            return '';
        };

        // 1. Quét các thẻ blip (a:blip, blip)
        const blips = [];
        if (node.getElementsByTagNameNS) {
            try {
                const nsBlips = node.getElementsByTagNameNS('*', 'blip');
                for (let i = 0; i < nsBlips.length; i++) blips.push(nsBlips[i]);
            } catch(e) {}
        }
        if (blips.length === 0 && node.getElementsByTagName) {
            const tagBlips = node.getElementsByTagName('a:blip');
            for (let i = 0; i < tagBlips.length; i++) blips.push(tagBlips[i]);
            const bareBlips = node.getElementsByTagName('blip');
            for (let i = 0; i < bareBlips.length; i++) blips.push(bareBlips[i]);
        }

        for (let b of blips) {
            for (let attr of b.attributes || []) {
                const src = findImgSrc(attr.value);
                if (src) {
                    return `<img src="${src}" class="doc-formula-img" alt="Hình ảnh minh họa" style="max-width: 100%; max-height: 220px; display: block; margin: 8px auto; border-radius: 8px; cursor: pointer;">`;
                }
            }
        }

        // 2. Quét thẻ imagedata (v:imagedata, imagedata)
        const imgDatas = [];
        if (node.getElementsByTagNameNS) {
            try {
                const nsImgs = node.getElementsByTagNameNS('*', 'imagedata');
                for (let i = 0; i < nsImgs.length; i++) imgDatas.push(nsImgs[i]);
            } catch(e) {}
        }
        if (imgDatas.length === 0 && node.getElementsByTagName) {
            const vImgs = node.getElementsByTagName('v:imagedata');
            for (let i = 0; i < vImgs.length; i++) imgDatas.push(vImgs[i]);
            const bareImgs = node.getElementsByTagName('imagedata');
            for (let i = 0; i < bareImgs.length; i++) imgDatas.push(bareImgs[i]);
        }

        for (let id of imgDatas) {
            for (let attr of id.attributes || []) {
                const src = findImgSrc(attr.value);
                if (src) {
                    return `<img src="${src}" class="doc-formula-img" alt="Hình ảnh minh họa" style="max-width: 100%; max-height: 220px; display: block; margin: 8px auto; border-radius: 8px; cursor: pointer;">`;
                }
            }
        }

        // 3. Quét mọi phần tử con
        const allEls = node.getElementsByTagName ? node.getElementsByTagName('*') : [];
        for (let el of allEls) {
            for (let attr of el.attributes || []) {
                const src = findImgSrc(attr.value);
                if (src) {
                    return `<img src="${src}" class="doc-formula-img" alt="Hình ảnh minh họa" style="max-width: 100%; max-height: 220px; display: block; margin: 8px auto; border-radius: 8px; cursor: pointer;">`;
                }
            }
        }

        return '';
    }

    // Trích xuất công thức LaTeX hoặc thẻ ảnh HTML từ node drawing, pict hoặc object
    extractFormulaOrImage(node, imagesMap = {}, formulasMap = {}) {
        if (!node) return '';

        // 1. Quét mọi thuộc tính r:id, id, r:embed để tìm công thức LaTeX đã giải mã trong formulasMap
        const allEls = node.getElementsByTagName ? node.getElementsByTagName('*') : [];
        const checkList = [node, ...allEls];

        for (let el of checkList) {
            for (let attr of el.attributes || []) {
                const val = attr.value;
                if (val) {
                    if (formulasMap[val]) {
                        const form = formulasMap[val];
                        return form.startsWith('$') ? form : `$${form}$`;
                    }
                    const filename = val.split('/').pop().toLowerCase();
                    if (formulasMap[filename]) {
                        const form = formulasMap[filename];
                        return form.startsWith('$') ? form : `$${form}$`;
                    }
                }
            }
        }

        // 2. Kiểm tra OMML (Word Equation)
        const oMathEls = node.getElementsByTagName ? node.getElementsByTagName('m:oMath') : [];
        if (oMathEls.length > 0) {
            const latex = this.convertOmmlToLatex(oMathEls[0]);
            if (latex && latex.trim()) return `$${latex.trim()}$`;
        }

        // 3. Kiểm tra alt / descr / title của shape
        const mathFromAlt = this.extractMathTypeFromObject(node) || this.extractMathFromDrawing(node);
        if (mathFromAlt && mathFromAlt.trim()) {
            return mathFromAlt.trim();
        }

        // 4. Kiểm tra ảnh trong imagesMap
        const imgHtml = this.extractImageFromNode(node, imagesMap);
        if (imgHtml) return imgHtml;

        return '';
    }

    // Xử lý từng đoạn văn bản w:p
    processParagraphNode(pNode, imagesMap = {}, formulasMap = {}) {
        let line = '';

        const processChild = (node) => {
            if (!node) return;
            const name = node.localName || node.nodeName.split(':').pop();

            if (name === 'r') {
                const rPr = this.getChildByLocalName(node, 'rPr');
                let isSub = false;
                let isSup = false;
                let isCorrectAnswerMark = false;

                if (rPr) {
                    const vertAlign = this.getChildByLocalName(rPr, 'vertAlign');
                    if (vertAlign) {
                        const val = vertAlign.getAttribute('w:val') || vertAlign.getAttribute('val');
                        if (val === 'subscript') isSub = true;
                        else if (val === 'superscript') isSup = true;
                    }

                    // Tự động nhận diện dấu hiệu đáp án đúng của GV trong Word: gạch chân hoặc bôi màu (highlight/red)
                    const u = this.getChildByLocalName(rPr, 'u');
                    if (u) {
                        const uVal = u.getAttribute('w:val') || u.getAttribute('val') || 'single';
                        if (uVal !== 'none') isCorrectAnswerMark = true;
                    }
                    const highlight = this.getChildByLocalName(rPr, 'highlight');
                    if (highlight) {
                        const hVal = highlight.getAttribute('w:val') || highlight.getAttribute('val') || '';
                        if (hVal && hVal !== 'none') isCorrectAnswerMark = true;
                    }
                    const color = this.getChildByLocalName(rPr, 'color');
                    if (color) {
                        const cVal = (color.getAttribute('w:val') || color.getAttribute('val') || '').toUpperCase();
                        if (cVal === 'FF0000' || cVal === 'RED' || cVal === '008000') isCorrectAnswerMark = true;
                    }
                }

                let rText = '';
                for (let rChild of node.childNodes) {
                    const rcName = rChild.localName || rChild.nodeName.split(':').pop();
                    if (rcName === 't') {
                        rText += rChild.textContent || '';
                    } else if (rcName === 'tab') {
                        rText += ' ';
                    } else if (rcName === 'br') {
                        rText += '\n';
                    } else if (rcName === 'drawing' || rcName === 'pict' || rcName === 'object') {
                        const formulaOrImg = this.extractFormulaOrImage(rChild, imagesMap, formulasMap);
                        if (formulaOrImg) {
                            rText += ' ' + formulaOrImg + ' ';
                        }
                    } else if (rcName === 'oMath' || rcName === 'oMathPara') {
                        const latex = this.convertOmmlToLatex(rChild);
                        if (latex) rText += ` $${latex}$ `;
                    }
                }

                if (rText) {
                    if (!rText.trim()) {
                        line += rText;
                    } else if (isSub) {
                        line += `_{${rText.trim()}}`;
                    } else if (isSup) {
                        line += `^{${rText.trim()}}`;
                    } else {
                        // Nếu là ký tự phương án A., B., C., D. có gạch chân hoặc bôi vàng -> thêm dấu sao (*)
                        if (isCorrectAnswerMark && /^[A-DＡ-Ｄ][\.\)\:\-]/i.test(rText.trim())) {
                            line += ` *${rText}`;
                        } else {
                            line += rText;
                        }
                    }
                }
            } else if (name === 'drawing' || name === 'pict' || name === 'object') {
                const formulaOrImg = this.extractFormulaOrImage(node, imagesMap, formulasMap);
                if (formulaOrImg) {
                    line += ' ' + formulaOrImg + ' ';
                }
            } else if (name === 'oMath' || name === 'oMathPara') {
                const latex = this.convertOmmlToLatex(node);
                if (latex) line += ` $${latex}$ `;
            } else if (name === 'hyperlink' || name === 'sdt' || name === 'sdtContent' || name === 'ins') {
                for (let subChild of node.childNodes) {
                    processChild(subChild);
                }
            } else if (name === 'tab') {
                line += ' ';
            } else if (name === 'br') {
                line += '\n';
            }
        };

        for (let child of pNode.childNodes) {
            processChild(child);
        }

        return this.autoFormatChemistry(line);
    }

    // Chuyển đổi OMML (Office Math Markup Language) sang LaTeX
    convertOmmlToLatex(node) {
        if (!node) return '';
        if (node.nodeType === 3) return node.nodeValue || '';

        const name = node.localName || node.nodeName.split(':').pop();

        switch (name) {
            case 'oMath':
            case 'oMathPara': {
                let res = '';
                for (let child of node.childNodes) {
                    res += this.convertOmmlToLatex(child);
                }
                return res.trim();
            }

            case 'r': {
                let res = '';
                for (let child of node.childNodes) {
                    res += this.convertOmmlToLatex(child);
                }
                return res;
            }

            case 't': {
                let rawT = node.textContent || '';
                rawT = rawT.replace(/([A-Za-z]{2,})\u20D7/g, '\\overrightarrow{$1}');
                rawT = rawT.replace(/([A-Za-z0-9])\u20D7/g, '\\vec{$1}');
                return this.mapMathSymbols(rawT);
            }

            case 'f': { // Phân số: \frac{tử}{mẫu}
                const numEl = this.getChildByLocalName(node, 'num');
                const denEl = this.getChildByLocalName(node, 'den');
                const numText = numEl ? this.convertOmmlToLatex(numEl) : '';
                const denText = denEl ? this.convertOmmlToLatex(denEl) : '';
                return `\\frac{${numText}}{${denText}}`;
            }

            case 'num':
            case 'den':
            case 'e': {
                let res = '';
                for (let child of node.childNodes) {
                    res += this.convertOmmlToLatex(child);
                }
                return res.trim();
            }

            case 'sSup': { // Lũy thừa / chỉ số trên: {cơ_số}^{mũ}
                const eEl = this.getChildByLocalName(node, 'e');
                const supEl = this.getChildByLocalName(node, 'sup');
                const baseText = eEl ? this.convertOmmlToLatex(eEl) : '';
                const supText = supEl ? this.convertOmmlToLatex(supEl) : '';
                return `{${baseText}}^{${supText}}`;
            }

            case 'sSub': { // Chỉ số dưới: {cơ_số}_{chỉ_số}
                const eEl = this.getChildByLocalName(node, 'e');
                const subEl = this.getChildByLocalName(node, 'sub');
                const baseText = eEl ? this.convertOmmlToLatex(eEl) : '';
                const subText = subEl ? this.convertOmmlToLatex(subEl) : '';
                return `{${baseText}}_{${subText}}`;
            }

            case 'sSubSup': { // Vừa chỉ số dưới vừa chỉ số trên
                const eEl = this.getChildByLocalName(node, 'e');
                const subEl = this.getChildByLocalName(node, 'sub');
                const supEl = this.getChildByLocalName(node, 'sup');
                const baseText = eEl ? this.convertOmmlToLatex(eEl) : '';
                const subText = subEl ? this.convertOmmlToLatex(subEl) : '';
                const supText = supEl ? this.convertOmmlToLatex(supEl) : '';
                return `{${baseText}}_{${subText}}^{${supText}}`;
            }

            case 'sPre': {
                const eEl = this.getChildByLocalName(node, 'e');
                const subEl = this.getChildByLocalName(node, 'sub');
                const supEl = this.getChildByLocalName(node, 'sup');
                const baseText = eEl ? this.convertOmmlToLatex(eEl) : '';
                const subText = subEl ? this.convertOmmlToLatex(subEl) : '';
                const supText = supEl ? this.convertOmmlToLatex(supEl) : '';
                return `{}_{${subText}}^{${supText}}{${baseText}}`;
            }

            case 'rad': { // Căn bậc n: \sqrt[n]{x}
                const degEl = this.getChildByLocalName(node, 'deg');
                const eEl = this.getChildByLocalName(node, 'e');
                const degText = degEl ? this.convertOmmlToLatex(degEl).trim() : '';
                const eText = eEl ? this.convertOmmlToLatex(eEl) : '';
                if (degText && degText !== '2') {
                    return `\\sqrt[${degText}]{${eText}}`;
                }
                return `\\sqrt{${eText}}`;
            }

            case 'd': { // Dấu ngoặc ( ), [ ], { }, | |
                const dPr = this.getChildByLocalName(node, 'dPr');
                let begChr = '(';
                let endChr = ')';
                if (dPr) {
                    const begEl = this.getChildByLocalName(dPr, 'begChr');
                    const endEl = this.getChildByLocalName(dPr, 'endChr');
                    if (begEl) begChr = begEl.getAttribute('m:val') || begEl.getAttribute('val') || '(';
                    if (endEl) endChr = endEl.getAttribute('m:val') || endEl.getAttribute('val') || ')';
                }

                let leftCmd = '\\left(';
                let rightCmd = '\\right)';
                if (begChr === '[') leftCmd = '\\left[';
                else if (begChr === '{') leftCmd = '\\left\\{';
                else if (begChr === '|') leftCmd = '\\left|';
                else if (begChr === '') leftCmd = '\\left.';

                if (endChr === ']') rightCmd = '\\right]';
                else if (endChr === '}') rightCmd = '\\right\\}';
                else if (endChr === '|') rightCmd = '\\right|';
                else if (endChr === '') rightCmd = '\\right.';

                const eEls = this.getChildrenByLocalName(node, 'e');
                const inside = eEls.map(e => this.convertOmmlToLatex(e)).join(', ');
                return `${leftCmd} ${inside} ${rightCmd}`;
            }

            case 'bar': { // Gạch đầu hoặc chân
                const barPr = this.getChildByLocalName(node, 'barPr');
                const pos = barPr ? (barPr.getAttribute('m:val') || barPr.getAttribute('val') || 'top') : 'top';
                const eEl = this.getChildByLocalName(node, 'e');
                const eText = eEl ? this.convertOmmlToLatex(eEl) : '';
                return pos === 'bot' ? `\\underline{${eText}}` : `\\overline{${eText}}`;
            }

            case 'acc': { // Dấu vector, mũ
                const accPr = this.getChildByLocalName(node, 'accPr');
                let chr = '\u20D7';
                if (accPr) {
                    const chrEl = this.getChildByLocalName(accPr, 'chr');
                    if (chrEl) chr = chrEl.getAttribute('m:val') || chrEl.getAttribute('val') || '\u20D7';
                }
                const eEl = this.getChildByLocalName(node, 'e');
                const eText = eEl ? this.convertOmmlToLatex(eEl).trim() : '';
                if (/[\u20D7\u20D6\u20E1\u20D1\u2192\u27F6\u2190\u2194→⟶←↔]/.test(chr)) {
                    return eText.length > 1 ? `\\overrightarrow{${eText}}` : `\\vec{${eText}}`;
                }
                if (chr === '^' || chr === '\u0302' || chr === 'ˆ') return `\\widehat{${eText}}`;
                if (chr === '.') return `\\dot{${eText}}`;
                if (chr === '..') return `\\ddot{${eText}}`;
                if (chr === '~') return `\\tilde{${eText}}`;
                if (chr === '¯' || chr === '\u0304' || chr === '_') return `\\overline{${eText}}`;
                return `\\bar{${eText}}`;
            }

            case 'groupChr': { // Vector nhiều chữ cái (AB), gạch trên/dưới, ngoặc ôm
                const gPr = this.getChildByLocalName(node, 'groupChrPr');
                let chr = '\u23DF';
                let pos = 'bot';
                if (gPr) {
                    const chrEl = this.getChildByLocalName(gPr, 'chr');
                    const posEl = this.getChildByLocalName(gPr, 'pos');
                    if (chrEl) chr = chrEl.getAttribute('m:val') || chrEl.getAttribute('val') || chr;
                    if (posEl) pos = posEl.getAttribute('m:val') || posEl.getAttribute('val') || pos;
                }
                const eEl = this.getChildByLocalName(node, 'e');
                const eText = eEl ? this.convertOmmlToLatex(eEl).trim() : '';
                if (/[\u2192\u27F6\u20D7\u20D1→⟶]/.test(chr)) {
                    return eText.length > 1 ? `\\overrightarrow{${eText}}` : `\\vec{${eText}}`;
                }
                if (/[\u2190\u27F5\u20D6←⟵]/.test(chr)) return `\\overleftarrow{${eText}}`;
                if (/[\u2194\u20E1↔]/.test(chr)) return `\\overleftrightarrow{${eText}}`;
                if (chr === '\u23DE' || chr === '⏞') return `\\overbrace{${eText}}`;
                if (chr === '\u23DF' || chr === '⏟') return `\\underbrace{${eText}}`;
                if (chr === '¯' || chr === '\u0304' || chr === '_') {
                    return pos === 'bot' ? `\\underline{${eText}}` : `\\overline{${eText}}`;
                }
                return pos === 'top' ? (eText.length > 1 ? `\\overrightarrow{${eText}}` : `\\vec{${eText}}`) : eText;
            }

            case 'limUpp': { // Mũi tên / ký hiệu đặt phía trên (VD: vector AB)
                const eEl = this.getChildByLocalName(node, 'e');
                const limEl = this.getChildByLocalName(node, 'lim');
                const eText = eEl ? this.convertOmmlToLatex(eEl).trim() : '';
                const limText = limEl ? this.convertOmmlToLatex(limEl).trim() : '';
                if (/^(?:\\to|\\rightarrow|\\leftarrow|\\leftrightarrow|→|⟶|←|↔|\u20D7)$/.test(limText)) {
                    return eText.length > 1 ? `\\overrightarrow{${eText}}` : `\\vec{${eText}}`;
                }
                return `\\overset{${limText}}{${eText}}`;
            }

            case 'limLow': { // Giới hạn lim
                const eEl = this.getChildByLocalName(node, 'e');
                const limEl = this.getChildByLocalName(node, 'lim');
                const eText = eEl ? this.convertOmmlToLatex(eEl) : '';
                const limText = limEl ? this.convertOmmlToLatex(limEl) : '';
                return `\\lim_{${limText}}{${eText}}`;
            }

            case 'nary': { // Tích phân, tổng xích-ma
                const naryPr = this.getChildByLocalName(node, 'naryPr');
                let op = '\\int';
                if (naryPr) {
                    const chrEl = this.getChildByLocalName(naryPr, 'chr');
                    if (chrEl) {
                        const c = chrEl.getAttribute('m:val') || chrEl.getAttribute('val');
                        if (c === '∑' || c === '\u2211') op = '\\sum';
                        else if (c === '∏' || c === '\u220f') op = '\\prod';
                        else if (c === '∫' || c === '\u222b') op = '\\int';
                    }
                }
                const subEl = this.getChildByLocalName(node, 'sub');
                const supEl = this.getChildByLocalName(node, 'sup');
                const eEl = this.getChildByLocalName(node, 'e');
                const subText = subEl ? this.convertOmmlToLatex(subEl) : '';
                const supText = supEl ? this.convertOmmlToLatex(supEl) : '';
                const eText = eEl ? this.convertOmmlToLatex(eEl) : '';
                let res = op;
                if (subText) res += `_{${subText}}`;
                if (supText) res += `^{${supText}}`;
                res += `{${eText}}`;
                return res;
            }

            case 'm': { // Ma trận
                const rows = this.getChildrenByLocalName(node, 'mr');
                const rowStrings = rows.map(r => {
                    const cells = this.getChildrenByLocalName(r, 'e');
                    return cells.map(c => this.convertOmmlToLatex(c)).join(' & ');
                });
                return `\\begin{matrix} ${rowStrings.join(' \\\\ ')} \\end{matrix}`;
            }

            case 'eqArr': {
                const lines = [];
                for (let child of node.childNodes) {
                    if (child.nodeType === 1) {
                        lines.push(this.convertOmmlToLatex(child));
                    }
                }
                return lines.join(' \\\\ ');
            }

            default: {
                let res = '';
                for (let child of node.childNodes) {
                    if (child.nodeType === 1 || child.nodeType === 3) {
                        res += this.convertOmmlToLatex(child);
                    }
                }
                return res;
            }
        }
    }

    // Tìm thẻ con theo localName (không phụ thuộc prefix XML namespace)
    getChildByLocalName(node, name) {
        if (!node) return null;
        for (let child of node.childNodes) {
            const cName = child.localName || child.nodeName.split(':').pop();
            if (cName.toLowerCase() === name.toLowerCase()) {
                return child;
            }
        }
        return null;
    }

    getChildrenByLocalName(node, name) {
        if (!node) return [];
        const result = [];
        for (let child of node.childNodes) {
            const cName = child.localName || child.nodeName.split(':').pop();
            if (cName.toLowerCase() === name.toLowerCase()) {
                result.push(child);
            }
        }
        return result;
    }

    // Ánh xạ các ký tự toán học Unicode sang lệnh KaTeX
    mapMathSymbols(text) {
        if (!text) return '';
        return text
            .replace(/⇌|\u21cc/g, ' \\rightleftharpoons ')
            .replace(/→|\u2192/g, ' \\rightarrow ')
            .replace(/←|\u2190/g, ' \\leftarrow ')
            .replace(/⇒|\u21d2/g, ' \\Rightarrow ')
            .replace(/⇔|\u21d4/g, ' \\Leftrightarrow ')
            .replace(/≤|\u2264/g, ' \\le ')
            .replace(/≥|\u2265/g, ' \\ge ')
            .replace(/≠|\u2260/g, ' \\ne ')
            .replace(/±|\u00b1/g, ' \\pm ')
            .replace(/×|\u00d7/g, ' \\times ')
            .replace(/÷|\u00f7/g, ' \\div ')
            .replace(/∞|\u221e/g, ' \\infty ')
            .replace(/α|\u03b1/g, ' \\alpha ')
            .replace(/β|\u03b2/g, ' \\beta ')
            .replace(/γ|\u03b3/g, ' \\gamma ')
            .replace(/Δ|\u0394/g, ' \\Delta ')
            .replace(/π|\u03c0/g, ' \\pi ')
            .replace(/⊥|\u22a5/g, ' \\perp ')
            .replace(/∥|\u2225/g, ' \\parallel ')
            .replace(/∈|\u2208/g, ' \\in ')
            .replace(/⊂|\u2282/g, ' \\subset ')
            .replace(/∪|\u222a/g, ' \\cup ')
            .replace(/∩|\u2229/g, ' \\cap ')
            .replace(/∅|\u2205/g, ' \\emptyset ')
            .replace(/℃|\u2103/g, '^\\circ C');
    }

    // Trích xuất công thức từ đối tượng MathType OLE
    extractMathTypeFromObject(objNode) {
        if (!objNode) return '';
        const allEls = objNode.getElementsByTagName ? objNode.getElementsByTagName('*') : [];
        for (let el of allEls) {
            const tag = (el.localName || el.nodeName).toLowerCase();
            if (tag === 'shape' || tag.endsWith(':shape')) {
                const alt = el.getAttribute('alt');
                if (alt && alt.trim()) {
                    const cleaned = this.cleanMathTypeEquation(alt);
                    if (cleaned) return cleaned;
                }
            }
            if (tag === 'docpr' || tag.endsWith(':docpr')) {
                const descr = el.getAttribute('descr') || el.getAttribute('title');
                if (descr && descr.trim()) {
                    const cleaned = this.cleanMathTypeEquation(descr);
                    if (cleaned) return cleaned;
                }
            }
            if (tag === 'omath' || tag.endsWith(':omath')) {
                const latex = this.convertOmmlToLatex(el);
                if (latex) return `$${latex}$`;
            }
        }

        const eqFromDrawing = this.extractMathFromDrawing(objNode);
        if (eqFromDrawing) return eqFromDrawing;

        return '';
    }

    // Trích xuất công thức từ thẻ drawing
    extractMathFromDrawing(drawingNode) {
        if (!drawingNode) return '';
        const docPrs = drawingNode.getElementsByTagName ? drawingNode.getElementsByTagName('wp:docPr') : [];
        for (let i = 0; i < docPrs.length; i++) {
            const descr = docPrs[i].getAttribute('descr') || docPrs[i].getAttribute('title');
            if (descr && descr.trim()) {
                const cleaned = this.cleanMathTypeEquation(descr);
                if (cleaned) return cleaned;
            }
        }
        return '';
    }

    // Làm sạch và chuyển đổi chuỗi MathType sang định dạng LaTeX $...$
    cleanMathTypeEquation(raw) {
        if (!raw) return '';
        let s = raw.trim();
        // Bỏ qua chuỗi mô tả mặc định không chứa công thức
        if (/^(MathType|Microsoft|Word)?\s*(Equation|Object|Formula)?$/i.test(s)) return '';

        const texMatch = s.match(/(\$[^$]+\$|\\\[[\s\S]+?\\\]|\\\(.+?\\\))/);
        if (texMatch) return texMatch[1];

        s = s.replace(/%MathType!MTEF![\s\S]*?%!/g, '').trim();
        s = s.replace(/<!--[\s\S]*?-->/g, '').trim();
        if (s.startsWith('$') && s.endsWith('$')) return s;
        if (s.length > 0 && /[\\_^{}\+\-\=\/\[\]]/.test(s)) {
            return `$${s}$`;
        }
        return s;
    }

    // Tự động nhận diện và định dạng công thức Toán học & Hóa học (chỉ số dưới, mũ, nồng độ, pH, KaTeX)
    autoFormatChemistry(text) {
        if (!text) return '';

        // 0. Chuẩn hóa các ký tự Unicode super/subscript (chỉ số trên/dưới Unicode từ Word/PDF sang LaTeX chuẩn)
        const unicodeSubSup = {
            '⁰':'^0', '¹':'^1', '²':'^2', '³':'^3', '⁴':'^4', '⁵':'^5', '⁶':'^6', '⁷':'^7', '⁸':'^8', '⁹':'^9', '⁺':'^+', '⁻':'^-', 'ⁿ':'^n',
            '₀':'_0', '₁':'_1', '₂':'_2', '₃':'_3', '₄':'_4', '₅':'_5', '₆':'_6', '₇':'_7', '₈':'_8', '₉':'_9', '₊':'_+', '₋':'_-'
        };
        let s = text;
        for (let ch in unicodeSubSup) {
            s = s.split(ch).join(unicodeSubSup[ch]);
        }

        // 1. Dọn dẹp các ký tự superscript/subscript rỗng sinh ra từ khoảng trắng trong Word: ^{ }, _{ }
        s = s.replace(/[\^_]\{\s*\}/g, ' ');
        s = s.replace(/[\^_]\{\}/g, '');

        // 2. Tự động bọc $ cho các lệnh LaTeX toán học đứng trần NGOÀI $...$, $$...$$, \(...\), \[...\] (VD: \frac{\vec{a}}{2}, \sqrt{x}, \vec{v})
        //    Dùng bộ đếm ngoặc cân bằng để không chèn $ vào giữa biểu thức lồng nhau như \frac{\vec{a}}{2}.
        {
            const readBalancedGroup = (str, startIdx) => {
                let idx = startIdx;
                while (idx < str.length && /\s/.test(str[idx])) idx++;
                if (str[idx] !== '{') return -1;
                let depth = 0;
                for (let k = idx; k < str.length; k++) {
                    if (str[k] === '{' && str[k - 1] !== '\\') depth++;
                    else if (str[k] === '}' && str[k - 1] !== '\\') {
                        depth--;
                        if (depth === 0) return k + 1;
                    }
                }
                return -1;
            };
            const wrapBalancedLatex = (seg) => {
                const cmdRe = /\\(?:frac|sqrt|overrightarrow|overline|vec)\b/g;
                let out = '';
                let cursor = 0;
                let m;
                while ((m = cmdRe.exec(seg)) !== null) {
                    if (m.index < cursor) continue;
                    const cmd = m[0];
                    let end = m.index + cmd.length;
                    if (cmd === '\\sqrt') {
                        const rest = seg.slice(end);
                        const optBr = rest.match(/^\s*\[[^\]]*\]/);
                        if (optBr) end += optBr[0].length;
                    }
                    const g1 = readBalancedGroup(seg, end);
                    if (g1 === -1) continue;
                    end = g1;
                    if (cmd === '\\frac') {
                        const g2 = readBalancedGroup(seg, end);
                        if (g2 === -1) continue;
                        end = g2;
                    }
                    out += seg.slice(cursor, m.index) + '$' + seg.slice(m.index, end) + '$';
                    cursor = end;
                    cmdRe.lastIndex = end;
                }
                out += seg.slice(cursor);
                return out;
            };
            const parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);
            s = parts.map((seg, i) => (i % 2 === 1) ? seg : wrapBalancedLatex(seg)).join('');
        }

        // 3. Bảo vệ các khối bảng HTML (Câu 10), thẻ HTML (img) và các khối LaTeX đã có sẵn
        const placeholders = [];
        const addPH = (content) => {
            const key = `@@@FORMULA_PH_${placeholders.length}@@@`;
            placeholders.push({ key, content });
            return key;
        };

        // Bảo vệ bảng biểu HTML (Câu 10)
        s = s.replace(/<div class="doc-table-wrap">[\s\S]*?<\/div>/gi, (m) => addPH(m));
        s = s.replace(/<table[\s\S]*?<\/table>/gi, (m) => addPH(m));

        // Bảo vệ thẻ HTML (đặc biệt là <img> chứa base64)
        s = s.replace(/<[^>]+>/g, (m) => addPH(m));

        // Bảo vệ khối LaTeX có sẵn
        s = s.replace(/\$\$[\s\S]*?\$\$/g, (m) => addPH(m));
        s = s.replace(/\$[^\$]+?\$/g, (m) => addPH(m));
        s = s.replace(/\\\[[\s\S]*?\\\]/g, (m) => addPH(m));
        s = s.replace(/\\\([\s\S]*?\\\)/g, (m) => addPH(m));

        // 3. Chuẩn hóa khoảng trắng quanh ký tự hóa học đặc biệt để không bị dính chữ (VD: tínhpHlà -> tính pH là)
        s = s.replace(/([a-zà-ỹ])(pH|KC|Kc|Kp|KP)/g, '$1 $2');
        s = s.replace(/(pH|KC|Kc|Kp|KP)(?=[a-zà-ỹ]{2,}(?![a-zà-ỹA-Z0-9]))/g, '$1 ');  // chỉ tách khi theo sau là từ tiếng Việt (≥2 chữ), không phá KCl, KClO3...

        // 4. Biểu thức nhiệt phản ứng & enthalpy (Câu 6): ΔrH0298 = -115 kJ hoặc ΔrH^0_298
        s = s.replace(/(?:Δ|\\Delta)\s*r\s*H\s*0?\s*298\s*=\s*([\+\-]?\s*\d+\s*(?:kJ|kcal)?)/gi, (m, val) => {
            return addPH(`$\\Delta_r H^\\circ_{298} = ${val.trim()}$`);
        });
        s = s.replace(/(?:Δ|\\Delta)_?\{?r\}?\s*H\^?\{?(?:0|\\circ)?\}?_?\{?298\}?/gi, () => {
            return addPH('$\\Delta_r H^\\circ_{298}$');
        });

        // 5. Biểu thức tính pH: pH = - log [H+], pH = log [H+], pH = +10 log [H+], pH = - log [OH-] (Câu 3)
        s = s.replace(/(?:pH\s*=\s*)([\+\-]?\s*\d*\s*log\s*\[\s*(?:H|OH)[\^\_]?\{?[\+\-]?\}?\s*\])/gi, (m, expr) => {
            let cleanExpr = expr
                .replace(/\s+/g, '')
                .replace(/log/i, '\\log ')
                .replace(/\[H\^?\{?\+?\}?\]/i, '[\\text{H}^+]')
                .replace(/\[OH\^?\{?\-?\}?\]/i, '[\\text{OH}^-]');
            return addPH(`$\\text{pH} = ${cleanExpr}$`);
        });

        // 6. Phản ứng hóa học: Phân biệt rõ Mũi tên 1 chiều (→, \rightarrow, ->, \xrightarrow) và Mũi tên thuận nghịch 2 chiều (⇌, \rightleftharpoons, <=>)
        // Hỗ trợ điều kiện nhiệt độ / xúc tác trên mũi tên: --t°--> hoặc -(t^o)->
        s = s.replace(/--*(?:\(?\s*(t[°^\circ0o]|xt|xt,\s*t[°^\circ0o])\s*\)?)+--*>/gi, (m, cond) => {
            let cleanCond = 't^\\circ';
            if (/xt/i.test(cond)) {
                cleanCond = 'xt,\\, t^\\circ';
            }
            return ` \\xrightarrow{${cleanCond}} `;
        });

        // VD 1 chiều: Mg + 2HCl → MgCl2 + H2 hoặc 2KClO3 → 2KCl + 3O2
        // VD 2 chiều: 2NO(g) + O2(g) ⇌ 2NO2(g) hoặc N2 + 3H2 ⇌ 2NH3
        s = s.replace(/([A-Z0-9][A-Za-z0-9_\{\}\(\)\+\s\/]*?)\s*(⇌|\\rightleftharpoons|⇄|\u21cc|\u21c4|<=>|<=>|\\xrightarrow(?:\[.*?\])?\{.*?\}|\\overset\{.*?\}\{(?:→|\\rightarrow)\}?|--+>|->|→|\\rightarrow|\u2192|\u27f6)\s*([A-Z0-9][A-Za-z0-9_\{\}\(\)\+\s\/]*)(?![a-zà-ỹ])/g, (match, left, arrow, right) => {
            if (/[à-ỹÀ-Ỹ]/.test(match) || match.length > 160 || match.includes('@@@FORMULA_PH_')) return match;
            const norm = (str) => str
                .replace(/(^|[^A-Za-z\\])((?:[A-Z][a-z]?(?:_\{\d+\}|_\d+|\d+)?)+)(?![a-z])/g,
                    (m2, pre, run) => pre + '\\mathrm{' + run.replace(/_?\{?(\d+)\}?/g, '_{$1}') + '}')
                .replace(/\(([sSlLgG]|aq)\)/g, '($1)');

            let arrowTex = '\\rightarrow';
            const arrTrim = arrow.trim();
            if (/^(?:⇌|\\rightleftharpoons|⇄|\u21cc|\u21c4|<=>|<=>)$/.test(arrTrim)) {
                arrowTex = '\\rightleftharpoons';
            } else if (arrTrim.startsWith('\\xrightarrow') || arrTrim.startsWith('\\overset')) {
                arrowTex = arrTrim;
            } else {
                arrowTex = '\\rightarrow';
            }
            return addPH(`$${norm(left.trim())} ${arrowTex} ${norm(right.trim())}$`);
        });

        // 7. Biểu thức hằng số cân bằng KC, Kc, KP, Kp (Câu 1, 5)
        s = s.replace(/(^|[\s\(\[\{>\*])K_?\{?([CcPp])\}?(?=[\s\.,;\?\!\)\]\}<]|$)/g, (fullMatch, lead, letter) => lead + addPH(`$K_${letter}$`));

        // 8. Điện tích ion & ion thông dụng (Câu 7): CO3^{2-}, NH4^+, OH^-, H^+, SO4^{2-}, NO3^-
        s = s.replace(/(^|[\s\(\[\{>\*])(CO_?\{?3\}?\^?\{?2\-?\}?|NH_?\{?4\}?\^?\{?\+?\}?|SO_?\{?4\}?\^?\{?2\-?\}?|NO_?\{?3\}?\^?\{?\-?\}?|OH\^?\{?\-?\}?|H\^?\{?\+?\}?|Fe\^?\{?3\+?\}?|Fe\^?\{?2\+?\}?|Cu\^?\{?2\+?\}?|Al\^?\{?3\+?\}?)(?=[\s\.,;\?\!\)\]\}<]|$)/g, (m, lead, ion) => {
            if (ion.includes('@@@FORMULA_PH_')) return m;
            let cleanIon = ion
                .replace(/CO_?\{?3\}?\^?\{?2\-?\}?/i, '\\text{CO}_3^{2-}')
                .replace(/NH_?\{?4\}?\^?\{?\+?\}?/i, '\\text{NH}_4^+')
                .replace(/SO_?\{?4\}?\^?\{?2\-?\}?/i, '\\text{SO}_4^{2-}')
                .replace(/NO_?\{?3\}?\^?\{?\-?\}?/i, '\\text{NO}_3^-')
                .replace(/OH\^?\{?\-?\}?/i, '\\text{OH}^-')
                .replace(/H\^?\{?\+?\}?/i, '\\text{H}^+')
                .replace(/Fe\^?\{?3\+?\}?/i, '\\text{Fe}^{3+}')
                .replace(/Fe\^?\{?2\+?\}?/i, '\\text{Fe}^{2+}')
                .replace(/Cu\^?\{?2\+?\}?/i, '\\text{Cu}^{2+}')
                .replace(/Al\^?\{?3\+?\}?/i, '\\text{Al}^{3+}');
            return lead + addPH(`$${cleanIon}$`);
        });

        // 9. Ký hiệu nồng độ ion dạng [H+], [OH-], [CH4], [H2], [C]
        s = s.replace(/\[\s*([A-Z][a-z]?\d*[\+\-]?)\s*\]/g, (m, inner) => {
            if (m.includes('@@@FORMULA_PH_')) return m;
            let chem = inner.replace(/([A-Z][a-z]?)(\d+)/g, '\\text{$1}_$2');
            chem = chem.replace(/\+$/, '^+').replace(/\-$/, '^-');
            return addPH(`$[${chem}]$`);
        });

        // 10. Ký hiệu pH đứng độc lập
        s = s.replace(/\bpH\b/g, () => addPH('$\\text{pH}$'));

        // 11. Các acid, base, muối thông dụng (Câu 2): HCl, NaOH, HI, KOH, NaCl
        s = s.replace(/(^|[\s\(\[\{>\*])(HCl|NaOH|HI|KOH|NaCl)(?=[\s\.,;\?\!\)\]\}<]|$)/g, (m, lead, compound) => {
            if (compound.includes('@@@FORMULA_PH_')) return m;
            return lead + addPH(`$\\text{${compound}}$`);
        });

        // 12. Công thức có chứa _{...} hoặc ^{...} chưa được bọc KaTeX (VD: H_{2}SO_{4}, [H^{+}], K_{C}, x^{2}, 2H_{2}(g))
        s = s.replace(/(^|[\s\(\[\{>\*])([A-Za-z0-9_\{\}\^\+\-\/]+(?:\([a-zA-Z0-9]+\))?)(?=[\s\.,;\?\!\)\]\}<]|$)/g, (fullMatch, lead, token) => {
            if (token.includes('@@@FORMULA_PH_')) return fullMatch;
            if (token.includes('_{') || token.includes('^{')) {
                const openCount = (token.match(/\{/g) || []).length;
                const closeCount = (token.match(/\}/g) || []).length;
                if (openCount === closeCount && openCount > 0) {
                    return lead + addPH(`$${token}$`);
                }
            }
            return fullMatch;
        });

        // 13. Công thức hóa học thông dụng có chữ hoa + chữ số (VD: H2SO4, CH4, CO2, H2O, CaCO3, Fe2O3, KMnO4)
        s = s.replace(/\b([A-Z][a-z]?\d+[A-Za-z0-9\(\)]*)\b/g, (match) => {
            if (/^(COVID|MP|WIN|F|L|A|B|C|D)\d+$/i.test(match)) return match;
            if (match.includes('@@@FORMULA_PH_')) return match;
            const chem = match.replace(/([A-Z][a-z]?)(\d+)/g, '\\text{$1}_$2');
            return addPH(`$${chem}$`);
        });

        // 13b. Quét cuối: cụm còn sót có _{...} hoặc ^{...} (VD: 1/2O_{2}(g), x^{2}+1) chưa nằm trong $...$
        s = s.replace(/[^\s@$]*[_^]\{[^{}]*\}[^\s@$]*/g, (m) => {
            if (m.includes('@@@FORMULA_PH_')) return m;
            const tail = (m.match(/[\.,;:!\?]+$/) || [''])[0];
            const core = tail ? m.slice(0, m.length - tail.length) : m;
            if (!core) return m;
            return addPH(`$${core}$`) + tail;
        });

        // 14. Các ký tự toán học/hóa học Unicode đứng riêng lẻ
        s = s.replace(/⇌|\u21cc|⇄|\u21c4/g, () => addPH('$\\rightleftharpoons$'));
        s = s.replace(/→|\u2192|⟶|\u27f6/g, () => addPH('$\\rightarrow$'));
        s = s.replace(/←|\u2190|⟵|\u27f5/g, () => addPH('$\\leftarrow$'));
        s = s.replace(/⇒|\u21d2/g, () => addPH('$\\Rightarrow$'));
        s = s.replace(/⇔|\u21d4/g, () => addPH('$\\Leftrightarrow$'));
        s = s.replace(/Δ|\u0394/g, () => addPH('$\\Delta$'));

        // 15. Khôi phục tất cả placeholders theo thứ tự đảo ngược
        for (let i = placeholders.length - 1; i >= 0; i--) {
            const { key, content } = placeholders[i];
            s = s.split(key).join(content);
        }

        return s;
    }

    // Đọc file PDF (.pdf) bằng PDF.js
    async parsePdf(file) {
        if (!window.pdfjsLib) {
            throw new Error('Thư viện PDF.js chưa được tải. Vui lòng kiểm tra kết nối mạng hoặc thử lại.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }

    // Đọc file Text (.txt)
    async parseTxt(file) {
        return await file.text();
    }

    // Bóc tách từ file CSV (Excel CSV)
    parseCsv(csvText, options = {}) {
        if (!csvText || !csvText.trim()) {
            throw new Error('File CSV rỗng.');
        }

        const preferredType = options.questionType || 'tnkq';
        const maxQuestions = options.maxQuestions ? parseInt(options.maxQuestions) : 0;
        const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const parsed = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Bỏ qua dòng tiêu đề nếu có
            if (i === 0 && (line.toLowerCase().includes('câu hỏi') || line.toLowerCase().includes('question'))) {
                continue;
            }

            // Tách bằng dấu phẩy hoặc chấm phẩy
            const delimiter = line.includes(';') ? ';' : ',';
            const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

            if (parts.length >= 2) {
                if (preferredType === 'tuluan' || parts.length === 2) {
                    parsed.push({
                        id: parsed.length + 1,
                        question: parts[0],
                        type: 'tuluan',
                        options: [],
                        answer: parts[1] || '1',
                        explanation: ''
                    });
                } else if (parts.length >= 6) {
                    // Cột: Câu hỏi, A, B, C, D, Đáp án
                    parsed.push({
                        id: parsed.length + 1,
                        question: parts[0],
                        type: 'tnkq',
                        options: [
                            `A. ${parts[1]}`,
                            `B. ${parts[2]}`,
                            `C. ${parts[3]}`,
                            `D. ${parts[4]}`
                        ],
                        answer: (parts[5] || 'A').toUpperCase().replace(/[^A-D]/g, '') || 'A',
                        explanation: ''
                    });
                }
            }
        }

        let result = parsed;
        if (maxQuestions > 0 && result.length > maxQuestions) {
            result = result.slice(0, maxQuestions);
        }
        return result.map((q, idx) => ({ ...q, id: idx + 1 }));
    }

    // Bộ phân tích cú pháp biểu thức chính quy (Regex Smart Extractor)
    parseQuestionsFromText(rawText, options = {}) {
        if (!rawText || !rawText.trim()) {
            throw new Error('File rỗng hoặc không có nội dung văn bản.');
        }

        const preferredType = options.questionType || 'tnkq';
        const maxQuestions = options.maxQuestions ? parseInt(options.maxQuestions) : 0;

        // Chuẩn hóa văn bản: gộp khoảng trắng thừa, chuẩn hóa ngắt dòng
        const cleanText = rawText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/[\t\f]/g, ' ');

        // Tìm bảng đáp án ở cuối văn bản nếu có (VD: "BẢNG ĐÁP ÁN: 1.A 2.B 3.C" hoặc "Đáp án: 1-A, 2-B")
        const answerKeyMap = this.extractAnswerKeyTable(cleanText);

        // Tách các câu hỏi theo tiêu đề câu (hỗ trợ cả Markdown: ### Câu 1., **Câu 1.**, Bài 1:, [Câu] 1.)
        const namedQRegex = /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Câu|Bài|Question|\[Câu\])\s*(\d+)\s*[\.:\)\-–](?:\*{1,2})?/gi;
        const namedMatches = [...cleanText.matchAll(namedQRegex)];
        let rawEntries = [];

        if (namedMatches.length >= 1) {
            for (let i = 0; i < namedMatches.length; i++) {
                const start = namedMatches[i].index;
                const end = (i + 1 < namedMatches.length) ? namedMatches[i + 1].index : cleanText.length;
                const qNum = parseInt(namedMatches[i][1], 10);
                const fullBlock = cleanText.slice(start, end).trim();
                const qBody = fullBlock.replace(/^\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Câu|Bài|Question|\[Câu\])\s*\d+\s*[\.:\)\-–](?:\*{1,2})?\s*/i, '').trim();
                rawEntries.push({ qNum, qBody });
            }
        } else {
            const numQRegex = /(?:^|\n)\s*(\d+)\s*[\.:\)]/g;
            const numMatches = [...cleanText.matchAll(numQRegex)];
            for (let i = 0; i < numMatches.length; i++) {
                const start = numMatches[i].index;
                const end = (i + 1 < numMatches.length) ? numMatches[i + 1].index : cleanText.length;
                const qNum = parseInt(numMatches[i][1], 10);
                const fullBlock = cleanText.slice(start, end).trim();
                const qBody = fullBlock.replace(/^\s*\d+\s*[\.:\)]\s*/, '').trim();
                rawEntries.push({ qNum, qBody });
            }
        }

        // Nếu AI tự sửa đề ngay sau đó với cùng số thứ tự Câu N liên tiếp, giữ bản mới nhất
        const dedupedEntries = [];
        for (let i = 0; i < rawEntries.length; i++) {
            if (i + 1 < rawEntries.length && rawEntries[i].qNum === rawEntries[i + 1].qNum) {
                continue;
            }
            dedupedEntries.push(rawEntries[i]);
        }

        const parsedQuestions = [];

        for (const entry of dedupedEntries) {
            const { qNum, qBody } = entry;
            if (!qBody) continue;

            if (preferredType === 'tuluan') {
                // Ưu tiên bóc tách dạng Tự luận
                const tuluanResult = this.extractTuLuanQuestion(qBody, qNum, answerKeyMap);
                if (tuluanResult) {
                    parsedQuestions.push(tuluanResult);
                    continue;
                }
            } else {
                // Ưu tiên bóc tách TNKQ (4 phương án A, B, C, D)
                const tnkqResult = this.extractTNKQQuestion(qBody, qNum, answerKeyMap);
                if (tnkqResult) {
                    parsedQuestions.push(tnkqResult);
                    continue;
                }
                // Nếu không bóc tách được TNKQ thì thử tự luận
                const tuluanResult = this.extractTuLuanQuestion(qBody, qNum, answerKeyMap);
                if (tuluanResult) {
                    parsedQuestions.push(tuluanResult);
                    continue;
                }
            }
        }

        let finalQuestions = parsedQuestions;

        if (finalQuestions.length === 0) {
            // Nếu không tách được theo cấu trúc Câu 1, 2, thử phân tích theo từng dòng
            const fallbackList = this.extractFallbackLines(cleanText);
            if (fallbackList.length > 0) {
                finalQuestions = fallbackList;
            } else {
                throw new Error('Không nhận diện được câu hỏi trong file. Vui lòng đảm bảo các câu hỏi có dạng:\n"Câu 1: ...\nA. ...\nB. ...\nC. ...\nD. ...\nĐáp án: A"');
            }
        }

        // Lọc đúng số lượng câu hỏi mà Giáo viên đã chọn (nếu có giới hạn)
        if (maxQuestions > 0 && finalQuestions.length > maxQuestions) {
            finalQuestions = finalQuestions.slice(0, maxQuestions);
        }

        // Đánh lại ID tuần tự và kiểm tra cảnh báo chẩn đoán (Section 6)
        const warnings = [];
        finalQuestions.forEach((q, idx) => {
            if (q.type === 'tnkq') {
                if (!q.options || q.options.length < 4) {
                    warnings.push(`Câu ${idx + 1}: Chỉ tìm thấy ${q.options ? q.options.length : 0}/4 phương án.`);
                }
                (q.options || []).forEach((opt, oIdx) => {
                    const letter = ['A', 'B', 'C', 'D'][oIdx];
                    const clean = opt.replace(/^[A-D][\.\)\:\-]\s*/i, '').trim();
                    if (!clean || clean === '.') {
                        warnings.push(`Câu ${idx + 1}, Đáp án ${letter}: Phương án rỗng hoặc thiếu nội dung.`);
                    }
                    if (opt.includes('⚠️') || opt.includes('không thể đọc')) {
                        warnings.push(`Câu ${idx + 1}, Đáp án ${letter}: Đối tượng OLE/WMF không thể giải mã, vui lòng sửa thủ công.`);
                    }
                });
            }
            if (q.question && (q.question.includes('⚠️') || q.question.includes('không thể đọc'))) {
                warnings.push(`Câu ${idx + 1}: Tiêu đề có đối tượng công thức không thể giải mã, vui lòng sửa thủ công.`);
            }
            if (!q.question || q.question.trim().length < 3) {
                warnings.push(`Câu ${idx + 1}: Tiêu đề câu hỏi quá ngắn.`);
            }
        });

        const reindexed = finalQuestions.map((q, idx) => ({
            ...q,
            id: idx + 1
        }));
        reindexed.warnings = warnings;
        return reindexed;
    }

    // Thiết kế cấu trúc dữ liệu đa khối (Section 5 Requirement): text, latex, chemical, image, table
    parseRichContentSegments(content) {
        if (!content) return [];
        const segments = [];
        const tokenRegex = /(<div class="doc-table-wrap">[\s\S]*?<\/div>|<table[\s\S]*?<\/table>|<img\s+[^>]+>|\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\s*\\ce\{[^\}]+\})/gi;

        let lastIdx = 0;
        let match;
        while ((match = tokenRegex.exec(content)) !== null) {
            if (match.index > lastIdx) {
                const textPart = content.substring(lastIdx, match.index);
                if (textPart.trim()) {
                    segments.push({ type: 'text', content: textPart });
                }
            }
            const token = match[0];
            if (token.startsWith('<div class="doc-table-wrap"') || token.startsWith('<table')) {
                segments.push({ type: 'table', content: token });
            } else if (token.startsWith('<img')) {
                const srcMatch = token.match(/src=["']([^"']+)["']/i);
                segments.push({ type: 'image', content: srcMatch ? srcMatch[1] : '', rawHtml: token });
            } else if (token.includes('\\ce{')) {
                segments.push({ type: 'chemical', content: token });
            } else if (token.startsWith('$') || token.startsWith('\\[') || token.startsWith('\\(')) {
                if (/\\text\{[A-Z][a-z]?\}|\\rightleftharpoons|\\ce|pH|H_2SO_4|HCl|NaOH|HI|\^[\+\-]|\d[\+\-]/.test(token)) {
                    segments.push({ type: 'chemical', content: token });
                } else {
                    segments.push({ type: 'latex', content: token });
                }
            }
            lastIdx = match.index + token.length;
        }
        if (lastIdx < content.length) {
            const tail = content.substring(lastIdx);
            if (tail.trim()) {
                segments.push({ type: 'text', content: tail });
            }
        }
        return segments;
    }

    // Mask các vùng công thức Toán $...$, $$...$$, \(...\), \[...\] để không bị regex tách phương án A. B. C. D. cắt nhầm
    maskMathRegions(str) {
        return (str || '').replace(/\$\$[\s\S]*?\$\$|\$[^\$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g, (m) => '#'.repeat(m.length));
    }

    // Suy luận đáp án đúng từ Lời giải hoặc Bảng đáp án (hỗ trợ cả AI text & đối chiếu nội dung)
    inferAnswerFromExplanation(questionTitle, explanation, options, qNum, answerKeyMap) {
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
            const p1 = /(?:Chọn(?:\s*đáp\s*án)?|Đáp\s*án\s*(?:đúng)?\s*(?:phải\s*)?(?:là)?|Đ\/A|Key|Answer)\s*[\.:\-–=]*\s*\*{0,2}\s*([A-D])\b/gi;
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

        const explicitFromStem = extractExplicitLetter(questionTitle);
        if (explicitFromStem) return explicitFromStem;

        if (answerKeyMap && answerKeyMap[qNum]) {
            return answerKeyMap[qNum];
        }

        if (expNoParens && Array.isArray(options) && options.length > 0) {
            const sentences = expNoParens
                .split(/[\n\.\;]+/)
                .map(s => s.trim())
                .filter(Boolean);
            const lastSentence = sentences.length > 0 ? sentences[sentences.length - 1] : expNoParens;
            const nLast = normExpr(lastSentence);
            const nExp = normExpr(expNoParens);

            let bestLetter = '';
            let bestScore = 0;
            let isTie = false;

            for (const opt of options) {
                const optMatch = (opt || '').match(/^([A-D])[\.\)\:\-]\s*([\s\S]*)$/i);
                if (!optMatch) continue;
                const letter = optMatch[1].toUpperCase();
                const body = optMatch[2].trim();
                if (!body || /^Phương án (?:khác|[A-D])$/i.test(body)) continue;

                const nOpt = normExpr(body);
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
                    bestLetter = letter;
                    isTie = false;
                } else if (score > 0 && score === bestScore) {
                    isTie = true;
                }
            }

            if (bestLetter && !isTie) return bestLetter;
        }

        return 'A';
    }

    // Bóc tách câu hỏi Trắc nghiệm khách quan (A, B, C, D)
    extractTNKQQuestion(qBody, qNum, answerKeyMap) {
        // 1. Tách phần Lời giải / Hướng dẫn giải TRƯỚC KHI tách phương án A, B, C, D
        let explanation = '';
        let bodyNoExpl = qBody;
        const expMatch = qBody.match(/(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*{1,2})?\s*(?:Lời\s*giải|Hướng\s*dẫn\s*giải|Hướng\s*dẫn|Giải\s*thích|HDG|HD)\s*(?:\*{1,2})?\s*[\.:\-–]*\s*(?:\*{1,2})?\s*([\s\S]*)$/i);
        if (expMatch) {
            explanation = expMatch[1].trim();
            bodyNoExpl = qBody.slice(0, expMatch.index).trim();
        }

        // 2. Mask công thức Toán để không cắt nhầm A., B., C., D. bên trong $...$
        const maskedBody = this.maskMathRegions(bodyNoExpl);

        // Tìm vị trí bắt đầu phương án A (hỗ trợ A., *A., **A.**, - **A.**, [x] A., A), A:)
        const optMatchA = maskedBody.match(/(?:^|\n|\s|>)\s*(?:-\s+|•\s+)?(?:(?:\*{1,2}|\[x\])\s*)?[AＡ][\.\)\:\-](?:\*{1,2})?\s*/i);
        if (!optMatchA) return null;

        // Nếu match bắt đầu bằng dấu '>' của thẻ HTML đóng (như <img> hoặc </table>), giữ nguyên '>' thuộc về tiêu đề câu hỏi
        let splitIdx = optMatchA.index;
        if (bodyNoExpl[splitIdx] === '>') {
            splitIdx += 1;
        }

        const questionTitle = bodyNoExpl.substring(0, splitIdx).trim();
        
        let actualStart = splitIdx;
        while (actualStart < bodyNoExpl.length && [' ', '\n', '\r', '\t'].includes(bodyNoExpl[actualStart])) {
            actualStart++;
        }
        const optionsPart = bodyNoExpl.substring(actualStart).trim();
        const maskedOptionsPart = maskedBody.substring(actualStart).trim();

        // Tìm tất cả các mốc phương án A, B, C, D trong maskedOptionsPart (ngoài vùng $...$)
        const markerRegex = /(?:^|[\s\n>][\.\;\,\:\s]*)((?:-\s+|•\s+)?(?:(?:\*{1,2}|\[x\])\s*)?([A-DＡ-Ｄ])[\.\)\:\-](?:\*{1,2})?\s*)/gi;
        const markers = [];
        let m;
        while ((m = markerRegex.exec(maskedOptionsPart)) !== null) {
            const fullMatch = m[0];
            const markerPrefix = m[1];
            const letter = m[2].toUpperCase().replace('Ａ', 'A').replace('Ｂ', 'B').replace('Ｃ', 'C').replace('Ｄ', 'D');
            const startIndex = m.index + (fullMatch.length - markerPrefix.length);
            const expected = markers.length === 0 ? 'A' : String.fromCharCode(markers[markers.length - 1].letter.charCodeAt(0) + 1);
            if (((markers.length === 0 && letter === 'A') || (markers.length > 0 && (letter === expected || letter > markers[markers.length - 1].letter))) && !markers.some(item => item.index === startIndex)) {
                markers.push({
                    index: startIndex,
                    letter,
                    raw: optionsPart.substring(startIndex, startIndex + markerPrefix.length)
                });
            }
        }

        let optTokens = [];
        if (markers.length >= 2) {
            for (let i = 0; i < markers.length; i++) {
                const start = markers[i].index;
                const end = (i + 1 < markers.length) ? markers[i + 1].index : optionsPart.length;
                let chunk = optionsPart.substring(start, end).trim();
                // Bỏ các dấu câu dư thừa ở đầu chunk do mốc trước để lại
                chunk = chunk.replace(/^[\.\,\;\:\s]+/, '').trim();
                if (chunk) optTokens.push(chunk);
            }
        } else {
            // Dự phòng nếu không tìm đủ mốc: tách bằng regex split
            try {
                const lookbehindRegex = new RegExp('(?<=[\\s\\n>][\\.\\;\\,\\:\\s]*)\\s*(?=[\\*\\[x\\]\\-]*\\s*[A-DＡ-Ｄ][\\.\\)\\:\\-]\\s*)', 'i');
                optTokens = optionsPart.split(lookbehindRegex).filter(t => t.trim().length > 0);
            } catch (e) {
                const fallbackRegex = /(?:^|\n|\s|>)\s*(?=[\*\[x\]\-]*\s*[A-DＡ-Ｄ][\.\)\:\-]\s*)/i;
                optTokens = optionsPart.split(fallbackRegex).filter(t => t.trim().length > 0);
            }
        }

        if (optTokens.length < 2) return null; // Ít nhất phải có 2 lựa chọn

        const options = [];
        let correctAnswer = '';

        for (let token of optTokens) {
            token = token.trim();
            // Lọc ra đáp án đúng nếu có ghi chú "Đáp án: A" ở cuối token
            const ansMatch = token.match(/(?:Đáp\s*án|Đ\/A|ĐA|Key|Answer)\s*[\:\=]?\s*([A-D])/i);
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
                token = token.replace(/(?:Đáp\s*án|Đ\/A|ĐA|Key|Answer)\s*[\:\=]?\s*[A-D]/i, '').trim();
            }

            // Kiểm tra dấu sao đơn (*) hoặc [x] đánh dấu đáp án đúng (không nhầm ** Markdown bold)
            if (/^\*(?!\*)/.test(token) || token.startsWith('[x]')) {
                const letterMatch = token.match(/^[\*\[x\]\s\-]*([A-D])/i);
                if (letterMatch) correctAnswer = letterMatch[1].toUpperCase();
                token = token.replace(/^[\*\[x\]\s\-]+/, '');
            } else if (/^(?:-\s+|•\s+)?\*{2}\s*[A-D]/i.test(token)) {
                token = token.replace(/^(?:-\s+|•\s+)?\*{1,2}\s*/, '');
            } else if (/^(?:-\s+|•\s+)/.test(token)) {
                token = token.replace(/^(?:-\s+|•\s+)/, '');
            }

            // Chuẩn hóa định dạng "A. Nội dung"
            const optLetterMatch = token.match(/^([A-DＡ-Ｄ])[\.\)\:\-]\s*(?:\*{1,2})?\s*([\s\S]*)/i);
            if (optLetterMatch) {
                const letter = optLetterMatch[1].toUpperCase().replace('Ａ', 'A').replace('Ｂ', 'B').replace('Ｃ', 'C').replace('Ｄ', 'D');
                let optText = optLetterMatch[2].trim();
                // Bỏ ** Markdown bold hoặc dấu chấm, hai chấm dư thừa ở đầu phương án, nhưng KHÔNG xóa dấu âm (-) của số âm như -5, -2.5
                optText = optText.replace(/^\*{1,2}\s*/, '').replace(/\s*\*{1,2}$/, '').trim();
                optText = optText.replace(/^[\.\:\)\s]+/, '').replace(/^-(?!\d)/, '').trim();
                // Bỏ dấu chấm câu ở cuối nếu đứng ngoài công thức để nút bấm hiển thị gọn đẹp
                if (optText.endsWith('.') && !optText.endsWith('..')) {
                    if (optText.endsWith('$.')) {
                        optText = optText.slice(0, -2) + '$';
                    } else if (!optText.endsWith('}$')) {
                        optText = optText.slice(0, -1).trim();
                    }
                }
                const formattedOpt = this.autoFormatChemistry(optText);
                options.push(`${letter}. ${formattedOpt}`);
            } else {
                let cleanToken = token.replace(/^\*{1,2}\s*/, '').replace(/\s*\*{1,2}$/, '').replace(/^[\.\:\)\s]+/, '').replace(/^-(?!\d)/, '').trim();
                options.push(this.autoFormatChemistry(cleanToken));
            }
        }

        // Nếu bảng đáp án cuối đề có câu này, ưu tiên lấy từ bảng đáp án
        if (answerKeyMap[qNum]) {
            correctAnswer = answerKeyMap[qNum];
        }

        // Đảm bảo đủ 4 phương án (nếu thiếu thì bổ sung lựa chọn giả định)
        while (options.length < 4) {
            const nextLetter = String.fromCharCode(65 + options.length);
            options.push(`${nextLetter}. Phương án khác`);
        }

        const finalOptions = options.slice(0, 4);
        if (!correctAnswer) {
            correctAnswer = this.inferAnswerFromExplanation(questionTitle, explanation, finalOptions, qNum, answerKeyMap);
        }

        const formattedQuestion = this.autoFormatChemistry(questionTitle || `Câu hỏi số ${qNum}`);

        return {
            id: qNum,
            question: formattedQuestion,
            questionSegments: this.parseRichContentSegments(formattedQuestion),
            type: 'tnkq',
            options: finalOptions,
            optionSegments: finalOptions.map(opt => this.parseRichContentSegments(opt.replace(/^[A-D][\.\)\:\-]\s*/i, ''))),
            answer: correctAnswer,
            explanation: explanation ? this.autoFormatChemistry(explanation) : ''
        };
    }

    // Bóc tách câu hỏi Tự luận / Điền số
    extractTuLuanQuestion(qBody, qNum, answerKeyMap) {
        let questionTitle = qBody;
        let correctAnswer = '1';

        const ansMatch = qBody.match(/(?:Đáp\s*án|Đ\/A|ĐA|Key|Answer)\s*[\:\=]?\s*([^\n\r]+)/i);
        if (ansMatch) {
            correctAnswer = ansMatch[1].trim();
            questionTitle = qBody.replace(/(?:Đáp\s*án|Đ\/A|ĐA|Key|Answer)\s*[\:\=]?\s*[^\n\r]+/i, '').trim();
        } else if (answerKeyMap[qNum]) {
            correctAnswer = answerKeyMap[qNum];
        }

        const formattedQuestion = this.autoFormatChemistry(questionTitle || `Câu hỏi số ${qNum}`);

        return {
            id: qNum,
            question: formattedQuestion,
            questionSegments: this.parseRichContentSegments(formattedQuestion),
            type: 'tuluan',
            options: [],
            optionSegments: [],
            answer: correctAnswer,
            explanation: ''
        };
    }

    // Bóc tách bảng đáp án ở cuối văn bản (VD: "1.A 2.B 3.C" hoặc "1-A, 2-B, 3-C")
    extractAnswerKeyTable(text) {
        const keyMap = {};
        const tableMatch = text.match(/(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*CHI\s*TIẾT|ANSWER\s*KEY)[\s\S]+/i);
        if (tableMatch) {
            const tableText = tableMatch[0];
            const pairMatches = tableText.matchAll(/([0-9]+)\s*[\.\:\-\/]?\s*([A-D])/gi);
            for (const match of pairMatches) {
                keyMap[parseInt(match[1])] = match[2].toUpperCase();
            }
        }
        return keyMap;
    }

    // Dự phòng tách từng dòng ngắn
    extractFallbackLines(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        const results = [];
        let currentQ = null;

        for (let line of lines) {
            if (/^[0-9]+[\.\:]/.test(line) || /^Câu/i.test(line)) {
                if (currentQ) results.push(currentQ);
                currentQ = {
                    id: results.length + 1,
                    question: line.replace(/^[0-9]+[\.\:]\s*|^Câu\s*[0-9]+[\.\:]\s*/i, ''),
                    type: 'tnkq',
                    options: [],
                    answer: 'A',
                    explanation: ''
                };
            } else if (currentQ && /^[A-D][\.\)]/i.test(line)) {
                currentQ.options.push(line);
            }
        }
        if (currentQ) results.push(currentQ);

        // Chuẩn hóa
        return results.map((q, idx) => ({
            ...q,
            id: idx + 1,
            options: q.options.length >= 2 ? q.options : ['A. Đúng', 'B. Sai', 'C. Không chắc', 'D. Khác'],
            answer: 'A'
        }));
    }

    // Tải file đề mẫu để Giáo viên tham khảo cấu trúc
    downloadSampleFile(type = 'tnkq') {
        let content = '';
        let filename = '';

        if (type === 'tuluan') {
            filename = 'de_thi_tu_luan_mau.txt';
            content = `ĐỀ THI TỰ LUẬN MẪU - TRÒ CHƠI NHẢY BAO BỐ

Câu 1: Kết quả của phép tính 125 x 8 là bao nhiêu?
Đáp án: 1000

Câu 2: Số nguyên tố chẵn duy nhất là số mấy?
Đáp án: 2

Câu 3: Đỉnh núi Fansipan có độ cao bao nhiêu mét so với mực nước biển?
Đáp án: 3143

Câu 4: Nước sôi ở bao nhiêu độ C ở áp suất tiêu chuẩn?
Đáp án: 100

Câu 5: 1 thế kỷ bằng bao nhiêu năm?
Đáp án: 100

Câu 6: Năm 1945 thuộc thế kỷ thứ mấy?
Đáp án: 20

Câu 7: Có bao nhiêu cạnh trong một hình lập phương?
Đáp án: 12

Câu 8: Tổng số góc trong một tam giác bằng bao nhiêu độ?
Đáp án: 180

Câu 9: Bán kính Trái Đất xấp xỉ bao nhiêu nghìn km (làm tròn số nguyên)?
Đáp án: 6371

Câu 10: 1 năm thường có bao nhiêu ngày?
Đáp án: 365
`;
        } else {
            filename = 'de_thi_trac_nghiem_mau.txt';
            content = `ĐỀ THI TRẮC NGHIỆM MẪU (HỖ TRỢ TOÁN, HÓA, LATEX & MATHTYPE) - TRÒ CHƠI NHẢY BAO BỐ

Câu 1: Hằng số cân bằng Kc của phản ứng chỉ phụ thuộc vào yếu tố nào sau đây?
A. Nồng độ
B. Áp suất
C. Nhiệt độ
D. Chất xúc tác
Đáp án: C

Câu 2: Trong các dung dịch acid sau có cùng nồng độ 0,1 M, dung dịch nào có pH nhỏ nhất?
A. H2SO4
B. HCl
C. NaOH
D. HI
Đáp án: A

Câu 3: Công thức tính pH là
A. pH = - log [H+]
B. pH = log [H+]
C. pH = +10 log [H+]
D. pH = - log [OH-]
Đáp án: A

Câu 4: Các yếu tố ảnh hưởng đến cân bằng hóa học là
A. nồng độ, nhiệt độ và chất xúc tác.
B. nồng độ, áp suất và diện tích bề mặt.
C. nồng độ, nhiệt độ và áp suất.
D. áp suất, nhiệt độ và chất xúc tác.
Đáp án: C

Câu 5: Biểu thức nào sau đây là biểu thức hằng số cân bằng (Kc) của phản ứng: C(s) + 2H2(g) ⇌ CH4(g) ?
A. $K_c = \\frac{[\\text{CH}_4]}{[\\text{H}_2]}$
B. $K_c = \\frac{[\\text{CH}_4]}{[\\text{C}][\\text{H}_2]^2}$
C. $K_c = \\frac{[\\text{CH}_4]}{[\\text{C}][\\text{H}_2]}$
D. $K_c = \\frac{[\\text{CH}_4]}{[\\text{H}_2]^2}$
Đáp án: D

Câu 6: Cho phản ứng: $2\\text{NO}(g) + \\text{O}_2(g) \\rightleftharpoons 2\\text{NO}_2(g)$, $\\Delta_r H^0_{298} = -115\\text{ kJ}$. Nhận xét nào sau đây sai?
A. Phản ứng tỏa nhiệt
B. Phản ứng thu nhiệt
C. Cân bằng chuyển dịch khi thay đổi nhiệt độ
D. Áp suất ảnh hưởng đến cân bằng
Đáp án: B

Câu 7: Nghiệm của phương trình bậc hai $x^2 - 5x + 6 = 0$ là gì?
A. $x = 2$ hoặc $x = 3$
B. $x = 1$ hoặc $x = 6$
C. $x = -2$ hoặc $x = -3$
D. $x = -1$ hoặc $x = -6$
Đáp án: A

Câu 8: Giá trị của tích phân $\\int_{0}^{1} (3x^2 + 2x) dx$ bằng bao nhiêu?
A. 2
B. 3
C. 1
D. 5
Đáp án: A

Câu 9: Chất nào sau đây là một ester có mùi chuối chín?
A. Isoamyl acetate
B. Ethyl formate
C. Benzyl acetate
D. Ethyl butyrate
Đáp án: A

Câu 10: Thủy phân hoàn toàn tinh bột trong môi trường acid thu được chất nào sau đây?
A. Glucose ($C_6H_{12}O_6$)
B. Fructose ($C_6H_{12}O_6$)
C. Sucrose
D. Maltose
Đáp án: A
`;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Bộ kiểm thử tự động kiểm tra MTEF, hóa học và bóc tách đề thi (Kiểm tra đối chiếu file mẫu MẪU.docx)
    runSelfTest() {
        const testReport = {
            mtefFraction: false,
            chemHcl: false,
            chemPH: false,
            chemEnthalpy: false,
            chemIons: false,
            cau2Extracted: false,
            cau5Extracted: false
        };

        try {
            // 1. Kiểm tra MTEF Parser (Template phân số tmFRACT = 1)
            const mtefBytes = [
                3, 1, 0, 5, 0,       // Header MTEF v3
                1, 0,                // LINE (root)
                3, 0, 1, 0, 0,       // TMPL selector=1 (tmFRACT), variation=0
                1, 0, 2, 0, 65, 0,   // LINE num: 'A'
                1, 0, 2, 0, 66, 0,   // LINE den: 'B'
                0,                   // END TMPL
                0                    // END root LINE
            ];
            const parsedLatex = MTEFParser.parse(new Uint8Array(mtefBytes).buffer);
            testReport.mtefFraction = parsedLatex.includes('\\frac{A}{B}');

            // 2. Kiểm tra Câu 2: HCl, NaOH, HI, H2SO4
            const cau2Text = 'Câu 2: Dung dịch nào có pH nhỏ nhất?\nA. H2SO4\nB. HCl\nC. NaOH\nD. HI\nĐáp án: A';
            const parsedCau2 = this.extractTNKQQuestion(cau2Text.replace(/^Câu\s*2\:\s*/i, ''), 2, {});
            if (parsedCau2 && parsedCau2.options && parsedCau2.options.length === 4) {
                const optB = parsedCau2.options[1];
                testReport.cau2Extracted = optB.includes('HCl') && !optB.includes('Phương án khác');
                testReport.chemHcl = optB.includes('$\\text{HCl}$');
            }

            // 3. Kiểm tra Câu 3: pH = - log [H+]
            const cau3Formatted = this.autoFormatChemistry('Công thức tính pH là pH = - log [H+]');
            testReport.chemPH = cau3Formatted.includes('\\text{pH} = -\\log [\\text{H}^+]');

            // 4. Kiểm tra Câu 5: Kc = \frac{[CH4]}{[H2]^2}
            const cau5Text = 'Câu 5: Hằng số cân bằng là:\nA. $K_c = \\frac{[\\text{CH}_4]}{[\\text{H}_2]}$\nB. $K_c = \\frac{[\\text{CH}_4]}{[\\text{H}_2]^2}$\nC. $K_c = 1$\nD. $K_c = 2$\nĐáp án: B';
            const parsedCau5 = this.extractTNKQQuestion(cau5Text.replace(/^Câu\s*5\:\s*/i, ''), 5, {});
            testReport.cau5Extracted = (parsedCau5 && parsedCau5.options && parsedCau5.options[1].includes('\\frac'));

            // 5. Kiểm tra Câu 6: ΔrH0298 = -115 kJ
            const cau6Formatted = this.autoFormatChemistry('Cho phản ứng: 2NO(g) + O2(g) ⇌ 2NO2(g), ΔrH0298 = -115 kJ');
            testReport.chemEnthalpy = cau6Formatted.includes('\\Delta_r H^\\circ_{298} = -115\\text{ kJ}');

            // 6. Kiểm tra Câu 7: CO3^{2-}, NH4^+
            const cau7Formatted = this.autoFormatChemistry('Các ion CO3^{2-} và NH4^+');
            testReport.chemIons = cau7Formatted.includes('\\text{CO}_3^{2-}') && cau7Formatted.includes('\\text{NH}_4^+');

            const allPassed = Object.values(testReport).every(Boolean);
            if (allPassed) {
                console.log('✅ [FileQuestionParser] Toàn bộ 7 bài kiểm thử đối chiếu chuẩn (Câu 2, 3, 5, 6, 7, MTEF) đều đạt 100%!', testReport);
            } else {
                console.warn('⚠️ [FileQuestionParser] Kết quả kiểm thử đối chiếu:', testReport);
            }
        } catch (e) {
            console.warn('Lỗi chạy self-test:', e);
        }

        return testReport;
    }
}

const fileQuestionParser = new FileQuestionParser();
window.fileQuestionParser = fileQuestionParser;
try {
    fileQuestionParser.runSelfTest();
} catch (e) {}

